/************************************************
 * apbUserList.js
 * Created at 2021. 8. 18. 오후 5:25:25.
 *
 * @author zxc
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var APB_grdUserList_enablePageIndexer = true;


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	APB_grdUserList_enablePageIndexer = true;
	
	if (dataManager.getOemVersion() == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH){ // 육군본부향 사용자 아이디 보이지 않도록 처리. 그룹명을 부서로 변경 - pse
		app.lookup("APB_grdUserList").columnVisible(0, false);
		app.lookup("APB_grdUserList").header.getColumn(4).bind("text").toLanguage("Str_ARMY_UserGroup1");
		app.lookup("APB_grdUserList").header.getColumn(8).bind("text").toLanguage("Str_ARMYHQ_TerminalLocation");
	}
	
	var privilegeList = dataManager.getPrivilegeList();	

	if( privilegeList ){
		var cmbPrivilege = app.lookup("grdApbUserList_cmbPrivilege");	
		var ItemAdmin = new cpr.controls.Item(dataManager.getString("Str_Admin"),1);
		var ItemNormalUser = new cpr.controls.Item(dataManager.getString("Str_NormalUser"),2);
		
		ItemAdmin.bind("label").toLanguage("Str_Admin");
		ItemNormalUser.bind("label").toLanguage("Str_NormalUser");
		
		cmbPrivilege.addItem(ItemAdmin);
		cmbPrivilege.addItem(ItemNormalUser);
		
		var count = privilegeList.getRowCount();
		for ( var i = 0; i < count; i++ ){			
			var privilegeInfo = privilegeList.getRow(i);						
			cmbPrivilege.addItem(new cpr.controls.Item(privilegeInfo.getValue("Name"),privilegeInfo.getValue("PrivilegeID")));
		}
		cmbPrivilege.setItemSet(privilegeList, {
			label: "Name",
			value: "PrivilegeID",
		});
	}
	
	var groupList = dataManager.getGroup();
	if( groupList && groupList.getRowCount()>0){
		var cmbGroup = app.lookup("grdApbUserList_cmbGroup");
		var count = groupList.getRowCount();
		for ( var i = 0; i < count; i++ ){			
			var groupInfo = groupList.getRow(i);						
			cmbGroup.addItem(new cpr.controls.Item(groupInfo.getValue("Name"),groupInfo.getValue("GroupID")));
		}
		/*
		cmbGroup.setItemSet(groupList, {
			label: "Name",
			value: "GroupID",			
		});
		*/				
	}
	
	var accessGroupList = dataManager.getAccessGroup();
	if( accessGroupList && accessGroupList.getRowCount()>0){
		var cmbAccessGroup = app.lookup("grdApbUserList_cmbAccessGroup");
		var count = accessGroupList.getRowCount();
		for ( var i = 0; i < count; i++ ){			
			var accessGroupInfo = accessGroupList.getRow(i);						
			cmbAccessGroup.addItem(new cpr.controls.Item(accessGroupInfo.getValue("Name"),accessGroupInfo.getValue("ID")));
		}
		/*	
		cmbAccessGroup.setItemSet(accessGroupList, {
			label: "Name",
			value: "ID",
		});
		*/
	}
	
	var positionList = dataManager.getPositionList();
	if( positionList && positionList.getRowCount()>0){
		var cmbPosition = app.lookup("grdApbUserList_cmbPosition");
		var count = positionList.getRowCount();
		for ( var i = 0; i < count; i++ ){			
			var positionInfo = positionList.getRow(i);						
			cmbPosition.addItem(new cpr.controls.Item(positionInfo.getValue("Name"),positionInfo.getValue("PositionID")));
		}			
	}
	
//	var terminalList = dataManager.getTerminalList();
//	if( terminalList && terminalList.getRowCount()>0){
//		var cmbTerminal = app.lookup("grdApbUserList_cmbTerminal");
//		var count = terminalList.getRowCount();
//		for ( var i = 0; i < count; i++ ){			
//			var terminalInfo = terminalList.getRow(i);						
//			cmbTerminal.addItem(new cpr.controls.Item(terminalInfo.getValue("Name"),terminalInfo.getValue("ID")));
//		}			
//	}
}


/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.	
	return "";
};

exports.setFilter = function(category,keyword){
	if (category != "AreaID" && category != "name"){return;}
	
	var userList = app.lookup("UserList");
	userList.clear();
	
	keyword = keyword.toLowerCase();
	
	var userListSrc = app.lookup("UserListSrc");
	var count = userListSrc.getRowCount();
	for( var i = 0; i < count; i++ ){
		var user = userListSrc.getRow(i);
		var srcData;
		if (category == "id") {
			srcData = user.getValue("ID");
		} else if (category == "name") {
			srcData = user.getValue("Name");
		}
		srcData = srcData.toLowerCase();
		if (srcData.indexOf(keyword) != -1) {
  			userList.addRowData(user.getRowData());
		}		
	}
	userList.commit();
}
exports.clearFilter = function(){
	var userList = app.lookup("UserList");
	var userListSrc = app.lookup("UserListSrc");	
	userList.clear();
	userListSrc.copyToDataSet(userList);
	userList.commit();
}

exports.clearUserList = function(  ){
			
	var pageIndex = app.lookup("APB_userListPageIndexer");
	pageIndex.totalRowCount = 0;
	pageIndex.visible = false;	
	pageIndex.redraw();
	
	var userListSet = app.lookup("UserList");
	userListSet.clear();
				
	var userList = app.lookup("APB_grdUserList");	
	userList.redraw();
}

exports.setUserListRows = function( /*cpr.data.RowConfigInfo[]*/userData ){
			
	var userListSet = app.lookup("UserList"); 
	userListSet.clear();	
	userListSet.build(userData);	
	userListSet.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	
	var userList = app.lookup("APB_grdUserList");	
	userList.redraw();	
}

exports.setUserList = function( /*cpr.data.DataSet*/userDataSet ){
			
	var userList = app.lookup("UserList");
	var userListSrc = app.lookup("UserListSrc");
	
	userList.clear();	
	userListSrc.clear();		
	
	userDataSet.copyToDataSet(userList);	
	userDataSet.copyToDataSet(userListSrc);
		
	userList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	
	var grdUserList = app.lookup("APB_grdUserList");	
	grdUserList.redraw();
}
exports.getUserID = function( index ){
	
	var userList = app.lookup("APB_grdUserList");
	var userID = userList.getRow(index).getString("AreaID");
	return userID;
}

exports.getRowData = function( index ){
	
	var userList = app.lookup("APB_grdUserList");
	return userList.getRow(index).getRowData();	
}

//exports.updateUserInfo = function( userInfoData ){
//	
//	var groupList = dataManager.getGroup();
//	if( groupList && groupList.getRowCount()>0){
//		var cmbGroup = app.lookup("grdApbUserList_cmbGroup");
//		var count = groupList.getRowCount();
//		for ( var i = 0; i < count; i++ ){			
//			var groupInfo = groupList.getRow(i);						
//			cmbGroup.addItem(new cpr.controls.Item(groupInfo.getValue("Name"),groupInfo.getValue("GroupID")));
//		}	
//	}
//	
//	var positionList = dataManager.getPositionList();
//	if( positionList && positionList.getRowCount()>0){
//		var cmbPosition = app.lookup("grdApbUserList_cmbPosition");
//		var count = positionList.getRowCount();
//		for ( var i = 0; i < count; i++ ){			
//			var positionInfo = positionList.getRow(i);						
//			cmbPosition.addItem(new cpr.controls.Item(positionInfo.getValue("Name"),positionInfo.getValue("PositionID")));
//		}	
//	}
	
//	var accessGroupList = dataManager.getAccessGroup();
//	if( accessGroupList && accessGroupList.getRowCount()>0){
//		var cmbAccessGroup = app.lookup("grdApbUserList_cmbAccessGroup");
//		var count = accessGroupList.getRowCount();
//		for ( var i = 0; i < count; i++ ){			
//			var accessGroupInfo = accessGroupList.getRow(i);						
//			cmbAccessGroup.addItem(new cpr.controls.Item(accessGroupInfo.getValue("Name"),accessGroupInfo.getValue("ID")));
//		}
//	}
//	
//	
//	var dsUserList = app.lookup("UserList");
//	var userInfo = dsUserList.findFirstRow("ID == '"+userInfoData.ID+"'");
//	if(userInfo){
//		
//		userInfo.setRowData(userInfoData);
//		
//		var AuthType = userInfo.getValue("AuthInfo").split(',');
//				
//		var setCount = 0;
//		var andAuth = "";
//		for( var idx=0; idx < AuthType[7]; idx++ ){		
//			if(AuthType[idx]!="0"){
//				andAuth += getAuthTypeString( parseInt(AuthType[idx],10))+" ";
//				setCount++;
//			}	
//		}
//		var orAuth = "";	
//		for( var idx=AuthType[7]; idx< AuthType.length-1; idx++ ){		
//			if(AuthType[idx]!="0"){
//				orAuth += getAuthTypeString( parseInt(AuthType[idx],10))+" ";
//				setCount++;
//			}
//		}
//			
//		if( setCount > 1 ){
//			userInfo.setValue("AuthInfo",andAuth+"/ "+orAuth);
//		} else {
//			userInfo.setValue("AuthInfo",andAuth+orAuth);
//		}		
//	}	
//}

exports.getRow = function( index ){
	
	var userList = app.lookup("APB_grdUserList");
	return userList.getRow(index);	
}

exports.getRowState = function( index ){
	
	var userList = app.lookup("APB_grdUserList");
	return userList.getRowState(index);	
}

exports.setRowState = function(index, state){
	var dsUserList = app.lookup("UserList");
	dsUserList.setRowState(index, state);
}
/*
 * make bisangoo
 */
//exports.setUnCheckAll = function(idx,checked){
//	var userList = app.lookup("APB_grdUserList");
//	var indices = userList.getCheckRowIndices();
//	
//	indices.forEach(function(idx){
//		userList.setCheckRowIndex(idx, false);		
//	});
//} 

//exports.findInnerUserList = function(category,keyword){
//	var grdUserList = app.lookup("APB_grdUserList");
//	var user;
//	if (category == "Name") {
//		user = grdUserList.findFirstRow(category + " == '" + keyword + "'");
//	} else if (category == "UniqueID") {
//		user = grdUserList.findFirstRow(category + " == '" + keyword + "'");
//	}
//	
//	if (user) {
//		var idx = user.getIndex();
//		grdUserList.selectRows(idx);
//		grdUserList.focusCell(idx, 0);
//	} else {
//		if (category == "Name") {
//			dialogAlert(app, "Waning", dataManager.getString("Str_ErrorNoNameFound"));
//		} else if (category == "UniqueID") {
//			dialogAlert(app, "Waning", dataManager.getString("Str_ErrorNoUniqueIDFound"));
//		}
//		
//	}
//}



/**
 * 사용자 리스트 컨트롤의 페이징 정보를 설정합니다.
 */
exports.setPaging = function( totalCount, currentPageIndex, pageRowCount, viewPageCount ) {
	var pageIndex = app.lookup("APB_userListPageIndexer");
	
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.currentPageIndex = currentPageIndex;//현재 선택된 페이지의 인덱스
	pageIndex.pageRowCount = pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	
	if( APB_grdUserList_enablePageIndexer == true ){
		if(totalCount == 0) {
			pageIndex.visible = false;
		} else {
			pageIndex.visible = true;
		}
	}else {
		pageIndex.visible = false;
	}
	
	pageIndex.redraw();
}

exports.setPaging = function( totalCount, pageRowCount, viewPageCount ) {
	var pageIndex = app.lookup("APB_userListPageIndexer");
	
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	//pageIndex.currentPageIndex = currentPageIndex;//현재 선택된 페이지의 인덱스
	pageIndex.pageRowCount = pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
		
	if( APB_grdUserList_enablePageIndexer == true ){
		if(totalCount == 0) {
			pageIndex.visible = false;
		} else {
			pageIndex.visible = true;
		}
	}else {
		pageIndex.visible = false;
	}
	pageIndex.redraw();
}

exports.setTotalCount = function(totalCount) {
	
	var pageIndex = app.lookup("APB_userListPageIndexer");
	pageIndex.totalRowCount = totalCount
	
	if( APB_grdUserList_enablePageIndexer == true ){
		if(totalCount == 0) {
			pageIndex.visible = false;
		} else {
			pageIndex.visible = true;
		}
	}else {
		pageIndex.visible = false;
	}
	
	pageIndex.redraw();
}

exports.getCurrentPageIndex = function() {	
	var pageIndex = app.lookup("APB_userListPageIndexer");
	return pageIndex.currentPageIndex
}

exports.setCurrentPageIndex = function(index) {	
	var pageIndex = app.lookup("APB_userListPageIndexer");	
	pageIndex.currentPageIndex = index;	
}

exports.setPageRowCount = function(count) {	
	var pageIndex = app.lookup("APB_userListPageIndexer");	
	pageIndex.pageRowCount = count;	
}

exports.getPageRowCount = function() {	
	var pageIndex = app.lookup("APB_userListPageIndexer");	
	return pageIndex.pageRowCount;	
}

exports.refreshUserList = function(idMap){
	var dsUserList = app.lookup("UserList");
	
	var total = dsUserList.getRowCount();
	for ( var i = 0; i < total; i++){		
		var row = dsUserList.getRow(i);				
		if (row){
			var userID = row.getValue("ID");			
									
			if( idMap.get(userID) != undefined ){
				dsUserList.setRowState(i,cpr.data.tabledata.RowState.DELETED);	
			} else {				
				dsUserList.setRowState(i,cpr.data.tabledata.RowState.UNCHANGED);
			}
		} 
	}
	
	var userList = app.lookup("APB_grdUserList");
	userList.redraw();
}

/*
 * make bisangoo
 */
exports.getIsCheckedRow = function(rowIndex) {
	var userList = app.lookup("APB_grdUserList");
	return userList.isCheckedRow(rowIndex);
}

/*
 * make bisangoo
 */
exports.refreshCheckboxStatus = function(idMap) {
	var userList = app.lookup("APB_grdUserList");
	var total = userList.getRowCount();
	for(var i =0; i < total; i++) {
		var row = userList.getRow(i);
		if(row) {
			var userID = row.getValue("ID");
			if( idMap.get(userID) != undefined ){
				userList.setCheckRowIndex(i, true);	
			} else {				
				userList.setCheckRowIndex(i, false);
			}
		}
	}
	userList.redraw();
}




/*
 * 페이지 인덱서에서 before-selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경되기 전에 발생하는 이벤트. 다음 이벤트로 selection-change를 발생합니다.
 */
function onAPB_userListPageIndexerBeforeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var aPB_userListPageIndexer = e.control;
	
	var selectionEvent = new cpr.events.CSelectionEvent("before-pagechange", {
		oldSelection: e.oldSelection,
		newSelection: e.newSelection
	});
	
	app.dispatchEvent(selectionEvent);
	
	// 기본처리가 중단되었을 때 변경을 취소함.
	if(selectionEvent.defaultPrevented == true) {
		e.preventDefault();
	}
	
}


/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onAPB_userListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var aPB_userListPageIndexer = e.control;
	
	var selectionEvent = new cpr.events.CSelectionEvent("pagechange", {
		oldSelection: e.oldSelection,
		newSelection: e.newSelection
	});
	
	app.dispatchEvent(selectionEvent);
}




/*
 * 그리드에서 row-dblclick 이벤트 발생 시 호출.
 * detail이 row를 더블클릭 한 경우 발생하는 이벤트.
 */
function onAPB_grdUserListRowDblclick(/* cpr.events.CGridMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var aPB_grdUserList = e.control;
	
	var gridEvent = new cpr.events.CGridEvent("userListDblclick", {
		 row:e.row
	});
	
	app.dispatchEvent(gridEvent);
}
