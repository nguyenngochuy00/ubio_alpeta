/************************************************
 * setPasswordAMHQ.js
 * Created at 2022. 12. 19. 오후 2:22:20.
 *
 * @author zxc
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var StrLib = cpr.core.Module.require("lib/StrLib");


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	
	// 비밀번호 설정 옵션
	var serverOption = dataManager.getClientOption();
	var userID = dataManager.getAccountInfo().getValue("UserID");
	var initValue = app.getHost().initValue;
	
	// 육군 본부 임시 비밀번호 변경 요청인경우 initValue 존재
	if (initValue) {
		if (initValue["temp"]) { // 임시 비밀번호가 있는 경우
			var temp = initValue["temp"];
			var dmUserPasswordInfo = app.lookup("UserPasswordInfo");
			dmUserPasswordInfo.setValue("ID", parseInt(userID, 10));
			dmUserPasswordInfo.setValue("CurrentPassword", temp);
		}	
	} else {
		app.close(false);
	}
	
}

function onSUPARHQ_btnPassWordUpdateClick(/* cpr.events.CMouseEvent */ e){
	var UserInfo = app.lookup("UserPasswordInfo");
	var CurrentPassword = UserInfo.getValue("CurrentPassword");
	var NewPassword = app.lookup("SUPAMHQ_ipbEnterPassword").value;
	var ComfirmPassword = app.lookup("SUPAMHQ_ipbConfirmPassword").value;
	
	// 유효성 검사
	if (NewPassword.length < 9 || ComfirmPassword.length < 9) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "비밀번호는 최소 9자리 이상 입력해야 합니다.");
		return;
	}
	
	// 비밀번호 입력사항 누락 확
	if (CurrentPassword.length <= 0 || NewPassword.length <= 0 || ComfirmPassword.length <= 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "누락된 항목이 있습니다.");
		return;
	}
	// 새비밀번호와 사용중인 비밀번호 비교
	if (CurrentPassword == NewPassword) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "이전 사용자 로그인 비밀번호는 현재 사용 할 수 없습니다.");
		return;
	}
	// 새 비밀번호와 확인 용 비교
	if (NewPassword != ComfirmPassword) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "비밀번호가 일치하지 않습니다.");
		return;
	}
	
	// 비밀번호 설정 옵션 확인
	var checkResult = true;
	var option = dataManager.getClientOption();
	var DuplicateCharflag = option.getValue("PwNotAllowDuplicateChar"); // 연속문자 사용 불가.
	if (DuplicateCharflag == 1) {
		checkResult = StrLib.checkConsecutiveDuplicateChar(NewPassword);
		if (checkResult == true) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "동일한 문자가 연속적으로 있습니다. 비밀번호 생성옵션 설정을 위반 중입니다.");
			return;
		}
	}
	
	var SameIDflag = option.getValue("PwNotAllowSameID"); //ID 동일 비밀번호 사용 불가.
	if (SameIDflag == 1) {
		if (NewPassword == UserInfo.getValue("ID")) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "사용자 ID와 동일한 비밀번호를 사용 중입니다. 비밀번호 생성옵션 설정을 위반 중입니다.");
			return;
		}
	}
	
	var RequiredUpperflag = option.getValue("PwRequiredUpper"); // 영문 대문자 필수
	if (RequiredUpperflag == 1) {
		checkResult = StrLib.checkUpper(NewPassword);
		if (checkResult == false) { // 필수 문자 없어서 리턴
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "대문자는 필수 입력 사항입니다. 비밀번호 생성옵션 설정을 위반 중입니다.");
			return;
		}
	}
	
	var PwRequiredLower = option.getValue("PwRequiredLower"); // 영문소문자 필수
	if (PwRequiredLower == 1) {
		checkResult = StrLib.checkLower(NewPassword);
		if (checkResult == false) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "소문자는 필수 입력 사항입니다. 비밀번호 생성옵션 설정을 위반 중입니다.");
			return;
		}
	}
	
	var PwRequiredNum = option.getValue("PwRequiredNum"); // 숫자 필수
	if (PwRequiredNum == 1) {
		checkResult = StrLib.checkNumber(NewPassword);
		if (checkResult == false) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "숫자는 필수 입력 사항입니다. 비밀번호 생성옵션 설정을 위반 중입니다.");
			return; // 동일 문자 있다.
		}
	}
	
	var PwRequiredSymbol = option.getValue("PwRequiredSymbol"); //특수 문자 필수
	if (PwRequiredSymbol == 1) {
		checkResult = StrLib.checkChar(NewPassword);
		if (checkResult == false) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "특수 문자는 필수 입력 사항입니다. 비밀번호 생성옵션 설정을 위반 중입니다.");
			return; // 동일 문자 있다.
		}
	}
	
	var RequestData = app.lookup("sms_putUpdatePassword");
	RequestData.action = "/v1/armyhq/users/" + UserInfo.getValue("ID") + "/loginpassword";
	RequestData.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_putUpdatePasswordSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_PasswordChangeSuccess"));
		app.close(true);
	 } else if (resultCode == ErrorTempPasswordMailRecordNotFound) {	// 임시 비밀번호 보낸 기록 없음 
	 	dialogAlertAMHQ(app, dataManager.getString("Str_Fail"), "처음부터 다시 시도 바랍니다.");
		app.close(false);
	 } else if (resultCode == ErrorTempPasswordExpiration) { // 임시 비밀번호 만료
	 	dialogAlertAMHQ(app, dataManager.getString("Str_Fail"), "임시 비밀번호가 만료 되었습니다. 임시 비밀번호를 재 발급 바랍니다.");
	 	app.close(false);
	 } else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_putUpdatePasswordSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_ERROR);
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_putUpdatePasswordSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onSUPAMHQ_ipbEnterPasswordKeyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var sUPAMHQ_ipbEnterPassword = e.control;
	if (e.keyCode == 13) {
		onSUPARHQ_btnPassWordUpdateClick();
	}
}
