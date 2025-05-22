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
var unVisibleColunm;
var searchType;
// Body에서 load 이벤트 발생 시 호출.
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app.getHostAppInstance());
	
	var initValue = app.getHost().initValue;
	if (initValue == null){	// initValue가 없는 경우 default 세팅
		initDelColunm = [14,13,12,11,10,9,8,7,6,5,4];
		initFields = ["user_id","name","unique_id","privilege","position_code"];
	} else {
		initDelColunm = initValue["DelColunm"];
		initFields = initValue["Fields"];
		unVisibleColunm = initValue["UnVisibles"];
		searchType = initValue["SearchType"];
		console.log(searchType);	
	}

	var userList = app.lookup("AMHQ_udcUserList");
	userList.deleteColumn(initDelColunm);
	userList.unVisibleColumn(unVisibleColunm);
	userList.setPaging(0,50,5);		
	userList.redraw();	
	
	var dsGroupList = app.lookup("GroupList");
	var groupList = dataManager.getGroup();
	
	groupList.copyToDataSet(dsGroupList);	
	dsGroupList.addRowData({"GroupID":0,"Parent":"","Name":dataManager.getString("Str_All"),"Description":""});	
	var treeGroup = app.lookup("USO_treeGroup");
	treeGroup.redraw();
	
	var cmbUserCategory = app.lookup("USO_cmbUserCategory");
	
	if(dataManager.getOemVersion() != OEM_ARMY_HQ && dataManager.getOemVersion() != OEM_ROKMCH){
		cmbUserCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_ID"),"id"));
	}
	cmbUserCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_Name"),"name"));
	cmbUserCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_UniqueID"),"uniqueID"));
	cmbUserCategory.value = "name";
	
	// 방문신청 시 방문대상자 선택할 때 처음에는 리스트에 마무도 뜨지 않도록 하기 위해 수정 - pse
	if (searchType == "NO"){ 
		searchType = 10000;
	} else {
		sendUserListRequest();
	}
	
}

// 페이지 변경
function onUSO_udcUserListPagechange(/* cpr.events.CSelectionEvent */ e){
	sendUserListRequest();
}

// 검색
function onUSO_btnUserSearchClick(/* cpr.events.CMouseEvent */ e){
	var userList = app.lookup("AMHQ_udcUserList");
	userList.setCurrentPageIndex( 1 );
	sendUserListRequest();
}

function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		var userList = app.lookup("AMHQ_udcUserList");
		userList.setCurrentPageIndex( 1 );
		sendUserListRequest();		
	}
}

function sendUserListRequest() {

	var userList = app.lookup("AMHQ_udcUserList");
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

	// 페이징 계산하여 요청
	getUserList.setParameters("offset", offset);
	getUserList.setParameters("limit", pageRowCount);
	getUserList.setParameters("fields", initFields);
	if (searchType != undefined) {
		getUserList.setParameters("userType", searchType);
	}
	
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
	if( result.getValue("ResultCode")==COMERROR_NONE){

		var userList = app.lookup("AMHQ_udcUserList");
		var dsUserList = app.lookup("UserList");

		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));

		var pageRowCount = userList.getPageRowCount();
		var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
		if (viewPageCount > 5) {
			viewPageCount = 5;
		}

		userList.setTotalCount(totalCount);

		var opbTotal = app.lookup("USO_opbUserTotal");
		opbTotal.value = totalCount;
		opbTotal.redraw();
		
		userList.setUserList(dsUserList);				

	}else{		
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));
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
	var userList = app.lookup("AMHQ_udcUserList");
	app.close(userList.getSelectedRowData());	
}


/*
 * 트리에서 selection-change 이벤트 발생 시 호출.
 * 선택된 Item 값이 저장된 후에 발생하는 이벤트.
 */
function onUSO_treeGroupSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var userList = app.lookup("AMHQ_udcUserList");
	userList.setCurrentPageIndex( 1 );
	sendUserListRequest();	
}
