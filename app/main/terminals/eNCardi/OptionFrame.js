/************************************************
 * terminalInfoFrame.js
 * Created at 2018. 11. 14. 오후 1:11:57.
 *
 * @author wonki
 ************************************************/

var terminalID;
var isInitNetworkOption = false;
var isInitSystemOption = false;
var isInitDisplayOption = false;
var isInitSettingOption = false;
var dataManager = cpr.core.Module.require("lib/DataManager");
var usint_version;	
var util = cpr.core.Module.require("lib/util");
var comLib;

exports.getTerminalID = function() {
	return terminalID;
}

exports.getNetworkOptionData = function() {
	if (isInitNetworkOption == false) return null;
	var netOptionData = app.lookup("NetworkInfo");
	return netOptionData;
}

exports.setNetworkOptionData = function(/*cpr.data.DataMap*/data) {
	var netOptionData = app.lookup("NetworkInfo");
	data.copyToDataMap(netOptionData);
	
	if (isInitNetworkOption == false) {
		var initOptionData = app.lookup("InitNetworkInfo");
		data.copyToDataMap(initOptionData);
		isInitNetworkOption = true;
	}
}

exports.getSystemOptionData = function() {
	if (isInitSystemOption == false) return null;
	var sysOptionData = app.lookup("SystemInfo");
	return sysOptionData;
}

exports.setSystemOptionData = function(/*cpr.data.DataMap*/data) {
	var sysOptionData = app.lookup("SystemInfo");
	data.copyToDataMap(sysOptionData);
	
	if (isInitSystemOption == false) {
		var initOptionData = app.lookup("InitSystemInfo");
		data.copyToDataMap(initOptionData);
		isInitSystemOption = true;
	}
}

exports.getDisplayOptionData = function() {
	if (isInitDisplayOption == false) return null;
	var displayOptionData = app.lookup("DisplayInfo");
	return displayOptionData;
}

exports.setDisplayOptionData = function(/*cpr.data.DataMap*/data) {
	var displayOptionData = app.lookup("DisplayInfo");
	data.copyToDataMap(displayOptionData);
	
	if (isInitDisplayOption == false) {
		var initOptionData = app.lookup("InitDisplayInfo");
		data.copyToDataMap(initOptionData);
		isInitDisplayOption = true;
	}
}

exports.getSettingOptionData = function() {
	if (isInitSettingOption == false) return null;
	var settingOptionData = app.lookup("SettingInfo");
	return settingOptionData;
}

exports.setSettingOptionData = function(/*cpr.data.DataMap*/data) {
	var settingOptionData = app.lookup("SettingInfo");
	data.copyToDataMap(settingOptionData);
	
	//console.log("exports.setSettingOptionData = " + JSON.stringify(settingOptionData.getDatas()));
	
	if (isInitSettingOption == false) {
		var initOptionData = app.lookup("InitSettingInfo");
		data.copyToDataMap(initOptionData);
		isInitSettingOption = true;
	}
}

exports.getSettingOptionWiegandInData = function() {
	var WiegandInData = app.lookup("WiegandInInfo");
	return WiegandInData;
}

exports.setSettingOptionWiegandInData = function(/*cpr.data.DataMap*/data) {
	var WiegandInData = app.lookup("WiegandInInfo");
	data.copyToDataMap(WiegandInData);
	
}

exports.getSettingOptionWiegandOutData = function() {
	var WiegandOut = app.lookup("WiegandOutInfo");
	return WiegandOut;
}

exports.setSettingOptionWiegandOutData = function(/*cpr.data.DataMap*/data) {
	var WiegandOutData = app.lookup("WiegandOutInfo");
	data.copyToDataMap(WiegandOutData);
}

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var hostAppIns = app.getHostAppInstance();	
	dataManager = getDataManager();	
	usint_version = dataManager.getSystemVersion();
	comLib = createComUtil(app);
	
	if (hostAppIns) {
		var initValue = app.getHost().initValue;
		var requestData = app.lookup("sms_get_terminal_info");
		
		terminalID = initValue["TerminalID"];
		requestData.action = "/v1/terminals/" + terminalID;
		console.log(requestData.action);
		
		requestData.send();
	} 
}

function changePage(selectedButton) {
	var emb = app.lookup("TM_INN_embPage");
	var embAppIns = emb.getEmbeddedAppInstance();
	if (embAppIns) {
		var Result = embAppIns.hasAppMethod("requestSetData");
		embAppIns.callAppMethod("requestSetData");
	}
	
	var grpButtons = app.lookup("TM_IN_grpButtons");
	var buttons = grpButtons.getChildren();
	var url = selectedButton.userattr("src")+ "?" + usint_version;;
	emb.app = null;
	
	cpr.core.App.load(url, function(loadedApp){
		if (!loadedApp) {
			return;
		}
		emb.app = loadedApp;
		emb.redraw();
		
		for (var i = 0; i < buttons.length; i++) {
			if (selectedButton == buttons[i]) {
				buttons[i].style.css("backgroundColor", "#E3E0DF");
				buttons[i].style.css("border-bottom", "2px black solid");		
			} else {
				buttons[i].style.removeStyle("backgroundColor");
				buttons[i].style.removeStyle("border-bottom");
			}
		}
		
	});
}


/*
 * "기본옵션" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGrpButtonsClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var grpButtons	 = e.control;
	changePage(grpButtons);
}

// 순차적으로 변경된 옵션을 확인하여 서버에 요청
// network 옵션이 변경되면 단말기가 재연결 되어야 정상통신. 네트워크는 제일 마지막에 확인하고 변경 시 단말기 연결을 끊는다. 
var idxSubMission = 0;
var OPTIONS = ["TerminalInfo", "SystemInfo", "DisplayInfo", "SettingInfo", "NetworkInfo"];
var SUB_MISSIONS = ["sms_set_terminal_info",
					"sms_set_terminal_option_system_config", 
					"sms_set_terminal_option_display_config",
					"sms_set_terminal_option_setting_config",
					"sms_set_terminal_option_network"];
var ACTIONS = ["", "/option/system", "/option/display", "/option/setting", "/option/network"];

function applyOption() {
	var count = OPTIONS.length;
	var IS_INIT = [true, isInitSystemOption, isInitDisplayOption, isInitSettingOption, isInitNetworkOption];
	
	var i;
	for (i = idxSubMission; i < count; i++) {				
		if (IS_INIT[i]) {
			var curInfo = app.lookup(OPTIONS[i]);			
			var initInfo = app.lookup("Init" + OPTIONS[i]);
			
			if (util.compareDataMap(initInfo, curInfo) == false) {
				var requestData = app.lookup(SUB_MISSIONS[i]);
				requestData.action = "/v1/terminals/" + terminalID + ACTIONS[i];
				requestData.send();
				
				console.log(requestData.action);
				break;
			}
		}
		idxSubMission++;
	}
	
	if (idxSubMission == count) {
		console.log("Set option cokpleted!!!!!!!!!!!!!!!!!!!!!!");	
		comLib.hideLoadMask();		
	}
}

/*
 * Body에서 before-unload 이벤트 발생 시 호출.
 * 앱이 언로드되기 전에 발생하는 이벤트 입니다. 취소할 수 있습니다.
 */
function onBodyBeforeUnload(/* cpr.events.CEvent */ e){
	console.log("onBodyBeforeUnload");
	return
}
//----------------------------------------------------------------------------------> sms_get_terminal_info
function onSms_get_terminal_infoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	if(ResultCode == COMERROR_NONE) {
		var terminalInfo = app.lookup("TerminalInfo");
		app.lookup("grpTerminalInfo").redraw();
		
		// 초기 데이터에 저장
		var initTerminalInfo = app.lookup("InitTerminalInfo");
		terminalInfo.copyToDataMap(initTerminalInfo);		
		
		var Type = initTerminalInfo.getValue("Type");
		var strType = getTerminalModelString(Type);
		app.lookup("TMSNC_Type").value = strType;
	} else {
		
	}
}

function onSms_get_terminal_infoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_get_terminal_infoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

//----------------------------------------------------------------------------------< end sms_get_terminal_info
//----------------------------------------------------------------------------------> sms_set_terminal_info
function onSms_set_terminal_infoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	if(ResultCode == COMERROR_NONE) {
		// 초기 데이터에 저장	
		var curInfo = app.lookup("TerminalInfo");
		var initInfo = app.lookup("InitTerminalInfo");
		curInfo.copyToDataMap(initInfo);
		
		// 다음 요청
		idxSubMission++;
		applyOption();
	} else {
		
	}
}

function onSms_set_terminal_infoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_set_terminal_infoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
//----------------------------------------------------------------------------------< end sms_set_terminal_info
//----------------------------------------------------------------------------------> sms_set_terminal_option_system_config

function onSms_set_terminal_option_system_configSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	if(ResultCode == COMERROR_NONE) {
		// 초기 데이터에 저장
		var curInfo = app.lookup("SystemInfo");
		var initInfo = app.lookup("InitSystemInfo");
		curInfo.copyToDataMap(initInfo);
		
		// 다음 요청
		idxSubMission++;
		applyOption();
	} else {
		
	}
}

function onSms_set_terminal_option_system_configSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_set_terminal_option_system_configSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

//----------------------------------------------------------------------------------< end sms_set_terminal_option_system_config
//----------------------------------------------------------------------------------> sms_set_terminal_option_display_config

function onSms_set_terminal_option_display_configSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	if(ResultCode == COMERROR_NONE) {
		// 초기 데이터 저장
		var curInfo = app.lookup("DisplayInfo");
		var initInfo = app.lookup("InitDisplayInfo");
		curInfo.copyToDataMap(initInfo);
		
		// 다음 요청
		idxSubMission++;
		applyOption();
	} else {
		
	}
	
}

function onSms_set_terminal_option_display_configSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_set_terminal_option_display_configSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);	
}
//----------------------------------------------------------------------------------< end sms_set_terminal_option_display_config
//----------------------------------------------------------------------------------> sms_set_terminal_option_setting_config

function onSms_set_terminal_option_setting_configSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	if(ResultCode == COMERROR_NONE) {
		// 초기 데이터 저장
		var curInfo = app.lookup("SettingInfo");
		var initInfo = app.lookup("InitSettingInfo");
		curInfo.copyToDataMap(initInfo);
		
		// 다음 요청
		idxSubMission++;
		applyOption();
	} else {
		
	}
}
function onSms_set_terminal_option_setting_configSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);	
}
function onSms_set_terminal_option_setting_configSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);		
}
//----------------------------------------------------------------------------------< end sms_set_terminal_option_setting_config
//----------------------------------------------------------------------------------> sms_set_terminal_option_network
function onSms_set_terminal_option_networkSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	if(ResultCode == COMERROR_NONE) {
		
		// 초기 데이터에 저장
		var curInfo = app.lookup("NetworkInfo");
		var initInfo = app.lookup("InitNetworkInfo");
		curInfo.copyToDataMap(initInfo);
		
		// 다음 요청
		idxSubMission++;
		applyOption();
	} else {
		
	}
}

function onSms_set_terminal_option_networkSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);	
}

function onSms_set_terminal_option_networkSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);			
}
//----------------------------------------------------------------------------------< end sms_set_terminal_option_network


/*
 * "" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTMSNC_btnSaveClick(/* cpr.events.CMouseEvent */ e){x
	// 현재 활성화 되어 있는 페이지의 정보를 가져온다.
	var emb = app.lookup("TM_INN_embPage");
	var embAppIns = emb.getEmbeddedAppInstance();
	if (embAppIns) {
		if (embAppIns.hasAppMethod("requestSetData")) {
			embAppIns.callAppMethod("requestSetData");
		}
	}
	
	comLib.showLoadMask("", dataManager.getString("Str_TaskStateRunning"), "");
	
	idxSubMission = 0;
	applyOption();
}

function onTMSNC_btnDeleteClick(/* cpr.events.CMouseEvent */ e){
	var terminalID = app.lookup("TerminalInfo").getValue("ID");
	var terminalInfo = app.getHostProperty("initValue");
	comLib.showLoadMask("",dataManager.getString("Str_TerminalDelete"),"",0);
	
	var sms_deleteTerminal = app.lookup("sms_deleteTerminal");
	sms_deleteTerminal.action = "/v1/terminals/" + terminalID;	
	console.log(sms_deleteTerminal.action);	
	sms_deleteTerminal.send();	
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_deleteTerminalSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	if( ResultCode == COMERROR_NONE){
		
		var terminalInfo = app.getHostProperty("initValue");
		var terminalID = terminalInfo["TerminalID"];
		var commandEvent = new cpr.events.CUIEvent("execute-command", {
			content: {
				"target": DLG_TERMINAL_MANAGEMENT,	
				"command": "Delete",
				"TerminalID": terminalID
			}
		});
	
		app.getHostAppInstance().dispatchEvent(commandEvent);
		
		app.close();				
	} else {
		comLib.hideLoadMask();
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_TerminalDelete"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(ResultCode)));
	}
}

function onSms_deleteTerminalSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_deleteTerminalSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}
