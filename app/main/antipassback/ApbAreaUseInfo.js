/************************************************
 * ApbAreaUsingInfo.js
 * Created at 2021. 8. 9. 오전 9:10:28.
 *
 * @author zxc
 ************************************************/
var locale = "";
var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var dataManager = getDataManager();
var usint_version;

var USMGR_pageRowCount = 17;
var USEXP_exportCount = 100; // 사용자 내보내기시 한번에 요청 할 사용자 수


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad( /* cpr.events.CEvent */ e) {
	comLib = createComUtil(app);
	comLib.showLoadMask("", dataManager.getString("Str_Load"), "", 1);
	dataManager = getDataManager();
	
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "list");	
	
	app.lookup("Apb_optAreaName").value = "";
	app.lookup("apb_udcSearchAreaUserList").removeItem("card");
	app.lookup("apb_udcSearchAreaUserList").removeItem("groupName");
	app.lookup("apb_udcSearchAreaUserList").removeItem("accessGroupName");
	var smsGetAreas = app.lookup("sms_getAreas");
	smsGetAreas.send();
}

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms_getAreasSubmitSuccess( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getAreas = e.control;
	var areaList = app.lookup("AreaList");
	if (areaList.getRowCount() > 0) {
		// 안티패스백 구역별 사용자 얻는 서브미션
		var smsGetAreasUse = app.lookup("sms_getAreasUse");
		smsGetAreasUse.action = "/v1/antiPassback/areas/-1/userCount"; // -1 일 시 전체조회
		smsGetAreasUse.send();
	} else {
		app.lookup("Apb_grdNoData").visible = true;
	}
}

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms_getAreasUseSubmitSuccess( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getAreasUse = e.control;
	
	var areaUseCntList = app.lookup("AreaUserCountList");
	
	if (areaUseCntList.getRowCount() > 0) {
		var AreaIDArr = areaUseCntList.getColumnData("AreaID");
		var groupUseArea = app.lookup("group_useAreaList");
		
		if(groupUseArea.getChildrenCount() > 0){
			groupUseArea.removeAllChildren();
		}
		
		// 규역 요약 현황 배치 정보
		var width = 120;
		var height = 62;
		var widthPadding = 40;
		var firstWidthPadding = 15;
		var firstHeightPadding = 20;
		var heightPadding = 30;
		var maxCol = 5; // x축 갯수 설정
		var colCnt = 0; // x축 카운트
		var rowCnt = 0; // y축 카운트
		
		AreaIDArr.forEach(function(AreaID, index) {
			var Name = areaUseCntList.findFirstRow('AreaID==' + AreaID).getValue("Name")
			var AreaUseCnt = areaUseCntList.findFirstRow('AreaID==' + AreaID).getValue("AreaUserCount");
			var areaUseGrd = createUseAreaGrd(AreaID, Name);
			
			areaUseGrd.insertRowData(0, true);
			areaUseGrd.detail.getControl(0).bind("value").toDataSet(areaUseCntList, "AreaUserCount", index);
			
			var x = colCnt == 0 ? firstWidthPadding : colCnt * (width + widthPadding) + firstWidthPadding;
			var y = rowCnt == 0 ? firstHeightPadding : rowCnt * (height + heightPadding) + firstHeightPadding;
			
			app.lookup("group_useAreaList").addChild(areaUseGrd, {
				top: y + "px",
				left: x + "px",
				width: width + "px",
				height: height + "px"
			});
			
			areaUseGrd.setRowState(0, cpr.data.tabledata.RowState.UNCHANGED);
			
			colCnt++;
			
			if (colCnt == maxCol) {
				colCnt = 0;
				rowCnt++;
			}
		});
	}
	comLib.hideLoadMask();
}

function createUseAreaGrd(AreaID, Name, AreaUseCnt) {
	var grd = new cpr.controls.Grid(AreaID);
	var tapFolder = app.lookup("APB_tfdAreaUseInfo");
	grd.init({
		"columns": [{
			"width": "100px"
		}],
		"header": {
			"rows": [{
				"height": "30px"
			}],
			"cells": [{
				constraint: {
					rowIndex: 0,
					colIndex: 0,
					rowSpan: 1,
					colSpan: 1
				},
				configurator: function(cell) {
					cell.text = Name;
					cell.visible = true;
					cell.style.css("cursor", "pointer");
				}
			}]
		},
		"detail": {
			"rows": [{
				"height": "30px"
			}],
			"cells": [{
				constraint: {
					rowIndex: 0,
					colIndex: 0,
					rowSpan: 1,
					colSpan: 1
				},
				configurator: function(cell) {
					cell.control = new cpr.controls.Output("APB_useCnt");
					cell.control.style.css("text-align", "center");
					cell.control.style.css("cursor", "pointer");
				}
			}]
		}
	});
	
	grd.selectionMulti = "none";
	grd.style.row.css("background-color", "#FFFFFF");
	
	grd.addEventListener("dblclick", function(e) {
		
		var Apb_grdDetailAreas = app.lookup("Apb_grdDetailAreas");
		var areaRow = Apb_grdDetailAreas.findFirstRow('AreaID==' + e.control.id);
		var areaRowIndex;
		if (areaRow) {
			areaRowIndex = areaRow.getIndex();
			tapFolder.setSelectedTabItem(tapFolder.getTabItemByID(2));
			
			var allTotalCount = app.lookup("AreaUserCountList").findFirstRow('AreaID=='+e.control.id).getValue("AreaUserCount");
			var totalLabel = app.lookup("APB_optTot");
			totalLabel.value = allTotalCount;
//			Apb_grdDetailAreas.selectRows(areaRowIndex);
			Apb_grdDetailAreas.select({
				rowIndex: areaRowIndex
			});
		}
	});
	
	grd.addEventListener("mousemove", function(e) {
		grd.style.row.css("background-color", "#E3E0DF");
	});
	
	grd.addEventListener("mouseleave", function(e) {
		grd.style.row.css("background-color", "#FFFFFF");
	});
	return grd;
}

/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onApb_grdDetailAreasSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type cpr.controls.Grid
	 */
	var apb_grdDetailAreas = e.control;
	
	if(apb_grdDetailAreas.getSelectedRow()){
		var selectRow = apb_grdDetailAreas.getSelectedRow();
		var areaName = selectRow.getValue("Name");
	
		app.lookup("Apb_optAreaName").value = areaName;
		app.lookup("APB_udcAreaUserList").setCurrentPageIndex(1);
		app.lookup("apb_udcSearchAreaUserList").resetValue();
		
		var dm_ExportParam = app.lookup("dm_ExportParam");
		dm_ExportParam.setValue("mode", "list");		
		sendUserListRequest();
	}
}
// 서버에 사용자 리스트 요청
function sendUserListRequest() {
	
	var udcUserList = app.lookup("APB_udcAreaUserList");
	var curIndex = udcUserList.getCurrentPageIndex();
	var offset = (curIndex - 1) * USMGR_pageRowCount
	
	var searchCtrl = app.lookup("apb_udcSearchAreaUserList")
	var smsGetUserList = new cpr.protocols.Submission("sms_getUserList");
//	smsGetUserList.action = "/v1/users";
	smsGetUserList.action = "/v1/users/antipassbackAreaUser";
	smsGetUserList.method = "get";
	smsGetUserList.mediaType = "application/x-www-form-urlencoded";
	
	smsGetUserList.addEventListenerOnce("submit-done", onSms_getUserListSubmitDone);
	smsGetUserList.addEventListenerOnce("submit-error", onSms_getUserListSubmitError);
	smsGetUserList.addEventListenerOnce("submit-timeout", onSms_getUserListSubmitTimeout);
	
	var areaList = app.lookup("Apb_grdDetailAreas");
	var area = areaList.getSelectedRow().getValue("AreaID");
	
//	if (areaList.getSelectedRow()){
//		var area = areaList.getSelectedRow().getValue("AreaID");
//	} else {
//		var area = parseInt(app.lookup("Apb_optAreaName").value, 10)  ;
//	}

	// 검색 조건 세팅
	smsGetUserList.setParameters("searchCategory", searchCtrl.searchCategory);
	smsGetUserList.setParameters("searchKeyword", searchCtrl.searchKeyword);
	smsGetUserList.setParameters("AntipassBackZone", area);
	
	if (searchCtrl.searchKeyword != undefined && searchCtrl.searchKeyword.length > 0) {
		if (searchCtrl.searchCategory == "id" ) {
			var intID = parseInt(searchCtrl.searchKeyword, 10);
			smsGetUserList.setParameters("searchKeyword", String(intID));
		} else if (searchCtrl.searchCategory == "name" || searchCtrl.searchCategory == "uniqueID") {
			if(searchCtrl.searchKeyword.length == 1){
				dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_InvalidSearchLength"));
				return;
			}
			var intID = parseInt(searchCtrl.searchKeyword, 10);
			smsGetUserList.setParameters("searchKeyword", searchCtrl.searchKeyword);	
		} else {
			smsGetUserList.setParameters("searchCategory", searchCtrl.searchCategory);	
		}		
	} else {
		smsGetUserList.setParameters("searchCategory", "");
	}
	
	smsGetUserList.setParameters("subInclude", "true");
	
	// 페이징 계산하여 요청
//	smsGetUserList.setParameters("offset", offset);
//	smsGetUserList.setParameters("limit", USMGR_pageRowCount);
	
	var dm_ExportParam = app.lookup("dm_ExportParam");
	if (dm_ExportParam.getValue("mode") == "list"){
		// 리스트 불러올떄
		var udcUserList = app.lookup("APB_udcAreaUserList");
		var curIndex = udcUserList.getCurrentPageIndex();
		var offset = (curIndex - 1) * USMGR_pageRowCount;
		smsGetUserList.setParameters("offset", offset);
		smsGetUserList.setParameters("limit", USMGR_pageRowCount);
	} else {
		smsGetUserList.setParameters("offset", dm_ExportParam.getValue("offset"));
		smsGetUserList.setParameters("limit", USEXP_exportCount);	
	}
	
	//2019-11-29 새로 추가한 소스
	//var dm_ExportParam = app.lookup("dm_ExportParam")	
	//	if( dm_ExportParam.getValue("mode")=="export"){
	//		smsGetUserList.setParameters("offset", dm_ExportParam.getValue("offset"));
	//		smsGetUserList.setParameters("limit", ALEMP_recvRowPerExport);
	//	}
	//2019-11-29 추가 끝
	
	smsGetUserList.addResponseData(app.lookup("Result"), false, "Result");
	smsGetUserList.addResponseData(app.lookup("Total"), false, "Total");
	smsGetUserList.addResponseData(app.lookup("UserList"), false, "UserList");
	
	//comLib.showLoadMask("", dataManager.getString("Str_UserListGet"), "", 0);
	if(dm_ExportParam.getValue("mode")=="list"){
		comLib.showLoadMask("", dataManager.getString("Str_UserListGet"), "", 0);
	}
	
	smsGetUserList.send();
}

// 사용자 리스트 가져오기 완료
function onSms_getUserListSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	
	//comLib.hideLoadMask();	// 모드가 list일떄 없애도록 위치 옮겨야함
	
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		
		var sms_getUserList = e.control;
		var dsUserList = app.lookup("UserList");
		
		var detailAreas = app.lookup("Apb_grdDetailAreas");	
//		if (detailAreas.getSelectedRow()){
//			var selectedAreaID = app.lookup("Apb_grdDetailAreas").getSelectedRow().getValue("AreaID");
//		} else {
//			var selectedAreaID = app.lookup("Apb_optAreaName").value;
//		}
		var selectedAreaID = app.lookup("Apb_grdDetailAreas").getSelectedRow().getValue("AreaID");
		
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));

		// 구역 전체 토탈수 추후 수정
//		var allTotalCount = app.lookup("AreaUserCountList").findFirstRow('AreaID=='+selectedAreaID).getValue("AreaUserCount");
		
		var recvCount = dsUserList.getRowCount();
		for (var i = 0; i < recvCount; i++) {
			var userInfo = dsUserList.getRow(i);
			// 필수 / 선택 인증 정보 파싱
			var AuthType = userInfo.getValue("AuthInfo").split(',');
			
			var setCount = 0;
			var andAuth = "";
			for (var idx = 0; idx < AuthType[7]; idx++) {
				if (AuthType[idx] != "0") {
					andAuth += getAuthTypeString(parseInt(AuthType[idx], 10)) + " ";
					setCount++;
				}
			}
			var orAuth = "";
			for (var idx = AuthType[7]; idx < AuthType.length - 1; idx++) {
				if (AuthType[idx] != "0") {
					orAuth += getAuthTypeString(parseInt(AuthType[idx], 10)) + " ";
					setCount++;
				}
			}
			
			if (setCount > 1) {
				userInfo.setValue("AuthInfo", andAuth + "/ " + orAuth);
			} else {
				userInfo.setValue("AuthInfo", andAuth + orAuth);
			}
		}
		
		var eventTimeArr = dsUserList.getColumnData("EventTime");
		
		eventTimeArr.forEach(function(each, index){
			if(each=="0001-01-01 00:00:00"){
				dsUserList.setValue(index, "EventTime", "");
			}
		});
		
		//2019-11-29 신규 추가
		//2021-09-03 수정
		var dm_ExportParam = app.lookup("dm_ExportParam");
		if( dm_ExportParam.getValue("mode")=="export"){
			var exportUserList = app.lookup("ExportUserList");
			//if(dsAuthLogList.getRowCount() == 0 ){
			if( dsUserList.getRowCount() > 0 ){
//				dsUserList.copyToDataSet(exportUserList);
				for(var i = 0; i < dsUserList.getRowCount(); i++){
					exportUserList.addRowData(dsUserList.getRowData(i));
				}
				if( exportUserList.getRowCount() >= dm_ExportParam.getValue("total") || exportUserList.getRowCount() >= totalCount){
					comLib.hideLoadMask();
					exportExcel();
					comLib.hideLoadMask();
					exportUserList.clear();
					dm_ExportParam.setValue("mode", "list");
					sendUserListRequest();
				} else {
					var offset = dm_ExportParam.getValue("offset")
					offset += 100
					dm_ExportParam.setValue("offset",offset)
					comLib.updateLoadMask(offset);
					sendUserListRequest();
				}
			} else {
				dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
			}
			//}

		}
		//2019-11-29 신규 끝
		
		var totalLabel = app.lookup("APB_optTot");
		totalLabel.value = totalCount;
//		totalLabel.value = allTotalCount;
		
		var viewPageCount = totalCount / USMGR_pageRowCount + (totalCount % USMGR_pageRowCount > 0);
		if (viewPageCount > 10) {
			viewPageCount = 10;
		}
		
		var udcUserList = app.lookup("APB_udcAreaUserList");
		
		udcUserList.setUserList(dsUserList);
		udcUserList.setPaging(totalCount, USMGR_pageRowCount, viewPageCount);
		udcUserList.redraw();
		
		comLib.hideLoadMask();
	} else {
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserListGet") + " " + dataManager.getString("Str_Failed") + "." + dataManager.getString(getErrorString(resultCode)));
	}
	
}

// 사용자 리스트 가져오기 submit-error 이벤트 발생 시 호출.
function onSms_getUserListSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_ERROR);
}

// 사용자 리스트 가져오기 submit-timeout 이벤트 발생 시 호출.
function onSms_getUserListSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT)
}
// -------------------------요약 검색-------------------------------

///*
// * 사용자 정의 컨트롤에서 search 이벤트 발생 시 호출.
// */
//function onApb_udcSearchAreaSearch( /* cpr.events.CUIEvent */ e) {
//	/** 
//	 * @type udc.search.searchArea
//	 */
//	var apb_udcSearchArea = e.control;
//	sendAreaListRequest();
//}
//
//function sendAreaListRequest() {
//	var searchCtrl = app.lookup("apb_udcSearchArea");
//	var smsGetAreaList = new cpr.protocols.Submission("sms_getAreas");
//	
//	smsGetAreaList.action = "/v1/antiPassback/areas";
//	smsGetAreaList.method = "get";
//	smsGetAreaList.mediaType = "application/x-www-form-urlencoded";
//	
//	//	smsGetAreaList.addEventListenerOnce("submit-done", );
//	//	smsGetAreaList.addEventListenerOnce("submit-error", );
//	//	smsGetAreaList.addEventListenerOnce("submit-timeout", );
//	
//	smsGetAreaList.setParameters("searchCategory", searchCtrl.searchCategory);
//	smsGetAreaList.setParameters("searchKeyword", searchCtrl.searchKeyword);
//	
//	if (searchCtrl.searchKeyword != undefined && searchCtrl.searchKeyword.length > 0) {
//		if (searchCtrl.searchCategory == "AreaID") {
//			var intID = parseInt(searchCtrl.searchKeyword, 10);
//			smsGetAreaList.setParameters("searchKeyword", String(intID));
//		} else if (searchCtrl.searchCategory == "name") {
//			if (searchCtrl.searchKeyword.length == 1) {
//				dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_InvalidSearchLength"));
//				return;
//			}
//			var intID = parseInt(searchCtrl.searchKeyword, 10);
//			smsGetAreaList.setParameters("searchKeyword", searchCtrl.searchKeyword);
//		}
//	} else {
//		smsGetAreaList.setParameters("searchCategory", "");
//	}
//	smsGetAreaList.send();
//}

// -------------------------상세 검색-------------------------------

/*
 * 사용자 정의 컨트롤에서 search 이벤트 발생 시 호출.
 */
function onApb_udcSearchAreaUserListSearch(/* cpr.events.CUIEvent */ e){
	var udcAreaUserList = app.lookup("APB_udcAreaUserList");
	udcAreaUserList.setCurrentPageIndex(1);
	
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "list");	
	
	sendUserListRequest();
}

/*
 * 사용자 정의 컨트롤에서 searchKeydown 이벤트 발생 시 호출.
 */
function onApb_udcSearchAreaUserListSearchKeydown(/* cpr.events.CAppEvent */ e){
	if (e.keyCode == 13) {
	var udcAreaUserList = app.lookup("APB_udcAreaUserList");
	udcAreaUserList.setCurrentPageIndex(1);
	
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "list");
	
	sendUserListRequest();
	}
}

// <<---------------------- 사용자 리스트 요청 관련 -------------------------

/*
 * 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
 */
function onAPB_udcAreaUserListPagechange(/* cpr.events.CSelectionEvent */ e){
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "list");	
	sendUserListRequest();
}

/*
 * 사용자 정의 컨트롤에서 userListDblclick 이벤트 발생 시 호출.
 */
function onAPB_udcAreaUserListUserListDblclick(/* cpr.events.CGridEvent */ e){
	if(e.row.getStateString()=="D"||e.row.getStateString()=="ID"){
		return;
	}
	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: { "Target":DLG_USER_INFO, "ID": e.row.getValue("ID"), "Mode": "Modify", }
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

// 탭 폴더 누를 때 새로 고침
/*
 * 탭 폴더에서 selection-change 이벤트 발생 시 호출.
 * Tab Item을 선택한 후에 발생하는 이벤트.
 */
function onAPB_tfdAreaUseInfoSelectionChange(/* cpr.events.CSelectionEvent */ e){
	if(e.newSelection.id==1){
		var smsGetAreas = app.lookup("sms_getAreas");
		comLib.showLoadMask("", dataManager.getString("Str_Load"), "", 1);
		smsGetAreas.send();
	} else {
		var totalLabel = app.lookup("Apb_optAreaName");
		if (totalLabel.value != 0) {
			var areaNameArr = app.lookup("AreaList").getColumnData("Name");
			
			areaNameArr.forEach(function(each, index){
				if (each == totalLabel.value){
					app.lookup("Apb_grdDetailAreas").select({
					rowIndex: index
					});
				}
			});
		}
	}
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "list");
}

/*
 * 버튼(APB_btnApbManagement)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAPB_btnApbManagementClick(/* cpr.events.CMouseEvent */ e){
	var selectionEvent = new cpr.events.CUIEvent("execute-menu",{
	content:{"Target":DLG_ANTIPASSBACK_MANAGEMENT}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onImageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onImageClick2(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

/*
 * 버튼(APB_btnExportUserList)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAPB_btnExportUserListClick(/* cpr.events.CMouseEvent */ e){
	var totalLabel = app.lookup("Apb_optAreaName");
	var dmTotal = app.lookup("Total");
	var totalCount = parseInt(dmTotal.getValue("Count"));
	var dm_ExportParam = app.lookup("dm_ExportParam");
	
	dm_ExportParam.setValue("mode", "export");
	dm_ExportParam.setValue("total", dmTotal.getValue("Count"));
	dm_ExportParam.setValue("offset", 0);

	if (totalLabel.value == 0) {
		dialogAlert(app, dataManager.getString("Str_UserExport"), dataManager.getString("Str_NoSelection"));	// 추출 실패 창
	} else {
		comLib.showLoadMask("pro", /*dataManager.getString("Str_UserListExport")*/ "", "", parseInt(totalLabel.value) / USEXP_exportCount);		// 로딩창 
		sendUserListRequest();
		return;
	}
}

function exportExcel(){
	dataManager = getDataManager();
	var dsUserList = app.lookup("ExportUserList");
	
	var total = dsUserList.getRowCount();
	
	for( var i = 0; i < total ; i++){
		var userInfo = dsUserList.getRow(i);
		
		
		var groupID = userInfo.getValue("GroupCode");		
		if(groupID != 0){
			var groupName = dataManager.getGroupName(groupID);		
			userInfo.setValue("GroupCode",groupName);
		}
		
		var AccessGroupCode = userInfo.getValue("AccessGroupCode");		
		if(AccessGroupCode != 0){
			var AccessGroupName = dataManager.getAccessGroupName(AccessGroupCode);		
			userInfo.setValue("AccessGroupCode",AccessGroupName);
		}
		
		var privilegeID = userInfo.getValue("Privilege");
		var privilegeName = "";
		if (privilegeID == 1) {
			privilegeName = dataManager.getString("Str_Admin");
		} else if (privilegeID == 2) {
			privilegeName = dataManager.getString("Str_NormalUser");
		} else {
			privilegeName = dataManager.getPrivilegeName(privilegeID);
		}
		userInfo.setValue("Privilege",privilegeName);
		
		var positionCode = userInfo.getValue("PositionCode");
		if(positionCode != 0){
			var positionName = dataManager.getPositionName(positionCode);
			userInfo.setValue("PositionCode",positionName);
		}
	}
	
	var locale = dataManager.getLocale();
	var InputData;
			
	var stringified = JSON.stringify(dsUserList.getRowDataRanged());

	stringified = stringified.replace(/"ID"/gi, '"'+dataManager.getString("Str_ID")+'"');
	stringified = stringified.replace(/"UniqueID"/gi, '"'+dataManager.getString("Str_UniqueID")+'"');
	stringified = stringified.replace(/"Name"/gi, '"'+dataManager.getString("Str_Name")+'"');
	stringified = stringified.replace(/"AuthInfo"/gi, '"'+dataManager.getString("Str_AuthInfo")+'"');
	stringified = stringified.replace(/"Privilege"/gi, '"'+dataManager.getString("Str_Privilege")+'"');
	stringified = stringified.replace(/"CreateDate"/gi, '"'+dataManager.getString("Str_CreateDate")+'"');
	stringified = stringified.replace(/"UsePeriodFlag"/gi, '"'+dataManager.getString("Str_UsePeriod")+'"');
	stringified = stringified.replace(/"RegistDate"/gi, '"'+dataManager.getString("Str_RegistDate")+'"');
	stringified = stringified.replace(/"ExpireDate"/gi, '"'+dataManager.getString("Str_ExpireDate")+'"');
	stringified = stringified.replace(/"Password"/gi, '"'+dataManager.getString("Str_Password")+'"');
	stringified = stringified.replace(/"Group"/gi, '"'+dataManager.getString("Str_Group")+'"');
	stringified = stringified.replace(/"AccessGroup"/gi, '"'+dataManager.getString("Str_AccessGroup")+'"');
	stringified = stringified.replace(/"TimezoneCode"/gi, '"'+dataManager.getString("Str_Timezone")+'"');
	stringified = stringified.replace(/"BlackList"/gi, '"'+dataManager.getString("Str_BlackList")+'"');
	stringified = stringified.replace(/"FPIdentify"/gi, '"'+dataManager.getString("Str_FPIdentify")+'"');
	stringified = stringified.replace(/"FaceIdentify"/gi, '"'+dataManager.getString("Str_FAIdentify")+'"');
	stringified = stringified.replace(/"APBZone"/gi, '"'+dataManager.getString("Str_APBAreaLocation")+'"');
	stringified = stringified.replace(/"PositionCode"/gi, '"'+dataManager.getString("Str_Position")+'"');
	stringified = stringified.replace(/"GroupCode"/gi, '"'+dataManager.getString("Str_GroupCode")+'"');
	stringified = stringified.replace(/"AccessGroupCode"/gi, '"'+dataManager.getString("Str_AccessGroup")+'"');
	stringified = stringified.replace(/"GroupName"/gi, '"'+dataManager.getString("Str_GroupName")+'"');
	stringified = stringified.replace(/"TerminalID"/gi, '"'+dataManager.getString("Str_TerminalID")+'"');
	stringified = stringified.replace(/"TerminalName"/gi, '"'+dataManager.getString("Str_TerminalName")+'"');
	stringified = stringified.replace(/"EventTime"/gi, '"'+dataManager.getString("Str_AuthEventTime")+'"');
	
	InputData = JSON.parse(stringified);
	
	/* original data */
	var today = dateLib.getToday();
	var filename = "AreaUserList_" + today + ".xlsx";
	var ws_name = "AreaUserList_";
	
	var wb = XLSX.utils.book_new(),
		ws = XLSX.utils.json_to_sheet(InputData);
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);
	
	XLSX.writeFile(wb, filename);
}

function getPrivilegeTypeString( value ){
	var type = "";
	switch ( value ){
		case 1: type = dataManager.getString("Str_Admin"); break;
		case 2: type = dataManager.getString("Str_NormalUser"); break;
		case 901 : type = dataManager.getString("Str_JwdOtherUnit"); break;
		case 902 : type = dataManager.getString("Str_JwdForeign"); break;
		case 903 : type = dataManager.getString("Str_JwdResident"); break;
		case 904 : type = dataManager.getString("Str_JwdAlways"); break;
		case 905 : type = dataManager.getString("Str_JwdSoldier"); break;
		case 906 : type = dataManager.getString("Str_JwdFamily"); break;
		default : return ""; break;
	}
	return type;
}

