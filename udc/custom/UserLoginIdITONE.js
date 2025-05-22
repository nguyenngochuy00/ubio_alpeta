/************************************************
 * UserLoginIdITONE.js
 * Created at 2023. 10. 27. ���� 10:03:17.
 *
 * @author SW2Team
 ************************************************/
var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");

exports.getLoginIDValue = function() {
	return app.lookup("ITONE_LoginID").value;
}

exports.setLoginIDValue = function(loginID) {
	app.lookup("ITONE_LoginID").value = loginID;
}


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
}

/*
 * "중복 체크" 버튼(ITONE_btnLoginIDduplication)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onITONE_btnLoginIDduplicationClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var iTONE_btnLoginIDduplication = e.control;
	
	var smsChkDuplication = app.lookup("sms_chkLoginIDDuplication");
	smsChkDuplication.action = "/v1/oemData/itone/chkDuplication";
	smsChkDuplication.send();
}




/*
 * 서브미션에서 before-submit 이벤트 발생 시 호출.
 * 통신을 시작하기전에 발생합니다.
 */
function onSms_chkLoginIDDuplicationBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_chkLoginIDDuplication = e.control;
//	comLib.showLoadMask("", dataManager.getString("Str_Recall"), "", 0);
}




/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_chkLoginIDDuplicationSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_chkLoginIDDuplication = e.control;
	
//	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
//		app.getHostAppInstance().callAppMethod(dialogAlert,app, dataManager.getString("Str_Success"), "사용 가능한 ID 입니다.");
		dialogAlert(app.getHostAppInstance(), dataManager.getString("Str_Success"), "사용 가능한 ID 입니다.");
	} else {
//		app.getHostAppInstance().callAppMethod(dialogAlert,app, dataManager.getString("Str_Success"), "사용 가능한 ID 입니다.");
		dialogAlert(app.getHostAppInstance(), dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_chkLoginIDDuplicationSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_chkLoginIDDuplication = e.control;
//	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_chkLoginIDDuplicationSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_chkLoginIDDuplication = e.control;
//	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

exports.chkLoginAllowedToggle = function(flag) {
	var ipbID = app.lookup("ITONE_LoginID");
	if(flag) {
		ipbID.enabled = true
	} else {
		ipbID.value = "";
		ipbID.enabled = false;
	}
}
