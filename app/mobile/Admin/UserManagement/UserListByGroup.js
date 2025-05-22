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
/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	app.lookup("header").pageName = app.getAppProperty("GroupName");
	app.lookup("totalUser").value = app.getAppProperty("TotalUsers");
	fetchMore(0);
}

/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetUsersInGroupSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetUsersInGroup = e.control;
	handleUnauthorize(app);
	if (app.lookup("Result").getValue("ResultCode") !== 0) {
		return;
	}
	renderRow()
}

function renderRow() {
	var userListDataSet = app.lookup("UserList");
	userListDataSet.forEachOfUnfilteredRows(function (row) {
		var userRow = new udc.UserManagement.UserListInGroupRow();
		userRow.UserName = row.getValue("Name");
		userRow.UserID = row.getValue("ID");
		userRow.UserType = utils.getAuthority(row.getValue("Privilege"));
		userRow.AuthType = utils.buildAuthType(row.getValue("AuthInfo"));
		userRow.UniqueID = row.getValue("UniqueID");
		
		var index = app.lookup("userList").getChildren().indexOf(app.lookup("loader"));
		app.lookup("userList").insertChild(index, userRow, {
			height: "100px"
		});
		
		userRow.style.animateFrom({	
			"transform": "translateY(100%)",
			"opacity": "0"
		}, .5, cpr.animation.TimingFunction.EASE_IN_OUT_BACK);
		
		userRow.addEventListener("click", function(e){
			showloading();
			var dialogProp = {
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				headerVisible : false,
			};
			app.openDialog("app/mobile/Admin/UserManagement/UserDetail", dialogProp, function(loadedApp) {
				loadedApp.style.animateFrom({	
						"transform": "translateX(100%)",
						"opacity": "0"
					}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
				loadedApp.addEventListenerOnce("init", function () {
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
		app.lookup("loaderIcon").visible = false;
		app.lookup("loaderText").bind("value").toLanguage("Str_Common_No_More");
	} 
}


/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsGetUsersInGroupSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetUsersInGroup = e.control;
	auth.logout(app);
}


/*
 * Triggered when leftBtnClick event is fired from User Defined Control.
 */
function onHeaderLeftBtnClick(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.Header
	 */
	var header = e.control;
	if (isAnimating) {
		e.preventDefault();
		return;
	}
	isAnimating = true;
	cpr.core.App.load("app/mobile/Admin/UserManagement/UserManagement", function(loadedApp){
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
}


/*
 * Triggered when rightBtnClick event is fired from User Defined Control.
 */
function onHeaderRightBtnClick(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.Header
	 */
	var header = e.control;
	if (isAnimating) {
		e.preventDefault();
		return;
	}
	isAnimating = true;
	cpr.core.App.load("app/mobile/Admin/UserManagement/UserListByGroupSearch", function(loadedApp){
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
		})
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
	smsGetUsersInGroup.setRequestActionUrl(config.apiHost + smsGetUsersInGroup.action + "?groupID=" + app.getAppProperty("GroupID") + "&limit=10&offset=" + offset);
	smsGetUsersInGroup.send()
}


/*
 * Triggered when scroll event is fired from Group.
 * 그룹 컨텐츠가 스크롤될 때 발생하는 이벤트.
 */
function onUserListScroll(/* cpr.events.CUIEvent */ e){
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
function onSmsGetUserInBlacklistSubmitDone(/* cpr.events.CSubmissionEvent */ e){
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
function onSmsGetUserInBlacklistSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetUserInBlacklist = e.control;
	auth.logout(app);
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsGetUsersInGroupBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
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
function onSmsGetUsersInGroupReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetUsersInGroup = e.control;
	hideLoading();
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsGetUserInBlacklistBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetUserInBlacklist = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsGetUserInBlacklistReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetUserInBlacklist = e.control;
	hideLoading();
}
