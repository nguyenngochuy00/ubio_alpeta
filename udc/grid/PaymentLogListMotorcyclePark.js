/************************************************
 * authLogListCkb.js
 * Created at 2020. 9. 3. 오후 2:39:11.
 *
 * @author blue1
 ************************************************/


var dataManager = cpr.core.Module.require("lib/DataManager");
var oem_version;

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	var dsGroupList = dataManager.getGroup();
	
//	var groupList = dataManager.getGroup();
//	if( groupList && groupList.getRowCount()>0){
//		var cmbGroup = app.lookup("authLogListGrid_cmb_GroupName");
//		var count = groupList.getRowCount();
//		for ( var i = 0; i < count; i++ ){			
//			var groupInfo = groupList.getRow(i);						
//			cmbGroup.addItem(new cpr.controls.Item(groupInfo.getValue("Name"),groupInfo.getValue("GroupID")));
//		}
//					
//	}
}

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};
exports.getSelectedRow = function() {
	var paymentLogListGrid = app.lookup("PaymentLogListGrid");
	var selectionRow = paymentLogListGrid.getSelectedRow();
	
	if (selectionRow.getIndex() != null) {
		return selectionRow;
	}
	
	return null;
}

exports.getCheckedRowIndices = function() {
	var paymentLogList = app.lookup("PaymentLogListGrid");
	var indices = paymentLogList.getCheckRowIndices();
	
	var result = [];
	indices.forEach(function(idx){
		if(paymentLogList.getRowState(idx) != cpr.data.tabledata.RowState.DELETED ){
			result.push(idx);
		} else {
			paymentLogList.setCheckRowIndex(idx, false);
		}
	});
	
	return result;
}

exports.setUnCheckAll = function(idx,checked){
	var paymentLogList = app.lookup("PaymentLogListGrid");
	var indices = paymentLogList.getCheckRowIndices();
	
	indices.forEach(function(idx){
		paymentLogList.setCheckRowIndex(idx, false);		
	});
} 

exports.deleteColumn = function(indices){
	if (indices==undefined || indices == null ){
		return;
	}
	var paymentLogList = app.lookup("PaymentLogListGrid");
	indices.forEach(function(index){
		paymentLogList.deleteColumn(index);
	});	
};

exports.deleteRow = function(checkedRowIndices) {
	var paymentLogList = app.lookup("PaymentLogListGrid");
	paymentLogList.deleteRow(checkedRowIndices);
	paymentLogList.clearAllCheck();
	return;
}

exports.setpaymentLogList = function( /*cpr.data.DataSet*/authLogDataSet ){
			
	var paymentLogListSet = app.lookup("PaymentLogList");
	paymentLogListSet.clear();	
	authLogDataSet.copyToDataSet(paymentLogListSet);	
	paymentLogListSet.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	var paymentLogList = app.lookup("PaymentLogListGrid");
	paymentLogList.redraw();
}

exports.setPaymentLogListRows = function( /*cpr.data.RowConfigInfo[]*/authLogData ){
			
	var paymentLogListSet = app.lookup("PaymentLogList"); 
	paymentLogListSet.clear();	
	paymentLogListSet.build(authLogData);	
	paymentLogListSet.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	
	var paymentLogList = app.lookup("PaymentLogListGrid");	
	paymentLogList.redraw();	
}

exports.getPaymentLogIndexKey = function( index ){
	
	var paymentLogList = app.lookup("PaymentLogListGrid");
	var getPaymentLogIndexKey = authLogList.getRow(index).getString("IndexKey");
	return getPaymentLogIndexKey;
}

exports.getRowData = function( index ){
	
	var paymentLogList = app.lookup("PaymentLogListGrid");
	return paymentLogList.getRow(index).getRowData();	
}

exports.getRow = function( index ){
	
	var paymentLogList = app.lookup("PaymentLogListGrid");
	return paymentLogList.getRow(index);	
}

exports.getRowState = function( index ){
	
	var paymentLogList = app.lookup("PaymentLogListGrid");
	return paymentLogList.getRowState(index);	
}

exports.setRowState = function(index, state){
	var paymentLogList = app.lookup("PaymentLogListGrid");
	paymentLogList.setRowState(index, state);
}

exports.getRowCount = function(index, state){
	var paymentLogList = app.lookup("PaymentLogListGrid");
	return paymentLogList.getRowCount();
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

exports.refreshPaymentLogList = function(idMap){
	var dsPaymentLogList = app.lookup("PaymentLogList");
	
	var total = dsPaymentLogList.getRowCount();
	for ( var i = 0; i < total; i++){		
		var row = dsPaymentLogList.getRow(i);		
		if (row){
			var paymentLogIndexKey = row.getValue("IndexKey");
									
			if( idMap.get(paymentLogIndexKey) != undefined ){
				dsPaymentLogList.setRowState(i,cpr.data.tabledata.RowState.DELETED);	
			} else {				
				dsPaymentLogList.setRowState(i,cpr.data.tabledata.RowState.UNCHANGED);
			}
		} 
	}
	
	var paymentLogList = app.lookup("PaymentLogListGrid");
	paymentLogList.redraw();
}

exports.clearPaymentLogList = function(  ){
			
	var pageIndex = app.lookup("authLogListPageIndexer");
	pageIndex.totalRowCount = 0;
	pageIndex.visible = false;	
	pageIndex.redraw();
	
	var paymentLogListSet = app.lookup("PaymentLogList");
	paymentLogListSet.clear();			
	
	var paymentLogList = app.lookup("PaymentLogListGrid");	
	paymentLogList.redraw();
}

/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onAuthLogListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var paymentLogListPageIndexer = e.control;
	
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
	var paymentLogListPageIndexer = e.control;
	
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

