/************************************************
 * tnaWorkShift.js
 * Created at 2018. 10. 22. 오전 10:53:20.
 *
 * @author joymrk
 ************************************************/
var DateLib = cpr.core.Module.require("lib/DateLib");
var StrLib = cpr.core.Module.require("lib/StrLib");
var inputValidManager = createInputValidator(app);
var dataManager = cpr.core.Module.require("lib/DataManager");
var usint_version;
var comLib;
var _SendMode;

var TNAWT_userCntPerRequest = 2000;
var TNAWT_total = 0;

function onBodyLoad( /* cpr.events.CEvent */ e) {
	_SendMode = 'Normal'
	comLib = createComUtil(app);
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	
	initCustomSetting();
	
	var grid = new cpr.controls.Grid("");
	var requestData = app.lookup("sms_getWorkType");
	requestData.action = "/v1/tna/schedule";
	console.log(requestData.action);
	requestData.send();
}

// 근무  스케쥴 그리드 그리는 함수
function Refresh_grdSchedule(basicDay, spinCnt, shiftCode) {
	if (basicDay == '' || basicDay == null) {
		return;
	}
	if (spinCnt <= 0) {
		return;
	}
	app.lookup("dsWorkScheduleList").clear();
	
	var shiftCodes = new Array();
	var cnt = 0;
	for (var idx = 0; idx < shiftCode.length; idx += 2) {
		shiftCodes[cnt] = shiftCode.substr(idx, 2);
		cnt++;
	}
	var Schedule = app.lookup("TAWTD_grdSchedule");
	for (var i = 0; i < spinCnt; i++) {
		
		var strCode = shiftCodes[i];
		if (strCode == undefined) {
			strCode = '**';
		}
		
		if (i == 0) { // 기준일부터
			var strday = DateLib.DayOftheWeek(basicDay);
			strday = setDataLangMapping(strday);
			var tmpDate = basicDay.substr(0, 4) + "-" + basicDay.substr(4, 2) + "-" + basicDay.substr(6, 2);
			Schedule.insertRowData(i + 1, true, {
				'workDate': tmpDate,
				'workDay': strday,
				'workShift': strCode
			}, false);
			continue;
		}
		
		var strdate = DateLib.nextDate(basicDay, i);
		var strday = DateLib.DayOftheWeek(strdate);
		strday = setDataLangMapping(strday);
		var tmpDate = strdate.substr(0, 4) + "-" + strdate.substr(4, 2) + "-" + strdate.substr(6, 2);
		Schedule.insertRowData(i + 1, true, {
			'workDate': tmpDate,
			'workDay': strday,
			'workShift': strCode
		}, false);
	}
	Schedule.redraw();
}

function setDataLangMapping(strday) {
	//console.log(dataManager.getLocale());
	switch (strday) {
		case "월":
			strday = dataManager.getString("Str_FirstLetterMonDay")
			break;
		case "화":
			strday = dataManager.getString("Str_FirstLetterTuesDay")
			break;
		case "수":
			strday = dataManager.getString("Str_FirstLetterWednesday")
			break;
		case "목":
			strday = dataManager.getString("Str_FirstLetterThursDay")
			break;
		case "금":
			strday = dataManager.getString("Str_FirstLetterFriDay")
			break;
		case "토":
			strday = dataManager.getString("Str_FirstLetterSaturDay")
			break;
		case "일":
			strday = dataManager.getString("Str_FirstLetterSunDay")
			break;
	}
	return strday
}

function RefreshData(Code) { // 초기설정 세팅
	var dmWorkType = app.lookup("dmSelectedWorkType");
	
	if (Code == "" || Code == null) { //init
		dmWorkType.reset(); // 초기 값 재설정
		dmWorkType.setValue("BasicDay", DateLib.getToday());
	} else { // Selection-Change
		if (Code == undefined) {
			return;
		}
	}
	app.lookup("TAWTD_ipbCode").value = dmWorkType.getValue("Code");
	app.lookup("TAWTD_ipbName").value = dmWorkType.getValue("Name");
	var HCode = dmWorkType.getValue("HolidayCode");
	if (HCode == '****') {
		HCode = '0';
	}
	app.lookup("TAWTD_cmbHolidayCode").value = Number(HCode);
	
	app.lookup("TAWTD_cmbHolidayShift").value = dmWorkType.getValue("HoliShift");
	app.lookup("TAWTD_dtiBasicDay").value = dmWorkType.getValue("BasicDay");
	app.lookup("TAWTD_cmbSpinCount").value = dmWorkType.getValue("SpinCount");
	
	Refresh_grdSchedule(dmWorkType.getValue("BasicDay"), dmWorkType.getValue("SpinCount"), dmWorkType.getValue("ShiftCode"));
}

//---------------------------------------------------------------------------------------> getWorkTypeSubmit
function onSms_getWorkTypeSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	
	var sms_getWorkType = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		RefreshData("");
	} else {
		//var strError = dataManager.getString("Str_TNAWorkTypeSetting") + ": " +dataManager.getString("Str_ErrorGetDataFail");
		var strError = dataManager.getString("Str_TNAWorkTypeSetting") + ": " + dataManager.getString(getErrorString(resultCode));
		dialogAlert(app, dataManager.getString("Str_Failed"), strError);
		//console.log("get Date error!! : ");
	}
}

function onSms_getWorkTypeSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getWorkTypeSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

//---------------------------------------------------------------------------------------< getWorkTypeSubmit
function onTAWTD_grdWorkTypeSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/**
	 * @type cpr.controls.Grid
	 */
	var tAWTD_grdWorkType = e.control;
	var selectedRow = tAWTD_grdWorkType.getSelectedRow();
	if (selectedRow) {
		var dmWorkTypeTiny = app.lookup("dmWorkTypeTiny");
		dmWorkTypeTiny.clear();
		var getRowData = selectedRow.getRowData();
		app.lookup("dmSelectedWorkType").reset();
		var requestData = app.lookup("sms_getSelectedWorkType");
		requestData.action = '/v1/tna/schedule/' + selectedRow.getValue("Code");
		requestData.send();
	} else {
		// 전송 및 clear 상태 모두 초기화
		//app.lookup("dmSelectedWorkType").reset(); // 현재 리셋 안되는 증상 발생
		initSelectedWorkType();
		RefreshData("");
	}
}

function initSelectedWorkType() {
	var dmSelectedWorkType = app.lookup("dmSelectedWorkType");
	dmSelectedWorkType.clear();
	var initSelectedWorkType = app.lookup("initSelectedWorkType");
	initSelectedWorkType.copyToDataMap(dmSelectedWorkType);
}
//--------------------------------------------------------------------------------------------------> Sms_getSelectedWorkType
function onSms_getSelectedWorkTypeSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/**
	 * @type cpr.protocols.Submission
	 */
	var sms_getSelectedWorkType = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dmSelectedWorkType = app.lookup("dmSelectedWorkType");
		RefreshData(dmSelectedWorkType.getValue("Code"));
	} else {
		//var strError = dataManager.getString("Str_TNAWorkTypeSetting") + ": " +dataManager.getString("Str_ErrorGetDataFail");
		var strError = dataManager.getString("Str_TNAWorkTypeSetting") + ": " + dataManager.getString(getErrorString(resultCode));
		dialogAlert(app, dataManager.getString("Str_Failed"), strError);
		//console.log("get selected T&a Info getDate error!! : ");
	}
}

function onSms_getSelectedWorkTypeSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getSelectedWorkTypeSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
//--------------------------------------------------------------------------------------------------< Sms_getSelectedWorkType

function onTAWTD_cmbSpinCountSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/**
	 * @type cpr.controls.ComboBox
	 */
	var tAWTD_cmbSpinCount = e.control;
	var basicDay = app.lookup("TAWTD_dtiBasicDay").value;
	Refresh_grdSchedule(basicDay, tAWTD_cmbSpinCount.value, app.lookup("dmSelectedWorkType").getValue("ShiftCode"));
}

function onTAWTD_dtiBasicDayValueChange( /* cpr.events.CValueChangeEvent */ e) {
	
	var tAWTD_dtiBasicDay = e.control;
	var spinCnt = app.lookup("TAWTD_cmbSpinCount").value;
	Refresh_grdSchedule(tAWTD_dtiBasicDay.value, spinCnt, app.lookup("dmSelectedWorkType").getValue("ShiftCode"));
}

function onTAWTD_btnWorkDetailSettingClick( /* cpr.events.CMouseEvent */ e) {
	/**
	 * @type cpr.controls.Button
	 */
	var tAWTD_btnWorkDetailSetting = e.control;
	
	if ( dataManager.getOemVersion() == OEM_HYUNDAI_HI ) {
		btnWorkTypeSettingClickHDHI();
		return
	}
	
	var path = "app/main/tna/popup/tnaDetailWorkTime";
	var WorkDetailSetting;
	var strTitle = '';
	var dmSelWorkType = app.lookup("dmSelectedWorkType");
	var popupType = 0;
	switch (tAWTD_btnWorkDetailSetting.id) {
		case 'TAWTD_btnBasicWorkDetailSetting':
			WorkDetailSetting = app.lookup("dmBasicWorkDetailSetting");
			dmSelWorkType.copyToDataMap(WorkDetailSetting);
			
			strTitle = dataManager.getString("Str_SetNomalTime");
			popupType = 0;
			break;
		case 'TAWTD_btnEarlyWorkDetailSetting':
			WorkDetailSetting = app.lookup("dmEarlyWorkDetailSetting");
			dmSelWorkType.copyToDataMap(WorkDetailSetting);
			strTitle = dataManager.getString("Str_SetTimeBeforeShift");
			popupType = 1;
			break;
		case 'TAWTD_btnOvertimeDetailSetting1':
			WorkDetailSetting = app.lookup("dmOverWorkDetailSetting");
			dmSelWorkType.copyToDataMap(WorkDetailSetting);
			
			strTitle = dataManager.getString("Str_SetOvertime1Hours");
			popupType = 2;
			break;
		case 'TAWTD_btnNightWorkDetailSetting':
			WorkDetailSetting = app.lookup("dmNightWorkDetailSetting");
			dmSelWorkType.copyToDataMap(WorkDetailSetting);
			
			strTitle = dataManager.getString("Str_SetOvertime2Hours");
			popupType = 3;
			break;
		case 'TAWTD_btnHolidayWorkDetailSetting':
			WorkDetailSetting = app.lookup("dmHolidayWorkDetailSetting");
			dmSelWorkType.copyToDataMap(WorkDetailSetting);
			
			strTitle = dataManager.getString("Str_SetOffDayHours");
			popupType = 4;
			break;
		case 'TAWTD_btnOvertimeDetailSetting2':
			WorkDetailSetting = app.lookup("dmOverWorkDetailSetting2");
			dmSelWorkType.copyToDataMap(WorkDetailSetting);
			
			strTitle = dataManager.getString("Str_SetOvertime3Hours");
			popupType = 5;
			break;
		default:
			break;
	}
	path = path + "?" + usint_version;
	app.getRootAppInstance().openDialog(path, {
		width: 520,
		height: 420
	}, function(dialog) {
		dialog.initValue = {
			"popupType": popupType,
			"WorkDetailSetting": WorkDetailSetting
		};
		dialog.headerTitle = strTitle;
		dialog.modal = true;
	}).then(function(returnValue) {
		
		if (tAWTD_btnWorkDetailSetting.id == 'TAWTD_btnBasicWorkDetailSetting') {
			returnValue.copyToDataMap(app.lookup("dmSelectedWorkType"));
			initDetailSetting("dmBasicWorkDetailSetting");
			//app.lookup("dmBasicWorkDetailSetting").reset();
		} else if (tAWTD_btnWorkDetailSetting.id == 'TAWTD_btnEarlyWorkDetailSetting') {
			returnValue.copyToDataMap(app.lookup("dmSelectedWorkType"));
			initDetailSetting("dmEarlyWorkDetailSetting");
			//app.lookup("dmEarlyWorkDetailSetting").reset();
		} else if (tAWTD_btnWorkDetailSetting.id == 'TAWTD_btnOvertimeDetailSetting1') {
			returnValue.copyToDataMap(app.lookup("dmSelectedWorkType"));
			initDetailSetting("dmOverWorkDetailSetting");
			//app.lookup("dmOverWorkDetailSetting").reset();
		} else if (tAWTD_btnWorkDetailSetting.id == 'TAWTD_btnNightWorkDetailSetting') {
			returnValue.copyToDataMap(app.lookup("dmSelectedWorkType"));
			initDetailSetting("dmNightWorkDetailSetting");
			//app.lookup("dmNightWorkDetailSetting").reset();
		} else if (tAWTD_btnWorkDetailSetting.id == 'TAWTD_btnHolidayWorkDetailSetting') {
			returnValue.copyToDataMap(app.lookup("dmSelectedWorkType"));
			initDetailSetting("dmHolidayWorkDetailSetting");
			//app.lookup("dmHolidayWorkDetailSetting").reset();
		} else if (tAWTD_btnWorkDetailSetting.id == 'TAWTD_btnOvertimeDetailSetting2') {
			returnValue.copyToDataMap(app.lookup("dmSelectedWorkType"));
			initDetailSetting("dmOverWorkDetailSetting2");
			//app.lookup("dmOverWorkDetailSetting2").reset();
		}
		
	});
}

function initDetailSetting(DataMapID) {
	var dmDetailSetting = app.lookup(DataMapID);
	dmDetailSetting.clear();
	if (DataMapID == "dmBasicWorkDetailSetting") {
		var initDetailSetting = app.lookup("initBasicWorkDetailSetting");
		initDetailSetting.copyToDataMap(dmDetailSetting)
	} else if (DataMapID == "dmEarlyWorkDetailSetting") {
		var initDetailSetting = app.lookup("initEarlyWorkDetailSetting");
		initDetailSetting.copyToDataMap(dmDetailSetting)
	} else if (DataMapID == "dmOverWorkDetailSetting") {
		var initDetailSetting = app.lookup("initOverWorkDetailSetting");
		initDetailSetting.copyToDataMap(dmDetailSetting)
	} else if (DataMapID = "dmNightWorkDetailSetting") {
		var initDetailSetting = app.lookup("initNightWorkDetailSetting");
		initDetailSetting.copyToDataMap(dmDetailSetting);
	} else if (DataMapID == "dmHolidayWorkDetailSetting") {
		var initDetailSetting = app.lookup("initHolidayWorkDetailSetting");
		initDetailSetting.copyToDataMap(dmDetailSetting);
	} else if (DataMapID = "dmOverWorkDetailSetting2") {
		var initDetailSetting = app.lookup("initOverWorkDetailSetting2");
		initDetailSetting.copyToDataMap(dmDetailSetting);
	}
}

function onTAWTD_btnSendClick( /* cpr.events.CMouseEvent */ e) {
	var tAWTD_btnSend = e.control;
	var Code = app.lookup("TAWTD_ipbCode").value;
	if (!Code) { // 근무 형태 코드 입력상태 체크
		inputValidManager.validate(app.lookup("TAWTD_ipbCode"), "isNull", "Code" + dataManager.getString("Str_CommonRequiredAlert"));
		return;
	}
	var cmbHolidayCode = app.lookup("TAWTD_cmbHolidayCode");
	if (cmbHolidayCode.value == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarningHolidayCodeNotSelected"));
		return;
	}
	var WorkScheduleList = app.lookup("dsWorkTypeTinyList");
	var getfindInfo = WorkScheduleList.findFirstRow("Code == '" + Code + "'"); // 등록된 코드 있는지 확인
	if (getfindInfo) { // Modify
		_SendMode = 'Modi';
		var bResult = SetSendData(_SendMode); // bResult [code , txt], true 이면 정상, false 면 error
		if (bResult[0] == true) {
			// send put
			var requestData = app.lookup("sms_putSelectedWorkType");
			requestData.action = '/v1/tna/schedule/' + bResult[1];
			console.debug(requestData.action);
			requestData.send();
		} else {
			dialogAlert(app, "fail", bResult[1]);
		}
	} else { // 없어! Add
		_SendMode = 'Add';
		var bResult = SetSendData(_SendMode); // bResult [code , txt], true 이면 정상, false 면 error
		if (bResult[0] == true) {
			// send post
			var requestData = app.lookup("sms_postSelectedWorkType");
			requestData.action = '/v1/tna/schedule/' + bResult[1];
			console.debug(requestData.action);
			requestData.send();
		} else {
			dialogAlert(app, "fail", bResult[1]);
		}
	}
}

function SetSendData(_SendMode) {
	var dmSelWorkType = app.lookup("dmSelectedWorkType");
	var tmpCode = "";
	if (_SendMode == 'Add') { //추가 인경우만 사용
		tmpCode = app.lookup("TAWTD_ipbCode").value;
		if (tmpCode.length < 4) {
			dmSelWorkType.setValue("Code", StrLib.lpad(tmpCode, 4, "0"));
		} else {
			dmSelWorkType.setValue("Code", tmpCode);
		}
	}
	
	dmSelWorkType.setValue("Name", app.lookup("TAWTD_ipbName").value); // 이름
	
	var tmpHolidayCode = app.lookup("TAWTD_cmbHolidayCode").value; //공휴일 정보
	if (tmpHolidayCode == 0) {
		tmpHolidayCode = '****';
	} else {
		dmSelWorkType.setValue("HolidayCode", StrLib.lpad(tmpHolidayCode, 4, "0"));
	}
	
	var tmpHoliShift = app.lookup("TAWTD_cmbHolidayShift").value; //공휴일 정보
	if (tmpHoliShift.length < 0) {
		tmpHoliShift = '**'
	}
	dmSelWorkType.setValue("HoliShift", tmpHoliShift);
	
	var tmpbDay = app.lookup("TAWTD_dtiBasicDay").value //기준일자
	tmpbDay.replace("-", "");
	
	if (String(tmpbDay).length != 8) {
		var strError = dataManager.getString("Str_SetSchedule") + ": " + dataManager.getString("Str_ErrorInvalidReferenceDate");
		return [false, strError];
	}
	dmSelWorkType.setValue("BasicDay", String(tmpbDay));
	
	dmSelWorkType.setValue("SpinCount", app.lookup("TAWTD_cmbSpinCount").value);
	
	// spinDays 근무지정코드
	var tmpShiftCode = '';
	var spinDays = app.lookup("dsWorkScheduleList");
	var rowCnt = spinDays.getRowCount();
	// 어레이로 풀어서 줘야한다.
	for (var i = 0; i < rowCnt; i++) {
		var row = spinDays.getRow(i);
		var getCode = row.getValue("workShift");
		if (getCode == '**') {
			var strError = dataManager.getString("Str_SetSchedule") + "- " + dataManager.getString("Str_TNAPayRate") + ": " + dataManager.getString("Str_ErrorCouldNotSave");
			return [false, strError];
		} else {
			tmpShiftCode = tmpShiftCode + getCode;
		}
	}
	
	dmSelWorkType.setValue("ShiftCode", tmpShiftCode);
	tmpCode = dmSelWorkType.getValue("Code");
	app.lookup("dmWorkTypeTiny").setValue("Code", tmpCode);
	app.lookup("dmWorkTypeTiny").setValue("Name", dmSelWorkType.getValue("Name"));
	return [true, tmpCode];
}
//------------------------------------------------------------------------------------------> postSelectedWorkType
function onSms_postSelectedWorkTypeSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	_SendMode = 'Normal';
	var dmWorkTypeTiny = app.lookup("dmWorkTypeTiny");
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		
		var dsWorkTypeTinyList = app.lookup("dsWorkTypeTinyList");
		dsWorkTypeTinyList.addRowData(dmWorkTypeTiny.getDatas());
		dsWorkTypeTinyList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
		
	} else {
		//var strError = dataManager.getString("Str_TNAWorkTypeSetting") + ": " +dataManager.getString("Str_ErrorGetDataFail");
		var strError = dataManager.getString("Str_TNAWorkTypeSetting") + ": " + dataManager.getString(getErrorString(resultCode));
		dialogAlert(app, dataManager.getString("Str_Failed"), strError);
		console.log("get selected T&a Info getDate error!! : ");
		dmWorkTypeTiny.clear();
	}
	
	var grd = app.lookup("TAWTD_grdWorkType");
	grd.clearSelection();
	grd.redraw();
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_postSelectedWorkTypeSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_postSelectedWorkTypeSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
//------------------------------------------------------------------------------------------<Sms_postSelectedWorkType
//------------------------------------------------------------------------------------------>Sms_putSelectedWorkType 
function onSms_putSelectedWorkTypeSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	
	_SendMode = 'Normal';
	var dmWorkTypeTiny = app.lookup("dmWorkTypeTiny");
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dsWorkTypeTinyList = app.lookup("dsWorkTypeTinyList");
		var getfindInfo = dsWorkTypeTinyList.findFirstRow("Code == '" + dmWorkTypeTiny.getValue("Code") + "'");
		getfindInfo.setRowData(dmWorkTypeTiny.getDatas());
		dsWorkTypeTinyList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	} else {
		//var strError = dataManager.getString("Str_TNAWorkTypeSetting") + ": " +dataManager.getString("Str_ErrorGetDataFail");
		var strError = dataManager.getString("Str_TNAWorkTypeSetting") + ": " + dataManager.getString(getErrorString(resultCode));
		dialogAlert(app, dataManager.getString("Str_Failed"), strError);
		console.log("get selected T&a Info getDate error!! : ");
		
	}
	dmWorkTypeTiny.clear();
	var grd = app.lookup("TAWTD_grdWorkType");
	grd.clearSelection();
	grd.redraw();
}

function onSms_putSelectedWorkTypeSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_putSelectedWorkTypeSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
//--------------------------------------------------------------------------------------------------
/*
 * "삭  제" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTAWTD_btnDeleteClick( /* cpr.events.CMouseEvent */ e) {
	var tAWTD_btnDelete = e.control;
	//1. code null 확인 2. 코드 리스트 있는지 확인
	//3. 삭제 요청
	var Code = app.lookup("TAWTD_ipbCode").value;
	
	if (Code == '' || Code == null || Code == undefined) { // 근무 형태 코드 입력상태 체크
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorNotExistWorkTypeCode"));
		//dialogAlert(app, "Warning", "[근무 형태 등록]에서 [코  드] 값이 없습니다.");
		return;
	}
	var WorkScheduleList = app.lookup("dsWorkTypeTinyList");
	var getfindInfo = WorkScheduleList.findFirstRow("Code == '" + Code + "'"); // 등록된 코드 있는지 확인
	
	if (getfindInfo) {
	//	WorkScheduleList.deleteRow(getfindInfo.getIndex());
		var requestData = app.lookup("sms_deleteWorkType");
		requestData.action = '/v1/tna/schedule/' + Code;
		console.log(requestData.action);
		requestData.send();
	} else {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorTNACodeUnregiCode"));
		return;
	}
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_deleteWorkTypeSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/**
	 * @type cpr.protocols.Submission
	 */
	var sms_deleteWorkType = e.control;
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	if (ResultCode == COMERROR_NONE) {
		_SendMode = 'Normal';
		var Code = app.lookup("TAWTD_ipbCode").value;
		var WorkScheduleList = app.lookup("dsWorkTypeTinyList");
		var getfindInfo = WorkScheduleList.findFirstRow("Code == '" + Code + "'");
		WorkScheduleList.deleteRow(getfindInfo.getIndex());
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorFailWorkTypeDelete"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(ResultCode)));
		console.log("get selected T&a Info getDate error!! : ");
	}
	
	app.lookup("dmWorkTypeTiny").clear();
	app.lookup("dmSelectedWorkType").reset();
	app.lookup("dsWorkScheduleList").clear();
	RefreshData("");
}

function onSms_deleteWorkTypeSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_deleteWorkTypeSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

/*
 * "닫 기" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTAWTD_btnCloseClick( /* cpr.events.CMouseEvent */ e) {
	/**
	 * @type cpr.controls.Button
	 */
	var tAWTD_btnClose = e.control;
	app.close();
}

/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onImageClick( /* cpr.events.CMouseEvent */ e) {
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	console.log(menu_id);
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target": DLG_HELP,
			"ID": menu_id
		}
	});
	
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onTAWTD_ipbCodeKeyup( /* cpr.events.CKeyboardEvent */ e) {
	/**
	 * @type cpr.controls.InputBox
	 */
	var tAWTD_ipbCode = e.control;
	inputValidManager.dynamicValidate(tAWTD_ipbCode, tAWTD_ipbCode.displayText,
		app.lookup("dsWorkTypeTinyList"), "Code", "");
}

/*
 * 버튼(onTAWTD_btnUserShiftSet)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onOnTAWTD_btnUserShiftSetClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var onTAWTD_btnUserShiftSet = e.control;
	//코드 선택 유효성 검사
	var code = app.lookup("TAWTD_ipbCode").value;
	if (code == null || code =="") {
		dialogAlert(app.getHostAppInstance(), "error", dataManager.getString("Str_NoSelection"));
		return;
	}
	
	var dsGroupList = dataManager.getGroup();
	var appld = "app/main/users/UserSelect" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {
		width: 960,
		height: 500
	}, function(dialog) {
		dialog.initValue = {
			"GroupList": dsGroupList,
			"ExcludeGroup": -1
		};
		cpr.data.DataSet
		dialog.bind("headerTitle").toLanguage("Str_UserSelect");
		dialog.modal = true;
	}).then(function(idMap) {
		
		var dsUserIDSendList = app.lookup("UserIDSendList");
		console.log(idMap);
		idMap.forEach(function(value, key) {
			dsUserIDSendList.addRowData({
				"ID": key
			});
		});
		
		TNAWT_total = dsUserIDSendList.getRowCount();
		
		if(TNAWT_total > 0){ // 적용할 사용자를 아무도 선택하지 않고 설정을 누르면 네트워크 오류 발생하며 자동 새로고침되어 조건 추가
			comLib.showLoadMask("pro", dataManager.getString("Str_ApplySchedule"), "", TNAWT_total / TNAWT_userCntPerRequest);
			sendPutUserWorkCode();
		}
		
	});
}

function sendPutUserWorkCode() {
	
	var dsUserIDList = app.lookup("UserIDList");
	var dsUserIDSendList = app.lookup("UserIDSendList");
	var total = dsUserIDSendList.getRowCount();
	
	if (total > TNAWT_userCntPerRequest) {
		total = TNAWT_userCntPerRequest;
	}
	dsUserIDList.clear();
	dsUserIDList.build(dsUserIDSendList.getRowDataRanged(0, total - 1));
	console.log(dsUserIDList.getRowDataRanged());
	
	for (var i = 0; i < total; i++) {
		dsUserIDSendList.realDeleteRow(0);
	}
	
	var code = app.lookup("TAWTD_ipbCode").value;
	
	var sms_putUserWorkCode = app.lookup("sms_putUserWorkCode");
	sms_putUserWorkCode.action = "/v1/tna/userWorkCode/" + code;
	sms_putUserWorkCode.send();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_putUserWorkCodeSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_putUserWorkCode = e.control;
	var dmResult = app.lookup("Result");
	if (dmResult.getValue("ResultCode") == COMERROR_NONE) {
		var dsUserIDSendList = app.lookup("UserIDSendList");
		var leftCount = dsUserIDSendList.getRowCount();
		
		if (leftCount > 0) {
			comLib.updateLoadMask(TNAWT_total - leftCount + "/" + TNAWT_total);
			sendPutUserWorkCode();
		} else {
			console.log("end");
			comLib.hideLoadMask();
			dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
		}
	} else {
		comLib.hideLoadMask();
		//dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_Failed"));
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_putUserWorkCodeSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_putUserWorkCode = e.control;
	var result = app.lookup("Result")
	result.setValue("ResultCode", COMERROR_NET_ERROR);
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_putUserWorkCodeSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_putUserWorkCode = e.control;
	var result = app.lookup("Result")
	result.setValue("ResultCode", COMERROR_NET_ERROR);
}

function initCustomSetting() {
	if ( dataManager.getOemVersion() == OEM_HYUNDAI_HI ) {
		app.lookup("TAWTD_optWorkDetailSetting").visible = false;
		app.lookup("TAWTD_btnEarlyWorkDetailSetting").visible = false;
		app.lookup("TAWTD_btnOvertimeDetailSetting1").visible = false;
		app.lookup("TAWTD_btnNightWorkDetailSetting").visible = false;
		app.lookup("TAWTD_btnHolidayWorkDetailSetting").visible = false;
		app.lookup("TAWTD_btnOvertimeDetailSetting2").visible = false;
		
		app.lookup("TAWTD_btnBasicWorkDetailSetting").unbind("value");
		app.lookup("TAWTD_btnBasicWorkDetailSetting").value = "근태 항목 설정";
		
		TNAWT_userCntPerRequest = 1000;	// 오라클 1000까지 가능
		
	}
}

function btnWorkTypeSettingClickHDHI() {

	var path = "app/custom/hyundai_hi/tna/TNAWorkTypeSettingHDHI";

	path = path + "?" + usint_version;
	app.getRootAppInstance().openDialog(path, {
		width: 500,
		height: 400
	}, function(dialog) {
		dialog.initValue = {
			
		};
		dialog.bind("headerTitle").toLanguage("Str_Setting");
		dialog.modal = true;
	}).then(function(returnValue) {
		
	});
}