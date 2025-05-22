/************************************************
 * authLogList.js
 * Created at 2018. 12. 26. 오후 8:19:17.
 *
 * @author wonki
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
	
	oem_version = dataManager.getOemVersion();
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

	cmbAuthType.addItem(new cpr.controls.Item("PDA", 9998));
	cmbAuthType.addItem(new cpr.controls.Item("LPR", 9999));
	cmbAuthType.addItem(new cpr.controls.Item("LPR RF Card", 9997));
}

function initComboAuthResult() {
	var cmbAuthResult = app.lookup("cmb_AuthLogResult");
	if (cmbAuthResult == null) return;
	
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_Success"), AuthLogResultSuccess));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultFail"), AuthLogResultFail));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultAccessDenied"), AuthLogResultAccessDenied));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeout"), AuthLogResultTimeout));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeoutCapture"), AuthLogResultTimeoutCapture));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeoutIdentify"), AuthLogResultTimeoutIdentify));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultAntiPassback"), AuthLogResultAntiPassback));	
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultDuress"), AuthLogResultDuress));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultBlackList"), AuthLogResultBlackList));
	
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultUnregistUser"), AuthLogResultInvalidUser));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultFPCaptureFailed"), AuthLogResultCapture));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultDuplicatedAuth"), AuthLogResultDuplicatedAuthentication));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultNetworkError"), AuthLogResultNetwork));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultServerBusy"), AuthLogResultServerBusy));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultFaceDetectionFailed"), AuthLogResultFaceDetection));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailMealPay"), AuthLogResultFailMealPay));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailMealTime"), AuthLogResultFailMealTime));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailNotExistsMealCode"), AuthLogResultFailNotExistsMealCode));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailPeriod"), AuthLogResultFailPeriod));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailMealLimit"), AuthLogResultFailMealLimit));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailDayLimit"), AuthLogResultFailDayLimit));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailMonthLimit"), AuthLogResultFailMonthLimit));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultSoftpassback"), AuthLogResultSoftpassback));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultNoMask"), AuthLogResultNoMask));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFeverDetection"), AuthLogResultFeverDetection));
	
	cmbAuthResult.addItem(new cpr.controls.Item("요일제 위반", AuthLogResultLprChoicePartTimeSystemFail));
	cmbAuthResult.addItem(new cpr.controls.Item("5부제 위반", AuthLogResultLprFivePartTimeSystemFail));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultLprFail"), AuthLogResultLprAuthResultFail));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultLprUnRegist"), AuthLogResultLprAuthResultUnRegist));
	
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


