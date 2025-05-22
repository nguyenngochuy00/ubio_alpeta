/************************************************
 * processingResults.js
 * Created at 2019. 2. 7. 오후 7:02:53.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var util = cpr.core.Module.require("lib/util");

var comLib;
var pageRowCount = 50;
var exportCount = 100; // 한번에 요청할 데이터 수
var searchExceptRecords = false;
var editableFlag;

var viewOnlyWorkResult = ["ShiftName","InTime", "OutTime", "LateTime", "LackTime","Wt1In", "Wt1Out", "Wt1Time", "Wt1Late", "Wt1Lack", "Wt2Time","Wt3Time","Wt4Time","Wt5Time","Wt6Time", "PaymentEx"];
var viewOnlyExcetpRecords = ["ExceptType", "ExceptStartTime", "ExceptEndTime", "ExceptTime"];

function RefreshData() {
	var today = dateLib.getDate();
	var searchDate = dateLib.addDay(today, -1);
	app.lookup("TAPRD_dtiStart").value = searchDate;
	app.lookup("TAPRD_dtiEnd").value = searchDate;
	
	var date = new Date();
    date.setFullYear(date.getFullYear());// y년을 더함
    date.setMonth(date.getMonth());// m월을 더함
    date.setDate(date.getDate() -1);// d일을 더함
    
	app.lookup("TAPRD_dtiStart").maxDate = date;
	app.lookup("TAPRD_dtiEnd").maxDate = date;	
}

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad( /* cpr.events.CEvent */ e) {
	comLib = createComUtil(app);
	dataManager = getDataManager();
	
	var udcTnaList = app.lookup("TAPRD_udcTnaList");
	udcTnaList.setPaging(0, 1, 10, pageRowCount);
	
	var initValue = app.getHost().initValue;
	
	var dsGroupList = app.lookup("GroupList");
	app.lookup("GroupList");
	
	var groupList = dataManager.getGroup();
	groupList.copyToDataSet(dsGroupList);
	RefreshData();
	
	// YEMEN 향 실제 초과근무시간 데이터 추가  -mjy
	if(dataManager.getOemVersion() == OEM_YEMEN){
		viewOnlyWorkResult.push("ActualOverTime");
	}
	
	//TODO : 관리자 권한에 따른 초기 정보값 수정.
	app.lookup("TAPRD_treeGroup").redraw();
	
	//사용자의 privilege 확인 후 근태시간 수정 다이얼로그 open 리스너 추가
	editableIfManager();
	optionCmbGroup();
}

function optionCmbGroup(){
	
	var userPrivilege = Number(dataManager.getAccountInfo().getValue("Privilege"));
	if(userPrivilege == 1){
		app.lookup("TAPRD_cmbGroup").visible=true;
		app.lookup("TAPRD_group").visible=true;
		
	} else {
		app.lookup("TAPRD_cmbGroup").visible=false;
		app.lookup("TAPRD_group").visible=false;
		
	}
}
	
//수정가능여부
function editableIfManager() {
	var userPrivilege = dataManager.getAccountInfo().getValue("Privilege");
	if (userPrivilege == 1) {
		app.lookup("TAPRD_opAbleToEditTNA").visible = true;
		app.lookup("TAPRD_udcTnaList").editableGrid();
		editableFlag = true;
	} else {
		app.lookup("TAPRD_opAbleToEditTNA").visible = false;
		app.lookup("TAPRD_udcTnaList").uneditableGrid();
		editableFlag = false;
	}
}

/*
 * "검  색" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTAPRD_btnSearchClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var tAPRD_btnSearch = e.control;
	var startTime = app.lookup("TAPRD_dtiStart").value;
	var endTime = app.lookup("TAPRD_dtiEnd").value;
	var isStartEndDateValid = util.isStartEndDateValid(startTime, endTime);
	if (isStartEndDateValid === false) {
		dialogAlert(app.getHostAppInstance(), "error", dataManager.getString("Str_ErrorStartEndDateInvalid"));
		return false
	}
	searchExceptRecords = app.lookup("cbx_searchExceptRecords").checked;
	var udcTnaList = app.lookup("TAPRD_udcTnaList");
	udcTnaList.setCurrentPageIndex(1);
	sendTnaListRequest(true);
}

function sendTnaListRequest(isList) {
	
	var udcTnarList = app.lookup("TAPRD_udcTnaList");
	var curIndex = udcTnarList.getCurrentPageIndex();
	var offset = (curIndex - 1) * pageRowCount
	
	//var smsGetTnaList = app.lookup("sms_getTnaResultList");
	var submision;
	if (isList == true) {
		submision = app.lookup("sms_getTnaResultList");
		submision.setParameters("offset", offset);
		submision.setParameters("limit", pageRowCount);
	} else {
		submision = app.lookup("sms_getTnaResultListExprot");
		var exportParam = app.lookup("ExportParam");
		offset = exportParam.getValue("offset");
		submision.setParameters("limit", exportCount);
		submision.setParameters("offset", exportParam.getValue("offset"));
	}
	
	var groupList = app.lookup("TAPRD_treeGroup");
	
	// TODO 일단 하나만 선택, 확인 받은후 복수 선택 관련하여 추가 작업 진행
	var group = groupList.getSelectionFirst();
	var groupCmb = app.lookup("TAPRD_cmbGroup");
	
	if (group != undefined && group.value != "") {
		submision.setParameters("groupID", parseInt(group.value, 10));
		groupCmb.selectItemByValue(group.value);
	} else {
		submision.setParameters("groupID", 0);
	}
	
	var cmbCategory = app.lookup("TNARP_cmbCategory");
	var edtKeyword = app.lookup("TNARP_ipbKeyword");
	var recordType = app.lookup("TNARP_cmbRecordType").value;
	
	submision.setParameters("startTime", app.lookup("TAPRD_dtiStart").value);
	submision.setParameters("endTime", app.lookup("TAPRD_dtiEnd").value);
	
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
	// TODO : 완성 미완성 처리 
	submision.setParameters("subInclude", "true");
	
	app.lookup("tnaResultList").clear();
	if (isList == true) {
		comLib.showLoadMask("", dataManager.getString("Str_Load"), "", 1);
	}
	submision.send();
}

/*
 * 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
 */
function onTAPRD_udcTnaListPagechange( /* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type udc.grid.tnaList
	 */
	var tAPRD_udcTnaList = e.control;
	var newIndex = e.newSelection;
	
	sendTnaListRequest(true);
}

/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onImageClick( /* cpr.events.CMouseEvent */ e) {
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	console.log(menu_id);
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target": DLG_HELP,
			"ID": menu_id
		}
	});
	
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

/*
 * "Button" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	app.lookup("tnaResultList").clear();
	var button = e.control;
	var udcTnaList = app.lookup("TAPRD_udcTnaList");
	udcTnaList.setCurrentPageIndex(1);

	var startTime = app.lookup("TAPRD_dtiStart").value;
	var endTime = app.lookup("TAPRD_dtiEnd").value;
	var isStartEndDateValid = util.isStartEndDateValid(startTime, endTime);
	if (isStartEndDateValid === false) {
		dialogAlert(app.getHostAppInstance(), "error", dataManager.getString("Str_ErrorStartEndDateInvalid"));
		return false
	}	
	comLib.showLoadMask("", dataManager.getString("Str_Load"), "", 1);
	//v1/tna/tnaProcessing
	var smsGetTnaList = app.lookup("sms_getTnaProcessing");
	var groupList = app.lookup("TAPRD_treeGroup");
	
	// TODO 일단 하나만 선택, 확인 받은후 복수 선택 관련하여 추가 작업 진행
	var group = groupList.getSelectionFirst();
	if (group != undefined && group.value != "") {
		smsGetTnaList.setParameters("groupID", parseInt(group.value, 10));
	} else {
		smsGetTnaList.setParameters("groupID", 0);
	}
	
	smsGetTnaList.setParameters("startTime", startTime);
	smsGetTnaList.setParameters("endTime", endTime);
	// TODO : 완성 미완성 처리 
	
	smsGetTnaList.send();
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
 * 트리에서 selection-change 이벤트 발생 시 호출.
 * 선택된 Item 값이 저장된 후에 발생하는 이벤트.
 */
function onTAPRD_treeGroupSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type cpr.controls.Tree
	 */
	onTAPRD_btnSearchClick(e);
}

function onTNARP_btnExcelExportClick( /* cpr.events.CMouseEvent */ e) {
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
	
	sendTnaListRequest(false);
}

/* 서브미션 응답 */
function onSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

//function onSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
//	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
//}

function onSms_getTnaResultListSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getTnaResultList = e.control;
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dsTnaList = app.lookup("tnaResultList");
		
		dsTnaList = util.setDayofWeekLangMapping(dsTnaList, dataManager);
		
		// YEMEN 향 실제 초과근무시간 데이터 추가
		if(dataManager.getOemVersion() == OEM_YEMEN){
			viewOnlyWorkResult.push("ActualOverTime");
			dsTnaList = util.ActualOverTime(dsTnaList);
		}
		
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		
		var recvCount = dsTnaList.getRowCount();
		console.log(recvCount);
		var totalLabel = app.lookup("TAPRD_totalCnt");
		totalLabel.value = totalCount;
		
		var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
		if (viewPageCount > 10) {
			viewPageCount = 10;
		}
		var dsTnaResultSum = app.lookup("dsTnaResultSum");
		
		//ds 클리어	
		dsTnaResultSum.clear();
		//ds에 행 하나를 추가, addedRow로 받아옴
		var addedRow = dsTnaResultSum.addRow();
		
		//data map에 받아온 결과를 ds에 세팅
		addedRow.setValue("TotalWorkTime", app.lookup("tnaResultSum").getValue("TotalWorkTime"));
		addedRow.setValue("TotalPayment", app.lookup("tnaResultSum").getValue("TotalPaymentEx"));
		
		//조회컬럼 수정, 기록 수정여부 설정
		var udcTnaList = app.lookup("TAPRD_udcTnaList");
		if (searchExceptRecords === true) {
			udcTnaList.columnsVisible("tnaListGrid", viewOnlyWorkResult, false);
			udcTnaList.columnsVisible("tnaListGrid", viewOnlyExcetpRecords, true);
			if (editableFlag === true) {
				udcTnaList.uneditableGrid();
				editableFlag = false;
			}
			app.lookup("TAPRD_opAbleToEditTNA").visible = false;
		} else {
			udcTnaList.columnsVisible("tnaListGrid", viewOnlyWorkResult, true);
			udcTnaList.columnsVisible("tnaListGrid", viewOnlyExcetpRecords, false);
			if (editableFlag === false) {
				editableIfManager();
			}
		}
		
		comLib.hideLoadMask();
		//udc에 setting하여 redraw
		udcTnaList.setUserList(dsTnaList);
		udcTnaList.setTnaResultSum(dsTnaResultSum);
		udcTnaList.setPaging(totalCount, pageRowCount, viewPageCount);
		udcTnaList.redraw();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	} 
}

function onSms_getTnaProcessingSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getTnaProcessing = e.control;
	// console.log("commit");
	
	comLib.hideLoadMask();
	var dmResult = app.lookup("Result");
	var result = dmResult.getValue("ResultCode");
	
	if (result == COMERROR_NONE) {
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Complete"));
	} else {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Error") + " : " + dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
		return;
	}
	
}

function onSms_getTnaResultListExprotSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var exportParam = app.lookup("ExportParam");
		var dsDataExport = app.lookup("tnaResultListExport");
		var dsData = app.lookup("tnaResultList");
		
		
		// YEMEN 향 실제 초과근무시간 데이터 추가  -mjy
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
				sendTnaListRequest(true);
			} else {
				var offset = exportParam.getValue("offset")
				offset += exportCount
				exportParam.setValue("offset", offset)
				comLib.updateLoadMask(offset);
				sendTnaListRequest(false);
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
	stringified = stringified.replace(/"GroupName"/gi, '"' + dataManager.getString("Str_GroupName") + '"');
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
		stringified = stringified.replace(/"ShiftName"/gi, '"' + dataManager.getString("Str_WorkDayName") + '"');
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
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTNARP_btnSeachClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Container
	 */
	onTAPRD_btnSearchClick(e);
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
	app.lookup("TAPRD_treeGroup").selectItemByValue(tAPRD_cmbGroup.value);
}

/*
 * 체크 박스에서 value-change 이벤트 발생 시 호출.
 * CheckBox의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onCbx_searchExceptRecordsValueChange( /* cpr.events.CValueChangeEvent */ e) {
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

