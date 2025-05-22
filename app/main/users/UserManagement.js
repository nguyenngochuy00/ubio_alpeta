/************************************************
 * UserManagement.js
 * Created at 2018. 10. 29. 오후 5:49:46.
 *
 * @author osm8667
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var USMGR_pageRowCount = 20;

var ALEMP_pageRowCount = 1000;
var ALEMP_recvRowPerExport = 20000;
var cnt = 0; 
var oemVersion;

// Body에서 load 이벤트 발생 시 호출.
function onBodyLoad( /* cpr.events.CEvent */ e) {
	
	comLib = createComUtil(app);
	dataManager = getDataManager();
	oemVersion = dataManager.getOemVersion();
	
	//udcUserList.moveColumn(sourceIndex, targetIndex);
	
	var initValue = app.getHost().initValue;

	var dsGroupList = app.lookup("GroupList");
	var groupList = dataManager.getGroup();
	groupList.copyToDataSet(dsGroupList);
	dsGroupList.addRowData({"Name":dataManager.getString("Str_All"),"GroupID":0});
	dsGroupList.commit();

	var treeGroup = app.lookup("USMAG_treeGroup");
	//var treeItemSet = new cpr.controls.Item(dataManager.getString("Str_All"), 0);
	//treeItemSet.bind("label").toLanguage("Str_All");
	//treeGroup.addItem(treeItemSet);
	treeGroup.redraw();
	
	app.lookup("USMAG_udcSearchUser").removeItem("groupName");
	app.lookup("USMAG_udcSearchUser").removeItem("accessGroupName");
		
	var accountInfo = dataManager.getAccountInfo();
	var UserPrivilege = Number(accountInfo.getValue("Privilege"));
	
	// 로그인 한 사용자가 관리자나 마스터가 아닐 경우
	if(UserPrivilege != 1){
	app.lookup("USMAG_udcSearchUser").removeItem("privilegeID")
	}
	
	// userList UDC 사용
	var userListLayOut = app.lookup("USMAG_userListLayout");
	var udcList ;
	
	// 커스텀 버튼  설정
	var User_Export_Button = app.lookup("User_Export_Button");
	var USMAG_Search_Group = app.lookup('USMAG_Search_Group');
	console.log("OEM_VERSION : " + dataManager.getOemVersion());
	switch (dataManager.getOemVersion()) {
	case OEM_JAWOONDAE:		
		console.log("JA");
		udcList = new udc.grid.userList("USMAG_udcUserList");
		User_Export_Button.value = dataManager.getString("Str_Export");
		User_Export_Button.visible = true;
		USMAG_Search_Group.getLayout().setColumnMinWidth(2, 90);
		break;
	case OEM_ND_POWER_PLANT:
		console.log("ND");
		udcList = new udc.grid.userList("USMAG_udcUserList");
		User_Export_Button.value = dataManager.getString("Str_Sync");
		User_Export_Button.visible = true;
		USMAG_Search_Group.getLayout().setColumnMinWidth(2, 80);
		break;
	case OEM_HYUNDAI_EC:
		console.log("OEM_HYUNDAI_EC : " + OEM_HYUNDAI_EC);
	case OEM_HDEC_CW:
		console.log("HD");
		udcList = new udc.grid.userList("USMAG_udcUserList");
		User_Export_Button.value = dataManager.getString("Str_Sync");
		User_Export_Button.visible = true;
		USMAG_Search_Group.getLayout().setColumnMinWidth(2, 80);
		break;	 
	case OEM_HYUNDAI_MSEAT:
		console.log("HM");
		udcList = new udc.grid.userList("USMAG_udcUserList");
		var btnBackupUserView = app.lookup("USMGR_btnBackupUserView");
		btnBackupUserView.visible = true;
		User_Export_Button.visible = false;
		break;	 
	case OEM_MCD_TRDATA:
		console.log("MC");
		udcList = new udc.grid.userList("USMAG_udcUserList");
		User_Export_Button.value = dataManager.getString("Str_Sync");
		User_Export_Button.visible = true;
		USMAG_Search_Group.getLayout().setColumnMinWidth(2, 80);
		break;
	case OEM_ITONE_POSCO_DX:
	case OEM_ITONE_TRDATA:
		console.log("ITONE");
//		udcList = new udc.grid.userList("USMAG_udcUserList");		
		udcList = new udc.grid.userList_ITONE("USMAG_udcUserList");

		app.lookup("USMGR_btnDeleteUser").visible = false;
		app.lookup("USMGR_btnRegistUser").visible = false;
		User_Export_Button.visible = false;
		
		// 명칭 변경 (그룹 -> 협력사)
		app.lookup("USMAG_udcSearchUser").addItem("Str_GroupName","groupName");
//		app.lookup("USMGR_TabFolder").getTabItemByID(1).bind("text").toLanguage("Str_PartnerCompany");
		
		break;
		
	case OEM_HE_CHUNGJU_FACTORY:
		console.log("HECJF");
		udcList = new udc.grid.userList("USMAG_udcUserList");
		User_Export_Button.value = dataManager.getString("Str_Sync");
		User_Export_Button.visible = true;
		USMAG_Search_Group.getLayout().setColumnMinWidth(2, 80);
		break;	
	default:
		console.log("DF");
		udcList = new udc.grid.userList("USMAG_udcUserList");
		User_Export_Button.visible = false;
		break;
	}
	
	
	udcList.addEventListener("pagechange", onUSMAG_udcUserListPagechange )
	udcList.addEventListener("dblclick", onUSMAG_udcUserListUserListDblclick )
	userListLayOut.addChild(udcList,  {	"colIndex": 0, "rowIndex": 0	});	
	
	var udcUserList = app.lookup("USMAG_udcUserList");
	udcUserList.setPaging(0, 1, 10, USMGR_pageRowCount);	
	udcUserList.deleteColumn([13,12]);
	userListLayOut.redraw();
	
	sendUserListRequest();
	
}

// ---------------------- 사용자 리스트 요청 관련 ------------------------->>

// 사용자 검색 요청
function onUSMGR_udcSearchUserSearch( /* cpr.events.CUIEvent */ e) {
	var udcUserList = app.lookup("USMAG_udcUserList");
	udcUserList.setCurrentPageIndex(1);
	sendUserListRequest();
}

// 서버에 사용자 리스트 요청
function sendUserListRequest() {
	

	var udcUserList = app.lookup("USMAG_udcUserList");
	var curIndex = udcUserList.getCurrentPageIndex();
	var offset = (curIndex - 1) * USMGR_pageRowCount

	var searchCtrl = app.lookup("USMAG_udcSearchUser")
	var smsGetUserList = new cpr.protocols.Submission("sms_getUserList");
		 
	if (oemVersion == OEM_ITONE_TRDATA || oemVersion == OEM_ITONE_POSCO_DX) {
		smsGetUserList.action = "/v1/itone/users";
	} else {
		smsGetUserList.action = "/v1/users";
	}
	smsGetUserList.method = "get";
	smsGetUserList.mediaType = "application/x-www-form-urlencoded";
		
	smsGetUserList.addEventListenerOnce("submit-done", onSms_getUserListSubmitDone);
	smsGetUserList.addEventListenerOnce("submit-error", onSms_getUserListSubmitError);
	smsGetUserList.addEventListenerOnce("submit-timeout", onSms_getUserListSubmitTimeout);
	
	
	var groupList = app.lookup("USMAG_treeGroup");
	var group = groupList.getSelectionFirst();
	
	// 검색 조건 세팅
	smsGetUserList.setParameters("searchCategory", searchCtrl.searchCategory);
	smsGetUserList.setParameters("searchKeyword", searchCtrl.searchKeyword);
	if (searchCtrl.searchKeyword != undefined && searchCtrl.searchKeyword.length > 0) {
		if (searchCtrl.searchCategory == "id" ) {
			
			var intID = parseInt(searchCtrl.searchKeyword, 10);
			smsGetUserList.setParameters("searchKeyword", String(intID));	
		} else if (searchCtrl.searchCategory == "name" || searchCtrl.searchCategory == "uniqueID" || searchCtrl.searchCategory == "partner") {
			if(searchCtrl.searchKeyword.length == 1){				
				dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_InvalidSearchLength"));
				return;
			}
			var intID = parseInt(searchCtrl.searchKeyword, 10);
			smsGetUserList.setParameters("searchKeyword", searchCtrl.searchKeyword);	
		} else {
			smsGetUserList.setParameters("searchCategory", searchCtrl.searchCategory);	
		}		
	} else {
		smsGetUserList.setParameters("searchCategory", "");
	}
	if (group != undefined && group.value != "") {
		smsGetUserList.setParameters("groupID", parseInt(group.value, 10));
	} else {
		smsGetUserList.setParameters("groupID", 0);
	}
	// 현대엠시트 향, 하위메뉴 조회 X
	if (dataManager.getOemVersion() == OEM_HYUNDAI_MSEAT) {
		smsGetUserList.setParameters("subInclude", "false");
	} else {
		// default는 true
		smsGetUserList.setParameters("subInclude", "true");
	}
		
	

	// 페이징 계산하여 요청
	smsGetUserList.setParameters("offset", offset);
	smsGetUserList.setParameters("limit", USMGR_pageRowCount);
	
	//2019-11-29 새로 추가한 소스
	var dm_ExportParam = app.lookup("dm_ExportParam");	
	if( dm_ExportParam.getValue("mode")=="export"){
		smsGetUserList.setParameters("offset", dm_ExportParam.getValue("offset"));
		smsGetUserList.setParameters("limit", ALEMP_recvRowPerExport);
	}
	//2019-11-29 추가 끝
	
	smsGetUserList.addResponseData(app.lookup("Result"), false, "Result");
	smsGetUserList.addResponseData(app.lookup("Total"), false, "Total");
	
	if(oemVersion == OEM_ITONE_TRDATA || oemVersion == OEM_ITONE_POSCO_DX){
		smsGetUserList.addResponseData(app.lookup("UserList_ITONE"), false, "UserList_ITONE");
	} else {
		smsGetUserList.addResponseData(app.lookup("UserList"), false, "UserList");
	}
	
	comLib.showLoadMask("",dataManager.getString("Str_UserListGet"),"",0);
	smsGetUserList.send();
}

// 사용자 리스트 가져오기 완료
function onSms_getUserListSubmitDone(/* cpr.events.CSubmissionEvent */ e){

	comLib.hideLoadMask();

	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode")
	if( resultCode == COMERROR_NONE){

		var sms_getUserList = e.control;
		var dsUserList;
		var udcUserList = app.lookup("USMAG_udcUserList");
		
		if(oemVersion == OEM_ITONE_TRDATA || oemVersion == OEM_ITONE_POSCO_DX){
			dsUserList = app.lookup("UserList_ITONE");
		} else {
			dsUserList = app.lookup("UserList");
		}

		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));

		var recvCount = dsUserList.getRowCount();
		
		for( var i = 0; i < recvCount ; i++){
			var userInfo = dsUserList.getRow(i);
			
			if(oemVersion == OEM_IDLINK_MBS){
				var areaID = userInfo.getValue("APBZone");
				var areaName = "";
				areaName = udcUserList.getAreaName(areaID);
				userInfo.setValue("APBZoneName", areaName);	
			}
			
			// 필수 / 선택 인증 정보 파싱
			var AuthType = userInfo.getValue("AuthInfo").split(',');

			var setCount = 0;
			var andAuth = "";
			for( var idx=0; idx < AuthType[7]; idx++ ){
				if(AuthType[idx]!="0"){
					andAuth += getAuthTypeString( parseInt(AuthType[idx],10))+" ";
					setCount++;
				}
			}
			var orAuth = "";
			for( var idx=AuthType[7]; idx< AuthType.length-1; idx++ ){
				if(AuthType[idx]!="0"){
					orAuth += getAuthTypeString( parseInt(AuthType[idx],10))+" ";
					setCount++;
				}
			}

			if( setCount > 1 ){
				userInfo.setValue("AuthInfo",andAuth+"/ "+orAuth);
			} else {
				userInfo.setValue("AuthInfo",andAuth+orAuth);
			}

		}
		
		//2019-11-29 신규 추가
		var dm_ExportParam = app.lookup("dm_ExportParam")
		if( dm_ExportParam.getValue("mode")=="export"){
			//var exportAuthLogList = app.lookup("ExportAuthLogList");
			
			//if(dsAuthLogList.getRowCount() == 0 ){
				comLib.hideLoadMask();
				if( dsUserList.getRowCount() >0 ){
					exportExcel();					
					dsUserList.clear();
				} else {
					dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
				}
			//}
			
			dm_ExportParam.setValue("mode", "list");
			sendUserListRequest();
		}
		//2019-11-29 신규 끝

		var totalLabel = app.lookup("opt_tot");
		totalLabel.value = totalCount;

		var viewPageCount = totalCount / USMGR_pageRowCount + (totalCount % USMGR_pageRowCount > 0);
		if (viewPageCount > 10) {
			viewPageCount = 10;
		}
		//console.log(dsUserList.getRowDataRanged());
		var udcUserList = app.lookup("USMAG_udcUserList");
		udcUserList.setUserList(dsUserList);
		udcUserList.setPaging(totalCount, USMGR_pageRowCount, viewPageCount);
		udcUserList.redraw();
	} else {
		//dialogAlert(app, "Waning", dataManager.getString("Str_UserListGet")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserListGet")+" "+dataManager.getString("Str_Failed")+"."+dataManager.getString(getErrorString(resultCode)));
	}

}

// 사용자 리스트 가져오기 submit-error 이벤트 발생 시 호출.
function onSms_getUserListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR);
}

// 사용자 리스트 가져오기 submit-timeout 이벤트 발생 시 호출.
function onSms_getUserListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// <<---------------------- 사용자 리스트 요청 관련 -------------------------

// 사용자 리스트 페이징 변경
function onUSMAG_udcUserListPagechange( /* cpr.events.CSelectionEvent */ e) {
	sendUserListRequest();
}

// 그룹 선택 변경시
function onUSMGR_treeGroupSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	var udcUserList = app.lookup("USMAG_udcUserList");
	udcUserList.setCurrentPageIndex(1);
	sendUserListRequest();
}

// 사용자 리스트 더블 클릭
function onUSMAG_udcUserListUserListDblclick( /* cpr.events.CGridEvent */ e) {
	var udcUserList = app.lookup("USMAG_udcUserList");
	var selectionRow = udcUserList.getSelectedRow(); 
	
	if(selectionRow=="D" || selectionRow=="ID"){
		return;
	}
	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: { "Target":DLG_USER_INFO, "ID": selectionRow.getValue("ID"), "Mode": "Modify", }
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

// 사용자 "추가" 버튼에서 click 이벤트 발생 시 호출.
function onUSMGR_btnRegistUserClick(/* cpr.events.CMouseEvent */ e){
	var uSMGR_btnRegistUser = e.control;
	var RequestData = app.lookup("sms_getNewUserID"); // TODO : 사용자 정보창에서 요청하도록 옮길것.
	RequestData.send();
}

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms_getNewUserIDSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var sms_getNewUserID = e.control;
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	var	userID = app.lookup("dmUserInfo").getValue("ID");
	if(ResultCode == 0 ) {
		var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
			content: {
				"Target":DLG_USER_INFO,
				"ID": userID,
				"Mode": "Add",
			}
		});

		app.getHostAppInstance().dispatchEvent(selectionEvent);
	} else {
		// 신규 ID를 얻어 올수 없습니다.
	}
}

// ---------------------- 사용자 삭제 관련 ------------------------->>

// 사용자 "삭제" 버튼에서 click 이벤트 발생 시 호출.
function onUSMGR_btnDeleteUserClick( /* cpr.events.CMouseEvent */ e) {
	var gridUserList = app.lookup("USMAG_udcUserList");
	var checkedRowIndices = gridUserList.getCheckedRowIndices();
	var delCount = checkedRowIndices.length;

	dataManager = getDataManager();
	if (delCount == 0) {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_UserNotSelected"));
		return
	} else {
		dialogConfirm(app.getRootAppInstance(), "", dataManager.getString("Str_DeleteConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue) {

					comLib.showLoadMask("pro",dataManager.getString("Str_UserDelete"),"",checkedRowIndices.length);

					var dsDeleteList = app.lookup("dsDeleteList");
					dsDeleteList.clear();

					for( var i = 0; i < delCount; i++){
						var delIndex = checkedRowIndices[i];
						var delUser = {"UserID":gridUserList.getUserID(delIndex),"rowIndex":delIndex};
						dsDeleteList.addRowData(delUser);
					}
					sendDeleteUser();

				} else {}
			});
		});
	}
}

// 사용자 삭제 요청 전송
function sendDeleteUser(){
	var dsDeleteList = app.lookup("dsDeleteList");
	if( dsDeleteList.getRowCount() == 0 ){
		comLib.hideLoadMask();
		dataManager = getDataManager();
		//dialogAlert(app, "Waning", dataManager.getString("Str_UserNotSelected"));
		return;
	}
	var dsUserID = dsDeleteList.getRow(0);
	var userID = dsUserID.getValue("UserID");

	var msg = dataManager.getString("Str_UserID")+ " : "+userID;
	comLib.updateLoadMask(msg);
	
	var sms_deleteUser = new cpr.protocols.Submission("sms_deleteUser");
	sms_deleteUser.action = "/v1/users/"+userID;
	sms_deleteUser.method = "delete";
	sms_deleteUser.mediaType = "application/x-www-form-urlencoded";
	sms_deleteUser.userAttr("uid", userID);
	sms_deleteUser.userAttr("rowIndex", dsUserID.getValue("rowIndex").toString());	
	sms_deleteUser.addResponseData(app.lookup("Result"), false, "Result");
	
	if (oemVersion == OEM_REMOTE_FAW_MANAGEMENT){
		var AuthType = app.lookup("UserList").findFirstRow("ID == " + userID).getValue("AuthInfo");
		if (AuthType.indexOf("FAW") != -1){
			sms_deleteUser.action += "?option=-1";
		}
		
	}
		
	sms_deleteUser.addEventListenerOnce("submit-done", onSms_deleteUserSubmitDone);
	sms_deleteUser.addEventListenerOnce("submit-error", onSms_deleteUserSubmitError);
	sms_deleteUser.addEventListenerOnce("submit-timeout", onSms_deleteUserSubmitTimeout);
	sms_deleteUser.send();
}

// 사용자 삭제 완료
function onSms_deleteUserSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/* @type cpr.protocols.Submission */
	var sms_deleteUser = e.control;
	
	var dsDeleteList = app.lookup("dsDeleteList");
	dsDeleteList.realDeleteRow(0);

	var gridUserList = app.lookup("USMAG_udcUserList");	

	var uid = sms_deleteUser.userAttr("uid");
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE || resultCode == COMERROR_USER_NOT_EXIST ){
		gridUserList.deleteRow( parseInt(sms_deleteUser.userAttr("rowIndex"),10));
		sendDeleteUser();
	} else {		
		comLib.hideLoadMask();
		dataManager = getDataManager();
		dialogAlert(app, dataManager.getString("Str_Failed"), 
			uid+ " "+dataManager.getString("Str_UserDelete")+" "+dataManager.getString("Str_Failed")+"."+dataManager.getString(getErrorString(resultCode)));
		
	}
}
// 사용자 삭제 실패
function onSms_deleteUserSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 사용자 삭제 타임아웃
function onSms_deleteUserSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// <<---------------------- 사용자 삭제 관련 -------------------------

// ---------------------- 동기화 함수  ------------------------->>
// 사용자 삭제 결과 콜백. 별도 오픈된 사용자 정보창에서 사용자 삭제시 발생.
exports.onUserUpdateSync = function( userInfo){
	var udcUserList = app.lookup("USMAG_udcUserList");
	udcUserList.updateUserInfo(userInfo);
}
// 사용자 삭제 결과 콜백. 별도 오픈된 사용자 정보창에서 사용자 삭제시 발생.
exports.onUserDeleteSync = function( userID ){
	var gridUserList = app.lookup("USMAG_udcUserList");
	gridUserList.deleteUser(userID);
}
// <<---------------------- 동기화 함수  -------------------------

// 도움말 페이지 클릭
function onUSMAG_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

/*
 * 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	
	switch (dataManager.getOemVersion()) {
	case OEM_JAWOONDAE:
		
		var totalLabel = app.lookup("opt_tot");
		var dmTotal = app.lookup("Total")
		var dm_ExportParam = app.lookup("dm_ExportParam")
		dm_ExportParam.setValue("mode", "export");
		dm_ExportParam.setValue("total", dmTotal.getValue("Count"));	
		dm_ExportParam.setValue("offset", 0);
		comLib.showLoadMask("pro",dataManager.getString("Str_UserExport"),"",parseInt(totalLabel.value)/1000);
		
		sendUserListRequest();
		
		break;
	case OEM_ND_POWER_PLANT:
	case OEM_HYUNDAI_EC:
	case OEM_HDEC_CW:
		// sms_getUserSyncCustom 서브미션 전송
		var smsGetUserSyncCustom = app.lookup("sms_getUserSyncCustom");
		smsGetUserSyncCustom.send();
 
		break;
	case OEM_MCD_TRDATA:
		var smsGetUserSyncCustom = app.lookup("sms_getUserSyncCustom");
		smsGetUserSyncCustom.send();
		break;
		
	case OEM_HE_CHUNGJU_FACTORY:
		var smsGetUserSyncCustom = app.lookup("sms_getUserSyncCustom");
		smsGetUserSyncCustom.send();
		break;
			
	default:
		dialogAlert(app, dataManager.getString("Str_Error"), dataManager.getString(getErrorString(ErrorOemVersion)) + ": " + dataManager.getOemVersion() );
		break;
	}
}

function getPrivilegeTypeString( value ){
	var type = "";
	switch ( value ){
		case 1: type = dataManager.getString("Str_Admin"); break;
		case 2: type = dataManager.getString("Str_NormalUser"); break;
		case 901 : type = dataManager.getString("Str_JwdOtherUnit"); break;
		case 902 : type = dataManager.getString("Str_JwdForeign"); break;
		case 903 : type = dataManager.getString("Str_JwdResident"); break;
		case 904 : type = dataManager.getString("Str_JwdAlways"); break;
		case 905 : type = dataManager.getString("Str_JwdSoldier"); break;
		case 906 : type = dataManager.getString("Str_JwdFamily"); break;
		default : return ""; break;
	}
	return type;
}

function exportExcel(){
	
	dataManager = getDataManager();
	var dsUserList = app.lookup("UserList");
	var total = dsUserList.getRowCount()
	
	for( var i = 0; i < total ; i++){
		var userInfo = dsUserList.getRow(i);
		
		
		var groupID = userInfo.getValue("GroupCode");		
		if(groupID != 0){
			var groupName = dataManager.getGroupName(groupID);		
			userInfo.setValue("GroupCode",groupName);
		}
		
		var AccessGroupCode = userInfo.getValue("AccessGroupCode");		
		if(AccessGroupCode != 0){
			var AccessGroupName = dataManager.getAccessGroupName(AccessGroupCode);		
			userInfo.setValue("AccessGroupCode",AccessGroupName);
		}
		
		var privilege = userInfo.getValue("Privilege");
		
			var privilegeName = getPrivilegeTypeString(parseInt(privilege));
			if(privilegeName != ""){
				userInfo.setValue("Privilege",privilegeName);			
			}else{
				privilegeName = dataManager.getPrivilegeName(privilege);		
				userInfo.setValue("Privilege",privilegeName);
			}
		
	}

	
	/* original data */
	var today = dateLib.getToday();
	var filename = "dsUserList_"+today+".xlsx";	
	var ws_name = "dsUserList_";
		
	var wb = XLSX.utils.book_new(), ws = XLSX.utils.json_to_sheet(dsUserList.getRowDataRanged());
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);

	XLSX.writeFile(wb, filename);	
}

// 카드로 사용자 검색 버튼 클릭
function onUSMGR_btnCardSearchClick(/* cpr.events.CMouseEvent */ e){	
	var appld = "app/main/users/userCardRegist"+ "?" + dataManager.getSystemVersion();
	app.getRootAppInstance().openDialog(appld, {width : 640, height : 490}, function(dialog){		
		
		var dsUserCardInfo = app.lookup("UserCardInfo");
		dialog.bind("headerTitle").toLanguage("Str_CardReading");
		dialog.initValue = {"UserID":"","UserCardInfo":dsUserCardInfo,"Mode":"Scan","Url":"/v1"};
		dialog.resizable = false;		
		dialog.modal = true;		
	}).then(function(returnValue){ // 지문 등록 화면에서 적용을 누른 경우에만 이 부분으로 들어옴.		
		if(returnValue.length>0){	
			var udcUserList = app.lookup("USMAG_udcUserList");
			udcUserList.setCurrentPageIndex(1);
	
			app.lookup("USMAG_udcSearchUser").searchCategory="card";
			app.lookup("USMAG_udcSearchUser").searchKeyword=returnValue[0].CardNum;		
			sendUserListRequest();
		}		
	});
}


/*
 * Body에서 keydown 이벤트 발생 시 호출.
 * 사용자가 키를 누를 때 발생하는 이벤트.
 */
function onBodyKeydown(/* cpr.events.CKeyboardEvent */ e){
	/*
		if (e.code == 'Enter') {
			var udcUserList = app.lookup("USMAG_udcUserList");
			udcUserList.setCurrentPageIndex(1);
			sendUserListRequest();	
		}
	*/
	// 엔터치면 검색을 두번씩 하고있었으므로 주석
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getUserSyncCustomSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getUserSyncCustom = e.control;
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
		alert( '동기화 요청 확인');	
		
		// 사용자 리스트 reload
		sendUserListRequest();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getUserSyncCustomSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getUserSyncCustom = e.control;
	
	console.log("onSms_getUserSyncCustomSubmitError");
	
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR);
	
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getUserSyncCustomSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getUserSyncCustom = e.control;
	
	console.log("onSms_getUserSyncCustomSubmitTimeout");
	
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);	
	
}
// 2021.10.06 
// 사용자 전체 삭제 기능 OptionPageUser로 이동
// visivle = false
//// 전체 사용자 삭제 클릭
//function onUSMGR_btnUserClearClick(/* cpr.events.CMouseEvent */ e){
//	if(dataManager.getOemVersion() == OEM_KANGWONLAND) {
//		dialogAlert(app, dataManager.getString("Str_Failed"), "강원랜드는 지원하지 않는 기능 입니다.");
//		return;	
//	}
//	
//	dialogConfirm(app.getRootAppInstance(), "", dataManager.getString("Str_UserDeleteAllConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
//		dialog.addEventListenerOnce("close", function(e) {
//			if (dialog.returnValue) {
//				comLib.showLoadMask("",dataManager.getString("Str_UserDelete"),"",0);
//
//				var sms_deleteUserAll = app.lookup("sms_deleteUserAll");
//				sms_deleteUserAll.send();
//
//			}else {}
//		});
//	});
//}
//
// 
// 
//// 사용자 전체 삭제 완료
//function onSms_deleteUserAllSubmitDone(/* cpr.events.CSubmissionEvent */ e){
//	comLib.hideLoadMask();
//	var resultCode = app.lookup("Result").getValue("ResultCode");
//	if( resultCode == COMERROR_NONE){		
//		sendUserListRequest();
//	} else {
//		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
//	}
//}
//
//// 사용자 전체 삭제 에러
//function onSms_deleteUserAllSubmitError(/* cpr.events.CSubmissionEvent */ e){
//	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
//}
//
//// 사용자 전체 삭제 타임아웃
//function onSms_deleteUserAllSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
//	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
//}

function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		var USMAG_udcUserList = app.lookup("USMAG_udcUserList");
		USMAG_udcUserList.setCurrentPageIndex(1);
		sendUserListRequest(); // 서버에 검색 조건에 따른 단말 리스트 요청		
	}
}

/*
 * 사용자 정의 컨트롤에서 searchKeydown 이벤트 발생 시 호출.
 */
//function onUSMAG_udcSearchUserSearchKeydown(/* cpr.events.CKeyboardEvent */ e){
//	if(e.keyCode == 13) {
//		var udcUserList = app.lookup("USMAG_udcUserList");
//		udcUserList.setCurrentPageIndex(1);
//		sendUserListRequest();		
//	}
//}

/*
 * 사용자 정의 컨트롤에서 searchKeyUp 이벤트 발생 시 호출.
 */
function onUSMAG_udcSearchUserSearchKeyUp(/* cpr.events.CAppEvent */ e){
	if(e.keyCode == 13) {
		var udcUserList = app.lookup("USMAG_udcUserList");
		udcUserList.setCurrentPageIndex(1);
		sendUserListRequest();		
	}
}


/* 현대엠시트 커스텀 기능 "백업사용자" 버튼(USMGR_btnBackupUserView)에서 click 이벤트 발생 시 호출. */
function onUSMGR_btnBackupUserViewClick(/* cpr.events.CMouseEvent */ e){	
	var appld = "app/custom/hyundai_mseat/users/userBackupList";
	app.getRootAppInstance().openDialog(appld, {width : 1100, height : 600}, function(dialog){		
		dialog.headerTitle = "백업 사용자 리스트"		
		dialog.resizable = true;		
		dialog.modal = true;		
	}).then(function(returnValue){ // 지문 등록 화면에서 적용을 누른 경우에만 이 부분으로 들어옴.		
		if(returnValue.length>0){
		}		
	});
}


/*
 * 아웃풋(opt_tot)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onOpt_totClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var opt_tot = e.control;
	cnt++;
	if((oemVersion == OEM_ITONE_TRDATA || oemVersion == OEM_ITONE_POSCO_DX) && dataManager.getAccountID() == 1000000000000000000){
		// 아이티원은 사용자 제거버튼 없애지만, 필요할 때가 있어 히든기능으로 삽입
		if(cnt == 5){
			app.lookup("USMGR_btnDeleteUser").visible = true;
		}
	}
}
