/************************************************
 * RecordingStorage.js
 * Created at 2020. 10. 13. 오전 11:06:51.
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

var devSerialMap = new Map();

var devAddressMap = new Map();

var addToVmsIndex = 0;


var selectRecordServerSerial = "";


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
	comLib = createComUtil(app);
	dataManager = getDataManager();	
			
	
	var hostApp = app.getHostAppInstance();
	authToken = hostApp.callAppMethod("getVmsAuthToken");	
	apiSerial = hostApp.callAppMethod("getVmsApiSerial");	
	userSerial = hostApp.callAppMethod("getVmsUserSerial");	
	deviceAddr = hostApp.callAppMethod("getVmsDeviceAddr");	
	devicePort = hostApp.callAppMethod("getVmsDevicePort");	
	//deviceList = hostApp.callAppMethod("getVmsDeviceList");	

	lic = hostApp.callAppMethod("getVmsLic");
	group = hostApp.callAppMethod("getVmsGroup");
	vms_id = hostApp.callAppMethod("getVmsId");
	userName = hostApp.callAppMethod("getVmsUserName");
	userPw = hostApp.callAppMethod("getVmsUserPw");


	
	console.log("deviceList: " + deviceList);
	
	console.log("authToken: " + authToken);
	console.log("apiSerial: " + apiSerial);
	console.log("userSerial: " + userSerial);
	console.log("deviceAddr: " + deviceAddr);
	console.log("devicePort: " + devicePort);		
	
	

	
	{
	var hostApp = app.getHostAppInstance();
	authToken = hostApp.callAppMethod("getVmsAuthToken");	
	apiSerial = hostApp.callAppMethod("getVmsApiSerial");	
	userSerial = hostApp.callAppMethod("getVmsUserSerial");	
	deviceAddr = hostApp.callAppMethod("getVmsDeviceAddr");	
	devicePort = hostApp.callAppMethod("getVmsDevicePort");	

	var reqUrl = "http://" + deviceAddr +":"+devicePort + "/api/server/list?srv_type=1";
	httpGetServerListAsync(reqUrl, httpGetServerListAsyncCallback);		
	}
			
	
}



function httpGetServerListAsync(theUrl, callback) { //theURL or a path to file
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var data = httpRequest.responseText;  //if you fetch a file you can JSON.parse(httpRequest.responseText)
            if (callback) {
                callback(data);
            }                   
        }
    };
    
    console.log("httpGetServerListAsync theUrl: " + theUrl);
    
    httpRequest.open('GET', theUrl, true); 

    httpRequest.setRequestHeader('x-auth-token', authToken);
    httpRequest.setRequestHeader('x-api-serial', apiSerial);
    httpRequest.send(null);
}

 function httpGetServerListAsyncCallback(data){
    var jsonContent = JSON.parse(data);

    console.log(jsonContent);
  
  	/*
	srv_id: 100002
	srv_name: "INNODEP"
	srv_serial: 100
	srv_stat: 2
	srv_svc_addr: "127.0.0.1"
	srv_svc_port: 7003
	srv_type: 1
	vms_id: 101060
  	*/
  	
  	var dsRecordServerList = app.lookup("dsRecordServerList"); 
  	dsRecordServerList.clear();
  
    var ii =0;
  	for(ii = 0;ii<jsonContent.results.length;ii++)
  	{
  		var row  = dsRecordServerList.addRow();
  		dsRecordServerList.setValue(row.getIndex(), "srv_id", jsonContent.results[ii].srv_id);
  		dsRecordServerList.setValue(row.getIndex(), "srv_name", jsonContent.results[ii].srv_name);
  		dsRecordServerList.setValue(row.getIndex(), "srv_serial", jsonContent.results[ii].srv_serial);
  		dsRecordServerList.setValue(row.getIndex(), "srv_stat", jsonContent.results[ii].srv_stat);
  		dsRecordServerList.setValue(row.getIndex(), "srv_svc_addr", jsonContent.results[ii].srv_svc_addr);
  		dsRecordServerList.setValue(row.getIndex(), "srv_svc_port", jsonContent.results[ii].srv_svc_port);
  		dsRecordServerList.setValue(row.getIndex(), "srv_type", jsonContent.results[ii].srv_type);
  		dsRecordServerList.setValue(row.getIndex(), "vms_id", jsonContent.results[ii].vms_id);
  	}
  	
  	var grdSearchRecordServerList = app.lookup("grdSearchRecordServerList"); 
  	grdSearchRecordServerList.redraw();
}


/*
 * "레코딩 서버 새로고침" 버튼(btnRefreshServerList)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnRefreshServerListClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnRefreshServerList = e.control;
	
	
	var hostApp = app.getHostAppInstance();
	authToken = hostApp.callAppMethod("getVmsAuthToken");	
	apiSerial = hostApp.callAppMethod("getVmsApiSerial");	
	userSerial = hostApp.callAppMethod("getVmsUserSerial");	
	deviceAddr = hostApp.callAppMethod("getVmsDeviceAddr");	
	devicePort = hostApp.callAppMethod("getVmsDevicePort");	

	var reqUrl = "http://" + deviceAddr +":"+devicePort + "/api/server/list?srv_type=1";
	httpGetServerListAsync(reqUrl, httpGetServerListAsyncCallback);			
	
}


/*
 * "레코딩 서버 정보조회" 버튼(btnRecordingServerInfo)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnRecordingServerInfoClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnRecordingServerInfo = e.control;
	
	
	var grdSearchRecordServerList = app.lookup("grdSearchRecordServerList");
	
	var count = grdSearchRecordServerList.getRowCount();
	if(count == 1)
	{
		selectRecordServerSerial = grdSearchRecordServerList.getRow(0).getValue("srv_serial");
	}
	else
	{
		var selectRow = grdSearchRecordServerList.getSelectedRow();
		if (selectRow == null) {
			
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_VmsSelectRecordServer"));
			return;
		}		
		
		selectRecordServerSerial = selectRow.getValue("srv_serial");
		console.log("selectRecordServerSerial: " + selectRecordServerSerial);
	}

	var reqUrl = "http://" + deviceAddr +":"+devicePort + "/api/server/" + selectRecordServerSerial;
	httpGetServerStorageAsync(reqUrl, httpGetServerStorageAsyncCallback);	

}




function httpGetServerStorageAsync(theUrl, callback) { //theURL or a path to file
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var data = httpRequest.responseText;  //if you fetch a file you can JSON.parse(httpRequest.responseText)
            if (callback) {
                callback(data);
            }                   
        }
    };
    
    console.log("httpGetServerStorageAsync theUrl: " + theUrl);
    
    httpRequest.open('GET', theUrl, true); 

    httpRequest.setRequestHeader('x-auth-token', authToken);
    httpRequest.setRequestHeader('x-api-serial', apiSerial);
    httpRequest.send(null);
}

 function httpGetServerStorageAsyncCallback(data){
    var jsonContent = JSON.parse(data);

    console.log(jsonContent);
  
  	
  	var dsStorageInfo = app.lookup("dsStorageInfo"); 
  	dsStorageInfo.clear();
  
  	var kk=0;
    
  	for(kk = 0;kk<jsonContent.results.length;kk++)
  	{
  		var ii =0;
	    for(ii = 0;ii<jsonContent.results[kk].storage.length;ii++)
	  	{		
	  		var row  = dsStorageInfo.addRow();
	  		dsStorageInfo.setValue(row.getIndex(), "disk", jsonContent.results[kk].storage[ii].disk);
	  		dsStorageInfo.setValue(row.getIndex(), "file system", jsonContent.results[kk].storage[ii].file_system);
	  		dsStorageInfo.setValue(row.getIndex(), "total", jsonContent.results[kk].storage[ii].total);
	  		dsStorageInfo.setValue(row.getIndex(), "used", jsonContent.results[kk].storage[ii].used);
	  		dsStorageInfo.setValue(row.getIndex(), "use", jsonContent.results[kk].storage[ii].is_vfs_use);
	  		dsStorageInfo.setValue(row.getIndex(), "directory", jsonContent.results[kk].storage[ii].vfs_additional_path);
	  		
	  		
	  	}
	  	
	  	break;
	 }
  	
  	var grdStorage = app.lookup("grdStorage"); 
  	grdStorage.redraw();
  	
}
