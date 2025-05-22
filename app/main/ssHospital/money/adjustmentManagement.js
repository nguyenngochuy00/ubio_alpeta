/************************************************
 * adjustmentManagement.js
 * Created at 2020. 8. 28. 오후 1:34:16.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var SSHAM_pageRowCount = 50;
var SSHAM_pageRowPerExport = 1000;

function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("adjustmentListPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}
function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("adjustmentListPageIndexer");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = SSHAM_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	var dtiMonth = app.lookup("SSHAM_dtMonth");
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	dtiMonth.value = now.format('YYYY-MM');
	var curDate = dtiMonth.calendar.current;
	setPageIndexer(0,1,SSHAM_pageRowCount, 10);
}

function onSSHAM_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	var pageIndex = app.lookup("adjustmentListPageIndexer");	
	pageIndex.currentPageIndex = 1;
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "list");
	sendGetAdjustmentList();
}

function sendGetAdjustmentList() {
	app.lookup("AdjustmentList").clear();
	
	var smsGetAdjustmentList = app.lookup("sms_getAdjustmentList");
	
	var category = app.lookup("SSHAM_cmbCategory").value;
	var keyword = app.lookup("SSHAM_ipbKeyword").value;
	
	var dtiMonth = app.lookup("SSHAM_dtMonth");
	var getDate = dtiMonth.calendar.current;
	
	var yyyymm = getDate.getFullYear().toString() + (getDate.getMonth() + 1).toString();
	var endAt = dateLib.getLastDayOfMonth(yyyymm);

	smsGetAdjustmentList.setParameters("endTime", dateLib.makeDateFormat(endAt, "-") + " 23:59:59"); //월 마지막일자만 
		
	smsGetAdjustmentList.setParameters("searchCategory", category);
	smsGetAdjustmentList.setParameters("searchKeyword", keyword);
	
	if (keyword == null || keyword.length == 0) {
		smsGetAdjustmentList.setParameters("searchCategory", "");
	}
		
	var dm_ExportParam = app.lookup("dm_ExportParam");	
	if( dm_ExportParam.getValue("mode")=="list"){
		var curIndex = app.lookup("adjustmentListPageIndexer").currentPageIndex;
		var offset = (curIndex - 1) * SSHAM_pageRowCount;
		smsGetAdjustmentList.setParameters("offset", offset);
		smsGetAdjustmentList.setParameters("limit", SSHAM_pageRowCount);
	} else {
		smsGetAdjustmentList.setParameters("offset", dm_ExportParam.getValue("offset"));
		smsGetAdjustmentList.setParameters("limit", SSHAM_pageRowPerExport);
	}
	
	
	smsGetAdjustmentList.setParameters("payMode", 0);
	smsGetAdjustmentList.send();
	if( dm_ExportParam.getValue("mode")=="list"){
		comLib.showLoadMask("","정산결과 조회","",0);
	}
}
/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onAdjustmentListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var adjustmentListPageIndexer = e.control;
	sendGetAdjustmentList();
}

function onSSHAM_btnAdjustmentClick(/* cpr.events.CMouseEvent */ e){
	// 정산 처리 요청
	var dtiMonth = app.lookup("SSHAM_dtMonth");
	var getDate = dtiMonth.calendar.current;
	var mm= (getDate.getMonth() + 1).toString();
	if (mm < 10) {
		mm = "0" + mm;
	}
	var yyyymm = getDate.getFullYear().toString() + mm;
	
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	var curMonth = now.format('YYYYMM');
	var monthlySettlementReq = app.lookup("MonthlySettlementReq");
	monthlySettlementReq.clear();
	console.log("yyyymm " + yyyymm + " , curMonth : "+ curMonth);
	if (yyyymm > curMonth) {
		dialogAlert(app, "Waning", "잘못된 정산 처리 요청입니다. '월' 설정을 다시 확인해주세요");
		return;
	} else if (yyyymm < curMonth) {
		dialogConfirm(app.getRootAppInstance(), "", "당월 정산처리가 아닙니다. 정말로 진행 하시겠습니까?", function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue) {
					monthlySettlementReq.setValue("AdjustmentDate", yyyymm); //처리 년도, 처리 월
					monthlySettlementReq.setValue("Processflag", 1);
					sendAdjustmentReq(); 
				} else {
					return;
				}
			});
		});	
	} else {
		dialogConfirm(app.getRootAppInstance(), "", "당월 정산처리 진행 하시겠습니까?", function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue) {
					monthlySettlementReq.setValue("AdjustmentDate", yyyymm); //처리 년도, 처리 월
					monthlySettlementReq.setValue("Processflag", 0); 
					sendAdjustmentReq();
				} else {
					return;
				}
			});
		});
	}
	
}

function sendAdjustmentReq() {
	comLib.showLoadMask("","월단위 정산처리 요청","",0);
	var smsPostAdjustment = app.lookup("sms_postAdjustment");
	smsPostAdjustment.send();
}

function onSms_postAdjustmentSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		dialogAlert(app, "Information", "월 정산처리 요청 완료 되었습니다. 작업관리자에서 진행 상태를 확인하세요");
	} else {
		dialogAlert(app, "Waning", "월 정산처리 요청"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_postAdjustmentSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_postAdjustmentSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onSSHAM_btnExportClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var sSHAM_btnExport = e.control;
	var totalLabel = app.lookup("SSHAM_opbTotal");
	var dmTotal = app.lookup("Total");
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "export");
	dm_ExportParam.setValue("total", dmTotal.getValue("Count"));	
	dm_ExportParam.setValue("offset", 0);
	comLib.showLoadMask("pro","월 정산조회 내보내기","",parseInt(totalLabel.value)/1000);
	
	sendGetAdjustmentList();
}

function onSms_getAdjustmentListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		
		var dsAdjustmentList = app.lookup("AdjustmentList");
		var count = dsAdjustmentList.getRowCount();
		
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		app.lookup("SSHAM_opbTotal").value = totalCount;
			
		var dm_ExportParam = app.lookup("dm_ExportParam");
		if( dm_ExportParam.getValue("mode")=="list"){
			var viewPageCount = totalCount / SSHAM_pageRowCount + (totalCount % SSHAM_pageRowCount > 0);
			if (viewPageCount > 10) {
				viewPageCount = 10;
			}
			selectPaging(totalCount, viewPageCount);
			comLib.hideLoadMask();				
		} else {
			var exportAdjustmentList = app.lookup("ExportAdjustmentList");
			
			if(dsAdjustmentList.getRowCount() == 0 ){
				comLib.hideLoadMask();
				if( exportAdjustmentList.getRowCount() >0 ){
					exportExcel();					
					exportAdjustmentList.clear();
				} else {
					dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
				}
			}else {					
				for(var i = 0; i < dsAdjustmentList.getRowCount(); i++){
					exportAdjustmentList.pushRowData(dsAdjustmentList.getRowData(i));
				}	
				
				if( exportAdjustmentList.getRowCount() >= dm_ExportParam.getValue("total")){
					exportExcel();
					comLib.hideLoadMask();
					exportAdjustmentList.clear();
				} else {
					var offset = dm_ExportParam.getValue("offset")
					offset += SSHAM_pageRowPerExport;
					dm_ExportParam.setValue("offset",offset)
					comLib.updateLoadMask(offset);
					//sendAdjustmentReq();
					sendGetAdjustmentList();
				}
			}
		}
	} else {
		comLib.hideLoadMask();
		dialogAlert(app, "Waning", "월 정산 조회"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getAdjustmentListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getAdjustmentListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


function exportExcel(){
	
	dataManager = getDataManager();
	var dsExportList = app.lookup("ExportAdjustmentList");
	var total = dsExportList.getRowCount()
	
			
	/* original data */
	var today = dateLib.getToday();
	var dtiMonth = app.lookup("SSHAM_dtMonth");
	var getDate = dtiMonth.calendar.current;
	var mm= (getDate.getMonth() + 1).toString();
	if (mm < 10) {
		mm = "0" + mm;
	}
	var yyyy = getDate.getFullYear().toString();
	
	var filename = yyyy+ "년 "+ mm + "월 정산조회_"+today+".xlsx";	
	var ws_name = "월정산조회_";
		
	var wb = XLSX.utils.book_new(), ws = XLSX.utils.json_to_sheet(dsExportList.getRowDataRanged());
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);

	XLSX.writeFile(wb, filename);	
}
