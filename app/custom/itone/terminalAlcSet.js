/************************************************
 * terminalAlcSet.js
 * Created at 2024. 8. 23. 오전 11:05:40.
 *
 * @author sky
 ************************************************/
var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var pageRowCount = 99999999;

var oem_version;

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var cmbCategory = app.lookup("cmbAlcOption");
	cmbCategory.selectItemByValue("1");
	
	sendTerminalListRequest();
}

// 단말기 리스트 요청
function sendTerminalListRequest(initPage) {
	var dsTerminalList = app.lookup("TerminalList");
	dsTerminalList.clear();
	var terminalList = app.lookup("grdTerminalList");

	var smsGetTerminalList = app.lookup("sms_getTerminalList");

	smsGetTerminalList.setParameters("searchKeyword", "");
	smsGetTerminalList.setParameters("searchCategory", "");

//	var groupList = app.lookup("TMMGR_treGroup");
//	var group = groupList.getSelectionFirst();
//	if (group != undefined && group.value != "") {
//		smsGetTerminalList.setParameters("groupID", parseInt(group.value, 10));
//	} else {
//		smsGetTerminalList.setParameters("groupID", 0);
//	}
	smsGetTerminalList.setParameters("subInclude", "true");

	smsGetTerminalList.setParameters("offset", 0);
	smsGetTerminalList.setParameters("limit", pageRowCount);
	
	smsGetTerminalList.send();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var value = result.getValue("ResultCode");

	if( result.getValue("ResultCode")== COMERROR_NONE) { // 성공
		var dsTerminalList = app.lookup("TerminalList");

		var dmTotal = app.lookup("Total");
		var totalCount = parseInt( dmTotal.getValue("Count"));
		
		dataManager = getDataManager();
		var Loginuserinfo = dataManager.getAccountInfo();
		var Loginuserid = Loginuserinfo.getValue("UserID");
		var LoginPrivilege = Loginuserinfo.getValue("Privilege");
			
		var terminalListSet = app.lookup("TerminalList");
	
		var rowCount = dsTerminalList.getRowCount();
		for (var i=0; i < rowCount; i++) {
			var rowData = dsTerminalList.getRow(i);
			var status = rowData.getValue("Status");
			var group = rowData.getValue("GroupCode");
			if(Loginuserid != 1000000000000000000 && LoginPrivilege != 1) {
				if(group == "") { // 그룹이 아닌 단말기가 로그 on/off 됐을때 그룹코드 값이 "" 처리되 보여지는 현상 수정  - otk
					continue;
				} else {
					var connStatus = checkTerminalConnectionStatus(status);
					if (connStatus == 3) {
						terminalListSet.addRowData(terminalListSet.getRowData(i));
					}
				}
			} else {
				var connStatus = checkTerminalConnectionStatus(status);
				if (connStatus == 3) {
					terminalListSet.addRowData(terminalListSet.getRowData(i));
				}
			}		
			terminalListSet.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
		}
		var terminalList = app.lookup("grdTerminalList")
		terminalList.redraw();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_TerminalListLoadingFailed"));
	}
}


function onTMUSR_btnTerminalUserSendClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var tMUSR_btnTerminalUserSend = e.control;
	var grdTerminalList = app.lookup("grdTerminalList")
	var chkIndices = grdTerminalList.getCheckRowIndices();	
	var total = chkIndices.length;
	
	if( total < 1 ){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedTerminals"));
		return;
	}
	
	var dsTerminalIDList = app.lookup("TerminalIDList");
	dsTerminalIDList.clear();
	for( var i = 0; i < total; i++ ){
		var row = grdTerminalList.getRow(chkIndices[i]);
		dsTerminalIDList.addRowData({"ID":row.getValue("ID")});
	}
	dsTerminalIDList.commit();
	
	comLib.showLoadMask("pro", dataManager.getString("Str_Data")+" "+dataManager.getString("Str_Send"), "", total);
	
	sendTerminalAlcOptionControlCommand();
}


function sendTerminalAlcOptionControlCommand(){
	var cmbSetOption = app.lookup("cmbAlcOption");
	var alcCommand = cmbSetOption.value;
	
	var grdTerminalList = app.lookup("grdTerminalList");
	
	var dsTerminalIDList = app.lookup("TerminalIDList");
	var row = dsTerminalIDList.getRow(0);
	if (row) {
		var terminalID = row.getValue("ID")
		dsTerminalIDList.deleteRow(0);
		dsTerminalIDList.commit();
		
		var dmAlcOptionControl = app.lookup("AlcOptionControl");		
		
		dmAlcOptionControl.setValue("TerminalID", terminalID);
		dmAlcOptionControl.setValue("AlcOption", alcCommand);		// 0 : off, 1 : on	
		
		var dmResult = app.lookup("Result");
		var sms_postTerminalAlcOptionControl = new cpr.protocols.Submission("sms_postTerminalAlcOptionControl");
		sms_postTerminalAlcOptionControl.action = "v1/terminals/" + terminalID + "/control/alc";
		sms_postTerminalAlcOptionControl.method = "post";
		sms_postTerminalAlcOptionControl.addRequestData(dmAlcOptionControl);				
		sms_postTerminalAlcOptionControl.addResponseData(dmResult);
		
		sms_postTerminalAlcOptionControl.addEventListenerOnce("submit-done", onSms_postTerminalTerminalAlcOptionControlDone);
		sms_postTerminalAlcOptionControl.addEventListenerOnce("submit-error", onSms_postTerminalTerminalAlcOptionControlErr);
		sms_postTerminalAlcOptionControl.addEventListenerOnce("submit-timeout", onSms_postTerminalTerminalAlcOptionControlTimeout);
		
		sms_postTerminalAlcOptionControl.send();
	} else {
			dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_SendCommondComplete"));
			comLib.hideLoadMask();
	}
}

function onSms_postTerminalTerminalAlcOptionControlDone( /* cpr.events.CSubmissionEvent */ e) {
	comLib.updateLoadMask();
	sendTerminalAlcOptionControlCommand();
}

function onSms_postTerminalTerminalAlcOptionControlErr( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_postTerminalTerminalAlcOptionControlTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
