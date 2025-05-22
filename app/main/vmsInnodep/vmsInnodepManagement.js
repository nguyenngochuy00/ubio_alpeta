/************************************************
 * Management.js
 * Created at 2020. 5. 28. 오후 1:32:21.
 *
 * @author union
 ************************************************/






var dataManager = cpr.core.Module.require("lib/DataManager");
var itgrm_version;

var authToken = "";
var apiSerial = 0;
var userSerial = 0;

var deviceAddr = "112.219.69.210";
var devicePort = "16118";

var userName = "sdk";
var userPw = "Innodep1@";

var lic = "licAccessControl";
var group = 'group1';

var vms_id = "";

var keepAliveTimer = null;

var dmsVideoPlayerServerIP = "";
var dmsVideoPlayerServerPort = 0;

var mediaStreamVideo = "ws://192.168.123.201:8080/media/api/v1/stream";
var dmsVideoPlayerURL = "http://192.168.123.201:8080/media/api/public/scripts/dms-video-player.min.js";

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


exports.getVmsMediaStreamVideo= function() {
	return mediaStreamVideo; 
}	

exports.getVmsDmsVideoPlayerURL= function() {
	return dmsVideoPlayerURL; 
}	


/*

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	dataManager = getDataManager();
	
	console.log("dataManager: " + dataManager);
	
	itgrm_version = dataManager.getSystemVersion();
	//var getGroups = dataManager.getGroup();

	
	
	var smsGetOptionInnodep = app.lookup("smsGetOptionInnodep");
	smsGetOptionInnodep.send();	
	
}


/*
 * "Video" 버튼(btnVideo)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnVideoClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	//var btnVideo = e.control;
	
	
	
	
	/*	
	var itgrm_version;
	
	var authToken = "";
	var apiSerial = 0;
	var userSerial = 0;
	
	var deviceAddr = "112.219.69.210";
	var devicePort = "16118";
	
	var userName = "sdk";
	var userPw = "Innodep1@";
	
	var lic = "licNormalClient";
	var group = 'group1';
	
	var vms_id = "";
	
	var keepAliveTimer = null;
	
	var dmsVideoPlayerServerIP = "";
	var dmsVideoPlayerServerPort = 0;
	
	var mediaStreamVideo = "ws://192.168.123.201:8080/media/api/v1/stream";
	var dmsVideoPlayerURL = "http://192.168.123.201:8080/media/api/public/scripts/dms-video-player.min.js";
	*/	
	
	var locale = dataManager.getLocale();
	
	var OptionInnodep = app.lookup("OptionInnodep");
	var AdditionalInfo = app.lookup("additionalInfo");
	
	AdditionalInfo.setValue("apiSerial", apiSerial);
	AdditionalInfo.setValue("authToken", authToken);
	AdditionalInfo.setValue("userSerial", userSerial);
	AdditionalInfo.setValue("vmsID", vms_id);
	AdditionalInfo.setValue("mediaStreamVideo", mediaStreamVideo);
	AdditionalInfo.setValue("dmsVideoPlayerURL", dmsVideoPlayerURL);
	
	console.log("OptionInnodep : ", OptionInnodep.getDatas());
	
	var address = document.URL.toString() + '/vmsVideoManager?' + '&itgrm_version=' + itgrm_version 
//				+ '&authToken=' + authToken
//				+ '&apiSerial=' + apiSerial 
//				+ '&userSerial=' + userSerial 
//				+ '&deviceAddr=' + deviceAddr
//				+ '&devicePort=' + devicePort 
//				+ '&userName=' + userName 
//				+ '&userPw=' + userPw 
//				+ '&lic=' + lic
//				+ '&group=' + group
//				+ '&dmsVideoPlayerServerIP=' + dmsVideoPlayerServerIP
//				+ '&dmsVideoPlayerServerPort=' + dmsVideoPlayerServerPort
//				+ '&mediaStreamVideo=' + mediaStreamVideo
//				+ '&dmsVideoPlayerURL=' + dmsVideoPlayerURL				
//				+ '&vms_id='+vms_id
				+ '&locale=' + locale;	
				
	var initData = {
		"OptionInnodep" : OptionInnodep.getDatas(),
		"AdditionalInfo": AdditionalInfo.getDatas()
	}
				
//	address = document.URL.toString() + '/vmsVideoManager';
				
	var wp = window.open(address, '_blank', 'width=1100,height=680,resizable=no,location=no,toolbar=no,menubar=no');
	window.addEventListener("message", function(event) {
		console.log(event.data);
	    if (event.data === "initReq") {
			console.log("initReq는 옴")
	        var data = { type: "initData", value:initData};
	        wp.postMessage(data);
	    }
	});
	
	
	
	
	
	return;
	
	/*
	var emb = app.lookup("eaMain");
	var src = "app/main/vmsInnodep/vmsVideoManager" + "?" + itgrm_version;
	
	var embAppIns = emb.getEmbeddedAppInstance();
	cpr.core.App.load(src, function(loadedApp) { 
		if (embAppIns && embAppIns.hasAppMethod("tabCheck")) { //기존 페이지가 
			embAppIns.callAppMethod("tabCheck");
		}
		emb.app = loadedApp;
	});
	*/
	
}


/*
 * "User" 버튼(btnUser)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnUserClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	//var btnUser = e.control;
	
	
	
	var emb = app.lookup("eaMain");
	var src = "app/main/vmsInnodep/vmsUser" + "?" + itgrm_version;
	
	var embAppIns = emb.getEmbeddedAppInstance();
	cpr.core.App.load(src, function(loadedApp) { 
		if (embAppIns && embAppIns.hasAppMethod("tabCheck")) { //기존 페이지가 
			embAppIns.callAppMethod("tabCheck");
		}
		emb.app = loadedApp;
	});	
	
}


/*
 * "Server" 버튼(btnServer)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnServerClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	//var btnServer = e.control;
	
	

	var emb = app.lookup("eaMain");
	var src = "app/main/vmsInnodep/vmsServer" + "?" + itgrm_version;
	
	var embAppIns = emb.getEmbeddedAppInstance();
	cpr.core.App.load(src, function(loadedApp) { 
		if (embAppIns && embAppIns.hasAppMethod("tabCheck")) { //기존 페이지가 
			embAppIns.callAppMethod("tabCheck");
		}
		emb.app = loadedApp;
	});		
}


/*
 * "Camera" 버튼(btnCamera)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnCameraClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	//var btnCamera = e.control;
	

	var emb = app.lookup("eaMain");
	var src = "app/main/vmsInnodep/vmsCamera" + "?" + itgrm_version;
	
	var embAppIns = emb.getEmbeddedAppInstance();
	cpr.core.App.load(src, function(loadedApp) { 
		if (embAppIns && embAppIns.hasAppMethod("tabCheck")) { //기존 페이지가 
			embAppIns.callAppMethod("tabCheck");
		}
		emb.app = loadedApp;
	});		
	
	
}



 function httpLoginAsync(theUrl, callback) { //theURL or a path to file
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var data = httpRequest.responseText;  //if you fetch a file you can JSON.parse(httpRequest.responseText)
            if (callback) {
                callback(data);
            }                   
        }
    };
    
   	console.log("onSmsGetOptionInnodepSubmitDone" );
	console.log("deviceAddr: " + deviceAddr );
	console.log("devicePort: " + devicePort );
	console.log("userName: " + userName );
	console.log("userPw: " + userPw );
	console.log("lic: " + lic );
    
    console.log("theUrl:" + theUrl)

    httpRequest.open('GET', theUrl, true); 

    httpRequest.setRequestHeader('x-account-id', userName);
    httpRequest.setRequestHeader('x-account-pass', userPw);
    httpRequest.setRequestHeader('x-account-group', group);
    httpRequest.setRequestHeader('x-license', lic);
    httpRequest.send(null);
}

 function httpLoginAsyncCallback(data){
    var jsonContent = JSON.parse(data);

    authToken = jsonContent.results.auth_token;
    apiSerial = jsonContent.results.api_serial;
    userSerial = jsonContent.results.user_serial;   
    
    vms_id = jsonContent.results.vms_id;   
       
    console.log('authToken ' ,authToken);
    console.log('apiSerial ' ,apiSerial);
    console.log('userSerial ' ,userSerial);
   
    keepAliveStart();
    
    
	
	/*
	var emb = app.lookup("eaMain");
	var src = "app/main/vmsInnodep/vmsVideoManager" + "?" + itgrm_version;
	
	var embAppIns = emb.getEmbeddedAppInstance();
	cpr.core.App.load(src, function(loadedApp) { 
		if (embAppIns && embAppIns.hasAppMethod("tabCheck")) { //기존 페이지가 
			embAppIns.callAppMethod("tabCheck");
		}
		emb.app = loadedApp;
	});    
    */
	
	onBtnCameraClick2(null);
}




 function httpLogoutAsync(theUrl, callback) { //theURL or a path to file
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var data = httpRequest.responseText;  //if you fetch a file you can JSON.parse(httpRequest.responseText)
            if (callback) {
                callback(data);
            }                   
        }
    };
    
    httpRequest.open('DELETE', theUrl, true); 
    httpRequest.setRequestHeader('x-auth-token', authToken);
    httpRequest.setRequestHeader('x-api-serial', apiSerial);
    apiSerial = apiSerial + 1;
    httpRequest.send(null);
}

 function httpLogoutAsyncCallback(data){
    var jsonContent = JSON.parse(data);
}



function keepAlive() {
	var reqUrl = "http://" + deviceAddr + ":" + devicePort + "/api/keep-alive";
	httpKeepAliveAsync(reqUrl, httpKeepAliveAsyncCallback);
}

function keepAliveStart() {
	if (keepAliveTimer == null) {
		var cnt = 0;

		keepAliveTimer = setInterval(function() {
			cnt += 1;
			keepAlive();
		}, 120000);
	}
}

function keepAliveStop() {
	clearInterval(keepAliveTimer);
	keepAliveTimer = null;
}


function httpKeepAliveAsyncCallback(data) {
	console.log("keep alive send success!");
}

function httpKeepAliveAsync(theUrl, callback) { //theURL or a path to file
	var httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = function() {
		if (httpRequest.readyState == 4 && httpRequest.status == 200) {
			var data = httpRequest.responseText; //if you fetch a file you can JSON.parse(httpRequest.responseText)
			if (callback) {
				callback(data);
			}
		}
	};
	
	console.log("keep-alive try send");
	console.log("authToken: " + authToken);
	console.log("userName: " + userName);
	console.log("userPw: " + userPw);
	console.log("theUrl: " + theUrl);
	
	
	httpRequest.open('GET', theUrl, true);

	httpRequest.setRequestHeader('x-account-id', userName);
	httpRequest.setRequestHeader('x-account-pass', userPw);
	httpRequest.setRequestHeader('x-account-group', group);
	httpRequest.setRequestHeader('x-license', lic);
	httpRequest.setRequestHeader('x-auth-token', authToken);
	httpRequest.send(null);
}


















/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetOptionInnodepSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetOptionInnodep = e.control;
	
	console.log("onSmsGetOptionInnodepSubmitDone");
	
	initVariable();
	
	var reqUrl = "http://" + deviceAddr +":"+devicePort + "/api/login";
	httpLoginAsync(reqUrl, httpLoginAsyncCallback);
}


/*
 * Body에서 unload 이벤트 발생 시 호출.
 * 앱이 언로드된 후 발생하는 이벤트입니다.
 */
function onBodyUnload(/* cpr.events.CEvent */ e){
		
	var reqUrl = "http://" + deviceAddr +":"+devicePort + "/api/logout";
	httpLogoutAsync(reqUrl, httpLogoutAsyncCallback);
}


/*
 * "Recording Storage" 버튼(btnRecordingStorage)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnRecordingStorageClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	//var btnRecordingStorage = e.control;

	

	var emb = app.lookup("eaMain");
	var src = "app/main/vmsInnodep/vmsRecordingStorage" + "?" + itgrm_version;
	
	var embAppIns = emb.getEmbeddedAppInstance();
	cpr.core.App.load(src, function(loadedApp) { 
		if (embAppIns && embAppIns.hasAppMethod("tabCheck")) { //기존 페이지가 
			embAppIns.callAppMethod("tabCheck");
		}
		emb.app = loadedApp;
	});	
	
}


/*
 * "General" 버튼(btnCamera)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnCameraClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	//var btnCamera = e.control;
	
	
	onBtnCameraClick(null);
}


/*
 * "Storage" 버튼(btnRecordingStorage)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnRecordingStorageClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	//var btnRecordingStorage = e.control;
	onBtnRecordingStorageClick(null);
}


/*
 * "User" 버튼(btnUser)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnUserClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	//var btnUser = e.control;
	onBtnUserClick(null);
}


/*
 * "Video" 버튼(btnVideo)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnVideoClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	//var btnVideo = e.control;
	onBtnVideoClick(null);
}


/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTMMGR_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Image
	 */
	var tMMGR_imgHelpPage = e.control;
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);	
}


/*
 * 버튼(btnInnodepVmsOption)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnInnodepVmsOptionClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnInnodepVmsOption = e.control;
	


	var emb = app.lookup("eaMain");
	var src = "app/main/vmsInnodep/OptionPageInnodep" + "?" + itgrm_version;
	
	var embAppIns = emb.getEmbeddedAppInstance();
	cpr.core.App.load(src, function(loadedApp) { 
		if (embAppIns && embAppIns.hasAppMethod("tabCheck")) { //기존 페이지가 
			embAppIns.callAppMethod("tabCheck");
		}
		emb.app = loadedApp;
	});		
	
}

exports.setOptionInnodep = function(dmOptionInnodep) {
	var dm = app.lookup("OptionInnodep");
	dmOptionInnodep.copyToDataMap(dm);
	initVariable();
}

function initVariable() {
	var OptionInnodep = app.lookup("OptionInnodep");
	
	deviceAddr = OptionInnodep.getValue("ServerIP");
	devicePort = OptionInnodep.getValue("ServerPort");
	userName = OptionInnodep.getValue("UserID");
	userPw = OptionInnodep.getValue("UserPW");
	lic = OptionInnodep.getValue("License");
	dmsVideoPlayerServerIP = OptionInnodep.getValue("PlayerServerIP");
	dmsVideoPlayerServerPort = OptionInnodep.getValue("PlayerServerPort");
	
	
	dmsVideoPlayerURL = "http://" + dmsVideoPlayerServerIP + ":" + dmsVideoPlayerServerPort + "/media/api/public/scripts/dms-video-player.min.js";
	mediaStreamVideo = "ws://" + dmsVideoPlayerServerIP + ":" + dmsVideoPlayerServerPort + "/media/api/v1/stream";
}
