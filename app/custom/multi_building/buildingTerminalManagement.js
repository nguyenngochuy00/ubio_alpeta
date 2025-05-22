/************************************************
 * buildingTerminalManagement.js
 * Created at 2024. 2. 22. 오전 11:23:23.
 *
 * @author sep
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var selectIDMap;
var pageRowCount = 50;
var isFirstLoad = true;

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	selectIDMap = new Map();
	app.lookup("sms_getElevatorSetList").send();
	
	var udcRegistTerminalList = app.lookup("BTM_udcRegistTerminalList");	
	udcRegistTerminalList.deleteColumn([13,12,11,10,9,8,7,6,5,4,3]);	
	
	var udcUnregistTerminalList = app.lookup("BTM_udcUnregistTerminalList");	
	udcUnregistTerminalList.deleteColumn([13,12,11,10,9,8,7,6,5,4,3]);
}

function onSms_getElevatorSetListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var value = result.getValue("ResultCode");
	
	if( result.getValue("ResultCode")== COMERROR_NONE) {	
		console.log("success getElvatorSetList");
	} else {
		console.log("error getElvatorSetList " + dataManager.getString(getErrorString(result.getValue("ResultCode"))));		
	}
}

function onSms_getElevatorSetListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);	
}

function onSms_getElevatorSetListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}


function onEVMGT_grdElevatorsListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var grdBuildingList = app.lookup("BTM_grdBuildingList");
	var buildingCode = grdBuildingList.getSelectedRow().getValue("ElevatorSetID");
	app.lookup("TerminalList").clear();
	app.lookup("RegTerminalList").clear();
	app.lookup("UnRegTerminalList").clear();
	
	app.lookup("BTM_udcRegistTerminalList").setCurrentPageIndex(1);
	app.lookup("BTM_udcUnregistTerminalList").setCurrentPageIndex(1);
	isFirstLoad = true;
	
	var smsGetBuildingTerminalList = app.lookup("sms_getBuildingTerminalList");
	smsGetBuildingTerminalList.action = "/v1/mbm/building/" + buildingCode;
	smsGetBuildingTerminalList.setParameters("limit", pageRowCount);
	smsGetBuildingTerminalList.setParameters("offset", 0);
	
	smsGetBuildingTerminalList.send();	
}

function onSms_getBuildingTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var value = result.getValue("ResultCode");
	var dmTotal = app.lookup("Total");
	comLib.hideLoadMask();
	if( result.getValue("ResultCode")== COMERROR_NONE) {
		var dsRegisteredTerminal = app.lookup("RegTerminalList");
		app.lookup("TerminalList").copyToDataSet(dsRegisteredTerminal);	
		var udcRegisteredTerminal = app.lookup("BTM_udcRegistTerminalList");
		udcRegisteredTerminal.setTerminalList(dsRegisteredTerminal);
		udcRegisteredTerminal.setPageRowCount(pageRowCount);
//		udcRegisteredTerminal.setCurrentPageIndex(1);
		udcRegisteredTerminal.setTotalCount(dmTotal.getValue("Count"));
		
		selectIDMap.clear();			
		app.lookup("BTM_udcUnregistTerminalList").setCurrentPageIndex(1);
		app.lookup("BTM_udcUnregistTerminalList").setPageRowCount(pageRowCount);
		
		var terminalCnt = dsRegisteredTerminal.getRowCount();
		
		for( var i=0; i < terminalCnt; i++ ){
		
			var row = dsRegisteredTerminal.getRow(i);
			if( row ){
				selectIDMap.set(row.getValue("ID"),1);
			}
		}
		
		if(isFirstLoad){
			isFirstLoad = false;
			sendTerminalListRequest();			
		} else {
			
		}
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));		
	}
}


function onSms_getBuildingTerminalListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);	
}

function onSms_getBuildingTerminalListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}


function onBTM_udcUnregistTerminalListPagechange(/* cpr.events.CSelectionEvent */ e){
	app.lookup("UnRegTerminalList").clear();
	sendTerminalListRequest();
}

function sendTerminalListRequest() {
	app.lookup("TerminalList").clear();
	var terminalList = app.lookup("BTM_udcUnregistTerminalList");	
	var curIndex = terminalList.getCurrentPageIndex();
	
	var pageRowCount = terminalList.getPageRowCount();
	var offset = (curIndex - 1) * pageRowCount;
	
	var smsGetTerminalList = app.lookup("sms_getTerminalList");
		
	smsGetTerminalList.setParameters("offset", offset);
	smsGetTerminalList.setParameters("limit", pageRowCount);
	
	var fields = ["terminal_id","name"];
	smsGetTerminalList.setParameters("fields", fields);
	
	comLib.showLoadMask("",dataManager.getString("Str_TerminalLoading"),"",pageRowCount);
	smsGetTerminalList.send();	
} 

function onSms_getTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dsUnRegTerminalList = app.lookup("UnRegTerminalList");
	app.lookup("TerminalList").copyToDataSet(dsUnRegTerminalList);
	
	var result = app.lookup("Result");
	var value = result.getValue("ResultCode");
	var dmTotal = app.lookup("Total");
	
	if( result.getValue("ResultCode")== COMERROR_NONE) {
		var udcUnregisteredTerminal = app.lookup("BTM_udcUnregistTerminalList");
		udcUnregisteredTerminal.setTerminalList(dsUnRegTerminalList);
		udcUnregisteredTerminal.refreshTerminalList(selectIDMap);
		
		var totalCount = parseInt(dmTotal.getValue("Count"));		
		udcUnregisteredTerminal.setTotalCount(totalCount);
		comLib.hideLoadMask();
	} else {
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));		
	}
		
}

// ">" 버튼(BTM_btnTerminalUnregist)click
function onBTM_btnTerminalUnregistClick(/* cpr.events.CMouseEvent */ e){
	var dsRegistTerminalList = app.lookup("RegTerminalList");
	
	var udcRegistTerminalList = app.lookup("BTM_udcRegistTerminalList");
	var checkedIndices = udcRegistTerminalList.getCheckedRowIndices();
	
	var idList = [];
	checkedIndices.forEach(function(index){
		var row = udcRegistTerminalList.getRow(index);		
		var terminalID = row.getValue("ID");
			
		selectIDMap.delete(terminalID);
		idList.push(terminalID);
	});
		
	idList.forEach(function(terminalID){						
		var delRow = dsRegistTerminalList.findFirstRow("ID == "+terminalID)
		dsRegistTerminalList.realDeleteRow(delRow.getIndex());
	});
			
	var selectTotal = dsRegistTerminalList.getRowCount();
	
	udcRegistTerminalList.setTotalCount(selectTotal);		
	udcRegistTerminalList.setPaging(selectTotal, pageRowCount, 3);
	var readCount = (pageRowCount-1>selectTotal)?selectTotal-1:pageRowCount-1;	
	
	var pageidx = udcRegistTerminalList.getCurrentPageIndex();
	var start = (pageidx-1)*pageRowCount;
	var end = pageidx*pageRowCount-1;
	if ( end >= dsRegistTerminalList.getRowCount() ){
		end = dsRegistTerminalList.getRowCount()-1;
	}
	
	udcRegistTerminalList.setTerminalListRows(dsRegistTerminalList.getRowDataRanged(start, end));
	
	var udcUnRegistTerminalList = app.lookup("BTM_udcUnregistTerminalList");
	udcUnRegistTerminalList.refreshTerminalList(selectIDMap);
}

// "<" 버튼(BTM_btnTerminalRegist)click
function onBTM_btnTerminalRegistClick(/* cpr.events.CMouseEvent */ e){
	var udcUnRegisteredTerminalList = app.lookup("BTM_udcUnregistTerminalList");
	var indices = udcUnRegisteredTerminalList.getCheckedRowIndices();	
	if( indices.length == 0){
		return;
	}
	
	var udcRegisteredTerminal = app.lookup("BTM_udcRegistTerminalList");	
	var dsRegisteredTerminalList = app.lookup("RegTerminalList");
		
	var dsUnRegisteredTerminalList = app.lookup("UnRegTerminalList");
	
	indices.forEach(function(index){		
		var row = dsUnRegisteredTerminalList.getRow(index);		
		var terminalID = row.getValue("ID");
				
		if( selectIDMap.get(terminalID) == undefined ){				
			dsRegisteredTerminalList.addRowData(row.getRowData());
			
			selectIDMap.set(terminalID,1);
			dsUnRegisteredTerminalList.deleteRow(row.getIndex())
		}
	});
	udcUnRegisteredTerminalList.setUnCheckAll();
	dsRegisteredTerminalList.setSort("ID");
		
	var registTotal = dsRegisteredTerminalList.getRowCount();	
	udcRegisteredTerminal.setTotalCount(registTotal);
		
	udcRegisteredTerminal.setPaging(registTotal, pageRowCount, 3);
		
	var pageidx = udcRegisteredTerminal.getCurrentPageIndex();
	
	var start = (pageidx-1)*pageRowCount;
	var end = pageidx*pageRowCount-1;
	if ( end >= dsRegisteredTerminalList.getRowCount() ){
		end = dsRegisteredTerminalList.getRowCount()-1;		
	}
	
	udcRegisteredTerminal.setTerminalListRows(dsRegisteredTerminalList.getRowDataRanged(start, end));	
	udcUnRegisteredTerminalList.refreshTerminalList(selectIDMap);
}

// ">>" 버튼(BTM_btnTerminalUnregistAll) click
function onBTM_btnTerminalUnregistAllClick(/* cpr.events.CMouseEvent */ e){
	var dsRegistTerminalList = app.lookup("RegTerminalList");	
	var udcRegistTerminalList = app.lookup("BTM_udcRegistTerminalList");
	
	dsRegistTerminalList.clear();
	selectIDMap.clear();
	udcRegistTerminalList.setTotalCount(0);
	udcRegistTerminalList.setTerminalList(dsRegistTerminalList);

	var udcUnRegistTerminalList = app.lookup("BTM_udcUnregistTerminalList");
	udcUnRegistTerminalList.refreshTerminalList(selectIDMap);
}

// "<<" 버튼(BTM_btnTerminalRegistAll)에서 click
function onBTM_btnTerminalRegistAllClick(/* cpr.events.CMouseEvent */ e){
	var udcUnRegisteredTerminalList = app.lookup("BTM_udcUnregistTerminalList");
	var dsUnRegisteredTerminalList = app.lookup("UnRegTerminalList");
	
	var udcRegisteredTerminal = app.lookup("BTM_udcRegistTerminalList");	
	var dsRegisteredTerminalList = app.lookup("RegTerminalList");
		
	var total = dsUnRegisteredTerminalList.getRowCount();
	for( var index = 0; index < total; index++ ){
		var row = dsUnRegisteredTerminalList.getRow(index);
		var terminalID = row.getValue("ID");
		
		if( selectIDMap.get(terminalID) == undefined ){				
			dsRegisteredTerminalList.addRowData(row.getRowData());
			
			selectIDMap.set(terminalID,1);
			dsUnRegisteredTerminalList.deleteRow(row.getIndex())
		}
	}
		
	udcUnRegisteredTerminalList.setUnCheckAll();
	dsRegisteredTerminalList.setSort("TerminalID");
		
	var registTotal = dsRegisteredTerminalList.getRowCount();	
	udcRegisteredTerminal.setTotalCount(registTotal);
		
	udcRegisteredTerminal.setPaging(registTotal, pageRowCount, 3);
		
	var pageidx = udcRegisteredTerminal.getCurrentPageIndex();
	
	var start = (pageidx-1)*pageRowCount;
	var end = pageidx*pageRowCount-1;
	if ( end >= dsRegisteredTerminalList.getRowCount() ){
		end = dsRegisteredTerminalList.getRowCount()-1;		
	}
	
	udcRegisteredTerminal.setTerminalListRows(dsRegisteredTerminalList.getRowDataRanged(start, end));	
	udcUnRegisteredTerminalList.refreshTerminalList(selectIDMap);
}


function onBTM_btnSaveClick(/* cpr.events.CMouseEvent */ e){
	comLib.showLoadMask("",dataManager.getString("Str_Save"),"",0);	
	var smsPostBuildingTerminal = app.lookup("sms_postBuildingTerminal");
	var dsRegisteredTerminalList = app.lookup("RegTerminalList");
	var dsTerminalIDs = app.lookup("TerminalIDs");
	dsTerminalIDs.clear();
	
	var rowCount = dsRegisteredTerminalList.getRowCount();
	
	for( var i = 0; i < rowCount; i++ ){
		var row = dsRegisteredTerminalList.getRow(i);	
		dsTerminalIDs.addRowData({"ID":row.getValue("ID")});	
	}
	
	app.lookup("BTM_udcRegistTerminalList").setCurrentPageIndex(1);
	app.lookup("BTM_udcUnregistTerminalList").setCurrentPageIndex(1);
	
	var buildingCode = app.lookup("BTM_grdBuildingList").getSelectedRow().getValue("ElevatorSetID");
	smsPostBuildingTerminal.action = "/v1/mbm/building/" + buildingCode;
	smsPostBuildingTerminal.send();	
}


function onSms_postBuildingTerminalSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var value = result.getValue("ResultCode");
	comLib.hideLoadMask();
	if( result.getValue("ResultCode")== COMERROR_NONE) {
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Saved"));	
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));		
	}
}


function onSms_postBuildingTerminalSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);	
}

function onSms_postBuildingTerminalSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

function onBTM_udcRegistTerminalListPagechange(/* cpr.events.CSelectionEvent */ e){
	comLib.showLoadMask("",dataManager.getString("Str_TerminalLoading"),"",pageRowCount);
	var grdBuildingList = app.lookup("BTM_grdBuildingList");
	var buildingCode = grdBuildingList.getSelectedRow().getValue("ElevatorSetID");
	app.lookup("TerminalList").clear();
	app.lookup("RegTerminalList").clear();
	
	var smsGetBuildingTerminalList = app.lookup("sms_getBuildingTerminalList");
	smsGetBuildingTerminalList.action = "/v1/mbm/building/" + buildingCode;
	smsGetBuildingTerminalList.setParameters("limit", pageRowCount);
	var start = (app.lookup("BTM_udcRegistTerminalList").getCurrentPageIndex()-1)*pageRowCount;
	smsGetBuildingTerminalList.setParameters("offset", start);
	
	smsGetBuildingTerminalList.send();	
//	var udcRegisteredTerminal = app.lookup("BTM_udcRegistTerminalList");
//	var dsRegisteredTerminalList = app.lookup("RegTerminalList");
//	
//	var pageidx = udcRegisteredTerminal.getCurrentPageIndex();
//	var registTotal = dsRegisteredTerminalList.getRowCount();
//	
//	udcRegisteredTerminal.setPaging(registTotal, pageRowCount, 3);
//	
//	var start = (pageidx-1)*pageRowCount;
//	var end = pageidx*pageRowCount-1;
//	if ( end >= dsRegisteredTerminalList.getRowCount() ){
//		end = dsRegisteredTerminalList.getRowCount()-1;		
//	}
//	
//	udcRegisteredTerminal.setTerminalListRows(dsRegisteredTerminalList.getRowDataRanged(start, end));
}
