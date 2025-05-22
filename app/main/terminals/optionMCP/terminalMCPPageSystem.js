/************************************************
 * terminalMCPPageSystem.js
 * Created at 2020. 8. 7. 오후 2:34:20.
 *
 * @author union
 ************************************************/
var comLib;			
var dataManager = cpr.core.Module.require("lib/DataManager");


var curTerminalID = 40;



exports.requestSaveData = function() {
	
	console.log("MCP System requestSaveData");
	
	dmAcuSystemOption_From_Screen();
	
	var smsPutAcuSystemOption = app.lookup("smsPutAcuSystemOption");
	smsPutAcuSystemOption.action = "/v1/acus/" + curTerminalID.toString() + "/option/system";	
	smsPutAcuSystemOption.send();	
	
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




	var cmbAuthMode = app.lookup("cmbAuthMode");
	
	cmbAuthMode.addItem(new cpr.controls.Item("NS", 0));
	cmbAuthMode.addItem(new cpr.controls.Item("SN", 1));
	cmbAuthMode.addItem(new cpr.controls.Item("NO", 2));
	cmbAuthMode.addItem(new cpr.controls.Item("SO", 3));
	cmbAuthMode.selectItem(0);

	var smsGetAcuSystemOption = app.lookup("smsGetAcuSystemOption");
	smsGetAcuSystemOption.action = "/v1/acus/" + curTerminalID.toString() + "/option/system";	
	smsGetAcuSystemOption.send();	
}



function dmAcuSystemOption_To_Screen() {
	
	var dmAcuSystemOption = app.lookup("dmAcuSystemOption");
	
		
	var cbxForceSetSetup = app.lookup("cbxForceSetSetup");	
	var cbxTerminatingResistance = app.lookup("cbxTerminatingResistance");	
	var cbxTimeSync = app.lookup("cbxTimeSync");	
	var cbxInsideOpen = app.lookup("cbxInsideOpen");	
	var cbxUseServerPassback = app.lookup("cbxUseServerPassback");	
	var cbxDoorInterlocking = app.lookup("cbxDoorInterlocking");	
	var ipbTerminalID = app.lookup("ipbTerminalID");	
	var cmbAuthMode = app.lookup("cmbAuthMode");	
	
	cbxForceSetSetup.checked = false;
	cbxTerminatingResistance.checked = false;
	cbxTimeSync.checked = false;
	cbxInsideOpen.checked = false;
	cbxUseServerPassback.checked = false;
	cbxDoorInterlocking.checked = false;
	
	
	
	var value;
	var valueInt = 0;
	
	value = dmAcuSystemOption.getValue("ForceArm");	
	valueInt = parseInt(value);	
	if( valueInt != 0 )
		cbxForceSetSetup.checked = true;

	value = dmAcuSystemOption.getValue("EndOfLineResistors");
	valueInt = parseInt(value);	
	if( valueInt != 0 )
		cbxTerminatingResistance.checked = true;

	value = dmAcuSystemOption.getValue("TimeSync");
	valueInt = parseInt(value);	
	if( valueInt != 0 )
		cbxTimeSync.checked = true;
		
	value = dmAcuSystemOption.getValue("InsideOpenLog");
	valueInt = parseInt(value);	
	if( valueInt != 0 )
		cbxInsideOpen.checked = true;		
		
	
	value = dmAcuSystemOption.getValue("ServerPassback");
	valueInt = parseInt(value);	
	if( valueInt != 0 )
		cbxUseServerPassback.checked = true;		
				
	value = dmAcuSystemOption.getValue("DoorInterlocking");
	valueInt = parseInt(value);	
	if( valueInt != 0 )
		cbxDoorInterlocking.checked = true;			
		
	value = dmAcuSystemOption.getValue("AuthenticationMode");
	cmbAuthMode.value = value			
		
	value = dmAcuSystemOption.getValue("TerminalID");
	ipbTerminalID.text = value;	
	
}

function dmAcuSystemOption_From_Screen() {
	
	var dmAcuSystemOption = app.lookup("dmAcuSystemOption");
	
	var cbxForceSetSetup = app.lookup("cbxForceSetSetup");	
	var cbxTerminatingResistance = app.lookup("cbxTerminatingResistance");	
	var cbxTimeSync = app.lookup("cbxTimeSync");	
	var cbxInsideOpen = app.lookup("cbxInsideOpen");	
	var cbxUseServerPassback = app.lookup("cbxUseServerPassback");	
	var cbxDoorInterlocking = app.lookup("cbxDoorInterlocking");	
	var ipbTerminalID = app.lookup("ipbTerminalID");	
	var cmbAuthMode = app.lookup("cmbAuthMode");	
		

	dmAcuSystemOption.setValue("TerminalID", ipbTerminalID.text);
	dmAcuSystemOption.setValue("AuthenticationMode", cmbAuthMode.value);

	

	if( cbxForceSetSetup.checked == true )
		dmAcuSystemOption.setValue("ForceArm", 1);
	else 
		dmAcuSystemOption.setValue("ForceArm", 0);
		
	if( cbxTerminatingResistance.checked == true )
		dmAcuSystemOption.setValue("EndOfLineResistors", 1);
	else 
		dmAcuSystemOption.setValue("EndOfLineResistors", 0);		
	
	if( cbxTimeSync.checked == true )
		dmAcuSystemOption.setValue("TimeSync", 1);
	else 
		dmAcuSystemOption.setValue("TimeSync", 0);		

	if( cbxInsideOpen.checked == true )
		dmAcuSystemOption.setValue("InsideOpenLog", 1);
	else 
		dmAcuSystemOption.setValue("InsideOpenLog", 0);		
		
	if( cbxUseServerPassback.checked == true )
		dmAcuSystemOption.setValue("ServerPassback", 1);
	else 
		dmAcuSystemOption.setValue("ServerPassback", 0);	
		
	if( cbxDoorInterlocking.checked == true )
		dmAcuSystemOption.setValue("DoorInterlocking", 1);
	else 
		dmAcuSystemOption.setValue("DoorInterlocking", 0);		
		
	console.log("ForceArm:" + dmAcuSystemOption.getValue("ForceArm"));
							
}





/*
 * "test" 버튼(btnTest)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnTestClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnTest = e.control;

	
	dmAcuSystemOption_From_Screen();
	
	/*
	var smsPutAcuSystemOption = app.lookup("smsPutAcuSystemOption");
	smsPutAcuSystemOption.action = "/v1/acus/" + curTerminalID.toString() + "/option/system";	
	smsPutAcuSystemOption.send();	
	*/	
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetAcuSystemOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetAcuSystemOption = e.control;
	
	console.log("onSmsGetAcuSystemOptionSubmitDone");
	
	dmAcuSystemOption_To_Screen();
	
	
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsPutAcuSystemOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsPutAcuSystemOption = e.control;

	console.log("onSmsPutAcuSystemOptionSubmitDone");
	

	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("hideLoadMask");		
	
	
}
