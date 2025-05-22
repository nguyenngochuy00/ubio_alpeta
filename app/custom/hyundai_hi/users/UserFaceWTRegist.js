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
var maxPicture = 1024 * 1024 * 1; // 1MB..신분증, 증명사진 파일 크기 제한
var dataManager = cpr.core.Module.require("lib/DataManager");
var util = cpr.core.Module.require("lib/util");
var dateUtil = cpr.core.Module.require("lib/DateLib");

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();		
	comLib = createComUtil(app);
	var initValue = app.getHost().initValue;
	_FaceDatas = initValue["FaceDatas"];
	_Mode = initValue["Mode"];	
	USFWR_url = initValue["Url"];
	oem_version = dataManager.getOemVersion();
	var udcTerminalList = app.lookup("USFWR_udcTerminalList");	
	udcTerminalList.deleteColumn([13,12,11,10,9,8,7,6,5,4,3]);
	
	var customHDHI = app.lookup("UserCustomHDHI");
	customHDHI.setValue("AgreeDate", initValue["AgreeDate"]);
	customHDHI.setValue("AgreeFlag", initValue["AgreeFlag"]);
	
	var userID = initValue["ID"];
	_UserID = userID;
	if(userID){
		var submission = app.lookup("sms_getUserFaceWT");					
		submission.action = "/v1/users/"+userID+"/faceWTInfo";		
		submission.send();	
	}else{
		sendConnectedTerminalListRequest();
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
				imgPhoto.redraw();
			}
		}
	}
	var smsGetCustomPicture = app.lookup("sms_getCustomPictureHDHI");
	smsGetCustomPicture.action =  "/v1/hdhi/users/picture/" + _UserID;
	smsGetCustomPicture.send();
//	sendConnectedTerminalListRequest();
}

// 사용자 walkthrough 데이터 요청 에러
function onSms_getUserFaceWTSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// 사용자 walkthrough 데이터 요청 타임아웃
function onSms_getUserFaceWTSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// 캡쳐 클릭
function onUSFWR_btnCaptureClick(/* cpr.events.CMouseEvent */ e){	
	var tabFolder = app.lookup("USFWR_tabType");
	var itemIndex = tabFolder.getSelectedTabItem().itemIndex;
	if(itemIndex==0){ // terminal
		sendFaceCaptureRequest();
	}else if( itemIndex==1){ // webcam
		onWebCamCapture();
	}else{ // file
		var imgFile = app.lookup("USFWR_imgFile");
		if( imgFile.value == null ){
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
function processImage(canvas, srcImage, maxSize, imageID){ //imageID 1: 신분증, 2: 증명사진, default: 사용자 faw 이미지
					
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
//	var imageSrc = canvas.toDataURL(srcImage.type);
	var imageData = imageSrc.replace(/^data:image\/(png|jpg|jpeg|bmp);base64,/, "");	
	
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
	
	var pictureCustomHDHI = app.lookup("UserPictureCustomHDHI");
	switch(imageID){
		case 1 :
			pictureCustomHDHI.setValue("IDCardImageData", imageData);
			pictureCustomHDHI.setValue("IDCardImageSize", imageData.length);
			app.lookup("USFWR_IDCardImg").src = imageSrc;
			app.lookup("USFWR_IDCardImg").redraw();
			break;
			
		case 2 :
			pictureCustomHDHI.setValue("IDPhotoData", imageData);
			pictureCustomHDHI.setValue("IDPhotoSize", imageData.length);
			app.lookup("USFWR_IDPhotoImg").src = imageSrc;
			app.lookup("USFWR_IDPhotoImg").redraw();
			break;	
		
		default :
			var dmUserFaceInfo = app.lookup("dmUserFaceWTInfo");	
			dmUserFaceInfo.setValue("TemplateData", imageData);
			dmUserFaceInfo.setValue("TemplateType", FaceWTTypeImage); // 이미지(jpg)
			
			var dmUserPicture = app.lookup("dmUserPicture");
			dmUserPicture.setValue("TemplateData", imageData);
			dmUserPicture.setValue("TemplateType", FaceWTTypeImage);
				
			var imgPhoto = app.lookup("USFWR_imgFile");			
			imgPhoto.src = imageSrc;			
			imgPhoto.redraw();
			break;
	}
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
	var dmUserFaceInfo = app.lookup("dmUserFaceWTInfo");
	var dmUserPicture = app.lookup("dmUserPicture");
	var dmCustomPictureHDHI = app.lookup("UserPictureCustomHDHI");
//	console.log("faceInfo :" + JSON.stringify(dmUserFaceInfo.getDatas()));
//	console.log("picture : " + JSON.stringify(dmUserPicture.getDatas()));
	
	// 현대 중공업은 신분증과 증명사진 파일이 없으면 얼굴인증 사진 등록 불가
	if (dmCustomPictureHDHI.getValue("IDCardImageData") == null){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoIdentityCard"));
    	return
	}
	
	if (dmCustomPictureHDHI.getValue("IDCardImageData").toString().length <= 0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoIdentityCard"));
    	return
	}
	
	if (dmCustomPictureHDHI.getValue("IDPhotoData") == null){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoIDphoto"));
    	return
	}
	
	if (dmCustomPictureHDHI.getValue("IDPhotoData").toString().length <= 0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoIDphoto"));
    	return
	}
	
	var data = new Object();
	
	if (dmUserFaceInfo.getValue("TemplateData").toString().length > 0) {
		data.TemplateData = dmUserFaceInfo.getDatas();
	}
	
	if (dmUserPicture.getValue("TemplateData").toString().length > 0) {
		data.PictureData = dmUserPicture.getDatas();
	}
	
	data.CustomPicture = dmCustomPictureHDHI.getDatas();
	data.CustomHDHI = app.lookup("UserCustomHDHI").getDatas();
//	console.log(data);
//	app.close({"IDCardImageData":dmUserFaceInfo.getDatas(), "PictureData":dmUserPicture.getDatas()})
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
	sms_getUserFaceFromTerminal.setParameters("capture_timeout", 60);
	comLib.showLoadMask("", dataManager.getString("Str_FaceWRegist"), "", 60);	
	sms_getUserFaceFromTerminal.send();
}

//
function onSms_getUserFaceFromTerminalSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	console.log("얼굴 받았다");
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if(resultCode == COMERROR_NONE) {
		var faceWTList = app.lookup("UserFaceWTInfo");
		var count = faceWTList.getRowCount();
//		var templateExist = false;
		for( var i = 0; i < count; i++){ // 전송받은 데이터 중 템플릿이 있으면 템플릿을 저장
			var faceWTInfo = faceWTList.getRow(i);
			var templateType = faceWTInfo.getValue("TemplateType");
			if( templateType == FaceWTTypeTemplate ){
//				templateExist = true;
				var dmUserFaceInfo = app.lookup("dmUserFaceWTInfo");
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
		var dmCustomHDHI = app.lookup("UserCustomHDHI");
		// 개인정보제공 동의 안하면 사진 정보 없음. error
		dmCustomHDHI.setValue("AgreeFlag", 1);
		dmCustomHDHI.setValue("AgreeDate", dateUtil.getToday());
		
	} else {		
		console.log("2 에러");
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	comLib.hideLoadMask();
	console.log("3 일반적인 정상");
}

//
function onSms_getUserFaceFromTerminalSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

//
function onSms_getUserFaceFromTerminalSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}


function onUSFWR_udcTerminalListPagechange(/* cpr.events.CSelectionEvent */ e){
	var uSFWR_udcTerminalList = e.control;
	sendConnectedTerminalListRequest();
}

function onUSFWR_udcSearchTerminalSearch(/* cpr.events.CUIEvent */ e){
	var uSFWR_udcSearchTerminal = e.control;
	sendConnectedTerminalListRequest();
}

function fileSearchClick(/* cpr.events.CMouseEvent */ e){
	var controlID = e.control.id;
	var fileInput;
	switch(controlID){
		case "Identity" :
			fileInput = app.lookup("USFWR_IDCardFileInput");
			break;
		
		case "IDPhoto" :
			fileInput = app.lookup("USFWR_IDPhotoFileInput");
			break;
	}	
	fileInput.openFileChooser();
}

// 신분증 사진
function onUSFWR_IDCardFileInputValueChange(/* cpr.events.CValueChangeEvent */ e){
	var fileTest = e.control;
	var pictureFile = app.lookup("USFWR_IDCardFileInput");	
	    
    var reader = new FileReader();
    console.log(pictureFile.files[0]);
    reader.readAsDataURL(pictureFile.files[0]);
    var dmPictureCustomInfo = app.lookup("UserPictureCustomHDHI");
    var fileType =  pictureFile.files[0].type;
    if (fileType == "image/png"){
    	dmPictureCustomInfo.setValue("IDCardImageType", ImageTypePng);
    } else if (fileType == "image/jpeg"){
    	dmPictureCustomInfo.setValue("IDCardImageType", ImageTypeJpg);
    } else if (fileType == "image/jpg"){
    	dmPictureCustomInfo.setValue("IDCardImageType", ImageTypeJpg);
    } else if (fileType == "image/bmp"){
    	dmPictureCustomInfo.setValue("IDCardImageType", ImageTypeBmp);
    } else {
    	pictureFile.clear();
    	dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_FileFormatInvalid"));
    	return
    }
    
    if (pictureFile.files[0].size > maxPicture){
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_ErrorMtcBigSize"));
		return
	}
    
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
			
        		if( processImage(canvas, this, USFWR_imageMax, 1) == true ){
        			break;
        		}
        		canvasMax -= 100;
        	} 
        	
		}        
    }; 
}

// 증명사진
function onUSFWR_IDPhotoFileInputValueChange(/* cpr.events.CValueChangeEvent */ e){
	var fileTest = e.control;
	var pictureFile = app.lookup("USFWR_IDPhotoFileInput");		    
    var reader = new FileReader();
    console.log(pictureFile.files[0]);
    reader.readAsDataURL(pictureFile.files[0]);
    var dmPictureCustomInfo = app.lookup("UserPictureCustomHDHI");
    var fileType =  pictureFile.files[0].type;
    if (fileType == "image/png"){
    	dmPictureCustomInfo.setValue("IDPhotoType", ImageTypePng);
    } else if (fileType == "image/jpeg"){
    	dmPictureCustomInfo.setValue("IDPhotoType", ImageTypeJpg);
    } else if (fileType == "image/jpg"){
    	dmPictureCustomInfo.setValue("IDPhotoType", ImageTypeJpg);
    } else if (fileType == "image/bmp"){
    	dmPictureCustomInfo.setValue("IDPhotoType", ImageTypeBmp);
    } else {
    	pictureFile.clear();
    	dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_FileFormatInvalid"));
    	return
    }
    
    if (pictureFile.files[0].size > maxPicture){
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_ErrorMtcBigSize"));
		return
	}

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
			
        		if( processImage(canvas, this, USFWR_imageMax, 2) == true ){
        			break;
        		}
        		canvasMax -= 100;
        	} 
        	
		}        
    }; 
}

// 이미지 우클릭 방지
function disableContextmenu(/* cpr.events.CMouseEvent */ e){
	e.preventDefault();
}

function onSms_getCustomPictureHDHISubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	if (dmResult.getValue("ResultCode") == COMERROR_NONE) {
		var customPicture = app.lookup("UserPictureCustomHDHI");
		if (customPicture != null) {
			var imgType = "";
			switch(customPicture.getValue("IDCardImageType")){
				case ImageTypeJpg :
					imgType = "data:image/jpg;base64,";
					break;
				
				case ImageTypeBmp :
					imgType = "data:image/bmp;base64,";
					break;
					
				case ImageTypePng :
					imgType = "data:image/png;base64,";
					break;	
			}
			app.lookup("USFWR_IDCardImg").putValue(imgType + customPicture.getValue("IDCardImageData"));
			app.lookup("USFWR_IDCardImg").redraw();
			
			imgType = "";
			switch(customPicture.getValue("IDPhotoType")){
				case ImageTypeJpg :
					imgType = "data:image/jpg;base64,";
					break;
				
				case ImageTypeBmp :
					imgType = "data:image/bmp;base64,";
					break;
					
				case ImageTypePng :
					imgType = "data:image/png;base64,";
					break;	
			}
			app.lookup("USFWR_IDPhotoImg").putValue(imgType + customPicture.getValue("IDPhotoData"));
			app.lookup("USFWR_IDPhotoImg").redraw();
		}
	}
	sendConnectedTerminalListRequest();
}

function onSms_getCustomPictureHDHISubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_getCustomPictureHDHISubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}
