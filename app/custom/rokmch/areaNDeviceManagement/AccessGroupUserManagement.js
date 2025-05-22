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

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	Left_UserID_Map = new Map();
	Right_UserID_Map = new Map();
	
	var getAccessGroupSet = dataManager.getAccessGroup();
	var dsAccessGroup = app.lookup("AccessGroupList");
	getAccessGroupSet.copyToDataSet(dsAccessGroup); 
	
	var udcRegistUserList = app.lookup("udcRegistUserList");	
	//udcRegistUserList.deleteColumn([13,12,11,10,9,8,7,6,5,4]);
	udcRegistUserList.deleteColumn([13,12,11,10,9,8,7,6,5,4,1]);
	udcRegistUserList.setPaging(0,1,5,pageRowCount);
	
	var udcUnRegistUserList = app.lookup("udcUnRegistUserList");	
	udcUnRegistUserList.deleteColumn([13,12,11,10,9,8,7,6,5,4]);
	udcUnRegistUserList.deleteColumn([13,12,11,10,9,8,7,6,5,4,1]);
	udcUnRegistUserList.setPaging(0,1,5,pageRowCount);
	
	if (dataManager.getOemVersion() == OEM_JAWOONDAE) {
		var btnUserReSync = app.lookup("ACUSM_btnUserReSync");
		btnUserReSync.visible = true;
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
		//console.log("sms_Send_List action : " + requsetData.action);
		
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
	
	
	var udcUnRegistUserList = app.lookup("udcUnRegistUserList");
	udcUnRegistUserList.clearUserList();
	var dsUnRegUsersInfo = app.lookup("UnRegUsersInfo");
	dsUnRegUsersInfo.clear();
	
	sendAccessGroupUserListRequest(accessGroupGrd);	
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
	} else {
		comLib.alert("warning", "출입그룹에 등록된 정보 가져오기 실패.");
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
	console.log(Left_UserID_Map);
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
	console.log(Right_UserID_Map);
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
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedUser"));	
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
		comLib.alert("warning", "출입그룹에 등록된 정보 가져오기 실패.");
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
		
	var chkIndices = udcUnRegistUserList.getCheckedRowIndices()
	var count = chkIndices.length;
	if (count <= 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedUser"));
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
	
	var rowAccessGroup = app.lookup("AccessGroupGrd").getSelectedRow();
	onAccessGroupUserDataResync(rowAccessGroup.getValue("ID"));
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
		comLib.alert("warning", "출입그룹에 등록된 정보 가져오기 실패.");
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
