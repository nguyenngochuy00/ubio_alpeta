/************************************************
 * terminalMCPPageZone.js
 * Created at 2020. 8. 7. 오전 10:28:58.
 *
 * @author union
 ************************************************/

var comLib;			
var dataManager = cpr.core.Module.require("lib/DataManager");

var curTerminalID = 40;


exports.requestSaveData = function() {
	
	console.log("MCP Zone requestSaveData");
	
	var smsPutAcuZoneOption = app.lookup("smsPutAcuZoneOption");
	smsPutAcuZoneOption.action = "/v1/acus/" + curTerminalID.toString() + "/option/zone";	
	smsPutAcuZoneOption.send();	
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



	var cmbSelectZone = app.lookup("cmbSelectZone");
	for(var i=0;i<8;i++)
	{
		cmbSelectZone.addItem(new cpr.controls.Item(( i+1).toString(),i.toString()));
	}
	cmbSelectZone.selectItem(0);
	
	var cmbSelectType = app.lookup("cmbSelectType");
	cmbSelectType.addItem(new cpr.controls.Item("UNUSED", 0));
	cmbSelectType.addItem(new cpr.controls.Item("EXIT1", 1));
	cmbSelectType.addItem(new cpr.controls.Item("EXIT2", 2));
	cmbSelectType.addItem(new cpr.controls.Item("INSTANT", 3));
	cmbSelectType.addItem(new cpr.controls.Item("INTERIOR", 4));
	cmbSelectType.addItem(new cpr.controls.Item("EMERGENCY24", 5));
	cmbSelectType.addItem(new cpr.controls.Item("SILENTPANIC", 6));
	cmbSelectType.addItem(new cpr.controls.Item("WATER", 7));
	cmbSelectType.addItem(new cpr.controls.Item("GAS", 8));
	cmbSelectType.addItem(new cpr.controls.Item("FIRE", 9));
	cmbSelectType.addItem(new cpr.controls.Item("ARMDIS", 10));
	cmbSelectType.selectItem(0);
		
	
	

	var smsGetAcuZoneOption = app.lookup("smsGetAcuZoneOption");
	smsGetAcuZoneOption.action = "/v1/acus/" + curTerminalID.toString() + "/option/zone";	
	smsGetAcuZoneOption.send();	
}


function dsAcuZoneOption_To_Screen(index) {
	
	var dsAcuZoneOption = app.lookup("dsAcuZoneOption");
	console.log(dsAcuZoneOption);
	console.log("dsAcuZoneOption.getRowCount(): " + dsAcuZoneOption.getRowCount());
	
	if( dsAcuZoneOption.getRowCount() == 0 )
		return;
		
	var ipbZoneName = app.lookup("ipbZoneName");	
	var cmbSelectType = app.lookup("cmbSelectType");	
	var cbxResponse = app.lookup("cbxResponse");	
	var cbxDouble = app.lookup("cbxDouble");	
	var cbxPartition1 = app.lookup("cbxPartition1");	
	var cbxPartition2 = app.lookup("cbxPartition2");	
	var cbxPartition3 = app.lookup("cbxPartition3");	
	var cbxPartition4 = app.lookup("cbxPartition4");	

	cbxResponse.checked == false;
	cbxDouble.checked == false;
	cbxPartition1.checked == false;
	cbxPartition2.checked == false;
	cbxPartition3.checked == false;
	cbxPartition4.checked == false;

	// Name
	var Name = dsAcuZoneOption.getRow(index).getValue("Name");		
	ipbZoneName.text = Name.toString();	
	
	// Type
	var Type = dsAcuZoneOption.getRow(index).getValue("Type");		
	cmbSelectType.value = Type;		
	
	var Response = dsAcuZoneOption.getRow(index).getValue("Response");	
	var ResponseInt = 0;
	ResponseInt = parseInt(Response);	
	if( ResponseInt != 0 )
		cbxResponse.checked = true;
		
	var Double = dsAcuZoneOption.getRow(index).getValue("Double");	
	var DoubleInt = 0;
	DoubleInt = parseInt(Double);	
	if( DoubleInt != 0 )
		cbxDouble.checked = true;		
		
		
	var Partition = dsAcuZoneOption.getRow(index).getValue("Partition");	
	var PartitionInt = 0;
	PartitionInt = parseInt(Partition);	
	if( PartitionInt >= 8)
	{
		cbxPartition4.checked = true;	
		PartitionInt -= 8;
	}
		
	if( PartitionInt >= 4)
	{
		cbxPartition3.checked = true;	
		PartitionInt -= 4;
	}
	
	if( PartitionInt >= 2)
	{
		cbxPartition2.checked = true;	
		PartitionInt -= 2;
	}	
	
	if( PartitionInt > 0)
	{
		cbxPartition1.checked = true;	
		
	}	
}

function dsAcuZoneOption_From_Screen(index) {
	
	var dsAcuZoneOption = app.lookup("dsAcuZoneOption");
	
	if( dsAcuZoneOption.getRowCount() == 0 )
		return;

	var ipbZoneName = app.lookup("ipbZoneName");	
	var cmbSelectType = app.lookup("cmbSelectType");	
	var cbxResponse = app.lookup("cbxResponse");	
	var cbxDouble = app.lookup("cbxDouble");	
	var cbxPartition1 = app.lookup("cbxPartition1");	
	var cbxPartition2 = app.lookup("cbxPartition2");	
	var cbxPartition3 = app.lookup("cbxPartition3");	
	var cbxPartition4 = app.lookup("cbxPartition4");	
		
	dsAcuZoneOption.getRow(index).setValue("Name", ipbZoneName.text);	
	dsAcuZoneOption.getRow(index).setValue("Type", cmbSelectType.value);	
	
	if( cbxResponse.checked == true )
		dsAcuZoneOption.getRow(index).setValue("Response", 1);
	else 
		dsAcuZoneOption.getRow(index).setValue("Response", 0);
	
	if( cbxDouble.checked == true )
		dsAcuZoneOption.getRow(index).setValue("Double", 1);
	else 
		dsAcuZoneOption.getRow(index).setValue("Double", 0);
				
	var Partition = 0;
	if( cbxPartition1.checked == true )
	{
		Partition = 1;
	}
	if( cbxPartition2.checked == true )
	{
		Partition +=2;
	}
	if( cbxPartition3.checked == true )
	{
		Partition +=4;
	}
	if( cbxPartition4.checked == true )
	{
		Partition +=8;
	}
	
	console.log("index: " + index);
	console.log("Partition: " + Partition);
	
	dsAcuZoneOption.getRow(index).setValue("Partition", Partition);
		
				
}


/*
 * 버튼(btnZoneInfoSave)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnZoneInfoSaveClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnZoneInfoSave = e.control;



	var cmbSelectZone = app.lookup("cmbSelectZone");
	
	var idx_integer = 0;
	idx_integer = parseInt( cmbSelectZone.value );
	dsAcuZoneOption_From_Screen(idx_integer);

/*
	var smsPutAcuZoneOption = app.lookup("smsPutAcuZoneOption");
	smsPutAcuZoneOption.action = "/v1/acus/" + curTerminalID.toString() + "/option/zone";	
	smsPutAcuZoneOption.send();	
*/

}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmbSelectZoneSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var cmbSelectZone = e.control;
	
	var idx_integer = 0;
	idx_integer = parseInt( cmbSelectZone.value );
	dsAcuZoneOption_To_Screen(idx_integer);
	
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetAcuZoneOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetAcuZoneOption = e.control;

	console.log("onSmsGetAcuZoneOptionSubmitDone");

	
	dsAcuZoneOption_To_Screen(0);
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsPutAcuZoneOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsPutAcuZoneOption = e.control;
	
	console.log("onSmsPutAcuZoneOptionSubmitDone");
	

	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("hideLoadMask");	
	
}
