/************************************************
 * terminalNOptionPageSystemConfig.js
 * Created at 2018. 11. 21. 오후 4:46:12.
 *
 * @author wonki
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();	
	var hostAppIns = app.getHostAppInstance();
	if (hostAppIns) {		
		var getdmgetSystemOptionData =  hostAppIns.callAppMethod("getSystemOptionData");
		if (getdmgetSystemOptionData != null ) {
			var dmSystemInfo = app.lookup("SystemInfo");
			getdmgetSystemOptionData.copyToDataMap(dmSystemInfo); 
			console.log(dmSystemInfo.getDatas());
			app.lookup("TM_INN_grpSystemConfig").redraw();
		} else {
			if (hostAppIns.callAppMethod("getTerminalID")) {
				console.log("exist get terminal id");
				var tID = hostAppIns.callAppMethod("getTerminalID");
				console.log(tID);
				
				var requestData = app.lookup("sms_get_terminal_option_system_config");
				requestData.action = requestData.action + tID + "/option/system";
				console.log(requestData.action);
				requestData.send();
			}
		}
		
	}
}

function onSms_get_terminal_option_system_configSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	
	if (ResultCode == COMERROR_NONE) {
		var dmSystemInfo = app.lookup("SystemInfo");
		var hostApp = app.getHostAppInstance();
		if (hostApp) {
			hostApp.callAppMethod("setSystemOptionData", dmSystemInfo);	
		}
		
		app.lookup("TM_INN_grpSystemConfig").redraw();
	} else {
		// error 
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorGetTerminalInfo"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(ResultCode)));
	}
}
function onSms_get_terminal_option_system_configSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}
function onSms_get_terminal_option_system_configSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
