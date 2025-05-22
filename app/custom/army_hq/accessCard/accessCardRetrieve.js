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
	var cmbGroup = app.lookup("AMACR_cmbGroup");
	if (isLoginMaster()){ // 24년도부터 Master를 제외한 관리자는 본인 부서 + 하위 부서만 관리 가능
		cmbGroup.setItemSet(dataManager.getGroup(), {label: "Name",	value: "GroupID"});
		cmbGroup.addItem(new cpr.controls.Item("------", 0));	
	} else {
		cmbGroup.setItemSet(dataManager.getLoginUserGroups(), {label: "Name",	value: "GroupID"});
	}
	cmbGroup.selectItemByValue(getLoginUserGroupCode());

	var pageIndexer = app.lookup("AMACR_piPersonnelList");
	pageIndexer.pageRowCount = AMACR_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndexer.viewPageCount = 10;// 보여지는 페이지 수(하단 부 인덱스 수)	
}

function clearPersonnelDetail() {
	app.lookup("AMACR_cmbPersonnelInfoUserType").value = "";
	app.lookup("AMACR_opbPersonnelInfoName").value = "";
	app.lookup("AMACR_opbPersonnelInfoServiceNumber").value = "";
	app.lookup("AMACR_opbPersonnelInfoPosition").value = "";
	app.lookup("AMACR_opbPersonnelInfoUserGroup").value = "";

	app.lookup("AMACR_opbPersonnelInfoAccessStart").value = "";
	app.lookup("AMACR_opbPersonnelInfoAccessEnd").value = "";

	app.lookup("AMACR_cmbPersonnelInfoAccessCardType").value = "";
	app.lookup("AMACR_opbPersonnelInfoManagementNumber").value = "";

	app.lookup("AMACR_opbPersonnelInfoCardSerial").value = "";
}

function sendAcceesCardIssuanceList() {
	var userName = app.lookup("AMACR_ipbName").value;
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

	var userType = app.lookup("AMACR_cmpUserType").value;
	if (userType == 0) {
		userType = UserPrivArmyNotVisit;
	}
	var group = app.lookup("AMACR_cmbGroup").value;
	
	var sms_getAccessCardInfoExList = app.lookup("sms_getAccessCardInfoExList");
	sms_getAccessCardInfoExList.setParameters("accessCardStatus", AccessCardStatusIssuance);
	sms_getAccessCardInfoExList.setParameters("userType", userType);
	sms_getAccessCardInfoExList.setParameters("cardType", 1000);  // 1000 고정 출입증 (  1,2,3,5)
	sms_getAccessCardInfoExList.setParameters("offset", offset);
	sms_getAccessCardInfoExList.setParameters("userName", userName);
	
	sms_getAccessCardInfoExList.setParameters("group", group);
	sms_getAccessCardInfoExList.setParameters("limit", AMACR_pageRowCount);
	sms_getAccessCardInfoExList.setParameters("offset", offset);
	
	// 군가족은 user_access_application_amhqs.visite_target_group 컬럼을 확인해서 가져오거나  access_card_info_amhqs.owner_group 컬럼 확인해서 가져오기
    var groupName = app.lookup("AMACR_cmbGroup").getItemByValue(group).label;
    sms_getAccessCardInfoExList.setParameters("fields", [groupName]);
	
	sms_getAccessCardInfoExList.send();
}
// 출입증 교부 출입자 목록 가져오기
function onAMACR_btnPersonnelListSearchClick(/* cpr.events.CMouseEvent */ e) {
	var pageIndexer = app.lookup("AMACR_piPersonnelList");
		pageIndexer.currentPageIndex = 1;
	sendAcceesCardIssuanceList();
}

//function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e) {
//	if (e.keyCode == 13) {
//		var pageIndexer = app.lookup("AMACR_piPersonnelList");
//		pageIndexer.currentPageIndex = 1;
//		sendAcceesCardIssuanceList();
//	}
//}

// 검색어 2글자 이상 팝업 제대로 보이도록 keydown을 keyup으로 변경 - pse 
function onAMACR_ipbNameKeyup(/* cpr.events.CKeyboardEvent */ e){
	if (e.keyCode == 13) {
		var pageIndexer = app.lookup("AMACR_piPersonnelList");
		pageIndexer.currentPageIndex = 1;
		sendAcceesCardIssuanceList();
	}
}

// 출입증 리스트 가져오기 완료
function onSms_getAccessCardInfoListSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		/*if( app.lookup("AccessCardList").getRowCount() == 0 ){
			dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_NoSearchResult"));
		}*/
		var pageIndexer = app.lookup("AMACR_piPersonnelList");
		var total = app.lookup("Total").getValue("Count");
		pageIndexer.totalRowCount = total;
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
	app.lookup("AMACR_opbPersonnelInfoCardSerial").value = "";

	var cardInfo = grdPersonnelList.getRow(index);
	if (cardInfo) {
		console.log(cardInfo.getRowData());
		var applicationIndex = cardInfo.getValue("ApplicationIndex");

		var sms_getAccessApplicationInfo = app.lookup("sms_getAccessApplicationInfo");
		sms_getAccessApplicationInfo.action = "/v1/armyhq/accessApplication/" + applicationIndex;
		sms_getAccessApplicationInfo.send();

		app.lookup("AMACR_cmbPersonnelInfoUserType").value = cardInfo.getValue("UserType");
		app.lookup("AMACR_opbPersonnelInfoName").value = cardInfo.getValue("OwnerName");
		var serviceNumber = cardInfo.getValue("OwnerServiceNumber");
		if (serviceNumber.length == 0) { serviceNumber = cardInfo.getValue("OwnerBirthday"); }
		app.lookup("AMACR_opbPersonnelInfoServiceNumber").value = serviceNumber;
		app.lookup("AMACR_opbPersonnelInfoPosition").value = cardInfo.getValue("OwnerPosition");
		app.lookup("AMACR_opbPersonnelInfoUserGroup").value = cardInfo.getValue("OwnerGroup");

		var cardType = cardInfo.getValue("CardType");
		var cmbCardType = app.lookup("AMACR_cmbPersonnelInfoAccessCardType").value = cardType;
		if (cardType.length < 2) {
			cardType = "00" + cardType;
		}
		var managementNumber = cardInfo.getValue("ManagementNumber");
		var mNum = managementNumber.length;
		for (var i = 0; i < 4 - mNum; i++) {
			managementNumber = "0" + managementNumber;
		}
		app.lookup("AMACR_opbPersonnelInfoManagementNumber").value = cardType + " - " + managementNumber;
	}
}

function onSms_getAccessApplicationInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	console.log(app.lookup("AccessApplicationInfo").getDatas());

	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var accessApplicationInfo = app.lookup("AccessApplicationInfo");
		var startAt = accessApplicationInfo.getValue("AccessStart");
		if (startAt.length > 10) { startAt = startAt.substring(0, 10); }
		app.lookup("AMACR_opbPersonnelInfoAccessStart").value = startAt;
		var endAt = accessApplicationInfo.getValue("AccessEnd");
		if (endAt.length > 10) { endAt = endAt.substring(0, 10); }
		app.lookup("AMACR_opbPersonnelInfoAccessEnd").value = endAt;

		var smsGetTerminalList = app.lookup("sms_getTerminalList");
		smsGetTerminalList.setParameters("limit", 1000);
		smsGetTerminalList.setParameters("offset", 0);
		smsGetTerminalList.action = "/v1/accessGroups/" + accessApplicationInfo.getValue("AccessGroup") + "/terminals";
		smsGetTerminalList.send();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 카드 인식 클릭
function onAMACR_btnCardScanClick(/* cpr.events.CMouseEvent */ e) {

	var grdPersonnelList = app.lookup("AMACR_grdPersonnelList");
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
	app.lookup("AMACR_opbPersonnelInfoCardSerial").value = "";

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

function onAMACR_btnCardScanClick2(/* cpr.events.CMouseEvent */ e){
	
	var grdPersonnelList = app.lookup("AMACR_grdPersonnelList");
	
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
	
	var appld = "app/custom/army_hq/users/userCardRegist";
	
	app.lookup("AMACR_opbPersonnelInfoCardSerial").value = "";
	
	app.getRootAppInstance().openDialog(appld, {width: 640,height: 490}, function(dialog) {
		dialog.style.header.css("background-color", "#528443");
		dialog.bind("headerTitle").toLanguage("Str_ARMYHQ_CardScan");
		dialog.initValue = {
			"userID": userInfo.getValue("OwnerID"),
			"UserCardInfo": dsAccessCardInfo,
			"Mode": "Regist",
			"Url": "/v1"
		};
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
		
	});

}

// 출입증 회수 버튼 클릭
function onAMACR_btnRetrieveClick(/* cpr.events.CMouseEvent */ e) {

	var grdPersonnelList = app.lookup("AMACR_grdPersonnelList");
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

	var cardNum = app.lookup("AMACR_opbPersonnelInfoCardSerial").value;
	if (cardNum == undefined || cardNum.length == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_CardNotRecognized"));
		return;
	}

	var accessCardInfo = app.lookup("AccessCardInfo");
	accessCardInfo.clear();

	var applicationIndex = accessApplicationInfo.getValue("ApplicationIndex");

	var ownerID = accessApplicationInfo.getValue("OwnerID");
	var desc = app.lookup("AMACR_ipbRetriveDesc").value;
	accessCardInfo.setValue("CardStatus", AccessCardStatusRetrive);
	accessCardInfo.setValue("ApplicationIndex", applicationIndex);
	accessCardInfo.setValue("CardNumber", cardNum);
	accessCardInfo.setValue("OwnerID", accessApplicationInfo.getValue("OwnerID"));
	accessCardInfo.setValue("Description", desc);
	accessCardInfo.setValue("CardType", app.lookup("AMACR_cmbPersonnelInfoAccessCardType").value);

	var sms_postAccessCardRetrive = app.lookup("sms_postAccessCardRetrive");
	sms_postAccessCardRetrive.send();
}

// 회수 처리 완료
function onSms_postAccessCardRetriveSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		sendAcceesCardIssuanceList();
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), "출입증이 회수 처리되었습니다.");
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
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
					var opbPersonnelInfoCardSerial = app.lookup("AMACR_opbPersonnelInfoCardSerial");
					var strCardNum = result.CardNum; // 카드번호 옮겨 담기

					if (dataManager.getSystemBrandType() == BRAND_VRIDI) { // 버디 타입은 8자리 채워준다.
						if (strCardNum.length < 8) {
							strCardNum = StrLib.formattedString("00000000", String(result.CardNum), "left");
						}
					}

					result.CardNum = strCardNum;
					opbPersonnelInfoCardSerial.value = result.CardNum; // 카드 교부 클릭시 컨트롤의 데이터를 사용
					opbPersonnelInfoCardSerial.redraw();
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
		app.lookup("AMACR_opbAccessGroup").value = accessArea;

	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onAMACR_piPersonnelListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var aMACR_piPersonnelList = e.control;
	sendAcceesCardIssuanceList();
}
