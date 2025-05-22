/************************************************
 * MonitoringTerminal.js
 * Created at 2019. 1. 7. 오후 4:13:52.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var programManager = cpr.core.Module.require("lib/ProgramManager");
var comLib;
var MRTMD_logIndexKey;
var StrLib = cpr.core.Module.require("lib/StrLib");
var TerminalStatus1 = "";
var TerminalStatus2 = "";
var TerminalStatus3 = "";
var TerminalStatus4 = "";

// Body에서 load 이벤트 발생 시 호출. 
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	
	var terminalTypeMap = dataManager.getTerminalTypeMap();
	var cmbTerminalType = app.lookup("MRTMD_cmbTerminalType");
	terminalTypeMap.forEach(function(value,key,map){		
		cmbTerminalType.addItem(new cpr.controls.Item(value,key));
	});
	
	initComboAuthLog();
	
	var cmbFKey = app.lookup("MRTMD_cmbFKey");
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyF1"), 1));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyF2"), 2));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyAccess"), 3));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyF3"), 4));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyF4"), 5));
	
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyAttend"), 11));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyLeave"), 12));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyAccess"), 13));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyOut"), 14));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyIn"), 15));
	
	//functype == 2 : 식수
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyMenu1"), 21));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyMenu2"), 22));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyMenu5"), 23));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyMenu3"), 24));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyMenu4"), 25));
	
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyAccess"), 63));
	
	for( var i = 101; i < 161; i++ ){
		var label = "Ex " + (i-100);
		cmbFKey.addItem(new cpr.controls.Item(label, i));
	}
	
	var initValue = app.getHost().initValue;
	var dmMonitoringTerminal = app.lookup("MonitoringTerminal");
	var terminalID = initValue["TerminalID"];
	TerminalStatus1 = initValue["TerminalStatus1"];
	TerminalStatus2 = initValue["TerminalStatus2"];
	TerminalStatus3 = initValue["TerminalStatus3"];
	TerminalStatus4 = initValue["TerminalStatus4"];
	//console.log(TerminalStatus1,TerminalStatus2,TerminalStatus3,TerminalStatus4);
	dmMonitoringTerminal.setValue("TerminalID", terminalID);
					
	comLib.showLoadMask("", dataManager.getString("Str_TerminalLoading"), "", 0);
	var sms_getTerminal = app.lookup("sms_getTerminal");
	sms_getTerminal.action = "/v1/terminals/"+terminalID;
	sms_getTerminal.send();
}

function onBodyBeforeUnload(/* cpr.events.CEvent */ e){
	var sms_setTerminalMonitoring = app.lookup("sms_setTerminalMonitoring");	
	sms_setTerminalMonitoring.method = "delete"	;
	sms_setTerminalMonitoring.send();
}

function initComboAuthLog() {
	var cmbAuthType = app.lookup("MRTMD_cmbAuthType");
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
		cmbAuthType.addItem(new cpr.controls.Item("Car #",20));
		
		cmbAuthType.addItem(new cpr.controls.Item("PDA", 9998));
		cmbAuthType.addItem(new cpr.controls.Item("LPR", 9999));
	}
	
	var cmbAuthResult = app.lookup("MRTMD_cmbAuthResult");
	if (cmbAuthResult) {
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_Success"), AuthLogResultSuccess));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultFail"), AuthLogResultFail));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultAccessDenied"), AuthLogResultAccessDenied));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeout"), AuthLogResultTimeout));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeoutCapture"), AuthLogResultTimeoutCapture));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeoutIdentify"), AuthLogResultTimeoutIdentify));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultAntiPassback"), AuthLogResultAntiPassback));	
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultDuress"), AuthLogResultDuress));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultBlackList"), AuthLogResultBlackList));
		
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultUnregistUser"), AuthLogResultInvalidUser));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultFPCaptureFailed"), AuthLogResultCapture));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultDuplicatedAuth"), AuthLogResultDuplicatedAuthentication));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultNetworkError"), AuthLogResultNetwork));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultServerBusy"), AuthLogResultServerBusy));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultFaceDetectionFailed"), AuthLogResultFaceDetection));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailMealPay"), AuthLogResultFailMealPay));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailMealTime"), AuthLogResultFailMealTime));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailNotExistsMealCode"), AuthLogResultFailNotExistsMealCode));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailPeriod"), AuthLogResultFailPeriod));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailMealLimit"), AuthLogResultFailMealLimit));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailDayLimit"), AuthLogResultFailDayLimit));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailMonthLimit"), AuthLogResultFailMonthLimit));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultSoftpassback"), AuthLogResultSoftpassback));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultNoMask"), AuthLogResultNoMask));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFeverDetection"), AuthLogResultFeverDetection));
	}
}

// 단말 정보 수신 완료
function onSms_getTerminalSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/* @type cpr.protocols.Submission */
	var sms_getTerminal = e.control;
	comLib.hideLoadMask();
	
	var terminalInfo = app.lookup("TerminalInfo");

	if(terminalInfo.getValue("Name") ==""){
		terminalInfo.setValue("Name", dataManager.getString("Str_UnregisteredTerminal"));
	}
	terminalInfo.setValue("TerminalStatus1", TerminalStatus1);
	terminalInfo.setValue("TerminalStatus2", TerminalStatus2);
	terminalInfo.setValue("TerminalStatus3", TerminalStatus3);
	terminalInfo.setValue("TerminalStatus4", TerminalStatus4);
	//console.log(terminalInfo.getValue("TerminalStatus1"));
	StatusImageTooltip(terminalInfo);

	
	var sms_setTerminalMonitoring = app.lookup("sms_setTerminalMonitoring");
	sms_setTerminalMonitoring.method = "post";
	sms_setTerminalMonitoring.send();
}

// 단말 정보 수신 성공
function onSms_getTerminalSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/* @type cpr.protocols.Submission */
	var sms_getTerminal = e.control;
	
}

function displayLogImage(){
	var dmAuthLogImage = app.lookup("AuthLogImage");
	var logImage = dmAuthLogImage.getValue("LogImage");
	if( logImage ){
		app.lookup("MRTMD_imgLogImage").src = "data:image/png;base64," + logImage;
	}
}

// 실시간 인증 로그 추가. main의 웹 소켓을 통해 인증로그 수신시 호출
exports.addAuthLog = function( authLog){
		
	var dsAuthLogList = app.lookup("AuthLogList");			
		
	var insertRow = dsAuthLogList.insertRowData(0, false, authLog);
	insertRow.setState(cpr.data.tabledata.RowState.UNCHANGED);
	//console.log("addAuthLog ",authLog["IndexKey"]);
	MRTMD_logIndexKey = authLog["IndexKey"];
	
	var dmAuthLogImage = app.lookup("AuthLogImage");
	var logImageIndex = dmAuthLogImage.getValue("LogIndex");
			
	//if(MRTMD_logIndexKey == logImageIndex){	// 로그 이미지가 먼저 도착한 경우 저장된 로그 인덱스를 확인하고 표시.로그 저장이 벌크 방식으로 바뀌면서 인덱스는 확인불가.
		if( authLog.LogImage){
					app.lookup("MRTMD_imgLogImage").src = "data:image/png;base64," + authLog.LogImage;
				}else{
					displayLogImage();		
				}
	//}
	
	var rowCount = dsAuthLogList.getRowCount();
	if( rowCount > 10000 ){
		var newRow = dsAuthLogList.getRowDataRanged(0, 5000);
		
		dsAuthLogList.clear();
		dsAuthLogList.build(newRow);		
	}
}

exports.setAuthLogImage = function( authLogImage ){		
	var dmAuthLogImage = app.lookup("AuthLogImage");
	dmAuthLogImage.setValue("LogIndex",authLogImage["LogIndex"])
	dmAuthLogImage.setValue("LogImage",authLogImage["PictureInfo"]["Data"])
		
	//if(MRTMD_logIndexKey == authLogImage["LogIndex"]){	// 로그 이미지가 먼저 도착한 경우 로그 이미지를 저장만 하고 스킵
		displayLogImage();
	//}
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getLogImageSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getLogImage = e.control;
	
	var dmAuthLogImage = app.lookup("AuthLogImage");
	app.lookup("MRTMD_imgLogImage").src = "data:image/png;base64," + dmAuthLogImage.getValue("LogImage");
}

// 실시간 이벤트 로그 추가. main의 웹 소켓을 통해 이벤트 로그 수신시 호출
exports.addEventLog = function( eventLog){
	
	var dsAuthLogList = app.lookup("AuthLogList");		
	
	//console.log("content : ", eventLog.Content);
		var terminal = app.lookup("TerminalInfo");
		switch(eventLog.Content){
		//Status1
		case EventLogTerminalDisconnected : terminal.setValue("TerminalStatus1", ""); break;
		case 65538 : 
			if(terminal.getValue("State") == "1"){
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
		StatusImageTooltip(terminal);
}


function onUpdateTerminalStatus(msg,force){	
		
	//var dsTerminalList = app.lookup("TerminalInfo");
	for(var i=0; i<msg.length; i++){
		//console.log("ID : ",msg[i].ID," ","Status : ",msg[i].Status);
		var terminal = app.lookup("TerminalInfo");	
		if (terminal == undefined) {			

			continue;
		}		
		
		var changedValue = msg[i].Status^terminal.getValue("State");
		terminal.setValue("State",msg[i].Status);
		
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
		
		StatusImageTooltip(terminal);
	}		
}
	
// 실시간 단말기 정보. main의 웹 소켓을 통해 단말기 라이브 정보 수신시 호출
exports.updateTerminalStatus = function(msg) {
	onUpdateTerminalStatus(msg,false);	
}

function onStatusUpdate(category, value, terminal){
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
}

function StatusImageTooltip(terminal){
	
	var stsIcon = app.lookup("MRTMD_imgStatus");
	//var oldIconSrc = stsIcon.userAttr("subSrc");
	//var stsSrc = null;
	//var MRTMD_imgStatus = app.lookup("MRTMD_imgStatus");
	var tooltip = null;
	var TerminalStatus1 = terminal.getValue("TerminalStatus1");
	//console.log(TerminalStatus1);
	switch ( TerminalStatus1) {
		case TerminalStatusConnect: //stsSrc = "url('theme/images/monitoring/green.png')";
			tooltip=dataManager.getString("Str_Connect"); break; //연결
    	case TerminalStatusRegist: //stsSrc = "url('theme/images/monitoring/green.png')"; 
    		tooltip=dataManager.getString("Str_Regist"); break; // 등록
    	case TerminalStatusUnRegist: //stsSrc = "url('theme/images/monitoring/monitoring_list_info_icons_status.png')"; 
    		tooltip=dataManager.getString("Str_UnRegist"); break; // 미등록
    	case TerminalStatusIDConflict: //stsSrc = "url('theme/images/monitoring/monitoring_list_info_icons_status.png')"; 
    		tooltip=dataManager.getString("Str_IDConflict"); break; //아이디 출동
    	case TerminalStatusInvalidType: //stsSrc = "url('theme/images/monitoring/monitoring_list_info_icons_status.png')"; 
    		tooltip=dataManager.getString("Str_TerminalInvalidType"); break; //등록된 단말기 타입이 다름
    	case TerminalStatusSyncUserIDLen: //stsSrc = "url('theme/images/monitoring/monitoring_list_info_icons_status.png')"; 
    		tooltip=dataManager.getString("Str_UserIDLen"); break; //사용자 아이디 길이
    	case TerminalStatusSyncMacAddres: //stsSrc = "url('theme/images/monitoring/monitoring_list_info_icons_status.png')"; 
    		tooltip=dataManager.getString("Str_MacAddres"); break; //맥 주소
    	case TerminalStatusSyncUserCount: //stsSrc = "url('theme/images/monitoring/monitoring_list_info_icons_status.png')"; 
    		tooltip=dataManager.getString("Str_UserCount"); break; //사용자 수
    	case TerminalStatusSyncFWVersion: //stsSrc = "url('theme/images/monitoring/monitoring_list_info_icons_status.png')"; 
    		tooltip=dataManager.getString("Str_FWVersion"); break; //펌웨어 버전
    	default : //stsSrc = "url('theme/images/monitoring/red.png')"; 
    		tooltip =""; break;
    }
  
	//stsIcon.style.removeStyle("background-image");
	//stsIcon.style.css("background-image", stsSrc);
	stsIcon.tooltip = tooltip;	
	
	
	var stsIconEvent1 = app.lookup("MRTMD_imgEvent1");
	//var stsSrcEvent1 = null;
	//var stsColorEvent1 = null;
	var tooltipEvent1 = null;
	var TerminalStatus2 = terminal.getValue("TerminalStatus2");
	
	switch ( TerminalStatus2) {
	    case TerminalStatusDoorOpen: //stsSrcEvent1 ="url('theme/images/monitoring/location_information_icons_device_door_open_normal.png')"; 
	    	//stsColorEvent1 ="";
	    	tooltipEvent1 = dataManager.getString("Str_DoorOpen"); break; //(도어 - 0:닫힘, 1:열림) : 출입문 열림
   	 	case TerminalStatusDoorClose : //stsSrcEvent1 ="url('theme/images/monitoring/location_information_icons_device_door_lock_normal.png')"; 
   	 		//stsColorEvent1 ="";
   	 		tooltipEvent1 = dataManager.getString("Str_DoorClose"); break; // (도어 - 0:닫힘, 1:열림) : 출입문 닫힘
    	case TerminalStatusDoorEmergency: //stsSrcEvent1 ="url('theme/images/monitoring/location_information_icons_device_door_open_danger.png')"; 
    		//stsColorEvent1 ="";
    		tooltipEvent1 = dataManager.getString("Str_DoorEmergency"); break; //(침입 - 0:정상, 1:침입) : 강제 침입 
    	case TerminalStatusDoorOpenWarn: //stsSrcEvent1 ="url('theme/images/monitoring/location_information_icons_device_door_neglect_danger.png')"; 
    		//stsColorEvent1 ="";
    		tooltipEvent1 = dataManager.getString("Str_DoorOpenWarn"); break;  // (방치 - 0:정상, 1:방치) : 문열림 경고
    	case TerminalStatusDoorLookState: //stsSrcEvent1 ="url('theme/images/monitoring/location_information_icons_device_door_open_normal.png')"; 
    		//stsColorEvent1 ="";
    		tooltipEvent1 = dataManager.getString("Str_DoorLookState"); break; // (상태 - 0:잠김, 1:열림) : 출입문 열림
    	case TerminalStatusDoorLockWorking: //stsSrcEvent1 ="url('theme/images/monitoring/location_information_icons_device_door_neglect_danger.png')"; 
    		//stsColorEvent1 ="";
    		tooltipEvent1 = dataManager.getString("Str_DoorLockWorking"); break; // (동작 - 0:정상, 1:고장) : 문열림 경고   
    	case TerminalStatusDoorNotMonitoring: //stsSrcEvent1 =""; 
    		//stsColorEvent1 ="gray";
    		tooltipEvent1 = dataManager.getString("Str_DoorNotMonitor"); break; // 미감시 – 0:정상 , 1: 미감시 : 문상태 미감시
    	case TerminalStatusDoorOpenState :
    		tooltipEvent1 = dataManager.getString("Str_DoorCommandOpen"); break; // 오른쪽 클릭 메뉴 -> 출입문 개방
    	default : //stsSrcEvent1 =""; 
    		tooltipEvent1 = "";
    		//stsColorEvent1 =""; 
    		break;
    }

	//stsIconEvent1.style.removeStyle("background-image");
	//stsIconEvent1.style.css("background-image", stsSrcEvent1);
	//stsIconEvent1.style.css("background-color", stsColorEvent1);
	stsIconEvent1.tooltip = tooltipEvent1;
	
	
	
	var stsIconEvent2 = app.lookup("MRTMD_imgEvent2");
	//var stsSrcEvent2 = null;
	var tooltipEvent2 = null;
	var TerminalStatus3 = terminal.getValue("TerminalStatus3");
	switch ( TerminalStatus3) {
		case TerminalStatusLock: //stsSrcEvent2="url('theme/images/monitoring/location_information_icons_device_door_neglect_danger.png')"; 
			tooltipEvent2 = dataManager.getString("Str_Lock"); break;   // (잠김 - 0:해제, 1:잠김) : 문열림 경고    
    	case TerminalStatusLockForce: //stsSrcEvent2="url('theme/images/monitoring/location_information_icons_map_danger.png')"; 
    		tooltipEvent2 = dataManager.getString("Str_LockForce"); break; // (폐쇄 - 0:정상, 1:폐쇄) : 비상 
    	case TerminalStatusCover: //stsSrcEvent2="url('theme/images/monitoring/location_information_icons_device_open_danger.png')"; 
    		tooltipEvent2 = dataManager.getString("Str_CoverSeparate"); break;  // (커버 - 0:결합, 1:분리) : 템퍼 분리 
    	default : //stsSrcEvent2=""; 
    		tooltipEvent2=""; break;
    }
 
	//stsIconEvent2.style.removeStyle("background-image");
	//stsIconEvent2.style.css("background-image", stsSrcEvent2);
	stsIconEvent2.tooltip = tooltipEvent2;
	
	
	  
	var stsIconEvent3 = app.lookup("MRTMD_imgEvent3");
	//var stsSrcEvent3 = null;
	var tooltipEvent3 = null;
	var TerminalStatus4 = terminal.getValue("TerminalStatus4");
	switch ( TerminalStatus4) {
    	case TerminalStatusWarnFire: //stsSrcEvent3 ="url('theme/images/monitoring/location_information_icons_device_fire_danger.png')"; 
    		tooltipEvent3 = dataManager.getString("Str_WarnFire"); break; // (화재 - 0:정상, 1:화재) : 화재 
    	case TerminalStatusWarnPanic: //stsSrcEvent3 ="url('theme/images/monitoring/location_information_icons_device_panic_danger.png')"; 
    		tooltipEvent3 = dataManager.getString("Str_WarnPanic"); break; // (패닉 - 0:정상, 1:패닉) : 패닉
    	case TerminalStatusWarnCricis: //stsSrcEvent3 ="url('theme/images/monitoring/location_information_icons_map_danger.png')"; 
    		tooltipEvent3 = dataManager.getString("Str_WarnCricis"); break; // (위협 - 0:정상, 1:위협) : 비상
    	default : //stsSrcEvent3 =""; 
    		tooltipEvent3=""; break;
    }

	
	//stsIconEvent3.style.removeStyle("background-image");
	//stsIconEvent3.style.css("background-image", stsSrcEvent3);
	stsIconEvent3.tooltip = tooltipEvent3;
}


// 도움말
function onMRTMD_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": DLG_MONITORING_TERMINAL}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}
