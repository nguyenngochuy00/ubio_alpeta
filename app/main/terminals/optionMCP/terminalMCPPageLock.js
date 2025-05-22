/************************************************
 * terminalMCPPageLock.js
 * Created at 2020. 8. 11. 오전 10:46:36.
 *
 * @author union
 ************************************************/
var comLib;			
var dataManager = cpr.core.Module.require("lib/DataManager");


var curTerminalID = 40;

var jsonContent = null;


exports.requestSaveData = function() {
	
	console.log("MCP PageLock requestSaveData");
	
	var smsPutAcuLockOption = app.lookup("smsPutAcuLockOption");
	smsPutAcuLockOption.action = "/v1/acus/" + curTerminalID.toString() +"/option/lock";	
	
	smsPutAcuLockOption.setRequestObject(jsonContent.MsgTerminalLockOption);
	smsPutAcuLockOption.send();		
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

	
	
	var cmbSelectLock = app.lookup("cmbSelectLock");
	for(var i=0;i<4;i++)
	{
		cmbSelectLock.addItem(new cpr.controls.Item(( i+1).toString(),i.toString()));
	}
	cmbSelectLock.selectItem(0);
	
	
	var cmbSelectApply = app.lookup("cmbSelectApply");
	
	var ii = 0;
	cmbSelectApply.addItem(new cpr.controls.Item(dataManager.getString("Str_All"), ii++));
	cmbSelectApply.addItem(new cpr.controls.Item(dataManager.getString("Str_MonDay") + "~" + dataManager.getString("Str_FriDay"), ii++));
	cmbSelectApply.addItem(new cpr.controls.Item(dataManager.getString("Str_SaturDay") + "~" + dataManager.getString("Str_SunDay"), ii++));
	cmbSelectApply.addItem(new cpr.controls.Item(dataManager.getString("Str_HolidayDivision") + " 1,2,3" , ii++));
	cmbSelectApply.addItem(new cpr.controls.Item(dataManager.getString("Str_SunDay"), ii++));	
	cmbSelectApply.addItem(new cpr.controls.Item(dataManager.getString("Str_MonDay"), ii++));	
	cmbSelectApply.addItem(new cpr.controls.Item(dataManager.getString("Str_TuesDay"), ii++));	
	cmbSelectApply.addItem(new cpr.controls.Item(dataManager.getString("Str_Wednesday"), ii++));	
	cmbSelectApply.addItem(new cpr.controls.Item(dataManager.getString("Str_ThursDay"), ii++));	
	cmbSelectApply.addItem(new cpr.controls.Item(dataManager.getString("Str_FriDay"), ii++));	
	cmbSelectApply.addItem(new cpr.controls.Item(dataManager.getString("Str_SaturDay"), ii++));	
	cmbSelectApply.addItem(new cpr.controls.Item(dataManager.getString("Str_HolidayDivision") + " 1" , ii++));
	cmbSelectApply.addItem(new cpr.controls.Item(dataManager.getString("Str_HolidayDivision") + " 2" , ii++));
	cmbSelectApply.addItem(new cpr.controls.Item(dataManager.getString("Str_HolidayDivision") + " 3" , ii++));			
	cmbSelectApply.selectItem(0);	
	
	
	// Lock Hour Start
	var cmbLockHourStart1 = app.lookup("cmbLockHourStart1");
	for(var i=0;i<24;i++)
	{
		if( i.toString().length == 1 )
			cmbLockHourStart1.addItem(new cpr.controls.Item("0" + i.toString(),i.toString()));
		else
			cmbLockHourStart1.addItem(new cpr.controls.Item(i.toString(),i.toString()));
	}
	cmbLockHourStart1.addItem(new cpr.controls.Item("-", 255));
	cmbLockHourStart1.selectItem(0);	
	
	var cmbLockHourStart2 = app.lookup("cmbLockHourStart2");
	for(var i=0;i<24;i++)
	{
		if( i.toString().length == 1 )
			cmbLockHourStart2.addItem(new cpr.controls.Item("0" + i.toString(),i.toString()));
		else		
			cmbLockHourStart2.addItem(new cpr.controls.Item(i.toString(),i.toString()));
	}
	cmbLockHourStart2.addItem(new cpr.controls.Item("-", 255));
	cmbLockHourStart2.selectItem(0);	
		
	var cmbLockHourStart3 = app.lookup("cmbLockHourStart3");
	for(var i=0;i<24;i++)
	{
		if( i.toString().length == 1 )
			cmbLockHourStart3.addItem(new cpr.controls.Item("0" + i.toString(),i.toString()));
		else		
			cmbLockHourStart3.addItem(new cpr.controls.Item(i.toString(),i.toString()));		
	}
	cmbLockHourStart3.addItem(new cpr.controls.Item("-", 255));
	cmbLockHourStart3.selectItem(0);		


	
	// Lock Minute Start
	var cmbLockMinuteStart1 = app.lookup("cmbLockMinuteStart1");
	for(var i=0;i<60;i++)
	{
		if( i.toString().length == 1 )
			cmbLockMinuteStart1.addItem(new cpr.controls.Item("0" + i.toString(),i.toString()));
		else		
			cmbLockMinuteStart1.addItem(new cpr.controls.Item(i.toString(),i.toString()));	
		
		
	}
	cmbLockMinuteStart1.addItem(new cpr.controls.Item("-", 255));
	cmbLockMinuteStart1.selectItem(0);	
	
	var cmbLockMinuteStart2 = app.lookup("cmbLockMinuteStart2");
	for(var i=0;i<60;i++)
	{
		if( i.toString().length == 1 )
			cmbLockMinuteStart2.addItem(new cpr.controls.Item("0" + i.toString(),i.toString()));
		else		
			cmbLockMinuteStart2.addItem(new cpr.controls.Item(i.toString(),i.toString()));	
	
	}
	cmbLockMinuteStart2.addItem(new cpr.controls.Item("-", 255));
	cmbLockMinuteStart2.selectItem(0);	
		
	var cmbLockMinuteStart3 = app.lookup("cmbLockMinuteStart3");
	for(var i=0;i<60;i++)
	{
		if( i.toString().length == 1 )
			cmbLockMinuteStart3.addItem(new cpr.controls.Item("0" + i.toString(),i.toString()));
		else		
			cmbLockMinuteStart3.addItem(new cpr.controls.Item(i.toString(),i.toString()));	
		
	}
	cmbLockMinuteStart3.addItem(new cpr.controls.Item("-", 255));
	cmbLockMinuteStart3.selectItem(0);		



	// Lock Hour End
	var cmbLockHourEnd1 = app.lookup("cmbLockHourEnd1");
	for(var i=0;i<24;i++)
	{
		if( i.toString().length == 1 )
			cmbLockHourEnd1.addItem(new cpr.controls.Item("0" + i.toString(),i.toString()));
		else		
			cmbLockHourEnd1.addItem(new cpr.controls.Item(i.toString(),i.toString()));			
	}
	cmbLockHourEnd1.addItem(new cpr.controls.Item("-", 255));
	cmbLockHourEnd1.selectItem(0);	
	
	var cmbLockHourEnd2 = app.lookup("cmbLockHourEnd2");
	for(var i=0;i<24;i++)
	{
		if( i.toString().length == 1 )
			cmbLockHourEnd2.addItem(new cpr.controls.Item("0" + i.toString(),i.toString()));
		else		
			cmbLockHourEnd2.addItem(new cpr.controls.Item(i.toString(),i.toString()));			
	}
	cmbLockHourEnd2.addItem(new cpr.controls.Item("-", 255));
	cmbLockHourEnd2.selectItem(0);	
		
	var cmbLockHourEnd3 = app.lookup("cmbLockHourEnd3");
	for(var i=0;i<24;i++)
	{
		
		if( i.toString().length == 1 )
			cmbLockHourEnd3.addItem(new cpr.controls.Item("0" + i.toString(),i.toString()));
		else		
			cmbLockHourEnd3.addItem(new cpr.controls.Item(i.toString(),i.toString()));			
		
	}
	cmbLockHourEnd3.addItem(new cpr.controls.Item("-", 255));
	cmbLockHourEnd3.selectItem(0);	

	// Lock Minute End
	var cmbLockMinuteEnd1 = app.lookup("cmbLockMinuteEnd1");
	for(var i=0;i<60;i++)
	{
		if( i.toString().length == 1 )
			cmbLockMinuteEnd1.addItem(new cpr.controls.Item("0" + i.toString(),i.toString()));
		else		
			cmbLockMinuteEnd1.addItem(new cpr.controls.Item(i.toString(),i.toString()));			
	}
	cmbLockMinuteEnd1.addItem(new cpr.controls.Item("-", 255));
	cmbLockMinuteEnd1.selectItem(0);	
	
	var cmbLockMinuteEnd2 = app.lookup("cmbLockMinuteEnd2");
	for(var i=0;i<60;i++)
	{
		if( i.toString().length == 1 )
			cmbLockMinuteEnd2.addItem(new cpr.controls.Item("0" + i.toString(),i.toString()));
		else		
			cmbLockMinuteEnd2.addItem(new cpr.controls.Item(i.toString(),i.toString()));			
	}
	cmbLockMinuteEnd2.addItem(new cpr.controls.Item("-", 255));
	cmbLockMinuteEnd2.selectItem(0);	
		
	var cmbLockMinuteEnd3 = app.lookup("cmbLockMinuteEnd3");
	for(var i=0;i<60;i++)
	{
		if( i.toString().length == 1 )
			cmbLockMinuteEnd3.addItem(new cpr.controls.Item("0" + i.toString(),i.toString()));
		else		
			cmbLockMinuteEnd3.addItem(new cpr.controls.Item(i.toString(),i.toString()));			
		
	}
	cmbLockMinuteEnd3.addItem(new cpr.controls.Item("-", 255));
	cmbLockMinuteEnd3.selectItem(0);	








	// O Hour Start
	var cmbOpenHourStart1 = app.lookup("cmbOpenHourStart1");
	for(var i=0;i<24;i++)
	{
		if( i.toString().length == 1 )
			cmbOpenHourStart1.addItem(new cpr.controls.Item("0" + i.toString(),i.toString()));
		else		
			cmbOpenHourStart1.addItem(new cpr.controls.Item(i.toString(),i.toString()));		
	}
	cmbOpenHourStart1.addItem(new cpr.controls.Item("-", 255));
	cmbOpenHourStart1.selectItem(0);	
	
	var cmbOpenHourStart2 = app.lookup("cmbOpenHourStart2");
	for(var i=0;i<24;i++)
	{
		if( i.toString().length == 1 )
			cmbOpenHourStart2.addItem(new cpr.controls.Item("0" + i.toString(),i.toString()));
		else		
			cmbOpenHourStart2.addItem(new cpr.controls.Item(i.toString(),i.toString()));		
	}
	cmbOpenHourStart2.addItem(new cpr.controls.Item("-", 255));
	cmbOpenHourStart2.selectItem(0);	
		
	var cmbOpenHourStart3 = app.lookup("cmbOpenHourStart3");
	for(var i=0;i<24;i++)
	{
		if( i.toString().length == 1 )
			cmbOpenHourStart3.addItem(new cpr.controls.Item("0" + i.toString(),i.toString()));
		else		
			cmbOpenHourStart3.addItem(new cpr.controls.Item(i.toString(),i.toString()));			
	}
	cmbOpenHourStart3.addItem(new cpr.controls.Item("-", 255));
	cmbOpenHourStart3.selectItem(0);		


	
	// Open Minute Start
	var cmbOpenMinuteStart1 = app.lookup("cmbOpenMinuteStart1");
	for(var i=0;i<60;i++)
	{
		if( i.toString().length == 1 )
			cmbOpenMinuteStart1.addItem(new cpr.controls.Item("0" + i.toString(),i.toString()));
		else		
			cmbOpenMinuteStart1.addItem(new cpr.controls.Item(i.toString(),i.toString()));		
		
	}
	cmbOpenMinuteStart1.addItem(new cpr.controls.Item("-", 255));
	cmbOpenMinuteStart1.selectItem(0);	
	
	var cmbOpenMinuteStart2 = app.lookup("cmbOpenMinuteStart2");
	for(var i=0;i<60;i++)
	{
		if( i.toString().length == 1 )
			cmbOpenMinuteStart2.addItem(new cpr.controls.Item("0" + i.toString(),i.toString()));
		else		
			cmbOpenMinuteStart2.addItem(new cpr.controls.Item(i.toString(),i.toString()));		
				
	}
	cmbOpenMinuteStart2.addItem(new cpr.controls.Item("-", 255));
	cmbOpenMinuteStart2.selectItem(0);	
		
	var cmbOpenMinuteStart3 = app.lookup("cmbOpenMinuteStart3");
	for(var i=0;i<60;i++)
	{
		
		if( i.toString().length == 1 )
			cmbOpenMinuteStart3.addItem(new cpr.controls.Item("0" + i.toString(),i.toString()));
		else		
			cmbOpenMinuteStart3.addItem(new cpr.controls.Item(i.toString(),i.toString()));		
						
	}
	cmbOpenMinuteStart3.addItem(new cpr.controls.Item("-", 255));
	cmbOpenMinuteStart3.selectItem(0);		



	// Open Hour End
	var cmbOpenHourEnd1 = app.lookup("cmbOpenHourEnd1");
	for(var i=0;i<24;i++)
	{
	
		if( i.toString().length == 1 )
			cmbOpenHourEnd1.addItem(new cpr.controls.Item("0" + i.toString(),i.toString()));
		else		
			cmbOpenHourEnd1.addItem(new cpr.controls.Item(i.toString(),i.toString()));			
		
	}
	cmbOpenHourEnd1.addItem(new cpr.controls.Item("-", 255));
	cmbOpenHourEnd1.selectItem(0);	
	
	var cmbOpenHourEnd2 = app.lookup("cmbOpenHourEnd2");
	for(var i=0;i<24;i++)
	{
	
		if( i.toString().length == 1 )
			cmbOpenHourEnd2.addItem(new cpr.controls.Item("0" + i.toString(),i.toString()));
		else		
			cmbOpenHourEnd2.addItem(new cpr.controls.Item(i.toString(),i.toString()));			
				
	}
	cmbOpenHourEnd2.addItem(new cpr.controls.Item("-", 255));
	cmbOpenHourEnd2.selectItem(0);	
		
	var cmbOpenHourEnd3 = app.lookup("cmbOpenHourEnd3");
	for(var i=0;i<24;i++)
	{

		if( i.toString().length == 1 )
			cmbOpenHourEnd3.addItem(new cpr.controls.Item("0" + i.toString(),i.toString()));
		else		
			cmbOpenHourEnd3.addItem(new cpr.controls.Item(i.toString(),i.toString()));			
					
	}
	cmbOpenHourEnd3.addItem(new cpr.controls.Item("-", 255));
	cmbOpenHourEnd3.selectItem(0);	

	// Open Minute End
	var cmbOpenMinuteEnd1 = app.lookup("cmbOpenMinuteEnd1");
	for(var i=0;i<60;i++)
	{

		if( i.toString().length == 1 )
			cmbOpenMinuteEnd1.addItem(new cpr.controls.Item("0" + i.toString(),i.toString()));
		else		
			cmbOpenMinuteEnd1.addItem(new cpr.controls.Item(i.toString(),i.toString()));		
		
	}
	cmbOpenMinuteEnd1.addItem(new cpr.controls.Item("-", 255));
	cmbOpenMinuteEnd1.selectItem(0);	
	
	var cmbOpenMinuteEnd2 = app.lookup("cmbOpenMinuteEnd2");
	for(var i=0;i<60;i++)
	{
		if( i.toString().length == 1 )
			cmbOpenMinuteEnd2.addItem(new cpr.controls.Item("0" + i.toString(),i.toString()));
		else		
			cmbOpenMinuteEnd2.addItem(new cpr.controls.Item(i.toString(),i.toString()));		
				
	}
	cmbOpenMinuteEnd2.addItem(new cpr.controls.Item("-", 255));
	cmbOpenMinuteEnd2.selectItem(0);	
		
	var cmbOpenMinuteEnd3 = app.lookup("cmbOpenMinuteEnd3");
	for(var i=0;i<60;i++)
	{
		if( i.toString().length == 1 )
			cmbOpenMinuteEnd3.addItem(new cpr.controls.Item("0" + i.toString(),i.toString()));
		else		
			cmbOpenMinuteEnd3.addItem(new cpr.controls.Item(i.toString(),i.toString()));		
					
	}
	cmbOpenMinuteEnd3.addItem(new cpr.controls.Item("-", 255));
	cmbOpenMinuteEnd3.selectItem(0);	



	
	var dsLockSchedule = app.lookup("dsLockSchedule");
	var row = dsLockSchedule.addRow();
	row.setValue("Week", dataManager.getString("Str_SunDay"));
	row.setValue("Lock1","");
	row.setValue("Lock2","");
	row.setValue("Lock3","");
	row.setValue("Open1","");
	row.setValue("Open2","");
	row.setValue("Open3","");	
	
	row = dsLockSchedule.addRow();
	row.setValue("Week", dataManager.getString("Str_MonDay"));
	row.setValue("Lock1","");
	row.setValue("Lock2","");
	row.setValue("Lock3","");
	row.setValue("Open1","");
	row.setValue("Open2","");
	row.setValue("Open3","");	
	
	row = dsLockSchedule.addRow();
	row.setValue("Week", dataManager.getString("Str_TuesDay"));
	row.setValue("Lock1","");
	row.setValue("Lock2","");
	row.setValue("Lock3","");
	row.setValue("Open1","");
	row.setValue("Open2","");
	row.setValue("Open3","");	
	
	row = dsLockSchedule.addRow();
	row.setValue("Week", dataManager.getString("Str_Wednesday"));
	row.setValue("Lock1","");
	row.setValue("Lock2","");
	row.setValue("Lock3","");
	row.setValue("Open1","");
	row.setValue("Open2","");
	row.setValue("Open3","");	
	
	row = dsLockSchedule.addRow();
	row.setValue("Week", dataManager.getString("Str_ThursDay" ));
	row.setValue("Lock1","");
	row.setValue("Lock2","");
	row.setValue("Lock3","");
	row.setValue("Open1","");
	row.setValue("Open2","");
	row.setValue("Open3","");	
	
	row = dsLockSchedule.addRow();
	row.setValue("Week", dataManager.getString("Str_FriDay" ));
	row.setValue("Lock1","");
	row.setValue("Lock2","");
	row.setValue("Lock3","");
	row.setValue("Open1","");
	row.setValue("Open2","");
	row.setValue("Open3","");	
	
	row = dsLockSchedule.addRow();
	row.setValue("Week", dataManager.getString("Str_SaturDay" ));
	row.setValue("Lock1","");
	row.setValue("Lock2","");
	row.setValue("Lock3","");
	row.setValue("Open1","");
	row.setValue("Open2","");
	row.setValue("Open3","");	
				
	row = dsLockSchedule.addRow();
	row.setValue("Week", dataManager.getString("Str_Holiday3" ));
	row.setValue("Lock1","");
	row.setValue("Lock2","");
	row.setValue("Lock3","");
	row.setValue("Open1","");
	row.setValue("Open2","");
	row.setValue("Open3","");	
				
	row = dsLockSchedule.addRow();
	row.setValue("Week", dataManager.getString("Str_Holiday4" ));
	row.setValue("Lock1","");
	row.setValue("Lock2","");
	row.setValue("Lock3","");
	row.setValue("Open1","");
	row.setValue("Open2","");
	row.setValue("Open3","");	
				
	row = dsLockSchedule.addRow();
	row.setValue("Week", dataManager.getString("Str_Holiday5" ));
	row.setValue("Lock1","");
	row.setValue("Lock2","");
	row.setValue("Lock3","");
	row.setValue("Open1","");
	row.setValue("Open2","");
	row.setValue("Open3","");	
												
	var grdLockSchedule = app.lookup("grdLockSchedule");
	grdLockSchedule.redraw();	
	
	



	var smsGetAcuLockOption = app.lookup("smsGetAcuLockOption");
	smsGetAcuLockOption.action = "/v1/acus/"+ curTerminalID.toString() + "/option/lock";	
	smsGetAcuLockOption.send();	
	
		

}


function AcuLockOptionJsonData_To_Screen(LockIndex, DaysIndex) {
	
	if(null == jsonContent)
		return;
		
	/*
		
	console.log( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock1.StartHour );
	console.log( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock1.StartMinute);
	console.log( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock1.EndHour);
	console.log( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock1.EndMinute);
	
	console.log( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock2.StartHour);
	console.log( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock2.StartMinute);
	console.log( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock2.EndHour);
	console.log( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock2.EndMinute);
		
	console.log( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock3.StartHour);
	console.log( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock3.StartMinute);
	console.log( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock3.EndHour);
	console.log( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock3.EndMinute);
			
		
	console.log( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open1.StartHour);
	console.log( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open1.StartMinute);
	console.log( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open1.EndHour);
	console.log( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open1.EndMinute);
	
	console.log( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open2.StartHour);
	console.log( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open2.StartMinute);
	console.log( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open2.EndHour);
	console.log( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open2.EndMinute);
		
	console.log( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open3.StartHour);
	console.log( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open3.StartMinute);
	console.log( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open3.EndHour);
	console.log( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open3.EndMinute);
	*/
				
				
	if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock1.StartHour > 24)
		jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock1.StartHour = 255;			
			
	if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock2.StartHour > 24)
		jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock2.StartHour = 255;			
						
	if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock3.StartHour > 24)
		jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock3.StartHour = 255;			
									
	if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock1.EndMinute > 59)
		jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock1.EndMinute = 255;			
			
	if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock2.EndMinute > 59)
		jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock2.EndMinute = 255;			
						
	if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock3.EndMinute > 59)
		jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock3.EndMinute = 255;			
									
				
				
	if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open1.StartHour > 24)
		jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open1.StartHour = 255;			
			
	if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open2.StartHour > 24)
		jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open2.StartHour = 255;			
						
	if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open3.StartHour > 24)
		jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open3.StartHour = 255;			
									
	if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open1.EndMinute > 59)
		jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open1.EndMinute = 255;			
			
	if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open2.EndMinute > 59)
		jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open2.EndMinute = 255;			
						
	if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open3.EndMinute > 59)
		jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open3.EndMinute = 255;			
									
				
				
		
						
					
	
	var cmbLockHourStart1 = app.lookup("cmbLockHourStart1");
	var cmbLockHourStart2 = app.lookup("cmbLockHourStart2");
	var cmbLockHourStart3 = app.lookup("cmbLockHourStart3");
	
	var cmbLockHourEnd1 = app.lookup("cmbLockHourEnd1");
	var cmbLockHourEnd2 = app.lookup("cmbLockHourEnd2");
	var cmbLockHourEnd3 = app.lookup("cmbLockHourEnd3");
	
	var cmbLockMinuteStart1 = app.lookup("cmbLockMinuteStart1");
	var cmbLockMinuteStart2 = app.lookup("cmbLockMinuteStart2");
	var cmbLockMinuteStart3 = app.lookup("cmbLockMinuteStart3");
	
	var cmbLockMinuteEnd1 = app.lookup("cmbLockMinuteEnd1");
	var cmbLockMinuteEnd2 = app.lookup("cmbLockMinuteEnd2");
	var cmbLockMinuteEnd3 = app.lookup("cmbLockMinuteEnd3");
		
	
	

	var cmbOpenHourStart1 = app.lookup("cmbOpenHourStart1");
	var cmbOpenHourStart2 = app.lookup("cmbOpenHourStart2");
	var cmbOpenHourStart3 = app.lookup("cmbOpenHourStart3");
	
	var cmbOpenHourEnd1 = app.lookup("cmbOpenHourEnd1");
	var cmbOpenHourEnd2 = app.lookup("cmbOpenHourEnd2");
	var cmbOpenHourEnd3 = app.lookup("cmbOpenHourEnd3");
	
	var cmbOpenMinuteStart1 = app.lookup("cmbOpenMinuteStart1");
	var cmbOpenMinuteStart2 = app.lookup("cmbOpenMinuteStart2");
	var cmbOpenMinuteStart3 = app.lookup("cmbOpenMinuteStart3");
	
	var cmbOpenMinuteEnd1 = app.lookup("cmbOpenMinuteEnd1");
	var cmbOpenMinuteEnd2 = app.lookup("cmbOpenMinuteEnd2");
	var cmbOpenMinuteEnd3 = app.lookup("cmbOpenMinuteEnd3");
		
		
	
		
	cmbLockHourStart1.value = parseInt( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock1.StartHour ) ;
	cmbLockMinuteStart1.value = parseInt( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock1.StartMinute ) ;
	cmbLockHourEnd1.value = parseInt( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock1.EndHour );
	cmbLockMinuteEnd1.value = parseInt( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock1.EndMinute ) ;
		
	cmbLockHourStart2.value = parseInt( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock2.StartHour ) ;
	cmbLockMinuteStart2.value = parseInt( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock2.StartMinute ) ;
	cmbLockHourEnd2.value = parseInt( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock2.EndHour );
	cmbLockMinuteEnd2.value = parseInt( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock2.EndMinute ) ;
			
	cmbLockHourStart3.value = parseInt( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock3.StartHour ) ;
	cmbLockMinuteStart3.value = parseInt( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock3.StartMinute ) ;
	cmbLockHourEnd3.value = parseInt( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock3.EndHour );
	cmbLockMinuteEnd3.value = parseInt( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock3.EndMinute ) ;
		
	
			
	cmbOpenHourStart1.value = parseInt( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open1.StartHour ) ;
	cmbOpenMinuteStart1.value = parseInt( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open1.StartMinute ) ;
	cmbOpenHourEnd1.value = parseInt( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open1.EndHour );
	cmbOpenMinuteEnd1.value = parseInt( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open1.EndMinute ) ;
		
	cmbOpenHourStart2.value = parseInt( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open2.StartHour ) ;
	cmbOpenMinuteStart2.value = parseInt( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open2.StartMinute ) ;
	cmbOpenHourEnd2.value = parseInt( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open2.EndHour );
	cmbOpenMinuteEnd2.value = parseInt( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open2.EndMinute ) ;
			
	cmbOpenHourStart3.value = parseInt( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open3.StartHour ) ;
	cmbOpenMinuteStart3.value = parseInt( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open3.StartMinute ) ;
	cmbOpenHourEnd3.value = parseInt( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open3.EndHour );
	cmbOpenMinuteEnd3.value = parseInt( jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open3.EndMinute ) ;
		










	var dsLockSchedule = app.lookup("dsLockSchedule");
	for(var ii=0; ii<jsonContent.MsgTerminalLockOption[LockIndex].Locks.length;ii++)
	{
		var row = dsLockSchedule.getRow(ii);
		
		var strData = "";
		
		// Lock1
		strData = "";
		if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock1.StartHour == 255)
			strData += " - "
		else
		{
			var temp = jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock1.StartHour;
			if( temp.toString().length == 1 )
				strData += "0" + temp;
			else
				strData += temp;
		}
			
			
		strData += ":";
		
		if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock1.StartMinute == 255)
			strData += " - "
		else
		{
			var temp = jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock1.StartMinute;
			if( temp.toString().length == 1 )
				strData += "0" + temp;
			else
				strData += temp;
		}			
		strData += "~";
		
		if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock1.EndHour == 255)
			strData += " - "
		else
		{
			var temp = jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock1.EndHour;
			if( temp.toString().length == 1 )
				strData += "0" + temp;
			else
				strData += temp;
		}				
		
		
		strData += ":";
		
		if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock1.EndMinute == 255)
			strData += " - "
		else
		{
			var temp = jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock1.EndMinute;
			if( temp.toString().length == 1 )
				strData += "0" + temp;
			else
				strData += temp;
		}				
		
		row.setValue("Lock1",strData);
		
		
		
		//Lock2
		strData = "";
		if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock2.StartHour == 255)
			strData += " - "
		else
		{
			var temp = jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock2.StartHour;
			if( temp.toString().length == 1 )
				strData += "0" + temp;
			else
				strData += temp;
		}				
			
		strData += ":";
		
		if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock2.StartMinute == 255)
			strData += " - "
		else
		{
			var temp = jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock2.StartMinute;
			if( temp.toString().length == 1 )
				strData += "0" + temp;
			else
				strData += temp;
		}					
		strData += "~";
		
		if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock2.EndHour == 255)
			strData += " - "
		else
		{
			var temp = jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock2.EndHour;
			if( temp.toString().length == 1 )
				strData += "0" + temp;
			else
				strData += temp;
		}				
		
		strData += ":";
		
		if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock2.EndMinute == 255)
			strData += " - "
		else
		{
			var temp = jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock2.EndMinute;
			if( temp.toString().length == 1 )
				strData += "0" + temp;
			else
				strData += temp;
		}				
			
		row.setValue("Lock2",strData);
		
		
		
	
		//Lock3
		strData = "";
		if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock3.StartHour == 255)
			strData += " - "
		else
		{
			var temp = jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock3.StartHour;
			if( temp.toString().length == 1 )
				strData += "0" + temp;
			else
				strData += temp;
		}					
		strData += ":";
		
		if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock3.StartMinute == 255)
			strData += " - "
		else
		{
			var temp = jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock3.StartMinute;
			if( temp.toString().length == 1 )
				strData += "0" + temp;
			else
				strData += temp;
		}					
		strData += "~";
		
		if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock3.EndHour == 255)
			strData += " - "
		else
		{
			var temp = jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock3.EndHour;
			if( temp.toString().length == 1 )
				strData += "0" + temp;
			else
				strData += temp;
		}				
		strData += ":";
		
		if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock3.EndMinute == 255)
			strData += " - "
		else
		{
			var temp = jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Lock3.EndMinute;
			if( temp.toString().length == 1 )
				strData += "0" + temp;
			else
				strData += temp;
		}					
			
		row.setValue("Lock3",strData);
		
		
	
		//Open1
		strData = "";
		if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open1.StartHour == 255)
			strData += " - "
		else
		{
			var temp = jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open1.StartHour;
			if( temp.toString().length == 1 )
				strData += "0" + temp;
			else
				strData += temp;
		}				
			
		strData += ":";
		
		if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open1.StartMinute == 255)
			strData += " - "
		else
		{
			var temp = jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open1.StartMinute;
			if( temp.toString().length == 1 )
				strData += "0" + temp;
			else
				strData += temp;
		}				
		strData += "~";
		
		if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open1.EndHour == 255)
			strData += " - "
		else
		{
			var temp = jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open1.EndHour;
			if( temp.toString().length == 1 )
				strData += "0" + temp;
			else
				strData += temp;
		}				
		
		strData += ":";
		
		if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open1.EndMinute == 255)
			strData += " - "
		else
		{
			var temp = jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open1.EndMinute;
			if( temp.toString().length == 1 )
				strData += "0" + temp;
			else
				strData += temp;
		}						
			
		row.setValue("Open1",strData);
		
		
		//Open2
		strData = "";
		if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open2.StartHour == 255)
			strData += " - "
		else
		{
			var temp = jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open2.StartHour;
			if( temp.toString().length == 1 )
				strData += "0" + temp;
			else
				strData += temp;
		}					
			
		strData += ":";
		
		if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open2.StartMinute == 255)
			strData += " - "
		else
		{
			var temp = jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open2.StartMinute;
			if( temp.toString().length == 1 )
				strData += "0" + temp;
			else
				strData += temp;
		}					
		strData += "~";
		
		if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open2.EndHour == 255)
			strData += " - "
		else
		{
			var temp = jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open2.EndHour;
			if( temp.toString().length == 1 )
				strData += "0" + temp;
			else
				strData += temp;
		}				
		
		strData += ":";
		
		if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open2.EndMinute == 255)
			strData += " - "
		else
		{
			var temp = jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open2.EndMinute;
			if( temp.toString().length == 1 )
				strData += "0" + temp;
			else
				strData += temp;
		}					
			
		row.setValue("Open2",strData);
		
				
		//Open3
		strData = "";
		if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open3.StartHour == 255)
			strData += " - "
		else
		{
			var temp = jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open3.StartHour;
			if( temp.toString().length == 1 )
				strData += "0" + temp;
			else
				strData += temp;
		}					
			
		strData += ":";
		
		if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open3.StartMinute == 255)
			strData += " - "
		else
		{
			var temp = jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open3.StartMinute;
			if( temp.toString().length == 1 )
				strData += "0" + temp;
			else
				strData += temp;
		}					
		strData += "~";
		
		if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open3.EndHour == 255)
			strData += " - "
		else
		{
			var temp = jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open3.EndHour;
			if( temp.toString().length == 1 )
				strData += "0" + temp;
			else
				strData += temp;
		}				
		
		strData += ":";
		
		if (jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open3.EndMinute == 255)
			strData += " - "
		else
		{
			var temp = jsonContent.MsgTerminalLockOption[LockIndex].Locks[DaysIndex].Open3.EndMinute;
			if( temp.toString().length == 1 )
				strData += "0" + temp;
			else
				strData += temp;
		}					
			
		row.setValue("Open3",strData);	
	}




	
	var grdLockSchedule = app.lookup("grdLockSchedule");
	
	grdLockSchedule.redraw();
	
	
	
	
	
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetAcuLockOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetAcuLockOption = e.control;

	jsonContent = null;
	jsonContent = JSON.parse(smsGetAcuLockOption.xhr.responseText);
	
	console.log(jsonContent.Result.ResultCode);
	
	console.log(jsonContent.MsgTerminalLockOption);
	
	//jsonContent.MsgTerminalLockOption 하위에 Locks 가 10개 배열이 있다 각각의 Locks 하위에 Lock 1 2 3 와 Open 1 2 3 이 있다
	
	AcuLockOptionJsonData_To_Screen(0, 0);
	
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsPutAcuLockOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsPutAcuLockOption = e.control;
	
	console.log("onSmsPutAcuLockOptionSubmitDone");
	
	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("hideLoadMask");		
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmbSelectLockSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var cmbSelectLock = e.control;
	
	AcuLockOptionJsonData_To_Screen(cmbSelectLock.value, 0);
	
}


/*
 * 그리드에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGrdLockScheduleClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var grdLockSchedule = e.control;
	
	console.log("onGrdLockScheduleClick");
	
	var cmbSelectLock = app.lookup("cmbSelectLock");
	
	var rowIndex = grdLockSchedule.getSelectedRow().getIndex();
	
	AcuLockOptionJsonData_To_Screen(cmbSelectLock.value, rowIndex);
	
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmbSelectApplySelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var cmbSelectApply = e.control;
	
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
	
	
	
	var cmbLockHourStart1 = app.lookup("cmbLockHourStart1");
	var cmbLockHourStart2 = app.lookup("cmbLockHourStart2");
	var cmbLockHourStart3 = app.lookup("cmbLockHourStart3");
	
	var cmbLockHourEnd1 = app.lookup("cmbLockHourEnd1");
	var cmbLockHourEnd2 = app.lookup("cmbLockHourEnd2");
	var cmbLockHourEnd3 = app.lookup("cmbLockHourEnd3");
	
	var cmbLockMinuteStart1 = app.lookup("cmbLockMinuteStart1");
	var cmbLockMinuteStart2 = app.lookup("cmbLockMinuteStart2");
	var cmbLockMinuteStart3 = app.lookup("cmbLockMinuteStart3");
	
	var cmbLockMinuteEnd1 = app.lookup("cmbLockMinuteEnd1");
	var cmbLockMinuteEnd2 = app.lookup("cmbLockMinuteEnd2");
	var cmbLockMinuteEnd3 = app.lookup("cmbLockMinuteEnd3");
		
	
	

	var cmbOpenHourStart1 = app.lookup("cmbOpenHourStart1");
	var cmbOpenHourStart2 = app.lookup("cmbOpenHourStart2");
	var cmbOpenHourStart3 = app.lookup("cmbOpenHourStart3");
	
	var cmbOpenHourEnd1 = app.lookup("cmbOpenHourEnd1");
	var cmbOpenHourEnd2 = app.lookup("cmbOpenHourEnd2");
	var cmbOpenHourEnd3 = app.lookup("cmbOpenHourEnd3");
	
	var cmbOpenMinuteStart1 = app.lookup("cmbOpenMinuteStart1");
	var cmbOpenMinuteStart2 = app.lookup("cmbOpenMinuteStart2");
	var cmbOpenMinuteStart3 = app.lookup("cmbOpenMinuteStart3");
	
	var cmbOpenMinuteEnd1 = app.lookup("cmbOpenMinuteEnd1");
	var cmbOpenMinuteEnd2 = app.lookup("cmbOpenMinuteEnd2");
	var cmbOpenMinuteEnd3 = app.lookup("cmbOpenMinuteEnd3");
		
	
	var cmbSelectLock = app.lookup("cmbSelectLock");
	
	var cmbSelectApply = app.lookup("cmbSelectApply");
	if( 0 == cmbSelectApply.value ) // 전체 
	{
		for(var ii=0;ii<10;ii++)
		{
			// Lock1
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock1.StartHour = parseInt(cmbLockHourStart1.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock1.StartMinute = parseInt(cmbLockMinuteStart1.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock1.EndHour = parseInt(cmbLockHourEnd1.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock1.EndMinute = parseInt(cmbLockMinuteEnd1.value);
			
			console.log("Lock1.StartHour:" + jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock1.StartHour);
			console.log("Lock1.StartMinute:" + jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock1.StartMinute);
			console.log("Lock1.EndHour:" + jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock1.EndHour);
			console.log("Lock1.EndMinute:" + jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock1.EndMinute);
			
			
			
			//Lock2
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock2.StartHour = parseInt(cmbLockHourStart2.value );
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock2.StartMinute = parseInt(cmbLockMinuteStart2.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock2.EndHour = parseInt(cmbLockHourEnd2.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock2.EndMinute = parseInt(cmbLockMinuteEnd2.value);
			//Lock3
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock3.StartHour = parseInt(cmbLockHourStart3.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock3.StartMinute = parseInt(cmbLockMinuteStart3.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock3.EndHour = parseInt(cmbLockHourEnd3.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock3.EndMinute = parseInt(cmbLockMinuteEnd3.value);
					
					
					
			// Open1
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open1.StartHour = parseInt(cmbOpenHourStart1.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open1.StartMinute = parseInt(cmbOpenMinuteStart1.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open1.EndHour = parseInt(cmbOpenHourEnd1.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open1.EndMinute = parseInt(cmbOpenMinuteEnd1.value);
			//Open2
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open2.StartHour = parseInt(cmbOpenHourStart2.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open2.StartMinute = parseInt(cmbOpenMinuteStart2.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open2.EndHour = parseInt(cmbOpenHourEnd2.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open2.EndMinute = parseInt(cmbOpenMinuteEnd2.value);
			//Open3
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open3.StartHour = parseInt(cmbOpenHourStart3.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open3.StartMinute = parseInt(cmbOpenMinuteStart3.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open3.EndHour = parseInt(cmbOpenHourEnd3.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open3.EndMinute = parseInt(cmbOpenMinuteEnd3.value);
					
		
		}
		
	}
	else if( 1 == cmbSelectApply.value ) // 월요일 ~ 금요일 
	{
		for(var ii=1;ii<6;ii++)
		{
			// Lock1
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock1.StartHour = parseInt(cmbLockHourStart1.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock1.StartMinute = parseInt(cmbLockMinuteStart1.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock1.EndHour = parseInt(cmbLockHourEnd1.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock1.EndMinute = parseInt(cmbLockMinuteEnd1.value);
			//Lock2
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock2.StartHour = parseInt(cmbLockHourStart2.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock2.StartMinute = parseInt(cmbLockMinuteStart2.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock2.EndHour = parseInt(cmbLockHourEnd2.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock2.EndMinute = parseInt(cmbLockMinuteEnd2.value);
			//Lock3
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock3.StartHour = parseInt(cmbLockHourStart3.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock3.StartMinute = parseInt(cmbLockMinuteStart3.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock3.EndHour = parseInt(cmbLockHourEnd3.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock3.EndMinute = parseInt(cmbLockMinuteEnd3.value);
					
			// Open1
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open1.StartHour = parseInt(cmbOpenHourStart1.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open1.StartMinute = parseInt(cmbOpenMinuteStart1.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open1.EndHour = parseInt(cmbOpenHourEnd1.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open1.EndMinute = parseInt(cmbOpenMinuteEnd1.value);
			//Open2
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open2.StartHour = parseInt(cmbOpenHourStart2.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open2.StartMinute = parseInt(cmbOpenMinuteStart2.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open2.EndHour = parseInt(cmbOpenHourEnd2.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open2.EndMinute = parseInt(cmbOpenMinuteEnd2.value);
			//Open3
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open3.StartHour = parseInt(cmbOpenHourStart3.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open3.StartMinute = parseInt(cmbOpenMinuteStart3.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open3.EndHour = parseInt(cmbOpenHourEnd3.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open3.EndMinute = parseInt(cmbOpenMinuteEnd3.value);
					
		
		}
	}		
	else if( 2 == cmbSelectApply.value ) // 툐요일 ~ 일요일
	{
		for(var ii=0;ii<10;ii++)
		{
			if(ii != 0 && ii != 6)
				continue;
			
			// Lock1
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock1.StartHour = parseInt(cmbLockHourStart1.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock1.StartMinute = parseInt(cmbLockMinuteStart1.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock1.EndHour = parseInt(cmbLockHourEnd1.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock1.EndMinute = parseInt(cmbLockMinuteEnd1.value);
			//Lock2
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock2.StartHour = parseInt(cmbLockHourStart2.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock2.StartMinute = parseInt(cmbLockMinuteStart2.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock2.EndHour = parseInt(cmbLockHourEnd2.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock2.EndMinute = parseInt(cmbLockMinuteEnd2.value);
			//Lock3
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock3.StartHour = parseInt(cmbLockHourStart3.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock3.StartMinute = parseInt(cmbLockMinuteStart3.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock3.EndHour = parseInt(cmbLockHourEnd3.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock3.EndMinute = parseInt(cmbLockMinuteEnd3.value);
					
			// Open1
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open1.StartHour = parseInt(cmbOpenHourStart1.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open1.StartMinute = parseInt(cmbOpenMinuteStart1.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open1.EndHour = parseInt(cmbOpenHourEnd1.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open1.EndMinute = parseInt(cmbOpenMinuteEnd1.value);
			//Open2
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open2.StartHour = parseInt(cmbOpenHourStart2.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open2.StartMinute = parseInt(cmbOpenMinuteStart2.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open2.EndHour = parseInt(cmbOpenHourEnd2.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open2.EndMinute = parseInt(cmbOpenMinuteEnd2.value);
			//Open3
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open3.StartHour = parseInt(cmbOpenHourStart3.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open3.StartMinute = parseInt(cmbOpenMinuteStart3.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open3.EndHour = parseInt(cmbOpenHourEnd3.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open3.EndMinute = parseInt(cmbOpenMinuteEnd3.value);
					
		
		}
	}			
	else if( 3 == cmbSelectApply.value ) // 휴일구분 1,2,3
	{
		for(var ii=7;ii<10;ii++)
		{
			// Lock1
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock1.StartHour = parseInt(cmbLockHourStart1.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock1.StartMinute = parseInt(cmbLockMinuteStart1.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock1.EndHour = parseInt(cmbLockHourEnd1.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock1.EndMinute = parseInt(cmbLockMinuteEnd1.value);
			//Lock2
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock2.StartHour = parseInt(cmbLockHourStart2.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock2.StartMinute = parseInt(cmbLockMinuteStart2.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock2.EndHour = parseInt(cmbLockHourEnd2.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock2.EndMinute = parseInt(cmbLockMinuteEnd2.value);
			//Lock3
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock3.StartHour = parseInt(cmbLockHourStart3.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock3.StartMinute = parseInt(cmbLockMinuteStart3.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock3.EndHour = parseInt(cmbLockHourEnd3.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock3.EndMinute = parseInt(cmbLockMinuteEnd3.value);
					
			// Open1
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open1.StartHour = parseInt(cmbOpenHourStart1.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open1.StartMinute = parseInt(cmbOpenMinuteStart1.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open1.EndHour = parseInt(cmbOpenHourEnd1.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open1.EndMinute = parseInt(cmbOpenMinuteEnd1.value);
			//Open2
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open2.StartHour = parseInt(cmbOpenHourStart2.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open2.StartMinute = parseInt(cmbOpenMinuteStart2.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open2.EndHour = parseInt(cmbOpenHourEnd2.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open2.EndMinute = parseInt(cmbOpenMinuteEnd2.value);
			//Open3
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open3.StartHour = parseInt(cmbOpenHourStart3.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open3.StartMinute = parseInt(cmbOpenMinuteStart3.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open3.EndHour = parseInt(cmbOpenHourEnd3.value);
			jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open3.EndMinute = parseInt(cmbOpenMinuteEnd3.value);
					
		
		}
	}			
	else if( cmbSelectApply.value >= 4) // 
	{
		var ii = cmbSelectApply.value - 4;
		// Lock1
		jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock1.StartHour = parseInt(cmbLockHourStart1.value);
		jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock1.StartMinute = parseInt(cmbLockMinuteStart1.value);
		jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock1.EndHour = parseInt(cmbLockHourEnd1.value);
		jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock1.EndMinute = parseInt(cmbLockMinuteEnd1.value);
		//Lock2
		jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock2.StartHour = parseInt(cmbLockHourStart2.value);
		jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock2.StartMinute = parseInt(cmbLockMinuteStart2.value);
		jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock2.EndHour = parseInt(cmbLockHourEnd2.value);
		jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock2.EndMinute = parseInt(cmbLockMinuteEnd2.value);
		//Lock3
		jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock3.StartHour = parseInt(cmbLockHourStart3.value);
		jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock3.StartMinute = parseInt(cmbLockMinuteStart3.value);
		jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock3.EndHour = parseInt(cmbLockHourEnd3.value);
		jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Lock3.EndMinute = parseInt(cmbLockMinuteEnd3.value);
				
		// Open1
		jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open1.StartHour = parseInt(cmbOpenHourStart1.value);
		jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open1.StartMinute = parseInt(cmbOpenMinuteStart1.value);
		jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open1.EndHour = parseInt(cmbOpenHourEnd1.value);
		jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open1.EndMinute = parseInt(cmbOpenMinuteEnd1.value);
		//Open2
		jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open2.StartHour = parseInt(cmbOpenHourStart2.value);
		jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open2.StartMinute = parseInt(cmbOpenMinuteStart2.value);
		jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open2.EndHour = parseInt(cmbOpenHourEnd2.value);
		jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open2.EndMinute = parseInt(cmbOpenMinuteEnd2.value);
		//Open3
		jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open3.StartHour = parseInt(cmbOpenHourStart3.value);
		jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open3.StartMinute = parseInt(cmbOpenMinuteStart3.value);
		jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open3.EndHour = parseInt(cmbOpenHourEnd3.value);
		jsonContent.MsgTerminalLockOption[cmbSelectLock.value].Locks[ii].Open3.EndMinute = parseInt(cmbOpenMinuteEnd3.value);
	}			
	

	//jsonContent.MsgTerminalLockOption[0].Locks[0].Lock1.StartHour = 99;
	

	console.log(jsonContent.MsgTerminalLockOption);
		
		
	/*
	var smsPutAcuLockOption = app.lookup("smsPutAcuLockOption");
	smsPutAcuLockOption.action = "/v1/acus/" + curTerminalID.toString() +"/option/lock";	
	
	smsPutAcuLockOption.setRequestObject(jsonContent.MsgTerminalLockOption);
	smsPutAcuLockOption.send();	
	*/
					
}
