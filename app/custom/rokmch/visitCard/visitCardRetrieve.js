/************************************************
 * visitCardRetrieve.js
 * Created at 2021. 2. 2. 오후 5:09:56.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var StrLib = cpr.core.Module.require("lib/StrLib");
var comLib;

var VMVCR_deviceWebSocket;

function onBodyLoad(/* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	comLib = createComUtil(app);

	var link = app.lookup("VMVCR_sniDownloadLink");
	link.value = "<a href=\"/setup/AlpetaDevice.exe\" target=\"_blank\">" + dataManager.getString("Str_ARMYHQ_PrintServerDownloadPath") + "</a>";

	connectDeviceServer("127.0.0.1:9600");
}

function onBodyUnload(/* cpr.events.CEvent */ e) {
	if (VMVCR_deviceWebSocket != null) { VMVCR_deviceWebSocket.close(); VMVCR_deviceWebSocket = null; }
}

function connectDeviceServer(address) {

	VMVCR_deviceWebSocket = new WebSocket("ws://" + address + "/v1/webEntry");

	VMVCR_deviceWebSocket.onopen = function (message) {
		app.lookup("VMVCR_opbDeviceMsg").value = "카드 리더기 연결 성공";
		console.log("device server ws connected.");
	};

	VMVCR_deviceWebSocket.onclose = function (message) {
		VMVCR_deviceWebSocket = null;
		console.log("Server disconnect...");
	};

	VMVCR_deviceWebSocket.onerror = function (message) {
		console.log("error... " + message);
		var opbMessage = app.lookup("VMVCR_opbDeviceMsg");
		if (opbMessage) {
			opbMessage.value = dataManager.getString("Str_ARMYHQ_PrintServerInstallRequired");
		}
		app.lookup("VMVCR_sniDownloadLink").visible = true;

	};

	VMVCR_deviceWebSocket.onmessage = function (message) {

		var msg = JSON.parse(message.data);
		console.log("onmessage : " + msg.msgId);
		switch (msg.msgId) {
			case WSCmdCardCaptureRes: { // 캡쳐 완료. 결과 수신.
				comLib.hideLoadMask();
				var result = JSON.parse(msg.body);

				if (result.Result == "success") {

					var accessCardInfo = app.lookup("AccessCardInfo");
					var strCardNum = result.CardNum; // 카드번호 옮겨 담기

					if (dataManager.getSystemBrandType() == BRAND_VRIDI) { // 버디 타입은 8자리 채워준다.
						if (strCardNum.length < 8) {
							strCardNum = StrLib.formattedString("00000000", String(result.CardNum), "left");
						}
					}

					result.CardNum = strCardNum;
					accessCardInfo.setValue("CardNumber", result.CardNum);
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

// 카드 인식 클릭
function onVMVCR_btnCardScanClick(/* cpr.events.CMouseEvent */ e) {
	var bodyData = {};
	bodyData.UserId = String("");
	bodyData.BrandType = "VIRDI";
	bodyData.CardType = "0";
	bodyData.ReadType = "0";
	bodyData.SerialType = "0";

	var msgReq = {
		msgId: String(WSCmdCardCaptureReq),
		body: bodyData
	};

	var msgData = JSON.stringify(msgReq);
	VMVCR_deviceWebSocket.send(msgData);
}

function onVMVCR_btnCardScan1Click(/* cpr.events.CMouseEvent */ e){
	
	var dsAccessCardInfo = app.lookup("UserCardInfo");
	
	var appld = "app/custom/rokmch/users/userCardRegist";
	
	app.getRootAppInstance().openDialog(appld, {width: 640,height: 490}, function(dialog) {
		dialog.bind("headerTitle").toLanguage("Str_ARMYHQ_CardScan");
		dialog.style.header.css("background-color", "#528443");
		dialog.initValue = {
			"userID": String(""),
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
		
		var CardNum = dsAccessCardInfo.getValue(0, "CardNum");	
		sendAccessApplicationDetailReq(CardNum);
	});
}

function sendAccessApplicationDetailReq(cardNum) {
	var sms_getVisitCardDetail = app.lookup("sms_getVisitCardDetail");
	sms_getVisitCardDetail.setParameters("offset", 0);
	sms_getVisitCardDetail.setParameters("limit", 1);
	sms_getVisitCardDetail.setParameters("card_status", AccessCardStatusIssuance);
	sms_getVisitCardDetail.setParameters("cardNum", cardNum);
	sms_getVisitCardDetail.send();
}

function onSms_getVisitCardDetailSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {

		var accessApplicationInfo = app.lookup("AccessApplicationInfo")

		var accessCardInfo = app.lookup("AccessCardInfo")
		var issueanceAt = accessCardInfo.getValue("IssueAt");
		issueanceAt = issueanceAt.substring(0, 10) + " " + issueanceAt.substring(11, 19)
		app.lookup("VMVCR_opbIssuanceDate").value = issueanceAt;

		var serviceNumber = accessApplicationInfo.getValue("ServiceNumber");
		if (serviceNumber == undefined || serviceNumber.length == 0) {
			serviceNumber = accessApplicationInfo.getValue("Birthday");
		}
		app.lookup("VMVCR_opbVisitorServiceNumber").value = serviceNumber;

		var position = accessApplicationInfo.getValue("Position");
		position = dataManager.getPositionName(position);
		if (position.length == 0) {
			position = accessApplicationInfo.getValue("UserClass");
		}
		app.lookup("VMVCR_opbVisitorPosition").value = position;

		app.lookup("VMVCR_grpVisitInfo").redraw();

		var applicationInfo = app.lookup("AccessApplicationInfo");
//		var smsGetTerminalList = app.lookup("sms_getTerminalList");
//		smsGetTerminalList.setParameters("limit", 1000);
//		smsGetTerminalList.setParameters("offset", 0);
//		smsGetTerminalList.action = "/v1/accessGroups/" + applicationInfo.getValue("AccessGroup") + "/terminals";
//		smsGetTerminalList.send();

		getAccessArea();
	} else if (resultCode == ErrorDataNotExist) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "발급된 카드가 아닙니다.");
		app.lookup("UserCardInfo").clear()

	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
		app.lookup("UserCardInfo").clear()
	}
}

function onSubmitError(/* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

// 회수 버튼 클릭
function onVMVCR_btnIssuanceClick(/* cpr.events.CMouseEvent */ e) {
	var accessCardInfo = app.lookup("AccessCardInfo");
	accessCardInfo.setValue("CardStatus", AccessCardStatusRetrive);

	var sms_putVisitCard = app.lookup("sms_putVisitCard");
	sms_putVisitCard.send();
}


function onSms_putVisitCardSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		app.lookup("AccessCardInfo").clear()
		app.lookup("AccessApplicationInfo").clear()
		app.lookup("UserCardInfo").clear()


		app.lookup("VMVCR_opbIssuanceDate").value = "";
		app.lookup("VMVCR_opbVisitorServiceNumber").value = "";
		app.lookup("VMVCR_opbVisitorPosition").value = "";
		app.lookup("VMVCR_optVisitorAccessGroup").value = "";

		app.lookup("VMVCR_grpVisitInfo").redraw();

		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), "방문증이 회수 처리되었습니다.");
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
		app.lookup("VMVCR_optVisitorAccessGroup").value = accessArea;

	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

/*
 * 터미널 ID 대신 출입구역으로 출력.
 * 방문신청자의 출입그룹에 맞는 출입구역을 찾는다. - mjy
 */
function getAccessArea() {
		var applicationInfo = app.lookup("AccessApplicationInfo");
		var accessAreaList = dataManager.getAccessArea();
		var accessAreaGroupList = dataManager.getAccessAreaGroup();
		
		var accessArea = ""
		var condition = "AccessGroupID == " + applicationInfo.getValue("AccessGroup");  
		
		var AccessAreaRows = accessAreaGroupList.findAllRow(condition);
		AccessAreaRows.forEach(function(each){
			condition = "ID == " + each.getValue("AccessAreaID");
			var AccessAreaRow = accessAreaList.findFirstRow(condition);
			if(accessArea.length > 0){
				accessArea += ", ";
			}
			accessArea += AccessAreaRow.getValue("Name");			
		});
		
		app.lookup("VMVCR_optVisitorAccessGroup").value = accessArea;
}
