/************************************************
 * Monthly.js
 * Created at Sep 15, 2020 9:31:54 PM.
 *
 * @author Sam
 ************************************************/

var now = moment();
var config = getConfig();
var utils = cpr.core.Module.require("lib/Utils");
var fetchCount = 0;
var hasNext = true;
var knownBottomReached = false;

/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	app.lookup("accessHistoryApp").getEmbeddedAppInstance().getContainer().style.css({
		"min-height": "0px"
	})
	renderTime()
	fetchTnaPeriodWorkTime()
	fetchAuthLogs(0);
}

function renderTime() {
	app.lookup("currentMonth").value = moment(now).format("YYYY.MM");
}

function fetchTnaPeriodWorkTime() {
	var smsGetTNAResult = app.lookup("smsGetTnaPeriodResult");
	smsGetTNAResult.removeAllParameters();
	smsGetTNAResult.setRequestActionUrl(config.apiHostResolution() + smsGetTNAResult.action);
	smsGetTNAResult.addParameter("startTime", now.startOf("month").format("YYYY-MM-DD"));
	smsGetTNAResult.addParameter("endTime", now.endOf("month").format("YYYY-MM-DD"));
	smsGetTNAResult.send()
}

function fetchAuthLogs(offset, selectedDate) {
	var date = selectedDate || moment(now);
	var smsGetAuthLogs = app.lookup("smsGetAuthLogs");	
	smsGetAuthLogs.removeAllParameters();
	smsGetAuthLogs.setRequestActionUrl(config.apiHostResolution() + smsGetAuthLogs.action);
	smsGetAuthLogs.addParameter("searchKeyword", "5");
	smsGetAuthLogs.addParameter("searchCategory", "user_id");
	smsGetAuthLogs.addParameter("startTime", date.format("YYYY-MM-DD") + " 00:00:00");
	smsGetAuthLogs.addParameter("endTime", date.format("YYYY-MM-DD") + " 23:59:59");
	smsGetAuthLogs.addParameter("offset", offset);
	smsGetAuthLogs.addParameter("limit", 5);
	smsGetAuthLogs.send()
}


/*
 * Triggered when onNextBtnClicked event is fired from User Defined Control.
 */
function onWorkCalendarOnNextBtnClicked(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.WorkCalendar
	 */
	var workCalendar = e.control;
	now = now.add(1, "months")
	fetchTnaPeriodWorkTime();
	renderTime()
}


/*
 * Triggered when onPreBtnClicked event is fired from User Defined Control.
 */
function onWorkCalendarOnPreBtnClicked(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.WorkCalendar
	 */
	var workCalendar = e.control;
	now = now.subtract(1, "months");
	fetchTnaPeriodWorkTime();
	renderTime()
	
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsGetTnaPeriodResultBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTnaPeriodResult = e.control;
	app.lookup("tnaResultList").clear();
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsGetTnaPeriodResultReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTnaPeriodResult = e.control;
	hideLoading();
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetTnaPeriodResultSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTnaPeriodResult = e.control;
	var mappedData = [];
	var totalWorkTime = 0;
	app.lookup("tnaResultList").forEachOfUnfilteredRows(function(row) {
		var type = "workingDay";
		var workTime = 0;
		var outTime = utils.convertTimeString(row.getValue("OutTime"));
		var inTime = utils.convertTimeString(row.getValue("InTime"));
	
		if (outTime && inTime) {
			workTime = utils.converTimeNumberToString(outTime - inTime, "hour").split(":")[0];
			workTime = parseInt(workTime, 10)
		}
		
		if (workTime === 0) {
			type = "closed"
		}
		
		if (workTime > 8) {
			type = "overTime"
		}
		mappedData.push({
			date: row.getValue("WorkDate"),
			type: type
		});
		totalWorkTime = parseInt(totalWorkTime, 10) + workTime;
	});
	app.lookup("totalWorkTime").value = totalWorkTime;
	app.lookup("workCalendar").render(mappedData, moment(now));
	
}


/*
 * Triggered when onThisMonthBtnClicked event is fired from User Defined Control.
 */
function onWorkCalendarOnThisMonthBtnClicked(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.WorkCalendar
	 */
	var workCalendar = e.control;
	now = moment();
	fetchTnaPeriodWorkTime();
	renderTime()
}


/*
 * Triggered when onDateSelected event is fired from User Defined Control.
 */
function onWorkCalendarOnDateSelected(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.WorkCalendar
	 */
	var workCalendar = e.control;
	var selectedDate = e.content.date;
	hasNext = true;
	fetchCount = 0;
	app.lookup("accessHistoryApp").resetData();
	var tnaList = [];
	app.lookup("tnaResultList").forEachOfUnfilteredRows(function(row) {
		tnaList.push(row.getRowData());
	});
	
	var tnaResultList = tnaList.find(function(row) {
		return row.WorkDate === selectedDate;
	})
	if (tnaResultList ) {
		app.lookup("inTime").value = cpr.I18N.INSTANCE.message("Str_FKeyAttend") + tnaResultList.InTime + "(" + tnaResultList.Wt1In + ")";
		
		app.lookup("outTime").value = cpr.I18N.INSTANCE.message("Str_FKeyLeave") + tnaResultList.OutTime + "(" + tnaResultList.Wt1Out + ")";
	} else {
		app.lookup("inTime").value = cpr.I18N.INSTANCE.message("Str_FKeyAttend") + "--:-- (--:--)";
		app.lookup("outTime").value = cpr.I18N.INSTANCE.message("Str_FKeyLeave") + "--:-- (--:--)";
	}	
		
	app.lookup("AuthLogList").clear();	
	fetchAuthLogs(0, moment(selectedDate, "YYYY-MM-DD"));
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
	
	fetchCount = fetchCount + app.lookup("AuthLogList").getRowCount();
	if (fetchCount >= app.lookup("AuthLogTotal").getValue("Count")) {
		hasNext = false;
		app.lookup("loaderIcon").visible = false;
		app.lookup("loaderText").bind("value").toLanguage("Str_Common_No_More");
	}
	
	app.lookup("accessHistoryApp").render(app.lookup("AuthLogList"));
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
		if (fetchCount >= app.lookup("AuthLogTotal").getValue("Count")) {
			loader.style.animateAndReverse({
				"transform": "scale(1.3)",
				"color": "red"
			}, 0.2);
		} else {
			fetchAuthLogs(fetchCount);
		}
	}
	knownBottomReached = bottomReached;
}
