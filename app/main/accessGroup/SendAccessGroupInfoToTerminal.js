/************************************************
 * SendAccessGroupInfoToTerminal.js
 * Created at 2019. 4. 2. 오전 9:06:31.
 *
 * @author joymrk
 ************************************************/
var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");

var ENABLE_MCP040 = 0;

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	
	ENABLE_MCP040 = dataManager.getENABLE_MCP040();
	
	if(ENABLE_MCP040 == 1) 
	{
		var sms_get_mcp_list = app.lookup("sms_get_mcp_list");
		sms_get_mcp_list.send();			
	}
	else
	{
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

			dsTerminalList.addRowData({"ID": tid, "Name": Name});
			
			dsTerminalList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
		}		
		
	}
	app.lookup("SAGTT_grdTerminals").checkAllRow();
}


function GetMcpTerminalID_From_AcuTerminalID(AcuTerminalID) {
	
	console.log("GetMcpTerminalID_From_AcuTerminalID...AcuTerminalID: " + AcuTerminalID);
	
	var TerminalMcpList = app.lookup("TerminalMcpList");
	
	for(var ii=0;ii<TerminalMcpList.getRowCount();ii++) {
		
		var row = TerminalMcpList.getRow(ii);
		
		var McpTerminalID = row.getValue("TerminalID");
		var AcuTerminalID1 = row.getValue("AcuTerminalID1");
		var AcuTerminalID2 = row.getValue("AcuTerminalID2");
		var AcuTerminalID3 = row.getValue("AcuTerminalID3");
		var AcuTerminalID4 = row.getValue("AcuTerminalID4");
		
		console.log("McpTerminalID: " + McpTerminalID);
		console.log("AcuTerminalID1: " + AcuTerminalID1);
		console.log("AcuTerminalID2: " + AcuTerminalID2);
		console.log("AcuTerminalID3: " + AcuTerminalID3);
		console.log("AcuTerminalID4: " + AcuTerminalID4);
		
		if(AcuTerminalID1 == AcuTerminalID)
		{
			return McpTerminalID;
		}
		
		if(AcuTerminalID2 == AcuTerminalID)
		{
			return McpTerminalID;
		}
		
		if(AcuTerminalID3 == AcuTerminalID)
		{
			return McpTerminalID;
		}
		
		if(AcuTerminalID4 == AcuTerminalID)
		{
			return McpTerminalID;
		}						
	}
	
	return 0;
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getTerminaListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	if (ResultCode == 0) {
		app.lookup("SAGTT_grdTerminals").checkAllRow();
	} else {
		
	}	
	app.lookup("SAGTT_grdTerminals").checkAllRow();
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getTerminaListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var sms_getTerminaList = e.control;
	app.lookup("Result").setValue("ResultCode", -2);
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getTerminaListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", -1);
}


/*
 * "전송" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onSAGTT_btnSendClick(/* cpr.events.CMouseEvent */ e){
	var grdTerminalList = app.lookup("SAGTT_grdTerminals");
	var CheckedRowIndices = grdTerminalList.getCheckRowIndices();
	var dsTerminalList = app.lookup("dsTerminalIDList");

	if (CheckedRowIndices.length == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalNotSelected"),"");
	} else {
		dsTerminalList.clear();
		
		CheckedRowIndices.forEach(function( index ){
			var terminalRow = grdTerminalList.getRow(index);
			dsTerminalList.addRowData({"ID":terminalRow.getValue("ID")});				
		});
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_SendCommondComplete"),"");
	}	 
	
	comLib.showLoadMask("", dataManager.getString("Str_AccessGroupUserUpdate"), "", 0);
	
	var RequestData = app.lookup("sms_postTerminalIDList");
	RequestData.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postTerminalIDListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_postTerminalIDList = e.control;
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	if ( ResultCode == 0) {
		
	} else {
		
	}
	comLib.hideLoadMask();
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_postTerminalIDListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_postTerminalIDList = e.control;
	app.lookup("Result").setValue("ResultCode", -2);
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_postTerminalIDListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_postTerminalIDList = e.control;
	app.lookup("Result").setValue("ResultCode", -1);
}


/*
 * "닫기" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onSAGTT_btnCloseClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var sAGTT_btnClose = e.control;
	app.close();
}


function onSAGTT_imgHelpClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

// 단말 검색 이벤트
function onSearchTerminalSearch(/* cpr.events.CUIEvent */ e){
	/**@type udc.search.searchTerminal*/
	var searchTerminal = e.control;
		
	var memTerminalList = dataManager.getTerminalList();
	
	var category = searchTerminal.searchCategory;
	var keyword = searchTerminal.searchKeyword;
	if( keyword == undefined || searchTerminal.searchKeyword.length == 0 ){
			category = "all"
	}
	
	var dsTerminalList = app.lookup("TerminalList");
	dsTerminalList.clear();
	
	for (var i = 0 ; i< memTerminalList.getRowCount();i++) {
		var terminalInfo = memTerminalList.getRow(i);
		
		var Type = terminalInfo.getValue("Type");
		var Status = terminalInfo.getValue("Status");

		var connStatus = checkTerminalConnectionStatus(Status);
		if (connStatus < 3) { // 미연결 단말기
			continue;	
		}			
		
		var terminalID = parseInt(terminalInfo.getValue("ID"));
		var terminalName = terminalInfo.getValue("Name");
		var target = "";			
		var bInsert = false;
		
		if(category == "id"){
			if( terminalID.toString().search(keyword) >= 0){
				bInsert = true;				
			}
		} else if(category == "name"){
			if( terminalName.search(keyword) >= 0){
				bInsert = true;
			}
		} else {
			bInsert = true;
		}
		
		if( bInsert == true ){
			dsTerminalList.addRowData({"ID": terminalID, "Name": terminalName});
			dsTerminalList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
		}
	}	
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_get_mcp_listSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_get_mcp_list = e.control;
	
	
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
				
		console.log("Type: " + Type);		
		

		if(21 == Type) /* MCP040 */	
		{
			dsTerminalList.addRowData({"ID": tid, "Name": Name + " (MCP040)"});
		}	
		else
		{
			var McpTerminalID = GetMcpTerminalID_From_AcuTerminalID(tid);
			if(0 != McpTerminalID)
			{
				dsTerminalList.addRowData({"ID": tid, "Name": Name + " ( Acu -> MCP: " + McpTerminalID + " )"});
			}
			else
			{
				dsTerminalList.addRowData({"ID": tid, "Name": Name});
			}
		}			
	}

	dsTerminalList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
}


/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onSAGTT_grdTerminalsSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var sAGTT_grdTerminals = e.control;
	
	console.log("onSAGTT_grdTerminalsSelectionChange");
	
}


/*
 * 그리드에서 row-check 이벤트 발생 시 호출.
 * Grid의 RowCheckbox가 체크 되었을 때 발생하는 이벤트. (columnType=checkbox)
 */
function onSAGTT_grdTerminalsRowCheck(/* cpr.events.CGridEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var sAGTT_grdTerminals = e.control;
	
	console.log("onSAGTT_grdTerminalsRowCheck");
	
	var CheckedRowIndices = sAGTT_grdTerminals.getCheckRowIndices();
	
	
	
	CheckedRowIndices.forEach(function( index ){
		
		console.log("index:" + index);
		
		var terminalRow = sAGTT_grdTerminals.getRow(index);
		
		var ID = terminalRow.getValue("ID")	;

		var TerminalMcpList = app.lookup("TerminalMcpList");
		
		for(var ii=0;ii<TerminalMcpList.getRowCount();ii++) {
			
			
			
			var row = TerminalMcpList.getRow(ii);
			
			var McpTerminalID = row.getValue("TerminalID");
			var AcuTerminalID1 = row.getValue("AcuTerminalID1");
			var AcuTerminalID2 = row.getValue("AcuTerminalID2");
			var AcuTerminalID3 = row.getValue("AcuTerminalID3");
			var AcuTerminalID4 = row.getValue("AcuTerminalID4");
			
			console.log("McpTerminalID: " + McpTerminalID);
			console.log("AcuTerminalID1: " + AcuTerminalID1);
			console.log("AcuTerminalID2: " + AcuTerminalID2);
			console.log("AcuTerminalID3: " + AcuTerminalID3);
			console.log("AcuTerminalID4: " + AcuTerminalID4);
			
			if(McpTerminalID == ID)
			{
				for( var vv =0;vv< sAGTT_grdTerminals.getRowCount() ;vv++) 
				{
					if( AcuTerminalID1 == sAGTT_grdTerminals.getRow(vv).getValue("ID"))
					{
						sAGTT_grdTerminals.setCheckRowIndex(vv, true);
					}
					
					if( AcuTerminalID2 == sAGTT_grdTerminals.getRow(vv).getValue("ID"))
					{
						sAGTT_grdTerminals.setCheckRowIndex(vv, true);
					}
					
					if( AcuTerminalID3 == sAGTT_grdTerminals.getRow(vv).getValue("ID"))
					{
						sAGTT_grdTerminals.setCheckRowIndex(vv, true);
					}
					
					if( AcuTerminalID4 == sAGTT_grdTerminals.getRow(vv).getValue("ID"))
					{
						sAGTT_grdTerminals.setCheckRowIndex(vv, true);
					}
					
					
					break;
				}
				
			}			
		}	
	});	
	

	
}
