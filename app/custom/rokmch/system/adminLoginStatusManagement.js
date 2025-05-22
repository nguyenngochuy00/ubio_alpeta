/************************************************
 * adminLoginStatusManagement.js
 * Created at 2021. 5. 20. 오전 11:34:10.
 *
 * @author joymrk
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
//var ALSMAMHQ_pageRowCount = 150;
var ALSMAMHQ_pageRowCount = 50; // 한 페이지당 보이는 행의 수 하향 조정 - sep

function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("userListPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}
function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("userListPageIndexer");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = ALSMAMHQ_pageRowCount;//한 페이지에 보여 줄 행의 수
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
	
	app.lookup("ALSMAMHQ_nbeBeforeDate").value = 90;
	//setPageIndexer(0,1,ALSMAMHQ_pageRowCount, 10);
	app.lookup("ALSMAMHQ_cmbUserCategory").value = "name";
	sendGetUserRequestList(1);
}

// function sendGetUserRequestList() {
function sendGetUserRequestList(curPageIndex) {
	app.lookup("noAccessAdminUserList").clear();
	
	comLib.showLoadMask("","관리자 미접속 로그인 정보 가져오기","",0);
	//var curPageIndex = app.lookup("userListPageIndexer").currentPageIndex; 
	var offset = (curPageIndex - 1) * ALSMAMHQ_pageRowCount;
	var smsGetNoAccessAdminUserList = app.lookup("sms_getNoAccessAdminUserList");
	smsGetNoAccessAdminUserList.action = "/v1/armyhq/users/loginInfo/noaccess"
	var category = app.lookup("ALSMAMHQ_cmbUserCategory").value;
	var keyword = app.lookup("ALSMAMHQ_ipbUserKeyword").value; 
		
	smsGetNoAccessAdminUserList.setParameters("searchCategory", category);
	smsGetNoAccessAdminUserList.setParameters("searchKeyword", keyword);
	if (keyword == null || keyword.length == 0) {
		smsGetNoAccessAdminUserList.setParameters("searchCategory", "");
	}
	
	smsGetNoAccessAdminUserList.setParameters("beforeDate", app.lookup("ALSMAMHQ_nbeBeforeDate").value);
	smsGetNoAccessAdminUserList.setParameters("offset", offset);
	smsGetNoAccessAdminUserList.setParameters("limit", ALSMAMHQ_pageRowCount);
	
	smsGetNoAccessAdminUserList.send();
}

function onSms_getNoAccessAdminUserListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		var totalCount = app.lookup("Total").getValue("Count");
		var viewPageCount = totalCount / ALSMAMHQ_pageRowCount + (totalCount % ALSMAMHQ_pageRowCount > 0);
		if (viewPageCount > 10) {
			viewPageCount = 10;
		}
		app.lookup("ALSMAMHQ_opbTotal").value = totalCount;
		var curPageIndex = app.lookup("userListPageIndexer").currentPageIndex;
		setPageIndexer(totalCount, curPageIndex, ALSMAMHQ_pageRowCount, viewPageCount);
		selectPaging(totalCount, viewPageCount);
	} else {
		dialogAlertAMHQ(app, "Waning", "관리자 미접속 로그인 정보 가져오기"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
	app.lookup("ALSMAMHQ_grdAdminUserList").redraw();
}

function onSms_getSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onUserListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var curPageIndex = app.lookup("userListPageIndexer").currentPageIndex;
	sendGetUserRequestList(curPageIndex);
}

function onALSMAMHQ_btnUserSearchClick(/* cpr.events.CMouseEvent */ e){
	var beforedays = app.lookup("ALSMAMHQ_nbeBeforeDate").value;
	if (beforedays <= 0 ) {
		dialogAlertAMHQ(app, "Waning", "최소 0보다 큰 값으로 입력 해야 합니다.");
		return;
	}
	var pageIndex = app.lookup("userListPageIndexer");
	pageIndex.currentPageIndex = 1;
	
	var curPageIndex = app.lookup("userListPageIndexer").currentPageIndex;
	sendGetUserRequestList(curPageIndex);	
}
	