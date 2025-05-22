/************************************************
 * accessCardIssuance.js
 * Created at 2021. 2. 5. 오전 10:12:10.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var StrLib = cpr.core.Module.require("lib/StrLib");
var comLib;
var AMACI_pageRowCount = 50;
var AMACI_deviceWebSocket;
var ACMTP_templateIndex;
var USINT_fpModified; // 사용자가 지문 데이터를 수정 했는지 여부
var USFPR_templateFormat= 3; //ISO 템플릿 포멧 추가

function onBodyLoad(/* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	USFPR_templateFormat = dataManager.getClientOption().getValue("TemplateFormat");
	console.log("templateType : " + USFPR_templateFormat);

	var link = app.lookup("AMTCI_sniDownloadLink");
	link.value = "<a href=\"/setup/AlpetaDevice.exe\" target=\"_blank\">" + dataManager.getString("Str_ARMYHQ_PrintServerDownloadPath") + "</a>";

	app.lookup("AMTCI_opbDeviceMsg").value = dataManager.getString("Str_ARMYHQ_DeviceConnectTry");

	connectDeviceServer("127.0.0.1:9600");

	initControls();
	sendAccessApplicationListReq();
}

function initControls() {
	var pageIndexer = app.lookup("AMTCI_piAccessApplication");
	pageIndexer.pageRowCount = AMACI_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndexer.viewPageCount = 10;// 보여지는 페이지 수(하단 부 인덱스 수)	
	var cmbGroup = app.lookup("AMTCI_cmbGroup");
	if (isLoginMaster()){ // 24년도부터 Master를 제외한 관리자는 본인 부서 + 하위 부서만 관리 가능
		cmbGroup.setItemSet(dataManager.getGroup(), {label: "Name",	value: "GroupID"});
		cmbGroup.addItem(new cpr.controls.Item("------", 0));	
	} else {
		cmbGroup.setItemSet(dataManager.getLoginUserGroups(), {label: "Name",	value: "GroupID"});
	}
	cmbGroup.selectItemByValue(getLoginUserGroupCode());
	
	var cmdGrdGroup = app.lookup("AMTCI_cmdGrdPersonnelListGroup");
	cmdGrdGroup.setItemSet(dataManager.getGroup(), { label: "Name", value: "GroupID" });
	var cmbUserGroup = app.lookup("AMTCI_cmbPersonnelInfoUserGroup");
	cmbUserGroup.setItemSet(dataManager.getGroup(), { label: "Name", value: "GroupID" });
	var cmbPosition = app.lookup("AMTCI_cmbPersonnelInfoPosition");
	cmbPosition.setItemSet(dataManager.getPositionList(), {label:"Name", value:"PositionID"});
}

function onBodyUnload(/* cpr.events.CEvent */ e) {
	if (AMACI_deviceWebSocket != null) { AMACI_deviceWebSocket.close(); AMACI_deviceWebSocket = null; }
}

function onSubmitError(/* cpr.events.CSubmissionEvent */ e) { app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR); }
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e) { app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT); }

// 출입자 목록 가져오기 완료
function onSms_getAccessApplicationListSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var pageIndexer = app.lookup("AMTCI_piAccessApplication");
		var total = app.lookup("Total").getValue("Count");
		pageIndexer.totalRowCount = total;

	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function clearPersonnelDetail() {
	app.lookup("AMTCI_cmbPersonnelInfoUserType").value = "";
	app.lookup("AMTCI_opbPersonnelInfoName").value = "";
	app.lookup("AMTCI_opbPersonnelInfoServiceNumber").value = "";
	app.lookup("AMTCI_cmbPersonnelInfoPosition").value = "";
	app.lookup("AMTCI_cmbPersonnelInfoUserGroup").value = "";

	app.lookup("AMTCI_opbPersonnelInfoAccessStart").value = "";
	app.lookup("AMTCI_opbPersonnelInfoAccessEnd").value = "";

	app.lookup("AMTCI_cmbPersonnelInfoAccessCardType").value = "";
	app.lookup("AMTCI_opbPersonnelInfoManagementNumber").value = "";

	app.lookup("AMTCI_opbPersonnelInfoCardSerial").value = "";
	app.lookup("AMTCI_opbPersonnelInfoFPInfo").value = "";
}

// 출입자 조회 클릭
function onAMACI_btnPersonnelListSearchClick(/* cpr.events.CMouseEvent */ e) { 
	var pageIndexer = app.lookup("AMTCI_piAccessApplication");
	pageIndexer.currentPageIndex = 1;
	sendAccessApplicationListReq(); 
}
// 페이지 클릭
function onAMTCI_piAccessApplicationSelectionChange(/* cpr.events.CSelectionEvent */ e) { sendAccessApplicationListReq(); }

function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e) {
	if (e.keyCode == 13) {
		sendAccessApplicationListReq();
	}
}

function sendAccessApplicationListReq() {
	clearPersonnelDetail();
	app.lookup("UserAccessApplications").clear();

	var pageIndexer = app.lookup("AMTCI_piAccessApplication");
	var curIndex = pageIndexer.currentPageIndex;
	var offset = (curIndex - 1) * AMACI_pageRowCount;

	var sms_getAccessApplicationList = app.lookup("sms_getAccessApplicationList");
	sms_getAccessApplicationList.setParameters("applicationStatus", AccessApplicationStatusApproval);
	sms_getAccessApplicationList.setParameters("accessCardStatus", AccessCardStatusIssueable);
	sms_getAccessApplicationList.setParameters("group", app.lookup("AMTCI_cmbGroup").value);

	if (app.lookup("AMTCI_cmbUserType").value == 0) {
		sms_getAccessApplicationList.setParameters("userType", UserPrivArmyFixPersion);
	} else {
		sms_getAccessApplicationList.setParameters("userType", app.lookup("AMTCI_cmbUserType").value);
	}

	sms_getAccessApplicationList.setParameters("applicationType", AccessApplicationTypeAccess);
	sms_getAccessApplicationList.setParameters("userName", app.lookup("AMTCI_ipbName").value);
	sms_getAccessApplicationList.setParameters("offset", offset);
	sms_getAccessApplicationList.setParameters("limit", AMACI_pageRowCount);
	sms_getAccessApplicationList.setParameters("expire", 3);

	sms_getAccessApplicationList.send();
}

function sendTempCardListReq(cardNumber) {
	app.lookup("AccessCardList").clear();

	var sms_getVisitCardList = app.lookup("sms_getTempCardList");
	sms_getVisitCardList.setParameters("offset", 0);
	sms_getVisitCardList.setParameters("limit", 1);
	sms_getVisitCardList.setParameters("cardNum", cardNumber);
	sms_getVisitCardList.setParameters("cardType", AccessCardTypeTempory);
	sms_getVisitCardList.setParameters("accessCardStatus", AccessCardStatusIssueOrRetrive);

	sms_getVisitCardList.send();
}

// 출입자 목록에서 출입자 선택시
function onAMTCI_grdAccessUserListSelectionChange(/* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type cpr.controls.Grid
	 */
	var grdPersonnelList = e.control;
	var index = grdPersonnelList.getSelectedRowIndex();
	if (index > - 1) {
		var row = grdPersonnelList.getRow(index);
		if (row) {

			var applicationIndex = row.getValue("ApplicationIndex");
			var accessCardInfo = app.lookup("AccessCardInfo");
			var accessApplication = app.lookup("UserAccessApplications");
			console.log(accessApplication.getRowDataRanged(), applicationIndex);
			var aaInfo = accessApplication.findFirstRow("ApplicationIndex == " + applicationIndex);
			console.log(aaInfo.getRowData());
			if (aaInfo) {
				app.lookup("AMTCI_cmbPersonnelInfoUserType").value = aaInfo.getValue("UserType");
				app.lookup("AMTCI_opbPersonnelInfoName").value = aaInfo.getValue("Name");
				var serviceNumber = aaInfo.getValue("ServiceNumber");
				if (serviceNumber.length == 0) { serviceNumber = aaInfo.getValue("Birthday"); }
				app.lookup("AMTCI_opbPersonnelInfoServiceNumber").value = serviceNumber;
				app.lookup("AMTCI_cmbPersonnelInfoPosition").value = aaInfo.getValue("Position");
				app.lookup("AMTCI_cmbPersonnelInfoUserGroup").value = aaInfo.getValue("GroupCode");

				var startAt = aaInfo.getValue("AccessStart");
				if (startAt.length > 10) { startAt = startAt.substring(0, 10); }
				app.lookup("AMTCI_opbPersonnelInfoAccessStart").value = startAt;
				var endAt = aaInfo.getValue("AccessEnd");
				if (endAt.length > 10) { endAt = endAt.substring(0, 10); }
				app.lookup("AMTCI_opbPersonnelInfoAccessEnd").value = endAt;

				app.lookup("AMTCI_cmbPersonnelInfoAccessCardType").value = row.getValue("CardType");
				app.lookup("AMTCI_opbPersonnelInfoManagementNumber").value = row.getValue("ManagementNumber");

				var smsGetTerminalList = app.lookup("sms_getTerminalList");
				smsGetTerminalList.setParameters("limit", 1000);
				smsGetTerminalList.setParameters("offset", 0);
				smsGetTerminalList.action = "/v1/accessGroups/" + aaInfo.getValue("AccessGroup") + "/terminals";
				smsGetTerminalList.send();
			}
		}
		app.lookup("AMTCI_opbPersonnelInfoCardSerial").value = "";
		app.lookup("AMTCI_opbPersonnelInfoFPInfo").value = "";

		var dsUserFpInfo = app.lookup("UserFPInfo");
		dsUserFpInfo.clear();
		var dmUserFpInfo = app.lookup("dmFPInfo");
		dmUserFpInfo.clear();
	}
}

// 카드입력 버튼 클릭
function onAMACI_btnCardScanClick(/* cpr.events.CMouseEvent */ e) {

	var grdPersonnelList = app.lookup("AMTCI_grdAccessUserList");
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
	app.lookup("AMTCI_opbPersonnelInfoCardSerial").value = "";

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
	AMACI_deviceWebSocket.send(msgData);
}

// 단말기선택 버튼 클릭
function onAMACI_btnCardScanClick2(/* cpr.events.CMouseEvent */ e){
	
	var grdPersonnelList = app.lookup("AMTCI_grdAccessUserList");
	
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
	
	app.lookup("AMTCI_opbPersonnelInfoCardSerial").value = "";
	
	app.getRootAppInstance().openDialog(appld, {width: 640,height: 490}, function(dialog) {
		dialog.bind("headerTitle").toLanguage("Str_ARMYHQ_CardScan");
		dialog.initValue = {
			"userID": userInfo.getValue("OwnerID"),
			"UserCardInfo": dsAccessCardInfo,
			"Mode": "Regist",
			"Url": "/v1"
		};
		dialog.resizable = false;
		dialog.style.header.css("background-color", "#528443");
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
		sendTempCardListReq(CardNum);
	});

}

// 지문 입력 버튼 클릭
function onAMACI_btnFPScanClick(/* cpr.events.CMouseEvent */ e) {

	if (AMACI_deviceWebSocket == null) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_HamsterNotFound"));
		return;
	}

	var grdPersonnelList = app.lookup("AMTCI_grdAccessUserList");
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

	app.lookup("AMTCI_opbPersonnelInfoFPInfo").text = "지문을 입력해주세요.";

	var dmFPInfo = app.lookup("dmFPInfo");
	dmFPInfo.clear();

	dmFPInfo.setValue("UserID", userInfo.getValue("OwnerID"));
	dmFPInfo.setValue("FingerID", 1);
	
	ACMTP_templateIndex = 0;
	onFPCaptureReq();
}

function onFPCaptureReq() {

	var dmFPInfo = app.lookup("dmFPInfo");
	var uid = dmFPInfo.getValue("UserID");
	var fingerID = dmFPInfo.getValue("FingerID");

	var bodyData = {};
	bodyData.UserId = uid;
	bodyData.BrandType = "VIRDI";
	bodyData.ImageType = "JPG";
	bodyData.FingerIndex = fingerID;
	bodyData.TemplateFormat = USFPR_templateFormat;

	var msgReq = {
		msgId: String(WSCmdFPCaptureReq),
		body: bodyData
	};

	var msgData = JSON.stringify(msgReq);
	AMACI_deviceWebSocket.send(msgData);
}

function onFPVerifyReq(uid, template_1, template_2) {

	var bodyData = {};
	bodyData.UserId = uid;
	bodyData.BrandType = "VIRDI";
	bodyData.Template1 = template_1;
	bodyData.Template2 = template_2;
	bodyData.TemplateFormat = USFPR_templateFormat;

	var msgReq = {
		msgId: String(WSCmdFPVerifyReq),
		body: bodyData
	};

	var msgData = JSON.stringify(msgReq);
	AMACI_deviceWebSocket.send(msgData);
}

// 지문 삭제 클릭
function onAMACI_btnFPDeleteClick(/* cpr.events.CMouseEvent */ e) {
	var dmFPInfo = app.lookup("dmFPInfo");
	dmFPInfo.clear();
	app.lookup("AMTCI_opbPersonnelInfoFPInfo").text = "";

}

// 교부 클릭
function onAMACI_btnIssuanceClick(/* cpr.events.CMouseEvent */ e) {
	var grdPersonnelList = app.lookup("AMTCI_grdAccessUserList");
	var index = grdPersonnelList.getSelectedRowIndex();
	if (index < 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}

	var applicationInfo = grdPersonnelList.getRow(index);
	if (applicationInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}

	var cardNum = app.lookup("AMTCI_opbPersonnelInfoCardSerial").value;
	if (cardNum == null || cardNum.length < 1) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_CardSeriaNotValid"));
		return;
	}

	var accessCardInfo = app.lookup("AccessCardInfo");

	accessCardInfo.setValue("ApplicationIndex", applicationInfo.getValue("ApplicationIndex"));
	accessCardInfo.setValue("CardType", AccessCardTypeTempory);
	accessCardInfo.setValue("CardStatus", AccessCardStatusIssuance);
	accessCardInfo.setValue("CardNumber", cardNum);
	accessCardInfo.setValue("OwnerID", applicationInfo.getValue("UserID"));
	accessCardInfo.setValue("OwnerName", applicationInfo.getValue("Name"));

	var position = applicationInfo.getValue("Position");
	position = dataManager.getPositionName(position);
	if (position.length == 0) {
		position = applicationInfo.getValue("UserClass");
	}
	accessCardInfo.setValue("OwnerPosition", position);


	var groupName = dataManager.getGroupName(applicationInfo.getValue("GroupCode"));
	accessCardInfo.setValue("OwnerGroup", groupName);

	accessCardInfo.setValue("OwnerServiceNumber", applicationInfo.getValue("ServiceNumber"));
	accessCardInfo.setValue("OwnerBirthday", applicationInfo.getValue("Birthday"));
	
	var sms_putVisitCard = app.lookup("sms_putTempCard");
	sms_putVisitCard.send();	
	
	/*
	// 기존에 임시출입증 등록시에는 지문 등록이 되지 않아 수정 - pse
	var sms_postAccessCardIssuance = app.lookup("sms_postAccessCardIssuance");
	sms_postAccessCardIssuance.send();
	*/  
}

// 카드 캡쳐 정보 가져오기
function onSms_getTempCardListSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	
	console.log("resultCode : " + COMERROR_NONE);
	if (resultCode == COMERROR_NONE) {
		var accessCardList = app.lookup("AccessCardList");
		if (accessCardList.getRowCount() > 0) {
			var accessCardRow = accessCardList.getRow(0);

			var dmAccessCardInfo = app.lookup("AccessCardInfo");
			dmAccessCardInfo.setValue("CardType", accessCardRow.getValue("CardType"));
			dmAccessCardInfo.setValue("ManagementNumber", accessCardRow.getValue("ManagementNumber"));

			app.lookup("AMTCI_cmbPersonnelInfoAccessCardType").value = accessCardRow.getValue("CardType");
			app.lookup("AMTCI_opbPersonnelInfoManagementNumber").value = accessCardRow.getValue("ManagementNumber");

		} else {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "교부되었거나 교부할 수 없는 카드입니다.");
		}

		console.log("getRowDataRanged : " + app.lookup("AccessCardList").getRowDataRanged());
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}



function connectDeviceServer(address) {

	AMACI_deviceWebSocket = new WebSocket("ws://" + address + "/v1/webEntry");

	AMACI_deviceWebSocket.onopen = function (message) {
		app.lookup("AMTCI_opbDeviceMsg").value = dataManager.getString("Str_ARMYHQ_DeviceConnected");
		console.log("device server ws connected.");
	};

	AMACI_deviceWebSocket.onclose = function (message) {
		AMACI_deviceWebSocket = null;
		console.log("Server disconnect...");
	};

	AMACI_deviceWebSocket.onerror = function (message) {
		console.log("error... " + message);
		var opbMessage = app.lookup("AMTCI_opbDeviceMsg");
		if (opbMessage) {
			opbMessage.value = dataManager.getString("Str_ARMYHQ_PrintServerInstallRequired");
		}

		var sniDownloadLink = app.lookup("AMTCI_sniDownloadLink");
		if (sniDownloadLink) {
			sniDownloadLink.visible = true;
		}
	};

	AMACI_deviceWebSocket.onmessage = function (message) {

		var msg = JSON.parse(message.data);
		console.log("onmessage : " + msg.msgId);
		switch (msg.msgId) {
			case WSCmdCardCaptureRes: { // 캡쳐 완료. 결과 수신.
				comLib.hideLoadMask();
				var result = JSON.parse(msg.body);

				if (result.Result == "success") {
					var opbPersonnelInfoCardSerial = app.lookup("AMTCI_opbPersonnelInfoCardSerial");
					var strCardNum = result.CardNum; // 카드번호 옮겨 담기

					if (dataManager.getSystemBrandType() == BRAND_VRIDI) { // 버디 타입은 8자리 채워준다.
						if (strCardNum.length < 8) {
							strCardNum = StrLib.formattedString("00000000", String(result.CardNum), "left");
						}
					}

					result.CardNum = strCardNum;
					opbPersonnelInfoCardSerial.value = result.CardNum; // 카드 교부 클릭시 컨트롤의 데이터를 사용
					opbPersonnelInfoCardSerial.redraw();

					sendTempCardListReq(result.CardNum);
				} else if (result.Result == "Capture failed") {
					dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorCardCapture"));
				} else {
					dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), result);
				}

			} break;
			case WSCmdFPCaptureRes: { // 캡쳐 완료. 결과 수신. 

				var result = JSON.parse(msg.body);
				if (ACMTP_templateIndex == 0) {
					app.lookup("AMTCI_opbPersonnelInfoFPInfo").text = "확인을 위해 지문을 다시 입력해주세요.";
					ACMTP_templateIndex = 1;
					var dmFPInfo = app.lookup("dmFPInfo");
					dmFPInfo.setValue("Template1", result["FingerData"]);
					onFPCaptureReq();
				} else if (ACMTP_templateIndex == 1) { // 두개의 템플릿에 대해 매칭 시도
					app.lookup("AMTCI_opbPersonnelInfoFPInfo").text = "지문 데이터 검증중입니다.";
					var dmFPInfo = app.lookup("dmFPInfo");
					dmFPInfo.setValue("Template2", result["FingerData"]);
					var template_1 = dmFPInfo.getValue("Template1");
					var template_2 = dmFPInfo.getValue("Template2");
					dmFPInfo.setValue("templateFormat", USFPR_templateFormat);
					onFPVerifyReq(dmFPInfo.getValue("UserID"), template_1, template_2);
					ACMTP_templateIndex = 0
				}
			} break;

			case WSCmdFPVerifyRes:
				var body = JSON.parse(msg.body);

				if (body.Result == 0) {
					app.lookup("AMTCI_opbPersonnelInfoFPInfo").text = "지문 입력 성공";
					var dsUserFpInfo = app.lookup("UserFPInfo");
					dsUserFpInfo.clear();

					var dmFPInfo = app.lookup("dmFPInfo");
					dsUserFpInfo.addRowData({ "FingerID": 1, "MinConvType": 3, "TemplateIndex": 1, "TemplateData": dmFPInfo.getValue("Template1") });
					dsUserFpInfo.addRowData({ "FingerID": 1, "MinConvType": 3, "TemplateIndex": 2, "TemplateData": dmFPInfo.getValue("Template2") });

				} else {
					app.lookup("AMTCI_opbPersonnelInfoFPInfo").text = "지문 입력 실패";
				}
				break;

			default: console.log(msg); break;
		}
	}
}

//출입 단말 가져오기 완료
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
		app.lookup("AMTCI_opbAccessGroup").value = accessArea;

	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 임시 출입증 교부 
function onSms_putTempCardSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		// 출입자 목록 갱신
		sendAccessApplicationListReq();
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_ARMYHQ_IssuanceSuccess"));
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}



// 지문 단말기 선택 클릭  - pse
function onAMACI_btnTerminalFPScanClick(/* cpr.events.CMouseEvent */ e){
	var grdPersonnelList = app.lookup("AMTCI_grdAccessUserList");
	var dsUserAccessApplications = app.lookup("UserAccessApplications");
	var selectIndex = grdPersonnelList.getSelectedRowIndex();
	var row = grdPersonnelList.getRow(selectIndex);
	
	// 출입자 선택 안하면 경고 팝업 띄우기
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
	
	var appId = "app/custom/rokmch/users/UserFingerRegist"
	var dsUserFpInfo = app.lookup("UserFPInfo");
	app.getRootAppInstance().openDialog(appId, {width : 640, height : 490}, function(dialog){
		// 협박 지문 인자로 전달
		var duressFinger = userInfo.getValue("DuressFinger");
		console.log("duressFinger : " + duressFinger);
		if (duressFinger) {
			duressFinger = duressFinger.split(",");
		}
		
		dialog.bind("headerTitle").toLanguage("Str_FingerRegist");			
		dialog.initValue = {
			"UserID": row.getValue("UserID"),
			"Url": "/v1",
			"FPModified": USINT_fpModified,
			"UserFPInfo": dsUserFpInfo,
			"DuressFinger": duressFinger
		}
		dialog.style.header.css("background-color", "#528443");
		dialog.resizable = false;
		dialog.modal = true;
		
	}).then(function(returnValue){
		USINT_fpModified = 1;
		//console.log("returnValue : " + returnValue);
		if (returnValue != "") {
			app.lookup("AMTCI_opbPersonnelInfoFPInfo").text = "지문 입력 성공";
			
			var count = 0;
			var duress = "";
			for (var i = 0; i < returnValue.length; i++) {
				if (returnValue[i]["TemplateIndex"] == 1 && returnValue[i]["Duress"] == 1) {
					if (duress.length != 0) {
						duress += ",";
					}
					duress += returnValue[i]["FingerID"];
					count++;
				}
					
					dsUserFpInfo.addRowData(returnValue[i]);
			} 
		}
	});
	
}

// 지문 추가된 버전 - pse
function onSms_postAccessCardIssuanceSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		// 출입자 목록 갱신
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_ARMYHQ_IssuanceSuccess"));
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 지문 추가된 버전 - pse
function onSms_postAccessCardIssuanceSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

// 지문 추가된 버전 - pse
function onSms_postAccessCardIssuanceSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
