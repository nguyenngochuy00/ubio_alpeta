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

//수정할 시간 유효성 체크를 위해
var firstInTime;
var firstOutTIme;

//결근 체크박스 여부
var checkAbsent = false;
var changeWorkType = false;

//근태기록 수정 여부, dialog 닫을 때 전달
var isUpdateCode = 1; //0: 수정, 1: no 수정
//데이터셋 1 row
var tnaResult;
var tnaResultHDHI;
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
	
	initCustomSetting();
	
	makeSendSms_getTnaResultList(userID, workDate, true);
}

//open일 때 비동기처리, dialog 닫을 시에는 비동기처리 off
function makeSendSms_getTnaResultList(userID, workDate, isOpening) {
	if ( dataManager.getOemVersion() == OEM_HYUNDAI_HI ) {
		var smsGetTnaListHDHI = new cpr.protocols.Submission("sms_getTnaResultListHDHI");
		smsGetTnaListHDHI.action = "/v1/hdhi/tna/periodResult";
		smsGetTnaListHDHI.method = "get";
		smsGetTnaListHDHI.mediaType = "application/x-www-form-urlencoded";
		smsGetTnaListHDHI.addResponseData(app.lookup("Result"), false, "Result");
		smsGetTnaListHDHI.addResponseData(app.lookup("tnaResultListHDHI"), false, "tnaResultList");
		
		//submit-success 리스너 추가. (함수 onSms_getTnaResultListSubmitSuccess)
		if (isOpening) { //onbodyLoad 시 사용
			smsGetTnaListHDHI.addEventListenerOnce("submit-success", onSms_getTnaResultListHDHISubmitSuccessOpen);
		} else { //앱 close 시 사용
			smsGetTnaListHDHI.addEventListenerOnce("submit-success", onSms_getTnaResultListHDHISubmitSuccessClose);
			//비동기처리 off
			smsGetTnaListHDHI.async = false;
		}
		
		//하나를 가져오기 위해 startDate,endDate를 같은 날짜로하고, user_id를 검색조건으로 설정
		smsGetTnaListHDHI.setParameters("searchCategory", "user_id");
		smsGetTnaListHDHI.setParameters("searchKeyword", userID);
		smsGetTnaListHDHI.setParameters("startTime", workDate);
		smsGetTnaListHDHI.setParameters("endTime", workDate);
		app.lookup("tnaResultListHDHI").clear();
		smsGetTnaListHDHI.send();	
	} else {
		//tnaResultList를 GET하는 submission 생성. 
		var smsGetTnaList = new cpr.protocols.Submission("sms_getTnaResultList");
		smsGetTnaList.action = "/v1/tna/periodResult";
		smsGetTnaList.method = "get";
		smsGetTnaList.mediaType = "application/x-www-form-urlencoded";
		smsGetTnaList.addResponseData(app.lookup("Result"), false, "Result");
		smsGetTnaList.addResponseData(app.lookup("tnaResultList"), false, "tnaResultList");
		
		//submit-success 리스너 추가. (함수 onSms_getTnaResultListSubmitSuccess)
		if (isOpening) { //onbodyLoad 시 사용
			smsGetTnaList.addEventListenerOnce("submit-success", onSms_getTnaResultListSubmitSuccessOpen);
		} else { //앱 close 시 사용
			smsGetTnaList.addEventListenerOnce("submit-success", onSms_getTnaResultListSubmitSuccessClose);
			//비동기처리 off
			smsGetTnaList.async = false;
		}
		
		//하나를 가져오기 위해 startDate,endDate를 같은 날짜로하고, user_id를 검색조건으로 설정
		smsGetTnaList.setParameters("searchCategory", "user_id");
		smsGetTnaList.setParameters("searchKeyword", userID);
		smsGetTnaList.setParameters("startTime", workDate);
		smsGetTnaList.setParameters("endTime", workDate);
		app.lookup("tnaResultList").clear();
		smsGetTnaList.send();	
	}
}

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms_getTnaResultListSubmitSuccessOpen( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getTnaResultList = e.control;
	
	var dsTnaList = app.lookup("tnaResultList");
	//submission이 성공하면 데이터셋 리스트 하나를 받아와서 보여줌 
	var tnaRow = dsTnaList.getRow(0);
	app.lookup("TNAEWR_opWorkDate").value = tnaRow.getValue("WorkDate");
	app.lookup("TNAEWR_opUserId").value = tnaRow.getValue("UserID");
	app.lookup("TNAEWR_opName").value = tnaRow.getValue("Name");
	app.lookup("TNAEWR_ipIntime").value = tnaRow.getValue("InTime").trim();
	firstInTime = tnaRow.getValue("InTime").trim();
	app.lookup("TNAEWR_ipOuttime").value = tnaRow.getValue("OutTime").trim();
	firstOutTIme = tnaRow.getValue("OutTime").trim();
	
	//shift(근무지정 시간)이 없을 때 disable
	if (tnaRow.getValue("ShiftName") === "") {
		dialogAlert(app.getHostAppInstance(), "error", dataManager.getString("Str_NoShift"));
		diableEdit();
	}
	comLib.hideLoadMask();
}

function diableEdit() {
	app.lookup("TNAEWR_ipIntime").enabled = false;
	app.lookup("TNAEWR_ipOuttime").enabled = false;
	app.lookup("TNAEWR_btnTnaEdit").dispose();
	app.lookup("TNAEWR_chkAbsence").dispose();
}
/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms_getTnaResultListSubmitSuccessClose( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getTnaResultList = e.control;
	
	tnaResult = app.lookup("tnaResultList");
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
	var inTime = app.lookup("TNAEWR_ipIntime").value;
	var outTime = app.lookup("TNAEWR_ipOuttime").value;
	
	//시간 00:00를 Minutes로 변환
	var WorkStartTm = util.ConvDHHMMtoMinute(inTime);
	var WorkEndTm = util.ConvDHHMMtoMinute(outTime);
	var convFirstIn = util.ConvDHHMMtoMinute(firstInTime);
	var convFirstOut = util.ConvDHHMMtoMinute(firstOutTIme);
	
	//시간 입력값 유효성 검사
	var bresult = setWorkShiftInfo(WorkStartTm, WorkEndTm);
	
	if ( dataManager.getOemVersion() == OEM_HYUNDAI_HI ) {
		if (bresult[0] === true || checkAbsent || changeWorkType) {
			// 시간 수정 시만 remark 검사
			var remark = app.lookup("TNAEWR_ipbRemark").value.trim();
			var workType = app.lookup("TNAEWR_cmbTnaType").value;
			
			//변경 값이 없으면 return (클라이언트에서 체크)
			if ((WorkStartTm === convFirstIn && WorkEndTm === convFirstOut) && !changeWorkType && !checkAbsent) {
				dialogAlert(app.getHostAppInstance(), "error", dataManager.getString("Str_NoChangeTimelineItems"));
				return;
			}
			
			if ((remark == "" || remark.length == 0) && workType == "0") {
				dialogAlert(app.getHostAppInstance(), "error", "비고 입력 바랍니다.");
				return;
			}

			//유효성 확인 완료. 근태 처리 전송
			makeSendSms_getTnaProcessing(WorkStartTm, WorkEndTm)
		} else {
			dialogAlert(app.getHostAppInstance(), "error", bresult[1]);
			return;
		}
		
	} else {
		if (bresult[0] === true || checkAbsent) {
			//변경 값이 없으면 return (클라이언트에서 체크)
			if (WorkStartTm === convFirstIn && WorkEndTm === convFirstOut) {
				dialogAlert(app.getHostAppInstance(), "error", dataManager.getString("Str_NoChangeTimelineItems"));
				return;
			}
			//유효성 확인 완료. 근태 처리 전송
			makeSendSms_getTnaProcessing(WorkStartTm, WorkEndTm)
		} else {
			dialogAlert(app.getHostAppInstance(), "error", bresult[1]);
			return;
		}
	}
}

/*
 * 입력시간의 유효성확인 함수
 */
function setWorkShiftInfo(WorkStartTm, WorkEndTm) {
	var strError = "";
	
	//변환한 시간이 false(-1)
	if (WorkStartTm < 0) {
		strError = dataManager.getString("Str_TimeFrame") + ": " + dataManager.getString("Str_ErrorTime");
		return [false, strError];
	}
	//변환한 시간이 false(-1)
	if (WorkEndTm < 0) {
		strError = dataManager.getString("Str_TimeFrame") + ": " + dataManager.getString("Str_ErrorTime");
		return [false, strError];
	}
	
	//퇴근시간 < 출근시간
	if (WorkEndTm < WorkStartTm) {
		strError = dataManager.getString("Str_TimeFrame") + ": " + dataManager.getString("Str_ErrorTime");
		return [false, strError];
	}
	return [true];
}

/*
 *출퇴근 시간 수정 및 근태처리 요청
 */
function makeSendSms_getTnaProcessing(inTime, outTime) {
	
	//tnaProcessing 요청 submission 생성. 
	var smsGetTnaProcessing = new cpr.protocols.Submission("sms_getTnaProcessing");
	smsGetTnaProcessing.action = "/v1/tna/tnaProcessing";
	smsGetTnaProcessing.method = "get";
	smsGetTnaProcessing.mediaType = "application/x-www-form-urlencoded";
	smsGetTnaProcessing.addResponseData(app.lookup("Result"), false, "Result");
	
	//submit-success 리스너 추가. (함수 onSms_getTnaResultListSubmitSuccess)
	smsGetTnaProcessing.addEventListenerOnce("submit-error", onSms_getTnaProcessingSubmitError);
	smsGetTnaProcessing.addEventListenerOnce("submit-timeout", onSms_getTnaProcessingSubmitTimeout);
	smsGetTnaProcessing.addEventListenerOnce("submit-done", onSms_getTnaProcessingSubmitDone);
	
	smsGetTnaProcessing.setParameters("category", "inOutTime");
	//한 사용자를 근태처리하기 위해 startDate,endDate를 같은 날짜로하고, user_id, intime, outtime을 설정
	smsGetTnaProcessing.setParameters("startTime", app.lookup("TNAEWR_opWorkDate").value);
	smsGetTnaProcessing.setParameters("endTime", app.lookup("TNAEWR_opWorkDate").value);
	smsGetTnaProcessing.setParameters("user_id", app.lookup("TNAEWR_opUserId").value);
	
	smsGetTnaProcessing.setParameters("inTime", inTime);
	smsGetTnaProcessing.setParameters("outTime", outTime);
	
	if ( dataManager.getOemVersion() == OEM_HYUNDAI_HI ) {
		var remark = app.lookup("TNAEWR_ipbRemark").value.trim();
		smsGetTnaProcessing.setParameters("remark", remark);	// 비고
		smsGetTnaProcessing.setParameters("workType", app.lookup("TNAEWR_cmbTnaType").value);   // 근태 종류
	}
	
	app.lookup("tnaResultList").clear();
	
	comLib.showLoadMask("", dataManager.getString("Str_Load"), "", 1);
	
	smsGetTnaProcessing.send();
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getTnaProcessingSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getTnaProcessingSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getTnaProcessingSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getTnaProcessing = e.control;
	
	var dmResult = app.lookup("Result");
	var result = dmResult.getValue("ResultCode");
	comLib.hideLoadMask();
	if (result == COMERROR_NONE) {
		dialogAlert(app.getHostAppInstance(), dataManager.getString("Str_Success"), dataManager.getString("Str_Complete"));
		
		//같은 창에서 다시 변경 가능하도록
		firstInTime = app.lookup("TNAEWR_ipIntime").value;
		firstOutTIme = app.lookup("TNAEWR_ipOuttime").value;

		//update 여부
		isUpdateCode = 0;
	} else {
		dialogAlert(app.getHostAppInstance(), dataManager.getString("Str_Warning"), dataManager.getString("Str_Error") + " : " + dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
		return;
	}
}

/*
 * 체크 박스에서 value-change 이벤트 발생 시 호출.
 * CheckBox의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 * 
 * 결근 처리 체크박스
 */
function onTNAEWR_chkAbsenceValueChange( /* cpr.events.CValueChangeEvent */ e) {
	/** 
	 * @type cpr.controls.CheckBox
	 */
	var tNAEWR_chkAbsence = e.control;
	//체크 여부
	checkAbsent = tNAEWR_chkAbsence.checked;
	var ipInTime = app.lookup("TNAEWR_ipIntime");
	var ipOutTime = app.lookup("TNAEWR_ipOuttime");
	
	if (checkAbsent) {
		ipInTime.value = "#--:--";
		ipOutTime.value = "#--:--";
		
		if ( dataManager.getOemVersion() == OEM_HYUNDAI_HI ) {
			app.lookup("TNAEWR_cmbTnaType").value = "0";
		}
		
	} else {
		ipInTime.value = firstInTime;
		ipOutTime.value = firstOutTIme;
	}
	ipInTime.enabled = !checkAbsent;
	ipOutTime.enabled = !checkAbsent;
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
		makeSendSms_getTnaResultList(userID, workDate, false);
		
		if ( dataManager.getOemVersion() == OEM_HYUNDAI_HI ) {
			app.close({
				"Result": isUpdateCode,
				"SelectedRow": tnaResultHDHI.getRowData(0)
			});
		} else {
			//요일 변환 작업
			util.setDayofWeekLangMapping(tnaResult, dataManager);
			app.close({
				"Result": isUpdateCode,
				"SelectedRow": tnaResult.getRowData(0)
			});
		}
		
	} else {
		app.close({
			"Result": isUpdateCode
		})
	}
}

function initCustomSetting() {
	if ( dataManager.getOemVersion() == OEM_HYUNDAI_HI ) {
		app.lookup("TNAEWR_grpRemark").visible = true;
		app.lookup("TNAEWR_grpTnaType").visible = true;
		
		// 근태리스트 콤보박스 세팅
		var requestData = app.lookup("sms_getWorkTypeList");
		requestData.send();
	}
}

function onSms_getTnaResultListHDHISubmitSuccessOpen( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getTnaResultList = e.control;
	
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dsTnaList = app.lookup("tnaResultListHDHI");
		var tnaRow = dsTnaList.getRow(0);
		app.lookup("TNAEWR_opWorkDate").value = tnaRow.getValue("WorkDate");
		app.lookup("TNAEWR_opUserId").value = tnaRow.getValue("UserID");
		app.lookup("TNAEWR_opName").value = tnaRow.getValue("Name");
		app.lookup("TNAEWR_ipIntime").value = tnaRow.getValue("InTime").trim();
		firstInTime = tnaRow.getValue("InTime").trim();
		app.lookup("TNAEWR_ipOuttime").value = tnaRow.getValue("OutTime").trim();
		firstOutTIme = tnaRow.getValue("OutTime").trim();
		app.lookup("TNAEWR_ipbRemark").value = tnaRow.getValue("Remark");

		var dsWorkTypeList = app.lookup("WorkTypeList");
		if (dsWorkTypeList.getRowCount() > 0) {
			var workTypeName = tnaRow.getValue("WorkTypeName");
			app.lookup("TNAEWR_cmbTnaType").selectItemByLabel(workTypeName);
		}
		
		//shift(근무지정 시간)이 없을 때 disable
		if (tnaRow.getValue("ShiftName") === "") {
			dialogAlert(app.getHostAppInstance(), "error", dataManager.getString("Str_NoShift"));
			diableEdit();
		}

	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
		return
	}
}

function onSms_getTnaResultListHDHISubmitSuccessClose( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getTnaResultList = e.control;
	
	tnaResultHDHI = app.lookup("tnaResultListHDHI");
}

function onSms_getWorkTypeListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getWorkTypeList = e.control;
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode")
	if( resultCode == COMERROR_NONE){
		app.lookup("TNAEWR_cmbTnaType").redraw();
	} else {
		app.lookup("TNAEWR_grpTnaType").enabled = false;
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
		return
	}
}

function onSms_getWorkTypeListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getWorkTypeListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onTNAEWR_cmbTnaTypeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var tNAEWR_cmbTnaType = e.control;
	var workType = tNAEWR_cmbTnaType.value;
	var ipInTime = app.lookup("TNAEWR_ipIntime");
	var ipOutTime = app.lookup("TNAEWR_ipOuttime");

	if (workType == "0") {
		ipInTime.value = firstInTime;
		ipOutTime.value = firstOutTIme;
		ipInTime.enabled = true;
		ipOutTime.enabled = true;
		changeWorkType = false;
	} else {
		app.lookup("TNAEWR_chkAbsence").value = false;
		ipInTime.value = "#--:--";
		ipOutTime.value = "#--:--";
		ipInTime.enabled = false;
		ipOutTime.enabled = false;
		changeWorkType = true;
	}
}
