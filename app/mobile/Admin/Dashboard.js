/************************************************
 * Dashboard.js
 * Created at Sep 14, 2020 2:09:15 PM.
 *
 * @author EVN0025
 ************************************************/

var config = getConfig();
var utils = cpr.core.Module.require("lib/Utils");
var auth = cpr.core.Module.require("lib/Auth");
var dataManager = getDataManager();
var totalUsers;
var totalTerminals;
var totalAuthLogs;
var totalMeals;
var isAnimating = false;
var fetchedMealResult = 0;
var totalMeal = 0;
var totalPrice = 0;

/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	app.lookup("header").setAppProperties({
		pageName: cpr.I18N.INSTANCE.message("Str_Dashboard")
	});
	var now = moment();
	var year = now.format("YYYY");
	var month = now.format("MM");
	var websocket = dataManager.getWebsocket();
	var dashboard = app;
	showloading();
	
	var smsGetUserList = app.lookup("smsGetUserList");
	smsGetUserList.setRequestActionUrl(config.apiHostResolution() + smsGetUserList.action);
	smsGetUserList.send()
	
	var smsGetTerminals = app.lookup("smsGetTerminals");
	smsGetTerminals.setRequestActionUrl(config.apiHostResolution() + smsGetTerminals.action);
	smsGetTerminals.send()

	var smsMealStatistics = app.lookup("smsMealStatistics");
	smsMealStatistics.removeAllParameters();
	smsMealStatistics.setRequestActionUrl(config.apiHostResolution() + smsMealStatistics.action);
	smsMealStatistics.addParameter("Year", now.format("YYYY"));
	smsMealStatistics.addParameter("Month", now.format("M"));
	smsMealStatistics.send();
	
	fetchMealResult(0)
	
	var smsAuthLogsList = app.lookup("smsAuthLogsList");
	smsAuthLogsList.removeAllParameters();
	smsAuthLogsList.setRequestActionUrl(config.apiHostResolution() + smsAuthLogsList.action);
	smsAuthLogsList.addParameter("offset", 0);
	smsAuthLogsList.addParameter("limit", 1);
	smsAuthLogsList.addParameter("startTime", now.startOf("month").format("YYYY-MM-DD") + " 00:00:00");
	smsAuthLogsList.addParameter("endTime", now.endOf("month").format("YYYY-MM-DD") + " 23:59:59");
	smsAuthLogsList.addParameter("searchCategory", "all");
	smsAuthLogsList.send()
}

function fetchMealResult(offset) {
	var thisMonth = moment();
	var startOfMonth = thisMonth.startOf('month').format('YYYY-MM-DD');
	var endOfMonth   = thisMonth.endOf('month').format('YYYY-MM-DD');
	var smsMealResult = app.lookup("smsMealResult");
	smsMealResult.setRequestActionUrl(config.apiHostResolution() + smsMealResult.action);
	smsMealResult.removeAllParameters();
	smsMealResult.addParameter("StartAt", startOfMonth);
	smsMealResult.addParameter("EndAt", endOfMonth);
	smsMealResult.addParameter("offset", offset || 0);
	smsMealResult.addParameter("limit", "100");
	smsMealResult.send();
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetUserListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetUserList = e.control;
	handleUnauthorize(app);
	if (app.lookup("Result").getValue("ResultCode") === 0) {
		totalUsers = app.lookup("Total").getValue("Count");
		app.lookup("totalUser").value = utils.numberWithCommas(totalUsers);
		var userPercent = totalUsers * 100 / config.dashboard.maximumUsers;
		app.lookup("usedUserPercent").value = Math.floor(userPercent) + "% Used"
	}
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetTerminalsSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTerminals = e.control;
	handleUnauthorize(app);
	if (app.lookup("Result").getValue("ResultCode") === 0) {
		totalTerminals = app.lookup("Total").getValue("Count");
		app.lookup("totalTerminals").value = utils.numberWithCommas(totalTerminals);
		var terminalPercent = totalTerminals * 100 / config.dashboard.maximumTerminals;
		app.lookup("usedTerminalPercent").value = Math.floor(terminalPercent) + "% Used"
	}
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsMealStatisticsSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsMealStatistics = e.control;
	handleUnauthorize(app, app.lookup("smsMealStatisticsResult").getValue("ResultCode"));
	if (app.lookup("smsMealStatisticsResult").getValue("ResultCode") !== 0) {
		return;
	}
	app.lookup("MealStatisticsDay").forEachOfUnfilteredRows(function(row) {
		totalMeal = totalMeal + row.getValue("Count");
	});
	
	app.lookup("totalMeal").value = utils.numberWithCommas(totalMeal)
}


/*
 * Triggered when click event is fired from Image.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onOpenUserManagementBtnClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Image
	 */
	var openUserManagementBtn = e.control;
	if (isAnimating) {
		e.preventDefault();
		return;
	}
	cpr.core.App.load("app/mobile/Admin/UserManagement/UserManagement",
		function(loadedApp) {
			loadedApp.createNewInstance().run(null, function(createdApp) {
				createdApp.setAppProperties({
					prePage: "app/mobile/Admin/Dashboard"
				});
				createdApp.getContainer().style.animateFrom({	
					"transform": "translateX(100%)",
					"opacity": "0"
				}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
				app.close();
			});
		}
	);
}


/*
 * Triggered when click event is fired from Image.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onOpenTerminalManagementPageClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Image
	 */
	var openTerminalManagementPage = e.control;
	if (isAnimating) {
		e.preventDefault();
		return;
	}
	isAnimating = true;
	cpr.core.App.load("app/mobile/Admin/Terminal/TerminalList",
		function(loadedApp) {
			loadedApp.createNewInstance().run(null, function(createdApp) {
			createdApp.setAppProperties({
				prePage: "app/mobile/Admin/Dashboard",
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


/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsGetUserListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetUserList = e.control;
	auth.logout(app);
}


/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsGetTerminalsSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTerminals = e.control;
	auth.logout(app);
}


/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsGetAuthLogsInMonthSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetAuthLogsInMonth = e.control;
	auth.logout(app);
}


/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsMealStatisticsSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsMealStatistics = e.control;
	auth.logout(app);
}


/*
 * Triggered when submit-timeout event is fired from Submission.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSmsMealStatisticsSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsMealStatistics = e.control;
	auth.logout(app);
}


/*
 * Triggered when submit-timeout event is fired from Submission.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSmsGetAuthLogsInMonthSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetAuthLogsInMonth = e.control;
	auth.logout(app);
}


/*
 * Triggered when submit-timeout event is fired from Submission.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSmsGetTerminalsSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTerminals = e.control;
	auth.logout(app);
}


/*
 * Triggered when submit-timeout event is fired from Submission.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSmsGetUserListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetUserList = e.control;
	auth.logout(app);
}




/*
 * Triggered when click event is fired from Image.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onOpenAuthLogsListClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Image
	 */
	var openAuthLogsList = e.control;
	if (isAnimating) {
		e.preventDefault();
		return;
	}
	isAnimating = true;
	cpr.core.App.load("app/mobile/Admin/Logs/AuthLogList",
		function(loadedApp) {
			loadedApp.createNewInstance().run(null, function(createdApp) {
			createdApp.setAppProperties({
				prePage: "app/mobile/Admin/Dashboard",
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


/*
 * Triggered when click event is fired from Image.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onOpenMealManagementClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Image
	 */
	var openMealManagement = e.control;
	if (isAnimating) {
		e.preventDefault();
		return;
	}
	isAnimating = true;
	cpr.core.App.load("app/mobile/Admin/MealManagement/MealManagementOverview",
		function(loadedApp) {
			loadedApp.createNewInstance().run(null, function(createdApp) {
			createdApp.setAppProperties({
				prePage: "app/mobile/Admin/Dashboard",
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


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsGetUserListBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetUserList = e.control;
	showloading()
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsGetUserListReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetUserList = e.control;
	hideLoading();
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsGetTerminalsBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTerminals = e.control;
	showloading()
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsGetTerminalsReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTerminals = e.control;
	hideLoading();
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsGetAuthLogsInMonthBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetAuthLogsInMonth = e.control;
	showloading()
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsGetAuthLogsInMonthReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetAuthLogsInMonth = e.control;
	hideLoading();
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsMealStatisticsBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsMealStatistics = e.control;
	showloading()
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsMealStatisticsReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsMealStatistics = e.control;
	hideLoading();
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/*
 * Triggered when init event is fired from Body.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(/* cpr.events.CEvent */ e){
	
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
	showloading();
	cpr.core.App.load("app/mobile/MainPage", function(newapp) {
		app.close();
		newapp.createNewInstance().run(null, function(createdApp) {
			createdApp.getContainer().style.animateFrom({	
				"transform": "translateX(-100%)",
				"opacity": "0"
			}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
			isAnimating = false;
			hideLoading();
		});
	});
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsMealResultBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsMealResult = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsMealResultReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsMealResult = e.control;
	hideLoading();
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsMealResultSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsMealResult = e.control;
	var totalPrice = 0;
	handleUnauthorize(app, app.lookup("smsMealResultResult").getValue("ResultCode"));
	if (app.lookup("smsMealResultResult").getValue("ResultCode") !== 0) {
		return;
	}
	
	fetchedMealResult = app.lookup("MealResult").getRowCount();
	if (fetchedMealResult < app.lookup("smsMealResultTotal").getValue("Count")) {
		fetchMealResult(fetchedMealResult);
		return;
	}
	
	app.lookup("MealResult").forEachOfUnfilteredRows(function(row) {
		totalPrice = totalPrice + row.getValue("Pay");
	});
	
	app.lookup("totalPrice").value = utils.numberWithCommas(totalPrice)
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsAuthLogsListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsAuthLogsList = e.control;
	handleUnauthorize(app);
	if (app.lookup("Result").getValue("ResultCode") === 0) {
		totalAuthLogs = app.lookup("Total").getValue("Count");
		app.lookup("totalAuthLogs").value = utils.numberWithCommas(totalAuthLogs);
	}
}
