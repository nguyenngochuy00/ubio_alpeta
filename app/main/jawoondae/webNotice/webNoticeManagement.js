/************************************************
 * WebNoticeManagement.js
 * Created at 2020. 1. 13. 오후 3:54:55.
 *
 * @author joymrk
 ************************************************/
var comLib;
var dateLib = cpr.core.Module.require("lib/DateLib");
var dataManager = cpr.core.Module.require("lib/DataManager");
var wnmmn_version;

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	wnmmn_version = dataManager.getSystemVersion();
	sendWebNotice();
}

function sendWebNotice() {
	var reqData = app.lookup("sms_getWebNotice");
	reqData.send();
}

function onSms_getWebNoticeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		app.lookup("WNMMN_ipbMessage").redraw();
		app.lookup("WNMMN_ipbTitle").redraw();
	} else {
		//dialogAlert(app, "Waning", "공지사항 정보 가져오기 실패.");
		dialogAlert(app, "Waning", dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_getWebNoticeSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

function onSms_getWebNoticeSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}



function onWNMMN_btnSaveClick(/* cpr.events.CMouseEvent */ e){
	var reqData = app.lookup("sms_postWebNotice");
	reqData.send();
}
function onSms_postWebNoticeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		dialogAlert(app, "Waning", "공지사항 정보 저장 성공.");
	} else {
		//dialogAlert(app, "Waning", "공지사항 정보 저장 실패.");
		dialogAlert(app, "Waning", dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_postWebNoticeSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_postWebNoticeSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}
function onWNMMN_btnDeleteClick(/* cpr.events.CMouseEvent */ e){
	var reqData = app.lookup("sms_deleteWebNotice");
	reqData.send();
}

function onSms_deleteWebNoticeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		dialogAlert(app, "Waning", "공지사항 정보 삭제 성공.");
		app.lookup("WebNoticeInfo").clear();
		app.lookup("WNMMN_ipbMessage").redraw();
		app.lookup("WNMMN_ipbTitle").redraw();
		
	} else {
		//dialogAlert(app, "Waning", "공지사항 정보 삭제 실패.");
		dialogAlert(app, "Waning", dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_deleteWebNoticeSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_deleteWebNoticeSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}
