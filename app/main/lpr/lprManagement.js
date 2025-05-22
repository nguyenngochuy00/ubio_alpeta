/************************************************
 * lprManagement.js
 * Created at 2020. 7. 1. 오후 5:44:26.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var pageRowCount = 30;
var LPRMM_version;

function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("LprListPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}
function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("LprListPageIndexer");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	LPRMM_version = dataManager.getSystemVersion();
	
	setPageIndexer(0,1,pageRowCount, 10);
	sendGetLprlist();
}

function sendGetLprlist() {
	app.lookup("LprInfoList").clear(); // 초기화
	
	comLib.showLoadMask("", dataManager.getString("Str_LprManagement"), "", 0);
	var curPageIndex = app.lookup("LprListPageIndexer").currentPageIndex; 
	var offset = (curPageIndex - 1) * pageRowCount;
	//offset, limit 검색기능, 페이징 같은거 추가할꺼 대비해서 만드는것
	var smsGetLprList = app.lookup("sms_getLprInfoList");
	
	var category = app.lookup("LPRMM_cmbCategory").value;
	var keyword = app.lookup("LPRMM_ipbKeyword").value;
	smsGetLprList.setParameters("searchCategory", category);
	smsGetLprList.setParameters("searchKeyword", keyword);
	if (keyword == null || keyword.length == 0) {
		smsGetLprList.setParameters("searchCategory", "");
	}
	// 검색기능 카테고리 추가.
	smsGetLprList.setParameters("offset", offset);
	smsGetLprList.setParameters("limit", pageRowCount);
	smsGetLprList.send();
}

function onSms_getLprInfoListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var totalCount = app.lookup("Total").getValue("Count");
		var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
		
		selectPaging(totalCount, viewPageCount);
	} else {
		dialogAlert(app, "Waning", "LPR 관리 "+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
	
	app.lookup("LPRMM_grpMain").redraw();
}

function onSms_getLprInfoListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getLprInfoListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onLPRMM_btnAddClick(/* cpr.events.CMouseEvent */ e){
var appld = "app/main/lpr/lprRegist" + "?" + LPRMM_version;
	app.openDialog(appld, {width : 400, height : 300}, function(dialog){
		dialog.ready(function(dialogApp){
			dialog.initValue = {"reqType": 0}; // 등록
			dialog.bind("headerTitle").toLanguage("Str_lprRegist");
			dialog.modal = true;
		});
	}).then(function(returnValue){
		var result = returnValue["Result"];
		if( result == 0 ){
			sendGetLprlist(); // 추가된것 표시하기 위해서
		}
	});
}

function onLPRMM_btnDeleteClick(/* cpr.events.CMouseEvent */ e){
	var grdLprList = app.lookup("LPRMM_grdLprList");
	var chkIndices = grdLprList.getCheckRowIndices();
	var total = chkIndices.length;
	
	if( total < 1 ){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedItem"));
		return;
	}
	comLib.showLoadMask("pro",dataManager.getString("Str_LprManagement"),"",chkIndices.length);
	
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
		console.log("lpr delete end");
		comLib.hideLoadMask();
		dataManager = getDataManager();
		return;
	}
	
	var deleteInfo = deleteLprList.getRow(0);
	var deviceID = deleteInfo.getValue("DeviceID");
	
	var msg = "DeviceID"+ " : "+deviceID;
	comLib.updateLoadMask(msg);
	
	var smsdeleteLprInfo = app.lookup("sms_DeleteLprInfoList");
	smsdeleteLprInfo.action = "/v1/lpr/" + deviceID;
	smsdeleteLprInfo.userAttr("deviceID", deviceID.toString());
	smsdeleteLprInfo.userAttr("rowIndex", deleteInfo.getValue("rowIndex").toString());
	smsdeleteLprInfo.send();
}

function onSms_DeleteLprInfoListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var sms_DeleteLprInfoList = e.control;
	var deleteLprList = app.lookup("DeleteLprList");
	deleteLprList.realDeleteRow(0);
	var grdLprList = app.lookup("LPRMM_grdLprList");
	var deviceID=  	sms_DeleteLprInfoList.userAttr("deviceID");
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE || resultCode == COMERROR_USER_NOT_EXIST ){
		grdLprList.deleteRow(parseInt(sms_DeleteLprInfoList.userAttr("rowIndex"), 10));
		sendLprDelete();
	} else {
		comLib.hideLoadMask();
		dataManager = getDataManager();
		dialogAlert(app, dataManager.getString("Str_Failed"), 
			deviceID+ " "+dataManager.getString("Str_lprDelete")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_DeleteLprInfoListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_DeleteLprInfoListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}



/*
 * 그리드에서 row-dblclick 이벤트 발생 시 호출.
 * detail이 row를 더블클릭 한 경우 발생하는 이벤트.
 */
function onLPRMM_grdLprListRowDblclick(/* cpr.events.CGridEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var lPRMM_grdLprList = e.control;
	var idx = lPRMM_grdLprList.getSelectedRowIndex();
	var appld = "app/main/lpr/lprRegist" + "?" + LPRMM_version;
	app.openDialog(appld, {width : 400, height : 300}, function(dialog){
		dialog.ready(function(dialogApp){
			dialog.bind("headerTitle").toLanguage("Str_lprUpdate"); // 제목추가
			dialog.initValue = {"reqType": 1,"DeviceID":lPRMM_grdLprList.getRow(idx).getValue("DeviceID")};
			dialog.modal = true;
		});
	}).then(function(returnValue){
		
		var result = returnValue["Result"];
		if( result == 0 ){
			console.log(returnValue);
			sendGetLprlist(); // 추가된것 표시하기 위해서
		}
	});
}
	
function onLPRMM_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	var pageIndex = app.lookup("LprListPageIndexer");	
	pageIndex.currentPageIndex = 1;
	sendGetLprlist();
}

function onLprListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var lprListPageIndexer = e.control;
	sendGetLprlist();
}

function onLPRMM_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

function onLPRMM_btnGateSetClick(/* cpr.events.CMouseEvent */ e){
	var grdLprList = app.lookup("LPRMM_grdLprList");
	var chkIndices = grdLprList.getCheckRowIndices();
	var total = chkIndices.length;
	
	if( total < 1 ){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_LprListFail"));
		return;
	}
	if(!app.lookup("LPRMM_cmbGateSet").value){
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_LprGateSetNotSelected"));
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
	
	var openRule = app.lookup("Rule");
	openRule.clear();
	openRule.setValue("OpenRule", parseInt(app.lookup("LPRMM_cmbGateSet").value, 10)); // 0, 1, 2
	sendLprGateSet();
}

function sendLprGateSet() {	//sendLprGateSet
	var deleteLprList = app.lookup("DeleteLprList");
	
	if (deleteLprList.getRowCount() == 0 ) {		
		comLib.hideLoadMask();
		sendGetLprlist();
		return;
	}
	
	var deleteInfo = deleteLprList.getRow(0);
	var deviceID = deleteInfo.getValue("DeviceID");
	
	var msg = "DeviceID"+ " : "+deviceID;
	comLib.updateLoadMask(msg);
	
	var smsPutLprGateSet = app.lookup("sms_putLprGateSet");
	smsPutLprGateSet.action = "/v1/lpr/gateSet/" + deviceID;
	smsPutLprGateSet.userAttr("deviceID", deviceID.toString());
	smsPutLprGateSet.userAttr("rowIndex", deleteInfo.getValue("rowIndex").toString());
	smsPutLprGateSet.send();
}

function onSms_putLprGateSetSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var smsputLprGateSetList = e.control;
	var deleteLprList = app.lookup("DeleteLprList");
	deleteLprList.realDeleteRow(0);
	var grdLprList = app.lookup("LPRMM_grdLprList");
	
	var deviceID=  	smsputLprGateSetList.userAttr("deviceID");
	
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE || resultCode == COMERROR_USER_NOT_EXIST ){		
		sendLprGateSet();
	} else {
		comLib.hideLoadMask();
		dataManager = getDataManager();
		dialogAlert(app, dataManager.getString("Str_Failed"), 
			deviceID+ " "+dataManager.getString("Str_LprGateSetting")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_putLprGateSetSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_putLprGateSetSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
