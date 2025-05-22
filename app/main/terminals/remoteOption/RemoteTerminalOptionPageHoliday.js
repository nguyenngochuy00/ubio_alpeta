/************************************************
 * RemoteTerminalOptionHoilday.js
 * Created at 2023. 11. 29. 오후 6:22:23.
 *
 * @author zxc
 ************************************************/

var comLib;			
var dataManager = cpr.core.Module.require("lib/DataManager");
var modifyHolidayflag = 0;	// 공휴일 수정 플래그


function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
//	var terminalType = app.getHost().initValue;
	modifyHolidayflag = 0;
	
	var hostAppIns = app.getHostAppInstance();
	if (hostAppIns) {
		var holiOpt = hostAppIns.callAppMethod("getTerminalHolidays");
		var hOptinfo = app.lookup("TerminalHolidays");
		hOptinfo.clear();
		holiOpt.copyToDataSet(hOptinfo);
		
		var timezoneHoli = hostAppIns.callAppMethod("getTimezoneHolidays");
		var tOptinfo = app.lookup("TimezoneHolidays");
		tOptinfo.clear();
		timezoneHoli.copyToDataSet(tOptinfo);
		
		app.lookup("holigrp").redraw();
	}
}
	

function onHTOPH_hoildayID_cmbSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var hTOPH_hoildayID_cmb = e.control;
	var holidayID = app.lookup("HTOPH_holidayID_cmb").value;
	
	modifyHolidayflag = 1;
	
	if(holidayID == 0) {
		app.lookup("TerminalHolidays").clear();
		return;
	}
	var requestData = app.lookup("sms_get_terminal_option_Timezoneholiday");
	requestData.action = "/v1/terminals/" + holidayID + "/option/holiday/timezone";
	requestData.send();
}

function onSms_get_terminal_option_TimezoneholidaySubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var hostAppIns = app.getHostAppInstance();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if(resultCode == 0) {
		
	} else {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TimezoneHolidayListGet")+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}

	app.lookup("HTOPH_holiday_grd").redraw();
}

function onSms_get_terminal_option_TimezoneholidaySubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_ERROR );	
}

function onSms_get_terminal_option_TimezoneholidaySubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

//<-------------------------------------------------------------------------------

exports.getTerminalDataSet = function() {
	var TerminalHolidayList = app.lookup("TerminalHolidays");
	return TerminalHolidayList;
}

exports.getPageInfo = function() {
	return "Holiday";
}

exports.getModifyFlag = function() {
	return modifyHolidayflag;
}

exports.setModifyFlag = function(flag) {
	modifyHolidayflag = 0;
}

//-------------------------------------------------------------------------------->
