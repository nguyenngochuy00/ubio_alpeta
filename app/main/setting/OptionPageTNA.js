/************************************************
 * OptionPageTNA.js
 * Created at 2019. 4. 29. 오후 9:11:09.
 *
 * @author wonki
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad( /* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	var hostApp = app.getHostAppInstance();
	var dmTNA = app.lookup("OptionTNA");
	
	hostApp.callAppMethod("getTNAData").copyToDataMap(dmTNA);
	
	if (loadAutoProcCbx() == 1) {
		var autoProcTime = dmTNA.getValue("AutoProcTime");
		var scType = autoProcTime % 100;
		var setTime = parseInt(autoProcTime / 100);
		var hour = parseInt(setTime / 100);
		var min = setTime % 100;
		
		app.lookup("OPTNA_rdbAutoProcTime").value = scType;
		enableAutoProcCmbSetting();
		
		switch (scType) {
			case 1:
				app.lookup("OPTNA_cmbAutoProcDayHour").enabled = true;
				app.lookup("OPTNA_cmbAutoProcDayHour").value = hour;
				
				app.lookup("OPTNA_cmbAutoProcDayMin").enabled = true;
				app.lookup("OPTNA_cmbAutoProcDayMin").value = min;
				break;
			case 2:
				app.lookup("OPTNA_cmbAutoProcHourCycle").enabled = true;
				app.lookup("OPTNA_cmbAutoProcHourCycle").value = hour;
				break;
			case 3:
				app.lookup("OPTNA_cmbAutoProcMinCycle").enabled = true;
				app.lookup("OPTNA_cmbAutoProcMinCycle").value = min;
				break;
		}
	}
	
	// Todo: 아래 문장이 필요한 이유는? 디자인 페이지에서 맵핑된 문자열이 아닌지...
	// app.lookup("cbx1").text = dataManager.getString("Str_OptionAutoProcessSet");
	app.lookup("SETNA_grpMain").redraw();
	checkPayPeriodtoDayofWeek();
	
	initCustomSetting();
}

/*
 * Body에서 unload 이벤트 발생 시 호출.
 * 앱이 언로드된 후 발생하는 이벤트입니다.
 */
//function onBodyUnload(/* cpr.events.CEvent */ e){
//	var hostApp = app.getHostAppInstance();
//	hostApp.callAppMethod("setTNAData", app.lookup("OptionTNA"));
//}
exports.requestSetData = function() {
	var hostApp = app.getHostAppInstance();
	
	var dmTNA = app.lookup("OptionTNA");
	var autoProcTime = 0;
	if (loadAutoProcCbx() == 1) {
		/*
		 * 설정 포멧 	[00][00][00]
					시 | 분 |ScType
					ex) 230001	: 매일 23:00 분에 동작
					020002		: 00:00부터 2시간 마다 동작
					2003		: 00분 부터 20분마다 동작
		 */
		var scType = Number(app.lookup("OPTNA_rdbAutoProcTime").value);
		var hour = 0;
		var min = 0;
		
		switch (scType) {
			case 1:
				hour = app.lookup("OPTNA_cmbAutoProcDayHour").value;
				min = app.lookup("OPTNA_cmbAutoProcDayMin").value;
				break;
			case 2:
				hour = app.lookup("OPTNA_cmbAutoProcHourCycle").value;
				break;
			case 3:
				min = app.lookup("OPTNA_cmbAutoProcMinCycle").value;
				break;
		}
		autoProcTime = hour * 10000 + min * 100 + scType;
	}
	
	dmTNA.setValue("AutoProcTime", autoProcTime);
	
	hostApp.callAppMethod("setTNAData", app.lookup("OptionTNA"));
}

/*
 * 체크 박스에서 value-change 이벤트 발생 시 호출.
 * CheckBox의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onCbx1ValueChange( /* cpr.events.CValueChangeEvent */ e) {
	/** 
	 * @type cpr.controls.CheckBox
	 */
	var cbx1 = e.control;
	
	loadAutoProcCbx();
}

/*
 * 라디오 버튼에서 selection-change 이벤트 발생 시 호출.
 * 라디오버튼 아이템을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onOPTNA_rdbAutoProcTimeSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type cpr.controls.RadioButton
	 */
	var oPTNA_rdbAutoProcTime = e.control;
	
	enableAutoProcCmbSetting();
}

/*
 * 자동 근태 처리 설정 체크박스 load
 */
function loadAutoProcCbx() {
	var cbxValue = Number(app.lookup("cbx1").value);
	
	switch (cbxValue) {
		case 0:
			app.lookup("OPTNA_rdbAutoProcTime").enabled = false;
			disableAutoProcCmbSetting();
			break;
		case 1:
			app.lookup("OPTNA_rdbAutoProcTime").enabled = true;
			enableAutoProcCmbSetting();
			break;
	}
	
	return cbxValue;
}

/*
 * 자동 근태 처리 설정 콤보 박스 disable
 */
function disableAutoProcCmbSetting() {
	app.lookup("OPTNA_cmbAutoProcDayHour").enabled = false;
	app.lookup("OPTNA_cmbAutoProcDayMin").enabled = false;
	app.lookup("OPTNA_cmbAutoProcHourCycle").enabled = false;
	app.lookup("OPTNA_cmbAutoProcMinCycle").enabled = false;
}

/*
 * 자동 근태 처리 설정 콤보 박스 enable
 */
function enableAutoProcCmbSetting() {
	
	switch (Number(app.lookup("OPTNA_rdbAutoProcTime").value)) {
		case 1:
			app.lookup("OPTNA_cmbAutoProcDayHour").enabled = true;
			app.lookup("OPTNA_cmbAutoProcDayMin").enabled = true;
			app.lookup("OPTNA_cmbAutoProcHourCycle").enabled = false;
			app.lookup("OPTNA_cmbAutoProcMinCycle").enabled = false;
			break;
		case 2:
			app.lookup("OPTNA_cmbAutoProcDayHour").enabled = false;
			app.lookup("OPTNA_cmbAutoProcDayMin").enabled = false;
			app.lookup("OPTNA_cmbAutoProcHourCycle").enabled = true;
			app.lookup("OPTNA_cmbAutoProcMinCycle").enabled = false;
			break;
		case 3:
			app.lookup("OPTNA_cmbAutoProcDayHour").enabled = false;
			app.lookup("OPTNA_cmbAutoProcDayMin").enabled = false;
			app.lookup("OPTNA_cmbAutoProcHourCycle").enabled = false;
			app.lookup("OPTNA_cmbAutoProcMinCycle").enabled = true;
			break;
	}
}

function checkPayPeriodtoDayofWeek() {
	
	var period = app.lookup("cbx_optionPayPeriod").value;
	var firstDayofWeek = app.lookup("nbe_optionFirstDayofWeek");
	var startValue = firstDayofWeek.value;
	
	//0 - month
	if (period == 0) {
		firstDayofWeek.min = 1;
		firstDayofWeek.max = 31;
		//1 - 1 week
	} else if (period == 1) {
		firstDayofWeek.min = 1;
		firstDayofWeek.max = 7;
		if (startValue > 7) {
			firstDayofWeek.value = 7;
		}
		//2 - 2 weeks
	} else if (period == 2) {
		firstDayofWeek.min = 1;
		firstDayofWeek.max = 14;
		if (startValue > 14) {
			firstDayofWeek.value = 14;
		}
	}
}

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCbx_optionPayPeriodSelectionChange2(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var cbx_optionPayPeriod = e.control;
	checkPayPeriodtoDayofWeek();	
}

function initCustomSetting() {
	if ( dataManager.getOemVersion() == OEM_HYUNDAI_HI ) {
		app.lookup("opt_optionNoDecimals").visible = false;
		app.lookup("nbe_OptionNoDecimals").visible = false;
		app.lookup("opt_optionTimeDisplayedAs").visible = false;
		app.lookup("cmb_optionTimeDisplayedAs").visible = false;
		app.lookup("opt_optionNoofDecimas").visible = false;
		app.lookup("nbe_optionNoofDecimals").visible = false;
		app.lookup("opt_optionPayPerid").visible = false;
		app.lookup("cbx_optionPayPeriod").visible = false;
		app.lookup("opt_optionFirstDayofWeek").visible = false;
		app.lookup("nbe_optionFirstDayofWeek").visible = false;
		app.lookup("opt_optionCalculateFrom").visible = false;
		app.lookup("dti_optionCalculateFrom").visible = false;
		app.lookup("opt_oprionCalculateWeek").visible = false;
		app.lookup("ipb_oprionCalculateWeek").visible = false;
	}
}

