/************************************************
 * TerminalManagement.js
 * Created at 2018. 11. 16. 오후 3:16:52.
 *
 * @author wonki
 ************************************************/

var TMMGR_common;
var TMMGR_gridUtil = createGridUtil(app);

var TMMGR_pageRowCount = 20;
var TMMGR_deleteIndices;
var TMMGR_bPageChange = false;
var usint_version;
var dataManager;
var comLib;
var TMMGR_brandType;
var groupCode;

var NSH_DEV_CODE = 0;
var ENABLE_MCP040 = 0;

function onBodyLoad(/* cpr.events.CEvent */ e){

	comLib = createComUtil(app);
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	var groupList = dataManager.getGroup();
	NSH_DEV_CODE = dataManager.getNSH_DEV_CODE();
	ENABLE_MCP040 = dataManager.getENABLE_MCP040();
	groupCode = getLoginUserGroupCode();

	TMMGR_brandType = dataManager.getSystemBrandType();

	var udcTerminalList = app.lookup("TMMGR_udcTerminalList");
	udcTerminalList.setPaging(0,1,10,TMMGR_pageRowCount);
	udcTerminalList.deleteColumn([11]);
	udcTerminalList.setGroupList(groupList);

	var initValue = app.getHost().initValue;
	var dsGroupList = app.lookup("GroupList");

	groupList.copyToDataSet(dsGroupList);
	var treGroup = app.lookup("TMMGR_treGroup");
	treGroup.expandAllItems();
	treGroup.selectItemByValue(groupCode);
	treGroup.focusItem(treGroup.getSelectionFirst());
	treGroup.redraw();

	//sendTerminalListRequest();
}

// 단말기 리스트 요청
function sendTerminalListRequest(initPage) {
	var dsTerminalList = app.lookup("TerminalList");
	dsTerminalList.clear();
	var udcTerminalList = app.lookup("TMMGR_udcTerminalList");
	if (initPage) udcTerminalList.setCurrentPageIndex(1);
	var curIndex = udcTerminalList.getCurrentPageIndex();

	var offset = (curIndex - 1) * TMMGR_pageRowCount;
	//console.log(curIndex, offset);

	var searchCtrl = app.lookup("TMMGR_udcSearchTerminal")
	var smsGetTerminalList = app.lookup("sms_getTerminalList");

	smsGetTerminalList.setParameters("searchCategory", searchCtrl.searchCategory);
	smsGetTerminalList.setParameters("searchKeyword", searchCtrl.searchKeyword);
	if( searchCtrl.searchKeyword != undefined && searchCtrl.searchKeyword.length > 0 ){
		smsGetTerminalList.setParameters("searchCategory", searchCtrl.searchCategory);
	}else{
		smsGetTerminalList.setParameters("searchCategory", "");
	}

	var groupList = app.lookup("TMMGR_treGroup");
	var group = groupList.getSelectionFirst();
	if (group != undefined && group.value != "") {
		smsGetTerminalList.setParameters("groupID", parseInt(group.value, 10));
	} else {
		smsGetTerminalList.setParameters("groupID", 0);
	}
	smsGetTerminalList.setParameters("subInclude", "true");

	smsGetTerminalList.setParameters("offset", offset);
	smsGetTerminalList.setParameters("limit", TMMGR_pageRowCount);

	smsGetTerminalList.send();
}

// 단말기 리스트 가져오기 완료
function onSms_getTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var value = result.getValue("ResultCode");

	if( result.getValue("ResultCode")== COMERROR_NONE) { // 성공
		var dsTerminalList = app.lookup("TerminalList");

		var dmTotal = app.lookup("Total");
		var totalCount = parseInt( dmTotal.getValue("Count"));
		app.lookup("TMMGR_lbTotal").redraw();

		var viewPageCount = totalCount/TMMGR_pageRowCount + (totalCount%TMMGR_pageRowCount>0);
		if( viewPageCount > 10 ) {
			viewPageCount = 10;
		}
		var udcTerminalList = app.lookup("TMMGR_udcTerminalList");
		udcTerminalList.setTerminalList(dsTerminalList);
		udcTerminalList.setPaging(totalCount, TMMGR_pageRowCount, viewPageCount);
		udcTerminalList.redraw();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_TerminalListLoadingFailed"));
	}
}

// 단말기 리스트 가져오기 에러
function onSms_getTerminalListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 단말기 리스트 가져오기 타임아웃
function onSms_getTerminalListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 단말기 리스트 페이지 변경
function onTMMGR_udcTerminalListPagechange(/* cpr.events.CSelectionEvent */ e){
	sendTerminalListRequest(); // 서버에 새로운 페이지의 단말 리스트 요청
}

// 단말기 검색 클릭
function onTM_MGR_udcSearchTerminalSearch(/* cpr.events.CUIEvent */ e){
	var TMMGR_udcTerminalList = app.lookup("TMMGR_udcTerminalList");
	TMMGR_udcTerminalList.setCurrentPageIndex(1);
	sendTerminalListRequest(); // 서버에 검색 조건에 따른 단말 리스트 요청
}

function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		var TMMGR_udcTerminalList = app.lookup("TMMGR_udcTerminalList");
		TMMGR_udcTerminalList.setCurrentPageIndex(1);
		sendTerminalListRequest(); // 서버에 검색 조건에 따른 단말 리스트 요청		
	}
}

// ??
function onTMMGR_udcTerminalListTerminalInfo(/* cpr.events.CGridEvent */ e){
	/** @type udc.grid.terminalList */
	console.log("check this");
    var tMMGR_udcTerminalList = e.control;
    var path;
	if( TMMGR_brandType == BRAND_VRIDI) {
		path = "app/main/terminals/optionVirdi/terminalVInfoFrame"
	} else {
		var tInfo = e.row.getRowData();

		switch (parseInt(tInfo["Type"],10)) {
			case 22:
				path = "app/main/terminals/T9/OptionFrame"
				break;

			case 6:
				path = "app/main/terminals/NAC5000/OptionFrame"
				break;
		}
	}

	//console.log(path);
	path = path + "?" + usint_version;
	app.getRootAppInstance().openDialog(path, {width: 1100, height: 600}, function(dialog){
		dialog.initValue = e.row.getRowData();
		dialog.style.header.css("background-color", "#528443");
		dialog.modal = false;
	}).then(function(input){
		;
	});
}

// 그룹 선택 변경시
function onTMMGR_treGroupSelectionChange(/* cpr.events.CSelectionEvent */ e){	
//	if(!isSuperGroupAdmin()) { // 22년도에는 1뎁스에 상위부서 관리자는 Master와 동일
//		var selectTree = app.lookup("TMMGR_treGroup").getSelectionFirst().value;
//		if (selectTree != groupCode && selectTree != 0){  // 다른 부서를 누를 경우
//			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PrivilegeAlert"));
//			app.lookup("TMMGR_treGroup").selectItemByValue(groupCode);
//		} else {					// 본인의 부서, 전체
//			sendTerminalListRequest();	
//		}	
//	} else { // Master일 경우
//		sendTerminalListRequest();	
//	}	
	
	// 24년도부터 Master 제외한 각 부서의 관리자는 본인 부서 및 하위 부서만 관리 가능
	if(!isLoginMaster()){
		var seletedID = app.lookup("TMMGR_treGroup").getSelectionFirst().value;
		if (!isAccessibleGroup(seletedID)){
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PrivilegeAlert"));
			app.lookup("TMMGR_treGroup").selectItemByValue(groupCode);
			return;
		}		
	}
	sendTerminalListRequest();
}

// 단말 리스트 더블 클릭시
function onTMMGR_udcTerminalListTerminalListDblclick(/* cpr.events.CGridEvent */ e){
	var selectTree = app.lookup("TMMGR_treGroup").getSelectionFirst().value;
	if(!isSuperGroupAdmin() && selectTree == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "부서 내에서 선택해야 합니다.");
		app.lookup("TMMGR_treGroup").selectItemByValue(groupCode);
		return;
	}	
	
	var path = "app/custom/rokmch/areaNDeviceManagement/terminalVInfoFrame"

	app.openDialog(path, {width : 1024, height : 630}, function(dialog){
		dialog.headerTitle = "장비 정보";
		dialog.modal = true;	
		dialog.initValue = {"TerminalID": e.row.getRowData()["ID"]};
		//dialog.style.header.css("background-color", "#528443");
	}).then(function(returnValue){
	});
}

// 단말기 추가 버튼 클릭시
function onTMMGR_btnRegistTerminalClick(/* cpr.events.CMouseEvent */ e){
	var appld = "app/custom/rokmch/areaNDeviceManagement/TerminalRegist" + "?" + usint_version;
	app.openDialog(appld, {width : 300, height : 220}, function(dialog){
		dialog.bind("headerTitle").toLanguage("Str_TerminalRegist");
		dialog.style.header.css("background-color", "#528443");
		dialog.modal = true;
	}).then(function(returnValue){

		var result = returnValue["Result"];
		if( result == 0 ){
			var terminalInfo = returnValue["TerminalInfo"];
			var dmTerminalInfo = app.lookup("TerminalInfo");
			dmTerminalInfo.setValue("ID", terminalInfo.ID);
			dmTerminalInfo.setValue("Name", terminalInfo.Name);
			dmTerminalInfo.setValue("Description", terminalInfo.Description);
//			dmTerminalInfo.setValue("GroupCode", groupCode);
			dmTerminalInfo.setValue("GroupCode", terminalInfo.GroupCode);

			var sms_postTerminal = app.lookup("sms_postTerminal");
			sms_postTerminal.send();
		}
	});
}

// 단말기 등록 완료
function onSms_postTerminalSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
		// 단말기 추가 정보 메모리 Add
		var dmTerminalInfo  = app.lookup("TerminalInfo"); // id, name
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_TerminalRegist"));
		
		sendTerminalListRequest();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 단말기 등록 에러
function onSms_postTerminalSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 단말기 등록 타임아웃
function onSms_postTerminalSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 도움말 페이지
function onTMMGR_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

// 단말기 삭제 버튼 클릭
function onTM_MGR_btnDeleteTerminalClick(/* cpr.events.CMouseEvent */ e){
	var udcTerminalList = app.lookup("TMMGR_udcTerminalList")
	var chkIndices = udcTerminalList.getCheckedRowIndices();	
	var total = chkIndices.length;
	var selectTree = app.lookup("TMMGR_treGroup").getSelectionFirst().value;
	if(!isSuperGroupAdmin() && selectTree == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "부서 내에서 삭제해야 합니다.");
		app.lookup("TMMGR_treGroup").selectItemByValue(groupCode);
		return;
	}	
	
	
	if( total < 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedTerminals"));
		return;
	}
	
	dialogConfirmAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_DeleteConfirm"), function(/*cpr.controls.Dialog*/dialog){
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				
				var srcCount = udcTerminalList.getRowCount();
				if( total == srcCount ){ // 화면에 보이는 모든 데이터를 삭제한 경우 첫 페이지로 이동
					TMMGR_bPageChange = true;
				} else {
					TMMGR_bPageChange = false;
				}
			
				var dsTerminalIDList = app.lookup("TerminalIDList");
				dsTerminalIDList.clear();
				for( var i = 0; i < total; i++ ){
					var row = udcTerminalList.getRow(chkIndices[i]);
					dsTerminalIDList.addRowData({"ID":row.getValue("ID")});
				}
				dsTerminalIDList.commit();
			
				comLib.showLoadMask("pro", dataManager.getString("Str_Data")+" "+dataManager.getString("Str_Sync"), "", total);
				sendTerminalDelete();
							
			} else {
				return;
			}
		});
	});
	
	
}

function sendTerminalDelete(){
	var dsTerminalIDList = app.lookup("TerminalIDList");
	var row = dsTerminalIDList.getRow(0);
	if( row ){
		var terminalID = row.getValue("ID")
		//dsTerminalIDList.deleteRow(0);
		dsTerminalIDList.commit();

		var dmResult = app.lookup("Result");
		var sms_deleteTerminal =  new cpr.protocols.Submission("sms_deleteTerminal");
		sms_deleteTerminal.setParameters("id", terminalID);
		sms_deleteTerminal.method = "delete";
		sms_deleteTerminal.mediaType = "application/x-www-form-urlencoded";
		sms_deleteTerminal.action = "/v1/terminals/"+terminalID;
		//sms_deleteTerminal.userAttr("rowIndex", row.getValue("rowIndex").toString());
		sms_deleteTerminal.addResponseData(dmResult);
		sms_deleteTerminal.addEventListenerOnce("submit-done", onSms_deleteTerminalSubmitDone);
		sms_deleteTerminal.addEventListenerOnce("submit-error", onSms_deleteTerminalSubmitError);
		sms_deleteTerminal.addEventListenerOnce("submit-timeout", onSms_deleteTerminalSubmitTimeout);

		sms_deleteTerminal.send();
	} else {
		comLib.hideLoadMask();
	}
}

// 단말기 삭제 완료
function onSms_deleteTerminalSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var finished = false;
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		
		var dsTerminalIDList = app.lookup("TerminalIDList");
		var row = dsTerminalIDList.getRow(0);
		var terminalID = row.getValue("ID")
		dsTerminalIDList.realDeleteRow(0);
		//var gridTerminalList = app.lookup("TMMGR_udcTerminalList");
		//gridTerminalList.deleteRow(terminalID);
		
		
		var dsTerminalIDList = app.lookup("TerminalIDList");
		var total = dsTerminalIDList.getRowCount();
		if( total > 0 ){
			comLib.updateLoadMask("");
			sendTerminalDelete();
		} else {
			finished = true;
			comLib.hideLoadMask();
			dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_TerminalDelete"));
			if( TMMGR_bPageChange ){ // 화면에 보이는 모든 데이터를 삭제한 경우 첫 페이지로 이동
				TMMGR_bPageChange = false;
				sendTerminalListRequest(1);
			}		
		}
	} else {
		finished = true;

		//var sms_deleteTerminal = app.lookup("sms_deleteTerminal");
		//var terminalID = sms_deleteTerminal.getParameters("id");
		comLib.hideLoadMask();
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_TerminalDelete"));
	}

	if( finished == true ){
		sendTerminalListRequest();
	}

}

// 단말기 삭제 에러
function onSms_deleteTerminalSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 단말기 삭제 타임아웃
function onSms_deleteTerminalSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// ---------------------- 동기화 함수  ------------------------->>
// 사용자 삭제 결과 콜백. 별도 오픈된 사용자 정보창에서 사용자 삭제시 발생.
exports.onTerminalUpdateSync = function( terminalInfo){
	var udcTerminalList = app.lookup("TMMGR_udcTerminalList");
	udcTerminalList.updateTerminalInfo(terminalInfo);
}
// 사용자 삭제 결과 콜백. 별도 오픈된 사용자 정보창에서 사용자 삭제시 발생.
exports.onTerminalDeleteSync = function( terminalID ){
	var udcTerminalList = app.lookup("TMMGR_udcTerminalList");
	udcTerminalList.deleteTerminal(terminalID);
	dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_TerminalDelete"));
}
// <<---------------------- 동기화 함수  -------------------------