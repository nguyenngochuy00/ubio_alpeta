/************************************************
 * Setting.js
 * Created at Nov 11, 2020 2:36:02 PM.
 *
 * @author EVN0025
 ************************************************/
/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	app.lookup("header").setAppProperty("pageName", cpr.I18N.INSTANCE.message("Str_Setting"));
	app.lookup("pushSetting").addEventListener("click", function() {
		var dialogProp = {
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				headerVisible : false,
			};
		app.openDialog("app/mobile/Setting/SettingPush", dialogProp, function(loadedApp) {
			loadedApp.style.animateFrom({	
				"transform": "translateX(100%)",
				"opacity": "0"
			}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
		});
	});
	app.lookup("manualSetting").addEventListener("click", function() {
		var dialogProp = {
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				headerVisible : false,
			};
		app.openDialog("app/mobile/Setting/SettingManual", dialogProp, function(loadedApp) {
			loadedApp.style.animateFrom({	
				"transform": "translateX(100%)",
				"opacity": "0"
			}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
		});
	});
	app.lookup("manualSetting").setAppProperty("leftText", cpr.I18N.INSTANCE.message("Str_Setting_UserManual"));
	app.lookup("termSetting").setAppProperty("leftText", cpr.I18N.INSTANCE.message("Str_Setting_Term"));
	app.lookup("termSetting").addEventListener("click", function() {
		var dialogProp = {
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				headerVisible : false,
			};
		app.openDialog("app/mobile/Setting/SettingTerm", dialogProp, function(loadedApp) {
			loadedApp.style.animateFrom({	
				"transform": "translateX(100%)",
				"opacity": "0"
			}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
		});
	});
	app.lookup("PrivacyPolicy").setAppProperty("leftText", cpr.I18N.INSTANCE.message("Str_Setting_PrivacyPolicy"));
	app.lookup("PrivacyPolicy").addEventListener("click", function() {
		var dialogProp = {
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				headerVisible : false,
			};
		app.openDialog("app/mobile/Setting/SettingPrivacyPolicy", dialogProp, function(loadedApp) {
			loadedApp.style.animateFrom({	
				"transform": "translateX(100%)",
				"opacity": "0"
			}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
		});
	});
	app.lookup("versionRow").setAppProperty("rightText", getAppVersion() || "V.0.0.0");
	app.lookup("versionRow").setAppProperty("leftText", cpr.I18N.INSTANCE.message("Str_Setting_Version"));
	app.lookup("storeVersion").value = cpr.I18N.INSTANCE.message("Str_Setting_Current_Version");
	app.lookup("appversionDetail").value = "1.0.1"; 
	app.lookup("appLink").value = cpr.I18N.INSTANCE.message("Str_Setting_Version_Notification");
	
}



/*
 * Triggered when click event is fired from Output "※ 신규버전이 있습니다. 업데이트하시겠습니까?
 * "(appLink).
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAppLinkClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var appLink = e.control;
	var dialogProp = {
		top: 200,
		headerVisible : false,
		width: 320, 
		modal: true,
		resizable: false
	};
		app.openDialog("app/mobile/Setting/LinkToAppStore", dialogProp, function(loadedApp) {
	});
}
