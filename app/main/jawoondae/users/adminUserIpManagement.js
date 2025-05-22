/************************************************
 * adminUserIpManagement.js
 * Created at 2020. 1. 29. 오전 11:13:54.
 *
 * @author joymrk
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	var groupList = dataManager.getGroup();	
	var cmbGroup = app.lookup("JWDIP_cmbTargetGroup");	 
		cmbGroup.setItemSet(groupList, {
			label: "Name",
			value: "GroupID",
	});
	var accessgroupList = dataManager.getAccessGroup();
	var cmbAccessGroup = app.lookup("JWDIP_cmbAccessGroup");	 
		cmbAccessGroup.setItemSet(accessgroupList, {
			label: "Name",
			value: "ID",
	});
	var privilegeList = dataManager.getPrivilegeList();	
	if( privilegeList ){
		var cmbPrivilege = app.lookup("JWDIP_cmbPrivilege");	
		cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_Admin"), 1));
		cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_NormalUser"), 2));
		cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdOtherUnit"), Jwd_Other_Unit));
		cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdForeign"), Jwd_Foreign));
		cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdResident"), Jwd_Resident));
		cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdAlways"), Jwd_Always));
		cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdSoldier"), Jwd_Soldier));
		cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdFamily"), Jwd_Family));
		//TODO : cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_Visitor"), 10));
						
		var count = privilegeList.getRowCount();
		for ( var i = 0; i < count; i++ ){			
			var privilegeInfo = privilegeList.getRow(i);						
			cmbPrivilege.addItem(new cpr.controls.Item(privilegeInfo.getValue("Name"),privilegeInfo.getValue("PrivilegeID")));
		}
		
	}
	
	app.lookup("JWDIP_cmbCategory").value = "name";
}

function sendGetAdminUserList() {
	app.lookup("AdminUserList").clear();
	
	var category = app.lookup("JWDIP_cmbCategory").value;
	var keyword = app.lookup("JWDIP_ipbKeyword").value;
	
	var smsGetAdminList = app.lookup("sms_getAdminTypeUserList");
	if (keyword == null || keyword.length == 0) {
		smsGetAdminList.setParameters("searchCategory", "");
		smsGetAdminList.setParameters("searchKeyword", "");
	}
	smsGetAdminList.send();
}

function onJWDIP_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	sendGetAdminUserList();
}

function onSms_getAdminTypeUserListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var totalCount = app.lookup("Total").getValue("Count");
		app.lookup("JWDIP_opbTotal").value = totalCount;
	} else {
		//dialogAlert(app, "Waning", "관리자 IP주소 관리"+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlert(app, "Waning", "관리자 IP주소 관리"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
	app.lookup("JWDIP_grpMain").redraw();
}

function onSms_getAdminTypeUserListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getAdminTypeUserListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onButtonClick(/* cpr.events.CMouseEvent */ e){
	var gridAdminList = app.lookup("JWDIP_adminUserList");
	console.log(app.lookup("AdminUserList").getRowDataRanged());
	var checkedRowIndices = gridAdminList.getCheckRowIndices();
	var chkCount = checkedRowIndices.length;
	dataManager = getDataManager();
	if (chkCount == 0) {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_UserNotSelected"));
		return
	} else {
		comLib.showLoadMask("pro", "관리자 IP 주소를 수정합니다.","",checkedRowIndices.length);
		var dsUpdateList = app.lookup("dsUpdateList");
		dsUpdateList.clear();
		for( var i = 0; i < chkCount; i++){
			var index = checkedRowIndices[i];
			var userID = gridAdminList.getRow(index).getString("ID");
			var updateUser = {"UserID": userID,"rowIndex":index};
			dsUpdateList.addRowData(updateUser);
		}
		sendUpdateUser();
	}
}

// 사용자 업데이트 요청 전송
function sendUpdateUser(){
	var dsUpdateList = app.lookup("dsUpdateList");
	if( dsUpdateList.getRowCount() == 0 ){
		comLib.hideLoadMask();
		dataManager = getDataManager();
		//dialogAlert(app, "Waning", dataManager.getString("Str_UserNotSelected"));
		return;
	}
	
	var dsUserID = dsUpdateList.getRow(0);
	var userID = dsUserID.getValue("UserID");
	var idx = dsUserID.getValue("rowIndex");
	var adminInfo = app.lookup("AdminInfo");
	adminInfo.clear();
	adminInfo.setValue("ID", userID);
	adminInfo.setValue("IpAddresss", app.lookup("AdminUserList").getRow(idx).getValue("IpAddress"));
	console.log(adminInfo.getDatas());
	var msg = dataManager.getString("Str_UserID")+ " : "+userID;
	comLib.updateLoadMask(msg);
	
	var sms_putIpAddress = new cpr.protocols.Submission("sms_putIpAddress");
	sms_putIpAddress.action = "/v1/jawoondae/users/adminType/"+userID;
	sms_putIpAddress.method = "put";
	sms_putIpAddress.mediaType = "application/x-www-form-urlencoded";
	sms_putIpAddress.userAttr("uid", userID);
	sms_putIpAddress.userAttr("rowIndex", dsUserID.getValue("rowIndex").toString());	
	
	sms_putIpAddress.addRequestData(adminInfo, "AdminInfo");
	sms_putIpAddress.addResponseData(app.lookup("Result"), false, "Result");
		
	sms_putIpAddress.addEventListenerOnce("submit-done", onSms_putIpAddressSubmitDone);
	sms_putIpAddress.addEventListenerOnce("submit-error", onSms_putIpAddressSubmitError);
	sms_putIpAddress.addEventListenerOnce("submit-timeout", onSms_putIpAddressSubmitTimeout);
	sms_putIpAddress.send();
}	

function onSms_putIpAddressSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/* @type cpr.protocols.Submission */
	var sms_updateUser = e.control;
	var dsUpdateList = app.lookup("dsUpdateList");
	dsUpdateList.realDeleteRow(0);
	
	var gridUserList = app.lookup("JWDIP_adminUserList");
	var uid = sms_updateUser.userAttr("uid");
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE || resultCode == COMERROR_USER_NOT_EXIST) {
		sendUpdateUser();
	} else {
		//dialogAlert(app, "Waning", "관리자 IP주소 관리"+" "+dataManager.getString("Str_Failed"));
		dialogAlert(app, "Waning", "관리자 IP주소 관리"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
	app.lookup("JWDIP_grpMain").redraw();
}
	
function onSms_putIpAddressSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_putIpAddressSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
