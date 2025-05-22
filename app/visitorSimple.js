/************************************************
 * visitorLogin.js
 * Created at 2019. 1. 30. 오전 11:00:43.
 *
 * @author fois
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var orientation;
VMSRP_step = 0;

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	
	
	/*
	 var canvas = document.getElementById('captureCanvas');
	 
	var cx = canvas.getContext('2d');
	var imageObj = new Image();	
	imageObj.onload = function () {
    	cx.drawImage(imageObj, 182, 182);
	}
	imageObj.src = '../../theme/images/no_userPicture2.png';
	*/
	var container = app.getContainer();
	var rect = container.getActualRect();
	
	
	var camera = document.getElementById("camera")
	
	camera.addEventListener('change', function(e) {
	    var file = e.target.files[0]; 
	    
	    var reader = new FileReader();
    	reader.readAsDataURL( file);
    	
    	reader.onload = function  () {    
    		var exif = EXIF.readFromBinaryFile(base64ToArrayBuffer(this.result));	
			orientation = exif.Orientation;
			if( orientation == undefined ){
				orientation = "undefined";   
			}
			    	    	
			var imgNoPhoto = app.lookup("VMSRP_imgNoPhoto");
			imgNoPhoto.visible = false;
			
			var btnCapture = app.lookup("VMSRP_btnCapture");
			btnCapture.text = "Regist";
			VMSRP_step = 1;
			
			
	    	var tempImage = new Image();    	
	    	tempImage.src = reader.result;
        
        	tempImage.onload = function () {    
        		{
			    	var canvas = document.getElementById("captureCanvas2");
			    				    		
			    	var max = this.width;
		            if( max < this.height ){
		            	max = this.height
		            }
		            if( max > 1920 ){
		            	max = max / 2;
		            }
		            canvas.width = max;
					canvas.height = max;
								    				    				    	
			    	//canvas.width = this.width;
					//canvas.height = this.height;
					
					var ctx = canvas.getContext("2d");
					ctx.save();
					
					var hRatio = canvas.width / this.width    ;
					var vRatio = canvas.height / this.height  ;
					var ratio  = Math.min ( hRatio, vRatio );
					var centerShift_x = ( canvas.width - this.width*ratio ) / 2;
	   				var centerShift_y = ( canvas.height - this.height*ratio ) / 2;
	   				  
	   									   				
	   				switch(orientation){
				        case 2:
				            // horizontal flip				            
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
				    
				   ctx.drawImage(this, 0,0, this.width, this.height,
	   							centerShift_x,centerShift_y,this.width*ratio, this.height*ratio);
	   							
	   				ctx.restore();
				    								    	
					var imageSrc = canvas.toDataURL("image/jpeg");
					var imageData = imageSrc.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");	
		    		
		    		var dmVisitorInfo = app.lookup("VisitorInfo");
		    		dmVisitorInfo.setValue("Picture", imageData);
		    		
		    		canvas.width = 0;
					canvas.height = 0;
					
					
	   			}
	   			{
			    	var canvas = document.getElementById("captureCanvas");
			    	canvas.width = 250;
			    	canvas.height = 250;
			    	var ctx = canvas.getContext("2d");
			    	ctx.save();
					
					var hRatio = canvas.width / this.width    ;
					var vRatio = canvas.height / this.height  ;
					var ratio  = Math.min ( hRatio, vRatio );
					var centerShift_x = ( canvas.width - this.width*ratio ) / 2;
	   				var centerShift_y = ( canvas.height - this.height*ratio ) / 2;  
	   				ctx.clearRect(0,0,canvas.width, canvas.height);
	   				
	   				switch(orientation){
				        case 2:
				            // horizontal flip
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
				    var shlCanvas =  app.lookup("VMSRP_shlCanvas");
					shlCanvas.style.css({"background-image" : ""});
				    ctx.drawImage(this, 0,0, this.width, this.height,
	   					centerShift_x,centerShift_y,this.width*ratio, this.height*ratio); 
	   				ctx.restore();
	   					
	   			}
			}        
	    }; 	
    
	    //var canvas = document.getElementById("captureCanvas");
	    //canvas.src = URL.createObjectURL(file);
  	});	
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

// 로그인 타입 선택.
function onVLOGIN_rdbLoginTypeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.RadioButton */
	var vLOGIN_rdbLoginType = e.control;
	console.log(vLOGIN_rdbLoginType.value);	
}

// 쉘(input type file) load 이벤트 발생 시 호출.
function onVMSRP_shlPictureLoad(/* cpr.events.CUIEvent */ e){	
	var content = e.content;	
	
	// 사진,비디오,사진첩 활성화
	//content.innerHTML = "<input id=\"camera\" style=\"width:0px\" type=\"file\" accept=\"image/*;capture=camera\"/>";
	
	// 사진 캡쳐만 활성화
	content.innerHTML = "<input id=\"camera\" style=\"width:0px\" type=\"file\" accept=\"image/*\" capture=\"camera\"/>";	
	
	//content.innerHTML = "<video width=\"360px\" height=\"640px\" id=\"cameraPreview\" autoplay></video>";
}

// 쉘( 디스플레이용 캔버스 ) load 이벤트 발생 시 호출.
function onVMSRP_shlCanvasLoad(/* cpr.events.CUIEvent */ e){
	var content = e.content;	
	content.innerHTML = "<canvas width=\"0px\" height=\"0px\" id=\"captureCanvas\"></canvas>";	
	
}
// 쉘( 업로드용 캔버스 ) load 이벤트 발생 시 호출.
function onVMSRP_shlCanvas2Load(/* cpr.events.CUIEvent */ e){
	var content = e.content;
	content.innerHTML = "<canvas width=\"0px\" height=\"0px\" id=\"captureCanvas2\"></canvas>";
}

// Capture 버튼 클릭
function onVMSRP_btnCaptureClick(/* cpr.events.CMouseEvent */ e){	
	/** @type cpr.controls.Button	 */
	var button = e.control;
	if(VMSRP_step==0){
		var ipbCapture = document.getElementById("camera");
		ipbCapture.click();
	}else{
		var dmVisitorInfo = app.lookup("VisitorInfo");
	
	var sms_postVisitUsers = new cpr.protocols.Submission("sms_postVisitUsers");
	sms_postVisitUsers.action = "/v1/visitor/users";
	sms_postVisitUsers.method = "post";
	sms_postVisitUsers.mediaType = "application/x-www-form-urlencoded";
		
	sms_postVisitUsers.addRequestData(dmVisitorInfo, "VisitorInfo");
	sms_postVisitUsers.addResponseData(app.lookup("Result"), false, "Result");
		
	sms_postVisitUsers.addEventListenerOnce("submit-done", onSms_postVisitUsersSubmitDone);
	sms_postVisitUsers.addEventListenerOnce("submit-error", onSms_postVisitUsersSubmitError);
	sms_postVisitUsers.addEventListenerOnce("submit-timeout", onSms_postVisitUsersSubmitTimeout);
	
		button.enabled = false;
		sms_postVisitUsers.send();
	}
}

// Regist 버튼 클릭 
function onVMSRP_btnRegistClick(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Button	 */
	var button = e.control;
	var dmVisitorInfo = app.lookup("VisitorInfo");
	
	var sms_postVisitUsers = new cpr.protocols.Submission("sms_postVisitUsers");
	sms_postVisitUsers.action = "/v1/visit/users";
	sms_postVisitUsers.method = "post";
	sms_postVisitUsers.mediaType = "application/x-www-form-urlencoded";
		
	sms_postVisitUsers.addRequestData(dmVisitorInfo, "VisitorInfo");
	sms_postVisitUsers.addResponseData(app.lookup("Result"), false, "Result");
		
	sms_postVisitUsers.addEventListenerOnce("submit-done", onSms_postVisitUsersSubmitDone);
	sms_postVisitUsers.addEventListenerOnce("submit-error", onSms_postVisitUsersSubmitError);
	sms_postVisitUsers.addEventListenerOnce("submit-timeout", onSms_postVisitUsersSubmitTimeout);
	
	button.enabled = false;
	sms_postVisitUsers.send();
	alert("send");	
}

function onSms_postVisitUsersSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var button = app.lookup("VMSRP_btnCapture");
	button.enabled = true;
	
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	
	if ( ResultCode == COMERROR_NONE) {		
		alert("Registration success");		
		//dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Success"));
	} else {
		alert("Registration failed");
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(ResultCode)));
	}
	
	var btnCapture = app.lookup("VMSRP_btnCapture");
	btnCapture.text = "Get Started";
	VMSRP_step = 0;
}

function onSms_postVisitUsersSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

function onSms_postVisitUsersSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

