/************************************************
 * gridAccessArea.js
 * Created at 2018. 12. 13. 오후 2:14:10.
 *
 * @author fois
 ************************************************/

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};

exports.setAccessAreaList = function(/*cpr.data.DataSet*/data){
	var dsAccessAreaList = app.lookup("AccessAreaList");
	dsAccessAreaList.clear();	
	data.copyToDataSet(dsAccessAreaList);	
	dsAccessAreaList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	
	var gridAccessArea = app.lookup("gridAccessArea_grdAccessArea");	
	gridAccessArea.redraw();
}

exports.getCheckedRowIndices = function() {
	var gridAccessArea = app.lookup("gridAccessArea_grdAccessArea");
	return gridAccessArea.getCheckRowIndices();
}

exports.getRow = function( index ){	
	var gridAccessArea = app.lookup("gridAccessArea_grdAccessArea");
	return gridAccessArea.getRow(index);	
}

exports.clearSelection = function(  ){	
	var gridAccessArea = app.lookup("gridAccessArea_grdAccessArea");
	gridAccessArea.clearSelection();	
}

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
}


/*
 * 그리드에서 row-dblclick 이벤트 발생 시 호출.
 * detail이 row를 더블클릭 한 경우 발생하는 이벤트.
 */
function onGridAccessArea_grdAccessAreaRowDblclick(/* cpr.events.CGridEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var gridAccessArea_grdAccessArea = e.control;
	var gridEvent = new cpr.events.CGridEvent("areaDblClick", { row:e.row});
	app.dispatchEvent(gridEvent);
	
	// 기본처리가 중단되었을 때 변경을 취소함.
	if(gridEvent.defaultPrevented == true) {
		e.preventDefault();
	}
}


/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onGridAccessArea_grdAccessAreaSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var gridAccessArea_grdAccessArea = e.control;
	var gridRow = gridAccessArea_grdAccessArea.getRow(e.newSelection[0]);
	
	var selectionEvent = new cpr.events.CSelectionEvent("areaSelectionChange", {
		oldSelection: e.oldSelection,
		newSelection: gridRow
	});
	
	app.dispatchEvent(selectionEvent)
	
	// 기본처리가 중단되었을 때 변경을 취소함.
	if(selectionEvent.defaultPrevented == true) {
		e.preventDefault();
	}
	
}
