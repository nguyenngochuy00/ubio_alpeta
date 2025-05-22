/************************************************
 * GridManager.module.js
 * Created at 2018. 10. 11. 오후 1:25:55.
 *
 * @author osm86
 ************************************************/

/*
 * 그리드 관련 공통 모듈 구현
 */

exports.id = "GridManager.module.js"

var GridUtil = function(app) {
	this._app = app;
}

GridUtil.prototype.moveGridData = function(srcGridID, targetGridID) {
	var srcGrid = this._app.lookup(srcGridID);
	var targetGrid = this._app.lookup(targetGridID);
	
	var indices = srcGrid.getSelectedRowIndices();
	if (!indices || indices.length == 0) {
		return;
	}
	
	var rows = srcGrid.getSelectedRows();
	
	rows.forEach(function(row) {
		var insertRow = targetGrid.insertRow(targetGrid.rowCount, true);
		insertRow.setRowData(row.getRowData());
		//insertRow.setState(cpr.data.tabledata.RowState.UNCHANGED);
	});
	srcGrid.deleteRow(indices);
	
	srcGrid.clearSelection();
	targetGrid.clearSelection();
}

GridUtil.prototype.moveGridAllData = function(srcGridID, targetGridID) {
	var srcGrid = this._app.lookup(srcGridID);
	var targetGrid = this._app.lookup(targetGridID);
	
	if (srcGrid.rowCount == 0) {
		return;
	}
	
	var indices = [];
	for (var rowIndex = 0; rowIndex < srcGrid.rowCount; rowIndex++) {
		var insertRow = targetGrid.insertRow(targetGrid.rowCount, true);
		insertRow.setRowData(srcGrid.getRow(rowIndex).getRowData());
		insertRow.setState(cpr.data.tabledata.RowState.UNCHANGED);
		indices.push(rowIndex);
	}
	srcGrid.deleteRow(indices);
}

GridUtil.prototype.copyGridData = function(srcGridID, targetGridID) {
	var srcGrid = this._app.lookup(srcGridID);
	var targetGrid = this._app.lookup(targetGridID);
	
	var indices = srcGrid.getSelectedRowIndices();
	if (!indices || indices.length == 0) {
		return;
	}
	
	var rows = srcGrid.getSelectedRows();
	
	rows.forEach(function(row) {
		
		var data = row.getRowData();
		
		var str = [];
		for (var key in data) {
			str.push(key + " == '" + data[key] + "'");
		}
		str = str.join(" && ");
		// 조건에 맞는 row 탐색
		var findRow = targetGrid.findAllRow(str);
		if (findRow == 0) {
			var insertRow = targetGrid.insertRow(targetGrid.rowCount, true);
			insertRow.setRowData(data);
		}
		//insertRow.setState(cpr.data.tabledata.RowState.UNCHANGED);
	});
	
	srcGrid.clearSelection();
	targetGrid.clearSelection();
}

/**
 * PageIndexer UDC의 값을 초기화 한다.
 * 
 * @param pagingDataMapId Paging 정보가 담긴 DataMap의 ID. DataMap은 totCnt, pageSize, rowSize, pageIdx 컬럼을 가지고 있어야 함.
 * @param pageIndexerId Paging 정보를 설정할 pageIndex UDC의 화면내 ID.
 */
GridUtil.prototype.setPagingInfo = function(pagingDataMapId, pageIndexerId) {
	/**
	 * @type cpr.data.DataMap
	 */
	var pagingDataMap = this._app.lookup(pagingDataMapId);
	/**
	 * @type udc.com.pageindex
	 */
	var pageIndexer = this._app.lookup(pageIndexerId);
	// set data
	pageIndexer.module.setPaging(pagingDataMap.getValue("totCnt"), pagingDataMap.getValue("pageSize"), pagingDataMap.getValue("rowSize"), pagingDataMap.getValue("pageIdx"));
}

GridUtil.prototype.gridColumnsVisible = function(srcGridID, colNames, isVisible) {
	var grid = this._app.lookup(srcGridID);
	for (var i = 0; i < colNames.length; i++) {
		grid.columnVisible(grid.getCellIndex(colNames[i]), isVisible);
	}
}

globals.createGridUtil = function(app) {
	return new GridUtil(app);
}