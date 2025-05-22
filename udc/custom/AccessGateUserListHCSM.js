/************************************************
 * AccessGateUserListHCSM.js
 * Created at 2021. 11. 10. 오후 5:40:25.
 *
 * @author zxc
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var HCSM_grdUserList_enablePageIndexer = true;

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	HCSM_grdUserList_enablePageIndexer = true;
	
//	if( privilegeList ){
//		var cmbPrivilege = app.lookup("grdApbUserList_cmbPrivilege");	
//		var ItemAdmin = new cpr.controls.Item(dataManager.getString("Str_Admin"),1);
//		var ItemNormalUser = new cpr.controls.Item(dataManager.getString("Str_NormalUser"),2);
//		
//		ItemAdmin.bind("label").toLanguage("Str_Admin");
//		ItemNormalUser.bind("label").toLanguage("Str_NormalUser");
//		
//		cmbPrivilege.addItem(ItemAdmin);
//		cmbPrivilege.addItem(ItemNormalUser);
//		
//		var count = privilegeList.getRowCount();
//		for ( var i = 0; i < count; i++ ){			
//			var privilegeInfo = privilegeList.getRow(i);						
//			cmbPrivilege.addItem(new cpr.controls.Item(privilegeInfo.getValue("Name"),privilegeInfo.getValue("PrivilegeID")));
//		}
//		cmbPrivilege.setItemSet(privilegeList, {
//			label: "Name",
//			value: "PrivilegeID",
//		});
//	}
//	
//	var groupList = dataManager.getGroup();
//	if( groupList && groupList.getRowCount()>0){
//		var cmbGroup = app.lookup("grdApbUserList_cmbGroup");
//		var count = groupList.getRowCount();
//		for ( var i = 0; i < count; i++ ){			
//			var groupInfo = groupList.getRow(i);						
//			cmbGroup.addItem(new cpr.controls.Item(groupInfo.getValue("Name"),groupInfo.getValue("GroupID")));
//		}
//		/*
//		cmbGroup.setItemSet(groupList, {
//			label: "Name",
//			value: "GroupID",			
//		});
//		*/				
//	}

	// Company
	var companyList = dataManager.getCompanyList();
	if (companyList){
		var cmbCompany = app.lookup("HCSM_cmbCompany");
		var count = companyList.getRowCount();
		for (var i=0; i<count; i++){
			var companyInfo = companyList.getRow(i);
			cmbCompany.addItem(new cpr.controls.Item(companyInfo.getValue("CompanyName"),companyInfo.getValue("CompanyID")));
		}
	}
	
	// Team
	var teamList = dataManager.getTeamList();
	if (teamList){
		var cmbTeam = app.lookup("HCSM_cmbTeam");
		var count = teamList.getRowCount();
		for (var i=0; i<count; i++){
			var teamInfo = teamList.getRow(i);
			cmbTeam.addItem(new cpr.controls.Item(teamInfo.getValue("TeamName"),teamInfo.getValue("TeamID")));
		}
	}
	
	// Part
	var partList = dataManager.getPartList();
	if (partList){
		var cmbPart = app.lookup("HCSM_cmbPart");
		var count = partList.getRowCount();
		for (var i=0; i<count; i++){
			var partInfo = partList.getRow(i);
			cmbPart.addItem(new cpr.controls.Item(partInfo.getValue("PartName"),partInfo.getValue("PartID")));
		}
	}
	
	// Nationality
	var nationalityList = dataManager.getNationalityList();
	if (nationalityList){
		var cmbNationlity = app.lookup("HCSM_cmbNationality");
		var count = nationalityList.getRowCount();
		for (var i=0; i<count; i++){
			var nationalityInfo = nationalityList.getRow(i);
			cmbNationlity.addItem(new cpr.controls.Item(nationalityInfo.getValue("NationalityName"),nationalityInfo.getValue("NationalityID")));
		}
	}

}

//exports.setFilter = function(category,keyword){
//	if (category != "AreaID" && category != "name"){return;}
//	
//	var userList = app.lookup("UserList");
//	userList.clear();
//	
//	keyword = keyword.toLowerCase();
//	
//	var userListSrc = app.lookup("UserListSrc");
//	var count = userListSrc.getRowCount();
//	for( var i = 0; i < count; i++ ){
//		var user = userListSrc.getRow(i);
//		var srcData;
//		if (category == "id") {
//			srcData = user.getValue("ID");
//		} else if (category == "name") {
//			srcData = user.getValue("Name");
//		}
//		srcData = srcData.toLowerCase();
//		if (srcData.indexOf(keyword) != -1) {
//  			userList.addRowData(user.getRowData());
//		}		
//	}
//	userList.commit();
//}
//exports.clearFilter = function(){
//	var userList = app.lookup("UserList");
//	var userListSrc = app.lookup("UserListSrc");	
//	userList.clear();
//	userListSrc.copyToDataSet(userList);
//	userList.commit();
//}

exports.clearUserList = function(  ){
			
	var pageIndex = app.lookup("HCSM_userListPageIndexer");
	pageIndex.totalRowCount = 0;
	pageIndex.visible = false;	
	pageIndex.redraw();
	
	var userListSet = app.lookup("UserList");
	userListSet.clear();
				
	var userList = app.lookup("HCSM_grdUserList");	
	userList.redraw();
}

exports.setUserListRows = function( /*cpr.data.RowConfigInfo[]*/userData ){
			
	var userListSet = app.lookup("UserList"); 
	userListSet.clear();	
	userListSet.build(userData);	
	userListSet.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	
	var userList = app.lookup("HCSM_grdUserList");	
	userList.redraw();	
}

exports.setUserList = function( /*cpr.data.DataSet*/userDataSet ){
			
	var userList = app.lookup("UserList");
//	var userListSrc = app.lookup("UserListSrc");
	
	userList.clear();	
//	userListSrc.clear();		
	
	userDataSet.copyToDataSet(userList);	
//	userDataSet.copyToDataSet(userListSrc);
		
	userList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	
	var grdUserList = app.lookup("HCSM_grdUserList");	
	grdUserList.redraw();
}
//exports.getUserID = function( index ){
//	
//	var userList = app.lookup("HCSM_grdUserList");
//	var userID = userList.getRow(index).getString("AreaID");
//	return userID;
//}

exports.getRowData = function( index ){
	
	var userList = app.lookup("HCSM_grdUserList");
	return userList.getRow(index).getRowData();	
}


/**
 * 사용자 리스트 컨트롤의 페이징 정보를 설정합니다.
 */
exports.setPaging = function( totalCount, currentPageIndex, pageRowCount, viewPageCount ) {
	var pageIndex = app.lookup("HCSM_userListPageIndexer");
	
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.currentPageIndex = currentPageIndex;//현재 선택된 페이지의 인덱스
	pageIndex.pageRowCount = pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	
	if( HCSM_grdUserList_enablePageIndexer == true ){
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
	var pageIndex = app.lookup("HCSM_userListPageIndexer");
	
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	//pageIndex.currentPageIndex = currentPageIndex;//현재 선택된 페이지의 인덱스
	pageIndex.pageRowCount = pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
		
	if( HCSM_grdUserList_enablePageIndexer == true ){
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
	
	var pageIndex = app.lookup("HCSM_userListPageIndexer");
	pageIndex.totalRowCount = totalCount
	
	if( HCSM_grdUserList_enablePageIndexer == true ){
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
	var pageIndex = app.lookup("HCSM_userListPageIndexer");
	return pageIndex.currentPageIndex
}

exports.setCurrentPageIndex = function(index) {	
	var pageIndex = app.lookup("HCSM_userListPageIndexer");	
	pageIndex.currentPageIndex = index;	
}

exports.setPageRowCount = function(count) {	
	var pageIndex = app.lookup("HCSM_userListPageIndexer");	
	pageIndex.pageRowCount = count;	
}

exports.getPageRowCount = function() {	
	var pageIndex = app.lookup("HCSM_userListPageIndexer");	
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
	
	var userList = app.lookup("HCSM_grdUserList");
	userList.redraw();
}

/*
 * make bisangoo
 */
exports.getIsCheckedRow = function(rowIndex) {
	var userList = app.lookup("HCSM_grdUserList");
	return userList.isCheckedRow(rowIndex);
}

/*
 * make bisangoo
 */
exports.refreshCheckboxStatus = function(idMap) {
	var userList = app.lookup("HCSM_grdUserList");
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
function onHCSM_userListPageIndexerBeforeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var hCSM_userListPageIndexer = e.control;
	
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
function onHCSM_userListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var hCSM_userListPageIndexer = e.control;
	
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
function onHCSM_grdUserListRowDblclick(/* cpr.events.CGridMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var hCSM_grdUserList = e.control;
	
	var gridEvent = new cpr.events.CGridEvent("userListDblclick", {
		 row:e.row
	});
	
	app.dispatchEvent(gridEvent);
}
