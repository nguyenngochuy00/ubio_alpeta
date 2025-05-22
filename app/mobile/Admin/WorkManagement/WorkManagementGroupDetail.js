/************************************************
 * Group.js
 * Created at Sep 22, 2020 9:43:40 AM.
 *
 * @author EVN0025
 ************************************************/

var config = getConfig();
var utils = cpr.core.Module.require("lib/Utils");
var auth = cpr.core.Module.require("lib/Auth");
var dataManager = getDataManager();
var isAnimating = false;
var knownBottomReached = false;
var fetching = false;
var fetchCount = 0;
var hasNext = true;
var current = moment();
/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad( /* cpr.events.CEvent */ e) {
	app.lookup("userList").removeAllChildren();
	app.lookup("userList").addChild(new udc.Common.Loader("loader"), {
		height: "52px"
	});
	app.lookup("header").pageName = app.getAppProperty("GroupName");
	app.lookup("totalUser").value = app.getAppProperty("TotalUsers");
	renderTime();
	fetchMore(0);
}
function renderTime() {
	if (app.getAppProperty("periodTime") === "Week") {
		app.lookup("currentTime").value = moment(current).format("MM.DD");
	}
	
	if (app.getAppProperty("periodTime") === "Day") {
		app.lookup("currentTime").value = moment(current).format("MM.DD");
	}
	
	if (app.getAppProperty("periodTime") === "Month") {
		app.lookup("currentTime").value = moment(current).format("YYYY.MM");
	}
}

/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetUsersInGroupSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetUsersInGroup = e.control;
	handleUnauthorize(app);
	if (app.lookup("Result").getValue("ResultCode") !== 0) {
		return;
	}
	renderRow()
	return;
}

function renderRow() {
	var userListDataSet = app.lookup("UserList");
	userListDataSet.forEachOfUnfilteredRows(function(row) {
		var workRow = new udc.WorkManagement.WorkingRowInGroup();
		var position = "";
		if (row.getValue("PositionCode") && row.getValue("PositionCode") !== 0) {
			var positionFounded = dataManager.getPositionList().findAllRow("PositionID===" + row.getValue("PositionCode"));
			if (positionFounded && positionFounded[0]) {
				position = positionFounded[0].getValue("Name");
			}
		}
		workRow.setAppProperties({
			UserName: row.getValue("Name"),
			UserID: row.getValue("ID"),
			periodTime: app.getAppProperty("periodTime"),
			Time: moment(current).format("YYYY.MM.DD"),
			UserPosition: position
		});
		var index = app.lookup("userList").getChildren().indexOf(app.lookup("loader"));
		app.lookup("userList").insertChild(index, workRow, {
			height: "135px"
		});
		
		workRow.style.animateFrom({
			"transform": "translateY(100%)",
			"opacity": "0"
		}, .5, cpr.animation.TimingFunction.EASE_IN_OUT_BACK);
		workRow.addEventListener("click", function(e) {
			showloading();
			var dialogProp = {
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				headerVisible: false,
			};
			app.openDialog("app/mobile/Admin/WorkManagement/WorkManagement", dialogProp, function(loadedApp) {
				loadedApp.style.animateFrom({
					"transform": "translateX(100%)",
					"opacity": "0"
				}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
				loadedApp.addEventListenerOnce("init", function() {
					loadedApp.setAppProperties({
						UserID: row.getValue("ID")
					});
					hideLoading();
				})
			});
		});
	});
	fetching = false;
	fetchCount = fetchCount + app.lookup("UserList").getRowCount();
	if (fetchCount >= app.lookup("Total").getValue("Count")) {
		hasNext = false;
		app.lookup("loader").setAppProperties({
			loaderImageVisible: false,
			loaderTextValue: cpr.I18N.INSTANCE.message("Str_Common_No_More")
		})
	}
}

/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsGetUsersInGroupSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetUsersInGroup = e.control;
	auth.logout(app);
	return;
}

/*
 * Triggered when leftBtnClick event is fired from User Defined Control.
 */
function onHeaderLeftBtnClick( /* cpr.events.CUIEvent */ e) {
	/** 
	 * @type udc.Header
	 */
	var header = e.control;
	if (isAnimating) {
		e.preventDefault();
		return;
	}
	isAnimating = true;
	cpr.core.App.load("app/mobile/Admin/WorkManagement/WorkManagementByGroup", function(loadedApp) {
		loadedApp.createNewInstance().run(null, function(createdApp) {
			createdApp.setAppProperties({
				prePage: app.getAppProperty("prePage")
			});
			createdApp.getContainer().style.animateFrom({
				"transform": "translateX(-100%)",
				"opacity": "0"
			}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
			app.close();
			isAnimating = false;
		})
	});
	renderTime();
	return;
}

/*
 * Triggered when rightBtnClick event is fired from User Defined Control.
 */
function onHeaderRightBtnClick( /* cpr.events.CUIEvent */ e) {
	/** 
	 * @type udc.Header
	 */
	var header = e.control;
	if (isAnimating) {
		e.preventDefault();
		return;
	}
	isAnimating = true;
	cpr.core.App.load("app/mobile/Admin/WorkManagement/WorkManagementGroupSearch", function(loadedApp) {
		loadedApp.createNewInstance().run(null, function(createdApp) {
			createdApp.setAppProperties({
				prePage: app.getAppProperty("prePage"),
				GroupName: app.getAppProperty("GroupName"),
				GroupID: app.getAppProperty("GroupID"),
				TotalUsers: app.getAppProperty("TotalUsers"),
				IsBlacklist: app.getAppProperty("IsBlacklist")
			});
			createdApp.getContainer().style.animateFrom({
				"transform": "translateX(100%)",
				"opacity": "0"
			}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
			app.close();
			isAnimating = false;
		});
	});
}

function fetchMore(offset) {
	if (!hasNext) {
		return;
	}
	fetching = true;
	
	if (app.getAppProperty("IsBlacklist")) {
		var smsGetUserInBlacklist = app.lookup("smsGetUserInBlacklist");
		smsGetUserInBlacklist.setRequestActionUrl(config.apiHostResolution() + smsGetUserInBlacklist.action);
		smsGetUserInBlacklist.addParameter("limit", 10);
		smsGetUserInBlacklist.addParameter("offset", offset);
		smsGetUserInBlacklist.send()
		return
	}
	
	var smsGetUsersInGroup = app.lookup("smsGetUsersInGroup");
	smsGetUsersInGroup.setRequestActionUrl(config.apiHostResolution() + smsGetUsersInGroup.action + "?groupID=" + app.getAppProperty("GroupID") + "&limit=10&offset=" + offset);
	smsGetUsersInGroup.send();
	return;
}

/*
 * Triggered when scroll event is fired from Group.
 * 그룹 컨텐츠가 스크롤될 때 발생하는 이벤트.
 */
function onUserListScroll( /* cpr.events.CUIEvent */ e) {
	/** 
	 * @type cpr.controls.Container
	 */
	var userList = e.control;
	var viewport = app.lookup("userList").getViewPortRect();
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
function onSmsGetUserInBlacklistSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetUserInBlacklist = e.control;
	handleUnauthorize(app);
	if (app.lookup("Result").getValue("ResultCode") !== 0) {
		return;
	}
	renderRow();
}

/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsGetUserInBlacklistSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetUserInBlacklist = e.control;
	auth.logout(app);
}

/*
 * Triggered when click event is fired from Image.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onNextMonthClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Image
	 */
	var nextMonth = e.control;
	app.lookup("userList").removeAllChildren();
	app.lookup("userList").addChild(new udc.Common.Loader("loader"), {
		height: "52px"
	});
	if (app.getAppProperty("periodTime") === "Day") {
		current = moment(current).add(1, "days")
		hasNext = true;
		fetching: false;
		fetchMore(0);
	}
	if (app.getAppProperty("periodTime") === "Week") {
		current = moment(current).add(1, "weeks")
		hasNext = true;
		fetching: false;
		fetchMore(0);
	}
	if (app.getAppProperty("periodTime") === "Month") {
		current = moment(current).add(1, "months")
		hasNext = true;
		fetching: false;
		fetchMore(0);
	}
	renderTime()
	return;
}

/*
 * Triggered when click event is fired from Image.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onPreMonthClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Image
	 */
	var preMonth = e.control;
	app.lookup("userList").removeAllChildren();
	app.lookup("userList").addChild(new udc.Common.Loader("loader"), {
		height: "52px"
	});
	if (app.getAppProperty("periodTime") === "Day") {
		current = moment(current).subtract(1, "days");
		hasNext = true;
		fetching: false;
		fetchMore(0);
	}
	if (app.getAppProperty("periodTime") === "Week") {
		current = moment(current).subtract(1, "weeks")
		hasNext = true;
		fetching: false;
		fetchMore(0);
	}
	if (app.getAppProperty("periodTime") === "Month") {
		current = moment(current).subtract(1, "months")
		hasNext = true;
		fetching: false;
		fetchMore(0);
	}
	renderTime()
	return;
}

/*
 * Triggered when click event is fired from Output "오늘".
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onOutputClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Output
	 */
	var output = e.control;
	app.lookup("userList").removeAllChildren();
	app.lookup("userList").addChild(new udc.Common.Loader("loader"), {
		height: "52px"
	});
	current = moment();
	hasNext = true;
	fetching: false;
	fetchMore(0);
	renderTime()
	return;
}

/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsGetUsersInGroupBeforeSubmit( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetUsersInGroup = e.control;
	showloading();
}

/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsGetUsersInGroupReceive( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetUsersInGroup = e.control;
	hideLoading();
}
