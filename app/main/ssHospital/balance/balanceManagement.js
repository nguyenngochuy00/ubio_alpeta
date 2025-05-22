/************************************************
 * balanceManagement.js
 * Created at 2020. 8. 10. 오전 7:23:33.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var StrLib = cpr.core.Module.require("lib/StrLib");
var comLib;
var SSHUP_pageRowCount = 50;
var SSHUP_pageRowPerExport = 50;

function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("balanceListPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}
function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("balanceListPageIndexer");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = SSHUP_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	comLib = createComUtil(app);
	dataManager = getDataManager();
	var dtiMonth = app.lookup("SSHBM_dtMonth");
		
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	dtiMonth.value = now.format('YYYY-MM');
	var curDate = dtiMonth.calendar.current;	
	setPageIndexer(0,1,SSHUP_pageRowCount, 10);
	
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "list");
	sendGetBalanceList();
}


/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onSSHBM_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	//pageIndex 초기 화
	var pageIndex = app.lookup("balanceListPageIndexer");	
	pageIndex.currentPageIndex = 1;
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "list");
	sendGetBalanceList();
}

function sendGetBalanceList() {
	app.lookup("BalanceInfoList").clear();
	
	var smsGetBalanceList = app.lookup("sms_getBalanceList");
	
	var category = app.lookup("SSHBM_cmbCategory").value;
	var keyword = app.lookup("SSHBM_ipbKeyword").value;
	
	var dtiMonth = app.lookup("SSHBM_dtMonth");
	var curDate = dtiMonth.calendar.current;
	
	var yyyymm = curDate.getFullYear().toString() + (curDate.getMonth() + 1).toString();
	
//	var startAt = dateLib.getFirstDayOfMonth(yyyymm);  리턴
	var endAt = dateLib.getLastDayOfMonth(yyyymm);

	//smsGetBalanceList.setParameters("startTime", dateLib.makeDateFormat(startAt, "-") + " 00:00:00"); // 시작일 필요없음
	smsGetBalanceList.setParameters("endTime", dateLib.makeDateFormat(endAt, "-") + " 23:59:59");
	
	smsGetBalanceList.setParameters("searchCategory", category);
	smsGetBalanceList.setParameters("searchKeyword", keyword);
	
	if (keyword == null || keyword.length == 0) {
		smsGetBalanceList.setParameters("searchCategory", "");
	}
		
	var dm_ExportParam = app.lookup("dm_ExportParam");	
	if( dm_ExportParam.getValue("mode")=="list"){
		
		var curIndex = app.lookup("balanceListPageIndexer").currentPageIndex;
		var offset = (curIndex - 1) * SSHUP_pageRowCount;
		smsGetBalanceList.setParameters("offset", offset);
		smsGetBalanceList.setParameters("limit", SSHUP_pageRowCount);
	} else {
		smsGetBalanceList.setParameters("offset", dm_ExportParam.getValue("offset"));
		smsGetBalanceList.setParameters("limit", SSHUP_pageRowPerExport);
	}

	
	smsGetBalanceList.setParameters("payMode", 0);
	smsGetBalanceList.send();
		
	if( dm_ExportParam.getValue("mode")=="list"){
		comLib.showLoadMask("", dataManager.getString("Str_ListLoading"), "");
	}
}

function onSms_getBalanceListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
	
		var dsBalanceInfoList = app.lookup("BalanceInfoList");
		var count = dsBalanceInfoList.getRowCount();
		
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		app.lookup("SSHBM_opbTotal").value = totalCount;
			
		var dm_ExportParam = app.lookup("dm_ExportParam");
		if( dm_ExportParam.getValue("mode")=="list"){
			var viewPageCount = totalCount / SSHUP_pageRowCount + (totalCount % SSHUP_pageRowCount > 0);
			if (viewPageCount > 10) {
				viewPageCount = 10;
			}
			selectPaging(totalCount, viewPageCount);
			comLib.hideLoadMask();				
		} else {
			var exportBalanceInfoList = app.lookup("ExportBalanceInfoList");
			
			if(dsBalanceInfoList.getRowCount() == 0 ){
				comLib.hideLoadMask();
				if( exportBalanceInfoList.getRowCount() >0 ){
					exportExcel();					
					exportBalanceInfoList.clear();
				} else {
					dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
				}
			}else {					
				for(var i = 0; i < dsBalanceInfoList.getRowCount(); i++){
					exportBalanceInfoList.pushRowData(dsBalanceInfoList.getRowData(i));
				}	
				
				if( exportBalanceInfoList.getRowCount() >= dm_ExportParam.getValue("total")){
					exportExcel();
					comLib.hideLoadMask();
					exportBalanceInfoList.clear();
				} else {
					var offset = dm_ExportParam.getValue("offset");
					offset += SSHUP_pageRowPerExport;
					dm_ExportParam.setValue("offset",offset);
					comLib.updateLoadMask(offset);
					sendGetBalanceList();
				}
			}
		}
	} else {
		comLib.hideLoadMask();
		dialogAlert(app, "Waning", "잔액 조회"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_getBalanceListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getBalanceListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onBalanceListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var balanceListPageIndexer = e.control;
	sendGetBalanceList();	
}



/*
 * "카드조회" 버튼(SSHBM_btnCardSearch)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onSSHBM_btnCardSearchClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var sSHBM_btnCardSearch = e.control;
	var appld = "app/main/users/userCardRegist"+ "?" + dataManager.getSystemVersion();
	app.getRootAppInstance().openDialog(appld, {width : 640, height : 490}, function(dialog){		
		
		dialog.bind("headerTitle").toLanguage("Str_CardReading");
		dialog.initValue = {"UserID":"","Mode":"Scan","Url":"/v1"};
		dialog.resizable = false;		
		dialog.modal = true;		
	}).then(function(returnValue){ // 지문 등록 화면에서 적용을 누른 경우에만 이 부분으로 들어옴.		
		if(returnValue.length>0){	
			app.lookup("SSHBM_cmbCategory").value="card";
			app.lookup("SSHBM_ipbKeyword").value=returnValue[0].CardNum;	
			var pageIndex = app.lookup("balanceListPageIndexer");	
			pageIndex.currentPageIndex = 1;
			var dm_ExportParam = app.lookup("dm_ExportParam");
			dm_ExportParam.setValue("mode", "list");
			sendGetBalanceList();	
		}		
	});
}


/*
 * "내보내기" 버튼(SSHBM_btnExport)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onSSHBM_btnExportClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var sSHBM_btnExport = e.control;
	var totalLabel = app.lookup("SSHBM_opbTotal");
	var dmTotal = app.lookup("Total");
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "export");
	dm_ExportParam.setValue("total", dmTotal.getValue("Count"));	
	dm_ExportParam.setValue("offset", 0);
	comLib.showLoadMask("pro","잔액 정보 내보내기","", parseInt(totalLabel.value)/50);
	
	sendGetBalanceList();
}

function exportExcel(){
	
	dataManager = getDataManager();
	var dsExportList = app.lookup("ExportBalanceInfoList");
	var total = dsExportList.getRowCount()
	
			
	/* original data */
	var today = dateLib.getToday();
	var filename = "잔액조회_"+today+".xlsx";	
	var ws_name = "잔액조회_";
		
	var wb = XLSX.utils.book_new(), ws = XLSX.utils.json_to_sheet(dsExportList.getRowDataRanged());
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);

	XLSX.writeFile(wb, filename);	
}
