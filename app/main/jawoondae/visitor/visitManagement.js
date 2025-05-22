/************************************************
 * visitManagement.js
 * Created at 2019. 9. 18. 오전 9:29:53.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var JWDVM_pageRowCount = 50;

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
	pageIndex.pageRowCount = JWDVM_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}
// Body에서 load 이벤트 발생 시 호출. 
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	//---------------------------------------------------------//출입 부대
	var groupList = dataManager.getGroup();	
	var cmbGroup = app.lookup("JWDVM_cmbTargetGroup");	 
		cmbGroup.setItemSet(groupList, {
			label: "Name",
			value: "GroupID",
	});
	//---------------------------------------------------------//계급
	var positionList = dataManager.getPositionList();
	var cmbPosition = app.lookup("cmb3");	
		cmbPosition.setItemSet(positionList, {
			label: "Name",
			value: "PositionID",
	});	

	//---------------------------------------------------------
	var dtStart = app.lookup("JWDVM_dtiStart");
	var dtEnd = app.lookup("JWDVM_dtiEnd");
		
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	dtEnd.value = now.format('YYYY-MM-DD');
	dtStart.value = now.format('YYYY-MM-DD');
	
	setPageIndexer(0,1,JWDVM_pageRowCount, 10);
	app.lookup("JWDVM_cmbCategory").value = "name";
	sendGetVisitRequestList();
}

exports.onRefresh = function() {
	sendGetVisitRequestList();
}
//----------------------------------------------------------------------------------------------------------------------------
function sendGetVisitRequestList(){
	app.lookup("VisitRequestInfo").clear();
	
	comLib.showLoadMask("",dataManager.getString("Str_VisitorManagement"),"",0);
	var curPageIndex = app.lookup("visitorListPageIndexer").currentPageIndex; 
	var offset = (curPageIndex - 1) * JWDVM_pageRowCount;
	var smsgetVisitRequestList = app.lookup("sms_getVisitRequestList");
	
	var category = app.lookup("JWDVM_cmbCategory").value;
	var keyword = app.lookup("JWDVM_ipbKeyword").value;
	var visitorType = app.lookup("JWDVM_cmbVisitType").value; 
	var visitorStatus = app.lookup("JWDVM_cmbVisitStatus").value; 
	// 발급 상태
	
	var startAt = app.lookup("JWDVM_dtiStart").value;
	startAt = dateLib.makeDateFormat(startAt, "-") + " 00:00:00";
	var endAt = app.lookup("JWDVM_dtiEnd").value;
	endAt = dateLib.makeDateFormat(endAt, "-") + " 23:59:59";
	smsgetVisitRequestList.setParameters("startTime", startAt);
	smsgetVisitRequestList.setParameters("endTime", endAt);
	smsgetVisitRequestList.setParameters("searchCategory", category);
	smsgetVisitRequestList.setParameters("searchKeyword", keyword);
	if (keyword == null || keyword.length == 0) {
		smsgetVisitRequestList.setParameters("searchCategory", "");
	}
	smsgetVisitRequestList.setParameters("offset", offset);
	smsgetVisitRequestList.setParameters("limit", JWDVM_pageRowCount);
	smsgetVisitRequestList.setParameters("visitType", visitorType);
	smsgetVisitRequestList.setParameters("visitorStatus", visitorStatus);
	
	smsgetVisitRequestList.send();
}

function onSms_getVisitRequestListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		var totalCount = app.lookup("Total").getValue("Count");
		var viewPageCount = totalCount / JWDVM_pageRowCount + (totalCount % JWDVM_pageRowCount > 0);
		app.lookup("JWDVM_opbTotal").value = totalCount;
		//console.log(app.lookup("VisitRequestInfo").getRowDataRanged());
		selectPaging(totalCount, viewPageCount);
	} else {
		//dialogAlert(app, "Waning", dataManager.getString("Str_VisitorManagement")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlert(app, "Waning", dataManager.getString("Str_VisitorManagement")+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
	app.lookup("JWDVM_grdVisitRegist").redraw();
}

function onSms_getVisitRequestListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getVisitRequestListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
//--------------------------------------------------------------------------------------------------------------------------------
function onJWDVM_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	//pageIndex 초기 화
	var pageIndex = app.lookup("visitorListPageIndexer");	
	pageIndex.currentPageIndex = 1;
	sendGetVisitRequestList();
	
}
	
function onVisitorListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var visitorListPageIndexer = e.control;
	sendGetVisitRequestList();
}


/*
 * 그리드에서 row-dblclick 이벤트 발생 시 호출.
 * detail이 row를 더블클릭 한 경우 발생하는 이벤트.
 */
function onJWDVM_grdVisitRegistRowDblclick(/* cpr.events.CGridEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var jWDVM_grdVisitRegist = e.control;
	var dsVisitReqList = app.lookup("VisitRequestInfo").getRowData(e.rowIndex);
	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target":DLG_VISIT_REQUEST_INFO,
			"InitVal": {
				"Index": dsVisitReqList["IndexKey"]
			}
		}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
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


/*
 * Body에서 keydown 이벤트 발생 시 호출.
 * 사용자가 키를 누를 때 발생하는 이벤트.
 */
function onBodyKeydown(/* cpr.events.CKeyboardEvent */ e){
	if(dataManager.getOemVersion() == OEM_JAWOONDAE){
		if (e.code == 'Enter') {
			var pageIndex = app.lookup("visitorListPageIndexer");	
			pageIndex.currentPageIndex = 1;
			sendGetVisitRequestList();
		}
	}
}
