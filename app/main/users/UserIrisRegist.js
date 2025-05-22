/************************************************
 * userFaceRegist.js
 * Created at 2018. 10. 16. 오후 1:23:45.
 *
 * @author fois
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");

var comLib;

var USIRR_url;
var USIRR_UserID;
var USIRR_IrisDatas;

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var udcTerminalList = app.lookup("USIRR_udcTerminalList");	
	udcTerminalList.deleteColumn([13,12,11,10,9,8,7,6,5,4,3]);
	
	
	var cmbIrisType = app.lookup("USIRR_cmbIrisType");
	cmbIrisType.addItem(new cpr.controls.Item("----", 0));
	cmbIrisType.addItem(new cpr.controls.Item(dataManager.getString("Str_IrisRight"), 1));
	cmbIrisType.addItem(new cpr.controls.Item(dataManager.getString("Str_IrisLeft"), 2));	
		
	var initValue = app.getHost().initValue;
	USIRR_url = initValue["Url"];
	USIRR_UserID = initValue["ID"];	
	USIRR_IrisDatas = initValue["IrisDatas"];
	console.log(USIRR_IrisDatas);
	if (USIRR_IrisDatas.length > 0 ) {		
		var dsUserIrisInfo = app.lookup("UserIrisInfo");
		dsUserIrisInfo.build(USIRR_IrisDatas);
		sendTerminalListRequest();
	} else{
		comLib.showLoadMask("",dataManager.getString("Str_DataLoading"),"",0);
		var sms_getUserIrisInfo = app.lookup("sms_getUserIrisInfo");					
		sms_getUserIrisInfo.action = USIRR_url+"/users/"+USIRR_UserID+"/irisInfo";		
		sms_getUserIrisInfo.send();	
	}
}

// 사용자 홍채 정보 수신 완료
function onSms_getUserIrisInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if ( resultCode == COMERROR_NONE) {
		//var dsUserIrisInfo = app.lookup("UserIrisInfo");		
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	sendTerminalListRequest();
}

// 사용자 홍채 정보 수신 에러
function onSms_getUserIrisInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){	
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

// 사용자 홍채 정보 수신 타임아웃
function onSms_getUserIrisInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){	
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function sendTerminalListRequest() {
	var terminalList = app.lookup("USIRR_udcTerminalList");	
	var curIndex = terminalList.getCurrentPageIndex();
	
	var pageRowCount = terminalList.getPageRowCount();
	var offset = (curIndex - 1) * pageRowCount;
	
	var smsGetConnectedTerminalList = app.lookup("sms_getTerminalList");
	smsGetConnectedTerminalList.action = USIRR_url+'/terminals/tiny'
	
	smsGetConnectedTerminalList.setParameters("offset", offset);
	smsGetConnectedTerminalList.setParameters("limit", pageRowCount);
	smsGetConnectedTerminalList.setParameters("AuthType", 'iris');
	smsGetConnectedTerminalList.setParameters("StatusFlag", "true");
	
	var fields = ["terminal_id","name"];
	smsGetConnectedTerminalList.setParameters("fields", fields);
	
	comLib.showLoadMask("",dataManager.getString("Str_TerminalLoading"),"",pageRowCount);
	smsGetConnectedTerminalList.send();
}

// 터미널 리스트 가져오기 완료
function onSms_getTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if(resultCode == COMERROR_NONE) {
		var dsTerminalList = app.lookup("TerminalList");
		//dsTerminalList.setFilter("Type == 43"); // 홍채 단말기만 보이도록 필터링
		//dsTerminalList.addRow();
			
		var terminalList = app.lookup("USIRR_udcTerminalList");
		terminalList.setTerminalList(dsTerminalList);
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));		
		terminalList.setTotalCount(totalCount);
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 터미널 리스트 가져오기 에러
function onSms_getTerminalListSubmitError(/* cpr.events.CSubmissionEvent */ e){	
	var ResultCode = app.lookup("Result").setValue("ResultCode", -1);
}

// 터미널 리스트 가져오기 에러
function onSms_getTerminalListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var ResultCode = app.lookup("Result").setValue("ResultCode", -2);
}

// "캡쳐" 버튼에서 click 이벤트 발생 시 호출.
function onUSIRR_btnCaptureClick(/* cpr.events.CMouseEvent */ e){
	var udcTerminalList = app.lookup("USIRR_udcTerminalList");
		
	var checkdRowIndices = udcTerminalList.getCheckedRowIndices();
	if (checkdRowIndices.length < 1 ) {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_NoSelectedTerminals"));
		return;
	} else if (checkdRowIndices.length > 1 ) {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_SelectedOneTerminal"));
		return;
	}
	
	var terminalID = udcTerminalList.getTerminalID(checkdRowIndices[0]);
			
	var dsUserIrisInfo = app.lookup("UserIrisInfo");
	dsUserIrisInfo.clear();
	 
	var sms_getUserIrisFromTerminal = app.lookup("sms_getUserIrisFromTerminal");
	sms_getUserIrisFromTerminal.action = USIRR_url+'/terminals/' + terminalID + '/scan/iris';
	
	sms_getUserIrisFromTerminal.setParameters("type", 0); // 0:요청 시작	
	sms_getUserIrisFromTerminal.setParameters("capture_timeout", 60); //default: 30 에러 발생 60으로 변경		
	sms_getUserIrisFromTerminal.send();
	
	comLib.showLoadMask("", dataManager.getString("Str_Capture"), "", 120);	
}

// Iris 캡쳐 완료
function onSms_getUserIrisFromTerminalSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
		
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		//var dsUserIrisInfo = app.lookup("UserIrisInfo");		
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// Iris 캡쳐 에러
function onSms_getUserIrisFromTerminalSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

// Iris 캡쳐 타임아웃
function onSms_getUserIrisFromTerminalSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){	
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

// "완료" 버튼에서 click 이벤트 발생 시 호출.
function onUSIRR_btnCompliteClick(/* cpr.events.CMouseEvent */ e){
	var dsUserIrisInfo = app.lookup("UserIrisInfo");	
	app.close(dsUserIrisInfo);
}
