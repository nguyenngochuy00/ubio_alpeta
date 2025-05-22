/************************************************
 * authLogList.js
 * Created at 2018. 12. 26. 오후 8:19:17.
 *
 * @author wonki
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var oem_version;

/*
https://www.google.com/maps/search/?api=1&query={0},{1};
*/

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	console.log("들어와따 ITONE2")
	dataManager = getDataManager();
	var dsGroupList = dataManager.getGroup();
	

	
	oem_version = dataManager.getOemVersion();

	 // authLogListGrid.redraw();	
}





/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};
exports.getSelectedRow = function() {
	var authLogListGrid = app.lookup("authLogListGrid");
	var selectionRow = authLogListGrid.getSelectedRow();
	
	if (selectionRow.getIndex() != null) {
		return selectionRow;
	}
	
	return null;
}

exports.getCheckedRowIndices = function() {
	var authLogList = app.lookup("authLogListGrid");
	var indices = authLogList.getCheckRowIndices();
	
	var result = [];
	indices.forEach(function(idx){
		if(authLogList.getRowState(idx) != cpr.data.tabledata.RowState.DELETED ){
			result.push(idx);
		} else {
			authLogList.setCheckRowIndex(idx, false);
		}
	});
	
	return result;
}

exports.setUnCheckAll = function(idx,checked){
	var authLogList = app.lookup("authLogListGrid");
	var indices = authLogList.getCheckRowIndices();
	
	indices.forEach(function(idx){
		authLogList.setCheckRowIndex(idx, false);		
	});
} 

exports.deleteColumn = function(indices){
	if (indices==undefined || indices == null ){
		return;
	}
	var authLogList = app.lookup("authLogListGrid");
	indices.forEach(function(index){
		authLogList.deleteColumn(index);
	});	
};

exports.deleteRow = function(checkedRowIndices) {
	var authLogList = app.lookup("authLogListGrid");
	authLogList.deleteRow(checkedRowIndices);
	authLogList.clearAllCheck();
	return;
}

exports.setAuthLogList = function( /*cpr.data.DataSet*/authLogDataSet ){
			
	var authLogListSet = app.lookup("AuthLogListCustomITONE");
	authLogListSet.clear();	
	authLogDataSet.copyToDataSet(authLogListSet);	
	authLogListSet.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	var authLogList = app.lookup("authLogListGrid");
	authLogList.redraw();
}

exports.setAuthLogListRows = function( /*cpr.data.RowConfigInfo[]*/authLogData ){
			
	var authLogListSet = app.lookup("AuthLogListCustomITONE"); 
	authLogListSet.clear();	
	authLogListSet.build(authLogData);	
	authLogListSet.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	
	var authLogList = app.lookup("authLogListGrid");	
	authLogList.redraw();	
}

exports.getAuthLogIndexKey = function( index ){
	
	var authLogList = app.lookup("authLogListGrid");
	var authLogIndexKey = authLogList.getRow(index).getString("IndexKey");
	return authLogIndexKey;
}

exports.getRowData = function( index ){
	
	var authLogList = app.lookup("authLogListGrid");
	return authLogList.getRow(index).getRowData();	
}

exports.getRow = function( index ){
	
	var authLogList = app.lookup("authLogListGrid");
	return authLogList.getRow(index);	
}

exports.getRowState = function( index ){
	
	var authLogList = app.lookup("authLogListGrid");
	return authLogList.getRowState(index);	
}

exports.setRowState = function(index, state){
	var authLogList = app.lookup("authLogListGrid");
	authLogList.setRowState(index, state);
}

exports.getRowCount = function(index, state){
	var authLogList = app.lookup("authLogListGrid");
	return authLogList.getRowCount();
}

/**
 * 사용자 리스트 컨트롤의 페이징 정보를 설정합니다.
 */
exports.setPaging = function( totalCount, currentPageIndex, pageRowCount, viewPageCount ) {
	var pageIndex = app.lookup("authLogListPageIndexer");
	
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
	var pageIndex = app.lookup("authLogListPageIndexer");
	
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
	
	var pageIndex = app.lookup("authLogListPageIndexer");
	pageIndex.totalRowCount = totalCount
	
	if(totalCount == 0) {
		pageIndex.visible = false;
	} else {
		pageIndex.visible = true;
	}
	
	pageIndex.redraw();
}

exports.getCurrentPageIndex = function() {	
	var pageIndex = app.lookup("authLogListPageIndexer");
	return pageIndex.currentPageIndex
}

exports.setCurrentPageIndex = function(index) {	
	var pageIndex = app.lookup("authLogListPageIndexer");	
	pageIndex.currentPageIndex = index;	
}

exports.setPageRowCount = function(count) {	
	var pageIndex = app.lookup("authLogListPageIndexer");	
	pageIndex.pageRowCount = count;	
}

exports.getPageRowCount = function() {	
	var pageIndex = app.lookup("authLogListPageIndexer");	
	return pageIndex.pageRowCount;	
}

exports.refreshAuthLogList = function(idMap){
	var dsAuthLogList = app.lookup("AuthLogListCustomITONE");
	
	var total = dsAuthLogList.getRowCount();
	for ( var i = 0; i < total; i++){		
		var row = dsAuthLogList.getRow(i);		
		if (row){
			var authLogIndexKey = row.getValue("IndexKey");
									
			if( idMap.get(authLogIndexKey) != undefined ){
				dsAuthLogList.setRowState(i,cpr.data.tabledata.RowState.DELETED);	
			} else {				
				dsAuthLogList.setRowState(i,cpr.data.tabledata.RowState.UNCHANGED);
			}
		} 
	}
	
	var authLogList = app.lookup("authLogListGrid");
	authLogList.redraw();
}

exports.clearAuthLogList = function(  ){
			
	var pageIndex = app.lookup("authLogListPageIndexer");
	pageIndex.totalRowCount = 0;
	pageIndex.visible = false;	
	pageIndex.redraw();
	
	var authLogListSet = app.lookup("AuthLogListCustomITONE");
	authLogListSet.clear();			
	
	var authLogList = app.lookup("authLogListGrid");	
	authLogList.redraw();
}

/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onAuthLogListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var authLogListPageIndexer = e.control;
	
	var selectionEvent = new cpr.events.CSelectionEvent("pagechange", {
		oldSelection: e.oldSelection,
		newSelection: e.newSelection
	});
	
	app.dispatchEvent(selectionEvent);
}


/*
 * 페이지 인덱서에서 before-selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경되기 전에 발생하는 이벤트. 다음 이벤트로 selection-change를 발생합니다.
 */
function onAuthLogListPageIndexerBeforeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var authLogListPageIndexer = e.control;
	
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


