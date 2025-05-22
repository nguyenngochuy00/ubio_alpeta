/************************************************
 * UserAuthUnavailableManagement.js
 * Created at 2021. 12. 9. 오전 9:51:53.
 *
 * @author zxc
 ************************************************/
var locale = "";
var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var dataManager = getDataManager();
var usint_version;
var oem_version;

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();

	oem_version = dataManager.getOemVersion();

	var groupList = dataManager.getGroup();
	if( groupList && groupList.getRowCount()>0){
		var cmbGroup = app.lookup("UAUMGR_cmbGroupList");
		var count = groupList.getRowCount();
		for ( var i = 0; i < count; i++ ){			
			var groupInfo = groupList.getRow(i);						
			cmbGroup.addItem(new cpr.controls.Item(groupInfo.getValue("Name"),groupInfo.getValue("GroupID")));
		}
		/*
		cmbGroup.setItemSet(groupList, {
			label: "Name",
			value: "GroupID",			
		});
		*/				
	}
	
	var positionList = dataManager.getPositionList();
	if( positionList && positionList.getRowCount()>0){
		var cmbPosition = app.lookup("UAUMGR_cmbPositionList");
		var count = positionList.getRowCount();
		for ( var i = 0; i < count; i++ ){			
			var positionInfo = positionList.getRow(i);						
			cmbPosition.addItem(new cpr.controls.Item(positionInfo.getValue("Name"),positionInfo.getValue("PositionID")));
		}
					
	}
	
	var accessGroupList = dataManager.getAccessGroup();
	if( accessGroupList && accessGroupList.getRowCount()>0){
		var cmbAccessGroup = app.lookup("UAUMGR_cmbAccessGroupList");
		var count = accessGroupList.getRowCount();
		for ( var i = 0; i < count; i++ ){			
			var accessGroupInfo = accessGroupList.getRow(i);						
			cmbAccessGroup.addItem(new cpr.controls.Item(accessGroupInfo.getValue("Name"),accessGroupInfo.getValue("ID")));
		}
		/*	
		cmbAccessGroup.setItemSet(accessGroupList, {
			label: "Name",
			value: "ID",
		});
		*/
	}
		
	var privilegeList = dataManager.getPrivilegeList();	

	if( privilegeList ){
		var cmbPrivilege = app.lookup("UAUMGR_cmbPrivilege");	
		var ItemAdmin = new cpr.controls.Item(dataManager.getString("Str_Admin"),1);
		var ItemNormalUser = new cpr.controls.Item(dataManager.getString("Str_NormalUser"),2);

		ItemAdmin.bind("label").toLanguage("Str_Admin");
		ItemNormalUser.bind("label").toLanguage("Str_NormalUser");
		
		cmbPrivilege.addItem(ItemAdmin);
		cmbPrivilege.addItem(ItemNormalUser);
		
		switch (oem_version) {
		case OEM_ARMY_HQ:
		case OEM_ROKMCH:
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_OnDuty"), UserPrivArmyOnDuty));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_OtherUnit"), UserPrivArmyOtherUnit));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Foreign"), UserPrivArmyForeign));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Soldier"), UserPrivArmySoldier));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Family"), UserPrivArmyFamily));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Resident"), UserPrivArmyResident));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Regular"), UserPrivArmyRegular));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_MilitaryPersonnel"), UserPrivArmyMilitaryPersonnel));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_ArmyPublicServicel"), UserPrivArmyPublicService));
			break;
		case OEM_LOTTE_OSIRIA:
			cmbPrivilege.addItem(new cpr.controls.Item("일반직",101));
			cmbPrivilege.addItem(new cpr.controls.Item("특수직",102));
			cmbPrivilege.addItem(new cpr.controls.Item("캐스트",103));
			cmbPrivilege.addItem(new cpr.controls.Item("용역직",104));
			cmbPrivilege.addItem(new cpr.controls.Item("파견직",105));
			cmbPrivilege.addItem(new cpr.controls.Item("일용직",106));
			cmbPrivilege.addItem(new cpr.controls.Item("주차관리",107));
			cmbPrivilege.addItem(new cpr.controls.Item("전문직",108));
			cmbPrivilege.addItem(new cpr.controls.Item("전문캐스트",109));	
			break;
		}
		
		

		if ( dataManager.getOemVersion() == OEM_JAWOONDAE) {
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdOtherUnit"), Jwd_Other_Unit));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdForeign"), Jwd_Foreign));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdResident"), Jwd_Resident));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdAlways"), Jwd_Always));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdSoldier"), Jwd_Soldier));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdFamily"), Jwd_Family));	
		}
		cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_Visitor"), 10));
		
		//TODO : cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_Visitor"), 10));
						
		var count = privilegeList.getRowCount();
		for ( var i = 0; i < count; i++ ){			
			var privilegeInfo = privilegeList.getRow(i);						
			cmbPrivilege.addItem(new cpr.controls.Item(privilegeInfo.getValue("Name"),privilegeInfo.getValue("PrivilegeID")));
		}
		cmbPrivilege.setItemSet(privilegeList, {
			label: "Name",
			value: "PrivilegeID",
		});
	}
	
	sendUnavailableUserListRequest();
}


function sendUnavailableUserListRequest() {
	var smsGetUserList = app.lookup("sms_getUnavailableUserList");
	comLib.showLoadMask("", dataManager.getString("Str_Load"), "", 1);
	
	smsGetUserList.addEventListenerOnce("submit-done", onSms_getUserListSubmitDone);
	smsGetUserList.addEventListenerOnce("submit-error", onSms_getUserListSubmitError);
	smsGetUserList.addEventListenerOnce("submit-timeout", onSms_getUserListSubmitTimeout);
	
	smsGetUserList.setParameters("searchCategory", "unavailableUser");
	smsGetUserList.setParameters("offset", "0");
	smsGetUserList.setParameters("limit", "1000");
	
	
	smsGetUserList.send();
}

// 사용자 리스트 가져오기 완료
function onSms_getUserListSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dsUserList = app.lookup("UserList");
		var unavailableTimeArr = dsUserList.getColumnData("UnavailableTime");
		
		unavailableTimeArr.forEach(function(each, index){
			var splitTime = each.toString().split(".")[0]
			dsUserList.setValue(index, "UnavailableTime", splitTime);
		});
		dsUserList.commit();
		comLib.hideLoadMask();
	} else {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserListGet") + " " + dataManager.getString("Str_Failed") + ".\n" + dataManager.getString(getErrorString(resultCode)));
	}
	
}

// 사용자 리스트 가져오기 submit-error 이벤트 발생 시 호출.
function onSms_getUserListSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_ERROR);
}

// 사용자 리스트 가져오기 submit-timeout 이벤트 발생 시 호출.
function onSms_getUserListSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT)
}

// 닫기
function onUAUTMGR_btnCloseClick(/* cpr.events.CMouseEvent */ e){
	app.close(true);
}

// 로그인 허용
function onUAUMGR_btnUpdateClick(/* cpr.events.CMouseEvent */ e){
	var grdUserList = app.lookup("UAUMGR_grdUserList");
	var checkedIndices = grdUserList.getCheckRowIndices();
	if( checkedIndices.length <1 ){		
		return;
	}
	var dsUpdateList = app.lookup("dsUpdateList");
	
	dsUpdateList.clear();
	
	checkedIndices.forEach(function(index){
		var row = grdUserList.getRow(index);		
		var userID = row.getValue("ID");
		var insertedRow = dsUpdateList.addRow();
		insertedRow.setValue("UserID",userID);
	});
	
	dsUpdateList.commit();
	comLib.showLoadMask("", dataManager.getString("Str_UserUpdate"), "", 0);
//	comLib.showLoadMask("",dataManager.getString("Str_Save"),"",1);
	sendUserUnavailableTimeUpdateReq();	
}

// 사용자 로그인 허용 버튼
function sendUserUnavailableTimeUpdateReq() {
	
	// v1/users/{id}/unavailableUser
	var dsUpdateList = app.lookup("dsUpdateList");
	
	var count = dsUpdateList.getRowCount();
	if( count < 1 ){
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_LoginUnavailableAllowSuccess"));
		sendUnavailableUserListRequest();
		return;
	}
	var smsPutUnavailableUser = app.lookup("sms_putUnavailableUser");
	var userID = dsUpdateList.getRow(0).getValue("UserID");

	smsPutUnavailableUser.action = "/v1/users/"+ userID +"/unavailableUser";
	dsUpdateList.realDeleteRow(0);
	smsPutUnavailableUser.send();
}

function onSms_putUnavailableUserSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode")
	if (resultCode == COMERROR_NONE) {;
		sendUserUnavailableTimeUpdateReq();
	} else {
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Failed") + ".\n" + dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_putUnavailableUserSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_putUnavailableUserSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT)
}
