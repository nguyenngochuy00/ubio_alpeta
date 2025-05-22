/************************************************
 * tabletManagement.js
 * Created at 2024. 10. 16. 오후 5:07:52.
 *
 * @author A
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;


function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	comLib.showLoadMask("", "태블릿 관리", "", 0);
	app.lookup("sms_getTabletInfoList").send();
	
}

function onSms_getTabletInfoListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getTabletInfoListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onSms_getTabletInfoListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	comLib.hideLoadMask();
	if(resultCode == COMERROR_NONE){
		app.lookup("AMTM_optTotal").redraw();
		app.lookup("AMTM_grdTabletList").redraw();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}


function onAMTM_btnDeleteClick(/* cpr.events.CMouseEvent */ e){
	var grdTabletList = app.lookup("AMTM_grdTabletList");
	var chkIndices = grdTabletList.getCheckRowIndices();
	var total = chkIndices.length;
	
	if( total < 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "선택된 태블릿이 없습니다.");
		return;
	}
	comLib.showLoadMask("pro","태블릿 관리","",chkIndices.length);
	
	var deleteTabletList = app.lookup("DelTabletList");
	deleteTabletList.clear();
	
	for( var i = 0; i < total; i++){
		var delIndex = chkIndices[i];
		var deltablet = {"TabletID":grdTabletList.getRow(delIndex).getValue("ID"),"RowIndex":delIndex};
		deleteTabletList.addRowData(deltablet);
	}
	sendTabletDelete();
}

function sendTabletDelete() {// Delete
	var deleteTabletList = app.lookup("DelTabletList");
	
	if (deleteTabletList.getRowCount() == 0 ) {
		comLib.hideLoadMask();
		return;
	}
	
	var deleteInfo = deleteTabletList.getRow(0);
	var tabletID = deleteInfo.getValue("TabletID");
	
	var msg = "TabletID"+ " : "+tabletID;
	comLib.updateLoadMask(msg);
	
	var smsdeleteTablet = app.lookup("sms_deleteTablet");
	smsdeleteTablet.action = "/v1/armyhq/tablet/" + tabletID;
	smsdeleteTablet.userAttr("tabletID", tabletID.toString());
	smsdeleteTablet.userAttr("rowIndex", deleteInfo.getValue("RowIndex").toString());
	smsdeleteTablet.send();
}


function onSms_deleteTabletSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}


function onSms_deleteTabletSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


function onSms_deleteTabletSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var sms_DeleteTablet = e.control;
	var deleteTabletList = app.lookup("DelTabletList");
	deleteTabletList.realDeleteRow(0);
	var grdTabletList = app.lookup("AMTM_grdTabletList");
	var tabletID = sms_DeleteTablet.userAttr("deviceID");
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), "태블릿 정보 삭제 성공");
		grdTabletList.deleteRow(parseInt(sms_DeleteTablet.userAttr("rowIndex"), 10));
		grdTabletList.commitData();
		sendTabletDelete();
	} else {
		comLib.hideLoadMask();
		dataManager = getDataManager();
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), 
			tabletID+ " "+"태블릿 정보 삭제"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
}
