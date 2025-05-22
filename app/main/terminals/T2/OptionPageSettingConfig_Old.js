/************************************************
 * terminalNOptionPageSettingConfig.js
 * Created at 2018. 11. 23. 오전 9:27:47.
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
		var getdmSettingOptionData =  hostAppIns.callAppMethod("getSettingOptionData");
		if (getdmSettingOptionData != null ) {
			var dmSettingInfo = app.lookup("SettingInfo");
			getdmSettingOptionData.copyToDataMap(dmSettingInfo); 
			console.log(dmSettingInfo.getDatas());
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