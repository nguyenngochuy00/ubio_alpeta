/************************************************
 * accessFloorManagement.js
 * Created at 2020. 6. 15. 오후 6:06:51.
 *
 * @author jrh
 ************************************************/

var comUtil = createComUtil(app);
var dataManager = getDataManager();
var dateLib = cpr.core.Module.require("lib/DateLib");
var EVMGT_edit = 0; // 0:none, 1:add, 2:before add
var oemVersion;
var floorMap; // custormFloor 정보 저장. key: elevatorSetID, value: FloorInfos
var modifyCount = 0;
var oldFloorName;

function onBodyLoad(/* cpr.events.CEvent */ e){
	oemVersion = dataManager.getOemVersion();
	floorMap = new Map();
	if(oemVersion == OEM_MULTI_BUILDING_MAMAGEMENT){
		// 해당 커스터마이징에서는 elevatorSetID가 건물 코드
		app.lookup("EVMGT_grdFloorSet").deleteColumn(0);
		app.lookup("EVMGT_grdElevatorsList").header.getColumn(0).unbind("text");
		app.lookup("EVMGT_grdElevatorsList").header.getColumn(0).bind("text").toLanguage("Str_BuildingCode");
		app.lookup("EVMGT_grdFloorSet").readOnly = false;
		app.lookup("EVMGT_btnClear").enabled = true;
		app.lookup("EVMGT_btnClear").visible = true;	
	}
	var sms_getOptionElevator = app.lookup("sms_getOptionElevator");
	sms_getOptionElevator.send();
}

// 엘레베이터 옵션 가져오기 완료
function onSms_getOptionElevatorSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var sms_getElevatorSetList = app.lookup("sms_getElevatorSetList");
	sms_getElevatorSetList.send();
}

// 엘레베이터 옵션 가져오기 에러
function onSms_getOptionElevatorSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}
// 엘레베이터 옵션 가져오기 타임아웃
function onSms_getOptionElevatorSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);	
}

// 엘리베이터 설정 리스트 가져오기 완료
function onSms_getElevatorSetListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
//	console.log(app.lookup("ElevatorSetList").getRowDataRanged());
	if(oemVersion == OEM_MULTI_BUILDING_MAMAGEMENT){
		app.lookup("sms_getCustomFloorList").send();				
	}
}

// 엘리베이터 설정 리스트 가져오기 에러
function onSms_getElevatorSetListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// 엘리베이터 설정 리스트 가져오기 타임아웃
function onSms_getElevatorSetListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

function getNewID() {	
	var dsElevatorsList = app.lookup("ElevatorSetList");	
	
	var elevatorID = 0;
	var count = dsElevatorsList.getRowCount();
	for( var i = 0; i < count; i++){
		var data = dsElevatorsList.getRow(i);
		var dataID = data.getValue("ElevatorSetID");
		
		if( Number(elevatorID) < Number(dataID) ){
			elevatorID = dataID;			
		}
	}
	elevatorID++;
	return elevatorID;
}

// 엘리베이터 출입 설정 추가 
function onEVMGT_btnAddClick(/* cpr.events.CMouseEvent */ e){	
	if( EVMGT_edit == 1 ){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_DataNotSaved"));		
		e.preventDefault();
		return;
	}
	
	var grdElevatorsList = app.lookup("EVMGT_grdElevatorsList");		
	var dsElevatorsList = app.lookup("ElevatorSetList");
		
	var elevatorID = getNewID();		
	var row = dsElevatorsList.addRowData({
		"ElevatorSetID":elevatorID,"ElevatorSetName":elevatorID,"AccessFloor":""
	})	
	EVMGT_edit = 2; // before add new
	grdElevatorsList.selectRows(row.getIndex(), true);	
	grdElevatorsList.redraw();
}

//
function onEVMGT_grdElevatorsListBeforeSelectionChange(/* cpr.events.CSelectionEvent */ e){	
	if( EVMGT_edit == 1 ){ // 신규 추가중이면 저장 경로
		if ( confirm(dataManager.getString("Str_NotSavedConfirm")) == false ) {
			e.preventDefault();
			return;
		}	
		EVMGT_edit = 0;	// normal state
		
		if(e.oldSelection != null){			
			var grdElevatorsList = app.lookup("EVMGT_grdElevatorsList");
			grdElevatorsList.deleteRow(e.oldSelection[0]);
			
		}
	}
}


function onGrdElevatorsListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	if( EVMGT_edit == 2){
		EVMGT_edit = 1;
	}
	/** @type cpr.controls.Grid	 */
	var grdElevatorsList = e.control;
	
	var dmOptionElevator = app.lookup("OptionElevator");		
	var totalFloorCount = parseInt(dmOptionElevator.getValue("TotalFloorCount")); // 전체 층
	var groundFloor = parseInt(dmOptionElevator.getValue("FirstFloor")); // 1층
	
	var dmAccessFloorInfo = app.lookup("ElevatorSetInfo"); // 선택한 엘레베이터 설정을 맵에 설정하고 화면에 표시
 	var elevatorSetInfo = grdElevatorsList.getSelectedRow();
 	dmAccessFloorInfo.setValue("ElevatorSetID",elevatorSetInfo.getValue("ElevatorSetID"));
 	dmAccessFloorInfo.setValue("ElevatorSetName",elevatorSetInfo.getValue("ElevatorSetName"));
 	dmAccessFloorInfo.setValue("AccessFloor",elevatorSetInfo.getValue("AccessFloor"));
 	
 	var dsFloorList = app.lookup("dsFloorList"); // 이전 층 설정 초기화
 	dsFloorList.clear();
 	app.lookup("ModifyFloorList").clear();
 	
 	for( var i = 1; i < totalFloorCount+1; i++ ) {
 		var floorInfo = "";
 		if( i <= groundFloor-1 ){
 			floorInfo = "B"+(groundFloor-i);
 		}else {
 			floorInfo = ""+(i-groundFloor+1);
 		}		
 		dsFloorList.addRowData({"Floor":i,"FloorName":floorInfo})
 	}
 	
 	if (oemVersion == OEM_MULTI_BUILDING_MAMAGEMENT){
 		if(floorMap.has(dmAccessFloorInfo.getValue("ElevatorSetID"))){
	 		var curMap = floorMap.get(dmAccessFloorInfo.getValue("ElevatorSetID"));
//	 		console.log(curMap);
	 		for(var i = 0; i < curMap.length; i++){
		 		dsFloorList.setValue(curMap[i].AccessFloor - 1, "FloorName", curMap[i].FloorName); 						
	 		}
 		}
 	}
 	dsFloorList.commit();
 	
 	var grdFloorSet = app.lookup("EVMGT_grdFloorSet");
 	if (dmAccessFloorInfo.getValue("AccessFloor") != null){
	 	var accessFloorList = dmAccessFloorInfo.getValue("AccessFloor").split(","); 		
	 	if( accessFloorList.length > 0 && accessFloorList[0] != ""){
	 		accessFloorList.forEach(function(accessFloor){ 			
				var floorRow = grdFloorSet.findFirstRow("Floor=="+accessFloor);
				if(floorRow){
					grdFloorSet.setCheckRowIndex(floorRow.getIndex(), true);
				}
			}); 		
	 	}
 	} 	 	
 	app.lookup("EVMGT_grpBasicInfo").redraw(); 	
	app.lookup("EVMGT_grdFloorSet").redraw();		
}

// 설정 저장 클릭
function onEVMGT_btnSaveClick(/* cpr.events.CMouseEvent */ e){	
	var grdElevatorsList = app.lookup("EVMGT_grdFloorSet"); // 이전 층 설정 초기화
	var dmElevatorSetInfo = app.lookup("ElevatorSetInfo"); 
	
	dmElevatorSetInfo.setValue("AccessFloor","");
	var checkIndices = grdElevatorsList.getCheckRowIndices();
	if( checkIndices.length > 0 ){
		var accessFloor = "";	
		checkIndices.forEach(function(index){
			var row = grdElevatorsList.getRow(index);
			if( row ){
				if( row.checked == true ){
					if( accessFloor.length>0){
						accessFloor += ",";
					}
					accessFloor += (index+1);
				} 
			}		
		});		
		dmElevatorSetInfo.setValue("AccessFloor",accessFloor);
	} 
	
	if( EVMGT_edit == 0 ){ // normat state면 업데이트

		var elevatorSetName = dmElevatorSetInfo.getValue("ElevatorSetName");
		var elevatorSetID = dmElevatorSetInfo.getValue("ElevatorSetID");
	
		dmElevatorSetInfo.setValue("AccessFloor",accessFloor);
		dmElevatorSetInfo.setValue("ElevatorSetName",elevatorSetName);
		dmElevatorSetInfo.setValue("ElevatorSetID",elevatorSetID);
		
		app.lookup("EVMGT_grdElevatorsList").redraw();

		var sms_putElevatorSet = app.lookup("sms_putElevatorSet");
		sms_putElevatorSet.action = "/v1/elevators/"+dmElevatorSetInfo.getValue("ElevatorSetID");
		sms_putElevatorSet.send();
	} else {	// 신규 추가
		var sms_postElevatorSet = app.lookup("sms_postElevatorSet");
		sms_postElevatorSet.send();
	}
}
function updateElevatorSetInfo(){
	var dmElevatorSetInfo = app.lookup("ElevatorSetInfo"); 
	var accessFloor = dmElevatorSetInfo.getValue("AccessFloor");
	var elevatorSetName = dmElevatorSetInfo.getValue("ElevatorSetName");
	var elevatorSetID = dmElevatorSetInfo.getValue("ElevatorSetID");
	
	var dsElevatorsList = app.lookup("ElevatorSetList");
	var elevatorSetInfo = dsElevatorsList.findFirstRow("ElevatorSetID=="+dmElevatorSetInfo.getValue("ElevatorSetID"));
	if(elevatorSetInfo){
		elevatorSetInfo.setValue("AccessFloor",accessFloor);
		elevatorSetInfo.setValue("ElevatorSetName",elevatorSetName);
		elevatorSetInfo.setValue("ElevatorSetID",elevatorSetID);
		
		app.lookup("EVMGT_grdElevatorsList").redraw();
	}
}
// 엘레베이터 설정 완료
function onSms_postAccessFloorSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var value = result.getValue("ResultCode");
	
	if( result.getValue("ResultCode")== COMERROR_NONE) {	
		EVMGT_edit = 0;	
		updateElevatorSetInfo();
		
		if (oemVersion == OEM_MULTI_BUILDING_MAMAGEMENT){
			if(app.lookup("ModifyFloorList") != null && app.lookup("ModifyFloorList").getRowCount() > 0){
				sendCustomFloorInfo();				
			} else {
				dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Saved"));
			}
		} else {
			dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Saved"));			
		}
	} else {		
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
}

// 엘레베이터 설정 에러
function onSms_postAccessFloorSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// 엘레베이터 설정 타임아웃
function onSms_postAccessFloorSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// 엘레베이터 설정 업데이트 완료
function onSms_putElevatorSetSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var value = result.getValue("ResultCode");
	
	if( result.getValue("ResultCode")== COMERROR_NONE) {	
		EVMGT_edit = 0;	
		updateElevatorSetInfo();
		
		if (oemVersion == OEM_MULTI_BUILDING_MAMAGEMENT){
			if(app.lookup("ModifyFloorList") != null && app.lookup("ModifyFloorList").getRowCount() > 0){
				sendCustomFloorInfo();				
			} else {
				dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Saved"));
			}
		} else {			
			dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Saved"));
		}
	} else {		
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
}

// 엘레베이터 설정 업데이트 에러
function onSms_putElevatorSetSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// 엘레베이터 설정 업데이트 타임아웃
function onSms_putElevatorSetSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}


// 삭제 클릭
function onEVMGT_btnDeleteClick(/* cpr.events.CMouseEvent */ e){
	if (oemVersion == OEM_MULTI_BUILDING_MAMAGEMENT){
		dialogConfirm(app, "", dataManager.getString("Str_DeleteConfirm"), function(dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue) {
					var grdElevatorsList = app.lookup("EVMGT_grdElevatorsList");
					var elevatorSetInfo = grdElevatorsList.getSelectedRow();
					if( elevatorSetInfo ){		
						var sms_deleteElevatorSet = app.lookup("sms_deleteElevatorSet");
						sms_deleteElevatorSet.action = "/v1/elevators/"+elevatorSetInfo.getValue("ElevatorSetID");
						sms_deleteElevatorSet.setParameters("rowIndex", elevatorSetInfo.getIndex());
						sms_deleteElevatorSet.send();
					}
				} else {}
			});
		});		
	} else {
		var grdElevatorsList = app.lookup("EVMGT_grdElevatorsList");
		var elevatorSetInfo = grdElevatorsList.getSelectedRow();
		if( elevatorSetInfo ){		
			var sms_deleteElevatorSet = app.lookup("sms_deleteElevatorSet");
			sms_deleteElevatorSet.action = "/v1/elevators/"+elevatorSetInfo.getValue("ElevatorSetID");
			sms_deleteElevatorSet.setParameters("rowIndex", elevatorSetInfo.getIndex());
			sms_deleteElevatorSet.send();
		}
	}
	
}

// 엘리베이터 설정 삭제 완료
function onSms_deleteElevatorSetSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** @type cpr.protocols.Submission	 */
	var sms_deleteElevatorSet = e.control;
	
	var result = app.lookup("Result");		
	if( result.getValue("ResultCode")== COMERROR_NONE) {	
		EVMGT_edit = 0;	
		var grdElevatorsList = app.lookup("EVMGT_grdElevatorsList");
		var rowIndex = sms_deleteElevatorSet.getParameters("rowIndex");
		grdElevatorsList.deleteRow(rowIndex);
		grdElevatorsList.commitData();
		
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Deleted"));
	} else {		
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
}

// 엘리베이터 설정 삭제 실패
function onSms_deleteElevatorSetSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// 엘리베이터 설정 삭제 타임아웃
function onSms_deleteElevatorSetSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}


function onUSMAG_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var uSMAG_imgHelpPage = e.control;
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	console.log(menu_id);
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}


function onSms_getCustomFloorListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");		
	if(result.getValue("ResultCode")== COMERROR_NONE) {	
		var customFloorList = app.lookup("CustomFloorList");
		var floorInfos = app.lookup("FloorInfos");
		floorInfos.clear();
		floorMap.clear();
		var elevatorID = customFloorList.getValue(0, "ElevatorSetID");
		for(var i = 0; i < customFloorList.getRowCount(); i++){
			var row = customFloorList.getRowData(i);
			if(elevatorID != row.ElevatorSetID){
				floorMap.set(elevatorID, floorInfos.getRowDataRanged());
				elevatorID = row.ElevatorSetID;
				floorInfos.clear();
				floorInfos.addRowData({
					"AccessFloor": row.AccessFloor,
					"FloorName": row.FloorName
				});
			} else {
				floorInfos.addRowData({
					"AccessFloor": row.AccessFloor,
					"FloorName": row.FloorName
				});
			}
			
			if(i == customFloorList.getRowCount()-1){
				floorMap.set(elevatorID, floorInfos.getRowDataRanged());
				floorInfos.clear();
			}
		}
//		console.log(floorMap);
	}
}

function onSms_getCustomFloorListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_getCustomFloorListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// 층 이름 수정할 경우
function onIpb1ValueChange(/* cpr.events.CValueChangeEvent */ e){
	var floorName = e.control.value;
	var name = floorName.replace(/^\s+|\s+$/gm,''); // 앞 뒤 공백 제거
	if (name.length == 0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_CustomFloorNameBlank"));
		e.control.value = oldFloorName;
		return;
	}
	e.control.value = name;
	if (oldFloorName != name){
		var modifyFloorList = app.lookup("ModifyFloorList");
		var grdElevator = app.lookup("EVMGT_grdFloorSet");
		var info = grdElevator.getSelectedRow();
		var curFloor = info.getValue("Floor");

		var row = modifyFloorList.findFirstRow("AccessFloor == " + curFloor);
		if(row != null){
			row.setValue("FloorName", e.control.value);
		} else {
			modifyFloorList.addRowData({
				"ElevatorSetID": Number(app.lookup("EVMGT_ipbCode").value),
				"AccessFloor": Number(curFloor),
				"FloorName": e.control.value
			});
		}
//		console.log(app.lookup("ModifyFloorList").getRowDataRanged());		
	} 
}

function onIpb1BeforeValueChange(/* cpr.events.CValueChangeEvent */ e){
	var floorName = e.control.value;
	oldFloorName = floorName;
}

function sendCustomFloorInfo(){
	var elevatorID = app.lookup("ElevatorSetInfo").getValue("ElevatorSetName");
	var customFloorInfo = app.lookup("CustomFloorInfo");
	customFloorInfo.clear();
//	console.log(app.lookup("ModifyFloorList").getRowDataRanged());
	var row = app.lookup("ModifyFloorList").getRowData(modifyCount);
	customFloorInfo.setValue("ElevatorSetID", row.ElevatorSetID);
	customFloorInfo.setValue("AccessFloor", row.AccessFloor);
	customFloorInfo.setValue("FloorName", row.FloorName);
	
	app.lookup("sms_postCustomFloorList").send();		
}


function onSms_postCustomFloorListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");		
	if( result.getValue("ResultCode")== COMERROR_NONE) {
		var dsCustomFloorList = app.lookup("CustomFloorList");
		var floorInfo = app.lookup("CustomFloorInfo");
		var elevatorID = floorInfo.getValue("ElevatorSetID");
		var row = dsCustomFloorList.findFirstRow("ElevatorSetID == " + elevatorID + "&& AccessFloor == " + floorInfo.getValue("AccessFloor"));
		if (row != null){
			console.log(row.getRowData());
			row.setValue("FloorName", floorInfo.getValue("FloorName"));
		} else {
			dsCustomFloorList.addRowData({
				"ElevatorSetID": elevatorID,
				"AccessFloor": floorInfo.getValue("AccessFloor"),
				"FloorName": floorInfo.getValue("FloorName")
			});
		}
			
		modifyCount += 1;
		if (modifyCount < app.lookup("ModifyFloorList").getRowCount()){
			sendCustomFloorInfo();
		} else {
			modifyCount = 0;
			dsCustomFloorList.setSort("ElevatorSetID ASC, AccessFloor ASC");
			floorMap.delete(floorInfo.getValue("ElevatorSetID"));
			dsCustomFloorList.setFilter("ElevatorSetID == " + elevatorID);
			floorMap.set(elevatorID, dsCustomFloorList.getRowDataRanged());
			dsCustomFloorList.clearFilter();
			// console.log(floorMap.get(elevatorID));
			// console.log(dsCustomFloorList.getRowDataRanged());
			dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Saved"));			
		}
		
	} else {		
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
}

function onSms_postCustomFloorListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_postCustomFloorListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

function onEVMGT_btnClearClick(/* cpr.events.CMouseEvent */ e){
	dialogConfirm(app, "", dataManager.getString("Str_ClearConfirm"), function(dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				var smsDeleteCustomFloor = app.lookup("sms_deleteCustomFloor");
				smsDeleteCustomFloor.action = "/v1/mbm/floor/" + app.lookup("EVMGT_ipbCode").value;
				smsDeleteCustomFloor.send();
			} else {}
		});
	});	
	
}

function onSms_deleteCustomFloorSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");		
	if( result.getValue("ResultCode")== COMERROR_NONE) {
		var dmOptionElevator = app.lookup("OptionElevator");		
		var totalFloorCount = parseInt(dmOptionElevator.getValue("TotalFloorCount")); // 전체 층
		var groundFloor = parseInt(dmOptionElevator.getValue("FirstFloor")); // 1층
	 	
	 	var dsFloorList = app.lookup("dsFloorList"); // 이전 층 설정 초기화
	 	dsFloorList.clear();
	 	app.lookup("ModifyFloorList").clear();
	 	
	 	for( var i = 1; i < totalFloorCount+1; i++ ) {
	 		var floorInfo = "";
	 		if( i <= groundFloor-1 ){
	 			floorInfo = "B"+(groundFloor-i);
	 		}else {
	 			floorInfo = ""+(i-groundFloor+1);
	 		}		
	 		dsFloorList.addRowData({"Floor":i,"FloorName":floorInfo})
	 	}
	 	floorMap.delete(Number(app.lookup("EVMGT_ipbCode").value));	 	
	 	dsFloorList.commit();	 	
		app.lookup("EVMGT_grdFloorSet").redraw();
	} else {		
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}	
}

function onSms_deleteCustomFloorSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_deleteCustomFloorSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}
