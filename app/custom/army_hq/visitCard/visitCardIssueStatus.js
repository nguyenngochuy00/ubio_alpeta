/************************************************
 * visitCardIssueStatus.js
 * Created at 2021. 2. 4. 오전 8:19:53.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var VMVIS_pageRowCount = 50;
var VMVIS_exportCount = 100; // 한번에 요청할 데이터 수

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var today = dateLib.getToday("-");
	app.lookup("VMVIS_dtiIssueStartAt").value = today;
	app.lookup("VMVIS_dtiIssueEndAt").value = today;
	
	var pageIndexer = app.lookup("VMVIS_piVisitCardList");	
	pageIndexer.pageRowCount = VMVIS_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndexer.viewPageCount = 10;// 보여지는 페이지 수(하단 부 인덱스 수)
	
	app.lookup("VMVIS_cmbAccessCardType").selectItem(0);
	sendVisitCardListReq(true);
}

function onSubmitError( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

// 방문증 검색
function onVMVIS_btnCardIssueStatusSearchClick(/* cpr.events.CMouseEvent */ e){
	var pageIndexer = app.lookup("VMVIS_piVisitCardList");
	pageIndexer.currentPageIndex = 1;
	sendVisitCardListReq(true);
}

function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		var pageIndexer = app.lookup("VMVIS_piVisitCardList");
		pageIndexer.currentPageIndex = 1;
		sendVisitCardListReq(true);	
	}
}

function sendVisitCardListReq(isList){
	app.lookup("AccessCardList").clear();
	
	var pageIndexer = app.lookup("VMVIS_piVisitCardList");
	var curIndex = pageIndexer.currentPageIndex;
	var offset = (curIndex - 1) * VMVIS_pageRowCount
	
	var startAt = app.lookup("VMVIS_dtiIssueStartAt").value;
	var endAt = app.lookup("VMVIS_dtiIssueEndAt").value;
	
	var sms_getVisitCardList;	
	if (isList == true) {
		sms_getVisitCardList = app.lookup("sms_getVisitCardList");
	} else {
		sms_getVisitCardList = app.lookup("sms_getVisitCardListExport");
	}
	
	sms_getVisitCardList.setParameters("registStartAt", startAt);
	sms_getVisitCardList.setParameters("registEndAt", endAt);
	if (isList == true) {
		sms_getVisitCardList.setParameters("limit", VMVIS_pageRowCount);
		sms_getVisitCardList.setParameters("offset", offset);
	}else{
		var exportParam = app.lookup("ExportParam");
		offset = exportParam.getValue("offset")
		sms_getVisitCardList.setParameters("limit", VMVIS_exportCount);
		sms_getVisitCardList.setParameters("offset", offset);
	}
	
	sms_getVisitCardList.setParameters("cardType",app.lookup("VMVIS_cmbAccessCardType").value);	
	var cardStatus = app.lookup("VMVIS_cmbAccessCardStatus").value;
	if( cardStatus == 0 ){
		//cardStatus = AccessCardStatusIssueOrRetrive. 방문증 발급현황이 조회되지 않는 경우가 있다고 해서 카드 상태 미설정시는 전체 검색을 위해 주석 처리
	}
	sms_getVisitCardList.setParameters("accessCardStatus",cardStatus);
	sms_getVisitCardList.setParameters("managementNumber",app.lookup("VMVIS_ipbManagementNumber").value);
	sms_getVisitCardList.send();
}

function validateDate( value ){
	if (value==undefined||value == "0001-01-01T00:00:00Z"){
		return "";
	}
	
//	return value.substring(0, 10) +" " + value.substring(11, 19);	
	return value.substring(0, 10);	
}

// 방문증 리스트 가져오기 완료
function onSms_getVisitCardListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {	
		// console.log(app.lookup("AccessCardList").getRowDataRanged());
		var accessCardList = app.lookup("AccessCardList");
		var count = accessCardList.getRowCount();
		for(var i=0; i<count; i++){
			var accessCard = accessCardList.getRow(i);	
			accessCard.setValue("CardType", getAccessCardTypeName(accessCard.getValue("CardType"),accessCard.getValue("CardTypeEx"), true));		
			accessCard.setValue("IssueAt", validateDate(accessCard.getValue("IssueAt")));
			accessCard.setValue("RegistAt", validateDate(accessCard.getValue("RegistAt")));
			
			// 사고처리인 경우에만 회수날짜(사고처리 일) 출력
			var cardStatus = accessCard.getValue("CardStatus"); 
			switch (cardStatus) {
				case "61":
				case "62":
				case "63":
				case "64": 
					accessCard.setValue("RetrieveAt", validateDate(accessCard.getValue("RetrieveAt")));
					break;
				default:
					accessCard.setValue("RetrieveAt", "-");
					break;
			}
			
		}
		accessCardList.commit();	
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	var pageIndexer = app.lookup("VMVIS_piVisitCardList");
	var total = app.lookup("Total").getValue("Count");
	pageIndexer.totalRowCount = total;
}

function onVMVIS_piVisitCardListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	sendVisitCardListReq(true);
}


function onVMVIS_btnExportClick(/* cpr.events.CMouseEvent */ e){
	var total = app.lookup("Total").getValue("Count");
	if (total == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "조회된 데이터가 없습니다.");
		return
	}
	var dm_ExportParam = app.lookup("ExportParam");
	dm_ExportParam.setValue("total", total);
	dm_ExportParam.setValue("offset", 0);
	var totalStep = total / VMVIS_exportCount + (total % VMVIS_exportCount != 0) ? 1 : 0;
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
				accessCard.setValue("RegistAt", validateDate(accessCard.getValue("RegistAt")));
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
				offset += VMVIS_exportCount
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
	
	// 카드 상태 string값을 excel에 전달, 날짜 포맷 변경
	for (var i=0; i<total; i++){
		dsExportList.getRow(i).getValue("CardStatus");
		var cardStatus = app.lookup("cmb3").getItemByValue(dsExportList.getRow(i).getValue("CardStatus"));
		dsExportList.getRow(i).setValue("CardStatus", cardStatus.label);
		dsExportList.getRow(i).setValue("RegistAt", validateDate(dsExportList.getRow(i).getValue("RegistAt")));
	}
	
	var stringified = JSON.stringify(dsExportList.getRowDataRanged());
	
	stringified = stringified.replace(/"ManagementNumber"/gi, '"관리번호"');
	stringified = stringified.replace(/"CardType"/gi, '"방문증 종류"');
	stringified = stringified.replace(/"CardName"/gi, '"방문증 이름"');
	stringified = stringified.replace(/"CardNumber"/gi, '"카드번호"');
	
	stringified = stringified.replace(/"IssuerGroup"/gi, '"발급자 부서"');
	stringified = stringified.replace(/"IssuerPosition"/gi, '"발급자 계급/직급"');
	stringified = stringified.replace(/"IssuerName"/gi, '"발급자 성명"');
	
//	stringified = stringified.replace(/"OwnerGroup"/gi, '"출입자 부서"');
//	stringified = stringified.replace(/"OwnerPosition"/gi, '"출입자 계급/직급"');
//	stringified = stringified.replace(/"OwnerName"/gi, '"출입자 성명"');
//	stringified = stringified.replace(/"OwnerServiceNumber"/gi, '"출입자 군번"');
//	stringified = stringified.replace(/"OwnerBirthday"/gi, '"출입자 생년월일"');
//		
	stringified = stringified.replace(/"CardStatus"/gi, '"카드상태"');
	stringified = stringified.replace(/"RegistAt"/gi, '"발급일"');
	stringified = stringified.replace(/"RetriveAt"/gi, '"사고처리일"');
	stringified = stringified.replace(/"Description"/gi, '"사유(비고)"');
	var inputData = JSON.parse(stringified);
	
	var today = dateLib.getToday();
	var filename = "방문증_발급현황_" + today + ".xlsx";
	var ws_name = "방문증_발급현황";
	
	var wb = XLSX.utils.book_new(),
		ws = XLSX.utils.json_to_sheet(inputData);
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);
	
	XLSX.writeFile(wb, filename);
}



/*
 * 그리드에서 row-dblclick 이벤트 발생 시 호출.
 * detail이 row를 더블클릭 한 경우 발생하는 이벤트.
 */
function onVMVIS_grdAccessCardListRowDblclick(/* cpr.events.CGridMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var vMVIS_grdAccessCardList = e.control;
	var rowIndex = vMVIS_grdAccessCardList.getSelectedRowIndex();
	
	if(rowIndex >= 0){
		var row = vMVIS_grdAccessCardList.getRow(rowIndex);
		var cardNumber = row.getValue("CardNumber");
		var accessCardInfo = app.lookup("AccessCardList").getRowData(rowIndex);
		var cardStatus = accessCardInfo.CardStatus;
		
		if (cardNumber == undefined || cardNumber == "") { 
			dialogAlertAMHQ(app, dataManager.getString("Str_OK"), "수정은 방문증 발급 후에 하실 수 있습니다.", "");
		} else if(cardStatus == 4) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ARMYHQ_IncidentImpossible"), "");
		}
		else {
			var appId = "app/custom/army_hq/visitCard/visitCardIncidentHandleOne";
			app.getRootAppInstance().openDialog(appId, {width : 750, height : 450}, function(dialog){
				dialog.ready(function(dialogApp){
					dialog.style.header.css("background-color", "#528443");
					dialog.headerTitle = "방문증 관리";
					dialog.modal = true;
					dialog.initValue = {
						"AccessCard" : accessCardInfo
					}
					
				});
			}).then(function(returnValue){
				sendVisitCardListReq(true);
			});
		}
	}
}
