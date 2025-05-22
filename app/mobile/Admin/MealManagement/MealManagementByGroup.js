/************************************************
 * UserManagement.js
 * Created at Sep 14, 2020 3:13:01 PM.
 *
 * @author EVN0025
 ************************************************/

var config = getConfig();
var utils = cpr.core.Module.require("lib/Utils");
var auth = cpr.core.Module.require("lib/Auth");
var isAnimating = false;
var totalUserInBlacklist = 0;

/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var totalRow = app.lookup("totalRow");
	totalRow.setAppProperties({
		GroupName: cpr.I18N.INSTANCE.message("Str_All")
	});
	
	var smsGetTotalUser = app.lookup("smsGetTotalUser");
	smsGetTotalUser.setRequestActionUrl(config.apiHostResolution() + smsGetTotalUser.action);
	smsGetTotalUser.send();
	
	var smsGetGroups = app.lookup("smsGetGroups");
	smsGetGroups.setRequestActionUrl(config.apiHostResolution() + smsGetGroups.action);
	smsGetGroups.send()
	
	var smsGetUserCountInGroup = app.lookup("smsGetUserCountInGroup");
	smsGetUserCountInGroup.setRequestActionUrl(config.apiHostResolution() + smsGetUserCountInGroup.action);
	smsGetUserCountInGroup.send()
	
	var smsGetBacklist = app.lookup("smsGetBacklist");
	smsGetBacklist.setRequestActionUrl(config.apiHostResolution() + smsGetBacklist.action);
	smsGetBacklist.send();
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetBacklistSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetBacklist = e.control;
	handleUnauthorize(app);
	if (app.lookup("Result").getValue("ResultCode") === 0) {
		var uiRow = new udc.UserManagementRow();
		uiRow.backgroundColor = "#C8C8C8";
		uiRow.UsersPerGroup = utils.numberWithCommas(app.lookup("Total").getValue("Count"));
		uiRow.imageStyle = "/theme/images/mobile/user_list_icon_people_dark.png";
		uiRow.dividerStyle = "solid 1px #898989";
		uiRow.GroupName = cpr.I18N.INSTANCE.message("Str_BlackList");
		uiRow.addEventListener("GroupRowClick", onBlackListRowClickHandler);
		uiRow.style.animateFrom({	
			"transform": "translateY(100%)",
			"opacity": "0"
		}, .5, cpr.animation.TimingFunction.EASE_IN_OUT_BACK);
		app.lookup("userMangementBody").addChild(uiRow, {
			height: "88px"
		});
		totalUserInBlacklist = app.lookup("Total").getValue("Count");
	}
}

function onBlackListRowClickHandler(/* cpr.events.CEvent */ e) {
	if (isAnimating) {
		e.preventDefault();
		return;
	}
	isAnimating = true;
	cpr.core.App.load("app/mobile/Admin/MealManagement/MealManagementGroupDetail", function(loadedApp){
		var newAppInstance = loadedApp.createNewInstance();
		newAppInstance.run(null, function(createdApp) {
			createdApp.setAppProperties({
				GroupName: cpr.I18N.INSTANCE.message("Str_BlackList"),
				IsBlacklist: true,
				TotalUsers: totalUserInBlacklist,
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

function onGroupRowClickHandler(/* cpr.events.CEvent */ e) {
	var group = e.content.group;
	if (isAnimating) {
		e.preventDefault();
		return;
	}
	isAnimating = true;
	//UsersInGroup
	cpr.core.App.load("app/mobile/Admin/MealManagement/MealManagementGroupDetail", function(loadedApp){
		var newAppInstance = loadedApp.createNewInstance();
		newAppInstance.run(null, function(createdApp) {
			createdApp.setAppProperties({
				GroupName: group.Name,
				GroupID: group.ID,
				TotalUsers: group.UsersInGroup,
				prePage: app.getAppProperty("prePage")
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
function onSmsGetUserCountInGroupSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetUserCountInGroup = e.control;
	handleUnauthorize(app);
	if (app.lookup("Result").getValue("ResultCode") !== 0) {
		return;
	}
	app.lookup("UserCountByGroups").forEachOfUnfilteredRows(function (row) {
		var uiRow = new udc.UserManagementRow();
		uiRow.GroupID = row.getValue("GroupID");
		uiRow.UsersPerGroup = utils.numberWithCommas(row.getValue("UserCount"))
		// total item
		if (row.getValue("GroupID") === 0) {
			return;
		} else {
			var group = app.lookup("GroupList").findAllRow("GroupID===" + row.getValue("GroupID"))[0];
			uiRow.GroupName = group.getValue("Name")
		}
		uiRow.addEventListener("GroupRowClick", onGroupRowClickHandler);
		uiRow.style.animateFrom({	
			"transform": "translateY(100%)",
			"opacity": "0"
		}, .5, cpr.animation.TimingFunction.EASE_IN_OUT_BACK);
		app.lookup("userMangementBody").addChild(uiRow, {
			height: "88px"
		});
	});
	
	app.lookup("totalGroups").value = app.lookup("GroupList").getRowCount() + 1 + (cpr.I18N.INSTANCE.currentLanguage === "ko" ? " 개" : "");
}


/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsGetBacklistSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetBacklist = e.control;
	auth.logout(app);
}


/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsGetUserCountInGroupSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetUserCountInGroup = e.control;
	auth.logout(app);
}


/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsGetGroupsSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetGroups = e.control;
	auth.logout(app);
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetGroupsSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetGroups = e.control;
	handleUnauthorize(app);
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetTotalUserSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTotalUser = e.control;
	handleUnauthorize(app);
	if (app.lookup("Result").getValue("ResultCode") === 0) {
		app.lookup("totalUsers").value = app.lookup("Total").getValue("Count") + (cpr.I18N.INSTANCE.currentLanguage === "ko" ? " 명" : "")
		var totalRow = app.lookup("totalRow");
		totalRow.setAppProperty("UsersPerGroup", app.lookup("Total").getValue("Count"));
	}
}


/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsGetTotalUserSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTotalUser = e.control;
	auth.logout(app);
}


/*
 * Triggered when GroupRowClick event is fired from User Defined Control.
 */
function onTotalRowGroupRowClick(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.UserManagementRow
	 */
	var totalRow = e.control;
	var group = e.content.group;
	if (isAnimating) {
		e.preventDefault();
		return;
	}
	isAnimating = true;
	//UsersInGroup
	cpr.core.App.load("app/mobile/Admin/MealManagement/MealManagementGroupDetail", function(loadedApp){
		var newAppInstance = loadedApp.createNewInstance();
		newAppInstance.run(null, function(createdApp) {
			createdApp.setAppProperties({
				GroupName: group.Name,
				GroupID: group.ID,
				TotalUsers: group.UsersInGroup,
				prePage: app.getAppProperty("prePage")
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
function onSmsGetTotalUserBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTotalUser = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsGetTotalUserReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTotalUser = e.control;
	hideLoading();
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsGetGroupsBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetGroups = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsGetGroupsReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetGroups = e.control;
	hideLoading();
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsGetUserCountInGroupBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetUserCountInGroup = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsGetUserCountInGroupReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetUserCountInGroup = e.control;
	hideLoading();
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsGetBacklistBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetBacklist = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsGetBacklistReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetBacklist = e.control;
	hideLoading();
}


/*
 * Triggered when GroupRowClick event is fired from User Defined Control.
 */
function onMyInfoRowGroupRowClick(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.Common.MyInfoRow
	 */
	var myInfoRow = e.control;
	var dialogProp = {
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		headerVisible : false,
	};
	app.openDialog("app/mobile/Admin/MealManagement/MealDetail", dialogProp, function(loadedApp) {
		loadedApp.style.animateFrom({	
			"transform": "translateX(100%)",
			"opacity": "0"
		}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
		var user = auth.getAuthenticatedUser();
		loadedApp.addEventListenerOnce("init", function () {
			loadedApp.setAppProperties({
				UserID: user.UserID,
				UserName: user.Name,
				CurrentTime: moment().format("YYYY-MM")
			});
		})
	});
}


/*
 * Triggered when init event is fired from Body.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(/* cpr.events.CEvent */ e){
	app.lookup("header").setAppProperties({
		pageName: cpr.I18N.INSTANCE.message("Str_UserList")
	});
}
