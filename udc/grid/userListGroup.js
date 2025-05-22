/************************************************
 * userListGroup.js
 * Created at 2018. 12. 5. 오후 5:34:01.
 *
 * @author fois
 ************************************************/

var comLib;

exports.initControl = function(){
	comLib = createComUtil(app);
	
	var pageIndex = app.lookup("userListGroup_pageIndexer");	
	pageIndex.pageRowCount=50;
}
/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};

exports.getCheckedRowIndices = function() {
	var userList = app.lookup("userListGroup_gridUserList");
	var indices = userList.getCheckRowIndices();
	var result = [];
	indices.forEach(function(idx){
		if(userList.getRowState(idx) != cpr.data.tabledata.RowState.DELETED ){
			result.push(idx);
		} else {
			userList.setCheckRowIndex(idx, false);
		}
	});
	return result;
}

exports.getRow = function( index ){
	
	var userList = app.lookup("userListGroup_gridUserList");
	return userList.getRow(index);	
}

exports.getRowData = function( index ){
	
	var userList = app.lookup("userListGroup_gridUserList");
	return userList.getRow(index).getRowData();	
}

exports.setRowState = function( index, /*cpr.data.tabledata.RowState*/ state ){
	var dsuserList = app.lookup("UserList");
	dsuserList.setRowState(index, state);	
}

exports.deleteColumn = function(indices){
	if (indices==undefined || indices == null ){
		return;
	}
	var gridUserList = app.lookup("userListGroup_gridUserList");
	indices.forEach(function(index){
		gridUserList.deleteColumn(index);
	});	
};

exports.deleteRow = function(checkRow) {
	var userList = app.lookup("userListGroup_gridUserList");
	if( checkRow >= userList.getRowCount()){
		return;
	}
	userList.deleteRow(checkRow);
	userList.setCheckRowIndex(checkRow, false);
	return;
}

exports.search = function(){	
	sendUserListRequest();
};

exports.setPageRowCount = function(count){
	var pageIndex = app.lookup("userListGroup_pageIndexer");	
	pageIndex.pageRowCount=count;
};

exports.setGroupList = function( /*cpr.data.DataSet*/userDataSet ){
			
	var groupListSet = app.lookup("GroupList");
	groupListSet.clear();	
	userDataSet.copyToDataSet(groupListSet);	
	groupListSet.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
		
	var groupList = app.lookup("userListGroup_treeGroup");	
	groupList.redraw();
	
}

exports.getSelectedGroup = function(){
	var groupList = app.lookup("userListGroup_treeGroup");
	return groupList.getSelectionFirst();
}

exports.getTotalCount = function() {
	var dmTotal = app.lookup("Total");
	var totalCount = parseInt(dmTotal.getValue("Count"));
	return totalCount;
}

exports.getRowCount = function() {
	var dsUserList = app.lookup("UserList");	
	return dsUserList.getRowCount();
}

/*
 * 그룹 리스트 클릭시 
 */
function onUserListGroup_treeGroupSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Tree
	 */
	var userListGroup_treeGroup = e.control;
	
	var searchCategory = app.lookup("userListGroup__cmbSearchCategory")
	searchCategory.value = 0;
	var searchKeyword = app.lookup("userListGroup__ipbKeyword")
	searchKeyword.value = "";
	
	var pageIndex = app.lookup("userListGroup_pageIndexer");	
	pageIndex.currentPageIndex = 1;	
	
	sendUserListRequest();
}

/**
 * 사용자 리스트 컨트롤의 페이징 정보를 설정합니다.
 */
function setPaging( totalCount, pageRowCount, viewPageCount ) {
	var pageIndex = app.lookup("userListGroup_pageIndexer");
	
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	//pageIndex.currentPageIndex = currentPageIndex;//현재 선택된 페이지의 인덱스
	pageIndex.pageRowCount = pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	
	if(totalCount == 0) {
		pageIndex.visible = false;
	} else {
		pageIndex.visible = true;
	}
	
	pageIndex.redraw();
}

function sendUserListRequest() {
		
	var pageIndexer = app.lookup("userListGroup_pageIndexer");	
	var curIndex = pageIndexer.currentPageIndex;
	
	var offset = (curIndex - 1) * pageIndexer.pageRowCount
		
	var groupList = app.lookup("userListGroup_treeGroup");
	var group = groupList.getSelectionFirst();

	var searchCategory = app.lookup("userListGroup__cmbSearchCategory").value;
	var searchKeyword = app.lookup("userListGroup__ipbKeyword").value;
	
	// 검색 조건 세팅
	//var smsGetUserList = app.lookup("sms_getUserList");
	var getUserList = new cpr.protocols.Submission("sms_getUserList");
	getUserList.action = "/v1/users";
	getUserList.method = "GET";
	getUserList.mediaType = "application/x-www-form-urlencoded";
	getUserList.addResponseData(app.lookup("Result"), false, "Result");
	getUserList.addResponseData(app.lookup("Total"), false, "Total");
	getUserList.addResponseData(app.lookup("UserList"), false, "UserList");
	
	getUserList.setParameters("searchKeyword", searchKeyword);
	if (searchKeyword != null && searchKeyword.length > 0) {
		getUserList.setParameters("searchCategory", searchCategory);
	} else {
		getUserList.setParameters("searchCategory", "");
	}
	if (group != null && group.value != "") {
		getUserList.setParameters("groupID", parseInt(group.value, 10));
	} else {
		getUserList.setParameters("groupID", 0);
	}
	getUserList.setParameters("subInclude", "true");

	// 페이징 계산하여 요청
	getUserList.setParameters("offset", offset);
	getUserList.setParameters("limit", pageIndexer.pageRowCount);
	
	var fields = ["user_id","name"];
	getUserList.setParameters("fields", fields);
	getUserList.addEventListenerOnce("submit-done", onSms_getUserListSubmitDone);
	getUserList.addEventListenerOnce("submit-success", onSms_getUserListSubmitSuccess);
	getUserList.addEventListenerOnce("submit-error", onSms_getUserListSubmitError);
	getUserList.addEventListenerOnce("submit-timeout", onSms_getUserListSubmitTimeout);
	
	comLib.showLoadMask("",dataManager.getString("Str_TerminalLoading"),"",pageIndexer.pageRowCount);
	getUserList.send();
	
	
	//smsGetUserList.send();	
} 

/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onUserListGroup_pageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var userListGroup_pageIndexer = e.control;
	sendUserListRequest();
}

/*
 * "검색" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUserListGroup_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var userListGroup_btnSearch = e.control;
	
	var pageIndex = app.lookup("userListGroup_pageIndexer");	
	pageIndex.currentPageIndex = 1;	
	
	sendUserListRequest();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getUserListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getUserList = e.control;
	app.lookup("userListGroup_gridUserList").redraw();
	comLib.hideLoadMask();
			
	var userListUpdateEvent = new cpr.events.CEvent("userListUpdate", {
		
	});
	
	app.dispatchEvent(userListUpdateEvent);
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms_getUserListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getUserList = e.control;
	
	var pageIndexer = app.lookup("userListGroup_pageIndexer");	
	app.lookup("userListGroup_opbTotal").redraw();
	
	var dsUserList = app.lookup("UserList");
	
	var dmTotal = app.lookup("Total");
	var totalCount = parseInt(dmTotal.getValue("Count"));

	var viewPageCount = totalCount / pageIndexer.pageRowCount + (totalCount % pageIndexer.pageRowCount > 0);
	if (viewPageCount > 5) {
		viewPageCount = 5;
	}
			
	var curIndex = pageIndexer.currentPageIndex;
	
	setPaging(totalCount, pageIndexer.pageRowCount, viewPageCount);	
	curIndex = pageIndexer.currentPageIndex;	
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getUserListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getUserList = e.control;
	
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getUserListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getUserList = e.control;
	
}

/*
 * 그리드에서 row-dblclick 이벤트 발생 시 호출.
 * detail이 row를 더블클릭 한 경우 발생하는 이벤트.
 */
function onUserListGroup_gridUserListRowDblclick(/* cpr.events.CGridEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var userListGroup_gridUserList = e.control;
	var gridEvent = new cpr.events.CGridEvent("userListDblclick", {
		 row:e.row
	});
	console.log(e.row);
	
	app.dispatchEvent(gridEvent);
	
}
