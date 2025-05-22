/************************************************
 * tnsList.js
 * Created at 2019. 2. 8. 오전 11:28:09.
 *
 * @author joymrk
 ************************************************/

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
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
	
	var grdcount = app.lookup("tnaListGrid").columnCount; 
	var grdArr = [];
	for(var i=0;i<grdcount;i++){
		var colName = app.lookup("tnaListGrid").detail.getColumn(i).columnName;
		if(dataManager.getOemVersion() != OEM_YEMEN && colName == "ActualOverTime"){ // YEMEN 실제초과근무시간 컬럼 추가
			continue;
		}
		grdArr.push(colName);
	}
	console.log(grdArr);
	//기존 칼럼 리스트 스토리지 set
	var tnaGrdStorage = grdArr.toString();
	
	localStorage.setItem("tnaGrdStorage",tnaGrdStorage);
	
	var selectStorageBefore = localStorage.getItem("tnaSelectStorage");
	if (selectStorageBefore == null){
		localStorage.setItem("tnaSelectStorage",tnaGrdStorage);
	}
	var selectStorageAfter = localStorage.getItem("tnaSelectStorage");
	GridSetting(selectStorageAfter);
}

exports.getText = function() {
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};

exports.deleteColumn = function(indices) {
	if (indices == undefined || indices == null) {
		return;
	}
	var gridTnaList = app.lookup("tnaListGrid");
	indices.forEach(function(index) {
		gridTnaList.deleteColumn(index);
	});
};

exports.setUserList = function( /*cpr.data.DataSet*/ tnaDataSet) {
	
	var tnaListSet = app.lookup("tnaResultList");
	tnaListSet.clear();
	tnaDataSet.copyToDataSet(tnaListSet);
	
	tnaListSet.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	
	var tnaList = app.lookup("tnaListGrid");
	tnaList.redraw();
}

exports.setTnaResultSum = function( /*cpr.data.DataSet*/ tnaDataSet) {
	
	var tnaResultSum = app.lookup("dsTnaResultSum");
	tnaResultSum.clear();
	tnaDataSet.copyToDataSet(tnaResultSum);
	
	tnaResultSum.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	
	var resultSumGrid = app.lookup("TNARP_grdTnaResultSum");
	resultSumGrid.redraw();
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
	var gridTnaList = app.lookup("tnaListGrid");
	gridTnaList.addEventListener("row-dblclick", function(e) {
		var rowInfo = e.row;
		var name = rowInfo.getValue("Name");
		var userId = rowInfo.getValue("UserID")
		var workDate = rowInfo.getValue("WorkDate");
		var inTime = rowInfo.getValue("InTime");
		var outTime = rowInfo.getValue("OutTime");
		
		var appld = "app/main/tna/popup/tnaEditWorkResult";
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
	var gridTnaList = app.lookup("tnaListGrid");
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
function onTnaListPageIndexerSelectionChange( /* cpr.events.CSelectionEvent */ e) {
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
function onTnaListPageIndexerBeforeSelectionChange( /* cpr.events.CSelectionEvent */ e) {
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

//------------------------------------------------------------
/*
 * 그리드에서 contextmenu 이벤트 발생 시 호출.
 * 마우스의 오른쪽 버튼이 클릭되거나 컨텍스트 메뉴 키가 눌려지면 호출되는 이벤트.
 */
function onTnaListGridContextmenu(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var tnaListGrid = e.control;
	e.preventDefault();
	var tnaListMenu = new cpr.controls.Menu();
		tnaListMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_ColumnSetting"), 0, ""));
		//tnaResultMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_ListClear"), 1, ""));
		var rect = app.getActualRect();
		var contextTop = (e.clientY - rect.top) > rect.height/2 ? e.clientY - rect.top*2 : e.clientY - rect.top;
		tnaListMenu.style.css({
			left: e.clientX - rect.left + "px",
			top: (contextTop) + "px",
			height: "60px",
			width: "200px",
			position: "absolute"
		});
		tnaListMenu.focus();
		
		tnaListMenu.addEventListener("item-click", function(e) {
//			switch (tnaListMenu.value) {
//				case "0":	tnaListGridSetting();		break; 
//				case "1":	tnaListGridClear();       break;
//				default:	break;
//			}	
			tnaListGridSetting();	
			tnaListMenu.dispose();
		});	
		tnaListMenu.addEventListener("blur", function(e) {	tnaListMenu.dispose();	});
		app.floatControl(tnaListMenu);
		
}

//우클릭 '칼럼 설정'
function tnaListGridSetting(){
	app.getRootAppInstance().openDialog("app/main/tna/search/tnaListGridSet", {
		width: 570,
		height: 570
		}, function(dialog){
			dialog.bind("headerTitle").toLanguage("Str_ColumnSetting");
		}).then(function(returnValue){
			if(returnValue !== null){
			GridSetting(returnValue);
			}
	});	
}

// returnValue값으로 그리드 세팅
function GridSetting(returnValue){
	localStorage.setItem("tnaSelectStorage",returnValue);
	var selectArr = returnValue.split(',');
	var grdcount = app.lookup("tnaListGrid").columnCount;
	console.log("grdcount : " + grdcount);
	for(var x = 0; x<grdcount; x++){
		app.lookup("tnaListGrid").deleteColumn(x);
	}
	for (var i = 0; i<selectArr.length;i++){
		app.lookup("tnaListGrid").addColumn({
			columnLayout: [{
				width: "100px"
			}],
			header : [{ 														
				constraint: {
					rowIndex : 0,
					colIndex : i
				},
				configurator: function(cell){
					if(selectArr[i]=="UserID"){	selectArr[i] = "ID"; }
					if(selectArr[i]=="DepartmentName"){	selectArr[i] = "Department"; }
					if(selectArr[i]=="PositionName"){ selectArr[i] = "Position"; }
					if(selectArr[i]=="GroupName"){ selectArr[i] = "GroupID"; }
					if(selectArr[i]=="DayofWeek"){ selectArr[i] = "Days"; }
					if(selectArr[i]=="ShiftName"){ selectArr[i] = "WorkDayName"; }
					if(selectArr[i]=="InTime"){	selectArr[i] = "Intime"; }
					if(selectArr[i]=="OutTime"){ selectArr[i] = "Outtime"; }
					if(selectArr[i]=="LateTime"){ selectArr[i] = "Latetime"; }
					if(selectArr[i]=="LackTime"){ selectArr[i] = "Leavetime"; }
					if(selectArr[i]=="Wt1In"){ selectArr[i] = "WorkingTimeIN"; }
					if(selectArr[i]=="Wt1Out"){ selectArr[i] = "WorkingTimeOUT"; }
					if(selectArr[i]=="Wt1Time"){ selectArr[i] = "BasicWorkTime"; }
					if(selectArr[i]=="Wt2Time"){ selectArr[i] = "TimeBeforeShift"; }
					if(selectArr[i]=="Wt3Time"){ selectArr[i] = "Overtime1Hours"; }
					if(selectArr[i]=="Wt4Time"){ selectArr[i] = "Overtime2Hours"; }
					if(selectArr[i]=="Wt5Time"){ selectArr[i] = "OffDayHours"; }
					if(selectArr[i]=="Wt6Time"){ selectArr[i] = "Overtime3Hours"; }
					if(selectArr[i]=="PaymentEx"){ selectArr[i] = "Payment"; }
					
					cell.text = dataManager.getString("Str_"+selectArr[i]);
				}
			}],
			detail: [{															
				constraint: { 					
					rowIndex : 0,
					colIndex : i
				},
				configurator: function(cell){
					if(selectArr[i]=="ID"){ selectArr[i] = "UserID"; }
					if(selectArr[i]=="GroupID"){ selectArr[i] = "GroupName"; }
					if(selectArr[i]=="Department"){	 selectArr[i] = "DepartmentName"; }
					if(selectArr[i]=="Position"){ selectArr[i] = "PositionName"; }
					if(selectArr[i]=="Days"){ selectArr[i] = "DayofWeek"; }
					if(selectArr[i]=="WorkDayName"){ selectArr[i] = "ShiftName"; }
					if(selectArr[i]=="Intime"){	 selectArr[i] = "InTime"; }
					if(selectArr[i]=="Outtime"){ selectArr[i] = "OutTime"; }
					if(selectArr[i]=="Latetime"){ selectArr[i] = "LateTime"; }
					if(selectArr[i]=="Leavetime"){ selectArr[i] = "LackTime"; }
					if(selectArr[i]=="WorkingTimeIN"){ selectArr[i] = "Wt1In"; }
					if(selectArr[i]=="WorkingTimeOUT"){ selectArr[i] = "Wt1Out"; }
					if(selectArr[i]=="BasicWorkTime"){ selectArr[i] = "Wt1Time"; }
					if(selectArr[i]=="TimeBeforeShift"){ selectArr[i] = "Wt2Time"; }
					if(selectArr[i]=="Overtime1Hours"){ selectArr[i] = "Wt3Time"; }
					if(selectArr[i]=="Overtime2Hours"){	selectArr[i] = "Wt4Time"; }
					if(selectArr[i]=="OffDayHours"){ selectArr[i] = "Wt5Time"; }
					if(selectArr[i]=="Overtime3Hours"){ selectArr[i] = "Wt6Time"; }
					if(selectArr[i]=="Payment"){ selectArr[i] = "PaymentEx"; }
					cell.columnName = selectArr[i];
				}
			}],
		});
	}
	
	columnResizing();
}


//근태 결과 리스트 그리드 초기화
function tnaListGridClear(/* cpr.events.CSubmissionEvent */ e){
	var count =	app.lookup("tnaListGrid").getContentRowCount();
	for(var a=0; a<count; a++){
	app.lookup("tnaListGrid").deleteRow(0);
	}	
}


// 헤더 셀의 이름 길이에 따라  Column resize -mjy 
function columnResizing(){
	var grid = app.lookup("tnaListGrid");
	var grdcount = grid.columnCount;
	var px = "";
	for (var i = 0; i<grdcount; i++){
		if(grid.header.getColumn(i).text.length < 9){
			px = "100px";
		} else {
			px = "150px";
		}
		grid.resizeColumn(i, px);
	}
	grid.resizableColumns = "all";
}