/************************************************
 * EventLogList.js
 * Created at Oct 13, 2020 2:38:22 PM.
 *
 * @author EVN0025
 ************************************************/

var config = getConfig();
var auth = cpr.core.Module.require("lib/Auth");
var utils = cpr.core.Module.require("lib/Utils");
var knownBottomReached = false;
var fetching = false;
var fetchCount = 0;
var hasNext = true;
var isAutimating = false;
var divideTime;

/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad( /* cpr.events.CEvent */ e) {
	fetchMore(0)
}

function fetchMore(offset) {
	if (!hasNext) {
		return;
	}
	/*미완성
	//@todo
	var now = moment("2020-08-12");
	var year = now.format("YYYY");
	var month = now.format("MM");
	fetching = true;
	
	var smsEventLog = app.lookup("smsEventLog");
	smsEventLog.setRequestActionUrl(config.apiHostResolution() + smsEventLog.action);
	smsEventLog.removeAllParameters();
	smsEventLog.addParameter("offset", offset);
	smsEventLog.addParameter("limit", 10);
	smsEventLog.addParameter("startTime", now.startOf("month").format("YYYY-MM-DD") + " 00:00:00");
	smsEventLog.addParameter("endTime", now.endOf("month").format("YYYY-MM-DD") + " 23:59:59");
	smsEventLog.addParameter("searchCategory", "all");
	smsEventLog.send()
	*/
	
	fetching = true;
	var now = moment();
	var year = now.format("YYYY");
	var month = now.format("MM");
	var smsAuthLogsList = app.lookup("smsEventLog");
	smsAuthLogsList.setRequestActionUrl(config.apiHostResolution() + smsAuthLogsList.action);
	smsAuthLogsList.removeAllParameters();
	smsAuthLogsList.addParameter("offset", offset);
	smsAuthLogsList.addParameter("limit", 10);
	smsAuthLogsList.addParameter("startTime", now.startOf("month").format("YYYY-MM-DD") + " 00:00:00");
	smsAuthLogsList.addParameter("endTime", now.endOf("month").format("YYYY-MM-DD") + " 23:59:59");
	smsAuthLogsList.send();
}

function renderRow() {
	app.lookup("EventLogList").forEachOfUnfilteredRows(function(row) {
		var index = app.lookup("eventLogsList").getChildren().indexOf(app.lookup("loader"));
		var eventTime = moment(row.getValue("EventTime"), "YYYY-MM-DD HH:mm:ss").format("YYYY.MM.DD");
		if (eventTime !== divideTime) {
			divideTime = eventTime;
			var timeRow = new udc.Log.LogTime();
			timeRow.setAppProperty("time", eventTime);
			app.lookup("eventLogsList").insertChild(index, timeRow, {
				height: "30px"
			});
			timeRow.style.animateFrom({
				"transform": "translateY(100%)",
				"opacity": "0"
			}, .5, cpr.animation.TimingFunction.EASE_IN_OUT_BACK);
		}
		
		var eventRow = new udc.Log.EventLogRow();
		eventRow.setAppProperties({
			eventTime: moment(row.getValue("EventTime"), "YYYY-MM-DD HH:mm:ss").format("YYYY.MM.DD HH:mm:ss"),
			terminalID: row.getValue("TerminalID"),
			terminalName: row.getValue("TerminalName"),
			content: row.getValue("Content"),
			category: utils.getEventLogCategory(row.getValue("Category")),
		});
		app.lookup("eventLogsList").insertChild(app.lookup("eventLogsList").getChildren().indexOf(app.lookup("loader")), eventRow, {
			height: "90px"
		});
		eventRow.style.animateFrom({
			"transform": "translateY(100%)",
			"opacity": "0"
		}, .5, cpr.animation.TimingFunction.EASE_IN_OUT_BACK);
	});
	fetching = false;
	fetchCount = fetchCount + app.lookup("EventLogList").getRowCount();
	if (fetchCount >= app.lookup("Total").getValue("Count")) {
		hasNext = false;
		app.lookup("loaderIcon").visible = false;
		app.lookup("loaderText").bind("value").toLanguage("Str_Common_No_More");
	}
}

/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsEventLogSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsEventLog = e.control;
	handleUnauthorize(app);
	renderRow();
}

/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsEventLogSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsEventLog = e.control;
	auth.logout(app);
}

/*
 * Triggered when rightBtnClick event is fired from User Defined Control.
 */
function onHeaderRightBtnClick( /* cpr.events.CUIEvent */ e) {
	/** 
	 * @type udc.Header
	 */
	var header = e.control;
	if (isAutimating) {
		e.preventDefault();
		return;
	}
	isAutimating = true;
	cpr.core.App.load("app/mobile/Admin/Logs/EventLogsListSearch", function(loadedApp) {
		loadedApp.createNewInstance().run(null, function(createdApp) {
			app.close();
			isAutimating = false;
		})
	});
}

/*
 * Triggered when scroll event is fired from Group.
 * 그룹 컨텐츠가 스크롤될 때 발생하는 이벤트.
 */
function onEventLogsListScroll( /* cpr.events.CUIEvent */ e) {
	/** 
	 * @type cpr.controls.Container
	 */
	var eventLogsList = e.control;
	var viewport = app.lookup("eventLogsList").getViewPortRect();
	var loader = app.lookup("loader");
	var bottomReached = viewport.intersects(loader.getOffsetRect());
	if (knownBottomReached != bottomReached && bottomReached) {
		if (fetchCount >= app.lookup("Total").getValue("Count")) {
			loader.style.animateAndReverse({
				"transform": "scale(1.3)",
				"color": "red"
			}, 0.2);
		} else {
			fetchMore(fetchCount);
		}
	}
	knownBottomReached = bottomReached;
}

/*
 * Triggered when init event is fired from Body.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit( /* cpr.events.CEvent */ e) {
	app.lookup("header").setAppProperties({
		pageName: cpr.I18N.INSTANCE.message("Str_Log_EventLog")
	});
}