/************************************************
 * civilServiceCardRegist.js
 * Created at 2021. 2. 5. 오후 4:18:05.
 *
 * @author fois
 ************************************************/


var dataManager = cpr.core.Module.require("lib/DataManager");
var StrLib = cpr.core.Module.require("lib/StrLib");
var comLib;
var AMNCR_pageRowCount = 50;
var AMNCR_deviceWebSocket;
var AMNCR_templateIndex = 0;

function onBodyLoad(/* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	comLib = createComUtil(app);

	var link = app.lookup("AMNCR_sniDownloadLink");
	link.value = "<a href=\"/setup/AlpetaDevice.exe\" target=\"_blank\">" + dataManager.getString("Str_ARMYHQ_PrintServerDownloadPath") + "</a>";

	app.lookup("AMNCR_opbDeviceMsg").value = dataManager.getString("Str_ARMYHQ_DeviceConnectTry");

	connectDeviceServer("127.0.0.1:9600");

	initControls();

	sendAccessApplicationListReq();
}

function initControls() {
	var pageIndexer = app.lookup("AMNCR_piPersonnelList");
	pageIndexer.pageRowCount = AMNCR_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndexer.viewPageCount = 10;// 보여지는 페이지 수(하단 부 인덱스 수)	
	var cmbGroup = app.lookup("AMNCR_cmbGroup");
	if (isLoginMaster()){ // 24년도부터 Master를 제외한 관리자는 본인 부서 + 하위 부서만 관리 가능
		cmbGroup.setItemSet(dataManager.getGroup(), {label: "Name",	value: "GroupID"});
		cmbGroup.addItem(new cpr.controls.Item("------", 0));	
	} else {
		cmbGroup.setItemSet(dataManager.getLoginUserGroups(), {label: "Name",	value: "GroupID"});
	}
	cmbGroup.selectItemByValue(getLoginUserGroupCode());
	
	var cmdGrdGroup = app.lookup("AMCCR_cmdGrdPersonnelListGroup");
	cmdGrdGroup.setItemSet(dataManager.getGroup(), { label: "Name", value: "GroupID" });
	var cmdGrdPosition = app.lookup("AMNCR_cmbPersonnelInfoPosition");
	cmdGrdPosition.setItemSet(dataManager.getPositionList(), { label: "Name", value: "PositionID" });
	var cmdGrdPosition = app.lookup("AMCCR_cmdGrdPersonnelListPosition");
	cmdGrdPosition.setItemSet(dataManager.getPositionList(), { label: "Name", value: "PositionID" });
	var cmbUserGroup = app.lookup("AMNCR_cmbPersonnelInfoUserGroup");
	cmbUserGroup.setItemSet(dataManager.getGroup(), { label: "Name", value: "GroupID" });
}

function onBodyUnload(/* cpr.events.CEvent */ e) {
	if (AMNCR_deviceWebSocket != null) { AMNCR_deviceWebSocket.close(); AMNCR_deviceWebSocket = null; }
}

function onSubmitError(/* cpr.events.CSubmissionEvent */ e) { app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR); }
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e) { app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT); }

// 출입자 목록 가져오기 완료
function onSms_getAccessApplicationListSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		if (app.lookup("UserAccessApplications").getRowCount() == 0) {
			//dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_NoSearchResult"));
		}
		var pageIndexer = app.lookup("AMNCR_piPersonnelList");
		var total = app.lookup("Total").getValue("Count");
		pageIndexer.totalRowCount = total;
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function clearPersonnelDetail() {
	app.lookup("AMCCR_cmbPersonnelInfoUserType").value = "";
	app.lookup("AMNCR_opbPersonnelInfoName").value = "";
	app.lookup("AMNCR_opbPersonnelInfoServiceNumber").value = "";
	app.lookup("AMNCR_cmbPersonnelInfoPosition").value = "";
	app.lookup("AMNCR_cmbPersonnelInfoUserGroup").value = "";

	app.lookup("AMNCR_opbPersonnelInfoAccessStart").value = "";
	app.lookup("AMNCR_opbPersonnelInfoAccessEnd").value = "";

	app.lookup("AMNCR_opbPersonnelInfoCardSerial").value = "";
	app.lookup("AMNCR_opbPersonnelInfoFPInfo").value = "";
}

// 출입자 조회 클릭
function onAMCCR_btnPersonnelListSearchClick(/* cpr.events.CMouseEvent */ e) {
		var pageIndexer = app.lookup("AMNCR_piPersonnelList");
		pageIndexer.currentPageIndex = 1; 
	sendAccessApplicationListReq(); 
}
// 페이지 클릭
function onAMCCR_piAccessApplicationSelectionChange(/* cpr.events.CSelectionEvent */ e) { sendAccessApplicationListReq(); }

//function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e) {
//	if (e.keyCode == 13) {
//		var pageIndexer = app.lookup("AMNCR_piPersonnelList");
//		pageIndexer.currentPageIndex = 1; 
//		sendAccessApplicationListReq();
//	}
//}

// 검색어 2글자 이상 팝업 제대로 보이도록 keydown을 keyup으로 변경 - pse
function onAMNCR_ipbNameKeyup(/* cpr.events.CKeyboardEvent */ e){
	if (e.keyCode == 13) {
		var pageIndexer = app.lookup("AMNCR_piPersonnelList");
		pageIndexer.currentPageIndex = 1; 
		sendAccessApplicationListReq();
	}
}

function sendAccessApplicationListReq() {
	var userName = app.lookup("AMNCR_ipbName").value;
	if (userName != null && userName.length == 1) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_SearchNameLengthInvalid"));
		return;
	}

	clearPersonnelDetail();
	app.lookup("UserAccessApplications").clear();

	var userType = UserPrivArmySoldier;
	var group = app.lookup("AMNCR_cmbGroup").value;

	var pageIndexer = app.lookup("AMNCR_piPersonnelList");
	var curIndex = pageIndexer.currentPageIndex;
	var offset = (curIndex - 1) * AMNCR_pageRowCount;

	var sms_getAccessApplicationList = app.lookup("sms_getAccessApplicationList");
	sms_getAccessApplicationList.setParameters("applicationStatus", AccessApplicationStatusApproval);
	sms_getAccessApplicationList.setParameters("accessCardStatus", AccessCardStatusIssueReady);
	sms_getAccessApplicationList.setParameters("userType", userType);
	sms_getAccessApplicationList.setParameters("limit", AMNCR_pageRowCount);
	sms_getAccessApplicationList.setParameters("offset", offset);
	sms_getAccessApplicationList.setParameters("userName", userName);
	sms_getAccessApplicationList.setParameters("group", group);
	sms_getAccessApplicationList.send();

}

// 출입자 목록에서 출입자 선택시
function onAMCCR_grdPersonnelListSelectionChange(/* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type cpr.controls.Grid
	 */
	var grdPersonnelList = e.control;
	var index = grdPersonnelList.getSelectedRowIndex();
	if (index > - 1) {
		var row = grdPersonnelList.getRow(index);
		if (row) {
			console.log(row.getRowData());
			var applicationIndex = row.getValue("ApplicationIndex");
			var accessCardInfo = app.lookup("AccessCardInfo");
			var accessApplication = app.lookup("UserAccessApplications");
			console.log(accessApplication.getRowDataRanged(), applicationIndex);
			var aaInfo = accessApplication.findFirstRow("ApplicationIndex == " + applicationIndex);
			console.log(aaInfo.getRowData());
			if (aaInfo) {
				app.lookup("AMCCR_cmbPersonnelInfoUserType").value = aaInfo.getValue("UserType");
				app.lookup("AMNCR_opbPersonnelInfoName").value = aaInfo.getValue("Name");
				var serviceNumber = aaInfo.getValue("ServiceNumber");
				if (serviceNumber.length == 0) { serviceNumber = aaInfo.getValue("Birthday"); }
				app.lookup("AMNCR_opbPersonnelInfoServiceNumber").value = serviceNumber;
				app.lookup("AMNCR_cmbPersonnelInfoPosition").value = aaInfo.getValue("Position");
				app.lookup("AMNCR_cmbPersonnelInfoUserGroup").value = aaInfo.getValue("GroupCode");

				var startAt = aaInfo.getValue("AccessStart");
				if (startAt.length > 10) { startAt = startAt.substring(0, 10); }
				app.lookup("AMNCR_opbPersonnelInfoAccessStart").value = startAt;
				var endAt = aaInfo.getValue("AccessEnd");
				if (endAt.length > 10) { endAt = endAt.substring(0, 10); }
				app.lookup("AMNCR_opbPersonnelInfoAccessEnd").value = endAt;
			}
			var smsGetTerminalList = app.lookup("sms_getTerminalList");
			smsGetTerminalList.setParameters("limit", 1000);
			smsGetTerminalList.setParameters("offset", 0);
			smsGetTerminalList.action = "/v1/accessGroups/" + row.getValue("AccessGroup") + "/terminals";
			smsGetTerminalList.send();
		}
		app.lookup("AMNCR_opbPersonnelInfoCardSerial").value = "";
		app.lookup("AMNCR_opbPersonnelInfoFPInfo").value = "";

		var dsUserFpInfo = app.lookup("UserFPInfo");
		dsUserFpInfo.clear();
		var dmUserFpInfo = app.lookup("dmFPInfo");
		dmUserFpInfo.clear();
	}
}

//출입장소 가져오기 완료
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
		app.lookup("AMNCR_opbAccessGroup").value = accessArea;

	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 카드입력 버튼 클릭
function onAMCCR_btnCardScanClick(/* cpr.events.CMouseEvent */ e) {

	var grdPersonnelList = app.lookup("AMNCR_grdPersonnelList");
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
	app.lookup("AMNCR_opbPersonnelInfoCardSerial").value = "";
	AMNCR_templateIndex = 0;

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
	AMNCR_deviceWebSocket.send(msgData);
}

function onAMCCR_btnCardScanClick3(/* cpr.events.CMouseEvent */ e){
	
	var grdPersonnelList = app.lookup("AMNCR_grdPersonnelList");
	
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
	
	app.lookup("AMNCR_opbPersonnelInfoCardSerial").value = "";
	
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
		
	});

}

// 지문 입력 버튼 클릭
function onAMCCR_btnFPScanClick(/* cpr.events.CMouseEvent */ e) {

	if (AMNCR_deviceWebSocket == null) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_HamsterNotFound"));
		return;
	}

	var grdPersonnelList = app.lookup("AMNCR_grdPersonnelList");
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

	app.lookup("AMNCR_opbPersonnelInfoFPInfo").text = "지문을 입력해주세요.";

	var dmFPInfo = app.lookup("dmFPInfo");
	dmFPInfo.clear();

	dmFPInfo.setValue("UserID", userInfo.getValue("OwnerID"));
	dmFPInfo.setValue("FingerID", 1);

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

	var msgReq = {
		msgId: String(WSCmdFPCaptureReq),
		body: bodyData
	};

	var msgData = JSON.stringify(msgReq);
	AMNCR_deviceWebSocket.send(msgData);
}

function onFPVerifyReq(uid, template_1, template_2) {

	var bodyData = {};
	bodyData.UserId = uid;
	bodyData.BrandType = "VIRDI";
	bodyData.Template1 = template_1;
	bodyData.Template2 = template_2;

	var msgReq = {
		msgId: String(WSCmdFPVerifyReq),
		body: bodyData
	};

	var msgData = JSON.stringify(msgReq);
	AMNCR_deviceWebSocket.send(msgData);
}

// 지문 삭제 클릭
function onAMCCR_btnFPDeleteClick(/* cpr.events.CMouseEvent */ e) {
	var dmFPInfo = app.lookup("dmFPInfo");
	dmFPInfo.clear();
	app.lookup("AMNCR_opbPersonnelInfoFPInfo").text = "";

}

// 교부 클릭
function onAMCCR_btnIssuanceClick(/* cpr.events.CMouseEvent */ e) {
	var grdPersonnelList = app.lookup("AMNCR_grdPersonnelList");
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

	var cardNum = app.lookup("AMNCR_opbPersonnelInfoCardSerial").value;
	if (cardNum == null || cardNum.length < 1) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_CardSeriaNotValid"));
		return;
	}

	var accessCardInfo = app.lookup("AccessCardInfo");
	accessCardInfo.setValue("IssuanceType", 1); // 0 : 출입증이 발급된 상태, 1: 출입증 발급&교부 인 경우(공무원증 등록)
	accessCardInfo.setValue("CardType", AccessCardTypeCivilService);
	accessCardInfo.setValue("CardTypeEx", CivilServiceCardNarasarang);
	accessCardInfo.setValue("CardNumber", cardNum);
	accessCardInfo.setValue("ApplicationIndex", userInfo.getValue("ApplicationIndex"));

	accessCardInfo.setValue("OwnerID", userInfo.getValue("UserID"));
	accessCardInfo.setValue("OwnerName", userInfo.getValue("Name"));

	var group = dataManager.getGroupName(userInfo.getValue("GroupCode"));
	accessCardInfo.setValue("OwnerGroup", group);

	var position = dataManager.getPositionName(userInfo.getValue("Position"));
	accessCardInfo.setValue("OwnerPosition", position);
	accessCardInfo.setValue("OwnerServiceNumber", userInfo.getValue("ServiceNumber"));
	accessCardInfo.setValue("OwnerBirthday", userInfo.getValue("Birthday"));

	var sms_postAccessCardIssuance = app.lookup("sms_postAccessCardIssuance");
	sms_postAccessCardIssuance.send();
}

// 출입증 교부 완료
function onSms_postAccessCardIssuanceSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		// 출입자 목록 갱신
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_ARMYHQ_IssuanceSuccess"));
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function connectDeviceServer(address) {

	AMNCR_deviceWebSocket = new WebSocket("ws://" + address + "/v1/webEntry");

	AMNCR_deviceWebSocket.onopen = function (message) {
		app.lookup("AMNCR_opbDeviceMsg").value = dataManager.getString("Str_ARMYHQ_DeviceConnected");
		console.log("device server ws connected.");
	};

	AMNCR_deviceWebSocket.onclose = function (message) {
		AMNCR_deviceWebSocket = null;
		console.log("Server disconnect...");
	};

	AMNCR_deviceWebSocket.onerror = function (message) {
		console.log("error... " + message);
		var opbMessage = app.lookup("AMNCR_opbDeviceMsg");
		if (opbMessage) {
			opbMessage.value = dataManager.getString("Str_ARMYHQ_PrintServerInstallRequired");
		}

		var sniDownloadLink = app.lookup("AMNCR_sniDownloadLink");
		if (sniDownloadLink) {
			sniDownloadLink.visible = true;
		}
	};

	AMNCR_deviceWebSocket.onmessage = function (message) {

		var msg = JSON.parse(message.data);
		console.log("onmessage : " + msg.msgId);
		switch (msg.msgId) {
			case WSCmdCardCaptureRes: { // 캡쳐 완료. 결과 수신.
				comLib.hideLoadMask();
				var result = JSON.parse(msg.body);

				if (result.Result == "success") {
					var opbPersonnelInfoCardSerial = app.lookup("AMNCR_opbPersonnelInfoCardSerial");
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
			case WSCmdFPCaptureRes: { // 캡쳐 완료. 결과 수신. 

				var result = JSON.parse(msg.body);
				if (AMCCR_templateIndex == 0) {
					app.lookup("AMNCR_opbPersonnelInfoFPInfo").text = "확인을 위해 지문을 다시 입력해주세요.";
					AMNCR_templateIndex = 1;
					var dmFPInfo = app.lookup("dmFPInfo");
					dmFPInfo.setValue("Template1", result["FingerData"]);
					onFPCaptureReq();
				} else if (AMCCR_templateIndex == 1) { // 두개의 템플릿에 대해 매칭 시도
					app.lookup("AMNCR_opbPersonnelInfoFPInfo").text = "지문 데이터 검증중입니다.";
					var dmFPInfo = app.lookup("dmFPInfo");
					dmFPInfo.setValue("Template2", result["FingerData"]);
					var template_1 = dmFPInfo.getValue("Template1");
					var template_2 = dmFPInfo.getValue("Template2");
					onFPVerifyReq(dmFPInfo.getValue("UserID"), template_1, template_2);
					AMCCR_templateIndex = 0
				}
			} break;

			case WSCmdFPVerifyRes:
				var body = JSON.parse(msg.body);

				if (body.Result == 0) {
					app.lookup("AMNCR_opbPersonnelInfoFPInfo").text = "지문 입력 성공";
					var dsUserFpInfo = app.lookup("UserFPInfo");
					dsUserFpInfo.clear();

					var dmFPInfo = app.lookup("dmFPInfo");
					dsUserFpInfo.addRowData({ "FingerID": 1, "MinConvType": 3, "TemplateIndex": 1, "TemplateData": dmFPInfo.getValue("Template1") });
					dsUserFpInfo.addRowData({ "FingerID": 1, "MinConvType": 3, "TemplateIndex": 2, "TemplateData": dmFPInfo.getValue("Template2") });

				} else {
					app.lookup("AMNCR_opbPersonnelInfoFPInfo").text = "지문 입력 실패";
				}
				break;

			default: console.log(msg); break;
		}
	}
}
