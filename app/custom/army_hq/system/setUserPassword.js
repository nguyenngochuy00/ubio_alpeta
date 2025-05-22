/************************************************
 * setUserPassword.js
 * Created at 2022. 1. 16. 오후 8:01:24.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var inputValidManager = createInputValidator(app);
var comLib;
var pwdOption;
var StrLib = cpr.core.Module.require("lib/StrLib");
	
/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	
	pwdOption = dataManager.getClientOption();
	app.lookup("sms_getOptionLoginpwd").send();	
}

/*
 * 인풋 박스에서 mousedown 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 누를 때 발생하는 이벤트.
 */
function onAMHQLPS_chbPasswordMousedown(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var aMHQLPS_chbPassword = e.control;
	app.lookup("AMHQLPS_ipbPassword").secret = false;
}


/*
 * 인풋 박스에서 mouseup 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 뗄 때 발생하는 이벤트.
 */
function onAMHQLPS_chbPasswordMouseup(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var aMHQLPS_chbPassword = e.control;
	app.lookup("AMHQLPS_ipbPassword").secret = true;
}


/*
 * 체크 박스에서 value-change 이벤트 발생 시 호출.
 * CheckBox의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onAMHQLPS_chbUseFlagValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.CheckBox
	 */
	var aMHQLPS_chbUseFlag = e.control;
	if (aMHQLPS_chbUseFlag.value == 1) {
		app.lookup("AMHQLPS_ipbPassword").enabled = true;
	} else {
		app.lookup("AMHQLPS_ipbPassword").enabled = false;
	}
}



/*
 * "저장" 버튼(AMHQLPS_btnSave)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAMHQLPS_btnSaveClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aMHQLPS_btnSave = e.control;
	var initPwd = app.lookup("OptionLoginpwd").getValue("InitPassword");
	
	if ( initPwd.toString().length < 9 || initPwd.toString().length < 9 ) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "비밀번호는 최소 9자리 이상 입력해야 합니다.");
		return;
	}
	
	var checkResult = true;
	var DuplicateCharflag = pwdOption.getValue("PwNotAllowDuplicateChar"); // 연속문자 사용 불가.
	if (DuplicateCharflag == 1) {
		checkResult = StrLib.checkConsecutiveDuplicateChar(initPwd);
		if (checkResult == true) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordConsecutiveDuplicate") + "\n"+ dataManager.getString("Str_WarningPasswordOption"));
			return;
		} 
	}
	
	var RequiredUpperflag = pwdOption.getValue("PwRequiredUpper"); // 영문 대문자 필수
	if (RequiredUpperflag == 1) {
		checkResult = StrLib.checkUpper(initPwd);
		if (checkResult == false) {// 필수 문자 없어서 리턴
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordRequiredUpper") + "\n"+ dataManager.getString("Str_WarningPasswordOption"));
			return;
		}
	}
	var PwRequiredLower = pwdOption.getValue("PwRequiredLower"); // 영문소문자 필수
	if (PwRequiredLower == 1) {
		checkResult = StrLib.checkLower(initPwd);
		if (checkResult == false) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordRequiredLower") + "\n"+ dataManager.getString("Str_WarningPasswordOption"));
			return; 
		}
	}
	
	var PwRequiredNum = pwdOption.getValue("PwRequiredNum"); // 숫자 필수
	if (PwRequiredNum == 1) {
		checkResult = StrLib.checkNumber(initPwd);
		if (checkResult == false) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordRequiredNum") + "\n"+ dataManager.getString("Str_WarningPasswordOption"));
			return; // 동일 문자 있다.
		}
	}
	var PwRequiredSymbol = pwdOption.getValue("PwRequiredSymbol"); //특수 문자 필수
	if (PwRequiredSymbol == 1) {
		checkResult = StrLib.checkChar(initPwd);
		if (checkResult == false) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordRequiredSymbol") + "\n"+ dataManager.getString("Str_WarningPasswordOption"));
			return; 
		}
	}
	
	app.lookup("sms_putOptionLoginpwd").send();
}

function onSms_SubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_SubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_putOptionLoginpwdSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_putOptionLoginpwd = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		dialogAlertAMHQ(app, "성공", "비밀번호 설정을 완료 하였습니다.");
	
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getOptionLoginpwdSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getOptionLoginpwd = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		app.lookup("AMHQLPS_grpMain").redraw();
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}
