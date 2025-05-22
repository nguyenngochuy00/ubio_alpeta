/************************************************
 * webNotice.js
 * Created at 2020. 1. 13. 오후 3:53:54.
 *
 * @author joymrk
 ************************************************/
var comLib;
var dateLib = cpr.core.Module.require("lib/DateLib");
var dataManager = cpr.core.Module.require("lib/DataManager");
var wnpp_version;



/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	wnpp_version = dataManager.getSystemVersion();
	sendWebNotice();
}

function sendWebNotice() {
	var reqData = app.lookup("sms_getWebNotice");
	reqData.send();
}

function onSms_getWebNoticeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		app.lookup("wnpp_opbMessage").redraw();
		app.lookup("wnpp_opbTitle").redraw();
	} else {
		//dialogAlert(app, "Waning", "공지사항 정보 가져오기 실패.");
		dialogAlert(app, "Waning", dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_getWebNoticeSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

function onSms_getWebNoticeSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onWnpp_btnCloseClick(/* cpr.events.CMouseEvent */ e){
	app.close();
}
