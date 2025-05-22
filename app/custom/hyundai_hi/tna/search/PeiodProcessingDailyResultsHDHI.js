/************************************************
 * PeiodProcessingDailyResultsHDHI.js
 * Created at 2024. 4. 19. 오후 4:44:50.
 *
 * @author zxc
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var util = cpr.core.Module.require("lib/util");

var comLib;
var pageRowCount = 50;
var exportCount = 100; // 한번에 요청할 데이터 수

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	var udcTnaList = app.lookup("PPDRH_udcTnaDailyList");
	udcTnaList.setPaging(0, 1, 10, pageRowCount);

	var initValue = app.getHost().initValue;
	var dsGroupList = app.lookup("GroupList");
	var groupList = dataManager.getGroup();
	groupList.copyToDataSet(dsGroupList);

	var dsPartnerList = app.lookup("HDHIPartnerList");
	var partnerList = dataManager.getPartnerListHDHI();
	partnerList.copyToDataSet(dsPartnerList);
	
	RefreshData();
}

function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var udcTnaList = app.lookup("PPDRH_udcTnaDailyList");
	udcTnaList.setCurrentPageIndex(1);
	sendTnaListRequest(true);
}

function sendTnaListRequest(isList) {
	
	var udcTnarList = app.lookup("PPDRH_udcTnaDailyList");
	var curIndex = udcTnarList.getCurrentPageIndex();
	var offset = (curIndex - 1) * pageRowCount
	
	var smsGetTnaList = app.lookup("sms_getTnaDailyResultListHDHI");
	var submision;
	if (isList == true) {
		submision = app.lookup("sms_getTnaDailyResultListHDHI");
		submision.setParameters("offset", offset);
		submision.setParameters("limit", pageRowCount);
	} else {
		submision = app.lookup("sms_getTnaDailyResultListExport");
		var exportParam = app.lookup("ExportParam");
		offset = exportParam.getValue("offset");
		submision.setParameters("limit", exportCount);
		submision.setParameters("offset", exportParam.getValue("offset"));
	}
	
	var groupCmb = app.lookup("PPDRH_cmbGroup");
	if (groupCmb.value != "" || groupCmb.value != null) {
		submision.setParameters("groupIDs", groupCmb.value);
	} else {
		submision.setParameters("groupIDs", 0);	// 전체 검색
	}
	
	var partnerCmb = app.lookup("PPDRH_cmbPartner");
	if (partnerCmb.value != "" || partnerCmb.value != null) {
		submision.setParameters("partnerIDs", partnerCmb.value);
	} else {
		submision.setParameters("partnerIDs", "");
	}
	

	var startTime = convStrDate(app.lookup("PPDRH_dtiStart").displayText)
	submision.setParameters("startTime", startTime);

	app.lookup("tnaDailyResultList").clear();
	if (isList == true) {
		comLib.showLoadMask("", dataManager.getString("Str_Load"), "", 1);
	}
	submision.send();
}

function onSms_getTnaDailyResultListHDHISubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getTnaDailyResultListHDHI = e.control;
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dsTnaList = app.lookup("tnaDailyResultList");
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		var totalLabel = app.lookup("PPDRH_totalCnt");
		totalLabel.value = totalCount;
		
		var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
		if (viewPageCount > 10) {
			viewPageCount = 10;
		}

		//조회컬럼 수정, 기록 수정여부 설정
		var udcTnaList = app.lookup("PPDRH_udcTnaDailyList");

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


function onSms_getTnaDailyResultListHDHISubmitError(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getTnaDailyResultListHDHISubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function convStrDate(date) {
	var str = date.replaceAll('-','').replaceAll('.','').replaceAll(' ','');
	return str
}

function RefreshData() {
	var today = dateLib.getDate();
	var searchDate = dateLib.addDay(today, -1);

	// YYYYMM
	app.lookup("PPDRH_dtiStart").value = searchDate.substring(0, searchDate.length - 2);
	
	var date = new Date();
    date.setFullYear(date.getFullYear());// y년을 더함
    date.setMonth(date.getMonth());// m월을 더함
    date.setDate(date.getDate() -1);// d일을 더함
    
	app.lookup("PPDRH_dtiStart").maxDate = date;
}

function onPPDRH_btnGroupClearClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var pPDRH_btnGroupClear = e.control;
	switch (pPDRH_btnGroupClear.id) {
		case "PPDRH_btnGroupClear":
			app.lookup("PPDRH_cmbGroup").value = "";
			app.lookup("PPDRH_cmbGroup").redraw();
			break;
		case "PPDRH_btnPartnerClear":
			app.lookup("PPDRH_cmbPartner").value = "";
			app.lookup("PPDRH_cmbPartner").redraw();
			break;
	}
	
}

function onPPDRH_udcTnaDailyListPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.custom.tnaDailylistHDHI
	 */
	var pPDRH_udcTnaDailyList = e.control;
	sendTnaListRequest(true);
}

function onPPDRH_btnExcelExportClick(/* cpr.events.CMouseEvent */ e){
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

function onSms_getTnaDailyResultListExportSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var exportParam = app.lookup("ExportParam");
		var dsDataExport = app.lookup("tnaDailyResultListExport");
		var dsData = app.lookup("tnaDailyResultList");
	
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

function onSms_getTnaDailyResultListExportSubmitError(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getTnaDailyResultListExportSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function exportExcel() {
	var dsExportList = app.lookup("tnaDailyResultListExport");
	var total = dsExportList.getRowCount();
	var	stringified = JSON.stringify(dsExportList.getRowDataRanged());
	
	stringified = stringified.replace(/"GroupName"/gi, '"' + dataManager.getString("Str_AffiliatedGroup") + '"');
	stringified = stringified.replace(/"PartnerName"/gi, '"' + dataManager.getString("Str_AffiliatedPartner") + '"');
	stringified = stringified.replace(/"WorkDate"/gi, '"' + dataManager.getString("Str_date2") + '"');
	stringified = stringified.replace(/"FAWWorkPeople"/gi, '"' + dataManager.getString("Str_FAWWorkPeople") + '"');
	stringified = stringified.replace(/"WorkPeople"/gi, '"' + dataManager.getString("Str_WorkPeople") + '"');
	stringified = stringified.replace(/"DiffWorkPeople"/gi, '"' + dataManager.getString("Str_DiffWorkPeople") + '"');
	stringified = stringified.replace(/"Holiday"/gi, '"' + dataManager.getString("Str_Holiday") + '"');

	var inputData = JSON.parse(stringified);
	
	var today = dateLib.getToday();
	var filename = "TNA_Daily_Report_" + today + ".xlsx";
	var ws_name = "TNA_Daily_Report_";
	
	var wb = XLSX.utils.book_new(),
		ws = XLSX.utils.json_to_sheet(inputData);
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);
	
	XLSX.writeFile(wb, filename);
}
