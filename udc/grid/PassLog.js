/************************************************
 * PassIssuanceHistoryList.js
 * Created at 2019. 9. 24. 오전 9:50:24.
 *
 * @author jrh
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};


/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	app.lookup("cmd_IssueStatus").addItem(new cpr.controls.Item(dataManager.getString("Str_UnIssued"), 0));
	app.lookup("cmd_IssueStatus").addItem(new cpr.controls.Item(dataManager.getString("Str_Issued"), 1));
	app.lookup("cmd_IssueStatus").addItem(new cpr.controls.Item(dataManager.getString("Str_TakeBack"), 2));
	
	app.lookup("cmd_EventType").addItem(new cpr.controls.Item(dataManager.getString("Str_Issued"), 0));
	app.lookup("cmd_EventType").addItem(new cpr.controls.Item(dataManager.getString("Str_UnIssued"), 1));
	app.lookup("cmd_EventType").addItem(new cpr.controls.Item(dataManager.getString("Str_TakeBack"), 2));
}


exports.getCurrentPageIndex = function() {	
	var pageIndex = app.lookup("PassLogListIndexer");
	return pageIndex.currentPageIndex
}

exports.setCurrentPageIndex = function(index) {	
	var pageIndex = app.lookup("PassLogListIndexer");	
	pageIndex.currentPageIndex = index;	
}

exports.setPassLogList = function( /*cpr.data.DataSet*/CardIssuelogList ){
			
	var dsCardIssuelogList = app.lookup("CardIssuelogList");
	dsCardIssuelogList.clear();	
	CardIssuelogList.copyToDataSet(dsCardIssuelogList);	
	for(var i = 0; i<dsCardIssuelogList.getRowCount(); i++){
		var row = dsCardIssuelogList.getRow(i);
		if(row.getValue("StartTime")=="0001-01-01 00:00:00"){
			row.setValue("StartTime", "");			
		}
		if(row.getValue("EndTime")=="0001-01-01 00:00:00"){
			row.setValue("EndTime", "");			
		}
	}
	
	dsCardIssuelogList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
}

exports.setPaging = function( totalCount, pageRowCount, viewPageCount ) {
	var pageIndex = app.lookup("PassLogListIndexer");
	
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
/*
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
*/
exports.set1page = function(currentPageIndex){
	var pageIndex = app.lookup("PassLogListIndexer");
	
	pageIndex.currentPageIndex = currentPageIndex;//현재 선택된 페이지의 인덱스

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
function onPassLogListIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){

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
function onPassLogListIndexerBeforeSelectionChange(/* cpr.events.CSelectionEvent */ e){

	
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

function onPassLogListGirdRowDblclick(/* cpr.events.CGridEvent */ e){

	var selectionEvent = new cpr.events.CGridEvent("passListDblclick", {
		row: e.row,
		rowindex: e.rowIndex
	});
	
	app.dispatchEvent(selectionEvent);
}


