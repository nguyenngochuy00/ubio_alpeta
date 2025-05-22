/************************************************
 * AreaInfoPage.js
 * Created at 2018. 12. 20. 오후 5:22:25.
 *
 * @author fois
 ************************************************/
var comLib;
var selectIDMap;
var pageRowCount = 500;
var _terminalListInit = false;
var _editMode;
var _opMode;
var dataManager = cpr.core.Module.require("lib/DataManager");
var uaaic_oemversion;
/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};
/*
 * OEM 버전에 따라 초기 UI visible 등 변경해주는 함수
 */
function initForm() {
	if (uaaic_oemversion == OEM_MCP040) {// oem_mcp 구분
		app.lookup("UAAIC_optTimezone1").visible = true;
		app.lookup("UAAIC_optTimezone2").visible = true;
		app.lookup("UAAIC_optTimezone3").visible = true;
		app.lookup("UAAIC_optTimezone4").visible = true;
		app.lookup("UAAIC_cmbTimezone1").visible = true;
		app.lookup("UAAIC_cmbTimezone2").visible = true;
		app.lookup("UAAIC_cmbTimezone3").visible = true;
		app.lookup("UAAIC_cmbTimezone4").visible = true;
		
		app.lookup("UAAIC_optTimezone").visible = false;
		app.lookup("UAAIC_cmbTimezone").visible = false;
	} else if (uaaic_oemversion == OEM_MBM_MCP){
		app.lookup("UAAIC_optTimezone1").visible = true;
		app.lookup("UAAIC_optTimezone2").visible = true;
		app.lookup("UAAIC_optTimezone3").visible = true;
		app.lookup("UAAIC_optTimezone4").visible = true;
		app.lookup("UAAIC_cmbTimezone1").visible = true;
		app.lookup("UAAIC_cmbTimezone2").visible = true;
		app.lookup("UAAIC_cmbTimezone3").visible = true;
		app.lookup("UAAIC_cmbTimezone4").visible = true;
		
		app.lookup("UAAIC_optTimezone").visible = false;
		app.lookup("UAAIC_cmbTimezone").visible = false;
	} else {
		//app.lookup("mainGroup").getLayout().removeRows([3]);
		app.lookup("mainGroup").getLayout().setRows(["35px", "5px", "30px", "1px", "1fr"]);
	}
}
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	comLib = createComUtil(app);
	selectIDMap = new Map();
	dataManager = getDataManager();
	uaaic_oemversion = dataManager.getOemVersion();
	initForm();
	var udcRegistTerminalList = app.lookup("UAAIC_udcRegistTerminalList");
	udcRegistTerminalList.deleteColumn([13,12,11,10,9,8,7,6,5,4,3]);	
	
	var udcUnregistTerminalList = app.lookup("UAAIC_udcUnregistTerminalList");
	udcUnregistTerminalList.deleteColumn([13,12,11,10,9,8,7,6,5,4,3]);
	udcUnregistTerminalList.setPaging(0, 500, 3);
	
	var getTimezoneList = dataManager.getTimezoneSet();
	var dsTimezoneTinyList = app.lookup("TimezoneTinyList");
	getTimezoneList.copyToDataSet(dsTimezoneTinyList);
}

exports.loadAccessArea = function(areaID){
	sendAccessAreaInfoRequest(areaID)
};

exports.setAccessGroupID = function(accessGroupID){
	var dmAccessGroupID = app.lookup("AccessGroupID");
	dmAccessGroupID.setValue("ID", accessGroupID);
};

exports.setMode = function(opMode,editMode){
	if( editMode != "new" && editMode != "modify"){
		return
	}
	if( opMode != "group" && opMode != "area"){
		return
	}
	_opMode = opMode;
	_editMode = editMode;	
};

exports.updateTimezoneInfo = function( syncInfo ){
	var dsTimezoneTinyList = app.lookup("TimezoneTinyList");
	switch( syncInfo.SyncType ){
		case 1: 
			var row = dsTimezoneTinyList.findFirstRow("TimezoneID == '"+syncInfo.TimezoneInfo.TimezoneID+"'");
			if(row){
				row.setRowData(syncInfo.TimezoneInfo);
			} else {
				dsTimezoneTinyList.addRowData(syncInfo.TimezoneInfo); break;	
			}
		case 2: 
			var row = dsTimezoneTinyList.findFirstRow("TimezoneID == '"+syncInfo.TimezoneInfo.TimezoneID+"'");
			if(row){
				row.setRowData(syncInfo.TimezoneInfo);
			} 
			break;
		case 3:
			var row = dsTimezoneTinyList.findFirstRow("TimezoneID == '"+syncInfo.TimezoneInfo.TimezoneID+"'");
			if(row){
				dsTimezoneTinyList.deleteRow(row.getIndex());
			}
			break;
		default:return;
	}
	dsTimezoneTinyList.commit();
}

function sendAccessAreaInfoRequest(areaID) {
	var accessAreaCode = app.lookup("UAAIC_nbeAreaID").value;
		
	var sms_getAccessAreaInfo = app.lookup("sms_getAccessAreaInfo");
	sms_getAccessAreaInfo.action = "/v1/accessAreas/"+areaID;
	
	comLib.showLoadMask("","","",pageRowCount);
	sms_getAccessAreaInfo.send();	
} 

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getAccessAreaInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getAccessAreaInfo = e.control;
	comLib.hideLoadMask();
	
	var dmResultCode = app.lookup("Result").getValue("ResultCode");
	if( dmResultCode == COMERROR_NONE){
		var udcRegistTerminalList = app.lookup("UAAIC_udcRegistTerminalList");
		var dsAreaInfo = app.lookup("AccessArea");
		app.lookup("UAAIC_nbeAreaID").value = dsAreaInfo.getValue("ID");
		app.lookup("UAAIC_ipbAreaName").value = dsAreaInfo.getValue("Name");
		app.lookup("UAAIC_ipbFloor").value = dsAreaInfo.getValue("Floor");
		
		if (uaaic_oemversion == OEM_MCP040) {
			app.lookup("UAAIC_cmbTimezone1").value = dsAreaInfo.getValue("Timezone");
			app.lookup("UAAIC_cmbTimezone2").value = dsAreaInfo.getValue("Timezone2");
			app.lookup("UAAIC_cmbTimezone3").value = dsAreaInfo.getValue("Timezone3");
			app.lookup("UAAIC_cmbTimezone4").value = dsAreaInfo.getValue("Timezone4");
		} else if (uaaic_oemversion == OEM_MBM_MCP){
			app.lookup("UAAIC_cmbTimezone1").value = dsAreaInfo.getValue("Timezone");
			app.lookup("UAAIC_cmbTimezone2").value = dsAreaInfo.getValue("Timezone2");
			app.lookup("UAAIC_cmbTimezone3").value = dsAreaInfo.getValue("Timezone3");
			app.lookup("UAAIC_cmbTimezone4").value = dsAreaInfo.getValue("Timezone4");
		} else {
			app.lookup("UAAIC_cmbTimezone").value = dsAreaInfo.getValue("Timezone");
		}
		
		selectIDMap.clear();
		var dsTerminalInfo = app.lookup("TerminalInfo");
		var terminalCnt = dsTerminalInfo.getRowCount();
		
		for( var i=0; i < terminalCnt; i++ ){
		
			var row = dsTerminalInfo.getRow(i);
			if( row ){
				selectIDMap.set(row.getValue("ID"),1);
			}
		}	
			
		udcRegistTerminalList.setTerminalList(dsTerminalInfo, "");
		
		var udcUnRegistTerminalList = app.lookup("UAAIC_udcUnregistTerminalList");
		udcUnRegistTerminalList.refreshTerminalList(selectIDMap);		
	}
	
	if( _terminalListInit == false ){
		 comLib.showLoadMask("",dataManager.getString("Str_UserInfoLoading"),"",pageRowCount);
		 sendTerminalListRequest();
	}
}

function sendTerminalListRequest() {
	var accessAreaCode = -1;
		
	var terminalList = app.lookup("UAAIC_udcUnregistTerminalList");	
	var curIndex = terminalList.getCurrentPageIndex();
	
	var pageRowCount = terminalList.getPageRowCount();
	var offset = (curIndex - 1) * pageRowCount;
	
	// 검색 조건 세팅
	var smsGetTerminalList = app.lookup("sms_getTerminalList");
	
	// 페이징 계산하여 요청
	smsGetTerminalList.setParameters("offset", offset);
	smsGetTerminalList.setParameters("limit", pageRowCount);
	
	var fields = ["terminal_id","name"];
	smsGetTerminalList.setParameters("fields", fields);
	
	if (uaaic_oemversion == OEM_REMOTE_FAW_MANAGEMENT){
		// 출입구역에 인증용 단말기(유사 얼굴 체크용)보이지 않도록 처리
		smsGetTerminalList.setParameters("ExceptUseAuth", "true");
	}
	
	comLib.showLoadMask("",dataManager.getString("Str_UserInfoLoading"),"",pageRowCount);
	smsGetTerminalList.send();	
} 


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getTerminalList = e.control;
	
	_terminalListInit = true;
	
	var dsTerminalList = app.lookup("TerminalList");
		
	var terminalList = app.lookup("UAAIC_udcUnregistTerminalList");
	terminalList.setTerminalList(dsTerminalList, "");
	terminalList.refreshTerminalList(selectIDMap);
	
	var dmTotal = app.lookup("Total");
	var totalCount = parseInt(dmTotal.getValue("Count"));		
	terminalList.setTotalCount(totalCount);
	
	comLib.hideLoadMask();
}


/*
 * "저장" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUAAIC_btnAreaSaveClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var uAAIC_btnAreaSave = e.control;
	
	var areaCode = app.lookup("UAAIC_nbeAreaID").value;
	
	/*
	if(_editMode == "new"){
		var dsAccessAreaList = app.lookup("AccessAreaList");
		var groupRows = dsAccessAreaList.findFirstRow("ID == "+areaCode);
		if( groupRows ){			
			comLib.alert("warning", "사용중인 출입구역 아이디 입니다.");			
			return;
		}
	}
	* */
	
	var areaName = app.lookup("UAAIC_ipbAreaName").value;
	if( areaName.length < 1 ){
		comLib.alert("warning", "출입그룹 이름을 입력하세요");	
		return;
	}
	
	var dmAccessAreaAdd = app.lookup("AccessArea");
	dmAccessAreaAdd.setValue("ID",areaCode);
	dmAccessAreaAdd.setValue("Name",areaName);
	dmAccessAreaAdd.setValue("Timezone",app.lookup("UAAIC_cmbTimezone").value);	
	
	if (uaaic_oemversion == OEM_MCP040) {
		dmAccessAreaAdd.setValue("Timezone",app.lookup("UAAIC_cmbTimezone1").value);
	} else if (uaaic_oemversion == OEM_MBM_MCP){
		dmAccessAreaAdd.setValue("Timezone",app.lookup("UAAIC_cmbTimezone1").value);
	} else {
		dmAccessAreaAdd.setValue("Timezone",app.lookup("UAAIC_cmbTimezone").value);
	}
	
	dmAccessAreaAdd.setValue("Timezone2",app.lookup("UAAIC_cmbTimezone2").value);
	dmAccessAreaAdd.setValue("Timezone3",app.lookup("UAAIC_cmbTimezone3").value);
	dmAccessAreaAdd.setValue("Timezone4",app.lookup("UAAIC_cmbTimezone4").value);	
	
	dmAccessAreaAdd.setValue("Floor",app.lookup("UAAIC_ipbFloor").value);
	
	var sms_addAccessArea = app.lookup("sms_addAccessArea");
	
	var dsRegisteredTerminalList = app.lookup("TerminalInfo");
	var terminalCnt = dsRegisteredTerminalList.getRowCount();
	var dsTerminalIDs = app.lookup("TerminalIDs");
	dsTerminalIDs.clear();
	
	for( var i = 0; i < terminalCnt; i++ ){
		var terminalInfo = dsRegisteredTerminalList.getRow(i);
		console.log("id ",terminalInfo.getValue("ID"));
		dsTerminalIDs.addRowData({"ID":terminalInfo.getValue("ID")});	
	} 
	
	if(_editMode == "new"){
		sms_addAccessArea.method = "post";
		comLib.showLoadMask( "", dataManager.getString("Str_AccessAreaAdd"), "",0);
		sms_addAccessArea.action = "/v1/accessAreas";
	}else {
		sms_addAccessArea.method = "put";
		comLib.showLoadMask( "", dataManager.getString("Str_AccessAreaUpdate"), "",0);
		sms_addAccessArea.action = "/v1/accessAreas/"+areaCode;
	}
	
	sms_addAccessArea.userAttr("AreaID",areaCode);
	sms_addAccessArea.send();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_addAccessAreaSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_addAccessArea = e.control;
	comLib.hideLoadMask();
	
	// 출입그룹관리 트리에도 이름 변경사항 반영
	var hostAppIns = app.getHostAppInstance();
	if(hostAppIns.hasAppMethod("updateAccessAreaTreeInAccessGroup")){
		var accessGroupID = app.lookup("AccessGroupID").getValue("ID");
		var dmAccessArea = app.lookup("AccessArea");
		
		hostAppIns.callAppMethod("updateAccessAreaTreeInAccessGroup", dmAccessArea,accessGroupID);
	}
	
	
}

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms_addAccessAreaSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_addAccessArea = e.control;
	
}

/*
 * "삭제" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUAAIC_btnAreaDeleteClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var uAAIC_btnAreaDelete = e.control;
	
	comLib.showLoadMask("","","",0);
	if( _opMode == "group"){
		var dsAccessArea = app.lookup("AccessArea");
		var accessAreaID = dsAccessArea.getValue("ID");
		
		var dsAccessAreaIDs = app.lookup("AccessAreaIDs");
		dsAccessAreaIDs.addRowData({"ID":accessAreaID});
		
		var dmAccessGroupID = app.lookup("AccessGroupID");
		var accessGroupID = dmAccessGroupID.getValue("ID");
		var smsDeleteAccessArea = app.lookup("sms_deleteAccessAreaInGroup");
		smsDeleteAccessArea.action = "/v1/accessGroups/"+accessGroupID+"/accessAreas";
		smsDeleteAccessArea.send();
	}else if( _opMode == "area"){
		var smsDeleteAccessArea = app.lookup("sms_deleteAccessArea");
		var areaID = app.lookup("UAAIC_nbeAreaID").value;		
		smsDeleteAccessArea.action = "/v1/accessAreas/"+areaID;
		smsDeleteAccessArea.send();
	}
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_deleteAccessAreaSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_deleteAccessArea = e.control;
	comLib.hideLoadMask();
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms_deleteAccessAreaSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_deleteAccessArea = e.control;
	
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_deleteAccessAreaInGroupSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_deleteAccessAreaInGroup = e.control;
	comLib.hideLoadMask();
	
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == 0){	
		comLib.alert("success", "출입구역 삭제 성공");	
		var hostAppIns = app.getHostAppInstance();
		if (hostAppIns) {		
			var dsAccessArea = app.lookup("AccessArea");
			var accessAreaID = dsAccessArea.getValue("ID");
			
			var dmAccessGroupID = app.lookup("AccessGroupID");
			var accessGroupID = dmAccessGroupID.getValue("ID");
		
			hostAppIns.callAppMethod("deleteAccessAreaInAccessGroup", accessGroupID, accessAreaID);
		}
	} else {
		comLib.alert("warning", "출입구역 삭제 실패");	
	}
}

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms_deleteAccessAreaInGroupSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_deleteAccessAreaInGroup = e.control;
	
}

/*
 * ">" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUAAIC_btnTerminalUnregistClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var uAAIC_btnTerminalUnregist = e.control;
	
	var dsRegistTerminalList = app.lookup("TerminalInfo");
	
	var udcRegistTerminalList = app.lookup("UAAIC_udcRegistTerminalList");
	var checkedIndices = udcRegistTerminalList.getCheckedRowIndices();
	
	var idList = [];
	checkedIndices.forEach(function(index){
		var row = udcRegistTerminalList.getRow(index);		
		var terminalID = row.getValue("ID");
			
		selectIDMap.delete(terminalID);
		idList.push(terminalID);
	});
		
	idList.forEach(function(terminalID){						
		var delRow = dsRegistTerminalList.findFirstRow("ID == "+terminalID)
		dsRegistTerminalList.realDeleteRow(delRow.getIndex());
	});
			
	var selectTotal = dsRegistTerminalList.getRowCount();
	
	udcRegistTerminalList.setTotalCount(selectTotal);		
	udcRegistTerminalList.setPaging(selectTotal, pageRowCount, 3);
	var readCount = (pageRowCount-1>selectTotal)?selectTotal-1:pageRowCount-1;	
	
	var pageidx = udcRegistTerminalList.getCurrentPageIndex();
	var start = (pageidx-1)*pageRowCount;
	var end = pageidx*pageRowCount-1;
	if ( end >= dsRegistTerminalList.getRowCount() ){
		end = dsRegistTerminalList.getRowCount()-1;
	}
	
	udcRegistTerminalList.setTerminalListRows(dsRegistTerminalList.getRowDataRanged(start, end));
	
	var udcUnRegistTerminalList = app.lookup("UAAIC_udcUnregistTerminalList");
	udcUnRegistTerminalList.refreshTerminalList(selectIDMap);
}


/*
 * "<" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUAAIC_btnTerminalRegistClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var uAAIC_btnTerminalRegist = e.control;
	
	var udcUnRegisteredTerminalList = app.lookup("UAAIC_udcUnregistTerminalList");
	var indices = udcUnRegisteredTerminalList.getCheckedRowIndices();	
	if( indices.length == 0){
		return;
	}
	
	var udcRegisteredTerminal = app.lookup("UAAIC_udcRegistTerminalList");	
	var dsRegisteredTerminalList = app.lookup("TerminalInfo");
		
	var dsUnRegisteredTerminalList = app.lookup("TerminalList");
	
	indices.forEach(function(index){		
		var row = dsUnRegisteredTerminalList.getRow(index);		
		var terminalID = row.getValue("ID");
				
		if( selectIDMap.get(terminalID) == undefined ){				
			dsRegisteredTerminalList.addRowData(row.getRowData());
			
			selectIDMap.set(terminalID,1);
			dsUnRegisteredTerminalList.deleteRow(row.getIndex())
		}
	});
	udcUnRegisteredTerminalList.setUnCheckAll();
	dsRegisteredTerminalList.setSort("ID");
		
	var registTotal = dsRegisteredTerminalList.getRowCount();	
	udcRegisteredTerminal.setTotalCount(registTotal);
		
	udcRegisteredTerminal.setPaging(registTotal, pageRowCount, 3);
		
	var pageidx = udcRegisteredTerminal.getCurrentPageIndex();
	
	var start = (pageidx-1)*pageRowCount;
	var end = pageidx*pageRowCount-1;
	if ( end >= dsRegisteredTerminalList.getRowCount() ){
		end = dsRegisteredTerminalList.getRowCount()-1;		
	}
	
	udcRegisteredTerminal.setTerminalListRows(dsRegisteredTerminalList.getRowDataRanged(start, end));	
	udcUnRegisteredTerminalList.refreshTerminalList(selectIDMap);
}


/*
 * ">>" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUAAIC_btnTerminalUnregistAllClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var uAAIC_btnTerminalUnregistAll = e.control;
	
	var dsRegistTerminalList = app.lookup("TerminalInfo");	
	var udcRegistTerminalList = app.lookup("UAAIC_udcRegistTerminalList");
	
	dsRegistTerminalList.clear();
	selectIDMap.clear();
	udcRegistTerminalList.setTotalCount(0);
	udcRegistTerminalList.setTerminalList(dsRegistTerminalList);

	var udcUnRegistTerminalList = app.lookup("UAAIC_udcUnregistTerminalList");
	udcUnRegistTerminalList.refreshTerminalList(selectIDMap);	
}


/*
 * "<<" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUAAIC_btnTerminalRegistAllClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var uAAIC_btnTerminalRegistAll = e.control;
	
	var udcUnRegisteredTerminalList = app.lookup("UAAIC_udcUnregistTerminalList");
	var dsUnRegisteredTerminalList = app.lookup("TerminalList");
	
	var udcRegisteredTerminal = app.lookup("UAAIC_udcRegistTerminalList");	
	var dsRegisteredTerminalList = app.lookup("TerminalInfo");
		
	var total = dsUnRegisteredTerminalList.getRowCount();
	for( var index = 0; index < total; index++ ){
		var row = dsUnRegisteredTerminalList.getRow(index);
		var terminalID = row.getValue("ID");
		
		if( selectIDMap.get(terminalID) == undefined ){				
			dsRegisteredTerminalList.addRowData(row.getRowData());
			
			selectIDMap.set(terminalID,1);
			dsUnRegisteredTerminalList.deleteRow(row.getIndex())
		}
	}
		
	udcUnRegisteredTerminalList.setUnCheckAll();
	dsRegisteredTerminalList.setSort("TerminalID");
		
	var registTotal = dsRegisteredTerminalList.getRowCount();	
	udcRegisteredTerminal.setTotalCount(registTotal);
		
	udcRegisteredTerminal.setPaging(registTotal, pageRowCount, 3);
		
	var pageidx = udcRegisteredTerminal.getCurrentPageIndex();
	
	var start = (pageidx-1)*pageRowCount;
	var end = pageidx*pageRowCount-1;
	if ( end >= dsRegisteredTerminalList.getRowCount() ){
		end = dsRegisteredTerminalList.getRowCount()-1;		
	}
	
	udcRegisteredTerminal.setTerminalListRows(dsRegisteredTerminalList.getRowDataRanged(start, end));	
	udcUnRegisteredTerminalList.refreshTerminalList(selectIDMap);
}


/*
 * 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
 */
function onUAAIC_udcUnregistTerminalListPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.grid.terminalList
	 */
	var uAAIC_udcUnregistTerminalList = e.control;
	sendTerminalListRequest();
}


/*
 * 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
 */
function onUAAIC_udcRegistTerminalListPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.grid.terminalList
	 */
	var uAAIC_udcRegistTerminalList = e.control;
	var udcRegisteredTerminal = app.lookup("UAAIC_udcRegistTerminalList");
	var dsRegisteredTerminalList = app.lookup("TerminalInfo");
	
	var pageidx = udcRegisteredTerminal.getCurrentPageIndex();
	var registTotal = dsRegisteredTerminalList.getRowCount();
	
	udcRegisteredTerminal.setPaging(registTotal, pageRowCount, 3);
	
	var start = (pageidx-1)*pageRowCount;
	var end = pageidx*pageRowCount-1;
	if ( end >= dsRegisteredTerminalList.getRowCount() ){
		end = dsRegisteredTerminalList.getRowCount()-1;		
	}
	
	udcRegisteredTerminal.setTerminalListRows(dsRegisteredTerminalList.getRowDataRanged(start, end));
}

exports.idForbidden = function() {
	var id = app.lookup("UAAIC_nbeAreaID");
	id.readOnly = true;
	id.spinButton = false;
}

