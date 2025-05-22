/************************************************
 * tnaEditWorkResult.js
 * Created at 2021. 4. 27. 오후 4:59:47.
 *
 * @author hjh
 ************************************************/

var util = cpr.core.Module.require("lib/util");
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;

//parameter, 다수사용
var userID;
var workDate;

//근태기록 수정 여부, dialog 닫을 때 전달
var isUpdateCode = 1; //0: 수정, 1: no 수정
//데이터셋 1 row
var tnaResult;
/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad( /* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	comLib = createComUtil(app);
	comLib.showLoadMask("", dataManager.getString("Str_Load"), "", 1);
	var initValue = app.getHost().initValue;
	userID = initValue["UserId"];
	workDate = initValue["WorkDate"];

	makeSendSms_getTnaMonthResultList(userID, workDate, true);
}

//open일 때 비동기처리, dialog 닫을 시에는 비동기처리 off
function makeSendSms_getTnaMonthResultList(userID, workDate, isOpening) {
	
	var smsGetTnaListHDHI = new cpr.protocols.Submission("sms_getTnaMonthResultListHDHI");
	smsGetTnaListHDHI.action = "/v1/hdhi/tna/monthPeriodResult";
	smsGetTnaListHDHI.method = "get";
	smsGetTnaListHDHI.mediaType = "application/x-www-form-urlencoded";
	smsGetTnaListHDHI.addResponseData(app.lookup("Result"), false, "Result");
	smsGetTnaListHDHI.addResponseData(app.lookup("tnaMonthResultList"), false, "tnaMonthResultList");
	
	//submit-success 리스너 추가. (함수 onSms_getTnaResultListSubmitSuccess)
	if (isOpening) { //onbodyLoad 시 사용
		smsGetTnaListHDHI.addEventListenerOnce("submit-success", onSms_getTnaMonthResultListHDHISubmitSuccessOpen);
	} else { //앱 close 시 사용
		smsGetTnaListHDHI.addEventListenerOnce("submit-success", onSms_getTnaMonthResultListHDHISubmitSuccessClose);
		//비동기처리 off
		smsGetTnaListHDHI.async = false;
	}
	
	smsGetTnaListHDHI.setParameters("searchCategory", "user_id");
	smsGetTnaListHDHI.setParameters("searchKeyword", userID);
	smsGetTnaListHDHI.setParameters("startTime", workDate);
	smsGetTnaListHDHI.setParameters("offset", 0);
	smsGetTnaListHDHI.setParameters("limit", 1);

	app.lookup("tnaMonthResultList").clear();
	smsGetTnaListHDHI.send();
}

/*
 * 버튼(TNAEWR_btnTnaEdit)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTNAEWR_btnTnaEditClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var tNAEWR_btnTnaEdit = e.control;
	var remark = app.lookup("TEWMR_ipbRemark").value.trim();

	if (remark == "" || remark.length == 0) {
		dialogAlert(app.getHostAppInstance(), "error", "비고 입력 바랍니다.");
		return;
	}

	//유효성 확인 완료. 근태 처리 전송
	makeSendSms_getTnaMonthProcessing();

}

function makeSendSms_getTnaMonthProcessing(inTime, outTime) {
	
	//tnaProcessing 요청 submission 생성. 
	var smsGetTnaProcessing = new cpr.protocols.Submission("sms_getTnaProcessing");
	smsGetTnaProcessing.action = "/v1/tna/tnaProcessing";
	smsGetTnaProcessing.method = "get";
	smsGetTnaProcessing.mediaType = "application/x-www-form-urlencoded";
	smsGetTnaProcessing.addResponseData(app.lookup("Result"), false, "Result");
	
	//submit-success 리스너 추가. (함수 onSms_getTnaResultListSubmitSuccess)
	smsGetTnaProcessing.addEventListenerOnce("submit-error", onSms_getTnaMonthProcessingSubmitError);
	smsGetTnaProcessing.addEventListenerOnce("submit-timeout", onSms_getTnaMonthProcessingSubmitTimeout);
	smsGetTnaProcessing.addEventListenerOnce("submit-done", onSms_getTnaMonthProcessingSubmitDone);
	
	smsGetTnaProcessing.setParameters("category", "monthProcess");
	smsGetTnaProcessing.setParameters("startTime", app.lookup("TEWMR_opWorkDate").value);
	smsGetTnaProcessing.setParameters("user_id", app.lookup("TEWMR_opUserId").value);


	var remark = app.lookup("TEWMR_ipbRemark").value.trim();
	smsGetTnaProcessing.setParameters("remark", remark);	// 비고
	
	app.lookup("tnaMonthResultList").clear();
	
	comLib.showLoadMask("", dataManager.getString("Str_Load"), "", 1);
	
	smsGetTnaProcessing.send();
}

function onSms_getTnaMonthProcessingSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getTnaMonthProcessingSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getTnaMonthProcessingSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getTnaProcessing = e.control;
	
	var dmResult = app.lookup("Result");
	var result = dmResult.getValue("ResultCode");
	comLib.hideLoadMask();
	if (result == COMERROR_NONE) {
		dialogAlert(app.getHostAppInstance(), dataManager.getString("Str_Success"), dataManager.getString("Str_Complete"));

		//update 여부
		isUpdateCode = 0;
	} else {
		dialogAlert(app.getHostAppInstance(), dataManager.getString("Str_Warning"), dataManager.getString("Str_Error") + " : " + dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
		return;
	}
}

/*
 * 버튼(TNAEWR_btnCancel)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTNAEWR_btnCancelClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var tNAEWR_btnCancel = e.control;
	//업데이트 된 경우 업데이트 된 tnaResultList 1행을 다시 조회해서 내려줌
	if (isUpdateCode == 0) {
		//tnaResult 업데이트
		makeSendSms_getTnaMonthResultList(userID, workDate, false);
		app.close({
			"Result": isUpdateCode,
			"SelectedRow": tnaResult.getRowData(0)
		});
	} else {
		app.close({
			"Result": isUpdateCode
		})
	}
}

function onSms_getTnaMonthResultListHDHISubmitSuccessOpen( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getTnaResultList = e.control;
	
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dsTnaList = app.lookup("tnaMonthResultList");
		var tnaRow = dsTnaList.getRow(0);
		var year = tnaRow.getValue("WorkYear").toString().slice(0, -1);
		var month = tnaRow.getValue("WorkMonth").toString().slice(0, -1);
		
		app.lookup("TEWMR_opWorkDate").value = year + "-" + month;
		app.lookup("TEWMR_opUserId").value = tnaRow.getValue("UserID");
		app.lookup("TEWMR_opName").value = tnaRow.getValue("Name");
		app.lookup("TEWMR_ipbRemark").value = tnaRow.getValue("Remark");

	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
		return
	}
}

function onSms_getTnaMonthResultListHDHISubmitSuccessClose( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getTnaResultList = e.control;
	
	tnaResult = app.lookup("tnaMonthResultList");
}


