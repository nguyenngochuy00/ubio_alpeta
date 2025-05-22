/************************************************
 * monitoringGrid.js
 * Created at 2021. 9. 29. 오전 9:38:24.
 *
 * @author sw2userAmin
 ************************************************/
var dataDragManager = cpr.core.Module.require("lib/DataDragManager");
var dataManager = cpr.core.Module.require("lib/DataManager");
var StrLib = cpr.core.Module.require("lib/StrLib");

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	var dsColumnList = app.lookup("ColumnList");
	var dsOrderList = app.lookup("OrderList");
	
	var selectStorage = localStorage.getItem("selectStorage");
	var grdStorage = localStorage.getItem("grdStorage");
	
	var grdString = grdStorage.split(',');
	var grdcount = grdString.length;
		
		// 1. 선택값(selectStorage) 없을때
		if(selectStorage == null){
		for(var a=0; a<grdcount; a++){
		dsColumnList.addRowData({"Value":grdString[a]});
		}
		// 2. 선택값(selectStorage) 있을때					
		} else { 
		var selectString = selectStorage.split(',');			
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
	initComboAuthLogColumn();
}

function onMG_grdColumnListMousedown(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var mG_grdColumnList = e.control;
	
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
	if(text=="EventTime"){
		text = "AuthEventTime";
	}
	if(text=="Dummy"){
		text = "ExtraDevice";
	}
	dragMessage.value = dataManager.getString("Str_"+text);						
	dataDragManager.dragStart(dragMessage, app, e); 
}

function onMG_grdColumnListMouseup(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var mG_grdColumnList = e.control;
	
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
		mG_grdColumnList.redraw();
	}
}

function onMG_grdOrderistMouseup(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var mG_grdOrderist = e.control;
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
		mG_grdOrderist.redraw();
	}
}

function onMG_grdOrderistMousedown(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var mG_grdOrderist = e.control;
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
	if(text=="EventTime"){
		text = "AuthEventTime";
	}
	if(text=="Dummy"){
		text = "ExtraDevice";
	}
	dragMessage.value = dataManager.getString("Str_"+text);						
	dataDragManager.dragStart(dragMessage, app, e);
}

//저장 버튼
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var grdOrderCount = app.lookup("MG_grdOrderist").rowCount;
	
	if(grdOrderCount == 0 || grdOrderCount == null){ 
		dialogAlert(app,dataManager.getString("Str_Fail"),dataManager.getString("Str_ErrorColumnselection"));
		return;
	} 
	var selectArr = app.lookup("OrderList").getColumnData("Value");

	var selectStorage = selectArr.toString();
	app.close(selectStorage);
}

function initComboAuthLogColumn() {
	var cmdAll = app.lookup("MRGD_cmdAll");
	if (cmdAll) {
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthEventTime"), "EventTime"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_TerminalID"), "TerminalID"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_UserID"), "UserID"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_UserName"), "UserName"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_UniqueID"), "UniqueID"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthType"), "AuthType"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResult"), "AuthResult"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_Func"), "Func"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_FuncType"), "FuncType"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_Card"), "Card"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_Detail"), "Detail"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_ExtraDevice"), "Dummy"));
		cmdAll.addItem(new cpr.controls.Item(dataManager.getString("Str_TerminalName"), "TerminalName"));
		}
	var cmdSelect = app.lookup("MRGD_cmdSelect");
	if (cmdSelect) {
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthEventTime"), "EventTime"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_TerminalID"), "TerminalID"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_UserID"), "UserID"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_UserName"), "UserName"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_UniqueID"), "UniqueID"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthType"), "AuthType"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResult"), "AuthResult"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_Func"), "Func"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_FuncType"), "FuncType"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_Card"), "Card"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_Detail"), "Detail"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_ExtraDevice"), "Dummy"));
		cmdSelect.addItem(new cpr.controls.Item(dataManager.getString("Str_TerminalName"), "TerminalName"));
		}
		}

//칼럼 초기화
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
		var button = e.control;
		var grdStorage = localStorage.getItem("grdStorage");
		dialogConfirm(app, dataManager.getString("Str_Complete"),dataManager.getString("Str_ColumnDialog"),
		function( /*cpr.controls.Dialog*/ dialog){dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				app.close(grdStorage);
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
	var ColumnList = app.lookup("MG_grdColumnList");
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
	var SelectList = app.lookup("MG_grdOrderist");
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
	var SelectList = app.lookup("MG_grdColumnList");
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
	var SelectList = app.lookup("MG_grdOrderist");
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
