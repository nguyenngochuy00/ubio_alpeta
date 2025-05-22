/************************************************
 * terminalMCPPageIO.js
 * Created at 2020. 8. 7. 오전 10:42:42.
 *
 * @author union
 ************************************************/


var comLib;			
var dataManager = cpr.core.Module.require("lib/DataManager");


var curTerminalID = 0;


exports.requestSaveData = function() {
	
	console.log("MCP Input/Output requestSaveData curTerminalID: " + curTerminalID.toString());
	
	
	
	var sms = app.lookup("smsPutAcuOutputsOption");
	sms.action = "/v1/acus/" + curTerminalID.toString() + "/option/output";	
	sms.send();			
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



	var cmbSelectOutput = app.lookup("cmbSelectOutput");	
	for(var i=0;i<8;i++)
	{
		cmbSelectOutput.addItem(new cpr.controls.Item(( i+1).toString(),i.toString()));
	}
	cmbSelectOutput.selectItem(0);
	
	
	var cmbSelectInput = app.lookup("cmbSelectInput");
	for(var i=0;i<4;i++)
	{
		cmbSelectInput.addItem(new cpr.controls.Item(( i+1).toString(),i.toString()));
	}
	cmbSelectInput.selectItem(0);	
	
	
	var cmbOutputType = app.lookup("cmbOutputType");	
	cmbOutputType.addItem(new cpr.controls.Item( "UNUSED", 0));
	cmbOutputType.addItem(new cpr.controls.Item( "AUTHORIZED", 1));
	cmbOutputType.addItem(new cpr.controls.Item( "UNAUTHORIZED", 2));
	cmbOutputType.addItem(new cpr.controls.Item( "SCHEDULE", 3));
	cmbOutputType.addItem(new cpr.controls.Item( "ALARM", 4));
	cmbOutputType.addItem(new cpr.controls.Item( "TROUBLE", 5));
	cmbOutputType.addItem(new cpr.controls.Item( "ARM STATUS", 6));
	cmbOutputType.addItem(new cpr.controls.Item( "FIRE", 7));
	cmbOutputType.addItem(new cpr.controls.Item( "SILENT", 8));
	cmbOutputType.addItem(new cpr.controls.Item( "OPEN TOO LONG", 9));
	cmbOutputType.addItem(new cpr.controls.Item( "FORCED", 10));
	cmbOutputType.selectItem(0);
		
	
	
	var cmbInputType = app.lookup("cmbInputType");	
	cmbInputType.addItem(new cpr.controls.Item( "NOT USED", 0));
	cmbInputType.addItem(new cpr.controls.Item( "EXIT BUTTON NC", 1));
	cmbInputType.addItem(new cpr.controls.Item( "EXIT BUTTON NO", 2));
	cmbInputType.addItem(new cpr.controls.Item( "FIRE NC", 3));
	cmbInputType.addItem(new cpr.controls.Item( "FIRE NO", 4));
	cmbInputType.addItem(new cpr.controls.Item( "SECURITY NC", 5));
	cmbInputType.addItem(new cpr.controls.Item( "SECURITY NO", 6));
	cmbInputType.selectItem(0);	
	
	
	
	var sms = app.lookup("smsGetAcuInputsOption");
	sms.action = "/v1/acus/" + curTerminalID + "/option/input";	
	sms.send();		
}




function dsAcuInputsOption_To_Screen(index) {
	
	var dsAcuInputsOption = app.lookup("dsAcuInputsOption");
	
	console.log("dsAcuInputsOption.getRowCount(): " + dsAcuInputsOption.getRowCount());
	
	for (var ii=0;ii<dsAcuInputsOption.getRowCount() ;ii++)
	{
		console.log(dsAcuInputsOption.getRowData(ii));
	}
	
	if( dsAcuInputsOption.getRowCount() == 0 )
		return;
				
	
	var cmbInputType = app.lookup("cmbInputType");	
	var ipbInputOccurTime = app.lookup("ipbInputOccurTime");	
	var ipbInputArg = app.lookup("ipbInputArg");	

	var Type = dsAcuInputsOption.getRow(index).getValue("Type");		
	cmbInputType.value = Type;	
	
	var Time = dsAcuInputsOption.getRow(index).getValue("Time");		
	ipbInputOccurTime.text = Time.toString();		
		
	var Parameter = dsAcuInputsOption.getRow(index).getValue("Parameter");		
	ipbInputArg.text = Parameter.toString();		
		
}

function dsAcuInputsOption_From_Screen(index) {

	var dsAcuInputsOption = app.lookup("dsAcuInputsOption");
	
	console.log("dsAcuInputsOption.getRowCount(): " + dsAcuInputsOption.getRowCount());
	
	if( dsAcuInputsOption.getRowCount() == 0 )
		return;
				
	var cmbInputType = app.lookup("cmbInputType");	
	var ipbInputOccurTime = app.lookup("ipbInputOccurTime");	
	var ipbInputArg = app.lookup("ipbInputArg");	

	var Type = dsAcuInputsOption.getRow(index).setValue("Type", cmbInputType.value);		
	
	var Time = dsAcuInputsOption.getRow(index).setValue("Time", parseInt( ipbInputOccurTime.text ));		
		
	var Parameter = dsAcuInputsOption.getRow(index).setValue("Parameter", parseInt( ipbInputArg.text ));	
	
}



function dsAcuOutputsOption_To_Screen(index) {
	
	var dsAcuOutputsOption = app.lookup("dsAcuOutputsOption");
	
	console.log("dsAcuOutputsOption.getRowCount(): " + dsAcuOutputsOption.getRowCount());
	
	for (var ii=0;ii<dsAcuOutputsOption.getRowCount() ;ii++)
	{
		console.log(dsAcuOutputsOption.getRowData(ii));
	}
	
	if( dsAcuOutputsOption.getRowCount() == 0 )
		return;
				
	var cmbOutputType = app.lookup("cmbOutputType");	
	var ipbOutputOccurTime = app.lookup("ipbOutputOccurTime");	
	var ipbOutputArg = app.lookup("ipbOutputArg");	
	var cbxOutputInvert = app.lookup("cbxOutputInvert");

	var Type = dsAcuOutputsOption.getRow(index).getValue("Type");		
	cmbOutputType.value = Type	
	
	var Time = dsAcuOutputsOption.getRow(index).getValue("Time");		
	ipbOutputOccurTime.text = Time.toString();		
		
	var Parameter = dsAcuOutputsOption.getRow(index).getValue("Parameter");		
	ipbOutputArg.text = Parameter.toString();
	
	var value = dsAcuOutputsOption.getRow(index).getValue("Inverted");	
	var valueInt = 0;
	valueInt = parseInt(value);
	
	if(valueInt == 0)
		cbxOutputInvert.checked = false;	
	else 
		cbxOutputInvert.checked = true;	
}

function dsAcuOutputsOption_From_Screen(index) {
	
	var dsAcuOutputsOption = app.lookup("dsAcuOutputsOption");
	
	console.log("dsAcuOutputsOption.getRowCount(): " + dsAcuOutputsOption.getRowCount());
	
	for (var ii=0;ii<dsAcuOutputsOption.getRowCount() ;ii++)
	{
		console.log(dsAcuOutputsOption.getRowData(ii));
	}
	
	if( dsAcuOutputsOption.getRowCount() == 0 )
		return;
				
	var cmbOutputType = app.lookup("cmbOutputType");	
	var ipbOutputOccurTime = app.lookup("ipbOutputOccurTime");	
	var ipbOutputArg = app.lookup("ipbOutputArg");	
	var cbxOutputInvert = app.lookup("cbxOutputInvert");

	var Type = dsAcuOutputsOption.getRow(index).setValue("Type", cmbOutputType.value);		
	
	var Time = dsAcuOutputsOption.getRow(index).setValue("Time", parseInt(ipbOutputOccurTime.text));		
		
	var Parameter = dsAcuOutputsOption.getRow(index).setValue("Parameter", parseInt( ipbOutputArg.text));		
	
	if(cbxOutputInvert.checked == true)
	{
		var value = dsAcuOutputsOption.getRow(index).setValue("Inverted", 1);
	}
	else
	{
		var value = dsAcuOutputsOption.getRow(index).setValue("Inverted", 0);
	}
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetAcuInputsOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetAcuInputsOption = e.control;
	
	dsAcuInputsOption_To_Screen(0);
	
	var sms = app.lookup("smsGetAcuOutputsOption");
	sms.action = "/v1/acus/" + curTerminalID + "/option/output";	
	sms.send();			
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetAcuOutputsOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetAcuOutputsOption = e.control;
	
	dsAcuOutputsOption_To_Screen(0);	
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmbSelectOutputSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var cmbSelectOutput = e.control;
	
	var valueInt = parseInt(cmbSelectOutput.value);
	dsAcuOutputsOption_To_Screen(valueInt);	
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmbSelectInputSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var cmbSelectInput = e.control;
	
	
	var valueInt = parseInt(cmbSelectInput.value);
	dsAcuInputsOption_To_Screen(valueInt);	
	
}


/*
 * 버튼(btnOutputInfoSave)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnOutputInfoSaveClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnOutputInfoSave = e.control;
	
	var cmbSelectOutput = app.lookup("cmbSelectOutput");
	
	var value = cmbSelectOutput.value;
	var valueInt = parseInt(value);
		
	dsAcuOutputsOption_From_Screen(valueInt);
	
	/*
	var sms = app.lookup("smsPutAcuOutputsOption");
	sms.action = "/v1/acus/" + curTerminalID + "/option/output";	
	sms.send();	
	*/			
}


/*
 * 버튼(btnInputInfoSave)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnInputInfoSaveClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnInputInfoSave = e.control;
	
	var cmbSelectInput = app.lookup("cmbSelectInput");
	
	var value = cmbSelectInput.value;
	var valueInt = parseInt(value);
	
	dsAcuInputsOption_From_Screen(valueInt);
	
	/*
	var sms = app.lookup("smsPutAcuInputsOption");
	sms.action = "/v1/acus/" + curTerminalID + "/option/input";	
	sms.send();	
	*/		
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsPutAcuInputsOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsPutAcuInputsOption = e.control;
	
	console.log("onSmsPutAcuInputsOptionSubmitDone");

	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("hideLoadMask");	
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsPutAcuOutputsOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsPutAcuOutputsOption = e.control;
	
	console.log("onSmsPutAcuOutputsOptionSubmitDone");

	var sms = app.lookup("smsPutAcuInputsOption");
	sms.action = "/v1/acus/" + curTerminalID + "/option/input";	
	sms.send();	
}
