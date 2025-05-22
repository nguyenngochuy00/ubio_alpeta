/************************************************
 * GuardStationAccessStatus.js
 * Created at 2021. 2. 10. 오후 7:34:05.
 *
 * @author blue1
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;

var viewPageCount = 10;
var pageRowCount = 30;
var exportCount = 100; // 한번에 요청할 데이터 수

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);

	setPageIndexer(0, 1, pageRowCount, viewPageCount);
	var today = dateLib.getToday("-");
	
	app.lookup("AMGSAS_dtiStart").value = today;
	app.lookup("AMGSAS_dtiEnd").value = today;
	
	app.lookup("AMGSAS_cmbStart").value = 0;
	app.lookup("AMGSAS_cmbEnd").value = 23;
	app.lookup("AMGSAS_cmbSearchCategory").selectItemByValue(0);
	var userType = app.lookup("AMGSAS_cmbUserType");
	userType.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_OtherUnit"), UserPrivArmyOtherUnit));
	userType.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Foreign"), UserPrivArmyForeign));
	userType.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Soldier"), UserPrivArmySoldier));
	userType.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Family"), UserPrivArmyFamily));
	userType.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Resident"), UserPrivArmyResident));
	userType.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Regular"), UserPrivArmyRegular));
	userType.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_MilitaryPersonnel"), UserPrivArmyMilitaryPersonnel));
	userType.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_ArmyPublicServicel"), UserPrivArmyPublicService));
	
	app.lookup("sms_getMusteringList").send();
}

function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("AMGSAS_listPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}

function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("AMGSAS_listPageIndexer");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}

function leadingZeros(n, digits) {
  var zero = '';
  n = n.toString();

  if (n.length < digits) {
    for (var i = 0; i < digits - n.length; i++)
      zero += '0';
  }
  return zero + n;
}

function sendSmsGetGuardStationAccessStatus(isList) {
	//console.log("sendSmsGetGuardStationAccessStatus");
	app.lookup("dsManualAccessStatus").clear();
	var curPageIndex = app.lookup("AMGSAS_listPageIndexer").currentPageIndex;
	var offset = (curPageIndex-1) * pageRowCount;
	
	var submision;
	if (isList == true) { 
		submision = app.lookup("sms_getManualAccessStatus");
		submision.setParameters("offset", offset);	
		submision.setParameters("limit", pageRowCount);
	} else {
		submision = app.lookup("sms_getManualAccessStatusExport");
		
		var exportParam = app.lookup("ExportParam");
		offset = exportParam.getValue("offset");
		submision.setParameters("limit", exportCount);
		submision.setParameters("offset", offset);
	}
	
	var startTime = app.lookup("AMGSAS_dtiStart").value + " " + leadingZeros( Number(app.lookup("AMGSAS_cmbStart").value), 2) + ":00:00";
	var endTime = app.lookup("AMGSAS_dtiEnd").value + " " + leadingZeros( Number(app.lookup("AMGSAS_cmbEnd").value), 2) + ":59:59";

	submision.setParameters("startTime", startTime);
	submision.setParameters("endTime", endTime);
	submision.setParameters("searchKeyword", app.lookup("AMGSAS_ipbKeyword").value);
	
	var category = app.lookup("AMGSAS_cmbSearchCategory").value
	switch (Number(category)) {
	case 0:
		submision.setParameters("searchCategory", "all");
		break;
	case 1:
		submision.setParameters("searchCategory", "name");
		break;
	}
	
	submision.send();
}
/* 이벤트 */
function onSearchButtonClick(/* cpr.events.CMouseEvent */ e){
	var pageIndex = app.lookup("AMGSAS_listPageIndexer");	
	pageIndex.currentPageIndex = 1;
	sendSmsGetGuardStationAccessStatus(true);		
}

function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		var pageIndex = app.lookup("AMGSAS_listPageIndexer");	
		pageIndex.currentPageIndex = 1;
		sendSmsGetGuardStationAccessStatus(true);			
	}
}

function onAMGSAS_listPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	//console.log("onAMGSAS_listPageIndexerSelectionChange");
	sendSmsGetGuardStationAccessStatus(true);	
}

function onAMASP_btnExportClick(/* cpr.events.CMouseEvent */ e){
	var total = app.lookup("Total").getValue("Count");
	if (total == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "조회된 데이터가 없습니다.");
		return
	}
	var dm_ExportParam = app.lookup("ExportParam");
	dm_ExportParam.setValue("total", total);
	dm_ExportParam.setValue("offset", 0);
	var totalStep = total / exportCount + (total % exportCount != 0) ? 1 : 0;
	comLib.showLoadMask("pro", "출입기록 내보내기", "", totalStep);
	
	sendSmsGetGuardStationAccessStatus(false);
}

/* 서브미션 응답 */
function onSubmitError( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

function onSms_getMusteringListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode != COMERROR_NONE ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"),dataManager.getString(getErrorString(resultCode)));
	} else {
		var pageIndex = app.lookup("AMGSAS_listPageIndexer");	
		pageIndex.currentPageIndex = 1;
		sendSmsGetGuardStationAccessStatus(true);	
	}
}

function onSms_getManualAccessStatusSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){		
		var totalCount = app.lookup("Total").getValue("Count");
		selectPaging(totalCount, viewPageCount);
		
		app.lookup("AMGSAS_opbTotal").value = totalCount;
		app.lookup("AMGSAS_grdAccessStatus").redraw();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getManualAccessStatusExportSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var exportParam = app.lookup("ExportParam");
		var dsDataExport = app.lookup("dsManualAccessStatusExport");
		var dsData = app.lookup("dsManualAccessStatus");
		
		if (dsData.getRowCount() == 0) {
			comLib.hideLoadMask();
			if (dsData.getRowCount() > 0) {
				exportExcel();
				dsDataExport.clear();
			} else {
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
			}
		} else {
			var count = dsData.getRowCount();
			dsData.copyToDataSet(dsDataExport)
			
			if (dsDataExport.getRowCount() >= exportParam.getValue("total")) {
				exportExcel();
				comLib.hideLoadMask();
				dsDataExport.clear();
				sendSmsGetGuardStationAccessStatus(true);
			} else {
				var offset = exportParam.getValue("offset")
				offset += exportCount
				exportParam.setValue("offset", offset)
				comLib.updateLoadMask(offset);
				sendSmsGetGuardStationAccessStatus(false);
			}
		}
	} else {
		comLib.hideLoadMask();
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}	
}

function exportExcel() {
	var dsExportList = app.lookup("dsManualAccessStatusExport");
	var total = dsExportList.getRowCount();
	
	for (var i = 0; i < total; i++) {
		var cardInfo = dsExportList.getRow(i);
		
		switch (Number(cardInfo.getValue("AccessStatusType"))) {
			case 1: cardInfo.setValue("AccessStatusType", "인원"); break;
			case 2: cardInfo.setValue("AccessStatusType", "차량"); break;
			default: cardInfo.setValue("AccessStatusType", "");
		}
		
		switch (Number(cardInfo.getValue("AccessType"))) {
			case 1: cardInfo.setValue("AccessType", dataManager.getString("Str_ARMYHQ_AccessIN")); break;
			case 2: cardInfo.setValue("AccessType", dataManager.getString("Str_ARMYHQ_AccessOUT")); break;
			default: cardInfo.setValue("AccessType", "");
		}
		
		switch (Number(cardInfo.getValue("CarType"))) {
			case 1: cardInfo.setValue("CarType", dataManager.getString("Str_ARMYHQ_GeneralCar")); break;
			case 2: cardInfo.setValue("CarType", dataManager.getString("Str_ARMYHQ_RFIDCar")); break;
			default: cardInfo.setValue("CarType", "");
		}
		
		switch (Number(cardInfo.getValue("UserType"))) {
			case UserPrivArmyOnDuty: cardInfo.setValue("UserType", dataManager.getString("Str_ARMY_OnDuty")); break;
			case UserPrivArmyOtherUnit: cardInfo.setValue("UserType", dataManager.getString("Str_ARMY_OtherUnit")); break;
			case UserPrivArmyForeign: cardInfo.setValue("UserType", dataManager.getString("Str_ARMY_Foreign")); break;
			case UserPrivArmySoldier: cardInfo.setValue("UserType", dataManager.getString("Str_ARMY_Soldier")); break;
			case UserPrivArmyFamily: cardInfo.setValue("UserType", dataManager.getString("Str_ARMY_Family")); break;
			case UserPrivArmyResident: cardInfo.setValue("UserType", dataManager.getString("Str_ARMY_Resident")); break;
			case UserPrivArmyRegular: cardInfo.setValue("UserType", dataManager.getString("Str_ARMY_Regular")); break;
			case UserPrivArmyMilitaryPersonnel: cardInfo.setValue("UserType", dataManager.getString("Str_ARMY_MilitaryPersonnel")); break;
			case UserPrivArmyPublicService: cardInfo.setValue("UserType", dataManager.getString("Str_ARMY_ArmyPublicServicel")); break;
			default: cardInfo.setValue("UserType", "");
		}
		
		var findRow = app.lookup("MusteringList").findFirstRow("MusteringID == " + cardInfo.getValue("AccessAreaID"));
		cardInfo.setValue("AccessAreaID", findRow.getValue("MusteringName"));
	}
	
	var stringified = JSON.stringify(dsExportList.getRowDataRanged());
	
	stringified = stringified.replace(/"AccessStatusType"/gi, '"구분"');
	stringified = stringified.replace(/"AccessAreaID"/gi, '"출입장소"');
	stringified = stringified.replace(/"AccessType"/gi, '"출입구분"');
	stringified = stringified.replace(/"AccessTime"/gi, '"출입시간"');
	stringified = stringified.replace(/"UserType"/gi, '"인원구분"');
	stringified = stringified.replace(/"CarType"/gi, '"차량종류"');
	stringified = stringified.replace(/"Name"/gi, '"성명"');
	stringified = stringified.replace(/"CarNumber"/gi, '"차량번호"');
	stringified = stringified.replace(/"AddressNote"/gi, '"주소/비고"');
	stringified = stringified.replace(/"Position"/gi, '"계급/직급"');
	stringified = stringified.replace(/"PurposeOfAccess"/gi, '"출입목적"');

	var inputData = JSON.parse(stringified);
	
	var today = dateLib.getToday();
	var filename = "출입현황_위병소출입현황_" + today + ".xlsx";
	var ws_name = "출입현황_위병소출입현황_";
	
	var wb = XLSX.utils.book_new(),
		ws = XLSX.utils.json_to_sheet(inputData);
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);
	
	XLSX.writeFile(wb, filename);
}


