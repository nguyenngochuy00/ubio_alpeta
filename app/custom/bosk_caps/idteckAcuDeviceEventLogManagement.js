/************************************************
 * idteckAcuDeviceEventLogManagement.js
 * Created at 2024. 9. 19. ���� 5:40:49.
 *
 * @author kth
 ************************************************/
var comLib;
var pageRowCount = 50;
var dateLib = cpr.core.Module.require("lib/DateLib");
var dataManager = cpr.core.Module.require("lib/DataManager");


function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("eventLogListPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}
function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("eventLogListPageIndexer");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var today = dateLib.getToday('-');
	
	var dtStart = app.lookup("IADELM_dtStart");
	var dtEnd = app.lookup("IADELM_dtEnd");
	dtStart.value = today;
	dtEnd.value = today;
			
	var searchInput = app.lookup("IADELM_edtKeyword");  
	searchInput.visible = false;
	initGrdInfo();
	setPageIndexer(0,1,pageRowCount, 10);
	//sendEventLogListRequest();
}

function initGrdInfo() {
	var cmbCategory = app.lookup("IADELM_cmbCategory");
	cmbCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_All"),"all"));
	cmbCategory.addItem(new cpr.controls.Item("board id","board_id"));
	cmbCategory.selectItemByValue("all");
	////////////////////////////////////////////////////////////////////////////////////
	var cmbEventContent = app.lookup("IADELM_cmbContent");//검색 조건
	// search content - Content
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Disconnected"), 0));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Connected"), 1));
	cmbEventContent.addItem(new cpr.controls.Item("device regist", 2));
	cmbEventContent.addItem(new cpr.controls.Item("device update", 3));
	cmbEventContent.addItem(new cpr.controls.Item("device delete", 4));
	cmbEventContent.addItem(new cpr.controls.Item("low device regist", 5));
	cmbEventContent.addItem(new cpr.controls.Item("low device update", 6));
	cmbEventContent.addItem(new cpr.controls.Item("low device delete", 7));
	cmbEventContent.addItem(new cpr.controls.Item("device reset", 8));
	cmbEventContent.addItem(new cpr.controls.Item("device system init", 9));
	cmbEventContent.addItem(new cpr.controls.Item("device time sync", 10));
	//--------------------------------------------------------------------------
	cmbEventContent.addItem(new cpr.controls.Item("open door alarm", 15));
	cmbEventContent.addItem(new cpr.controls.Item("forced open", 16));
	cmbEventContent.addItem(new cpr.controls.Item("door open", 225));
	cmbEventContent.addItem(new cpr.controls.Item("device open enable", 226));
	cmbEventContent.addItem(new cpr.controls.Item("odoor close", 228));
	cmbEventContent.addItem(new cpr.controls.Item("device open disable", 229));	
	cmbEventContent.selectItemByValue("all");
	//category
	//
	var grd_cmb_category = app.lookup("IADELM_grd_cmb_category");
	grd_cmb_category.addItem(new cpr.controls.Item("all", "all"));
	grd_cmb_category.addItem(new cpr.controls.Item("board management", 0));
	grd_cmb_category.addItem(new cpr.controls.Item("board status", 1));
	grd_cmb_category.addItem(new cpr.controls.Item("low device management", 2));
	grd_cmb_category.addItem(new cpr.controls.Item("low device event", 3));
	
	// category - Terminal
	var grd_cmd_content = app.lookup("IADELM_grd_cmd_content");
	grd_cmd_content.addItem(new cpr.controls.Item(dataManager.getString("Str_Disconnected"), 0));
	grd_cmd_content.addItem(new cpr.controls.Item(dataManager.getString("Str_Connected"), 1));
	grd_cmd_content.addItem(new cpr.controls.Item("device regist", 2));
	grd_cmd_content.addItem(new cpr.controls.Item("device update", 3));
	grd_cmd_content.addItem(new cpr.controls.Item("device delete", 4));
	grd_cmd_content.addItem(new cpr.controls.Item("low device regist", 5));
	grd_cmd_content.addItem(new cpr.controls.Item("low device update", 6));
	grd_cmd_content.addItem(new cpr.controls.Item("low device delete", 7));
	grd_cmd_content.addItem(new cpr.controls.Item("device reset", 8));
	grd_cmd_content.addItem(new cpr.controls.Item("device system init", 9));
	grd_cmd_content.addItem(new cpr.controls.Item("device time sync", 10));
	//--------------------------------------------------------------------------
	grd_cmd_content.addItem(new cpr.controls.Item("open door alarm", 15));
	grd_cmd_content.addItem(new cpr.controls.Item("forced open", 16));
	grd_cmd_content.addItem(new cpr.controls.Item("door open", 225));
	grd_cmd_content.addItem(new cpr.controls.Item("device open enable", 226));
	grd_cmd_content.addItem(new cpr.controls.Item("odoor close", 228));
	grd_cmd_content.addItem(new cpr.controls.Item("device open disable", 229));	
	app.lookup("IADELM_grd_eventLogList").redraw();
}


function sendAcuEventLogListRequest() {
	var dtStart = app.lookup("IADELM_dtStart");
	var dtEnd = app.lookup("IADELM_dtEnd");
	var dsEventLogList = app.lookup("AcuDeviceEventLogList");
	
	if(dateLib.minusDates(dtStart.value.replace(/-/gi,""),dtEnd.value.replace(/-/gi,"")) >= 31){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ThirtyDayOverError"));
		return;
	}
	dsEventLogList.clear();
	//offset 기능 
	var curPageIndex = app.lookup("eventLogListPageIndexer").currentPageIndex; 
	var offset = (curPageIndex - 1) * pageRowCount;
	
	var sms_getAcuEventLogList = app.lookup("sms_getAcuDeviceEventLogList");
	
	var cmbCategory = app.lookup("IADELM_cmbCategory");
	var edtKeyword = app.lookup("IADELM_edtKeyword");
	var cmbContent = app.lookup("IADELM_cmbContent");
	
	sms_getAcuEventLogList.setParameters("startTime", dtStart.value + " 00:00:00");
	sms_getAcuEventLogList.setParameters("endTime", dtEnd.value + " 23:59:59");
	sms_getAcuEventLogList.setParameters("offset", offset);
	sms_getAcuEventLogList.setParameters("limit", pageRowCount);
	
	if (cmbCategory.value != null && cmbCategory.value != "all" ){
		if (edtKeyword.value == null || edtKeyword.value.length == 0) {
			cmbCategory.selectItemByValue("all");
		}
	}
	
	if (cmbCategory.value != null && cmbCategory.value.length > 0) {
		sms_getAcuEventLogList.setParameters("searchCategory", cmbCategory.value);
	}
	if (edtKeyword.value != null && edtKeyword.value.length > 0) {
		sms_getAcuEventLogList.setParameters("searchKeyword", edtKeyword.value);
	}
	if (cmbContent.value != null) {// 선택된 경우만
		sms_getAcuEventLogList.setParameters("searchContent", cmbContent.value);
	} else {
		sms_getAcuEventLogList.setParameters("searchContent", "all");
	}
	sms_getAcuEventLogList.send();
	comLib.showLoadMask("", dataManager.getString("Str_TaskStateRunning"), "");
}


/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onIADELM_btn_searchClick(/* cpr.events.CMouseEvent */ e){
	//pageIndex 초기 화
	var pageIndex = app.lookup("eventLogListPageIndexer");	
	pageIndex.currentPageIndex = 1;
	sendAcuEventLogListRequest();
}

function onSms_getSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getAcuDeviceEventLogListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		var totalCount = app.lookup("Total").getValue("Count");
		var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
		app.lookup("IADELM_opbTotal").value = totalCount;
		selectPaging(totalCount, viewPageCount);
	} else {		
		dialogAlert(app, "Waning", dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
	app.lookup("IADELM_grd_eventLogList").redraw();
}


/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onEventLogListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	sendAcuEventLogListRequest()
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onIADELM_cmbCategorySelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var iADELM_cmbCategory = e.control;
	var input = app.lookup("IADELM_edtKeyword");
	if (iADELM_cmbCategory.value == "all"){
		input.value = "";
		input.visible = false;
	} else {
		input.visible = true;
		input.focus();
	}
}
