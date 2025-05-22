/************************************************
 * hcsmUserGateAccessInfo.js
 * Created at 2021. 11. 10. 오후 4:01:00.
 *
 * @author zxc
 ************************************************/
var locale = "";
var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var util = cpr.core.Module.require("lib/util");
var dataManager = getDataManager();
var usint_version;

var HCSMA_pageRowCount = 17;
var HCSMA_exportCount = 100; // 사용자 내보내기시 한번에 요청 할 사용자 수

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad( /* cpr.events.CEvent */ e) {
	comLib = createComUtil(app);
	dataManager = getDataManager();
	
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "list");
	
	hcsmSetComboBox();
	hcsmSearchReset();
	SetMaxDate();
}

//사우디 hcsm 커스터마이징 ds 바인딩
function hcsmSetComboBox() {
	//Company
	var cmbCompany = app.lookup("HCSMA_cmbCompany");
	cmbCompany.deleteAllItems();
	cmbCompany.addItem(new cpr.controls.Item("----", 0));
	cmbCompany.setItemSet(dataManager.getCompanyList(), {
		label: "CompanyName",
		value: "CompanyID",
	});
	//Team
	var cmbTeam = app.lookup("HCSMA_cmbTeam");
	cmbTeam.deleteAllItems();
	cmbTeam.addItem(new cpr.controls.Item("----", 0));
	cmbTeam.setItemSet(dataManager.getTeamList(), {
		label: "TeamName",
		value: "TeamID",
	});
	
	//Part
	hcsmSetPartComboBox();
}

function hcsmSetPartComboBox() {
	var teamID = app.lookup("HCSMA_cmbTeam").value;
	
	//Part
	var cmbPart = app.lookup("HCSMA_cmbPart");
	cmbPart.deleteAllItems();
	cmbPart.addItem(new cpr.controls.Item("----", 0));
	
	//TeamID에 따른 ds 세팅 
	var dsPart = app.lookup("HCSMPart");
	dsPart.clear();
	dataManager.getPartList().copyToDataSet(dsPart);
	
	dsPart.setFilter("TeamID == " + teamID);
	cmbPart.setItemSet(dsPart, {
		label: "PartName",
		value: "PartID",
	});
	cmbPart.value = 0;
}

function onHCSMA_cmbTeamSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	hcsmSetPartComboBox();
}

// 검색 초기화 
function hcsmSearchReset() {
	var ipbEmployeeNo = app.lookup("HCSMA_ipbEmployeeNo");
	var ipbName = app.lookup("HCSMA_ipbName");
	var cmbCompany = app.lookup("HCSMA_cmbCompany");
	var cmbTeam = app.lookup("HCSMA_cmbTeam");
	var cmbPart = app.lookup("HCSMA_cmbPart");
	var cbxOnSite = app.lookup("HCSMA_cbxOnSite");
	
	ipbEmployeeNo.value = "";
	ipbName.value = "";
	cmbCompany.value = 0;
	cmbTeam.value = 0;
	cmbPart.value = 0;
	cbxOnSite.value = 0;
	
	var dtStart = app.lookup("HCSMA_dtiStart");
	var dtEnd = app.lookup("HCSMA_dtiEnd");
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	
	dtEnd.value = now.format('YYYY-MM-DD');
	dtStart.value = now.format('YYYY-MM-DD');
}

function SetMaxDate() {
	var date = new Date();
	date.setFullYear(date.getFullYear()); // y년을 더함
	date.setMonth(date.getMonth()); // m월을 더함
	date.setDate(date.getDate()); // d일을 더함
	
	app.lookup("HCSMA_dtiStart").maxDate = date;
	app.lookup("HCSMA_dtiEnd").maxDate = date;
}

// 초기화 버튼 클릭
function onHCSMA_btnResetClick( /* cpr.events.CMouseEvent */ e) {
	hcsmSearchReset();
}

// 검색 버튼 클릭
function onHCSMA_btnSearchClick( /* cpr.events.CMouseEvent */ e) {
	var udcUserList = app.lookup("HCSMA_udcAccessUserList");
	udcUserList.setCurrentPageIndex(1);
	
	var dsUserList = app.lookup("UserList");
	dsUserList.clear();
	udcUserList.setUserList(dsUserList);
	
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "list");
	setDm_SearchKeyward();
	sendUserListRequest();
}

// 서버에 사용자 리스트 요청
function sendUserListRequest() {
	var dm_SearchKeyward = app.lookup("dm_SearchKeyward");
	
	// 클라이언트 표시
	var inqueryPeriod = dm_SearchKeyward.getValue("StartTime") + " ~ " + dm_SearchKeyward.getValue("EndTime");
	app.lookup("HCSMA_optInqueryPeriod").value = inqueryPeriod;
	
	//sms 생성
	var smsGetUserList = app.lookup("sms_getUserList");
	smsGetUserList.action = "/v1/oemData/hcsm/user";
	smsGetUserList.method = "get";
	smsGetUserList.mediaType = "application/x-www-form-urlencoded";
	
	smsGetUserList.addEventListener("submit-done", onSms_getUserListSubmitDone);
	smsGetUserList.addEventListener("submit-error", onSms_getUserListSubmitError);
	smsGetUserList.addEventListener("submit-timeout", onSms_getUserListSubmitTimeout);
	
	// 검색 조건 세팅
	var searchKeyward = dm_SearchKeyward;
	smsGetUserList.setParameters("searchEmployeeNo", searchKeyward.getValue("SearchEmployeeNo"));
	smsGetUserList.setParameters("searchName", searchKeyward.getValue("SearchName"));
	smsGetUserList.setParameters("searchCompany", searchKeyward.getValue("SearchCompany"));
	smsGetUserList.setParameters("searchTeam", searchKeyward.getValue("SearchTeam"));
	smsGetUserList.setParameters("searchPart", searchKeyward.getValue("SearchPart"));
	smsGetUserList.setParameters("startTime", searchKeyward.getValue("StartTime"));
	smsGetUserList.setParameters("endTime", searchKeyward.getValue("EndTime"));
	smsGetUserList.setParameters("searchOnSite", searchKeyward.getValue("SearchOnSite"));
	
	// 페이징 계산하여 요청
	var dm_ExportParam = app.lookup("dm_ExportParam");
	var offset;
	var limit;
	
	if (dm_ExportParam.getValue("mode") == "list") {
		var udcUserList = app.lookup("HCSMA_udcAccessUserList");
		var curIndex = udcUserList.getCurrentPageIndex();
		offset = (curIndex - 1) * HCSMA_pageRowCount;
		limit = HCSMA_pageRowCount;
	} else { // 내보내기 시
		offset = dm_ExportParam.getValue("offset");
		limit = HCSMA_exportCount;
	}
	smsGetUserList.setParameters("offset", offset);
	smsGetUserList.setParameters("limit", limit);
	
	smsGetUserList.addResponseData(app.lookup("Result"), false, "Result");
	smsGetUserList.addResponseData(app.lookup("Total"), false, "Total");
	smsGetUserList.addResponseData(app.lookup("UserList"), false, "UserList");
	
	var dsUserList = app.lookup("UserList");
	dsUserList.clear();
	smsGetUserList.send();
	if (dm_ExportParam.getValue("mode") == "list") {
		comLib.showLoadMask("", dataManager.getString("Str_ListLoading"), "");
	}
}

// 사용자 리스트 가져오기 완료

function onSms_getUserListSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	
	comLib.hideLoadMask();
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dsUserList = app.lookup("UserList");
		
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		app.lookup("HCSMA_opbTotal").value = totalCount;
		
		var eventTimeInArr = dsUserList.getColumnData("EventTimeIn");
		var eventTimeOutArr = dsUserList.getColumnData("EventTimeOut");
		
		eventTimeInArr.forEach(function(each, index) {
			if (each == "0001-01-01 00:00:00") {
				dsUserList.setValue(index, "EventTimeIn", "");
			} else {
				var time = each.toString().split(" ")[1];
				dsUserList.setValue(index, "EventTimeIn", time);
			}
		});
		
		eventTimeOutArr.forEach(function(each, index) {
			if (each == "0001-01-01 00:00:00") {
				dsUserList.setValue(index, "EventTimeOut", "");
			} else {
				var time = each.toString().split(" ")[1];
				dsUserList.setValue(index, "EventTimeOut", time);
			}
		});
		
		var dm_ExportParam = app.lookup("dm_ExportParam");
		if (dm_ExportParam.getValue("mode") == "list") {
			var viewPageCount = totalCount / HCSMA_pageRowCount + (totalCount % HCSMA_pageRowCount > 0);
			if (viewPageCount > 10) {
				viewPageCount = 10;
			}
			var udcUserList = app.lookup("HCSMA_udcAccessUserList");
			
			udcUserList.setUserList(dsUserList);
			udcUserList.setPaging(totalCount, HCSMA_pageRowCount, viewPageCount);
			udcUserList.redraw();
			
			comLib.hideLoadMask();
		} else { // 내보내기
			var exportUserList = app.lookup("ExportUserList");
			
			if (dsUserList.getRowCount() == 0) {
				comLib.hideLoadMask();
				if (exportUserList.getRowCount() > 0) {
					exportExcel();
					exportUserList.clear();
				} else {
					dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
				}
			} else {
				dsUserList.copyToDataSet(exportUserList);
				if (exportUserList.getRowCount() >= dm_ExportParam.getValue("total")) {
					exportExcel();
					comLib.hideLoadMask();
					exportUserList.clear();
				} else {
					var offset = dm_ExportParam.getValue("offset");
					offset += HCSMA_exportCount;
					dm_ExportParam.setValue("offset", offset)
					comLib.updateLoadMask(offset);
					sendUserListRequest();
				}
			}
		}
		
	} else {
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

/*
 * 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
 */
function onHCSMA_udcAccessUserListPagechange( /* cpr.events.CSelectionEvent */ e) {
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "list");
	sendUserListRequest();
}

/*
	내보내기 클릭
 */
function onButtonClick2( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var totalCount = app.lookup("Total").getValue("Count");
	//	console.log("total = ", totalCount);
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "export");
	dm_ExportParam.setValue("total", totalCount);
	dm_ExportParam.setValue("offset", 0);
	if (totalCount == 0 || totalCount == "") {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorGroupNoSearchResult"));
	} else {
		comLib.showLoadMask("pro", dataManager.getString("Str_UserExport"), "", parseInt(totalCount.value) / 1000);
		sendUserListRequest();
		return;
	}
}

function exportExcel() {
	
	dataManager = getDataManager();
	var dsExportList = app.lookup("ExportUserList");
	var total = dsExportList.getRowCount()
	
	for (var i = 0; i < total; i++) {
		var userInfo = dsExportList.getRow(i);
		
		var companyID = userInfo.getValue("CompanyID");
		var companyInfo = dataManager.getCompany(parseInt(companyID));
		if (companyInfo) {
			userInfo.setValue("CompanyID", companyInfo.getValue("CompanyName"));
		} else {
			userInfo.setValue("CompanyID", "");
		}
		
		var nationalityID = userInfo.getValue("NationalityID");
		var nationalityInfo = dataManager.getNationality(parseInt(nationalityID));
		if (nationalityInfo) {
			userInfo.setValue("NationalityID", nationalityInfo.getValue("NationalityName"));
		} else {
			userInfo.setValue("NationalityID", "");
		}
		
		var teamID = userInfo.getValue("TeamID");
		var teamInfo = dataManager.getTeam(parseInt(teamID));
		if (teamInfo) {
			userInfo.setValue("TeamID", teamInfo.getValue("TeamName"));
		} else {
			userInfo.setValue("TeamID", "");
		}
		
		var partID = userInfo.getValue("PartID");
		var partInfo = dataManager.getPart(parseInt(partID));
		if (partInfo) {
			userInfo.setValue("PartID", partInfo.getValue("PartName"));
		} else {
			userInfo.setValue("PartID", "");
		}
	}
	var locale = dataManager.getLocale();
	var InputData;
	
	var stringified = JSON.stringify(dsExportList.getRowDataRanged());
	stringified = stringified.replace(/"ID"/gi, '"' + dataManager.getString("Str_ID") + '"');
	stringified = stringified.replace(/"AccessDate"/gi, '"' + dataManager.getString("Str_AccessDate") + '"');
	stringified = stringified.replace(/"EventTimeIn"/gi, '"' + dataManager.getString("Str_In") + '"');
	stringified = stringified.replace(/"EventTimeOut"/gi, '"' + dataManager.getString("Str_Out") + '"');
	stringified = stringified.replace(/"UniqueID"/gi, '"' + dataManager.getString("Str_UniqueID") + '"');
	stringified = stringified.replace(/"PassportNo"/gi, '"' + dataManager.getString("Str_PassportNo") + '"');
	stringified = stringified.replace(/"Name"/gi, '"' + dataManager.getString("Str_Name") + '"');
	stringified = stringified.replace(/"CompanyID"/gi, '"' + dataManager.getString("Str_Company") + '"');
	stringified = stringified.replace(/"NationalityID"/gi, '"' + dataManager.getString("Str_Nationality") + '"');
	stringified = stringified.replace(/"TeamID"/gi, '"' + dataManager.getString("Str_Team") + '"');
	stringified = stringified.replace(/"PartID"/gi, '"' + dataManager.getString("Str_Part") + '"');
	
	InputData = JSON.parse(stringified);
	
	/* original data */
	var today = dateLib.getToday();
	var filename = "UserList_" + today + ".xlsx";
	var ws_name = "UserList_";
	
	var wb = XLSX.utils.book_new(),
		ws = XLSX.utils.json_to_sheet(InputData);
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);
	
	XLSX.writeFile(wb, filename);
}

function setDm_SearchKeyward() {
	var startTime = app.lookup("HCSMA_dtiStart").value;
	var endTime = app.lookup("HCSMA_dtiEnd").value;
	var isStartEndDateValid = util.isStartEndDateValid(startTime, endTime);
	if (isStartEndDateValid === false) {
		dialogAlert(app.getHostAppInstance(), "error", dataManager.getString("Str_ErrorStartEndDateInvalid"));
		return false
	}
	
	var dm_SearchKeyward = app.lookup("dm_SearchKeyward");
	dm_SearchKeyward.reset();
	
	// TODO 공백 처리 해야됨
	var ipbEmployeeNo = app.lookup("HCSMA_ipbEmployeeNo").value;
	var ipbName = app.lookup("HCSMA_ipbName").value;
	var cmbCompany = app.lookup("HCSMA_cmbCompany").value;
	var cmbTeam = app.lookup("HCSMA_cmbTeam").value;
	var cmbPart = app.lookup("HCSMA_cmbPart").value;
	var cbxOnSite = app.lookup("HCSMA_cbxOnSite").value;
	
	dm_SearchKeyward.setValue("SearchEmployeeNo", ipbEmployeeNo);
	dm_SearchKeyward.setValue("SearchName", ipbName);
	dm_SearchKeyward.setValue("SearchCompany", cmbCompany);
	dm_SearchKeyward.setValue("SearchTeam", cmbTeam);
	dm_SearchKeyward.setValue("SearchPart", cmbPart);
	dm_SearchKeyward.setValue("StartTime", startTime + " 00:00:00");
	dm_SearchKeyward.setValue("EndTime", endTime + " 23:59:59");
	dm_SearchKeyward.setValue("SearchOnSite", cbxOnSite);
}

// 엔터 검색
function onHCSMA_grpSearchKeywordKeyup( /* cpr.events.CKeyboardEvent */ e) {
	if (e.keyCode == 13) { //Eneter keycode
		onHCSMA_btnSearchClick();
	}
}

/*
 * 사용자 정의 컨트롤에서 userListDblclick 이벤트 발생 시 호출.
 */
function onHCSMA_udcAccessUserListUserListDblclick( /* cpr.events.CGridEvent */ e) {
	if (e.row.getStateString() == "D" || e.row.getStateString() == "ID") {
		return;
	}
	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target": DLG_USER_INFO,
			"ID": e.row.getValue("ID"),
			"Mode": "Modify",
		}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}