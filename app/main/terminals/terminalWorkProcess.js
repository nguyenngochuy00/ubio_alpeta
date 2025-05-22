/************************************************
 * TerminalWorkProcess.js
 * Created at 2021. 5. 26. 오후 1:33:08.
 *
 * @author fois
 ************************************************/
var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");

var terminalMap;
var TWP_timer;

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	
	terminalMap = new Map();
	
	var terminalList = dataManager.getTerminalList()
	var cmbTerminalName = app.lookup("TWPGT_cmbTerminalName");	
		cmbTerminalName.setItemSet(terminalList, {
			label: "Name",
			value: "ID",
	});
	
	sendGetTerminalWorkStatus();
}

function onBodyUnload(/* cpr.events.CEvent */ e){
	clearTimeout(TWP_timer);
}

function onSubmitError(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

function sendGetTerminalWorkStatus(){
	comLib.showLoadMask("",dataManager.getString("Str_UserListGet"),"",0);
	
	app.lookup("TerminalStatusList").clear();
	
	var sms_getTerminalWorkStatus = new cpr.protocols.Submission("sms_getTerminalWorkStatus");
	sms_getTerminalWorkStatus.action = "/v1/terminals/workStatus";	
	sms_getTerminalWorkStatus.method = "GET";
	sms_getTerminalWorkStatus.mediaType = "application/x-www-form-urlencoded";			
	sms_getTerminalWorkStatus.addResponseData(app.lookup("Result"), false, "Result");
	sms_getTerminalWorkStatus.addResponseData(app.lookup("TerminalStatusList"), false, "TerminalStatusList");
		
	sms_getTerminalWorkStatus.addEventListenerOnce("submit-done", onSms_getTerminalWorkStatusSubmitDone);
	sms_getTerminalWorkStatus.addEventListenerOnce("submit-error", onSubmitError);
	sms_getTerminalWorkStatus.addEventListenerOnce("submit-timeout", onSubmitTimeout);
	sms_getTerminalWorkStatus.send();
}

function onSms_getTerminalWorkStatusSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	TWP_timer = setTimeout(sendGetTerminalWorkStatus, 10000);
		
	if(resultCode == COMERROR_NONE) {
		var dsTerminalStatusList = app.lookup("TerminalStatusList");
		dsTerminalStatusList.setSort("TerminalID asc");
		
		/*
		var count = dsTerminalStatusList.getRowCount();
		for( var i = 0; i < count; i++){
			var terminalInfo = dsTerminalStatusList.getRow(i);
			var terminalID = terminalInfo.getValue("TerminalID");
			var terminalRow = terminalMap.get(terminalID);
			if( terminalRow ){
				
			} else {
				terminalMap.set(terminalID);
			}
		}
		* 		*/
	} else {				
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onTWP_grdTerminalListContextmenu(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Grid	 */
	var grdTerminalList = e.control;		
	e.preventDefault();
	
	var terminalRow = grdTerminalList.getSelectedRow();
	if (terminalRow == null)  {
		return;
	}	
	var terminalID = terminalRow.getValue("TerminalID");
	
	var terminalMenu = new cpr.controls.Menu();
	var total = terminalRow.getValue("Total");
	var offset = terminalRow.getValue("Offset");
	if( total == offset ){	// 완료 작업
		terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_Delete"), 1, ""));
	} else {
		terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_Cancel"), 2, ""));
	}	
	
			
	var rect = app.getActualRect();
	var contextTop = (e.clientY - rect.top) > rect.height/2 ? e.clientY - rect.top*2 : e.clientY - rect.top;
	terminalMenu.style.css({left: e.clientX - rect.left + "px",top: contextTop + "px",height: "30px",width: "200px",position: "absolute"});
	terminalMenu.focus();
	
	terminalMenu.addEventListener("selection-change", function(e) {
		switch (terminalMenu.value) {							
			case "1":	sendTerminalWorkStatusUpdate(terminalID,1);  break; 					
			case "2":	sendTerminalWorkStatusUpdate(terminalID,2);  break; 	
			default:	break;
		}		
		terminalMenu.dispose();
	});	

	terminalMenu.addEventListener("blur", function(e) {	terminalMenu.dispose();	});
	app.floatControl(terminalMenu);
}

function sendTerminalWorkStatusUpdate( terminalID, flag ){
	app.lookup("FailInfo").clear();
	comLib.showLoadMask("",dataManager.getString("Str_UserListGet"),"",0);
	
	var sms_getTerminalWorkStatus = new cpr.protocols.Submission("sms_postTerminalWorkStatus");
	sms_getTerminalWorkStatus.action = "/v1/terminals/"+terminalID+"/workStatus";	
	sms_getTerminalWorkStatus.method = "POST";
	sms_getTerminalWorkStatus.mediaType = "application/x-www-form-urlencoded";
		
	var dmFlagInfo = app.lookup("FlagInfo");
	dmFlagInfo.setValue("Flag",flag);
	sms_getTerminalWorkStatus.addRequestData(dmFlagInfo);
		
	sms_getTerminalWorkStatus.addResponseData(app.lookup("Result"), false, "Result");
			
	sms_getTerminalWorkStatus.addEventListenerOnce("submit-done", onSms_postTerminalWorkStatusUpdateSubmitDone);
	sms_getTerminalWorkStatus.addEventListenerOnce("submit-error", onSubmitError);
	sms_getTerminalWorkStatus.addEventListenerOnce("submit-timeout", onSubmitTimeout);
	sms_getTerminalWorkStatus.send();
}

function onSms_postTerminalWorkStatusUpdateSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		clearTimeout(TWP_timer);
		sendGetTerminalWorkStatus();
	} else {				
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onTWP_btnDeleteFinishedTaskClick(/* cpr.events.CMouseEvent */ e){
	sendTerminalWorkStatusUpdate(0,1);
}

function onTWP_grdTerminalListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.Grid	 */
	var grdTerminalList = e.control;
	var terminalRow = grdTerminalList.getSelectedRow();
	if (terminalRow == null)  {
		return;
	}	
	
	var terminalID = terminalRow.getValue("TerminalID");
	sendGetTerminalWorkResult(terminalID);
}

function sendGetTerminalWorkResult(terminalID){
	comLib.showLoadMask("",dataManager.getString("Str_UserListGet"),"",0);
	
	app.lookup("FailInfo").clear();
	
	var sms_getTerminalWorkStatus = new cpr.protocols.Submission("sms_getTerminalWorkStatus");
	sms_getTerminalWorkStatus.action = "/v1/terminals/"+terminalID+"/workStatus";	
	sms_getTerminalWorkStatus.method = "GET";
	sms_getTerminalWorkStatus.mediaType = "application/x-www-form-urlencoded";			
	sms_getTerminalWorkStatus.addResponseData(app.lookup("Result"), false, "Result");
	sms_getTerminalWorkStatus.addResponseData(app.lookup("FailInfo"), false, "FailInfo");
		
	sms_getTerminalWorkStatus.addEventListenerOnce("submit-done", onSms_getTerminalResultSubmitDone);
	sms_getTerminalWorkStatus.addEventListenerOnce("submit-error", onSubmitError);
	sms_getTerminalWorkStatus.addEventListenerOnce("submit-timeout", onSubmitTimeout);
	sms_getTerminalWorkStatus.send();
}

function onSms_getTerminalResultSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {	
		var dsFailInfo = app.lookup("FailInfo");
		var count = dsFailInfo.getRowCount();
		for( var i =0; i < count; i++ ){
			var failInfo = dsFailInfo.getRow(i);
			var errCode = failInfo.getValue("ErrorCode");
			var errMsg = dataManager.getString(getErrorString(errCode))
			failInfo.setValue("ErrorMsg",errMsg);
		}
		dsFailInfo.setSort("UserID asc");
	} else {				
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}