/************************************************
 * Login.js
 * Created at Aug 13, 2020 3:26:18 PM.
 *
 * @author EVN0025
 ************************************************/

var dataManager = getDataManager();
var config = getConfig();

/*
 * Triggered when loginFail event is fired from User Defined Control.
 */
function onLoginDialogLoginFail(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.LoginDialog
	 */
	var loginDialog = e.control;
	app.lookup("authMessageContent").value = "ID 또는 PW가 정확하지 않습니다. 다시 확인 하시고 로그인 해주세요.";
	app.lookup("authMessage").visible = true;
}


/*
 * Triggered when loginSuccess event is fired from User Defined Control.
 */
function onLoginDialogLoginSuccess(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.LoginDialog
	 */
	var loginDialog = e.control;
	var accountInfo = e.content.accountInfo;
	var password = e.content.password;
	
	localStorage.setItem('accountInfo', JSON.stringify(accountInfo.getDatas()))
	dataManager.setAccountInfo(accountInfo.getDatas());
	if (window.webkit) {
		window.webkit.messageHandlers.authMessageHandler.postMessage(JSON.stringify({
			event: "LOGIN_SUCCESS",
			accountInfo: accountInfo.getDatas()
		}));
		console.log("LOGIN_SUCCESS sent");
	}
	if (window.authMessageHandler) {
		window.authMessageHandler.postMessage(JSON.stringify({
			event: "LOGIN_SUCCESS",
			accountInfo: accountInfo.getDatas()
		}));
		console.log("LOGIN_SUCCESS sent");
	}
	app.lookup("authMessage").visible = false;
	var submission = app.lookup("smsUserInfoReq");
	var visitorAccount = {
		userId: accountInfo.getValue("UserID"),
		password: password
	}
	var data = JSON.stringify(visitorAccount);
	
	
 
	var xhr = new XMLHttpRequest();
	xhr.withCredentials = true;
	
	xhr.addEventListener("readystatechange", function() {
	  if(this.readyState === 4) {
  		 var submission = app.lookup("smsUserInfoReq");
		submission.setParameters("fingerprint", "false");
		submission.setParameters("face", "false");
		submission.setParameters("picture", "true");
		submission.action = "/users/" + accountInfo.getValue("UserID");
		submission.setRequestActionUrl(config.apiHostResolution() + submission.action);		
		submission.send();
	  }
	});
	xhr.open("POST", config.apiHostResolution() + "/visit/login");
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.send(data);
}


/*
 * Triggered when networkError event is fired from User Defined Control.
 */
function onLoginDialogNetworkError(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.LoginDialog
	 */
	var loginDialog = e.control;
	var dialogProp = {
		headerVisible : false,
		left: 20,
		right: 20,
		height: 200,
		modal: true,
		resizable: false
	};
	app.openDialog("app/mobile/dialog/NetworkError", dialogProp);
}

function buildStringMessage(messages) {
	var content = "";
	messages.forEach(function(item) {
		content = content + item.message + "\n"
	})
	return content;
}


/*
 * Triggered when ValidationError event is fired from User Defined Control.
 */
function onLoginDialogValidationError(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.LoginDialog
	 */
	var loginDialog = e.control;
	var content = e.content;
	var errorMessageEl = app.lookup("authMessage");
	var errorMessageContentEl = app.lookup("authMessageContent");
	errorMessageContentEl.value = buildStringMessage(content.messages);
	errorMessageEl.visible = true;
}


/*
 * Triggered when formFocus event is fired from User Defined Control.
 */
function onLoginDialogFormFocus(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.LoginDialog
	 */
	var loginDialog = e.control;
	var errorMessageEl = app.lookup("authMessage");
	var errorMessageContentEl = app.lookup("authMessageContent");
	errorMessageEl.visible = false;
	errorMessageContentEl.value = "";
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
	var userInfo = app.lookup("UserInfo");
	if (app.lookup("Result").getValue("ResultCode") === 0) {
		cpr.core.App.load("mobile/MainPage", function(loadedApp){
			loadedApp.createNewInstance().run(null, function(createdApp) {
				createdApp.setAppProperties({
					userInfo: userInfo
				});
				createdApp.getContainer().style.animateFrom({	
					"transform": "translateX(100%)",
					"opacity": "0"
				}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
				app.close();
			})
		});
	}
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
