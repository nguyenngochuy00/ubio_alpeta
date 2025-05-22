/************************************************
 * WeeklyTimeSheetComponent.js
 * Created at Sep 15, 2020 4:56:04 PM.
 *
 * @author EVN0025
 ************************************************/

var current = moment();
var Auth = cpr.core.Module.require("lib/Auth");
var utils = cpr.core.Module.require("lib/Utils");
var config = getConfig();

function weekOfMonth (input) {
  var firstDayOfMonth = input.clone().startOf('month');
  var firstDayOfWeek = firstDayOfMonth.clone().startOf('isoWeek');

  var offset = firstDayOfMonth.diff(firstDayOfWeek, 'days');

  return Math.ceil((input.date() + offset) / 7);
}

function render() {
	app.lookup("workHistoryWeekly").removeAllChildren();
	var TNAResult = app.lookup("tnaResultList");
	TNAResult.forEachOfUnfilteredRows(function (row) {
		var historyRow = new udc.WorkManagement.WorkingHistoryWeeklyRow();
		var outTime = utils.convertTimeString(row.getValue("OutTime"));
		var inTime = utils.convertTimeString(row.getValue("InTime"));
		var workTime = 0;
		if (outTime && inTime) {
			workTime = utils.converTimeNumberToString(outTime - inTime, "hour").split(":")[0]
		}
		historyRow.setAppProperties({
			workDate: row.getValue("WorkDate"),
			outTime: row.getValue("OutTime"),
			inTime: row.getValue("InTime"),
			workTime: workTime
		});
		historyRow.style.animateFrom({	
			"transform": "translateY(100%)",
			"opacity": "0"
		}, .5, cpr.animation.TimingFunction.EASE_IN_OUT_BACK);
		app.lookup("workHistoryWeekly").addChild(historyRow, {
			height: "60px"
		});
	});
}


/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	app.lookup("workHistoryWeekly").style.css({
		"min-height": "145px"
	})
	renderTime()
	fetchTnaPeriodResult()
}

function fetchTnaPeriodResult() {
	var UserID = parseInt(app.getHostAppInstance().getAppProperty("UserID"), 10);
	app.lookup("tnaResultList").clear();
	var smsGetTNAResult = app.lookup("smsGetTnaPeriodResult");
	smsGetTNAResult.removeAllParameters();
	smsGetTNAResult.setRequestActionUrl(config.apiHostResolution() + smsGetTNAResult.action);
	smsGetTNAResult.addParameter("startTime", moment(current).startOf('isoWeek').format("YYYY-MM-DD"));
	smsGetTNAResult.addParameter("endTime",  moment(current).endOf('isoWeek').format("YYYY-MM-DD"));
	smsGetTNAResult.addParameter("searchCategory",  "id");
	smsGetTNAResult.addParameter("searchKeyword", parseInt(UserID, 10));
	smsGetTNAResult.send()
}

function fetchPeriodWorkTime() {
	var UserID = app.getHostAppInstance().getAppProperty("UserID");
	var smsGetTnaPeriodWorkTime = app.lookup("smsGetTnaPeriodWorkTime");
	smsGetTnaPeriodWorkTime.removeAllParameters();
	smsGetTnaPeriodWorkTime.setRequestActionUrl(config.apiHostResolution() + smsGetTnaPeriodWorkTime.action);
	smsGetTnaPeriodWorkTime.addParameter("startDate", moment(current).startOf('isoWeek').format("YYYY-MM-DD"));
	smsGetTnaPeriodWorkTime.addParameter("endDate", moment(current).endOf('isoWeek').format("YYYY-MM-DD"));
	smsGetTnaPeriodWorkTime.addParameter("searchCategory", "id");
	smsGetTnaPeriodWorkTime.addParameter("searchKeyword", parseInt(UserID, 10));
	smsGetTnaPeriodWorkTime.addParameter("offset", 0);
	smsGetTnaPeriodWorkTime.addParameter("limit", 10);
	smsGetTnaPeriodWorkTime.send();
}

function renderTime() {
	app.lookup("currentWeek").value = moment(current).format("YYYY.MM") + " " + weekOfMonth(current) + (cpr.I18N.INSTANCE.currentLanguage === "ko" ? "주 " : "");
}

/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetTNAResultSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTNAResult = e.control;
	handleUnauthorize(app);
	if (app.lookup("Result").getValue("ResultCode") !== 0) {
		return;
	}
	render();
}


/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsGetTNAResultSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTNAResult = e.control;
	Auth.logout(app);
}


/*
 * Triggered when NextMonthClick event is fired from User Defined Control.
 */
function onWorkTimeStatusInMonthNextMonthClick(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.WorkManagement.WorkTimeStatusInMonth
	 */
	var workTimeStatusInMonth = e.control;
	current = moment(current).add(1, "weeks");
	renderTime();
	fetchTnaPeriodResult();
	fetchPeriodWorkTime();
}


/*
 * Triggered when PreMonthClick event is fired from User Defined Control.
 */
function onWorkTimeStatusInMonthPreMonthClick(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.WorkManagement.WorkTimeStatusInMonth
	 */
	var workTimeStatusInMonth = e.control;
	current = moment(current).subtract(1, "weeks");
	renderTime();
	fetchTnaPeriodResult();
	fetchPeriodWorkTime();
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsGetTNAResultBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTNAResult = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsGetTNAResultReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTNAResult = e.control;
	hideLoading();
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


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetTnaPeriodWorkTimeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTnaPeriodWorkTime = e.control;
	var totalWorkHours = app.lookup("WorkTimeList").getValue(0, "TotalWorkTime");
	var overWorkTime = app.lookup("WorkTimeList").getValue(0, "OverWorkTime");
	var basicWorkTime = app.lookup("WorkTimeList").getValue(0, "BasicWorkTime");
	app.lookup("currentWorkTimeMonth").value = totalWorkHours || "00:00";
	app.lookup("workTimeChart").setAppProperties({
		overWorkTime: overWorkTime,
		basicWorkTime: basicWorkTime,
	});
	
	var overWorkTimeNumber = utils.convertTimeString(overWorkTime);
	var basicWorkTimeNumber = utils.convertTimeString(basicWorkTime);
	
	if (basicWorkTimeNumber + overWorkTimeNumber  === 40*60) {
		app.lookup("workMntBtn").style.css({
			"background-image": "url('/theme/images/mobile/main_top_status_icon_40hours.png')"
		})
	} else if (basicWorkTimeNumber + overWorkTimeNumber  < 40*60) {
		app.lookup("workMntBtn").style.css({
			"background-image": "url('/theme/images/mobile/main_top_status_icon_work.png')"
		})
	}
	
	else if (basicWorkTimeNumber + overWorkTimeNumber  > 40*60) {
		app.lookup("workMntBtn").style.css({
			"background-image": "url('/theme/images/mobile/main_top_status_icon_overtime.png')"
		})
	}
	
	if ((basicWorkTimeNumber + overWorkTimeNumber) > 52*60) {
		app.lookup("workMntBtn").style.css({
			"background-image": "url('/theme/images/mobile/main_top_status_icon_52hours.png')"
		})
	}
}
