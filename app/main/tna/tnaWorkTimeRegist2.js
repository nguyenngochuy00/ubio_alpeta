/************************************************
 * tnaWorkTimeRegist.js
 * Created at 2019. 1. 18. 오후 2:32:26.
 *
 * @author joymrk
 ************************************************/
var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var util = cpr.core.Module.require("lib/util");
var tmpCode; // 기본 값은 "1" 부터 순차 증가. 스트링 비교시 같으면 한번더 증가
var _processMode; // Normal : 선택안함 or 처음시작, Add : 신규 추가, Modify : 변경
var usint_version;
//----------------------------------------------------------------------------------------> 클라이언트 전용 함수
// 빈 아이디 생성
function setTmpCode(WsList) {
	for (var i = 0 ;  i < WsList.getRowCount(); i++) {
		var WorkShiftCode = WsList.getRow(i).getValue("Code");
	
		if (Number(WorkShiftCode) == tmpCode){
			tmpCode++;	
		}
	}
	if (tmpCode < 10 && tmpCode.toString().length < 2) {
		tmpCode = '0' + tmpCode
	}
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
		} else  {
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
		} else  {
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
		} else  {
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
		} else  {
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
		} else  {
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
//----------------------------------------------------------------------------------------< 클라이언트 전용 함수
/* Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();	
	usint_version = dataManager.getSystemVersion();
	var dsContextMenu = app.lookup("dsContextMenu"); 						// 생각외로 불펀함. 
	dsContextMenu.addRowData({"label":dataManager.getString("Str_Add"), "value":1, "parent":"0"});
	dsContextMenu.addRowData({"label":dataManager.getString("Str_Delete"), "value":2, "parent":"0"});
	tmpCode = 1;
	_processMode = "Normal";
	var dmInitData = app.lookup("dmWorkShiftInfo"); 
	//dmInitData.reset(); // -> 설명과는 다르게 초기값 세팅이아닌 삭제이다.
	resetWorkShiftDataMap(); // 초기값 세팅 함수 (임시)
	var requestData = app.lookup("sms_getWorkTimeShifts");
	requestData.action = "/v1/tna/shift";
	console.log("sms_action : " + requestData.action);
	requestData.send();
}
//-----------------------------------------------------------------------------------------> sms_getWorkTimeShifts
function onSms_getWorkTimeShiftsSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var sms_getWorkTimeShifts = e.control;
	var ResultCode = app.lookup("Result");
	if (ResultCode.getValue("ResultCode") == 0) {
		var getList = app.lookup("TnaWorkShiftList");
		getList.setSort("Code");
		setTmpCode(getList);
	} else {
		//var strError = dataManager.getString("Str_TNAWorkTimeSetting") + ": " +dataManager.getString("Str_ErrorGetDataFail");
		var strError = dataManager.getString("Str_TNAWorkTimeSetting") + ": " +dataManager.getString(getErrorString(ResultCode.getValue("ResultCode")));
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
	_processMode = "Modify";
	
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
			app.lookup("TASCR_lateTime_dti").value = util.ConvDHHMMfromMinute(nLateTime);;
		} 
		
		if (nLackTime == -1 ) {
			app.lookup("TASCR_lackTime_cbx").value = nLackTime;	// -1
			app.lookup("TASCR_lateTime_dti").enabled = false;
			app.lookup("TASCR_lateTime_dti").value = "00:00";
		} else {
			app.lookup("TASCR_lackTime_cbx").value = 1;	
			app.lookup("TASCR_lackTime_dti").enabled = true;
			app.lookup("TASCR_lackTime_dti").value = util.ConvDHHMMfromMinute(nLackTime);
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
		dmDetail.clear();
		dmWorkShift.copyToDataMap(dmDetail);
		dmDetail.setValue("Code", app.lookup("TASCR_IpbCode").value);
		dmDetail.setValue("WorkStartTime", app.lookup("TASCR_ipbWorkStartTime").value);
		dmDetail.setValue("WorkEndTime", app.lookup("TASCR_ipbWorkEndTime").value);
		dmDetail.setValue("MultiRange", Number(app.lookup("TASCR_MultiRange_cbx").value));
		var appld = "app/main/tna/popup/tnaDetailInout" + "?" + usint_version;
		app.getRootAppInstance().openDialog(appld, {width: 520, height: 470}, function(dialog){
			dialog.ready(function(dialogApp){
				dialog.initValue = {
					"DetailWorkShift": dmDetail
				};
				dialog.modal = true;
				
			});
		}).then(function(returnValue){
			var tmpdm = app.lookup("dmDetailInOut");
			tmpdm.build(returnValue);
			tmpdm.copyToDataMap(dmWorkShift);
			tmpdm.clear();
			//--- 데이터 복사 완료
			app.lookup("TASCR_ipbWorkStartTime").value = util.ConvDHHMMfromMinute(dmWorkShift.getValue("WorkStartTime"));	
			app.lookup("TASCR_ipbWorkEndTime").value = util.ConvDHHMMfromMinute(dmWorkShift.getValue("WorkEndTime"));	
		});
	}
	app.lookup("TASCR_BasicGrp").redraw();
	app.lookup("TASCR_BasicGrp2").redraw();
}



/*
 * 그리드에서 contextmenu 이벤트 발생 시 호출.
 * 마우스의 오른쪽 버튼이 클릭되거나 컨텍스트 메뉴 키가 눌려지면 호출되는 이벤트.
 */
function onTASCR_workTimegrdContextmenu(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var tASCR_workTimegrd = e.control;
	e.preventDefault();
	var menu_1 = new cpr.controls.Menu();
	
	menu_1.setItemSet(app.lookup("dsContextMenu"), {
		label: "label",
		value: "value",
		parentValue: "parent"
	});
			
	var rect = app.getActualRect();
	menu_1.style.css({
		left: (e.clientX - rect.left) + "px",
		top: (e.clientY - rect.top) + "px",
		height: "60px",
		width: "100px",
		position: "absolute"
	});
	menu_1.focus();
	
	menu_1.addEventListener("selection-change", function(e) {		
		//menu_1.dispose();
		console.log(menu_1.value);
		switch( menu_1.value ){
		case "1":
			var dmWorkShift = app.lookup("dmWorkShiftInfo");
			resetWorkShiftDataMap();
			//dmWorkShift.reset(); // 이거 함수가 안먹는다.
			
			
			console.log(dmWorkShift.getDatas());
			
			var getList = app.lookup("TnaWorkShiftList");
			getList.setSort("Code");
			setTmpCode(getList);
			
			dmWorkShift.setValue("Code", String(tmpCode));
			tmpCode++;
			var AddTnaWorkShiftList = app.lookup("TnaWorkShiftList");
			var result = AddTnaWorkShiftList.addRowData(dmWorkShift.getDatas());
			app.lookup("TASCR_workTimegrd").selectRows(result.getIndex(), true);
			
			_processMode = "Add";
			console.log(_processMode);
			break;
		case "2":
			app.lookup("TASCR_WorkTimeDelete").click();
			break;
		default:
			console.log("error");
			break;
		}
	});
	
	menu_1.addEventListener("blur", function(e) {
		menu_1.dispose();
	});
	// 메뉴에서 벗어날 경우의 이벤트 리스너.. 실제로는 안보이나 css를 통해 설정된 영역을 벗어나 클릭해야 사라짐.. 수정 필요..
	app.floatControl(menu_1);
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
		var dmDetail = app.lookup("dmDetailWorkShift");
		dmDetail.clear();
		dmWorkShift.copyToDataMap(dmDetail);
		dmDetail.setValue("Code", app.lookup("TASCR_IpbCode").value);
		var appld = "app/main/tna/popup/tnaDetailWorkShift" + "?" + usint_version;
		app.getRootAppInstance().openDialog(appld, {width : 600, height : 800}, function(dialog){
			dialog.ready(function(dialogApp){
				dialog.initValue = { 
					"Code": Code,
					"MultiRange": app.lookup("TASCR_MultiRange_cbx").value,
					"DetailWorkShift": dmDetail 
				};
				dialog.modal = true;
			});
		}).then(function(returnValue){
			returnValue.copyToDataMap(dmWorkShift);
		});
	}
}


/*
 * "적용" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTASCR_WorkShiftAddandModiClick(/* cpr.events.CMouseEvent */ e){
	var tASCR_WorkShiftAddandModi = e.control;
	var wTimeCode = app.lookup("TASCR_IpbCode").value;
	if (wTimeCode == "00" || wTimeCode == "0" || wTimeCode == "") {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorInvalidWorkTimeCode"));
		//dialogAlert(app, "error", " 근무시간 등록 코드를 정상 입력 해야 합니다.");
		return;
	}
	var dmWsInfo = app.lookup("dmWorkShiftInfo");
	var bresult = setWorkShiftInfo(dmWsInfo);
	if (bresult[0] == true) {
		if( _processMode == 'Normal' ) {
			// TODO:  선택도 아니고 추가도 아닌 상황. 오류 값 체크후  추가 및 변경 처리 진행.
			// 현재는 실패 처리
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorCanNotSave"));
			//dialogAlert(app, "Fail", "추가or변경 상태가 아닙니다.");	
			return -1;
		} else if (_processMode == 'Add' ) {
			var smsPost = app.lookup("sms_postWorkTimeShifts");
			var WsList = app.lookup("TnaWorkShiftList"); 
			var getfindInfo = WsList.findFirstRow("Code == "+ dmWsInfo.getValue("Code"));
			if( getfindInfo ){				
				getfindInfo.setRowData(dmWsInfo.getDatas());			
			} else {
				//list add
				WsList.addRowData(dmWsInfo.getDatas());
			}
			smsPost.action = "/v1/tna/shift";
			smsPost.send();
			// 
		} else if (_processMode == 'Modify') {
			
			var WsList = app.lookup("TnaWorkShiftList"); 
			var getfindInfo = WsList.findFirstRow("Code == "+ dmWsInfo.getValue("Code"));
			if( getfindInfo ){	
				getfindInfo.setRowData(dmWsInfo.getDatas());
				var smsPut = app.lookup("sms_putWorkTimeShifts");	
				smsPut.action = "/v1/tna/shift";
				smsPut.send();
			} else {
				dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorInvalidWorkTimeCode"));
				//dialogAlert(app, "error", " 등록되지 않은 근태 시간 등록 코드 입니다.");		
				return;
			}
		} else {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorCanNotSave"));	
		}
	} else {
		//dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorCanNotSave"));	
		dialogAlert(app, "error", bresult[1]);
		return;
	}
	
	app.lookup("TASCR_workTimegrd").redraw();
}

function setWorkShiftInfo(dmWsInfo) {
	var strError ="";
	// 코드
	dmWsInfo.setValue("Code", app.lookup("TASCR_IpbCode").value); 
	// 이름 
	dmWsInfo.setValue("Name", app.lookup("TASCR_IpbName").value);
	// 당일 근태처리 구간
	var WorkStartTm = util.ConvDHHMMtoMinute(app.lookup("TASCR_ipbWorkStartTime").value);
	if(WorkStartTm < 0) {
		strError = dataManager.getString("Str_TimeFrame") + ": " + dataManager.getString("Str_ErrorTime");
		return [false, strError];
	}
	var WorkEndTm = util.ConvDHHMMtoMinute(app.lookup("TASCR_ipbWorkEndTime").value);
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
	if (app.lookup("TASCR_lateTime_cbx").value == 1) {
		lateTm = util.ConvHHMMtoMinute(app.lookup("TASCR_lateTime_dti"));
		if( lateTm == 1) {
			strError = dataManager.getString("Str_LateInTime") + ": "+ dataManager.getString("Str_ErrorTime");
			return [false, strError];
		} 
		if((lateTm < WorkStartTm) || (lateTm > WorkEndTm)) {
			strError = dataManager.getString("Str_LateInTime") + ": "+ dataManager.getString("Str_ErrorOutOfArea");
			return [false,strError];
		}	
	} else { lateTm = -1; } //코드 상에서 실패값을 확인하기 위해서 다시 입력.
	dmWsInfo.setValue("LateTime", lateTm);
	
	//조퇴 시간 체크
	var lackTm = -1;
	if (app.lookup("TASCR_lackTime_cbx").value == 1) {
		lackTm = util.ConvHHMMtoMinute(app.lookup("TASCR_lackTime_cbx").value);
		if( lackTm == 1 ) {
			strError = dataManager.getString("Str_EarlyOutTime") + ": "+ dataManager.getString("Str_ErrorTime");
			return [false, strError];
		}
		
		if((lackTm < WorkStartTm) || (lackTm > WorkEndTm)) {
			strError = dataManager.getString("Str_EarlyOutTime") + ": "+ dataManager.getString("Str_ErrorOutOfArea");
			return [false,strError];
		}
	} else { lackTm = -1; }
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
		if(edtTm > WorkEndTm) { return [false,"근무시간 제 1 설정의 시간2이(가) 당일 근태처리 종료시각보다 크게 입력 되었습니다."]; }
	} else {	//HHMM 형태 
		sdtTm = util.ConvHHMMtoMinute(app.lookup("TASCR_sShiftDetail_dti1").value);
		edtTm = util.ConvHHMMtoMinute(app.lookup("TASCR_eShiftDetail_dti1").value);
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
		sdtTm = util.ConvHHMMtoMinute(app.lookup("TASCR_sShiftDetail_dti2").value);
		edtTm = util.ConvHHMMtoMinute(app.lookup("TASCR_eShiftDetail_dti2").value);
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
		sdtTm = util.ConvHHMMtoMinute(app.lookup("TASCR_sShiftDetail_dti3").value);
		edtTm = util.ConvHHMMtoMinute(app.lookup("TASCR_eShiftDetail_dti3").value);
		
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
		sdtTm = util.ConvHHMMtoMinute(app.lookup("TASCR_sShiftDetail_dti4").value);
		edtTm = util.ConvHHMMtoMinute(app.lookup("TASCR_eShiftDetail_dti4").value);
		
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
		sdtTm = util.ConvHHMMtoMinute(app.lookup("TASCR_sShiftDetail_dti5").value);
		edtTm = util.ConvHHMMtoMinute(app.lookup("TASCR_eShiftDetail_dti5").value);
		
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
	return [true];
}
//-------------------------------------------------------------------------------------------------------------------------------------
function onSms_postWorkTimeShiftsSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		tmpCode = 1; //초기화 _addProcess 진행시 다시 얻어 오도록처리
		_processMode = "Modify";
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorFailWorkTimeRegist"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
		//comLib.alert("warning", " 근무시간 등록 실패 하였습니다.");
	}	
}
function onSms_postWorkTimeShiftsSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);		
}

function onSms_postWorkTimeShiftsSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT );
}




/*
 * 그리드에서 before-selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택되기 전에 발생하는 이벤트.
 */
function onTASCR_workTimegrdBeforeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var tASCR_workTimegrd = e.control;
	if (_processMode == "Add") {
		var dmWsInfo = app.lookup("dmWorkShiftInfo");
		var bresult = setWorkShiftInfo(dmWsInfo);
		var strComirm = dataManager.getString("Str_TNAModifyConfirm");
		if (confirm(strComirm) == true) {
			if (bresult[0] == true) {
				var WsList = app.lookup("TnaWorkShiftList"); 
				var getfindInfo = WsList.findFirstRow("Code == "+ dmWsInfo.getValue("Code"));
				if( getfindInfo ){				
					getfindInfo.setRowData(dmWsInfo.getDatas());			
				} else {
					WsList.addRowData(dmWsInfo.getDatas());
				}
				
				var smsPost = app.lookup("sms_postWorkTimeShifts");
				smsPost.action = "/v1/tna/shift";
				smsPost.send();
			} else {
				dialogAlert(app, "error", bresult[1]);
				tmpCode = 1; 
				_processMode = "Normal";
				var WsList = app.lookup("TnaWorkShiftList");
				var getfindInfo = WsList.findFirstRow("Code == "+ dmWsInfo.getValue("Code"));
				if( getfindInfo ){	
					WsList.deleteRow(getfindInfo.getIndex());		
				} 
				
				app.lookup("TASCR_workTimegrd").focus(false);
				
				app.lookup("dmDetailInOut").reset();
				resetWorkShiftDataMap();
				resetDetailWorkShift();
				return;
			}
		} else {
			var WsList = app.lookup("TnaWorkShiftList");
			var getfindInfo = WsList.findFirstRow("Code == "+ dmWsInfo.getValue("Code"));
			if( getfindInfo ){	
				WsList.deleteRow(getfindInfo.getIndex());		
			} 
				
			app.lookup("TASCR_workTimegrd").focus(false);
			//app.lookup("dmWorkShiftInfo").reset();
			app.lookup("dmDetailInOut").reset();
			//app.lookup("dmDetailWorkShift").reset();
			resetWorkShiftDataMap();
			resetDetailWorkShift();
		}		
	} else {
		console.log("_processMode : ["+ _processMode +"]");
	}
	
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
		tmpCode = 1; //초기화 _addProcess 진행시 다시 얻어 오도록처리
		_processMode = "Modify";
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
	var getfindInfo = WsList.findFirstRow("Code == "+ getCode);
	if( getfindInfo ){				
		// 삭제 및 요청		
		WsList.deleteRow(getfindInfo.getIndex());
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
		tmpCode = 1; //초기화 _addProcess 진행시 다시 얻어 오도록처리
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
	console.log(menu_id);
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target":DLG_HELP,	
			"ID": menu_id
		}
	});

	app.getHostAppInstance().dispatchEvent(selectionEvent);
}
