/************************************************
 * webCamCapture.js
 * Created at 2018. 10. 16. 오전 10:10:13.
 *
 * @author fois
 ************************************************/

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){	
	
	navigator.getWebcam = (navigator.getUserMedia || navigator.webKitGetUserMedia || navigator.moxGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
	// unfined 나오는 경우 웹캠 허용 주소가 잘못 잡혀 있어서 그럼
	if (navigator.mediaDevices.getUserMedia) {
		navigator.mediaDevices.getUserMedia({ video: true })
		.then(function (stream) {
			window.localStream = stream;
  			//document.querySelector('video').src = URL.createObjectURL(stream);            
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
 }
 
/*
 * "캡쳐" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSWCV_btnCaptureClick(/* cpr.events.CMouseEvent */ e){	
	/** 
	 * @type cpr.controls.Button
	 */ 
	var uSWCV_btnCapture = e.control;
	
	var video = document.getElementById('cameraPreview');
	
	var canvas = document.getElementById("captureCanvas");
	var ctx = canvas.getContext('2d');
	ctx.drawImage(video, 0,0, canvas.width, canvas.height);
}

/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShlCaptureCanvasLoad(/* cpr.events.CUIEvent */ e){
		/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl1 = e.control;
	var content = e.content;
	content.innerHTML = "<canvas width=\"320px\" height=\"320px\" id=\"captureCanvas\"></canvas>";	
}

/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShlCameraPreviewLoad(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shlCameraPreview = e.control;
	var content = e.content;
	content.innerHTML = "<video width=\"320px\" height=\"320px\" id=\"cameraPreview\" controls autoplay></video>";
	
}


/*
 * "선택" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSWCV_btnSelectClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var uSWCV_btnSelect = e.control;
	
	var canvas = document.getElementById("captureCanvas");	
	var dataURI = canvas.toDataURL("image/jpeg");
	
	var handleStop = function(stream) {
	    document.querySelector('video').srcObject.getTracks().forEach(function(track){
	    	track.stop();
	    	app.close(dataURI);
		});
	};
	  	
	navigator.mediaDevices.getUserMedia({video: true})
		.then(handleStop);	
}
