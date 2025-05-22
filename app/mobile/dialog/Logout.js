/************************************************
 * Logout.js
 * Created at Sep 3, 2020 1:14:03 PM.
 *
 * @author EVN0025
 ************************************************/
var Auth = cpr.core.Module.require("lib/Auth");
var isAutimating = false;

/*
 * Triggered when click event is fired from Output "취소"(cancelBtn).
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onCancelBtnClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var cancelBtn = e.control;
	app.close();
}


/*
 * Triggered when click event is fired from Output "취소"(endBtn).
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onEndBtnClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var endBtn = e.control;
	var logoutSub = app.lookup("logout");
	var config = getConfig();
	logoutSub.setRequestActionUrl(config.apiHostResolution() + logoutSub.action);
	logoutSub.send()		
}


/*
 * Triggered when submit-success event is fired from Submission.
 * 통신이 성공하면 발생합니다.
 */
function onLogoutSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var logout = e.control;
	if (isAutimating) {
		e.preventDefault();
		return;
	}
	localStorage.removeItem("alpetaCustomerId");
	localStorage.removeItem("alpetaServerAddress");
	isAutimating = true;
	
	
	if (window.webkit) {
		window.webkit.messageHandlers.authMessageHandler.postMessage(JSON.stringify({
			event: "LOGOUT",
		}));
		console.log("LOGIN_LOGOUT sent");
	}

	if (window.authMessageHandler) {
		window.authMessageHandler.postMessage(JSON.stringify({
			event: "LOGOUT",
		}));
		console.log("LOGIN_LOGOUT sent");
	}
	
	Auth.logout();
	cpr.core.App.load("app/mobile/Login", function(newapp) {
		newapp.createNewInstance().run(null, function (createdApp) {
			isAutimating = false;
			createdApp.getContainer().style.animateFrom({	
				"transform": "translateX(-100%)",
				"opacity": "0"
			}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
			app.getRootAppInstance().close();
		});				
	});
}


/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onLogoutSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var logout = e.control;
	Auth.logout();
	cpr.core.App.load("app/mobile/Login", function(newapp) {
		app.getRootAppInstance().close();
		newapp.createNewInstance().run();				
	});
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onLogoutBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var logout = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onLogoutReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var logout = e.control;
	hideLoading();
}
