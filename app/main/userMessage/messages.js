/************************************************
 * messages.js
 * Created at 2019. 2. 1. 오전 9:33:46.
 *
 * @author joymrk
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var inputValidManager = createInputValidator(app);

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();	
	
	sendGetUserMessageList();
	/*
	//20190827 정래훈 인풋에 값이 없으면 경고 표시를 주기위해 작성
	var UMMGR_ipbMessageInput = app.lookup("UMMGR_ipbMessageInput").value;
	if(!UMMGR_ipbMessageInput){
		inputValidManager.validate(app.lookup("UMMGR_ipbMessageInput"), "isNull", dataManager.getString("Str_RequiredAlert"));
	}
	* 	*/
}

function sendGetUserMessageList(){
	comLib.showLoadMask("",dataManager.getString("Str_ListLoading"),"",0);
	app.lookup("sms_getUserMessageList").send();
}

// 사용자 메세지 리스트 가져오기 완료
function onSms_getUserMessageListSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	comLib.hideLoadMask();
	var result = app.lookup("Result")
	if( result.getValue("ResultCode") == COMERROR_NONE){		
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
}

// 사용자 메세지 리스트 가져오기 에러
function onSms_getUserMessageListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 사용자 메세지 리스트 가져오기 타임아웃
function onSms_getUserMessageListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 사용자 메세지 추가 클릭
function onUMMGR_btnMessageRegistClick(/* cpr.events.CMouseEvent */ e){
	
	var ipbMessageInput = app.lookup("UMMGR_ipbMessageInput");
	var userMessage = ipbMessageInput.value;
	if( userMessage.length < 1 ){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_EnterYourMessage"));
		return;
	}
		
	var dmUserMessage = app.lookup("UserMessage");
	dmUserMessage.setValue("MessageID",0);
	
	comLib.showLoadMask("",dataManager.getString("Str_Save"),"",0);
	
	app.lookup("sms_postUserMessage").send();
}

// 사용자 메세지 추가 완료
function onSms_postUserMessageSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var result = app.lookup("Result")
	if( result.getValue("ResultCode") == COMERROR_NONE){		
		var dsUserMessageList = app.lookup("UserMessageList");
		var dmUserMessage = app.lookup("UserMessage");
		
		dsUserMessageList.addRowData(dmUserMessage.getDatas());
		dsUserMessageList.commit();
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_SaveNotify"));
		
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
}

// 사용자 메세지 추가 에러
function onSms_postUserMessageSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 사용자 메세지 추가 타임아웃
function onSms_postUserMessageSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 사용자 메세지 수정 시.
function onIpb1ValueChange(/* cpr.events.CValueChangeEvent */ e){	
	comLib.showLoadMask("",dataManager.getString("Str_Save"),"",0);
	
	var grdMessageList = app.lookup("UMMGR_grdMessageList");
	var rowIndex = grdMessageList.getSelectedRowIndex();
	var row = grdMessageList.getRow(rowIndex);
	
	var messageID = row.getValue("MessageID");
	var dmUserMessage = app.lookup("UserMessage");
	dmUserMessage.setValue("MessageID",messageID);
	dmUserMessage.setValue("Message",row.getValue("Message"));
		
	var sms_putUserMessage = app.lookup("sms_putUserMessage");
	sms_putUserMessage.action = "/v1/messages/" + messageID;
	sms_putUserMessage.setParameters("rowIndex", rowIndex);
	sms_putUserMessage.send();	
}

// 사용자 메세지 수정 완료
function onSms_putUserMessageSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/* @type cpr.protocols.Submission */
	var sms_putUserMessage = e.control;
	
	comLib.hideLoadMask();
	var result = app.lookup("Result")
	if( result.getValue("ResultCode") == COMERROR_NONE){		
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_ModifyNotify"));
	} else {
		var rowIndex = parseInt(sms_putUserMessage.getParameters("rowIndex"));
		var grdMessageList = app.lookup("UMMGR_grdMessageList");
		grdMessageList.revertRowData(rowIndex);
		
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
}

// 사용자 메세지 수정 에러
function onSms_putUserMessageSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 사용자 메세지 수정 타임아웃
function onSms_putUserMessageSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 사용자 메세지 삭제 클릭
function onUMMGR_btnMessageDeleteClick(/* cpr.events.CMouseEvent */ e){
		
	var grdMessageList = app.lookup("UMMGR_grdMessageList");
	var rowIndex = grdMessageList.getSelectedRowIndex();
	if(rowIndex != -1){
		var row = grdMessageList.getRow(rowIndex);
		if( row ){	
			var messageID = row.getValue("MessageID");
		
			comLib.showLoadMask("",dataManager.getString("Str_Delete"),"",0);		
			var sms_deleteUserMessage = app.lookup("sms_deleteUserMessage");
			sms_deleteUserMessage.action = "/v1/messages/" + messageID;
			sms_deleteUserMessage.setParameters("rowIndex", rowIndex);
			sms_deleteUserMessage.send();
		}
	}	
}

// 사용자 메세지 삭제
function onSms_deleteUserMessageSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/* @type cpr.protocols.Submission */
	var sms_deleteUserMessage = e.control;
	
	comLib.hideLoadMask();
	var result = app.lookup("Result")
	if( result.getValue("ResultCode") == COMERROR_NONE){
		var rowIndex = parseInt(sms_deleteUserMessage.getParameters("rowIndex"));
		var grdMessageList = app.lookup("UMMGR_grdMessageList");
		grdMessageList.deleteRow(rowIndex);
		grdMessageList.commitData();		
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_DeleteNotify"));
		
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
}

// 사용자 메세지 삭제 에러
function onSms_deleteUserMessageSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 사용자 메세지 삭제 타임아웃
function onSms_deleteUserMessageSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 도움말
function onUMMGR_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}


/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onUMMGR_ipbMessageInputKeyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	/*
	var uMMGR_ipbMessageInput = e.control;
	app.lookup("UMMGR_ipbMessageInput").value = uMMGR_ipbMessageInput.displayText;	
	if(uMMGR_ipbMessageInput.displayText != ""){
		inputValidManager.validate(app.lookup("UMMGR_ipbMessageInput"), "isValid", "");
	}else{
		inputValidManager.validate(app.lookup("UMMGR_ipbMessageInput"), "isNull", dataManager.getString("Str_RequiredAlert"));	
	}
	*/
}
