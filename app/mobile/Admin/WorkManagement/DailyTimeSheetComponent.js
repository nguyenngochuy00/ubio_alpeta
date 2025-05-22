/************************************************
 * DailyTimeSheetComponent.js
 * Created at Sep 16, 2020 9:22:01 AM.
 *
 * @author EVN0025
 ************************************************/

var config = getConfig();
var utils = cpr.core.Module.require("lib/Utils");
var Auth = cpr.core.Module.require("lib/Auth");
var maximumWorkingHours = 8;
var totalWorkHours = 0;
var now = moment();
var fetchCount = 0;
var knownBottomReached = false;
var fetching = false;
var hasNext = true;


function render() {
	app.lookup("currentDate").value = now.format("YYYY.MM.DD");
	app.lookup("maxWorkingHours").value = "08:00";
}

/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	app.lookup("accessHistoryApp").getEmbeddedAppInstance().getContainer().style.css({
		"min-height": "0px"
	})
	fetchMoreAuthLogs(0)
	fetchTnaWorkTime();
	render();
}

function fetchTnaWorkTime() {
	var UserID = app.getHostAppInstance().getAppProperty("UserID");
	var smsGetTnaPeriodWorkTime = app.lookup("smsGetTnaPeriodWorkTime");
	smsGetTnaPeriodWorkTime.removeAllParameters();
	smsGetTnaPeriodWorkTime.setRequestActionUrl(config.apiHostResolution() + smsGetTnaPeriodWorkTime.action);
	smsGetTnaPeriodWorkTime.addParameter("startDate", now.format("YYYY-MM-DD"));
	smsGetTnaPeriodWorkTime.addParameter("endDate", now.format("YYYY-MM-DD"));
	smsGetTnaPeriodWorkTime.addParameter("searchCategory", "id");
	smsGetTnaPeriodWorkTime.addParameter("searchKeyword", parseInt(UserID, 10));
	smsGetTnaPeriodWorkTime.addParameter("offset", 0);
	smsGetTnaPeriodWorkTime.addParameter("limit", 10);
	smsGetTnaPeriodWorkTime.send();
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetAuthLogsSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetAuthLogs = e.control;
	handleUnauthorize(app);
	if (app.lookup("Result").getValue("ResultCode") !== 0) {
		return;
	}
	fetching = false;
	fetchCount = fetchCount + app.lookup("AuthLogList").getRowCount();
	if (fetchCount >= app.lookup("Total").getValue("Count")) {
		hasNext = false;
		app.lookup("loaderIcon").visible = false;
		app.lookup("loaderText").bind("value").toLanguage("Str_Common_No_More");
	}
	app.lookup("accessHistoryApp").render(app.lookup("AuthLogList"));
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetTnaPeriodWorkTimeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTnaPeriodWorkTime = e.control;
	handleUnauthorize(app);
	if (app.lookup("Result").getValue("ResultCode") !== 0) {
		return;
	}
	///tna/periodWorkTime
	totalWorkHours = app.lookup("WorkTimeList").getValue(0, "TotalWorkTime");
	var overWorkTime = app.lookup("WorkTimeList").getValue(0, "OverWorkTime");
	var basicWorkTime = app.lookup("WorkTimeList").getValue(0, "BasicWorkTime");
	app.lookup("totalWorkHours").value = totalWorkHours || "00:00";
	app.lookup("workTimeChart").setAppProperties({
		overWorkTime: overWorkTime,
		basicWorkTime: basicWorkTime,
	});
	
	var overWorkTimeNumber = utils.convertTimeString(overWorkTime);
	var basicWorkTimeNumber = utils.convertTimeString(basicWorkTime)
	
	if (overWorkTimeNumber > 0) {
		app.lookup("workMntBtn").style.css({
			"background-image": "url('/theme/images/mobile/main_top_status_icon_overtime.png')"
		})
	} else {
		app.lookup("workMntBtn").style.css({
			"background-image": "url('/theme/images/mobile/main_top_status_icon_work.png')"
		})
	}
	
	if ((basicWorkTimeNumber + overWorkTimeNumber) > 12*60) {
		app.lookup("workMntBtn").style.css({
			"background-image": "url('/theme/images/mobile/main_top_status_icon_overtime.png')"
		})
	}
}


/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsGetAuthLogsSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetAuthLogs = e.control;
	Auth.logout(app);
}


function fetchMoreAuthLogs(offset) {
	if (!hasNext) {
		return;
	}
	fetching = true;
	var UserID = app.getHostAppInstance().getAppProperty("UserID");
	var smsGetAuthLogs = app.lookup("smsGetAuthLogs");	
	smsGetAuthLogs.removeAllParameters();
	smsGetAuthLogs.setRequestActionUrl(config.apiHostResolution() + smsGetAuthLogs.action);
	smsGetAuthLogs.addParameter("searchKeyword", parseInt(UserID, 10));
	smsGetAuthLogs.addParameter("searchCategory", "user_id");
	smsGetAuthLogs.addParameter("startTime", now.format("YYYY-MM-DD") + " 00:00:00");
	smsGetAuthLogs.addParameter("endTime", now.format("YYYY-MM-DD") + " 23:59:59");
	smsGetAuthLogs.addParameter("offset", offset);
	smsGetAuthLogs.addParameter("limit", 5);
	smsGetAuthLogs.send()
}

/*
 * Triggered when NextMonthClick event is fired from User Defined Control.
 */
function onWorkTimeChartNextMonthClick(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.WorkManagement.WorkTimeStatusInMonth
	 */
	var workTimeChart = e.control;
	var current = e.content.current;
	hasNext = true;
	now = current;
	app.lookup("accessHistoryApp").resetData();
	app.lookup("currentDate").value = now.format("YYYY.MM.DD");
	fetchMoreAuthLogs(0);
	fetchTnaWorkTime()
}


/*
 * Triggered when PreMonthClick event is fired from User Defined Control.
 */
function onWorkTimeChartPreMonthClick(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.WorkManagement.WorkTimeStatusInMonth
	 */
	var workTimeChart = e.control;
	var current = e.content.current;
	now = current;
	hasNext = true;
	app.lookup("accessHistoryApp").resetData();
	app.lookup("currentDate").value = now.format("YYYY.MM.DD");
	fetchMoreAuthLogs(0);
	fetchTnaWorkTime()
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsGetAuthLogsBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetAuthLogs = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsGetAuthLogsReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetAuthLogs = e.control;
	hideLoading();
}


/*
 * Triggered when scroll event is fired from Body.
 * 그룹 컨텐츠가 스크롤될 때 발생하는 이벤트.
 */
function onBodyScroll(/* cpr.events.CUIEvent */ e){
	var loader = app.lookup("loader");
	var viewport = app.getContainer().getViewPortRect();
	var bottomReached = viewport.intersects(loader.getOffsetRect());
	if (knownBottomReached != bottomReached && bottomReached) {
		if (fetchCount >= app.lookup("Total").getValue("Count")) {
			loader.style.animateAndReverse({
				"transform": "scale(1.3)",
				"color": "red"
			}, 0.2);
		} else {
			fetchMoreAuthLogs(fetchCount);
		}
	}
	knownBottomReached = bottomReached;
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsGetTnaPeriodWorkTimeBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTnaPeriodWorkTime = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsGetTnaPeriodWorkTimeReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTnaPeriodWorkTime = e.control;
	hideLoading();
}
