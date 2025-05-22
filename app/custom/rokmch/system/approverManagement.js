/************************************************
 * approverManagement.js
 * Created at 2020. 12. 9. 오후 4:20:04.
 *
 * @author fois
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var UMAPM_pageRowCount = 100
var userMap;
var loginUserGroupCode;

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	userMap = new Map();
	loginUserGroupCode = getLoginUserGroupCode();
	
	var dsGroupList = app.lookup("GroupList");
	var groupList = dataManager.getGroup();
	groupList.copyToDataSet(dsGroupList);
	dsGroupList.addRowData({"Name":dataManager.getString("Str_All"),"GroupID":0});
	dsGroupList.commit();
	
	app.lookup("UMAPM_treGroup").expandAllItems();
	app.lookup("UMAPM_treGroup").selectItemByValue(loginUserGroupCode);
	app.lookup("UMAPM_treGroup").redraw();
	
	var cmbGroup = app.lookup("UMAPM_cmbGroup");
	cmbGroup.setItemSet(groupList, {label: "Name",value: "GroupID"});
	cmbGroup.addItem(new cpr.controls.Item("---",0));	
	
	var udcUserList = app.lookup("UMAPM_udcUserList");
	udcUserList.deleteColumn([13,12,11,10,9,8,7,6,4,1]);
	udcUserList.moveColumn(3,2);
	udcUserList.setPaging(0,1,UMAPM_pageRowCount,5);
	
	var searchCtrl = app.lookup("UMAPM_udcSearchUser");
	searchCtrl.deleteSearchCategoryItem(2);
	
	//sendApproverListReq();
}

function sendApproverListReq(){
	var approverList = app.lookup("ApproverList");
	approverList.clear();

	var treGroup = app.lookup("UMAPM_treGroup");
//	var groupID = 0;
//	var groupInfo = treGroup.getSelectionFirst();
//	if( groupInfo ){ // 트리에서 그룹 선택 시
//		if(isSuperGroupAdmin()) { // Master, 상위 그룹 관리자면 그룹검색 O
//			groupID = groupInfo.value;
//		} else { // 일반 사용자면 본인 부서 사람만 .
//			groupID = loginUserGroupCode;
//		}
//	} else { // 트리에서 그룹 선택 안했을 시
//		if(dataManager.getAccountID() != 1000000000000000000) { // Master는 0으로, 사용자는 본인 부서로
//			groupID = loginUserGroupCode;
//		} 
//	}
	var groupID = treGroup.getSelectionFirst().value; // 해당 그룹 접근 권한은 selection-change 이벤트에서 먼저 검사 완료.
	comLib.showLoadMask("",dataManager.getString("Str_UserList"),"",0);
	
	var sms_getApproverList = app.lookup("sms_getApproverList");
	sms_getApproverList.setParameters("group", groupID);
	sms_getApproverList.send();
}

// 승인자 리스트 가져오기 완료
function onSms_getApproverListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){		
		var approverList = app.lookup("ApproverList");
		var count = approverList.getRowCount();
		for( var i = 0; i < count; i++){
			var approverInfo = approverList.getRow(i);
			userMap.set(approverInfo.getValue("ID"),approverInfo);			
		}
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
	
	sendUserListRequest();	
}

function sendUserListRequest(){
	var udcUserList = app.lookup("UMAPM_udcUserList");
	var curIndex = udcUserList.getCurrentPageIndex();
	var offset = (curIndex - 1) * UMAPM_pageRowCount
		
	var sms_getUserList = app.lookup("sms_getUserList");
	
	var searchCtrl = app.lookup("UMAPM_udcSearchUser")
	sms_getUserList.setParameters("searchCategory", searchCtrl.searchCategory);
	sms_getUserList.setParameters("searchKeyword", searchCtrl.searchKeyword);
	if (searchCtrl.searchKeyword != undefined && searchCtrl.searchKeyword.length > 0) {
		sms_getUserList.setParameters("searchCategory", searchCtrl.searchCategory);
	} else {
		sms_getUserList.setParameters("searchCategory", "");
	}
	
	var groupList = app.lookup("UMAPM_treGroup");
	var group = groupList.getSelectionFirst();
	
//	if(!isSuperGroupAdmin()) {  // 일반 사용자일 경우
//		sms_getUserList.setParameters("groupID", loginUserGroupCode);
//	} else { // Master 일 경우
//		if (group != undefined && group.value != "") { // 트리에서 부서 선택 시 선택한 값으로
//			sms_getUserList.setParameters("groupID", parseInt(group.value, 10));
//		} else {
//			sms_getUserList.setParameters("groupID", 0);
//		} 
//	}

	if(isLoginMaster()){
		if (group != undefined && group.value != "") { // 트리에서 부서 선택 시 선택한 값으로
			sms_getUserList.setParameters("groupID", parseInt(group.value, 10));
		} else {
			sms_getUserList.setParameters("groupID", 0);
		}		
	} else {
		sms_getUserList.setParameters("groupID", loginUserGroupCode);
	}
	
	sms_getUserList.setParameters("subInclude", "true");
	
	// 현역, 군무원, 공무직, 관리자만 가져오기.
	sms_getUserList.setParameters("userType", UserPrivArmyOnDutyNMilitaryPerson);

	// 페이징 계산하여 요청
	sms_getUserList.setParameters("offset", offset);
	sms_getUserList.setParameters("limit", UMAPM_pageRowCount)
	
	var fields = ["user_id","name","group_code","unique_id"];
	sms_getUserList.setParameters("fields", fields);
	
	comLib.showLoadMask("",dataManager.getString("Str_UserListGet"),"",0);
	sms_getUserList.send();
}

// 승인자 리스트 가져오기 에러
function onSms_getApproverListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// 승인자 리스트 가져오기 타임아웃
function onSms_getApproverListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// 사용자 리스트 가져오기 완료
function onSms_getUserListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){		
		var userList = app.lookup("UserList");
		var count = userList.getRowCount();
		for( var i = 0; i < count; i++){
			var userInfo = userList.getRow(i);
			// 이미 승인자인 사용자는 리스트에서 delete된 채로 있도록 버그 수정 -mjy
			// ID 앞의 0000 빼주는 작업 추가
	//		userInfo.setValue("ID",userInfo.getValue("ID").replace(/(^0+)/,""));
			
//			var approverInfo = userMap.get(userInfo.getValue("ID"));
//			if( approverInfo ){				
//				userInfo.setState(cpr.data.tabledata.RowState.DELETED);			
//			}	
		}
		
		var totalCount = parseInt(app.lookup("Total").getValue("Count"));				
		app.lookup("UMAPM_optUserTotal").value = totalCount;
		
		var viewPageCount = totalCount / UMAPM_pageRowCount + (totalCount % UMAPM_pageRowCount > 0);
		if (viewPageCount > 10) {
			viewPageCount = 10;
		}

		var udcUserList = app.lookup("UMAPM_udcUserList");
		udcUserList.setUserList(userList);
		udcUserList.setPaging(totalCount, UMAPM_pageRowCount, viewPageCount);
		udcUserList.refreshUserList(userMap);
		//udcUserList.setCurrentPageIndex(1); // page 1로 초기화
		udcUserList.redraw();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}

// 사용자 리스트 가져오기 에러
function onSms_getUserListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// 사용자 리스트 가져오기 타임아웃
function onSms_getUserListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// 사용자 리스트 페이지 선택시
function onUMAPM_udcUserListPagechange(/* cpr.events.CSelectionEvent */ e){
	sendUserListRequest();
}

// 검색 버튼 클릭
function onUMAPM_udcSearchUserSearch(/* cpr.events.CUIEvent */ e){
	var udcUserList = app.lookup("UMAPM_udcUserList");
	udcUserList.setCurrentPageIndex(1);
	sendUserListRequest();
}

function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		sendUserListRequest();		
	}
}

// 승인자 추가 버튼 클릭
function onUMAPM_btnAddClick(/* cpr.events.CMouseEvent */ e){
	var udcUserList = app.lookup("UMAPM_udcUserList");
	var indices = udcUserList.getCheckedRowIndices();
	var count = indices.length;
	
	if (count == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Info"), dataManager.getString("Str_UserNotSelected"));
		return
	} else {
		
		var approverInfo = app.lookup("ApproverInfo");
		
		var appld = "app/main/users/approvalLevelSet";
		app.openDialog(appld, {width : 300, height : 190}, function(dialog){
			dialog.initValue = {"approverInfo":approverInfo};
			dialog.bind("headerTitle").toLanguage("Str_ApproveLevel");
			dialog.style.header.css("background-color", "#528443");
			dialog.modal = true;
		}).then(function(returnValue){
				
			if( returnValue != null ){
				
				approverInfo.setValue("MinApproveLevel",returnValue.getValue("MinApproveLevel"));
				approverInfo.setValue("MaxApproveLevel",returnValue.getValue("MaxApproveLevel"));
				
				comLib.showLoadMask("pro",dataManager.getString("Str_UserAdd"),"",count);

				var dsAddList = app.lookup("UserIDList");
				dsAddList.clear();
		
				for( var i = 0; i < count; i++){						
					dsAddList.addRowData({"UserID":udcUserList.getUserID(indices[i])});
				}
				sendPostApprover();
			}
		});
	}
}

function sendPostApprover(){
	var userIDList = app.lookup("UserIDList");
	var count = userIDList.getRowCount();
	
	if( count == 0 ){
		comLib.hideLoadMask();
		sendApproverListReq();
		return;
	}
	var userIDInfo = userIDList.getRow(0);		
	var userID = userIDInfo.getValue("UserID");
	userIDList.realDeleteRow(0);
	
	var approverInfo = app.lookup("ApproverInfo");
	approverInfo.setValue("ID",userID);
	
	var sms_postApprover = app.lookup("sms_postApprover");
	sms_postApprover.send();
}

// 승인자 추가 완료
function onSms_postApproverSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){		
		sendPostApprover();
	} else {
		comLib.hideLoadMask();
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}

// 승인자 추가 에러
function onSms_postApproverSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// 승인자 추가 타임아웃
function onSms_postApproverSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// 승인자 정보 더블클릭 (수정)
function onUMAPM_grdApproverListRowDblclick(/* cpr.events.CGridMouseEvent */ e){
	/** @type cpr.controls.Grid	 */
	var uMAPM_grdApproverList = e.control;	
	var approverList = app.lookup("ApproverList");
	var selInfo = approverList.findFirstRow("ID == "+e.row.getValue("ID"));
	if( selInfo == null){return;}
		
	var approverInfo = app.lookup("ApproverInfo");
	approverInfo.clear();
	
	approverInfo.setValue("ID",selInfo.getValue("ID"));
	approverInfo.setValue("MinApproveLevel",selInfo.getValue("MinApproveLevel"));
	approverInfo.setValue("MaxApproveLevel",selInfo.getValue("MaxApproveLevel"));
			
	var appld = "app/main/users/approvalLevelSet";
	app.openDialog(appld, {width : 320, height : 240}, function(dialog){
		dialog.initValue = {"approverInfo":approverInfo};
		dialog.bind("headerTitle").toLanguage("Str_ApproveLevel");
		dialog.style.header.css("background-color", "#528443");
		dialog.modal = true;
	}).then(function(returnValue){
			
		if( returnValue != null ){
			
			approverInfo.setValue("MinApproveLevel",returnValue.getValue("MinApproveLevel"));
			approverInfo.setValue("MaxApproveLevel",returnValue.getValue("MaxApproveLevel"));
			
			sendPutApprover();
		}
	});	
}

function sendPutApprover(){
	
	comLib.showLoadMask("",dataManager.getString("Str_UserAdd"),"",0);
	
	var approverInfo = app.lookup("ApproverInfo");
	var userID = approverInfo.getValue("ID");
	
	var sms_putApprover = app.lookup("sms_putApprover");
	sms_putApprover.action = "/v1/approvers/"+userID;
	sms_putApprover.send();
}

// 승인자 수정 완료
function onSms_putApproverSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	comLib.hideLoadMask();
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){		
		sendApproverListReq();
	} else {
		comLib.hideLoadMask();
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}

// 승인자 수정 에러
function onSms_putApproverSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// 승인자 수정 타임아웃
function onSms_putApproverSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// 승인자 삭제 요청
function onUMAPM_btnDeleteClick(/* cpr.events.CMouseEvent */ e){
	var grdUserList = app.lookup("UMAPM_grdApproverList");
	var indices = grdUserList.getCheckRowIndices();
	var count = indices.length;
	
	var userList = app.lookup("UserList");
	
	if (count == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Info"), dataManager.getString("Str_UserNotSelected"));
		return
	} else {
		
		comLib.showLoadMask("pro",dataManager.getString("Str_UserDelete"),"",count);

		var dsAddList = app.lookup("UserIDList");
		dsAddList.clear();
		
		for( var i = 0; i < count; i++){						
			dsAddList.addRowData({"UserID":grdUserList.getRow(indices[i]).getValue("ID")});
		}
		sendDeleteApprover();
	}
}

function sendDeleteApprover(){
	var userIDList = app.lookup("UserIDList");
	var count = userIDList.getRowCount();
	console.log("UserIDList count :" +count);
	
	if( count == 0 ){
		comLib.hideLoadMask();
		sendApproverListReq();
		//sendUserListRequest();
		console.log("count : " +count);
		return;
	}
	var userIDInfo = userIDList.getRow(0);		
	var userID = userIDInfo.getValue("UserID");
	userIDList.realDeleteRow(0);
	userIDList.commit();
	
	var approverInfo = app.lookup("ApproverInfo");
	approverInfo.setValue("ID",userID);
	var sms_deleteApprover = app.lookup("sms_deleteApprover");
	sms_deleteApprover.action = "/v1/approvers/"+userID;
	sms_deleteApprover.send();
	
}

//승인자 삭제 완료
function onSms_deleteApproverSubmitDone(/* cpr.events.CSubmissionEvent */ e){
		
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){		
		sendDeleteApprover();
	} else {
		comLib.hideLoadMask();
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}

}

//승인자 삭제 에러
function onSms_deleteApproverSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

//승인자 삭제 타임아웃
function onSms_deleteApproverSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}


function onUMAPM_treGroupSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var udcUserList = app.lookup("UMAPM_udcUserList");
	udcUserList.setCurrentPageIndex(1);
	// 육본인 경우 Master만 전체 부서 보기 가능 -mjy
//	if(!isSuperGroupAdmin()) { // 로그인한 사용자의 그룹이 아니고 ParentGroup != 0 이면 권한 없다는 알림창 띄우기
//		var selectTree = app.lookup("UMAPM_treGroup").getSelectionFirst().value;
//		if (selectTree != loginUserGroupCode && selectTree != 0 ){ // 본인 부서가 아닌 곳을 누를 경우 alert
//			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PrivilegeAlert"));
//			app.lookup("UMAPM_treGroup").selectItemByValue(loginUserGroupCode);
//		} else { // 본인의 그룹 혹은 "전체"를 눌렀을 경우
//			sendApproverListReq();	
//		}	
//	} else { // Master, 상위 그룹 관리자일 경우
//		sendApproverListReq();	
//	}
	// 24년도부터는 Master만 전체 관리 가능
	var selectTree = app.lookup("UMAPM_treGroup").getSelectionFirst().value;
	if(!isLoginMaster() && !isAccessibleGroup(selectTree)){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PrivilegeAlert"));
		app.lookup("UMAPM_treGroup").selectItemByValue(loginUserGroupCode);
		return;
	}	
	sendApproverListReq();
}
