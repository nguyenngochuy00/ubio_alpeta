/************************************************
 * prePayHistoryManagement.js
 * Created at 2020. 8. 3. 오후 1:18:39.
 *
 * @author joymrk
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var SHPPH_pageRowCount = 50;
var SHPPH_pageRowPerExport = 500;

function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("PrepaymentListPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}
function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("PrepaymentListPageIndexer");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = SHPPH_pageRowCount;//한 페이지에 보여 줄 행의 수
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
	
	var dtStart = app.lookup("SHPPH_dtStart");
	var dtEnd = app.lookup("SHPPH_dtEnd");
		
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	dtEnd.value = now.format('YYYY-MM-DD');
	dtStart.value = now.format('YYYY-MM-DD');
	
	setPageIndexer(0,1,10, SHPPH_pageRowCount);
	app.lookup("SHPPH_cmbCategory").value = "name";
}

function onSHPPH_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	//pageIndex 초기 화
	var pageIndex = app.lookup("PrepaymentListPageIndexer");	
	pageIndex.currentPageIndex = 1;
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "list");
	sendGetPrepayHistoryList();
}

function sendGetPrepayHistoryList() {
	var smsgetPrepayHistory = app.lookup("sms_getPrepayHistory");
	
	var category = app.lookup("SHPPH_cmbCategory").value;
	var keyword = app.lookup("SHPPH_ipbKeyword").value;
	var payMode = app.lookup("SHPPH_rdbPrepayMode").value; 
	
	var startAt = app.lookup("SHPPH_dtStart").value;
	startAt = dateLib.makeDateFormat(startAt, "-") + " 00:00:00";
	var endAt = app.lookup("SHPPH_dtEnd").value;
	endAt = dateLib.makeDateFormat(endAt, "-") + " 23:59:59";
	
	smsgetPrepayHistory.setParameters("startTime", startAt);
	smsgetPrepayHistory.setParameters("endTime", endAt);
	smsgetPrepayHistory.setParameters("searchCategory", category);
	smsgetPrepayHistory.setParameters("searchKeyword", keyword);
	
	if (keyword == null || keyword.length == 0) {
		smsgetPrepayHistory.setParameters("searchCategory", "");
	}
	
	var dm_ExportParam = app.lookup("dm_ExportParam");	
	if( dm_ExportParam.getValue("mode")=="list"){
		
		var curIndex = app.lookup("PrepaymentListPageIndexer").currentPageIndex;
		var offset = (curIndex - 1) * SHPPH_pageRowCount;
		smsgetPrepayHistory.setParameters("offset", offset);
		smsgetPrepayHistory.setParameters("limit", SHPPH_pageRowCount);
	} else {
		smsgetPrepayHistory.setParameters("offset", dm_ExportParam.getValue("offset"));
		smsgetPrepayHistory.setParameters("limit", SHPPH_pageRowPerExport);
	}
	
	smsgetPrepayHistory.setParameters("payMode", payMode);
	
	var dsPrepayHistoryList = app.lookup("PrepayHistoryList");
	dsPrepayHistoryList.clear();
	
	smsgetPrepayHistory.send();
	if( dm_ExportParam.getValue("mode")=="list"){
		comLib.showLoadMask("","선불 결제 이력 조회","");
	}
}

function onSms_getPrepayHistorySubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	//comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		///////////////////////////////////////////////////////////
		var dsPrepayHistoryList = app.lookup("PrepayHistoryList");
		var count = dsPrepayHistoryList.getRowCount();
		
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		app.lookup("SHPPH_opbTotal").value = totalCount;
			
		var dm_ExportParam = app.lookup("dm_ExportParam");
		if( dm_ExportParam.getValue("mode")=="list"){
			var viewPageCount = totalCount / SHPPH_pageRowCount + (totalCount % SHPPH_pageRowCount > 0);
			if (viewPageCount > 10) {
				viewPageCount = 10;
			}
			selectPaging(totalCount, viewPageCount);
			comLib.hideLoadMask();				
		} else {
			var exportPrepayHistoryList = app.lookup("ExportPrepayHistoryList");
			if(dsPrepayHistoryList.getRowCount() == 0 ){
				comLib.hideLoadMask();
				if( exportPrepayHistoryList.getRowCount() >0 ){
					exportExcel();					
					exportPrepayHistoryList.clear();
				} else {
					dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
				}
			}else {					
				for(var i = 0; i < dsPrepayHistoryList.getRowCount(); i++){
					exportPrepayHistoryList.pushRowData(dsPrepayHistoryList.getRowData(i));
				}	
				if( exportPrepayHistoryList.getRowCount() >= dm_ExportParam.getValue("total")){
					exportExcel();
					comLib.hideLoadMask();
					exportPrepayHistoryList.clear();
				} else {
					var offset = dm_ExportParam.getValue("offset");
					offset += SHPPH_pageRowPerExport;
					dm_ExportParam.setValue("offset",offset);
					comLib.updateLoadMask(offset);
					sendGetPrepayHistoryList();
				}
			}
		}
	} else {
		comLib.hideLoadMask();
		dialogAlert(app, "Waning", "선불결제 이력조회"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
		
	}
	app.lookup("SHPPH_grdPrepayHistory").redraw();
}

function onSms_getPrepayHistorySubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getPrepayHistorySubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onPrepaymentListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var prepaymentListPageIndexer = e.control;
	sendGetPrepayHistoryList();
}


/*
 * "오늘" 버튼(SHPPH_btnToday)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onSHPPH_btnTodayClick(/* cpr.events.CMouseEvent */ e){
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	var dtStart = app.lookup("SHPPH_dtStart");
	var dtEnd = app.lookup("SHPPH_dtEnd");
	dtEnd.value = now.format('YYYY-MM-DD');
	dtStart.value = now.format('YYYY-MM-DD');
}

function onSHPPH_btnOneWeekClick(/* cpr.events.CMouseEvent */ e){
	var dtStart = app.lookup("SHPPH_dtStart");
	var dtEnd = app.lookup("SHPPH_dtEnd");
	
	var calcDay = dateLib.calcToday("","",-7); //7일전
	var startData = dateLib.makeDateFormat(calcDay, "-");
	dtStart.value = startData;
	
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	dtEnd.value = now.format('YYYY-MM-DD');
}


/*
 * "한달" 버튼(SHPPH_btnOneMonth)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onSHPPH_btnOneMonthClick(/* cpr.events.CMouseEvent */ e){
	var dtStart = app.lookup("SHPPH_dtStart");
	var dtEnd = app.lookup("SHPPH_dtEnd");
	
	var calcDay = dateLib.calcToday("",-1,""); //한달전
	var startData = dateLib.makeDateFormat(calcDay, "-");
	dtStart.value = startData;
	
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	dtEnd.value = now.format('YYYY-MM-DD');
}


/*
 * "내보내기" 버튼(SHPPH_btnExport)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onSHPPH_btnExportClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var sHPPH_btnExport = e.control;
	var totalLabel = app.lookup("SHPPH_opbTotal");
	var dmTotal = app.lookup("Total");
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "export");
	dm_ExportParam.setValue("total", dmTotal.getValue("Count"));	
	dm_ExportParam.setValue("offset", 0);
	comLib.showLoadMask("pro","선불결제 이력 조회","",parseInt(totalLabel.value)/1000);
	
	sendGetPrepayHistoryList();
}

function exportExcel(){
	
	dataManager = getDataManager();
	var dsExportList = app.lookup("ExportPrepayHistoryList");
	var total = dsExportList.getRowCount()
	for( var i = 0; i < total ; i++){
		var PrepayHistory = dsExportList.getRow(i);
		
		var pmode = PrepayHistory.getValue("PMode");		
		if (pmode == 1) {
			PrepayHistory.setValue("PMode", "충전");	
		} else {
			PrepayHistory.setValue("PMode", "환불");
		}
	}
	
	
	/* original data */
	var today = dateLib.getToday();
	var filename = "선불결제조회_"+today+".xlsx";	
	var ws_name = "선불결제조회_";
		
	var wb = XLSX.utils.book_new(), ws = XLSX.utils.json_to_sheet(dsExportList.getRowDataRanged());
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);

	XLSX.writeFile(wb, filename);	
}