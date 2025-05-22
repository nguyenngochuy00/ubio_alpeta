/************************************************
 * musteringManagement.js
 * Created at 2020. 8. 13. 오전 10:18:23.
 *
 * @author fois
 ************************************************/

var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var MMRTP_init = false;

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	sendMusteringListReq();
}

function onTabFolderSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.TabFolder	 */
	var tabFolder = e.control;
	var tabItem = tabFolder.getSelectedTabItem();
	
	switch(tabItem.id){
		case 2:
			if( MMRTP_init == false ){
				var sms_getRollCallReport = app.lookup("sms_getRollCallReport");
				sms_getRollCallReport.send();
			}
			break;
		default:
			break;
	}
}

function sendMusteringListReq(){
	var sms_getMusteringList = app.lookup("sms_getMusteringList");
	sms_getMusteringList.send();
}

// 머스터링 구역 리스트 가져오기 완료
function onSms_getMusteringListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var resultCode = app.lookup("Result").getValue("ResultCode"); 
	if( resultCode == 0 ){
		
	}else{
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
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

// 구역 추가 버튼 클릭
function onMMZMP_btnZoneAddClick(/* cpr.events.CMouseEvent */ e){
	
	var appld = "app/main/rollcall/MusteringRegist";
	app.openDialog(appld, {width : 360, height : 200}, function(dialog){
		dialog.bind("headerTitle").toLanguage("Str_Enrollment");
		dialog.modal = true;
	}).then(function(returnValue){

		var result = returnValue["Result"];
		if( result == 0 ){
			var zoneInfo= returnValue["MusteringInfo"];

			if( zoneInfo. MusteringName.length < 1 ){
				dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("NoNameEntered"), function(/*cpr.controls.Dialog*/dialog){
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

// 구역 추가 완료
function onSms_postMusteringSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode"); 
	if( resultCode == 0 ){		
		var zoneInfo = app.lookup("MusteringInfo");
		
		var musteringList = app.lookup("MusteringList");
		var insertRow = musteringList.addRowData(zoneInfo.getDatas());
		
		var grdMusteringList = app.lookup("MMZMP_grdMusteringList");
		grdMusteringList.selectRows([insertRow.getIndex()], false);
		app.lookup("MMZMP_grpMusteringInfo").redraw();
	}else{
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}

// 구역 추가 에러
function onSms_postMusteringSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR)
}

// 구역 추가 타임아웃
function onSms_postMusteringSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 구역 정보 수정
function onMMZMP_btnZoneModifyClick(/* cpr.events.CMouseEvent */ e){
	
	var grdMusteringList = app.lookup("MMZMP_grdMusteringList");
	var row = grdMusteringList.getSelectedRow();
	if( row ){
		var opbMusteringName = app.lookup("MMZMP_ipbMusteringName").text;
	var opbMusteringDesc = app.lookup("MMZMP_ipbMusteringDesc").text;
	if( opbMusteringName.length < 1 ){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("NoNameEntered"), function(/*cpr.controls.Dialog*/dialog){
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
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelection"));	
	}
	
}


// 머스터링 정보 수정 완료
function onSms_putMusteringInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode"); 
	if( resultCode == 0 ){
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
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
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

// 구역 삭제 클릭
function onMMZMP_btnZoneDeleteClick(/* cpr.events.CMouseEvent */ e){
	
	var zoneInfo= app.lookup("MusteringInfo");
	var musteringID = zoneInfo.getValue("MusteringID");
	if( musteringID == "" ){
		return;
	}
	
	var sms_deleteMustering = app.lookup("sms_deleteMustering");	
	sms_deleteMustering.action = "/v1/rollcalls/"+musteringID;
	sms_deleteMustering.send();
}

// 구역 삭제 완료
function onSms_deleteMusteringSubmitDone(/* cpr.events.CSubmissionEvent */ e){
		
	var resultCode = app.lookup("Result").getValue("ResultCode"); 
	if( resultCode == 0 ){
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
	}else{
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
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

function processMusteringTerminalAdd( inout ){
	var grdMusteringList = app.lookup("MMZMP_grdMusteringList");
	var row = grdMusteringList.getSelectedRow();
	if( row ){		
		var appld = "app/main/rollcall/musteringTerminalList" + "?" + dataManager.getSystemVersion();
		app.getRootAppInstance().openDialog(appld, {width : 400, height : 600}, function(dialog){		
			dialog.initValue = {"TerminalID":row.getValue("MusteringID"),"InOut":inout};
			dialog.bind("headerTitle").toLanguage("Str_TerminalSelect");
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
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectionZone"));
		return;
	}
}

// 구역 입구 단말 추가 클릭
function onMMZMP_btnTerminalInAddClick(/* cpr.events.CMouseEvent */ e){
	processMusteringTerminalAdd(MusteringIn);	
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

// 구역 단말기 추가 완료
function onSms_postMusteringTerminalSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode"); 
	if( resultCode == 0 ){
		sendMusteringTerminalAdd();
	}else{
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
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
	}else{
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
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

function processMusteringTerminalDelete( grdTerminal ){	
	var checkedRowIndices = grdTerminal.getCheckRowIndices()
	var delCount = checkedRowIndices.length;
	
	if (delCount == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelection"));
		return
	} else {
		dialogConfirm(app.getRootAppInstance(), "", dataManager.getString("Str_DeleteConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
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
// 입구 단말 삭제 클릭
function onMMZMP_btnTerminalInDeleteClick(/* cpr.events.CMouseEvent */ e){
	var grdTerminalIn = app.lookup("MMZMP_grdTerminalIn");
	processMusteringTerminalDelete(grdTerminalIn);	
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
		dialogAlert(app, dataManager.getString("Str_Failed"),dataManager.getString(getErrorString(resultCode)));
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

// 구역 출구 단말 추가
function onMMZMP_btnTerminalOutAddClick(/* cpr.events.CMouseEvent */ e){
	processMusteringTerminalAdd(MusteringOut);
}

// 구역 출구 단말 삭제
function onMMZMP_btnTerminalOutDeleteClick(/* cpr.events.CMouseEvent */ e){
	var grdTerminalOut = app.lookup("MMZMP_grdTerminalOut");
	processMusteringTerminalDelete(grdTerminalOut);	
}

//------------Report tab/
function onMMZRMP_btnReportCreateClick(/* cpr.events.CMouseEvent */ e){			
	var appld = "app/main/rollcall/rollcallReportRegist" + "?" + dataManager.getSystemVersion();
	var dsMusteringList = app.lookup("MusteringList");
	app.getRootAppInstance().openDialog(appld, {width : 430, height : 600}, function(dialog){		
		dialog.initValue = {"MusteringList":dsMusteringList};
		dialog.bind("headerTitle").toLanguage("Str_MusteringReportRegist");
		dialog.modal = true;
	}).then(function(result){		
		if(result){
			sendMusteringListReq();
		}
	});	
}

// 소집 리포트 리스트 가져오기 완료
function onSms_getRollCallReportSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){				
		MMRTP_init = true;
		var dsRollCallReportList = app.lookup("RollCallReportList");
		for( var i = 0; i < dsRollCallReportList.getRowCount();i++){
			var report = dsRollCallReportList.getRow(i);
			if(report){
				var strTime = report.getValue("StartAt");
				var startAt = strTime.substring(0,10)+" "+strTime.substring(11,19);
				report.setValue("StartAt", startAt);
				
				var strTime = report.getValue("EndAt");
				var endAt = strTime.substring(0,10)+" "+strTime.substring(11,19);
				report.setValue("endAt", endAt);
			} 
		}
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"),dataManager.getString(getErrorString(resultCode)));
	}
}

// 소집 리포트 리스트 가져오기 에러
function onSms_getRollCallReportSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// 소집 리포트 리스트 가져오기 타임아웃
function onSms_getRollCallReportSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}
