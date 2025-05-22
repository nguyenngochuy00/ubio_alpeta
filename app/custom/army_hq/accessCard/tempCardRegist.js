/************************************************
 * tempCardRegist.js
 * Created at 2021. 4. 21. 오후 5:57:58.
 *
 * @author blue1
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	app.lookup("VMVCR_cmbCardType").value = 100;
}

/* 버튼 클릭 이벤트 */
function onVMVCR_btnCancelClick(/* cpr.events.CMouseEvent */ e){
	app.close(false);	
}

function onVMVCR_btnRegistClick(/* cpr.events.CMouseEvent */ e){
	var tempCardInfo = app.lookup("TempCardRegist");

	if( tempCardInfo.getValue("CardCount") == 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "신규발급 수량을 입력해주세요.");
		return;
	}	
	
	app.lookup("sms_postTempCardRegist").send();
	
}

/* 서브미션 이벤트  */
function onSms_postTempCardRegistSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "등록되었습니다.");
		app.close(true);
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}	
}

function onSms_postTempCardRegistSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_postTempCardRegistSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);	
}
