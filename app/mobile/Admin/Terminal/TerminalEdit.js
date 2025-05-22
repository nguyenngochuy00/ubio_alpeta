/************************************************
 * TerminalEdit.js
 * Created at Oct 7, 2020 4:18:16 PM.
 *
 * @author EVN0025
 ************************************************/

var config = getConfig();
var isAutimating = false;

function render() {
	app.lookup("pageName").value = app.lookup("TerminalInfo").getValue("Name");
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
}

/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	app.getAppProperty("TerminalInfo").copyToDataMap(app.lookup("TerminalInfo"));
	app.getAppProperty("TerminalApbAreaInfo").copyToDataMap(app.lookup("TerminalApbAreaInfo"));
	app.getAppProperty("TerminalImage").copyToDataMap(app.lookup("TerminalImage"));
	render();
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

function goBackToTerminalPage(e) {
	
//	if (isAutimating) {
//		e.preventDefault();
//		return;
//	}
//	isAutimating = true;
//	cpr.core.App.load("app/mobile/Admin/Terminal/Terminal", function(loadedApp){
//		var terminalId = app.lookup("TerminalInfo").getValue("ID");
//		var terminalName = app.lookup("TerminalInfo").getValue("Name");
//		var newApp = loadedApp.createNewInstance();
//		newApp.run(null, function (createdApp) {
//			createdApp.setAppProperties({
//				ID: terminalId,
//				TerminalName: terminalName
//			});
//			app.close();
//			isAutimating = false;
//		});
//	});
}

/*
 * Triggered when click event is fired from Output "저장"(updateTerminalBtn).
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUpdateTerminalBtnClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var updateTerminalBtn = e.control;
	app.lookup("TerminalInfo").setValue("Name", app.lookup("terminalName").value);
	var smsUpdateTerminal = app.lookup("smsUpdateTerminal");
	smsUpdateTerminal.setRequestActionUrl(config.apiHostResolution() + smsUpdateTerminal.action + app.lookup("TerminalInfo").getValue("ID"));		
	smsUpdateTerminal.send();
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsUpdateTerminalSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUpdateTerminal = e.control;
	handleUnauthorize(app);
	if (app.lookup("Result").getValue("ResultCode") === 0) {
		app.close();
	}
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsUpdateTerminalBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUpdateTerminal = e.control;
	showloading()
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsUpdateTerminalReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUpdateTerminal = e.control;
	hideLoading();
}
