/************************************************
 * tnaDetailWorkShift.js
 * Created at 2019. 1. 24. 오후 3:41:58.
 *
 * @author joymrk
 ************************************************/
var getCode;
var MultiRange;
var util = cpr.core.Module.require("lib/util");
var dataManager = cpr.core.Module.require("lib/DataManager");
function valueChange(id, value) {
	
	switch (id) {
	case 'TAWDS_cmbRange1':
		if (value == 0) {
			app.lookup("TAWDS_cbxAutoOut1").value = 0;
			app.lookup("TAWDS_cbxAutoOut1").enabled = false;
		} else { app.lookup("TAWDS_cbxAutoOut1").enabled = true; }
		break;
	case 'TAWDS_cmbRange2':
		if (value == 0) {
			app.lookup("TAWDS_cbxAutoOut2").value = 0;
			app.lookup("TAWDS_cbxAutoOut2").enabled = false;
		} else { app.lookup("TAWDS_cbxAutoOut2").enabled = true; }
		break;
	case 'TAWDS_cmbRange3':
		if (value == 0) {
			app.lookup("TAWDS_cbxAutoOut3").value = 0;
			app.lookup("TAWDS_cbxAutoOut3").enabled = false;
		} else { app.lookup("TAWDS_cbxAutoOut3").enabled = true; }
		break;
	case 'TAWDS_cmbRange4':
		if (value == 0) {
			app.lookup("TAWDS_cbxAutoOut4").value = 0;
			app.lookup("TAWDS_cbxAutoOut4").enabled = false;
		} else { app.lookup("TAWDS_cbxAutoOut4").enabled = true; }
		break;
	case 'TAWDS_cmbRange5':
		if (value == 0) {
			app.lookup("TAWDS_cbxAutoOut5").value = 0;
			app.lookup("TAWDS_cbxAutoOut5").enabled = false;
		} else { app.lookup("TAWDS_cbxAutoOut5").enabled = true; }
		break;
	default:
		console.log("error cmbRanges");
		//TODO: error 처리
		break;
	}
	app.lookup("TAWDS_detailWorkShiftgrp").redraw();
}
function RefreshData() {
	var dmWorkShiftInfo = app.lookup("dmWorkShiftInfo");
	
	//Shift1
	app.lookup("TAWDS_cmbWork1").value = dmWorkShiftInfo.getValue("ShiftDetailWork1");
	app.lookup("TAWDS_cmbTimeUnit1").value = dmWorkShiftInfo.getValue("ShiftDetailUnit1");
	app.lookup("TAWDS_ipbMinTime1").value = util.ConvHHMMfromMinute(dmWorkShiftInfo.getValue("ShiftDetailMinTime1"), 0);
												 
	app.lookup("TAWDS_ipbMaxTime1").value = util.ConvHHMMfromMinute(dmWorkShiftInfo.getValue("ShiftDetailMaxTime1"), 0); 
	app.lookup("TAWDS_ipbTimeRate1").value = String(dmWorkShiftInfo.getValue("ShiftDetailRate1"));
	app.lookup("TAWDS_cmbRange1").value = dmWorkShiftInfo.getValue("ShiftDetailRange1");
	app.lookup("TAWDS_cbxAutoOut1").value = dmWorkShiftInfo.getValue("ShiftDetailAutoOut1");
	if(dmWorkShiftInfo.getValue("ShiftDetailWork1") == 0) {
		app.lookup("TAWDS_cmbTimeUnit1").enabled = false;
		app.lookup("TAWDS_ipbMinTime1").enabled = false;
		app.lookup("TAWDS_ipbMaxTime1").enabled = false;
		app.lookup("TAWDS_ipbTimeRate1").enabled = false;
		app.lookup("TAWDS_cmbRange1").enabled = false;
		app.lookup("TAWDS_cbxAutoOut1").enabled = false;
	}
	//Shift2
	app.lookup("TAWDS_cmbWork2").value = dmWorkShiftInfo.getValue("ShiftDetailWork2");
	app.lookup("TAWDS_cmbTimeUnit2").value = dmWorkShiftInfo.getValue("ShiftDetailUnit2");
	app.lookup("TAWDS_ipbMinTime2").value = util.ConvHHMMfromMinute(dmWorkShiftInfo.getValue("ShiftDetailMinTime2"), 0);
	app.lookup("TAWDS_ipbMaxTime2").value = util.ConvHHMMfromMinute(dmWorkShiftInfo.getValue("ShiftDetailMaxTime2"), 0); 
	app.lookup("TAWDS_ipbTimeRate2").value = String(dmWorkShiftInfo.getValue("ShiftDetailRate2"));
	app.lookup("TAWDS_cmbRange2").value = dmWorkShiftInfo.getValue("ShiftDetailRange2");
	app.lookup("TAWDS_cbxAutoOut2").value = dmWorkShiftInfo.getValue("ShiftDetailAutoOut2");
	if(dmWorkShiftInfo.getValue("ShiftDetailWork2") == 0) {
		app.lookup("TAWDS_cmbTimeUnit2").enabled = false;
		app.lookup("TAWDS_ipbMinTime2").enabled = false;
		app.lookup("TAWDS_ipbMaxTime2").enabled = false;
		app.lookup("TAWDS_ipbTimeRate2").enabled = false;
		app.lookup("TAWDS_cmbRange2").enabled = false;
		app.lookup("TAWDS_cbxAutoOut2").enabled = false;
	}
	//Shift3
	app.lookup("TAWDS_cmbWork3").value = dmWorkShiftInfo.getValue("ShiftDetailWork3");
	app.lookup("TAWDS_cmbTimeUnit3").value = dmWorkShiftInfo.getValue("ShiftDetailUnit3");
	app.lookup("TAWDS_ipbMinTime3").value = util.ConvHHMMfromMinute(dmWorkShiftInfo.getValue("ShiftDetailMinTime3"), 0);
	app.lookup("TAWDS_ipbMaxTime3").value = util.ConvHHMMfromMinute(dmWorkShiftInfo.getValue("ShiftDetailMaxTime3"), 0);
	app.lookup("TAWDS_ipbTimeRate3").value = String(dmWorkShiftInfo.getValue("ShiftDetailRate3"));
	app.lookup("TAWDS_cmbRange3").value = dmWorkShiftInfo.getValue("ShiftDetailRange3");
	app.lookup("TAWDS_cbxAutoOut3").value = dmWorkShiftInfo.getValue("ShiftDetailAutoOut3");
	if(dmWorkShiftInfo.getValue("ShiftDetailWork3") == 0) {
		app.lookup("TAWDS_cmbTimeUnit3").enabled = false;
		app.lookup("TAWDS_ipbMinTime3").enabled = false;
		app.lookup("TAWDS_ipbMaxTime3").enabled = false;
		app.lookup("TAWDS_ipbTimeRate3").enabled = false;
		app.lookup("TAWDS_cmbRange3").enabled = false;
		app.lookup("TAWDS_cbxAutoOut3").enabled = false;
	}
	//Shift4
	app.lookup("TAWDS_cmbWork4").value = dmWorkShiftInfo.getValue("ShiftDetailWork4");
	app.lookup("TAWDS_cmbTimeUnit4").value = dmWorkShiftInfo.getValue("ShiftDetailUnit4");
	app.lookup("TAWDS_ipbMinTime4").value = util.ConvHHMMfromMinute(dmWorkShiftInfo.getValue("ShiftDetailMinTime4"), 0);
	app.lookup("TAWDS_ipbMaxTime4").value = util.ConvHHMMfromMinute(dmWorkShiftInfo.getValue("ShiftDetailMaxTime4"), 0);
	app.lookup("TAWDS_ipbTimeRate4").value = String(dmWorkShiftInfo.getValue("ShiftDetailRate4"));
	app.lookup("TAWDS_cmbRange4").value = dmWorkShiftInfo.getValue("ShiftDetailRange4");
	app.lookup("TAWDS_cbxAutoOut4").value = dmWorkShiftInfo.getValue("ShiftDetailAutoOut4");
	if(dmWorkShiftInfo.getValue("ShiftDetailWork4") == 0) {
		app.lookup("TAWDS_cmbTimeUnit4").enabled = false;
		app.lookup("TAWDS_ipbMinTime4").enabled = false;
		app.lookup("TAWDS_ipbMaxTime4").enabled = false;
		app.lookup("TAWDS_ipbTimeRate4").enabled = false;
		app.lookup("TAWDS_cmbRange4").enabled = false;
		app.lookup("TAWDS_cbxAutoOut4").enabled = false;
	}
	//Shift5
	app.lookup("TAWDS_cmbWork5").value = dmWorkShiftInfo.getValue("ShiftDetailWork5");
	app.lookup("TAWDS_cmbTimeUnit5").value = dmWorkShiftInfo.getValue("ShiftDetailUnit5");
	app.lookup("TAWDS_ipbMinTime5").value = util.ConvHHMMfromMinute(dmWorkShiftInfo.getValue("ShiftDetailMinTime5"), 0);
	app.lookup("TAWDS_ipbMaxTime5").value = util.ConvHHMMfromMinute(dmWorkShiftInfo.getValue("ShiftDetailMaxTime5"), 0); 
	app.lookup("TAWDS_ipbTimeRate5").value = String(dmWorkShiftInfo.getValue("ShiftDetailRate5"));
	app.lookup("TAWDS_cmbRange5").value = dmWorkShiftInfo.getValue("ShiftDetailRange5");
	app.lookup("TAWDS_cbxAutoOut5").value = dmWorkShiftInfo.getValue("ShiftDetailAutoOut5");
	if(dmWorkShiftInfo.getValue("ShiftDetailWork5") == 0) {
		app.lookup("TAWDS_cmbTimeUnit5").enabled = false;
		app.lookup("TAWDS_ipbMinTime5").enabled = false;
		app.lookup("TAWDS_ipbMaxTime5").enabled = false;
		app.lookup("TAWDS_ipbTimeRate5").enabled = false;
		app.lookup("TAWDS_cmbRange5").enabled = false;
		app.lookup("TAWDS_cbxAutoOut5").enabled = false;
	}
}
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	// 구간 삽입
	//app.lookup("TAWDS_cmbRange1").addItem(new cpr.controls.Item("구간 1", 1));
	var initValue = app.getHost().initValue;	
	getCode = initValue["Code"];
	MultiRange = initValue["MultiRange"];
	var dmWorkShiftInfo = app.lookup("dmWorkShiftInfo");
	initValue["DetailWorkShift"].copyToDataMap(dmWorkShiftInfo);
	console.log(dmWorkShiftInfo.getDatas());
	dataManager = getDataManager();	
	var cbmRange1 =  app.lookup("TAWDS_cmbRange1");
	var cbmRange2 =  app.lookup("TAWDS_cmbRange2");
	var cbmRange3 =  app.lookup("TAWDS_cmbRange3");
	var cbmRange4 =  app.lookup("TAWDS_cmbRange4");
	var cbmRange5 =  app.lookup("TAWDS_cmbRange5");
	if ((dmWorkShiftInfo.getValue("Range1StartTime") != -1) && (dmWorkShiftInfo.getValue("Range1EndTime") != -1) ) {
		cbmRange1.addItem(new cpr.controls.Item(dataManager.getString("Str_1stBand"), 1));
		cbmRange2.addItem(new cpr.controls.Item(dataManager.getString("Str_1stBand"), 1));
		cbmRange3.addItem(new cpr.controls.Item(dataManager.getString("Str_1stBand"), 1));
		cbmRange4.addItem(new cpr.controls.Item(dataManager.getString("Str_1stBand"), 1));
		cbmRange5.addItem(new cpr.controls.Item(dataManager.getString("Str_1stBand"), 1));
	}
	if ((dmWorkShiftInfo.getValue("Range2StartTime") != -1) && (dmWorkShiftInfo.getValue("Range2EndTime") != -1) ) {
		cbmRange1.addItem(new cpr.controls.Item(dataManager.getString("Str_2stBand"), 2));
		cbmRange2.addItem(new cpr.controls.Item(dataManager.getString("Str_2stBand"), 2));
		cbmRange3.addItem(new cpr.controls.Item(dataManager.getString("Str_2stBand"), 2));
		cbmRange4.addItem(new cpr.controls.Item(dataManager.getString("Str_2stBand"), 2));
		cbmRange5.addItem(new cpr.controls.Item(dataManager.getString("Str_2stBand"), 2));
	}
	if ((dmWorkShiftInfo.getValue("Range3StartTime") != -1) && (dmWorkShiftInfo.getValue("Range3EndTime") != -1) ) {
		cbmRange1.addItem(new cpr.controls.Item(dataManager.getString("Str_3stBand"), 3));
		cbmRange2.addItem(new cpr.controls.Item(dataManager.getString("Str_3stBand"), 3));
		cbmRange3.addItem(new cpr.controls.Item(dataManager.getString("Str_3stBand"), 3));
		cbmRange4.addItem(new cpr.controls.Item(dataManager.getString("Str_3stBand"), 3));
		cbmRange5.addItem(new cpr.controls.Item(dataManager.getString("Str_3stBand"), 3));
	}

	if ((dmWorkShiftInfo.getValue("Range4StartTime") != -1) && (dmWorkShiftInfo.getValue("Range4EndTime") != -1) ) {
		cbmRange1.addItem(new cpr.controls.Item(dataManager.getString("Str_4stBand"), 4));
		cbmRange2.addItem(new cpr.controls.Item(dataManager.getString("Str_4stBand"), 4));
		cbmRange3.addItem(new cpr.controls.Item(dataManager.getString("Str_4stBand"), 4));
		cbmRange4.addItem(new cpr.controls.Item(dataManager.getString("Str_4stBand"), 4));
		cbmRange5.addItem(new cpr.controls.Item(dataManager.getString("Str_4stBand"), 4));
	}
	
	RefreshData();
	
	if (MultiRange == 0) {	// 단일 출퇴근 구간
		cbmRange1.enabled = false;
		cbmRange2.enabled = false;
		cbmRange3.enabled = false;
		cbmRange4.enabled = false;
		cbmRange5.enabled = false;
	}
	app.lookup("TAWDS_detailWorkShiftgrp").redraw();
}

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onTAWDS_cmbRangesSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var tAWDS_cmbRange = e.control;
	valueChange(tAWDS_cmbRange.id, tAWDS_cmbRange.value);
}



/*
 * "취소" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTAWDS_btnCancelClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var tAWDS_btnCancel = e.control;
	app.close();
}


/*
 * "설정" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTAWDS_btnApplyClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var tAWDS_btnApply = e.control;
	var returnValue = app.lookup("dmWorkShiftInfo");	// 전송할놈.
	var mintm = -1; var maxtm = -1;
	returnValue.setValue("ShiftDetailWork1", Number(app.lookup("TAWDS_cmbWork1").value));
	returnValue.setValue("ShiftDetailUnit1", Number(app.lookup("TAWDS_cmbTimeUnit1").value));
	
	mintm = util.ConvHHMMtoMinute(app.lookup("TAWDS_ipbMinTime1").value);
	if (mintm < 0) {
		return;
	}
	returnValue.setValue("ShiftDetailMinTime1",mintm);
	maxtm = util.ConvHHMMtoMinute(app.lookup("TAWDS_ipbMaxTime1").value);
	if (maxtm < 0) {
		return;
	}
	returnValue.setValue("ShiftDetailMaxTime1",maxtm);
	returnValue.setValue("ShiftDetailRate1", Number(app.lookup("TAWDS_ipbTimeRate1").value));
	returnValue.setValue("ShiftDetailRange1", Number(app.lookup("TAWDS_cmbRange1").value));
	returnValue.setValue("ShiftDetailAutoOut1", Number(app.lookup("TAWDS_cbxAutoOut1").value));
	////////////////////////////////////////////////////////////////////////////////////////////////////////////
	returnValue.setValue("ShiftDetailWork2", Number(app.lookup("TAWDS_cmbWork2").value));
	returnValue.setValue("ShiftDetailUnit2", Number(app.lookup("TAWDS_cmbTimeUnit2").value));
	mintm = util.ConvHHMMtoMinute(app.lookup("TAWDS_ipbMinTime2").value);
	if (mintm < 0) {
		return;
	}
	returnValue.setValue("ShiftDetailMinTime2",mintm);
	maxtm = util.ConvHHMMtoMinute(app.lookup("TAWDS_ipbMaxTime2").value);
	if (maxtm < 0) {
		return;
	}
	returnValue.setValue("ShiftDetailMaxTime2",maxtm);
	returnValue.setValue("ShiftDetailRate2", Number(app.lookup("TAWDS_ipbTimeRate2").value));
	returnValue.setValue("ShiftDetailRange2", Number(app.lookup("TAWDS_cmbRange2").value));
	returnValue.setValue("ShiftDetailAutoOut2", Number(app.lookup("TAWDS_cbxAutoOut2").value));
	
	returnValue.setValue("ShiftDetailWork3", Number(app.lookup("TAWDS_cmbWork3").value));
	returnValue.setValue("ShiftDetailUnit3", Number(app.lookup("TAWDS_cmbTimeUnit3").value));
	mintm = util.ConvHHMMtoMinute(app.lookup("TAWDS_ipbMinTime3").value);
	if (mintm < 0) {
		return;
	}
	returnValue.setValue("ShiftDetailMinTime3",mintm);
	maxtm = util.ConvHHMMtoMinute(app.lookup("TAWDS_ipbMaxTime3").value);
	if (maxtm < 0) {
		return;
	}
	returnValue.setValue("ShiftDetailMaxTime3",maxtm);
	returnValue.setValue("ShiftDetailRate3", Number(app.lookup("TAWDS_ipbTimeRate3").value));
	returnValue.setValue("ShiftDetailRange3", Number(app.lookup("TAWDS_cmbRange3").value));
	returnValue.setValue("ShiftDetailAutoOut3", Number(app.lookup("TAWDS_cbxAutoOut3").value));
	
	
	returnValue.setValue("ShiftDetailWork4", Number(app.lookup("TAWDS_cmbWork4").value));
	returnValue.setValue("ShiftDetailUnit4", Number(app.lookup("TAWDS_cmbTimeUnit4").value));
	mintm = util.ConvHHMMtoMinute(app.lookup("TAWDS_ipbMinTime4").value);
	if (mintm < 0) {
		return;
	}
	returnValue.setValue("ShiftDetailMinTime4",mintm);
	maxtm = util.ConvHHMMtoMinute(app.lookup("TAWDS_ipbMaxTime4").value);
	if (maxtm < 0) {
		return;
	}
	returnValue.setValue("ShiftDetailMaxTime4",maxtm);
	returnValue.setValue("ShiftDetailRate4", Number(app.lookup("TAWDS_ipbTimeRate4").value));
	returnValue.setValue("ShiftDetailRange4", Number(app.lookup("TAWDS_cmbRange4").value));
	returnValue.setValue("ShiftDetailAutoOut4", Number(app.lookup("TAWDS_cbxAutoOut4").value));
	
	returnValue.setValue("ShiftDetailWork5", Number(app.lookup("TAWDS_cmbWork5").value));
	returnValue.setValue("ShiftDetailUnit5", Number(app.lookup("TAWDS_cmbTimeUnit5").value));
	mintm = util.ConvHHMMtoMinute(app.lookup("TAWDS_ipbMinTime5").value);
	if (mintm < 0) {
		return;
	}
	returnValue.setValue("ShiftDetailMinTime5",mintm);
	maxtm = util.ConvHHMMtoMinute(app.lookup("TAWDS_ipbMaxTime5").value);
	if (maxtm < 0) {
		return;
	}
	returnValue.setValue("ShiftDetailMaxTime5",maxtm);
	returnValue.setValue("ShiftDetailRate5", Number(app.lookup("TAWDS_ipbTimeRate5").value));
	returnValue.setValue("ShiftDetailRange5", Number(app.lookup("TAWDS_cmbRange5").value));
	returnValue.setValue("ShiftDetailAutoOut5", Number(app.lookup("TAWDS_cbxAutoOut5").value));
	
	app.setHostProperty("returnValue", returnValue);
	app.close();	
}
