/************************************************
 * WeeklyTimeSheet.js
 * Created at Sep 15, 2020 9:15:20 AM.
 *
 * @author EVN0025
 ************************************************/

var config = getConfig();
var Auth = cpr.core.Module.require("lib/Auth");
var periodTime = "Day"

function handleBtnStyle(/* cpr.controls.Output */ btn) {
	btn.style.css({
		"background-color": "#FFFFFF",
		"color": ""
	})
	if (btn.id === "dailyBtn") {
		app.lookup("monthlyBtn").style.css({
			"background-color": "none",
			"color": "#FFFFFF"
		});
		app.lookup("weeklyBtn").style.css({
			"background-color": "none",
			"color": "#FFFFFF"
		})
	}
	if (btn.id === "monthlyBtn") {
		app.lookup("dailyBtn").style.css({
			"background-color": "none",
			"color": "#FFFFFF"
		});
		app.lookup("weeklyBtn").style.css({
			"background-color": "none",
			"color": "#FFFFFF"
		});
	}
	
	if (btn.id === "weeklyBtn") {
		app.lookup("dailyBtn").style.css({
			"background-color": "none",
			"color": "#FFFFFF"
		});
		app.lookup("monthlyBtn").style.css({
			"background-color": "none",
			"color": "#FFFFFF"
		});
	}
}

function handleLoadBodyApp(/* cpr.controls.Output */ btn){
	if (btn.id === "dailyBtn") {
		app.lookup("dailyApp").visible = true;
		app.lookup("weeklyApp").visible = false;
		app.lookup("monthlyApp").visible = false;
		periodTime = "Day";
	}
	
	if (btn.id === "monthlyBtn") {
		app.lookup("dailyApp").visible = false;
		app.lookup("weeklyApp").visible = false;
		app.lookup("monthlyApp").visible = true;
		periodTime = "Month";
	}
	
	if (btn.id === "weeklyBtn") {
		app.lookup("dailyApp").visible = false;
		app.lookup("weeklyApp").visible = true;
		app.lookup("monthlyApp").visible = false;
		periodTime = "Week";
	}
}

/*
 * Triggered when click event is fired from Output "일간"(dailyBtn).
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onDailyBtnClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var dailyBtn = e.control;
	handleBtnStyle(dailyBtn);
	handleLoadBodyApp(dailyBtn);
}
   

/*
 * Triggered when click event is fired from Output "Output"(weeklyBtn).
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onWeeklyBtnClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var weeklyBtn = e.control;
	handleBtnStyle(weeklyBtn)
	handleLoadBodyApp(weeklyBtn)
	
}


/*
 * Triggered when click event is fired from Output "Output"(monthlyBtn).
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onMonthlyBtnClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var monthlyBtn = e.control;
	handleBtnStyle(monthlyBtn);
	handleLoadBodyApp(monthlyBtn)
}


/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e) {
	
	app.lookup("dailyApp").visible = true;
	app.lookup("dailyBtn").style.css({
		"background-color": "#FFFFFF",
		"color": ""
	});
	if (Auth.isAdmin() && !app.isEmbeddedAppInstance()) {
		app.lookup("navigationBar").setAppProperties({
			rightIcon: "List",
			rightIconVisible: true
		});;
	}
	var smsUserInfoReq = app.lookup("smsUserInfoReq");
	smsUserInfoReq.action = smsUserInfoReq.action + "/" + (app.getAppProperty("UserID") || Auth.getAuthenticatedUser().UserID);
	smsUserInfoReq.setRequestActionUrl(config.apiHostResolution() + smsUserInfoReq.action);
	smsUserInfoReq.send();
}


/*
 * Triggered when leftBtnClick event is fired from User Defined Control.
 */
function onNavigationBarLeftBtnClick(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.NavigationBar
	 */
	var navigationBar = e.control;
	if (app.isEmbeddedAppInstance()) {
		app.close();
		return;
	}
	showloading();
	cpr.core.App.load("app/mobile/MainPage", function(loadedApp){
		loadedApp.createNewInstance().run(null, function(createdApp) {
			createdApp.getContainer().style.animateFrom({	
				"transform": "translateX(-100%)",
				"opacity": "0"
			}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
		});
		app.close();
		hideLoading();
		return;
	});
}


/*
 * Triggered when rightBtnClick event is fired from User Defined Control.
 */
function onNavigationBarRightBtnClick(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.NavigationBar
	 */
	var navigationBar = e.control;
	cpr.core.App.load("app/mobile/Admin/WorkManagement/WorkManagementByGroup", function(loadedApp){
		loadedApp.createNewInstance().run(null, function(createdApp) {
			createdApp.setAppProperties({
				periodTime: periodTime,
			});
			createdApp.getContainer().style.animateFrom({	
				"transform": "translateX(100%)",
				"opacity": "0"
			}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
		});
		app.close();
	});
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsUserInfoReqBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUserInfoReq = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsUserInfoReqReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUserInfoReq = e.control;
	hideLoading();
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsUserInfoReqSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUserInfoReq = e.control;
	handleUnauthorize(app);
	if (app.lookup("Result").getValue("ResultCode") === 0) {
		app.lookup("pageName").value = app.lookup("UserInfo").getValue("Name");
	}
}

