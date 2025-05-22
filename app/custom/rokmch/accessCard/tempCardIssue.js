/************************************************
 * accessCardIssue.js
 * Created at 2021. 2. 3. 오후 2:03:52.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var StrLib = cpr.core.Module.require("lib/StrLib");
var comLib;

var AMAAI_deviceWebSocket;
var AMAAI_pageRowCount = 50;

function onBodyLoad(/* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	comLib = createComUtil(app);

	var link = app.lookup("AMAAI_sniDownloadLink");
	link.value = "<a href=\"/setup/AlpetaDevice.exe\" target=\"_blank\">" + dataManager.getString("Str_ARMYHQ_PrintServerDownloadPath") + "</a>";

	app.lookup("AMAAI_opbMessage").value = dataManager.getString("Str_ARMYHQ_DeviceConnectTry");

	// initControls();

	connectDeviceServer("127.0.0.1:9600");

	var tabStorage = localStorage.getItem("tabStorage");
	var cardPrintType = app.lookup("cardPrintType");
	if(tabStorage){
		var tabArr = tabStorage.split(',');
	    if (tabArr) {
	        for (var i = 0; i < tabArr.length; i++) {
	        	cardPrintType.addItem(new cpr.controls.Item(tabArr[i], i+1));
	        }
	    }
	}

	var sms_getAccessCardPrintInfoList = app.lookup("sms_getAccessCardPrintInfoList");
	sms_getAccessCardPrintInfoList.send();

	sendTempCardListReq();
}

function onBodyUnload(/* cpr.events.CEvent */ e) {
	if (AMAAI_deviceWebSocket != null) { AMAAI_deviceWebSocket.close(); AMAAI_deviceWebSocket = null; }
}


function onSubmitError(/* cpr.events.CSubmissionEvent */ e) { app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR); }
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e) { app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT); }

function onSms_getTempCardListSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var accessCardList = app.lookup("AccessCardList");
		var count = accessCardList.getRowCount();
		for (var i = 0; i < count; i++) {
			var accessCard = accessCardList.getRow(i);
			accessCard.setValue("IssueAt", validateDate(accessCard.getValue("IssueAt")));
			accessCard.setValue("RegistAt", validateDate(accessCard.getValue("RegistAt")));
		}
		accessCardList.commit();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	var pageIndexer = app.lookup("AMAAI_piApplication");
	var total = app.lookup("Total").getValue("Count");
	pageIndexer.totalRowCount = total;//total/AMAAI_pageRowCount + (total%AMAAI_pageRowCount>0);

}

function onSms_putTempCardIssueSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Sccess"), "발급이 완료 되었습니다.");
		sendTempCardListReq();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}


function sendTempCardListReq() {
	app.lookup("AccessCardList").clear();
	var pageIndexer = app.lookup("AMAAI_piApplication");
	var curIndex = pageIndexer.currentPageIndex;
	var offset = (curIndex - 1) * AMAAI_pageRowCount

	var sms_getVisitCardList = app.lookup("sms_getTempCardList");
	sms_getVisitCardList.setParameters("offset", offset);
	sms_getVisitCardList.setParameters("limit", AMAAI_pageRowCount);
	sms_getVisitCardList.setParameters("cardType", 100);
	var cardStatus = app.lookup("AMAAI_cmbCardStatus").value;
	if (cardStatus == 0) {
		cardStatus = AccessCardStatusIssueable
	}
	sms_getVisitCardList.setParameters("accessCardStatus", cardStatus);
	sms_getVisitCardList.setParameters("managementNumber", app.lookup("AMAAI_ipbManagementNumber").value);
	sms_getVisitCardList.send();
}

function validateDate(value) {
	if (value == undefined || value == "0001-01-01T00:00:00Z") { return ""; }
	if (value.substring(0, 10) == "0001-01-01") { return; }
	return value.substring(0, 10) + " " + value.substring(11, 19);
}

/* 버튼 클릭 이벤트 */
// 조회 버튼 클릭
function onAMAAI_btnSearchClick(/* cpr.events.CMouseEvent */ e) {
	var pageIndexer = app.lookup("AMAAI_piApplication");
	pageIndexer.currentPageIndex = 1;
	sendTempCardListReq();
}

function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e) {
	if (e.keyCode == 13) {
		var pageIndexer = app.lookup("AMAAI_piApplication");
		pageIndexer.currentPageIndex = 1;
		sendTempCardListReq();
	}
}

function onAMAAI_piApplicationSelectionChange(/* cpr.events.CSelectionEvent */ e) {
	sendTempCardListReq();
}

// 신규등록
function onAMAAI_btnCardRegistClick(/* cpr.events.CMouseEvent */ e) {
	var appld = "app/custom/rokmch/accessCard/tempCardRegist";
	app.openDialog(appld, { width: 500, height: 200 }, function (dialog) {
		dialog.headerTitle = "임시카드 등록";
		dialog.style.header.css("background-color", "#528443");
		dialog.modal = true;
	}).then(function (returnValue) {
		// Todo: 임시 출입증 조회 요청
		sendTempCardListReq();
	});
}

// 인쇄 건너뛰기
function onAMAAI_cbxPrintSkipValueChange(/* cpr.events.CValueChangeEvent */ e) {
	var cbxPrintSkip = e.control;
	var grdVisitCardList = app.lookup("AMAAI_grdTempCardList");
	var index = grdVisitCardList.getSelectedRowIndex();
	if (index < 0) { return; }
	var row = grdVisitCardList.getRow(index);

	if (row) {
		var cardStatus = row.getValue("CardStatus");
		if (cbxPrintSkip.value == "true") { // 인쇄 건너뛰기의 경우. 출력대기도 카드 발급 화면을 표시해준다. 발급인 경우는 재발급의 의미로 표시...
			if (cardStatus == 1 || cardStatus == 2 || cardStatus == 3) {
				app.lookup("AMAAI_grpCardInfo").visible = true;
			} else {
				app.lookup("AMAAI_grpCardInfo").visible = false;
			}
		} else {
			if (cardStatus == 2 || cardStatus == 3) {
				app.lookup("AMAAI_grpCardInfo").visible = true;
			} else {
				app.lookup("AMAAI_grpCardInfo").visible = false;
			}
		}
	}
}

// 임시출입증 목록 선택
function onAMAAI_grdTempCardListSelectionChange(/* cpr.events.CSelectionEvent */ e) {
	var grdTempCardList = e.control;
	var index = grdTempCardList.getSelectedRowIndex();
	if (index < 0) { return; }

	var row = grdTempCardList.getRow(index);
	if (row) {
		var cardStatus = row.getValue("CardStatus"); // 발급대기, 발급(재발급으로 인식)인 경우 카드 발급 가능하도록
		var cbxPrintSkip = app.lookup("AMAAI_cbxPrintSkip").value;
		if (cbxPrintSkip == "true") { // 인쇄 건너뛰기의 경우. 출력대기도 카드 발급 화면을 표시해준다. 발급인 경우는 재발급의 의미로 표시...
			if (cardStatus == 1 || cardStatus == 2 || cardStatus == 3) {
				app.lookup("AMAAI_grpCardInfo").visible = true;
			} else {
				app.lookup("AMAAI_grpCardInfo").visible = false;
			}
		} else {
			if (cardStatus == 2 || cardStatus == 3) {
				app.lookup("AMAAI_grpCardInfo").visible = true;
			} else {
				app.lookup("AMAAI_grpCardInfo").visible = false;
			}
		}

		var acpInfo = app.lookup("AccessCardPrintInfoList").findFirstRow("AccessCardType == 902");
		if (acpInfo) {
			app.lookup("AMAAI_ipbTextFrontTop").value = acpInfo.getValue("TextFrontTop");
			app.lookup("AMAAI_ipbTextFrontCenterBox").value = acpInfo.getValue("TextFrontCenterBox");
			app.lookup("AMAAI_ipbTextFrontBottomBox").value = acpInfo.getValue("TextFrontBottomBox");
			app.lookup("AMAAI_ipbTextFrontBottom").value = acpInfo.getValue("TextFrontBottom");
			app.lookup("AMAAI_ipbTextBackTop").value = acpInfo.getValue("TextBackTop");
		}
	}
	app.lookup("AMAAI_opbCardSerial").value = "";
}

// 인쇄 버튼 클릭
function onAMAAI_btnCardPrintClick(/* cpr.events.CMouseEvent */ e) {
	var grdTempCardList = app.lookup("AMAAI_grdTempCardList");
	var index = grdTempCardList.getSelectedRowIndex();
	if (index < 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "임시출입증이 선택되지 않았습니다.");
		return;
	}

	var cardInfo = grdTempCardList.getRow(index);
	if (cardInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "임시출입증이 선택되지 않았습니다.");
		return;
	}


	var cardStatus = cardInfo.getValue("CardStatus");
	if (cardStatus == AccessCardStatusPrintReady) {
		var visitCardInfo = app.lookup("TempCardInfo");
		visitCardInfo.setValue("CardType", cardInfo.getValue("CardType"));
		visitCardInfo.setValue("ManagementNumber", cardInfo.getValue("ManagementNumber"));
		visitCardInfo.setValue("CardStatus", AccessCardStatusIssueReady);

		var sms_postVisitCardStatus = app.lookup("sms_postTempCardStatus");
		sms_postVisitCardStatus.send();
		cardInfo.setValue("CardStatus", AccessCardStatusIssueReady);
	}

	if (onCardPrintReq() == true) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), "출입증 인쇄정보를 전송했습니다.");
	}

	app.lookup("AMAAI_grpCardInfo").visible = true;

}

// 카드입력 버튼 클릭
function onAMAAI_btnCardScanClick(/* cpr.events.CMouseEvent */ e) {
	var grdTempCardList = app.lookup("AMAAI_grdTempCardList");
	var index = grdTempCardList.getSelectedRowIndex();
	if (index < 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "임시출입증이 선택되지 않았습니다.");
		return;
	}

	var cardInfo = grdTempCardList.getRow(index);
	if (cardInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "임시출입증이 선택되지 않았습니다.");
		return;
	}
	app.lookup("AMAAI_opbCardSerial").value = "";

	var bodyData = {};
	bodyData.UserId = String(cardInfo.getRowData("OwnerID"));
	bodyData.BrandType = "VIRDI";
	bodyData.CardType = "0";
	bodyData.ReadType = "0";
	bodyData.SerialType = "0";

	var msgReq = {
		msgId: String(WSCmdCardCaptureReq),
		body: bodyData
	};

	var msgData = JSON.stringify(msgReq);
	AMAAI_deviceWebSocket.send(msgData);
}

// 단말기선택 버튼 클릭
function onAMAAI_btnCardScanClick2(/* cpr.events.CMouseEvent */ e) {
	var grdTempCardList = app.lookup("AMAAI_grdTempCardList");
	
	var dsAccessCardInfo = app.lookup("UserCardInfo");
	
	var index = grdTempCardList.getSelectedRowIndex();
	if( index < 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
		
	var userInfo = grdTempCardList.getRow(index);
	if (userInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
	
	var appld = "app/custom/rokmch/users/userCardRegist";
	
	app.lookup("AMAAI_opbCardSerial").value = "";
	
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
	});
}


// 발급 버튼 클릭
function onAMAAI_btnCardIssueClick(/* cpr.events.CMouseEvent */ e) {
	var cardSerial = app.lookup("AMAAI_opbCardSerial").value;
	if (cardSerial == undefined || cardSerial.length == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "카드가 인식되지 않았습니다.");
		return;
	}
	var grdTempCardList = app.lookup("AMAAI_grdTempCardList");
	var index = grdTempCardList.getSelectedRowIndex();
	if (index < 0) { return; }

	var cardList = app.lookup("AccessCardList");
	var row = cardList.getRow(index);

	if (row) {
		var visitCardInfo = app.lookup("TempCardInfo");
		visitCardInfo.clear();

		visitCardInfo.setValue("CardType", row.getValue("CardType"));
		visitCardInfo.setValue("ManagementNumber", row.getValue("ManagementNumber"));
		visitCardInfo.setValue("CardStatus", 3);
		visitCardInfo.setValue("CardNumber", cardSerial);

		app.lookup("sms_putTempCardIssue").send();
	}
}

function connectDeviceServer(address) {

	AMAAI_deviceWebSocket = new WebSocket("ws://" + address + "/v1/webEntry");

	AMAAI_deviceWebSocket.onopen = function (message) {
		app.lookup("AMAAI_opbMessage").value = dataManager.getString("Str_ARMYHQ_DeviceConnected");
		console.log("device server ws connected.");
	};

	AMAAI_deviceWebSocket.onclose = function (message) {
		AMAAI_deviceWebSocket = null;
		console.log("Server disconnect...");
	};

	AMAAI_deviceWebSocket.onerror = function (message) {
		console.log("error... " + message);
		var opbMessage = app.lookup("AMAAI_opbMessage");
		if (opbMessage) {
			opbMessage.value = dataManager.getString("Str_ARMYHQ_PrintServerInstallRequired");
		}

		var sniDownloadLink = app.lookup("AMAAI_sniDownloadLink");
		if (sniDownloadLink) {
			sniDownloadLink.visible = true;
		}
	};

	AMAAI_deviceWebSocket.onmessage = function (message) {

		var msg = JSON.parse(message.data);
		console.log("onmessage : " + msg.msgId);
		switch (msg.msgId) {
			case WSCmdCardCaptureRes: { // 캡쳐 완료. 결과 수신.
				comLib.hideLoadMask();
				var result = JSON.parse(msg.body);

				if (result.Result == "success") {
					var opbCardSerial = app.lookup("AMAAI_opbCardSerial");
					var strCardNum = result.CardNum; // 카드번호 옮겨 담기

					if (dataManager.getSystemBrandType() == BRAND_VRIDI) { // 버디 타입은 8자리 채워준다.
						if (strCardNum.length < 8) {
							strCardNum = StrLib.formattedString("00000000", String(result.CardNum), "left");
						}
					}

					result.CardNum = strCardNum;
					opbCardSerial.value = result.CardNum; // 카드 교부 클릭시 컨트롤의 데이터를 사용
					opbCardSerial.redraw();
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

function onCardPrintReq() {
	if (AMAAI_deviceWebSocket == null) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_DeviceConnectFailed"));
		return false;
	}

	// 출입신청 정보 확인
	var grdVisitCardList = app.lookup("AMAAI_grdTempCardList");
	var index = grdVisitCardList.getSelectedRowIndex();
	if (index < 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "임시출입증이 선택되지 않았습니다.");
		return false;
	}

	var row = grdVisitCardList.getRow(index);
	if (row == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "임시출입증이 선택되지 않았습니다.");
		return false;
	}

	// 출입증 종류별 프린트 설정 확인
	var cardType = row.getValue("CardType");
	var managementNumber = row.getValue("ManagementNumber");
	var splitList = managementNumber.split('-');
	if (splitList.length == 2) {
		splitList[0] = splitList[1];
	}
	managementNumber = Number(splitList[0]);

	var accessCardPrintInfoList = app.lookup("AccessCardPrintInfoList");
	var acpInfo = accessCardPrintInfoList.findFirstRow("AccessCardType == " + 902);
	if (acpInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "인쇄환경 설정을 찾을 수 없습니다.");
		return;
	}

	var bodyData = {};
	bodyData.CardType = Number(cardType);
	bodyData.ManagementNumber = Number(managementNumber);

	if (acpInfo.getValue("ImageFront").length != 0) {
		bodyData.ImageFront = acpInfo.getValue("ImageFront");
	}

	if (acpInfo.getValue("ImageBack").length != 0) {
		bodyData.ImageBack = acpInfo.getValue("ImageBack");
	}

	var ipbTextFrontTop = app.lookup("AMAAI_ipbTextFrontTop");
	if (ipbTextFrontTop.value && ipbTextFrontTop.value.length != 0) {
		bodyData.TextFrontTop = ipbTextFrontTop.value;
		bodyData.TextFrontTopColor = app.lookup("AMAAI_cmbTextFrontTopColor").value;
	}

	var ipbTextFrontCenterBox = app.lookup("AMAAI_ipbTextFrontCenterBox");
	if (ipbTextFrontCenterBox.value && ipbTextFrontCenterBox.value.length != 0) {
		bodyData.TextFrontCenterBox = ipbTextFrontCenterBox.value;
		bodyData.TextFrontCenterBoxColor = app.lookup("AMAAI_cmbTextFrontCenterBoxColor").value;
	}

	var ipbTextFrontBottomBox = app.lookup("AMAAI_ipbTextFrontBottomBox");
	if (ipbTextFrontBottomBox.value && ipbTextFrontBottomBox.value.length != 0) {
		bodyData.TextFrontBottomBox = ipbTextFrontBottomBox.value;
		bodyData.TextFrontBottomBoxColor = app.lookup("AMAAI_cmbTextFrontBottomBoxColor").value;
	}

	var ipbTextFrontBottom = app.lookup("AMAAI_ipbTextFrontBottom");
	if (ipbTextFrontBottom.value && ipbTextFrontBottom.value.length != 0) {
		bodyData.TextFrontBottom = ipbTextFrontBottom.value;
		bodyData.TextFrontBottomColor = app.lookup("AMAAI_cmbTextFrontBottomColor").value;
	}

	var ipbTextBackTop = app.lookup("AMAAI_ipbTextBackTop");
	if (ipbTextBackTop.value && ipbTextBackTop.value.length != 0) {
		bodyData.TextBackTop = ipbTextBackTop.value;
		bodyData.TextBackTopColor = app.lookup("AMAAI_cmbTextBackTopColor").value;
	}

	var msgReq = {
		msgId: String(WSCmdCardPrintReq),
		body: bodyData
	};

	var msgData = JSON.stringify(msgReq);
	console.log(msgData);
	AMAAI_deviceWebSocket.send(msgData);

	return true;
}

function onPreviewButtonClick(/* cpr.events.CMouseEvent */ e) {
	var grdVisitCardList = app.lookup("AMAAI_grdTempCardList");
	var index = grdVisitCardList.getSelectedRowIndex();
	if (index < 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "임시출입증이 선택되지 않았습니다.");
		return false;
	}

	var row = grdVisitCardList.getRow(index);
	if (row == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "임시출입증이 선택되지 않았습니다.");
		return false;
	}
	
	var PrintType = app.lookup("cardPrintType");
	if( !PrintType.value ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "인쇄 타입을 선택해 주세요.");
		return false;
	}	
	
	var cardType = row.getValue("CardType");
	var managementNumber = row.getValue("ManagementNumber");
	var accessCardPrintInfoList = app.lookup("AccessCardPrintInfoList");
	var acpInfo = accessCardPrintInfoList.findFirstRow("AccessCardType == '"+902+"'&& PrintType == " + PrintType.value);

	var appld = "app/custom/rokmch/accessCard/accessCardPrintPreview";
	app.openDialog(appld, { width: 560, height: 550 }, function (dialog) {
		dialog.style.header.css("background-color", "#528443");
		dialog.headerTitle = ("출입증 인쇄 미리보기");
		dialog.initValue = {
			"FrontTop": app.lookup("AMAAI_ipbTextFrontTop").value,
			"FrontCenterBox": app.lookup("AMAAI_ipbTextFrontCenterBox").value,
			"FrontBottomBox": app.lookup("AMAAI_ipbTextFrontBottomBox").value,
			"FrontBottom": app.lookup("AMAAI_ipbTextFrontBottom").value,
			"BackTop": app.lookup("AMAAI_ipbTextBackTop").value,
			"FrontTopColor": app.lookup("AMAAI_cmbTextFrontTopColor").value,
			"FrontCenterBoxColor": app.lookup("AMAAI_cmbTextFrontCenterBoxColor").value,
			"FrontBottomBoxColor": app.lookup("AMAAI_cmbTextFrontBottomBoxColor").value,
			"FrontBottomColor": app.lookup("AMAAI_cmbTextFrontBottomColor").value,
			"BackTopColor": app.lookup("AMAAI_cmbTextBackTopColor").value,
			"ImageFront": acpInfo.getValue("ImageFront"),
			"ImageBack": acpInfo.getValue("ImageBack"),
			"managementNumber": managementNumber,
			"PrintType": acpInfo.getValue("PrintType")
		};

		dialog.modal = true;
	}).then(function (returnValue) {
		if (returnValue != null) {
		}
	});
}
