/************************************************
 * privilegeManagement.js
 * Created at 2021. 2. 5. 오후 7:07:31.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var inputValidManager = createInputValidator(app);
var prmahq_version;
var comLib;

function InitPrivilegeList() {
	var privilegeInfoListAHQ = app.lookup("PrivilegeInfoListAHQ");
	var trePrivileInfoAHQPRMAHQ = app.lookup("PRMAHQ_trePrivileInfoAHQPRMAHQ");
	var count = privilegeInfoListAHQ.getRowCount();
	for (var i = 0; i < count; i++ ) {
		var privilegeInfo = privilegeInfoListAHQ.getRow(i);
		privilegeInfo.setValue("checkFlag", false);
	}
	trePrivileInfoAHQPRMAHQ.expandAllItems();
	trePrivileInfoAHQPRMAHQ.redraw();
}
	
/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();	
	prmahq_version = dataManager.getSystemVersion();
	
//	InitPrivilegeList();
			//sendPrivilegeListAHQRequest(); 
	app.lookup("sms_getPrivilegeListJSON").send();
}

function sendPrivilegeListAHQRequest() {
	comLib.showLoadMask("","권한 그룹정보 가져오기","",0);
	app.lookup("PrivilegeGroupListAHQ").clear();// 초기화
	var smsgetPrivilegeGroupList = app.lookup("sms_getPrivilegeGroupList");
	smsgetPrivilegeGroupList.action = "/v1/armyhq/privilege/groups";// 권한그룹리스트
	smsgetPrivilegeGroupList.send();
	//smsGetUserList.setParameters("searchCategory", "");
	//smsGetUserList.setParameters("searchKeyword", "");
	// 리스트 요청
}

function onSms_getPrivilegeGroupListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		
		app.lookup("PRMAHQ_grdPrivilegeGroupList").redraw();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Fail"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_getPrivilegeGroupListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getPrivilegeGroupListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * "신규" 버튼(PRMAHQ_btnAddPrivilegeGroup)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onPRMAHQ_btnAddPrivilegeGroupClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var pRMAHQ_btnAddPrivilegeGroup = e.control;

	var privilegeGroup = app.lookup("PrivilegeGroup");
	privilegeGroup.reset();// 초기화 설정 
	privilegeGroup.setValue("PID", 0); // 무조건 0
	privilegeGroup.setValue("PName",app.lookup("PRMAHQ_ipbName").value);
	privilegeGroup.setValue("PDescription",app.lookup("PRMAHQ_ipbDescription").value); 
	var privilegeInfoList = app.lookup("PrivilegeInfoListAHQ");
	var rowCount = privilegeInfoList.getRowCount();
	var strVal = "PrivilegeIDVal"
	for (var i = 0; i< rowCount;i++) {
		var rowData = privilegeInfoList.getRow(i);
		
		//console.log(strVal + (i+1));
		var bflag = rowData.getValue("checkFlag");
		if (bflag == "true") {
			privilegeGroup.setValue(strVal + (i+1), 1); //성공 실패
		} else {
			privilegeGroup.setValue(strVal + (i+1), 0);
		}
	}
	//console.log(privilegeGroup.getDatas());
	comLib.showLoadMask("","권한 그룹정보 신규 추가.","",0);
	var smspostPrivilegeGroupInfo = app.lookup("sms_postPrivilegeGroupInfo");
	smspostPrivilegeGroupInfo.action = "/v1/armyhq/privilege/groups";// 권한그룹리스트 추가
	smspostPrivilegeGroupInfo.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postPrivilegeGroupInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {// 새로 얻어오고
		//
		app.lookup("PRMAHQ_grdPrivilegeGroupList").clearSelection();// 초기화
		app.lookup("PrivilegeGroup").reset();
		app.lookup("PRMAHQ_ipbName").value = "";
		app.lookup("PRMAHQ_ipbDescription").value = "";
		InitPrivilegeList(); 
		sendPrivilegeListAHQRequest();//
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Fail"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_postPrivilegeGroupInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_postPrivilegeGroupInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onPRMAHQ_btnDeletePrivilegeGroupClick(/* cpr.events.CMouseEvent */ e){
	var grdPrivilegeGroupList = app.lookup("PRMAHQ_grdPrivilegeGroupList");
	var selectedRowIdx = grdPrivilegeGroupList.getSelectedRowIndex();
	if (selectedRowIdx >= 0) { // 선택된것이 있다.
		var rowData = grdPrivilegeGroupList.getRow(selectedRowIdx);
		var dPID = rowData.getValue("PID");
		
		
		comLib.showLoadMask("","권한 그룹정보 삭제.","",0); 
		var smsdeletePrivilegeGroupInfo = app.lookup("sms_deletePrivilegeGroupInfo");
		smsdeletePrivilegeGroupInfo.action = "/v1/armyhq/privilege/groups/" + dPID;// 권한그룹리스트 추가
		smsdeletePrivilegeGroupInfo.send();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Fail"), "선택된 권한그룹이 없습니다.");
	}
}


/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onPRMAHQ_grdPrivilegeGroupListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var pRMAHQ_grdPrivilegeGroupList = e.control;
	InitPrivilegeList();
	//var p = app.lookup("PRMAHQ_grdPrivilegeGroupList");
	var grdPrivilegeGroupList = app.lookup("PRMAHQ_grdPrivilegeGroupList");
	var index = grdPrivilegeGroupList.getSelectedRowIndex();
	if (index >= 0) {
		var rowData = grdPrivilegeGroupList.getRow(index);
		app.lookup("PRMAHQ_ipbName").value =rowData.getValue("PName");
		app.lookup("PRMAHQ_ipbDescription").value =rowData.getValue("PDescription");
		var privilegeInfoList = app.lookup("PrivilegeInfoListAHQ");
		var rowCount = privilegeInfoList.getRowCount();
		var strID = "PrivilegeIDVal";
		for (var i = 0; i <rowCount;i++) {
			var tmpID = strID + (i+1);
			var rBool = rowData.getValue(tmpID);
			if (rBool == 1) { //true
				// console.log(tmpID);
				privilegeInfoList.setValue(i, "checkFlag", true);
			} else {
				privilegeInfoList.setValue(i, "checkFlag", false);
			}
		}
	}
	app.lookup("PRMAHQ_trePrivileInfoAHQPRMAHQ").redraw();
}

function onPRMAHQ_btnSavePrivilegeGroupClick(/* cpr.events.CMouseEvent */ e){
	var grdPrivilegeGroupList = app.lookup("PRMAHQ_grdPrivilegeGroupList");
	var selectedRowIdx = grdPrivilegeGroupList.getSelectedRowIndex();
	if (selectedRowIdx >= 0) { // 선택된것이 있다.
		var rowData = grdPrivilegeGroupList.getRow(selectedRowIdx);
		var mPID = rowData.getValue("PID");
		var dmPrivilegeGroup = app.lookup("PrivilegeGroup");
		
		dmPrivilegeGroup.reset();
		dmPrivilegeGroup.setValue("PID", mPID);
		dmPrivilegeGroup.setValue("PName", app.lookup("PRMAHQ_ipbName").value);
		dmPrivilegeGroup.setValue("PDescription", app.lookup("PRMAHQ_ipbDescription").value);
	
		var privilegeInfoListAHQ =  app.lookup("PrivilegeInfoListAHQ");
		var rowCount = privilegeInfoListAHQ.getRowCount();
		var strVal = "PrivilegeIDVal"
		for (var i =0 ; i < rowCount ;i++) {
			var rowData = privilegeInfoListAHQ.getRow(i);
			var bflag = rowData.getValue("checkFlag");
			if (bflag == "true") {
				dmPrivilegeGroup.setValue(strVal + (i+1), 1); //성공 실패
			} else {
				dmPrivilegeGroup.setValue(strVal + (i+1), 0);
			}
		}
		
		comLib.showLoadMask("","권한 그룹정보 저장.","",0); 
		var smspostPrivilegeGroupInfo = app.lookup("sms_putPrivilegeGroupInfo");
		smspostPrivilegeGroupInfo.action = "/v1/armyhq/privilege/groups/" + mPID;// 권한그룹리스트 추가
		smspostPrivilegeGroupInfo.send();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Fail"), "선택된 권한그룹이 없습니다.");
	}
}

function onSms_putPrivilegeGroupInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		app.lookup("PRMAHQ_grdPrivilegeGroupList").clearSelection();// 초기화
		app.lookup("PrivilegeGroup").reset();
		app.lookup("PRMAHQ_ipbName").value = "";
		app.lookup("PRMAHQ_ipbDescription").value = "";
		InitPrivilegeList(); 
		sendPrivilegeListAHQRequest();//
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Fail"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_putPrivilegeGroupInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_putPrivilegeGroupInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_deletePrivilegeGroupInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		app.lookup("PRMAHQ_grdPrivilegeGroupList").clearSelection();// 초기화
		app.lookup("PrivilegeGroup").reset();
		app.lookup("PRMAHQ_ipbName").value = "";
		app.lookup("PRMAHQ_ipbDescription").value = "";
		InitPrivilegeList(); 
		sendPrivilegeListAHQRequest(); 
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Fail"), dataManager.getString(getErrorString(resultCode)));
	}
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_deletePrivilegeGroupInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_deletePrivilegeGroupInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onSms_getPrivilegeListJSONSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var privilegeInfoListAHQ = app.lookup("PrivilegeInfoListAHQ");
	if (privilegeInfoListAHQ) {
		InitPrivilegeList();
		console.log(privilegeInfoListAHQ.getRowDataRanged());
		var trePrivileInfoAHQPRMAHQ = app.lookup("PRMAHQ_trePrivileInfoAHQPRMAHQ");
		
		trePrivileInfoAHQPRMAHQ.expandAllItems();
		trePrivileInfoAHQPRMAHQ.redraw();
		sendPrivilegeListAHQRequest(); 
	}
}

function onSms_getPrivilegeListJSONSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getPrivilegeListJSONSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * 트리에서 focus 이벤트 발생 시 호출.
 * 컨트롤이 포커스를 획득한 후 발생하는 이벤트.
 */
function onPRMAHQ_trePrivileInfoAHQPRMAHQFocus(/* cpr.events.CFocusEvent */ e){
	/** 
	 * @type cpr.controls.Tree
	 */
	var pRMAHQ_trePrivileInfoAHQPRMAHQ = e.control;
	
}
