/************************************************
 * userFaceRegist.js
 * Created at 2018. 10. 16. 오후 1:23:45.
 *
 * @author fois
 ************************************************/

var _Mode;
var comLib;
var _UserID;
var _FaceDatas;
var USFWR_url;
var USFWR_imageMax = 130000;
var oem_version;
var dataManager = cpr.core.Module.require("lib/DataManager");
var util = cpr.core.Module.require("lib/util");
var similarCheck = false;

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();		
	comLib = createComUtil(app.getRootAppInstance());
	var initValue = app.getHost().initValue;
	_FaceDatas = initValue["FaceDatas"];
	_Mode = initValue["Mode"];	
	USFWR_url = initValue["Url"];
	oem_version = dataManager.getOemVersion();
	var udcTerminalList = app.lookup("USFWR_udcTerminalList");	
	udcTerminalList.deleteColumn([13,12,11,10,9,8,7,6,5,4,3]);
	
	var userID = initValue["ID"];
	_UserID = userID;
	if(userID){
		var submission = app.lookup("sms_getUserFaceWT");					
		submission.action = "/v1/users/"+userID+"/faceWTInfo";		
		submission.send();	
	}else{
		sendConnectedTerminalListRequest()
	}
	
	if(oem_version == OEM_ITONE_TRDATA || oem_version == OEM_ITONE_POSCO_DX) {
//		app.lookup("USFWR_btnCapture").visible = false;
//		app.lookup("USFWR_btnComplete").visible = false;
		app.lookup("UFWTR_opb_picture").visible = false;
	} else if (oem_version == OEM_REMOTE_FAW_MANAGEMENT){
//		app.lookup("USFWR_cbxCheckSimilar").enabled = true;
//		app.lookup("USFWR_cbxCheckSimilar").visible = true;
//		app.lookup("USFWR_cbxCheckSimilar").readOnly = false;
	}

}

// 프리뷰 화면 로드시
function onUSFWR_shlCameraPreviewLoad(/* cpr.events.CUIEvent */ e){
	var content = e.content;		
	content.innerHTML = "<video width=\"360px\" height=\"360px\" id=\"cameraPreview\" autoplay></video>";
}

// 캡쳐 화면 로드시 
function onUFAWR_shlCameraCaptureLoad(/* cpr.events.CUIEvent */ e){	
	var content = e.content;
	content.innerHTML = "<canvas width=\"1px\" height=\"1px\" id=\"captureCanvas\"></canvas>";	
	
	if(oem_version == OEM_ITONE_TRDATA || oem_version == OEM_ITONE_POSCO_DX) {
		content.innerHTML = `<div style="font-size:16px"><b><mark>
		&nbsp;&nbsp;&nbsp;<font color="red">캡쳐</font>를 누르면 촬영이 시작됩니다. <font color="red">(유효시간 :2분)</font> <br>
		&nbsp;&nbsp;&nbsp;<span style="font-size:13px">촬영이 성공적으로 완료되면  현재 창은 닫힙니다.</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
		</mark></b></div>`
//		content.innerHTML = "<hr>"
	}
}

// 사용자 walkthrough 데이터 요청 완료
function onSms_getUserFaceWTSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	var account = dataManager.getAccountInfo();
	if (dmResult.getValue("ResultCode") == COMERROR_NONE) {
		var faceWTList = app.lookup("UserFaceWTInfo");
		if (faceWTList.getRowCount() > 0) {
			var faceWTInfo = faceWTList.getRow(0);
			var templateType = faceWTInfo.getValue("TemplateType");
			if (templateType == FaceWTTypeImage) { // 이미지
				var dmUserFaceInfo = app.lookup("dmUserFaceWTInfo");
				dmUserFaceInfo.build(faceWTInfo.getRowData());
				var imgPhoto = app.lookup("USFWR_imgPhoto");
				imgPhoto.putValue('data:image/jpg;base64,' + dmUserFaceInfo.getValue("TemplateData"));
				if (oem_version == OEM_DMCC_NOPICTURE /* && Number(account.getValue("UserID")) != 1000000000000000000 */) {
					// Maste도 안보이도록 수정 if조건에 주석 풀면  => DMCC_ Maste로그인 제외하고 사용자 이미지 안보이도록  _ 등록 시 에는 확인 용도로 최초 보임 
					imgPhoto.src = '../../../theme/images/common/common_black_img_180.png';
				}
				imgPhoto.redraw();
			}
		}
	}
	sendConnectedTerminalListRequest()
}

// 사용자 walkthrough 데이터 요청 에러
function onSms_getUserFaceWTSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR)
}

// 사용자 walkthrough 데이터 요청 타임아웃
function onSms_getUserFaceWTSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 캡쳐 클릭
function onUSFWR_btnCaptureClick(/* cpr.events.CMouseEvent */ e){	
	var tabFolder = app.lookup("USFWR_tabType");
	var itemIndex = tabFolder.getSelectedTabItem().itemIndex;
	if(itemIndex==0){ // terminal
		sendFaceCaptureRequest();
	}else if( itemIndex==1){ // webcam
		onWebCamCapture();
		if (oem_version == OEM_REMOTE_FAW_MANAGEMENT){
			sendFawSimilarCheck();
		}
	}else{ // file
		var imgFile = app.lookup("USFWR_imgFile");
		if( imgFile.value == null ){
			if (oem_version == OEM_REMOTE_FAW_MANAGEMENT){
				// 이전에 저장했던 얼굴 데이터 있는 경우 유사 체크만 진행
				var dmUserFaceInfo = app.lookup("dmUserFaceWTInfo");
				if (dmUserFaceInfo.getValue("TemplateSize") > 0){
					sendFawSimilarCheck();					
				}
			}
			return;
		}
		var imgPhoto = app.lookup("USFWR_imgPhoto");			
		imgPhoto.src = imgFile.src;
		var imgSrc = imgPhoto.value;		
		var imageData = imgSrc.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
		
		var dmUserFaceInfo = app.lookup("dmUserFaceWTInfo");
		dmUserFaceInfo.setValue("TemplateSize", imageData.length);	
		dmUserFaceInfo.setValue("TemplateData", imageData);
		dmUserFaceInfo.setValue("TemplateType", FaceWTTypeImage); // 이미지(jpg)
		
		if (oem_version == OEM_REMOTE_FAW_MANAGEMENT){
			sendFawSimilarCheck();
		}	
	}
}
	
function onWebCamCapture(){
	var video = document.getElementById('cameraPreview');	
	var canvas = document.getElementById("captureCanvas");
	var ctx = canvas.getContext('2d');
	
	ctx.save();
	
	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;
    	
	var canvasMax = canvas.width;
	if( canvasMax < canvas.height ){canvasMax = this.height}
	if( canvasMax > 1024 ){ canvasMax = 1024;}	  
	
	while( true ){
		
		canvas.width = canvasMax;
		canvas.height = canvasMax;
		
		var hRatio = canvas.width / video.videoWidth;
		var vRatio = canvas.height / video.videoHeight;
		var ratio  = Math.min ( hRatio, vRatio );
		var centerShift_x = ( canvas.width - video.videoWidth*ratio ) / 2;
	   	var centerShift_y = ( canvas.height - video.videoHeight*ratio ) / 2;
		
		ctx.drawImage(video, 0,0, video.videoWidth, video.videoHeight,
			centerShift_x,centerShift_y,video.videoWidth*ratio, video.videoHeight*ratio);
		
		//ctx.drawImage(video, 0,0, canvas.width, canvas.height);
		
		var imageSrc = canvas.toDataURL("image/jpeg");
		var imageData = imageSrc.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
			canvas.width = 0;
			canvas.height = 0;
			
			ctx.clearRect(0, 0, video.width, video.height);
			ctx.beginPath();
				
			ctx.restore();
			
		if(imageData.length < USFWR_imageMax ){	
			
			
			
			var dmUserFaceInfo = app.lookup("dmUserFaceWTInfo");
			dmUserFaceInfo.setValue("TemplateSize", imageData.length);	
		    dmUserFaceInfo.setValue("TemplateData", imageData);
		    dmUserFaceInfo.setValue("TemplateType", FaceWTTypeImage); // 이미지(jpg)
		    
		    var imgPhoto = app.lookup("USFWR_imgPhoto");			
			imgPhoto.src = imageSrc;			
			imgPhoto.redraw();
		
			break;
		}
		
		canvasMax -= 100;
	}
}

// 파일 등록 클릭
function onUSFWR_btnFileSelectClick(/* cpr.events.CMouseEvent */ e){
	var uS_INB_btnPictureFileSelect = e.control;
	var pictureFile = app.lookup("USFWR_ImageFileInput");	
	pictureFile.openFileChooser();
}

var orientation;
function processImage(canvas, srcImage, maxSize){
					
	var ctx = canvas.getContext("2d");
	ctx.save();
    	
	var hRatio = canvas.width / srcImage.width;
	var vRatio = canvas.height / srcImage.height;
	var ratio  = Math.min ( hRatio, vRatio );
	var centerShift_x = ( canvas.width - srcImage.width*ratio ) / 2;
   	var centerShift_y = ( canvas.height - srcImage.height*ratio ) / 2;
	 
	orientation = 0;				  		
   	switch(orientation){
		case 2:          // horizontal flip				            
	        ctx.translate(canvas.width, 0);
	        ctx.scale(-1, 1);
	        break;
	    case 3:
	        // 180° rotate left				            
	        ctx.translate(canvas.width, canvas.height);
	        ctx.rotate(Math.PI);
	        break;
	    case 4:
	        // vertical flip
	        ctx.translate(0, canvas.height);
	        ctx.scale(1, -1);
	        break;
	    case 5:
	        // vertical flip + 90 rotate right
	        ctx.rotate(0.5 * Math.PI);
	        ctx.scale(1, -1);
	        break;
	    case 6:
	        // 90° rotate right				            
	        ctx.rotate(0.5 * Math.PI);
	        ctx.translate(0, -canvas.height);  
	        break;
	    case 7:
	        // horizontal flip + 90 rotate right
	        ctx.rotate(0.5 * Math.PI);
	        ctx.translate(canvas.width, -canvas.height);
	        ctx.scale(-1, 1);
	        break;
	    case 8:
	        // 90° rotate left
            ctx.rotate(-0.5 * Math.PI);
            ctx.translate(-canvas.width, 0);
            break;
   	}				    
				    
	ctx.drawImage(srcImage, 0,0, srcImage.width, srcImage.height,
		centerShift_x,centerShift_y,srcImage.width*ratio, srcImage.height*ratio);	    	
	
	    	
	var imageSrc = canvas.toDataURL("image/jpeg");
	var imageData = imageSrc.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");	
	
	canvas.width = 0;
	canvas.height = 0;
	
	ctx.clearRect(0, 0, srcImage.width, srcImage.height);
	ctx.beginPath();
		
	ctx.restore();
	
//	console.log(imageData.length);
	if(imageData.length >= maxSize ){		
		return false
	}
	
//	console.log("maxSize : "+ maxSize);
	
	var dmUserFaceInfo = app.lookup("dmUserFaceWTInfo");	
	dmUserFaceInfo.setValue("TemplateData", imageData);
	dmUserFaceInfo.setValue("TemplateType", FaceWTTypeImage); // 이미지(jpg)
	
	var dmUserPicture = app.lookup("dmUserPicture");
	dmUserPicture.setValue("TemplateData", imageData);
	dmUserPicture.setValue("TemplateType", FaceWTTypeImage);
		
	var imgPhoto = app.lookup("USFWR_imgFile");			
	imgPhoto.src = imageSrc;			
	imgPhoto.redraw();
		
	return true;
}

// 사용자가 파일 선택시
function onUSFWR_ImageFileInputValueChange(/* cpr.events.CValueChangeEvent */ e){	
	var fileTest = e.control;
	var pictureFile = app.lookup("USFWR_ImageFileInput");	
	    
    var reader = new FileReader();
    reader.readAsDataURL(pictureFile.files[0]);
    var dmUserFaceInfo = app.lookup("dmUserFaceWTInfo");
    dmUserFaceInfo.setValue("TemplateSize", pictureFile.files[0].size);
    
    reader.onload = function  () {
    	
    	var exif = EXIF.readFromBinaryFile(util.base64ToArrayBuffer(this.result));	
		orientation = exif.Orientation;
		if( orientation == undefined ){orientation = "undefined";}
		
    	var tempImage = new Image();    	
    	tempImage.src = reader.result;    	
        
        tempImage.onload = function () {   
        	
        	var canvas = document.getElementById("captureCanvas");
        	var srcWidth = canvas.width;
	    	var srcHeight = canvas.height;
	    	
	    	var canvasMax = this.width;
			if( canvasMax < this.height ){canvasMax = this.height}
			if( canvasMax > 1024 ){ canvasMax = 1024;}	    	
	    		    	
        	while(true){
	        
				canvas.width = canvasMax;
				canvas.height = canvasMax;
			
        		if( processImage(canvas, this, USFWR_imageMax) == true ){
        			break;
        		}
        		canvasMax -= 100;
        	} 
        	
		}        
    }; 	
}

// "완료" 버튼에서 click 이벤트 발생 시 호출.
function onUSFWR_btnfaceCompleteClick(/* cpr.events.CMouseEvent */ e){
	if (oem_version == OEM_REMOTE_FAW_MANAGEMENT && !similarCheck){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_RequestSimilarCheck"));
		return;
	}
	
	var dmUserFaceInfo = app.lookup("dmUserFaceWTInfo");
	var dmUserPicture = app.lookup("dmUserPicture");
//	console.log("faceInfo :" + JSON.stringify(dmUserFaceInfo.getDatas()));
//	console.log("picture : " + JSON.stringify(dmUserPicture.getDatas()));
	
	var data = new Object();
	
	if (dmUserFaceInfo.getValue("TemplateData").toString().length > 0) {
		data.TemplateData = dmUserFaceInfo.getDatas();
	}
	
	if (dmUserPicture.getValue("TemplateData").toString().length > 0) {
		data.PictureData = dmUserPicture.getDatas();
	}
//	console.log(data);
//	app.close({"TemplateData":dmUserFaceInfo.getDatas(), "PictureData":dmUserPicture.getDatas()})
	app.close(data);
}

// 탭 폴더에서 selection-change 이벤트 발생 시 호출.
function onTabFolderSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.TabFolder	 */
	var tabFolder = e.control;
	var itemIndex = tabFolder.getSelectedTabItem().itemIndex;
	if(itemIndex==0){ // terminal
	
	}else if( itemIndex==1){ // webcam
		
		navigator.getWebcam = (navigator.getUserMedia || navigator.webKitGetUserMedia ||
	 		navigator.moxGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
	
		var constraints = { audio: true, video: { width: { ideal: 1280 }, height: { ideal: 720 } } };
		if (navigator.mediaDevices.getUserMedia) {
			navigator.mediaDevices.getUserMedia({ video: true })
			.then(function (stream) {
				window.localStream = stream;  			            
	  			document.querySelector('video').srcObject = stream;  	
	 		})
	 		.catch(function (e) { 
	 			console.log(e.name + ": " + e.message); 
	 		});
		} else	{
			navigator.getWebcam({ video: true }, 
	     	function (stream) {     	
	            window.localStream = stream;
				document.querySelector('video').srcObject = stream;
				videoTracks = stream.getVideoTracks();
	     	}, 
	     	function () {
	     		 console.log("Web cam is not accessible."); 
	     	});
		}
		
	}else{ // file
		
	}
}

function sendConnectedTerminalListRequest() {
	var terminalList = app.lookup("USFWR_udcTerminalList");	
	var curIndex = terminalList.getCurrentPageIndex();
	
	var pageRowCount = terminalList.getPageRowCount();
	var offset = (curIndex - 1) * pageRowCount;
	
	var searchCtrl = app.lookup("USFWR_udcSearchTerminal")
	var smsGetConnectedTerminalList = app.lookup("sms_getConnectedTerminalList");
	smsGetConnectedTerminalList.action = USFWR_url+'/terminals'
	
	smsGetConnectedTerminalList.setParameters("searchCategory", searchCtrl.searchCategory);
	smsGetConnectedTerminalList.setParameters("searchKeyword", searchCtrl.searchKeyword);
	if( searchCtrl.searchKeyword != undefined && searchCtrl.searchKeyword.length > 0 ){
		smsGetConnectedTerminalList.setParameters("searchCategory", searchCtrl.searchCategory);
	}else{
		smsGetConnectedTerminalList.setParameters("searchCategory", "");
	}
	
	smsGetConnectedTerminalList.setParameters("offset", offset);
	smsGetConnectedTerminalList.setParameters("limit", pageRowCount);
	smsGetConnectedTerminalList.setParameters("AuthType", 'facewt');
	
	var fields = ["terminal_id","name","register_flag"];
	smsGetConnectedTerminalList.setParameters("fields", fields);
	if (oem_version == OEM_REMOTE_FAW_MANAGEMENT){
		smsGetConnectedTerminalList.setParameters("ExceptUseAuth", 'true');
	}
	
	comLib.showLoadMask("",dataManager.getString("Str_TerminalLoading"),"",pageRowCount);
	smsGetConnectedTerminalList.send();
}

// 서브미션에서 submit-done 이벤트 발생 시 호출.
function onSms_getConnectedTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var sms_getConnectedTerminalList = e.control;
	var bResultCode = app.lookup("Result").getValue("ResultCode");
	if(bResultCode == COMERROR_NONE) {
		var dsTerminalList = app.lookup("TerminalList");
			
		var terminalList = app.lookup("USFWR_udcTerminalList");
		
		if(oem_version == OEM_ITONE_TRDATA || oem_version == OEM_ITONE_POSCO_DX) {
			// 아이티원 등록기 default 최상단, 체크
			terminalList.setTerminalListITONE(dsTerminalList);
		} else {
			terminalList.setTerminalList(dsTerminalList);
		}
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));		
		terminalList.setTotalCount(totalCount);
		
		terminalList.setCurrentPageIndex(0);
		
	} else {
		
	}
	comLib.hideLoadMask();
	
//	if(oem_version == OEM_ITONE_TRDATA) {
//		// 아이티원 얼굴등록 간소화 (자동화)
//		sendFaceCaptureRequest();
//	}
}

//
function onSms_getConnectedTerminalListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

//
function onSms_getConnectedTerminalListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

function onBodyBeforeUnload(/* cpr.events.CEvent */ e){
	if(document.querySelector('video')){
		var stream = document.querySelector('video').srcObject;
		var tracks = stream.getTracks();
	 	for (var i = 0; i < tracks.length; i++) {
	    	var track = tracks[i];
	    	track.stop();
	  	}
	  	stream = null;	
  	}
}

function sendFaceCaptureRequest(){
	
	var SelectedTerminalInfo = app.lookup("USFWR_udcTerminalList");
		
	var checkedRowIndices = SelectedTerminalInfo.getCheckedRowIndices();
	
	if (checkedRowIndices.length <= 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalNotSelected"));
		return;
	}else if (checkedRowIndices.length > 1 ) {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_SelectedOneTerminal"));
		return;
	}
	var reqIndex = checkedRowIndices.pop();
	if (reqIndex == undefined ) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalNotSelected"));
		return;
	}
	var tID = SelectedTerminalInfo.getTerminalID(reqIndex);
	
	var sms_getUserFaceFromTerminal = app.lookup("sms_getUserFaceFromTerminal");
	sms_getUserFaceFromTerminal.action = USFWR_url+"/terminals/" + tID + "/scan/facewt";
	
	var timeout = 60;
	var itoneFlag = false;
	if(oem_version == OEM_ITONE_POSCO_DX || oem_version == OEM_ITONE_TRDATA) {
		itoneFlag = true;
		timeout = 120;
	} else if (oem_version == OEM_REMOTE_FAW_MANAGEMENT){
//		sms_getUserFaceFromTerminal.setParameters("checkSimilar", app.lookup("USFWR_cbxCheckSimilar").value);
		sms_getUserFaceFromTerminal.setParameters("checkSimilar", DoSimilarCheck);
	}
	sms_getUserFaceFromTerminal.setParameters("capture_timeout", timeout);
	comLib.showLoadMask("", dataManager.getString("Str_FingerRegist"), "", 60);	
	sms_getUserFaceFromTerminal.send();
	
	if(itoneFlag) {
		var infoText = "단말기에서 촬영이 시작됩니다."
		dialogAlert(app, dataManager.getString("Str_Info"), infoText);
	}
}

//
function onSms_getUserFaceFromTerminalSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	console.log("얼굴 받았다")
	var resultCode = app.lookup("Result").getValue("ResultCode");
	var dmUserFaceInfo = app.lookup("dmUserFaceWTInfo");
	
	if(resultCode == COMERROR_NONE) {
		var faceWTList = app.lookup("UserFaceWTInfo");
		var count = faceWTList.getRowCount();
//		var templateExist = false;
		for( var i = 0; i < count; i++){ // 전송받은 데이터 중 템플릿이 있으면 템플릿을 저장
			var faceWTInfo = faceWTList.getRow(i);
			var templateType = faceWTInfo.getValue("TemplateType");
			if( templateType == FaceWTTypeTemplate ){
//				templateExist = true;		
				dmUserFaceInfo.build(faceWTInfo.getRowData());
				dmUserFaceInfo.setValue("TemplateType",FaceWTTypeTemplate);
				break;
			}
		}
		
		for( var i = 0; i < count; i++){
			var faceWTInfo = faceWTList.getRow(i);
			var templateType = faceWTInfo.getValue("TemplateType");
			if( templateType == FaceWTTypeImage){ // 이미지
//				if( templateExist == false ){ // 템플릿이 없는 경우 이미지로 저장
					// 템플릿이랑 이미지가 같이 오는 경우 이미지로 덮어 씌우기
					var dmUserFaceInfo = app.lookup("dmUserFaceWTInfo");
					dmUserFaceInfo.build(faceWTInfo.getRowData());
					dmUserFaceInfo.setValue("TemplateType",FaceWTTypeImage);
//				}
				var dmUserPicture = app.lookup("dmUserPicture"); // 사진데이터 프로필로 전환 작업  - otk
				var imgPhoto = app.lookup("USFWR_imgPhoto");
				dmUserPicture.setValue("TemplateType", FaceWTTypeImage);
				dmUserPicture.build(faceWTInfo.getRowData()); // 정상적으로 사진 데이터 출력 확인완료 - otk
				imgPhoto.putValue('data:image/jpg;base64,'+faceWTInfo.getValue("TemplateData"));					
				imgPhoto.redraw();
				break;
			}			
		}
		
		if(oem_version == OEM_ITONE_TRDATA || oem_version == OEM_ITONE_POSCO_DX ) {
			console.log("1 정상")
			comLib.hideLoadMask();
			onUSFWR_btnfaceCompleteClick()
			return;
		} else if (oem_version == OEM_REMOTE_FAW_MANAGEMENT){
			sendFawSimilarCheck();
		}	
	} else {		
		console.log("2 에러")
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	comLib.hideLoadMask();
	console.log("3 일반적인 정상")
}

//
function onSms_getUserFaceFromTerminalSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

//
function onSms_getUserFaceFromTerminalSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}


/*
 * 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
 */
function onUSFWR_udcTerminalListPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.grid.terminalList
	 */
	var uSFWR_udcTerminalList = e.control;
	sendConnectedTerminalListRequest();
}


/*
 * 사용자 정의 컨트롤에서 search 이벤트 발생 시 호출.
 */
function onUSFWR_udcSearchTerminalSearch(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.search.searchTerminal
	 */
	var uSFWR_udcSearchTerminal = e.control;
	sendConnectedTerminalListRequest();
}


function onSms_postFawSimilarCheckSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if(resultCode == COMERROR_NONE) {
		similarCheck = true;
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_FawSimilarCheckSuccess"));
	} else {
		app.lookup("dmUserFaceWTInfo").clear();
		app.lookup("dmUserFawData").clear();
		app.lookup("USFWR_imgPhoto").putValue("");
		app.lookup("USFWR_imgPhoto").redraw();
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}


function onSms_postFawSimilarCheckSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_postFawSimilarCheckSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

function sendFawSimilarCheck(){
	if (Number(app.lookup("USFWR_cbxCheckSimilar").value) == DoSimilarCheck){
		var dmUserFawData = app.lookup("dmUserFawData");
		var dmUserFaceInfo = app.lookup("dmUserFaceWTInfo");
		dmUserFawData.clear();
		dmUserFawData.setValue("ImageData", dmUserFaceInfo.getValue("TemplateData"));
		dmUserFawData.setValue("ImageSize", dmUserFaceInfo.getValue("TemplateSize"));
		dmUserFawData.setValue("ImageType", dmUserFaceInfo.getValue("TemplateType"));
		if (_Mode == 'Modify'){
			dmUserFawData.setValue("UserID", _UserID);
		} else {
			dmUserFawData.setValue("UserID", 0);
		}

		comLib.showLoadMask("",dataManager.getString("Str_FawSimilarCheckLoading"),"",0);
		app.lookup("sms_postFawSimilarCheck").send();
	}
}
