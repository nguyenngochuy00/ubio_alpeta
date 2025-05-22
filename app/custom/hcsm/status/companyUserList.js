/************************************************
 * companyUserList.js
 * Created at 2022. 8. 1. 오후 5:32:11.
 *
 * @author sep
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
dataManager = getDataManager();
var comLib; // 로딩 팝업

var listPageRowCount = 15; // 한 페이지당 보이는 행 수

// 페이지 번호에 맞춰 회사 사용자 리스트 불러오기
function getHCSMCompnayUserListWithPaging(currentPageIndex){
	var initValue = app.getHost().initValue;
	var companyID = initValue["CompanyID"];
	var startTime = initValue["StartTime"];
	var total = initValue["Total"];
	var companyName = initValue["CompanyName"];
	
	var offset = (currentPageIndex - 1) * listPageRowCount;
	var limit = listPageRowCount;
	
	if(total < limit){
		limit = total;
	}
	
	var userCountOutPut = app.lookup("HCSM_userCountOutPut");
	var pageIndexer = app.lookup("companyUserListPageIndexer");
	
	var remainderRowCount = userCountOutPut.value % listPageRowCount;
	
	if(currentPageIndex > 1 && remainderRowCount != 0){	
		// 마지막 페이지 진입시 가져오는 사용자 수 최대값을 표시비율에 맞춰 설정된 사용자 수로 제한 해주기 위한 처리	
		if(currentPageIndex == Math.floor(pageIndexer.viewPageCount)){
			limit = remainderRowCount;
		}
	}
	
	//console.log("limit : " + limit);
	
	var smsGetHCSMCompanyUserList = app.lookup("sms_getHCSMCompanyUserList");
	smsGetHCSMCompanyUserList.setParameters("startTime", startTime);
	smsGetHCSMCompanyUserList.setParameters("endTime", startTime);
	smsGetHCSMCompanyUserList.setParameters("offset", offset);
	smsGetHCSMCompanyUserList.setParameters("limit", limit);
	smsGetHCSMCompanyUserList.setParameters("searchOnSite", 2);
	smsGetHCSMCompanyUserList.setParameters("searchCompany", companyID);
	
	smsGetHCSMCompanyUserList.send();
}

function makePageIndexer(totalUserCount, listPageRowCount){
	
	var pageIndexer = app.lookup("companyUserListPageIndexer");
		pageIndexer.totalRowCount = totalUserCount;
		pageIndexer.pageRowCount = listPageRowCount;
		
		pageIndexer.viewPageCount = (totalUserCount / listPageRowCount) + (totalUserCount % listPageRowCount > 0);	
		
		//console.log("pageIndexer.viewPageCount : " + pageIndexer.viewPageCount);

		if(pageIndexer.viewPageCount > 10){
			// 10페이지 초과면 10페이지만 보이도록
			pageIndexer.viewPageCount = 10;		
		}
}

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){	
	comLib = createComUtil(app.getHostAppInstance());
	// createComUtil(app)을 사용하면 로딩 팝업창이 제대로 보이지 않음
	comLib.showLoadMask("", dataManager.getString("Str_ListLoading"), "", 0);
	
	var totalUserCount = app.getHost().initValue["Total"];
		
	var userCountOutPut = app.lookup("HCSM_userCountOutPut");
	userCountOutPut.value = totalUserCount;
	userCountOutPut.redraw();
	
	var companyName = app.getHost().initValue["CompanyName"];
	
	var companyNameOutPut = app.lookup("HCSM_companyNameOutput");
	companyNameOutPut.value = companyName;
	companyNameOutPut.redraw();
	
	var pageIndexer = app.lookup("companyUserListPageIndexer");	
	var totalUserCount = app.getHost().initValue["Total"];
	makePageIndexer(totalUserCount, listPageRowCount);
	
	// nationalityID를 이름으로 바꾸기위한 comboBox 세팅
	var nationalityCell = app.lookup("nationalityComb");
	nationalityCell.deleteAllItems();
	nationalityCell.setItemSet(dataManager.getNationalityList(), {
		label: "NationalityName",
		value: "NationalityID"
	});	
	
	// teamID를 이름으로 바꾸기위한 comboBox 세팅	
	var teamCell = app.lookup("teamCombo");
	teamCell.deleteAllItems();
	teamCell.setItemSet(dataManager.getTeamList(), {
		label: "TeamName",
		value: "TeamID"
	});
	
	getHCSMCompnayUserListWithPaging(1);
	
}

/*
 * sms_getHCSMCompanyUserList 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getHCSMCompanyUserListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode");
	
	var dmTotal = app.lookup("Total");
	var dsUserList = app.lookup("UserList");
	
	if( resultCode == COMERROR_NONE ){
		
		var nationalityCell = app.lookup("nationalityComb");
		var teamCell = app.lookup("teamCombo");
		
		// partID를 이름으로 바꾸기
		var count = dsUserList.getRowCount();
		var i;
		for(i = 0; i < count; i++){
			var nationalityID = dsUserList.getValue(i, "NationalityID");
			var teamID = dsUserList.getValue(i, "TeamID");
			var partID = dsUserList.getValue(i, "PartID");
			
			var partCell = app.lookup("partCombo");
			partCell.deleteAllItems();
			
			var dsPart = app.lookup("HCSMPart");
			dsPart.clear();
			dataManager.getPartList().copyToDataSet(dsPart);
			// TeamID에 맞는 PartID만 남기기
			dsPart.setFilter('dsPart.getValue(i, "TeamID") == teamID');

			partCell.setItemSet(dsPart, {
				label: "PartName",
				value: "PartID"
			});
			
			nationalityCell.value = nationalityID;
			teamCell.value = teamID;
			partCell.value = partID;
		} // end for
		
		app.lookup("HCSMCompanyUserGrid").redraw();
		
	}else{
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 */
function onSms_getHCSMCompanyUserListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_ERROR);
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 */
function onSms_getHCSMCompanyUserListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

/*
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onCompanyUserListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var companyUserListPageIndexer = e.control;
	var companyUserListGrid = app.lookup("HCSMCompanyUserGrid");
	
	var curIndex = companyUserListPageIndexer.currentPageIndex;
	companyUserListGrid.rowIndexerStartNum = (curIndex * 15) - 14;
	
	comLib.showLoadMask("", dataManager.getString("Str_ListLoading"), "", 0);
	getHCSMCompnayUserListWithPaging(curIndex);
}
