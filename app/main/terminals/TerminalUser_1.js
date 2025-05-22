/************************************************
 * TerminalUser.js
 * Created at 2019. 1. 11. 오후 2:30:52.
 *
 * @author joymrk
 ************************************************/
var comLib;
var selectTerminalID;
var selectUserID;

var pageRowCount = 50;
var dataManager = cpr.core.Module.require("lib/DataManager");

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	selectTerminalID = new Map();
	selectUserID = new Map();
	
	var getAccessGroupSet = dataManager.getAccessGroup();	
	var dsAccessGroup = app.lookup("AccessGroupList");
	getAccessGroupSet.copyToDataSet(dsAccessGroup); 
	
	var udcRegistTerminalList = app.lookup("TMUSR_udbRegistTerminalList");	
	udcRegistTerminalList.deleteColumn([13,12,11,10,9,8,7,6,5,4,3]);	
	udcRegistTerminalList.setPaging(0,1,5,pageRowCount);
	
	var udcRegistUserList = app.lookup("TMUSR_udcRegistUserList");	
	udcRegistUserList.deleteColumn([14,13,12,11,10,9,8,7,6,5,4]);
	udcRegistUserList.setPaging(0,1,5,pageRowCount);
}

/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onTMUSR_AccessGroupGrdSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var tMUSR_AccessGroupGrd = e.control;
	var getRow = tMUSR_AccessGroupGrd.getSelectedRow();
	if(getRow != null) {
		var udcTerminalList = app.lookup("TMUSR_udbRegistTerminalList");
		var curIndex = udcTerminalList.getCurrentPageIndex();
		var offset = (curIndex - 1) * pageRowCount;	
		
		var requsetData = app.lookup("sms_getSelectedAccessGroupInfo");
		requsetData.action =  "/v1/accessGroups/" + getRow.getValue("ID") + "/terminalUsers";
			
		requsetData.setParameters("offset", offset);
		requsetData.setParameters("limit", pageRowCount);
		console.log("sms_Send_List action : " + requsetData.action);
		requsetData.send();
	} else {
		tMUSR_AccessGroupGrd.clearSelection();
	}
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getSelectedAccessGroupinfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getSelectedAccessGroupinfo = e.control;
	comLib.hideLoadMask();
	var dsTerminals = app.lookup("TerminalsInfo");
	var dsUsers = app.lookup("UsersInfo");
	var dmResult = app.lookup("Result");
	
	if( dmResult.getValue("ResultCode") == 0){
		var dmTerminalsTotal = app.lookup("TerminalsTotal");
		var dmUsersTotal = app.lookup("UsersTotal");
		selectTerminalID.clear();
		selectUserID.clear();
		var tTotalCount = parseInt(dmTerminalsTotal.getValue("Count"));
		var tViewPageCount = tTotalCount/pageRowCount + (tTotalCount%pageRowCount>0);
		if( tViewPageCount > 5 ) {
			tViewPageCount = 5;
		}
		
		var udcRegistTerminalList = app.lookup("TMUSR_udbRegistTerminalList");
		udcRegistTerminalList.setTerminalList(dsTerminals);
		udcRegistTerminalList.setPaging(tTotalCount, pageRowCount, tViewPageCount);		
		udcRegistTerminalList.redraw();
		
		var uTotalCount = parseInt(dmUsersTotal.getValue("Count"));
		var uViewPageCount = uTotalCount/pageRowCount + (uTotalCount%pageRowCount>0);
		if( uViewPageCount > 5 ) {
			uViewPageCount = 5;
		}
		var udcRegistUserList = app.lookup("TMUSR_udcRegistUserList");
		udcRegistUserList.setUserList(dsUsers);
		udcRegistUserList.setPaging(uTotalCount, pageRowCount, uViewPageCount);		
		udcRegistUserList.redraw();
	} else {
		comLib.alert("warning", "출입그룹에 등록된 정보 가져오기 실패.");
	}
}

/*
 * Terminal pagechange 이벤트 발생 시 호출.
 */
function onTMUSR_udbRegistTerminalListPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.grid.terminalList
	 */
	var tMUSR_udbRegistTerminalList = e.control;
	makeRequestMap("Terminal");
		
	var newIndex = e.newSelection;
	var getRow = app.lookup("TMUSR_AccessGroupGrd").getSelectedRow();
	sendPageChangeRequest(getRow.getValue("ID"), "TerminalType");	
}
/*
 *  pagechange 서브미션 발송용
 */
function sendPageChangeRequest(getID, pageType) {
		var curIndex;
		var offset;
		var requsetData;
		var udcTerminalList = app.lookup("TMUSR_udbRegistTerminalList");
		var udcUserList = app.lookup("TMUSR_udcRegistUserList");
		
		if(pageType == "TerminalType") {
			curIndex = udcTerminalList.getCurrentPageIndex();
			offset = (curIndex - 1) * pageRowCount;	
			requsetData = app.lookup("sms_getTerminalsInAccessGroupInfo");
			requsetData.action =  "/v1/accessGroups/" + getID + "/terminals";	
			console.log("sms_Send_List action : " + requsetData.action);
		} else if (pageType == "UserType"){
			curIndex = udcUserList.getCurrentPageIndex();
			offset = (curIndex - 1) * pageRowCount;	
			requsetData = app.lookup("sms_getUsersAccessGroupInfo");
			requsetData.action =  "/v1/accessGroups/" + getID + "/users";
			console.log("sms_Send_List action : " + requsetData.action);
		} else {
			console.log("Request with the wrong type");
			return
		}
		requsetData.setParameters("offset", offset);
		requsetData.setParameters("limit", pageRowCount);
		requsetData.send();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getTerminalsInAccessGroupInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/* @type cpr.protocols.Submission */
	var sms_getTerminalsInAccessGroupInfo = e.control;
	comLib.hideLoadMask();
	var dsTerminals = app.lookup("TerminalsInfo");
	var dmResult = app.lookup("Result");
	
	if( dmResult.getValue("ResultCode") == 0){
		var dmTerminalsTotal = app.lookup("TerminalsTotal");
		var tTotalCount = parseInt(dmTerminalsTotal.getValue("Count"));
		var tViewPageCount = tTotalCount/pageRowCount + (tTotalCount%pageRowCount>0);
		if( tViewPageCount > 5 ) {
			tViewPageCount = 5;
		}
		var udcRegistTerminalList = app.lookup("TMUSR_udbRegistTerminalList");
		udcRegistTerminalList.setTerminalList(dsTerminals);
		udcRegistTerminalList.setPaging(tTotalCount, pageRowCount, tViewPageCount);		
		udcRegistTerminalList.refreshCheckboxStatus(selectTerminalID);
	} else {
		comLib.alert("warning", "출입그룹에 등록된 정보 가져오기 실패.");
	}
}


/*
 * 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
 */
function onTMUSR_udcRegistUserListPagechange(/* cpr.events.CSelectionEvent */ e){
	/* @type udc.grid.userList */
	var tMUSR_udcRegistUserList = e.control;
	makeRequestMap("User");
	
	var newIndex = e.newSelection;
	var getRow = app.lookup("TMUSR_AccessGroupGrd").getSelectedRow();
	sendPageChangeRequest(getRow.getValue("ID"), "UserType");	
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getUsersAccessGroupInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/* @type cpr.protocols.Submission */
	var sms_getUsersAccessGroupInfo = e.control;
	comLib.hideLoadMask();
	var dsUsers = app.lookup("UsersInfo");
	var dmResult = app.lookup("Result");
	
	if( dmResult.getValue("ResultCode") == 0){
		var dmUsersTotal = app.lookup("UsersTotal");
		var TotalCount = parseInt(dmUsersTotal.getValue("Count"));
		var ViewPageCount = TotalCount/pageRowCount + (TotalCount%pageRowCount>0);
		if( ViewPageCount > 5 ) {
			ViewPageCount = 5;
		}
		var udcRegistUserList = app.lookup("TMUSR_udcRegistUserList");
		udcRegistUserList.setUserList(dsUsers);
		udcRegistUserList.setPaging(TotalCount, pageRowCount, ViewPageCount);
		console.log(selectUserID);
		udcRegistUserList.refreshCheckboxStatus(selectUserID);
	} else {
		comLib.alert("warning", "출입그룹에 등록된 정보 가져오기 실패.");
	}
}


/*
 * 단말로 사용자 정보 전송
 */
function onTMUSR_TerminalSendBtnClick(/* cpr.events.CMouseEvent */ e){
	var tMUSR_TerminalSendBtn = e.control;
	
	//현재 page setMap 처리	
	var terminalMapSize = makeRequestMap("Terminal");
	if (terminalMapSize <= 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedTerminals"));	
	}
	var userMapSize = makeRequestMap("User");
	if (userMapSize <= 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedUser"));
	}
	
	app.lookup("ForceType").setValue("Type", 2); // TODO : 단말기 상태 오류 발생시 처리방법 옵션 
	
	// Map 데이터 dataset 처리
	var dsTerminals = app.lookup("Terminals");
	dsTerminals.clear();
	for (var [key, value] of selectTerminalID) {
		dsTerminals.addRowData({"ID":key});	
	}
	
	var dsUsers = app.lookup("Users");
	dsUsers.clear();
	for (var [key, value] of selectUserID) {
		dsUsers.addRowData({"ID":key});	
	}
	
	var sms_sendTerminalUsers = app.lookup("sms_postTerminalUsers");
	comLib.showLoadMask( "", dataManager.getString("Str_AccessAreaAdd"), "",0);
	console.log(sms_sendTerminalUsers.action);
	sms_sendTerminalUsers.send();
}

// 선택한 단말 리스트와 사용자 리스트를 맵으로 구성. 단말 사용자 다운로드를 서버에 요청시 맵에 구성된 데이터 사용
function makeRequestMap(type) {
	var MapSize = 0;
	if(type == "Terminal") {
		var udcTerminalList = app.lookup("TMUSR_udbRegistTerminalList");
		var dsTerminalsInfo = app.lookup("TerminalsInfo");
	
		var RowCnt = udcTerminalList.getPageRowCount();
		for (var i=0 ; i < RowCnt ; i++) {
			var status = udcTerminalList.getIsCheckedRow(i);
			var row = dsTerminalsInfo.getRow(i);
			var terminalID = row.getValue("ID");
			if (status == true) {
				if(selectTerminalID.get(terminalID) == undefined) {
					selectTerminalID.set(terminalID,1);
				}
			} else if (status == false){
				if(selectTerminalID.get(terminalID) != undefined) {
					selectTerminalID.delete(terminalID);
				}
			}
		}
		MapSize = selectTerminalID.size
		
	} else if (type == "User") {
		var udcUserList = app.lookup("TMUSR_udcRegistUserList");
		var dsUsersInfo = app.lookup("UsersInfo");
		var RowCnt = udcUserList.getPageRowCount();
		for (var i=0 ; i < RowCnt ; i++) {
			var status = udcUserList.getIsCheckedRow(i);
			var row = dsUsersInfo.getRow(i);
			var UserID = row.getValue("ID");
			if (status == true) {
				if(selectUserID.get(UserID) == undefined) {
					selectUserID.set(UserID,1);
				}
			} else if (status == false){
				if(selectUserID.get(UserID) != undefined) {
					selectUserID.delete(UserID);
				}
			}
		}
		MapSize = selectUserID.size
	}
	
	return MapSize;
}

// 출입 그룹 사용자 추가 성공시
function onSms_postTerminalUsersSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/* @type cpr.protocols.Submission */
	var sms_postTerminalUsersInAccessGroup = e.control;
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == 0){
		console.log("전송 요청 성공");
	} else {
		//TODO: 실패 예외처리
		console.log("전송 요청 실패");
	} 
}


