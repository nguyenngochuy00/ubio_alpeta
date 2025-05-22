/************************************************
 * terminalAdminSetting.js
 * Created at 2019. 1. 9. 오후 2:58:27.
 * TerminalListSrc : 서버에서 가져온 관리 대상 단말기 리스트 원본
 * TerminalList : 수정된 관리 대상 단말기 리스트. 저장시 원본과 비교하여 처리
 * @author joymrk
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var terminalAllIDMap;
var TMMRS_pageRowCount = 50;
var usint_version;
var oem_version;

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	oem_version = dataManager.getOemVersion();
	terminalAllIDMap = new Map();
	
	var dsAllTerminalList = app.lookup("AllTerminalList");
	var terminalList = dataManager.getTerminalList();
	if (oem_version == OEM_REMOTE_FAW_MANAGEMENT){
		// 유사 얼굴 체크용 단말은 제외
		terminalList.copyToDataSet(dsAllTerminalList, "UseAuth != 1");
	} else {
		terminalList.copyToDataSet(dsAllTerminalList);
	}	
	dsAllTerminalList.commit();	
	
	var count = dsAllTerminalList.getRowCount();
	for( var i = 0; i < count; i++){
		var terminalInfo = dsAllTerminalList.getRow(i);
		if( terminalInfo ){
			terminalAllIDMap.set(terminalInfo.getValue("ID"),terminalInfo)	
		}			
	}	
	
	var udcUserList = app.lookup("TMMRS_udcUserList");
	udcUserList.deleteColumn([13,12,11,10,9,8,7,6,5,4,3]);
	var udcSearchCategory = app.lookup("TMMRS_udcSearchUser");
	udcSearchCategory.removeItem("uniqueID");
	udcSearchCategory.removeItem("groupName");
	udcSearchCategory.removeItem("accessGroupName");
	udcSearchCategory.removeItem("card");
	udcSearchCategory.removeItem("privilegeID");
	
	sendUserListRequest();	
}

// 사용자 검색
function onTMMRS_udcSearchUserSearch(/* cpr.events.CUIEvent */ e){
	var udcUserList = app.lookup("TMMRS_udcUserList");
	udcUserList.setCurrentPageIndex(1);
	sendUserListRequest();
}

// 서버에 사용자 리스트 요청
function sendUserListRequest() {
	comLib.showLoadMask("",dataManager.getString("Str_UserListGet"),"",0);
	var dsTerminalAdmin = app.lookup("TerminalAdmin");
	dsTerminalAdmin.clear();
	
	var udcUserList = app.lookup("TMMRS_udcUserList");
	var curIndex = udcUserList.getCurrentPageIndex();
	var offset = (curIndex - 1) * TMMRS_pageRowCount
	
	var searchCtrl = app.lookup("TMMRS_udcSearchUser")
	var smsGetUserList = app.lookup("sms_getTerminalAdminList");
	
	// 검색 조건 세팅
	smsGetUserList.setParameters("searchCategory", searchCtrl.searchCategory);
	smsGetUserList.setParameters("searchKeyword", searchCtrl.searchKeyword);
	if (searchCtrl.searchKeyword != undefined && searchCtrl.searchKeyword.length > 0) {
		smsGetUserList.setParameters("searchCategory", searchCtrl.searchCategory);
	} else {
		smsGetUserList.setParameters("searchCategory", "");
	}
	smsGetUserList.setParameters("groupID", 0);
	var fields = ["user_id","name"];
	smsGetUserList.setParameters("fields", fields);
	
		// 페이징 계산하여 요청
	smsGetUserList.setParameters("offset", offset);
	smsGetUserList.setParameters("limit", TMMRS_pageRowCount);
	smsGetUserList.send();
}

// 사용자 리스트 가져오기 완료
function onSms_getUserListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode")
	if( resultCode == COMERROR_NONE){
		
		var dsUserList = app.lookup("TerminalAdmin");
		
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
			
		var recvCount = dsUserList.getRowCount();
			
		var viewPageCount = totalCount / TMMRS_pageRowCount + (totalCount % TMMRS_pageRowCount > 0);
		if (viewPageCount > 5) {
			viewPageCount = 5;			
		}
		
		var udcUserList = app.lookup("TMMRS_udcUserList");
		udcUserList.setUserList(dsUserList);	
		udcUserList.setPaging(totalCount, TMMRS_pageRowCount, viewPageCount);
		udcUserList.redraw();
	} else {
		dialogAlert(app, "Waning", dataManager.getString("Str_UserListGet")+" "+dataManager.getString("Str_Failed")+" "+dataManager.getString(getErrorString(resultCode)));
	}
}

// 사용자 리스트 가져오기 에러
function onSms_getUserListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 사용자 리스트 가져오기 성공
function onSms_getUserListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 사용자 리스트 페이지 변경
function onTMMRS_udcUserListPagechange(/* cpr.events.CSelectionEvent */ e){
	sendUserListRequest();
}

// 사용자 추가
function onTMMRS_btnUserAddClick(/* cpr.events.CMouseEvent */ e){
	/* @type cpr.controls.Button	 */
	var tMMRS_btnUserAdd = e.control;
	var dsGroupList = dataManager.getGroup(); 
	
	var appld = "app/main/users/UserSelect" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {width : 960, height : 500}, function(dialog){
		dialog.initValue = {"GroupList":dsGroupList,"ExcludeGroup":-1};
		dialog.modal = true;		
	}).then(function(/*cpr.data.DataSet*/idMap){
		
		var dsUserIDSendList = app.lookup("UserIDSendList");
		dsUserIDSendList.clear();
		
		var dsTerminalAdmin = app.lookup("TerminalAdmin");
		idMap.forEach(function(value,key){
			var row = dsTerminalAdmin.findFirstRow("ID == " + key);
			// 이미 단말기 관리자로 지정되어 있는 사용자를 선택하면 PK 중복 오류로 나머지 사용자들도 저장이 되지 않아 
			// 해당 사용자는 제외 처리
			if (row == null) {
				//console.log(key);
				dsUserIDSendList.addRowData({"ID":key});
			}			
							
		});
		var dmMode = app.lookup("dmMode");
		dmMode.setValue("Mode",1);		
		
		var sms_postTerminalAdmin = app.lookup("sms_postTerminalAdmin");
		//sms_postTerminalAdmin.setParameters("Mode", "1");
		sms_postTerminalAdmin.send();
		
		comLib.showLoadMask("",dataManager.getString("Str_List"),"",0);		
	});	
}

// 단말기 관리자 추가 완료
function onSms_postTerminalAdminSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	comLib.hideLoadMask();
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){	
		sendUserListRequest();	
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ListLoading"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

// 단말기 관리자 추가 에러
function onSms_postTerminalAdminSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 단말기 관리자 추가 타임아웃
function onSms_postTerminalAdminSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 단말 관리자 삭제.
function onTMMRS_btnUserDeleteClick(/* cpr.events.CMouseEvent */ e){
	var udcUserList = app.lookup("TMMRS_udcUserList");
	var checkIndices = udcUserList.getCheckedRowIndices();
	var count = checkIndices.length;
	if( count == 0){
		return
	}
	var dmMode = app.lookup("dmMode");
	dmMode.setValue("Mode",0);
	
	var dsUserIDSendList = app.lookup("UserIDSendList");
		dsUserIDSendList.clear();
		
	for( var i = 0; i < count; i++){
		var rowIndex = checkIndices[i];
		var row = udcUserList.getRow(rowIndex);
		dsUserIDSendList.addRowData({"ID":row.getValue("ID")});	
	}
	var sms_postTerminalAdmin = app.lookup("sms_postTerminalAdmin");
	//sms_postTerminalAdmin.setParameters("Mode", "0");
	sms_postTerminalAdmin.send();
}

// 사용자 리스트에서 사용자 클릭
function onTMMRS_udcUserListUserListClick(/* cpr.events.CSelectionEvent */ e){
	/* @type udc.grid.userList */
	var tMMRS_udcUserList = e.control;
	/* @type cpr.controls.provider.GridRow */
	var gridRow;
	gridRow = e.newSelection;
	if(gridRow){		
		var userID = gridRow.getValue("ID")
		if (userID){
		//	terminalAllIDMap.clear(); 왜 초기화 하는가
			
			var dsTerminalList = app.lookup("TerminalList");
			dsTerminalList.clear();
			var dsSrcTerminalList = app.lookup("TerminalListSrc");
			dsSrcTerminalList.clear();
			var dsAllTerminalList = app.lookup("AllTerminalList");
			dsAllTerminalList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
			var grdAllTerminalList = app.lookup("TMMRS_grdTerminalList");
			grdAllTerminalList.clearAllCheck();
						
			comLib.showLoadMask("",dataManager.getString("Str_ListLoading"),"",0);
			
			var sms_getAdminTerminalList = app.lookup("sms_getAdminTerminalList");
			sms_getAdminTerminalList.action = "/v1/terminalAdmins/"+userID+"/terminals"
			sms_getAdminTerminalList.send();
		}
	}
}

// 관리 대상 단말기 가져오기 완료
function onSms_getAdminTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	comLib.hideLoadMask();
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		var dsTerminalList = app.lookup("TerminalList"); // 서버에서 받아온 데이터
		var dsSrcTerminalList = app.lookup("TerminalListSrc"); // 수정시 비교하기 위해 원본은 따로 보관한다.
		dsTerminalList.copyToDataSet(dsSrcTerminalList);
		
		var count = dsTerminalList.getRowCount();
		for( var i = 0; i < count; i++ ){
			var terminalInfo = dsTerminalList.getRow(i);
			if( terminalInfo ){
				/** @type cpr.data.Row */
				var existRow = terminalAllIDMap.get(terminalInfo.getValue("ID"));
				if( existRow ){
					existRow.setState(cpr.data.tabledata.RowState.DELETED);
				}
			}	
		}	
		app.lookup("TMMRS_grdTerminalList").redraw();
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ListLoading"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

// 관리 대상 단말기 가져오기 에러
function onSms_getAdminTerminalListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 관리 대상 단말기 가져오기 타임아웃
function onSms_getAdminTerminalListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 관리 대상 단말에서 단말 삭제
function onTMMRS_btnRemoveTerminalClick(/* cpr.events.CMouseEvent */ e){
	var grdTerminalSelected = app.lookup("TMMRS_grdTerminalSelected");
	var checkIndices = grdTerminalSelected.getCheckRowIndices()
	var count = checkIndices.length;
	if( count == 0){
		return
	}
			
	var dsTerminalList = app.lookup("TerminalList")
	
	for( var i = 0; i < count; i++){
		var rowIndex = checkIndices[i];
		var terminalInfo = dsTerminalList.getRow(rowIndex);
		if( terminalInfo ){
			/** @type cpr.data.Row */
			var existRow = terminalAllIDMap.get(terminalInfo.getValue("ID"));
			if( existRow ){								
				existRow.setState(cpr.data.tabledata.RowState.UNCHANGED);
			}
		}	
		dsTerminalList.deleteRow(rowIndex);
	}
	
	dsTerminalList.commit();
	grdTerminalSelected.redraw();
	app.lookup("TMMRS_grdTerminalList").redraw();
}

// 관리 대상 단말기로 단말 추가
function onTMMRS_btnAddTerminalClick(/* cpr.events.CMouseEvent */ e){
	var grdTerminalList = app.lookup("TMMRS_grdTerminalList");
	var checkIndices = grdTerminalList.getCheckRowIndices();
	var count = checkIndices.length;
	if( count == 0){
		return
	}
			
	var dsTerminalList = app.lookup("TerminalList")
	for( var i = 0; i < count; i++){
		var rowIndex = checkIndices[i];
		var row = grdTerminalList.getRow(rowIndex);
		if( row && ( row.getStateString() != "D" && row.getStateString() != "ID") ) {
			dsTerminalList.addRowData(row.getRowData());
			
			/** @type cpr.data.Row */
			var existRow = terminalAllIDMap.get(row.getValue("ID"));
			if( existRow ){
				existRow.setState(cpr.data.tabledata.RowState.DELETED);
			}else {
				terminalAllIDMap.set(row.getValue("ID"),row);
				row.setState(cpr.data.tabledata.RowState.DELETED);
			}
		}	
	}
	dsTerminalList.commit();
}

// 관리 대상 단말에서 단말 전체 삭제
function onTMMRS_btnRemoveAllTerminalClick(/* cpr.events.CMouseEvent */ e){
	var dsTerminalList = app.lookup("TerminalList")
	dsTerminalList.clear();
}

// 관리 대상 단말에서 단말 전체 추가
function onTMMRS_btnAddAllTerminalClick(/* cpr.events.CMouseEvent */ e){
	var dsTerminalList = app.lookup("TerminalList")
	dsTerminalList.clear();
	var dsAllTerminalList = app.lookup("AllTerminalList")
	dsAllTerminalList.copyToDataSet(dsTerminalList);
}

// 관리 대상 단말기 저장
function onTMMRS_btnSaveClick(/* cpr.events.CMouseEvent */ e){
	
	var udcUserList = app.lookup("TMMRS_udcUserList");
	var userID = udcUserList.getSelectedID();
	if (userID == null ){
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_NoSelectedAdmin"));
		return
	}
	var dsTerminalList = app.lookup("TerminalList"); // 수정된 리스트
	var dsSrcTerminalList = app.lookup("TerminalListSrc"); // 원본 리스트

	console.log("dsTerminalList : "+dsTerminalList.getColumnData("ID"));
	console.log("dsSrcTerminalList : "+dsSrcTerminalList.getColumnData("ID"));
	var dsTerminalIDPostSendList = app.lookup("TerminalIDPostSendList") // 추가 요청할 리스트 저장
	dsTerminalIDPostSendList.clear();
	var dsTerminalIDDeleteSendList = app.lookup("TerminalIDDeleteSendList") // 삭제 요청할 리스트 저장
	dsTerminalIDDeleteSendList.clear();
		
	var srcCount = dsSrcTerminalList.getRowCount();	
	for( var i = 0; i < srcCount; i++){
		var srcTerminal = dsSrcTerminalList.getRow(i);	 // 원본 리스트에서 하나씩 가져온다.			
		if( srcTerminal ){
			var srcTerminalID = srcTerminal.getValue("ID");
			var desTerminal = dsTerminalList.findFirstRow("ID =='"+srcTerminalID+"'");
			if( desTerminal ){ // 원본 리스트와 수정된 리스트에 모두 있으므로 스킵
				continue;
			}
			// 원본 리스트에만 있으므로 삭제 리스트에 추가
			dsTerminalIDDeleteSendList.addRowData({"ID":srcTerminalID})
		}
	}
	var desCount = dsTerminalList.getRowCount();
	for( var i = 0; i < desCount; i++){
		var desTerminal = dsTerminalList.getRow(i); // 수정된 리스트에서 하나씩 가져온다.		
		if( desTerminal ){
			var desTerminalID = desTerminal.getValue("ID");
			var srcTerminal = dsSrcTerminalList.findFirstRow("ID =='"+desTerminalID+"'");
			if( srcTerminal ){ // 원본 리스트와 수정된 리스트에 모두 있으므로 스킵
				continue;
			}
			// 수정된 리스트에만 있으므로 추가 리스트에 추가
			dsTerminalIDPostSendList.addRowData({"ID":desTerminalID});
		}
	}
	if( dsTerminalIDPostSendList.getRowCount() > 0 ){
		sendPostAdminTerminalList();
		return;
	}
	if( dsTerminalIDDeleteSendList.getRowCount() > 0 ){
		sendDeleteAdminTerminalList();
		return;
	}		
}

function sendPostAdminTerminalList(){
	var udcUserList = app.lookup("TMMRS_udcUserList");
	var userID = udcUserList.getSelectedID();
	if (userID == null ){
		return
	}
	var dmMode = app.lookup("dmMode");
		dmMode.setValue("Mode",1);	
		
	var sms_postAdminTerminalList = app.lookup("sms_postAdminTerminalList");
	sms_postAdminTerminalList.action = "/v1/terminalAdmins/"+userID+"/terminals"
	//sms_postAdminTerminalList.setParameters("Mode", 1);
	sms_postAdminTerminalList.send();
	var dsTerminalIDPostSendList = app.lookup("TerminalIDPostSendList");	
}

// 단말기 관리자 단말기 리스트 추가  완료
function onSms_postAdminTerminalSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode");
	if( resultCode == COMERROR_NONE){ 	
		var dsTerminalIDPostSendList = app.lookup("TerminalIDPostSendList") // 추가 요청할 리스트 
		dsTerminalIDPostSendList.clear();
		
		var dsTerminalIDDeleteSendList = app.lookup("TerminalIDDeleteSendList") // 삭제 요청할 리스트
		if( dsTerminalIDDeleteSendList.getRowCount()>0 ){
			sendDeleteAdminTerminalList();	
		} else {
			var dsTerminalList = app.lookup("TerminalList"); // 수정된 리스트
			var dsSrcTerminalList = app.lookup("TerminalListSrc"); // 원본 리스트
			dsSrcTerminalList.clear();
			dsTerminalList.copyToDataSet(dsSrcTerminalList);
						
			dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_TerminalAdminTerminalSave"));	
		}
		
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_TerminalAdminTerminalSave"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 단말기 관리자 단말기 리스트 추가 에러
function onSms_postAdminTerminalSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 단말기 관리자 단말기 리스트 추가 타임아웃
function onSms_postAdminTerminalSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

function sendDeleteAdminTerminalList(){
	var udcUserList = app.lookup("TMMRS_udcUserList");
	var userID = udcUserList.getSelectedID();
	if (userID == null ){
		return
	}
	var dmMode = app.lookup("dmMode");
		dmMode.setValue("Mode",0);	
	var sms_deleteAdminTerminalList = app.lookup("sms_deleteAdminTerminalList");
	sms_deleteAdminTerminalList.action = "/v1/terminalAdmins/"+userID+"/terminals"
	//sms_deleteAdminTerminalList.setParameters("Mode", "Delete");
	sms_deleteAdminTerminalList.send();
}

// 단말기 관리자 단말기 리스트 삭제  완료
function onSms_deleteAdminTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode");
	if( resultCode == COMERROR_NONE){ 			
		var dsTerminalIDDeleteSendList = app.lookup("TerminalIDDeleteSendList") // 삭제 요청할 리스트
		dsTerminalIDDeleteSendList.clear();
				
		var dsTerminalList = app.lookup("TerminalList"); // 수정된 리스트
		var dsSrcTerminalList = app.lookup("TerminalListSrc"); // 원본 리스트
		dsSrcTerminalList.clear();
		dsTerminalList.copyToDataSet(dsSrcTerminalList);
			
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_TerminalAdminTerminalSave"));
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_TerminalAdminTerminalSave"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 단말기 관리자 단말기 리스트 삭제  에러
function onSms_deleteAdminTerminalListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 단말기 관리자 단말기 리스트 삭제  타임아웃
function onSms_deleteAdminTerminalListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 도움말
function onTMMRS_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}