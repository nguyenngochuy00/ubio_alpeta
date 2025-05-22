/************************************************
 * userAccessGroupPrivilege.js
 * Created at 2021. 6. 23. 오후 5:26:52.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	
	var privilegeList = dataManager.getPrivilegeList()
	var cmbPrivilege = app.lookup("UAGPS_cmbPrivilege");	
		
	if( privilegeList ){
		var itemAdmin = new cpr.controls.Item(dataManager.getString("Str_Admin"),1);
		var itemNormalUser = new cpr.controls.Item(dataManager.getString("Str_NormalUser"),2);		
		
		itemAdmin.bind("label").toLanguage("Str_Admin");
		itemNormalUser.bind("label").toLanguage("Str_NormalUser");
		
		cmbPrivilege.addItem(itemAdmin);
		cmbPrivilege.addItem(itemNormalUser);
			
		var count = privilegeList.getRowCount();
		for ( var i = 0; i < count; i++ ){			
			var privilegeInfo = privilegeList.getRow(i);						
			cmbPrivilege.addItem(new cpr.controls.Item(privilegeInfo.getValue("Name"),privilegeInfo.getValue("PrivilegeID")));
		}	
	}
	
	var cmbGroup = app.lookup("UAGPS_cmbGroup");
	var groupList = dataManager.getGroup();	
	cmbGroup.setItemSet(groupList, {label: "Name",	value: "GroupID",	});
	
	var cmbAccessGroup = app.lookup("UAGPS_cmbAccessGroup");
	var accessGroupList = dataManager.getAccessGroup();		
	cmbAccessGroup.setItemSet(accessGroupList, {label: "Name",	value: "ID"});		
	
	sendUserAccessGroupSetReq();
}

function onSubmitError(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

function sendUserAccessGroupSetReq(){
	var dsUserAccessGroupSet = app.lookup("UserAccessGroupSetList");
	dsUserAccessGroupSet.clear();
	
	var sms_getUserAccessGroupSet = app.lookup("sms_getUserAccessGroupSet");
	sms_getUserAccessGroupSet.send();
}

function onSms_getUserAccessGroupSetSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode"); 
	if( resultCode == 0 ){		
		console.log(app.lookup("UserAccessGroupSetList").getRowDataRanged());
	}else{
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}

function popupUserAccessGroupSetPage(groupCode,userPrivilege,accessGroupCode){
	var appld = "app/custom/lotte_osiria/userAccessGroupPrivilegeRegist";
	app.openDialog(appld, {width : 300, height : 180}, function(dialog){
		dialog.bind("headerTitle").toLanguage("Str_UserAccessGroupPrivilege");
		dialog.initValue = {"GroupCode": groupCode, "UserPrivilege":userPrivilege,"AccessGroupCode":accessGroupCode};
		dialog.modal = true;
	}).then(function(returnValue){

		var result = returnValue["Result"];
		if( result == 0 ){
			var userAccessGroupSet = returnValue["UserAccessGroupSet"];
			var dmUserAccessGroupSetInfo = app.lookup("UserAccessGroupSetInfo");
			dmUserAccessGroupSetInfo.setValue("GroupCode", userAccessGroupSet.GroupCode);
			dmUserAccessGroupSetInfo.setValue("UserPrivilege", userAccessGroupSet.UserPrivilege);
			dmUserAccessGroupSetInfo.setValue("AccessGroupCode", userAccessGroupSet.AccessGroupCode);
			
			var sms_postUserAccessGroupSet = app.lookup("sms_postUserAccessGroupSet");			
			sms_postUserAccessGroupSet.send();
		}
	});
}

function onUAGPS_btnAddClick(/* cpr.events.CMouseEvent */ e){	
	popupUserAccessGroupSetPage(0,0,0);
}

function onSms_postUserAccessGroupSetSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode"); 
	if( resultCode == 0 ){		
		sendUserAccessGroupSetReq();
	}else{
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}

function onUAGPS_grdSettingListRowDblclick(/* cpr.events.CGridMouseEvent */ e){
	/** @type cpr.controls.Grid	 */
	var uAGPS_grdSettingList = e.control;	
	var groupCode = e.row.getValue("GroupCode");
	var userPrivilege = e.row.getValue("UserPrivilege");
	var accessGroupCode = e.row.getValue("AccessGroupCode");
	popupUserAccessGroupSetPage(groupCode,userPrivilege,accessGroupCode);	
}

function onSms_putUserAccessGroupSetSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_putUserAccessGroupSet = e.control;
	
}

function onUAGPS_btnDeleteClick(/* cpr.events.CMouseEvent */ e){	
	
	var grdSettingList = app.lookup("UAGPS_grdSettingList");
	var checkedRowIndices = grdSettingList.getCheckRowIndices();
	var delCount = checkedRowIndices.length;

	dataManager = getDataManager();
	if (delCount == 0) {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_NoSelection"));
		return
	} else {
		dialogConfirm(app.getRootAppInstance(), "", dataManager.getString("Str_DeleteConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue) {

					comLib.showLoadMask("pro",dataManager.getString("Str_Delete"),"",checkedRowIndices.length);

					var dsSrcList = app.lookup("UserAccessGroupSetList");
					var dsDeleteList = app.lookup("UserAccessGroupSetListDelete");
					dsDeleteList.clear();

					for( var i = 0; i < delCount; i++){
						var row = dsSrcList.getRow(checkedRowIndices[i]);						
						dsDeleteList.addRowData(row.getRowData());
					}
					sendDeleteUserAccessGroupSet();

				} else {}
			});
		});
	}
}


// 사용자 삭제 요청 전송
function sendDeleteUserAccessGroupSet(){
	var dsDeleteList = app.lookup("UserAccessGroupSetListDelete");
	if( dsDeleteList.getRowCount() == 0 ){
		comLib.hideLoadMask();
		sendUserAccessGroupSetReq();		
		return;
	}
	var row = dsDeleteList.getRow(0);
	var dmUserAccessGroupSetInfo = app.lookup("UserAccessGroupSetInfo");
	dmUserAccessGroupSetInfo.setValue("GroupCode", row.getValue("GroupCode"));
	dmUserAccessGroupSetInfo.setValue("UserPrivilege", row.getValue("UserPrivilege"));  
	dmUserAccessGroupSetInfo.setValue("AccessGroupCode", row.getValue("AccessGroupCode"));
	
	comLib.updateLoadMask();	
	dsDeleteList.realDeleteRow(0);
	
	var sms_deleteUserAccessGroupSet = new cpr.protocols.Submission("sms_deleteUserAccessGroupSet");
	sms_deleteUserAccessGroupSet.action = "/v1/accessGroups/userAccessGroupSet";
	sms_deleteUserAccessGroupSet.method = "put";
	sms_deleteUserAccessGroupSet.mediaType = "application/x-www-form-urlencoded";
	sms_deleteUserAccessGroupSet.addRequestData(dmUserAccessGroupSetInfo);		
	sms_deleteUserAccessGroupSet.addResponseData(app.lookup("Result"), false, "Result");
		
	sms_deleteUserAccessGroupSet.addEventListenerOnce("submit-done", onSms_deleteUserAccessGroupSetSubmitDone);
	sms_deleteUserAccessGroupSet.addEventListenerOnce("submit-error", onSubmitError);
	sms_deleteUserAccessGroupSet.addEventListenerOnce("submit-timeout", onSubmitTimeout);
	sms_deleteUserAccessGroupSet.send();
}

function onSms_deleteUserAccessGroupSetSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode"); 
	if( resultCode == 0 ){		
		sendDeleteUserAccessGroupSet();
		
	}else{
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}
