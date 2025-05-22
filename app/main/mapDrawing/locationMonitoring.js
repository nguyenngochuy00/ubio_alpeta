/************************************************
 * locationMonitoring.js
 * Created at 2019. 2. 28. 오전 11:48:38.
 *
 * @author osm8667
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var iconValue = null;
var terminalMap = new Map();
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	initComboAuthLog();
	var hostAppIns = app.getHostAppInstance();
	if(hostAppIns){
		iconValue = app.getHostProperty("initValue");
	}
	if(!iconValue){
		alert("잘못된 접근입니다. The wrong approach.");
		app.close();
	}
	var smsGetAreaList = app.lookup("sms_getMapAreaList");
	smsGetAreaList.send();
	smsGetAreaList.addEventListenerOnce("submit-success", function(){
		var terminalList = dataManager.getTerminalList();
		var targetDataSet = app.lookup("TerminalList");
		var isDone = terminalList.copyToDataSet(targetDataSet);
		if(isDone){
			targetDataSet.commit();
		}
	});



}

function onUpdateTerminalStatus(msg,force){	
	
	//var dsTerminalList = app.lookup("TerminalInfo");
	for(var i=0; i<msg.length; i++){
		
		var status = "";
		var terminal = terminalMap.get(msg[i].ID);
		if (terminal == undefined) {			
			continue;
		}		
		var changedValue = msg[i].Status^terminal.getValue("Status");
		terminal.setValue("Status",msg[i].Status);
		
		var statusBinary = changedValue.toString(2).padStart(32, "0");
		var valueBinary = msg[i].Status.toString(2).padStart(32, "0");
		
		//(모니터링 페이지 첫 실행시)미등록의 경우 if(changedValue==0&&force==false){return;} 로 빠져나가기 전에 실행해야함
		if(msg[i].Status == "1"){
			onStatusUpdate(4,valueBinary[32-1-4],terminal);
			return;
		}
		
		if(changedValue==0&&force==false){return;}
		
		//console.log("statusBinary", statusBinary);
		//console.log("valueBinary", valueBinary);
		
		/*
		for(var i=0;i<32;i++){
			
			if( statusBinary[32-1-i] == 0 && force == false){
				 continue;
			}
			 
			onStatusUpdate(i,valueBinary[32-1-i],terminal);
			if (i == 0 && valueBinary[32-1-i]==0) {break;}
			if (i == 4 && valueBinary[32-1-i]==0) {break;}
		}
		*/
		
		//status1
		if(force == true || statusBinary[32-1-0] == 1 || statusBinary[32-1-4] == 1 || statusBinary[32-1-5] == 1
		|| statusBinary[32-1-6] == 1 || statusBinary[32-1-15] == 1 || statusBinary[32-1-16] == 1 || 
		statusBinary[32-1-17] == 1 || statusBinary[32-1-18] == 1){
			if(statusBinary[32-1-0] == 1 || valueBinary[32-1-0] == 1){		// 단말기 연결 미연결에 대한 초기화 
				onStatusUpdate(0,valueBinary[32-1-0],terminal);
			}
			
			if(valueBinary[32-1-5] == 1){
				onStatusUpdate(5,valueBinary[32-1-5],terminal);
			}else if(valueBinary[32-1-6] == 1){
				onStatusUpdate(6,valueBinary[32-1-6],terminal);
			}else if(valueBinary[32-1-15] == 1){
				onStatusUpdate(15,valueBinary[32-1-15],terminal);
			}else if(valueBinary[32-1-16] == 1){
				onStatusUpdate(16,valueBinary[32-1-16],terminal);
			}else if(valueBinary[32-1-17] == 1){
				onStatusUpdate(17,valueBinary[32-1-17],terminal);
			}else if(valueBinary[32-1-18] == 1){
				onStatusUpdate(18,valueBinary[32-1-18],terminal);
			}else{
				// terminal.setValue("TerminalStatus1", "");
			}
		}
		
		if (valueBinary[32-1-0] == 1) {
			//status2
			if(force == true || statusBinary[32-1-7] == 1 || statusBinary[32-1-8] == 1 || statusBinary[32-1-9] == 1
			|| statusBinary[32-1-10] == 1 || statusBinary[32-1-11] == 1 || statusBinary[32-1-23] == 1 || statusBinary[32-1-24] == 1
			|| (statusBinary[32-1-0] == 1 && valueBinary[32-1-0] == 1)){	// 모니터링 도중 연결되었을때 문 초기화
				
				if( valueBinary[32-1-7] == 0 ) {
					onStatusUpdate(7,0,terminal);
				} else if( valueBinary[32-1-7] == 1 ) {
					onStatusUpdate(7,1,terminal);
				} 
				
				if(valueBinary[32-1-8] == 1){
					onStatusUpdate(8,valueBinary[32-1-8],terminal);
				}else if(valueBinary[32-1-9] == 1){
					onStatusUpdate(9,valueBinary[32-1-9],terminal);
				}else if(valueBinary[32-1-10] == 1){					 // else에서 출입문/락 상태 체크 진행
					onStatusUpdate(10,valueBinary[32-1-10],terminal);
				}else if(valueBinary[32-1-11] == 1){
					onStatusUpdate(11,valueBinary[32-1-11],terminal);
	//			}else if(valueBinary[32-1-24] == 1){ // 현재, 오른쪽 클릭 ->  출입문 개방 신호와 출입문 미감시 신호가 동시에 오고 있어서 순서를 바꿈으로서 출입문 개방이 먼저 실행되도록 변경
	//				onStatusUpdate(24,valueBinary[32-1-24],terminal);
				}else if(valueBinary[32-1-23] == 1){
					onStatusUpdate(23,valueBinary[32-1-23],terminal);
				}else{

				}
			}
			
			//status3
			if(force == true || statusBinary[32-1-1] == 1 || statusBinary[32-1-2] == 1 || statusBinary[32-1-3] == 1){
				if(valueBinary[32-1-1] == 1){
					onStatusUpdate(1,valueBinary[32-1-1],terminal);
				}else if(valueBinary[32-1-2] == 1){
					onStatusUpdate(2,valueBinary[32-1-2],terminal);
				}else if(valueBinary[32-1-3] == 1){
					onStatusUpdate(3,valueBinary[32-1-3],terminal);
				}else{
					terminal.setValue("TerminalStatus3", "");
				}
			}
			
			//status4
			if(force == true || statusBinary[32-1-12] == 1 || statusBinary[32-1-13] == 1 || statusBinary[32-1-14] == 1){
				if(valueBinary[32-1-12] == 1){
					onStatusUpdate(12,valueBinary[32-1-12],terminal);
				}else if(valueBinary[32-1-13] == 1){
					onStatusUpdate(13,valueBinary[32-1-13],terminal);
				}else if(valueBinary[32-1-14] == 1){
					onStatusUpdate(14,valueBinary[32-1-14],terminal);
				}else{
					terminal.setValue("TerminalStatus4", "");
				}
			}
		}
		
	}		
}

// 실시간 단말기 정보. main의 웹 소켓을 통해 단말기 라이브 정보 수신시 호출
exports.updateTerminalStatus = function( msg ){
	
	onUpdateTerminalStatus(msg,false);	
	/*
	var terminalList = app.lookup("TerminalList");
	var terminal = terminalList.findFirstRow("ID=="+msg[0].TerminalID);
	if( terminal ){
		//var imgSrc = (msg[0]["Status"]==0)?"../../../theme/images/monitoring/connect.png":"../../../theme/images/monitoring/disconnect.png";
		terminal.setValue("State", msg[0].Status);
	}
	changeIcon(msg[0].TerminalID,msg[0].Status);
	*/ 
}

function onStatusUpdate(category, value, terminal){
	var status1 = "";
	var status2 = "";
	var status3 = "";
	var status4 = "";
	console.log("category",category, "value",value,"terminal",terminal.getValue("ID"));
	switch( category ){
		case 0:		// TerminalStatusConnect 1<<0
			if( value == 1){terminal.setValue("TerminalStatus1", TerminalStatusConnect);}
			else{
				terminal.setValue("TerminalStatus1", "");
				terminal.setValue("TerminalStatus2", "");
				terminal.setValue("TerminalStatus3", "");
				terminal.setValue("TerminalStatus4", "");				
			}
			break;

			
		case 1 : // TerminalStatusLock         = 1 << 1 // 잠김 - 0:해제, 1:잠김
			if( value == 1) {	terminal.setValue("TerminalStatus3", TerminalStatusLock);}
			//else{	terminal.setValue("TerminalStatus3", "");}				
			break;
						
		case 2 : //TerminalStatusLockForce    = 1 << 2 // 폐쇄 - 0:정상, 1:폐쇄
			if( value == 1) {	terminal.setValue("TerminalStatus3", TerminalStatusLockForce);}
			//else{	terminal.setValue("TerminalStatus3", "");}
			break;
					
		case 3 : 
			if( value == 1) {	terminal.setValue("TerminalStatus3", TerminalStatusCover);}
			//else{	terminal.setValue("TerminalStatus3", "");}
			break;
											
		case 4 : 
			if( value == 0){
				terminal.setValue("TerminalStatus1", TerminalStatusUnRegist);
				terminal.setValue("TerminalStatus2", "");
				terminal.setValue("TerminalStatus3", "");
				terminal.setValue("TerminalStatus4", "");
				terminal.setValue("UserName",dataManager.getString("Str_UnregisteredTerminal"));
			}	
			break;
						
		case 5 :
			if( value == 1) {	terminal.setValue("TerminalStatus1", TerminalStatusIDConflict);	}
			break;
						
		case 6 : 
			if( value == 1) {	terminal.setValue("TerminalStatus1", TerminalStatusInvalidType);}
			break;
						
		case 7 : 
			if( value == 1) {	terminal.setValue("TerminalStatus2", TerminalStatusDoorOpen);}
			else{	terminal.setValue("TerminalStatus2", TerminalStatusDoorClose);}
			break;
					
		case 8 : 
			if( value == 1) {	terminal.setValue("TerminalStatus2", TerminalStatusDoorEmergency);}
			//else{	terminal.setValue("TerminalStatus2", "");}
			break;
						
		case 9 : 
			if( value == 1) {	terminal.setValue("TerminalStatus2", TerminalStatusDoorOpenWarn);}
			//else{	terminal.setValue("TerminalStatus2", "");}
			break;
					
		case 10 : 
			if( value == 1) {	terminal.setValue("TerminalStatus2", TerminalStatusDoorLookState);}
			//else{	terminal.setValue("TerminalStatus2", "");}
			break;
					
		case 11 : 
			if( value == 1) {	terminal.setValue("TerminalStatus2", TerminalStatusDoorLockWorking);}
			//else{	terminal.setValue("TerminalStatus2", "");}
			break;
		case 12 :
			if( value == 1) {	terminal.setValue("TerminalStatus4", TerminalStatusWarnFire);}
			//else{terminal.setValue("TerminalStatus4", "");}
			break;
						
		case 13 : 
			if( value == 1) {	terminal.setValue("TerminalStatus4", TerminalStatusWarnPanic);}
			//else{	terminal.setValue("TerminalStatus4", "");}
			break;
						
		case 14 :
			if( value == 1) {	terminal.setValue("TerminalStatus4", TerminalStatusWarnCricis);}
			//else{	terminal.setValue("TerminalStatus4", "");}
			break;
			
		case 15 : 
			if( value == 1) {	terminal.setValue("TerminalStatus1", TerminalStatusSyncUserIDLen);}
			break;
					
		case 16 : 
			if( value == 1) {	terminal.setValue("TerminalStatus1", TerminalStatusSyncMacAddres);}
			break;
					
		case 17 :
			if( value == 1) {	terminal.setValue("TerminalStatus1", TerminalStatusSyncUserCount);}
			break;
						
		case 18 :
			if( value == 1) {	terminal.setValue("TerminalStatus1", TerminalStatusSyncFWVersion);}
			break; 
		case 23 :
			if( value == 1) {	terminal.setValue("TerminalStatus2", TerminalStatusDoorNotMonitoring);}
			//else{	terminal.setValue("TerminalStatus2", "");}
			break;
		case 24 :
			// if( value == 1) {	terminal.setValue("TerminalStatus2", TerminalStatusDoorOpenState);}
			//else{	terminal.setValue("TerminalStatus2", "");}
			break;
	}
	changeIcon(terminal.getValue("ID"),terminal);
}

function initComboAuthLog() {
	var cmbAuthType = app.lookup("VMMON__cmbAuthType");
	if (cmbAuthType) {
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthTypeFPVerify"), 1));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthTypeFPIdentify"), 2));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_Password"), 3));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_Card"), 4));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthTypeFaceVerify"), 5));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthTypeFaceIdentify"), 6));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_MobileCard"), 7));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_TypeIrisIdentify"), 8));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_TypeIrisVerify"), 9));
	}

	var cmbAuthResult = app.lookup("VMMON__cmbAuthResult");
	if (cmbAuthResult) {
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_Success"), 0));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultFail"), 1));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultAccessDenied"), 2));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeout"), 3));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeoutCapture"), 4));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeoutIdentify"), 5));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultAntiPassback"), 6));
	}
}

// 실시간 인증 로그 추가. main의 웹 소켓을 통해 인증로그 수신시 호출
exports.addAuthLog = function( authLog){
	var dsAuthLogList = app.lookup("AuthLogList");
	
	var dsMapAreaTerminaList = app.lookup("MapAreaTerminalList");
	for (var i = 0; i < dsMapAreaTerminaList.getRowCount(); i++) {
		var MapArea = dsMapAreaTerminaList.getRow(i);
		if (MapArea.getValue("MapCode") == iconValue && MapArea.getValue("TerminalID") == authLog.TerminalID) {	// 현재 구역에 단말기가 있으면 모니터링 추가
			var insertRow = dsAuthLogList.insertRowData(0, false, authLog);
			insertRow.setState(cpr.data.tabledata.RowState.UNCHANGED);
		
			var rowCount = dsAuthLogList.getRowCount();
			if( rowCount > 10000 ){
				var newRow = dsAuthLogList.getRowDataRanged(0, 5000);
		
				dsAuthLogList.clear();
				dsAuthLogList.build(newRow);
				//dsAuthLogList.realDeleteRow(3);
			}
		
			app.lookup("VMMON_grdAuthLog").redraw();
		}
	}
}


// 실시간 이벤트 로그 추가. main의 웹 소켓을 통해 이벤트로그 수신시 호출
exports.addEventLog = function(eventLog) {

	var dsEventLogList = app.lookup("EventLogList");
	//console.log(eventLog);

	var newRow = dsEventLogList.insertRowData(0, false, eventLog);
	newRow.setState(cpr.data.tabledata.RowState.UNCHANGED);

	var rowCount = dsEventLogList.getRowCount();
	if (rowCount > 10000) {
		var newRow = dsEventLogList.getRowDataRanged(0, 5000);

		dsEventLogList.clear();
		dsEventLogList.build(newRow);
		//dsEventLogList.realDeleteRow(3);
	}
	setTerminalEventVal(eventLog.TerminalID, eventLog.Content);
}

function setTerminalEventVal(terminalID, eventVal) {
	console.log(terminalID, eventVal);
	var terminal = terminalMap.get(terminalID);
	if (terminal) {
		
		//console.log("실시간 이벤트 코드 : ",eventVal);
	switch(eventVal){
		//Status1
		case EventLogTerminalDisconnected : terminal.setValue("TerminalStatus1", ""); break;
		case 65538 : 
			if(terminal.getValue("Status") == "1"){
				break;	
			}else{
				terminal.setValue("TerminalStatus1", TerminalStatusConnect); break;	
			}
		//Status2
		// 출입문 열림, 닫힘
		case 131073 : terminal.setValue("TerminalStatus2", TerminalStatusDoorOpen); break;
		case 131074 : terminal.setValue("TerminalStatus2", TerminalStatusDoorClose); break;
		// 강제 침입(강제 문열림)
		case 131077 : terminal.setValue("TerminalStatus2", TerminalStatusDoorEmergency); break;
		// 문열림 방치
		case 131078 : terminal.setValue("TerminalStatus2", TerminalStatusDoorOpenWarn); break;
		// 도어락 정상, 고장
		case 131079 : terminal.setValue("TerminalStatus2", ""); break;
		case 131080 : terminal.setValue("TerminalStatus2", TerminalStatusDoorLockWorking); break;
		
		// 문상태 미감시
		case 131081 : terminal.setValue("TerminalStatus2", TerminalStatusDoorNotMonitoring); break;
		
		// 출입문 입시 열기, 출입문 개방, 출입문 해제
		case 131088 : terminal.setValue("TerminalStatus2", TerminalStatusDoorOpenState); break;
		case 131089 : terminal.setValue("TerminalStatus2", TerminalStatusDoorOpenState); break;
		case 131090 : terminal.setValue("TerminalStatus2", ""); break;
		
		
		//Status3
		//단말기 잠김, 해제      
		case 65539 : terminal.setValue("TerminalStatus3", TerminalStatusLock); break;
		case 65540 : terminal.setValue("TerminalStatus3", ""); break;
		// 결합,분리 
		case 65542 : terminal.setValue("TerminalStatus3", ""); break;
		case 65541 : terminal.setValue("TerminalStatus3", TerminalStatusCover); break;
		//Status4
		//화재 감지 시작, 화재 감지 종료
		case 196611 : terminal.setValue("TerminalStatus4", TerminalStatusWarnFire); break;
		case 196612 : terminal.setValue("TerminalStatus4", ""); break;
		//패닉 감지 시작, 패닉 감지 종료
		case 196613 : terminal.setValue("TerminalStatus4", TerminalStatusWarnPanic); break;
		case 196614 : terminal.setValue("TerminalStatus4", ""); break;
		//비상 감지 시작, 비상 감지 종료
		case 196615 : terminal.setValue("TerminalStatus4", TerminalStatusWarnCricis); break;
		case 196616 : terminal.setValue("TerminalStatus4", ""); break;
		}
		changeIcon(terminal.getValue("ID"),terminal);
	}
	
}



function changeIcon(id, terminal){
	
	//console.log("changeIcon : ",id, "status1",terminal.getValue("TerminalStatus1"),
	//"status2",terminal.getValue("TerminalStatus2"),"status3",terminal.getValue("TerminalStatus3"),
	//"status4",terminal.getValue("TerminalStatus4"));

	/**
	 * @type cpr.controls.Output
	 */
	var stsIcon1 = app.lookup("statusIcon1"+id);
	//console.log("stsIcon1",stsIcon1);
	if(stsIcon1 == undefined){
		return;
	}
	//var oldIconSrc1 = stsIcon1.userAttr("subSrc");
	var stsSrc1 = null;
	switch (terminal.getValue("TerminalStatus1")) {
	    case 1: stsSrc1 = "url('theme/images/monitoring/green.png')"; break;  //TerminalStatusConnect
    	case 16: stsSrc1 = "url('theme/images/monitoring/green.png')"; break; //TerminalStatusRegist
    	case -1: stsSrc1 = "url('theme/images/monitoring/monitoring_list_info_icons_status.png')"; break; //TerminalStatusUnRegist
    	case 32: stsSrc1 = "url('theme/images/monitoring/monitoring_list_info_icons_status.png')"; break; //TerminalStatusIDConflict
    	case 64: stsSrc1 = "url('theme/images/monitoring/monitoring_list_info_icons_status.png')"; break; //TerminalStatusInvalidType
    	case 32768: stsSrc1 = "url('theme/images/monitoring/monitoring_list_info_icons_status.png')"; break; //TerminalStatusSyncUserIDLen
    	case 65536: stsSrc1 = "url('theme/images/monitoring/monitoring_list_info_icons_status.png')"; break; //TerminalStatusSyncMacAddres
    	case 131072: stsSrc1 = "url('theme/images/monitoring/monitoring_list_info_icons_status.png')"; break; //TerminalStatusSyncUserCount
    	case 262144: stsSrc1 = "url('theme/images/monitoring/monitoring_list_info_icons_status.png')"; break; //TerminalStatusSyncFWVersion
    	default : stsSrc1 = "url('theme/images/monitoring/red.png')"; break; 
	}
	/*
	if(oldIconSrc1==stsSrc1){
		return;
	}*/
	stsIcon1.style.removeClass("blink");
	stsIcon1.style.removeStyle("background-image");
	stsIcon1.style.css("background-image", stsSrc1);
	stsIcon1.style.addClass("blink");
	
	
	var stsIcon2 = app.lookup("statusIcon2"+id);
	console.log("stsIcon2",stsIcon2);
	if(stsIcon2 == undefined){
		return;
	}
	//var oldIconSrc2 = stsIcon2.userAttr("subSrc");
	var stsSrc2 = null;
	var stsBackGroundColor = null;
	switch (terminal.getValue("TerminalStatus2")) {
	    case -2: stsSrc2 = "url('theme/images/monitoring/location_information_icons_device_door_open_normal.png')"; break; //(도어 - 0:닫힘, 1:열림) : 출입문 열림 TerminalStatusDoorOpen
    	case -3: stsSrc2 = "url('theme/images/monitoring/location_information_icons_device_door_lock_normal.png')"; break; // (도어 - 0:닫힘, 1:열림) : 출입문 닫힘 TerminalStatusDoorClose
		case -4: stsSrc2 = "url('theme/images/monitoring/location_information_icons_device_lock_error_danger.png')"; break; // (도어 - 0:닫힘, 1:열림) : 출입문 닫힘 TerminalStatusDoorOpenLockError
		case -5: stsSrc2 = "url('theme/images/monitoring/location_information_icons_device_door_lock_open_warning.png')"; break; // (도어 - 0:닫힘, 1:열림) : 출입문 닫힘 TerminalStatusDoorCloseLockOpen
    	case 256: stsSrc2 = "url('theme/images/monitoring/location_information_icons_device_door_open_danger.png')"; break; //(침입 - 0:정상, 1:침입) : 강제 침입  TerminalStatusDoorEmergency
    	case 512: stsSrc2 = "url('theme/images/monitoring/location_information_icons_device_door_neglect_danger.png')"; break;  // (방치 - 0:정상, 1:방치) : 문열림 경고 TerminalStatusDoorOpenWarn
    	case 1024: stsSrc2 = "url('theme/images/monitoring/location_information_icons_device_door_lock_open.png')"; break; // (상태 - 0:잠김, 1:열림) : 출입문 열림 TerminalStatusDoorLookState
    	case 2048: stsSrc2 = "url('theme/images/monitoring/location_information_icons_device_door_neglect_danger.png')"; break; // (동작 - 0:정상, 1:고장) : 문열림 경고    TerminalStatusDoorLockWorking
  		case 16777216: stsSrc2 = "url('theme/images/monitoring/location_information_icons_device_door_lock_open.png')"; break; // 오른쪽 클릭 메뉴 -> 출입문 개방 TerminalStatusDoorOpenState‬
  		default : stsSrc2 = ""; break;
	}
	
		switch (terminal.getValue("TerminalStatus2")) {
		case 8388608: stsBackGroundColor = "gray"; break;  // 미감시 – 0:정상 , 1: 미감시 : 문상태 미감시 TerminalStatusDoorNotMonitoring
		default : stsBackGroundColor = ""; break;
	}
	/*
	if(oldIconSrc2==stsSrc2){
		return;
	}
	*/
	stsIcon2.style.removeClass("blink");
	stsIcon2.style.removeStyle("background-image");
	stsIcon2.style.css("background-image", stsSrc2);
	stsIcon2.style.css("background-color", stsBackGroundColor);
	stsIcon2.style.addClass("blink");
	
	var stsIcon3 = app.lookup("statusIcon3"+id);
	console.log("stsIcon3",stsIcon3);
	if(stsIcon3 == undefined){
		return;
	}
	//var oldIconSrc3 = stsIcon3.userAttr("subSrc");
	var stsSrc3 = null;
	switch (terminal.getValue("TerminalStatus3")) {
	    case 2: stsSrc3 = "url('theme/images/monitoring/location_information_icons_device_door_neglect_danger.png')"; break;   // (잠김 - 0:해제, 1:잠김) : 문열림 경고     TerminalStatusLock
    	case 4: stsSrc3 = "url('theme/images/monitoring/location_information_icons_map_danger.png')"; break; // (폐쇄 - 0:정상, 1:폐쇄) : 비상  TerminalStatusLockForce
    	case 8: stsSrc3 = "url('theme/images/monitoring/location_information_icons_device_open_danger.png')"; break;  // (커버 - 0:결합, 1:분리) : 템퍼 분리  TerminalStatusCover
    	default : stsSrc3 = ""; break;
	}
	/*
	if(oldIconSrc3==stsSrc3){
		return;
	}*/
	stsIcon3.style.removeClass("blink");
	stsIcon3.style.removeStyle("background-image");
	stsIcon3.style.css("background-image", stsSrc3);
	stsIcon3.style.addClass("blink");
	
	var stsIcon4 = app.lookup("statusIcon4"+id);
	console.log("stsIcon4",stsIcon4);
	if(stsIcon4 == undefined){
		return;
	}
	//var oldIconSrc4 = stsIcon4.userAttr("subSrc");
	var stsSrc4 = null;
	switch (terminal.getValue("TerminalStatus4")) {
	    case 4096: stsSrc4 = "url('theme/images/monitoring/location_information_icons_device_fire_danger.png')"; break; // (화재 - 0:정상, 1:화재) : 화재  TerminalStatusWarnFire
   		case 8192: stsSrc4 = "url('theme/images/monitoring/location_information_icons_device_panic_danger.png')"; break; // (패닉 - 0:정상, 1:패닉) : 패닉 TerminalStatusWarnPanic
    	case 16384: stsSrc4 = "url('theme/images/monitoring/location_information_icons_map_danger.png')"; break; // (위협 - 0:정상, 1:위협) : 비상 TerminalStatusWarnCricis
    	default : stsSrc4 = ""; break;
	}
	/*
	if(oldIconSrc4==stsSrc4){
		return;
	}*/
	stsIcon4.style.removeClass("blink");
	stsIcon4.style.removeStyle("background-image");
	stsIcon4.style.css("background-image", stsSrc4);
	stsIcon4.style.addClass("blink");
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getMapAreaListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var sms_getMapAreaList = e.control;
	var resultInfo = app.lookup("Result");
	var result = resultInfo.getValue("ResultCode");
	if(result==0){
		var smsGetTerminalList = app.lookup("sms_getMapAreaTerminalList");
		smsGetTerminalList.send();
	}else{
		alert("Error Occurred. ERROR-CODE: "+result);
	}
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getMapAreaTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var sms_getMapAreaTerminalList = e.control;
	var resultInfo = app.lookup("Result");
	var result = resultInfo.getValue("ResultCode");
	if(result==0){
		var oArea = app.lookup("grpImageArea");
		var mapAreaList = app.lookup("MapAreaList");
		var mapRow = mapAreaList.findFirstRow("MapCode=="+iconValue);
		if(!mapRow){
			return;
		}
		//타이틀 설정
		var title = app.lookup("iptTitle");
		title.value = mapRow.getValue("Name");
		var mapTerminalList = app.lookup("MapAreaTerminalList");
		var terminalList = dataManager.getTerminalList();
		var iconRow = mapTerminalList.findAllRow("MapCode=="+iconValue);
		var oImg = app.lookup("imgArea");
		if(mapRow){
			var selectFile = mapRow.getValue("ImageData");
			if(selectFile){
				oImg.putValue('data:image/png;base64,'+selectFile);
			}else{
				oImg.src = "theme/images/noImg.gif";//이미지가 없을 때 이미지없음 파일 필요(현재는 오픈 이미지임)
			}
			if(iconRow){
				iconRow.forEach(function(/* cpr.data.Row */ each){
					var terminalID = each.getValue("TerminalID");
					var terminalName = terminalList.findFirstRow("ID=="+terminalID).getValue("Name");
					var width = 62;
					var height = 62;
					var icon = createIcon(terminalID, terminalName, each.getValue("PosX"), each.getValue("PosY"));
					app.lookup("grpImageArea").addChild(icon, {
						"width" : width + "px",
						"height" : height + "px",
						"z-index" : "5"
					});
				});
			}
		}
	}else{
		alert("에러가 발생하였습니다. 담당자에게 문의하세요. error-code: "+result);
	}
	
	
	var terminalList = dataManager.getTerminalList();
	if (terminalList) {
		var dsTerminalList = app.lookup("TerminalList");
		dsTerminalList.clear();
		terminalList.copyToDataSet(dsTerminalList);
		
		dsTerminalList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
		

		for (var i = 0; i < dsTerminalList.getRowCount(); i++) {
			var terminalInfo = dsTerminalList.getRow(i);

			terminalMap.set(terminalInfo.getValue("ID"), terminalInfo);
			
		}
		
		for(i = 0; i<dsTerminalList.getRowCount(); i++ ){
			var Status = dsTerminalList.getValue(i, "Status");
			var ID = dsTerminalList.getValue(i, "ID");
			var msg = JSON.parse('[{"ID":'+ID+',"Status":'+Status+'}]');
			onUpdateTerminalStatus(msg,true);
		}
	}
}


function createIcon(id, name, left, top){
	
	var terminalImageSrc = "";
	var IDIndex = app.lookup("TerminalList").getColumnData("ID").lastIndexOf(id); // 해당 id를 가진 단말기가 단말기리스트에서 몇번째 단말기인지 값을 가져온다.
		var row = app.lookup("TerminalList").getRow(IDIndex);
		console.log(app.lookup("TerminalList").getColumnData("ID"));
		if(row.getValue("Type") == ""){
			//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_UnconnectedTerminal"));
		}
		if (dataManager.getOemVersion() == OEM_INNODEP_NORMAL) {
			var terminalImageSrc = getTerminalModelImageSrc(row.getValue("Type"));		
			if ( terminalImageSrc != undefined && terminalImageSrc.length > 0 ) {		
			}else{
			terminalImageSrc = "../../../../theme/images/common/Innodep_black_img_180.png";
			}
		} else {
			var terminalImageSrc = getTerminalModelImageSrc(row.getValue("Type"));		
			if ( terminalImageSrc != undefined && terminalImageSrc.length > 0 ) {		
			}else{
				terminalImageSrc = "../../../../theme/images/common/common_black_img_180.png";
		}
	}
	
		//console.log("id",id, "IDIndex",IDIndex,"row",row, "row.getValue",row.getValue("Type"), "terminalImageSrc",terminalImageSrc);
	
	//var src = "theme/images/terminal.png";//타입별 이미지확인
	//var subSrc = "url('theme/images/locations/location_information_icons_device_network_connected_no_danger.png')";
	var subSrc="";
	var src = "";
	
	var dragContainer = new cpr.controls.Container("rowIcon"+id);
	dragContainer.userAttr("TerminalID", id.toString());
	dragContainer.userAttr("stsSrc", subSrc);
	//layout
	var xYLayout = new cpr.controls.layouts.XYLayout();
	dragContainer.setLayout(xYLayout);
	//icon 생성
	var baseIcon = new cpr.controls.Button("baseIcon"+id);
	var statusIcon1 = new cpr.controls.Output("statusIcon1"+id);
	var statusIcon2 = new cpr.controls.Output("statusIcon2"+id);
	var statusIcon3 = new cpr.controls.Output("statusIcon3"+id);
	var statusIcon4 = new cpr.controls.Output("statusIcon4"+id);
	var statusBorder1 = new cpr.controls.Output("statusBorder1"+id);
	var statusBorder2 = new cpr.controls.Output("statusBorder1"+id);
	var statusBorder3 = new cpr.controls.Output("statusBorder1"+id);
	var statusBorder4 = new cpr.controls.Output("statusBorder1"+id);
	
	var terminalIcon = new cpr.controls.Output("terminalIcon"+id);	
	baseIcon.style.css({
		"background-repeat" : "no-repeat",
		"background-color" : "rgba(255,255,255,0)",
		"background-image": "url("+src+")",
		"background-size": "contain",
		"font-weight": "bolder",
		"color": "black",
		"cursor" : "default",
		"font-size" : "9px",
		"padding-right" : "12px"
	});
	baseIcon.text = name;
	baseIcon.style.addClass("symbolic");

	statusIcon1.style.css({
		"background-repeat" : "no-repeat",
		"background-image": subSrc,
		"background-size": "contain",
		"cursor" : "default"
	});
	statusBorder1.style.css({
		"background-repeat" : "no-repeat",
		"background-size": "contain",
		"cursor" : "default",
		"border" : "1px solid"
	});
	statusIcon2.style.css({
		"background-repeat" : "no-repeat",
		"background-image": subSrc,
		"background-size": "contain",
		"cursor" : "default"
	});
	statusBorder2.style.css({
		"background-repeat" : "no-repeat",
		"background-size": "contain",
		"cursor" : "default",
		"border" : "1px solid"
	});
	statusIcon3.style.css({
		"background-repeat" : "no-repeat",
		"background-image": subSrc,
		"background-size": "contain",
		"cursor" : "default"
	});
	statusBorder3.style.css({
		"background-repeat" : "no-repeat",
		"background-size": "contain",
		"cursor" : "default",
		"border" : "1px solid"
	});
	statusIcon4.style.css({
		"background-repeat" : "no-repeat",
		"background-image": subSrc,
		"background-size": "contain",
		"cursor" : "default"
	});
	statusBorder4.style.css({
		"background-repeat" : "no-repeat",
		"background-size": "contain",
		"cursor" : "default",
		"border" : "1px solid"
	});
	terminalIcon.style.css({
		"background-repeat" : "no-repeat",
		"background-image": "url("+terminalImageSrc+")",
		"background-size": "contain",
		"cursor" : "default"
	});
	
	
	dragContainer.addChild(baseIcon, {
		"top": "0px",
		"right": "0px",
		"bottom": "0px",
		"left": "0px"
	});
	dragContainer.addChild(statusIcon1, {
		"top": "26px",
		"left": "70px",
		"width": "20px",
		"height": "20px",
	});
	dragContainer.addChild(statusBorder1, {
		"top": "25px",
		"left": "68px",
		"width": "24px",
		"height": "22px",
	});
	dragContainer.addChild(statusIcon2, {
		"top": "26px",
		"left": "94px",
		"width": "20px",
		"height": "20px"
	});
	dragContainer.addChild(statusBorder2, {
		"top": "25px",
		"left": "91px",
		"width": "25px",
		"height": "22px",
	});
	dragContainer.addChild(statusIcon3, {
		"top": "48px",
		"left": "70px",
		"width": "20px",
		"height": "20px"
	});
	dragContainer.addChild(statusBorder3, {
		"top": "46px",
		"left": "68px",
		"width": "24px",
		"height": "24px",
	});
	dragContainer.addChild(statusIcon4, {
		"top": "48px",
		"left": "94px",
		"width": "20px",
		"height": "20px"
	});
	dragContainer.addChild(statusBorder4, {
		"top": "46px",
		"left": "91px",
		"width": "25px",
		"height": "24px",
	});
	dragContainer.addChild(terminalIcon, {
		"top": "42px",
		"left": "45px",
		"width": "30px",
		"height": "30px"
	});
	var oArea = app.lookup("grpImageArea");
	var rect = oArea.getActualRect();
	dragContainer.style.css({
		"left" : left==null?0:left + "px",
		"top" : top==null?0:top + "px",
		"width" : "120px",
		"height" : "72px",
		"cursor" : "default"
	});
	return dragContainer;
}
//
//
///*
// * "Button" 버튼에서 click 이벤트 발생 시 호출.
// * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
// */
//function onButtonClick(/* cpr.events.CMouseEvent */ e){
//	/**
//	 * @type cpr.controls.Button
//	 */
//	var button = e.control;
//	console.log(app.lookup("EventLogList").getRowDataRanged());
//}
