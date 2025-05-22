/************************************************
 * accessCardRetrieve.js
 * Created at 2021. 2. 5. 오전 11:06:06.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var StrLib = cpr.core.Module.require("lib/StrLib");
var comLib;
var AMACR_pageRowCount = 50;
var AMACR_deviceWebSocket;

function onBodyLoad(/* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	comLib = createComUtil(app);

	var link = app.lookup("AMACR_sniDownloadLink");
	link.value = "<a href=\"/setup/AlpetaDevice.exe\" target=\"_blank\">" + dataManager.getString("Str_ARMYHQ_PrintServerDownloadPath") + "</a>";

	app.lookup("AMACR_opbDeviceMsg").value = dataManager.getString("Str_ARMYHQ_DeviceConnectTry");

	connectDeviceServer("127.0.0.1:9600");

	initControls();
	sendAcceesCardIssuanceList();
}

function onBodyUnload(/* cpr.events.CEvent */ e) {
	if (AMACR_deviceWebSocket != null) { AMACR_deviceWebSocket.close(); AMACR_deviceWebSocket = null; }
}

function onSubmitError(/* cpr.events.CSubmissionEvent */ e) { app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR); }
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e) { app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT); }

function initControls() {
	var cmbGroup = app.lookup("AMTCR_cmbGroup");
	if (isLoginMaster()){ // 24년도부터 Master를 제외한 관리자는 본인 부서 + 하위 부서만 관리 가능
		cmbGroup.setItemSet(dataManager.getGroup(), {label: "Name",	value: "GroupID"});
		cmbGroup.addItem(new cpr.controls.Item("------", 0));	
	} else {
		cmbGroup.setItemSet(dataManager.getLoginUserGroups(), {label: "Name",	value: "GroupID"});
	}
	cmbGroup.selectItemByValue(getLoginUserGroupCode());
	
	// 콤보박스가 아닌 Output 이므로 주석처리 -mjy
//	var cmbPosition = app.lookup("AMTCR_opbPersonnelInfoPosition");
//	cmbPosition.setItemSet(dataManager.getPositionList(), {label:"Name", value:"PositionID"});

	var pageIndexer = app.lookup("AMACR_piPersonnelList");
	pageIndexer.pageRowCount = AMACR_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndexer.viewPageCount = 10;// 보여지는 페이지 수(하단 부 인덱스 수)	
}

function clearPersonnelDetail() {
	app.lookup("AMTCR_cmbPersonnelInfoUserType").value = "";
	app.lookup("AMTCR_opbPersonnelInfoName").value = "";
	app.lookup("AMTCR_opbPersonnelInfoServiceNumber").value = "";
	app.lookup("AMTCR_opbPersonnelInfoPosition").value = "";
	app.lookup("AMTCR_opbPersonnelInfoUserGroup").value = "";

	app.lookup("AMTCR_opbPersonnelInfoAccessStart").value = "";
	app.lookup("AMTCR_opbPersonnelInfoAccessEnd").value = "";

	app.lookup("AMTCR_cmbPersonnelInfoAccessCardType").value = "";
	app.lookup("AMTCR_opbPersonnelInfoManagementNumber").value = "";

	app.lookup("AMTCR_opbPersonnelInfoCardSerial").value = "";
}

function sendAcceesCardIssuanceList() {
	var userName = app.lookup("AMTCR_ipbName").value;
	if (userName != null && userName.length == 1) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_SearchNameLengthInvalid"));
		return;
	}
	clearPersonnelDetail();

	var dsAccessCardList = app.lookup("AccessCardList");
	dsAccessCardList.clear();

	var pageIndexer = app.lookup("AMACR_piPersonnelList");
	var curIndex = pageIndexer.currentPageIndex;
	var offset = (curIndex - 1) * AMACR_pageRowCount;

	var userType = app.lookup("AMTCR_cmpUserType").value;
	var group = app.lookup("AMTCR_cmbGroup").value;

	var sms_getAccessCardInfoExList = app.lookup("sms_getAccessCardInfoExList");
	sms_getAccessCardInfoExList.setParameters("accessCardStatus", AccessCardStatusIssuance);
	sms_getAccessCardInfoExList.setParameters("userType", userType);
	sms_getAccessCardInfoExList.setParameters("cardType", AccessCardTypeTempory);
	sms_getAccessCardInfoExList.setParameters("userName", userName);
	sms_getAccessCardInfoExList.setParameters("group", group);
	
	// 군가족은 user_access_application_amhqs.visite_target_group 컬럼을 확인해서 가져오거나  access_card_info_amhqs.owner_group 컬럼 확인해서 가져오기
    var groupName = app.lookup("AMTCR_cmbGroup").getItemByValue(group).label;
    sms_getAccessCardInfoExList.setParameters("fields", [groupName]);
	
	sms_getAccessCardInfoExList.setParameters("limit", AMACR_pageRowCount);
	sms_getAccessCardInfoExList.setParameters("offset", offset);
	sms_getAccessCardInfoExList.send();
}

function sendAccessApplicationDetailReq(cardNum) {

	console.log(app.lookup("AccessApplicationInfo").getDatas());

	var sms_getVisitCardDetail = app.lookup("sms_getTempCardDetail");
	sms_getVisitCardDetail.setParameters("offset", 0);
	sms_getVisitCardDetail.setParameters("limit", 1);
	sms_getVisitCardDetail.setParameters("card_status", AccessCardStatusIssuance);
	sms_getVisitCardDetail.setParameters("cardType", AccessCardTypeTempory);
	sms_getVisitCardDetail.setParameters("cardNum", cardNum);
	sms_getVisitCardDetail.send();
}

// 출입증 교부 출입자 목록 가져오기
function onAMACR_btnPersonnelListSearchClick(/* cpr.events.CMouseEvent */ e) {
	var pageIndexer = app.lookup("AMACR_piPersonnelList");	
	pageIndexer.currentPageIndex = 1;//한 페이지에 보여 줄 행의 수	
	sendAcceesCardIssuanceList();
}

//function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e) {
//	if (e.keyCode == 13) {
//		var pageIndexer = app.lookup("AMACR_piPersonnelList");	
//		pageIndexer.currentPageIndex = 1;//한 페이지에 보여 줄 행의 수	
//		sendAcceesCardIssuanceList();
//	}
//}

// 검색어 2글자 이상 팝업 제대로 보이도록 keydown을 keyup으로 변경 - pse
function onAMTCR_ipbNameKeyup(/* cpr.events.CKeyboardEvent */ e){
	if (e.keyCode == 13) {
		var pageIndexer = app.lookup("AMACR_piPersonnelList");	
		pageIndexer.currentPageIndex = 1;//한 페이지에 보여 줄 행의 수	
		sendAcceesCardIssuanceList();
	}
}


// 출입증 리스트 가져오기 완료
function onSms_getAccessCardInfoListSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var pageIndexer = app.lookup("AMACR_piPersonnelList");
		var total = app.lookup("Total").getValue("Count");
		pageIndexer.totalRowCount = total;

		console.log(app.lookup("AccessCardList").getRowDataRanged());
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 출입증 교부 사용자 리스트 클릭
function onAMACR_grdPersonnelListSelectionChange(/* cpr.events.CSelectionEvent */ e) {
	/** @type cpr.controls.Grid	 */
	var grdPersonnelList = e.control;
	var index = grdPersonnelList.getSelectedRowIndex();
	if (index < 0) {
		return
	}
	app.lookup("AMTCR_opbPersonnelInfoCardSerial").value = "";

	var cardInfo = grdPersonnelList.getRow(index);
	if (cardInfo) {
		console.log(cardInfo.getRowData());
		var applicationIndex = cardInfo.getValue("ApplicationIndex");

		var sms_getAccessApplicationInfo = app.lookup("sms_getAccessApplicationInfo");
		sms_getAccessApplicationInfo.action = "/v1/armyhq/accessApplication/" + applicationIndex;
		sms_getAccessApplicationInfo.send();

		app.lookup("AMTCR_cmbPersonnelInfoUserType").value = cardInfo.getValue("UserType");
		app.lookup("AMTCR_opbPersonnelInfoName").value = cardInfo.getValue("OwnerName");
		var serviceNumber = cardInfo.getValue("OwnerServiceNumber");
		if (serviceNumber.length == 0) { serviceNumber = cardInfo.getValue("OwnerBirthday"); }
		app.lookup("AMTCR_opbPersonnelInfoServiceNumber").value = serviceNumber;
		app.lookup("AMTCR_opbPersonnelInfoPosition").value = cardInfo.getValue("OwnerPosition");
		app.lookup("AMTCR_opbPersonnelInfoUserGroup").value = cardInfo.getValue("OwnerGroup");

		var cardType = cardInfo.getValue("CardType");
		var cmbCardType = app.lookup("AMTCR_cmbPersonnelInfoAccessCardType").value = cardType;
		if (cardType.length < 2) {
			cardType = "00" + cardType;
		}
		var managementNumber = cardInfo.getValue("ManagementNumber");
		var mNum = managementNumber.length;
		for (var i = 0; i < 4 - mNum; i++) {
			managementNumber = "0" + managementNumber;
		}
		app.lookup("AMTCR_opbPersonnelInfoManagementNumber").value = cardType + " - " + managementNumber;
	}
}

function onSms_getAccessApplicationInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	console.log(app.lookup("AccessApplicationInfo").getDatas());

	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var accessApplicationInfo = app.lookup("AccessApplicationInfo");
		var startAt = accessApplicationInfo.getValue("AccessStart");
		if (startAt.length > 10) { startAt = startAt.substring(0, 10); }
		app.lookup("AMTCR_opbPersonnelInfoAccessStart").value = startAt;
		var endAt = accessApplicationInfo.getValue("AccessEnd");
		if (endAt.length > 10) { endAt = endAt.substring(0, 10); }
		app.lookup("AMTCR_opbPersonnelInfoAccessEnd").value = endAt;

		var smsGetTerminalList = app.lookup("sms_getTerminalList");
		smsGetTerminalList.setParameters("limit", 1000);
		smsGetTerminalList.setParameters("offset", 0);
		smsGetTerminalList.action = "/v1/accessGroups/" + accessApplicationInfo.getValue("AccessGroup") + "/terminals";
		smsGetTerminalList.send();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}


function onSms_getTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var accessArea = "";
		var terminalList = app.lookup("TerminalsInfo");
		for (var i = 0; i < terminalList.getRowCount(); i++) {
			var terminalInfo = terminalList.getRow(i);
			if (accessArea.length > 0) {
				accessArea += ", ";
			}
			accessArea += terminalInfo.getValue("Name");
		}
		app.lookup("AMTCR_opbAccessGroup").value = accessArea;

	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_getTempCardDetailSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var accessApplicationInfo = app.lookup("AccessApplicationInfo");
		var accessCardInfo = app.lookup("AccessCardInfo");
		if (accessApplicationInfo.getValue("ApplicationIndex") != Number(accessCardInfo.getValue("ApplicationIndex"))) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "발급 정보와 카드정보가 일치하지 않습니다.");
		}

		//console.log(app.lookup("AccessCardInfo").getDatas());
		//console.log(app.lookup("AccessApplicationInfo").getDatas());
	} else if (resultCode == ErrorDataNotExist) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "발급된 카드가 아닙니다.");
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}

}

function onSms_putTempCardSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		app.lookup("AccessCardInfo").clear()
		app.lookup("AccessApplicationInfo").clear()

		sendAcceesCardIssuanceList();
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), "임시출입증이 회수 처리되었습니다.");
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 카드 인식 클릭
function onAMACR_btnCardScanClick(/* cpr.events.CMouseEvent */ e) {

	var grdPersonnelList = app.lookup("AMTCR_grdPersonnelList");
	var index = grdPersonnelList.getSelectedRowIndex();
	if (index < 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}

	var userInfo = grdPersonnelList.getRow(index);
	if (userInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
	app.lookup("AMTCR_opbPersonnelInfoCardSerial").value = "";

	var bodyData = {};
	bodyData.UserId = String(userInfo.getRowData("OwnerID"));
	bodyData.BrandType = "VIRDI";
	bodyData.CardType = "0";
	bodyData.ReadType = "0";
	bodyData.SerialType = "0";

	var msgReq = {
		msgId: String(WSCmdCardCaptureReq),
		body: bodyData
	};

	var msgData = JSON.stringify(msgReq);
	AMACR_deviceWebSocket.send(msgData);

}

// 단말기선택 클릭
function onAMACR_btnCardScanClick2(/* cpr.events.CMouseEvent */ e) {
	var grdPersonnelList = app.lookup("AMTCR_grdPersonnelList");
	
	var dsAccessCardInfo = app.lookup("UserCardInfo");
	
	var index = grdPersonnelList.getSelectedRowIndex();
	if( index < 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
		
	var userInfo = grdPersonnelList.getRow(index);
	if (userInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
	
	var appld = "app/custom/rokmch/users/userCardRegist";
	
	app.lookup("AMTCR_opbPersonnelInfoCardSerial").value = "";
	
	app.getRootAppInstance().openDialog(appld, {width: 640,height: 490}, function(dialog) {
		dialog.bind("headerTitle").toLanguage("Str_ARMYHQ_CardScan");
		dialog.initValue = {
			"userID": userInfo.getValue("OwnerID"),
			"UserCardInfo": dsAccessCardInfo,
			"Mode": "Regist",
			"Url": "/v1"
		};
		dialog.style.header.css("background-color", "#528443");
		dialog.resizable = false;
		dialog.modal = true;
	}).then(function(returnValue) {		
		var dsAccessCardInfo = app.lookup("UserCardInfo");
		dsAccessCardInfo.clear();
		
		if(returnValue.length>1){
			dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "한 개의 카드를 입력해 주세요.");
			return;
		}

		for (var i = 0; i < returnValue.length; i++) {
			dsAccessCardInfo.addRowData(returnValue[i]);
		}
		var CardNum = dsAccessCardInfo.getValue(0, "CardNum");
		sendAccessApplicationDetailReq(CardNum);
	});
}


// 출입증 회수 버튼 클릭
function onAMACR_btnRetrieveClick(/* cpr.events.CMouseEvent */ e) {
	var grdPersonnelList = app.lookup("AMTCR_grdPersonnelList");
	var index = grdPersonnelList.getSelectedRowIndex();
	if (index < 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}

	var accessApplicationInfo = grdPersonnelList.getRow(index);
	if (accessApplicationInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}

	var cardNum = app.lookup("AMTCR_opbPersonnelInfoCardSerial").value;
	if (cardNum == undefined || cardNum.length == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_CardNotRecognized"));
		return;
	}

	var accessCardInfo = app.lookup("AccessCardInfo");
	accessCardInfo.setValue("CardStatus", AccessCardStatusRetrive);

	var sms_putVisitCard = app.lookup("sms_putTempCard");
	sms_putVisitCard.send();
}

function connectDeviceServer(address) {
	AMACR_deviceWebSocket = new WebSocket("ws://" + address + "/v1/webEntry");

	AMACR_deviceWebSocket.onopen = function (message) {
		app.lookup("AMACR_opbDeviceMsg").value = dataManager.getString("Str_ARMYHQ_DeviceConnected");
		console.log("device server ws connected.");
	};

	AMACR_deviceWebSocket.onclose = function (message) {
		AMACR_deviceWebSocket = null;
		console.log("Server disconnect...");
	};

	AMACR_deviceWebSocket.onerror = function (message) {
		console.log("error... " + message);
		var opbMessage = app.lookup("AMACR_opbDeviceMsg");
		if (opbMessage) {
			opbMessage.value = dataManager.getString("Str_ARMYHQ_PrintServerInstallRequired");
		}

		var sniDownloadLink = app.lookup("AMACR_sniDownloadLink");
		if (sniDownloadLink) {
			sniDownloadLink.visible = true;
		}
	};

	AMACR_deviceWebSocket.onmessage = function (message) {
		var msg = JSON.parse(message.data);
		switch (msg.msgId) {
			case WSCmdCardCaptureRes: { // 캡쳐 완료. 결과 수신.
				comLib.hideLoadMask();
				var result = JSON.parse(msg.body);
				if (result.Result == "success") {
					var opbPersonnelInfoCardSerial = app.lookup("AMTCR_opbPersonnelInfoCardSerial");
					var strCardNum = result.CardNum; // 카드번호 옮겨 담기

					if (dataManager.getSystemBrandType() == BRAND_VRIDI) { // 버디 타입은 8자리 채워준다.
						if (strCardNum.length < 8) {
							strCardNum = StrLib.formattedString("00000000", String(result.CardNum), "left");
						}
					}

					result.CardNum = strCardNum;
					opbPersonnelInfoCardSerial.value = result.CardNum; // 카드 교부 클릭시 컨트롤의 데이터를 사용
					opbPersonnelInfoCardSerial.redraw();
					sendAccessApplicationDetailReq(result.CardNum);
				} else if (result.Result == "Capture failed") {
					dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorCardCapture"));
				} else {
					dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), result);
				}
			} break;
			default: console.log(msg); break;
		}
	}
}





/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onAMACR_piPersonnelListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	
	sendAcceesCardIssuanceList();
}
