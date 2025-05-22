/************************************************
 * UserManagement.js
 * Created at 2018. 10. 29. 오후 5:49:46.
 *
 * @author osm8667
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var USMGR_pageRowCount = 50;

// Body에서 load 이벤트 발생 시 호출.
function onBodyLoad( /* cpr.events.CEvent */ e) {

	comLib = createComUtil(app);
	dataManager = getDataManager();

	var udcUserList = app.lookup("USMAG_udcUserList");
	udcUserList.setPaging(0, 1, 10, USMGR_pageRowCount);

	var initValue = app.getHost().initValue;

	var dsGroupList = app.lookup("GroupList");
	var groupList = dataManager.getGroup();
	groupList.copyToDataSet(dsGroupList);

	var treeGroup = app.lookup("USMAG_treeGroup");
	treeGroup.addItem(new cpr.controls.TreeItem(dataManager.getString("Str_All"), 0));
	treeGroup.redraw();
 
	sendUserListRequest();
	
	udcUserList.deleteColumn([14,13,12,11,10,9,8,7,6,5,4,0]);
	
	var PassType = app.getHostProperty("initValue");
	var ELMGR_dtStart = app.lookup("ELMGR_dtStart");
	var ELMGR_dtEnd = app.lookup("ELMGR_dtEnd");
	var today = new Date();
	var year = today.getFullYear();
    var month = today.getMonth();
    var day = today.getDate();
	ELMGR_dtStart.value = dateLib.makeDateFormat(dateLib.getToday(),"-");
	ELMGR_dtEnd.value = dateLib.makeDateFormat(dateLib.getToday(),"-");
	ELMGR_dtStart.minDate.setFullYear(year, month, day);
	ELMGR_dtEnd.minDate.setFullYear(year, month, day);
	ELMGR_dtStart.enabled = false;
	switch(PassType){
			case "0" :  // 현역
				
				break;
			case "1" :  //임시 -> 3개월
				var minDate = dateLib.addDay(dateLib.getToday(),90);
				ELMGR_dtEnd.minDate.setFullYear(minDate.substring(0,4), minDate.substring(4,6)-1, minDate.substring(6,8));
				ELMGR_dtEnd.value = dateLib.makeDateFormat(minDate,"-");
				break;
			case "2" : // 교육
				
				break; 
			case "3" : // 공무 -> 하루
				ELMGR_dtEnd.enabled = false;
				break;
			case "4" : // 상주 
				
				break;
			case "5" :  // 상시 -> 하루
				ELMGR_dtEnd.enabled = false;
				break;
			case "6" :  // 병사
				
				break;
			case "7" :  // 방문 -> 하루
				ELMGR_dtEnd.enabled = false;
				break;
			case "8" :  // 가족
				
				break;
			default : 
				break;
	}
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
		smsGetUserList.setParameters("searchCategory", searchCtrl.searchCategory);
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
		dialogAlert(app, "Waning", dataManager.getString("Str_UserListGet")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
	}
	
	//console.log(app.lookup("UserList").getRowDataRanged());

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
	var UserID = e.row.getValue("ID");
	var UserUniqueID = e.row.getValue("UniqueID");
	var UserName = e.row.getValue("Name");
	var ELMGR_dtStart = app.lookup("ELMGR_dtStart").value;
	var ELMGR_dtEnd = app.lookup("ELMGR_dtEnd").value;
	var UserCardInfo = app.lookup("UserCardInfo");
	UserCardInfo.clear();
		
	var dm_IssuedUserInfo = app.lookup("dm_IssuedUserInfo");
	var submission = app.lookup("smsUserInfoReq");
	
	submission.action = "/v1/users/"+e.row.getValue("ID");		
	submission.send();
	
	submission.addEventListenerOnce("submit-done", function(e){	
	
		var UserCardInfo = app.lookup("UserCardInfo");
		if(UserCardInfo.getRowCount() >= 5){
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_AlterPassRegistNumberExcessed"));
			return;
		}else{
			if(dateLib.compareDate(ELMGR_dtStart, ELMGR_dtEnd) == 0){
				dialogAlert(app, dataManager.getString("Str_Failed"), "시작 일자가 종료 일자보다 큽니다.");
				return;
			}
		
			//알페타 날짜 선택에서 오늘 날짜는 yyyy-mm-dd 형태이지만 날짜를 바꾸면 yyyymmdd 형태로 바뀌기 때문에 넣어준 소스
			if(ELMGR_dtEnd.indexOf("-") != -1){
			
			}else{
				ELMGR_dtEnd = dateLib.makeDateFormat(ELMGR_dtEnd,"-");
			}
			var USMAG_udcUserList = app.lookup("USMAG_udcUserList");
	
	
			dialogConfirm(app, "", UserID+" "+dataManager.getString("Str_PassIssuedConfirm"), function(/*cpr.controls.Dialog*/dialog){
				dialog.addEventListenerOnce("close", function(e) {
					if (dialog.returnValue) {
						app.close({"ID":UserID, "UniqueID":UserUniqueID,"Name":UserName,"ELMGR_dtStart":ELMGR_dtStart,"ELMGR_dtEnd":ELMGR_dtEnd});
					} else {
						return;
					}
				});
			})
		}		
	});
	
	submission.addEventListenerOnce("submit-error", function(e){	
		var result = app.lookup("Result")
		result.setValue("ResultCode",COMERROR_NET_ERROR)
	});
					
	submission.addEventListenerOnce("submit-timeout", function(e){	
		var result = app.lookup("Result")
		result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
	});
	
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
		dialogConfirm(app.getRootAppInstance(), "", "삭제 하시겠습니까?", function( /*cpr.controls.Dialog*/ dialog) {
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
		dialogAlert(app, dataManager.getString("Str_Failed"), 
			uid+ " "+dataManager.getString("Str_UserDelete")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
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
 * "" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onPassIssuedButtonClick(/* cpr.events.CMouseEvent */ e){
	
	
}


/*
 * 사용자 정의 컨트롤에서 search 이벤트 발생 시 호출.
 */
function onUSMAG_udcSearchUserSearch(/* cpr.events.CUIEvent */ e){
	var udcUserList = app.lookup("USMAG_udcUserList");
	udcUserList.setCurrentPageIndex(1);
	sendUserListRequest();
}

