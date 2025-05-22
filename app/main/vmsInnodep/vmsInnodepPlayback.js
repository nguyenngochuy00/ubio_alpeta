/************************************************
 * vmsInnodepPlayback.js
 * Created at 2020. 4. 29. 오전 10:21:08.
 *
 * @author union
 ************************************************/



var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;

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

var deviceList = null;

var MAX_DEIVCE_CNT = 4;

var keepAliveTimer = null;

var player ;  

var curDevSerial = null;


var devSerialMap = new Map();

var AuthTerminalID = 0;
var AuthEventTime = 0;



var dsInnodepPlaybackTempIndex = 0;

function deviceStruct() {
	var deviceName = "";
	var channelName = "";
	var deviceSerial = 0;
	var channelSerial = 0;
	var channelMediaSerial = 0;
	var rtspUrl = "";
}

var dmsVideoPlayerURL = "http://192.168.123.201:8080/media/api/public/scripts/dms-video-player.min.js";

var mediaStreamVideo = "ws://192.168.123.201:8080/media/api/v1/stream";

var dmsVideoPlayerServerIP = "";
var dmsVideoPlayerServerPort = 0;




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
	
	comLib = createComUtil(app);
	dataManager = getDataManager();	
	
	var i = 0;
	
	player = null;

	deviceList = new Array(MAX_DEIVCE_CNT);
	for (i = 0; i < MAX_DEIVCE_CNT; i++) {
		deviceList[i] = new deviceStruct();
		console.log("init deviceList index: " + i);
	}		
	
	/*
	var head= document.getElementsByTagName('head')[0];
	var script= document.createElement('script');
	script.type= 'text/javascript';
	script.src= dmsVideoPlayerURL;
	head.appendChild(script);		
	*/
	
	
	//var initValue = app.getHost().initValue;
	//AuthTerminalID = initValue["TerminalID"];
	//AuthEventTime = initValue["EventTime"];
	
	
	var obj = getParameters(window.location.search);
   	//app.lookup("reportPageSet").build(obj);
   	//app.lookup("smsSetData").build(obj);   	   
   	
   	AuthTerminalID = obj["terminalID"] ;  
  	AuthEventTime = obj["eventTime"] ;   
  
	var strTerminalID = obj["strTerminalID"];		
	var strDevName = obj["strDevName"];
	var strDevSerial = obj["strDevSerial"];
	var strEventTime = obj["strEventTime"];
	var strPlaybackVideo = obj["strPlaybackVideo"];
	
	var grdPlayback = app.lookup("grdPlayback");
	grdPlayback.header.getColumn(0).setText(strTerminalID);
	grdPlayback.header.getColumn(1).setText(strDevName);
	grdPlayback.header.getColumn(2).setText(strDevSerial);
	grdPlayback.header.getColumn(3).setText(strEventTime);
	
	document.title = strPlaybackVideo;
	
	console.log("TerminalID: " + AuthTerminalID);
	console.log("EventTime: " + AuthEventTime);
		
	var smsGetOptionInnodep = app.lookup("smsGetOptionInnodep");
	smsGetOptionInnodep.send();
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
    
    console.log("theUrl:" + theUrl);

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
    
    getDeviceList();
    
    keepAliveStart();
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

	httpRequest.open('GET', theUrl, true);

	httpRequest.setRequestHeader('x-account-id', userName);
	httpRequest.setRequestHeader('x-account-pass', userPw);
	httpRequest.setRequestHeader('x-account-group', group);
	httpRequest.setRequestHeader('x-license', lic);
	httpRequest.setRequestHeader('x-auth-token', authToken);
	httpRequest.send(null);
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



function httpGetRtspURLAsync(theUrl, callback) { //theURL or a path to file
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
	httpRequest.setRequestHeader('x-auth-token', authToken);
	httpRequest.setRequestHeader('x-api-serial', apiSerial);
	apiSerial = apiSerial + 1;
	httpRequest.send(null);
}

function httpGetRtspURLAsyncCallback(data) {
	var jsonContent = JSON.parse(data);
	console.log(jsonContent);

 	var rowIndex = 0;

	//for (var i = 0; i < jsonContent.results.length; i++) {
		console.log(" - RTSP_URL:" + jsonContent.results.url + "/");
		
		createVideo(0,
				 0, 
				 0,
				 jsonContent.results.url);
	
		if(null != player)
		{
			var startDt = Number(moment(new Date('2020-07-01-T11:20'), 'YYYY-MM-DDTHH:mm').unix());
        	var endDt = Number(moment(new Date(), 'YYYY-MM-DDTHH:mm').unix());
        	var speed = 10 ;//document.getElementById('speed_selector').value;

        	dmsVideoPlayer.playbackPlay(player, startDt, endDt, speed);
        
			console.log("dmsVideoPlayer.playbackPlay");
		}
		
		//break;
	//}
}



 function getDeviceList(){   
	var reqUrl = "http://" + deviceAddr + ":" + devicePort + "/api/device/list/" + userSerial + "/1?dev_only=true";
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
	
	//var grd_DeviceList = app.lookup("grd_DeviceList");
	
	//var dsDeviceList = app.lookup("dsDeviceList");
	//dsDeviceList.clear();
		
 	var rowIndex = 0;

	for (var i = 0; i < jsonContent.results.tree.length; i++) {
		console.log(i + ". " + jsonContent.results.tree[i].dev_serial + "/" + jsonContent.results.tree[i].dev_name);
		if (i < 4) {
			deviceList[i].deviceName = jsonContent.results.tree[i].dev_name;
			deviceList[i].deviceSerial = jsonContent.results.tree[i].dev_serial;
			deviceList[i].rtspUrl = "";
			//getDeviceInfo(deviceList[i].deviceSerial);
			//var camId = 'cam0' + (i + 1);
			//document.getElementById(camId).innerText = jsonContent.results.tree[i].dev_name;
			
			//dsDeviceList.addRow();
			
			//dsDeviceList.setValue(rowIndex, "deviceName", deviceList[i].deviceName);
			//dsDeviceList.setValue(rowIndex, "deviceSerial", deviceList[i].deviceSerial);
			//dsDeviceList.setValue(rowIndex, "rtspUrl", deviceList[i].rtspUrl);
			
			//console.log(dsDeviceList);
			
			var szDeviceSerial = "";
			var intDeviceSerial = -1;
			intDeviceSerial = deviceList[i].deviceSerial;
			szDeviceSerial = intDeviceSerial.toString();
			
			var szDeviceName = "";
			szDeviceName = deviceList[i].deviceName;
			
			console.log("==============================" );
			console.log("szDeviceSerial:" + szDeviceSerial);
			console.log("szDeviceName:" + szDeviceName);
			
			devSerialMap.set(szDeviceSerial, szDeviceName);
			
			szDeviceName = devSerialMap.get(szDeviceSerial);
			console.log("ret szDeviceName:" + szDeviceName);

			rowIndex++;
		}
	}
	
	//grd_DeviceList = app.lookup("grd_DeviceList");
	//grd_DeviceList.redraw();
	
	send_smsGetInnodepPlayback();
	
	//videoPlayback();
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
					*/
	
					//if(null != player)
					//{
					//	dmsVideoPlayer.streamPlay(player);
					//}
					
					
						
					
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

function createVideo(devSerial, channel, media, rtsp) {

	//console.log("createVideo rtsp: " + rtsp);

/*
	// 비디오 생성 옵션 정의
	var videoOptions = {
		'id': 'test_video', // 생성할 비디오 객체의 ID ( <video> Element ID )
		'url': 'http://172.16.31.177', // 영상 요청 url
		'srcType': 'vurix', // 원본 소스 타입
		'stream': 'ws://112.219.69.210:16789/ws/stream', // stream url
		'vmsId': Number(vms_id),
		'devSerial': Number(devSerial),
		'channel': Number(channel),
		'media': Number(media),
		'token': authToken,
		'errorMsgFunc': errorMsgCallback // 에러 콜백 함수
	};
*/

    var vmsUrl = 'vurix://'
    vmsUrl = vmsUrl + authToken + '@' 
    vmsUrl = vmsUrl + '/' + vms_id + '/' + devSerial + '/' +
          channel + '/' + media;	
	
	
	//var mediaStreamVideo = "ws://192.168.123.201:8080/media/api/v1/stream";
	//var dmsVideoPlayerURL = "http://192.168.123.200:8080/media/api/public/scripts/dms-video-player.min.js";
	
	//var dmsVideoPlayerURL = "http://192.168.123.201:8080/media/api/public/scripts/dms-video-player.min.js";
	
 	var videoOptions = {
          'id': 'test_video',                            	
          'url': vmsUrl,     
          //'url': rtsp,                                  
          'srcType' : 'vurix',                           	
          'stream': mediaStreamVideo,                    
          'errorMsgFunc': errorMsgCallback,
          'videoAttr': {}
     };	

	//var video_parent = 'video_parent'+index;
	//console.log(video_parent);

	if(null != player)
	{
		dmsVideoPlayer.streamStop(player);
		dmsVideoPlayer.playerClose(player);
		
		document.getElementById("video_parent").removeChild(player);
		player = null;
	}

	player = dmsVideoPlayer.createVideo(videoOptions);
	
	if(null == player)
	{
		console.log("fail create dmsVideoPlayer");
	}
	
	document.getElementById("video_parent").appendChild(player);
}

// 에러 메시지 처리 함수 (dms-player 내부 오류)
function errorMsgCallback(err) {
	console.log(err);
}

// 영상 재생
function videoPlay() {

	if(player != null)
		dmsVideoPlayer.streamPlay(player);

}

// 영상 정지
function videoStop() {
	
	if(player != null)
		dmsVideoPlayer.streamStop(player);
		
}

function send_smsGetInnodepPlayback() {
	
	var smsGetInnodepPlayback = app.lookup("smsGetInnodepPlayback");
	
	var dsInnodepPlaybackReq = app.lookup("dsInnodepPlaybackReq");
	
	dsInnodepPlaybackReq.setValue("EventTime", AuthEventTime);
	dsInnodepPlaybackReq.setValue("TerminalID", AuthTerminalID);
	
	smsGetInnodepPlayback.send();
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
	
	var OptionInnodep = app.lookup("OptionInnodep");
	
	deviceAddr = OptionInnodep.getValue("ServerIP");
	devicePort = OptionInnodep.getValue("ServerPort");
	userName = OptionInnodep.getValue("UserID");
	userPw = OptionInnodep.getValue("UserPW");
	lic = OptionInnodep.getValue("License");
	dmsVideoPlayerServerIP = OptionInnodep.getValue("PlayerServerIP");
	dmsVideoPlayerServerPort = OptionInnodep.getValue("PlayerServerPort");

	console.log("onSmsGetOptionInnodepSubmitDone" );
	console.log("deviceAddr: " + deviceAddr );
	console.log("devicePort: " + devicePort );
	console.log("userName: " + userName );
	console.log("userPw: " + userPw );
	console.log("lic: " + lic );
	console.log("PlayerServerIP: " + dmsVideoPlayerServerIP );
	console.log("PlayerServerPort: " + dmsVideoPlayerServerPort );	
		
	dmsVideoPlayerURL = "http://" + dmsVideoPlayerServerIP + ":" + dmsVideoPlayerServerPort + "/media/api/public/scripts/dms-video-player.min.js";
	mediaStreamVideo = "ws://" + dmsVideoPlayerServerIP + ":" + dmsVideoPlayerServerPort + "/media/api/v1/stream";
	
	var head= document.getElementsByTagName('head')[0];
	var script= document.createElement('script');
	script.type= 'text/javascript';
	script.src= dmsVideoPlayerURL;
	head.appendChild(script);			

	var reqUrl = "http://" + deviceAddr +":"+devicePort + "/api/login";
	httpLoginAsync(reqUrl, httpLoginAsyncCallback);	
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsGetOptionInnodepSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetOptionInnodep = e.control;
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSmsGetOptionInnodepSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetOptionInnodep = e.control;
	
}

/*
 * Body에서 unload 이벤트 발생 시 호출.
 * 앱이 언로드된 후 발생하는 이벤트입니다.
 */
function onBodyUnload(/* cpr.events.CEvent */ e){
	
	if(null != player)
	{
		dmsVideoPlayer.streamStop(player);
		dmsVideoPlayer.playerClose(player);
		document.getElementById("video_parent").removeChild(player);
		player = null;
	}	
	
	keepAliveStop();
	
	var reqUrl = "http://" + deviceAddr +":"+devicePort + "/api/logout";
	httpLogoutAsync(reqUrl, httpLogoutAsyncCallback);	
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



/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */

String.prototype.replaceAll = function(org, dest) {
    return this.split(org).join(dest);
}

function onSmsGetInnodepPlaybackSubmitDone(/* cpr.events.CSubmissionEvent */ e)
{
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetInnodepPlayback = e.control;
	
	var dsInnodepPlayback = app.lookup("dsInnodepPlayback");

	var dsInnodepPlaybackGrid = app.lookup("dsInnodepPlaybackGrid");
	dsInnodepPlaybackGrid.clear();
	
	var dsInnodepPlaybackTemp = app.lookup("dsInnodepPlaybackTemp");
	dsInnodepPlaybackTemp.clear();
	
	for (var ii=0;ii< dsInnodepPlayback.getRowCount() ; ii++) {
		
		var row = dsInnodepPlayback.getRow(ii);
		
		//var rowGrid = dsInnodepPlaybackGrid.addRow();
		
		var DevSerial = "";
		DevSerial = row.getValue("DevSerial");
		
		console.log("DevSerial: " + DevSerial);
		
		var DevName = "";
		DevName = devSerialMap.get(DevSerial);
		
		console.log("DevName: " + DevName);

		console.log("dsInnodepPlaybackTemp addRow()");

		var rowTemp = dsInnodepPlaybackTemp.addRow();
		rowTemp.setValue( "TerminalID", row.getValue("TerminalID"));
		rowTemp.setValue( "DevName", DevName);
		rowTemp.setValue( "DevSerial", DevSerial);
		rowTemp.setValue( "EventTime", row.getValue("EventTime"));

		
		
		
		/*
		rowGrid.setValue( "TerminalID", row.getValue("TerminalID"));
		rowGrid.setValue( "DevName", DevName);
		rowGrid.setValue( "DevSerial", DevSerial);
		rowGrid.setValue( "EventTime", row.getValue("EventTime"));
		*/
	}		
	
	
	if(dsInnodepPlaybackTemp.getRowCount() == 0)
	{
		return;
	}	
	
	dsInnodepPlaybackTempIndex = 0;
	
	var rowTemp = dsInnodepPlaybackTemp.getRow(dsInnodepPlaybackTempIndex);	
	var EventTimeTemp = "";
	EventTimeTemp = rowTemp.getValue("EventTime");
	  
	var from_date = new Date(EventTimeTemp);
	from_date.setMinutes(from_date.getMinutes() - 5);
	console.log("from_date: " + from_date);
	
	var from_date_string = moment(from_date).format('YYYYMMDDHHmm');
	console.log("from_date_string: " + from_date_string);
	
	var to_date = new Date(EventTimeTemp);
	to_date.setMinutes(to_date.getMinutes() + 30);
	console.log("to_date: " + to_date);
	
	var to_date_string = moment(to_date).format('YYYYMMDDHHmm');
	console.log("to_date_string: " + to_date_string);
		  
	var reqUrl = "http://" + deviceAddr + ":" + devicePort + "/api/video/time-range/" + 
		DevSerial + "/0?from_date=" + from_date_string + "&to_date=" + to_date_string;
	httpGetPlaybackListAsync(reqUrl, httpGetPlaybackListAsyncCallback);	
	
	
	return;
	
	
	if(dsInnodepPlaybackGrid.getRowCount() == 0)
	{
		return;
	}
	
	var DevSerial = dsInnodepPlaybackGrid.getRow(0).getValue("DevSerial");
	var EventTime = dsInnodepPlaybackGrid.getRow(0).getValue("EventTime");
		
	
	//2020-07-10 15:28:53
	//timestamp=20200701112025
	
	/*
	var EventTime1 = EventTime.replaceAll("-", "");
	var EventTime2 = EventTime1.replaceAll(":", "");
	var EventTime3 = EventTime2.replaceAll(" ", "");
	var EventTime4 = EventTime3.replaceAll("T", "");
	var EventTime5 = EventTime4.replaceAll("+", "");
	var EventTime6 = EventTime5.substring(0, 4 + 2 + 2 + 6)
	
	console.log("EventTime1: " + EventTime1);
	console.log("EventTime2: " + EventTime2);
	console.log("EventTime3: " + EventTime3);
	console.log("EventTime4: " + EventTime4);
	console.log("EventTime5: " + EventTime5);
	console.log("EventTime6: " + EventTime6);
	*/
	
	var EventTimeDestFormat = "2020-07-01T11:20";
	var EventTime1 = EventTime.replaceAll(" ", "");
	var EventTime2 = EventTime1.substring(0, EventTimeDestFormat.length);
	
	createVideo(DevSerial,
				0, 
				0,
				"");
	
	if(null != player)
	{
		console.log("EventTime2: " + EventTime2);
		
		//EventTime2 = '2020-07-15T14:15';
		
		var startDt = Number(moment(new Date(EventTime2), 'YYYY-MM-DDTHH:mm').unix());
    	var endDt = Number(moment(new Date(), 'YYYY-MM-DDTHH:mm').unix());
    	var speed = 1 ;
    	
    	console.log("startDt: " + startDt);
    	console.log("endDt: " + endDt);

    	dmsVideoPlayer.playbackPlay(player, startDt, endDt, speed);
		console.log("dmsVideoPlayer.playbackPlay");
	}
		
	//EventTime6 = "20200710152900";
	
	//var reqUrl = "http://" + deviceAddr + ":" + devicePort + "/api/video/rtsp-url/" + DevSerial + "/0/0?timestamp=" + EventTime6 + "&speed=10";
	//httpGetRtspURLAsync(reqUrl, httpGetRtspURLAsyncCallback)
		
	var grdPlayback = app.lookup("grdPlayback");
	grdPlayback.redraw();
	
	/*
	{
	var EventTime1 = EventTime.replaceAll("-", "");
	var EventTime2 = EventTime1.replaceAll(":", "");
	var EventTime3 = EventTime2.replaceAll(" ", "");
	var EventTime4 = EventTime3.replaceAll("T", "");
	var EventTime5 = EventTime4.replaceAll("+", "");
	var EventTime6 = EventTime5.substring(0, 4 + 2 + 2 + 6)
	
	console.log("EventTime1: " + EventTime1);
	console.log("EventTime2: " + EventTime2);
	console.log("EventTime3: " + EventTime3);
	console.log("EventTime4: " + EventTime4);
	console.log("EventTime5: " + EventTime5);
	console.log("EventTime6: " + EventTime6);	
	
	var reqUrl = "http://" + deviceAddr + ":" + devicePort + "/api/video/rtsp-url/" + DevSerial + "/0/0?timestamp=" + EventTime6 + "&speed=10";
	httpGetRtspURLAsync(reqUrl, httpGetRtspURLAsyncCallback)
	}
	*/
}



/*
 * 그리드에서 row-dblclick 이벤트 발생 시 호출.
 * detail이 row를 더블클릭 한 경우 발생하는 이벤트.
 */
function onGrdPlaybackRowDblclick2(/* cpr.events.CGridEvent */ e){
	
	/** 
	 * @type cpr.controls.Grid
	 */
	var grdPlayback = e.control;
	
	var row = grdPlayback.getSelectedRow()
	
	if (row == null)
		return
	//var dsInnodepPlayback = app.lookup("dsInnodepPlayback");
	
	var DevSerial = row.getValue("DevSerial")
	var EventTime = row.getValue("EventTime")
	

	// 2020-07-01 11:20
	var EventTimeDestFormat = "2020-07-01 11:20";
	var EventTime1 = EventTime.replaceAll(" ", "T");
	var EventTime2 = EventTime1.substring(0, EventTimeDestFormat.length);
	
	createVideo(DevSerial,
				0, 
				0,
				"");
	
	if(null != player)
	{
		var startDt = Number(moment(new Date(EventTime2), 'YYYY-MM-DDTHH:mm').unix());
    	var endDt = Number(moment(new Date(), 'YYYY-MM-DDTHH:mm').unix());
    	var speed = 1 ;
    	
    	console.log("EventTime2: " + EventTime2);
    	console.log("startDt: " + startDt);
    	console.log("endDt: " + endDt);

    	dmsVideoPlayer.playbackPlay(player, startDt, endDt, speed);
		console.log("dmsVideoPlayer.playbackPlay");
	}	
}


/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl_player1Load2(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl_player1 = e.control;
	
	var content = e.content;
	
	content.innerHTML = "<div id=\"video_parent\" style=\"width: 100%; height: 100%; background: #222222; float: left;\" ></div>";
}

function httpGetPlaybackListAsync(theUrl, callback) { //theURL or a path to file
	var httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = function() {
		if (httpRequest.readyState == 4 && httpRequest.status == 200) {
			var data = httpRequest.responseText; //if you fetch a file you can JSON.parse(httpRequest.responseText)
			if (callback) {
				callback(data);
			}
		}
	};
	
	console.log("httpGetPlaybackListAsync url= " + theUrl);

	httpRequest.open('GET', theUrl, true);
	
	httpRequest.setRequestHeader('x-auth-token', authToken);
	httpRequest.setRequestHeader('x-api-serial', apiSerial);
	apiSerial = apiSerial + 1;
	httpRequest.send(null);
}

function httpGetPlaybackListAsyncCallback(data) {
	var jsonContent = JSON.parse(data);
	console.log(jsonContent);
	
	var dsInnodepPlayback = app.lookup("dsInnodepPlayback");
	var dsInnodepPlaybackGrid = app.lookup("dsInnodepPlaybackGrid");
	var dsInnodepPlaybackTemp = app.lookup("dsInnodepPlaybackTemp");
	
	console.log("dsInnodepPlaybackTemp.getRowCount(): " + dsInnodepPlaybackTemp.getRowCount());
	console.log("dsInnodepPlaybackTempIndex): " + dsInnodepPlaybackTempIndex);
	
	if (dsInnodepPlaybackTemp.getRowCount() <= dsInnodepPlaybackTempIndex)
	{
		
		return;	
	}
		
	var rowTemp = dsInnodepPlaybackTemp.getRow(dsInnodepPlaybackTempIndex);
	
	var TerminalID = rowTemp.getValue("TerminalID");
	var DevName = rowTemp.getValue("DevName");
	var DevSerial = rowTemp.getValue("DevSerial");
	var EventTime = rowTemp.getValue("EventTime");
		
	//var ret = dsInnodepPlaybackTemp.deleteRow(rowTemp.getIndex());
	//console.log("dsInnodepPlaybackTemp.deleteRow: " + ret);

	for (var i = 0; i < jsonContent.results.length; i++) {
		
		var rowGrid = dsInnodepPlaybackGrid.addRow();
		
		rowGrid.setValue("TerminalID", TerminalID);
		rowGrid.setValue("DevName", DevName);
		rowGrid.setValue("DevSerial", DevSerial);
		rowGrid.setValue("EventTime", jsonContent.results[i].start);
	}	

	dsInnodepPlaybackTempIndex++;
	
	if (dsInnodepPlaybackTemp.getRowCount() <= dsInnodepPlaybackTempIndex)
	{
		var grdPlayback = app.lookup("grdPlayback");
		grdPlayback.redraw();
		
		var row = grdPlayback.getRow(0);
			
		var DevSerial = row.getValue("DevSerial")
		var EventTime = row.getValue("EventTime")
		
		// 2020-07-01 11:20
		var EventTimeDestFormat = "2020-07-01 11:20";
		var EventTime1 = EventTime.replaceAll(" ", "T");
		var EventTime2 = EventTime1.substring(0, EventTimeDestFormat.length);
		
		createVideo(DevSerial,
					0, 
					0,
					"");
		
		if(null != player)
		{
			var startDt = Number(moment(new Date(EventTime2), 'YYYY-MM-DDTHH:mm').unix());
	    	var endDt = Number(moment(new Date(), 'YYYY-MM-DDTHH:mm').unix());
	    	var speed = 1 ;
	    	
	    	console.log("EventTime2: " + EventTime2);
	    	console.log("startDt: " + startDt);
	    	console.log("endDt: " + endDt);
	
	    	dmsVideoPlayer.playbackPlay(player, startDt, endDt, speed);
			console.log("dmsVideoPlayer.playbackPlay");
		}			
		
		
		return;	
	}
	
	console.log("dsInnodepPlaybackTempIndex: " + dsInnodepPlaybackTempIndex);
	
	rowTemp = dsInnodepPlaybackTemp.getRow(dsInnodepPlaybackTempIndex);
	
	var DevSerial = rowTemp.getValue("DevSerial");
	
	var EventTimeTemp = "";
	EventTimeTemp = rowTemp.getValue("EventTime");
	  
	var from_date = new Date(EventTimeTemp);
	from_date.setMinutes(from_date.getMinutes() - 5);
	console.log("from_date: " + from_date);
	
	var from_date_string = moment(from_date).format('YYYYMMDDHHmm');
	console.log("from_date_string: " + from_date_string);
	
	var to_date = new Date(EventTimeTemp);
	to_date.setMinutes(to_date.getMinutes() + 30);
	console.log("to_date: " + to_date);
	
	var to_date_string = moment(to_date).format('YYYYMMDDHHmm');
	console.log("to_date_string: " + to_date_string);
			  
	var reqUrl = "http://" + deviceAddr + ":" + devicePort + "/api/video/time-range/" + 
		DevSerial + "/0?from_date=" + from_date_string + "&to_date=" + to_date_string;
	httpGetPlaybackListAsync(reqUrl, httpGetPlaybackListAsyncCallback);	
}



