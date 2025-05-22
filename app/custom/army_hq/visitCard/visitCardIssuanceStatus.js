/************************************************
 * visitCardIssueStatus.js
 * Created at 2021. 2. 4. 오전 8:19:53.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var VMIAS_pageRowCount = 50;
var VMIAS_exportCount = 100; // 한번에 요청할 데이터 수

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var today = dateLib.getToday("-");
	app.lookup("VMIAS_dtiIssueStartAt").value = today;
	app.lookup("VMIAS_dtiIssueEndAt").value = today;
	
	var pageIndexer = app.lookup("VMIAS_piVisitCardList");	
	pageIndexer.pageRowCount = VMIAS_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndexer.viewPageCount = 10;// 보여지는 페이지 수(하단 부 인덱스 수)
	
	// 인원구분으로 검색 불가로 해당 조건 삭제  - pse
	app.lookup("searchGroup").getLayout().removeColumns([9,10]);
	
	sendVisitCardListReq(true);
}

function onSubmitError( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

// 방문증 검색
function onVMIAS_btnCardIssueStatusSearchClick(/* cpr.events.CMouseEvent */ e){
	var pageIndexer = app.lookup("VMIAS_piVisitCardList");
	pageIndexer.currentPageIndex = 1;
	sendVisitCardListReq(true);
}

function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		var pageIndexer = app.lookup("VMIAS_piVisitCardList");
		pageIndexer.currentPageIndex = 1;
		sendVisitCardListReq(true);		
	}
}

function sendVisitCardListReq(isList){
	app.lookup("AccessCardList").clear();
	var pageIndexer = app.lookup("VMIAS_piVisitCardList");
	var curIndex = pageIndexer.currentPageIndex;
	var offset = (curIndex - 1) * VMIAS_pageRowCount
	
	var startAt = app.lookup("VMIAS_dtiIssueStartAt").value;
	var endAt = app.lookup("VMIAS_dtiIssueEndAt").value;
	
	var sms_getVisitCardList;	
	if (isList == true) {
		sms_getVisitCardList = app.lookup("sms_getVisitCardList");
	} else {
		sms_getVisitCardList = app.lookup("sms_getVisitCardListExport");
	}
	sms_getVisitCardList.setParameters("startAt", startAt);
	sms_getVisitCardList.setParameters("endAt", endAt);
	sms_getVisitCardList.setParameters("expire", 1);
	
	if (isList == true) {
		sms_getVisitCardList.setParameters("limit", VMIAS_pageRowCount);
		sms_getVisitCardList.setParameters("offset", offset);
	}else{
		var exportParam = app.lookup("ExportParam");
		offset = exportParam.getValue("offset")
		sms_getVisitCardList.setParameters("limit", VMIAS_exportCount);
		sms_getVisitCardList.setParameters("offset", offset);
	}
	// 기존에는 카드 타입값이 0이면 전체 교부 현황을 가져오도록 되어 있어서
	// 발급 현황에서는 공무원증을 가져오기 위해 기존 값을 0에서 -1로 변경하고 서버에서 예외 처리 함 - pse
	sms_getVisitCardList.setParameters("cardType",app.lookup("VMIAS_cmbAccessCardType").value);	
	var cardStatus = app.lookup("VMIAS_cmbAccessCardStatus").value;
	if( cardStatus == 0 ){
		cardStatus = AccessCardStatusIssuanceStatus
	}
	sms_getVisitCardList.setParameters("accessCardStatus",cardStatus);
	sms_getVisitCardList.setParameters("managementNumber",app.lookup("VMIAS_ipbManagementNumber").value);
	sms_getVisitCardList.setParameters("userName",app.lookup("VMIAS_ipbName").value);
	sms_getVisitCardList.send();
}

function validateDate( value ){
	if (value==undefined||value == "0001-01-01T00:00:00Z"){return "";}
	if (value.substring(0, 10)=="0001-01-01"){return;}
	return value.substring(0, 10) +" " + value.substring(11, 19);	
}

// 방문증 리스트 가져오기 완료
function onSms_getVisitCardListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {	
		console.log(app.lookup("AccessCardList").getRowDataRanged());
		var accessCardList = app.lookup("AccessCardList");
		var count = accessCardList.getRowCount();
		for(var i=0; i<count; i++){
			var accessCard = accessCardList.getRow(i);		
			accessCard.setValue("CardType", getAccessCardTypeName(accessCard.getValue("CardType"),accessCard.getValue("CardTypeEx"), true));
			accessCard.setValue("CardStatus", getAccessCardStatusName(accessCard.getValue("CardStatus")));
			accessCard.setValue("RegistAt", validateDate(accessCard.getValue("RegistAt")));
			accessCard.setValue("IssueAt", validateDate(accessCard.getValue("IssueAt")));
			accessCard.setValue("RetrieveAt", validateDate(accessCard.getValue("RetrieveAt")));
		}
		accessCardList.commit();	
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	var pageIndexer = app.lookup("VMIAS_piVisitCardList");
	var total = app.lookup("Total").getValue("Count");
	pageIndexer.totalRowCount = total;
}

function onVMVIS_piVisitCardListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	sendVisitCardListReq(true);
}

function onVMIAS_btnExportClick(/* cpr.events.CMouseEvent */ e){
	var total = app.lookup("Total").getValue("Count");
	if (total == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "조회된 데이터가 없습니다.");
		return
	}
	var dm_ExportParam = app.lookup("ExportParam");
	dm_ExportParam.setValue("total", total);
	dm_ExportParam.setValue("offset", 0);
	var totalStep = total / VMIAS_exportCount + (total % VMIAS_exportCount != 0) ? 1 : 0;
	comLib.showLoadMask("pro", dataManager.getString("Str_UserExport"), "", totalStep);
	
	sendVisitCardListReq(false);
}

function onSms_getVisitCardListExportSubmitDone(/* cpr.events.CSubmissionEvent */ e){
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
				accessCard.setValue("CardType", getAccessCardTypeName(accessCard.getValue("CardType"),accessCard.getValue("CardTypeEx"), true));	
				accessCard.setValue("IssueAt", validateDate(accessCard.getValue("IssueAt")));
				accessCard.setValue("RetrieveAt", validateDate(accessCard.getValue("RetrieveAt")));
			}
			accessCardList.commit();
			accessCardList.copyToDataSet(accessCardListExport);
			
			if (accessCardListExport.getRowCount() >= exportParam.getValue("total")) {
				exportExcel();
				comLib.hideLoadMask();
				accessCardListExport.clear();
				sendVisitCardListReq(true);
			} else {
				var offset = exportParam.getValue("offset")
				offset += VMIAS_exportCount
				exportParam.setValue("offset", offset)
				comLib.updateLoadMask(offset);
				sendVisitCardListReq(false);
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
	
	stringified = stringified.replace(/"ManagementNumber"/gi, '"관리번호"');
	stringified = stringified.replace(/"CardType"/gi, '"방문증 종류"');
	stringified = stringified.replace(/"CardName"/gi, '"방문증명"');
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
	
	stringified = stringified.replace(/"CardTypeEx"/gi, '""');
	var inputData = JSON.parse(stringified);
	
	var today = dateLib.getToday();
	var filename = "방문공무원증_교부현황_" + today + ".xlsx";
	var ws_name = "방문공무원증_교부현황";
	
	var wb = XLSX.utils.book_new(),
		ws = XLSX.utils.json_to_sheet(inputData);
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);
	
	XLSX.writeFile(wb, filename);
}