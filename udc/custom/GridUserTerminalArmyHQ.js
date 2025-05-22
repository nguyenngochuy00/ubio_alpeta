/************************************************
 * userListGroup.js
 * Created at 2018. 12. 5. 오후 5:34:01.
 *
 * @author fois
 ************************************************/

var comLib;
var _enableUser = true;
var _enableTerminal = true;
var _excludeGroup = -1; // 사용자 검색시 그룹 제외 조건 설정 여부
var _excludeAccessGroup = -1; // 사용자 검색시 출입그룹 제외 조건 설정 여부
var dataManager = cpr.core.Module.require("lib/DataManager");
var inputValidManager = createInputValidator(app);
var _privilegeID = 0;
var updateStep = 0;
var userCntPerRequest = 2000;
var totalCount = 0;

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app.getHostAppInstance());

	var cmbUserCategory = app.lookup("userListGroup_cmbUserCategory");
	
	if (dataManager.getOemVersion() != OEM_ARMY_HQ && dataManager.getOemVersion() != OEM_ROKMCH) { // 육군본부의 경우 id 검색 조건 삭제 - pse
		cmbUserCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_ID"),"id"));
	}
	cmbUserCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_Name"),"name"));
	cmbUserCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_UniqueID"),"uniqueid"));
	
	// 자운대 경우 이름 검색 기준으로
	if (dataManager.getOemVersion() == OEM_JAWOONDAE) {
		cmbUserCategory.value = "name";
	} 
	var cmbTerminalCategory = app.lookup("userListGroup_cmbTerminalCategory");
	cmbTerminalCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_ID"),"id"));
	if (dataManager.getOemVersion() == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH) { // 육군본부의 경우 이름을 장비위치로 보이도록 수정 - pse
		cmbTerminalCategory.addItem(new cpr.controls.Item("장비 위치","name"));
		app.lookup("optGroupName").bind("value").toLanguage("Str_ARMY_UserGroupName");
		app.lookup("userListGroup_btnGroupDelete").bind("value").toLanguage("Str_ARMY_UserGroupDelete");
	} else {
		cmbTerminalCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_Name"),"name"));
	}	
	cmbTerminalCategory.value = "id";
	cmbTerminalCategory.selectItemByLabel(dataManager.getString("Str_Name"));
	
	app.lookup("userListGroup_treeGroup").selectItemByValue(getLoginUserGroupCode());
}

exports.initControl = function(enableUser,enableTerminal,excludeGroup,excludeAccessGroup){

	_enableUser = enableUser;
	_enableTerminal = enableTerminal;
	_excludeGroup = excludeGroup;
	_excludeAccessGroup = excludeAccessGroup;
	var grpLayout = app.lookup("grpListLayout");
	var layoutRedraw = false;
	var a = app.lookup("userListGroup_grpUser");
	var b = app.lookup("userListGroup_grpTerminal");
	var c = app.lookup("userListGroup_grpHeader");
	if( _enableUser == false ){
//		app.lookup("userListGroup_grpUser").dispose();
//		layoutRedraw = true;
		var formLayout = new cpr.controls.layouts.FormLayout();
		formLayout.setColumns(["1fr"]);
		formLayout.setRows(["1fr"]);
		grpLayout.setLayout(formLayout);
		grpLayout.removeChild(a);
		grpLayout.removeChild(c);
		grpLayout.addChild(b);

	}

	if( _enableTerminal == false ){
//		app.lookup("userListGroup_grpTerminal").dispose();
//		layoutRedraw = true;
		var formLayout = new cpr.controls.layouts.FormLayout();
		formLayout.setColumns(["1fr"]);
		formLayout.setRows(["1fr"]);
		grpLayout.setLayout(formLayout);
		grpLayout.removeChild(b);
		grpLayout.removeChild(c);
		grpLayout.addChild(a);
	}
	var dsTreeContextMenu = app.lookup("dsTreeContextMenu");
	dsTreeContextMenu.addRowData({"label":dataManager.getString("Str_GroupAdd"),"value":1,"parent":"0"});

//	if( layoutRedraw == true ){
////		var grpLayout = app.lookup("grpListLayout");
//		var formLayout = new cpr.controls.layouts.FormLayout();
//		formLayout.setColumns(["1fr"]);
//		formLayout.setRows(["1fr"]);
//		grpLayout.setLayout(formLayout);
//		grpLayout.addChild(child);
//	}
}

exports.visibleGroupImport = function(value){
	app.lookup("userListGroup_btnGroupImport").visible = value;	
}

exports.hideUserButtons = function(){
	app.lookup("userListGroup_btnUserAdd").dispose();
	app.lookup("userListGroup_btnUserRemove").dispose();
}

exports.hideTerminalButtons = function(){
	app.lookup("userListGroup_btnTerminalAdd").dispose();
	app.lookup("userListGroup_btnTerminalRemove").dispose();
}

exports.getUserCheckedRowIndices = function() {
	var userList = app.lookup("userListGroup_udcUserList");
	return userList.getCheckedRowIndices();
}

exports.getTerminalCheckedRowIndices = function() {
	var terminalList = app.lookup("userListGroup_udcTerminalList");
	return terminalList.getCheckedRowIndices();
}

exports.getRow = function( index ){

	var userList = app.lookup("userListGroup_udcUserList");
	return userList.getRow(index);
}

exports.getUserRowData = function( index ){

	var userList = app.lookup("userListGroup_udcUserList");
	return userList.getRow(index).getRowData();
}

exports.getTerminalRowData = function( index ){

	var terminalList = app.lookup("userListGroup_udcTerminalList");
	return terminalList.getRow(index).getRowData();
}

exports.setUserRowState = function( index, /*cpr.data.tabledata.RowState*/ state ){
	var gridUserList = app.lookup("userListGroup_udcUserList");
	gridUserList.setRowState(index, state);
}

exports.setTerminalRowState = function( index, /*cpr.data.tabledata.RowState*/ state ){
	var gridTerminalList = app.lookup("userListGroup_udcTerminalList");
	gridTerminalList.setRowState(index, state);
}

exports.deleteUserColumn = function(indices){
	var gridUserList = app.lookup("userListGroup_udcUserList");
	gridUserList.deleteColumn(indices);
};

exports.deleteTerminalColumn = function(indices){
	var gridTerminalList = app.lookup("userListGroup_udcTerminalList");
	gridTerminalList.deleteColumn(indices);
};

exports.deleteUserRow = function(checkRow) {
	var userList = app.lookup("userListGroup_udcUserList");
	userList.deleteRow(checkRow);
	return;
}

exports.deleteTerminalRow = function(checkRow) {
	var gridTerminalList = app.lookup("userListGroup_udcTerminalList");
	gridTerminalList.deleteRow(checkRow);
	return;
}

exports.search = function(){
	sendUserListRequest();
};

exports.setPageRowCount = function(userCount,terminalCount){
	if( _enableUser == true ){
		var userList = app.lookup("userListGroup_udcUserList");
		userList.setPageRowCount(userCount);
	}
	if( _enableTerminal == true ){
		var terminalList = app.lookup("userListGroup_udcTerminalList");
		terminalList.setPageRowCount(terminalCount);
	}
};

exports.setGroupList = function( /*cpr.data.DataSet*/ groupDataSet ){
	var dsGroupList = app.lookup("GroupList");
	dsGroupList.clear();
	groupDataSet.copyToDataSet(dsGroupList);
	dsGroupList.commit();
	//dsGroupList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);

	var groupList = app.lookup("userListGroup_treeGroup");	
	groupList.redraw();
	
	// 그룹리스트 적용
	var cmbKeyword = app.lookup("userListGroup_cmbKeyword");
	cmbKeyword.setItemSet(dsGroupList, {
		label: "Name",
		value: "GroupID",
	});
}

exports.getSelectedGroup = function(){
	var groupList = app.lookup("userListGroup_treeGroup");
	return groupList.getSelectionFirst();
}

exports.setSelectedGroup = function(groupID){
	var groupList = app.lookup("userListGroup_treeGroup")
	groupList.selectItemByValue(groupID);
}

exports.setExpandAllItems = function(){
	var groupList = app.lookup("userListGroup_treeGroup")
	groupList.expandAllItems();
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

exports.refreshUserList = function( idMap ) {
	var udcUserList = app.lookup("userListGroup_udcUserList");
	udcUserList.refreshUserList(idMap);
}

exports.refreshTerminalList = function( idMap ) {
	var udcTerminalList = app.lookup("userListGroup_udcTerminalList");
	udcTerminalList.refreshTerminalList(idMap);
}

exports.setPrivilegeID = function(privilegeID) {
	_privilegeID = privilegeID;
	return;
}

function onSubmitError(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}


// 그룹 리스트 클릭시
function onUserListGroup_treeGroupSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.Tree	 */
	var userListGroup_treeGroup = e.control;	
	var group = userListGroup_treeGroup.getSelectionFirst();
	if( group == null ){
		return;
	}
	
	if(!isLoginMaster() && !isAccessibleGroup(group.value)){ // 24년도부터 마스터가 아닌 관리자는 본인 부서와 하위 부서만 관리 가능
		var userGroup = getLoginUserGroupCode();
		userListGroup_treeGroup.selectItemByValue(userGroup);
		app.lookup("userListGroup_cmbKeyword").selectItemByValue(userGroup);
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PrivilegeAlert"));
		return;
	}
	app.lookup("userListGroup_cmbKeyword").selectItemByValue(group.value, false);
	
	var bEnable = true;	
	if( group.value == 0 ){	bEnable = false;} // 그룹 [전체] 선택 상태일 경우 삭제 메뉴 Disable. 전체는 미설정 상태를 의미하므로 미설정에서는 삭제 불가.
	var btnUserRemove = app.lookup("userListGroup_btnUserRemove");
	if(btnUserRemove){btnUserRemove.enabled = bEnable;}
	var btnTerminalRemove = app.lookup("userListGroup_btnTerminalRemove");
	if(btnTerminalRemove){btnTerminalRemove.enabled = bEnable;}
	
	if( _enableUser == true ){
		
		var userSearchCategory = app.lookup("userListGroup_cmbUserCategory");
		userSearchCategory.value = 0;
		if (dataManager.getOemVersion() == OEM_JAWOONDAE) {
			userSearchCategory.value = "name";
		}
		var userSearchKeyword = app.lookup("userListGroup__ipbUserKeyword");
		userSearchKeyword.value = "";

		var udcUserList = app.lookup("userListGroup_udcUserList");
		udcUserList.setCurrentPageIndex(1);
	}

	if( _enableTerminal == true ){
		
		var terminalSearchCategory = app.lookup("userListGroup_cmbTerminalCategory");
		terminalSearchCategory.value = 0;
		var terminalSearchKeyword = app.lookup("userListGroup__ipbTerminalKeyword");
		terminalSearchKeyword.value = "";

		var udcTerminalList = app.lookup("userListGroup_udcTerminalList");
		udcTerminalList.setCurrentPageIndex(1);
	}
	var ipbGroupName = app.lookup("userListGroup_ipbGroupName");
	if( ipbGroupName ){		
		ipbGroupName.value = group.label;
	}

	if( _enableUser == true ){
		sendUserListRequest();
	} else if( _enableTerminal == true ){
		sendTerminalListRequest();
	}
	//20190828 정래훈 -  인풋에 값이 없으면 경고 표시를 주기위해 작성
	if(app.lookup("userListGroup_ipbGroupName")){
		inputValidManager.validate(app.lookup("userListGroup_ipbGroupName"), "isValid", "");
	}
	
}
function onSms_getGroupAccessGroupSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var result = app.lookup("Result");
	if( result.getValue("ResultCode")==0){
		var groupAccessGroup = app.lookup("GroupAccessGroup");
		var groupInfo = app.lookup("GroupInfo");
		groupInfo.setValue("AccessGroupID",groupAccessGroup.getValue("AccessGroupID"));
		app.lookup("userListGroup_cmbAccessGroup").redraw();
			
	}else{		
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
}

function sendUserListRequest() {

	var userList = app.lookup("userListGroup_udcUserList");
	var curIndex = userList.getCurrentPageIndex();

	var pageRowCount = userList.getPageRowCount();
	var offset = (curIndex - 1) * pageRowCount;

	var groupList = app.lookup("userListGroup_treeGroup");
	var group = groupList.getSelectionFirst();

	var searchCategory = app.lookup("userListGroup_cmbUserCategory").value;
	var searchKeyword = app.lookup("userListGroup__ipbUserKeyword").value;

	// 검색 조건 세팅
//	var smsGetUserList = app.lookup("sms_getUserList");
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
	if (group != null && group.value != "") {
		getUserList.setParameters("groupID", parseInt(group.value, 10));
	} else {
		getUserList.setParameters("groupID", 0);
	}
	getUserList.setParameters("subInclude", "true");

	getUserList.setParameters("excludeGroup", _excludeGroup);

	getUserList.setParameters("privilegeID", _privilegeID);
	getUserList.setParameters("userType", UserPrivArmyOnDutyNMilitaryPerson); // 현역, 군무원, 공무직, 관리자만 가져오기
	// 페이징 계산하여 요청
	getUserList.setParameters("offset", offset);
	getUserList.setParameters("limit", pageRowCount);

	var fields = ["user_id","name", "unique_id"];
	getUserList.setParameters("fields", fields);

	comLib.showLoadMask("",dataManager.getString("Str_UserInfoLoading"),"",pageRowCount);
	
	
	getUserList.addEventListenerOnce("submit-done", onSms_getUserListSubmitDone);
	getUserList.addEventListenerOnce("submit-error", onSubmitError);
	getUserList.addEventListenerOnce("submit-timeout", onSubmitTimeout);

	getUserList.send();
	//
}

// 사용자 리스트 페이지 변경시
function onUserListGroup_udcUserListPagechange(/* cpr.events.CSelectionEvent */ e){
	sendUserListRequest();
}

// 사용자 검색 클릭 시
function onUserListGroup_btnUserSearchClick(/* cpr.events.CMouseEvent */ e){
	var userList = app.lookup("userListGroup_udcUserList");
	userList.setCurrentPageIndex( 1 );
	
	sendUserListRequest();
}

// 사용자 리스트 가져오기 완료
function onSms_getUserListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");

	if( result.getValue("ResultCode")==0){
		var userList = app.lookup("userListGroup_udcUserList");
		var dsUserList = app.lookup("UserList");

		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));

		var pageRowCount = userList.getPageRowCount();
		var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
		if (viewPageCount > 5) {
			viewPageCount = 5;
		}

		userList.setTotalCount(totalCount);

		var opbTotal = app.lookup("userListGroup_opbUserTotal")
		opbTotal.value = totalCount;
		opbTotal.redraw();

		var dsGroupList = app.lookup("GroupList");

		for( var i = 0; i < dsUserList.getRowCount(); i++ ){
			var row = dsUserList.getRow(i);
			var groupInfo = dsGroupList.findFirstRow("GroupID =='"+row.getValue("GroupCode")+"'");
			if( groupInfo != null ){
				row.setValue("GroupCode",groupInfo.getValue("Name"));
			} else {
				row.setValue("GroupCode","None");
			}
		}

		var userList = app.lookup("userListGroup_udcUserList");
		userList.setUserList(dsUserList);

		comLib.hideLoadMask();

		var userListUpdateEvent = new cpr.events.CEvent("userListUpdate", {

		});

		app.dispatchEvent(userListUpdateEvent);

		if( _enableTerminal == true ){
			sendTerminalListRequest();
		}
		
	}else{
		comLib.hideLoadMask();
		//dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ListLoading"));
		
		//dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));
		
		// 검색 결과가 없는 경우
		if (result.getValue("ResultCode") == ErrorGroupNoSearchResult) {
			var userList = app.lookup("userListGroup_udcUserList");
			userList.clearUserList();
			
			var opbTotal = app.lookup("userListGroup_opbUserTotal")
			opbTotal.value = 0;
			opbTotal.redraw();
		}
	}
}

// 사용자 리스트 더블 클릭 이벤트 출판...
function onUserListGroup_udcUserListUserListDblclick(/* cpr.events.CGridEvent */ e){
	var gridEvent = new cpr.events.CGridEvent("userListDblclick", {	 row:e.row	});
	app.dispatchEvent(gridEvent);
}

function sendTerminalListRequest() {

	var terminalList = app.lookup("userListGroup_udcTerminalList");
	var curIndex = terminalList.getCurrentPageIndex();

	var pageRowCount = terminalList.getPageRowCount();
	var offset = (curIndex - 1) * pageRowCount;

	var groupList = app.lookup("userListGroup_treeGroup");
	var group = groupList.getSelectionFirst();

	var searchCategory = app.lookup("userListGroup_cmbTerminalCategory").value;
	var searchKeyword = app.lookup("userListGroup__ipbTerminalKeyword").value;

	// 검색 조건 세팅
	var smsGetTerminalList = app.lookup("sms_getTerminalList");
	app.lookup("Result").clear(); 
	app.lookup("Total").clear(); 
	app.lookup("TerminalList").clear();
	smsGetTerminalList.setParameters("searchKeyword", searchKeyword);
	if (searchKeyword != null && searchKeyword.length > 0) {
		smsGetTerminalList.setParameters("searchCategory", searchCategory);
	} else {
		smsGetTerminalList.setParameters("searchCategory", "");
	}
	if (group != null && group.value != "") {
		smsGetTerminalList.setParameters("groupID", parseInt(group.value, 10));
	} else {
		smsGetTerminalList.setParameters("groupID", 0);
	}
	smsGetTerminalList.setParameters("subInclude", "true");
	smsGetTerminalList.setParameters("excludeGroup", _excludeGroup);

	// 페이징 계산하여 요청
	smsGetTerminalList.setParameters("offset", offset);
	smsGetTerminalList.setParameters("limit", pageRowCount);

	var fields = ["terminal_id","name"];
	smsGetTerminalList.setParameters("fields", fields);

	comLib.showLoadMask("",dataManager.getString("Str_UserInfoLoading"),"",pageRowCount);
	smsGetTerminalList.send();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var sms_getTerminalList = e.control;

	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){

		var terminalList = app.lookup("userListGroup_udcTerminalList");

		var dsTerminalList = app.lookup("TerminalList");
		terminalList.setTerminalList(dsTerminalList);

		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));

		var pageRowCount = terminalList.getPageRowCount();
		var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
		if (viewPageCount > 5) {
			viewPageCount = 5;
		}

		terminalList.setTotalCount(totalCount);
		var opbTotal = app.lookup("userListGroup_opbTerminalTotal")
		opbTotal.value = totalCount;
		opbTotal.redraw();

		comLib.hideLoadMask();

		var terminalListUpdateEvent = new cpr.events.CEvent("terminalListUpdate", {
		});

		app.dispatchEvent(terminalListUpdateEvent);

	} else {
		comLib.hideLoadMask();
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorBrandTypeLoadingFailed"));
	}
}

// 사용자 추가 클릭. 사용자 선택창 팝업
function onUserListGroup_btnUserAddClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var userListGroup_btnUserAdd = e.control;
	var dsGroupList = app.lookup("GroupList");

	var groupList = app.lookup("userListGroup_treeGroup");
	var group = groupList.getSelectionFirst();

	app.getRootAppInstance().openDialog("app/main/users/UserSelect", {width : 900, height : 500}, function(dialog){
		dialog.initValue = {"GroupList":dsGroupList,"ExcludeGroup":group.value};
		dialog.bind("headerTitle").toLanguage("Str_UserSelect");
		dialog.style.header.css("background-color", "#528443");
		dialog.modal = true;
	}).then(function(/*cpr.data.DataSet*/idMap){

		var dsUserIDSendList = app.lookup("UserIDSendList");

		idMap.forEach(function(value,key){
			dsUserIDSendList.addRowData({"ID":key});
		});

		totalCount = dsUserIDSendList.getRowCount();

		updateStep = 0;
		comLib.showLoadMask("",dataManager.getString("Str_GroupUserUpdate"),"",totalCount/userCntPerRequest);
		sendUpdateUserGroupCode();
	});
}

// 사용자 삭제 클릭
function onUserListGroup_btnUserRemoveClick(/* cpr.events.CMouseEvent */ e){
	var udcUserList = app.lookup("userListGroup_udcUserList");
	var indices = udcUserList.getCheckedRowIndices();
	if( indices.length == 0){
		return;
	}	
	
	var dsUserIDList = app.lookup("UserIDList");
	dsUserIDList.clear();
	
	indices.forEach(function(index){
		var row = udcUserList.getRow(index);
		dsUserIDList.addRowData(row.getRowData());
	});

	var smsUpdateUserGroup = app.lookup("sms_updateUserGroup");
	comLib.showLoadMask("",dataManager.getString("Str_GroupUserUpdate"),"");
	smsUpdateUserGroup.action = "/v1/groups/0/users";
	smsUpdateUserGroup.send();
}

function sendUpdateUserGroupCode(){

	var dsUserIDList = app.lookup("UserIDList");
	var dsUserIDSendList = app.lookup("UserIDSendList");
	var total = dsUserIDSendList.getRowCount();
	//console.log("sendUpdateUserGroupCode : " + total);

	if( total > userCntPerRequest ){
		total = userCntPerRequest;
	}
	dsUserIDList.clear();
	dsUserIDList.build(dsUserIDSendList.getRowDataRanged(0, total-1));

	for( var i = 0; i < total; i++){
		dsUserIDSendList.realDeleteRow(0);
	}
	//console.log(dsUserIDList.getRowDataRanged());

	var smsUpdateUserGroup = app.lookup("sms_updateUserGroup");

	var groupList = app.lookup("userListGroup_treeGroup");
	var group = groupList.getSelectionFirst();

	comLib.showLoadMask("",dataManager.getString("Str_Save"),"","");
	smsUpdateUserGroup.action = "/v1/groups/"+group.value+"/users";
	smsUpdateUserGroup.send();
}

// 사용자 그룹 수정 완료
function onSms_updateUserGroupSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	var errCode = dmResult.getValue("ResultCode");
	if( errCode == COMERROR_NONE){
		updateStep++;
		var dsUserIDSendList = app.lookup("UserIDSendList");
		var leftCount = dsUserIDSendList.getRowCount();

		if( leftCount > 0){
			comLib.updateLoadMask(totalCount-leftCount+"/"+totalCount);
			sendUpdateUserGroupCode();
		} else{
			comLib.hideLoadMask();
			sendUserListRequest();
		}
	} else {
		comLib.hideLoadMask();
		//dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), getGroupErrorStr(errCode));
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(errCode)));
	}
}

// 단말기 추가 버튼 클릭 시
function onUserListGroup_btnTerminalAddClick(/* cpr.events.CMouseEvent */ e){

	var dsGroupList = app.lookup("GroupList");

	var groupList = app.lookup("userListGroup_treeGroup");
	var group = groupList.getSelectionFirst();

	app.getRootAppInstance().openDialog("app/main/terminals/TerminalSelect", {width : 1000, height : 500}, function(dialog){
		dialog.initValue = {"GroupList":dsGroupList,"ExcludeGroup":group.value};
		dialog.style.header.css("background-color", "#528443");
		dialog.headerTitle = ("단말기 선택");
		dialog.modal = true;
	}).then(function(idMap){
		var dsTerminalIDSendList = app.lookup("TerminalIDSendList");

		idMap.forEach(function(value,key){
			dsTerminalIDSendList.addRowData({"ID":key});
		});

		totalCount = dsTerminalIDSendList.getRowCount();
		//console.log("onUserListGroup_btnUserAddClick : "+totalCount);
		updateStep = 0;
		comLib.showLoadMask("pro",dataManager.getString("Str_GroupTerminalUpdate"),"",totalCount/userCntPerRequest);
		var groupList = app.lookup("userListGroup_treeGroup");

		var smsUpdateTerminalGroup = app.lookup("sms_updateTerminalGroup");
		smsUpdateTerminalGroup.setParameters("group", group.value);
		sendUpdateTerminalGroupCode();
	});
}

// 그룹에서 단말 삭제 클릭
function onUserListGroup_btnTerminalRemoveClick(/* cpr.events.CMouseEvent */ e){
	var udcTerminalList = app.lookup("userListGroup_udcTerminalList");
	var indices = udcTerminalList.getCheckedRowIndices();
	if( indices.length == 0){
		return;
	}	
	
	var dsTerminalIDSendList = app.lookup("TerminalIDSendList");
	dsTerminalIDSendList.clear();
	
	indices.forEach(function(index){
		var row = udcTerminalList.getRow(index);
		dsTerminalIDSendList.addRowData(row.getRowData());
	});

	var smsUpdateTerminalGroup = app.lookup("sms_updateTerminalGroup");
	smsUpdateTerminalGroup.setParameters("group", 0);
	sendUpdateTerminalGroupCode();
}

// 단말 리스트 더블 클릭 시
function onUserListGroup_udcTerminalListTerminalListDblclick(/* cpr.events.CGridEvent */ e){
	var gridEvent = new cpr.events.CGridEvent("terminalListDblclick", {
		 row:e.row
	});

	app.dispatchEvent(gridEvent);
}

function sendUpdateTerminalGroupCode(){

	var dsTerminalIDList = app.lookup("TerminalIDList");
	var dsTerminalIDSendList = app.lookup("TerminalIDSendList");
	var total = dsTerminalIDSendList.getRowCount();

	if( total > userCntPerRequest ){
		total = userCntPerRequest;
	}
	dsTerminalIDList.clear();
	dsTerminalIDList.build(dsTerminalIDSendList.getRowDataRanged(0, total-1));

	for( var i = 0; i < total; i++){
		dsTerminalIDSendList.realDeleteRow(0);
	}

	var smsUpdateTerminalGroup = app.lookup("sms_updateTerminalGroup");

	var groupCode = smsUpdateTerminalGroup.getParameters("group");
	smsUpdateTerminalGroup.action = "/v1/groups/"+groupCode+"/terminals";
	smsUpdateTerminalGroup.send();
}

// 그룹 단말 업데이트 완료
function onSms_updateTerminalGroupSubmitDone(/* cpr.events.CSubmissionEvent */ e){

	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		updateStep++;
		var dsTerminalIDSendList = app.lookup("TerminalIDSendList");
		var leftCount = dsTerminalIDSendList.getRowCount();

		if( leftCount > 0){
			comLib.updateLoadMask(totalCount-leftCount+"/"+totalCount);
			sendUpdateTerminalGroupCode();
		} else{			
			comLib.hideLoadMask();

			sendTerminalListRequest();
		}
	} else {
		comLib.hideLoadMask();
		//dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_Save"));
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}


// 단말기 리스트 페이지 변경
function onUserListGroup_udcTerminalListPagechange(/* cpr.events.CSelectionEvent */ e){
	sendTerminalListRequest();
}

// 그룹 리스트 가져오기 완료시
function onSms_getGroupListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var sms_getGroupList = e.control;

	var dsGroup = app.lookup("GroupList");
	dataManager.setGroup(dsGroup);

	var groupList = app.lookup("userListGroup_treeGroup");	
	groupList.redraw();
	groupList.expandAllItems();
}

// 그룹 추가 버튼 클릭
function onUserListGroup_btnGroupAddClick(/* cpr.events.CMouseEvent */ e){
	var ipbGroupName = app.lookup("userListGroup_ipbGroupName");
	var groupName = ipbGroupName.value;
	if(groupName.length == 0){
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorGroupName"));
		return
	}
	
	var groupList = app.lookup("userListGroup_treeGroup");
	var group = groupList.getSelectionFirst();
	if( group ){
//		if(group.value != 0 && group.parentValue != 0){
//			dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "하위 부서 안에 하위 부서를 만들 수 없습니다.");
//			return;
//		}
		
//		console.log(getGroupDepth(group.value));
		var curDeth = getGroupDepth(group.value);
		if (curDeth > 2 || curDeth == -1){ // 뎁스 최대 3단까지 가능
			dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "더 이상 하위 부서를 만들 수 없습니다.");
			return;
		}
		
		var accountInfo = dataManager.getAccountInfo();
		var privilegeID = accountInfo.getValue("Privilege");
		if( privilegeID != 1 && group.value == 0){
			dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorParentGroupNotSelected"));
			return;
		}
	
		var dmGroupInfo = app.lookup("GroupInfo");
		dmGroupInfo.setValue("GroupID", 0);
		dmGroupInfo.setValue("Parent", group.value);
		dmGroupInfo.setValue("Name", ipbGroupName.value);
//		dmGroupInfo.setValue("Description", "");
		var dsGroup = app.lookup("GroupList");
		if (group.value == 0){
			dmGroupInfo.setValue("Description", "");
		} else {
			var parentInfo =  dsGroup.findFirstRow("GroupID == " + group.value);
			var desc = parentInfo.getValue("Description");
			dmGroupInfo.setValue("Description", desc);			
		}

		var sms_postGroup = app.lookup("sms_postGroup");
		sms_postGroup.action = "/v1/groups";
		sms_postGroup.send();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorGroupNotSelected"));
		return;
	}
}

function getGroupErrorStr(errCode){
	var errMsg = ""
	switch( errCode ){
		case 0x03000001: errMsg = dataManager.getString("Str_ErrorGroupDuplicateID"); break;
		case 0x03000002: errMsg = dataManager.getString("Str_ErrorGroupNotExistID"); break;
		case 0x03000003: errMsg = dataManager.getString("Str_ErrorGroupNotExistParentID"); break;
		case 0x03000004: errMsg = dataManager.getString("Str_ErrorGroupInvalidInfo"); break;
		case 0x03000005: errMsg = dataManager.getString("Str_ErrorGroupInvalidID"); break;
		case 0x03000006: errMsg = dataManager.getString("Str_ErrorGroupInvalidParentID"); break;
		case 0x03000007: errMsg = dataManager.getString("Str_ErrorGroupDuplicateName"); break;
		case 0x03000008: errMsg = dataManager.getString("Str_ErrorGroupCountMax"); break;

	default:
		errMsg = dataManager.getString("Str_Save");
	}
	return errMsg;
}

// 그룹 추가 완료
function onSms_postGroupSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	var errCode = dmResult.getValue("ResultCode");
	comLib.hideLoadMask();
	if( errCode == COMERROR_NONE){
		var dsGroupList = app.lookup("GroupList");
		var dmGroupInfo = app.lookup("GroupInfo");
		var insertedRow = dsGroupList.addRowData(dmGroupInfo.getDatas());
		dsGroupList.commit();
		app.lookup("userListGroup_treeGroup").redraw();
		dataManager.insertGroup(insertedRow.getRowData());
		//var sms_getGroupList = app.lookup("sms_getGroupList");
		//sms_getGroupList.send();
	} else {
		//dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), getGroupErrorStr(errCode));
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(errCode)));
	}
}

// 그룹 수정 버튼 클릭
function onUserListGroup_btnGroupUpdateClick(/* cpr.events.CMouseEvent */ e){

	var ipbGroupName = app.lookup("userListGroup_ipbGroupName");
	var groupList = app.lookup("userListGroup_treeGroup");
	var group = groupList.getSelectionFirst();
	if( group == null || group.value == 0 ){
			dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorGroupNotSelected"));
			return
	}

// 그룹이 전체 ( ID : 0 ) 인 경우 메세지 처리.

	var dmGroupInfo = app.lookup("GroupInfo");
	dmGroupInfo.setValue("GroupID", group.value);
	dmGroupInfo.setValue("Parent", group.parentValue);
	dmGroupInfo.setValue("Name", ipbGroupName.value);
	dmGroupInfo.setValue("Description", "");

	var sms_updateGroup = app.lookup("sms_updateGroup");
	sms_updateGroup.action = "/v1/groups/"+group.value;
	sms_updateGroup.method = "put";

	sms_updateGroup.send();

}

// 그룹 업데이트 완료
function onSms_updateGroupSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	var errCode = dmResult.getValue("ResultCode");
	if( errCode == COMERROR_NONE){
		var dsGroupList = app.lookup("GroupList");
		var dmGroupInfo = app.lookup("GroupInfo");

		var groupInfo = dsGroupList.findFirstRow("GroupID == "+dmGroupInfo.getValue("GroupID"));
		if( groupInfo ){
			groupInfo.setRowData(dmGroupInfo.getDatas());

			dataManager.updateGroup(groupInfo.getRowData());
		}
		app.lookup("userListGroup_treeGroup").redraw();
	} else {

		//dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), getGroupErrorStr(errCode));
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(errCode)));
	}
}

// 그룹 삭제 클릭
function onUserListGroup_btnGroupDeleteClick(/* cpr.events.CMouseEvent */ e){
	var groupList = app.lookup("userListGroup_treeGroup");
	var group = groupList.getSelectionFirst();
	if( group == null || group.value == 0 ){
			dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorGroupNotSelected"));
			return
	}
	
	dialogConfirmAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_DeleteConfirm"), function(/*cpr.controls.Dialog*/dialog){
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				
				var sms_deleteGroup = app.lookup("sms_deleteGroup");

				sms_deleteGroup.action = "/v1/groups/"+group.value;
				sms_deleteGroup.setParameters("groupID", group.value);
				sms_deleteGroup.send();
							
			} else {
				return;
			}
		});
	});
	
}

function deleteSubGroup( groupID ){
	var dsGroupList = app.lookup("GroupList");
	var count = dsGroupList.getRowCount();		
	for( var i = 0; i < count; i++ ){
		var row = dsGroupList.getRow(i);			
		if( row ){
						
			if( row.getState()== cpr.data.tabledata.RowState.DELETED){
				continue;
			}
			
			var rowID = row.getValue("GroupID");
			if( rowID == groupID ){
				dsGroupList.deleteRow(row.getIndex());				
				continue;
			}
						
			if( row.getValue("Parent") == groupID ){					
				deleteSubGroup(rowID);			
				dsGroupList.deleteRow(row.getIndex());
			}
		}
	}
}

// 그룹 삭제 완료
function onSms_deleteGroupSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/* @type cpr.protocols.Submission */
	var sms_deleteGroup = e.control;

	var result = app.lookup("Result");
	if( result.getValue("ResultCode")==0){
		var groupID = sms_deleteGroup.getParameters("groupID");
		
		var dsGroupList = app.lookup("GroupList");
				
		deleteSubGroup(groupID);
		
		var count = dsGroupList.getRowCount();		
		for( var i = 0; i < count; i++ ){
			var row = dsGroupList.getRow(i);
			if (row ){
				if( row.getStateString()== "D" || row.getStateString()== "ID"){		
					dataManager.deleteGroup(row.getValue("GroupID"));
				}
			}
		}
		
		dsGroupList.commit();	
			
		app.lookup("userListGroup_treeGroup").redraw();
		
	}else{
		//dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_GroupDelete"));
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
}

function onHelpImageClick(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Image */
	var image = e.control;
	var helpClickEvent = new cpr.events.CMouseEvent("onHelpImageClick");
	app.dispatchEvent(helpClickEvent);
}

/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onUserListGroup_ipbGroupNameKeyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var ipbGroupName = e.control;
	//app.lookup("userListGroup_ipbGroupName").value = ipbGroupName.displayText;
	if(ipbGroupName.displayText){
		inputValidManager.validate(app.lookup("userListGroup_ipbGroupName"), "isValid", "");
	}else{
		app.lookup("userListGroup_ipbGroupName").value="";
		inputValidManager.validate(app.lookup("userListGroup_ipbGroupName"), "isNull", dataManager.getString("Str_RequiredAlert"), "");	
	}
}


/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTerminalListGroup_btnTerminalSearchClick(/* cpr.events.CMouseEvent */ e){
	var TerminalList = app.lookup("userListGroup_udcTerminalList");
	TerminalList.setCurrentPageIndex( 1 );

	sendTerminalListRequest();
}

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onUserListGroup_cmbKeywordSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var userListGroup_cmbKeyword = e.control;
	var userListGroupTreeGroup = app.lookup("userListGroup_treeGroup");
	//console.log(userListGroup_cmbKeyword.value);
	if (!isLoginMaster() && userListGroup_cmbKeyword.value == 0){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PrivilegeAlert"));
		userListGroup_cmbKeyword.value = getLoginUserGroupCode();
	}
	
	var getRow = userListGroupTreeGroup.findItem({value : userListGroup_cmbKeyword.value});
	if (getRow) {
		var idx = getRow.row.getIndex();
		//console.log(idx);
		userListGroupTreeGroup.selectItem(getRow);
		userListGroupTreeGroup.focusItem(getRow);
	}
}
// 그룹 엑셀 가져오기 클릭.
function onUserListGroup_btnGroupImportClick(/* cpr.events.CMouseEvent */ e){
	app.getRootAppInstance().openDialog("app/main/groups/groupImport", {width : 900, height : 500}, function(dialog){
		dialog.style.header.css("background-color", "#528443");		
		dialog.bind("headerTitle").toLanguage("Str_Import");
		dialog.modal = true;
	}).then(function(/*cpr.data.DataSet*/idMap){
		/*
		var dsUserIDSendList = app.lookup("UserIDSendList");

		idMap.forEach(function(value,key){
			dsUserIDSendList.addRowData({"ID":key});
		});

		totalCount = dsUserIDSendList.getRowCount();

		updateStep = 0;
		comLib.showLoadMask("",dataManager.getString("Str_GroupUserUpdate"),"",totalCount/userCntPerRequest);
		sendUpdateUserGroupCode();
		**/
	});
}

// 출입그룹 적용 버튼 클릭
function onUserListGroup_btnApplyAccessGroupClick(/* cpr.events.CMouseEvent */ e){
	var ipbGroupName = app.lookup("userListGroup_ipbGroupName");
	var groupList = app.lookup("userListGroup_treeGroup");
	var group = groupList.getSelectionFirst();
	if( group == null || group.value == 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorGroupNotSelected"));
		return
	}
	
	var accessGroupID = app.lookup("userListGroup_cmbAccessGroup").value;

	var dmGroupInfo = app.lookup("GroupInfo");
	dmGroupInfo.setValue("GroupID", group.value);
	dmGroupInfo.setValue("AccessGroupID", accessGroupID);	

	var sms_updateGroupAccessGroup = new cpr.protocols.Submission("sms_updateGroupAccessGroup");
	sms_updateGroupAccessGroup.action = "/v1/groups/"+group.value+"/accessGroup";
	sms_updateGroupAccessGroup.method = "post";
	
	sms_updateGroupAccessGroup.addRequestData(dmGroupInfo);
	sms_updateGroupAccessGroup.addResponseData(app.lookup("Result"), false, "Result");
	sms_updateGroupAccessGroup.addResponseData(app.lookup("GroupAccessGroup"), false, "GroupAccessGroup");
	
	
	sms_updateGroupAccessGroup.addEventListenerOnce("submit-done", onSms_updateGroupAccessGroupSubmitDone);
	sms_updateGroupAccessGroup.addEventListenerOnce("submit-error", onSubmitError);
	sms_updateGroupAccessGroup.addEventListenerOnce("submit-timeout", onSubmitTimeout);
	
	sms_updateGroupAccessGroup.send();	
}

function onSms_updateGroupAccessGroupSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	if( result.getValue("ResultCode")==0){
	}else{
		//dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_GroupDelete"));
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
}


