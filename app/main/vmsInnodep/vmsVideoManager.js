/************************************************
 * vmsVideoManager.js
 * Created at 2020. 5. 29. 오후 2:39:06.
 *
 * @author union
 ************************************************/
/*
{
	"runtime-lib" : [	
	
		"/thirdparty/html2canvas/html2canvas.min.js",
		"/thirdparty/jspdf/jspdf.min.js",	
		"/thirdparty/echart/echarts.min.js",
		"/thirdparty/chartjs/Chart.min.js",
		"/thirdparty/sheetjs/xlsx.full.min.js",
		"/thirdparty/timeline/jquery-3.3.1.min.js",
		"/thirdparty/timeline/vis.min.js",
		"/thirdparty/timeline/bootstrap-year-calendar.js",
		"/thirdparty/exifjs/exif.js",
		"http://112.219.69.210:16789/media/api/public/scripts/dms-video-player.min.js"
		
	],
	"runtime-css" : [
		"/theme/theme.less"
	]
} 
*/
var languageMap = new Map();

var ptzSpeed = 4;

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;	


var itgrm_version;

var MAX_DEIVCE_CNT =100;
 
var curDevSerial ;
var curChannel;
var curMedia;

var ptzCameraSerial = 0;
var ptzMoveDirection = 14;


var userName = "sdk";
var userPw = "Innodep1@";

var authToken = "";
var apiSerial = 0;
var userSerial = 0;

var deviceAddr = "112.219.69.210";
var devicePort = "16118";

var lic = "licAccessControl";
var group = 'group1';

var vms_id = "";

//var mediaStreamVideo = "ws://112.219.69.210:16789/media/api/v1/stream";
//var dmsVideoPlayerURL = 'http://112.219.69.210:16789/media/api/public/scripts/dms-video-player.min.js';

var mediaStreamVideo = "ws://192.168.123.201:8080/media/api/v1/stream";
//var dmsVideoPlayerURL = "http://192.168.123.200:8080/media/api/public/scripts/dms-video-player.min.js";


var dmsVideoPlayerURL = "http://192.168.123.201:8080/media/api/public/scripts/dms-video-player.min.js";


var deviceList = null;

var deviceSelected = -1;

var deviceSelectedPlayer = null;

var dmsVideoPlayer = null;

function deviceStruct() {
	var deviceName = "";
	var channelName = "";
	var deviceSerial = 0;
	var channelSerial = 0;
	var channelMediaSerial = 0;
	var rtspUrl = "";
}



exports.getDmsVideoPlayerURL= function() {
	return dmsVideoPlayerURL; 
}	

exports.getMediaStreamVideo= function() {
	return mediaStreamVideo; 
}	

exports.getVmsDeviceList= function() {
	return deviceList; 
}	

exports.getVmsDeviceAddr = function() {
	return deviceAddr; 
}	

exports.getVmsDevicePort = function() {
	return devicePort; 
}	

exports.getVmsAuthToken = function() {
	return authToken; 
}	

exports.getVmsApiSerial = function() {
	return apiSerial; 
}	

exports.getVmsUserSerial = function() {
	return userSerial; 
}	

exports.getVmsId= function() {
	return vms_id; 
}	

exports.getVmsLic= function() {
	return lic; 
}	

exports.getVmsGroup= function() {
	return group; 
}	

exports.getVmsUserName= function() {
	return userName; 
}	

exports.getVmsUserPw= function() {
	return userPw; 
}	



exports.setVms1x1= function() {
	
	
	var emb = app.lookup("eaVideo");
	var src = "app/main/vmsInnodep/vmsVideo1x1" + "?" + itgrm_version;
	
	var embAppIns = emb.getEmbeddedAppInstance();
	cpr.core.App.load(src, function(loadedApp) { 
		
		emb.app = loadedApp;
	});		
}	


exports.setVmsDmsVideoPlayer= function(player) {
	dmsVideoPlayer = player; 
	
	console.log("setVmsDmsVideoPlayer player: " + player);
	
}

exports.setVmsSelectDevicePlayer= function(player) {
	deviceSelectedPlayer = player; 
	
	console.log("setVmsSelectDevicePlayer player: " + player);
	
	
}

exports.setVmsSelectDevice= function(idx) {
	
	console.log("setVmsSelectDevice idx: " + idx);
	
	
	deviceSelected = idx; 

	var grd_DeviceList = app.lookup("grd_DeviceList");
	
	grd_DeviceList.selectRows(idx, false);
	
	grd_DeviceList.focusCell(grd_DeviceList.getSelectedRowIndex(), 0);
	
	grd_DeviceList.redraw();	
	
}	


exports.getVmsSelectDevice= function() {
	return deviceSelected; 
}	



function getParameters(search) {
	var obj = {};
	var uri = decodeURI(search);
	uri = uri.slice(1, uri.length);
	var param = uri.split('&');
    for (var i = 0; i < param.length; i++) {
        var devide = param[i].split('=');
        obj[devide[0]] = devide[1];
    }
    return obj;
}

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	console.log("vmsVideoManager::onBodyLoad");
	
	window.opener.postMessage("initReq");
	
	var OptionInnodep = app.lookup("OptionInnodep");
	var AdditionalInfo = app.lookup("additionalInfo");
	
	window.addEventListener("message", function(event) {
        var data = event.data;
        if(data.type == "initData") {
        	console.log("initData옴")
        	console.log(data.value);
        	
	        OptionInnodep.setValue("ServerIP", data.value.OptionInnodep.ServerIP);
	        OptionInnodep.setValue("ServerPort", data.value.OptionInnodep.ServerPort);
	        OptionInnodep.setValue("UserID", data.value.OptionInnodep.UserID);
	        OptionInnodep.setValue("UserPW", data.value.OptionInnodep.UserPW);
	        OptionInnodep.setValue("License", data.value.OptionInnodep.License);
	        OptionInnodep.setValue("UseRecording", data.value.OptionInnodep.UseRecording);
	        OptionInnodep.setValue("RegularRecording", data.value.OptionInnodep.RegularRecording);
	        OptionInnodep.setValue("BeforeRecordingTime", data.value.OptionInnodep.BeforeRecordingTime);
	        OptionInnodep.setValue("AfterRecordingTime", data.value.OptionInnodep.AfterRecordingTime);
	        OptionInnodep.setValue("PlayerServerIP", data.value.OptionInnodep.PlayerServerIP);
	        OptionInnodep.setValue("PlayerServerPort", data.value.OptionInnodep.PlayerServerPort);
	        
	        AdditionalInfo.setValue("authToken", data.value.AdditionalInfo.authToken);
	        AdditionalInfo.setValue("apiSerial", data.value.AdditionalInfo.apiSerial);
	        AdditionalInfo.setValue("userSerial", data.value.AdditionalInfo.userSerial);
	        AdditionalInfo.setValue("vmsID", data.value.AdditionalInfo.vmsID);
	        AdditionalInfo.setValue("mediaStreamVideo", data.value.AdditionalInfo.mediaStreamVideo);
	        AdditionalInfo.setValue("dmsVideoPlayerURL", data.value.AdditionalInfo.dmsVideoPlayerURL);
	        
	        authToken = AdditionalInfo.getValue("authToken") ;  
		  	apiSerial = AdditionalInfo.getValue("apiSerial") ;   
		  	userSerial = AdditionalInfo.getValue("userSerial") ;   
		  	deviceAddr = OptionInnodep.getValue("ServerIP") ;   
		  	devicePort = OptionInnodep.getValue("ServerPort") ;   
		  	lic = OptionInnodep.getValue("License") ;   
		  	group = "group1" ;   
		  	vms_id = AdditionalInfo.getValue("vmsID") ;   
		  	userName = OptionInnodep.getValue("UserID") ;   
		  	userPw = OptionInnodep.getValue("UserPW") ; 	
		  	mediaStreamVideo = AdditionalInfo.getValue("mediaStreamVideo");
		  	dmsVideoPlayerURL = AdditionalInfo.getValue("dmsVideoPlayerURL");
        } 
    }, false);

	//alert("vmsVideoManager::onBodyLoad");

	//var btnVideo = e.control;
	
	dataManager = getDataManager();
	comLib = createComUtil(app);	

	
	var i = 0;

	
	deviceList = new Array(MAX_DEIVCE_CNT);
	for (i = 0; i < MAX_DEIVCE_CNT; i++) {
		deviceList[i] = new deviceStruct();
//		console.log("init deviceList index: " + i)
	}	
	
	
	/*
	
	var hostApp = app.getHostAppInstance();
	authToken = hostApp.callAppMethod("getVmsAuthToken");	
	apiSerial = hostApp.callAppMethod("getVmsApiSerial");	
	userSerial = hostApp.callAppMethod("getVmsUserSerial");	
	deviceAddr = hostApp.callAppMethod("getVmsDeviceAddr");	
	devicePort = hostApp.callAppMethod("getVmsDevicePort");	
	lic = hostApp.callAppMethod("getVmsLic");
	group = hostApp.callAppMethod("getVmsGroup");
	vms_id = hostApp.callAppMethod("getVmsId");
	userName = hostApp.callAppMethod("getVmsUserName");
	userPw = hostApp.callAppMethod("getVmsUserPw");
	
	*/
	
	
	var obj = getParameters(window.location.search);
   	//app.lookup("reportPageSet").build(obj);
   	//app.lookup("smsSetData").build(obj);   	   
   	
	/*
   	authToken = obj["authToken"] ;  
  	apiSerial = obj["apiSerial"] ;   
  	userSerial = obj["userSerial"] ;   
  	deviceAddr = obj["deviceAddr"] ;   
  	devicePort = obj["devicePort"] ;   
  	lic = obj["lic"] ;   
  	group = obj["group"] ;   
  	vms_id = obj["vms_id"] ;   
  	userName = obj["userName"] ;   
  	userPw = obj["userPw"] ; 	
	
	*/
	
	var head= document.getElementsByTagName('head')[0];
	var script= document.createElement('script');
	script.type= 'text/javascript';
	script.src= dmsVideoPlayerURL;
	head.appendChild(script);	

				
	
	language = obj["locale"];	
	
	console.log("#### language #### ==> " + language);
	
	dataManager.setLocale(language);	
		
	var sms_getLangList = app.lookup("sms_getLangList") ;
	sms_getLangList.action = "data/lang/lang_"+language+".json";		
	sms_getLangList.send();						
				
				
	//getDeviceList();
	
	
	
	
}




 function getDeviceList(){
	var reqUrl = "http://" + deviceAddr + ":" + devicePort + "/api/device/list/" + userSerial + "/0?dev_only=true";
	httpGetDeviceListAsync(reqUrl, httpGetDeviceListAsyncCallback);
}



function httpGetDeviceListAsync(theUrl, callback) { //theURL or a path to file
	var httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = function() {
		if (httpRequest.readyState == 4 && httpRequest.status == 200) {
			var data = httpRequest.responseText; //if you fetch a file you can JSON.parse(httpRequest.responseText)
			if (callback) {
				callback(data);
			}
		}
	};

	httpRequest.open('GET', theUrl, true);

	httpRequest.setRequestHeader('x-account-id', userName);
	httpRequest.setRequestHeader('x-account-pass', userPw);
	httpRequest.setRequestHeader('x-account-group', group);
	httpRequest.setRequestHeader('x-license', lic);
	httpRequest.setRequestHeader('x-auth-token', authToken);
	httpRequest.setRequestHeader('x-api-serial', apiSerial);
	apiSerial = apiSerial + 1;
	httpRequest.send(null);

}

function httpGetDeviceListAsyncCallback(data) {
	var jsonContent = JSON.parse(data);
	console.log(jsonContent);
	for (var i = 0; i < MAX_DEIVCE_CNT; i++) {
		deviceList[i].deviceSerial = -1;
		deviceList[i].rtspUrl = "";
	}
	
	var grd_DeviceList = app.lookup("grd_DeviceList");
	
	var dsDeviceList = app.lookup("dsDeviceList");
	dsDeviceList.clear();
		
 	var rowIndex = 0;

	for (var i = 0; i < jsonContent.results.tree.length; i++) {
		console.log(i + ". " + jsonContent.results.tree[i].dev_serial + "/" + jsonContent.results.tree[i].dev_name);
		if (i < MAX_DEIVCE_CNT) {
			deviceList[i].deviceName = jsonContent.results.tree[i].dev_name;
			deviceList[i].deviceSerial = jsonContent.results.tree[i].dev_serial;
			deviceList[i].rtspUrl = "";
			getDeviceInfo(deviceList[i].deviceSerial);
			//var camId = 'cam0' + (i + 1);
			//document.getElementById(camId).innerText = jsonContent.results.tree[i].dev_name;
			
			dsDeviceList.addRow();
			
			dsDeviceList.setValue(rowIndex, "deviceName", deviceList[i].deviceName);
			dsDeviceList.setValue(rowIndex, "deviceSerial", deviceList[i].deviceSerial);
			dsDeviceList.setValue(rowIndex, "rtspUrl", deviceList[i].rtspUrl);
			
			console.log(dsDeviceList.getRowDataRanged());
			
			/*
			createVideo(i, deviceList[i].deviceSerial,
		 	deviceList[i].channelSerial, 
		 	deviceList[i].channelMediaSerial);
	
	
			if(null != player[i])
			{
				dmsVideoPlayer.streamPlay(player[i]);
			}
			*/
			
			rowIndex++;
		}
	}
	
	
	
	
	
	//grd_DeviceList = app.lookup("grd_DeviceList");
	grd_DeviceList.redraw();
	

	var emb = app.lookup("eaVideo");
	var src = "app/main/vmsInnodep/vmsVideo3x3" + "?" + itgrm_version;
	
	var embAppIns = emb.getEmbeddedAppInstance();
	cpr.core.App.load(src, function(loadedApp) { 
		
		emb.app = loadedApp;
	});	
	emb.redraw();	
}


function httpGetDeviceInfoAsync(theUrl, callback) { //theURL or a path to file
	var httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = function() {
		if (httpRequest.readyState == 4 && httpRequest.status == 200) {
			var data = httpRequest.responseText; //if you fetch a file you can JSON.parse(httpRequest.responseText)
			if (callback) {
				callback(data);
			}
		}
	};

	httpRequest.open('GET', theUrl, false);

	httpRequest.setRequestHeader('x-account-id', userName);
	httpRequest.setRequestHeader('x-account-pass', userPw);
	httpRequest.setRequestHeader('x-account-group', group);
	httpRequest.setRequestHeader('x-license', lic);
	httpRequest.setRequestHeader('x-auth-token', authToken);
	httpRequest.setRequestHeader('x-api-serial', apiSerial);
	apiSerial = apiSerial + 1;
	httpRequest.send(null);
}

function httpGetDeviceInfoAsyncCallback(data) {
	var jsonContent = JSON.parse(data);
	console.log(jsonContent);

	for (var i = 0; i < MAX_DEIVCE_CNT; i++) {
		if (jsonContent.results[0].dev_serial == deviceList[i].deviceSerial) {
			for (var j = 0; j < jsonContent.results[0].dch.length; j++) {
				if (jsonContent.results[0].dch[j].dch_ch == 0 /*media*/ ) {
					deviceList[i].channelName = jsonContent.results[0].dch[j].dch_name;
					deviceList[i].channelSerial = jsonContent.results[0].dch[j].dch_ch;
					deviceList[i].channelMediaSerial = jsonContent.results[0].dch[j].med[0].dchm_serial;
					
					/*
					createVideo(i, deviceList[i].deviceSerial,
				 	deviceList[i].channelSerial, 
				 	deviceList[i].channelMediaSerial);
		
	
					if(null != player[i])
					{
						dmsVideoPlayer.streamPlay(player[i]);
					}
					*/
					
					break;
				}
			}
		}
	}
}

function getDeviceInfo(deviceSerial) {

	var reqUrl = "http://" + deviceAddr + ":" + devicePort + "/api/device/info/" + deviceSerial;
	httpGetDeviceInfoAsync(reqUrl, httpGetDeviceInfoAsyncCallback);
}






/*
 * "1" 버튼(btnChannel_1)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnChannel_1Click(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnChannel_1 = e.control;
	
	
	var emb = app.lookup("eaVideo");
	var src = "app/main/vmsInnodep/vmsVideo1x1" + "?" + itgrm_version;
	
	var embAppIns = emb.getEmbeddedAppInstance();
	cpr.core.App.load(src, function(loadedApp) { 
		
		emb.app = loadedApp;
	});		
}


/*
 * "4" 버튼(btnChannel_4)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnChannel_4Click(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnChannel_4 = e.control;
	
	var emb = app.lookup("eaVideo");
	var src = "app/main/vmsInnodep/vmsVideo2x2" + "?" + itgrm_version;
	
	var embAppIns = emb.getEmbeddedAppInstance();
	cpr.core.App.load(src, function(loadedApp) { 
		
		emb.app = loadedApp;
	});	
	
}


/*
 * "9" 버튼(btnChannel_9)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnChannel_9Click(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnChannel_9 = e.control;
	
	var emb = app.lookup("eaVideo");
	var src = "app/main/vmsInnodep/vmsVideo3x3" + "?" + itgrm_version;
	
	var embAppIns = emb.getEmbeddedAppInstance();
	cpr.core.App.load(src, function(loadedApp) { 
		
		emb.app = loadedApp;
	});	
	
}


/*
 * 그리드에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGrd_DeviceListClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var grd_DeviceList = e.control;
	
	console.log("onGrd_DeviceListClick");
	

	var Selected = grd_DeviceList.getSelectedRowIndex();
	if( -1 == Selected || deviceSelected == Selected)
		return;
		
	deviceSelected = Selected;
	
	
	var emb = app.lookup("eaVideo");
	var src = "app/main/vmsInnodep/vmsVideo1x1" + "?" + itgrm_version;
	
	var embAppIns = emb.getEmbeddedAppInstance();
	cpr.core.App.load(src, function(loadedApp) { 
		
		if (embAppIns && embAppIns.hasAppMethod("VideoReload")) { 
			embAppIns.callAppMethod("VideoReload");
		}
	
		emb.app = loadedApp;
	});					
	
	
}


/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onGrd_DeviceListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var grd_DeviceList = e.control;
	
	console.log("onGrd_DeviceListSelectionChange");
	

	var Selected = grd_DeviceList.getSelectedRowIndex();
	if( -1 == Selected || deviceSelected == Selected)
		return;
		
	deviceSelected = Selected;
	
	
	var emb = app.lookup("eaVideo");
	var src = "app/main/vmsInnodep/vmsVideo1x1" + "?" + itgrm_version;
	
	var embAppIns = emb.getEmbeddedAppInstance();
	cpr.core.App.load(src, function(loadedApp) { 
		
		if (embAppIns && embAppIns.hasAppMethod("VideoReload")) { 
			embAppIns.callAppMethod("VideoReload");
		}
	
		emb.app = loadedApp;
	});				
	
}


/*
 * 그리드에서 dblclick 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 더블 클릭할 때 발생하는 이벤트.
 */
function onGrd_DeviceListDblclick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var grd_DeviceList = e.control;

}


/*
 * "Test1" 버튼(btnTest1)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnTest1Click(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnTest1 = e.control;

	var reqUrl = "http://" + deviceAddr +":"+devicePort + "/api/device/function/change-recording-schedule/" + deviceList[0].deviceSerial;
	httpChangeRecordingScheduleAsync(reqUrl, httpChangeRecordingScheduleAsyncCallback);	
}


// http://127.0.0.1/api/device/function/change-recording-schedule/100001
function httpChangeRecordingScheduleAsync(theUrl, callback) { 
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var data = httpRequest.responseText;  //if you fetch a file you can JSON.parse(httpRequest.responseText)
            if (callback) {
                callback(data);
            }                   
        }
    };
    
    console.log("httpChangeRecordingScheduleAsync theUrl: " + theUrl);
    
    httpRequest.open('PUT', theUrl, true); 

    httpRequest.setRequestHeader('x-auth-token', authToken);
    httpRequest.setRequestHeader('x-api-serial', apiSerial);
   
 
    httpRequest.send(null);
}

 function httpChangeRecordingScheduleAsyncCallback(data){
    var jsonContent = JSON.parse(data);

    console.log(jsonContent);
}




/*
 * "top" 버튼(btnPtzTop)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnPtzTopClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnPtzTop = e.control;
	
	console.log("btnPtzTop");
	console.log("deviceSelectedPlayer: " + deviceSelectedPlayer);
		
	dmsVideoPlayer.ptzUp(deviceSelectedPlayer, ptzSpeed);
	
	
}


/*
 * "Left" 버튼(btnPtzLeft)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnPtzLeftClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnPtzLeft = e.control;
	
	console.log("btnPtzLeft");
	console.log("deviceSelectedPlayer: " + deviceSelectedPlayer);
		
	dmsVideoPlayer.ptzLeft(deviceSelectedPlayer, ptzSpeed);
	
	
}


/*
 * "Right" 버튼(btnPtzRight)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnPtzRightClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnPtzRight = e.control;
	console.log("btnPtzRight");
	console.log("deviceSelectedPlayer: " + deviceSelectedPlayer);
		
	dmsVideoPlayer.ptzRight(deviceSelectedPlayer, ptzSpeed);
	
}


/*
 * "bottom" 버튼(btnPtzBottom)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnPtzBottomClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnPtzBottom = e.control;
	
	console.log("btnPtzBottom");
	console.log("deviceSelectedPlayer: " + deviceSelectedPlayer);
		
	
	dmsVideoPlayer.ptzDown(deviceSelectedPlayer, ptzSpeed);
	
}


/*
 * "■" 버튼(btnPtzStop)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnPtzStopClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnPtzStop = e.control;
	
	console.log("btnPtzStop");
	console.log("deviceSelectedPlayer: " + deviceSelectedPlayer);
		
	dmsVideoPlayer.ptzStop(deviceSelectedPlayer);
	
}


/*
 * "z" 버튼(btnPtzZoomOut)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnPtzZoomOutClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnPtzZoomOut = e.control;
	
	console.log("onBtnPtzZoomOutClick");
	console.log("deviceSelectedPlayer: " + deviceSelectedPlayer);
	
	dmsVideoPlayer.ptzZoomOut(deviceSelectedPlayer);	
}


/*
 * "■" 버튼(btnZoomStop)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnZoomStopClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnZoomStop = e.control;
	console.log("onBtnZoomStopClick");
	console.log("deviceSelectedPlayer: " + deviceSelectedPlayer);
		
	dmsVideoPlayer.ptzStop(deviceSelectedPlayer);		
}


/*
 * "Z" 버튼(btnZoomIn)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnZoomInClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnZoomIn = e.control;
	
	console.log("onBtnZoomInClick");
	console.log("deviceSelectedPlayer: " + deviceSelectedPlayer);
	
	dmsVideoPlayer.ptzZoomIn(deviceSelectedPlayer);		
}


/*
 * "○" 버튼(btnFocusIn)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnFocusInClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnFocusIn = e.control;
	
	console.log("btnFocusIn");
	console.log("deviceSelectedPlayer: " + deviceSelectedPlayer);
		
	
	dmsVideoPlayer.ptzFocusIn(deviceSelectedPlayer);		
}


/*
 * "■" 버튼(btnFocusStop)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnFocusStopClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnFocusStop = e.control;
	
	console.log("btnFocusStop");
	console.log("deviceSelectedPlayer: " + deviceSelectedPlayer);
		
	
	dmsVideoPlayer.ptzStop(deviceSelectedPlayer);
}


/*
 * "●" 버튼(btnFocusOut)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnFocusOutClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnFocusOut = e.control;
	
	console.log("btnFocusOut");
	console.log("deviceSelectedPlayer: " + deviceSelectedPlayer);
		
	
	dmsVideoPlayer.ptzFocusOut(deviceSelectedPlayer);	
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getLangListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getLangList = e.control;
	
	console.log("#### onSms_getLangListSubmitDone ####");
	
	languageMap.clear();
	
	var dsLangList = app.lookup("LangList");
	for(var i=0; i < dsLangList.getRowCount(); i++){	
		var row = dsLangList.getRow(i);
		
		//console.log("value: " + row.getValue("Key"),row.getValue("Value"));
		
		languageMap.set(row.getValue("Key"),row.getValue("Value"));
	}	
	
	var grd_DeviceList = app.lookup("grd_DeviceList");
	grd_DeviceList.header.getColumn(2).setText(languageMap.get("Str_DeviceName"));
	
	console.log("cellCount: " + grd_DeviceList.header.cellCount);
	
	document.title = languageMap.get("Str_RealTimeVideo");
	
	//console.log("Str_DeviceName: " + dataManager.getString("Str_DeviceName"));
	//console.log("Str_RealTimeVideo: " + dataManager.getString("Str_RealTimeVideo"));
	
	grd_DeviceList.redraw();
	
	getDeviceList();
}
