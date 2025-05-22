/************************************************
 * cardIssueLogs.js
 * Created at 2020. 8. 14. 오전 10:09:41.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var StrLib = cpr.core.Module.require("lib/StrLib");
var comLib;
var SSHCM_pageRowCount = 50;
var SSHCM_pageRowPerExport = 1000;

function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("cardLogListPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}
function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("cardLogListPageIndexer");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = SSHCM_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	var dtStart = app.lookup("SSHCM_dtiStart");
	var dtEnd = app.lookup("SSHCM_dtiEnd");
		
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	dtEnd.value = now.format('YYYY-MM-DD');
	dtStart.value = now.format('YYYY-MM-DD');
	
	setPageIndexer(0,1,SSHCM_pageRowCount, 10);
	app.lookup("SSHCM_cmbCategory").value = "name";
}

function onCardLogListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var cardLogListPageIndexer = e.control;
	sendGetCardLogList();
}

function sendGetCardLogList() {
	app.lookup("CardLogList").clear();
	
	
	var curPageIndex = app.lookup("cardLogListPageIndexer").currentPageIndex; 
	var offset = (curPageIndex - 1) * SSHCM_pageRowCount;
	var smsgetPrepayHistory = app.lookup("sms_getCardLogList");
	
	var category = app.lookup("SSHCM_cmbCategory").value;
	var keyword = app.lookup("SSHCM_ipbKeyword").value;
	
	var startAt = app.lookup("SSHCM_dtiStart").value;
	startAt = dateLib.makeDateFormat(startAt, "-") + " 00:00:00";
	var endAt = app.lookup("SSHCM_dtiEnd").value
	endAt = dateLib.makeDateFormat(endAt, "-") + " 23:59:59"
	
	smsgetPrepayHistory.setParameters("startTime", startAt);
	smsgetPrepayHistory.setParameters("endTime", endAt);
	smsgetPrepayHistory.setParameters("searchCategory", category);
	smsgetPrepayHistory.setParameters("searchKeyword", keyword);
	
	if (keyword == null || keyword.length == 0) {
		smsgetPrepayHistory.setParameters("searchCategory", "");
	}
	
	var dm_ExportParam = app.lookup("dm_ExportParam");	
	if( dm_ExportParam.getValue("mode")=="list"){
		var curIndex = app.lookup("cardLogListPageIndexer").currentPageIndex;
		var offset = (curIndex - 1) * SSHCM_pageRowCount;
		smsgetPrepayHistory.setParameters("offset", offset);
		smsgetPrepayHistory.setParameters("limit", SSHCM_pageRowCount);
	} else {
		smsgetPrepayHistory.setParameters("offset", dm_ExportParam.getValue("offset"));
		smsgetPrepayHistory.setParameters("limit", SSHCM_pageRowCount);
	}
	
	smsgetPrepayHistory.setParameters("offset", offset);
	smsgetPrepayHistory.setParameters("limit", SSHCM_pageRowCount);
	smsgetPrepayHistory.setParameters("payMode", 0);
	smsgetPrepayHistory.send();
		var dm_ExportParam = app.lookup("dm_ExportParam");	
	if( dm_ExportParam.getValue("mode")=="list"){
		comLib.showLoadMask("","카드 이력 조회","",0);
	}
	
}

function onSSHCM_btnCardSearchClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var sSHCM_btnCardSearch = e.control;
	var appld = "app/main/users/userCardRegist"+ "?" + dataManager.getSystemVersion();
	app.getRootAppInstance().openDialog(appld, {width : 640, height : 490}, function(dialog){		
		
		dialog.bind("headerTitle").toLanguage("Str_CardReading");
		dialog.initValue = {"UserID":"","Mode":"Scan","Url":"/v1"};
		dialog.resizable = false;		
		dialog.modal = true;		
	}).then(function(returnValue){ // 지문 등록 화면에서 적용을 누른 경우에만 이 부분으로 들어옴.		
		if(returnValue.length>0){	
			app.lookup("SSHCM_cmbCategory").value="card";
			app.lookup("SSHCM_ipbKeyword").value=returnValue[0].CardNum;	
			var pageIndex = app.lookup("cardLogListPageIndexer");	
			pageIndex.currentPageIndex = 1;
			sendGetCardLogList();	
		}		
	});
}

function onSms_getCardLogListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		
		var dsCardLogList = app.lookup("CardLogList");
		var count = dsCardLogList.getRowCount();
		
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		app.lookup("SSHCM_opbTotal").value = totalCount;
			
		var dm_ExportParam = app.lookup("dm_ExportParam");
		if( dm_ExportParam.getValue("mode")=="list"){
			var viewPageCount = totalCount / SSHCM_pageRowCount + (totalCount % SSHCM_pageRowCount > 0);
			if (viewPageCount > 10) {
				viewPageCount = 10;
			}
			selectPaging(totalCount, viewPageCount);
			comLib.hideLoadMask();				
		} else {
			var exportCardLogList = app.lookup("ExportCardLogList");
			if(dsCardLogList.getRowCount() == 0 ){
				comLib.hideLoadMask();
				if( exportCardLogList.getRowCount() >0 ){
					exportExcel();					
					exportCardLogList.clear();
				} else {
					dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
				}
			}else {					
				for(var i = 0; i < dsCardLogList.getRowCount(); i++){
					exportCardLogList.pushRowData(dsCardLogList.getRowData(i));
				}	
				if( exportCardLogList.getRowCount() >= dm_ExportParam.getValue("total")){
					exportExcel();
					comLib.hideLoadMask();
					exportCardLogList.clear();
				} else {
					var offset = dm_ExportParam.getValue("offset")
					offset += SSHCM_pageRowPerExport;
					dm_ExportParam.setValue("offset",offset)
					comLib.updateLoadMask(offset);
					sendGetCardLogList();
				}
			}
		}
	} else {
		dialogAlert(app, "Waning", "잔액 조회"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getCardLogListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getCardLogListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onSSHCM_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var sSHCM_btnSearch = e.control;
	var pageIndex = app.lookup("cardLogListPageIndexer");	
	pageIndex.currentPageIndex = 1;
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "list");
	sendGetCardLogList();
}


/*
 * "내보내기" 버튼(SSHCM_btnExport)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onSSHCM_btnExportClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var sSHCM_btnExport = e.control;
	var totalLabel = app.lookup("SSHCM_opbTotal");
	var dmTotal = app.lookup("Total");
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "export");
	dm_ExportParam.setValue("total", dmTotal.getValue("Count"));	
	dm_ExportParam.setValue("offset", 0);
	comLib.showLoadMask("pro","카드이력 내보내기","",parseInt(totalLabel.value)/1000);
	
	sendGetCardLogList();
}

function exportExcel(){
	
	dataManager = getDataManager();
	var dsExportList = app.lookup("ExportCardLogList");
	var total = dsExportList.getRowCount()
	for( var i = 0; i < total ; i++){
		var cardLogList = dsExportList.getRow(i);
		
		var pmode = cardLogList.getValue("Status");		
		if (pmode == 1) {
			cardLogList.setValue("Status", "발급");	
		} else {
			cardLogList.setValue("Status", "삭제");
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