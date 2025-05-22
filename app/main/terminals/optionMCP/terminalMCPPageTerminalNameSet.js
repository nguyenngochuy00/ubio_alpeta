/************************************************
 * terminalMCPCardReaderType.js
 * Created at 2021. 9. 3. 오후 4:47:23.
 *
 * @author A
 ************************************************/
var comLib;			
comLib = createComUtil(app);
var dataManager = cpr.core.Module.require("lib/DataManager");
var tmpns_terminalID;
var tmpns_mode=0;

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager(); //메모리 정보 쓸꺼 있으면 미리 선언해서 받기	
	var initValue = app.getHost().initValue;
	tmpns_terminalID = initValue.terminalID;
	comLib.showLoadMask("", "get ReaderName","",0);
	var reqData = app.lookup("sms_getMCPReaderInfo");
	reqData.action = "/v1/terminals/" + tmpns_terminalID + "/readerNames";
	reqData.send();
}

function onSms_SubmitError(/* cpr.events.CSubmissionEvent */ e){	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSms_SubmitTimeout(/* cpr.events.CSubmissionEvent */ e){	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}
//----------------------------------------------------------------------------> 가져오기
function onSms_getMCPReaderInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getMCPReaderInfo = e.control;
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE || resultCode == ErrorDBNotExist) {
		if (resultCode == COMERROR_NONE) {
			tmpns_mode = 1; // update
		} else if (resultCode == ErrorDBNotExist) {
			tmpns_mode = 0; // add
		}
		app.lookup("TMPNS_grp1").redraw();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	} 
}
//----------------------------------------------------------------------------< 가져오기
//----------------------------------------------------------------------------> 등록
function onTMPNS_btnCardReaderRegistClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var tMPNS_btnCardReaderRegist = e.control;
	var smsData;
	var TerminalID = app.lookup("MCPReaderInfo").getValue("TerminalID");
	var resultCode = app.lookup("Result").getValue("ResultCode")
		if (tmpns_mode == 0) { //추가
			comLib.showLoadMask("", "reqist ReaderName req","",0);
			smsData = app.lookup("sms_postMCPReaderInfo");	
			smsData.action = "/v1/terminals/" + tmpns_terminalID + "/readerNames";
		} else if (tmpns_mode == 1) {
			comLib.showLoadMask("", "update ReaderName req","",0);
			smsData = app.lookup("sms_putMCPReaderInfo");
			smsData.action = "/v1/terminals/" + tmpns_terminalID + "/readerNames";
		} 
		smsData.send();	
}
//----------------------------------------------------------------------------< 등록
//----------------------------------------------------------------------------> 추가
function onSms_postMCPReaderInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_postMCPReaderInfo = e.control;
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		tmpns_mode = 1; // update
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_TerminalNameRegist"));
		app.lookup("TMPNS_grp1").redraw();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}
//----------------------------------------------------------------------------< 추가
//----------------------------------------------------------------------------> 수정
function onSms_putMCPReaderInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_putMCPReaderInfo = e.control;
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE || resultCode == ErrorDBNotExist) {
		tmpns_mode = 1; // update
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_TerminalNameRegist"));
		app.lookup("TMPNS_grp1").redraw();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	} 
}
//----------------------------------------------------------------------------< 수정
//----------------------------------------------------------------------------> 취소 버튼
function onTMPNS_btnCancelClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var tMPNS_btnCancel = e.control;
	app.close({"Result":1});
}
//----------------------------------------------------------------------------< 취소 버튼
//----------------------------------------------------------------------------> 초기화 버튼
function onTMPNS_btnClearClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var tMPNS_btnClear = e.control;
	var ipb1 = app.lookup("TMPNS_ipb1"); var ipb2 = app.lookup("TMPNS_ipb2"); var ipb3 = app.lookup("TMPNS_ipb3");
	var ipb4 = app.lookup("TMPNS_ipb4"); var ipb5 = app.lookup("TMPNS_ipb5"); var ipb6 = app.lookup("TMPNS_ipb6");
	var ipb7 = app.lookup("TMPNS_ipb7"); var ipb8 = app.lookup("TMPNS_ipb8"); var ipb9 = app.lookup("TMPNS_ipb9");
	var ipb10 = app.lookup("TMPNS_ipb10"); var ipb11 = app.lookup("TMPNS_ipb11"); var ipb12 = app.lookup("TMPNS_ipb12");
	ipb1.clear(); ipb2.clear(); ipb3.clear(); ipb4.clear(); ipb5.clear(); ipb6.clear(); ipb7.clear()
	ipb8.clear(); ipb9.clear(); ipb10.clear(); ipb11.clear(); ipb12.clear();
}
//----------------------------------------------------------------------------< 초기화 버튼