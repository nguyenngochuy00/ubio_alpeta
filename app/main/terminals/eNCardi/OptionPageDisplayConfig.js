/************************************************
 * terminalNOptionPageDisplayConfig.js
 * Created at 2018. 11. 26. 오후 2:09:41.
 *
 * @author wonki
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	var hostAppIns = app.getHostAppInstance();
	if (hostAppIns) {		
		var getdmDisplaOptionData =  hostAppIns.callAppMethod("getDisplayOptionData");
		if (getdmDisplaOptionData != null ) {
			var dmDisplayinfo = app.lookup("DisplayInfo");
			getdmDisplaOptionData.copyToDataMap(dmDisplayinfo); 
			console.log(dmDisplayinfo.getDatas());
		} else {
			if (hostAppIns.callAppMethod("getTerminalID")) {
				console.log("exist get terminal id");
				var tID = hostAppIns.callAppMethod("getTerminalID");
				console.log(tID);
				
				var requestData = app.lookup("sms_get_terminal_option_display_config");
				requestData.action = requestData.action + tID + "/option/display";
				console.log(requestData.action);
				requestData.send();
			}
		}
		
		
	}
}

function onSms_get_terminal_option_display_configSubmitDone(/* cpr.events.CSubmissionEvent */ e){
var ResultCode = app.lookup("Result").getValue("ResultCode");
	if(ResultCode == COMERROR_NONE) {
		var hostApp = app.getHostAppInstance();
		if (hostApp) {
			var DisplayInfo = app.lookup("DisplayInfo");
			hostApp.callAppMethod("setDisplayOptionData", DisplayInfo);
		}
		app.lookup("TMINN_grpDisplayConfig").redraw();	
	} else {
		// error 
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorGetTerminalInfo"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(ResultCode)));
	}
	
}

function onSms_get_terminal_option_display_configSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_get_terminal_option_display_configSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

exports.requestSetData = function() {
	var hostApp = app.getHostAppInstance();
	if (hostApp) {
		var DisplayInfo = app.lookup("DisplayInfo");
		hostApp.callAppMethod("setDisplayOptionData", DisplayInfo);
	}
}