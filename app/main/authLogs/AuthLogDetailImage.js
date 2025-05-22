/************************************************
 * AuthLogDetailImage.js
 * Created at 2022. 4. 21. 오후 5:44:38.
 *
 * @author otpap
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	var initValue = app.getHost().initValue;
	var visitIndex = initValue["indexKey"];
	console.log(visitIndex);
	var smsGetAuthLogListDetail = app.lookup("sms_getAuthLogListDetail");
	smsGetAuthLogListDetail.action = "/v1/authLogs/" + visitIndex;	
	smsGetAuthLogListDetail.setParameters("offset", 0);	
		
	smsGetAuthLogListDetail.send();	
}

function onSms_getAuthLogListDetailSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){ // 로그인 상태		
		var img = app.lookup("AuthLogDetail").getValue("LogImage");
		
		if( img.length > 0){
			app.lookup("image").src = "data:image/png;base64," + img;
			console.log(app.lookup("image").src);
		}else{
			app.lookup("image").src = "../../../theme/images/noImg.gif";		
		}
		
		app.lookup("image").redraw();
	} else if( resultCode == 4){
		dialogAlert(app, dataManager.getString("Str_Info") , dataManager.getString("Str_LastData"));
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed") , dataManager.getString("Str_NoSearchResult"));
		dialogAlert(app, dataManager.getString("Str_Failed") , dataManager.getString(getErrorString(resultCode)));
		//app.close();
	}
}

function onSms_SubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onSms_SubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}
