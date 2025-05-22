/************************************************
 * idteckAcuMonitoring.js
 * Created at 2023. 9. 13. ���� 1:56:30.
 *
 * @author kth
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var usint_version;

var MRMAN_init = false;
var acuDeviceMap = new Map();
var terminalStatus = new Array();
var dataDragManager = cpr.core.Module.require("lib/DataDragManager");
var StrLib = cpr.core.Module.require("lib/StrLib");
var programManager = cpr.core.Module.require("lib/ProgramManager");



/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	dataManager = getDataManager();
	
	var cmbContent = app.lookup("IAMEN_cmbContent");
	
	cmbContent.addItem(new cpr.controls.Item("door open alarm", 15)); //new 오래된 문열림 0x0f
	cmbContent.addItem(new cpr.controls.Item("arm read input", 193)); // arm read input 0xc1
	cmbContent.addItem(new cpr.controls.Item("input line short", 194)); // arm read input 0xc2
	cmbContent.addItem(new cpr.controls.Item("input line cut", 195)); // arm read input 0xc3
	cmbContent.addItem(new cpr.controls.Item("sensor low", 227)); // sensor_low 0xe3	
	cmbContent.addItem(new cpr.controls.Item("sensor high", 230)); // 	0xe6
	cmbContent.addItem(new cpr.controls.Item("uom uim disconnect", 231)); // 	0xe7
	cmbContent.addItem(new cpr.controls.Item("uom uim reconnect", 232)); // 	0xe8	 
	//-----<
	cmbContent.addItem(new cpr.controls.Item("forced open", 16)); // 강제오픈 0x10
	cmbContent.addItem(new cpr.controls.Item("out Butten Enabled", 226)); // 활성화	0xe2
	cmbContent.addItem(new cpr.controls.Item("out Butten Disabled", 229)); // 	0xe5
	cmbContent.addItem(new cpr.controls.Item("door close", 228));//비활성화	0xe4
	cmbContent.addItem(new cpr.controls.Item("door open", 225));//활성화	0xe1
	

	usint_version = dataManager.getSystemVersion();
	var cmd1 = app.lookup("IAMEN_cmd_inStatus");
	cmd1.addItem(new cpr.controls.Item("non-contact sign", 0));
	cmd1.addItem(new cpr.controls.Item("contact sign", 1));
	
	var cmd2 = app.lookup("IAMEN_cmd_outStatus");
	cmd2.addItem(new cpr.controls.Item("non-contact sign", 0));
	cmd2.addItem(new cpr.controls.Item("contact sign", 1));
	
	//-- 추가되는 경우 별도 함추 추가하여 처리
 	var acuDeviceList = dataManager.getIdteckAcuDeviceList();
	
	if (acuDeviceList) {
		var dsAcuDeviceList = app.lookup("AcuDeviceList");
		dsAcuDeviceList.clear();
		
		var boardIDs = [];
		for (var i = 0; i < acuDeviceList.getRowCount(); i++) { // console에 단말기 ID 로그 출력
			boardIDs[i] = acuDeviceList.getValue(i, "BoardID");
		}
		console.log("[else] boardIDs : " + boardIDs);
		acuDeviceList.copyToDataSet(dsAcuDeviceList);
		
		dsAcuDeviceList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
		dsAcuDeviceList.copyToDataSet(app.lookup("GrdAcuDeviceList"));
		
		app.lookup("GrdAcuDeviceList").commit();
		
		for (var i = 0; i < dsAcuDeviceList.getRowCount(); i++) {			
			var acuDevice = dsAcuDeviceList.getRow(i);
			acuDeviceMap.set(acuDevice.getValue("BoardID"), acuDevice);
			var boardID = dsAcuDeviceList.getValue(i, "BoardID");
			var status = dsAcuDeviceList.getValue(i, "Status");
			var msg = JSON.parse('[{"BoardID":'+boardID+',"Status":'+status+'}]');
			onUpdateAcuDeviceStatus(msg, true);
		}
		
		var grdDeviceList = app.lookup("IAMEN_grd_deviceList");
		grdDeviceList.redraw();
		dsAcuDeviceList.setSort("BoardID asc");
	}
	MRMAN_init = true;
	//리더기상태 최신정보 별도로 가져온다? 왜? 
	
	
	var sms_getTerminalLiveInfo = app.lookup("sms_getIdTeckAcuDeviceLiveInfo");
	sms_getTerminalLiveInfo.send();
	
}
/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getIdTeckAcuDeviceLiveInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var acuLiveInfoList = app.lookup("AcuLiveInfoList");
		var count = acuLiveInfoList.getRowCount();	
		for (var i = 0; i < count; i++) {
			var liveInfo = acuLiveInfoList.getRow(i);			
			var acuDeviceInfo = acuDeviceMap.get(liveInfo.getValue("BoardID"));
			if( acuDeviceInfo ){				
				if(acuDeviceInfo.getValue("Status")!= liveInfo.getValue("Status")){
					acuDeviceInfo.setValue("Status", liveInfo.getValue("Status"));	
					var msg = JSON.parse('[{"BoardID":'+liveInfo.getValue("BoardID")+',"Status":'+liveInfo.getValue("Status")+'}]');
					onUpdateAcuDeviceStatus(msg,true);			
				}
			} 
		}
	}
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getIdTeckAcuDeviceLiveInfo = e.control;
	
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getIdTeckAcuDeviceLiveInfo = e.control;
	
}

function onUpdateAcuDeviceStatus(msg,force){	
	for(var i=0; i<msg.length; i++){
		
		console.log("BoardID : ",msg[i].BoardID," ","Status : ",msg[i].Status);
		var acuDevice = acuDeviceMap.get(msg[i].BoardID);
		if (acuDevice == undefined) {//데이터가 없을때
			continue;
		}		
		
		var changedValue = msg[i].Status^acuDevice.getValue("Status");
		acuDevice.setValue("Status",msg[i].Status);
		//// 상태 변경
		var acuStatus = msg[i].Status;
		// 바이너리 처리는 없음
		if(msg[i].Status == 1){
			onStatusUpdate(acuStatus, acuDevice);
		///	onStatusUpdate(4,valueBinary[32-1-4],terminal);
			return;
		}
		
		if(changedValue==0&&force==false){return;}
				
		//status1
		if(force == true ){
			//onStatusUpdate(value, acuDevice)
			onStatusUpdate(acuStatus, acuDevice);
		}
				
	}		
}

function onStatusUpdate(value, acuDevice) {
	if (value == 1) {//연결
		acuDevice.setValue("Status", 1);
	} else {//단절
		acuDevice.setValue("Status", 0);
	}
}
// 실시간 ACU장비 정보 수신. main의 웹 소켓을 통해 단말기 라이브 정보 수신시 호출
exports.updateIdteckAcuLiveStatus = function(msg) {
	//console.log(msg);
	onUpdateAcuDeviceStatus(msg,false);	
	//2024.06.07 
	grdAcuDeviceReload(); 
	onUpdateSubDeviceStatus(msg,false);
}

function onUpdateSubDeviceStatus(msg,force){
	var grdDeviceList = app.lookup("IAMEN_grd_deviceList");
	var getSelectedIndices = grdDeviceList.getSelectedIndices();
	if (getSelectedIndices.length > 0) {//뭐라도 선택되어 있고
		
		var row = grdDeviceList.getRow(getSelectedIndices[0]);
		var grdBoardID = row.getValue("BoardID");
		for(var i=0; i<msg.length; i++){
			
			//console.log("BoardID : ",msg[i].BoardID," ","Status : ",msg[i].Status);
			var acuDevice = acuDeviceMap.get(msg[i].BoardID);
			if (acuDevice == undefined) {//데이터가 없을때
				continue;
			}		
			//--------------------------------------------
			if (msg[i].BoardID != grdBoardID) {//필요없는것
				continue;
			}
			if (msg[i].SubDeviceList) {
				var subLen = msg[i].SubDeviceList.length;
				for (var j=0; j < subLen;j++) {// 매번 돌면서 처리
					var subDeviceInfo = msg[i].SubDeviceList[j];
					var set = subDeviceInfo.InputStatus || subDeviceInfo.OutputStatus;
					//console.log(set);
					setSubDeviceInfo(subDeviceInfo);	
				}				
			}
			
		}
	}
	app.lookup("IAMEN_grd_subDeviceList").redraw();
}
function setSubDeviceInfo(subDeviceInfo) {
	var row = app.lookup("SubAcuDeviceList").findFirstRow("BoardID == "+ subDeviceInfo.BoardID + " and InoutPortNo == " + subDeviceInfo.InoutPortNo);
	if (row) {
		row.setRowData(subDeviceInfo);
		row.setState(cpr.data.tabledata.RowState.UNCHANGED);
	}
}
function grdAcuDeviceReload(){  /* 웹 소켓 받을때마다 그리드 스크롤이 최상단으로 올라가는 이슈(남아공) - 수정 */
    var grdAcuDeviceList = app.lookup("GrdAcuDeviceList");
    var acuDeviceList = app.lookup("AcuDeviceList");
    for (var i = 0; grdAcuDeviceList.getRowCount() > i ; i++) {
    	if (grdAcuDeviceList.getRowData(i).Status != acuDeviceList.findFirstRow("BoardID == " + grdAcuDeviceList.getRowData(i).BoardID).getValue("Status")) {
    		grdAcuDeviceList.setValue(i, "Status", acuDeviceList.findFirstRow("BoardID == " + grdAcuDeviceList.getRowData(i).BoardID).getValue("Status"));
    	}    
    }
   	grdAcuDeviceList.commit();
   	//MRMAN_grdTerminalList
    app.lookup("IAMEN_grd_deviceList").redraw();
}

// acu 정보 업데이트. type - 1:추가, 2:수정, 3:삭제
exports.updateAcuDeviceInfo = function( acuDeviceInfo, type ){
	
	var dsAcuDeviceList = app.lookup("AcuDeviceList");
	var acuDeviceRow = acuDeviceMap.get(acuDeviceInfo.BoardID);

	if( type == 1 || type == 2 ){ // type : 1 추가, 2 : 수정
		if( acuDeviceRow ){
			// 출입문 원격 제어 수정
			if (type == 2){
				var acuDeviceListFindRow = dsAcuDeviceList.findFirstRow('BoardID =='+acuDeviceInfo.BoardID );
				
			}
			
			
		} else {			
			if( acuDeviceInfo.Status == 1 ){
				
			}
	
			acuDeviceRow = dsAcuDeviceList.addRowData(acuDeviceInfo);
			acuDeviceRow = acuDeviceMap.get(acuDeviceRow.BoardID);			
			if( acuDeviceRow ){
				//console.log("updateTerminalInfo add row: ",terminalRow.getRowData());
				acuDeviceMap.set(acuDeviceInfo.BoardID, acuDeviceRow);
			}
				
		}						
	}else if( type == 3){
		if( acuDeviceRow ){
			dsAcuDeviceList.realDeleteRow(acuDeviceRow.getIndex());
		}
		acuDeviceMap.delete(acuDeviceInfo.BoardID);
	}
	dsAcuDeviceList.commit();
	app.lookup("IAMEN_grd_deviceList").redraw();
}
exports.addIdteckAcuEventLog = function (idteckAcuEventLog) {
	var acuDeviceList = dataManager.getIdteckAcuDeviceList();
	var dsEventLogList = app.lookup("AcuEventLogList");
	
	var newRow = dsEventLogList.insertRowData(0, false, idteckAcuEventLog);
	var deviceName = acuDeviceList.findFirstRow("BoardID=="+newRow.getValue("BoardID")).getValue("DeviceName");
	newRow.setValue("DeviceName",deviceName);
	newRow.setState(cpr.data.tabledata.RowState.UNCHANGED);
	
	var rowCount = dsEventLogList.getRowCount();
	if (rowCount > 10000) {
		var newRow = dsEventLogList.getRowDataRanged(0, 5000);

		dsEventLogList.clear();
		dsEventLogList.build(newRow);
	}
	///setTerminalEventVal(idteckAcuEventLog.BoardID, idteckAcuEventLog.Content);
	// 상태변경은 하위장비들 리스트있을때만	
}

/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onIAMEN_grd_deviceListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var iAMEN_grd_deviceList = e.control;
	var getSelectedIndices = iAMEN_grd_deviceList.getSelectedIndices();
	if (getSelectedIndices != null && getSelectedIndices.length > 0) {
		// 서버에 물어본다.
		var row = app.lookup("AcuDeviceList").getRow(getSelectedIndices[0]);
		var boardID= row.getValue("BoardID");
		var lowAcuDeviceList = app.lookup("LowAcuDeviceList");
		lowAcuDeviceList.clear();
		// -> 기존 리스트 초기화
		var smsGetLowAcuDeviceList = app.lookup("sms_getLowAcuDeviceList");
		smsGetLowAcuDeviceList.action = "/v1/bosk/acus/LowDevice/" + boardID;
		comLib.showLoadMask("","ACU 하위장비 얻어오기","",0);
		smsGetLowAcuDeviceList.send();
	}
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getLowAcuDeviceListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getLowAcuDeviceList = e.control;
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){	
		var subAcuDeviceList = app.lookup("SubAcuDeviceList");
		subAcuDeviceList.clear();
		var lowAcuDeviceList = app.lookup("LowAcuDeviceList");
		if (lowAcuDeviceList) {
			for (var i=0; i< lowAcuDeviceList.getRowCount() ; i++) {
				var row = lowAcuDeviceList.getRow(i);
				subAcuDeviceList.addRowData({"BoardID": row.getValue("BoardID"), "LowDeviceName": row.getValue("LowDeviceName"),"InoutPortNo": row.getValue("InoutPortNo"), "InputStatus": 0, "OutputStatus": 0});
			}			
		}
		subAcuDeviceList.setSort("BoardID asc");
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}
