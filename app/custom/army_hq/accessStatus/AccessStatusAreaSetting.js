/************************************************
 * AccessStatusAreaSetting.js
 * Created at 2021. 1. 27. 오후 3:44:33.
 *
 * @author blue1
 ************************************************/

var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	sendMusteringListReq();
}

function sendMusteringListReq(){
	var sms_getMusteringList = app.lookup("sms_getMusteringList");
	sms_getMusteringList.send();
}

// 구역 추가 버튼 클릭
function onMMZMP_btnZoneAddClick(/* cpr.events.CMouseEvent */ e){
	
	var appld = "app/custom/army_hq/areaNDeviceManagement/MusteringRegist";
	app.openDialog(appld, {width : 360, height : 200}, function(dialog){
		//dialog.bind("headerTitle").toLanguage("Str_Enrollment");
		dialog.style.header.css("background-color", "#528443");
		dialog.headerTitle = ("구역 추가");
		dialog.modal = true;
	}).then(function(returnValue){

		var result = returnValue["Result"];
		if( result == 0 ){
			var zoneInfo= returnValue["MusteringInfo"];

			if( zoneInfo. MusteringName.length < 1 ){
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("NoNameEntered"), function(/*cpr.controls.Dialog*/dialog){
					dialog.addEventListenerOnce("close", function(e) {
						app.lookup("MMZMP_ipbMusteringName").focus(true);			
					});
				});	
				
				return false;
			}
			
			var dmZoneInfo = app.lookup("MusteringInfo");			
			dmZoneInfo.setValue("MusteringID", 0);
			dmZoneInfo.setValue("MusteringName", zoneInfo.MusteringName);
			dmZoneInfo.setValue("MusteringDesc", zoneInfo.MusteringDesc);
	
			var sms_postMusteringInfo = app.lookup("sms_postMusteringInfo");
			sms_postMusteringInfo.send();
			
		}
	});
}

// 구역 정보 수정
function onMMZMP_btnZoneModifyClick(/* cpr.events.CMouseEvent */ e){
	comLib.showLoadMask("", "구역 수정", "", 0);
	var grdMusteringList = app.lookup("MMZMP_grdMusteringList");
	var row = grdMusteringList.getSelectedRow();
	if( row ){
		var opbMusteringName = app.lookup("MMZMP_ipbMusteringName").text;
	var opbMusteringDesc = app.lookup("MMZMP_ipbMusteringDesc").text;
	if( opbMusteringName.length < 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("NoNameEntered"), function(/*cpr.controls.Dialog*/dialog){
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("MMZMP_ipbMusteringName").focus(true);			
			});
		});	
		
		return false;
	}
	var zoneInfo= app.lookup("MusteringInfo");
	var musteringID = zoneInfo.getValue("MusteringID");
	
	var sms_putMusteringInfo = app.lookup("sms_putMusteringInfo");
	sms_putMusteringInfo.action = "/v1/rollcalls/"+musteringID;
	sms_putMusteringInfo.send();
		
	}else{
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelection"));	
	}
	
}

// 구역 삭제 클릭
function onMMZMP_btnZoneDeleteClick(/* cpr.events.CMouseEvent */ e){
	comLib.showLoadMask("", "구역 삭제", "", 0);
	var zoneInfo= app.lookup("MusteringInfo");
	var musteringID = zoneInfo.getValue("MusteringID");
	if( musteringID == "" ){
		return;
	}
	
	if (musteringID == AccessorMusteringID) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "문서고는 삭제할 수 없습니다.");
		return;
	}
	
	var sms_deleteMustering = app.lookup("sms_deleteMustering");	
	sms_deleteMustering.action = "/v1/rollcalls/"+musteringID;
	sms_deleteMustering.send();
}

// 구역 입구 단말 추가 클릭
function onMMZMP_btnTerminalInAddClick(/* cpr.events.CMouseEvent */ e){
	processMusteringTerminalAdd(MusteringIn);	
}

// 입구 단말 삭제 클릭
function onMMZMP_btnTerminalInDeleteClick(/* cpr.events.CMouseEvent */ e){
	var grdTerminalIn = app.lookup("MMZMP_grdTerminalIn");
	processMusteringTerminalDelete(grdTerminalIn);	
}

// 구역 출구 단말 추가
function onMMZMP_btnTerminalOutAddClick(/* cpr.events.CMouseEvent */ e){
	processMusteringTerminalAdd(MusteringOut);
}

// 구역 출구 단말 삭제
function onMMZMP_btnTerminalOutDeleteClick(/* cpr.events.CMouseEvent */ e){
	var grdTerminalOut = app.lookup("MMZMP_grdTerminalOut");
	processMusteringTerminalDelete(grdTerminalOut);	
}

// 머스터링 구역 선택 변경
function onMMZMP_grdMusteringListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var rowIndex = app.lookup("MMZMP_grdMusteringList").getSelectedRowIndex();
	
	if(rowIndex < 0){return;
	}
	var rowData = app.lookup("MusteringList").getRow(rowIndex);
	var zoneInfo= app.lookup("MusteringInfo");
	zoneInfo.setValue("MusteringID", rowData.getValue("MusteringID"));
	zoneInfo.setValue("MusteringName", rowData.getValue("MusteringName"));
	zoneInfo.setValue("MusteringDesc", rowData.getValue("MusteringDesc"));
	
	app.lookup("MMZMP_grpMusteringInfo").redraw();
	
	sendMusteringTerminalListReq();
}

function processMusteringTerminalAdd( inout ){
	var grdMusteringList = app.lookup("MMZMP_grdMusteringList");
	var row = grdMusteringList.getSelectedRow();
	if( row ){		
		var appld = "app/custom/army_hq/areaNDeviceManagement/musteringTerminalList" + "?" + dataManager.getSystemVersion();
		app.getRootAppInstance().openDialog(appld, {width : 400, height : 600}, function(dialog){		
			dialog.initValue = {"TerminalID":row.getValue("MusteringID"),"InOut":inout};
			dialog.bind("headerTitle").toLanguage("Str_TerminalSelect");
			dialog.style.header.css("background-color", "#528443");
			dialog.modal = true;
		}).then(function(result){
			
			if( result ){
				var dsTerminalList = app.lookup("TerminalList");
				dsTerminalList.clear();
				result.copyToDataSet(dsTerminalList);
												
				var total = dsTerminalList.getRowCount();
				comLib.showLoadMask("pro",dataManager.getString("Str_Save"),"",total);
				sendMusteringTerminalAdd();
			}
		});
	} else{
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectionZone"));
		return;
	}
}

function processMusteringTerminalDelete( grdTerminal ){	
	var checkedRowIndices = grdTerminal.getCheckRowIndices()
	var delCount = checkedRowIndices.length;
	
	if (delCount == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelection"));
		return
	} else {
		dialogConfirmAMHQ(app.getRootAppInstance(), "단말기 삭제", dataManager.getString("Str_DeleteConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue) {
					comLib.showLoadMask("pro",dataManager.getString("Str_Delete"),"",checkedRowIndices.length);

					var dsDeleteList = app.lookup("DeleteList");
					dsDeleteList.clear();

					for( var i = 0; i < delCount; i++){
						var rowIndex = checkedRowIndices[i];
						var terminalInfo = grdTerminal.getRow(rowIndex);
						
						var delInfo = {"TerminalID":terminalInfo.getValue("TerminalID")};
						dsDeleteList.addRowData(delInfo);
					}
					sendMusteringTerminalDelete();

				} else {}
			});
		});
	}
}

function sendMusteringTerminalAdd(){
	var dmMusteringInfo = app.lookup("MusteringInfo");
	var musteringID = dmMusteringInfo.getValue("MusteringID");
	
	var dsTerminalList = app.lookup("TerminalList");
	if( dsTerminalList.getRowCount() < 1 ){
		comLib.hideLoadMask();
		sendMusteringTerminalListReq();
		return
	}
	var row = dsTerminalList.getRow(0);
	var dmMusteringTerminal = app.lookup("MusteringTerminal");
	dmMusteringTerminal.setValue("TerminalID",row.getValue("TerminalID"));
	dmMusteringTerminal.setValue("InOut",row.getValue("InOut"));
	
	var sms_postMusteringTerminal = app.lookup("sms_postMusteringTerminal");
	sms_postMusteringTerminal.action = "/v1/rollcalls/"+musteringID+"/terminals";
	sms_postMusteringTerminal.send();
	
	dsTerminalList.realDeleteRow(0);
}

function sendMusteringTerminalDelete(){
	var dsDeleteList = app.lookup("DeleteList");
	if( dsDeleteList.getRowCount() == 0 ){
		comLib.hideLoadMask();	
		sendMusteringTerminalListReq();	
		return;
	}
	var dmMusteringInfo = app.lookup("MusteringInfo");
	var musteringID = dmMusteringInfo.getValue("MusteringID");
	
	var delInfo = dsDeleteList.getRow(0);
	var terminalID = delInfo.getValue("TerminalID");

	var msg = dataManager.getString("Str_TerminalID")+ " : "+terminalID;
	comLib.updateLoadMask(msg);
	
	var sms_deleteMusteringTerminal = new cpr.protocols.Submission("sms_deleteMusteringTerminal");
	sms_deleteMusteringTerminal.action = "/v1/rollcalls/"+musteringID+"/terminals/"+terminalID;
	sms_deleteMusteringTerminal.method = "delete";
	sms_deleteMusteringTerminal.mediaType = "application/x-www-form-urlencoded";
			
	sms_deleteMusteringTerminal.addResponseData(app.lookup("Result"), false, "Result");
		
	sms_deleteMusteringTerminal.addEventListenerOnce("submit-done", onSms_deleteMusteringTerminalSubmitDone);
	sms_deleteMusteringTerminal.addEventListenerOnce("submit-error", onSms_deleteMusteringTerminalSubmitError);
	sms_deleteMusteringTerminal.addEventListenerOnce("submit-timeout", onSms_deleteMusteringTerminalSubmitTimeout);
	sms_deleteMusteringTerminal.send();
}

function sendMusteringTerminalListReq(){
	var grdMusteringList = app.lookup("MMZMP_grdMusteringList");
	var row = grdMusteringList.getSelectedRow();
	if( row ){	
		var dsTerminalList = app.lookup("TerminalList");
		dsTerminalList.clear();
		
		var musteringID = row.getValue("MusteringID");
		
		var sms_getMusteringTerminalList = app.lookup("sms_getMusteringTerminal");	
		sms_getMusteringTerminalList.action="/v1/rollcalls/"+musteringID+"/terminals";
		sms_getMusteringTerminalList.setParameters("inout", 0);
		sms_getMusteringTerminalList.send();
	}
}


// 머스터링 구역 리스트 가져오기 완료
function onSms_getMusteringListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var resultCode = app.lookup("Result").getValue("ResultCode"); 
	if( resultCode == 0 ){
		
	}else{
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}

// 머스터링 구역 리스트 가져오기 에러
function onSms_getMusteringListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR)
}

// 머스터링 구역 리스트 가져오기 타임아웃
function onSms_getMusteringListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT)
}


// 구역 추가 완료
function onSms_postMusteringInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode"); 
	if( resultCode == 0 ){		
		var zoneInfo = app.lookup("MusteringInfo");
		
		var musteringList = app.lookup("MusteringList");
		var insertRow = musteringList.addRowData(zoneInfo.getDatas());
		
		var grdMusteringList = app.lookup("MMZMP_grdMusteringList");
		grdMusteringList.selectRows([insertRow.getIndex()], false);
		app.lookup("MMZMP_grpMusteringInfo").redraw();
		app.lookup("TerminalInList").clear();
		app.lookup("TerminalOutList").clear();
		app.lookup("LPRDeviceInList").clear();
		app.lookup("LPRDeviceOutList").clear();
	}else{
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}

// 구역 추가 에러
function onSms_postMusteringInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR)
}

// 구역 추가 타임아웃
function onSms_postMusteringInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT)
}


// 구역 삭제 완료
function onSms_deleteMusteringSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();	
	var resultCode = app.lookup("Result").getValue("ResultCode"); 
	if( resultCode == 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_ARMYHQ_AccessAreaDelete"));
		var zoneInfo= app.lookup("MusteringInfo");
		var musteringID = zoneInfo.getValue("MusteringID");
		var musteringList = app.lookup("MusteringList");
		var row = musteringList.findFirstRow("MusteringID == '"+musteringID+"'");
		if( row ){
			musteringList.realDeleteRow(row.getIndex());
		}
		
		zoneInfo.clear();
		app.lookup("MMZMP_grpMusteringInfo").redraw();
		app.lookup("MMZMP_grdMusteringList").redraw();
		app.lookup("TerminalInList").clear();
		app.lookup("TerminalOutList").clear();
		app.lookup("LPRDeviceInList").clear();
		app.lookup("LPRDeviceOutList").clear();
	}else{
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}

// 구역 삭제 에러
function onSms_deleteMusteringSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR)
}

// 구역 삭제 타임아웃
function onSms_deleteMusteringSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 머스터링 정보 수정 완료
function onSms_putMusteringInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode"); 
	if( resultCode == 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_ARMYHQ_AccessAreaUpdate"));	
		var zoneInfo= app.lookup("MusteringInfo");
		var musteringID = zoneInfo.getValue("MusteringID");
		var musteringList = app.lookup("MusteringList");
		var row = musteringList.findFirstRow("MusteringID == '"+musteringID+"'");
		if( row ){
			row.setValue("MusteringName",zoneInfo.getValue("MusteringName"));
			row.setValue("MusteringDesc",zoneInfo.getValue("MusteringDesc"));
		}		
		app.lookup("MMZMP_grdMusteringList").redraw();
	}else{
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}

// 머스터링 정보 수정 에러
function onSms_putMusteringInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// 머스터링 정보 수정 타임아웃
function onSms_putMusteringInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}


// 구역 단말기 추가 완료
function onSms_postMusteringTerminalSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode"); 
	if( resultCode == 0 ){
		sendMusteringTerminalAdd();
	}else{
		comLib.hideLoadMask();
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}

// 구역 단말기 추가 에러
function onSms_postMusteringTerminalSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR)
}

// 구역 단말기 추가 타임아웃
function onSms_postMusteringTerminalSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 구역 단말 리스트 가져오기 에러
function onSms_getMusteringTerminalSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var terminalInList = app.lookup("TerminalInList");
	terminalInList.clear();
	var terminalOutList = app.lookup("TerminalOutList");
	terminalOutList.clear();
	
	var resultCode = app.lookup("Result").getValue("ResultCode"); 
	if( resultCode == 0 ){
		var dsTerminalList = app.lookup("TerminalList");
		var count = dsTerminalList.getRowCount();
		for( var i=0; i<count; i++){
			var terminalInfo = dsTerminalList.getRow(i);
			if( terminalInfo ){
				var inout = terminalInfo.getValue("InOut"); 			
				if( inout == 1 ){
					
					terminalInList.addRowData(terminalInfo.getRowData());	
					app.lookup("MMZMP_grdTerminalIn").redraw();				
				}else{
					
					terminalOutList.addRowData(terminalInfo.getRowData());
					app.lookup("MMZMP_grdTerminalOut").redraw();
				}
			}
		}
		// LPR mustering 정보 가져오기
		sendMusteringLprListReq();
	}else{
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}

// 구역 단말 리스트 가져오기 에러
function onSms_getMusteringTerminalSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR)
}

// 구역 단말 리스트 가져오기 타임아웃
function onSms_getMusteringTerminalSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 단말 삭제 완료
function onSms_deleteMusteringTerminalSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/* @type cpr.protocols.Submission */
	var sms_deleteUser = e.control;
	
	var dsDeleteList = app.lookup("DeleteList");
	dsDeleteList.realDeleteRow(0);

	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){				
		sendMusteringTerminalDelete();
	} else {		
		comLib.hideLoadMask();
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"),dataManager.getString(getErrorString(resultCode)));
		sendMusteringTerminalListReq();
		
	}
}
// 단말 삭제 실패
function onSms_deleteMusteringTerminalSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// 단말 삭제 타임아웃
function onSms_deleteMusteringTerminalSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}



// 구역 입구 LPR 추가 클릭
function onMMZMP_btnLprInAddClick(/* cpr.events.CMouseEvent */ e){
	processMusteringLprAdd(MusteringIn);	
}

// 입구 LPR 삭제 클릭
function onMMZMP_btnLprInDeleteClick(/* cpr.events.CMouseEvent */ e){
	var grdLprIn = app.lookup("MMZMP_grdLPRIn");
	processMusteringLprDelete(grdLprIn);	
}

// 구역 출구 LPR 추가
function onMMZMP_btnLprOutAddClick(/* cpr.events.CMouseEvent */ e){
	processMusteringLprAdd(MusteringOut);
}

// 구역 출구 LPR 삭제
function onMMZMP_btnLprOutDeleteClick(/* cpr.events.CMouseEvent */ e){
	var grdLprOut = app.lookup("MMZMP_grdLPROut");
	processMusteringLprDelete(grdLprOut);	
}

function processMusteringLprAdd( inout ){
	var grdMusteringList = app.lookup("MMZMP_grdMusteringList");
	var row = grdMusteringList.getSelectedRow();
	if( row ){		
		var appld = "app/custom/army_hq/lpr/musteringLPRList";
		app.getRootAppInstance().openDialog(appld, {width : 400, height : 600}, function(dialog){		
			dialog.initValue = {"InOut":inout};
			dialog.bind("headerTitle").toLanguage("Str_ARMYHQ_LPRDeviceSelect");
			dialog.style.header.css("background-color", "#528443");
			dialog.modal = true;
		}).then(function(result){
			if( result ){
				var dsLprList = app.lookup("LPRList");
				dsLprList.clear();
				var grdMusteringList = app.lookup("MMZMP_grdMusteringList");
				var row = grdMusteringList.getSelectedRow();
				var musteringID = row.getValue("MusteringID");
				for (var i=0; i < result.getRowCount(); i++) {
					var row = result.getRow(i);
					var newRowData = {"MusteringID": musteringID, "DeviceID": row.getValue("DeviceID"), "InOut": inout};
					dsLprList.addRowData(newRowData);
				}
				app.lookup("sms_postMusteringLpr").send()		
			}
		});
	} else{
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectionZone"));
		return;
	}
}

function processMusteringLprDelete( grdLpr ){	
	var checkedRowIndices = grdLpr.getCheckRowIndices();
	var delCount = checkedRowIndices.length;
	var lprList = app.lookup("LPRList"); lprList.clear();
	
	if (delCount == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelection"));
		return
	} else {
		dialogConfirmAMHQ(app.getRootAppInstance(), "LPR 삭제", dataManager.getString("Str_DeleteConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue) {
					comLib.showLoadMask("pro",dataManager.getString("Str_Delete"),"",checkedRowIndices.length);

					var dsDeleteList = app.lookup("DeleteLprList");
					dsDeleteList.clear();
					for( var i = 0; i < delCount; i++){
						var delInfo = {"DeviceID":grdLpr.getRow(checkedRowIndices[i]).getValue("DeviceID")};
						dsDeleteList.addRowData(delInfo);
					}
					sendMusteringLprDelete();
				}
			});
		});					
	}
}

function sendMusteringLprListReq() {
	app.lookup("LPRDeviceInList").clear();
	app.lookup("LPRDeviceOutList").clear();
	app.lookup("LPRList").clear();

	var musteringID = app.lookup("MusteringInfo").getValue("MusteringID");
	var lprSubmission = app.lookup("sms_getMusteringLpr");
	lprSubmission.action = "/v1/mustering/lpr/"+musteringID;
	lprSubmission.send();
}

function sendMusteringLprDelete(){
	var dsDeleteList = app.lookup("DeleteLprList");
	if( dsDeleteList.getRowCount() == 0 ){
		comLib.hideLoadMask();	
		sendMusteringLprListReq();
		return;
	}
	var musteringID = app.lookup("MusteringInfo").getValue("MusteringID");
	var deviceID = dsDeleteList.getRow(0).getValue("DeviceID");
	
	var delLprSubmission = app.lookup("sms_deleteMusteringLpr");
	delLprSubmission.action = "/v1/mustering/lpr/" + musteringID + "/" + deviceID

	var msg = "LPR Device ID: " + deviceID;
	comLib.updateLoadMask(msg);
	delLprSubmission.send();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postMusteringLprSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){				
		
	} else {		
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"),dataManager.getString(getErrorString(resultCode)));
	}
	sendMusteringLprListReq();
}

function onSms_postMusteringLprSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);	
}

function onSms_postMusteringLprSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getMusteringLprSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dsLprIN = app.lookup("LPRDeviceInList");
	var dsLprOut = app.lookup("LPRDeviceOutList");
	dsLprIN.clear();
	dsLprOut.clear();
	
	var resultCode = app.lookup("Result").getValue("ResultCode"); 
	if( resultCode == 0 ){
		var dsLprList = app.lookup("LPRList");
		var count = dsLprList.getRowCount();
		
		for (var i=0; i < count; i++) {
			var lprInfo = dsLprList.getRow(i);
			if (lprInfo) {
				var inOut = lprInfo.getValue("InOut");
				var newRowData = {"DeviceID": lprInfo.getValue("DeviceID"), "Name": lprInfo.getValue("DeviceName"),	"InOut": inOut};
				if (inOut == 1) {
					app.lookup("LPRDeviceInList").addRowData(newRowData);
				} else {
					app.lookup("LPRDeviceOutList").addRowData(newRowData);
				}
			}
		}
		app.lookup("MMZMP_grdLPRIn").redraw();
		app.lookup("MMZMP_grdLPROut").redraw();
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

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_deleteMusteringLprSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dsDeleteList = app.lookup("DeleteLprList");
	dsDeleteList.realDeleteRow(0);
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){			
		sendMusteringLprDelete();
	} else {		
		comLib.hideLoadMask();
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"),dataManager.getString(getErrorString(resultCode)));
		sendMusteringLprListReq();
	}
}

function onSms_deleteMusteringLprSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_deleteMusteringLprSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);	
}
