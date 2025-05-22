/************************************************
 * prePaymentManagement.js
 * Created at 2020. 7. 20. 오후 4:01:55.
 *
 * @author joymrk
 ************************************************/

var dateLib = cpr.core.Module.require("lib/DateLib");
var dataManager = cpr.core.Module.require("lib/DataManager");
var shppm_version;
var comLib;
var userPageRowCount = 50;
var prePayPageRowCount = 50;
//indexerType : 1==UserList 2==PrePay
function setPageIndexer(indexerType,totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex;
	if (indexerType == 1) {
		pageIndex = app.lookup("userListPageIndexer");	
	} else {
		pageIndex = app.lookup("prePayListPageIndexer");
	}
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}

function selectPaging(indexerType, totalCount, viewPageCount) {
	var pageIndex;
	var pageRowCnt=0;
	if (indexerType == 1) {
		pageIndex = app.lookup("userListPageIndexer");
		pageRowCnt = userPageRowCount;
	} else {
		pageIndex = app.lookup("prePayListPageIndexer");
		pageRowCnt = prePayPageRowCount;
	}
	
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = pageRowCnt;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}

function refreshData() { // 초기화 세팅
	//
	app.lookup("UserList").clear(); // 사용자 리스 초기화
	app.lookup("PrepaymentList").clear();
	app.lookup("RFCardInfo").clear();
	app.lookup("UserInfo").reset();
	 
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	app.lookup("SHPPM_dtiPaymentDate").value = now.format('YYYY-MM-DD');
	
	// prePay 요청값 초기화
	app.lookup("SHPPM_nbeAmount").value = 0;
	app.lookup("SHPPM_ipbRegName").value = "";
	app.lookup("PrePayInfo").reset();
	setPageIndexer(1, 0,1,userPageRowCount,10);
	setPageIndexer(2, 0,1,prePayPageRowCount,10); 
}

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();

	shppm_version = dataManager.getSystemVersion();
	refreshData(); // 초기화
	
}


/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onSHPPM_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	var sHPPM_btnSearch = e.control;
	var pageIndex = app.lookup("userListPageIndexer");	
	pageIndex.currentPageIndex = 1; //pageIndex 초기화
	sendGetUserList();
	app.lookup("SHPPM_grpMain").redraw();
}

function sendGetUserList() { // 검색 요청
	app.lookup("UserList").clear();
	comLib.showLoadMask("","선불자 검색 요청","",0);
	
	var curPageIndex = app.lookup("userListPageIndexer").currentPageIndex; 
	var offset = (curPageIndex - 1) * userPageRowCount;
	
	var smsGetPrePayUserList = app.lookup("sms_getPrePayUserList");
	var category = app.lookup("SHPPM_cmbCategory").value;
	var keyword = app.lookup("SHPPM_ipbKeyword").value;
	smsGetPrePayUserList.setParameters("searchCategory", category);
	smsGetPrePayUserList.setParameters("searchKeyword", keyword);
	if (keyword == null || keyword.length == 0) {
		smsGetPrePayUserList.setParameters("searchCategory", "");
	}
	smsGetPrePayUserList.setParameters("offset", offset);
	smsGetPrePayUserList.setParameters("limit", userPageRowCount);
	smsGetPrePayUserList.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getPrePayUserListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		var totalCount = app.lookup("Total").getValue("Count");
		var viewPageCount = totalCount / userPageRowCount + (totalCount % userPageRowCount > 0);
		selectPaging(1, totalCount, viewPageCount);
	} else {
		dialogAlert(app, "Waning", "선불자 검색"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
	app.lookup("SHPPM_grpMain").redraw(); //
}

function onSms_getPrePayUserListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getPrePayUserListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onUserListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var userListPageIndexer = e.control;
	sendGetUserList()
}

function onSHPPM_grdUserListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var sHPPM_grdUserList = e.control;

	var rowIndex = sHPPM_grdUserList.getSelectedRowIndex();
	if( rowIndex == -1 ){ //선택 없음 
		return;
	}
	app.lookup("PrepaymentList").clear();// 조회 리스트 초기화
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	app.lookup("SHPPM_dtiPaymentDate").value = now.format('YYYY-MM-DD');
	app.lookup("SHPPM_nbeAmount").value = 0;
	app.lookup("SHPPM_ipbRegName").value = "";
	setPageIndexer(2, 0,1,prePayPageRowCount,10);  // 초기화
	
	var userList = app.lookup("UserList");
	
	app.lookup("UserInfo").clear();//초기화
	app.lookup("UserInfo").setValue("ID", userList.getRow(rowIndex).getValue("ID"));
	app.lookup("UserInfo").setValue("Name", userList.getRow(rowIndex).getValue("Name"));
	app.lookup("UserInfo").setValue("UniqueID", userList.getRow(rowIndex).getValue("UniqueID"));
	var groupID = userList.getRow(rowIndex).getValue("GroupCode");
	if (groupID != undefined && groupID > 0) {
		var groupName = dataManager.getGroupName(groupID);
		app.lookup("UserInfo").setValue("GroupName", groupName);
	} else {
		app.lookup("UserInfo").setValue("GroupName", "미지정");
	}
	app.lookup("UserInfo").setValue("Balance", userList.getRow(rowIndex).getValue("Balance"));
	app.lookup("SHPPM_dtStart").value = now.format('YYYY-MM-DD');
	app.lookup("SHPPM_dtEnd").value = now.format('YYYY-MM-DD');
	app.lookup("SHPPM_grpSelUserInfo").redraw();
	
	// 사용자 카드 리스트 요청
	app.lookup("RFCardInfo").clear();
	var smsGetRfCardInfo = app.lookup("sms_getUserRfCardList");
	smsGetRfCardInfo.action = "/v1/users/" + userList.getRow(rowIndex).getValue("ID") + "/card"
	smsGetRfCardInfo.method = "GET"
	smsGetRfCardInfo.send(); 
}

function onSHPPM_btnHistoryClick(/* cpr.events.CMouseEvent */ e){
	var sHPPM_btnHistory = e.control;
	var pageIndex = app.lookup("prePayListPageIndexer");	
	pageIndex.currentPageIndex = 1; //pageIndex 초기화
	sendGetPrePayList();// 선불리스트
}

function sendGetPrePayList() {
	app.lookup("PrepaymentList").clear();
	comLib.showLoadMask("","선불금액 리스트","",0);
	var curPageIndex = app.lookup("prePayListPageIndexer").currentPageIndex; 
	var offset = (curPageIndex - 1) * prePayPageRowCount;
	var smsGetPrePayHistoryList = app.lookup("sms_getPrePayHistoryList");
	
	var startAt = app.lookup("SHPPM_dtStart").value;
	startAt = dateLib.makeDateFormat(startAt, "-") + " 00:00:00";
	var endAt = app.lookup("SHPPM_dtEnd").value;
	endAt = dateLib.makeDateFormat(endAt, "-") + " 23:59:59";
	smsGetPrePayHistoryList.setParameters("startTime", startAt);
	smsGetPrePayHistoryList.setParameters("endTime", endAt);
	smsGetPrePayHistoryList.setParameters("offset", offset);
	smsGetPrePayHistoryList.setParameters("limit", prePayPageRowCount);
	smsGetPrePayHistoryList.setParameters("payMode", 0);
	
	smsGetPrePayHistoryList.setParameters("searchCategory", "id");
	smsGetPrePayHistoryList.setParameters("searchKeyword", app.lookup("SHPPM_ipbID").value);
	
	smsGetPrePayHistoryList.action = "/v1/ssh/prepayment/history/" + app.lookup("SHPPM_ipbID").value; 
	smsGetPrePayHistoryList.send();
}



/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getUserRfCardListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		app.lookup("SHPPM_grdCardNum").redraw();
	} else {
		
	}
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getUserRfCardListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);	
}

function onSms_getUserRfCardListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSHPPM_btnChargeClick(/* cpr.events.CMouseEvent */ e){
	var prepaymentDate = app.lookup("SHPPM_dtiPaymentDate").value;
	prepaymentDate = dateLib.makeDateFormat(prepaymentDate, "-") + " 00:00:00";// 입금일자 현장 입금
	
	var balance = app.lookup("SHPPM_ipbBalance").value // 현재 잔액
	var chargeMoney= app.lookup("SHPPM_nbeAmount").value; // 충전금액
	if (chargeMoney <= 0) { 
		dialogAlert(app, "Waning","결제금액이 0원 입니다. 다시 확인해 주세요");
		return;
	}
	var afterBalance = parseInt(balance, 10) + parseInt(chargeMoney, 10); // 결제후 잔액
	if (afterBalance < 0 ) {
		var strMsg = "결제 후 금액이" + afterBalance +"원 입니다. 다시 확인해 주세요";
		dialogAlert(app,"Waning", strMsg);
		return;
	}
	var name = app.lookup("SHPPM_ipbName").value;
	var msgStr = "고객 " + name + "님께 " + chargeMoney +"원을 충전 하시겠습니까?";
	dialogConfirm(app.getRootAppInstance(), "충전", msgStr, function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue) {
					comLib.showLoadMask("","선불 충전 신청","",0);	
					var chargeName = app.lookup("SHPPM_ipbRegName").value;		
					var prepayInfo = app.lookup("PrePayInfo");
					prepayInfo.clear();
					prepayInfo.setValue("PIndex", 0);
					prepayInfo.setValue("PaymentDate", prepaymentDate);
					prepayInfo.setValue("RegName", chargeName);
					prepayInfo.setValue("BeforeBalance", balance);
					prepayInfo.setValue("Amount", chargeMoney);	
					prepayInfo.setValue("Pmode", 1); // 충전 모드 1
					var userID = parseInt(app.lookup("UserInfo").getValue("ID"), 10);
					prepayInfo.setValue("UserID", userID);
					var smsPostChargeMoney = app.lookup("sms_postChargeMoney");
					smsPostChargeMoney.send();			
				} else {}
			});
	});
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postChargeMoneySubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var balance = app.lookup("SHPPM_ipbBalance").value // 현재 잔액
		var chargeMoney= app.lookup("SHPPM_nbeAmount").value; // 충전금액
		
		var afterBalance = parseInt(balance, 10) + parseInt(chargeMoney, 10); // 결제후 잔액
		app.lookup("UserInfo").setValue("Balance", afterBalance); // 잔액변경 <-
		 
		app.lookup("SHPPM_nbeAmount").value = 0;
		app.lookup("SHPPM_ipbRegName").value = "";
		
		sendGetPrePayList();// 선불리스트 다시 검색
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), "저장 실패");		
	}
	
}

function onSms_postChargeMoneySubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);		
}

function onSms_postChargeMoneySubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}


function onSHPPM_btnRefundClick(/* cpr.events.CMouseEvent */ e){
	var regDate = app.lookup("SHPPM_dtiPaymentDate").value;
	regDate = dateLib.makeDateFormat(regDate, "-") + " 00:00:00";
	
		
	var balance = app.lookup("SHPPM_ipbBalance").value // 현재 잔액
	var refundMoney= app.lookup("SHPPM_nbeAmount").value; // 충전금액
	if (refundMoney <= 0) { 
		dialogAlert(app, "Waning","환불 금액이 0원 입니다. 다시 확인해 주세요");
		return;
	}
	var afterBalance = parseInt(balance, 10) - parseInt(refundMoney, 10); // 결제후 잔액
	if (afterBalance < 0 ) {
		var strMsg = "결제 후 금액이" + afterBalance +"원 입니다. 다시 확인해 주세요";
		dialogAlert(app,"Waning", strMsg);
		return;
	}
	var reasonforRefund = app.lookup("SHPPM_ipbReasonForRefund");
	if (reasonforRefund.value.length <= 0) {
		var strMsg = "환불사유를 반드시 입력해야 합니다.";
		dialogAlert(app,"Waning", strMsg);
		return
	}
	var name = app.lookup("SHPPM_ipbName").value;
	var msgStr = "고객 " + name + "님께 " + refundMoney +"원을 환불 하시겠습니까?";
	dialogConfirm(app.getRootAppInstance(), "환불", msgStr, function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue) {
					comLib.showLoadMask("","선불금액 환불 신청","",0);	
					var refundName = app.lookup("SHPPM_ipbRegName").value;
					
					var prepayInfo = app.lookup("PrePayInfo");
					prepayInfo.clear();
					prepayInfo.setValue("PIndex", 0);
					prepayInfo.setValue("PaymentDate", regDate);
					prepayInfo.setValue("RegName", refundName);
					prepayInfo.setValue("BeforeBalance", parseInt(balance, 10)); // 환불전 잔액
					prepayInfo.setValue("Amount", refundMoney);
					prepayInfo.setValue("Pmode", 2); // 충전 모드 2
					var userID = parseInt(app.lookup("UserInfo").getValue("ID"), 10);
					prepayInfo.setValue("UserID", userID);
					prepayInfo.setValue("RefundReason", reasonforRefund.value);
					var smsPostRefundMoney = app.lookup("sms_postRefundMoney");
					smsPostRefundMoney.send();
				} else {}
			});
	});
	
	
}

function onSHPPM_btnDeleteClick(/* cpr.events.CMouseEvent */ e){
	//1. 사용자 잔액 체크
	//2. 삭제 (-) 잔액 발생 체크
	//2-1. (-) 발생할때는 환불처리 하도록 가이드
	//3. 환불잔액 변경
	var grdPrepayHistory = app.lookup("SHPPM_grdPrepayHistory");
	var checkedRowIndices = grdPrepayHistory.getCheckRowIndices();
	var delCount = checkedRowIndices.length;

	if (delCount == 0) {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_UserNotSelected"));
		return;
	} else {
		dialogConfirm(app.getRootAppInstance(), "", dataManager.getString("Str_DeleteConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue) {
					dialogConfirm(app.getRootAppInstance(), "삭제 재확인", dataManager.getString("Str_DeleteConfirm"), function(/*cpr.controls.Dialog*/dialog){
						dialog.addEventListenerOnce("close", function(e){
							if (dialog.returnValue) {
								comLib.showLoadMask("pro","선불결제 이력 삭제","",checkedRowIndices.length);
			
								var dsDeleteList = app.lookup("dsDeleteList");
								dsDeleteList.clear();
								for( var i = 0; i < delCount; i++){
									var delIndex = checkedRowIndices[i];
									var pindex = grdPrepayHistory.getRow(delIndex).getValue("PIndex");
									var delUser = {"pindex":pindex,"rowIndex":delIndex, "amount": grdPrepayHistory.getRow(delIndex).getValue("Amount")};
									dsDeleteList.addRowData(delUser);
								}
								sendDeletePaymentHistory();
														
							}
						});
					});
					
				} else {}
			});
		});
	}
}

function sendDeletePaymentHistory() {
	var dsDeleteList = app.lookup("dsDeleteList");
	if( dsDeleteList.getRowCount() == 0 ){
		comLib.hideLoadMask();
		dataManager = getDataManager();
		//dialogAlert(app, "Waning", dataManager.getString("Str_UserNotSelected"));
		return;
	}
	var dsPindex = dsDeleteList.getRow(0);
	var pindex = dsPindex.getValue("pindex");

	var msg = "선불결제"+ " : "+pindex;
	comLib.updateLoadMask(msg);
	
	var sms_deletePrepayHistory = new cpr.protocols.Submission("sms_deletePrepayHistory");
	sms_deletePrepayHistory.action = "/v1/ssh/prepayment/"+pindex;
	sms_deletePrepayHistory.method = "delete";
	sms_deletePrepayHistory.mediaType = "application/x-www-form-urlencoded";
	sms_deletePrepayHistory.userAttr("pindex", pindex.toString());
	sms_deletePrepayHistory.userAttr("amount", dsPindex.getValue("amount").toString());
	sms_deletePrepayHistory.userAttr("rowIndex", dsPindex.getValue("rowIndex").toString());	
	sms_deletePrepayHistory.addResponseData(app.lookup("Result"), false, "Result");
		
	sms_deletePrepayHistory.addEventListenerOnce("submit-done", onSms_deletePrepayHistorySubmitDone);
	sms_deletePrepayHistory.addEventListenerOnce("submit-error", onSms_deletePrepayHistorySubmitError);
	sms_deletePrepayHistory.addEventListenerOnce("submit-timeout", onSms_deletePrepayHistorySubmitTimeout);
	sms_deletePrepayHistory.send();
}

function onSms_deletePrepayHistorySubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_deletePrepayHistory = e.control;
	
	var dsDeleteList = app.lookup("dsDeleteList");
	dsDeleteList.realDeleteRow(0);

	var grdPrepayHistory = app.lookup("SHPPM_grdPrepayHistory");

	var pindex = sms_deletePrepayHistory.userAttr("pindex");
	var amount = sms_deletePrepayHistory.userAttr("amount");
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE || resultCode == COMERROR_USER_NOT_EXIST ){
		var balance = app.lookup("SHPPM_ipbBalance").value; // 현재 잔액
		app.lookup("SHPPM_ipbBalance").value = parseInt(balance, 10) - parseInt(amount, 10); // 결제후 잔액
		
		grdPrepayHistory.deleteRow( parseInt(sms_deletePrepayHistory.userAttr("rowIndex"),10));
		sendDeletePaymentHistory();
	} else {		
		dialogAlert(app, dataManager.getString("Str_Failed"), "삭제 실패");
	}
}

function onSms_deletePrepayHistorySubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onSms_deletePrepayHistorySubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getPrePayHistoryListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		var totalCount = app.lookup("Total").getValue("Count");
		var viewPageCount = totalCount / prePayPageRowCount + (totalCount % prePayPageRowCount > 0);
		selectPaging(2, totalCount, viewPageCount);
	} else {
		dialogAlert(app, "Waning", "선불자 검색"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
	app.lookup("SHPPM_grpMain").redraw(); //s
}

function onSms_getPrePayHistoryListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getPrePayHistoryListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onSms_postRefundMoneySubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var balance = app.lookup("SHPPM_ipbBalance").value // 현재 잔액
		var refundMoney= app.lookup("SHPPM_nbeAmount").value; // 충전금액
		
		var afterBalance = parseInt(balance, 10) - parseInt(refundMoney, 10); // 결제후 잔액
		app.lookup("UserInfo").setValue("Balance", afterBalance); // 잔액변경 <-
		 
		app.lookup("SHPPM_nbeAmount").value = 0;
		app.lookup("SHPPM_ipbRegName").value = "";
		
		sendGetPrePayList();// 선불리스트 다시 검색
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), "저장 실패");		
	}
}
	
function onSms_postRefundMoneySubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_postRefundMoneySubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * "카드 조회" 버튼(SHPPM_btnCardSearch)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onSHPPM_btnCardSearchClick(/* cpr.events.CMouseEvent */ e){
	var appld = "app/main/users/userCardRegist"+ "?" + shppm_version;
	app.getRootAppInstance().openDialog(appld, {width : 640, height : 490}, function(dialog){		
		
		dialog.bind("headerTitle").toLanguage("Str_CardReading");
		dialog.initValue = {"UserID":"","Mode":"Scan","Url":"/v1"};
		dialog.resizable = false;		
		dialog.modal = true;		
	}).then(function(returnValue){ // 지문 등록 화면에서 적용을 누른 경우에만 이 부분으로 들어옴.		
		if(returnValue.length>0){	
			app.lookup("SHPPM_cmbCategory").value="card";
			app.lookup("SHPPM_ipbKeyword").value=returnValue[0].CardNum;	
			var pageIndex = app.lookup("userListPageIndexer");	
			pageIndex.currentPageIndex = 1; //pageIndex 초기화
			sendGetUserList();
		}		
	});
}


/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onPrePayListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var prePayListPageIndexer = e.control;
	sendGetPrePayList();// 선불리스트
}
