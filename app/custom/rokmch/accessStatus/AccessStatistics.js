/************************************************
 * AccessStatistics.js
 * Created at 2021. 1. 27. 오전 10:25:57.
 *
 * @author blue1
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	
	var today = dateLib.getToday("-");
	app.lookup("AMAS_dtiStart").value = today;
	app.lookup("AMAS_dtiEnd").value = today;
}


/* 이벤트  */
function onSearchButtonClick(/* cpr.events.CMouseEvent */ e){
	sendGetAccessStatistics();
}

function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		sendGetAccessStatistics();		
	}
}

function sendGetAccessStatistics() {
	console.log("sendGetAccessStatistics");
	app.lookup("dsAccessStatistics").clear();

	var submision = app.lookup("sms_getAccessStatistics");
	submision.setParameters("startTime", app.lookup("AMAS_dtiStart").value);
	submision.setParameters("endTime", app.lookup("AMAS_dtiEnd").value);
	submision.setParameters("searchKeyword", app.lookup("AMAS_ipbKeyword").value);
	var category = app.lookup("AMAS_cmbSearchCategory").value
	switch (Number(category)) {
	case 1:
		submision.setParameters("searchCategory", "area");
		break;
	case 2:
		submision.setParameters("searchCategory", "name");
		break;
	case 3:
		submision.setParameters("searchCategory", "targetName");
		break;				
	}
	
	// 필수값  초기화
	submision.setParameters("offset", 0);	
	submision.setParameters("limit", 1);
	
	submision.send();	
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getAccessStatisticsSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
		var dsStatistics = app.lookup("dsAccessStatistics");
		var rowCount = dsStatistics.getRowCount();
		
		for (var i=0; i < rowCount; i++) {
			var row = dsStatistics.getRow(i);
			var totalCount = row.getValue("OnDuty"); 
			totalCount += row.getValue("MilitaryPersonnel");
			totalCount += row.getValue("Soldier");
			totalCount += row.getValue("Family");
			totalCount += row.getValue("Resident");
			totalCount += row.getValue("Regular");
			totalCount += row.getValue("OtherUnit");
			totalCount += row.getValue("Foreign");
			row.setValue("SumCount", totalCount);
		}
		app.lookup("AMAS_grdAccessStatistics").redraw();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}

function onSms_getAccessStatisticsSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);	
}

function onSms_getAccessStatisticsSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);	
}
