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
	if (app.getAppProperty("authType")) {
		app.lookup("authType").value = utils.getAuthTypeString(app.getAppProperty("authType"))
	}
	
	// pending
	if (app.getAppProperty("status") === 1) {
		app.lookup("statusImage").src = "/theme/images/mobile/visit_cardview_icon_wait.png";
		app.lookup("statusText").value = cpr.I18N.INSTANCE.message("Str_VisitRequestWaiting");
		app.lookup("statusText").style.css({
			color: "#008FCE"
		})	
	}
	
	// approval
	if (app.getAppProperty("status") === 2) {
		app.lookup("statusImage").src = "/theme/images/mobile/visit_cardview_icon_agree.png";
		app.lookup("statusText").value = cpr.I18N.INSTANCE.message("Str_VisitRequestApproval");
		app.lookup("statusText").style.css({
			color: "##006B38"
		})	
	}
	
	// denial
	if (app.getAppProperty("status") === 3) {
		app.lookup("statusImage").src = "/theme/images/mobile/visit_cardview_icon_hold.png"
		app.lookup("statusText").value = cpr.I18N.INSTANCE.message("Str_Visit_Reject");
		app.lookup("statusText").style.css({
			color: "#FF8D80"
		})
	}
	
	// expired
	if (app.getAppProperty("status") === 4) {
		app.lookup("statusImage").src = "/theme/images/mobile/visit_cardview_icon_expired.png"
		app.lookup("statusText").value = cpr.I18N.INSTANCE.message("Str_VisitRequestExpired");
		app.lookup("statusText").style.css({
			color: "#FF8D80"
		})
	}
	
	var startTime = moment(app.getAppProperty("startAt"), "YYYY-MM-DD hh:mm:ss").format("YYYY.MM.DD");
	app.lookup("periodTime").value = startTime + " ~ " + moment(app.getAppProperty("endAt"), "YYYY-MM-DD hh:mm:ss").format("YYYY.MM.DD")
	app.lookup("startTime").value = startTime;
}

/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	render();
}
