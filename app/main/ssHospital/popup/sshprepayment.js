/************************************************
 * sshprepayment.js
 * Created at 2020. 8. 5. 오후 5:40:04.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var SSHUP_pageRowCount = 50;
var _ID=0;
var _createDate = "";
var SSHUP_refreshFlag;
function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("prepaymentListPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}
function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("prepaymentListPageIndexer");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = SSHUP_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	SSHUP_refreshFlag = 0;
	app.lookup("SSHUP_nbeAmount").value = 0;
	var initValue = app.getHost().initValue;
	console.log(initValue);	
	app.lookup("SSHUP_npbBalance").value = initValue["Balance"];
	app.lookup("SSHUP_ipbName").value = initValue["Name"];
	checkPaymentType();
	_ID = initValue["ID"];
	_createDate = initValue["CreateDate"];
	setPageIndexer(SSHUP_pageRowCount, 10);
	var pageIndex = app.lookup("prepaymentListPageIndexer");	
	pageIndex.currentPageIndex = 1; //pageIndex 초기화
	sendGetprepaymentList();// 선불리스트
	
}

function sendGetprepaymentList() {
	app.lookup("PrepaymentList").clear();
	
	comLib.showLoadMask("","선불금액 리스트","",0);
	
	var curPageIndex = app.lookup("prepaymentListPageIndexer").currentPageIndex; 
	var offset = (curPageIndex - 1) * SSHUP_pageRowCount;
	var smsGetPrePayHistoryList = app.lookup("sms_getprepaymentHistoryList");
	var dtEnd = dateLib.getToday("-");
	smsGetPrePayHistoryList.setParameters("startTime", _createDate); //사용자 생성일자
	smsGetPrePayHistoryList.setParameters("endTime", dtEnd + " 23:59:59"); //오늘날짜 
	smsGetPrePayHistoryList.setParameters("offset", offset);
	smsGetPrePayHistoryList.setParameters("limit", SSHUP_pageRowCount);
	smsGetPrePayHistoryList.setParameters("payMode", 0);
	smsGetPrePayHistoryList.setParameters("searchCategory", "id");
	smsGetPrePayHistoryList.setParameters("searchKeyword", _ID);
	
	smsGetPrePayHistoryList.action = "/v1/ssh/prepayment/history/" + _ID; 
	smsGetPrePayHistoryList.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getprepaymentHistoryListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var totalCount = app.lookup("Total").getValue("Count");
		var viewPageCount = totalCount / SSHUP_pageRowCount + (totalCount % SSHUP_pageRowCount > 0);
		app.lookup("SSHUP_opbTotal").value = totalCount;		
		selectPaging(totalCount, viewPageCount);
	} else {
		dialogAlert(app, "Waning", "선불 결제"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}	
}

function onSms_getprepaymentHistoryListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getprepaymentHistoryListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onSSHUP_btnPrepaymentClick(/* cpr.events.CMouseEvent */ e){
	var amount= app.lookup("SSHUP_nbeAmount").value;
	if (amount <= 0) {
		dialogAlert(app, "Waning","결제금액이 0원 입니다. 다시 확인해 주세요");
		return;
	}
	
	
	var Name = app.lookup("SSHUP_ipbName").value; //입금자 이름
	var paymentType = app.lookup("SSHUP_rdbPaymentTType").value;
	var refundReason = app.lookup("SSHUP_ipbReasonForRefund");
	var msgStr = "";
	if(paymentType == 1) {
		msgStr = "고객 " + Name + "님께 " + amount +"원을 충전 하시겠습니까?";
	} else {
		msgStr = "고객 " + Name + "님께 " + amount +"원을 환불 하시겠습니까?";
		
		if (refundReason.value.length <= 0 ) { //환불시에만 체크
			dialogAlert(app, "Waning","환불 사유를 반드시 입력해 주세요");
			return
		}
	}
	
	dialogConfirm(app.getRootAppInstance(), "결제 확인", msgStr, function(/*cpr.controls.Dialog*/ dialog) {
		dialog.addEventListenerOnce("close", function(e){
			if (dialog.returnValue == true) { //결제
				comLib.showLoadMask("","결제 신청","",0);
	
				var smsPostPrepayment;
				var paymentType = app.lookup("SSHUP_rdbPaymentTType");
				
				var dtNow = dateLib.getToday("-");
				var prepaymentDate = dtNow + " 00:00:00"; //결제일자
				var prepayInfo = app.lookup("PrepaymentInfo");
				prepayInfo.clear();
				prepayInfo.setValue("PIndex", 0);
				prepayInfo.setValue("PaymentDate", prepaymentDate); // 오늘날짜
				prepayInfo.setValue("RegName", Name); 
				prepayInfo.setValue("BeforeBalance", app.lookup("SSHUP_npbBalance").value);
				prepayInfo.setValue("Amount", amount);	
				if (paymentType.value == 1) { // 충전
					prepayInfo.setValue("Pmode", 1); // 충전 모드 1
					smsPostPrepayment = app.lookup("sms_postChargeMoney");
					prepayInfo.setValue("RefundReason", "");
				} else if (paymentType.value == 2) { //환불
					prepayInfo.setValue("Pmode", 2); // 환불 모드 2
					prepayInfo.setValue("RefundReason", refundReason.value);
					smsPostPrepayment = app.lookup("sms_postRefundMoney");
				}
				var userID = parseInt(_ID, 10);
				prepayInfo.setValue("UserID", userID);
				
				smsPostPrepayment.send();
			}
		});
	});
	
}	
	
	
function onSSHUP_btnAppCloseClick(/* cpr.events.CMouseEvent */ e){
	app.close(SSHUP_refreshFlag);
}

function onSms_postChargeMoneySubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var balance = app.lookup("SSHUP_npbBalance").value;
		
		var amount = app.lookup("SSHUP_nbeAmount").value;
		var rdbType = app.lookup("SSHUP_rdbPaymentTType").value;
		
		if (rdbType == 1) {
			var nRresult = parseInt(balance, 10) + parseInt(amount, 10);
			app.lookup("SSHUP_npbBalance").value = nRresult;
		} 
		app.lookup("SSHUP_nbeAmount").value = 0;
		sendGetprepaymentList();// 선불리스트 다시 검색
		SSHUP_refreshFlag = 1;
		
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), "저장 실패");		
	}
}

function onSms_postChargeMoneySubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_postChargeMoneySubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
 
function onSms_postRefundMoneySubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var balance = app.lookup("SSHUP_npbBalance").value;
		var amount = app.lookup("SSHUP_nbeAmount").value;
		var rdbType = app.lookup("SSHUP_rdbPaymentTType").value;
		if (rdbType == 2) {
			var nRresult = parseInt(balance, 10) - parseInt(amount, 10);
			app.lookup("SSHUP_npbBalance").value =  nRresult;
		}
		sendGetprepaymentList();// 선불리스트 다시 검색
		SSHUP_refreshFlag = 1;
		
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), "저장 실패");		
	}
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_postRefundMoneySubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onSms_postRefundMoneySubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


function checkPaymentType() {
	var rdbPaymentType = app.lookup("SSHUP_rdbPaymentTType");
	var refundReason = app.lookup("SSHUP_ipbReasonForRefund");
	if (rdbPaymentType.value == 1) {//충전
		refundReason.value = "";
		refundReason.enabled = false;	
	} else {
		refundReason.value = "";
		refundReason.enabled = true;
	}
	
	
}


/*
 * 라디오 버튼에서 item-click 이벤트 발생 시 호출.
 * 아이템 클릭시 발생하는 이벤트.
 */
function onSSHUP_rdbPaymentTTypeItemClick(/* cpr.events.CItemEvent */ e){
	/** 
	 * @type cpr.controls.RadioButton
	 */
	var sSHUP_rdbPaymentTType = e.control;
	checkPaymentType();
}
