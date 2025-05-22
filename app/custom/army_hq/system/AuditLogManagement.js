/************************************************
 * SystemLogManagement.js
 * Created at 2019. 1. 10. 오후 6:07:12.
 *
 * @author wonki
 ************************************************/

var pageRowCount = 50;
var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var dtStart = app.lookup("SLMGR_dtStart");
	var dtEnd = app.lookup("SLMGR_dtEnd");
	
//	dtStart.value = '2018-09-01';
//	dtEnd.value = '2018-10-01';
	
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	dtEnd.value = now.format('YYYY-MM-DD');
	
	var before = now.add(-30, 'days');
	dtStart.value = before.format('YYYY-MM-DD');
	
	var udcAuditLogList = app.lookup("AMHQ_udcAuditLogList");
	udcAuditLogList.setPaging(0, 1, 10, pageRowCount);
	
	var cmbCategory = app.lookup("SLMGR_cmbCategory");	
	cmbCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_All"),"all"));
	cmbCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_UserID"),"user_id"));
		
	cmbCategory.value = "all";
	
	sendAuditLogListRequest();
}

// 검색 버튼 클릭
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	var udcEventLogList = app.lookup("AMHQ_udcAuditLogList");
	udcEventLogList.setCurrentPageIndex(1);
	
	var dsAuditLogList = app.lookup("AuditLogList");
	dsAuditLogList.clear();
	var udcAuditLogList = app.lookup("AMHQ_udcAuditLogList");
	udcAuditLogList.setAuditLogList(dsAuditLogList);
	sendAuditLogListRequest();	
}

function sendAuditLogListRequest() {
	var dtStart = app.lookup("SLMGR_dtStart");
	var dtEnd = app.lookup("SLMGR_dtEnd");
	
	
	if(dateLib.minusDates(dtStart.value.replace(/-/gi,""),dtEnd.value.replace(/-/gi,"")) >= 31){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ThirtyDayOverError"));
		return;
	}
	
	comLib.showLoadMask("",dataManager.getString("Str_Import"),"",0);
	
	var udcAuditLogList = app.lookup("AMHQ_udcAuditLogList");
	var curIndex = udcAuditLogList.getCurrentPageIndex();
	var offset = (curIndex - 1) * pageRowCount;
	
	var smsGetAuditLogList = app.lookup("sms_getAuditLogList");
	
	
	var cmbCategory = app.lookup("SLMGR_cmbCategory");
	var edtKeyword = app.lookup("SLMGR_edtKeyword");

	smsGetAuditLogList.setParameters("startTime", dtStart.value + " 00:00:00");
	smsGetAuditLogList.setParameters("endTime", dtEnd.value + " 23:59:59");
	smsGetAuditLogList.setParameters("offset", offset);
	smsGetAuditLogList.setParameters("limit", pageRowCount);
	smsGetAuditLogList.setParameters("searchContent", "29");	// WebClinet 기록만 조회 (육군본부 메뉴: 접속 이력 조회)

	if (cmbCategory.value != null && cmbCategory.value.length > 0) {
		smsGetAuditLogList.setParameters("searchCategory", cmbCategory.value);
	}
	if (edtKeyword.value != null && edtKeyword.value.length > 0) {
		smsGetAuditLogList.setParameters("searchKeyword", edtKeyword.value);
	}
	
	smsGetAuditLogList.send();
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
		var dmTotal = app.lookup("Total");
		
		var totalCount = parseInt(dmTotal.getValue("Count"));
		var totalLabel = app.lookup("SLMGR_optTotal");
		totalLabel.value = totalCount;
		
		
		var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
		
		if (viewPageCount > 10) {
			viewPageCount = 10;
		}
		var udcAuditLogList = app.lookup("AMHQ_udcAuditLogList");
		udcAuditLogList.setAuditLogList(dsAuditLogList);	
		udcAuditLogList.setPaging(totalCount, pageRowCount, viewPageCount);
		
		app.lookup("SLMGR_grp").redraw();

	} else {
		//dialogAlertAMHQ(app, "Waning", dataManager.getString("Str_UserListGet")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Import")+" "+dataManager.getString("Str_Failed")+"."+dataManager.getString(getErrorString(resultCode)));
	}

}


/*
 * 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
 */
function onSLMGR_udcAuditLogListPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.grid.auditLogList
	 */
	var sLMGR_udcAuditLogList = e.control;
	sendAuditLogListRequest();
}


/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onImageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}
