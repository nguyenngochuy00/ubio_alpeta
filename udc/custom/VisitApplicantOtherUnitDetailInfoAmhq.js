/************************************************
 * VisitApplicantOtherUnitArmyHQ.js
 * Created at 2021. 1. 15. 오후 2:07:00.
 *
 * @author blue1
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var util = cpr.core.Module.require("lib/util")

exports.getText = function(){return "";};

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	var today = dateLib.getToday("-");

/*	var cmbUserGroup = app.lookup("VAOAMHQ_cmbPosition");
	changePostion(cmbUserGroup, app.lookup("AMAAP_rdbDutyType").value);
	cmbUserGroup.addItem(new cpr.controls.Item("------", 0));
	if (cmbUserGroup.value == null || cmbUserGroup.value == 0) {
		cmbUserGroup.selectItemByValue(0);
	} else {
		cmbUserGroup.selectItemByValue(cmbUserGroup.value);	
	}
	*/

	
}

exports.initAllControl = function(setDay){
	dataManager = getDataManager();
	var today = dateLib.getToday("-");
	
	app.lookup("VAOAMHQ_ipbName").value = "";
	app.lookup("VAOAMHQ_dtiBirthday").value = "";
	app.lookup("VAOAMHQ_ipbMobile").value = "";
	app.lookup("VAOAMHQ_ipbVisitPurpose").value = "";
	app.lookup("VAOAMHQ_ipbClasses").value = "";
	
	if (setDay == null ) {
		app.lookup("VAOAMHQ_dtiAccessStart").value = today;
		app.lookup("VAOAMHQ_dtiAccessEnd").value = today;		
	} else {
		app.lookup("VAOAMHQ_dtiAccessStart").value = setDay;
		app.lookup("VAOAMHQ_dtiAccessEnd").value = setDay;	
	}
		
	app.lookup("VAOAMHQ_ipbCarNumber").value = "";
	app.lookup("VAOAMHQ_ipbCarType").value = "";
	app.lookup("VAOAMHQ_rdbCarBlackbox").value = 1;
	app.lookup("VAOAMHQ_ipbCarColor").value = "";
	
	app.lookup("VAOAMHQ_opbUserName").value = "";
	app.lookup("VAOAMHQ_cmbTargetUserPosition").selectItemByValue(0);
	app.lookup("VAOAMHQ_cmbTargetUserGroup").selectItemByValue(0);
	
	app.lookup("VAOAMHQ_ipbServiceNumber").value = "";
	app.lookup("VAOAMHQ_cmbPosition").selectItemByValue(0);
	app.lookup("VAOAMHQ_ipbAddress").value = "";
	
	var cmbUserTargetUserPosition = app.lookup("VAOAMHQ_cmbTargetUserPosition");	
	cmbUserTargetUserPosition.setItemSet(dataManager.getPositionList(), {
		label: "Name",
		value: "PositionID"		
	});	
	cmbUserTargetUserPosition.addItem(new cpr.controls.Item("------", 0));
	if (cmbUserTargetUserPosition.value == null || cmbUserTargetUserPosition.value == 0) {
		cmbUserTargetUserPosition.selectItemByValue(0);
	} else {
		cmbUserTargetUserPosition.selectItemByValue(cmbUserTargetUserPosition.value);	
	}	
		
	var cmbTargetUserGroup = app.lookup("VAOAMHQ_cmbTargetUserGroup");	
	cmbTargetUserGroup.setItemSet(dataManager.getGroup(), {
		label: "Name",
		value: "GroupID"		
	});
	cmbTargetUserGroup.addItem(new cpr.controls.Item("------", 0));
	if (cmbTargetUserGroup.value == null || cmbTargetUserGroup.value == 0) {
		cmbTargetUserGroup.selectItemByValue(0);
	} else {
		cmbTargetUserGroup.selectItemByValue(cmbTargetUserGroup.value);	
	}
}


// 데이터 맵 값 입력 
exports.getApplicationInfoDataMap = function(dataMap){
	dataMap.setValue("Name", app.lookup("VAOAMHQ_ipbName").value);
	dataMap.setValue("Birthday", app.lookup("VAOAMHQ_dtiBirthday").value);
	dataMap.setValue("Mobile", app.lookup("VAOAMHQ_ipbMobile").value);
	dataMap.setValue("VisitPurpose", app.lookup("VAOAMHQ_ipbVisitPurpose").value);
	dataMap.setValue("UserClass", getControlValue("VAOAMHQ_ipbClasses"));

	dataMap.setValue("AccessStart", app.lookup("VAOAMHQ_dtiAccessStart").value);
	dataMap.setValue("AccessEnd", app.lookup("VAOAMHQ_dtiAccessEnd").value);
	dataMap.setValue("CarNumber", getControlValue("VAOAMHQ_ipbCarNumber"));
	dataMap.setValue("CarType", getControlValue("VAOAMHQ_ipbCarType"));
	dataMap.setValue("CarBlackbox", getControlValue("VAOAMHQ_rdbCarBlackbox"));
	dataMap.setValue("CarColor", getControlValue("VAOAMHQ_ipbCarColor"));
	
	// 부서별 기능 추가로 방문객은 group_code에 방문대상자 부서코드 넣기 - pse
	dataMap.setValue("GroupCode", app.lookup("VAOAMHQ_cmbTargetUserGroup").getSelection()[0].value);
	
	dataMap.setValue("VisitTargetUserID", app.lookup("VAOAMHQ_opbUserID").value);
	dataMap.setValue("VisitTargetName", app.lookup("VAOAMHQ_opbUserName").value);
	dataMap.setValue("VisitTargetDepartment", app.lookup("VAOAMHQ_cmbTargetUserPosition").value);
	
	dataMap.setValue("VisitTargetPosition", app.lookup("VAOAMHQ_cmbTargetUserPosition").getSelection()[0].label);
	dataMap.setValue("VisitTargetGroup", app.lookup("VAOAMHQ_cmbTargetUserGroup").getSelection()[0].label);
	
	dataMap.setValue("UserType", UserPrivArmyOtherUnit);
	dataMap.setValue("ServiceNumber", app.lookup("VAOAMHQ_ipbServiceNumber").value);
	dataMap.setValue("Position", app.lookup("VAOAMHQ_cmbPosition").value);
	dataMap.setValue("Address", app.lookup("VAOAMHQ_ipbAddress").value);
}

// 데이터 값 세팅
exports.setApplicationInfoDataMap = function(dataMap){
	app.lookup("VAOAMHQ_ipbName").value = dataMap.getValue("Name");
	app.lookup("VAOAMHQ_dtiBirthday").value = dataMap.getValue("Birthday");
	app.lookup("VAOAMHQ_ipbMobile").value = dataMap.getValue("Mobile");
	app.lookup("VAOAMHQ_ipbVisitPurpose").value = dataMap.getValue("VisitPurpose");
	app.lookup("VAOAMHQ_ipbClasses").value = dataMap.getValue("UserClass");
	
	app.lookup("VAOAMHQ_dtiAccessStart").value = dataMap.getValue("AccessStart");
	app.lookup("VAOAMHQ_dtiAccessEnd").value = dataMap.getValue("AccessEnd");
	app.lookup("VAOAMHQ_ipbCarNumber").value = dataMap.getValue("CarNumber");
	app.lookup("VAOAMHQ_ipbCarType").value = dataMap.getValue("CarType");
	app.lookup("VAOAMHQ_rdbCarBlackbox").value = dataMap.getValue("CarBlackbox");
	app.lookup("VAOAMHQ_ipbCarColor").value = dataMap.getValue("CarColor");
	
	// app.lookup("UnitMember").value // 확인 필요
	dataManager = getDataManager();
	console.log(dataManager.getUserInfo());
	console.log(dataManager.getAccountInfo());
	
	// app.lookup("UserType").value // 확인 필요
	app.lookup("VAOAMHQ_ipbServiceNumber").value = dataMap.getValue("ServiceNumber");
	app.lookup("VAOAMHQ_ipbAddress").value = dataMap.getValue("Address");
	
	var nPositionID = parseInt(dataMap.getValue("Position"));
	if (nPositionID > 1000 && nPositionID < 1100) {
		app.lookup("AMAAP_rdbDutyType").value = 900;
	} else if (nPositionID > 1100 && nPositionID < 1200) {
		app.lookup("AMAAP_rdbDutyType").value = 907;
	} else if (nPositionID > 1200 && nPositionID < 1300) {
		app.lookup("AMAAP_rdbDutyType").value = 905;
	}
	console.log("2");
	var cmbUserGroup = app.lookup("VAOAMHQ_cmbPosition");
	changePostion(cmbUserGroup, app.lookup("AMAAP_rdbDutyType").value);

	app.lookup("VAOAMHQ_cmbPosition").value = parseInt(dataMap.getValue("Position"));
	app.lookup("VAOAMHQ_cmbPosition").selectItemByValue(app.lookup("VAOAMHQ_cmbPosition").value);
	
	app.lookup("VAOAMHQ_opbUserID").value = dataMap.getValue("VisitTargetUserID");
	app.lookup("VAOAMHQ_opbUserName").value = dataMap.getValue("VisitTargetName");
	app.lookup("VAOAMHQ_cmbTargetUserPosition").selectItemByLabel(dataMap.getValue("VisitTargetPosition"));
	console.log(dataMap.getValue("VisitTargetGroup"));
	app.lookup("VAOAMHQ_cmbTargetUserGroup").selectItemByLabel(dataMap.getValue("VisitTargetGroup"));
}

// vaidatdCheck
exports.validateData = function(){
	console.log("validateData");
	if (!checkNullControl("VAOAMHQ_ipbName", "Str_ARMY_UserNameInvalid")){ return false; }
	if (!checkNullControl("VAOAMHQ_dtiBirthday", "Str_ARMY_BirthdayInvalid")){ return false; }
	if (!checkNullControl("VAOAMHQ_ipbMobile", "Str_ARMY_UserMobileInvalid")){ return false; }
	if (!checkNullControl("VAOAMHQ_ipbVisitPurpose", "Str_ARMY_PurposeVisitInvalid")){ return false; }
	
	// 방문 시작 종료일 검사
	var today = dateLib.getToday();
	var startAt =app.lookup("VAOAMHQ_dtiAccessStart").value;
	startAt = startAt.replace(/-/gi,"");
	var endAt = app.lookup("VAOAMHQ_dtiAccessEnd").value;
	endAt = endAt.replace(/-/gi,"");
	
	if(dateLib.compareDate( today, startAt ) == 0){	
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_WarnAccessStartBeforeToday"), function(/*cpr.controls.Dialog*/dialog){
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VAOAMHQ_dtiAccessStart").focus(true);			
			});
		});		
		return false;
	}
	
	if(dateLib.compareDate( startAt, endAt ) == 0){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_WarnAccessStarOverEnd"), function(/*cpr.controls.Dialog*/dialog){
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VAOAMHQ_dtiAccessEnd").focus(true);			
			});
		});
		return false
	}
	
	if (!checkNullControl("VAOAMHQ_ipbServiceNumber", "Str_ARMY_ServiceNumberInvalid")){ return false; }
	if (!checkZeroControl("VAOAMHQ_cmbPosition", "Str_ARMY_UserPositionInvalid")){ return false; }
	if (!checkNullControl("VAOAMHQ_ipbAddress", "Str_ARMY_UserGroupInvalid")){ return false; }

	if (!checkNullControl("VAOAMHQ_opbUserName", "Str_ARMY_TargetUserInvalid")){ return false; }
	//if (!checkZeroControl("VAOAMHQ_cmbUserAccessGroup", "Str_ARMY_UserAccessGroupInvalid")){ return false; }
	
}

function getControlValue( controlName ){
	var control = app.lookup(controlName);
	if( control == null ){
		return "";
	}
	var value = control.value;
	if ( value == null ){
		return "";
	}
	return value;
}

function checkNullControl(cntName, ErrorMsg) {
	if( app.lookup(cntName).value == null || app.lookup(cntName).value.length < 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString(ErrorMsg));
		return false;
	}
	return true;
}

function checkZeroControl(cntName, ErrorMsg) {
	if( app.lookup(cntName).value == 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString(ErrorMsg));
		return false;
	}
	return true;
}

function onVAOAMHQ_dtiAccessStartValueChange(/* cpr.events.CValueChangeEvent */ e){
	app.lookup("VAOAMHQ_dtiAccessEnd").value = app.lookup("VAOAMHQ_dtiAccessStart").value;	
}

function onAMAAP_rdbDutyTypeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var aMAAP_rdbDutyType = e.control;
	changePostion(app.lookup("VAOAMHQ_cmbPosition"), Number(aMAAP_rdbDutyType.value));
}

function changePostion(comboControl, userType) {
	var positionList = dataManager.getPositionList();
	comboControl.deleteAllItems();
	switch (Number(userType)){
	case 900:
		for (var i=0; i < positionList.getRowCount(); i++) {
			var row = positionList.getRow(i);
			if (row.getValue("PositionID") > 1000 && row.getValue("PositionID") < 1100) {
			    comboControl.addItem(new cpr.controls.Item(row.getValue("Name"), row.getValue("PositionID")))	
			}
		}
		break;
	case 907:
	case 908:
		for (var i=0; i < positionList.getRowCount(); i++) {
			var row = positionList.getRow(i);
			if (row.getValue("PositionID") > 1100 && row.getValue("PositionID") < 1200) {
			    comboControl.addItem(new cpr.controls.Item(row.getValue("Name"), row.getValue("PositionID")))	
			}
		}
		break;
	case 905:
		for (var i=0; i < positionList.getRowCount(); i++) {
			var row = positionList.getRow(i);
			if (row.getValue("PositionID") > 1200 && row.getValue("PositionID") < 1300) {
			    comboControl.addItem(new cpr.controls.Item(row.getValue("Name"), row.getValue("PositionID")))	
			}
		}	
		break;
	default:
		for (var i=0; i < positionList.getRowCount(); i++) {
			var row = positionList.getRow(i);
		    comboControl.addItem(new cpr.controls.Item(row.getValue("Name"), row.getValue("PositionID")))	
		}
	}
}


// 데이터 맵 값 입력 
exports.getApplicationInfoDataMap = function(dataMap){
	dataMap.setValue("Name", app.lookup("VAOAMHQ_ipbName").value);
	dataMap.setValue("Birthday", app.lookup("VAOAMHQ_dtiBirthday").value);
	dataMap.setValue("Mobile", app.lookup("VAOAMHQ_ipbMobile").value);
	dataMap.setValue("VisitPurpose", app.lookup("VAOAMHQ_ipbVisitPurpose").value);
	dataMap.setValue("UserClass", getControlValue("VAOAMHQ_ipbClasses"));

	dataMap.setValue("AccessStart", app.lookup("VAOAMHQ_dtiAccessStart").value);
	dataMap.setValue("AccessEnd", app.lookup("VAOAMHQ_dtiAccessEnd").value);
	dataMap.setValue("CarNumber", getControlValue("VAOAMHQ_ipbCarNumber"));
	dataMap.setValue("CarType", getControlValue("VAOAMHQ_ipbCarType"));
	dataMap.setValue("CarBlackbox", getControlValue("VAOAMHQ_rdbCarBlackbox"));
	dataMap.setValue("CarColor", getControlValue("VAOAMHQ_ipbCarColor"));
	
	// 부서별 기능 추가로 방문객은 group_code에 방문대상자 부서코드 넣기 - pse
	dataMap.setValue("GroupCode", app.lookup("VAOAMHQ_cmbTargetUserGroup").getSelection()[0].value);
	
	dataMap.setValue("VisitTargetUserID", app.lookup("VAOAMHQ_opbUserID").value);
	dataMap.setValue("VisitTargetName", app.lookup("VAOAMHQ_opbUserName").value);
	dataMap.setValue("VisitTargetPosition", app.lookup("VAOAMHQ_cmbTargetUserPosition").getSelection()[0].label);
	dataMap.setValue("VisitTargetGroup", app.lookup("VAOAMHQ_cmbTargetUserGroup").getSelection()[0].label);
	dataMap.setValue("VisitTargetDepartment", app.lookup("VAOAMHQ_cmbTargetUserPosition").value);
	
	dataMap.setValue("UserType", UserPrivArmyOtherUnit);
	dataMap.setValue("ServiceNumber", app.lookup("VAOAMHQ_ipbServiceNumber").value);
	dataMap.setValue("Position", app.lookup("VAOAMHQ_cmbPosition").value);
	dataMap.setValue("Address", app.lookup("VAOAMHQ_ipbAddress").value);
}

/*
 * "..." 버튼(VAOAMHQ_btnSelectUnitMember)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVAOAMHQ_btnSelectUnitMemberClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var vAOAMHQ_btnSelectUnitMember = e.control;
	var appld = "app/custom/army_hq/users/userSelectOne";
	app.getRootAppInstance().openDialog(appld, {width : 755, height : 500}, function(dialog){
		dialog.bind("headerTitle").toLanguage("Str_UserSelect");
		dialog.style.header.css("background-color", "#528443");
		dialog.initValue = {DelColunm: [14,13,12,11,10,9,8,6,4],
							Fields:["user_id","name","unique_id","privilege","position_code", "group_code", "department"],
							UnVisibles: [1],
							SearchType:"10000"};
		dialog.modal = true;
	}).then(function(returnValue){
		console.log(returnValue);
		if( returnValue != null ){
			var dmAccessApprovalDetailinfo = app.lookup("AccessApprovalDetailInfo");
			dmAccessApprovalDetailinfo.setValue("VisitTargetUserID", Number(returnValue["ID"]));
			dmAccessApprovalDetailinfo.setValue("VisitTargetName", returnValue["Name"]);
			dmAccessApprovalDetailinfo.setValue("VisitTargetPosition", returnValue["PositionCode"]);
			dmAccessApprovalDetailinfo.setValue("VisitTargetGroup", returnValue["GroupCode"]);
			dmAccessApprovalDetailinfo.setValue("GroupCode", returnValue["GroupCode"]);
			dmAccessApprovalDetailinfo.setValue("VisitTargetDepartment", returnValue["Department"]);
		}
	});	
}


/*
 * 라디오 버튼에서 selection-change 이벤트 발생 시 호출.
 * 라디오버튼 아이템을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onVAFAMHQ_rdbPredecessorSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.RadioButton
	 */
	var vAFAMHQ_rdbPredecessor = e.control;
	switch (Number(app.lookup("VAFAMHQ_rdbPredecessor").value)) {
	case 1:
		app.lookup("VAFAMHQ_layout1stHeadApproval").visible = true;
		app.lookup("VAFAMHQ_layout1stApproval").visible = true;
		app.lookup("VAFAMHQ_layout2stHeadApproval").visible = false;
		app.lookup("VAFAMHQ_layout2stApproval").visible = false;
		break;
	case 2:
		app.lookup("VAFAMHQ_layout1stHeadApproval").visible = false;
		app.lookup("VAFAMHQ_layout1stApproval").visible = false;
		app.lookup("VAFAMHQ_layout2stHeadApproval").visible = true;
		app.lookup("VAFAMHQ_layout2stApproval").visible = true;
		break;
	case 3:
		app.lookup("VAFAMHQ_layout1stHeadApproval").visible = true;
		app.lookup("VAFAMHQ_layout1stApproval").visible = true;
		app.lookup("VAFAMHQ_layout2stHeadApproval").visible = true;
		app.lookup("VAFAMHQ_layout2stApproval").visible = true;
		break;
	case 4:
		app.lookup("VAFAMHQ_layout1stHeadApproval").visible = false;
		app.lookup("VAFAMHQ_layout1stApproval").visible = false;
		app.lookup("VAFAMHQ_layout2stHeadApproval").visible = false;
		app.lookup("VAFAMHQ_layout2stApproval").visible = false;
		break;
	}
}


/*
 * "..." 버튼(VAFAMHQ_btn1stApproval)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVAFAMHQ_btn1stApprovalClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var vAFAMHQ_btn1stApproval = e.control;
	var appld = "app/main/users/approvalUser";
	app.openDialog(appld, {width : 500, height : 500}, function(dialog){
		dialog.bind("headerTitle").toLanguage("Str_ApproverSelect");
		dialog.style.header.css("background-color", "#528443");
		dialog.initValue = {"ApprovalLevel":1};
		dialog.modal = true;
	}).then(function(returnValue){
		if( returnValue != null ){
			var groupName = dataManager.getGroupName(returnValue.getValue("GroupCode"));
			app.lookup("VAFAMHQ_opb1stApprovalID").value = returnValue.getValue("ID");
			app.lookup("VAFAMHQ_ipb1stApprovalName").value = returnValue.getValue("Name");
			app.lookup("VAFAMHQ_ipb1stApprovalGroup").value = groupName;
		}
	});	
}


/*
 * "..." 버튼(VAFAMHQ_btn2stApproval)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVAFAMHQ_btn2stApprovalClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var vAFAMHQ_btn2stApproval = e.control;
	var appld = "app/main/users/approvalUser";
	app.openDialog(appld, {width : 500, height : 500}, function(dialog){
		dialog.bind("headerTitle").toLanguage("Str_ApproverSelect");
		dialog.style.header.css("background-color", "#528443");
		dialog.initValue = {"ApprovalLevel":2};
		dialog.modal = true;
	}).then(function(returnValue){
		if( returnValue != null ){
			var groupName = dataManager.getGroupName(returnValue.getValue("GroupCode"));
			app.lookup("VAFAMHQ_opb2stApprovalID").value = returnValue.getValue("ID");
			app.lookup("VAFAMHQ_ipb2stApprovalName").value = returnValue.getValue("Name");
			app.lookup("VAFAMHQ_ipb2stApprovalGroup").value = groupName;
		}
	});
}

exports.setApprovalInfoDataMap = function(dataMap){
	console.log(dataMap.getDatas());
	app.lookup("VAFAMHQ_rdbPredecessor").value = dataMap.getValue("Predecessor");
	
	app.lookup("VAFAMHQ_opb1stApprovalID").value = dataMap.getValue("OnestApprovalUserID");
	app.lookup("VAFAMHQ_ipb1stApprovalName").value = dataMap.getValue("OnestApprovalName");
	app.lookup("VAFAMHQ_ipb1stApprovalGroup").value = dataMap.getValue("OnestApprovalGroup");
	
	app.lookup("VAFAMHQ_opb2stApprovalID").value = dataMap.getValue("TwostApprovalUserID");
	app.lookup("VAFAMHQ_ipb2stApprovalName").value = dataMap.getValue("TwostApprovalName");
	app.lookup("VAFAMHQ_ipb2stApprovalGroup").value = dataMap.getValue("TwostApprovalGroup");
}
exports.setApprovalEnable = function(){
	//app.lookup("VAFAMHQ_rdbPredecessor").enabled = true;
	app.lookup("VAFAMHQ_opb1stApprovalID").enabled = true;
	app.lookup("VAFAMHQ_ipb1stApprovalName").enabled = true;
	app.lookup("VAFAMHQ_ipb1stApprovalGroup").enabled = true;
	app.lookup("VAFAMHQ_btn1stApproval").enabled = true;
	
	app.lookup("VAFAMHQ_opb2stApprovalID").enabled = true;
	app.lookup("VAFAMHQ_ipb2stApprovalName").enabled = true;
	app.lookup("VAFAMHQ_ipb2stApprovalGroup").enabled = true;
	app.lookup("VAFAMHQ_btn2stApproval").enabled = true;
}


exports.setApprovalOptioin = function(optionVaule) {
	var apOption = app.lookup("VAFAMHQ_rdbPredecessor");
	// 승인옵션 라디오를 모이지 않게 처리하고, 옵션 내역만 띄우는 output 추가 - sep
	apOption.deleteAllItems();
	var outPut_apOption = app.lookup("VAFAMHQ_opdPredecessor");
	switch (optionVaule) {	
	case 1:
		apOption.addItem(new cpr.controls.Item("1차 승인", 1));
		apOption.selectItem(0);
		outPut_apOption.value = "1차 승인";
		break;
	case 2:
		apOption.addItem(new cpr.controls.Item("2차 승인", 2));
		apOption.selectItem(0);
		outPut_apOption.value = "2차 승인";
		break;
	case 3:
		/* 
		apOption.addItem(new cpr.controls.Item("1차 승인", 1));
		apOption.addItem(new cpr.controls.Item("2차 승인", 2));
		*/
		apOption.addItem(new cpr.controls.Item("1,2차 승인", 3));
		apOption.selectItem(0);
		outPut_apOption.value = "1, 2차 승인";	
		break;
	case 4:
		apOption.addItem(new cpr.controls.Item("전결", 4));
		apOption.selectItem(0);
		outPut_apOption.value = "전결";
		break;
	// 2차 추가 개발부터는 1 ~ 4까지의 값만 사용하지만 이전 1차 개발에는 7까지 값을 사용했기 때문에 오류 방지를 위해 아래의 case 구문을 남겨둡니다. - sep	
	case 5:
		apOption.addItem(new cpr.controls.Item("1,2차 승인", 3));
		outPut_apOption.value = "1, 2차 승인";	
		/* 
		apOption.addItem(new cpr.controls.Item("1차 승인", 1));
		apOption.addItem(new cpr.controls.Item("전결", 4));
		*/
		apOption.selectItem(0);
		break;
	case 6:
		apOption.addItem(new cpr.controls.Item("1,2차 승인", 3));
		outPut_apOption.value = "1, 2차 승인";	
		/*
		apOption.addItem(new cpr.controls.Item("2차 승인", 2));
		apOption.addItem(new cpr.controls.Item("전결", 4));
		*/ 
		apOption.selectItem(0);
		break;
	case 7:
		apOption.addItem(new cpr.controls.Item("1,2차 승인", 3));
		outPut_apOption.value = "1, 2차 승인";	 
		/*
		apOption.addItem(new cpr.controls.Item("1차 승인", 1));
		apOption.addItem(new cpr.controls.Item("2차 승인", 2));
		apOption.addItem(new cpr.controls.Item("1,2차 승인", 3));
		apOption.addItem(new cpr.controls.Item("전결", 4));
		*/ 
		apOption.selectItem(0);
		break;
	}
	apOption.redraw();
	outPut_apOption.redraw();
}


exports.getApprovalInfoDataMap = function(dataMap){
	
	dataMap.clear();
	dataMap.setValue("Predecessor", app.lookup("VAFAMHQ_rdbPredecessor").value);
	dataMap.setValue("OnestApprovalUserID", app.lookup("VAFAMHQ_opb1stApprovalID").value);
	dataMap.setValue("OnestApprovalName", app.lookup("VAFAMHQ_ipb1stApprovalName").value);
	dataMap.setValue("OnestApprovalGroup", app.lookup("VAFAMHQ_ipb1stApprovalGroup").value);
	dataMap.setValue("TwostApprovalUserID", app.lookup("VAFAMHQ_opb2stApprovalID").value);
	dataMap.setValue("TwostApprovalName", app.lookup("VAFAMHQ_ipb2stApprovalName").value);
	dataMap.setValue("TwostApprovalGroup", app.lookup("VAFAMHQ_ipb2stApprovalGroup").value);
}