/************************************************
 * tnaMonthsListHDHI.js
 * Created at 2024. 4. 4. 오후 4:43:27.
 *
 * @author zxc
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var gridUtil = createGridUtil(app);
var comLib;

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
}

exports.deleteColumn = function(indices) {
	if (indices == undefined || indices == null) {
		return;
	}
	var gridTnaList = app.lookup("tnaMonthListGrid");
	indices.forEach(function(index) {
		gridTnaList.deleteColumn(index);
	});
};

exports.setUserList = function( /*cpr.data.DataSet*/ tnaDataSet) {
	
	var tnaListSet = app.lookup("tnaMonthResultList");
	tnaListSet.clear();
	tnaDataSet.copyToDataSet(tnaListSet);
	
	tnaListSet.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	
	var tnaList = app.lookup("tnaMonthListGrid");
	tnaList.redraw();
}

/**
 * 근태 리스트 컨트롤의 페이징 정보를 설정합니다.
 */
exports.setPaging = function(totalCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("tnaListPageIndexer");
	
	pageIndex.totalRowCount = totalCount; //전체 데이터 수.
	pageIndex.currentPageIndex = currentPageIndex; //현재 선택된 페이지의 인덱스
	pageIndex.pageRowCount = pageRowCount; //한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount; // 보여지는 페이지 수(하단 부 인덱스 수)
	
	if (totalCount == 0) {
		pageIndex.visible = false;
	} else {
		pageIndex.visible = true;
	}
	
	pageIndex.redraw();
}

exports.setPaging = function(totalCount, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("tnaListPageIndexer");
	
	pageIndex.totalRowCount = totalCount; //전체 데이터 수.
	//pageIndex.currentPageIndex = currentPageIndex;//현재 선택된 페이지의 인덱스
	pageIndex.pageRowCount = pageRowCount; //한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount; // 보여지는 페이지 수(하단 부 인덱스 수)
	
	if (totalCount == 0) {
		pageIndex.visible = false;
	} else {
		pageIndex.visible = true;
	}
	pageIndex.redraw();
}

exports.setTotalCount = function(totalCount) {
	
	var pageIndex = app.lookup("tnaListPageIndexer");
	pageIndex.totalRowCount = totalCount
	
	if (totalCount == 0) {
		pageIndex.visible = false;
	} else {
		pageIndex.visible = true;
	}
	
	pageIndex.redraw();
}

exports.getCurrentPageIndex = function() {
	var pageIndex = app.lookup("tnaListPageIndexer");
	return pageIndex.currentPageIndex
}

exports.setCurrentPageIndex = function(index) {
	var pageIndex = app.lookup("tnaListPageIndexer");
	pageIndex.currentPageIndex = index;
}

exports.setPageRowCount = function(count) {
	var pageIndex = app.lookup("tnaListPageIndexer");
	pageIndex.pageRowCount = count;
}

exports.getPageRowCount = function() {
	var pageIndex = app.lookup("tnaListPageIndexer");
	return pageIndex.pageRowCount;
}

//권한이 관리자 일 때 수정팝업 이벤트리스너 추가
exports.editableGrid = function() {
	// 이거 비고만 수정 가능함
	var gridTnaList = app.lookup("tnaMonthListGrid");
	gridTnaList.addEventListener("row-dblclick", function(e) {
		var rowInfo = e.row;
		var name = rowInfo.getValue("Name");
		var userId = rowInfo.getValue("UserID");
		var year = rowInfo.getValue("WorkYear").toString().slice(0, -1);
		var month = rowInfo.getValue("WorkMonth").toString().slice(0, -1);
		var workDate = year + "-" + month;
		
		if (workDate.toString().length < 7) {	// YYYY 경우 x
			comLib.hideLoadMask();
			dialogAlert(app, dataManager.getString("Str_Failed"), "연간 검색 현황은 비고 수정이 불가 합니다.");
			return
		}

		var appld = "app/custom/hyundai_hi/tna/popup/tnaEditWorkMonthResult";
		app.getHostAppInstance().openDialog(appld, {
			width: 330,
			height: 300
		}, function(dialog) {
			dialog.bind("headerTitle").toLanguage("Str_Modification");
			dialog.initValue = {
				"UserId": userId,
				"WorkDate": workDate
			};
			dialog.headerClose = false;
			//dialog.modal = true;
		}).then(function(returnValue) {
			var result = returnValue["Result"];
			if (result == 0) {
				//행 하나를 받아서 update row
				rowInfo.setRowData(returnValue["SelectedRow"]);
			}
		});
	});
}

exports.uneditableGrid = function() {
	var gridTnaList = app.lookup("tnaMonthListGrid");
	gridTnaList.removeEventListeners("row-dblclick");
}

//visible columns toggle
exports.columnsVisible = function(srcGridID, columns, isVisible) {
	gridUtil.gridColumnsVisible(srcGridID, columns, isVisible);
}



/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onTnaListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var tnaListPageIndexer = e.control;
	
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
function onTnaListPageIndexerBeforeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var tnaListPageIndexer = e.control;
	
	var selectionEvent = new cpr.events.CSelectionEvent("before-pagechange", {
		oldSelection: e.oldSelection,
		newSelection: e.newSelection
	});
	app.dispatchEvent(selectionEvent);
	
	// 기본처리가 중단되었을 때 변경을 취소함.
	if (selectionEvent.defaultPrevented == true) {
		e.preventDefault();
	}
}

