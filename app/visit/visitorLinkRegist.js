/************************************************
 * visitorLogin.js
 * Created at 2019. 1. 30. 오전 11:00:43.
 *
 * @author fois
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var languageMap = new Map();
var util = cpr.core.Module.require("lib/util");

var VMSRP_step = 0;
var VMSRP_convert = false;
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();	
	comLib = createComUtil(app);
	
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
			
			if(exif.Model != null && (exif.Model.indexOf('SM-N97')>-1||exif.Model.indexOf('SM-G97')>-1)){
				VMSRP_convert = true;
				//alert(exif.Model);
			}
			//alert(JSON.stringify(exif));
			if( orientation == undefined ){
				orientation = "undefined";   
			}
			    	    	
			var imgNoPhoto = app.lookup("VMSRP_imgNoPhoto");
			//imgNoPhoto.visible = false;
			
			var btnCapture = app.lookup("VMSRP_btnCapture");
			btnCapture.text = languageMap.get("Str_Regist");
			VMSRP_step = 1;
			
			
	    	var tempImage = new Image();    	
	    	tempImage.src = reader.result;
	    	
        	tempImage.onload = function () {    
        		
        		rotateAngle = 0;
        		var imgPhoto = app.lookup("VMSRP_imgNoPhoto");	
				imgPhoto.style.css({"transform": "rotate(0deg)"});
        		
		    	var canvas = document.getElementById("captureCanvas2");
		    	
		    	canvas.width = this.width
		    	canvas.height = this.height
		    	   	
		        var step = 0;
		        var srcWidth = this.width;
		    	var srcHeight = this.height;
		    	
		        if( this.width > 1024 ){		        	
		        	step = 65;
		        }
	        	while(true){	
					canvas.width = this.width * (100-step)/100;
					canvas.height = this.height * (100-step)/100;					
									
					var imageSrc = util.processImage(canvas, this, orientation, 130000,VMSRP_convert);
					if( imageSrc != null ){
						var imageData = imageSrc.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
						var dmVisitorInfo = app.lookup("VisitorInfo");
						dmVisitorInfo.setValue("Photo", imageData);
		
						var imgPhoto = app.lookup("VMSRP_imgNoPhoto");			
						imgPhoto.src = imageSrc;				
						imgPhoto.redraw();
						break;
					}		
	
	        		step += 1;
	        		
        		}
        	}			       
	    };   
  	});	
  	  	
	var language = "ko";
	if (navigator.languages && navigator.languages.length) {
		language = navigator.languages[0].substring(0,2);
	} else {
		language =  navigator.userLanguage || navigator.language || navigator.browserLanguage || 'en';
	}
	dataManager.setLocale(language);
		
	var sms_getLangList = app.lookup("sms_getLangList") ;
	sms_getLangList.action = "data/lang/lang_visit_"+language+".json";	
	sms_getLangList.send();		
}

var orientation;
function processImage(canvas, srcImage, maxSize){
					
	var ctx = canvas.getContext("2d");
	ctx.save();
    	
	var hRatio = canvas.width / srcImage.width;
	var vRatio = canvas.height / srcImage.height;
	
	var ratio  = Math.min ( hRatio, vRatio );
	var centerShift_x = ( canvas.width - srcImage.width*hRatio ) / 2;
   	var centerShift_y = ( canvas.height - srcImage.height*vRatio ) / 2;
				
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
	        
	         if( VMSRP_convert == true ){
	        	ctx.rotate(0.5 * Math.PI);
	        ctx.scale(1, -1);
	        	        	
		        var temp = canvas.width;
		        canvas.width = canvas.height;
		        canvas.height = temp;
		        
		        centerShift_x = ( canvas.width - srcImage.width*ratio ) / 2;
		   		centerShift_y = ( canvas.height - srcImage.height*ratio ) / 2;	
	        }else {
	        	if(canvas.width>canvas.height){
	        		canvas.height = canvas.width;
	        	}else{
	        		canvas.width = canvas.height;
	        	}
	        	centerShift_x = ( canvas.width - srcImage.width*ratio ) / 2;
		   		centerShift_y = ( canvas.height - srcImage.height*ratio ) / 2;	
		   		
		   		ctx.rotate(0.5 * Math.PI);
	        ctx.scale(1, -1);
	        }	 
			
	        break;
	    case 6:	    	
	        // 90° rotate right				            
	          
	        if( VMSRP_convert == true ){
	        	ctx.rotate(0.5 * Math.PI);
	        	ctx.translate(0, -canvas.height);  
	        	        	
		        var temp = canvas.width;
		        canvas.width = canvas.height;
		        canvas.height = temp;
		        
		        centerShift_x = ( canvas.width - srcImage.width*ratio ) / 2;
		   		centerShift_y = ( canvas.height - srcImage.height*ratio ) / 2;	
	        }else {
	        	if(canvas.width>canvas.height){
	        		canvas.height = canvas.width;
	        	}else{
	        		canvas.width = canvas.height;
	        	}
	        	centerShift_x = ( canvas.width - srcImage.width*ratio ) / 2;
		   		centerShift_y = ( canvas.height - srcImage.height*ratio ) / 2;	
		   		
		   		ctx.rotate(0.5 * Math.PI);
	        	ctx.translate(0, -canvas.height);  
	        }	 
	        temp = hRatio;
			hRatio = vRatio;
			vRatio = temp;      
				
	        break;
	        
	    case 7:
	        // horizontal flip + 90 rotate right
	       
	        if( VMSRP_convert == true ){
	        	 ctx.rotate(0.5 * Math.PI);
		        ctx.translate(canvas.width, -canvas.height);
		        ctx.scale(-1, 1);
	        	        	
		        var temp = canvas.width;
		        canvas.width = canvas.height;
		        canvas.height = temp;
		        
		        centerShift_x = ( canvas.width - srcImage.width*ratio ) / 2;
		   		centerShift_y = ( canvas.height - srcImage.height*ratio ) / 2;	
	        }else {
	        	if(canvas.width>canvas.height){
	        		canvas.height = canvas.width;
	        	}else{
	        		canvas.width = canvas.height;
	        	}
	        	centerShift_x = ( canvas.width - srcImage.width*ratio ) / 2;
		   		centerShift_y = ( canvas.height - srcImage.height*ratio ) / 2;	
		   		
		   		 ctx.rotate(0.5 * Math.PI);
		        ctx.translate(canvas.width, -canvas.height);
		        ctx.scale(-1, 1);
	        }	 
	        temp = hRatio;
			hRatio = vRatio;
			vRatio = temp;      
			
	        break;
	    case 8:
	        // 90° rotate left
            
            if( VMSRP_convert == true ){
	        	ctx.rotate(-0.5 * Math.PI);
            ctx.translate(-canvas.width, 0);
	        	        	
		        var temp = canvas.width;
		        canvas.width = canvas.height;
		        canvas.height = temp;
		        
		        centerShift_x = ( canvas.width - srcImage.width*ratio ) / 2;
		   		centerShift_y = ( canvas.height - srcImage.height*ratio ) / 2;	
	        }else {
	        	if(canvas.width>canvas.height){
	        		canvas.height = canvas.width;
	        	}else{
	        		canvas.width = canvas.height;
	        	}
	        	centerShift_x = ( canvas.width - srcImage.width*ratio ) / 2;
		   		centerShift_y = ( canvas.height - srcImage.height*ratio ) / 2;	
		   		
		   		ctx.rotate(-0.5 * Math.PI);
            ctx.translate(-canvas.width, 0);;
	        }	 
            break;
   	}				    
				    
	//ctx.drawImage(srcImage, 0,0, srcImage.width, srcImage.height,
		//centerShift_x,centerShift_y,canvas.width, canvas.height);
		
	ctx.drawImage(srcImage, 0,0, srcImage.width, srcImage.height,
		centerShift_x,centerShift_y,srcImage.width*hRatio, srcImage.height*vRatio);
		    	
	var imageSrc = canvas.toDataURL("image/jpeg");
	var imageData = imageSrc.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");	
	var a = canvas.width;
	var b = canvas.height; 
	canvas.width = 0;
	canvas.height = 0;
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.beginPath();
		
	ctx.restore();
	
	console.log(imageData.length);
	if(imageData.length >= maxSize ){		
		return false
	}
	//alert(srcImage.width +" "+ srcImage.height +" "+centerShift_x+" "+centerShift_y+" "+a+" "+ b);
	
	var dmVisitorInfo = app.lookup("VisitorInfo");
	dmVisitorInfo.setValue("Photo", imageData);
		
	var imgPhoto = app.lookup("VMSRP_imgNoPhoto");			
	imgPhoto.src = imageSrc;				
	imgPhoto.redraw();
		
	return true;
}

exports.setVisitInfo = function(visitIndex,visitorIndex,accessGroup,name){
	var visitorInfo = app.lookup("VisitorInfo");
	visitorInfo.setValue("VisitIndex", visitIndex);
	visitorInfo.setValue("VisitorIndex", visitorIndex);
	visitorInfo.setValue("AccessGroup", accessGroup);
	visitorInfo.setValue("Name", name);
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

function sendPostVisitorFace(){
	var button = app.lookup("VMSRP_btnCapture");
		
	var dmVisitorInfo = app.lookup("VisitorInfo");
	
	var sms_postVisitUsers = new cpr.protocols.Submission("sms_postVisitorFace");
	sms_postVisitUsers.action = "/v1/visitor/registFace";
	sms_postVisitUsers.method = "post";
	sms_postVisitUsers.mediaType = "application/x-www-form-urlencoded";
		
	sms_postVisitUsers.addRequestData(dmVisitorInfo, "VisitorInfo");
	sms_postVisitUsers.addResponseData(app.lookup("Result"), false, "Result");
		
	sms_postVisitUsers.addEventListenerOnce("submit-done", onSms_postVisitorFaceSubmitDone);
	sms_postVisitUsers.addEventListenerOnce("submit-error", onSms_postVisitorFaceSubmitError);
	sms_postVisitUsers.addEventListenerOnce("submit-timeout", onSms_postVisitorFaceSubmitTimeout);
	
	button.enabled = false;
	sms_postVisitUsers.send();	
}

// Capture 버튼 클릭
function onVMSRP_btnCaptureClick(/* cpr.events.CMouseEvent */ e){	
	/** @type cpr.controls.Button	 */
	var button = e.control;
	if(VMSRP_step==0){
		var ipbCapture = document.getElementById("camera");
		ipbCapture.click();
	}else{
		sendPostVisitorFace();
	}
}

// Regist 버튼 클릭 
function onVMSRP_btnRegistClick(/* cpr.events.CMouseEvent */ e){
	sendPostVisitorFace();
}

function onSms_postVisitorFaceSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var language = localStorage.getItem("language");
	if( language ){
		dataManager.setLocale(language);
	}else {
		language = dataManager.initLanguage();
		localStorage.setItem("language",language);
	}
	comLib.language(language);
	
	var btnCapture = app.lookup("VMSRP_btnCapture");
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	
	btnCapture.value = languageMap.get("Str_TakePhoto");
	VMSRP_step = 0;
	btnCapture.enabled = true;
	
	if ( ResultCode == COMERROR_NONE) {				
		dialogAlert(app, languageMap.get("Str_Success"), languageMap.get("Str_VisitorRegistSuccess"), function(/*cpr.controls.Dialog*/dialog){			
			dialog.addEventListenerOnce("close", function(e) {
				cpr.core.App.load("app/visitorLogin", function(newapp) {
					app.close();
					newapp.createNewInstance().run();				
				});			
			});
		});
	} else {		
		dialogAlert(app, languageMap.get("Str_Failed"), languageMap.get(getErrorString(ResultCode)));
	}
	
}

function onSms_postVisitorFaceSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

function onSms_postVisitorFaceSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

//
function onSms_getLangListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var sms_getLangList = app.lookup("sms_getLangErrorList") ;
	var locale = dataManager.getLocale();
	sms_getLangList.action = "data/lang/lang_error_"+locale+".json";	
	sms_getLangList.send();	
}

//
function onSms_getLangListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	var dsLangList = app.lookup("LangList");
	for(var i=0; i < dsLangList.getRowCount(); i++){	
		var row = dsLangList.getRow(i);
		languageMap.set(row.getValue("Key"),row.getValue("Value"));
	}
	
	app.lookup("VMSRP_opbTitle").value = languageMap.get("Str_FaceRegistManagementTitle");
	app.lookup("VMSRP_opbPhotoGuide").value = languageMap.get("Str_VisitorPhotoRegistGuide");
	app.lookup("VMSRP_btnCapture").value = languageMap.get("Str_TakePhoto");
}



//
function onSms_getLangErrorListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getLangErrorList = e.control;
	
}

//
function onSms_getLangErrorListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getLangErrorList = e.control;
	var dsLangErrorList = app.lookup("LangErrorList");	
	for(var i=0; i < dsLangErrorList.getRowCount(); i++){
		var row = dsLangErrorList.getRow(i);
		languageMap.set(row.getValue("Key"),row.getValue("Value"));
	}	
}

var rotateAngle = 0;
function rotateImage( direction){
	
	var imgPhoto = app.lookup("VMSRP_imgNoPhoto");
	
	if (direction == 0) {
		rotateAngle -= 90;
	} else {
		rotateAngle += 90;
	}
	imgPhoto.style.css({"transform": "rotate("+rotateAngle+"deg)"});
		    		    	
	var dmVisitorInfo = app.lookup("VisitorInfo");
	var imgData = dmVisitorInfo.getValue("Photo");	
	
	var tempImage = new Image();
	tempImage.src = 'data:image/png;base64,'+imgData;
        
    tempImage.onload = function () {
		var canvas = document.getElementById("captureCanvas2");
				    	
		var canvasMax = this.width;
		if( canvasMax < this.height ){canvasMax = this.height}
		
		canvas.width = canvasMax;
		canvas.height = canvasMax;
		
		var ctx = canvas.getContext("2d");
		ctx.save();
	    	
		var hRatio = canvas.width / this.width;
		var vRatio = canvas.height / this.height;
		var ratio  = Math.min ( hRatio, vRatio );
		var centerShift_x = ( canvas.width - this.width*ratio ) / 2;
	   	var centerShift_y = ( canvas.height - this.height*ratio ) / 2;
	
		
				ctx.rotate(-0.5 * Math.PI);
            	ctx.translate(-canvas.width, 0); 
		
		
		/*
		if (direction == 0) {
			ctx.rotate(-0.5 * Math.PI);
            ctx.translate(-canvas.width, 0);
		}else{
			ctx.rotate(0.5 * Math.PI);
	        ctx.translate(0, -canvas.height);  
		}
		* */
	 			    
		ctx.drawImage(this, 0,0, this.width, this.height,
			centerShift_x,centerShift_y,this.width*ratio, this.height*ratio);	    	
	    	
		var imageSrc = canvas.toDataURL("image/jpeg");
		var imageData = imageSrc.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");	
	
		canvas.width = 0;
		canvas.height = 0;	
		ctx.clearRect(0, 0, this.width, this.height);
		ctx.beginPath();			
		ctx.restore();
	
		//var dmVisitorInfo = app.lookup("VisitorInfo");
		dmVisitorInfo.setValue("Photo", imageData);
    }			   
}
// 
function onVMSRP_btnRotateLeftClick(/* cpr.events.CMouseEvent */ e){
	rotateImage(0);
}
//
function onVMSRP_btnRotateRightClick(/* cpr.events.CMouseEvent */ e){
	rotateImage(1);
}
