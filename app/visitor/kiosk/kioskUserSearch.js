/************************************************
 * userSearch.js
 * Created at 2020. 2. 17. 오후 3:27:46.
 *
 * @author fois
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib = createComUtil(app);
var groupCode;
var SelectedRowData;

function onBodyLoad( /* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	// 현대 엠시트 - 공장(그룹 코드) 추가
	if (dataManager.getOemVersion() === OEM_HYUNDAI_MSEAT) {
		var initValue = app.getHost().initValue;
		groupCode = initValue["groupCode"];
		var label = initValue["factoryName"];
		if (label.length > 0) {
			app.lookup("op_factoryName").visible = true;
			app.lookup("op_factoryName").value = "(" + label + ")";
		}
	}
	app.lookup("VMTUS_grdUserList").sort("Name ASC");
	
	// 전시회 전용 (시작하자마자 바로 검색)
	app.lookup("VMTUS_ipbKeyword").value = "Admin";
	sendUserSearch();
}

// 서버로 사용자 검색 요청
function sendUserSearch() {
	// clear
	app.lookup("UserList").clear();
	app.lookup("VMTUS_grdUserList").redraw();
	
	var keyword = app.lookup("VMTUS_ipbKeyword").value
	if (keyword == null || keyword.length < 1) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_VisitUserSearchGuide"));
		return;
	}
	
	
	var sms_GetUserList = new cpr.protocols.Submission("sms_getUserList");
	sms_GetUserList.action = "/v1/visitor/users";
	sms_GetUserList.method = "get";
	sms_GetUserList.mediaType = "application/x-www-form-urlencoded";
	
	sms_GetUserList.addResponseData(app.lookup("Result"), false, "Result");
	sms_GetUserList.addResponseData(app.lookup("UserList"), false, "UserList");
	
	sms_GetUserList.setParameters("searchCategory", "name");
	sms_GetUserList.setParameters("searchKeyword", keyword);
	// smsGetUserList.setParameters("groupID", 0);
	var fields = ["user_id", "name", "group_code", "position_code"];
	sms_GetUserList.setParameters("fields", fields);
	sms_GetUserList.setParameters("groupCode", groupCode);
	
	sms_GetUserList.addEventListenerOnce("submit-done", onSms_getUserListSubmitDone);
	sms_GetUserList.addEventListenerOnce("submit-error", onSms_getUserListSubmitError);
	sms_GetUserList.addEventListenerOnce("submit-timeout", onSms_getUserListSubmitTimeout);
	
	comLib.showLoadMask("", dataManager.getString("Str_VisitUserSearching"), "", 0);
	sms_GetUserList.send();
}

// 검색 창에서 키 입력시
function onVMTUS_ipbKeywordKeyup( /* cpr.events.CKeyboardEvent */ e) {
	var vMTUS_ipbKeyword = e.control;
	if (e.keyCode == 13) { // 검색창에서 Enter 입력시..
		sendUserSearch();
	}
}

// 사용자 검색 완료
function onSms_getUserListSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	comLib.hideLoadMask();
	var dmResult = app.lookup("Result");
	if (dmResult.getValue("ResultCode") == COMERROR_NONE) {
		// 신청 결과 표시 후 메인 화면으로 이동
	} else {
		//에러 표시
		// 메모리디비에 사용자 없을 경우, 에러메세지 skip
		if (dmResult.getValue("ResultCode") != ErrorGroupNoSearchResult) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Failed"));
		}
	}
	if (dataManager.getOemVersion() === OEM_HYUNDAI_MSEAT) {
		// 현대 엠시트 접견자 직위 명칭 변경
		// G1, G2, G3 -> 매니저
		// G4, G5 -> 책임 메니저
		// 이 외 값은 기존 값 유지

		var userList = app.lookup("UserList");
		for ( var i=0; i < userList.getRowCount(); i++ ) {
			var position = userList.getRow(i).getValue("Position");
			var convertPosition = "";
			if (position == "G1" || position == "G2" || position == "G3") {
				convertPosition = "매니저";
			} else if (position == "G4" || position == "G5") {
				convertPosition = "책임 매니저";
			}
			if (convertPosition.length > 0) {
				userList.getRow(i).setValue("Position", convertPosition);
			}
		}
		userList.commit();
		app.lookup("VMTUS_grdUserList").sort("Name ASC");
	} else {
		app.lookup("VMTUS_grdUserList").sort("UserID ASC");
	}
}

// 사용자 검색 에러
function onSms_getUserListSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR)
}

// 사용자 검색 타임아웃
function onSms_getUserListSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT)
}

// 선택 사용자 적용
function onApply() {
	if (!SelectedRowData) {
		// app.close();
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitTargetInvalid"));
		return;
	}
	if (dataManager.getOemVersion() == OEM_HYUNDAI_MSEAT) {
		app.close([SelectedRowData, app.lookup("op_factoryName").value]);
		return;
	}
	app.close([SelectedRowData]);
}
// 사용자 리스트에서 더블 클릭
//function onVMTUS_grdUserListDblclick( /* cpr.events.CMouseEvent */ e) {
////	console.log(e);
////	console.log(e.currentTarget);
////	console.log(e.targetControl);
////	console.log(e.targetObject.relativeTargetName);
//	if (e.targetObject.relativeTargetName == "header") {
//		return;
//	}
//	onApply();
//}

// "적용" 버튼(VMVAP_btnApply)에서 click 이벤트 발생 시 호출.
function onVMVAP_btnApplyClick( /* cpr.events.CMouseEvent */ e) {
	onApply();
}

function onVMVAP_btnCancelClick( /* cpr.events.CMouseEvent */ e) {
	app.close();
}

/*
 * 그리드에서 row-dblclick 이벤트 발생 시 호출.
 * detail이 row를 더블클릭 한 경우 발생하는 이벤트.
 */
//function onVMTUS_grdUserListRowDblclick( /* cpr.events.CGridMouseEvent */ e) {
//	/** 
//	 * @type cpr.controls.Grid
//	 */
//	var vMTUS_grdUserList = e.control;
//	SelectedRowData = vMTUS_grdUserList.getSelectedRow().getRowData();
//	onApply();
//}

/*
 * 그리드에서 cell-click 이벤트 발생 시 호출.
 * Grid의 Cell 클릭시 발생하는 이벤트.
 */
function onVMTUS_grdUserListCellClick( /* cpr.events.CGridMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Grid
	 */
	var vMTUS_grdUserList = e.control;
	SelectedRowData = vMTUS_grdUserList.getSelectedRow().getRowData();
	onApply();
}

/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGroupClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	sendUserSearch();
}
