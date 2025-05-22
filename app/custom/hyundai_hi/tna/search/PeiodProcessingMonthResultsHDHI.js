/************************************************
 * PeiodMonthsResultsHDHI.js
 * Created at 2024. 4. 4. 오후 3:24:34.
 *
 * @author zxc
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var util = cpr.core.Module.require("lib/util");

var comLib;
var pageRowCount = 50;
var exportCount = 100; // 한번에 요청할 데이터 수
var searchExceptRecords = false;
var partnerFlag = false;
var editableFlag;

var viewOnlyAdmin = ["GroupName","PartnerName", "PnTerMissMatchCnt","FaceAuthNotCnt", "BTimeCnt", "LTimeCnt", "DTimeCnt"];

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	var udcTnaList = app.lookup("PPMRH_udcTnaMonthList");
	udcTnaList.setPaging(0, 1, 10, pageRowCount);

	var initValue = app.getHost().initValue;

	var accountInfo = dataManager.getAccountInfo();
	var privilege = Number(accountInfo.getValue("Privilege"));
	if (privilege == 1) {
		var udcTnaList = app.lookup("PPMRH_udcTnaMonthList");
		udcTnaList.columnsVisible("tnaMonthListGrid", viewOnlyAdmin, true);
		udcTnaList.redraw();
	} else {
		var partnerID = accountInfo.getValue("UserAff");
		app.lookup("PPMRH_cmbPartner").value = partnerID;
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

function editableIfManager() {
	var userPrivilege = dataManager.getAccountInfo().getValue("Privilege");
	if (userPrivilege == 10001) {		// 협력사 관리자만 수정 가능
		app.lookup("PPMRH_opAbleToEditTNA").visible = true;
		app.lookup("PPMRH_udcTnaMonthList").editableGrid();
		editableFlag = true;
	} else {
		app.lookup("PPMRH_opAbleToEditTNA").visible = false;
		editableFlag = false;
	}
}

function optionCmbGroup(){
	
	var userPrivilege = Number(dataManager.getAccountInfo().getValue("Privilege"));
	if(userPrivilege == 1){
		app.lookup("PPMRH_cmbGroup").visible=true;
		app.lookup("PPMRH_group").visible=true;
		app.lookup("PPMRH_btnGroupClear").visible=true;
		app.lookup("PPMRH_btnPartnerClear").visible=true;
	} else {
		app.lookup("PPMRH_cmbGroup").visible=false;
		app.lookup("PPMRH_group").visible=false;
		app.lookup("PPMRH_btnGroupClear").visible=false;
		app.lookup("PPMRH_btnPartnerClear").visible=false;
		app.lookup("PPMRH_cmbPartner").enabled=false;
		app.lookup("PPMRH_cbxYear").visible=false;
	}
}

function onPPMRH_cbxYearValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.CheckBox
	 */
	var pPMRH_cbxYear = e.control;
	var dti = app.lookup("PPMRH_dtiStart");
	if (pPMRH_cbxYear.value == "1") {	// 연간 검색
		dti.calendarType = "year";
		dti.mask = "YYYY";
		dti.format = "YYYY";
	} else {
		dti.calendarType = "yearmonth";
		dti.mask = "YYYY-MM";
		dti.format = "YYYYMM";
	}	
	dti.redraw();
}

function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
//	var startTime = app.lookup("PPMRH_dtiStart").value;
	
	var udcTnaList = app.lookup("PPMRH_udcTnaMonthList");
	udcTnaList.setCurrentPageIndex(1);
	sendTnaListRequest(true);
}

function sendTnaListRequest(isList) {
	
	var udcTnarList = app.lookup("PPMRH_udcTnaMonthList");
	var curIndex = udcTnarList.getCurrentPageIndex();
	var offset = (curIndex - 1) * pageRowCount
	
	var smsGetTnaList = app.lookup("sms_getTnaMonthResultListHDHI");
	var submision;
	if (isList == true) {
		submision = app.lookup("sms_getTnaMonthResultListHDHI");
		submision.setParameters("offset", offset);
		submision.setParameters("limit", pageRowCount);
	} else {
		submision = app.lookup("sms_getTnaMonthResultListExport");
		var exportParam = app.lookup("ExportParam");
		offset = exportParam.getValue("offset");
		submision.setParameters("limit", exportCount);
		submision.setParameters("offset", exportParam.getValue("offset"));
	}
	
	var groupCmb = app.lookup("PPMRH_cmbGroup");
	if (groupCmb.value != "" || groupCmb.value != null) {
		submision.setParameters("groupIDs", groupCmb.value);
	} else {
		submision.setParameters("groupIDs", 0);	// 전체 검색
	}
	
	var partnerCmb = app.lookup("PPMRH_cmbPartner");
	if (partnerCmb.value != "" || partnerCmb.value != null) {
		submision.setParameters("partnerIDs", partnerCmb.value);
	} else {
		submision.setParameters("partnerIDs", "");
	}
	

	var startTime = convStrDate(app.lookup("PPMRH_dtiStart").displayText)
	submision.setParameters("startTime", startTime);

	app.lookup("tnaMonthResultList").clear();
	if (isList == true) {
		comLib.showLoadMask("", dataManager.getString("Str_Load"), "", 1);
	}
	submision.send();
}

function onSms_getTnaMonthResultListHDHISubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getTnaMonthResultListHDHI = e.control;
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dsTnaList = app.lookup("tnaMonthResultList");
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		var totalLabel = app.lookup("PPMRH_totalCnt");
		totalLabel.value = totalCount;
		
		var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
		if (viewPageCount > 10) {
			viewPageCount = 10;
		}

		//조회컬럼 수정, 기록 수정여부 설정
		var udcTnaList = app.lookup("PPMRH_udcTnaMonthList");

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

function onSms_getTnaMonthResultListHDHISubmitError(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getTnaMonthResultListHDHISubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

// 비활성화
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
	app.lookup("tnaMonthResultList").clear();
	
	var udcTnaList = app.lookup("PPMRH_udcTnaMonthList");
	udcTnaList.setCurrentPageIndex(1);
	
	// 1달만

	var startTime = convStrDate(app.lookup("PPMRH_dtiStart").displayText);
	if (startTime.length < 6) {
		dialogAlert(app, dataManager.getString("Str_Failed"), "연/월을 선택 바랍니다.");
		return
	}


	comLib.showLoadMask("", dataManager.getString("Str_Load"), "", 1);
	//v1/tna/tnaProcessing
	var smsGetTnaList = app.lookup("sms_getTnaProcessing");
	smsGetTnaList.setParameters("startTime", startTime);
//	smsGetTnaList.setParameters("endTime", endTime);
	smsGetTnaList.setParameters("category", "monthProcess");

	// TODO : 완성 미완성 처리 
	
	smsGetTnaList.send();
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
		return;
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

function convStrDate(date) {
	var str = date.replaceAll('-','').replaceAll('.','').replaceAll(' ','');
	return str
}

function onPPMRH_udcTnaMonthListPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.custom.tnaMonthListHDHI
	 */
	var pPMRH_udcTnaMonthList = e.control;
	sendTnaListRequest(true);
}

function onPPMRH_btnGroupClearClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var pPMRH_btnGroupClear = e.control;
	
	switch (pPMRH_btnGroupClear.id) {
		case "PPMRH_btnGroupClear":
			app.lookup("PPMRH_cmbGroup").value = "";
			app.lookup("PPMRH_cmbGroup").redraw();
			break;
		case "PPMRH_btnPartnerClear":
			app.lookup("PPMRH_cmbPartner").value = "";
			app.lookup("PPMRH_cmbPartner").redraw();
			break;
	}
	
}

function onPPMRH_btnExcelExportClick(/* cpr.events.CMouseEvent */ e){
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

function onSms_getTnaMonthResultListExportSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var exportParam = app.lookup("ExportParam");
		var dsDataExport = app.lookup("tnaMonthResultListExport");
		var dsData = app.lookup("tnaMonthResultList");
	
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


function onSms_getTnaMonthResultListExportSubmitError(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getTnaMonthResultListExportSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function exportExcel() {
	var dsExportList = app.lookup("tnaMonthResultListExport");
	var total = dsExportList.getRowCount();
	var stringified;
	if (partnerFlag === true) {
		var dsExportListPartner = app.lookup("tnaMonthResultListExportPartner");
		dsExportListPartner.clear();
		dsExportList.copyToDataSet(dsExportListPartner);
		stringified = JSON.stringify(dsExportListPartner.getRowDataRanged());
	} else {
		stringified = JSON.stringify(dsExportList.getRowDataRanged());
	}
	
	stringified = stringified.replace(/"WorkYear"/gi, '"' + dataManager.getString("Str_Year") + '"');
	stringified = stringified.replace(/"WorkMonth"/gi, '"' + dataManager.getString("Str_Month") + '"');
	stringified = stringified.replace(/"UserID"/gi, '"' + dataManager.getString("Str_ID") + '"');
	stringified = stringified.replace(/"UniqueID"/gi, '"' + dataManager.getString("Str_registrationNumber") + '"');
	stringified = stringified.replace(/"Name"/gi, '"' + dataManager.getString("Str_name2") + '"');
	stringified = stringified.replace(/"GroupName"/gi, '"' + dataManager.getString("Str_AffiliatedGroup") + '"');
	stringified = stringified.replace(/"PartnerName"/gi, '"' + dataManager.getString("Str_AffiliatedPartner") + '"');
	stringified = stringified.replace(/"WeekdayCnt"/gi, '"' + dataManager.getString("Str_WeekdayCnt") + '"');
	stringified = stringified.replace(/"HolidayCnt"/gi, '"' + dataManager.getString("Str_HolidayCnt") + '"');
	stringified = stringified.replace(/"TotalDayCnt"/gi, '"' + dataManager.getString("Str_TotalDayCnt") + '"');
	stringified = stringified.replace(/"WeekdayHours"/gi, '"' + dataManager.getString("Str_WeekdayHours") + '"');
	stringified = stringified.replace(/"HolidayHours"/gi, '"' + dataManager.getString("Str_HolidayHours") + '"');
	stringified = stringified.replace(/"TotalHours"/gi, '"' + dataManager.getString("Str_TotaldayHours") + '"');
	stringified = stringified.replace(/"Remark"/gi, '"' + dataManager.getString("Str_Remarks") + '"');
	stringified = stringified.replace(/"PnTerMissMatchCnt"/gi, '"' + dataManager.getString("Str_MissMatchCnt") + '"');
	stringified = stringified.replace(/"FaceAuthNotCnt"/gi, '"' + dataManager.getString("Str_FaceAuthNotCnt") + '"');
	stringified = stringified.replace(/"BTimeCnt"/gi, '"' + dataManager.getString("Str_BTimeCnt") + '"');
	stringified = stringified.replace(/"LTimeCnt"/gi, '"' + dataManager.getString("Str_LTimeCnt") + '"');
	stringified = stringified.replace(/"DTimeCnt"/gi, '"' + dataManager.getString("Str_DTimeCnt") + '"');
	
	var inputData = JSON.parse(stringified);
	
	var today = dateLib.getToday();
	var filename = "TNA_Month_Report_" + today + ".xlsx";
	var ws_name = "TNA_Month_Report_";
	
	var wb = XLSX.utils.book_new(),
		ws = XLSX.utils.json_to_sheet(inputData);
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);
	
	XLSX.writeFile(wb, filename);
}

function RefreshData() {
	var today = dateLib.getDate();
	var searchDate = dateLib.addDay(today, -1);

	// YYYYMM
	app.lookup("PPMRH_dtiStart").value = searchDate.substring(0, searchDate.length - 2);
	
	var date = new Date();
    date.setFullYear(date.getFullYear());// y년을 더함
    date.setMonth(date.getMonth());// m월을 더함
    date.setDate(date.getDate() -1);// d일을 더함
    
	app.lookup("PPMRH_dtiStart").maxDate = date;
}
