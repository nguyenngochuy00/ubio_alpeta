/************************************************
 * tnaWorkTimeRegist.js
 * Created at 2019. 1. 18. 오후 2:32:26.
 *
 * @author joymrk
 ************************************************/
var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var StrLib = cpr.core.Module.require("lib/StrLib");
var util = cpr.core.Module.require("lib/util");
var _processMode; // Normal : 선택안함 or 처음시작, Add : 신규 추가, Modify : 변경
var usint_version;
//----------------------------------------------------------------------------------------> 클라이언트 전용 함수
function setCode() {
	var tmpCode = app.lookup("TASCR_IpbCode").value;
	if(tmpCode.length < 2){ //2자리보다 작으면
		tmpCode = StrLib.lpad(tmpCode, 2, "0");
	}
	return tmpCode
} 

// 체크 박스 체인지
function checkboxChange(id, value) {
	if (id == 'TASCR_lateTime_cbx') {
		if(value == 1) {
			app.lookup("TASCR_lateTime_dti").enabled = true;		
		} else {
			app.lookup("TASCR_lateTime_dti").enabled = false;
			app.lookup("TASCR_lateTime_dti").value = "00:00";
		}
	} else if (id == 'TASCR_lackTime_cbx') {
		if(value == 1) {
			app.lookup("TASCR_lackTime_dti").enabled = true;		
		} else {
			app.lookup("TASCR_lackTime_dti").enabled = false;
			app.lookup("TASCR_lackTime_dti").value = "00:00";
		}
	} else if (id == 'TASCR_MultiRange_cbx') {	
		if(value == 1) {
			app.lookup("TASCR_lateTime_cbx").enabled = false;
			app.lookup("TASCR_lateTime_cbx").value = 0;
			app.lookup("TASCR_lackTime_cbx").enabled = false;
			app.lookup("TASCR_lackTime_cbx").value = 0;
			
			app.lookup("TASCR_lateTime_dti").enabled = false;	
			app.lookup("TASCR_lateTime_dti").value = "00:00";	
			app.lookup("TASCR_lackTime_dti").enabled = false;	
			app.lookup("TASCR_lackTime_dti").value = "00:00";	
		} else {
			app.lookup("TASCR_lateTime_cbx").enabled = true;
			app.lookup("TASCR_lackTime_cbx").enabled = true;
		}	
	} else {
		console.log("Incorrect event!");
	}
	return;
}

/*
 * [근무시간 설정]-[시간지정] SelectChange 제1 ~ 제5 설정까지 case 별 처리 
 */
function selectChangeDetailType(id, value) {
	switch (id) {
	case 'TASCR_cmbShiftDetailType1':
		if(value == '0') {
			app.lookup("TASCR_sShiftDetail_dti1").enabled = false;
			app.lookup("TASCR_eShiftDetail_dti1").enabled = false;
			app.lookup("TASCR_sShiftDetail_dti1").value = '00:00';
			app.lookup("TASCR_eShiftDetail_dti1").value = '00:00';
		} else if(value == '2' || value == '10'){
			app.lookup("TASCR_sShiftDetail_dti1").enabled = false;
			app.lookup("TASCR_eShiftDetail_dti1").enabled = false;
			//app.lookup("TASCR_sShiftDetail_dti1").enabled = true;
			//app.lookup("TASCR_eShiftDetail_dti1").enabled = true;
			app.lookup("TASCR_sShiftDetail_dti1").value = '00:00';
			app.lookup("TASCR_eShiftDetail_dti1").value = '00:00';
		}else  {
			app.lookup("TASCR_sShiftDetail_dti1").enabled = true;
			app.lookup("TASCR_eShiftDetail_dti1").enabled = true;
		}
		break;
	case 'TASCR_cmbShiftDetailType2':
		if(value == '0') {
			app.lookup("TASCR_sShiftDetail_dti2").enabled = false;
			app.lookup("TASCR_eShiftDetail_dti2").enabled = false;
			app.lookup("TASCR_sShiftDetail_dti2").value = '00:00';
			app.lookup("TASCR_eShiftDetail_dti2").value = '00:00';
		} else if(value == '2' || value == '10'){
			app.lookup("TASCR_sShiftDetail_dti2").enabled = false;
			app.lookup("TASCR_eShiftDetail_dti2").enabled = false;
			//app.lookup("TASCR_sShiftDetail_dti2").enabled = true;
			//app.lookup("TASCR_eShiftDetail_dti2").enabled = true;
			app.lookup("TASCR_sShiftDetail_dti2").value = '00:00';
			app.lookup("TASCR_eShiftDetail_dti2").value = '00:00';
		}else  {
			app.lookup("TASCR_sShiftDetail_dti2").enabled = true;
			app.lookup("TASCR_eShiftDetail_dti2").enabled = true;
		}
		break;
	case 'TASCR_cmbShiftDetailType3':
		if(value == '0') {
			app.lookup("TASCR_sShiftDetail_dti3").enabled = false;
			app.lookup("TASCR_eShiftDetail_dti3").enabled = false;
			app.lookup("TASCR_sShiftDetail_dti3").value = '00:00';
			app.lookup("TASCR_eShiftDetail_dti3").value = '00:00';
		} else if(value == '2'){
			app.lookup("TASCR_sShiftDetail_dti3").enabled = false;
			app.lookup("TASCR_eShiftDetail_dti3").enabled = false;
			//app.lookup("TASCR_sShiftDetail_dti3").enabled = true;
			//app.lookup("TASCR_eShiftDetail_dti3").enabled = true;
			app.lookup("TASCR_sShiftDetail_dti3").value = '00:00';
			app.lookup("TASCR_eShiftDetail_dti3").value = '00:00';
		}else  {
			app.lookup("TASCR_sShiftDetail_dti3").enabled = true;
			app.lookup("TASCR_eShiftDetail_dti3").enabled = true;
		}
		break;
	case 'TASCR_cmbShiftDetailType4':
		
		if(value == '0') {
			app.lookup("TASCR_sShiftDetail_dti4").enabled = false;
			app.lookup("TASCR_eShiftDetail_dti4").enabled = false;
			app.lookup("TASCR_sShiftDetail_dti4").value = '00:00';
			app.lookup("TASCR_eShiftDetail_dti4").value = '00:00';
		} else if(value == '2'){
			app.lookup("TASCR_sShiftDetail_dti4").enabled = false;
			app.lookup("TASCR_eShiftDetail_dti4").enabled = false;
			app.lookup("TASCR_sShiftDetail_dti4").value = '00:00';
			app.lookup("TASCR_eShiftDetail_dti4").value = '00:00';
		}else  {
			app.lookup("TASCR_sShiftDetail_dti4").enabled = true;
			app.lookup("TASCR_eShiftDetail_dti4").enabled = true;
		}
		break;
	case 'TASCR_cmbShiftDetailType5':
		if(value == '0') {
			app.lookup("TASCR_sShiftDetail_dti5").enabled = false;
			app.lookup("TASCR_eShiftDetail_dti5").enabled = false;
			app.lookup("TASCR_sShiftDetail_dti5").value = '00:00';
			app.lookup("TASCR_eShiftDetail_dti5").value = '00:00';
		} else if(value == '2'){
			app.lookup("TASCR_sShiftDetail_dti5").enabled = false;
			app.lookup("TASCR_eShiftDetail_dti5").enabled = false;
			app.lookup("TASCR_sShiftDetail_dti5").value = '00:00';
			app.lookup("TASCR_eShiftDetail_dti5").value = '00:00';
		}else  {
			app.lookup("TASCR_sShiftDetail_dti5").enabled = true;
			app.lookup("TASCR_eShiftDetail_dti5").enabled = true;
		}
		break;
	}
	return
}

function resetWorkShiftDataMap() {
	var dmWorkShiftInfo = app.lookup("dmWorkShiftInfo");
	dmWorkShiftInfo.clear();
	var initWorkShiftInfo = app.lookup("initWorkShiftInfo");
	initWorkShiftInfo.copyToDataMap(dmWorkShiftInfo)
}

function resetDetailWorkShift() {
	var dmDetailWorkShift = app.lookup("dmDetailWorkShift");
	dmDetailWorkShift.clear();
	var initDetailWorkShift = app.lookup("initDetailWorkShift");
	initDetailWorkShift.copyToDataMap(dmDetailWorkShift);
}

function initCustomSetting() {
	if (dataManager.getOemVersion() == OEM_HYUNDAI_HI) {

		app.lookup("TASCR_cmbShiftDetailWork1").deleteItemByValue("2");
		app.lookup("TASCR_cmbShiftDetailWork1").deleteItemByValue("3");
		app.lookup("TASCR_cmbShiftDetailWork1").deleteItemByValue("4");
		app.lookup("TASCR_cmbShiftDetailWork1").deleteItemByValue("5");
		
		app.lookup("TASCR_cmbShiftDetailWork2").deleteItemByValue("2");
		app.lookup("TASCR_cmbShiftDetailWork2").deleteItemByValue("3");
		app.lookup("TASCR_cmbShiftDetailWork2").deleteItemByValue("4");
		app.lookup("TASCR_cmbShiftDetailWork2").deleteItemByValue("5");
		
//		app.lookup("TASCR_cmbShiftDetailType1").deleteAllItems();
		app.lookup("TASCR_cmbShiftDetailType1").deleteItemByValue("1");
		app.lookup("TASCR_cmbShiftDetailType1").deleteItemByValue("2");
		app.lookup("TASCR_cmbShiftDetailType1").deleteItemByValue("3");
//		app.lookup("TASCR_cmbShiftDetailType2").deleteAllItems();
		app.lookup("TASCR_cmbShiftDetailType2").deleteItemByValue("1");
		app.lookup("TASCR_cmbShiftDetailType2").deleteItemByValue("2");
		app.lookup("TASCR_cmbShiftDetailType2").deleteItemByValue("3");
		app.lookup("TASCR_cmbShiftDetailType1").addItem(new cpr.controls.Item("현대중공업", 10));
		app.lookup("TASCR_cmbShiftDetailType2").addItem(new cpr.controls.Item("현대중공업", 10));
		
		app.lookup("TASCR_InOutModeCmb").value = 1;
		app.lookup("TASCR_InOutModeCmb").enabled = false;
		
		app.lookup("TASCR_IgnoreAbsent_cbx").visible = false;
		app.lookup("TASCR_lateTime_cbx").visible = false;
		app.lookup("TASCR_MultiRange_cbx").visible = false;
		app.lookup("TASCR_lackTime_cbx").visible = false;
		app.lookup("TASCR_lateTime_dti").visible = false;
		app.lookup("TASCR_lackTime_dti").visible = false;
		app.lookup("TASCR_DetailInout_btn").visible = false;

		app.lookup("TASCR_DetailWorkshift_btn").visible = false;
		
		app.lookup("TASCR_cmbShiftDetailWork3").enabled = false;
		app.lookup("TASCR_cmbShiftDetailWork4").enabled = false;
		app.lookup("TASCR_cmbShiftDetailWork5").enabled = false;
		
	}
}
//----------------------------------------------------------------------------------------< 클라이언트 전용 함수
/* Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();	
	usint_version = dataManager.getSystemVersion();
	
	_processMode = "Normal"; // 기본 상태
	app.lookup("dmWorkShiftInfo").reset(); 
	
	initCustomSetting();
	
	comLib.showLoadMask("",dataManager.getString("Str_TNAWorkTimeSetting"),"",0);//근무형태 시간 설정
	var requestData = app.lookup("sms_getWorkTimeShifts");
	requestData.action = "/v1/tna/shift";
	requestData.send();
}
//-----------------------------------------------------------------------------------------> sms_getWorkTimeShifts
function onSms_getWorkTimeShiftsSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var sms_getWorkTimeShifts = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var getList = app.lookup("TnaWorkShiftList"); //Code 정렬
		getList.setSort("Code");
		
		app.lookup("dmDetailInOut").reset(); // 초기값 
		app.lookup("dmDetailWorkShift").reset(); // 초기값
	} else {
		var strError = dataManager.getString("Str_TNAWorkTimeSetting") + ": " +dataManager.getString(getErrorString(resultCode));
		dialogAlert(app, dataManager.getString("Str_Failed"), strError);
	}
}

function onSms_getWorkTimeShiftsSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);	
}

function onSms_getWorkTimeShiftsSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
//-----------------------------------------------------------------------------------------< sms_getWorkTimeShifts
/*
 * [근무시간 등록] 체크박스 true/false 에 따른 동작 이벤트 처리 요청 -> checkboxChange
 */
function onTASCR_cbxValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.CheckBox
	 */
	var tASCR_cbx = e.control;
	checkboxChange(tASCR_cbx.id, tASCR_cbx.value);
}
/*
 * [근무시간 설정]-[시간지정] SelectChange 발생시 이벤트 처리 요청
 */
function onTASCR_cmbShiftDetailTypeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var tASCR_cmbShiftDetailType = e.control;
	selectChangeDetailType(tASCR_cmbShiftDetailType.id, tASCR_cmbShiftDetailType.value);
}

/*
 * [근무시간 설정]-[근무지정] SelectChange 발생시 이벤트 처리 요청
 */
function onTASCR_shiftDetailWork_cmbSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var tASCR_shiftDetailWork_cmb = e.control;
	selectChangeDetailWork(tASCR_shiftDetailWork_cmb.id, tASCR_shiftDetailWork_cmb.value);
}

/*
 * [근무시간 설정]-[근무지정] SelectChange 제1 ~ 제5 설정까지 case 별 처리 
 */
function selectChangeDetailWork(id, value) {
	switch (id) {
	case 'TASCR_cmbShiftDetailWork1':
		if (value == '0') {
			app.lookup("TASCR_cmbShiftDetailType1").enabled = false;
			app.lookup("TASCR_sShiftDetail_dti1").enabled = false;
			app.lookup("TASCR_eShiftDetail_dti1").enabled = false;
			app.lookup("TASCR_cmbShiftDetailType1").value = '0';
			app.lookup("TASCR_sShiftDetail_dti1").value = '00:00';
			app.lookup("TASCR_eShiftDetail_dti1").value = '00:00';
		} else {
			app.lookup("TASCR_cmbShiftDetailType1").enabled = true;
		}
		break;
	case 'TASCR_cmbShiftDetailWork2':
		if (value == '0') {
			app.lookup("TASCR_cmbShiftDetailType2").enabled = false;
			app.lookup("TASCR_sShiftDetail_dti2").enabled = false;
			app.lookup("TASCR_eShiftDetail_dti2").enabled = false;
			
			app.lookup("TASCR_cmbShiftDetailType2").value = '0';
			app.lookup("TASCR_sShiftDetail_dti2").value = '00:00';
			app.lookup("TASCR_eShiftDetail_dti2").value = '00:00';
		} else {
			app.lookup("TASCR_cmbShiftDetailType2").enabled = true;
		}
		break;
	case 'TASCR_cmbShiftDetailWork3':
		if (value == '0') {
			app.lookup("TASCR_cmbShiftDetailType3").enabled = false;
			app.lookup("TASCR_sShiftDetail_dti3").enabled = false;
			app.lookup("TASCR_eShiftDetail_dti3").enabled = false;
			
			app.lookup("TASCR_cmbShiftDetailType3").value = '0';
			app.lookup("TASCR_sShiftDetail_dti3").value = '00:00';
			app.lookup("TASCR_eShiftDetail_dti3").value = '00:00';
		} else {
			app.lookup("TASCR_cmbShiftDetailType3").enabled = true;
		}
		break;
	case 'TASCR_cmbShiftDetailWork4':
		if (value == '0') {
			app.lookup("TASCR_cmbShiftDetailType4").enabled = false;
			app.lookup("TASCR_sShiftDetail_dti4").enabled = false;
			app.lookup("TASCR_eShiftDetail_dti4").enabled = false;
			
			app.lookup("TASCR_cmbShiftDetailType4").value = '0';
			app.lookup("TASCR_sShiftDetail_dti4").value = '00:00';
			app.lookup("TASCR_sShiftDetail_dti4").value = '00:00';
		} else {
			app.lookup("TASCR_cmbShiftDetailType4").enabled = true;
		}
		break;
	case 'TASCR_cmbShiftDetailWork5':
		if (value == '0') {
			app.lookup("TASCR_cmbShiftDetailType5").enabled = false;
			app.lookup("TASCR_sShiftDetail_dti5").enabled = false;
			app.lookup("TASCR_eShiftDetail_dti5").enabled = false;
			
			app.lookup("TASCR_cmbShiftDetailType5").value = '0';
			app.lookup("TASCR_sShiftDetail_dti5").value = '00:00';
			app.lookup("TASCR_eShiftDetail_dti5").value = '00:00';
		} else {
			app.lookup("TASCR_cmbShiftDetailType5").enabled = true;
		}
		break;
	default:
		console.log("err id :"+ id + "value :" + value);
		break;
	}
	return;
}

/*
 * 근무시간 리스트 선택 변경 이벤트
 */
function onTASCR_workTimegrdSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var tASCR_workTimegrd = e.control;
	var selectRow = tASCR_workTimegrd.getSelectedRow();
	var getRowData = selectRow.getRowData();
	var dsWorkShiftList = app.lookup("TnaWorkShiftList");
	var dmWorkShift = app.lookup("dmWorkShiftInfo");
	
	//선택된 데이터 dm으로 복사
	dmWorkShift.reset();
	dsWorkShiftList.copyToDataMap(dmWorkShift, selectRow.getIndex());
	var dmDetailInOut = app.lookup("dmDetailInOut");
	
	dmDetailInOut.reset();
	dmWorkShift.copyToDataMap(dmDetailInOut);
	
	var dmDetailWorkShift = app.lookup("dmDetailWorkShift");
	dmDetailWorkShift.reset();
	dmWorkShift.copyToDataMap(dmDetailWorkShift);
	
	app.lookup("TASCR_IpbCode").value = dmWorkShift.getValue("Code");
	app.lookup("TASCR_IpbName").value = dmWorkShift.getValue("Name");
	
	app.lookup("TASCR_ipbWorkStartTime").value = util.ConvDHHMMfromMinute(dmWorkShift.getValue("WorkStartTime"));	//getRowData["WorkStartTime"] 
	app.lookup("TASCR_ipbWorkEndTime").value = util.ConvDHHMMfromMinute(dmWorkShift.getValue("WorkEndTime"));		//getRowData["WorkEndTime"]
	app.lookup("TASCR_IgnoreAbsent_cbx").value = dmWorkShift.getValue("IgnoreAbsent");								//getRowData["IgnoreAbsent"];
	
	var bMultiRange = dmWorkShift.getValue("MultiRange");
	var nLateTime = dmWorkShift.getValue("LateTime");
	var nLackTime = dmWorkShift.getValue("LackTime");
	
	app.lookup("TASCR_MultiRange_cbx").value = bMultiRange;
	if(bMultiRange == 1) {
		checkboxChange(app.lookup("TASCR_MultiRange_cbx").id, bMultiRange);
	} else if(bMultiRange == 0) {
		checkboxChange(app.lookup("TASCR_MultiRange_cbx").id, bMultiRange);
		
		if (nLateTime == -1 ) {
			app.lookup("TASCR_lateTime_cbx").value = nLateTime;	// -1
			app.lookup("TASCR_lateTime_dti").enabled = false;
			app.lookup("TASCR_lateTime_dti").value = "00:00";
		} else {
			app.lookup("TASCR_lateTime_cbx").value = 1;	
			app.lookup("TASCR_lateTime_dti").enabled = true;
			var lateTm = util.ConvDHHMMfromMinute(nLateTime, 0);
			
			app.lookup("TASCR_lateTime_dti").value = lateTm;
		} 
		
		if (nLackTime == -1 ) {
			app.lookup("TASCR_lackTime_cbx").value = nLackTime;	// -1
			app.lookup("TASCR_lackTime_dti").enabled = false;
			app.lookup("TASCR_lackTime_dti").value = "00:00";
		} else {
			app.lookup("TASCR_lackTime_cbx").value = 1;	
			app.lookup("TASCR_lackTime_dti").enabled = true;
			app.lookup("TASCR_lackTime_dti").value = util.ConvDHHMMfromMinute(nLackTime, 0);
		} 
	} else {
		console.log("error: check Data [MultiRange] ");
	}
	
	app.lookup("TASCR_BasicGrp").redraw();
	app.lookup("TASCR_BasicGrp2").redraw();
	
	var sdWork = app.lookup("TASCR_cmbShiftDetailWork1");
	sdWork.value = dmWorkShift.getValue("ShiftDetailWork1");
	selectChangeDetailWork(sdWork.id, sdWork.value);
	
	var sdType = app.lookup("TASCR_cmbShiftDetailType1");
	sdType.value = dmWorkShift.getValue("ShiftDetailType1");
	selectChangeDetailType(sdType.id, sdType.value);
	
	var sdTimeStart = app.lookup("TASCR_sShiftDetail_dti1");
	var nStartTime = dmWorkShift.getValue("sShiftDetailTime1");
	if (nStartTime > 0) {
		sdTimeStart.value = util.ConvDHHMMfromMinute(nStartTime);
	} else {
		sdTimeStart.value = "00:00";
	}
	
	var sdTimeEnd = app.lookup("TASCR_eShiftDetail_dti1");
	var nEndTime = dmWorkShift.getValue("eShiftDetailTime1");
	if (nEndTime > 0) {
		sdTimeEnd.value = util.ConvDHHMMfromMinute(nEndTime);
	} else {
		sdTimeEnd.value = "00:00";
	}
	//------------------------------------------------------------------------------------------------------
	
	sdWork = app.lookup("TASCR_cmbShiftDetailWork2");
	sdWork.value = dmWorkShift.getValue("ShiftDetailWork2");
	selectChangeDetailWork(sdWork.id, sdWork.value);
	
	sdType = app.lookup("TASCR_cmbShiftDetailType2");
	sdType.value = dmWorkShift.getValue("ShiftDetailType2");
	selectChangeDetailType(sdType.id, sdType.value);
	
	sdTimeStart = app.lookup("TASCR_sShiftDetail_dti2");
	nStartTime = dmWorkShift.getValue("sShiftDetailTime2");
	if (nStartTime > 0) {
		sdTimeStart.value = util.ConvDHHMMfromMinute(nStartTime);
	} else {
		sdTimeStart.value = "00:00";
	}
	
	sdTimeEnd = app.lookup("TASCR_eShiftDetail_dti2");
	nEndTime = dmWorkShift.getValue("eShiftDetailTime2");
	if (nEndTime > 0) {
		sdTimeEnd.value = util.ConvDHHMMfromMinute(nEndTime);
	} else {
		sdTimeEnd.value = "00:00";
	}
	//------------------------------------------------------------------------------------------------------
	sdWork = app.lookup("TASCR_cmbShiftDetailWork3");
	sdWork.value = dmWorkShift.getValue("ShiftDetailWork3");
	selectChangeDetailWork(sdWork.id, sdWork.value);
	sdType = app.lookup("TASCR_cmbShiftDetailType3");
	sdType.value = dmWorkShift.getValue("ShiftDetailType3");
	selectChangeDetailType(sdType.id, sdType.value);
	sdTimeStart = app.lookup("TASCR_sShiftDetail_dti3");
	nStartTime = dmWorkShift.getValue("sShiftDetailTime3");
	if (nStartTime > 0) {
		sdTimeStart.value = util.ConvDHHMMfromMinute(nStartTime);
	} else {
		sdTimeStart.value = "00:00";
	}
	sdTimeEnd = app.lookup("TASCR_eShiftDetail_dti3");
	nEndTime = dmWorkShift.getValue("eShiftDetailTime3");
	if (nEndTime > 0) {
		sdTimeEnd.value = util.ConvDHHMMfromMinute(nEndTime);
	} else {
		sdTimeEnd.value = "00:00";
	}
	//------------------------------------------------------------------------------------------------------
	sdWork = app.lookup("TASCR_cmbShiftDetailWork4");
	sdWork.value = dmWorkShift.getValue("ShiftDetailWork4");
	selectChangeDetailWork(sdWork.id, sdWork.value);
	
	sdType = app.lookup("TASCR_cmbShiftDetailType4");
	sdType.value = dmWorkShift.getValue("ShiftDetailType4");
	selectChangeDetailType(sdType.id, sdType.value);
	
	sdTimeStart = app.lookup("TASCR_sShiftDetail_dti4");
	nStartTime = dmWorkShift.getValue("sShiftDetailTime4");
	if (nStartTime > 0) {
		sdTimeStart.value = util.ConvDHHMMfromMinute(nStartTime);
	} else {
		sdTimeStart.value = "00:00";
	}
	sdTimeEnd = app.lookup("TASCR_eShiftDetail_dti4");
	nEndTime = dmWorkShift.getValue("eShiftDetailTime4");
	if (nEndTime > 0) {
		sdTimeEnd.value = util.ConvDHHMMfromMinute(nEndTime);
	} else {
		sdTimeEnd.value = "00:00";
	}
	//------------------------------------------------------------------------------------------------------
	sdWork = app.lookup("TASCR_cmbShiftDetailWork5");
	sdWork.value = dmWorkShift.getValue("ShiftDetailWork5");
	selectChangeDetailWork(sdWork.id, sdWork.value);
	sdType = app.lookup("TASCR_cmbShiftDetailType5");
	sdType.value = dmWorkShift.getValue("ShiftDetailType5");
	selectChangeDetailType(sdType.id, sdType.value);
	sdTimeStart = app.lookup("TASCR_sShiftDetail_dti5");
	nStartTime = dmWorkShift.getValue("sShiftDetailTime5");
	if (nStartTime > 0) {
		sdTimeStart.value = util.ConvDHHMMfromMinute(nStartTime);
	} else {
		sdTimeStart.value = "00:00";
	}
	sdTimeEnd = app.lookup("TASCR_eShiftDetail_dti5");
	nEndTime = dmWorkShift.getValue("eShiftDetailTime5");
	if (nEndTime > 0) {
		sdTimeEnd.value = util.ConvDHHMMfromMinute(nEndTime);
	} else {
		sdTimeEnd.value = "00:00";
	}
	//------------------------------------------------------------------------------------------------------
	
	app.lookup("TASCR_SetWorkTimeGrp").redraw();
	app.lookup("TASCR_SetWorkTimeGrp2").redraw();

}

/*
 * 출퇴근 상세 설정 버튼 이벤트 
 */
function onTASCR_DetailInout_btnClick(/* cpr.events.CMouseEvent */ e){

	var tASCR_DetailInout_btn = e.control;
	var Code = app.lookup("TASCR_IpbCode").value;
	if (Code == null || Code == "") {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorNotExistWorkTimeCode"));
		//comLib.alert("warning", "선택 또는 신규 생성할 근무 시간의 코드가 없습니다.");
	} else {
		var dmWorkShift = app.lookup("dmWorkShiftInfo");
		var dmDetail = app.lookup("dmDetailInOut"); 
		//dmDetail.clear();
		//dmWorkShift.copyToDataMap(dmDetail);
		dmDetail.setValue("Code", app.lookup("TASCR_IpbCode").value);
		dmDetail.setValue("WorkStartTime", app.lookup("TASCR_ipbWorkStartTime").value);
		dmDetail.setValue("WorkEndTime", app.lookup("TASCR_ipbWorkEndTime").value);
		dmDetail.setValue("MultiRange", Number(app.lookup("TASCR_MultiRange_cbx").value));
		var appld = "app/main/tna/popup/tnaDetailInout" + "?" + usint_version;
		app.getRootAppInstance().openDialog(appld, {width: 520, height: 470}, function(dialog){
			dialog.ready(function(dialogApp){
				dialog.bind("headerTitle").toLanguage("Str_AdvancedSet");
				dialog.initValue = {
					"DetailWorkShift": dmDetail
				};
				dialog.modal = true;
				
			});
		}).then(function(returnValue){
			var tmpdm = app.lookup("dmDetailInOut");
			tmpdm.build(returnValue);
			tmpdm.copyToDataMap(dmWorkShift); // 일단 반영하고
			//tmpdm.clear();
			app.lookup("TASCR_ipbWorkStartTime").value = util.ConvDHHMMfromMinute(dmWorkShift.getValue("WorkStartTime"));	
			app.lookup("TASCR_ipbWorkEndTime").value = util.ConvDHHMMfromMinute(dmWorkShift.getValue("WorkEndTime"));	
		});
	}
	app.lookup("TASCR_BasicGrp").redraw();
	app.lookup("TASCR_BasicGrp2").redraw();
}

/*
 * [근무 시간 상세 설정] 버튼에서 click 이벤트 발생 시 호출.
 */
function onTASCR_DetailWorkshift_btnClick(/* cpr.events.CMouseEvent */ e){
	var tASCR_DetailWorkshift_btn = e.control;
	var Code = app.lookup("TASCR_IpbCode").value;
	if (Code == null || Code == "") {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorNotExistWorkTimeCode"));
		//comLib.alert("warning", "선택 또는 신규 생성할 근무 시간의 코드가 없습니다.");
	} else {
		var dmWorkShift = app.lookup("dmWorkShiftInfo");
		var dmDetailWorkShift = app.lookup("dmDetailWorkShift");
		//dmDetail.clear();
		dmWorkShift.copyToDataMap(dmDetailWorkShift);
		dmDetailWorkShift.setValue("Code", app.lookup("TASCR_IpbCode").value);
		var appld = "app/main/tna/popup/tnaDetailWorkShift" + "?" + usint_version;
		app.getRootAppInstance().openDialog(appld, {width : 600, height : 800}, function(dialog){
			dialog.ready(function(dialogApp){
				dialog.bind("headerTitle").toLanguage("Str_TNAAdvancedSet");
				dialog.initValue = { 
					"Code": Code,
					"MultiRange": app.lookup("TASCR_MultiRange_cbx").value,
					"DetailWorkShift": dmDetailWorkShift 
				};
				dialog.modal = true;
			});
		}).then(function(returnValue){
			// 따로 가지고 있다가 Server로 전송할때 추가 되도록 수정.
			returnValue.copyToDataMap(dmWorkShift);
			returnValue.copyToDataMap(dmDetailWorkShift);
		});
	}
}


/*
 * "적용" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTASCR_WorkShiftAddandModiClick(/* cpr.events.CMouseEvent */ e){
	var tASCR_WorkShiftAddandModi = e.control;
	
	var code = app.lookup("TASCR_IpbCode").value;
	if (!code) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorInvalidWorkTimeCode"));
		return;
	}
	code = setCode(); // 앞에 0 채우기
	if (code == "00" || code == "0" || code == "") { //00 이거나 0만 있거나 아무것도 없으면 에러 처리
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorInvalidWorkTimeCode"));
		//dialogAlert(app, "error", " 근무시간 등록 코드를 정상 입력 해야 합니다.");
		return;
	}
	app.lookup("TASCR_IpbCode").value = code; // 위에서 0처리해준 code로 다시 넣어주기
	
	var dmWsInfo = app.lookup("dmWorkShiftInfo");
//	dmWsInfo.reset(); // 초기값 설정
	var bresult = setWorkShiftInfo(dmWsInfo);
	if (bresult[0] == true) {
		var tnaWSList = app.lookup("TnaWorkShiftList");
		var getfindInfo = tnaWSList.findFirstRow("Code == '"+ code+ "'"); // 등록된 코드 있는지 확인
		
		if(getfindInfo) { // Modify
			_processMode = 'Modify'
//			var WsList = app.lookup("TnaWorkShiftList"); 
//			dmWsInfo.setValue("Code", code);
//			getfindInfo.setRowData(dmWsInfo.getDatas());
//			WsList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
			var smsPut = app.lookup("sms_putWorkTimeShifts");	
			smsPut.action = '/v1/tna/shift';
			smsPut.send();
		} else { //Add
			
			// 현대중공업은 하나만 사용
			if (dataManager.getOemVersion() == OEM_HYUNDAI_HI) {
				if (tnaWSList.getRowCount() > 0) {
					dialogAlert(app, dataManager.getString("Str_Warning"), "근태 관리 기준은 한 항목만 설정 가능합니다.");
					return
				}
			}
			_processMode = 'Add'
//			var WsList = app.lookup("TnaWorkShiftList"); 
//			//list add
//			dmWsInfo.setValue("Code", code);
//			WsList.addRowData(dmWsInfo.getDatas());
//			WsList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
			var smsPost = app.lookup("sms_postWorkTimeShifts");
			smsPost.action = '/v1/tna/shift';
			smsPost.send();
		}	
		
	} else {
		//dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorCanNotSave"));	
		dialogAlert(app, "error", bresult[1]);
		return;
	}
				
}

function setWorkShiftInfo(dmWsInfo) {
	var dmDetailInOut = app.lookup("dmDetailInOut");
	var dmDetailWorkShift = app.lookup("dmDetailWorkShift");
	var strError ="";
	// 코드
	dmWsInfo.setValue("Code", app.lookup("TASCR_IpbCode").value); 
	// 이름 
	dmWsInfo.setValue("Name", app.lookup("TASCR_IpbName").value);
	// 당일 근태처리 구간
	//console.log("TASCR_ipbWorkStartTime: "+ app.lookup("TASCR_ipbWorkStartTime").value);
	var WorkStartTm = util.ConvDHHMMtoMinute(app.lookup("TASCR_ipbWorkStartTime").value);
	//console.log("WorkStartTm: "+ WorkStartTm);
	if(WorkStartTm < 0) {
		strError = dataManager.getString("Str_TimeFrame") + ": " + dataManager.getString("Str_ErrorTime");
		return [false, strError];
	}
	
	//console.log("TASCR_ipbWorkEndTime: "+ app.lookup("TASCR_ipbWorkEndTime").value);
	var WorkEndTm = util.ConvDHHMMtoMinute(app.lookup("TASCR_ipbWorkEndTime").value);
	//console.log("WorkEndTm: "+ WorkEndTm);
	if(WorkEndTm < 0) {
		strError = dataManager.getString("Str_TimeFrame") + ": "+ dataManager.getString("Str_ErrorTime");
		return [false, strError];
	}
	if (WorkEndTm < WorkStartTm) {
		strError = dataManager.getString("Str_TimeFrame") + ": "+ dataManager.getString("Str_ErrorTime");
		return [false, strError];
	}
	
	dmWsInfo.setValue("WorkStartTime", WorkStartTm);
	dmWsInfo.setValue("WorkEndTime", WorkEndTm);
	
	// 결근시 무시함 사용 
	dmWsInfo.setValue("IgnoreAbsent", Number(app.lookup("TASCR_IgnoreAbsent_cbx").value));
	// 다중 출퇴근 구간 사용
	dmWsInfo.setValue("MultiRange", Number(app.lookup("TASCR_MultiRange_cbx").value));
	//출퇴근 인증 모드
	dmWsInfo.setValue("InOutMode", Number(app.lookup("TASCR_InOutModeCmb").value));
	
	// 지각 시간 체크 
	var lateTm= -1;
	if (app.lookup("TASCR_lateTime_cbx").value == 1) { // 사용 체크
			lateTm = util.ConvDHHMMtoMinute(app.lookup("TASCR_lateTime_dti").value); // 분단위 변환
		if( lateTm == -1) { //분단위 정상치 초과
			strError = dataManager.getString("Str_LateInTime") + ": "+ dataManager.getString("Str_ErrorTime");
			return [false, strError];
		}
		var chklateTm = lateTm; //당일껄 체크
		if((chklateTm < WorkStartTm) || (chklateTm > WorkEndTm)) { //당일 근태 처리구간 체크
			strError = dataManager.getString("Str_LateInTime") + ": "+ dataManager.getString("Str_ErrorOutOfArea");
			return [false,strError];
		}	
		
	}
	
	dmWsInfo.setValue("LateTime", lateTm);
	
	//조퇴 시간 체크
	var lackTm = -1;
	if (app.lookup("TASCR_lackTime_cbx").value == 1) {
		lackTm = util.ConvDHHMMtoMinute(app.lookup("TASCR_lackTime_dti").value);
		if( lackTm == -1 ) { //분단위 정상치 초과
			strError = dataManager.getString("Str_EarlyOutTime") + ": "+ dataManager.getString("Str_ErrorTime");
			return [false, strError];
		}
		var chklackTm = lackTm; //당일껄 체크
		
		if((chklackTm < WorkStartTm) || (chklackTm > WorkEndTm)) {
			strError = dataManager.getString("Str_EarlyOutTime") + ": "+ dataManager.getString("Str_ErrorOutOfArea");
			return [false,strError];
		}
	}
	dmWsInfo.setValue("LackTime", lackTm);
	
	//제1 설정
	dmWsInfo.setValue("ShiftDetailWork1", Number(app.lookup("TASCR_cmbShiftDetailWork1").value));
	var sdType = app.lookup("TASCR_cmbShiftDetailType1").value;	
	dmWsInfo.setValue("ShiftDetailType1", sdType); 
	// get set1 tm1 , tm2 
	var sdtTm = 0;
	var edtTm = 0;

	if (sdType == 1) {

		sdtTm = util.ConvDHHMMtoMinute(app.lookup("TASCR_sShiftDetail_dti1").value);
		edtTm = util.ConvDHHMMtoMinute(app.lookup("TASCR_eShiftDetail_dti1").value);
			
		//범위 체크
		if(sdtTm < 0) {
			strError = dataManager.getString("Str_Setting1") + ": "+ dataManager.getString("Str_ErrorTime");
			return [false,strError]; 
		}
		if(edtTm < 0) {
			strError = dataManager.getString("Str_Setting1") + ": "+ dataManager.getString("Str_ErrorTime");
			return [false,strError]; 
		}
		if(sdtTm > edtTm) { 
			strError = dataManager.getString("Str_Setting1") + ": "+ dataManager.getString("Str_ErrorTime");
			return [false,strError]; 
		}
		if(sdtTm < WorkStartTm) {
			strError = dataManager.getString("Str_Setting1") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError]; 
		}
		if(edtTm > WorkEndTm) {
			strError = dataManager.getString("Str_Setting1") + ": "+ dataManager.getString("Str_ErrorTime"); 
			//Str_ErrorTimeOutWork1Set 다른 큰 에러 잡고 수정하자
			return [false,strError]; 
		}
	} else {	//HHMM 형태 
		sdtTm = util.ConvDHHMMtoMinute(app.lookup("TASCR_sShiftDetail_dti1").value);
		edtTm = util.ConvDHHMMtoMinute(app.lookup("TASCR_eShiftDetail_dti1").value);

		if(sdtTm < 0) { 
			strError = dataManager.getString("Str_Setting1") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError]; 
		}
		if(edtTm < 0) { 
			strError = dataManager.getString("Str_Setting1") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError]; 
		}
	}
	dmWsInfo.setValue("sShiftDetailTime1", sdtTm);
	dmWsInfo.setValue("eShiftDetailTime1", edtTm);
	
	
	
	//제2 설정
	dmWsInfo.setValue("ShiftDetailWork2", Number(app.lookup("TASCR_cmbShiftDetailWork2").value));
	sdType = app.lookup("TASCR_cmbShiftDetailType2").value;
	dmWsInfo.setValue("ShiftDetailType2", sdType); 
	// get set1 tm1 , tm2 
	sdtTm = 0; edtTm = 0;
	if (sdType == 1) {
		sdtTm = util.ConvDHHMMtoMinute(app.lookup("TASCR_sShiftDetail_dti2").value);
		edtTm = util.ConvDHHMMtoMinute(app.lookup("TASCR_eShiftDetail_dti2").value);
		if(sdtTm < 0) {
			strError = dataManager.getString("Str_Setting2") + ": "+ dataManager.getString("Str_ErrorTime");
			return [false,strError]; 
		}
		if(edtTm < 0) {
			strError = dataManager.getString("Str_Setting2") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError]; 
		}
		if(sdtTm > edtTm) { 
			strError = dataManager.getString("Str_Setting2") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError];
		}
		if(sdtTm < WorkStartTm) { 
			strError = dataManager.getString("Str_Setting2") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError];
		}
		if(edtTm > WorkEndTm) { 
			strError = dataManager.getString("Str_Setting2") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError];
		}
	} else {
		sdtTm = util.ConvDHHMMtoMinute(app.lookup("TASCR_sShiftDetail_dti2").value);
		edtTm = util.ConvDHHMMtoMinute(app.lookup("TASCR_eShiftDetail_dti2").value);
		if(sdtTm < 0) { 
			strError = dataManager.getString("Str_Setting2") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError];
		}
		if(edtTm < 0) { 
			strError = dataManager.getString("Str_Setting2") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError];
		}
		
	}
	dmWsInfo.setValue("sShiftDetailTime2", sdtTm);
	dmWsInfo.setValue("eShiftDetailTime2", edtTm);
	
	//제3 설정
	dmWsInfo.setValue("ShiftDetailWork3", Number(app.lookup("TASCR_cmbShiftDetailWork3").value));
	sdType = app.lookup("TASCR_cmbShiftDetailType3").value;
	dmWsInfo.setValue("ShiftDetailType3", sdType); 
	// get set1 tm1 , tm2 
	sdtTm = 0; edtTm = 0;
	if (sdType == 1) {
		sdtTm = util.ConvDHHMMtoMinute(app.lookup("TASCR_sShiftDetail_dti3").value);
		edtTm = util.ConvDHHMMtoMinute(app.lookup("TASCR_eShiftDetail_dti3").value);
		
		if(sdtTm < 0) { 
			strError = dataManager.getString("Str_Setting3") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError];
		}
		if(edtTm < 0) { 
			strError = dataManager.getString("Str_Setting3") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError];
		}
		if(sdtTm > edtTm) { 
			strError = dataManager.getString("Str_Setting3") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError];
		}
		if(sdtTm < WorkStartTm) { 
			strError = dataManager.getString("Str_Setting3") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError];
		}
		if(edtTm > WorkEndTm) { 
			strError = dataManager.getString("Str_Setting3") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError];
		}
	} else {
		sdtTm = util.ConvDHHMMtoMinute(app.lookup("TASCR_sShiftDetail_dti3").value);
		edtTm = util.ConvDHHMMtoMinute(app.lookup("TASCR_eShiftDetail_dti3").value);
		
		if(sdtTm < 0) { 
			strError = dataManager.getString("Str_Setting3") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError];
		}
		if(edtTm < 0) { 
			strError = dataManager.getString("Str_Setting3") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError];
		}
	}
	dmWsInfo.setValue("sShiftDetailTime3", sdtTm);
	dmWsInfo.setValue("eShiftDetailTime3", edtTm);
	
	//제4 설정
	dmWsInfo.setValue("ShiftDetailWork4", Number(app.lookup("TASCR_cmbShiftDetailWork4").value));
	sdType = app.lookup("TASCR_cmbShiftDetailType4").value;
	dmWsInfo.setValue("ShiftDetailType4", sdType); 
	// get set1 tm1 , tm2 
	sdtTm = 0; edtTm = 0;
	if (sdType == 1) {
		sdtTm = util.ConvDHHMMtoMinute(app.lookup("TASCR_sShiftDetail_dti4").value);
		edtTm = util.ConvDHHMMtoMinute(app.lookup("TASCR_eShiftDetail_dti4").value);
		
		if(sdtTm < 0) { 
			strError = dataManager.getString("Str_Setting4") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError];
		}
		if(edtTm < 0) { 
			strError = dataManager.getString("Str_Setting4") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError];
		}
		if(sdtTm > edtTm) { 
			strError = dataManager.getString("Str_Setting4") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError];
		}
		if(sdtTm < WorkStartTm) { 
			strError = dataManager.getString("Str_Setting4") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError];
		}
		if(edtTm > WorkEndTm) { 
			strError = dataManager.getString("Str_Setting4") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError];
		}
	} else {
		sdtTm = util.ConvDHHMMtoMinute(app.lookup("TASCR_sShiftDetail_dti4").value);
		edtTm = util.ConvDHHMMtoMinute(app.lookup("TASCR_eShiftDetail_dti4").value);
		
		if(sdtTm < 0) { 
			strError = dataManager.getString("Str_Setting4") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError];
		}
		if(edtTm < 0) { 
			strError = dataManager.getString("Str_Setting4") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError];
		}
	}
	dmWsInfo.setValue("sShiftDetailTime4", sdtTm);
	dmWsInfo.setValue("eShiftDetailTime4", edtTm);
	
	//제5 설정
	dmWsInfo.setValue("ShiftDetailWork5", Number(app.lookup("TASCR_cmbShiftDetailWork5").value));
	sdType = app.lookup("TASCR_cmbShiftDetailType5").value;
	dmWsInfo.setValue("ShiftDetailType5", sdType);
	// get set1 tm1 , tm2 
	sdtTm = 0; edtTm = 0;
	if (sdType == 1) {
		sdtTm = util.ConvDHHMMtoMinute(app.lookup("TASCR_sShiftDetail_dti5").value);
		edtTm = util.ConvDHHMMtoMinute(app.lookup("TASCR_eShiftDetail_dti5").value);
		
		if(sdtTm < 0) { 
			strError = dataManager.getString("Str_Setting5") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError];
		}
		if(edtTm < 0) { 
			strError = dataManager.getString("Str_Setting5") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError];
		}
		if(sdtTm > edtTm) { 
			strError = dataManager.getString("Str_Setting5") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError];
		}
		if(sdtTm < WorkStartTm) {
			strError = dataManager.getString("Str_Setting5") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError]; 
			}
		if(edtTm > WorkEndTm) { 
			strError = dataManager.getString("Str_Setting5") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError];
		}
	} else {
		sdtTm = util.ConvDHHMMtoMinute(app.lookup("TASCR_sShiftDetail_dti5").value);
		edtTm = util.ConvDHHMMtoMinute(app.lookup("TASCR_eShiftDetail_dti5").value);
		
		if(sdtTm < 0) { 
			strError = dataManager.getString("Str_Setting5") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError];
		}
		if(edtTm < 0) { 
			strError = dataManager.getString("Str_Setting5") + ": "+ dataManager.getString("Str_ErrorTime"); 
			return [false,strError];
		}
	}
	dmWsInfo.setValue("sShiftDetailTime5", sdtTm);
	dmWsInfo.setValue("eShiftDetailTime5", edtTm);
	dmWsInfo.setValue("AutoInTime", dmDetailInOut.getValue("AutoInTime")); // 자동출근 플레그
	dmWsInfo.setValue("AutoOutTime", dmDetailInOut.getValue("AutoOutTime")); // 자동 퇴근 플레그
	dmWsInfo.setValue("Range1StartTime", dmDetailInOut.getValue("Range1StartTime"));
	dmWsInfo.setValue("Range1EndTime", dmDetailInOut.getValue("Range1EndTime"));
	dmWsInfo.setValue("Range2StartTime", dmDetailInOut.getValue("Range2StartTime"));
	dmWsInfo.setValue("Range2EndTime", dmDetailInOut.getValue("Range2EndTime"));
	dmWsInfo.setValue("Range3StartTime", dmDetailInOut.getValue("Range3StartTime"));
	dmWsInfo.setValue("Range3EndTime", dmDetailInOut.getValue("Range3EndTime"));
	dmWsInfo.setValue("Range4StartTime", dmDetailInOut.getValue("Range4StartTime"));
	dmWsInfo.setValue("Range4EndTime", dmDetailInOut.getValue("Range4EndTime"));
	
	dmWsInfo.setValue("ExceptExit", dmDetailInOut.getValue("ExceptExit"));
	dmWsInfo.setValue("ExceptReturnMode", dmDetailInOut.getValue("ExceptReturnMode"));
	dmWsInfo.setValue("ExceptOut", dmDetailInOut.getValue("ExceptOut"));
	dmWsInfo.setValue("ExceptInMode", dmDetailInOut.getValue("ExceptInMode"));
	
	dmWsInfo.setValue("Except1StartTime", dmDetailInOut.getValue("Except1StartTime"));
	dmWsInfo.setValue("Except1EndTime", dmDetailInOut.getValue("Except1EndTime"));
	dmWsInfo.setValue("Except2StartTime", dmDetailInOut.getValue("Except2StartTime"));
	dmWsInfo.setValue("Except2EndTime", dmDetailInOut.getValue("Except2EndTime"));
	dmWsInfo.setValue("Except3StartTime", dmDetailInOut.getValue("Except3StartTime"));
	dmWsInfo.setValue("Except3EndTime", dmDetailInOut.getValue("Except3EndTime"));
	dmWsInfo.setValue("Except4StartTime", dmDetailInOut.getValue("Except4StartTime"));
	dmWsInfo.setValue("Except4EndTime", dmDetailInOut.getValue("Except4EndTime"));
	dmWsInfo.setValue("Except5StartTime", dmDetailInOut.getValue("Except5StartTime"));
	dmWsInfo.setValue("Except5EndTime", dmDetailInOut.getValue("Except5EndTime"));
	
	dmWsInfo.setValue("ShiftDetailRange1", dmDetailWorkShift.getValue("ShiftDetailRange1"));
	dmWsInfo.setValue("ShiftDetailAutoOut1", dmDetailWorkShift.getValue("ShiftDetailAutoOut1"));
	dmWsInfo.setValue("ShiftDetailUnit1", dmDetailWorkShift.getValue("ShiftDetailUnit1"));
	dmWsInfo.setValue("ShiftDetailMinTime1", dmDetailWorkShift.getValue("ShiftDetailMinTime1"));
	dmWsInfo.setValue("ShiftDetailMaxTime1", dmDetailWorkShift.getValue("ShiftDetailMaxTime1"));
	dmWsInfo.setValue("ShiftDetailRate1", dmDetailWorkShift.getValue("ShiftDetailRate1"));
	
	dmWsInfo.setValue("ShiftDetailRange2", dmDetailWorkShift.getValue("ShiftDetailRange2"));
	dmWsInfo.setValue("ShiftDetailAutoOut2", dmDetailWorkShift.getValue("ShiftDetailAutoOut2"));
	dmWsInfo.setValue("ShiftDetailUnit2", dmDetailWorkShift.getValue("ShiftDetailUnit2"));
	dmWsInfo.setValue("ShiftDetailMinTime2", dmDetailWorkShift.getValue("ShiftDetailMinTime2"));
	dmWsInfo.setValue("ShiftDetailMaxTime2", dmDetailWorkShift.getValue("ShiftDetailMaxTime2"));
	dmWsInfo.setValue("ShiftDetailRate2", dmDetailWorkShift.getValue("ShiftDetailRate2"));
	
	dmWsInfo.setValue("ShiftDetailRange3", dmDetailWorkShift.getValue("ShiftDetailRange3"));
	dmWsInfo.setValue("ShiftDetailAutoOut3", dmDetailWorkShift.getValue("ShiftDetailAutoOut3"));
	dmWsInfo.setValue("ShiftDetailUnit3", dmDetailWorkShift.getValue("ShiftDetailUnit3"));
	dmWsInfo.setValue("ShiftDetailMinTime3", dmDetailWorkShift.getValue("ShiftDetailMinTime3"));
	dmWsInfo.setValue("ShiftDetailMaxTime3", dmDetailWorkShift.getValue("ShiftDetailMaxTime3"));
	dmWsInfo.setValue("ShiftDetailRate3", dmDetailWorkShift.getValue("ShiftDetailRate3"));
	
	dmWsInfo.setValue("ShiftDetailRange4", dmDetailWorkShift.getValue("ShiftDetailRange4"));
	dmWsInfo.setValue("ShiftDetailAutoOut4", dmDetailWorkShift.getValue("ShiftDetailAutoOut4"));
	dmWsInfo.setValue("ShiftDetailUnit4", dmDetailWorkShift.getValue("ShiftDetailUnit4"));
	dmWsInfo.setValue("ShiftDetailMinTime4", dmDetailWorkShift.getValue("ShiftDetailMinTime4"));
	dmWsInfo.setValue("ShiftDetailMaxTime4", dmDetailWorkShift.getValue("ShiftDetailMaxTime4"));
	dmWsInfo.setValue("ShiftDetailRate4", dmDetailWorkShift.getValue("ShiftDetailRate4"));
	
	dmWsInfo.setValue("ShiftDetailRange5", dmDetailWorkShift.getValue("ShiftDetailRange5"));
	dmWsInfo.setValue("ShiftDetailAutoOut5", dmDetailWorkShift.getValue("ShiftDetailAutoOut5"));
	dmWsInfo.setValue("ShiftDetailUnit5", dmDetailWorkShift.getValue("ShiftDetailUnit5"));
	dmWsInfo.setValue("ShiftDetailMinTime5", dmDetailWorkShift.getValue("ShiftDetailMinTime5"));
	dmWsInfo.setValue("ShiftDetailMaxTime5", dmDetailWorkShift.getValue("ShiftDetailMaxTime5"));
	dmWsInfo.setValue("ShiftDetailRate5", dmDetailWorkShift.getValue("ShiftDetailRate5"));
	
	
	//dmDetailInOut.setValue(columnName, value);
	return [true];
}
//-------------------------------------------------------------------------------------------------------------------------------------
function onSms_postWorkTimeShiftsSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var sms_postWorkTimeShifts = e.control;
	comLib.hideLoadMask(); //Add
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {		
		var code = app.lookup("TASCR_IpbCode").value;
		var dmWsInfo = app.lookup("dmWorkShiftInfo");
		var tnaWSList = app.lookup("TnaWorkShiftList");
		var WsList = app.lookup("TnaWorkShiftList"); 

		dmWsInfo.setValue("Code", code);
		WsList.addRowData(dmWsInfo.getDatas());
		WsList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);

		_processMode = "Normal"; // 보통상태로 돌아감
		dialogAlert(app, dataManager.getString("Str_Success"),dataManager.getString("Str_Saved"));
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorFailWorkTimeRegist"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
		//comLib.alert("warning", " 근무시간 등록 실패 하였습니다.");
	}	
	app.lookup("TASCR_workTimegrd").redraw();
}
function onSms_postWorkTimeShiftsSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);		
}

function onSms_postWorkTimeShiftsSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT );
}

//-------------------------------------------------------------------------------------------------------------------->> Sms_putWorkTimeShifts

function onSms_putWorkTimeShiftsSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_putWorkTimeShifts = e.control;
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var code = app.lookup("TASCR_IpbCode").value;
		var dmWsInfo = app.lookup("dmWorkShiftInfo");
		var tnaWSList = app.lookup("TnaWorkShiftList");
		var WsList = app.lookup("TnaWorkShiftList"); 
		var getfindInfo = tnaWSList.findFirstRow("Code == '"+ code+ "'"); // 등록된 코드 있는지 확인
		
		if(getfindInfo) {
			dmWsInfo.setValue("Code", code);
			getfindInfo.setRowData(dmWsInfo.getDatas());
			WsList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
		}
		
		_processMode = "Normal";
		dialogAlert(app, dataManager.getString("Str_Success"),dataManager.getString("Str_Saved"));
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorFailWorkTimeRegist"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
		//comLib.alert("warning", " 근무시간 등록 실패 하였습니다.");
	}
}

function onSms_putWorkTimeShiftsSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_putWorkTimeShiftsSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


//--------------------------------------------------------------------------------------------------------------------<< Sms_putWorkTimeShifts
/*
 * "닫기" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	app.close();
}

function onTASCR_WorkTimeDeleteClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var tASCR_WorkTimeDelete = e.control;
	var getCode = app.lookup("TASCR_IpbCode").value;
	if (getCode == '' || getCode == null) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorNotExistWorkTimeCode"));
		//dialogAlert(app, "warning", "근무시간 등록 코드값이 없습니다. 기본정보를 입력해 주세요.");
		return;
	}
	
	var smsDelete = app.lookup("sms_deleteWorkTimeShifts");
	var WsList = app.lookup("TnaWorkShiftList"); 
	var getfindInfo = WsList.findFirstRow("Code == '" + getCode + "'");
	if( getfindInfo ){				
		// 삭제 및 요청		
		//WsList.deleteRow(getfindInfo.getIndex());
		smsDelete.action = '/v1/tna/shift/' + getCode;
		console.log("sms_action : " + smsDelete.action);
		smsDelete.send();
	} else {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorFailWorkTimeDelete"));
		//dialogAlert(app, "warning", " 해당 근무 시간 등록 정보는 삭제 할수 없습니다.");
	}
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms_deleteWorkTimeShiftsSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_deleteWorkTimeShifts = e.control;
	comLib.hideLoadMask();
	var ResultCode = app.lookup("Result");
	if (ResultCode.getValue("ResultCode") == 0) {
		var smsDelete = app.lookup("sms_deleteWorkTimeShifts");
		var WsList = app.lookup("TnaWorkShiftList"); 
		var getCode = app.lookup("TASCR_IpbCode").value;
		
		var getfindInfo = WsList.findFirstRow("Code == '" + getCode + "'");
		if( getfindInfo ){	WsList.deleteRow(getfindInfo.getIndex()); }
		
		_processMode = "Normal";
		//app.lookup("dmWorkShiftInfo").reset();
		app.lookup("dmDetailInOut").reset();
		//app.lookup("dmDetailWorkShift").reset();
		resetWorkShiftDataMap();
		resetDetailWorkShift();
	} else {
		//dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorFailWorkTimeDelete"));
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString(getErrorString(ResultCode.getValue("ResultCode"))));
	}
	app.lookup("TASCR_workTimegrd").redraw();
}

function onImageClick(/* cpr.events.CMouseEvent */ e){
	
	var image = e.control;
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target":DLG_HELP,	
			"ID": menu_id
		}
	});

	app.getHostAppInstance().dispatchEvent(selectionEvent);
}
