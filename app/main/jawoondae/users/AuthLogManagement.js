/************************************************
 * AuthLogManagement.js
 * Created at 2018. 12. 26. 오후 6:01:05.
 *
 * @author wonki
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var pageRowCount = 20;
var comLib;

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	comLib = createComUtil(app);
	dataManager = getDataManager();
	var hostAppIns = app.getHostAppInstance();
	if (hostAppIns) {
		var initValue = app.getHost().initValue;
		var userID = initValue["ID"];
		var startAt = initValue["STARTAT"];
		var endAt = initValue["ENDAT"];
		var dtStart = app.lookup("ALMGR_dtStart");
		var dtEnd = app.lookup("ALMGR_dtEnd");
		dtEnd.value = endAt;
		dtStart.value = startAt;
		
		var udcAuthLogList = app.lookup("JAWLOG_udcAuthLogList");
		udcAuthLogList.setPaging(0, 1, 10, pageRowCount);
		
		sendAuthLogListRequest(userID);
	} else {
		// index 정보 없음 경고 표시
	}
	
	
}

function sendAuthLogListRequest(userID) {
	var udcAuthLogList = app.lookup("JAWLOG_udcAuthLogList");
	var curIndex = udcAuthLogList.getCurrentPageIndex();
	var offset = (curIndex - 1) * pageRowCount;
	
	var smsGetAuthLogList = app.lookup("sms_getAuthLogList");
	var dtStart = app.lookup("ALMGR_dtStart");
	var dtEnd = app.lookup("ALMGR_dtEnd");
	
	smsGetAuthLogList.setParameters("searchCategory", "user_id");
	smsGetAuthLogList.setParameters("searchKeyword", userID);
	
	smsGetAuthLogList.setParameters("startTime", dtStart.value);
	smsGetAuthLogList.setParameters("endTime", dtEnd.value);
	smsGetAuthLogList.setParameters("offset", offset);
	smsGetAuthLogList.setParameters("limit", pageRowCount);
	
	var dsAuthLogList = app.lookup("AuthLogList");
	dsAuthLogList.clear();
	
	smsGetAuthLogList.send();
	comLib.showLoadMask("", dataManager.getString("Str_ListLoading"), "");
}

function onALMGR_udcAuthLogListPagechange(/* cpr.events.CSelectionEvent */ e){
	sendAuthLogListRequest();	
}

function onALMGR_edtKeywordKeydown(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var aLMGR_edtKeyword = e.control;
	
	if(e.keyCode == 13) {
		sendAuthLogListRequest();		
	}
}

function onSms_getAuthLogListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dsAuthLogList = app.lookup("AuthLogList");
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
	
		var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
		if (viewPageCount > 10) {
			viewPageCount = 10;
		}
		var udcAuthLogList = app.lookup("JAWLOG_udcAuthLogList");
		udcAuthLogList.setAuthLogList(dsAuthLogList);	
		udcAuthLogList.setPaging(totalCount, pageRowCount, viewPageCount);
	
		app.lookup("ALMGR_grp").redraw();
	} else {
		dialogAlert(app, "Waning", "고정사용자 인증기록 리스트"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
	
}

function onSms_SubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_SubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
