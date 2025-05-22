/************************************************
 * terminalTinyList.js
 * Created at 2019. 2. 15. 오전 10:12:39.
 *
 * @author joymrk
 ************************************************/

var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var TTLFU_userID;
var TTLFU_terminalIDMap;

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	TTLFU_terminalIDMap = new Map();
	
	var initValue = app.getHost().initValue;	
	TTLFU_userID = initValue["ID"];
	//app.lookup("TTLFU_ipbUserID").value = TTLFU_userID;
	
	sendUserDownloadTerminalListReq();
}

function sendUserDownloadTerminalListReq(){
	var terminalTinyList = app.lookup("TerminalTinyList");
	terminalTinyList.clear();
	
	var sms_getTerminalTinyList = app.lookup("sms_getTerminalTinyList");
	sms_getTerminalTinyList.action = '/v1/users/' +TTLFU_userID + '/terminaluser';
	sms_getTerminalTinyList.send();
}

function onSms_getTerminalTinyListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_getTerminalTinyListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

function Refresh() {	
	app.lookup("TTLFU_grp").redraw();
}

// 사용자가 다운로드된 단말 리스트 가져오기 완료
function onSms_getTerminalTinyListSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	
	if (resultCode == COMERROR_NONE) {
		TTLFU_terminalIDMap.clear();
		
		var terminalTinyList = app.lookup("TerminalTinyList");
		for( var i = 0; i < terminalTinyList.getRowCount(); i++){
			var terminalInfo = terminalTinyList.getRow(i);
			
			if(terminalInfo ){
				var terminalID = terminalInfo.getValue("TerminalID");				
				TTLFU_terminalIDMap.set(terminalID,1);				
			}
		}
		
		var dsTerminalList = dataManager.getTerminalList();
		var dsExtraTerminal = app.lookup("ExtraTerminalList");
		dsExtraTerminal.clear();	
		
		for( var i = 0; i < dsTerminalList.getRowCount(); i++){
			var terminalInfo = dsTerminalList.getRow(i);
			
			if(terminalInfo ){
				var terminalID = terminalInfo.getValue("ID");
								
				if( TTLFU_terminalIDMap.get(terminalID) == undefined ){				
					dsExtraTerminal.addRowData(terminalInfo.getRowData());
				}				
			}
		}
		dsExtraTerminal.commit();
		
		Refresh();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 사용자를 다운로드 할 단말 선택
function onTTLFU__btnTerminalUserAddClick(/* cpr.events.CMouseEvent */ e){
	var grdTerminalList = app.lookup("TTLFU_grdTerminaExtraList");	
	var checkedRowIndices = grdTerminalList.getCheckRowIndices()
	var checkCount = checkedRowIndices.length;
	
	if (checkCount == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelection"));
		return
	} else {
		comLib.showLoadMask("pro",dataManager.getString("Str_Add"),"",checkedRowIndices.length);

		var dsIDList = app.lookup("TerminalIDList");
		dsIDList.clear();

		for( var i = 0; i < checkCount; i++){
			var rowIndex = checkedRowIndices[i];
			var terminalInfo = grdTerminalList.getRow(rowIndex);
						
			var idInfo = {"TerminalID":terminalInfo.getValue("ID")};			
			dsIDList.addRowData(idInfo);
		}
		sendTerminalUserAdd();
	}
}

//단말 전체 추가
function onTTLFU__btnTerminalUserAddAllClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var tTLFU__btnTerminalUserAddAll = e.control;
	
}

// 단말기 사용자 추가 요청
function sendTerminalUserAdd(){
	var dsTerminalIDList = app.lookup("TerminalIDList");
	var count = dsTerminalIDList.getRowCount();
	if (count < 1 ){
		comLib.hideLoadMask();
		
		sendUserDownloadTerminalListReq();
		return;
	}
	var terminalInfo = dsTerminalIDList.getRow(0);
	var terminalID = terminalInfo.getValue("TerminalID");	
	
	var msg = dataManager.getString("Str_TerminalID")+ " : "+terminalID;
	comLib.updateLoadMask(msg);
		
	var dmResult = app.lookup("Result");
		
	var sms_postTerminalUser = new cpr.protocols.Submission("sms_postTerminalUser");
	sms_postTerminalUser.userAttr("userID", String(TTLFU_userID));
	sms_postTerminalUser.action = "/v1/terminals/"+terminalID+"/users/"+TTLFU_userID;	
	sms_postTerminalUser.method = "post";
	sms_postTerminalUser.mediaType = "application/x-www-form-urlencoded";
		
	sms_postTerminalUser.addEventListenerOnce("submit-done", onSms_postTerminalUserSubmitDone);
	sms_postTerminalUser.addEventListenerOnce("submit-error", onSms_postTerminalUserSubmitError);
	sms_postTerminalUser.addEventListenerOnce("submit-timeout", onSms_postTerminalUserSubmitTimeout);
	
	
	var dmDownloadInfo = app.lookup("DownloadInfo");
	dmDownloadInfo.setValue("Total",1 );
	dmDownloadInfo.setValue("Offset",1 );
	sms_postTerminalUser.addRequestData(dmDownloadInfo, "DownloadInfo");
	
	sms_postTerminalUser.addResponseData(dmResult);
		
	sms_postTerminalUser.send();	
}

// 단말기 사용자 추가 완료
function onSms_postTerminalUserSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode");
			
	var dsTerminalIDList = app.lookup("TerminalIDList");
	dsTerminalIDList.realDeleteRow(0);		
	
	sendTerminalUserAdd();	
}

// 단말기 사용자 추가 에러
function onSms_postTerminalUserSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 단말기 사용자 추가 타임아웃
function onSms_postTerminalUserSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 단말에서 사용자 삭제
function onTTLFU__btnTerminalUserDeleteClick(/* cpr.events.CMouseEvent */ e){
	
	var grdTerminalList = app.lookup("TTLFU_grdTerminaList");	
	var checkedRowIndices = grdTerminalList.getCheckRowIndices()
	var delCount = checkedRowIndices.length;
	
	if (delCount == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelection"));
		return
	} else {
		dialogConfirm(app.getRootAppInstance(), "", dataManager.getString("Str_DeleteConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue) {
					comLib.showLoadMask("pro",dataManager.getString("Str_Delete"),"",checkedRowIndices.length);

					var dsDeleteList = app.lookup("TerminalIDList");
					dsDeleteList.clear();

					for( var i = 0; i < delCount; i++){
						var rowIndex = checkedRowIndices[i];
						var terminalInfo = grdTerminalList.getRow(rowIndex);
						
						var delInfo = {"TerminalID":terminalInfo.getValue("TerminalID")};
						dsDeleteList.addRowData(delInfo);
					}
					sendTerminalUserDelete();

				} else {}
			});
		});
	}
}

// 단말에서 사용자 전체 삭제
function onTTLFU__btnTerminalUserDeleteAllClick(/* cpr.events.CMouseEvent */ e){
	var dsTerminalList = app.lookup("TerminalTinyList");	
	var delCount = dsTerminalList.getRowCount();
		
	if (delCount == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelection"));
		return
	} else {
		dialogConfirm(app.getRootAppInstance(), "", dataManager.getString("Str_DeleteConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue) {
					comLib.showLoadMask("pro",dataManager.getString("Str_Delete"),"",delCount);

					var dsDeleteList = app.lookup("TerminalIDList");
					dsDeleteList.clear();

					for( var i = 0; i < delCount; i++){						
						var terminalInfo = dsTerminalList.getRow(i);
						
						var delInfo = {"TerminalID":terminalInfo.getValue("TerminalID")};						
						dsDeleteList.addRowData(delInfo);
					}
					sendTerminalUserDelete();

				} 
			});
		});
	}
}

function sendTerminalUserDelete(){
	var dsDeleteList = app.lookup("TerminalIDList");
	if( dsDeleteList.getRowCount() == 0 ){
		comLib.hideLoadMask();	
		sendUserDownloadTerminalListReq();	
		return;
	}
	
	var delInfo = dsDeleteList.getRow(0);
	var terminalID = delInfo.getValue("TerminalID");
	
	var msg = dataManager.getString("Str_TerminalID")+ " : "+terminalID;
	comLib.updateLoadMask(msg);
				
	var dmResult = app.lookup("Result");
	
	var sms_deleteTerminalUser = new cpr.protocols.Submission("sms_deleteTerminalUser");
				
	sms_deleteTerminalUser.action = "/v1/terminals/"+terminalID+"/terminalusers/"+TTLFU_userID;
	sms_deleteTerminalUser.method = "delete";
	sms_deleteTerminalUser.mediaType = "application/x-www-form-urlencoded";
		
	sms_deleteTerminalUser.addEventListenerOnce("submit-done", onSms_deleteTerminalUserSubmitDone);
	sms_deleteTerminalUser.addEventListenerOnce("submit-error", onSms_deleteTerminalUserSubmitError);
	sms_deleteTerminalUser.addEventListenerOnce("submit-timeout", onSms_deleteTerminalUserSubmitTimeout);
	sms_deleteTerminalUser.addResponseData(dmResult);
	sms_deleteTerminalUser.send();
}

// 단말기 사용자 삭제 완료.
function onSms_deleteTerminalUserSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** @type cpr.protocols.Submission	 */
	var sms_deleteTerminalUser = e.control;
	
	var dsDeleteList = app.lookup("TerminalIDList");
	dsDeleteList.realDeleteRow(0);
	
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode")
	if( resultCode == COMERROR_NONE){
		sendTerminalUserDelete();
	} else {
		sendTerminalUserDelete();		
		//dialogAlert(app, dataManager.getString("Str_Error"), dataManager.getString("Str_UserDelete")+" "+dataManager.getString(getErrorString(resultCode)));
		//sendUserDownloadTerminalListReq();
	}
}

// 단말기 사용자 삭제 에러
function onSms_deleteTerminalUserSubmitError(/* cpr.events.CSubmissionEvent */ e){	
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR)
}

// 단말기 사용자 삭제 타임아웃
function onSms_deleteTerminalUserSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){	
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT)
}


