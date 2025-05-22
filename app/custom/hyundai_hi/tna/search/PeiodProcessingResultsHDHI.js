/************************************************
 * PeiodProcessingResultsHDHI.js
 * Created at 2024. 3. 22. 오전 9:10:28.
 *
 * @author zxc
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var util = cpr.core.Module.require("lib/util");

var comLib;
var pageRowCount = 50;
var exportCount = 100; // 한번에 요청할 데이터 수
var partnerFlag = false;
var editableFlag;

var viewOnlyAdmin = ["GroupName","PartnerName", "InTimePnTerName","OutTimePnTerName", "PnTerMatchFlag", "Title", "Position", "Nationality", "Gender", "BirthDay", "BTime", "LTime", "DTime" ];

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	// todo 그룹 이랑 파트너 콤보박스 처음 실행시 안보이게
	var udcTnaList = app.lookup("PPRH_udcTnaList");
	udcTnaList.setPaging(0, 1, 10, pageRowCount);
	
	var initValue = app.getHost().initValue;

	var accountInfo = dataManager.getAccountInfo();
	var privilege = Number(accountInfo.getValue("Privilege"));
	if (privilege == 1) {
		var udcTnaList = app.lookup("PPRH_udcTnaList");
		udcTnaList.columnsVisible("tnaListGrid", viewOnlyAdmin, true);
		udcTnaList.redraw();
	} else {
		var partnerID = accountInfo.getValue("UserAff");
		app.lookup("PPRH_cmbPartner").value = partnerID;
		partnerFlag = true;
	}
	
	var dsGroupList = app.lookup("GroupList");
	var groupList = dataManager.getGroup();
	groupList.copyToDataSet(dsGroupList);
	
	var dsPartnerList = app.lookup("HDHIPartnerList");
	var partnerList = dataManager.getPartnerListHDHI();
	partnerList.copyToDataSet(dsPartnerList);
	
	RefreshData();
	
	//사용자의 privilege 확인 후 근태시간 수정 다이얼로그 open 리스너 추가
	editableIfManager();
	optionCmbGroup();
}

function optionCmbGroup(){
	
	var userPrivilege = Number(dataManager.getAccountInfo().getValue("Privilege"));
	if(userPrivilege == 1){
		app.lookup("PPRH_cmbGroup").visible=true;
		app.lookup("PPRH_group").visible=true;
		app.lookup("PPRH_btnGroupClear").visible=true;
		app.lookup("PPRH_btnPartnerClear").visible=true;
		app.lookup("PPRH_btnTnaProcess").visible=true;
	} else {
		app.lookup("PPRH_cmbGroup").visible=false;
		app.lookup("PPRH_group").visible=false;
		app.lookup("PPRH_btnGroupClear").visible=false;
		app.lookup("PPRH_btnPartnerClear").visible=false;
		app.lookup("PPRH_cmbPartner").enabled=false;
		app.lookup("PPRH_btnTnaProcess").visible=false;
	}
}
	
//수정가능여부
function editableIfManager() {
	var userPrivilege = dataManager.getAccountInfo().getValue("Privilege");
	if (userPrivilege == 10001) {		// 협력사 관리자만 수정 가능
		app.lookup("PPRH_opAbleToEditTNA").visible = true;
		app.lookup("PPRH_udcTnaList").editableGrid();
		editableFlag = true;
	} else {
		app.lookup("PPRH_opAbleToEditTNA").visible = false;
		editableFlag = false;
	}
}

function RefreshData() {
	var today = dateLib.getDate();
	var searchDate = dateLib.addDay(today, -1);
	app.lookup("PPRH_dtiStart").value = searchDate;
	app.lookup("PPRH_dtiEnd").value = searchDate;
	
	var date = new Date();
    date.setFullYear(date.getFullYear());// y년을 더함
    date.setMonth(date.getMonth());// m월을 더함
    date.setDate(date.getDate() -1);// d일을 더함
    
	app.lookup("PPRH_dtiStart").maxDate = date;
	app.lookup("PPRH_dtiEnd").maxDate = date;	
}

/*
 * 버튼(PPRH_btnSearch)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onPPRH_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var pPRH_btnSearch = e.control;
	var tAPRD_btnSearch = e.control;
	var startTime = app.lookup("PPRH_dtiStart").value;
	var endTime = app.lookup("PPRH_dtiEnd").value;
	var isStartEndDateValid = util.isStartEndDateValid(startTime, endTime);
	if (isStartEndDateValid === false) {
		dialogAlert(app.getHostAppInstance(), "error", dataManager.getString("Str_ErrorStartEndDateInvalid"));
		return false
	}
	
	// 1개월 내 조회 가능
	if (dateLib.getMonthTerm(startTime.replace(/-/gi,"").substring(0, 6),endTime.replace(/-/gi,"").substring(0, 6)) > 2) {
		dialogAlert(app, dataManager.getString("Str_Warning"), "1개월 내 기록만 조회 가능합니다.");
		return
	}

	var udcTnaList = app.lookup("PPRH_udcTnaList");
	udcTnaList.setCurrentPageIndex(1);
	sendTnaListRequest(true);
}

function sendTnaListRequest(isList) {
	
	var udcTnarList = app.lookup("PPRH_udcTnaList");
	var curIndex = udcTnarList.getCurrentPageIndex();
	var offset = (curIndex - 1) * pageRowCount
	
	var smsGetTnaList = app.lookup("sms_getTnaResultListHDHI");
	var submision;
	if (isList == true) {
		submision = app.lookup("sms_getTnaResultListHDHI");
		submision.setParameters("offset", offset);
		submision.setParameters("limit", pageRowCount);
	} else {
		submision = app.lookup("sms_getTnaResultListExport");
		var exportParam = app.lookup("ExportParam");
		offset = exportParam.getValue("offset");
		submision.setParameters("limit", exportCount);
		submision.setParameters("offset", exportParam.getValue("offset"));
	}
	
	var groupCmb = app.lookup("PPRH_cmbGroup");
	if (groupCmb.value != "" || groupCmb.value != null) {
		submision.setParameters("groupIDs", groupCmb.value);
	} else {
		submision.setParameters("groupIDs", 0);	// 전체 검색
	}
	
	var partnerCmb = app.lookup("PPRH_cmbPartner");
	if (partnerCmb.value != "" || partnerCmb.value != null) {
		submision.setParameters("partnerIDs", partnerCmb.value);
	} else {
		submision.setParameters("partnerIDs", "");
	}
	
	// TODO 협력사 검색 파라미터 추가 관리자 일때만 가능
	
	var cmbCategory = app.lookup("PPRH_cmbCategory");
	var edtKeyword = app.lookup("PPRH_ipbKeyword");
	
	submision.setParameters("startTime", app.lookup("PPRH_dtiStart").value);
	submision.setParameters("endTime", app.lookup("PPRH_dtiEnd").value);
	
	submision.setParameters("searchAbsent", app.lookup("PPRH_cbxSearchAbnormalAll").value);	// 근태이상
	submision.setParameters("searchCategory", cmbCategory.value);
	submision.setParameters("searchKeyword", edtKeyword.value);
	if (edtKeyword.value == null || edtKeyword.value.length <= 0) {
		submision.setParameters("searchCategory", "");
		submision.setParameters("searchKeyword", "");
	}

	app.lookup("tnaResultList").clear();
	if (isList == true) {
		comLib.showLoadMask("", dataManager.getString("Str_Load"), "", 1);
	}
	submision.send();
}

function onSms_getTnaResultListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getTnaResultList = e.control;
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dsTnaList = app.lookup("tnaResultList");
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		var totalLabel = app.lookup("PPRH_totalCnt");
		totalLabel.value = totalCount;
		
		var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
		if (viewPageCount > 10) {
			viewPageCount = 10;
		}

		//조회컬럼 수정, 기록 수정여부 설정
		var udcTnaList = app.lookup("PPRH_udcTnaList");

		comLib.hideLoadMask();
		//udc에 setting하여 redraw
		udcTnaList.setUserList(dsTnaList);
		udcTnaList.setPaging(totalCount, pageRowCount, viewPageCount);
		udcTnaList.redraw();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
		return
	} 
}


function onSms_getTnaResultListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getTnaResultListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
	
	var startTime = app.lookup("PPRH_dtiStart").value;
	var endTime = app.lookup("PPRH_dtiEnd").value;
	var isStartEndDateValid = util.isStartEndDateValid(startTime, endTime);
	if (isStartEndDateValid === false) {
		dialogAlert(app.getHostAppInstance(), "error", dataManager.getString("Str_ErrorStartEndDateInvalid"));
		return false
	}
	
	dialogConfirm(app, "", "근태 처리 요청하시겠습니까?", function( /*cpr.controls.Dialog*/ dialog){
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				
				if(dateLib.minusDates(startTime.replace(/-/gi,""),endTime.replace(/-/gi,"")) >= 2){
					dialogAlert(app, dataManager.getString("Str_Warning"), "수동 근태 처리 기간은 하루만 요청 가능합니다.");
					return
				}
				
				app.lookup("tnaResultList").clear();
				
				var udcTnaList = app.lookup("PPRH_udcTnaList");
				udcTnaList.setCurrentPageIndex(1);
			
				comLib.showLoadMask("", dataManager.getString("Str_Load"), "", 1);
				//v1/tna/tnaProcessing
				var smsGetTnaList = app.lookup("sms_getTnaProcessing");
				smsGetTnaList.setParameters("startTime", startTime);
				smsGetTnaList.setParameters("endTime", endTime);
				// TODO : 완성 미완성 처리 
				
				smsGetTnaList.send();
			}
		});
	});
}

function onSms_getTnaProcessingSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getTnaProcessing = e.control;
	
	comLib.hideLoadMask();
	var dmResult = app.lookup("Result");
	var result = dmResult.getValue("ResultCode");
	
	if (result == COMERROR_NONE) {
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_TnaProcessRequestSuccess"));
	} else {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Error") + " : " + dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
		return
	}
}


function onSms_getTnaProcessingSubmitError(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getTnaProcessingSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onPPRH_udcTnaListPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.custom.tnaListHDHI
	 */
	var pPRH_udcTnaList = e.control;
	sendTnaListRequest(true);
}


/*
 * "X" 버튼(PPRH_btnGroupClear)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onPPRH_btnClearClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var pPRH_btnClear = e.control;
	
	switch (pPRH_btnClear.id) {
		case "PPRH_btnGroupClear":
			app.lookup("PPRH_cmbGroup").value = "";
			app.lookup("PPRH_cmbGroup").redraw();
			break;
		case "PPRH_btnPartnerClear":
			app.lookup("PPRH_cmbPartner").value = "";
			app.lookup("PPRH_cmbPartner").redraw();
			break;
	}
}

function onPPRH_btnSeachClick(/* cpr.events.CMouseEvent */ e){
	onPPRH_btnSearchClick(e);
}

function onPPRH_btnExcelExportClick(/* cpr.events.CMouseEvent */ e){
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

function onSms_getTnaResultListExprotSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var exportParam = app.lookup("ExportParam");
		var dsDataExport = app.lookup("tnaResultListExport");
		var dsData = app.lookup("tnaResultList");
	
		if (dsData.getRowCount() == 0) {
			comLib.hideLoadMask();
			if (dsData.getRowCount() > 0) {
				exportExcel();
				dsDataExport.clear();
			} else {
				dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
				return
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
		return
	}
}

function onSms_getTnaResultListExprotSubmitError(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getTnaResultListExprotSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function exportExcel() {
	var dsExportList = app.lookup("tnaResultListExport");
	var total = dsExportList.getRowCount();
	var stringified;
	if (partnerFlag === true) {
		var dsExportListPartner = app.lookup("tnaResultListExportPartner");
		dsExportListPartner.clear();
		dsExportList.copyToDataSet(dsExportListPartner);
		stringified = JSON.stringify(dsExportListPartner.getRowDataRanged());
	} else {
		stringified = JSON.stringify(dsExportList.getRowDataRanged());
	}

	stringified = stringified.replace(/"WorkDate"/gi, '"' + dataManager.getString("Str_date2") + '"');
	stringified = stringified.replace(/"UserID"/gi, '"' + dataManager.getString("Str_ID") + '"');
	stringified = stringified.replace(/"UniqueID"/gi, '"' + dataManager.getString("Str_registrationNumber") + '"');
	stringified = stringified.replace(/"Name"/gi, '"' + dataManager.getString("Str_name2") + '"');
	stringified = stringified.replace(/"GroupName"/gi, '"' + dataManager.getString("Str_AffiliatedGroup") + '"');
	stringified = stringified.replace(/"PartnerName"/gi, '"' + dataManager.getString("Str_AffiliatedPartner") + '"');
	stringified = stringified.replace(/"InTimePnTerName"/gi, '"' + dataManager.getString("Str_AttendLocation") + '"');
	stringified = stringified.replace(/"OutTimePnTerName"/gi, '"' + dataManager.getString("Str_LeaveLocation") + '"');
	stringified = stringified.replace(/"PnTerMatchFlag"/gi, '"' + dataManager.getString("Str_IsMatchLocation") + '"');
	stringified = stringified.replace(/"Detail"/gi, '"' + dataManager.getString("Str_BodyTemperature") + '"');
	stringified = stringified.replace(/"ShiftName"/gi, '"' + dataManager.getString("Str_WorkDayName") + '"');
	stringified = stringified.replace(/"InTime"/gi, '"' + dataManager.getString("Str_ArrivalTime2") + '"');
	stringified = stringified.replace(/"OutTime"/gi, '"' + dataManager.getString("Str_DepartureTime2") + '"');
	stringified = stringified.replace(/"Wt1In"/gi, '"' + dataManager.getString("Str_TnaStart") + '"');
	stringified = stringified.replace(/"Wt1Out"/gi, '"' + dataManager.getString("Str_TnaEnd") + '"');
	stringified = stringified.replace(/"Wt1Time"/gi, '"' + dataManager.getString("Str_WorkTime") + '"');
	stringified = stringified.replace(/"Wt6Time"/gi, '"' + dataManager.getString("Str_ExtraWork") + '"');
	stringified = stringified.replace(/"Modify"/gi, '"' + dataManager.getString("Str_IsModifyWorkTime") + '"');
	stringified = stringified.replace(/"WorkTypeName"/gi, '"' + dataManager.getString("Str_TNA") + '"');
	stringified = stringified.replace(/"Holiday"/gi, '"' + dataManager.getString("Str_Holiday") + '"');
	stringified = stringified.replace(/"Remark"/gi, '"' + dataManager.getString("Str_Remarks") + '"');
	stringified = stringified.replace(/"Title"/gi, '"' + "직무" + '"');
	stringified = stringified.replace(/"Position"/gi, '"' + "직책" + '"');
	stringified = stringified.replace(/"Nationality"/gi, '"' + "국적" + '"');
	stringified = stringified.replace(/"Gender"/gi, '"' + "성별" + '"');
	stringified = stringified.replace(/"Birthday"/gi, '"' + "직무" + '"');
	stringified = stringified.replace(/"BTime"/gi, '"' + "조식 시간" + '"');
	stringified = stringified.replace(/"LTime"/gi, '"' + "중식 시간" + '"');
	stringified = stringified.replace(/"DTime"/gi, '"' + "석식 시간" + '"');

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
