/************************************************
 * visitorLogin.js
 * Created at 2019. 1. 30. 오전 11:00:43.
 *
 * @author fois
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
comLib = createComUtil(app);

function onBodyLoad( /* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	
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
	//oem_version 받아오기 위한 req
	app.lookup("sms_chkLogin").send();
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
}

function onNextStep(step, data) {
	var rect = app.getActualRect();
	if (step == 0) { // 방문 정보
		app.getRootAppInstance().openDialog("app/visit/visitApplicationStep1", {
			width: rect.width,
			height: rect.height
		}, function(dialog) {
			dialog.initValue = {
				"OEM": 0,
				"src": "visitor"
			};
			dialog.resizable = false;
			dialog.headerVisible = false;
			dialog.modal = true;
		}).then(function(returnValue) {
			if (returnValue.result == "success") {
				onNextStep(returnValue.step, returnValue);
			}
		});
	} else if (step == 1) { // 방문자 정보
		app.getRootAppInstance().openDialog("app/visit/visitApplicationStep2", {
			width: rect.width,
			height: rect.height
		}, function(dialog) {
			dialog.initValue = {
				"OEM": 0,
				"src": "visitor",
				"data": data
			};
			dialog.resizable = false;
			dialog.headerVisible = false;
			dialog.modal = true;
		}).then(function(returnValue) {
			if (returnValue.result == "success") {
				onNextStep(returnValue.step, returnValue);
			}
		});
	} else if (step == 2) { // 휴대품 정보
		app.getRootAppInstance().openDialog("app/visit/visitApplicationStep3", {
			width: rect.width,
			height: rect.height
		}, function(dialog) {
			dialog.initValue = {
				"OEM": 0,
				"src": "visitor",
				"data": data
			};
			dialog.resizable = false;
			dialog.headerVisible = false;
			dialog.modal = true;
		}).then(function(returnValue) {
			if (returnValue.result == "success") {
				onNextStep(returnValue.step, returnValue);
			}
		});
	} else if (step == 3) { // 완료
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_VisitApplicationCompleted"));
		//var sms_getVisitorLogin = app.lookup("sms_getVisitApplicationList") ;
		//sms_getVisitorLogin.send();
	}
}
// "방문신청" 버튼(VISITOR_btnVisitRequest)에서 click 이벤트 발생 시 호출. 
function onVISITOR_btnVisitRequestClick( /* cpr.events.CMouseEvent */ e) {
	//onNextStep(0);
	localStorage.setItem("oem", "0");
	localStorage.setItem("src", "visitor");
	
	//현대 엠시트
	var oem_version = dataManager.getOemVersion();
	if (oem_version == OEM_HYUNDAI_MSEAT) {
		var appld = "app/visit/visitApplicationPolicyHYUNDAIMSEAT";
		cpr.core.App.load(appld, function(newapp) {
			app.close();
			var instance = newapp.createNewInstance().run();
		});
		return;
	}
	
	cpr.core.App.load("app/visit/visitApplicationStep1", function(newapp) {
		app.close();
		var instance = newapp.createNewInstance().run();
	});
	
	/*
	cpr.core.App.load("app/visitor/visitApplication", function(newapp) {
		app.close();
		var instance = newapp.createNewInstance().run();			
		//instance.callAppMethod("setOEMVer", 3);
		instance.callAppMethod("setMode", 0);		
	});
	*/
}

// "신청조회" 버튼(VISITOR_btnVisitSearch)에서 click 이벤트 발생 시 호출.
function onVISITOR_btnVisitSearchClick( /* cpr.events.CMouseEvent */ e) {
	var sms_getVisitorLogin = app.lookup("sms_getVisitorLogin");
	var dmLoginInfo = app.lookup("ApplicationInfo");
	sms_getVisitorLogin.setParameters("FirstName", dmLoginInfo.getValue("FirstName"));
	sms_getVisitorLogin.setParameters("LastName", dmLoginInfo.getValue("LastName"));
	sms_getVisitorLogin.setParameters("Mobile", dmLoginInfo.getValue("Mobile"));
	sms_getVisitorLogin.setParameters("Password", dmLoginInfo.getValue("Password"));
	sms_getVisitorLogin.send();
}

// 방문객 로그인 완료
function onSms_getVisitorLoginSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		// 신청 결과가 없는 경우 알림 표시
		// 신청 결과 표시 후 메인 화면으로 이동	 
		var total = app.lookup("Total").getValue("Count");
		if (total > 0) {
			cpr.core.App.load("app/visitor/visitApplicationList", function(newapp) {
				var applicationInfo = app.lookup("ApplicationInfo").getDatas();
				var visitInfoList = app.lookup("VisitInfoList").getRowDataRanged();
				app.close();
				newapp.createNewInstance().run().callAppMethod("setVisitInfoList", applicationInfo, visitInfoList);
			});
		} else {
			dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_WarnVisitApplicationNotExist"));
		}
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 방문객 로그인 에러
function onSms_getVisitorLoginSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR)
}

// 방문객 로그인 타임아웃
function onSms_getVisitorLoginSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT)
}



/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_chkLoginSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_chkLogin = e.control;
	var SystemInfo = app.lookup("SystemInfo");
	var fullversion = SystemInfo.getValue("Version");
	var verArr = fullversion.split('.');
	dataManager.setOemVersion(verArr[3]);
}
