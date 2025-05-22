/************************************************
 * terminalInfoFrame.js
 * Created at 2018. 11. 14. 오후 1:11:57.
 *
 * @author wonki
 ************************************************/

var terminalID;
var util = cpr.core.Module.require("lib/util");
var dataManager = cpr.core.Module.require("lib/DataManager");
var usint_version;
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var hostAppIns = app.getHostAppInstance();	
	dataManager = getDataManager();	
	usint_version = dataManager.getSystemVersion();
	if (hostAppIns) {
		var initValue = app.getHost().initValue;
		var requestData = app.lookup("sms_get_terminal_info");
		
		terminalID = initValue["TerminalID"];
		requestData.action = requestData.action + "/" + terminalID;
		console.log(requestData.action);
		
		requestData.send();
	} 
}

exports.getTerminalID = function() {
	return terminalID;
}

exports.getUIOptionData = function() {
	var uiOptionData = app.lookup("UIOption");	
	return uiOptionData;
}

exports.setUIOptionData = function(/*cpr.data.DataMap*/data) {
	var uiOptionData = app.lookup("UIOption");
	data.copyToDataMap(uiOptionData);

//	var compare =  uiOptionData.indexOf(data)
//	console.log("before" + compare);
//	data.copyToDataMap(uiOptionData);
//	var map = uiOptionData.getDatas();
//	console.log(JSON.stringify(map))
//	var compareA = JSON.stringify(map);
//	var compareB = JSON.stringify(data.getDatas());
//	console.log("compareA","compareB", compareA,compareB)
//	console.log(compareA.indexOf(compareB))
//	
//	console.log("Frame LcdBrightness = " + uiOptionData.getString("LcdBrightness"));
}

exports.getSysOptionData = function() {
	var sysOptionData = app.lookup("SysOption");
	return sysOptionData;
}

exports.setSysOptionData = function(/*cpr.data.DataMap*/data) {
	var sysOptionData = app.lookup("SysOption");
	data.copyToDataMap(sysOptionData);
}

exports.getNetOptionData = function() {
	var netOptionData = app.lookup("NetOption");
	return netOptionData;
}

exports.setNetOptionData = function(/*cpr.data.DataMap*/data) {
	var netOptionData = app.lookup("NetOption");
	data.copyToDataMap(netOptionData);
}

exports.getDoorOptionData = function() {
	var doorOptionData = app.lookup("DoorOption");
	return doorOptionData;
}

exports.setDoorOptionData = function(/*cpr.data.DataMap*/data) {
	var doorOptionData = app.lookup("DoorOption");
	data.copyToDataMap(doorOptionData);
}

exports.getFPOptionData = function() {
	var fpOptionData = app.lookup("FPOption");
	return fpOptionData;	
}

exports.setFPOptionData = function(/*cpr.data.DataMap*/data) {
	var fpOptionData = app.lookup("FPOption");
	data.copyToDataMap(fpOptionData);	
}

function printDataMap(/*cpr.data.DataMap*/dm) {
	console.log(JSON.stringify(dm.getDatas()));
}

function changePage(selectedButton) {
	var emb = app.lookup("TMBIN_embPage");
	var embAppIns = emb.getEmbeddedAppInstance();
	if (embAppIns) {
		var Result = embAppIns.hasAppMethod("requestSetData");
		embAppIns.callAppMethod("requestSetData");
	}
	
	var grpButtons = app.lookup("TMUTN_grpButtons");
	var buttons = grpButtons.getChildren();
	var url = selectedButton.userattr("src") + "?" + usint_version;;
	emb.app = null;
	
	cpr.core.App.load(url, function(loadedApp){
		if (!loadedApp) {
			return;
		}
		emb.app = loadedApp;
		emb.redraw();
		
		for (var i = 0; i < buttons.length; i++) {
			if (selectedButton == buttons[i]) {
				//buttons[i].style.css("backgroundColor", "#E3E0DF");
				//buttons[i].style.css("border-bottom", "2px black solid");
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

/*
 * "저장" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTMBIN_btnSaveClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var tMBIN_btnSave = e.control;
	
	var emb = app.lookup("TMBIN_embPage");
	var embAppIns = emb.getEmbeddedAppInstance();
	
	if (embAppIns) {
		if (embAppIns.hasAppMethod("requestSetData")) {
			embAppIns.callAppMethod("requestSetData");		
		}	
	}
	
	applyBasicInfo();
}

/**
 * 기본 정보 업데이트
 * 초기 데이터와 변경 된 사항이 있으면 서버에 요청하고 true를 리턴하다.
 */
function applyBasicInfo() {
	// 초기 데이터와 비교
	var initInfo = app.lookup("InitTerminalInfo");
	var curInfo = app.lookup("TerminalInfo");
	
	if (util.compareDataMap(initInfo, curInfo) == false) {
		var requestData = app.lookup("sms_set_terminal_info")
		requestData.action = "/v1/terminals/" + terminalID;		
		requestData.send();
	} else {
		applyOptionInfo();
		return true;		
	}
	
	return false
}

/**
 * 단말기 옵션 업데이트
 * 초기 데이터와 변경 된 사항이 있으면 서버에 요청하고 true를 리턴한다.
 * 모든 옵션을 한번에 처리 하므로 하나라도 변경 된 항목이 있으면 전체  옵션 변경을 오청 한다.
 */
function applyOptionInfo() {
	// FPOption
	
	var OPTIONS = ["FPOption", "UIOption", "DoorOption", "SysOption", "TimeOption", "NetOption"];
	
	var i;
	var isChange = false;
	for (i = 0; i < OPTIONS.length; i++) {
		var initInfo = app.lookup("Init" + OPTIONS[i]);
		var curInfo = app.lookup(OPTIONS[i]);
		
		isChange = !util.compareDataMap(initInfo, curInfo);
		if (isChange) break;
	}
	
	if (isChange == true) {
		var requestData = app.lookup("sms_setTerminal_option");
		requestData.action = "/v1/terminals/" + terminalID + "/option/entire";
		console.log("update terminal option info. ACTION: " + requestData.action);
		requestData.send();
	}	
}

function onSms_get_terminal_infoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var terminalInfo = app.lookup("TerminalInfo");
	app.lookup("TMBIN_grpTerminalInfo").redraw();
	
	// 가져온 정보를 init 정보에 복사
	var initTerminalInfo = app.lookup("InitTerminalInfo");	
	terminalInfo.copyToDataMap(initTerminalInfo);
	
	// 단말기 옵션 가져오기
	var requestData = app.lookup("sms_get_terminal_option");
	requestData.action = requestData.action + terminalID + "/option/entire";
	requestData.send();
}

function onSms_get_terminal_infoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_get_terminal_infoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_get_terminal_optionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	// 옵션 정보들을 init 에 저장
	app.lookup("FPOption").copyToDataMap(app.lookup("InitFPOption"));
	app.lookup("UIOption").copyToDataMap(app.lookup("InitUIOption"));
	app.lookup("DoorOption").copyToDataMap(app.lookup("InitDoorOption"));
	app.lookup("SysOption").copyToDataMap(app.lookup("InitSysOption"));
	app.lookup("TimeOption").copyToDataMap(app.lookup("InitTimeOption"));
	app.lookup("NetOption").copyToDataMap(app.lookup("InitNetOption"));
}

function onSms_get_terminal_optionSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_get_terminal_optionSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_set_terminal_infoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	// 초기 값 변경
	var initInfo = app.lookup("InitTerminalInfo");
	var curInfo = app.lookup("TerminalInfo");
	curInfo.copyToDataMap(initInfo);
	
	applyOptionInfo();
}

function onSms_set_terminal_infoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);	
}
function onSms_set_terminal_infoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_setTerminal_optionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	// 초기 데이터 변경
	var OPTIONS = ["FPOption", "UIOption", "DoorOption", "SysOption", "TimeOption", "NetOption"];
	
	var i;
	var isChange = false;
	for (i = 0; i < OPTIONS.length; i++) {
		var initInfo = app.lookup("Init" + OPTIONS[i]);
		var curInfo = app.lookup(OPTIONS[i]);
		
		curInfo.copyToDataMap(initInfo);		
	}
}

function onSms_setTerminal_optionSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_setTerminal_optionSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}