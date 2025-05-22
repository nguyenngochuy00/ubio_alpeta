/************************************************
 * percentSetting.js
 * Created at 2022. 8. 2. 오후 2:36:49.
 *
 * @author sep
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
dataManager = getDataManager();
var returnValue = 0; // 표시 비율 변경 여부 확인용 (0이면 변경 안됌, 1이면 변경 됌)

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	// option_visitiors 테이블의  param1 컬럼 사용을 위해 메모리에 저장된 option 값 불러오기.
	app.lookup("sms_getOption").send();
}

/*
 * sms_getOption 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var dmResult = app.lookup("Result");
	if (dmResult.getValue("ResultCode") != COMERROR_NONE) {		
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Error")+" : "+dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
		return;
	}
			
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	
	if( resultCode == COMERROR_NONE) { // optionVisitor 테이블의 param1 컬럼을 사용
		var dmOptionVisitor = app.lookup("OptionVisitor");
		app.lookup("percentEditor").value = dmOptionVisitor.getValue("Param1");
		
		app.lookup("percentEditor").redraw();
	}
}

/*
 * 넘버 에디터에서 value-change 이벤트 발생 시 호출.
 * NumberEditor의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onPercentEditorValueChange(/* cpr.events.CValueChangeEvent */ e){

	var percentEditor = app.lookup("percentEditor");
	var optionVisitor = app.lookup("OptionVisitor");
	
	if(percentEditor.value > 100){
		// 입력 퍼센트가 100이상이면  경고창 띄운 후, 기존 설정 값으로 복귀		
		openAlert("Str_Warning", "Str_OverPercentSetting");
		
		percentEditor.value = optionVisitor.getValue("Param1");	
	}
	
}

/* 현재 percentSetting 페이지가 dialog로 열린 상태로  기존 dialogAlert 함수 사용시 
 * 현재 팝업창이 새로 뜨는 알림 팝업으로 대체되어 알림 팝업을 끄면 기존 퍼센트 설정 페이지 닫힘 .
 */
function openAlert(headerTitle, message){
	var appID = "app/dialog/alert";
		app.getRootAppInstance().openDialog(appID, {width : 205, height : 155}, function(dialog){		
			
			dialog.bind("headerTitle").toLanguage(headerTitle);
			dialog.initValue = dataManager.getString(message);
			dialog.resizable = false;		
			dialog.modal = true;		
		});
}


/*
 * 버튼(HCSM_btnSavePercent)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onHCSM_btnSavePercentClick(/* cpr.events.CMouseEvent */ e){
	
	var percentInput = app.lookup("percentEditor");
	var percentValue = percentInput.value;
	
	var dmParam1 = app.lookup("Param1");
	dmParam1.setValue("Param1", percentValue);
	
	app.lookup("sms_putCheckStatusOption").send();
	
}


/*
 * sms_putCheckStatusOption 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_putCheckStatusOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){

	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	
	if( resultCode == COMERROR_NONE ) {
		var param1 = app.lookup("Param1").getValue("Param1");
		app.lookup("OptionVisitor").setValue("Param1", param1);
		 	
		openAlert("Str_Success", "Str_Saved");	
		returnValue = 1; // 표시 비율 값 변경 알림
		
		app.lookup("sms_getOption").send();
		 
	} else {
		openAlert("Str_Failed", getErrorString(resultCode));		
	}
	
}


/*
 * sms_putCheckStatusOption 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_putCheckStatusOptionSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_ERROR);
}


/*
 * sms_putCheckStatusOption 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_putCheckStatusOptionSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * sms_updateOption 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_updateOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_updateOption = e.control;
	var dmResult = app.lookup("Result");
	if (dmResult.getValue("ResultCode") != COMERROR_NONE) {		
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Error")+" : "+dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
		return;
	}
	
}


/*
 * 루트 컨테이너에서 unload 이벤트 발생 시 호출.
 * 앱이 언로드된 후 발생하는 이벤트입니다.
 */
function onBodyUnload(/* cpr.events.CEvent */ e){
	app.close(returnValue);
}
