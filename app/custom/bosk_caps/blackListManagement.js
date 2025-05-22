/************************************************
 * UserManagement.js
 * Created at 2018. 10. 29. 오후 5:49:46.
 *
 * @author osm8667
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");

var comLib;
var USMGR_pageRowCount = 50;

// Body에서 load 이벤트 발생 시 호출.
function onBodyLoad( /* cpr.events.CEvent */ e) {

	comLib = createComUtil(app);
	dataManager = getDataManager();

	var udcUserList = app.lookup("USMAG_udcUserList");
	udcUserList.setPaging(0, 1, 10, USMGR_pageRowCount);

	var initValue = app.getHost().initValue;

	var udcSearchUser = app.lookup("USMAG_udcSearchUser");
	udcSearchUser.deleteAllItems();
	udcSearchUser.addItem("Str_All", "all");
	udcSearchUser.addItem("Str_ID", "id");
	udcSearchUser.addItem("Str_Name", "name");
	udcSearchUser.selectItem("all");
	
	sendBlackListRequest();
}

// ---------------------- 사용자 리스트 요청 관련 ------------------------->>

// 사용자 검색 요청
function onUSMGR_udcSearchUserSearch( /* cpr.events.CUIEvent */ e) {
	var udcUserList = app.lookup("USMAG_udcUserList");
	udcUserList.setCurrentPageIndex(1);
	sendBlackListRequest();
}

// 서버에 사용자 리스트 요청
function sendBlackListRequest() {
	comLib.showLoadMask("",dataManager.getString("Str_UserListGet"),"",0);

	var udcUserList = app.lookup("USMAG_udcUserList");
	var curIndex = udcUserList.getCurrentPageIndex();
	var offset = (curIndex - 1) * USMGR_pageRowCount

	var searchCtrl = app.lookup("USMAG_udcSearchUser")
	var smsGetBlackList = app.lookup("sms_getBlackList");
	/*
	var groupList = app.lookup("USMAG_treeGroup");
	var group = groupList.getSelectionFirst();
	*/
	// 검색 조건 세팅
	smsGetBlackList.setParameters("searchCategory", searchCtrl.searchCategory);
	smsGetBlackList.setParameters("searchKeyword", searchCtrl.searchKeyword);
	if (searchCtrl.searchKeyword != undefined && searchCtrl.searchKeyword.length > 0) {
		smsGetBlackList.setParameters("searchCategory", searchCtrl.searchCategory);
	} else {
		smsGetBlackList.setParameters("searchCategory", "");
	}
	/*
	if (group != undefined && group.value != "") {
		smsGetBlackList.setParameters("groupID", parseInt(group.value, 10));
	} else {
		smsGetBlackList.setParameters("groupID", 0);
	}*/
	smsGetBlackList.setParameters("subInclude", "true");

	// 페이징 계산하여 요청
	smsGetBlackList.setParameters("offset", offset);
	smsGetBlackList.setParameters("limit", USMGR_pageRowCount);
	smsGetBlackList.send();
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
		dialogAlert(app, "Waning", dataManager.getString("Str_UserListGet")+" : "+dataManager.getString(getErrorString(resultCode)));
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
	sendBlackListRequest();
}

// 그룹 선택 변경시
function onUSMGR_treeGroupSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	sendBlackListRequest();
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
		//dialogAlert(app, dataManager.getString("Str_Failed"), 
		//	uid+ " "+dataManager.getString("Str_UserDelete")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlert(app, dataManager.getString("Str_Failed"), 
			uid+ " "+dataManager.getString("Str_UserDelete")+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
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
 * 버튼(USMGR_btnReleaseBlackList)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSMGR_btnReleaseBlackListClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var uSMGR_btnReleaseBlackList = e.control;
	var sms_postBlackList = app.lookup("sms_postBlackList");
	
	var gridUserList = app.lookup("USMAG_udcUserList");
	var checkedRowIndices = gridUserList.getCheckedRowIndices();
	var releaseCount = checkedRowIndices.length;

	dataManager = getDataManager();
	if (releaseCount == 0) {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_UserNotSelected"));
		return
	} else {
		dialogConfirm(app.getRootAppInstance(), "", dataManager.getString("Str_ReleaseConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue) {

					comLib.showLoadMask("pro",dataManager.getString("Str_Release"),"",checkedRowIndices.length);

					var dsReleaseList = app.lookup("dsReleaseList");
					dsReleaseList.clear();

					for( var i = 0; i < releaseCount; i++){
						var releaseIndex = checkedRowIndices[i];
						var releaseBlackList = {"UserID":gridUserList.getUserID(releaseIndex),"rowIndex":releaseIndex};
						dsReleaseList.addRowData(releaseBlackList);
					}
					sendReleaseBlackList();

				} else {}
			});
		});
	}
}



// 사용자 삭제 요청 전송
function sendReleaseBlackList(){
	var dsReleaseList = app.lookup("dsReleaseList");
	if( dsReleaseList.getRowCount() == 0 ){
		comLib.hideLoadMask();
		dataManager = getDataManager();
		//dialogAlert(app, "Waning", dataManager.getString("Str_UserNotSelected"));
		return;
	}
	var dsUserID = dsReleaseList.getRow(0);
	var userID = dsUserID.getValue("UserID");

	var msg = dataManager.getString("Str_UserID")+ " : "+userID;
	comLib.updateLoadMask(msg);
	
	var sms_releaseBlackList = new cpr.protocols.Submission("sms_releaseBlackList");
	sms_releaseBlackList.action = "/v1/blacklists/"+userID+"/release";
	sms_releaseBlackList.method = "post";
	sms_releaseBlackList.mediaType = "application/x-www-form-urlencoded";
	sms_releaseBlackList.userAttr("uid", userID);
	sms_releaseBlackList.userAttr("rowIndex", dsUserID.getValue("rowIndex").toString());	
	sms_releaseBlackList.addResponseData(app.lookup("Result"), false, "Result");
		
	sms_releaseBlackList.addEventListenerOnce("submit-done", onSms_releaseBlackListSubmitDone);
	sms_releaseBlackList.addEventListenerOnce("submit-error", onSms_releaseBlackListSubmitError);
	sms_releaseBlackList.addEventListenerOnce("submit-timeout", onSms_releaseBlackListSubmitTimeout);
	sms_releaseBlackList.send();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_releaseBlackListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/* @type cpr.protocols.Submission */
	var sms_deleteUser = e.control;
	
	var dsReleaseList = app.lookup("dsReleaseList");
	dsReleaseList.realDeleteRow(0);

	var gridUserList = app.lookup("USMAG_udcUserList");

	var uid = sms_deleteUser.userAttr("uid");
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE || resultCode == COMERROR_USER_NOT_EXIST ){
		gridUserList.deleteRow( parseInt(sms_deleteUser.userAttr("rowIndex"),10));
		sendReleaseBlackList();
	} else {		
		comLib.hideLoadMask();
		dataManager = getDataManager();
		dialogAlert(app, dataManager.getString("Str_Failed"), 
			uid+ " "+dataManager.getString("Str_Release")+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_releaseBlackListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_releaseBlackListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}


/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSMAG_imgHelpPageClick2(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}


/*
 * 사용자 정의 컨트롤에서 searchKeydown 이벤트 발생 시 호출.
 */
function onUSMAG_udcSearchUserSearchKeydown(/* cpr.events.CAppEvent */ e){
	if(e.keyCode == 13) {
		var udcUserList = app.lookup("USMAG_udcUserList");
		udcUserList.setCurrentPageIndex(1);
		sendBlackListRequest();
	}
}
