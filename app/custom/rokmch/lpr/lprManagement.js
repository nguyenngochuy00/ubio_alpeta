/************************************************
 * lprManagement.js
 * Created at 2019. 10. 26. 오후 1:45:16.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var JWDLM_version;
var JWDLM_timer = 0;

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	JWDLM_version = dataManager.getSystemVersion();
	sendGetJawoondaeLprlist();
	
	app.lookup("sms_getOptionsAMHQ").send();
	
	//JWDLM_timer = setInterval("status_timer", 5000);
	
	JWDLM_timer = setInterval(function() {
   		var sms_getLPRStatus = app.lookup("sms_getLPRStatus");
		sms_getLPRStatus.send();
	}, 5000);
}

function status_timer(){
	var sms_getLPRStatus = app.lookup("sms_getLPRStatus");
	sms_getLPRStatus.send();
}

function onBodyUnload(/* cpr.events.CEvent */ e){
	if (JWDLM_timer){
		clearInterval(JWDLM_timer);
	}
}

function sendGetJawoondaeLprlist() {
	app.lookup("LprInfoList").clear(); // 초기화
	
	comLib.showLoadMask("", "LPR 관리", "", 0);
	app.lookup("sms_getLprInfoList").send(); // 
}

function onSms_getLprInfoListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		
	} else {
		//dialogAlertAMHQ(app, "Waning", "LPR 관리 "+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlertAMHQ(app, "Waning", "LPR 관리 "+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
	
	app.lookup("JWDLM_grpMain").redraw();
}

function onSms_getLprInfoListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);	
}

function onSms_getLprInfoListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onJWDLM_btnAddClick(/* cpr.events.CMouseEvent */ e){
	var appld = "app/custom/rokmch/lpr/lprRegist" + "?" + JWDLM_version;
	app.openDialog(appld, {width : 405, height : 275}, function(dialog){
		dialog.ready(function(dialogApp){
			dialog.initValue = {"reqType": 0};
			//dialog.bind("headerTitle").toLanguage("LPR 등록");
			dialog.style.header.css("background-color", "#528443");
			dialog.headerTitle = ("LPR 장비 등록");
			dialog.modal = true;
		});
	}).then(function(returnValue){
		//console.log(returnValue);
		var result = returnValue["Result"];
		if( result == 0 ){
			var lprInfo = returnValue["LprInfo"];
			var dmLprInfo = app.lookup("LprInfo");
			dmLprInfo.build(lprInfo);
			//console.log(dmLprInfo);
			var sms_postLprInfo = app.lookup("sms_postLprInfoList");
			sms_postLprInfo.send();
		}
	});
}

function onJWDLM_btnDeleteClick(/* cpr.events.CMouseEvent */ e){
	var grdLprList = app.lookup("JWDLM_grdLprList");
	var chkIndices = grdLprList.getCheckRowIndices();
	var total = chkIndices.length;
	
	if( total < 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "선택된 LPR 리스트가 없습니다.");
		return;
	}
	comLib.showLoadMask("pro","LPR 관리","",chkIndices.length);
	
	var deleteLprList = app.lookup("DeleteLprList");
	deleteLprList.clear();
	
	for( var i = 0; i < total; i++){
		var delIndex = chkIndices[i];
		var delUser = {"DeviceID":grdLprList.getRow(delIndex).getValue("DeviceID"),"rowIndex":delIndex};
		deleteLprList.addRowData(delUser);
	}
	sendLprDelete();
}

function sendLprDelete() {// Delete
	var deleteLprList = app.lookup("DeleteLprList");
	
	if (deleteLprList.getRowCount() == 0 ) {
		comLib.hideLoadMask();
		dataManager = getDataManager();
		return;
	}
	
	var deleteInfo = deleteLprList.getRow(0);
	var deviceID = deleteInfo.getValue("DeviceID");
	
	var msg = "DeviceID"+ " : "+deviceID;
	comLib.updateLoadMask(msg);
	
	var smsdeleteLprInfo = app.lookup("sms_DeleteLprInfoList");
	smsdeleteLprInfo.action = "/v1/jawoondae/lpr/" + deviceID;
	smsdeleteLprInfo.userAttr("deviceID", deviceID.toString());
	smsdeleteLprInfo.userAttr("rowIndex", deleteInfo.getValue("rowIndex").toString());
	smsdeleteLprInfo.send();
	/*
		var sms_deleteUser = new cpr.protocols.Submission("sms_deleteUser");
		sms_deleteUser.action = "/v1/users/"+userID;
		sms_deleteUser.method = "delete";
		sms_deleteUser.mediaType = "application/x-www-form-urlencoded"; 
	*/
}
	
function onSms_DeleteLprInfoListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var sms_DeleteLprInfoList = e.control;
	var deleteLprList = app.lookup("DeleteLprList");
	deleteLprList.realDeleteRow(0);
	var grdLprList = app.lookup("JWDLM_grdLprList");
	var deviceID=  	sms_DeleteLprInfoList.userAttr("deviceID");
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE || resultCode == COMERROR_USER_NOT_EXIST ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_lprDelete"));
		grdLprList.deleteRow(parseInt(sms_DeleteLprInfoList.userAttr("rowIndex"), 10));
		grdLprList.commitData();
		sendLprDelete();
	} else {
		comLib.hideLoadMask();
		dataManager = getDataManager();
		//dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), 
		//	deviceID+ " "+"Lpr 정보 삭제"+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), 
			deviceID+ " "+"Lpr 정보 삭제"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
}
	

function onSms_DeleteLprInfoListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_DeleteLprInfoListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onSms_postLprInfoListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_lprRegist"));
		sendGetJawoondaeLprlist();
	} else {
		//dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_lprRegist"));
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_postLprInfoListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);	
}

function onSms_postLprInfoListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onJWDLM_grdLprListRowDblclick(/* cpr.events.CGridEvent */ e){
	var jwdlm_grdevent = e.control;
	var idx = jwdlm_grdevent.getSelectedRowIndex();
	//var appld = "app/main/jawoondae/lpr/lprRegist" + "?" + JWDLM_version;
	var appld = "app/custom/rokmch/lpr/lprRegist" + "?" + JWDLM_version;
	app.openDialog(appld, {width : 405, height : 275}, function(dialog){
		dialog.ready(function(dialogApp){
			dialog.headerTitle = "LPR 정보";
			dialog.initValue = {"reqType": 1,"lprInfo":jwdlm_grdevent.getRow(idx).getRowData()};
			dialog.modal = true;
			dialog.style.header.css("background-color", "#528443");
		});
	}).then(function(returnValue){
		
		var result = returnValue["Result"];
		if( result == 0 ){
			var reqType = returnValue["reqType"];
			var lprInfo = returnValue["LprInfo"];
			var dmLprInfo = app.lookup("LprInfo");
			dmLprInfo.build(lprInfo);
			if (reqType == 0 ) { //add
				var sms_postLprInfo = app.lookup("sms_postLprInfoList");
				sms_postLprInfo.send();	
			} else { //modi
				var sms_putLprInfo = app.lookup("sms_putLprInfo");
				sms_putLprInfo.action = "/v1/jawoondae/lpr/" + dmLprInfo.getValue("DeviceID");
				sms_putLprInfo.send();
			}
		}
	});
}	

function onSms_putLprInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_lprRegist"));
		sendGetJawoondaeLprlist();
	} else {
		//dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_lprRegist"));
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}
function onSms_putLprInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}
function onSms_putLprInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
	


/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSMAG_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}


/* 버튼 이벤트  */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	app.lookup("sms_putOptionsAMHQ").send()
}

/* 서브미션 이벤트  */
function onSms_getOptionsAMHQSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
		//app.lookup("cmbFivePartTimeSetting").redraw();

	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_getOptionsAMHQSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);	
}

function onSms_getOptionsAMHQSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onSms_putOptionsAMHQSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Success"));
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_putOptionsAMHQSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);	
}

function onSms_putOptionsAMHQSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onSms_getLPRStatusSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
		var lprInfoList = app.lookup("LprInfoList");		
		var lprStatusList = app.lookup("LPRStatusList");
		
		for( var i=0; i < lprInfoList.getRowCount();i++){
			var lprInfo =  lprInfoList.getRow(i);			
			var deviceID = lprInfo.getValue("DeviceID");
			var statusInfo = lprStatusList.findFirstRow("DeviceID == "+deviceID);
			if(statusInfo){
				lprInfo.setValue("Status",statusInfo.getValue("Status"));
			}else{
				lprInfo.setValue("Status",2);
			}
		}
	} 
}

function onSms_getLPRStatusSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getLPRStatusSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onJWDLM_rdbWatchdogSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.RadioButton	 */
	var jWDLM_rdbWatchdog = e.control;
	var sms_postWatchdogInfo = new cpr.protocols.Submission("sms_postWatchdogInfo");
	sms_postWatchdogInfo.action = "/v1/jawoondae/lpr/watchdog"
	sms_postWatchdogInfo.method = "post";
	sms_postWatchdogInfo.mediaType = "application/x-www-form-urlencoded";
	var dmWatchdogInfo= app.lookup("WatchdogInfo");
	
	sms_postWatchdogInfo.addRequestData(dmWatchdogInfo, "WatchdogInfo");
	sms_postWatchdogInfo.addResponseData(app.lookup("Result"), false, "Result");
	
	sms_postWatchdogInfo.addEventListenerOnce("submit-done", onSms_postWatchdogInfoSubmitDone);
	sms_postWatchdogInfo.addEventListenerOnce("submit-error", onSms_postWatchdogInfoSubmitError);
	sms_postWatchdogInfo.addEventListenerOnce("submit-timeout", onSms_postWatchdogInfoSubmitTimeout);
	
	sms_postWatchdogInfo.send();
			
}

function onSms_postWatchdogInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** @type cpr.protocols.Submission */
	var sms_getUserSyncCustom = e.control;
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}

function onSms_postWatchdogInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

function onSms_postWatchdogInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}
