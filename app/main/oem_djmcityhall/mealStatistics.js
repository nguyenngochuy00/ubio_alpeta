/************************************************
 * mealStatistics.js
 * Created at 2018. 11. 14. 오후 1:22:40.
 *
 * @author joymrk 
 * 대전시청향으로 분리함. (UI 항목이 변경됨)
 ************************************************/
var dateLib = cpr.core.Module.require("lib/DateLib");
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;

var MSSTA_pageInit = new Array(1,1,0,0,0,0,0); // 페이지 초기화 여부 변수. 더미, 월간 통계, 식수 집계, 그룹별 식수조회 , 종합 집계 현황

// 식수 집계
var MSSTA2_selectIDMap; // 선택된 사용자 ID 보관. 그리드에서 선택된 사용자를 마킹하기 위해 쓰임
var MSSTA2_pageRowCount = 1000; // 페이지 당 사용자 수
var MSSTA2_numberPerReq = 5000; // 전체 사용자 리스트 추가시 서버에 한번에 요청할 사용자 리스트 수

// 식수 기록 조회
var MSSTA3_pageRowCount = 1000;
var MSSTA4_pageRowCount = 500; 

function onBodyLoad(/* cpr.events.CEvent */ e){
	MSSTA2_selectIDMap = new Map();
	comLib = createComUtil(app);
	dataManager = getDataManager();	
	
	var cmbDataTaype = app.lookup("CMB_MealDataType");
	if (dataManager.getOemVersion() == OEM_KANGWONLAND) { // 2factor 인증
		cmbDataTaype.addItem(new cpr.controls.Item(dataManager.getString("테이크 아웃"), 98));
		cmbDataTaype.addItem(new cpr.controls.Item(dataManager.getString("패스트 푸드"), 99));	
	}
	app.lookup("MSSTA4_treeGroup").showSelectionCheckbox = true;

}

function onSms_SubmitError(/* cpr.events.CSubmissionEvent */ e){	var result = app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);}
function onSms_SubmitTimeout(/* cpr.events.CSubmissionEvent */ e){	var result = app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);}

//
function onMSSTA_dtiMealMonthValueChange(/* cpr.events.CValueChangeEvent */ e){
	sendGetMealMonthStatic();
}

//----------------------------- Tab 컨트롤  ---------------------------------------------------
// 탭 폴더에서 selection-change 이벤트 발생 시 호출.
function onTabFolderSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/* @type cpr.controls.TabFolder	 */
	var tabFolder = e.control;
	var tabItem = tabFolder.getSelectedTabItem();
	console.log("tabItem.id : " + tabItem.id);
	if(MSSTA_pageInit[tabItem.id]==0){ // 초기화를 한번만 수행하기 위해 체크
		MSSTA_pageInit[tabItem.id] = 1;
		if(tabItem.id==2){// 식수 집계 페이지 클릭시	
		
			initDateControlValue(app.lookup("MSSTA2_dtiMealProcessStart"),app.lookup("MSSTA2_dtiMealProcessEnd"))
				
			var udcUserSelectList = app.lookup("MSSTA2_udcUserSelectList")
			udcUserSelectList.deleteColumn([13,12,11,10,9,8,7,6,5,4]); //APBZone,FaceIdentify...
			udcUserSelectList.setPaging(0,MSSTA2_numberPerReq,5);		
			udcUserSelectList.redraw();	
					
			var udcUserTerminal = app.lookup("MSSTA2_udcUserTerminal");	
			udcUserTerminal.initControl(true,false,-1,false);
			udcUserTerminal.setPageRowCount(MSSTA2_pageRowCount);
			udcUserTerminal.deleteUserColumn([14,13,12,11,10,9,8,7,6,5,4]);
			udcUserTerminal.hideUserButtons();
			var dsGroupList = dataManager.getGroup();
			udcUserTerminal.setGroupList(dsGroupList);	
			udcUserTerminal.setSelectedGroup(0);
			
		} else if(tabItem.id==3){// 식수 기록 조회 페이지 클릭시	
			initDateControlValue(app.lookup("MSSTA3_dtiMealRecordStart"),app.lookup("MSSTA3_dtiMealRecordEnd"))
		} else if(tabItem.id==4){// 식수 기록 조회 페이지 클릭시	
			
			var dsGroupList = app.lookup("GroupList");
			var groupList = dataManager.getGroup();
			groupList.copyToDataSet(dsGroupList);
			dsGroupList.addRowData({"Name":dataManager.getString("Str_All"),"GroupID":0});
			dsGroupList.commit();
		
			var treeGroup = app.lookup("MSSTA4_treeGroup");
			treeGroup.redraw();
			initDateControlValue(app.lookup("MSSTA4_dtiMealResultStart"),app.lookup("MSSTA4_dtiMealResultEnd"));
		}else if(tabItem.id==5) {	// 그룹별 조회 기능 추가 - otk
			initDateControlValue(app.lookup("MSSTA5_dtiMealRecordStart"),app.lookup("MSSTA5_dtiMealRecordEnd"));
			var groupList = dataManager.getGroup();	
			var cmbGroup1 = app.lookup("ALMGR_cmbGroup");
			var cmbGroup2 = app.lookup("ALMGR5_cmbGroup02");
			cmbGroup1.setItemSet(groupList, {
					label: "Name",
					value: "GroupID",
			});
			cmbGroup2.setItemSet(groupList, {
				label: "Name",
				value: "GroupID",
			})
		}else if(tabItem.id==6) { // 종합집계 현황 조회 기능추가  otk
			initDateControlValue(app.lookup("MSSTA6_dtiMealRecordStart"),app.lookup("MSSTA6_dtiMealRecordEnd"));
			var groupList = dataManager.getGroup();	
			var cmbGroup1 = app.lookup("ALMGR6_cmbGroup01");
			var cmbGroup2 = app.lookup("ALMGR6_cmbGroup02");
			cmbGroup1.setItemSet(groupList, {
					label: "Name",
					value: "GroupID",
			});
			cmbGroup2.setItemSet(groupList, {
				label: "Name",
				value: "GroupID",
			})
		}
	}	
}

//----------------------------- Tab 1 월간 통계 페이지  ---------------------------------------------------
// 월간 식수 통계 요청
function sendGetMealMonthStatic(){
	var mealStatisticsDay = app.lookup("MealStatisticsDay").clear();
	comLib.showLoadMask("",dataManager.getString("Str_ListLoading"),"",0);
	var dtiMealMonth = app.lookup("MSSTA_dtiMealMonth");
	var curDate = dtiMealMonth.calendar.current;
	
	var sms_getMealStatistics = app.lookup("sms_getMealStatistics");	
	
	sms_getMealStatistics.setParameters("Year", curDate.getFullYear());
	sms_getMealStatistics.setParameters("Month", curDate.getMonth()+1);
	
	sms_getMealStatistics.send();
}

function initMealStatisticsControl( targetDate ){
	
	targetDate.setDate(1); //1일자로 생성
	
	var firstDay = targetDate.getDay(); // 달의 첫번째 요일
	var lastDate = new Date(targetDate.getFullYear(),targetDate.getMonth()+1,0);
	var lastDay = lastDate.getDate(); // 달의 마지막 날
			
	for( var day = 0; day < firstDay; day++ ){
		app.lookup("MSSTA_udcD"+day).setVisible(false);
	}	
	
	var dayValue = 1;
	for( var day = firstDay; day < lastDay+firstDay; day++ ){	
		var dayView = app.lookup("MSSTA_udcD"+day);
		dayView.setClear()	
		dayView.setDay(dayValue);
		dayValue++;
		
		if (day%7==6){
			app.lookup("MSSTA_udcD"+day).setColor("#0000FF");
		} else if (day%7==0){
			app.lookup("MSSTA_udcD"+day).setColor("#FF0000");
		}
		
		dayView.setVisible(true);
	}
	for( var day = lastDay+firstDay; day < 42; day++ ){
		app.lookup("MSSTA_udcD"+day).setVisible(false);
	}	
	return firstDay;
}

//월간 식수 통계 수신 완료
function onSms_getMealStatisticsSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	comLib.hideLoadMask();
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		var sms_getMealStatistics = e.control;
		var year = sms_getMealStatistics.getParameters("Year");
		var month = sms_getMealStatistics.getParameters("Month");
		
		var statisticsDate = new Date( year,month-1, 1);
		var offsetDay = initMealStatisticsControl(statisticsDate)-1; // 컨트롤에서 1일을 표시할 offset 위치
		
		var dsMealStaticsDay = app.lookup("MealStatisticsDay");
		var count = dsMealStaticsDay.getRowCount();
		for( var i = 0; i < count; i++ ){
			var dayResult = dsMealStaticsDay.getRow(i);		
			var day = dayResult.getValue("Day")+offsetDay;		
			var dayView = app.lookup("MSSTA_udcD"+day);
			dayView.setCount(dayResult.getValue("Type"),dayResult.getValue("Count"))
		}	
		
	} else {
		//dialogAlert(app, dataManager.getString("Str_Error"), dataManager.getString("Str_UserListGet"));
		dialogAlert(app, dataManager.getString("Str_Error"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

function initDateControlValue( /*cpr.controls.DateInput*/dtiStart, /*cpr.controls.DateInput*/dtiEnd ){
	var today = new Date();	 
	var month = today.getMonth()+1;
	month = (month>9 ? '' : '0') + month
	dtiEnd.value = today.getFullYear()+month+today.getDate();		
	today.setDate(1);
	dtiStart.value = today.getFullYear()+month+today.getDate();
}

//----------------------------- Tab 2 식수 집게 페이지  ---------------------------------------------------
function onUpdateSrcUserListState(){
	var udcUserListGroup = app.lookup("MSSTA2_udcUserTerminal");	
	udcUserListGroup.refreshUserList(MSSTA2_selectIDMap);
}

// 사용자 리스트에서 userListUpdate 이벤트 발생 시 호출.
function onMSSTA2_udcUserTerminalUserListUpdate(/* cpr.events.CUIEvent */ e){	
	var mSSTA2_udcUserTerminal = e.control;
	onUpdateSrcUserListState();
}

// 선택 사용자 리스트 갱신
function refreshUserSelectList(){
	var dsUserSelectList = app.lookup("UserSelectList");
	
	var selectTotal = dsUserSelectList.getRowCount();
	app.lookup("MSSTA2_optUserSelectTotal").value = selectTotal+" Users";
	
	var udcUserSelectList = app.lookup("MSSTA2_udcUserSelectList");
	udcUserSelectList.setTotalCount(selectTotal);
		
	udcUserSelectList.setPaging(selectTotal, MSSTA2_pageRowCount, 5);
	var readCount = (MSSTA2_pageRowCount-1>selectTotal)?selectTotal-1:MSSTA2_pageRowCount-1;	
	
	var pageidx = udcUserSelectList.getCurrentPageIndex();
	var start = (pageidx-1)*MSSTA2_pageRowCount;
	var end = pageidx*MSSTA2_pageRowCount-1;
	if ( end >= dsUserSelectList.getRowCount() ){
		end = dsUserSelectList.getRowCount()-1;
	}
	
	udcUserSelectList.setUserListRows(dsUserSelectList.getRowDataRanged(start, end));
}

// 사용자 리스트에서 userListDblclick 이벤트 발생 시 호출. 사용자를 선택 사용자 리스트에 추가.
function onMSSTA2_udcUserTerminalUserListDblclick(/* cpr.events.CGridEvent */ e){
	/* @type udc.grid.gridUserTerminal	 */
	var mSSTA2_udcUserTerminal = e.control;
	var rowData = e.row.getRowData();
		
	var dsUserSelectList = app.lookup("UserSelectList");	
	var udcUserListGroup = app.lookup("MSSTA2_udcUserTerminal");
				
	var userID = rowData["ID"];
		
	if( MSSTA2_selectIDMap.get(userID) == undefined ){				
		dsUserSelectList.addRowData(rowData);
		
		MSSTA2_selectIDMap.set(userID,1);
		udcUserListGroup.deleteUserRow(e.row.getIndex());
	}	
			
	refreshUserSelectList();	
}

// ">" 버튼에서 click 이벤트 발생 시 호출. 사용자 리스트에서 체크된 사용자를 선택 사용자 리스트에 추가
function onMSSTA2_btnAddClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var mSSTA2_btnAdd = e.control;
	var dsUserSelectList = app.lookup("UserSelectList");
	
	var udcUserListGroup = app.lookup("MSSTA2_udcUserTerminal");
	var checkedIndices = udcUserListGroup.getUserCheckedRowIndices();
	checkedIndices.forEach(function(index){
		var rowData = udcUserListGroup.getUserRowData(index);		
		var userID = rowData["ID"];
		
		if( MSSTA2_selectIDMap.get(userID) == undefined ){				
			dsUserSelectList.addRowData(rowData);
			
			MSSTA2_selectIDMap.set(userID,1);
			udcUserListGroup.deleteUserRow(index);
		}		
	});
			
	refreshUserSelectList();	
}

// "<" 버튼에서 click 이벤트 발생 시 호출. 선택 사용자 리스트에서 체크된 사용자를  선택 해제
function onMSSTA2_btnRemoveClick(/* cpr.events.CMouseEvent */ e){	
	var dsUserSelectList = app.lookup("UserSelectList");
	
	var udcUserSelectList = app.lookup("MSSTA2_udcUserSelectList");
	var checkedIndices = udcUserSelectList.getCheckedRowIndices()
	var idList = [];
	checkedIndices.forEach(function(index){
		var row = udcUserSelectList.getRow(index);		
		var userID = row.getValue("ID");
		
		MSSTA2_selectIDMap.delete(userID);
		idList.push(userID);
	});
		
	idList.forEach(function(userID){						
		var delRow = dsUserSelectList.findFirstRow("ID == "+userID)
		dsUserSelectList.realDeleteRow(delRow.getIndex());
	});
	
	refreshUserSelectList();
	onUpdateSrcUserListState();	
}

var MSSTA2_userSelectOffset;
// ">>" 버튼에서 click 이벤트 발생 시 호출. 선택된 그룹 사용자 전체를 서버에서 읽어와 선택 사용자 리스트에 추가
function onMSSTA2_btnAddAllClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var mSSTA2_btnAddAll = e.control;
	MSSTA2_userSelectOffset = 0;
		
	var udcUserListGroup = app.lookup("MSSTA2_udcUserTerminal");	
	var totalCount = udcUserListGroup.getTotalCount();
	
	comLib.showLoadMask("pro",dataManager.getString("Str_UserSelect"),"",totalCount/MSSTA2_numberPerReq);
	
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
	
	var fields = ["user_id","name"];
	smsGetUserList.setParameters("fields", fields);	
	smsGetUserList.send();
}

// 사용자 리스트 가져오기 완료
function onSms_getUserListAllSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/* @type cpr.protocols.Submission	 */
	var sms_getUserListAll = e.control;
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
	
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		
		var dsUserSelectList = app.lookup("UserSelectList");
		var dsUserList = app.lookup("UserList");
		 
		var recvCount = dsUserList.getRowCount();
		for( var i=0; i < recvCount; i++ ){
			var row = dsUserList.getRow(i);
			var userID = row.getValue("ID");
			
			if( MSSTA2_selectIDMap.get(userID) == undefined ){				
				dsUserSelectList.addRowData(row.getRowData());
				MSSTA2_selectIDMap.set(userID,1);
			}
		}
		
		if( MSSTA2_userSelectOffset < totalCount ){
			var msg = dataManager.getString("Str_UserListGet")+MSSTA2_userSelectOffset+"/"+totalCount;
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
function onSms_getUserListAllSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 사용자 리스트 가져오기 타임아웃
function onSms_getUserListAllSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 선택 사용자 리스트 더블 클릭시. 더블 클릭된 사용자 선택 사용자 리스트에서 해제
function onMSSTA2_udcUserSelectListUserListDblclick(/* cpr.events.CGridEvent */ e){
	/** 
	 * @type udc.grid.userList
	 */
	var mSSTA2_udcUserSelectList = e.control;
	var dsUserSelectList = app.lookup("UserSelectList");
	
	var udcUserSelectList = app.lookup("MSSTA2_udcUserSelectList");
	
	var rowData = e.row.getRowData();				
	var userID = rowData["ID"];
		
	MSSTA2_selectIDMap.delete(userID);
							
	var delRow = dsUserSelectList.findFirstRow("ID == "+userID)
	dsUserSelectList.realDeleteRow(delRow.getIndex());
	
	udcUserSelectList.setUserList(dsUserSelectList);
			
	refreshUserSelectList();
	onUpdateSrcUserListState();	
}

// "<<" 버튼에서 click 이벤트 발생 시 호출. 선택 사용자 리스트 전체 해제
function onMSSTA2_btnRemoveAllClick(/* cpr.events.CMouseEvent */ e){
	/* @type cpr.controls.Button */
	var mSSTA2_btnRemoveAll = e.control;
	MSSTA2_selectIDMap.forEach(function(value,key){	
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
function onMSSTA2_btnMealProcessClick(/* cpr.events.CMouseEvent */ e){	
	var dsUserSelectList = app.lookup("UserSelectList");
		
	var total = dsUserSelectList.getRowCount()
	var dmMealProcessSetting = app.lookup("MealProcessSetting")
	dmMealProcessSetting.setValue("TaskID",-1);
	dmMealProcessSetting.setValue("Total", total);
	dmMealProcessSetting.setValue("Process",0);
	dmMealProcessSetting.setValue("StartAt",app.lookup("MSSTA2_dtiMealProcessStart").text);
	dmMealProcessSetting.setValue("EndAt",app.lookup("MSSTA2_dtiMealProcessEnd").text);
	
	if( sendMealProcess() == true ){
		comLib.showLoadMask("pro", dataManager.getString("Str_Info"), dataManager.getString("Str_MealProcess"), total);
	}	
}

// 수동 집계 처리 서버에 요청
function sendMealProcess(){
	
	var dmMealProcessSetting = app.lookup("MealProcessSetting")
		
	var dsUserSelectList = app.lookup("UserSelectList");
	var total = dsUserSelectList.getRowCount();	
	var offset = dmMealProcessSetting.getValue("Process");
	
	if( offset >= total ) {
		return false;
	}
	comLib.updateLoadMask(total-offset+"/"+total);
	var sendCount =  offset + MSSTA2_numberPerReq
	if( sendCount > total ){
		sendCount = total;
	}
	var dsUserIDList = app.lookup("UserIDList");
	dsUserIDList.clear();	
	dsUserIDList.build(dsUserSelectList.getRowDataRanged(offset, sendCount-1));
	console.log(offset,sendCount, dsUserIDList.getRowDataRanged());		
	dmMealProcessSetting.setValue("Process",sendCount);
		
	var sms_postMealProcess = app.lookup("sms_postMealProcess");
	sms_postMealProcess.send();
	
	return true;		
}

// 수동 집계 처리 완료
function onSms_postMealProcessSubmitDone(/* cpr.events.CSubmissionEvent */ e){
		
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		
		var dmMealProcessSetting = app.lookup("MealProcessSetting")
		var taskID = dmMealProcessSetting.getValue("TaskID");
		if( taskID == -1 ){
			var dmTaskID = app.lookup("TaskID").getValue("ID");
			dmMealProcessSetting.setValue("TaskID",dmTaskID);		
		} 
		
		if( sendMealProcess() == false ){			
			comLib.hideLoadMask();
		}
	} else {
		comLib.hideLoadMask();
		//dialogAlert(app, dataManager.getString("Str_Error"), dataManager.getString("Str_ManualMealProcess"));
		dialogAlert(app, dataManager.getString("Str_Error"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

//----------------------------- Tab 3 식수 기록 조회 페이지  ---------------------------------------------------

function onMSSTA3_btnRecordSearchClick(/* cpr.events.CMouseEvent */ e){
	var pageIndexer = app.lookup("MSSTA3_piMealRecord");
	pageIndexer.currentPageIndex = 1;	
	
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "list");
	sendGetMealResultList();
}
function sendGetMealResultList(){

	app.lookup("MealResult").clear();
	var dtiRecordStart = app.lookup("MSSTA3_dtiMealRecordStart");
	var dtiRecordEnd = app.lookup("MSSTA3_dtiMealRecordEnd");
	var category = app.lookup("MSSTA3_cmbCategory").value;
	var keyword = app.lookup("MSSTA3_ipbKeyword").value;
	var bResult = app.lookup("MSSTA3_cmbResult").value;
	
	var sms_getMealResultList = app.lookup("sms_getMealResultList");
	
	sms_getMealResultList.setParameters("StartAt", dtiRecordStart.text); //
	sms_getMealResultList.setParameters("EndAt", dtiRecordEnd.text);
	sms_getMealResultList.setParameters("searchCategory", category);
	sms_getMealResultList.setParameters("searchKeyword", keyword);
	if (keyword == null || keyword.length == 0) {
		sms_getMealResultList.setParameters("searchCategory", "");
	}
	var nResult = parseInt(bResult, 10);
	if (nResult > 0) {
		console.log(nResult);
		sms_getMealResultList.setParameters("mealResult", bResult); // 테스트
	} 
	
	var dm_ExportParam = app.lookup("dm_ExportParam");
	if (dm_ExportParam.getValue("mode") == "list") {
		var curIndex = app.lookup("MSSTA3_piMealRecord").currentPageIndex;
		var offset = (curIndex - 1) * MSSTA3_pageRowCount;
		sms_getMealResultList.setParameters("offset", offset);
		sms_getMealResultList.setParameters("limit", MSSTA3_pageRowCount);
	} else {
		sms_getMealResultList.setParameters("offset", dm_ExportParam.getValue("offset"));
		sms_getMealResultList.setParameters("limit", MSSTA3_pageRowCount);
	}
	
	// 그룹추가.
	sms_getMealResultList.send();
	if (dm_ExportParam.getValue("mode") == "list") {
			comLib.showLoadMask("",dataManager.getString("Str_ListLoading"),"",0);
	}
	
}

// 식수 결과 조회 완료
function onSms_getMealResultListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		
		var dsMealResult = app.lookup("MealResult");
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		////////////////////////////
		var dm_ExportParam = app.lookup("dm_ExportParam");
		if (dm_ExportParam.getValue("mode") == "list") {
			comLib.hideLoadMask();
			var viewPageCount = totalCount / MSSTA3_pageRowCount + (totalCount % MSSTA3_pageRowCount > 0);
			if (viewPageCount > 10) {
				viewPageCount = 10;
			}
			var pageIndexer = app.lookup("MSSTA3_piMealRecord");
			pageIndexer.totalRowCount = totalCount;//전체 데이터 수.	
			pageIndexer.pageRowCount = MSSTA3_pageRowCount;//한 페이지에 보여 줄 행의 수
			pageIndexer.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
		} else {
			var exportMealResultByExcel = app.lookup("ExportMealResultByExcel");
			
			if (dsMealResult.getRowCount() == 0) {
				comLib.hideLoadMask();
				if (exportMealResultByExcel.getRowCount() > 0) {
					exportExcel();
					exportMealResultByExcel.clear();
				} else {
					dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
				}
			} else {
				//dsAuthLogList.copyToDataSet(exportAuthLogList)		
				for (var i = 0; i < dsMealResult.getRowCount(); i++) {
					var row = exportMealResultByExcel.pushRowData(dsMealResult.getRowData(i));	
					
					var pType = dsMealResult.getRowData(i).Type;
					if (pType != undefined) {
						switch(pType){
							case 1 : exportMealResultByExcel.setValue(row.getIndex(), "Type", "조식");	break;
							case 2 : exportMealResultByExcel.setValue(row.getIndex(), "Type", "중식");	break;
							case 3 : exportMealResultByExcel.setValue(row.getIndex(), "Type", "석식");	break;
							case 4 : exportMealResultByExcel.setValue(row.getIndex(), "Type", "간식");	break;
							case 5 : exportMealResultByExcel.setValue(row.getIndex(), "Type", "야식"); 	break;
							default : exportMealResultByExcel.setValue(row.getIndex(), "Type", "- -"); 	break;
						}	
					}
					var pResult = dsMealResult.getRowData(i).Result;		
					if (pResult != undefined) {
						switch(pResult){
							case 0 : 	exportMealResultByExcel.setValue(row.getIndex(), "Result", dataManager.getString("Str_Success"));	break;
							case 1 : 	exportMealResultByExcel.setValue(row.getIndex(), "Result", dataManager.getString("Str_UnRegistUser"));	break;
							case 2 : 	exportMealResultByExcel.setValue(row.getIndex(), "Result", dataManager.getString("Str_MatchingFail"));	break;
							case 11 : 	exportMealResultByExcel.setValue(row.getIndex(), "Result", dataManager.getString("Str_MenuPriceNotExist"));	break;
							case 12 : 	exportMealResultByExcel.setValue(row.getIndex(), "Result", dataManager.getString("Str_MealTimeNotValid"));	break;
							case 13 : 	exportMealResultByExcel.setValue(row.getIndex(), "Result", dataManager.getString("Str_MealCodeNotExist"));	break;
							case 14 : 	exportMealResultByExcel.setValue(row.getIndex(), "Result", dataManager.getString("Str_MealPeriodLimit"));	break;
							case 15 : 	exportMealResultByExcel.setValue(row.getIndex(), "Result", dataManager.getString("Str_MealTypeCountLimit"));	break;
							case 16 : 	exportMealResultByExcel.setValue(row.getIndex(), "Result", dataManager.getString("Str_MealDayCountLimit"));	break;
							case 17 : 	exportMealResultByExcel.setValue(row.getIndex(), "Result", dataManager.getString("Str_MealMonthCountLimit"));	break;
							default :	exportMealResultByExcel.setValue(row.getIndex(), "Result", "- -");	break;
						}
					}	
	
				}
				
				if (exportMealResultByExcel.getRowCount() >= dm_ExportParam.getValue("total")) {
					exportExcel();
					comLib.hideLoadMask();
					exportMealResultByExcel.clear();
				} else {
					var offset = dm_ExportParam.getValue("offset");
					offset += MSSTA3_pageRowCount;
					dm_ExportParam.setValue("offset", offset)
					comLib.updateLoadMask(offset);
					sendGetMealResultList();
				}
			}
		}

	} else {
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Error"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

// 식수 결과 페이지 인덱스 변경시
function onMSSTA3_piMealRecordSelectionChange(/* cpr.events.CSelectionEvent */ e){	
	var mSSTA3_piMealRecord = e.control;
	sendGetMealResultList();
}

// 도움말 페이지 클릭
function onImageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // mainManager.module.js ExecuteMenu <- 셋팅	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu",{content:{"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

function onMSSTA4_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var mSSTA4_btnSearch = e.control;
	var pageIndexer = app.lookup("MSSTA4_piMealRecord");
	pageIndexer.currentPageIndex = 1;	
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "list");
	sendGetMealResultExprotList();
}


function sendGetMealResultExprotList(){
	
	app.lookup("MealResultExportList").clear();
	
	var dtiResultStart = app.lookup("MSSTA4_dtiMealResultStart");
	var dtiResultEnd = app.lookup("MSSTA4_dtiMealResultEnd");

	var sms_getMealResultExportList = app.lookup("sms_getMealResultExportList");
	sms_getMealResultExportList.setParameters("StartAt", dtiResultStart.text); //
	sms_getMealResultExportList.setParameters("EndAt", dtiResultEnd.text);
	
	var strGroups = "";		
	var selectedGroupList = app.lookup("GroupList");
	var selectedIndexList = app.lookup("MSSTA4_treeGroup").getSelectedIndices();
	if (selectedIndexList) {//idxlist
		var init = false;
		selectedIndexList.forEach(function(index){
			if (init == false ) {
				init = true
			} else {
				strGroups += ",";
			}
			var row = selectedGroupList.getRow(index);
			strGroups += row.getValue("GroupID");
		});	
	}
		
	console.log(strGroups);
	var syncUserFlag = app.lookup("MSSTA4_cbxSyncUserType").value;
	sms_getMealResultExportList.setParameters("groups", strGroups);
	sms_getMealResultExportList.setParameters("syncUser", syncUserFlag);
	
	var dm_ExportParam = app.lookup("dm_ExportParam");
	if (dm_ExportParam.getValue("mode") == "list") {
		var curIndex = app.lookup("MSSTA4_piMealRecord").currentPageIndex;
		var offset = (curIndex - 1) * MSSTA4_pageRowCount;
		sms_getMealResultExportList.setParameters("offset", offset);
		sms_getMealResultExportList.setParameters("limit", MSSTA4_pageRowCount);
	} else {
		sms_getMealResultExportList.setParameters("offset", dm_ExportParam.getValue("offset"));
		sms_getMealResultExportList.setParameters("limit", MSSTA4_pageRowCount);
	}
	sms_getMealResultExportList.setParameters("limit", MSSTA4_pageRowCount);
	
	sms_getMealResultExportList.send();
	var dm_ExportParam = app.lookup("dm_ExportParam")		
	if( dm_ExportParam.getValue("mode")=="list"){
		comLib.showLoadMask("", dataManager.getString("Str_ListLoading"), "");
	}
}

function onSms_getMealResultExportListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		var dsMealResultExportList = app.lookup("MealResultExportList");
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		app.lookup("MSSTA4_total").value = totalCount;
		
		var dm_ExportParam = app.lookup("dm_ExportParam");
		if (dm_ExportParam.getValue("mode") == "list") {
			var viewPageCount = totalCount / MSSTA4_pageRowCount + (totalCount % MSSTA4_pageRowCount > 0);
			if (viewPageCount > 10) {
				viewPageCount = 10;
			}
			var pageIndexer = app.lookup("MSSTA4_piMealRecord");
			pageIndexer.totalRowCount = totalCount;//전체 데이터 수.	
			pageIndexer.pageRowCount = MSSTA4_pageRowCount;//한 페이지에 보여 줄 행의 수
			pageIndexer.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
			
			if(totalCount == 0) {
				pageIndexer.visible = false;
			} else {		
				pageIndexer.visible = true;
			}
			comLib.hideLoadMask();
		} else {
			var exportMealResultExportList = app.lookup("ExportMealResultExportList");
			
			if (dsMealResultExportList.getRowCount() == 0) {
				comLib.hideLoadMask();
				if (exportMealResultExportList.getRowCount() > 0) {
					exportText();
					exportMealResultExportList.clear();
				} else {
					dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
				}
			} else {
				
				for (var i = 0; i < dsMealResultExportList.getRowCount(); i++) {
					var row = exportMealResultExportList.pushRowData(dsMealResultExportList.getRowData(i));
				}
				
				if (exportMealResultExportList.getRowCount() >= dm_ExportParam.getValue("total")) {
					exportText();
					comLib.hideLoadMask();
					exportMealResultExportList.clear();
				} else {
					var offset = dm_ExportParam.getValue("offset");
					offset += MSSTA4_pageRowCount;
					dm_ExportParam.setValue("offset", offset)
					comLib.updateLoadMask(offset);
					sendGetMealResultExprotList();
				}
			}
		}
		
	} else {
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Error"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}
	
/*
 * "내보내기" 버튼(MSSTA4_btnExport)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onMSSTA4_btnExportClick(/* cpr.events.CMouseEvent */ e){ 
	var exportList = app.lookup("MSSTA4_grdMain4");
	if (exportList.getRowCount() <= 0 ) {
		dialogAlert(app, dataManager.getString("Str_Warning"), "검색 결과가 1건이상 있어야 합니다.");
		return;
	}
	var totalLabel = app.lookup("MSSTA4_total");
	var dmTotal = app.lookup("Total");
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "export");
	dm_ExportParam.setValue("total", dmTotal.getValue("Count"));	
	dm_ExportParam.setValue("offset", 0);
	
	comLib.showLoadMask("pro",dataManager.getString("Str_UserExport"),"",parseInt(totalLabel.value)/500);
	sendGetMealResultExprotList();
}

function exportText() {
	var arr = new Array();
	var exportMealResultList = app.lookup("ExportMealResultExportList");
	var arr = new Array(exportMealResultList.getRowCount());
	for(var i = 0; i< exportMealResultList.getRowCount(); i++ ) {
		var rowData = exportMealResultList.getRow(i);
		arr[i] ='2'+rowData.getValue("Name") + '    ' + rowData.getValue("UniqueID2")+ '                    ' + rowData.getValue("Pay") + '            :' + '\n'; 
		//'2공운식    F018766523032                    63000            :' + '\n';
	} 
	var blob = new Blob(arr, { type: 'text/plain' })
	var objURL = window.URL.createObjectURL(blob);
            
    // 이전에 생성된 메모리 해제
    if (window.__Xr_objURL_forCreatingFile__) {
        window.URL.revokeObjectURL(window.__Xr_objURL_forCreatingFile__);
    }
    window.__Xr_objURL_forCreatingFile__ = objURL;
    var a = document.createElement('a');
    a.download = "test.txt";
    a.href = objURL;
    a.click();
}

/*
 * 트리에서 item-check 이벤트 발생 시 호출.
 * 아이템을 체크할때 발생하는 이벤트.
 */
function onMSSTA4_treeGroupItemCheck(/* cpr.events.CItemEvent */ e){
	/** 
	 * @type cpr.controls.Tree
	 */
	var mSSTA4_treeGroup = e.control;
	console.log(mSSTA4_treeGroup.value);
}

function onMSSTA3_exportMealResultClick(/* cpr.events.CMouseEvent */ e){
	var dmTotal = app.lookup("Total")
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "export");
	dm_ExportParam.setValue("total", dmTotal.getValue("Count"));
	dm_ExportParam.setValue("offset", 0);
	if (dmTotal.getValue("Count") == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), "검색된 결과가 없습니다.");
	} else {
		comLib.showLoadMask("pro", "식수 결과 조회", "", parseInt(dmTotal.getValue("Count")) / 1000);
		sendGetMealResultList();
		return;
	}
}

function exportExcel(){
	
	dataManager = getDataManager();
	var exportMealResultByExcel = app.lookup("ExportMealResultByExcel");
	var total = exportMealResultByExcel.getRowCount();
	comLib.showLoadMask("pro",dataManager.getString("Str_UserExport"),"",total);
	
	/* original data */
	var today = dateLib.getToday();
	var filename = "MealResult_"+today+".xlsx";	
	var ws_name = "MealResult_";
		
	var wb = XLSX.utils.book_new(), ws = XLSX.utils.json_to_sheet(exportMealResultByExcel.getRowDataRanged());
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);

	XLSX.writeFile(wb, filename);	
	comLib.hideLoadMask();
}

//----------------------------- Tab 5 그룹별 식수조회 페이지  ---------------------------------------------------
// otk

function onMSSTA5_exportMealResultClick(/* cpr.events.CMouseEvent */ e){
	var mSSTA5_exportMealResult = e.control;
	var dmTotal = app.lookup("Total")
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "export");
	dm_ExportParam.setValue("total", dmTotal.getValue("Count"));
	dm_ExportParam.setValue("offset", 0);
	if (dmTotal.getValue("Count") == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), "검색된 결과가 없습니다.");
	} else {
		comLib.showLoadMask("pro", "식수 결과 조회", "", parseInt(dmTotal.getValue("Count")) / 1000);
		sendGetGroupListMealResultList();
		return;
	}
}

function onMSSTA5_btnRecordGroupSearchClick(/* cpr.events.CMouseEvent */ e){
	var mSSTA5_btnRecordGroupSearch = e.control;
	var pageIndexer = app.lookup("MSSTA5_piMealRecord");
	pageIndexer.currentPageIndex = 1;	
	
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "list");
	sendGetGroupListMealResultList();
}

// Group 별 조회 
function sendGetGroupListMealResultList(){
	app.lookup("GroupMealResult").clear();
	var dtiRecordStart = app.lookup("MSSTA5_dtiMealRecordStart");
	var dtiRecordEnd = app.lookup("MSSTA5_dtiMealRecordEnd");
	var category = app.lookup("ALMGR_cmbGroup").value;
	var keyword = app.lookup("ALMGR5_cmbGroup02").value;
	var bResult = app.lookup("MSSTA5_cmbResult").value;
	
	var sms_getGroupMealResultList = app.lookup("sms_getGroupMealResultList");
	
	sms_getGroupMealResultList.setParameters("StartAt", dtiRecordStart.text); //
	sms_getGroupMealResultList.setParameters("EndAt", dtiRecordEnd.text);
	sms_getGroupMealResultList.setParameters("searchCategory", category);
	sms_getGroupMealResultList.setParameters("searchKeyword", keyword);
	if (keyword == null || keyword.length == 0) {
		sms_getGroupMealResultList.setParameters("searchCategory", "");
	}
	var nResult = parseInt(bResult, 10);
	if (nResult > 0) {
		console.log(nResult);
		sms_getGroupMealResultList.setParameters("GroupMealResult", bResult); // 테스트
	} 
	
	var dm_ExportParam = app.lookup("dm_ExportParam");
	if (dm_ExportParam.getValue("mode") == "list") {
		var curIndex = app.lookup("MSSTA5_piMealRecord").currentPageIndex;
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
		console.log(dsMealResult.getRowDataRanged());
		var totalLabel = app.lookup("MSSTA5_Totalcnt");
		var dmTotal = app.lookup("Total");
		totalLabel.value = dmTotal.getValue("Count");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		for(var i =0; i<totalCount; i++){
			var logInfo = dsMealResult.getRow(i);
			var struid = logInfo.getValue("UserID");
			if (struid == "-1") {
				struid = " "; // 합계, 총합계 처리 시 -1 -> "" 변경
				logInfo.setValue("UserID", struid);
			}
			
			var strgroupcode = logInfo.getValue("GroupCode");
			if (strgroupcode == "999999999") {
				strgroupcode = " ";
				logInfo.setValue("GroupCode", strgroupcode);
			}
		}
		////////////////////////////
		var dm_ExportParam = app.lookup("dm_ExportParam");
		if (dm_ExportParam.getValue("mode") == "list") {
			comLib.hideLoadMask();
			var viewPageCount = totalCount / MSSTA3_pageRowCount + (totalCount % MSSTA3_pageRowCount > 0);
			if (viewPageCount > 10) {
				viewPageCount = 10;
			}
			var pageIndexer = app.lookup("MSSTA5_piMealRecord");
			pageIndexer.totalRowCount = totalCount;//전체 데이터 수.	
			pageIndexer.pageRowCount = 100000;//한 페이지에 보여 줄 행의 수
			pageIndexer.viewPageCount = 1;// 보여지는 페이지 수(하단 부 인덱스 수)
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
	
	app.lookup("MSSTA5_grdMealResult").redraw();
}

function onMSSTA5_piMealRecordSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var mSSTA5_piMealRecord = e.control;
	sendGetGroupListMealResultList();
}

function onSms_getGroupMealResultListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var sms_getGroupMealResultList = e.control;
	var result = app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_getGroupMealResultListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var sms_getGroupMealResultList = e.control;
	var result = app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
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


//----------------------------- Tab 6 종합 집계 현황 페이지  ---------------------------------------------------
// otk
function onMSSTA6_btnRecordTotalSearchClick(/* cpr.events.CMouseEvent */ e){
	var mSSTA6_btnRecordTotalSearch = e.control;
	
	var mSSTA5_btnRecordGroupSearch = e.control;
	var pageIndexer = app.lookup("MSSTA6_piMealRecord");
	pageIndexer.currentPageIndex = 1;	
	
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "list");
	sendGetTotalSumMealResultList();
}

function sendGetTotalSumMealResultList() {
	app.lookup("TotalMealResult").clear();
	var dtiRecordStart = app.lookup("MSSTA6_dtiMealRecordStart");
	var dtiRecordEnd = app.lookup("MSSTA6_dtiMealRecordEnd");
	var category = app.lookup("ALMGR6_cmbGroup01").value;
	var keyword = app.lookup("ALMGR6_cmbGroup02").value;
	var bResult = app.lookup("MSSTA5_cmbResult").value;
	
	var sms_getTotalSumMealResultList = app.lookup("sms_getTotalSumMealResultList");
	
	sms_getTotalSumMealResultList.setParameters("StartAt", dtiRecordStart.text); //
	sms_getTotalSumMealResultList.setParameters("EndAt", dtiRecordEnd.text);
	sms_getTotalSumMealResultList.setParameters("searchCategory", category);
	sms_getTotalSumMealResultList.setParameters("searchKeyword", keyword);
	if (keyword == null || keyword.length == 0) {
		sms_getTotalSumMealResultList.setParameters("searchCategory", "");
	}
	var nResult = parseInt(bResult, 10);
	if (nResult > 0) {
		console.log(nResult);
		sms_getTotalSumMealResultList.setParameters("TotalMealResult", bResult); // 테스트
	} 
	
	var dm_ExportParam = app.lookup("dm_ExportParam");
	if (dm_ExportParam.getValue("mode") == "list") {
		var curIndex = app.lookup("MSSTA6_piMealRecord").currentPageIndex;
		var offset = (curIndex - 1) * MSSTA3_pageRowCount;
		sms_getTotalSumMealResultList.setParameters("offset", offset);
		sms_getTotalSumMealResultList.setParameters("limit", MSSTA3_pageRowCount);
	} else {
		sms_getTotalSumMealResultList.setParameters("offset", dm_ExportParam.getValue("offset"));
		sms_getTotalSumMealResultList.setParameters("limit", MSSTA3_pageRowCount);
	}
	
	// 그룹추가.
	sms_getTotalSumMealResultList.send();
	if (dm_ExportParam.getValue("mode") == "list") {
			comLib.showLoadMask("",dataManager.getString("Str_ListLoading"),"",0);
	}
}

function onSms_getTotalSumMealResultListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var sms_getTotalSumMealResultList = e.control;
	var dmResult = app.lookup("Result");
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		var dsTMealResult = app.lookup("TotalMealResult");
		console.log(dsTMealResult.getRowDataRanged());
		//var dmTotal = app.lookup("Total");
		var totalLabel = app.lookup("MSSTA6_Totalcnt");
		var dmTotal = app.lookup("Total");
		totalLabel.value = dmTotal.getValue("Count");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		
		for(var i =0; i<totalCount; i++){
			var logInfo = dsTMealResult.getRow(i);		
			var strgroupcode = logInfo.getValue("GroupCode");
			if (strgroupcode == "999999999") {
				strgroupcode = " ";
				logInfo.setValue("GroupCode", strgroupcode);
			}
		}
		////////////////////////////
		var dm_ExportParam = app.lookup("dm_ExportParam");
		if (dm_ExportParam.getValue("mode") == "list") {
			comLib.hideLoadMask();
			var viewPageCount = totalCount / MSSTA3_pageRowCount + (totalCount % MSSTA3_pageRowCount > 0);
			if (viewPageCount > 10) {
				viewPageCount = 10;
			}
			var pageIndexer = app.lookup("MSSTA6_piMealRecord");
			pageIndexer.totalRowCount = totalCount;//전체 데이터 수.	
			pageIndexer.pageRowCount = MSSTA3_pageRowCount;//한 페이지에 보여 줄 행의 수
			pageIndexer.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
		} else {
			var exportTotalSumMealResultByExcel = app.lookup("ExportTotalMealResultByExcel");
			if(dsTMealResult.getRowCount() == 0) {
				comLib.hideLoadMask();
				if(exportTotalSumMealResultByExcel.getRowCount() > 0) {
					exportExcel();
					exportTotalSumMealResultByExcel.clear();
				} else {
					dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
				}
			} else {
				for (var i = 0; i < dsTMealResult.getRowCount(); i++) {
					var row = exportTotalSumMealResultByExcel.pushRowData(dsTMealResult.getRowData(i));
					
					var pCode = dsTMealResult.getRowData(i).GroupCode;
					
				}	
								
				if(exportTotalSumMealResultByExcel.getRowCount() >= dm_ExportParam.getValue("total")) {
					exportExcel_TotalMealcnt();
					comLib.hideLoadMask();
					exportTotalSumMealResultByExcel.clear();
				} else {
					var offset = dm_ExportParam.getValue("offset");
					offset += MSSTA3_pageRowCount;
					dm_ExportParam.setValue("offset", offset);
					comLib.updateLoadMask(offset);
					sendGetTotalSumMealResultList();
				}	
			}
		}	
	} else {
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Error"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
	
	app.lookup("MSSTA6_grdMealResult").redraw();
	
}

function onSms_getTotalSumMealResultListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var sms_getTotalSumMealResultList = e.control;
	var result = app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_getTotalSumMealResultListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var sms_getTotalSumMealResultList = e.control;
	var result = app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

function onMSSTA6_piMealRecordSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var mSSTA6_piMealRecord = e.control;
	sendGetTotalSumMealResultList();
}

function onMSSTA6_exportMealResultClick(/* cpr.events.CMouseEvent */ e){
	var mSSTA6_exportMealResult = e.control;
	var dmTotal = app.lookup("Total")
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "export");
	dm_ExportParam.setValue("total", dmTotal.getValue("Count"));
	dm_ExportParam.setValue("offset", 0);
	if (dmTotal.getValue("Count") == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), "검색된 결과가 없습니다.");
	} else {
		comLib.showLoadMask("pro", "식수 결과 조회", "", parseInt(dmTotal.getValue("Count")) / 1000);
		sendGetTotalSumMealResultList();
		return;
	}
}

function exportExcel_TotalMealcnt(){
        
    dataManager = getDataManager();
	var exportMealResultByExcel = app.lookup("ExportTotalMealResultByExcel");
	var total = exportMealResultByExcel.getRowCount();
	comLib.showLoadMask("pro",dataManager.getString("Str_UserExport"),"",total);
	
	/* original data */
	var today = dateLib.getToday();
	var filename = "TotalMealResult_"+today+".xlsx";	
	var ws_name = "TotalMealResult_";
		
	var wb = XLSX.utils.book_new(), ws = XLSX.utils.json_to_sheet(exportMealResultByExcel.getRowDataRanged());
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);

	XLSX.writeFile(wb, filename);	
	comLib.hideLoadMask();
}
