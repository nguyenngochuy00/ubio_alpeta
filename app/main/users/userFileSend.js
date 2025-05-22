/************************************************
 * userFileSend.js
 * Created at 2019. 2. 26. 오후 3:46:43.
 *
 * @author joymrk
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var oem_version;

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	oem_version = dataManager.getOemVersion();	
		
	var cmbFileType = app.lookup("UFMGR_cmbFileType");
	cmbFileType.addItem(new cpr.controls.Item(dataManager.getString("Str_FileFormatAll"),0));
	cmbFileType.addItem(new cpr.controls.Item(dataManager.getString("Str_FileFormatLanguageDefine"),1));
	cmbFileType.addItem(new cpr.controls.Item(dataManager.getString("Str_FileFormatBackgroundImage"),2));
	cmbFileType.addItem(new cpr.controls.Item(dataManager.getString("Str_FileFormatVoiceSuccess"),3));
	cmbFileType.addItem(new cpr.controls.Item(dataManager.getString("Str_FileFormatVoiceFail"),4));
	cmbFileType.addItem(new cpr.controls.Item(dataManager.getString("Str_FileFormatVideo"),5));
	cmbFileType.addItem(new cpr.controls.Item(dataManager.getString("Str_FileFormatBackgroundImagePng"),7));
	cmbFileType.addItem(new cpr.controls.Item(dataManager.getString("Str_FileFormatBackgroundImageGif"),8));
		
	cmbFileType.selectItem(0);
	
	var terminalList = dataManager.getTerminalList();
	
	var dsTerminalList = app.lookup("TerminalList");
	if (oem_version == OEM_REMOTE_FAW_MANAGEMENT){
		// 유사얼굴체크용 단말기 제외
		terminalList.copyToDataSet(dsTerminalList, "UseAuth != 1");
	} else {
		terminalList.copyToDataSet(dsTerminalList);		
	}
	//dsTerminalList.setFilter("Type =="+0);
}

// 파일 타입 콤보 박스 선택시
function onUFMGR_cmbFileTypeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/* @type cpr.controls.ComboBox */
	var cmbFileType = e.control;
	var item = cmbFileType.getSelection();
	
	if( item ){
		
		var extention = "";
		switch (item[0].value){
			case "1": extention = ".csv"; break;
			case "2": extention = ".jpg"; break;
			case "3": extention = ".wav"; break;
			case "4": extention = ".wav"; break;
			case "5": extention = ".mp4"; break;
			default:  extention = ".*"; break;		
		}
		var fiFileInput = app.lookup("UFMGR_fiFileInput");	
		fiFileInput.acceptFile = extention;
	}
}

//
function onUFMGR_fiFileInputValueChange(/* cpr.events.CValueChangeEvent */ e){
	/* @type cpr.controls.FileInput */
	var fiFileInput = e.control;
	
	var cmbFileType = app.lookup("UFMGR_cmbFileType");
	var dmFileInfo = app.lookup("FileInfo");
	dmFileInfo.setValue("name",fiFileInput.file.name);
	console.log(fiFileInput.file.type);
	switch (fiFileInput.file.type){
		case "application/vnd.ms-excel": 
		case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
		case "text/csv":
			dmFileInfo.setValue("type",1);
			cmbFileType.selectItemByValue(1);			
			break;
		case "image/jpeg":
			dmFileInfo.setValue("type",2);
			cmbFileType.selectItemByValue(2);
			break;
		case "audio/wav":
			//var cmbFileType = e.control;
			var item = cmbFileType.getSelection();
			if (item ){
				if ( item[0].value == "3"){
					dmFileInfo.setValue("type",3);		// 성공음성		
					cmbFileType.selectItemByValue(3);	
				}else if ( item[0].value == "4"){
					dmFileInfo.setValue("type",4);		// 실패음성	
					cmbFileType.selectItemByValue(4);
				}				
			}
			//dmFileInfo.setValue("type",3);
			
			break;
		case "video/mp4":
			dmFileInfo.setValue("type",5);
			cmbFileType.selectItemByValue(5);
			break;
		case "image/png":
			dmFileInfo.setValue("type",7);
			cmbFileType.selectItemByValue(7);
			break;
		case "image/gif":
			dmFileInfo.setValue("type",8);
			cmbFileType.selectItemByValue(8);
			break;
		default: 
			cmbFileType.selectItemByValue(0);
			break;
	}
	//UFMGR_shlPreview
}


// 전송 버튼 클릭시
function onUFMGR_btnSendFileClick(/* cpr.events.CMouseEvent */ e){
	/* @type cpr.controls.Button */
	var uFMGR_btnSendFile = e.control;
	
	var dmFileInfo = app.lookup("FileInfo");	
	var fileInput = app.lookup("UFMGR_fiFileInput");	
	
	var file = fileInput.file;
	
	var type = dmFileInfo.getValue("type");
	if( type < 1 || type > 8 ){		
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_FileFormatInvalid"));
		return;
	}
			
	var grdTerminalList = app.lookup("UFMGR_grdTerminalList");
	var chkIndices = grdTerminalList.getCheckRowIndices();
	if( chkIndices.length== 0){
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_TerminalNotSelected"),"");
		return;
	}
		
	var dsTerminalIDList = app.lookup("TerminalIDList");
	dsTerminalIDList.clear();
	chkIndices.forEach(function( index ){
		var terminalRow = grdTerminalList.getRow(index);
		dsTerminalIDList.addRowData({"TerminalID":terminalRow.getValue("ID")});				
	});
		
	var sms_terminalFileTransfer = app.lookup("sms_terminalFileTransfer");		
	sms_terminalFileTransfer.addFileParameter("userfile", file);
	
	comLib.showLoadMask("", dataManager.getString("Str_UserFileSend"), "", 0);
	sms_terminalFileTransfer.send();	
}

// 사용자 파일 전송 완료
function onSms_terminalFileTransferSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	comLib.hideLoadMask();
	if( result.getValue("ResultCode") == COMERROR_NONE){
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_FileTransferRequestSuccess"));
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
}

// 사용자 파일 전송 에러
function onSms_terminalFileTransferSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR);
}

// 사용자 파일 전송 타임아웃
function onSms_terminalFileTransferSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}


// 도움말
function onUFMGR_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}
