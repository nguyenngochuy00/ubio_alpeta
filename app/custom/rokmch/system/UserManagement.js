/************************************************
 * UserManagement.js
 * Created at 2018. 10. 29. 오후 5:49:46.
 *
 * @author osm8667
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var USMGR_pageRowCount = 17;

var ALEMP_pageRowCount = 1000;
var ALEMP_recvRowPerExport = 20000;

// Body에서 load 이벤트 발생 시 호출.
function onBodyLoad( /* cpr.events.CEvent */ e) {
	
	comLib = createComUtil(app);
	dataManager = getDataManager();

	var udcUserList = app.lookup("USMAG_udcUserList");
	udcUserList.setPaging(0, 1, 10, USMGR_pageRowCount);	
	udcUserList.deleteColumn([13,12,11,10,9]);
	
	var initValue = app.getHost().initValue;

	var dsGroupList = app.lookup("GroupList");
	var groupList = dataManager.getGroup();
	groupList.copyToDataSet(dsGroupList);
	dsGroupList.addRowData({"Name":dataManager.getString("Str_All"),"GroupID":0});
	dsGroupList.commit();

	var treeGroup = app.lookup("USMAG_treeGroup");	
	treeGroup.redraw();
	
	app.lookup("USMAG_udcSearchUser").removeItem("groupName")
	app.lookup("USMAG_udcSearchUser").removeItem("accessGroupName")
	
		
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
	comLib.showLoadMask("",dataManager.getString("Str_UserListGet"),"",0);

	var udcUserList = app.lookup("USMAG_udcUserList");
	var curIndex = udcUserList.getCurrentPageIndex();
	var offset = (curIndex - 1) * USMGR_pageRowCount

	var searchCtrl = app.lookup("USMAG_udcSearchUser")
	var smsGetUserList = app.lookup("sms_getUserList");
	var groupList = app.lookup("USMAG_treeGroup");
	var group = groupList.getSelectionFirst();

	// 검색 조건 세팅
	smsGetUserList.setParameters("searchCategory", searchCtrl.searchCategory);
	smsGetUserList.setParameters("searchKeyword", searchCtrl.searchKeyword);
	if (searchCtrl.searchKeyword != undefined && searchCtrl.searchKeyword.length > 0) {
		if (searchCtrl.searchCategory == "id") {
			var intID = parseInt(searchCtrl.searchKeyword, 10);
			smsGetUserList.setParameters("searchKeyword", String(intID));	
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
	smsGetUserList.setParameters("subInclude", "true");

	// 페이징 계산하여 요청
	smsGetUserList.setParameters("offset", offset);
	smsGetUserList.setParameters("limit", USMGR_pageRowCount);
	
	//2019-11-29 새로 추가한 소스
	var dm_ExportParam = app.lookup("dm_ExportParam")	
	if( dm_ExportParam.getValue("mode")=="export"){
		smsGetUserList.setParameters("offset", dm_ExportParam.getValue("offset"));
		smsGetUserList.setParameters("limit", ALEMP_recvRowPerExport);
	}
	//2019-11-29 추가 끝
	
	smsGetUserList.send();
}

// 사용자 리스트 가져오기 완료
function onSms_getUserListSubmitDone(/* cpr.events.CSubmissionEvent */ e){

	comLib.hideLoadMask();

	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode")
	if( resultCode == COMERROR_NONE){

		var sms_getUserList = e.control;
		var dsUserList = app.lookup("UserList");

		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));

		var recvCount = dsUserList.getRowCount();
		for( var i = 0; i < recvCount ; i++){
			var userInfo = dsUserList.getRow(i);
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
					dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
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
		//dialogAlertAMHQ(app, "Waning", dataManager.getString("Str_UserListGet")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserListGet")+" "+dataManager.getString("Str_Failed")+"."+dataManager.getString(getErrorString(resultCode)));
	}

}

// 사용자 리스트 가져오기 submit-error 이벤트 발생 시 호출.
function onSms_getUserListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 사용자 리스트 가져오기 submit-timeout 이벤트 발생 시 호출.
function onSms_getUserListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// <<---------------------- 사용자 리스트 요청 관련 -------------------------

// 사용자 리스트 페이징 변경
function onUSMAG_udcUserListPagechange( /* cpr.events.CSelectionEvent */ e) {
	sendUserListRequest();
}

// 그룹 선택 변경시
function onUSMGR_treeGroupSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	sendUserListRequest();
}

// 사용자 리스트 더블 클릭
function onUSMAG_udcUserListUserListDblclick( /* cpr.events.CGridEvent */ e) {
	if(e.row.getStateString()=="D"||e.row.getStateString()=="ID"){
		return;
	}
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target":DLG_USER_INFO,
			"ID": e.row.getValue("ID"),
			"Mode": "Modify",
		}
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
		dialogAlertAMHQ(app, dataManager.getString("Str_Info"), dataManager.getString("Str_UserNotSelected"));
		return
	} else {
		dialogConfirmAMHQ(app.getRootAppInstance(), "", dataManager.getString("Str_DeleteConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
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
		//dialogAlertAMHQ(app, "Waning", dataManager.getString("Str_UserNotSelected"));
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
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), 
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
		// sms_getUserSyncCustom 서브미션 전송
		var smsGetUserSyncCustom = app.lookup("sms_getUserSyncCustom");
		smsGetUserSyncCustom.send();
 
		break;
	default:
		dialogAlertAMHQ(app, dataManager.getString("Str_Error"), dataManager.getString(getErrorString(ErrorOemVersion)) + ": " + dataManager.getOemVersion() );
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
		dialog.style.header.css("background-color", "#528443");	
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
		if (e.code == 'Enter') {
			var udcUserList = app.lookup("USMAG_udcUserList");
			udcUserList.setCurrentPageIndex(1);
			sendUserListRequest();	
		}
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
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
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

// 전체 사용자 삭제 클릭
function onUSMGR_btnUserClearClick(/* cpr.events.CMouseEvent */ e){
	if(dataManager.getOemVersion() == OEM_KANGWONLAND) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "강원랜드는 지원하지 않는 기능 입니다.");
		return;	
	}
	
	dialogConfirmAMHQ(app.getRootAppInstance(), "", dataManager.getString("Str_UserDeleteAllConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				comLib.showLoadMask("",dataManager.getString("Str_UserDelete"),"",0);

				var sms_deleteUserAll = app.lookup("sms_deleteUserAll");
				sms_deleteUserAll.send();

			}else {}
		});
	});
}

// 사용자 전체 삭제 완료
function onSms_deleteUserAllSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){		
		sendUserListRequest();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}

// 사용자 전체 삭제 에러
function onSms_deleteUserAllSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// 사용자 전체 삭제 타임아웃
function onSms_deleteUserAllSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}
