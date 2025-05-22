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
	
	var cmbUserGroup = app.lookup("VAOAMHQ_cmbPosition");
	changePostion(cmbUserGroup, app.lookup("AMAAP_rdbDutyType").value);
	cmbUserGroup.addItem(new cpr.controls.Item("------", 0));
	if (cmbUserGroup.value == null || cmbUserGroup.value == 0) {
		cmbUserGroup.selectItemByValue(0);
	} else {
		cmbUserGroup.selectItemByValue(cmbUserGroup.value);	
	}
	
	var cmbUserAccessGroup = app.lookup("VAOAMHQ_cmbUserAccessGroup");	
	var accessGroup = dataManager.getAccessGroup();
	cmbUserAccessGroup.addItem(new cpr.controls.Item("------", 0));
	var accessGroupCnt = accessGroup.getRowCount();
	for (var i=0; i < accessGroupCnt; i++) {
		if (accessGroup.getRow(i).getValue("VisitEnable") == 1) {
			cmbUserAccessGroup.addItem(new cpr.controls.Item(accessGroup.getRow(i).getValue("Name"), accessGroup.getRow(i).getValue("ID")));		
		}
	}

	if (cmbUserAccessGroup.value == null || cmbUserAccessGroup.value == 0) {
		cmbUserAccessGroup.selectItemByValue(0);
	} else {
		cmbUserAccessGroup.selectItemByValue(cmbUserAccessGroup.value);	
	}
		
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
	
	var accountInfo = dataManager.getAccountInfo();
	var UserID = Number(accountInfo.getValue("UserID"));
	
	//마스터일 경우
	if ( UserID == 1000000000000000000 ) {
		return;
	} else {	
		var userID = dataManager.getAccountID();
		var sms_getUserInfo = app.lookup("sms_getUserInfo");
		sms_getUserInfo.action = "/v1/armyhq/users/"+userID;
		sms_getUserInfo.send();		
	}
}

exports.initAllControl = function(setDay){
	dataManager = getDataManager();
	console.log("initAllControl");
	var today = dateLib.getToday("-");
	
	app.lookup("VAOAMHQ_ipbName").value = "";
	app.lookup("VAOAMHQ_dtiBirthday").value = "";
	app.lookup("VAOAMHQ_ipbMobile").value = "";
	app.lookup("VAOAMHQ_ipbVisitPurpose").value = "";
	app.lookup("VAOAMHQ_ipbClasses").value = "";
	console.log(setDay);
	if (setDay == null ) {
		console.log(setDay);
		app.lookup("VAOAMHQ_dtiAccessStart").value = today;
		app.lookup("VAOAMHQ_dtiAccessEnd").value = today;		
	} else {
		console.log(setDay);
		app.lookup("VAOAMHQ_dtiAccessStart").value = setDay;
		app.lookup("VAOAMHQ_dtiAccessEnd").value = setDay;	
	}
	console.log(app.lookup("VAOAMHQ_dtiAccessStart").value);
	console.log(app.lookup("VAOAMHQ_dtiAccessEnd").value);	
	app.lookup("VAOAMHQ_ipbCarNumber").value = "";
	app.lookup("VAOAMHQ_ipbCarType").value = "";
	app.lookup("VAOAMHQ_rdbCarBlackbox").value = 1;
	app.lookup("VAOAMHQ_ipbCarColor").value = "";
	
	app.lookup("VAOAMHQ_opbUserName").value = "";
	app.lookup("VAOAMHQ_cmbTargetUserPosition").selectItemByValue(0);
	app.lookup("VAOAMHQ_cmbTargetUserGroup").selectItemByValue(0);
	
	app.lookup("VAOAMHQ_cmbUserAccessGroup").selectItemByValue(0);
	// app.lookup("VAOAMHQ_rdbPredecessor").value = 0;
	app.lookup("VAOAMHQ_ipb1stApprovalName").value = "";
	app.lookup("VAOAMHQ_ipb1stApprovalGroup").value = "";
	app.lookup("VAOAMHQ_ipb2stApprovalName").value = "";
	app.lookup("VAOAMHQ_ipb2stApprovalGroup").value = "";
	app.lookup("VAOAMHQ_ipbServiceNumber").value = "";
	app.lookup("VAOAMHQ_cmbPosition").selectItemByValue(0);
	app.lookup("VAOAMHQ_ipbAddress").value = "";
	app.lookup("VAOAMHQ_grpUserInfo").redraw();
}

exports.setApprovalOptioin = function(optionVaule) {
	var apOption = app.lookup("VAOAMHQ_rdbPredecessor");
	// 승인옵션 라디오를 모이지 않게 처리하고, 옵션 내역만 띄우는 output 추가 - sep
	var outPut_apOption = app.lookup("VAOAMHQ_opdPredecessor");
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
	
	dataMap.setValue("VisitTargetUserID", app.lookup("UnitMember").getValue("ID"));
	dataMap.setValue("VisitTargetName", app.lookup("UnitMember").getValue("Name"));
	dataMap.setValue("VisitTargetPosition", app.lookup("VAOAMHQ_cmbTargetUserPosition").getSelection()[0].label);
	dataMap.setValue("VisitTargetGroup", app.lookup("VAOAMHQ_cmbTargetUserGroup").getSelection()[0].label);
	dataMap.setValue("VisitTargetDepartment", app.lookup("UnitMember").getValue("Department"));
	
	dataMap.setValue("AccessGroup", app.lookup("VAOAMHQ_cmbUserAccessGroup").value);
	dataMap.setValue("Predecessor", app.lookup("VAOAMHQ_rdbPredecessor").value);
	dataMap.setValue("1stApproval", app.lookup("VAOAMHQ_opb1stApprovalID").value);
	dataMap.setValue("2stApproval", app.lookup("VAOAMHQ_opb2stApprovalID").value);
	
	dataMap.setValue("UserType", UserPrivArmyOtherUnit);
	dataMap.setValue("ServiceNumber", app.lookup("VAOAMHQ_ipbServiceNumber").value);
	dataMap.setValue("Position", app.lookup("VAOAMHQ_cmbPosition").value);
	dataMap.setValue("Address", app.lookup("VAOAMHQ_ipbAddress").value);
	dataMap.setValue("GroupCode", app.lookup("VAOAMHQ_cmbTargetUserGroup").value);
}

exports.getApprovalInfoDataMap = function(dataMap){
	dataMap.setValue("Predecessor", app.lookup("VAOAMHQ_rdbPredecessor").value);
	dataMap.setValue("1stApprovalID", app.lookup("VAOAMHQ_opb1stApprovalID").value);
	dataMap.setValue("1stApprovalName", app.lookup("VAOAMHQ_ipb1stApprovalName").value);
	dataMap.setValue("1stApprovalGroup", app.lookup("VAOAMHQ_ipb1stApprovalGroup").value);
	dataMap.setValue("2stApprovalID", app.lookup("VAOAMHQ_opb2stApprovalID").value);
	dataMap.setValue("2stApprovalName", app.lookup("VAOAMHQ_ipb2stApprovalName").value);
	dataMap.setValue("2stApprovalGroup", app.lookup("VAOAMHQ_ipb2stApprovalGroup").value);
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
	
	app.lookup("VAOAMHQ_opbUserName").value = dataMap.getValue("VisitTargetName");
	app.lookup("VAOAMHQ_cmbTargetUserPosition").selectItemByValue(dataMap.getValue("VisitTargetPosition"));
	app.lookup("VAOAMHQ_cmbTargetUserGroup").selectItemByValue(dataMap.getValue("VisitTargetGroup"));
	
	// app.lookup("UnitMember").value // 확인 필요
	dataManager = getDataManager();
	console.log(dataManager.getUserInfo());
	console.log(dataManager.getAccountInfo());
	
	app.lookup("VAOAMHQ_cmbUserAccessGroup").value = dataMap.getValue("AccessGroup");
	// 이전 방문객의 승인옵션 값으로 선택 시 설정이 바뀐 경우 선택이 안되는 경우가 있음 - mjy
	app.lookup("VAOAMHQ_rdbPredecessor").selectItem(0);; 
	app.lookup("VAOAMHQ_opb1stApprovalID").value = dataMap.getValue("1stApproval");
	app.lookup("VAOAMHQ_opb2stApprovalID").value = dataMap.getValue("2stApproval");
	
	// app.lookup("UserType").value // 확인 필요
	app.lookup("VAOAMHQ_ipbServiceNumber").value = dataMap.getValue("ServiceNumber");
	app.lookup("VAOAMHQ_ipbAddress").value = dataMap.getValue("Address");
	app.lookup("VAOAMHQ_cmbPosition").value = parseInt(dataMap.getValue("Position"));
	app.lookup("VAOAMHQ_cmbPosition").selectItemByValue(app.lookup("VAOAMHQ_cmbPosition").value);
}

exports.getUnitMemberDataMap = function(dataMap){
	var dmUnitMember = app.lookup("UnitMember");
	dataMap.setValue("ID", dmUnitMember.getValue("ID"));
	dataMap.setValue("Name", dmUnitMember.getValue("Name"));
	dataMap.setValue("Position", dmUnitMember.getValue("Position"));
	dataMap.setValue("Group", dmUnitMember.getValue("Group"));
	dataMap.setValue("Department", dmUnitMember.getValue("Department"));
}

// vaidatdCheck
exports.validateData = function(){
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
	if( app.lookup("VAOAMHQ_dtiAccessStart").value == null || app.lookup("VAOAMHQ_dtiAccessStart").value.length < 10 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_UserAccessStartInvalid"));
		return false;
	}
	
	if( app.lookup("VAOAMHQ_dtiAccessEnd").value == null || app.lookup("VAOAMHQ_dtiAccessEnd").value.length < 10 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_UserAccessEndInvalid"));
		return false;
	}
	
	if (!checkNullControl("VAOAMHQ_ipbServiceNumber", "Str_ARMY_ServiceNumberInvalid")){ return false; }
	if (!checkZeroControl("VAOAMHQ_cmbPosition", "Str_ARMY_UserPositionInvalid")){ return false; }
	if (!checkNullControl("VAOAMHQ_ipbAddress", "Str_ARMY_UserGroupInvalid")){ return false; }

	if (!checkNullControl("VAOAMHQ_opbUserName", "Str_ARMY_TargetUserInvalid")){ return false; }
	if (!checkZeroControl("VAOAMHQ_cmbUserAccessGroup", "Str_ARMY_UserAccessGroupInvalid")){ return false; }
	
	
	switch (app.lookup("VAOAMHQ_rdbPredecessor").value) {
	case 1:
		if (!checkNullControl("VAOAMHQ_ipb1stApprovalName", "Str_ARMY_1stApprovalInvalid")){ return false; }
		break;
	case 2:
		if (!checkNullControl("VAOAMHQ_ipb2stApprovalName", "Str_ARMY_2stApprovalInvalid")){ return false; }
		break;
	case 3:
		if (!checkNullControl("VAOAMHQ_ipb1stApprovalName", "Str_ARMY_1stApprovalInvalid")){ return false; }
		if (!checkNullControl("VAOAMHQ_ipb2stApprovalName", "Str_ARMY_2stApprovalInvalid")){ return false; }
		break;
	}
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

/*
 * "..." 버튼(VAOAMHQ_btnSelectUnitMember)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVAOAMHQ_btnSelectUnitMemberClick(/* cpr.events.CMouseEvent */ e){
	var appld = "app/custom/army_hq/users/userSelectOne";
	app.getRootAppInstance().openDialog(appld, {width : 755, height : 500}, function(dialog){
		dialog.bind("headerTitle").toLanguage("Str_UserSelect");
		dialog.style.header.css("background-color", "#528443");
		dialog.initValue = {
			DelColunm: [14,13,12,11,10,9,8,6,4],
			Fields:["user_id","name","unique_id","privilege","position_code", "group_code", "department"],
			UnVisibles: [1],
			SearchType:"NO" // 처음 방문자 선택 창 띄울때 리스트 가져오지 않도록 하기 위해 수정 - pse
			//SearchType:"10000"
		};
		dialog.modal = true;
	}).then(function(returnValue){
		if( returnValue != null ){
			var unitMember = app.lookup("UnitMember");
			unitMember.setValue("ID", returnValue["ID"]);
			unitMember.setValue("Name", returnValue["Name"]);
			unitMember.setValue("Position", returnValue["PositionCode"]);
			unitMember.setValue("Group", returnValue["GroupCode"]);
			unitMember.setValue("Department", returnValue["Department"]);
		}
	});	
}

function onVAOAMHQ_btn1stApprovalClick(/* cpr.events.CMouseEvent */ e){
	var appld = "app/main/users/approvalUser";
	app.openDialog(appld, {width : 500, height : 500}, function(dialog){
		dialog.bind("headerTitle").toLanguage("Str_ApproverSelect");
		dialog.style.header.css("background-color", "#528443");
		dialog.initValue = {"ApprovalLevel":1};
		dialog.modal = true;
	}).then(function(returnValue){
		if( returnValue != null ){
			var groupName = dataManager.getGroupName(returnValue.getValue("GroupCode"));
			app.lookup("VAOAMHQ_opb1stApprovalID").value = returnValue.getValue("ID");
			app.lookup("VAOAMHQ_ipb1stApprovalName").value = returnValue.getValue("Name");
			app.lookup("VAOAMHQ_ipb1stApprovalGroup").value = groupName;
		}
	});
}

function onVAOAMHQ_btn2stApprovalClick(/* cpr.events.CMouseEvent */ e){
	var appld = "app/main/users/approvalUser";
	app.openDialog(appld, {width : 500, height : 500}, function(dialog){
		dialog.bind("headerTitle").toLanguage("Str_ApproverSelect");
		dialog.style.header.css("background-color", "#528443");
		dialog.initValue = {"ApprovalLevel":2};
		dialog.modal = true;
	}).then(function(returnValue){
		if( returnValue != null ){
			var groupName = dataManager.getGroupName(returnValue.getValue("GroupCode"));
			app.lookup("VAOAMHQ_opb2stApprovalID").value = returnValue.getValue("ID");
			app.lookup("VAOAMHQ_ipb2stApprovalName").value = returnValue.getValue("Name");
			app.lookup("VAOAMHQ_ipb2stApprovalGroup").value = groupName;
		}
	});	
}

function rdbPredecessorSelectionChange(){
	switch (Number(app.lookup("VAOAMHQ_rdbPredecessor").value)) {
	case 1:
		app.lookup("VAOAMHQ_layout1stHeadApproval").visible = true;
		app.lookup("VAOAMHQ_layout1stApproval").visible = true;
		app.lookup("VAOAMHQ_layout2stHeadApproval").visible = false;
		app.lookup("VAOAMHQ_layout2stApproval").visible = false;
		break;
	case 2:
		app.lookup("VAOAMHQ_layout1stHeadApproval").visible = false;
		app.lookup("VAOAMHQ_layout1stApproval").visible = false;
		app.lookup("VAOAMHQ_layout2stHeadApproval").visible = true;
		app.lookup("VAOAMHQ_layout2stApproval").visible = true;
		break;
	case 3:
		app.lookup("VAOAMHQ_layout1stHeadApproval").visible = true;
		app.lookup("VAOAMHQ_layout1stApproval").visible = true;
		app.lookup("VAOAMHQ_layout2stHeadApproval").visible = true;
		app.lookup("VAOAMHQ_layout2stApproval").visible = true;
		break;
	case 4:
		app.lookup("VAOAMHQ_layout1stHeadApproval").visible = false;
		app.lookup("VAOAMHQ_layout1stApproval").visible = false;
		app.lookup("VAOAMHQ_layout2stHeadApproval").visible = false;
		app.lookup("VAOAMHQ_layout2stApproval").visible = false;
		break;
	}
}

function onVAOAMHQ_dtiAccessStartValueChange(/* cpr.events.CValueChangeEvent */ e){
	app.lookup("VAOAMHQ_dtiAccessEnd").value = app.lookup("VAOAMHQ_dtiAccessStart").value;	
}

function onVAOAMHQ_btnAcGroupSortClick(/* cpr.events.CMouseEvent */ e){
		var btnSort = e.control;
	
	// combobox item 반전
	util.comboboxItemReverse(app.lookup("VAOAMHQ_cmbUserAccessGroup"));
	
	// 버튼 클래스 스왑
	if (btnSort.style.hasClass("button-sort-desc-amhq")) {
		btnSort.style.removeClass("button-sort-desc-amhq");
		btnSort.style.addClass("button-sort-ase-amhq");
	} else {
		btnSort.style.removeClass("button-sort-ase-amhq");
		btnSort.style.addClass("button-sort-desc-amhq");
	}
	btnSort.redraw();	
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
	/* // 병사 계급 삭제로 주석 처리	 - sep
	case 905:
		for (var i=0; i < positionList.getRowCount(); i++) {
			var row = positionList.getRow(i);
			if (row.getValue("PositionID") > 1200 && row.getValue("PositionID") < 1300) {
			    comboControl.addItem(new cpr.controls.Item(row.getValue("Name"), row.getValue("PositionID")))	
			}
		}	
		break;
	*/ 
	default:
		for (var i=0; i < positionList.getRowCount(); i++) {
			var row = positionList.getRow(i);
		    comboControl.addItem(new cpr.controls.Item(row.getValue("Name"), row.getValue("PositionID")))	
		}
	}
}

function onSms_SubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onSms_SubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getApproverListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getApproverList = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){		
		var approverList = app.lookup("ApproverList");
		var count = approverList.getRowCount();
		//if (count == 0) {
			//dialogAlertAMHQ(app, "경고", "승인자 지정안된 계정입니다. 승인자를 별도로 지정해 주세요.");		
		//} else {
			var approverInfo = approverList.getRow(0);	
		//}
		for( var i = 0; i < count; i++){
			var approverInfo = approverList.getRow(i);
			var groupName = dataManager.getGroupName(approverInfo.getValue("GroupCode"));
			app.lookup("VAOAMHQ_opb1stApprovalID").value = approverInfo.getValue("ID");
			app.lookup("VAOAMHQ_ipb1stApprovalName").value = approverInfo.getValue("Name");
			app.lookup("VAOAMHQ_ipb1stApprovalGroup").value = groupName;
		}
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}

function onSms_getUserInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
		var unitMember = app.lookup("UnitMember");
	
		unitMember.setValue("ID", app.lookup("UserInfo").getValue("ID"));
		unitMember.setValue("Name", app.lookup("UserInfo").getValue("Name"));	
		unitMember.setValue("Position", app.lookup("UserInfo").getValue("PositionCode"));
		unitMember.setValue("Group", app.lookup("UserInfo").getValue("GroupCode"));
		unitMember.setValue("Department", app.lookup("UserInfo").getValue("Department"));
				
		app.lookup("VAOAMHQ_grpUserInfo").redraw();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
	
	//1 승인자리스트에 내정보 있는지 받아온다. 있으면 넣
	var userID = dataManager.getAccountID();
	var sms_getApproverList = app.lookup("sms_getApproverList");
	sms_getApproverList.action = "/v1/approvers/" + userID;
	sms_getApproverList.setParameters("MinLevel", 1);
	sms_getApproverList.setParameters("MaxLevel", 1);	
	//sms_getApproverList.setParameters(name, value);
	sms_getApproverList.send(); 
}

exports.initNotAllControl = function(){
	app.lookup("VAOAMHQ_ipbName").value = "";
	app.lookup("VAOAMHQ_dtiBirthday").value = "";
	app.lookup("VAOAMHQ_ipbMobile").value = "";
	app.lookup("VAOAMHQ_ipbVisitPurpose").value = "";
	app.lookup("VAOAMHQ_ipbClasses").value = "";
	
	app.lookup("VAOAMHQ_ipbCarNumber").value = "";
	app.lookup("VAOAMHQ_ipbCarType").value = "";
	app.lookup("VAOAMHQ_rdbCarBlackbox").value = 1;
	app.lookup("VAOAMHQ_ipbCarColor").value = "";
	app.lookup("VAOAMHQ_ipbServiceNumber").value = "";
	app.lookup("VAOAMHQ_cmbPosition").selectItemByValue(0);
	app.lookup("VAOAMHQ_ipbAddress").value = "";
}
