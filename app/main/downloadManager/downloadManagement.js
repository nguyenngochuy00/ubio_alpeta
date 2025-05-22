/************************************************
 * downloadManag.js
 * Created at 2019. 2. 26. 오후 3:22:52.
 *
 * @author joymrk
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var DNMGR_taskMap = new Map();
var usint_version;
// Body에서 load 이벤트 발생 시 호출.
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();	
	usint_version = dataManager.getSystemVersion();
	var cmbTaskName = app.lookup("DNMGR_cmbTaskName");
	cmbTaskName.addItem(new cpr.controls.Item(dataManager.getString("Str_AccessGroupUserUpdate"),TaskNameUserAccessGroupUpdate));
	cmbTaskName.addItem(new cpr.controls.Item(dataManager.getString("Str_TerminalFWDownload"),TaskNameTerminalFWDownload));
	cmbTaskName.addItem(new cpr.controls.Item(dataManager.getString("Str_SendAccessGroupInfoToTerminal"),TaskNameAccessGroupInfoDownloadToTerminal));
	cmbTaskName.addItem(new cpr.controls.Item(dataManager.getString("Str_TerminalUserDateUpload"),TaskNameTerminalUserData));
	cmbTaskName.addItem(new cpr.controls.Item(dataManager.getString("Str_WiegandInDownloadToTerminal"), TaskNameWiegandInDownload));
	//cmbTaskName.addItem(new cpr.controls.Item(dataManager.getString("Str_WiegandOutDownloadToTerminal"), 1142038694‬));‭
	cmbTaskName.addItem(new cpr.controls.Item(dataManager.getString("Str_WiegandOutDownloadToTerminal"), TaskNameWiegandOutDownload));
	cmbTaskName.addItem(new cpr.controls.Item(dataManager.getString("Str_Synchronization"),TaskNameSynchronization));	
	cmbTaskName.addItem(new cpr.controls.Item(dataManager.getString("Str_CryptoUpdate"),TaskNameOptionInfoUpdate));
	cmbTaskName.addItem(new cpr.controls.Item(dataManager.getString("Str_MealProcess"),TaskNameMealManualProcess));
	cmbTaskName.addItem(new cpr.controls.Item(dataManager.getString("Str_AccessAreaUpdate"),TaskNameAccessAreaUpdate));
	cmbTaskName.addItem(new cpr.controls.Item(dataManager.getString("Str_AccessGroupUpdate"),TaskNameAccessGroupUpdate));
	cmbTaskName.addItem(new cpr.controls.Item(dataManager.getString("Str_UserDelete"),TaskNameUserDelete));
	cmbTaskName.addItem(new cpr.controls.Item(dataManager.getString("Str_CardLayout"),TaskCardLayoutInfoDownloadToTerminal));
	cmbTaskName.addItem(new cpr.controls.Item(dataManager.getString("Str_Option"),TaskOptionInfoUpdate));
	cmbTaskName.addItem(new cpr.controls.Item(dataManager.getString("Str_UserFileSend"),TaskNameUserFileSend));
	
	if (dataManager.getOemVersion() == OEM_SS_HOSPITAL) {
		cmbTaskName.addItem(new cpr.controls.Item("월 정산 집계처리",taskTypeSSHMonthlyMealProcess));
	} else if (dataManager.getOemVersion() == OEM_JAWOONDAE) {
		cmbTaskName.addItem(new cpr.controls.Item("카드 회수 단말동기화",TaskJWDCardRetrievalFromUserReq));
	} else if (dataManager.getOemVersion() == OEM_DJMCITYHALL) {
		cmbTaskName.addItem(new cpr.controls.Item("수강처리",TaskDJMCHEduCourseProcessingReq));
	}
	
	var cmbTaskState = app.lookup("DNMGR_cmbTaskState");
	cmbTaskState.addItem(new cpr.controls.Item(dataManager.getString("Str_TaskStateInit"),1));
	cmbTaskState.addItem(new cpr.controls.Item(dataManager.getString("Str_TaskStateRunning"),2));
	cmbTaskState.addItem(new cpr.controls.Item(dataManager.getString("Str_TaskStatePending"),3));
	cmbTaskState.addItem(new cpr.controls.Item(dataManager.getString("Str_TaskStateFinalize"),4));
	cmbTaskState.addItem(new cpr.controls.Item(dataManager.getString("Str_TaskStatetaskStateCanceled"),0xFFFE));
	cmbTaskState.addItem(new cpr.controls.Item(dataManager.getString("Str_TaskStateFinished"),0xFFFF));
			
	var taskList = dataManager.getTaskList();
	//console.log(taskList);
	var dsTaskInfo = app.lookup("TaskInfo");
	
	dsTaskInfo.build(taskList);
	dsTaskInfo.commit();
		
	var taskCount = dsTaskInfo.getRowCount();
	for( var i = 0; i < taskCount; i++ ){
		var taskInfo = dsTaskInfo.getRow(i);		
		DNMGR_taskMap.set(taskInfo.getValue("TaskID"),taskInfo);
		var total = taskInfo.getValue("total");
		if( total == 0 ){
			taskInfo.setValue("total",1);
			taskInfo.setValue("success",1);
			taskInfo.setValue("fail",0);
		}
		
	}
}

// "작업 취소" 버튼에서 click 이벤트 발생 시 호출.
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/* @type cpr.controls.Button */
	var button = e.control;
	var appld = "app/main/downloadManager/popup/downloadCancel" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {width: 320, height: 170}, function(dialog){
			dialog.bind("headerTitle").toLanguage("Str_TaskCancel");			
			dialog.modal = true;
		}).then(function(returnValue){
			;	
		});
}
	
exports.updateTaskList = function(taskInfoList){
	//console.log(taskInfoList);
	if( taskInfoList == null ){
		return;
	}
	
	// 새로운 데이터를 데이터 셋으로 변환
	var dsRecvTaskInfo = app.lookup("recvTaskInfo");
	dsRecvTaskInfo.clear();
	dsRecvTaskInfo.build(taskInfoList);
	var recvTaskCount = dsRecvTaskInfo.getRowCount();
	
	if( recvTaskCount == 0){
		// 새로운 데이터가 없는 경우 리턴. 앞의 null 체크에서 걸러지지 않았으므로 데이터 셋 구성에 문제가 있는 경우
		return;
	}
	
	var dsTaskInfo = app.lookup("TaskInfo");
	for( var i = 0; i < recvTaskCount; i++ ){
		var taskInfo = dsRecvTaskInfo.getRow(i);
		var total = taskInfo.getValue("total");
		if( total == 0 ){
			taskInfo.setValue("total",1);
			taskInfo.setValue("success",1);
			taskInfo.setValue("fail",0);
		}
		
		console.log(taskInfo.getRowData());
				
		var mapTaskInfo = DNMGR_taskMap.get(taskInfo.getValue("TaskID"));
		if( mapTaskInfo ){ // 작업 목록에 있는 경우 업데이트		
			
			mapTaskInfo.setRowData(taskInfo.getRowData());						
		}else { // 작업 목록에 없는 경우 추가.			
			var newRow = dsTaskInfo.addRowData(taskInfo.getRowData());
			DNMGR_taskMap.set(taskInfo.getValue("TaskID"),newRow);
		}
	}	
	
	dsTaskInfo.commit();	
	
}

// 완료 목록 삭제 클릭
function onDNMGR_btnDeleteFinishedTaskClick(/* cpr.events.CMouseEvent */ e){	
	var dNMGR_btnDeleteFinishedTask = e.control;
	
	comLib.showLoadMask("", dataManager.getString("Str_TaskFinishedClear"), "", 0);
	var sms_deleteTask = app.lookup("sms_deleteTask");
	sms_deleteTask.send();		
}

// 완료 목록 삭제 완료
function onSms_deleteTaskSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	comLib.hideLoadMask();
	if( result.getValue("ResultCode") == COMERROR_NONE){
		var dsTaskInfo = app.lookup("TaskInfo");
		var count = dsTaskInfo.getRowCount();
		for( var i = count-1; i >= 0; i--){
			var row = dsTaskInfo.getRow(i);						
			if(row==null){
				dsTaskInfo.deleteRow(i);
			} else if( row.getValue("State") >= 0xFF00 ){					
				DNMGR_taskMap.delete(row.getValue("TaskID"));
				dsTaskInfo.deleteRow(row.getIndex());
			}
		}	
		dsTaskInfo.commit();
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_Delete"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
}

// 완료 목록 삭제 에러
function onSms_TaskSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// 완료 목록 삭제 타임아웃
function onSms_TaskSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}


// 도움말
function onDNMGR_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}


/*
 * 버튼(DNMGR_btnForcedClose)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onDNMGR_btnForcedCloseClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var dNMGR_btnForcedClose = e.control;
	var grdTaskList = app.lookup("DNMGR_grdTaskList");
	var selectedRow = grdTaskList.getSelectedRow();
	if (selectedRow) {
		comLib.showLoadMask("", dataManager.getString("Str_TaskFinishedClear"), "", 0);
		var taskID = selectedRow.getValue("TaskID");
		var smsDeleteTaskInfo = app.lookup("sms_deleteTaskInfo");
		smsDeleteTaskInfo.action = "/v1/tasks/" + taskID;
		smsDeleteTaskInfo.send();	
	} else {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalNotSelected"));
		return;
	}

}

function onSms_deleteTaskInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if( resultCode == COMERROR_NONE){
		var dsTaskInfo = app.lookup("TaskInfo");
		var count = dsTaskInfo.getRowCount();
		for( var i = count-1; i >= 0; i--){
			var row = dsTaskInfo.getRow(i);						
			if(row==null){
				dsTaskInfo.deleteRow(i);
			} else if( row.getValue("State") >= 0xFF00 ){					
				DNMGR_taskMap.delete(row.getValue("TaskID"));
				dsTaskInfo.deleteRow(row.getIndex());
			}
		}	
		dsTaskInfo.commit();
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_Delete"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
}
