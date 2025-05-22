/************************************************
 * terminalSync.js
 * Created at 2019. 6. 3. 오후 4:36:45.
 *
 * @author fois
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var TMSYN_terminalID;

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var initValue = app.getHost().initValue;
	
	if( initValue){	
		TMSYN_terminalID = initValue["ID"];
		
		var opbTZVersionServer = app.lookup("TMSYN_opbTZVersionServer");
		if(opbTZVersionServer){opbTZVersionServer.value=dataManager.getTimezoneVersion()}
		
		var opbTZVersionTerminal = app.lookup("TMSYN_opbTZVersionTerminal");
		if(opbTZVersionTerminal){opbTZVersionTerminal.value=initValue["TimezoneVersion"]}
		
		comLib.showLoadMask("",dataManager.getString("Str_Sync"), "",0);
		
		var sms_getTerminalUserCount = app.lookup("sms_getTerminalUserCount");
		sms_getTerminalUserCount.action = "/v1/terminalUsers/"+TMSYN_terminalID+"/count";
		sms_getTerminalUserCount.setParameters("server", "true");
		sms_getTerminalUserCount.setParameters("terminal", "true");
		sms_getTerminalUserCount.send();
	}
}

// 단말 사용자 수 가져오기 완료
function onSms_getTerminalUserCountSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode")
	if( resultCode == COMERROR_NONE){
		var dmServerCount = app.lookup("ServerCount");
		app.lookup("TMSYN_opbUserCountServer").redraw();
		app.lookup("TMSYN_opbUserCountTerminal").redraw();
	}else{		
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_UserCount"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	
	var sms_getTerminalSyncList = app.lookup("sms_getTerminalSyncList");
	sms_getTerminalSyncList.action = "/v1/terminals/"+TMSYN_terminalID+"/syncCount";		
	sms_getTerminalSyncList.send();
}

// 단말 사용자 수 가져오기 에러
function onSms_getTerminalUserCountSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 단말 사용자 수 가져오기 타임아웃
function onSms_getTerminalUserCountSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 단말기 동기화 목록 수 가져오기 완료
function onSms_getTerminalSyncListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode")
	if( resultCode == COMERROR_NONE){		
		app.lookup("TMSYN_opbSyncListCount").redraw();		
	}else{		
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_UserCount"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 단말기 동기화 목록 수 에러
function onSms_getTerminalSyncListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 단말기 동기화 목록 수 가져오기 타임아웃
function onSms_getTerminalSyncListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 동기화 버튼 클릭
function onTMSYN_btnSyncClick(/* cpr.events.CMouseEvent */ e){
	var dsTerminalIDList = app.lookup("TerminalIDList");
	dsTerminalIDList.clear();
	dsTerminalIDList.addRowData({"ID":TMSYN_terminalID});
	
	var dmSyncRequest = app.lookup("SyncRequest");
	
	if( app.lookup("TMSYN_cbxTimezone").checked == true ){dmSyncRequest.setValue("Timezone","true");}
	else{dmSyncRequest.setValue("Timezone","false");}
	
	if( app.lookup("TMSYN_cbxUser").checked == true ){dmSyncRequest.setValue("UserList","true");}
	else{dmSyncRequest.setValue("UserList","false");}
	
	if( app.lookup("TMSYN_cbxSyncList").checked == true ){dmSyncRequest.setValue("SyncList","true");}
	else{dmSyncRequest.setValue("SyncList","false");}
	
	//dmSyncRequest.setValue("EntireSync","true");
	var sms_postTerminalSync = app.lookup("sms_postTerminalSync");
	sms_postTerminalSync.action = "/v1/terminals/sync";		
	sms_postTerminalSync.send();
}

// 단말기 동기화 요청 완료
function onSms_postTerminalSyncSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode")
	if( resultCode == COMERROR_NONE){		
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_TerminalSyncRequestSuccess"));
	}else{		
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_Sync"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 단말기 동기화 요청 에러
function onSms_postTerminalSyncSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 단말기 동기화 요청 타임아웃
function onSms_postTerminalSyncSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}
