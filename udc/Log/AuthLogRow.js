/************************************************
 * AuthLogRow.js
 * Created at Oct 13, 2020 3:40:05 PM.
 *
 * @author EVN0025
 ************************************************/

var utils = cpr.core.Module.require("lib/Utils");

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};

function render() {
	if (app.getAppProperty("authResult") !== 0) {
		app.lookup("statusImage").src = "/theme/images/mobile/log_cardview_icon_fail@3x.png"
	}

	if (app.getAppProperty("authType")) {
		app.lookup("authType").value = utils.getAuthTypelistString(app.getAppProperty("authType"))
	}
}

/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	render();
}
