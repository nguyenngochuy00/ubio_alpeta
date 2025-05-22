/************************************************
 * SetPassword.js
 * Created at 2019. 6. 4. 오후 1:21:24.
 *
 * @author joymrk
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var StrLib = cpr.core.Module.require("lib/StrLib");

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	
	var initValue = app.getHost().initValue;
	var userID = initValue["userID"];
	console.log(userID);
	var UserInfo= app.lookup("UserPasswordInfo");
	UserInfo.setValue("ID", Number(userID));
}

function onADPWU_btnPassWordUpdateClick (/* cpr.events.CMouseEvent */ e) {
	
	var UserInfo = app.lookup("UserPasswordInfo");
	var CurrentPassword = app.lookup("ADPWU_ipbCurrentPassword").value;
	var NewPassword = app.lookup("ADPWU_ipbEnterPassword").value;
	var ComfirmPassword = app.lookup("ADPWU_ipbConfirmPassword").value;
	
	if ( CurrentPassword.length < 4 || NewPassword.length < 4 || ComfirmPassword.length < 4  ) {
		console.log("CurrentPassword.length" + CurrentPassword.length + ", NewPassword.length :" + NewPassword.length + ", ComfirmPassword.length : " + ComfirmPassword.length);
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordLength"));
		return;
	}
	// 비밀번호 입력사항 누락 확
	if ( CurrentPassword.length <= 0 || NewPassword.length <= 0 || ComfirmPassword.length <= 0  ) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorOmissionItem"));
		return;
	}
	// 새비밀번호와 사용중인 비밀번호 비교
	if (CurrentPassword == NewPassword) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorUserOldLoginPasswordDuplicate"));
		return;
	}
	// 새 비밀번호와 확인 용 비교
	if ( NewPassword != ComfirmPassword) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorUserLoginPasswordWrongInput"));
		return;
	}
	
	// 비밀번호 설정 옵션 확인
	var checkResult = true;
	var option = dataManager.getClientOption();
	var DuplicateCharflag = option.getValue("PwNotAllowDuplicateChar"); // 연속문자 사용 불가.
	if (DuplicateCharflag == 1) {
		checkResult = StrLib.checkConsecutiveDuplicateChar(NewPassword);
		if (checkResult == true) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordConsecutiveDuplicate") + " "+ dataManager.getString("Str_WarningPasswordOption"));
			return;
		} 
	}
	
	
	var SameIDflag = option.getValue("PwNotAllowSameID"); //ID 동일 비밀번호 사용 불가.
	if (SameIDflag == 1) {
		if (NewPassword == UserInfo.getValue("ID")) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordSameID") + " "+ dataManager.getString("Str_WarningPasswordOption"));
			return;
		}
	}
	
	var RequiredUpperflag = option.getValue("PwRequiredUpper"); // 영문 대문자 필수
	if (RequiredUpperflag == 1) {
		checkResult = StrLib.checkUpper(NewPassword);
		if (checkResult == false) {// 필수 문자 없어서 리턴
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordRequiredUpper") + " "+ dataManager.getString("Str_WarningPasswordOption"));
			return;
		}
	}
	
	var PwRequiredLower = option.getValue("PwRequiredLower"); // 영문소문자 필수
	if (PwRequiredLower == 1) {
		checkResult = StrLib.checkLower(NewPassword);
		if (checkResult == false) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordRequiredLower") + " "+ dataManager.getString("Str_WarningPasswordOption"));
			return; 
		}
	}
	
	var PwRequiredNum = option.getValue("PwRequiredNum"); // 숫자 필수
	if (PwRequiredNum == 1) {
		checkResult = StrLib.checkNumber(NewPassword);
		if (checkResult == false) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordRequiredNum") + " "+ dataManager.getString("Str_WarningPasswordOption"));
			return; // 동일 문자 있다.
		}
	}
	
	var PwRequiredSymbol = option.getValue("PwRequiredSymbol"); //특수 문자 필수
	if (PwRequiredSymbol == 1) {
		checkResult = StrLib.checkChar(NewPassword);
		if (checkResult == false) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordRequiredSymbol") + " "+ dataManager.getString("Str_WarningPasswordOption"));
			return; // 동일 문자 있다.
		}
	}
	
	// 전부 통과 햇으면 서브미션 날리자
	var RequestData = app.lookup("sms_putUpdatePassword");
	RequestData.action = "/v1/users/" + UserInfo.getValue("ID") + "/loginpassword"
	RequestData.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_putUpdatePasswordSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_PasswordChangeSuccess"));
		app.close();
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed"), "패스워드 변경 실패");
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_putUpdatePasswordSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR);
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_putUpdatePasswordSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}
