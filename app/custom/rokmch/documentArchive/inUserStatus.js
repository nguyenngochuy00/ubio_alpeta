/************************************************
 * inUserStatus.js
 * Created at 2021. 2. 24. 오전 11:26:51.
 *
 * @author fois
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;

var viewPageCount = 10;
var pageRowCount = 30;

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	setPageIndexer(0, 1, pageRowCount, 10);
	
	var today = dateLib.getToday("-");
	app.lookup("DAIUS_dtiStart").value = today;
	app.lookup("DAIUS_dtiEnd").value = today;
	
}

function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("DAIUS_listPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}

function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("DAIUS_listPageIndexer");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}

function sendSmsGetAccessorAccessStatusInfos(){
	app.lookup("AccessorAccessStatusInfos").clear();
	var curPageIndex = app.lookup("DAIUS_listPageIndexer").currentPageIndex;
	var offset = (curPageIndex-1) * pageRowCount;
	var submision;

	submision = app.lookup("sms_getAccesorAccessStatusInfos");
	submision.setParameters("offset", offset);	
	submision.setParameters("limit", pageRowCount);
	
	var start = app.lookup("DAIUS_dtiStart").value;
	var end = app.lookup("DAIUS_dtiEnd").value;
	if (start.substr(0, 7) != end.substr(0, 7)) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "검색 조건이 잘못되었습니다. \n동일한 달의 조회만 가능합니다.");
		return;
	}

	submision.setParameters("startTime", start);
	submision.setParameters("endTime", end);
	submision.setParameters("searchKeyword", app.lookup("DAIUS_ipbKeyword").value);
	
	var category = app.lookup("DAIUS_cmbSearchCategory").value
	switch (Number(category)) {
	case 0:
		submision.setParameters("searchCategory", "all");
		break;
	case 1:
		submision.setParameters("searchCategory", "name");
		break;
	}
	submision.send();
}

function onSubmitError( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

function onSms_getAccesorAccessStatusInfosSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){		
		var totalCount = app.lookup("Total").getValue("Count");
		selectPaging(totalCount, viewPageCount);
		
		app.lookup("DAIUS_opbTotal").value = totalCount;
		app.lookup("DAIUS_grdInUserStatus").redraw();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}

function onGroupClick(/* cpr.events.CMouseEvent */ e){
	var pageIndex = app.lookup("DAIUS_listPageIndexer");	
	pageIndex.currentPageIndex = 1;
	sendSmsGetAccessorAccessStatusInfos();	
}
