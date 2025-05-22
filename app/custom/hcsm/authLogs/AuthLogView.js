/************************************************
 * AuthLogView.js
 * Created at 2019. 1. 9. 오후 4:31:28.
 *
 * @author wonki
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var usint_version;
var oem_version;

var ENABLE_INNODEP_VMS = 0;
var ENABLE_MCP040 = 0;

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	
	ENABLE_INNODEP_VMS = dataManager.getENABLE_INNODEP_VMS();
	ENABLE_MCP040 = dataManager.getENABLE_MCP040();
	
	initControl();
	
	
	var initValue = app.getHost().initValue;
	var indexKey = initValue["ID"];
	var category = initValue["Param"][0];
	var keyword = initValue["Param"][1];
	
	var btnPlaybackVideo = app.lookup("btnPlaybackVideo");
	btnPlaybackVideo.visible = false;
	

		
	var dmAuthLogDetail = app.lookup("AuthLogDetail");
	dmAuthLogDetail.setValue("IndexKey",indexKey);
	
	var smsGetAuthLogListDetail = app.lookup("sms_getAuthLogListDetail");
	if(category != null ){ smsGetAuthLogListDetail.setParameters("searchCategory", category); }
	if(keyword != null ){ smsGetAuthLogListDetail.setParameters("searchKeyword", keyword); }
	
	sendAuthLogDetailRequest(0);		
	
	oem_version = dataManager.getOemVersion();
	switch (oem_version) {
	case OEM_ND_POWER_PLANT:
		// 남동발전소 Card -> 소속회사로 변경
		var cardNumTitle = app.lookup("optCardNum");
		cardNumTitle.unbind("value");
		cardNumTitle.value = dataManager.getString("Str_AffiliatedCompany");
	}

}

function initControl(){
	
	var cmbAuthType = app.lookup("ALVEW_cmbAuthType");
	if (cmbAuthType) {
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthTypeFPVerify"), 1));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthTypeFPIdentify"), 2));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_Password"), 3));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_Card"), 4));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthTypeFaceVerify"), 5));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthTypeFaceIdentify"), 6));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_MobileCard"), 7));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_TypeIrisIdentify"), 8));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_TypeIrisVerify"), 9));
		//cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_TypeQR"), 10));
		
		
		if(ENABLE_MCP040 == 1){
			
			//console.lgo("Inside 0xF0");
			
			//cmbAuthType.addItem(new cpr.controls.Item("RFID", 0x10));
			cmbAuthType.addItem(new cpr.controls.Item("Inside", 15));
		}
		
		
		if (dataManager.getOemVersion() == OEM_JAWOONDAE) {
			cmbAuthType.addItem(new cpr.controls.Item("PDA", 9998));
			cmbAuthType.addItem(new cpr.controls.Item("LPR", 9999));
		}
	}

	var cmbAuthResult = app.lookup("ALVEW_cmbAuthResult");
	if (cmbAuthResult) {
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_Success"), AuthLogResultSuccess));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultFail"), AuthLogResultFail));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultAccessDenied"), AuthLogResultAccessDenied));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeout"), AuthLogResultTimeout));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeoutCapture"), AuthLogResultTimeoutCapture));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeoutIdentify"), AuthLogResultTimeoutIdentify));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultAntiPassback"), AuthLogResultAntiPassback));	
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultDuress"), AuthLogResultDuress));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultBlackList"), AuthLogResultBlackList));
		
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultUnregistUser"), AuthLogResultInvalidUser));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultFPCaptureFailed"), AuthLogResultCapture));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultDuplicatedAuth"), AuthLogResultDuplicatedAuthentication));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultNetworkError"), AuthLogResultNetwork));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultServerBusy"), AuthLogResultServerBusy));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultFaceDetectionFailed"), AuthLogResultFaceDetection));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailMealPay"), AuthLogResultFailMealPay));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailMealTime"), AuthLogResultFailMealTime));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailNotExistsMealCode"), AuthLogResultFailNotExistsMealCode));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailPeriod"), AuthLogResultFailPeriod));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailMealLimit"), AuthLogResultFailMealLimit));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailDayLimit"), AuthLogResultFailDayLimit));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailMonthLimit"), AuthLogResultFailMonthLimit));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultSoftpassback"), AuthLogResultSoftpassback));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultNoMask"), AuthLogResultNoMask));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFeverDetection"), AuthLogResultFeverDetection));
	}

	var cmbFKey = app.lookup("ALVEW_cmbFuncKey");
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyF1"), 1));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyF2"), 2));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyAccess"), 3));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyF3"), 4));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyF4"), 5));
}

function sendAuthLogDetailRequest( offset ){
		
	var dmAuthLogDetail = app.lookup("AuthLogDetail");
	var indexKey = dmAuthLogDetail.getValue("IndexKey");
	dmAuthLogDetail.clear();
	dmAuthLogDetail.setValue("IndexKey",indexKey);
	
	var smsGetAuthLogListDetail = app.lookup("sms_getAuthLogListDetail");
	
	smsGetAuthLogListDetail.action = "/v1/authLogs/" + indexKey;	
	smsGetAuthLogListDetail.setParameters("offset", offset);	
		
	smsGetAuthLogListDetail.send();	
}

// 인증로그 상세정보 가져오기 완료
function onSms_getAuthLogListDetailSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode")
	if( resultCode == COMERROR_NONE){ // 로그인 상태		
		displayAuthLogDetail();
		sendTerminalCameraListReq(); 
	} else if( resultCode == 4){
		dialogAlert(app, dataManager.getString("Str_Info") , dataManager.getString("Str_LastData"));
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed") , dataManager.getString("Str_NoSearchResult"));
		dialogAlert(app, dataManager.getString("Str_Failed") , dataManager.getString(getErrorString(resultCode)));
		//app.close();
	}
}

// 인증로그 상세정보 가져오기 에러
function onSms_getAuthLogListDetailSubmitError(/* cpr.events.CSubmissionEvent */ e){	
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 인증로그 상세정보 가져오기 타임아웃
function onSms_getAuthLogListDetailSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

function sendTerminalCameraListReq(){
	var dmAuthLogDetail = app.lookup("AuthLogDetail");
	var terminalID = dmAuthLogDetail.getValue("TerminalID");	
	
	var sms_getTerminalCamera = app.lookup("sms_getTerminalCamera");
	sms_getTerminalCamera.action = "/v1/vms/terminal/"+terminalID+"/camera";
	sms_getTerminalCamera.send();
}

// 단말기 연동 카메라 리스트 가져오기 완료
function onSms_getTerminalCameraSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){
		
		//if (ENABLE_INNODEP_VMS == 1) {
			var sms_getOption = app.lookup("sms_getOption");
			sms_getOption.send();
		//}
		
	} else {		
		dialogAlert(app, dataManager.getString("Str_Failed"),dataManager.getString(getErrorString(resultCode)));
	}
	if (app.lookup("TerminalCameraList").getRowCount() > 0 ){
		app.lookup("ALVEW_btnAuthLogVideoView").visible = true;
	}else {
		app.lookup("ALVEW_btnAuthLogVideoView").visible = false;
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

// "< 이전 로그" 버튼에서 click 이벤트 발생 시 호출. 
function onALVEW_btnPrevAuthLogClick(/* cpr.events.CMouseEvent */ e){
	sendAuthLogDetailRequest(-1);
}

// "다음 로그 >" 버튼에서 click 이벤트 발생 시 호출.
function onALVEW_btnNextAuthLogClick(/* cpr.events.CMouseEvent */ e){
	sendAuthLogDetailRequest(1);
}

function displayAuthLogDetail() {
	var dmAuthLogDetail = app.lookup("AuthLogDetail");
	app.lookup("user_id").value = dmAuthLogDetail.getValue("UserID");	// 사용자 ID
	app.lookup("user_name").value = dmAuthLogDetail.getValue("UserName"); // 사용자 이름
	app.lookup("event_time").value = dmAuthLogDetail.getValue("EventTime");	// 이벤트 발생 시간
	
	app.lookup("card_no").value = dmAuthLogDetail.getValue("Card");	// 카드번호
	
	//app.lookup("func_type").value = dmAuthLogDetail.getValue("FuncType");	// 기능 타입 
	
	// 사용자 사진
	var userImage = dmAuthLogDetail.getValue("UserImage");
	if( userImage.length > 0){
		app.lookup("user_image").src = "data:image/png;base64," + dmAuthLogDetail.getValue("UserImage");
	}else{
		app.lookup("user_image").src = "../../../theme/images/noImg.gif";		
	}
	
	// 인증로그 사진
	var logImage = dmAuthLogDetail.getValue("LogImage");
	if( logImage.length > 0){
		app.lookup("log_image").src = "data:image/png;base64," + dmAuthLogDetail.getValue("LogImage");
	}else{
		app.lookup("log_image").src = "../../../theme/images/noImg.gif";		
	}
	app.lookup("ALVEW_opbLatitude").value = dmAuthLogDetail.getValue("Latitude");	// 카드번호
	app.lookup("ALVEW_opbLongitude").value = dmAuthLogDetail.getValue("Longitude");	// 카드번호
	var grpAuthLogDetailView = app.lookup("ALVEW_grpAuthLogDetailView");	
	grpAuthLogDetailView.redraw(); 
}

//
function onButtonClick3(/* cpr.events.CMouseEvent */ e){
	switch (Number(dataManager.getValueVMS("VmsType"))) {
	case VMSIDIS:
		// Todo: IDIS 등록된 계정이 로그인 했을 팝업 호출
		var dsTerminalCameraList = app.lookup("TerminalCameraList");
		for (var i=0; i < dsTerminalCameraList.getRowCount(); i++) {
			var row = dsTerminalCameraList.getRow(i);
			
			var url = "g2client://proto/play?"
			if (row.getValue("CameraName") != "") {
				var cameraName = row.getValue("CameraName").toString().split("/")[1].trim();
//				url += 'fen=' + btoa(unescape(encodeURIComponent(row.getValue("CameraName")))) + '&';
				url += 'fen=' + btoa(unescape(encodeURIComponent(cameraName))) + '&';
			}		
			if (row.getValue("CameraIP") != "") {
				url += 'address=' + row.getValue("CameraIP") + '&';
			}
			if (row.getValue("CameraPort") != "0") {
				url += 'port=' + row.getValue("CameraPort") + '&';
			}
			if (row.getValue("Param1") != "") {
				url += 'chs=' + String(parseInt(row.getValue("Param1"), 10) - 1) + '&';
			}
			var eventTime = app.lookup("AuthLogDetail").getValue("EventTime").replace(/-/gi, "");
			eventTime = eventTime.replace(/ /gi, "");
			eventTime = eventTime.replace(/:/gi, "");
			url += 'time=' + eventTime;
			// console.log(url);
			window.location.href = url;
		}
		break;
	default:
		localStorage.EventTime = app.lookup("AuthLogDetail").getValue("EventTime");
	
		localStorage.Str_Play = dataManager.getString("Str_Play");
		localStorage.Str_AuthLogVideoView = dataManager.getString("Str_AuthLogVideoView");
		var dsTerminalCameraList = app.lookup("TerminalCameraList");
		localStorage.terminalCameraList = JSON.stringify(dsTerminalCameraList.getRowDataRanged());
			 
		var address = document.URL.toString() + '/authLogVideoView';
		window.open(address, 'authLogVideoView', 'width=920,height=600,resizable=no,location=no,toolbar=no,menubar=no');
	}	
}

// 도움말
function onALVEW_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

/*
 * 그룹에서 dblclick 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 더블 클릭할 때 발생하는 이벤트.
 */
function onGrp2Dblclick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var grp2 = e.control;	
}

/*
 * "Playback Video" 버튼(btnPlaybackVideo)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnPlaybackVideoClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnPlaybackVideo = e.control;
	
	var usint_version = dataManager.getSystemVersion();
	
	var dmAuthLogDetail = app.lookup("AuthLogDetail");
	var eventTime = dmAuthLogDetail.getValue("EventTime");	
	var terminalID = dmAuthLogDetail.getValue("TerminalID");	

	var strTerminalID = dataManager.getString("Str_TerminalID");
	var strDevName = dataManager.getString("Str_DeviceName");
	var strDevSerial = dataManager.getString("Str_DeviceSerial");
	var strEventTime = dataManager.getString("Str_EventTime");
	var strPlaybackVideo = dataManager.getString("Str_PlaybackVideo");
	

	var address = document.URL.toString() + '/vmsInnodepPlayback?' + '&itgrm_version=' + usint_version 
				+ '&eventTime=' + eventTime
				+ '&terminalID=' + terminalID
				+ '&strTerminalID=' + strTerminalID
				+ '&strDevName=' + strDevName
				+ '&strDevSerial=' + strDevSerial
				+ '&strEventTime=' + strEventTime
				+ '&strPlaybackVideo=' + strPlaybackVideo
				;	
				
	var wp = window.open(address, '_blank', 'width=480,height=560,resizable=no,location=no,toolbar=no,menubar=no');
	
	return;	
	
	
	var option = {
		width : 480,
		height : 560,
		right: app.getContainer().getActualRect().left/4
	};	
	
	console.log("eventTime:" + eventTime);

	var appld = "app/main/vmsInnodep/vmsInnodepPlayback" + "?" + usint_version ;
	app.openDialog(appld, option, function(dialog){
	
	dialog.bind("headerTitle").toLanguage("Str_VmsInnodepPlayback");
	
	
	dialog.initValue = {
	"EventTime": eventTime, 
	"TerminalID": terminalID, 
	"strTerminalID": strTerminalID,
	"strDevName": strDevName,
	"strDevSerial": strDevSerial,
	"strEventTime": strEventTime,	
	"strPlaybackVideo": strPlaybackVideo,	
	};
	
	
	dialog.modal = false;
	/*
	 * code : 입출구구분코드, tmp : 입출구구분코드에 따른 입출구 안티패스백 데이터셋, selectArea: 현재 사이드 그리드에서 선택된 구역의 ID값, areas: 구역목록데이터셋
	 * antipass: 안티패스백 데이터셋
	 */
	//dialog.initValue = {code: code, tmp: code=="ent"?tmpEntranceList:tmpExitList, selectArea: selectAreaRow.getValue("AreaID"),
	//					areas: app.lookup("AreaList"), antipass: app.lookup("AntipassBack")};
	dialog.addEventListenerOnce("close", function(e){
			var result = dialog.returnValue;
			if(result){
				
				
			}
		});
	});		
	
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getOption = e.control;
	
	var btnPlaybackVideo = app.lookup("btnPlaybackVideo");
	var OptionInnodep = app.lookup("OptionInnodep");
	var UseRecording = OptionInnodep.getValue("UseRecording");
	if (UseRecording != 0)
	{
		btnPlaybackVideo.visible = true;
	}
	else
	{
		btnPlaybackVideo.visible = false;
	}
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getOptionSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getOption = e.control;
	
}

function onSms_getOptionSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getOption = e.control;
	
}

function onALVEW_btnLocationClick(/* cpr.events.CMouseEvent */ e){
	var latitude = app.lookup("ALVEW_opbLatitude").value;
	var longitude = app.lookup("ALVEW_opbLongitude").value;
	if (latitude == 0 && longitude == 0) {// 위치정보가 없습니다.
		dialogAlert(app, dataManager.getString("Str_Warning"),dataManager.getString("Str_LocationNotExistAuthLog"));
		return;
	}
	var googleLocationUrl = "https://www.google.com/maps/search/?api=1&query=" + latitude +","+longitude;
	//window.location.href = googleLocationUrl;
	var wp = window.open(googleLocationUrl, '_blank', 'width=1024,height=768,resizable=ok,location=no,toolbar=no,menubar=no');
	
}
