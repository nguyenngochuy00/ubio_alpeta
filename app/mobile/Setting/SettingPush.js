/************************************************
 * SettingPush.js
 * Created at Nov 14, 2020 11:21:44 AM.
 *
 * @author EVN0025
 ************************************************/



/*
 * Triggered when leftBtnClick event is fired from User Defined Control.
 */
function onHeaderLeftBtnClick(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.Header
	 */
	var header = e.control;
	app.close();
}


/*
 * Triggered when value-change event is fired from User Defined Control.
 */
function onToggleButtonValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type udc.Common.ToggleButton
	 */
	var toggleButton = e.control;
	// turn on
	
	if (e.newValue) {
		if (!app.lookup("warningToggle").value) {
			app.lookup("warningToggle").toggle()
		}
		
		if (!app.lookup("terminalToggle").value) {
			app.lookup("terminalToggle").toggle()
		}
		
		if (!app.lookup("tnaToggle").value) {
			app.lookup("tnaToggle").toggle()
		}
		
		if (!app.lookup("otherToggle").value) {
			app.lookup("otherToggle").toggle()
		}
		
		if (!app.lookup("visitorToggle").value) {
			app.lookup("visitorToggle").toggle()
		}
	}
	
	// turn off
	if (!e.newValue) {
		if (app.lookup("otherToggle").value) {
			app.lookup("otherToggle").toggle()
		}
		
		if (app.lookup("visitorToggle").value) {
			app.lookup("visitorToggle").toggle()
		}
		
		if (app.lookup("tnaToggle").value) {
			app.lookup("tnaToggle").toggle()
		}
		
		if (app.lookup("terminalToggle").value) {
			app.lookup("terminalToggle").toggle()
		}
		
		if (app.lookup("warningToggle").value) {
			app.lookup("warningToggle").toggle()
		}
	}
}


/*
 * Triggered when value-change event is fired from User Defined Control.
 */
function onVisitorToggleValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type udc.Common.ToggleButton
	 */
	var visitorToggle = e.control;
	if (e.newValue) {
		
	}
	
	if (!e.newValue) {
		if(app.lookup("allToggle").value) {
			app.lookup("allToggle").value = false;
		}
	}
}


/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	app.lookup("header").setAppProperties({
		pageName: cpr.I18N.INSTANCE.message("Str_Setting")
	});
}
