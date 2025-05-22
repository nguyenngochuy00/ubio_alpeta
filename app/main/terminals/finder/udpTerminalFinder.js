/************************************************
 * udpTerminalFinder.js
 * Created at 2019. 3. 12. 오후 2:09:02.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
dataManager = getDataManager();
/*
 * "Search" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTMFDR_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var tMFDR_btnSearch = e.control;
	app.lookup("TerminalList").clear();
	app.lookup("TerminalInfo").clear();
	app.lookup("TMSEH_grpTerminalSearch").redraw();
	// 리스트 초기화 후에 검색 요청
	
	var button = e.control;
	var RequestData = app.lookup("sms_getUdpTerminalList");
	console.log(RequestData.action);
	RequestData.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getUdpTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getUdpTerminalList = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	
	if (resultCode == 0) {
		// udp 요청에 대한 응답 처리 완료
	} else {
		// udp 요청에 대한 응답 처리 못함
		dialogAlert(app, dataManager.getString("Str_Failed"),dataManager.getString(getErrorString(resultCode)));
	}
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getUdpTerminalListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getUdpTerminalList = e.control;
	app.lookup("Result").setValue("ResultCode", -1);
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getUdpTerminalListSubmistTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getUdpTerminalList = e.control;
	app.lookup("Result").setValue("ResultCode", -2);
	
}

exports.addTerminalList = function(TerminalInfo) {
	var dsTerminalList = app.lookup("TerminalList");
	var insertRow = dsTerminalList.insertRowData(0, false, TerminalInfo);
	insertRow.setState(cpr.data.tabledata.RowState.UNCHANGED);


	app.lookup("TMSEH_grdTerminalList").redraw();
	console.log(dsTerminalList.getRowDataRanged());
}

exports.SetResultCode = function( ResultCode) {
	var strMsg;
	if (ResultCode == 0) {
		strMsg = "Configuration settings succeed !!!";
		dialogAlert(app, "Success", strMsg);	
		return;
	} else if (ResultCode == 5100) { //"Locking Error"
		strMsg =  "Configuration setting failed !!! " + "[Locking Error]" ;
	} else if (ResultCode == 5101) { // "Password Error"
		strMsg =  "Configuration setting failed !!! " + "[Password Error]";
	} else if (ResultCode == 5102) { // "Mac Address Error"
		strMsg =  "Configuration setting failed !!! " + "[Mac Address Error]";
	} else { //"Unknown"
		//strMsg =  "Configuration setting failed !!! " + "[Unknown Error]";
		strMsg = "Configuration setting failed !!! " + dataManager.getString(getErrorString(ResultCode));
	}
	dialogAlert(app, "Fail", strMsg);	
	return;
}
/*
 * 라디오 버튼에서 selection-change 이벤트 발생 시 호출.
 * 라디오버튼 아이템을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onTMSEH_rdbNetWorkTypeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.RadioButton
	 */
	var tMSEH_rdbNetWorkType = e.control;
	SetNetWorkType(Number(tMSEH_rdbNetWorkType.value));

}


/*
 * 체크 박스에서 value-change 이벤트 발생 시 호출.
 * CheckBox의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onTMSEH_cbxNewPasswordValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.CheckBox
	 */
	var tMSEH_cbxNewPassword = e.control;
	if (tMSEH_cbxNewPassword.value == 'true') {
		app.lookup("TMSEH_ipbNewPassword").enabled = true;
	} else {
		app.lookup("TMSEH_ipbNewPassword").enabled = false;
	}
}





/*
 * 체크 박스에서 value-change 이벤트 발생 시 호출.
 * CheckBox의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onTMSEH_cbxLockingValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.CheckBox
	 */
	var tMSEH_cbxLocking = e.control;
//	SetLockingFlag(Number(tMSEH_cbxLocking.value));
}


/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onTMSEH_grdTerminalListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var TerminalList = app.lookup("TMSEH_grdTerminalList");
	var selectRow = TerminalList.getSelectedRow();
	var dsTerminalList = app.lookup("TerminalList");
	var dmTerminalInfo = app.lookup("TerminalInfo");
	
	//선택된 데이터 dm으로 복사
	dmTerminalInfo.reset();
	dsTerminalList.copyToDataMap(dmTerminalInfo, selectRow.getIndex());
	console.log(dmTerminalInfo.getDatas());
	
	SetNetWorkType(Number(dmTerminalInfo.getValue("NetWorkType")));
//	if (dmTerminalInfo.getValue("NetWorkType") == 1) {
//		app.lookup("TMSEH_ipbTerminalIP").enabled = false;
//		app.lookup("TMSEH_ipbSubnetMask").enabled = false;
//		app.lookup("TMSEH_ipbGateway").enabled = false;
//	} else {
//		app.lookup("TMSEH_ipbTerminalIP").enabled = true;
//		app.lookup("TMSEH_ipbSubnetMask").enabled = true;
//		app.lookup("TMSEH_ipbGateway").enabled = true;
//	}
	
	SetLockingFlag(Number(dmTerminalInfo.getValue("LockingFlag")));
//	if (dmTerminalInfo.getValue("LockingFlag") == 1) {
//		app.lookup("TMSEH_btnApply").enabled = false;
//	} else {
//		app.lookup("TMSEH_btnApply").enabled = true;
//	}
	
	app.lookup("TMSEH_ipbNewPassword").enabled = false;
	app.lookup("TMSEH_grpTerminalSearch").redraw();
}

function SetNetWorkType(NetWorkType) {
	if (NetWorkType == 1) {
		app.lookup("TMSEH_ipbTerminalIP").enabled = false;
		app.lookup("TMSEH_ipbSubnetMask").enabled = false;
		app.lookup("TMSEH_ipbGateway").enabled = false;
	} else {
		app.lookup("TMSEH_ipbTerminalIP").enabled = true;
		app.lookup("TMSEH_ipbSubnetMask").enabled = true;
		app.lookup("TMSEH_ipbGateway").enabled = true;
	}
}
	
function SetLockingFlag(LockingFlag) {
	if (LockingFlag == 1) {
		app.lookup("TMSEH_btnApply").enabled = false;
	} else {
		app.lookup("TMSEH_btnApply").enabled = true;
	}
}
	

/*
 * "적용" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTMSEH_btnApplyClick(/* cpr.events.CMouseEvent */ e){
	var TerminalList = app.lookup("TMSEH_grdTerminalList");
	var selectRow = TerminalList.getSelectedRow();
	var index = selectRow.getIndex();
	var ReqIpAddr = app.lookup("TerminalList").getRow(index).getValue("NetWorkIpAddr"); // 요청 단말기 ipAddress
	app.lookup("ReqTerminalIpAddress").setValue("TerminalIP", ReqIpAddr);
	console.log(app.lookup("ReqTerminalIpAddress").getValue("TerminalIP"));
	var RequestData = app.lookup("sms_putUdpTerminalInfo");
	console.log(app.lookup("TerminalInfo").getDatas());
	RequestData.send(); 
}

/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTMSEH_imgHelpClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}


/*
 * 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var appID = "app/main/terminals/finder/terminalManualSearch";
	app.openDialog(appID, {width : 400, height : 300, top:100, bottom:100,right:100,left:100}, function(dialog){
		dialog.ready(function(dialogApp){
			dialog.headerTitle = ("단말기 수동 찾기");
			// 필요한 경우, 다이얼로그의 앱이 초기화 된 후, 앱 속성을 전달하십시오.
			
		});
	}).then(function(returnValue){
		var manualTerminalInfo = returnValue["ManualTerminalInfo"];
		if (manualTerminalInfo != null) {
			console.log(manualTerminalInfo.getDatas());
			var dmManualInfo = app.lookup("ManualTerminalInfo");
			manualTerminalInfo.copyToDataMap(dmManualInfo)
			var reqSend = app.lookup("sms_getManualUDPTerminal");
			reqSend.send();
		} else {
			return;
		}
	}); 
}


