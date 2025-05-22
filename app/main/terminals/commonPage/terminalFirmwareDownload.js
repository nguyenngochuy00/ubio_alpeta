/************************************************
 * terminalFirmwareDownload.js
 * Created at 2019. 1. 9. 오후 2:07:36.
 *
 * @author joymrk
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;

// Body에서 load 이벤트 발생 시 호출.
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	var brandType = dataManager.getSystemBrandType();
	
	var dsHWType = app.lookup("TerminalHWType");
	dsHWType.setFilter("BrandType == "+brandType);
	
	var cmbTerminalType = app.lookup("TMFWD_cmbTerminalTypeData");
	var typeCount = dsHWType.getRowCount();
	console.log(typeCount);
	for( var i = 0; i < typeCount; i++ ){
		var item = dsHWType.getRow(i);
		cmbTerminalType.addItem(new cpr.controls.Item(item.getValue("Name"),item.getValue("Type"),brandType));
	}
	
	var terminalList = dataManager.getTerminalList();
	
	// 그룹으로 로그인 시 해당 그룹에 포함된 단말기만 보이도록 기능 수정 - otk
	//---> 그룹이 아닌 단말기가 로그 on/off 됬을때 그룹코드 값이 "" 처리되 보여지는 현상 수정  - otk
	var Loginuserinfo = dataManager.getAccountInfo();
	var Loginuserid = Loginuserinfo.getValue("UserID");
	var LoginPrivilege = Loginuserinfo.getValue("Privilege");
	
	var dsTerminalList = app.lookup("TerminalList");
	terminalList.copyToDataSet(dsTerminalList);
	var count = dsTerminalList.getRowCount();
	console.log("count" + count);
	for( var i = 0; i < count; i++) {
		if(Loginuserid != 1000000000000000000 && LoginPrivilege != 1) {
			var group = dsTerminalList.getValue("GroupCode");
			console.log("gorup"+ group);
			if(group == "null") {
				continue;
			} else {
				dsTerminalList.setFilter("Type =="+0);
			}
		} else {
			dsTerminalList.setFilter("Type =="+0);
		}
	}
	//<--- 그룹이 아닌 단말기가 로그 on/off 됬을때 그룹코드 값이 "" 처리되 보여지는 현상 수정  - otk
	
	//terminalList.copyToDataSet(dsTerminalList);
	//dsTerminalList.setFilter("Type =="+0);
	
	//dsTerminalList.setFilter("Status == 1");
	
	var sms_getFirmwareList = app.lookup("sms_getFirmwareList");
	sms_getFirmwareList.send();
	//이노뎁 커스터마이징 버전용
	if (dataManager.getOemVersion() == OEM_INNODEP_NORMAL) {
		app.lookup("TerminalHWType").setValue(5, "Name", "IUA-7100S");
		app.lookup("TerminalHWType").setValue(6, "Name", "IUC-5110S");
		app.lookup("TerminalHWType").setValue(13, "Name", "IFFR-SC7000");
		app.lookup("TerminalHWType").setValue(15, "Name", "IFFR-XFS");
	} else if (dataManager.getOemVersion() == OEM_JAWOONDAE || 
		dataManager.getOemVersion() == OEM_ARMY_HQ  || dataManager.getOemVersion() == OEM_ROKMCH) {
		var addHWType = {"Name":"PDA Device","Type":90,"BrandType":1};
		app.lookup("TerminalHWType").addRowData(addHWType);
		
	}
}


//"등록" 버튼에서 click 이벤트 발생 시 호출.
function onTMFWD_btnRegistClick(/* cpr.events.CMouseEvent */ e){
	var dmFirmwareInfo = app.lookup("dmFirmwareInfo")
	var fileInput = app.lookup("TMFWD_fiFirmware")
	var cmbTerminalType = app.lookup("TMFWD_cmbTerminalType")
	var ipbVersion = app.lookup("TMFWD_ipbVersion")
	var ipbDescription = app.lookup("TMFWD_ipbDescription")
	var file = fileInput.file
	var strSplit = file.name.split('.')
	var strExt = strSplit[strSplit.length-1].toLowerCase();
	if( strExt != "bin" && strExt != "umgz" &&strExt != "umg" && strExt != "umgx"){ // premium umgx사용 추가 - otk
		if (dataManager.getOemVersion() == OEM_ARMY_HQ  || dataManager.getOemVersion() == OEM_ROKMCH) {
			if (strExt != "exe") {
				var msg = dataManager.getString("Str_ErrorFileExtention") +"\n" +
				 dataManager.getString("Str_FileExtention") + " : "+ ".bin,.umgz,.umg,umgx .exe"
				dialogAlert(app, "Warning", msg);
				return;				
			}
		} else {
			var msg = dataManager.getString("Str_ErrorFileExtention") +"\n" +
			 dataManager.getString("Str_FileExtention") + " : "+ ".bin,.umgz,.umg, umgx"
			dialogAlert(app, "Warning", msg);
			return;	
		}
	}	
		
	if ( cmbTerminalType.value == 0 ){
		dialogAlert(app, "Warning", dataManager.getString("Str_TerminalTypeNotSelected"));
		return;
	}	
	
	dmFirmwareInfo.setValue("fileName", file.name);
	dmFirmwareInfo.setValue("terminalType", cmbTerminalType.value);
	dmFirmwareInfo.setValue("version", ipbVersion.value);
	dmFirmwareInfo.setValue("description", ipbDescription.value);
	
	var sms_postFirmware = app.lookup("sms_postFirmware")		
	sms_postFirmware.addFileParameter("firmware", file);
	
	comLib.showLoadMask("", dataManager.getString("Str_FirmWareRegistration"), "", 0);
	sms_postFirmware.send();
}

// "파일찾기" 버튼에서 click 이벤트 발생 시 호출.
function onTMFWD_btnFileFindClick(/* cpr.events.CMouseEvent */ e){
	var fileInput = app.lookup("TMFWD_fiFirmware")
	fileInput.openFileChooser();
}

function setResult(resultCode){
	var result = app.lookup("Result")
	result.setValue("ResultCode",resultCode);
}

function getResult(resultCode){
	var result = app.lookup("Result");
	return result.getValue("ResultCode");
}

// 서브미션에서 submit-done 이벤트 발생 시 호출.
function onSms_postFirmwareSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/* @type cpr.protocols.Submission */
	var sms_postFirmware = e.control;
	comLib.hideLoadMask();
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode==0){
		var dsFirmwareList = app.lookup("FirmwareList");
		var dmFirmwareInfo = app.lookup("FirmwareInfo")
		dsFirmwareList.addRowData(dmFirmwareInfo.getDatas());
		dsFirmwareList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
		
		dmFirmwareInfo.clear();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 서브미션에서 submit-error 이벤트 발생 시 호출.
function onSms_postFirmwareSubmitError(/* cpr.events.CSubmissionEvent */ e){
	setResult(-1)
}

// 서브미션에서 submit-timeout 이벤트 발생 시 호출.
function onSms_postFirmwareSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	setResult(-2)
}

// 서브미션에서 submit-success 이벤트 발생 시 호출.
function onSms_postFirmwareSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){		
}

// "삭제" 버튼에서 click 이벤트 발생 시 호출.
function onTMFWD_btnDeleteClick(/* cpr.events.CMouseEvent */ e){
	var grdFirmwareList = app.lookup("TMFWD_grdFirmwareList");
	var row = grdFirmwareList.getSelectedRow()
	if( row){				
		var sms_deleteFirmware = app.lookup("sms_deleteFirmware");
		sms_deleteFirmware.action = "/v1/terminals/firmware/"+row.getValue("ID");
		comLib.showLoadMask("", dataManager.getString("Str_FirmWareDelete"), "", 0);
		sms_deleteFirmware.send();
	}else{
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_FirmwareNotSelected"),"");
	}
}

// 펌웨어 삭제 종료
function onSms_deleteFirmwareSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var result = getResult();
	if( result==0){
		var firmwareID = app.lookup("ResultData").getValue("ID");
		var dsFirmwareList = app.lookup("FirmwareList");
		var row = dsFirmwareList.findFirstRow("ID == "+firmwareID);		
		if( row ){
			dsFirmwareList.realDeleteRow(row.getIndex());
		} 
	}else{
		//dialogAlert(app, "알림", "펌웨어를 삭제 실패","");  
		dialogAlert(app, dataManager.getString("Str_Warning"),dataManager.getString(getErrorString(result)),"");
	}
}

// 펌웨어 삭제 실패
function onSms_deleteFirmwareSubmitError(/* cpr.events.CSubmissionEvent */ e){
	setResult(-1)
}

// 펌웨어 삭제 타임아웃
function onSms_deleteFirmwareSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	setResult(-2)
}

// 콤보 박스에서 selection-change 이벤트 발생 시 호출.
function onTMFWD_cmbTerminalTypeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/* @type cpr.controls.ComboBox */
	var tMFWD_cmbTerminalType = e.control;
	var dsTerminalList = app.lookup("TerminalList");
	console.log("1: ",dsTerminalList.getRowDataRanged());
		
	var dsFirmwareList = app.lookup("FirmwareList");
	if( tMFWD_cmbTerminalType.value == 0){
		dsFirmwareList.clearFilter();
		dsTerminalList.clearFilter();
	} else {
		console.log("2: ",tMFWD_cmbTerminalType.value);
		dsTerminalList.setFilter("Type =="+tMFWD_cmbTerminalType.value);
		dsFirmwareList.setFilter("terminalType =="+tMFWD_cmbTerminalType.value);		
	}
}

// FW 리스트에서 FW 선택시
function onTMFWD_grdFirmwareListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var grdFirmwareList = app.lookup("TMFWD_grdFirmwareList");
	var row = grdFirmwareList.getSelectedRow()
	if( row){				
		var type = row.getValue("terminalType");
		var dsTerminalList = app.lookup("TerminalList");
		dsTerminalList.setFilter("Type =="+type);
	}
}


// 전송 버튼 클릭시
function onTMFWD_btnFWDownloadClick(/* cpr.events.CMouseEvent */ e){
	var grdFirmwareList = app.lookup("TMFWD_grdFirmwareList");
	var row = grdFirmwareList.getSelectedRow()
	if( row){				
		var firmwareID = row.getValue("ID");
		
		var dmFirmwareID = app.lookup("FirmwareID");
		dmFirmwareID.setValue("FirmwareID",firmwareID);
		
		var grdTerminalList = app.lookup("TMFWD_grdTerminalList");
		var chkIndices = grdTerminalList.getCheckRowIndices();
		
		if( chkIndices.length== 0){
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalNotSelected"),"");
			return;
		}
		
		var dsTerminalIDList = app.lookup("TerminalIDList");
		dsTerminalIDList.clear();
		chkIndices.forEach(function( index ){
			var terminalRow = grdTerminalList.getRow(index);
			dsTerminalIDList.addRowData({"TerminalID":terminalRow.getValue("ID")});				
		});
		//console.log(dsTerminalIDList.getRowDataRanged());
		
		comLib.showLoadMask("", dataManager.getString("Str_FirmWareDownload"), "", 0);
		
		var sms_postFirmwareDownload = app.lookup("sms_postFirmwareDownload");
		sms_postFirmwareDownload.send();
	}else{
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_FirmwareNotSelected"),"");
	}
}

//
function onSms_postFirmwareDownloadSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_FirmwareDownloadRequestSuccess"));
	} else {
		if( resultCode == 0x0C000001){
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_AnotherFirmwareDownloadProcessing"));
		}else{
			//dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_FirmwareDownloadRequestFailed"));
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString(getErrorString(resultCode)));
		}
	}
}

//
function onSms_postFirmwareDownloadSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

//
function onSms_postFirmwareDownloadSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}


// 도움말 페이지
function onTMFWD_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}
