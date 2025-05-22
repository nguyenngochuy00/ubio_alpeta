/************************************************
 * TerminalUser.js
 * Created at 2019. 1. 11. 오후 2:30:52.
 *
 * @author joymrk
 ************************************************/
var comLib;
var selectTerminalID;
var selectUserID;

var TMUSR_pageRowCount = 50;
var TMUSR_userCountPerRequest = 10; // 한번에 가져올 사용자 ID,Name 리스트. 단말에서 최대 10명씩만 보냄
var dataManager = cpr.core.Module.require("lib/DataManager");
var usint_version;

var TMUSR_SyncFlag = 0;
var TMUSR_SyncIndex = 0;
var TMUSR_TerminalID = 0;
var TMUSR_udcChecks = null;

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	
	var udcTerminalList = app.lookup("TMUSR_udcTerminalList");	
	udcTerminalList.deleteColumn([13,12,11,10,9,8,7,6,5,4,3]); //체크 기능 추가	
	udcTerminalList.setPaging(0,1,5,TMUSR_pageRowCount);
	
	var dsTerminalList = dataManager.getTerminalList();

	udcTerminalList.setTerminalListGroup(dsTerminalList,"connect");
	
	//udcTerminalList.setTerminalList(dsTerminalList,"");
		
	var udcServerUserList = app.lookup("TMUSR_udcServerUserList");	
	//udcServerUserList.deleteColumn([14,13,12,11,10,9,8,7,6,5,4]);
	udcServerUserList.deleteColumn([14,13,12,11,10,9,8,7,6,5,4,1]);
	
	udcServerUserList.setPaging(0,1,5,TMUSR_pageRowCount);	
	
	var udcTerminalUserList = app.lookup("TMUSR_udcTerminalUserList");	
	//udcTerminalUserList.deleteColumn([14,13,12,11,10,9,7,6,5,4,3]);
	udcTerminalUserList.deleteColumn([14,13,12,11,10,9,7,6,5,4,3,1]);
	udcTerminalUserList.enablePageIndexer(false);
	
	app.lookup("TMUSR_btnUserIDInfoRequest").visible = true;
	
}

// 단말기 리스트에서 단말 클릭 시
function onTMUSR_udcTerminalListTerminalListClick(/* cpr.events.CSelectionEvent */ e){	
	/** @type cpr.data.Row */
	var terminalInfo = e.newSelection;
	// app.lookup("TMUSR_udcTerminalList").setUnCheckAll(); // 단말기 다중 선택 가능하도록 주석처리
	
	var dsUserList = app.lookup("UserList");
	dsUserList.clear();
	
	var udcTerminalUserList = app.lookup("TMUSR_udcTerminalUserList");
	udcTerminalUserList.clearUserList();
	
	var dmTerminalInfo = app.lookup("TerminalInfo");
	dmTerminalInfo.setValue("ID",terminalInfo.getValue("ID"));
	sendServerUserListRequest();
}

// 서버 기준 단말 사용자 리스트 PageChange 이벤트 발생
function onTMUSR_udcServerUserListPagechange(/* cpr.events.CSelectionEvent */ e){
	sendServerUserListRequest();	
}
// 서버 기준 단말 사용자 리스트 요청
function sendServerUserListRequest(){
	comLib.showLoadMask("",dataManager.getString("Str_UserListGet"),"",0);
	
	var dmTerminalInfo = app.lookup("TerminalInfo");
	var terminalID = dmTerminalInfo.getValue("ID");
	
	var udcServerUserList = app.lookup("TMUSR_udcServerUserList");
	var curIndex = udcServerUserList.getCurrentPageIndex();
	var offset = (curIndex - 1) * TMUSR_pageRowCount
	
	var sms_getTerminalServerUserList = app.lookup("sms_getTerminalServerUserList");
	sms_getTerminalServerUserList.action = "/v1/terminals/"+terminalID+"/users"
	sms_getTerminalServerUserList.setParameters("offset", offset);
	sms_getTerminalServerUserList.setParameters("limit", TMUSR_pageRowCount);
	sms_getTerminalServerUserList.send();
}

// 서버 기준 단말 사용자 리스트 완료
function onSms_getTerminalServerUserListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode")
	if( resultCode == COMERROR_NONE){
		var sms_getUserList = e.control;
		var dsUserList = app.lookup("UserList");
		
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		app.lookup("TMUSR_ipbServerUserCount").value = totalCount;
	
		var viewPageCount = totalCount / TMUSR_pageRowCount + (totalCount % TMUSR_pageRowCount > 0);
		if (viewPageCount > 3) {
			viewPageCount = 3;
		}
		
		var udcUserList = app.lookup("TMUSR_udcServerUserList");
		udcUserList.setUserList(dsUserList);	
		udcUserList.setPaging(totalCount, TMUSR_pageRowCount, viewPageCount);
		udcUserList.redraw();
		
		if (TMUSR_SyncFlag == 1) {
			sendSyncTerminalUsers();
		}
	} else {
		//dialogAlertAMHQ(app, "Waning", dataManager.getString("Str_UserListGet")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserListGet")+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
}

// 서버 기준 단말 사용자 리스트 에러
function onSms_getTerminalServerUserListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 서버 기준 단말 사용자 리스트 타임아웃
function onSms_getTerminalServerUserListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 단말기 사용자 추가
function onTMUSR_btnUserAddClick(/* cpr.events.CMouseEvent */ e){
	var udcTerminalList = app.lookup("TMUSR_udcTerminalList");
	var terminalID = udcTerminalList.getSelectedTerminalID();
	if( terminalID == ""){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalNotSelected"));
		return;
	}
	var dsUserIDList = app.lookup("UserIDList");
	var totalCount;
	var dmDownloadInfo = app.lookup("DownloadInfo");
	
	var appld = "app/main/users/UserSelect" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {width : 900, height : 500}, function(dialog){		
		dialog.initValue = {"ExcludeGroup":-1};
		dialog.bind("headerTitle").toLanguage("Str_UserSelect");
		dialog.style.header.css("background-color", "#528443");
		dialog.modal = true;
	}).then(function(/*cpr.data.DataSet*/idMap){
		dsUserIDList.clear();
		idMap.forEach(function(value,key){
			dsUserIDList.addRowData({"ID":key});
		});
			
		totalCount = dsUserIDList.getRowCount();
		dmDownloadInfo.setValue("Total", totalCount);
		comLib.showLoadMask("pro",dataManager.getString("Str_UserAdd"),"",totalCount);
		sendTerminalUserAdd();				
	});
}


// 단말기 사용자 추가 요청
function sendTerminalUserAdd(){
	var dsUserIDList = app.lookup("UserIDList");
	var count = dsUserIDList.getRowCount();
	if (count < 1 ){
		if (TMUSR_SyncFlag == 0) {
			comLib.hideLoadMask();
			sendServerUserListRequest();
			return;
		} else {
			TMUSR_SyncIndex++;
			comLib.hideLoadMask();
			sendSyncGetUsers();
			return;
		}
	}
	
	var userInfo = dsUserIDList.getRow(0);
	var userID = userInfo.getValue("ID");
	dsUserIDList.realDeleteRow(0);
		
	var dmTerminalInfo = app.lookup("TerminalInfo");
	var terminalID = dmTerminalInfo.getValue("ID");
	
	var dmResult = app.lookup("Result");
		
	var sms_postTerminalUser = new cpr.protocols.Submission("sms_postTerminalUser");
	sms_postTerminalUser.userAttr("userID", String(userID));
	sms_postTerminalUser.action = "/v1/terminals/"+terminalID+"/users/"+userID;	
	sms_postTerminalUser.method = "post";
	sms_postTerminalUser.mediaType = "application/x-www-form-urlencoded";
		
	sms_postTerminalUser.addEventListenerOnce("submit-done", onSms_postTerminalUserSubmitDone);
	sms_postTerminalUser.addEventListenerOnce("submit-error", onSms_postTerminalUserSubmitError);
	sms_postTerminalUser.addEventListenerOnce("submit-timeout", onSms_postTerminalUserSubmitTimeout);
	
	var dmDownloadInfo = app.lookup("DownloadInfo");
	var total = dmDownloadInfo.getValue("Total");
	dmDownloadInfo.setValue("Offset",total-count+1 );
	sms_postTerminalUser.addRequestData(dmDownloadInfo, "DownloadInfo");
	sms_postTerminalUser.addResponseData(dmResult);
		
	sms_postTerminalUser.send();	
}

// 단말기 사용자 추가 완료
function onSms_postTerminalUserSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode");
	
	var sms_postTerminalUser = e.control;
	var userID = sms_postTerminalUser.userAttr("userID");

	if (TMUSR_SyncFlag == 0) {
		comLib.updateLoadMask(userID);	
	} else {
		comLib.updateLoadMask("단말기 [" + TMUSR_TerminalID + "]: " + userID);
	}		
	
	sendTerminalUserAdd();
}

// 단말기 사용자 추가 에러
function onSms_postTerminalUserSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 단말기 사용자 추가 타임아웃
function onSms_postTerminalUserSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 단말기 사용자 삭제
function onTMUSR_btnUserRemoveClick(/* cpr.events.CMouseEvent */ e){
	
	var udcTerminalList = app.lookup("TMUSR_udcTerminalList");
	var terminalID = udcTerminalList.getSelectedTerminalID();
	if( terminalID == ""){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalNotSelected"));
		return;
	}
	
	var udcServerUserList = app.lookup("TMUSR_udcServerUserList");
	var chkIndices = udcServerUserList.getCheckedRowIndices();
	if( chkIndices.length == 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserNotSelected"));
		return;
	}
	
	var dsUserIDList = app.lookup("UserIDList");
	dsUserIDList.clear();// 요청데이터 초기화 
	
	chkIndices.forEach(function(index){
		var row = udcServerUserList.getRow(index);
		dsUserIDList.addRowData(row.getRowData());
	});
	var total = dsUserIDList.getRowCount();
	comLib.showLoadMask("pro", dataManager.getString("Str_UserDelete"), "", total);
	
	sendTerminalUserDelete("S");	
}

function sendTerminalUserDelete(delType){
	var dsUserIDList = app.lookup("UserIDList");
	var count = dsUserIDList.getRowCount();
	if (count < 1 ){
		comLib.hideLoadMask();
		return;
	}
	
	var userInfo = dsUserIDList.getRow(0);
	var userID = userInfo.getValue("ID");
	dsUserIDList.realDeleteRow(0);
		
	var dmTerminalInfo = app.lookup("TerminalInfo");
	var terminalID = dmTerminalInfo.getValue("ID");
		
	var dmResult = app.lookup("Result");
	if (delType == "S") {
		var sms_deleteTerminalUser = new cpr.protocols.Submission("sms_deleteTerminalUser");
		sms_deleteTerminalUser.userAttr("userID", String(userID));
		sms_deleteTerminalUser.userAttr("delType", delType);
		
		sms_deleteTerminalUser.action = "/v1/terminals/"+terminalID+"/users/"+userID;
		sms_deleteTerminalUser.method = "delete";
		sms_deleteTerminalUser.mediaType = "application/x-www-form-urlencoded";
			
		sms_deleteTerminalUser.addEventListenerOnce("submit-done", onSms_deleteTerminalUserSubmitDone);
		sms_deleteTerminalUser.addEventListenerOnce("submit-error", onSms_deleteTerminalUserSubmitError);
		sms_deleteTerminalUser.addEventListenerOnce("submit-timeout", onSms_deleteTerminalUserSubmitTimeout);
		sms_deleteTerminalUser.addResponseData(dmResult);
		sms_deleteTerminalUser.send();	
	} else {
		var sms_deleteTerminalUser = new cpr.protocols.Submission("sms_deleteTerminalUser");
		sms_deleteTerminalUser.userAttr("userID", String(userID));
		sms_deleteTerminalUser.userAttr("delType", delType);
		
		sms_deleteTerminalUser.action = "/v1/terminals/"+terminalID+"/terminalusers/"+userID;
		sms_deleteTerminalUser.method = "delete";
		sms_deleteTerminalUser.mediaType = "application/x-www-form-urlencoded";
			
		sms_deleteTerminalUser.addEventListenerOnce("submit-done", onSms_deleteTerminalUserSubmitDone);
		sms_deleteTerminalUser.addEventListenerOnce("submit-error", onSms_deleteTerminalUserSubmitError);
		sms_deleteTerminalUser.addEventListenerOnce("submit-timeout", onSms_deleteTerminalUserSubmitTimeout);
		sms_deleteTerminalUser.addResponseData(dmResult);
		sms_deleteTerminalUser.send();
	}
	
	
}

// 단말기 사용자 삭제 완료.
function onSms_deleteTerminalUserSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode")
	if( resultCode == COMERROR_NONE){
		var sms_deleteTerminalUser = e.control;
		var userID = sms_deleteTerminalUser.userAttr("userID");
		var delType = sms_deleteTerminalUser.userAttr("delType");
		if (delType == "S") {
			var udcServerUserList = app.lookup("TMUSR_udcServerUserList");
			udcServerUserList.deleteUser(userID);
			comLib.updateLoadMask(userID);
			sendTerminalUserDelete(delType);	
		} else {
			var udcTerminalUserList = app.lookup("TMUSR_udcTerminalUserList");
			udcTerminalUserList.deleteUser(userID);
			comLib.updateLoadMask(userID);
			sendTerminalUserDelete(delType);
		}
		
		
	} else {
		comLib.hideLoadMask();
		//dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserDelete")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserDelete")+" "+dataManager.getString(getErrorString(resultCode)));
	}
}

// 단말기 사용자 삭제 에러
function onSms_deleteTerminalUserSubmitError(/* cpr.events.CSubmissionEvent */ e){	
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 단말기 사용자 삭제 타임아웃
function onSms_deleteTerminalUserSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){	
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 사용자 ID 정보 가져오기 클릭시
function onTMUSR_btnUserIDInfoRequestClick(/* cpr.events.CMouseEvent */ e){
	
	var udcTerminalList = app.lookup("TMUSR_udcTerminalList");
	var terminalID = udcTerminalList.getSelectedTerminalID();
	if( terminalID == ""){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalNotSelected"));
		return;
	}
	
	var dsUserInfoList = app.lookup("TerminalUserInfo");
	dsUserInfoList.clear();
	var udcTerminalUserList = app.lookup("TMUSR_udcTerminalUserList");
	udcTerminalUserList.clearUserList();
	
	comLib.showLoadMask("", dataManager.getString("Str_UserListGet"), "", 10);
	var dmTerminalInfo = app.lookup("TerminalInfo");
	dmTerminalInfo.setValue("ID",terminalID);
	
	var sms_get_terminalUserCounts = app.lookup("sms_get_terminalUserCounts");
	sms_get_terminalUserCounts.action = "/v1/terminalUsers/" + terminalID + "/count";
	sms_get_terminalUserCounts.send();
}

// 단말기 사용자 카운트 가져오기 완료
function onSms_get_terminalUserCountsSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	if( result.getValue("ResultCode")==0){	
		comLib.hideLoadMask();
		
		var dmUserCount = app.lookup("TerminalCount");
		dmUserCount.setValue("Offset",0);		
		var userCount = dmUserCount.getValue("Count");
		console.log("userCount"+ userCount);
		if( userCount > 0 ){
			var total = userCount / TMUSR_userCountPerRequest; // 단말에서 한번에 10명만 주므로 
			if( userCount % TMUSR_userCountPerRequest != 0 ){
				total++;
			}
						
			comLib.showLoadMask("pro", dataManager.getString("Str_UserListGet"), "", total);
			// 사용자 정보 요청
			onTerminalUserInfoRequest();			
		}		
	}else{		
		comLib.hideLoadMask();
		//dialogAlertAMHQ(app, dataManager.getString("Str_UserListGet"),dataManager.getString("Str_Failed")+" ("+result.getValue("ResultCode")+")");	
		dialogAlertAMHQ(app, dataManager.getString("Str_UserListGet"),dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
}

// 단말기 사용자 카운트 가져오기 에러
function onSms_get_terminalUserCountsSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",-1);		
}

// 단말기 사용자 카운트 가져오기 타임아웃
function onSms_get_terminalUserCountsSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",-2);
}

function onTerminalUserInfoRequest(){
	
	var dmUserCount = app.lookup("TerminalCount");	
	var userCount = dmUserCount.getValue("Count");
	var offset = dmUserCount.getValue("Offset");
	
	if( offset >= userCount ){
		comLib.hideLoadMask();
		return
	}
		
	var reqCount = userCount-offset;
	if (reqCount > TMUSR_userCountPerRequest){
		reqCount = TMUSR_userCountPerRequest;
	}
	
	comLib.updateLoadMask(dataManager.getString("Str_UserListGet"));
			
	var dmTerminalInfo = app.lookup("TerminalInfo");
	var terminalID = dmTerminalInfo.getValue("ID");

	// 사용자 ID,Name 리스트 가져오기 
	
	
	var dmResult = app.lookup("Result");
	var dsTerminalUserInfo = app.lookup("TerminalUserInfo");
	
	var sms_get_terminalUserInInfo =  new cpr.protocols.Submission("sms_get_terminalUserInInfo");		
	sms_get_terminalUserInInfo.method = "GET";
	sms_get_terminalUserInInfo.mediaType = "application/x-www-form-urlencoded";
	sms_get_terminalUserInInfo.action = "/v1/terminalUsers/" + terminalID + "/info";
	
	sms_get_terminalUserInInfo.setParameters("offset", offset);
	sms_get_terminalUserInInfo.setParameters("limit", reqCount);
	//console.log(offset,reqCount);
	
	sms_get_terminalUserInInfo.addResponseData(dmResult);
	sms_get_terminalUserInInfo.addResponseData(dsTerminalUserInfo,true);
	
	sms_get_terminalUserInInfo.addEventListenerOnce("submit-done", onSms_get_terminalUserInInfoSubmitDone);
	sms_get_terminalUserInInfo.addEventListenerOnce("submit-error", onSms_get_terminalUserInInfoSubmitError);
	sms_get_terminalUserInInfo.addEventListenerOnce("submit-timeout", onSms_get_terminalUserInInfoSubmitTimeout);
		
	sms_get_terminalUserInInfo.send();
}

// 사용자 ID 가져오기 완료
function onSms_get_terminalUserInInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var result = app.lookup("Result");
	if( result.getValue("ResultCode")==0){	
		
		var dsUserInfoList = app.lookup("TerminalUserInfo");
		
		var dmUserCount = app.lookup("TerminalCount");	
		var userCount = dmUserCount.getValue("Count");
		var offset = dmUserCount.getValue("Offset");
		offset += TMUSR_userCountPerRequest;
		dmUserCount.setValue("Offset",offset);	
		//console.log(dmUserCount.getDatas());	
		//console.log(dsUserInfoList.getRowDataRanged());
		
		if( offset < userCount ){
			onTerminalUserInfoRequest();
		} else {
			var count = dsUserInfoList.getRowCount();
			for( var i = 0; i < count; i++ ){
				var userInfo = dsUserInfoList.getRow(i);
				var authType = userInfo.getValue("AuthInfo").split(',');
				
				var andAuth = "";
				for( var idx=0; idx < authType[7]; idx++ ){		
					var authTypeValue = parseInt(authType[idx],10);
					var type = getAuthTypeString(authTypeValue)
					andAuth += type+" ";		
				}
				var orAuth = "";	
				for( var idx=authType[7]; idx< authType.length-1; idx++ ){		
					var authTypeValue = parseInt(authType[idx],10);
					var type = getAuthTypeString(authTypeValue)
					orAuth += type+" ";
				}	
				userInfo.setValue("AuthInfo",andAuth+"/"+orAuth);
			}
	
			var udcUserList = app.lookup("TMUSR_udcTerminalUserList");
			udcUserList.setUserList(dsUserInfoList);		
			comLib.hideLoadMask();			
			app.lookup("TMUSR_ipbTerminalUserCount").value = dsUserInfoList.getRowCount();
		}	
		
	}else{
		comLib.hideLoadMask();
		//dialogAlertAMHQ(app, dataManager.getString("Str_UserListGet"),dataManager.getString("Str_Failed")+" ("+result.getValue("ResultCode")+")");
		dialogAlertAMHQ(app, dataManager.getString("Str_UserListGet"),dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(result.getValue("ResultCode"))));	
	}
}

// 사용자 ID 가져오기 submit-error 
function onSms_get_terminalUserInInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",-1);		
}

// 사용자 ID 가져오기 서브미션에서 submit-timeout 이벤트 발생 시 호출. 
function onSms_get_terminalUserInInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",-2);
}

// 단말 사용자 가져오기 클릭
function onTMUSR_btnUserDataRequestClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var tMUSR_btnUserDataRequest = e.control;
	var grdUdcUserList = app.lookup("TMUSR_udcTerminalUserList");
	
	var CheckedRowIndices = grdUdcUserList.getCheckedRowIndices();
	
	if( dataManager.getSystemBrandType()==BRAND_VRIDI){ // virdi 타입은 가져올 사용자 아이디를 직접 지정하므로 사용자 선택 여부 체크
		if( CheckedRowIndices.length == 0){
			dialogAlertAMHQ(app, dataManager.getString("Str_Info"), dataManager.getString("Str_SelectCallUpUser"),"");
			return;
		}
	}
	
	var ReqUserList = app.lookup("UserIDList");
	ReqUserList.clear();// 요청데이터 초기화 
	CheckedRowIndices.forEach(function(index){
		var row = grdUdcUserList.getRow(index);
		ReqUserList.addRowData(row.getRowData());
	});
	//ReqUserList.commit();
	
	onTerminalUserDataRequest();
	// 	RequestData.action = "/v1/terminalUsers/" + terminalID + "/data";
}

function onTerminalUserDataRequest(){
		
	var dmTerminalInfo = app.lookup("TerminalInfo");
	var terminalID = dmTerminalInfo.getValue("ID");
	
	var ReqUserList = app.lookup("UserIDList");
	var total = ReqUserList.getRowCount();
	comLib.showLoadMask("pro", dataManager.getString("Str_UserDataUpload"), "", 10);
	//console.log(ReqUserList.getRowDataRanged());
			
	var dmResult = app.lookup("Result");
	
	var sms_put_terminalUserData =  new cpr.protocols.Submission("sms_put_terminalUserData");		
	sms_put_terminalUserData.method = "PUT";
	sms_put_terminalUserData.mediaType = "application/x-www-form-urlencoded";
	sms_put_terminalUserData.action = "/v1/terminalUsers/" + terminalID + "/data";
	
	sms_put_terminalUserData.addResponseData(dmResult);
	sms_put_terminalUserData.addRequestData(ReqUserList, "UserIDList");
	
	sms_put_terminalUserData.addEventListenerOnce("submit-done", onSms_put_terminalUserDataSubmitDone);
	sms_put_terminalUserData.addEventListenerOnce("submit-error", onSms_put_terminalUserDataSubmitError);
	sms_put_terminalUserData.addEventListenerOnce("submit-timeout", onSms_put_terminalUserDataSubmitTimeout);
		
	sms_put_terminalUserData.send();
}

// 단말 사용자 가져오기 완료
function onSms_put_terminalUserDataSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	if( result.getValue("ResultCode")==0){	
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_TerminalUserDateUploadSuccess"));
	}else{		
		//dialogAlertAMHQ(app, dataManager.getString("Str_UserDataUpload"),dataManager.getString("Str_Failed")+" ("+result.getValue("ResultCode")+")");	
		dialogAlertAMHQ(app, dataManager.getString("Str_UserDataUpload"),dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
	comLib.hideLoadMask();
}

// 단말 사용자 가져오기 에러
function onSms_put_terminalUserDataSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",-1);
}

// 단말 사용자 가져오기 타임아웃
function onSms_put_terminalUserDataSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",-2);
}


// 도움말
function onTMUSR_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}




/*
 * 버튼(TMUSR_btnUserDataDelete)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */

function onTMUSR_btnUserDataDeleteClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var tMUSR_btnUserDataDelete = e.control;
	var udcTerminalList = app.lookup("TMUSR_udcTerminalList");
	var terminalID = udcTerminalList.getSelectedTerminalID();
	if( terminalID == ""){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalNotSelected"));
		return;
	}
	
	var grdUdcUserList = app.lookup("TMUSR_udcTerminalUserList");
	
	var CheckedRowIndices = grdUdcUserList.getCheckedRowIndices();
	
	if( dataManager.getSystemBrandType()==BRAND_VRIDI){ // virdi 타입은 가져올 사용자 아이디를 직접 지정하므로 사용자 선택 여부 체크
		if( CheckedRowIndices.length == 0){
			dialogAlertAMHQ(app, dataManager.getString("Str_Info"), dataManager.getString("Str_UserNotSelected"),"");
			return;
		}
	}
	var ReqUserList = app.lookup("UserIDList");
	ReqUserList.clear();// 요청데이터 초기화 
	CheckedRowIndices.forEach(function(index){
		var row = grdUdcUserList.getRow(index);
		ReqUserList.addRowData(row.getRowData());
	});
	var total = ReqUserList.getRowCount();
	comLib.showLoadMask("pro", dataManager.getString("Str_UserDelete"), "", total);
	
	sendTerminalUserDelete("T");
}

/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTMUSR_btnUserSearchClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var tMUSR_btnUserSearch = e.control;
	var reg = /[\{\}\[\]\/?.,;:|\)`^\<>@\#$%&\\\=\(\'\"]/gi;
	
	var keyword = app.lookup("TMUSR_ipbUserKeyword").value;
	if (keyword == undefined ||keyword.length <= 0) {
		//선택 해제
	} else {
		if (reg.test(keyword)) {
			// 들어가 있으면 입력불가능한 특수 문자 입니다.
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorSpecialCharacters"));
			return;
		}
		var category = app.lookup("TMUSR_cmbUserCategory").value;
		var udcServerUserList = app.lookup("TMUSR_udcServerUserList");
		udcServerUserList.findInnerUserList(category, keyword);
	}
}



/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTMUSR_btnTerminalUserSearchClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var tMUSR_btnTerminalUserSearch = e.control;
	var reg = /[\{\}\[\]\/?.,;:|\)`^\<>@\#$%&\\\=\(\'\"]/gi;
	var keyword = app.lookup("TMUSR_ipbTerminalUserKeyword").value;
	if (keyword == undefined ||keyword.length <= 0) {
		//선택 해제
	} else {
		if (reg.test(keyword)) {
			// 들어가 있으면 입력불가능한 특수 문자 입니다.
					dialogAlertAMHQ(app, "Waning", dataManager.getString("Str_ErrorSpecialCharacters"));
			return;
		}
		var category = app.lookup("TMUSR_cmbTerminalUserCategory").value;
		var udcTerminalUserList = app.lookup("TMUSR_udcTerminalUserList");
		udcTerminalUserList.findInnerUserList(category, keyword);
	}
}

function onTMUSR_btnSyncTerminalUsersClick(/* cpr.events.CMouseEvent */ e){
	TMUSR_udcChecks = app.lookup("TMUSR_udcTerminalList").getCheckedRowIndices();
	if (TMUSR_udcChecks.length == 0 ) {
		dialogAlertAMHQ(app, "경고", "선택된 단말기가 없습니다.");
		return;
	}
	
	TMUSR_SyncFlag = 1;
	TMUSR_SyncIndex = 0;
	TMUSR_pageRowCount = 200000;
	
	sendSyncGetUsers();
}

function sendSyncGetUsers() {
	if (TMUSR_SyncIndex >= TMUSR_udcChecks.length){	// 동기화 완료
		dialogAlertAMHQ(app, "알림", "사용자 동기화가 완료되었습니다.");
		app.lookup("TMUSR_udcTerminalList").setUnCheckAll();
		
		TMUSR_SyncFlag = 0;
		TMUSR_SyncIndex = 0;
		TMUSR_TerminalID = 0;
		TMUSR_pageRowCount = 50;
		
		return;
	}
	
	var dsUserList = app.lookup("UserList");
	dsUserList.clear();
	
	var udcTerminalUserList = app.lookup("TMUSR_udcTerminalUserList");
	udcTerminalUserList.clearUserList();
	
	TMUSR_TerminalID = app.lookup("TMUSR_udcTerminalList").getTerminalID(TMUSR_udcChecks[TMUSR_SyncIndex])
	var dmTerminalInfo = app.lookup("TerminalInfo");
	dmTerminalInfo.setValue("ID", TMUSR_TerminalID);
	sendServerUserListRequest();
}

function sendSyncTerminalUsers() {
	var dsUserIDList = app.lookup("UserIDList");
	var totalCount;
	var dmDownloadInfo = app.lookup("DownloadInfo");
	
	dsUserIDList.clear();
	var dsUserList = app.lookup("UserList");
	totalCount = dsUserList.getRowCount();
	if (totalCount <=0 ) {
		// 사용자가 없으면 다음 단말기로 ...
		TMUSR_SyncIndex++;
		sendSyncGetUsers();
		return;		
	}
	
	for(var i =0; i< totalCount; i++) {
		var rowData = dsUserList.getRow(i);
		dsUserIDList.addRowData({"ID": rowData.getValue("ID")});
	}
	totalCount = dsUserIDList.getRowCount();
	dmDownloadInfo.setValue("Total", totalCount);
	comLib.showLoadMask("pro",dataManager.getString("Str_UserAdd"),"",totalCount);
	sendTerminalUserAdd();
}

	
 