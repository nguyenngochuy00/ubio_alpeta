/************************************************
 * TerminalUserEx.js
 * Created at 2021. 5. 6. 오전 11:05:40.
 *
 * @author fois
 ************************************************/
var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var TMURE_pageRowCount = 50;

var selectUserIDMap;
var selectTerminalIDMap;
var oem_version;
function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("TMURE_piSrcUserList");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}

function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("TMURE_piSrcUserList");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = TMURE_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = 3;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	oem_version = dataManager.getOemVersion();
	selectUserIDMap = new Map();
	selectTerminalIDMap = new Map();
	
	//---> 그룹이 아닌 단말기가 로그 on/off 됬을때 그룹코드 값이 "" 처리되 보여지는 현상 수정  - otk
	var Loginuserinfo = dataManager.getAccountInfo();
	var Loginuserid = Loginuserinfo.getValue("UserID");
	var LoginPrivilege = Loginuserinfo.getValue("Privilege");
	//<--- 
	
	// 대전시청 확장기능 사용
	
	setPageIndexer(0,1,TMURE_pageRowCount,3);
	
	var dsTerminalList = dataManager.getTerminalList();
	if (oem_version == OEM_REMOTE_FAW_MANAGEMENT){ // 유사얼굴체크용 단말기 제외
		dsTerminalList = dataManager.getAuthTerminalList(false);
	}
	var dsSrcTerminalList = app.lookup("SrcTerminalList");
		
	var rowCount = dsTerminalList.getRowCount();
	for (var i=0; i < rowCount; i++) {		
		var rowData = dsTerminalList.getRow(i);
		var status = rowData.getValue("Status");
		var group = rowData.getValue("GroupCode");
		
		if(Loginuserid != 1000000000000000000 && LoginPrivilege != 1) {
			if(group == "") { // 그룹이 아닌 단말기가 로그 on/off 됬을때 그룹코드 값이 "" 처리되 보여지는 현상 수정  - otk
				continue;
			} else {
				var connStatus = checkTerminalConnectionStatus(status);		
				if (connStatus == 3) {
					dsSrcTerminalList.addRowData(rowData.getRowData());
				}
			}
		}
		else {
			var connStatus = checkTerminalConnectionStatus(status);		
			if (connStatus == 3) {
				dsSrcTerminalList.addRowData(rowData.getRowData());
			}
		}
	}
	dsSrcTerminalList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	
	if (oem_version == OEM_DJMCITYHALL) { // 대전시청 
		var initValue = app.getHost().initValue;
		var eduTerminals = initValue["initType"]; //교육 전송이다.
		//console.log(eduTerminals);
		if (eduTerminals != null && eduTerminals == "eduTerminals" ) {
			var strTerminalArray = initValue["termials"];
			var useTerminals = strTerminalArray.split(',');
			//console.log(useTerminals);	
			dsSrcTerminalList.clear(); // 초기화
			for (var i=0;i< useTerminals.length;i++) { // 교육 담당 단말기 리스트
				var useTID = parseInt(useTerminals[i]);
				//console.log("useTID : " + useTID);
				var dmTerminal = dataManager.getTerminal(useTID);
				//console.log(dmTerminal.getRowData());
				var status = dmTerminal.getValue("Status");
				//console.log("status : " + status);
				var connStatus = checkTerminalConnectionStatus(status);		
				if (connStatus == 3) {
					dsSrcTerminalList.addRowData(dmTerminal.getRowData());
				}
			}
			
		}
	}
	var groupList = dataManager.getGroup();
	if( groupList && groupList.getRowCount()>0){
		var cmbGroup = app.lookup("userListGrid_cmbGroup");
		var cmbGroup1 = app.lookup("userListGrid_cmbGroup1");
		var count = groupList.getRowCount();
		for ( var i = 0; i < count; i++ ){			
			var groupInfo = groupList.getRow(i);						
			cmbGroup.addItem(new cpr.controls.Item(groupInfo.getValue("Name"),groupInfo.getValue("GroupID")));
			cmbGroup1.addItem(new cpr.controls.Item(groupInfo.getValue("Name"),groupInfo.getValue("GroupID")));
		}				
	}
	
	sendUserListRequest();
}

function sendUserListRequest() {
	comLib.showLoadMask("",dataManager.getString("Str_UserListGet"),"",0);

	var cmbUserCategory = app.lookup("TMURE_cmbUserCategory");
	var ipbUserKeyword = app.lookup("TMURE_ipbUserKeyword");
	
	var piSrcUserList = app.lookup("TMURE_piSrcUserList");
	var curIndex = piSrcUserList.currentPageIndex;
	var offset = (curIndex - 1) * TMURE_pageRowCount
	
	var smsGetUserList = new cpr.protocols.Submission("sms_getUserList");	 
	smsGetUserList.action = "/v1/users";
	smsGetUserList.method = "get";
	smsGetUserList.mediaType = "application/x-www-form-urlencoded";
		
	smsGetUserList.addEventListenerOnce("submit-done", onSms_getUserListSubmitDone);
	smsGetUserList.addEventListenerOnce("submit-error", onSubmitError);
	smsGetUserList.addEventListenerOnce("submit-timeout", onSubmitTimeout);
		
	smsGetUserList.setParameters("offset", offset);
	smsGetUserList.setParameters("limit", TMURE_pageRowCount);	
	
	if(cmbUserCategory.value != 0 ){
		smsGetUserList.setParameters("searchCategory", cmbUserCategory.value);
	}else{
		smsGetUserList.setParameters("searchCategory", "");
	}
	if(ipbUserKeyword.value != null && ipbUserKeyword.value.length != 0 ){
		smsGetUserList.setParameters("searchKeyword", ipbUserKeyword.value);
	} else{
		smsGetUserList.setParameters("searchKeyword", "");
	}
	
	smsGetUserList.addResponseData(app.lookup("Result"), false, "Result");
	smsGetUserList.addResponseData(app.lookup("Total"), false, "Total");
	smsGetUserList.addResponseData(app.lookup("SrcUserList"), false, "UserList");
	
	smsGetUserList.send();
}

function onTMURE_piSrcUserListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	sendUserListRequest();
}

function onSubmitError(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

function onSms_getUserListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		
		var pageIndexer = app.lookup("TMURE_piSrcUserList");
		var total = app.lookup("Total").getValue("Count");
		var viewPageCount = total / TMURE_pageRowCount + (total % TMURE_pageRowCount > 0);
		pageIndexer.totalRowCount = total;
		selectPaging(total, viewPageCount);
	} else {				
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}	
}

function onTMURE_cbxUserAllValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** @type cpr.controls.CheckBox	 */
	var tMURE_cbxUserAll = e.control;
	var dmAllFlag = app.lookup("AllFlag");
	if( e.newValue == "true" ){
		dmAllFlag.setValue("UserAll", "true");
		app.lookup("TMURE_grdSrcUserList").enabled = false;
		app.lookup("TMURE_grdDesUserList").enabled = false;		
		app.lookup("TMURE_btnUserAdd").enabled = false;
		app.lookup("TMURE_btnUserRemove").enabled = false;
		app.lookup("TMURE_btnUserAddAll").enabled = false;
		app.lookup("TMURE_btnUserRemoveAll").enabled = false;		
	}else{
		dmAllFlag.setValue("UserAll", "false");
		app.lookup("TMURE_grdSrcUserList").enabled = true;
		app.lookup("TMURE_grdDesUserList").enabled = true;
		app.lookup("TMURE_btnUserAdd").enabled = true;
		app.lookup("TMURE_btnUserRemove").enabled = true;
		app.lookup("TMURE_btnUserAddAll").enabled = true;
		app.lookup("TMURE_btnUserRemoveAll").enabled = true;
	}
}

function onTMURE_btnUserAddClick(/* cpr.events.CMouseEvent */ e){	
	var grdSrcUserList = app.lookup("TMURE_grdSrcUserList");
	var dsSrcUserList = app.lookup("SrcUserList");
	
	var indices = grdSrcUserList.getCheckRowIndices();	
	if( indices.length == 0){
		return;
	}
	var grdDesUserList = app.lookup("TMURE_grdDesUserList");	
	var dsDesUserList = app.lookup("DesUserList");
		
	indices.forEach(function(index){		
		var row = grdSrcUserList.getRow(index);		
		var userID = row.getValue("ID");
				
		if( selectUserIDMap.get(userID) == undefined ){				
			dsDesUserList.addRowData(row.getRowData());
			
			selectUserIDMap.set(userID,1);
			grdSrcUserList.deleteRow(row.getIndex())
		}
	});
	
	indices.forEach(function(idx){
		grdSrcUserList.setCheckRowIndex(idx, false);		
	});
	
	dsDesUserList.setSort("ID");
	
	var total = dsSrcUserList.getRowCount();
	for ( var i = 0; i < total; i++){		
		var row = dsSrcUserList.getRow(i);		
		
		if (row){
			var userID = row.getValue("ID");
			if( selectUserIDMap.get(userID) != undefined ){
				dsSrcUserList.setRowState(i,cpr.data.tabledata.RowState.DELETED);	
			} else {				
				dsSrcUserList.setRowState(i,cpr.data.tabledata.RowState.UNCHANGED);
			}
		} 
	}
	grdSrcUserList.redraw();
}
function onTMURE_btnUserAddAllClick(/* cpr.events.CMouseEvent */ e){	
	var grdSrcUserList = app.lookup("TMURE_grdSrcUserList");
	var dsSrcUserList = app.lookup("SrcUserList");
		
	var grdDesUserList = app.lookup("TMURE_grdDesUserList");	
	var dsDesUserList = app.lookup("DesUserList");
	
	var count = dsSrcUserList.getRowCount();	
	for( var index = 0; index < count; index++){		
		var row = grdSrcUserList.getRow(index);		
		var userID = row.getValue("ID");
				
		if( selectUserIDMap.get(userID) == undefined ){				
			dsDesUserList.addRowData(row.getRowData());
			
			selectUserIDMap.set(userID,1);
			grdSrcUserList.deleteRow(row.getIndex())
		}
		grdSrcUserList.setCheckRowIndex(index, false);
	}
	
	dsDesUserList.setSort("ID");
	
	var total = dsSrcUserList.getRowCount();
	for ( var i = 0; i < total; i++){		
		var row = dsSrcUserList.getRow(i);		
		
		if (row){
			var userID = row.getValue("ID");
			if( selectUserIDMap.get(userID) != undefined ){
				dsSrcUserList.setRowState(i,cpr.data.tabledata.RowState.DELETED);	
			} else {				
				dsSrcUserList.setRowState(i,cpr.data.tabledata.RowState.UNCHANGED);
			}
		} 
	}
	grdSrcUserList.redraw();
}

function onTMURE_btnUserRemoveClick(/* cpr.events.CMouseEvent */ e){	
	var grdSrcUserList = app.lookup("TMURE_grdSrcUserList");
	var dsDesUserList = app.lookup("DesUserList");
	
	var grdDesUserList = app.lookup("TMURE_grdDesUserList");
	var indices = grdDesUserList.getCheckRowIndices();
	if( indices.length == 0){
		return;
	}
	
	var idList = [];
	indices.forEach(function(index){
		var row = grdDesUserList.getRow(index);		
		var userID = row.getValue("ID");
			
		selectUserIDMap.delete(userID);
		idList.push(userID);
	});
		
	idList.forEach(function(userID){						
		var delRow = dsDesUserList.findFirstRow("ID == "+userID)
		dsDesUserList.realDeleteRow(delRow.getIndex());
	});
	
	var dsSrcUserList = app.lookup("SrcUserList");
	var total = dsSrcUserList.getRowCount();
	for ( var i = 0; i < total; i++){		
		var row = dsSrcUserList.getRow(i);		
		
		if (row){
			var userID = row.getValue("ID");
			if( selectUserIDMap.get(userID) != undefined ){
				dsSrcUserList.setRowState(i,cpr.data.tabledata.RowState.DELETED);	
			} else {				
				dsSrcUserList.setRowState(i,cpr.data.tabledata.RowState.UNCHANGED);
			}
		} 
	}
	grdSrcUserList.redraw();
}
function onTMURE_btnUserRemoveAllClick(/* cpr.events.CMouseEvent */ e){	
	var grdSrcUserList = app.lookup("TMURE_grdSrcUserList");
	var dsDesUserList = app.lookup("DesUserList");
	
	var grdDesUserList = app.lookup("TMURE_grdDesUserList");
	var dsSrcUserList = app.lookup("SrcUserList");
		
	var count = dsDesUserList.getRowCount();
	for( var index = 0; index < count; index++ ){
		var row = grdDesUserList.getRow(index);		
		var userID = row.getValue("ID");
			
		selectUserIDMap.delete(userID);
		dsDesUserList.deleteRow(index);		
	}
	dsDesUserList.commit();
	
	var total = dsSrcUserList.getRowCount();
	for ( var i = 0; i < total; i++){		
		var row = dsSrcUserList.getRow(i);		
		
		if (row){
			var userID = row.getValue("ID");
			if( selectUserIDMap.get(userID) != undefined ){
				dsSrcUserList.setRowState(i,cpr.data.tabledata.RowState.DELETED);	
			} else {				
				dsSrcUserList.setRowState(i,cpr.data.tabledata.RowState.UNCHANGED);
			}
		} 
	}
	grdSrcUserList.redraw();
}

function onTMURE_cbxTerminalAllValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** @type cpr.controls.CheckBox	 */
	var tMURE_cbxTerminalAll = e.control;
	var dmAllFlag = app.lookup("AllFlag");
		
	if( e.newValue == "true" ){
		dmAllFlag.setValue("TerminalAll", "true");
		app.lookup("TMURE_grdSrcTerminalList").enabled = false;
		app.lookup("TMURE_grdDesTerminalList").enabled = false;	
		app.lookup("TMURE_btnTerminalAdd").enabled = false;
		app.lookup("TMURE_btnTerminalRemove").enabled = false;
		app.lookup("TMURE_btnTerminalAddAll").enabled = false;
		app.lookup("TMURE_btnTerminalRemoveAll").enabled = false;	
	}else{
		dmAllFlag.setValue("TerminalAll", "false");
	
		app.lookup("TMURE_grdSrcTerminalList").enabled = true;
		app.lookup("TMURE_grdDesTerminalList").enabled = true;
		app.lookup("TMURE_btnTerminalAdd").enabled = true;
		app.lookup("TMURE_btnTerminalRemove").enabled = true;
		app.lookup("TMURE_btnTerminalAddAll").enabled = true;
		app.lookup("TMURE_btnTerminalRemoveAll").enabled = true;	
	}	
}

function onTMURE_btnTerminalAddClick(/* cpr.events.CMouseEvent */ e){
	
	//console.log("onTMURE_btnTerminalAddClick1");
	
	var grdSrcTerminalList = app.lookup("TMURE_grdSrcTerminalList");
	var dsSrcTerminalList = app.lookup("SrcTerminalList");
	var indices = grdSrcTerminalList.getCheckRowIndices();	
	if( indices.length == 0){
		return;
	}
	
	//console.log("onTMURE_btnTerminalAddClick2");
	
	var grdDesTerminalList = app.lookup("TMURE_grdDesTerminalList");	
	var dsDesTerminalList = app.lookup("DesTerminalList");
		
	indices.forEach(function(index){		
		var row = grdSrcTerminalList.getRow(index);		
		var terminalID = row.getValue("ID");
		
		//console.log("onTMURE_btnTerminalAddClick3");
				
		if( selectTerminalIDMap.get(terminalID) == undefined ){				
			dsDesTerminalList.addRowData(row.getRowData());
			
			selectTerminalIDMap.set(terminalID,1);
			grdSrcTerminalList.deleteRow(row.getIndex())
		}
		grdSrcTerminalList.setCheckRowIndex(index, false);
	});
		
	dsDesTerminalList.setSort("ID");
	
	//console.log("onTMURE_btnTerminalAddClick4");
	
	var total = dsSrcTerminalList.getRowCount();
	for ( var i = 0; i < total; i++){		
		var row = dsSrcTerminalList.getRow(i);		
		
		if (row){
			var terminalID = row.getValue("ID");
			if( selectTerminalIDMap.get(terminalID) != undefined ){
				dsSrcTerminalList.setRowState(i,cpr.data.tabledata.RowState.DELETED);	
			} else {				
				dsSrcTerminalList.setRowState(i,cpr.data.tabledata.RowState.UNCHANGED);
			}
		} 
	}
	
	//console.log("onTMURE_btnTerminalAddClick5");
	
	grdSrcTerminalList.redraw();
}
function onTMURE_btnTerminalAddAllClick(/* cpr.events.CMouseEvent */ e){	
	var grdSrcTerminalList = app.lookup("TMURE_grdSrcTerminalList");
	var dsSrcTerminalList = app.lookup("SrcTerminalList");
		
	var grdDesTerminalList = app.lookup("TMURE_grdDesTerminalList");	
	var dsDesTerminalList = app.lookup("DesTerminalList");
	
	var count = dsSrcTerminalList.getRowCount();	
	for( var index = 0; index < count; index++){		
		var row = dsSrcTerminalList.getRow(index);		
		var terminalID = row.getValue("ID");
				
		if( selectTerminalIDMap.get(terminalID) == undefined ){				
			dsDesTerminalList.addRowData(row.getRowData());
			
			selectTerminalIDMap.set(terminalID,1);
			dsSrcTerminalList.deleteRow(row.getIndex())
		}
		grdSrcTerminalList.setCheckRowIndex(index, false);
	}
	
	dsDesTerminalList.setSort("ID");
	
	var total = dsSrcTerminalList.getRowCount();
	for ( var i = 0; i < total; i++){		
		var row = dsSrcTerminalList.getRow(i);		
		
		if (row){
			var userID = row.getValue("ID");
			if( selectTerminalIDMap.get(userID) != undefined ){
				dsSrcTerminalList.setRowState(i,cpr.data.tabledata.RowState.DELETED);	
			} else {				
				dsSrcTerminalList.setRowState(i,cpr.data.tabledata.RowState.UNCHANGED);
			}
		} 
	}
	grdSrcTerminalList.redraw();
}

function onTMURE_btnTerminalRemoveClick(/* cpr.events.CMouseEvent */ e){
	var grdSrcTerminalList = app.lookup("TMURE_grdSrcTerminalList");
	var dsSrcTerminalList = app.lookup("SrcTerminalList");
	
	var grdDesTerminalList = app.lookup("TMURE_grdDesTerminalList");
	var dsDesTerminalList = app.lookup("DesTerminalList");	
	
	var indices = grdDesTerminalList.getCheckRowIndices();
	if( indices.length == 0){
		return;
	}
	
	var idList = [];
	indices.forEach(function(index){
		var row = grdDesTerminalList.getRow(index);		
		var userID = row.getValue("ID");
			
		selectTerminalIDMap.delete(userID);
		idList.push(userID);
	});
		
	idList.forEach(function(userID){						
		var delRow = dsDesTerminalList.findFirstRow("ID == "+userID)
		dsDesTerminalList.realDeleteRow(delRow.getIndex());
	});
	
	
	var total = dsSrcTerminalList.getRowCount();
	for ( var i = 0; i < total; i++){		
		var row = dsSrcTerminalList.getRow(i);		
		
		if (row){
			var userID = row.getValue("ID");
			if( selectTerminalIDMap.get(userID) != undefined ){
				dsSrcTerminalList.setRowState(i,cpr.data.tabledata.RowState.DELETED);	
			} else {				
				dsSrcTerminalList.setRowState(i,cpr.data.tabledata.RowState.UNCHANGED);
			}
		} 
	}
	grdSrcTerminalList.redraw();
}
function onTMURE_btnTerminalRemoveAllClick(/* cpr.events.CMouseEvent */ e){
	var grdSrcTerminalList = app.lookup("TMURE_grdSrcTerminalList");
	var dsDesTerminalList = app.lookup("DesTerminalList");
	
	var grdDesTerminalList = app.lookup("TMURE_grdDesTerminalList");
	var dsSrcTerminalList = app.lookup("SrcTerminalList");
		
	var count = dsDesTerminalList.getRowCount();
	for( var index = 0; index < count; index++ ){
		var row = grdDesTerminalList.getRow(index);		
		var userID = row.getValue("ID");
			
		selectTerminalIDMap.delete(userID);
		dsDesTerminalList.deleteRow(index);		
	}
	dsDesTerminalList.commit();
	
	var total = dsSrcTerminalList.getRowCount();
	for ( var i = 0; i < total; i++){		
		var row = dsSrcTerminalList.getRow(i);		
		
		if (row){
			var userID = row.getValue("ID");
			if( selectTerminalIDMap.get(userID) != undefined ){
				dsSrcTerminalList.setRowState(i,cpr.data.tabledata.RowState.DELETED);	
			} else {				
				dsSrcTerminalList.setRowState(i,cpr.data.tabledata.RowState.UNCHANGED);
			}
		} 
	}
	grdSrcTerminalList.redraw();
}

function onTMUSR_btnTerminalUserSendClick(/* cpr.events.CMouseEvent */ e){
	
	
//	dialogUserSelectAccessGroupAndOnlySend(app, "사용자 출입그룹/전체 전송", "", function(/*cpr.controls.Dialog*/ dialog) {
//		dialog.addEventListenerOnce("close", function(e) {
//			if (dialog.returnValue > 0 && dialog.returnValue != undefined) {
//				var appld;
//				console.log(dialog.returnValue);
//				var dmAllFlag = app.lookup("AllFlag");
//				var userAll = dmAllFlag.getValue("UserAll");
//				if( userAll == "false" || userAll == "" ){
//					if( app.lookup("DesUserList").getRowCount() == 0 ){
//						dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserNotSelected"));
//						return
//					}
//				}
//				
//				var terminalAll = dmAllFlag.getValue("TerminalAll");
//				if( terminalAll == "false" || terminalAll == "" ){
//					if( app.lookup("DesTerminalList").getRowCount() == 0 ){
//						dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalNotSelected"));
//						return
//					}
//				}
//				if(dialog.returnValue == 1) {
//					comLib.showLoadMask("",dataManager.getString("Str_Downlaod_User_Accessgroup"),"",0);
//					app.lookup("sms_postUserAccessgroupsDownload").send();
//					
//				} else {
//					comLib.showLoadMask("",dataManager.getString("Str_Send"),"",0);
//					app.lookup("sms_postTerminalUserDownload").send();
//				}
//				
//				app.getRootAppInstance().openDialog(appld, {
//					width : 400, 
//					height : 300
//				}, function(dialog){
//					dialog.initValue = {
//						"ExcludeGroup": -1
//					};
//					dialog.bind("headerTitle").toLanguage("Str_UserSelect");
//					var modalVal = true;
//				}).then(function(returnValue){
//					;
//				});
//			}
//		});
//	});
	
	
	var dmAllFlag = app.lookup("AllFlag");
	var userAll = dmAllFlag.getValue("UserAll");
	if( userAll == "false" || userAll == "" ){
		if( app.lookup("DesUserList").getRowCount() == 0 ){
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserNotSelected"));
			return
		}
	}
	
	var terminalAll = dmAllFlag.getValue("TerminalAll");
	if( terminalAll == "false" || terminalAll == "" ){
		if( app.lookup("DesTerminalList").getRowCount() == 0 ){
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalNotSelected"));
			return
		}
	}
	
	comLib.showLoadMask("",dataManager.getString("Str_Send"),"",0);
	app.lookup("sms_postTerminalUserDownload").send();
	
}

function onSms_postTerminalUserDownloadSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
			content: { "Target":DLG_TERMINAL_WORK_PROCESS, }
		});
		app.getHostAppInstance().dispatchEvent(selectionEvent);	
		
		app.openDialog("app/common/TerminalWorkResult", {width : 400, height : 500}, function(dialog){
			dialog.bind("headerTitle").toLanguage("Str_Result");
			dialog.initValue = {"ResultInfo": app.lookup("ResultInfo")};
			dialog.modal = true;
		})
			
	} else {				
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}	
}

function onTMUSR_btnTerminalWorkProcessClick(/* cpr.events.CMouseEvent */ e){
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
			content: { "Target":DLG_TERMINAL_WORK_PROCESS, }
		});
		app.getHostAppInstance().dispatchEvent(selectionEvent);	
}


//도움말 이미지 클릭 시
function onTMUSR_imgHelpPageExClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Image
	 */
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

function onTMURE_btnUserSearchClick(/* cpr.events.CMouseEvent */ e){
	var pageIndex = app.lookup("TMURE_piSrcUserList");
	pageIndex.currentPageIndex = 1;
	sendUserListRequest();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postUserAccessgroupsDownloadSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_postUserAccessgroupsDownload = e.control;
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		/*
		var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
			content: { "Target":DLG_TERMINAL_WORK_PROCESS, }
		});
		app.getHostAppInstance().dispatchEvent(selectionEvent);	
		
		app.openDialog("app/common/TerminalWorkResult", {width : 400, height : 500}, function(dialog){
			dialog.bind("headerTitle").toLanguage("Str_Result");
			dialog.initValue = {"ResultInfo": app.lookup("ResultInfo")};
			dialog.modal = true;
		})
		*/
	} else {				
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_postUserAccessgroupsDownloadSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_postUserAccessgroupsDownload = e.control;
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_postUserAccessgroupsDownloadSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_postUserAccessgroupsDownload = e.control;
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
