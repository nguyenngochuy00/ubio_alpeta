/************************************************
 * TerminalLogManagement.js
 * Created at 2019. 1. 7. 오후 5:51:04.
 *
 * @author wonki
 ************************************************/

var comLib;

var common;
var gridUtil = createGridUtil(app);

var pageRowCount = 20;
var deleteIndices;
var oem_version;

var dataManager = cpr.core.Module.require("lib/DataManager");
var bType;

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	oem_version = dataManager.getOemVersion();
	bType = dataManager.getSystemBrandType();
	
	var cmbCategory = app.lookup("TMLOM_cmbCategory");
	cmbCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogAll"),2));
	cmbCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogNotUpload"),0));
	cmbCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogPeriod"),3));
	cmbCategory.selectItem(0);
	
	var dsTerminalList = app.lookup("TerminalList");
	var terminalList = dataManager.getTerminalList();
	terminalList.copyToDataSet(dsTerminalList);
	dsTerminalList.commit();
	
	var total = dsTerminalList.getRowCount();
	var dmTotal = app.lookup("Total");
	dmTotal.setValue("Count",total);	
	app.lookup("TMLOM_lbTotal").redraw();
	
		
	var groupList = dataManager.getGroup();
	var dsGroupList = app.lookup("GroupList");
	groupList.copyToDataSet(dsGroupList);
	app.lookup("TMLOM_treGroup").redraw();
	
	// 날짜 기본값 설정
	var dtStart = app.lookup("TMLOM_dtStart");
	var dtEnd = app.lookup("TMLOM_dtEnd");
	
//	dtStart.value = '2018-09-01';
//	dtEnd.value = '2018-10-01';
	
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	dtEnd.value = now.format('YYYYMMDD');
	
	var before = now.add(-7, 'days');
	dtStart.value = before.format('YYYYMMDD');
	
	app.lookup("TMLOM_grpPeriod").enabled = false;
	if (oem_version == OEM_GS_BASIC){
		app.lookup('TMLOM_rdbType').visible = false;
	}
	sendTerminalListRequest();
}

function onSubmitError(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

//
function onTMLOM_udcSearchTerminalSearch(/* cpr.events.CUIEvent */ e){
	sendTerminalListRequest();
}

function sendTerminalListRequest() {
	var dsTerminalList = app.lookup("TerminalList");
	dsTerminalList.clear();
	
	var udcTerminalList = app.lookup("TMLOM_grdTerminalList");
	
	var searchCtrl = app.lookup("TMLOM_udcSearchTerminal")		
	var smsGetTerminalList = app.lookup("sms_getTerminalList");
	
	smsGetTerminalList.setParameters("searchCategory", searchCtrl.searchCategory);
	smsGetTerminalList.setParameters("searchKeyword", searchCtrl.searchKeyword);
	if( searchCtrl.searchKeyword != undefined && searchCtrl.searchKeyword.length > 0 ){
		smsGetTerminalList.setParameters("searchCategory", searchCtrl.searchCategory);		
	}else{
		smsGetTerminalList.setParameters("searchCategory", "");
	}
	
	var groupList = app.lookup("TMLOM_treGroup");
	var group = groupList.getSelectionFirst();
	if (group != undefined && group.value != "") {
		smsGetTerminalList.setParameters("groupID", parseInt(group.value, 10));
	} else {
		smsGetTerminalList.setParameters("groupID", 0);
	}
	smsGetTerminalList.setParameters("subInclude", "true");
	
	smsGetTerminalList.setParameters("offset", 0);
	smsGetTerminalList.setParameters("limit", 2000);
	var fields = ["terminal_id","name"];
	smsGetTerminalList.setParameters("fields", fields);
	
	if (oem_version == OEM_REMOTE_FAW_MANAGEMENT){ // 유사 얼굴 체크용 단말일 경우, 인증 로그 리스트에서 제외 시키기
		smsGetTerminalList.setParameters("ExceptUseAuth", "true");
	}
	
	smsGetTerminalList.send();
	//console.log("sendTerminalListRequest");
}

// 단말기 리스트 가져오기 완료
function onSms_getTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getTerminalList = e.control;
	
}

// 단말기 리스트 가져오기 성공
function onSms_getTerminalListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** @type cpr.protocols.Submission */
	var sms_getTerminalList = e.control;
		
	var dmTotal = app.lookup("Total");	
	var totalCount = parseInt( dmTotal.getValue("Count"));
	
	app.lookup("TMLOM_lbTotal").redraw();
}

// 그룹 선택 변경시
function onTMLOM_treGroupSelectionChange(/* cpr.events.CSelectionEvent */ e){	
	sendTerminalListRequest();
}

// 로그 수 가져오기 클릭
function onTMLOM_btnLogCountClick(/* cpr.events.CMouseEvent */ e){
	var grdTerminalList = app.lookup("TMLOM_grdTerminalList");
	var checkedRowIndices = grdTerminalList.getCheckRowIndices();
	
	if (checkedRowIndices.length == 0) { // 체크 결과 확인
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedTerminals"));
		return;
	}	
		
	var dsReqTerminalList = app.lookup("ReqTerminalList");
	dsReqTerminalList.clear();
	
	var reqIndex;
	while ( (reqIndex = checkedRowIndices.pop()) != undefined) {
		var terminalInfo = grdTerminalList.getRow(reqIndex);
		if( terminalInfo ){
			terminalInfo.setValue("LogCount", 0);
			var req = {"TerminalID":terminalInfo.getValue("ID"), "rowIndex":reqIndex};
			dsReqTerminalList.addRowData(req); // 로그를 요청할 단말 아이디 리스트를 ReqTerminalList 데이터셋에 저장
		}		
	}
	sendGetTerminalLogCount();
}

// 단말에 로그 저장 수 요청 전송
function sendGetTerminalLogCount() {
	var dsReqTerminalList = app.lookup("ReqTerminalList");
	if (dsReqTerminalList.getRowCount() == 0) { // 요청할 단말이 더이상 없으면 종료
		comLib.hideLoadMask();
		return;		
	}	
	
	var dsReqTerminal = dsReqTerminalList.getRow(0); // 요청할 단말 리스트에서 처음 데이터를 가져온다.
	var terminalID = dsReqTerminal.getValue("TerminalID");
	
	var smsGetLogCount = new cpr.protocols.Submission("sms_getTerminalLogCount");
	smsGetLogCount.method = "GET";
	smsGetLogCount.mediaType = "application/x-www-form-urlencoded";
	
	var rdbType = app.lookup("TMLOM_rdbType");
	
	var cmbCategory = app.lookup("TMLOM_cmbCategory");
	smsGetLogCount.setParameters("searchType", cmbCategory.value);
	if(rdbType.value==0){	
		if (smsGetLogCount.getParameters("searchType") == 3) { // 기간이 설정된 경우 요청 데이터에 기간 포함
			var dtStart = app.lookup("TMLOM_dtStart");
			var dtEnd = app.lookup("TMLOM_dtEnd");
		
			smsGetLogCount.setParameters("startDate", dtStart.value);
			smsGetLogCount.setParameters("endDate", dtEnd.value);
		}		
		smsGetLogCount.action = "/v1/authLogs/terminal/" + terminalID + "/count";
	} else {
		smsGetLogCount.setParameters("countReq", "true");
		smsGetLogCount.action = "/v1/logs/audit_log/" + terminalID + "/terminal";
	}
	
	smsGetLogCount.userAttr("terminalID",terminalID);	
	smsGetLogCount.addResponseData(app.lookup("Result"));
	smsGetLogCount.addResponseData(app.lookup("Total"));
		
	smsGetLogCount.addEventListenerOnce("submit-done", onSms_getTerminalLogCountSubmitDone);
	smsGetLogCount.addEventListenerOnce("submit-error", onSubmitError);
	smsGetLogCount.addEventListenerOnce("submit-timeout", onSubmitTimeout);
	
	smsGetLogCount.send();
}

// 단말기 로그 카운트 완료
function onSms_getTerminalLogCountSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** @type cpr.protocols.Submission */
	var smsGetLogCount = e.control;
	
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode");
	if(  resultCode== COMERROR_NONE){
		var dmTotal = app.lookup("Total");
		var terminalID = smsGetLogCount.userAttr("terminalID");
		var dsTerminalList = app.lookup("TerminalList");
		var terminalInfo = dsTerminalList.findFirstRow("ID == '"+terminalID+"'");
		if( terminalInfo ){
			terminalInfo.setValue("LogCount", dmTotal.getValue("Count") );
			terminalInfo.setValue("Result", "" );
		}
		
		var dsReqTerminalList = app.lookup("ReqTerminalList");
		dsReqTerminalList.realDeleteRow(0); // 단말 로그수 요청할 단말 아이디 데이터셋에서 첫번째 요청한 데이터를 받아왔으므로 리스트에서 제거.
		
		sendGetTerminalLogCount();
	} else {
		var errMsg = "";
		var errStr = "";
		errStr = getErrorString(resultCode);
		if (resultCode == ErrorInvalidParameter) {
			errMsg = dataManager.getString("Str_ReqTerminalLogCount")+ " " + dataManager.getString(errStr); // 단말기 로그 수 요청  데이터값이 잘못되었습니다. 
			dialogAlert(app, dataManager.getString("Str_Failed"), errStr);
			return;
		}
		
		if (resultCode == ErrorTerminalNotConnected || resultCode == ErrorTerminalInvalidStatus) {
			// 단말기 미등록 or 단말기 비정상 상태 다음 단말기로 처리
			var tmpTotal = -1;
			var terminalID = smsGetLogCount.userAttr("terminalID");
			var dsTerminalList = app.lookup("TerminalList");
			var terminalInfo = dsTerminalList.findFirstRow("ID == '"+terminalID+"'");
			if( terminalInfo ){
				terminalInfo.setValue("LogCount", tmpTotal );
				terminalInfo.setValue("Result", dataManager.getString(errStr) ); // 언어 처리 
			}
			var dsReqTerminalList = app.lookup("ReqTerminalList");
			dsReqTerminalList.realDeleteRow(0); // 단말 로그수 요청할 단말 아이디 데이터셋에서 첫번째 요청한 데이터를 받아왔으므로 리스트에서 제거.
			sendGetTerminalLogCount();
		}
		
	}
}

// 로그 데이터 가져오기 클릭
function onTMLOM_btnLogImportClick(/* cpr.events.CMouseEvent */ e){	
	var grdTerminalList = app.lookup("TMLOM_grdTerminalList");
	var checkedRowIndices = grdTerminalList.getCheckRowIndices();
	
	if (checkedRowIndices.length == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedTerminals"));
		return;
	}
	
	var dsReqTerminalList = app.lookup("ReqTerminalList");
	dsReqTerminalList.clear();
	
	var reqIndex;
	while ( (reqIndex = checkedRowIndices.pop()) != undefined) {
		var terminalInfo = grdTerminalList.getRow(reqIndex);
		console.log(terminalInfo.getValue("Status"),terminalInfo.getValue("ID"));
		//if( terminalInfo.getValue("Status") == 0 || terminalInfo.getValue("Status") == 16){continue;} 
		
		var strResult = terminalInfo.getValue("Result");
		if (strResult == dataManager.getString("Str_ErrorTerminalNotConnected") ||  strResult == dataManager.getString("Str_ErrorTerminalInvalidStatus")) {
			console.log("strResult");
			continue;
		}
		var req = {"TerminalID":terminalInfo.getValue("ID"), "rowIndex":reqIndex};
		dsReqTerminalList.addRowData(req);		
	}
	comLib.showLoadMask("pro",dataManager.getString("Str_ReqTerminalLogData"),"",dsReqTerminalList.getRowCount()+1);
	
	sendGetTerminalLogData();
}

function sendGetTerminalLogData() {
	var dsReqTerminalList = app.lookup("ReqTerminalList");
	if (dsReqTerminalList.getRowCount() == 0) {
		comLib.hideLoadMask();
		return;		
	}	
		
	var dsReqTerminal = dsReqTerminalList.getRow(0);
	var terminalID = dsReqTerminal.getValue("TerminalID");	
	dsReqTerminalList.deleteRow(0);
	dsReqTerminalList.commit();
	
	comLib.updateLoadMask(dataManager.getString("Str_TerminalID")+" : "+terminalID);
		
	var cmbCategory = app.lookup("TMLOM_cmbCategory");	
	var chkImage = app.lookup("TMLOM_chkImage");

	var rdbType = app.lookup("TMLOM_rdbType");
		
	var smsGetLogData = new cpr.protocols.Submission("sms_getTerminalLogData");
	smsGetLogData.method = "GET";
	smsGetLogData.mediaType = "application/x-www-form-urlencoded";
	
	smsGetLogData.setParameters("searchType", cmbCategory.value);
	if (smsGetLogData.getParameters("searchType") == 3) {
		var dtStart = app.lookup("TMLOM_dtStart");
		var dtEnd = app.lookup("TMLOM_dtEnd");
		smsGetLogData.setParameters("startDate", dtStart.value);
		smsGetLogData.setParameters("endDate", dtEnd.value);
	}
	smsGetLogData.setParameters("attachPicture", chkImage.value);	
	var dmTotal = app.lookup("Total");
	smsGetLogData.setParameters("total", dmTotal.getValue("Count"));	
	
	if(rdbType.value==0){			
		smsGetLogData.action = "/v1/authLogs/terminal/" + terminalID + "/data";
		smsGetLogData.addEventListenerOnce("submit-done", onSms_getTerminalLogDataSubmitDone);
	}else {
		smsGetLogData.action = "/v1/logs/audit_log/" + terminalID + "/terminal";
		smsGetLogData.addEventListenerOnce("submit-done", onSms_getTerminalAuditLogDataSubmitDone);
		smsGetLogData.addResponseData(app.lookup("Total"), false, "Total");
	}
	smsGetLogData.setParameters("ID", terminalID);
	
	smsGetLogData.addResponseData(app.lookup("Result"), false, "Result");
	
	
	smsGetLogData.addEventListenerOnce("submit-error", onSubmitError);
	smsGetLogData.addEventListenerOnce("submit-timeout", onSubmitTimeout);
	
	smsGetLogData.send();	
}

// 단말기 로그 가져오기 완료 
function onSms_getTerminalLogDataSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode != COMERROR_NONE) { // 에러 발생시는 다음 단말 진행. 성공인 경우는 웹 소켓을 통해 진행상황이 수신되며 완료시 다음 단말로 진행 된다.
		/** @type cpr.protocols.Submission */
		var smsGetLogData = e.control;
		var terminalID = smsGetLogData.getParameters("ID");
		var dsTerminalList = app.lookup("TerminalList");
		if( dsTerminalList ){
			var terminalInfo = dsTerminalList.findFirstRow("ID == "+terminalID);
			if( terminalInfo ){
				terminalInfo.setValue("Result", dataManager.getString(getErrorString(resultCode)));
			}
		}		
		sendGetTerminalLogData();
	}
}

function onSms_getTerminalAuditLogDataSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode != COMERROR_NONE) { // 에러 발생시는 다음 단말 진행. 성공인 경우는 웹 소켓을 통해 진행상황이 수신되며 완료시 다음 단말로 진행 된다.
		/** @type cpr.protocols.Submission */
		var smsGetLogData = e.control;
		var terminalID = smsGetLogData.getParameters("ID");
		var dsTerminalList = app.lookup("TerminalList");
		if( dsTerminalList ){
			var terminalInfo = dsTerminalList.findFirstRow("ID == "+terminalID);
			if( terminalInfo ){
				var count = app.lookup("Total").getValue("Count");		
				terminalInfo.setValue("Result", dataManager.getString(getErrorString(resultCode)));
				terminalInfo.setValue("LogCount", count);
				app.lookup("Total").setValue("Count",0);
			}
		}
	}
	sendGetTerminalLogData();
}

// 로그 가져오기 조건 설정 변경시
function onTMLOM_cmbCategorySelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.ComboBox	 */
	var tMLOM_cmbCategory = e.control;
	if( tMLOM_cmbCategory.value == 3 ){
		app.lookup("TMLOM_grpPeriod").enabled = true;	
	} else {
		app.lookup("TMLOM_grpPeriod").enabled = false;
	}
	
}

exports.uploadStatusNotify = function( status ){
	var dsTerminalList = app.lookup("TerminalList");
	var terminalInfo = dsTerminalList.findFirstRow("ID =='"+status.terminalID+"'");
	var bNext = false;
	if( terminalInfo ){
		terminalInfo.setValue("LogCount",status.total);
		terminalInfo.setValue("Result",status.offset+status.count);
		var recvCount = status.offset+status.count;
		comLib.updateLoadMaskSubTitle(dataManager.getString("Str_TerminalID")+" : "+status.terminalID+" "+ status.offset +"/"+status.total);
		if( recvCount >= status.total){
			bNext = true;
		} 
		//console.log(status.total,status.offset,status.count);
	}else {
		bNext = true;
	}
	
	if( bNext == true ){
		sendGetTerminalLogData();
	} 
}

// 도움말 클릭
function onTMLOM_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // mainManager.module.js ExecuteMenu <- 셋팅	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {"Target":DLG_HELP,"ID": menu_id}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

function onRdb1SelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.RadioButton	 */
	var rdbType = e.control;
	
	var cmbCategory = app.lookup("TMLOM_cmbCategory");	
	
	if(rdbType.value == 0){		
		if( cmbCategory.value == 3 ){
			app.lookup("TMLOM_grpPeriod").enabled = true;	
		} else {
			app.lookup("TMLOM_grpPeriod").enabled = false;
		}
		cmbCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogPeriod"),3));
		app.lookup("TMLOM_chkImage").enabled = true;
	}else{
		if( cmbCategory.value == 3 ){
			cmbCategory.selectItem(0);	
		}
		cmbCategory.deleteItemByValue(3);
		app.lookup("TMLOM_grpPeriod").enabled = false;
		app.lookup("TMLOM_chkImage").enabled = false;		
	}
	
}
