/************************************************
 * UnitCarInformationModify.js
 * Created at 2021. 2. 1. 오후 4:18:40.
 *
 * @author blue1
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");

var pageRowCount  = 8;
var viewPageCount = 10;

var loginUserGroupID;
/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();

	var udcLayout2 = app.lookup("UCIM_grpUdc");
	var udcCarInfCnt2 = new udc.custom.UnitCarInformationArmyHQ("UnitCarInformationArmyHQ");
	udcLayout2.addChild(udcCarInfCnt2,  {	"colIndex": 0, "rowIndex": 0});
	udcLayout2.updateConstraint(udcCarInfCnt2,{ "autoSize": "width"} );
	udcCarInfCnt2.setReadOnlyCarNumber();	
	
	var cmbCarRegType = app.lookup("UCI_grdCarRegistrationType");
	cmbCarRegType.addItem(new cpr.controls.Item("일반차량", 1));
	cmbCarRegType.addItem(new cpr.controls.Item("RFID차량", 2));
	
	var cmbManagerGroup = app.lookup("UCIM_grdCarManagementGroup");
	cmbManagerGroup.setItemSet(dataManager.getGroup(), {
		label: "Name",
		value: "GroupID"		
	});
	
	var cmbManageGroup = app.lookup("UCIM_cmbManageGroup");
	if (isLoginMaster()){ // 24년도부터 Master를 제외한 관리자는 본인 부서 + 하위 부서만 관리 가능
		cmbManageGroup.setItemSet(dataManager.getGroup(), {label: "Name",	value: "GroupID"});
		cmbManageGroup.addItem(new cpr.controls.Item("------", 0));	
	} else {
		cmbManageGroup.setItemSet(dataManager.getLoginUserGroups(), {label: "Name",	value: "GroupID"});
	}
	cmbManageGroup.selectItemByValue(getLoginUserGroupCode());
	
	loginUserGroupID = getLoginUserGroupCode();
	if (!isLoginMaster()){
		app.lookup("UCIM_cmbManageGroup").value = loginUserGroupID;
	}	
		
	sendSmsAccessApplicationApproval();
}

function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("UCIM_listPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}

function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("UCIM_listPageIndexer");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}

function sendSmsAccessApplicationApproval() {
	app.lookup("UnitCarInfomationList").clear();

	var curPageIndex = app.lookup("UCIM_listPageIndexer").currentPageIndex;
	var offset = (curPageIndex-1) * pageRowCount;
	var sms_getGetUnitCars = app.lookup("sms_getUnitCars");
	sms_getGetUnitCars.setParameters("offset", offset);	
	sms_getGetUnitCars.setParameters("limit", pageRowCount);
	
	var category = app.lookup("UCIM_cmbSearchCategory").value;
	
	switch (Number(category)) {
	case 0:
		sms_getGetUnitCars.setParameters("searchCategory", "all");
		break;
	case 1:
		sms_getGetUnitCars.setParameters("searchCategory", "car_number");
		break;
	case 2:
		sms_getGetUnitCars.setParameters("searchCategory", "car_access_state");
		break;			
//	case 3:  // 24년도 부터 부서 검색 조건 분리
//		sms_getGetUnitCars.setParameters("searchCategory", "manager_group_code");
//		break;
	case 4:
		sms_getGetUnitCars.setParameters("searchCategory", "rf_card");
		break;
	}
	
	var searchKeyword = app.lookup("UCIM_ipbKeyword").value;
	if (searchKeyword != null || searchKeyword != "") {
		sms_getGetUnitCars.setParameters("searchKeyword", searchKeyword);	
	}
	
	sms_getGetUnitCars.setParameters("groupID", app.lookup("UCIM_cmbManageGroup").value);
	if (!isLoginMaster()){
//		console.log("loginUserGroupID " + loginUserGroupID);
		if (loginUserGroupID == 0){
			// 부서가 없는(그룹코드가 0인) 사용자는 그룹코드를 -1로...(다른 부대차량 안보이게 하기 위해서) - pse
			sms_getGetUnitCars.setParameters("groupID", "-1");
		} 	
	}	
	sms_getGetUnitCars.send();
}


/*
 * 버튼(UCI_btnRequest)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUCI_btnRequestClick(/* cpr.events.CMouseEvent */ e){
	var unitCarInfo = app.lookup("UnitCarInfomation");
	unitCarInfo.clear();
	
	var udcUCICnt = app.lookup("UCIM_grpUdc").getChild("UnitCarInformationArmyHQ");
	udcUCICnt.getUnitCarInformation(unitCarInfo);
	
	if (!udcUCICnt.validateData()) {
		return;
	}
	
	var submission =app.lookup("sms_putUnitCar");
	submission.send();
}

/*
 * 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onDeleteButtonClick(/* cpr.events.CMouseEvent */ e){
	var unitCarInfo = app.lookup("UnitCarInfomation");
	unitCarInfo.clear();
		
	var udcUCICnt = app.lookup("UCIM_grpUdc").getChild("UnitCarInformationArmyHQ");
	udcUCICnt.getUnitCarInformation(unitCarInfo);
	
	var carNumber = app.lookup("UnitCarInfomation").getValue("CarNumber");
	// validate 검사
	if (carNumber == null || carNumber == "") {
	 	dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_NoCarNumber"));
	 	return;
	}
	var deleteSubmission = app.lookup("sms_deleteUnitCar");
	deleteSubmission.action = "/v1/armyhq/unitcar/"+carNumber;
	deleteSubmission.send();
}

/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onUCIM_listPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	sendSmsAccessApplicationApproval();	
}

/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onSearchClick(/* cpr.events.CMouseEvent */ e){
	sendSmsAccessApplicationApproval();	
}

function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		sendSmsAccessApplicationApproval();		
	}
}

/*
 * 그리드에서 cell-click 이벤트 발생 시 호출.
 * Grid의 Cell 클릭시 발생하는 이벤트.
 */
function onUCIM_grdUnitCarListCellClick(/* cpr.events.CGridMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var uCIM_grdUnitCarList = e.control;

	var udcUCICnt = app.lookup("UCIM_grpUdc").getChild("UnitCarInformationArmyHQ");
	udcUCICnt.setUnitCarInformation(uCIM_grdUnitCarList.getSelectedRow().getRowData());
	
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_putUnitCarSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Modification"));
		sendSmsAccessApplicationApproval();
	} else {		
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}		
}

function onSms_putUnitCarSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);	
}
function onSms_putUnitCarSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getUnitCarsSubmitDone(/* cpr.events.CSubmissionEvent */ e){
		var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){
		var totalCount = app.lookup("Total").getValue("Count");
		// var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
		selectPaging(totalCount, viewPageCount);
		app.lookup("UCIM_opbTotal").value = totalCount;
	} else {		
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}		
}

function onSms_getUnitCarsSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);	
}
function onSms_getUnitCarsSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_deleteUnitCarSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Delete"));
		sendSmsAccessApplicationApproval();
	} else {		
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}		
}

function onSms_deleteUnitCarSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);	
}

function onSms_deleteUnitCarSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);	
}
