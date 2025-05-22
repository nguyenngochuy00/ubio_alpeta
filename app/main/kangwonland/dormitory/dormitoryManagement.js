/************************************************
 * dormitoryManagement.js
 * Created at 2021. 1. 25. 오전 9:49:36.
 *
 * @author joymrk
 ************************************************/
var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");

var KWLDM_pageRowCount = 50;
var KWLDM_version;

function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("userListPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}
function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("userListPageIndexer");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = KWLDM_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	
	var accessGroupList = dataManager.getAccessGroup();
	if( accessGroupList && accessGroupList.getRowCount()>0){
		var cmbAccessGroup = app.lookup("KWLDM_cmbAccessGroup");
		var count = accessGroupList.getRowCount();
		for ( var i = 0; i < count; i++ ){			
			var accessGroupInfo = accessGroupList.getRow(i);						
			cmbAccessGroup.addItem(new cpr.controls.Item(accessGroupInfo.getValue("Name"),accessGroupInfo.getValue("ID")));
		}
	}
	setPageIndexer(0,1,KWLDM_pageRowCount,10);
	// 사용자 리스트 검색	
	
	KWLDM_version = dataManager.getSystemVersion();
	sendUserListRequest();
}

function sendUserListRequest() {
	app.lookup("UserList").clear();
	comLib.showLoadMask("",dataManager.getString("Str_UserListGet"),"",0);

	var pageIndexer = app.lookup("userListPageIndexer");
	var curIndex = pageIndexer.currentPageIndex;
	var offset = (curIndex - 1) * KWLDM_pageRowCount;
	
	var category = app.lookup("KWLDM_cmbCategory").value;
	var keyword = app.lookup("KWLDM_ipbKeyword").value;
	
	var smsGetUserList = app.lookup("sms_getUserList");
	
	smsGetUserList.setParameters("searchCategory", category);
	smsGetUserList.setParameters("searchKeyword", keyword);
	if (keyword != null && keyword.length > 0) {
		if (category == "id") {
			var intID = parseInt(keyword, 10);
			smsGetUserList.setParameters("searchKeyword", String(intID));	
		} else {
			smsGetUserList.setParameters("searchCategory", category);	
		}		
	} else {
		smsGetUserList.setParameters("searchCategory", "");
	}
	smsGetUserList.setParameters("groupID", 0);
	smsGetUserList.setParameters("subInclude", "true");

	// 페이징 계산하여 요청
	smsGetUserList.setParameters("offset", offset);
	smsGetUserList.setParameters("limit", KWLDM_pageRowCount);
	
	smsGetUserList.send();
}

function onSms_getUserListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		var totalCount = app.lookup("Total").getValue("Count");
		var viewPageCount = totalCount / KWLDM_pageRowCount + (totalCount % KWLDM_pageRowCount > 0);
		app.lookup("KWLDM_lbTotal").value = totalCount;
		selectPaging(totalCount, viewPageCount);
		
		//출입구역 리스트 가지고오기
		sendAccessAreaListRequest();
	} else {
		dialogAlert(app, "Waning", "기숙사 관리"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
	app.lookup("KWLDM_grdUserList").redraw();
}

function onSms_getUserListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getUserListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function sendAccessAreaListRequest() {
	comLib.showLoadMask("","출입구역 리스트","");
	
	//dormitoryType 무조건 0으로 줘서 타입을 지정해준다. 0 <- 전체 1 <- 기숙사 구역만
	var smsGetAccessAreas = app.lookup("sms_getAccessArea");
	smsGetAccessAreas.action = "/v1/kangwonland/dormitory/accessarea";
	smsGetAccessAreas.setParameters("AreaType", 0);
	smsGetAccessAreas.send();	
}

function onSms_getAccessAreaSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
	} else {
		dialogAlert(app, "Waning", "기숙사 출입구역 정보"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_getAccessAreaSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getAccessAreaSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


function onKWLDM_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	//pageIndex 초기 화
	var pageIndex = app.lookup("userListPageIndexer");	
	pageIndex.currentPageIndex = 1;
	sendUserListRequest();
}

function onKWLDM_grdUserListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var kWLDM_grdUserList = e.control;
	sendAccessGroupAreaList();
	
}


function sendAccessGroupAreaList() {
	app.lookup("AccessGroup").clear();
	app.lookup("AccessAreaList").clear();
	var row = app.lookup("KWLDM_grdUserList").getSelectedRow();
	if (row) {
		var requestData = app.lookup("sms_getAccessGroupAreaList");
		requestData.action = '/v1/accessGroups/' + row.getValue("AccessGroupCode");
		console.log(requestData.action);
		requestData.method = 'GET';
		requestData.send();
		comLib.showLoadMask("", dataManager.getString("Str_ListLoading"), "");	
	}
}

function onSms_getAccessGroupAreaListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
		var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		app.lookup("KWLDM_grdAccessAreaList").redraw();
	} else {
		dialogAlert(app, "Waning", "출입구역 정보 가져오기"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
	app.lookup("KWLDM_grdUserList").redraw();
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getAccessGroupAreaListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getAccessGroupAreaListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * "구역 추가" 버튼(KWLDM_btnAddAccessArea)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onKWLDM_btnAddAccessAreaClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var kWLDM_btnAddAccessArea = e.control;
	var row = app.lookup("KWLDM_grdUserList").getSelectedRow();
	//출입구역이 추가됨
	// 기숙사용 출입구역 별도 체크 항목 추가
	// 해당 리스트만 표시되도록 해야함
	var appld = "app/main/kangwonland/dormitory/addDormitoryAccessArea" + "?" + KWLDM_version;
	app.getRootAppInstance().openDialog(appld, {width : 470, height : 520}, function(dialog){
		dialog.ready(function(dialogApp){
			//dialog.bind("headerTitle").toLanguage("Str_PassList");
			dialog.headerTitle ="기숙사 출입구역 추가";
			dialog.modal = true;
		});
	}).then(function(returnValue){
		if (returnValue != undefined) {
			//console.log(returnValue);
			var accessAreaIDList = app.lookup("AccessAreaIDList");
			accessAreaIDList.clear();
			accessAreaIDList.build(returnValue);
			//accessAreaIDList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
			console.log(accessAreaIDList.getRowDataRanged());
			//1. 사용자 아이디, 출입그룹 아이디, 출입구역 아이디 리스트
			var userInfo = app.lookup("UserInfo");
			userInfo.clear();
			userInfo.setValue("ID", row.getValue("ID"));
			userInfo.setValue("AccessGroupCode", row.getValue("AccessGroupCode"));
			userInfo.setValue("UpdateFlag", 1); // 0 : 미동작 1: ㅇ추가 2: 삭제
			var reqSend = app.lookup("sms_putUserAccessAreaList");
			reqSend.action = "/v1/kangwonland/dormitory/users/"+row.getValue("ID");
			reqSend.send();
		}
	});	
}


/*
 * "출입구역 설정" 버튼(KWLDM_btnSetAccessArea)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onKWLDM_btnSetAccessAreaClick(/* cpr.events.CMouseEvent */ e){
	var appld = "app/main/kangwonland/dormitory/setDormitoryAccessArea" + "?" + KWLDM_version;
	app.getRootAppInstance().openDialog(appld, {width : 470, height : 520}, function(dialog){
		dialog.ready(function(dialogApp){
			//dialog.bind("headerTitle").toLanguage("Str_PassList");
			dialog.headerTitle ="기숙사 출입구역 설정";
			dialog.modal = true;
		});
	}).then(function(returnValue){
		if (returnValue != undefined) {
			console.log(returnValue);
		}
	});	
}


/*
 * "구역 제외" 버튼(KWLDM_btnDelAccessArea)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onKWLDM_btnDelAccessAreaClick(/* cpr.events.CMouseEvent */ e){
	//체크확인
	var grdAccessAreaList = app.lookup("KWLDM_grdAccessAreaList");
	var indices = grdAccessAreaList.getCheckRowIndices();
	if (indices.length == 0) {
		dialogAlert(app, "Waning", "체크된 삭제 대상 출입구역이 없습니다.");
		return;
	}
	
	
	
	var accessAreaIDList = app.lookup("AccessAreaIDList");//출입구역 id 리스트 넘겨주기
	accessAreaIDList.clear();
	var breakFlag;
	breakFlag = 0; 
	indices.forEach(function(idx){
	
		var row = grdAccessAreaList.getRow(idx);
		var searchData = app.lookup("KwlAccessAreaList").findFirstRow("ID ==" + row.getValue("ID"));
		if(searchData) {
			var areaType = searchData.getValue("AreaType");
			if (areaType == 0) { //기숙사 단말기 설정이 아닙니다.
				var strMsg;
				strMsg = searchData.getValue("Name") + " : 기숙사 타입 단말기가 아닙니다.";
				dialogAlert(app, "Waning", strMsg);
				breakFlag = 1;
				return;
			}	
		}
		
		var rowData = {"ID": row.getValue("ID")}; 
		accessAreaIDList.addRowData(rowData);
	});
	
	if (breakFlag == 1) {
		return;
	}
	// 사용자 아이디, 출입그룹 아이디, 출입구역 아이디 리스트 
	var userInfo = app.lookup("UserInfo");
	var row = app.lookup("KWLDM_grdUserList").getSelectedRow();
	userInfo.clear();
	userInfo.setValue("ID", row.getValue("ID"));
	userInfo.setValue("AccessGroupCode", row.getValue("AccessGroupCode"));
	userInfo.setValue("UpdateFlag", 2); // 0 : 미동작 1: ㅇ추가 2: 삭제
	var reqSend = app.lookup("sms_putUserAccessAreaList");
	reqSend.action = "/v1/kangwonland/dormitory/users/"+row.getValue("ID");
	reqSend.send();	
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_putUserAccessAreaListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
	//	sendAccessGroupAreaList();
		app.lookup("KWLDM_grdUserList").clearSelection();
		sendUserListRequest();// 사용자 다시 검색
	} else {
		dialogAlert(app, "Waning", "기숙사 관리"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
	app.lookup("KWLDM_grdUserList").redraw();
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_putUserAccessAreaListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_putUserAccessAreaListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onUserListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var userListPageIndexer = e.control;
	sendUserListRequest();
}
