/************************************************
 * terminalList.js
 * Created at 2018. 11. 16. 오후 2:15:26.
 *
 * @author wonki
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var groupCode = getLoginUserGroupCode();
/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};

exports.getCheckedRowIndices = function() {
	var terminalList = app.lookup("terminalListGrid");
	
	var indices = terminalList.getCheckRowIndices();
	
	var result = [];
	indices.forEach(function(idx){
		if(terminalList.getRowState(idx) != cpr.data.tabledata.RowState.DELETED ){
			result.push(idx);
		} else {
			terminalList.setCheckRowIndex(idx, false);
		}
	});
	
	return result;
}

exports.getSelectedTerminalID = function(){
	var terminalList = app.lookup("terminalListGrid");
	var selectedRow = terminalList.getSelectedRow()
	if( selectedRow ){
		return selectedRow.getValue("ID");
	}
	return ""
}


exports.getSelectedTerminalType = function(){
	var terminalList = app.lookup("terminalListGrid");
	var selectedRow = terminalList.getSelectedRow()
	if( selectedRow ){
		return selectedRow.getValue("Type");
	}
	return ""
}
/*
 * make bisangoo
 */
exports.getIsCheckedRow = function(rowIndex) {
	var terminalList = app.lookup("terminalListGrid");
	return terminalList.isCheckedRow(rowIndex);
}


exports.setUnCheckAll = function(idx,checked){
	var terminalList = app.lookup("terminalListGrid");
	var indices = terminalList.getCheckRowIndices();
	
	indices.forEach(function(idx){
		terminalList.setCheckRowIndex(idx, false);		
	});
} 

exports.deleteColumn = function(indices){
	if (indices==undefined || indices == null ){
		return;
	}
	var gridUserList = app.lookup("terminalListGrid");
	indices.forEach(function(index){
		gridUserList.deleteColumn(index);
	});	
};

exports.deleteRow = function(checkedRowIndices) {
	//console.log("checkedRowIndices "+checkedRowIndices);
	var dsTerminalList = app.lookup("TerminalList");
	var terminalInfo = dsTerminalList.findFirstRow("ID == "+ checkedRowIndices);
	//terminalList.clearAllCheck();
	if (terminalInfo) {
		dsTerminalList.deleteRow(terminalInfo.getIndex());	
	}
	return;
}

exports.deleteTerminal = function(terminalID) {
	//console.log("terminalID "+terminalID);
	var dsTerminalList = app.lookup("TerminalList");
	var terminalInfo = dsTerminalList.findFirstRow("ID == "+ terminalID);
	
	if (terminalInfo) {
		dsTerminalList.deleteRow(terminalInfo.getIndex());	
	}
	return;
}

exports.setGroupList = function(/*cpr.data.DataSet*/groupList){
	var dsGroupList = app.lookup("GroupList");	
	groupList.copyToDataSet(dsGroupList);
	
	if( groupList && groupList.getRowCount()>0){
		var cmbGroup = app.lookup("TerminalList_cmbGroup");
		var count = groupList.getRowCount();
		for ( var i = 0; i < count; i++ ){			
			var groupInfo = groupList.getRow(i);						
			cmbGroup.addItem(new cpr.controls.Item(groupInfo.getValue("Name"),groupInfo.getValue("GroupID")));
		}			
	}
}

exports.setTerminalList = function( /*cpr.data.DataSet*/terminalDataSet, filter ){
			
	var terminalListSet = app.lookup("TerminalList");
	terminalListSet.clear();
	if (filter == "connect") { // 연결된 단말기만 표시
		var rowCount = terminalDataSet.getRowCount();
		for (var i=0; i < rowCount; i++) {
			var rowData = terminalDataSet.getRow(i);
			var status = rowData.getValue("Status");
			var connStatus = checkTerminalConnectionStatus(status);
			//console.log("connStatus: " + connStatus);
			if (connStatus == 3) {
				terminalListSet.addRowData(terminalDataSet.getRowData(i));
			}
		}
		terminalListSet.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	} else { //등록된 모든 단말기 표시
		terminalDataSet.copyToDataSet(terminalListSet);
		terminalListSet.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	}
	
	var terminalList = app.lookup("terminalListGrid");
	dataManager = getDataManager();
	if (dataManager.getOemVersion() == OEM_JAWOONDAE) {
		var columnWidths = terminalList.getColumnLayout();
		console.log(columnWidths);
		columnWidths['columnLayout'][1]['width'] = 200;
		terminalList.setColumnLayout(columnWidths);	
	}
	
	terminalList.redraw();
	
/*	
	terminalDataSet.copyToDataSet(terminalListSet);
	terminalListSet.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	
	if( filter != "" && filter != undefined){
		terminalListSet.setFilter(filter); // 이제 status 로 필터를 넣을 수 없다.
	}
	var terminalList = app.lookup("terminalListGrid");	
	terminalList.redraw();

*/	
}

exports.setTerminalListGroup = function( /*cpr.data.DataSet*/terminalDataSet, filter ){
	
	dataManager = getDataManager();
	var terminalList = app.lookup("terminalListGrid");	
	var terminalListSet = app.lookup("TerminalList");
	terminalListSet.clear();
	if (filter == "connect") { // 연결된 단말기만 표시
		var rowCount = terminalDataSet.getRowCount();
		var ids = getLoginUserAccessibleGroupIDs();
		for (var i=0; i < rowCount; i++) {
			var rowData = terminalDataSet.getRow(i);
			var status = rowData.getValue("Status");
			var connStatus = checkTerminalConnectionStatus(status);
			//console.log("connStatus: " + connStatus);
			if (connStatus == 3) {
//				if(!isSuperGroupAdmin()){ // Master와 상위 부서 관리자가 아니면 본인 부서 단말기만 보임 (22년도)
//					if (groupCode==terminalDataSet.getValue(i,"GroupCode")){	//user
//						terminalListSet.addRowData(terminalDataSet.getRowData(i));
//					}
//				} else {	//master와 상위 부서 관리자
//					terminalListSet.addRowData(terminalDataSet.getRowData(i));
//				}
				
				if(!isLoginMaster()){
					var gID = terminalDataSet.getValue(i,"GroupCode");
					for (var j = 0; j < ids.length; j++){
						if (gID == ids[j]){
							terminalListSet.addRowData(terminalDataSet.getRowData(i));
							ids.splice(j, 1);
							break;
						}
					}		
					continue;
				}
				terminalListSet.addRowData(terminalDataSet.getRowData(i));
			}
		}
		terminalListSet.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	} else { //등록된 모든 단말기 표시
		terminalDataSet.copyToDataSet(terminalListSet);
		terminalListSet.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	}

	dataManager = getDataManager();
	if (dataManager.getOemVersion() == OEM_JAWOONDAE) {
		var columnWidths = terminalList.getColumnLayout();
		console.log(columnWidths);
		columnWidths['columnLayout'][1]['width'] = 200;
		terminalList.setColumnLayout(columnWidths);	
	}
	
	terminalList.redraw();
	
/*	
	terminalDataSet.copyToDataSet(terminalListSet);
	terminalListSet.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	
	if( filter != "" && filter != undefined){
		terminalListSet.setFilter(filter); // 이제 status 로 필터를 넣을 수 없다.
	}
	var terminalList = app.lookup("terminalListGrid");	
	terminalList.redraw();

*/	
}


exports.setTerminalListRows = function( /*cpr.data.RowConfigInfo[]*/terminalData ){
			
	var terminalListSet = app.lookup("TerminalList"); 
	terminalListSet.clear();	
	terminalListSet.build(terminalData);	
	terminalListSet.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	
	var terminalList = app.lookup("terminalListGrid");	
	terminalList.redraw();	
}

exports.updateTerminalInfo = function( terminalInfoData ){
	var dsTerminalList = app.lookup("TerminalList");
	var terminalInfo = dsTerminalList.findFirstRow("ID == '"+terminalInfoData.ID+"'");
	if(terminalInfo){		
		terminalInfo.setRowData(terminalInfoData);
	}	
}

exports.getTerminalID = function( index ){
	
	var terminalList = app.lookup("terminalListGrid");
	var terminalID = terminalList.getRow(index).getString("ID");
	return terminalID;
}

exports.getRowData = function( index ){
	
	var terminalList = app.lookup("terminalListGrid");
	return terminalList.getRow(index).getRowData();	
}

exports.getRow = function( index ){
	
	var terminalList = app.lookup("terminalListGrid");
	return terminalList.getRow(index);	
}

exports.getRowState = function( index ){
	
	var terminalList = app.lookup("terminalListGrid");
	return terminalList.getRowState(index);	
}

exports.setRowState = function(index, state){
	var terminalList = app.lookup("terminalListGrid");
	terminalList.setRowState(index, state);
}

exports.getRowCount = function(){
	var terminalList = app.lookup("terminalListGrid");
	return terminalList.getRowCount();
}

/**
 * 사용자 리스트 컨트롤의 페이징 정보를 설정합니다.
 */
exports.setPaging = function( totalCount, currentPageIndex, pageRowCount, viewPageCount ) {
	var pageIndex = app.lookup("terminalListPageIndexer");
	
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.currentPageIndex = currentPageIndex;//현재 선택된 페이지의 인덱스
	pageIndex.pageRowCount = pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	
	if(totalCount == 0) {
		pageIndex.visible = false;
	} else {
		pageIndex.visible = true;
	}
	
	pageIndex.redraw();
}

exports.setPaging = function( totalCount, pageRowCount, viewPageCount ) {
	var pageIndex = app.lookup("terminalListPageIndexer");
	
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	//pageIndex.currentPageIndex = currentPageIndex;//현재 선택된 페이지의 인덱스
	pageIndex.pageRowCount = pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	
	if(totalCount == 0) {
		pageIndex.visible = false;
	} else {
		pageIndex.visible = true;
	}
	pageIndex.redraw();
}

exports.setTotalCount = function(totalCount) {
	
	var pageIndex = app.lookup("terminalListPageIndexer");
	pageIndex.totalRowCount = totalCount
	
	if(totalCount == 0) {
		pageIndex.visible = false;
	} else {
		pageIndex.visible = true;
	}
	
	pageIndex.redraw();
}

exports.getCurrentPageIndex = function() {	
	var pageIndex = app.lookup("terminalListPageIndexer");
	return pageIndex.currentPageIndex
}

exports.setCurrentPageIndex = function(index) {	
	var pageIndex = app.lookup("terminalListPageIndexer");	
	pageIndex.currentPageIndex = index;	
}

exports.setPageRowCount = function(count) {	
	var pageIndex = app.lookup("terminalListPageIndexer");	
	pageIndex.pageRowCount = count;	
}

exports.getPageRowCount = function() {	
	var pageIndex = app.lookup("terminalListPageIndexer");	
	return pageIndex.pageRowCount;	
}

exports.refreshTerminalList = function(idMap){
	var dsTerminalList = app.lookup("TerminalList");
	var total = dsTerminalList.getRowCount();
	for ( var i = 0; i < total; i++){		
		var row = dsTerminalList.getRow(i);		
		
		if (row){
			var terminalID = row.getValue("ID");
			if( idMap.get(terminalID) != undefined ){
				dsTerminalList.setRowState(i,cpr.data.tabledata.RowState.DELETED);	
			} else {				
				dsTerminalList.setRowState(i,cpr.data.tabledata.RowState.UNCHANGED);
			}
		} 
	}
	
	var terminalList = app.lookup("terminalListGrid");
	terminalList.redraw();
}

exports.clearTerminalList = function(  ){
			
	var pageIndex = app.lookup("terminalListPageIndexer");
	pageIndex.totalRowCount = 0;
	pageIndex.visible = false;	
	pageIndex.redraw();
	
	var terminalListSet = app.lookup("TerminalList");
	terminalListSet.clear();			
	
	var terminalList = app.lookup("terminalListGrid");	
	terminalList.redraw();
}
/*
 * make bisangoo
 */
exports.refreshCheckboxStatus = function(idMap){
	var TerminalList = app.lookup("terminalListGrid");
	var total = TerminalList.getRowCount();
	for ( var i = 0; i < total; i++){		
		var row = TerminalList.getRow(i);		
		if (row){
			var terminalID = row.getValue("ID");
									
			if( idMap.get(terminalID) != undefined ){
				TerminalList.setCheckRowIndex(i, true);	
			} else {				
				TerminalList.setCheckRowIndex(i, false);
			}
		} 
	}
	
	TerminalList.redraw();
}
/*
 * 페이지 인덱서에서 before-selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경되기 전에 발생하는 이벤트. 다음 이벤트로 selection-change를 발생합니다.
 */
function onTerminalListPageIndexerBeforeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var terminalListPageIndexer = e.control;
	
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
function onTerminalListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var terminalListPageIndexer = e.control;
	
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
function onTerminalListGridRowDblclick(/* cpr.events.CGridEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var terminalListGrid = e.control;
	var selectionEvent = new cpr.events.CGridEvent("terminalListDblclick", {
		row: e.row,
		rowindex: e.rowIndex
	});
	
	app.dispatchEvent(selectionEvent);
}


/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onTerminalListGridSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var terminalListGrid = e.control;
	var gridRow = terminalListGrid.getRow(e.newSelection[0]);
	
	var selectionEvent = new cpr.events.CSelectionEvent("terminalListClick", {		
		oldSelection: e.oldSelection,
		newSelection: gridRow
	});
		
	app.dispatchEvent(selectionEvent);	
}


/*
 * 그리드에서 row-check 이벤트 발생 시 호출.
 * Grid의 RowCheckbox가 체크 되었을 때 발생하는 이벤트. (columnType=checkbox)
 */
function onTerminalListGridRowCheck(/* cpr.events.CGridEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var rowCheckEvent = new cpr.events.CGridEvent("terminalRowCheck", {		
		row: e.row,
		rowindex: e.rowIndex
	});
		
	app.dispatchEvent(rowCheckEvent);
}

exports.enabledGrid = function(value) {
	var TerminalList = app.lookup("terminalListGrid");
	var cmbGroup = app.lookup("TerminalList_cmbGroup");
	var cmbType = app.lookup("TerminalList_cmbType");
	
	if(value=="false"){
		TerminalList.enabled = false;
		cmbGroup.style.css({"color" : "#333333","background-color" : "#BBBBBB"});
		cmbType.style.css({"color" : "#333333","background-color" : "#BBBBBB"});
	} else if(value=="true"){
		TerminalList.enabled = true;
		cmbGroup.style.css({"background-color" : "transparent"});
		cmbType.style.css({"background-color" : "transparent"});
		
	}
}

// 그리드에서 필요없는 컬럼 보이지 않게 처리하는 함수 - 보이지 않게 처리할 컬럼 인덱스를 배열로 전달받아 처리.
exports.setColumVisible = function(columIndices) {
	var terminalListGrid = app.lookup("terminalListGrid");
	for (var i = 0; i < columIndices.length; i++){
		//console.log(columIndices[i]);
		terminalListGrid.columnVisible(columIndices[i], false);
	}
}
