/************************************************
 * userSelect.js
 * Created at 2018. 10. 16. 오후 4:55:16.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");

var comLib;
var pageRowCount = 100;
var numberPerReq = 5000;
var _excludeGroup;
var _excludeTerminalAdmin;
var _privilegeID;
/* 
 * selectType : all,search, 사용자를 추가한 방식. 
 * 개별 추가를 선택한 경우 최종적으로 사용자 ID 리스트를 반환. 
 * 전체 추가를 한 경우는 선택된 그룹과 검색 조건 반환
 * 사용자 선택창 팝업시 전체 사용자 리스트를 갖고 있지 않으므로 호출 창쪽에 조건을 반환하여 서버에서 사용자 리스트를 나누어서 받아야 함.
 */
var selectType = "all";  
var selectIDMap;

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){

	selectIDMap = new Map();
	comLib = createComUtil(app);
	dataManager = getDataManager();
		
	var udcUserSelectList = app.lookup("USSEL_udcUserSelectList")
	udcUserSelectList.deleteColumn([14,13,12,11,10,9,8,7,6,5,4]); //APBZone,FaceIdentify...
	udcUserSelectList.setPaging(0,numberPerReq,5);		
	udcUserSelectList.redraw();	
		
	var initValue = app.getHost().initValue;
	var excludeGroup = initValue["ExcludeGroup"];
	if (excludeGroup){
		_excludeGroup = excludeGroup;
	}else{
		_excludeGroup = -1
	}
	
	var excludeTerminalAdmin = initValue["ExcludeTerminalAdmin"];	
	if (excludeTerminalAdmin){
		_excludeTerminalAdmin = excludeTerminalAdmin;
	}else{
		_excludeTerminalAdmin = -1
	}
	
	var privilegeID = initValue["privilegeID"];
	if (privilegeID) {
		_privilegeID = privilegeID;
	} else {
		_privilegeID = -1;
	}
		
	var udcUserTerminal = app.lookup("USSEL_udcUserTerminal");	
	udcUserTerminal.initControl(true,false,excludeGroup,false);
	udcUserTerminal.setPageRowCount(pageRowCount);
	udcUserTerminal.deleteUserColumn([14,13,12,11,10,9,8,7,6,5,4]);
	udcUserTerminal.setPrivilegeID(_privilegeID);
	udcUserTerminal.hideUserButtons();
	var dsGroupList = dataManager.getGroup();
	udcUserTerminal.setGroupList(dsGroupList);	
	udcUserTerminal.setSelectedGroup(0);
	udcUserTerminal.search();	
}

/*
 * Body에서 unload 이벤트 발생 시 호출.
 * 앱이 언로드된 후 발생하는 이벤트입니다.
 */
function onBodyUnload(/* cpr.events.CEvent */ e){	
	var dsUserList = app.lookup("UserList");
	if(dsUserList){
		dsUserList.clear();
	}	
	var dsUserSelectList = app.lookup("UserSelectList");
	if(dsUserSelectList){
		dsUserSelectList.clear();
	}	
}


/*
 * ">" 버튼에서 click 이벤트 발생 시 호출. 
 */
function onUSSEL_btnAddClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var uSSEL_btnAdd = e.control;
	
	var dsUserSelectList = app.lookup("UserSelectList");
	
	var udcUserListGroup = app.lookup("USSEL_udcUserTerminal");
	var checkedIndices = udcUserListGroup.getUserCheckedRowIndices();
	checkedIndices.forEach(function(index){
		var rowData = udcUserListGroup.getUserRowData(index);		
		var userID = rowData["ID"];
		var userName = rowData["Name"];
		
		if( selectIDMap.get(userID) == undefined ){				
			dsUserSelectList.addRowData(rowData);
			
			selectIDMap.set(userID,userName);
			udcUserListGroup.deleteUserRow(index);
		}
		
	});
			
	onRefreshUserSelectCount();
	
	dsUserSelectList.setSort("ID");
	
	var selectTotal = dsUserSelectList.getRowCount();
	var udcUserSelectList = app.lookup("USSEL_udcUserSelectList");
	udcUserSelectList.setTotalCount(selectTotal);
		
	udcUserSelectList.setPaging(selectTotal, pageRowCount, 5);
	var readCount = (pageRowCount-1>selectTotal)?selectTotal-1:pageRowCount-1;	
	
	var pageidx = udcUserSelectList.getCurrentPageIndex();
	var start = (pageidx-1)*pageRowCount;
	var end = pageidx*pageRowCount-1;
	if ( end >= dsUserSelectList.getRowCount() ){
		end = dsUserSelectList.getRowCount()-1;
	}
	
	udcUserSelectList.setUserListRows(dsUserSelectList.getRowDataRanged(start, end));
}


/*
 * 사용자 정의 컨트롤에서 userListDblclick 이벤트 발생 시 호출.
 */
function onUSSEL_udcUserTerminalUserListDblclick(/* cpr.events.CGridEvent */ e){
	/** 
	 * @type udc.grid.gridUserTerminal
	 */
	var uSSEL_udcUserTerminal = e.control;

	var rowData = e.row.getRowData();
		
	var dsUserSelectList = app.lookup("UserSelectList");
	
	var udcUserListGroup = app.lookup("USSEL_udcUserTerminal");
				
	var userID = rowData["ID"];
	var userName = rowData["Name"];
	
	if( selectIDMap.get(userID) == undefined ){				
		dsUserSelectList.addRowData(rowData);
		
		selectIDMap.set(userID,userName);
		udcUserListGroup.deleteUserRow(e.row.getIndex());
	}	
			
	onRefreshUserSelectCount();
	
	dsUserSelectList.setSort("ID");
	
	var selectTotal = dsUserSelectList.getRowCount();
	var udcUserSelectList = app.lookup("USSEL_udcUserSelectList");
	udcUserSelectList.setTotalCount(selectTotal);
		
	udcUserSelectList.setPaging(selectTotal, pageRowCount, 5);
	var readCount = (pageRowCount-1>selectTotal)?selectTotal-1:pageRowCount-1;	
	
	var pageidx = udcUserSelectList.getCurrentPageIndex();
	var start = (pageidx-1)*pageRowCount;
	var end = pageidx*pageRowCount-1;
	if ( end >= dsUserSelectList.getRowCount() ){
		end = dsUserSelectList.getRowCount()-1;
	}
	
	udcUserSelectList.setUserListRows(dsUserSelectList.getRowDataRanged(start, end));
	
}


/*
 * "<" 버튼에서 click 이벤트 발생 시 호출.
 */
function onUSSEL_btnRemoveClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var uSSEL_btnRemove = e.control;
	
	var dsUserSelectList = app.lookup("UserSelectList");
	
	var udcUserSelectList = app.lookup("USSEL_udcUserSelectList");
	var checkedIndices = udcUserSelectList.getCheckedRowIndices()
	var idList = [];
	checkedIndices.forEach(function(index){
		var row = udcUserSelectList.getRow(index);		
		var userID = row.getValue("ID");
		
		selectIDMap.delete(userID);
		idList.push(userID);
	});
		
	idList.forEach(function(userID){						
		var delRow = dsUserSelectList.findFirstRow("ID == "+userID)
		dsUserSelectList.realDeleteRow(delRow.getIndex());
	});
	
	//udcUserSelectList.setUserList(dsUserSelectList);
			
	var selectTotal = dsUserSelectList.getRowCount();
	var udcUserSelectList = app.lookup("USSEL_udcUserSelectList");
	udcUserSelectList.setTotalCount(selectTotal);
		
	udcUserSelectList.setPaging(selectTotal, pageRowCount, 5);
	var readCount = (pageRowCount-1>selectTotal)?selectTotal-1:pageRowCount-1;	
	
	var pageidx = udcUserSelectList.getCurrentPageIndex();
	var start = (pageidx-1)*pageRowCount;
	var end = pageidx*pageRowCount-1;
	if ( end >= dsUserSelectList.getRowCount() ){
		end = dsUserSelectList.getRowCount()-1;
	}
	
	udcUserSelectList.setUserListRows(dsUserSelectList.getRowDataRanged(start, end));
	
	onRefreshUserSelectCount();
	onUpdateSrcUserListState();	
	
}

/*
 * 사용자 정의 컨트롤에서 userListDblclick 이벤트 발생 시 호출.
 */
function onUSSEL_udcUserSelectListUserListDblclick(/* cpr.events.CGridEvent */ e){
	/** 
	 * @type udc.grid.userList
	 */
	var uSSEL_udcUserSelectList = e.control;
	
	var dsUserSelectList = app.lookup("UserSelectList");
	
	var udcUserSelectList = app.lookup("USSEL_udcUserSelectList");
	
	var rowData = e.row.getRowData();				
	var userID = rowData["ID"];
		
	selectIDMap.delete(userID);
							
	var delRow = dsUserSelectList.findFirstRow("ID == "+userID)
	dsUserSelectList.realDeleteRow(delRow.getIndex());
	
	udcUserSelectList.setUserList(dsUserSelectList);
			
	var selectTotal = dsUserSelectList.getRowCount();
	var udcUserSelectList = app.lookup("USSEL_udcUserSelectList");
	udcUserSelectList.setTotalCount(selectTotal);
		
	udcUserSelectList.setPaging(selectTotal, pageRowCount, 5);
	var readCount = (pageRowCount-1>selectTotal)?selectTotal-1:pageRowCount-1;	
	
	var pageidx = udcUserSelectList.getCurrentPageIndex();
	var start = (pageidx-1)*pageRowCount;
	var end = pageidx*pageRowCount-1;
	if ( end >= dsUserSelectList.getRowCount() ){
		end = dsUserSelectList.getRowCount()-1;
	}
	
	udcUserSelectList.setUserListRows(dsUserSelectList.getRowDataRanged(start, end));
	
	onRefreshUserSelectCount();
	onUpdateSrcUserListState();	
	
}

var userSelectOffset;
/*
 * ">>" 버튼에서 click 이벤트 발생 시 호출. 
 */
function onUSSEL_btnAddAllClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var uSSEL_btnAddAll = e.control;
	userSelectOffset = 0;
		
	var udcUserListGroup = app.lookup("USSEL_udcUserTerminal");	
	var totalCount = udcUserListGroup.getTotalCount();
	
	comLib.showLoadMask("pro","사용자 선택","",totalCount/numberPerReq);
	
	sendUserListRequestAll();
}

/*
 * "<<" 버튼에서 click 이벤트 발생 시 호출. 
 */
function onUSSEL_btnRemoveAllClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var uSSEL_btnRemoveAll = e.control;
	selectIDMap.forEach(function(value,key){	
      selectIDMap.delete(key);
	});
	
	var dsUserSelectList = app.lookup("UserSelectList");
	dsUserSelectList.clear();
		
	var udcUserSelectList = app.lookup("USSEL_udcUserSelectList");
	udcUserSelectList.clearUserList();
	
	onRefreshUserSelectCount();	
	onUpdateSrcUserListState();	
}

function onRefreshUserSelectCount()	{
	var dsUserSelectList = app.lookup("UserSelectList");
	var totalCount = dsUserSelectList.getRowCount();
	app.lookup("USSEL_optUserSelectTotal").value = totalCount+" Users";
	
}

function sendUserListRequestAll() {
	var udcUserList = app.lookup("USSEL_udcUserTerminal");	
	var group = udcUserList.getSelectedGroup();

	//var smsGetUserList = app.lookup("sms_getUserListAll"); 서브미션 재사용시 오류 발생. eXBuilder 버그
	var smsGetUserList = new cpr.protocols.Submission("sms_getUserListAll");
	smsGetUserList.method = "GET";
	smsGetUserList.mediaType = "application/x-www-form-urlencoded";
	smsGetUserList.action = "/v1/users";
		
	smsGetUserList.addResponseData(app.lookup("Result"));
	smsGetUserList.addResponseData(app.lookup("Total"));
	smsGetUserList.addResponseData(app.lookup("UserList"));
		
	smsGetUserList.addEventListenerOnce("submit-done", onSmsgetUserListAllSubmitDone);
	smsGetUserList.addEventListenerOnce("submit-error", onSmsgetUserListAllSubmitError);
	smsGetUserList.addEventListenerOnce("submit-timeout", onSmsgetUserListAllSubmitTimeout);
	
	// 검색 조건 세팅	
	smsGetUserList.setParameters("searchKeyword", udcUserList.searchKeyword);
	if (udcUserList.searchKeyword != undefined && udcUserList.searchKeyword.length > 0) {
		smsGetUserList.setParameters("searchCategory", udcUserList.searchCategory);
	} else {
		smsGetUserList.setParameters("searchCategory", "");
	}
	if (group != undefined && group.value != "") {
		smsGetUserList.setParameters("groupID", parseInt(group.value, 10));
	} else {
		smsGetUserList.setParameters("groupID", 0);
	}
	smsGetUserList.setParameters("subInclude", "true");
	smsGetUserList.setParameters("excludeGroup", _excludeGroup);

	// 페이징 계산하여 요청
	smsGetUserList.setParameters("offset", userSelectOffset);
	smsGetUserList.setParameters("limit", numberPerReq);
	
	//console.log("send req : offset "+userSelectOffset)
	
	userSelectOffset += numberPerReq;
	
	var fields = ["user_id","name"];
	smsGetUserList.setParameters("fields", fields);	
	smsGetUserList.send();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsgetUserListAllSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */	 
	var smsgetUserListAll = e.control;	
	
	var dmTotal = app.lookup("Total");
	var totalCount = parseInt(dmTotal.getValue("Count"));
	
	var dsUserSelectList = app.lookup("UserSelectList");
	var dsUserList = app.lookup("UserList");
	
	var recvCount = dsUserList.getRowCount();
	for( var i=0; i < recvCount; i++ ){
		var row = dsUserList.getRow(i);
		var userID = row.getValue("ID");
		
		if( selectIDMap.get(userID) == undefined ){				
			dsUserSelectList.addRowData(row.getRowData());
			selectIDMap.set(userID,1);
		}
	}
	
	if( userSelectOffset < totalCount ){
		//console.log("done : offset "+userSelectOffset);
		
		var msg = "사용자 목록 가져오기 "+userSelectOffset+"/"+totalCount;
		comLib.updateLoadMask(msg);
	
		sendUserListRequestAll();
	} else {
		//console.log("done : finalize ");
		comLib.hideLoadMask();
				
		dsUserSelectList.setSort("ID");
		var selectTotal = dsUserSelectList.getRowCount();
		
		var udcUserSelectList = app.lookup("USSEL_udcUserSelectList");
		udcUserSelectList.setTotalCount(selectTotal);
		udcUserSelectList.setCurrentPageIndex(1);
		udcUserSelectList.setPaging(selectTotal, pageRowCount, 5);
		
		var end = pageRowCount-1;
		if ( end >= dsUserSelectList.getRowCount() ){
			end = dsUserSelectList.getRowCount()-1;
		}
		
		udcUserSelectList.setUserListRows(dsUserSelectList.getRowDataRanged(0, end));		
		
		onRefreshUserSelectCount();
		
		onUpdateSrcUserListState();
	}
}

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSmsgetUserListAllSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsgetUserListAll = e.control;
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsgetUserListAllSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsgetUserListAll = e.control;
	comLib.hideLoadMask();	
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSmsgetUserListAllSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsgetUserListAll = e.control;
	comLib.hideLoadMask();
}


/*
 * 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
 */
function onUSSEL_udcUserSelectListPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.grid.userList
	 */
	var uSSEL_udcUserSelectList = e.control;
	
	var pageidx = uSSEL_udcUserSelectList.getCurrentPageIndex();
	
	var dsUserSelectList = app.lookup("UserSelectList");
	var udcUserSelectList = app.lookup("USSEL_udcUserSelectList");
	
	var start = (pageidx-1)*pageRowCount;
	var end = pageidx*pageRowCount-1;
	if ( end >= dsUserSelectList.getRowCount() ){
		end = dsUserSelectList.getRowCount()-1;
	}
		
	udcUserSelectList.setUserListRows(dsUserSelectList.getRowDataRanged(start, end));
}

/*
 * "적용" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSSEL_btnApplyClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var uSSEL_btnApply = e.control;	
	app.close(selectIDMap);
}

function onUpdateSrcUserListState(){

	var udcUserListGroup = app.lookup("USSEL_udcUserTerminal");	
	udcUserListGroup.refreshUserList(selectIDMap);
}

/*
 * 사용자 정의 컨트롤에서 userListUpdate 이벤트 발생 시 호출.
 */
function onUSSEL_udcUserTerminalUserListUpdate(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.grid.gridUserTerminal
	 */
	var uSSEL_udcUserTerminal = e.control;
	onUpdateSrcUserListState();	
}
