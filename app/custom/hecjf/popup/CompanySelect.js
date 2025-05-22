/************************************************
 * CompanySelect.js
 * Created at 2023. 11. 6.
 *
 * @author sep
 ************************************************/

var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);

	var cmbCompanyCategory = app.lookup("cmbCompanyCategory");
	cmbCompanyCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_CompanyID"),"companyID"));
	cmbCompanyCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_CompanyNumber"),"companyCode"));
	cmbCompanyCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_CompanyName"),"companyName"));
	cmbCompanyCategory.selectItem(0);
	
	sendCompanyListRequest();
	
}

function sendCompanyListRequest() {
	var companyList = app.lookup("gridCompanyList");
	
	comLib.showLoadMask("",dataManager.getString("Str_ListLoading"),"","");

	var searchCategory = app.lookup("cmbCompanyCategory").value;
	var searchKeyword = app.lookup("ipbCompanyKeyword").value;

	// 검색 조건 세팅
	var smsGetCompanyList = app.lookup("sms_getMovexComapnyList");
	
	smsGetCompanyList.setParameters("searchKeyword", searchKeyword);
	if (searchKeyword != null && searchKeyword.length > 0) {
		smsGetCompanyList.setParameters("searchCategory", searchCategory);
	} else {
		smsGetCompanyList.setParameters("searchCategory", "");
	}
	// 페이징 계산하여 요청
	smsGetCompanyList.setParameters("offset", 0);
	smsGetCompanyList.setParameters("limit", 2); // 0으로 하면 에러...
	
	smsGetCompanyList.setParameters("exportType", 0);
	app.lookup("CompanyList").clear();
	smsGetCompanyList.send();
	
}

function onSms_getMovexComapnyListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	
	var resultCode = result.getValue("ResultCode");
	if( resultCode == 0){
		var companyList = app.lookup("gridCompanyList");
		var dsCompanyList = app.lookup("CompanyList");
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));

		companyList.redraw();

		comLib.hideLoadMask();
	}else{
		comLib.hideLoadMask();	
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString(getErrorString(resultCode)));
	}
	
}

function onSms_getMovexComapnyListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getMovexComapnyListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onBtnCompanySearchClick(/* cpr.events.CMouseEvent */ e){
	sendCompanyListRequest();
}

function onIpbCompanyKeywordKeyup(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		sendCompanyListRequest();		
	}
}

/*
 * 버튼(btnApply)에서 click 이벤트 발생 시 호출.
 */
function onBtnApplyClick(/* cpr.events.CMouseEvent */ e){
	var companyList = app.lookup("gridCompanyList");
	var dsCompanyList = app.lookup("CompanyList");
	var dsSeletedCompanyList = app.lookup("SeletedCompanyList");
	
	var checkedIndices = companyList.getCheckRowIndices();
	checkedIndices.forEach(function(index){
		
		var row = companyList.getRow(index);					
		dsSeletedCompanyList.addRowData({
			"CompanyID": row.getValue("CompanyID"),
			"CompanyCode": row.getValue("CompanyCode"),
			"CompanyName": row.getValue("CompanyName"),
			"Flag": row.getValue("Flag")
		});		
		
	});
	console.log(dsSeletedCompanyList.getRowDataRanged());
	app.close(dsSeletedCompanyList);
	
}
