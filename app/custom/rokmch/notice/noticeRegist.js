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
}

function onSubmitError( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

function onButtonClick(/* cpr.events.CMouseEvent */ e){
	app.lookup("AMSNR_fiFile1").openFileChooser();
}

// 파일 1 첨부
function onAMSNR_fiFile1ValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** @type cpr.controls.FileInput	 */
	var fiFile = e.control;	
	
	if (fiFile.files.length > 0 ) {
		var ext = utilLib.getExtensionOfFilename(fiFile.files[0].name);
		if (ext.toUpperCase()!= "HWP" && ext.toUpperCase()!= "XLS" && ext.toUpperCase() != "XLSX" 
		&& ext.toUpperCase()!= "JPG" && ext.toUpperCase()!= "PNG" && ext.toUpperCase()!= "GIF" ) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "확장자가  HWP, XLS, XLSX, JPG, PNG, GIF 이외의 파일은 업로드 할 수 없습니다.");
			fiFile.clear();
		} 
	}
	
		/*
	// 읽기
	var noticeInfo = app.lookup("NoticeInfo");
    var reader = new FileReader();
    reader.readAsDataURL(fiFile.files [0]);
    noticeInfo.setValue("FileName1",fiFile.files [0].name);			
    reader.onload = function  () {
    	var noticeInfo = app.lookup("NoticeInfo");    	
    	noticeInfo.setValue("FileData1",reader.result);    	        
    }; 	
    * */
}

function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	app.lookup("AMSNR_fiFile2").openFileChooser();
}
// 파일 2 첨부
function onAMSNR_fiFile2ValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** @type cpr.controls.FileInput	 */
	var fiFile = e.control;	
	if (fiFile.files.length > 0 ) {
		var ext = utilLib.getExtensionOfFilename(fiFile.files[0].name);
		if (ext.toUpperCase()!= "HWP" && ext.toUpperCase()!= "XLS" && ext.toUpperCase() != "XLSX" 
		&& ext.toUpperCase()!= "JPG" && ext.toUpperCase()!= "PNG" && ext.toUpperCase()!= "GIF" ) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "확장자가  HWP, XLS, XLSX, JPG, PNG, GIF 이외의 파일은 업로드 할 수 없습니다.");
			fiFile.clear();
		} 
	}
	
	/*	
	// 읽기
	var noticeInfo = app.lookup("NoticeInfo");
    var reader = new FileReader();
    reader.readAsDataURL(fiFile.files [0]);
    noticeInfo.setValue("FileName2",fiFile.files [0].name);			
    reader.onload = function  () {
    	var noticeInfo = app.lookup("NoticeInfo");    	
    	noticeInfo.setValue("FileData2",reader.result);    	        
    }; 
    * */	
}

function onButtonClick3(/* cpr.events.CMouseEvent */ e){
	app.lookup("AMSNR_fiFile3").openFileChooser();
}
// 파일 3 첨부
function onAMSNR_fiFile3ValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** @type cpr.controls.FileInput	 */	
	var fiFile = e.control;	
	if (fiFile.files.length > 0 ) {
		var ext = utilLib.getExtensionOfFilename(fiFile.files[0].name);
		if (ext.toUpperCase()!= "HWP" && ext.toUpperCase()!= "XLS" && ext.toUpperCase() != "XLSX" 
		&& ext.toUpperCase()!= "JPG" && ext.toUpperCase()!= "PNG" && ext.toUpperCase()!= "GIF" ) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "확장자가  HWP, XLS, XLSX, JPG, PNG, GIF 이외의 파일은 업로드 할 수 없습니다.");
			fiFile.clear();
		} 
	}
	
		/*
	// 읽기
	var noticeInfo = app.lookup("NoticeInfo");
    var reader = new FileReader();
    reader.readAsDataURL(fiFile.files [0]);
    noticeInfo.setValue("FileName3",fiFile.files [0].name);			
    reader.onload = function  () {
    	var noticeInfo = app.lookup("NoticeInfo");    	
    	noticeInfo.setValue("FileData3",reader.result);    	        
    }; 	
    * 
    */
}

// 등록
function onAMSNR_btnRegistClick(/* cpr.events.CMouseEvent */ e){
	var noticeInfo = app.lookup("NoticeInfo");
	var fixedFlag = app.lookup("AMSNR_cbxFixedFlag").value;
	noticeInfo.setValue("FixedFlag", fixedFlag);
	
    var sms_postSystemNotice = app.lookup("sms_postSystemNotice");
    
    var file1 = app.lookup("AMSNR_fiFile1").file;
    if( file1 ){
    	noticeInfo.setValue("FileName1",file1.name);	
    	sms_postSystemNotice.addFileParameter("file1", file1);
    }
    var file2 = app.lookup("AMSNR_fiFile2").file;
    if( file2 ){
    	noticeInfo.setValue("FileName2",file2.name);	
    	sms_postSystemNotice.addFileParameter("file2", file2);
    }
    var file3 = app.lookup("AMSNR_fiFile3").file;
    if( file3 ){
    	noticeInfo.setValue("FileName3",file3.name);	
    	sms_postSystemNotice.addFileParameter("file3", file3);
    }
	
	comLib.showLoadMask("","공지사항 등록","",0);
	sms_postSystemNotice.send();
}

function onSms_postSystemNoticeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	
	if( resultCode == COMERROR_NONE ){			
		app.getHostAppInstance().callAppMethod("changeMenu","60500");	
	} else {		
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}	
}

function onAMSNR_btnListClick(/* cpr.events.CMouseEvent */ e){
	app.getHostAppInstance().callAppMethod("changeMenu","60500");
}

function onAMSNR_fiFile1MaxsizeExceed(/* cpr.events.CFileUploadEvent */ e){
	dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "첨부파일은 최대 50M까지 첨부 가능합니다.");
}

function onAMSNR_fiFile2MaxsizeExceed(/* cpr.events.CFileUploadEvent */ e){
	dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "첨부파일은 최대 50M까지 첨부 가능합니다.");
}

function onAMSNR_fiFile3MaxsizeExceed(/* cpr.events.CFileUploadEvent */ e){
	dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "첨부파일은 최대 50M까지 첨부 가능합니다.");
}
