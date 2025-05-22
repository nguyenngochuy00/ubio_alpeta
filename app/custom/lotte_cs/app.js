/************************************************
 * app.js
 * Created at 2018. 11. 13. 오전 9:51:52.
 *
 * @author fois
 ************************************************/
// 20200416 정래훈 - 토마토시스템에서 알려준 캐시 미사용 설정 소스
var envConfig = cpr.core.AppConfig.INSTANCE.getEnvConfig();
envConfig.setValue("appcache", false);

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
comLib = createComUtil(app);
var messageLib = null;


function onBodyInit(/* cpr.events.CEvent */ e){
	
}
// Body에서 load 이벤트 발생 시 호출.
function onBodyLoad(/* cpr.events.CEvent */ e){	
	dataManager = getDataManager();	
	var language = localStorage.getItem("language");
	if( language ){
		dataManager.setLocale(language);
	}else {
		language = dataManager.initLanguage();
		localStorage.setItem("language",language);
	}
	comLib.language(language);
		
	app.lookup("sms_chkLogin").send(); // 로그인 여부 체크
	//app.lookup("LOGIN_ipbUserID").inputFilter = /^[a-zA-Z0-9]*$/
	
}

// 로그인 체크 결과
function onSms_chkLoginSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var SystemInfo = app.lookup("SystemInfo");
	var fullversion = SystemInfo.getValue("Version");
	var verArr = fullversion.split('.');
	dataManager.setOemVersion(verArr[3]);
	
			
	document.title = dataManager.getString("Str_ProgramName");
		
	
	if( dataManager.getOemVersion() == OEM_MCP040) {
		dataManager.setENABLE_MCP040(1);
	}
	
	messageLib = createMessageDialogUtil(app);
	messageLib.usint_versionUpdate(fullversion);
		
	
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){ // 로그인 상태
		var account = app.lookup("AccountInfo");
		var result = app.lookup("Result");
		var systeminfo = app.lookup("SystemInfo");
		//console.log(systeminfo.getDatas());
		
		dataManager = getDataManager();
		dataManager.setAccountInfo(account);			
		dataManager.setSystemInfo(systeminfo);
		
		//일반버전 강원래드 구분
		var usint_version;
		
			
		usint_version = dataManager.getSystemVersion();
		var appId = "app/main/osmain" + "?" + usint_version;		
		cpr.core.App.load(appId, function(newapp) {
				app.close();
				newapp.createNewInstance().run();				
		});		
			
		
		
	} else {
		app.lookup("sms_getInitOption").send(); // 브랜드 타입 요청. 사용자 아이디 자리수 제한을 위해
	}
}

// 로그인 체크 에러
function onSms_chkLoginSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 로그인 체크 타임아웃
function onSms_chkLoginSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 브랜드 타입 가져오기 완료
function onSms_getInitOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/* @type cpr.protocols.Submission */
	var sms_getBrandType = e.control;
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		var dmBrandType = app.lookup("brandType");		
		var dmInitOption = app.lookup("initOption");
		var userIDLength = dmInitOption.getValue("userIDLength");
		userIDLength = 20;
				
		app.lookup("LOGIN_ipbUserID").maxLength = userIDLength;
		dataManager.setUserIDLength(userIDLength);
	} else {		
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorBrandTypeLoadingFailed"));
	}
		
}

// 브랜드 타입 가져오기 에러 
function onSms_getInitOptionSubmitError(/* cpr.events.CSubmissionEvent */ e){	
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 브랜드 타입 가져오기 타임아웃
function onSms_getInitOptionSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// "SIGN IN" 버튼에서 click 이벤트 발생 시 호출.
function onLOGIN_btnSignInClick(e){

	
	var requestData = app.lookup("dmLoginReq");
	var userID = app.lookup("LOGIN_ipbUserID").value;

	if( userID == null ){
		dialogAlert(app, dataManager.getString("Str_InputDataError"), dataManager.getString("Str_UserIDInputAlert"));
		return;
	}
	
	var SystemInfo = app.lookup("SystemInfo");
	requestData.setValue( "userId", userID);
	var userType = 100;
	requestData.setValue( "userType", userType);
	
	var userPW = app.lookup("LOGIN_ipbUserPW").value;
	if( userPW  == null || userPW.length < 4 ){		
		dialogAlert(app, dataManager.getString("Str_InputDataError"), dataManager.getString("Str_PasswordLengthError"));
		return;
	}
	requestData.setValue( "password", userPW);
	
	app.lookup("sms_login").send();
}

// 로그인 결과 수신
function onSms_loginSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	var account = app.lookup("AccountInfo");
	var result = app.lookup("Result");
	var systeminfo = app.lookup("SystemInfo");
	//console.log(systeminfo.getDatas());
	var resultCode = result.getValue("ResultCode")
	if( resultCode == 0 || resultCode == 1 || resultCode == ERROR_USER_LOGINPASSWORD_EXPIRATION ){	
		if(result.getValue("ResultCode") ==  ERROR_USER_LOGINPASSWORD_EXPIRATION ) { // 만기일자의 경우 비밀번호 변경하게 처리
			account.setValue("FirstLoginFlag", 1);
		}
		
		dataManager = getDataManager();
		dataManager.setAccountInfo(account);			
		dataManager.setSystemInfo(systeminfo);
		
			
			var usint_version;
			usint_version = dataManager.getSystemVersion();
			var appId = "app/main/osmain" + "?" + usint_version;			
			cpr.core.App.load(appId, function(newapp) {
				app.close();
				newapp.createNewInstance().run();				
			});
		
	
	}else{		
		var ResultCode = result.getValue("ResultCode");
		if (ResultCode == ERROR_USER_LOGIN_FAIL_COUNT) {
			var remindCount = app.lookup("LoginFailInfo").getValue("RemindCount");
			if (remindCount <= 0) { //0 회인경우 로그인 실패 시간으로 오류 표시
				//dialogAlert(app, dataManager.getString("Str_ErrorLoginFail"), "더이상 로그인 할 수 없습니다. 관리자에게 문의하세요");
				
					dialogAlert(app, dataManager.getString("Str_ErrorLoginFail"), dataManager.getString("Str_ErrorLoginFailTime"));		
				
				
			} else {
				dialogAlert(app, dataManager.getString("Str_ErrorLoginFail"), dataManager.getString("Str_ErrorLoginsRemainingCount")+" : "+ app.lookup("LoginFailInfo").getValue("RemindCount"));
			}			
		} else if (ResultCode == ERROR_LOGIN_FAIL_TIME) {
			dialogAlert(app, dataManager.getString("Str_ErrorLoginFail"), dataManager.getString("Str_ErrorLoginFailTime"));	
		} else {
			var msg = dataManager.getString(getErrorString(resultCode));
			
			if( msg == undefined || msg == ""){msg = dataManager.getString("Str_ErrorLoginFailed") }
			if( msg == undefined || msg == ""){msg = "등록되지 않은 사용자이거나 비밀번호가 일치하지 않습니다."}
			
			dialogAlert(app, dataManager.getString("Str_ErrorLoginFail"), msg);
			//dialogAlert(app, dataManager.getString("Str_ErrorLoginFail"), dataManager.getString("Str_ErrorLoginFailed"));			
		}
	
	}
	
}
// 서브미션에서 submit-success 이벤트 발생 시 호출. 
function onSms_loginSubmitSuccess(e){	
}

// 서브미션에서 submit-error 이벤트 발생 시 호출.
function onSms_loginSubmitError(/* cpr.events.CSubmissionEvent */ e){		
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR);			
}

// 서브미션에서 submit-timeout 이벤트 발생 시 호출.
function onSms_loginSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}


/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onLOGIN_ipbUserPWKeyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var lOGIN_ipbUserPW = e.control;
	if( e.keyCode == 13 ){ // 검색창에서 Enter 입력시..
 		onLOGIN_btnSignInClick();
 	}
}


exports.setOEMLcsInfo = function ( strData ){
	
	var loginInfo = app.lookup("dmLoginReq");
	loginInfo.setValue("userType",101);
	loginInfo.setValue("password",strData);
	app.lookup("sms_login").send();
}


