/************************************************
 * initPassword.js
 * Created at 2021. 2. 17. 오후 2:39:40.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var inputValidManager = createInputValidator(app);
var ipwahq_version;
var comLib;
var pwdOption;
var ipwahq_userID;
var StrLib = cpr.core.Module.require("lib/StrLib");
/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();	
	ipwahq_version = dataManager.getSystemVersion();
	pwdOption = dataManager.getClientOption();
	//패스워드 제한조건
	
	var initValue = app.getHost().initValue;
	ipwahq_userID = initValue["userID"];
	app.lookup("sms_getOptionLoginpwd").send();
}

function onIPWAHQ_btnPwdSecretedMousedown(/* cpr.events.CMouseEvent */ e){
	app.lookup("IPWAHQ_ipbPassword1").secret = false;
}

function onButtonMousedown(/* cpr.events.CMouseEvent */ e){
	app.lookup("IPWAHQ_ipbPassword2").secret = false;
}

function onIPWAHQ_btnPwdSecretedMouseup(/* cpr.events.CMouseEvent */ e){
	app.lookup("IPWAHQ_ipbPassword1").secret = true;
}

function onButtonMouseup(/* cpr.events.CMouseEvent */ e){
	app.lookup("IPWAHQ_ipbPassword2").secret = true;
}

function onIPWAHQ_btnSaveClick(/* cpr.events.CMouseEvent */ e){
	var password1 = app.lookup("IPWAHQ_ipbPassword1").value;
	var password2 = app.lookup("IPWAHQ_ipbPassword2").value;
	if ( password2.length < 9 || password1.length < 9 ) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "비밀번호는 최소 9자리 이상 입력해야 합니다.");
		return;
	}
	
	// 비밀번호 입력사항 누락 확
	if ( password1.length <= 0 || password2.length <= 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorOmissionItem"));
		return;
	}
	
	// 새 비밀번호와 확인 용 비교
	if ( password1 != password2) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorUserLoginPasswordWrongInput"));
		return;
	}
	
	var checkResult = true;
	var DuplicateCharflag = pwdOption.getValue("PwNotAllowDuplicateChar"); // 연속문자 사용 불가.
	if (DuplicateCharflag == 1) {
		checkResult = StrLib.checkConsecutiveDuplicateChar(password1);
		if (checkResult == true) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordConsecutiveDuplicate") + "\n"+ dataManager.getString("Str_WarningPasswordOption"));
			return;
		} 
	}
	// 아이디 가지고 와야 하는 이유
	var SameIDflag = pwdOption.getValue("PwNotAllowSameID"); //ID 동일 비밀번호 사용 불가.
	if (SameIDflag == 1) {
		if (password1 == ipwahq_userID) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordSameID") + "\n"+ dataManager.getString("Str_WarningPasswordOption"));
			return;
		}
		
		var strUserID = StrLib.formattedString("00000000",String(ipwahq_userID), "left");	
		if (password1 == strUserID) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordSameID") + "\n"+ dataManager.getString("Str_WarningPasswordOption"));
			return;
		}
	}
	var RequiredUpperflag = pwdOption.getValue("PwRequiredUpper"); // 영문 대문자 필수
	if (RequiredUpperflag == 1) {
		checkResult = StrLib.checkUpper(password1);
		if (checkResult == false) {// 필수 문자 없어서 리턴
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordRequiredUpper") + "\n"+ dataManager.getString("Str_WarningPasswordOption"));
			return;
		}
	}
	var PwRequiredLower = pwdOption.getValue("PwRequiredLower"); // 영문소문자 필수
	if (PwRequiredLower == 1) {
		checkResult = StrLib.checkLower(password1);
		if (checkResult == false) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordRequiredLower") + "\n"+ dataManager.getString("Str_WarningPasswordOption"));
			return; 
		}
	}
	
	var PwRequiredNum = pwdOption.getValue("PwRequiredNum"); // 숫자 필수
	if (PwRequiredNum == 1) {
		checkResult = StrLib.checkNumber(password1);
		if (checkResult == false) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordRequiredNum") + "\n"+ dataManager.getString("Str_WarningPasswordOption"));
			return; // 동일 문자 있다.
		}
	}
	var PwRequiredSymbol = pwdOption.getValue("PwRequiredSymbol"); //특수 문자 필수
	if (PwRequiredSymbol == 1) {
		checkResult = StrLib.checkChar(password1);
		if (checkResult == false) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordRequiredSymbol") + "\n"+ dataManager.getString("Str_WarningPasswordOption"));
			return; 
		}
	}
	app.close(password1);// 전송
	/*
	// 전부 통과 햇으면 서브미션 날리자
	var RequestData = app.lookup("sms_putUpdatePassword");
	RequestData.action = "/v1/users/" + UserInfo.getValue("ID") + "/loginpassword"
	RequestData.send();*/
}

function onIPWAHQ_btnCancelClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var iPWAHQ_btnCancel = e.control;
	app.close();
}

function onIPWAHQ_opbPwdSecretedMousedown(/* cpr.events.CMouseEvent */ e){
	app.lookup("IPWAHQ_ipbPassword1").secret = false;
}

function onIPWAHQ_opbPwdSecretedMouseup(/* cpr.events.CMouseEvent */ e){
	
	app.lookup("IPWAHQ_ipbPassword1").secret = true;
}

function onIPWAHQ_btnPwdSecreted2Mousedown(/* cpr.events.CMouseEvent */ e){
	app.lookup("IPWAHQ_ipbPassword2").secret = false;
}

function onIPWAHQ_btnPwdSecreted2Mouseup(/* cpr.events.CMouseEvent */ e){
	app.lookup("IPWAHQ_ipbPassword2").secret = true;
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
		var optionLoginpwd = app.lookup("OptionLoginpwd");
		var useFlag = optionLoginpwd.getValue("PwdUseFlag");
		if (useFlag == 1) {
			app.lookup("IPWAHQ_ipbPassword1").value = optionLoginpwd.getValue("InitPassword");
			app.lookup("IPWAHQ_ipbPassword2").value = optionLoginpwd.getValue("InitPassword");
			//dialogAlertAMHQ(app, "정보", "기본패스워드가 입력되었습니다. \n [적용]을 이용하여 실제 패스워드를 적용해 주세요");
			var password1 = app.lookup("IPWAHQ_ipbPassword1").value;
			var password2 = app.lookup("IPWAHQ_ipbPassword2").value;
			if ( password2.length < 9 || password1.length < 9 ) {
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "비밀번호는 최소 9자리 이상 입력해야 합니다.");
				return;
			}
			
			// 비밀번호 입력사항 누락 확
			if ( password1.length <= 0 || password2.length <= 0) {
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorOmissionItem"));
				return;
			}
			
			// 새 비밀번호와 확인 용 비교
			if ( password1 != password2) {
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorUserLoginPasswordWrongInput"));
				return;
			}
			
			var checkResult = true;
			var DuplicateCharflag = pwdOption.getValue("PwNotAllowDuplicateChar"); // 연속문자 사용 불가.
			if (DuplicateCharflag == 1) {
				checkResult = StrLib.checkConsecutiveDuplicateChar(password1);
				if (checkResult == true) {
					dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordConsecutiveDuplicate") + "\n"+ dataManager.getString("Str_WarningPasswordOption"));
					return;
				} 
			}
			// 아이디 가지고 와야 하는 이유
			var SameIDflag = pwdOption.getValue("PwNotAllowSameID"); //ID 동일 비밀번호 사용 불가.
			if (SameIDflag == 1) {
				if (password1 == ipwahq_userID) {
					dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordSameID") + "\n"+ dataManager.getString("Str_WarningPasswordOption"));
					return;
				}
				
				var strUserID = StrLib.formattedString("00000000",String(ipwahq_userID), "left");	
				if (password1 == strUserID) {
					dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordSameID") + "\n"+ dataManager.getString("Str_WarningPasswordOption"));
					return;
				}
			}
			var RequiredUpperflag = pwdOption.getValue("PwRequiredUpper"); // 영문 대문자 필수
			if (RequiredUpperflag == 1) {
				checkResult = StrLib.checkUpper(password1);
				if (checkResult == false) {// 필수 문자 없어서 리턴
					dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordRequiredUpper") + "\n"+ dataManager.getString("Str_WarningPasswordOption"));
					return;
				}
			}
			var PwRequiredLower = pwdOption.getValue("PwRequiredLower"); // 영문소문자 필수
			if (PwRequiredLower == 1) {
				checkResult = StrLib.checkLower(password1);
				if (checkResult == false) {
					dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordRequiredLower") + "\n"+ dataManager.getString("Str_WarningPasswordOption"));
					return; 
				}
			}
			
			var PwRequiredNum = pwdOption.getValue("PwRequiredNum"); // 숫자 필수
			if (PwRequiredNum == 1) {
				checkResult = StrLib.checkNumber(password1);
				if (checkResult == false) {
					dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordRequiredNum") + "\n"+ dataManager.getString("Str_WarningPasswordOption"));
					return; // 동일 문자 있다.
				}
			}
			var PwRequiredSymbol = pwdOption.getValue("PwRequiredSymbol"); //특수 문자 필수
			if (PwRequiredSymbol == 1) {
				checkResult = StrLib.checkChar(password1);
				if (checkResult == false) {
					dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordRequiredSymbol") + "\n"+ dataManager.getString("Str_WarningPasswordOption"));
					return; 
				}
			}
			console.log(password1);
			app.close(password1);// 전송
		}
		
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_getOptionLoginpwdSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getOptionLoginpwdSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
