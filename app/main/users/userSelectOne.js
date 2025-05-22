/************************************************
 * userSelectOne.js
 * Created at 2019. 9. 23. 오후 3:18:44.
 *
 * @author fois
 ************************************************/
var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var initDelColunm;
var initFields;
var loginUserGroupCode; 
var oemVersion;

// Body에서 load 이벤트 발생 시 호출.
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app.getHostAppInstance());
	oemVersion = dataManager.getOemVersion();
//	loginUserGroupCode = getLoginUserGroupCode();
	
	var initValue = app.getHost().initValue;
	if (initValue == null){	// initValue가 없는 경우 default 세팅
		initDelColunm = [14,13,12,11,10,9,8,7,6,5,4];
		initFields = ["user_id","name","unique_id","privilege","position_code"];
	} else {
		initDelColunm = initValue["DelColunm"];
		initFields = initValue["Fields"];	
	}
	var userList = app.lookup("USO_udcUserList");
	userList.deleteColumn(initDelColunm);
	userList.setPaging(0,50,5);		
	userList.redraw();	
	
	var dsGroupList = app.lookup("GroupList");
	var groupList = dataManager.getGroup();
	
	groupList.copyToDataSet(dsGroupList);	
	dsGroupList.addRowData({"GroupID":0,"Parent":"","Name":dataManager.getString("Str_All"),"Description":""});
	
	var treeGroup = app.lookup("USO_treeGroup");
	
	// 육본인 경우 본인 + 자식 그룹만 보이도록 -mjy
//	if(dataManager.getOemVersion() == OEM_ARMY_HQ){
//		
//		// Master, 최상위그룹 관리자가 아닌 경우는 본인 그룹으로 자동 선택되고, 다른 그룹 선택 안되도록
//		if(dataManager.getAccountID() != 1000000000000000000 || !isSuperGroupAdmin()) {
//			treeGroup.selectItemByValue(getLoginUserGroupCode());
//			treeGroup.readOnly = true;
//		} 
//	}
	
	treeGroup.redraw();
	
	var cmbUserCategory = app.lookup("USO_cmbUserCategory");
	if (oemVersion == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH){ // 육군본부향은 사용자 id 검색 조건 삭제
		app.lookup("tapFolder").getTabItemByID(1).bind("text").toLanguage("Str_ARMY_UserGroup1");
		cmbUserCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_Name"),"name"));
		cmbUserCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_UniqueID"),"uniqueID"));		
	} else if (oemVersion == OEM_HYUNDAI_HI){
		cmbUserCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_ID"),"id"));
		cmbUserCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_Name"),"name"));
		cmbUserCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_UniqueID"),"uniqueID"));
		cmbUserCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_PartnerName"),"partner"));
		sendUserListRequest();
	} else {
		cmbUserCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_ID"),"id"));
		cmbUserCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_Name"),"name"));
		cmbUserCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_UniqueID"),"uniqueID"));
		sendUserListRequest();	
	}
	// 군가족 검색 - 처음엔 공란으로 두기
	//sendUserListRequest();
}

// 페이지 변경
function onUSO_udcUserListPagechange(/* cpr.events.CSelectionEvent */ e){
	sendUserListRequest();
}

// 검색
function onUSO_btnUserSearchClick(/* cpr.events.CMouseEvent */ e){
	var userList = app.lookup("USO_udcUserList");
	userList.setCurrentPageIndex( 1 );
	sendUserListRequest();
}

function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		var userList = app.lookup("USO_udcUserList");
		userList.setCurrentPageIndex( 1 );
		sendUserListRequest();		
	}
}

function sendUserListRequest() {

	var userList = app.lookup("USO_udcUserList");
	var curIndex = userList.getCurrentPageIndex();

	var pageRowCount = userList.getPageRowCount();
	var offset = (curIndex - 1) * pageRowCount;

	var groupList = app.lookup("USO_treeGroup");
	var group = groupList.getSelectionFirst();

	var searchCategory = app.lookup("USO_cmbUserCategory").value;
	var searchKeyword = app.lookup("USO_ipbUserKeyword").value;

	// 검색 조건 세팅
	var getUserList = new cpr.protocols.Submission("sms_getUserList");
	getUserList.action = "/v1/users";
	getUserList.method = "GET";
	getUserList.mediaType = "application/x-www-form-urlencoded";
	
	getUserList.addResponseData(app.lookup("Result"), false, "Result");
	getUserList.addResponseData(app.lookup("Total"), false, "Total");
	getUserList.addResponseData(app.lookup("UserList"), false, "UserList");
	
	getUserList.setParameters("searchKeyword", searchKeyword);
	if (searchKeyword != null && searchKeyword.length > 0) {
		if (searchCategory == "partner"){
			if (searchKeyword.length < 2){
				dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_InvalidSearchLength"));
				return;
			}
		}
		getUserList.setParameters("searchCategory", searchCategory);
	} else {
		getUserList.setParameters("searchCategory", "");
	}
	
	// 내 부서만 조회기능  -mjy
	if (dataManager.getOemVersion() == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH) { //육본일 경우만 로그인한 사용자의 그룹으로 고정
//		if(dataManager.getAccountID() != 1000000000000000000){ // Master가 아니면 본인 부서만 검색되게
//			getUserList.setParameters("groupID", loginUserGroupCode);
//		} else { // Master일 경우 일반향과 똑같이.
			if (group != null && group.value != "") {
				getUserList.setParameters("groupID", parseInt(group.value, 10));
			} else {
				getUserList.setParameters("groupID", 0);
			}
//		}
	} else {
		if (group != null && group.value != "") {
			getUserList.setParameters("groupID", parseInt(group.value, 10));
		} else {
			getUserList.setParameters("groupID", 0);
		}
	}
	
	getUserList.setParameters("subInclude", "true");

	// 페이징 계산하여 요청
	getUserList.setParameters("offset", offset);
	getUserList.setParameters("limit", pageRowCount);
	getUserList.setParameters("fields", initFields);	

	//comLib.showLoadMask("",dataManager.getString("Str_ListLoading"),"",pageRowCount);
	
	getUserList.addEventListenerOnce("submit-done", onSms_getUserListSubmitDone);
	getUserList.addEventListenerOnce("submit-error", onSms_getUserListSubmitError);	
	getUserList.addEventListenerOnce("submit-timeout", onSms_getUserListSubmitTimeout);
	
	getUserList.send();
}

// 사용자 리스트 가져오기 완료
function onSms_getUserListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	//comLib.hideLoadMask();
	
	var result = app.lookup("Result");
	if( result.getValue("ResultCode")==0){

		var userList = app.lookup("USO_udcUserList");
		var dsUserList = app.lookup("UserList");

		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));

		var pageRowCount = userList.getPageRowCount();
		var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
		if (viewPageCount > 5) {
			viewPageCount = 5;
		}

		userList.setTotalCount(totalCount);

		var opbTotal = app.lookup("USO_opbUserTotal")
		opbTotal.value = totalCount;
		opbTotal.redraw();
		
		userList.setUserList(dsUserList);				

	}else{		
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

// 선택 버튼 클릭
function onUSO_btnUserSelectClick(/* cpr.events.CMouseEvent */ e){	
	var userList = app.lookup("USO_udcUserList");
	if (dataManager.getOemVersion() == OEM_HYUNDAI_HI){
		var indeices = userList.getCheckedRowIndices();
		if (indeices == null || indeices.length < 1){
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserNotSelected"));
		} else if (indeices.length > 1){
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserNotMultiSelected"));
		} else {
			var rowData = userList.getSelectedRowData();
			var dsUserInfo = app.lookup("UserInfo");
			dsUserInfo.clear();
			dsUserInfo.setValue("ID", rowData["ID"]);
			dsUserInfo.setValue("UniqueID", rowData["UniqueID"]);
			dsUserInfo.setValue("Name", rowData["Name"]);
			dsUserInfo.setValue("Privilege", rowData["Privilege"]);
			dsUserInfo.setValue("GroupCode", rowData["GroupCode"]);
			dsUserInfo.setValue("Department", rowData["Department"]);
			var smsGetCustomInfo = app.lookup("sms_getCustomHDHI");
			smsGetCustomInfo.action = "/v1/hdhi/users/" + rowData["ID"];
			app.lookup("UserCustomHDHI").clear();
			smsGetCustomInfo.send();
		}
		
	} else {
		app.close(userList.getSelectedRowData());					
	}
}


/*
 * 트리에서 selection-change 이벤트 발생 시 호출.
 * 선택된 Item 값이 저장된 후에 발생하는 이벤트.
 */
function onUSO_treeGroupSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var userList = app.lookup("USO_udcUserList");
	
	userList.setCurrentPageIndex( 1 );
	sendUserListRequest();	
	
}

exports.setMultiCheck = function(isMulti){
	var userListGrid = app.lookup("USO_udcUserList");
	userListGrid.callAppMethod("setMultiCheck", isMulti);
}

function onUSO_ipbUserKeywordFocus(/* cpr.events.CFocusEvent */ e){
//	if(app.lookup("USO_cmbUserCategory").value == "partner"){
//		var appld = "app/custom/hyundai_hi/users/UserPartnerSelect";
//		app.getRootAppInstance().openDialog(appld, {
//			width: 410,
//			height: 500
//		}, function(dialog) {
//			dialog.bind("headerTitle").toLanguage("Str_PartnerSelect");
//			dialog.modal = true;
//		}).then(function(returnValue) {
//			if( returnValue != null ){
//				var dsPartnerInfo = app.lookup("PartnerInfo");
//				dsPartnerInfo.clear();
//				dsPartnerInfo.setValue("PartnerID", returnValue.getValue("PartnerID"));
//				dsPartnerInfo.setValue("PartnerName", returnValue.getValue("PartnerName"));
//				app.lookup("USO_ipbUserKeyword").value = dsPartnerInfo.getValue("PartnerName");
//			}
//		});
//	}
}

function onSms_getCustomHDHISubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	if(result.getValue("ResultCode") == COMERROR_NONE){
		var dmCustom = app.lookup("UserCustomHDHI");
		if(dmCustom != null){
			var userInfo = app.lookup("UserInfo");
			userInfo.setValue("PartnerID", dmCustom.getValue("PartnerID"));
			app.close(userInfo.getDatas());
		}			

	}else{		
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
}
