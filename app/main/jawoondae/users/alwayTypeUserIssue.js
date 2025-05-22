/************************************************
 * alwayTypeUserIssue.js
 * Created at 2020. 1. 2. 오전 9:27:23.
 *
 * @author joymrk
 ************************************************/
var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var ATUI_version;
function onBodyLoad(/* cpr.events.CEvent */ e){
	// 처음에 아무 사용자도 표시 없음
	dataManager = getDataManager();
	comLib = createComUtil(app.getHostAppInstance());
	var userList = app.lookup("ATUI_udcUserList");
	userList.deleteColumn([14,13,12,11,10,9,8,7,6,5,4]); 
	userList.setPaging(0,50,5);		
	userList.redraw();
	
	var cmbUserCategory = app.lookup("ATUI_cmbUserCategory");	
	cmbUserCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_ID"),"id"));
	cmbUserCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_Name"),"name"));
	cmbUserCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_UniqueID"),"uniqueID"));
	
//	app.lookup("JWACS_grdCardList").header.getColumn(0).style.css("visibility", "hidden");//상단 전체체크 해제 버튼 숨김
}

function onATUI_btnUserSearchClick(/* cpr.events.CMouseEvent */ e){
	var userList = app.lookup("ATUI_udcUserList");
	userList.clearUserList();
	userList.setCurrentPageIndex( 1 );
	sendUserListRequest();
}

function onATUI_udcUserListPagechange(/* cpr.events.CSelectionEvent */ e){
	sendUserListRequest();
}

function sendUserListRequest() {

	var userList = app.lookup("ATUI_udcUserList");
	var curIndex = userList.getCurrentPageIndex();

	var pageRowCount = userList.getPageRowCount();
	var offset = (curIndex - 1) * pageRowCount;

	var searchCategory = app.lookup("ATUI_cmbUserCategory").value;
	var searchKeyword = app.lookup("ATUI_ipbUserKeyword").value;
	if (searchKeyword.length == 0){
		return;
	}

	// 검색 조건 세팅
	var getUserList = new cpr.protocols.Submission("sms_getUserList");
	getUserList.action = "/v1/jawoondae/users/alwaysType";
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
	getUserList.setParameters("authlogCount", 0);
	var fields = ["user_id","name","unique_id"];
	getUserList.setParameters("fields", fields);

	//comLib.showLoadMask("",dataManager.getString("Str_ListLoading"),"",pageRowCount);
	
	getUserList.addEventListenerOnce("submit-done", onSms_getUserListSubmitDone);
	getUserList.addEventListenerOnce("submit-error", onSms_getUserListSubmitError);	
	getUserList.addEventListenerOnce("submit-timeout", onSms_getUserListSubmitTimeout);
	
	getUserList.send();
}	
	
function onSms_getUserListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	//comLib.hideLoadMask();
	
	var result = app.lookup("Result");
	if( result.getValue("ResultCode")==0){

		var userList = app.lookup("ATUI_udcUserList");
		var dsUserList = app.lookup("UserList");

		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));

		var pageRowCount = userList.getPageRowCount();
		var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
		if (viewPageCount > 5) {
			viewPageCount = 5;
		}

		userList.setTotalCount(totalCount);

		var opbTotal = app.lookup("ATUI_opbUserTotal")
		opbTotal.value = totalCount;
		opbTotal.redraw();
		
		userList.setUserList(dsUserList);				

	}else{		
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ListLoading"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
}

function onSms_getUserListSubmitError(/* cpr.events.CSubmissionEvent */ e){
var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_getUserListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}


function onATUI_btnIssueClick(/* cpr.events.CMouseEvent */ e){
	// 카드 발급 화면 전환
	
	var appld = "app/main/jawoondae/accessCard/accessCardSelectOne" + "?" + ATUI_version;
	app.getRootAppInstance().openDialog(appld, {width : 520, height : 450}, function(dialog){
		dialog.ready(function(dialogApp){
			dialog.bind("headerTitle").toLanguage("Str_PassList");
				dialog.initValue = {"PopupType": "SingleCheck"}; // 카드 발급 타입
			dialog.modal = true;
		});
	}).then(function(returnValue){
		if (returnValue != undefined && returnValue["cardNum"].toString().length > 0 ) {
			var issuetype = returnValue["OutTroopsIssueType"];
			if (issuetype == 1) {
				dialogAlert(app, dataManager.getString("Str_Failed"), "상시타입 사용자는 개인공무원증 발급으로 진행 할수 없습니다.");
				return;
			}
			var cardNumber = returnValue["cardNum"];
			var dmIssueInfo = app.lookup("IssueCardInfo");			
			dmIssueInfo.setValue("CardNumber", cardNumber);
			dmIssueInfo.setValue("IssueType", issuetype); // 0 : 공무,교육같은 별도 출입증 타입
			
			sendAlwaysTypeIssue();
		}
	});	
}

function sendAlwaysTypeIssue() {
	
	var checkedUserInfo = app.lookup("ATUI_udcUserList");
	var userInfo = app.lookup("UserInfo");
	var checkedIndices = checkedUserInfo.getCheckedRowIndices();
	if (checkedIndices.length <= 0 ) {
		dialogAlert(app, "알림", "선택된 사용자가 없습니다.");
		return;
	}
	var rowidx = checkedIndices[0];
	var userID = checkedUserInfo.getUserID(rowidx);
	userInfo.setValue("UserID", userID);
			
	var tmpStr =  dataManager.getString("Str_AlwaysTypeCardIssue") + " " + dataManager.getString("Str_Issued");
	comLib.showLoadMask("",tmpStr,"",0);
	// 사용자ID, 카드번호, 출입증 타입
	var smspostAlwaysTypeIssue = app.lookup("sms_postAlwaysTypesIssue");
	smspostAlwaysTypeIssue.action = "/v1/visitRequest/alwaysType/issue";
	smspostAlwaysTypeIssue.send();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postAlwaysTypesIssueSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		dialogAlert(app, "알림", "고정카드 발급이 완료 되었습니다.");
	} else {
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_AlwaysTypeCardIssue";
		if (resultCode < ERROR_ACCESS_PERIOD) {// 일반버전 에러
			errMsg = dataManager.getString(errStr);
		} else { //커스텀 에러
			errMsg = errStr;
		}
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
	}
}				
function onSms_postAlwaysTypesIssueSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_postAlwaysTypesIssueSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * Body에서 keydown 이벤트 발생 시 호출.
 * 사용자가 키를 누를 때 발생하는 이벤트.
 */
function onBodyKeydown(/* cpr.events.CKeyboardEvent */ e){
	if(dataManager.getOemVersion() == OEM_JAWOONDAE){
		if (e.code == 'Enter') {
			var userList = app.lookup("ATUI_udcUserList");
			userList.clearUserList();
			userList.setCurrentPageIndex( 1 );
			sendUserListRequest();
		}
	}
}
