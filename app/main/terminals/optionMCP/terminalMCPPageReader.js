/************************************************
 * terminalMCPPageReader.js
 * Created at 2020. 8. 6. 오후 2:18:15.
 *
 * @author union
 ************************************************/
var comLib;			
var dataManager = cpr.core.Module.require("lib/DataManager");

var curTerminalID = 0;

var jsonContent = null;


exports.requestSaveData = function() {
	
	console.log("MCP Reader requestSaveData");
	
	var smsPutAcuReaderOption = app.lookup("smsPutAcuReaderOption");
	smsPutAcuReaderOption.action = "/v1/acus/" + curTerminalID.toString() + "/option/reader";	
	smsPutAcuReaderOption.send();	 		
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




	var cmbSelectReader = app.lookup("cmbSelectReader");
	cmbSelectReader.selectItem(0);
	
	var cmbLockOutHH = app.lookup("cmbLockOutHH");
	for(var i=0;i<24;i++)
	{
		cmbLockOutHH.addItem(new cpr.controls.Item(i.toString(),i.toString()));
	}
	cmbLockOutHH.selectItem(0);
	
	var cmbLockOutMM = app.lookup("cmbLockOutMM");
	for(var i=0;i<60;i++)
	{
		cmbLockOutMM.addItem(new cpr.controls.Item(i.toString(),i.toString()));
	}
	cmbLockOutMM.selectItem(0);
	
	var cmbLockOutSS = app.lookup("cmbLockOutSS");
	for(var i=0;i<60;i++)
	{
		cmbLockOutSS.addItem(new cpr.controls.Item(i.toString(),i.toString()));
	}
	cmbLockOutSS.selectItem(0);
	
	
	/*
	var cmbAntiPassbackEnterZone = app.lookup("cmbAntiPassbackEnterZone");
	cmbAntiPassbackEnterZone.addItem(new cpr.controls.Item(dataManager.getString("Str_Undesignated2"), dataManager.getString("Str_Undesignated2")));
	cmbAntiPassbackEnterZone.selectItem(0);
	
	var cmbAntiPassbackExitZone = app.lookup("cmbAntiPassbackExitZone");
	cmbAntiPassbackExitZone.addItem(new cpr.controls.Item(dataManager.getString("Str_Undesignated2"), dataManager.getString("Str_Undesignated2")));
	cmbAntiPassbackExitZone.selectItem(0);
	*/
	
	
	/*
	var smsGetAcuReaderOption = app.lookup("smsGetAcuReaderOption");
	smsGetAcuReaderOption.action = "/v1/acus/" + curTerminalID.toString() + "/option/reader";	
	smsGetAcuReaderOption.send();
	*/
	
	var smsGetAreas = app.lookup("sms_getAreas");
	smsGetAreas.send();	
	
		
	
}


/*
 * 버튼(btnReaderInfoSave)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnReaderInfoSaveClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnReaderInfoSave = e.control;
	
	/*
	var smsGetAcuReaderOption = app.lookup("smsGetAcuReaderOption");
	smsGetAcuReaderOption.action = "/v1/acus/40/option/reader";	
	smsGetAcuReaderOption.send();
	*/
	
	/*
	var smsGetAcuPartitionOption = app.lookup("smsGetAcuPartitionOption");
	smsGetAcuPartitionOption.action = "/v1/acus/40/option/partition";	
	smsGetAcuPartitionOption.send();	
	*/
	
	/*
	var smsGetAcuLockOption = app.lookup("smsGetAcuLockOption");
	smsGetAcuLockOption.action = "/v1/acus/40/option/lock";	
	smsGetAcuLockOption.send();	
	*/
	
	/*
	var smsGetAcuTerminalHolidayOption = app.lookup("smsGetAcuTerminalHolidayOption");
	smsGetAcuTerminalHolidayOption.action = "/v1/acus/40/option/holiday";	
	smsGetAcuTerminalHolidayOption.send();		
	*/
	
	/*
	var smsGetAcuAlarmScheduleOption = app.lookup("smsGetAcuAlarmScheduleOption");
	smsGetAcuAlarmScheduleOption.action = "/v1/acus/40/option/schedule";	
	smsGetAcuAlarmScheduleOption.send();	
	*/
	
	/*
	var smsGetAcuNetworkOption = app.lookup("smsGetAcuNetworkOption");
	smsGetAcuNetworkOption.action = "/v1/acus/40/option/network";	
	smsGetAcuNetworkOption.send();		
	*/	
	
	/*
	var smsGetAcuSystemOption = app.lookup("smsGetAcuSystemOption");
	smsGetAcuSystemOption.action = "/v1/acus/40/option/system";	
	smsGetAcuSystemOption.send();	
	*/		
	
	/*
	var sms = app.lookup("smsGetAcuZoneOption");
	sms.action = "/v1/acus/40/option/zone";	
	sms.send();		
	*/
	
	/*
	var sms = app.lookup("smsGetAcuInputsOption");
	sms.action = "/v1/acus/40/option/input";	
	sms.send();		
	*/
	
	/*
	var sms = app.lookup("smsGetAcuOutputsOption");
	sms.action = "/v1/acus/40/option/output";	
	sms.send();	
	*/			
	
	// 리더별 데이터 적용 ( 리더 미선택(-----) 시 alert )
	var cmbSelectReader = app.lookup("cmbSelectReader");
	if (cmbSelectReader.value == -1) {
		dialogAlert(app, dataManager.getString("Str_Failed"), "적용할 리더를 선택하세요"); 
	} else {	
	var idx_integer = 0;
	idx_integer = parseInt( cmbSelectReader.value );
	AcuReaderScreen_to_DataSet(idx_integer);
}
	/*
	var smsPutAcuReaderOption = app.lookup("smsPutAcuReaderOption");
	smsPutAcuReaderOption.action = "/v1/acus/40/option/reader";	
	smsPutAcuReaderOption.send();		
	*/
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsTestSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsTest = e.control;
	
}

function AcuReaderDataSet_To_Screen(index) {
	
	var dsAcuReaderOption = app.lookup("dsAcuReaderOption");
	console.log(dsAcuReaderOption);
	console.log("dsAcuReaderOption.getRowCount(): " + dsAcuReaderOption.getRowCount());
	
	if( dsAcuReaderOption.getRowCount() == 0 )
		return;
			
	var cmbReaderType = app.lookup("cmbReaderType");
	cmbReaderType.enabled = false;
	cmbReaderType.value = dsAcuReaderOption.getRow(index).getValue("ReaderType");
	
	
	
	
	var cbxReaderLock1 = app.lookup("cbxReaderLock1");
	var cbxReaderLock2 = app.lookup("cbxReaderLock2");
	var cbxReaderLock3 = app.lookup("cbxReaderLock3");
	var cbxReaderLock4 = app.lookup("cbxReaderLock4");
	
	cbxReaderLock1.checked = false;
	cbxReaderLock2.checked = false;
	cbxReaderLock3.checked = false;
	cbxReaderLock4.checked = false;
	
	var cbxReaderPartition1 = app.lookup("cbxReaderPartition1");
	var cbxReaderPartition2 = app.lookup("cbxReaderPartition2");
	var cbxReaderPartition3 = app.lookup("cbxReaderPartition3");
	var cbxReaderPartition4 = app.lookup("cbxReaderPartition4");
		
	cbxReaderPartition1.checked = false;
	cbxReaderPartition2.checked = false;
	cbxReaderPartition3.checked = false;
	cbxReaderPartition4.checked = false;	
	
	
	// partition bits upper/lock bits lower
	var a = dsAcuReaderOption.getRow(index).getValue("Lock");
	var b = [];
	
	var a_int = parseInt(a);
	
	console.log("a_int: " + a_int);
	
	for (var i = 0; i < 4; i++)
		b[i] = 0;		
	
	for (var i = 0; i < 4; i++)
	{
		b[i] = (a_int >> i) & 1;
		console.log("b idx: " + i + " value: " +  b[i]);
	}
		
		

	//reader.Lock = int32(lockArr[0]<<0 | lockArr[1]<<1 | lockArr[2]<<2 | lockArr[3]<<3)   
	
	
	
	if (b[0] == 1)
		cbxReaderLock1.checked = true;
	if (b[1] == 1)
		cbxReaderLock2.checked = true;	
	if (b[2] == 1)
		cbxReaderLock3.checked = true;		
	if (b[3] == 1)
		cbxReaderLock4.checked = true;	
		
	a = dsAcuReaderOption.getRow(index).getValue("Partition");
	a_int = parseInt(a);
	
	console.log("a_int: " + a_int);
			
	for (var i = 0; i < 4; i++)
		b[i] = 0;		
	
	for (var i = 0; i < 4; i++)
	{
		b[i] = (a_int >> i) & 1;
		console.log("b idx: " + i + " value: " +  b[i]);
	}		
		
	if (b[0] == 1)
		cbxReaderPartition1.checked = true;
	if (b[1] == 1)
		cbxReaderPartition2.checked = true;	
	if (b[2] == 1)
		cbxReaderPartition3.checked = true;		
	if (b[3] == 1)
		cbxReaderPartition4.checked = true;	
		
	// Mode
	var Mode = dsAcuReaderOption.getRow(index).getValue("Mode");		
	var cmbReaderMode = app.lookup("cmbReaderMode");
	cmbReaderMode.value = Mode;

	// OpenTime
	var OpenTime = dsAcuReaderOption.getRow(index).getValue("OpenTime");		
	var ipbReaderOpenTime = app.lookup("ipbReaderOpenTime");
	ipbReaderOpenTime.text = OpenTime.toString();		
					
			
	// AccessMode
	var AccessMode = dsAcuReaderOption.getRow(index).getValue("AccessMode");		
	var cmbReaderAccessMode = app.lookup("cmbReaderAccessMode");
	cmbReaderAccessMode.value = AccessMode;
		
	// PassbackType
	var PassbackType = dsAcuReaderOption.getRow(index).getValue("PassbackType");		
	var cmbAntiPassbackType = app.lookup("cmbAntiPassbackType");
	cmbAntiPassbackType.value = PassbackType;	
	
	var LockoutDuration = dsAcuReaderOption.getRow(index).getValue("LockoutDuration");	
	var LockoutDurations = LockoutDuration.split(':');	
	
	console.log(LockoutDurations);
	
	var cmbLockOutHH = app.lookup("cmbLockOutHH");
	cmbLockOutHH.value = parseInt(LockoutDurations[0]);
	
	var cmbLockOutMM = app.lookup("cmbLockOutMM");
	cmbLockOutMM.value = parseInt(LockoutDurations[1]);
	
	var cmbLockOutSS = app.lookup("cmbLockOutSS");
	cmbLockOutSS.value = parseInt(LockoutDurations[2]);
	
	
	var cmbAntiPassbackEnterZone = app.lookup("cmbAntiPassbackEnterZone");
	
	var findValue = 0;
	console.log("@@@ EnterZone: " + dsAcuReaderOption.getRow(index).getValue("EnterZone"));
	for(var i=0;i<cmbAntiPassbackEnterZone.getItemCount();i++)
	{
		console.log("cmbAntiPassbackEnterZone.value: " + cmbAntiPassbackEnterZone.value);
		
		if(cmbAntiPassbackEnterZone.getItem(i).value == dsAcuReaderOption.getRow(index).getValue("EnterZone"))
		{	
			cmbAntiPassbackEnterZone.value = dsAcuReaderOption.getRow(index).getValue("EnterZone");
			findValue = 1;
			break;
		}
	}
	
	if(findValue == 0)
		cmbAntiPassbackEnterZone.selectItem(0);
	
	
	
	var cmbAntiPassbackExitZone = app.lookup("cmbAntiPassbackExitZone");
	
	findValue = 0;
	console.log("@@@ ExitZone: " + dsAcuReaderOption.getRow(index).getValue("ExitZone"));
	for(var i=0;i<cmbAntiPassbackExitZone.getItemCount();i++)
	{
		console.log("cmbAntiPassbackExitZone.value: " + cmbAntiPassbackExitZone.value);
		
		if(cmbAntiPassbackExitZone.getItem(i).value == dsAcuReaderOption.getRow(index).getValue("ExitZone"))
		{	
			cmbAntiPassbackExitZone.value = dsAcuReaderOption.getRow(index).getValue("ExitZone");
			findValue = 1;
			break;
		}
	}
	
	if(findValue == 0)
		cmbAntiPassbackExitZone.selectItem(0);	
		
		
	cmbAntiPassbackEnterZone.redraw();	
	cmbAntiPassbackExitZone.redraw();
		
}

function AcuReaderScreen_to_DataSet(index) {
	
	console.log("AcuReaderScreen_to_DataSet index: " + index);	
	
	var dsAcuReaderOption = app.lookup("dsAcuReaderOption");
	
	if( dsAcuReaderOption.getRowCount() == 0 )
	{
		console.log("dsAcuReaderOption.getRowCount() == 0" );	
		return;
	}
		
		
			
	//var cmbReaderType = app.lookup("cmbReaderType");
	
	var cbxReaderLock1 = app.lookup("cbxReaderLock1");
	var cbxReaderLock2 = app.lookup("cbxReaderLock2");
	var cbxReaderLock3 = app.lookup("cbxReaderLock3");
	var cbxReaderLock4 = app.lookup("cbxReaderLock4");
	
	var cbxReaderPartition1 = app.lookup("cbxReaderPartition1");
	var cbxReaderPartition2 = app.lookup("cbxReaderPartition2");
	var cbxReaderPartition3 = app.lookup("cbxReaderPartition3");
	var cbxReaderPartition4 = app.lookup("cbxReaderPartition4");
		
	var a = 0;
	if(cbxReaderLock1.checked == true)
		a |= 1 << 0;
		
	if(cbxReaderLock2.checked == true)
		a |= 1 << 1;	

	if(cbxReaderLock3.checked == true)
		a |= 1 << 2;	
		
	if(cbxReaderLock4.checked == true)
		a |= 1 << 3;				
		
	console.log("Lock: " + a);
		
	dsAcuReaderOption.getRow(index).setValue("Lock", a);	
	
	
	
	a = 0;
	if(cbxReaderPartition1.checked == true)
		a |= 1 << 0;	
	
	if(cbxReaderPartition2.checked == true)
		a |= 1 << 1;		
		
	if(cbxReaderPartition3.checked == true)
		a |= 1 << 2;			
		
	if(cbxReaderPartition4.checked == true)
		a |= 1 << 3;	
		
	console.log("Partition: " + a);
		
	dsAcuReaderOption.getRow(index).setValue("Partition", a);		
		
		
		
	// Mode
	var cmbReaderMode = app.lookup("cmbReaderMode");
	dsAcuReaderOption.getRow(index).setValue("Mode", cmbReaderMode.value);	

	// OpenTime
	var ipbReaderOpenTime = app.lookup("ipbReaderOpenTime");					
	dsAcuReaderOption.getRow(index).setValue("OpenTime", ipbReaderOpenTime.text);	
			
	// AccessMode
	var cmbReaderAccessMode = app.lookup("cmbReaderAccessMode");
	dsAcuReaderOption.getRow(index).setValue("AccessMode", cmbReaderAccessMode.value);
		
	// PassbackType
	var cmbAntiPassbackType = app.lookup("cmbAntiPassbackType");
	dsAcuReaderOption.getRow(index).setValue("PassbackType", cmbAntiPassbackType.value);
		
	console.log("cmbAntiPassbackType.value: " + cmbAntiPassbackType.value);	
		
	var LockOutTime = ""
	var cmbLockOutHH = app.lookup("cmbLockOutHH");
	if( cmbLockOutHH.value.length == 1 )
		LockOutTime += "0" + cmbLockOutHH.value + ":";
	else 
		LockOutTime += cmbLockOutHH.value + ":";
	
	var cmbLockOutMM = app.lookup("cmbLockOutMM");
	if( cmbLockOutMM.value.length == 1 )
		LockOutTime += "0" + cmbLockOutMM.value + ":";
	else 
		LockOutTime += cmbLockOutMM.value + ":";
	
	var cmbLockOutSS = app.lookup("cmbLockOutSS");
	if( cmbLockOutSS.value.length == 1 )
		LockOutTime += "0" + cmbLockOutSS.value + ":";
	else 
		LockOutTime += cmbLockOutSS.value;	
	
	dsAcuReaderOption.getRow(index).setValue("LockoutDuration", LockOutTime);	
	
	
	
	var cmbAntiPassbackEnterZone = app.lookup("cmbAntiPassbackEnterZone");
	if (cmbAntiPassbackEnterZone.value == 0) 
		dsAcuReaderOption.getRow(index).setValue("EnterZone", 0);
	else 
		dsAcuReaderOption.getRow(index).setValue("EnterZone", cmbAntiPassbackEnterZone.value);

	var cmbAntiPassbackExitZone = app.lookup("cmbAntiPassbackExitZone");
	if (cmbAntiPassbackExitZone.value == 0) 
		dsAcuReaderOption.getRow(index).setValue("ExitZone", 0);
	else 
		dsAcuReaderOption.getRow(index).setValue("EnterZone", cmbAntiPassbackEnterZone.value);

	for( var ii = 0; ii < dsAcuReaderOption.getRowCount() ; ii ++ )
	{
		console.log(dsAcuReaderOption.getRowData(ii));
	}
		
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetAcuReaderOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetAcuReaderOption = e.control;
	
	console.log( "onSmsGetAcuReaderOptionSubmitDone");
	
	var dsAcuReaderOption = app.lookup("dsAcuReaderOption");
	console.log(dsAcuReaderOption);
	console.log("dsAcuReaderOption.getRowCount(): " + dsAcuReaderOption.getRowCount());
	
	if( dsAcuReaderOption.getRowCount() == 0 )
		return;
	
	for( var ii = 0; ii < dsAcuReaderOption.getRowCount() ; ii ++ )
	{
		console.log(dsAcuReaderOption.getRowData(ii));
	}
		
	AcuReaderDataSet_To_Screen(0);
	
	
	
	
}

	
/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsPutAcuReaderOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsPutAcuReaderOption = e.control;
	
	console.log( "onSmsPutAcuReaderOptionSubmitDone");

	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("hideLoadMask");			
}

/*
 * 아웃풋에서 dblclick 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 더블 클릭할 때 발생하는 이벤트.
 */
function onOutputDblclick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var output = e.control;
	
	/*
	var ipbReaderOpenTime = app.lookup("ipbReaderOpenTime");
	
	var dsAcuReaderOption = app.lookup("dsAcuReaderOption");
	
	dsAcuReaderOption.getRow(0).setValue("EnterZone", ipbReaderOpenTime.text);

	var smsPutAcuReaderOption = app.lookup("smsPutAcuReaderOption");
	smsPutAcuReaderOption.action = "/v1/acus/40/option/reader";	
	smsPutAcuReaderOption.send();	
	*/
	
	/*
	var dsAcuPartitionOption = app.lookup("dsAcuPartitionOption");
	
	dsAcuPartitionOption.getRow(0).setValue("AlarmCount", 7);

	var smsPutAcuPartitionOption = app.lookup("smsPutAcuPartitionOption");
	smsPutAcuPartitionOption.action = "/v1/acus/40/option/partition";	
	smsPutAcuPartitionOption.send();	
	*/
	

	/*
	var smsPutAcuLockOption = app.lookup("smsPutAcuLockOption");
	smsPutAcuLockOption.action = "/v1/acus/40/option/lock";	

	jsonContent.MsgTerminalLockOption[0].Locks[0].Lock1.StartHour = 111;
	
	smsPutAcuLockOption.setRequestObject(jsonContent.MsgTerminalLockOption);
	smsPutAcuLockOption.send();	
	*/			
	
	/*
	var smsPutAcuTerminalHolidayOption = app.lookup("smsPutAcuTerminalHolidayOption");
	smsPutAcuTerminalHolidayOption.action = "/v1/acus/40/option/holiday";	

	jsonContent.MsgTerminalHolidayOption.Holidays[0].Month = 11;
	
	smsPutAcuTerminalHolidayOption.setRequestObject(jsonContent.MsgTerminalHolidayOption);
	smsPutAcuTerminalHolidayOption.send();	
	*/
	
	/*
	var smsPutAcuAlarmScheduleOption = app.lookup("smsPutAcuAlarmScheduleOption");
	smsPutAcuAlarmScheduleOption.action = "/v1/acus/40/option/schedule";	

	smsPutAcuAlarmScheduleOption.setRequestObject(jsonContent.MsgAcuAlarmScheduleOption);
	smsPutAcuAlarmScheduleOption.send();		
	*/					
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
	
	console.log( "onSmsGetAcuPartitionOptionSubmitDone");
	
	var dsAcuPartitionOption = app.lookup("dsAcuPartitionOption");
	
	console.log(dsAcuPartitionOption);
	
	console.log("dsAcuParitionOption.getRowCount(): " + dsAcuPartitionOption.getRowCount());
	
	for( var ii = 0; ii < dsAcuPartitionOption.getRowCount() ; ii ++ )
	{
		console.log(dsAcuPartitionOption.getRowData(ii));
	}	
	
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
	
	console.log( "onSmsPutAcuPartitionOptionSubmitDone");
	
	var Result = app.lookup("Result");
	
	console.log(Result);
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
	
	console.log( "onSmsGetAcuLockOptionSubmitDone");
	
	//console.log(smsGetAcuLockOption.xhr.responseText);
	
	jsonContent = JSON.parse(smsGetAcuLockOption.xhr.responseText);
	
	console.log(jsonContent.Result.ResultCode);
	
	console.log(jsonContent.MsgTerminalLockOption);
	
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
	console.log( "onSmsPutAcuLockOptionSubmitDone");
	
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
	
	console.log(jsonContent.Result.ResultCode);
	
	console.log(jsonContent.MsgTerminalHoliday);	
	
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
	console.log( "onSmsPutAcuTerminalHolidayOptionSubmitDone");

	var Result = app.lookup("Result");
	
	console.log(Result);	
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetAcuAlarmScheduleOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetAcuAlarmScheduleOption = e.control;
	
	console.log( "onSmsGetAcuTerminalHolidayOptionSubmitDone");
	
	jsonContent = JSON.parse(smsGetAcuAlarmScheduleOption.xhr.responseText);
	
	console.log(jsonContent.Result.ResultCode);
	
	console.log(jsonContent.MsgAcuAlarmScheduleOption);		
	
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsPutAcuAlarmScheduleOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsPutAcuAlarmScheduleOption = e.control;
		
	console.log( "onSmsPutAcuAlarmScheduleOptionSubmitDone");
	
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
	console.log( "onSmsGetAcuSystemOptionSubmitDone");
	
	var dmAcuSystemOption = app.lookup("dmAcuSystemOption");
	console.log( dmAcuSystemOption.getDatas());	
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
	
	
	console.log( "onSmsGetAcuZoneOptionSubmitDone");
	
	var dsAcuZoneOption = app.lookup("dsAcuZoneOption");
	console.log( dsAcuZoneOption.getRowData(0));	
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
	
	console.log( "onSmsGetAcuInputsOptionSubmitDone");
	
	var dsAcuInputsOption = app.lookup("dsAcuInputsOption");
	console.log( dsAcuInputsOption.getRowData(0));	
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
	
	console.log( "onSmsGetAcuOutputsOptionSubmitDone");
	
	var dsAcuOutputsOption = app.lookup("dsAcuOutputsOption");
	console.log( dsAcuOutputsOption.getRowData(0));		
}


/*
 * "Test1" 버튼(btnTest1)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnTest1Click(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnTest1 = e.control;
	
	var dmAcuDoorControl = app.lookup("dmAcuDoorControl");
	
	/*
	int32 AcuID = 2;	
	int32 Option = 3; 	// 0:Open, 1:Unlock, 2:lock, 3:Arm, 4:Disarm, 5:PGM Output	
	int32 Door = 4;	// Door ID
	*/
	
	dmAcuDoorControl.setValue("AcuID", 40);	
	dmAcuDoorControl.setValue("Option", 3);	
	dmAcuDoorControl.setValue("Door", 1);	
	
	var smsPostAcuDoorControl = app.lookup("smsPostAcuDoorControl");
	smsPostAcuDoorControl.action = "/v1/acus/40/control/door";	
	smsPostAcuDoorControl.send();
	
}


/*
 * "Test2" 버튼(btnTest2)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnTest2Click(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnTest2 = e.control;
	
	
	var dmAcuDoorControl = app.lookup("dmAcuDoorControl");
	
	/*
	int32 AcuID = 2;	
	int32 Option = 3; 	// 0:Open, 1:Unlock, 2:lock, 3:Arm, 4:Disarm, 5:PGM Output	
	int32 Door = 4;	// Door ID
	*/
	
	dmAcuDoorControl.setValue("AcuID", 40);	
	dmAcuDoorControl.setValue("Option", 4);	
	dmAcuDoorControl.setValue("Door", 1);	
	
	var smsPostAcuDoorControl = app.lookup("smsPostAcuDoorControl");
	smsPostAcuDoorControl.action = "/v1/acus/40/control/door";	
	smsPostAcuDoorControl.send();	
}


/*
 * "Test3" 버튼(btnTest3)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnTest3Click(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnTest3 = e.control;
	
	/*
	int32 AcuID = 2;	
	int32 Option = 3; 	// 0:Open, 1:Unlock, 2:lock, 3:Arm, 4:Disarm, 5:PGM Output	
	int32 Door = 4;	// Door ID
	*/
	var dmAcuDoorControl = app.lookup("dmAcuDoorControl");
	
	dmAcuDoorControl.setValue("AcuID", 40);	
	dmAcuDoorControl.setValue("Option", 2);	
	dmAcuDoorControl.setValue("Door", 1);	
	
	var smsPostAcuDoorControl = app.lookup("smsPostAcuDoorControl");
	smsPostAcuDoorControl.action = "/v1/acus/40/control/door";	
	smsPostAcuDoorControl.send();	
	
}
/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsPostAcuDoorControlSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsPostAcuDoorControl = e.control;
	console.log( "onSmsPostAcuDoorControlSubmitDone");
}




/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmbSelectReaderSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var cmbSelectReader = e.control;
	
	console.log("onCmbSelectReaderSelectionChange");
	console.log("cmbSelectReader.value: " + cmbSelectReader.value);
	
	var idx_integer = 0;
	idx_integer = parseInt( cmbSelectReader.value );
	AcuReaderDataSet_To_Screen(idx_integer);

}


/*
 * 인풋 박스에서 change 이벤트 발생 시 호출.
 * 값이 변경 되었을때 발생하는 DOM 이벤트.
 */
function onIpbReaderOpenTimeChange(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var ipbReaderOpenTime = e.control;
	
	var integer = parseInt( ipbReaderOpenTime.text );
	
	if ( integer > 255)
		integer = 255;
	
	if ( integer < 0)
		integer = 0;	
		
	ipbReaderOpenTime.text = integer.toString();	
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getAreasSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getAreas = e.control;

	var AreaList = app.lookup("AreaList");

	var cmbAntiPassbackEnterZone = app.lookup("cmbAntiPassbackEnterZone");
	var cmbAntiPassbackExitZone = app.lookup("cmbAntiPassbackExitZone");
	
	cmbAntiPassbackEnterZone.deleteAllItems();
	cmbAntiPassbackExitZone.deleteAllItems();
	
	cmbAntiPassbackEnterZone.addItem(new cpr.controls.Item(dataManager.getString("Str_Undesignated2"), dataManager.getString("Str_Undesignated2")));
	cmbAntiPassbackExitZone.addItem(new cpr.controls.Item(dataManager.getString("Str_Undesignated2"), dataManager.getString("Str_Undesignated2")));
	
	for(var ii=0;ii<AreaList.getRowCount();ii++) {
		
		console.log("AreaList Name:" + AreaList.getRow(ii).getValue("Name"));
		console.log("AreaList AreaID:" + AreaList.getRow(ii).getValue("AreaID"));
		
		cmbAntiPassbackEnterZone.addItem(new cpr.controls.Item(AreaList.getRow(ii).getValue("Name"), AreaList.getRow(ii).getValue("AreaID")));
		cmbAntiPassbackExitZone.addItem(new cpr.controls.Item(AreaList.getRow(ii).getValue("Name"), AreaList.getRow(ii).getValue("AreaID")));
	}
	
	cmbAntiPassbackEnterZone.selectItem(0);
	cmbAntiPassbackExitZone.selectItem(0);	
	
	
	
	
	var smsGetAcuReaderOption = app.lookup("smsGetAcuReaderOption");
	smsGetAcuReaderOption.action = "/v1/acus/" + curTerminalID.toString() + "/option/reader";	
	smsGetAcuReaderOption.send();
			
}
