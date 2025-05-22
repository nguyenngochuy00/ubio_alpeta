/************************************************
 * statusDetail.js
 * Created at 2022. 8. 1. 오후 4:33:26.
 *
 * @author sep
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
dataManager = getDataManager();
var comLib;

var initValue = app.getHost().initValue;
var startTime = initValue["StartTime"];

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app.getHostAppInstance());
	// createComUtil(app)을 사용하면 로딩 팝업창이 제대로 보이지 않음
	comLib.showLoadMask("", dataManager.getString("Str_ListLoading"), "", 0);
	
	var smsGetStatusDetail = app.lookup("sms_getStatusDetail");
	smsGetStatusDetail.setParameters("startTime", startTime);
	smsGetStatusDetail.send();
	
}


/*
 * sms_getStatusDetail 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getStatusDetailSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode");
	
	var inSiteInfoList = app.lookup("InSiteInfoList");
	var compnayStatusDetail = app.lookup("CompanyStatusDetail");	
	var dsCompany = app.lookup("HCSMCompany");	
	dsCompany.clear();		
	dataManager.getCompanyList().copyToDataSet(dsCompany);	
	
	if( resultCode == COMERROR_NONE ){	
		var statusDetailGrid = app.lookup("statusDetailGrid");
		
		var i;
		var count = inSiteInfoList.getRowCount();
		for(i = 0; i < count; i++){
			
			var companyID = inSiteInfoList.getValue(i, "CompanyID");
			var inSite = inSiteInfoList.getValue(i, "Total");			
	
			var companyName;
			if (companyID == -1){
				companyName = "Total"; // 총 합계
				// 첫번째 행에 셋팅
				compnayStatusDetail.insertRowData(0, false, {
					"CompanyID": companyID,
					"CompanyName": companyName,
					"InSite": inSite
				});
				//console.log("companyID : " + companyID + " / " + companyName);
				
			} else if (companyID == 0){
				if(inSiteInfoList.getValue(i, "Total") != 0){
					companyName = "---"; // 저장되어 있는 회사 외 다른 회사들
					// 마지막 행에 셋팅
					compnayStatusDetail.addRowData({
						"CompanyID": companyID,
						"CompanyName": companyName,
						"InSite": inSite
					});
					//console.log("companyID : " + companyID + " / " + companyName);
				}			
				
			} else {		
				var j;
				for(j = 0; j < dsCompany.getRowCount(); j++){
					if( dsCompany.getValue(j, "CompanyID") == companyID ){
						companyName = dsCompany.getValue(j, "CompanyName");
						break;
						//console.log("companyID : " + companyID + " / " + companyName);
					}
				}
				
				if(inSite != 0){
					// total과  --- 사이 행에 셋팅
					compnayStatusDetail.insertRowData(0, true, {
						"CompanyID": companyID,
						"CompanyName": companyName,
						"InSite": inSite
					});
				}
				
			} // end else
			
		} // end for (count)	
		
		//statusDetailGrid.sort("CompanyID");
		statusDetailGrid.commitData(); // 그리드에 row 변경 효과 적용을 피하기 위한 처리
		statusDetailGrid.redraw();
		comLib.hideLoadMask();		
		
	} else {
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getStatusDetailSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_ERROR);
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getStatusDetailSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * 그리드에서 cell-click 이벤트 발생 시 호출.
 * Grid의 Cell 클릭시 발생하는 이벤트.
 */
function onStatusDetailGridCellClick(/* cpr.events.CGridMouseEvent */ e){

	var statusDetailGrid = e.control;
	
	var clickRowIndex = e.rowIndex;
	var clickCellIndex = e.cellIndex;

	// In site 셀을 클릭했을 때만 상세 팝업을 띄우도록 처리
	if(clickCellIndex == 2 && clickRowIndex > 0){
		
		var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
			content: { 
				"Target": DLG_HC_SAUDI_MARJAN_STATUS_LABORERS_INFO,
				"InitVal": {
					"StartTime": startTime,
					"CompanyID": e.row.getValue("CompanyID"),
					"Total": e.row.getValue("InSite"),
					"CompanyName": e.row.getValue("CompanyName")
				}
			 }
		});
	
		app.getHostAppInstance().dispatchEvent(selectionEvent);		
	}
	
}