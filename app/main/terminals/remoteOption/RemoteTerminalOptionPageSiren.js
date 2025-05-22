/************************************************
 * RemoteTerminalOptionSiren.js
 * Created at 2023. 11. 29. 오후 6:22:38.
 *
 * @author zxc
 ************************************************/

var comLib;			
var dataManager = cpr.core.Module.require("lib/DataManager");
var modifyAlarmflag;

/*
 * 설정 정보 초기화 
 */	
function InitSetInputData() {
	app.lookup("RTOPSI_HH_nbe").value = 0;
	app.lookup("RTOPSI_mm_nbe").value = 0;
	app.lookup("RTOPSI_day_set_cmb").value = 0;	
	app.lookup("RTOPSI_duration_nbe").value = 0;
	app.lookup("RTOPSI_Content_ipb").value = "";
}

/*
 * 기존 등록된 [시간 : 분] 체크
 */
function Alarmtimercheck(HH, mm) {
	var dataset = app.lookup("AlarmOptionList");
	for( var i = 0; i < dataset.getRowCount(); i++) {
		var rowdata = dataset.getRow(i);
		if(Number(rowdata.getValue("Hour")) == HH && Number(rowdata.getValue("Minute")) == mm) {
			return 1;
		} 
	}
	return 0;
}

/*
 * 체크박스 세팅
 */
function cbkSettingdaysetSelected(selectedValue) {
	var Suncbx = app.lookup("RTOPSI_Sun_cbx");	//일
	var Moncbx = app.lookup("RTOPSI_Mon_cbx");	//월
	var Tuecbx = app.lookup("RTOPSI_Tue_cbx");	//화
	var Wedcbx = app.lookup("RTOPSI_Wed_cbx");	//수
	var Thucbx = app.lookup("RTOPSI_Thu_cbx");	//목
	var Fricbx = app.lookup("RTOPSI_Fri_cbx");	//금
	var Satcbx = app.lookup("RTOPSI_Sat_cbx");	//토
	var Holicbx = app.lookup("RTOPSI_Holi_cbx");	//공휴일
	switch(selectedValue) {
		case "1":
			Suncbx.value = "1";
			Moncbx.value = "1";
			Tuecbx.value = "1";
			Wedcbx.value = "1";
			Thucbx.value = "1";
			Fricbx.value = "1";
			Satcbx.value = "1";
			break;
		case "2":
			Suncbx.value = "0";
			Moncbx.value = "1";
			Tuecbx.value = "1";
			Wedcbx.value = "1";
			Thucbx.value = "1";
			Fricbx.value = "1";
			Satcbx.value = "0";
			break;
		case "3":
			Suncbx.value = "0";
			Moncbx.value = "1";
			Tuecbx.value = "1";
			Wedcbx.value = "1";
			Thucbx.value = "1";
			Fricbx.value = "1";
			Satcbx.value = "1";
			break;
		case "4":
			Suncbx.value = "1";
			Moncbx.value = "0";
			Tuecbx.value = "0";
			Wedcbx.value = "0";
			Thucbx.value = "0";
			Fricbx.value = "0";
			Satcbx.value = "1";
			break;
		case "5":
			Suncbx.value = "0";
			Moncbx.value = "0";
			Tuecbx.value = "0";
			Wedcbx.value = "0";
			Thucbx.value = "0";
			Fricbx.value = "0";
			Satcbx.value = "0";
			Holicbx.value = "0";
			break;
	}
} 

function checkCbxSettingDay() {
	var day_set_cmb = app.lookup("RTOPSI_day_set_cmb");
	
	var Suncbx = app.lookup("RTOPSI_Sun_cbx");	//일
	var Moncbx = app.lookup("RTOPSI_Mon_cbx");	//월
	var Tuecbx = app.lookup("RTOPSI_Tue_cbx");	//화
	var Wedcbx = app.lookup("RTOPSI_Wed_cbx");	//수
	var Thucbx = app.lookup("RTOPSI_Thu_cbx");	//목
	var Fricbx = app.lookup("RTOPSI_Fri_cbx");	//금
	var Satcbx = app.lookup("RTOPSI_Sat_cbx");	//토
	var Holicbx = app.lookup("RTOPSI_Holi_cbx");	//공휴일

	if (Suncbx.value == "1" && Moncbx.value == "1" && Tuecbx.value == "1" && Wedcbx.value == "1" && Thucbx.value == "1" && Fricbx.value == "1" && Satcbx.value == "1"){
		day_set_cmb.value = "1"
	} else if (Suncbx.value == "0" && Moncbx.value == "1" && Tuecbx.value == "1" && Wedcbx.value == "1" && Thucbx.value == "1" && Fricbx.value == "1" && Satcbx.value == "0"){
		day_set_cmb.value = "2" 
	} else if(Suncbx.value == "0" && Moncbx.value == "1" && Tuecbx.value == "1" && Wedcbx.value == "1" && Thucbx.value == "1" && Fricbx.value == "1" && Satcbx.value == "1"){ 
		day_set_cmb.value = "3" 
	} else if (Suncbx.value == "1" && Moncbx.value == "0" && Tuecbx.value == "0" && Wedcbx.value == "0" && Thucbx.value == "0" && Fricbx.value == "0" && Satcbx.value == "1"){
		day_set_cmb.value = "4" 
	} else if(Suncbx.value == "0" && Moncbx.value == "0" && Tuecbx.value == "0" && Wedcbx.value == "0" && Thucbx.value == "0" && Fricbx.value == "0" && Satcbx.value == "1"){ 
		day_set_cmb.value = "5" 
	} else {
		day_set_cmb.value = "0" 
	}
	day_set_cmb.redraw();
} 

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	var terminalType = app.getHost().initValue;
	modifyAlarmflag = 0;
	
	var hostAppIns = app.getHostAppInstance();
	if (hostAppIns) {
		var alarmOptList = hostAppIns.callAppMethod("getAlarmOptionList");
		var aOptinfo = app.lookup("AlarmOptionList");
		aOptinfo.clear();
		alarmOptList.copyToDataSet(aOptinfo);
		
		app.lookup("RTOPSI_alarm_grp").redraw();
	}
}

function onRTOPSI_day_set_cmbSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var rTOPSI_day_set_cmb = e.control;
	cbkSettingdaysetSelected(rTOPSI_day_set_cmb.value);
}

function onRTOPSI_btnAddClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var rTOPSI_btnAdd = e.control;
	var getHH = app.lookup("RTOPSI_HH_nbe");
	var getmm = app.lookup("RTOPSI_mm_nbe");
	var existflag = Alarmtimercheck(getHH.value, getmm.value);
	if(existflag == 1) {
		dialogAlert(app, dataManager.getString("Str_Fail"), dataManager.getString("Str_ErrorSameAlarm"));	
		return;
	}
	
	var Aldataset= app.lookup("AlarmOptionList");
	
	if (Aldataset.getRowCount() >= 100) {	// max 100
		dialogAlert(app, dataManager.getString("Str_Fail"), dataManager.getString("Str_NoAddMore"));	
		return;
	}
	
	var newRowData = {
		"Hour": Number(getHH.value), 
		"Minute": Number(getmm.value), 
		"Duration": Number(app.lookup("RTOPSI_duration_nbe").value),
		"Sunday": Number(app.lookup("RTOPSI_Sun_cbx").value),
		"Monday": Number(app.lookup("RTOPSI_Mon_cbx").value),
		"Tuesday": Number(app.lookup("RTOPSI_Tue_cbx").value),
		"Wednesday": Number(app.lookup("RTOPSI_Wed_cbx").value),
		"Thursday": Number(app.lookup("RTOPSI_Thu_cbx").value),
		"Friday": Number(app.lookup("RTOPSI_Fri_cbx").value),
		"Saturday": Number(app.lookup("RTOPSI_Sat_cbx").value),
		"Holiday": Number(app.lookup("RTOPSI_Holi_cbx").value),
		"Contents": app.lookup("RTOPSI_Content_ipb").value,
		"Reserved1":0, "Reserved2":0,"Reserved3":0,"Reserved4":0
	};
	
	Aldataset.addRowData(newRowData);
	app.lookup("RTOPSI_grd").redraw();
	
	modifyAlarmflag = 1;
	
	InitSetInputData();

}

function onRTOPSI_grdSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var rTOPSI_grd = e.control;
	var selectedRow = rTOPSI_grd.getSelectedRow();
	var getRowdata = selectedRow.getRowData();
	app.lookup("RTOPSI_HH_nbe").value = getRowdata["Hour"];
	app.lookup("RTOPSI_mm_nbe").value = getRowdata["Minute"];
	app.lookup("RTOPSI_duration_nbe").value = getRowdata["Duration"];
	app.lookup("RTOPSI_Sun_cbx").value = getRowdata["Sunday"];
	app.lookup("RTOPSI_Mon_cbx").value = getRowdata["Monday"];
	app.lookup("RTOPSI_Tue_cbx").value = getRowdata["Tuesday"];
	app.lookup("RTOPSI_Wed_cbx").value = getRowdata["Wednesday"];
	app.lookup("RTOPSI_Thu_cbx").value = getRowdata["Thursday"];
	app.lookup("RTOPSI_Fri_cbx").value = getRowdata["Friday"];
	app.lookup("RTOPSI_Sat_cbx").value = getRowdata["Saturday"];
	app.lookup("RTOPSI_Holi_cbx").value = getRowdata["Holiday"];
	app.lookup("RTOPSI_Content_ipb").value = getRowdata["Contents"];
	checkCbxSettingDay();
}

function onRTOPSI_btnModiClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var rTOPSI_btnModi = e.control;
	var grid = app.lookup("RTOPSI_grd");
	var SelectedRow = grid.getSelectedRow();	
	if ( SelectedRow != null) {
		grid.updateRow(SelectedRow.getIndex(), 
		{
			"Hour": app.lookup("RTOPSI_HH_nbe").value,
			"Minute": app.lookup("RTOPSI_mm_nbe").value,
			"Duration": app.lookup("RTOPSI_duration_nbe").value,
			"Sunday": app.lookup("RTOPSI_Sun_cbx").value,
			"Monday": app.lookup("RTOPSI_Mon_cbx").value,
			"Tuesday": app.lookup("RTOPSI_Tue_cbx").value,
			"Wednesday": app.lookup("RTOPSI_Wed_cbx").value,
			"Thursday": app.lookup("RTOPSI_Thu_cbx").value,
			"Friday": app.lookup("RTOPSI_Fri_cbx").value,
			"Saturday": app.lookup("RTOPSI_Sat_cbx").value,
			"Holiday": app.lookup("RTOPSI_Holi_cbx").value,
			"Contents": app.lookup("RTOPSI_Content_ipb").value,
			"Reserved1":0, "Reserved2":0, "Reserved3":0, "Reserved4":0
		});
		
		modifyAlarmflag = 1;

	} else {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_NoSelectedItem"));
		return;
	}
	
	checkCbxSettingDay();

}

function onRTOPSI_btnDelClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var rTOPSI_btnDel = e.control;
	var grid = app.lookup("RTOPSI_grd");
	var SelectedRow = grid.getSelectedRow();	
	if (SelectedRow == null){
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_NoSelectedItem"));
		return;
	} else {
		var selIdx = SelectedRow.getIndex();
		grid.deleteRow(selIdx);
		modifyAlarmflag = 1;
	}
}

//<-------------------------------------------------------------------------------

exports.getTerminalDataSet = function() {
	var AlarmOptList = app.lookup("AlarmOptionList");
	return AlarmOptList;
}

exports.getPageInfo = function() {
	return "Siren";
}

exports.getModifyFlag = function() {
	return modifyAlarmflag;
}

exports.setModifyFlag = function(flag) {
	modifyAlarmflag = 0;
}

//-------------------------------------------------------------------------------->
