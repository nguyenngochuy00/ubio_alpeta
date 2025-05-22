/************************************************
 * TimelineManagementW.js
 * Created at 2019. 1. 22. 오전 9:26:52.
 *
 * @author osm8667
 ************************************************/
var comUtil = createComUtil(app);
var checkTZUpdate = false;
var dataManager = getDataManager();

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var emb = app.lookup("embDouble");
	emb.setRootApp(app);
	var getTimeList = app.lookup("smsGetTimeZone");
	getTimeList.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetTimeZoneSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var smsGetTimeZone = e.control;
	
	var smsGetTimeline = app.lookup("smsGetTimeline");
	smsGetTimeline.userAttr("update", "0");
	smsGetTimeline.send();
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSmsGetTimelineSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var smsGetTimeline = e.control;

	var itemList = app.lookup("ValList");
	var timeList = app.lookup("TimelineList");
	//console.log(timeList.getRowDataRanged());
	for(var i=0; i<itemList.getRowCount(); i++){
		var itemRow = itemList.getRow(i);
		var nameRow = timeList.findFirstRow("TimelineID==" + itemRow.getValue("TimelineID"));
		itemRow.setValue("ExtVal", nameRow.getValue("Type"));//버디의 경우 타입 값이 ExtVal이 된다.
	}

	if( smsGetTimeline.userAttr("update") == "0"){
		var getHolydayList = app.lookup("smsGetHolidayInfo");
		getHolydayList.action = "/v1/timezones/holidays";
		getHolydayList.send();
	} else {
		clearTime();
		var emb = app.lookup("embDouble");		
		var holidayID = emb.getCurrentHoliday();		
		setCombo();
		emb.selectHoliday(holidayID);
	}
}

// 공휴일 정보 가져오기 성공
function onSmsGetHolidayInfoSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** @type cpr.protocols.Submission	 */
	var smsGetHolidayInfo = e.control;
	var isUpdate = smsGetHolidayInfo.userAttr("update");
	if( isUpdate == 1 ){
		clearTime();
		var emb = app.lookup("embDouble");		
		var holidayID = emb.getCurrentHoliday();		
		setCombo();
		emb.selectHoliday(holidayID);
	}else {
		var emb = app.lookup("embDouble");
		emb.setShlContent();
	}
}

// 타임존 리스트에서 before-selection-change 이벤트 발생 시 호출. 
function onTMTZV_grdTimezoneListBeforeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.Grid	 */
	var tMTZV_grdTimezoneList = e.control;
	
	var embTime = app.lookup("embDouble");
	var grdTimezoneList = app.lookup("TMTZV_grdTimezoneList");
	var rowIndex = grdTimezoneList.getSelectedRowIndex();
	if(rowIndex == -1 ){
		return;
	}
	var rowTimezone = grdTimezoneList.getRow(rowIndex);
	var rowState = rowTimezone.getStateString();
	if( rowState.toLowerCase() != "i" ){
		return
	}
	
	var holidayID = embTime.getHolidayID();
	var values = embTime.getValues();
	values.forEach(function(/* Object */ each, idx){//받아온 데이터를 그리드 지정 셀에 입력(그리드 로우의 상태 값에 따라 동작하기때문에 그리드에 데이터 바인딩)
		if(isNaN(each)||!each){
			each = 0;
		}
		grdTimezoneList.setCellValue(rowIndex, 2, holidayID);
		grdTimezoneList.setCellValue(rowIndex, /*ID,Name,HolidayID제외*/3+idx, parseInt(each));
	});
}

/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onTMTZV_grdTimezoneListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/**
	 * @type cpr.controls.Grid
	 */
	var leftGrd = app.lookup("TMTZV_grdTimezoneList");
	var rowIndex = leftGrd.getSelectedRowIndex();
	var rowCount = leftGrd.getRowCount();
	var isUpdated = comUtil.isUpdated("TimezoneList");
	
	//2개 이상 추가 한 상태에서 새로 추가한 후 다른 휴일 클릭 시 경고창 -> 취소 버튼 누르면 접근
	if(checkTZUpdate == false && isUpdated == true && rowIndex == rowCount-1 && leftGrd.getRowState(rowIndex-1) == 1){
		return;
	}	
	//1개만 저장한 상태에서 추가 후 저장 안하고 첫번째 로우 클릭했을시 경고창 -> 취소 버튼 클릭시 접근 
	if(checkTZUpdate == false && isUpdated == true && rowIndex == rowCount-2 && leftGrd.getRowState(rowIndex) == 2){
		var grd = app.lookup("TMTZV_grdTimezoneList");
		leftGrd.deleteRow(grd.getSelectedRow().getIndex()+1);
		return;
	}
	
//	if ( confirmTimezoneUpdate(e) == false ) {
//		return;
//	}

	confirmTimezoneUpdate(e);
	if(!checkTZUpdate) {
		return;
	}
	
	var leftGrd = e.control;	
	var rowTimezone = leftGrd.getSelectedRow();
	//console.log(rowTimezone.getRowData());
	var rowState = rowTimezone.getStateString();
	var delBtn = app.lookup("btnRowDel");
	if(rowState.toLowerCase()=="uc"){//UNCHANGED; 저장된 상태면 삭제버튼 활성화
		if(!delBtn.enabled){
			delBtn.enabled = true;
		}
	}else{
		delBtn.enabled = false;
	}
	var title = app.lookup("optTitle");
	var selectedName = leftGrd.getSelectedRow().getValue("Name");
	if(!selectedName){//타임존 명칭이 없는 경우에는 특정 문자 입력
		selectedName = "New";
	}
	clearTime();
	setCombo();
}

function displayTimezoneInfo(){
	
}


// 타임존 [추가] 버튼 클릭
function onBtnRowAddClick(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Button	 */
	var btnRowAdd = e.control;
	
	var isUpdated = comUtil.isUpdated("TimezoneList");
	if(checkTZUpdate == false && isUpdated == false){
		checkTZUpdate = true;
	}
	
	var timezoneList = app.lookup("TimezoneList");
	var timezoneIDMax = timezoneList.getMax("TimezoneID");
	var grdTimezoneList = app.lookup("TMTZV_grdTimezoneList");
	var rowIndex = grdTimezoneList.getSelectedRowIndex();
	//checkGrd();
	
//	checkTZUpdate = true;
//	if ( confirmTimezoneUpdate() == false ) {
//		return;
//	}
	clearTime();
		
//	checkTZUpdate = false;
	grdTimezoneList.insertRowData(grdTimezoneList.getRowCount(), true, 
		{"TimezoneID":timezoneIDMax==null?1:parseInt(timezoneIDMax)+1, "Name": "New"});
	
	grdTimezoneList.setEditRowIndex(grdTimezoneList.getRowCount()-1);//별도 다이얼로그 없이 그리드에서 이름 등록
	grdTimezoneList.selectRows(grdTimezoneList.getRowCount()-1);
	if(grdTimezoneList.getRowCount()==0){
		setCombo();
	}
	//checkTZUpdate = true;
	checkTZUpdate = false;
}


// 타임존 삭제 클릭
function onBtnRowDelClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var btnRowDel = e.control;
	var grdTimezoneList = app.lookup("TMTZV_grdTimezoneList");
	var rowIndex = grdTimezoneList.getSelectedRowIndex();
	//checkGrd();
	if ( confirmTimezoneUpdate() == false ) {
		return;
	}
	if(rowIndex==null){
		dialogAlert(app, "", dataManager.getString("Str_NoSelection"), "");
		return;
	}
	dialogConfirm(app, "", dataManager.getString("Str_DeleteConfirm"), function(/*cpr.controls.Dialog*/dialog){
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				timezoneDelete(rowIndex);
			} else {
				return;
			}
		});
	});
}

function confirmTimezoneUpdate(/* cpr.events.CSelectionEvent */ ev){
	var leftGrd = app.lookup("TMTZV_grdTimezoneList");
	var isUpdated = comUtil.isUpdated("TimezoneList");
	console.log("checkTZUpdate: "+ checkTZUpdate);
	console.log("isUpdated: "+ isUpdated);

	if(!checkTZUpdate){
		var isUpdated = comUtil.isUpdated("TimezoneList");
		if (isUpdated == true) {
			dialogConfirm(app, "", dataManager.getString("Str_NoSavedRow"), function(/*cpr.controls.Dialog*/dialog){
				dialog.addEventListenerOnce("close", function(e) {
					if (dialog.returnValue) {
						if(ev){
							console.log(ev.type);
							leftGrd.deleteRow(ev.oldSelection[0]);
						}
						return;
					} else {
						if(ev){
							ev.stopPropagation();
							leftGrd.setEditRowIndex(ev.oldSelection[0]);
							leftGrd.selectRows(ev.oldSelection[0],false);
						}
						return;
					}
				});
			});
			
		} else {
			checkTZUpdate = true;
		}
	}
	
//	var leftGrd = app.lookup("TMTZV_grdTimezoneList");
//	
//	if( checkTZUpdate == false ){ // 체크 하지 않도록 설정된 경우 리턴
//		return;
//	}
//	
//	if (comUtil.isUpdated("TimezoneList") == false) { // 변경 사항이 없다		
//		return true;
//	}
//	dialogConfirm(app, "", dataManager.getString("Str_NoSavedRow"), function(/*cpr.controls.Dialog*/dialog){
//		dialog.addEventListenerOnce("close", function(e) {
//			if (dialog.returnValue) { // 저장하지 않은 항목은 삭제
//				if(ev){ // 실제 그리드에서 선택된 행이 있는 경우
//					leftGrd.deleteRow(ev.oldSelection[0]);				
//				}
//				clearTime();
//				setCombo();				
//				return;
//			} else { // 다른 타임존 선택  취소. 저장하지 않은 항목 보전.
//				if(ev){		
//					ev.stopPropagation();		
//					checkTZUpdate = false;										
//					leftGrd.setEditRowIndex(ev.oldSelection[0]);
//					leftGrd.selectRows(ev.oldSelection[0],false);
//					checkTZUpdate = true;					
//				}
//				return;
//			}
//		});
//	});
}


function timezoneDelete(index){
	var grdTimezoneList = app.lookup("TMTZV_grdTimezoneList");
	var rowID = grdTimezoneList.getRow(index).getValue("TimezoneID");
	var deleteSms = app.lookup("smsDeleteTimeZone");
	
	deleteSms.action = "/v1/timezones/" + rowID;
	deleteSms.send();
	deleteSms.addEventListenerOnce("submit-success", function(){
		dialogAlert(app, "", dataManager.getString("Str_DeleteNotify"), "");
		grdTimezoneList.deleteRow(index);
		grdTimezoneList.commitData();
		grdTimezoneList.redraw();
		clearTime();
		setCombo();
	});
}

// [타임라인관리] 클릭
function onBtnOpenTmgtClick(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Button	 */
	var btnOpenTmgt = e.control;
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {"Target":DLG_TIMELINE_VIRDI}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

// [공휴일관리] 버튼에서 click 이벤트 발생 시 호출.
function onBtnOpenHmgtClick(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Button	 */
	var btnOpenHmgt = e.control;
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {"Target":DLG_HOLIDAY_MANAGEMENT}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

/*
 * "저장" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnTmSaveClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var btnTmSave = e.control;
	var grdTimezoneList = app.lookup("TMTZV_grdTimezoneList");
	var rowIndex = grdTimezoneList.getSelectedRowIndex();
	if( rowIndex == null ){
		dialogAlert(app, "", dataManager.getString("Str_NoSelection"), "");
		return;
	}
	dialogConfirm(app, "", dataManager.getString("Str_SaveConfirm"), function(/*cpr.controls.Dialog*/dialog){
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				timezoneSave();
			} else {
				return;
			}
		});
	});
}

function timezoneSave(){
	var embTime = app.lookup("embDouble");
	var grdTimezoneList = app.lookup("TMTZV_grdTimezoneList");
	var rowIndex = grdTimezoneList.getSelectedRowIndex();
	var holidayID = embTime.getHolidayID();
	var values = embTime.getValues();
	values.forEach(function(/* Object */ each, idx){//받아온 데이터를 그리드 지정 셀에 입력(그리드 로우의 상태 값에 따라 동작하기때문에 그리드에 데이터 바인딩)
		if(isNaN(each)||!each){
			each = 0;
		}
		grdTimezoneList.setCellValue(rowIndex, 2, holidayID);
		grdTimezoneList.setCellValue(rowIndex, /*ID,Name,HolidayID제외*/3+idx, parseInt(each));
	});
	var rowID = grdTimezoneList.getRow(rowIndex).getValue("TimezoneID");
	var rowState = grdTimezoneList.getSelectedRow().getStateString();
	var saveSms = app.lookup("smsSaveTimeZone");

	{
		var row = grdTimezoneList.getRow(rowIndex);
		var info = app.lookup("TimezoneInfo");

		info.setValue("TimezoneID", row.getValue("TimezoneID"));
		info.setValue("Name", row.getValue("Name"));
		info.setValue("HolidayID", row.getValue("HolidayID"));
		
		var holiday = row.getValue("Holiday");		
		if( holiday == 0 ){
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_TimezoneDayNotSelected"));
			return; 
		}
		info.setValue("Holiday", holiday);
		
		var sunday = row.getValue("Sunday")	
		if( sunday == 0 ){
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_TimezoneDayNotSelected"));
			return; 
		}
		info.setValue("Sunday", row.getValue("Sunday"));
		
		var monday = row.getValue("Monday");	
		if( monday == 0 ){
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_TimezoneDayNotSelected"));
			return; 
		}
		info.setValue("Monday", monday);
		
		var tuesday = row.getValue("Tuesday");	
		if( tuesday == 0 ){
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_TimezoneDayNotSelected"));
			return; 
		}
		info.setValue("Tuesday", tuesday);
		
		var wednesday = row.getValue("Wednesday");	
		if( wednesday == 0 ){
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_TimezoneDayNotSelected"));
			return; 
		}
		info.setValue("Wednesday", wednesday);
		
		var thursday = row.getValue("Thursday")	
		if( thursday == 0 ){
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_TimezoneDayNotSelected"));
			return; 
		}
		info.setValue("Thursday", thursday);
		
		var friday = row.getValue("Friday");	
		if( friday == 0 ){
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_TimezoneDayNotSelected"));
			return; 
		}
		info.setValue("Friday", friday);
		
		var saturday = row.getValue("Saturday");	
		if( saturday == 0 ){
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_TimezoneDayNotSelected"));
			return; 
		}
		info.setValue("Saturday", saturday);
	}

	if(rowState.toLowerCase()=="i"){
		saveSms.action = "/v1/timezones";
		saveSms.send();
	}else{
		//saveSms.setParameters("id", rowID);
		saveSms.action = "/v1/timezones/" + rowID;
		saveSms.method = "PUT";
		saveSms.send();
	}

}

// 타임존 저장 완료
function onSmsSaveTimeZoneSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		app.lookup("btnTmSave").enabled = false;
		
		var grdTimezoneList = app.lookup("TMTZV_grdTimezoneList");
		grdTimezoneList.commitData();
		grdTimezoneList.clearSelection(false);
		grdTimezoneList.redraw();
		
		clearTime();
		
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Saved")); 
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_SaveFailed"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

// 타임존 저장 에러
function onSmsSaveTimeZoneSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR);
}

// 타임존 저장 타임아웃
function onSmsSaveTimeZoneSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// 타임존 리스트에서 타임존 추가 이벤트 발생
function onTMTZV_grdTimezoneListInsert(/* cpr.events.CGridEvent */ e){
	/** @type cpr.controls.Grid	 */
	var leftGrd = e.control;
	app.lookup("btnTmSave").enabled = true;
}

// 타임존 리스트에서 타임존 업데이트 이벤트 발생
function onTMTZV_grdTimezoneListUpdate(/* cpr.events.CGridEvent */ e){
	/** @type cpr.controls.Grid	 */
	var leftGrd = e.control;
	app.lookup("btnTmSave").enabled = true;
}

function setCombo(){
	var timelist = app.lookup("TimezoneList");
	var grdTimezoneList = app.lookup("TMTZV_grdTimezoneList").getSelectedRow();
	if( grdTimezoneList == null ){
		return;
	}
	var selectRow = timelist.findFirstRow("TimezoneID==" + grdTimezoneList.getValue("TimezoneID"));
	var holidayID = selectRow.getValue("HolidayID");
	var jsonData = null;
	if(selectRow){
		jsonData = selectRow.getRowData();
		//필요없는 부분 삭제
		delete jsonData["TimezoneID"];
		delete jsonData["Name"];
		delete jsonData["HolidayID"];
	}
	//
	var filteredList = [];

	var emb = app.lookup("embDouble");
	emb.setItems(jsonData, app.lookup("ValList"), app.lookup("TimelineList"), holidayID, app.lookup("HolidayList"));
}


function clearTime(){
	var emb = app.lookup("embDouble");
	emb.getItems().forEach(function(/* Object */ each){
		each.itemsData.clear();
	});
	emb.clearCombos();
}

exports.updateTimezoneInfo = function( syncInfo ){
	var dsTimezoneList = app.lookup("TimezoneList");
	switch( syncInfo.SyncType ){
		case 1: 
			var row = dsTimezoneList.findFirstRow("TimezoneID == '"+syncInfo.TimezoneInfo.TimezoneID+"'");
			if(row){
				row.setRowData(syncInfo.TimezoneInfo);
			} else {
				dsTimezoneList.addRowData(syncInfo.TimezoneInfo); break;	
			}
		case 2: 
			var row = dsTimezoneList.findFirstRow("TimezoneID == '"+syncInfo.TimezoneInfo.TimezoneID+"'");
			if(row){
				row.setRowData(syncInfo.TimezoneInfo);
			} 
			break;
		case 3:
			var row = dsTimezoneList.findFirstRow("TimezoneID == '"+syncInfo.TimezoneInfo.TimezoneID+"'");
			if(row){
				dsTimezoneList.deleteRow(row.getIndex());
			}
			break;
		default:return;
	}
	dsTimezoneList.commit();
}

exports.onHolidayUpdate = function() {
	var smsGetHolidayInfo = app.lookup("smsGetHolidayInfo");
	smsGetHolidayInfo.userAttr("update", "1");
	smsGetHolidayInfo.send();
}

exports.onTimelineUpdate = function(){
	var smsGetTimeline = app.lookup("smsGetTimeline");
	smsGetTimeline.userAttr("update", "1");
	smsGetTimeline.send();
}

// 도움말 이미지 클릭
function onImageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

