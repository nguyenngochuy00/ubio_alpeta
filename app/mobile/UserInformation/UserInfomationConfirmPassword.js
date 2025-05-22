/************************************************
 * UserInfomationConfirmPassword.js
 * Created at Sep 1, 2020 2:45:47 PM.
 *
 * @author EVN0025
 ************************************************/
var updateLoginPasswordSending = false;
var auth = cpr.core.Module.require("lib/Auth");
var lodashModule = cpr.core.Module.require("lib/Lodash");
var lodash = lodashModule._;
var dataManager = getDataManager();

function submit() {
	if(!app.lookup("ipbPassword").value) {
		return;
	}
	var config = getConfig();
	var accountInfo = dataManager.getAccountInfo() || auth.getAuthenticatedUser();
	var UserPasswordInfo = app.lookup("UserPasswordInfo");
	var userId = parseInt(accountInfo.UserID, 10);
	var password = lodash.trim(app.lookup("ipbPassword").value);
	UserPasswordInfo.setValue("ID", userId);
	UserPasswordInfo.setValue("CurrentPassword", password);
	UserPasswordInfo.setValue("NewPassword", password);
	var updateLoginPasswordSub = app.lookup("updateLoginPasswordSub");
	updateLoginPasswordSub.setRequestActionUrl(config.apiHostResolution() + updateLoginPasswordSub.action.replace("{id}", userId));
	updateLoginPasswordSub.send();
}

/*
 * Triggered when click event is fired from Output "확인".
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onOutputClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Output
	 */
	var output = e.control;
	submit();
}


/*
 * Triggered when submit-success event is fired from Submission.
 * 통신이 성공하면 발생합니다.
 */
function onUpdateLoginPasswordSubSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var updateLoginPasswordSub = e.control;
	var dataManager = getDataManager();
	var userInfo = app.getAppProperty("userInfo");
	var resultCode = app.lookup("Result").getValue("ResultCode");
	var currentPassword = app.lookup("ipbPassword").value;
	// success
	if (resultCode === 0) {
		cpr.core.App.load("app/mobile/UserInformation/ModifyUserInformationScreen", function(newapp) {
			var newAppInstance = newapp.createNewInstance();
			newAppInstance.run(null, function(createdApp) {
				createdApp.setAppProperties({
					userInfo: userInfo,
					currentPassword: currentPassword
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
	app.lookup("wrongPasswordMessage").visible = true;
}


/*
 * Triggered when init event is fired from Body.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(/* cpr.events.CEvent */ e){
	auth.isAuthenticated(app);
}


/*
 * Triggered when focus event is fired from InputBox.
 * 컨트롤이 포커스를 획득한 후 발생하는 이벤트.
 */
function onIpbPasswordFocus(/* cpr.events.CFocusEvent */ e){
	/**
	 * @type cpr.controls.InputBox
	 */
	var ipbPassword = e.control;
	app.lookup("wrongPasswordMessage").visible = false;
}


/*
 * Triggered when keydown event is fired from InputBox.
 * 사용자가 키를 누를 때 발생하는 이벤트.
 */
function onIpbPasswordKeydown(/* cpr.events.CKeyboardEvent */ e){
	/**
	 * @type cpr.controls.InputBox
	 */
	var ipbPassword = e.control;
	if (e.key === "Enter" && lodash.trim(app.lookup("ipbPassword").value)) {
		ipbPassword.blur();
		submit();
	}

}


/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onUpdateLoginPasswordSubSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var updateLoginPasswordSub = e.control;
	auth.logout(app);
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onUpdateLoginPasswordSubSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var updateLoginPasswordSub = e.control;
	handleUnauthorize(app);
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onUpdateLoginPasswordSubBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var updateLoginPasswordSub = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onUpdateLoginPasswordSubReceive(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var updateLoginPasswordSub = e.control;
	hideLoading();
}


/*
 * Triggered when leftBtnClick event is fired from User Defined Control.
 */
function onHeaderLeftBtnClick(/* cpr.events.CUIEvent */ e){
	/**
	 * @type udc.Header
	 */
	var header = e.control;
	cpr.core.App.load("app/mobile/UserInformation/UserInformation", function(loadedApp){
		loadedApp.createNewInstance().run();
		app.close()
	});
}


/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	app.lookup("header").setAppProperties({
		pageName: cpr.I18N.INSTANCE.message("Str_UserInfo")
	});
}
