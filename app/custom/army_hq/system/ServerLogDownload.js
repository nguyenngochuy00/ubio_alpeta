/************************************************
 * ServerLogDownload.js
 * Created at 2021. 6. 2. 오전 9:09:24.
 *
 * @author blue1
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	var today = dateLib.getToday("-");
	app.lookup("AMSD_dtiDate").value = today;
	
}

function onAMACI_btnPersonnelListSearchClick(/* cpr.events.CMouseEvent */ e){
	
	var grpLogFiles = app.lookup("AMSD_grpLogList");
	grpLogFiles.removeAllChildren(true);
	
	var submision = app.lookup("sms_getServerLogList");
	submision.setParameters("searchDate", app.lookup("AMSD_dtiDate").value);
	submision.send();
}

/* 서브미션 응답 */
function onSubmitError( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

function onSms_getServerLogSubmitDone(/* cpr.events.CSubmissionEvent */ e){
var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){		
		var dsLogfiles = app.lookup("dsLogFileList");
		var grpLogFiles = app.lookup("AMSD_grpLogList");
		for (var i=0 ; i < dsLogfiles.getRowCount(); i++) {
			var htmlSnippet = new cpr.controls.HTMLSnippet("logFile" + i);
			htmlSnippet.value=	"<a href=\"/" + dsLogfiles.getRow(i).getString("LogFilePath") + "\" target=\"_blank\">" + dsLogfiles.getRow(i).getString("LogFilePath") + "</a>";
			grpLogFiles.addChild(htmlSnippet, {	"height": "20px" });
		}
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}	
}

