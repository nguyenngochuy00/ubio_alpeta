/************************************************
 * terminalOptionNetwork.js
 * Created at 2018. 11. 14. 오후 9:39:45.
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
		var getdmNetworkInfo = hostAppIns.callAppMethod("getNetworkOptionData");
		if (getdmNetworkInfo != null) {
			var dmNetworkInfo = app.lookup("NetworkInfo");
			getdmNetworkInfo.copyToDataMap(dmNetworkInfo); 
			app.lookup("networkgrid2").redraw();	
		} else {
			if (hostAppIns.hasAppMethod("getTerminalID")) {
				console.log("exist get terminal id");
				var tID = hostAppIns.callAppMethod("getTerminalID");
				console.log(tID);
				
				var requestData = app.lookup("sms_get_terminal_option_network");
				requestData.action = requestData.action + tID + "/option/network";
				console.log(requestData.action);
				requestData.send();
			}	
		}
		
	}
}

function onSms_get_terminal_option_networkSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	if (ResultCode == COMERROR_NONE) {
		var networkInfo = app.lookup("NetworkInfo");
		var hostApp = app.getHostAppInstance();
		if (hostApp) {
			hostApp.callAppMethod("setNetworkOptionData", networkInfo);	
		}
		
		app.lookup("networkgrid2").redraw();	
	} else {
		// error 
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorGetTerminalInfo"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(ResultCode)));
	}
	
}

function onSms_get_terminal_option_networkSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_get_terminal_option_networkSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

exports.requestSetData = function() {
	var hostApp = app.getHostAppInstance();
	if (hostApp) {
		var NetworkInfo = app.lookup("NetworkInfo");
		hostApp.callAppMethod("setNetworkOptionData", NetworkInfo);
	}
}