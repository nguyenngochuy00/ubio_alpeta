/************************************************
 * webCamCapture.js
 * Created at 2018. 10. 16. 오전 10:10:13.
 * Prefix : VMUPR_
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var VMUPR_step = 0; //0:none,1:streaming,2:captured
var comLib;

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var canvas = document.getElementById("captureCanvas");
	canvas.style.visibility = "hidden";	
	
	changeRegistType();
}

// 캡쳐 이미지 드로잉 캔버스
function onShlCaptureCanvasLoad(/* cpr.events.CUIEvent */ e){
	/** @type cpr.controls.UIControlShell */
	var shl1 = e.control;
	var content = e.content;
	content.innerHTML = "<canvas width=\"0px\" height=\"0px\" id=\"captureCanvas\"></canvas>";
}

// 카메라 스트림
function onShlCameraPreviewLoad(/* cpr.events.CUIEvent */ e){
	/** @type cpr.controls.UIControlShell	 */
	var shlCameraPreview = e.control;
	var content = e.content;
	content.innerHTML = "<video width=\"320px\" height=\"320px\" id=\"cameraPreview\" autoplay></video>";	
}

function base64ToArrayBuffer (base64) {
    base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
    var binaryString = atob(base64);
    var len = binaryString.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
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
	  	
	orientation=0;			  		
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
	
	console.log(imageData.length);
	if(imageData.length >= maxSize ){		
		return false
	}
			
	//var imageSrc = canvas.toDataURL("image/jpeg");
	var imgVisitor = app.lookup("VMUPR_imgVisitorPhoto");			
	imgVisitor.src = imageSrc;			
	imgVisitor.redraw();
		  
	//var imageData = imageSrc.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
	var dmVisitorInfo = app.lookup("UserPhoto");
	dmVisitorInfo.setValue("Photo", imageData);		
		
	return true;
}
function onCameraChangeEvent(e){
	
	var file = e.target.files[0]; 
	    
	var reader = new FileReader();
	reader.readAsDataURL( file);
    	
	reader.onload = function  () {    
		var exif = EXIF.readFromBinaryFile(base64ToArrayBuffer(this.result));	
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

        		if( processImage(canvas, this, 130000) == true ){
        			break;
        		}
        		canvasMax -= 100;
        	} 
	   	}
   	}
}
 
/*
 * "캡쳐" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVMUPR_btnCaptureClick(/* cpr.events.CMouseEvent */ e){	
	
	var tabRegistType = app.lookup("VMUPR_tabRegistType");
	if(tabRegistType.getSelectedTabItem().itemIndex==1){		
		var ipbCapture = document.getElementById("imageFile");
		ipbCapture.click();
		return;
	}
	
	var btnCapture = app.lookup("VMUPR_btnCapture");
	
	var video = document.getElementById('cameraPreview');
	var canvas = document.getElementById("captureCanvas");
	
	
	if( VMUPR_step == 0 || VMUPR_step == 2 ){ // 캡쳐 전이거나 캡쳐 완료 상태이면
		VMUPR_step = 1; // 캡쳐 상태로 전환		
		var imgVisitor = app.lookup("VMUPR_imgCameraCapture");
		imgVisitor.visible = false;
			
		btnCapture.bind("value").toLanguage("Str_Capture");
		
		video.style.visibility = "visible";		
		canvas.style.visibility = "hidden";	
		
		navigator.getWebcam = (navigator.getUserMedia || navigator.webKitGetUserMedia || navigator.moxGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
		
		if( navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			navigator.mediaDevices.getUserMedia({ video: true })
			.then(function (stream) {
				window.localStream = stream;
	  			//document.querySelector('video').src = URL.createObjectURL(stream);            
	  			document.querySelector('video').srcObject = stream;  	
	 		})
	 		.catch(function (e) { 
	 			VMUPR_step = 0;
	 			alert(e.name + ": " + e.message); 
	 		});
		} else if(navigator.getWebcam){
			navigator.getWebcam({ video: true }, 
	     	function (stream) {     	
	            window.localStream = stream;
				document.querySelector('video').srcObject = stream;
				videoTracks = stream.getVideoTracks();
	     	}, 
	     	function () {
	     		VMUPR_step = 0;
	     		 alert("Web cam is not accessible."); 
	     	});
		}else {
			VMUPR_step = 0;
			btnCapture.bind("value").toLanguage("Str_CaptureStart");
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnWebCamNotInitialized"));
		}
	}else{
		VMUPR_step = 2; //캡쳐 완료
		
		btnCapture.bind("value").toLanguage("Str_CaptureStart");
		
		video.style.visibility = "hidden";
		canvas.style.visibility = "visible";
		canvas.width = 320;				
		canvas.height = 320;
		
		var ctx = canvas.getContext('2d');
		ctx.save();
		
		ctx.drawImage(video, 0,0, canvas.width, canvas.height);
		
		var canvas = document.getElementById("captureCanvas");	
		var imageSrc = canvas.toDataURL("image/jpeg");
				
		var imgVisitor = app.lookup("VMUPR_imgCameraCapture");
		imgVisitor.visible = true;
		imgVisitor.src = imageSrc;
		imgVisitor.redraw();
				   			
		ctx.clearRect(0, 0, this.width, this.height);
		ctx.beginPath();
				
		ctx.restore();
		
		canvas.width = 0;				
		canvas.height = 0;
		
		var imageData = imageSrc.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
		var dmVisitorInfo = app.lookup("UserPhoto");
		dmVisitorInfo.setValue("Photo", imageData);
		
		var handleStop = function(stream) {
		    document.querySelector('video').srcObject.getTracks().forEach(function(track){
		    	track.stop();
		    	//app.close(dataURI);
			});
		};
		  	
		navigator.mediaDevices.getUserMedia({video: true})
			.then(handleStop);	
	}
}

//
function onVMUPR_btnSelectClick(/* cpr.events.CMouseEvent */ e){
	// 퀄리티 체크 기능 추가 - otk
	var dmUserPhoto = app.lookup("UserPhoto");
	var userPhoto = dmUserPhoto.getValue("Photo");
	if ( userPhoto.toString().length > 0 ) {
		var sms_postCheckToUsePhoto = app.lookup("sms_CheckUseUserPhoto");
		comLib.showLoadMask("pro", getDataManager().getString("Str_VisitorPhotoQualityChecking"), "", 0);
		sms_postCheckToUsePhoto.send();
	} else {
		app.close("");	
	}
}

// 탭 폴더에서 selection-change 이벤트 발생 시 호출.
function onVMUPR_tabRegistTypeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.TabFolder	 */
	var vMUPR_tabRegistType = e.control;	
	
	changeRegistType();
}

// 사용자 사진 캡쳐사진 선택 탭 변경
function changeRegistType() {
	var vMUPR_tabRegistType = app.lookup("VMUPR_tabRegistType")
	var btnCapture = app.lookup("VMUPR_btnCapture");
	if(vMUPR_tabRegistType.getSelectedTabItem().itemIndex==0){
		VMUPR_step = 0;		
		btnCapture.bind("value").toLanguage("Str_CaptureStart");		
	} else { // 1 : 파일 선택	
		if( VMUPR_step == 1 ){ // 캡쳐 중이면 중지				
			var handleStop = function(stream) {
		    	document.querySelector('video').srcObject.getTracks().forEach(function(track){track.stop();});
			};		  	
			navigator.mediaDevices.getUserMedia({video: true}).then(handleStop);	
		}
		btnCapture.bind("value").toLanguage("Str_SelectFile");		
	}
}
 


// 쉘에서 load 이벤트 발생 시 호출.
function onVMUPR_shlInputLoad(/* cpr.events.CUIEvent */ e){
	var content = e.content;	
	content.innerHTML = "<input id=\"imageFile\" style=\"width:0px\" type=\"file\" accept=\"image/*\" capture=\"camera\"/>";
	content.addEventListener('change', onCameraChangeEvent);
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_CheckUseUserPhotoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode");
	if ( resultCode == COMERROR_NONE) {
		var dmUserPhoto = app.lookup("UserPhoto");
		dmUserPhoto.getValue("Photo");
		app.close(dmUserPhoto.getValue("Photo"));
	} else {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_CheckUseUserPhotoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_CheckUseUserPhotoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}
