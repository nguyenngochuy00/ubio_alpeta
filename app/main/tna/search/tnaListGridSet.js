/************************************************
 * tnaListGridSet.js
 * Created at 2022. 5. 31. 오전 10:00:21.
 *
 * @author sky
 ************************************************/
var dataDragManager = cpr.core.Module.require("lib/DataDragManager");
var dataManager = cpr.core.Module.require("lib/DataManager");
var StrLib = cpr.core.Module.require("lib/StrLib");

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	var dsColumnList = app.lookup("ColumnList");
	var dsOrderList = app.lookup("OrderList");
	
	var tnaSelectStorage = localStorage.getItem("tnaSelectStorage");
	var tnaGrdStorage = localStorage.getItem("tnaGrdStorage");
	
	var grdString = tnaGrdStorage.split(',');
	var grdcount = grdString.length;
		
		// 1. 선택값(selectStorage) 없을때
		if(tnaSelectStorage == null){
		for(var a=0; a<grdcount; a++){
		dsColumnList.addRowData({"Value":grdString[a]});
		}
		// 2. 선택값(selectStorage) 있을때					
		} else { 
		var selectString = tnaSelectStorage.split(',');			
		var selectcount = selectString.length;
		for(var c = 0;c<selectcount;c++){ 
			grdString = grdString.filter(function(item) { 
				return item !== selectString[c];
				});
				}
		for(var a=0; a<grdcount - selectcount; a++){ 
		dsColumnList.addRowData({"Value":grdString[a]});
		}
		for(var b=0; b<selectcount; b++){
		dsOrderList.addRowData({"Value":selectString[b]});	
		}
	}
	initComboTNAColumn();
}

function onTRMG_grdColumnListMousedown(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var TRMG_grdColumnList = e.control;
	
	if (e.targetObject && e.targetObject.row) {
		var row = e.targetObject.row;							 
		dataDragManager.dataTransfer = {"Src":"column","Row":row};
	}else{
		return;
	}
	var appRect = app.getActualRect();
	var buffer = 20;
	var dragMessage = new cpr.controls.Output("rowmessage"); 
	dragMessage.style.css({
		"position": "absolute",
		"left": (e.clientX - appRect.left) + "px",
		"top": ((e.clientY - appRect.top) + buffer) + "px",
		width: "100px",
		height: "25px",
		"text-align":"center",
		border: "solid 1px red",
		backgroundColor: "#FFF",
		"box-shadow": "0px 2px 2px 0px rgba(0, 0, 0, .3)"
	});
	dragMessage.ellipsis = true;					 
	var text = e.targetObject.row.getValue("Value"); 
	
	dragMessage.value = dataManager.getString("Str_"+text);						
	dataDragManager.dragStart(dragMessage, app, e); 
}

function onTRMG_grdColumnListMouseup(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var TRMG_grdColumnList = e.control;
	
	if(dataDragManager.dataTransfer){
	var row = dataDragManager.dataTransfer["Row"];					
	var value = row.getValue("Value");	
	var dsOrder = app.lookup("OrderList");
	var	dsColumn = app.lookup("ColumnList");
	
	var targetIndex = ( e.targetObject != null )? e.targetObject.rowIndex:dsColumn.getRowCount();
		if( dataDragManager.dataTransfer["Src"] === "order"){ 				
			var deleteRow = dsOrder.findFirstRow("Value == '" + value+"'"); 
			dsOrder.realDeleteRow(deleteRow.getIndex());
			dsColumn.insertRowData(targetIndex, false, {"Value":value});	
		}
		TRMG_grdColumnList.redraw();
	}
}

function onTRMG_grdOrderistMouseup(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var TRMG_grdOrderist = e.control;
	if(dataDragManager.dataTransfer){
	var row = dataDragManager.dataTransfer["Row"];
	var value = row.getValue("Value");
	var dsOrder = app.lookup("OrderList");
	var	dsColumn = app.lookup("ColumnList");
	
	var targetIndex = ( e.targetObject != null )? e.targetObject.rowIndex:dsOrder.getRowCount();
	if( dataDragManager.dataTransfer["Src"] === "column"){ 				
		var deleteRow = dsColumn.findFirstRow("Value == '" + value+"'");
		dsColumn.realDeleteRow(deleteRow.getIndex());
		dsOrder.insertRowData(targetIndex, false, {"Value":value});
		} else {
			var srcIndex = row.getIndex();
			var bAfter = false
			if( targetIndex > srcIndex ){
				bAfter = true
			}
			dsOrder.moveRowIndex(srcIndex, targetIndex,bAfter);
		}
		TRMG_grdOrderist.redraw();
	}
}

function onTRMG_grdOrderistMousedown(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var TRMG_grdOrderist = e.control;
	if (e.targetObject && e.targetObject.row) {
		var row = e.targetObject.row;							
		dataDragManager.dataTransfer = {"Src":"order","Row":row};
	}else{
		return;
	}
	var appRect = app.getActualRect();
	var buffer = 20;
	var dragMessage = new cpr.controls.Output("rowmessage"); 
	dragMessage.style.css({
		"position": "absolute",
		"left": (e.clientX - appRect.left) + "px",
		"top": ((e.clientY - appRect.top) + buffer) + "px",
		width: "100px",
		height: "25px",
		"text-align":"center",
		border: "solid 1px red",
		backgroundColor: "#FFF",
		"box-shadow": "0px 2px 2px 0px rgba(0, 0, 0, .3)"
	});
	dragMessage.ellipsis = true;					 
	var text = e.targetObject.row.getValue("Value"); 
	
	dragMessage.value = dataManager.getString("Str_"+text);						
	dataDragManager.dragStart(dragMessage, app, e);
}

//저장 버튼
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var grdOrderCount = app.lookup("TRMG_grdOrderist").rowCount;
	
	if(grdOrderCount == 0 || grdOrderCount == null){ 
		dialogAlert(app,dataManager.getString("Str_Fail"),dataManager.getString("Str_ErrorColumnselection"));
		return;
	} 
	var selectArr = app.lookup("OrderList").getColumnData("Value");

	var tnaSelectStorage = selectArr.toString();
	app.close(tnaSelectStorage);
}

function initComboTNAColumn() {
	var cmdAll = app.lookup("TRMG_cmdAll");
	if (cmdAll) {
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_ID"), "UserID"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_Name"), "Name"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_UniqueID"), "UniqueID"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_GroupID"), "GroupName"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_Department"), "DepartmentName"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_Position"), "PositionName"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_WorkDate"), "WorkDate"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_Days"), "DayofWeek"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_WorkDayName"), "ShiftName"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_Intime"), "InTime"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_Outtime"), "OutTime"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_Latetime"), "LateTime"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_Leavetime"), "LackTime"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_WorkingTimeIN"), "Wt1In"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_WorkingTimeOUT"), "Wt1Out"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_BasicWorkTime"), "Wt1Time"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_LateINfrom"), "Wt1Late"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_EarlyOUTfrom"), "Wt1Lack"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_TimeBeforeShift"), "Wt2Time"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_Overtime1Hours"), "Wt3Time"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_Overtime2Hours"), "Wt4Time"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_OffDayHours"), "Wt5Time"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_Overtime3Hours"), "Wt6Time"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_Payment"), "PaymentEx"));
	}
	var cmdSelect = app.lookup("TRMG_cmdSelect");
	if (cmdSelect) {
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_ID"), "UserID"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_Name"), "Name"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_UniqueID"), "UniqueID"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_GroupID"), "GroupName"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_Department"), "DepartmentName"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_Position"), "PositionName"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_WorkDate"), "WorkDate"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_Days"), "DayofWeek"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_WorkDayName"), "ShiftName"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_Intime"), "InTime"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_Outtime"), "OutTime"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_Latetime"), "LateTime"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_Leavetime"), "LackTime"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_WorkingTimeIN"), "Wt1In"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_WorkingTimeOUT"), "Wt1Out"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_BasicWorkTime"), "Wt1Time"));
		//cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_LateINfrom"), "Wt1Late"));
		//cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_EarlyOUTfrom"), "Wt1Lack"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_TimeBeforeShift"), "Wt2Time"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_Overtime1Hours"), "Wt3Time"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_Overtime2Hours"), "Wt4Time"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_OffDayHours"), "Wt5Time"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_Overtime3Hours"), "Wt6Time"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_Payment"), "PaymentEx"));
	}
}

//칼럼 초기화
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
		var button = e.control;
		var tnaGrdStorage = localStorage.getItem("tnaGrdStorage");
		dialogConfirm(app, dataManager.getString("Str_Complete"),dataManager.getString("Str_ColumnDialog"),
		function( /*cpr.controls.Dialog*/ dialog){dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				app.close(tnaGrdStorage);
				} else {}
			});
		});
}


// ">" 버튼
function onButtonClick3(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var ColumnList = app.lookup("TRMG_grdColumnList");
	var indices = ColumnList.getCheckRowIndices();
	var result = [];
	indices.forEach(function(idx){
		if(ColumnList.getRowState(idx) != cpr.data.tabledata.RowState.DELETED ){
			result.push(idx);
		} else {
			ColumnList.setCheckRowIndex(idx, false);
		}
	});
	var selectcount = result.length; 
	for(var a=0; a<selectcount; a++){
		var dsOrder = app.lookup("OrderList");
		var	dsColumn = app.lookup("ColumnList");
		var value =  app.lookup("ColumnList").getValue(result[a]-a, "Value");
		var deleteRow = dsColumn.findFirstRow("Value == '" + value+"'");
		dsColumn.realDeleteRow(result[a]-a);
		dsOrder.insertRowData(result, true, {"Value":value});
		}
		ColumnList.redraw();
}


// "<" 버튼
function onButtonClick4(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var SelectList = app.lookup("TRMG_grdOrderist");
	var indices = SelectList.getCheckRowIndices();
	var result = [];
	indices.forEach(function(idx){
		if(SelectList.getRowState(idx) != cpr.data.tabledata.RowState.DELETED ){
			result.push(idx);
		} else {
			SelectList.setCheckRowIndex(idx, false);
		}
	});
	var selectcount = result.length; 
	for(var a=0; a<selectcount; a++){
		var dsOrder = app.lookup("OrderList");
		var	dsColumn = app.lookup("ColumnList");
		var value =  app.lookup("OrderList").getValue(result[a]-a, "Value");
		var deleteRow = dsColumn.findFirstRow("Value == '" + value+"'");
		dsOrder.realDeleteRow(result[a]-a);
		dsColumn.insertRowData(result, true, {"Value":value});
		}
		SelectList.redraw();
}

// ">>" 버튼
function onButtonClick5(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var SelectList = app.lookup("TRMG_grdColumnList");
	var result = [];
	for(var a=0; a<app.lookup("ColumnList").getRowCount(); a++){
		result.push(a);
	}
	var selectcount = result.length; 
	for(var b=0; b<selectcount; b++){
		var dsOrder = app.lookup("OrderList");
		var	dsColumn = app.lookup("ColumnList");
		var value =  app.lookup("ColumnList").getValue(result[b]-b, "Value");
		var deleteRow = dsColumn.findFirstRow("Value == '" + value+"'");
		dsColumn.realDeleteRow(result[b]-b);
		dsOrder.insertRowData(result, true, {"Value":value});
		}
		SelectList.redraw();
}

// "<<" 버튼
function onButtonClick6(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var SelectList = app.lookup("TRMG_grdOrderist");
	var result = [];
	for(var a=0; a<app.lookup("OrderList").getRowCount(); a++){
		result.push(a);
	}
	var selectcount = result.length; 
	for(var b=0; b<selectcount; b++){
		var dsOrder = app.lookup("OrderList");
		var	dsColumn = app.lookup("ColumnList");
		var value =  app.lookup("OrderList").getValue(result[b]-b, "Value");
		var deleteRow = dsColumn.findFirstRow("Value == '" + value+"'");
		dsOrder.realDeleteRow(result[b]-b);
		dsColumn.insertRowData(result, true, {"Value":value});
		}
		SelectList.redraw();
}
