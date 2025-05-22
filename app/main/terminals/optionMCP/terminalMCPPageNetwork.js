/************************************************
 * terminalMCPPageNetwork.js
 * Created at 2020. 8. 7. 오후 2:23:45.
 *
 * @author union
 ************************************************/

var comLib;			
var dataManager = cpr.core.Module.require("lib/DataManager");


var curTerminalID = 40;


exports.requestSaveData = function() {
	
	console.log("MCP Network requestSaveData");
	
	var smsPutAcuNetworkOption = app.lookup("smsPutAcuNetworkOption");
	smsPutAcuNetworkOption.action = "/v1/acus/" + curTerminalID.toString() + "/option/network";	
	smsPutAcuNetworkOption.send();				
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

	
	
	var smsGetAcuNetworkOption = app.lookup("smsGetAcuNetworkOption");
	smsGetAcuNetworkOption.action = "/v1/acus/" + curTerminalID.toString() + "/option/network";	
	smsGetAcuNetworkOption.send();	
	
}



function dmAcuNetworkOption_To_Screen() {
	
	var dmAcuNetworkOption = app.lookup("dmAcuNetworkOption");
	console.log(dmAcuNetworkOption.getDatas());

	var ipbIP = app.lookup("ipbIP");	
	var ipbSubnet = app.lookup("ipbSubnet");	
	var ipbGateway = app.lookup("ipbGateway");	
	var ipbServerIP = app.lookup("ipbServerIP");	
	var ipbServerPort = app.lookup("ipbServerPort");	
	var rdbDHCP = app.lookup("rdbDHCP");	

	// NetType
	var NetType = dmAcuNetworkOption.getValue("NetType");		
	if (NetType == 0) // static
	{
		rdbDHCP.value = 1;
		
		ipbIP.enabled = true;
		ipbSubnet.enabled = true;
		ipbGateway.enabled = true;
	}
	else // dhcp
	{
		rdbDHCP.value = 0;
		
		ipbIP.enabled = false;
		ipbSubnet.enabled = false;
		ipbGateway.enabled = false;		
	}
	
	var value = dmAcuNetworkOption.getValue("IP");	
	ipbIP.text = value;	

	value = dmAcuNetworkOption.getValue("Subnet");	
	ipbSubnet.text = value;		
	
	value = dmAcuNetworkOption.getValue("Gateway");	
	ipbGateway.text = value;	
	
	value = dmAcuNetworkOption.getValue("ServerIP");	
	ipbServerIP.text = value;		
	
	value = dmAcuNetworkOption.getValue("ServerPort");	
	ipbServerPort.text = value;					
}

function dmAcuNetworkOption_From_Screen() {
	
	var dmAcuNetworkOption = app.lookup("dmAcuNetworkOption");
	
	var ipbIP = app.lookup("ipbIP");	
	var ipbSubnet = app.lookup("ipbSubnet");	
	var ipbGateway = app.lookup("ipbGateway");	
	var ipbServerIP = app.lookup("ipbServerIP");	
	var ipbServerPort = app.lookup("ipbServerPort");	
	var rdbDHCP = app.lookup("rdbDHCP");	
	
	if(rdbDHCP.value == 1) // static
		dmAcuNetworkOption.setValue("NetType", 0);	
	else 
		dmAcuNetworkOption.setValue("NetType", 1);	
	
	dmAcuNetworkOption.setValue("IP", ipbIP.text);	
	dmAcuNetworkOption.setValue("Subnet", ipbSubnet.text);	
	dmAcuNetworkOption.setValue("Gateway", ipbGateway.text);	
	dmAcuNetworkOption.setValue("ServerIP", ipbServerIP.text);	
	dmAcuNetworkOption.setValue("ServerPort", ipbServerPort.text);	
}









/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetAcuNetworkOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetAcuNetworkOption = e.control;
	console.log( "onSmsGetAcuNetworkOptionSubmitDone");
	
	var dmAcuNetworkOption = app.lookup("dmAcuNetworkOption");
	console.log( dmAcuNetworkOption.getDatas());	
	
	dmAcuNetworkOption_To_Screen();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsPutAcuNetworkOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsPutAcuNetworkOption = e.control;
	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("hideLoadMask");			
}


/*
 * 라디오 버튼에서 selection-change 이벤트 발생 시 호출.
 * 라디오버튼 아이템을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onRdbDHCPSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.RadioButton
	 */
	var rdbDHCP = e.control;

	var ipbIP = app.lookup("ipbIP");	
	var ipbSubnet = app.lookup("ipbSubnet");	
	var ipbGateway = app.lookup("ipbGateway");	
	var ipbServerIP = app.lookup("ipbServerIP");	
	var ipbServerPort = app.lookup("ipbServerPort");	
	
	if (rdbDHCP.value == 1) // static
	{
		ipbIP.enabled = true;
		ipbSubnet.enabled = true;
		ipbGateway.enabled = true;
	}
	else // dhcp
	{
		ipbIP.enabled = false;
		ipbSubnet.enabled = false;
		ipbGateway.enabled = false;		
	}
	
}


/*
 * 버튼(btnSave)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnSaveClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnSave = e.control;
	dmAcuNetworkOption_From_Screen();
	
	/*
	var smsPutAcuNetworkOption = app.lookup("smsPutAcuNetworkOption");
	smsPutAcuNetworkOption.action = "/v1/acus/" + curTerminalID.toString() + "/option/network";	
	smsPutAcuNetworkOption.send();
	*/		
}
