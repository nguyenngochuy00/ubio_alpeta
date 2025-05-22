/************************************************
 * Logout.js
 * Created at Sep 3, 2020 1:14:03 PM.
 *
 * @author EVN0025
 ************************************************/
var Auth = cpr.core.Module.require("lib/Auth");
var isAutimating = false;
var currentOS;

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
	var mobile = (/iphone|ipad|ipod|android/i.test(navigator.userAgent.toLowerCase()));
	if (mobile) {
		var userAgent = navigator.userAgent.toLowerCase();
		if (userAgent.search("android") > -1) {
		currentOS = "android";
			location.href="market://details?id=kr.co.unioncomm.ubioalpetamobile";
			} else if ((userAgent.search("iphone") > -1) || (userAgent.search("ipod") > -1) || (userAgent.search("ipad") > -1)) {
			currentOS = "ios";
			location.href="itms-appss://apps.apple.com/kr/app/ubio-alpeta/id1588335042";
			}
	} else {
	// 모바일이 아닐 때
	currentOS = "Not Mobile App";
}
	app.close();
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
	isAutimating = true;
	
	
	if (window.webkit) {
		window.webkit.messageHandlers.authMessageHandler.postMessage(JSON.stringify({
			event: "LOGOUT",
		}));
	}

	if (window.authMessageHandler) {
		window.authMessageHandler.postMessage(JSON.stringify({
			event: "LOGOUT",
		}));
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
