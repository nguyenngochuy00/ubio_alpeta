/************************************************
 * peiodProcessingByPartnerResultsHDHI.js
 * Created at 2024. 4. 23. 오후 3:53:56.
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
	var udcTnaList = app.lookup("PPBPRH_udcTnaByPartnerList");
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

	var strStartTime = app.lookup("PPBPRH_optStart").value;
	if (strStartTime==null) {strStartTime=""};
	
	if (strStartTime== "") {
		dialogAlert(app, dataManager.getString("Str_Warning"), "조회 기간 선택 바랍니다.");
		return
	}
	
	var startTimeArr = strStartTime.split(",");
	if (startTimeArr.length > 4) {
		dialogAlert(app, dataManager.getString("Str_Warning"), "기간 조회는 3달 까지 가능합니다.");
		return
	}

	var udcTnaList = app.lookup("PPBPRH_udcTnaByPartnerList");
	udcTnaList.setCurrentPageIndex(1);
	sendTnaListRequest(true);
}

function sendTnaListRequest(isList) {
	
	var udcTnarList = app.lookup("PPBPRH_udcTnaByPartnerList");
	var curIndex = udcTnarList.getCurrentPageIndex();
	var offset = (curIndex - 1) * pageRowCount
	
	var smsGetTnaList = app.lookup("sms_getTnaByPartnerResultListHDHI");
	var submision;
	if (isList == true) {
		submision = app.lookup("sms_getTnaByPartnerResultListHDHI");
		submision.setParameters("offset", offset);
		submision.setParameters("limit", pageRowCount);
	} else {
		submision = app.lookup("sms_getTnaByPartnerResultListExport");
		var exportParam = app.lookup("ExportParam");
		offset = exportParam.getValue("offset");
		submision.setParameters("limit", exportCount);
		submision.setParameters("offset", exportParam.getValue("offset"));
	}
	
	var groupCmb = app.lookup("PPBPRH_cmbGroup");
	if (groupCmb.value != "" || groupCmb.value != null) {
		submision.setParameters("groupIDs", groupCmb.value);
	} else {
		submision.setParameters("groupIDs", 0);	// 전체 검색
	}
	
	var partnerCmb = app.lookup("PPBPRH_cmbPartner");
	if (partnerCmb.value != "") {
		submision.setParameters("partnerIDs", partnerCmb.value);
	} else {
		submision.setParameters("partnerIDs", "");
	}

	var startTime = app.lookup("PPBPRH_optStart").value;
	submision.setParameters("startTime", startTime);

	app.lookup("tnaByPartnerResultList").clear();
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
		var dsTnaList = app.lookup("tnaByPartnerResultList");
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		var totalLabel = app.lookup("PPBPRH_totalCnt");
		totalLabel.value = totalCount;
		
		var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
		if (viewPageCount > 10) {
			viewPageCount = 10;
		}

		var udcTnaList = app.lookup("PPBPRH_udcTnaByPartnerList");

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

function RefreshData() {
	var today = dateLib.getDate();
	var searchDate = dateLib.addDay(today, -1);

	// YYYYMM
	app.lookup("PPBPRH_dtiStart").value = searchDate.substring(0, searchDate.length - 2);
	
	var date = new Date();
    date.setFullYear(date.getFullYear());// y년을 더함
    date.setMonth(date.getMonth());// m월을 더함
    date.setDate(date.getDate() -1);// d일을 더함
    
	app.lookup("PPBPRH_dtiStart").maxDate = date;
}

function onPPBPRH_dtiStartValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.DateInput
	 */
	var pPBPRH_dtiStart = e.control;
	
	var inputVal = pPBPRH_dtiStart.value;
	
	if (inputVal.length < 1) {
		return
	}

	if (app.lookup("PPBPRH_optStart").value == null) {
		app.lookup("PPBPRH_optStart").value = "";
	}
	
	var tmp = app.lookup("PPBPRH_optStart").value.split(",");

	if (tmp.length > 3) {
		dialogAlert(app, dataManager.getString("Str_Warning"), "기간 조회는 3달 까지 가능합니다.");
		pPBPRH_dtiStart.value = "";
		return
	}
	
	for (var i=0; i<tmp.length; i++) {
		if (tmp[i]==inputVal) {
			dialogAlert(app, dataManager.getString("Str_Warning"), "이미 선택한 조회 기간 입니다.");
			pPBPRH_dtiStart.value = "";
			return
		}
	}

	app.lookup("PPBPRH_optStart").value += inputVal+",";
	pPBPRH_dtiStart.value = "";	
	return
}

function onPPBPRH_btnGroupClearClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var pPBPRH_btnGroupClear = e.control;
	switch (pPBPRH_btnGroupClear.id) {
		case "PPBPRH_btnGroupClear":
			app.lookup("PPBPRH_cmbGroup").value = "";
			app.lookup("PPBPRH_cmbGroup").redraw();
			break;
		case "PPBPRH_btnPartnerClear":
			app.lookup("PPBPRH_cmbPartner").value = "";
			app.lookup("PPBPRH_cmbPartner").redraw();
			break;
		case "PPBPRH_btnDateClear":
			app.lookup("PPBPRH_optStart").value = "";
			app.lookup("PPBPRH_optStart").redraw();
			break;
	}
}

function onPPBPRH_btnExcelExportClick(/* cpr.events.CMouseEvent */ e){
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

function onSms_getTnaByPartnerResultListExportSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var exportParam = app.lookup("ExportParam");
		var dsDataExport = app.lookup("tnaByPartnerResultListExport");
		var dsData = app.lookup("tnaByPartnerResultList");
	
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

function onSms_getTnaByPartnerResultListExportSubmitError(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getTnaByPartnerResultListExportSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function exportExcel() {
	var dsExportList = app.lookup("tnaByPartnerResultListExport");
	var total = dsExportList.getRowCount();
	var	stringified = JSON.stringify(dsExportList.getRowDataRanged());
	
	stringified = stringified.replace(/"WorkYear"/gi, '"' + dataManager.getString("Str_Year") + '"');
	stringified = stringified.replace(/"WorkMonth"/gi, '"' + dataManager.getString("Str_Month") + '"');
	stringified = stringified.replace(/"GroupName"/gi, '"' + dataManager.getString("Str_AffiliatedGroup") + '"');
	stringified = stringified.replace(/"PartnerName"/gi, '"' + dataManager.getString("Str_AffiliatedPartner") + '"');
	stringified = stringified.replace(/"FAWAvgWdWorkPeople"/gi, '"' + dataManager.getString("Str_FAWAvgWdWorkPeople") + '"');
	stringified = stringified.replace(/"AvgWdWorkPeople"/gi, '"' + dataManager.getString("Str_AvgWdWorkPeople") + '"');
	stringified = stringified.replace(/"AvgWdWorkHours"/gi, '"' + dataManager.getString("Str_AvgWdWorkHours") + '"');
	stringified = stringified.replace(/"FAWAvgHdWorkPeople"/gi, '"' + dataManager.getString("Str_FAWAvgHdWorkPeople") + '"');
	stringified = stringified.replace(/"AvgHdWorkPeople"/gi, '"' + dataManager.getString("Str_AvgHdWorkPeople") + '"');
	stringified = stringified.replace(/"AvgHdWorkHours"/gi, '"' + dataManager.getString("Str_AvgHdWorkHours") + '"');
	

	var inputData = JSON.parse(stringified);
	
	var today = dateLib.getToday();
	var filename = "TNA_By_Partner_Report_" + today + ".xlsx";
	var ws_name = "TNA_By_Partner_Report_";
	
	var wb = XLSX.utils.book_new(),
		ws = XLSX.utils.json_to_sheet(inputData);
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);
	
	XLSX.writeFile(wb, filename);
}

function onPPBPRH_udcTnaByPartnerListPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.custom.tnaBypartnerListHDHI
	 */
	var pPBPRH_udcTnaByPartnerList = e.control;
	sendTnaListRequest(true);
}
