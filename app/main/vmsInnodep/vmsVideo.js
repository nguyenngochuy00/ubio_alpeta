/************************************************
 * vmsVideo.js
 * Created at 2020. 5. 28. 오후 1:48:05.
 *
 * @author union
 ************************************************/


var MAX_DEIVCE_CNT =100;

var MAX_DEIVCE_SHOW =100;

var player ;  

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


var mediaStreamVideo = "ws://192.168.123.201:8080/media/api/v1/stream";
//var dmsVideoPlayerURL = "http://192.168.123.200:8080/media/api/public/scripts/dms-video-player.min.js";


var dmsVideoPlayerURL = "http://192.168.123.201:8080/media/api/public/scripts/dms-video-player.min.js";



var deviceList = null;

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
comLib = createComUtil(app);

function deviceStruct() {
	var deviceName = "";
	var channelName = "";
	var deviceSerial = 0;
	var channelSerial = 0;
	var channelMediaSerial = 0;
	var rtspUrl = "";
}


/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	dataManager = getDataManager();
	
	
	var i = 0;
	player = new Array(MAX_DEIVCE_SHOW);
	for (i = 0; i < MAX_DEIVCE_SHOW; i++) {
		player[i] = null;
	}	
	
	
	deviceList = new Array(MAX_DEIVCE_CNT);
	for (i = 0; i < MAX_DEIVCE_CNT; i++) {
		deviceList[i] = new deviceStruct();
		console.log("init deviceList index: " + i)
	}	
	
	
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
		
	/*
	var shl_player1 = app.lookup("shl_player1");	
	shl_player1.addEventListener("click", function(){

		console.log("shl_player3 clicked");

	});			
		
	var shl_player3 = app.lookup("shl_player3");	
	shl_player3.addEventListener("click", function(){

		console.log("shl_player3 clicked");

	});	
	*/
		
	getDeviceList();
		
}



/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl_player1Load(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl_player1 = e.control;

}
	

/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl_player2Load(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl_player2 = e.control;
	
	var content = e.content;
	content.innerHTML = "<div id=\"video_parent2\" style=\"width: 100%; height: 100%; background: #222222; float: left;\" ></div>";
}
	

/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl_player3Load(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl_player3 = e.control;
	
	var content = e.content;
	content.innerHTML = "<div id=\"video_parent3\" style=\"width: 100%; height: 100%; background: #222222; float: left;\" ></div>";
}
	

/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl_player4Load(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl_player4 = e.control;
	
	var content = e.content;
	content.innerHTML = "<div id=\"video_parent4\" style=\"width: 100%; height: 100%; background: #222222; float: left;\" ></div>";
}
	


/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl_player5Load(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl_player5 = e.control;
	var content = e.content;
	content.innerHTML = "<div id=\"video_parent5\" style=\"width: 100%; height: 100%; background: #222222; float: left;\" ></div>";

	
}
	


/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl_player6Load(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl_player6 = e.control;
		
	var content = e.content;
	content.innerHTML = "<div id=\"video_parent6\" style=\"width: 100%; height: 100%; background: #222222; float: left;\" ></div>";
}
	

/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl_player7Load(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl_player7 = e.control;
	
	var content = e.content;
	content.innerHTML = "<div id=\"video_parent7\" style=\"width: 100%; height: 100%; background: #222222; float: left;\" ></div>";
}
	


/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl_player8Load(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl_player8 = e.control;
	
	var content = e.content;
	content.innerHTML = "<div id=\"video_parent8\" style=\"width: 100%; height: 100%; background: #222222; float: left;\" ></div>";
}
	


/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl_player9Load(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl_player9 = e.control;
	
	var content = e.content;
	content.innerHTML = "<div id=\"video_parent9\" style=\"width: 100%; height: 100%; background: #222222; float: left;\" ></div>";
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
			
			console.log(dsDeviceList);
			
			createVideo(i, deviceList[i].deviceSerial,
		 	deviceList[i].channelSerial, 
		 	deviceList[i].channelMediaSerial);
	
	
			if(null != player[i])
			{
				dmsVideoPlayer.streamPlay(player[i]);
			}
			
			
			rowIndex++;
		}
	}
	
	//grd_DeviceList = app.lookup("grd_DeviceList");
	grd_DeviceList.redraw();
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





function createVideo(index, devSerial, channel, media) {


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
	
 	var videoOptions = {
          'id': 'test_video',                            	
          'url': vmsUrl,                                  
          'srcType' : 'vurix',                           	
          'stream': mediaStreamVideo,                    
          'errorMsgFunc': errorMsgCallback                
     };	

	var index_String = index;

	var video_parent = "video_parent" + index_String.toString();
		
	console.log("video_parent: " + video_parent);

	console.log("index: " + index);

	if(null != player[index])
	{
		dmsVideoPlayer.streamStop(player[index]);
		dmsVideoPlayer.playerClose(player[index]);
		document.getElementById(video_parent).removeChild(player[index]);
		player[index] = null;
	}

	player[index] = dmsVideoPlayer.createVideo(videoOptions);

	//if(null != player[index])	
	//	document.getElementById(video_parent).appendChild(player[index]);
		
	
	if(0 == index)
	{
		document.getElementById("video_parent1").appendChild(player[index]);
	}
	else if(1 == index)
	{
		document.getElementById("video_parent2").appendChild(player[index]);
	}
	else if(2 == index)
	{
		document.getElementById("video_parent3").appendChild(player[index]);
	}	
	else if(3 == index)
	{
		document.getElementById("video_parent4").appendChild(player[index]);
	}
	else if(4 == index)
	{
		document.getElementById("video_parent5").appendChild(player[index]);
	}
	else if(5 == index)
	{
		document.getElementById("video_parent6").appendChild(player[index]);
	}	
	else if(6 == index)
	{
		document.getElementById("video_parent7").appendChild(player[index]);
	}		
	else if(7 == index)
	{
		document.getElementById("video_parent8").appendChild(player[index]);
	}		
	else if(8 == index)
	{
		document.getElementById("video_parent9").appendChild(player[index]);
	}		
			
	
}

// 에러 메시지 처리 함수 (dms-player 내부 오류)
function errorMsgCallback(err) {
	console.log(err);
}

// 영상 재생
function videoPlay() {
	for (i = 0; i < MAX_DEIVCE_SHOW; i++) {
		
		if(player[i] != null)
			dmsVideoPlayer.streamPlay(player[i]);
	}
}

// 영상 정지
function videoStop() {
	
	for (i = 0; i < MAX_DEIVCE_SHOW; i++) {
		if(player[i] != null)
			dmsVideoPlayer.streamStop(player[i]);
			dmsVideoPlayer.playerClose(player[i]);
	}	
}





/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onVideoPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var videoPageIndexer = e.control;
	
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
	content.innerHTML = "<div id=\"video_parent1\" style=\"width: 100%; height: 100%; background: #222222; float: left;\" ></div>";

	shl_player1.addEventListener("click", function(){
		
		console.log("shl_player1 clicked");
		
		//shl_player1.style.css("backgroundColor","Blue");
		//shl_player1.style.css("color","#111111");
		//shl_player1.redraw();

	});	
	
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
	
}
