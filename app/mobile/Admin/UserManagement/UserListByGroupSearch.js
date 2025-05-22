/************************************************
 * UserListByGroupSearch.js
 * Created at Sep 22, 2020 3:06:57 PM.
 *
 * @author EVN0025
 ************************************************/

var config = getConfig();
var auth = cpr.core.Module.require("lib/Auth");
var isAutimating = false;
var currentRow = 0;

/*
 * Triggered when leftBtnClick event is fired from User Defined Control.
 */
function onNavigationBarLeftBtnClick(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.NavigationBar
	 */
	var navigationBar = e.control;
	if (isAutimating) {
		e.preventDefault();
		return;
	}
	isAutimating = true;
	cpr.core.App.load("app/mobile/Admin/UserManagement/UserListByGroup", function(loadedApp){
		var newAppInstance = loadedApp.createNewInstance();
		newAppInstance.run(null, function(createdApp) {
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
			isAutimating = false;
		});	
	});
}


/*
 * Triggered when onSearch event is fired from User Defined Control.
 */
function onNavigationBarOnSearch(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.NavigationBar
	 */
	var navigationBar = e.control;
	var searchCondition = e.content;
	if (!searchCondition.searchValue) {
		renderDefaultMessage()
		return;
	}
	
	
	if (app.getAppProperty("IsBlacklist")) {
		var smsSearchUserInBlackList = app.lookup("smsSearchUserInBlackList");
		smsSearchUserInBlackList.removeAllParameters();
		smsSearchUserInBlackList.setRequestActionUrl(config.apiHostResolution() + smsSearchUserInBlackList.action);
		smsSearchUserInBlackList.addParameter("searchCategory", searchCondition.searchCategory.value);
		smsSearchUserInBlackList.addParameter("searchKeyword", searchCondition.searchValue);
		smsSearchUserInBlackList.addParameter("offset", 0);
		smsSearchUserInBlackList.addParameter("limit", 10);
		smsSearchUserInBlackList.send()
		return;
	}
	
	
	var smsSearchUser = app.lookup("smsSearchUser");
	smsSearchUser.removeAllParameters();
	smsSearchUser.setRequestActionUrl(config.apiHostResolution() + smsSearchUser.action);
	smsSearchUser.addParameter("searchCategory", searchCondition.searchCategory.value);
	smsSearchUser.addParameter("searchKeyword", searchCondition.searchValue);
	smsSearchUser.addParameter("groupID", 0);
	smsSearchUser.addParameter("subInclude", true);
	smsSearchUser.addParameter("offset", 0);
	smsSearchUser.addParameter("limit", 10);
	smsSearchUser.send()
}


/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsSearchUserSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsSearchUser = e.control;
	auth.logout(app);
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsSearchUserSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsSearchUser = e.control;
	if (app.lookup("Result").getValue("ResultCode") !== 0) {
		return;
	}
	renderSearchResult()
}

function renderDefaultMessage() {
	app.lookup("searchResult").removeAllChildren();
	var rowUI = new cpr.controls.Output();
		rowUI.style.css({
			color: "#909090",
			font: "14px",
			"text-align": "center"
		});
		rowUI.value = cpr.I18N.INSTANCE.message("Str_Common_Search_PleaseEnterKeywork")
		app.lookup("searchResult").addChild(rowUI, {
			height: "240px"
		});
}

function renderSearchResult() {
	app.lookup("searchResult").removeAllChildren();
	currentRow = app.lookup("UserList").getRowCount();
	if (app.lookup("UserList").getRowCount() === 0) {
		var rowUI = new cpr.controls.Output();
		rowUI.style.css({
			color: "#909090",
			font: "14px",
			"text-align": "center"
		});
		rowUI.value = cpr.I18N.INSTANCE.message("Str_Common_No_More")
		app.lookup("searchResult").addChild(rowUI, {
			height: "240px"
		});
	}
	
	app.lookup("UserList").forEachOfUnfilteredRows(function (row) {
		var rowUI = new cpr.controls.Output(row.getIndex());
		rowUI.value = row.getValue("Name");
		rowUI.style.css({
			color: "#909090",
			font: "12px",
			"border-bottom": "solid 1px #cfcfcf"
		})
		app.lookup("searchResult").addChild(rowUI, {
			height: "34px"
		});
		rowUI.style.animateFrom({	
			"transform": "translateY(100%)",
			"opacity": "0"
		}, .5, cpr.animation.TimingFunction.EASE_IN_OUT_BACK);
		rowUI.addEventListener("click", function (e) {
			var output = e.control;
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
				})
			});
		})
	});
}


/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	renderDefaultMessage();
	if (app.getAppProperty("IsBlacklist")) {
		app.lookup("searchCategory").addRowData({
			label: cpr.I18N.INSTANCE.message("Str_Name"),
			value: "name",
		});
		
		app.lookup("searchCategory").addRowData({
			label: cpr.I18N.INSTANCE.message("Str_ID"),
			value: "id",
		});
		
		app.lookup("navigationBar").setAppProperty("searchCategory", app.lookup("searchCategory"));
		return;
	}
	
//	app.lookup("searchCategory").addRowData({
//		label: cpr.I18N.INSTANCE.message("Str_Total"),
//		value: "",
//	});
	
	app.lookup("searchCategory").addRowData({
		label: cpr.I18N.INSTANCE.message("Str_Name") ,
		value: "name",
	});
	
	app.lookup("searchCategory").addRowData({
		label: cpr.I18N.INSTANCE.message("Str_ID"),
		value: "id",
	});
	
	app.lookup("searchCategory").addRowData({
		label: cpr.I18N.INSTANCE.message("Str_UniqueID"),
		value: "uniqueid",
	});
	
	app.lookup("navigationBar").setAppProperty("searchCategory", app.lookup("searchCategory"));
	
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsSearchUserInBlackListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsSearchUserInBlackList = e.control;
	if (app.lookup("Result").getValue("ResultCode") !== 0) {
		return;
	}
	renderSearchResult()
}


/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsSearchUserInBlackListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsSearchUserInBlackList = e.control;
	auth.logout(app);
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsSearchUserBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsSearchUser = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsSearchUserReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsSearchUser = e.control;
	hideLoading();
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsSearchUserInBlackListBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsSearchUserInBlackList = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsSearchUserInBlackListReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsSearchUserInBlackList = e.control;
	hideLoading();
}
