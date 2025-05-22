/************************************************
 * emergencyGroupManagement.js
 * Created at 2020. 12. 23. 오전 8:57:43.
 *
 * @author joymrk
 ************************************************/
var comLib;
var _enableTerminal = true;
var dataManager = cpr.core.Module.require("lib/DataManager");
var inputValidManager = createInputValidator(app);
var userCntPerRequest = 2000;
var totalCount = 0;
var kwlem_version;
var kwlem_mode = 0; // 0:new, 1:edit
var kwlem_pageRowCount = 200;

function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("terminalListPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}
function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("terminalListPageIndexer");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = kwlem_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}
/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();	
	comLib = createComUtil(app);
	kwlem_version = dataManager.getSystemVersion();
	sendEmergencyGroupListRequest();
	
	//20190827 정래훈 인풋에 값이 없으면 경고 표시를 주기위해 작성
	var nbeGroupID = app.lookup("KWLEM_nbeGroupID").value;
	if(!nbeGroupID){
		inputValidManager.validate(app.lookup("KWLEM_nbeGroupID"), "isNull", dataManager.getString("Str_RequiredAlert"));
	}
	var ipbName = app.lookup("KWLEM_ipbName").value;
	if(!ipbName){
		inputValidManager.validate(app.lookup("KWLEM_ipbName"), "isNull", dataManager.getString("Str_RequiredAlert"));
	}
	var groupList = dataManager.getGroup();
	var dsGroupList = app.lookup("GroupList");
	groupList.copyToDataSet(dsGroupList);
	
	changeMode(0); // 신규 권한 입력 모드로 설정
}

function sendEmergencyGroupListRequest() {
	app.lookup("sms_getEmergencyGroupList").send();
}

function changeMode(mode){
	kwlem_mode = mode
	if(kwlem_mode==0 ){ // 신규 입력
		//단말기 리스트 		
		
		app.lookup("KWLEM_nbeGroupID").enabled = true;
		app.lookup("KWLEM_ipbName").enabled = true;
		app.lookup("KWLEM_btnUpdate").enabled = false;		
		app.lookup("KWLEM_btnDelete").enabled = false;
		
		var grdMain = app.lookup("KWLEM_grdMain");		
		grdMain.redraw();
		
	}else{ // 수정 모드
		// 아이디 수정 불가
		app.lookup("KWLEM_nbeGroupID").enabled = false;
		app.lookup("KWLEM_btnRegist").enabled = true;
		app.lookup("KWLEM_btnUpdate").enabled = true;
		app.lookup("KWLEM_btnDelete").enabled = true;
	}
}

function onSms_getEmergencyGroupListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
		app.lookup("KWLEM_grdEmerGroupList").redraw();
	} else {
		//comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorBrandTypeLoadingFailed"));
	}
}

function onSms_getEmergencyGroupListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_getEmergencyGroupListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

function onKWLEM_grdEmerGroupListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var kWLEM_grdEmerGroupList = e.control;
	var row = kWLEM_grdEmerGroupList.getSelectedRow();
	if(row){
		changeMode(1); // 수정 모드 설정
		
		sendEmerGroupList();
		inputValidManager.validate(app.lookup("KWLEM_nbeGroupID"), "isValid", "");
		inputValidManager.validate(app.lookup("KWLEM_ipbName"), "isValid", "");
	} else {
		changeMode(0); // 수정 모드 설정
	}
}

function sendEmerGroupList() {
	app.lookup("EmergencyTerminalList").clear();
	var row = app.lookup("KWLEM_grdEmerGroupList").getSelectedRow();
	if (row) {
		var emergencyGroupInfo = app.lookup("EmergencyGroupInfo");
		emergencyGroupInfo.clear();
		emergencyGroupInfo.build(row.getRowData());
		console.log(emergencyGroupInfo.getDatas());
		
		var requestData = app.lookup("sms_getEmergencyGroupInfo");
		requestData.action = "/v1/kangwonland/emergencyGroup/" + row.getValue("GroupID");
		var curIndex = app.lookup("terminalListPageIndexer").currentPageIndex;
		var offset = (curIndex - 1) * kwlem_pageRowCount;
		requestData.setParameters("offset", offset);
		requestData.setParameters("limit", kwlem_pageRowCount);
		requestData.send();
		comLib.showLoadMask("", dataManager.getString("Str_ListLoading"), "");	
	}
}

/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onTerminalListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var terminalListPageIndexer = e.control;
	sendEmerGroupList();
}

function onSms_getEmergencyGroupInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode =	app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		app.lookup("userListGroup_opbTerminalTotal").value = totalCount;
		var viewPageCount = totalCount / kwlem_pageRowCount + (totalCount % kwlem_pageRowCount > 0);
		if (viewPageCount > 10) {
			viewPageCount = 10;
		}
		selectPaging(totalCount, viewPageCount);
		comLib.hideLoadMask();	
		
		app.lookup("EmergencyTerminalList").setSort("TerminalID");
	} else {
		comLib.hideLoadMask();
		dialogAlert(app, "Waning", "비상상황 단말기"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
}
	
function onSms_getEmergencyGroupInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_getEmergencyGroupInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

/*
 * 버튼(KWLEM_btnRegist)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onKWLEM_btnRegistClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var kWLEM_btnRegist = e.control;
	if (kwlem_mode == 0) {
		// 빈 값 확인 아이디 확인 이름 타입 지정 확인 
		// 리스트 있는지 확인
		var dmEmergencyGroupInfo = app.lookup("EmergencyGroupInfo");
		var groupID = dmEmergencyGroupInfo.getValue("GroupID");
		if (groupID <= 0) {
			dialogAlert(app, dataManager.getString("Str_Warning"), "아이디 값이 잘못 되었습니다.");
			return;
		}
		var name = dmEmergencyGroupInfo.getValue("Name");
		if( name.toString().length < 1 ){
			dialogAlert(app, dataManager.getString("Str_Warning"), "명칭을 입력해 주세요");
			return;
		}
		
		var IsExist = app.lookup("EmergencyGroupList").findFirstRow("GroupID ==  " + groupID);
		if (IsExist) {
			dialogAlert(app, dataManager.getString("Str_Warning"), "이미 등록된 비상그룹 아이디 입니다.");
			return;
		}
		
		var smsRegistPrivilege = app.lookup("sms_postEmergencyGroupInfo");
		smsRegistPrivilege.send();
	} else {
		changeMode(0);	
	}
}

function onSms_postEmergencyGroupInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if (resultCode == COMERROR_NONE) {
		changeMode(1);
		var emergencyGroupList = app.lookup("EmergencyGroupList");
		var emergencyGroupInfo = app.lookup("EmergencyGroupInfo");
		
		var newRow = emergencyGroupList.insertRowData(emergencyGroupList.getRowCount(), true, emergencyGroupInfo.getDatas());				
		emergencyGroupList.commit();
		
		var grdEmerGroupList = app.lookup("KWLEM_grdEmerGroupList");
		grdEmerGroupList.select({rowIndex:newRow.getIndex()});
		
		dialogAlert(app, dataManager.getString("Str_Success"), "비상상황 그룹 추가");
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_PrivilegeAddFailed"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_postEmergencyGroupInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_postEmergencyGroupInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}


/*
 * 버튼(KWLEM_btnUpdate)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onKWLEM_btnUpdateClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var kWLEM_btnUpdate = e.control;
	if( kwlem_mode == 0 ){
		var dmEmergencyGroupInfo = app.lookup("EmergencyGroupInfo");
		var groupID = dmEmergencyGroupInfo.getValue("GroupID");
		if (groupID <= 0) {
			dialogAlert(app, dataManager.getString("Str_Warning"), "아이디 값이 잘못 되었습니다.");
			return;
		}
		var name = dmEmergencyGroupInfo.getValue("Name");
		if( name.toString().length < 1 ){
			dialogAlert(app, dataManager.getString("Str_Warning"), "명칭을 입력해 주세요");
			return;
		}
		
		var IsExist = app.lookup("EmergencyGroupList").findFirstRow("GroupID ==  " + groupID);
		if (IsExist) {
			dialogAlert(app, dataManager.getString("Str_Warning"), "이미 등록된 비상그룹 아이디 입니다.");
			return;
		}
		
				
		var smsRegistPrivilege = app.lookup("sms_postEmergencyGroupInfo");
		smsRegistPrivilege.send();
	
	}else{
		var dmEmergencyGroupInfo = app.lookup("EmergencyGroupInfo");
		var groupID = dmEmergencyGroupInfo.getValue("GroupID");
		var smsPutEmergencyGroupInfo = app.lookup("sms_putEmergencyGroupInfo");
		smsPutEmergencyGroupInfo.action = "/v1/kangwonland/emergencyGroup/" + groupID;
		smsPutEmergencyGroupInfo.send();
	}
}

function onSms_putEmergencyGroupInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_putEmergencyGroupInfo = e.control;

	var resultCode = app.lookup("Result").getValue("ResultCode");
	//console.log("regist privilege result = ", result);
	
	if (resultCode == COMERROR_NONE) {
		dialogAlert(app, dataManager.getString("Str_Success"), "수정완료 되었습니다.");
	} else {
		var errStr = getErrorString(resultCode);
		var errMsg = "비상그룹 수정 실패 하였습니다." + " " + dataManager.getString("errStr");
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
	}
}

function onSms_putEmergencyGroupInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_putEmergencyGroupInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
	
}
	

/*
 * 버튼(userListGroup_btnTerminalAdd)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUserListGroup_btnTerminalAddClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var userListGroup_btnTerminalAdd = e.control;
	var dsGroupList = app.lookup("GroupList");
	var memTerminalList = dataManager.getTerminalList();
	app.getRootAppInstance().openDialog("app/main/terminals/TerminalSelect", {width : 1000, height : 500}, function(dialog){
		dialog.initValue = {"GroupList":dsGroupList,"ExcludeGroup":-1};
		dialog.modal = true;
	}).then(function(idMap){

		idMap.forEach(function(value,key){
			var emergencyTerminalList = app.lookup("EmergencyTerminalList");
			
			var IsExist = emergencyTerminalList.findFirstRow("TerminalID ==  " + key);
			if (!IsExist) {	
				var searchData = memTerminalList.findFirstRow("ID == "+key);
				
				if (searchData) {
					var name = searchData.getValue("Name");
					var newRow = emergencyTerminalList.insertRowData(emergencyTerminalList.getRowCount(), true, 
						{"TerminalID": key, "Name": name, "MasterDevice": 0});		
				}
			}
		});

		
	});
}

function onUserListGroup_btnTerminalRemoveClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var userListGroup_btnTerminalRemove = e.control;
	var terminalList = app.lookup("KWLEM_grdTerminalList");
	var indices = terminalList.getCheckRowIndices();			  
	if( indices.length == 0){
		return;
	}	
	
	for (var i= 0; i < terminalList.getRowCount(); i++) {
		if (terminalList.isCheckedRow(i) == true) {
			terminalList.deleteRow(i);
			i = 0;
		}
	}
	terminalList.commitData();
	console.log(app.lookup("EmergencyTerminalList").getRowDataRanged());
}


/*
 * "마스터 장비" 버튼(KWLEM_btnMasterDevice)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onKWLEM_btnMasterDeviceClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var kWLEM_btnMasterDevice = e.control;
	var terminalList = app.lookup("KWLEM_grdTerminalList");
	var indices = terminalList.getCheckRowIndices();			  
	if( indices.length == 0){
		return;
	}	
	indices.forEach(function( index ){
		var terminalRow = terminalList.getRow(index);
		if (terminalRow.getValue("MasterDevice") == 0) {
			terminalList.updateRow(index, {"MasterDevice":1});
		} else {
			terminalList.updateRow(index, {"MasterDevice":0});
		}		
	});
}

function onKWLEM_btnDeleteClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var kWLEM_btnDelete = e.control;
	var dmEmergencyGroupInfo = app.lookup("EmergencyGroupInfo");
	var groupID = dmEmergencyGroupInfo.getValue("GroupID");
	var smsDeleteEmergencyGroupInfo = app.lookup("sms_deleteEmergencyGroupInfo");
	smsDeleteEmergencyGroupInfo.action = "/v1/kangwonland/emergencyGroup/" + groupID;
	smsDeleteEmergencyGroupInfo.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_deleteEmergencyGroupInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_putEmergencyGroupInfo = e.control;

	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		app.lookup("EmergencyTerminalList").clear();
		app.lookup("EmergencyGroupInfo").clear();
		app.lookup("Total").clear();
		
		app.lookup("EmergencyGroupList").clear();
		sendEmergencyGroupListRequest();
		
	} else {
		var errStr = getErrorString(resultCode);
		var errMsg = "비상상황그룹 삭제 실패 하였습니다." + " " + dataManager.getString("errStr");
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
	}
}

function onSms_deleteEmergencyGroupInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_deleteEmergencyGroupInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}


/*
 * "초기화" 버튼(KWLEM_btnInit)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onKWLEM_btnInitClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var kWLEM_btnInit = e.control;
	app.lookup("EmergencyTerminalList").clear();
	app.lookup("EmergencyGroupInfo").clear();
	app.lookup("KWLEM_grdEmerGroupList").clearSelection();
	changeMode(0);	
	app.lookup("Total").clear();
}
