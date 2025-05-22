/************************************************
 * AcuEventLogManagement.js
 * Created at 2023. 11. 20. 오후 7:18:02.
 *
 * @author bij
 ************************************************/

var comLib;
var pageRowCount = 20;
var dateLib = cpr.core.Module.require("lib/DateLib");
var dataManager = cpr.core.Module.require("lib/DataManager");

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad( /* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	// 초기 데이터 설정
	initcmbContents();
	
	// 현재 날짜 설정
	var today = dateLib.getToday('-');
	var dtStart = app.lookup("ELMGR_dtStart");
	var dtEnd = app.lookup("ELMGR_dtEnd");
	dtStart.value = today;
	dtEnd.value = today;
	
	// 카테고리 설정
	var cmbCategory = app.lookup('AELMGR_cmbCategory');
	cmbCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_All"), "all"));
	cmbCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_TerminalID"), "terminal_id"));
	cmbCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_Zone"), "target"));
	cmbCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_Partition"), "partition"));
	cmbCategory.selectItemByValue("all");
	
	var sms_getAcuEventLogList = app.lookup('sms_getAcuEventLogList');
	sms_getAcuEventLogList.setParameters("startTime", dtStart.value + " 00:00:00");
	sms_getAcuEventLogList.setParameters("endTime", dtEnd.value + " 23:59:59");
	sms_getAcuEventLogList.setParameters("searchCategory", "");
	sms_getAcuEventLogList.setParameters("searchKeyword", "");
	sms_getAcuEventLogList.setParameters("offset", 0);
	sms_getAcuEventLogList.setParameters("limit", pageRowCount);
	
	sms_getAcuEventLogList.send();
}

// 초기 데이터 세팅 
function initcmbContents() {
	
	// 그리드 content 콤보
	var grdcmbEventContent = app.lookup("AELMGR_grdcmbContent");
	grdcmbEventContent.addItem(new cpr.controls.Item("Medical Alarm", 100));
	grdcmbEventContent.addItem(new cpr.controls.Item("Fire Alarm", 110));
	grdcmbEventContent.addItem(new cpr.controls.Item("Panic Alarm", 120));
	grdcmbEventContent.addItem(new cpr.controls.Item("Burglar Alarm", 130));
	grdcmbEventContent.addItem(new cpr.controls.Item("General Alarm", 140));
	grdcmbEventContent.addItem(new cpr.controls.Item("24H Non-Burglary", 150));
	grdcmbEventContent.addItem(new cpr.controls.Item("Fire Supervisory", 200));
	grdcmbEventContent.addItem(new cpr.controls.Item("System Trouble", 300));
	grdcmbEventContent.addItem(new cpr.controls.Item("Sounder/Relay Troubles", 320));
	grdcmbEventContent.addItem(new cpr.controls.Item("System Peripheral Trouble", 330));
	grdcmbEventContent.addItem(new cpr.controls.Item("Communication Troubles", 350));
	grdcmbEventContent.addItem(new cpr.controls.Item("Protection Loop Trouble", 370));
	grdcmbEventContent.addItem(new cpr.controls.Item("Sensor Trouble", 380));
	grdcmbEventContent.addItem(new cpr.controls.Item("Open/Close", 400));
	grdcmbEventContent.addItem(new cpr.controls.Item("Remote Access", 411));
	grdcmbEventContent.addItem(new cpr.controls.Item("Access Control", 421));
	grdcmbEventContent.addItem(new cpr.controls.Item("System Disable", 501));
	grdcmbEventContent.addItem(new cpr.controls.Item("Sounder/Relay Disable", 520));
	grdcmbEventContent.addItem(new cpr.controls.Item("System Peripheral Disable", 531));
	grdcmbEventContent.addItem(new cpr.controls.Item("Communication Disable", 551));
	grdcmbEventContent.addItem(new cpr.controls.Item("Bypass", 570));
	grdcmbEventContent.addItem(new cpr.controls.Item("Test/Misc.", 601));
	grdcmbEventContent.addItem(new cpr.controls.Item("Event Log", 621));
	grdcmbEventContent.addItem(new cpr.controls.Item("Scheduling", 630));
	grdcmbEventContent.addItem(new cpr.controls.Item("Personnel Monitoring", 641));
	grdcmbEventContent.addItem(new cpr.controls.Item("Special Codes.", 651));
	grdcmbEventContent.addItem(new cpr.controls.Item("Expand", 700));
	grdcmbEventContent.addItem(new cpr.controls.Item("Miscellaneous", 654));
	grdcmbEventContent.addItem(new cpr.controls.Item("Miscellaneous", 999));
	
	// 그리드 Qualifier 콤보
	var grdcmbQualifier = app.lookup("AELMGR_grdcmbQualifier");
	grdcmbQualifier.addItem(new cpr.controls.Item("Alarm", 1));
	grdcmbQualifier.addItem(new cpr.controls.Item("Restore", 3));
	
	// 조회 조건 콤보
	var cmbContent = app.lookup("AELMGR_cmbContent");
	cmbContent.addItem(new cpr.controls.Item("Medical Alarm", 100));
	cmbContent.addItem(new cpr.controls.Item("Fire Alarm", 110));
	cmbContent.addItem(new cpr.controls.Item("Panic Alarm", 120));
	cmbContent.addItem(new cpr.controls.Item("Burglar Alarm", 130));
	cmbContent.addItem(new cpr.controls.Item("General Alarm", 140));
	cmbContent.addItem(new cpr.controls.Item("24H Non-Burglary", 150));
	cmbContent.addItem(new cpr.controls.Item("Fire Supervisory", 200));
	cmbContent.addItem(new cpr.controls.Item("System Trouble", 300));
	cmbContent.addItem(new cpr.controls.Item("Sounder/Relay Troubles", 320));
	cmbContent.addItem(new cpr.controls.Item("System Peripheral Trouble", 330));
	cmbContent.addItem(new cpr.controls.Item("Communication Troubles", 350));
	cmbContent.addItem(new cpr.controls.Item("Protection Loop Trouble", 370));
	cmbContent.addItem(new cpr.controls.Item("Sensor Trouble", 380));
	cmbContent.addItem(new cpr.controls.Item("Open/Close", 400));
	cmbContent.addItem(new cpr.controls.Item("Remote Access", 411));
	cmbContent.addItem(new cpr.controls.Item("Access Control", 421));
	cmbContent.addItem(new cpr.controls.Item("System Disable", 501));
	cmbContent.addItem(new cpr.controls.Item("Sounder/Relay Disable", 520));
	cmbContent.addItem(new cpr.controls.Item("System Peripheral Disable", 531));
	cmbContent.addItem(new cpr.controls.Item("Communication Disable", 551));
	cmbContent.addItem(new cpr.controls.Item("Bypass", 570));
	cmbContent.addItem(new cpr.controls.Item("Test/Misc.", 601));
	cmbContent.addItem(new cpr.controls.Item("Event Log", 621));
	cmbContent.addItem(new cpr.controls.Item("Scheduling", 630));
	cmbContent.addItem(new cpr.controls.Item("Personnel Monitoring", 641));
	cmbContent.addItem(new cpr.controls.Item("Special Codes.", 651));
	cmbContent.addItem(new cpr.controls.Item("Expand", 700));
	cmbContent.addItem(new cpr.controls.Item("Miscellaneous", 654));
	cmbContent.addItem(new cpr.controls.Item("Miscellaneous", 999));
}

/*
 * "검색" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onELMGR_btnSearchClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var eLMGR_btnSearch = e.control;
	
	// 페이지 인덱서
	var AcuEventLogListPageIndexer = app.lookup("AcuEventLogListPageIndexer");
	AcuEventLogListPageIndexer.currentPageIndex = 1;
	sendAcuEventLogListRequest();
}

/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onImageClick( /* cpr.events.CMouseEvent */ e) {
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target": DLG_HELP,
			"ID": menu_id
		}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onELMGR_cmbCategorySelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var eLMGR_cmbCategory = e.control;
	var input = app.lookup("AELMGR_edtKeyword");
	if (eLMGR_cmbCategory.value == "all") {
		input.value = "";
		input.visible = false;
	} else {
		input.visible = true;
		input.focus();
	}
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getAcuEventLogListSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getAcuEventLogList = e.control;
	comLib.hideLoadMask();
	app.lookup('sms_getAcuEventLogList').removeAllParameters();
	
	// 그리드
	app.lookup('AcuEventLogListGrid').redraw();
	
	var dmTotal = app.lookup("Total");
	var totalCount = parseInt(dmTotal.getValue("Count"));
	
	// 총계
	var opbTotal = app.lookup("AELMGR_opbTotal");
	opbTotal.value = totalCount
	opbTotal.redraw();
	
	var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
	if (viewPageCount > 10) {
		viewPageCount = 10;
	}
	// 페이징
	setPaging(totalCount, app.lookup('AcuEventLogListPageIndexer').currentPageIndex, pageRowCount, viewPageCount);
	
	comLib.hideLoadMask();
}

// 페이징
function setPaging(totalCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("AcuEventLogListPageIndexer");
	
	pageIndex.totalRowCount = totalCount; //전체 데이터 수.
	//pageIndex.currentPageIndex = currentPageIndex;//현재 선택된 페이지의 인덱스
	pageIndex.pageRowCount = pageRowCount; //한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = 5 //viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	
	if (totalCount == 0) {
		pageIndex.visible = false;
	} else {
		pageIndex.visible = true;
	}
	pageIndex.redraw();
	
}

function sendAcuEventLogListRequest() {
	// 1. 조회 한달 체크 
	var dtStart = app.lookup("ELMGR_dtStart");
	var dtEnd = app.lookup("ELMGR_dtEnd");
	var pageIndexer = app.lookup('AcuEventLogListPageIndexer');
	if (dateLib.minusDates(dtStart.value.replace(/-/gi, ""), dtEnd.value.replace(/-/gi, "")) >= 31) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ThirtyDayOverError"));
		return;
	}
	app.lookup("AcuEventList").clear();
	
	// 페이징
	var curIndex = pageIndexer.currentPageIndex;
	var offset = (curIndex - 1) * pageRowCount;
	
	// 시작/종료일
	var startYmd = app.lookup("ELMGR_dtStart").value;
	var endYmd = app.lookup("ELMGR_dtEnd").value;
	var today = dateLib.getToday('-');
	
	if (startYmd.length != 10 || endYmd.length != 10) {
		app.lookup("ELMGR_dtStart").value = today;
		app.lookup("ELMGR_dtEnd").value = today;
		startYmd = today;
		endYmd = today;
	}
	
	var dtStart = startYmd + " 00:00:00";
	var dtEnd = endYmd + " 23:59:59";
	
	// 카테고리 ( user_id , terminal_id )
	var cmbCategory = app.lookup("AELMGR_cmbCategory");
	
	// 카테고리 키워드 (1, 2, 3, , , )
	var edtKeyword = app.lookup("AELMGR_edtKeyword");
	
	// Content( 따로 정의할 정의값 - detail로 할까 생각중 ex Open too lang 등 등 ) 
	var cmbContent = app.lookup("AELMGR_cmbContent");
	
	// send	
	var sms_getAcuEventLogList = app.lookup("sms_getAcuEventLogList");
	
	sms_getAcuEventLogList.setParameters("startTime", dtStart);
	sms_getAcuEventLogList.setParameters("endTime", dtEnd);
	sms_getAcuEventLogList.setParameters("offset", offset);
	sms_getAcuEventLogList.setParameters("limit", pageRowCount);
	
	// 카테고리가 널 아니면
	if (cmbCategory.value != null && cmbCategory.value.length > 0) {
		sms_getAcuEventLogList.setParameters("searchCategory", cmbCategory.value);
	}
	
	// 키워드가 있으면
	if (edtKeyword.value != null && edtKeyword.value.length > 0) {
		sms_getAcuEventLogList.setParameters("searchKeyword", edtKeyword.value);
	}
	
	// 컨텐츠 있으면
	if (cmbContent.value != 0) { // 선택된 경우만
		sms_getAcuEventLogList.setParameters("searchContent", cmbContent.value); // 
	} else {
		sms_getAcuEventLogList.setParameters("searchContent", "");
	}
	
	sms_getAcuEventLogList.send();
	
	comLib.showLoadMask("", dataManager.getString("Str_TaskStateRunning"), "");
}

/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onAcuEventLogListPageIndexerSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var acuEventLogListPageIndexer = e.control;
	sendAcuEventLogListRequest();
}

/*
 * 루트 컨테이너에서 keydown 이벤트 발생 시 호출.
 * 사용자가 키를 누를 때 발생하는 이벤트.
 */
function onBodyKeydown( /* cpr.events.CKeyboardEvent */ e) {
	var cmbCategory = app.lookup('AELMGR_cmbCategory');
	if (e.keyCode == '13' && cmbCategory.value != 'all') {
		app.lookup('AcuEventLogListPageIndexer').currentPageIndex = 1;
		sendAcuEventLogListRequest();
	}
}