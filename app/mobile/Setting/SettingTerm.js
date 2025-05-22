/************************************************
 * SettingPush.js
 * Created at Nov 14, 2020 11:21:44 AM.
 *
 * @author EVN0025
 ************************************************/
/*
 * Triggered when leftBtnClick event is fired from User Defined Control.
 */
function onHeaderLeftBtnClick( /* cpr.events.CUIEvent */ e) {
	/** 
	 * @type udc.Header
	 */
	var header = e.control;
	app.close();
}

/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad( /* cpr.events.CEvent */ e) {
	app.lookup("header").setAppProperties({
		pageName: cpr.I18N.INSTANCE.message("Str_Setting_Term")
	});
	var html = app.lookup("HTML_Terms");
	html.style.css("max-height", "99%");
	
	var objTermsPage = app.lookup("HTML_Terms");
	var locale = cpr.I18N.INSTANCE.currentLanguage;
	//lang test
	//console.log("lang = " + locale);
	if (locale != 'ko' && locale != 'ja') {
		locale = 'en'
	}
	var pageSrc = "/data/mobile/mobile_alpeta_terms" + "_" + locale + ".htm";
	objTermsPage.data = pageSrc;
}