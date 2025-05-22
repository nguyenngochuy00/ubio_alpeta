/************************************************
 * TimelineManagementW.js
 * Created at 2019. 1. 22. 오전 9:26:52.
 *
 * @author osm8667
 ************************************************/

var dataManager = getDataManager();
var comUtil = createComUtil(app);
var isOk = false;

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();

	var emb = app.lookup("embSingle");
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
	var getTimeline = app.lookup("smsGetTimeline");
	getTimeline.send();
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
	var getHolydayList = app.lookup("smsGetHolidayInfo");
	getHolydayList.action = "/v1/timezones/holidays";
	getHolydayList.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetHolidayInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var smsGetHolidayInfo = e.control;
	var emb = app.lookup("embSingle");
	emb.setShlContent();
}


/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onLeftGrdSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/**
	 * @type cpr.controls.Grid
	 */
	var leftGrd = e.control;
	checkGrd(e);
	if(!isOk){
		return;
	}
	var rowState = leftGrd.getSelectedRow().getStateString();
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


/*
 * "추가" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnRowAddClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var btnRowAdd = e.control;
	var timezoneList = app.lookup("TimezoneList");
	var max = timezoneList.getMax("TimezoneID");
	var oGrid = app.lookup("leftGrd");
	var rowIndex = oGrid.getSelectedRowIndex();
	checkGrd();
	if(!isOk){
		return;
	}
	clearTime();
	oGrid.insertRowData(oGrid.getRowCount(), true, {"TimezoneID":max==null?1:parseInt(max)+1, "Name": "New"});
	oGrid.setEditRowIndex(oGrid.getRowCount()-1);//별도 다이얼로그 없이 그리드에서 이름 등록
	oGrid.selectRows(oGrid.getRowCount()-1);
	if(oGrid.getRowCount()==0){
		setCombo();
	}
	isOk = false;
}


// 타임존 삭제 버튼 클릭
function onBtnRowDelClick(/* cpr.events.CMouseEvent */ e){

	var oGrid = app.lookup("leftGrd");
	var rowIndex = oGrid.getSelectedRowIndex();
	checkGrd();
	if(!isOk){
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


function timezoneDelete(index){
	var oGrid = app.lookup("leftGrd");
	var rowID = oGrid.getRow(index).getValue("TimezoneID");
	var deleteSms = app.lookup("smsDeleteTimeZone");
	deleteSms.setParameters("id", rowID);
	deleteSms.action="/v1/timezones/"+rowID;
	deleteSms.send();
	deleteSms.addEventListenerOnce("submit-success", function(){
		dialogAlert(app, "", dataManager.getString("Str_DeleteNotify"), "");
		oGrid.deleteRow(index);
		oGrid.commitData();
		oGrid.redraw();
		clearTime();
	});
}


/*
 * "타임라인관리" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnOpenTmgtClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var btnOpenTmgt = e.control;
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target":DLG_TIMELINE_NITZEN
		}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}


/*
 * "공휴일관리" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnOpenHmgtClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var btnOpenHmgt = e.control;
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target":DLG_HOLIDAY_MANAGEMENT
		}
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
	var oGrid = app.lookup("leftGrd");
	var rowIndex = oGrid.getSelectedRowIndex();
	if(rowIndex==null){
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
	var embTime = app.lookup("embSingle");
	var oGrid = app.lookup("leftGrd");
	var rowIndex = oGrid.getSelectedRowIndex();
	var holidayID = embTime.getHolidayID();
	var values = embTime.getValues();
	//받아온 데이터를 그리드 지정 셀에 입력(그리드 로우의 상태 값에 따라 동작하기때문에 그리드에 데이터 바인딩)
	values.forEach(function(/* Object */ each, idx){
		if(isNaN(each)||!each){
			each = 0;
		}
		oGrid.setCellValue(rowIndex, 2, holidayID);
		oGrid.setCellValue(rowIndex, /*ID,Name,HolidayID제외*/3+idx, parseInt(each));
	});
	var rowID = oGrid.getRow(rowIndex).getValue("TimezoneID");
	var rowState = oGrid.getSelectedRow().getStateString();
	var saveSms = app.lookup("smsSaveTimeZone");
	// smsSaveTimeZoce에 요청 데이터는 데이터 셋으로 되어 있으나 로직상 1개씩만 보내게 구성
	if(rowState.toLowerCase()=="i"){
		saveSms.method = "POST";
		saveSms.action = "/v1/timezones";
		saveSms.send();
	}else{
		//saveSms.setParameters("id", rowID);
		saveSms.method = "PUT";
		saveSms.action = "/v1/timezones/"+rowID;
		saveSms.send();
	}

}

// 타임존 저장 완료
function onSmsSaveTimeZoneSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode")
	if( resultCode == COMERROR_NONE){
		app.lookup("btnTmSave").enabled = false;
		var oGrid = app.lookup("leftGrd");
		oGrid.commitData();
		oGrid.clearSelection(false);
		oGrid.redraw();
		clearTime();

		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Saved"));
	}else{
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_SaveFailed"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 타임존 저장 에러
function onSmsSaveTimeZoneSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 타임존 저장 타임아웃
function onSmsSaveTimeZoneSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

/*
 * 그리드에서 insert 이벤트 발생 시 호출.
 * Grid의 행이 추가되었을 때 이벤트.
 */
function onLeftGrdInsert(/* cpr.events.CGridEvent */ e){
	/**
	 * @type cpr.controls.Grid
	 */
	var leftGrd = e.control;
	app.lookup("btnTmSave").enabled = true;
}


/*
 * 그리드에서 update 이벤트 발생 시 호출.
 * Grid의 행 데이터가 수정되었을 때 이벤트.
 */
function onLeftGrdUpdate(/* cpr.events.CGridEvent */ e){
	/**
	 * @type cpr.controls.Grid
	 */
	var leftGrd = e.control;
	app.lookup("btnTmSave").enabled = true;
}


/*
 * 콤보 세팅; 선택한 그리드 로우의 타임라인 , 공휴일 정보 바인딩.
 */
function setCombo(){
	var timelist = app.lookup("TimezoneList");
	var selectRow = timelist.findFirstRow("TimezoneID==" + app.lookup("leftGrd").getSelectedRow().getValue("TimezoneID"));
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
	var emb = app.lookup("embSingle");
	emb.setItems(jsonData, app.lookup("ValList"), app.lookup("TimelineList"), holidayID, app.lookup("HolidayList"));
}


/*
 * 타임라인 초기화
 */
function clearTime(){
	var emb = app.lookup("embSingle");
	emb.getItems().forEach(function(/* Object */ each){
		each.itemsData.clear();
	});
	emb.clearCombos();
}


/**
 * 선택한 로우의 상태가 unchanged 상태가 아닐때 확인 후 삭제한다.
 * @param {any} ev
 */
function checkGrd(/* cpr.events.CSelectionEvent */ev){
	var leftGrd = app.lookup("leftGrd");
	if(!isOk){
		if (comUtil.isUpdated("TimezoneList") == true) {
			dialogConfirm(app, "", dataManager.getString("Str_NoSavedRow"), function(/*cpr.controls.Dialog*/dialog){
				dialog.addEventListenerOnce("close", function(e) {
					if (dialog.returnValue) {
						if(ev){
							ev.stopPropagation();//현재 이벤트 추가 전파 금지
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
			isOk = true;
		}
	}
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
// 도움말 클릭
function onImageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

