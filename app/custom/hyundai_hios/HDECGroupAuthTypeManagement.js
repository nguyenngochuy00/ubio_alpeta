/************************************************
 * HDECGroupAuthTypeManagement.js
 * Created at 2023. 6. 8. 오전 9:30:19.
 *
 * @author zxc
 ************************************************/

var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var inputValidManager = createInputValidator(app);
var userCntPerRequest = 2000;
var totalCount = 0;
var isSubInclude = false;
var usint_version;

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app.getHostAppInstance());
	usint_version = dataManager.getSystemVersion();
	
	var dsGroupList = app.lookup("GroupList");
	var groupList = dataManager.getGroup();
	
	groupList.copyToDataSet(dsGroupList);
	dsGroupList.addRowData({"Name":dataManager.getString("Str_All"),"GroupID":0});
	dsGroupList.commit();
	
	var treeGroup = app.lookup("HDECGroupList_treeGroup");
	treeGroup.redraw();
	
	var udcUserList = app.lookup("HDEC_udcUserList");
	udcUserList.deleteColumn([14,13,12,11,10,9,7,6,5,4,0]);
	
	sendUserListRequest();
	
}

function onHDECGroupList_treeGroupSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var udcUserList = app.lookup("HDEC_udcUserList");
	app.lookup("dmAuthType").clear();
	app.lookup("HDEC_opbAuthAnd").value = "";
	app.lookup("HDEC_opbAuthOr").value = "";
	udcUserList.setCurrentPageIndex(1);
	sendUserListRequest();
}

function sendUserListRequest() {

	var userList = app.lookup("HDEC_udcUserList");
	var curIndex = userList.getCurrentPageIndex();

	var pageRowCount = userList.getPageRowCount();
	var offset = (curIndex - 1) * pageRowCount;

	var groupList = app.lookup("HDECGroupList_treeGroup");
	var group = groupList.getSelectionFirst();

//	var searchCategory = app.lookup("userListGroup_cmbUserCategory").value;
//	var searchKeyword = app.lookup("userListGroup__ipbUserKeyword").value;

	// 검색 조건 세팅
//	var smsGetUserList = app.lookup("sms_getUserList");
	var getUserList = new cpr.protocols.Submission("sms_getUserList_New");
	getUserList.action = "/v1/users";
	getUserList.method = "GET";
	getUserList.mediaType = "application/x-www-form-urlencoded";

	app.lookup("Result").clear();
	app.lookup("Total").clear();
	app.lookup("UserList").clear();
	getUserList.addResponseData(app.lookup("Result"), false, "Result");
	getUserList.addResponseData(app.lookup("Total"), false, "Total");
	getUserList.addResponseData(app.lookup("UserList"), false, "UserList");
	
//	getUserList.setParameters("searchKeyword", searchKeyword);
//	if (searchKeyword != null && searchKeyword.length > 0) {
//		getUserList.setParameters("searchCategory", searchCategory);
//	} else {
//		getUserList.setParameters("searchCategory", "");
//	}
	if (group != null && group.value != "") {
		getUserList.setParameters("groupID", parseInt(group.value, 10));
	} else {
		getUserList.setParameters("groupID", 0);
	}
	getUserList.setParameters("subInclude", isSubInclude);	// 하위그룹 미포함

//	getUserList.setParameters("excludeGroup", _excludeGroup);

//	getUserList.setParameters("privilegeID", _privilegeID);

	// 페이징 계산하여 요청
	getUserList.setParameters("offset", offset);
	getUserList.setParameters("limit", pageRowCount);

	var fields = ["user_id","name", "unique_id", "auth_type"];
	getUserList.setParameters("fields", fields);

	comLib.showLoadMask("",dataManager.getString("Str_UserInfoLoading"),"",pageRowCount);
	
	
	getUserList.addEventListenerOnce("submit-done", onSms_getUserListSubmitDone);
	getUserList.addEventListenerOnce("submit-error", onSubmitError);
	getUserList.addEventListenerOnce("submit-timeout", onSubmitTimeout);

	getUserList.send();
	//
}

// 사용자 리스트 페이지 변경시
function onUserListGroup_udcUserListPagechange(/* cpr.events.CSelectionEvent */ e){
	sendUserListRequest();
}

// 사용자 리스트 가져오기 완료
function onSms_getUserListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");

	if( result.getValue("ResultCode")==0){
		var userList = app.lookup("HDEC_udcUserList");
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
					andAuth += getAuthTypeStringHDEC( parseInt(AuthType[idx],10))+" ";
					setCount++;
				}
			}
			var orAuth = "";
			for( var idx=AuthType[7]; idx< AuthType.length-1; idx++ ){
				if(AuthType[idx]!="0"){
					orAuth += getAuthTypeStringHDEC( parseInt(AuthType[idx],10))+" ";
					setCount++;
				}
			}

			if( setCount > 1 ){
				userInfo.setValue("AuthInfo",andAuth+"/ "+orAuth);
			} else {
				userInfo.setValue("AuthInfo",andAuth+orAuth);
			}
		}

		var pageRowCount = userList.getPageRowCount();
		var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
		if (viewPageCount > 5) {
			viewPageCount = 5;
		}

		userList.setTotalCount(totalCount);

		var opbTotal = app.lookup("userListGroup_opbUserTotal")
		opbTotal.value = totalCount;
		opbTotal.redraw();

		var dsGroupList = app.lookup("GroupList");

		for( var i = 0; i < dsUserList.getRowCount(); i++ ){
			var row = dsUserList.getRow(i);
			var groupInfo = dsGroupList.findFirstRow("GroupID =='"+row.getValue("GroupCode")+"'");
			if( groupInfo != null ){
				row.setValue("GroupCode",groupInfo.getValue("Name"));
			} else {
				row.setValue("GroupCode","None");
			}
		}

		var userList = app.lookup("HDEC_udcUserList");
		userList.setUserList(dsUserList);

		comLib.hideLoadMask();

		var userListUpdateEvent = new cpr.events.CEvent("userListUpdate", {

		});

		app.dispatchEvent(userListUpdateEvent);

	}else{
		comLib.hideLoadMask();
	
		// 검색 결과가 없는 경우
		if (result.getValue("ResultCode") == ErrorGroupNoSearchResult) {
			var userList = app.lookup("HDEC_udcUserList");
			userList.clearUserList();
			
			var opbTotal = app.lookup("userListGroup_opbUserTotal")
			opbTotal.value = 0;
			opbTotal.redraw();
		}
	}
}

function onSubmitError(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}


function onHDEC_btnAuthTypeModifyClick(/* cpr.events.CMouseEvent */ e){
	var dmAuthType = app.lookup("dmAuthType");
	// 필수 / 선택 인증 정보 파싱
	var AuthType = dmAuthType.getValue("AuthInfo").split(',');
	
	var andAuth = [];
	for (var idx = 0; idx < AuthType[7]; idx++) {
		andAuth[idx] = parseInt(AuthType[idx], 10);
	}
	var orAuth = [];
	var count = 0;
	for (var idx = AuthType[7]; idx < AuthType.length - 1; idx++) {
		orAuth[count++] = parseInt(AuthType[idx], 10);
	}
	var appld = "app/main/users/UserAuthTypeSet" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {
		width: 410,
		height: 500
	}, function(dialog) {
		dialog.initValue = {
			"AuthAnd": andAuth,
			"AuthOr": orAuth
		};
		dialog.bind("headerTitle").toLanguage("Str_AuthTypeSelect");
		dialog.modal = true;
	}).then(function(returnValue) {
		var strAuthType = "";
		var init = false;
		returnValue.forEach(function(authType) {
			if (init == false) {
				init = true
			} else {
				strAuthType += ","
			}
			strAuthType += authType
		});
		dmAuthType.setValue("AuthInfo", strAuthType);
		onDisplayAuthType();
		
	});
}

function onDisplayAuthType() {
	var dmAuthType = app.lookup("dmAuthType");
	// 필수 / 선택 인증 정보 파싱
	var AuthType = dmAuthType.getValue("AuthInfo").split(',');
	
	var fpExist = false;
	var andAuth = "";
	for (var idx = 0; idx < AuthType[7]; idx++) {
		var authType = parseInt(AuthType[idx], 10);
		var type = getAuthTypeStringHDEC(authType)
		andAuth += type + " ";
	}
	var orAuth = "";
	for (var idx = AuthType[7]; idx < AuthType.length - 1; idx++) {
		var authType = parseInt(AuthType[idx], 10);
		var type = getAuthTypeStringHDEC(authType)
		orAuth += type + " ";
	}
	
	app.lookup("HDEC_opbAuthAnd").value = andAuth;
	app.lookup("HDEC_opbAuthOr").value = orAuth;	
}


/*
 * 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
 */
function onHDEC_udcUserListPagechange(/* cpr.events.CSelectionEvent */ e){
	sendUserListRequest();
}


/*
 * 버튼(HDEC_btnSave)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onHDEC_btnSaveClick(/* cpr.events.CMouseEvent */ e){
	var smsPutUserGroupAuthType = app.lookup("sms_putUserGroupAuthType");
	
	var dmAuthType = app.lookup("dmAuthType");
	var groupList = app.lookup("HDECGroupList_treeGroup");
	var group = groupList.getSelectionFirst();
	var authType = dmAuthType.getValue("AuthInfo");
	
	// 유효성 검사
	if (authType == null || authType.length == 0) {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_UserAuthTypeAtLeastOne"));
		return
	}
	
	if (group != null && group.value != "") {
		dmAuthType.setValue("GroupCode", group.value);
	} else {
		dmAuthType.setValue("GroupCode", "0");
	}
	smsPutUserGroupAuthType.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postUserGroupAuthTypeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){
		var udcUserList = app.lookup("HDEC_udcUserList");
		udcUserList.setCurrentPageIndex(1);
		sendUserListRequest();
	} else {		
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));	
	}
}

function onSms_postUserGroupAuthTypeSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

function onSms_postUserGroupAuthTypeSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR);
}


function getAuthTypeStringHDEC(value) {
	switch(value) {
		case 1: return "지문"; break;
		case 2: return "카드"; break;
		case 3: return "패스워드"; break;
		case 4: return "얼굴"; break;
		case 5: return "모바일키"; break;	
	    case 6: return "홍채"; break;
		//case 7: return "QR"; break;
		case 8: return "지문카드"; break; //임시로 제외
		case 9: return "워크스루"; break;
	
		default : return ""; break;
	}
}

