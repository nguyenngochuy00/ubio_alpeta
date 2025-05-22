/************************************************
 * prepayUserLogList.js
 * Created at 2020. 9. 18. 오후 3:23:14.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var SSHPUL_pageRowCount = 50;
var SSHPUL_pageRowPerExport = 100;

function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("prepayUserLogListPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}
function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("prepayUserLogListPageIndexer");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = SSHPUL_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}


function onSSHPUL_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	
	//pageIndex 초기 화
	var pageIndex = app.lookup("prepayUserLogListPageIndexer");	
	pageIndex.currentPageIndex = 1;
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "list");
	sendGetprepayInfoList();
}

function sendGetprepayInfoList() {
	
	var smsGetPrepayUserLogList = app.lookup("sms_getPrepayUserLogList");
	
	var category = app.lookup("SSHPUL_cmbCategory").value;
	var keyword = app.lookup("SSHPUL_ipbKeyword").value;
	var payMode = app.lookup("SSHPUL_rdbPrepayMode").value; // 전체, 충전, 환불, 식수
	var mealType = app.lookup("SSHPUL_cmbMealType").value; //전체, 조,중,석,야,간
	
	var startAt = app.lookup("SSHPUL_dtStart").value;
	startAt = dateLib.makeDateFormat(startAt, "-") + " 00:00:00";
	var endAt = app.lookup("SSHPUL_dtEnd").value;
	endAt = dateLib.makeDateFormat(endAt, "-") + " 23:59:59";
	
	smsGetPrepayUserLogList.setParameters("startTime", startAt);
	smsGetPrepayUserLogList.setParameters("endTime", endAt);
	smsGetPrepayUserLogList.setParameters("searchCategory", category);
	smsGetPrepayUserLogList.setParameters("searchKeyword", keyword);
	
	if (keyword == null || keyword.length == 0) {
		smsGetPrepayUserLogList.setParameters("searchCategory", "");
	}
	
	var dm_ExportParam = app.lookup("dm_ExportParam");	
	if( dm_ExportParam.getValue("mode")=="list"){
		
		var curIndex = app.lookup("prepayUserLogListPageIndexer").currentPageIndex;
		var offset = (curIndex - 1) * SSHPUL_pageRowCount;
		smsGetPrepayUserLogList.setParameters("offset", offset);
		smsGetPrepayUserLogList.setParameters("limit", SSHPUL_pageRowCount);
	} else {
		smsGetPrepayUserLogList.setParameters("offset", dm_ExportParam.getValue("offset"));
		smsGetPrepayUserLogList.setParameters("limit", SSHPUL_pageRowPerExport);
	}
	
	smsGetPrepayUserLogList.setParameters("payMode", payMode);
	smsGetPrepayUserLogList.setParameters("mealType", mealType);
	
	var dsPrepayUserLogList = app.lookup("PrepayUserLogList");
	dsPrepayUserLogList.clear();
	
	smsGetPrepayUserLogList.send();
	var dm_ExportParam = app.lookup("dm_ExportParam");	
	if( dm_ExportParam.getValue("mode")=="list"){
		comLib.showLoadMask("","전체 이력조회","");
	}
}

function onSms_getPrepayUserLogListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		dataManager = getDataManager();
		///////////////////////////////////////////////////////////
		var dsPrepayUserLogList = app.lookup("PrepayUserLogList");
		var count = dsPrepayUserLogList.getRowCount();
		
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		app.lookup("SSHPUL_opbTotal").value = totalCount;
		
		var gettotal = dsPrepayUserLogList.getRowCount()
		var terminalList = dataManager.getTerminalList();
		for( var i = 0; i < gettotal ; i++){
			var prepayUserLogList = dsPrepayUserLogList.getRow(i);
			if (prepayUserLogList.getValue("PMode") == 3) {
				var terminalID = prepayUserLogList.getValue("TerminalID");
				if (terminalID) {
					var searchData = terminalList.findFirstRow("ID =='"+terminalID+"'");
					if( searchData ){
						prepayUserLogList.setValue("TerminalName",searchData.getValue("Name"));
					} else {
						prepayUserLogList.setValue("TerminalName", "");
					}
				}	
			}
		}
		
		var dm_ExportParam = app.lookup("dm_ExportParam");
		if( dm_ExportParam.getValue("mode")=="list"){
			var viewPageCount = totalCount / SSHPUL_pageRowCount + (totalCount % SSHPUL_pageRowCount > 0);
			if (viewPageCount > 10) {
				viewPageCount = 10;
			}
			selectPaging(totalCount, viewPageCount);
			comLib.hideLoadMask();				
		} else {
			var exportPrepayUserList = app.lookup("ExportPrepayUserList");
			if(count == 0 ){
				comLib.hideLoadMask();
				if( exportPrepayUserList.getRowCount() >0 ){
					exportExcel();					
					exportPrepayUserList.clear();
				} else {
					dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
				}
			}else {					
				for(var i = 0; i < dsPrepayUserLogList.getRowCount(); i++){
					exportPrepayUserList.pushRowData(dsPrepayUserLogList.getRowData(i));
					var pmode = dsPrepayUserLogList.getRowData(i).PMode;
					if (pmode != undefined) {
						switch(pmode){
							case 0 : exportPrepayUserList.setValue(i, "PMode", "전체");	break;
							case 1 : exportPrepayUserList.setValue(i, "PMode", "충전");	break;
							case 2 : exportPrepayUserList.setValue(i, "PMode", "환불");	break;
							case 3 : exportPrepayUserList.setValue(i, "PMode", "식수기록");	break;
							default : exportPrepayUserList.setValue(i, "PMode", "미지정"); break;
						}	
					}
					var mealType = dsPrepayUserLogList.getRowData(i).MealType;
					if (mealType != undefined) {
						switch(mealType){
							case 0 : exportPrepayUserList.setValue(i, "MealType", "전체");	break;
							case 1 : exportPrepayUserList.setValue(i, "MealType", "조식");	break;
							case 2 : exportPrepayUserList.setValue(i, "MealType", "중식");	break;
							case 3 : exportPrepayUserList.setValue(i, "MealType", "석식");	break;
							case 4 : exportPrepayUserList.setValue(i, "MealType", "간식");	break;
							case 5 : exportPrepayUserList.setValue(i, "MealType", "야식");	break;
							default : exportPrepayUserList.setValue(i, "MealType", "미지정"); break;
						}	
					}
					
				}	
				console.log(exportPrepayUserList.getRowDataRanged());
				if( exportPrepayUserList.getRowCount() >= dm_ExportParam.getValue("total")){
					exportExcel();
					comLib.hideLoadMask();
					exportPrepayUserList.clear();
				} else {
					var offset = dm_ExportParam.getValue("offset");
					offset += SSHPUL_pageRowPerExport;
					dm_ExportParam.setValue("offset",offset);
					comLib.updateLoadMask(offset);
					sendGetprepayInfoList();
				}
			}
		}
	} else {
		comLib.hideLoadMask();
		dialogAlert(app, "Waning", "전체 이력조회"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
	app.lookup("SSHPUL_grdPrepayUserLogList").redraw();
}

function onSms_getPrepayUserLogListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getPrepayUserLogListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onPrepayUserLogListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var prepayUserLogListPageIndexer = e.control;
	sendGetprepayInfoList();
}

function onSSHPUL_btnExportClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var sSHPUL_btnExport = e.control;
	var totalLabel = app.lookup("SSHPUL_opbTotal");
	var dmTotal = app.lookup("Total");
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "export");
	dm_ExportParam.setValue("total", dmTotal.getValue("Count"));	
	dm_ExportParam.setValue("offset", 0);
	comLib.showLoadMask("pro","전체 이력조회","",parseInt(totalLabel.value)/1000);
	
	sendGetprepayInfoList();
}
function exportExcel(){
	
	dataManager = getDataManager();
	var dsExportList = app.lookup("ExportPrepayUserList");
	/* original data */
	var today = dateLib.getToday();
	var filename = "선불사용자이력조회_"+today+".xlsx";	
	var ws_name = "선불사용자이력조회_";
		
	var wb = XLSX.utils.book_new(), ws = XLSX.utils.json_to_sheet(dsExportList.getRowDataRanged());
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);

	XLSX.writeFile(wb, filename);	
}

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	
	var dtStart = app.lookup("SSHPUL_dtStart");
	var dtEnd = app.lookup("SSHPUL_dtEnd");
		
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	dtEnd.value = now.format('YYYY-MM-DD');
	dtStart.value = now.format('YYYY-MM-DD');
	
	setPageIndexer(0,1,SSHPUL_pageRowCount, 10);
	app.lookup("SSHPUL_cmbCategory").value = "name";
}

/*
 * 라디오 버튼에서 selection-change 이벤트 발생 시 호출.
 * 라디오버튼 아이템을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onSSHPUL_rdbPrepayModeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.RadioButton
	 */
	var sSHPUL_rdbPrepayMode = e.control;
	app.lookup("SSHPUL_cmbMealType").value = 0; //전체로 변경
	// 식수 기록인경우 콤보창 활성화 
	if(sSHPUL_rdbPrepayMode.value == 0 || sSHPUL_rdbPrepayMode.value == 3) {
		app.lookup("SSHPUL_cmbMealType").enabled = true;
	} else {
		app.lookup("SSHPUL_cmbMealType").enabled = false;
	}
	app.lookup("SSHPUL_cmbMealType").redraw();
}


/*
 * "환급처리" 버튼(SSHPUL_btnRefund)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onSSHPUL_btnRefundClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var sSHPUL_btnRefund = e.control;
	var searchType = app.lookup("SSHPUL_rdbPrepayMode");
	if (searchType.value != 3) {
		dialogAlert(app, "Waning", "식수 기록이 아닙니다. 이미 식사하신 금액만 환급처리가 가능합니다. ");
		return;
	}
	var grdPrepayUserLogList = app.lookup("SSHPUL_grdPrepayUserLogList");
	var chkIndices = grdPrepayUserLogList.getCheckRowIndices();
	if(chkIndices.length == 0){		
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedItem"));
		return;
	}
	
	dialogConfirm(app.getRootAppInstance(), "", "실제 환급처리 하시겠습니까?", function(/*cpr.controls.Dialog*/ dialog){
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				//환급처리할 사용자 정보 셋 처리
				
					comLib.showLoadMask("pro", "환급처리 진행","",chkIndices.length);

					var dsRefundList = app.lookup("refundList");
					dsRefundList.clear();
					for( var i = 0; i < chkIndices.length; i++){
						var pMode = grdPrepayUserLogList.getRow(i).getValue("PMode");
						if (pMode != 3) {
							dialogAlert(app, "Waning", "식수 기록만 가능한 기능입니다.");
							return
						}
						var refIndex = chkIndices[i];
						var dsRefund = {"PIndex":grdPrepayUserLogList.getRow(refIndex).getValue("PIndex"),"rowIndex":refIndex};
						dsRefundList.addRowData(dsRefund);
					}
					if (dsRefundList.getRowCount() > 0 ) {
						sendRefundData();	
					}
					
			}
		});
	});
	
}
function sendRefundData() {
	var dsRefundList = app.lookup("refundList");
	if( dsRefundList.getRowCount() == 0 ){
		comLib.hideLoadMask();
		dataManager = getDataManager();
		sendGetprepayInfoList(); // 
		return;
	}
	
	var dsRefund = dsRefundList.getRow(0);
	var rIdx = dsRefund.getValue("rowIndex");
	var grdPrepayUserLogList = app.lookup("SSHPUL_grdPrepayUserLogList");
	var rowData = grdPrepayUserLogList.getRow(rIdx);
	var pIndex = dsRefund.getValue("PIndex");

	var msg = dataManager.getString("Str_UserID")+ " : "+rowData.getValue("ID");
	comLib.updateLoadMask(msg);
	
	var dmReFundInfo =  app.lookup("reFundInfo");
	dmReFundInfo.clear();
	dmReFundInfo.setValue("EventTime", rowData.getValue("EventTime"));
	dmReFundInfo.setValue("TerminalID", rowData.getValue("TerminalID"));
	dmReFundInfo.setValue("UserID", rowData.getValue("ID"));
	dmReFundInfo.setValue("PMode", rowData.getValue("PMode"));
	dmReFundInfo.setValue("MealPay", rowData.getValue("MealPay"));
	dmReFundInfo.setValue("PIndex", pIndex);
	
	var sms_postPrepayUserLog = app.lookup("sms_postPrepayUserLogList"); 
	sms_postPrepayUserLog.action = "/v1/ssh/logs/auth/refund";
	sms_postPrepayUserLog.method = "post";
	sms_postPrepayUserLog.userAttr("pIndex", pIndex.toString());
	sms_postPrepayUserLog.userAttr("rowIndex", dsRefund.getValue("rowIndex").toString());	
	sms_postPrepayUserLog.send();
}

function onSms_postPrepayUserLogListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/* @type cpr.protocols.Submission */
	var sms_postPrepayUserLogList = e.control;
	
	var dsRefundList = app.lookup("refundList");
	dsRefundList.realDeleteRow(0);
	var rowIdx = sms_postPrepayUserLogList.userAttr("rowIndex");
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){
		sendRefundData();
	} else {		
		comLib.hideLoadMask();
		dataManager = getDataManager();
		dialogAlert(app, dataManager.getString("Str_Failed"), "진행중에 [" + rowIdx + "] 번째 기록이 실패 하였습니다.");
	}
}

function onSms_postPrepayUserLogListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_postPrepayUserLogListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
