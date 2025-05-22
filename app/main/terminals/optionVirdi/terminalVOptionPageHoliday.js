/************************************************
 * terminalVOptionPageHoliday.js
 * Created at 2018. 12. 5. 오전 10:50:52.
 *
 * @author joymrk
 ************************************************/
var comLib;			
var dataManager = cpr.core.Module.require("lib/DataManager");
var oem_version;
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	oem_version = dataManager.getOemVersion();
	
	if (oem_version == OEM_HYUNDAI_MSEAT){
		var cbxHoliday = app.lookup("TMHOL_cbx_HolidayRel");
		cbxHoliday.visible =true;
	}
	
	var hostAppIns = app.getHostAppInstance();
	if (hostAppIns) {
		var hOptStatus = hostAppIns.callAppMethod("getTerminalOptStatus", "HolidayOpt");
		if(hOptStatus == 0) {
			if (hostAppIns.callAppMethod("getTerminalID")) {
				var tID = hostAppIns.callAppMethod("getTerminalID");
				var requestData = app.lookup("sms_get_terminal_option_holiday");
				requestData.action = requestData.action + tID + "/option/holiday";
				hostAppIns.callAppMethod("parentShowLoadMask", "Str_Holidays2");
				requestData.send();
			}			
		} else {
			var getHopt = hostAppIns.callAppMethod("getHolidayOption");
			var getThopt = hostAppIns.callAppMethod("getTimezoneHolidayOption");
			var getTerminalHolidayID = hostAppIns.callAppMethod("getTerminalHolidayID");
			var HOptinfo = app.lookup("HolidayOptionList");
			var ThOptinfo = app.lookup("TimezoneHolidays");
			var TerminalHolidayID = app.lookup("TerminalHolidayID");
			
			getHopt.copyToDataSet(HOptinfo);
			getThopt.copyToDataSet(ThOptinfo);
			getTerminalHolidayID.copyToDataMap(TerminalHolidayID);
			app.lookup("TMHOL_grp").redraw();
		}
	}
}

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onTMHOL_holidayID_cmbSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var tMHOL_holidayID_cmb = e.control;
	var holidayID = app.lookup("TMHOL_holidayID_cmb").value
	if(holidayID == 0) {
		// 미지정 : 공휴일 초기화
		var holidayworkInfo = app.lookup("HolidayOptionList");
		var TimezoneHoliday = app.lookup("TimezoneHolidays");
		var TerminalHolidayID = app.lookup("TerminalHolidayID");
		
		holidayworkInfo.clear();
		TerminalHolidayID.clear();
		
		app.getHostAppInstance().callAppMethod("modifyTerminalOptStatus", "HolidayOpt");
		app.getHostAppInstance().callAppMethod("setHolidayOption", [holidayworkInfo, TimezoneHoliday,TerminalHolidayID]);
		//dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_TerminalSaveFail"));
		return;
	}
	var requestData = app.lookup("sms_get_terminal_option_Timezoneholiday");
	requestData.action = "/v1/terminals/" + holidayID + "/option/holiday/timezone";

	console.log(requestData.action);
	requestData.send();
	
	if (oem_version == OEM_VICTORYARCH){
		app.getHostAppInstance().callAppMethod("setModifiedList", 2);
	}
}

function onSms_get_terminal_option_holidaySubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var hostAppIns = app.getHostAppInstance();
	hostAppIns.callAppMethod("parentHideLoadMask","");
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode== COMERROR_NONE) {
		var hOptStatus = hostAppIns.callAppMethod("initTerminalOptStatus", "HolidayOpt"); 
		var holidayworkInfo = app.lookup("HolidayOptionList");
		var TimezoneHoliday = app.lookup("TimezoneHolidays");
		var TerminalHolidayID = app.lookup("TerminalHolidayID");
		var res = hostAppIns.callAppMethod("setHolidayOption", [holidayworkInfo, TimezoneHoliday,TerminalHolidayID]);
		
		app.lookup("TMHOL_holidayID_cmb").redraw();
	} else {
		if(dataManager.getOemVersion() == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH){
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalHolidayInfoGet") + " " + dataManager.getString("Str_Failed") + " : " + dataManager.getString(getErrorString(resultCode)));						
		} else{
			//dialogAlert(app, "Waning", dataManager.getString("Str_TerminalHolidayInfoGet")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalHolidayInfoGet") + " " + dataManager.getString("Str_Failed") + " : " + dataManager.getString(getErrorString(resultCode)));			
		}
	}
}

function onSms_get_terminal_option_holidaySubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_ERROR );	
}

function onSms_get_terminal_option_holidaySubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onSms_get_terminal_option_TimezoneholidaySubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var hostAppIns = app.getHostAppInstance();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if(resultCode == 0) {
		var hOptStatus = hostAppIns.callAppMethod("modifyTerminalOptStatus", "HolidayOpt");
		console.log("HolidayOpt Status update ["+ hOptStatus+ "]");
		var holidayworkInfo = app.lookup("HolidayOptionList");
		//console.log(holidayworkInfo.getRowDataRanged());
		var TimezoneHoliday = app.lookup("TimezoneHolidays");
		//console.log(TimezoneHoliday.getRowDataRanged());
		var TerminalHolidayID = app.lookup("TerminalHolidayID");
		var res = hostAppIns.callAppMethod("setHolidayOption", [holidayworkInfo, TimezoneHoliday,TerminalHolidayID]);
	} else {
		if(dataManager.getOemVersion() == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH){
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TimezoneHolidayListGet") + " " + dataManager.getString("Str_Failed") + " : " + dataManager.getString(getErrorString(resultCode)));						
		} else{
			//dialogAlert(app, "Waning", dataManager.getString("Str_TimezoneHolidayListGet")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TimezoneHolidayListGet")+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
		}
	}
	app.lookup("TMHOL_grd").redraw();
	
}

function onSms_get_terminal_option_TimezoneholidaySubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_ERROR );	
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_get_terminal_option_TimezoneholidaySubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * 체크 박스에서 value-change 이벤트 발생 시 호출.
 * CheckBox의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onTMHOL_cbx_HolidayRelValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.CheckBox
	 */
	var tMHOL_cbx_HolidayRel = e.control;
	var hostAppIns = app.getHostAppInstance();// 초기화를 위해서
	var holidayworkInfo = app.lookup("HolidayOptionList");// 초기빈값을 알아야 하므로 아래
	holidayworkInfo.clear();// 초기화
	for (var i=0;i< 100;i++) {
		holidayworkInfo.addRowData({"Month":0, "Day":0, "Type":0});
	}
	holidayworkInfo.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	
	var hOptStatus = hostAppIns.callAppMethod("modifyTerminalOptStatus", "HolidayOpt");
	var TimezoneHoliday = app.lookup("TimezoneHolidays");
	var res = hostAppIns.callAppMethod("setHolidayOption", [holidayworkInfo, TimezoneHoliday]); 
	//var res = hostAppIns.callAppMethod("setHolidayOption", [holidayworkInfo, TimezoneHoliday]); 
}
