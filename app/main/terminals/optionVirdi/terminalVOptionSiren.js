/************************************************
 * terminalVOptionSiren.js
 * Created at 2018. 12. 5. 오전 11:05:22.
 *
 * @author joymrk
 ************************************************/
var comLib;			
var dataManager = cpr.core.Module.require("lib/DataManager");
var oem_version;

function SyncOptSirenWithVinfoFrame() {
		
	var hostAppIns = app.getHostAppInstance();
	var aOptStatus = hostAppIns.callAppMethod("modifyTerminalOptStatus", "AlarmOpt"); 
	var AList = app.lookup("AlarmOptionList");
	var res = hostAppIns.callAppMethod("setAlarmOption", AList); 
}	

/*
 * 설정 정보 초기화 
 */	
function InitSetInputData() {
	app.lookup("TMVSI_HH_nbe").value = 0;
	app.lookup("TMVSI_mm_nbe").value = 0;
	app.lookup("TMVSI_day_set_cmb").value = 0;	
	app.lookup("TMVSI_duration_nbe").value = 0;
	app.lookup("TMVSI_Content_ipb").value = "";
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
	var Suncbx = app.lookup("TMVSI_Sun_cbx");	//일
	var Moncbx = app.lookup("TMVSI_Mon_cbx");	//월
	var Tuecbx = app.lookup("TMVSI_Tue_cbx");	//화
	var Wedcbx = app.lookup("TMVSI_Wed_cbx");	//수
	var Thucbx = app.lookup("TMVSI_Thu_cbx");	//목
	var Fricbx = app.lookup("TMVSI_Fri_cbx");	//금
	var Satcbx = app.lookup("TMVSI_Sat_cbx");	//토
	var Holicbx = app.lookup("TMVSI_Holi_cbx");	//공휴일
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
	var day_set_cmb = app.lookup("TMVSI_day_set_cmb");
	
	var Suncbx = app.lookup("TMVSI_Sun_cbx");	//일
	var Moncbx = app.lookup("TMVSI_Mon_cbx");	//월
	var Tuecbx = app.lookup("TMVSI_Tue_cbx");	//화
	var Wedcbx = app.lookup("TMVSI_Wed_cbx");	//수
	var Thucbx = app.lookup("TMVSI_Thu_cbx");	//목
	var Fricbx = app.lookup("TMVSI_Fri_cbx");	//금
	var Satcbx = app.lookup("TMVSI_Sat_cbx");	//토
	var Holicbx = app.lookup("TMVSI_Holi_cbx");	//공휴일

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
	oem_version = dataManager.getOemVersion();
	
	var hostAppIns = app.getHostAppInstance();
	if (hostAppIns) {
		var AOptStatus = hostAppIns.callAppMethod("getTerminalOptStatus", "AlarmOpt");
		if(AOptStatus == 0) {
			if (hostAppIns.callAppMethod("getTerminalID")) {
				var tID = hostAppIns.callAppMethod("getTerminalID");
				var requestData = app.lookup("sms_get_terminal_option_alarm");
				requestData.action = requestData.action + tID + "/option/alarm";
				hostAppIns.callAppMethod("parentShowLoadMask", "Str_Siren");
				requestData.send();
			}
		} else {
			var getAopt = hostAppIns.callAppMethod("getAlarmOption");
			var AOptinfo = app.lookup("AlarmOptionList");
			getAopt.copyToDataSet(AOptinfo);
			app.lookup("TMVSI_grd").redraw();
		}
		
	}
}

function onTMVSI_day_set_cmbSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var tMVSI_day_set_cmb = e.control;
	cbkSettingdaysetSelected(tMVSI_day_set_cmb.value);
}

function onTMVSI_btnAddClick(/* cpr.events.CMouseEvent */ e){
	var tMVSI_btnAdd = e.control;
	var getHH = app.lookup("TMVSI_HH_nbe");
	var getmm = app.lookup("TMVSI_mm_nbe");
	var existflag = Alarmtimercheck(getHH.value, getmm.value);
	if(existflag == 1) {
		if(dataManager.getOemVersion() == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH){
			dialogAlertAMHQ(app, dataManager.getString("Str_Fail"), dataManager.getString("Str_ErrorSameAlarm"));	
		} else{
			dialogAlert(app, dataManager.getString("Str_Fail"), dataManager.getString("Str_ErrorSameAlarm"));	
		}
		return;
	}
	
	var Aldataset= app.lookup("AlarmOptionList");
	var newRowData = {
		"Hour": Number(getHH.value), 
		"Minute": Number(getmm.value), 
		"Duration": Number(app.lookup("TMVSI_duration_nbe").value),
		"Sunday": Number(app.lookup("TMVSI_Sun_cbx").value),
		"Monday": Number(app.lookup("TMVSI_Mon_cbx").value),
		"Tuesday": Number(app.lookup("TMVSI_Tue_cbx").value),
		"Wednesday": Number(app.lookup("TMVSI_Wed_cbx").value),
		"Thursday": Number(app.lookup("TMVSI_Thu_cbx").value),
		"Friday": Number(app.lookup("TMVSI_Fri_cbx").value),
		"Saturday": Number(app.lookup("TMVSI_Sat_cbx").value),
		"Holiday": Number(app.lookup("TMVSI_Holi_cbx").value),
		"Contents": app.lookup("TMVSI_Content_ipb").value,
		"Reserved1":0, "Reserved2":0,"Reserved3":0,"Reserved4":0
	};
	
	Aldataset.addRowData(newRowData);
	app.lookup("TMVSI_grd").redraw();
	
	InitSetInputData();
	SyncOptSirenWithVinfoFrame();
	
	if (oem_version == OEM_VICTORYARCH){
		app.getHostAppInstance().callAppMethod("setModifiedList", 3);
	}
}

function onTMVSI_grdSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var tMVSI_grd = e.control;
	var selectedRow = tMVSI_grd.getSelectedRow();
	var getRowdata = selectedRow.getRowData();
	app.lookup("TMVSI_HH_nbe").value = getRowdata["Hour"];
	app.lookup("TMVSI_mm_nbe").value = getRowdata["Minute"];
	app.lookup("TMVSI_duration_nbe").value = getRowdata["Duration"];
	app.lookup("TMVSI_Sun_cbx").value = getRowdata["Sunday"];
	app.lookup("TMVSI_Mon_cbx").value = getRowdata["Monday"];
	app.lookup("TMVSI_Tue_cbx").value = getRowdata["Tuesday"];
	app.lookup("TMVSI_Wed_cbx").value = getRowdata["Wednesday"];
	app.lookup("TMVSI_Thu_cbx").value = getRowdata["Thursday"];
	app.lookup("TMVSI_Fri_cbx").value = getRowdata["Friday"];
	app.lookup("TMVSI_Sat_cbx").value = getRowdata["Saturday"];
	app.lookup("TMVSI_Holi_cbx").value = getRowdata["Holiday"];
	app.lookup("TMVSI_Content_ipb").value = getRowdata["Contents"];
	checkCbxSettingDay()
}

function onTMVSI_btnModiClick(/* cpr.events.CMouseEvent */ e){
	var tMVSI_btnModi = e.control;
	var grid = app.lookup("TMVSI_grd");
	var SelectedRow = grid.getSelectedRow();	
	if ( SelectedRow != null) {
		grid.updateRow(SelectedRow.getIndex(), 
		{
			"Hour": app.lookup("TMVSI_HH_nbe").value,
			"Minute": app.lookup("TMVSI_mm_nbe").value,
			"Duration": app.lookup("TMVSI_duration_nbe").value,
			"Sunday": app.lookup("TMVSI_Sun_cbx").value,
			"Monday": app.lookup("TMVSI_Mon_cbx").value,
			"Tuesday": app.lookup("TMVSI_Tue_cbx").value,
			"Wednesday": app.lookup("TMVSI_Wed_cbx").value,
			"Thursday": app.lookup("TMVSI_Thu_cbx").value,
			"Friday": app.lookup("TMVSI_Fri_cbx").value,
			"Saturday": app.lookup("TMVSI_Sat_cbx").value,
			"Holiday": app.lookup("TMVSI_Holi_cbx").value,
			"Contents": app.lookup("TMVSI_Content_ipb").value,
			"Reserved1":0, "Reserved2":0, "Reserved3":0, "Reserved4":0
		});
	} else {
		if(dataManager.getOemVersion() == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH){
			dialogAlertAMHQ(app, dataManager.getString("Str_Info"), dataManager.getString("Str_NoSelectedItem"));
		} else{
			dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_NoSelectedItem"));
		}
		return;
	}
	
	checkCbxSettingDay()
	SyncOptSirenWithVinfoFrame();
	
	if (oem_version == OEM_VICTORYARCH){
		app.getHostAppInstance().callAppMethod("setModifiedList",3);
	}
	
}

function onTMVSI_btnDelClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var tMVSI_btnDel = e.control;
	var grid = app.lookup("TMVSI_grd");
	var SelectedRow = grid.getSelectedRow();	
	if (SelectedRow == null){
		if(dataManager.getOemVersion() == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH){
			dialogAlertAMHQ(app, dataManager.getString("Str_Info"), dataManager.getString("Str_NoSelectedItem"));
		} else{
			dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_NoSelectedItem"));
		}
		return;
	} else {
		var selIdx = SelectedRow.getIndex();
		grid.deleteRow(selIdx);
	}
	
	SyncOptSirenWithVinfoFrame();
	
	if (oem_version == OEM_VICTORYARCH){
		app.getHostAppInstance().callAppMethod("setModifiedList",3);
	}
}


function onSms_get_terminal_option_alarmSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var hostAppIns = app.getHostAppInstance();
	hostAppIns.callAppMethod("parentHideLoadMask","");
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == 0) {
		var AOptStatus = hostAppIns.callAppMethod("initTerminalOptStatus", "AlarmOpt"); 
		var AList = app.lookup("AlarmOptionList");
		var res = hostAppIns.callAppMethod("setAlarmOption", AList); 
		app.lookup("TMVSI_grd").redraw();			
	} else {
		if(dataManager.getOemVersion() == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH){
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalSirenInfoGet") + " " + dataManager.getString("Str_Failed") + " : " + dataManager.getString(getErrorString(resultCode)));						
		} else{
			//dialogAlert(app, "Waning", dataManager.getString("Str_TerminalSirenInfoGet")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalSirenInfoGet") + " " + dataManager.getString("Str_Failed") + " : " + dataManager.getString(getErrorString(resultCode)));			
		}
	}
}

function onSms_get_terminal_option_alarmSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR);		
}

function onSms_get_terminal_option_alarmSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}