/************************************************
 * AccessAreaManagement.js
 * Created at 2018. 12. 18. 오후 8:47:10.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var _editMode; // "new" : 신규, "modify" : 수정
var selectIDMap;
var pageRowCount = 500;
var _terminalListInit = false;
var acarm_oemversion;
var rABS = true; // T : 바이너리, F : 어레이 버퍼

var srcTitle;	
/*
 * OEM 버전에 따라 초기 UI visible 등 변경해주는 함수
 */
function initForm() {
	if (acarm_oemversion == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH) {
		app.lookup("ACARM_btnAreaImport").visible = true;
	} else if (acarm_oemversion == OEM_LOTTE_CS) {
		app.lookup("ACARM_opbAreaType").visible = true;
		app.lookup("ACARM_cmbAreaType").visible = true;	
	} else if (acarm_oemversion == OEM_MCP040) {// oem_mcp 구분
		app.lookup("ACARM_optTimezone1").visible = true;
		app.lookup("ACARM_optTimezone2").visible = true;
		app.lookup("ACARM_optTimezone3").visible = true;
		app.lookup("ACARM_optTimezone4").visible = true;
		app.lookup("ACARM_cmbTimezone1").visible = true;
		app.lookup("ACARM_cmbTimezone2").visible = true;
		app.lookup("ACARM_cmbTimezone3").visible = true;
		app.lookup("ACARM_cmbTimezone4").visible = true;
		
		app.lookup("ACARM_optTimezone").visible = false;
		app.lookup("ACARM_cmbTimezone").visible = false;
	} else if (acarm_oemversion == OEM_MBM_MCP) {
		app.lookup("ACARM_optTimezone1").visible = true;
		app.lookup("ACARM_optTimezone2").visible = true;
		app.lookup("ACARM_optTimezone3").visible = true;
		app.lookup("ACARM_optTimezone4").visible = true;
		app.lookup("ACARM_cmbTimezone1").visible = true;
		app.lookup("ACARM_cmbTimezone2").visible = true;
		app.lookup("ACARM_cmbTimezone3").visible = true;
		app.lookup("ACARM_cmbTimezone4").visible = true;
		
		app.lookup("ACARM_optTimezone").visible = false;
		app.lookup("ACARM_cmbTimezone").visible = false;
	}
}

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	selectIDMap = new Map();
	acarm_oemversion = dataManager.getOemVersion();
	initForm();
	if (acarm_oemversion == OEM_GS_BASIC) { 
		app.lookup('grp_AccessArea').getLayout().setRowVisible(2, false);
		app.lookup('grp_AccessArea').getLayout().setRowVisible(3, false);
	}
	var udcRegistTerminalList = app.lookup("ACARM_udcRegistTerminalList");	
	udcRegistTerminalList.deleteColumn([13,12,11,10,9,8,7,6,5,4,3]);	
	
	var udcUnregistTerminalList = app.lookup("ACARM_udcUnregistTerminalList");	
	udcUnregistTerminalList.deleteColumn([13,12,11,10,9,8,7,6,5,4,3]);
	
	var dsTreeContextMenu = app.lookup("dsTreeContextMenu");
	dsTreeContextMenu.addRowData({"label":dataManager.getString("Str_AccessAreaAdd"),"value":1,"parent":"0"});
	//dsTreeContextMenu.addRowData({"label":dataManager.getString("Str_AccessAreaDelete"),"value":2,"parent":"0"});
	
	var terminalList = app.lookup("ACARM_udcUnregistTerminalList");
	terminalList.setPaging(0, 500, 3);
	
	var getTimezoneList = dataManager.getTimezoneSet();
	var dsTimezoneTinyList = app.lookup("TimezoneTinyList");	
	getTimezoneList.copyToDataSet(dsTimezoneTinyList);
	
	sendAccessAreaListRequest();
}

function onSms_SubmitError(/* cpr.events.CSubmissionEvent */ e){	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);}
function onSms_SubmitTimeout(/* cpr.events.CSubmissionEvent */ e){	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);}
//-------------------------------------------------------------------------------------------------< 공통
function sendAccessAreaListRequest(){
	var sms_getAccessArea = app.lookup("sms_getAccessArea");
	sms_getAccessArea.send();
}

// 출입 구역 리스트 가져오기 완료
function onSms_getAccessAreaSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var reesultCode = app.lookup("Result").getValue("ResultCode");
	if( reesultCode == COMERROR_NONE){
		app.lookup("ACARM_treeAccessArea").redraw();	
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(reesultCode)));
	}
}

/*
 * 트리에서 before-selection-change 이벤트 발생 시 호출.
 * 선택된 Item 값이 저장되기 전에 발생하는 이벤트. 다음 이벤트로 selection-change가 발생합니다.
 */
function onACARM_treeAccessAreaBeforeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.Tree	 */
	var aCARM_treeAccessArea = e.control;		
	if(_editMode=="new"){		
		//if ( confirm("출입구역 정보가 저장되지 않았습니다.\n계속 진행하시겠습니까?") == false ) {
		if ( confirm(dataManager.getString("Str_ConfirmAccessAreaSelChange")) == false ) {
			e.preventDefault();
		}
	}
}

/*
 * 트리에서 selection-change 이벤트 발생 시 호출.
 * 선택된 Item 값이 저장된 후에 발생하는 이벤트.
 */
function onACARM_treeAccessAreaSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Tree
	 */
	var aCARM_treeAccessArea = e.control;
	var nbeAreaID = app.lookup("ACARM_nbeAreaID");
	nbeAreaID.readOnly = true;
	nbeAreaID.spinButton = false;
	
	app.lookup("ACARM_nbeAreaID").enabled = true;
	app.lookup("ACARM_ipbAreaName").enabled = true;
	app.lookup("ACARM_btnAreaSave").enabled = true;
	app.lookup("ACARM_btnAreaDelete").enabled = true;
	
	var dsRegistTerminalList = app.lookup("TerminalInfo");
	dsRegistTerminalList.clear();
	_editMode = "modify";
	

	var treeArea = aCARM_treeAccessArea.getSelectionFirst();
	if( treeArea ){	
		var dsAccessAreaList = app.lookup("AccessAreaList");
		var accessArea = dsAccessAreaList.findFirstRow("ID == "+ treeArea.value);
		if( accessArea ){		
			app.lookup("ACARM_nbeAreaID").value = accessArea.getValue("ID");
			app.lookup("ACARM_ipbAreaName").value = accessArea.getValue("Name");
			app.lookup("ACARM_ipbFloor").value = accessArea.getValue("Floor");
			app.lookup("ACARM_cmbTimezone").value = accessArea.getValue("Timezone");
			app.lookup("ACARM_cmbAreaType").value = accessArea.getValue("AreaType");
			sendAccessAreaInfoRequest();				
		}
	}
}

/*
 * 트리에서 contextmenu 이벤트 발생 시 호출.
 * 마우스의 오른쪽 버튼이 클릭되거나 컨텍스트 메뉴 키가 눌려지면 호출되는 이벤트.
 */
function onACARM_treeAccessAreaContextmenu(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Tree
	 */
	var aCARM_treeAccessArea = e.control;
	e.preventDefault();
	
	var menu_1 = new cpr.controls.Menu();
	//menu_1.userAttr("owner", e.control.id);//e.targetControl.id	
	menu_1.setItemSet(app.lookup("dsTreeContextMenu"), {
		label: "label",
		value: "value",
		parentValue: "parent"
	});
			
	var rect = app.getActualRect();
	menu_1.style.css({
		left: (e.clientX - rect.left) + "px",
		top: (e.clientY - rect.top) + "px",
		height: "60px",
		width: "200px",
		position: "absolute"
	});
	menu_1.focus();
	
	menu_1.addEventListener("selection-change", function(e) {		
		switch( menu_1.value ){
		case "1":		
			
			app.lookup("ACARM_nbeAreaID").enabled = true;
			app.lookup("ACARM_ipbAreaName").enabled = true;
			app.lookup("ACARM_btnAreaSave").enabled = true;
			app.lookup("ACARM_btnAreaDelete").enabled = true;
			
			aCARM_treeAccessArea.clearSelection();
			_editMode = "new";
			var nbeAreaID = app.lookup("ACARM_nbeAreaID");
			nbeAreaID.readOnly = false;
			nbeAreaID.spinButton = true;
			
			var areaCode = getEmptyAccessAreaCode();
			var areaName = dataManager.getString("Str_AccessArea")+" "+areaCode;	
						
			app.lookup("ACARM_nbeAreaID").value = areaCode;
			app.lookup("ACARM_ipbAreaName").value = areaName;
			app.lookup("ACARM_ipbFloor").value = 0;
			app.lookup("ACARM_cmbTimezone").value = 0;
			app.lookup("ACARM_cmbTimezone").value = app.lookup("ACARM_cmbAreaType").value;
			sendTerminalListRequest(-1);
			
			var dsRegisteredTerminal = app.lookup("TerminalInfo");
			dsRegisteredTerminal.clear();
			var udcRegisteredTerminal = app.lookup("ACARM_udcRegistTerminalList");
			udcRegisteredTerminal.setTerminalList(dsRegisteredTerminal);
			
			selectIDMap.clear();			
			
			var udcUnregisteredTerminal = app.lookup("ACARM_udcUnregistTerminalList");
			udcUnregisteredTerminal.refreshTerminalList(selectIDMap);
		
			break;
		case "2":
			// 삭제 기능 추가시 출입구역 ID를 아래 컨트롤 값에 넣을 것.. 삭제 성공후 삭제시 사용
			//app.lookup("ACARM_nbeAreaID").value
			break;
		}
		menu_1.dispose();
	});
	// 메뉴에서 벗어날 경우의 이벤트 리스너.. 실제로는 안보이나 css를 통해 설정된 영역을 벗어나 클릭해야 사라짐.. 수정 필요..
	menu_1.addEventListener("blur", function(e) {
		menu_1.dispose();
	});
	app.floatControl(menu_1);
}

function getEmptyAccessAreaCode(){
	var code = 1;
	var dsAccessAreaList = app.lookup("AccessAreaList");
	while( true ){
		var groupRows = dsAccessAreaList.findFirstRow("ID == "+code);
		if( groupRows ){
			code++;			
		} else {
			break;
		}
	}
	return code;
}

/*
 * 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
 */
function onACARM_udcUnregistTerminalListPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.grid.terminalList
	 */
	var aCARM_udcUnregistTerminalList = e.control;
	sendTerminalListRequest();
	
}

function sendTerminalListRequest() {
	var accessAreaCode = -1;
	
	if(_editMode=="modify"){
		accessAreaCode = app.lookup("ACARM_nbeAreaID").value;
	}
	
	var terminalList = app.lookup("ACARM_udcUnregistTerminalList");	
	var curIndex = terminalList.getCurrentPageIndex();
	
	var pageRowCount = terminalList.getPageRowCount();
	var offset = (curIndex - 1) * pageRowCount;
	
	// 검색 조건 세팅
	var smsGetTerminalList = app.lookup("sms_getTerminalList");
		
	smsGetTerminalList.setParameters("ExcludeAccessGroup", accessAreaCode);

	// 페이징 계산하여 요청
	smsGetTerminalList.setParameters("offset", offset);
	smsGetTerminalList.setParameters("limit", pageRowCount);
	
	var fields = ["terminal_id","name"];
	smsGetTerminalList.setParameters("fields", fields);
	
	if (acarm_oemversion == OEM_REMOTE_FAW_MANAGEMENT){
		// 출입구역에 인증용 단말기(유사 얼굴 체크용)보이지 않도록 처리
		smsGetTerminalList.setParameters("ExceptUseAuth", "true");
	}
	
	comLib.showLoadMask("",dataManager.getString("Str_TerminalLoading"),"",pageRowCount);
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
		
	var terminalList = app.lookup("ACARM_udcUnregistTerminalList");
	terminalList.setTerminalList(dsTerminalList);
	terminalList.refreshTerminalList(selectIDMap);
	
	var dmTotal = app.lookup("Total");
	var totalCount = parseInt(dmTotal.getValue("Count"));		
	terminalList.setTotalCount(totalCount);
	
	comLib.hideLoadMask();
	
}

/*
 * ">" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onACARM_btnTerminalUnregistClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aCARM_btnTerminalUnregist = e.control;
	
	var dsRegistTerminalList = app.lookup("TerminalInfo");
	
	var udcRegistTerminalList = app.lookup("ACARM_udcRegistTerminalList");
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
	
	var udcUnRegistTerminalList = app.lookup("ACARM_udcUnregistTerminalList");
	udcUnRegistTerminalList.refreshTerminalList(selectIDMap);
}


/*
 * "<" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onACARM_btnTerminalRegistClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aCARM_btnTerminalRegist = e.control;
	
	var udcUnRegisteredTerminalList = app.lookup("ACARM_udcUnregistTerminalList");
	var indices = udcUnRegisteredTerminalList.getCheckedRowIndices();	
	if( indices.length == 0){
		return;
	}
	
	var udcRegisteredTerminal = app.lookup("ACARM_udcRegistTerminalList");	
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
function onACARM_btnTerminalUnregistAllClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aCARM_btnTerminalUnregistAll = e.control;
	
	var dsRegistTerminalList = app.lookup("TerminalInfo");	
	var udcRegistTerminalList = app.lookup("ACARM_udcRegistTerminalList");
	
	dsRegistTerminalList.clear();
	selectIDMap.clear();
	udcRegistTerminalList.setTotalCount(0);
	udcRegistTerminalList.setTerminalList(dsRegistTerminalList);

	var udcUnRegistTerminalList = app.lookup("ACARM_udcUnregistTerminalList");
	udcUnRegistTerminalList.refreshTerminalList(selectIDMap);	
}


/*
 * "<<" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onACARM_btnTerminalRegistAllClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aCARM_btnTerminalRegistAll = e.control;
	
	var udcUnRegisteredTerminalList = app.lookup("ACARM_udcUnregistTerminalList");
	var dsUnRegisteredTerminalList = app.lookup("TerminalList");
	
	var udcRegisteredTerminal = app.lookup("ACARM_udcRegistTerminalList");	
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
function onACARM_udcRegistTerminalListPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.grid.terminalList
	 */
	var aCARM_udcRegistTerminalList = e.control;
	
	var udcRegisteredTerminal = app.lookup("ACARM_udcRegistTerminalList");
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

/*
 * "저장" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onACARM_btnAreaSaveClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aCARM_btnAreaSave = e.control;
	
	var areaCode = app.lookup("ACARM_nbeAreaID").value;
	
	if(_editMode == "new"){
		var dsAccessAreaList = app.lookup("AccessAreaList");
		var groupRows = dsAccessAreaList.findFirstRow("ID == "+areaCode);
		if( groupRows ){
			//validMsg = "사용중인 출입구역 아이디 입니다."
			//comLib.alert("warning", validMsg);			
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorAccessAreaUsingID"));	
			return;
		}
	}
	
	var areaName = app.lookup("ACARM_ipbAreaName").value;
	if( areaName.length < 1 ){
		//comLib.alert("warning", "출입그룹 이름을 입력하세요");	
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorAccessAreaEnterName"));
		return;
	}
	
	var dmAccessAreaAdd = app.lookup("AccessArea");
	dmAccessAreaAdd.setValue("ID",areaCode);
	dmAccessAreaAdd.setValue("Name",areaName);
	if (acarm_oemversion == OEM_MCP040) {
		dmAccessAreaAdd.setValue("Timezone",app.lookup("ACARM_cmbTimezone1").value);
		dmAccessAreaAdd.setValue("Timezone2",app.lookup("ACARM_cmbTimezone2").value);
		dmAccessAreaAdd.setValue("Timezone3",app.lookup("ACARM_cmbTimezone3").value);
		dmAccessAreaAdd.setValue("Timezone4",app.lookup("ACARM_cmbTimezone4").value);	
	} else if (acarm_oemversion == OEM_MBM_MCP){
		dmAccessAreaAdd.setValue("Timezone",app.lookup("ACARM_cmbTimezone1").value);
		dmAccessAreaAdd.setValue("Timezone2",app.lookup("ACARM_cmbTimezone2").value);
		dmAccessAreaAdd.setValue("Timezone3",app.lookup("ACARM_cmbTimezone3").value);
		dmAccessAreaAdd.setValue("Timezone4",app.lookup("ACARM_cmbTimezone4").value);
	} else {
		dmAccessAreaAdd.setValue("Timezone",app.lookup("ACARM_cmbTimezone").value);
		dmAccessAreaAdd.setValue("Timezone2",app.lookup("ACARM_cmbTimezone2").value);
		dmAccessAreaAdd.setValue("Timezone3",app.lookup("ACARM_cmbTimezone3").value);
		dmAccessAreaAdd.setValue("Timezone4",app.lookup("ACARM_cmbTimezone4").value);	
	}
	
	dmAccessAreaAdd.setValue("Floor",app.lookup("ACARM_ipbFloor").value);
	dmAccessAreaAdd.setValue("AreaType",app.lookup("ACARM_cmbAreaType").value);
	
	var sms_addAccessArea = app.lookup("sms_addAccessArea");
	
	var dsRegisteredTerminalList = app.lookup("TerminalInfo");
	var terminalCnt = dsRegisteredTerminalList.getRowCount();
	var dsTerminalIDs = app.lookup("TerminalIDs");
	dsTerminalIDs.clear();
	
	for( var i = 0; i < terminalCnt; i++ ){
		var terminalInfo = dsRegisteredTerminalList.getRow(i);		
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

// 출입구역 추가 완료
function onSms_addAccessAreaSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_addAccessArea = e.control;
	
	comLib.hideLoadMask();	
	var msg = (_editMode=="new")?dataManager.getString("Str_AccessAreaAdd"):dataManager.getString("Str_AccessAreaUpdate");
	var dmResultCode = app.lookup("Result").getValue("ResultCode");
	if( dmResultCode == COMERROR_NONE){
		_editMode = "modify";		
		
		var dmAccessArea = app.lookup("AccessArea");
		var dsAccessAreaList = app.lookup("AccessAreaList");
		var row = dsAccessAreaList.findFirstRow("ID == " + dmAccessArea.getValue("ID"));
		if( row ){
			row.setValue("Name", dmAccessArea.getValue("Name"));
		//	row.setValue("Timezone", dmAccessArea.getValue("Timezone"));
			row.setValue("Floor", dmAccessArea.getValue("Floor"));
			
			var treeAreaList = app.lookup("ACARM_treeAccessArea");			
			var treeItem = treeAreaList.getItemByValue(dmAccessArea.getValue("ID"))
			//treeAreaList.focusItem(treeItem);
			treeAreaList.selectItemByValue(dmAccessArea.getValue("ID"));
		}else{
			var addedRow = dsAccessAreaList.addRowData(dmAccessArea.getDatas());
			var treeAreaList = app.lookup("ACARM_treeAccessArea");			
			var treeItem = treeAreaList.getItemByValue(addedRow.getValue("ID"))
			//treeAreaList.focusItem(treeItem);
			treeAreaList.selectItemByValue(dmAccessArea.getValue("ID"));
		}		
					
		dialogAlert(app, dataManager.getString("Str_Success"), msg);
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(dmResultCode)));
	}
}

function sendAccessAreaInfoRequest() {
	var accessAreaCode = app.lookup("ACARM_nbeAreaID").value;
		
	var sms_getAccessAreaInfo = app.lookup("sms_getAccessAreaInfo");
	sms_getAccessAreaInfo.action = "/v1/accessAreas/"+accessAreaCode;
	
	comLib.showLoadMask("",dataManager.getString("Str_TerminalLoading"),"",pageRowCount);
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
		var udcRegistTerminalList = app.lookup("ACARM_udcRegistTerminalList");
		var dsAreaInfo = app.lookup("AccessArea");
		app.lookup("ACARM_nbeAreaID").value = dsAreaInfo.getValue("ID");
		app.lookup("ACARM_ipbAreaName").value = dsAreaInfo.getValue("Name");
		app.lookup("ACARM_ipbFloor").value = dsAreaInfo.getValue("Floor");
		if (acarm_oemversion == OEM_MCP040) {
			app.lookup("ACARM_cmbTimezone1").value = dsAreaInfo.getValue("Timezone");
			app.lookup("ACARM_cmbTimezone2").value = dsAreaInfo.getValue("Timezone2");
			app.lookup("ACARM_cmbTimezone3").value = dsAreaInfo.getValue("Timezone3");
			app.lookup("ACARM_cmbTimezone4").value = dsAreaInfo.getValue("Timezone4");
		} else if (acarm_oemversion == OEM_MBM_MCP){
			app.lookup("ACARM_cmbTimezone1").value = dsAreaInfo.getValue("Timezone");
			app.lookup("ACARM_cmbTimezone2").value = dsAreaInfo.getValue("Timezone2");
			app.lookup("ACARM_cmbTimezone3").value = dsAreaInfo.getValue("Timezone3");
			app.lookup("ACARM_cmbTimezone4").value = dsAreaInfo.getValue("Timezone4");
		} else {
			app.lookup("ACARM_cmbTimezone").value = dsAreaInfo.getValue("Timezone");
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
			
		udcRegistTerminalList.setTerminalList(dsTerminalInfo);
		
		var udcUnRegistTerminalList = app.lookup("ACARM_udcUnregistTerminalList");
		udcUnRegistTerminalList.refreshTerminalList(selectIDMap);		
	}
	
	if( _terminalListInit == false ){
		 comLib.showLoadMask("",dataManager.getString("Str_TerminalLoading"),"",pageRowCount);
		 sendTerminalListRequest();
	}
}

/*
 * "삭제" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onACARM_btnAreaDeleteClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aCARM_btnAreaDelete = e.control;
	var smsDeleteAccessArea = app.lookup("sms_deleteAccessArea");
	var areaID = app.lookup("ACARM_nbeAreaID").value;		
	smsDeleteAccessArea.action = "/v1/accessAreas/"+areaID;
	
	comLib.showLoadMask("",dataManager.getString("Str_AccessAreaDelete"),"",0);
	smsDeleteAccessArea.send();	
}

// 출입구역 삭제 완료
function onSms_deleteAccessAreaSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_deleteAccessArea = e.control;
	comLib.hideLoadMask();
	var dmResultCode = app.lookup("Result").getValue("ResultCode");
	if( dmResultCode == COMERROR_NONE){
		var areaID = app.lookup("ACARM_nbeAreaID").value;
		var dsAccessAreaList = app.lookup("AccessAreaList");
		var row = dsAccessAreaList.findFirstRow("ID == "+areaID);
		if( row ){
			dsAccessAreaList.deleteRow(row.getIndex());
			dsAccessAreaList.realDeleteRow(row.getIndex());
		}
		
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_AccessAreaDelete"));
		
		app.lookup("ACARM_btnAreaSave").enabled = false;
		app.lookup("ACARM_btnAreaDelete").enabled = false;
		app.lookup("ACARM_nbeAreaID").enabled = false;
		app.lookup("ACARM_ipbAreaName").enabled = false;
		app.lookup("ACARM_nbeAreaID").value = "";
		app.lookup("ACARM_ipbAreaName").value = "";
		var treeAreaList = app.lookup("ACARM_treeAccessArea");			
		treeAreaList.selectItem(0);
	}else {
		
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_AccessAreaDelete"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(dmResultCode)));
	}
}

// 출입구역 엑셀 가져오기 클릭
function onACARM_btnAreaImportClick(/* cpr.events.CMouseEvent */ e){
	app.getRootAppInstance().openDialog("app/main/accessGroup/accessAreaImport", {width : 500, height : 600}, function(dialog){		
		dialog.bind("headerTitle").toLanguage("Str_Import");
		dialog.modal = true;
	}).then(function(/*cpr.data.DataSet*/idMap){		
	});
}

function onACARM_imgHelpClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}


