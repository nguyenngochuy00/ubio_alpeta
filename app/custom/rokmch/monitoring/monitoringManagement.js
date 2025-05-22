/************************************************
 * MonitoringManagement.js
 * Created at 2019. 1. 2. 오후 1:58:13.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var StrLib = cpr.core.Module.require("lib/StrLib");
var programManager = cpr.core.Module.require("lib/ProgramManager");
var terminalMap = new Map();
var terminalStatus = new Array();
var usint_version;
var MRMAN_init = false;
var AuthImageLeft = 50;
var AuthImagetop = 100;
var AuthImageWidth = 300; 
var AuthImageHeight = 360;
var comLib;
var usint_doorControl;
var ENABLE_INNODEP_VMS = 0;
var ENABLE_MCP040 = 0;
var loginUserGroupCode;

// Body에서 load 이벤트 발생 시 호출.
function onBodyLoad( /* cpr.events.CEvent */ e) {
	comLib = createComUtil(app);
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	usint_doorControl = dataManager.getUserInfoARMHQ().getValue("DoorControl");
	ENABLE_INNODEP_VMS = dataManager.getENABLE_INNODEP_VMS();
	ENABLE_MCP040 = dataManager.getENABLE_MCP040();
	loginUserGroupCode = getLoginUserGroupCode();
	
	var cmbEventCategory = app.lookup("MRMAN_cmbEventCategory");
	cmbEventCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_Terminal"), 1));
	cmbEventCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_Door"), 2));
	cmbEventCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_Emergency"), 3));
	cmbEventCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_ExtnalSignal"), 4));
	cmbEventCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_System"), 5));
	
	cmbEventCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_EventCategoryDoorUint"), 0x0f000000));
	cmbEventCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_EventCategoryTurnstileUint"), 0x0f000010));
	initComboEventLogContents();

	initComboAuthLog();

	app.lookup("MRMAN_cmbDoorControlOption").selectItemByValue(1000);
	var groupList = dataManager.getGroup();

	if (groupList) {
		var dsGroupList = app.lookup("GroupList");
		dsGroupList.clear();
		
		
		var treeGroup = app.lookup("MRMAN_treGroup");
		var treeItemSet = new cpr.controls.TreeItem(dataManager.getString("Str_All"), 0);
		treeItemSet.bind("label").toLanguage("Str_All");//다국어 바인딩
		treeGroup.addItem(treeItemSet);
		
				
		//dsGroupList.addRowData({"GroupID":0,"UserName":dataManager.getString("Str_All")})		
		groupList.copyToDataSet(dsGroupList);		
		dsGroupList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
		
		
		treeGroup.expandAllItems();		
		treeGroup.redraw();
	}

	var terminalList = dataManager.getTerminalList();
	if (terminalList) {
		var dsTerminalList = app.lookup("TerminalList");
		dsTerminalList.clear();
		
		// Master와 상위 부서 관리자만 모든 부서의 단말기 조회 가능 -mjy
//		if(isSuperGroupAdmin()) {
//			terminalList.copyToDataSet(dsTerminalList);
//		} else {
//			var filterCondition = "GroupCode == " + loginUserGroupCode;
//			terminalList.copyToDataSet(dsTerminalList, filterCondition);
//		}
		// 24년부터 Master를 제외한 관리자는 본인 부서 + 하위 부서만 관리 가능
		if(isLoginMaster()){
			terminalList.copyToDataSet(dsTerminalList);
		} else {
			var ids = getLoginUserAccessibleGroupIDs();
			for (var i = 0; i < terminalList.getRowCount(); i++){
				var row = terminalList.getRow(i);
				for (var j = 0; j < ids.length; j++){
					if (row.getValue("GroupCode") == ids[j]){
						dsTerminalList.addRowData(row.getRowData());
					}
				}				
			}
		}

		dsTerminalList.copyToDataSet(app.lookup("GrdTerminalList"));
		app.lookup("GrdTerminalList").commit();
		
		dsTerminalList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
		
		for (var i = 0; i < dsTerminalList.getRowCount(); i++) {
			var terminalInfo = dsTerminalList.getRow(i);
			if( terminalInfo.getValue("Status") == 0 ){	terminalInfo.setValue("Event",1);}
			terminalMap.set(terminalInfo.getValue("ID"), terminalInfo);
		}
		
		var udcTerminalList = app.lookup("MRMAN_grdTerminalList");
		udcTerminalList.redraw();
		dsTerminalList.setSort("ID asc");
		
		initComboTerminalName(dsTerminalList); // 장비명 셋팅 - sep
		
	}
	MRMAN_init = true;

//	var sms_getTerminalLiveInfo = app.lookup("sms_getTerminalLiveInfo");
//	sms_getTerminalLiveInfo.send();
	
	
	for(i = 0; i<dsTerminalList.getRowCount(); i++ ){
		var Status = dsTerminalList.getValue(i, "Status");
		var ID = dsTerminalList.getValue(i, "ID");
		var msg = JSON.parse('[{"ID":'+ID+',"Status":'+Status+'}]');
		onUpdateTerminalStatus(msg,true);
	}
	
	treeGroup.selectItemByValue(loginUserGroupCode);
}

function initComboEventLogContents() {
	var cmbEventContent = app.lookup("MRMAN_cmbEventContent");

	// category - Terminal
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Disconnected"), 65537));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Connected"), 65538));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Locked"), 65539));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Unlocked"), 65540));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Tamper"), 65541));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Attached"), 65542));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Lockdowned"), 65543));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_OptionPollingtime"), 65544)); // 폴링타임 추가 otk

	// category - door
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorOpen"), 131073));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorClose"), 131074));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorUnlock"), 131075));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorLock"), 131076));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorForced"), 131077));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorNotClosed"), 131078));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorLockRestored"), 131079));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorLockError"), 131080));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorNotMonitor"), 131081));
	
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorCommandOpen"), 131083));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorCommandClose"), 131084));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorCommandOpenTemp"), 131082));
	//cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorCommandOpenTemp"), ));
	//출입문 임시개방은 이벤트가 발생하지 않아서 코드 확인 불가 상태라 주석처리
	
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorRemoteOpen"), 131088));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorRemoteUnlock"), 131089));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorRemoteLock"), 131090));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorChange"), 131091));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorIndoorOpen"), 131092));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Door2Open"), 131093));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Door2Close"), 131094));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Door2IndoorOpen"), 131095));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorNotClosedClear"), 131096));

	// category - emergency
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyAlarm"), 196609));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyDisarm"), 196610));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyFireDetectStart"), 196611));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyFireDetectStop"), 196612));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyPanicDetectStart"), 196613));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyPanicDetectStop"), 196614));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyCrisisDetectStart"), 196615));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyCrisisDetectStop"), 196616));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyBlacklistAttempt"), 196617));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyDuress"), 196624));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencySystemError"), 196625));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyDoorEmergency"), 196626));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyDoor2"), 196627));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyDoor2Emergency"), 196628));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyDoor2NotClosedClear"), 196629));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyFire"), 196630));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyPanic"), 196631));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyPanicClear"), 196632));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyFireClear"), 196633));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyRelease"), 196634));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyFPSensorAbnormal"), 196640));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyDBAbnormal"), 196641));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyRTCAbnormal"), 196642));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyTouchAbnormal"), 196643));

	// category - external signal
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_ExtnalSignal1Start"), 262145));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_ExtnalSignal1Stop"), 262146));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_ExtnalSignal2Start"), 262147));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_ExtnalSignal2Stop"), 262148));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_ExtnalSignal3Start"), 262149));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_ExtnalSignal3Stop"), 262150));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_ExtnalSignal4Start"), 262151));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_ExtnalSignal4Stop"), 262152));

	// category - system
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_SystemFPUpdate"), 327681));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_SystemUIUpdate"), 327682));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_SystemSystemUpdate"), 327683));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_SystemTimeUpdate"), 327684));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_SystemFixedUpdate"), 327685));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_SystemAllUpdate"), 327686));
	
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EventContentExitSwitchPress"), 0x0f000001));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EventContentDoorOpen"), 0x0f000002));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EventContentDoorClose"), 0x0f000003));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EventContentPersonPass"), 0x0f000011));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EventContentPersonNotPass"), 0x0f000012));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EventContentTurnstileError"), 0x0f000013));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EventContentTurnstileDropArm"), 0x0f000014));
}

function initComboAuthLog() {
	var cmbAuthType = app.lookup("MRMAN_cmbAuthType");
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
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("###"), 11)); // 아이디/유니크 아이디로 인증 수단 요청
		
		
		if(ENABLE_MCP040 == 1){
				
			//cmbAuthType.addItem(new cpr.controls.Item("RFID", 0x10));
			cmbAuthType.addItem(new cpr.controls.Item("Inside", 15));
		}	
		
		cmbAuthType.addItem(new cpr.controls.Item("PDA", 9998));
		cmbAuthType.addItem(new cpr.controls.Item("LPR", 9999));
		cmbAuthType.addItem(new cpr.controls.Item("LPR RF Card", 9997));
	}

	
	var cmbAuthResult = app.lookup("MRMAN_cmbAuthResult");
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
		
		cmbAuthResult.addItem(new cpr.controls.Item("5부제 위반", 124));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultLprFail"), 125));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultLprUnRegist"), 126));
		
	}

	var cmbFKey = app.lookup("MRMAN_cmbFKey");
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyF1"), 1));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyF2"), 2));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyAccess"), 3));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyF3"), 4));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyF4"), 5));
	
	//functype == 1 : 근태
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
}

// 장비명 표시를 위한 콤보박스 세팅(실시간 출입정보, 이벤트 기록 리스트) - sep
// 장비명을  콤보박스가 아닌 output으로 변경. - mjy
function initComboTerminalName(dsTerminalList) {
//	var cmbTerminalNameAuth = app.lookup("MRMAN_cmbTerminalName");
	var cmbTerminalNameEvent = app.lookup("MRMAN_cmbTerminalNameEvent");
	
	if (dsTerminalList.getRowCount() > 0) {
		var i;
		for (i = 0; i < dsTerminalList.getRowCount(); i++) {
			//console.log(dsTerminalList.getValue(i, "ID") + ", " + dsTerminalList.getValue(i, "Name"));
			// 실시간 출입정보 장비명 콤보박스를 기기 이름과 아이디로 설정
//			cmbTerminalNameAuth.addItem(new cpr.controls.Item(dsTerminalList.getValue(i, "Name"), dsTerminalList.getValue(i, "ID")));
			// 이벤트 기록 장비명 콤보박스를 기기 이름과 아이디로 설정
			cmbTerminalNameEvent.addItem(new cpr.controls.Item(dsTerminalList.getValue(i, "Name"), dsTerminalList.getValue(i, "ID")));
		}
	
	}
}


function onUpdateTerminalStatus(msg,force){	

	//console.log("msg.length: " + msg.length);

	//var dsTerminalList = app.lookup("TerminalInfo");
	for(var i=0; i<msg.length; i++){
		//console.log("ID : ",msg[i].ID," ","Status : ",msg[i].Status);
		var terminal = terminalMap.get(msg[i].ID);
		if (terminal == undefined) {	
			//console.log("terminal == undefined" );	
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
exports.updateTerminalStatus = function(msg) {
	onUpdateTerminalStatus(msg,false);
	grdTerminalReload(); // 그룹 선택한 상태에서는 모니터링이 잘 반영되지 않아서 바뀐값 직접 다시 넣어주기	
}

exports.updateTerminalGroupCode = function( groupID, terminalIDList ) {
	
	var curGroupID = 0;
	
	var treeGroup = app.lookup("MRMAN_treGroup");
	var group = treeGroup.getSelectionFirst();
	if( group ){curGroupID = group.value;}

	var dsTerminalList = app.lookup("TerminalList");
	dsTerminalList.clearFilter(); // !! 필터가 걸려있는 경우 단말 정보가 반환되지 않음. 데이터 수정을 위해 필터 해제 후 업데이트 진행
			
	for(var i=0; i<terminalIDList.length; i++){
		var terminal = terminalMap.get(terminalIDList[i]);
		if (terminal == undefined) {			
			continue;
		}		
		terminal.setValue("GroupCode",groupID);	
	}
	if (group.value != 0) {
		dsTerminalList.setFilter("GroupCode == " + parseInt(group.value, 10));
	}
	var gridTerminalList = app.lookup("MRMAN_grdTerminalList");
	gridTerminalList.redraw();	
}

function onStatusUpdate(category, value, terminal){
	
	// console.log("category: " + category + ", value: " + value ); 
	
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

// 단말기 정보 업데이트. type - 1:추가, 2:수정, 3:삭제
exports.updateTerminalInfo = function( terminalInfo, type ){
	
	//console.log("updateTerminalInfo recv info: ",terminalInfo);
	
	var dsTerminalList = app.lookup("TerminalList");
	//var terminalRow = dsTerminalList.findFirstRow("ID == "+terminalInfo.ID);
	var terminalRow = terminalMap.get(terminalInfo.ID);
		
	if( type == 1 || type == 2 ){ // type : 1 추가, 2 : 수정
		if( terminalRow ){
			//console.log("updateTerminalInfo - get map data :",terminalRow.getRowData());
			//terminalRow.setValue("UserName", terminalInfo.Name);
		} else {			
			if( terminalInfo.Status == 1 ){
				terminalInfo.Event = 0; // 아무것도 표시하지 않기 위해
			}
	
			terminalRow = dsTerminalList.addRowData(terminalInfo);
			terminalRow = terminalMap.get(terminalInfo.ID);			
			if( terminalRow ){
				//console.log("updateTerminalInfo add row: ",terminalRow.getRowData());
				terminalMap.set(terminalInfo.ID, terminalRow);
			}
			/*dsTerminalList.addRowData(terminalInfo);
			var getTerminalInfo= dsTerminalList.findFirstRow("ID == "+ terminalInfo.ID);
			if (getTerminalInfo) {
				terminalMap.set(terminalInfo.ID, getTerminalInfo);
			}
			* */	
		}						
	}else if( type == 3){
		if( terminalRow ){
			dsTerminalList.realDeleteRow(terminalRow.getIndex());
		}
		terminalMap.delete(terminalInfo.ID);
	}
	dsTerminalList.commit();
	app.lookup("MRMAN_grdTerminalList").redraw();
}

// 실시간 인증 로그 추가. main의 웹 소켓을 통해 인증로그 수신시 호출
exports.addAuthLog = function(authLog) {
	var temperatureUnit = dataManager.getTemperatureUnit();
	if( dataManager.getOemVersion() == OEM_DUKYANG_WARDOFFICE && dataManager.getAccountID() != 0xDE0B6B3A7640000 ){
		authLog.UserID = "";
		authLog.UserName = "";
		authLog.UniqueID = "";
	}
	var dsAuthLogList = app.lookup("AuthLogList");
	
//	console.log(authLog);
	
	// 소속부서의 단말기에 관한 인증로그만 출력
	if(!isSuperGroupAdmin()) { // Master와 상위 부서 관리자가 아닐 경우
		var terminalID = authLog.TerminalID;
		var dsTerminalList = app.lookup("TerminalList");
		var condition = "ID == " + terminalID + " && GroupCode == " + loginUserGroupCode;
		if(dsTerminalList.findAllRow(condition).length == 0){ // 로그인한 사용자의 부서 단말기가 아니라면 pass
			return;
		} else { // 소속부서의 단말기라면 그대로 진행.
		}
	}
	
	// 자운대 추가 로직
	var insertRow = dsAuthLogList.insertRowData(0, false, authLog);	
	insertRow.setState(cpr.data.tabledata.RowState.UNCHANGED);
	if( authLog.ReserveType == 1 && authLog.ReserveData.length>4){
		var data = authLog.ReserveData.split(',');
		if(data[3] < 10){
			data[3] = "0"+data[3];
 		}
 		
 		var temp = "";
 		if( data[1]== 1){
 			temp = dataManager.getString("Str_Mask")+ " ";
 		}else if( data[1]== 2){
 			temp = dataManager.getString("Str_MaskInvalid")+ " ";
 		}else if( data[1]== 3){
 			temp = dataManager.getString("Str_MaskNo")+ " ";
 		}
 		if( temperatureUnit == 1 ){
 			var tempValue = (parseFloat(data[2]+"."+data[3]) * 9 / 5 + 32).toFixed(2);
 			temp += tempValue;
 		}else{
 			temp += parseFloat(data[2]+"."+data[3]).toFixed(2);	
 		}
 				
 		if( temperatureUnit == 0 ){ 			
 			insertRow.setValue("Detail", temp+"℃");	
 		} else if( temperatureUnit == 1 ){ 			
 			insertRow.setValue("Detail", temp+"℉");
 		}
		
		insertRow.setValue("DetailColor", data[0]);
		
	}
	//console.log(authLog);
	var rowCount = dsAuthLogList.getRowCount();
	if (rowCount > 10000) {
		var newRow = dsAuthLogList.getRowDataRanged(0, 5000);

		dsAuthLogList.clear();
		dsAuthLogList.build(newRow);
	}

	app.lookup("MRMAN_grdAuthlog").redraw();
	
	if( authLog.LogImage ){
		popupLogImage(-1,authLog.LogImage,insertRow.getValue("Detail"),insertRow.getValue("DetailColor"));
	}
}

// 실시간 이벤트 로그 추가. main의 웹 소켓을 통해 이벤트로그 수신시 호출
exports.addEventLog = function(eventLog) {
	var dsEventLogList = app.lookup("EventLogList");
//	console.log(eventLog);

	// Master와 상위 부서 관리자가 아니면, 소속부서의 단말기만 그리드에 출력. (소속부서의 단말기가 아니라면 제어 못할테지만,,) -mjy
	if(!isSuperGroupAdmin()) {
		var terminalID = eventLog.TerminalID;
		var dsTerminalList = app.lookup("TerminalList");
		var condition = "ID == " + terminalID + " && GroupCode == " + loginUserGroupCode;
		if(dsTerminalList.findAllRow(condition).length == 0){
			return;
		} else { // 소속부서의 단말기라면 그대로 진행.
		}
	}
	
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
	var terminal = terminalMap.get(terminalID);
	if (terminal) {
		var status = terminal.getValue("Status");
		//console.log("실시간 이벤트 코드 : ",eventVal);
		switch(eventVal){
			//Status1
			case EventLogTerminalDisconnected : terminal.setValue("TerminalStatus1", ""); break;
			case 65538 : 
				if(status == "1"){
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
			// case 131088 : terminal.setValue("TerminalStatus2", TerminalStatusDoorOpenState); break;
			// case 131089 : terminal.setValue("TerminalStatus2", TerminalStatusDoorOpenState); break;
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
			case 196611 : terminal.setValue("TerminalStatus4", TerminalStatusWarnFire);	break;
			case 196612 : terminal.setValue("TerminalStatus4", ""); break;
			//패닉 감지 시작, 패닉 감지 종료
			case 196613 : terminal.setValue("TerminalStatus4", TerminalStatusWarnPanic); break;
			case 196614 : terminal.setValue("TerminalStatus4", ""); break;
			//비상 감지 시작, 비상 감지 종료
			case 196615 : terminal.setValue("TerminalStatus4", TerminalStatusWarnCricis); break;
			case 196616 : terminal.setValue("TerminalStatus4", ""); break;
		}
	}
}

// 그룹 클릭시
function onMRMAN_treGroupSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/* @type cpr.controls.Tree */
	var mRMAN_treGroup = e.control;
	var group = mRMAN_treGroup.getSelectionFirst();

	var dsTerminalList = app.lookup("TerminalList");
	var grdTerminalList = app.lookup("GrdTerminalList");
	var groupList = app.lookup("GroupList");
	
	grdTerminalList.clear();
	// Master와 상위 부서 관리자만 전체 부서의 단말기 볼 수 있도록 - mjy
//	if(isSuperGroupAdmin()) { // Master면 기존과 동일
	if(isLoginMaster()){
		if (group.value == 0) {
			//console.log("clear filter");
			//dsTerminalList.clearFilter();
			dsTerminalList.copyToDataSet(grdTerminalList);
		} else {
			//console.log("group.value");
			if (group.parentValue != 0){
				//dsTerminalList.setFilter("GroupCode == " + parseInt(group.value, 10));
				dsTerminalList.copyToDataSet(grdTerminalList, "GroupCode == " + parseInt(group.value, 10));
			} else {
				var rows = groupList.findAllRow("Parent == " + group.value);
				var conditionString = "GroupCode == " + group.value;
//				for (var i = 0; i < rows.length; i++){
//					conditionString += " || GroupCode == ";
//					conditionString += rows[i].getValue("GroupID");		
//				}
				//console.log(conditionString);
				//dsTerminalList.setFilter(conditionString + "");
				dsTerminalList.copyToDataSet(grdTerminalList, conditionString);
			}
		}
	} else {
//		if(group.value == 0 || group.value == loginUserGroupCode) {
//			//dsTerminalList.setFilter("GroupCode == " + loginUserGroupCode);
//			dsTerminalList.copyToDataSet(grdTerminalList, "GroupCode == " + loginUserGroupCode);
//		} else {
//			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PrivilegeAlert"));
//			app.lookup("MRMAN_treGroup").selectItemByValue(loginUserGroupCode);	
////			dsTerminalList.setFilter("GroupCode == " + parseInt(group.value, 10));
//		}
		
		if(isAccessibleGroup(group.value)){
			dsTerminalList.clearFilter();
        	dsTerminalList.copyToDataSet(grdTerminalList, "GroupCode == " + parseInt(group.value, 10));
		} else {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PrivilegeAlert"));
			app.lookup("MRMAN_treGroup").selectItemByValue(loginUserGroupCode);	
		}
	}
	
	dsTerminalList.clearFilter();
	grdTerminalList.commit();
	
	var gridTerminalList = app.lookup("MRMAN_grdTerminalList");
	gridTerminalList.redraw();
}

// 단말기 리스트에서 단말기 더블 클릭시
function onMRMAN_grdTerminalListRowDblclick( /* cpr.events.CGridEvent */ e) {
	if( dataManager.getOemVersion() == OEM_DUKYANG_WARDOFFICE && dataManager.getAccountID() != 0xDE0B6B3A7640000 ){return;}
	//console.log(e.row.getValue("TerminalStatus1"),e.row.getValue("TerminalStatus2"),e.row.getValue("TerminalStatus3"));
	var initValue = [e.row.getValue("TerminalStatus1"), e.row.getValue("TerminalStatus2"), 
						e.row.getValue("TerminalStatus3"),e.row.getValue("TerminalStatus4")];
	/* @type cpr.controls.Grid */
	var mRMAN_grdTerminalList = e.control;
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target": DLG_MONITORING_TERMINAL,
			"InitVal": {
				"ID": e.row.getValue("ID"),
				"TerminalStatus1" : e.row.getValue("TerminalStatus1"),
				"TerminalStatus2" : e.row.getValue("TerminalStatus2"),
				"TerminalStatus3" : e.row.getValue("TerminalStatus3"),
				"TerminalStatus4" : e.row.getValue("TerminalStatus4")
			}
		}
	});

	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

// 단말기 라이브 정보 수신 완료
function onSms_getTerminalLiveInfoSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var dmResult = app.lookup("Result")
	terminalMap.clear();
	
	if (dmResult.getValue("ResultCode") == COMERROR_NONE) {
		var terminalLiveInfo = app.lookup("TerminalLiveInfo");

		var count = terminalLiveInfo.getRowCount();	
		for (var i = 0; i < count; i++) {
			var liveInfo = terminalLiveInfo.getRow(i);
			
			var terminalInfo = terminalMap.get(liveInfo.getValue("ID"));
			if( terminalInfo ){				
				if(terminalInfo.getValue("Status")!= liveInfo.getValue("Status")){
					terminalInfo.setValue("Status", liveInfo.getValue("Status"));	
					var msg = JSON.parse('[{"ID":'+liveInfo.getValue("ID")+',"Status":'+liveInfo.getValue("Status")+'}]');
					onUpdateTerminalStatus(msg,true);			
				}
			} 
		}
	}
	
	if (ENABLE_MCP040 == 1)
	{
		var sms_get_mcp_list = app.lookup("sms_get_mcp_list");
		sms_get_mcp_list.send();			
	}	
}

// 단말기 라이브 정보 수신 에러
function onSms_getTerminalLiveInfoSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result")
	result.setValue("ResultCode", COMERROR_NET_ERROR)
}

// 단말기 라이브 정보 수신 타임아웃
function onSms_getTerminalLiveInfoSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result")
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT)
}

function processDoorCommand(doorCommand){
	var grdTerminalList = app.lookup("MRMAN_grdTerminalList");
	var terminalRow = grdTerminalList.getSelectedRow();
	if (terminalRow) {
		var dmDoorOption = app.lookup("DoorOption");
		var terminalID = terminalRow.getValue("ID");
		//var terminalID = terminalRow.getValue("Type");

		dmDoorOption.setValue("ID", terminalID);
		dmDoorOption.setValue("Option", doorCommand);

		var sms_postTerminalDoorControl = app.lookup("sms_postTerminalDoorControl");
		sms_postTerminalDoorControl.action = "v1/terminals/" + terminalID + "/control/door";
		sms_postTerminalDoorControl.send();
	}
}


function processResetEmergencyControl(){
	var grdTerminalList = app.lookup("MRMAN_grdTerminalList");
	var terminalRow = grdTerminalList.getSelectedRow();
	if (terminalRow) {
	
		var terminalID = terminalRow.getValue("ID");

		var EmergencyOption = app.lookup("EmergencyOption");
		
		EmergencyOption.setValue("TerminalID", terminalID);
		EmergencyOption.setValue("Status", 0);
		EmergencyOption.setValue("Type", 0);

		var sms_postTerminalResetEmergencyControl = app.lookup("sms_postTerminalResetEmergencyControl");
		sms_postTerminalResetEmergencyControl.action = "v1/terminals/" + terminalID + "/control/emergency";
		sms_postTerminalResetEmergencyControl.send();
	}
}



function processAcuDoorCommand(opt, door /* 1~4 */){
	
	// opt 0-> Acu Open 
	
	// opt 1-> Acu Unlock
	
	// opt 2-> Acu Lock
	
	// opt 3-> Acu Arm
	
	// opt 4-> Acu Disarm
	
	
	var grdTerminalList = app.lookup("MRMAN_grdTerminalList");
	var terminalRow = grdTerminalList.getSelectedRow();
	if (terminalRow) {
		var dmAcuDoorOption = app.lookup("AcuDoorOption");
		var terminalID = terminalRow.getValue("ID");

		dmAcuDoorOption.setValue("AcuID", terminalID);
		dmAcuDoorOption.setValue("Status", opt);
		dmAcuDoorOption.setValue("Door", door);

		var sms_PostAcuDoorControl = app.lookup("sms_PostAcuDoorControl");
		sms_PostAcuDoorControl.action = "v1/acus/" + terminalID + "/control/door";
		sms_PostAcuDoorControl.send();
	}
}


function processShowAcuStatus(){

	var grdTerminalList = app.lookup("MRMAN_grdTerminalList");
	var terminalRow = grdTerminalList.getSelectedRow();
	if (terminalRow) {
		var appld = "app/main/terminals/optionMCP/AcuDetailStatus" + "?" + usint_version;
		app.getRootAppInstance().openDialog(appld, {width: 800, height: 400}, function(dialog){
			dialog.bind("headerTitle").toLanguage("Str_MCP040");
			dialog.initValue = {"TerminalID":terminalRow.getValue("ID")};
			dialog.style.header.css("background-color", "#528443");
			dialog.modal = true;
		}).then(function(input){
			;
		});
	}
	
}

function processSyncCommand(){
	var grdTerminalList = app.lookup("MRMAN_grdTerminalList");
	var terminalRow = grdTerminalList.getSelectedRow();
	if (terminalRow) {
		var appld = "app/main/terminals/popup/terminalSync" + "?" + usint_version;
		app.getRootAppInstance().openDialog(appld, {width: 500, height: 300}, function(dialog){
			dialog.bind("headerTitle").toLanguage("Str_Sync");
			dialog.initValue = {"ID":terminalRow.getValue("ID"),"TimezoneVersion":terminalRow.getValue("TimezoneVersion")};
			dialog.style.header.css("background-color", "#528443");
			dialog.modal = true;
		}).then(function(input){
			;
		});
	}
}

/*
// 단말 리스트 우클릭 - contextmenu 이벤트 발생 시 호출.
function onMRMAN_grdTerminalListContextmenu(  e) {
	
	var mRMAN_grdTerminalList = e.control;
	e.preventDefault();
	
	var grdTerminalList = app.lookup("MRMAN_grdTerminalList");
	var terminalRow = grdTerminalList.getSelectedRow();
	if (terminalRow == null || terminalRow.getValue("Status") == 1) {
		return;
	}

	var terminalMenu = new cpr.controls.Menu();
	if (ENABLE_INNODEP_VMS == 0)
	{	
		//var terminalMenu = new cpr.controls.Menu();
		terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandOpenTemp"), 0, ""));
		terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandOpen"), 1, ""));
		terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandClose"), 2, ""));
		if( dataManager.getSystemBrandType() == BRAND_NITGEN ){
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_Sync"), 3, ""));
	} 
	else 
	{
		var TerminalLiveInfo = app.lookup("TerminalLiveInfo");
		
		//var terminalInfo = terminalMap.get(terminalRow.getValue("TerminalID"));
		
		var index = terminalRow.getIndex();
		
		var terminalType = TerminalLiveInfo.getRow(index).getValue("Type");
		console.log("terminalType: " + terminalType);
		if (21 == parseInt(terminalType))
		{// MCP040 
		
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandOpenTemp") + "1", 4, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandOpenTemp") + "2", 5, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandOpenTemp") + "3", 6, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandOpenTemp") + "4", 7, ""));

			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandOpen") + "1", 8, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandOpen") + "2", 9, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandOpen") + "3", 10, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandOpen") + "4", 11, ""));
			
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandClose") + "1", 12, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandClose") + "2", 13, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandClose") + "3", 14, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandClose") + "4", 15, ""));
					
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_MCPSettingAlarm") + "1", 16, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_MCPSettingAlarm") + "2", 17, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_MCPSettingAlarm") + "3", 18, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_MCPSettingAlarm") + "4", 19, ""));
			
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_MCPSettingDisalarm") + "1", 20, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_MCPSettingDisalarm") + "2", 21, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_MCPSettingDisalarm") + "3", 22, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_MCPSettingDisalarm") + "4", 23, ""));
				
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_State"), 24, ""));
			
		}		
		else
		{
			//var terminalMenu = new cpr.controls.Menu();
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandOpenTemp"), 0, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandOpen"), 1, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandClose"), 2, ""));
			if( dataManager.getSystemBrandType() == BRAND_NITGEN ){
				terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_Sync"), 3, ""));			
		}
	}	



	var rect = app.getActualRect();
	var contextTop = (e.clientY - rect.top) > rect.height/2 ? e.clientY - rect.top*2 : e.clientY - rect.top;
	terminalMenu.style.css({
		left: e.clientX - rect.left + "px",
		top: contextTop + "px",
		height: "60px",
		width: "200px",
		position: "absolute"
	});
	terminalMenu.focus();

	
	terminalMenu.addEventListener("selection-change", function(e) {
		switch (terminalMenu.value) {
			case "0":	processDoorCommand(0);  break; //Str_DoorCommandOpenTemp				
			case "1":	processDoorCommand(1);  break; //Str_DoorCommandOpen				
			case "2":	processDoorCommand(2);  break; //Str_DoorCommandClose
			case "3":   processSyncCommand(); // 단말 동기화
			default:	break;
		}		
		terminalMenu.dispose();
	});
	
	

	terminalMenu.addEventListener("blur", function(e) {
		terminalMenu.dispose();
	});
	app.floatControl(terminalMenu);
}
*/


// 도움말
function onMRMAN_imgHelpPageClick( /* cpr.events.CMouseEvent */ e) {
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target": DLG_HELP,
			"ID": menu_id
		}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

/*
 * 데이터셋에서 insert 이벤트 발생 시 호출.
 * row가 추가되는 경우 발생하는 이벤트. 발생 메소드 : addRow, addRowData, insertRow, insertRowData
 */
function onTerminalListInsert(/* cpr.events.CDataEvent */ e){
	if( MRMAN_init == false ){return;}
	/** @type cpr.data.DataSet	 */
	var terminalList = e.control;
	var dsTerminalList = app.lookup("TerminalList");
	dsTerminalList.setSort("ID asc");
	dsTerminalList.commit();
	
	//var udcTerminalList = app.lookup("MRMAN_grdTerminalList");
	//udcTerminalList.redraw();		
	
}

/*
 * 데이터셋에서 delete 이벤트 발생 시 호출.
 * 로우가 삭제되는 경우 발생하는 이벤트. 발생 메소드 : deleteRow
 */
function onTerminalListDelete(/* cpr.events.CDataEvent */ e){
	/** 
	 * @type cpr.data.DataSet
	 */
	var terminalList = e.control;
	var dsTerminalList = app.lookup("TerminalList");
	dsTerminalList.setSort("ID asc");
	dsTerminalList.commit();
}

// 단말기 리스트 sort 이벤트 발생 시 호출. 데이터가 정렬되는 경우 발생하는 이벤트. 발생 메소드 : setSort, setSortExpr, clearSort
function onTerminalListSort(/* cpr.events.CDataEvent */ e){
	if( MRMAN_init == false ){return;}
	
	/** @type cpr.data.DataSet */
	var terminalList = e.control;
	var dsTerminalList = e.control;    
	
	terminalMap.clear();
	
	//console.log("terminal sort called");
	for (var i = 0; i < dsTerminalList.getRowCount(); i++) {
		var terminalInfo = dsTerminalList.getRow(i); 
		terminalMap.set(terminalInfo.getValue("ID"), terminalInfo);
		//console.log("map add : ",terminalInfo.getValue("Type"),terminalInfo.getRowData());
	}
	/*
	terminalMap.forEach((value, key, map) => {
  		console.log(key + '$' + value.getRowData());
	});
	* */
	//console.log("make new map");	
}


/*
 * 그리드에서 cell-mouseover 이벤트 발생 시 호출.
 * Grid의 Cell mouseover시 발생하는 이벤트.
 */
function onMRMAN_grdTerminalListCellMouseover(/* cpr.events.CGridEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	//var mRMAN_grdTerminalList = e.control;
	var MRMAN_grdTerminalList = app.lookup("MRMAN_grdTerminalList");
	var dsTerminalList = app.lookup("TerminalList");
	e.control.tooltip="";
	for(var i = 0; i<dsTerminalList.getRowCount(); i++){
		var row = dsTerminalList.getRow(i);
		if(row.getValue("ID") == e.control.getCellValue(e.rowIndex, 1)){
			//console.log(e.rowIndex,e.cellIndex);
			if(e.rowIndex == i && e.cellIndex == 4){
				switch (row.getValue("TerminalStatus1")) {
					case TerminalStatusConnect: 
						e.control.tooltip=dataManager.getString("Str_Connect"); break; //연결
    				case TerminalStatusRegist: 
    					e.control.tooltip=dataManager.getString("Str_Regist"); break; // 등록
    				case TerminalStatusUnRegist:    					
    					e.control.tooltip=dataManager.getString("Str_UnRegist"); break; // 미등록
    				case TerminalStatusIDConflict:     					
    					e.control.tooltip=dataManager.getString("Str_IDConflict"); break; //아이디 출동
    				case TerminalStatusInvalidType:     					
    					e.control.tooltip=dataManager.getString("Str_TerminalInvalidType"); break; //등록된 단말기 타입이 다름
    				case TerminalStatusSyncUserIDLen:     					 
    					e.control.tooltip=dataManager.getString("Str_UserIDLen"); break; //사용자 아이디 길이
    				case TerminalStatusSyncMacAddres:     				
    					e.control.tooltip=dataManager.getString("Str_MacAddres"); break; //맥 주소
    				case TerminalStatusSyncUserCount:     					
    					e.control.tooltip=dataManager.getString("Str_UserCount"); break; //사용자 수
    				case TerminalStatusSyncFWVersion:     					
    					e.control.tooltip=dataManager.getString("Str_FWVersion"); break; //펌웨어 버전
    				default : 
    					e.control.tooltip =""; break;
   				 }
			}else if(e.rowIndex == i && e.cellIndex == 6){
				//console.log(row.getValue("TerminalStatus2"));
					switch ( row.getValue("TerminalStatus2")) {	
	   				 case TerminalStatusDoorOpen: 
	    				e.control.tooltip = dataManager.getString("Str_DoorOpen"); break; //(도어 - 0:닫힘, 1:열림) : 출입문 열림
   	 				case TerminalStatusDoorClose: 
   	 					e.control.tooltip = dataManager.getString("Str_DoorClose"); break; // (도어 - 0:닫힘, 1:열림) : 출입문 닫힘
    				case TerminalStatusDoorEmergency: 
    					e.control.tooltip = dataManager.getString("Str_ARMYHQ_DoorEmergency"); break; //(침입 - 0:정상, 1:침입) : 강제 침입 
    				case TerminalStatusDoorOpenWarn: 
    					e.control.tooltip = dataManager.getString("Str_DoorOpenWarn"); break;  // (방치 - 0:정상, 1:방치) : 문열림 경고
    				case TerminalStatusDoorLookState: 
    					e.control.tooltip = dataManager.getString("Str_DoorLookState"); break; // (상태 - 0:잠김, 1:열림) : 출입문 열림
    				case TerminalStatusDoorLockWorking: 
    					e.control.tooltip = dataManager.getString("Str_DoorLockWorking"); break; // (동작 - 0:정상, 1:고장) : 문열림 경고   
    				case TerminalStatusDoorNotMonitoring: 
    					e.control.tooltip = dataManager.getString("Str_DoorNotMonitor"); break; // 미감시 – 0:정상 , 1: 미감시 : 문상태 미감시
    				case TerminalStatusDoorOpenState :
    					e.control.tooltip = dataManager.getString("Str_DoorCommandOpen"); break; // 오른쪽 클릭 메뉴 -> 출입문 개방
    				default : 
    					e.control.tooltip = "";
    				break;
    				}
			}else if(e.rowIndex == i && e.cellIndex == 7){
					switch (  row.getValue("TerminalStatus3")) {
						case TerminalStatusLock: 
							e.control.tooltip = dataManager.getString("Str_Lock"); break;   // (잠김 - 0:해제, 1:잠김) : 문열림 경고    
    					case TerminalStatusLockForce: 
    						e.control.tooltip = dataManager.getString("Str_LockForce"); break; // (폐쇄 - 0:정상, 1:폐쇄) : 비상 
    					case TerminalStatusCover: 
    						e.control.tooltip = dataManager.getString("Str_CoverSeparate"); break;  // (커버 - 0:결합, 1:분리) : 템퍼 분리 
    					default : 
    						e.control.tooltip=""; break;
    				}
			}else if(e.rowIndex == i && e.cellIndex == 8){
				switch ( row.getValue("TerminalStatus4")) {
    				case TerminalStatusWarnFire: 
    				e.control.tooltip = dataManager.getString("Str_WarnFire"); break; // (화재 - 0:정상, 1:화재) : 화재 
    				case TerminalStatusWarnPanic: 
    				e.control.tooltip = dataManager.getString("Str_WarnPanic"); break; // (패닉 - 0:정상, 1:패닉) : 패닉
    				case TerminalStatusWarnCricis: 
    				e.control.tooltip = dataManager.getString("Str_WarnCricis"); break; // (위협 - 0:정상, 1:위협) : 비상
    				default :  
    				e.control.tooltip=""; break;
    			}
			}else{
				e.control.tooltip ="";
			}		
		}else{
			//e.control.tooltip ="";
		}
	}
}

function popupLogImage( index, imageData, temperature, temperatureValid ){
	var AuthLogImagePopup = dataManager.getClientOption().getValue("AuthLogImagePopup");
	if (AuthLogImagePopup == 0 ) {
		return;
	}
	var dlgMonitoringAuthImage = programManager.getProcess(DLG_MONITORING_AUTH_IMAGE,DLG_MONITORING_AUTH_IMAGE);
    if(dlgMonitoringAuthImage ){
		dlgMonitoringAuthImage.ctrl.close();
	}	
	var dmAuthLogImage = app.lookup("AuthLogImage");
	dmAuthLogImage.setValue("LogIndex",index);
	dmAuthLogImage.setValue("LogImage",imageData);
	/*
	var option = {
		width : 700,
		height : 500,
		right: app.getContainer().getActualRect().left/4
	};
	var appld = "app/main/monitoring/MonitoringAuthImage" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, option, function(dialog){
		dialog.initValue = {"logImage":dmAuthLogImage.getValue("LogImage")};	
	});
	*/
	var AuthImageLeft = 50;
	var AuthImagetop = 100;
	var AuthImageWidth = 300; 
	var AuthImageHeight = 360;
	var menu_id = DLG_MONITORING_AUTH_IMAGE;
	var path = "app/main/monitoring/MonitoringAuthImage" + "?" + usint_version;
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target":DLG_MONITORING_AUTH_IMAGE,
			"InitVal": {
				"menu_id" : menu_id,
				"logImage": dmAuthLogImage.getValue("LogImage"),
				"temperature":temperature,
				"temperatureValid":temperatureValid,
				"left": AuthImageLeft,
				"top": AuthImagetop,
				"width" : AuthImageWidth,
				"height" : AuthImageHeight
			}
		}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent); 
	
}
exports.setAuthLogImage = function( authLogImage ){
	popupLogImage(authLogImage["LogIndex"],authLogImage["PictureInfo"]["Data"]);
	
}

function AuthImageInfo(){
	
}

// 그리드에서 contextmenu 이벤트 발생 시 호출.
function onMRMAN_grdTerminalListContextmenu(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var mRMAN_grdTerminalList = e.control;
	
	e.preventDefault();
	if (usint_doorControl == 0) {
		if (usint_doorControl == 0) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "출입문제어 사용권한이 없습니다.", "");
			return;
		}
	}
	
	var grdTerminalList = app.lookup("MRMAN_grdTerminalList");
	var terminalRow = grdTerminalList.getSelectedRow();
	if (terminalRow == null || terminalRow.getValue("Status") == 1) {
		return;
	}	
	
	var terminalMenu = new cpr.controls.Menu();
	
	if (ENABLE_MCP040 == 0) {	
		terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandOpenTemp"), 0, ""));
		terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandOpen"), 1, ""));
		terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandClose"), 2, ""));
		if( dataManager.getSystemBrandType() == BRAND_NITGEN ){
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_Sync"), 3, ""));
		}		
		terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_ResetEmergencyControl"), 31, ""));	
	}
	else {
		var TerminalLiveInfo = app.lookup("TerminalLiveInfo");		
		var TerminalID = terminalRow.getValue("ID");
		//var TerminalID = terminalRow.getValue("Type");

		var find_mcp=0; // MCP 인지 여부 
		var TerminalMcpList = app.lookup("TerminalMcpList");
		for(var ii=0;ii<TerminalMcpList.getRowCount();ii++)
		{
			var McpTerminalID = TerminalMcpList.getRow(ii).getValue("TerminalID");
			console.log("McpTerminalID: " + McpTerminalID);
			console.log("TerminalID: " + TerminalID);
			if(McpTerminalID == TerminalID)
			{
				find_mcp = 1;
				break;
			}
		}
	
		if(find_mcp == 1) {// MCP040 
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandOpenTemp") + "1", 4, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandOpenTemp") + "2", 5, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandOpenTemp") + "3", 6, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandOpenTemp") + "4", 7, ""));

			//terminalMenu.addItem(new cpr.controls.MenuItem("" , 8, ""));

			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandOpen") + "1", 9, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandOpen") + "2", 10, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandOpen") + "3", 11, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandOpen") + "4", 12, ""));
			
			//terminalMenu.addItem(new cpr.controls.MenuItem("" , 13, ""));
			
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandClose") + "1", 14, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandClose") + "2", 15, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandClose") + "3", 16, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandClose") + "4", 17, ""));
					
			//terminalMenu.addItem(new cpr.controls.MenuItem("" , 18, ""));		
					
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_MCPSettingAlarm") + "1", 19, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_MCPSettingAlarm") + "2", 20, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_MCPSettingAlarm") + "3", 21, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_MCPSettingAlarm") + "4", 22, ""));
			
			//terminalMenu.addItem(new cpr.controls.MenuItem("" , 23, ""));		
			
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_MCPSettingDisalarm") + "1", 24, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_MCPSettingDisalarm") + "2", 25, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_MCPSettingDisalarm") + "3", 26, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_MCPSettingDisalarm") + "4", 27, ""));
				
			//terminalMenu.addItem(new cpr.controls.MenuItem("" , 28, ""));		
			
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_State"), 29, ""));	
			
			//terminalMenu.addItem(new cpr.controls.MenuItem("" , 30, ""));	
			
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_ResetEmergencyControl"), 31, ""));		
			
			
		}
		else 
		{
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandOpenTemp"), 0, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandOpen"), 1, ""));
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_DoorCommandClose"), 2, ""));
			if( dataManager.getSystemBrandType() == BRAND_NITGEN ){
				terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_Sync"), 3, ""));
			}				
						
			terminalMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_ResetEmergencyControl"), 31, ""));		
		}
	}
	

	var rect = app.getActualRect();
	var contextTop = (e.clientY - rect.top) > rect.height/2 ? e.clientY - rect.top*2 : e.clientY - rect.top;
	terminalMenu.style.css({
		left: e.clientX - rect.left + "px",
		top: contextTop + "px",
		height: "60px",
		width: "200px",
		position: "absolute"
	});
	terminalMenu.focus();

	
	terminalMenu.addEventListener("selection-change", function(e) {
		switch (terminalMenu.value) {
			case "0":	processDoorCommand(0);  break; 	//Str_DoorCommandOpenTemp				
			case "1":	processDoorCommand(1);  break; 	//Str_DoorCommandOpen				
			case "2":	processDoorCommand(2);  break; 	//Str_DoorCommandClose
			case "3":   processSyncCommand(); 	break;	// 단말 동기화 
			
			/*
			// opt 0-> Acu Open 
			// opt 1-> Acu Unlock
			// opt 2-> Acu Lock
			// opt 3-> Acu Arm
			// opt 4-> Acu Disarm
			*/
			
			case "4": 	processAcuDoorCommand(0 , 1); break;
			case "5": 	processAcuDoorCommand(0 , 2); break;
			case "6": 	processAcuDoorCommand(0 , 3); break;
			case "7": 	processAcuDoorCommand(0 , 4); break;
			
			case "9": 	processAcuDoorCommand(1 , 1); break;
			case "10": 	processAcuDoorCommand(1 , 2); break;
			case "11": 	processAcuDoorCommand(1 , 3); break;
			case "12": 	processAcuDoorCommand(1 , 4); break;			
			
			case "14": 	processAcuDoorCommand(2 , 1); break;
			case "15": 	processAcuDoorCommand(2 , 2); break;
			case "16": 	processAcuDoorCommand(2 , 3); break;
			case "17": 	processAcuDoorCommand(2 , 4); break;				
			
			case "19": 	processAcuDoorCommand(3 , 1); break;
			case "20": 	processAcuDoorCommand(3 , 2); break;
			case "21": 	processAcuDoorCommand(3 , 3); break;
			case "22": 	processAcuDoorCommand(3 , 4); break;				
			
			case "24": 	processAcuDoorCommand(4 , 1); break;
			case "25": 	processAcuDoorCommand(4 , 2); break;
			case "26": 	processAcuDoorCommand(4 , 3); break;
			case "27": 	processAcuDoorCommand(4 , 4); break;				
						
			case "29":	processShowAcuStatus();		break;
				
			case "31": 	processResetEmergencyControl();		break;				
			
			default:	break;
		}		
		terminalMenu.dispose();
		
		
	});	

	terminalMenu.addEventListener("blur", function(e) {	terminalMenu.dispose();	});
	app.floatControl(terminalMenu);
}

//
function onSms_get_mcp_listSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	//console.log("onSms_get_mcp_listSubmitDone");
}

// 도어 컨트롤 옵션 전송 선택
function onMRMAN_btnDoorControlClick(/* cpr.events.CMouseEvent */ e){
	
	if (usint_doorControl == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "출입문제어 사용권한이 없습니다.", "");
		return;
	}
		
	var cmbDoorControlOption = app.lookup("MRMAN_cmbDoorControlOption");
	if( cmbDoorControlOption.value == 1000 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelection"));
		return;
	}
	var grdTerminalList = app.lookup("MRMAN_grdTerminalList")
	var chkIndices = grdTerminalList.getCheckRowIndices();	
	var total = chkIndices.length;
	
	if( total < 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedTerminals"));
		return;
	}
	
	var dsTerminalIDList = app.lookup("TerminalIDList");
	dsTerminalIDList.clear();
	for( var i = 0; i < total; i++ ){
		var row = grdTerminalList.getRow(chkIndices[i]);
		if( row.getValue("Status") == 0 || row.getValue("Status") == 16){continue;}
		dsTerminalIDList.addRowData({"ID":row.getValue("ID")});
	}
	dsTerminalIDList.commit();
	
	comLib.showLoadMask("pro", dataManager.getString("Str_Data")+" "+dataManager.getString("Str_Send"), "", total);
	
	if( cmbDoorControlOption.value == 3){ // 단말기 상황 해제인 경우
		sendTerminalEmergencyReset();
	}else{
		sendTerminalDoorCommand();
	}
}

function sendTerminalDoorCommand(){
	
	var cmbDoorControlOption = app.lookup("MRMAN_cmbDoorControlOption");
	var doorCommand = cmbDoorControlOption.value;
	
	var dsTerminalIDList = app.lookup("TerminalIDList");
	var row = dsTerminalIDList.getRow(0);
	if( row ){
		var terminalID = row.getValue("ID")
		dsTerminalIDList.deleteRow(0);
		dsTerminalIDList.commit();
		
		var dmDoorOption = app.lookup("DoorOption");		

		dmDoorOption.setValue("ID", terminalID);
		dmDoorOption.setValue("Option", doorCommand);
		
		var dmResult = app.lookup("Result");
		var sms_postTerminalDoorControl =  new cpr.protocols.Submission("sms_postTerminalDoorControl");
		sms_postTerminalDoorControl.action = "v1/terminals/" + terminalID + "/control/door";		
		sms_postTerminalDoorControl.method = "post";
		sms_postTerminalDoorControl.addRequestData(dmDoorOption);				
		sms_postTerminalDoorControl.addResponseData(dmResult);
		
		sms_postTerminalDoorControl.addEventListenerOnce("submit-done", onSms_postTerminalDoorControlExDone);
		sms_postTerminalDoorControl.addEventListenerOnce("submit-error", onSms_postTerminalDoorControlExError);
		sms_postTerminalDoorControl.addEventListenerOnce("submit-timeout", onSms_postTerminalDoorControlExTimeout);

		sms_postTerminalDoorControl.send();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_SendCommondComplete"));
		comLib.hideLoadMask();
	}
}

function onSms_postTerminalDoorControlExDone( /* cpr.events.CSubmissionEvent */ e) {
	comLib.updateLoadMask();
	sendTerminalDoorCommand();
}

// 단말기 라이브 정보 수신 에러
function onSms_postTerminalDoorControlExError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR)
}

// 단말기 라이브 정보 수신 타임아웃
function onSms_postTerminalDoorControlExTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT)
}

function sendTerminalEmergencyReset(){
	
	var dsTerminalIDList = app.lookup("TerminalIDList");
	var row = dsTerminalIDList.getRow(0);
	
	if( row ){
		var terminalID = row.getValue("ID")
		dsTerminalIDList.deleteRow(0);
		dsTerminalIDList.commit();
		
		var dmEmergencyOption = app.lookup("EmergencyOption");
		
		dmEmergencyOption.setValue("TerminalID", terminalID);
		dmEmergencyOption.setValue("Status", 0);
		dmEmergencyOption.setValue("Type", 0);
		
		var dmResult = app.lookup("Result");
		var sms_postTerminalResetEmergencyControl = new cpr.protocols.Submission("sms_postTerminalResetEmergencyControl");
		sms_postTerminalResetEmergencyControl.action = "v1/terminals/" + terminalID + "/control/emergency";
		sms_postTerminalResetEmergencyControl.method = "post";
		sms_postTerminalResetEmergencyControl.addRequestData(dmEmergencyOption);				
		sms_postTerminalResetEmergencyControl.addResponseData(dmResult);
		
		sms_postTerminalResetEmergencyControl.addEventListenerOnce("submit-done", onSms_postTerminalResetEmergencyControlExDone);
		sms_postTerminalResetEmergencyControl.addEventListenerOnce("submit-error", onSms_postTerminalResetEmergencyControlExError);
		sms_postTerminalResetEmergencyControl.addEventListenerOnce("submit-timeout", onSms_postTerminalResetEmergencyControlExTimeout);

		sms_postTerminalResetEmergencyControl.send();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_SendCommondComplete"));
		comLib.hideLoadMask();
	}
}

function onSms_postTerminalResetEmergencyControlExDone( /* cpr.events.CSubmissionEvent */ e) {
	comLib.updateLoadMask();
	sendTerminalEmergencyReset();
}

// 단말기 라이브 정보 수신 에러
function onSms_postTerminalResetEmergencyControlExError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR)
}

// 단말기 라이브 정보 수신 타임아웃
function onSms_postTerminalResetEmergencyControlExTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT)
}

function onMRMAN_cmbUserTypeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var userType = app.lookup("MRMAN_cmbUserType").value;	
	var authLogList = app.lookup("AuthLogList");
	if( userType == 0 ){
		authLogList.clearFilter();
	}else{
		authLogList.setFilter("UserType == '"+userType +"'");
	}
}

function onMRMAN_grdAuthlogRowDblclick(/* cpr.events.CGridMouseEvent */ e){
	/** @type cpr.controls.Grid	 */
	
	var path = "app/custom/rokmch/monitoring/authLogView";

	app.openDialog(path, {width : 900, height : 500}, function(dialog){
		dialog.headerTitle = "출입 상세 정보";
		dialog.modal = true;	
		dialog.initValue = {"ID": e.row.getRowData()["IndexKey"]};
		dialog.style.header.css("background-color", "#528443");
	}).then(function(returnValue){
	});	
}

function grdTerminalReload(){ // 단말기 상태 적용을 위해 단말기 그리드 다시 그려주기
    var GrdTerminalList = app.lookup('GrdTerminalList');
    var TerminalList = app.lookup('TerminalList');
    for (var i = 0; GrdTerminalList.getRowCount() > i ; i++) {
        if (GrdTerminalList.getRowData(i).Status != TerminalList.findFirstRow("ID == " + GrdTerminalList.getRowData(i).ID).getValue('Status')) {
            GrdTerminalList.setValue(i, 'Status', TerminalList.findFirstRow("ID == " + GrdTerminalList.getRowData(i).ID).getValue('Status'));
        }
        if (GrdTerminalList.getRowData(i).TerminalStatus1 != TerminalList.findFirstRow("ID == " + GrdTerminalList.getRowData(i).ID).getValue('TerminalStatus1')) {
            GrdTerminalList.setValue(i, 'TerminalStatus1', TerminalList.findFirstRow("ID == " + GrdTerminalList.getRowData(i).ID).getValue('TerminalStatus1'));
        }
        
        if (GrdTerminalList.getRowData(i).TerminalStatus2 != TerminalList.findFirstRow("ID == " + GrdTerminalList.getRowData(i).ID).getValue('TerminalStatus2')) {
            GrdTerminalList.setValue(i, 'TerminalStatus2', TerminalList.findFirstRow("ID == " + GrdTerminalList.getRowData(i).ID).getValue('TerminalStatus2'));
        }
        
        if (GrdTerminalList.getRowData(i).TerminalStatus3 != TerminalList.findFirstRow("ID == " + GrdTerminalList.getRowData(i).ID).getValue('TerminalStatus3')) {
            GrdTerminalList.setValue(i, 'TerminalStatus3', TerminalList.findFirstRow("ID == " + GrdTerminalList.getRowData(i).ID).getValue('TerminalStatus3'));
        }
        
        if (GrdTerminalList.getRowData(i).TerminalStatus4 != TerminalList.findFirstRow("ID == " + GrdTerminalList.getRowData(i).ID).getValue('TerminalStatus4')) {
            GrdTerminalList.setValue(i, 'TerminalStatus4', TerminalList.findFirstRow("ID == " + GrdTerminalList.getRowData(i).ID).getValue('TerminalStatus4'));
        }
    }
       GrdTerminalList.commit();
}
