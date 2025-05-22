/************************************************
 * vmsCamera.js
 * Created at 2020. 5. 28. 오후 1:49:00.
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

	deviceList = new Array(MAX_DEIVCE_CNT);
	for (i = 0; i < MAX_DEIVCE_CNT; i++) {
		deviceList[i] = new deviceStruct();
//		console.log("init deviceList index: " + i)
	}	
	
	//console.log("deviceList: " + deviceList);	
	console.log("authToken: " + authToken);
	console.log("apiSerial: " + apiSerial);
	console.log("userSerial: " + userSerial);
	console.log("deviceAddr: " + deviceAddr);
	console.log("devicePort: " + devicePort);	
	
	//http://127.0.0.1/api/server/list?srv_type=1
	
	//var reqUrl = "http://" + deviceAddr +":"+devicePort + "/api/server/list?srv_type=1";
	//httpGetServerListAsync(reqUrl, httpGetServerListAsyncCallback);	
	
	getDeviceList();
	
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
		
	devAddressMap.clear();	
		
 	var rowIndex = 0;
 	
 	var dsDeviceInfoList = app.lookup("dsDeviceInfoList");
 	dsDeviceInfoList.clear();

	for (var i = 0; i < jsonContent.results.tree.length; i++) {
		console.log(i + ". " + jsonContent.results.tree[i].dev_serial + "/" + jsonContent.results.tree[i].dev_name);
		if (i < MAX_DEIVCE_CNT) {
			deviceList[i].deviceName = jsonContent.results.tree[i].dev_name;
			deviceList[i].deviceSerial = jsonContent.results.tree[i].dev_serial;
			deviceList[i].rtspUrl = "";
			//getDeviceInfo(deviceList[i].deviceSerial);
			//var camId = 'cam0' + (i + 1);
			//document.getElementById(camId).innerText = jsonContent.results.tree[i].dev_name;
			
			dsDeviceList.addRow();
			
			dsDeviceList.setValue(rowIndex, "deviceName", deviceList[i].deviceName);
			dsDeviceList.setValue(rowIndex, "deviceSerial", deviceList[i].deviceSerial);
			dsDeviceList.setValue(rowIndex, "rtspUrl", deviceList[i].rtspUrl);
			
			console.log(dsDeviceList);
			
			var szDeviceSerial = "";
			var intDeviceSerial = -1;
			intDeviceSerial = deviceList[i].deviceSerial;
			szDeviceSerial = intDeviceSerial.toString();
			
			var szDeviceName = "";
			szDeviceName = deviceList[i].deviceName;
			
			
			console.log("szDeviceSerial:" + szDeviceSerial);
			console.log("szDeviceName:" + szDeviceName);
			
			devSerialMap.set(szDeviceSerial, szDeviceName);
			
			var ret = devSerialMap.get(szDeviceSerial);
			
			console.log("ret: " + ret);
			
			getDeviceInfo(deviceList[i].deviceSerial);
						
			rowIndex++;
		}
	}
	
	
	
	//var btnGetMatchingList = e.control;
	
	var dsInnodepList = app.lookup("dsInnodepList");
	dsInnodepList.clear();
	
	var dsInnodepListGrid = app.lookup("dsInnodepListGrid");
	dsInnodepListGrid.clear();
	
	
	
	
	var smsGetTerminalList = app.lookup("sms_getTerminalList");
	
	smsGetTerminalList.setParameters("searchCategory", "");
	smsGetTerminalList.setParameters("searchKeyword", "");
	smsGetTerminalList.setParameters("searchCategory", "");
	smsGetTerminalList.setParameters("groupID", 0);
	smsGetTerminalList.setParameters("subInclude", "true");
	smsGetTerminalList.setParameters("offset", 0);
	smsGetTerminalList.setParameters("limit", 1000);

	smsGetTerminalList.send();			
	




	
}



 function getDeviceInfo(_devSerial){   
	var reqUrl = "http://" + deviceAddr + ":" + devicePort + "/api/device/info/" + _devSerial;
	httpGetDeviceListAsync(reqUrl, httpGetDeviceInfoAsyncCallback);
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

	httpRequest.open('GET', theUrl, true);
	httpRequest.setRequestHeader('x-auth-token', authToken);
	httpRequest.setRequestHeader('x-api-serial', apiSerial);
	apiSerial = apiSerial + 1;
	httpRequest.send(null);
}

function httpGetDeviceInfoAsyncCallback(data) {
	var jsonContent = JSON.parse(data);
	console.log(jsonContent);

	var dsDeviceInfoList = app.lookup("dsDeviceInfoList");
 	
	for (var i = 0; i < jsonContent.results.length; i++) 
	{
		var row = dsDeviceInfoList.addRow();
		
		row.setValue("vms_id", jsonContent.results[i].vms_id);
		row.setValue("dev_serial", jsonContent.results[i].dev_serial);
		row.setValue("dev_name", jsonContent.results[i].dev_name);
		row.setValue("dev_addr", jsonContent.results[i].dev_addr);
		row.setValue("dev_wport", jsonContent.results[i].dev_wport);
		
		var dev_addr = jsonContent.results[i].dev_addr;
		var dev_addr_string = "";
		dev_addr_string = dev_addr.toString();
		
		var dev_wport = jsonContent.results[i].dev_wport;
		var dev_wport_string = "";
		dev_wport_string = dev_wport.toString();
		
		var dev_name = jsonContent.results[i].dev_name;
		var dev_name_string = "";
		dev_name_string = dev_name.toString();
				
		var address = "";
		address = dev_addr_string + ":" + dev_wport_string;
		console.log("httpGetDeviceInfoAsyncCallback address: " + address);
		console.log("httpGetDeviceInfoAsyncCallback dev_name_string: " + dev_name_string);
		
		
		
		devAddressMap.set(address.toString(), dev_name_string);
		
		console.log("devAddressMap.get(address): " + devAddressMap.get(address.toString()));
		
		break;
		
	}
	
	var grdDeviceList = app.lookup("grdDeviceList");
	grdDeviceList.redraw();
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
 * "연결된 장비 리스트 조회" 버튼(btnQearyDeviceList)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnQearyDeviceListClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnQearyDeviceList = e.control;

	//http://127.0.0.1/api/device/list/1/1?dev_only=true

	//var reqUrl = "http://" + deviceAddr +":"+devicePort + "/api/device/page/1/1";
//	var reqUrl = "http://" + deviceAddr +":"+devicePort + "/api/device/list/1/1?dev_only=true";
//	httpGetDevicePageAsync(reqUrl, httpGetDevicePageAsyncCallback);	

	getDeviceList();
}


function httpGetDevicePageAsync(theUrl, callback) { //theURL or a path to file
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var data = httpRequest.responseText;  //if you fetch a file you can JSON.parse(httpRequest.responseText)
            if (callback) {
                callback(data);
            }                   
        }
    };
    
    console.log("httpGetDevicePageAsync theUrl: " + theUrl);
    
    httpRequest.open('GET', theUrl, true); 

    httpRequest.setRequestHeader('x-auth-token', authToken);
    httpRequest.setRequestHeader('x-api-serial', apiSerial);
 
    httpRequest.send(null);
}

 function httpGetDevicePageAsyncCallback(data){
    var jsonContent = JSON.parse(data);

    console.log(jsonContent);
}

/*
 * "Onvif 장비 리스트 조회" 버튼(btnQearyOnvifDeviceList)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnQearyOnvifDeviceListClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnQearyOnvifDeviceList = e.control;
	
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

	comLib.showLoadMask("", "Reaserch Onvif Device List", "", 0);
	
	//var reqUrl = "http://" + deviceAddr +":"+devicePort + "/api/device/onvif?srv_serial=100";
	var reqUrl = "http://" + deviceAddr +":"+devicePort + "/api/device/onvif?srv_serial=" + selectRecordServerSerial + "&dev_only=true";
	httpGetOnvifDeviceListAsync(reqUrl, httpGetOnvifDeviceListAsyncCallback);	
}


function httpGetOnvifDeviceListAsync(theUrl, callback) { //theURL or a path to file
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var data = httpRequest.responseText;  //if you fetch a file you can JSON.parse(httpRequest.responseText)
            if (callback) {
                callback(data);
            }                   
        }
        
        
    };
    
    console.log("httpGetOnvifDeviceListAsync theUrl: " + theUrl);
    
    httpRequest.open('GET', theUrl, true); 

    httpRequest.setRequestHeader('x-auth-token', authToken);
    httpRequest.setRequestHeader('x-api-serial', apiSerial);
   
 
    httpRequest.send(null);
}

 function httpGetOnvifDeviceListAsyncCallback(data){
    var jsonContent = JSON.parse(data);

    var grdOnvifDeviceList = app.lookup("grdOnvifDeviceList");

	console.log("jsonContent********************************");
    console.log(jsonContent);
    
    console.log("jsonContent.results********************************");
    console.log(jsonContent.results);
    
    console.log("jsonContent.results.length********************************");
    console.log(jsonContent.results.length);
    
    var dsOnvifDeviceList = app.lookup("dsOnvifDeviceList");
    dsOnvifDeviceList.clear();
    
    for(var ii=0;ii<jsonContent.results.length;ii++)
    {
   		var row = dsOnvifDeviceList.addRow();
   		
   		console.log(jsonContent.results[ii].address);
   		console.log(jsonContent.results[ii].firmware);
   		console.log(jsonContent.results[ii].location);
   		console.log(jsonContent.results[ii].model);
   		console.log(jsonContent.results[ii].protocol);
   		console.log(jsonContent.results[ii].service_url);
	   		
	   		
	   	var addressTemp = jsonContent.results[ii].address;
	   	var temp1 = addressTemp.split(';');
		var temp2 = temp1[0].split(':');
		var address = "";
   		if ( temp2[1] == null || temp2[1] == "") 
   		{
   			address = temp1[0] + ":" + "80"; 
   		}
   		else 
   		{
   			address = temp1[0];
   		}
   			
    	row.setValue("address", address);
    	row.setValue("firmware", jsonContent.results[ii].firmware);
    	row.setValue("location", jsonContent.results[ii].location);
    	row.setValue("model", jsonContent.results[ii].model);
    	row.setValue("protocol", jsonContent.results[ii].protocol);
    	row.setValue("service_url", jsonContent.results[ii].service_url);
    	
    	//var address = jsonContent.results[ii].address;
    	var address_string = "";
    	address_string = address.toString();
    	
    	var retDevName = devAddressMap.get(address_string);
    	console.log("address_string: " + address_string);
    	console.log("retDevName: " + retDevName);

		//row.setValue("row enable", true);
		
		//grdOnvifDeviceList.getRow(ii).
		
		

    	if(retDevName == undefined){
    		row.setValue("in use", 0);
    		row.setValue("add to vms", 1);
    		row.setValue("row enable", true);
    	
    	} else {
    		row.setValue("in use", 1);
    		row.setValue("add to vms", 0);
    		row.setValue("row enable", false);
    		
    	}
    	
    	console.log("row.getValue('row enable'):" +  row.getValue("row enable"));
    }
 
    comLib.hideLoadMask();

    grdOnvifDeviceList.redraw();
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
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetInnodepListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetInnodepList = e.control;
	
	
	var dsInnodepList = app.lookup("dsInnodepList");
	var dsInnodepListGrid = app.lookup("dsInnodepListGrid");
	
	dsInnodepListGrid.clear();
	
	for (var ii=0;ii< dsInnodepList.getRowCount() ; ii++) {
		
		var row = dsInnodepList.getRow(ii);
		
		var rowGrid = dsInnodepListGrid.addRow();
		
		rowGrid.setValue( "TerminalID", row.getValue("TerminalID"));
		rowGrid.setValue( "DevName1", row.getValue("DevSerial1"));
		rowGrid.setValue( "DevSerial1", row.getValue("DevSerial1"));
		rowGrid.setValue( "DevName2", row.getValue("DevSerial2"));
		rowGrid.setValue( "DevSerial2", row.getValue("DevSerial2"));
	}	
	
	var grdTest = app.lookup("grdTest");
	grdTest.redraw();
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
	
	var dsInnodepListGrid = app.lookup("dsInnodepListGrid");
	dsInnodepListGrid.clear();
	
	var grdTest = app.lookup("grdTest");
	
	var cmbDevName1 = app.lookup("cmbDevName1");
	var cmbDevName2 = app.lookup("cmbDevName2");
	
	cmbDevName1.deleteAllItems();
	cmbDevName2.deleteAllItems();
	
	cmbDevName1.addItem(new cpr.controls.Item("", ""));
	cmbDevName2.addItem(new cpr.controls.Item("", ""));
	
	for(var i=0;i<deviceList.length;i++) 
	{
		if( -1 != deviceList[i].deviceSerial)
		{
//			console.log("deviceName: " + deviceList[i].deviceName);
//			console.log("deviceSerial: " + deviceList[i].deviceSerial);
			// VMS 장비가 없을 경우 중복으로 undefined 값들이 들어가 오류가 발생해  조건 추가
			if (deviceList[i].deviceName != undefined && deviceList[i].deviceSerial != undefined){			
				cmbDevName1.addItem(new cpr.controls.Item(deviceList[i].deviceName, deviceList[i].deviceSerial));
				cmbDevName2.addItem(new cpr.controls.Item(deviceList[i].deviceName, deviceList[i].deviceSerial));
			}		
		}
	}	
	
	var rowCount = TerminalList.getRowCount();
	for(var i=0;i<rowCount;i++) 
	{
		var intID = TerminalList.getValue(i, "ID");
		
		dsInnodepListGrid.addRow();
		dsInnodepListGrid.setValue(i, "TerminalID", intID.toString());
		
		
	}
	
	grdTest.redraw();
	
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmbDevName1SelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var cmbDevName1 = e.control;
		
	var grdTest = app.lookup("grdTest");
	
	var dsInnodepListGrid = app.lookup("dsInnodepListGrid");
	
	var item = cmbDevName1.getSelectionFirst();
	
	//item.label
	
	for(var i=0;i<deviceList.length;i++) 
	{
		if(deviceList[i].deviceSerial == item.value)
		{
			dsInnodepListGrid.setValue(grdTest.getSelectedRowIndex(), "DevSerial1", deviceList[i].deviceSerial);
			//dsInnodepListGrid.setValue(grdTest.getSelectedRowIndex(), "DevName1", deviceList[i].deviceSerial);
			
			break;
		}
		
		if("" == item.value) 
		{
			dsInnodepListGrid.setValue(grdTest.getSelectedRowIndex(), "DevSerial1", "");
			break;
		}
	}		
	
	grdTest.redraw();	
	
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmbDevName2SelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var cmbDevName2 = e.control;
		
	var grdTest = app.lookup("grdTest");
	
	var dsInnodepListGrid = app.lookup("dsInnodepListGrid");
	
	var item = cmbDevName2.getSelectionFirst();
	
	//item.label
	
	for(var i=0;i<deviceList.length;i++) 
	{
		if(deviceList[i].deviceSerial == item.value)
		{
			dsInnodepListGrid.setValue(grdTest.getSelectedRowIndex(), "DevSerial2", deviceList[i].deviceSerial);
			//dsInnodepListGrid.setValue(grdTest.getSelectedRowIndex(), "DevName2", deviceList[i].deviceSerial);
			
			break;
		}
		
		if("" == item.value) 
		{
			dsInnodepListGrid.setValue(grdTest.getSelectedRowIndex(), "DevSerial2", "");
			break;
		}
	}		
	
	grdTest.redraw();	
}


/*
 * "매칭된 리스트 조회" 버튼(btnGetMatchingList)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnGetMatchingListClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnGetMatchingList = e.control;
	
	/*
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
	*/
	
	var dsInnodepList = app.lookup("dsInnodepList");
	dsInnodepList.clear();
	
	var dsInnodepListGrid = app.lookup("dsInnodepListGrid");
	dsInnodepListGrid.clear();	
	
	var smsGetInnodepList = app.lookup("smsGetInnodepList");
	smsGetInnodepList.send();			
	
}


/*
 * "매칭된 리스트 저장" 버튼(btnSaveMatchingList)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnSaveMatchingListClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnSaveMatchingList = e.control;
	
	var dsInnodepList = app.lookup("dsInnodepList");
	var dsInnodepListGrid = app.lookup("dsInnodepListGrid");
	
	dsInnodepList.clear();
	
	for (var ii=0;ii< dsInnodepListGrid.getRowCount() ; ii++) {

		var rowGrid = dsInnodepListGrid.getRow(ii);
		
		var DevSerial1 = "";
		DevSerial1 = rowGrid.getValue("DevSerial1");
		
		var DevSerial2 = "";
		DevSerial2 = rowGrid.getValue("DevSerial2");
			
//		console.log("devSerialMap. get DevSerial1: " + DevSerial1);
//		console.log("devSerialMap. get DevSerial2: " + DevSerial2);
		
		if (DevSerial1 == "" && DevSerial2 == ""){
			continue;
		} else if (DevSerial1 == null && DevSerial2 == null){
			continue;
		}	
			
		var row = dsInnodepList.addRow();

		row.setValue( "TerminalID", rowGrid.getValue("TerminalID"));
		row.setValue( "DevName1", DevSerial1);
		row.setValue( "DevSerial1", rowGrid.getValue("DevSerial1"));
		row.setValue( "DevName2", DevSerial2);
		row.setValue( "DevSerial2", rowGrid.getValue("DevSerial2"));
	}
	
	if (dsInnodepList.getRowCount() > 0){ // VMS 연결 안된 상태에서 저장하면 서버가 죽어서 저장할 내용이 없을 경우는 서버로 전달 안하도록 임시록 막아둠
		var smsPostInnodepList = app.lookup("smsPostInnodepList");
		smsPostInnodepList.send();	
	}	
}


/*
 * "매칭된 리스트 새로만들기" 버튼(btnNewMatchingList)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnNewMatchingListClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnNewMatchingList = e.control;
	
	//var btnGetMatchingList = e.control;
	
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


function httpAddToServerOnvifDeviceAsync(theUrl, body , callback) { //theURL or a path to file
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var data = httpRequest.responseText;  //if you fetch a file you can JSON.parse(httpRequest.responseText)
            if (callback) {
                callback(data);
            }                   
        }
    };
    
    console.log("httpAddToServerOnvifDeviceAsync theUrl: " + theUrl);
    console.log("authToken: " + authToken);
    console.log("apiSerial: " + apiSerial);
    console.log("body: " + JSON.stringify(body));
    
    httpRequest.open('POST', theUrl, true); 
    httpRequest.setRequestHeader('x-auth-token', authToken);
    httpRequest.setRequestHeader('x-api-serial', apiSerial);
    apiSerial = apiSerial + 1;
    httpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    httpRequest.send(JSON.stringify(body));
    
    
    //httpRequest.send(null);
}

 function httpAddToServerOnvifDeviceAsyncCallback(data){
    var jsonContent = JSON.parse(data);
    
    console.log("httpAddToServerOnvifDeviceAsyncCallback jsonContent: " + jsonContent);

	addToVmsIndex++;
	
	AddToServerOnvifDevice();
}


function AddToServerOnvifDevice() {
	
	var grdOnvifDeviceList = app.lookup("grdOnvifDeviceList");	
	if( 0 == grdOnvifDeviceList.getRowCount())
	{
		console.log("AddToServerOnvifDevice 0 == grdOnvifDeviceList.getRowCount()");
		comLib.hideLoadMask();
		return;
	}
		
		
	if (addToVmsIndex > grdOnvifDeviceList.getRowCount())
	{
		console.log("addToVmsIndex > grdOnvifDeviceList.getRowCount()");
		comLib.hideLoadMask();
		return;
	}
	
	console.log("addToVmsIndex: " + addToVmsIndex);
	
	var selectedRow = grdOnvifDeviceList.getRow(addToVmsIndex);
	if(selectedRow == null)
	{
		console.log("addToVmsIndex > selectedRow == null");
		comLib.hideLoadMask();
		return;
	}
	
	if (1 == selectedRow.getValue("in use"))
	{
		console.log("0 == selectedRow.getValue(in use)");
		
		addToVmsIndex++;
		
		AddToServerOnvifDevice();
		return;
	}
	
	if (0 == selectedRow.getValue("add to vms"))
	{
		console.log("0 == selectedRow.getValue(add to vms))");
		
		
		addToVmsIndex++;
		
		AddToServerOnvifDevice();
		return;
	}
	
	if (1 == selectedRow.getValue("in use"))
	{
		console.log("1 == selectedRow.getValue(in use))");
		
		addToVmsIndex++;
		
		AddToServerOnvifDevice();
		return;
	}	
		
	
	var dev_name = selectedRow.getValue("dev_name");
	var dev_user = selectedRow.getValue("dev_user");
	var dev_pass = selectedRow.getValue("dev_pass");
	
	console.log("dev_name: " + dev_name);
	console.log("dev_user: " + dev_user);
	console.log("dev_pass: " + dev_pass);
	
	
	var address = selectedRow.getValue("address");
	console.log("address:" + address);
	var temp = address.split(':');
	
	console.log("temp[0]:" + temp[0]);
	console.log("temp[1]:" + temp[1]);
	
	var dev_addr = temp[0];
	var dev_port = parseInt(temp[1], 10);
	
	var srv_serial_int = parseInt(selectRecordServerSerial, 10);
	
	var params = {
	    "ins_info": {
			"dev_name": dev_name,
			"dev_addr": dev_addr,
			"dev_wport": dev_port,
			"dev_user": dev_user,
			"dev_pass": dev_pass,
			"srv_serial": srv_serial_int,
			"event_conditions": ["di"],
			"event_actions": ["recording"]
		}
	}
	
	console.log("params: " + params);
	
	var reqUrl = "http://" + deviceAddr +":"+devicePort + "/api/device/onvif?srv_serial=" + selectRecordServerSerial;
	httpAddToServerOnvifDeviceAsync(reqUrl, params ,httpAddToServerOnvifDeviceAsyncCallback);	
}



/*
 * "Onvif 장비 추가" 버튼(btnAddOnvifDevice)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnAddOnvifDeviceClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnAddOnvifDevice = e.control;
	
	comLib.showLoadMask("", "add Onvif Device", "", 0);

	addToVmsIndex = 0;
	
	AddToServerOnvifDevice();
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
	
	onCmbDevName1SelectionChange(e);
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
	
	onCmbDevName2SelectionChange(e);
	
}


/*
 * "연결된 장비 삭제" 버튼(btnDeviceDelete)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnDeviceDeleteClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnDeviceDelete = e.control;
	
	console.log("onBtnDeviceDeleteClick");
	
	var grdDeviceList = app.lookup("grdDeviceList");
	
	var selectedRow = grdDeviceList.getSelectedRow();
	if(null == selectedRow)
		return;
		
	var dev_serial = selectedRow.getValue("dev_serial");
		
	var reqUrl = "http://" + deviceAddr +":"+devicePort + "/api/device/onvif?dev_serial=" + dev_serial;
	httpDeleteOnvifDeviceAsync(reqUrl ,httpDeleteOnvifDeviceAsyncCallback);		
}


function httpDeleteOnvifDeviceAsync(theUrl , callback) { //theURL or a path to file
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {

        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var data = httpRequest.responseText;  //if you fetch a file you can JSON.parse(httpRequest.responseText)
            if (callback) {
                callback(data);
            }                   
        }
    };
    
    console.log("httpDeleteOnvifDeviceAsync theUrl: " + theUrl);
    
    httpRequest.open('DELETE', theUrl, true); 
    httpRequest.setRequestHeader('x-auth-token', authToken);
    httpRequest.setRequestHeader('x-api-serial', apiSerial);
    apiSerial = apiSerial + 1;
    httpRequest.send(null);
}

 function httpDeleteOnvifDeviceAsyncCallback(data){
    var jsonContent = JSON.parse(data);
    
    console.log("httpDeleteOnvifDeviceAsyncCallback jsonContent: " + jsonContent);

	getDeviceList();

}


/*
 * "연결된 장비 수정" 버튼(btnDeviceModify)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnDeviceModifyClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnDeviceModify = e.control;
	
	
	var grdDeviceList = app.lookup("grdDeviceList");
	var selectedRow = grdDeviceList.getSelectedRow();
	if(selectedRow == null)
	{
		console.log("grdDeviceList.getSelectedRow() return null");
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_VmsSelectDevice"));
		return;
	}
	
	var dev_name = selectedRow.getValue("dev_name");
	var dev_user = selectedRow.getValue("dev_user");
	var dev_pass = selectedRow.getValue("dev_pass");
	var dev_serial_string = selectedRow.getValue("dev_serial");
	var dev_addr = selectedRow.getValue("dev_addr");
	var dev_wport_string = selectedRow.getValue("dev_wport");
	var dev_wport = parseInt(dev_wport_string, 10);
	var dev_serial = parseInt(dev_serial_string, 10);
	
	var grdSearchRecordServerList = app.lookup("grdSearchRecordServerList");
	
	var count = grdSearchRecordServerList.getRowCount();
	if(count == 1)
	{
		selectRecordServerSerial = grdSearchRecordServerList.getRow(0).getValue("srv_serial");
	}
	else
	{
		var selectedRowServer = grdSearchRecordServerList.getSelectedRow();
		if(selectedRowServer == null)
		{
			console.log("grdSearchRecordServerList.getSelectedRow() return null");
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_VmsSelectRecordServer"));
			return;
		}
		
		selectRecordServerSerial = selectedRowServer.getValue("srv_serial");
	}		
		
	//var srv_serial = selectRecordServerSerial;
	var srv_serial_int = parseInt(selectRecordServerSerial, 10);
	
	console.log("dev_name: " + dev_name);
	console.log("dev_user: " + dev_user);
	console.log("dev_pass: " + dev_pass);
	console.log("dev_serial: " + dev_serial);
	console.log("dev_addr: " + dev_addr);
	console.log("dev_wport_string: " + dev_wport_string);
	console.log("dev_wport: " + dev_wport);
	
	
	var params = {
	    "update_info": {
	    	"dev_serial": dev_serial,
			"dev_name": dev_name,
			"dev_addr": dev_addr,
			"dev_wport": dev_wport,
			"dev_user": dev_user,
			"dev_pass": dev_pass,
			"srv_serial" : srv_serial_int, 
			"event_conditions": ["di"],
			"event_actions": ["recording"]
		}
	}
	
	console.log("params: " + params);
	
	var reqUrl = "http://" + deviceAddr +":"+devicePort + "/api/device/onvif?srv_serial=" + srv_serial_int;
	httpUpdateToServerOnvifDeviceAsync(reqUrl, params ,httpUpdateToServerOnvifDeviceAsyncCallback);		
	
}




function httpUpdateToServerOnvifDeviceAsync(theUrl, body , callback) { //theURL or a path to file
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var data = httpRequest.responseText;  //if you fetch a file you can JSON.parse(httpRequest.responseText)
            if (callback) {
                callback(data);
            }                   
        }
    };
    
    console.log("httpUpdateToServerOnvifDeviceAsync theUrl: " + theUrl);
    
    httpRequest.open('PUT', theUrl, true); 
    httpRequest.setRequestHeader('x-auth-token', authToken);
    httpRequest.setRequestHeader('x-api-serial', apiSerial);
    apiSerial = apiSerial + 1;
    httpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    httpRequest.send(JSON.stringify(body));
    
    
    //httpRequest.send(null);
}

 function httpUpdateToServerOnvifDeviceAsyncCallback(data){
    var jsonContent = JSON.parse(data);
    
    console.log("httpUpdateToServerOnvifDeviceAsyncCallback jsonContent: " + jsonContent);

	getDeviceList();
}


/*
 * 체크 박스에서 value-change 이벤트 발생 시 호출.
 * CheckBox의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onCbxAddtoVmsValueChange(/* cpr.events.CValueChangeEvent */ e){
	var cbxAddtoVms = e.control;
	
	console.log("onCbxAddtoVmsValueChange");
}
