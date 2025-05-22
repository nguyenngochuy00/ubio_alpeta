/************************************************
 * AuthLogImport.js
 * Created at 2019. 1. 9. 오후 5:51:04.
 *
 * @author wonki
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var ALIMP_pageRowCount = 1000;
var ALIMP_sendRowPerImport = 2000;
var comLib;

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
}

function onSubmitError(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

function onALIMP_fiAuthLogFileValueChange(/* cpr.events.CValueChangeEvent */ e){

	/** @type cpr.controls.FileInput	 */
	var fiAuthLogFile = e.control;
	var files = fiAuthLogFile.files;
	
	var appld = "app/main/authLogs/terminalIDInput";
	app.getRootAppInstance().openDialog(appld, {width : 300, height : 120}, function(dialog){				
		dialog.bind("headerTitle").toLanguage("Str_InputID");
		dialog.modal = true;		
	}).then(function(returnValue){
		if( returnValue > 0 ){
			var sms_postUserFileExport = app.lookup("sms_postLogFileExport");
			sms_postUserFileExport.setParameters("terminalID", returnValue);	
			for(var i = 0; i != files.length; ++i) {
				sms_postUserFileExport.addFileParameter("userDataFile", files[i]);        
		    }	
			sms_postUserFileExport.send();
		}
	});
}

function onSms_postLogFileExportSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
		
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

var ALIMP_fileImportOffset;
var ALIMP_fileImportTotal;
function onALIMP_btnUploadClick(/* cpr.events.CMouseEvent */ e){
	var rowCount = app.lookup('AuthLogList').getRowCount();
	if (rowCount) {
		ALIMP_fileImportOffset = 0;
		var dsAuthLogList = app.lookup("AuthLogList");
		ALIMP_fileImportTotal = dsAuthLogList.getRowCount();
		comLib.showLoadMask("pro", dataManager.getString("Str_UpLoad"), "", ALIMP_fileImportTotal);
		processLogUpload();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_DragFile"));
	}
}

function processLogUpload(){
	var msg = dataManager.getString("Str_UserID")+" ("+ ALIMP_fileImportOffset+"/"+ALIMP_fileImportTotal+")";
	comLib.updateLoadMask(msg);
	
	var dsAuthLogList = app.lookup("AuthLogList");
	var logInfo = dsAuthLogList.getRow(ALIMP_fileImportOffset);
	
	
	var authLog = app.lookup("AuthLog");
	authLog.clear();
	authLog.build(logInfo.getRowData());
		
	var sms_postLogInfo = app.lookup("sms_postLogInfo");
	sms_postLogInfo.method = "POST";					
	sms_postLogInfo.send();	
}

function onSms_postLogInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	var dsAuthLogList = app.lookup("AuthLogList");
	var logInfo = dsAuthLogList.getRow(ALIMP_fileImportOffset)

	if (resultCode == COMERROR_NONE) {
		logInfo.setValue("Result", dataManager.getString("Str_Success"));
	} else {
		logInfo.setValue("Result", dataManager.getString(getErrorString(resultCode)));
	}
	
	ALIMP_fileImportOffset++;
	if( ALIMP_fileImportOffset >= ALIMP_fileImportTotal){
		comLib.hideLoadMask();	
	} else {
		processLogUpload();
	}
}


// 도움말 클릭 시
function onALIMP_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Image
	 */
	var aLIMP_imgHelpPage = e.control;
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target": DLG_HELP,
			"ID": menu_id
		}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}
