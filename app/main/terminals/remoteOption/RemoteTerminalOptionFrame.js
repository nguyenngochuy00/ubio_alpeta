/************************************************
 * RemoteTerminalOptionManagement.js
 * Created at 2023. 11. 23. 오후 1:41:38.
 *
 * @author zxc
 ************************************************/

var SvrSendFlag;
var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var usint_version;
var oem_version;
var getOptionFlag = 0;	// 옵션 get 성공 flag
var getOptionErrorCode = 0;	// 옵션 get 에러코드
var rebootFlag = 0; // 재부팅 flag
var productID; // 라이센스 Core 확인용
var terminalJsonVersion;


function OptDataInit() {
	app.lookup("TerminalOptionInfo").reset();
}

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	oem_version = dataManager.getOemVersion();
	productID = dataManager.getSystemData("ProductID");
	terminalJsonVersion = dataManager.getTerminalJsonVersion();
	
	SvrSendFlag = 0; // 단말기 설정 정보 저장 요청 Flag
	OptDataInit();
	UTCDataInit();
	
	if (oem_version != OEM_ARMY_HQ && oem_version != OEM_ITONE_TRDATA && oem_version != OEM_ITONE_POSCO_DX && dataManager.getOemVersion() != OEM_ROKMCH){ // 육본,아이티원이 아니면 등록기 설정 부분 삭제 
		app.lookup("RTOF_GR_Header").getLayout().setColumns(["0px", "100px", "1fr","1fr", "140px", "80px", "80px", "14px"]); 
	} 
	
	var hostAppIns = app.getHostAppInstance();
	if (hostAppIns) {
		// 단말기 정보
		var initValue = app.getHost().initValue;
		var requestData = app.lookup("sms_get_terminal_info");
		var terminalID = initValue["TerminalID"];
		
		requestData.action = "/v1/terminals/" + terminalID;
		requestData.setParameters("apbflag", true);
		requestData.setParameters("imageflag", false);
		requestData.send();
	}
	app.lookup("TMVBA_opbDiscription").bind("value").toLanguage("Str_Description");
}


function onRTOM_grpButtonsClick(/* cpr.events.CMouseEvent */ e){
	var grpButtons = e.control;
	
	// 단말기 정보 못가져 왔을시 클릭 x
	if (getOptionFlag > 0) {
		changePage(grpButtons);
	} else {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorGetTerminalInfo") + " : " + dataManager.getString(getErrorString(getOptionErrorCode)));
	}
}

function changePage(selectedButton) {
	var emb = app.lookup("RTOM_eaOptionPage");
	var grpButtons = app.lookup("RTOM_grpButtons");
	var buttons = grpButtons.getChildren();
	
	var terminalInfo = app.lookup("TerminalInfo");
	var url;
	var terminalType = app.lookup("TerminalInfo").getValue("Type");
	
	var strType = getTerminalModelString(terminalType);
	
	if(strType == "UBio-X Pro Lite") {
		url = selectedButton.userattr("src") + "?" + usint_version;
	} else {
		// Face Pro 기준. 옵션 설정 범위 적용
		url = selectedButton.userattr("srcPro") + "?" + usint_version;
	}
	
	emb.app = null;
	cpr.core.App.load(url, function(loadedApp) {
		if (!loadedApp) {
			return;
		}
		emb.app = loadedApp;
		emb.redraw();
		emb.initValue = terminalType;
		
		for (var i = 0; i < buttons.length; i++) {
			if (selectedButton == buttons[i]) {
				buttons[i].style.css("backgroundColor", "#E3E0DF");
				buttons[i].style.css("border-bottom", "2px black solid");
			} else {
				buttons[i].style.removeStyle("backgroundColor");
				buttons[i].style.removeStyle("border-bottom");
			}
		}
		
	});
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_get_terminal_infoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	if (ResultCode == 0) {

		var TerminalInfo = app.lookup("TerminalInfo");
		var Id = TerminalInfo.getValue("ID");
		app.lookup("RTOF_ipbTerminalID").value = Id;
		
		var Name = TerminalInfo.getValue("Name");
		app.lookup("RTOF_ipbName").value = Name;
	
		var Type = TerminalInfo.getValue("Type");
		var strType = getTerminalModelString(Type);
		app.lookup("RTOF_cmbType").value = strType;
		
//		var RegisterFlag = TerminalInfo.getValue("RegisterFlag");
//		app.lookup("cbxRegistTerminal").value = RegisterFlag;
		
		
		// 단말기 사진 
		var terminalImage = app.lookup("TMVBA_imgTerminaPicture");
		var srcPath = getTerminalModelImageSrc(Type);
		if (srcPath != undefined && srcPath.length > 0) {
			terminalImage.style.css({
				"background-repeat": "no-repeat",
				"background-color": "rgba(255,255,255,0)",
				"background-position": "center",
				"background-image": "url(" + srcPath + ")",
				"background-size": "contain",
				"font-weight": "bolder",
				"color": "black"
			});
		} else {
			terminalImage.style.css({
				"background-repeat": "no-repeat",
				"background-color": "rgba(255,255,255,0)",
				"background-position": "center",
				"background-image": "url(../../../../theme/images/common/common_black_img_180.png)",
				"background-size": "contain",
				"font-weight": "bolder",
				"color": "black"
			});
			
		}
		
		var dsApbInfo = app.lookup("TerminalApbAreaInfo");
		
		if (dsApbInfo.getValue("AreaIn") == 0 && dsApbInfo.getValue("AreaOut") == 0) {
			app.lookup("RTOF_cmbSoftPassback").enabled = false;
		} else {
			app.lookup("RTOF_cmbSoftPassback").enabled = true;
		}
		
	} else {
		
	}
	
	var getType = app.lookup("TerminalInfo").getValue("Type");
	
	var strType = getTerminalModelString(Type);
	if (productID == ProductCore || productID == ProductCoreAndMobile){
		// Core 지원 단말만 보이도록 수정
		if(getType == 46 || getType == 47) {
			var cbxCore = app.lookup("RTOF_cbxCore");
			cbxCore.visible = true;
			cbxCore.enabled = true;
			if (TerminalInfo.getValue("CoreFlag") == 0){
				cbxCore.checked = false 
			} else {
				cbxCore.checked = true
			}
		}
	}
		
	
	app.lookup("grpTerminalInfo").redraw();
	
	
	GetJsonTerminalOptionInfo();
	
}

function onSms_get_terminal_infoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", -1);
}


function onSms_get_terminal_infoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", -2);
}


function onRTOF_ipbNameValueChange(/* cpr.events.CValueChangeEvent */ e){
	SvrSendFlag = 1;
}


/*
 * 버튼(TMVBA_Save)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTMVBA_SaveClick(/* cpr.events.CMouseEvent */ e){
	var TerminalApbAreaInfo = app.lookup("TerminalApbAreaInfo");
	TerminalApbAreaInfo.setValue("ID", app.lookup("RTOF_ipbTerminalID").value);
	if(!getOptionInfo()) {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(getOptionErrorCode)));
		return;
	}
	
	rebootFlag = app.lookup("TerminalOptionInfo").getValue("Reboot_Flag");
	if(rebootFlag == 1) {
		dialogConfirm(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_RebootOption"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue) {
					saveFunction();
				} else {
					var beforeInfo = app.lookup("BeforeTerminalOptionInfo");
					var optionInfo = app.lookup("TerminalOptionInfo");
					beforeInfo.copyToDataMap(optionInfo); 
				}
			});
		});
	} else {
		saveFunction();
	}
}

function saveFunction() {
	comLib.showLoadMask("", dataManager.getString("Str_TerminalSave"), "", 0);
	if (SvrSendFlag == 1) {
		var requestData = app.lookup("sms_put_terminal_info");
		var terminalID = app.lookup("TerminalInfo").getValue("ID");
		requestData.action = "/v1/terminals/" + terminalID;
		requestData.send();
	} else {
		// json 으로 옵션 get 시에만 업데이트 요청
		if (getOptionFlag > 0) {
			SendJsonOptiontoTerminal();
		} else {
			comLib.hideLoadMask();
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(getOptionErrorCode)));
		}
	}
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_put_terminal_infoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var errorCode = app.lookup("Result").getValue("ResultCode");
	if (errorCode == COMERROR_NONE) {
		SvrSendFlag = 0; // Modify Flag 초기화
		
		// json 으로 옵션 get 시에만 업데이트 요청
		if (SendJsonOptiontoTerminal()) {	// 업데이트
			comLib.hideLoadMask();
			dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_TerminalSaveSuccess"));
		} else {
			comLib.hideLoadMask();
//			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_TerminalSaveFail"));
		}

		var commandEvent = new cpr.events.CUIEvent("execute-command", {
			content: {
				"target": DLG_TERMINAL_MANAGEMENT,
				"command": "Update",
				"TerminalInfo": app.lookup("TerminalInfo").getDatas()
			}
		});
		
		app.getHostAppInstance().dispatchEvent(commandEvent);
		
	} else {
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(errorCode)));
	}
}


function onSms_put_terminal_infoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_ERROR);	
}


function onSms_put_terminal_infoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function getOptionInfo() {
	var emb = app.lookup("RTOM_eaOptionPage");
	var dmOptionInfo = app.lookup("TerminalOptionInfo");
	var dsHolidayList = app.lookup("TerminalHolidays");
	var dsAlarmOptList = app.lookup("AlarmOptionList");
	var dmUpdateFlag = app.lookup("TerminalUpdateFlagInfo");
	dmUpdateFlag.clear();

	if (emb.hasAppMethod("getPageInfo")) {
		var embInfo = emb.callAppMethod("getPageInfo");
		
		// DataMap 받아오는 경우
		if(emb.hasAppMethod("getTerminalPartOption")) {
			var data = emb.callAppMethod("getTerminalPartOption");
			if(!confirmData(data)) {
				return false;
			}
			switch (embInfo) {
				case "Network": // 정보입력X
				case "Info":  // 정보입력X
				default:
					data.copyToDataMap(dmOptionInfo);
					break;
			}
		} 
		
		// DataSet 받아오는 경우
		if (emb.hasAppMethod("getTerminalDataSet")) {
			var data = emb.callAppMethod("getTerminalDataSet");
			
			// ----------------------------------------  추후 필요 시 dataset도 유효성 체크 추가 
						
			var modifyFlag;
			if (emb.hasAppMethod("getModifyFlag")) {
				modifyFlag= emb.callAppMethod("getModifyFlag");
			}
			
			switch (embInfo) {
				case "Holiday":
					dsHolidayList.clear();
					data.copyToDataSet(dsHolidayList);
					if (modifyFlag > 0) {
						dmUpdateFlag.setValue("Holiday", 1);
					}
				case "Siren":
					dsAlarmOptList.clear();
					data.copyToDataSet(dsAlarmOptList);
					if (modifyFlag > 0) {
						dmUpdateFlag.setValue("Alarm", 1);
					}
				default :
					break;
			}
			
		}
	} else if(SvrSendFlag == 1){
		return true;
	} else {
		return false;
	}
	return true;
}

function SendJsonOptiontoTerminal() {
	
		if(!getOptionInfo()) {
			return false;
		}
		
		/*
		if (embInfo == "Holiday") {
			if (emb.hasAppMethod("getTerminalHolidayList")) {
				var holidayList = emb.callAppMethod("getTerminalHolidayList");
				if(confirmData(holidayList)) {
					dsHolidayList.clear();
					holidayList.copyToDataSet(dsHolidayList);
				} else {
					return false;
				}
			}
			
			if (emb.hasAppMethod("getModifyFlag")) {
				var modifyFlag= emb.callAppMethod("getModifyFlag");
				if (modifyFlag > 0) {
					dmUpdateFlag.setValue("Holiday", 1);
				}
			}
		} else if (embInfo == "Siren") {
			if (emb.hasAppMethod("getAlarmIOptList")) {
				var AlarmList = emb.callAppMethod("getAlarmIOptList");
				if(confirmData(AlarmList)) {
					dsAlarmOptList.clear();
					AlarmList.copyToDataSet(dsAlarmOptList);
				} else {
					return false;
				}
			}
			
			if (emb.hasAppMethod("getModifyFlag")) {
				var modifyFlag= emb.callAppMethod("getModifyFlag");
				if (modifyFlag > 0) {
					dmUpdateFlag.setValue("Alarm", 1);
				}
			}
		} else if (embInfo == "Network" || embInfo == "Info") {
			// 정보 업데이트 x
			
		} else {
			if (emb.hasAppMethod("getTerminalPartOption")) {
				var partOpt = emb.callAppMethod("getTerminalPartOption");
				if(confirmData(partOpt)) {
					partOpt.copyToDataSet(dmOptionInfo);
				} else {
					return false;
				}
			}
		}
		*/
		
		
		
	// 옵션 저장 서브미션
	var requestData = app.lookup("sms_put_terminal_option_info");
	var terminalID = app.lookup("TerminalInfo").getValue("ID");
	requestData.action = "/v1/terminals/" + terminalID + "/option/remote/setting";
	requestData.send();
	
	return true;
}

function GetJsonTerminalOptionInfo() {
	var requestData = app.lookup("sms_get_terminal_option_info");
	var terminalID = app.lookup("TerminalInfo").getValue("ID");
	requestData.action = "/v1/terminals/" + terminalID + "/option/remote/setting";
	comLib.showLoadMask("", dataManager.getString("Str_TerminalInfoGet"), "", 0);
	requestData.send();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_get_terminal_option_infoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var errorCode = app.lookup("Result").getValue("ResultCode");
	getOptionErrorCode = errorCode;
	var optionInfo = app.lookup("TerminalOptionInfo");
	var beforeInfo = app.lookup("BeforeTerminalOptionInfo");

	if (errorCode == COMERROR_NONE) {
		getOptionFlag = 1;
		optionInfo.copyToDataMap(beforeInfo);
		
		// 서버 Json 버전이 단말기보다 낮을 경우 
		if(optionInfo.getValue("AConfigVersion") > terminalJsonVersion) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ServerJsonVersionLower"));
		} 
	} else {
		getOptionFlag = 0;
	}
}


function onSms_get_terminal_option_infoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_ERROR);
}


function onSms_get_terminal_option_infoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT);	
}


function onSms_put_terminal_option_infoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var errorCode = app.lookup("Result").getValue("ResultCode");
	var rebootMessage = false;
	if (errorCode == COMERROR_NONE) {
		// 성공시 다시 옵션값 요청
		var alertMessage = dataManager.getString("Str_TerminalSaveSuccess");
		var terminalMessage = app.lookup("ResultMessage").getValue("Message"); 
		if(terminalMessage != "") {			 
			if(terminalMessage.indexOf("reboot") != -1) {
				alertMessage = alertMessage + "\n\n" + terminalMessage;
				rebootMessage = true;
			}  else {
				alertMessage = terminalMessage;
			}
		}
		
		dialogAlert(app, dataManager.getString("Str_Success"), alertMessage , function(/*cpr.controls.Dialog*/dialog){
			dialog.addEventListenerOnce("close", function(e) {
				// 재부팅중 바로 get 요청을 보내면 이후 메뉴 먹통되는 버그 방지 
				if(rebootFlag == 1 || rebootMessage) { 
					// 재부팅 했으므로 flag 초기화
					app.lookup("TerminalOptionInfo").setValue("Reboot_Flag", 0);
				} else {
					GetJsonTerminalOptionInfo();
				}
			});
		});

		var emb = app.lookup("RTOM_eaOptionPage");
		if (emb.hasAppMethod("setModifyFlag")) {	// 현재 Holiday, Alarm page 적용
			emb.callAppMethod("setModifyFlag", 0);
		}

	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(errorCode)));
	}
}

function onSms_put_terminal_option_infoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_ERROR);	
}

function onSms_put_terminal_option_infoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

// 단말기 삭제 버튼 클릭
function onTMVBA_btnTerminalDeleteClick(/* cpr.events.CMouseEvent */ e){
	dialogConfirm(app.getRootAppInstance(), "단말기 삭제", dataManager.getString("Str_DeleteConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				var terminalID = app.lookup("TerminalInfo").getValue("ID");
				var terminalInfo = app.getHostProperty("initValue");
				comLib.showLoadMask("", dataManager.getString("Str_TerminalDelete"), "", 0);
	
				var sms_deleteTerminal = app.lookup("sms_deleteTerminal");
				sms_deleteTerminal.action = "/v1/terminals/" + terminalID;
				sms_deleteTerminal.send();
			} else {
				return;
			}
		});
	});	
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_deleteTerminalSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var dmResult = app.lookup("Result");
	if (dmResult.getValue("ResultCode") == COMERROR_NONE) {
		var terminalInfo = app.getHostProperty("initValue");
		var terminalID = terminalInfo["TerminalID"];
		var commandEvent = new cpr.events.CUIEvent("execute-command", {
			content: {
				"target": DLG_TERMINAL_MANAGEMENT,
				"command": "Delete",
				"TerminalID": terminalID
			}
		});
		app.getHostAppInstance().dispatchEvent(commandEvent);
		app.close();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
	
}

// 단말 삭제 에러
function onSms_deleteTerminalSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_ERROR);
}

// 단말 삭제 타임아웃
function onSms_deleteTerminalSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


function UTCDataInit() {
	
	var Cmb_utcIndex = app.lookup("RTOF_UTC_cmb");
	var Item0 = new cpr.controls.Item(dataManager.getString("Str_All"), -43200); //날짜변경선 서쪽 UTC-12:00
	//var Item1 = new cpr.controls.Item(dataManager.getString("Str_All"), -39600);
	var Item1sd = new cpr.controls.Item(dataManager.getString("Str_All"), -39600111); //협정 세계시-11 UTC-11:00
	//var Item2 = new cpr.controls.Item(dataManager.getString("Str_All"), -36000);
	var Item2sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), -36000111); //알류샨 열도 UTC-10:00
	var Item2sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), -36000112); //하와이 UTC-10:00
	var Item2sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), -34200111); //마키저스 제도 UTC-10:30
	//var Item3 = new cpr.controls.Item(dataManager.getString("Str_All"), -32400);
	var Item3sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), -32400111); //알래스카 UTC-09:00
	var Item3sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), -32400112); //협정 세계시 UTC-09:00
	//var Item4 = new cpr.controls.Item(dataManager.getString("Str_All"), -28800);
	var Item4sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), -28800111); //바하 캘리포니아 UTC-08:00
	var Item4sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), -28800112); //태평양 표준시 (미국, 캐나다) UTC-08:00
	var Item4sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), -28800113); //협정 세계시 UTC-08:00
	//var Item5 = new cpr.controls.Item(dataManager.getString("Str_All"), -28800);
	//var Item6 = new cpr.controls.Item(dataManager.getString("Str_All"), -25200);
	var Item6sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), -25200111); //산지표준시 UTC-07:00
	var Item6sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), -25200112); //애리조나 UTC-07:00
	var Item6sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), -25200113); //유콘 UTC-07:00
	var Item6sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), -25200114); //치와와,라파스,마사틀란 UTC-07:00
	//var Item7 = new cpr.controls.Item(dataManager.getString("Str_All"), -25200);
	//var Item8 = new cpr.controls.Item(dataManager.getString("Str_All"), -25200);
	//var Item9 = new cpr.controls.Item(dataManager.getString("Str_All"), -21600);
	var Item9sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), -21600111); //과달라하라,멕시코시티,몬테레이 UTC-06:00
	var Item9sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), -21600112); //서스캐처원 UTC-06:00
	var Item9sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), -21600113); //이스터섬 UTC-06:00
	var Item9sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), -21600114); //중부 표준시 UTC-06:00
	var Item9sd5 = new cpr.controls.Item(dataManager.getString("Str_All"), -21600115); //중앙 아메리카 UTC-06:00
	//var Item10 = new cpr.controls.Item(dataManager.getString("Str_All"), -21600);
	//var Item11 = new cpr.controls.Item(dataManager.getString("Str_All"), -21600);
	//var Item12 = new cpr.controls.Item(dataManager.getString("Str_All"), -21600);
	//var Item13 = new cpr.controls.Item(dataManager.getString("Str_All"), -18000);
	var Item13sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), -18000111); //동부 표준시 UTC-05:00
	var Item13sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), -18000112); //보고타,리마,키토,리오브랑코 UTC-05:00
	var Item13sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), -18000113); //아이티 UTC-05:00
	var Item13sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), -18000114); //인디애나(동부)-05:00
	var Item13sd5 = new cpr.controls.Item(dataManager.getString("Str_All"), -18000115); //체투말 UTC-05:00
	var Item13sd6 = new cpr.controls.Item(dataManager.getString("Str_All"), -18000116); //터크스 케이커스 UTC-05:00
	var Item13sd7 = new cpr.controls.Item(dataManager.getString("Str_All"), -18000117); //하바나 UTC-05:00
	//var Item14 = new cpr.controls.Item(dataManager.getString("Str_All"), -18000);
	//var Item15 = new cpr.controls.Item(dataManager.getString("Str_All"), -18000);
	var Item16sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), -16200111); //대서양표준시 (캐나다) UTC-04:30
	var Item16sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), -14400112); //산티아고 UTC-04:00
	var Item16sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), -14400113); //아순시온 UTC-04:00
	var Item16sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), -14400114); //조지타운,라파스,마노스,산후안 UTC-04:00
	var Item16sd5 = new cpr.controls.Item(dataManager.getString("Str_All"), -14400115); //카라카스 UTC-04:00
	var Item16sd6 = new cpr.controls.Item(dataManager.getString("Str_All"), -14400116); //쿠이아바 UTC-04:00
	//var Item17 = new cpr.controls.Item(dataManager.getString("Str_All"), -14400);
	var Item17sd = new cpr.controls.Item(dataManager.getString("Str_All"), -12600111); //뉴펀들랜드 UTC-03:30
	//var Item18 = new cpr.controls.Item(dataManager.getString("Str_All"), -14400);
	//var Item19 = new cpr.controls.Item(dataManager.getString("Str_All"), -14400);
	//var Item20 = new cpr.controls.Item(dataManager.getString("Str_All"), -14400);
	//var Item21 = new cpr.controls.Item(dataManager.getString("Str_All"), -14400);
	//var Item22 = new cpr.controls.Item(dataManager.getString("Str_All"), -12600);
	var Item22sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800111); //그린란드 UTC-03:00
	var Item22sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800112); //몬테비디오 UTC-03:00
	var Item22sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800113); //부에노스아이레스 UTC-03:00
	var Item22sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800114); //브라질리아 UTC-03:00
	var Item22sd5 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800115); //살바도르 UTC-03:00
	var Item22sd6 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800116); //생피에르앤드미클롱 UTC-03:00
	var Item22sd7 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800117); //아라구아이나 UTC-03:00
	var Item22sd8 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800118); //카옌,포르탈레자 UTC-03:00
	var Item22sd9 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800119); //푼타아레나스 UTC-03:00
	//var Item23 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800); 
	var Item23sd = new cpr.controls.Item(dataManager.getString("Str_All"), -7200111); //협정 세계시-02
	//var Item24 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800);
	//var Item25 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800);
	//var Item26 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800);
	//var Item27 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800);
	var Item28sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), -3600111); //아조레스 UTC-01:00
	var Item28sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), -3600112); //카보베르데 제도 UTC-01:00
	//var Item29 = new cpr.controls.Item(dataManager.getString("Str_All"), -3600);
	//var Item30 = new cpr.controls.Item(dataManager.getString("Str_All"), -3600);
	//var Item31 = new cpr.controls.Item(dataManager.getString("Str_All"), 0);
	var Item29sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 111); //협정 세계시 UTC-00:00
	var Item29sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 112); //더블린,에든버러,리스본,런던 UTC-00:00
	var Item29sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), 113); //몬로비아,레이캬비크 UTC-00:00
	var Item29sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), 114); //상투메 UTC-00:00
	//var Item32 = new cpr.controls.Item(dataManager.getString("Str_All"), 0);
	//var Item33 = new cpr.controls.Item(dataManager.getString("Str_All"), 0);
	//var Item34 = new cpr.controls.Item(dataManager.getString("Str_All"), 0);
	//var Item35 = new cpr.controls.Item(dataManager.getString("Str_All"), 3600);
	var Item31sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 3600111); //카사블랑카 UTC+01:00
	var Item31sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 3600112); //베오그라드,브라티슬라바,부다페스트,류블랴나,프라하 UTC+01:00
	var Item31sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), 3600113); //브뤼셀,코펜하겐,마드리드,파리 UTC+01:00
	var Item31sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), 3600114); //사리예보,스코페,바르샤바,자그레브 UTC+01:00
	var Item31sd5 = new cpr.controls.Item(dataManager.getString("Str_All"), 3600115); //서중앙 아프리카 UTC+01:00
	var Item31sd6 = new cpr.controls.Item(dataManager.getString("Str_All"), 3600116); //암스테르담,베를린,베른,로마,스톡홀롬,빈 UTC+01:00
	//var Item36 = new cpr.controls.Item(dataManager.getString("Str_All"), 3600);
	//var Item37 = new cpr.controls.Item(dataManager.getString("Str_All"), 3600);
	//var Item38 = new cpr.controls.Item(dataManager.getString("Str_All"), 3600);
	//var Item39 = new cpr.controls.Item(dataManager.getString("Str_All"), 3600);
	//var Item40 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200);
	var Item35sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200111); //가자,헤브론 UTC+02:00
	var Item35sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200112); //다마스쿠스 UTC+02:00
	var Item35sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200113); //베이루트 UTC+02:00
	var Item35sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200114); //빈트후크 UTC+02:00
	var Item35sd5 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200115); //아테네,부카레스트 UTC+02:00
	var Item35sd6 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200116); //암만 UTC+02:00
	var Item35sd7 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200117); //예루살렘 UTC+02:00
	var Item35sd8 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200118); //주바 UTC+02:00
	var Item35sd9 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200119); //카이로 UTC+02:00
	var Item35sd10 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200120); //칼리닌그라드 UTC+02:00
	var Item35sd11 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200121); //키시네프 UTC+02:00
	var Item35sd12 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200122); //트리폴리 UTC+02:00
	var Item35sd13 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200123); //하라레,프리토리아 UTC+02:00
	var Item35sd14 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200124); //하르툼 UTC+02:00
	var Item35sd15 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200125); //헬싱키,키예프,리가,소피아,탈린,빌뉴스 UTC+02:00
	//var Item41 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200);
	//var Item42 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200);
	//var Item43 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200);
	//var Item44 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200);
	//var Item45 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200);
	//var Item46 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200);
	//var Item47 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200);
	//var Item48 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200);
	//var Item49 = new cpr.controls.Item(dataManager.getString("Str_All"), 10800);
	var Item40sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 10800111); //나이로비 UTC+03:00
	var Item40sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 10800112); //모스크바,상트페테르부르크 UTC+03:00
	var Item40sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), 10800113); //민스크 UTC+03:00
	var Item40sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), 10800114); //바그다드 UTC+03:00
	var Item40sd5 = new cpr.controls.Item(dataManager.getString("Str_All"), 10800115); //볼고그라드 UTC+03:00
	var Item40sd6 = new cpr.controls.Item(dataManager.getString("Str_All"), 10800116); //이스탄불 UTC+03:00
	var Item40sd7 = new cpr.controls.Item(dataManager.getString("Str_All"), 10800117); //쿠웨이트,리야드 UTC+03:00
	//var Item50 = new cpr.controls.Item(dataManager.getString("Str_All"), 10800);
	//var Item51 = new cpr.controls.Item(dataManager.getString("Str_All"), 10800);
	//var Item52 = new cpr.controls.Item(dataManager.getString("Str_All"), 10800);
	//var Item53 = new cpr.controls.Item(dataManager.getString("Str_All"), 12600);
	var Item49sd = new cpr.controls.Item(dataManager.getString("Str_All"), 12600111); //테헤란 UTC+03:30
	//var Item54 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400);
	var Item53sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400111); //바쿠 UTC+04:00
	var Item53sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400112); //사라토브 UTC+04:00
	var Item53sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400113); //아랍:아부다비,무스카트 UTC+04:00
	var Item53sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400114); //아스트라한,울랴노브스크 UTC+04:00
	var Item53sd5 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400115); //예레반 UTC+04:00
	var Item53sd6 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400116); //이젭스크,사마라 UTC+04:00
	var Item53sd7 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400117); //트빌리시 UTC+04:00
	var Item53sd8 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400118); //포트루이스 UTC+04:00
	//var Item55 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400);
	//var Item56 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400);
	//var Item57 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400);
	//var Item58 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400);
	var Item54sd = new cpr.controls.Item(dataManager.getString("Str_All"), 16200111); //카불 UTC+04:30
	//var Item60 = new cpr.controls.Item(dataManager.getString("Str_All"), 18000);
	var Item59sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 18000111); //아슈하바트,타슈켄트 UTC+05:00
	var Item59sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 18000112); //예카테린부르크 UTC+05:00
	var Item59sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), 18000113); //이슬라마바드,카리치 UTC+05:00
	var Item59sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), 18000114); //키질로르다 UTC+05:00
	//var Item61 = new cpr.controls.Item(dataManager.getString("Str_All"), 18000);
	//var Item62 = new cpr.controls.Item(dataManager.getString("Str_All"), 18000);
	//var Item63 = new cpr.controls.Item(dataManager.getString("Str_All"), 19800);
	var Item60sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 19800111); //스리자야와르데네푸라+05:30
	var Item60sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 19800112); //첸나이,콜카타,뭄바이,뉴델리 UTC+05:30
	//var Item64 = new cpr.controls.Item(dataManager.getString("Str_All"), 19800);
	var Item63sd = new cpr.controls.Item(dataManager.getString("Str_All"), 20700111); //카트만두 UTC+05:45
	var Item65sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 21600111); //다카 UTC+06:00
	var Item65sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 21600112); //아스타나 UTC+06:00
	var Item65sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), 21600113); //옴스크 UTC+06:00
	//var Item67 = new cpr.controls.Item(dataManager.getString("Str_All"), 21600); 
	var Item66 = new cpr.controls.Item(dataManager.getString("Str_All"), 23400111); //양곤 UTC+06:30
	var Item68sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 25200111); //노보시비르스크 UTC+07:00
	var Item68sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 25200112); //바르나울,고르노알타이스크 UTC+07:00
	var Item68sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), 25200113); //방콕,하노이,자카르타 UTC+07:00
	var Item68sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), 25200114); //크라스노야르스크 UTC+07:00
	var Item68sd5 = new cpr.controls.Item(dataManager.getString("Str_All"), 25200115); //톰스크 UTC+07:00
	var Item68sd6 = new cpr.controls.Item(dataManager.getString("Str_All"), 25200116); //호브드 UTC+07:00
	//var Item70 = new cpr.controls.Item(dataManager.getString("Str_All"), 25200);
	var Item69sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 28800111); //베이징,충칭,홍콩 특별 행정구,우루무치 UTC+08:00
	var Item69sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 28800112); //울란바토르 UTC+08:00
	var Item69sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), 28800113); //이르쿠츠크 UTC+08:00
	var Item69sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), 28800114); //콸라룸푸르,싱가포르 UTC+08:00
	var Item69sd5 = new cpr.controls.Item(dataManager.getString("Str_All"), 28800115); //타이베이 UTC+08:00
	var Item69sd6 = new cpr.controls.Item(dataManager.getString("Str_All"), 28800116); //퍼스 UTC+08:00
	var Item71sd = new cpr.controls.Item(dataManager.getString("Str_All"), 31500111); //유클라 UTC+08:45
	//var Item72 = new cpr.controls.Item(dataManager.getString("Str_All"), 28800);
	//var Item73 = new cpr.controls.Item(dataManager.getString("Str_All"), 28800);
	//var Item74 = new cpr.controls.Item(dataManager.getString("Str_All"), 28800);
	//var Item75 = new cpr.controls.Item(dataManager.getString("Str_All"), 28800);
	//var Item76 = new cpr.controls.Item(dataManager.getString("Str_All"), 28800);
	var Item77sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 32400111); //서울 UTC+09:00
	var Item77sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 32400112); //야쿠츠크 UTC+09:00
	var Item77sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), 32400113); //오사카,삿포로,도쿄 UTC+09:00
	var Item77sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), 32400114); //치타 UTC+09:00
	var Item77sd5 = new cpr.controls.Item(dataManager.getString("Str_All"), 32400115); //평양 UTC+09:00
	//var Item78 = new cpr.controls.Item(dataManager.getString("Str_All"), 32400);
	//var Item79 = new cpr.controls.Item(dataManager.getString("Str_All"), 32400);
	var Item80sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 34200111); //다윈 UTC+09:30
	var Item80sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 34200112); //애들레이드 UTC+09:30
	//var Item81 = new cpr.controls.Item(dataManager.getString("Str_All"), 34200);
	//var Item82 = new cpr.controls.Item(dataManager.getString("Str_All"), 36000);
	var Item82sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 36000111); //괌,포트모르즈비 UTC+10:00
	var Item82sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 36000112); //브리즈번 UTC+10:00
	var Item82sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), 36000113); //블라디보스토크 UTC+10:00
	var Item82sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), 36000114); //캔버라,멜버른,시드니 UTC+10:00
	var Item82sd5 = new cpr.controls.Item(dataManager.getString("Str_All"), 36000115); //호바트 UTC+10:00
	//var Item83 = new cpr.controls.Item(dataManager.getString("Str_All"), 36000);
	//var Item84 = new cpr.controls.Item(dataManager.getString("Str_All"), 36000);
	//var Item85 = new cpr.controls.Item(dataManager.getString("Str_All"), 36000);
	//var Item86 = new cpr.controls.Item(dataManager.getString("Str_All"), 36000);
	//var Item87 = new cpr.controls.Item(dataManager.getString("Str_All"), 39600);
	var Item87sd = new cpr.controls.Item(dataManager.getString("Str_All"), 37800111); //로드하우 섬 UTC+10:30
	//var Item88 = new cpr.controls.Item(dataManager.getString("Str_All"), 43200);
	var Item88sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 39600111); //노퍽 섬 UTC+11:00
	var Item88sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 39600112); //마가단 UTC+11:00
	var Item88sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), 39600113); //부건빌 섬 UTC+11:00
	var Item88sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), 39600114); //사할린 UTC+11:00
	var Item88sd5 = new cpr.controls.Item(dataManager.getString("Str_All"), 39600115); //솔로몬제도,뉴칼레도니아 UTC+11:00
	var Item88sd6 = new cpr.controls.Item(dataManager.getString("Str_All"), 39600116); //초쿠르다흐 UTC+11:00
	//var Item89 = new cpr.controls.Item(dataManager.getString("Str_All"), 43200);
	//var Item90 = new cpr.controls.Item(dataManager.getString("Str_All"), 43200);
	var Item91sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 43200111); //아나다리,페트로파블로프스크-캄차스키 UTC+12:00
	var Item91sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 43200112); //오클랜드,웰링턴 UTC+12:00
	var Item91sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), 43200113); //피지 UTC+12:00
	var Item91sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), 43200114); //협정 세계시 +12
	var Item92sd = new cpr.controls.Item(dataManager.getString("Str_All"), 49500111); //채텀섬 UTC+12:45
	var Item93sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 46800111); //누쿠알로파 UTC+13:00
	var Item93sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 46800112); //사모아 UTC+13:00
	var Item93sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), 46800113); //협정 세계시 +13 
	var Item94sd = new cpr.controls.Item(dataManager.getString("Str_All"), 50400111); //키리티마티 섬 UTC+14:00 
	
	Item0.bind("label").toLanguage("Str_InternationalDateLineWest"); // -12
	//Item1.bind("label").toLanguage("Str_MidwayIsland"); // -11
	Item1sd.bind("label").toLanguage("Str_GMT+11"); // -11
	//Item2.bind("label").toLanguage("Str_Hawaii"); //-10
	Item2sd1.bind("label").toLanguage("Str_AleutianIslands"); //-10
	Item2sd2.bind("label").toLanguage("Str_HawaiiSD"); //-10
	Item2sd3.bind("label").toLanguage("Str_Marquesas"); //-10:30
	//Item3.bind("label").toLanguage("Str_Alaska"); // -9
	Item3sd1.bind("label").toLanguage("Str_AlaskaSD"); // -9
	Item3sd2.bind("label").toLanguage("Str_GMT+9"); // -9
	//Item4.bind("label").toLanguage("Str_PacificTime(US&Canada)"); // -8
	Item4sd1.bind("label").toLanguage("Str_BajaCaliforniaSD"); // -8
	Item4sd2.bind("label").toLanguage("Str_PacificTime(US&Canada)SD1"); // -8
	Item4sd3.bind("label").toLanguage("Str_GMT+8"); // -8
	//Item6.bind("label").toLanguage("Str_MountainTime(US&Canada)"); // -7
	Item6sd1.bind("label").toLanguage("Str_MountainTime(US&Canada)SD1"); // -7
	Item6sd2.bind("label").toLanguage("Str_Arizona"); // -7
	Item6sd3.bind("label").toLanguage("Str_Yukon"); // -7
	Item6sd4.bind("label").toLanguage("Str_Chihuahua,La_Paz,Mazatlan"); // -7
	//Item9.bind("label").toLanguage("Str_CentralTime(US&Canada)"); //-6
	Item9sd1.bind("label").toLanguage("Str_Guadalajara,MexicoCity,Monterrey"); //-6
	Item9sd2.bind("label").toLanguage("Str_Saskatchewan"); //-6
	Item9sd3.bind("label").toLanguage("Str_EsaterIsland"); //-6
	Item9sd4.bind("label").toLanguage("Str_CentralTime"); //-6
	Item9sd5.bind("label").toLanguage("Str_CentralAmerica"); //-6
	//Item13.bind("label").toLanguage("Str_EasternTime(US&Canada)"); //-5
	Item13sd1.bind("label").toLanguage("Str_EasternTime"); //-5
	Item13sd2.bind("label").toLanguage("Str_Bogota,Lima,Quito,RioBranco"); //-5
	Item13sd3.bind("label").toLanguage("Str_Haiti"); //-5
	Item13sd4.bind("label").toLanguage("Str_Indiana"); //-5
	Item13sd5.bind("label").toLanguage("Str_Chetumal"); //-5
	Item13sd6.bind("label").toLanguage("Str_TurksAndCaicos"); //-5
	Item13sd7.bind("label").toLanguage("Str_Havana"); //-5
	Item16sd1.bind("label").toLanguage("Str_AtlanticTime"); // -4:30
	Item16sd2.bind("label").toLanguage("Str_Santiago"); // -4
	Item16sd3.bind("label").toLanguage("Str_Asuncion"); // -4
	Item16sd4.bind("label").toLanguage("Str_GeorgeTown,LaPaz,Manos,SanJuan"); // -4
	Item16sd5.bind("label").toLanguage("Str_Caracas"); // -4
	Item16sd6.bind("label").toLanguage("Str_Cuiabah"); // -4
	//Item17.bind("label").toLanguage("Str_AtlanticTime(Canada)"); // -4
	Item17sd.bind("label").toLanguage("Str_NewfoundlandSD"); // -3:30
	//Item22.bind("label").toLanguage("Str_Newfoundland"); //-3:30
	Item22sd1.bind("label").toLanguage("Str_Greenland"); //-3
	Item22sd2.bind("label").toLanguage("Str_Montevideo"); //-3
	Item22sd3.bind("label").toLanguage("Str_BuenosAires"); //-3
	Item22sd4.bind("label").toLanguage("Str_Brasilia"); //-3
	Item22sd5.bind("label").toLanguage("Str_Salvador"); //-3
	Item22sd6.bind("label").toLanguage("Str_SaintPierreAndMiquelon"); //-3
	Item22sd7.bind("label").toLanguage("Str_Araguaina"); //-3
	Item22sd8.bind("label").toLanguage("Str_cayenne"); //-3
	Item22sd9.bind("label").toLanguage("Str_PuntaArenas"); //-3
	//Item23.bind("label").toLanguage("Str_Brasilia"); // -3
	Item23sd.bind("label").toLanguage("Str_GMT+02"); // -2
	Item28sd1.bind("label").toLanguage("Str_Azores"); //-1
	Item28sd2.bind("label").toLanguage("Str_CapeVerde"); //-1
	Item29sd1.bind("label").toLanguage("Str_UTC"); //0
	Item29sd2.bind("label").toLanguage("Str_Dublin"); //0
	Item29sd3.bind("label").toLanguage("Str_Monrovia"); //0
	Item29sd4.bind("label").toLanguage("Str_SaoTome"); //0
	//Item31.bind("label").toLanguage("Str_Casablanca"); //0
	Item31sd1.bind("label").toLanguage("Str_Casablanca"); //1
	Item31sd2.bind("label").toLanguage("Str_Belgrade"); //1
	Item31sd3.bind("label").toLanguage("Str_Brussels"); //1
	Item31sd4.bind("label").toLanguage("Str_Sarajevo"); //1
	Item31sd5.bind("label").toLanguage("Str_WestCentralAfrica"); //1
	Item31sd6.bind("label").toLanguage("Str_Amsterdam"); //1
	//Item35.bind("label").toLanguage("Str_Amsterdam"); //1
	Item35sd1.bind("label").toLanguage("Str_Hebron"); //2
	Item35sd2.bind("label").toLanguage("Str_Damascus"); //2
	Item35sd3.bind("label").toLanguage("Str_Beirut"); //2
	Item35sd4.bind("label").toLanguage("Str_windhoek"); //2
	Item35sd5.bind("label").toLanguage("Str_Athens"); //2
	Item35sd6.bind("label").toLanguage("Str_Amman"); //2
	Item35sd7.bind("label").toLanguage("Str_Jerusalem"); //2
	Item35sd8.bind("label").toLanguage("Str_Juba"); //2
	Item35sd9.bind("label").toLanguage("Str_Cairo"); //2
	Item35sd10.bind("label").toLanguage("Str_Kaliningrad"); //2
	Item35sd11.bind("label").toLanguage("Str_Chisinau"); //2
	Item35sd12.bind("label").toLanguage("Str_Tripoli"); //2
	Item35sd13.bind("label").toLanguage("Str_Harare"); //2
	Item35sd14.bind("label").toLanguage("Str_Khartoum"); //2
	Item35sd15.bind("label").toLanguage("Str_Helsinki"); //2
	//Item40.bind("label").toLanguage("Str_Amman"); //2
	Item40sd1.bind("label").toLanguage("Str_Nairobi"); //3
	Item40sd2.bind("label").toLanguage("Str_Moscow"); //3
	Item40sd3.bind("label").toLanguage("Str_Minsk"); //3
	Item40sd4.bind("label").toLanguage("Str_Baghdad"); //3
	Item40sd5.bind("label").toLanguage("Str_Volgograd"); //3
	Item40sd6.bind("label").toLanguage("Str_Istanbul"); //3
	Item40sd7.bind("label").toLanguage("Str_Kuwait"); //3
	//Item49.bind("label").toLanguage("Str_Baghdad"); //3
	Item49sd.bind("label").toLanguage("Str_TehranSD"); //3:30
	//Item53.bind("label").toLanguage("Str_Tehran"); //3:30
	Item53sd1.bind("label").toLanguage("Str_Baku"); //4
	Item53sd2.bind("label").toLanguage("Str_Saratov"); //4
	Item53sd3.bind("label").toLanguage("Str_Muscat"); //4
	Item53sd4.bind("label").toLanguage("Str_Astrakhan"); //4
	Item53sd5.bind("label").toLanguage("Str_Yerevan"); //4
	Item53sd6.bind("label").toLanguage("Str_Samara"); //4
	Item53sd7.bind("label").toLanguage("Str_Tbilisi"); //4
	Item53sd8.bind("label").toLanguage("Str_PortLouis"); //4
	//Item54.bind("label").toLanguage("Str_AbuDhabi"); //4
	Item54sd.bind("label").toLanguage("Str_Kabul"); //4:30
	Item59sd1.bind("label").toLanguage("Str_Tashkent"); //5
	Item59sd2.bind("label").toLanguage("Str_Yekaterinburg"); //5
	Item59sd3.bind("label").toLanguage("Str_Karachi"); //5
	Item59sd4.bind("label").toLanguage("Str_Qyzylorda"); //5
	//Item60.bind("label").toLanguage("Str_Ekaterinburg"); //5
	Item60sd1.bind("label").toLanguage("Str_SriJaya"); //5:30
	Item60sd2.bind("label").toLanguage("Str_Chennai"); //5:30
	//Item63.bind("label").toLanguage("Str_Chennai"); //5:30
	Item63sd.bind("label").toLanguage("Str_Kathmandu"); //5:45
	Item65sd1.bind("label").toLanguage("Str_Dhaka"); //6
	Item65sd2.bind("label").toLanguage("Str_Astana"); //6
	Item65sd3.bind("label").toLanguage("Str_Omsk"); //6
	Item66.bind("label").toLanguage("Str_Yangon"); //6:30
	Item68sd1.bind("label").toLanguage("Str_Novosibirsk"); //7
	Item68sd2.bind("label").toLanguage("Str_Barnaul"); //7
	Item68sd3.bind("label").toLanguage("Str_Bangkok"); //7
	Item68sd4.bind("label").toLanguage("Str_Krasnoyarsk"); //7
	Item68sd5.bind("label").toLanguage("Str_Tomsk"); //7
	Item68sd6.bind("label").toLanguage("Str_Hovd"); //7
	Item69sd1.bind("label").toLanguage("Str_Shanghai"); //8
	Item69sd2.bind("label").toLanguage("Str_Ulaanbaatar"); //8
	Item69sd3.bind("label").toLanguage("Str_Irkutsk"); //8
	Item69sd4.bind("label").toLanguage("Str_Singapore"); //8
	Item69sd5.bind("label").toLanguage("Str_Taipei"); //8
	Item69sd6.bind("label").toLanguage("Str_Perth"); //8
	Item71sd.bind("label").toLanguage("Str_Eucla"); //8:45
	Item77sd1.bind("label").toLanguage("Str_Seoul"); //9
	Item77sd2.bind("label").toLanguage("Str_Yakutsk"); //9 
	Item77sd3.bind("label").toLanguage("Str_Tokyo"); //9 
	Item77sd4.bind("label").toLanguage("Str_Chita"); //9 
	Item77sd5.bind("label").toLanguage("Str_Pyongyang"); //9  
	Item80sd1.bind("label").toLanguage("Str_Darwin"); //9:30
	Item80sd2.bind("label").toLanguage("Str_Adelaide"); //9:30
	//Item82.bind("label").toLanguage("Str_Brisbane"); //10 
	Item82sd1.bind("label").toLanguage("Str_Guam"); //10
	Item82sd2.bind("label").toLanguage("Str_Brisbane"); //10
	Item82sd3.bind("label").toLanguage("Str_Vladivostok"); //10
	Item82sd4.bind("label").toLanguage("Str_Canberra"); //10
	Item82sd5.bind("label").toLanguage("Str_Hobart"); //10 
	//Item87.bind("label").toLanguage("Str_Magadan"); //11
	Item87sd.bind("label").toLanguage("Str_LordHowe"); //10:30
	//Item88.bind("label").toLanguage("Str_Auckland"); //12
	Item88sd1.bind("label").toLanguage("Str_Norfolk"); //11
	Item88sd2.bind("label").toLanguage("Str_Magadan"); //11
	Item88sd3.bind("label").toLanguage("Str_Bougainville"); //11
	Item88sd4.bind("label").toLanguage("Str_Sakhalin"); //11
	Item88sd5.bind("label").toLanguage("Str_Guadalcanal"); //11
	Item88sd6.bind("label").toLanguage("Str_Chokurdakh"); //11
	Item91sd1.bind("label").toLanguage("Str_Anadyr"); //12
	Item91sd2.bind("label").toLanguage("Str_Auckland"); //12
	Item91sd3.bind("label").toLanguage("Str_Fiji"); //12
	Item91sd4.bind("label").toLanguage("Str_GMT-12"); //12
	Item92sd.bind("label").toLanguage("Str_Chatham"); //12:45
	Item93sd1.bind("label").toLanguage("Str_Tongatapu"); //13
	Item93sd2.bind("label").toLanguage("Str_Apia"); //13
	Item93sd3.bind("label").toLanguage("Str_GMT-13"); //13
	Item94sd.bind("label").toLanguage("Str_Kiritimati"); //14
	Cmb_utcIndex.addItem(Item0);
	//Cmb_utcIndex.addItem(Item1);
	Cmb_utcIndex.addItem(Item1sd);
	//Cmb_utcIndex.addItem(Item2);
	Cmb_utcIndex.addItem(Item2sd1);
	Cmb_utcIndex.addItem(Item2sd2);
	Cmb_utcIndex.addItem(Item2sd3);
	//Cmb_utcIndex.addItem(Item3);
	Cmb_utcIndex.addItem(Item3sd1);
	Cmb_utcIndex.addItem(Item3sd2);
	//Cmb_utcIndex.addItem(Item4);
	Cmb_utcIndex.addItem(Item4sd1);
	Cmb_utcIndex.addItem(Item4sd2);
	Cmb_utcIndex.addItem(Item4sd3);
	//Cmb_utcIndex.addItem(Item6);
	Cmb_utcIndex.addItem(Item6sd1);
	Cmb_utcIndex.addItem(Item6sd2);
	Cmb_utcIndex.addItem(Item6sd3);
	Cmb_utcIndex.addItem(Item6sd4);
	//Cmb_utcIndex.addItem(Item9);
	Cmb_utcIndex.addItem(Item9sd1);
	Cmb_utcIndex.addItem(Item9sd2);
	Cmb_utcIndex.addItem(Item9sd3);
	Cmb_utcIndex.addItem(Item9sd4);
	Cmb_utcIndex.addItem(Item9sd5);
	//Cmb_utcIndex.addItem(Item13);
	Cmb_utcIndex.addItem(Item13sd1);
	Cmb_utcIndex.addItem(Item13sd2);
	Cmb_utcIndex.addItem(Item13sd3);
	Cmb_utcIndex.addItem(Item13sd4);
	Cmb_utcIndex.addItem(Item13sd5);
	Cmb_utcIndex.addItem(Item13sd6);
	Cmb_utcIndex.addItem(Item13sd7);
	Cmb_utcIndex.addItem(Item16sd1);
	Cmb_utcIndex.addItem(Item16sd2);
	Cmb_utcIndex.addItem(Item16sd3);
	Cmb_utcIndex.addItem(Item16sd4);
	Cmb_utcIndex.addItem(Item16sd5);
	Cmb_utcIndex.addItem(Item16sd6);
	//Cmb_utcIndex.addItem(Item17);
	Cmb_utcIndex.addItem(Item17sd);
	//Cmb_utcIndex.addItem(Item22);
	Cmb_utcIndex.addItem(Item22sd1);
	Cmb_utcIndex.addItem(Item22sd2);
	Cmb_utcIndex.addItem(Item22sd3);
	Cmb_utcIndex.addItem(Item22sd4);
	Cmb_utcIndex.addItem(Item22sd5);
	Cmb_utcIndex.addItem(Item22sd6);
	Cmb_utcIndex.addItem(Item22sd7);
	Cmb_utcIndex.addItem(Item22sd8);
	Cmb_utcIndex.addItem(Item22sd9);
	//Cmb_utcIndex.addItem(Item23);
	Cmb_utcIndex.addItem(Item23sd);
	Cmb_utcIndex.addItem(Item28sd1);
	Cmb_utcIndex.addItem(Item28sd2);
	Cmb_utcIndex.addItem(Item29sd1);
	Cmb_utcIndex.addItem(Item29sd2);
	Cmb_utcIndex.addItem(Item29sd3);
	Cmb_utcIndex.addItem(Item29sd4);
	//Cmb_utcIndex.addItem(Item31);
	Cmb_utcIndex.addItem(Item31sd1);
	Cmb_utcIndex.addItem(Item31sd2);
	Cmb_utcIndex.addItem(Item31sd3);
	Cmb_utcIndex.addItem(Item31sd4);
	Cmb_utcIndex.addItem(Item31sd5);
	Cmb_utcIndex.addItem(Item31sd6);
	//Cmb_utcIndex.addItem(Item35);
	Cmb_utcIndex.addItem(Item35sd1);
	Cmb_utcIndex.addItem(Item35sd2);
	Cmb_utcIndex.addItem(Item35sd3);
	Cmb_utcIndex.addItem(Item35sd4);
	Cmb_utcIndex.addItem(Item35sd5);
	Cmb_utcIndex.addItem(Item35sd6);
	Cmb_utcIndex.addItem(Item35sd7);
	Cmb_utcIndex.addItem(Item35sd8);
	Cmb_utcIndex.addItem(Item35sd9);
	Cmb_utcIndex.addItem(Item35sd10);
	Cmb_utcIndex.addItem(Item35sd11);
	Cmb_utcIndex.addItem(Item35sd12);
	Cmb_utcIndex.addItem(Item35sd13);
	Cmb_utcIndex.addItem(Item35sd14);
	Cmb_utcIndex.addItem(Item35sd15);
	//Cmb_utcIndex.addItem(Item40);
	Cmb_utcIndex.addItem(Item40sd1);
	Cmb_utcIndex.addItem(Item40sd2);
	Cmb_utcIndex.addItem(Item40sd3);
	Cmb_utcIndex.addItem(Item40sd4);
	Cmb_utcIndex.addItem(Item40sd5);
	Cmb_utcIndex.addItem(Item40sd6);
	Cmb_utcIndex.addItem(Item40sd7);
	//Cmb_utcIndex.addItem(Item49);
	Cmb_utcIndex.addItem(Item49sd);
	//Cmb_utcIndex.addItem(Item53);
	Cmb_utcIndex.addItem(Item53sd1);
	Cmb_utcIndex.addItem(Item53sd2);
	Cmb_utcIndex.addItem(Item53sd3);
	Cmb_utcIndex.addItem(Item53sd4);
	Cmb_utcIndex.addItem(Item53sd5);
	Cmb_utcIndex.addItem(Item53sd6);
	Cmb_utcIndex.addItem(Item53sd7);
	Cmb_utcIndex.addItem(Item53sd8);
	//Cmb_utcIndex.addItem(Item54);
	Cmb_utcIndex.addItem(Item54sd);
	Cmb_utcIndex.addItem(Item59sd1);
	Cmb_utcIndex.addItem(Item59sd2);
	Cmb_utcIndex.addItem(Item59sd3);
	Cmb_utcIndex.addItem(Item59sd4);
	//Cmb_utcIndex.addItem(Item60);
	Cmb_utcIndex.addItem(Item60sd1);
	Cmb_utcIndex.addItem(Item60sd2);
	//Cmb_utcIndex.addItem(Item63);
	Cmb_utcIndex.addItem(Item63sd);
	Cmb_utcIndex.addItem(Item65sd1);
	Cmb_utcIndex.addItem(Item65sd2);
	Cmb_utcIndex.addItem(Item65sd3);
	Cmb_utcIndex.addItem(Item66);
	Cmb_utcIndex.addItem(Item68sd1);
	Cmb_utcIndex.addItem(Item68sd2);
	Cmb_utcIndex.addItem(Item68sd3);
	Cmb_utcIndex.addItem(Item68sd4);
	Cmb_utcIndex.addItem(Item68sd5);
	Cmb_utcIndex.addItem(Item68sd6);
	Cmb_utcIndex.addItem(Item69sd1);
	Cmb_utcIndex.addItem(Item69sd2);
	Cmb_utcIndex.addItem(Item69sd3);
	Cmb_utcIndex.addItem(Item69sd4);
	Cmb_utcIndex.addItem(Item69sd5);
	Cmb_utcIndex.addItem(Item69sd6);
	Cmb_utcIndex.addItem(Item71sd);
	Cmb_utcIndex.addItem(Item77sd1);
	Cmb_utcIndex.addItem(Item77sd2);
	Cmb_utcIndex.addItem(Item77sd3);
	Cmb_utcIndex.addItem(Item77sd4);
	Cmb_utcIndex.addItem(Item77sd5);
	Cmb_utcIndex.addItem(Item80sd1);
	Cmb_utcIndex.addItem(Item80sd2);
	//Cmb_utcIndex.addItem(Item82);
	Cmb_utcIndex.addItem(Item82sd1);
	Cmb_utcIndex.addItem(Item82sd2);
	Cmb_utcIndex.addItem(Item82sd3);
	Cmb_utcIndex.addItem(Item82sd4);
	Cmb_utcIndex.addItem(Item82sd5);
	//Cmb_utcIndex.addItem(Item87);
	Cmb_utcIndex.addItem(Item87sd);
	//Cmb_utcIndex.addItem(Item88);
	Cmb_utcIndex.addItem(Item88sd1);
	Cmb_utcIndex.addItem(Item88sd2);
	Cmb_utcIndex.addItem(Item88sd3);
	Cmb_utcIndex.addItem(Item88sd4);
	Cmb_utcIndex.addItem(Item88sd5);
	Cmb_utcIndex.addItem(Item88sd6);
	Cmb_utcIndex.addItem(Item91sd1);
	Cmb_utcIndex.addItem(Item91sd2);
	Cmb_utcIndex.addItem(Item91sd3);
	Cmb_utcIndex.addItem(Item91sd4);
	Cmb_utcIndex.addItem(Item92sd);
	Cmb_utcIndex.addItem(Item93sd1);
	Cmb_utcIndex.addItem(Item93sd2);
	Cmb_utcIndex.addItem(Item93sd3);
	Cmb_utcIndex.addItem(Item94sd);
	Cmb_utcIndex.redraw();
	
}

//<-------------------------------------------------------------------------------

exports.getTerminalAllOption = function() {
	var TerminalAllOptionData = app.lookup("TerminalOptionInfo");
	return TerminalAllOptionData;
}

exports.getTerminalID = function() {
	return app.lookup("TerminalInfo").getValue("ID");
}

exports.getTerminalHolidays = function() {
	var TerminalHolidays = app.lookup("TerminalHolidays");
	return TerminalHolidays;
}

exports.getTimezoneHolidays = function() {
	var TimezoneHolidays = app.lookup("TimezoneHolidays");
	return TimezoneHolidays;
}

exports.getAlarmOptionList = function() {
	var AlarmOptionList = app.lookup("AlarmOptionList");
	return AlarmOptionList;
}

exports.invalidOptionByTerminalType = function(optID, value) {	// 컨트롤 아이디, value
	var termianlType = app.lookup("TerminalInfo").getValue("Type");
	
	// 단말기별 유효성 검사는 여기에 추가
	if (optID == "RTOPS_FP_FPTemplateForm") {	// 지문 템플릿 포맷
		if (termianlType == 36)	{	// Pro Lite
			// Union 포맷만 지원
			if (value == 1 || value == 2) {
				return false;
			}
		}
	}
	return true;
}

//-------------------------------------------------------------------------------->


function onImageClick(/* cpr.events.CMouseEvent */ e){	
	var menu_id = DLG_TERMINAL_REMOTE_INFO;	 // 단말 원격 설정 메뉴 id
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

function confirmData(/* cpr.data.DataMap */ data) {
	var confirmFlag = true;
	var alertMsg = "";
	
	// 문 열림 경고 시간은 0, 5~60만 입력 가능
	if(data.isExistColumn("Input_WarnDoorOpen")){
		var doorOpenValue = data.getValue("Input_WarnDoorOpen");
		if(doorOpenValue>1 && doorOpenValue < 5) {
			confirmFlag = false;
			alertMsg = "Str_DoorOpenTimeSettingWarning";
		}
	}
	
	
	
	if(!confirmFlag) {
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString(alertMsg));
		return false;
	}
	
	return true;
}


/*
 * 체크 박스에서 value-change 이벤트 발생 시 호출.
 * CheckBox의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onRTOF_cbxCoreValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.CheckBox
	 */
	var rTOF_cbxCore = e.control;
	SvrSendFlag = 1;
	if (app.lookup("RTOF_cbxCore").checked == true){
		app.lookup("TerminalInfo").setValue("CoreFlag", 1);	
	} else {
		app.lookup("TerminalInfo").setValue("CoreFlag", 0);
	}
}

// 시스템 설정 범위
exports.getSysRange = function() {
	// 시스템 설정 - 시스템
	var Sys_Authentication_Range = app.lookup("Sys_Authentication_Range");
	
	// 시스템 설정 - 얼굴 인식
	var FC_Distance_Range = app.lookup("FC_Distance_Range");
	var FC_MaskDetection_Range = app.lookup("FC_MaskDetection_Range");
	var FC_AEFLicker_Range = app.lookup("FC_AEFLicker_Range");
	var FC_AEMode_Range = app.lookup("FC_AEMode_Range");
	var FC_PopupType_Range = app.lookup("FC_PopupType_Range");
	
	// 시스템 설정 - 인증
	var Auth_AuthType_Range = app.lookup("Auth_AuthType_Range");
	
	var range = {
		"Sys_Authentication_Range" : Sys_Authentication_Range,
		"FC_Distance_Range" : FC_Distance_Range,
		"FC_MaskDetection_Range" : FC_MaskDetection_Range,
		"FC_AEFLicker_Range" : FC_AEFLicker_Range,
		"FC_AEMode_Range" : FC_AEMode_Range,
		"FC_PopupType_Range" : FC_PopupType_Range,
		"Auth_AuthType_Range" : Auth_AuthType_Range
	};
	return range;
}

// 단말기 설정 범위
exports.getTerminalOptionRange = function() {
	// 단말 설정 - 단말기 옵션
	var Opt_BLErssi_Range = app.lookup("Opt_BLErssi_Range");
	var Opt_BLEtxpower_Range = app.lookup("Opt_BLEtxpower_Range");
	
	// 단말 설정 - Input 설정
	var Input_M0_Range = app.lookup("Input_M0_Range");
	var Input_M1_Range = app.lookup("Input_M1_Range");
	var Input_M2_Range = app.lookup("Input_M2_Range");
	var Input_IO_Range = app.lookup("Input_IO_Range");
	
	// 단말 설정 - Lock 설정
	var Lock_L1Opt_Range = app.lookup("Lock_L1Opt_Range");
	var Lock_L2Opt_Range = app.lookup("Lock_L2Opt_Range");
	
	// 단말 설정 - ExtDev 설정
	var ExtDev_RS232_Range = app.lookup("ExtDev_RS232_Range");
	var ExtDev_RS485_Range = app.lookup("ExtDev_RS485_Range");
	var ExtDev_SlaveReader_Range = app.lookup("ExtDev_SlaveReader_Range");
	
	// 단말 설정 - ETC(열화상) 설정
	var Thermal_Temperature_Range = app.lookup("Thermal_Temperature_Range");
	var range = {
		"Opt_BLErssi_Range" : Opt_BLErssi_Range,
		"Opt_BLEtxpower_Range" : Opt_BLEtxpower_Range,
		"Input_M0_Range" : Input_M0_Range,
		"Input_M1_Range" : Input_M1_Range,
		"Input_M2_Range" : Input_M2_Range,
		"Input_IO_Range" : Input_IO_Range,
		"Lock_L1Opt_Range" : Lock_L1Opt_Range,
		"Lock_L2Opt_Range" : Lock_L2Opt_Range,
		"ExtDev_RS232_Range" : ExtDev_RS232_Range,
		"ExtDev_RS485_Range" : ExtDev_RS485_Range,
		"ExtDev_SlaveReader_Range" : ExtDev_SlaveReader_Range,
		"Thermal_Temperature_Range" : Thermal_Temperature_Range
	};
	return range;
}

exports.getDisplayRange = function() {
	var Lang_Lang_Range = app.lookup("Lang_Lang_Range");
	var range = {
		"Lang_Lang_Range" : Lang_Lang_Range
	};
	return range;
}

exports.getTerminalHolidayID = function() {
	var TerminalHolidayID = app.lookup("TerminalHolidayID");
	return TerminalHolidayID;
}


