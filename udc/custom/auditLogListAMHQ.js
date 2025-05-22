/************************************************
 * sysLogList.js
 * Created at 2019. 1. 10. 오후 6:57:47.
 *
 * @author wonki
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
dataManager = getDataManager();

function onBodyLoad(/* cpr.events.CEvent */ e){
	initAuditCategory();
	initAuditContent();
	initAuditAction();	
	initAuditSource();	
}

function initAuditCategory(){
	var cmbAuditCategory = app.lookup("UDC_cmbAuditCategory");
	cmbAuditCategory.addItem(new cpr.controls.Item("", 0));
	cmbAuditCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditCategoryUser"), 1));
	cmbAuditCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditCategoryTerminal"), 2));
	cmbAuditCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditCategoryACU"), 3));
	cmbAuditCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditCategoryVisitor"), 4));
	cmbAuditCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditCategoryBlacklist"), 5));
	cmbAuditCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditCategoryTimezone"), 6));
	cmbAuditCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditCategoryTimezoneDay"), 7));
	cmbAuditCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditCategoryTimezoneHoliday"), 8));
	cmbAuditCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditCategoryAntiPassback"), 9));
	cmbAuditCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditCategoryPosition"), 10));
	cmbAuditCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditCategoryAccessControl"), 11));
	cmbAuditCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditCategoryMobileCard"), 12));
	cmbAuditCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditCategoryTna"), 13));
	cmbAuditCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditCategoryMeal"), 14));
	cmbAuditCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditCategoryGroup"), 15));
	cmbAuditCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditCategoryPrivilege"), 16));
	cmbAuditCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditCategorySetting"), 17));
	cmbAuditCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditCategoryUserMessage"), 18));
	cmbAuditCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditCategoryWiegand"), 20));
	cmbAuditCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditCategoryWebClient"), 21)); // 웹클라이언트
	cmbAuditCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditCategoryMustering"), 22)); // 웹클라이언트
	
	cmbAuditCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_PassManagement"), 9000)); // 출입증
	cmbAuditCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_VisitRequest"), 9001)); // 방문신청
	cmbAuditCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdOtherUnit"), 9002)); // 타부대원
	cmbAuditCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_LprManagement"), 9003)); // 방문신청
	cmbAuditCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_CarInfoListManagement"), 9004)); // 방문신청
	
	
}
function initAuditContent(){
	var cmbAuditContent = app.lookup("UDC_cmbAuditContent");
	cmbAuditContent.addItem(new cpr.controls.Item("", 0));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContentUser"), 1));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContentUserFP"), 2));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContentUserFA"), 3));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContentUserRFCard"), 4));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContentUserPassword"), 5));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContentUserMobileCard"), 6));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContentTerminal"), 7));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContentTerminalControl"), 8));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContentTerminalNotice"), 9));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContentACU"), 10));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContentACUControl"), 11));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContentVisitor"), 12));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContentBlacklist"), 13));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContentAccessControl"), 14));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContentAccessGroup"), 15));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContentAccessGroupTerminal"), 16));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContentAccessGroupUser"), 17));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContentMobileCard"), 18));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContentMobileCardSetting"), 19));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContentTna"), 20));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContentTnaSetting"), 21));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContenteMeal"), 22));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContentMealSetting"), 23));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContentGroup"), 24));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContentSetting"), 25));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContentSettingEmergency"), 26));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContentSettingEmail"), 27));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContentTerminalFirmware"), 28));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditContentWebClient"), 29));
	
	
	
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Pass"), 9000));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_VisitRequest"), 9001));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdOtherUnit"), 9002));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_LprManagement"), 9003));
	cmbAuditContent.addItem(new cpr.controls.Item(dataManager.getString("Str_SysLogContentCarInfo"), 9004));
	

}

function initAuditAction(){
	var cmbAuditAction = app.lookup("UDC_cmbAuditAction");	
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditActingRegist"), 1));	
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditActingModify"), 2));
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditActingDelete"), 3));
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditActingApply"), 4));
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditActingSetting"), 5));
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditActingRelease"), 6));
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditActingDoorOpen"), 7));
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditActingDoorLock"), 8));
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditActingDoorUnLock"), 9));
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditActingTerminalLock"), 10));
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditActingTerminalUnLock"), 11));
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditActingInitTotal"), 12));
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditActingInitSetting"), 13));
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditActingInitAuthLog"), 14));
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditActingInitUser"), 15));
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditActingMoileLogin"), 16));
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditActingMoileLogout"), 17));
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditActingTaskCompleteDelete"), 18));
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditActingClientLogin"), 19));
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditActingClientLogout"), 20));
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditActingClientLoginFailed"), 22));
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditActingView"), 23));
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_VisitRequestApproval"), 9001));	
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_VisitRequestDeny"), 9002));	
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_Issued"), 9003));	
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorRemoteOpen"), 131082));
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorRemoteUnlock"), 131083));
	cmbAuditAction.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorRemoteLock"), 131084));	
	
	
}
	
function initAuditSource(){
	var cmbAuditSource = app.lookup("UDC_cmbAuditSource");
	cmbAuditSource.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditSrcServer"), 0));
	cmbAuditSource.addItem(new cpr.controls.Item(dataManager.getString("Str_AuditSrcTerminal"), 1));	
}

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};

exports.getCheckedRowIndices = function() {
	var auditLogList = app.lookup("auditLogListGrid_amhq");
	var indices = auditLogList.getCheckRowIndices();
	
	var result = [];
	indices.forEach(function(idx){
		if(auditLogList.getRowState(idx) != cpr.data.tabledata.RowState.DELETED ){
			result.push(idx);
		} else {
			auditLogList.setCheckRowIndex(idx, false);
		}
	});
	
	return result;
}

exports.setUnCheckAll = function(idx,checked){
	var auditLogList = app.lookup("auditLogListGrid_amhq");
	var indices = auditLogList.getCheckRowIndices();
	
	indices.forEach(function(idx){
		auditLogList.setCheckRowIndex(idx, false);		
	});
} 

exports.deleteColumn = function(indices){
	if (indices==undefined || indices == null ){
		return;
	}
	var auditLogList = app.lookup("auditLogListGrid_amhq");
	indices.forEach(function(index){
		auditLogList.deleteColumn(index);
	});	
}

exports.deleteRow = function(checkedRowIndices) {
	var auditLogList = app.lookup("auditLogListGrid_amhq");
	auditLogList.deleteRow(checkedRowIndices);
	auditLogList.clearAllCheck();
	return;
}

exports.setAuditLogList = function( /*cpr.data.DataSet*/auditLogDataSet ){
			
	var auditLogListSet = app.lookup("AuditLogList");
	auditLogListSet.clear();	
	auditLogDataSet.copyToDataSet(auditLogListSet);	
	auditLogListSet.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	
	var auditLogList = app.lookup("auditLogListGrid_amhq");	
	auditLogList.redraw();
}

exports.setAuditLogListRows = function( /*cpr.data.RowConfigInfo[]*/auditLogData ){
			
	var auditLogListSet = app.lookup("AuditLogList"); 
	auditLogListSet.clear();	
	auditLogListSet.build(auditLogData);	
	auditLogListSet.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	
	var auditLogList = app.lookup("auditLogListGrid_amhq");	
	auditLogList.redraw();	
}

exports.getAuditLogIndexKey = function( index ){
	
	var auditLogList = app.lookup("auditLogListGrid_amhq");
	var auditLogIndexKey = auditLogList.getRow(index).getString("IndexKey");
	return auditLogIndexKey;
}

exports.getRowData = function( index ){
	
	var auditLogList = app.lookup("auditLogListGrid_amhq");
	return auditLogList.getRow(index).getRowData();	
}

exports.getRow = function( index ){
	
	var auditLogList = app.lookup("auditLogListGrid_amhq");
	return auditLogList.getRow(index);	
}

exports.getRowState = function( index ){
	
	var auditLogList = app.lookup("auditLogListGrid_amhq");
	return auditLogList.getRowState(index);	
}

exports.setRowState = function(index, state){
	var auditLogList = app.lookup("auditLogListGrid_amhq");
	auditLogList.setRowState(index, state);
}

exports.getRowCount = function(index, state){
	var auditLogList = app.lookup("auditLogListGrid_amhq");
	return auditLogList.getRowCount();
}

/**
 * 사용자 리스트 컨트롤의 페이징 정보를 설정합니다.
 */
exports.setPaging = function( totalCount, pageRowCount, viewPageCount ) {
	var pageIndex = app.lookup("auditLogListPageIndexer");
	
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
//	pageIndex.currentPageIndex = currentPageIndex;//현재 선택된 페이지의 인덱스
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
	
	var pageIndex = app.lookup("auditLogListPageIndexer");
	pageIndex.totalRowCount = totalCount
	
	if(totalCount == 0) {
		pageIndex.visible = false;
	} else {
		pageIndex.visible = true;
	}
	
	pageIndex.redraw();
}

exports.getCurrentPageIndex = function() {	
	var pageIndex = app.lookup("auditLogListPageIndexer");
	return pageIndex.currentPageIndex
}

exports.setCurrentPageIndex = function(index) {	
	var pageIndex = app.lookup("auditLogListPageIndexer");	
	pageIndex.currentPageIndex = index;	
}

exports.setPageRowCount = function(count) {	
	var pageIndex = app.lookup("auditLogListPageIndexer");	
	pageIndex.pageRowCount = count;	
}

exports.getPageRowCount = function() {	
	var pageIndex = app.lookup("auditLogListPageIndexer");	
	return pageIndex.pageRowCount;	
}

exports.refreshAuditLogList = function(idMap){
	var dsAuditLogList = app.lookup("AuditLogList");
	
	var total = dsAuditLogList.getRowCount();
	for ( var i = 0; i < total; i++){		
		var row = dsAuditLogList.getRow(i);		
		if (row){
			var auditLogIndexKey = row.getValue("IndexKey");
									
			if( idMap.get(auditLogIndexKey) != undefined ){
				dsAuditLogList.setRowState(i,cpr.data.tabledata.RowState.DELETED);	
			} else {				
				dsAuditLogList.setRowState(i,cpr.data.tabledata.RowState.UNCHANGED);
			}
		} 
	}
	
	var auditLogList = app.lookup("auditLogListGrid_amhq");
	auditLogList.redraw();
}

exports.clearAuditLogList = function(  ){
			
	var pageIndex = app.lookup("auditLogListPageIndexer");
	pageIndex.totalRowCount = 0;
	pageIndex.visible = false;	
	pageIndex.redraw();
	
	var auditLogListSet = app.lookup("AuditLogList");
	auditLogListSet.clear();			
	
	var auditLogList = app.lookup("auditLogListGrid_amhq");	
	auditLogList.redraw();
}


/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onAuditLogListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var auditLogListPageIndexer = e.control;
	
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
function onAuditLogListPageIndexerBeforeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var auditLogListPageIndexer = e.control;
	
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



