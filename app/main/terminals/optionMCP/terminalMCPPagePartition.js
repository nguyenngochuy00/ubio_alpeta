/************************************************
 * terminalMCPPagePartition.js
 * Created at 2020. 8. 6. 오후 5:13:37.
 *
 * @author union
 ************************************************/
var comLib;			
var dataManager = cpr.core.Module.require("lib/DataManager");


var curTerminalID = 40;



exports.requestSaveData = function() {
	
	console.log("MCP Partition requestSaveData");
	
	var smsPutAcuPartitionOption = app.lookup("smsPutAcuPartitionOption");
	smsPutAcuPartitionOption.action = "/v1/acus/" + curTerminalID + "/option/partition";	
	smsPutAcuPartitionOption.send();					
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



	var cmbSelectPartition = app.lookup("cmbSelectPartition");
	
	for(var i=0;i<4;i++)
	{
		cmbSelectPartition.addItem(new cpr.controls.Item(( i+1).toString(),i.toString()));
	}
	cmbSelectPartition.selectItem(0);

	var smsGetAcuPartitionOption = app.lookup("smsGetAcuPartitionOption");
	smsGetAcuPartitionOption.action = "/v1/acus/" + curTerminalID.toString() + "/option/partition";	
	smsGetAcuPartitionOption.send();
}


function dsAcuPartitionOption_To_Screen(index) {
	
	var dsAcuPartitionOption = app.lookup("dsAcuPartitionOption");
	console.log(dsAcuPartitionOption);
	console.log("dsAcuPartitionOption.getRowCount(): " + dsAcuPartitionOption.getRowCount());
	
	if( dsAcuPartitionOption.getRowCount() == 0 )
		return;
		
	var ipbPartitionName = app.lookup("ipbPartitionName");	
	var ipbPartitionAccount = app.lookup("ipbPartitionAccount");	
	var ipbPartitionEnterDelay1 = app.lookup("ipbPartitionEnterDelay1");	
	var ipbPartitionEnterDelay2 = app.lookup("ipbPartitionEnterDelay2");	
	var ipbPartitionExitDelay1 = app.lookup("ipbPartitionExitDelay1");	
	var ipbPartitionExitDelay2 = app.lookup("ipbPartitionExitDelay2");	
	var ipbPartitionSirenTime = app.lookup("ipbPartitionSirenTime");	
	var ipbPartitionAlarmCount = app.lookup("ipbPartitionAlarmCount");	
	
	var cbxUse = app.lookup("cbxUse");	
	var cbxBellSound = app.lookup("cbxBellSound");	
	var cbxDoorUnlockOpen = app.lookup("cbxDoorUnlockOpen");	

	cbxUse.checked = false;
	cbxBellSound.checked = false;
	cbxDoorUnlockOpen.checked = false;

	// Name
	var Name = dsAcuPartitionOption.getRow(index).getValue("Name");		
	ipbPartitionName.text = Name.toString();	
	
	// Account
	var Account = dsAcuPartitionOption.getRow(index).getValue("Account");		
	ipbPartitionAccount.text = Account.toString();		
		
	// EntryDelay1
	var EntryDelay1 = dsAcuPartitionOption.getRow(index).getValue("EntryDelay1");		
	ipbPartitionEnterDelay1.text = EntryDelay1.toString();		
	
	// EntryDelay2
	var EntryDelay2 = dsAcuPartitionOption.getRow(index).getValue("EntryDelay2");		
	ipbPartitionEnterDelay2.text = EntryDelay2.toString();		
	
	// ExitDelay1
	var ExitDelay1 = dsAcuPartitionOption.getRow(index).getValue("ExitDelay1");		
	ipbPartitionExitDelay1.text = ExitDelay1.toString();	
	
	// ExitDelay2
	var ExitDelay2 = dsAcuPartitionOption.getRow(index).getValue("ExitDelay2");		
	ipbPartitionExitDelay2.text = ExitDelay2.toString();		
	
	// SirenTime
	var SirenTime = dsAcuPartitionOption.getRow(index).getValue("SirenTime");		
	ipbPartitionSirenTime.text = SirenTime.toString();	
	
	// AlarmCount
	var AlarmCount = dsAcuPartitionOption.getRow(index).getValue("AlarmCount");		
	ipbPartitionAlarmCount.text = AlarmCount.toString();
	
	
	var Enable = dsAcuPartitionOption.getRow(index).getValue("Enable");	
	var EnableInt = 0;
	EnableInt = parseInt(Enable);	
	if( EnableInt != 0 )
		cbxUse.checked = true;
		
	console.log("EnableInt: " + EnableInt);
		
	var Chime = dsAcuPartitionOption.getRow(index).getValue("Chime");		
	var ChimeInt = 0;
	ChimeInt = parseInt(Chime);		
	if( ChimeInt != 0 )
		cbxBellSound.checked = true;
		
	var UnlockOnDisarm = dsAcuPartitionOption.getRow(index).getValue("UnlockOnDisarm");	
	var UnlockOnDisarmInt = 0;
	UnlockOnDisarmInt = parseInt(UnlockOnDisarm);				
	if( UnlockOnDisarmInt != 0 )
		cbxDoorUnlockOpen.checked = true;		

}

function dsAcuPartitionOption_From_Screen(index) {
	
	var dsAcuPartitionOption = app.lookup("dsAcuPartitionOption");
	
	if( dsAcuPartitionOption.getRowCount() == 0 )
		return;


	var ipbPartitionName = app.lookup("ipbPartitionName");	
	var ipbPartitionAccount = app.lookup("ipbPartitionAccount");	
	var ipbPartitionEnterDelay1 = app.lookup("ipbPartitionEnterDelay1");	
	var ipbPartitionEnterDelay2 = app.lookup("ipbPartitionEnterDelay2");	
	var ipbPartitionExitDelay1 = app.lookup("ipbPartitionExitDelay1");	
	var ipbPartitionExitDelay2 = app.lookup("ipbPartitionExitDelay2");	
	var ipbPartitionSirenTime = app.lookup("ipbPartitionSirenTime");	
	var ipbPartitionAlarmCount = app.lookup("ipbPartitionAlarmCount");	
	
	var cbxUse = app.lookup("cbxUse");	
	var cbxBellSound = app.lookup("cbxBellSound");	
	var cbxDoorUnlockOpen = app.lookup("cbxDoorUnlockOpen");	


	// OpenTime
	//var ipbReaderOpenTime = app.lookup("ipbPartitionExitDelay1");					
	//dsAcuPartitionOption.getRow(index).setValue("OpenTime", ipbReaderOpenTime.text);	


	// Name
	dsAcuPartitionOption.getRow(index).setValue("Name", ipbPartitionName.text);		

	// Account
	dsAcuPartitionOption.getRow(index).setValue("Account", ipbPartitionAccount.text);	
		
	// EntryDelay1
	dsAcuPartitionOption.getRow(index).setValue("EntryDelay1", ipbPartitionEnterDelay1.text);	
	
	// EntryDelay2
	dsAcuPartitionOption.getRow(index).setValue("EntryDelay2", ipbPartitionEnterDelay2.text);	
	
	// ExitDelay1
	dsAcuPartitionOption.getRow(index).setValue("ExitDelay1", ipbPartitionExitDelay1.text);	
	
	// ExitDelay2
	dsAcuPartitionOption.getRow(index).setValue("ExitDelay2", ipbPartitionExitDelay2.text);	
		
	// SirenTime
	dsAcuPartitionOption.getRow(index).setValue("SirenTime", ipbPartitionSirenTime.text);	
	
	// AlarmCount
	dsAcuPartitionOption.getRow(index).setValue("AlarmCount", ipbPartitionAlarmCount.text);

	if( cbxUse.checked == true )
		dsAcuPartitionOption.getRow(index).setValue("Enable", 1);
	else 
		dsAcuPartitionOption.getRow(index).setValue("Enable", 0);
		
	if( cbxBellSound.checked == true )
		dsAcuPartitionOption.getRow(index).setValue("Chime", 1);
	else 
		dsAcuPartitionOption.getRow(index).setValue("Chime", 0);		
		
	if( cbxDoorUnlockOpen.checked == true )
		dsAcuPartitionOption.getRow(index).setValue("UnlockOnDisarm", 1);
	else 
		dsAcuPartitionOption.getRow(index).setValue("UnlockOnDisarm", 0);			
		
}





/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetAcuPartitionOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetAcuPartitionOption = e.control;

	dsAcuPartitionOption_To_Screen(0);		
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsPutAcuPartitionOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsPutAcuPartitionOption = e.control;
	
	console.log("onSmsPutAcuPartitionOptionSubmitDone");
	
	
	
	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("hideLoadMask");	
	
		
}


/*
 * 버튼(btnPartitionInfoSave)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnPartitionInfoSaveClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnPartitionInfoSave = e.control;
	
	var cmbSelectPartition = app.lookup("cmbSelectPartition");
	
	var idx_integer = 0;
	idx_integer = parseInt( cmbSelectPartition.value );
	dsAcuPartitionOption_From_Screen(idx_integer);

	/*
	var smsPutAcuPartitionOption = app.lookup("smsPutAcuPartitionOption");
	smsPutAcuPartitionOption.action = "/v1/acus/" + curTerminalID + "/option/partition";	
	smsPutAcuPartitionOption.send();	
	*/		
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmbSelectPartitionSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var cmbSelectPartition = e.control;
	
	var idx_integer = 0;
	idx_integer = parseInt( cmbSelectPartition.value );
	dsAcuPartitionOption_To_Screen(idx_integer);
	
}
