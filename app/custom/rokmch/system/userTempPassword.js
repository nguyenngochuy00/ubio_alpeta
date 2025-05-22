/************************************************
 * userTempPassword.js
 * Created at 2022. 12. 14. 오후 2:35:17.
 *
 * @author zxc
 ************************************************/

var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var StrLib = cpr.core.Module.require("lib/StrLib");
var endFlag = 0;
var _privilegeID; //권한아이디

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);	
	dataManager = getDataManager();

	var initValue = app.getHost().initValue;
	_privilegeID = initValue["privilegeID"];
	var userID = initValue["userID"];
	var userType = initValue["userType"];
	var dmLogin = app.lookup("dmLoginReq");
	dmLogin.setValue("userId", userID);
	dmLogin.setValue("userType", parseInt(userType, 10));

	var remindCountFlag = initValue["flag"]; // 0 : 일반 로그인 실패 , -1 : 마지막 로그인 90일 이후 사용자
	
	if (remindCountFlag == -1) {
		app.lookup("UTPAMHQ_optLoginExpire").value = "사용자 아이디가 만료 되었습니다.";
	} else {
		app.lookup("UTPAMHQ_optLoginExpire").value = "비밀번호 입력 횟수를 초과하였습니다.";
	}
	app.lookup("UTPAMHQ_optLoginExpire").redraw();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_chkTempPasswordSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");

	if (resultCode == ErrorTempPasswordLoginSuccess) {

		var dmServerOption = app.lookup("ServerOption");
		var dmAccountInfo = app.lookup("AccountInfo");
		
		dataManager.setClientOption(dmServerOption);
		dataManager.setAccountInfo(dmAccountInfo);
		
		alert("임시 비밀번호 인증 성공하였습니다.");
		var tempPassword = app.lookup("dmLoginReq").getValue("password");

		app.close({"result" : 0, "temp" : tempPassword});
	} else {
		var msgError;
		if (resultCode == ErrorTempPasswordLoginFail) { // 임시비밀번호 인증 실패
			msgError = "임시 비밀번호 인증 실패하였습니다. ";
		} else {
			msgError = "패스워드 초기화에 실패하였습니다. 관리자에게 문의하세요";	
		}
		dialogAlertAMHQ(app, "실패", msgError);	
	} 
}

function onSms_chkTempPasswordSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);	
}

function onSms_chkTempPasswordSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


// 임시 비밀 번호 확인
function onAMHQLPS_btnSaveClick(/* cpr.events.CMouseEvent */ e){
		
	var dmLogin = app.lookup("dmLoginReq");
	var tempPassword = app.lookup("UTPAMHQ_ipbPassword").value;
	
	dmLogin.setValue("password", tempPassword);
	
	// 임시비밀번호 검사 서브 미션
	app.lookup("sms_chkTempPassword").send();
}

/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onUTPAMHQ_ipbPasswordKeyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var uTPAMHQ_ipbPassword = e.control;
	if (e.keyCode == 13) {
		onAMHQLPS_btnSaveClick();
	}
}
