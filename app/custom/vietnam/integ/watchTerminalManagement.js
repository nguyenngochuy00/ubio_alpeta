/************************************************
 * watchTerminalManagement.js
 * Created at 2024. 8. 9. ���� 1:44:45.
 *
 * @author kth
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var selectIDMap;
var pageRowCount = 500;
//var _terminalListInit = false;
var acarm_oemversion;
//var rABS = true; // T : 바이너리, F : 어레이 버퍼


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	selectIDMap = new Map();
	acarm_oemversion = dataManager.getOemVersion();
	
	var udcRegistTerminalList = app.lookup("VICWTM_udcRegistTerminalList");	//등록된 리더
	udcRegistTerminalList.deleteColumn([19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3]);	
	
	var udcUnregistTerminalList = app.lookup("VICWTM_udcUnregistTerminalList");	
	udcUnregistTerminalList.deleteColumn([19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3]);
	
	var terminalList = app.lookup("VICWTM_udcUnregistTerminalList");
	terminalList.setPaging(0, 500, 3);
	
	app.lookup("VICWTM_btnAreaSave").enabled = true;
	// 등록된 / 미등록된 전부 가져와야 한다.
	sendEnrolledTerminalList();

}
function onSms_SubmitError(/* cpr.events.CSubmissionEvent */ e){	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);}
function onSms_SubmitTimeout(/* cpr.events.CSubmissionEvent */ e){	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getTerminalList = e.control;
	
	var dsTerminalList = app.lookup("TerminalList");
		
	var terminalList = app.lookup("VICWTM_udcUnregistTerminalList");
	terminalList.setTerminalList(dsTerminalList);
	terminalList.refreshTerminalList(selectIDMap);
	
	var dmTotal = app.lookup("Total");
	var totalCount = parseInt(dmTotal.getValue("Count"));		
	terminalList.setTotalCount(totalCount);
	
	comLib.hideLoadMask();
}

function sendTerminalListRequest() {
	var accessAreaCode = -1;
	
	var terminalList = app.lookup("VICWTM_udcUnregistTerminalList");	
	var curIndex = terminalList.getCurrentPageIndex();
	
	var pageRowCount = terminalList.getPageRowCount();
	var offset = (curIndex - 1) * pageRowCount;
	
	// 검색 조건 세팅
	var smsGetTerminalList = app.lookup("sms_getTerminalList");
		
	smsGetTerminalList.setParameters("ExcludeAccessGroup", accessAreaCode);

	// 페이징 계산하여 요청
	smsGetTerminalList.setParameters("offset", offset);
	smsGetTerminalList.setParameters("limit", pageRowCount);
	
	var fields = ["terminal_id","name"];
	smsGetTerminalList.setParameters("fields", fields);
	
	comLib.showLoadMask("",dataManager.getString("Str_TerminalLoading"),"",pageRowCount);
	smsGetTerminalList.send();	
} 

function sendEnrolledTerminalList() {
		
	var sms_getEnrolledTerminalList = app.lookup("sms_getEnrolledTerminalList");
	
	comLib.showLoadMask("",dataManager.getString("Str_TerminalLoading"),"",pageRowCount);
	sms_getEnrolledTerminalList.send();	
} 

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getEnrolledTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var dmResultCode = app.lookup("Result").getValue("ResultCode");
	if( dmResultCode == COMERROR_NONE){
		var udcRegistTerminalList = app.lookup("VICWTM_udcRegistTerminalList");
		
		selectIDMap.clear();
		var dsTerminalInfo = app.lookup("EnrolledTerminalList");
		var terminalCnt = dsTerminalInfo.getRowCount();
		
		for( var i=0; i < terminalCnt; i++ ){
		
			var row = dsTerminalInfo.getRow(i);
			if( row ){
				selectIDMap.set(row.getValue("ID"),1);
			}
		}	
		
		udcRegistTerminalList.setTerminalList(dsTerminalInfo);
		
		var udcUnRegistTerminalList = app.lookup("VICWTM_udcUnregistTerminalList");
		udcUnRegistTerminalList.refreshTerminalList(selectIDMap);
	}
	
	 comLib.showLoadMask("",dataManager.getString("Str_TerminalLoading"),"",pageRowCount);
	 sendTerminalListRequest();
}


/*
 * 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
 */
function onVICWTM_udcRegistTerminalListPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.grid.terminalList
	 */
	var vICWTM_udcRegistTerminalList = e.control;
		
	var udcRegisteredTerminal = app.lookup("VICWTM_udcRegistTerminalList");
	var dsRegisteredTerminalList = app.lookup("EnrolledTerminalList");
	
	var pageidx = udcRegisteredTerminal.getCurrentPageIndex();
	var registTotal = dsRegisteredTerminalList.getRowCount();
	
	udcRegisteredTerminal.setPaging(registTotal, pageRowCount, 3);
	
	var start = (pageidx-1)*pageRowCount;
	var end = pageidx*pageRowCount-1;
	if ( end >= dsRegisteredTerminalList.getRowCount() ){
		end = dsRegisteredTerminalList.getRowCount()-1;		
	}
	
	udcRegisteredTerminal.setTerminalListRows(dsRegisteredTerminalList.getRowDataRanged(start, end));
}


/*
 * 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
 */
function onVICWTM_udcUnregistTerminalListPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.grid.terminalList
	 */
	var vICWTM_udcUnregistTerminalList = e.control;
	sendTerminalListRequest();
}


/*
 * ">" 버튼(VICWTM_btnTerminalUnregist)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVICWTM_btnTerminalUnregistClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var vICWTM_btnTerminalUnregist = e.control;
	
	var dsEnrolledTerminalList = app.lookup("EnrolledTerminalList");
	
	var udcRegistTerminalList = app.lookup("VICWTM_udcRegistTerminalList");
	var checkedIndices = udcRegistTerminalList.getCheckedRowIndices();
	
	var idList = [];
	checkedIndices.forEach(function(index){
		var row = udcRegistTerminalList.getRow(index);		
		var terminalID = row.getValue("ID");
			
		selectIDMap.delete(terminalID);
		idList.push(terminalID);
	});
		
	idList.forEach(function(terminalID){						
		var delRow = dsEnrolledTerminalList.findFirstRow("ID == "+terminalID)
		dsEnrolledTerminalList.realDeleteRow(delRow.getIndex());
	});
			
	var selectTotal = dsEnrolledTerminalList.getRowCount();
	
	udcRegistTerminalList.setTotalCount(selectTotal);		
	udcRegistTerminalList.setPaging(selectTotal, pageRowCount, 3);
	var readCount = (pageRowCount-1>selectTotal)?selectTotal-1:pageRowCount-1;	
	
	var pageidx = udcRegistTerminalList.getCurrentPageIndex();
	var start = (pageidx-1)*pageRowCount;
	var end = pageidx*pageRowCount-1;
	if ( end >= dsEnrolledTerminalList.getRowCount() ){
		end = dsEnrolledTerminalList.getRowCount()-1;
	}
	
	udcRegistTerminalList.setTerminalListRows(dsEnrolledTerminalList.getRowDataRanged(start, end));
	
	var udcUnRegistTerminalList = app.lookup("VICWTM_udcUnregistTerminalList");
	udcUnRegistTerminalList.refreshTerminalList(selectIDMap);
}


/*
 * "<" 버튼(VICWTM_btnTerminalRegist)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVICWTM_btnTerminalRegistClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var vICWTM_btnTerminalRegist = e.control;
	
	var udcUnRegisteredTerminalList = app.lookup("VICWTM_udcUnregistTerminalList");
	var indices = udcUnRegisteredTerminalList.getCheckedRowIndices();	
	if( indices.length == 0){
		return;
	}
	
	var udcRegisteredTerminal = app.lookup("VICWTM_udcRegistTerminalList");	
	var dsRegisteredTerminalList = app.lookup("EnrolledTerminalList");
		
	var dsUnRegisteredTerminalList = app.lookup("TerminalList");
	
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


/*
 * ">>" 버튼(VICWTM_btnTerminalUnregistAll)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVICWTM_btnTerminalUnregistAllClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var vICWTM_btnTerminalUnregistAll = e.control;
	
	var dsRegistTerminalList = app.lookup("EnrolledTerminalList");	
	var udcRegistTerminalList = app.lookup("VICWTM_udcRegistTerminalList");
	
	dsRegistTerminalList.clear();
	selectIDMap.clear();
	udcRegistTerminalList.setTotalCount(0);
	udcRegistTerminalList.setTerminalList(dsRegistTerminalList);

	var udcUnRegistTerminalList = app.lookup("VICWTM_udcUnregistTerminalList");
	udcUnRegistTerminalList.refreshTerminalList(selectIDMap);	
}


/*
 * "<<" 버튼(VICWTM_btnTerminalRegistAll)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVICWTM_btnTerminalRegistAllClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var vICWTM_btnTerminalRegistAll = e.control;
	
	var udcUnRegisteredTerminalList = app.lookup("VICWTM_udcUnregistTerminalList");
	var dsUnRegisteredTerminalList = app.lookup("TerminalList");
	
	var udcRegisteredTerminal = app.lookup("VICWTM_udcRegistTerminalList");	
	var dsRegisteredTerminalList = app.lookup("EnrolledTerminalList");
		
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


/*
 * 버튼(VICWTM_btnAreaSave)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVICWTM_btnAreaSaveClick(/* cpr.events.CMouseEvent */ e){
	// always all save
	var dsEnrolledTerminalList = app.lookup("EnrolledTerminalList");
	var enrollTerminalCount = dsEnrolledTerminalList.getRowCount();
	var dsTerminalIDs = app.lookup("TerminalIDs");
	dsTerminalIDs.clear();
	
	for( var i = 0; i < enrollTerminalCount; i++ ){
		var enrolledterminalInfo = dsEnrolledTerminalList.getRow(i);		
		dsTerminalIDs.addRowData({"ID":enrolledterminalInfo.getValue("ID")});	
	} 
	comLib.showLoadMask("",dataManager.getString("Str_Save"),"",pageRowCount);
	var _sms_postEnrolledTerminalList = app.lookup("sms_postEnrolledTerminalList");
	_sms_postEnrolledTerminalList.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postEnrolledTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var dmResultCode = app.lookup("Result").getValue("ResultCode");
	if( dmResultCode == COMERROR_NONE){
		dataManager.setEnrolledTerminalListVIC(app.lookup("EnrolledTerminalList"));
		console.log(dataManager.getEnrolledTerminalListVIC().getRowDataRanged());
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(dmResultCode)));
	}
	
}
