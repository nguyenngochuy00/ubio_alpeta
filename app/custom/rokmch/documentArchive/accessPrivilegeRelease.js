/************************************************
 * accessPrivilegeRelease.js
 * Created at 2021. 2. 24. 오전 11:25:44.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var StrLib = cpr.core.Module.require("lib/StrLib");
var comLib;

var AMDAR_deviceWebSocket;
var AMDAR_pageRowCount = 50;
var AMDAR_cardTarget; // AccessCardTypeOtherUnit:공무원증(타부대원), 2:AccessCardTypeForeign:방문증
var AMDAR_cardValidation; // 0 : 미등록카드(방문증), 1: 등록된 카드, 2: 미등록카드(공무원증)

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	comLib = createComUtil(app);

	var pageIndexer = app.lookup("AMDAR_piAccessorList");
	pageIndexer.pageRowCount = AMDAR_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndexer.viewPageCount = 10;// 보여지는 페이지 수(하단 부 인덱스 수)

	var link = app.lookup("AMDAR_sniDownloadLink");
	link.value = "<a href=\"/setup/AlpetaDevice.exe\" target=\"_blank\">" + dataManager.getString("Str_ARMYHQ_PrintServerDownloadPath") + "</a>";

	connectDeviceServer("127.0.0.1:9600");

	sendAccessorListReq();
}

function onBodyUnload(/* cpr.events.CEvent */ e) {
	if (AMDAR_deviceWebSocket != null) { AMDAR_deviceWebSocket.close(); AMDAR_deviceWebSocket = null; }
}

function onSubmitError( /* cpr.events.CSubmissionEvent */ e) { app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR); }
function onSubmitTimeOut( /* cpr.events.CSubmissionEvent */ e) { app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT); }

function validateDate(value, timeInclude) {
	if (value == undefined || value == "0001-01-01T00:00:00Z") { return ""; }
	if (value.substring(0, 10) == "0001-01-01") { return; }
	if (timeInclude == false) {
		return value.substring(0, 10);// +" " + value.substring(11, 19);
	}
	return value.substring(0, 10) + " " + value.substring(11, 19);
}

function sendAccessorListReq() {
	app.lookup("AccessorList").clear();

	var pageIndexer = app.lookup("AMDAR_piAccessorList");
	var curIndex = pageIndexer.currentPageIndex;
	var offset = (curIndex - 1) * AMDAR_pageRowCount;

	var sms_getAccessorList = app.lookup("sms_getAccessorList");

	sms_getAccessorList.setParameters("name", app.lookup("AMDAR_ipbName").value);
	sms_getAccessorList.setParameters("limit", AMDAR_pageRowCount);
	sms_getAccessorList.setParameters("offset", offset);
	sms_getAccessorList.setParameters("privilege", 9999);	// Todo: 문서고 출입그룹을 9999로 생성 얘정 


	sms_getAccessorList.send();
}

function onAMDAR_btnSearchClick(/* cpr.events.CMouseEvent */ e) {
	var pageIndexer = app.lookup("AMDAR_piAccessorList");
	pageIndexer.currentPageIndex = 1;
	sendAccessorListReq();
}

function onAMDAR_ipbNameKeydown(/* cpr.events.CKeyboardEvent */ e) {
	var aMDAR_ipbName = e.control;
	if (e.keyCode == 13) {
		var pageIndexer = app.lookup("AMDAR_piAccessorList");
		pageIndexer.currentPageIndex = 1;
		sendAccessorListReq();
	}
}

function onAMDAR_piAccessorListClick(/* cpr.events.CMouseEvent */ e) {
	sendAccessorListReq();
}

function onAMDAR_grdAccessorListSelectionChange(/* cpr.events.CSelectionEvent */ e) {

	var grdAccessUserList = app.lookup("AMDAR_grdAccessorList");
	var index = grdAccessUserList.getSelectedRowIndex();
	if (index > - 1) {
		var row = grdAccessUserList.getRow(index);
		if (row) {
			var dmAccessorInfo = app.lookup("AccessorInfo");
			dmAccessorInfo.build(row.getRowData());
			var privilege = row.getValue("AccessPrivilege");
			if (privilege == 0) { privilege = "미등록" } else { privilege = "등록"; }
			app.lookup("AMDAR_opbPrivilege").value = privilege;
			app.lookup("AMDAR.grpAccessorInfo").redraw();
		}
		app.lookup("AMDAR_opbVisitCardManagementNumber").value = "";
		app.lookup("AMDAR_opbVisitCardServiceNumber").value = "";
		AMDAR_cardValidation = 0;
	}
}

function onAMDAR_btnVisitCardScanClick(/* cpr.events.CMouseEvent */ e) {
	app.lookup("AMDAR_opbVisitCardServiceNumber").value = "";
	app.lookup("AMDAR_opbVisitCardManagementNumber").value = "";
	onCardSendClick(AccessCardTypeForeign);
}

function onAMDAR_btnServiceCardScanClick(/* cpr.events.CMouseEvent */ e) {
	app.lookup("AMDAR_opbVisitCardServiceNumber").value = "";
	app.lookup("AMDAR_opbVisitCardManagementNumber").value = "";
	onCardSendClick(AccessCardTypeOtherUnit);
}

function onAMDAR_btnVisitTCardScanClick(/* cpr.events.CMouseEvent */ e){
	app.lookup("AMDAR_opbVisitCardServiceNumber").value = "";
	app.lookup("AMDAR_opbVisitCardManagementNumber").value = "";
	onTerminalCardSendClick(AccessCardTypeForeign);
}

function onAMDAR_btnServiceTCardScanClick(/* cpr.events.CMouseEvent */ e){
	app.lookup("AMDAR_opbVisitCardServiceNumber").value = "";
	app.lookup("AMDAR_opbVisitCardManagementNumber").value = "";
	onTerminalCardSendClick(AccessCardTypeOtherUnit);
}

function onTerminalCardSendClick(target) {
	AMDAR_cardValidation = 0;
	AMDAR_cardTarget = target;
	var grdAccessorList = app.lookup("AMDAR_grdAccessorList");
	var index = grdAccessorList.getSelectedRowIndex();
	if (index < 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "방문자가 선택되지 않았습니다.");
		return;
	}

	var userInfo = grdAccessorList.getRow(index);
	if (userInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "방문자가 선택되지 않았습니다.");
		return;
	}
	var CardSerial = app.lookup("UserCardInfo");
	var appld = "app/custom/rokmch/users/userCardRegist";
		
	app.getRootAppInstance().openDialog(appld, {width: 640,height: 490}, function(dialog) {
		dialog.bind("headerTitle").toLanguage("Str_ARMYHQ_CardScan");
		dialog.initValue = {
			"userID": userInfo.getValue("OwnerID"),
			"UserCardInfo": CardSerial,
			"Mode": "Regist",
			"Url": "/v1"
		};
		dialog.style.header.css("background-color", "#528443");
		dialog.resizable = false;
		dialog.modal = true;
	}).then(function(returnValue) {		
		
		if(returnValue.length>1){
			dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "한 개의 카드를 입력해 주세요.");
			return;
		}
		
		for (var i = 0; i < returnValue.length; i++) {
			CardSerial.addRowData(returnValue[i]);
		}
		var opbCardSerial;
		var CardNum = CardSerial.getValue(0, "CardNum");
		console.log("CardNum : " + CardNum);
		if(AMDAR_cardTarget==AccessCardTypeOtherUnit){ 
			CardSerial.clear();
			opbCardSerial = app.lookup("AMDAR_opbVisitCardServiceNumber");
			opbCardSerial.value = CardNum; 
			opbCardSerial.redraw();	
			var accessCardInfo = app.lookup("AccessCardInfo");
			accessCardInfo.setValue("CardNumber",CardNum);
	
			sendVisitCardListReq(CardNum);		
		} else {
			CardSerial.clear();
			opbCardSerial = app.lookup("AMDAR_opbVisitCardManagementNumber");
			opbCardSerial.value = CardNum; 
			opbCardSerial.redraw();	
			var accessCardInfo = app.lookup("AccessCardInfo");
			accessCardInfo.setValue("CardNumber",CardNum);
	
			sendVisitCardListReq(CardNum);			
		}
	});
	
}


function connectDeviceServer(address) {

	AMDAR_deviceWebSocket = new WebSocket("ws://" + address + "/v1/webEntry");

	AMDAR_deviceWebSocket.onopen = function (message) {
		app.lookup("AMDAR_opbDeviceMsg").value = "카드 리더기 연결 성공";
		console.log("device server ws connected.");
	};

	AMDAR_deviceWebSocket.onclose = function (message) {
		AMDAR_deviceWebSocket = null;
		console.log("Server disconnect...");
	};

	AMDAR_deviceWebSocket.onerror = function (message) {
		console.log("error... " + message);
		var opbMessage = app.lookup("AMDAR_opbDeviceMsg");
		if (opbMessage) {
			opbMessage.value = dataManager.getString("Str_ARMYHQ_PrintServerInstallRequired");
		}
		app.lookup("AMDAR_sniDownloadLink").visible = true;

	};

	AMDAR_deviceWebSocket.onmessage = function (message) {

		var msg = JSON.parse(message.data);
		console.log("onmessage : " + msg.msgId);
		switch (msg.msgId) {
			case WSCmdCardCaptureRes: { // 캡쳐 완료. 결과 수신.
				comLib.hideLoadMask();
				var result = JSON.parse(msg.body);

				if (result.Result == "success") {
					var opbCardSerial;
					if (AMDAR_cardTarget == AccessCardTypeOtherUnit) {
						opbCardSerial = app.lookup("AMDAR_opbVisitCardServiceNumber");
					} else {
						opbCardSerial = app.lookup("AMDAR_opbVisitCardManagementNumber");
					}
					var strCardNum = result.CardNum; // 카드번호 옮겨 담기

					if (dataManager.getSystemBrandType() == BRAND_VRIDI) { // 버디 타입은 8자리 채워준다.
						if (strCardNum.length < 8) {
							strCardNum = StrLib.formattedString("00000000", String(result.CardNum), "left");
						}
					}

					result.CardNum = strCardNum;
					opbCardSerial.value = result.CardNum;
					opbCardSerial.redraw();

					var accessCardInfo = app.lookup("AccessCardInfo");
					accessCardInfo.setValue("CardNumber", result.CardNum);
					sendVisitCardListReq(result.CardNum);

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

function onCardSendClick(target) {
	AMDAR_cardValidation = 0;
	AMDAR_cardTarget = target;
	var grdVisitorList = app.lookup("AMDAR_grdAccessorList");
	var index = grdVisitorList.getSelectedRowIndex();
	if (index < 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "방문자가 선택되지 않았습니다.");
		return;
	}

	var userInfo = grdVisitorList.getRow(index);
	if (userInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "방문자가 선택되지 않았습니다.");
		return;
	}

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
	AMDAR_deviceWebSocket.send(msgData);
}


function onSms_getAccessorListSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {

		var accessorList = app.lookup("AccessorList");
		var count = accessorList.getRowCount();
		for (var i = 0; i < count; i++) {
			var accessor = accessorList.getRow(i);
			accessor.setValue("Birthday", validateDate(accessor.getValue("Birthday"), false));
			accessor.setValue("AccessStart", validateDate(accessor.getValue("AccessStart"), false));
			accessor.setValue("AccessEnd", validateDate(accessor.getValue("AccessEnd"), false));
			accessor.setValue("CreateAt", validateDate(accessor.getValue("CreateAt"), true));

			console.log("Birthday: " + accessor.getValue("Birthday"));
			console.log("AccessStart: " + accessor.getValue("AccessStart"));
			console.log("AccessEnd: " + accessor.getValue("AccessEnd"));
			console.log("CreateAt: " + accessor.getValue("CreateAt"));
		}
		accessorList.commit();

		var pageIndexer = app.lookup("AMDAR_piAccessorList");
		var total = app.lookup("Total").getValue("Count");
		pageIndexer.totalRowCount = total;

	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function sendVisitCardListReq(cardNumber) {
	app.lookup("AccessCardList").clear();

	var sms_getVisitCardList = app.lookup("sms_getVisitCardList");
	sms_getVisitCardList.setParameters("offset", 0);
	sms_getVisitCardList.setParameters("limit", 1);
	sms_getVisitCardList.setParameters("cardNum", cardNumber);

	sms_getVisitCardList.send();
}


function onAMDAR_btnDeleteClick(/* cpr.events.CMouseEvent */ e) {
	var grdAccessorList = app.lookup("AMDAR_grdAccessorList");
	var index = grdAccessorList.getSelectedRowIndex();
	if (index < 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "출입자가 선택되지 않았습니다.");
		return;
	}

	var accessorInfo = grdAccessorList.getRow(index);
	if (accessorInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "출입자가 선택되지 않았습니다.");
		return;
	}

	if (AMDAR_cardValidation == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "카드가 인식되지 않았습니다.");
		return;
	}

	console.log(app.lookup("AccessorInfo").getDatas());
	console.log(app.lookup("AccessCardInfo").getDatas());
	app.lookup("sms_putAccessorPrivilgeRelease").send();
}


function onSms_getVisitCardListSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	AMDAR_cardValidation = 0

	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var accessCardList = app.lookup("AccessCardList");

		if (accessCardList.getRowCount() > 0) { // 출입증 정보를 찾은 경우
			var tagCardInfo = accessCardList.getRow(0);
			var tagCardStatus = tagCardInfo.getValue("CardStatus");

			console.log("AMDAR_cardTarget: " + AMDAR_cardTarget);
			console.log("cardStatus: " + tagCardStatus);

			if (tagCardStatus == AccessCardStatusIssuance) { // 발급이나 회수 상태인 경우 교부 가능
				var tagCardNum = tagCardInfo.getValue("CardNumber");
				var accessorCardNum = app.lookup("AccessorInfo").getValue("CardNumber");

				console.log("tag CardNumber: " + tagCardNum);
				console.log("accessor CardNumber: " + accessorCardNum);

				if (tagCardNum == accessorCardNum) {
					AMDAR_cardValidation = 1
					accessCardList.copyToDataMap(app.lookup("AccessCardInfo"), 0);
				} else {
					dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "해당 사용자의 카드가 아닙니다.");
				}

			} else {
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "교부된 카드가 아닙니다.");
			}
		} else { // 등록된 출입증 정보가 없는 경우.
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "등록된 카드가 아닙니다.");
		}
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_putAccessorPrivilgeReleaseSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), "문서고 출입권한 해제 되었습니다.");
		sendAccessorListReq();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}

}
