/************************************************
 * LoginDialog.js
 * Created at Aug 18, 2020 1:21:36 PM.
 *
 * @author EVN0014
 ************************************************/

var auth = cpr.core.Module.require("lib/Auth");
var config = getConfig();
var lodashModule = cpr.core.Module.require("lib/Lodash");
var dataManager;

var lodash = lodashModule._;

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};



/*
 * Triggered when click event is fired from Button.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	submit()
}

function submit() {
	var submission = app.lookup("sms_login")
	var requestData = app.lookup("dmLoginReq");
	var userID = app.lookup("ipbId").value;
	var userID = lodash.trim(app.lookup("ipbId").value);
	var customerCode = lodash.trim(app.lookup("ipbSiteCode").value);
	var password = lodash.trim(app.lookup("ipbPassword").value);

	if (lodash.isEmpty(userID) || lodash.isEmpty(customerCode) || lodash.isEmpty(password)) {
		var messages = [];

		if (lodash.isEmpty(customerCode)) {
			messages.push({
				message: cpr.I18N.INSTANCE.message("Str_Common_Login_CustomerIDRequired")
			});
		}

		if (lodash.isEmpty(userID)) {
			messages.push({
				message: cpr.I18N.INSTANCE.message("Str_Common_Login_IDRequired")
			});
		}
		if (lodash.isEmpty(password)) {
			messages.push({
				message: cpr.I18N.INSTANCE.message("Str_Common_Login_PasswordRequired")
			});
		}

		var validationError = new cpr.events.CUIEvent("ValidationError", {
			content: {
				messages: messages
			}
		});
	  	app.dispatchEvent(validationError);
	  	return;
	}
	requestData.setValue( "userId", userID);
	var userType = 1;

	if(app.lookup("ipbId").value == "Master") {
		userType = 2;
	}
	requestData.setValue( "userType", userType);
	requestData.setValue( "password", password);

	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "GET", config.licenseServerURL + customerCode, false ); // false for synchronous request
	xmlHttp.send();
	var response = xmlHttp.responseText;
	var responseObject = JSON.parse(response);

	if (responseObject.Result && responseObject.Result.ResultCode !== 0) {
		var loginFailEvent = new cpr.events.CUIEvent("loginFail", {
			content: {
				message: cpr.I18N.INSTANCE.message("Str_Common_Login_CustomerIDInvalid")
			}
		});
	  	app.dispatchEvent(loginFailEvent);
	  	return;
	}
	var serverAddress = responseObject.ServerAddress;
	// server error
	if (!serverAddress) {
		var dialogProp = {
			headerVisible : false,
			left: 30,
			right: 30,
			height: 200,
			top: 210,
			modal: true,
			resizable: false
		};
		app.getRootAppInstance().openDialog("app/mobile/dialog/NetworkError", dialogProp);
	  	return;
	}
	var serverPort = responseObject.ServerPort
	var serverURL = serverPort && serverPort > 0
		? "http://" + serverAddress + ":" + serverPort + "/v1"
		: "http://" + serverAddress + "/v1";

	localStorage.setItem("alpetaCustomerId", customerCode);
	localStorage.setItem("alpetaServerAddress", serverURL);

	submission.setRequestActionUrl(serverURL + submission.action);
	submission.send();
}

var hidePassword = true;
/*
 * Triggered when click event is fired from Image.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onImageClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Image
	 */
	var image = e.control;
	hidePassword = !hidePassword;
	if (hidePassword) {
		image.src = "/theme/images/mobile/common_textfield_icon_hide.png";
		app.lookup("ipbPassword").secret = true;
	} else {
		image.src = "/theme/images/mobile/common_textfield_icon_show.png";
		app.lookup("ipbPassword").secret = false;
	}
}


/*
 * Triggered when submit-timeout event is fired from Submission.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_loginSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var sms_login = e.control;
	var dialogProp = {
		headerVisible : false,
		left: 20,
		right: 20,
		height: 250,
		modal: true,
		resizable: false
	};
	app.openDialog("app/mobile/dialog/NetworkError", dialogProp);
}


/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_loginSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var sms_login = e.control;
	var dialogProp = {
		headerVisible : false,
		left: 30,
		right: 30,
		height: 200,
		top: 210,
		modal: true,
		resizable: false
	};
	app.getRootAppInstance().openDialog("app/mobile/dialog/NetworkError", dialogProp);
}


/*
 * Triggered when submit-success event is fired from Submission.
 * 통신이 성공하면 발생합니다.
 */
function onSms_loginSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var sms_login = e.control;
	var loggedUser = app.lookup("AccountInfo");
	var result = app.lookup("Result");
	var systeminfo = app.lookup("SystemInfo");

	if( result.getValue("ResultCode") == 0) {
		loggedUser.setValue("FirstLoginFlag", 1);
		dataManager = getDataManager();
		dataManager.setSystemInfo(systeminfo);

		var loginSuccess = new cpr.events.CUIEvent("loginSuccess", {
			content: {
				password: app.lookup("ipbPassword").value,
				accountInfo: app.lookup("AccountInfo")
			}
		});
	  	app.dispatchEvent(loginSuccess);
	} else {
		var loginFailEvent = new cpr.events.CUIEvent("loginFail");
	  	app.dispatchEvent(loginFailEvent);
	}
}



/*
 * Triggered when focus event is fired from InputBox.
 * 컨트롤이 포커스를 획득한 후 발생하는 이벤트.
 */
function onIpbSiteCodeFocus(/* cpr.events.CFocusEvent */ e){
	/**
	 * @type cpr.controls.InputBox
	 */
	var ipbSiteCode = e.control;
	var formFocus = new cpr.events.CUIEvent("formFocus");
  	app.dispatchEvent(formFocus);
}


/*
 * Triggered when focus event is fired from InputBox.
 * 컨트롤이 포커스를 획득한 후 발생하는 이벤트.
 */
function onIpbIdFocus(/* cpr.events.CFocusEvent */ e){
	/**
	 * @type cpr.controls.InputBox
	 */
	var ipbId = e.control;
	var formFocus = new cpr.events.CUIEvent("formFocus");
  	app.dispatchEvent(formFocus);
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
	var formFocus = new cpr.events.CUIEvent("formFocus");
  	app.dispatchEvent(formFocus);
}


/*
 * Triggered when keydown event is fired from InputBox.
 * 사용자가 키를 누를 때 발생하는 이벤트.
 */
function onIpbSiteCodeKeydown(/* cpr.events.CKeyboardEvent */ e){
	/**
	 * @type cpr.controls.InputBox
	 */
	var ipbSiteCode = e.control;
	var customerCode = lodash.trim(app.lookup("ipbSiteCode").value);
	if (e.key === "Enter" && !lodash.isEmpty(customerCode)) {
		ipbSiteCode.blur();
		app.lookup("ipbId").focus();
	}
}


/*
 * Triggered when keydown event is fired from InputBox.
 * 사용자가 키를 누를 때 발생하는 이벤트.
 */
function onIpbIdKeydown(/* cpr.events.CKeyboardEvent */ e){
	/**
	 * @type cpr.controls.InputBox
	 */
	var userID = lodash.trim(app.lookup("ipbId").value);
	var ipbId = e.control;
	if (e.key === "Enter" && !lodash.isEmpty(userID)) {
		ipbId.blur();
		app.lookup("ipbPassword").focus();
	}
}


/*
 * Triggered when keydown event is fired from InputBox.
 * 사용자가 키를 누를 때 발생하는 이벤트.
 */
function onIpbPasswordKeydown(/* cpr.events.CKeyboardEvent */ e){
	/**
	 * @type cpr.controls.InputBox
	 */
	var password = lodash.trim(app.lookup("ipbPassword").value);
	var ipbPassword = e.control;
	if (e.key === "Enter" && !lodash.isEmpty(password)) {
		ipbPassword.blur();
		submit();
	}
}
