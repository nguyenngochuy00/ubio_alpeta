/************************************************
 * TerminalRegist.js
 * Created at 2019. 3. 4. 오후 10:17:48.
 *
 * @author wonki
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var inputValidManager = createInputValidator(app);

function onBodyLoad( /* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	var brandType = dataManager.getSystemBrandType();
	var ipbID = app.lookup("TMREG_nbeTerminalID");
	var ipbTerminalDescription = app.lookup("TMREG_nbeTerminalID");

	if (brandType == BRAND_NITGEN) {
		ipbID.max = 2000
	} else {
		ipbID.max = 99999999
	}
	ipbTerminalDescription.value = '';
	inputValidManager.validate(ipbTerminalDescription, "isNull", dataManager.getString("Str_RequiredAlert"));
	
}
// 단말기 "등록" 버튼에서 click 이벤트 발생 시 호출.
function onTMREG_btnTerminalRegistClick(/* cpr.events.CMouseEvent */ e){	
	var terminalInfo = app.lookup("TerminalInfo");
	var terminalInfoId = terminalInfo.getValue('ID');
	var ipbTerminalDescription = app.lookup("TMREG_nbeTerminalID");
	if (terminalInfoId == 0 || terminalInfoId == '') {
		ipbTerminalDescription.value = ''; /* 비워줘서 placeholder값 노출되도록 */
		inputValidManager.validate(ipbTerminalDescription, "isNull", dataManager.getString("Str_RequiredAlert"));
	} else {
		app.lookup('sms_postTerminal').send();
	}
}

// 단말기 등록 취소 클릭
function onTMREG_btnCancelClick(/* cpr.events.CMouseEvent */ e){
	app.close();
}

/*
 * 넘버 에디터에서 value-change 이벤트 발생 시 호출.
 * NumberEditor의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onTMREG_nbeTerminalIDValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.NumberEditor
	 */
	var tMREG_nbeTerminalID = e.control;
	var terminalInfo = app.lookup("TerminalInfo");
	var ipbTerminalDescription = app.lookup('TMREG_nbeTerminalID');
	if(tMREG_nbeTerminalID.value == 0 || tMREG_nbeTerminalID.value == ''){
		terminalInfo.setValue('ID', '');
		inputValidManager.validate(ipbTerminalDescription, "isNull", dataManager.getString("Str_RequiredAlert"));
	} else {
		inputValidManager.validate(ipbTerminalDescription, "isValid", "");
	}
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postTerminalSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_postTerminal = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		app.close({
			"Result": 0
		});
	} else {
		dialogAlertCustomSize(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)), 0, 280, 150);
	}
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_postTerminalSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_postTerminal = e.control;
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_postTerminalSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_postTerminal = e.control;
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}
