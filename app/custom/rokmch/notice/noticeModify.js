/************************************************
 * noticeRegist.js
 * Created at 2021. 2. 26. 오후 8:10:27.
 *
 * @author fois
 ************************************************/
var utilLib = cpr.core.Module.require("lib/util");
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var noticeInfo = app.getAppProperty("initValue");
	console.log(noticeInfo.getDatas());
	var dmNoticeInfo = app.lookup("NoticeInfo");
	noticeInfo.copyToDataMap(dmNoticeInfo);
	dmNoticeInfo.setValue("FileNameDel1",noticeInfo.getValue("FileName1"));
	dmNoticeInfo.setValue("FileNameDel2",noticeInfo.getValue("FileName2"));
	dmNoticeInfo.setValue("FileNameDel3",noticeInfo.getValue("FileName3"));
	app.lookup("AMSNM_cbxFixedFlag").value = dmNoticeInfo.getValue("FixedFlag");
	app.lookup("AMSNM_grpNotice").redraw();
}

function onSubmitError( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

function validateDate( value ){
	if (value==undefined||value == "0001-01-01T00:00:00Z"){return "";}
	if (value.substring(0, 10)=="0001-01-01"){return;}
	return value.substring(0, 10) +" " + value.substring(11, 19);	
}

function onButtonClick(/* cpr.events.CMouseEvent */ e){
	app.lookup("AMSNM_fiFile1").openFileChooser();
}

// 파일 1 첨부
function onAMSNR_fiFile1ValueChange(/* cpr.events.CValueChangeEvent */ e){
	var fiFile = e.control;	
	if (fiFile.files.length > 0 ) {
		var ext = utilLib.getExtensionOfFilename(fiFile.files[0].name);
		if (ext.toUpperCase()!= "HWP" && ext.toUpperCase()!= "XLS" && ext.toUpperCase() != "XLSX" 
		&& ext.toUpperCase()!= "JPG" && ext.toUpperCase()!= "PNG" && ext.toUpperCase()!= "GIF" ) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "확장자가  HWP, XLS, XLSX, JPG, PNG, GIF 이외의 파일은 업로드 할 수 없습니다.");
			fiFile.clear();
		} else {
			var noticeInfo = app.lookup("NoticeInfo");	
			if( app.lookup("AMSNM_fiFile1").value != "" ){
				noticeInfo.setValue("FileModify1",1)
			}
			console.log(noticeInfo.getValue("FileModify1"),noticeInfo.getValue("FileModify2"),noticeInfo.getValue("FileModify3"))		
		}
	}
}

function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	app.lookup("AMSNM_fiFile2").openFileChooser();
}
// 파일 2 첨부
function onAMSNR_fiFile2ValueChange(/* cpr.events.CValueChangeEvent */ e){
	var fiFile = e.control;	
	if (fiFile.files.length > 0 ) {
		var ext = utilLib.getExtensionOfFilename(fiFile.files[0].name);
		if (ext.toUpperCase()!= "HWP" && ext.toUpperCase()!= "XLS" && ext.toUpperCase() != "XLSX" 
		&& ext.toUpperCase()!= "JPG" && ext.toUpperCase()!= "PNG" && ext.toUpperCase()!= "GIF" ) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "확장자가  HWP, XLS, XLSX, JPG, PNG, GIF 이외의 파일은 업로드 할 수 없습니다.");
			fiFile.clear();
		} else {
			var noticeInfo = app.lookup("NoticeInfo");
			if( app.lookup("AMSNM_fiFile2").value != "" ){
				noticeInfo.setValue("FileModify2",1)
			}
			console.log(noticeInfo.getValue("FileModify1"),noticeInfo.getValue("FileModify2"),noticeInfo.getValue("FileModify3"))
		}
	}
}

function onButtonClick3(/* cpr.events.CMouseEvent */ e){
	app.lookup("AMSNM_fiFile3").openFileChooser();
}
// 파일 3 첨부
function onAMSNR_fiFile3ValueChange(/* cpr.events.CValueChangeEvent */ e){
	var fiFile = e.control;	
	if (fiFile.files.length > 0 ) {
		var ext = utilLib.getExtensionOfFilename(fiFile.files[0].name);
		if (ext.toUpperCase()!= "HWP" && ext.toUpperCase()!= "XLS" && ext.toUpperCase() != "XLSX" 
		&& ext.toUpperCase()!= "JPG" && ext.toUpperCase()!= "PNG" && ext.toUpperCase()!= "GIF" ) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "확장자가  HWP, XLS, XLSX, JPG, PNG, GIF 이외의 파일은 업로드 할 수 없습니다.");
			fiFile.clear();
		} else {
			var noticeInfo = app.lookup("NoticeInfo");
			if( app.lookup("AMSNM_fiFile3").value != "" ){
				noticeInfo.setValue("FileModify3",1)
			}	
			console.log(noticeInfo.getValue("FileModify1"),noticeInfo.getValue("FileModify2"),noticeInfo.getValue("FileModify3"))
		}
	}
}

// 등록
function onAMSNR_btnModifyClick(/* cpr.events.CMouseEvent */ e){
	var noticeInfo = app.lookup("NoticeInfo");
    var sms_putSystemNotice = app.lookup("sms_putSystemNotice");
    
    if(noticeInfo.getValue("FileModify1")==1){
	    var file1 = app.lookup("AMSNM_fiFile1").file;
	    if( file1 ){
	    	noticeInfo.setValue("FileName1",file1.name);	
	    	sms_putSystemNotice.addFileParameter("file1", file1);
	    }
	}
	if(noticeInfo.getValue("FileModify2")==1){
	    var file2 = app.lookup("AMSNM_fiFile2").file;
	    if( file2 ){
	    	noticeInfo.setValue("FileName2",file2.name);	
	    	sms_putSystemNotice.addFileParameter("file2", file2);
	    }
	}
	if(noticeInfo.getValue("FileModify3")==1){
	    var file3 = app.lookup("AMSNM_fiFile3").file;
	    if( file3 ){
	    	noticeInfo.setValue("FileName3",file3.name);	
	    	sms_putSystemNotice.addFileParameter("file3", file3);
	    }
	}
	
	noticeInfo.setValue("FixedFlag", app.lookup("AMSNM_cbxFixedFlag").value);
		
	sms_putSystemNotice.action = "/v1/systemNotices/"+noticeInfo.getValue("NoticeIndex");
	sms_putSystemNotice.send();
}


function onAMSNR_btnListClick(/* cpr.events.CMouseEvent */ e){
	app.getHostAppInstance().callAppMethod("changeMenu","60500");
}

function onAMSNM_btnFileDelete1Click(/* cpr.events.CMouseEvent */ e){
	var noticeInfo = app.lookup("NoticeInfo");
	noticeInfo.setValue("FileModify1",2)
	app.lookup("AMSNM_fiFile1").value = ""	
	console.log(noticeInfo.getValue("FileModify1"),noticeInfo.getValue("FileModify2"),noticeInfo.getValue("FileModify3"))
}

function onAMSNM_btnFileDelete2Click(/* cpr.events.CMouseEvent */ e){
	var noticeInfo = app.lookup("NoticeInfo");
	noticeInfo.setValue("FileModify2",2)
	app.lookup("AMSNM_fiFile2").value = ""	
	console.log(noticeInfo.getValue("FileModify1"),noticeInfo.getValue("FileModify2"),noticeInfo.getValue("FileModify3"))	
}

function onAMSNM_btnFileDelete3Click(/* cpr.events.CMouseEvent */ e){	
	var noticeInfo = app.lookup("NoticeInfo");
	noticeInfo.setValue("FileModify3",2)	
	app.lookup("AMSNM_fiFile3").value = ""
	console.log(noticeInfo.getValue("FileModify1"),noticeInfo.getValue("FileModify2"),noticeInfo.getValue("FileModify3"))
}

function onSms_putSystemNoticeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	
	if( resultCode == COMERROR_NONE ){	
		app.getHostAppInstance().callAppMethod("changeMenu","60500");		
	} else {		
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}	
}

function onAMSNM_fiFile1MaxsizeExceed(/* cpr.events.CFileUploadEvent */ e){
	dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "첨부파일은 최대 50M까지 첨부 가능합니다.");
}

function onAMSNM_fiFile2MaxsizeExceed(/* cpr.events.CFileUploadEvent */ e){
	dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "첨부파일은 최대 50M까지 첨부 가능합니다.");
}

function onAMSNM_fiFile3MaxsizeExceed(/* cpr.events.CFileUploadEvent */ e){
	dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "첨부파일은 최대 50M까지 첨부 가능합니다.");
}
