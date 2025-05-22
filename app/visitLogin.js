/************************************************
 * visitorLogin.js
 * Created at 2019. 1. 30. 오전 11:00:43.
 *
 * @author fois
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var messageLib = null;

/*
 1. sms_getInitOption : 초기 옵션 가져오기
 2. sms_getServerOption  : 서버 옵션 가져오기
 3. sms_chkLogin : 로그인 여부 체크
 */
function onBodyLoad( /* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	comLib = createComUtil(app);

	var language = localStorage.getItem("language");
	if (language) {
		dataManager.setLocale(language);
	} else {
		language = dataManager.initLanguage();
		localStorage.setItem("language", language);
	}
	//comLib.language(language);
	
	var sms_getLangList = app.lookup("sms_getLangList");
	sms_getLangList.action = "data/lang/lang_visit_" + language + ".json";
	sms_getLangList.send();
	
	document.title = "Visitor Management Service";
}

//
function onSms_getLangListSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("sms_getInitOption").send(); // 초기 옵션 가져오기	
}

// 
function onSms_getLangListSubmitSuccess( /* cpr.events.CSubmissionEvent */ e) {
	var multilang = cpr.I18N.INSTANCE;
	var locale = localStorage.getItem("language");
	
	var dsLanglist = app.lookup("LangList");
	var localeArr = [];
	var data = dsLanglist.getRowDataRanged();
	
	var localeData = {};
	data.forEach(function(each) {
		localeData[each.Key] = each.Value;
	});
	
	multilang.setLocaleData(locale, localeData);
	multilang.currentLanguage = locale;
	
	document.title = dataManager.getString("Str_VisitorManagementTitle");
}

// 초기 옵션 가져오기 완료
function onSms_getInitOptionSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var dmResult = app.lookup("Result");
	if (dmResult.getValue("ResultCode") == COMERROR_NONE) {
		var dmBrandType = app.lookup("brandType");
		var dmInitOption = app.lookup("initOption");
		var userIDLength = dmInitOption.getValue("userIDLength");
		
		var brandType = dmBrandType.getValue("Type");
		
		if (brandType == BRAND_NITGEN) {
			if (userIDLength < 4 || userIDLength > 19) {
				userIDLength = 19;
			}
		} else {
			if (userIDLength < 2 || userIDLength > 8) {
				userIDLength = 8;
			}
		}
		var systemInfo = app.lookup("SystemInfo");
		systemInfo.setValue("BrandType", brandType);
		dataManager.setSystemInfo(systemInfo);
		
		app.lookup("VMELI_ipbUserID").maxLength = userIDLength;
		dataManager.setUserIDLength(userIDLength);
		
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorOptionRequestFaied"));
	}
	
	//app.lookup("sms_getServerOption").send();
	app.lookup("sms_chkLogin").send();
}
// 초기 옵션 가져오기 에러
function onSms_getInitOptionSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR)
}

// 초기 옵션 가져오기 타임아웃
function onSms_getInitOptionSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT)
}

// 서버 옵션 가져오기 완료
function onSms_getServerOptionSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var dmResult = app.lookup("Result");
	if (dmResult.getValue("ResultCode") == COMERROR_NONE) {
		var dmServerOption = app.lookup("ServerOption");
		dataManager.setClientOption(dmServerOption);
	}
//	app.lookup("sms_chkLogin").send();
}

// 서버 옵션 실패
function onSms_getServerOptionSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR)
}

// 서버 옵션 가져오기 타임아웃
function onSms_getServerOptionSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT)
}

// 로그인 체크 완료
function onSms_chkLoginSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	
	var dmResult = app.lookup("Result");
	if (dmResult.getValue("ResultCode") == COMERROR_NONE) {
		
		var account = app.lookup("AccountInfo");
		var systeminfo = app.lookup("SystemInfo");
		var fullversion = systeminfo.getValue("Version");
		var verArr = fullversion.split('.');
		
		dataManager = getDataManager();
		dataManager.setAccountInfo(account);
		dataManager.setSystemInfo(systeminfo);
		dataManager.setOemVersion(verArr[3]);

		messageLib = createMessageDialogUtil(app);
		messageLib.usint_versionUpdate(fullversion);
		
		app.lookup("sms_getServerOption").send();		// 방문자 지문 등록 시 TemplateFormat 필요로 인해 추가 - zzik
		
		cpr.core.App.load("app/visit/visitApplicationManagement", function(newapp) {
			var applicationInfo = app.lookup("LoginInfo").getDatas();
			app.close();
			newapp.createNewInstance().run().callAppMethod("setVisitLoginInfo", applicationInfo);
		});
	}
}
// 로그인 체크 에러
function onSms_chkLoginSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR)
}
// 로그인 체크 타임아웃
function onSms_chkLoginSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT)
}

// 로그인 버튼 클릭
function onVMELI_btnLoginClick( /* cpr.events.CMouseEvent */ e) {
	var uerID = app.lookup("VMELI_ipbUserID").value;
	if (uerID.length < 1) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserIDInputAlert"));
		return
	}
	var password = app.lookup("VMELI_ipbUserPassword").value;
	if (password.length < 4) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_PasswordLengthError"));
		return
	}
	var sms_visitLogin = app.lookup("sms_visitLogin");
	sms_visitLogin.send();
	
	// 로그인 권한 확인 : 방문 승인, 방문자 관리(발급), 방문중/방문종료 처리, 본인조회(접견자)
	
}

// 로그인 요청 완료
function onSms_visitLoginSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode");
	if (resultCode == COMERROR_NONE || resultCode == ERROR_USER_LOGINPASSWORD_EXPIRATION) {
		var account = app.lookup("AccountInfo");
		var systeminfo = app.lookup("SystemInfo");
		var fullversion = systeminfo.getValue("Version");
		var verArr = fullversion.split('.');
		
		dataManager = getDataManager();
		dataManager.setAccountInfo(account);
		dataManager.setSystemInfo(systeminfo);
		dataManager.setOemVersion(verArr[3]);
		
		if (/*dataManager.getOemVersion() == OEM_HYUNDAI_MSEAT &&*/ resultCode == ERROR_USER_LOGINPASSWORD_EXPIRATION) {
			account.setValue("FirstLoginFlag", 1);
		} 
		
		/*else if (resultCode == ERROR_USER_LOGINPASSWORD_EXPIRATION) {
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorLoginFailed"));
			return
		}*/
		
		app.lookup("sms_getServerOption").send();	// 방문자 지문 등록 시 TemplateFormat 필요로 인해 추가 - zzik
		
		cpr.core.App.load("app/visit/visitApplicationManagement", function(newapp) {
			var applicationInfo = app.lookup("LoginInfo").getDatas();
			app.close();
			newapp.createNewInstance().run().callAppMethod("setVisitLoginInfo", applicationInfo);
		});
	} else {
		var msg = dataManager.getString(getErrorString(resultCode));
		if( msg == undefined || msg == ""){msg = dataManager.getString("Str_ErrorLoginFailed") }
		dialogAlert(app, dataManager.getString("Str_ErrorLoginFail"), msg);
//		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorLoginFailed"));
	}
}

// 로그인 요청 에러
function onSms_visitLoginSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR)
}

// 로그인 요청 타임아웃
function onSms_visitLoginSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT)
}

/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onVMELI_ipbUserPasswordKeyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var vMELI_ipbUserPassword = e.control;
	if( e.keyCode == 13 ){ // 검색창에서 Enter 입력시..
 		onVMELI_btnLoginClick();
 	}
}
