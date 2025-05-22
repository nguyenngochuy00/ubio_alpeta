/************************************************
 * civilServiceCardRegistStatus.js
 * Created at 2021. 2. 6. 오후 1:48:16.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var VMVSS_pageRowCount = 50;
var exportCount = 100; // 한번에 요청할 데이터 수

function onBodyLoad(/* cpr.events.CEvent */ e){
	
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var today = dateLib.getToday("-");
	app.lookup("VMVSS_dtiIssueStartAt").value = today;
	app.lookup("VMVSS_dtiIssueEndAt").value = today;
	
	var pageIndexer = app.lookup("VMVSS_piPersonnelList");	
	pageIndexer.pageRowCount = VMVSS_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndexer.viewPageCount = 10;// 보여지는 페이지 수(하단 부 인덱스 수)
	
	var cmbGroup = app.lookup("VMVSS_cmbGroup");
	cmbGroup.setItemSet(dataManager.getGroup(),{label:"Name",value:"GroupID"});
	cmbGroup.addItem(new cpr.controls.Item("------", 0));
	cmbGroup.selectItemByValue(0);
	
	// 부서 검색 조건 삭제 - pse
	app.lookup("searchGroup").getLayout().removeColumns([7,8]);

	sendAccessCardInfoExListReq(true);	
}
function sendAccessCardInfoExListReq(isList){
	app.lookup("AccessCardList").clear();
	
	var pageIndexer = app.lookup("VMVSS_piPersonnelList");
	var curIndex = pageIndexer.currentPageIndex;
	var offset = (curIndex - 1) * VMVSS_pageRowCount;
	
	var startAt = app.lookup("VMVSS_dtiIssueStartAt").value;
	var endAt = app.lookup("VMVSS_dtiIssueEndAt").value;
	
	var submision;
	if (isList == true) {
		submision = app.lookup("sms_getAccessCardInfoExList");
		submision.setParameters("limit", VMVSS_pageRowCount);
		submision.setParameters("offset", offset);
	} else {
		submision = app.lookup("sms_getAccessCardInfoExListExport");
		
		var exportParam = app.lookup("ExportParam");
		offset = exportParam.getValue("offset");
		submision.setParameters("limit", exportCount);
		submision.setParameters("offset", offset);
	}
	
	submision.setParameters("name", app.lookup("VMVSS_ipbName").value); 
	submision.setParameters("userType", app.lookup("VMVSS_cmbUserType").value);
	//submision.setParameters("group", app.lookup("VMVSS_cmbGroup").value);
	submision.setParameters("userName", app.lookup("VMVSS_ipbName").value);
	submision.setParameters("startAt", startAt);
	submision.setParameters("endAt", endAt);
	submision.setParameters("cardTypeEx", CivilServiceCardVisit);
	submision.send();
}

function onAMCIS_btnPersonnelListSearchClick(/* cpr.events.CMouseEvent */ e){
	sendAccessCardInfoExListReq(true);	
}

function onVMVSS_piPersonnelListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	sendAccessCardInfoExListReq(true);	
}

function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		sendAccessCardInfoExListReq(true);		
	}
}

/*
 * "Excel" 버튼(VMVSS_btnExport)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVMVSS_btnExportClick(/* cpr.events.CMouseEvent */ e){
		var total = app.lookup("Total").getValue("Count");
	if (total == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "조회된 데이터가 없습니다.");
		return
	}
	var dm_ExportParam = app.lookup("ExportParam");
	dm_ExportParam.setValue("total", total);
	dm_ExportParam.setValue("offset", 0);
	var totalStep = total / exportCount + (total % exportCount != 0) ? 1 : 0;
	comLib.showLoadMask("pro", "방문공무원증현황 내보내기", "", totalStep);
	
	sendAccessCardInfoExListReq(false);
	
}


function onSubmitError( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

function onSms_getAccessCardInfoExListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){		
		
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
	
	var pageIndexer = app.lookup("VMVSS_piPersonnelList");
	var total = app.lookup("Total").getValue("Count");
	pageIndexer.totalRowCount = total;
	
}

function onSms_getAccessCardInfoExListExportSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var exportParam = app.lookup("ExportParam");
		var dsDataExport = app.lookup("AccessCardListExport");
		var dsData = app.lookup("AccessCardList");
		
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
				sendAccessCardInfoExListReq(true);
			} else {
				var offset = exportParam.getValue("offset")
				offset += exportCount
				exportParam.setValue("offset", offset)
				comLib.updateLoadMask(offset);
				sendAccessCardInfoExListReq(false);
			}
		}
	} else {
		comLib.hideLoadMask();
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	
}

function exportExcel() {
	var dsExportList = app.lookup("AccessCardListExport");
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
			default: cardInfo.setValue("UserType", "");
		}
		
		var regAt = cardInfo.getValue("RegistAt");
		cardInfo.setValue("RegistAt", regAt.substring(0, 10) +" " + regAt.substring(11, 19));
	}
	
	var stringified = JSON.stringify(dsExportList.getRowDataRanged());
	
	stringified = stringified.replace(/"UserType"/gi, '"인원구분"');
	stringified = stringified.replace(/"CardNumber"/gi, '"공무원증 번호"');
	stringified = stringified.replace(/"OwnerGroup"/gi, '"부서"');
	stringified = stringified.replace(/"OwnerPosition"/gi, '"계급/직급"');
	stringified = stringified.replace(/"OwnerName"/gi, '"성명"');
	stringified = stringified.replace(/"OwnerServiceNumber"/gi, '"군번"');
	stringified = stringified.replace(/"OwnerBirthday"/gi, '"생년월일"');
	stringified = stringified.replace(/"Mobile"/gi, '"휴대폰 번호"');
	stringified = stringified.replace(/"CarNumber"/gi, '"차량번호"');
	stringified = stringified.replace(/"RegistAt"/gi, '"등록일시"');


	var inputData = JSON.parse(stringified);
	
	var today = dateLib.getToday();
	var filename = "방문증현황_방문공무원증현황_" + today + ".xlsx";
	var ws_name = "방문증현황_방문공무원증현황_";
	
	var wb = XLSX.utils.book_new(),
		ws = XLSX.utils.json_to_sheet(inputData);
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);
	
	XLSX.writeFile(wb, filename);
}
