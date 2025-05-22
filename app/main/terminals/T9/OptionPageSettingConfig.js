/************************************************
 * terminalNOptionPageSettingConfig.js
 * Created at 2018. 11. 23. 오전 9:27:47.
 *
 * @author wonki
 ************************************************/



/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var hostAppIns = app.getHostAppInstance();
	if (hostAppIns) {		
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


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms_get_terminal_option_setting_configSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_get_terminal_option_setting_config = e.control;
	app.lookup("TMINN_grpSettingConfig").redraw();	
}
