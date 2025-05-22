/************************************************
 * AccessAreaManagement.js
 * Created at 2018. 12. 18. 오후 8:47:10.
 *
 * @author fois
 ************************************************/

var comLib;
var _editMode; // "new" : 신규, "modify" : 수정
var selectIDMap;
var pageRowCount = 500;
var _terminalListInit = false;

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	comLib = createComUtil(app);
	selectIDMap = new Map();
	
	var initValue = app.getHost().initValue;
	var dsAccessAreaList = app.lookup("AccessAreaList");
	
	initValue["AccessAreaList"].copyToDataSet(dsAccessAreaList);
		
	app.lookup("ACARM_treeAccessArea").redraw();	
	
	var udcRegistTerminalList = app.lookup("ACARM_udcRegistTerminalList");	
	udcRegistTerminalList.deleteColumn([13,12,11,10,9,8,7,6,5,4,3]);	
	
	var udcUnregistTerminalList = app.lookup("ACARM_udcUnregistTerminalList");	
	udcUnregistTerminalList.deleteColumn([13,12,11,10,9,8,7,6,5,4,3]);
	
	var dsTreeContextMenu = app.lookup("dsTreeContextMenu");
	dsTreeContextMenu.addRowData({"label":"출입구역 추가","value":1,"parent":"0"});
	dsTreeContextMenu.addRowData({"label":"출입구역 삭제","value":2,"parent":"0"});
	
	var terminalList = app.lookup("ACARM_udcUnregistTerminalList");
	terminalList.setPaging(0, 500, 3);
}


/*
 * 트리에서 before-selection-change 이벤트 발생 시 호출.
 * 선택된 Item 값이 저장되기 전에 발생하는 이벤트. 다음 이벤트로 selection-change가 발생합니다.
 */
function onACARM_treeAccessAreaBeforeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	
	/** 
	 * @type cpr.controls.Tree
	 */
	var aCARM_treeAccessArea = e.control;
		
	if(_editMode=="new"){		
		if ( confirm("출입구역 정보가 저장되지 않았습니다.\n계속 진행하시겠습니까?") == false ) {
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
		menu_1.dispose();
		
		switch( e.newSelection[0].value ){
		case "1":		
		
			aCARM_treeAccessArea.clearSelection();
			_editMode = "new";
			
			var areaCode = getEmptyAccessAreaCode();
			var areaName = "출입구역 "+areaCode;	
						
			app.lookup("ACARM_nbeAreaID").value = areaCode;
			app.lookup("ACARM_ipbAreaName").value = areaName;
			app.lookup("ACARM_ipbFloor").value = 0;
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
	
	var fields = ["terminal_id","name","Access"];
	smsGetTerminalList.setParameters("fields", fields);
	
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
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms_getTerminalListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getTerminalList = e.control;
	
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getTerminalListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getTerminalList = e.control;
	
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getTerminalListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getTerminalList = e.control;
	
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
			validMsg = "사용중인 출입구역 아이디 입니다."
			comLib.alert("warning", validMsg);			
			return;
		}
	}
	
	var areaName = app.lookup("ACARM_ipbAreaName").value;
	if( areaName.length < 1 ){
		comLib.alert("warning", "출입그룹 이름을 입력하세요");	
		return;
	}
	
	var dmAccessAreaAdd = app.lookup("AccessArea");
	dmAccessAreaAdd.setValue("ID",areaCode);
	dmAccessAreaAdd.setValue("Name",areaName);
	dmAccessAreaAdd.setValue("Timezone",app.lookup("ACARM_cmbTimezone").value);	
	dmAccessAreaAdd.setValue("Floor",app.lookup("ACARM_ipbFloor").value);
	
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
	var msg = (_editMode=="new")?"출입구역 추가":"출입구역 업데이트";
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == 0){
		_editMode = "modify";		
		
		var dmAccessArea = app.lookup("AccessArea");
		var dsAccessAreaList = app.lookup("AccessAreaList");
		var row = dsAccessAreaList.findFirstRow("ID == " + dmAccessArea.getValue("ID"));
		if( row ){
			row.setValue("Name", dmAccessArea.getValue("Name"));
			row.setValue("Timezone", dmAccessArea.getValue("Timezone"));
			row.setValue("Floor", dmAccessArea.getValue("Floor"));
			
		}else{
			var addedRow = dsAccessAreaList.addRowData(dmAccessArea.getDatas());
			var treeAreaList = app.lookup("ACARM_treeAccessArea");			
			var treeItem = treeAreaList.getItemByValue(addedRow.getValue("ID"))
			treeAreaList.focusItem(treeItem);
		}		
					
		comLib.alert("success", msg+" 성공");		
	}else{ 
		comLib.alert("warning", msg+" 실패");	
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
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_addAccessAreaSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_addAccessArea = e.control;
	
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_addAccessAreaSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_addAccessArea = e.control;
	
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
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == 0){
		var udcRegistTerminalList = app.lookup("ACARM_udcRegistTerminalList");
		var dsAreaInfo = app.lookup("AccessArea");
		app.lookup("ACARM_nbeAreaID").value = dsAreaInfo.getValue("ID");
		app.lookup("ACARM_ipbAreaName").value = dsAreaInfo.getValue("Name");
		app.lookup("ACARM_ipbFloor").value = dsAreaInfo.getValue("Floor");
		app.lookup("ACARM_cmbTimezone").value = dsAreaInfo.getValue("Timezone");
		
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
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == 0){
		var areaID = app.lookup("ACARM_nbeAreaID").value;
		var dsAccessAreaList = app.lookup("AccessAreaList");
		var row = dsAccessAreaList.findFirstRow("ID == "+areaID);
		if( row ){
			dsAccessAreaList.deleteRow(row.getIndex());
		}
		comLib.alert("success", "출입구역 삭제 성공");	
	}else {
		comLib.alert("warning", "출입구역 삭제 실패");
	}
}
