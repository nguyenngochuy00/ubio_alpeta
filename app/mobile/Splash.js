/************************************************
 * Landing.js
 * Created at Aug 12, 2020 9:42:30 AM.
 *
 * @author EVN0025
 ************************************************/

var auth = cpr.core.Module.require("lib/Auth");
var config = getConfig();
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib = createComUtil(app);

/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	window.addEventListener("BackBtnClicked", closeApp, true);
	if (window.webkit) {
		window.webkit.messageHandlers.appVersionMessageHandler.postMessage(JSON.stringify({
			event: "GET_APP_VERSION",
		}));
		
		console.log("GET_APP_VERSION sent");
	}
	
	if (window.appVersionMessageHandler) {
		window.appVersionMessageHandler.postMessage(JSON.stringify({
			event: "GET_APP_VERSION",
		}));
		
		console.log("GET_APP_VERSION sent");
	}
	
	dataManager = getDataManager();
	
	//console.log("@@Splash\n@@@@@cpr.I18N.INSTANCE.currentLanguage= " + cpr.I18N.INSTANCE.currentLanguage)
	var language = dataManager.initLanguage();
	//console.log("@@Splash\n@@@@@dataManager.initLanguage()= " + dataManager.initLanguage())
	//console.log("@@Splash\n@@@@@cpr.I18N.INSTANCE.currentLanguage= " + cpr.I18N.INSTANCE.currentLanguage)
	//console.log("@@Splash\n@@@@@language()= " + language)
	
	if (language) {
		dataManager.setLocale(language);
	} else {
		language = dataManager.initLanguage();
		localStorage.setItem("language", language);
	}
	//comLib.language(language);	
	var sms_getLangList = app.lookup("sms_getLangList");
	sms_getLangList.action = "data/lang/lang_mobile_" + language + ".json";
	sms_getLangList.send();
	
	var sms_chkLogin = app.lookup("sms_chkLogin");
	sms_chkLogin.setRequestActionUrl(config.apiHostResolution() + sms_chkLogin.action);
	sms_chkLogin.send()
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_chkLoginSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var sms_chkLogin = e.control;
	if (localStorage.getItem("FirstLoginFlag.tutorial") !== "1") {
		cpr.core.App.load("app/mobile/Tutorial", function(loadedApp){
			loadedApp.createNewInstance().run(null, function(createdApp) {
				createdApp.getContainer().style.animateFrom({	
					"transform": "translateX(100%)",
					"opacity": "0"
				}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
				app.close();
			})
		});
		return;
	}
	dataManager.dispose();
	if (app.lookup("Result").getValue("ResultCode") === 0) {
		var accountInfo = app.lookup("AccountInfo");
		dataManager.setAccountInfo(accountInfo.getDatas());
		dataManager.setSystemInfo(app.lookup("SystemInfo"));
		localStorage.setItem("accountInfo", JSON.stringify(app.lookup("AccountInfo").getDatas()));
		
		var submission = app.lookup("smsUserInfoReq");
		submission.setParameters("fingerprint", "false");
		submission.setParameters("face", "false");
		submission.setParameters("picture", "true");
		submission.action = "/users/" + accountInfo.getValue("UserID");
		submission.setRequestActionUrl(config.apiHostResolution() + submission.action);		
		submission.send();
		return;
	};
	cpr.core.App.load("app/mobile/Login", function(loadedApp){
		loadedApp.createNewInstance().run(null, function(createdApp) {
			createdApp.getContainer().style.animateFrom({	
				"transform": "translateX(100%)",
				"opacity": "0"
			}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
			app.close();
		})
	});
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsUserInfoReqBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUserInfoReq = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsUserInfoReqReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUserInfoReq = e.control;
	hideLoading();
}





/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsUserInfoReqSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUserInfoReq = e.control;
	var userInfo = app.lookup("UserInfo");
	if (app.lookup("Result").getValue("ResultCode") === 0) {
		cpr.core.App.load("app/mobile/MainPage", function(loadedApp){
			loadedApp.createNewInstance().run(null, function(createdApp) {
				createdApp.setAppProperties({
					userInfo: userInfo
				});
				createdApp.getContainer().style.animateFrom({	
					"transform": "translateX(100%)",
					"opacity": "0"
				}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
				app.close();
			})
		});
	}
}


/*
 * Triggered when before-unload event is fired from Body.
 * 앱이 언로드되기 전에 발생하는 이벤트 입니다. 취소할 수 있습니다.
 */
function onBodyBeforeUnload(/* cpr.events.CEvent */ e){
	window.removeEventListener("BackBtnClicked", closeApp, true);
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getLangListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getLangList = e.control;
	var multilang = cpr.I18N.INSTANCE;
	var locale = multilang.currentLanguage;
	
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
