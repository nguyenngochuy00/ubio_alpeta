/************************************************
 * acuIdteckDeviceManagement.js
 * Created at 2023. 8. 16. ���� 3:14:06.
 *
 * @author kth
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var inputValidManager = createInputValidator(app);
var IADM_pageRowCount = 25;
var IADM_version;
var comLib;

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	IADM_version = dataManager.getSystemVersion();
	setPageIndexer(0, 1, IADM_pageRowCount, 10);
	var boardID = app.lookup("IADM_nbe_boardID");
	var description = app.lookup("IADM_ipb_description");
	boardID.max = 255;
	//boardID.min = 1;
	description.value = '';
	inputValidManager.validate(app.lookup("IADM_nbe_boardID"), "isNull", dataManager.getString("Str_RequiredAlert"));
	
	var cmdCtrl = app.lookup("IADM_cmb_searchCategory");
	cmdCtrl.addItem(new cpr.controls.Item("all","all")); 
	cmdCtrl.addItem(new cpr.controls.Item(dataManager.getString("Str_BOSK_BOARDID"),"boardID"));
	cmdCtrl.addItem(new cpr.controls.Item(dataManager.getString("Str_BOSK_DEVICENAME"),"deviceName")); 
	cmdCtrl.addItem(new cpr.controls.Item(dataManager.getString("Str_BOSK_IPADDRESS"),"ip"));
	cmdCtrl.selectItem(0);//0
	cmdCtrl.redraw();
	
	app.lookup("IADM_btn_modify").enabled = false;
	app.lookup("IADM_btn_reset").enabled = false;
	app.lookup("IADM_btn_systemInit").enabled = false;
	app.lookup("IADM_btn_timeSync").enabled = false;
}
function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("IADM_pageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}

function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("IADM_pageIndexer");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = IADM_pageRowCount;
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}


/*
 * "초기화" 버튼(IADM_btn_init)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onIADM_btn_initClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var iADM_btn_init = e.control;
	initAcuDeviceInfo();
}

/*
 * "검색" 버튼(IADM_btn_searchBtn)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onIADM_btn_searchBtnClick(/* cpr.events.CMouseEvent */ e){
	var pageIndex = app.lookup("IADM_pageIndexer");	
	pageIndex.currentPageIndex = 1; // 검색버튼은 항상 최초 페이지
	//기존 선택 내용 초기화 필요
	app.lookup("IADM_grd_main").clearSelection(false);// 취소만 하고 이벤트 발생 x
	app.lookup("AcuIdteckDevice").clear();// 제거
	app.lookup("IADM_nbe_boardID").enabled = true;
	sendSearchRequest();	
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getAcuDeviceListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){		
		var totalCount = app.lookup("Total").getValue("Count");
		selectPaging(totalCount, 10);
		
		app.lookup("IADM_lbTotal").value = totalCount;
		app.lookup("IADM_grd_main").redraw();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}


/*
 * "추가" 버튼(IADM_btn_add)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onIADM_btn_addClick(/* cpr.events.CMouseEvent */ e){
	var acuIdteckDevice = app.lookup("AcuIdteckDevice");
	var boardID = acuIdteckDevice.getValue("BoardID");
	var nbeBoardID = app.lookup("IADM_nbe_boardID");
	if (boardID == 0 || boardID == '') {
		nbeBoardID.value = ''; /* 비워줘서 placeholder값 노출되도록 */
		inputValidManager.validate(nbeBoardID, "isNull", dataManager.getString("Str_RequiredAlert"));
		nbeBoardID.focus();
		return;
	} 
	
	if (!/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/g.test(acuIdteckDevice.getValue("IpAddress"))) {
		var ipbIPAddress = app.lookup("IADM_ipb_ipaddress");
		ipbIPAddress.value ="";
		inputValidManager.validate(nbeBoardID, "isNull", dataManager.getString("Str_RequiredAlert"));
		ipbIPAddress.focus();
		return;
	}
	var port = acuIdteckDevice.getValue("Port");
	if (port.toString().length <= 0) {
		var ipbPort = app.lookup("IADM_ipb_port");
		inputValidManager.validate(nbeBoardID, "isNull", dataManager.getString("Str_RequiredAlert"));
		ipbPort.focus();
		return;
	}
	comLib.showLoadMask("","ACU Device Regist","",0);
	app.lookup("sms_postAcuIdteck").send();
}
//-----------------------------------------------------------------------------------------> make func
function initAcuDeviceInfo() {
	var grdMain = app.lookup("IADM_grd_main");
	grdMain.clearAllCheck();
	grdMain.clearSelection();
	app.lookup("IADM_nbe_boardID").enabled = true;
	app.lookup("IADM_nbe_boardID").value = 0;
	app.lookup("IADM_ipb_deviceName").value = "";
	app.lookup("IADM_ipb_ipaddress").value = "";
	app.lookup("IADM_ipb_port").value = "";
	app.lookup("IADM_ipb_description").value = "";
	app.lookup("IADM_btn_add").enabled = true;
	app.lookup("IADM_btn_modify").enabled = false;
	app.lookup("IADM_btn_reset").enabled = false;
	app.lookup("IADM_btn_systemInit").enabled = false;
	app.lookup("IADM_btn_timeSync").enabled = false;

	
}
function sendSearchRequest() {
	var pageIndexer = app.lookup("IADM_pageIndexer");
	app.lookup("AcuDeviceList").clear();
	var curPageIndex = pageIndexer.currentPageIndex;
	var offset = (curPageIndex-1) * IADM_pageRowCount;
	var submision = app.lookup("sms_getAcuDeviceList");

	submision.setParameters("offset", offset);	
	submision.setParameters("limit", IADM_pageRowCount);
	
	submision.setParameters("searchCategory", app.lookup("IADM_cmb_searchCategory").value);
	submision.setParameters("searchKeyword", app.lookup("IADM_ipb_searchKeyword").value);
	comLib.showLoadMask("","ACU DeviceInfo Search","",0);
	submision.send();
}

function fn_deviceCmdRequest(cmdType) {
	var grdMainList = app.lookup("IADM_grd_main");
	var chkIndice = grdMainList.getCheckRowIndices();
	var total = chkIndice.length;
	if (total < 1) {// 체크된것이 없다.
		dialogAlert(app, dataManager.getString("Str_Warning"), "No Checked device.");
		return;	
	}

	dialogConfirm(app, dataManager.getString("Str_Warning"), fn_getWarningString(cmdType), function(/*cpr.controls.Dialog*/dialog){
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				var dsAcuDeviceIDList = app.lookup("AcuDeviceIDList");
				dsAcuDeviceIDList.clear();
				for (var i =0 ; i< total; i++) {
					var row = grdMainList.getRow(chkIndice[i]);
					dsAcuDeviceIDList.addRowData({"BoardID":row.getValue("BoardID")});
				}
				dsAcuDeviceIDList.commit();
				
				comLib.showLoadMask("pro", dataManager.getString("Str_Data")+" "+dataManager.getString("Str_Sync"), "", total);
				if (cmdType == "reset") {
					sendAcuDeviceReset();	
				} else if (cmdType == "systemInit") {
					sendAcuDeviceSystemInit();
				} else if (cmdType == "timeSync") {
					sendAcuDeviceTimeSync();
				} else if (cmdType =="totalEventDataDelete") {
					sendAcuDeviceTotalEventDataDelete();
				}
				
			}
		});
	});
}
function fn_getWarningString(cmdType) {
	switch(cmdType){
		case "reset" :
			return "Do you want to restart the device?";
		case "systemInit":
			return "Are you going to reset device?";
			case "timeSync":
			return "Do you want to proceed with time synchronization?";
		default :
			return "This is an unknown request. Do you want to proceed?";
	}
}
//-----------------------------------------------------------------------------------------< make func end




/*
 * 넘버 에디터에서 value-change 이벤트 발생 시 호출.
 * NumberEditor의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onIADM_nbe_boardIDValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.NumberEditor
	 */
	var iADM_nbe_boardID = e.control;
	var acuIdteckDevice = app.lookup("AcuIdteckDevice");
	var nbeBoardID = app.lookup("IADM_nbe_boardID");
	if(iADM_nbe_boardID.value == 0 || iADM_nbe_boardID.value == ''){
		acuIdteckDevice.setValue('BoardID', '');
		inputValidManager.validate(nbeBoardID, "isNull", dataManager.getString("Str_RequiredAlert"));
	} else {
		inputValidManager.validate(nbeBoardID, "isValid", "");
	}
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postAcuIdteckSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_postAcuIdteck = e.control;
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		// 정상이면 검색 ㄱㄱ
		sendSearchRequest();
	} else {
		dialogAlertCustomSize(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)), 0, 280, 150);
	}
}


/*
 * "삭제" 버튼(IADM_btn_del)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onIADM_btn_delClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var iADM_btn_del = e.control;
	
	var grdMainList = app.lookup("IADM_grd_main");
	var chkIndice = grdMainList.getCheckRowIndices();
	var total = chkIndice.length;
	if (total < 1) {// 체크된것이 없다.
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedTerminals"));
		return;	
	}
	dialogConfirm(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_DeleteConfirm"), function(/*cpr.controls.Dialog*/dialog){
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				var dsAcuDeviceIDList = app.lookup("AcuDeviceIDList");
				dsAcuDeviceIDList.clear();
				for (var i =0 ; i< total; i++) {
					var row = grdMainList.getRow(chkIndice[i]);
					dsAcuDeviceIDList.addRowData({"BoardID":row.getValue("BoardID")});
				}
				dsAcuDeviceIDList.commit();
				
				comLib.showLoadMask("pro", dataManager.getString("Str_Data")+" "+dataManager.getString("Str_Sync"), "", total);
				sendAcuDeviceDelete();
			}
		});
	});
}

function sendAcuDeviceDelete(){
	var dsAcuDeviceIDList = app.lookup("AcuDeviceIDList");
	var row = dsAcuDeviceIDList.getRow(0);
	if( row ){
		var AcuDeviceID = row.getValue("BoardID")
		//dsTerminalIDList.deleteRow(0);
		dsAcuDeviceIDList.commit();

		var dmResult = app.lookup("Result");
		var sms_deleteAcuDevice =  new cpr.protocols.Submission("sms_deleteAcuDevice");
		sms_deleteAcuDevice.setParameters("BoardID", AcuDeviceID);
		sms_deleteAcuDevice.method = "delete";
		sms_deleteAcuDevice.mediaType = "application/x-www-form-urlencoded";
		sms_deleteAcuDevice.action = "/v1/bosk/acus/"+AcuDeviceID;
		//sms_deleteTerminal.userAttr("rowIndex", row.getValue("rowIndex").toString());
		sms_deleteAcuDevice.addResponseData(dmResult);
		sms_deleteAcuDevice.addEventListenerOnce("submit-done", onSms_deleteAcuDeviceSubmitDone);
		sms_deleteAcuDevice.addEventListenerOnce("submit-error", onSms_getSubmitError);
		sms_deleteAcuDevice.addEventListenerOnce("submit-timeout", onSms_getSubmitTimeout);

		sms_deleteAcuDevice.send();
	} else {
		comLib.hideLoadMask();
	}
}


function onSms_deleteAcuDeviceSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var finished = false;
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		var dsAcuDeviceIDList = app.lookup("AcuDeviceIDList");
		var row = dsAcuDeviceIDList.getRow(0);
		var boardID = row.getValue("BoardID")
		dsAcuDeviceIDList.realDeleteRow(0);
		//var gridTerminalList = app.lookup("TMMGR_udcTerminalList");
		//gridTerminalList.deleteRow(terminalID);
		
		var total = dsAcuDeviceIDList.getRowCount();
		if( total > 0 ){
			comLib.updateLoadMask("");
			sendAcuDeviceDelete();
		} else {
			comLib.hideLoadMask();
			dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_TerminalDelete"));
			sendSearchRequest();
		}
	} else {

		//var sms_deleteTerminal = app.lookup("sms_deleteTerminal");
		//var terminalID = sms_deleteTerminal.getParameters("id");
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorPrivilegeNotPermission"));
	}

}

/*
 * "수정" 버튼(IADM_btn_modify)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onIADM_btn_modifyClick(/* cpr.events.CMouseEvent */ e){
	var grd = app.lookup("IADM_grd_main");
	var getSelectedIndices = grd.getSelectedIndices();
	if (getSelectedIndices == null || getSelectedIndices == undefined) {
		dialogAlert(app, dataManager.getString("Str_Failed"), "No Selected device.");
		return;
	} else if (getSelectedIndices.length <= 0) {
		dialogAlert(app, dataManager.getString("Str_Failed"), "No Selected device.");
		return;
	}
	// add와 같은 형식
	var acuIdteckDevice = app.lookup("AcuIdteckDevice");
	
	acuIdteckDevice.setValue("BoardID", app.lookup("IADM_nbe_boardID").value);
	acuIdteckDevice.setValue("DeviceName", app.lookup("IADM_ipb_deviceName").value);
	acuIdteckDevice.setValue("Description", app.lookup("IADM_ipb_description").value);
	var ipaddr = app.lookup("IADM_ipb_ipaddress");
	if (!/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/g.test(ipaddr.value)) {
		ipaddr.value ="";
		inputValidManager.validate(ipaddr, "isNull", dataManager.getString("Str_RequiredAlert"));
		ipaddr.focus();
		return;
	}
	acuIdteckDevice.setValue("IpAddress", ipaddr.value);
	
	var port = app.lookup("IADM_ipb_port");
	if (port.value.length <= 0) {
		inputValidManager.validate(port, "isNull", dataManager.getString("Str_RequiredAlert"));
		port.focus();
		return;
	}
	acuIdteckDevice.setValue("Port", parseInt(port.value, 10));
	comLib.showLoadMask("","ACU 장비 등록","",0);
	app.lookup("sms_putAcuDevice").send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_putAcuDeviceSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_putAcuDevice = e.control;
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		initAcuDeviceInfo();// 성공 했으면 초기화
		sendSearchRequest();
	} else {
		dialogAlertCustomSize(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)), 0, 280, 150);
	}
}


/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onIADM_grd_mainSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var iADM_grd_main = e.control;
	var getSelectedIndices = iADM_grd_main.getSelectedIndices();
	var btnAdd = app.lookup("IADM_btn_add");
	var btnMod = app.lookup("IADM_btn_modify");
	var btnReset =  app.lookup("IADM_btn_reset");
	var btnSysInit = app.lookup("IADM_btn_systemInit");
	var btnTimeSysc = app.lookup("IADM_btn_timeSync");
	if (getSelectedIndices != null && getSelectedIndices.length > 0) {
		var rowIdx = getSelectedIndices[0];
		var row = iADM_grd_main.getRow(rowIdx);
		app.lookup("IADM_nbe_boardID").value = row.getValue("BoardID");
		app.lookup("IADM_ipb_deviceName").value = row.getValue("DeviceName");
		app.lookup("IADM_ipb_ipaddress").value = row.getValue("IpAddress");
		app.lookup("IADM_ipb_port").value = row.getValue("Port");
		app.lookup("IADM_ipb_description").value = row.getValue("Description");
		app.lookup("IADM_nbe_boardID").enabled = false;
		
		btnAdd.enabled = false;
		btnMod.enabled = true;
		btnReset.enabled = true;
		btnSysInit.enabled = true;
		btnTimeSysc.enabled = true;
		app.lookup("IADM_grd_rightMain").redraw();
	} else {// 여기는 선택된게 없어
		btnAdd.enabled = true;
		btnMod.enabled = false;
		btnReset.enabled = false;
		btnSysInit.enabled = false;
		btnTimeSysc.enabled = false;
	}
	app.lookup("IADM_grp_main").redraw();
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onIADM_cmb_searchCategorySelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var iADM_cmb_searchCategory = e.control;
	var getSelectedIndices = iADM_cmb_searchCategory.getSelectedIndices();
	var rowIdx = getSelectedIndices[0];
	//var item = iADM_cmb_searchCategory.getItem(rowIdx);
	var cmb_searchCategory = app.lookup("IADM_cmb_searchCategory");
	var label = cmb_searchCategory.getItem(rowIdx).label;
	if (label == "all") {
		app.lookup("IADM_ipb_searchKeyword").enabled = false;
	} else {
		app.lookup("IADM_ipb_searchKeyword").enabled = true;
	}
}

/*
 * "Reset" 버튼(IADM_btn_reset)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onIADM_btn_resetClick(/* cpr.events.CMouseEvent */ e){
	fn_deviceCmdRequest("reset");
}

function sendAcuDeviceReset(){
	var dsAcuDeviceIDList = app.lookup("AcuDeviceIDList");
	var row = dsAcuDeviceIDList.getRow(0);
	if( row ){
		var AcuDeviceID = row.getValue("BoardID");
		//dsTerminalIDList.deleteRow(0);
		dsAcuDeviceIDList.commit();

		var dmResult = app.lookup("Result");
		var sms_deleteAcuDevice =  new cpr.protocols.Submission("sms_getAcuDevice");
		sms_deleteAcuDevice.setParameters("BoardID", AcuDeviceID);
		sms_deleteAcuDevice.method = "PUT";
		sms_deleteAcuDevice.mediaType = "application/x-www-form-urlencoded";
		sms_deleteAcuDevice.action = "/v1/bosk/acus/reset/"+AcuDeviceID;
		//sms_deleteTerminal.userAttr("rowIndex", row.getValue("rowIndex").toString());
		sms_deleteAcuDevice.addResponseData(dmResult);
		sms_deleteAcuDevice.addEventListenerOnce("submit-done", onSms_resetAcuDeviceSubmitDone);
		sms_deleteAcuDevice.addEventListenerOnce("submit-error", onSms_getSubmitError);
		sms_deleteAcuDevice.addEventListenerOnce("submit-timeout", onSms_getSubmitTimeout);

		sms_deleteAcuDevice.send();
	} else {
		comLib.hideLoadMask();
	}
}

function onSms_resetAcuDeviceSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		var dsAcuDeviceIDList = app.lookup("AcuDeviceIDList");
		var row = dsAcuDeviceIDList.getRow(0);
		var boardID = row.getValue("BoardID")
		dsAcuDeviceIDList.realDeleteRow(0);
		//var gridTerminalList = app.lookup("TMMGR_udcTerminalList");
		//gridTerminalList.deleteRow(terminalID);
		
		var total = dsAcuDeviceIDList.getRowCount();
		if( total > 0 ){
			comLib.updateLoadMask("");
			sendAcuDeviceReset();
		} else {
			comLib.hideLoadMask();
			dialogAlert(app, dataManager.getString("Str_Success"), "ACU Device Reset");
			sendSearchRequest();
		}
	} else {

		//var sms_deleteTerminal = app.lookup("sms_deleteTerminal");
		//var terminalID = sms_deleteTerminal.getParameters("id");
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorPrivilegeNotPermission"));
	}

}

/*
 * "SystemInit" 버튼(IADM_btn_systemInit)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onIADM_btn_systemInitClick(/* cpr.events.CMouseEvent */ e){
	fn_deviceCmdRequest("systemInit");
}

function sendAcuDeviceSystemInit(){
	var dsAcuDeviceIDList = app.lookup("AcuDeviceIDList");
	var row = dsAcuDeviceIDList.getRow(0);
	if( row ){
		var AcuDeviceID = row.getValue("BoardID");
		//dsTerminalIDList.deleteRow(0);
		dsAcuDeviceIDList.commit();

		var dmResult = app.lookup("Result");
		var sms_deleteAcuDevice =  new cpr.protocols.Submission("sms_getAcuDevice");
		sms_deleteAcuDevice.setParameters("BoardID", AcuDeviceID);
		sms_deleteAcuDevice.method = "PUT";
		sms_deleteAcuDevice.mediaType = "application/x-www-form-urlencoded";
		sms_deleteAcuDevice.action = "/v1/bosk/acus/systemInit/"+AcuDeviceID;
		//sms_deleteTerminal.userAttr("rowIndex", row.getValue("rowIndex").toString());
		sms_deleteAcuDevice.addResponseData(dmResult);
		sms_deleteAcuDevice.addEventListenerOnce("submit-done", onSms_systemInitAcuDeviceSubmitDone);
		sms_deleteAcuDevice.addEventListenerOnce("submit-error", onSms_getSubmitError);
		sms_deleteAcuDevice.addEventListenerOnce("submit-timeout", onSms_getSubmitTimeout);

		sms_deleteAcuDevice.send();
	} else {
		comLib.hideLoadMask();
	}
}

function onSms_systemInitAcuDeviceSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		var dsAcuDeviceIDList = app.lookup("AcuDeviceIDList");
		var row = dsAcuDeviceIDList.getRow(0);
		var boardID = row.getValue("BoardID")
		dsAcuDeviceIDList.realDeleteRow(0);
		//var gridTerminalList = app.lookup("TMMGR_udcTerminalList");
		//gridTerminalList.deleteRow(terminalID);
		
		var total = dsAcuDeviceIDList.getRowCount();
		if( total > 0 ){
			comLib.updateLoadMask("");
			sendAcuDeviceSystemInit();
		} else {
			comLib.hideLoadMask();
			dialogAlert(app, dataManager.getString("Str_Success"), "ACU Device init");
			sendSearchRequest();
		}
	} else {

		//var sms_deleteTerminal = app.lookup("sms_deleteTerminal");
		//var terminalID = sms_deleteTerminal.getParameters("id");
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorPrivilegeNotPermission"));
	}

}

/*
 * "@" 버튼(IADM_nbe_FindAcu)에서 click 이벤트 발생 시 호출.
 * 보드 아이디 기준으로 보드 찾는 기능
 */
function onIADM_nbe_FindAcuClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var iADM_nbe_FindAcu = e.control;
	var boardID = app.lookup("IADM_nbe_boardID").value; //보드 아이디
	if (boardID <= 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), "Please check device ID.");
		return;
	}
	var dmResult = app.lookup("Result");
	var dmFindAcuDevice = app.lookup("FindAcuDevice");
	dmResult.clear();
	dmFindAcuDevice.clear();
	var sms_getFindAcuDevice =  new cpr.protocols.Submission("sms_getFindAcuDevice");
	sms_getFindAcuDevice.setParameters("BoardID", boardID);
	sms_getFindAcuDevice.method = "GET";
	sms_getFindAcuDevice.mediaType = "application/x-www-form-urlencoded";
	sms_getFindAcuDevice.action = "/v1/bosk/acus/FindAcu/"+boardID;
	sms_getFindAcuDevice.addResponseData(dmResult);
	sms_getFindAcuDevice.addResponseData(dmFindAcuDevice);
	sms_getFindAcuDevice.addEventListenerOnce("submit-done", onSms_findAcuDeviceSubmitDone);
	sms_getFindAcuDevice.addEventListenerOnce("submit-error", onSms_getSubmitError);
	sms_getFindAcuDevice.addEventListenerOnce("submit-timeout", onSms_getSubmitTimeout);
	comLib.showLoadMask("",dataManager.getString("Str_BOSK_ACUBOARDLISTSEARCH"),"",0);
	sms_getFindAcuDevice.send();
}

function onSms_findAcuDeviceSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if( ResultCode == COMERROR_NONE){
		var appld = "app/custom/bosk_caps/idteckFindAcuInfo" + "?" + IADM_version;
		app.openDialog(appld, {width : 350, height : 600}, function(dialog){
			dialog.headerTitle = "장비 찾기 결과";
			dialog.modal = true;
			dialog.initValue = {"FinedData": app.lookup("FindAcuDevice")};
		}).then(function(returnValue){
			if(returnValue["Result"] == 0){
				app.lookup("IADM_ipb_ipaddress").value = returnValue["DeviceIpAddress"];
				app.lookup("IADM_ipb_port").value = returnValue["DevicePort"];
			}
		});
	} else {
		if (ResultCode == 0x7F000001 )	{
			dialogAlert(app, dataManager.getString("Str_Failed"), "Unable to connect to ACU relay Server. Please check the server status.");
		} else {
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorPrivilegeNotPermission"));
		}
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorPrivilegeNotPermission"));
	}
	app.lookup("IADM_grd_rightMain").redraw();
}

/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onIADM_pageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var iADM_pageIndexer = e.control;
	sendSearchRequest();
}

/*
 * "TimeSync" 버튼(IADM_btn_timeSync)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onIADM_btn_timeSyncClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var iADM_btn_timeSync = e.control;
	fn_deviceCmdRequest("timeSync");
	
}

function sendAcuDeviceTimeSync(){
	var dsAcuDeviceIDList = app.lookup("AcuDeviceIDList");
	var row = dsAcuDeviceIDList.getRow(0);
	if( row ){
		var AcuDeviceID = row.getValue("BoardID");
		//dsTerminalIDList.deleteRow(0);
		dsAcuDeviceIDList.commit();

		var dmResult = app.lookup("Result");
		var sms_deleteAcuDevice =  new cpr.protocols.Submission("sms_getAcuDevice");
		sms_deleteAcuDevice.setParameters("BoardID", AcuDeviceID);
		sms_deleteAcuDevice.method = "PUT";
		sms_deleteAcuDevice.mediaType = "application/x-www-form-urlencoded";
		sms_deleteAcuDevice.action = "/v1/bosk/acus/timeSync/"+AcuDeviceID;
		//sms_deleteTerminal.userAttr("rowIndex", row.getValue("rowIndex").toString());
		sms_deleteAcuDevice.addResponseData(dmResult);
		sms_deleteAcuDevice.addEventListenerOnce("submit-done", onSms_timeSyncAcuDeviceSubmitDone);
		sms_deleteAcuDevice.addEventListenerOnce("submit-error", onSms_getSubmitError);
		sms_deleteAcuDevice.addEventListenerOnce("submit-timeout", onSms_getSubmitTimeout);

		sms_deleteAcuDevice.send();
	} else {
		comLib.hideLoadMask();
	}
}


function onSms_timeSyncAcuDeviceSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		var dsAcuDeviceIDList = app.lookup("AcuDeviceIDList");
		var row = dsAcuDeviceIDList.getRow(0);
		var boardID = row.getValue("BoardID")
		dsAcuDeviceIDList.realDeleteRow(0);
		var total = dsAcuDeviceIDList.getRowCount();
		if( total > 0 ){
			comLib.updateLoadMask("");
			sendAcuDeviceTimeSync();
		} else {
			comLib.hideLoadMask();
			dialogAlert(app, dataManager.getString("Str_Success"), "Time Sync of ACU device completed");
			sendSearchRequest();
		}
	} else {

		//var sms_deleteTerminal = app.lookup("sms_deleteTerminal");
		//var terminalID = sms_deleteTerminal.getParameters("id");
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorPrivilegeNotPermission"));
	}

}

/*
 * 그리드에서 row-dblclick 이벤트 발생 시 호출.
 * detail이 row를 더블클릭 한 경우 발생하는 이벤트.
 */
function onIADM_grd_mainRowDblclick(/* cpr.events.CGridMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var iADM_grd_main = e.control;
	var getSelectedIndices = iADM_grd_main.getSelectedIndices();
	if (getSelectedIndices) {
		if (getSelectedIndices.length > 0) {
			var row = iADM_grd_main.getRow(getSelectedIndices[0]);
			var boardID = row.getValue("BoardID");
			if (boardID  > 0) {// 보드 아이디가 무조건 0보다 커야해
				var appld = "app/custom/bosk_caps/idteckLowDeviceManagement" + "?" + IADM_version;
				app.openDialog(appld, {width : 800, height : 670}, function(dialog){
					dialog.headerTitle = "low Device Management";
					dialog.modal = true;
					dialog.initValue = {"BoardID": boardID};
				}).then(function(returnValue){
					if(returnValue["Result"] == 0){
						
					}
				});
			}
			
			
		
		} 
	} 
	
}

function onIADM_btn_totalEventDataDelClick(/* cpr.events.CMouseEvent */ e){
	fn_deviceCmdRequest("totalEventDataDelete");
}

function sendAcuDeviceTotalEventDataDelete(){
	var dsAcuDeviceIDList = app.lookup("AcuDeviceIDList");
	var row = dsAcuDeviceIDList.getRow(0);
	if( row ){
		var AcuDeviceID = row.getValue("BoardID");
		//dsTerminalIDList.deleteRow(0);
		dsAcuDeviceIDList.commit();

		var dmResult = app.lookup("Result");
		var sms_totalEventDataDeleteAcuDevice =  new cpr.protocols.Submission("sms_getAcuDevice");
		sms_totalEventDataDeleteAcuDevice.setParameters("BoardID", AcuDeviceID);
		sms_totalEventDataDeleteAcuDevice.method = "PUT";
		sms_totalEventDataDeleteAcuDevice.mediaType = "application/x-www-form-urlencoded";
		sms_totalEventDataDeleteAcuDevice.action = "/v1/bosk/acus/totalEventDataDelete/"+AcuDeviceID;
		//sms_deleteTerminal.userAttr("rowIndex", row.getValue("rowIndex").toString());
		sms_totalEventDataDeleteAcuDevice.addResponseData(dmResult);
		sms_totalEventDataDeleteAcuDevice.addEventListenerOnce("submit-done", onSms_deleteEventDataAcuDeviceSubmitDone);
		sms_totalEventDataDeleteAcuDevice.addEventListenerOnce("submit-error", onSms_getSubmitError);
		sms_totalEventDataDeleteAcuDevice.addEventListenerOnce("submit-timeout", onSms_getSubmitTimeout);

		sms_totalEventDataDeleteAcuDevice.send();
	} else {
		comLib.hideLoadMask();
	}
}


function onSms_deleteEventDataAcuDeviceSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		var dsAcuDeviceIDList = app.lookup("AcuDeviceIDList");
		var row = dsAcuDeviceIDList.getRow(0);
		var boardID = row.getValue("BoardID")
		dsAcuDeviceIDList.realDeleteRow(0);
		var total = dsAcuDeviceIDList.getRowCount();
		if( total > 0 ){
			comLib.updateLoadMask("");
			sendAcuDeviceTotalEventDataDelete();
		} else {
			comLib.hideLoadMask();
			dialogAlert(app, dataManager.getString("Str_Success"), "success total eventData delete");
			sendSearchRequest();
		}
	} else {

		//var sms_deleteTerminal = app.lookup("sms_deleteTerminal");
		//var terminalID = sms_deleteTerminal.getParameters("id");
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorPrivilegeNotPermission"));
	}

}
