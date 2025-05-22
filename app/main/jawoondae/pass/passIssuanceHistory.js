/************************************************
 * CardIssuanceHistory.js
 * Created at 2019. 9. 9. 오전 11:14:14.
 *
 * @author jrh
 ************************************************/
var comLib;
var pageRowCount = 10;
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var usint_version;
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	var usint_version;
	var dtStart = app.lookup("ELMGR_dtStart");
	var dtEnd = app.lookup("ELMGR_dtEnd");
	dtStart.value = dateLib.makeDateFormat(dateLib.getToday(),"-");
	dtEnd.value = dateLib.makeDateFormat(dateLib.getToday(),"-");
	app.lookup("rdb_etc").addItem(new cpr.controls.Item(dataManager.getString("Str_All"), 0));
	//app.lookup("rdb_etc").addItem(new cpr.controls.Item(dataManager.getString("Str_UnIssued"), 1));
	app.lookup("rdb_etc").addItem(new cpr.controls.Item(dataManager.getString("Str_Issued"), 2));
	app.lookup("rdb_etc").addItem(new cpr.controls.Item(dataManager.getString("Str_TakeBack"), 3));
	app.lookup("ELMGR_cmbCategory").value = "all";
	PassIssuanceHistoryLogList();
}


function PassIssuanceHistoryLogList(){
	app.lookup("CardIssuelogList").clear();
	//app.lookup("CardInfo").clear();
	
	var dtStart = app.lookup("ELMGR_dtStart");
	var dtEnd = app.lookup("ELMGR_dtEnd");
	var cmbCategory = app.lookup("ELMGR_cmbCategory");
	var edtKeyword = app.lookup("ELMGR_edtKeyword");
	var cmbPassType = app.lookup("cmbPassType");
	var rdb_etc = app.lookup("rdb_etc");
	
	console.log("IssuanceHistoryLog :" + "dtStart : "+ dtStart.value + ", dtEnd :" +dtEnd.value);
	console.log("IssuanceHistoryLog :" + "cmbCategory : "+ cmbCategory.value + ", Keyword :" + edtKeyword.value);
		 	
	var udcPassIssuanceHistoryGrid = app.lookup("udcPassIssuanceHistoryGrid");
	  
	var curIndex = udcPassIssuanceHistoryGrid.getCurrentPageIndex();
	var offset = (curIndex - 1) * pageRowCount;
	var sms_getPassIssuedLogList = app.lookup("sms_getPassIssuedLogList");
	
	if (cmbCategory.value != null && cmbCategory.value.length > 0) {
		sms_getPassIssuedLogList.setParameters("searchCategory", cmbCategory.value);
	}
	if (edtKeyword.value != null && edtKeyword.value.length > 0) {
		sms_getPassIssuedLogList.setParameters("searchKeyword", edtKeyword.value);
	}
	
	sms_getPassIssuedLogList.setParameters("offset", offset);
	sms_getPassIssuedLogList.setParameters("limit", pageRowCount);
	
	sms_getPassIssuedLogList.setParameters("startTime", dtStart.value + " 00:00:00");
	sms_getPassIssuedLogList.setParameters("endTime", dtEnd.value + " 23:59:59");
	
	sms_getPassIssuedLogList.setParameters("cardType", cmbPassType.value);
	sms_getPassIssuedLogList.setParameters("issueType", rdb_etc.value);
	sms_getPassIssuedLogList.send();
	comLib.showLoadMask("", "작업 진행 중", "");
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getPassIssuedLogListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var dmTotal = app.lookup("Total");
	var totalCount = parseInt(dmTotal.getValue("Count"));
	
	//var totalLabel = app.lookup("opt_tot");
	//totalLabel.value = totalCount;
	
	var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
	
	if (viewPageCount > 10) {
		viewPageCount = 10;
	}

	var dsCardIssuelogList = app.lookup("CardIssuelogList");
	var udcPassIssuanceHistoryGrid = app.lookup("udcPassIssuanceHistoryGrid");
	udcPassIssuanceHistoryGrid.setPassLogList(dsCardIssuelogList);
	udcPassIssuanceHistoryGrid.setPaging(totalCount, pageRowCount, viewPageCount);
	udcPassIssuanceHistoryGrid.redraw();
}


/*
 * 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
 */
function onUdcPassIssuanceHistoryGridPagechange(/* cpr.events.CSelectionEvent */ e){
	PassIssuanceHistoryLogList();
}


/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGroupClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var group = e.control;
		var udcPassIssuanceList = app.lookup("udcPassIssuanceHistoryGrid");
	udcPassIssuanceList.setCurrentPageIndex(1);
	PassIssuanceHistoryLogList();
}


/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSMAG_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}
