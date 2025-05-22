/************************************************
 * PassList.js
 * Created at 2019. 9. 16. 오후 2:18:16.
 *
 * @author jrh
 ************************************************/

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};

exports.getCurrentPageIndex = function() {	
	var pageIndex = app.lookup("PassListIndexer");
	return pageIndex.currentPageIndex
}

exports.setCurrentPageIndex = function(index) {	
	var pageIndex = app.lookup("PassListIndexer");	
	pageIndex.currentPageIndex = index;	
}

exports.setPassList = function( /*cpr.data.DataSet*/CardInfoList ){
			
	var dsCardInfoList = app.lookup("CardInfoList");
	dsCardInfoList.clear();	
	CardInfoList.copyToDataSet(dsCardInfoList);	
	dsCardInfoList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	
	var PassListGrid = app.lookup("PassListGrid");	
	PassListGrid.redraw();
}

exports.setPaging1 = function( totalCount, pageRowCount, viewPageCount ) {
	var pageIndex = app.lookup("PassListIndexer");
	
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

exports.setPaging2 = function( totalCount, currentPageIndex, pageRowCount, viewPageCount ) {
	var pageIndex = app.lookup("PassListIndexer");
	
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

exports.set1page = function(currentPageIndex){
	var pageIndex = app.lookup("PassListIndexer");
	
	pageIndex.currentPageIndex = currentPageIndex;//현재 선택된 페이지의 인덱스

}

exports.deletePass = function(deleteID) {
	var PassListGrid = app.lookup("PassListGrid");
	var getPassInfo = PassListGrid.findFirstRow("CardNum == "+ deleteID);

	if (getPassInfo) {
		PassListGrid.deleteRow(getPassInfo.getIndex());	
	} 
	return;
}

exports.InitpassList = function() {
	var PassListGrid = app.lookup("CardInfoList");
	PassListGrid.clear();
	PassListGrid.commit(); 
	return;
}

/*
exports.gridFilter = function( value ) {
	var PassListGrid = app.lookup("PassListGrid");
	PassListGrid.filter('IssueStatus*="' + value + '"');
	console.log("ssszz");
}
*/
/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onPassListIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var passListIndexer = e.control;
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
function onPassListIndexerBeforeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var passListIndexer = e.control;
	
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
 * 그리드에서 row-dblclick 이벤트 발생 시 호출.
 * detail이 row를 더블클릭 한 경우 발생하는 이벤트.
 */
function onPassListGridRowDblclick(/* cpr.events.CGridEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var passListGrid = e.control;
	var selectionEvent = new cpr.events.CGridEvent("passListDblclick", {
		row: e.row,
		rowindex: e.rowIndex
	});
	
	app.dispatchEvent(selectionEvent);
}
