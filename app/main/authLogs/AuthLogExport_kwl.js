/************************************************
 * AuthLogExport.js
 * Created at 2019. 1. 9. 오후 6:33:38.
 *
 * @author wonki
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var ALEMP_pageRowCount = 1000;
var ALEMP_recvRowPerExport = 2000;
var comLib;

function onBodyLoad( /* cpr.events.CEvent */ e) {
	comLib = createComUtil(app);
	dataManager = getDataManager();
	
	var dtiStart = app.lookup("ALEMP_dtiStart");
	var dtiEnd = app.lookup("ALEMP_dtiEnd");
	
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	dtiEnd.value = now.format('YYYY-MM-DD');
	dtiStart.value = now.format('YYYY-MM-DD');
	
}

// 검색 클릭
function onALEMP_btnSearchClick( /* cpr.events.CMouseEvent */ e) {
	var udcUserList = app.lookup("ALEMP_udcAuthlogList");
	udcUserList.setCurrentPageIndex(1);
	
	var dsAuthLogList = app.lookup("AuthLogList");
	dsAuthLogList.clear();
	var udcAuthLogList = app.lookup("ALEMP_udcAuthlogList");
	udcAuthLogList.setAuthLogList(dsAuthLogList);
	
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "list");
	sendAuthLogListRequest();
}

// 내보내기 클릭
function onALEMP_dtiExportClick( /* cpr.events.CMouseEvent */ e) {
	var totalLabel = app.lookup("ALEMP_opbTotal");
	var dmTotal = app.lookup("Total")
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "export");
	dm_ExportParam.setValue("total", dmTotal.getValue("Count"));
	dm_ExportParam.setValue("offset", 0);
	if (totalLabel.value == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_AuthLogExportFail"));
	} else {
		comLib.showLoadMask("pro", dataManager.getString("Str_AuthLogExport"), "", parseInt(totalLabel.value) / 1000);
		sendAuthLogListRequest()
		return;
	}
	
}

function sendAuthLogListRequest() {
	var dtiStart = app.lookup("ALEMP_dtiStart");
	var dtiEnd = app.lookup("ALEMP_dtiEnd");
	
	if (dateLib.minusDates(dtiStart.value.replace(/-/gi, ""), dtiEnd.value.replace(/-/gi, "")) >= 31) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ThirtyDayOverError"));
		app.lookup("ALEMP_opbTotal").value = 0;
		return;
	}
	
	var udcAuthLogList = app.lookup("ALEMP_udcAuthlogList");
	var curIndex = udcAuthLogList.getCurrentPageIndex();
	var offset = (curIndex - 1) * ALEMP_pageRowCount;
	
	var smsGetAuthLogList = app.lookup("sms_getAuthLogList");
	
	var cmbCategory = app.lookup("ALEMP_cmbCategory");
	var edtKeyword = app.lookup("ALEMP_edtKeyword");
	var cmbKeyword2 = app.lookup("ALEMP_cmbKeyword2");
	
	
	smsGetAuthLogList.setParameters("startTime", dtiStart.value + " 00:00:00");
	smsGetAuthLogList.setParameters("endTime", dtiEnd.value + " 23:59:59");
	smsGetAuthLogList.setParameters("offset", offset);
	smsGetAuthLogList.setParameters("limit", ALEMP_pageRowCount);
	
	if (cmbCategory.value != null && cmbCategory.value.length > 0) {
		smsGetAuthLogList.setParameters("searchCategory", cmbCategory.value);
	}
	if (edtKeyword.value != null && edtKeyword.value.length > 0) {
		smsGetAuthLogList.setParameters("searchKeyword", edtKeyword.value);
	}
	if (cmbKeyword2.value != null && cmbKeyword2.value.length > 0) {
		smsGetAuthLogList.setParameters("searchKeyword2", cmbKeyword2.value);
	}
	
	var dm_ExportParam = app.lookup("dm_ExportParam");
	if (dm_ExportParam.getValue("mode") == "list") {
		var udcUserList = app.lookup("ALEMP_udcAuthlogList");
		var curIndex = udcUserList.getCurrentPageIndex();
		var offset = (curIndex - 1) * ALEMP_pageRowCount
		smsGetAuthLogList.setParameters("offset", offset);
		smsGetAuthLogList.setParameters("limit", ALEMP_pageRowCount);
	} else {
		smsGetAuthLogList.setParameters("offset", dm_ExportParam.getValue("offset"));
		smsGetAuthLogList.setParameters("limit", ALEMP_recvRowPerExport);
	}
	
	var dsAuthLogList = app.lookup("AuthLogList");
	dsAuthLogList.clear();
	
	smsGetAuthLogList.send();
	var dm_ExportParam = app.lookup("dm_ExportParam");
	if (dm_ExportParam.getValue("mode") == "list") {
		comLib.showLoadMask("", dataManager.getString("Str_ListLoading"), "");
	}
}

// 인증로그 가져오기 성공
function onSms_getAuthLogListSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	
	//comLib.hideLoadMask();
	var result = app.lookup("Result");
	if (result.getValue("ResultCode") == COMERROR_NONE) {
		
		var dsAuthLogList = app.lookup("AuthLogList");
		var count = dsAuthLogList.getRowCount();
		var terminalList = dataManager.getTerminalList();
		for (var i = 0; i < count; i++) {
			var logInfo = dsAuthLogList.getRow(i);
			if (logInfo.getValue("TerminalName").length <= 0) { // 이름이 없으면
				var terminalID = logInfo.getValue("TerminalID");
				var searchData = terminalList.findFirstRow("ID =='" + terminalID + "'");
				if (searchData) {
					logInfo.setValue("TerminalName", searchData.getValue("Name"));
				}
			}
			if (logInfo.getValue("ReserveType") == 1) {
				var data = logInfo.getValue("ReserveData").split(',');
				logInfo.setValue("Detail", data[2] + "." + data[3] + "°");
			}
		}
		
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		app.lookup("ALEMP_opbTotal").value = totalCount;
		
		var dm_ExportParam = app.lookup("dm_ExportParam");
		if (dm_ExportParam.getValue("mode") == "list") {
			
			var viewPageCount = totalCount / ALEMP_pageRowCount + (totalCount % ALEMP_pageRowCount > 0);
			if (viewPageCount > 10) {
				viewPageCount = 10;
			}
			var udcAuthLogList = app.lookup("ALEMP_udcAuthlogList");
			udcAuthLogList.setAuthLogList(dsAuthLogList);
			udcAuthLogList.setPaging(totalCount, ALEMP_pageRowCount, viewPageCount);
			comLib.hideLoadMask();
		} else {
			
			var exportAuthLogList = app.lookup("ExportAuthLogList");
			
			if (dsAuthLogList.getRowCount() == 0) {
				comLib.hideLoadMask();
				if (exportAuthLogList.getRowCount() > 0) {
					exportExcel();
					exportAuthLogList.clear();
				} else {
					dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
				}
			} else {
				//dsAuthLogList.copyToDataSet(exportAuthLogList)		
				for (var i = 0; i < dsAuthLogList.getRowCount(); i++) {
					exportAuthLogList.pushRowData(dsAuthLogList.getRowData(i));
				}
				
				if (exportAuthLogList.getRowCount() >= dm_ExportParam.getValue("total")) {
					exportExcel();
					comLib.hideLoadMask();
					exportAuthLogList.clear();
				} else {
					var offset = dm_ExportParam.getValue("offset");
					offset += ALEMP_recvRowPerExport;
					dm_ExportParam.setValue("offset", offset)
					comLib.updateLoadMask(offset);
					sendAuthLogListRequest();
				}
			}
		}
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ListLoading"));	
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
}

// 인증로그 가져오기 에러
function onSms_getAuthLogListSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_ERROR);
}

// 인증로그 가져오기 타임아웃
function onSms_getAuthLogListSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function getLogAuthTypeString(value) {
	var type = "";
	switch (value) {
		case 1:
			type = dataManager.getString("Str_AuthTypeFPVerify");
			break;
		case 2:
			type = dataManager.getString("Str_AuthTypeFPIdentify");
			break;
		case 3:
			type = dataManager.getString("Str_Password");
			break;
		case 4:
			type = dataManager.getString("Str_Card");
			break;
		case 5:
			type = dataManager.getString("Str_AuthTypeFaceVerify");
			break;
		case 6:
			type = dataManager.getString("Str_AuthTypeFaceIdentify");
			break;
		case 7:
			type = dataManager.getString("Str_MobileCard");
			break;
		case 8:
			type = dataManager.getString("Str_TypeQR");
			break;
			
		default:
			return "";
			break;
	}
	return type;
}

function getLogAuthResultString(value) {
	var type = "";
	switch (value) {
		case AuthLogResultSuccess:
			type = dataManager.getString("Str_Success");
			break;
		case AuthLogResultFail:
			type = dataManager.getString("Str_AuthResultFail");
			break;
		case AuthLogResultAccessDenied:
			type = dataManager.getString("Str_AuthResultAccessDenied");
			break;
		case AuthLogResultTimeout:
			type = dataManager.getString("Str_AuthResultTimeout");
			break;
		case AuthLogResultTimeoutCapture:
			type = dataManager.getString("Str_AuthResultTimeoutCapture");
			break;
		case AuthLogResultTimeoutIdentify:
			type = dataManager.getString("Str_AuthResultTimeoutIdentify");
			break;
		case AuthLogResultAntiPassback:
			type = dataManager.getString("Str_AuthResultAntiPassback");
			break;
		case AuthLogResultDuress:
			type = dataManager.getString("Str_AuthResultDuress");
			break;
		case AuthLogResultBlackList:
			type = dataManager.getString("Str_AuthResultBlackList");
			break;
		case AuthLogResultInvalidUser:
			type = dataManager.getString("Str_AuthResultUnregistUser");
			break;
		case AuthLogResultCapture:
			type = dataManager.getString("Str_AuthResultFPCaptureFailed");
			break;
		case AuthLogResultDuplicatedAuthentication:
			type = dataManager.getString("Str_AuthResultDuplicatedAuth");
			break;
		case AuthLogResultNetwork:
			type = dataManager.getString("Str_AuthResultNetworkError");
			break;
		case AuthLogResultServerBusy:
			type = dataManager.getString("Str_AuthResultServerBusy");
			break;
		case AuthLogResultFaceDetection:
			type = dataManager.getString("Str_AuthResultFaceDetectionFailed");
			break;
		case AuthLogResultFailMealPay:
			type = dataManager.getString("Str_AuthLogResultFailMealPay");
			break;
		case AuthLogResultFailMealTime:
			type = dataManager.getString("Str_AuthLogResultFailMealTime");
			break;
		case AuthLogResultFailNotExistsMealCode:
			type = dataManager.getString("Str_AuthLogResultFailNotExistsMealCode");
			break;
		case AuthLogResultFailPeriod:
			type = dataManager.getString("Str_AuthLogResultFailPeriod");
			break;
		case AuthLogResultFailMealLimit:
			type = dataManager.getString("Str_AuthLogResultFailMealLimit");
			break;
		case AuthLogResultFailDayLimit:
			type = dataManager.getString("Str_AuthLogResultFailDayLimit");
			break;
		case AuthLogResultFailMonthLimit:
			type = dataManager.getString("Str_AuthLogResultFailMonthLimit");
			break;
		case AuthLogResultSoftpassback:
			type = dataManager.getString("Str_AuthLogResultSoftpassback");
			break;
		case AuthLogResultNoMask:
			type = dataManager.getString("Str_AuthLogResultNoMask");
			break;
		case AuthLogResultFeverDetection:
			type = dataManager.getString("Str_AuthLogResultFeverDetection");
			break;
			
		default:
			return "";
			break;
	}
	return type;
}

function getLogFuncType(value) {
	var type = "";
	switch (value) {
		case 0:
			type = dataManager.getString("Str_AuthLogFuncTypeAccess");
			break;
		case 1:
			type = dataManager.getString("Str_AuthLogFuncTypeTna");
			break;
		case 2:
			type = dataManager.getString("Str_AuthLogFuncTypeMeal");
			break;
			
		default:
			type = "";
			break;
	}
	return type;
}

function exportExcel() {
	
	dataManager = getDataManager();
	var dsExportList = app.lookup("ExportAuthLogList");
	var total = dsExportList.getRowCount()
	for (var i = 0; i < total; i++) {
		var authLogInfo = dsExportList.getRow(i);
		
		var groupID = authLogInfo.getValue("GroupCode");
		var groupName = dataManager.getGroupName(groupID);
		authLogInfo.setValue("GroupCode", groupName);
		
		var authType = authLogInfo.getValue("AuthType");
		var authTypeName = getLogAuthTypeString(parseInt(authType));
		authLogInfo.setValue("AuthType", authTypeName);
		
		var authResult = authLogInfo.getValue("AuthResult");
		var authResultName = getLogAuthResultString(parseInt(authResult));
		authLogInfo.setValue("AuthResult", authResultName);
		
		var funcType = authLogInfo.getValue("FuncType");
		var funcTypeName = getLogFuncType(parseInt(funcType));
		authLogInfo.setValue("FuncType", funcTypeName);
		
		/* ExportAuthLogList에서 UserType 일단 삭제. 방문객 구현 완료시 추가
		var userType = authLogInfo.getValue("UserType");
		if( userType == "0") {
			userType = dataManager.getString("Str_User");
		} else {
			userType = dataManager.getString("Str_Visitor");
		}
		*/
		
		/* ExportAuthLogList에서 Property 일단 삭제. 로그 생성 위치, 저장 방법, 외부장비 종류, 관리자 개입 여부 기록 
				var property = authLogInfo.getValue("Property");
		* */
	}
	
	/* original data */
	var today = dateLib.getToday();
	var filename = "AuthLogList_" + today + ".xlsx";
	var ws_name = "AuthLogList_";
	
	var wb = XLSX.utils.book_new(),
		ws = XLSX.utils.json_to_sheet(dsExportList.getRowDataRanged());
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);
	
	XLSX.writeFile(wb, filename);
}

// 도움말
function onALEMP_imgHelpPageClick( /* cpr.events.CMouseEvent */ e) {
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target": DLG_HELP,
			"ID": menu_id
		}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

/*
 * 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
 */
function onALEMP_udcAuthlogListPagechange( /* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type udc.grid.authLogList
	 */
	var aLEMP_udcAuthlogList = e.control;
	sendAuthLogListRequest();
}

/*
 * "재전송" 버튼(ALEMP_btnReSend)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onALEMP_btnReSendClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aLEMP_btnReSend = e.control;
	var udcAuthlogList = app.lookup("ALEMP_udcAuthlogList");
	var checkedRowIndices = udcAuthlogList.getCheckedRowIndices();
	var resendCount = checkedRowIndices.length;
	
	var dsresendList = app.lookup("dsResendList");
	dsresendList.clear();

	for( var i = 0; i < resendCount; i++){
		var resendIndex = checkedRowIndices[i];
		var rowData = udcAuthlogList.getRow(resendIndex);
		
		var delUser = {"IndexKey":rowData.getValue("IndexKey"),"rowIndex":resendIndex};
		dsresendList.addRowData(delUser);
	}
	comLib.showLoadMask("pro","eai 수동전송","",checkedRowIndices.length);
	sendResendAuthLogList();
}

function sendResendAuthLogList() {
	var dsresendList = app.lookup("dsResendList");
	if( dsresendList.getRowCount() == 0 ){
		comLib.hideLoadMask();
		dataManager = getDataManager();
		//dialogAlert(app, "Waning", dataManager.getString("Str_UserNotSelected"));
		return;
	}
	var dsresendData = dsresendList.getRow(0);
	var indexKey = dsresendData.getValue("IndexKey");

	var msg = dataManager.getString("indexKey")+ " : "+indexKey;
	comLib.updateLoadMask(msg);
	
	var sms_postAuthLogReSync = app.lookup("sms_postAuthLogReSync");
	sms_postAuthLogReSync.action = "/v1/kangwonland/authlog/sync";
	sms_postAuthLogReSync.method = "post";
	sms_postAuthLogReSync.mediaType = "application/x-www-form-urlencoded";
	var authLogResync = app.lookup("kwlAuthLogResync");
	authLogResync.clear();
	authLogResync.setValue("IndexKey", indexKey);
	authLogResync.setValue("rowIndex", dsresendData.getValue("rowIndex"));
	sms_postAuthLogReSync.send();
	
}

function onSms_postAuthLogReSyncSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dsresendList = app.lookup("dsResendList");
	dsresendList.realDeleteRow(0);
	var udcAuthlogList = app.lookup("ALEMP_udcAuthlogList");
	var authLogResync = app.lookup("kwlAuthLogResync");
	var idx = authLogResync.getValue("rowIndex");
	udcAuthlogList.setUnCheckAll(idx, false);
	
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE || resultCode == COMERROR_USER_NOT_EXIST ){ // 이미 들어있음
		udcAuthlogList.deleteRow(idx);
		sendResendAuthLogList();
	} else {		
		comLib.hideLoadMask();
		dataManager = getDataManager();
		dialogAlert(app, dataManager.getString("Str_Failed"), 
			"재동기화 실패 처리 되었습니다. 서버 상태를 확인하세요"+ " "+ dataManager.getString(getErrorString(resultCode)));
		
	}
}

function onSms_postAuthLogReSyncSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_postAuthLogReSyncSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
