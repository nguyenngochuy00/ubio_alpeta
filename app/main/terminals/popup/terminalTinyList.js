/************************************************
 * TerminalTinyList.js
 * Created at 2019. 5. 7. 오후 6:51:18.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");


/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	var initValue = app.getHost().initValue;	
	var _popupType = initValue["PopupType"];
	var dmPopupType = app.lookup("dmPopupType");
	switch(_popupType) {
		case "MultiCheck":
			dmPopupType.setValue("MultiCheckFlag", 0);		
			break;
		case "SingleCheck":
			dmPopupType.setValue("MultiCheckFlag", 1);
			break;
		default:
			dmPopupType.setValue("MultiCheckFlag", 0); 
		break;		
	}
	
	if (_popupType == "SingleCheck") {
		app.lookup("TMTIL_grdTerminalList").header.getColumn(0).style.css("visibility", "hidden");//상단 전체체크 해제 버튼 숨김
	}
	
	var memTerminalList = dataManager.getTerminalList();
	//console.log(memTerminalList.getRowDataRanged());
	
	var dsTerminalList = app.lookup("TerminalList");
	dsTerminalList.clear();
	for (var i = 0 ; i< memTerminalList.getRowCount();i++) {
		var indexRow = memTerminalList.getRow(i);
		var Type = indexRow.getValue("Type");
		var Status = indexRow.getValue("Status");

		var connStatus = checkTerminalConnectionStatus(Status);
		if (connStatus < 3) { // 미연결 단말기
			continue;	
		}				
		var tid = parseInt(indexRow.getValue("ID"));
		var Name = indexRow.getValue("Name");
		var Type = indexRow.getValue("Type");
				
		dsTerminalList.addRowData({"TerminalID": tid, "Name": Name, "Type": Type});
		dsTerminalList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	}
	
}

function onSms_getTerminalTinyListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var ResultCode= app.lookup("Result").getValue("ResultCode");
	if (ResultCode == COMERROR_NONE) {
		app.lookup("TMTIL_grp").redraw();
	} else {
		//dialogAlert(app, "Waning", dataManager.getString("Str_TerminalList")+" "+dataManager.getString("Str_Failed")+".("+ResultCode+")");
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalList")+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(ResultCode)));
	}
}

function onSms_getTerminalTinyListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR);	
}

function onSms_getTerminalTinyListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

function onTMTIL_btnSendClick(/* cpr.events.CMouseEvent */ e){
	var terminalList =  app.lookup("TMTIL_grdTerminalList");
	var dsTerminals = app.lookup("terminals");
	dsTerminals.clear();
	
	var chkIndices = terminalList.getCheckRowIndices();
	
	var count = chkIndices.length;
	if (count <= 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedTerminals"));	
		return;
	}
	
	var grdTerminalList = app.lookup("TMTIL_grdTerminalList");
	chkIndices.forEach(function( index ){
		var terminalRow = grdTerminalList.getRow(index);
		dsTerminals.addRowData({"TerminalID":terminalRow.getValue("TerminalID")});				
	});
	
	app.setHostProperty("returnValue", dsTerminals);
	app.close();
}

function onTMTIL_btnCloseClick(/* cpr.events.CMouseEvent */ e){
	app.close();
}

function onTMTIL_grdTerminalListCellClick(/* cpr.events.CGridEvent */ e){
	var MultCheckFlag = app.lookup("dmPopupType").getValue("MultiCheckFlag");
	console.log("MultCheckFlag : "+ MultCheckFlag);
	if (MultCheckFlag == 0 ) { //  MultiCheck
		return;
	}
	
	var tMTIL_grdTerminalList = e.control;
	if (e.cellIndex == 0) {
		tMTIL_grdTerminalList.clearAllCheck();
		tMTIL_grdTerminalList.setCheckRowIndex(e.rowIndex, true);
	}
}
