/************************************************
 * OptionPageSettingConfig.js
 * Created at 2019. 6. 26. 오후 7:22:58.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
	
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();	
	var hostAppIns = app.getHostAppInstance();
	if (hostAppIns) {		
		var getdmSettingOptionData =  hostAppIns.callAppMethod("getSettingOptionData");
		if (getdmSettingOptionData != null ) {
			var dmSettingInfo = app.lookup("SettingInfo");
			getdmSettingOptionData.copyToDataMap(dmSettingInfo); 
			
			var dmWiegandInInfo = app.lookup("WiegandInInfo");
			var getdmWiegandIn = hostAppIns.callAppMethod("getSettingOptionWiegandInData");
			getdmWiegandIn.copyToDataMap(dmWiegandInInfo); 
			var dmWiegandOutInfo = app.lookup("WiegandOutInfo");
			var getdmWiegandOut = hostAppIns.callAppMethod("getSettingOptionWiegandOutData");
			getdmWiegandOut.copyToDataMap(dmWiegandOutInfo); 
			
			app.lookup("TMINN_grpSettingConfig").redraw();	
		} else {
			if (hostAppIns.callAppMethod("getTerminalID")) {
				console.log("exist get terminal id");
				var tID = hostAppIns.callAppMethod("getTerminalID");
				console.log(tID);
				
				var requestData = app.lookup("sms_get_terminal_option_setting_config");
				requestData.action = requestData.action + tID + "/option/setting";
				console.log(requestData.action);
				requestData.send();
			}
		}
		
	}
}

function onSms_get_terminal_option_setting_configSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	if (ResultCode == COMERROR_NONE) {
	
		var hostApp = app.getHostAppInstance();
		if (hostApp) {
			var SettingInfo = app.lookup("SettingInfo");
			hostApp.callAppMethod("setSettingOptionData", SettingInfo);	
			
			var WiegandInInfo = app.lookup("WiegandInInfo");
			hostApp.callAppMethod("setSettingOptionWiegandInData", WiegandInInfo);
			
			var WiegandOutInfo = app.lookup("WiegandOutInfo");
			hostApp.callAppMethod("setSettingOptionWiegandOutData", WiegandOutInfo);
		}
		app.lookup("TMINN_grpSettingConfig").redraw();	
	} else {
		
	}
}

function onSms_get_terminal_option_setting_configSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_get_terminal_option_setting_configSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

exports.requestSetData = function() {
	var hostApp = app.getHostAppInstance();
	if (hostApp) {
		var SettingInfo = app.lookup("SettingInfo");
		hostApp.callAppMethod("setSettingOptionData", SettingInfo);
		
		var WiegandInInfo = app.lookup("WiegandInInfo");
		hostApp.callAppMethod("setSettingOptionWiegandInData", WiegandInInfo);
		
		var WiegandOutInfo = app.lookup("WiegandOutInfo");
		hostApp.callAppMethod("setSettingOptionWiegandOutData", WiegandOutInfo);
	}
}
