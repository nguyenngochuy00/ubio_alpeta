/************************************************
 * accessorSearhNModify.js
 * Created at 2021. 2. 24. 오전 11:23:09.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var AMDAM_pageRowCount = 50;
var AMDAM_exportCount = 100; // 한번에 요청할 데이터 수

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var today = dateLib.getToday("-");
	app.lookup("AMDAM_dtiRegistStart").value = today;
	app.lookup("AMDAM_dtiRegistEnd").value = today;
	
	app.lookup("AMDAM_dtiAccessStart").value = today;
	app.lookup("AMDAM_dtiAccessEnd").value = today;
	
	var pageIndexer = app.lookup("AMDAM_piAccessorList");	
	pageIndexer.pageRowCount = AMDAM_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndexer.viewPageCount = 10;// 보여지는 페이지 수(하단 부 인덱스 수)
	
	sendAccessorListReq(true);
}

function onSubmitError( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

function validateDate( value ){
	if (value==undefined||value == "0001-01-01T00:00:00Z"){return "";}
	if (value.substring(0, 10)=="0001-01-01"){return;}
	return value.substring(0, 10);// +" " + value.substring(11, 19);	
}

// "조회" 버튼(AMDAM_btnSearch)에서 click 이벤트 발생 시 호출.
function onAMDAM_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	var pageIndexer = app.lookup("AMDAM_piAccessorList");	
	pageIndexer.currentPageIndex = 1;
	sendAccessorListReq(true);
}

// 페이지 전환
function onAMDAM_piAccessorListClick(/* cpr.events.CMouseEvent */ e){
	sendAccessorListReq(true);
}

function sendAccessorListReq(isList) {
	app.lookup("AccessorList").clear();
	
	var pageIndexer = app.lookup("AMDAM_piAccessorList");
	var curIndex = pageIndexer.currentPageIndex;
	var offset = (curIndex - 1) * AMDAM_pageRowCount;
	
	var sms_getAccessorList;
	if (isList == true) {sms_getAccessorList = app.lookup("sms_getAccessorList");}
	else {sms_getAccessorList = app.lookup("sms_getAccessorListExport");}
	
	
	if( app.lookup("AMDAM_cbxRegistDate").value == "true" ) {
		var startAt = app.lookup("AMDAM_dtiRegistStart").value+" 00:00:00";
		var endAt = app.lookup("AMDAM_dtiRegistEnd").value+" 23:59:59";
		sms_getAccessorList.setParameters("registStartAt", startAt);
		sms_getAccessorList.setParameters("registEndAt", endAt);		
	}
	
	if( app.lookup("AMDAM_cbxAccessDate").value == "true" ) {
		var startAt = app.lookup("AMDAM_dtiAccessStart").value+" 00:00:00";
		var endAt = app.lookup("AMDAM_dtiAccessEnd").value+" 23:59:59";
		sms_getAccessorList.setParameters("accessStartAt", startAt);
		sms_getAccessorList.setParameters("accessEndAt", endAt);		
	}
	
	sms_getAccessorList.setParameters("group", app.lookup("AMDAM_ipbGroup").value);
	sms_getAccessorList.setParameters("documentNumber", app.lookup("AMDAM_ipbDocumentNum").value);
	sms_getAccessorList.setParameters("name", app.lookup("AMDAM_ipbName").value);
	sms_getAccessorList.setParameters("birthday", app.lookup("AMDAM_dtiBirthday").value);
		
	if (isList == true) {
		sms_getAccessorList.setParameters("limit", AMDAM_pageRowCount);
		sms_getAccessorList.setParameters("offset", offset);
	}else{
		var exportParam = app.lookup("ExportParam");
		offset = exportParam.getValue("offset")
		sms_getAccessorList.setParameters("limit", AMDAM_exportCount);
		sms_getAccessorList.setParameters("offset", offset);
	}
	
	sms_getAccessorList.send();
}

function onSms_getAccessorListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
				
		var accessorList = app.lookup("AccessorList");
		var count = accessorList.getRowCount();
		for(var i=0; i<count; i++){
			var accessor = accessorList.getRow(i);
			accessor.setValue("Birthday", validateDate(accessor.getValue("Birthday")));
			accessor.setValue("AccessStart", validateDate(accessor.getValue("AccessStart")));
			accessor.setValue("AccessEnd", validateDate(accessor.getValue("AccessEnd")));
		}
		accessorList.commit();
		
		var pageIndexer = app.lookup("AMDAM_piAccessorList");
		var total = app.lookup("Total").getValue("Count");
		pageIndexer.totalRowCount = total;

	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_getAccessorListExportSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var exportParam = app.lookup("ExportParam");
		var accessorListExport = app.lookup("AccessorListExport");
		var accessorList = app.lookup("AccessorList");
		
		if (accessorList.getRowCount() == 0) {
			comLib.hideLoadMask();
			if (accessorListExport.getRowCount() > 0) {
				exportExcel();
				accessorListExport.clear();
			} else {
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
			}
		} else {
			
			
			var accessorList = app.lookup("AccessorList");
			var count = accessorList.getRowCount();
			for(var i=0; i<count; i++){
				var accessor = accessorList.getRow(i);
				accessor.setValue("Birthday", validateDate(accessor.getValue("Birthday")));
				accessor.setValue("AccessStart", validateDate(accessor.getValue("AccessStart")));
				accessor.setValue("AccessEnd", validateDate(accessor.getValue("AccessEnd")));
			}
			accessorList.commit();
			
			accessorList.copyToDataSet(accessorListExport)
			
			if (accessorListExport.getRowCount() >= exportParam.getValue("total")) {
				exportExcel();
				comLib.hideLoadMask();
				accessorListExport.clear();
				sendAccessorListReq(true);
			} else {
				var offset = exportParam.getValue("offset")
				offset += AMDAM_exportCount
				exportParam.setValue("offset", offset)
				comLib.updateLoadMask(offset);
				sendAccessorListReq(false);
			}
		}
	} else {
		comLib.hideLoadMask();
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// "EXCEL" 버튼(AMDAM_btnExcel)에서 click 이벤트 발생 시 호출.
function onAMDAM_btnExcelClick(/* cpr.events.CMouseEvent */ e){
	var total = app.lookup("Total").getValue("Count");
	if (total == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "조회된 데이터가 없습니다.");
		return
	}
	var dm_ExportParam = app.lookup("ExportParam");
	dm_ExportParam.setValue("total", total);
	dm_ExportParam.setValue("offset", 0);
	var totalStep = total / AMDAM_exportCount + (total % AMDAM_exportCount != 0) ? 1 : 0;
	comLib.showLoadMask("pro", "출입자 다운로드", "", totalStep);
	
	sendAccessorListReq(false);
}


function exportExcel() {
	var dsExportList = app.lookup("AccessorListExport");
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
	var filename = "문서고출입자_" + today + ".xlsx";
	var ws_name = "문서고출입자";
	
	var wb = XLSX.utils.book_new(),
		ws = XLSX.utils.json_to_sheet(inputData);
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);
	
	XLSX.writeFile(wb, filename);
}

function onAMDAM_btnAddClick(/* cpr.events.CMouseEvent */ e){
	var path = "app/custom/army_hq/documentArchive/accessRegistMofidy";

	app.openDialog(path, {width : 760, height : 570}, function(dialog){
		dialog.headerTitle = "출입자 등록/수정";
		dialog.style.header.css("background-color", "#528443");
		dialog.modal = true;	
		dialog.initValue = {"Mode": "regist"};
	}).then(function(returnValue){
		if(returnValue==true){			
			dialogAlertAMHQ(app, dataManager.getString("Str_Success"), "출입자 등록이 완료되었습니다.");
			sendAccessorListReq(true);
		}
	});
}

function onAMDAM_btnModifyClick(/* cpr.events.CMouseEvent */ e){
	
	var grdAccessorList = app.lookup("AMDAM_grdAccessorList");
	var row = grdAccessorList.getSelectedRow();
	
	if(row.getValue("CardNumber") == ""){ // 카드가 교부된 사용자는 수정 불가하도록 수정 - pse
		var path = "app/custom/army_hq/documentArchive/accessRegistMofidy";
	
		app.openDialog(path, {width : 760, height : 570}, function(dialog){
			dialog.headerTitle = "출입자 등록/수정";
			dialog.style.header.css("background-color", "#528443");
			dialog.modal = true;	
			dialog.initValue = {"Mode": "modify","Index":row.getValue("AccessorIndex")};
		}).then(function(returnValue){
			if(returnValue==true){			
				dialogAlertAMHQ(app, dataManager.getString("Str_Success"), "출입자 수정이 완료되었습니다.");
				sendAccessorListReq(true);
			}
		});
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Info"), "출입권한 등록된 출입자는 수정이 불가능합니다.\n출입권한 해제 후 수정하거나\n출입자 삭제 후 재등록 해주세요.");
	}
}

function onAMDAM_btnDeleteClick(/* cpr.events.CMouseEvent */ e){
	var grdAccessorList = app.lookup("AMDAM_grdAccessorList");
	var row = grdAccessorList.getSelectedRow();
	if(row){
		var accessorIndex = row.getValue("AccessorIndex");
		var sms_deleteAccessor = app.lookup("sms_deleteAccessor");
		sms_deleteAccessor.action = "/v1/armyhq/accessor/"+accessorIndex;
		sms_deleteAccessor.send();
	}
}

function onSms_deleteAccessorSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), "출입자 삭제가 완료되었습니다.");
		sendAccessorListReq(true);		
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}
