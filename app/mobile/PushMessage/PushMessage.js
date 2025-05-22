/************************************************
 * UserListByGroupSearch.js
 * Created at Sep 22, 2020 3:06:57 PM.
 *
 * @author EVN0025
 ************************************************/

var config = getConfig();
var auth = cpr.core.Module.require("lib/Auth");

/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */



/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	app.lookup("messageList").getChildren().forEach(function(each){
		each.setAppProperty("messageContent", cpr.I18N.INSTANCE.message("Str_NoticeDetail1"));
	});
}
