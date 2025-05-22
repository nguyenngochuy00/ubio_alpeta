/************************************************
 * RemoteTerminalOptionPageSystem.js
 * Created at 2023. 11. 23. 오후 4:45:15.
 *
 * @author zxc
 ************************************************/

var comLib;			
var dataManager = cpr.core.Module.require("lib/DataManager");
var pagePrefix = "RTOPS";
var hostAppIns;

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	var terminalType = app.getHost().initValue;
	
	hostAppIns = app.getHostAppInstance();
	if (hostAppIns) {
		var termianlAllOpt = hostAppIns.callAppMethod("getTerminalAllOption");
		var nOptinfo = app.lookup("systemOptionInfo");
		termianlAllOpt.copyToDataMap(nOptinfo);
		
		// 미지원 옵션 비활성화
		setEmbAppInnerControlEnable(app, nOptinfo, pagePrefix);
		
		app.lookup("systab").redraw();
	}
}


// 데이터베이스 플레그 버튼
function onFlagBtnClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btn = e.control;
	dialogConfirm(app.getRootAppInstance(), "", dataManager.getString("Str_DeleteConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				var flag = btn.userAttr("flag");
				SendJsonDBOptiontoTerminal(flag);
			} else {}
		});
	});
}

function SendJsonDBOptiontoTerminal(flag) {
	var requestData = app.lookup("sms_delete_terminal_option_info");
	var terminalID;
	var hostAppIns = app.getHostAppInstance();
	if (hostAppIns) {
		comLib.showLoadMask("", dataManager.getString("Str_TerminalSave"), "", 0);
		terminalID = hostAppIns.callAppMethod("getTerminalID");
		var dmDBFlag = app.lookup("systemDBFlag")
		dmDBFlag.clear();
		dmDBFlag.setValue(flag, 1);
//		requestData.addRequestData(dmDBFlag);
		requestData.method = "post";
		requestData.action = "/v1/terminals/" + terminalID + "/option/remote/delete";
		requestData.send();
	}
}

function onSms_delete_terminal_option_infoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var errorCode = app.lookup("Result").getValue("ResultCode");
	if (errorCode == COMERROR_NONE) {
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Success"));
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(errorCode)));
	}
}

function onSms_delete_terminal_option_infoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_delete_terminal_option_infoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function checkBoxValueChange(optID) {
	var control = app.lookup(optID);
	if (control != null) {
		control.value = 0;
		control.redraw();
	}
}

function onRTOPS_FP_MultiFPValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.CheckBox
	 */
	var rTOPS_FP_MultiFP = e.control;
	if (rTOPS_FP_MultiFP.value == 1) {
		checkBoxValueChange("RTOPS_FP_Enable1toN");		// 복수지문인증, 1:N 인증허용 동시 체크 불가
	}
}

function onRTOPS_FP_Enable1toNValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.CheckBox
	 */
	var rTOPS_FP_Enable1toN = e.control;
	if (rTOPS_FP_Enable1toN.value == 1) {
		checkBoxValueChange("RTOPS_FP_MultiFP");	// 복수지문인증, 1:N 인증허용 동시 체크 불가
	}
}

function onRTOPS_FP_FPTemplateFormSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var rTOPS_FP_FPTemplateForm = e.control;
	if (hostAppIns) {
		if (hostAppIns.callAppMethod("invalidOptionByTerminalType", rTOPS_FP_FPTemplateForm.id, rTOPS_FP_FPTemplateForm.value) == false) {
			rTOPS_FP_FPTemplateForm.value = rTOPS_FP_FPTemplateForm.fallbackValue;	// Union 포맷
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NotSupportFormat"));
			return;
		}
	}
}

//<-------------------------------------------------------------------------------

exports.getTerminalPartOption = function() {
	var TerminalPartOption = app.lookup("systemOptionInfo");
	return TerminalPartOption;
}

exports.getPageInfo = function() {
	return "System";
}

//-------------------------------------------------------------------------------->

