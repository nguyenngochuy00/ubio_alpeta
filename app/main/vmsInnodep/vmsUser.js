/************************************************
 * vmsUser.js
 * Created at 2020. 5. 28. 오후 1:49:33.
 *
 * @author union
 ************************************************/


var authToken = "";
var apiSerial = 0;
var userSerial = 0;

var deviceAddr = "112.219.69.210";
var devicePort = "16118";

var deviceList = null;

var MAX_DEIVCE_CNT = 100;


var userName = "sdk";
var userPw = "Innodep1@";

var lic = "licAccessControl";
var group = 'group1';

var vms_id = "";




var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;


var curRecvUserCount = 0;
var totalUserCount = 0;


/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
		
	comLib = createComUtil(app);
	dataManager = getDataManager();	
		
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
}




 function getUserList(){   
	var reqUrl = "http://" + deviceAddr + ":" + devicePort + "/api/users";
	httpGetUserListAsync(reqUrl, httpGetUserListAsyncCallback);
}

function httpGetUserListAsync(theUrl, callback) {
	var httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = function() {
		if (httpRequest.readyState == 4 && httpRequest.status == 200) {
			var data = httpRequest.responseText; //if you fetch a file you can JSON.parse(httpRequest.responseText)
			if (callback) {
				callback(data);
			}
		}
		else{
			comLib.hideLoadMask();
		}
		
		
	};
	
	console.log("httpGetUserListAsync");

	httpRequest.open('GET', theUrl, true);

	httpRequest.setRequestHeader('x-auth-token', authToken);
	httpRequest.setRequestHeader('x-api-serial', apiSerial);
	apiSerial = apiSerial + 1;
	httpRequest.send(null);
}

function httpGetUserListAsyncCallback(data) {
	
	console.log("httpGetUserListAsyncCallback");
	
	var jsonContent = JSON.parse(data);
	console.log(jsonContent);
	
	var dsInnodepUserList = app.lookup("dsInnodepUserList");
	dsInnodepUserList.clear();
	
	var ii=0;
	
	totalUserCount = jsonContent.results.length;
	curRecvUserCount = 0;
	
	for(ii=0;ii<jsonContent.results.length;ii++)
	{
		//var row = dsInnodepUserList.addRow();
		//row.setValue("UserID", jsonContent.results[ii].user_id);
		//row.setValue("UserPW", jsonContent.results[ii].user_);
		
		getUserInfo(jsonContent.results[ii].user_serial);
	}
}







 function getUserInfo(userSerial){   
	var reqUrl = "http://" + deviceAddr + ":" + devicePort + "/api/users/" + userSerial;
	httpGetUserInfoAsync(reqUrl, httpGetUserInfoAsyncCallback);
}

function httpGetUserInfoAsync(theUrl, callback) {
	var httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = function() {
		if (httpRequest.readyState == 4 && httpRequest.status == 200) {
			var data = httpRequest.responseText; //if you fetch a file you can JSON.parse(httpRequest.responseText)
			if (callback) {
				callback(data);
			}
		}
			
		curRecvUserCount++;
		if(totalUserCount == curRecvUserCount)
		{
			comLib.hideLoadMask();
		}
		
	};
	
	console.log("httpGetUserInfoAsync");

	httpRequest.open('GET', theUrl, true);

	httpRequest.setRequestHeader('x-auth-token', authToken);
	httpRequest.setRequestHeader('x-api-serial', apiSerial);
	apiSerial = apiSerial + 1;
	httpRequest.send(null);
}

function httpGetUserInfoAsyncCallback(data) {
	
	console.log("httpGetUserInfoAsyncCallback");
	
	var jsonContent = JSON.parse(data);
	console.log(jsonContent);
	
	var dsInnodepUserList = app.lookup("dsInnodepUserList");
	var grdUserList = app.lookup("grdUserList");

	var ii=0;
	for(ii=0;ii<jsonContent.results.length;ii++)
	{
		var row = dsInnodepUserList.addRow();
		row.setValue("UserID", jsonContent.results[ii].user_id);
		row.setValue("UserPW", "");
		row.setValue("UserSerial", jsonContent.results[ii].user_serial);
	}
	
	grdUserList.redraw();
}







/*
 * "유저 리스트 조회" 버튼(btnUserList)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnUserListClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnUserList = e.control;
	
	comLib.showLoadMask("", "Query User List", "", 0);

	getUserList();	
}


/*
 * "패스워드 변경 저장" 버튼(btnUserInfoSave)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnUserInfoSaveClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnUserInfoSave = e.control;
	
	dialogAlert(app, "Info", "be getting ready" );
	
}
