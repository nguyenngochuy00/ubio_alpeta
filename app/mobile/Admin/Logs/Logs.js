/************************************************
 * Logs.js
 * Created at Oct 13, 2020 2:16:17 PM.
 *
 * @author EVN0025
 ************************************************/

var isAutimating = false;

/*
 * Triggered when click event is fired from Group.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAuthLogClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var authLog = e.control;
	if (isAutimating) {
		e.preventDefault();
		return;
	}
	isAutimating = true;
	cpr.core.App.load("app/mobile/Admin/Logs/AuthLogList", function(loadedApp){
		app.close();
		loadedApp.createNewInstance().run(null, function() {
			isAutimating = false;
		})
	});
}


/*
 * Triggered when click event is fired from Group.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onEventLogClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var eventLog = e.control;
	if (isAutimating) {
		e.preventDefault();
		return;
	}
	isAutimating = true;
	cpr.core.App.load("app/mobile/Admin/Logs/EventLogList", function(loadedApp){
		app.close();
		loadedApp.createNewInstance().run(null, function() {
			isAutimating = false;
		})
	});
}


/*
 * Triggered when init event is fired from Body.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(/* cpr.events.CEvent */ e){
	app.lookup("header").setAppProperties({
		pageName: cpr.I18N.INSTANCE.message("Str_Log_Inquiry")
	});
}
