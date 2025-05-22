/************************************************
 * TerminalLogsDetail.js
 * Created at Oct 14, 2020 2:30:37 PM.
 *
 * @author EVN0025
 ************************************************/

var auth = cpr.core.Module.require("lib/Auth");
var utils = cpr.core.Module.require("lib/Utils");
var config = getConfig();
var currentTab = "authLog";
var isAutimating = false;
var knownBottomReached = false;
var fetching = false;
var fetchCount = 0;
var hasNext = true;
var divideTime;
var renderedRow = 0;
var totalRow = [];


function handleBtnStyle(/* cpr.controls.Output */ btn) {
	btn.style.css({
		"background-color": "#FFFFFF",
		"color": ""
	});
	if (btn.id === "eventLogTab") {
		app.lookup("authLogTab").style.css({
			"background-color": "none",
			"color": "#FFFFFF"
		});
	}
	if (btn.id === "authLogTab") {
		app.lookup("eventLogTab").style.css({
			"background-color": "none",
			"color": "#FFFFFF"
		});
	}
}

function fetchMore(offset) {
	if (!hasNext) {
		return;
	}
	var now = moment();
	var year = now.format("YYYY");
	var month = now.format("MM");
	fetching = true;
	
	var now = moment();
	var year = now.format("YYYY");
	var month = now.format("MM");
	if (currentTab === "authLog") {
		var smsAuthLogsList = app.lookup("smsAuthLogsList");
		smsAuthLogsList.setRequestActionUrl(config.apiHostResolution() + smsAuthLogsList.action);
		smsAuthLogsList.removeAllParameters();
		if (app.getAppProperty("ID")) {
			smsAuthLogsList.addParameter("searchCategory", "terminal_id");
			smsAuthLogsList.addParameter("searchKeyword", app.getAppProperty("ID"));
		}
		smsAuthLogsList.addParameter("offset", offset);
		smsAuthLogsList.addParameter("limit", 10);
		smsAuthLogsList.addParameter("startTime", now.startOf("month").format("YYYY-MM-DD") + " 00:00:00");
		smsAuthLogsList.addParameter("endTime", now.endOf("month").format("YYYY-MM-DD") + " 23:59:59");
		smsAuthLogsList.send();
	} else {
		var now = moment();
		var year = now.format("YYYY");
		var month = now.format("MM");
		var smsEventLog = app.lookup("smsEventLog");
		smsEventLog.setRequestActionUrl(config.apiHostResolution() + smsEventLog.action);
		smsEventLog.removeAllParameters();
		if (app.getAppProperty("ID")) {
			smsEventLog.addParameter("searchCategory", "terminal_id");
			smsEventLog.addParameter("searchKeyword", app.getAppProperty("ID"));
		}
		smsEventLog.addParameter("offset", offset);
		smsEventLog.addParameter("limit", 10);
		smsEventLog.addParameter("startTime", now.startOf("month").format("YYYY-MM-DD") + " 00:00:00");
		smsEventLog.addParameter("endTime", now.endOf("month").format("YYYY-MM-DD") + " 23:59:59");
		smsEventLog.send();
	}
};

/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	app.lookup("header").setAppProperty("pageName", app.getAppProperty("Name"));
	app.lookup("logsResult").addChild(new udc.Common.Loader("loader"), {
		height: "52px"
	});
	fetchMore(0);
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsAuthLogsListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsAuthLogsList = e.control;
	handleUnauthorize(app);
	if (app.lookup("Result").getValue("ResultCode") === 0) {
		app.lookup("AuthLogList").forEachOfUnfilteredRows(function (row) {
			totalRow.push(row.getRowData())
		});
		drawAuthLogs();
	}
}


/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsAuthLogsListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsAuthLogsList = e.control;
	auth.logout(app);
}


/*
 * Triggered when click event is fired from Output "일간"(authLogTab).
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAuthLogTabClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var authLogTab = e.control;
	if (currentTab === "authLog") {
		return;
	}
	currentTab = "authLog";
	knownBottomReached = false;
	fetching = false;
	fetchCount = 0;
	hasNext = true;
	divideTime = 0;
	handleBtnStyle(authLogTab);
	app.lookup("logsResult").removeAllChildren();	
	app.lookup("logsResult").addChild(new udc.Common.Loader("loader"), {
		height: "52px"
	});
	fetchMore(0);
}

function drawAuthLogs() {
	app.lookup("AuthLogList").forEachOfUnfilteredRows(function(row) {
		var index = app.lookup("logsResult").getChildren().indexOf(app.lookup("loader"));
			var eventTime = moment(row.getValue("EventTime"), "YYYY-MM-DD HH:mm:ss").format("YYYY.MM.DD");
			if (eventTime !== divideTime) {
				divideTime = eventTime;
				var timeRow = new udc.Log.LogTime();
				timeRow.setAppProperty("time", eventTime);
				app.lookup("logsResult").insertChild(index, timeRow, {
					height: "30px"
				});
				timeRow.style.animateFrom({	
					"transform": "translateY(100%)",
					"opacity": "0"
				}, .5, cpr.animation.TimingFunction.EASE_IN_OUT_BACK);
			}
		
		var authRow = new udc.Log.AuthLogRow();
		authRow.setAppProperties({
			eventTime: moment(row.getValue("EventTime"), "YYYY-MM-DD HH:mm:ss").format("YYYY.MM.DD HH.mm.ss"),
			terminalID: row.getValue("TerminalID"),
			terminalName: row.getValue("TerminalName"),
			userID: row.getValue("UserID"),
			userName: row.getValue("UserName"),
			groupCode: row.getValue("GroupCode"),
			authType: row.getValue("AuthType"),
			authResult: row.getValue("AuthResult")
		});
		authRow.addEventListener("click", function(e){
			isAutimating = true;
			app.openDialog("app/mobile/Admin/Logs/AuthLogDetail", {
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				headerVisible : false,
			}, function(loadedApp) {
				loadedApp.addEventListenerOnce("init", function () {
					loadedApp.setAppProperties({
						authLogIndex: row.getValue("IndexKey"),
						index: totalRow.findIndex(function (e) {
							return e.IndexKey === row.getValue("IndexKey")
						}),
						total: app.lookup("Total").getValue("Count"),
						terminalID: app.getAppProperty("ID")
					});
				})
				loadedApp.addEventListenerOnce("close", function () {
					isAutimating = false;
				})
			});	
		});
		renderedRow = renderedRow + 1
		app.lookup("logsResult").insertChild(app.lookup("logsResult").getChildren().indexOf(app.lookup("loader")), authRow, {
			height: "90px"
		});
		authRow.style.animateFrom({	
			"transform": "translateY(100%)",
			"opacity": "0"
		}, .5, cpr.animation.TimingFunction.EASE_IN_OUT_BACK);	
	});
	
	fetching = false;
	fetchCount = fetchCount + app.lookup("AuthLogList").getRowCount();
	if (fetchCount >= app.lookup("Total").getValue("Count")) {
		app.lookup("loader").setAppProperties({
			loaderImageVisible: false,
			loaderTextValue: cpr.I18N.INSTANCE.message("Str_Common_No_More")
		})
		hasNext = false;
	} 
}

function drawEventLogs() {
	
	app.lookup("EventLogList").forEachOfUnfilteredRows(function(row) {
		var index = app.lookup("logsResult").getChildren().indexOf(app.lookup("loader"));
			var eventTime = moment(row.getValue("EventTime"), "YYYY-MM-DD HH:mm:ss").format("YYYY.MM.DD");
			if (eventTime !== divideTime) {
				divideTime = eventTime;
				var timeRow = new udc.Log.LogTime();
				timeRow.setAppProperty("time", eventTime);
				app.lookup("logsResult").insertChild(index, timeRow, {
				height: "30px"
			});
			timeRow.style.animateFrom({	
				"transform": "translateY(100%)",
				"opacity": "0"
				}, .5, cpr.animation.TimingFunction.EASE_IN_OUT_BACK);
			}
		
		var eventRow = new udc.Log.EventLogRow();
		eventRow.setAppProperties({
			eventTime: moment(row.getValue("EventTime"), "YYYY-MM-DD HH:mm:ss").format("YYYY.MM.DD HH.mm.ss"),
			terminalID: row.getValue("TerminalID"),
			terminalName: row.getValue("TerminalName"),
			content: row.getValue("Content"),
			category: utils.getEventLogCategory(row.getValue("Category")),
		});
		app.lookup("logsResult").insertChild(app.lookup("logsResult").getChildren().indexOf(app.lookup("loader")), eventRow, {
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
		app.lookup("loader").setAppProperties({
			loaderImageVisible: false,
			loaderTextValue: cpr.I18N.INSTANCE.message("Str_Common_No_More")
		})
	} 
}


/*
 * Triggered when click event is fired from Output "주간"(eventLogTab).
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onEventLogTabClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var eventLogTab = e.control;
	if (currentTab === "eventLog") {
		return;
	}
	currentTab = "eventLog";
	knownBottomReached = false;
	fetching = false;
	fetchCount = 0;
	hasNext = true;
	divideTime = 0;
	handleBtnStyle(eventLogTab);
	app.lookup("logsResult").removeAllChildren();	
	app.lookup("logsResult").addChild(new udc.Common.Loader("loader"), {
		height: "52px"
	});
	fetchMore(0);
}


/*
 * Triggered when scroll event is fired from Group.
 * 그룹 컨텐츠가 스크롤될 때 발생하는 이벤트.
 */
function onLogsResultScroll(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var logsResult = e.control;
	var viewport = app.lookup("logsResult").getViewPortRect();
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
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsEventLogSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsEventLog = e.control;
	
	handleUnauthorize(app);
	if (app.lookup("Result").getValue("ResultCode") === 0) {
		drawEventLogs();
	}
}


/*
 * Triggered when leftBtnClick event is fired from User Defined Control.
 */
function onHeaderLeftBtnClick(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.Header
	 */
	var header = e.control;
	app.close();
}
