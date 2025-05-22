/************************************************
 * TerminalUser.js
 * Created at 2019. 1. 11. 오후 2:30:52.
 *
 * @author joymrk
 ************************************************/
var comLib;
var pageRowCount = 100;
var dataManager = cpr.core.Module.require("lib/DataManager");
var Left_UserID_Map;
var Right_UserID_Map;
var TMUSR_userCountPerRequest = 10; // 한번에 가져올 사용자 ID,Name 리스트. 단말에서 최대 10명씩만 보냄
var oemVersion;

function onBodyLoad( /* cpr.events.CEvent */ e) {
	comLib = createComUtil(app);
	dataManager = getDataManager();
	Left_UserID_Map = new Map();
	Right_UserID_Map = new Map();
	oemVersion = dataManager.getOemVersion();
	
	// 출입 그룹 세팅
	var getAccessGroupSet = dataManager.getAccessGroup();
	var dsAccessGroup = app.lookup("AccessGroupList");
	getAccessGroupSet.copyToDataSet(dsAccessGroup);
	
	// udc grd 세팅
	var udcRegistUserList = app.lookup("udcRegistUserList");
	if(oemVersion == OEM_BOSK_CAPS){
		// BOSK는 인사정보 동기화 이후 '출입그룹' 지정하기 위해 '그룹' 노출 요청
		udcRegistUserList.deleteColumn([13, 12, 11, 10, 9, 8, 7, 6, 4]);
		udcRegistUserList.readOnly = true;
	} else {
		udcRegistUserList.deleteColumn([13, 12, 11, 10, 9, 8, 7, 6, 5, 4]);	
	}
	udcRegistUserList.setPaging(0, 1, 5, pageRowCount);
	
	var udcUnRegistUserList = app.lookup("udcUnRegistUserList");
	if(oemVersion == OEM_BOSK_CAPS){
		// BOSK는 인사정보 동기화 이후 '출입그룹' 지정하기 위해 '그룹' 노출 요청
		udcUnRegistUserList.deleteColumn([13, 12, 11, 10, 9, 8, 7, 6, 4]);
		udcUnRegistUserList.readOnly = true;
	} else {
		udcUnRegistUserList.deleteColumn([13, 12, 11, 10, 9, 8, 7, 6, 5, 4]);
	}
	udcUnRegistUserList.setPaging(0, 1, 5, pageRowCount);
	
	var udcTerminalUserList = app.lookup('TMUSR_udcTerminalUserList');
	udcTerminalUserList.deleteColumn([13, 12, 11, 10, 9, 7, 6, 5, 4, 3, 0]);
	udcTerminalUserList.enablePageIndexer(false);
	udcTerminalUserList.resizableColumns('all');
	app.lookup('udcUnRegistUserList').resizableColumns('all');
	app.lookup('udcRegistUserList').resizableColumns('all');
	
	/* 해당 기능 일반향에 추가로 주석 처리
	if (dataManager.getOemVersion() == OEM_JAWOONDAE) {
		var btnUserReSync = app.lookup("ACUSM_btnUserReSync");
		btnUserReSync.visible = true;
	}*/
	
	// 검색 카테고리 초기화 	
	var groupList = dataManager.getGroup();
	var cmbGroup = app.lookup("ACUSM_cmbGroupInfo");
	cmbGroup.setItemSet(groupList, {
		label: "Name",
		value: "GroupID",
	});
	cmbGroup.value = 0;
	app.lookup('ACUSM_cmbCategory').value = 0;
	app.lookup('TMUSR_cmbTerminalUserCategory').value = 0;
	
	// 검색 키워드 초기화
	app.lookup('ACUSM_ipbUserKeyword').enabled = false;
	app.lookup('TMUSR_ipbTerminalUserKeyword').enabled = false;
	
	// 인원 초기화
	app.lookup('TMUSR_opbAccessGroupUserCount').value = 0;
	app.lookup('TMUSR_ipbTerminalUserCount').value = 0;
	
	// 소제목 언어 초기화
//	app.lookup('output_TerminalName').value = dataManager.getString("Str_TerminalUser");
//	app.lookup('output_AccessGroupName').value = dataManager.getString("Str_TerminalList");
//	app.lookup('output_AccessGroupName2').value = dataManager.getString("Str_UserList");
	
	if(oemVersion == OEM_MULTI_BUILDING_MAMAGEMENT){
		app.lookup("AGsearchgrb").visible = true;
		app.lookup("ACUSM_cmbSerachCategory").selectItem(0);		
	} else {
		app.lookup("grp2").getLayout().removeRows([1]);
	}
	
	// BOSK 그룹명 like 검색 조건 추가
	if(oemVersion == OEM_BOSK_CAPS){
		app.lookup('ACUSM_cmbCategory').addItem(new cpr.controls.Item(dataManager.getString("Str_GroupName"), "groupName"));
	} 	
}

function sendAccessGroupUserListRequest(/*cpr.controls.Grid*/accessGroupGrd){
	var getRow = accessGroupGrd.getSelectedRow();
	if (getRow != null) {
		var udcRegistUserList = app.lookup("udcRegistUserList");
		var curIndex = udcRegistUserList.getCurrentPageIndex();
		var offset = (curIndex - 1) * pageRowCount;	
		var requsetData = app.lookup("sms_getUsersInAccessGroupInfo");
		
		requsetData.action =  "/v1/accessGroups/" + getRow.getValue("ID") + "/allUsers";
		requsetData.setParameters("offset", offset);
		requsetData.setParameters("limit", pageRowCount);
		
		var cmbUserCategory = app.lookup("ACUSM_cmbCategory").value;
		var ipbUserKeyword = app.lookup("ACUSM_ipbUserKeyword").value;
		
		requsetData.setParameters("searchCategory", cmbUserCategory);
		requsetData.setParameters("searchKeyword", ipbUserKeyword);
		
		if (ipbUserKeyword == null || ipbUserKeyword.length == 0) {
			requsetData.setParameters("searchCategory", "");
		}
		requsetData.setParameters("groupID", app.lookup("ACUSM_cmbGroupInfo").value);
		app.lookup("RegUsersInfo").clear();
		app.lookup("UnRegUsersInfo").clear();
		requsetData.send();
	} else {
		accessGroupGrd.clearSelection();
	}
}

function onAccessGroupGrdSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var accessGroupGrd = e.control;
	var udcRegistUserList = app.lookup("udcRegistUserList");
	udcRegistUserList.clearUserList();
	var dsRegUsersInfo = app.lookup("RegUsersInfo");
	dsRegUsersInfo.clear();
	
	var terminalInfo = app.lookup('TerminalInfo');
	terminalInfo.clear();
	
	var udcUnRegistUserList = app.lookup("udcUnRegistUserList");
	udcUnRegistUserList.clearUserList();
	var dsUnRegUsersInfo = app.lookup("UnRegUsersInfo");
	dsUnRegUsersInfo.clear();
	
	sendAccessGroupUserListRequest(accessGroupGrd);
	app.lookup('output_AccessGroupName').value = accessGroupGrd.getSelectedRow().getValue("Name");
	app.lookup('output_AccessGroupName2').value = accessGroupGrd.getSelectedRow().getValue("Name");
}

function onSms_getUsersInAccessGroupInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getUsersInAccessGroupInfo = e.control;
	comLib.hideLoadMask();
	
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == 0) {
		var dsRegUsers = app.lookup("RegUsersInfo");
		var dsunRegUsers = app.lookup("UnRegUsersInfo");
		var dmRegUsersTotal = app.lookup("RegUsersTotal");
		var dmunRegUsersTotal = app.lookup("UnRegUsersTotal");
		/////////////////////////////////////////////////////////////////////////
		Left_UserID_Map.clear();
		Right_UserID_Map.clear();
		/////////////////////////////////////////////////////////////////////////
		var RegTotalCount = parseInt(dmRegUsersTotal.getValue("Count"));
		var rViewPageCount = RegTotalCount/pageRowCount + (RegTotalCount%pageRowCount>0);
		if( rViewPageCount > 5 ) {
			rViewPageCount = 5;
		}
		var udcRegistUserList = app.lookup("udcRegistUserList");
		udcRegistUserList.setUserList(dsRegUsers);
		udcRegistUserList.setPaging(RegTotalCount, pageRowCount, rViewPageCount);		
		udcRegistUserList.redraw();
		/////////////////////////////////////////////////////////////////////////
		var UnRegTotalCount = parseInt(dmunRegUsersTotal.getValue("Count"));
		var uViewPageCount = UnRegTotalCount/pageRowCount + (UnRegTotalCount%pageRowCount>0);
		if( uViewPageCount > 5 ) {
			uViewPageCount = 5;
		}
		var udcRegistUserList = app.lookup("udcUnRegistUserList");
		udcRegistUserList.setUserList(dsunRegUsers);
		udcRegistUserList.setPaging(UnRegTotalCount, pageRowCount, uViewPageCount);		
		udcRegistUserList.redraw();
		app.lookup('TMUSR_opbAccessGroupUserCount').redraw();
	} else {
		comLib.alert("warning", dataManager.getString("Str_AccessGroupInfoRetrievalFailed"));
	}
}

function onUdcRegistUserListPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.grid.userList
	 */
	SetMapProc("left");
	var udcRegistUserList = e.control;
	var newIndex = e.newSelection;
	var getRow = app.lookup("AccessGroupGrd").getSelectedRow();
	sendPageChangeRequest(getRow.getValue("ID"), "RegUserType");	
}

function onUdcUnRegistUserListPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.grid.userList
	 */
	SetMapProc("right");
	var udcUnRegistUserList = e.control;
	var getRow = app.lookup("AccessGroupGrd").getSelectedRow();
	sendPageChangeRequest(getRow.getValue("ID"), "UnRegUserType");
}

function SetMapProc(type) {
	var MapSize =0;
	if(type == "left") {
		var udcRegistUserList = app.lookup("udcRegistUserList");
		var dsUserInfo = app.lookup("RegUsersInfo");
		
		var RowCnt = dsUserInfo.getRowCount();//udcRegistUserList.getPageRowCount();

		for (var i=0 ; i < RowCnt ; i++) {
			var status = udcRegistUserList.getIsCheckedRow(i);
			var row = dsUserInfo.getRow(i);
		
			var leftUserID = row.getValue("ID");
		
			if (status == true) {
				if(Left_UserID_Map.get(leftUserID) == undefined) {
					Left_UserID_Map.set(leftUserID,1);
				}
				
				if(Right_UserID_Map.get(UserID) == undefined) {
					Right_UserID_Map.set(UserID,1);
				}
				
			} else if (status == false){
				if(Left_UserID_Map.get(leftUserID) != undefined) {
					Left_UserID_Map.delete(leftUserID);
				}
			}
		}
		MapSize = Left_UserID_Map.size
	} else if (type == "right") {
		var udcUnRegistUserList = app.lookup("udcUnRegistUserList");
		var dsUsersInfo = app.lookup("UnRegUsersInfo");
		var RowCnt = dsUsersInfo.getRowCount();
		for (var i=0 ; i < RowCnt ; i++) {
			var status = udcUnRegistUserList.getIsCheckedRow(i);
			var row = dsUsersInfo.getRow(i);
			var UserID = row.getValue("ID");
			if (status == true) {
				if(Right_UserID_Map.get(UserID) == undefined) {
					Right_UserID_Map.set(UserID,1);
				}
				 
				if(Left_UserID_Map.get(UserID) == undefined) {
					Left_UserID_Map.set(UserID,1);
				}
				
			} else if (status == false){
				if(Right_UserID_Map.get(UserID) != undefined) {
					Right_UserID_Map.delete(UserID);
				}
			}
		}
		MapSize = Right_UserID_Map.size
	}
	return MapSize;
}

function sendPageChangeRequest(getID, pageType) {
	var curIndex;
	var offset;
	var requestData;
	if(pageType == "RegUserType") {
		var udcRegUserList = app.lookup("udcRegistUserList");
		curIndex = udcRegUserList.getCurrentPageIndex();
		offset = (curIndex - 1) * pageRowCount;	
		
		requestData = app.lookup("sms_getRegUsersAccessGroupUserInfo");
		requestData.action =  "/v1/accessGroups/" + getID + "/RegUser";	
		console.log("sms_Send_List action : " + requestData.action);
	} else if(pageType == "UnRegUserType") {
		var udcUnRegUserList = app.lookup("udcUnRegistUserList");
		curIndex = udcUnRegUserList.getCurrentPageIndex();
		offset = (curIndex - 1) * pageRowCount;
		
		requestData = app.lookup("sms_getUnRegUsersAccessGroupUserInfo");	
		requestData.action =  "/v1/accessGroups/" + getID + "/UnRegUser";	
		console.log("sms_Send_List action : " + requestData.action);
		requestData.setParameters("ExcludeAccessGroup", Number(getID));
		
	}
	requestData.setParameters("offset", offset);
	requestData.setParameters("limit", pageRowCount);
	requestData.send();
}

function onSms_getRegUsersAccessGroupUserInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var sms_getRegUsersAccessGroupUserInfo = e.control;
	comLib.hideLoadMask();
	var dsUsers = app.lookup("RegUsersInfo");
	var dmResult = app.lookup("Result");
		
	if( dmResult.getValue("ResultCode") == 0){
		var RegUsersTotal = app.lookup("RegUsersTotal");
		var rTotalCount = parseInt(RegUsersTotal.getValue("Count"));
		var rViewPageCount = rTotalCount/pageRowCount + (rTotalCount%pageRowCount>0);
		if( rViewPageCount > 5 ) {
			rViewPageCount = 5;
		}
		var udcRegistUserList = app.lookup("udcRegistUserList");
		udcRegistUserList.setUserList(dsUsers);
		udcRegistUserList.setPaging(rTotalCount, pageRowCount, rViewPageCount);
		udcRegistUserList.refreshCheckboxStatus(Left_UserID_Map);
	} else {
		comLib.alert("warning", "페이지 변경 실패!");
	}
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getUnRegUsersAccessGroupUserInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){

	var sms_getUnRegUsersAccessGroupUserInfo = e.control;
	comLib.hideLoadMask();
	var dsUsers = app.lookup("UnRegUsersInfo");
	var dmResult = app.lookup("Result");
	
	if( dmResult.getValue("ResultCode") == 0){
		var UnRegUsersTotal = app.lookup("UnRegUsersTotal");
		var uTotalCount = parseInt(UnRegUsersTotal.getValue("Count"));
		var uViewPageCount = uTotalCount/pageRowCount + (uTotalCount%pageRowCount>0);
		if( uViewPageCount > 5 ) {
			uViewPageCount = 5;
		}
		var udcUnRegistUserList = app.lookup("udcUnRegistUserList");
		udcUnRegistUserList.setUserList(dsUsers);
		udcUnRegistUserList.setPaging(uTotalCount, pageRowCount, uViewPageCount);
		udcUnRegistUserList.refreshCheckboxStatus(Right_UserID_Map);
	} else {
		comLib.alert("warning", "페이지 변경 실패!");
	}
}


/*
 * "제외" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 * TODO : Swagger 추가.
 * PUT
 * action /v1/accessGroups/{id}/OutAccessGroup
 */
function onACUSM_btnUserRemoveClick(/* cpr.events.CMouseEvent */ e){
		
	var udcRegistUserList = app.lookup("udcRegistUserList");
	var dsUserInfo = app.lookup("RegUsersInfo");
		
	var chkIndices = udcRegistUserList.getCheckedRowIndices()
	var count = chkIndices.length;
	if (count <= 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedUser"));	
		return;
	}
	var dsUsers = app.lookup("Users");
	dsUsers.clear();
	
	for( var i = 0; i < count; i++ ){
		var userInfo = dsUserInfo.getRow(chkIndices[i]);
		dsUsers.addRowData({"ID":userInfo.getValue("ID")});
	}	
	
	var rowAccessGroup = app.lookup("AccessGroupGrd").getSelectedRow();		
	onUserAccessGroupUpdateReq(rowAccessGroup.getValue("ID"),0);
}

// 출입그룹 사용자 업데이트 완료
function onSms_putAccessGroupUserUpdateSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/* @type cpr.protocols.Submission */
	var sms_putAccessGroupUserUpdate = e.control;
	comLib.hideLoadMask();
	var dmResult = app.lookup("Result");
	
	if( dmResult.getValue("ResultCode") == 0) {		
		var getRow = app.lookup("AccessGroupGrd").getSelectedRow();		
		sendAccessGroupUserListRequest(app.lookup("AccessGroupGrd"));
	} else {
		comLib.alert("warning", dataManager.getString("Str_AccessGroupInfoRetrievalFailed"));
	}
}

// 사용자 출입그룹 업데이트 실패
function onSms_putAccessGroupUserUpdateSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",-1);
}

// // 사용자 출입그룹 업데이트 타임아웃
function onSms_putAccessGroupUserUpdateSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",-2);
}

function onUserAccessGroupUpdateReq( sourceAccessGroupID, targetAccessGroupID ){
	comLib.showLoadMask( "", dataManager.getString("Str_AccessGroupUserUpdate"), "",0);
	
	var dmAccessGroupInfo = app.lookup("UpdateInfo");
	dmAccessGroupInfo.setValue("Source", sourceAccessGroupID );
	dmAccessGroupInfo.setValue("Target", targetAccessGroupID );
	
	var sms_putAccessGroupUserUpdate = app.lookup("sms_putAccessGroupUserUpdate");
	sms_putAccessGroupUserUpdate.action = "/v1/accessGroups/"+targetAccessGroupID+"/users"	
	sms_putAccessGroupUserUpdate.send();
}
/*
 * "등록" 버튼에서 click 이벤트 발생 시 호출.
 * TODO : Swagger 추가.
 * PUT
 * action /v1/accessGroups/{id}/InAccessGroup
 */
function onACUSM_btnUserAddClick(/* cpr.events.CMouseEvent */ e){
	var udcUnRegistUserList = app.lookup("udcUnRegistUserList");
	var dsUnRegUserInfo = app.lookup("UnRegUsersInfo");
		
	var chkIndices = udcUnRegistUserList.getCheckedRowIndices();
	var count = chkIndices.length;
	if (count <= 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedUser"));
		return;
	}
	var dsUsers = app.lookup("Users");
	dsUsers.clear();
	
	for( var i = 0; i < count; i++ ){
		var userInfo = dsUnRegUserInfo.getRow(chkIndices[i]);
		dsUsers.addRowData({"ID":userInfo.getValue("ID")});
	}	
		
	var rowAccessGroup = app.lookup("AccessGroupGrd").getSelectedRow();
	onUserAccessGroupUpdateReq(0,rowAccessGroup.getValue("ID"));	
}





/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getUsersInAccessGroupInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",-1);
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getUsersInAccessGroupInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",-2);	
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getRegUsersAccessGroupUserInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",-2);
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getRegUsersAccessGroupUserInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",-1);
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getUnRegUsersAccessGroupUserInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
var result = app.lookup("Result");
	result.setValue("ResultCode",-1);
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getUnRegUsersAccessGroupUserInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",-2);
	
}

// 도움말
function onTMUSR_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = DLG_ACCESSGROUP_USER_MANAGEMENT;	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getRootAppInstance().dispatchEvent(selectionEvent);
}


/*
 * 버튼(ACUSM_btnUserReSync)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onACUSM_btnUserReSyncClick(/* cpr.events.CMouseEvent */ e){
	var grdTerminalList = app.lookup('grdTerminalList');
	var chkIndices = grdTerminalList.getCheckRowIndices();
	if (!chkIndices.length) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorGetTerminalList"));
	} else {
		var terminalInfoList = app.lookup('TerminalInfoList');
		app.lookup('TerminalInfoList').clear();
		for (var i = 0; i < chkIndices.length; i++) {
			app.lookup('TerminalInfoList').addRowData({
				"ID": app.lookup('TerminalInfo').getValue(chkIndices[i], 'ID')
			})
		}
		var rowAccessGroup = app.lookup("AccessGroupGrd").getSelectedRow();
		onAccessGroupUserDataResync(rowAccessGroup.getValue("ID"));
	}
}

function onAccessGroupUserDataResync( accessGroupID ){
	comLib.showLoadMask( "", dataManager.getString("Str_AccessGroupUserUpdate"), "",0);
	
	var dmAccessGroupInfo = app.lookup("UpdateInfo");
	dmAccessGroupInfo.setValue("Source", accessGroupID );
	dmAccessGroupInfo.setValue("Target", accessGroupID );
	
	var sms_postAccessGroupUserDataResync = app.lookup("sms_postAccessGroupUserDataResync");
	sms_postAccessGroupUserDataResync.action = "/v1/accessGroups/userDataResync";
	sms_postAccessGroupUserDataResync.send();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postAccessGroupUserDataResyncSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == 0) {		
		var getRow = app.lookup("AccessGroupGrd").getSelectedRow();		
		var udcUnRegistUserList = app.lookup("udcUnRegistUserList");
		udcUnRegistUserList.clearUserList();
		var dsUnRegUsersInfo = app.lookup("UnRegUsersInfo");
		dsUnRegUsersInfo.clear();
		var udcRegistUserList = app.lookup("udcRegistUserList");
		udcRegistUserList.clearUserList();
		var dsRegUsersInfo = app.lookup("RegUsersInfo");
		dsRegUsersInfo.clear();
		sendAccessGroupUserListRequest(app.lookup("AccessGroupGrd"));
	} else {
		comLib.alert("warning", dataManager.getString("Str_AccessGroupInfoRetrievalFailed"));
	}	
}

function onSms_postAccessGroupUserDataResyncSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_postAccessGroupUserDataResyncSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onACARM_imgHelpClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}


/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onACUSM_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	//1 출입그룹 선택
	var accessGroup = app.lookup("AccessGroupGrd");
	var selectedRow = accessGroup.getSelectedRow();
	if (selectedRow) {
		var udcRegistUserList = app.lookup("udcRegistUserList");
		udcRegistUserList.clearUserList();
		var dsRegUsersInfo = app.lookup("RegUsersInfo");
		dsRegUsersInfo.clear();
				
		var udcUnRegistUserList = app.lookup("udcUnRegistUserList");
		udcUnRegistUserList.clearUserList();
		var dsUnRegUsersInfo = app.lookup("UnRegUsersInfo");
		dsUnRegUsersInfo.clear();
		
		var accessGroupID = selectedRow.getValue("ID");
		//sendAccessGroupUserListRequest(selectedRow);
		var udcRegistUserList = app.lookup("udcRegistUserList");
		var curIndex = udcRegistUserList.getCurrentPageIndex();
		var offset = (curIndex - 1) * pageRowCount;	
		var requsetData = app.lookup("sms_getUsersInAccessGroupInfo");
		requsetData.action =  "/v1/accessGroups/" + accessGroupID + "/allUsers";
		
		requsetData.setParameters("offset", offset);
		requsetData.setParameters("limit", pageRowCount);
		
		var cmbUserCategory = app.lookup("ACUSM_cmbCategory").value;
		var ipbUserKeyword = app.lookup("ACUSM_ipbUserKeyword").value;
		requsetData.setParameters("searchCategory", cmbUserCategory);
		requsetData.setParameters("searchKeyword", ipbUserKeyword);
		if (ipbUserKeyword == null || ipbUserKeyword.length == 0) {
			requsetData.setParameters("searchCategory", "");
		}
		requsetData.setParameters("groupID", app.lookup("ACUSM_cmbGroupInfo").value);
		
		app.lookup("RegUsersInfo").clear();
		app.lookup("UnRegUsersInfo").clear();
		
		requsetData.send();
	} else {
		comLib.alert("warning", dataManager.getString("Str_AccessGroupInfoRetrievalFailed"));
	}
	
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onACUSM_cmbGroupInfoSelectionChange(/* cpr.events.CSelectionEvent */ e){

	var accessGroup = app.lookup("AccessGroupGrd");
	var selectedRow = accessGroup.getSelectedRow();
	if (selectedRow) {
		var udcRegistUserList = app.lookup("udcRegistUserList");
		udcRegistUserList.clearUserList();
				
		var udcUnRegistUserList = app.lookup("udcUnRegistUserList");
		udcUnRegistUserList.clearUserList();
		
		var accessGroupID = selectedRow.getValue("ID");
		var curIndex = udcRegistUserList.getCurrentPageIndex();
		var offset = (curIndex - 1) * pageRowCount;	
		var requsetData = app.lookup("sms_getUsersInAccessGroupInfo");
		requsetData.action =  "/v1/accessGroups/" + accessGroupID + "/allUsers";
		
		requsetData.setParameters("offset", offset);
		requsetData.setParameters("limit", pageRowCount);
		
		requsetData.setParameters("groupID", app.lookup("ACUSM_cmbGroupInfo").value);
		
		app.lookup("RegUsersInfo").clear();
		app.lookup("UnRegUsersInfo").clear();
		
		requsetData.send();
	} else {
		comLib.alert("warning", dataManager.getString("Str_AccessGroupInfoRetrievalFailed"));
	}
}


/*
 * 버튼(TMUSR_btnUserIDInfoRequest)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTMUSR_btnUserIDInfoRequestClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var tMUSR_btnUserIDInfoRequest = e.control;
	var grdTerminalList = app.lookup("grdTerminalList");

	if (grdTerminalList.getSelectedRow() == null) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalNotSelected"));
		return;
	}
	app.lookup("TMUSR_cmbTerminalUserCategory").value = 0;

	var terminalID = grdTerminalList.getSelectedRow().getValue('ID');
	var ipbTerminalUserKeyword = app.lookup("TMUSR_ipbTerminalUserKeyword");
	ipbTerminalUserKeyword.value = "";
	ipbTerminalUserKeyword.enabled = false;
	
	var dsUserInfoList = app.lookup("TerminalUserInfo");
	dsUserInfoList.clear();
	
	var udcTerminalUserList = app.lookup("TMUSR_udcTerminalUserList");
	udcTerminalUserList.clearUserList();
	
	comLib.showLoadMask("", dataManager.getString("Str_UserListGet"), "", 10);
	onTerminalUserInfoRequest(); // 사용자 정보 요청
	
	var sms_get_terminalUserCounts = app.lookup("sms_get_terminalUserCounts");
	sms_get_terminalUserCounts.action = "/v1/terminalUsers/" + terminalID + "/count";
	sms_get_terminalUserCounts.send();
	app.lookup('output_TerminalName').value = grdTerminalList.getSelectedRow().getValue('Name');
}

function onTerminalUserInfoRequest() {
	
	var dmUserCount = app.lookup("TerminalCount");
	var userCount = dmUserCount.getValue("Count");
	var offset = dmUserCount.getValue("Offset");
	
	if (offset >= userCount) {
		comLib.hideLoadMask();
		return
	}
	
	var reqCount = userCount - offset;
	if (reqCount > TMUSR_userCountPerRequest) {
		reqCount = TMUSR_userCountPerRequest;
	}
	
	comLib.updateLoadMask(dataManager.getString("Str_UserListGet"));
	
	
	var grdTerminalList = app.lookup("grdTerminalList");
	var terminalID = grdTerminalList.getSelectedRow().getValue('ID');
	
	// 사용자 ID,Name 리스트 가져오기 
	
	var dmResult = app.lookup("Result");
	var dsTerminalUserInfo = app.lookup("TerminalUserInfo");
	var sms_get_terminalUserInInfo = new cpr.protocols.Submission("sms_get_terminalUserInInfo");
	sms_get_terminalUserInInfo.method = "GET";
	sms_get_terminalUserInInfo.mediaType = "application/x-www-form-urlencoded";
	sms_get_terminalUserInInfo.action = "/v1/terminalUsers/" + terminalID + "/info";
	
	sms_get_terminalUserInInfo.setParameters("offset", offset);
	sms_get_terminalUserInInfo.setParameters("limit", reqCount);
	//console.log(offset,reqCount);
	
	sms_get_terminalUserInInfo.addResponseData(dmResult);
	
	sms_get_terminalUserInInfo.addResponseData(dsTerminalUserInfo, true);
	
	sms_get_terminalUserInInfo.addEventListenerOnce("submit-done", onSms_get_terminalUserInInfoSubmitDone);
	sms_get_terminalUserInInfo.addEventListenerOnce("submit-error", onSms_get_terminalUserInInfoSubmitError);
	sms_get_terminalUserInInfo.addEventListenerOnce("submit-timeout", onSms_get_terminalUserInInfoSubmitTimeout);
	
	sms_get_terminalUserInInfo.send();
}



/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_get_terminalUserCountsSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_get_terminalUserCounts = e.control;
	var result = app.lookup("Result");
	var ipbTerminalUserCount = app.lookup("TMUSR_ipbTerminalUserCount");
	if (result.getValue("ResultCode") == 0) {
		comLib.hideLoadMask();
		
		var dmUserCount = app.lookup("TerminalCount");
		dmUserCount.setValue("Offset", 0);
		
		var userCount = dmUserCount.getValue("Count");
		// console.log("userCount" + userCount);
		if (userCount > 0) {
			var total = userCount / TMUSR_userCountPerRequest; // 단말에서 한번에 10명만 주므로 
			if (userCount % TMUSR_userCountPerRequest != 0) {
				total++;
			}
			comLib.showLoadMask("pro", dataManager.getString("Str_UserListGet"), "", total);
			onTerminalUserInfoRequest(); // 사용자 정보 요청
		}
	} else {
		comLib.hideLoadMask();
		ipbTerminalUserCount.value = 0;
		dialogAlert(app, dataManager.getString("Str_UserListGet"), dataManager.getString("Str_Failed") + " : " + dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
	ipbTerminalUserCount.redraw();
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_get_terminalUserCountsSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_get_terminalUserCounts = e.control;
	var result = app.lookup("Result");
	result.setValue("ResultCode", -1);
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_get_terminalUserCountsSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_get_terminalUserCounts = e.control;
	var result = app.lookup("Result");
	result.setValue("ResultCode", -2);
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_get_terminalUserInInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_get_terminalUserInInfo = e.control;
	var result = app.lookup("Result");
	result.setValue("ResultCode", -1);
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_get_terminalUserInInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_get_terminalUserInInfo = e.control;
	var result = app.lookup("Result");
	result.setValue("ResultCode", -2);
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_get_terminalUserInInfoSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_get_terminalUserInInfo = e.control;
	var result = app.lookup("Result");
	if (result.getValue("ResultCode") == 0) {
		var dsUserInfoList = app.lookup("TerminalUserInfo");
		var dmUserCount = app.lookup("TerminalCount");
		var userCount = dmUserCount.getValue("Count");
		var offset = dmUserCount.getValue("Offset");
		
		offset += TMUSR_userCountPerRequest;
		dmUserCount.setValue("Offset", offset);
		
		if (offset < userCount) {
			onTerminalUserInfoRequest();
		} else {
			var count = dsUserInfoList.getRowCount();
			for (var i = 0; i < count; i++) {
				var userInfo = dsUserInfoList.getRow(i);
				var authType = userInfo.getValue("AuthInfo").split(',');
				
				var andAuth = "";
				for (var idx = 0; idx < authType[7]; idx++) {
					var authTypeValue = parseInt(authType[idx], 10);
					var type = getAuthTypeString(authTypeValue)
					andAuth += type + " ";
				}
				var orAuth = "";
				for (var idx = authType[7]; idx < authType.length - 1; idx++) {
					var authTypeValue = parseInt(authType[idx], 10);
					var type = getAuthTypeString(authTypeValue)
					orAuth += type + " ";
				}
				userInfo.setValue("AuthInfo", andAuth + "/" + orAuth);
				/*	
					var updateFalg = ""
					if (dsUserInfoList.getValue("UpdateFlag") == 0)
						userInfo.setValue("UpdateFlag", "X");
					else
						userInfo.setValue("UpdateFlag", "O");
					*/
			}
			var udcUserList = app.lookup("TMUSR_udcTerminalUserList");
			udcUserList.setUserList(dsUserInfoList);
			comLib.hideLoadMask();
		}
	} else {
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_UserListGet"), dataManager.getString("Str_Failed") + " : " + dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
}


/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTMUSR_btnTerminalUserSearchClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Container
	 */
	var tMUSR_btnTerminalUserSearch = e.control;
	var cmbUserCategory = app.lookup("TMUSR_cmbTerminalUserCategory");
	var ipbUserKeyword = app.lookup("TMUSR_ipbTerminalUserKeyword");
	var udcTerminalUserList = app.lookup("TMUSR_udcTerminalUserList");
	var reg = /[\{\}\[\]\/?.,;:|\)`^\<>@\#$%&\\\=\(\'\"]/gi;
	var keyword = ipbUserKeyword.value;
	var category = cmbUserCategory.value;
	/*
	if (cmbUserCategory.value == "UpdateX" || cmbUserCategory.value == "UpdateO") {
		var category = cmbUserCategory.value;
		udcTerminalUserList.setFilter(category, "");
		
		if (cmbUserCategory.value == "UpdateO") {
			udcTerminalUserList.setCheckAll(true);
		}
		return;
	}*/
	
	if (keyword == undefined || keyword.length <= 0) {
		// 입력 데이터 없으면 필터 초기화
		udcTerminalUserList.clearFilter();
	} else {
		if (reg.test(keyword)) { // 입력 불가 특문 정규식
			dialogAlert(app, "Waning", dataManager.getString("Str_ErrorSpecialCharacters")); // "입력 할 수 없는 특수문자입니다."
			return;
		}
		udcTerminalUserList.setFilter(category, keyword);
	}
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onTMUSR_cmbTerminalUserCategorySelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var tMUSR_cmbTerminalUserCategory = e.control;
	var ipbTerminalUserKeyword = app.lookup('TMUSR_ipbTerminalUserKeyword');
	if(tMUSR_cmbTerminalUserCategory.value == 0){
		ipbTerminalUserKeyword.clear();
		ipbTerminalUserKeyword.enabled = false;
	} else {
		ipbTerminalUserKeyword.enabled = true;
	}
}

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onACUSM_cmbCategorySelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var aCUSM_cmbCategory = e.control;

	var cmbCategory = app.lookup('ACUSM_cmbCategory');
	var ipbUserKeyword = app.lookup('ACUSM_ipbUserKeyword');
	if(cmbCategory.value == 0){
		ipbUserKeyword.clear();
		ipbUserKeyword.enabled = false;
	} else {
		ipbUserKeyword.enabled = true;
	}
}


function onTMUSR_ipbTerminalUserKeywordKeyup(/* cpr.events.CKeyboardEvent */ e){
	var tMUSR_ipbTerminalUserKeyword = e.control;
	if(e.keyCode == 13) {
		onTMUSR_btnTerminalUserSearchClick(e);
	}
}


function onACUSM_ipbUserKeywordKeyup(/* cpr.events.CKeyboardEvent */ e){
	var aCUSM_ipbUserKeyword = e.control;
	if (e.keyCode == 13) {
		onACUSM_btnSearchClick(e);
	}
}


function onACUSM_btnAGSerachItemClick(/* cpr.events.CItemEvent */ e){
	var searchWord = app.lookup("ACUSM_ipbSerachKeyWord").value;
	var searchCategory = app.lookup("ACUSM_cmbSerachCategory").value;	
	var accessGroupList = app.lookup("AccessGroupList");
	var getAccessGroupSet = dataManager.getAccessGroup();
	
	if(searchWord.length > 0 && Number(searchCategory) > 0){
		if(Number(searchCategory) == 1){ // 출입그룹 명 검색
			var dsAccessGroup = new cpr.data.DataSet("ds1");
			dsAccessGroup.parseData({
				"columns": [
					{
						"name": "ID",
						"dataType": "number"
					},
					{
						"name": "Name",
						"dataType": "string",
					},
				]
			});
			
			for(var i = 0; i < getAccessGroupSet.getRowCount(); i++){
				var row = getAccessGroupSet.getRowData(i);
				if(row.Name.includes(searchWord)){
//					console.log(row);
					dsAccessGroup.addRowData({
						"ID": row.ID,
						"Name": row.Name
					})
				}
			}
			accessGroupList.clear();
			dsAccessGroup.copyToDataSet(accessGroupList);
		} else if(Number(searchCategory) == 2){ // 출입그룹 ID 검색
			accessGroupList.setFilter("ID == " + searchWord);
		}
		
	} else { // 전체
		accessGroupList.clear();
		getAccessGroupSet.copyToDataSet(accessGroupList);
	}
	
}


function onACUSM_ipbSerachKeyWordKeyup(/* cpr.events.CKeyboardEvent */ e){
	if (e.keyCode == 13) {
		onACUSM_btnAGSerachItemClick(e);
	}
}
