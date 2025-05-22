/************************************************
 * AcuDetailStatus.js
 * Created at 2020. 8. 7. 오후 3:08:51.
 *
 * @author union
 ************************************************/

var comLib;			
var dataManager = cpr.core.Module.require("lib/DataManager");

var curTerminalID = 0;

var jsonContent = null;



/*
 * "Acu Web Setting " 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
	
	var TerminalInfo = app.lookup("TerminalInfo");
	
	var IPAddress = TerminalInfo.getValue("IPAddress");
	
	console.log(IPAddress);
	
	var res = IPAddress.split('.');
	
	var ip1=parseInt(res[0]);
	var ip2=parseInt(res[1]);
	var ip3=parseInt(res[2]);
	var ip4=parseInt(res[3]);
	
	var IPAddress = ip1.toString() + "." + ip2.toString() + "." + ip3.toString() + "." + ip4.toString();
	
	window.open("http://" + IPAddress + "/");
	
	
}


/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	dataManager = getDataManager();

	var initValue = app.getHost().initValue;

	var curTerminalID_Str = initValue["TerminalID"];
	
	console.log("curTerminalID_Str: " + curTerminalID_Str);

	curTerminalID = parseInt(curTerminalID_Str);
	//var hostApp = app.getHostAppInstance();
	//curTerminalID = hostApp.callAppMethod("getCurTerminalID");	


	var requestData = app.lookup("sms_get_terminal_info");

	requestData.action = requestData.action + "/" + curTerminalID.toString();
	requestData.setParameters("apbflag", false);
	requestData.setParameters("imageflag", false);
	requestData.send();	

	

}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetAcuStatusSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetAcuStatus = e.control;
	
	console.log("onSmsGetAcuStatusSubmitDone");
	
	var dmAcuStatus = app.lookup("dmAcuStatus");
	console.log(dmAcuStatus.getDatas());
	
	/*
	szPartition := fmt.Sprintf("%d%d%d%d", acuState.Partition[0], acuState.Partition[1], acuState.Partition[2], acuState.Partition[3])
	szZone := fmt.Sprintf("%d%d%d%d%d%d%d%d", acuState.Zone[0], acuState.Zone[1], acuState.Zone[2], acuState.Zone[3], acuState.Zone[4], acuState.Zone[5], acuState.Zone[6], acuState.Zone[7])
	szLock := fmt.Sprintf("%d%d%d%d", acuState.Lock[0], acuState.Lock[1], acuState.Lock[2], acuState.Lock[3])
	szReader := fmt.Sprintf("%d%d%d%d%d%d%d%d", acuState.Reader[0], acuState.Reader[1], acuState.Reader[2], acuState.Reader[3], acuState.Reader[4], acuState.Reader[5], acuState.Reader[6], acuState.Reader[7])
	//szReaderVer := make(byte[ucpacket.MAX_VIRDI_ACU_READER][10], 10)
	var szReaderVer [ucpacket.MAX_VIRDI_ACU_READER]string

	 */
	 
	 
	
	//**********************
	// Partition	
	var szPartition = dmAcuStatus.getValue("Partition");
	
	
	var btnPartition1 = app.lookup("btnPartition1");
	if(szPartition[0] == "0")
		btnPartition1.text = dataManager.getString("Str_MCPSettingDisalarm");
	else if(szPartition[0] == "1")
		btnPartition1.text = dataManager.getString("Str_MCPSettingAlarm");
	else if(szPartition[0] == "2")
		btnPartition1.text = dataManager.getString("Str_AlarmText");
	else 			
		btnPartition1.text = dataManager.getString("Str_NotUsed");
	
	
	var btnPartition2 = app.lookup("btnPartition2");
	if(szPartition[1] == "0")
		btnPartition2.text = dataManager.getString("Str_MCPSettingDisalarm");
	else if(szPartition[1] == "1")
		btnPartition2.text = dataManager.getString("Str_MCPSettingAlarm");
	else if(szPartition[1] == "2")
		btnPartition2.text = dataManager.getString("Str_AlarmText");
	else 			
		btnPartition2.text = dataManager.getString("Str_NotUsed");	
	
	
	var btnPartition3 = app.lookup("btnPartition3");
	if(szPartition[2] == "0")
		btnPartition3.text = dataManager.getString("Str_MCPSettingDisalarm");
	else if(szPartition[2] == "1")
		btnPartition3.text = dataManager.getString("Str_MCPSettingAlarm");
	else if(szPartition[2] == "2")
		btnPartition3.text = dataManager.getString("Str_AlarmText");
	else 			
		btnPartition3.text = dataManager.getString("Str_NotUsed");	
				
	
	var btnPartition4 = app.lookup("btnPartition4");
	if(szPartition[3] == "0")
		btnPartition4.text = dataManager.getString("Str_MCPSettingDisalarm");
	else if(szPartition[3] == "1")
		btnPartition4.text = dataManager.getString("Str_MCPSettingAlarm");
	else if(szPartition[3] == "2")
		btnPartition4.text = dataManager.getString("Str_AlarmText");
	else 			
		btnPartition4.text = dataManager.getString("Str_NotUsed");	
	
	
	
	
	//**********************
	// Zone
	var szZone = dmAcuStatus.getValue("Zone");
		
	var btnZone1 = app.lookup("btnZone1");
	if(szZone[0] == "0")
		btnZone1.text = "Normal";
	else if(szZone[0] == "1")
		btnZone1.text = "Open";
	else if(szZone[0] == "2")
		btnZone1.text = "Trouble";
	else 			
		btnZone1.text = "Not Used";
	
		
		
	var btnZone2 = app.lookup("btnZone2");
	if(szZone[1] == "0")
		btnZone2.text = "Normal";
	else if(szZone[1] == "1")
		btnZone2.text = "Open";
	else if(szZone[1] == "2")
		btnZone2.text = "Trouble";
	else 			
		btnZone2.text = "Not Used";
	
		
	var btnZone3 = app.lookup("btnZone3");
	if(szZone[2] == "0")
		btnZone3.text = "Normal";
	else if(szZone[2] == "1")
		btnZone3.text = "Open";
	else if(szZone[2] == "2")
		btnZone3.text = "Trouble";
	else 			
		btnZone3.text = "Not Used";
	
		
	var btnZone4 = app.lookup("btnZone4");
	if(szZone[3] == "0")
		btnZone4.text = "Normal";
	else if(szZone[3] == "1")
		btnZone4.text = "Open";
	else if(szZone[3] == "2")
		btnZone4.text = "Trouble";
	else 			
		btnZone4.text = "Not Used";
	
		
	var btnZone5 = app.lookup("btnZone5");
	if(szZone[4] == "0")
		btnZone5.text = "Normal";
	else if(szZone[4] == "1")
		btnZone5.text = "Open";
	else if(szZone[4] == "2")
		btnZone5.text = "Trouble";
	else 			
		btnZone5.text = "Not Used";
												
		
	var btnZone6 = app.lookup("btnZone6");
	if(szZone[5] == "0")
		btnZone6.text = "Normal";
	else if(szZone[5] == "1")
		btnZone6.text = "Open";
	else if(szZone[5] == "2")
		btnZone6.text = "Trouble";
	else 			
		btnZone6.text = "Not Used";
												
		
	var btnZone7 = app.lookup("btnZone7");
	if(szZone[6] == "0")
		btnZone7.text = "Normal";
	else if(szZone[6] == "1")
		btnZone7.text = "Open";
	else if(szZone[6] == "2")
		btnZone7.text = "Trouble";
	else 			
		btnZone7.text = "Not Used";
					
					
		
	var btnZone8 = app.lookup("btnZone8");
	if(szZone[7] == "0")
		btnZone8.text = "Normal";
	else if(szZone[7] == "1")
		btnZone8.text = "Open";
	else if(szZone[7] == "2")
		btnZone8.text = "Trouble";
	else 			
		btnZone8.text = "Not Used";
	
	
		

	//**********************
	// Lock	
	var szLock = dmAcuStatus.getValue("Lock");
	
	var btnLock1 = app.lookup("btnLock1");
	if(szLock[0] == "0")
		btnLock1.text = "Close";
	else if(szLock[0] == "1")
		btnLock1.text = "Open"
	else 			
		btnLock1.text = "Not Used";
	
	
	var btnLock2 = app.lookup("btnLock2");
	if(szLock[1] == "0")
		btnLock2.text = "Close";
	else if(szLock[1] == "1")
		btnLock2.text = "Open"
	else 			
		btnLock2.text = "Not Used";
	
		
	
	var btnLock3 = app.lookup("btnLock3");
	if(szLock[2] == "0")
		btnLock3.text = "Close";
	else if(szLock[2] == "1")
		btnLock3.text = "Open"
	else 			
		btnLock3.text = "Not Used";
	
	
	var btnLock4 = app.lookup("btnLock4");
	if(szLock[3] == "0")
		btnLock4.text = "Close";
	else if(szLock[3] == "1")
		btnLock4.text = "Open"
	else 			
		btnLock4.text = "Not Used";
	
				
		
		

	//**********************
	// Reader
	var szReader = dmAcuStatus.getValue("Reader");
	
	for (var ii=0;ii<8;ii++)
	{
		var btnReader = null;
		
		btnReader = app.lookup("btnReader" + ii.toString());
	
		console.log(btnReader);
		console.log("szReader[ii]: " + szReader[ii]);

		var intReader = 0;
		intReader = parseInt( szReader[ii] );
		
		console.log("intReader: " + intReader);
		
		if(intReader == 0)
			btnReader.text = "OK";
		else if(intReader == 1)
			btnReader.text = "ERROR"
		else 			
			btnReader.text = "Not Used";			
	}
					
}

function GetAcuStatusTimer() {
	var smsGetAcuStatus = app.lookup("smsGetAcuStatus");
	smsGetAcuStatus.action = "/v1/acus/" + curTerminalID.toString() + "/status";	
	smsGetAcuStatus.send(); 
}
/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_get_terminal_infoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_get_terminal_info = e.control;
	
	var smsGetAcuStatus = app.lookup("smsGetAcuStatus");
	smsGetAcuStatus.action = "/v1/acus/" + curTerminalID.toString() + "/status";	
	smsGetAcuStatus.send();
	
	setInterval(GetAcuStatusTimer, 10000);
}
