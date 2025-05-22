/************************************************
 * masterShift.js
 * Created at 2022. 5. 9. 오후 5:47:48.
 *
 * @author wonki
 ************************************************/

var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var comUtil = createComUtil(app);

var pageRowCount = 100;
var selectUserListMap;

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	
	selectUserListMap = new Map();
	
	var udcUserListMaster = app.lookup("MSHIFT_UserListMaster");
	var udcUserListUser = app.lookup("MSHIFT_UserListUser");
	var udcUserList = app.lookup("UDC_grdUserList");
	
//	udcUserListMaster.deleteColumn([14, 13,12,11,10,9,8,7,6,5,4,3]);	
//	udcUserListMaster.enablePageIndexer(false);	
//	udcUserListUser.deleteColumn([13,12,11,10,9,8,7,6,5,4,3]);
//	udcUserListUser.enablePageIndexer(false);
	udcUserList.deleteColumn([13,12,11,10,9,8,7,6,5,4,3]);
	udcUserList.enablePageIndexer(false);
	
	sendMasterShiftListRequest();
}

function sendMasterShiftListRequest() {
	var udcUserList = app.lookup("UDC_grdUserList");
	var curIndex = udcUserList.getCurrentPageIndex();	
	var pageRowCount = udcUserList.getPageRowCount();
	var offset = (curIndex - 1) * pageRowCount
	
	var cmbUserCategory = app.lookup("MSHIFT_cmbUserCategory");
	var ipbUserKeyword = app.lookup("MSHIFT_ipbUserKeyword");	
	
	//var smsGetMasterShiftList = app.lookup("sms_getMasterShiftList");
	var smsGetMasterShiftList = new cpr.protocols.Submission("sms_getMasterShiftList");	 
	smsGetMasterShiftList.action = "/v1/bnpcnp/mastershift";
	smsGetMasterShiftList.method = "get";
	smsGetMasterShiftList.mediaType = "application/x-www-form-urlencoded";
		
	smsGetMasterShiftList.addEventListenerOnce("submit-done", onSms_getMasterShiftListSubmitDone);	
	smsGetMasterShiftList.addEventListenerOnce("submit-error", onSms_getMasterShiftListSubmitError);
	smsGetMasterShiftList.addEventListenerOnce("submit-timeout", onSms_getMasterShiftListSubmitTimeout);
	if(cmbUserCategory.value != 0 ){
		smsGetMasterShiftList.setParameters("searchCategory", cmbUserCategory.value);
	}else{
		smsGetMasterShiftList.setParameters("searchCategory", "");
	}
	if(ipbUserKeyword.value != null && ipbUserKeyword.value.length != 0 ){
		smsGetMasterShiftList.setParameters("searchKeyword", ipbUserKeyword.value);
	} else{
		smsGetMasterShiftList.setParameters("searchKeyword", "");
	}
	
	smsGetMasterShiftList.setParameters("offset", offset);
	smsGetMasterShiftList.setParameters("limit", pageRowCount);
	
	smsGetMasterShiftList.addResponseData(app.lookup("Result"), false, "Result");
	smsGetMasterShiftList.addResponseData(app.lookup("MasterShiftTotal"), false, "MasterShiftTotal");
	smsGetMasterShiftList.addResponseData(app.lookup("MasterShiftList"), false, "MasterShiftList");	
	smsGetMasterShiftList.addResponseData(app.lookup("UsersTotal"), false, "UsersTotal");
	smsGetMasterShiftList.addResponseData(app.lookup("UserList"), false, "UserList");
	
	smsGetMasterShiftList.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getMasterShiftListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		var dsAddUserList = app.lookup("UserList");
		var udcUserList = app.lookup("UDC_grdUserList");
		var grdMasterShift = app.lookup("MasterShiftGrd");
		var dsMasterShiftList = app.lookup("MasterShiftList");
		udcUserList.setUserList(dsAddUserList);
		udcUserList.redraw();
		
		console.log(JSON.stringify(dsMasterShiftList.getRowDataRanged()));
		grdMasterShift.redraw();
	} else {				
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}	
	
}

function onSms_getMasterShiftListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)	
}
function onSms_getMasterShiftListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

/*
 * 버튼(MSHIFT_btnMasterAdd)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onMSHIFT_btnMasterAddClick(/* cpr.events.CMouseEvent */ e){
	var grdSrcUserList = app.lookup("UDC_grdUserList");
	var dsAddUserList = app.lookup("UserList");
	var indices = grdSrcUserList.getCheckedRowIndices();	
	if( indices.length == 0){
		return;
	}
	var grdUserListMaster = app.lookup("MSHIFT_UserListMaster");	
	var dsMasterUserList = app.lookup("MasterUserList");
	
	var RegistedCount = dsMasterUserList.getRowCount();
	if( 5 < RegistedCount+indices.length){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserCountMaxExceeded"));
		return;
	}	
	
	indices.forEach(function(index){		
		var row = grdSrcUserList.getRow(index);			
		var userID = row.getValue("ID");
				
		if( selectUserListMap.get(userID) == undefined ){				
			dsMasterUserList.addRowData(row.getRowData());	
			
			selectUserListMap.set(userID,1);
			grdSrcUserList.deleteRow(row.getIndex())
		}
	});
	
	dsMasterUserList.setSort("ID");
}




/*
 * 버튼(MSHIFT_btnMasterRemove)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onMSHIFT_btnMasterRemoveClick(/* cpr.events.CMouseEvent */ e){
	var grdSrcUserList = app.lookup("UDC_grdUserList");
	var dsMasterUserList = app.lookup("MasterUserList");
	
	var grdUserListMaster = app.lookup("MSHIFT_UserListMaster");	
	var indices = grdUserListMaster.getCheckRowIndices();
	if( indices.length == 0){
		return;
	}
	
	var idList = [];
	indices.forEach(function(index){
		var row = grdUserListMaster.getRow(index);		
		var userID = row.getValue("ID");
			
		selectUserListMap.delete(userID);
		idList.push(userID);
	});
		
	idList.forEach(function(userID){						
		var delRow = dsMasterUserList.findFirstRow("ID == "+userID)
		dsMasterUserList.realDeleteRow(delRow.getIndex());
	});
	
	grdSrcUserList.refreshUserList(selectUserListMap);

}


/*
 * 버튼(MSHIFT_btnUserAdd)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onMSHIFT_btnUserAddClick(/* cpr.events.CMouseEvent */ e){
	var grdSrcUserList = app.lookup("UDC_grdUserList");
	var dsAddUserList = app.lookup("UserList");
	var indices = grdSrcUserList.getCheckedRowIndices();	
	if( indices.length == 0){
		return;
	}
	var grdUserListMaster = app.lookup("MSHIFT_UserListUser");	
	var dsNormalUserList = app.lookup("NormalUserList");
	
	var RegistedCount = dsNormalUserList.getRowCount();
	if( 7000 < RegistedCount+indices.length){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserCountMaxExceeded"));
		return;
	}
		
	indices.forEach(function(index){		
		var row = grdSrcUserList.getRow(index);		
		var userID = row.getValue("ID");
				
		if( selectUserListMap.get(userID) == undefined ){				
			dsNormalUserList.addRowData(row.getRowData());
			
			selectUserListMap.set(userID,1);
			grdSrcUserList.deleteRow(row.getIndex())
		}
	});
	
	dsNormalUserList.setSort("ID");
}


/*
 * 버튼(MSHIFT_btnUserRemove)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onMSHIFT_btnUserRemoveClick(/* cpr.events.CMouseEvent */ e){
	var grdSrcUserList = app.lookup("UDC_grdUserList");
	var dsNormalUserList = app.lookup("NormalUserList");
	
	var grdUserListUser = app.lookup("MSHIFT_UserListUser");	
	var indices = grdUserListUser.getCheckRowIndices();	
	if( indices.length == 0){
		return;
	}
	
	var idList = [];
	indices.forEach(function(index){
		var row = grdUserListUser.getRow(index);		
		var userID = row.getValue("ID");
			
		selectUserListMap.delete(userID);
		idList.push(userID);
	});
		
	idList.forEach(function(userID){						
		var delRow = dsNormalUserList.findFirstRow("ID == "+userID)
		dsNormalUserList.realDeleteRow(delRow.getIndex());
	});
	
	grdSrcUserList.refreshUserList(selectUserListMap);
}

/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onMSHIFT_btnUserSearchClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var mSHIFT_btnUserSearch = e.control;
	/*
	var udcUserList = app.lookup("UDC_grdUserList");
	udcUserList.setCurrentPageIndex( 1 );
	sendMasterShiftListRequest();
	*/
	
	var cmbUserCategory = app.lookup("MSHIFT_cmbUserCategory");
	var ipbUserKeyword = app.lookup("MSHIFT_ipbUserKeyword");
	
	
	if (cmbUserCategory.value != 0) {
		if (ipbUserKeyword.value != null && ((cmbUserCategory.value != "id" || cmbUserCategory.value != "name" || cmbUserCategory.value != "unique_id") &&
				ipbUserKeyword.value.length == 0)) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_InvalidSearchLength"));
			return;
		}
	}
	
	var reg = /[\{\}\[\]\/?.,;:|\)`^\<>@\#$%&\\\=\(\'\"]/gi;
	var keyword = app.lookup("MSHIFT_ipbUserKeyword").value;
	var udcTerminalUserList = app.lookup("UDC_grdUserList");
	if (keyword == undefined || keyword.length <= 0) {
		//선택 해제
		udcTerminalUserList.clearFilter();
	} else {
		if (reg.test(keyword)) {
			// 들어가 있으면 입력불가능한 특수 문자 입니다.
			dialogAlert(app, "Waning", dataManager.getString("Str_ErrorSpecialCharacters"));
			return;
		}
		var category = app.lookup("MSHIFT_cmbUserCategory").value;
		console.log("category = ", category);
		udcTerminalUserList.setFilter(category, keyword);
	} 
}


/*
 * 버튼(WDINS_btnSendtoTerminal)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onWDINS_btnSendtoTerminalClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var wDINS_btnSendtoTerminal = e.control;
	
	var masterShiftGrd = app.lookup("MasterShiftGrd");
	var checkedRowIndices = masterShiftGrd.getCheckRowIndices();
	var checkedCount = checkedRowIndices.length;
	
	var dsSelectMasterShiftList = app.lookup("SelectMasterShiftList");
	
	if(checkedCount==0){
		dialogAlert(app, dataManager.getString("Str_Warning"), "Please select a group.");
		return;
	}
	
	app.getRootAppInstance().openDialog("app/main/terminals/popup/terminalTinyList", {width: 390, height: 570}, function(dialog){
		dialog.ready(function(dialogApp){
			dialog.initValue = {
				"PopupType": "MultiCheck"
			};
			dialog.modal = true;
			dialog.bind("headerTitle").toLanguage("Str_TerminalList");
		});
	}).then(function(returnValue){
		if (returnValue) {
			var dsTerminalList = app.lookup("terminals");
			dsTerminalList.clear();
			returnValue.copyToDataSet(dsTerminalList);
			
			//console.log(JSON.stringify(dsTerminalList.getRowDataRanged()));
			sendSelectMasterShiftInfoDownloadToTerminal();	
		} else { // 취소

		}
		
	});
}

function sendMasterShiftInfoDownloadToTerminal() {
	var smsDownloadToTerminal = app.lookup("sms_putMasterShiftDownloadToTerminal");
	var dsTerminalList = app.lookup("terminals");
	
	console.log(JSON.stringify(dsTerminalList.getRowDataRanged()));

	smsDownloadToTerminal.addRequestData(dsTerminalList, "terminals", cpr.protocols.PayloadType.all);
	smsDownloadToTerminal.send();
}





/*
 * 버튼(btnRowAdd)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnRowAddClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnRowAdd = e.control;
	
	var msList = app.lookup("MasterShiftList");
	var max = msList.getMax("Code");
	var dmMSInfo = app.lookup("MasterShiftInfo");
	
	dmMSInfo.clear();
	dmMSInfo.setValue("Code", max==null?1:parseInt(max)+1);
	
	app.lookup("MasterUserList").clear();
	app.lookup("NormalUserList").clear();
	
	app.lookup("UDC_grdUserList").redraw();
	app.lookup("MSHIFT_grpMSInfo").redraw();
	app.lookup("MSHIFT_grpMSInfoTime").redraw();
	app.lookup("MSHIFT_UserListMaster").redraw();
	app.lookup("MSHIFT_UserListUser").redraw();
	
	
	
	//var msGrid = app.lookup("MasterShiftGrd");
	//var rowIndex = msGrid.getSelestedRowIndex();
	
	/*
	msGrid.insertRowData(msGrid.getRowCount(), true, {"Code":max==null?1:parseInt(max)+1, "Name": "New"});
	msGrid.setEditRowIndex(msGrid.getRowCount()-1);//별도 다이얼로그 없이 그리드에서 이름 등록
	msGrid.selectRows(msGrid.getRowCount()-1);	
	
	msGrid.setRowState(msGrid.getRowCount(), cpr.data.tabledata.RowState.UNCHANGED);
	app.lookup("MSHIFT_grpMSInfo").redraw();
	*/
}


/*
 * 버튼(btnTmSave)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnTmSaveClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnTmSave = e.control;
	
	var dmMasterShiftInfo = app.lookup("MasterShiftInfo");
	console.log(dmMasterShiftInfo.getDatas());	
	
	var smsPutMasterInfo = app.lookup("sms_postMasterShiftInfo");	
	smsPutMasterInfo.send();
}


/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onMasterShiftGrdSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var masterShiftGrd = e.control;
	var row = masterShiftGrd.getSelectedRow();
	
	app.lookup("MasterShiftInfo").clear();
	app.lookup("MasterUserList").clear();
	app.lookup("NormalUserList").clear();
	
	var requestData = app.lookup("sms_getMasterShiftInfo");
	requestData.action = "/v1/bnpcnp/mastershift/" + row.getValue("Code");
	requestData.send();	
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getMasterShiftInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getMasterShiftInfo = e.control;
	
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		app.lookup("MSHIFT_grpMSInfo").redraw();
		app.lookup("MSHIFT_grpMSInfoTime").redraw();
		
		console.log(app.lookup("MasterShiftInfo").getDatas());
	} else {				
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postMasterShiftInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_postMasterShiftInfo = e.control;
	sendMasterShiftListRequest();
}


/*
 * 버튼(btnRowDel)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnRowDelClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnRowDel = e.control;
	var masterShiftGrd = app.lookup("MasterShiftGrd");
	var row = masterShiftGrd.getSelectedRow();
	
	app.lookup("MasterShiftInfo").clear();
	app.lookup("MasterUserList").clear();
	app.lookup("NormalUserList").clear();
	
	var requestData = app.lookup("sms_deleteMasterShiftInfo");
	requestData.action = "/v1/bnpcnp/mastershift/" + row.getValue("Code");	
	requestData.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_deleteMasterShiftInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_deleteMasterShiftInfo = e.control;
	
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		app.lookup("MSHIFT_grpMSInfo").redraw();
		app.lookup("MSHIFT_grpMSInfoTime").redraw();
		
		console.log(app.lookup("MasterShiftInfo").getDatas());
	} else {				
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	
	sendMasterShiftListRequest();
}


//sky -------------------------------------
function sendSelectMasterShiftInfoDownloadToTerminal() {
	var smsDownloadToTerminal = app.lookup("sms_putSelectMasterShiftDownloadToTerminal");
	var dsTerminalList = app.lookup("terminals");
	
	console.log("terminal : " + JSON.stringify(dsTerminalList.getRowDataRanged()));
	
	smsDownloadToTerminal.addRequestData(dsTerminalList, "terminals", cpr.protocols.PayloadType.all);
	smsDownloadToTerminal.send();
}

function onMasterShiftGrdRowCheck(/* cpr.events.CGridEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var masterShiftGrd = e.control;
	var checkedRowIndices = masterShiftGrd.getCheckRowIndices();
	var checkedCount = checkedRowIndices.length;
	
	var dsSelectMasterShiftList = app.lookup("SelectMasterShiftList");
	
	if(checkedCount>2){
		dialogAlert(app, dataManager.getString("Str_Warning"), "You can select up to two.");
		masterShiftGrd.clearAllCheck();
	} else {
		dsSelectMasterShiftList.clear();
					
		checkedRowIndices.forEach(function(index){
			var masterShiftRow = masterShiftGrd.getRow(index);
			dsSelectMasterShiftList.addRowData({"Code":masterShiftRow.getValue("Code"),"Name":masterShiftRow.getValue("Name"),"StartTime":masterShiftRow.getValue("StartTime"),"EndTime":masterShiftRow.getValue("EndTime")});		
		});		
	}		
}

function sendSelectMasterShiftListRequest() {
	var dsSelectMasterShiftList = app.lookup("SelectMasterShiftList");
	
	var curIndex = udcUserList.getCurrentPageIndex();	
	var pageRowCount = udcUserList.getPageRowCount();
	var offset = (curIndex - 1) * pageRowCount
	
	var cmbUserCategory = app.lookup("MSHIFT_cmbUserCategory");
	var ipbUserKeyword = app.lookup("MSHIFT_ipbUserKeyword");	
	
	//var smsGetMasterShiftList = app.lookup("sms_getMasterShiftList");
	var smsGetMasterShiftList = new cpr.protocols.Submission("sms_getMasterShiftList");	 
	smsGetMasterShiftList.action = "/v1/bnpcnp/mastershift";
	smsGetMasterShiftList.method = "get";
	smsGetMasterShiftList.mediaType = "application/x-www-form-urlencoded";
		
	smsGetMasterShiftList.addEventListenerOnce("submit-done", onSms_getMasterShiftListSubmitDone);	
	smsGetMasterShiftList.addEventListenerOnce("submit-error", onSms_getMasterShiftListSubmitError);
	smsGetMasterShiftList.addEventListenerOnce("submit-timeout", onSms_getMasterShiftListSubmitTimeout);
	if(cmbUserCategory.value != 0 ){
		smsGetMasterShiftList.setParameters("searchCategory", cmbUserCategory.value);
	}else{
		smsGetMasterShiftList.setParameters("searchCategory", "");
	}
	if(ipbUserKeyword.value != null && ipbUserKeyword.value.length != 0 ){
		smsGetMasterShiftList.setParameters("searchKeyword", ipbUserKeyword.value);
	} else{
		smsGetMasterShiftList.setParameters("searchKeyword", "");
	}
	
	smsGetMasterShiftList.setParameters("offset", offset);
	smsGetMasterShiftList.setParameters("limit", pageRowCount);
	
	smsGetMasterShiftList.addResponseData(app.lookup("Result"), false, "Result");
	smsGetMasterShiftList.addResponseData(app.lookup("MasterShiftTotal"), false, "MasterShiftTotal");
	smsGetMasterShiftList.addResponseData(app.lookup("MasterShiftList"), false, "MasterShiftList");	
	smsGetMasterShiftList.addResponseData(app.lookup("UsersTotal"), false, "UsersTotal");
	smsGetMasterShiftList.addResponseData(app.lookup("UserList"), false, "UserList");
	
	smsGetMasterShiftList.send();
}

//------------------------------------------

/**
 * 선택한 로우의 상태가 unchanged 상태가 아닐때 확인 후 삭제한다.
 * @param {any} ev
 */
function checkGrd(/* cpr.events.CSelectionEvent */ev){
	var leftGrd = app.lookup("MasterShiftGrd");
	if(!isOk){
		if (comUtil.isUpdated("MasterShiftList") == true) {
			dialogConfirm(app, "", dataManager.getString("Str_NoSavedRow"), function(/*cpr.controls.Dialog*/dialog){
				dialog.addEventListenerOnce("close", function(e) {
					if (dialog.returnValue) {
						if(ev){
							ev.stopPropagation();//현재 이벤트 추가 전파 금지
							leftGrd.deleteRow(ev.oldSelection[0]);
						}
						return;
					} else {
						if(ev){
							ev.stopPropagation();
							leftGrd.setEditRowIndex(ev.oldSelection[0]);
							leftGrd.selectRows(ev.oldSelection[0],false);
						}
						return;
					}
				});
			});
		} else {
			isOk = true;
		}
	}
}