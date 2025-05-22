/************************************************
 * OptionPageInnodep.js
 * Created at 2020. 11. 26. 오전 9:35:40.
 *
 * @author union
 ************************************************/


var dataManager = cpr.core.Module.require("lib/DataManager");

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();

	var sms_getOption = app.lookup("sms_getOption");
	sms_getOption.send();

	
}



/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getOption = e.control;
	
	app.lookup("Vms_grpMain").redraw();	
	app.lookup("ipb_InnodepLic").value = "licNormalClient";
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getOptionSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getOption = e.control;
	
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getOptionSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getOption = e.control;
	
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_updateOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_updateOption = e.control;


	var dmResult = app.lookup("Result");
	var result = dmResult.getValue("ResultCode");
	
	console.log("regist privilege result = ", result);
	
	if (result == 0) {
		var optionAuth = app.lookup("OptionAuth")
		//dataManager.setTemperatureUnit(optionAuth.getValue("TemperatureUnit"));
		//notify("desktop-notify",{type : "success", message :"옵션 설정 성공"});
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Option_Success"));
		
		var dmOptionInnodep = app.lookup("OptionInnodep");
		app.getHostAppInstance().callAppMethod("setOptionInnodep", dmOptionInnodep);
	} else {
		//dialogAlert(app, "error", "옵션 설정 실패 \n\n [CODE : " + result + "]");
		dialogAlert(app, dataManager.getString("Str_Error"), dataManager.getString(getErrorString(result)));
	}
	
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_updateOptionSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_updateOption = e.control;
	var result = app.lookup("Result").getValue("ResultCode");
	
	dialogAlert(app, dataManager.getString("Str_Error"), dataManager.getString(getErrorString(result)));
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_updateOptionSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_updateOption = e.control;
	
	var result = app.lookup("Result").getValue("ResultCode");
	
	dialogAlert(app, dataManager.getString("Str_Error"), dataManager.getString(getErrorString(result)));
}


/*
 * 버튼(btnSave)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnSaveClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnSave = e.control;
	
	var smsUpdateOption = app.lookup("sms_updateOption");
	smsUpdateOption.send();	
	
}
