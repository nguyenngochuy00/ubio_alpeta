/************************************************
 * Terminal.js
 * Created at Sep 21, 2020 1:42:06 PM.
 *
 * @author EVN0025
 ************************************************/

var config = getConfig();
var auth = cpr.core.Module.require("lib/Auth");
var isAutimating = false;


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetTerminalInfomationSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTerminalInfomation = e.control;
	handleUnauthorize(app);
	if (app.lookup("Result").getValue("ResultCode") !== 0) {
		return;
	}
	
	app.lookup("terminalName").value = app.lookup("TerminalInfo").getValue("Name");
	app.lookup("terminalID").value = app.lookup("TerminalInfo").getValue("ID");
	app.lookup("terminalVersion").value = app.lookup("TerminalInfo").getValue("Version");
	app.lookup("terminalIP").value = app.lookup("TerminalInfo").getValue("IPAddress");
	
	app.lookup("terminalType").value = getTerminalModelString(app.lookup("TerminalInfo").getValue("Type"));
	var image = app.lookup("TerminalImage").getValue("ImageData")
	if (image) {
		app.lookup("terminalImage").src = "data:image/" + image.FileType + ";base64," + app.lookup("TerminalImage").getValue("ImageData");
		app.lookup("terminalImage").style.css({
			"border-radius": "5px"
		});
	}
	app.lookup("navigationBar").setAppProperty("rightIconVisible", true);
}


/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsGetTerminalInfomationSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTerminalInfomation = e.control;
	auth.logout(app);
}



/*
 * Triggered when rightBtnClick event is fired from User Defined Control.
 */
function onNavigationBarRightBtnClick(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.NavigationBar
	 */
	var navigationBar = e.control;
	if (isAutimating) {
		e.preventDefault();
		return;
	}
	isAutimating = true;
	var TerminalInfo = app.lookup("TerminalInfo");
	var TerminalApbAreaInfo = app.lookup("TerminalApbAreaInfo");
	var TerminalImage = app.lookup("TerminalImage");
//	cpr.core.App.load("app/mobile/Admin/Terminal/TerminalEdit", function(loadedApp){
//	
//		var newApp = loadedApp.createNewInstance();
//		newApp.run(null, function (createdApp) {
//			createdApp.setAppProperties({
//				TerminalInfo: TerminalInfo,
//				TerminalApbAreaInfo: TerminalApbAreaInfo,
//				TerminalImage: TerminalImage,
//			});
//			app.close();
//			isAutimating = false;
//		});
//	});


	var dialogProp = {
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		headerVisible : false,
	};
	app.openDialog("app/mobile/Admin/Terminal/TerminalEdit", dialogProp, function(loadedApp) {
		loadedApp.addEventListenerOnce("init", function () {
			loadedApp.setAppProperties({
				TerminalInfo: TerminalInfo,
				TerminalApbAreaInfo: TerminalApbAreaInfo,
				TerminalImage: TerminalImage,
			});
		})
		
		loadedApp.addEventListener("close", function(e){
			var smsGetTerminalInfomation = app.lookup("smsGetTerminalInfomation");
			smsGetTerminalInfomation.removeAllParameters();
			smsGetTerminalInfomation.setRequestActionUrl(config.apiHostResolution() + smsGetTerminalInfomation.action + "/" + app.getAppProperty("ID"));
			smsGetTerminalInfomation.addParameter("apbflag", true);		
			smsGetTerminalInfomation.addParameter("imageflag", true);		
			smsGetTerminalInfomation.send()
			
			isAutimating = false;
		});
	});
}


/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var smsGetTerminalInfomation = app.lookup("smsGetTerminalInfomation");
	smsGetTerminalInfomation.setRequestActionUrl(config.apiHostResolution() + smsGetTerminalInfomation.action + "/" + app.getAppProperty("ID"));
	smsGetTerminalInfomation.addParameter("apbflag", true);		
	smsGetTerminalInfomation.addParameter("imageflag", true);		
	smsGetTerminalInfomation.send()
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsGetTerminalInfomationBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTerminalInfomation = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsGetTerminalInfomationReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTerminalInfomation = e.control;
	hideLoading();
}


/*
 * Triggered when leftBtnClick event is fired from User Defined Control.
 */
function onNavigationBarLeftBtnClick(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.NavigationBar
	 */
	var navigationBar = e.control;
	app.close();
}
