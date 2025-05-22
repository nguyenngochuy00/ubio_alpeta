/************************************************
 * userBackupList.js
 * Created at 2022. 5. 16. 오후 1:58:13.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var UBL_pageRowCount = 50;
var util = cpr.core.Module.require("lib/util");

function onBodyLoad(/* cpr.events.CEvent */ e){
	
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var pageIndexer = app.lookup("UBL_piUserList");	
	pageIndexer.pageRowCount = UBL_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndexer.viewPageCount = 10;// 보여지는 페이지 수(하단 부 인덱스 수)
	
	
	var dtStart = app.lookup("UBL_dtStart");
	var dtEnd = app.lookup("UBL_dtEnd");
	
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	dtEnd.value = now.format('YYYY-MM-DD');
	
	// 이전 3달 데이터 디폴트
	var before = now.add(-3, 'month');
	dtStart.value = before.format('YYYY-MM-DD');
	
	SetMaxDate();
	
	var searchCtrl = app.lookup("UBL_udcSearchUser");
	searchCtrl.removeItem("card");
	searchCtrl.removeItem("privilegeID");
	searchCtrl.addItem("Str_Privilege", "privilegeName");
	
	sendBackupUserListReq();
}

function sendBackupUserListReq(){
		
	var pageIndexer = app.lookup("UBL_piUserList");
	var curIndex = pageIndexer.currentPageIndex;
	var offset = (curIndex - 1) * UBL_pageRowCount;
	
	var searchCtrl = app.lookup("UBL_udcSearchUser");
	
	var startAt = app.lookup("UBL_dtStart").value;
	var endAt = app.lookup("UBL_dtEnd").value;
	
	var sms_getUserBackupList = app.lookup("sms_getUserBackupList");
	
	sms_getUserBackupList.setParameters("startTime", startAt);
	sms_getUserBackupList.setParameters("endTime", endAt);
		
	sms_getUserBackupList.setParameters("searchCategory", searchCtrl.searchCategory);
	sms_getUserBackupList.setParameters("searchKeyword", searchCtrl.searchKeyword);
	
	if (searchCtrl.searchKeyword != undefined && searchCtrl.searchKeyword.length > 0) {
		if (searchCtrl.searchCategory == "id" ) {
			var intID = parseInt(searchCtrl.searchKeyword, 10);
			sms_getUserBackupList.setParameters("searchKeyword", String(intID));
		} else if (searchCtrl.searchCategory == "name" || searchCtrl.searchCategory == "uniqueID") {
			if(searchCtrl.searchKeyword.length == 1){				
				dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_InvalidSearchLength"));
				return;
			}
			var intID = parseInt(searchCtrl.searchKeyword, 10);
			sms_getUserBackupList.setParameters("searchKeyword", searchCtrl.searchKeyword);
		} else {
			sms_getUserBackupList.setParameters("searchCategory", searchCtrl.searchCategory);
		}
	} else {
		sms_getUserBackupList.setParameters("searchCategory", "");
	}
	
	sms_getUserBackupList.setParameters("limit", UBL_pageRowCount);
	sms_getUserBackupList.setParameters("offset", offset);
	
	sms_getUserBackupList.send();
}

function onSms_getUserBackupListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode");
	
	if (resultCode == COMERROR_NONE) {
		var sms_getUserBackupList = e.control;	
		var pageIndexer = app.lookup("UBL_piUserList");
		var total = app.lookup("Total").getValue("Count");
		pageIndexer.totalRowCount = total;
		app.lookup("opt_tot").text = total;
		
		if (total <= 0) {
			app.lookup("UserBackupList").clear();
			app.lookup("UBL_grdUserBackupList").redraw();
		}
		
	} else {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserListGet")+" "+dataManager.getString("Str_Failed")+"."+dataManager.getString(getErrorString(resultCode)));
	}
	
}

function onSms_getUserBackupListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getUserBackupListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onUBL_piUserListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	sendBackupUserListReq();
}


/*
 * 버튼(UBL_btnDeleteUser)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUBL_btnDeleteUserClick(/* cpr.events.CMouseEvent */ e){
	var grdUserBackupList = app.lookup("UBL_grdUserBackupList");
	var checkedRowIndices = grdUserBackupList.getCheckRowIndices();
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
						var delUser = {"UserID":grdUserBackupList.getCellText(delIndex, 1),"rowIndex":delIndex};
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
		return;
	}
	var dsUserID = dsDeleteList.getRow(0);
	var userID = dsUserID.getValue("UserID");

	var msg = dataManager.getString("Str_UserID")+ " : "+userID;
	comLib.updateLoadMask(msg);
	
	var sms_deleteUser = new cpr.protocols.Submission("sms_deleteUser");
	sms_deleteUser.action = "/v1/custom/userBackups/"+userID;
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

/* 서브미션에서 submit-done 이벤트 발생 시 호출. */
function onSms_deleteUserSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** @type cpr.protocols.Submission	 */
	var sms_deleteUser = e.control;	
	var sms_deleteUser = e.control;
	
	var dsDeleteList = app.lookup("dsDeleteList");
	dsDeleteList.realDeleteRow(0);

	var grdUserBackupList = app.lookup("UBL_grdUserBackupList");	

	var uid = sms_deleteUser.userAttr("uid");
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE || resultCode == COMERROR_USER_NOT_EXIST ){
		grdUserBackupList.deleteRow( parseInt(sms_deleteUser.userAttr("rowIndex"),10));
		sendDeleteUser();
	} else {		
		comLib.hideLoadMask();
		dataManager = getDataManager();
		dialogAlert(app, dataManager.getString("Str_Failed"), 
			uid+ " "+dataManager.getString("Str_UserDelete")+" "+dataManager.getString("Str_Failed")+"."+dataManager.getString(getErrorString(resultCode)));
		
	}
}

/* 서브미션에서 submit-error 이벤트 발생 시 호출.* 통신 중 문제가 생기면 발생합니다. */
function onSms_deleteUserSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** @type cpr.protocols.Submission	 */
	var sms_deleteUser = e.control;
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

/* 서브미션에서 submit-timeout 이벤트 발생 시 호출. 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다. */
function onSms_deleteUserSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** @type cpr.protocols.Submission	 */
	var sms_deleteUser = e.control;	
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}


/*
 * 사용자 정의 컨트롤에서 search 이벤트 발생 시 호출.
 */
function onUBL_udcSearchUserSearch(/* cpr.events.CUIEvent */ e){
	
	var startTime = app.lookup("UBL_dtStart").value;
	var endTime = app.lookup("UBL_dtEnd").value;
	var isStartEndDateValid = util.isStartEndDateValid(startTime, endTime);
	if (isStartEndDateValid === false) {
		dialogAlert(app.getHostAppInstance(), "error", dataManager.getString("Str_ErrorStartEndDateInvalid"));
		return false
	}
	
	var pageIndex = app.lookup("UBL_piUserList");
	pageIndex.currentPageIndex = 1;
	sendBackupUserListReq();
}

/*
 * 사용자 정의 컨트롤에서 searchKeydown 이벤트 발생 시 호출.
 */
function onUBL_udcSearchUserSearchKeydown(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		var pageIndex = app.lookup("UBL_piUserList");
		pageIndex.currentPageIndex = 1;
		sendBackupUserListReq();	
	}
}

function SetMaxDate() {
	var date = new Date();
    date.setFullYear(date.getFullYear());// y년을 더함
    date.setMonth(date.getMonth());// m월을 더함
    date.setDate(date.getDate());// d일을 더함
    
	app.lookup("UBL_dtStart").maxDate = date;
	app.lookup("UBL_dtEnd").maxDate = date;	
}
