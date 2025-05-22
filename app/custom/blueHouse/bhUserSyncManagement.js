/************************************************
 * bhUserSyncManagement.js
 * Created at 2021. 4. 30. 오후 4:35:27.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var BHUSM_pageRowCount = 50;

function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("bhUsersPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}
function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("bhUsersPageIndexer");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = BHUSM_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();

	setPageIndexer(0,1,BHUSM_pageRowCount, 10);
	app.lookup("BHUSM_cmbCategory").value = "username";
	sendGetUserList();
}

function sendGetUserList() {
	app.lookup("bhUserInfoList").clear();
	
	comLib.showLoadMask("", "인사정보 사용자 가져오기","",0);
	var curPageIndex = app.lookup("bhUsersPageIndexer").currentPageIndex; 
	var offset = (curPageIndex - 1) * BHUSM_pageRowCount;
	var smsgetBhUserInfoList = app.lookup("sms_getBhUserInfoList");
	
	var category = app.lookup("BHUSM_cmbCategory").value;
	var keyword = app.lookup("BHUSM_ipbKeyword").value;
	smsgetBhUserInfoList.setParameters("searchCategory", category);
	smsgetBhUserInfoList.setParameters("searchKeyword", keyword);
	if (keyword == null || keyword.length == 0) {
		smsgetBhUserInfoList.setParameters("searchCategory", "");
	}
	smsgetBhUserInfoList.setParameters("offset", offset);
	smsgetBhUserInfoList.setParameters("limit", BHUSM_pageRowCount);
	
	smsgetBhUserInfoList.send();
}

function onSms_getBhUserInfoListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		var totalCount = app.lookup("Total").getValue("Count");
		var viewPageCount = totalCount / BHUSM_pageRowCount + (totalCount % BHUSM_pageRowCount > 0);
		app.lookup("BHUSM_opbTotal").value = totalCount;
		selectPaging(totalCount, viewPageCount);
	} else {		
		dialogAlert(app, "Waning", dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
	app.lookup("BHUSM_grdBhUserList").redraw();
}

function onSms_getBhSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getBhSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onBHUSM_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	//pageIndex 초기 화
	var pageIndex = app.lookup("bhUsersPageIndexer");	
	pageIndex.currentPageIndex = 1;
	sendGetUserList();
}


/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onBhUsersPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var bhUsersPageIndexer = e.control;
	sendGetUserList();
}


/*
 * "동기화" 버튼(BHUSM_btnModify)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBHUSM_btnModifyClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var bHUSM_btnModify = e.control;
	//한건씩 요청 해야한다. 등록 요청하고 바로 리턴처리 (10 밀리세컨드 요청)
	var grdBhUserList = app.lookup("BHUSM_grdBhUserList");
	var checkedRowIndices = grdBhUserList.getCheckRowIndices();
	var checkCnt = checkedRowIndices.length;
	if (checkCnt == 0) {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_UserNotSelected"));
		return
	}	
	
	
	comLib.showLoadMask("pro", "인사정보 동기화","",checkedRowIndices.length);
	var dsSyncInfoList = app.lookup("SyncInfoList");
	dsSyncInfoList.clear();
	for( var i = 0; i < checkCnt; i++){
		var syncIndex = checkedRowIndices[i];
		var syncUser = {"PriNo":grdBhUserList.getRow(syncIndex).getValue("PriNo"),"rowIndex":syncIndex};
		dsSyncInfoList.addRowData(syncUser);
	}
	sendUserSyncReq();
}

			
// 사용자 삭제 요청 전송
function sendUserSyncReq(){
	var dsSyncInfoList = app.lookup("SyncInfoList");
	if( dsSyncInfoList.getRowCount() == 0 ){
		comLib.hideLoadMask();
		dataManager = getDataManager();
		//dialogAlert(app, "Waning", dataManager.getString("Str_UserNotSelected"));
		return;
	}
	var dsPriNo = dsSyncInfoList.getRow(0);
	var priNo = dsPriNo.getValue("PriNo");

	var msg = "priNo : "+priNo;
	comLib.updateLoadMask(msg);
	
	var smsPutBhUserInfo = new cpr.protocols.Submission("sms_putBhUserInfo");
	smsPutBhUserInfo.action = "/v1/bluehouse/users/"+priNo;
	smsPutBhUserInfo.method = "put";
	smsPutBhUserInfo.mediaType = "application/x-www-form-urlencoded";
	smsPutBhUserInfo.userAttr("rowIndex", dsPriNo.getValue("rowIndex").toString());	
	smsPutBhUserInfo.addResponseData(app.lookup("Result"), false, "Result");
		
	smsPutBhUserInfo.addEventListenerOnce("submit-done", onSms_putBhUserInfoSubmitDone);
	smsPutBhUserInfo.addEventListenerOnce("submit-error", onSms_getBhSubmitError);
	smsPutBhUserInfo.addEventListenerOnce("submit-timeout", onSms_getBhSubmitTimeout);
	smsPutBhUserInfo.send();
}
					
function onSms_putBhUserInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_putBhUserInfo = e.control;
	var dsSyncInfoList = app.lookup("SyncInfoList");
	dsSyncInfoList.realDeleteRow(0);

	var grdBhUserList = app.lookup("BHUSM_grdBhUserList");

	var idx = sms_putBhUserInfo.userAttr("rowIndex");
	var nIdx= parseInt(idx, 10);
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){//idx로 찾아서 상태값 변경

		var rowData = grdBhUserList.getRow(nIdx);
		var status = rowData.getValue("SyncStatus");
		if (status == 0) {
			rowData.setValue("SyncStatus", 1);
		} 
		rowData.setValue("SyncResult", "성공");
		sendUserSyncReq();
	} else {		
		comLib.hideLoadMask();
		var rowData = grdBhUserList.getRow(nIdx);
		rowData.setValue("SyncResult", "실패");
		
		dataManager = getDataManager();
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
}
