/************************************************
 * accessCardIssueStatus.js
 * Created at 2021. 2. 3. 오후 4:19:50.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var AMIAS_pageRowCount = 50;
var AMIAS_exportCount = 100; // 한번에 요청할 데이터 수

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var today = dateLib.getToday("-");
	app.lookup("AMIAS_dtiIssueStartAt").value = today;
	app.lookup("AMIAS_dtiIssueEndAt").value = today;
	
	var pageIndexer = app.lookup("AMIAS_piApplication");	
	pageIndexer.pageRowCount = AMIAS_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndexer.viewPageCount = 10;// 보여지는 페이지 수(하단 부 인덱스 수)
	
	var cmbGroup = app.lookup("AMIAS_cmbGroup");
	if (isLoginMaster()){ // 24년도부터 Master를 제외한 관리자는 본인 부서 + 하위 부서만 관리 가능
		cmbGroup.setItemSet(dataManager.getGroup(), {label: "Name",	value: "GroupID"});
		cmbGroup.addItem(new cpr.controls.Item("------", 0));	
	} else {
		cmbGroup.setItemSet(dataManager.getLoginUserGroups(), {label: "Name",	value: "GroupID"});
	}
	cmbGroup.selectItemByValue(getLoginUserGroupCode()); 
	sendAccessCardListReq(true);
}

function onSubmitError( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

// 출입증 발급 현황 검색
function onAMAIS_btnCardIssueStatusSearchClick(/* cpr.events.CMouseEvent */ e){
	var pageIndexer = app.lookup("AMIAS_piApplication");	
	pageIndexer.currentPageIndex = 1;
	sendAccessCardListReq(true);
}

function onAMIAS_piApplicationSelectionChange(/* cpr.events.CSelectionEvent */ e){
	sendAccessCardListReq(true);
}

function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		var pageIndexer = app.lookup("AMIAS_piApplication");	
		pageIndexer.currentPageIndex = 1;
		sendAccessCardListReq(true);
	}
}

function sendAccessCardListReq(isList) {
	app.lookup("AccessCardList").clear();
	
	var pageIndexer = app.lookup("AMIAS_piApplication");
	var curIndex = pageIndexer.currentPageIndex;
	var offset = (curIndex - 1) * AMIAS_pageRowCount;
	
	var startAt = app.lookup("AMIAS_dtiIssueStartAt").value+" 00:00:00";
	var endAt = app.lookup("AMIAS_dtiIssueEndAt").value+" 23:59:59";
	var cardType = app.lookup("AMIAS_cmbAccessCardType").value;		
	if( cardType == 0 ){
		cardType = AccessCardTypeFix
	}
	var group = app.lookup("AMIAS_cmbGroup").value;
	var managementNumber = app.lookup("AMIAS_ipbManagementNumber").value;
	
	var sms_getAccessCardInfoList;
	if (isList == true) {
		sms_getAccessCardInfoList = app.lookup("sms_getAccessCardInfoList");
	} else {
		sms_getAccessCardInfoList = app.lookup("sms_getAccessCardInfoListExport");
	}
		
	sms_getAccessCardInfoList.setParameters("startAt", startAt);
	sms_getAccessCardInfoList.setParameters("endAt", endAt);
	sms_getAccessCardInfoList.setParameters("cardType", cardType);
	sms_getAccessCardInfoList.setParameters("accessCardStatus", AccessCardStatusIssuance);
	sms_getAccessCardInfoList.setParameters("group", group);
	sms_getAccessCardInfoList.setParameters("managementNumber", managementNumber);
	if (isList == true) {
		sms_getAccessCardInfoList.setParameters("limit", AMIAS_pageRowCount);
		sms_getAccessCardInfoList.setParameters("offset", offset);
	}else{
		var exportParam = app.lookup("ExportParam");
		offset = exportParam.getValue("offset")
		sms_getAccessCardInfoList.setParameters("limit", AMIAS_exportCount);
		sms_getAccessCardInfoList.setParameters("offset", offset);
	}
	
	sms_getAccessCardInfoList.send();
}

function validateDate( value ){
	if (value==undefined||value == "0001-01-01T00:00:00Z"){return "";}
	if (value.substring(0, 10)=="0001-01-01"){return;}
	return value.substring(0, 10) +" " + value.substring(11, 19);	
}
// 출입증 발급 현황 리스트 가져오기 완료
function onSms_getAccessCardUserInfoListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		/*
		if( app.lookup("AccessCardList").getRowCount() == 0 ){
			dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_NoSearchResult"));
		}
		* 		*/
		
		var accessCardList = app.lookup("AccessCardList");
		var count = accessCardList.getRowCount();
		for(var i=0; i<count; i++){
			var accessCard = accessCardList.getRow(i);	
			accessCard.setValue("CardType", getAccessCardTypeName(accessCard.getValue("CardType"),accessCard.getValue("CardTypeEx"), false));		
			accessCard.setValue("IssueAt", validateDate(accessCard.getValue("IssueAt")));
			accessCard.setValue("RetrieveAt", validateDate(accessCard.getValue("RetrieveAt")));
		}
		accessCardList.commit();
		
		
		var pageIndexer = app.lookup("AMIAS_piApplication");
		var total = app.lookup("Total").getValue("Count");
		pageIndexer.totalRowCount = total;

	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}


function onAMIAS_btnExportClick(/* cpr.events.CMouseEvent */ e){
	var total = app.lookup("Total").getValue("Count");
	if (total == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "조회된 데이터가 없습니다.");
		return
	}
	var dm_ExportParam = app.lookup("ExportParam");
	dm_ExportParam.setValue("total", total);
	dm_ExportParam.setValue("offset", 0);
	var totalStep = total / AMIAS_exportCount + (total % AMIAS_exportCount != 0) ? 1 : 0;
	comLib.showLoadMask("pro", dataManager.getString("Str_UserExport"), "", totalStep);
	
	sendAccessCardListReq(false);
}

function onSms_getAccessCardInfoListExportSubmitDone(/* cpr.events.CSubmissionEvent */ e){
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
				accessCard.setValue("CardType", getAccessCardTypeName(accessCard.getValue("CardType"),accessCard.getValue("CardTypeEx"), false));		
				accessCard.setValue("IssueAt", validateDate(accessCard.getValue("IssueAt")));
				accessCard.setValue("RetrieveAt", validateDate(accessCard.getValue("RetrieveAt")));
			}
			accessCardList.commit();
			
			accessCardList.copyToDataSet(accessCardListExport)
			
			if (accessCardListExport.getRowCount() >= exportParam.getValue("total")) {
				exportExcel();
				comLib.hideLoadMask();
				accessCardListExport.clear();
				sendAccessCardListReq(true);
			} else {
				var offset = exportParam.getValue("offset")
				offset += AMIAS_exportCount
				exportParam.setValue("offset", offset)
				comLib.updateLoadMask(offset);
				sendAccessCardListReq(false);
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
		cardInfo.setValue("CardType", getAccessCardTypeName(cardInfo.getValue("CardType"),cardInfo.getValue("CardTypeEx"), false));		
		cardInfo.setValue("CardTypeEx", "");		
		cardInfo.setValue("CardStatus", getAccessCardStatusName(cardInfo.getValue("CardStatus")));
	}
	
	var stringified = JSON.stringify(dsExportList.getRowDataRanged());
	
	stringified = stringified.replace(/"ManagementNumber"/gi, '"관리번호"');
	stringified = stringified.replace(/"CardType"/gi, '"출입증 종류"');
	stringified = stringified.replace(/"CardNumber"/gi, '"카드번호"');
	stringified = stringified.replace(/"CardStatus"/gi, '"카드상태"');
	
	stringified = stringified.replace(/"IssuerGroup"/gi, '"발급자 부서"');
	stringified = stringified.replace(/"IssuerPosition"/gi, '"발급자 계급/직급"');
	stringified = stringified.replace(/"IssuerName"/gi, '"발급자 성명"');
	
	stringified = stringified.replace(/"OwnerGroup"/gi, '"출입자 부서"');
	stringified = stringified.replace(/"OwnerPosition"/gi, '"출입자 계급/직급"');
	stringified = stringified.replace(/"OwnerName"/gi, '"출입자 성명"');
	stringified = stringified.replace(/"OwnerServiceNumber"/gi, '"출입자 군번"');
	stringified = stringified.replace(/"OwnerBirthday"/gi, '"출입자 생년월일"');
	
	stringified = stringified.replace(/"IssueAt"/gi, '"발급일"');
	stringified = stringified.replace(/"RetrieveAt"/gi, '"회수일"');
	
	stringified = stringified.replace(/"Description"/gi, '"사유(비고)"');
	
	stringified = stringified.replace(/"CardTypeEx"/gi, '""');
	var inputData = JSON.parse(stringified);
	
	var today = dateLib.getToday();
	var filename = "출입증_교부현황_" + today + ".xlsx";
	var ws_name = "출입증_교부현황";
	
	var wb = XLSX.utils.book_new(),
		ws = XLSX.utils.json_to_sheet(inputData);
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);
	
	XLSX.writeFile(wb, filename);
}
