/************************************************
 * setFingerRangking.js
 * Created at 2019. 7. 7. 오후 1:31:50.
 *
 * @author joymrk
 ************************************************/
var dataDragManager = cpr.core.Module.require("lib/DataDragManager");
var dataManager = cpr.core.Module.require("lib/DataManager");

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
 //1, 2, 3, 4, 5, 6, 7, 8, 9, 10
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	var initValue = app.getHost().initValue;
	var arrFpOrder = initValue["arrFpOrder"]; // 지문 순서
	console.log(arrFpOrder,arrFpOrder.length);
	if(arrFpOrder.length < 10){
		arrFpOrder = new Array(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
	}
	console.log(arrFpOrder,arrFpOrder.length);
	var dsFpOrderList = app.lookup("dsFingerprintOrderList");
	for ( var i=0; i<arrFpOrder.length; i++){
		var finger =  getFingerString(arrFpOrder[i]);
		if ( finger == null || finger == "" ) continue;
		
		var newRow = dsFpOrderList.addRowData({"finger": finger,"value":arrFpOrder[i]});
		console.log(newRow.getRowData());
		dsFpOrderList.setRowState(newRow.getIndex(),cpr.data.tabledata.RowState.UNCHANGED);
	}
	
	console.log(dsFpOrderList.getRowDataRanged());
	app.lookup("SESFP_grpFporder").redraw();
	
}

function getFingerString(FpOrder) {
	switch(FpOrder) {
		case 1: return dataManager.getString("Str_FingerOrderRightthumb"); break;
		case 2: return dataManager.getString("Str_FingerOrderRightSecondfinger"); break;
		case 3: return dataManager.getString("Str_FingerOrderRightmiddlefinger"); break;
		case 4: return dataManager.getString("Str_FingerOrderRightFourthfinger"); break;
		case 5: return dataManager.getString("Str_FingerOrderRightlittlefinger"); break;
		case 6: return dataManager.getString("Str_FingerOrderLeftthumb"); break;
		case 7: return dataManager.getString("Str_FingerOrderLeftSecondfinger"); break;
		case 8: return dataManager.getString("Str_FingerOrderLeftmiddlefinger"); break;
		case 9: return dataManager.getString("Str_FingerOrderLeftFourthfinger"); break;
		case 10: return dataManager.getString("Str_FingerOrderLeftlittlefinger"); break;
		default : return ""; break;
	}
}


/*
 * 그리드에서 mousedown 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 누를 때 발생하는 이벤트.
 */
function onSESFP_grpFporderListMousedown(/* cpr.events.CMouseEvent */ e){
	if (e.targetObject && e.targetObject.row) {
		var row = e.targetObject.row;	
		if(row.getState() == cpr.data.tabledata.RowState.DELETED){
			
			return;
		}
		dataDragManager.dataTransfer = {"Src":"FpOrderList","Row":row};
	} else {
		return;
	}
	
	var appRect = app.getActualRect();	
	var buffer = 20;
	var dragMessage = new cpr.controls.Output("rowmessage");	
	dragMessage.style.css({
		"position": "absolute",
		"left": (e.clientX - appRect.left) + "px",
		"top": ((e.clientY - appRect.top) + buffer) + "px",
		width: "150px",
		height: "25px",
		"text-align":"center",
		border: "solid 1px red",
		backgroundColor: "#FFF",
		"box-shadow": "0px 2px 2px 0px rgba(0, 0, 0, .3)"
	});
	
	dragMessage.ellipsis = true;
	var text = e.targetObject.row.getValue("finger");
	dragMessage.value = text;	
	dataDragManager.dragStart(dragMessage, app, e);
	
}

/*
 * 그리드에서 mouseup 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 뗄 때 발생하는 이벤트.
 */
function onSESFP_grpFporderListMouseup(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var sESFP_grpFporderList = e.control;
	if (dataDragManager.dataTransfer) {
		var row = dataDragManager.dataTransfer["Row"];		
		if( e.targetObject != null && e.targetObject.rowIndex == row.getIndex()){
			return;
		}
		
		var finger = row.getValue("finger");
		var value = row.getValue("value");
		if (finger == null) {
			return;
		}
		
		var dsSource;
		var gridSource;
		if( dataDragManager.dataTransfer["Src"] == "FpOrderList"){
			dsSource = app.lookup("dsFingerprintOrderList");
			gridSource = app.lookup("SESFP_grpFporder");
		} else {
			return;
		}
		
		var updateRow = sESFP_grpFporderList.findFirstRow("finger == '" + finger+"'");
		if (updateRow) {
			
			dsSource.realDeleteRow(row.getIndex());
			sESFP_grpFporderList.setRowState(updateRow.getIndex(), cpr.data.tabledata.RowState.UNCHANGED);
			
			var dsFpOrderList =app.lookup("dsFingerprintOrderList");
			var targetIndex = ( e.targetObject != null )? e.targetObject.rowIndex:dsFpOrderList.getRowCount();		
			dsFpOrderList.insertRowData(targetIndex, false, {"finger":finger,"value":value})
			gridSource.redraw();
			sESFP_grpFporderList.setRowState(targetIndex,cpr.data.tabledata.RowState.UNCHANGED);
			sESFP_grpFporderList.clearSelection();
			sESFP_grpFporderList.redraw();			
		}
	}
}

function onSESFP_btnAppleyClick(/* cpr.events.CMouseEvent */ e){
	var dsFpOrder = app.lookup("dsFingerprintOrderList");
	var FpOrderCnt = dsFpOrder.getRowCount();
	if (FpOrderCnt < 10 ) {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_ErrorSetFingerCountWrong"));
		return;
	}
	var result = [];
	for( var i=0; i<FpOrderCnt;i++){
		var row = dsFpOrder.getRow(i);
		result[i]= row.getValue("value");		
	}
	
	app.close(result);
}
