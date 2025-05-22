/************************************************
 * AuthLogManagement.js
 * Created at 2018. 12. 26. 오후 6:01:05.
 *
 * @author wonki
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var util = cpr.core.Module.require("lib/util");
var pageRowCount = 20;
var comLib;
var ALEMP_pageRowCount = 1000; // 사용안함
var ALMGR_recvRowPerExport = 2000;
var oem_version;

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad( /* cpr.events.CEvent */ e) {
	
	comLib = createComUtil(app);
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
	
	SetMaxDate();
	
	var groupList = dataManager.getGroup();
	var cmbGroup = app.lookup("ALMGR_cmbGroup");
	cmbGroup.addItem(new cpr.controls.Item("----", 0));
	cmbGroup.setItemSet(groupList, {
		label: "Name",
		value: "GroupID",
	});
	
	//app.lookup("ALMGR_cmbOutputCount").value = 20;
	//pageRowCount = app.lookup("ALMGR_cmbOutputCount").value; // 초기값
	
	//var udcAuthLogList = app.lookup("ALMGR_udcAuthLogList");
	//udcAuthLogList.setCurrentPaging(0, 1, 10, pageRowCount);
	
	var dm_ExportParam = app.lookup("dm_ExportParam")
	dm_ExportParam.setValue("mode", "list");
	
	if (dataManager.getOemVersion() == OEM_JAWOONDAE) {
		var cmbSearchCategory = app.lookup("ALMGR_cmbCategory");
		cmbSearchCategory.addItem(new cpr.controls.Item("출입증번호", "cardnum"));
		app.lookup("ALMGR_cmbCategory").value = "user_name";
	}
	
	oem_version = dataManager.getOemVersion()
	// 인증로그 레이아웃: 커스텀 버전에 따라 udc 생성하여 addChild
	var customLyout = app.lookup("authLogListLayout");
	var udcAuthLogList;
	switch (oem_version) {
		case OEM_HYUNDAI_EC: // 인증로그 체크박스 선택이 가능한 udc		
			udcAuthLogList = new udc.grid.authLogListCkb("ALMGR_udcAuthLogList");
			
			// 전송 버튼: 선택된 인증로그 전송
			var customBT = app.lookup("btCustom");
			customBT.value = "전송";
			customBT.visible = true;
			
			break;
		case OEM_ARMY_HQ:
			udcAuthLogList = new udc.grid.authLogListAMHQ("ALMGR_udcAuthLogList");
			break;
		case OEM_LOTTE_CS:
			udcAuthLogList = new udc.grid.authLogListLotteCS("ALMGR_udcAuthLogList");
			break;
		case OEM_HC_SAUDI_MARJAN:
			udcAuthLogList = new udc.grid.authLogListHCSM("ALMGR_udcAuthLogList");
			break;
		default:
			udcAuthLogList = new udc.grid.authLogList("ALMGR_udcAuthLogList");
			break;
	}
	udcAuthLogList.addEventListener("pagechange", onALMGR_udcAuthLogListPagechange)
	udcAuthLogList.addEventListener("dblclick", onALMGR_udcAuthLogListDblclick)
	customLyout.addChild(udcAuthLogList, {
		"colIndex": 0,
		"rowIndex": 0
	});
	
	customLyout.redraw();
	sendAuthLogListRequest();
}

function SetMaxDate() {
	var date = new Date();
	date.setFullYear(date.getFullYear()); // y년을 더함
	date.setMonth(date.getMonth()); // m월을 더함
	date.setDate(date.getDate()); // d일을 더함
	
	app.lookup("ALMGR_dtStart").maxDate = date;
	app.lookup("ALMGR_dtEnd").maxDate = date;
}

// 인증로그 검색 버튼 클릭시
function onButtonClick( /* cpr.events.CMouseEvent */ e) {
	var startTime = app.lookup("ALMGR_dtStart").value;
	var endTime = app.lookup("ALMGR_dtEnd").value;
	var isStartEndDateValid = util.isStartEndDateValid(startTime, endTime);
	if (isStartEndDateValid === false) {
		dialogAlert(app.getHostAppInstance(), "error", dataManager.getString("Str_ErrorStartEndDateInvalid"));
		return false
	}
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
	var dtStart = app.lookup("ALMGR_dtStart");
	var dtEnd = app.lookup("ALMGR_dtEnd");
	/* 사우디 일부 NITGEN 단말기 사용 고객에 한하여 제공 요청사항으로 제한 해제
		if(dateLib.minusDates(dtStart.value.replace(/-/gi,""),dtEnd.value.replace(/-/gi,"")) >= 31){
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ThirtyDayOverError"));
			app.lookup("ALMGR_opbTotal").value = 0;
			return;
		}
	*/
	var udcAuthLogList = app.lookup("ALMGR_udcAuthLogList");
	var curIndex = udcAuthLogList.getCurrentPageIndex();
	var offset = (curIndex - 1) * pageRowCount;
	
	var smsGetAuthLogList = app.lookup("sms_getAuthLogList");
	
	var cmbCategory = app.lookup("ALMGR_cmbCategory");
	var edtKeyword = app.lookup("ALMGR_edtKeyword");
	
	smsGetAuthLogList.setParameters("startTime", dtStart.value + " 00:00:00");
	smsGetAuthLogList.setParameters("endTime", dtEnd.value + " 23:59:59");
	smsGetAuthLogList.setParameters("offset", offset);
	smsGetAuthLogList.setParameters("limit", pageRowCount);
	
	var cmbGroup = app.lookup("ALMGR_cmbGroup");
	if (cmbGroup.value != null && cmbGroup.value != null) {
		smsGetAuthLogList.setParameters("groupID", cmbGroup.value);
	}
	
	if (cmbCategory.value == "terminal_name") {
		var bFound = false;
		for (var i = 0; i < dataManager.getTerminalList().getRowCount(); i++) {
			
			var row = dataManager.getTerminalList().getRow(i);
			if (row.getValue("Name") == edtKeyword.value) {
				smsGetAuthLogList.setParameters("searchCategory", "terminal_id");
				smsGetAuthLogList.setParameters("searchKeyword", row.getValue("ID"));
				bFound = true;
				break;
			}
		}
		if (bFound == false) {
			return;
		}
	} else if (cmbCategory.value != null && cmbCategory.value.length > 0) {
		smsGetAuthLogList.setParameters("searchCategory", cmbCategory.value);
		
		if (edtKeyword.value != null && edtKeyword.value.length > 0) {
			smsGetAuthLogList.setParameters("searchKeyword", edtKeyword.value);
		}
	}
	
	//console.log("category : " + cmbCategory.value);
	//console.log("keyword : " + edtKeyword.value);
	
	//2019-11-29 새로 추가한 소스
	var dm_ExportParam = app.lookup("dm_ExportParam")
	if (dm_ExportParam.getValue("mode") == "export") {
		smsGetAuthLogList.setParameters("offset", dm_ExportParam.getValue("offset"));
		smsGetAuthLogList.setParameters("limit", ALMGR_recvRowPerExport);
	}
	//2019-11-29 추가 끝
	
	var dsAuthLogList = app.lookup("AuthLogList");
	dsAuthLogList.clear();
	var udcAuthLogList = app.lookup("ALMGR_udcAuthLogList");
	udcAuthLogList.setAuthLogList(dsAuthLogList);
	udcAuthLogList.setPaging(0, pageRowCount, 0);
	
	smsGetAuthLogList.send();
	var dm_ExportParam = app.lookup("dm_ExportParam")
	if (dm_ExportParam.getValue("mode") == "list") {
		comLib.showLoadMask("", dataManager.getString("Str_ListLoading"), "");
	}
}

// 인증로그 리스트 가져오기 완료
function onSms_getAuthLogListSubmitSuccess( /* cpr.events.CSubmissionEvent */ e) {
	
}

function onSms_getAuthLogListSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var temperatureUnit = dataManager.getTemperatureUnit();
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dsAuthLogList = app.lookup("AuthLogList");
		var count = dsAuthLogList.getRowCount();
		var terminalList = dataManager.getTerminalList();
		for (var i = 0; i < count; i++) {
			var logInfo = dsAuthLogList.getRow(i);
			var strDummy = logInfo.getValue("Dummy");
			if (strDummy == "-Str_DummyReader-") { // 더미면
				logInfo.setValue(dataManager.getString("Str_DummyReader"));
			}
			
			if (logInfo.getValue("TerminalName").length <= 0) { // 이름이 없으면
				var terminalID = logInfo.getValue("TerminalID");
				var searchData = terminalList.findFirstRow("ID =='" + terminalID + "'");
				if (searchData) {
					logInfo.setValue("TerminalName", searchData.getValue("Name"));
				}
			}
			
			if (logInfo.getValue("ReserveType") == 1) { //ReserveType = 1  온도	
				var data = logInfo.getValue("ReserveData").split(',');
				if (data[3] < 10) {
					data[3] = "0" + data[3];
				}
				var temp = "";
				if (data[1] == 1) {
					temp = dataManager.getString("Str_Mask") + " ";
				} else if (data[1] == 2) {
					temp = dataManager.getString("Str_MaskInvalid") + " ";
				} else if (data[1] == 3) {
					temp = dataManager.getString("Str_MaskNo") + " ";
				}
				if (temperatureUnit == 1) {
					var tempValue = (parseFloat(data[2] + "." + data[3]) * 9 / 5 + 32).toFixed(2);
					temp += tempValue;
				} else {
					temp += parseFloat(data[2] + "." + data[3]).toFixed(2);
				}
				
				if (temperatureUnit == 0) {
					logInfo.setValue("Detail", temp + "℃");
				} else if (temperatureUnit == 1) {
					logInfo.setValue("Detail", temp + "℉");
				}
			} else if (logInfo.getValue("ReserveType") == 3) { //ReserveType = 1  온도, Type 2= LPR
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
				if (dataManager.getOemVersion() == OEM_ARMY_HQ) {
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
			} else if (logInfo.getValue("ReserveType") == 4) { // 음주
				var data = logInfo.getValue("ReserveData").split(',');
				var strData;
				if (data[0] == 0) { // 미측정
					strData = dataManager.getString("Str_AlcholeNoChk") + " ";
				} else if (data[0] == 1) { // 정상
					strData = dataManager.getString("Str_AlcholNormal") + " ";
				} else if (data[0] == 2) { // 음주
					strData = dataManager.getString("Str_AlcholDetected") + " ";
				}
				var alcolValue = (data[2]) | (data[3] << 8);
				alcolValue = data[1] + "." + alcolValue;
				alcolValue = parseFloat(alcolValue).toFixed(3);
				strData = strData + alcolValue;
				logInfo.setValue("Detail", strData);
			}
		}
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		
		//2019-11-29 신규 추가
		var dm_ExportParam = app.lookup("dm_ExportParam")
		if (dm_ExportParam.getValue("mode") == "list") {
			var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
			if (viewPageCount > 10) {
				viewPageCount = 10;
			}
			pageRowCount = parseInt(pageRowCount, 0); // pageRowCount가 String 형태로 넘어가고 있었는데, String 형태로 넘기면 페이징에 오류가 있어 int로 바꿈
			
			var udcAuthLogList = app.lookup("ALMGR_udcAuthLogList");
			
			udcAuthLogList.setAuthLogList(dsAuthLogList);
			udcAuthLogList.setPaging(totalCount, pageRowCount, viewPageCount);
			comLib.hideLoadMask();
		} else {
			var exportAuthLogList = app.lookup("ExportAuthLogList");
			
			if (dsAuthLogList.getRowCount() == 0) {
				comLib.hideLoadMask();
				if (exportAuthLogList.getRowCount() > 0) {
					exportExcel();
					exportAuthLogList.clear();
				} else {
					dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
				}
			} else {
				if (exportAuthLogList.getRowCount() == 0) { // 엑셀 내보내기시 전체 수를 처음에는 알 수 없으므로 첫번째 리스트 수신시 전체 카운트 셋팅
					dm_ExportParam.setValue("total", totalCount);
					
					//comLib.hideLoadMask();
					
					comLib.showLoadMask("pro", dataManager.getString("Str_ListLoading"), "", totalCount / ALMGR_recvRowPerExport);
				}
				//dsAuthLogList.copyToDataSet(exportAuthLogList)
				for (i = 0; i < count; i++) {
					exportAuthLogList.pushRowData(dsAuthLogList.getRowData(i));
				}
				
				if (exportAuthLogList.getRowCount() >= dm_ExportParam.getValue("total")) {
					comLib.showLoadMask("", dataManager.getString("Str_ExcelDataConversion"), "");
					
					setTimeout(function() {
						exportExcel();
						exportAuthLogList.clear();
					}, 100);
					
				} else {
					var offset = dm_ExportParam.getValue("offset")
					offset += ALMGR_recvRowPerExport;
					dm_ExportParam.setValue("offset", offset)
					comLib.updateLoadMask(offset);
					sendAuthLogListRequest();
				}
			}
		}
		//2019-11-29 신규 끝
		
		switch (oem_version) {
			case OEM_HYUNDAI_EC:
				// 커스템 데이터 가져오기	
				var dsAuthLogCustom = app.lookup("AuthLogCustomHDEC");
				dsAuthLogCustom.clear();
				
				var smsGetAuthLogCustom = app.lookup("sms_getAuthLogCustomsHDEC");
				
				var IndexKeys = "";
				for (var i = 0; i < count; i++) {
					var logInfo = dsAuthLogList.getRow(i);
					IndexKeys += logInfo.getValue("IndexKey");
					IndexKeys += ","
				}
				
				smsGetAuthLogCustom.setParameters("IndexKeys", IndexKeys);
				smsGetAuthLogCustom.send();
				break;
			default:
				break;
		}
		app.lookup("ALMGR_grp").redraw();
	} else {
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_AuthLog";
		if (errStr.length > 0) {
			errMsg = dataManager.getString(errStr);
		} else {
			errMsg = dataManager.getString(errMsg);
		}
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
	}
	app.lookup("ALMGR_grp").redraw();
}

function onSms_getAuthLogListSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getAuthLogListSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onALMGR_udcAuthLogListPagechange( /* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type udc.grid.authLogList
	 */
	var aLMGR_udcAuthLogList = e.control;
	sendAuthLogListRequest();
}

/*
 * 인풋 박스에서 keydown 이벤트 발생 시 호출.
 * 사용자가 키를 누를 때 발생하는 이벤트.
 */
function onALMGR_edtKeywordKeydown( /* cpr.events.CKeyboardEvent */ e) {
	/** 
	 * @type cpr.controls.InputBox
	 */
	var aLMGR_edtKeyword = e.control;
	
	if (e.keyCode == 13) {
		sendAuthLogListRequest();
	}
}

/*
 * 콤보 박스에서 mousedown 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 누를 때 발생하는 이벤트.
 */
function onALMGR_cmbCategoryMousedown( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var aLMGR_cmbCategory = e.control;
	if (e.keyCode == 13) {
		sendAuthLogListRequest();
	}
}

/*
 * 사용자 정의 컨트롤에서 dblclick 이벤트 발생 시 호출.
 */
function onALMGR_udcAuthLogListDblclick( /* cpr.events.CSelectionEvent */ e) {
	if (dataManager.getOemVersion() == OEM_DUKYANG_WARDOFFICE && dataManager.getAccountID() != 0xDE0B6B3A7640000) {
		return;
	}
	
	var dsAuthLogList = app.lookup("ALMGR_udcAuthLogList");
	var selectionRow = dsAuthLogList.getSelectedRow();
	
	if (selectionRow.getStateString() == "D" || selectionRow.getStateString() == "ID") {
		return;
	}
	var cmbCategory = app.lookup("ALMGR_cmbCategory");
	var edtKeyword = app.lookup("ALMGR_edtKeyword");
	
	var indexKey = selectionRow.getRowData()["IndexKey"];
	var param = [cmbCategory.value, edtKeyword.value];
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target": DLG_AUTHLOG_VIEW,
			"ID": indexKey,
			"Param": param,
		}
	});
	
	app.getHostAppInstance().dispatchEvent(selectionEvent);
	
}

// 도움말
function onALMGR_imgHelpPageClick( /* cpr.events.CMouseEvent */ e) {
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target": DLG_HELP,
			"ID": menu_id
		}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

function onALEMP_dtiExportClick( /* cpr.events.CMouseEvent */ e) {
	var totalLabel = app.lookup("ALMGR_opbTotal");
	var dmTotal = app.lookup("Total")
	var dm_ExportParam = app.lookup("dm_ExportParam")
	dm_ExportParam.setValue("mode", "export");
	dm_ExportParam.setValue("total", dmTotal.getValue("Count"));
	dm_ExportParam.setValue("offset", 0);
	comLib.showLoadMask("pro", dataManager.getString("Str_UserExport"), "", parseInt(totalLabel.value) / 1000);
	
	sendAuthLogListRequest()
}

function getLogAuthTypeString(value) {
	
	var type = "";
	switch (value) {
		case 1:
			type = dataManager.getString("Str_AuthTypeFPVerify");
			break;
		case 2:
			type = dataManager.getString("Str_AuthTypeFPIdentify");
			break;
		case 3:
			type = dataManager.getString("Str_Password");
			break;
		case 4:
			type = dataManager.getString("Str_Card");
			break;
		case 5:
			type = dataManager.getString("Str_AuthTypeFaceVerify");
			break;
		case 6:
			type = dataManager.getString("Str_AuthTypeFaceIdentify");
			break;
		case 7:
			type = dataManager.getString("Str_MobileCard");
			break;
		case 8:
			type = dataManager.getString("Str_TypeQR");
			break;
			
		case 15:
			type = dataManager.getString("Str_Inside");
			break;
		case 16:
			type = dataManager.getString("Str_NotAssigned");
			break;
			
		default:
			return "";
			break;
	}
	return type;
}

function getLogAuthResultString(value) {
	var type = "";
	switch (value) {
		case 0:
			type = dataManager.getString("Str_Success");
			break;
		case 1:
			type = dataManager.getString("Str_AuthResultFail");
			break;
		case 2:
			type = dataManager.getString("Str_AuthResultAccessDenied");
			break;
		case 3:
			type = dataManager.getString("Str_AuthResultTimeout");
			break;
		case 4:
			type = dataManager.getString("Str_AuthResultTimeoutCapture");
			break;
		case 5:
			type = dataManager.getString("Str_AuthResultTimeoutIdentify");
			break;
		case 6:
			type = dataManager.getString("Str_AuthResultAntiPassback");
			break;
			
		default:
			return "";
			break;
	}
	return type;
}

function getLogFuncType(value) {
	var type = "";
	switch (value) {
		case 0:
			type = dataManager.getString("Str_AuthLogFuncTypeAccess");
			break;
		case 1:
			type = dataManager.getString("Str_AuthLogFuncTypeTna");
			break;
		case 2:
			type = dataManager.getString("Str_AuthLogFuncTypeMeal");
			break;
			
		default:
			type = "";
			break;
	}
	return type;
}

function exportExcel() {
	
	dataManager = getDataManager();
	var dsAuthLogList = app.lookup("ExportAuthLogList");
	var total = dsAuthLogList.getRowCount();
	comLib.showLoadMask("pro", dataManager.getString("Str_UserExport"), "", total);
	for (var i = 0; i < total; i++) {
		var authLogInfo = dsAuthLogList.getRow(i);
		
		var groupName = authLogInfo.getValue("GroupName");
		//var groupName = dataManager.getGroupName(groupID);		
		authLogInfo.setValue("GroupName", groupName);
		
		var authType = authLogInfo.getValue("AuthType");
		var authTypeName = getLogAuthTypeString(parseInt(authType));
		authLogInfo.setValue("AuthType", authTypeName);
		
		var authResult = authLogInfo.getValue("AuthResult");
		var authResultName = getLogAuthResultString(parseInt(authResult));
		authLogInfo.setValue("AuthResult", authResultName);
		
		var funcType = authLogInfo.getValue("FuncType");
		var funcTypeName = getLogFuncType(parseInt(funcType));
		authLogInfo.setValue("FuncType", funcTypeName);
		// funckey
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
	var filename = "AuthLogList_" + today + ".xlsx";
	var ws_name = "AuthLogList_";
	
	var wb = XLSX.utils.book_new(),
		ws = XLSX.utils.json_to_sheet(dsAuthLogList.getRowDataRanged());
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);
	
	XLSX.writeFile(wb, filename);
	comLib.hideLoadMask();
}

/*
 * 그룹에서 dblclick 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 더블 클릭할 때 발생하는 이벤트.
 */
function onGroupDblclick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Container
	 */
	var group = e.control;
	
	var ENABLE_INNODEP_VMS = dataManager.getENABLE_INNODEP_VMS();;
	if (ENABLE_INNODEP_VMS == 1) {
		var usint_version = dataManager.getSystemVersion();
		
		var option = {
			width: 500,
			height: 500,
			right: app.getContainer().getActualRect().left / 4
		};
		
		var appld = "app/main/vmsInnodep/vmsInnodepPlayback" + "?" + usint_version;
		app.openDialog(appld, option, function(dialog) {
			
			dialog.bind("headerTitle").toLanguage("Str_AddEnterTerminal");
			
			dialog.modal = true;
			/*
			 * code : 입출구구분코드, tmp : 입출구구분코드에 따른 입출구 안티패스백 데이터셋, selectArea: 현재 사이드 그리드에서 선택된 구역의 ID값, areas: 구역목록데이터셋
			 * antipass: 안티패스백 데이터셋
			 */
			//dialog.initValue = {code: code, tmp: code=="ent"?tmpEntranceList:tmpExitList, selectArea: selectAreaRow.getValue("AreaID"),
			//					areas: app.lookup("AreaList"), antipass: app.lookup("AntipassBack")};
			dialog.addEventListenerOnce("close", function(e) {
				var result = dialog.returnValue;
				if (result) {
					
				}
			});
		});
	}
}

/*
 * "Custom" 버튼(btCustom)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtCustomClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var btCustom = e.control;
	
	switch (oem_version) {
		case OEM_HYUNDAI_EC:
			var smsSendAuthLog = app.lookup("sms_sendAuthLogsHDEC");
			
			var checkIndexList = app.lookup("ALMGR_udcAuthLogList").getAuthLogCheckRowHDEC()
			var authLogData = app.lookup("AuthLogList");
			var IndexKeys = "";
			for (var i = 0; i < checkIndexList.length; i++) {
				var authLog = authLogData.getRow(checkIndexList[i]);
				IndexKeys += authLog.getValue("IndexKey");
				if (i != checkIndexList.length - 1) {
					IndexKeys += ",";
				}
			}
			
			// console.log("IndexKeys: ", IndexKeys);
			smsSendAuthLog.setParameters("IndexKeys", IndexKeys);
			smsSendAuthLog.send();
			break;
		default:
			break;
	}
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getAuthLogCustomsHDECSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getAuthLogCustomsHDEC = e.control;
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dsAuthLogCustom = app.lookup("AuthLogCustomHDEC");
		
		var udcAuthLogList = app.lookup("ALMGR_udcAuthLogList");
		udcAuthLogList.setAuthLogCustomHDEC(dsAuthLogCustom);
	}
	
	app.lookup("ALMGR_grp").redraw();
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getAuthLogCustomsHDECSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getAuthLogCustomsHDEC = e.control;
	
	console.log("onSms_getAuthLogCustomsHDECSubmitError");
	
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_ERROR);
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getAuthLogCustomsHDECSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getAuthLogCustomsHDEC = e.control;
	
	console.log("onSms_getAuthLogCustomsHDECSubmitTimeout");
	
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
	
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_sendAuthLogsHDECSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_sendAuthLogsHDEC = e.control;
	
	var sms_getAuthLogCustomsHDEC = e.control;
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		alert('전송 요청');
		sendAuthLogListRequest();
	}
	
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_sendAuthLogsHDECSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_sendAuthLogsHDEC = e.control;
	
	console.log("onSms_sendAuthLogsHDECSubmitError");
	
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
	
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_sendAuthLogsHDECSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_sendAuthLogsHDEC = e.control;
	
	console.log("onSms_sendAuthLogsHDECSubmitTimeout");
	
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
}