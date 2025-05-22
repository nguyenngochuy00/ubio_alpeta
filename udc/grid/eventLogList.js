/************************************************
 * eventLogList.js
 * Created at 2019. 1. 10. 오후 7:19:17.
 *
 * @author wonki
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
 
 /*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	var cmbEventCategory = app.lookup("UDC_cmbEventCategory");
	cmbEventCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_Terminal"), 1));
	cmbEventCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_Door"), 2));
	cmbEventCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_Emergency"), 3));
	cmbEventCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_ExtnalSignal"), 4));
	cmbEventCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_System"), 5));
	
	cmbEventCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_EventCategoryDoorUint"), 0x0f000000));
	cmbEventCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_EventCategoryTurnstileUint"), 0x0f000010));
	
	if ( dataManager.getOemVersion() == OEM_MOTORCYCLE_PARK ) {
		cmbEventCategory.addItem(new cpr.controls.Item("LPR", 1000));
	}
	
	initComboEventLogContents();
}

function initComboEventLogContents() {
	var cmbEventContent = app.lookup("UDC_cmbEventContent");
	
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
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorCommandOpenTemp"), 131082));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorCommandOpen"), 131083));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorCommandClose"), 131084));
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
	/*
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyFire"), 131073196630));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyPanic"), 196631));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyPanicClear"), 196632));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyFireClear"), 196633));
	* */
	
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyFPSensorAbnormal"), 196630));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyDBAbnormal"), 196631));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyRTCAbnormal"), 196632));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyTouchAbnormal"), 196633));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyRelease"), 196634));
	
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
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EventContentTurnstileArmRestore"), 0x0f000015));
	
	if ( dataManager.getOemVersion() == OEM_MOTORCYCLE_PARK ) {
		// category - LPR
		cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_BPARK_MainControlDisconnected"), 393225));	// 메인 컨트롤보드 연결 끊김
		cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_BPARK_MainControlConnected"), 393226));	// 메인 컨트롤보드 연결
		cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_BPARK_SubControlDisonnected"), 393227));	// 서브 컨트롤보드 연결 끊김
		cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_BPARK_SubControlConnected"), 393228));		// 서브 컨트롤보드 연결
		cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_BPARK_LPRModuleDisConnected"), 393229));	// LPR 모듈 연결 끊김
		cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_BPARK_LPRModuleConnected"), 393230));		// LPR 모듈 연결
		cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_BPARK_MainCameraDisconnected"), 393231));	// 메인 카메라 연결 끊김
		cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_BPARK_MainCameraConnected"), 393232));		// 메인 카메라 연결
		cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_BPARK_SubCameraDisconnected"), 393233));	// 서브 카메라 연결 끊김
		cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_BPARK_SubCameraConnected"), 393234));		// 서브 카메라 연결
		cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_BPARK_AlpetaServerDisconnected"), 393235));					// 알페타 연결 끊김
		cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_BPARK_AlpetaServerConnected"), 393236)); // 알페타 연결
	} else if ( dataManager.getOemVersion() == OEM_3D_NORMAL ) {
		cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_InterpolStart3D"), 393217));	// 인터폴 요청
		cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_InterpolEnd3D"), 393218));	// 인터폴 종료
	}
	
}

exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};

exports.getCheckedRowIndices = function() {
	var authLogList = app.lookup("eventLogListGrid");
	var indices = eventLogList.getCheckRowIndices();
	
	var result = [];
	indices.forEach(function(idx){
		if(eventLogList.getRowState(idx) != cpr.data.tabledata.RowState.DELETED ){
			result.push(idx);
		} else {
			eventLogList.setCheckRowIndex(idx, false);
		}
	});
	
	return result;
}

exports.setUnCheckAll = function(idx,checked){
	var eventLogList = app.lookup("eventLogListGrid");
	var indices = eventLogList.getCheckRowIndices();
	
	indices.forEach(function(idx){
		eventLogList.setCheckRowIndex(idx, false);		
	});
} 

exports.deleteColumn = function(indices){
	if (indices==undefined || indices == null ){
		return;
	}
	var eventLogList = app.lookup("eventLogListGrid");
	indices.forEach(function(index){
		eventLogList.deleteColumn(index);
	});	
};

exports.addTerminalName = function() {
	var eventLogList = app.lookup("eventLogListGrid");
	eventLogList.columnVisible(1, true);
	eventLogList.columnVisible(2, false);
}


exports.deleteRow = function(checkedRowIndices) {
	var eventLogList = app.lookup("eventLogListGrid");
	eventLogList.deleteRow(checkedRowIndices);
	eventLogList.clearAllCheck();
	return;
}

exports.setEventLogList = function( /*cpr.data.DataSet*/eventLogList ){
			
	var dsEventLogList = app.lookup("EventLogList");
	dsEventLogList.clear();	
	eventLogList.copyToDataSet(dsEventLogList);	
	dsEventLogList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	
	var grdEventLogList = app.lookup("eventLogListGrid");	
	grdEventLogList.redraw();
}

exports.setEventLogListRows = function( /*cpr.data.RowConfigInfo[]*/eventLogList ){
			
	var dsEventLogList = app.lookup("EventLogList"); 
	dsEventLogList.clear();	
	dsEventLogList.build(eventLogList);	
	dsEventLogList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	
	var grdEventLogList = app.lookup("eventLogListGrid");	
	grdEventLogList.redraw();	
}

exports.getRowData = function( index ){
	
	var grdEventLogList = app.lookup("eventLogListGrid");
	return grdEventLogList.getRow(index).getRowData();	
}

exports.getRow = function( index ){
	
	var grdEventLogList = app.lookup("eventLogListGrid");
	return grdEventLogList.getRow(index);	
}

exports.getRowState = function( index ){
	
	var grdEventLogList = app.lookup("eventLogListGrid");
	return grdEventLogList.getRowState(index);	
}

exports.setRowState = function(index, state){
	var grdEventLogList = app.lookup("eventLogListGrid");
	grdEventLogList.setRowState(index, state);
}

exports.getRowCount = function(index, state){
	var grdEventLogList = app.lookup("eventLogListGrid");
	return grdEventLogList.getRowCount();
}

/**
 * 사용자 리스트 컨트롤의 페이징 정보를 설정합니다.
 */
exports.setPaging = function( totalCount, currentPageIndex, pageRowCount, viewPageCount ) {
	var pageIndex = app.lookup("eventLogListPageIndexer");
	
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.currentPageIndex = currentPageIndex;//현재 선택된 페이지의 인덱스
	pageIndex.pageRowCount = pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	
	if(totalCount == 0) {
		pageIndex.visible = false;
	} else {
		pageIndex.visible = true;
	}
	
	pageIndex.redraw();
}

exports.setPaging = function( totalCount, pageRowCount, viewPageCount ) {
	var pageIndex = app.lookup("eventLogListPageIndexer");
	
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	//pageIndex.currentPageIndex = currentPageIndex;//현재 선택된 페이지의 인덱스
	pageIndex.pageRowCount = pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	
	if(totalCount == 0) {
		pageIndex.visible = false;
	} else {
		pageIndex.visible = true;
	}
	pageIndex.redraw();
}

exports.setTotalCount = function(totalCount) {
	
	var pageIndex = app.lookup("eventLogListPageIndexer");
	pageIndex.totalRowCount = totalCount
	
	if(totalCount == 0) {
		pageIndex.visible = false;
	} else {
		pageIndex.visible = true;
	}
	
	pageIndex.redraw();
}

exports.getCurrentPageIndex = function() {	
	var pageIndex = app.lookup("eventLogListPageIndexer");
	return pageIndex.currentPageIndex
}

exports.setCurrentPageIndex = function(index) {	
	var pageIndex = app.lookup("eventLogListPageIndexer");	
	pageIndex.currentPageIndex = index;	
}

exports.setPageRowCount = function(count) {	
	var pageIndex = app.lookup("eventLogListPageIndexer");	
	pageIndex.pageRowCount = count;	
}

exports.getPageRowCount = function() {	
	var pageIndex = app.lookup("eventLogListPageIndexer");	
	return pageIndex.pageRowCount;	
}

exports.clearEventLogList = function(  ){
			
	var pageIndex = app.lookup("eventLogListPageIndexer");
	pageIndex.totalRowCount = 0;
	pageIndex.visible = false;	
	pageIndex.redraw();
	
	var dsEventLogList = app.lookup("EventLogList");
	dsEventLogList.clear();			
	
	var grdEventLogList = app.lookup("eventLogListGrid");	
	grdEventLogList.redraw();
}

/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onEventLogListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var eventLogListPageIndexer = e.control;
	
	var selectionEvent = new cpr.events.CSelectionEvent("pagechange", {
		oldSelection: e.oldSelection,
		newSelection: e.newSelection
	});
	
	app.dispatchEvent(selectionEvent);
}

/*
 * 페이지 인덱서에서 before-selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경되기 전에 발생하는 이벤트. 다음 이벤트로 selection-change를 발생합니다.
 */
function onEventLogListPageIndexerBeforeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var eventLogListPageIndexer = e.control;
	
	var selectionEvent = new cpr.events.CSelectionEvent("before-pagechange", {
		oldSelection: e.oldSelection,
		newSelection: e.newSelection
	});
	
	app.dispatchEvent(selectionEvent);
	
	// 기본처리가 중단되었을 때 변경을 취소함.
	if(selectionEvent.defaultPrevented == true) {
		e.preventDefault();
	}
}



