/************************************************
 * PrivilegeManagement.js
 * Created at 2018. 11. 26. 오후 5:32:13.
 *
 * @author wonki
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var inputValidManager = createInputValidator(app);
var usint_version;
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();	
	sendPrivilegeListRequest();
	usint_version = dataManager.getSystemVersion();
	//20190827 정래훈 인풋에 값이 없으면 경고 표시를 주기위해 작성
	var PRMGR_nbePrivilegeID = app.lookup("PRMGR_nbePrivilegeID").value;
	if(!PRMGR_nbePrivilegeID){
		inputValidManager.validate(app.lookup("PRMGR_nbePrivilegeID"), "isNull", dataManager.getString("Str_RequiredAlert"));
	}
	var PRMGR_ipbPrivilegeName = app.lookup("PRMGR_ipbPrivilegeName").value;
	if(!PRMGR_ipbPrivilegeName){
		inputValidManager.validate(app.lookup("PRMGR_ipbPrivilegeName"), "isNull", dataManager.getString("Str_RequiredAlert"));
	}
}

function sendPrivilegeListRequest() {
	var smsPrivilegeList = app.lookup("sms_getPrivilegeList");	
	smsPrivilegeList.send();
}

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms_getPrivilegeListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var sms_getPrivilegeList = e.control;
	app.lookup("TRMGR_grpPrivList").redraw();
}


// 권한 리스트에서 권한 선택 시
function onTMMGR_grdPrivilegeListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.Grid	 */
	var tMMGR_grdPrivilegeList = e.control;
	var row = tMMGR_grdPrivilegeList.getSelectedRow();
	if(row){
		var groupInfo = app.lookup("GroupInfo");
		groupInfo.clear();
	
		var requestData = app.lookup("sms_getPrivilegeInfo");
		requestData.action = "/v1/jawoondae/privileges/" + row.getValue("PrivilegeID");
	
		requestData.send();
		inputValidManager.validate(app.lookup("PRMGR_nbePrivilegeID"), "isValid", "");
		inputValidManager.validate(app.lookup("PRMGR_ipbPrivilegeName"), "isValid", "");
	} else{		
		app.lookup("BasicInfo").reset();
		app.lookup("Monitoring").reset();
		app.lookup("Terminal").reset();
		app.lookup("User").reset();
		app.lookup("Group").reset();
		app.lookup("Guest").reset();
		app.lookup("Blacklist").reset();
		app.lookup("AccessControl").reset();
		app.lookup("Map").reset();
		app.lookup("TNA").reset();
		app.lookup("Log").reset();
		app.lookup("Meal").reset();
		app.lookup("Option").reset();
		app.lookup("AccessCard").reset();
		app.lookup("Visitor").reset();
		app.lookup("GroupInfo").reset();
		/*
		app.lookup("BasicInfo").clear();
		app.lookup("Monitoring").clear();
		app.lookup("Terminal").clear();
		app.lookup("User").clear();
		app.lookup("Group").clear();
		app.lookup("Guest").clear();
		app.lookup("Blacklist").clear();
		app.lookup("AccessControl").clear();
		app.lookup("Map").clear();
		app.lookup("TNA").clear();
		app.lookup("Log").clear();
		app.lookup("Meal").clear();
		app.lookup("Option").clear();
		app.lookup("GroupInfo").clear();
		* */		
		
		var grpPrivInfo = app.lookup("TRMGR_grpPrivInfo");
		grpPrivInfo.redraw();	
		
	}
}

function onSms_getPrivilegeInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode != COMERROR_NONE) {
		//TODO
	}
	app.lookup("TRMGR_grpPrivInfo").redraw();
	app.lookup("PRMGR_grpGroupInfo").redraw();
}

function onSms_getPrivilegeInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getPrivilegeInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

// 권한 추가 버튼 클릭
function onTMMGR_btnRegistPrivilegeClick(/* cpr.events.CMouseEvent */ e){
	
	var dmBasicInfo = app.lookup("BasicInfo");
	var privilegeID = dmBasicInfo.getValue("PrivilegeID");
	if( privilegeID < 1000 ){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_PrivilegeIDInvalid"));
		return;
	}
	
	var privilegeName = dmBasicInfo.getValue("Name");
	if( privilegeName.length < 1 ){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_PrivilegeNameInvalid"));
		return;
	}
		
	var smsRegistPrivilege = app.lookup("sms_registPrivilegeInfo");
	smsRegistPrivilege.send();
}

// 권한 추가 완료
function onSms_registPrivilegeInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	var dmResult = app.lookup("Result");	
	var result = dmResult.getValue("ResultCode");	
	if (result == COMERROR_NONE) {
		var privList = app.lookup("PrivilegeList");
		var addBasic = app.lookup("BasicInfo");
		
		privList.insertRowData(privList.getRowCount(), true, addBasic.getDatas());
		
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_PrivilegeAddSuccess"));
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_PrivilegeAddFailed"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result)));
	}
}

// 권한 추가 에러
function onSms_registPrivilegeInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// // 권한 추가 타임아웃
function onSms_registPrivilegeInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

/*
 * "저장" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTMMGR_btnUpdatePrivilegeClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var tMMGR_btnUpdatePrivilege = e.control;
	var privilegeID = app.lookup("BasicInfo").getValue("PrivilegeID");

	var smsUpdateprivilegeInfo = app.lookup("sms_updatePrivilegeInfo");
	smsUpdateprivilegeInfo.action = "/v1/jawoondae/privileges/" + privilegeID;
	smsUpdateprivilegeInfo.send();
}

// 권한 삭제 버튼 클릭
function onTMMGR_btnDeletePrivilegeClick(/* cpr.events.CMouseEvent */ e){
	var grdPrivilegeList = app.lookup("PRMGR_grdPrivilegeList");
	var privilegeRow = grdPrivilegeList.getSelectedRow();
	if( privilegeRow ){
		dialogConfirm(app, "", "선택한 항목을 삭제 하시겠습니까?", function(/*cpr.controls.Dialog*/dialog){
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue) {
					var privilegeID = app.lookup("BasicInfo").getValue("PrivilegeID");
					var smsDeletePrivilegeInfo = app.lookup("sms_deletePrivilegeInfo");
	
					smsDeletePrivilegeInfo.action = "/v1/privileges/" + privilegeID;
					smsDeletePrivilegeInfo.send();
					
				} else {
					return;
				}
			});
		});
	}else{
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedItem"));
	}
}

// 권한 삭제 완료
function onSms_deletePrivilegeInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	var resultInfo = app.lookup("Result");
	var result = resultInfo.getValue("ResultCode");

	if (result == COMERROR_NONE) {
		var grdPrivilegeList = app.lookup("PRMGR_grdPrivilegeList");
		grdPrivilegeList.deleteRow(grdPrivilegeList.getSelectedRow().getIndex());
		grdPrivilegeList.commitData();
		grdPrivilegeList.redraw();
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_PrivilegeDeleteSuccess"));
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_PrivilegeDeleteFailed"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result)));
	}
}

// 권한 삭제 에러
function onSms_deletePrivilegeInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 권한 삭제 타임아웃
function onSms_deletePrivilegeInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

/*
 * "그룹변경" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onPRMGR_btnSelectGroupClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var pRMGR_btnSelectGroup = e.control;
	var appld = "app/main/privileges/PrivilegeSelectGroup" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {width : 350, height : 500}, function(dialog){
		dialog.initValue = {"GroupID":1};
		dialog.modal = true;
		dialog.headerTitle = "그룹설정";
	}).then(function(returnValue){
		if (returnValue) {

			var groupInfo = app.lookup("GroupInfo");
			groupInfo.setValue("GroupID", returnValue["GroupID"]);
			groupInfo.setValue("Name", returnValue["Name"]);

			console.log(JSON.stringify(groupInfo.getDatas()));
		}
	});
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_updatePrivilegeInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var sms_updatePrivilegeInfo = e.control;
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode");
	
	console.log("regist privilege result = ", resultCode);
	
	if (resultCode == 0) {
		//notify("desktop-notify",{type : "success", message :"success"});
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Success"));
	} else {
		var errStr = getErrorString(resultCode);
		var errMsg = dataManager.getString("Str_PrivilegeUpdateFailed") + " " + dataManager.getString("errStr");
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
	}
}





/*
 * 체크 박스에서 value-change 이벤트 발생 시 호출.
 * CheckBox의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onCbxValueChange(/* cpr.events.CValueChangeEvent */ e){
	/**
	 * @type cpr.controls.CheckBox
	 */
	var cbx = e.control;
	var cbxGroup = cbx.getParent();
	//기존 체크되었던 것을 남기시려면 아래 소스를 지우세요
	var cbxChildren = cbxGroup.getChildren();
	var cbxArr = [];
	cbxChildren.forEach(function(/*cpr.controls.UIControl*/each){
		if(each.type == "checkbox" && each != cbx){//헤더 체크박스를 제외한 자식들
			cbxArr.push(each);
		}
	});
	if(cbx.value=="0"){
		cbxArr.forEach(function(/*cpr.controls.CheckBox*/each){
			each.value = "0";
		});
	}
	//여기까지
	cbxGroup.redraw();
}

// 도움말 클릭
function onTMMGR_helpIconClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target":DLG_HELP,
			"ID": menu_id
		}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

/*
 * 넘버 에디터에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onPRMGR_nbePrivilegeIDKeyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.NumberEditor
	 */
	var pRMGR_nbePrivilegeID = e.control;
	if(pRMGR_nbePrivilegeID.displayText != ""){
		inputValidManager.validate(app.lookup("PRMGR_nbePrivilegeID"), "isValid", "");
	}else{
		inputValidManager.validate(app.lookup("PRMGR_nbePrivilegeID"), "isNull", dataManager.getString("Str_RequiredAlert"));	
	}
}


/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onPRMGR_ipbPrivilegeNameKeyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var pRMGR_ipbPrivilegeName = e.control;
	if(pRMGR_ipbPrivilegeName.displayText != ""){
		inputValidManager.validate(app.lookup("PRMGR_ipbPrivilegeName"), "isValid", "");
	}else{
		inputValidManager.validate(app.lookup("PRMGR_ipbPrivilegeName"), "isNull", dataManager.getString("Str_RequiredAlert"));	
	}
}


