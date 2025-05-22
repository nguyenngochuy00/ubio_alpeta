/************************************************
 * alwaysTypeUserManagement.js
 * Created at 2019. 11. 4. 오후 1:14:25.
 *
 * @author joymrk
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var JWDAT_pageRowCount = 15;

function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("alwaysTypeUserListPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}
function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("alwaysTypeUserListPageIndexer");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = JWDAT_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	//---------------------------------------------------------//그룹
	var groupList = dataManager.getGroup();	
	var cmbGroup = app.lookup("JWDAT_cmbTargetGroup");	 
		cmbGroup.setItemSet(groupList, {
			label: "Name",
			value: "GroupID",
	});
	//
	var accessgroupList = dataManager.getAccessGroup();

	var cmbAccessGroup = app.lookup("JWDAT_cmbAccessGroup");	 
		cmbAccessGroup.setItemSet(accessgroupList, {
			label: "Name",
			value: "ID",
	});
	//-- 권한
	var privilegeList = dataManager.getPrivilegeList();	

	if( privilegeList ){
		var cmbPrivilege = app.lookup("JWDAT_grdUserList_cmbPrivilege");	
		cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_Admin"), 1));
		cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_NormalUser"), 2));
		cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdOtherUnit"), Jwd_Other_Unit));
		cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdForeign"), Jwd_Foreign));
		cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdResident"), Jwd_Resident));
		cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdAlways"), Jwd_Always));
		cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdSoldier"), Jwd_Soldier));
		cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdFamily"), Jwd_Family));
		//TODO : cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_Visitor"), 10));
						
		var count = privilegeList.getRowCount();
		for ( var i = 0; i < count; i++ ){			
			var privilegeInfo = privilegeList.getRow(i);						
			cmbPrivilege.addItem(new cpr.controls.Item(privilegeInfo.getValue("Name"),privilegeInfo.getValue("PrivilegeID")));
		}
		
	}
	//--------------------------------------------------------------
	var dtStart = app.lookup("JWDAT_dtiStart");
	var dtEnd = app.lookup("JWDAT_dtiEnd");
	//
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	dtEnd.value = now.format('YYYY-MM-DD');
	//
	var calcDay = dateLib.calcToday("",-3,""); //3 달전
	var startData = dateLib.makeDateFormat(calcDay, "-")
	dtStart.value = startData;
	
	setPageIndexer(0,1,JWDAT_pageRowCount,10);
	app.lookup("JWDAT_cmbCategory").value = "name";
	sendGetAlwaysUserList();
}

function sendGetAlwaysUserList() {
	app.lookup("UserList").clear();
	comLib.showLoadMask("", dataManager.getString("Str_ListLoading"), "");
	var curPageIndex = app.lookup("alwaysTypeUserListPageIndexer").currentPageIndex; 
	var offset = (curPageIndex - 1) * JWDAT_pageRowCount;
	var category = app.lookup("JWDAT_cmbCategory").value;
	var keyword = app.lookup("JWDAT_ipbKeyword").value;
	var startAt = app.lookup("JWDAT_dtiStart").value;
	startAt = startAt + " 00:00:00";//dateLib.makeDateFormat(startAt, "-") + " 00:00:00";
	var endAt = app.lookup("JWDAT_dtiEnd").value;
	endAt = endAt  + " 23:59:59";//dateLib.makeDateFormat(endAt, "-") + " 23:59:59";
	
	var smsGetUserList = app.lookup("sms_getAlwaysTypeUserList");
	smsGetUserList.setParameters("startTime", startAt);
	smsGetUserList.setParameters("endTime", endAt);
	if (keyword == null || keyword.length == 0) {
		smsGetUserList.setParameters("searchCategory", "");
		smsGetUserList.setParameters("searchKeyword", "");
	}
	smsGetUserList.setParameters("offset", offset);
	smsGetUserList.setParameters("limit", JWDAT_pageRowCount);
	//smsGetUserList.setParameters("privilegeType", Jwd_Always);
	smsGetUserList.setParameters("authlogCount", 1);
	smsGetUserList.send();
}

/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onAlwaysTypeUserListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var visitorListPageIndexer = e.control;
	sendGetAlwaysUserList();
}

function onSms_getAlwaysTypeUserListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		var totalCount = app.lookup("Total").getValue("Count");
		var viewPageCount = totalCount / JWDAT_pageRowCount + (totalCount % JWDAT_pageRowCount > 0);
		app.lookup("JWDAT_opbTotal").value = totalCount;
	
		selectPaging(totalCount, viewPageCount);
	} else {
		//dialogAlert(app, "Waning", "상시 출입 사용자 관리"+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlert(app, "Waning", "상시 출입 사용자 관리"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
	app.lookup("JWDAT_grpMain").redraw();
}
function onSms_getAlwaysTypeUserListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}
function onSms_getAlwaysTypeUserListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * 그리드에서 row-dblclick 이벤트 발생 시 호출.
 * detail이 row를 더블클릭 한 경우 발생하는 이벤트.
 */
function onJWDAT_grdUserListRowDblclick(/* cpr.events.CGridEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var jWDAT_grdUserList = e.control;
	var dsUserRowData = app.lookup("UserList").getRowData(e.rowIndex);
	var startAt = app.lookup("JWDAT_dtiStart").value;
	startAt = startAt + " 00:00:00";
	var endAt = app.lookup("JWDAT_dtiEnd").value
	endAt = endAt  + " 23:59:59";
	//dsUserRowData["ID"] startAt endAt // 시작일자 끝일자 ID
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target":DLG_AUTHTYPE_LOG_MANAGEMENT,
			"InitVal": {
				"ID": dsUserRowData["ID"],
				"STARTAT": startAt,
				"ENDAT": endAt
			}
		}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onJWDAT_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	setPageIndexer(0,1,JWDAT_pageRowCount, 10);
	
	sendGetAlwaysUserList();
}


/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSMAG_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}


/*
 * Body에서 keydown 이벤트 발생 시 호출.
 * 사용자가 키를 누를 때 발생하는 이벤트.
 */
function onBodyKeydown(/* cpr.events.CKeyboardEvent */ e){
	if(dataManager.getOemVersion() == OEM_JAWOONDAE){
		if (e.code == 'Enter') {
			setPageIndexer(0,1,JWDAT_pageRowCount,10);
			sendGetAlwaysUserList();
		}
	}
}
