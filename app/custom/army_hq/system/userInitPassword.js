/************************************************
 * userInitPassword.js
 * Created at 2021. 3. 2. 오전 9:19:42.
 *
 * @author joymrk
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
	// 찾을꺼도 없다 사실
	var initValue = app.getHost().initValue;
	_privilegeID = initValue["privilegeID"];
}

function onUPIAMHQ_ipbPasswordMousedown(/* cpr.events.CMouseEvent */ e){
	app.lookup("UPIAMHQ_ipbPassword").secret = false;
}

function onUPIAMHQ_ipbPasswordMouseup(/* cpr.events.CMouseEvent */ e){
	app.lookup("UPIAMHQ_ipbPassword").secret = true;
}

function onUPIAMHQ_btnPasswordInitClick(/* cpr.events.CMouseEvent */ e){
	// 데이터 체크
	var dmloginPasswordInit =  app.lookup("loginPasswordInit");
	dmloginPasswordInit.clear();
	var name = app.lookup("UPIAMHQ_ipbName").value;
	if (name == null || name.length <= 0) {
		dialogAlertAMHQ(app, "경고", "이름을 입력해 주세요");
		return; // 이름입하세요.
	}
	var pwd = app.lookup("UPIAMHQ_ipbPassword").value;
	if (pwd == null || pwd.length < 9) {
		dialogAlertAMHQ(app, "경고", "패스워드를 9자리 이상 입력해 주세요");
		return; // 패스워드
	}
	
	if (pwd == null || pwd.length <= 0) {
		dialogAlertAMHQ(app, "경고", "패스워드를 입력해 주세요");
		return; // 패스워드
	}
	var uniqueID = app.lookup("UPIAMHQ_ipbUniqueID").value;
	if (uniqueID == null || uniqueID.length <= 0) {
		dialogAlertAMHQ(app, "경고", "군번을 입력해 주세요");
		return; // 군번
	}
	var birthDay = app.lookup("UPIAMHQ_dtiBirthday").value;
	console.log("birthDay: " + birthDay);
	if (birthDay == null || birthDay.length <= 0) {
		dialogAlertAMHQ(app, "경고", "생년월일을 입력해 주세요");
		return; // 생년월일
	}
	comLib.showLoadMask("","패스워드 초기화 진행","",0);
	
	dmloginPasswordInit.setValue("privilege", _privilegeID);
	dmloginPasswordInit.setValue("name", name);
	dmloginPasswordInit.setValue("password", pwd);
	dmloginPasswordInit.setValue("uniqueid", uniqueID);
	dmloginPasswordInit.setValue("birthday", birthDay);
	
	var smsPutloginPasswordInit = app.lookup("sms_putloginPasswordInit");
	smsPutloginPasswordInit.action = "/v1/armyhq/initPassword/usertype";
	smsPutloginPasswordInit.send();
}

function onSms_putloginPasswordInitSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	console.log("resultCode: " + resultCode);
	if (resultCode == COMERROR_NONE) {
		//dialogAlertAMHQ(app, "성공", "패스워드가 초기화 되었습니다. 변경된 패스워드로 다시 로그인해 주세요");
		alert("패스워드가 초기화 되었습니다. 변경된 패스워드로 다시 로그인해 주세요");
		app.close();
	} else {
		var msgError;
		if (resultCode == 0x00000001) { // cs 입력값들 누락 , update 실패
			msgError = "잘못된 값을 요청 하였습니다. 입력값을 다시 확인해 주세요";
		} else  if (resultCode == 0x00000001) {
			msgError = "입력된 군번으로 사용자를 찾을 수 없습니다. 다시 확인해 주세요";
		} else if (resultCode == 0x04000005) {
			msgError = "관리자는 해당 방식으로 비밀번호를 초기화 할 수 없습니다.";
		} else if (resultCode == 0x01000021) {
			msgError = "입력된 이름이 저장된 정보와 일치 하지 않습니다.";
		} else if (resultCode == 0x7F000001) {
			msgError = "입력된 생일이 정상적인 값이 아닙니다.다시 확인해 주세요";
		} else if (resultCode == 0x7F000002) {
			msgError = "생년월일이 등록되어 있지 않습니다. 관리자에게 문의하세요";
		} else if (resultCode == 0x7F000003) {
			msgError = "초기화 하려는 비밀번호에 연속문자 오류가 있습니다.";
		} else if (resultCode == 0x7F000004) {
			msgError = "등록된 사용자 아이디와 동일한 비밀번호 입니다. ";
		} else if (resultCode == 0x7F000005) {
			msgError = "비밀번호 작성시 영문 대문자를 입력 해야 합니다.";
		} else if (resultCode == 0x7F000006) {
			msgError = "비밀번호 작성시 영문 소문자를 입력 해야 합니다.";
		} else if (resultCode == 0x7F000007) {
			msgError = "비밀번호 작성시 숫자를 입력 해야 합니다.";
		} else if (resultCode == 0x7F000008) {
			msgError = "비밀번호 작성시 특수문자를 입력 해야 합니다.";
		} else {
			//이름불일치/사번없음/생년월일 불일치/패스워드 입력조건 불일치/
			msgError = "패스워드 초기화에 실패하였습니다. 관리자에게 문의하세요";	
		}
		dialogAlertAMHQ(app, "실패", msgError);	
	} 
	return true;
}


function onSms_putloginPasswordInitSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);	
}

function onSms_putloginPasswordInitSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
