/************************************************
 * EventLogManagement.js
 * Created at 2019. 1. 10. 오후 7:18:02.
 *
 * @author wonki
 ************************************************/

var comLib;
var pageRowCount = 50;
var dateLib = cpr.core.Module.require("lib/DateLib");
var dataManager = cpr.core.Module.require("lib/DataManager");
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var today = dateLib.getToday('-');
	
	var dtStart = app.lookup("ELMGR_dtStart");
	var dtEnd = app.lookup("ELMGR_dtEnd");
	dtStart.value = today;
	dtEnd.value = today;
	
	var cmbCategory = app.lookup("ELMGR_cmbCategory");
	cmbCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_All"),"all"));
	//cmbCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_UserID"),"user_id"));
	cmbCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_TerminalID"),"terminal_id"));
	cmbCategory.selectItemByValue("all");
	
	if (dataManager.getOemVersion() == OEM_ORTUS_ADANI) {
		var grid = app.lookup("ELMGR_udcEventLogList");
		grid.addTerminalName();
	} 
	if (dataManager.getOemVersion() == OEM_GS_BASIC){
		app.lookup("ELMGR_cmbContent").visible = false;
	}
	
	var searchInput = app.lookup("ELMGR_edtKeyword");  
	searchInput.visible = false;
	initcmbContents();
	sendEventLogListRequest();
	
}
function initcmbContents() {
	var cmbEventContent = app.lookup("ELMGR_cmbContent");
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
	*/
	
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
	
	// HPCL custom
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EventContentExitSwitchPress"), 0x0f000001));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EventContentDoorOpen"), 0x0f000002));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EventContentDoorClose"), 0x0f000003));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EventContentPersonPass"), 0x0f000011));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EventContentPersonNotPass"), 0x0f000012));	
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EventContentTurnstileError"), 0x0f000013));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EventContentTurnstileDropArm"), 0x0f000014));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EventContentTurnstileArmRestore"), 0x0f000015));
}
function sendEventLogListRequest() {
	var dtStart = app.lookup("ELMGR_dtStart");
	var dtEnd = app.lookup("ELMGR_dtEnd");
	var dsEventLogList = app.lookup("EventLogList");
	
	if(dateLib.minusDates(dtStart.value.replace(/-/gi,""),dtEnd.value.replace(/-/gi,"")) >= 31){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ThirtyDayOverError"));
		
		var udcEventLogList = app.lookup("ELMGR_udcEventLogList");
		udcEventLogList.setEventLogList(dsEventLogList);
		app.lookup("ELMGR_opbTotal").value = 0;
		return;
	}
		dsEventLogList.clear();
	var udcEventLogList = app.lookup("ELMGR_udcEventLogList");
	
	var curIndex = udcEventLogList.getCurrentPageIndex();
	var offset = (curIndex - 1) * pageRowCount;
	
	var sms_getEventLogList = app.lookup("sms_getEventLogList");
	var dtStart = app.lookup("ELMGR_dtStart");
	var dtEnd = app.lookup("ELMGR_dtEnd");
	
	var cmbCategory = app.lookup("ELMGR_cmbCategory");
	var edtKeyword = app.lookup("ELMGR_edtKeyword");
	var cmbContent = app.lookup("ELMGR_cmbContent");
	
	sms_getEventLogList.setParameters("startTime", dtStart.value + " 00:00:00");
	sms_getEventLogList.setParameters("endTime", dtEnd.value + " 23:59:59");
	sms_getEventLogList.setParameters("offset", offset);
	sms_getEventLogList.setParameters("limit", pageRowCount);
	
	if (cmbCategory.value != null && cmbCategory.value != "all" ){
		if (edtKeyword.value == null || edtKeyword.value.length == 0) {
			cmbCategory.selectItemByValue("all");
		}
	}
	
	if (cmbCategory.value != null && cmbCategory.value.length > 0) {
		sms_getEventLogList.setParameters("searchCategory", cmbCategory.value);
	}
	if (edtKeyword.value != null && edtKeyword.value.length > 0) {
		sms_getEventLogList.setParameters("searchKeyword", edtKeyword.value);
	}
	if (cmbContent.value != 0) {// 선택된 경우만
		sms_getEventLogList.setParameters("searchContent", cmbContent.value); // 
	} else {
		sms_getEventLogList.setParameters("searchContent", "");
	}
	sms_getEventLogList.send();
	comLib.showLoadMask("", dataManager.getString("Str_TaskStateRunning"), "");
}


/*
 * "검색" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onELMGR_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var eLMGR_btnSearch = e.control;
	var udcEventLogList = app.lookup("ELMGR_udcEventLogList");
	udcEventLogList.setCurrentPageIndex(1);
	sendEventLogListRequest();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getEventLogListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getEventLogList = e.control;
	
	comLib.hideLoadMask();
		
	var dsEventLogList = app.lookup("EventLogList");
	
	var dmTotal = app.lookup("Total");
	
	var totalCount = parseInt(dmTotal.getValue("Count"));
	app.lookup("ELMGR_opbTotal").value = totalCount
	
	var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
	if (viewPageCount > 10) {
		viewPageCount = 10;
	}
	var udcEventLogList = app.lookup("ELMGR_udcEventLogList");
	
	if(dataManager.getOemVersion() == OEM_ORTUS_ADANI){
		dsEventLogList.addColumn(new cpr.data.header.DataHeader("TerminalName", "string"));
		
		var cnt = dsEventLogList.getRowCount();
		for (var i=0; i<cnt; i++) {
			var terminalInfo = dataManager.getTerminal(dsEventLogList.getValue(i, "TerminalID"));
			var terminalName = "";
			if (terminalInfo != undefined) {
				terminalName = terminalInfo.getValue("Name");
			} else { // dataManager에 없는 ID인 경우
				if (dsEventLogList.getValue(i,"TerminalID") == 0) { // 폴링타임 로그면
					terminalName = dataManager.getString("Str_TotalTerminals");
				}
			}
			dsEventLogList.setValue(i, "TerminalName", terminalName);
		}
		
	}
	
	udcEventLogList.setEventLogList(dsEventLogList);	
	udcEventLogList.setPaging(totalCount, pageRowCount, viewPageCount);
	
	app.lookup("ELMGR_udcEventLogList").redraw();
	comLib.hideLoadMask();		
}


/*
 * 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
 */
function onELMGR_udcEventLogListPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.grid.eventLogList
	 */
	var eLMGR_udcEventLogList = e.control;
	
	sendEventLogListRequest();
}


/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onImageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onELMGR_cmbCategorySelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var eLMGR_cmbCategory = e.control;
	var input = app.lookup("ELMGR_edtKeyword");
	if (eLMGR_cmbCategory.value == "all"){
		input.value = "";
		input.visible = false;
	} else {
		input.visible = true;
		input.focus();
	}
}
