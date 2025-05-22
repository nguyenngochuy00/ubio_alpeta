/************************************************
 * tnaReport.js
 * Created at 2020. 3. 24. 오후 2:41:58.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var util = cpr.core.Module.require("lib/util");
var comLib;
var TNARP_pageRowCount = 50;
var exportCount = 100; // 한번에 요청할 데이터 수
var tnarp_groupID;
var tnarp_version;

var gridUtil = createGridUtil(app);
var searchExceptRecords = false;
var viewOnlyWorkResult = ["ShiftName", "InTime", "OutTime", "LateTime", "LackTime", "Wt1In", "Wt1Out", "Wt1Time", "Wt1Late", "Wt1Lack", "Wt2Time","Wt3Time","Wt4Time","Wt5Time","Wt6Time", "PaymentEx"];
var viewOnlyExcetpRecords = ["ExceptType", "ExceptStartTime", "ExceptEndTime", "ExceptTime"];

function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("tnaResultListPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}

function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("tnaResultListPageIndexer");
	pageIndex.totalRowCount = totalCount; //전체 데이터 수.
	pageIndex.pageRowCount = TNARP_pageRowCount; //한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount; // 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}

function SetMaxDate() {
	var date = new Date();
    date.setFullYear(date.getFullYear());// y년을 더함
    date.setMonth(date.getMonth());// m월을 더함
    date.setDate(date.getDate());// d일을 더함

	app.lookup("TNARP_dtiStart").maxDate = date;
	app.lookup("TNARP_dtiEnd").maxDate = date;	
}

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad( /* cpr.events.CEvent */ e) {
	comLib = createComUtil(app);
	dataManager = getDataManager();
	
	tnarp_version = dataManager.getSystemVersion();
	var hostApp = app.getHostAppInstance();
	tnarp_groupID = hostApp.callAppMethod("getSelectedTree");
	var dtStart = app.lookup("TNARP_dtiStart");
	var dtEnd = app.lookup("TNARP_dtiEnd");
	
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	dtEnd.value = now.format('YYYY-MM-DD');
	
	//var before = now.add(-30, 'days');
	dtStart.value = now.format('YYYY-MM-DD');
	
	SetMaxDate();
	
	var TNARP_cmbResult = app.lookup("TNARP_cmbRecordType");
	TNARP_cmbResult.value = "0";
	setPageIndexer(0, 1, TNARP_pageRowCount, 10); // 초기값
	
	//group리스트 받아오기
	var dsGroupList = app.lookup("GroupList");
	app.lookup("GroupList");
	
	var groupList = dataManager.getGroup();
	groupList.copyToDataSet(dsGroupList);
	
	var UserID = 0;
	var UserName = 1;
	var UniqueID = 2;
	var GroupCode = 3;
	var Department = 4;
	var PositionName = 5;
	var WorkDate = 6;
	var DayOfWeek = 7;
	var ShiftName = 8;
	var InTime = 9;
	var OutTime = 10;
	var LateTime = 11;
	var LackTime = 12;
	var Wt1ln = 13;
	var Wt1Out = 14;
	var Wt1Late = 15;
	var Wt1Lack = 16;
	var Wt1Time = 17;
	var Wt2Time = 18;
	var Wt3Time = 19;
	var Wt4Time = 20;
	var Wt5Time = 21;
	var Wt6Time = 22;
	var ActualOverTime = 23;
	var PaymentEx = 24;
	var ExceptType = 25;
	var ExceptStartTime = 26;
	var ExceptEndTime = 27;
	var ExceptTime = 28;
	
	app.lookup("TNARP_grdTnaResultList").header.getColumn(UserID).text = dataManager.getString("Str_UserID");
	app.lookup("TNARP_grdTnaResultList").header.getColumn(UserName).text = dataManager.getString("Str_UserName");
	app.lookup("TNARP_grdTnaResultList").header.getColumn(UniqueID).text = dataManager.getString("Str_UniqueID");
	app.lookup("TNARP_grdTnaResultList").header.getColumn(GroupCode).text = dataManager.getString("Str_GroupCode");
	app.lookup("TNARP_grdTnaResultList").header.getColumn(Department).text = dataManager.getString("Str_Department");
	app.lookup("TNARP_grdTnaResultList").header.getColumn(PositionName).text = dataManager.getString("Str_PositionName");
	app.lookup("TNARP_grdTnaResultList").header.getColumn(WorkDate).text = dataManager.getString("Str_WorkDate");
	app.lookup("TNARP_grdTnaResultList").header.getColumn(DayOfWeek).text = dataManager.getString("Str_DayOfWeek");
	app.lookup("TNARP_grdTnaResultList").header.getColumn(ShiftName).text = dataManager.getString("Str_ShiftName");
	app.lookup("TNARP_grdTnaResultList").header.getColumn(InTime).text = dataManager.getString("Str_Intime");
	app.lookup("TNARP_grdTnaResultList").header.getColumn(OutTime).text = dataManager.getString("Str_Outtime");
	app.lookup("TNARP_grdTnaResultList").header.getColumn(LateTime).text = dataManager.getString("Str_Latetime");
	app.lookup("TNARP_grdTnaResultList").header.getColumn(LackTime).text = dataManager.getString("Str_Leavetime");
	app.lookup("TNARP_grdTnaResultList").header.getColumn(Wt1ln).text = dataManager.getString("Str_WorkingTimeIN");
	app.lookup("TNARP_grdTnaResultList").header.getColumn(Wt1Out).text = dataManager.getString("Str_WorkingTimeOUT");
	app.lookup("TNARP_grdTnaResultList").header.getColumn(Wt1Late).text = dataManager.getString("Str_BasicWorkLate");
	app.lookup("TNARP_grdTnaResultList").header.getColumn(Wt1Lack).text = dataManager.getString("Str_BasicWorkLack");
	app.lookup("TNARP_grdTnaResultList").header.getColumn(Wt1Time).text = dataManager.getString("Str_BasicWorkTime");
	app.lookup("TNARP_grdTnaResultList").header.getColumn(Wt2Time).text = dataManager.getString("Str_TimeBeforeShift");
	app.lookup("TNARP_grdTnaResultList").header.getColumn(Wt3Time).text = dataManager.getString("Str_Overtime1Hours");
	app.lookup("TNARP_grdTnaResultList").header.getColumn(Wt4Time).text = dataManager.getString("Str_Overtime2Hours");
	app.lookup("TNARP_grdTnaResultList").header.getColumn(Wt5Time).text = dataManager.getString("Str_OffDayHours");
	app.lookup("TNARP_grdTnaResultList").header.getColumn(Wt6Time).text = dataManager.getString("Str_Overtime3Hours");
	app.lookup("TNARP_grdTnaResultList").header.getColumn(PaymentEx).text = dataManager.getString("Str_Payment");
	app.lookup("TNARP_grdTnaResultList").header.getColumn(ExceptType).text = dataManager.getString("Str_ExceptType");
	app.lookup("TNARP_grdTnaResultList").header.getColumn(ExceptStartTime).text = dataManager.getString("Str_ExceptStartTime");
	app.lookup("TNARP_grdTnaResultList").header.getColumn(ExceptEndTime).text = dataManager.getString("Str_ExceptEndTime");
	app.lookup("TNARP_grdTnaResultList").header.getColumn(ExceptTime).text = dataManager.getString("Str_ExceptTime");
	
	// 예멘향 실제 초과 시간 컬럼 추가 
	if(dataManager.getOemVersion() == OEM_YEMEN){
		viewOnlyWorkResult.push("ActualOverTime");
		app.lookup("TNARP_grdTnaResultList").header.getColumn(ActualOverTime).visible = true;
		app.lookup("TNARP_grdTnaResultList").header.getColumn(ActualOverTime).text = dataManager.getString("Str_ActualOverTime");
	} 
	
	//합계 그리드
	var TotalWorkTime = 0;
	var TotalPayment = 1;
	app.lookup("TNARP_grdTnaResultSum").header.getColumn(TotalWorkTime).text = dataManager.getString("Str_ToatlWorkTime");
	app.lookup("TNARP_grdTnaResultSum").header.getColumn(TotalPayment).text = dataManager.getString("Str_ToatlPayment");
	
	var TNARP_btnPDF = app.lookup("TNARP_btnPDF");
	TNARP_btnPDF.text = dataManager.getString("Str_PDFSave");
	
	//sendTnaResultListRequest();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getTnaResultListSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		var viewPageCount = totalCount / TNARP_pageRowCount + (totalCount % TNARP_pageRowCount > 0);
		if (viewPageCount > 10) {
			viewPageCount = 10;
		}
		var dsTnaList = app.lookup("tnaResultList");
		dsTnaList = util.setDayofWeekLangMapping(dsTnaList, dataManager);
		
		// 실제초과시간 계산 
		dsTnaList = util.ActualOverTime(dsTnaList);
		
		app.lookup("TNARP_opbTotal").value = totalCount;
		
		selectPaging(totalCount, viewPageCount);
		
	} else {
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_AuthLog";
		if (errStr.length > 0) {
			errMsg = dataManager.getString(errStr);
		} else {
			errMsg = dataManager.getString(errMsg);
		}
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
	}
	
	var hostApp = app.getHostAppInstance();
	tnarp_groupID = hostApp.callAppMethod("getSelectedTree");
	app.lookup("TAPRD_cmbGroup").selectItemByValue(tnarp_groupID);
	
	var dsTnaResultSum = app.lookup("dsTnaResultSum");
	
	//ds 클리어	
	dsTnaResultSum.clear();
	//ds에 행 하나를 추가, addedRow로 받아옴
	var addedRow = dsTnaResultSum.addRow();
	
	//data map에 받아온 결과를 ds에 세팅
	addedRow.setValue("TotalWorkTime", app.lookup("tnaResultSum").getValue("TotalWorkTime"));
	addedRow.setValue("TotalPayment", app.lookup("tnaResultSum").getValue("TotalPaymentEx"));
	
	//조회컬럼 수정, 기록 수정여부 설정
	var tnaList = app.lookup("TNARP_grdTnaResultList");
	if (searchExceptRecords === true) {
		gridUtil.gridColumnsVisible("TNARP_grdTnaResultList", viewOnlyWorkResult, false);
		gridUtil.gridColumnsVisible("TNARP_grdTnaResultList", viewOnlyExcetpRecords, true);
	} else {
		gridUtil.gridColumnsVisible("TNARP_grdTnaResultList", viewOnlyWorkResult, true);
		gridUtil.gridColumnsVisible("TNARP_grdTnaResultList", viewOnlyExcetpRecords, false);
	}
	comLib.hideLoadMask();
	app.lookup("TNARP_grdTnaResultList").redraw();
	app.lookup("TNARP_grpMain").redraw();
}

function onSms_getTnaResultListSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getTnaResultListSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTNARP_btnSeachClick( /* cpr.events.CMouseEvent */ e) {
	var startTime = app.lookup("TNARP_dtiStart").value;
	var endTime = app.lookup("TNARP_dtiEnd").value;
	var isStartEndDateValid = util.isStartEndDateValid(startTime, endTime);
	if (isStartEndDateValid === false) {
		dialogAlert(app.getHostAppInstance(), "error", dataManager.getString("Str_ErrorStartEndDateInvalid"));
		return false
	}
	
	//pageIndex 초기 화
	searchExceptRecords = app.lookup("cbx_searchExceptRecords").checked;
	var pageIndex = app.lookup("tnaResultListPageIndexer");
	pageIndex.currentPageIndex = 1;
	sendTnaResultListRequest(true);
	
}

/*
 * "PDF 저장" 버튼(TNARP_btnPDF)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTNARP_btnPDFClick( /* cpr.events.CMouseEvent */ e) {
	
	var dtStart = app.lookup("TNARP_dtiStart");
	var dtEnd = app.lookup("TNARP_dtiEnd");
	var category = app.lookup("TNARP_cmbCategory").value;
	var keyword = app.lookup("TNARP_ipbKeyword").value;
	
	var recordType = app.lookup("TNARP_cmbRecordType").value;
	if (keyword == null || keyword.length < 1) {
		category = "";
		keyword = "";
	}
	
	console.log("*******************************************");
	console.log(dataManager.getString("Str_DefaultValue"));
	console.log(dataManager.getString("Str_Apply"));
	
	var btnText1 = dataManager.getString("Str_DefaultValue");
	var btnText2 = dataManager.getString("Str_Apply");
	
	var locale = dataManager.getLocale();
	
	var address = document.URL.toString() + '/tnaReportPage?' + '&startTime=' + dtStart.value + '&endTime=' + dtEnd.value +
		'&groupID=' + tnarp_groupID + '&searchCategory=' + category + '&searchKeyword=' + keyword +
		'&version=' + tnarp_version + '&reportType=' + recordType + '&btnText1=' + btnText1 + '&btnText2=' + btnText2 +
		'&locale=' + locale;
	
	console.log(address);
	
	var wp = window.open(address, '_blank', 'width=1024,height=768,resizable=no,location=no,toolbar=no,menubar=no');
}

/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onACARM_imgHelpClick( /* cpr.events.CMouseEvent */ e) {
	var hostAppIns = app.getHostAppInstance();
	var bOptResult = hostAppIns.callAppMethod("helpPageRequest", "Tna");
}

/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onTnaResultListPageIndexerSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var tnaResultListPageIndexer = e.control;
	sendTnaResultListRequest(true);
}

function sendTnaResultListRequest(isList) {
	var hostApp = app.getHostAppInstance();
	tnarp_groupID = hostApp.callAppMethod("getSelectedTree");
	
	var pageIndex = app.lookup("tnaResultListPageIndexer");
	var curIndex = pageIndex.currentPageIndex;
	var offset = (curIndex - 1) * TNARP_pageRowCount;
	
	var submision;
	if (isList == true) {
		submision = app.lookup("sms_getTnaResultList");
		submision.setParameters("offset", offset);
		submision.setParameters("limit", TNARP_pageRowCount);
		
	} else {
		submision = app.lookup("sms_getTnaResultListExport");
		var exportParam = app.lookup("ExportParam");
		offset = exportParam.getValue("offset");
		submision.setParameters("limit", exportCount);
		submision.setParameters("offset", exportParam.getValue("offset"));
	}
	
	var dtStart = app.lookup("TNARP_dtiStart");
	var dtEnd = app.lookup("TNARP_dtiEnd");
	
	var cmbCategory = app.lookup("TNARP_cmbCategory");
	var edtKeyword = app.lookup("TNARP_ipbKeyword");
	var recordType = app.lookup("TNARP_cmbRecordType").value;
	
	submision.setParameters("startTime", dtStart.value + " 00:00:00");
	submision.setParameters("endTime", dtEnd.value + " 23:59:59");
	submision.setParameters("groupID", tnarp_groupID);
	submision.setParameters("recordType", recordType);
	
	//제외시간 조회 확인
	submision.setParameters("searchExceptRecords", app.lookup("cbx_searchExceptRecords").value);
	if (searchExceptRecords === false) {
		submision.setParameters("searchAbsent", app.lookup("cbx_searchAbsent").value);
		submision.setParameters("searchLack", app.lookup("cbx_searchLack").value);
		submision.setParameters("searchLate", app.lookup("cbx_searchLate").value);
	}
	
	submision.setParameters("searchCategory", cmbCategory.value);
	submision.setParameters("searchKeyword", edtKeyword.value);
	if (edtKeyword.value == null || edtKeyword.value.length <= 0) {
		submision.setParameters("searchCategory", "");
		submision.setParameters("searchKeyword", "");
	}
	var dsTnaResultList = app.lookup("tnaResultList");
	dsTnaResultList.clear();
	
	if (isList == true) {
		comLib.showLoadMask("", dataManager.getString("Str_Load"), "", 1);
	}
	submision.send();
}

function onExcelExportButtonClick( /* cpr.events.CMouseEvent */ e) {
	var total = app.lookup("Total").getValue("Count");
	if (total == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
		return
	}
	var dm_ExportParam = app.lookup("ExportParam");
	dm_ExportParam.setValue("total", total);
	dm_ExportParam.setValue("offset", 0);
	var totalStep = total / exportCount + (total % exportCount != 0) ? 1 : 0;
	comLib.showLoadMask("pro", dataManager.getString("Str_DataExport"), "", totalStep);
	
	sendTnaResultListRequest(false);
}

function onSms_getTnaResultListExportSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var exportParam = app.lookup("ExportParam");
		var dsDataExport = app.lookup("tnaResultListExport");
		var dsData = app.lookup("tnaResultList");
		
		// 실제 초과근무 계산
		if(dataManager.getOemVersion() == OEM_YEMEN){
			dsData = util.ActualOverTime(dsData);
		}
		
		if (dsData.getRowCount() == 0) {
			comLib.hideLoadMask();
			if (dsData.getRowCount() > 0) {
				exportExcel();
				dsDataExport.clear();
			} else {
				dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
			}
		} else {
			var count = dsData.getRowCount();
			dsData.copyToDataSet(dsDataExport)
			
			if (dsDataExport.getRowCount() >= exportParam.getValue("total")) {
				exportExcel();
				comLib.hideLoadMask();
				dsDataExport.clear();
				sendTnaResultListRequest(true);
			} else {
				var offset = exportParam.getValue("offset")
				offset += exportCount
				exportParam.setValue("offset", offset)
				comLib.updateLoadMask(offset);
				sendTnaResultListRequest(false);
			}
		}
	} else {
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function exportExcel() {
	
	var dsExportList = app.lookup("tnaResultListExport");
	
	dsExportList = util.setDayofWeekLangMapping(dsExportList, dataManager);
	var total = dsExportList.getRowCount();
	
	//tnaResultListExport에서는 PaymentEx 대신 Payment 컬럼을 다듬어 사용하기 때문에 
	viewOnlyWorkResult.pop(); //"PaymentEx" 제거
	viewOnlyWorkResult.push("Payment"); //대신 "Payment" 추가
	
	if (searchExceptRecords === true) {
		//제외기록 조회 시 숨길 컬럼 "-"로 만들기
		for (var i = 0; i < total; i++) {
			var tnaInfo = dsExportList.getRow(i);
			for (var ii = 0; ii < viewOnlyWorkResult.length; ii++) {
				tnaInfo.setValue(viewOnlyWorkResult[ii], "-");
			}
		}
	} else {
		//근태결과 조회 시 숨길 컬럼 "-"로 만들기
		for (var i = 0; i < total; i++) {
			var tnaInfo = dsExportList.getRow(i);
			tnaInfo.setValue("Payment", util.thousandsSeparator(tnaInfo.getValue("Payment")));
			for (var ii = 0; ii < viewOnlyExcetpRecords.length; ii++) {
				tnaInfo.setValue(viewOnlyExcetpRecords[ii], "-");
			}
		}
	}
	
	var stringified = JSON.stringify(dsExportList.getRowDataRanged());
	stringified = stringified.replace(/"UserID"/gi, '"' + dataManager.getString("Str_ID") + '"');
	stringified = stringified.replace(/"Name"/gi, '"' + dataManager.getString("Str_Name") + '"');
	stringified = stringified.replace(/"UniqueID"/gi, '"' + dataManager.getString("Str_UniqueID") + '"');
	stringified = stringified.replace(/"GroupName"/gi, '"' + dataManager.getString("Str_GroupID") + '"');
	stringified = stringified.replace(/"DepartmentName"/gi, '"' + dataManager.getString("Str_Department") + '"');
	stringified = stringified.replace(/"PositionName"/gi, '"' + dataManager.getString("Str_Position") + '"');
	stringified = stringified.replace(/"WorkDate"/gi, '"' + dataManager.getString("Str_WorkDate") + '"');
	stringified = stringified.replace(/"DayOfWeek"/gi, '"' + dataManager.getString("Str_Days") + '"');
//	stringified = stringified.replace(/"ShiftName"/gi, '"' + dataManager.getString("Str_WorkDayName") + '"');
	
	//제외시간 조건 여부에 따른 컬럼
	if (searchExceptRecords === true) {
		for (var i = 0; i < viewOnlyWorkResult.length; i++) {
			var prefix;
			//첫번째 컬럼일 때 prefix 수정처리
			if (stringified.indexOf("{\"" + viewOnlyWorkResult[i]) !== -1) {
				prefix = "\"";
			} else {
				prefix = ",\"";
			}
			var regexp = new RegExp(prefix + viewOnlyWorkResult[i] + "\":\"-\"", "gi");
			stringified = stringified.replace(regexp, "");
		}
		stringified = stringified.replace(/"ExceptType"/gi, '"' + dataManager.getString("Str_ExceptType") + '"');
		stringified = stringified.replace(/"ExceptStartTime"/gi, '"' + dataManager.getString("Str_ExceptStartTime") + '"');
		stringified = stringified.replace(/"ExceptEndTime"/gi, '"' + dataManager.getString("Str_ExceptEndTime") + '"');
		stringified = stringified.replace(/"ExceptTime"/gi, '"' + dataManager.getString("Str_ExceptTime") + '"');
	} else {
		for (var i = 0; i < viewOnlyExcetpRecords.length; i++) {
			var prefix;
			//첫번째 컬럼일 때 prefix 수정처리
			if (stringified.indexOf("{\"" + viewOnlyWorkResult[i]) !== -1) {
				prefix = "\"";
			} else {
				prefix = ",\"";
			}
			var regexp = new RegExp(prefix + viewOnlyExcetpRecords[i] + "\":\"-\"", "gi");
			stringified = stringified.replace(regexp, "");
		}
		stringified = stringified.replace(/"ShiftName"/gi, '"' + dataManager.getString("Str_ShiftName") + '"');
		stringified = stringified.replace(/"InTime"/gi, '"' + dataManager.getString("Str_Intime") + '"');
		stringified = stringified.replace(/"OutTime"/gi, '"' + dataManager.getString("Str_Outtime") + '"');
		stringified = stringified.replace(/"LateTime"/gi, '"' + dataManager.getString("Str_Latetime") + '"');
		stringified = stringified.replace(/"LackTime"/gi, '"' + dataManager.getString("Str_Leavetime") + '"');
		stringified = stringified.replace(/"Wt1In"/gi, '"' + dataManager.getString("Str_WorkingTimeIN") + '"');
		stringified = stringified.replace(/"Wt1Out"/gi, '"' + dataManager.getString("Str_WorkingTimeOUT") + '"');
		stringified = stringified.replace(/"Wt1Time"/gi, '"' + dataManager.getString("Str_BasicWorkTime") + '"');
		stringified = stringified.replace(/"Wt1Late"/gi, '"' + dataManager.getString("Str_LateINfrom") + '"');
		stringified = stringified.replace(/"Wt1Lack"/gi, '"' + dataManager.getString("Str_EarlyOUTfrom") + '"');
		stringified = stringified.replace(/"Wt2Time"/gi, '"' + dataManager.getString("Str_TimeBeforeShift") + '"');
		stringified = stringified.replace(/"Wt3Time"/gi, '"' + dataManager.getString("Str_Overtime1Hours") + '"');
		stringified = stringified.replace(/"Wt4Time"/gi, '"' + dataManager.getString("Str_Overtime2Hours") + '"');
		stringified = stringified.replace(/"Wt5Time"/gi, '"' + dataManager.getString("Str_OffDayHours") + '"');
		stringified = stringified.replace(/"Wt6Time"/gi, '"' + dataManager.getString("Str_Overtime3Hours") + '"');
		stringified = stringified.replace(/"Payment"/gi, '"' + dataManager.getString("Str_Payment") + '"');
		
		if(dataManager.getOemVersion() == OEM_YEMEN){
			stringified = stringified.replace(/"ActualOverTime"/gi, '"' + dataManager.getString("Str_ActualOverTime") + '"');
		} else {
			stringified = stringified.replace(/"ActualOverTime"/gi, '""');
		}
	}
	
	//viewOnlyWorkResult 원상복구 
	viewOnlyWorkResult.pop();
	viewOnlyWorkResult.push("PaymentEx");
	
	var inputData = JSON.parse(stringified);
	
	var today = dateLib.getToday();
	var filename = "TNA_Report_" + today + ".xlsx";
	var ws_name = "TNA_Report_";
	
	var wb = XLSX.utils.book_new(),
		ws = XLSX.utils.json_to_sheet(inputData);
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);
	
	XLSX.writeFile(wb, filename);
}

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onTAPRD_cmbGroupSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var tAPRD_cmbGroup = e.control;
	var hostApp = app.getHostAppInstance();
	tnarp_groupID = hostApp.callAppMethod("SelectTree", tAPRD_cmbGroup.value);
	onTNARP_btnSeachClick(e);
}

/*
 * 체크 박스에서 value-change 이벤트 발생 시 호출.
 * CheckBox의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onCbx_searchAbnormalAllValueChange( /* cpr.events.CValueChangeEvent */ e) {
	/** 
	 * @type cpr.controls.CheckBox
	 */
	var cbx_searchAbnormalAll = e.control;
	var searchAbnormalAllToggle = cbx_searchAbnormalAll.checked;
	searchAbnormalAllToggleChange(searchAbnormalAllToggle);
}

function searchAbnormalAllToggleChange(searchAbnormalAllToggle) {
	app.lookup("cbx_searchAbsent").checked = searchAbnormalAllToggle;
	app.lookup("cbx_searchLack").checked = searchAbnormalAllToggle;
	app.lookup("cbx_searchLate").checked = searchAbnormalAllToggle;
}

/*
 * 체크 박스에서 value-change 이벤트 발생 시 호출.
 * CheckBox의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onCbx_searchExceptRecordsValueChange2( /* cpr.events.CValueChangeEvent */ e) {
	/** 
	 * @type cpr.controls.CheckBox
	 */
	var cbx_searchExceptRecords = e.control;
	var exceptRecordsToggle = cbx_searchExceptRecords.checked;
	
	//제외기록 조회 시 그리드 수정, 근태이상 조건 사용여부 수정
	if (exceptRecordsToggle === true) {
		app.lookup("cbx_searchAbnormalAll").checked = !exceptRecordsToggle;
		searchAbnormalAllToggleChange(!exceptRecordsToggle);
		app.lookup("cbxGroup_searchAbnormal").enabled = !exceptRecordsToggle;
	} else {
		app.lookup("cbxGroup_searchAbnormal").enabled = !exceptRecordsToggle;
	}
}
