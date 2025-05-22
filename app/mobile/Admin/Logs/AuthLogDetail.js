/************************************************
 * AuthLogDetail.js
 * Created at Oct 20, 2020 1:30:04 PM.
 *
 * @author EVN0025
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var utils = cpr.core.Module.require("lib/Utils");
var config = getConfig();
var isAutimating = false;
var nextBtnClicked;
var preBtnClicked;
var isLoading;


function hasNext() {
	return app.getAppProperty("index") > 0;
}

function hasPre() {
	return app.getAppProperty("index") < app.getAppProperty("total") - 1
}

function render() {
	if (!hasNext()) {
		app.lookup("nextLog").style.css({
			"background-color": "#BFBFBF",
		});
	}
	if (!hasPre()) {
		app.lookup("preLog").style.css({
			"background-color": "#BFBFBF",
		});
	}
	
	app.lookup("authMethod").value = utils.getAuthTypeString(app.lookup("AuthLogDetail").getValue("AuthType"));
	app.lookup("authTime").value = moment(app.lookup("AuthLogDetail").getValue("EventTime"), "YYYY-MM-DD HH:mm:ss").format("YYYY.MM.DD HH:mm:ss");
	app.lookup("cardNumb").value = app.lookup("AuthLogDetail").getValue("Card");
	app.lookup("ALVEW_cmbAuthResult").value = app.lookup("AuthLogDetail").getValue("AuthResult");
	app.lookup("userID").value = app.lookup("AuthLogDetail").getValue("UserID");
	app.lookup("userName").value = app.lookup("UserInfo").getValue("Name");
	app.lookup("functionKey").value = utils.getAuthFunctionKey(app.lookup("AuthLogDetail").getValue("Func"));
	app.lookup("functionType").value = utils.getAuthFunctionType(app.lookup("AuthLogDetail").getValue("FuncType"));
	if (app.lookup("UserInfo").getValue("Name")) {
		app.lookup("pageName").value = app.lookup("UserInfo").getValue("Name");
	}
	if (app.lookup("AuthLogDetail").getValue("UserImage")) {
		app.lookup("userImage").src = "data:image/png;base64," + app.lookup("AuthLogDetail").getValue("UserImage");
		app.lookup("userImage").style.css({
			"border-radius": "50px"
		})
	} else {
		app.lookup("userImage").src = "/theme/images/mobile/common_img_profile_blank_gray_human@3x.png"
	}
}

function sendSmsAuthLogDetail(offset) {
	var smsAuthLogDetail = app.lookup("smsAuthLogDetail");
	smsAuthLogDetail.setRequestActionUrl(config.apiHostResolution() + smsAuthLogDetail.action + "/" + app.getAppProperty("authLogIndex"));		
	if (offset) {
		if (offset === 1 && !hasNext() ) {
			return;
		}
		
		if (offset === -1 && !hasPre()) {
			return;
		} 
		smsAuthLogDetail.setParameters("offset", offset);	
	}
	app.setAppProperty("index", app.getAppProperty("index") - offset);

	if (app.getAppProperty("terminalID")) {
		smsAuthLogDetail.setParameters("searchCategory", "terminal_id");
		smsAuthLogDetail.setParameters("searchKeyword", app.getAppProperty("terminalID"));
	}
	app.lookup(app.getAppProperty("terminalID"))
	if (app.getAppProperty("condition")) {
		smsAuthLogDetail.setParameters("searchCategory", app.getAppProperty("condition").key);
		smsAuthLogDetail.setParameters("searchKeyword", app.getAppProperty("condition").value);
	}
	smsAuthLogDetail.send();
}

/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){	
	dataManager = getDataManager();
	if (app.getAppProperty("terminalName")) {
		app.lookup("pageName").value = app.getAppProperty("terminalName");
	}
	initControl();
	sendSmsAuthLogDetail(0);
	render()
}
function initControl(){
	var cmbAuthResult = app.lookup("ALVEW_cmbAuthResult");
	if (cmbAuthResult) {
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_Success"), AuthLogResultSuccess));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultFail"), AuthLogResultFail));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultAccessDenied"), AuthLogResultAccessDenied));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeout"), AuthLogResultTimeout));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeoutCapture"), AuthLogResultTimeoutCapture));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeoutIdentify"), AuthLogResultTimeoutIdentify));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultAntiPassback"), AuthLogResultAntiPassback));	
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultDuress"), AuthLogResultDuress));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultBlackList"), AuthLogResultBlackList));
		
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultUnregistUser"), AuthLogResultInvalidUser));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultFPCaptureFailed"), AuthLogResultCapture));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultDuplicatedAuth"), AuthLogResultDuplicatedAuthentication));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultNetworkError"), AuthLogResultNetwork));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultServerBusy"), AuthLogResultServerBusy));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultFaceDetectionFailed"), AuthLogResultFaceDetection));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailMealPay"), AuthLogResultFailMealPay));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailMealTime"), AuthLogResultFailMealTime));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailNotExistsMealCode"), AuthLogResultFailNotExistsMealCode));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailPeriod"), AuthLogResultFailPeriod));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailMealLimit"), AuthLogResultFailMealLimit));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailDayLimit"), AuthLogResultFailDayLimit));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailMonthLimit"), AuthLogResultFailMonthLimit));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultSoftpassback"), AuthLogResultSoftpassback));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultNoMask"), AuthLogResultNoMask));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFeverDetection"), AuthLogResultFeverDetection));
	}
}

/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsAuthLogDetailSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsAuthLogDetail = e.control;
	handleUnauthorize(app);
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode !== 0) {
		return;
	}
	
	app.setAppProperty("authLogIndex", app.lookup("AuthLogDetail").getValue("IndexKey"));
	render();
	if (!!app.lookup("AuthLogDetail").getValue("UserID")) {
		var smsUserInfoReq = app.lookup("smsUserInfoReq");
		smsUserInfoReq.action = "/users/" + app.lookup("AuthLogDetail").getValue("UserID");
		smsUserInfoReq.setRequestActionUrl(config.apiHostResolution() + smsUserInfoReq.action);		
		smsUserInfoReq.send();
	}
	
	if (!!app.lookup("AuthLogDetail").getValue("TerminalID")) {
		app.lookup("TerminalImage").reset();
		var smsGetTerminalInfomation = app.lookup("smsGetTerminalInfomation");
		smsGetTerminalInfomation.setRequestActionUrl(config.apiHostResolution() + smsGetTerminalInfomation.action + "/" + app.lookup("AuthLogDetail").getValue("TerminalID"));		
		smsGetTerminalInfomation.addParameter("apbflag", false);		
		smsGetTerminalInfomation.addParameter("imageflag", true);		
		smsGetTerminalInfomation.send();
	}
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
	if (app.lookup("Result").getValue("ResultCode") !== 0) {
		return;
	}
	render();
}


/*
 * Triggered when click event is fired from Output "다음로그"(nextLog).
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onNextLogClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var nextLog = e.control;
	if (isLoading) {
		return;
	}
	sendSmsAuthLogDetail(1);
	app.lookup("preLog").style.css({
		"background-color": "#006938"
	});
	nextBtnClicked = true;
	preBtnClicked = false;
}


/*
 * Triggered when click event is fired from Output "이전로그"(preLog).
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onPreLogClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var preLog = e.control;
	if (isLoading) {
		return;
	}
	sendSmsAuthLogDetail(-1);
	app.lookup("nextLog").style.css({
		"background-color": "#006938"
	})
	nextBtnClicked = false;
	preBtnClicked = true;
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsAuthLogDetailBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsAuthLogDetail = e.control;
	showloading()
	isLoading = true;
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsAuthLogDetailReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsAuthLogDetail = e.control;
	hideLoading();
	isLoading = false;
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


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetTerminalInfomationSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTerminalInfomation = e.control;
	app.lookup("terminalName").value = app.lookup("TerminalInfo").getValue("Name");
	app.lookup("terminalID").value = app.lookup("TerminalInfo").getValue("ID");
	
	app.lookup("terminalType").value = getTerminalModelString(app.lookup("TerminalInfo").getValue("Type"));
	var image = app.lookup("TerminalImage").getValue("ImageData")
	
	if (image) {
		app.lookup("terminalImage").src = "data:image/" + image.FileType + ";base64," + app.lookup("TerminalImage").getValue("ImageData");
		app.lookup("terminalImage").style.css({
			"border-radius": "5px"
		});
	} else {
		app.lookup("terminalImage").src = "/theme/images/mobile/common_img_profile_blank_gray_device@3x.png"
	}
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
