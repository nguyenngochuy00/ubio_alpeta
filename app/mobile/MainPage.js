/************************************************
 * MainPage.js
 * Created at Aug 25, 2020 2:35:40 PM.
 *
 * @author EVN0025
 ************************************************/

var Auth = cpr.core.Module.require("lib/Auth");
var utils = cpr.core.Module.require("lib/Utils");
var dataManager = getDataManager();
//var dataManager = cpr.core.Module.require("lib/DataManager");
var config = getConfig();
var isAnimating = false;

/*
 * Triggered when click event is fired from Group.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGroupClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Container
	 */
	var group = e.control;
	
}

/*
 * Triggered when click event is fired from Output.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onOutputClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Output
	 */
	var output = e.control;
	e.preventDefault();
}

/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad( /* cpr.events.CEvent */ e) {
	if (cpr.I18N.INSTANCE.currentLanguage === "ko") {
		app.lookup("currentTime").value = moment().format("YYYY") + "년  " + moment().format("MM") + "월 " + moment().format("DD") + "일";
	} else {
		app.lookup("currentTime").value = moment().format("YYYY.MM.DD");
	}
	
	window.addEventListener("BackBtnClicked", closeApp, true);
	var config = getConfig();
	var loggedUser = Auth.getAuthenticatedUser();
	//for browser test
	if (!loggedUser) {
		return;
	}
	
	if (localStorage.getItem("FirstLoginFlag") !== "1") {
		var dialogProp = {
			left: 20,
			right: 20,
			headerVisible: false,
			modal: true,
			resizable: false,
			height: 600
		};
		if (app.targetMedia === "all and (min-width: 414px) and (max-width: 499px)") {
			dialogProp = {
				left: 20,
				right: 20,
				headerVisible: false,
				modal: true,
				resizable: false,
				height: 700
			};
		}
		
		if (app.targetMedia === "all and (max-width: 349px)") {
			dialogProp = {
				left: 20,
				right: 20,
				headerVisible: false,
				modal: true,
				resizable: false,
				height: 500
			};
		}
		
		app.openDialog("app/mobile/dialog/FirstLoginWelcome", dialogProp, function( /*cpr.controls.Dialog*/ dialog) {
			dialog.style.css({
				"border-radius": "20px",
			});
		});
	}
	if (!app.getAppProperty("userInfo")) {
		var submission = app.lookup("smsUserInfoReq");
		submission.setParameters("fingerprint", "false");
		submission.setParameters("face", "false");
		submission.setParameters("picture", "true");
		//submission.action = "/users/" + parseInt(1, 10);
		submission.action = "/users/" + parseInt(loggedUser.UserID, 10);
		submission.setRequestActionUrl(config.apiHostResolution() + submission.action);
		submission.send();
	} else {
		app.getAppProperty("userInfo").copyToDataMap(app.lookup("UserInfo"));
		app.lookup("userName").value = app.lookup("UserInfo").getValue("Name") + (cpr.I18N.INSTANCE.currentLanguage === "ko" ? "님" : "");
		app.lookup("navigationBar").setAppProperties({
			userContext: app.lookup("UserInfo"),
			rightIconVisible: (app.lookup("UserInfo").getValue("Privilege") === 1)
		});
		app.lookup("navigationBar").visible = true;
		
		app.lookup("menu").setAppProperty("userContext", app.lookup("UserInfo"));
	}
	
	var getPeriodWorkTime = app.lookup("getPeriodWorkTime");
	getPeriodWorkTime.removeAllParameters();
	getPeriodWorkTime.setRequestActionUrl(config.apiHostResolution() + getPeriodWorkTime.action);
	getPeriodWorkTime.setParameters("searchCategory", "id");
	//getPeriodWorkTime.setParameters("searchKeywork", parseInt(1, 10));
	getPeriodWorkTime.setParameters("searchKeywork", parseInt(loggedUser.UserID, 10));
	getPeriodWorkTime.addParameter("startDate", moment().startOf('isoWeek').format("YYYY-MM-DD"));
	getPeriodWorkTime.addParameter("endDate", moment().endOf('isoWeek').format("YYYY-MM-DD"));
	getPeriodWorkTime.addParameter("offset", 0);
	getPeriodWorkTime.addParameter("limit", 10);
	getPeriodWorkTime.send();
	
	var getPosition = app.lookup("sms_getPosition");
	getPosition.setRequestActionUrl(config.apiHostResolution() + getPosition.action);
	getPosition.send();
	
	var smsGetGroup = app.lookup("smsGetGroup");
	smsGetGroup.setRequestActionUrl(config.apiHostResolution() + smsGetGroup.action);
	smsGetGroup.send();
	
	app.lookup("menu").render();
}

/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsUserInfoReqSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	handleUnauthorize(app);
	var smsUserInfoReq = e.control;
	//var dataManager = getDataManager();
	dataManager = getDataManager();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	// success
	if (resultCode === 0) {
		dataManager.setUserInfo(app.lookup("UserInfo"));
		app.lookup("userName").value = app.lookup("UserInfo").getValue("Name") + "님";
		app.lookup("navigationBar").setAppProperties({
			userContext: app.lookup("UserInfo"),
			rightIconVisible: (app.lookup("UserInfo").getValue("Privilege") === 1)
		});
		app.lookup("navigationBar").visible = true;
		
		app.lookup("menu").setAppProperty("userContext", app.lookup("UserInfo"));
	}
}

/*
 * Triggered when init event is fired from Body.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit( /* cpr.events.CEvent */ e) {
	Auth.isAuthenticated(app);
	if (window.webkit) {
		window.webkit.messageHandlers.tutorialHandler.postMessage("checkfirstTimeLogin");
	}
	
	if (window.tutorialHandler) {
		window.tutorialHandler.postMessage("checkfirstTimeLogin");
	}
	if (app.lookup("UserInfo")) {
		app.setAppProperty("userContext", app.lookup("UserInfo"));
	}
	if (app.getAppProperty("userContext")) {
		app.lookup("menu").setAppProperty("userContext", app.getAppProperty("userContext"));
	}
}

/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getPositionSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	handleUnauthorize(app)
	var sms_getPosition = e.control;
	//var dataManager = getDataManager();
	dataManager = getDataManager();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode === 0) {
		var positionList = app.lookup("PositionList");
		dataManager.setPositionList(positionList);
	}
}

/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsUserInfoReqSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUserInfoReq = e.control;
	Auth.logout(app);
}

/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onGetPeriodWorkTimeSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var getPeriodWorkTime = e.control;
	Auth.logout(app);
}

/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getPositionSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getPosition = e.control;
	Auth.logout(app);
}

/*
 * Triggered when click event is fired from Output(workMntBtn).
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onWorkMntBtnClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Output
	 */
	var workMntBtn = e.control;
	var userInfo = app.lookup("UserInfo");
	if (isAnimating) {
		e.preventDefault();
		return;
	}
	isAnimating = true;
	var userID = app.lookup("UserInfo").getValue("ID");
	cpr.core.App.load("app/mobile/Admin/WorkManagement/WorkManagement", function(loadedApp) {
		var newAppInstance = loadedApp.createNewInstance();
		newAppInstance.run(null, function(createdApp) {
			createdApp.setAppProperties({
				UserID: userID
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
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onGetPeriodWorkTimeSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var getPeriodWorkTime = e.control;
	handleUnauthorize(app);
	var dsWorkTimeList = app.lookup("WorkTimeList");
	//황재현
	if (dsWorkTimeList.getRowCount() > 0) { //check null
		var totalWorkHours = dsWorkTimeList.getValue(0, "TotalWorkTime");
		app.lookup("currentWorkTime").value = totalWorkHours || "00:00";
		var overWorkTime = app.lookup("WorkTimeList").getValue(0, "OverWorkTime");
		var basicWorkTime = app.lookup("WorkTimeList").getValue(0, "BasicWorkTime");
		var overWorkTimeNumber = utils.convertTimeString(overWorkTime);
		var basicWorkTimeNumber = utils.convertTimeString(basicWorkTime)
		app.lookup("basicWorkTimeBar").setAppProperties({
			currentValue: overWorkTimeNumber
		});
		
		app.lookup("overWorkTimeBar").setAppProperties({
			currentValue: basicWorkTimeNumber
		});
		
		if (basicWorkTimeNumber + overWorkTimeNumber === 40 * 60) {
			app.lookup("workMntBtn").style.css({
				"background-image": "url('/theme/images/mobile/main_top_status_icon_40hours.png')"
			})
		} else if (basicWorkTimeNumber + overWorkTimeNumber < 40 * 60) {
			app.lookup("workMntBtn").style.css({
				"background-image": "url('/theme/images/mobile/main_top_status_icon_work.png')"
			})
		} else if (basicWorkTimeNumber + overWorkTimeNumber > 40 * 60) {
			app.lookup("workMntBtn").style.css({
				"background-image": "url('/theme/images/mobile/main_top_status_icon_overtime.png')"
			})
		}
		
		if ((basicWorkTimeNumber + overWorkTimeNumber) > 52 * 60) {
			app.lookup("workMntBtn").style.css({
				"background-image": "url('/theme/images/mobile/main_top_status_icon_52hours.png')"
			})
		}
	} else {
		app.lookup("currentWorkTime").value = "00:00";
		app.lookup("basicWorkTimeBar").setAppProperties({
			currentValue: "0"
		});		
		app.lookup("overWorkTimeBar").setAppProperties({
			currentValue: "0"
		});
	}
}

/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsUserInfoReqBeforeSubmit( /* cpr.events.CSubmissionEvent */ e) {
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
function onSmsUserInfoReqReceive( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUserInfoReq = e.control;
	hideLoading();
}

/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onGetPeriodWorkTimeBeforeSubmit( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var getPeriodWorkTime = e.control;
	showloading();
}

/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onGetPeriodWorkTimeReceive( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var getPeriodWorkTime = e.control;
	hideLoading();
}

/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSms_getPositionBeforeSubmit( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getPosition = e.control;
	showloading();
}

/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSms_getPositionReceive( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getPosition = e.control;
	hideLoading();
}

/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetGroupSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetGroup = e.control;
	handleUnauthorize(app);
	if (app.lookup("Result").getValue("ResultCode") !== 0) {
		return;
	}
	
	dataManager.setGroup(app.lookup("GroupList"));
}

/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsGetGroupBeforeSubmit( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetGroup = e.control;
	showloading();
}

/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsGetGroupReceive( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetGroup = e.control;
	hideLoading();
}

/*
 * Triggered when before-unload event is fired from Body.
 * 앱이 언로드되기 전에 발생하는 이벤트 입니다. 취소할 수 있습니다.
 */
function onBodyBeforeUnload( /* cpr.events.CEvent */ e) {
	window.removeEventListener("BackBtnClicked", closeApp, true);
}

/*
 * 사용자 정의 컨트롤에서 menuClick 이벤트 발생 시 호출.
 */
function onNavigationBarMenuClick( /* cpr.events.CUIEvent */ e) {
	/** 
	 * @type udc.NavigationBar
	 */
	var navigationBar = e.control;
	var sideMenu = app.lookup("menu");
	
	sideMenu.openMenu();
}

/*
 * 사용자 정의 컨트롤에서 pageChange 이벤트 발생 시 호출.
 */
function onMenuPageChange( /* cpr.events.CUIEvent */ e) {
	/** 
	 * @type udc.SideMenu
	 */
	var menu = e.control;
	var pageChangeEvent = new cpr.events.CUIEvent("pageChange", {
		content: e.content
	});
	
	var sideMenu = app.lookup("menu");
	sideMenu.closeMenu();
	//	app.dispatchEvent(pageChangeEvent);
	
	var nextPage = e.content.nextPage;
	if (!nextPage) {
		e.preventDefault();
		return;
	}
	
	if (nextPage === "MainPage") {
		e.preventDefault();
		return;
	}
	
	if (nextPage === "TerminalManagementPage") {
		cpr.core.App.load("app/mobile/Admin/Terminal/TerminalList", function(newapp) {
			newapp.createNewInstance().run(null, function(createdApp) {
				createdApp.getContainer().style.animateFrom({
					"transform": "translateX(100%)",
					"opacity": "0"
				}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
				app.close();
			})
		});
		return;
	}
	
	if (nextPage === "UserManagementPage") {
		var userInfo = app.lookup("UserInfo");
		var positionList = app.lookup("PositionList");
		cpr.core.App.load("app/mobile/Admin/UserManagement/UserManagement", function(newapp) {
			var newAppInstance = newapp.createNewInstance();
			newAppInstance.run(null, function(createdApp) {
				createdApp.setAppProperty("prePage", "app/mobile/MainPage");
				createdApp.getContainer().style.animateFrom({
					"transform": "translateX(100%)",
					"opacity": "0"
				}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
				app.close();
			});
		});
		return;
	}
	
	if (nextPage === "TimeSheetMenu") {
		var userID = app.lookup("UserInfo").getValue("ID");
		cpr.core.App.load("app/mobile/Admin/WorkManagement/WorkManagement", function(loadedApp) {
			var newAppInstance = loadedApp.createNewInstance();
			newAppInstance.run(null, function(createdApp) {
				createdApp.setAppProperties({
					UserID: userID
				});
				createdApp.getContainer().style.animateFrom({
					"transform": "translateX(100%)",
					"opacity": "0"
				}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
				app.close();
			});
		});
		return;
	}
	
	if (nextPage === "LogManagement") {
		cpr.core.App.load("app/mobile/Admin/Logs/Logs", function(loadedApp) {
			var newAppInstance = loadedApp.createNewInstance();
			newAppInstance.run(null, function(createdApp) {
				createdApp.getContainer().style.animateFrom({
					"transform": "translateX(100%)",
					"opacity": "0"
				}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
				app.close();
			});
		});
		return;
	}
	
	if (nextPage === "Monitoring") {
		cpr.core.App.load("app/mobile/Admin/Monitoring/Monitoring", function(loadedApp) {
			var newAppInstance = loadedApp.createNewInstance();
			newAppInstance.run(null, function(createdApp) {
				createdApp.getContainer().style.animateFrom({
					"transform": "translateX(100%)",
					"opacity": "0"
				}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
				app.close();
			});
		});
		return;
	}
	
	if (nextPage === "MealManagement" && Auth.isAdmin()) {
		cpr.core.App.load("app/mobile/Admin/MealManagement/MealManagementOverview", function(loadedApp) {
			var newAppInstance = loadedApp.createNewInstance();
			newAppInstance.run(null, function(createdApp) {
				createdApp.getContainer().style.animateFrom({
					"transform": "translateX(100%)",
					"opacity": "0"
				}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
				app.close();
			});
		});
		return;
	}
	
	if (nextPage === "MealManagement" && Auth.isUser()) {
		cpr.core.App.load("app/mobile/Admin/MealManagement/MealDetail", function(loadedApp) {
			var newAppInstance = loadedApp.createNewInstance();
			newAppInstance.run(null, function(createdApp) {
				createdApp.setAppProperties({
					prePage: "app/mobile/MainPage",
					UserID: Auth.getAuthenticatedUser().ID,
					UserName: Auth.getAuthenticatedUser().Name,
					CurrentTime: moment().format("YYYY.MM")
				});
				createdApp.getContainer().style.animateFrom({
					"transform": "translateX(100%)",
					"opacity": "0"
				}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
				app.close();
			});
		});
		return;
	}
	
	if (nextPage === "VisitorManagement") {
		cpr.core.App.load("app/mobile/Admin/VisitorManagement/VisitorManagement", function(loadedApp) {
			var newAppInstance = loadedApp.createNewInstance();
			newAppInstance.run(null, function(createdApp) {
				createdApp.setAppProperties({
					prePage: "app/mobile/MainPage"
				});
				createdApp.getContainer().style.animateFrom({
					"transform": "translateX(100%)",
					"opacity": "0"
				}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
				app.close();
			});
		});
		return;
	}
	
	if (nextPage === "setting") {
		cpr.core.App.load("app/mobile/Setting/Setting", function(loadedApp) {
			var newAppInstance = loadedApp.createNewInstance();
			newAppInstance.run(null, function(createdApp) {
				createdApp.setAppProperties({
					prePage: "app/mobile/MainPage"
				});
				createdApp.getContainer().style.animateFrom({
					"transform": "translateX(100%)",
					"opacity": "0"
				}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
				app.close();
			});
		});
		return;
	}
	
	if (nextPage === "pushMessage") {
		cpr.core.App.load("app/mobile/PushMessage/PushMessage", function(loadedApp) {
			var newAppInstance = loadedApp.createNewInstance();
			newAppInstance.run(null, function(createdApp) {
				createdApp.setAppProperties({
					prePage: "app/mobile/MainPage"
				});
				createdApp.getContainer().style.animateFrom({
					"transform": "translateX(100%)",
					"opacity": "0"
				}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
				app.close();
			});
		});
		return;
	}
}

/*
 * 루트 컨테이너에서 property-change 이벤트 발생 시 호출.
 * 앱의 속성이 변경될 때 발생하는 이벤트 입니다.
 */
function onBodyPropertyChange( /* cpr.events.CPropertyChangeEvent */ e) {
	if (app.getAppProperty("userContext")) {
		app.lookup("menu").setAppProperty("userContext", app.getAppProperty("userContext"));
	}
}

/*
 * 사용자 정의 컨트롤에서 btnMoreClick 이벤트 발생 시 호출.
 */
function onMenuBtnMoreClick( /* cpr.events.CUIEvent */ e) {
	/** 
	 * @type udc.SideMenu
	 */
	var menu = e.control;
	var btnMoreClick = new cpr.events.CUIEvent("btnMoreClick");
	var sideMenu = app.lookup("menu");
	sideMenu.closeMenu();
	setTimeout(function() {
		if (isAnimating) {
			e.preventDefault();
			return;
		}
		showloading();
		isAnimating = true;
		var userInfo = app.lookup("UserInfo");
		var positionList = app.lookup("PositionList");
		cpr.core.App.load("app/mobile/UserInformation/UserInformation", function(newapp) {
			newapp.createNewInstance().run(null, function(createdApp) {
				createdApp.setAppProperties({
					UserInfo: userInfo,
					PositionList: positionList
				});
				createdApp.getContainer().style.animateFrom({
					"transform": "translateX(100%)",
					"opacity": "0"
				}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
				hideLoading();
				app.close();
				isAnimating = false;
			});
		});
	}, 200)
}