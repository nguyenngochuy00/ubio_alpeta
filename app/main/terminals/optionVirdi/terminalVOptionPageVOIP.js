/************************************************
 * terminalVOptionPageVOIP.js
 * Created at 2018. 12. 17. 오후 3:43:29.
 *
 * @author joymrk
 ************************************************/
var comLib;			
var dataManager = cpr.core.Module.require("lib/DataManager");

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	
	var hostAppIns = app.getHostAppInstance();
	if (hostAppIns) {
		var vOptStatus = hostAppIns.callAppMethod("getTerminalOptStatus", "VoipOpt");
		if(vOptStatus == 0) {
			var tID = hostAppIns.callAppMethod("getTerminalID");
			var requestData = app.lookup("sms_get_terminal_option_voip");
			requestData.action = requestData.action + tID + "/option/voip";
			hostAppIns.callAppMethod("parentShowLoadMask", "Str_TerminalVoip");
			requestData.send();
		} else {
			// Vinfo에서 데이터 다시 받기
			var getVopt = hostAppIns.callAppMethod("getVoipOption");
			var vOptinfo = app.lookup("VoipOptValue");
			getVopt.copyToDataMap(vOptinfo);
			app.lookup("TMVVO_grp").redraw();
		}
			
		
	}
}

function onTMVVO_ipbValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var selectedCtrl = e.control;
	var hostAppIns = app.getHostAppInstance();
	var vOptResult;
	switch (selectedCtrl.id) {
	case "TMVVO_ipaddress_ipb":
		vOptResult = hostAppIns.callAppMethod("modifyVoipOption", ["SvrAddress", selectedCtrl.value]);
		break;
	case "TMVVO_id_ipb":
		vOptResult = hostAppIns.callAppMethod("modifyVoipOption", ["AccountID", selectedCtrl.value]);
		break;
	case "TMVVO_pwd_ipb":
		vOptResult = hostAppIns.callAppMethod("modifyVoipOption", ["AccountPwd", selectedCtrl.value]);
		break;
	}
	
	if(vOptResult == -1) {
		console.log("equal data select");
	}
}

function onSms_get_terminal_option_voipSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var hostAppIns = app.getHostAppInstance();
	hostAppIns.callAppMethod("parentHideLoadMask","");
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if(resultCode == 0) {
		var vOptStatus = hostAppIns.callAppMethod("initTerminalOptStatus", "VoipOpt"); 
		var voipInfo = app.lookup("VoipOptValue");
		var res = hostAppIns.callAppMethod("setVoipOption", voipInfo); 
		app.lookup("TMVVO_grp").redraw();
	} else {
		if(dataManager.getOemVersion() == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH){
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalVoipInfoGet") + " " + dataManager.getString("Str_Failed") + " : " + dataManager.getString(getErrorString(resultCode)));						
		} else{
			//dialogAlert(app, "Waning", dataManager.getString("Str_TerminalVoipInfoGet")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalVoipInfoGet") + " " + dataManager.getString("Str_Failed") + " : " + dataManager.getString(getErrorString(resultCode)));			
		}
	}
	
}

function onSms_get_terminal_option_voipSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR);		
}

function onSms_get_terminal_option_voipSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}
