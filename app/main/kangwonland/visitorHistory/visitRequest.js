/************************************************
 * visitRequest.js
 * Created at 2020. 12. 11. 오후 4:09:18.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var KWLVR_pageRowCount = 50;
var KWLVR_pageRowPerExport = 1000;
var KWLVR_version;

function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("visitorListPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}
function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("visitorListPageIndexer");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = KWLVR_pageRowCount;//한 페이지에 보여 줄 행의 수
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
	KWLVR_version = dataManager.getSystemVersion();
	var dtStart = app.lookup("KWLVR_dtiStart");
	var dtEnd = app.lookup("KWLVR_dtiEnd");
	
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	dtEnd.value = now.format('YYYY-MM-DD');
	dtStart.value = now.format('YYYY-MM-DD');
		
	setPageIndexer(0,1,KWLVR_pageRowCount,10);
	app.lookup("KWLVR_cmbCategory").value = "name";
	
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "list");
	sendGetVisitRequestList();
}

function sendGetVisitRequestList(){
	app.lookup("VisitRequestList").clear();
	
	
	var smsgetVisitRequestList = app.lookup("sms_getVisitRequestList");
	
	var category = app.lookup("KWLVR_cmbCategory").value;
	var keyword = app.lookup("KWLVR_ipbKeyword").value;
	var startAt = app.lookup("KWLVR_dtiStart").value;
	startAt = dateLib.makeDateFormat(startAt, "-") + " 00:00:00";
	var endAt = app.lookup("KWLVR_dtiEnd").value
	endAt = dateLib.makeDateFormat(endAt, "-") + " 23:59:59"
	smsgetVisitRequestList.setParameters("startTime", startAt);
	smsgetVisitRequestList.setParameters("endTime", endAt);
	smsgetVisitRequestList.setParameters("searchCategory", category);
	smsgetVisitRequestList.setParameters("searchKeyword", keyword);
	if (keyword == null || keyword.length == 0) {
		smsgetVisitRequestList.setParameters("searchCategory", "");
	}
	var dm_ExportParam = app.lookup("dm_ExportParam");	
	if( dm_ExportParam.getValue("mode")=="list"){
		var curPageIndex = app.lookup("visitorListPageIndexer").currentPageIndex; 
		var offset = (curPageIndex - 1) * KWLVR_pageRowCount;
		smsgetVisitRequestList.setParameters("offset", offset);
		smsgetVisitRequestList.setParameters("limit", KWLVR_pageRowCount);
	} else {
		smsgetVisitRequestList.setParameters("offset", dm_ExportParam.getValue("offset"));
		smsgetVisitRequestList.setParameters("limit", KWLVR_pageRowPerExport);
	}
	
	
	smsgetVisitRequestList.send();
	if( dm_ExportParam.getValue("mode")=="list"){
		comLib.showLoadMask("",dataManager.getString("Str_VisitorManagement"),"",0);
	}
	
}
/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onVisitorListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var visitorListPageIndexer = e.control;
	sendGetVisitRequestList();
}

function onKWLVR_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	//pageIndex 초기 화
	var pageIndex = app.lookup("visitorListPageIndexer");	
	pageIndex.currentPageIndex = 1;
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "list");
	sendGetVisitRequestList();
}

function onSms_getVisitRequestListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	
	if (resultCode == COMERROR_NONE) {
		var dsVisitRequestList = app.lookup("VisitRequestList");
		var count = dsVisitRequestList.getRowCount();
		
		var totalCount = app.lookup("Total").getValue("Count");
		app.lookup("KWLVR_opbTotal").value = totalCount;
		
		var dm_ExportParam = app.lookup("dm_ExportParam");
		if( dm_ExportParam.getValue("mode")=="list"){
			var viewPageCount = totalCount / KWLVR_pageRowCount + (totalCount % KWLVR_pageRowCount > 0);
			if (viewPageCount > 10) {
				viewPageCount = 10;
			}
			
			selectPaging(totalCount, viewPageCount);
			comLib.hideLoadMask();
		} else {
			var exportVisitRequestList = app.lookup("ExportVisitRequestList");
			
			if(dsVisitRequestList.getRowCount() == 0 ){
				comLib.hideLoadMask();
				if( exportVisitRequestList.getRowCount() >0 ){
					exportExcel();					
					exportVisitRequestList.clear();
				} else {
					dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
				}
			} else {
				for(var i = 0; i < dsVisitRequestList.getRowCount(); i++){
					exportVisitRequestList.pushRowData(dsVisitRequestList.getRowData(i));
				}
					
				if( exportVisitRequestList.getRowCount() >= dm_ExportParam.getValue("total")){
					exportExcel();
					comLib.hideLoadMask();
					exportVisitRequestList.clear();
				} else {
					var offset = dm_ExportParam.getValue("offset");
					offset += KWLVR_pageRowPerExport;
					dm_ExportParam.setValue("offset",offset);
					comLib.updateLoadMask(offset);
					sendGetVisitRequestList();
				}
			}
		}
		
	} else {
		comLib.hideLoadMask();
		//dialogAlert(app, "Waning", dataManager.getString("Str_VisitorManagement")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlert(app, "Waning", dataManager.getString("Str_VisitorManagement")+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
	app.lookup("KWLVR_grdVisitRegist").redraw();
}

function onSms_getVisitRequestListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getVisitRequestListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * "입장관리" 버튼(KWLVR_btnIn)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onKWLVR_btnInClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var kWLVR_btnIn = e.control;
	//입장 팝업
	
	var appld = "app/main/kangwonland/visitorHistory/visitorInManagement" + "?" + KWLVR_version;
	app.getRootAppInstance().openDialog(appld, {width : 700, height : 350}, function(dialog){
		dialog.ready(function(dialogApp){
			//dialog.bind("headerTitle").toLanguage("Str_PassList");
			dialog.headerTitle ="입장관리";
			dialog.modal = true;
		});
	}).then(function(returnValue){
		sendGetVisitRequestList(); // 갱신
	});	
}


/*
 * "퇴장관리" 버튼(KWLVR_btnOut)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onKWLVR_btnOutClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var kWLVR_btnOut = e.control;
	//퇴장팝업
	var grdVisitRegist =app.lookup("KWLVR_grdVisitRegist");
	var checkedRowIndices = grdVisitRegist.getCheckRowIndices();
	if (checkedRowIndices.length == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), "체크된 입장 사용자가 없습니다.","");
		return;
	} else if (checkedRowIndices.length > 1) {
		dialogAlert(app, dataManager.getString("Str_Warning"), "복수 항목이 체크 되었습니다.","");
		return;
	}
	var dataRow;
	checkedRowIndices.forEach(function( index ){
		dataRow = grdVisitRegist.getRow(index);	
	});
	if (dataRow.getValue("VStatus") != 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), "이미 퇴장 처리된 방문객 입니다.","");
		return;
	}
	var appld = "app/main/kangwonland/visitorHistory/visitorOutManagement" + "?" + KWLVR_version;
	app.getRootAppInstance().openDialog(appld, {width : 700, height : 350}, function(dialog){
		dialog.ready(function(dialogApp){
			//dialog.bind("headerTitle").toLanguage("Str_PassList");
			dialog.initValue = {"visitRequestInfo": dataRow.getRowData()};	
			dialog.headerTitle ="퇴장관리";
			dialog.modal = true;
		});
	}).then(function(returnValue){
		if (returnValue != undefined) {
			//처리결과 반영 check
		}
	});	
}


/*
 * "내보내기" 버튼(KWLVR_btnExcel)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onKWLVR_btnExcelClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var kWLVR_btnExcel = e.control;
	var totalLabel = app.lookup("KWLVR_opbTotal");
	var dmTotal = app.lookup("Total");
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "export");
	dm_ExportParam.setValue("total", dmTotal.getValue("Count"));	
	dm_ExportParam.setValue("offset", 0);
	comLib.showLoadMask("pro","방문 이력 내보내기","", parseInt(totalLabel.value)/50);
	
	sendGetVisitRequestList();
}

function exportExcel(){
	
	dataManager = getDataManager();
	var dsExportList = app.lookup("ExportVisitRequestList");
	var total = dsExportList.getRowCount()
	for( var i = 0; i < total ; i++){
		var VisitRequestList = dsExportList.getRow(i);
		
		var vStatus = VisitRequestList.getValue("VStatus");		
		if (vStatus == 0) {
			VisitRequestList.setValue("VStatus", "입장");	
		} else {
			VisitRequestList.setValue("VStatus", "퇴장");	
		}
	}
			
	/* original data */
	var today = dateLib.getToday();
	var filename = "방문이력_"+today+".xlsx";	
	var ws_name = "방문이력_";
		
	var wb = XLSX.utils.book_new(), ws = XLSX.utils.json_to_sheet(dsExportList.getRowDataRanged());
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);

	XLSX.writeFile(wb, filename);	
}