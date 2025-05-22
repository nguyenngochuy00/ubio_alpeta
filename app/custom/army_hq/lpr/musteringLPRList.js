/************************************************
 * musteringLPRList.js
 * Created at 2021. 2. 8. 오후 6:40:07.
 *
 * @author blue1
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var MLL_inout = 0;

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	var initValue = app.getHost().initValue;
	MLL_inout = initValue["InOut"];
	
	app.lookup("sms_getMusteringLpr").send();
}


/* 버튼 이벤트 */
function onMLL_btnApplyClick(/* cpr.events.CMouseEvent */ e){
	var dsSelectedList = app.lookup("LPRSelectedList");
	dsSelectedList.clear();
	
	var grdLprList = app.lookup("MLL_grdLPRList");
	var indices = grdLprList.getCheckRowIndices();
	
	indices.forEach(function(index){
		var row = grdLprList.getRow(index);	
		console.log(row.getRowData());	
		var deviceID = row.getValue("DeviceID");
		dsSelectedList.addRowData({"DeviceID":deviceID,"InOut":MLL_inout});
	});
	
	app.close(dsSelectedList);	
}

function onMLL_btnCancelClick(/* cpr.events.CMouseEvent */ e){
	app.close();	
}

/* 서브미션에서  이벤트 발생 시  */
function onSms_getMusteringLprSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode"); 
	if( resultCode == 0 ){		
	}else{
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}

function onSms_getMusteringLprSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_getMusteringLprSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}
