/************************************************
 * userSelect.js
 * Created at 2018. 10. 16. 오후 4:55:16.
 *
 * @author fois
 ************************************************/
var dataManager;
var comLib;
var pageRowCount = 100;
var numberPerReq = 5000;
/* 
 * selectType : all,search, 사용자를 추가한 방식. 
 * 개별 추가를 선택한 경우 최종적으로 사용자 ID 리스트를 반환. 
 * 전체 추가를 한 경우는 선택된 그룹과 검색 조건 반환
 * 사용자 선택창 팝업시 전체 사용자 리스트를 갖고 있지 않으므로 호출 창쪽에 조건을 반환하여 서버에서 사용자 리스트를 나누어서 받아야 함.
 */
var selectType = "all";  
var selectIDMap;
var _excludeGroup;
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	selectIDMap = new Map();
	comLib = createComUtil(app);
		
	var udcTerminalSelectList = app.lookup("TMSEL_udcTerminalSelectList")
	udcTerminalSelectList.deleteColumn([13,12,11,10,9,8,7,6,5,4,3]);
	udcTerminalSelectList.setPaging(0,numberPerReq,5);		
	udcTerminalSelectList.redraw();	
	
	var initValue = app.getHost().initValue;
	var excludeGroup = initValue["ExcludeGroup"];
	_excludeGroup = excludeGroup;
		
	var udcUserTerminal = app.lookup("TMSEL_udcUserTerminal");	
	udcUserTerminal.initControl(false,true,excludeGroup,false);
	udcUserTerminal.setPageRowCount(pageRowCount,pageRowCount);
	udcUserTerminal.deleteTerminalColumn([13,12,11,10,9,8,7,6,5,4,3]);
	udcUserTerminal.hideTerminalButtons();
	if( initValue != null ){
		udcUserTerminal.setGroupList(initValue["GroupList"]);
	}	
	udcUserTerminal.setSelectedGroup(0);
	//udcUserListGroup.search();	
}

/*
 * ">" 버튼에서 click 이벤트 발생 시 호출. 
 */
function onTMSEL_btnAddClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var tMSEL_btnAdd = e.control;
	
	var dsTerminalSelectList = app.lookup("TerminalSelectList");
	
	var udcUserTerminal = app.lookup("TMSEL_udcUserTerminal");
	var checkedIndices = udcUserTerminal.getTerminalCheckedRowIndices();
	checkedIndices.forEach(function(index){
		var rowData = udcUserTerminal.getTerminalRowData(index);		
		var terminalID = rowData["ID"];
		
		if( selectIDMap.get(terminalID) == undefined ){				
			dsTerminalSelectList.addRowData(rowData);
			
			selectIDMap.set(terminalID,1);
			udcUserTerminal.deleteTerminalRow(index);
		}
	});
			
	onRefreshTerminalSelectCount();
	
	dsTerminalSelectList.setSort("ID");
	
	var selectTotal = dsTerminalSelectList.getRowCount();
	var udcTerminalSelectList = app.lookup("TMSEL_udcTerminalSelectList");
	udcTerminalSelectList.setTotalCount(selectTotal);
		
	udcTerminalSelectList.setPaging(selectTotal, pageRowCount, 5);
	var readCount = (pageRowCount-1>selectTotal)?selectTotal-1:pageRowCount-1;	
	
	var pageidx = udcTerminalSelectList.getCurrentPageIndex();
	var start = (pageidx-1)*pageRowCount;
	var end = pageidx*pageRowCount-1;
	if ( end >= dsTerminalSelectList.getRowCount() ){
		end = dsTerminalSelectList.getRowCount()-1;
	}
	
	udcTerminalSelectList.setTerminalListRows(dsTerminalSelectList.getRowDataRanged(start, end));
}

/*
 * 사용자 정의 컨트롤에서 userListDblclick 이벤트 발생 시 호출.
 */
function onTMSEL_udcUserTerminalTerminalListDblclick(/* cpr.events.CGridEvent */ e){
	/** 
	 * @type udc.grid.gridUserTerminal
	 */
	var tMSEL_udcTerminalSelectList = e.control;

	var rowData = e.row.getRowData();
		
	var dsTerminalSelectList = app.lookup("TerminalSelectList");
	
	var udcUserTerminal = app.lookup("TMSEL_udcUserTerminal");
				
	var terminalID = rowData["ID"];
		
	if( selectIDMap.get(terminalID) == undefined ){				
		dsTerminalSelectList.addRowData(rowData);
		
		selectIDMap.set(terminalID,1);
		udcUserTerminal.deleteTerminalRow(e.row.getIndex());
	}	
			
	onRefreshTerminalSelectCount();
	
	dsTerminalSelectList.setSort("ID");
	
	var selectTotal = dsTerminalSelectList.getRowCount();
	var udcTerminalSelectList = app.lookup("TMSEL_udcTerminalSelectList");
	udcTerminalSelectList.setTotalCount(selectTotal);
		
	udcTerminalSelectList.setPaging(selectTotal, pageRowCount, 5);
	var readCount = (pageRowCount-1>selectTotal)?selectTotal-1:pageRowCount-1;	
	
	var pageidx = udcTerminalSelectList.getCurrentPageIndex();
	var start = (pageidx-1)*pageRowCount;
	var end = pageidx*pageRowCount-1;
	if ( end >= dsTerminalSelectList.getRowCount() ){
		end = dsTerminalSelectList.getRowCount()-1;
	}
	
	udcTerminalSelectList.setTerminalListRows(dsTerminalSelectList.getRowDataRanged(start, end));	
}


/*
 * "<" 버튼에서 click 이벤트 발생 시 호출.
 */
function onTMSEL_btnRemoveClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var tMSEL_btnRemove = e.control;
	
	var dsTerminalSelectList = app.lookup("TerminalSelectList");
	
	var udcTerminalSelectList = app.lookup("TMSEL_udcTerminalSelectList");
	var checkedIndices = udcTerminalSelectList.getCheckedRowIndices();
	var idList = [];
	checkedIndices.forEach(function(index){
		var row = udcTerminalSelectList.getRow(index);		
		var terminalID = row.getValue("ID");
		
		selectIDMap.delete(terminalID);
		idList.push(terminalID);
	});
		
	idList.forEach(function(terminalID){						
		var delRow = dsTerminalSelectList.findFirstRow("ID == "+terminalID)
		dsTerminalSelectList.realDeleteRow(delRow.getIndex());
	});
	
	//udcUserSelectList.setUserList(dsUserSelectList);
			
	var selectTotal = dsTerminalSelectList.getRowCount();
	
	udcTerminalSelectList.setTotalCount(selectTotal);		
	udcTerminalSelectList.setPaging(selectTotal, pageRowCount, 5);
	var readCount = (pageRowCount-1>selectTotal)?selectTotal-1:pageRowCount-1;	
	
	var pageidx = udcTerminalSelectList.getCurrentPageIndex();
	var start = (pageidx-1)*pageRowCount;
	var end = pageidx*pageRowCount-1;
	if ( end >= dsTerminalSelectList.getRowCount() ){
		end = dsTerminalSelectList.getRowCount()-1;
	}
	
	udcTerminalSelectList.setTerminalListRows(dsTerminalSelectList.getRowDataRanged(start, end));
	
	onRefreshTerminalSelectCount();
	onUpdateSrcTerminalListState();	
	
}

/*
 * 사용자 정의 컨트롤에서 userListDblclick 이벤트 발생 시 호출.
 */
function onTMSEL_udcUserSelectListTerminalListDblclick(/* cpr.events.CGridEvent */ e){
	/** 
	 * @type udc.grid.userList
	 */
	var tMSEL_udcTerminalSelectList = e.control;
	
	var dsTerminalSelectList = app.lookup("TerminalSelectList");
	
	var udcTerminalSelectList = app.lookup("TMSEL_udcTerminalSelectList");
	
	var rowData = e.row.getRowData();				
	var terminalID = rowData["ID"];
		
	selectIDMap.delete(terminalID);
							
	var delRow = dsTerminalSelectList.findFirstRow("ID == "+terminalID)
	dsTerminalSelectList.realDeleteRow(delRow.getIndex());
	
	udcTerminalSelectList.setTerminalList(dsTerminalSelectList);
			
	var selectTotal = dsTerminalSelectList.getRowCount();
	
	udcTerminalSelectList.setTotalCount(selectTotal);
		
	udcTerminalSelectList.setPaging(selectTotal, pageRowCount, 5);
	var readCount = (pageRowCount-1>selectTotal)?selectTotal-1:pageRowCount-1;	
	
	var pageidx = udcTerminalSelectList.getCurrentPageIndex();
	var start = (pageidx-1)*pageRowCount;
	var end = pageidx*pageRowCount-1;
	if ( end >= udcTerminalSelectList.getRowCount() ){
		end = udcTerminalSelectList.getRowCount()-1;
	}
	
	udcTerminalSelectList.setTerminalListRows(dsTerminalSelectList.getRowDataRanged(start, end));
	
	onRefreshTerminalSelectCount();
	onUpdateSrcTerminalListState();	
	
}

var terminalSelectOffset;
/*
 * ">>" 버튼에서 click 이벤트 발생 시 호출. 
 */
function onTMSEL_btnAddAllClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var uSSEL_btnAddAll = e.control;
	terminalSelectOffset = 0;
			
	var udcUserTerminal = app.lookup("TMSEL_udcUserTerminal");	
	var totalCount = udcUserTerminal.getTotalCount();
	
	comLib.showLoadMask("pro",dataManager.getString("Str_SelectTerminal"),"",totalCount/numberPerReq);
	
	sendTerminalListRequestAll();
}

/*
 * "<<" 버튼에서 click 이벤트 발생 시 호출. 
 */
function onTMSEL_btnRemoveAllClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var tMSEL_btnRemoveAll = e.control;
	selectIDMap.forEach(function(value,key){	
      selectIDMap.delete(key);
	});
	
	var dsTerminalSelectList = app.lookup("TerminalSelectList");
	dsTerminalSelectList.clear();
		
	var udcTerminalSelectList = app.lookup("TMSEL_udcTerminalSelectList");
	udcTerminalSelectList.clearTerminalList();
	 
	onRefreshTerminalSelectCount();	
	onUpdateSrcTerminalListState();	
}

function onRefreshTerminalSelectCount()	{
	var dsTerminalSelectList = app.lookup("TerminalSelectList");
	var totalCount = dsTerminalSelectList.getRowCount();
	app.lookup("TMSEL_optTerminalSelectTotal").value = totalCount;
	
}

function sendTerminalListRequestAll() {
	var udcUserTerminal = app.lookup("TMSEL_udcUserTerminal");	
	var group = udcUserTerminal.getSelectedGroup();

	var smsGetTerminalList = app.lookup("sms_getTerminalListAll");
	
	// 검색 조건 세팅	
	smsGetTerminalList.setParameters("searchKeyword", udcUserTerminal.searchKeyword);
	if (udcUserTerminal.searchKeyword != undefined && udcUserTerminal.searchKeyword.length > 0) {
		smsGetTerminalList.setParameters("searchCategory", udcUserTerminal.searchCategory);
	} else {
		smsGetTerminalList.setParameters("searchCategory", "");
	}
	if (group != undefined && group.value != "") {
		smsGetTerminalList.setParameters("groupCode", parseInt(group.value, 10));
	} else {
		smsGetTerminalList.setParameters("groupCode", 0);
	}
	smsGetTerminalList.setParameters("subInclude", "true");
	smsGetTerminalList.setParameters("excludeGroup", _excludeGroup);

	// 페이징 계산하여 요청
	smsGetTerminalList.setParameters("offset", terminalSelectOffset);
	smsGetTerminalList.setParameters("limit", numberPerReq);
	
	//console.log("send req : offset "+userSelectOffset)
	
	terminalSelectOffset += numberPerReq;
	
	var fields = ["terminal_id","name","group_code"];
	smsGetTerminalList.setParameters("fields", fields);	
	smsGetTerminalList.send();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsgetTerminalListAllSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */	 
	var smsgetTerminalListAll = e.control;	
		
	var dmTotal = app.lookup("Total");
	var totalCount = parseInt(dmTotal.getValue("Count"));
		
	var dsTerminalSelectList = app.lookup("TerminalSelectList");
	var dsTerminalList = app.lookup("TerminalList");
	
	var recvCount = dsTerminalList.getRowCount();
	for( var i=0; i < recvCount; i++ ){
		var row = dsTerminalList.getRow(i);
		var terminalID = row.getValue("ID");
		
		if( selectIDMap.get(terminalID) == undefined ){				
			dsTerminalSelectList.addRowData(row.getRowData());
			selectIDMap.set(terminalID,1);
		}
	}
	
	if( terminalSelectOffset < totalCount ){
		//console.log("done : offset "+userSelectOffset);
		
		var msg = "단말기 목록 가져오기 "+terminalSelectOffset+"/"+totalCount;
		comLib.updateLoadMask(msg);
	
		sendTerminalListRequestAll();
	} else {
		//console.log("done : finalize ");
		comLib.hideLoadMask();
				
		dsTerminalSelectList.setSort("ID");
		var selectTotal = dsTerminalSelectList.getRowCount();
		
		var udcTerminalSelectList = app.lookup("TMSEL_udcTerminalSelectList");
		udcTerminalSelectList.setTotalCount(selectTotal);
		udcTerminalSelectList.setCurrentPageIndex(1);
		udcTerminalSelectList.setPaging(selectTotal, pageRowCount, 5);
				
		var end = pageRowCount-1;
		if ( end >= dsTerminalSelectList.getRowCount() ){
			end = dsTerminalSelectList.getRowCount()-1;
		}
		
		udcTerminalSelectList.setTerminalListRows(dsTerminalSelectList.getRowDataRanged(0, end));		
		
		onRefreshTerminalSelectCount();
		
		onUpdateSrcTerminalListState();
	}
}

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSmsgetTerminalListAllSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsgetTerminalListAll = e.control;
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsgetTerminalListAllSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsgetTerminalListAll = e.control;
	comLib.hideLoadMask();	
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSmsgetTerminalListAllSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsgetTerminalListAll = e.control;
	comLib.hideLoadMask();
}


/*
 * 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
 */
function onTMSEL_udcTerminalSelectListPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.grid.userList
	 */
	var tMSEL_udcUserSelectList = e.control;
	
	var pageidx = tMSEL_udcUserSelectList.getCurrentPageIndex();
	
	var dsTerminalSelectList = app.lookup("TerminalSelectList");
	var udcTerminalSelectList = app.lookup("TMSEL_udcTerminalSelectList");
	
	var start = (pageidx-1)*pageRowCount;
	var end = pageidx*pageRowCount-1;
	if ( end >= dsTerminalSelectList.getRowCount() ){
		end = dsTerminalSelectList.getRowCount()-1;
	}
		
	udcTerminalSelectList.setTerminalListRows(dsTerminalSelectList.getRowDataRanged(start, end));
}

/*
 * "적용" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTMSEL_btnApplyClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var uSSEL_btnApply = e.control;
	app.close(selectIDMap);
}

function onUpdateSrcTerminalListState(){

	var udcUserTerminal = app.lookup("TMSEL_udcUserTerminal");	
	udcUserTerminal.refreshTerminalList(selectIDMap);
}





