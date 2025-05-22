/************************************************
 * visitCardRegist.js
 * Created at 2021. 1. 30. 오전 10:42:13.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
}

// 방문증 등록 클릭
function onVMVCR_btnRegistClick(/* cpr.events.CMouseEvent */ e){
	var visitCardInfo = app.lookup("VisitCardRegist");
	if( visitCardInfo.getValue("CardType") == 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "방문증 종류가 선택되지 않았습니다.");
		return;	
	}
	if( visitCardInfo.getValue("CardCount") == 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "신규발급 수량을 입력해주세요.");
		return;
	}	
	
	app.lookup("sms_postVisitCardRegist").send();
}

// 방문증 등록 완료
function onSms_postVisitCardRegistSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "등록되었습니다.");
		app.close(true);
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 방문증 등록 에러
function onSms_postVisitCardRegistSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

// 방문증 등록 타임아웃
function onSms_postVisitCardRegistSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
// 취소 버튼 클릭
function onVMVCR_btnCancelClick(/* cpr.events.CMouseEvent */ e){
	app.close(false);
}



