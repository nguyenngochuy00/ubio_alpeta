/************************************************
 * Main.js
 * Created at Aug 21, 2020 4:31:22 PM.
 *
 * @author EVN0025
 ************************************************/

var Auth = cpr.core.Module.require("lib/Auth");
/*
 * Triggered when init event is fired from Root Container.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(/* cpr.events.CEvent */ e) {
	Auth.isAuthenticated(app)
}






