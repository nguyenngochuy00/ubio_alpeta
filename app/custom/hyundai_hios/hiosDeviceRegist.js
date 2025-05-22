/************************************************
 * hiosDeviceRegist.js
 * Created at 2021. 8. 18. 오전 9:24:46.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var hhstm_version;

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	hhstm_version = dataManager.getSystemVersion();
	
	// 단말기 아이디
	var initValue = app.getHost().initValue;
	var tID = initValue["terminalID"];
	if (tID) {
		var smsGetReq = app.lookup("sms_getHIosGateInfo");
		smsGetReq.action = "/v1/hyundai/hois/" + tID;
		smsGetReq.send();
	} 

}

function onSms_getHIosGateInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		app.lookup("HHSTM_grdMain").redraw();		
	} else {
		dialogAlert(app, "Waning", dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
}

function onSubmitError(/* cpr.events.CSubmissionEvent */ e){	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}


/*
 * 버튼(HHSTM_btnTerminalRegist)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onHHSTM_btnTerminalRegistClick(/* cpr.events.CMouseEvent */ e){
	
	var gateInfo = app.lookup("hiosGateInfo").getValue("GateInfo");
	if (gateInfo.toString().length <= 0) {
		dialogAlert(app, "Waning", "게이트 정보없이 등록을 진행 할 수 없습니다.");
		return;
	}
	
	comLib.showLoadMask("", "열화상 게이트 정보 등록", "",0);
	var sendReq = app.lookup("sms_postHIosGateInfo");
	sendReq.action = "/v1/hyundai/hois/" + app.lookup("hiosGateInfo").getValue("TerminalID");
	sendReq.send();
}

function onSms_postHIosGateInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		dialogAlert(app, "Success", "HIoS 열화상 장비 등록이 완료 되었습니다.");
		app.lookup("HHSTM_grdMain").redraw();		
	} else {
		if (resultCode == 0x7F000001) {
			dialogAlert(app, "Waning", "HIoS 사용옵션이 비활성화 상태입니다.");
		} else if (resultCode == 0x7F000002) {
			dialogAlert(app, "Waning", "게이트 정보는 이미 등록 되어 있습니다."); 
		} else if (resultCode == 0x7F000003) {
			dialogAlert(app, "Waning", "게이트 정보 Web 전송시도가 실패 하였습니다.");
		} else if (resultCode == 0x7F000004) {
			dialogAlert(app, "Waning", "게이트 정보 Web 전송 응답이 비정상적 입니다.");
		} else {
			dialogAlert(app, "Waning", dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));	
		}
		
	}
}


/*
 * 버튼(HHSTM_btnCancel)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onHHSTM_btnCancelClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var hHSTM_btnCancel = e.control;
	app.close();
}
