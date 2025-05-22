/************************************************
 * userSelectOne.js
 * Created at 2019. 9. 23. 오후 3:18:44.
 *
 * @author fois
 ************************************************/
var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");

// Body에서 load 이벤트 발생 시 호출.
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app.getHostAppInstance());
	
	var userList = app.lookup("USO_udcUserList");
	userList.deleteColumn([14,13,12,11,10,9,8,6,4]); 
	userList.setPaging(0,50,5);		
	userList.redraw();	
		
	var cmbUserCategory = app.lookup("USO_cmbUserCategory");
	cmbUserCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_ID"),"id"));
	cmbUserCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_Name"),"name"));
	cmbUserCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_UniqueID"),"uniqueID"));
	cmbUserCategory.value = "name";
	//sendUserListRequest(); 이걸 추가 왜하냐
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

function sendUserListRequest() {

	var userList = app.lookup("USO_udcUserList");
	var curIndex = userList.getCurrentPageIndex();

	var pageRowCount = userList.getPageRowCount();
	var offset = (curIndex - 1) * pageRowCount;

	var searchCategory = app.lookup("USO_cmbUserCategory").value;
	var searchKeyword = app.lookup("USO_ipbUserKeyword").value;
	if (searchKeyword.Length== 0){
		return;
	}

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
	
	getUserList.setParameters("groupID", 0);	
	getUserList.setParameters("subInclude", "true");

	// 페이징 계산하여 요청
	getUserList.setParameters("offset", offset);
	getUserList.setParameters("limit", pageRowCount);

	var fields = ["user_id","name","unique_id","group_code","position_code"];
	getUserList.setParameters("fields", fields);

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
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ListLoading"));
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
	var checkedRowIndices = userList.getCheckedRowIndices();
	var selCount = checkedRowIndices.length;

	if (selCount == 0) {
		dialogAlert(app, dataManager.getString("Str_Info"), "선택된 인솔자가 없습니다.");
		return
	} else 	if (selCount > 1) {
		dialogAlert(app, dataManager.getString("Str_Info"), "복수의 인솔자가 선택 되었습니다.");
		return
	} else {
		var index = checkedRowIndices[0];
		app.close(userList.getRowData(index));	
	}
}
