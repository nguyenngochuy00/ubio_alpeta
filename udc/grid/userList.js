/************************************************
 * userList.js
 * Created at 2018. 11. 15. 오후 1:52:16.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var udcUserList_enablePageIndexer = true;
var oem_version;

function onBodyLoad(/* cpr.events.CEvent */ e){	
	dataManager = getDataManager();
	udcUserList_enablePageIndexer = true;
	oem_version = dataManager.getOemVersion();
		
	var groupList = dataManager.getGroup();
	if( groupList && groupList.getRowCount()>0){
		var cmbGroup = app.lookup("userListGrid_cmbGroup");
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
	
	var positionList = dataManager.getPositionList();
	if( positionList && positionList.getRowCount()>0){
		var cmbPosition = app.lookup("userListGrid_cmbPosition");
		var count = positionList.getRowCount();
		for ( var i = 0; i < count; i++ ){			
			var positionInfo = positionList.getRow(i);						
			cmbPosition.addItem(new cpr.controls.Item(positionInfo.getValue("Name"),positionInfo.getValue("PositionID")));
		}
					
	}
	
	var accessGroupList = dataManager.getAccessGroup();
	if( accessGroupList && accessGroupList.getRowCount()>0){
		var cmbAccessGroup = app.lookup("userListGrid_cmbAccessGroup");
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
	
	var privilegeList = dataManager.getPrivilegeList();	

	if( privilegeList ){
		var cmbPrivilege = app.lookup("UDC_grdUserList_cmbPrivilege");	
		var ItemAdmin = new cpr.controls.Item(dataManager.getString("Str_Admin"),1);
		var ItemNormalUser = new cpr.controls.Item(dataManager.getString("Str_NormalUser"),2);
		var ItemDisplayBoardAdmin = new cpr.controls.Item(dataManager.getString("Str_DisplayBoardManager"), DLG_DISPLAYBOARD_MANAGEMENT);

		ItemAdmin.bind("label").toLanguage("Str_Admin");
		ItemNormalUser.bind("label").toLanguage("Str_NormalUser");
		ItemDisplayBoardAdmin.bind("label").toLanguage("Str_DisplayBoardManager");
		
		cmbPrivilege.addItem(ItemAdmin);
		cmbPrivilege.addItem(ItemNormalUser);
		cmbPrivilege.addItem(ItemDisplayBoardAdmin);
		
		switch (oem_version) {
		case OEM_ARMY_HQ:
		case OEM_ROKMCH:
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_OnDuty"), UserPrivArmyOnDuty));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_OtherUnit"), UserPrivArmyOtherUnit));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Foreign"), UserPrivArmyForeign));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Soldier"), UserPrivArmySoldier));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Family"), UserPrivArmyFamily));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Resident"), UserPrivArmyResident));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Regular"), UserPrivArmyRegular));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_MilitaryPersonnel"), UserPrivArmyMilitaryPersonnel));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_ArmyPublicServicel"), UserPrivArmyPublicService));
			app.lookup("UDC_grdUserList").header.getColumn(5).bind("text").toLanguage("Str_ARMY_UserGroup1");
			break;
		case OEM_LOTTE_OSIRIA:
			cmbPrivilege.addItem(new cpr.controls.Item("일반직",101));
			cmbPrivilege.addItem(new cpr.controls.Item("특수직",102));
			cmbPrivilege.addItem(new cpr.controls.Item("캐스트",103));
			cmbPrivilege.addItem(new cpr.controls.Item("용역직",104));
			cmbPrivilege.addItem(new cpr.controls.Item("파견직",105));
			cmbPrivilege.addItem(new cpr.controls.Item("일용직",106));
			cmbPrivilege.addItem(new cpr.controls.Item("주차관리",107));
			cmbPrivilege.addItem(new cpr.controls.Item("전문직",108));
			cmbPrivilege.addItem(new cpr.controls.Item("전문캐스트",109));	
			break;
		case OEM_HYUNDAI_MSEAT:
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_TempUser"), 14)); // 현대엠시트 임시사용자
			break
		case OEM_BOSK_CAPS:
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_Visitor"), 3));
			break;
		}

		if ( dataManager.getOemVersion() == OEM_JAWOONDAE) {
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdOtherUnit"), Jwd_Other_Unit));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdForeign"), Jwd_Foreign));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdResident"), Jwd_Resident));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdAlways"), Jwd_Always));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdSoldier"), Jwd_Soldier));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdFamily"), Jwd_Family));	
		}
		cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_Visitor"), 10));
		
		//TODO : cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_Visitor"), 10));
						
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
	
	
	if ( dataManager.getOemVersion() != OEM_IDLINK_MBS) {
		app.lookup("UDC_grdUserList").columnVisible(15, false);	
	}
	
	app.lookup("UDC_grdUserList").columnVisible(14, false);
	
//	console.log("app.lookup(\"UDC_grdUserList\").columnVisible(14, false)");

		// 안티패스백 구역 이름 가져오기
		var smsArea = app.lookup("sms_getAreas");
		smsArea.send();
                                                                                      
}

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.	
	return "";
};

exports.enablePageIndexer = function( enable ){
	udcUserList_enablePageIndexer = enable;
	var pageIndex = app.lookup("userListPageIndexer");
	if( udcUserList_enablePageIndexer == true ){		
		pageIndex.visible = false;		
	}else {
		pageIndex.visible = false;
	}
}

exports.getCheckedRowIndices = function() {
	var userList = app.lookup("UDC_grdUserList");
	var indices = userList.getCheckRowIndices();
	var result = [];
	indices.forEach(function(idx){
		if(userList.getRowState(idx) != cpr.data.tabledata.RowState.DELETED ){
			result.push(idx);
		} else {
			userList.setCheckRowIndex(idx, false);
		}
	});
	return result;
}

exports.getSelectedID = function() {
	var grdUserList = app.lookup("UDC_grdUserList");
	var row = grdUserList.getSelectedRow();
	if(row){
		return row.getValue("ID")
	}
	return null
}

exports.getSelectedRowData = function() {
	var grdUserList = app.lookup("UDC_grdUserList");
	var row = grdUserList.getSelectedRow();
	if(row){
		return row.getRowData();
	}
	return null
}

exports.moveColumn = function(sourceIndex, targetIndex){	
	var grdUserList = app.lookup("UDC_grdUserList");
	grdUserList.moveColumn(sourceIndex, targetIndex);	
};

exports.deleteColumn = function(indices){
	if (indices==undefined || indices == null ){
		return;
	}
	var gridUserList = app.lookup("UDC_grdUserList");
	indices.forEach(function(index){
		gridUserList.deleteColumn(index);
	});	
};

exports.visibleColumn = function(cellIndex, visible) {
	var gridUserList = app.lookup("UDC_grdUserList");
	gridUserList.columnVisible(cellIndex, visible);			
}

exports.deleteRow = function(checkRow) {
	var userList = app.lookup("UDC_grdUserList");
	if( checkRow >= userList.getRowCount()){
		return;
	}
	userList.deleteRow(checkRow);
	userList.setCheckRowIndex(checkRow, false);
	return;
}

exports.realDeleteRow = function(index) {
	var userList = app.lookup("UserList");	
	userList.realDeleteRow(index);	
	return;
}

exports.deleteUser = function(deleteID) {
	var userList = app.lookup("UDC_grdUserList");
	var getUserInfo = userList.findFirstRow("ID == "+ deleteID);
	
	if (getUserInfo) {
		userList.deleteRow(getUserInfo.getIndex());	
	} 
	return;
}

exports.setUserList = function( /*cpr.data.DataSet*/userDataSet ){
			
	var userList = app.lookup("UserList");
	var userListSrc = app.lookup("UserListSrc");
	
	userList.clear();	
	userListSrc.clear();		
	
	userDataSet.copyToDataSet(userList);	
	userDataSet.copyToDataSet(userListSrc);
		
	userList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	
	var grdUserList = app.lookup("UDC_grdUserList");	
	grdUserList.redraw();
}

exports.setFilter = function(category,keyword){
	if (dataManager.getOemVersion() == OEM_OMAN_TERMINAL_UPDATEUSER) {
		if (category != "id" && category != "name" && category != "UpdateX" && category != "UpdateO"){
			return;
		}
	}
	else {
		if (category != "id" && category != "name"){return;}	
	}
	
	
	var userList = app.lookup("UserList");
	userList.clear();
	
	keyword = keyword.toLowerCase();
	
	var userListSrc = app.lookup("UserListSrc");
	var count = userListSrc.getRowCount();
	for( var i = 0; i < count; i++ ){
		var user = userListSrc.getRow(i);
		var srcData;
		
		if (category == "UpdateX" || category == "UpdateO") {
			if (category == "UpdateX" && user.getValue("UpdateFlag") == 0){
				userList.addRowData(user.getRowData());
			} else if (category == "UpdateO" && user.getValue("UpdateFlag") == 1){
				userList.addRowData(user.getRowData());
			}
			continue;
		}
		
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
			
	var pageIndex = app.lookup("userListPageIndexer");
	pageIndex.totalRowCount = 0;
	pageIndex.visible = false;	
	pageIndex.redraw();
	
	var userListSet = app.lookup("UserList");
	userListSet.clear();
				
	var userList = app.lookup("UDC_grdUserList");	
	userList.redraw();
}

exports.setUserListRows = function( /*cpr.data.RowConfigInfo[]*/userData ){
			
	var userListSet = app.lookup("UserList"); 
	userListSet.clear();	
	userListSet.build(userData);	
	userListSet.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	
	var userList = app.lookup("UDC_grdUserList");	
	userList.redraw();	
}

exports.getUserID = function( index ){
	
	var userList = app.lookup("UDC_grdUserList");
	var userID = userList.getRow(index).getString("ID");
	return userID;
}

exports.getRowData = function( index ){
	
	var userList = app.lookup("UDC_grdUserList");
	return userList.getRow(index).getRowData();	
}

exports.updateUserInfo = function( userInfoData ){
	
	var groupList = dataManager.getGroup();
	if( groupList && groupList.getRowCount()>0){
		var cmbGroup = app.lookup("userListGrid_cmbGroup");
		var count = groupList.getRowCount();
		for ( var i = 0; i < count; i++ ){			
			var groupInfo = groupList.getRow(i);						
			cmbGroup.addItem(new cpr.controls.Item(groupInfo.getValue("Name"),groupInfo.getValue("GroupID")));
		}	
	}
	
	var positionList = dataManager.getPositionList();
	if( positionList && positionList.getRowCount()>0){
		var cmbPosition = app.lookup("userListGrid_cmbPosition");
		var count = positionList.getRowCount();
		for ( var i = 0; i < count; i++ ){			
			var positionInfo = positionList.getRow(i);						
			cmbPosition.addItem(new cpr.controls.Item(positionInfo.getValue("Name"),positionInfo.getValue("PositionID")));
		}	
	}
	
	var accessGroupList = dataManager.getAccessGroup();
	if( accessGroupList && accessGroupList.getRowCount()>0){
		var cmbAccessGroup = app.lookup("userListGrid_cmbAccessGroup");
		var count = accessGroupList.getRowCount();
		for ( var i = 0; i < count; i++ ){			
			var accessGroupInfo = accessGroupList.getRow(i);						
			cmbAccessGroup.addItem(new cpr.controls.Item(accessGroupInfo.getValue("Name"),accessGroupInfo.getValue("ID")));
		}
	}
	
	
	var dsUserList = app.lookup("UserList");
	var userInfo = dsUserList.findFirstRow("ID == '"+userInfoData.ID+"'");
	if(userInfo){
		
		userInfo.setRowData(userInfoData);
		
		var AuthType = userInfo.getValue("AuthInfo").split(',');
				
		var setCount = 0;
		var andAuth = "";
		for( var idx=0; idx < AuthType[7]; idx++ ){		
			if(AuthType[idx]!="0"){
				andAuth += getAuthTypeString( parseInt(AuthType[idx],10))+" ";
				setCount++;
			}	
		}
		var orAuth = "";	
		for( var idx=AuthType[7]; idx< AuthType.length-1; idx++ ){		
			if(AuthType[idx]!="0"){
				orAuth += getAuthTypeString( parseInt(AuthType[idx],10))+" ";
				setCount++;
			}
		}
			
		if( setCount > 1 ){
			userInfo.setValue("AuthInfo",andAuth+"/ "+orAuth);
		} else {
			userInfo.setValue("AuthInfo",andAuth+orAuth);
		}		
	}	
}

exports.getRow = function( index ){
	
	var userList = app.lookup("UDC_grdUserList");
	return userList.getRow(index);	
}

exports.getRowState = function( index ){
	
	var userList = app.lookup("UDC_grdUserList");
	return userList.getRowState(index);	
}

exports.setRowState = function(index, state){
	var dsUserList = app.lookup("UserList");
	dsUserList.setRowState(index, state);
}
/*
 * make bisangoo
 */
exports.setUnCheckAll = function(idx,checked){
	var userList = app.lookup("UDC_grdUserList");
	var indices = userList.getCheckRowIndices();
	
	indices.forEach(function(idx){
		userList.setCheckRowIndex(idx, false);		
	});
}

exports.setCheckAll = function(checked){
	var userList = app.lookup("UDC_grdUserList");
	var total = userList.getRowCount();
	
	for (var i = 0; i < total; i++) {
		userList.setCheckRowIndex(i, checked);
	}
} 
 

exports.findInnerUserList = function(category,keyword){
	var grdUserList = app.lookup("UDC_grdUserList");
	var user;
	if (category == "Name") {
		user = grdUserList.findFirstRow(category + " == '" + keyword + "'");
	} else if (category == "UniqueID") {
		user = grdUserList.findFirstRow(category + " == '" + keyword + "'");
	}
	
	if (user) {
		var idx = user.getIndex();
		grdUserList.selectRows(idx);
		grdUserList.focusCell(idx, 0);
	} else {
		if (category == "Name") {
			dialogAlert(app, "Waning", dataManager.getString("Str_ErrorNoNameFound"));
		} else if (category == "UniqueID") {
			dialogAlert(app, "Waning", dataManager.getString("Str_ErrorNoUniqueIDFound"));
		}
		
	}
}



/**
 * 사용자 리스트 컨트롤의 페이징 정보를 설정합니다.
 */
exports.setPaging = function( totalCount, currentPageIndex, pageRowCount, viewPageCount ) {
	var pageIndex = app.lookup("userListPageIndexer");
	
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.currentPageIndex = currentPageIndex;//현재 선택된 페이지의 인덱스
	pageIndex.pageRowCount = pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	
	if( udcUserList_enablePageIndexer == true ){
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
	var pageIndex = app.lookup("userListPageIndexer");
	
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	//pageIndex.currentPageIndex = currentPageIndex;//현재 선택된 페이지의 인덱스
	pageIndex.pageRowCount = pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
		
	if( udcUserList_enablePageIndexer == true ){
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
	
	var pageIndex = app.lookup("userListPageIndexer");
	pageIndex.totalRowCount = totalCount
	
	if( udcUserList_enablePageIndexer == true ){
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
	var pageIndex = app.lookup("userListPageIndexer");
	return pageIndex.currentPageIndex
}

exports.setCurrentPageIndex = function(index) {	
	var pageIndex = app.lookup("userListPageIndexer");	
	pageIndex.currentPageIndex = index;	
}

exports.setPageRowCount = function(count) {	
	var pageIndex = app.lookup("userListPageIndexer");	
	pageIndex.pageRowCount = count;	
}

exports.getPageRowCount = function() {	
	var pageIndex = app.lookup("userListPageIndexer");	
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
	
	var userList = app.lookup("UDC_grdUserList");
	userList.redraw();
}

exports.resizableColumns = function(state) {
	var gridUserList = app.lookup("UDC_grdUserList");
	if (state == "all") {
		gridUserList.resizableColumns = "all";
	} else {
		gridUserList.resizableColumns = "none";
	}
};

/*
 * make bisangoo
 */
exports.getIsCheckedRow = function(rowIndex) {
	var userList = app.lookup("UDC_grdUserList");
	return userList.isCheckedRow(rowIndex);
}

/*
 * make bisangoo
 */
exports.refreshCheckboxStatus = function(idMap) {
	var userList = app.lookup("UDC_grdUserList");
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
function onUserListPageIndexerBeforeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var userListPageIndexer = e.control;
	
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
function onUserListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var userListPageIndexer = e.control;
	
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
function onUserListGridRowDblclick(/* cpr.events.CGridEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var userListGrid = e.control;
	
	var gridEvent = new cpr.events.CGridEvent("userListDblclick", {
		 row:e.row
	});
	
	app.dispatchEvent(gridEvent);
}





/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onUDC_grdUserListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var uDC_grdUserList = e.control;
	var gridRow = uDC_grdUserList.getRow(e.newSelection[0]);
	
	var selectionEvent = new cpr.events.CSelectionEvent("userListClick", {		
		oldSelection: e.oldSelection,
		newSelection: gridRow
	});
		
	app.dispatchEvent(selectionEvent);
}

exports.getSelectedRow = function() {
	var userListGrid = app.lookup("UDC_grdUserList");
	var selectionRow = userListGrid.getSelectedRow();
	
	if (selectionRow.getIndex() != null) {
		return selectionRow;
	}
	
	return null;
}

exports.changeColumnNameGroupToPartner = function() {
	var userListGrid = app.lookup("UDC_grdUserList");
	userListGrid.header.getColumn(3).bind("text").toLanguage("Str_UserID");
}

exports.setMultiCheck = function(isMulti){
	var userListGrid = app.lookup("UDC_grdUserList");
	if (isMulti){
		userListGrid.selectionMulti = "multi";
	} else {
		userListGrid.selectionMulti = "single";
	}
}


exports.getAreaName = function(areaID){
	var cmbAreaList = app.lookup("UDC_grdUserList_cmbApbArea");
	var areaName = cmbAreaList.getItemByValue(areaID);
	if (!areaName){
		areaName = "";
	}
	return areaName.label;
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getAreasSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getAreas = e.control;
	var apbList = app.lookup("AreaList");
	if (apbList.getRowCount() > 0) {
		var cmbAPB = app.lookup("UDC_grdUserList_cmbApbArea");
		cmbAPB.setItemSet(apbList, {
			label: "Name",
			value: "AreaID"
		});
	}
}
