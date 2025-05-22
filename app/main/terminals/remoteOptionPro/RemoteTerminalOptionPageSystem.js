/************************************************
 * RemoteTerminalOptionPageSystem.js
 * Created at 2024. 08. 06. 오후 2:36:15.
 *
 * @author mjy
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
		
		// 옵션 설정 범위 
		if(hostAppIns.hasAppMethod("getSysRange")) {
			var range = hostAppIns.callAppMethod("getSysRange");
			var authenticationRange = app.lookup("Sys_Authentication_Range");
			var distanceRange = app.lookup("FC_Distance_Range");
			var maskRange = app.lookup("FC_MaskDetection_Range");
			var aeFlickerRange = app.lookup("FC_AEFLicker_Range");
			var aeModeRange = app.lookup("FC_AEMode_Range");
			var popupRange = app.lookup("FC_PopupType_Range");
			var authTypeRange = app.lookup("Auth_AuthType_Range");
			
			range.Sys_Authentication_Range.copyToDataSet(authenticationRange);
			range.FC_Distance_Range.copyToDataSet(distanceRange);
			range.FC_MaskDetection_Range.copyToDataSet(maskRange);
			range.FC_AEFLicker_Range.copyToDataSet(aeFlickerRange);
			range.FC_AEMode_Range.copyToDataSet(aeModeRange);
			range.FC_PopupType_Range.copyToDataSet(popupRange);
			range.Auth_AuthType_Range.copyToDataSet(authTypeRange);
		}
		onRTOPS_FC_AntiSpoofingValueChange();
		
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



function fpOptionChk(/* cpr.events.CValueChangeEvent */ e) {
	var multiFP = app.lookup("RTOPS_FP_MultiFP");
	var enable1toN = app.lookup("RTOPS_FP_Enable1toN");
	
	var clickedCheckbox = e.control;
	
	if(clickedCheckbox.checked) {
		if(multiFP == clickedCheckbox) {
			enable1toN.checked = false;
		} else {
			multiFP.checked = false;
		}
	}
}



/*
 * 체크 박스에서 value-change 이벤트 발생 시 호출.
 * CheckBox의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onRTOPS_FC_AntiSpoofingValueChange(){
	var AntiSpoofingChkBox = app.lookup("RTOPS_FC_AntiSpoofing");
	var cmbPopupType = app.lookup("RTOPS_FC_PopupType");
	
	if(AntiSpoofingChkBox.checked && cmbPopupType.getItemCount() > 2) {
		cmbPopupType.value = 2;
		cmbPopupType.readOnly = true;
	} else {
		cmbPopupType.readOnly = false;
	}
}


/*
 * 콤보 박스에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onRTOPS_FC_PopupTypeClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var rTOPS_FC_PopupType = e.control;
	if(rTOPS_FC_PopupType.readOnly) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_AntispoofingPopupType"));		
	}
}

