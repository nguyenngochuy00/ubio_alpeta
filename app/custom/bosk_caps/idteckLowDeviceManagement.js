/************************************************
 * idteckLowDeviceManagement.js
 * Created at 2023. 9. 22. ���� 1:53:11.
 *
 * @author kth
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	// 기본 정보 가져오기
	initUICtrl();
	
	var initValue = app.getHost().initValue;
	if (initValue) {
		var boardID = initValue["BoardID"];
		if( boardID != null ){
			app.lookup("ILDM_nbe_boardID").value = boardID;//등록
			app.lookup("ILDM_nbe_boardID").redraw();
			comLib.showLoadMask("","ACU LowDevice Search","",0);
			var smsGetLowAcuDeviceList = app.lookup("sms_getLowAcuDeviceList");
			smsGetLowAcuDeviceList.action = "/v1/bosk/acus/LowDevice/" + boardID;
			smsGetLowAcuDeviceList.send();
		}	
	} else {//
		app.close();
	}	
}
function initUICtrl(){
	var cmdCtrl = app.lookup("ILDM_cmb_LowDevcieType");
	cmdCtrl.addItem(new cpr.controls.Item("Not use","0")); // 미사용
	cmdCtrl.addItem(new cpr.controls.Item("PIR Sensor","1"));
	cmdCtrl.addItem(new cpr.controls.Item("Door Contact1","2"));
	cmdCtrl.addItem(new cpr.controls.Item("Door Contact2","3"));
	cmdCtrl.addItem(new cpr.controls.Item("Shutter Sensor","4"));
	cmdCtrl.addItem(new cpr.controls.Item("Alarm Light","5"));
	cmdCtrl.addItem(new cpr.controls.Item("Alarm Speaker","6"));
	cmdCtrl.selectItem(0);
	
	var cmdGrdLowDeviceType = app.lookup("ILDM_cmb_grdLowDeviceType");
	cmdGrdLowDeviceType.addItem(new cpr.controls.Item("Not use","0")); // 미사용
	cmdGrdLowDeviceType.addItem(new cpr.controls.Item("PIR Sensor","1"));
	cmdGrdLowDeviceType.addItem(new cpr.controls.Item("Door Contact1","2"));
	cmdGrdLowDeviceType.addItem(new cpr.controls.Item("Door Contact2","3"));
	cmdGrdLowDeviceType.addItem(new cpr.controls.Item("Shutter Sensor","4"));
	cmdGrdLowDeviceType.addItem(new cpr.controls.Item("Alarm Light","5"));
	cmdGrdLowDeviceType.addItem(new cpr.controls.Item("Alarm Speaker","6"));	
	
	var cmbPortNo = app.lookup("ILDM_cmb_PortNo");
	cmbPortNo.addItem(new cpr.controls.Item("-","0"));
	cmbPortNo.addItem(new cpr.controls.Item("1","1"));
	cmbPortNo.addItem(new cpr.controls.Item("2","2"));
	cmbPortNo.addItem(new cpr.controls.Item("3","3"));
	cmbPortNo.addItem(new cpr.controls.Item("4","4"));
	cmbPortNo.addItem(new cpr.controls.Item("5","5"));
	cmbPortNo.addItem(new cpr.controls.Item("6","6"));
	cmbPortNo.addItem(new cpr.controls.Item("7","7"));
	cmbPortNo.addItem(new cpr.controls.Item("8","8"));
	cmbPortNo.addItem(new cpr.controls.Item("9","9"));
	cmbPortNo.addItem(new cpr.controls.Item("10","10"));
	cmbPortNo.addItem(new cpr.controls.Item("11","11"));
	cmbPortNo.addItem(new cpr.controls.Item("12","12"));
	cmbPortNo.addItem(new cpr.controls.Item("13","13"));
	cmbPortNo.addItem(new cpr.controls.Item("14","14"));
	cmbPortNo.addItem(new cpr.controls.Item("15","15"));
	cmbPortNo.addItem(new cpr.controls.Item("16","16"));
	cmbPortNo.selectItem(0);
	app.lookup("ILDM_grp_main").redraw();
}

function onSms_getSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);}
function onSms_getSubmitError(/* cpr.events.CSubmissionEvent */ e){	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getLowAcuDeviceListSubmitDone(e){
	//var sms_getLowAcuDeviceList = e.control;
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){		
			///
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
	app.lookup("ILDM_grp_main").redraw();
}

/*
 * "ADD" 버튼(ILDM_btn_Add)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onILDM_btn_AddClick(e){
	var dm_LowAcuDeviceInfo = app.lookup("dm_LowAcuDeviceInfo");
	// 입력 기본값 설정 체크
	var nInoutPortNo = parseInt(dm_LowAcuDeviceInfo.getValue("InoutPortNo") , 10);
	if (nInoutPortNo <= 0 || nInoutPortNo > 16) {
		dialogAlert(app, dataManager.getString("Str_Warning"), "please select a InoutPortNo between 1 and 16.");	
		return;
	} 
	var nDoorID  = parseInt(dm_LowAcuDeviceInfo.getValue("DoorID") , 10);
	if (nDoorID <= 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), "Please enter DoorID as a value greater than 0");	
		return;
	}
	var nLowDeviceType  = parseInt(dm_LowAcuDeviceInfo.getValue("LowDeviceType") , 10);
	if (nLowDeviceType == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), "It cannot be added as a Not use type.");	
		return;
	}
	dm_LowAcuDeviceInfo.setValue("BoardID",  parseInt(app.lookup("ILDM_nbe_boardID").value));
	comLib.showLoadMask("","ACU LowDevice Regist","",0);// 추가
	app.lookup("sms_postLowAcuDeviceInfo").send();	
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postLowAcuDeviceListSubmitDone(e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
		var dmLowAcuDeviceInfo =  app.lookup("dm_LowAcuDeviceInfo");
		var row = app.lookup("LowAcuDeviceList").addRow();
		row.setRowData(dmLowAcuDeviceInfo.getDatas());
		dmLowAcuDeviceInfo.reset();
		app.lookup("LowAcuDeviceList").setSort("InoutPortNo");
		app.lookup("LowAcuDeviceList").setUnfilteredRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
		
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Saved"));
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
	app.lookup("ILDM_grd_LowAcuDeviceList").redraw();
}


/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onILDM_grd_LowAcuDeviceListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var iLDM_grd_LowAcuDeviceList = e.control;
	var rowIndex = iLDM_grd_LowAcuDeviceList.getSelectedRowIndex();
	if (rowIndex >= 0) {//0보다 크면 선택한거 있어
		var dmLowAcuDeviceInfo = app.lookup("dm_LowAcuDeviceInfo");
		dmLowAcuDeviceInfo.reset();
		dmLowAcuDeviceInfo.setValue("BoardID", parseInt(app.lookup("ILDM_nbe_boardID").value));
		dmLowAcuDeviceInfo.setValue("InoutPortNo", parseInt(iLDM_grd_LowAcuDeviceList.getSelectedRow().getValue("InoutPortNo")));
		dmLowAcuDeviceInfo.setValue("DoorID", parseInt(iLDM_grd_LowAcuDeviceList.getSelectedRow().getValue("DoorID")));
		dmLowAcuDeviceInfo.setValue("LowDeviceName", iLDM_grd_LowAcuDeviceList.getSelectedRow().getValue("LowDeviceName"));
		dmLowAcuDeviceInfo.setValue("LowDeviceType", parseInt(iLDM_grd_LowAcuDeviceList.getSelectedRow().getValue("LowDeviceType")));
	}
	app.lookup("ILDM_grp_topmain").redraw();
}

function onILDM_btn_ClearClick(/* cpr.events.CMouseEvent */ e){
	var dmLowAcuDeviceInfo = app.lookup("dm_LowAcuDeviceInfo");
	dmLowAcuDeviceInfo.reset();
	dmLowAcuDeviceInfo.setValue("BoardID", parseInt(app.lookup("ILDM_nbe_boardID").value));
	var grd_LowAcuDeviceList = app.lookup("ILDM_grd_LowAcuDeviceList");
	grd_LowAcuDeviceList.clearSelection();
	
	app.lookup("ILDM_grp_main").redraw();
}


/*
 * "MODIFY" 버튼(ILDM_btn_Modify)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onILDM_btn_ModifyClick(/* cpr.events.CMouseEvent */ e){
	//선택된 값이 없으면 수정 불가능
	var grd_LowAcuDeviceList = app.lookup("ILDM_grd_LowAcuDeviceList");
	var rowIndex = grd_LowAcuDeviceList.getSelectedRowIndex();
	if (rowIndex < 0) {
		dialogAlert(app, dataManager.getString("Str_Failed"), "There are no low devices selected.");		
		return;
	}
	
	var dm_LowAcuDeviceInfo = app.lookup("dm_LowAcuDeviceInfo");
	// 입력 기본값 설정 체크
	var nInoutPortNo = parseInt(dm_LowAcuDeviceInfo.getValue("InoutPortNo") , 10);
	if (nInoutPortNo <= 0 || nInoutPortNo > 16) {
		dialogAlert(app, dataManager.getString("Str_Warning"), "please select a InoutPortNo between 1 and 16.");	
		return;
	} 
	
	var nDoorID  = parseInt(dm_LowAcuDeviceInfo.getValue("DoorID") , 10);
	if (nDoorID <= 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), "Please enter DoorID as a value greater than 0");	
		return;
	}
	
	var nLowDeviceType  = parseInt(dm_LowAcuDeviceInfo.getValue("LowDeviceType") , 10);
	if (nLowDeviceType == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), "It cannot be added as a Not use type.");	
		return;
	}
	
	dm_LowAcuDeviceInfo.setValue("BoardID",  parseInt(app.lookup("ILDM_nbe_boardID").value));
	comLib.showLoadMask("","ACU LowDevice Modify","",0);// 추가
	app.lookup("sms_putLowAcuDeviceInfo").send();	
}

function onSms_putLowAcuDeviceInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
		var dmLowAcuDeviceInfo =  app.lookup("dm_LowAcuDeviceInfo");
		var row = app.lookup("LowAcuDeviceList").findFirstRow("InoutPortNo == " + dmLowAcuDeviceInfo.getValue("InoutPortNo"));
		row.setRowData(dmLowAcuDeviceInfo.getDatas());
		row.setState(cpr.data.tabledata.RowState.UNCHANGED);
		dmLowAcuDeviceInfo.reset();
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Saved"));
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
	app.lookup("ILDM_grd_LowAcuDeviceList").redraw();
}


/*
 * "CLOSE" 버튼(ILDM_btn_Close)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onILDM_btn_CloseClick(/* cpr.events.CMouseEvent */ e){
	app.close();
}

function onILDM_btn_DeleteClick(/* cpr.events.CMouseEvent */ e){
	//선택된 값이 없으면 수정 불가능
	var grd_LowAcuDeviceList = app.lookup("ILDM_grd_LowAcuDeviceList");
	var rowIndex = grd_LowAcuDeviceList.getSelectedRowIndex();
	if (rowIndex < 0) {
		dialogAlert(app, dataManager.getString("Str_Failed"), "There are no low devices selected.");		
		return;
	}
	//board port
	var smsDeleteLowAcuDeviceInfo = app.lookup("sms_deleteLowAcuDeviceInfo");
	//smsDeleteLowAcuDeviceInfo.setParameters("boardID", parseInt(app.lookup("ILDM_nbe_boardID").value));
	var row = grd_LowAcuDeviceList.getSelectedRow();
	smsDeleteLowAcuDeviceInfo.action = "/v1/bosk/acus/LowDevice/" + app.lookup("ILDM_nbe_boardID").value + "/" + row.getValue("InoutPortNo");
	//smsDeleteLowAcuDeviceInfo.setParameters("inoutPortNo", parseInt(row.getValue("InoutPortNo")));
	comLib.showLoadMask("","ACU LowDevice delete","",0);// 추가
	smsDeleteLowAcuDeviceInfo.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_deleteLowAcuDeviceInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
		var dmLowAcuDeviceInfo = app.lookup("dm_LowAcuDeviceInfo");
		var dsLowAcuDeviceList = app.lookup("LowAcuDeviceList");
		var row = dsLowAcuDeviceList.findFirstRow("InoutPortNo == " + dmLowAcuDeviceInfo.getValue("InoutPortNo"));
		var rowIdx = row.getIndex();
		dsLowAcuDeviceList.deleteRow(rowIdx);
		dsLowAcuDeviceList.commit();
		dmLowAcuDeviceInfo.reset();
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Saved"));
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
	app.lookup("ILDM_grd_LowAcuDeviceList").redraw();
}
