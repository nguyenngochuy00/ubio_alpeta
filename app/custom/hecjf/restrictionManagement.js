/************************************************
 * restrictionManagement.js
 * Created at 2023. 11. 3.
 *
 * @author sep
 ************************************************/

var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var usint_version;
var updateStep = 0;
var totalCount = 0;
var flagValue;
var sendSMS = 0;
var userEndPageIndex;
var companyPageRowCount = 20;
var userPageRowCount = 100;

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app.getHostAppInstance());
	usint_version = dataManager.getSystemVersion();
	
	var companyPageIndexer = app.lookup("companyListPageIndexer");
	companyPageIndexer.pageRowCount = companyPageRowCount;
	companyPageIndexer.currentPageIndex = 1;
	
	var userPageIndexer = app.lookup("userListPageIndexer");
	userPageIndexer.pageRowCount = userPageRowCount;
	userPageIndexer.currentPageIndex = 1;
	
	var cmbCompanyCategory = app.lookup("cmbCompanyCategory");
	cmbCompanyCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_CompanyID"),"companyID"));
	cmbCompanyCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_CompanyNumber"),"companyCode"));
	cmbCompanyCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_CompanyName"),"companyName"));
	cmbCompanyCategory.selectItem(0);
	
	var cmbUserCategory = app.lookup("cmbUserCategory");
	cmbUserCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_ID"),"userID"));
	cmbUserCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_Name"),"name"));
	cmbUserCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_UniqueID"),"uniqueID"));
	cmbUserCategory.selectItem(0);
	
	sendCompanyListRequest();

}


function sendCompanyListRequest() {
	
	var companyList = app.lookup("gridCompanyList");
	var companyPageIndexer = app.lookup("companyListPageIndexer");
	var curIndex = companyPageIndexer.currentPageIndex;
	var pageRowCount = companyPageIndexer.pageRowCount;
	var offset = (curIndex - 1) * pageRowCount;
	
	comLib.showLoadMask("",dataManager.getString("Str_ListLoading"),"",pageRowCount);

	var searchCategory = app.lookup("cmbCompanyCategory").value;
	var searchKeyword = app.lookup("ipbCompanyKeyword").value;

	// 검색 조건 세팅
	var smsGetCompanyList = app.lookup("sms_getMovexComapnyList");
	smsGetCompanyList.removeAllParameters();
	smsGetCompanyList.setParameters("searchKeyword", searchKeyword);
	if (searchKeyword != null && searchKeyword.length > 0) {
		smsGetCompanyList.setParameters("searchCategory", searchCategory);
	} else {
		smsGetCompanyList.setParameters("searchCategory", "");
	}
	// 페이징 계산하여 요청
	smsGetCompanyList.setParameters("offset", offset);
	smsGetCompanyList.setParameters("limit", pageRowCount);
	
	smsGetCompanyList.setParameters("exportType", 1);
	
	app.lookup("CompanyList").clear();
	smsGetCompanyList.send();
	
}

function sendUserListRequest() {
	
	var gridUserList = app.lookup("grdUserList");
	var userPageIndexer = app.lookup("userListPageIndexer");
	var curIndex = userPageIndexer.currentPageIndex;
	var pageRowCount = userPageIndexer.pageRowCount;
	var offset = (curIndex - 1) * pageRowCount;
	
	comLib.showLoadMask("",dataManager.getString("Str_ListLoading"),"",pageRowCount);

	var searchCategory = app.lookup("cmbUserCategory").value;
	var searchKeyword = app.lookup("ipbUserKeyword").value;
	
	app.lookup("UserList").clear();
	// 검색 조건 세팅
	var smsGetUserList = app.lookup("sms_getUserList");
	smsGetUserList.removeAllParameters();
	smsGetUserList.setParameters("searchKeyword", searchKeyword);
	if (searchKeyword != null && searchKeyword.length > 0) {
		smsGetUserList.setParameters("searchCategory", searchCategory);
	} else {
		smsGetUserList.setParameters("searchCategory", "");
	}
	// 페이징 계산하여 요청
	smsGetUserList.setParameters("offset", offset);
	smsGetUserList.setParameters("limit", pageRowCount);
	
	smsGetUserList.setParameters("exportType", 1);
	
	var fields = ["user_id", "unique_id", "name", "flag"];
	smsGetUserList.setParameters("fields", fields);
	
	smsGetUserList.send();
	
}

function onSms_getMovexComapnyListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var companyPageIndexer = app.lookup("companyListPageIndexer");
	var result = app.lookup("Result");
	
	var resultCode = result.getValue("ResultCode");
	if( resultCode == 0){
		var companyList = app.lookup("gridCompanyList");
		var dsCompanyList = app.lookup("CompanyList");
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));

		var pageRowCount = companyPageIndexer.pageRowCount;
		var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
		if (viewPageCount > 5) {
			viewPageCount = 5;
		}
				
		companyPageIndexer.totalRowCount = totalCount;
		companyList.redraw();
		companyPageIndexer.redraw();
		
		var opbTotal = app.lookup("opbCompanyTotal");
		opbTotal.value = totalCount;
		opbTotal.redraw();
	
		comLib.hideLoadMask();
		
	}else{
		comLib.hideLoadMask();	
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString(getErrorString(resultCode)));
	}
	
	if (sendSMS == 0){
		sendSMS = 1;
		sendUserListRequest();
	} 
}

function onSms_getMovexComapnyListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getMovexComapnyListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onBtnCompanySearchClick(/* cpr.events.CMouseEvent */ e){
	app.lookup("companyListPageIndexer").currentPageIndex = 1;
	sendCompanyListRequest();
}

function onIpbCompanyKeywordKeyup(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		app.lookup("companyListPageIndexer").currentPageIndex = 1;
		sendCompanyListRequest();		
	}
}

function onCompanyListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	sendCompanyListRequest();
}

function sendUpdateComapnyFlag() {
	var dsCompanyIDList = app.lookup("CompanyIDList");
	var count = dsCompanyIDList.getRowCount();
	if (count < 1) {
		app.lookup("gridCompanyList").clearAllCheck();
		comLib.hideLoadMask();
		sendCompanyListRequest();
		return;
	}
	
	var companyID = dsCompanyIDList.getValue(0, "CompanyID");
	var smsPutCompanyFlag = app.lookup("sms_putRestrictCompany");
	smsPutCompanyFlag.userAttr("companyID", companyID);
	smsPutCompanyFlag.action = "/v1/hecjf/restriect/company/" + companyID;
	dsCompanyIDList.realDeleteRow(0);
	smsPutCompanyFlag.send();
}

function sendUpdateUserFlag() {
	var dsUserIDList = app.lookup("UserIDList");
	var count = dsUserIDList.getRowCount();
	if (count < 1) {
		app.lookup("grdUserList").clearAllCheck();
		comLib.hideLoadMask();
		sendUserListRequest();
		return;
	}
	
	var userID = dsUserIDList.getValue(0, "ID");
	var smsPutUserFlag = app.lookup("sms_putRestrictUser");
	smsPutUserFlag.userAttr("userID", userID.toString());
	smsPutUserFlag.action = "/v1/hecjf/restriect/user/" + userID;
	dsUserIDList.realDeleteRow(0);
	smsPutUserFlag.send();
}

/*
 * 버튼(btnComapnyAdd)에서 click 이벤트 발생 시 호출.
 */
function onBtnComapnyAddClick(/* cpr.events.CMouseEvent */ e){
	app.getRootAppInstance().openDialog("app/custom/hecjf/popup/CompanySelect", {width : 450, height : 610}, function(dialog){
		dialog.modal = true;
		dialog.bind("headerTitle").toLanguage("Str_CompanySelect");
	}).then(function(/*cpr.data.DataSet*/idList){
		var dsCompanyIDList = app.lookup("CompanyIDList");
		dsCompanyIDList.clear();
		var dsAddCompanyList = app.lookup("AddCompanyList");
		dsAddCompanyList.clear();
		
		idList.copyToDataSet(dsAddCompanyList);
//		console.log(dsAddCompanyList.getRowDataRanged());
		totalCount = dsAddCompanyList.getRowCount();

		if (totalCount > 0) {
			comLib.showLoadMask("",dataManager.getString(""),"","");
			for(var i = 0; i < totalCount; i++){
				var companyID = dsAddCompanyList.getRow(i).getValue("CompanyID");
				dsCompanyIDList.addRowData({"CompanyID": companyID});
			}
			// console.log(dsCompanyIDList.getRowDataRanged());
			app.lookup("Flag").setValue("Flag", 1);
			comLib.showLoadMask("pro", dataManager.getString("Str_CompanyAdd"), "", totalCount);
			sendUpdateComapnyFlag();
		}
		
	});
}

function onSms_putRestrictCompanySubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	
	var resultCode = result.getValue("ResultCode");
//	if( resultCode == 0){
	var smsPutCompanyFlag = app.lookup("sms_putRestrictCompany");	
	var companyID = smsPutCompanyFlag.userAttr("companyID");
	
	comLib.updateLoadMask(companyID);
	sendUpdateComapnyFlag();

//	}else{
//		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString(getErrorString(resultCode)));
//	}
}

function onSms_putRestrictCompanySubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_putRestrictCompanySubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

/*
 * 버튼(btnComapnyRemove)에서 click 이벤트 발생 시 호출.
 */
function onBtnComapnyRemoveClick(/* cpr.events.CMouseEvent */ e){
	var dsCompanyList = app.lookup("CompanyList");
	var gridCompanyList = app.lookup("gridCompanyList");
	var dsCompanyIDList = app.lookup("CompanyIDList");
	dsCompanyIDList.clear();
	var checkedIndices = gridCompanyList.getCheckRowIndices();

	if (checkedIndices.length > 0) {
		comLib.showLoadMask("",dataManager.getString(""),"","");
		for(var i = 0; i < checkedIndices.length; i++){
			var index = checkedIndices[i];
			var companyID = gridCompanyList.getRow(index).getValue("CompanyID");
			dsCompanyIDList.addRowData({"CompanyID": companyID});
		}
		// console.log(dsCompanyIDList.getRowDataRanged());
		
		var totalCount = dsCompanyIDList.getRowCount();
		app.lookup("Flag").setValue("Flag", 0);
		comLib.showLoadMask("pro", dataManager.getString("Str_CompanyDelete"), "", totalCount);
		sendUpdateComapnyFlag();
	}
}

function onSms_getUserListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var userListPageIndexer = app.lookup("userListPageIndexer");
	var result = app.lookup("Result");
	
	var resultCode = result.getValue("ResultCode");
	if( resultCode == 0){
		var userList = app.lookup("grdUserList");
		var dsUserList = app.lookup("UserList");
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));

		var pageRowCount = userListPageIndexer.pageRowCount;
		var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
		userEndPageIndex = viewPageCount;
//		console.log("userEndPageIndex : " + userEndPageIndex);
		var curPageIndex = userListPageIndexer.currentPageIndex;
		if (viewPageCount > 5) {
			viewPageCount = 5;
		}
				
		userListPageIndexer.totalRowCount = totalCount;
		userList.redraw();
		userListPageIndexer.redraw();
		
		var opbTotal = app.lookup("opbUserTotal");
		opbTotal.value = totalCount;
		opbTotal.redraw();

		comLib.hideLoadMask();

	}else{
		comLib.hideLoadMask();	
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString(getErrorString(resultCode)));
	}
	
}

/*
 * 버튼(btnUserAdd)에서 click 이벤트 발생 시 호출.
 */
function onBtnUserAddClick(/* cpr.events.CMouseEvent */ e){
	var dsGroupList = dataManager.getGroup();
	var appld = "app/main/users/UserSelect" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {width : 960, height : 500}, function(dialog){
		dialog.initValue = {"GroupList":dsGroupList,"ExcludeGroup":-1};
		dialog.bind("headerTitle").toLanguage("Str_UserSelect");
		dialog.modal = true;
	}).then(function(/*cpr.data.DataSet*/idMap){
		var dsUserIDList = app.lookup("UserIDList");
		idMap.forEach(function(value, key) {
			dsUserIDList.addRowData({
				"ID": key
			});
		});
		console.log(dsUserIDList.getRowDataRanged());
		var totalCount = dsUserIDList.getRowCount();
		app.lookup("Flag").setValue("Flag", 1);
		comLib.showLoadMask("pro", dataManager.getString("Str_UserAdd"), "", totalCount);
		sendUpdateUserFlag();
		
	});
}

function onBtnUserSearchClick(/* cpr.events.CMouseEvent */ e){
	app.lookup("userListPageIndexer").currentPageIndex = 1;
	sendUserListRequest();
}

function onIpbUserKeywordKeyup(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		app.lookup("userListPageIndexer").currentPageIndex = 1;
		sendUserListRequest();		
	}
}

function onSms_putRestrictUserSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");

	var smsPutUserFlag = app.lookup("sms_putRestrictUser");
	var userID = smsPutUserFlag.userAttr("userID");
	
	comLib.updateLoadMask(userID);
	sendUpdateUserFlag();
}

function onSms_putRestrictUserSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_putRestrictUserSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

/*
 * 버튼(btnUserRemove)에서 click 이벤트 발생 시 호출.
 */
function onBtnUserRemoveClick(/* cpr.events.CMouseEvent */ e){
	var dsUserList = app.lookup("UserList");
	var gridUserList = app.lookup("grdUserList");
	var dsUserIDList = app.lookup("UserIDList");
	dsUserIDList.clear();
	var checkedIndices = gridUserList.getCheckRowIndices();

	if (checkedIndices.length > 0) {
		comLib.showLoadMask("",dataManager.getString(""),"","");
		for(var i = 0; i < checkedIndices.length; i++){
			var index = checkedIndices[i];
			var userID = gridUserList.getRow(index).getValue("UserID");
			dsUserIDList.addRowData({"ID": userID});
		}
		// console.log(dsCompanyIDList.getRowDataRanged());
		if(dsUserIDList.getRowCount() >= userPageRowCount){
			var userListPageIndexer = app.lookup("userListPageIndexer");
			var curPageIndex = userListPageIndexer.currentPageIndex;
			if (curPageIndex == userEndPageIndex){ // 사용자 삭제 시, 마지막 페이지의 모든 사용자를 삭제할 경우 해당 페이지 인덱스가 없어 페이지 인덱스를 앞의 페이지로 설정해주기  
				userListPageIndexer.currentPageIndex = curPageIndex - 1;
			}
		}
		
		var totalCount = dsUserIDList.getRowCount();
		app.lookup("Flag").setValue("Flag", 0);
		comLib.showLoadMask("pro", dataManager.getString("Str_UserDelete"), "", totalCount);
		sendUpdateUserFlag();
	}
}

function onUserListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	sendUpdateUserFlag();
}
