/************************************************
 * terminalMCPPageSchedule.js
 * Created at 2020. 8. 7. 오후 5:41:13.
 *
 * @author union
 ************************************************/


var comLib;			
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;


var curTerminalID = 0;

var jsonContent = null;

var uint8Array = null; // for file export or import


exports.requestSaveData = function() {
	
	console.log("MCP Schedule requestSaveData curTerminalID: " + curTerminalID.toString());
	
	var smsPutAcuAlarmScheduleOption = app.lookup("smsPutAcuAlarmScheduleOption");

	smsPutAcuAlarmScheduleOption.action = "/v1/acus/" + curTerminalID.toString() + "/option/schedule";	
	smsPutAcuAlarmScheduleOption.setRequestObject(jsonContent.MsgAcuAlarmScheduleOption);
	smsPutAcuAlarmScheduleOption.send();			
}
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var initValue = app.getHost().initValue;



	var hostApp = app.getHostAppInstance();
	curTerminalID = hostApp.callAppMethod("getCurTerminalID");	



	/*
	var cmbSelectOutput = app.lookup("cmbSelectOutput");	
	for(var i=0;i<8;i++)
	{
		cmbSelectOutput.addItem(new cpr.controls.Item(( i+1).toString(),i.toString()));
	}
	cmbSelectOutput.selectItem(0);
	*/
	
	
	var cmbAlarmHour = app.lookup("cmbAlarmHour");
	for(var i=0;i<24;i++)
	{
		if((i).toString().length == 1)
			cmbAlarmHour.addItem(new cpr.controls.Item("0" + (i).toString(),i.toString()));
		else
			cmbAlarmHour.addItem(new cpr.controls.Item((i).toString(),i.toString()));
	}
	cmbAlarmHour.selectItem(0);
	
	
	var cmbAlarmMinute = app.lookup("cmbAlarmMinute");
	for(var i=0;i<60;i++)
	{
		if((i).toString().length == 1)
			cmbAlarmMinute.addItem(new cpr.controls.Item("0" + (i).toString(),i.toString()));
		else
			cmbAlarmMinute.addItem(new cpr.controls.Item((i).toString(),i.toString()));
	}
	cmbAlarmMinute.selectItem(0);	
	
	var cmbDuration = app.lookup("cmbDuration");
	for(var i=0;i<25;i++)
	{
		if((i).toString().length == 1)
			cmbDuration.addItem(new cpr.controls.Item("0" + (i).toString(),i.toString()));
		else
			cmbDuration.addItem(new cpr.controls.Item((i).toString(),i.toString()));
	}
	cmbDuration.selectItem(0);	
	
	
	
	var cmbSetup = app.lookup("cmbSetup");
	var ii=0;
	cmbSetup.addItem(new cpr.controls.Item( dataManager.getString("Str_EveryDay"), ii++));
	cmbSetup.addItem(new cpr.controls.Item( dataManager.getString("Str_MondayToFriday"), ii++));
	cmbSetup.addItem(new cpr.controls.Item( dataManager.getString("Str_MondayToSaturday"), ii++));
	cmbSetup.addItem(new cpr.controls.Item( dataManager.getString("Str_SaturDay") + "~"+  dataManager.getString("Str_SunDay"), ii++));
	cmbSetup.addItem(new cpr.controls.Item( dataManager.getString("Str_Release"), ii++));
	cmbSetup.selectItem(0);	
	
	var smsGetAcuAlarmScheduleOption = app.lookup("smsGetAcuAlarmScheduleOption");
	smsGetAcuAlarmScheduleOption.action = "/v1/acus/"+curTerminalID.toString()+"/option/schedule";	
	smsGetAcuAlarmScheduleOption.send();				
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
	
	console.log( "onSmsGetAcuAlarmScheduleOptionSubmitDone");
	
	jsonContent = JSON.parse(smsGetAcuAlarmScheduleOption.xhr.responseText);
	
	console.log(jsonContent.Result.ResultCode);
	
	console.log(jsonContent);	
	
	console.log(jsonContent.MsgAcuAlarmScheduleOption);	
	
	
	if( jsonContent.MsgAcuAlarmScheduleOption.Alarms == null )
		return;
		
	var dsSchedule = app.lookup("dsSchedule");
	dsSchedule.clear();
	

	
	for (var ii=0;ii<jsonContent.MsgAcuAlarmScheduleOption.Alarms.length;ii++)
	{
		var row = dsSchedule.addRow();
		var AlarmTime = jsonContent.MsgAcuAlarmScheduleOption.Alarms[ii].Hour.toString() + ":" +
		 jsonContent.MsgAcuAlarmScheduleOption.Alarms[ii].Minute.toString();
		row.setValue("AlarmTime", AlarmTime);
		
		var Duration = jsonContent.MsgAcuAlarmScheduleOption.Alarms[ii].Duration;
		row.setValue("Duration", Duration);	
		
		var Contents = "";
		row.setValue("Contents", Contents);	
	}
	
	
	var grdSchedule = app.lookup("grdSchedule");
	grdSchedule.redraw();
	
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
	
	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("hideLoadMask");		
	
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmbSetupSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var cmbSetup = e.control;
	
	var cbxWeek0 = app.lookup("cbxWeek0"); // 일요일 
	var cbxWeek1 = app.lookup("cbxWeek1"); // 월
	var cbxWeek2 = app.lookup("cbxWeek2"); // 화
	var cbxWeek3 = app.lookup("cbxWeek3"); // 수
	var cbxWeek4 = app.lookup("cbxWeek4"); // 목
	var cbxWeek5 = app.lookup("cbxWeek5"); // 금
	var cbxWeek6 = app.lookup("cbxWeek6"); // 토

	cbxWeek0.checked = false;
	cbxWeek1.checked = false;
	cbxWeek2.checked = false;
	cbxWeek3.checked = false;
	cbxWeek4.checked = false;
	cbxWeek5.checked = false;
	cbxWeek6.checked = false;	
	
	if(cmbSetup.value == 0) // 매일 
	{
		cbxWeek0.checked = true;
		cbxWeek1.checked = true;
		cbxWeek2.checked = true;
		cbxWeek3.checked = true;
		cbxWeek4.checked = true;
		cbxWeek5.checked = true;
		cbxWeek6.checked = true;
	}
	else if(cmbSetup.value == 1) // 월요일 ~ 금요일
	{
		cbxWeek1.checked = true;
		cbxWeek2.checked = true;
		cbxWeek3.checked = true;
		cbxWeek4.checked = true;
		cbxWeek5.checked = true;
	}
	else if(cmbSetup.value == 2) // 월요일 ~ 토요일
	{
		cbxWeek1.checked = true;
		cbxWeek2.checked = true;
		cbxWeek3.checked = true;
		cbxWeek4.checked = true;
		cbxWeek5.checked = true;
		cbxWeek6.checked = true;
	}		
	else if(cmbSetup.value == 3) // 토요일 일요일
	{
		cbxWeek0.checked = true;
		cbxWeek6.checked = true;
	}	
	else if(cmbSetup.value == 4) // 해제
	{
		
	}				
}



/*
 * 버튼(btnImport)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnImportClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnImport = e.control;
	
	console.log("onBtnImportClick");
	
			
	var input = document.createElement('input');
	input.type = 'file';
		
	input.onchange = e => { 
		var file = e.target.files[0]; 
		   
			console.log("file.name: " + file.name);
			   
			var reader = new FileReader();
			   
			console.log("reader: " + reader);
				   
			reader.onload = function () {
				console.log(reader.result);
				
				var data = reader.result;
						   
				uint8Array = data;
				uint8Array = new Uint8Array(reader.result.length);
				
				for (var n = 0; n < reader.result.length; ++n) {
            		var aByte = reader.result.charCodeAt(n);
            		uint8Array[n] = aByte;
        		}				
				
				console.log(uint8Array);
				SchduleJson_From_ByteArray();	
				//SchduleJson_To_Screen();
			} 
			   
			reader.readAsBinaryString(file);
		
	}
	input.click();	
}	


/*
 * 버튼(btnExport)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnExportClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnExport = e.control;
	
	console.log("onBtnExportClick");
	
	SchduleJson_To_ByteArray();
	
	var sampleBytes = uint8Array;
	
	var saveByteArray = (function () {
	    var a = document.createElement("a");
	    document.body.appendChild(a);
	    a.style = "display: none";
	    return function (data, name) {
	        var blob = new Blob(data, {type: "octet/stream"}),
	            url = window.URL.createObjectURL(blob);
	        a.href = url;
	        a.download = name;
	        a.click();
	        window.URL.revokeObjectURL(url);
	    };
	}());
	
	saveByteArray([sampleBytes], 'export.sch');
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
	
	var dsSchedule = app.lookup("dsSchedule");
	
	var cmbAlarmHour = app.lookup("cmbAlarmHour");
	var cmbAlarmMinute = app.lookup("cmbAlarmMinute");
	var cbxWeek0 = app.lookup("cbxWeek0");
	var cbxWeek1 = app.lookup("cbxWeek1");
	var cbxWeek2 = app.lookup("cbxWeek2");
	var cbxWeek3 = app.lookup("cbxWeek3");
	var cbxWeek4 = app.lookup("cbxWeek4");
	var cbxWeek5 = app.lookup("cbxWeek5");
	var cbxWeek6 = app.lookup("cbxWeek6");	
	var cbxExcludeHoliday = app.lookup("cbxExcludeHoliday");
	var cmbDuration = app.lookup("cmbDuration");
	
	var cbxSetOff1 = app.lookup("cbxSetOff1");
	var cbxSetOff2 = app.lookup("cbxSetOff2");
	var cbxSetOff3 = app.lookup("cbxSetOff3");
	var cbxSetOff4 = app.lookup("cbxSetOff4");
	
	var cbxSetOn1 = app.lookup("cbxSetOn1");
	var cbxSetOn2 = app.lookup("cbxSetOn2");
	var cbxSetOn3 = app.lookup("cbxSetOn3");
	var cbxSetOn4 = app.lookup("cbxSetOn4");
	
	var cbxOutput1 = app.lookup("cbxOutput1");
	var cbxOutput2 = app.lookup("cbxOutput2");
	var cbxOutput3 = app.lookup("cbxOutput3");
	var cbxOutput4 = app.lookup("cbxOutput4");
	var cbxOutput5 = app.lookup("cbxOutput5");
	var cbxOutput6 = app.lookup("cbxOutput6");
	var cbxOutput7 = app.lookup("cbxOutput7");
	var cbxOutput8 = app.lookup("cbxOutput8");
	


	var SetOn = 0;
	var SetOn1 = cbxSetOn1.checked == true ? 1 : 0;
	var SetOn2 = cbxSetOn2.checked == true ? 1 : 0;
	var SetOn3 = cbxSetOn3.checked == true ? 1 : 0;
	var SetOn4 = cbxSetOn4.checked == true ? 1 : 0;

	SetOn |= SetOn1 << 0;
	SetOn |= SetOn2 << 1;
	SetOn |= SetOn3 << 2;
	SetOn |= SetOn4 << 3;
	
	
	
	
	var SetOff = 0;
	var SetOff1 = cbxSetOff1.checked == true ? 1 : 0;
	var SetOff2 = cbxSetOff2.checked == true ? 1 : 0;
	var SetOff3 = cbxSetOff3.checked == true ? 1 : 0;
	var SetOff4 = cbxSetOff4.checked == true ? 1 : 0;

	SetOff |= SetOff1 << 0;
	SetOff |= SetOff2 << 1;
	SetOff |= SetOff3 << 2;
	SetOff |= SetOff4 << 3;
	
	
	
	
	var Weekday = 0;
	var Week0 = cbxWeek0.checked == true ? 1 : 0;
	var Week1 = cbxWeek1.checked == true ? 1 : 0;
	var Week2 = cbxWeek2.checked == true ? 1 : 0;
	var Week3 = cbxWeek3.checked == true ? 1 : 0;
	var Week4 = cbxWeek4.checked == true ? 1 : 0;
	var Week5 = cbxWeek5.checked == true ? 1 : 0;
	var Week6 = cbxWeek6.checked == true ? 1 : 0;
	var ExcludeHoliday = cbxExcludeHoliday.checked == true ? 1 : 0;
	
	Weekday |= Week0 << 0;
	Weekday |= Week1 << 1;
	Weekday |= Week2 << 2;
	Weekday |= Week3 << 3;
	Weekday |= Week4 << 4;
	Weekday |= Week5 << 5;
	Weekday |= Week6 << 6;
	Weekday |= ExcludeHoliday << 7;	
	
	
	
	
	
	
	var Output = 0;
	var Output1 = cbxOutput1.checked == true ? 1 : 0;
	var Output2 = cbxOutput2.checked == true ? 1 : 0;
	var Output3 = cbxOutput3.checked == true ? 1 : 0;
	var Output4 = cbxOutput4.checked == true ? 1 : 0;
	var Output5 = cbxOutput5.checked == true ? 1 : 0;
	var Output6 = cbxOutput6.checked == true ? 1 : 0;
	var Output7 = cbxOutput7.checked == true ? 1 : 0;
	var Output8 = cbxOutput8.checked == true ? 1 : 0;
	
	Output |= Output1 << 0;
	Output |= Output2 << 1;
	Output |= Output3 << 2;
	Output |= Output4 << 3;
	Output |= Output5 << 4;
	Output |= Output6 << 5;
	Output |= Output7 << 6;
	Output |= Output8 << 7;	
		
	
	

	
	var Alarms = jsonContent.MsgAcuAlarmScheduleOption.Alarms;
	
	var newIdx = -1;
	if(null == Alarms)
		newIdx = 0;
	else
		newIdx = Alarms.length;
	
	if(null == Alarms)
	{
		var newElement = [{
		"Hour":parseInt(cmbAlarmHour.value), 
		"Minute":parseInt(cmbAlarmMinute.value), 
		"Weekday":Weekday, 
		"Duration":parseInt(cmbDuration.value),
		"AutoArmPatition":SetOn, 
		"AutoDisarmPartition":SetOff, 
		"Output":Output, 
		"Reserved":0 
		}];	
		var MsgAcuAlarmScheduleOption = jsonContent.MsgAcuAlarmScheduleOption;
		MsgAcuAlarmScheduleOption.Alarms = newElement;			
	}
	else
	{
		var newElement = {
		"Hour":parseInt(cmbAlarmHour.value), 
		"Minute":parseInt(cmbAlarmMinute.value), 
		"Weekday":Weekday, 
		"Duration":parseInt(cmbDuration.value),
		"AutoArmPatition":SetOn, 
		"AutoDisarmPartition":SetOff, 
		"Output":Output, 
		"Reserved":0 
		};	
		Alarms.push(newElement);		
	}
	

	
	
	
	/*
	jsonContent.MsgAcuAlarmScheduleOption.Alarms[newIdx].Hour = 0;
	jsonContent.MsgAcuAlarmScheduleOption.Alarms[newIdx].Minute = 0;
	jsonContent.MsgAcuAlarmScheduleOption.Alarms[newIdx].Weekday = 0;
	jsonContent.MsgAcuAlarmScheduleOption.Alarms[newIdx].Duration = 0;
	jsonContent.MsgAcuAlarmScheduleOption.Alarms[newIdx].AutoArmPatition = 0;
	jsonContent.MsgAcuAlarmScheduleOption.Alarms[newIdx].AutoDisarmPartition = 0;
	jsonContent.MsgAcuAlarmScheduleOption.Alarms[newIdx].Output = 0;
	jsonContent.MsgAcuAlarmScheduleOption.Alarms[newIdx].Reserved = 0;
	*/
	console.log(jsonContent.MsgAcuAlarmScheduleOption);
		
	/*
	var smsPutAcuAlarmScheduleOption = app.lookup("smsPutAcuAlarmScheduleOption");

	smsPutAcuAlarmScheduleOption.action = "/v1/acus/" + curTerminalID.toString() + "/option/schedule";	
	smsPutAcuAlarmScheduleOption.setRequestObject(jsonContent.MsgAcuAlarmScheduleOption);
	smsPutAcuAlarmScheduleOption.send();
	*/
}


function SchduleJson_From_ByteArray()
{
	console.log("SchduleJson_From_ByteArray");
	//uint8Array = new Uint8Array(3 * ( 8 + 50) ); // 8은  각 멤버를 1개를 1 바이트로 함, 50 은 strContents 저장할 자리
	
	if(null == uint8Array )
	{
		console.log("null == uint8Array");
		return;
	}
		
	
	var Alarms = jsonContent.MsgAcuAlarmScheduleOption.Alarms;
	
	var Alarms_Length = uint8Array.byteLength / (8 + 50) ;
	
	console.log("Alarms_Length: " + Alarms_Length);
	
	var dsSchedule = app.lookup("dsSchedule");
	dsSchedule.clear();
		
		
		
	for(var ii=0;ii<Alarms_Length ;ii++)
	{
		var kk=0;
		if(null == Alarms)
		{
			var newElement = [{
			"Hour":uint8Array[ii*(8 + 50) + kk++], 
			"Minute":uint8Array[ii*(8 + 50) + kk++], 
			"Weekday":uint8Array[ii*(8 + 50) + kk++], 
			"Duration":uint8Array[ii*(8 + 50) + kk++],
			"AutoArmPatition":uint8Array[ii*(8 + 50) + kk++], 
			"AutoDisarmPartition":uint8Array[ii*(8 + 50) + kk++], 
			"Output":uint8Array[ii*(8 + 50) + kk++], 
			"Reserved":0 
			}];	
			var MsgAcuAlarmScheduleOption = jsonContent.MsgAcuAlarmScheduleOption;
			MsgAcuAlarmScheduleOption.Alarms = newElement;			
		}
		else
		{
			var newElement = {
			"Hour":uint8Array[ii*(8 + 50) + kk++], 
			"Minute":uint8Array[ii*(8 + 50) + kk++], 
			"Weekday":uint8Array[ii*(8 + 50) + kk++], 
			"Duration":uint8Array[ii*(8 + 50) + kk++], 
			"AutoArmPatition":uint8Array[ii*(8 + 50) + kk++], 
			"AutoDisarmPartition":uint8Array[ii*(8 + 50) + kk++], 
			"Output":uint8Array[ii*(8 + 50) + kk++], 
			"Reserved":0 
			};	
			Alarms.push(newElement);		
		}
		/*
		var kk=0;
		jsonContent.MsgAcuAlarmScheduleOption.Alarms[ii].Hour = uint8Array[ii*(8 + 50) + kk++];
		jsonContent.MsgAcuAlarmScheduleOption.Alarms[ii].Minute = uint8Array[ii*(8 + 50) + kk++];
		jsonContent.MsgAcuAlarmScheduleOption.Alarms[ii].Weekday = uint8Array[ii*(8 + 50) + kk++];
		jsonContent.MsgAcuAlarmScheduleOption.Alarms[ii].Duration = uint8Array[ii*(8 + 50) + kk++];
		jsonContent.MsgAcuAlarmScheduleOption.Alarms[ii].AutoArmPatition = uint8Array[ii*(8 + 50) + kk++];
		jsonContent.MsgAcuAlarmScheduleOption.Alarms[ii].AutoDisarmPartition = uint8Array[ii*(8 + 50) + kk++];
		jsonContent.MsgAcuAlarmScheduleOption.Alarms[ii].Output = uint8Array[ii*(8 + 50) + kk++];
		jsonContent.MsgAcuAlarmScheduleOption.Alarms[ii].Reserved = uint8Array[ii*(8 + 50) + kk++];
		*/	
		
		var uint8ArrayTemp = new Uint8Array(50);
		for (var i = 0; i < 50; i++) { 
		    uint8ArrayTemp[i] = uint8Array[ii*(8 + 50) + kk++];
		}	
		
		var row = dsSchedule.addRow();

		var AlarmTime = jsonContent.MsgAcuAlarmScheduleOption.Alarms[ii].Hour.toString() + ":" +
		 jsonContent.MsgAcuAlarmScheduleOption.Alarms[ii].Minute.toString();
		row.setValue("AlarmTime", AlarmTime);
		
		var Duration = jsonContent.MsgAcuAlarmScheduleOption.Alarms[ii].Duration;
		row.setValue("Duration", Duration);	
		
		var Contents = "";
		row.setValue("Contents", Contents);	
	
		var strContents = new TextDecoder().decode(uint8ArrayTemp);
		
		row.setValue("Contents", strContents);
	}
	
	var grdSchedule = app.lookup("grdSchedule");
	grdSchedule.redraw();		
}


function SchduleJson_To_ByteArray()
{
	
	var Alarms = jsonContent.MsgAcuAlarmScheduleOption.Alarms;
	if(Alarms == null)
		return;
		
	if(Alarms.length == 0)
		return;
		
	var dsSchedule = app.lookup("dsSchedule");
		
	uint8Array = new Uint8Array(Alarms.length * ( 8 + 50) ); // 8은  각 멤버를 1개를 1 바이트로 함, 50 은 strContents 저장할 자리
	
	for(var ii=0;ii<Alarms.length;ii++)
	{
		var kk=0;
		uint8Array[ii*(8 + 50) + kk++] = jsonContent.MsgAcuAlarmScheduleOption.Alarms[ii].Hour ;
		uint8Array[ii*(8 + 50) + kk++] = jsonContent.MsgAcuAlarmScheduleOption.Alarms[ii].Minute ;
		uint8Array[ii*(8 + 50) + kk++] = jsonContent.MsgAcuAlarmScheduleOption.Alarms[ii].Weekday ;
		uint8Array[ii*(8 + 50) + kk++] = jsonContent.MsgAcuAlarmScheduleOption.Alarms[ii].Duration ;
		uint8Array[ii*(8 + 50) + kk++] = jsonContent.MsgAcuAlarmScheduleOption.Alarms[ii].AutoArmPatition ;
		uint8Array[ii*(8 + 50) + kk++] = jsonContent.MsgAcuAlarmScheduleOption.Alarms[ii].AutoDisarmPartition ;
		uint8Array[ii*(8 + 50) + kk++] = jsonContent.MsgAcuAlarmScheduleOption.Alarms[ii].Output ;
		uint8Array[ii*(8 + 50) + kk++] = jsonContent.MsgAcuAlarmScheduleOption.Alarms[ii].Reserved ;	
		
		
		
		//var buffer = new Buffer(str, 'utf-8');
		var Contents = dsSchedule.getRow(ii).getValue("Contents");
		var bytes = new TextEncoder().encode(Contents);
		
		for (var i = 0; i < bytes.length; i++) {
		    uint8Array[ii*(8 + 50) + kk++] = bytes[i];
		}		
	}
	
	

}



function SchduleJson_To_Screen(index)
{
	var dsSchedule = app.lookup("dsSchedule");
	
	var cmbAlarmHour = app.lookup("cmbAlarmHour");
	var cmbAlarmMinute = app.lookup("cmbAlarmMinute");
	var cbxWeek0 = app.lookup("cbxWeek0");
	var cbxWeek1 = app.lookup("cbxWeek1");
	var cbxWeek2 = app.lookup("cbxWeek2");
	var cbxWeek3 = app.lookup("cbxWeek3");
	var cbxWeek4 = app.lookup("cbxWeek4");
	var cbxWeek5 = app.lookup("cbxWeek5");
	var cbxWeek6 = app.lookup("cbxWeek6");	
	var cbxExcludeHoliday = app.lookup("cbxExcludeHoliday");
	var cmbDuration = app.lookup("cmbDuration");
	
	var cbxSetOff1 = app.lookup("cbxSetOff1");
	var cbxSetOff2 = app.lookup("cbxSetOff2");
	var cbxSetOff3 = app.lookup("cbxSetOff3");
	var cbxSetOff4 = app.lookup("cbxSetOff4");
	
	var cbxSetOn1 = app.lookup("cbxSetOn1");
	var cbxSetOn2 = app.lookup("cbxSetOn2");
	var cbxSetOn3 = app.lookup("cbxSetOn3");
	var cbxSetOn4 = app.lookup("cbxSetOn4");
	
	var cbxOutput1 = app.lookup("cbxOutput1");
	var cbxOutput2 = app.lookup("cbxOutput2");
	var cbxOutput3 = app.lookup("cbxOutput3");
	var cbxOutput4 = app.lookup("cbxOutput4");
	var cbxOutput5 = app.lookup("cbxOutput5");
	var cbxOutput6 = app.lookup("cbxOutput6");
	var cbxOutput7 = app.lookup("cbxOutput7");
	var cbxOutput8 = app.lookup("cbxOutput8");
	
	cmbAlarmHour.value = jsonContent.MsgAcuAlarmScheduleOption.Alarms[index].Hour;
	cmbAlarmMinute.value = jsonContent.MsgAcuAlarmScheduleOption.Alarms[index].Minute;
	cmbDuration.value = jsonContent.MsgAcuAlarmScheduleOption.Alarms[index].Duration;
		
	var Weekday = 0;
	Weekday = jsonContent.MsgAcuAlarmScheduleOption.Alarms[index].Weekday;
	
	var Week0 = Weekday & 1;
	var Week1 = Weekday >> 1 & 1;
	var Week2 = Weekday >> 2 & 1;
	var Week3 = Weekday >> 3 & 1;
	var Week4 = Weekday >> 4 & 1;
	var Week5 = Weekday >> 5 & 1;
	var Week6 = Weekday >> 6 & 1;
	var ExcludeHoliday = Weekday >> 7 & 1;
	
	cbxWeek0.checked = Week0 == 0 ? false : true;
	cbxWeek1.checked = Week1 == 0 ? false : true;
	cbxWeek2.checked = Week2 == 0 ? false : true;
	cbxWeek3.checked = Week3 == 0 ? false : true;
	cbxWeek4.checked = Week4 == 0 ? false : true;
	cbxWeek5.checked = Week5 == 0 ? false : true;
	cbxWeek6.checked = Week6 == 0 ? false : true;
	cbxExcludeHoliday.checked = ExcludeHoliday == 0 ? false : true;
		
	

	
	var SetOn = 0;
	SetOn = jsonContent.MsgAcuAlarmScheduleOption.Alarms[index].AutoArmPatition;
		
	var SetOn1 = SetOn & 1;
	var SetOn2 = SetOn >> 1 & 1;
	var SetOn3 = SetOn >> 2 & 1;
	var SetOn4 = SetOn >> 3 & 1;	
	
	cbxSetOn1.checked = SetOn1 == 0 ? false : true;
	cbxSetOn2.checked = SetOn2 == 0 ? false : true;
	cbxSetOn3.checked = SetOn3 == 0 ? false : true;
	cbxSetOn4.checked = SetOn4 == 0 ? false : true;	
	

	
	
	var SetOff = 0;
	SetOff = jsonContent.MsgAcuAlarmScheduleOption.Alarms[index].AutoDisarmPartition;
	
	var SetOff1 = SetOff & 1;
	var SetOff2 = SetOff >> 1 & 1;
	var SetOff3 = SetOff >> 2 & 1;
	var SetOff4 = SetOff >> 3 & 1;		
	
	cbxSetOff1.checked = SetOff1 == 0 ? false : true;
	cbxSetOff2.checked = SetOff2 == 0 ? false : true;
	cbxSetOff3.checked = SetOff3 == 0 ? false : true;
	cbxSetOff4.checked = SetOff4 == 0 ? false : true;	
	
	
	
	
	
	
	var Output = 0;
	Output = jsonContent.MsgAcuAlarmScheduleOption.Alarms[index].Output;
		
	var Output1 = Output & 1;
	var Output2 = Output >> 1 & 1;
	var Output3 = Output >> 2 & 1;
	var Output4 = Output >> 3 & 1;	
	var Output5 = Output >> 4 & 1;
	var Output6 = Output >> 5 & 1;
	var Output7 = Output >> 6 & 1;	
	var Output8 = Output >> 7 & 1;	
		

	cbxOutput1.checked = Output1 == 0 ? false : true;
	cbxOutput2.checked = Output2 == 0 ? false : true;
	cbxOutput3.checked = Output3 == 0 ? false : true;
	cbxOutput4.checked = Output4 == 0 ? false : true;
	cbxOutput5.checked = Output5 == 0 ? false : true;
	cbxOutput6.checked = Output6 == 0 ? false : true;
	cbxOutput7.checked = Output7 == 0 ? false : true;
	cbxOutput8.checked = Output8 == 0 ? false : true;
	

}



/*
 * 버튼(btnModify)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnModifyClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnModify = e.control;
	
	
	var dsSchedule = app.lookup("dsSchedule");
	
	var cmbAlarmHour = app.lookup("cmbAlarmHour");
	var cmbAlarmMinute = app.lookup("cmbAlarmMinute");
	var cbxWeek0 = app.lookup("cbxWeek0");
	var cbxWeek1 = app.lookup("cbxWeek1");
	var cbxWeek2 = app.lookup("cbxWeek2");
	var cbxWeek3 = app.lookup("cbxWeek3");
	var cbxWeek4 = app.lookup("cbxWeek4");
	var cbxWeek5 = app.lookup("cbxWeek5");
	var cbxWeek6 = app.lookup("cbxWeek6");	
	var cbxExcludeHoliday = app.lookup("cbxExcludeHoliday");
	var cmbDuration = app.lookup("cmbDuration");
	
	var cbxSetOff1 = app.lookup("cbxSetOff1");
	var cbxSetOff2 = app.lookup("cbxSetOff2");
	var cbxSetOff3 = app.lookup("cbxSetOff3");
	var cbxSetOff4 = app.lookup("cbxSetOff4");
	
	var cbxSetOn1 = app.lookup("cbxSetOn1");
	var cbxSetOn2 = app.lookup("cbxSetOn2");
	var cbxSetOn3 = app.lookup("cbxSetOn3");
	var cbxSetOn4 = app.lookup("cbxSetOn4");
	
	var cbxOutput1 = app.lookup("cbxOutput1");
	var cbxOutput2 = app.lookup("cbxOutput2");
	var cbxOutput3 = app.lookup("cbxOutput3");
	var cbxOutput4 = app.lookup("cbxOutput4");
	var cbxOutput5 = app.lookup("cbxOutput5");
	var cbxOutput6 = app.lookup("cbxOutput6");
	var cbxOutput7 = app.lookup("cbxOutput7");
	var cbxOutput8 = app.lookup("cbxOutput8");
	


	var SetOn = 0;
	var SetOn1 = cbxSetOn1.checked == true ? 1 : 0;
	var SetOn2 = cbxSetOn2.checked == true ? 1 : 0;
	var SetOn3 = cbxSetOn3.checked == true ? 1 : 0;
	var SetOn4 = cbxSetOn4.checked == true ? 1 : 0;

	SetOn |= SetOn1 << 0;
	SetOn |= SetOn2 << 1;
	SetOn |= SetOn3 << 2;
	SetOn |= SetOn4 << 3;
	
	
	
	
	var SetOff = 0;
	var SetOff1 = cbxSetOff1.checked == true ? 1 : 0;
	var SetOff2 = cbxSetOff2.checked == true ? 1 : 0;
	var SetOff3 = cbxSetOff3.checked == true ? 1 : 0;
	var SetOff4 = cbxSetOff4.checked == true ? 1 : 0;

	SetOff |= SetOff1 << 0;
	SetOff |= SetOff2 << 1;
	SetOff |= SetOff3 << 2;
	SetOff |= SetOff4 << 3;
	
	
	
	
	var Weekday = 0;
	var Week0 = cbxWeek0.checked == true ? 1 : 0;
	var Week1 = cbxWeek1.checked == true ? 1 : 0;
	var Week2 = cbxWeek2.checked == true ? 1 : 0;
	var Week3 = cbxWeek3.checked == true ? 1 : 0;
	var Week4 = cbxWeek4.checked == true ? 1 : 0;
	var Week5 = cbxWeek5.checked == true ? 1 : 0;
	var Week6 = cbxWeek6.checked == true ? 1 : 0;
	var ExcludeHoliday = cbxExcludeHoliday.checked == true ? 1 : 0;
	
	Weekday |= Week0 << 0;
	Weekday |= Week1 << 1;
	Weekday |= Week2 << 2;
	Weekday |= Week3 << 3;
	Weekday |= Week4 << 4;
	Weekday |= Week5 << 5;
	Weekday |= Week6 << 6;
	Weekday |= ExcludeHoliday << 7;	
	
	
	
	
	
	
	var Output = 0;
	var Output1 = cbxOutput1.checked == true ? 1 : 0;
	var Output2 = cbxOutput2.checked == true ? 1 : 0;
	var Output3 = cbxOutput3.checked == true ? 1 : 0;
	var Output4 = cbxOutput4.checked == true ? 1 : 0;
	var Output5 = cbxOutput5.checked == true ? 1 : 0;
	var Output6 = cbxOutput6.checked == true ? 1 : 0;
	var Output7 = cbxOutput7.checked == true ? 1 : 0;
	var Output8 = cbxOutput8.checked == true ? 1 : 0;
	
	Output |= Output1 << 0;
	Output |= Output2 << 1;
	Output |= Output3 << 2;
	Output |= Output4 << 3;
	Output |= Output5 << 4;
	Output |= Output6 << 5;
	Output |= Output7 << 6;
	Output |= Output8 << 7;	
		
	
	
	var grdSchedule = app.lookup("grdSchedule");
	var selectedIndex = grdSchedule.getSelectedRow().getIndex();
	if(selectedIndex < 0)
		return;
	
	var Alarms = jsonContent.MsgAcuAlarmScheduleOption.Alarms;
	
	if(null == Alarms)
		return;
		
	if(0 == jsonContent.MsgAcuAlarmScheduleOption.Alarms.length)
		return;
		
	jsonContent.MsgAcuAlarmScheduleOption.Alarms[selectedIndex].Hour = parseInt(cmbAlarmHour.value);
	jsonContent.MsgAcuAlarmScheduleOption.Alarms[selectedIndex].Minute = parseInt(cmbAlarmMinute.value);
	jsonContent.MsgAcuAlarmScheduleOption.Alarms[selectedIndex].Weekday = Weekday;
	jsonContent.MsgAcuAlarmScheduleOption.Alarms[selectedIndex].Duration = parseInt(cmbDuration.value);
	jsonContent.MsgAcuAlarmScheduleOption.Alarms[selectedIndex].AutoArmPatition = SetOn;
	jsonContent.MsgAcuAlarmScheduleOption.Alarms[selectedIndex].AutoDisarmPartition = SetOff;
	jsonContent.MsgAcuAlarmScheduleOption.Alarms[selectedIndex].Output = Output;
	jsonContent.MsgAcuAlarmScheduleOption.Alarms[selectedIndex].Reserved = 0;
		
		
	
	console.log(jsonContent.MsgAcuAlarmScheduleOption);
		
	/*
	var smsPutAcuAlarmScheduleOption = app.lookup("smsPutAcuAlarmScheduleOption");

	smsPutAcuAlarmScheduleOption.action = "/v1/acus/" + curTerminalID.toString() + "/option/schedule";	
	smsPutAcuAlarmScheduleOption.setRequestObject(jsonContent.MsgAcuAlarmScheduleOption);
	smsPutAcuAlarmScheduleOption.send();	
	*/
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
	
	var grdSchedule = app.lookup("grdSchedule");
	var selectedIndex = grdSchedule.getSelectedRow().getIndex();
	if(selectedIndex < 0)
		return;
	
	var Alarms = jsonContent.MsgAcuAlarmScheduleOption.Alarms;
	Alarms.splice(selectedIndex, 1);
	
	console.log(jsonContent.MsgAcuAlarmScheduleOption);
	
	/*
	var smsPutAcuAlarmScheduleOption = app.lookup("smsPutAcuAlarmScheduleOption");
	smsPutAcuAlarmScheduleOption.action = "/v1/acus/" + curTerminalID.toString() + "/option/schedule";	
	smsPutAcuAlarmScheduleOption.setRequestObject(jsonContent.MsgAcuAlarmScheduleOption);
	smsPutAcuAlarmScheduleOption.send();	
	*/	
}


/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onGrdScheduleSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var grdSchedule = e.control;
	
	var selectedIndex = grdSchedule.getSelectedRow().getIndex();
	if(selectedIndex < 0)
		return;	
	SchduleJson_To_Screen(selectedIndex);
}
