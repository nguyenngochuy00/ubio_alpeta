/************************************************
 * civilServiceCardRegistStatus.js
 * Created at 2021. 2. 6. 오후 1:48:16.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var AMCIS_pageRowCount = 50;
var AMCIS_exportCount = 100; // 한번에 요청할 데이터 수

function onBodyLoad(/* cpr.events.CEvent */ e){
	
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var today = dateLib.getToday("-");
	app.lookup("AMCIS_dtiIssueStartAt").value = today;
	app.lookup("AMCIS_dtiIssueEndAt").value = today;
	
	var pageIndexer = app.lookup("AMCIS_piPersonnelList");	
	pageIndexer.pageRowCount = AMCIS_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndexer.viewPageCount = 10;// 보여지는 페이지 수(하단 부 인덱스 수)
	
	var cmbGroup = app.lookup("AMCIS_cmbGroup");
	if (isLoginMaster()){ // 24년도부터 Master를 제외한 관리자는 본인 부서 + 하위 부서만 관리 가능
		cmbGroup.setItemSet(dataManager.getGroup(), {label: "Name",	value: "GroupID"});
		cmbGroup.addItem(new cpr.controls.Item("------", 0));	
	} else {
		cmbGroup.setItemSet(dataManager.getLoginUserGroups(), {label: "Name",	value: "GroupID"});
	}
	cmbGroup.selectItemByValue(getLoginUserGroupCode());
	
	sendAccessCardInfoExListReq(true);	
}

function onSubmitError( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

function sendAccessCardInfoExListReq(isList){
	app.lookup("AccessCardList").clear();
	
	var pageIndexer = app.lookup("AMCIS_piPersonnelList");
	var curIndex = pageIndexer.currentPageIndex;
	var offset = (curIndex - 1) * AMCIS_pageRowCount;
	
	var startAt = app.lookup("AMCIS_dtiIssueStartAt").value+" 00:00:00";
	var endAt = app.lookup("AMCIS_dtiIssueEndAt").value+" 23:59:59";
	
	var sms_getAccessCardInfoExList;
	if (isList == true) {
		sms_getAccessCardInfoExList = app.lookup("sms_getAccessCardInfoExList");
	} else {
		sms_getAccessCardInfoExList = app.lookup("sms_getAccessCardInfoExListExport");
	}
	
	sms_getAccessCardInfoExList.setParameters("name", app.lookup("AMCIS_ipbName").value); 
	sms_getAccessCardInfoExList.setParameters("userType", UserPrivArmySoldier);
	sms_getAccessCardInfoExList.setParameters("group", app.lookup("AMCIS_cmbGroup").value);
	sms_getAccessCardInfoExList.setParameters("userName", app.lookup("AMCIS_ipbName").value);
	sms_getAccessCardInfoExList.setParameters("startAt", startAt);
	sms_getAccessCardInfoExList.setParameters("endAt", endAt);
	sms_getAccessCardInfoExList.setParameters("cardTypeEx", CivilServiceCardNarasarang);
	
	if (isList == true) {
		sms_getAccessCardInfoExList.setParameters("limit", AMCIS_pageRowCount);
		sms_getAccessCardInfoExList.setParameters("offset", offset);
	}else{
		var exportParam = app.lookup("ExportParam");
		offset = exportParam.getValue("offset")
		sms_getAccessCardInfoExList.setParameters("limit", AMCIS_pageRowCount);
		sms_getAccessCardInfoExList.setParameters("offset", offset);
	}
	sms_getAccessCardInfoExList.send()
}

//
function onSms_getAccessCardInfoExListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		
	} else {
		comLib.hideLoadMask();
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onAMCIS_btnPersonnelListSearchClick(/* cpr.events.CMouseEvent */ e){
	var pageIndexer = app.lookup("AMCIS_piPersonnelList");
	pageIndexer.currentPageIndex = 1;
	
	sendAccessCardInfoExListReq(true);
}

function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		var pageIndexer = app.lookup("AMCIS_piPersonnelList");
		pageIndexer.currentPageIndex = 1;
		sendAccessCardInfoExListReq(true);
	}
}

function onAMCIS_piPersonnelListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	sendAccessCardInfoExListReq(true);	
}

function onAMCIS_btnExportClick(/* cpr.events.CMouseEvent */ e){ 
	sendAccessCardInfoExListReq(false);
}

function validateDate(value) {
	if (value == undefined || value == "0001-01-01T00:00:00Z") {
		return "";
	}
	return value.substring(0, 10) + " " + value.substring(11, 19);
}

function onSms_getAccessCardInfoExListExportSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var exportParam = app.lookup("ExportParam");
		var accessCardListExport = app.lookup("AccessCardListExport");
		var accessCardList = app.lookup("AccessCardList"); 
		
		if (accessCardList.getRowCount() == 0) {
			comLib.hideLoadMask();
			if (accessCardListExport.getRowCount() > 0) {
				exportExcel();
				accessCardListExport.clear();
			} else {
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
			}
		} else {
			
			var count = accessCardList.getRowCount();
			for (var i = 0; i < count; i++) {
				var accessCard = accessCardList.getRow(i);		
				accessCard.setValue("UserType", getUserTypeName(accessCard.getValue("UserType")));
				accessCard.setValue("RegistAt", validateDate(accessCard.getValue("RegistAt")));
			}
			accessCardList.commit();
			
			accessCardList.copyToDataSet(accessCardListExport)
			
			if (accessCardListExport.getRowCount() >= exportParam.getValue("total")) {
				exportExcel();
				comLib.hideLoadMask();
				accessCardListExport.clear();
				sendAccessCardInfoExListReq(true);
			} else {
				var offset = exportParam.getValue("offset")
				offset += AMCIS_exportCount
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
	
	var stringified = JSON.stringify(dsExportList.getRowDataRanged());
	
	stringified = stringified.replace(/"UserType"/gi, '"인원구분"');	
	stringified = stringified.replace(/"CardNumber"/gi, '"카드번호"');
			
	stringified = stringified.replace(/"OwnerGroup"/gi, '"부서"');
	stringified = stringified.replace(/"OwnerPosition"/gi, '"계급/직급"');
	stringified = stringified.replace(/"OwnerName"/gi, '"성명"');
	stringified = stringified.replace(/"OwnerServiceNumber"/gi, '"군번"');
	stringified = stringified.replace(/"OwnerBirthday"/gi, '"생년월일"');
	
	stringified = stringified.replace(/"Mobile"/gi, '"휴대폰번호"');
	stringified = stringified.replace(/"CarNumber"/gi, '"차량번호"');
		
	stringified = stringified.replace(/"RegistAt"/gi, '"등록일"');	
	
	var inputData = JSON.parse(stringified);
	
	var today = dateLib.getToday();
	var filename = "나라사랑카드_등록현황_" + today + ".xlsx";
	var ws_name = "나라사랑카드_등록현황";
	
	var wb = XLSX.utils.book_new(),
		ws = XLSX.utils.json_to_sheet(inputData);
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);
	
	XLSX.writeFile(wb, filename);
}
