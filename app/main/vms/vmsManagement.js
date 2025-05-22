/************************************************
 * vmsManagement.js
 * Created at 2020. 9. 21. 오전 11:13:23.
 *
 * @author fois
 ************************************************/
var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var util = cpr.core.Module.require("lib/Utils");
var VMVMS_setting_init = false;

var mainLib;
var usint_version;

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	mainLib = mainManager(app);
	usint_version = dataManager.getSystemVersion();
	
	var btnInnodepVms = app.lookup("btnInnodepVms");
	btnInnodepVms.visible = false;
	var tabFolder = app.lookup("VM_TabFolder");
	var licenseLevel = dataManager.getSystemLicenseLevel();
	
	if(licenseLevel < LicenseENTERPRISE){
		tabFolder.setSelectedTabItem(tabFolder.getTabItemByID(4));
		tabFolder.removeTabItem(tabFolder.getTabItemByID(1));
		tabFolder.removeTabItem(tabFolder.getTabItemByID(2));
		tabFolder.removeTabItem(tabFolder.getTabItemByID(3));
	}
	
	if(licenseLevel >= LicenseSTANDARD) { // core 라이선스 엔터프라이즈에서 스탠다드로 하향 변경 됌.
		var productID = dataManager.getSystemInfo().getValue("ProductID");
		if(productID == ProductCore) {	
			tabFolder.getTabItemByID(4).visible = true;
		}
	}
	
	var cmbVMSType = app.lookup("VMVMS_cmbVMSType");
	cmbVMSType.addItem(new cpr.controls.Item("----",0));
	cmbVMSType.addItem(new cpr.controls.Item("HikVision",VMSHikVision));
	cmbVMSType.addItem(new cpr.controls.Item("Innodep",VMSInnodep));
	cmbVMSType.addItem(new cpr.controls.Item("IDIS",VMSIDIS));
	cmbVMSType.selectItem(0);	
	
	var terminalList = dataManager.getTerminalList();
	var dsTerminalList = app.lookup("TerminalList");
	dsTerminalList.build(terminalList.getRowDataRanged());
	dsTerminalList.setSort("ID asc");
	
	var cameraSearchList = app.lookup("VMCSP_grdCameraSearchList");
	cameraSearchList.sort("parseInt(EncodeDevIndexCode,10) asc");
	
	var layout = app.lookup("vms_multiView_setting").getLayout();
	var rows = layout.getRows();
	rows[1] = '0px';
	rows[3] = '0px';
	layout.setRows(rows);
	app.lookup("vms_multiView_setting").redraw();
	
	// (MultiView) 영상화질 콤보박스 init
	initTranscodeCombo();
	
	sendVmsSettingReq();
	sendCameraListReq();
	sendMultiViewSettingReq();
}

// Common ----------------------------------------------------------------------------

function onTabFolderSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var tabFolder = e.control;
	var tabItem = tabFolder.getSelectedTabItem();
	
	switch(tabItem.id){
		case 3:
			if( VMVMS_setting_init == false ){
				var sms_getVmsSetting = app.lookup("sms_getVmsSetting");
				sms_getVmsSetting.send();
			}
			break;
		default:
			break;
	}
	
	app.lookup("VMCSP_cbxTeminalSettingCameraListSort").value = 0;
	app.lookup("VMCSP_cbxCameraListSort").value = 0;
	app.lookup("VMCSP_cbxCameraSearchListSort").value = 0;
}

function sendCameraListReq(){
	app.lookup("CameraList").clear();
	
	var sms_getCamera = app.lookup("sms_getCamera");
	sms_getCamera.send();
}

function sendVmsSettingReq(){
	app.lookup("VMSConnectionInfo").clear();
	
	var sms_getVmsSetting = app.lookup("sms_getVmsSetting");
	sms_getVmsSetting.send();
}


// 카메라 리스트 가져오기 완료
function onSms_getCameraSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){
		var camerListSort = app.lookup("VMCSP_cbxCameraListSort");
		var cameraList = app.lookup("VMCSP_grdCameraList");
		
		if(camerListSort.value==1){
			cameraList.sort("CameraIP asc, parseInt(Param1, 10) asc, CameraName asc");
		}else{
			cameraList.sort("parseInt(CameraID, 10) asc");
		}
		
	} else {		
		dialogAlert(app, dataManager.getString("Str_Failed"),dataManager.getString(getErrorString(resultCode)));
	}
}

// 카메라 리스트 가져오기 에러
function onSms_getCameraSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// 카메라 리스트 가져오기 타임아웃
function onSms_getCameraSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// Terminal Setting ----------------------------------------------------------------------------

// 단말기 리스트 클릭
function onVMTSP_grdTerminalListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.Grid	 */
	var grdTerminalList = e.control;
	var terminalInfo = grdTerminalList.getSelectedRow();
	if( terminalInfo ){
		var dsTerminalCameraList = app.lookup("TerminalCameraList");
		dsTerminalCameraList.clear();
		sendTerminalCameraListReq(terminalInfo.getValue("ID"));
	}
}

function sendTerminalCameraListReq( terminalID ){
	app.lookup("TerminalCameraList").clear();
	app.lookup("TerminalCameraList").setSort("CameraID asc");
	
	var sms_getTerminalCamera = app.lookup("sms_getTerminalCamera");
	sms_getTerminalCamera.action = "/v1/vms/terminal/"+terminalID+"/camera";
	sms_getTerminalCamera.send();
}

// 단말기 연동 카메라 리스트 가져오기 완료
function onSms_getTerminalCameraSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){
	} else {		
		dialogAlert(app, dataManager.getString("Str_Failed"),dataManager.getString(getErrorString(resultCode)));
	}
}

// 단말기 연동 카메라 리스트 가져오기 에러
function onSms_getTerminalCameraSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// 단말기 연동 카메라 리스트 가져오기 타임아웃
function onSms_getTerminalCameraSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// 단말 카메라 링크 삭제
function onVMTSP_btnCameraRemoveClick(/* cpr.events.CMouseEvent */ e){
		
	var grdLinkedCameraList = app.lookup("VMTSP_grdLinkedCameraList");
	var checkedIndices = grdLinkedCameraList.getCheckRowIndices();
	if( checkedIndices.length <1 ){		
		return;
	}
	var dsDeviceIDList = app.lookup("DeviceIDList");
	dsDeviceIDList.clear();
	
	checkedIndices.forEach(function(index){
		var row = grdLinkedCameraList.getRow(index);		
		var deviceID = row.getValue("CameraID");
		var insertedRow = dsDeviceIDList.addRow();
		insertedRow.setValue("ID",deviceID);
	});
	dsDeviceIDList.commit();
	
	comLib.showLoadMask("",dataManager.getString("Str_Save"),"",1);
	sendTerminalCameraDeleteReq();
}

function sendTerminalCameraDeleteReq(){
	var grdTerminalList = app.lookup("VMTSP_grdTerminalList");
	var terminalInfo = grdTerminalList.getSelectedRow();
	if( terminalInfo == null ){
		comLib.hideLoadMask();
		return;
	}
	var terminalID = terminalInfo.getValue("ID");
	
	var dsDeviceIDList = app.lookup("DeviceIDList");
	var count = dsDeviceIDList.getRowCount();
	if( count < 1 ){
		comLib.hideLoadMask();		
		sendTerminalCameraListReq(terminalID);
		return;
	}
	
	var dsDeviceList = app.lookup("DeviceList");
	var cameraID = dsDeviceIDList.getRow(0).getValue("ID");
		
	dsDeviceIDList.realDeleteRow(0);
		
	var sms_deleteTerminalCamera = app.lookup("sms_deleteTerminalCamera");
	sms_deleteTerminalCamera.action = "/v1/vms/terminal/"+terminalID+"/camera/"+cameraID;
	sms_deleteTerminalCamera.send();	
}
// 단말 카메라 삭제 완료
function onSms_deleteTerminalCameraSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){		
		sendTerminalCameraDeleteReq();
	} else {	
		comLib.hideLoadMask();	
		dialogAlert(app, dataManager.getString("Str_Failed"),dataManager.getString(getErrorString(resultCode)));
	}
}

// 단말 카메라 삭제 에러
function onSms_deleteTerminalCameraSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// 단말 카메라 삭제 타임아웃
function onSms_deleteTerminalCameraSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// 단말 카메라 링크 생성
function onVMTSP_btnCameraRegistClick(/* cpr.events.CMouseEvent */ e){
	var dsLinkedCameraList = app.lookup("TerminalCameraList");
	var grdLinkableCameraList = app.lookup("VMTSP_grdLinkableCameraList");
	var checkedIndices = grdLinkableCameraList.getCheckRowIndices();
	if( checkedIndices.length <1 ){		
		return;
	}
	var dsDeviceIDList = app.lookup("DeviceIDList");
	dsDeviceIDList.clear();
	
	checkedIndices.forEach(function(index){
		var row = grdLinkableCameraList.getRow(index);		
		var deviceID = row.getValue("CameraID");
		var existInfo = dsLinkedCameraList.findFirstRow("CameraID == '"+deviceID+"'");
		if( existInfo == null ){
			var insertedRow = dsDeviceIDList.addRow();
			insertedRow.setValue("ID",deviceID);
		}
	});
	dsDeviceIDList.commit();
	
	comLib.showLoadMask("",dataManager.getString("Str_Save"),"",1);
	sendTerminalCameraRegistReq();
}

function sendTerminalCameraRegistReq(){
	var grdTerminalList = app.lookup("VMTSP_grdTerminalList");
	var terminalInfo = grdTerminalList.getSelectedRow();
	if( terminalInfo == null ){
		comLib.hideLoadMask();
		return;
	}
	var terminalID = terminalInfo.getValue("ID");
	
	var dsDeviceIDList = app.lookup("DeviceIDList");
	var count = dsDeviceIDList.getRowCount();
	if( count < 1 ){
		comLib.hideLoadMask();		
		sendTerminalCameraListReq(terminalID);
		return;
	}
	
	var dsDeviceList = app.lookup("DeviceList");
	var cameraID = dsDeviceIDList.getRow(0).getValue("ID");
		
	dsDeviceIDList.realDeleteRow(0);
		
	var sms_postTerminalCamera = app.lookup("sms_postTerminalCamera");
	sms_postTerminalCamera.action = "/v1/vms/terminal/"+terminalID+"/camera/"+cameraID;
	sms_postTerminalCamera.send();
}

// 단말 카메라 추가 완료
function onSms_postTerminalCameraSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){		
		sendTerminalCameraRegistReq();
	} else {	
		comLib.hideLoadMask();	
		dialogAlert(app, dataManager.getString("Str_Failed"),dataManager.getString(getErrorString(resultCode)));
	}
}

// 단말 카메라 추가 에러
function onSms_postTerminalCameraSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// 단말 카메라 추가 타임아웃
function onSms_postTerminalCameraSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// Camera Setting ----------------------------------------------------------------------------

// 라이브 뷰 클릭
function onVMCSP_btnLiveVideoClick(/* cpr.events.CMouseEvent */ e){
	switch (Number(app.lookup("VMVMS_cmbVMSType").value)) {
	case VMSIDIS:
		var row = app.lookup("VMCSP_grdCameraList").getSelectedRow();
		if (row == null)  {
			dialogAlert(app, dataManager.getString("Str_Failed"),dataManager.getString("Str_NoSelection"));
			return;
		}
		// console.log(row.getRowData());
		
		var url = "g2client://proto/live?"
		if (row.getValue("CameraName") != "") {
			// 카메라 Name 을 부모 Name 과 같이 가져오기 떄문에 추가
			var cameraName = row.getValue("CameraName").toString().split("/")[1].trim();
			url += 'fen=' + btoa(unescape(encodeURIComponent(cameraName))) + '&';
		}		
		if (row.getValue("CameraIP") != "") {
			url += 'address=' + row.getValue("CameraIP") + '&';
		}
		if (row.getValue("CameraPort") != "0") {
			url += 'port=' + row.getValue("CameraPort") + '&';
		}
		if (row.getValue("Param1") != ""){
			url += 'chs=' + String(parseInt(row.getValue("Param1"), 10) - 1) + '&';
		}

		console.log(url);
		window.location.href = url;
		
		break;
	default:
		localStorage.Str_LiveView = dataManager.getString("Str_LiveView");
		localStorage.Str_Play = dataManager.getString("Str_Play");
		localStorage.Str_Stop = dataManager.getString("Str_Stop");
		var dsCameraList = app.lookup("CameraList");
		localStorage.cameraList = JSON.stringify(dsCameraList.getRowDataRanged());
			 
		var address = document.URL.toString() + '/liveView';
		window.open(address, 'authLogVideoView', 'width=980,height=560,resizable=no,location=no,toolbar=no,menubar=no');		
	}		
}

// 카메라 검색 버튼 클릭
function onVMCSP_btnCarmeraSearchClick(/* cpr.events.CMouseEvent */ e){
	var sms_getCameraSearch = app.lookup("sms_getCameraSearch");
	sms_getCameraSearch.send();
}

// 카메라 검색 완료
function onSms_getCareraSearchSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	
	app.lookup("VMCSP_grdCameraSearchList").clearFilter();
	app.lookup("VMCSP_udcSearchCameraSearchList").resetValue();
	
	if( resultCode == COMERROR_NONE ){
		dialogAlert(app, dataManager.getString("Str_Success"),dataManager.getString("Str_SearchComplete"));
	} else {		
		dialogAlert(app, dataManager.getString("Str_Failed"),dataManager.getString(getErrorString(resultCode)));
	}
}

// 카메라 검색 에러
function onSms_getCareraSearchSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// 카메라 검색 타임아웃
function onSms_getCareraSearchSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// 검색된 카메라 등록
function onVMCSP_btnCameraRegistClick(/* cpr.events.CMouseEvent */ e){
	
	var grdCameraSearchList = app.lookup("VMCSP_grdCameraSearchList");
	var checkedIndices = grdCameraSearchList.getCheckRowIndices();
	if( checkedIndices.length <1 ){		
		return;
	}
	var dsDeviceIDList = app.lookup("DeviceIDList");
	
	dsDeviceIDList.clear();
	
	checkedIndices.forEach(function(index){
		var row = grdCameraSearchList.getRow(index);		
		var deviceID = row.getValue("EncodeDevIndexCode");
		var insertedRow = dsDeviceIDList.addRow();
		insertedRow.setValue("ID",deviceID);
	});
	
	dsDeviceIDList.commit();
	
	comLib.showLoadMask("",dataManager.getString("Str_Save"),"",1);
	sendCameraRegistReq();
		
}

function sendCameraRegistReq(){
	var dsDeviceIDList = app.lookup("DeviceIDList");
	var count = dsDeviceIDList.getRowCount();
	if( count < 1 ){
		comLib.hideLoadMask();
		sendCameraListReq();
		return;
	}
	
	var dsDeviceList = app.lookup("DeviceList");
	var deviceID = dsDeviceIDList.getRow(0).getValue("ID");
	
	var deviceInfo = dsDeviceList.findFirstRow("EncodeDevIndexCode == '"+ deviceID +"'");
	if( deviceInfo ){
		var dmCameraInfo = app.lookup("CameraInfo");	
		dmCameraInfo.setValue("CameraID",deviceInfo.getValue("EncodeDevIndexCode"));
		dmCameraInfo.setValue("CameraName",deviceInfo.getValue("EncodeDevName"));
		dmCameraInfo.setValue("CameraIP",deviceInfo.getValue("EncodeDevIp"));
		dmCameraInfo.setValue("CameraPort",deviceInfo.getValue("EncodeDevPort"));
		dmCameraInfo.setValue("CameraParam1",deviceInfo.getValue("Param1"));
		
		dsDeviceIDList.realDeleteRow(0);
		
		var sms_postCamera = app.lookup("sms_postCamera");
		sms_postCamera.send();		
	} else {
		comLib.hideLoadMask();
	}
}

// 카메라 등록 완료
function onSms_postCameraSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){	
		sendCameraRegistReq();
	} else {	
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Failed"),dataManager.getString(getErrorString(resultCode)));
		sendCameraListReq();
	}
}

// 카메라 등록 에러
function onSms_postCameraSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// 카메라 등록 타임아웃
function onSms_postCameraSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// 등록된 카메라 삭제
function onVMCSP_btnCameraUnRegistClick(/* cpr.events.CMouseEvent */ e){
	var grdCameraList = app.lookup("VMCSP_grdCameraList");
	var checkedIndices = grdCameraList.getCheckRowIndices();
	if( checkedIndices.length <1 ){		
		return;
	}
	var dsDeviceIDList = app.lookup("DeviceIDList");
	dsDeviceIDList.clear();
	
	checkedIndices.forEach(function(index){
		var row = grdCameraList.getRow(index);		
		var deviceID = row.getValue("CameraID");
		var insertedRow = dsDeviceIDList.addRow();
		insertedRow.setValue("ID",deviceID);
	});
	dsDeviceIDList.commit();
	
	comLib.showLoadMask("",dataManager.getString("Str_Save"),"",1);
	sendCameraDeleteReq();
}

function sendCameraDeleteReq(){
	var dsDeviceIDList = app.lookup("DeviceIDList");
	var count = dsDeviceIDList.getRowCount();
	if( count < 1 ){
		comLib.hideLoadMask();
		sendCameraListReq();
		return;
	}
	
	var dsDeviceList = app.lookup("DeviceList");
	var deviceID = dsDeviceIDList.getRow(0).getValue("ID");
		
	dsDeviceIDList.realDeleteRow(0);
		
	var sms_deleteCamera = app.lookup("sms_deleteCamera");
	sms_deleteCamera.action = "/v1/vms/camera/"+deviceID;
	sms_deleteCamera.send();
}


// 카메라 삭제 완료
function onSms_deleteCameraSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){		
		sendCameraDeleteReq();
	} else {	
		comLib.hideLoadMask();	
		dialogAlert(app, dataManager.getString("Str_Failed"),dataManager.getString(getErrorString(resultCode)));
	}
}

// 카메라 삭제 에러
function onSms_deleteCameraSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// 카메라 삭제 타임아웃
function onSms_deleteCameraSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// VMS Setting ----------------------------------------------------------------------------

// vms 설정 정보 가져오기 완료
function onSms_getVmsSettingSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){			
		VMVMS_setting_init = true;	
		app.lookup("VMVMS_grpConnectionInfo").redraw();
	} else {		
		dialogAlert(app, dataManager.getString("Str_Failed"),dataManager.getString(getErrorString(resultCode)));
	}
	
	selectVMSType();
}

// vms 설정 정보 가져오기 에러
function onSms_getVmsSettingSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// vms 설정 정보 가져오기 타임아웃
function onSms_getVmsSettingSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// 변경 사항 저장하기
function onVMVMS_btnApplyClick(/* cpr.events.CMouseEvent */ e){	
	var dmVMSConnectionInfo = app.lookup("VMSConnectionInfo");
	
	switch (dmVMSConnectionInfo.getValue("VmsType")) {
	case VMSHikVision:
	case VMSInnodep:
		if( dmVMSConnectionInfo.getValue("ServerAddress").length == 0){
			dialogAlert(app, dataManager.getString("Str_Warning"),dataManager.getString("Str_ServerAddressNotEntered"));		
			return;
		}
		break;
	case VMSIDIS:
		if (isNaN(dmVMSConnectionInfo.getValue("PopUpCount"))) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_FailCount") + ":" + dataManager.getString("Str_InvalidParamater"));
			sendVmsSettingReq();
			return;
		}
		break;
	default:
		dialogAlert(app, dataManager.getString("Str_Warning"),dataManager.getString("Str_VMSTypeNotSelected"));
		return;	
	}
		
	var sms_putVmsSetting = app.lookup("sms_putVmsSetting");
	sms_putVmsSetting.send();
}

// vms 설정 정보 저장 완료
function onSms_putVmsSettingSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){			
		dialogAlert(app, dataManager.getString("Str_Success"),dataManager.getString("Str_Saved"));		
	} else {		
		dialogAlert(app, dataManager.getString("Str_Failed"),dataManager.getString(getErrorString(resultCode)));
	}
}

// vms 설정 정보 저장 에러
function onSms_putVmsSettingSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// vms 설정 정보 저장 타임아웃
function onSms_putVmsSettingSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// 연결 테스트 버튼 클릭
function onVMVMS_btnConnectionTestClick(/* cpr.events.CMouseEvent */ e){
	app.lookup("VMVMS_txaTestResult").value = "";
	var sms_postVmsConnectionTest = app.lookup("sms_postVmsConnectionTest");
	sms_postVmsConnectionTest.send();
}

// vms 설정 테스트 완료
function onSms_postVmsConnectionTestSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){
		app.lookup("VMVMS_txaTestResult").redraw();		
		//dialogAlert(app, dataManager.getString("Str_Success"),dataManager.getString("Str_Saved"));		
	} else {		
		dialogAlert(app, dataManager.getString("Str_Failed"),dataManager.getString(getErrorString(resultCode)));
	}
}

// vms 설정 테스트 에러
function onSms_postVmsConnectionTestSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// vms 설정 테스트 타임아웃
function onSms_postVmsConnectionTestSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

//
function onVMSMV_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

/*
 * 버튼(btnInnodepVms)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnInnodepVmsClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnInnodepVms = e.control;
	
	var appld = "app/main/vmsInnodep/vmsInnodepManagement?" + "?" + usint_version;
	
	app.getRootAppInstance().openDialog(appld, {width: 1024, height: 768}, function(dialog){
		dialog.ready(function(dialogApp){
			dialog.bind("headerTitle").toLanguage("Str_InnodepVmsSetup");
			dialog.modal = false;
		});	
	}).then(function(returnValue){
			
	});	
}

function selectVMSType() {
	switch (Number(app.lookup("VMVMS_cmbVMSType").value)) {
	case VMSInnodep:
		app.lookup("ipb5").enabled = true;
		app.lookup("ipb6").enabled = true;
		app.lookup("VMVMS_btnConnectionTest").enabled = false;
		app.lookup("VMVMS_txaTestResult").enabled = false;
		app.lookup("btnInnodepVms").visible = true;
		app.lookup("grpVideoPopUp").enabled = false;
		app.lookup("vmsDescriptionMessage").visible = false;
		app.lookup("vmsDescriptionMessage").value = "";
		app.lookup("VMCSP_cbxCameraListSort").visible = false;
		app.lookup("VMCSP_cbxCameraSearchListSort").visible = false;
		app.lookup("VMCSP_cbxTeminalSettingCameraListSort").visible = false;
		app.lookup("VMCSP_cbxCameraListSort").value = 0;
		app.lookup("VMCSP_cbxCameraSearchListSort").value = 0;
		app.lookup("VMCSP_cbxTeminalSettingCameraListSort").value = 0;
		dataManager.setENABLE_INNODEP_VMS(1);
		break;
	case VMSIDIS:
		app.lookup("ipb5").enabled = false;
		app.lookup("ipb6").enabled = false;
		app.lookup("VMVMS_btnConnectionTest").enabled = true;
		app.lookup("VMVMS_txaTestResult").enabled = true;
		app.lookup("btnInnodepVms").visible = false;
		app.lookup("grpVideoPopUp").enabled = true;
		app.lookup("vmsDescriptionMessage").visible = true;
		app.lookup("vmsDescriptionMessage").value = "[IDIS Type] " + dataManager.getString("Str_VMSDescriptionMessage");		
		app.lookup("VMCSP_cbxCameraListSort").visible = true;
		app.lookup("VMCSP_cbxCameraSearchListSort").visible = true;
		app.lookup("VMCSP_cbxTeminalSettingCameraListSort").visible = true;
		app.lookup("VMCSP_cbxCameraListSort").value = 0;
		app.lookup("VMCSP_cbxCameraSearchListSort").value = 0;
		app.lookup("VMCSP_cbxTeminalSettingCameraListSort").value = 0;
		dataManager.setENABLE_INNODEP_VMS(0);
		break;
	default: // VMSHikVision
		app.lookup("ipb5").enabled = true;
		app.lookup("ipb6").enabled = true;
		app.lookup("VMVMS_btnConnectionTest").enabled = true;
		app.lookup("VMVMS_txaTestResult").enabled = true;
		app.lookup("btnInnodepVms").visible = false;
		app.lookup("grpVideoPopUp").enabled = false;
		app.lookup("vmsDescriptionMessage").visible = false;
		app.lookup("vmsDescriptionMessage").value = "";
		app.lookup("VMCSP_cbxCameraListSort").visible = false;
		app.lookup("VMCSP_cbxCameraSearchListSort").visible = false;
		app.lookup("VMCSP_cbxTeminalSettingCameraListSort").visible = false;
		app.lookup("VMCSP_cbxCameraListSort").value = 0;
		app.lookup("VMCSP_cbxCameraSearchListSort").value = 0;
			app.lookup("VMCSP_cbxTeminalSettingCameraListSort").value = 0;
		dataManager.setENABLE_INNODEP_VMS(0);
	}
}

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onVMVMS_cmbVMSTypeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var vMVMS_cmbVMSType = e.control;
	
	selectVMSType()
	
	// 초기 갑 세팅
	switch (Number(app.lookup("VMVMS_cmbVMSType").value)) {
	case VMSIDIS:
		app.lookup("ipb1").value = "127.0.0.1";
		app.lookup("ipb2").value = "11001";
		app.lookup("ipb3").value = "admin";
		app.lookup("ipb4").value = "";
		app.lookup("ipb5").value = "";
		app.lookup("ipb6").value = "0";
		app.lookup("ipb7").value = "0";
		break;
	default: // VMSInnodep, VMSHikVision
		app.lookup("ipb1").value = "127.0.0.1";
		app.lookup("ipb2").value = "0";
		app.lookup("ipb3").value = "admin";
		app.lookup("ipb4").value = "";
		app.lookup("ipb5").value = "127.0.0.1";
		app.lookup("ipb6").value = "0";
		app.lookup("ipb7").value = "0";
		break;	
	}
}

// 카메라 검색 리스트 정렬
function onVMCSP_cbxCameraSearchListSortValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.CheckBox
	 */
	var cameraSearchListSort = e.control.value;
	var cameraSearchList = app.lookup("VMCSP_grdCameraSearchList");
	cameraSearchList.clearSort();
	
	if(cameraSearchListSort==1){
		cameraSearchList.sort("EncodeDevIp asc, parseInt(Param1, 10) asc, EncodeDevName asc");
	}else{
		cameraSearchList.sort("parseInt(EncodeDevIndexCode, 10) asc");
	}
	
}

// 카메라 설정 카메라 리스트 정렬
function onVMCSP_cbxCameraListSortValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.CheckBox
	 */
	var cameraListSort = e.control.value;
	var cameraList = app.lookup("VMCSP_grdCameraList");
	cameraList.clearSort();
	
	if(cameraListSort==1){
		cameraList.sort("CameraIP asc, parseInt(Param1, 10) asc, CameraName asc");
	}else{
		cameraList.sort("parseInt(CameraID, 10) asc");
	}
}

// 터미널 세팅 카메라 리스트 정렬
function onVMCSP_cbxTeminalSettingCameraListSortValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.CheckBox
	 */
	var teminalSettingCameraListSort = e.control.value;
	var teminalSettingCameraList = app.lookup("VMTSP_grdLinkableCameraList");
	teminalSettingCameraList.clearSort();
	
	if(teminalSettingCameraListSort==1){
		teminalSettingCameraList.sort("CameraIP asc, parseInt(Param1, 10) asc, CameraName asc");
	}else{
		teminalSettingCameraList.sort("parseInt(CameraID, 10) asc");
	}
}


function onSearchCameraSearch(/* cpr.events.CUIEvent */ e){
	searchCameraSearchListReq();
}


function onSearchCameraSearchKeydown(/* cpr.events.CAppEvent */ e){
	if (e.keyCode == 13) {
		searchCameraSearchListReq();
	}
}

function searchCameraSearchListReq(){
	var cameraSearchList = app.lookup("VMCSP_grdCameraSearchList");
	var searchCtrl = app.lookup("VMCSP_udcSearchCameraSearchList");
	var sFilter = "";
	
	if((searchCtrl.searchKeyword!=null && searchCtrl.searchKeyword.split(" ").join("").length==0)|| searchCtrl.searchKeyword==null){
		cameraSearchList.clearFilter();
		return;
	}
	
	// 대소문자 구분없이 필터
	if(searchCtrl.searchCategory && !(searchCtrl.searchCategory=="All")){
		sFilter = searchCtrl.searchCategory+".toString().toUpperCase().indexOf('"+searchCtrl.searchKeyword.toString().toUpperCase()+"')>=0";
	}else{
		var categoryListArr = searchCtrl.categoryItemList();
		
		categoryListArr.forEach(function(each){			
			if(each.value!="All"){
				if(sFilter==""){
					sFilter = each.value+".toString().toUpperCase().indexOf('"+searchCtrl.searchKeyword.toString().toUpperCase()+"')>=0";
				}else{
					sFilter += "||"+each.value+".toString().toUpperCase().indexOf('"+searchCtrl.searchKeyword.toString().toUpperCase()+"')>=0";
				}
			}
		});
	}
	cameraSearchList.filter(sFilter);
	cameraSearchList.redraw();	
}


function sendMultiViewSettingReq(){
	app.lookup("VurixServerInfo").clear();
	app.lookup("sms_getMultiViewSetting").send();
}



/*
 * 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var vurixServerInfo = app.lookup("VurixServerInfo")
	
	app.lookup("sms_putMultiViewSetting").send();
	
//	if(confirmMultiViewSettingInput()) {
//		app.lookup("sms_putMultiViewSetting").send();
//	} else {
//		dialogAlert(app, dataManager.getString("Str_Warning"),dataManager.getString("Str_InvalidParamater"));
//	}
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_putMultiViewSettingSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_putMultiViewSetting = e.control;
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	var vurixServerInfo = app.lookup("VurixServerInfo");
	
	if( resultCode == COMERROR_NONE ){
		
		var isValid = util.ConfirmMultiViewSetting(vurixServerInfo);
		if(isValid) {
			dataManager.setENABLE_MULTIVIEW(1);
		} else {
			dataManager.setENABLE_MULTIVIEW(0);
		}
					
		dialogAlert(app, dataManager.getString("Str_Success"),dataManager.getString("Str_Saved"));
		
	} else {		
		dialogAlert(app, dataManager.getString("Str_Failed"),dataManager.getString(getErrorString(resultCode)));
	}
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getMultiViewSettingSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getMultiViewSetting = e.control;
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){
		app.lookup("vms_multiView_setting").redraw();
		
	} else {		
		dialogAlert(app, dataManager.getString("Str_Failed"),dataManager.getString(getErrorString(resultCode)));
	}
}

function confirmMultiViewSettingInput() {
	var dmsUrl = app.lookup("dmsUrl").value;
	var vmsId = app.lookup("vmsId").value;
	var apiurl = app.lookup("apiurl").value;
	var vurixid = app.lookup("vurixid").value;
	var vurixPw = app.lookup("vurixPw").value;
	var vurixGroup = app.lookup("vurixGroup").value;
	
	if(vmsId.length < 1) {
		return false;
	} else if(apiurl.length < 1) {
		return false;
	} else if(vurixid.length < 1) {
		return false;
	} else if(vurixPw.length < 1) {
		return false;
	} else if(vurixGroup.length < 1) {
		return false;
	} else {
		return true
	}
//	if(dmsUrl.length < 1) {
//		return false;
//	} else if(vmsId.length < 1) {
//		return false;
//	} else if(apiurl.length < 1) {
//		return false;
//	} else if(vurixid.length < 1) {
//		return false;
//	} else if(vurixPw.length < 1) {
//		return false;
//	} else if(vurixGroup.length < 1) {
//		return false;
//	} else {
//		return true
//	}
}

function initTranscodeCombo() {
	var cmbTransCode = app.lookup("cmb_TransCode");
	if(cmbTransCode) {
		cmbTransCode.addItem(new cpr.controls.Item(dataManager.getString("Str_OriginalImageQuality"), 0));
		cmbTransCode.addItem(new cpr.controls.Item("32px", 32));
		cmbTransCode.addItem(new cpr.controls.Item("100px", 100));
		cmbTransCode.addItem(new cpr.controls.Item("200px", 200));
		cmbTransCode.addItem(new cpr.controls.Item("300px", 300));
		cmbTransCode.addItem(new cpr.controls.Item("400px", 400));
		cmbTransCode.addItem(new cpr.controls.Item("500px", 500));
		cmbTransCode.addItem(new cpr.controls.Item("600px", 600));
		cmbTransCode.addItem(new cpr.controls.Item("700px", 700));
		cmbTransCode.addItem(new cpr.controls.Item("800px", 800));
		cmbTransCode.addItem(new cpr.controls.Item("900px", 900));
		cmbTransCode.addItem(new cpr.controls.Item("1000px", 1000));
		cmbTransCode.selectItemByValue("0");
		
	}
}


/*
 * 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	if(confirmMultiViewSettingInput()) {
		app.lookup("sms_postVurixApiConnectionTest").send();
	} else {
		dialogAlert(app, dataManager.getString("Str_Warning"),dataManager.getString("Str_InvalidParamater"));
	}
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postVurixApiConnectionTestSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_postVurixApiConnectionTest = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	var resultMessage = app.lookup("ResultMessage").getValue("Message");
	
	if( resultCode == COMERROR_NONE ){
		dialogAlert(app, dataManager.getString("Str_Success"),resultMessage);
		
	} else {		
		if(resultMessage != "") {
			dialogAlert(app, dataManager.getString("Str_Failed"),resultMessage);
			return;
		}
		dialogAlert(app, dataManager.getString("Str_Failed"),dataManager.getString(getErrorString(resultCode)));
	}
	
}


/*
 * 인풋 박스에서 mousedown 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 누를 때 발생하는 이벤트.
 */
function onVurixPwMousedown(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var vurixPw = e.control;
	vurixPw.secret = false;
}


/*
 * 인풋 박스에서 mouseup 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 뗄 때 발생하는 이벤트.
 */
function onVurixPwMouseup(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var vurixPw = e.control;
	vurixPw.secret = true;
}
