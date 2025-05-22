/************************************************
 * visitInvite.js
 * Created at 2020. 3. 23. 오전 8:51:04.
 * Prefix : VMVIP_
 * @author fois
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	
	var dmVisitInviteInfo = app.lookup("VisitInviteInfo");
	var initValue = app.getHost().initValue;
	var email = initValue["email"];
	if( email && email.length>0){
		dmVisitInviteInfo.setValue("Email",email)
		app.lookup("VMVIP_ipbEmail").redraw();
	}
	var mode = initValue["mode"];
	if( mode && mode.length>0){
		var opbLinkInfo = app.lookup("VMVIP_opbLinkInfo");
		if( mode == "invite"){
			opbLinkInfo.bind("value").toLanguage("Str_VisitApplicationLinkInfo");
			
			dmVisitInviteInfo.setValue("InviteType",0);
		}else if (mode == "authRegist"){
			opbLinkInfo.bind("value").toLanguage("Str_VisitApplicationAuthLinkInfo");
			
			dmVisitInviteInfo.setValue("InviteType",1);
		}
	}
	var visitIndex = initValue["visitIndex"];
	if( visitIndex != undefined){
		dmVisitInviteInfo.setValue("VisitIndex",visitIndex);
	}else{
		dmVisitInviteInfo.setValue("VisitIndex",0);
	}
	
	var visitorIndex = initValue["visitorIndex"];
	if( visitorIndex != undefined){
		dmVisitInviteInfo.setValue("VisitorIndex",visitorIndex);
	}else{
		dmVisitInviteInfo.setValue("VisitorIndex",0);
	}
	
	var accessGroup = initValue["accessGroup"];
	if( accessGroup != undefined){
		dmVisitInviteInfo.setValue("AccessGroup",accessGroup);
	}else{
		dmVisitInviteInfo.setValue("AccessGroup",0);
	}
}

// "발송" 버튼 click 
function onVMVIP_btnSendClick(/* cpr.events.CMouseEvent */ e){
	var inputEmail = app.lookup("VMVIP_ipbEmail").value;
	var inputTitle = app.lookup("VMVIP_ipbTitle").value;
	var inputMessage = app.lookup("VMVIP_txaMessage").value;
	
	if (!(inputEmail && inputEmail.length>0)){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitEmailInvalid"));
		return;
	}
	
	if (!(inputTitle && inputTitle.length>0)){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitTitleInvalid"));
		return;
	}
	
	if (!(inputMessage && inputMessage.length>0)){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitMessageInvalid"));
		return;
	}
	
	var regExp = new RegExp(/^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/);
	var regExpResult = regExp.test(inputEmail);
	
	if(!(regExpResult)){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitEmailRegExpInvalid"));
		return;
	}
	
	app.lookup("sms_postVisitInvite").send();
}


// 방문 초대 완료
function onSms_postVisitInviteSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		app.close(app.lookup("VisitInviteInfo").getDatas());
	} else {		
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

// 방문 초대 에러
function onSms_postVisitInviteSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// 방문 초대 타임아웃
function onSms_postVisitInviteSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// "취소" 버튼 click
function onVMVIP_btnCancelClick(/* cpr.events.CMouseEvent */ e){
	app.close();
}
