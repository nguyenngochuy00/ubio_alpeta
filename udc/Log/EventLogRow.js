/************************************************
 * EventLogRow.js
 * Created at Oct 13, 2020 4:36:14 PM.
 *
 * @author EVN0025
 ************************************************/

var dataManager = getDataManager();
createComUtil(app);
/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};

function initComboEventLogContents() {
	var cmbEventContent = app.lookup("logContent");
	// category - Terminal
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Disconnected"), 65537));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Connected"), 65538));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Locked"), 65539));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Unlocked"), 65540));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Tamper"), 65541));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Attached"), 65542));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Lockdowned"), 65543));

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
}

/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	initComboEventLogContents();
}
