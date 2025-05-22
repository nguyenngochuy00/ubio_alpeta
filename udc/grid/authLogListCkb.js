/************************************************
 * authLogListCkb.js
 * Created at 2020. 9. 3. 오후 2:39:11.
 *
 * @author blue1
 ************************************************/


var dataManager = cpr.core.Module.require("lib/DataManager");
var oem_version;

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	var dsGroupList = dataManager.getGroup();
	
	var groupList = dataManager.getGroup();
	if( groupList && groupList.getRowCount()>0){
		var cmbGroup = app.lookup("authLogListGrid_cmb_GroupName");
		var count = groupList.getRowCount();
		for ( var i = 0; i < count; i++ ){			
			var groupInfo = groupList.getRow(i);						
			cmbGroup.addItem(new cpr.controls.Item(groupInfo.getValue("Name"),groupInfo.getValue("GroupID")));
		}
					
	}
	
	initComboAuthType();
	initComboAuthResult();
	initComboFuncType();
}

function initComboAuthType() {
	var cmbAuthType = app.lookup("cmb_AuthLogType");
	if (cmbAuthType == null) return;
	
	cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthTypeFPVerify"), 1));
	cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthTypeFPIdentify"), 2));
	cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_Password"), 3));
	cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_Card"), 4));
	cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthTypeFaceVerify"), 5));
	cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthTypeFaceIdentify"), 6));
	cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_MobileCard"), 7));
	cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_TypeIrisIdentify"), 8));
	cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_TypeIrisVerify"), 9));
	
	
	
	if (dataManager.getOemVersion() == OEM_MCP040) {
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_Inside"), 15));
	}	
	
	if (dataManager.getOemVersion() == OEM_JAWOONDAE) {
		cmbAuthType.addItem(new cpr.controls.Item("PDA", 9998));
		cmbAuthType.addItem(new cpr.controls.Item("LPR", 9999));
	}
}

function initComboAuthResult() {
	var cmbAuthResult = app.lookup("cmb_AuthLogResult");
	if (cmbAuthResult == null) return;
	
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_Success"), 0));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultFail"), 1));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultAccessDenied"), 2));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeout"), 3));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeoutCapture"), 4));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeoutIdentify"), 5));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultAntiPassback"), 6));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultDuress"), 7));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultBlackList"), 8));
	
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultLprFail"), 125));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultLprUnRegist"), 126));
	
}


function initComboFuncType() {
	var cmbAuthLogFuncType = app.lookup("cmb_AuthLogFuncType");
	if (cmbAuthLogFuncType == null) return;
	
	cmbAuthLogFuncType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogFuncTypeAccess"), 0));
	cmbAuthLogFuncType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogFuncTypeTna"), 1));
	cmbAuthLogFuncType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogFuncTypeMeal"), 2));
	
	cmbAuthLogFuncType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogFuncTypeLPR"), 6));
	if (dataManager.getOemVersion() == OEM_JAWOONDAE) {
		cmbAuthLogFuncType.addItem(new cpr.controls.Item("PDA", 14)); 
		cmbAuthLogFuncType.addItem(new cpr.controls.Item("LPR", 15));
		cmbAuthLogFuncType.addItem(new cpr.controls.Item("PDA", 127)); // 127
		cmbAuthLogFuncType.addItem(new cpr.controls.Item("LPR", 128)); // 128
	}
	
	var cmbFKey = app.lookup("cmb_AuthFuncKey");
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyF1"), 1));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyF2"), 2));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyAccess"), 3));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyF3"), 4));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyF4"), 5));
	
	//functype == 1 : 근태
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyAttend"), 11));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyLeave"), 12));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyAccess"), 13));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyOut"), 14));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyIn"), 15));
	
	//functype == 2 : 식수
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyMenu1"), 21));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyMenu2"), 22));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyMenu5"), 23));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyMenu3"), 24));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyMenu4"), 25));
	
	//functype == 6 : LPR
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyAccess"), 63));
	
	for( var i = 101; i < 161; i++ ){
		var label = "Ex " + (i-100);
		cmbFKey.addItem(new cpr.controls.Item(label, i));
	}
}
/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};
exports.getSelectedRow = function() {
	var authLogListGrid = app.lookup("authLogListGrid");
	var selectionRow = authLogListGrid.getSelectedRow();
	
	if (selectionRow.getIndex() != null) {
		return selectionRow;
	}
	
	return null;
}

exports.getCheckedRowIndices = function() {
	var authLogList = app.lookup("authLogListGrid");
	var indices = authLogList.getCheckRowIndices();
	
	var result = [];
	indices.forEach(function(idx){
		if(authLogList.getRowState(idx) != cpr.data.tabledata.RowState.DELETED ){
			result.push(idx);
		} else {
			authLogList.setCheckRowIndex(idx, false);
		}
	});
	
	return result;
}

exports.setUnCheckAll = function(idx,checked){
	var authLogList = app.lookup("authLogListGrid");
	var indices = authLogList.getCheckRowIndices();
	
	indices.forEach(function(idx){
		authLogList.setCheckRowIndex(idx, false);		
	});
} 

exports.deleteColumn = function(indices){
	if (indices==undefined || indices == null ){
		return;
	}
	var authLogList = app.lookup("authLogListGrid");
	indices.forEach(function(index){
		authLogList.deleteColumn(index);
	});	
};

exports.deleteRow = function(checkedRowIndices) {
	var authLogList = app.lookup("authLogListGrid");
	authLogList.deleteRow(checkedRowIndices);
	authLogList.clearAllCheck();
	return;
}

exports.setAuthLogList = function( /*cpr.data.DataSet*/authLogDataSet ){
			
	var authLogListSet = app.lookup("AuthLogList");
	authLogListSet.clear();	
	authLogDataSet.copyToDataSet(authLogListSet);	
	authLogListSet.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	var authLogList = app.lookup("authLogListGrid");
	authLogList.redraw();
}

// 현대건설 인증로그 SendFlag 값 설정(OEM_HYUNDAI_EC) 
exports.setAuthLogCustomHDEC = function( /*cpr.data.DataSet*/authLogCustomDataSet ){

	var authLogSet = app.lookup("AuthLogList");
	var authCount = authLogSet.getRowCount();
	var customCount = authLogCustomDataSet.getRowCount();
	
	for(var i =0; i<authCount; i++){
		var authLogInfo = authLogSet.getRow(i);
		for(var j =0; j<customCount; j++){
			var customInfo = authLogCustomDataSet.getRow(j);
			if (authLogInfo.getValue("IndexKey") == customInfo.getValue("IndexKey")) {
				authLogInfo.setValue("SendFlag", customInfo.getValue("SendFlag"));
				authLogInfo.setValue("WebSendFlag", customInfo.getValue("WebSendFlag"));
				continue;		
			}
		} 
	}
	
	var authLogList = app.lookup("authLogListGrid");
	authLogList.redraw();
}

// 체크박스 체크된 인증로그 인덱스 리턴(OEM_HYUNDAI_EC) 
exports.getAuthLogCheckRowHDEC = function(){
	var authLogList = app.lookup("authLogListGrid");
	return authLogList.getCheckRowIndices();
}


exports.setAuthLogListRows = function( /*cpr.data.RowConfigInfo[]*/authLogData ){
			
	var authLogListSet = app.lookup("AuthLogList"); 
	authLogListSet.clear();	
	authLogListSet.build(authLogData);	
	authLogListSet.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	
	var authLogList = app.lookup("authLogListGrid");	
	authLogList.redraw();	
}

exports.getAuthLogIndexKey = function( index ){
	
	var authLogList = app.lookup("authLogListGrid");
	var authLogIndexKey = authLogList.getRow(index).getString("IndexKey");
	return authLogIndexKey;
}

exports.getRowData = function( index ){
	
	var authLogList = app.lookup("authLogListGrid");
	return authLogList.getRow(index).getRowData();	
}

exports.getRow = function( index ){
	
	var authLogList = app.lookup("authLogListGrid");
	return authLogList.getRow(index);	
}

exports.getRowState = function( index ){
	
	var authLogList = app.lookup("authLogListGrid");
	return authLogList.getRowState(index);	
}

exports.setRowState = function(index, state){
	var authLogList = app.lookup("authLogListGrid");
	authLogList.setRowState(index, state);
}

exports.getRowCount = function(index, state){
	var authLogList = app.lookup("authLogListGrid");
	return authLogList.getRowCount();
}

/**
 * 사용자 리스트 컨트롤의 페이징 정보를 설정합니다.
 */
exports.setPaging = function( totalCount, currentPageIndex, pageRowCount, viewPageCount ) {
	var pageIndex = app.lookup("authLogListPageIndexer");
	
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.currentPageIndex = currentPageIndex;//현재 선택된 페이지의 인덱스
	pageIndex.pageRowCount = pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	
	if(totalCount == 0) {
		pageIndex.visible = false;
	} else {
		pageIndex.visible = true;
	}
	
	pageIndex.redraw();
}

exports.setPaging = function( totalCount, pageRowCount, viewPageCount ) {
	var pageIndex = app.lookup("authLogListPageIndexer");
	
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	//pageIndex.currentPageIndex = currentPageIndex;//현재 선택된 페이지의 인덱스
	pageIndex.pageRowCount = pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	
	if(totalCount == 0) {
		pageIndex.visible = false;
	} else {
		pageIndex.visible = true;
	}
	pageIndex.redraw();
}

exports.setTotalCount = function(totalCount) {
	
	var pageIndex = app.lookup("authLogListPageIndexer");
	pageIndex.totalRowCount = totalCount
	
	if(totalCount == 0) {
		pageIndex.visible = false;
	} else {
		pageIndex.visible = true;
	}
	
	pageIndex.redraw();
}

exports.getCurrentPageIndex = function() {	
	var pageIndex = app.lookup("authLogListPageIndexer");
	return pageIndex.currentPageIndex
}

exports.setCurrentPageIndex = function(index) {	
	var pageIndex = app.lookup("authLogListPageIndexer");	
	pageIndex.currentPageIndex = index;	
}

exports.setPageRowCount = function(count) {	
	var pageIndex = app.lookup("authLogListPageIndexer");	
	pageIndex.pageRowCount = count;	
}

exports.getPageRowCount = function() {	
	var pageIndex = app.lookup("authLogListPageIndexer");	
	return pageIndex.pageRowCount;	
}

exports.refreshAuthLogList = function(idMap){
	var dsAuthLogList = app.lookup("AuthLogList");
	
	var total = dsAuthLogList.getRowCount();
	for ( var i = 0; i < total; i++){		
		var row = dsAuthLogList.getRow(i);		
		if (row){
			var authLogIndexKey = row.getValue("IndexKey");
									
			if( idMap.get(authLogIndexKey) != undefined ){
				dsAuthLogList.setRowState(i,cpr.data.tabledata.RowState.DELETED);	
			} else {				
				dsAuthLogList.setRowState(i,cpr.data.tabledata.RowState.UNCHANGED);
			}
		} 
	}
	
	var authLogList = app.lookup("authLogListGrid");
	authLogList.redraw();
}

exports.clearAuthLogList = function(  ){
			
	var pageIndex = app.lookup("authLogListPageIndexer");
	pageIndex.totalRowCount = 0;
	pageIndex.visible = false;	
	pageIndex.redraw();
	
	var authLogListSet = app.lookup("AuthLogList");
	authLogListSet.clear();			
	
	var authLogList = app.lookup("authLogListGrid");	
	authLogList.redraw();
}

/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onAuthLogListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var authLogListPageIndexer = e.control;
	
	var selectionEvent = new cpr.events.CSelectionEvent("pagechange", {
		oldSelection: e.oldSelection,
		newSelection: e.newSelection
	});
	
	app.dispatchEvent(selectionEvent);
}


/*
 * 페이지 인덱서에서 before-selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경되기 전에 발생하는 이벤트. 다음 이벤트로 selection-change를 발생합니다.
 */
function onAuthLogListPageIndexerBeforeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var authLogListPageIndexer = e.control;
	
	var selectionEvent = new cpr.events.CSelectionEvent("before-pagechange", {
		oldSelection: e.oldSelection,
		newSelection: e.newSelection
	});
	
	app.dispatchEvent(selectionEvent);
	
	// 기본처리가 중단되었을 때 변경을 취소함.
	if(selectionEvent.defaultPrevented == true) {
		e.preventDefault();
	}
}

