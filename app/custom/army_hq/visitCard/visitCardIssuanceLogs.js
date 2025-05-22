/************************************************
 * visitCardIssuanceLogs.js
 * Created at 2022. 2. 20. 오후 6:03:25.
 *
 * @author joymrk
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var VMIRS_pageRowCount = 50;
var VMIRS_exportCount = 100; // 한번에 요청할 데이터 수


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var today = dateLib.getToday("-");
	app.lookup("VMIRS_dtiIssueStartAt").value = today;
	app.lookup("VMIRS_dtiIssueEndAt").value = today;
	
	var pageIndexer = app.lookup("VMIRS_piVisitCardList");	
	pageIndexer.pageRowCount = VMIRS_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndexer.viewPageCount = 10;// 보여지는 페이지 수(하단 부 인덱스 수)
	
	// 인원구분으로 검색 불가로 해당 조건 삭제, 안보이게 처리한 excel 버튼이 있는 자리 삭제  - pse
	app.lookup("searchGroup").getLayout().removeColumns([9,10,14]);
	
	sendVisitCardLogListReq(true);
}

function onSubmitError( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

function onVMIRS_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var vMIRS_btnSearch = e.control;
	var pageIndexer = app.lookup("VMIRS_piVisitCardList");
	pageIndexer.currentPageIndex = 1;
	sendVisitCardLogListReq(true);
}


/*
 * 인풋 박스에서 keydown 이벤트 발생 시 호출.
 * 사용자가 키를 누를 때 발생하는 이벤트.
 */
function onVMIRS_ipbNameKeydown(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var vMIRS_ipbName = e.control;
	if(e.keyCode == 13) {
		var pageIndexer = app.lookup("VMIRS_piVisitCardList");
		pageIndexer.currentPageIndex = 1;
		sendVisitCardLogListReq(true);		
	}
}

function sendVisitCardLogListReq(isList){
	app.lookup("AccessCardList").clear();
	var pageIndexer = app.lookup("VMIRS_piVisitCardList");
	var curIndex = pageIndexer.currentPageIndex;
	var offset = (curIndex - 1) * VMIRS_pageRowCount;
	
	var startAt = app.lookup("VMIRS_dtiIssueStartAt").value;
	var endAt = app.lookup("VMIRS_dtiIssueEndAt").value;
	
	var sms_getVisitCardList;	
	if (isList == true) {
		sms_getVisitCardList = app.lookup("sms_getVisitCardLogList");
	} else {
		sms_getVisitCardList = app.lookup("sms_getVisitCardLogListExport");
	}
	sms_getVisitCardList.setParameters("startAt", startAt);
	sms_getVisitCardList.setParameters("endAt", endAt);
	sms_getVisitCardList.setParameters("expire", 1);
	
	if (isList == true) {
		sms_getVisitCardList.setParameters("limit", VMIRS_pageRowCount);
		sms_getVisitCardList.setParameters("offset", offset);
	}else{
		var exportParam = app.lookup("ExportParam");
		offset = exportParam.getValue("offset")
		sms_getVisitCardList.setParameters("limit", VMIRS_exportCount);
		sms_getVisitCardList.setParameters("offset", offset);
	}
	sms_getVisitCardList.setParameters("cardType",app.lookup("VMIRS_cmbAccessCardType").value);	
	var cardStatus = app.lookup("VMIRS_cmbAccessCardStatus").value;
	if( cardStatus == 0 ){
		cardStatus = AccessCardStatusIssuanceStatus
	}
	sms_getVisitCardList.setParameters("accessCardStatus",cardStatus);
	sms_getVisitCardList.setParameters("userName",app.lookup("VMIRS_ipbName").value);	
	sms_getVisitCardList.send();
}

function validateDate( value ){
	if (value==undefined||value == "0001-01-01T00:00:00Z"){return "";}
	if (value.substring(0, 10)=="0001-01-01"){return;}
	return value.substring(0, 10) +" " + value.substring(11, 19);	
}
function onSms_getVisitCardLogListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getVisitCardLogList = e.control;
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
	var pageIndexer = app.lookup("VMIRS_piVisitCardList");
	var total = app.lookup("Total").getValue("Count");
	pageIndexer.totalRowCount = total;
}

function onVMIRS_piVisitCardListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	sendVisitCardLogListReq(true);
}

function onVMIAS_btnExportClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var vMIAS_btnExport = e.control;
	var total = app.lookup("Total").getValue("Count");
	if (total == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "조회된 데이터가 없습니다.");
		return
	}
	var dm_ExportParam = app.lookup("ExportParam");
	dm_ExportParam.setValue("total", total);
	dm_ExportParam.setValue("offset", 0);
	var totalStep = total / VMIRS_exportCount + (total % VMIRS_exportCount != 0) ? 1 : 0;
	comLib.showLoadMask("pro", dataManager.getString("Str_UserExport"), "", totalStep);
	
	sendVisitCardLogListReq(false);
}

function onSms_getVisitCardLogListExportSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getVisitCardLogListExport = e.control;
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
				sendVisitCardLogListReq(true);
			} else {
				var offset = exportParam.getValue("offset")
				offset += VMIRS_exportCount;
				exportParam.setValue("offset", offset)
				comLib.updateLoadMask(offset);
				sendVisitCardLogListReq(false);
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