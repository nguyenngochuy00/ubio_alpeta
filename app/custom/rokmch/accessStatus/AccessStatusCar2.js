/************************************************
 * AccessStatusCar2.js
 * Created at 2021. 2. 26. 오전 9:36:59.
 *
 * @author blue1
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;

var viewPageCount = 10;
var exportCount = 100; // 한번에 요청할 데이터 수
var loginUserGroupID;
/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	loginUserGroupID = getLoginUserGroupCode();
	//setPageIndexer(0, 1, pageRowCount,10);
	setPageIndexer(0, 1, parseInt(app.lookup("AMASC_cmbPageRowCount").value), 10);
	
	var today = dateLib.getToday("-");
	app.lookup("AMASC_dtiStart").value = today;
	app.lookup("AMASC_dtiEnd").value = today;
	
	var cmbPrivilege = app.lookup("AMASC_cmbPrivilege");
	cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_OnDuty"), UserPrivArmyOnDuty));
	cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_OtherUnit"), UserPrivArmyOtherUnit));
	cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Foreign"), UserPrivArmyForeign));
	cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Soldier"), UserPrivArmySoldier));
	cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Family"), UserPrivArmyFamily));
	cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Resident"), UserPrivArmyResident));
	cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Regular"), UserPrivArmyRegular));
	cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_MilitaryPersonnel"), UserPrivArmyMilitaryPersonnel));
	cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_ArmyPublicServicel"), UserPrivArmyPublicService));
	cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_Admin"), 1));
}


function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("AMASC_listPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}

function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("AMASC_listPageIndexer");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = parseInt(app.lookup("AMASC_cmbPageRowCount").value);
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}

function sendSmsGetCarAccessStatusList(isList){
	app.lookup("CarAccessStatusInfos").clear();
	var curPageIndex = app.lookup("AMASC_listPageIndexer").currentPageIndex;
	var offset = (curPageIndex-1) * parseInt(app.lookup("AMASC_cmbPageRowCount").value);
	
	var submision
	if (isList == true) {
		submision = app.lookup("sms_getCarAccessStatusInfos");
		submision.setParameters("offset", offset);	
		submision.setParameters("limit", parseInt(app.lookup("AMASC_cmbPageRowCount").value));
	} else {
		submision = app.lookup("sms_getCarAccessStatusInfosExport");
		
		var exportParam = app.lookup("ExportParam");
		offset = exportParam.getValue("offset");
		exportParam.setValue("exportCount", offset+exportCount);
		
		submision.setParameters("limit", exportCount);
		submision.setParameters("offset", offset);
	}
	
	submision.setParameters("startTime", app.lookup("AMASC_dtiStart").value);
	submision.setParameters("endTime", app.lookup("AMASC_dtiEnd").value);
	submision.setParameters("searchKeyword", app.lookup("AMASC_ipbKeyword").value);
	if(dataManager.getAccountID() != 1000000000000000000) { // Master만 전체 기록 조회 가능
       submision.setParameters("groupID", loginUserGroupID);
    }
	
	var category = app.lookup("AMASC_cmbSearchCategory").value
	switch (Number(category)) {
	case 0:
		submision.setParameters("searchCategory", "all");
		break;
	case 1:
		submision.setParameters("searchCategory", "area");
		break;
	case 2:
		submision.setParameters("searchCategory", "name");
		break;
	case 3:
		submision.setParameters("searchCategory", "car_number");
		break;		
	}
	submision.send();
}

function onGroupClick(/* cpr.events.CMouseEvent */ e){
	var pageIndex = app.lookup("AMASC_listPageIndexer");	
	pageIndex.currentPageIndex = 1;
	sendSmsGetCarAccessStatusList(true);	
}

function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		var pageIndex = app.lookup("AMASC_listPageIndexer");	
		pageIndex.currentPageIndex = 1;
		sendSmsGetCarAccessStatusList(true);		
	}
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
	
	sendSmsGetCarAccessStatusList(false);
	
}

function onAMASP_listPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	sendSmsGetCarAccessStatusList(true);	
}

function onSubmitError( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

function onSms_getCarAccessStatusInfosSubmitDone(/* cpr.events.CSubmissionEvent */ e){
		var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){		
		var totalCount = app.lookup("Total").getValue("Count");
		selectPaging(totalCount, viewPageCount);
		
		app.lookup("AMASC_opbTotal").value = totalCount + " 명";
		app.lookup("grdAccessStatusCar").redraw();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}	
	
}

function onSms_getCarAccessStatusInfosExportSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var exportParam = app.lookup("ExportParam");
		var dsDataExport = app.lookup("CarAccessStatusInfosExport");
		var dsData = app.lookup("CarAccessStatusInfos");
		
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
			
//			if (dsDataExport.getRowCount() >= exportParam.getValue("total")) {
			if (exportParam.getValue("exportCount") >= exportParam.getValue("total")) { // 현재까지 가져온 사람 수와 전체 사람 수 비교 
				exportExcel();
				comLib.hideLoadMask();
				dsDataExport.clear();
				sendSmsGetCarAccessStatusList(true);
			} else {
				var offset = exportParam.getValue("offset")
				offset += exportCount
				exportParam.setValue("offset", offset)
				comLib.updateLoadMask(offset);
				sendSmsGetCarAccessStatusList(false);
			}
		}
	} else {
		comLib.hideLoadMask();
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function exportExcel() {
	var dsExportList = app.lookup("CarAccessStatusInfosExport");
	var total = dsExportList.getRowCount();
	
	for (var i = 0; i < total; i++) {
		var cardInfo = dsExportList.getRow(i);
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
			case 1: cardInfo.setValue("UserType", dataManager.getString("Str_Admin")); break;
			default: cardInfo.setValue("UserType", "");
		}
	}
	
	var stringified = JSON.stringify(dsExportList.getRowDataRanged());
	
	stringified = stringified.replace(/"UserType"/gi, '"인원구분"');
	stringified = stringified.replace(/"GroupName"/gi, '"소속부서"');
	stringified = stringified.replace(/"PositionName"/gi, '"계급/직급"');
	stringified = stringified.replace(/"UniqueID"/gi, '"군번"');
	stringified = stringified.replace(/"UserName"/gi, '"성명"');
	stringified = stringified.replace(/"CarNumber"/gi, '"차량번호"');
	stringified = stringified.replace(/"InEventTime"/gi, '"입영일시"');
	stringified = stringified.replace(/"InTerminalName"/gi, '"입영단말기"');
	stringified = stringified.replace(/"OutEventTime"/gi, '"퇴영일시"');
	stringified = stringified.replace(/"OutTerminalName"/gi, '"퇴영단말기"');
	stringified = stringified.replace(/"MusteringName"/gi, '"출입장소"');
	stringified = stringified.replace(/"VisitPurpose"/gi, '"출입목적"');
	stringified = stringified.replace(/"VisitTargetPosition"/gi, '"방문대상자 계급/직급"');
	stringified = stringified.replace(/"VisitTargetName"/gi, '"방문대상자 성명"');

	var inputData = JSON.parse(stringified);
	
	var today = dateLib.getToday();
	var filename = "출입현황_차량출입현황_" + today + ".xlsx";
	var ws_name = "출입현황_차량출입현황_";
	
	var wb = XLSX.utils.book_new(),
		ws = XLSX.utils.json_to_sheet(inputData);
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);
	
	XLSX.writeFile(wb, filename);
}


