/************************************************
 * AuthLogList.js
 * Created at Oct 13, 2020 2:14:10 PM.
 *
 * @author EVN0025
 ************************************************/

var auth = cpr.core.Module.require("lib/Auth");
var config = getConfig();
var isAutimating = false;
var knownBottomReached = false;
var fetching = false;
var fetchCount = 0;
var hasNext = true;
var divideTime;
var totalRow = [];

/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad( /* cpr.events.CEvent */ e) {
	app.lookup("header").leftBtnPath = app.getAppProperty("prePage")
	fetchMore(0)
}

function fetchMore(offset) {
	if (!hasNext) {
		return;
	}
	/*
	//@todo
	//미완성 되어있음
	var now = moment("2020-08-11");
	var year = now.format("YYYY");
	var month = now.format("MM");
	fetching = true;
	
	var smsAuthLogsList = app.lookup("smsAuthLogsList");
	smsAuthLogsList.removeAllParameters();
	
	smsAuthLogsList.setRequestActionUrl(config.apiHostResolution() + smsAuthLogsList.action);
	smsAuthLogsList.addParameter("offset", offset);
	smsAuthLogsList.addParameter("limit", 10);
	smsAuthLogsList.addParameter("startTime", now.startOf("month").format("YYYY-MM-DD") + " 00:00:00");
	smsAuthLogsList.addParameter("endTime", now.endOf("month").format("YYYY-MM-DD") + " 23:59:59");
	smsAuthLogsList.addParameter("searchCategory", "all");
	smsAuthLogsList.send()
	*/

	fetching = true;	
	var now = moment();
	var year = now.format("YYYY");
	var month = now.format("MM");
	var smsAuthLogsList = app.lookup("smsAuthLogsList");
	smsAuthLogsList.setRequestActionUrl(config.apiHostResolution() + smsAuthLogsList.action);
	smsAuthLogsList.removeAllParameters();
	smsAuthLogsList.addParameter("offset", offset);
	smsAuthLogsList.addParameter("limit", 10);
	smsAuthLogsList.addParameter("startTime", now.startOf("month").format("YYYY-MM-DD") + " 00:00:00");
	smsAuthLogsList.addParameter("endTime", now.endOf("month").format("YYYY-MM-DD") + " 23:59:59");
	smsAuthLogsList.send();
}

function renderRow() {
	app.lookup("AuthLogList").forEachOfUnfilteredRows(function(row) {
		var index = app.lookup("authList").getChildren().indexOf(app.lookup("loader"));
		var eventTime = moment(row.getValue("EventTime"), "YYYY-MM-DD HH:mm:ss").format("YYYY.MM.DD");
		if (eventTime !== divideTime) {
			divideTime = eventTime;
			var timeRow = new udc.Log.LogTime();
			timeRow.setAppProperty("time", eventTime);
			app.lookup("authList").insertChild(index, timeRow, {
				height: "30px"
			});
			timeRow.style.animateFrom({
				"transform": "translateY(100%)",
				"opacity": "0"
			}, .5, cpr.animation.TimingFunction.EASE_IN_OUT_BACK);
		}
		
		var eventRow = new udc.Log.AuthLogRow();
		eventRow.setAppProperties({
			eventTime: moment(row.getValue("EventTime"), "YYYY-MM-DD HH:mm:ss").format("YYYY.MM.DD HH:mm:ss"),
			terminalID: row.getValue("TerminalID"),
			terminalName: row.getValue("TerminalName"),
			userID: row.getValue("UserID"),
			userName: row.getValue("UserName"),
			groupCode:"그룹 코드 : " + row.getValue("GroupCode"),
			authType: row.getValue("AuthType"),
			authResult: row.getValue("AuthResult")
		});
		
		eventRow.addEventListener("click", function(e) {
			isAutimating = true;
			app.openDialog("app/mobile/Admin/Logs/AuthLogDetail", {
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				headerVisible: false,
			}, function(loadedApp) {
				loadedApp.addEventListenerOnce("init", function() {
					loadedApp.setAppProperties({
						authLogIndex: row.getValue("IndexKey"),
						index: totalRow.findIndex(function(e) {
							return e.IndexKey === row.getValue("IndexKey")
						}),
						total: app.lookup("Total").getValue("Count")
					});
				})
				loadedApp.style.animateFrom({
					"transform": "translateX(100%)",
					"opacity": "0"
				}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
				loadedApp.addEventListenerOnce("close", function() {
					isAutimating = false;
				})
			});
		});
		app.lookup("authList").insertChild(app.lookup("authList").getChildren().indexOf(app.lookup("loader")), eventRow, {
			height: "90px"
		});
		eventRow.style.animateFrom({
			"transform": "translateY(100%)",
			"opacity": "0"
		}, .5, cpr.animation.TimingFunction.EASE_IN_OUT_BACK);
	});
	fetching = false;
	fetchCount = fetchCount + app.lookup("AuthLogList").getRowCount();
	if (fetchCount >= app.lookup("Total").getValue("Count")) {
		hasNext = false;
		app.lookup("loaderIcon").visible = false;
		app.lookup("loaderText").value = cpr.I18N.INSTANCE.message("Str_Common_No_More");
	}
}

/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsAuthLogsListSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsAuthLogsList = e.control;
	auth.logout(app);
}

/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsAuthLogsListSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsAuthLogsList = e.control;
	handleUnauthorize(app);
	if (app.lookup("Result").getValue("ResultCode") !== 0) {
		return;
	}
	app.lookup("AuthLogList").forEachOfUnfilteredRows(function(row) {
		totalRow.push(row.getRowData())
	});
	renderRow();
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
	cpr.core.App.load("app/mobile/Admin/Logs/AuthLogListSearch", function(loadedApp) {
		loadedApp.createNewInstance().run(null, function(createdApp) {
			createdApp.setAppProperties({
				prePage: app.getAppProperty("prePage"),
			});
			createdApp.getContainer().style.animateFrom({
				"transform": "translateX(100%)",
				"opacity": "0"
			}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
			app.close();
			isAutimating = false;
		})
	});
}

/*
 * Triggered when scroll event is fired from Group.
 * 그룹 컨텐츠가 스크롤될 때 발생하는 이벤트.
 */
function onAuthListScroll( /* cpr.events.CUIEvent */ e) {
	/** 
	 * @type cpr.controls.Container
	 */
	var authList = e.control;
	var viewport = app.lookup("authList").getViewPortRect();
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
		pageName: cpr.I18N.INSTANCE.message("Str_Log_AuthLog")
	});
}