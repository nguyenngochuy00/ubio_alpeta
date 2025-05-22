/************************************************
 * AuthLogManagement.js
 * Created at 2018. 12. 26. 오후 6:01:05.
 *
 * @author wonki
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var pageRowCount;
var comLib;
var ALEMP_pageRowCount = 1000; // 사용안함
var ALEMP_recvRowPerExport  = 2000;

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	comLib =  createComUtil(app);
	dataManager = getDataManager();
	
	var dtStart = app.lookup("ALMGR_dtStart");
	var dtEnd = app.lookup("ALMGR_dtEnd");
	
//	dtStart.value = '2018-09-01';
//	dtEnd.value = '2018-10-01';
	
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	dtEnd.value = now.format('YYYY-MM-DD');
	
	//var before = now.add(-30, 'days');
	dtStart.value = now.format('YYYY-MM-DD');
	
	app.lookup("ALMGR_cmbOutputCount").value = 20;
	pageRowCount = app.lookup("ALMGR_cmbOutputCount").value; // 초기값
	
	var udcAuthLogList = app.lookup("ALMGR_udcAuthLogList");
	udcAuthLogList.setPaging(0, 1, 10, pageRowCount);
		
	var dm_ExportParam = app.lookup("dm_ExportParam")
	dm_ExportParam.setValue("mode", "list");
	
	if (dataManager.getOemVersion() == OEM_JAWOONDAE) {
		var cmbSearchCategory = app.lookup("ALMGR_cmbCategory");
		cmbSearchCategory.addItem(new cpr.controls.Item("출입증번호", "cardnum"));
		app.lookup("ALMGR_cmbCategory").value = "user_name";
	}
	//sendTerminalTinyList();
	// 자운대 경우에는 모든 단말기에 대한 리스트를 가지고 오게 하자
	sendAuthLogListRequest();
}

// 인증로그 검색 버튼 클릭시
function onButtonClick(/* cpr.events.CMouseEvent */ e){	
	var dm_ExportParam = app.lookup("dm_ExportParam")
	dm_ExportParam.setValue("mode", "list");
	
	var dsAuthLogList = app.lookup("AuthLogList");
	dsAuthLogList.clear();
	var udcAuthLogList = app.lookup("ALMGR_udcAuthLogList");
	udcAuthLogList.setAuthLogList(dsAuthLogList);

	var udcAuthLogList = app.lookup("ALMGR_udcAuthLogList");
	udcAuthLogList.setCurrentPageIndex(1);
	sendAuthLogListRequest();	
}

function sendAuthLogListRequest() {
	var memTerminalList = dataManager.getTerminalList();
	var udcAuthLogList = app.lookup("ALMGR_udcAuthLogList");
	var curIndex = udcAuthLogList.getCurrentPageIndex();
	var offset = (curIndex - 1) * pageRowCount;
	
	var smsGetAuthLogList = app.lookup("sms_getAuthLogList");
	var dtStart = app.lookup("ALMGR_dtStart");
	var dtEnd = app.lookup("ALMGR_dtEnd");
	
	var cmbCategory = app.lookup("ALMGR_cmbCategory");
	var edtKeyword = app.lookup("ALMGR_edtKeyword");
	
	smsGetAuthLogList.setParameters("startTime", dtStart.value + " 00:00:00");
	smsGetAuthLogList.setParameters("endTime", dtEnd.value + " 23:59:59");
	smsGetAuthLogList.setParameters("offset", offset);
	smsGetAuthLogList.setParameters("limit", pageRowCount);
	
	if(cmbCategory.value == "terminal_name"){
		var bFound = false;
		if (edtKeyword.value.length > 0) {// 검색어가 있다.
			var searchData = memTerminalList.findFirstRow("Name == '"+edtKeyword.value+"'");
			if (searchData) {
				console.log(searchData.getRowData());
				smsGetAuthLogList.setParameters("searchCategory", "terminal_id");
				smsGetAuthLogList.setParameters("searchKeyword", searchData.getValue("ID"));
				bFound = true;
			} else {
				bFound = false;
			}
		}
		// LPR id 검색
		
		if( bFound == false ){
			return;
		}
	}else if(cmbCategory.value != null && cmbCategory.value.length > 0) {
		smsGetAuthLogList.setParameters("searchCategory", cmbCategory.value);
		
		if (edtKeyword.value != null && edtKeyword.value.length > 0) {
			smsGetAuthLogList.setParameters("searchKeyword", edtKeyword.value);
		}
	}
	
	//console.log("category : " + cmbCategory.value);
	//console.log("keyword : " + edtKeyword.value);
	
	//2019-11-29 새로 추가한 소스
	var dm_ExportParam = app.lookup("dm_ExportParam")	
	if( dm_ExportParam.getValue("mode")=="export"){
		smsGetAuthLogList.setParameters("offset", dm_ExportParam.getValue("offset"));
		smsGetAuthLogList.setParameters("limit", ALEMP_recvRowPerExport);
	}
	//2019-11-29 추가 끝
	
	
	var dsAuthLogList = app.lookup("AuthLogList");
	dsAuthLogList.clear();
	var udcAuthLogList = app.lookup("ALMGR_udcAuthLogList");
	udcAuthLogList.setAuthLogList(dsAuthLogList);	
	udcAuthLogList.setPaging(0, pageRowCount, 0);
	
	smsGetAuthLogList.send();
	var dm_ExportParam = app.lookup("dm_ExportParam")		
	if( dm_ExportParam.getValue("mode")=="list"){
		comLib.showLoadMask("", dataManager.getString("Str_ListLoading"), "");
	}
}

// 인증로그 리스트 가져오기 완료
function onSms_getAuthLogListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	
}

function onSms_getAuthLogListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dsAuthLogList = app.lookup("AuthLogList");
		var count = dsAuthLogList.getRowCount();
		var terminalList = dataManager.getTerminalList();
		
		for(var i =0; i<count; i++){
			var logInfo = dsAuthLogList.getRow(i);
			if (logInfo.getValue("TerminalName").length <= 0) { // 이름이 없으면
				var terminalID = logInfo.getValue("TerminalID");
				var searchData = terminalList.findFirstRow("ID =='"+terminalID+"'");
				if( searchData ){
					logInfo.setValue("TerminalName",searchData.getValue("Name"));
				}
			//	console.log(logInfo.getValue("EventTime"));
			}
			if (logInfo.getValue("GroupName").length <= 0 ) {// 그룹 이름이 없으며
				var gid = logInfo.getValue("GroupCode");
				if (gid > 0) {
					var groupName = dataManager.getGroupName(gid);
					if (groupName == '---') {
						groupName = '';
					
					}
					logInfo.setValue("GroupName",groupName);	
				}
				
			}
			if( logInfo.getValue("ReserveType") == 1 ){				
				var data = logInfo.getValue("ReserveData").split(',');
				logInfo.setValue("Detail", data[2]+"."+data[3]+"°");
			}
			
		}
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		
		//2019-11-29 신규 추가
		var dm_ExportParam = app.lookup("dm_ExportParam")		
		if( dm_ExportParam.getValue("mode")=="list"){
			var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
			if (viewPageCount > 10) {
				viewPageCount = 10;
			}
			pageRowCount = parseInt(pageRowCount, 0); // pageRowCount가 String 형태로 넘어가고 있었는데, String 형태로 넘기면 페이징에 오류가 있어 int로 바꿈
			var udcAuthLogList = app.lookup("ALMGR_udcAuthLogList");
			udcAuthLogList.setAuthLogList(dsAuthLogList);	
			udcAuthLogList.setPaging(totalCount, pageRowCount, viewPageCount);
			comLib.hideLoadMask();
		}else{
			var exportAuthLogList = app.lookup("ExportAuthLogList");
			
			if(dsAuthLogList.getRowCount() == 0 ){
				comLib.hideLoadMask();
				if( exportAuthLogList.getRowCount() >0 ){
					exportExcel();					
					exportAuthLogList.clear();
				} else {
					dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
				}
			}else {				
				if( exportAuthLogList.getRowCount() == 0 ){ // 엑셀 내보내기시 전체 수를 처음에는 알 수 없으므로 첫번째 리스트 수신시 전체 카운트 셋팅
					dm_ExportParam.setValue("total",totalCount);
					
					//comLib.hideLoadMask();
					
					comLib.showLoadMask("pro", dataManager.getString("Str_ListLoading"), "",totalCount/ALEMP_recvRowPerExport);					
				}
				//dsAuthLogList.copyToDataSet(exportAuthLogList)
				for( i = 0; i < count; i++){
					exportAuthLogList.pushRowData(dsAuthLogList.getRowData(i));
				}			
				
				if( exportAuthLogList.getRowCount() >= dm_ExportParam.getValue("total")){
					comLib.showLoadMask("",dataManager.getString("Str_ExcelDataConversion"),"");
								
								setTimeout(function(){
			  						exportExcel();					
									exportAuthLogList.clear();
			  					}, 100);
					
				} else {
					var offset = dm_ExportParam.getValue("offset")
					offset += ALEMP_recvRowPerExport;
					dm_ExportParam.setValue("offset",offset)
					comLib.updateLoadMask(offset);
					sendAuthLogListRequest();
				}
			}
		}
		//2019-11-29 신규 끝
		app.lookup("ALMGR_grp").redraw();
	} else {
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_AuthLog";
		if( errStr.length > 0 ){
			errMsg = dataManager.getString(errStr);
		} else {
			errMsg = dataManager.getString(errMsg);
		}
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);		
	}
	app.lookup("ALMGR_grp").redraw();
}

function onSms_getAuthLogListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getAuthLogListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onALMGR_udcAuthLogListPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.grid.authLogList
	 */
	var aLMGR_udcAuthLogList = e.control;
	var dm_ExportParam = app.lookup("dm_ExportParam")
	dm_ExportParam.setValue("mode", "list");
	sendAuthLogListRequest();	
}


/*
 * 인풋 박스에서 keydown 이벤트 발생 시 호출.
 * 사용자가 키를 누를 때 발생하는 이벤트.
 */
function onALMGR_edtKeywordKeydown(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var aLMGR_edtKeyword = e.control;
	
	if(e.keyCode == 13) {
		sendAuthLogListRequest();		
	}
}


/*
 * 콤보 박스에서 mousedown 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 누를 때 발생하는 이벤트.
 */
function onALMGR_cmbCategoryMousedown(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var aLMGR_cmbCategory = e.control;
	if(e.keyCode == 13) {
		sendAuthLogListRequest();		
	}	
}


/*
 * 사용자 정의 컨트롤에서 dblclick 이벤트 발생 시 호출.
 */
function onALMGR_udcAuthLogListDblclick(/* cpr.events.CSelectionEvent */ e){
	var dsAuthLogList = app.lookup("ALMGR_udcAuthLogList");
	var selectionRow = dsAuthLogList.getSelectedRow(); 
	
	if( selectionRow.getStateString() == "D" || selectionRow.getStateString() == "ID" ){
		return;
	}
	var cmbCategory = app.lookup("ALMGR_cmbCategory");
	var edtKeyword = app.lookup("ALMGR_edtKeyword");
	
	var indexKey = selectionRow.getRowData()["IndexKey"];
	var param = [ cmbCategory.value, edtKeyword.value];
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target":DLG_AUTHLOG_VIEW,
			"ID": indexKey,
			"Param":param,			
		}
	});

	app.getHostAppInstance().dispatchEvent(selectionEvent);

}


// 도움말
function onALMGR_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

function onALMGR_cmbOutputCountSelectionChange(/* cpr.events.CSelectionEvent */ e){
	pageRowCount = app.lookup("ALMGR_cmbOutputCount").value; 
	
}

function onALEMP_dtiExportClick(/* cpr.events.CMouseEvent */ e){
	var totalLabel = app.lookup("ALMGR_opbTotal");
	var dmTotal = app.lookup("Total")
	var dm_ExportParam = app.lookup("dm_ExportParam")
	dm_ExportParam.setValue("mode", "export");
	dm_ExportParam.setValue("total", dmTotal.getValue("Count"));	
	dm_ExportParam.setValue("offset", 0);
	comLib.showLoadMask("pro",dataManager.getString("Str_UserExport"),"",parseInt(totalLabel.value)/1000);
	
	sendAuthLogListRequest()
}

function getLogAuthTypeString( value ){
	var type = "";
	switch ( value ){
		case 1: type = dataManager.getString("Str_AuthTypeFPVerify"); break;
		case 2: type = dataManager.getString("Str_AuthTypeFPIdentify"); break;
		case 3: type = dataManager.getString("Str_Password"); break;
		case 4: type = dataManager.getString("Str_Card"); break;
		case 5: type = dataManager.getString("Str_AuthTypeFaceVerify"); break;
		case 6: type = dataManager.getString("Str_AuthTypeFaceIdentify"); break;
		case 7: type = dataManager.getString("Str_MobileCard"); break;
		case 8: type = dataManager.getString("Str_TypeQR"); break;
	
		default : return ""; break;
	}
	return type;
}

function getLogAuthResultString( value ){
	var type = "";
	switch ( value ){
		case 0: type = dataManager.getString("Str_Success"); break;
		case 1: type = dataManager.getString("Str_AuthResultFail"); break;
		case 2: type = dataManager.getString("Str_AuthResultAccessDenied"); break;
		case 3: type = dataManager.getString("Str_AuthResultTimeout"); break;
		case 4: type = dataManager.getString("Str_AuthResultTimeoutCapture"); break;
		case 5: type = dataManager.getString("Str_AuthResultTimeoutIdentify"); break;
		case 6: type = dataManager.getString("Str_AuthResultAntiPassback"); break;
	
		default : return ""; break;
	}
	return type;
}

function getLogFuncType( value ){
	var type = "";
	switch ( value ){
		case 0 : type = dataManager.getString("Str_AuthLogFuncTypeAccess"); break;		
		case 1: type = dataManager.getString("Str_AuthLogFuncTypeTna"); break;
		case 2: type = dataManager.getString("Str_AuthLogFuncTypeMeal"); break;
			
		default : type = ""; break;
	}
	return type;
}
function exportExcel(){
	
	dataManager = getDataManager();
	var dsAuthLogList = app.lookup("ExportAuthLogList");
	var total = dsAuthLogList.getRowCount();
	comLib.showLoadMask("pro",dataManager.getString("Str_UserExport"),"",total);
	for( var i = 0; i < total ; i++){
		var authLogInfo = dsAuthLogList.getRow(i);
		
		var groupName = authLogInfo.getValue("GroupName");		
		//var groupName = dataManager.getGroupName(groupID);		
		authLogInfo.setValue("GroupName",groupName);
		
		var authType = authLogInfo.getValue("AuthType");
		var authTypeName = getLogAuthTypeString(parseInt(authType));
		authLogInfo.setValue("AuthType",authTypeName);
		
		var authResult = authLogInfo.getValue("AuthResult");
		var authResultName = getLogAuthResultString(parseInt(authResult));
		authLogInfo.setValue("AuthResult",authResultName);
		
		var funcType = authLogInfo.getValue("FuncType");
		var funcTypeName = getLogFuncType(parseInt(funcType));
		authLogInfo.setValue("FuncType",funcTypeName);
		
		/* ExportAuthLogList에서 UserType 일단 삭제. 방문객 구현 완료시 추가
		var userType = authLogInfo.getValue("UserType");
		if( userType == "0") {
			userType = dataManager.getString("Str_User");
		} else {
			userType = dataManager.getString("Str_Visitor");
		}
		*/
		
		/* ExportAuthLogList에서 Property 일단 삭제. 로그 생성 위치, 저장 방법, 외부장비 종류, 관리자 개입 여부 기록 
				var property = authLogInfo.getValue("Property");
		* */
		
	}
	
	
	/* original data */
	var today = dateLib.getToday();
	var filename = "AuthLogList_"+today+".xlsx";	
	var ws_name = "AuthLogList_";
		
	var wb = XLSX.utils.book_new(), ws = XLSX.utils.json_to_sheet(dsAuthLogList.getRowDataRanged());
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);

	XLSX.writeFile(wb, filename);	
	comLib.hideLoadMask();
}

/*
 * Body에서 keydown 이벤트 발생 시 호출.
 * 사용자가 키를 누를 때 발생하는 이벤트.
 */
function onBodyKeydown(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		var dm_ExportParam = app.lookup("dm_ExportParam")
		dm_ExportParam.setValue("mode", "list");
		sendAuthLogListRequest();		
	}
}
