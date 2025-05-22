/************************************************
 * bhAccessGroupDept.js
 * Created at 2021. 4. 26. 오후 4:10:28.
 *
 * @author joymrk
 ************************************************/
var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var bhagm_version;
var bhagm_userspageRowCount = 500;
var bhagm_terminalspageRowCount = 100;

//indexerType : 1==UserList 2==terminal
function setPageIndexer(indexerType,totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex;
	if (indexerType == 1) {
		pageIndex = app.lookup("usersPageIndexer");	
	} else {
		pageIndex = app.lookup("terminalsPageIndexer");
	}
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}

function selectPaging(indexerType, totalCount, viewPageCount) {
	var pageIndex;
	var pageRowCnt=0;
	if (indexerType == 1) {
		pageIndex = app.lookup("usersPageIndexer");
		pageRowCnt = bhagm_userspageRowCount;
	} else {
		pageIndex = app.lookup("terminalsPageIndexer");
		pageRowCnt = bhagm_terminalspageRowCount;
	}
	
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = pageRowCnt;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}

function onSms_getBhSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getBhSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	bhagm_version = dataManager.getSystemVersion();
	setPageIndexer(1, 0,1,bhagm_userspageRowCount,5);
	setPageIndexer(2, 0,1,bhagm_terminalspageRowCount,5);
	
	// 그룹 정보 가져오기
	var groupList = dataManager.getGroup();
	var cmbMapCode = app.lookup("BHAGM_lcbMapCode");
	
	// 매핑 코드가 없는 그룹 제거
	for ( var i = 0; i < groupList.getRowCount(); i++ ) {
		var groupCode = groupList.getValue(i, "GroupCode");
//		console.log("groupCode : "+ groupCode);
		if ( groupCode.toString().length == 0 || groupCode == "" ) {
			groupList.deleteRow(i);
		}
	}
	groupList.commit();
	cmbMapCode.setItemSet(groupList, {
			label: "Name",
			value: "GroupCode"
	});
	cmbMapCode.redraw();

	// 출입그룹 요청
	comLib.showLoadMask("","출입그룹 리스트 가져오기","",0);
	var sendData = app.lookup("sms_getBhAccessGroupList");
	sendData.action = "/v1/bluehouse/accessgroupMap";
	sendData.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getBhAccessGroupListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getBhAccessGroupList = e.control;
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
	} else {
		// 실패 
		console.log("fail");
		
	}
}


/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onBHAGM_grdAccessGroupListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var bHAGM_grdAccessGroupList = e.control;
	getUserList();
}

function getUserList() {
	var selected = app.lookup("BHAGM_grdAccessGroupList");
	var rowdata = selected.getSelectedRow();
	if (rowdata) {
		rowdata.getValue("Deptid");
		rowdata.getValue("SyncUseFlag");
		app.lookup("BHAGM_ipbAGID").value = rowdata.getValue("ID"); 	
		app.lookup("BHAGM_ipbName").value = rowdata.getValue("Name");
//		app.lookup("BHAGM_ipbMapCode").value = rowdata.getValue("Deptid");

		// 콤보 박스 부서이름 설정 value = 매핑코드 - zzik 
		app.lookup("BHAGM_lcbMapCode").selectItemByValue(rowdata.getValue("Deptid"));

		var syncFlag = parseInt(rowdata.getValue("SyncUseFlag"), 10);
		if (syncFlag == 1) {app.lookup("BHAGM_cbxLocalUse").checked = true; }
		else {	app.lookup("BHAGM_cbxLocalUse").checked = false;}	
 
		app.lookup("UserList").clear(); //초기화
		comLib.showLoadMask("","사용자 가져오기","",0);
		var curPageIndex = app.lookup("usersPageIndexer").currentPageIndex; 
		var offset = (curPageIndex - 1) * bhagm_userspageRowCount;
				
		var smsUserList = app.lookup("sms_getUserList");
		smsUserList.setParameters("searchCategory", "accessgroupcode");
		smsUserList.setParameters("searchKeyword", rowdata.getValue("ID"));
		smsUserList.setParameters("offset", offset);
		smsUserList.setParameters("limit", bhagm_userspageRowCount);
		// 필드 추가
		var fields = ["user_id","name","unique_id"];
		smsUserList.setParameters("fields", fields);
		smsUserList.send();
	}
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getUserListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getBhAccessGroupInfo = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		var dmTotal = app.lookup("Total").getValue("Count");
		
		var totalCount = parseInt(dmTotal);
//		console.log("tcnt u :" ,totalCount);
		var viewPageCount = totalCount / bhagm_userspageRowCount + (totalCount % bhagm_userspageRowCount > 0);
		selectPaging(1, totalCount, viewPageCount);
		app.lookup("BHAGM_ipbUserCnt").value = totalCount;
		//단말기 가져오기
		sendTerminalList();
	} else {
		dialogAlert(app, "Waning", "출입그룹 사용자 리스트"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
}

function sendTerminalList() {
	var selected = app.lookup("BHAGM_grdAccessGroupList");
	var rowdata = selected.getSelectedRow();
	if (rowdata) {
		app.lookup("TerminalsInfo").clear(); //초기화
		
		comLib.showLoadMask("","단말기 가져오기","",0);
		var smsGetTerminalList = app.lookup("sms_getTerminalList");
				
		var curPageIndex = app.lookup("terminalsPageIndexer").currentPageIndex; 
		var offset = (curPageIndex - 1) * bhagm_terminalspageRowCount;
				
		smsGetTerminalList.setParameters("limit", bhagm_terminalspageRowCount);
		smsGetTerminalList.setParameters("offset", offset);	
		smsGetTerminalList.action = "/v1/accessGroups/"+rowdata.getValue("ID")+"/terminals";
		smsGetTerminalList.send();	
	}
	
}

function onSms_getTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getTerminalList = e.control;
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		var dmTotal = app.lookup("TerminalsTotal").getValue("Count");
		var totalCount = parseInt(dmTotal);
		
//		console.log("tcnt u :" ,totalCount);
		var viewPageCount = totalCount / bhagm_terminalspageRowCount + (totalCount % bhagm_terminalspageRowCount > 0);
		selectPaging(2, totalCount, viewPageCount);
		app.lookup("BHAGM_ipbTerminalCnt").value = totalCount;
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	app.lookup("BHAGM_grpMain").redraw();
}

function onUsersPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var usersPageIndexer = e.control;
	getUserList();
}

function onTerminalsPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var terminalsPageIndexer = e.control;
	sendTerminalList();
}

function onBHAGM_btnModifyClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var bHAGM_btnModify = e.control;
	var selected = app.lookup("BHAGM_grdAccessGroupList");
	var rowdata = selected.getSelectedRow();
	if (rowdata) {
//		var mappingCode = app.lookup("BHAGM_ipbMapCode").value; 
//		console.log(mappingCode);

		var mappingCode = app.lookup("BHAGM_lcbMapCode").value;
		// console.log(mappingCode);
		
//		if ( mappingCode == "0" ) {
//			dialogAlert(app, dataManager.getString("Str_Warning"), "부서 이름을 선택해 주세요.");
//			return;
//		}
		
		var mappingInfo = app.lookup("AccessGroupMapping");
		mappingInfo.clear();
		
		mappingInfo.setValue("DeptID", mappingCode);
		var syncFlag = app.lookup("BHAGM_cbxLocalUse").value;
//		console.log(syncFlag);
		if (syncFlag == "true") {
			mappingInfo.setValue("SyncFlag", 1);	
		} else {
			mappingInfo.setValue("SyncFlag", 0);
//			console.log("false flag");
		}
		
		var sendData = app.lookup("sms_putBhAccessGroupMappingInfo");
		comLib.showLoadMask("","출입그룹-부서맵핑 정보 업데이트","",0);
		sendData.action = "/v1/bluehouse/accessgroupMap/" + rowdata.getValue("ID");
		sendData.send();
			
	} 
	
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_putBhAccessGroupMappingInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_putBhAccessGroupMappingInfo = e.control;
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
//		var grdAccessGroupList = app.lookup("BHAGM_grdAccessGroupList");
//		var selectedRow = grdAccessGroupList.getSelectedRow();
//		if (selectedRow) {
//			var MappingInfo = app.lookup("AccessGroupMapping");
//			selectedRow.setValue("Deptid", MappingInfo.getValue("DeptID"));
//			selectedRow.setValue("SyncUseFlag", MappingInfo.getValue("SyncFlag"));
//			grdAccessGroupList.setRowState(selectedRow.getIndex(), cpr.data.tabledata.RowState.UNCHANGED);
//			grdAccessGroupList.commitData();
//			grdAccessGroupList.redraw();
//		}
		setPageIndexer(1, 0,1,bhagm_userspageRowCount,5);
		setPageIndexer(2, 0,1,bhagm_terminalspageRowCount,5); 
		// 출입그룹 요청
		comLib.showLoadMask("","출입그룹 리스트 가져오기","",0);
		var sendData = app.lookup("sms_getBhAccessGroupList");
		sendData.action = "/v1/bluehouse/accessgroupMap";
		sendData.send();
		
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	app.lookup("BHAGM_grpMain").redraw();
}
