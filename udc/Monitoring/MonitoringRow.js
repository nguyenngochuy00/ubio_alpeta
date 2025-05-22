/************************************************
 * MonitoringRow.js
 * Created at Oct 14, 2020 1:26:08 PM.
 *
 * @author EVN0025
 ************************************************/
var dataManager = getDataManager();
var TerminalStatus1 = "";
var TerminalStatus2 = "";
var TerminalStatus3 = "";
var TerminalStatus4 = "";

function getTerminalStatus1(status) {
	switch (status) {
		case TerminalStatusConnect:
			return dataManager.getString("Str_Connect");
			break; //연결
		case TerminalStatusRegist:
			return dataManager.getString("Str_Regist");
			break; // 등록
		case TerminalStatusUnRegist:
			return dataManager.getString("Str_UnRegist");
			break; // 미등록
		case TerminalStatusIDConflict:
			return dataManager.getString("Str_IDConflict");
			break; //아이디 출동
		case TerminalStatusInvalidType:
			return dataManager.getString("Str_TerminalInvalidType");
			break; //등록된 단말기 타입이 다름
		case TerminalStatusSyncUserIDLen:
			return dataManager.getString("Str_UserIDLen");
			break; //사용자 아이디 길이
		case TerminalStatusSyncMacAddres:
			return dataManager.getString("Str_MacAddres");
			break; //맥 주소
		case TerminalStatusSyncUserCount:
			return dataManager.getString("Str_UserCount");
			break; //사용자 수
		case TerminalStatusSyncFWVersion:
			return dataManager.getString("Str_FWVersion");
			break; //펌웨어 버전
		default:
			return "";
			break;
	}
}

function getTerminalStatus2(status) {
	switch (status) {
		case TerminalStatusDoorOpen:
			return dataManager.getString("Str_DoorOpen");
			break; //(도어 - 0:닫힘, 1:열림) : 출입문 열림
		case TerminalStatusDoorClose:
			return dataManager.getString("Str_DoorClose");
			break; // (도어 - 0:닫힘, 1:열림) : 출입문 닫힘
		case TerminalStatusDoorEmergency:
			return dataManager.getString("Str_DoorEmergency");
			break; //(침입 - 0:정상, 1:침입) : 강제 침입 
		case TerminalStatusDoorOpenWarn:
			return dataManager.getString("Str_DoorOpenWarn");
			break; // (방치 - 0:정상, 1:방치) : 문열림 경고
		case TerminalStatusDoorLookState:
			return dataManager.getString("Str_DoorLookState");
			break; // (상태 - 0:잠김, 1:열림) : 출입문 열림
		case TerminalStatusDoorLockWorking:
			return dataManager.getString("Str_DoorLockWorking");
			break; // (동작 - 0:정상, 1:고장) : 문열림 경고   
		case TerminalStatusDoorNotMonitoring:
			return dataManager.getString("Str_DoorNotMonitor");
			break; // 미감시 – 0:정상 , 1: 미감시 : 문상태 미감시
		case TerminalStatusDoorOpenState:
			return dataManager.getString("Str_DoorCommandOpen");
			break; // 오른쪽 클릭 메뉴 -> 출입문 개방
		default:
			return "";
	}
}

function getTerminalStatus3(status) {
	switch (status) {
		case TerminalStatusLock:
			return dataManager.getString("Str_Lock");
			break; // (잠김 - 0:해제, 1:잠김) : 문열림 경고    
		case TerminalStatusLockForce:
			return dataManager.getString("Str_LockForce");
			break; // (폐쇄 - 0:정상, 1:폐쇄) : 비상 
		case TerminalStatusCover:
			return dataManager.getString("Str_CoverSeparate");
			break; // (커버 - 0:결합, 1:분리) : 템퍼 분리 
		default:
			return "";
	}
}

function getTerminalStatus4(status) {
	switch (status) {
		case TerminalStatusWarnFire:
			return dataManager.getString("Str_WarnFire");
			break; // (화재 - 0:정상, 1:화재) : 화재 
		case TerminalStatusWarnPanic:
			return dataManager.getString("Str_WarnPanic");
			break; // (패닉 - 0:정상, 1:패닉) : 패닉
		case TerminalStatusWarnCricis:
			return dataManager.getString("Str_WarnCricis");
			break; // (위협 - 0:정상, 1:위협) : 비상
		default:
			return "";
	}
}

function onStatusUpdate(category, value) {
	switch (category) {
		case 0: // TerminalStatusConnect 1<<0
			if (value == 1) {
				TerminalStatus1 = TerminalStatusConnect
			} else {
				TerminalStatus1 = "";
				TerminalStatus2 = "";
				TerminalStatus3 = "";
				TerminalStatus4 = "";
			}
			break;
			
		case 1: // TerminalStatusLock         = 1 << 1 // 잠김 - 0:해제, 1:잠김
			if (value == 1) {
				TerminalStatus3 = TerminalStatusLock;
			}
			//else{	terminal.setValue("TerminalStatus3", "");}				
			break;
			
		case 2: //TerminalStatusLockForce    = 1 << 2 // 폐쇄 - 0:정상, 1:폐쇄
			if (value == 1) {
				TerminalStatus3 = TerminalStatusLockForce;
			}
			//else{	terminal.setValue("TerminalStatus3", "");}
			break;
			
		case 3:
			if (value == 1) {
				TerminalStatus3 = TerminalStatusCover;
			}
			//else{	terminal.setValue("TerminalStatus3", "");}
			break;
			
		case 4:
			if (value == 0) {
				TerminalStatus1 = TerminalStatusUnRegist;
				TerminalStatus2 = "";
				TerminalStatus3 = "";
				TerminalStatus4 = "";
				//terminal.setValue("Name",dataManager.getString("Str_UnregisteredTerminal"));
			}
			break;
			
		case 5:
			if (value == 1) {
				TerminalStatus1 = TerminalStatusIDConflict;
			}
			break;
			
		case 6:
			if (value == 1) {
				TerminalStatus1 = TerminalStatusInvalidType;
			}
			break;
			
		case 7:
			if (value == 1) {
				TerminalStatus2 = TerminalStatusDoorOpen;
			}
			//else{	terminal.setValue("TerminalStatus2", "");}
			break;
			
		case 8:
			if (value == 1) {
				TerminalStatus2 = TerminalStatusDoorEmergency;
			}
			//else{	terminal.setValue("TerminalStatus2", "");}
			break;
			
		case 9:
			if (value == 1) {
				TerminalStatus2 = TerminalStatusDoorOpenWarn;
			}
			//else{	terminal.setValue("TerminalStatus2", "");}
			break;
			
		case 10:
			if (value == 1) {
				TerminalStatus2 = TerminalStatusDoorLookState;
			}
			//else{	terminal.setValue("TerminalStatus2", "");}
			break;
			
		case 11:
			if (value == 1) {
				TerminalStatus2 = TerminalStatusDoorLockWorking
			}
			//else{	terminal.setValue("TerminalStatus2", "");}
			break;
		case 12:
			if (value == 1) {
				TerminalStatus4 = TerminalStatusWarnFire
			}
			//else{terminal.setValue("TerminalStatus4", "");}
			break;
			
		case 13:
			if (value == 1) {
				TerminalStatus4 = TerminalStatusWarnPanic
			}
			//else{	terminal.setValue("TerminalStatus4", "");}
			break;
			
		case 14:
			if (value == 1) {
				TerminalStatus4 = TerminalStatusWarnCricis
			}
			//else{	terminal.setValue("TerminalStatus4", "");}
			break;
			
		case 15:
			if (value == 1) {
				TerminalStatus1 = TerminalStatusSyncUserIDLen
			}
			break;
			
		case 16:
			if (value == 1) {
				TerminalStatus1 = TerminalStatusSyncMacAddres
			}
			break;
			
		case 17:
			if (value == 1) {
				TerminalStatus1 = TerminalStatusSyncUserCount
			}
			break;
			
		case 18:
			if (value == 1) {
				TerminalStatus1 = TerminalStatusSyncFWVersion
			}
			break;
		case 23:
			if (value == 1) {
				TerminalStatus2 = TerminalStatusDoorNotMonitoring
			}
			//else{	terminal.setValue("TerminalStatus2", "");}
			break;
		case 24:
			if (value == 1) {
				TerminalStatus2 = TerminalStatusDoorOpenState
			}
			//else{	terminal.setValue("TerminalStatus2", "");}
			break;
	}
}

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function() {
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};

/*
 * Triggered when init event is fired from Body.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit( /* cpr.events.CEvent */ e) {
	
}

function renderTerminalStatus() {
	var Status = Number(app.getAppProperty("LiveStatus"));
	var valueBinary = Status.toString(2).padStart(32, "0");
	
	//status1
	if (valueBinary[32 - 1 - 0] == 1) {
		onStatusUpdate(0, valueBinary[32 - 1 - 0]);
	} else if (valueBinary[32 - 1 - 5] == 1) {
		onStatusUpdate(5, valueBinary[32 - 1 - 5]);
	} else if (valueBinary[32 - 1 - 6] == 1) {
		onStatusUpdate(6, valueBinary[32 - 1 - 6]);
	} else if (valueBinary[32 - 1 - 15] == 1) {
		onStatusUpdate(15, valueBinary[32 - 1 - 15]);
	} else if (valueBinary[32 - 1 - 16] == 1) {
		onStatusUpdate(16, valueBinary[32 - 1 - 16]);
	} else if (valueBinary[32 - 1 - 17] == 1) {
		onStatusUpdate(17, valueBinary[32 - 1 - 17]);
	} else if (valueBinary[32 - 1 - 18] == 1) {
		onStatusUpdate(18, valueBinary[32 - 1 - 18]);
	} else {
		TerminalStatus1 = "";
	}
	
	//status2
	if (valueBinary[32 - 1 - 7] == 1) {
		onStatusUpdate(7, valueBinary[32 - 1 - 7]);
	} else if (valueBinary[32 - 1 - 8] == 1) {
		onStatusUpdate(8, valueBinary[32 - 1 - 8]);
	} else if (valueBinary[32 - 1 - 9] == 1) {
		onStatusUpdate(9, valueBinary[32 - 1 - 9]);
	} else if (valueBinary[32 - 1 - 10] == 1) {
		onStatusUpdate(10, valueBinary[32 - 1 - 10]);
	} else if (valueBinary[32 - 1 - 11] == 1) {
		onStatusUpdate(11, valueBinary[32 - 1 - 11]);
	} else if (valueBinary[32 - 1 - 24] == 1) { // 현재, 오른쪽 클릭 ->  출입문 개방 신호와 출입문 미감시 신호가 동시에 오고 있어서 순서를 바꿈으로서 출입문 개방이 먼저 실행되도록 변경
		onStatusUpdate(24, valueBinary[32 - 1 - 24]);
	} else if (valueBinary[32 - 1 - 23] == 1) {
		onStatusUpdate(23, valueBinary[32 - 1 - 23]);
	} else {
		TerminalStatus2 = "";
	}
	
	//status3
	if (valueBinary[32 - 1 - 1] == 1) {
		onStatusUpdate(1, valueBinary[32 - 1 - 1]);
	} else if (valueBinary[32 - 1 - 2] == 1) {
		onStatusUpdate(2, valueBinary[32 - 1 - 2]);
	} else if (valueBinary[32 - 1 - 3] == 1) {
		onStatusUpdate(3, valueBinary[32 - 1 - 3]);
	} else {
		TerminalStatus3 = "";
	}
	
	//status4
	if (valueBinary[32 - 1 - 12] == 1) {
		onStatusUpdate(12, valueBinary[32 - 1 - 12]);
	} else if (valueBinary[32 - 1 - 13] == 1) {
		onStatusUpdate(13, valueBinary[32 - 1 - 13]);
	} else if (valueBinary[32 - 1 - 14] == 1) {
		onStatusUpdate(14, valueBinary[32 - 1 - 14]);
	} else {
		TerminalStatus4 = "";
	}
	
	var value = getTerminalStatus1(TerminalStatus1) ? getTerminalStatus1(TerminalStatus1) + "/" : ""
	value = value + (getTerminalStatus4(TerminalStatus4) ? getTerminalStatus4(TerminalStatus4) + "/" : "")
	value = value + (getTerminalStatus2(TerminalStatus2) ? getTerminalStatus2(TerminalStatus2) : "")
	
	app.lookup("terminalStatus").value = value;
	
	var imgStatus;
	switch (TerminalStatus1) {
		case 1:
			imgStatus = 'theme/images/monitoring/green.png' //TerminalStatusConnect
			break;
		case 16:
			imgStatus = 'theme/images/monitoring/green.png' //TerminalStatusRegist
			break;
		case -1:
			imgStatus = 'theme/images/monitoring/monitoring_list_info_icons_status.png' //TerminalStatusUnRegist
			break;
		case 32:
			imgStatus = 'theme/images/monitoring/monitoring_list_info_icons_status.png' //TerminalStatusIDConflict
			break;
		case 64:
			imgStatus = 'theme/images/monitoring/monitoring_list_info_icons_status.png' //TerminalStatusInvalidType
			break;
		case 32768:
			imgStatus = 'theme/images/monitoring/monitoring_list_info_icons_status.png' //TerminalStatusSyncUserIDLen
			break;
		case 65536:
			imgStatus = 'theme/images/monitoring/monitoring_list_info_icons_status.png' //TerminalStatusSyncMacAddres
			break;
		case 131072:
			imgStatus = 'theme/images/monitoring/monitoring_list_info_icons_status.png' //TerminalStatusSyncUserCount
			break;
		case 262144:
			imgStatus = 'theme/images/monitoring/monitoring_list_info_icons_status.png' //TerminalStatusSyncFWVersion
			break;
		default:
			imgStatus = 'theme/images/monitoring/red.png'
	}
	app.lookup("MRTMD_imgStatus").src = imgStatus;
}

/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad( /* cpr.events.CEvent */ e) {
	var Status = app.getAppProperty("LiveStatus");
	if (Status) {
		renderTerminalStatus();
	}
	
	var terminalTypeMap = dataManager.getTerminalTypeMap();
	var cmbTerminalType = app.lookup("MRTMD_cmbTerminalType");
	terminalTypeMap.forEach(function(value, key, map) {
		cmbTerminalType.addItem(new cpr.controls.Item(value, key));
	});
}

/*
 * Triggered when property-change event is fired from Body.
 * 앱의 속성이 변경될 때 발생하는 이벤트 입니다.
 */
function onBodyPropertyChange( /* cpr.events.CPropertyChangeEvent */ e) {
	if (e.property === "LiveStatus") {
		renderTerminalStatus();
	}
}