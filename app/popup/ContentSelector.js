/************************************************
 * ContentSelector.js
 * Created at 2018. 11. 27. 오후 5:05:21.
 *
 * @author fois
 ************************************************/

var ctrlDragManager = cpr.core.Module.require("lib/ControlDragManager");
var dataDragManager = cpr.core.Module.require("lib/DataDragManager");

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var initValue = app.getHost().initValue;	
	
	var dsSelectContents = app.lookup("dsSelectContents");
	initValue["SrcTitle"].forEach(function(item) {
		var columnName = "";
		initValue["Title"].forEach(function(importItem) {
			if (importItem === item ){
				columnName = importItem;
			}
		});
		dsSelectContents.addRowData({"SourceName":item,"ColumnName":columnName});			
	});	
	dsSelectContents.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	
	var dsImportContents = app.lookup("dsImportContents");		
	initValue["Title"].forEach(function(item,idx) {
		if( item != undefined ){
			var newRow = dsImportContents.addRowData({"ColumnName":item});
			var selRow = dsSelectContents.findFirstRow("ColumnName == '" + item+"'");
			
			if( selRow != null ) {
				//console.log(selRow);
				dsImportContents.setRowState(newRow.getIndex(),cpr.data.tabledata.RowState.DELETED);
			} else {
				dsImportContents.setRowState(newRow.getIndex(),cpr.data.tabledata.RowState.UNCHANGED);
			}
		}		
	});
	app.lookup("USIMS_grdImportContents").redraw();	
}

/*
 * 그리드에서 mousedown 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 누를 때 발생하는 이벤트.
 */
function onUSIMS_grdSelectedContentsMousedown(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var uSIMS_grdSelectedContents = e.control;
		
	if (e.targetObject && e.targetObject.row) {
		var row = e.targetObject.row;
		if ( row.getValue("ColumnName")==""){
			return;
		}
		dataDragManager.dataTransfer = {"Src":"Selected","Row":e.targetObject.row};
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
		border: "solid 1px red",
		backgroundColor: "#FFF",
		"box-shadow": "0px 2px 2px 0px rgba(0, 0, 0, .3)"
	});
	

	dragMessage.ellipsis = true;
	var text = e.targetObject.row.getValue("ColumnName");
	dragMessage.value = text;	
	dataDragManager.dragStart(dragMessage, app, e);
}

/*
 * 그리드에서 mouseup 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 뗄 때 발생하는 이벤트.
 */
function onUSIMS_grdImportContentsMouseup(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var uSIMS_grdImportContents = e.control;
	
	if(dataDragManager.dataTransfer){
		
		if( dataDragManager.dataTransfer["Src"] === "Selected"){			
				
			var row = dataDragManager.dataTransfer["Row"];
								
			var name = row.getValue("ColumnName");
			
			var dsImportContents = app.lookup("dsImportContents");
			var importRow = dsImportContents.findFirstRow("ColumnName == '" + name+"'");
			
			if ( importRow ){
				row.setValue("ColumnName","");
				var dsSelectContents = app.lookup("dsSelectContents");
				dsSelectContents.updateRow(importRow.getIndex(), row);
				
				dsImportContents.setRowState(importRow.getIndex(), cpr.data.tabledata.RowState.UNCHANGED);
							
				app.lookup("USIMS_grdSelectedContents").redraw();	
				uSIMS_grdImportContents.redraw();			
			}	
		}
	}
}

/*
 * 그리드에서 mousedown 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 누를 때 발생하는 이벤트.
 */
function onUSIMS_grdImportContentsMousedown(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var uSIMS_grdImportContents = e.control;
	
	if (e.targetObject && e.targetObject.row) {
		var row = e.targetObject.row;
		if ( row.getValue("ColumnName")==""){
			return;
		}
		if ( row.getState() != cpr.data.tabledata.RowState.UNCHANGED ){
			return;
		}
		
		dataDragManager.dataTransfer = {"Src":"Import","Row":e.targetObject.row};
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
		border: "solid 1px red",
		backgroundColor: "#FFF",
		"box-shadow": "0px 2px 2px 0px rgba(0, 0, 0, .3)"
	});
	

	dragMessage.ellipsis = true;
	var text = e.targetObject.row.getValue("ColumnName");
	dragMessage.value = text;	
	dataDragManager.dragStart(dragMessage, app, e);
	
}

// 가져올 매칭 항목으로 드래그 앤 드롭한 경우
function onUSIMS_grdSelectedContentsMouseup(/* cpr.events.CMouseEvent */ e){
	/* @type cpr.controls.Grid	 */
	var uSIMS_grdSelectedContents = e.control;	
	if(dataDragManager.dataTransfer){
		
		if( dataDragManager.dataTransfer["Src"] === "Import"){			
			
			var row = dataDragManager.dataTransfer["Row"];		
			var name = row.getValue("ColumnName");
			
			var dsSelectContents = app.lookup("dsSelectContents");
			var existRow = dsSelectContents.getRow(e.targetObject.rowIndex);
			var existContentsName = existRow.getValue("ColumnName"); // 드롭 한 위치에 다른 항목이 있으면 꺼내서 파일 항목에서 해당 항목을 활성화
			
			dsSelectContents.updateRow(e.targetObject.rowIndex, {"ColumnName":name});
				
			var dsImportContents = app.lookup("dsImportContents");			
			var importRow = dsImportContents.findFirstRow("ColumnName == '" + name+"'");			
			if ( importRow ){										
				dsImportContents.setRowState(importRow.getIndex(), cpr.data.tabledata.RowState.DELETED);
			}
				
			if( existRow ){							
				var importRow = dsImportContents.findFirstRow("ColumnName == '" + existContentsName+"'");			
				if ( importRow ){										
					dsImportContents.setRowState(importRow.getIndex(), cpr.data.tabledata.RowState.UNCHANGED);
				}	
			}
							
			uSIMS_grdSelectedContents.redraw();	
			app.lookup("USIMS_grdImportContents").redraw();
		}
	}	
}

function onUSIMS_btnApplyClick(/* cpr.events.CMouseEvent */ e){
	var uSIMC_btnApply = e.control;
	app.close(app.lookup("dsSelectContents").getRowDataRanged());
}

function onUSIMS_grdSelectedContentsDblclick(/* cpr.events.CMouseEvent */ e){
	var uSIMS_grdSelectedContents = e.control;
		
	var row = uSIMS_grdSelectedContents.getSelectedRow();
								
	var name = row.getValue("ColumnName");
	
	var dsImportContents = app.lookup("dsImportContents");
	var importRow = dsImportContents.findFirstRow("ColumnName == '" + name+"'");
	
	if ( importRow ){
		row.setValue("ColumnName","");
		var dsSelectContents = app.lookup("dsSelectContents");
		dsSelectContents.updateRow(importRow.getIndex(), row);
		
		dsImportContents.setRowState(importRow.getIndex(), cpr.data.tabledata.RowState.UNCHANGED);
			
		uSIMS_grdSelectedContents.redraw();
		app.lookup("USIMS_grdImportContents").redraw();			
	}	
}
