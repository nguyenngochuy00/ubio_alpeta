/************************************************
 * musteringTerminalList.js
 * Created at 2020. 8. 24. 오전 11:35:52.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var MMZTS_inout = 0;
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	var initValue = app.getHost().initValue;
	var musteringID = initValue["ID"];
	MMZTS_inout = initValue["InOut"];
	
	var sms_getMusteringTerminalList = app.lookup("sms_getMusteringTerminalList");	
	sms_getMusteringTerminalList.setParameters("musteringID", 0);
	sms_getMusteringTerminalList.setParameters("inout", MMZTS_inout);
	sms_getMusteringTerminalList.send();
}

// 추가 가능한 머스터링 단말기 리스트 가져오기 완료
function onSms_getMusteringTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode"); 
	if( resultCode == 0 ){		
	}else{
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}

// 추가 가능한 머스터링 단말기 리스트 가져오기 에러
function onSms_getMusteringTerminalListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR)
}

// 추가 가능한 머스터링 단말기 리스트 가져오기 타임아웃
function onSms_getMusteringTerminalListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 단말 선택 적용
function onMMZTS_btnApplyClick(/* cpr.events.CMouseEvent */ e){
	var dsSelectedList = app.lookup("TerminalSelectedList");
	dsSelectedList.clear();
	
	var grdTerminalList = app.lookup("MMZTS_grdTerminalList");
	var indices = grdTerminalList.getCheckRowIndices();
	
	indices.forEach(function(index){
		var row = grdTerminalList.getRow(index);		
		var terminalID = row.getValue("TerminalID");
		dsSelectedList.addRowData({"TerminalID":terminalID,"InOut":MMZTS_inout});
	});
	
	app.close(dsSelectedList);
}

// 단말 선택 취소
function onMMZTS_btnCancelClick(/* cpr.events.CMouseEvent */ e){
	app.close();
}
