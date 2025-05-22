/************************************************
 * alert.js
 * Created at 2018. 10. 24. 오전 10:20:42.
 *
 * @author osm86
 ************************************************/
cpr.core.NotificationCenter.INSTANCE.subscribe("app-msg", this, function(msg) {
	var notifier = app.lookup("noti");
	if (msg.success == true) {
		notifier.success(msg.msg);
	} else if (msg.info == true) {
		notifier.info(msg.msg);
	} else if (msg.warning == true) {
		notifier.warning(msg.msg);
	} else if (msg.danger == true) {
		notifier.danger(msg.msg);
	} else {
		notifier.info(msg);
	}
});
/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};

