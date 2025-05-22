/************************************************
 * terminalMCPPageHoliday.js
 * Created at 2020. 8. 7. 오후 4:52:28.
 *
 * @author union
 ************************************************/

var comLib;			
var dataManager = cpr.core.Module.require("lib/DataManager");


var curTerminalID = 40;

var jsonContent = null;


exports.requestSaveData = function() {
	
	console.log("MCP Holiday requestSaveData");
	
	var smsPutAcuTerminalHolidayOption = app.lookup("smsPutAcuTerminalHolidayOption");
	smsPutAcuTerminalHolidayOption.action = "/v1/acus/" +curTerminalID.toString() + "/option/holiday";	
	
	smsPutAcuTerminalHolidayOption.setRequestObject(jsonContent.MsgTerminalHolidayOption);
	smsPutAcuTerminalHolidayOption.send();			
}



/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();

	var initValue = app.getHost().initValue;
	


	var hostApp = app.getHostAppInstance();
	curTerminalID = hostApp.callAppMethod("getCurTerminalID");	

	
	
	var cmbType = app.lookup("cmbType");
	for(var i=1;i<4;i++)
	{
		cmbType.addItem(new cpr.controls.Item(( i ).toString(),i.toString()));
	}
	//cmbType.selectItem(0);
	cmbType.value = "1";
	
	var smsGetAcuTerminalHolidayOption = app.lookup("smsGetAcuTerminalHolidayOption");
	smsGetAcuTerminalHolidayOption.action = "/v1/acus/" + curTerminalID.toString() + "/option/holiday";	
	smsGetAcuTerminalHolidayOption.send();			



}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetAcuTerminalHolidayOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetAcuTerminalHolidayOption = e.control;
	
	console.log( "onSmsGetAcuTerminalHolidayOptionSubmitDone");
	
	jsonContent = JSON.parse(smsGetAcuTerminalHolidayOption.xhr.responseText);
	
	console.log("ResultCode: " + jsonContent.Result.ResultCode);
	
	console.log("MsgTerminalHolidayOption:" + jsonContent.MsgTerminalHolidayOption);
	
	
	var dsHolidays = app.lookup("dsHolidays");
	dsHolidays.clear();
	for(var ii=0;ii<jsonContent.MsgTerminalHolidayOption.Holidays.length;ii++) 
	{
		var Holiday = jsonContent.MsgTerminalHolidayOption.Holidays[ii];
		var row = dsHolidays.addRow();
		
		if(0 == Holiday.Month || 0 == Holiday.Day || 0 == Holiday.Type)
		{
			row.setValue("Number", ii + 1);
			row.setValue("Date", "");
			row.setValue("Type", "");				
		}
		else 
		{
			row.setValue("Number", ii + 1);
			row.setValue("Date", Holiday.Month.toString() + "/" + Holiday.Day.toString());
			row.setValue("Type", Holiday.Type.toString());			
		}
	}
	
	var grdHoliday = app.lookup("grdHoliday");
	grdHoliday.redraw();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsPutAcuTerminalHolidayOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsPutAcuTerminalHolidayOption = e.control;
	
	console.log("onSmsPutAcuTerminalHolidayOptionSubmitDone");
	
	
	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("hideLoadMask");	
	
	
}



/*
 * 버튼(btnApply)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnApplyClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnApply = e.control;
	
	var smsPutAcuTerminalHolidayOption = app.lookup("smsPutAcuTerminalHolidayOption");
	smsPutAcuTerminalHolidayOption.action = "/v1/acus/" +curTerminalID.toString() + "/option/holiday";	
	
	smsPutAcuTerminalHolidayOption.setRequestObject(jsonContent.MsgTerminalHolidayOption);
	smsPutAcuTerminalHolidayOption.send();		
	
}


/*
 * 버튼(btnDelete)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnDeleteClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnDelete = e.control;
	
	var selectedIndex = -1;
	
	var calendar = app.lookup("calendar");
	var cmbType = app.lookup("cmbType");
	var grdHoliday = app.lookup("grdHoliday");
	
	if(grdHoliday.getSelectedRow() == null)
		return;
	
	selectedIndex = grdHoliday.getSelectedRow().getIndex();
	
	jsonContent.MsgTerminalHolidayOption.Holidays[selectedIndex].Month = 0;
	jsonContent.MsgTerminalHolidayOption.Holidays[selectedIndex].Day = 0;
	jsonContent.MsgTerminalHolidayOption.Holidays[selectedIndex].Type = 0;
	
	var dsHolidays = app.lookup("dsHolidays");
	dsHolidays.setValue(selectedIndex, "Date", "");
	dsHolidays.setValue(selectedIndex, "Type", "");
	
	var grdHoliday = app.lookup("grdHoliday");
	grdHoliday.redraw();			
		
}


/*
 * 버튼(btnAdd)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnAddClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnAdd = e.control;
	
	var selectedIndex = -1;
	
	var calendar = app.lookup("calendar");
	var cmbType = app.lookup("cmbType");
	var grdHoliday = app.lookup("grdHoliday");
	
	if(grdHoliday.getSelectedRow() == null)
		selectedIndex = 0;
	else
		selectedIndex = grdHoliday.getSelectedRow().getIndex();
	
	//console.log("calendar.current.getMonth: " + calendar.current.getMonth());
	//console.log("calendar.current.getDay: " + calendar.current.getDay());
	console.log("cmbType.value: " + cmbType.value);
	console.log("calendar.value: " + calendar.value);
	
	if(calendar.value == null)
	{
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_DateSelectError"));
		return;
	}
	
	//20200924
	
	var year = parseInt(calendar.value.toString().substring(0,4));
	var month = parseInt(calendar.value.toString().substring(4,6));
	var day = parseInt(calendar.value.toString().substring(6,8));
	var type = parseInt(cmbType.value);
	
	console.log("year: " + calendar.value.toString().substring(0,4));
	console.log("month: " + calendar.value.toString().substring(4,6));
	console.log("day: " + calendar.value.toString().substring(6,8));
	console.log("type: " + type);
	
	jsonContent.MsgTerminalHolidayOption.Holidays[selectedIndex].Month = month;
	jsonContent.MsgTerminalHolidayOption.Holidays[selectedIndex].Day = day;
	jsonContent.MsgTerminalHolidayOption.Holidays[selectedIndex].Type = type;
	
	var dsHolidays = app.lookup("dsHolidays");
	dsHolidays.setValue(selectedIndex, "Date", month.toString() + "/" + day.toString());
	dsHolidays.setValue(selectedIndex, "Type", type.toString());
	
	var grdHoliday = app.lookup("grdHoliday");
	grdHoliday.redraw();			
}


