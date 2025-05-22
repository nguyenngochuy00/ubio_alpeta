
/************************************************
 * AuthLogVideoView.js
 * Created at 2019. 1. 9. 오후 5:40:13.
 *
 * @author wonki
 ************************************************/

var oWebControl = null; // WebControl Object
var initCount = 0;
var startTime = null;
var endTime = null;

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
	
var event_time;
var cameraID = [-1,-1,-1,-1];

function onBodyLoad(/* cpr.events.CEvent */ e){
	
	document.title = localStorage.Str_AuthLogVideoView;
	
	app.lookup("ALVVP_btnPlay").value = localStorage.Str_Play;
	//localStorage.removeItem('Str_Play');
	event_time = localStorage.EventTime;
		
	startTime = new Date( 
		parseInt(event_time.substring(0,4)), 
		parseInt(event_time.substring(5,7))-1, 
		parseInt(event_time.substring(8,10)),
	 	parseInt(event_time.substring(11,13)), 
	 	parseInt(event_time.substring(14,16)),
	 	parseInt(event_time.substring(17,19))	);
	endTime = new Date( 
		parseInt(event_time.substring(0,4)), 
		parseInt(event_time.substring(5,7))-1, 
		parseInt(event_time.substring(8,10)),
	 	parseInt(event_time.substring(11,13)), 
	 	parseInt(event_time.substring(14,16)),
	 	parseInt(event_time.substring(17,19))	);
	
	startTime.setSeconds(startTime.getSeconds()-5);
	endTime.setSeconds(endTime.getSeconds()+5);
	
	var cameraList = JSON.parse(localStorage.terminalCameraList);	
	var offset  = 0;
	Object.keys(cameraList).forEach(function(cameraInfo){
    	if( offset <4  ){
    		cameraID[offset]=cameraList[cameraInfo].CameraID;    		
    		offset++;  		
    	}
	});
		
	initPlugin();
	
	
	/*
	 1. Initialize 호출
	    app key
	    secret key
	    api gateway ip address
	    api gateway port 443
	    * 
	 2. Start Playback 호출
	    camera id
	    playback start
	    playback end
	    storage location
	    Transfer Protocol
	    Gpu hardware decoding
	    playback window
	 */	
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
			playMode: 1, // playback
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
	
// 쉘에서 load 이벤트 발생 시 호출.
function onALVVP_shlPlayer1Load(/* cpr.events.CUIEvent */ e){
	/** @type cpr.controls.UIControlShell	 */
	var aLVVP_shlPlayer1 = e.control;
	var content = e.content;
	content.innerHTML = "<div id=\"playWnd\" class=\"playWnd\"></div>";
	console.log("onALVVP_shlPlayer1Init");
}

function dateFormat(fmt, date) { // date를 date obj로 받는다
    var ret = "";    
    var opt = {
        'Y+': date.getFullYear().toString(),  
        'm+': (date.getMonth() + 1).toString(),
        'd+': date.getDate().toString(), 
        'H+': date.getHours().toString(),
        'M+': date.getMinutes().toString(),
        'S+': date.getSeconds().toString()
        
    };
    for (var k in opt) {
        ret = new RegExp('(' + k + ')').exec(fmt);
        if (ret) {
            fmt = fmt.replace(
                ret[1],
                ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, '0')
            )
        }
    }
    return fmt;
}

function dateFormatZ(fmt, date) { // date를 문자로 입력 받는다
    var ret = "";
    date = new Date(date);
    var opt = {
        'Y+': date.getFullYear().toString(),  
        'm+': (date.getMonth() + 1).toString(),
        'd+': date.getDate().toString(), 
        'H+': date.getHours().toString(),
        'M+': date.getMinutes().toString(),
        'S+': date.getSeconds().toString()
        
    };
    for (var k in opt) {
        ret = new RegExp('(' + k + ')').exec(fmt);
        if (ret) {
            fmt = fmt.replace(
                ret[1],
                ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, '0')
            )
        }
    }
    return fmt;
}

// * 버튼(ALVVP_btnPlay)에서 click 이벤트 발생 시 호출.
function onALVVP_btnPlayClick(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Button	 */
	var aLVVP_btnPlay = e.control;
	
	var cameraIndexCode  = "1";	
	
    //var startTimeStamp = new Date(dateFormatZ('YYYY-mm-dd HH:MM:SS',"2020-10-13 15:08:37+09:00").replace(new RegExp('-', 'g'), '/')).getTime();
    //var endTimeStamp = new Date(dateFormatZ('YYYY-mm-dd HH:MM:SS',"2020-10-13 15:08:42+09:00").replace(new RegExp('-', 'g'), '/')).getTime();
    var startTimeStamp = startTime.getTime();
    var endTimeStamp = endTime.getTime();
    console.log(startTime, endTime);
            
    var recordLocation = 0; //0 main, 1:Auxiliary
    var transMode = 1; // 1 TCP 0 UDP
    var gpuMode = 0; //0 disable 1 enable gpu accelarate
    var windowID = 0;  // 0~3 total 4 window
    var viewMode = 1; //1 selected 2 custom
    
    for( var i = 0; i < 4; i++){    	
  		if( cameraID[i] != -1){  		
  			console.log(cameraID[i]);
		    oWebControl.JS_RequestInterface({
		        funcName: "startPlayback",
		        argument: JSON.stringify({
		            cameraIndexCode: String(cameraID[i]),
		            startTimeStamp: Math.floor(startTimeStamp / 1000),
		            endTimeStamp: Math.floor(endTimeStamp / 1000),
		            recordLocation: recordLocation,
		            transMode: transMode,
		            gpuMode: gpuMode,
		            windowID: i
		        })
		    }).then(function (oData) {
		        console.log(JSON.stringify(oData ? oData.responseMsg : ''));
		    }, function () {
		    	console.log("play failed");
						// start service failed
			});		
		}
	}
}

exports.initData = function(obj){
	var dmConnectionInfo = app.lookup("ConnectionInfo");
	
	for(var n in obj){
  		dmConnectionInfo.setValue( String(n),String(obj[n]));
	}
}

//
function onBodyUnload(/* cpr.events.CEvent */ e){
	oWebControl.JS_RequestInterface({funcName: "stopAllPlayback"}).then(function (oData) {});
	oWebControl.JS_RequestInterface({funcName: "uninit"}).then(function (oData) {});
	console.log("close");
}
