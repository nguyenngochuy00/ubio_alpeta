/************************************************
 * mealStatistics.js
 * Created at 2018. 11. 14. 오후 1:22:40.
 *
 * @author joymrk
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var util = cpr.core.Module.require("lib/util");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
// 사용자 리스트 출력 - otk
var usint_version;
var MSMGR_userCntPerRequest = 2000;
var MSMGR_total = 0;

var MSSTA_pageInit = new Array(1, 1, 0, 0, 0, 0, 0); // 페이지 초기화 여부 변수. 더미, 월간 통계, 식수 집계, 그룹별 조회, 개인별 조회, 지역별 조회

// 식수 집계
var MSSTA2_selectIDMap; // 선택된 사용자 ID 보관. 그리드에서 선택된 사용자를 마킹하기 위해 쓰임
var MSSTA2_pageRowCount = 1000; // 페이지 당 사용자 수
var exportCount = 1000;
var MSSTA2_numberPerReq = 5000; // 전체 사용자 리스트 추가시 서버에 한번에 요청할 사용자 리스트 수

// 식수 기록 조회
var MSSTA3_pageRowCount = 1000;

function onBodyLoad( /* cpr.events.CEvent */ e) {
	MSSTA2_selectIDMap = new Map();
	comLib = createComUtil(app);
	dataManager = getDataManager();
	SetMaxDate();
	usint_version = dataManager.getSystemVersion();		
   var cmbDataTaype = app.lookup("CMB_MealDataType");
   cmbDataTaype.addItem(new cpr.controls.Item(dataManager.getString("Str_BreakFast"),1));
   cmbDataTaype.addItem(new cpr.controls.Item(dataManager.getString("Str_Lunch"),2));
   cmbDataTaype.addItem(new cpr.controls.Item(dataManager.getString("Str_Dinner"),3));
   cmbDataTaype.addItem(new cpr.controls.Item(dataManager.getString("Str_Snack"),4));
   cmbDataTaype.addItem(new cpr.controls.Item(dataManager.getString("Str_LateSnack"),5));
	var cmbDataTaype = app.lookup("CMB_MealDataType");
	if (dataManager.getOemVersion() == OEM_KANGWONLAND) { // 2factor 인증
		cmbDataTaype.addItem(new cpr.controls.Item(dataManager.getString("테이크 아웃"), 98));
		cmbDataTaype.addItem(new cpr.controls.Item(dataManager.getString("패스트 푸드"), 99));
		
	}
}

function SetMaxDate() {
	var date = new Date();
	date.setFullYear(date.getFullYear()); // y년을 더함
	date.setMonth(date.getMonth()); // m월을 더함
	date.setDate(date.getDate()); // d일을 더함
	
	app.lookup("MSSTA6_dtiMealRecordStart").maxDate = date;
	app.lookup("MSSTA6_dtiMealRecordEnd").maxDate = date;
	app.lookup("MSSTA5_dtiMealRecordStart").maxDate = date;
	app.lookup("MSSTA5_dtiMealRecordEnd").maxDate = date;
	app.lookup("MSSTA4_dtiMealRecordStart").maxDate = date;
	app.lookup("MSSTA4_dtiMealRecordEnd").maxDate = date;
	app.lookup("MSSTA3_dtiMealRecordStart").maxDate = date;
	app.lookup("MSSTA3_dtiMealRecordEnd").maxDate = date;
	app.lookup("MSSTA2_dtiMealProcessStart").maxDate = date;
	app.lookup("MSSTA2_dtiMealProcessEnd").maxDate = date;
}

//
function onMSSTA_dtiMealMonthValueChange( /* cpr.events.CValueChangeEvent */ e) {
	sendGetMealMonthStatic();
}

//----------------------------- Tab 컨트롤  ---------------------------------------------------
// 탭 폴더에서 selection-change 이벤트 발생 시 호출.
function onTabFolderSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/* @type cpr.controls.TabFolder	 */
	var tabFolder = e.control;
	var tabItem = tabFolder.getSelectedTabItem();
	
//	var dsGroupList = app.lookup("GroupList");
//	var groupList = dataManager.getGroup();
//	dsGroupList.addRowData({"Name":dataManager.getString("Str_All"),"GroupID":"0"});
//	groupList.copyToDataSet(dsGroupList);
//	dsGroupList.commit();		
	
	if (MSSTA_pageInit[tabItem.id] == 0) { // 초기화를 한번만 수행하기 위해 체크
		MSSTA_pageInit[tabItem.id] = 1;
		
		console.log("id : " + tabItem.id);
		
		if (tabItem.id == 2) { // 식수 집계 페이지 클릭시	
			
			initDateControlValue(app.lookup("MSSTA2_dtiMealProcessStart"), app.lookup("MSSTA2_dtiMealProcessEnd"))
			
			var udcUserSelectList = app.lookup("MSSTA2_udcUserSelectList")
			udcUserSelectList.deleteColumn([13, 12, 11, 10, 9, 8, 7, 6, 5, 4]); //APBZone,FaceIdentify...
			udcUserSelectList.setPaging(0, MSSTA2_numberPerReq, 5);
			udcUserSelectList.redraw();
			
			var udcUserTerminal = app.lookup("MSSTA2_udcUserTerminal");
			udcUserTerminal.initControl(true, false, -1, false);
			udcUserTerminal.setPageRowCount(MSSTA2_pageRowCount);
			udcUserTerminal.deleteUserColumn([14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4]);
			udcUserTerminal.hideUserButtons();
			var dsGroupList = dataManager.getGroup();
			udcUserTerminal.setGroupList(dsGroupList);
			udcUserTerminal.setSelectedGroup(0);
			
		} else if (tabItem.id == 3) { // 식수 기록 조회 페이지 클릭시
			app.lookup("GroupList").clear();
			var cmbGroup = app.lookup("MSSTA3_cmdSearchmeal");
			var dsGroupList = app.lookup("GroupList");
			var groupList = dataManager.getGroup();
			dsGroupList.addRowData({"Name":dataManager.getString("Str_All"),"GroupID":"0"});
			groupList.copyToDataSet(dsGroupList);
			dsGroupList.commit();
			
			cmbGroup.setItemSet(dsGroupList, {
				label: "Name",
				value: "GroupID",
			})
			app.lookup("MSSTA3_cmdSearchmeal").selectItem(0);
			
			sendGetMealData();	
			initDateControlValue(app.lookup("MSSTA3_dtiMealRecordStart"), app.lookup("MSSTA3_dtiMealRecordEnd"))
		} else if (tabItem.id == 4) { // 그룹별 조회 페이지 클릭시
			initDateControlValue(app.lookup("MSSTA4_dtiMealRecordStart"), app.lookup("MSSTA4_dtiMealRecordEnd"));
			app.lookup("GroupList").clear();
			
			var cmbGroup2 = app.lookup("ALMGR4_cmbGroup02");
			var dsGroupList = app.lookup("GroupList");
			var groupList = dataManager.getGroup();
			dsGroupList.addRowData({"Name":dataManager.getString("Str_All"),"GroupID":"0"});
			groupList.copyToDataSet(dsGroupList);
			dsGroupList.commit();

//			for (var i = 0; i < dsGroupList.getRowCount(); i++) {
//				var rowGroupList = dsGroupList.getRow(i);
//				var groupLevel = getLevel(dsGroupList, i ,rowGroupList.getValue("GroupID"));
//				dsGroupList.setValue(i, "Level", groupLevel);
//			}
			
//			for (var i = 0; i < dsGroupList.getRowCount(); i++) {
//				// 레벨 만큼 텍스트
//				var groupLevel = dsGroupList.getRow(i).getValue("Level");
//				console.log("groupLevel : " + groupLevel);
//				if (groupLevel > 0) {
//					var strLevel = "";
//					strLevel = generateString(groupLevel);
//					console.log("strLevel : "+ strLevel);
//					dsGroupList.setValue(i, "Name", strLevel + "  " + dsGroupList.getRow(i).getValue("Name"));
//				}
//			}
			
//			var cmbGroup1 = app.lookup("ALMGR4_cmbGroup");
			var cmbGroup2 = app.lookup("ALMGR4_cmbGroup02");
//			cmbGroup1.setItemSet(groupList, {
//					label: "Name",
//					value: "GroupID",
//			});

			cmbGroup2.setItemSet(dsGroupList, {
				label: "Name",
				value: "GroupID",
			})
			
//			app.lookup("ALMGR4_cmbGroup").selectItem(0);
			app.lookup("ALMGR4_cmbGroup02").selectItem(0);
			app.lookup("MSSTA4_rdb_location").value = 0; // 사용은 하지 않으나 설정값 0으로 지속 처리
			
		} else if (tabItem.id == 5) {
			initDateControlValue(app.lookup("MSSTA5_dtiMealRecordStart"), app.lookup("MSSTA5_dtiMealRecordEnd"));
		} else if (tabItem.id == 6) {
			console.log("test 1234");
			initDateControlValue(app.lookup("MSSTA6_dtiMealRecordStart"), app.lookup("MSSTA6_dtiMealRecordEnd"));
			app.lookup("MSSTA6_rdb_location").value = 0;
		}
		
	}
}

//----------------------------- Tab 1 월간 통계 페이지  ---------------------------------------------------
// 월간 식수 통계 요청
function sendGetMealMonthStatic() {
	comLib.showLoadMask("", dataManager.getString("Str_ListLoading"), "", 0);
	var dtiMealMonth = app.lookup("MSSTA_dtiMealMonth");
	var curDate = dtiMealMonth.calendar.current;
	
	var dsMealStaticsDay = app.lookup("MealStatisticsDay");  
	dsMealStaticsDay.clear();					// 새로 검색하면 현재 값 초기화    - mjy
	
	var sms_getMealStatistics = app.lookup("sms_getMealStatistics");
	
	sms_getMealStatistics.setParameters("Year", curDate.getFullYear());
	sms_getMealStatistics.setParameters("Month", curDate.getMonth() + 1);
	
	sms_getMealStatistics.send();
}

function initMealStatisticsControl(targetDate) {
	
	targetDate.setDate(1);
	var firstDay = targetDate.getDay(); // 달의 첫번째 요일
	var lastDate = new Date(targetDate.getYear(), targetDate.getMonth() + 1, 0);
	var lastDay = lastDate.getDate(); // 달의 마지막 날
	
	for (var day = 0; day < firstDay; day++) {
		app.lookup("MSSTA_udcD" + day).setVisible(false);
	}
	
	var dayValue = 1;
	for (var day = firstDay; day < lastDay + firstDay; day++) {
		var dayView = app.lookup("MSSTA_udcD" + day);
		dayView.setClear()
		dayView.setDay(dayValue);
		dayValue++;
		
		if (day % 7 == 6) {
			app.lookup("MSSTA_udcD" + day).setColor("#0000FF");
		} else if (day % 7 == 0) {
			app.lookup("MSSTA_udcD" + day).setColor("#FF0000");
		}
		
		dayView.setVisible(true);
	}
	for (var day = lastDay + firstDay; day < 42; day++) {
		app.lookup("MSSTA_udcD" + day).setVisible(false);
	}
	return firstDay;
}

//월간 식수 통계 수신 완료
function onSms_getMealStatisticsSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var dmResult = app.lookup("Result");
	comLib.hideLoadMask();
	if (dmResult.getValue("ResultCode") == COMERROR_NONE) {
		var sms_getMealStatistics = e.control;
		var year = sms_getMealStatistics.getParameters("Year");
		var month = sms_getMealStatistics.getParameters("Month");
		
		var statisticsDate = new Date(year, month - 1, 1);
		var offsetDay = initMealStatisticsControl(statisticsDate) - 1; // 컨트롤에서 1일을 표시할 offset 위치
		
		var dsMealStaticsDay = app.lookup("MealStatisticsDay");
		var count = dsMealStaticsDay.getRowCount();
		for (var i = 0; i < count; i++) {
			var dayResult = dsMealStaticsDay.getRow(i);
			
			var day = dayResult.getValue("Day") + offsetDay;
			var dayView = app.lookup("MSSTA_udcD" + day);
			dayView.setCount(dayResult.getValue("Type"), dayResult.getValue("Count"))
		}
		
	} else {
		//dialogAlert(app, dataManager.getString("Str_Error"), dataManager.getString("Str_UserListGet"));
		dialogAlert(app, dataManager.getString("Str_Error"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

//월간 식수 통계 수신 에러
function onSms_getMealStatisticsSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result")
	result.setValue("ResultCode", COMERROR_NET_ERROR)
}

//월간 식수 통계 수신 타임아웃
function onSms_getMealStatisticsSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result")
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT)
}

function initDateControlValue( /*cpr.controls.DateInput*/ dtiStart, /*cpr.controls.DateInput*/ dtiEnd) {
	var today = new Date();
	var month = today.getMonth() + 1;
	month = (month > 9 ? '' : '0') + month;
	var date = today.getDate();
	date = (date > 9 ? '' : '0') + date;
	dtiEnd.value = today.getFullYear() + month + date;
	dtiStart.value = today.getFullYear() + month + '01';
}

//----------------------------- Tab 2 식수 집게 페이지  ---------------------------------------------------
function onUpdateSrcUserListState() {
	var udcUserListGroup = app.lookup("MSSTA2_udcUserTerminal");
	udcUserListGroup.refreshUserList(MSSTA2_selectIDMap);
}

// 사용자 리스트에서 userListUpdate 이벤트 발생 시 호출.
function onMSSTA2_udcUserTerminalUserListUpdate( /* cpr.events.CUIEvent */ e) {
	var mSSTA2_udcUserTerminal = e.control;
	onUpdateSrcUserListState();
}

// 선택 사용자 리스트 갱신
function refreshUserSelectList() {
	var dsUserSelectList = app.lookup("UserSelectList");
	
	var selectTotal = dsUserSelectList.getRowCount();
	app.lookup("MSSTA2_optUserSelectTotal").value = selectTotal + " Users";
	
	var udcUserSelectList = app.lookup("MSSTA2_udcUserSelectList");
	udcUserSelectList.setTotalCount(selectTotal);
	
	udcUserSelectList.setPaging(selectTotal, MSSTA2_pageRowCount, 5);
	var readCount = (MSSTA2_pageRowCount - 1 > selectTotal) ? selectTotal - 1 : MSSTA2_pageRowCount - 1;
	
	var pageidx = udcUserSelectList.getCurrentPageIndex();
	var start = (pageidx - 1) * MSSTA2_pageRowCount;
	var end = pageidx * MSSTA2_pageRowCount - 1;
	if (end >= dsUserSelectList.getRowCount()) {
		end = dsUserSelectList.getRowCount() - 1;
	}
	
	udcUserSelectList.setUserListRows(dsUserSelectList.getRowDataRanged(start, end));
}

// 사용자 리스트에서 userListDblclick 이벤트 발생 시 호출. 사용자를 선택 사용자 리스트에 추가.
function onMSSTA2_udcUserTerminalUserListDblclick( /* cpr.events.CGridEvent */ e) {
	/* @type udc.grid.gridUserTerminal	 */
	var mSSTA2_udcUserTerminal = e.control;
	var rowData = e.row.getRowData();
	
	var dsUserSelectList = app.lookup("UserSelectList");
	var udcUserListGroup = app.lookup("MSSTA2_udcUserTerminal");
	
	var userID = rowData["ID"];
	
	if (MSSTA2_selectIDMap.get(userID) == undefined) {
		dsUserSelectList.addRowData(rowData);
		
		MSSTA2_selectIDMap.set(userID, 1);
		udcUserListGroup.deleteUserRow(e.row.getIndex());
	}
	
	refreshUserSelectList();
}

// ">" 버튼에서 click 이벤트 발생 시 호출. 사용자 리스트에서 체크된 사용자를 선택 사용자 리스트에 추가
function onMSSTA2_btnAddClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var mSSTA2_btnAdd = e.control;
	var dsUserSelectList = app.lookup("UserSelectList");
	
	var udcUserListGroup = app.lookup("MSSTA2_udcUserTerminal");
	var checkedIndices = udcUserListGroup.getUserCheckedRowIndices();
	checkedIndices.forEach(function(index) {
		var rowData = udcUserListGroup.getUserRowData(index);
		var userID = rowData["ID"];
		
		if (MSSTA2_selectIDMap.get(userID) == undefined) {
			dsUserSelectList.addRowData(rowData);
			
			MSSTA2_selectIDMap.set(userID, 1);
			udcUserListGroup.deleteUserRow(index);
		}
	});
	
	refreshUserSelectList();
}

// "<" 버튼에서 click 이벤트 발생 시 호출. 선택 사용자 리스트에서 체크된 사용자를  선택 해제
function onMSSTA2_btnRemoveClick( /* cpr.events.CMouseEvent */ e) {
	var dsUserSelectList = app.lookup("UserSelectList");
	
	var udcUserSelectList = app.lookup("MSSTA2_udcUserSelectList");
	var checkedIndices = udcUserSelectList.getCheckedRowIndices()
	var idList = [];
	checkedIndices.forEach(function(index) {
		var row = udcUserSelectList.getRow(index);
		var userID = row.getValue("ID");
		
		MSSTA2_selectIDMap.delete(userID);
		idList.push(userID);
	});
	
	idList.forEach(function(userID) {
		var delRow = dsUserSelectList.findFirstRow("ID == " + userID)
		dsUserSelectList.realDeleteRow(delRow.getIndex());
	});
	
	refreshUserSelectList();
	onUpdateSrcUserListState();
}

var MSSTA2_userSelectOffset;
// ">>" 버튼에서 click 이벤트 발생 시 호출. 선택된 그룹 사용자 전체를 서버에서 읽어와 선택 사용자 리스트에 추가
function onMSSTA2_btnAddAllClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var mSSTA2_btnAddAll = e.control;
	MSSTA2_userSelectOffset = 0;
	
	var udcUserListGroup = app.lookup("MSSTA2_udcUserTerminal");
	var totalCount = udcUserListGroup.getTotalCount();
	
	comLib.showLoadMask("pro", dataManager.getString("Str_UserSelect"), "", totalCount / MSSTA2_numberPerReq);
	
	sendUserListRequestAll();
}

// 서버에 사용자 리스트 요청
function sendUserListRequestAll() {
	var udcUserList = app.lookup("MSSTA2_udcUserTerminal");
	var group = udcUserList.getSelectedGroup();
	
	var smsGetUserList = app.lookup("sms_getUserListAll");
	
	// 검색 조건 세팅	
	smsGetUserList.setParameters("searchKeyword", udcUserList.searchKeyword);
	if (udcUserList.searchKeyword != undefined && udcUserList.searchKeyword.length > 0) {
		smsGetUserList.setParameters("searchCategory", udcUserList.searchCategory);
	} else {
		smsGetUserList.setParameters("searchCategory", "");
	}
	if (group != undefined && group.value != "") {
		smsGetUserList.setParameters("groupID", parseInt(group.value, 10));
	} else {
		smsGetUserList.setParameters("groupID", 0);
	}
	smsGetUserList.setParameters("subInclude", "true");
	smsGetUserList.setParameters("excludeGroup", -1);
	
	// 페이징 계산하여 요청
	smsGetUserList.setParameters("offset", MSSTA2_userSelectOffset);
	smsGetUserList.setParameters("limit", MSSTA2_numberPerReq);
	
	//console.log("send req : offset "+userSelectOffset)
	
	MSSTA2_userSelectOffset += MSSTA2_numberPerReq;
	
	var fields = ["user_id", "name"];
	smsGetUserList.setParameters("fields", fields);
	smsGetUserList.send();
}

// 사용자 리스트 가져오기 완료
function onSms_getUserListAllSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/* @type cpr.protocols.Submission	 */
	var sms_getUserListAll = e.control;
	var dmResult = app.lookup("Result");
	if (dmResult.getValue("ResultCode") == COMERROR_NONE) {
		
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		
		var dsUserSelectList = app.lookup("UserSelectList");
		var dsUserList = app.lookup("UserList");
		
		var recvCount = dsUserList.getRowCount();
		for (var i = 0; i < recvCount; i++) {
			var row = dsUserList.getRow(i);
			var userID = row.getValue("ID");
			
			if (MSSTA2_selectIDMap.get(userID) == undefined) {
				dsUserSelectList.addRowData(row.getRowData());
				MSSTA2_selectIDMap.set(userID, 1);
			}
		}
		
		if (MSSTA2_userSelectOffset < totalCount) {
			var msg = dataManager.getString("Str_UserListGet") + MSSTA2_userSelectOffset + "/" + totalCount;
			comLib.updateLoadMask(msg);
			sendUserListRequestAll();
		} else {
			comLib.hideLoadMask();
			refreshUserSelectList();
			onUpdateSrcUserListState();
		}
	} else {
		//dialogAlert(app, dataManager.getString("Str_Error"), dataManager.getString("Str_UserListGet"));
		dialogAlert(app, dataManager.getString("Str_Error"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

/// 사용자 리스트 가져오기 에러
function onSms_getUserListAllSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result")
	result.setValue("ResultCode", COMERROR_NET_ERROR)
}

// 사용자 리스트 가져오기 타임아웃
function onSms_getUserListAllSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result")
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT)
}

// 선택 사용자 리스트 더블 클릭시. 더블 클릭된 사용자 선택 사용자 리스트에서 해제
function onMSSTA2_udcUserSelectListUserListDblclick( /* cpr.events.CGridEvent */ e) {
	/** 
	 * @type udc.grid.userList
	 */
	var mSSTA2_udcUserSelectList = e.control;
	var dsUserSelectList = app.lookup("UserSelectList");
	
	var udcUserSelectList = app.lookup("MSSTA2_udcUserSelectList");
	
	var rowData = e.row.getRowData();
	var userID = rowData["ID"];
	
	MSSTA2_selectIDMap.delete(userID);
	
	var delRow = dsUserSelectList.findFirstRow("ID == " + userID)
	dsUserSelectList.realDeleteRow(delRow.getIndex());
	
	udcUserSelectList.setUserList(dsUserSelectList);
	
	refreshUserSelectList();
	onUpdateSrcUserListState();
}

// "<<" 버튼에서 click 이벤트 발생 시 호출. 선택 사용자 리스트 전체 해제
function onMSSTA2_btnRemoveAllClick( /* cpr.events.CMouseEvent */ e) {
	/* @type cpr.controls.Button */
	var mSSTA2_btnRemoveAll = e.control;
	MSSTA2_selectIDMap.forEach(function(value, key) {
		MSSTA2_selectIDMap.delete(key);
	});
	
	var dsUserSelectList = app.lookup("UserSelectList");
	dsUserSelectList.clear();
	
	var udcUserSelectList = app.lookup("MSSTA2_udcUserSelectList");
	udcUserSelectList.clearUserList();
	
	refreshUserSelectList();
	onUpdateSrcUserListState();
}

// 수동 집계 처리 클릭시
function onMSSTA2_btnMealProcessClick( /* cpr.events.CMouseEvent */ e) {
	var startTime = app.lookup("MSSTA2_dtiMealProcessStart").value;
	var endTime = app.lookup("MSSTA2_dtiMealProcessEnd").value;
	var isStartEndDateValid = util.isStartEndDateValid(startTime, endTime);
	if (isStartEndDateValid === false) {
		dialogAlert(app.getHostAppInstance(), "error", dataManager.getString("Str_ErrorStartEndDateInvalid"));
		return false
	}
	
	var dsUserSelectList = app.lookup("UserSelectList");
	
	var total = dsUserSelectList.getRowCount()
	var dmMealProcessSetting = app.lookup("MealProcessSetting")
	dmMealProcessSetting.setValue("TaskID", -1);
	dmMealProcessSetting.setValue("Total", total);
	dmMealProcessSetting.setValue("Process", 0);
	dmMealProcessSetting.setValue("StartAt", app.lookup("MSSTA2_dtiMealProcessStart").text);
	dmMealProcessSetting.setValue("EndAt", app.lookup("MSSTA2_dtiMealProcessEnd").text);
	
	if (sendMealProcess() == true) {
		comLib.showLoadMask("pro", dataManager.getString("Str_Info"), dataManager.getString("Str_MealProcess"), total);
	}
}

// 수동 집계 처리 서버에 요청
function sendMealProcess() {
	
	var dmMealProcessSetting = app.lookup("MealProcessSetting")
	
	var dsUserSelectList = app.lookup("UserSelectList");
	var total = dsUserSelectList.getRowCount();
	var offset = dmMealProcessSetting.getValue("Process");
	
	if (offset >= total) {
		return false;
	}
	comLib.updateLoadMask(total - offset + "/" + total);
	var sendCount = offset + MSSTA2_numberPerReq
	if (sendCount > total) {
		sendCount = total;
	}
	var dsUserIDList = app.lookup("UserIDList");
	dsUserIDList.clear();
	dsUserIDList.build(dsUserSelectList.getRowDataRanged(offset, sendCount - 1));
	console.log(offset, sendCount, dsUserIDList.getRowDataRanged());
	dmMealProcessSetting.setValue("Process", sendCount);
	
	var sms_postMealProcess = app.lookup("sms_postMealProcess");
	sms_postMealProcess.send();
	
	return true;
}

// 수동 집계 처리 완료
function onSms_postMealProcessSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	
	var dmResult = app.lookup("Result");
	if (dmResult.getValue("ResultCode") == COMERROR_NONE) {
		
		var dmMealProcessSetting = app.lookup("MealProcessSetting")
		var taskID = dmMealProcessSetting.getValue("TaskID");
		if (taskID == -1) {
			var dmTaskID = app.lookup("TaskID").getValue("ID");
			dmMealProcessSetting.setValue("TaskID", dmTaskID);
		}
		
		if (sendMealProcess() == false) {
			comLib.hideLoadMask();
		}
	} else {
		comLib.hideLoadMask();
		//dialogAlert(app, dataManager.getString("Str_Error"), dataManager.getString("Str_ManualMealProcess"));
		dialogAlert(app, dataManager.getString("Str_Error"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

// 수동 집계 처리 에러
function onSms_postMealProcessSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result")
	result.setValue("ResultCode", COMERROR_NET_ERROR)
}

// 수동 집계 처리 타임아웃
function onSms_postMealProcessSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result")
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT)
}

//----------------------------- Tab 3 식수 기록 조회 페이지  ---------------------------------------------------
// 검색 버튼 클릭시.
function onMSSTA3_btnRecordSearchClick( /* cpr.events.CMouseEvent */ e) {
	var startTime = app.lookup("MSSTA3_dtiMealRecordStart").value;
	var endTime = app.lookup("MSSTA3_dtiMealRecordEnd").value;
	var isStartEndDateValid = util.isStartEndDateValid(startTime, endTime);
	if (isStartEndDateValid === false) {
		dialogAlert(app.getHostAppInstance(), "error", dataManager.getString("Str_ErrorStartEndDateInvalid"));
		return false
	}
	
	var pageIndexer = app.lookup("MSSTA3_piMealRecord");
	pageIndexer.currentPageIndex = 1;
	sendGetMealResultList();
}

function sendGetMealResultList() {
	comLib.showLoadMask("", dataManager.getString("Str_ListLoading"), "", 0);
	app.lookup("MealResult").clear();
	var exportParam = app.lookup("ExportParam");
	var sms_getMealResultList = app.lookup("sms_getMealResultList");
	var dtiRecordStart = app.lookup("MSSTA3_dtiMealRecordStart");
	var dtiRecordEnd = app.lookup("MSSTA3_dtiMealRecordEnd");
	sms_getMealResultList.setParameters("StartAt", dtiRecordStart.text);
	sms_getMealResultList.setParameters("EndAt", dtiRecordEnd.text);
//	sms_getMealResultList.setParameters("Keyword", mealdatacode);	// 끼니별 식수 조회 기능 추가 - otk

	var cmbGroup = app.lookup("MSSTA3_cmdSearchmeal");
	sms_getMealResultList.setParameters("Keyword", cmbGroup.value);
	
	//조회 시
	if (exportParam.getValue("mode") !== "export") {
		var curIndex = app.lookup("MSSTA3_piMealRecord").currentPageIndex;
		var offset = (curIndex - 1) * MSSTA3_pageRowCount;
		
		sms_getMealResultList.setParameters("offset", offset);
		sms_getMealResultList.setParameters("limit", MSSTA3_pageRowCount);
		//wogus	
	} else { // 엑셀 내보내기 시
		sms_getMealResultList.setParameters("offset", exportParam.getValue("offset"));
		sms_getMealResultList.setParameters("limit", exportCount);
	}
	sms_getMealResultList.send();
}

function sendGetMealData() {
	var sms_getMealDataList = app.lookup("sms_getMealDataList");
	sms_getMealDataList.send();
}

// 식수 결과 조회 완료
function onSms_getMealResultListSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var dmResult = app.lookup("Result");
	comLib.hideLoadMask();
	
	if (dmResult.getValue("ResultCode") == COMERROR_NONE) {
		var dmExportParam = app.lookup("ExportParam");
		var dsMealResult = app.lookup("MealResult");
		var dmTotal = app.lookup("Total");		
		var totalCount = parseInt(dmTotal.getValue("Count"));
		var MealResultGrid = app.lookup("CMB_MealDataType");
		var MealdateCdName = ""; var mealdatacode = "";
					
		//리스트 조회 시
		if (dmExportParam.getValue("mode") !== "export") {
			var recvCount = dsMealResult.getRowCount();
			var viewPageCount = totalCount / MSSTA3_pageRowCount + (totalCount % MSSTA3_pageRowCount > 0);
			if (viewPageCount > 10) {
				viewPageCount = 10;
			}
			var pageIndexer = app.lookup("MSSTA3_piMealRecord");
			pageIndexer.totalRowCount = totalCount; //전체 데이터 수.	
			pageIndexer.pageRowCount = MSSTA3_pageRowCount; //한 페이지에 보여 줄 행의 수
			pageIndexer.viewPageCount = viewPageCount; // 보여지는 페이지 수(하단 부 인덱스 수)
			
			if (totalCount == 0) {
				pageIndexer.visible = false;
			} else {
				pageIndexer.visible = true;
			}
		
			//wogus
		} else { //내보내기 시
			var exMealResult = app.lookup("MealResultEx");
			dsMealResult.copyToDataSet(exMealResult);
			if (exMealResult.getRowCount() < totalCount) {
				//offset 더해서 다시 보내기
				dmExportParam.setValue("offset", dmExportParam.getValue("offset") + exportCount);
				sendGetMealResultList();
			} else {
				//그만 보내고 엑셀 내보내기
				exportExcel();
				exMealResult.clear();
				dmExportParam.setValue("mode", "list");
				sendGetMealResultList();
			}
			
		}
		
	} else {
		comLib.hideLoadMask();
		//dialogAlert(app, dataManager.getString("Str_Error"), dataManager.getString("Str_ListLoading"));
		dialogAlert(app, dataManager.getString("Str_Error"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

// 식수 결과 조회 에러
function onSms_getMealResultListSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result")
	result.setValue("ResultCode", COMERROR_NET_ERROR)
}

// 식수 결과 조회 타임아웃
function onSms_getMealResultListSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result")
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT)
}

// 식수 결과 페이지 인덱스 변경시
function onMSSTA3_piMealRecordSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	var mSSTA3_piMealRecord = e.control;
	sendGetMealResultList();
}

// 도움말 페이지 클릭
function onImageClick( /* cpr.events.CMouseEvent */ e) {
	var menu_id = app.getHostProperty("initValue")["programID"]; // mainManager.module.js ExecuteMenu <- 셋팅	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target": DLG_HELP,
			"ID": menu_id
		}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

/*
 * 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var dm_ExportParam = app.lookup("ExportParam");
	dm_ExportParam.setValue("mode", "export");
	var total = app.lookup("Total").getValue("Count");
	if (total == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
		return;
	}
	dm_ExportParam.setValue("offset", 0);
	dm_ExportParam.setValue("total", total);
	var totalStep = total / exportCount + (total % exportCount != 0) ? 1 : 0;
	comLib.showLoadMask("pro", dataManager.getString("Str_DataExport"), "", totalStep);
	
	sendGetMealResultList();
}

function exportExcel() {
	var dsMealResultEx = app.lookup("MealResultEx");
	var total = dsMealResultEx.getRowCount();
	
	var typeInt;
	var typeVal;
	var resultInt;
	var resultVal;
	for (var i = 0; i < total; i++) {
		var info = dsMealResultEx.getRow(i);
		typeInt = Number(info.getValue("Type"));
		switch(typeInt) {
			case 1:
				typeVal = dataManager.getString("Str_BreakFast");
				break;
			case 2:
				typeVal = dataManager.getString("Str_Lunch");
				break;
			case 3:
				typeVal = dataManager.getString("Str_Dinner");
				break;
			case 4:
				typeVal = dataManager.getString("Str_Snack");
				break;
			case 5:
				typeVal = dataManager.getString("Str_LateSnack");
				break;
			default:
				typeVal = "";
				break;
		}
		resultInt = Number(info.getValue("Result"));
		switch(resultInt) {
			case 0:
				resultVal = dataManager.getString("Str_Success");
				break;
			case 1:
				resultVal = dataManager.getString("Str_UnRegistUser");
				break;
			case 2:
				resultVal = dataManager.getString("Str_MatchingFail");
				break;
			case 11:
				resultVal = dataManager.getString("Str_MenuPriceNotExist");
				break;
			case 12:
				resultVal = dataManager.getString("Str_MealTimeNotValid");
				break;
			case 13:
				resultVal = dataManager.getString("Str_MealCodeNotExist");
				break;
			case 14:
				resultVal = dataManager.getString("Str_MealPeriodLimit");
				break;
			case 15:
				resultVal = dataManager.getString("Str_MealTypeCountLimit");
				break;
			case 16:
				resultVal = dataManager.getString("Str_MealDayCountLimit");
				break;
			case 17:
				resultVal = dataManager.getString("Str_MealMonthCountLimit");
				break;
			default:
				resultVal = "";
				break;
		}
		
		info.setValue("Type", typeVal);
		info.setValue("Result", resultVal);
	}
	
	var stringified = JSON.stringify(dsMealResultEx.getRowDataRanged());
	stringified = stringified.replace(/"DateTime"/gi, '"' + dataManager.getString("Str_MealResultTime") + '"');
	stringified = stringified.replace(/"TerminalID"/gi, '"' + dataManager.getString("Str_TerminalID") + '"');
	stringified = stringified.replace(/"TerminalName"/gi, '"' + dataManager.getString("Str_TerminalName") + '"');
	stringified = stringified.replace(/"UserID"/gi, '"' + dataManager.getString("Str_UserID") + '"');
	stringified = stringified.replace(/"UniqueID"/gi, '"' + dataManager.getString("Str_UniqueID") + '"');
	stringified = stringified.replace(/"Name"/gi, '"' + dataManager.getString("Str_UserName") + '"');
	stringified = stringified.replace(/"GroupName"/gi, '"' + dataManager.getString("Str_GroupName") + '"');
	stringified = stringified.replace(/"Type"/gi, '"' + dataManager.getString("Str_MealDataType") + '"');
	stringified = stringified.replace(/"Menu"/gi, '"' + dataManager.getString("Str_MenuName") + '"');
	stringified = stringified.replace(/"Pay"/gi, '"' + dataManager.getString("Str_Price") + '"');
	stringified = stringified.replace(/"Result"/gi, '"' + dataManager.getString("Str_MealResult") + '"');
	
	var inputData = JSON.parse(stringified);
	
	var today = dateLib.getToday();
	var filename = "Meal_Result" + today + ".xlsx";
	var ws_name = "Meal_Result";
	
	var wb = XLSX.utils.book_new(),
		ws = XLSX.utils.json_to_sheet(inputData);
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);
	
	XLSX.writeFile(wb, filename);
}

// 끼니 정보 가져오기 - otk
function onSms_getMealDataListSubmitDone(/* cpr.events.CSubmissionEvent */ e){

	var sms_getMealDataList = e.control;
		var dsMealData = app.lookup("MealData");
		var mealDataCount = dsMealData.getRowCount();
}

//----------------------------- Tab 4 그룹별 조회 기능  ---------------------------------------------------

// 조회 클릭 
function onMSSTA4_btnRecordSearchClick(/* cpr.events.CMouseEvent */ e){
	var startTime = app.lookup("MSSTA4_dtiMealRecordStart").value;
	var endTime = app.lookup("MSSTA4_dtiMealRecordEnd").value;
	var isStartEndDateValid = util.isStartEndDateValid(startTime, endTime);
	if (isStartEndDateValid === false) {
		dialogAlert(app.getHostAppInstance(), "error", dataManager.getString("Str_ErrorStartEndDateInvalid"));
		return false
	}
	
	var dmTotal = app.lookup("Total")
	var dm_ExportParam = app.lookup("ExportParam");
	dm_ExportParam.setValue("mode", "export");
	dm_ExportParam.setValue("total", dmTotal.getValue("Count"));
	dm_ExportParam.setValue("offset", 0);
	dm_ExportParam.setValue("mode", "list");

	comLib.showLoadMask("pro", "식수 결과 조회", "", parseInt(dmTotal.getValue("Count")) / 1000);
	sendGetGroupListMealResultList();
	return;
}

// 서버에 전송 
function sendGetGroupListMealResultList(){
	
	app.lookup("GroupMealResult").clear();
	var dtiRecordStart = app.lookup("MSSTA4_dtiMealRecordStart");
	var dtiRecordEnd = app.lookup("MSSTA4_dtiMealRecordEnd");
//	var category = "group";//app.lookup("ALMGR4_cmbGroup").value;
	var keyword = app.lookup("ALMGR4_cmbGroup02").value;
	var checkSubGroup = app.lookup("ALMGR4_cbxViewSubGroup").value;
	var rdbLocation = app.lookup("MSSTA4_rdb_location").value;
	
	var sms_getGroupMealResultList = app.lookup("sms_getGroupMealResultList");
	
	sms_getGroupMealResultList.setParameters("StartAt", dtiRecordStart.text); 
	sms_getGroupMealResultList.setParameters("EndAt", dtiRecordEnd.text);
//	sms_getGroupMealResultList.setParameters("searchCategory", category);
	sms_getGroupMealResultList.setParameters("searchKeyword", keyword);
	if (keyword == null || keyword.length == 0) {
		sms_getGroupMealResultList.setParameters("searchCategory", "");
	}
	sms_getGroupMealResultList.setParameters("IsInclude", checkSubGroup);
	sms_getGroupMealResultList.setParameters("reserved", rdbLocation);
//	console.log(checkSubGroup);
	
	var dm_ExportParam = app.lookup("ExportParam");
	if (dm_ExportParam.getValue("mode") == "list") {
		//var curIndex = app.lookup("MSSTA4_piMealRecord").currentPageIndex;
		var curIndex = 1;
		var offset = (curIndex - 1) * MSSTA3_pageRowCount;
		sms_getGroupMealResultList.setParameters("offset", 0);
		sms_getGroupMealResultList.setParameters("limit", 100000);
	} else {
		sms_getGroupMealResultList.setParameters("offset", 0);
		sms_getGroupMealResultList.setParameters("limit", 100000);
	}
	
	// 그룹추가.
	sms_getGroupMealResultList.send();
	if (dm_ExportParam.getValue("mode") == "list") {
			comLib.showLoadMask("",dataManager.getString("Str_ListLoading"),"",0);
	}else {
		dm_ExportParam.getValue("mode") = "list"
	}
}

function onSms_getGroupMealResultListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var sms_getGroupMealResultList = e.control;
	
	var dmResult = app.lookup("Result");
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		var dsMealResult = app.lookup("GroupMealResult");
//		console.log(dsMealResult.getRowDataRanged());
		
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		var totalRowCount = 0;
		for(var i =0; i<totalCount; i++){
			var logInfo = dsMealResult.getRow(i);
			var struid = logInfo.getValue("UserID");
			if (struid == "-1") {
				struid = " "; // 합계, 총합계 처리 시 -1 -> "" 변경
				logInfo.setValue("UserID", struid);
				totalRowCount++;
			}
			
			var strgroupcode = logInfo.getValue("GroupCode");
			if (strgroupcode == "999999999") {
				strgroupcode = " ";
				logInfo.setValue("GroupCode", strgroupcode);
			}
		}
		// 총계, 총합계 빼기. view
		app.lookup("MSSTA4_optTotalCnt").value = totalCount - totalRowCount;
		////////////////////////////
		var dm_ExportParam = app.lookup("ExportParam");
		if (dm_ExportParam.getValue("mode") == "list") {
			comLib.hideLoadMask();
			var viewPageCount = totalCount / MSSTA3_pageRowCount + (totalCount % MSSTA3_pageRowCount > 0);
			if (viewPageCount > 10) {
				viewPageCount = 10;
			}
			//var pageIndexer = app.lookup("MSSTA4_piMealRecord");
			//pageIndexer.totalRowCount = totalCount;//전체 데이터 수.	
			//pageIndexer.pageRowCount = 100000;//한 페이지에 보여 줄 행의 수
			//pageIndexer.viewPageCount = 1;// 보여지는 페이지 수(하단 부 인덱스 수)
		} else {
			var exportGroupSumMealResultByExcel = app.lookup("ExportGroupMealResultByExcel");
			if(dsMealResult.getRowCount() == 0) {
				comLib.hideLoadMask();
				if(exportGroupSumMealResultByExcel.getRowCount() > 0) {
					exportExcel();
					exportGroupSumMealResultByExcel.clear();
				} else {
					dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
				}
			} else {
				for (var i = 0; i < dsMealResult.getRowCount(); i++) {
					var row = exportGroupSumMealResultByExcel.pushRowData(dsMealResult.getRowData(i));
				}

				if(exportGroupSumMealResultByExcel.getRowCount() >= dm_ExportParam.getValue("total")) {
					exportExcel_GroupMealcnt();
					comLib.hideLoadMask();
					exportGroupSumMealResultByExcel.clear();
				} else {
					var offset = dm_ExportParam.getValue("offset");
					offset += MSSTA3_pageRowCount;
					dm_ExportParam.setValue("offset", offset);
					comLib.updateLoadMask(offset);
					sendGetGroupListMealResultList();
				}	
			}
		}	
	} else {
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Error"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
	
	app.lookup("MSSTA4_grdMealResult").redraw();
}

function onSms_getGroupMealResultListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){

	var sms_getGroupMealResultList = e.control;
	var result = app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
	
}

function onSms_getGroupMealResultListSubmitError(/* cpr.events.CSubmissionEvent */ e){

	var sms_getGroupMealResultList = e.control;
	var result = app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
	
}

function exportExcel_GroupMealcnt(){
        
    dataManager = getDataManager();
	var exportMealResultByExcel = app.lookup("ExportGroupMealResultByExcel");
	var total = exportMealResultByExcel.getRowCount();
	comLib.showLoadMask("pro",dataManager.getString("Str_UserExport"),"",total);
	
	/* original data */
	var today = dateLib.getToday();
	var filename = "GroupMealResult_"+today+".xlsx";	
	var ws_name = "GroupMealResult_";
		
	var wb = XLSX.utils.book_new(), ws = XLSX.utils.json_to_sheet(exportMealResultByExcel.getRowDataRanged());
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);

	XLSX.writeFile(wb, filename);	
	comLib.hideLoadMask();
}

/*
 * 버튼(MSSTA4_btnExcel)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onMSSTA4_btnExcelClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var mSSTA4_btnExcel = e.control;
	var dm_ExportParam = app.lookup("ExportParam");
	dm_ExportParam.setValue("mode", "export");
	var total = app.lookup("Total").getValue("Count");
	if (total == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
		return;
	}
	dm_ExportParam.setValue("offset", 0);
	dm_ExportParam.setValue("total", total);
	var totalStep = total / exportCount + (total % exportCount != 0) ? 1 : 0;
	comLib.showLoadMask("pro", dataManager.getString("Str_DataExport"), "", totalStep);
	
	sendGetGroupListMealResultList();
}


//----------------------------- Tab 5 개인별 조회 기능  ---------------------------------------------------

function onOnMSMGR_btnUserMealSetClick(/* cpr.events.CMouseEvent */ e){
		
	var dsGroupList = app.lookup("GroupList");
	app.lookup("UserIDSendList").clear();
	var appld = "app/main/users/UserSelect" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {width : 960, height : 500}, function(dialog){
		dialog.initValue = {"GroupList":dsGroupList,"ExcludeGroup":-1};
		dialog.userAttr({
			"appName" : "mealPersonal"
		});
		dialog.bind("headerTitle").toLanguage("Str_UserSelect");
		dialog.modal = true;
	}).then(function(idMap){
		var dsUserIDSendList = app.lookup("UserIDSendList");
		dsUserIDSendList.clear();
		console.log(idMap);
		idMap.forEach(function(value,key){
			dsUserIDSendList.addRowData({
				"ID": key,
				"Name": value,
			});
		});
		var UserCnt = dsUserIDSendList.getRowCount();
		if (UserCnt > 2) { // 한명만 등록 하도록 기능 수정
			//console.log("UserCnt :" + UserCnt);
			return;
		} else {
			//console.log(dsUserIDSendList.getRowDataRanged());
			var cmbUser = app.lookup("ALMGR5_cmbUser");
			cmbUser.deleteAllItems();
			for (var i = 0; i < UserCnt; i++){
				cmbUser.addItem(new cpr.controls.MenuItem(dsUserIDSendList.getValue(i, "Name"), dsUserIDSendList.getValue(i, "ID")));
			}
//			cmbUser.setItemSet(dsUserIDSendList, {
//					label: "Name",
//					value: "ID",
//			});
			app.lookup("ALMGR5_cmbUser").selectItem(0);
		}
	});
}

function onMSSTA5_btnRecordSearchClick(/* cpr.events.CMouseEvent */ e){
	
	var mSSTA5_btnRecordSearch = e.control;
	
	var dmTotal = app.lookup("Total")
	var dm_ExportParam = app.lookup("ExportParam");
	dm_ExportParam.setValue("total", dmTotal.getValue("Count"));
	dm_ExportParam.setValue("offset", 0);
	dm_ExportParam.setValue("mode", "list");

	comLib.showLoadMask("pro", "식수 결과 조회", "", parseInt(dmTotal.getValue("Count")) / 1000);
	sendGetUserListMealResultList();
	return;
}

function sendGetUserListMealResultList() {
	
	app.lookup("UserMealResult").clear();
	var dtiRecordStart = app.lookup("MSSTA5_dtiMealRecordStart");
	var dtiRecordEnd = app.lookup("MSSTA5_dtiMealRecordEnd");
	var keyword = app.lookup("ALMGR5_cmbUser").value;
	
	var sms_getUserMealResultList = app.lookup("sms_getUserMealResultList");
	
	sms_getUserMealResultList.setParameters("StartAt", dtiRecordStart.text); 
	sms_getUserMealResultList.setParameters("EndAt", dtiRecordEnd.text);
	sms_getUserMealResultList.setParameters("searchKeyword", keyword);
	if (keyword == null || keyword.length == 0) {
		sms_getUserMealResultList.setParameters("searchCategory", "");
	}
	
	var dm_ExportParam = app.lookup("ExportParam");
	if (dm_ExportParam.getValue("mode") == "list") {
		//var curIndex = app.lookup("MSSTA4_piMealRecord").currentPageIndex;
		var curIndex = 1;
		var offset = (curIndex - 1) * MSSTA3_pageRowCount;
		sms_getUserMealResultList.setParameters("offset", 0);
		sms_getUserMealResultList.setParameters("limit", 100000);
	} else {
		sms_getUserMealResultList.setParameters("offset", 0);
		sms_getUserMealResultList.setParameters("limit", 100000);
	}
	
	// 그룹추가.
	sms_getUserMealResultList.send();
	if (dm_ExportParam.getValue("mode") == "list") {
			comLib.showLoadMask("",dataManager.getString("Str_ListLoading"),"",0);
	}else {
		dm_ExportParam.getValue("mode") = "list"
	}
	
}

function onSms_getUserMealResultListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var sms_getUserMealResultList = e.control;
	
	var dmResult = app.lookup("Result");
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		var dsMealResult = app.lookup("UserMealResult");
		console.log(dsMealResult.getRowDataRanged());
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		var totalRowCount = 0;
		for(var i =0; i<totalCount; i++){
			var logInfo = dsMealResult.getRow(i);
			
			var strDatetime = logInfo.getValue("DateTime");
			if (strDatetime == "1900-01-01 00:00:00") {
				strDatetime = "Total";
				logInfo.setValue("DateTime", strDatetime);
				totalRowCount += 1;
			}
		}
		
		////////////////////////////
		var dm_ExportParam = app.lookup("ExportParam");
		if (dm_ExportParam.getValue("mode") == "list") {
			comLib.hideLoadMask();
			var viewPageCount = totalCount / MSSTA3_pageRowCount + (totalCount % MSSTA3_pageRowCount > 0);
			if (viewPageCount > 10) {
				viewPageCount = 10;
			}
			//var pageIndexer = app.lookup("MSSTA4_piMealRecord");
			//pageIndexer.totalRowCount = totalCount;//전체 데이터 수.	
			//pageIndexer.pageRowCount = 100000;//한 페이지에 보여 줄 행의 수
			//pageIndexer.viewPageCount = 1;// 보여지는 페이지 수(하단 부 인덱스 수)
			if (totalCount > 1){
				app.lookup("MSSTA5_optTotalCnt").value = totalCount - totalRowCount;
			}
			comLib.hideLoadMask();
		} else {
			var exportUserSumMealResultByExcel = app.lookup("ExportUserMealResultByExcel");
			if(dsMealResult.getRowCount() == 0) {
				comLib.hideLoadMask();
				if(exportUserSumMealResultByExcel.getRowCount() > 0) {
					exportExcel();
					exportUserSumMealResultByExcel.clear();
				} else {
					dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
				}
			} else {
				for (var i = 0; i < dsMealResult.getRowCount(); i++) {
					var row = exportUserSumMealResultByExcel.pushRowData(dsMealResult.getRowData(i));
				}

				if(exportUserSumMealResultByExcel.getRowCount() >= dm_ExportParam.getValue("total")) {
					exportExcel_UserMealcnt();
					comLib.hideLoadMask();
					exportUserSumMealResultByExcel.clear();
				} else {
					var offset = dm_ExportParam.getValue("offset");
					offset += MSSTA3_pageRowCount;
					dm_ExportParam.setValue("offset", offset);
					comLib.updateLoadMask(offset);
					sendGetUserListMealResultList();
				}	
			}
		}	
	} else {
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Error"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
	
	app.lookup("MSSTA4_grdMealResult").redraw();
	
}

function onSms_getUserMealResultListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var sms_getUserMealResultList = e.control;
	var result = app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

function onSms_getUserMealResultListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var sms_getUserMealResultList = e.control;
	var result = app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	var button = e.control;
	var dm_ExportParam = app.lookup("ExportParam");
	dm_ExportParam.setValue("mode", "export");
	var total = app.lookup("Total").getValue("Count");
	if (total == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
		return;
	}
	dm_ExportParam.setValue("offset", 0);
	dm_ExportParam.setValue("total", total);
	var totalStep = total / exportCount + (total % exportCount != 0) ? 1 : 0;
	comLib.showLoadMask("pro", dataManager.getString("Str_DataExport"), "", totalStep);
	
	sendGetUserListMealResultList();
}

function exportExcel_UserMealcnt(){
        
    dataManager = getDataManager();
	var exportMealResultByExcel = app.lookup("ExportUserMealResultByExcel");
	var total = exportMealResultByExcel.getRowCount();
	comLib.showLoadMask("pro",dataManager.getString("Str_UserExport"),"",total);
	
	/* original data */
	var today = dateLib.getToday();
	var filename = "UserMealResult_"+today+".xlsx";	
	var ws_name = "UserMealResult_";
		
	var wb = XLSX.utils.book_new(), ws = XLSX.utils.json_to_sheet(exportMealResultByExcel.getRowDataRanged());
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);

	XLSX.writeFile(wb, filename);	
	comLib.hideLoadMask();
}

//function getLevel(groupDataSet, index ,groupID) {
//  var level = 0;
//  var current = groupDataSet.findFirstRow("GroupID == " + groupID);
//  while (current.getValue("Parent") != 0) {
//    level++;
//    current = groupDataSet.findFirstRow("GroupID == " + current.getValue("Parent"));
//  }
//  return level;
//}
//
//function generateString(num) {
//  var result = "";
//  for (var i = 0; i < num; i++) {
//    result += "\u00A0\u00A0\u00A0";
//  }
//  return result+"\u00A0┗";
//}

//----------------------------- Tab 6 지역별 조회 기능  ---------------------------------------------------

/*
 * 버튼(MSSTA6_btnRecordSearch)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onMSSTA6_btnRecordSearchClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var mSSTA6_btnRecordSearch = e.control;
	
	var startTime = app.lookup("MSSTA6_dtiMealRecordStart").value;
	var endTime = app.lookup("MSSTA6_dtiMealRecordEnd").value;
	var isStartEndDateValid = util.isStartEndDateValid(startTime, endTime);
	if (isStartEndDateValid === false) {
		dialogAlert(app.getHostAppInstance(), "error", dataManager.getString("Str_ErrorStartEndDateInvalid"));
		return false
	}
	
	var dmTotal = app.lookup("Total")
	var dm_ExportParam = app.lookup("ExportParam");
	dm_ExportParam.setValue("mode", "export");
	dm_ExportParam.setValue("total", dmTotal.getValue("Count"));
	dm_ExportParam.setValue("offset", 0);
	dm_ExportParam.setValue("mode", "list");

	comLib.showLoadMask("pro", "식수 결과 조회", "", parseInt(dmTotal.getValue("Count")) / 1000);
	sendGetAreaMealResultList();
	return;
	
}


/*
 * 버튼(MSSTA6_btnExcel)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onMSSTA6_btnExcelClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var mSSTA6_btnExcel = e.control;
	var dm_ExportParam = app.lookup("ExportParam");
	dm_ExportParam.setValue("mode", "export");
	//var total = app.lookup("Total").getValue("Count");
	var total = 1
	if (total == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
		return;
	}
	dm_ExportParam.setValue("offset", 0);
	dm_ExportParam.setValue("total", total);
	var totalStep = total / exportCount + (total % exportCount != 0) ? 1 : 0;
	comLib.showLoadMask("pro", dataManager.getString("Str_DataExport"), "", totalStep);
	
	sendGetAreaMealResultList();
	
}

function sendGetAreaMealResultList(){
	
	app.lookup("AreaMealResult").clear();
	var dtiRecordStart = app.lookup("MSSTA6_dtiMealRecordStart");
	var dtiRecordEnd = app.lookup("MSSTA6_dtiMealRecordEnd");

	var rdbLocation = app.lookup("MSSTA6_rdb_location").value;
	
	var sms_getAreaMealResultList = app.lookup("sms_getAreaMealResultList");
	
	sms_getAreaMealResultList.setParameters("StartAt", dtiRecordStart.text); 
	sms_getAreaMealResultList.setParameters("EndAt", dtiRecordEnd.text);
	sms_getAreaMealResultList.setParameters("reserved", rdbLocation);

	var dm_ExportParam = app.lookup("ExportParam");
	if (dm_ExportParam.getValue("mode") == "list") {
		var curIndex = 1;
		var offset = (curIndex - 1) * MSSTA3_pageRowCount;
		sms_getAreaMealResultList.setParameters("offset", 0);
		sms_getAreaMealResultList.setParameters("limit", 100000);
	} else {
		sms_getAreaMealResultList.setParameters("offset", 0);
		sms_getAreaMealResultList.setParameters("limit", 100000);
	}
	
	// 그룹추가.
	sms_getAreaMealResultList.send();
	if (dm_ExportParam.getValue("mode") == "list") {
			comLib.showLoadMask("",dataManager.getString("Str_ListLoading"),"",0);
	}else {
		dm_ExportParam.getValue("mode") = "list"
	}
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getAreaMealResultListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getAreaMealResultList = e.control;
	var dmResult = app.lookup("Result");
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		var dsMealResult = app.lookup("AreaMealResult");
		
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		var totalRowCount = 0;
		for(var i =0; i<totalCount; i++){
			var logInfo = dsMealResult.getRow(i);
			var struid = logInfo.getValue("UserID");
			if (struid == "-1") {
				struid = " "; // 합계, 총합계 처리 시 -1 -> "" 변경
				logInfo.setValue("UserID", struid);
				totalRowCount++;
			}
			
			var strgroupcode = logInfo.getValue("GroupCode");
			if (strgroupcode == "999999999") {
				strgroupcode = " ";
				logInfo.setValue("GroupCode", strgroupcode);
			}
		}
		// 총계, 총합계 빼기. view
		//app.lookup("MSSTA4_optTotalCnt").value = totalCount - totalRowCount;
		////////////////////////////
		var dm_ExportParam = app.lookup("ExportParam");
		if (dm_ExportParam.getValue("mode") == "list") {
			comLib.hideLoadMask();
			/*
			var viewPageCount = totalCount / MSSTA3_pageRowCount + (totalCount % MSSTA3_pageRowCount > 0);
			if (viewPageCount > 10) {
				viewPageCount = 10;
			}
			*/
			var viewPageCount = 1;
			//var pageIndexer = app.lookup("MSSTA4_piMealRecord");
			//pageIndexer.totalRowCount = totalCount;//전체 데이터 수.	
			//pageIndexer.pageRowCount = 100000;//한 페이지에 보여 줄 행의 수
			//pageIndexer.viewPageCount = 1;// 보여지는 페이지 수(하단 부 인덱스 수)
		} else {
			var exportAreaMealResultByExcel = app.lookup("ExportAreaMealResultByExcel");
			if(dsMealResult.getRowCount() == 0) {
				comLib.hideLoadMask();
				if(exportAreaMealResultByExcel.getRowCount() > 0) {
					exportExcel();
					exportAreaMealResultByExcel.clear();
				} else {
					dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
				}
			} else {
				for (var i = 0; i < dsMealResult.getRowCount(); i++) {
					var row = exportAreaMealResultByExcel.pushRowData(dsMealResult.getRowData(i));
				}

				if(exportAreaMealResultByExcel.getRowCount() >= dm_ExportParam.getValue("total")) {
					exportExcel_AreaMealcnt();
					comLib.hideLoadMask();
					exportAreaMealResultByExcel.clear();
				} else {
					var offset = dm_ExportParam.getValue("offset");
					//offset += MSSTA3_pageRowCount;
					offset += 1;
					dm_ExportParam.setValue("offset", offset);
					comLib.updateLoadMask(offset);
					sendGetAreaMealResultList();
				}	
			}
		}	
	} else {
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Error"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
	
	app.lookup("MSSTA6_grdMealResult").redraw();
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getAreaMealResultListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getAreaMealResultList = e.control;
	var result = app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getAreaMealResultListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getAreaMealResultList = e.control;
	var result = app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

function exportExcel_AreaMealcnt(){
        
    dataManager = getDataManager();
	var exportMealResultByExcel = app.lookup("ExportAreaMealResultByExcel");
	var total = exportMealResultByExcel.getRowCount();
	comLib.showLoadMask("pro",dataManager.getString("Str_UserExport"),"",total);
	
	/* original data */
	var today = dateLib.getToday();
	var filename = "AreaMealResult_"+today+".xlsx";	
	var ws_name = "AreaMealResult_";
		
	var wb = XLSX.utils.book_new(), ws = XLSX.utils.json_to_sheet(exportMealResultByExcel.getRowDataRanged());
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);

	XLSX.writeFile(wb, filename);	
	comLib.hideLoadMask();
}
