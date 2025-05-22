/************************************************
 * UserInfoCustomMCP.js
 * Created at 2021. 3. 31. ���� 1:35:02.
 *
 * @author A
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateUtil = cpr.core.Module.require("lib/DateLib");
var StrLib = cpr.core.Module.require("lib/StrLib");
var UCMCP_userID = 0;
var UCMCP_mode = 0;
var oem_version;

exports.setMCPUserCarInfo = function(DataSet){
	var userCarInfo = app.lookup("UserCarInfo");
	//console.log(DataSet);
	userCarInfo.clear();
	userCarInfo.build(DataSet);
	//console.log(userCarInfo.getRowDataRanged());
}

exports.getMCPUserCarInfo = function(){
	var userCarInfo = app.lookup("UserCarInfo").getRowDataRanged();
	return userCarInfo;
}

exports.setMCPUserInfo = function(userID, mode) {
	UCMCP_userID = userID;
	UCMCP_mode = mode;
}


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	oem_version = dataManager.getOemVersion();
	
	app.lookup("BPARK_grpSeasonTicket").visible = false;
	
	if (oem_version == OEM_MOTORCYCLE_PARK) {
		
		// 여기에 visible 설정
		app.lookup("BPARK_grpSeasonTicket").visible = true;
		var dsInfo = app.lookup("BPARKInfoList");
		dataManager.getInfoListBPARK().copyToDataSet(dsInfo);
		dsInfo.commit();
	}
	
}

		
//추가 버튼 클릭 시 발생하는 이벤트 
function onUCMCP_btnCarAddClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var uCMCP_btnCarAdd = e.control;
		dataManager = getDataManager();
	var registerablecarCount = 5;				// 1 -> 5 변경요청 otk
	var dsCarInfo = app.lookup("UserCarInfo");
	var registedCarCount = dsCarInfo.getRowCount();
	if (registerablecarCount <= registedCarCount) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_SubmitResult_RegistFail"));
		//차량오류 에러처리
		return
	}
	
	var count = dsCarInfo.getRowCount();
	if( count > registerablecarCount){
		dialogAlert(app, dataManager.getString("Str_Warning"), "차량등록 갯수 초과");
		return;		
	}
	dsCarInfo.addRow();
	dsCarInfo.commit();
}

//삭제 버튼 클릭시 발생하는 이벤트
function onUCMCP_btnCarDeleteClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var uCMCP_btnCarDelete = e.control;
		dataManager = getDataManager();
	var grdCarList = app.lookup("UCMCP_grdCarList");
	var chkIndices = grdCarList.getCheckRowIndices();
	if (chkIndices.length == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedItem"));
		return;
	}
	
	if(UCMCP_mode == 'Add') {
		var dsCarInfo = app.lookup("UserCarInfo");
		chkIndices.forEach(function(rowIndex){
			dsCarInfo.deleteRow(rowIndex);
		});	
		dsCarInfo.commit();
		return
	}
	app.lookup("UCMCP_btnCarDelete").enabled = false;//연속 클릭 안되게
	
	
	var dsDeleteCarInfoList = app.lookup("deleteCarInfoList");
	dsDeleteCarInfoList.clear();
	var delCount = chkIndices.length;
	for( var i = 0; i < delCount; i++){
		var delIndex = chkIndices[i];
		var delCar = {"carNumber":grdCarList.getRow(delIndex).getValue("CarNumber"),"rowIndex":delIndex};
		dsDeleteCarInfoList.addRowData(delCar);
	}
	sendDeleteCarInfo();
}


function sendDeleteCarInfo() {
	var dsDeleteCarInfoList = app.lookup("deleteCarInfoList");
	if( dsDeleteCarInfoList.getRowCount() == 0 ){
		dataManager = getDataManager();
		app.lookup("UCMCP_btnCarDelete").enabled = true;//연속 클릭 안되게
		return;
	}
	var dsDeleteCarInfo = dsDeleteCarInfoList.getRow(0);
	var carNumber = dsDeleteCarInfo.getValue("carNumber");

//	var userID = app.lookup("USINB_ipbUserID").value;
	
	var smsCarInfoDelete = new cpr.protocols.Submission("sms_CarInfoDelete");
	smsCarInfoDelete.action = "/v1/users/"+UCMCP_userID+ "/carNumber/"+ carNumber;
	smsCarInfoDelete.method = "delete";
	smsCarInfoDelete.mediaType = "application/x-www-form-urlencoded";
	smsCarInfoDelete.userAttr("carNumber", carNumber);
	smsCarInfoDelete.userAttr("rowIndex", dsDeleteCarInfo.getValue("rowIndex").toString());	
	smsCarInfoDelete.addResponseData(app.lookup("Result"), false, "Result");
		
	smsCarInfoDelete.addEventListenerOnce("submit-done", onSms_CarInfoDeleteSubmitDone);
	smsCarInfoDelete.addEventListenerOnce("submit-error", onSms_CarInfoDeleteSubmitError);
	smsCarInfoDelete.addEventListenerOnce("submit-timeout", onSms_CarInfoDeleteSubmitTimeout);
	smsCarInfoDelete.send();
}

function onSms_CarInfoDeleteSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_CarInfoDelete = e.control;
	
	var deleteCarInfoList = app.lookup("deleteCarInfoList");
	deleteCarInfoList.realDeleteRow(0);

	var gridUserList = app.lookup("UCMCP_grdCarList");	

	var carNumber = sms_CarInfoDelete.userAttr("carNumber");
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){
		gridUserList.deleteRow( parseInt(sms_CarInfoDelete.userAttr("rowIndex"),10));
		sendDeleteCarInfo();
	} else {		
		dataManager = getDataManager();
		dialogAlert(app, dataManager.getString("Str_Failed"), 
			carNumber+ " "+dataManager.getString("Str_Delete")+" "+dataManager.getString("Str_Failed")+"."+dataManager.getString(getErrorString(resultCode)));
		app.lookup("UCMCP_btnCarDelete").enabled = true;//연속 클릭 안되게
	}
}

function onSms_CarInfoDeleteSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_CarInfoDeleteSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}



exports.setSeasonTicketExpireAt = function(seasonTicketExpireAt){
	app.lookup("BPARK_optSeasonTicketExpireAt").value = seasonTicketExpireAt;
}

exports.getSeasonTicketExpireAt = function(){
	return app.lookup("BPARK_optSeasonTicketExpireAt");
}

exports.setDailyPaymentResult = function(msg){
	app.lookup("BPARK_optDailyPaymentResult").value = msg;
}

exports.getDailyPaymentResult = function(){
	return app.lookup("BPARK_optDailyPaymentResult");
}

/*
 * "등록 및 연장" 버튼(BPARK_btnSeasonTicket)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBPARK_btnSeasonTicketClick(/* cpr.events.CMouseEvent */ e){
	
	// 그룹이 있으면 리턴

	var dsInfo = app.lookup("BPARKInfoList");
	var seasonTicketPrice = dsInfo.findFirstRow("IndexKey == 3").getValue("BasicPrice");
	
	var msg = dataManager.getString("Str_BPARK_SeasonTicketPrice") + " : " + seasonTicketPrice;
	msg = msg + "\n" + dataManager.getString("Str_BPARK_SeasonTicketConfirm");
	
	dialogConfirm(app.getRootAppInstance(), "", msg, function( /*cpr.controls.Dialog*/ dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				var smsSeasonTicketUserInfoUpdate = new cpr.protocols.Submission("sms_postPutBPARKSeasonTicketUserInfo");
				smsSeasonTicketUserInfoUpdate.action = "/v1/oemData/bpark/"+UCMCP_userID+ "/expireAt"
				smsSeasonTicketUserInfoUpdate.method = "put";
				smsSeasonTicketUserInfoUpdate.mediaType = "application/x-www-form-urlencoded";
				smsSeasonTicketUserInfoUpdate.addResponseData(app.lookup("Result"), false, "Result");
					
				smsSeasonTicketUserInfoUpdate.addEventListenerOnce("submit-done", onSms_UserInfoSeasonTicketPostPutSubmitDone);
				smsSeasonTicketUserInfoUpdate.addEventListenerOnce("submit-error", onSms_UserInfoSeasonTicketPostPutSubmitError);
				smsSeasonTicketUserInfoUpdate.addEventListenerOnce("submit-timeout", onSms_UserInfoSeasonTicketPostPutSubmitTimeout);
				smsSeasonTicketUserInfoUpdate.send();
			} else {
				
			}
		});
	});
	
	
}

function onSms_UserInfoSeasonTicketPostPutSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){
		var submission = app.lookup("sms_getBPARKUser");
		submission.action = "/v1/oemData/bpark/user/" + UCMCP_userID;
		submission.send();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_UserInfoSeasonTicketPostPutSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_UserInfoSeasonTicketPostPutSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onBPARK_btnDelSeasonTicketClick(/* cpr.events.CMouseEvent */ e){
	
	var msg = dataManager.getString("Str_BPARK_SeasonTicketConfirm");
	
	dialogConfirm(app.getRootAppInstance(), "", msg, function( /*cpr.controls.Dialog*/ dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				var smsSeasonTicketUserInfoUpdate = new cpr.protocols.Submission("sms_postPutBPARKSeasonTicketUserInfo");
				smsSeasonTicketUserInfoUpdate.action = "/v1/oemData/bpark/"+UCMCP_userID+ "/expireAt/del"
				smsSeasonTicketUserInfoUpdate.method = "put";
				smsSeasonTicketUserInfoUpdate.mediaType = "application/x-www-form-urlencoded";
				smsSeasonTicketUserInfoUpdate.addResponseData(app.lookup("Result"), false, "Result");
					
				smsSeasonTicketUserInfoUpdate.addEventListenerOnce("submit-done", onSms_UserInfoSeasonTicketPostPutSubmitDone);
				smsSeasonTicketUserInfoUpdate.addEventListenerOnce("submit-error", onSms_UserInfoSeasonTicketPostPutSubmitError);
				smsSeasonTicketUserInfoUpdate.addEventListenerOnce("submit-timeout", onSms_UserInfoSeasonTicketPostPutSubmitTimeout);
				smsSeasonTicketUserInfoUpdate.send();
			} else {
				
			}
		});
	});
	
}

function onSms_getBPARKUserSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		
		
		var ticketExpireAt = app.lookup("BPARKUser").getValue("SeasonTicketExpireAt");
		if (ticketExpireAt.toString().split(" ")[0] == "0001-01-01" || ticketExpireAt.toString().split(" ")[0] == "2000-01-01") {
			app.lookup("BPARKUser").setValue("SeasonTicketExpireAt", "");
		} else if (ticketExpireAt.toString().length > 0 || ticketExpireAt.toString() != "") {
			app.lookup("BPARKUser").setValue("SeasonTicketExpireAt", ticketExpireAt.toString().split(" ")[0]);
		}
		var seasonTicketExpireAt = app.lookup("BPARKUser").getValue("SeasonTicketExpireAt");
		app.lookup("BPARK_optSeasonTicketExpireAt").value = seasonTicketExpireAt;
		
		var paymentTime = app.lookup("BPARKUser").getValue("PaymentTime");
		var strPaymentDate = paymentTime.toString().split(" ")[0];
		var today = getToday();
		var msg = "";

		if (today == strPaymentDate) {
			// 오늘 결제
			msg = dataManager.getString("Str_BPARK_CompletePayment");
		} else {
			// 결제 없음
			msg = dataManager.getString("Str_BPARK_NoPayment");
		}
		app.lookup("BPARK_optDailyPaymentResult").value = msg;
		app.lookup("BPARK_grpSeasonTicket").redraw();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_UserInfoDailyFarePostPutSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){
		var submission = app.lookup("sms_getBPARKUser");
		submission.action = "/v1/oemData/bpark/user/" + UCMCP_userID;
		submission.send();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_UserInfoDailyFarePostPutSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_UserInfoDailyFarePostPutSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function getToday(){
    var date = new Date();
    var year = date.getFullYear();
    var month = ("0" + (1 + date.getMonth())).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);

    return year + "-" + month + "-" + day;
}


// 당일 결제
function onBPARK_btnDailyFareClick(/* cpr.events.CMouseEvent */ e){
	var dsInfo = app.lookup("BPARKInfoList");
	var dailyPrice = dsInfo.findFirstRow("IndexKey == 4").getValue("BasicPrice");
	
	var msg = dataManager.getString("Str_BPARK_DailyPrice") + " : " + dailyPrice;
	msg = msg + "\n" + dataManager.getString("Str_BPARK_SeasonTicketConfirm");
	
	dialogConfirm(app.getRootAppInstance(), "", msg, function( /*cpr.controls.Dialog*/ dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				var smsDailyFareUserInfoUpdate = new cpr.protocols.Submission("sms_postPutBPARKDailyFareUserInfo");
				smsDailyFareUserInfoUpdate.action = "/v1/oemData/bpark/"+UCMCP_userID+ "/dailyFare"
				smsDailyFareUserInfoUpdate.method = "put";
				smsDailyFareUserInfoUpdate.mediaType = "application/x-www-form-urlencoded";
				smsDailyFareUserInfoUpdate.addResponseData(app.lookup("Result"), false, "Result");
					
				smsDailyFareUserInfoUpdate.addEventListenerOnce("submit-done", onSms_UserInfoDailyFarePostPutSubmitDone);
				smsDailyFareUserInfoUpdate.addEventListenerOnce("submit-error", onSms_UserInfoDailyFarePostPutSubmitError);
				smsDailyFareUserInfoUpdate.addEventListenerOnce("submit-timeout", onSms_UserInfoDailyFarePostPutSubmitTimeout);
				smsDailyFareUserInfoUpdate.send();
			} else {
				
			}
		});
	});
}
