/************************************************
 * gridAccessGroupUser.js
 * Created at 2020. 3. 23. 오후 7:59:53.
 *
 * @author joymrk
 ************************************************/
var comLib;
var _enableUser = true;
var _AccessGroup = 0; // 
var dataManager = cpr.core.Module.require("lib/DataManager");
var inputValidManager = createInputValidator(app);
var _privilegeID = 0;
var updateStep = 0;
var userCntPerRequest = 2000;
var totalCount = 0;

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app.getHostAppInstance());

	var cmbUserCategory = app.lookup("userListAccessGroup_cmbUserCategory");
	cmbUserCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_ID"),"id"));
	cmbUserCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_Name"),"name"));
	cmbUserCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_UniqueID"),"uniqueID"));
	
	// 자운대 경우 이름 검색 기준으로
	if (dataManager.getOemVersion() == OEM_JAWOONDAE) {
		cmbUserCategory.value = "name";
	}
}

exports.setPageRowCount = function(userCount,terminalCount){
	if( _enableUser == true ){
		var userList = app.lookup("userListAccessGroup_udcUserList");
		userList.setPageRowCount(userCount);
	}
};

exports.deleteUserColumn = function(indices){
	var gridUserList = app.lookup("userListAccessGroup_udcUserList");
	gridUserList.deleteColumn(indices);
};


exports.hideUserButtons = function(){
}

exports.setAccessGroupList = function( /*cpr.data.DataSet*/ accessGroupDataSet ){
	var dsAccessGroupList = app.lookup("AccessGroupList");
	dsAccessGroupList.clear();
	accessGroupDataSet.copyToDataSet(dsAccessGroupList);
	dsAccessGroupList.commit();

	var accessgroupList = app.lookup("userListAccessGroup_treeGroup");
	accessgroupList.redraw();
}

exports.setSelectedAccessGroup = function(accessgroupID){
	var accessgroupList = app.lookup("userListAccessGroup_treeGroup")
	accessgroupList.selectItemByValue(accessgroupID);
}

exports.search = function(){
	sendUserListRequest();
};

exports.getUserCheckedRowIndices = function() {
	var userList = app.lookup("userListAccessGroup_udcUserList");
	return userList.getCheckedRowIndices();
}

exports.getUserRowData = function( index ){

	var userList = app.lookup("userListAccessGroup_udcUserList");
	return userList.getRow(index).getRowData();
}

exports.deleteUserRow = function(checkRow) {
	var userList = app.lookup("userListAccessGroup_udcUserList");
	userList.deleteRow(checkRow);
	return;
}

exports.refreshUserList = function( idMap ) {
	var udcUserList = app.lookup("userListAccessGroup_udcUserList");
	udcUserList.refreshUserList(idMap);
}

exports.getTotalCount = function() {
	var dmTotal = app.lookup("Total");
	var totalCount = parseInt(dmTotal.getValue("Count"));
	return totalCount;
}

exports.getSelectedAccessGroup = function(){
	var groupList = app.lookup("userListAccessGroup_treeGroup");
	return groupList.getSelectionFirst();
}
function sendUserListRequest() {

	var userList = app.lookup("userListAccessGroup_udcUserList");
	var curIndex = userList.getCurrentPageIndex();

	var pageRowCount = userList.getPageRowCount();
	var offset = (curIndex - 1) * pageRowCount;

	var accessgroupList = app.lookup("userListAccessGroup_treeGroup");
	var accessgroup = accessgroupList.getSelectionFirst();

	var searchCategory = app.lookup("userListAccessGroup_cmbUserCategory").value;
	var searchKeyword = app.lookup("userListAccessGroup__ipbUserKeyword").value;

	// 검색 조건 세팅
	var getUserList = new cpr.protocols.Submission("sms_getUserList_New");
	getUserList.action = "/v1/users";
	getUserList.method = "GET";
	getUserList.mediaType = "application/x-www-form-urlencoded";
	//console.log(getUserList.action);
	app.lookup("Result").clear();
	app.lookup("Total").clear();
	app.lookup("UserList").clear();
	getUserList.addResponseData(app.lookup("Result"), false, "Result");
	getUserList.addResponseData(app.lookup("Total"), false, "Total");
	getUserList.addResponseData(app.lookup("UserList"), false, "UserList");
	
	getUserList.setParameters("searchKeyword", searchKeyword);
	if (searchKeyword != null && searchKeyword.length > 0) {
		getUserList.setParameters("searchCategory", searchCategory);
	} else {
		getUserList.setParameters("searchCategory", "");
	}
	if (accessgroup != null && accessgroup.value != "") {
		getUserList.setParameters("accessGroupID", parseInt(accessgroup.value, 10));
	} else {
		getUserList.setParameters("accessGroupID", 0);
	}
	getUserList.setParameters("subInclude", "true");

	// 페이징 계산하여 요청
	getUserList.setParameters("offset", offset);
	getUserList.setParameters("limit", pageRowCount);

	var fields = ["user_id","name", "unique_id"];
	getUserList.setParameters("fields", fields);

	comLib.showLoadMask("",dataManager.getString("Str_UserInfoLoading"),"",pageRowCount);
	getUserList.send();
	
	getUserList.addEventListenerOnce("submit-done", onSms_getUserListSubmitDone);
	getUserList.addEventListenerOnce("submit-error", onSms_getUserListSubmitError);
	
	getUserList.addEventListenerOnce("submit-timeout", onSms_getUserListSubmitTimeout);
	//
	
}

// 사용자 리스트 가져오기 완료
function onSms_getUserListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");

	if( result.getValue("ResultCode")==0){

		var userList = app.lookup("userListAccessGroup_udcUserList");
		var dsUserList = app.lookup("UserList");

		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));

		var pageRowCount = userList.getPageRowCount();
		var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
		if (viewPageCount > 5) {
			viewPageCount = 5;
		}

		userList.setTotalCount(totalCount);

		var opbTotal = app.lookup("userListAccessGroup_opbUserTotal")
		opbTotal.value = totalCount;
		opbTotal.redraw();

		var dsAccessGroupList = app.lookup("AccessGroupList");

		for( var i = 0; i < dsUserList.getRowCount(); i++ ){
			var row = dsUserList.getRow(i);
			var accessgroupInfo = dsAccessGroupList.findFirstRow("ID =='"+row.getValue("AccessGroupCode")+"'");
			if( accessgroupInfo != null ){
				row.setValue("AccessGroupCode",accessgroupInfo.getValue("Name"));
			} else {
				row.setValue("AccessGroupCode","None");
			}
		}

		var userList = app.lookup("userListAccessGroup_udcUserList");
		userList.setUserList(dsUserList);

		comLib.hideLoadMask();

		var userListUpdateAccessGroupEvent = new cpr.events.CEvent("userListUpdateAccessGroup", {

		});

		app.dispatchEvent(userListUpdateAccessGroupEvent);

	}else{
		comLib.hideLoadMask();
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ListLoading"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
}

// 사용자 리스트 가져오기 에러
function onSms_getUserListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR);
}

// 사용자 리스트 가져오기 타임아웃
function onSms_getUserListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

/*
 * 사용자 정의 컨트롤에서 userListDblclick 이벤트 발생 시 호출.
 */
function onUserListAccessGroup_udcUserListUserListDblclick(/* cpr.events.CGridEvent */ e){
	var gridEvent = new cpr.events.CGridEvent("userListDblclickAccessGroup", {
		 row:e.row
	});

	app.dispatchEvent(gridEvent);
}


/*
 * 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
 */
function onUserListAccessGroup_udcUserListPagechange(/* cpr.events.CSelectionEvent */ e){
	sendUserListRequest();
}


/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUserListGroup_btnUserSearchClick(/* cpr.events.CMouseEvent */ e){
		var userList = app.lookup("userListAccessGroup_udcUserList");
	userList.setCurrentPageIndex( 1 );

	sendUserListRequest();
}

/*
 * 트리에서 selection-change 이벤트 발생 시 호출.
 * 선택된 Item 값이 저장된 후에 발생하는 이벤트.
 */
function onUserListAccessGroup_treeGroupSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.Tree */
	var userListAccessGroup_treeGroup = e.control;
	var accessgroup = userListAccessGroup_treeGroup.getSelectionFirst();
	if( accessgroup == null ){
		return;
	}
	var bEnable = true;	
	if( accessgroup.value == 0 ){	bEnable = false;} // [전체] 선택 상태일 경우 삭제 메뉴 Disable. 전체는 미설정 상태를 의미하므로 미설정에서는 삭제 불가.
	var userSearchCategory = app.lookup("userListAccessGroup_cmbUserCategory");
	userSearchCategory.value = 0;
	if (dataManager.getOemVersion() == OEM_JAWOONDAE) {
		userSearchCategory.value = "name";
	}
	var userSearchKeyword = app.lookup("userListAccessGroup__ipbUserKeyword");
	userSearchKeyword.value = "";

	var udcUserList = app.lookup("userListAccessGroup_udcUserList");
	udcUserList.setCurrentPageIndex(1);
	
	if( _enableUser == true ){
		sendUserListRequest();
	}
	
}