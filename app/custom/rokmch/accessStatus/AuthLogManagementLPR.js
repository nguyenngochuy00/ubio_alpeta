/************************************************
 * AuthLogManagement.js
 * Created at 2018. 12. 26. 오후 6:01:05.
 *
 * @author wonki
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var pageRowCount = 20;
var comLib;
var ALEMP_pageRowCount = 1000; // 사용안함
var exportCount = 100; // 한번에 요청할 데이터 수
var loginUserGroupID;

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib =  createComUtil(app);
	dataManager = getDataManager();
	loginUserGroupID = getLoginUserGroupCode();
	
	var dtStart = app.lookup("ALMGR_dtStart");
	var dtEnd = app.lookup("ALMGR_dtEnd");
	
//	dtStart.value = '2018-09-01';
//	dtEnd.value = '2018-10-01';
	
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	dtEnd.value = now.format('YYYY-MM-DD');
	
	//var before = now.add(-30, 'days');
	dtStart.value = now.format('YYYY-MM-DD');
	
	// 차량 5부제 현황 추가
	app.lookup("ALMGR_fivePartTimeSystem").checked = false;
	
	if(!isSuperGroupAdmin()) { // Master, 상위관리자만 부서별 검색 조건 사용 가능
        app.lookup("ALMGR_cmbCategory").deleteItem(5);
    }
	
	//app.lookup("ALMGR_cmbOutputCount").value = 20;
	//pageRowCount = app.lookup("ALMGR_cmbOutputCount").value; // 초기값
	
	var udcAuthLogList = app.lookup("ALMGR_udcAuthLogList");
	//udcAuthLogList.setCurrentPaging(0, 1, 10, pageRowCount);
		
	var customLyout = app.lookup("authLogListLayout");
	var udcAuthLogList = new udc.grid.authLogLPRListAMHQ("ALMGR_udcAuthLogList");
	udcAuthLogList.addEventListener("pagechange", onALMGR_udcAuthLogListPagechange )
	udcAuthLogList.addEventListener("dblclick", onALMGR_udcAuthLogListDblclick )
	customLyout.addChild(udcAuthLogList,  {	"colIndex": 0, "rowIndex": 0	});		
	
	customLyout.redraw();
	sendAuthLogListRequest(true);

}

// 인증로그 검색 버튼 클릭시
function onButtonClick(/* cpr.events.CMouseEvent */ e){	
	
	var cmbCategory = app.lookup("ALMGR_cmbCategory");
	var searchKeyword = app.lookup("ALMGR_edtKeyword").value;
	
	var dtStart = app.lookup("ALMGR_dtStart");
	var dtEnd = app.lookup("ALMGR_dtEnd");
	if (dtStart.value > dtEnd.value) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorStartEndDateInvalid"));
		return;
	}
	
	if((cmbCategory.value=="all") || (cmbCategory.value != "all" && (searchKeyword == null || searchKeyword == ""))) {		
	// 조회 기간이 30일 동안인지 확인해서 넘는다면  경고 팝업 생성 후, 시작일로부터 30일까지로 날짜 설정  - sep
	// + 조건이 있지만, 검색어에 아무것도 없는 경우 -mjy
		checkSearchDateOverMonth(true)	
	}	
	var dsAuthLogList = app.lookup("AuthLogList");
	dsAuthLogList.clear();
	var udcAuthLogList = app.lookup("ALMGR_udcAuthLogList");
	udcAuthLogList.setAuthLogList(dsAuthLogList);
	udcAuthLogList.setCurrentPageIndex(1);
	sendAuthLogListRequest(true);
}

function onAMASP_btnExportClick(/* cpr.events.CMouseEvent */ e){
	var total = app.lookup("Total").getValue("Count");
	if (total == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "조회된 데이터가 없습니다.");
		return
	}
	var dm_ExportParam = app.lookup("ExportParam");
	dm_ExportParam.setValue("total", total);
	dm_ExportParam.setValue("offset", 0);
	var totalStep = total / exportCount + (total % exportCount != 0) ? 1 : 0;
	comLib.showLoadMask("pro", dataManager.getString("Str_AuthLogExport"), "", totalStep);
	
	sendAuthLogListRequest(false);
}




function sendAuthLogListRequest(isList) {
	
	var dtStart = app.lookup("ALMGR_dtStart");
	var dtEnd = app.lookup("ALMGR_dtEnd");

	var udcAuthLogList = app.lookup("ALMGR_udcAuthLogList");
	var smsGetAuthLogList;
	
	if (isList == true) {
		comLib.showLoadMask("", "작업 진행 중", "");
		smsGetAuthLogList = app.lookup("sms_getAuthLogList") 
		smsGetAuthLogList.removeAllParameters();
		var curIndex = udcAuthLogList.getCurrentPageIndex();
		var offset = (curIndex - 1) * pageRowCount;
		smsGetAuthLogList.setParameters("offset", offset);
		smsGetAuthLogList.setParameters("limit", pageRowCount);
	} else {
		smsGetAuthLogList = app.lookup("sms_getAuthLogListExport");
		smsGetAuthLogList.removeAllParameters();
		
		var exportParam = app.lookup("ExportParam");
		offset = exportParam.getValue("offset");
		smsGetAuthLogList.setParameters("limit", exportCount);
		smsGetAuthLogList.setParameters("offset", offset);
	}
	
	var cmbCategory = app.lookup("ALMGR_cmbCategory");
	var cmbUserType = app.lookup("ALMGR_cmbUserType"); 
	var edtKeyword = app.lookup("ALMGR_edtKeyword");
	
	smsGetAuthLogList.setParameters("funcType", 126); // 차량(LPR) 조회
	
	smsGetAuthLogList.setParameters("groupID", loginUserGroupID); // 부서별 조회를 위한 추가  - pse

	smsGetAuthLogList.setParameters("startTime", dtStart.value + " 00:00:00");
	smsGetAuthLogList.setParameters("endTime", dtEnd.value + " 23:59:59");
	if(cmbCategory.value == "terminal_name"){ // like 조건으로
		if (edtKeyword.value != null && edtKeyword.value.length > 0){
			smsGetAuthLogList.setParameters("searchCategory", "terminal_name");
			smsGetAuthLogList.setParameters("searchKeyword", edtKeyword.value);
		}	
//		var bFound = false;
//		for(var i=0; i<dataManager.getTerminalList().getRowCount();i++){
//			
//			var row = dataManager.getTerminalList().getRow(i);
//			if(row.getValue("Name") == edtKeyword.value){
//				smsGetAuthLogList.setParameters("searchCategory", "terminal_id");
//				smsGetAuthLogList.setParameters("searchKeyword", row.getValue("ID"));
//				bFound = true;
//				break;
//			}
//		}
//		if( bFound == false ){
//			// 무한로딩 버그 수정 -mjy
//			comLib.hideLoadMask();
//			dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ARMYHQ_TerminalLocationNotExist"));		
//			return;
//		}
	}else if(cmbCategory.value != null && cmbCategory.value.length > 0) {
		smsGetAuthLogList.setParameters("searchCategory", cmbCategory.value); // 차량 전체 검색을 때문에 아래의 if문에 들어가면 안됌	
		if (edtKeyword.value != null && edtKeyword.value.length > 0) {		
			smsGetAuthLogList.setParameters("searchKeyword", edtKeyword.value); 
		}
	}
	
	if(cmbUserType.value != null && cmbUserType.value.length > 0) {
		smsGetAuthLogList.setParameters("userType", cmbUserType.value);
	}
	
	var dsAuthLogList = app.lookup("AuthLogList");
	dsAuthLogList.clear();
	var udcAuthLogList = app.lookup("ALMGR_udcAuthLogList");
	udcAuthLogList.setAuthLogList(dsAuthLogList);	
	udcAuthLogList.setPaging(0, pageRowCount, 0);
	
	smsGetAuthLogList.send();

}


function onSubmitError( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

function onSms_getAuthLogListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var temperatureUnit = dataManager.getTemperatureUnit();
		
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
			}
			
			if( logInfo.getValue("ReserveType") == 1 ){			 //ReserveType = 1  온도	
				var data = logInfo.getValue("ReserveData").split(',');
				if(data[3] < 10){
					data[3] = "0"+data[3];
 				}
 				var temp = "";
 				if( data[1]== 1){
 					temp = dataManager.getString("Str_Mask")+ " ";
 				}else if( data[1]== 2){
		 			temp = dataManager.getString("Str_MaskInvalid")+ " ";
		 		}else if( data[1]== 3){
		 			temp = dataManager.getString("Str_MaskNo")+ " ";
		 		}
 				if( temperatureUnit == 1 ){
		 			var tempValue = (parseFloat(data[2]+"."+data[3]) * 9 / 5 + 32).toFixed(2);
		 			temp += tempValue;
		 		}else{
		 			temp += parseFloat(data[2]+"."+data[3]).toFixed(2);	
		 		}
 				
 				if( temperatureUnit == 0 ){
 					logInfo.setValue("Detail", temp+"℃");	
 				} else if( temperatureUnit == 1 ){ 					
 					logInfo.setValue("Detail", temp+"℉");
 				}
			} else if( logInfo.getValue("ReserveType") == 3 ) {			 //ReserveType = 1  온도, Type 2= LPR
				console.log(logInfo.getValue("ReserveData"));	
				var data = logInfo.getValue("ReserveData").split(',');
				var strData;
				if (data[1] == 0) { // 사용안함
					strData = dataManager.getString("Str_NotUsed");	
				} else if (data[1] == 1) { //입구 
					strData = dataManager.getString("Str_LprIn");	
				} else if (data[1] == 2) { //출구
					strData = dataManager.getString("Str_LprOut");	
				}
				logInfo.setValue("Detail", strData);
			} else if (logInfo.getValue("ReserveType") == 9) {
				console.log(logInfo.getValue("ReserveData"));	
				var data = logInfo.getValue("ReserveData").split(',');
				var strData;
				if (data[0] == 1) {
					strData = "입구";	
				} else if (data[0] == 2) {
					strData = "출구";
				}
				logInfo.setValue("Detail", strData);
			}
		}
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		
		pageRowCount = parseInt(pageRowCount, 0); // pageRowCount가 String 형태로 넘어가고 있었는데, String 형태로 넘기면 페이징에 오류가 있어 int로 바꿈
		var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
		if (viewPageCount > 10) {
			viewPageCount = 10;
		}
		var udcAuthLogList = app.lookup("ALMGR_udcAuthLogList");
		udcAuthLogList.setAuthLogList(dsAuthLogList);	
		udcAuthLogList.setPaging(totalCount, pageRowCount, viewPageCount);
		

	} else {
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_AuthLog";
		if( errStr.length > 0 ){
			errMsg = dataManager.getString(errStr);
		} else {
			errMsg = dataManager.getString(errMsg);
		}
		comLib.hideLoadMask();
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), errMsg);		
	}
	
	
	app.lookup("ALMGR_grp").redraw();
	if (app.lookup("ALMGR_fivePartTimeSystem").checked) { // 페이지 이동 시, 5부제 필터 체크박스 해제
		app.lookup("ALMGR_fivePartTimeSystem").checked = false;
	}
}

function onSms_getAuthLogListExportSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var exportParam = app.lookup("ExportParam");
		var dsDataExport = app.lookup("AuthLogListExport");
		var dsData = app.lookup("AuthLogList");
		
		if (dsData.getRowCount() == 0) {
			comLib.hideLoadMask();
			if (dsData.getRowCount() > 0) {
				exportExcel();
				dsDataExport.clear();
			} else {
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
			}
		} else {
			var count = dsData.getRowCount();
			dsData.copyToDataSet(dsDataExport)
			
			if (dsDataExport.getRowCount() >= exportParam.getValue("total")) {
				exportExcel();
				comLib.hideLoadMask();
				dsDataExport.clear();
				sendAuthLogListRequest(true);
			} else {
				var offset = exportParam.getValue("offset")
				offset += exportCount
				exportParam.setValue("offset", offset)
				comLib.updateLoadMask(offset);
				sendAuthLogListRequest(false);
			}
		}
	} else {
		comLib.hideLoadMask();
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onALMGR_udcAuthLogListPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.grid.authLogList
	 */
	var aLMGR_udcAuthLogList = e.control;
	sendAuthLogListRequest(true);	
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
		case 8: type = dataManager.getString("Str_TypeIrisIdentify"); break;
		case 9: type = dataManager.getString("Str_TypeIrisVerify"); break;
	
		case 15: type = dataManager.getString("Str_Inside"); break;

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
		case 5: type = dataManager.getString("Str_AuthResultTimeoutIdentify");
		break;
		case 6: type = dataManager.getString("Str_AuthResultAntiPassback"); break;
		case 120: type = "요일제 위반"; break;
		case 124: type = "5부제 위반"; break;
	
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

function exportExcel() {
	var dsExportList = app.lookup("AuthLogListExport");
	var total = dsExportList.getRowCount();
	
	for (var i = 0; i < total; i++) {
		var authLogInfo = dsExportList.getRow(i);
		
		var groupName = dataManager.getGroupName(authLogInfo.getValue("GroupCode"));		
		if (groupName != "---") {
			authLogInfo.setValue("GroupCode", groupName);	
		} else {
			authLogInfo.setValue("GroupCode", "");
		}
		
		var authType = authLogInfo.getValue("AuthType");
		var authTypeName = getLogAuthTypeString(parseInt(authType));
		authLogInfo.setValue("AuthType",authTypeName);

		var authResult = authLogInfo.getValue("AuthResult");
		var authResultName = getLogAuthResultString(parseInt(authResult));
		authLogInfo.setValue("AuthResult",authResultName);
		
		switch (Number(authLogInfo.getValue("UserType"))) {
			case UserPrivArmyOnDuty: authLogInfo.setValue("UserType", dataManager.getString("Str_ARMY_OnDuty")); break;
			case UserPrivArmyOtherUnit: authLogInfo.setValue("UserType", dataManager.getString("Str_ARMY_OtherUnit")); break;
			case UserPrivArmyForeign: authLogInfo.setValue("UserType", dataManager.getString("Str_ARMY_Foreign")); break;
			case UserPrivArmySoldier: authLogInfo.setValue("UserType", dataManager.getString("Str_ARMY_Soldier")); break;
			case UserPrivArmyFamily: authLogInfo.setValue("UserType", dataManager.getString("Str_ARMY_Family")); break;
			case UserPrivArmyResident: authLogInfo.setValue("UserType", dataManager.getString("Str_ARMY_Resident")); break;
			case UserPrivArmyRegular: authLogInfo.setValue("UserType", dataManager.getString("Str_ARMY_Regular")); break;
			case UserPrivArmyMilitaryPersonnel: authLogInfo.setValue("UserType", dataManager.getString("Str_ARMY_MilitaryPersonnel")); break;
			case UserPrivArmyPublicService: authLogInfo.setValue("UserType", dataManager.getString("Str_ARMY_ArmyPublicServicel")); break;
			default: authLogInfo.setValue("UserType", "");
		}	

	}
	
	var stringified = JSON.stringify(dsExportList.getRowDataRanged());
	
	stringified = stringified.replace(/"EventTime"/gi, '"인증 시간"');
	stringified = stringified.replace(/"TerminalName"/gi, '"장비 위치"');
	stringified = stringified.replace(/"UserType"/gi, '"인원구분"');
	stringified = stringified.replace(/"UniqueID"/gi, '"군번"');
	stringified = stringified.replace(/"GroupCode"/gi, '"부서명"');
	stringified = stringified.replace(/"UserName"/gi, '"사용자 이름"');
	stringified = stringified.replace(/"PositionName"/gi, '"직급"');
	stringified = stringified.replace(/"AuthType"/gi, '"인증 방식"');
	stringified = stringified.replace(/"AuthResult"/gi, '"인증 결과"');
	stringified = stringified.replace(/"Card"/gi, '"카드/차량 번호"');
	stringified = stringified.replace(/"UserID"/gi, '"사용자 ID"');
	stringified = stringified.replace(/"TerminalID"/gi, '"장비 위치"');
	stringified = stringified.replace(/"Detail"/gi, '"상세"');

	var inputData = JSON.parse(stringified);
	
	var today = dateLib.getToday();
	var filename = "출입현황_출입기록조회_" + today + ".xlsx";
	var ws_name = "출입현황_출입기록조회_";
	
	var wb = XLSX.utils.book_new(),
		ws = XLSX.utils.json_to_sheet(inputData);
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);
	
	XLSX.writeFile(wb, filename);
}


/*
 * 조회 기간 설정시 한달 간격인지 확인 후, 한달이 넘을 경우 경고 팝업 띄우기 - sep
 */
function checkSearchDateOverMonth() {
	var dtStart = app.lookup("ALMGR_dtStart");
	var dtEnd = app.lookup("ALMGR_dtEnd");
	
	var startDate = dtStart.value;
	var endDate = dtEnd.value;
	
	//var minStartDate = moment(endDate).add(-30, 'days');
	var plusThirtyDate = moment(startDate).add(30, 'days');
	var maxEndDate = plusThirtyDate.format('YYYY-MM-DD');
	//console.log("startDate : " + startDate + " / " + "maxEndDate : " + maxEndDate);
	
	if (endDate > maxEndDate){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_SearchDateInvalid"));
		dtEnd.value = maxEndDate;
		return false;
	}
	return true;
}


/*
 	차량 5부제 위반 현황만 보도록 필터링 - mjy
 */
function onALMGR_fivePartTimeSystemValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.CheckBox
	 */
	var aLMGR_fivePartTimeSystem = e.control;
	var flag = app.lookup("ALMGR_fivePartTimeSystem").checked;
	
	var dsAuthLogList = app.lookup("AuthLogList");
	var udcAuthLogList = app.lookup("ALMGR_udcAuthLogList");
	
	if (flag) { // 5부제만 표시
		var authResult = AuthLogResultLprFivePartTimeSystemFail //5부제 
		dsAuthLogList.setFilter("AuthResult ==" + authResult);
		udcAuthLogList.setAuthLogList(dsAuthLogList);
	} else {
		dsAuthLogList.clearFilter();
		udcAuthLogList.setAuthLogList(dsAuthLogList);
	}
}


/*
 * 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var appId = "app/custom/rokmch/accessStatus/The5thDayNoDrivingSystemViolationStatics"
	app.getRootAppInstance().openDialog(appId, {width : 510, height : 640}, function(dialog){
		dialog.style.header.css("background-color", "#528443");
		dialog.headerTitle = "부대별 5부제 위반 통계";
		dialog.resizable = false;
		dialog.modal = true;
		dialog.ready(function(dialogApp){
		});
	}).then(function(returnValue){
		;
	});
}


/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onALMGR_edtKeywordKeyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var aLMGR_edtKeyword = e.control;
	if(e.keyCode == 13) {
		var dsAuthLogList = app.lookup("AuthLogList");
		dsAuthLogList.clear();
		var udcAuthLogList = app.lookup("ALMGR_udcAuthLogList");
		udcAuthLogList.setAuthLogList(dsAuthLogList);
		udcAuthLogList.setCurrentPageIndex(1);
		sendAuthLogListRequest(true);		
	}
}
