/************************************************
 * SystemLogManagement.js
 * Created at 2019. 1. 10. 오후 6:07:12.
 *
 * @author wonki
 ************************************************/

var pageRowCount = 50;
var comLib;
var SLMGR_recvRowPerExport = 2000; // 내보내기를 위해 서버에서 한번에 요청하는 최대 로그 수
var SLMGR_excelRowCountPerFile = 100000; // 엑셀 파일당 최대 열 수
var SLMGR_exportFileOffset = 0; // 엑셀 파일당 최대 열 수
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var oem_version;
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	oem_version = dataManager.getOemVersion();
	
	var dtStart = app.lookup("SLMGR_dtStart");
	var dtEnd = app.lookup("SLMGR_dtEnd");
	
//	dtStart.value = '2018-09-01';
//	dtEnd.value = '2018-10-01';
	
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	dtEnd.value = now.format('YYYY-MM-DD');
	
	var before = now.add(-30, 'days');
	dtStart.value = before.format('YYYY-MM-DD');
	
	var udcAuditLogList = app.lookup("SLMGR_udcAuditLogList");
	udcAuditLogList.setPaging(0, 1, 10, pageRowCount);
	
	if (oem_version == OEM_ITONE_TRDATA || oem_version == OEM_ITONE_POSCO_DX) {
		//debugger;
//		app.lookup("auditLogListGrid").header.getColumn(2).visible = false;
		udcAuditLogList.deleteColumn([3]);
	}
	
	if (oem_version == OEM_LOTTE_CS) { // 롯데칠성 시스템 출력 전용 - otk
		var btnExport = app.lookup("btn_Export");
		btnExport.visible = true;
	}
	
	var cmbCategory = app.lookup("SLMGR_cmbCategory");	
	cmbCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_All"),"all"));
	cmbCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_UserID"),"user_id"));
	cmbCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_Name"),"remark"));	
	cmbCategory.selectItemByValue("all");	
	//cmbCategory.value = "all";
	
	var cmbBaseCategory = app.lookup("SLMGR_cmbBaseCategory");
	var cmbAction = app.lookup("SLMGR_cmbAction");
	
	app.lookup("SLMGR_optBase").visible = true;
	cmbBaseCategory.enabled = true;
	cmbBaseCategory.visible = true;
	cmbBaseCategory.setItemSet(getAuditCategory(), {label: "label", value: "value"});
	
	app.lookup("SLMGR_optAction").visible = true;
	cmbAction.enabled = true;
	cmbAction.visible = true;
	cmbAction.setItemSet(getAuditAction(), {label: "label", value: "value"});
	
	var deleteCategory = [3, 5, 7, 8, 17, 22, 9000, 9001, 9002, 9003, 9004];
	var deleteAction = [7, 8, 9, 10, 11, 12, 14, 16, 17, 23];
	for(var i = 0; i < 10; i++){
		cmbBaseCategory.deleteItemByValue(deleteCategory[i]);
		cmbAction.deleteItemByValue(deleteAction[i]);
	}
	
	if (oem_version != OEM_MOTORCYCLE_PARK){
		cmbBaseCategory.deleteItemByValue(9010); // 결제 관리
	}
	
	cmbAction.deleteItemByValue(9003); // 자운대
	cmbAction.deleteItemByValue(131082);
	cmbAction.deleteItemByValue(131083);
	cmbAction.deleteItemByValue(131084);	
	
	if (dataManager.getOemVersion() == OEM_GS_BASIC) {
		app.lookup("SLMGR_optBase").visible = false;
		app.lookup("SLMGR_cmbBaseCategory").visible = false;
		app.lookup("SLMGR_optLocation").visible = false;
		app.lookup("SLMGR_cmbLocation").visible = false;
		app.lookup("SLMGR_optAction").visible = false;
		app.lookup("SLMGR_cmbAction").visible = false;
	}
	
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "list");
	
	sendAuditLogListRequest();
}

function onSubmitError(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

// 검색 버튼 클릭
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	var udcEventLogList = app.lookup("SLMGR_udcAuditLogList");
	udcEventLogList.setCurrentPageIndex(1);
	
	var dsAuditLogList = app.lookup("AuditLogList");
	dsAuditLogList.clear();
	var udcAuditLogList = app.lookup("SLMGR_udcAuditLogList");
	udcAuditLogList.setAuditLogList(dsAuditLogList);
	
	debugger;
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "list");
	
	sendAuditLogListRequest();	
}

function sendAuditLogListRequest() {
	var dtStart = app.lookup("SLMGR_dtStart");
	var dtEnd = app.lookup("SLMGR_dtEnd");
	
	
	if(dateLib.minusDates(dtStart.value.replace(/-/gi,""),dtEnd.value.replace(/-/gi,"")) >= 31){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ThirtyDayOverError"));
		return;
	}
	
	comLib.showLoadMask("",dataManager.getString("Str_Import"),"",0);
	
	var dsAuditLogList = app.lookup("AuditLogList");
	dsAuditLogList.clear();
	
	var udcAuditLogList = app.lookup("SLMGR_udcAuditLogList");
	var curIndex = udcAuditLogList.getCurrentPageIndex();
	var offset = (curIndex - 1) * pageRowCount;
	
	var smsGetAuditLogList = app.lookup("sms_getAuditLogList");
	smsGetAuditLogList.removeAllParameters();
	
	var cmbCategory = app.lookup("SLMGR_cmbCategory");
	var edtKeyword = app.lookup("SLMGR_edtKeyword");

	smsGetAuditLogList.setParameters("startTime", dtStart.value + " 00:00:00");
	smsGetAuditLogList.setParameters("endTime", dtEnd.value + " 23:59:59");
	smsGetAuditLogList.setParameters("location", app.lookup("SLMGR_cmbLocation").value);
	
	
	var dm_ExportParam = app.lookup("dm_ExportParam");
	if (dm_ExportParam.getValue("mode") == "list") {
		smsGetAuditLogList.setParameters("offset", offset);
		smsGetAuditLogList.setParameters("limit", pageRowCount);	
	} else {
		smsGetAuditLogList.setParameters("offset", dm_ExportParam.getValue("offset"));
		smsGetAuditLogList.setParameters("limit", SLMGR_recvRowPerExport);
	}
		
	if (app.lookup("SLMGR_cmbBaseCategory").value != -1){
		smsGetAuditLogList.setParameters("baseCategory", app.lookup("SLMGR_cmbBaseCategory").value);
	}
	if(app.lookup("SLMGR_cmbAction").value != -1){
		smsGetAuditLogList.setParameters("action", app.lookup("SLMGR_cmbAction").value);
	}	
	
	if (cmbCategory.value != null && cmbCategory.value != "all" ){
		if (edtKeyword.value == null || edtKeyword.value.length == 0) {
			cmbCategory.selectItemByValue("all");
		}
	}	
	
	//console.log("category : " + cmbCategory.value);
	//console.log("keyword : " + edtKeyword.value);
	if (cmbCategory.value != null && cmbCategory.value.length > 0) {
		smsGetAuditLogList.setParameters("searchCategory", cmbCategory.value);
	}
	if (edtKeyword.value != null && edtKeyword.value.length > 0) {
		smsGetAuditLogList.setParameters("searchKeyword", edtKeyword.value);
		if (cmbCategory.value != 'remark' && edtKeyword.value.toLowerCase() === 'master'){
			smsGetAuditLogList.setParameters("searchKeyword", 1000000000000000000);
		}
	}
	
	smsGetAuditLogList.send();
	var dm_ExportParam = app.lookup("dm_ExportParam");
	if (dm_ExportParam.getValue("mode") == "list") {
		comLib.showLoadMask("", dataManager.getString("Str_ListLoading"), "");
	}
//	comLib.showLoadMask("", dataManager.getString("Str_TaskStateRunning"), "");
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getAuditLogListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getAuditLogList = e.control;
	comLib.hideLoadMask();

	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode")
	if( resultCode == COMERROR_NONE){
		var dsAuditLogList = app.lookup("AuditLogList");
		var count = dsAuditLogList.getRowCount();
		for( var i = 0; i < count; i++){
			var row = dsAuditLogList.getRow(i);
			if(row){
				if(row.getValue("Category")==2 && row.getValue("Content")==32){ 
					if( row.getValue("Action")==25 || row.getValue("Action")==24){
						var errCode = parseInt(row.getValue("Detail"), 16);
						var strError = dataManager.getString(getErrorString(errCode));
						row.setValue("Detail",strError)
					}					
				}
			}
		}
		var dmTotal = app.lookup("Total");
		
		var totalCount = parseInt(dmTotal.getValue("Count"));
		var totalLabel = app.lookup("SLMGR_optTotal");
		totalLabel.value = totalCount;
		
		var dm_ExportParam = app.lookup("dm_ExportParam");
		if (dm_ExportParam.getValue("mode") == "list") {
			var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
		
			if (viewPageCount > 10) {
				viewPageCount = 10;
			}
			var udcAuditLogList = app.lookup("SLMGR_udcAuditLogList");
			udcAuditLogList.setAuditLogList(dsAuditLogList);	
			udcAuditLogList.setPaging(totalCount, pageRowCount, viewPageCount);
			comLib.hideLoadMask();
		} else {
			
			var exportAuthLogList;
			var exportExcelFunction; // 커스텀별로 exportExcel 함수를 다르게 실행하도록
			
			exportAuthLogList = app.lookup("ExportAuditLogList");	
			exportExcelFunction = exportExcel;		
			
			if (dsAuditLogList.getRowCount() == 0) { // 수신된 데이터가 없으면 종료
				comLib.hideLoadMask();
				if (exportAuthLogList.getRowCount() > 0) { // 더이상 받을 데이터가 없으면 내보내기 리스트에 남아있는 데이터 엑셀 내보내기
					exportExcelFunction(SLMGR_exportFileOffset);
					exportAuthLogList.clear();
				} else {
					dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
				}
			} else {						
				for (var i = 0; i < dsAuditLogList.getRowCount(); i++) {
					var row = exportAuthLogList.pushRowData(dsAuditLogList.getRowData(i));
					//row.setValue("Func", getFuncValue(row.getValue("Func")));
				}
				
				var exportCount = exportAuthLogList.getRowCount();
				if( exportCount >= SLMGR_excelRowCountPerFile ){
					exportExcelFunction(SLMGR_exportFileOffset);
					SLMGR_exportFileOffset++;
					exportAuthLogList.clear();
				} 
				var offset = dm_ExportParam.getValue("offset");
				offset += SLMGR_recvRowPerExport;
				dm_ExportParam.setValue("offset", offset)
				comLib.updateLoadMask(offset);
				sendAuditLogListRequest();
			} 
		}
		
		app.lookup("SLMGR_grp").redraw();

	} else {
		//dialogAlert(app, "Waning", dataManager.getString("Str_UserListGet")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Import")+" "+dataManager.getString("Str_Failed")+"."+dataManager.getString(getErrorString(resultCode)));
	}

}

//로그 요청
function onSLMGR_udcAuditLogListPagechange(/* cpr.events.CSelectionEvent */ e){	
	sendAuditLogListRequest();
}

//도움말 클릭
function onImageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}


// 검색창에서 enter 키 입력
function onSLMGR_edtKeywordKeyup(/* cpr.events.CKeyboardEvent */ e){
	if (e.keyCode == 13) {
		var udcEventLogList = app.lookup("SLMGR_udcAuditLogList");
		udcEventLogList.setCurrentPageIndex(1);
		
		var dsAuditLogList = app.lookup("AuditLogList");
		dsAuditLogList.clear();
		var udcAuditLogList = app.lookup("SLMGR_udcAuditLogList");
		udcAuditLogList.setAuditLogList(dsAuditLogList);
		sendAuditLogListRequest();
	}	
}


/*
 * 버튼(btn_Export)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn_ExportClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	SLMGR_exportFileOffset = 0;
	
	var totalLabel = app.lookup("SLMGR_optTotal");
	var dmTotal = app.lookup("Total")
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "export");
	dm_ExportParam.setValue("total", dmTotal.getValue("Count"));
	dm_ExportParam.setValue("offset", 0);
	if (totalLabel.value == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_AuthLogExportFail"));
	} else {
		var totalLabel = parseInt(totalLabel.value);
		if (totalLabel >= SLMGR_recvRowPerExport) {
			comLib.showLoadMask("pro", dataManager.getString("Str_AuthLogExport"), "", totalLabel / SLMGR_recvRowPerExport);
		} else {
			comLib.showLoadMask("pro", dataManager.getString("Str_AuthLogExport"), "", totalLabel / totalLabel);
		}
		sendAuditLogListRequest();
		return;
	}	
}

function exportExcel(fileNum) {
	
	dataManager = getDataManager();
	
	var dsExportList = app.lookup("ExportAuditLogList");
	var total = dsExportList.getRowCount();
	
	for (var i = 0; i < total; i++) {
		var ExportAuditLog = dsExportList.getRow(i);
		
		var UserID = ExportAuditLog.getValue("UserID");
		if (UserID == 1000000000000000000) {
			ExportAuditLog.setValue("UserID", "Master");
		} else {
			ExportAuditLog.setValue("UserID", UserID);
		}
		
		var CategoryName = AuditCategorySetting(ExportAuditLog.getValue("Category"));
		ExportAuditLog.setValue("Category", CategoryName);
		
		var ContentName = AuditContentSetting(ExportAuditLog.getValue("Content"));
		ExportAuditLog.setValue("Content", ContentName);
			
		var ActionName = AuditActionSetting(ExportAuditLog.getValue("Action"));
		ExportAuditLog.setValue("Action", ActionName);
		
		var LocationValue = ExportAuditLog.getValue("Location");
		if (LocationValue == 0) {
			ExportAuditLog.setValue("Location", "서버");
		} else {
			ExportAuditLog.setValue("Location", "단말기");
		}
	}
	
	processExportExcel(fileNum);		
}

function processExportExcel(fileNum) {
	
	var locale = dataManager.getLocale();
	var InputData;
	
	var dsExportList = app.lookup("ExportAuditLogList")
	
	var total = dsExportList.getRowCount();	

	var stringified = JSON.stringify(dsExportList.getRowDataRanged());		
	stringified = stringified.replace(/"EventTime"/gi, '"'+dataManager.getString("Str_OccurTime")+'"');
	stringified = stringified.replace(/"UserID"/gi, '"'+dataManager.getString("Str_UserID")+'"');
	stringified = stringified.replace(/"Category"/gi, '"'+dataManager.getString("Str_BaseCategory")+'"');
	stringified = stringified.replace(/"Content"/gi, '"'+dataManager.getString("Str_Content")+'"');
	stringified = stringified.replace(/"Action"/gi, '"'+dataManager.getString("Str_Action")+'"');
	stringified = stringified.replace(/"Target"/gi, '"'+dataManager.getString("Str_Target")+'"');
	stringified = stringified.replace(/"Remark"/gi, '"'+dataManager.getString("Str_Name")+'"');
	stringified = stringified.replace(/"Detail"/gi, '"'+dataManager.getString("Str_Detail")+'"');
	stringified = stringified.replace(/"Location"/gi, '"'+dataManager.getString("Str_Location")+'"');

	InputData = JSON.parse(stringified);
		
	/* original data */
	var today = dateLib.getToday();
	var filename = "AuditLogList_" + today +"_"+fileNum+ ".xlsx";
	var ws_name = "AuditLogList_";
	
	var wb = XLSX.utils.book_new(),
		ws = XLSX.utils.json_to_sheet(InputData);
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);
	
	XLSX.writeFile(wb, filename);
	
	// 그룹코드 지웠으니 다시 생성
	//dsExportList.addColumn(new cpr.data.header.DataHeader("GroupCode", "string"));
}

function AuditCategorySetting(CategoryValue) {
	
	var CategoryName;
	var dsCategory = getAuditCategory();
	var findRow = dsCategory.findFirstRow("value ==" + CategoryValue);
	if (findRow) {
		CategoryName = findRow.getValue("label");
	}
	return CategoryName;
}

function AuditContentSetting(ContentValue) {
	var ContentName;
	var dsContent = getAuditContent();
	var findRow = dsContent.findFirstRow("value ==" + ContentValue);
	if (findRow) {
		ContentName = findRow.getValue("label");
	}
	return ContentName;
}

function AuditActionSetting(ActionValue) {
	
	var ActionName;
	var dsAuditAction = getAuditAction();
	var findRow = dsAuditAction.findFirstRow("value ==" + ActionValue);
	if (findRow) {
		ActionName = findRow.getValue("label");
	}
	return ActionName;

}
