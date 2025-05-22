/************************************************
 * vmsInnodepManagement.js
 * Created at 2020. 4. 23. 오후 12:55:59.
 *
 * @author union
 ************************************************/


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

var MAX_DEIVCE_CNT =9;

var keepAliveTimer = null;

var player ;  

var curDevSerial ;
var curChannel;
var curMedia;


var ptzCameraSerial = 0;
var ptzMoveDirection = 14;

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
		
	var i = 0;
	player = new Array(MAX_DEIVCE_CNT);
	for (i = 0; i < MAX_DEIVCE_CNT; i++) {
		player[i] = null;
	}
		
	deviceList = new Array(MAX_DEIVCE_CNT);
	for (i = 0; i < MAX_DEIVCE_CNT; i++) {
		deviceList[i] = new deviceStruct();
		console.log("init deviceList index: " + i)
	}		
	
	
	var smsGetOptionInnodep = app.lookup("smsGetOptionInnodep");
	smsGetOptionInnodep.send();
		
//	var reqUrl = "http://" + deviceAddr +":"+devicePort + "/api/login";
//	httpLoginAsync(reqUrl, httpLoginAsyncCallback);
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
					
					
					createVideo(i, deviceList[i].deviceSerial,
				 	deviceList[i].channelSerial, 
				 	deviceList[i].channelMediaSerial);
		
	
					if(null != player[i])
					{
						dmsVideoPlayer.streamPlay(player[i]);
					}
						
					
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
          'stream': "ws://112.219.69.210:16789/media/api/v1/stream",                    
          'errorMsgFunc': errorMsgCallback                
     };	
	

	var video_parent = "video_parent" + index.toString();
		
	console.log("video_parent: " + video_parent);

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
	for (i = 0; i < MAX_DEIVCE_CNT; i++) {
		
		if(player[i] != null)
			dmsVideoPlayer.streamPlay(player[i]);
	}
}

// 영상 정지
function videoStop() {
	
	for (i = 0; i < MAX_DEIVCE_CNT; i++) {
		if(player[i] != null)
			dmsVideoPlayer.streamStop(player[i]);
			dmsVideoPlayer.playerClose(player[i]);
	}	
}




/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl_player1Load(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl_player1 = e.control;
	var content = e.content;
	
	content.innerHTML = "<div id=\"video_parent1\" style=\"width: 100%; height: 100%; background: #222222; float: left;\" ></div>";
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

	console.log("onSmsGetOptionInnodepSubmitDone" );
	console.log("deviceAddr: " + deviceAddr );
	console.log("devicePort: " + devicePort );
	console.log("userName: " + userName );
	console.log("userPw: " + userPw );
	console.log("lic: " + lic );

/*
	// by nsh test
	deviceAddr = "192.168.123.150";
	devicePort = "8080";
	
	userName = "admin";
	userPw = "admin";
	
	lic = "licNormalClient";
	group = 'group1';
*/

	var reqUrl = "http://" + deviceAddr +":"+devicePort + "/api/login";
	httpLoginAsync(reqUrl, httpLoginAsyncCallback);

}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSmsGetOptionInnodepSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetOptionInnodep = e.control;
	
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
	videoStop();
	
	keepAliveStop();
}


/*
 * "Send Test InnodepList" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
	var dsInnodepList = app.lookup("dsInnodepList");
	
	//dsInnodepList.clear();
	//dsInnodepList.commit();
	
	/*
	dsInnodepList.addRow();
	
	dsInnodepList.setValue(0, "TerminalID", 111);
	dsInnodepList.setValue(0, "DevName1", "DevName1");
	dsInnodepList.setValue(0, "DevSerial1", "DevSerial1");
	dsInnodepList.setValue(0, "DevName2", "DevName2");
	dsInnodepList.setValue(0, "DevSerial2", "DevSerial2");
	*/
	var smsPostInnodepList = app.lookup("smsPostInnodepList");
	smsPostInnodepList.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsPostInnodepListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsPostInnodepList = e.control;
	
}


/*
 * "Send Test Get InnodepList" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
	
	var dsInnodepList = app.lookup("dsInnodepList");
	
	dsInnodepList.clear();
	
	var smsGetInnodepList = app.lookup("smsGetInnodepList");
	smsGetInnodepList.send();	
	
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetInnodepListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetInnodepList = e.control;



	var cmbDevName1 = app.lookup("cmbDevName1");
	var cmbDevName2 = app.lookup("cmbDevName2");
	
	cmbDevName1.deleteAllItems();
	cmbDevName2.deleteAllItems();
	
	
	
	
	for(var i=0;i<deviceList.length;i++) 
	{
		cmbDevName1.addItem(new cpr.controls.Item(deviceList[i].deviceName, deviceList[i].deviceSerial));
		cmbDevName2.addItem(new cpr.controls.Item(deviceList[i].deviceName, deviceList[i].deviceSerial));
	}	
	



	
	
	var grdTest = app.lookup("grdTest");
	

	grdTest.redraw();
}


/*
 * "Send Test Get TerminalList" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick3(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
	
	var dsInnodepList = app.lookup("dsInnodepList");
	
	dsInnodepList.clear();
	
	var smsGetTerminalList = app.lookup("sms_getTerminalList");
	

	smsGetTerminalList.setParameters("searchCategory", "");
	smsGetTerminalList.setParameters("searchKeyword", "");

	smsGetTerminalList.setParameters("searchCategory", "");
	
	
	smsGetTerminalList.setParameters("groupID", 0);
	
	smsGetTerminalList.setParameters("subInclude", "true");

	smsGetTerminalList.setParameters("offset", 0);
	smsGetTerminalList.setParameters("limit", 50);

	smsGetTerminalList.send();	
	
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getTerminalList = e.control;
	
	var TerminalList = app.lookup("TerminalList");
	
	var dsInnodepList = app.lookup("dsInnodepList");
	
	var grdTest = app.lookup("grdTest");
	
	
	var cmbDevName1 = app.lookup("cmbDevName1");
	var cmbDevName2 = app.lookup("cmbDevName2");
	
	cmbDevName1.deleteAllItems();
	cmbDevName2.deleteAllItems();
	
	
	
	
	for(var i=0;i<deviceList.length;i++) 
	{
		cmbDevName1.addItem(new cpr.controls.Item(deviceList[i].deviceName, deviceList[i].deviceSerial));
		cmbDevName2.addItem(new cpr.controls.Item(deviceList[i].deviceName, deviceList[i].deviceSerial));
	}	
	
	
	var rowCount = TerminalList.getRowCount();
	for(var i=0;i<rowCount;i++) 
	{
		var intID = TerminalList.getValue(i, "ID");
		
		dsInnodepList.addRow();
		
		dsInnodepList.setValue(i, "TerminalID", intID.toString());
		
		//console.log(dsInnodepList);
		
		console.log(intID.toString());
	}
	
	grdTest.redraw();
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getTerminalListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getTerminalList = e.control;
	
	
	
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getTerminalListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getTerminalList = e.control;
	
}



/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmbDevName1SelectionChange2(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var cmbDevName1 = e.control;
		
	
	var grdTest = app.lookup("grdTest");
	
	var dsInnodepList = app.lookup("dsInnodepList");
	
	var item = cmbDevName1.getSelectionFirst();
	
	//item.label
	
	for(var i=0;i<deviceList.length;i++) 
	{
		if(deviceList[i].deviceSerial == item.value)
		{
			dsInnodepList.setValue(grdTest.getSelectedRowIndex(), "DevSerial1", deviceList[i].deviceSerial);
			
			break;
		}
	}		
	
	grdTest.redraw();
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmbDevName2SelectionChange2(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var cmbDevName2 = e.control;
	var grdTest = app.lookup("grdTest");
	
	var dsInnodepList = app.lookup("dsInnodepList");
	
	var item = cmbDevName2.getSelectionFirst();
	
	//item.label
	
	for(var i=0;i<deviceList.length;i++) 
	{
		if(deviceList[i].deviceSerial == item.value)
		{
			dsInnodepList.setValue(grdTest.getSelectedRowIndex(), "DevSerial2", deviceList[i].deviceSerial);
			
			break;
		}
	}		
	
	grdTest.redraw();	
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
	
function ptzSend(num) {

	console.log("ptz send ", num);
	ptzMoveDirection = num;
	var reqUrl = "http://" + deviceAddr + ":" + devicePort + "/api/device/function/ptz/lock/" + ptzCameraSerial + "/0?set=true";
	httpGetPtzLockAsync(reqUrl, httpGetPtzLockAsyncCallback);
}

function httpGetPtzLockAsyncCallback(data) {
	var jsonContent = JSON.parse(data);
	console.log(data);

	if (ptzMoveDirection == 14) {

	} else {
		var reqUrl = "http://" + deviceAddr + ":" + devicePort + "/api/device/function/ptz/" + ptzCameraSerial + "/0?cmd=" + ptzMoveDirection;
		httpGetPtzSendAsync(reqUrl, httpGetPtzSendAsyncCallback);
	}

}
function httpGetPtzSendAsyncCallback(data) {
	var jsonContent = JSON.parse(data);

	console.log(data);
	if (ptzMoveDirection == 14) {
		var reqUrl = "http://" + deviceAddr + ":" + devicePort + "/api/device/function/ptz/lock/" + ptzCameraSerial + "/0?set=false";
		httpGetPtzLockAsync(reqUrl, httpGetPtzLockAsyncCallback);
	}
}

function httpGetPtzSendAsync(theUrl, callback) { //theURL or a path to file
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

function httpGetPtzLockAsync(theUrl, callback) { //theURL or a path to file
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


function ptzStop() {
	ptzMoveDirection = 14;
	var reqUrl = "http://" + deviceAddr + ":" + devicePort + "/api/device/function/ptz/" + ptzCameraSerial + "/0?cmd=14";
	httpGetPtzSendAsync(reqUrl, httpGetPtzSendAsyncCallback);
}

/*
 * "top" 버튼(btnTop)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnTopClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnTop = e.control;

}


/*
 * "Right" 버튼(btnRight)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnRightClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnRight = e.control;
}


/*
 * "Left" 버튼(btnLeft)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnLeftClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnLeft = e.control;
	
}


/*
 * "bottom" 버튼(btnBottom)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnBottomClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnBottom = e.control;
	
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
	
	var idx = grd_DeviceList.getSelectedRowIndex();
	
	ptzCameraSerial = deviceList[idx].deviceSerial;
	
	
}

/*
 * "top" 버튼(btnTop)에서 mousedown 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 누를 때 발생하는 이벤트.
 */
function onBtnTopMousedown(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnTop = e.control;
	
	//ptzSend(1); // up & -45
	ptzSend(2); // up
	//ptzSend(3); // up & + 45
}


/*
 * "top" 버튼(btnTop)에서 mouseup 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 뗄 때 발생하는 이벤트.
 */
function onBtnTopMouseup(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnTop = e.control;
	
	ptzStop();
}


/*
 * "Left" 버튼(btnLeft)에서 mousedown 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 누를 때 발생하는 이벤트.
 */
function onBtnLeftMousedown(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnLeft = e.control;
	
	ptzSend(4); // left	
}


/*
 * "Left" 버튼(btnLeft)에서 mouseup 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 뗄 때 발생하는 이벤트.
 */
function onBtnLeftMouseup(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnLeft = e.control;
	ptzStop();
}


/*
 * "Right" 버튼(btnRight)에서 mousedown 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 누를 때 발생하는 이벤트.
 */
function onBtnRightMousedown(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnRight = e.control;
	ptzSend(6); // right	
}


/*
 * "Right" 버튼(btnRight)에서 mouseup 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 뗄 때 발생하는 이벤트.
 */
function onBtnRightMouseup(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnRight = e.control;
	ptzStop();
}


/*
 * "bottom" 버튼(btnBottom)에서 mousedown 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 누를 때 발생하는 이벤트.
 */
function onBtnBottomMousedown(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnBottom = e.control;
	
	
	ptzSend(8); // up
	
}


/*
 * "bottom" 버튼(btnBottom)에서 mouseup 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 뗄 때 발생하는 이벤트.
 */
function onBtnBottomMouseup(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnBottom = e.control;
	ptzStop();
}



/*

function httpGetOnvifDeviceListAsync(theUrl, callback) { //theURL or a path to file
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

function httpGetOnvifDeviceListAsyncCallback(data) {
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
			
			rowIndex++;
		}
	}
	
	//grd_DeviceList = app.lookup("grd_DeviceList");
	grd_DeviceList.redraw();
}
*/


/*
 * "장비 검색" 버튼(btnDevSearch)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnDevSearchClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnDevSearch = e.control;
	
	var reqUrl = "http://" + deviceAddr + ":" + devicePort + "/api/device/onvif" ;
//	httpGetOnvifDeviceListAsync(reqUrl, httpGetOnvifDeviceListAsyncCallback);	
	
	
}






function httpGetRecordServerListAsync(theUrl, callback) { //theURL or a path to file
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
	httpRequest.send(null);

}


function httpGetRecordServerListAsyncCallback(data) {

	var jsonContent = JSON.parse(data);
	console.log(jsonContent);

	var grdSearchRecordServerList = app.lookup("grdSearchRecordServerList");
	
	var dsRecordServerList = app.lookup("dsRecordServerList");
	dsRecordServerList.clear();
		
 	var rowIndex = 0;

	console.log(jsonContent.results);



}

/*
 * "레코딩 서버 조회" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick4(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
	var reqUrl = "http://" + deviceAddr + ":" + devicePort + "/api/server/list?srv_type=1" ;
	httpGetRecordServerListAsync(reqUrl, httpGetRecordServerListAsyncCallback);
}
