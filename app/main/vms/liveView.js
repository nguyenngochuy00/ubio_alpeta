/************************************************
 * liveView.js
 * Created at 2020. 10. 30. 오전 10:20:08.
 *
 * @author fois
 ************************************************/
var oWebControl = null; // WebControl Object
var initCount = 0;

var msgObj={};
	msgObj.pluginNotStart = "The plugin is not started. Starting it now… Please wait.";
	msgObj.pluginStartFail = "Starting plugin failed. Please check if the plugin is installed.";
	msgObj.appkeyIsEmpty = "The appKey is required.";
	msgObj.secretIsEmpty = "The secret key is required.";
	msgObj.ipIsEmpty = "The IP address is required.";
	msgObj.portIsEmpty = "The port is required.";
	msgObj.portIsError = "Incorrect port.";
	msgObj.cameraNoIsEmpty = "The camera ID is required.";
	msgObj.timeIsError = "Incorrect time format.";
	
function onBodyLoad(/* cpr.events.CEvent */ e){
	document.title = localStorage.Str_LiveView;
	
	app.lookup("VMSLV_btnStartPlay").value = localStorage.Str_Play;
	app.lookup("VMSLV_btnStopPlay").value = localStorage.Str_Stop;
	
	var cmbCameraList = app.lookup("VMSLV_cmbCameraList");
	var cameraList = JSON.parse(localStorage.cameraList);
	cmbCameraList.addItem(new cpr.controls.Item("----",-1));
	Object.keys(cameraList).forEach(function(cameraInfo){		
    	cmbCameraList.addItem(new cpr.controls.Item(cameraList[cameraInfo].CameraName,cameraList[cameraInfo].CameraID));
	});
	cmbCameraList.selectItem(0);
	
	//initPlugin();
}

/*
 * 루트 컨테이너에서 unload 이벤트 발생 시 호출.
 * 앱이 언로드된 후 발생하는 이벤트입니다.
 */
function onBodyUnload(/* cpr.events.CEvent */ e){
	oWebControl.JS_RequestInterface({funcName: "stopAllPreview"}).then(function (oData) {});
	oWebControl.JS_RequestInterface({funcName: "uninit"}).then(function (oData) {});
	console.log("close");
}

exports.initData = function(obj){
	var dmConnectionInfo = app.lookup("ConnectionInfo");
	
	for(var n in obj){
  		dmConnectionInfo.setValue( String(n),String(obj[n]));
	}
	initPlugin();
}

function initPlugin () {
	oWebControl = new WebControl({
		szPluginContainer: "playWnd",
		iServicePortStart: 17010,
		iServicePortEnd: 17019,
		szClassId:"DD55D830-A127-49bd-944C-36AF7CCB245A",
		cbConnectSuccess: function () {
			setCallbacks();
			
			oWebControl.JS_StartService("window", {
				dllPath: "WebInterLayer.dll"
			}).then(function () {
				console.log("start service");
				
				oWebControl.JS_CreateWnd("playWnd", 880, 552).then(function () {
					processInit();
					console.log("JS_CreateWnd success");
				});
			}, function () {
				// start service failed
			});			
		},
		cbConnectError: function () {
			console.log("cbConnectError");
			oWebControl = null;
			$("#playWnd").html(msgObj.pluginNotStart);
            WebControl.JS_WakeUp("HCVideoSDKWebControl://");
			initCount ++;
			if (initCount < 3) {
				setTimeout(function () {
					initPlugin();
				}, 3000)
			} else {
				$("#playWnd").html(msgObj.pluginStartFail);
			}
		},
		cbConnectClose: function () {
			console.log("cbConnectClose");
			oWebControl = null;
		}
	});
}

function processInit(){
	var dmConnectionInfo = app.lookup("ConnectionInfo");
	
	oWebControl.JS_RequestInterface({
		funcName: "init",
		argument: JSON.stringify({
			appkey: dmConnectionInfo.getValue("appkey"), //"26104493",
			secret: dmConnectionInfo.getValue("secret"), //"zk1h7oteDRoFqeIFgwJX",
			ip: dmConnectionInfo.getValue("ip"), 
			playMode: 0, // playback
			port: Number(dmConnectionInfo.getValue("port")), //443,
			//snapDir: snapDir,
			layout: "2x2"
		})
		
	}).then(function (oData) {
		//showCBInfo(JSON.stringify(oData ? oData.responseMsg : ''));
		console.log(oData.responseMsg);
	});
}

function setCallbacks() {
    oWebControl.JS_SetWindowControlCallback({
        cbIntegrationCallBack: cbIntegrationCallBack
    });
}
	
 function cbIntegrationCallBack(oData) {
    console.log(JSON.stringify(oData.responseMsg));
}

//
function onVMSLV_shlPlayerLoad(/* cpr.events.CUIEvent */ e){
	/** @type cpr.controls.UIControlShell	 */
	var vMSLV_shlPlayer = e.control;	
	var content = e.content;
	content.innerHTML = "<div id=\"playWnd\" class=\"playWnd\"></div>";
}


/*
 * "Button" 버튼(VMSLV_btnStartPlay)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVMSLV_btnStartPlayClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var vMSLV_btnStartPlay = e.control;
	var cameraIndexCode  = "1";	
	var streamMode = 0; //0 main, 1:sub, 2 :third
    var transMode = 1; // 1 TCP 0 UDP
    var gpuMode = 0; //0 disable 1 enable gpu accelarate
    var windowID = 0;  // 0~3 total 4 window
    var viewMode = 1; //1 selected 2 custom
    
    var cmbCameraList = app.lookup("VMSLV_cmbCameraList");
    console.log(cmbCameraList.value);
    if(cmbCameraList.value == -1) {
    	return;
    }
    cameraIndexCode = cmbCameraList.value
  
    oWebControl.JS_RequestInterface({
        funcName: "startPreview",
        argument: JSON.stringify({
            cameraIndexCode: cameraIndexCode,
            streamMode: streamMode,            
            transMode: transMode,
            gpuMode: gpuMode,
            windowID: viewMode == 1 ? -1 : windowID
        })
    }).then(function (oData) {
        console.log(JSON.stringify(oData ? oData.responseMsg : ''));
    }, function () {
    	console.log("play failed");
				// start service failed
	});		
}

//
function onVMSLV_btnStopPlayClick(/* cpr.events.CMouseEvent */ e){
	oWebControl.JS_RequestInterface({funcName: "stopAllPreview"}).then(function (oData) {});
}
