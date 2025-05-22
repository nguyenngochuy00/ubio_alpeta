/************************************************
 * terminalMCPPageLockSetting.js
 * Created at 2020. 8. 7. 오전 11:28:07.
 *
 * @author union
 ************************************************/

var comLib;			
var dataManager = cpr.core.Module.require("lib/DataManager");


var curTerminalID = 40;


exports.requestSaveData = function() {
	
	console.log("MCP Lock Setting requestSaveData");
	
	var smsPutAcuLocksetOption = app.lookup("smsPutAcuLocksetOption");
	smsPutAcuLocksetOption.action = "/v1/acus/" + curTerminalID.toString() + "/option/lockset";	
	smsPutAcuLocksetOption.send();				
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



	var cmSelectLockSetting = app.lookup("cmSelectLockSetting");
	for(var i=0;i<4;i++)
	{
		cmSelectLockSetting.addItem(new cpr.controls.Item(( i+1).toString(),i.toString()));
	}
	cmSelectLockSetting.selectItem(0);
	
	
	var cmbZoneDoorMonitor = app.lookup("cmbZoneDoorMonitor");
	
	cmbZoneDoorMonitor.addItem(new cpr.controls.Item(dataManager.getString("Str_Undesignated"),0));
	for(var i=1;i<9;i++)
	{
		cmbZoneDoorMonitor.addItem(new cpr.controls.Item(( i).toString(),i.toString()));
	}
	cmbZoneDoorMonitor.selectItem(0);	
	
	var smsGetAcuLocksetOption = app.lookup("smsGetAcuLocksetOption");
	smsGetAcuLocksetOption.action = "/v1/acus/" + curTerminalID.toString() + "/option/lockset";	
	smsGetAcuLocksetOption.send();	
}


function dsAcuLockSetOption_To_Screen(index) {
	
	console.log("dsAcuLockSetOption_To_Screen...index: " + index);
	
	var dsAcuLockSetOption = app.lookup("dsAcuLockSetOption");
	console.log(dsAcuLockSetOption);
	console.log("dsAcuLockSetOption.getRowCount(): " + dsAcuLockSetOption.getRowCount());
	
	if( dsAcuLockSetOption.getRowCount() == 0 )
		return;
		
	//var cmSelectLockSetting = app.lookup("cmSelectLockSetting");	
	var cmbZoneDoorMonitor = app.lookup("cmbZoneDoorMonitor");	
	var ipbDoorOpenWarn = app.lookup("ipbDoorOpenWarn");	
	var cbxForceSetup = app.lookup("cbxForceSetup");	

	cbxForceSetup.checked = false;

	var ZoneDoor = dsAcuLockSetOption.getRow(index).getValue("ZoneDoor");
	console.log("ZoneDoor: " + ZoneDoor);		
	cmbZoneDoorMonitor.value = ZoneDoor;	
	
	var OpenWarnTime = dsAcuLockSetOption.getRow(index).getValue("OpenWarnTime");		
	ipbDoorOpenWarn.text = OpenWarnTime.toString();		
	
	var ForceEnable = dsAcuLockSetOption.getRow(index).getValue("ForceEnable");	
	var ForceEnableInt = 0;
	ForceEnableInt = parseInt(ForceEnable);	
	if( ForceEnableInt != 0 )
		cbxForceSetup.checked = true;
	
}



function dsAcuLockSetOption_From_Screen(index) {
	
	console.log("dsAcuLockSetOption_From_Screen...index: " + index);
	
	var dsAcuLockSetOption = app.lookup("dsAcuLockSetOption");
	console.log(dsAcuLockSetOption);
	console.log("dsAcuLockSetOption.getRowCount(): " + dsAcuLockSetOption.getRowCount());
	
	if( dsAcuLockSetOption.getRowCount() == 0 )
		return;
		
	//var cmSelectLockSetting = app.lookup("cmSelectLockSetting");	
	var cmbZoneDoorMonitor = app.lookup("cmbZoneDoorMonitor");	
	var ipbDoorOpenWarn = app.lookup("ipbDoorOpenWarn");	
	var cbxForceSetup = app.lookup("cbxForceSetup");	

	
	
	dsAcuLockSetOption.getRow(index).setValue("ZoneDoor", cmbZoneDoorMonitor.value);

	dsAcuLockSetOption.getRow(index).setValue("OpenWarnTime", ipbDoorOpenWarn.text);		
		
	if( cbxForceSetup.checked == false )
	{
		dsAcuLockSetOption.getRow(index).setValue("ForceEnable", 0);	
	}
	else 
	{
		dsAcuLockSetOption.getRow(index).setValue("ForceEnable", 1);
	}
	
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetAcuLocksetOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetAcuLocksetOption = e.control;
	
	console.log("onSmsGetAcuLocksetOptionSubmitDone");
	
	dsAcuLockSetOption_To_Screen(0);
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsPutAcuLocksetOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsPutAcuLocksetOption = e.control;
	
	
	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("hideLoadMask");			
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmSelectLockSettingSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var cmSelectLockSetting = e.control;
	
	dsAcuLockSetOption_To_Screen(parseInt(cmSelectLockSetting.value ));
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmbZoneDoorMonitorSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var cmbZoneDoorMonitor = e.control;
	
}


/*
 * 버튼(btnLockSettingSave)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnLockSettingSaveClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnLockSettingSave = e.control;
	
	var cmSelectLockSetting = app.lookup("cmSelectLockSetting");
	
	dsAcuLockSetOption_From_Screen(parseInt(cmSelectLockSetting.value ));	
	
	/*
	var smsPutAcuLocksetOption = app.lookup("smsPutAcuLocksetOption");
	smsPutAcuLocksetOption.action = "/v1/acus/" + curTerminalID.toString() + "/option/lockset";	
	smsPutAcuLocksetOption.send();		
	*/
}
