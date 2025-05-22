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

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	JWDLM_version = dataManager.getSystemVersion();
	sendGetJawoondaeLprlist();
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
		//dialogAlert(app, "Waning", "LPR 관리 "+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlert(app, "Waning", "LPR 관리 "+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
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
	var appld = "app/main/jawoondae/lpr/lprRegist" + "?" + JWDLM_version;
	app.openDialog(appld, {width : 400, height : 300}, function(dialog){
		dialog.ready(function(dialogApp){
			dialog.initValue = {"reqType": 0};
			dialog.bind("headerTitle").toLanguage("LPR 등록");
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
		dialogAlert(app, dataManager.getString("Str_Warning"), "선택된 LPR 리스트가 없습니다.");
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
		grdLprList.deleteRow(parseInt(sms_DeleteLprInfoList.userAttr("rowIndex"), 10));
		sendLprDelete();
	} else {
		comLib.hideLoadMask();
		dataManager = getDataManager();
		//dialogAlert(app, dataManager.getString("Str_Failed"), 
		//	deviceID+ " "+"Lpr 정보 삭제"+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlert(app, dataManager.getString("Str_Failed"), 
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
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_lprRegist"));
		sendGetJawoondaeLprlist();
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_lprRegist"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
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
	var appld = "app/main/jawoondae/lpr/lprRegist" + "?" + JWDLM_version;
	app.openDialog(appld, {width : 400, height : 300}, function(dialog){
		dialog.ready(function(dialogApp){
			dialog.bind("headerTitle").toLanguage("LPR 정보");
			dialog.initValue = {"reqType": 1,"lprInfo":jwdlm_grdevent.getRow(idx).getRowData()};
			dialog.modal = true;
		});
	}).then(function(returnValue){
		
		var result = returnValue["Result"];
		if( result == 0 ){
			var reqType = returnValue["reqType"];
			var lprInfo = returnValue["LprInfo"];
			var dmLprInfo = app.lookup("LprInfo");
			dmLprInfo.build(lprInfo);
			console.log(dmLprInfo.getDatas());
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
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_lprRegist"));
		sendGetJawoondaeLprlist();
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_lprRegist"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
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
