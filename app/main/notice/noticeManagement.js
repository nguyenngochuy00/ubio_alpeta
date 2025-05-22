/************************************************
 * noticeManagement.js
 * Created at 2018. 11. 23. 오전 11:05:10.
 *
 * @author kth
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var inputValidManager = createInputValidator(app);
var oem_version;

function onBodyLoad(e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	oem_version = dataManager.getOemVersion();	
	
	// 1. 입력 정보 초기화.
	var date = getinitYYYYmmdd();
	var init = app.lookup("NTMGR_sdate");
	init.value = date;
	init = app.lookup("NTMGR_edate");
	init.value = date;
		
	// 2. 저장된 공지사항 get
	app.lookup("sms_GetNotice").send();
	// 3. get terminalList
	var terminalList = dataManager.getTerminalList();
	
	var dsTerminalList = app.lookup("TerminalList");
	if (oem_version == OEM_REMOTE_FAW_MANAGEMENT){ // 유사얼굴체크용 단말기 제외
		terminalList.copyToDataSet(dsTerminalList, "UseAuth != 1"); 
	} else {
		terminalList.copyToDataSet(dsTerminalList); 		
	}
	
	//20190827 정래훈 인풋에 값이 없으면 경고 표시를 주기위해 작성
	var NTMGR_message = app.lookup("NTMGR_message").value;
	if(!NTMGR_message){
		inputValidManager.validate(app.lookup("NTMGR_message"), "isNull", dataManager.getString("Str_RequiredAlert"));
	}
}

// 오늘 날짜 구하기
function getinitYYYYmmdd(){
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1;
	var yyyy = today.getFullYear();
	
	if(dd < 10) {dd = '0'+dd}
	if(mm<10) {mm='0'+mm} 
	
	var date = ""+yyyy + mm + dd;
	
	return date;
}

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms_GetNoticeSubmitSuccess(e){
	var sms_GetNotice = e.control;
	console.log(sms_GetNotice.getRequestDataCount());
	var grd_notice = app.lookup("NTMGR_grdNoticeList");
	grd_notice.redraw();
}

/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onNTMGR_noticegrdSelectionChange(e){
	var nTMGR_noticegrd = e.control;
	var grid = app.lookup("NTMGR_grdNoticeList");
	var selectedRow = grid.getSelectedRow();
	
	app.lookup("NTMGR_sdate").value = selectedRow.getRowData().StartDate;
	app.lookup("NTMGR_edate").value = selectedRow.getRowData().EndDate;  
	app.lookup("NTMGR_stime").value = selectedRow.getRowData().StartTime; 
	app.lookup("NTMGR_etime").value = selectedRow.getRowData().EndTime;
	app.lookup("NTMGR_message").value = selectedRow.getRowData().Message;  
}

function updateNoticeInfo(noticeID){
	var dmNoticeInfo = app.lookup("NoticeInfo");
	dmNoticeInfo.setValue("NoticeID", noticeID);
	dmNoticeInfo.setValue("Type", 0);
	dmNoticeInfo.setValue("StartDate", app.lookup("NTMGR_sdate").value);
	dmNoticeInfo.setValue("EndDate", app.lookup("NTMGR_edate").value);
	dmNoticeInfo.setValue("StartTime", app.lookup("NTMGR_stime").value);
	dmNoticeInfo.setValue("EndTime", app.lookup("NTMGR_etime").value);
	dmNoticeInfo.setValue("Message", app.lookup("NTMGR_message").value);
}

// 공지사항 추가
function onNTMGR_btnAddClick(e){
	var nTMGR_btnAdd = e.control;
	var NTMGR_message = app.lookup("NTMGR_message").value;
	if(!NTMGR_message){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_EnterContent"));
		return;
	}
	updateNoticeInfo(0);
	app.lookup("sms_PostNotice").send();
}

// 공지사항 등록 완료
function onSms_PostNoticeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	dataManager = getDataManager();	
	var result = app.lookup("Result");	
	if( result.getValue("ResultCode")==0){
		var dmNoticeData = app.lookup("NoticeInfo");
		var dsNoticeList = app.lookup("NoticeList");
		var insertData = dmNoticeData.getDatas();
		dsNoticeList.addRowData(insertData);
	}else{		
		//dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_NoticeRegistFail"));
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString(getErrorString(result)));	
	}
}

// 공지사항 등록 에러
function onSms_PostNoticeSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",-1);		
}


// 공지사항 등록 타임아웃
function onSms_PostNoticeSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",-2);
}

// 공지사항 수정
function onNTMGR_btnModiClick(e){
	var nTMGR_btnModi = e.control;
	var grid = app.lookup("NTMGR_grdNoticeList");
	var selectedRow = grid.getSelectedRow();
	var NTMGR_message = app.lookup("NTMGR_message").value;

	if( selectedRow != null) {
		if(!NTMGR_message){
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_EnterContent"));
			return;
		}
		var rowData = selectedRow.getRowData();				
		var noticeID = rowData.NoticeID;
		
		updateNoticeInfo(noticeID);
		var sms_PutNotice = app.lookup("sms_PutNotice");
		sms_PutNotice.action = "/v1/notices/"+noticeID;
		sms_PutNotice.send();
		
	} else {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_NoSelectedItem"));
	}
}

// 공지사항 수정 완료
function onSms_PutNoticeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	dataManager = getDataManager();	
	var result = app.lookup("Result");	
	if( result.getValue("ResultCode")==0){
		var dmNoticeData = app.lookup("NoticeInfo");
		var dsNoticeList = app.lookup("NoticeList");
		var row = dsNoticeList.findFirstRow("NoticeID == "+ dmNoticeData.getValue("NoticeID"));
		if(row){
			row.setRowData(dmNoticeData.getDatas());			
		}		
	}else{		
		//dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_NoticeUpdateFail"));	
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString(getErrorString(result)));
	}
}

// 공지사항 수정 에러
function onSms_PutNoticeSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",-1);		
}

// 공지사항 수정 타임아웃
function onSms_PutNoticeSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",-2);
}

// 공지사항 삭제 클릭
function onNTMGR_btnDelClick(e){
	var nTMGR_btnDel = e.control;
	var grid = app.lookup("NTMGR_grdNoticeList");
	var selectedRow = grid.getSelectedRow();
	if (selectedRow == null){
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_NoSelectedItem"));
		return;
	} else {
		
		var rowData = selectedRow.getRowData();				
		var noticeID = rowData.NoticeID;
		
		updateNoticeInfo(noticeID);
		var sms_deleteNotice = app.lookup("sms_deleteNotice");
		sms_deleteNotice.action = "/v1/notices/"+noticeID;
		sms_deleteNotice.send();
				
		//var selIdx = selectedRow.getIndex();
		//grid.deleteRow(selIdx);
	}
}

// 공지사항 삭제 완료
function onSms_deleteNoticeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	dataManager = getDataManager();	
	var result = app.lookup("Result");	
	if( result.getValue("ResultCode")==0){
		var dmNoticeData = app.lookup("NoticeInfo");
		var dsNoticeList = app.lookup("NoticeList");
		var row = dsNoticeList.findFirstRow("NoticeID == "+ dmNoticeData.getValue("NoticeID"));
		dsNoticeList.realDeleteRow(row.getIndex());		
	}else{		
		//dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_NoticeUpdateFail"));
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString(getErrorString(result)));	
	}
}


// 공지사항 삭제 에러
function onSms_deleteNoticeSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",-1);
}


// 공지사항 삭제 타임아웃
function onSms_deleteNoticeSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",-2);
}

function sendTerminalNoticeSet( setType ){
	var grid = app.lookup("NTMGR_grdNoticeList");
	var selectedRow = grid.getSelectedRow();
	
	if( setType == 0 ){ // 공지사항 설정인 경우에만 공지사항이 선택 되었는지 확인.
		if( selectedRow != null) {
			var rowData = selectedRow.getRowData();				
			var noticeID = rowData.NoticeID;
			
			updateNoticeInfo(noticeID);		
			
		} else {
			dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_NoSelectedItem"));
			return;
		}
	}
	
	var grdTerminalList = app.lookup("NTMGR_grdTerminalList");
	var chkIndices = grdTerminalList.getCheckRowIndices();
	if( chkIndices.length== 0){
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_TerminalNotSelected"),"");
		return;
	}
	
	var dmNoticeInfo = app.lookup("NoticeInfo");
	dmNoticeInfo.setValue("Type", setType);
	
	var dsTerminalIDList = app.lookup("TerminalIDList");
	dsTerminalIDList.clear();
	chkIndices.forEach(function( index ){
		var terminalRow = grdTerminalList.getRow(index);
		terminalRow.setValue("result", "");
		dsTerminalIDList.addRowData({"TerminalID":terminalRow.getValue("ID")});				
	});
	var sms_postTerminalNotice = app.lookup("sms_postTerminalNotice");
	sms_postTerminalNotice.send();	
}

// 공지사항 단말 적용 클릭
function onNTMGR_btnTerminalNoticeSetClick(/* cpr.events.CMouseEvent */ e){	
	sendTerminalNoticeSet(0);
}
// 공지사항 단말 해제 클릭
function onNTMGR_btnTerminalNoticeUnsetClick(/* cpr.events.CMouseEvent */ e){
	sendTerminalNoticeSet(1);	
}

// 공지사항 단말 전송 완료
function onSms_postTerminalNoticeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	dataManager = getDataManager();	
	var result = app.lookup("Result");	
	if( result.getValue("ResultCode")==0){			
	}else{		
		//dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_NoticeUpdateFail"));
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString(getErrorString(result)));	
	}
}

// 공지사항 단말 전송 에러
function onSms_postTerminalNoticeSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",-1);		
}

// 공지사항 단말 전송 타임아웃
function onSms_postTerminalNoticeSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",-2);
}

exports.setNoticeResult = function(msg){
	var msgBody = JSON.parse(msg.body);
	var terminalID = msgBody.TerminalID;
	var dsTerminalList = app.lookup("TerminalList");
	var row = dsTerminalList.findFirstRow("ID == "+terminalID);
	if( row ){
		var result ="";
		if( msg.result == 0){
			result = dataManager.getString("Str_Success");	
		} else {
			result = dataManager.getErrorString(msg.result);
		}
		row.setValue("result",result);
	}
}

// 도움말 클릭
function onNTMGR_imgHelpClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target":DLG_HELP,	
			"ID": menu_id
		}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}


/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onNTMGR_messageKeyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var nTMGR_message = e.control;
	if(nTMGR_message.displayText != ""){
		inputValidManager.validate(app.lookup("NTMGR_message"), "isValid", "");
	}else{
		inputValidManager.validate(app.lookup("NTMGR_message"), "isNull", dataManager.getString("Str_RequiredAlert"));	
	}
}
