/************************************************
 * sysLogList.js
 * Created at 2019. 1. 10. 오후 6:57:47.
 *
 * @author wonki
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
dataManager = getDataManager();

function onBodyLoad(/* cpr.events.CEvent */ e){
	initAuditCategory();
	initAuditContent();
	initAuditAction();	
	initAuditSource();	
	
	if (dataManager.getOemVersion() == OEM_MOTORCYCLE_PARK) {
		var layout = app.lookup("auditLogListGrid").getColumnLayout();
		layout.columnLayout.forEach(function(row, index){
			if (index == 4) {
				row.width = 150;
			}
		})
	
		app.lookup("auditLogListGrid").setColumnLayout(layout);
		app.lookup("auditLogListGrid").redraw();
		
	}
	var oemVersion = dataManager.getOemVersion();
	if (oemVersion == OEM_ITONE_TRDATA || oemVersion == OEM_ITONE_POSCO_DX) {
		var layout = app.lookup("auditLogListGrid").getColumnLayout();
		layout.header.forEach(function(each){
			if(each.cellIndex == 1) {
				each.visible = true;
			}
		});
		app.lookup("auditLogListGrid").setColumnLayout(layout);
		app.lookup("auditLogListGrid").redraw();
		initAuditCategory();
	}
	
}

function initAuditCategory(){
	var cmbAuditCategory = app.lookup("UDC_cmbAuditCategory");
	cmbAuditCategory.addItem(new cpr.controls.Item("", 0));
	cmbAuditCategory.setItemSet(getAuditCategory(), {label: "label", value: "value"});	
}

function initAuditContent(){
	var cmbAuditContent = app.lookup("UDC_cmbAuditContent");
	cmbAuditContent.addItem(new cpr.controls.Item("", 0));
	cmbAuditContent.setItemSet(getAuditContent(), {label: "label", value: "value"});
}

function initAuditAction(){
	var cmbAuditAction = app.lookup("UDC_cmbAuditAction");	
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditActingRegist"), 1));	
	cmbAuditAction.setItemSet(getAuditAction(), {label: "label", value: "value"});
}
	
function initAuditSource(){
	var cmbAuditSource = app.lookup("UDC_cmbAuditSource");
	cmbAuditSource.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditSrcServer"), 0));
	cmbAuditSource.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditSrcTerminal"), 1));	
}

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};

exports.getCheckedRowIndices = function() {
	var auditLogList = app.lookup("auditLogListGrid");
	var indices = auditLogList.getCheckRowIndices();
	
	var result = [];
	indices.forEach(function(idx){
		if(auditLogList.getRowState(idx) != cpr.data.tabledata.RowState.DELETED ){
			result.push(idx);
		} else {
			auditLogList.setCheckRowIndex(idx, false);
		}
	});
	
	return result;
}

exports.setUnCheckAll = function(idx,checked){
	var auditLogList = app.lookup("auditLogListGrid");
	var indices = auditLogList.getCheckRowIndices();
	
	indices.forEach(function(idx){
		auditLogList.setCheckRowIndex(idx, false);		
	});
} 

exports.deleteColumn = function(indices){
	if (indices==undefined || indices == null ){
		return;
	}
	var auditLogList = app.lookup("auditLogListGrid");
	indices.forEach(function(index){
		auditLogList.deleteColumn(index);
	});	
}

exports.deleteRow = function(checkedRowIndices) {
	var auditLogList = app.lookup("auditLogListGrid");
	auditLogList.deleteRow(checkedRowIndices);
	auditLogList.clearAllCheck();
	return;
}

exports.setAuditLogList = function( /*cpr.data.DataSet*/auditLogDataSet ){
			
	var auditLogListSet = app.lookup("AuditLogList");
	auditLogListSet.clear();	
	auditLogDataSet.copyToDataSet(auditLogListSet);	
	auditLogListSet.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	
	var auditLogList = app.lookup("auditLogListGrid");	
	auditLogList.redraw();
}

exports.setAuditLogListRows = function( /*cpr.data.RowConfigInfo[]*/auditLogData ){
			
	var auditLogListSet = app.lookup("AuditLogList"); 
	auditLogListSet.clear();	
	auditLogListSet.build(auditLogData);	
	auditLogListSet.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	
	var auditLogList = app.lookup("auditLogListGrid");	
	auditLogList.redraw();	
}

exports.getAuditLogIndexKey = function( index ){
	
	var auditLogList = app.lookup("auditLogListGrid");
	var auditLogIndexKey = auditLogList.getRow(index).getString("IndexKey");
	return auditLogIndexKey;
}

exports.getRowData = function( index ){
	
	var auditLogList = app.lookup("auditLogListGrid");
	return auditLogList.getRow(index).getRowData();	
}

exports.getRow = function( index ){
	
	var auditLogList = app.lookup("auditLogListGrid");
	return auditLogList.getRow(index);	
}

exports.getRowState = function( index ){
	
	var auditLogList = app.lookup("auditLogListGrid");
	return auditLogList.getRowState(index);	
}

exports.setRowState = function(index, state){
	var auditLogList = app.lookup("auditLogListGrid");
	auditLogList.setRowState(index, state);
}

exports.getRowCount = function(index, state){
	var auditLogList = app.lookup("auditLogListGrid");
	return auditLogList.getRowCount();
}

/**
 * 사용자 리스트 컨트롤의 페이징 정보를 설정합니다.
 */
exports.setPaging = function( totalCount, pageRowCount, viewPageCount ) {
	var pageIndex = app.lookup("auditLogListPageIndexer");
	
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
//	pageIndex.currentPageIndex = currentPageIndex;//현재 선택된 페이지의 인덱스
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
	
	var pageIndex = app.lookup("auditLogListPageIndexer");
	pageIndex.totalRowCount = totalCount
	
	if(totalCount == 0) {
		pageIndex.visible = false;
	} else {
		pageIndex.visible = true;
	}
	
	pageIndex.redraw();
}

exports.getCurrentPageIndex = function() {	
	var pageIndex = app.lookup("auditLogListPageIndexer");
	return pageIndex.currentPageIndex
}

exports.setCurrentPageIndex = function(index) {	
	var pageIndex = app.lookup("auditLogListPageIndexer");	
	pageIndex.currentPageIndex = index;	
}

exports.setPageRowCount = function(count) {	
	var pageIndex = app.lookup("auditLogListPageIndexer");	
	pageIndex.pageRowCount = count;	
}

exports.getPageRowCount = function() {	
	var pageIndex = app.lookup("auditLogListPageIndexer");	
	return pageIndex.pageRowCount;	
}

exports.refreshAuditLogList = function(idMap){
	var dsAuditLogList = app.lookup("AuditLogList");
	
	var total = dsAuditLogList.getRowCount();
	for ( var i = 0; i < total; i++){		
		var row = dsAuditLogList.getRow(i);		
		if (row){
			var auditLogIndexKey = row.getValue("IndexKey");
									
			if( idMap.get(auditLogIndexKey) != undefined ){
				dsAuditLogList.setRowState(i,cpr.data.tabledata.RowState.DELETED);	
			} else {				
				dsAuditLogList.setRowState(i,cpr.data.tabledata.RowState.UNCHANGED);
			}
		} 
	}
	
	var auditLogList = app.lookup("auditLogListGrid");
	auditLogList.redraw();
}

exports.clearAuditLogList = function(  ){
			
	var pageIndex = app.lookup("auditLogListPageIndexer");
	pageIndex.totalRowCount = 0;
	pageIndex.visible = false;	
	pageIndex.redraw();
	
	var auditLogListSet = app.lookup("AuditLogList");
	auditLogListSet.clear();			
	
	var auditLogList = app.lookup("auditLogListGrid");	
	auditLogList.redraw();
}


/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onAuditLogListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var auditLogListPageIndexer = e.control;
	
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
function onAuditLogListPageIndexerBeforeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var auditLogListPageIndexer = e.control;
	
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



