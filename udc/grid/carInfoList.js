/************************************************
 * userList.js
 * Created at 2018. 11. 15. 오후 1:52:16.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var udcUserList_enablePageIndexer = true;

function onBodyLoad(/* cpr.events.CEvent */ e){	
	dataManager = getDataManager();
	udcUserList_enablePageIndexer = true;
}

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.	
	return "";
};


exports.setCarInfoList = function( /*cpr.data.DataSet*/carInfoDataSet ){
			
	var carInfoListSet = app.lookup("CarInfoList");
	carInfoListSet.clear();	
	
	carInfoDataSet.copyToDataSet(carInfoListSet);	
	console.log(carInfoListSet.getRowDataRanged());
	console.log(carInfoDataSet.getRowDataRanged());
	carInfoListSet.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	var carInfoList = app.lookup("UDC_grdCarInfoList");	
	carInfoList.redraw();
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


exports.getCheckedRowIndices = function() {
	var carInfoList = app.lookup("UDC_grdCarInfoList");
	var indices = carInfoList.getCheckRowIndices();
	var result = [];
	indices.forEach(function(idx){
		if(carInfoList.getRowState(idx) != cpr.data.tabledata.RowState.DELETED ){
			result.push(idx);
		} else {
			carInfoList.setCheckRowIndex(idx, false);
		}
	});
	return result;
}

exports.getUserIndexKey = function( index ){
	
	var carInfoList = app.lookup("UDC_grdCarInfoList");
	var userIndexKey = carInfoList.getRow(index).getString("UserIndexKey");
	return userIndexKey;
}

exports.getVisitorIndexKey = function( index ){
	
	var carInfoList = app.lookup("UDC_grdCarInfoList");
	var visitorIndexKey = carInfoList.getRow(index).getString("VisitorIndexKey");
	return visitorIndexKey;
}

exports.getCarNumber = function( index ){
	
	var carInfoList = app.lookup("UDC_grdCarInfoList");
	var carNumber = carInfoList.getRow(index).getString("CarNumber");
	return carNumber;
}

exports.deleteRow = function(checkRow) {
	var carInfoList = app.lookup("UDC_grdCarInfoList");
	if( checkRow >= carInfoList.getRowCount()){
		return;
	}
	carInfoList.deleteRow(checkRow);
	carInfoList.setCheckRowIndex(checkRow, false);
	return;
}

exports.realDeleteRow = function(index) {
	var carInfoList = app.lookup("CarInfoList");	
	carInfoList.realDeleteRow(index);	
	return;
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
