/************************************************
 * accessCardManagement.js
 * Created at 2020. 12. 16. 오후 3:54:38.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var StrLib = cpr.core.Module.require("lib/StrLib");
var comLib;

var AMACI_deviceWebSocket;
var ACMTP_tabIndex = 1;
var ACMTP_tab4Initialize = false;
var ACMTP_templateIndex = 0;

String.prototype.format = function () {
	var theString = this;

	for (var i = 0; i < arguments.length; i++) {
		var regExp = new RegExp('\\{' + i + '\\}', 'gm');
		theString = theString.replace(regExp, arguments[i]);
	}

	return theString;
}

function onBodyLoad(/* cpr.events.CEvent */ e) {

	//console.log(app.getAppProperty("initValue"));
	dataManager = getDataManager();
	comLib = createComUtil(app);

	var link = app.lookup("AMAAI_sniDownloadLink");
	link.value = "<a href=\"/setup/AlpetaDevice.exe\" target=\"_blank\">" + dataManager.getString("Str_ARMYHQ_PrintServerDownloadPath") + "</a>";

	app.lookup("AMAAI_opbMessage").value = dataManager.getString("Str_ARMYHQ_DeviceConnectTry");
	app.lookup("AMACI_opbDeviceMsg").value = dataManager.getString("Str_ARMYHQ_DeviceConnectTry");

	connectDeviceServer("127.0.0.1:9600");

	var cmbUserPosition = app.lookup("AMAAI_grdCmbUserPosition");
	cmbUserPosition.setItemSet(dataManager.getPositionList(), {
		label: "Name",
		value: "PositionID"
	});

	cmbUserPosition.addItem(new cpr.controls.Item("", 0));
	cmbUserPosition.selectItemByValue(0);

	var cmbUserGroup = app.lookup("AMAAI_cmbUserGroup");
	cmbUserGroup.setItemSet(dataManager.getGroup(), {
		label: "Name",
		value: "GroupID"
	});
	cmbUserGroup.addItem(new cpr.controls.Item("------", 0));
	cmbUserGroup.selectItemByValue(0);


	cmbUserGroup = app.lookup("AMAIS_cmbGroup");
	cmbUserGroup.setItemSet(dataManager.getGroup(), {
		label: "Name",
		value: "GroupID"
	});
	cmbUserGroup.addItem(new cpr.controls.Item("------", 0));
	cmbUserGroup.selectItemByValue(0);

	var grdCmbUserGroup = app.lookup("AMAAI_grdCmbUserGroup");
	grdCmbUserGroup.setItemSet(dataManager.getGroup(), {
		label: "Name",
		value: "GroupID"
	});
	grdCmbUserGroup.addItem(new cpr.controls.Item("------", 0));
	grdCmbUserGroup.selectItemByValue(0);


	var cmbGroup = app.lookup("AMACI_cmbGroup");
	cmbGroup.setItemSet(dataManager.getGroup(), {
		label: "Name",
		value: "GroupID"
	});

	app.lookup("AMAAI_cmbExpire").selectItemByValue(0);

	app.lookup("AMAAI_cmbCardStatus").selectItemByValue(1);

	app.lookup("AMAIS_dtiIssueStartAt").value = dateLib.getToday("-");
	app.lookup("AMAIS_dtiIssueEndAt").value = dateLib.getToday("-");

	initControlTab5();

	var sms_getAccessCardPrintInfoList = app.lookup("sms_getAccessCardPrintInfoList");
	sms_getAccessCardPrintInfoList.send();
}

// TAB 5 출입증 회수 UI 초기화
function initControlTab5() {
	var cmbGroup = app.lookup("AMACR_cmbGroup");
	cmbGroup.setItemSet(dataManager.getGroup(), { label: "Name", value: "GroupID" });
	cmbGroup.selectItemByValue(0);

	// 그리드(AMACR_grdPersonnelList) 내 컨트롤	
	cmbGroup = app.lookup("AMACR_cmdGrdPersonnelListGroup");
	cmbGroup.setItemSet(dataManager.getGroup(), { label: "Name", value: "GroupID" });
	cmbGroup.selectItemByValue(0);

	var cmbUserPosition = app.lookup("AMACR_cmdGrdPersonnelListPosition");
	cmbUserPosition.setItemSet(dataManager.getPositionList(), {
		label: "Name",
		value: "PositionID"
	});
}

function onBodyUnload(/* cpr.events.CEvent */ e) {
	if (AMACI_deviceWebSocket != null) {
		AMACI_deviceWebSocket.close();
		AMACI_deviceWebSocket = null;
	}
}

// 공통 --------------------------------------------->
// 탭 변경
function onTabFolderSelectionChange(/* cpr.events.CSelectionEvent */ e) {
	/**	 @type cpr.controls.TabFolder	 */
	var tabFolder = e.control;
	var tabItem = tabFolder.getSelectedTabItem();
	ACMTP_tabIndex = tabItem.id;
	switch (ACMTP_tabIndex) {
		case 4:
			if (ACMTP_tab4Initialize == false) {
				ACMTP_tab4Initialize = true;
				app.lookup("UserAccessApplications").clear();

				var cmdGrdPersonnelListGroup = app.lookup("AMACI_cmdGrdPersonnelListGroup");
				cmdGrdPersonnelListGroup.setItemSet(dataManager.getGroup(), {
					label: "Name",
					value: "GroupID"
				});

				var cmdGrdPersonnelListPosition = app.lookup("AMACI_cmdGrdPersonnelListPosition");
				cmdGrdPersonnelListPosition.setItemSet(dataManager.getPositionList(), {
					label: "Name",
					value: "PositionID"
				});

				var cmbPersonnelInfoUserGroup = app.lookup("AMACI_cmbPersonnelInfoUserGroup");
				cmbPersonnelInfoUserGroup.setItemSet(dataManager.getGroup(), {
					label: "Name",
					value: "GroupID"
				});

				var sms_getAccessApplicationList = app.lookup("sms_getAccessApplicationList");
				sms_getAccessApplicationList.setParameters("accessCardStatus", AccessCardStatusIssueOrRetrive);
				//sms_getAccessApplicationList.setParameters("userType", userType);
				//sms_getAccessApplicationList.setParameters("expire", expire);
				//sms_getAccessApplicationList.setParameters("userName", userName);
				//sms_getAccessApplicationList.setParameters("group", group);

				sms_getAccessApplicationList.send();
			}
			break;
		case 5:
			var sms_getAccessApplicationList = app.lookup("sms_getAccessApplicationList");
			sms_getAccessApplicationList.setParameters("accessCardStatus", AccessCardStatusIssuance);
			sms_getAccessApplicationList.send();
			break;
	}
}

function connectDeviceServer(address) {

	AMACI_deviceWebSocket = new WebSocket("ws://" + address + "/v1/webEntry");

	AMACI_deviceWebSocket.onopen = function (message) {
		app.lookup("AMAAI_opbMessage").value = dataManager.getString("Str_ARMYHQ_DeviceConnected");
		app.lookup("AMACI_opbDeviceMsg").value = dataManager.getString("Str_ARMYHQ_DeviceConnected");

		console.log("device server ws connected.");
	};

	AMACI_deviceWebSocket.onclose = function (message) {
		AMACI_deviceWebSocket = null;
		console.log("Server disconnect...");
	};

	AMACI_deviceWebSocket.onerror = function (message) {
		console.log("error... " + message);
		var opbMessage = app.lookup("AMAAI_opbMessage");
		if (opbMessage) {
			opbMessage.value = dataManager.getString("Str_ARMYHQ_PrintServerInstallRequired");
		}
		opbMessage = app.lookup("AMACI_opbDeviceMsg");
		if (opbMessage) {
			opbMessage.value = dataManager.getString("Str_ARMYHQ_PrintServerInstallRequired");
		}

		var sniDownloadLink = app.lookup("AMAAI_sniDownloadLink");
		if (sniDownloadLink) {
			sniDownloadLink.visible = true;
		}
		var sniDownloadLink = app.lookup("AMACI_sniDownloadLink");
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
					switch (ACMTP_tabIndex) {
						case 4:
							var opbPersonnelInfoCardSerial = app.lookup("AMACI_opbPersonnelInfoCardSerial");
							var strCardNum = result.CardNum; // 카드번호 옮겨 담기

							if (dataManager.getSystemBrandType() == BRAND_VRIDI) { // 버디 타입은 8자리 채워준다.
								if (strCardNum.length < 8) {
									strCardNum = StrLib.formattedString("00000000", String(result.CardNum), "left");
								}
							}

							result.CardNum = strCardNum;
							opbPersonnelInfoCardSerial.value = result.CardNum; // 카드 교부 클릭시 컨트롤의 데이터를 사용
							opbPersonnelInfoCardSerial.redraw();
							break;
						case 5:
							var opbPersonnelInfoCardSerial = app.lookup("AMACR_opbPersonnelInfoCardSerial");
							opbPersonnelInfoCardSerial.value = result.CardNum; // 카드 교부 클릭시 컨트롤의 데이터를 사용
							opbPersonnelInfoCardSerial.redraw();
							break;
					}
				} else if (result.Result == "Capture failed") {
					dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorCardCapture"));
				} else {
					dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), result);
				}

			} break;
			case WSCmdFPCaptureRes: { // 캡쳐 완료. 결과 수신. 

				var result = JSON.parse(msg.body);
				if (ACMTP_templateIndex == 0) {
					app.lookup("AMACI_opbPersonnelInfoFPInfo").text = "확인을 위해 지문을 다시 입력해주세요.";
					ACMTP_templateIndex = 1;
					var dmFPInfo = app.lookup("dmFPInfo");
					dmFPInfo.setValue("Template1", result["FingerData"]);
					onFPCaptureReq();
				} else if (ACMTP_templateIndex == 1) { // 두개의 템플릿에 대해 매칭 시도
					app.lookup("AMACI_opbPersonnelInfoFPInfo").text = "지문 데이터 검증중입니다.";
					var dmFPInfo = app.lookup("dmFPInfo");
					dmFPInfo.setValue("Template2", result["FingerData"]);
					var template_1 = dmFPInfo.getValue("Template1");
					var template_2 = dmFPInfo.getValue("Template2");
					onFPVerifyReq(dmFPInfo.getValue("UserID"), template_1, template_2);
					ACMTP_templateIndex = 0
				}
			} break;

			case WSCmdFPVerifyRes:
				var body = JSON.parse(msg.body);

				if (body.Result == 0) {
					app.lookup("AMACI_opbPersonnelInfoFPInfo").text = "지문 입력 성공";
					var dsUserFpInfo = app.lookup("UserFPInfo");
					dsUserFpInfo.clear();

					var dmFPInfo = app.lookup("dmFPInfo");
					dsUserFpInfo.addRowData({ "FingerID": 1, "MinConvType": 3, "TemplateIndex": 1, "TemplateData": dmFPInfo.getValue("Template1") });
					dsUserFpInfo.addRowData({ "FingerID": 1, "MinConvType": 3, "TemplateIndex": 2, "TemplateData": dmFPInfo.getValue("Template2") });

				} else {
					app.lookup("AMACI_opbPersonnelInfoFPInfo").text = "지문 입력 실패";
				}
				break;

			default: console.log(msg); break;
		}
	}
}

// 출입증 인쇄 정보 가져오기 완료
function onSms_getAccessCardPrintInfoListSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 출입증 인쇄 정보 가져오기 에러
function onSms_getAccessCardPrintInfoListSubmitError(/* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

// 출입증 인쇄 정보 가져오기 타임아웃
function onSms_getAccessCardPrintInfoListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

// 공통 ---------------------------------------------!

// TAB 1 출입증 발급 --------------------------------------------->
// 검색 버튼 클릭
function onAMAAI_btnSearchClick(/* cpr.events.CMouseEvent */ e) {
	app.lookup("UserAccessApplications").clear();

	var accessCardStatus = app.lookup("AMAAI_cmbCardStatus").value;
	var userType = app.lookup("AMAAI_cmbUserType").value;
	var expire = app.lookup("AMAAI_cmbExpire").value;
	var userName = app.lookup("AMAAI_ipbUserName").value;
	var group = app.lookup("AMAAI_cmbUserGroup").value;

	var sms_getAccessApplicationList = app.lookup("sms_getAccessApplicationList");
	sms_getAccessApplicationList.setParameters("accessCardStatus", accessCardStatus);
	sms_getAccessApplicationList.setParameters("userType", userType);
	sms_getAccessApplicationList.setParameters("expire", expire);
	sms_getAccessApplicationList.setParameters("userName", userName);
	sms_getAccessApplicationList.setParameters("group", group);

	sms_getAccessApplicationList.send();
}

// 출입자 목록 가져오기 완료
function onSms_getAccessApplicationListSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		if (app.lookup("UserAccessApplications").getRowCount() == 0) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_NoSearchResult"));
		}
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 출입자 목록 가져오기 에러
function onSms_getAccessApplicationListSubmitError(/* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

// 출입자 목록 가져오기 타임아웃
function onSms_getAccessApplicationListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

// 출입자 목록 선택시
function onAMAAI_grdAccessUserListSelectionChange(/* cpr.events.CSelectionEvent */ e) {
	var grdAccessUserList = app.lookup("AMAAI_grdAccessUserList");
	var index = grdAccessUserList.getSelectedRowIndex();
	if (index > - 1) {
		var row = grdAccessUserList.getRow(index);
		if (row) {
			var cardType = row.getValue("UserType");
			var accessCardPrintInfoList = app.lookup("AccessCardPrintInfoList");
			var acpInfo = accessCardPrintInfoList.findFirstRow("AccessCardType == " + cardType);
			if (acpInfo) {
				app.lookup("AMAAI_ipbTextFrontTop").value = acpInfo.getValue("TextFrontTop");
				app.lookup("AMAAI_ipbTextFrontCenterBox").value = acpInfo.getValue("TextFrontCenterBox");
				app.lookup("AMAAI_ipbTextFrontBottomBox").value = acpInfo.getValue("TextFrontBottomBox");
				app.lookup("AMAAI_ipbTextFrontBottom").value = acpInfo.getValue("TextFrontBottom");
				app.lookup("AMAAI_ipbTextBackTop").value = acpInfo.getValue("TextBackTop");
			}
		}
	}
}

// 카드 발급 버튼 클릭
function onAMAAI_btnCardIssueClick(/* cpr.events.CMouseEvent */ e) {
	var aMAAI_btnCardIssue = e.control;

	var grdAccessApplicationList = app.lookup("AMAAI_grdAccessUserList");
	var index = grdAccessApplicationList.getSelectedRowIndex();
	if (index < 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}

	var accessApplicationInfo = grdAccessApplicationList.getRow(index);
	if (accessApplicationInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}


	var userType = accessApplicationInfo.getValue("UserType");
	var cardType = 0;
	var accessCardInfo = app.lookup("AccessCardInfo");
	accessCardInfo.clear();

	accessCardInfo.setValue("CardType", userType);
	accessCardInfo.setValue("OwnerID", accessApplicationInfo.getValue("UserID"));
	accessCardInfo.setValue("OwnerServiceNumber", accessApplicationInfo.getValue("ServiceNumber"));
	accessCardInfo.setValue("OwnerBirthday", accessApplicationInfo.getValue("Birthday"));

	var dmAccessApplicationInfo = app.lookup("dmAccessApplicationInfo");
	dmAccessApplicationInfo.clear();
	dmAccessApplicationInfo.setValue("ApplicationIndex", accessApplicationInfo.getValue("ApplicationIndex"));

	console.log(dmAccessApplicationInfo.getDatas());
	var sms_postAccessCardIssue = app.lookup("sms_postAccessCardIssue");
	sms_postAccessCardIssue.send();
}

// 출입증 완료
function onSms_postAccessCardIssueSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		//onCardPrintReq();
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_ARMY_AccessCardIssued"));
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 출입증 발급 에러
function onSms_postAccessCardIssueSubmitError(/* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

// 출입증 발급 타임아웃
function onSms_postAccessCardIssueSubmitTimeout(/* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onCardPrintReq() {
	if (AMACI_deviceWebSocket == null) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_DeviceConnectFailed"));
		return;
	}

	// 출입신청 정보 확인
	var grdAccessUserList = app.lookup("AMAAI_grdAccessUserList");
	var index = grdAccessUserList.getSelectedRowIndex();
	if (index < 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}

	var row = grdAccessUserList.getRow(index);
	if (row == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}

	// 출입증 종류별 프린트 설정 확인
	// 부서,군번,성명,사진,가족
	var cardType = row.getValue("UserType");
	var accessCardPrintInfoList = app.lookup("AccessCardPrintInfoList");
	var acpInfo = accessCardPrintInfoList.findFirstRow("AccessCardType == " + cardType);
	if (acpInfo) {
		/*
		app.lookup("AMAAI_ipbTextFrontTop").value = acpInfo.getValue("TextFrontTop");				
		app.lookup("AMAAI_ipbTextFrontCenterBox").value = acpInfo.getValue("TextFrontCenterBox");
		app.lookup("AMAAI_ipbTextFrontBottomBox").value = acpInfo.getValue("TextFrontBottomBox");
		app.lookup("AMAAI_ipbTextFrontBottom").value = acpInfo.getValue("TextFrontBottom");
		app.lookup("AMAAI_ipbTextBackTop").value = acpInfo.getValue("TextBackTop");
		* */
	}

	var bodyData = {};
	/* 앞면상단텍스트,색상,앞면중앙박스텍스트,색상,앞면하단박스테스트,색상,앞면하단텍스트,색상,뒷면상단텍스트,색상*/
	if (acpInfo.getValue("GroupPrint") == 1) {
		bodyData.Group = dataManager.getGroupName(row.getValue("GroupCode"));
	}
	if (acpInfo.getValue("ServiceNumberPrint") == 1) {
		bodyData.ServiceNumber = row.getValue("ServiceNumber");
		if (bodyData.ServiceNumber == undefined || bodyData.ServiceNumber.length == 0) {
			bodyData.ServiceNumber = row.getValue("Birthday");
		}
	}
	if (acpInfo.getValue("NamePrint") == 1) {
		bodyData.Name = row.getValue("Name");
	}
	if (acpInfo.getValue("PhotoPrint") == 1) {
		bodyData.UserPicture = row.getValue("UserPicture");
	}
	if (cardType == UserPrivArmyFamily && acpInfo.getValue("FamilyPrint") == 1) { // 군가족인 경우
		bodyData.FamilyRelation = row.getValue("FamilyRelation");
	}

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
	AMACI_deviceWebSocket.send(msgData);
}

// 출입증 발급 ---------------------------------------------!
// TAB 2 출입증인쇄 환경 설정 --------------------------------------------->

// 출입증 목록 선택시
function onACCPS_grdAccessCardListSelectionChange(/* cpr.events.CSelectionEvent */ e) {
	/** @type cpr.controls.Grid	 */
	var aCCPS_grdAccessCardList = e.control;
	var index = aCCPS_grdAccessCardList.getSelectedRowIndex();
	if (index > -1) {
		var accessCardPrintInfoList = app.lookup("AccessCardPrintInfoList");

		var acpInfo = accessCardPrintInfoList.getRow(index);
		app.lookup("ACCPS_nabGroupPrint").value = acpInfo.getValue("GroupPrint");
		app.lookup("ACCPS_nabServiceNamePrint").value = acpInfo.getValue("ServiceNumberPrint");
		app.lookup("ACCPS_nabNamePrint").value = acpInfo.getValue("NamePrint");
		app.lookup("ACCPS_nabPhotoPrint").value = acpInfo.getValue("PhotoPrint");
		app.lookup("ACCPS_nabFamilyPrint").value = acpInfo.getValue("FamilyPrint");
		var grpAccessCardFront = app.lookup("ACCPS_grpAccessCardFront");
		var imageData = acpInfo.getValue("ImageFront")
		if (imageData && imageData.length > 0) {
			grpAccessCardFront.style.css({
				"background-image": 'url(data:image/png;base64,' + imageData + ')',
				"background-repeat": "none",
				"background-position": "center",
				"background-size": "cover"
			});
		} else {
			grpAccessCardFront.style.css({
				"background-image": '',
			});
		}

		var grpAccessCardBack = app.lookup("ACCPS_grpAccessCardBack");
		var imageData = acpInfo.getValue("ImageBack")
		if (imageData && imageData.length > 0) {
			grpAccessCardBack.style.css({
				"background-image": 'url(data:image/png;base64,' + imageData + ')',
				"background-repeat": "none",
				"background-position": "center",
				"background-size": "cover"
			});
		} else {
			grpAccessCardBack.style.css({
				"background-image": '',
			});
		}
		app.lookup("ACCPS_txaPrintTextFrontTop").value = acpInfo.getValue("TextFrontTop");
		app.lookup("ACCPS_txaPrintTextFrontCenterBox").value = acpInfo.getValue("TextFrontCenterBox");
		app.lookup("ACCPS_txaPrintTextFrontBottomBox").value = acpInfo.getValue("TextFrontBottomBox");
		app.lookup("ACCPS_txaPrintTextFrontBottom").value = acpInfo.getValue("TextFrontBottom");
		app.lookup("ACCPS_ipbPrintTextBackTop").value = acpInfo.getValue("TextBackTop");
	}
}

function onACCPS_grdAccessCardListBeforeSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/** @type cpr.controls.Grid	 */
	var aCCPS_grdAccessCardList = e.control;
	if (e.oldSelection != null) {
		var grdAccessCardList = app.lookup("ACCPS_grdAccessCardList");
		var index = e.oldSelection[0];

		var acpInfo = grdAccessCardList.getRow(index);
		if (acpInfo) {
			var accessCardPrintInfoList = app.lookup("AccessCardPrintInfoList");
			var acpInfo = accessCardPrintInfoList.getRow(index);
			acpInfo.setValue("GroupPrint", app.lookup("ACCPS_nabGroupPrint").value);
			acpInfo.setValue("ServiceNumberPrint", app.lookup("ACCPS_nabServiceNamePrint").value);
			acpInfo.setValue("NamePrint", app.lookup("ACCPS_nabNamePrint").value);
			acpInfo.setValue("PhotoPrint", app.lookup("ACCPS_nabPhotoPrint").value);
			acpInfo.setValue("FamilyPrint", app.lookup("ACCPS_nabFamilyPrint").value);

			acpInfo.setValue("TextFrontTop", app.lookup("ACCPS_txaPrintTextFrontTop").value);
			acpInfo.setValue("TextFrontCenterBox", app.lookup("ACCPS_txaPrintTextFrontCenterBox").value);
			acpInfo.setValue("TextFrontBottomBox", app.lookup("ACCPS_txaPrintTextFrontBottomBox").value);
			acpInfo.setValue("TextFrontBottom", app.lookup("ACCPS_txaPrintTextFrontBottom").value);
			acpInfo.setValue("TextBackTop", app.lookup("ACCPS_ipbPrintTextBackTop").value);

		}
	}
}
function valueChanged(ctrl, column, value) {
	var index = ctrl.getSelectedRowIndex();
	if (index > - 1) {
		var accessCardPrintInfoList = app.lookup("AccessCardPrintInfoList");
		var acpInfo = accessCardPrintInfoList.getRow(index);
		acpInfo.setValue(column, value);
	}
}

// 그룹 출력 옵션 수정
function onACCPS_nabGroupPrintSelectionChange(/* cpr.events.CSelectionEvent */ e) {
	/** @type cpr.controls.NavigationBar	 */
	var aCCPS_nabGroupPrint = e.control;
	var ctrl = app.lookup("ACCPS_grdAccessCardList");
	valueChanged(ctrl, "GroupPrint", aCCPS_nabGroupPrint.value);
}

// 군번 출력 옵션 수정
function onACCPS_nabServiceNamePrintSelectionChange(/* cpr.events.CSelectionEvent */ e) {
	/** @type cpr.controls.NavigationBar	 */
	var aCCPS_nabServiceNamePrint = e.control;
	var ctrl = app.lookup("ACCPS_grdAccessCardList");
	valueChanged(ctrl, "ServiceNamePrint", aCCPS_nabServiceNamePrint.value);
}

// 성별 출력 옵션 수정
function onACCPS_nabNamePrintSelectionChange(/* cpr.events.CSelectionEvent */ e) {
	/** @type cpr.controls.NavigationBar	 */
	var aCCPS_nabNamePrint = e.control;
	var ctrl = app.lookup("ACCPS_grdAccessCardList");
	valueChanged(ctrl, "NamePrint", aCCPS_nabNamePrint.value);
}

// 사진 출력 옵션 수정
function onACCPS_nabPhotoPrintSelectionChange(/* cpr.events.CSelectionEvent */ e) {
	/** @type cpr.controls.NavigationBar	 */
	var aCCPS_nabPhotoPrint = e.control;
	var ctrl = app.lookup("ACCPS_grdAccessCardList");
	valueChanged(ctrl, "PhotoPrint", aCCPS_nabPhotoPrint.value);
}

// 가족 출력 옵션 수정
function onACCPS_nabFamilyPrintSelectionChange(/* cpr.events.CSelectionEvent */ e) {
	/** @type cpr.controls.NavigationBar	 */
	var aCCPS_nabFamilyPrint = e.control;
	var ctrl = app.lookup("ACCPS_grdAccessCardList");
	valueChanged(ctrl, "PhotoPrint", aCCPS_nabFamilyPrint.value);
}

function displayImage(fileCtrl, desCtrl, columnName) {
	var reader = new FileReader();
	reader.readAsDataURL(fileCtrl.files[0]);

	reader.onload = function () {
		var tempImage = new Image();
		tempImage.src = reader.result;
		tempImage.onload = function () {
			var canvas = document.createElement('canvas');
			var canvasContext = canvas.getContext("2d");
			//canvas.width = tempImage.width; 
			//canvas.height = tempImage.height;    	
			canvas.width = 660;
			canvas.height = 1024;
			canvasContext.drawImage(this, 0, 0, tempImage.width, tempImage.height, 0, 0, canvas.width, canvas.height);

			var imageData = canvas.toDataURL("image/jpeg");
			desCtrl.style.css({
				"background-image": 'url(' + imageData + ')',
				"background-repeat": "none",
				"background-position": "center",
				"background-size": "cover"
			});
			var grdAccessCardList = app.lookup("ACCPS_grdAccessCardList");
			var index = grdAccessCardList.getSelectedRowIndex();
			if (index > -1) {
				var imageData = imageData.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
				var accessCardPrintInfoList = app.lookup("AccessCardPrintInfoList");
				var acpInfo = accessCardPrintInfoList.getRow(index);
				acpInfo.setValue(columnName, imageData);
			}

			desCtrl.redraw();
		}
	};
}

// 앞면 이미지 선택 클릭
function onACCPS_btnFrontImageClick(/* cpr.events.CMouseEvent */ e) {
	var pictureFile = app.lookup("ACCPS_fiFrontImage");
	pictureFile.openFileChooser();
}

// 앞면 이미지 변경 이벤트
function onACCPS_fiFrontImageValueChange(/* cpr.events.CValueChangeEvent */ e) {
	var pictureFile = app.lookup("ACCPS_fiFrontImage");
	var grpAccessCardFront = app.lookup("ACCPS_grpAccessCardFront");
	displayImage(pictureFile, grpAccessCardFront, "ImageFront");
}

// 뒷면 이미지 선택 클릭
function onACCPS_btnBackImageClick(/* cpr.events.CMouseEvent */ e) {
	var pictureFile = app.lookup("ACCPS_fiBacktImage");
	pictureFile.openFileChooser();
}

// 뒷면 이미지 변경 이벤트
function onACCPS_fiBacktImageValueChange(/* cpr.events.CValueChangeEvent */ e) {
	var pictureFile = app.lookup("ACCPS_fiBacktImage");
	var grpAccessCardFront = app.lookup("ACCPS_grpAccessCardBack");
	displayImage(pictureFile, grpAccessCardFront, "ImageBack");
}
// 출입증인쇄 환경설정 저장 클릭
function onACCPS_btnSavePrintSettingClick(/* cpr.events.CMouseEvent */ e) {
	var grdAccessCardList = app.lookup("ACCPS_grdAccessCardList");
	var row = grdAccessCardList.getSelectedRow();
	if (row) {
		var accessCardPrintInfoList = app.lookup("AccessCardPrintInfoList");
		var acpInfo = accessCardPrintInfoList.getRow(row.getIndex());
		if (acpInfo) {
			acpInfo.setValue("GroupPrint", app.lookup("ACCPS_nabGroupPrint").value);
			acpInfo.setValue("ServiceNumberPrint", app.lookup("ACCPS_nabServiceNamePrint").value);
			acpInfo.setValue("NamePrint", app.lookup("ACCPS_nabNamePrint").value);
			acpInfo.setValue("PhotoPrint", app.lookup("ACCPS_nabPhotoPrint").value);
			acpInfo.setValue("FamilyPrint", app.lookup("ACCPS_nabFamilyPrint").value);

			acpInfo.setValue("TextFrontTop", app.lookup("ACCPS_txaPrintTextFrontTop").value);
			acpInfo.setValue("TextFrontCenterBox", app.lookup("ACCPS_txaPrintTextFrontCenterBox").value);
			acpInfo.setValue("TextFrontBottomBox", app.lookup("ACCPS_txaPrintTextFrontBottomBox").value);
			acpInfo.setValue("TextFrontBottom", app.lookup("ACCPS_txaPrintTextFrontBottom").value);
			acpInfo.setValue("TextBackTop", app.lookup("ACCPS_ipbPrintTextBackTop").value);
		}
	}


	var sms_putAccessCardPrintInfo = app.lookup("sms_putAccessCardPrintInfo");
	sms_putAccessCardPrintInfo.send();
}

// 출입증인쇄 설정 저장 완료
function onSms_putAccessCardPrintInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Saved"));
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 출입증인쇄 설정 저장 에러
function onSms_putAccessCardPrintInfoSubmitError(/* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

// 출입증인쇄 설정 저장 타임아웃
function onSms_putAccessCardPrintInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
// 출입증인쇄 환경 설정 ---------------------------------------------!

// TAB 3 : 출입증 발급 현황 --------------------------------------------->
// 출입증 발급 현황 검색
function onAMAIS_btnCardIssueStatusSearchClick(/* cpr.events.CMouseEvent */ e) {

	app.lookup("AccessCardList").clear();

	var startAt = app.lookup("AMAIS_dtiIssueStartAt").value;
	var endAt = app.lookup("AMAIS_dtiIssueEndAt").value;
	var cardType = app.lookup("AMAIS_cmbAccessCardType").value;
	var cardStatus = app.lookup("AMAIS_cmbAccessCardStatus").value;
	var group = app.lookup("AMAIS_cmbGroup").value;
	var managementNumber = app.lookup("AMAIS_ipbManagementNumber").value;

	var sms_getAccessCardInfoList = app.lookup("sms_getAccessCardInfoList");
	sms_getAccessCardInfoList.setParameters("startAt", startAt);
	sms_getAccessCardInfoList.setParameters("endAt", endAt);
	sms_getAccessCardInfoList.setParameters("cardType", cardType);
	sms_getAccessCardInfoList.setParameters("accessCardStatus", cardStatus);
	sms_getAccessCardInfoList.setParameters("group", group);
	sms_getAccessCardInfoList.setParameters("managementNumber", managementNumber);
	sms_getAccessCardInfoList.setParameters("limit", 10000);
	sms_getAccessCardInfoList.setParameters("offset", 0);
	sms_getAccessCardInfoList.send();
}

// 출입증 발급 현황 리스트 가져오기 완료
function onSms_getAccessCardUserInfoListSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		if (app.lookup("AccessCardUserInfoList").getRowCount() == 0) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_NoSearchResult"));
		}
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 출입증 발급 현황 리스트 가져오기 에러
function onSms_getAccessCardUserInfoListSubmitError(/* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

// 출입증 발급 현황 리스트 가져오기 타임아웃
function onSms_getAccessCardUserInfoListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

// 출입증 발급 현황 ---------------------------------------------!

// TAB 4 : 출입증 교부 --------------------------------------------->

function clearPersonnelDetail() {
	app.lookup("AMACI_cmbPersonnelInfoUserType").value = "";
	app.lookup("AMACI_opbPersonnelInfoName").value = "";
	app.lookup("AMACI_opbPersonnelInfoServiceNumber").value = "";
	app.lookup("AMACI_cmbPersonnelInfoPosition").value = "";
	app.lookup("AMACI_cmbPersonnelInfoUserGroup").value = "";

	app.lookup("AMACI_opbPersonnelInfoAccessStart").value = "";
	app.lookup("AMACI_opbPersonnelInfoAccessEnd").value = "";

	app.lookup("AMACI_cmbPersonnelInfoAccessCardType").value = "";
	app.lookup("AMACI_opbPersonnelInfoManagementNumber").value = "";

	app.lookup("AMACI_opbPersonnelInfoCardSerial").value = "";
	app.lookup("AMACI_opbPersonnelInfoFPInfo").value = "";
}
// 출입자 교부 클릭
function onAMACI_btnPersonnelListSearchClick(/* cpr.events.CMouseEvent */ e) {

	var userName = app.lookup("AMACI_ipbName").value;
	if (userName != null && userName.length == 1) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_SearchNameLengthInvalid"));
		return;
	}

	clearPersonnelDetail();
	app.lookup("AccessCardUserInfoList").clear();

	var userType = app.lookup("AMACI_cmbUserType").value;
	var group = app.lookup("AMACI_cmbGroup").value;

	var sms_getAccessCardUserInfoList = app.lookup("sms_getAccessCardUserInfoList");

	sms_getAccessCardUserInfoList.setParameters("accessCardStatus", AccessCardStatusIssueOrRetrive);
	sms_getAccessCardUserInfoList.setParameters("userType", userType);
	sms_getAccessCardUserInfoList.setParameters("userName", userName);
	sms_getAccessCardUserInfoList.setParameters("group", group);

	sms_getAccessCardUserInfoList.send();
}

// 출입자 목록에서 출입자 선택시

function onAMACI_grdPersonnelListSelectionChange(/* cpr.events.CSelectionEvent */ e) {
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
				app.lookup("AMACI_cmbPersonnelInfoUserType").value = aaInfo.getValue("UserType");
				app.lookup("AMACI_opbPersonnelInfoName").value = aaInfo.getValue("Name");
				var serviceNumber = aaInfo.getValue("ServiceNumber");
				if (serviceNumber.length == 0) { serviceNumber = aaInfo.getValue("Birthday"); }
				app.lookup("AMACI_opbPersonnelInfoServiceNumber").value = serviceNumber;
				app.lookup("AMACI_cmbPersonnelInfoPosition").value = aaInfo.getValue("Position");
				app.lookup("AMACI_cmbPersonnelInfoUserGroup").value = aaInfo.getValue("GroupCode");

				var startAt = aaInfo.getValue("AccessStart");
				if (startAt.length > 10) { startAt = startAt.substring(0, 10); }
				app.lookup("AMACI_opbPersonnelInfoAccessStart").value = startAt;
				var endAt = aaInfo.getValue("AccessEnd");
				if (endAt.length > 10) { endAt = endAt.substring(0, 10); }
				app.lookup("AMACI_opbPersonnelInfoAccessEnd").value = endAt;

				app.lookup("AMACI_cmbPersonnelInfoAccessCardType").value = row.getValue("CardType");
				app.lookup("AMACI_opbPersonnelInfoManagementNumber").value = row.getValue("ManagementNumber");
			}
		}
		app.lookup("AMACI_opbPersonnelInfoCardSerial").value = "";
		app.lookup("AMACI_opbPersonnelInfoFPInfo").value = "";

		var dsUserFpInfo = app.lookup("UserFPInfo");
		dsUserFpInfo.clear();
		var dmUserFpInfo = app.lookup("dmFPInfo");
		dmUserFpInfo.clear();
	}
}

// 카드입력 버튼 클릭
function onAMACI_btnCardScanClick(/* cpr.events.CMouseEvent */ e) {

	var grdPersonnelList = app.lookup("AMACI_grdPersonnelList");
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
	app.lookup("AMACI_opbPersonnelInfoCardSerial").value = "";

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

// 지문 입력 버튼 클릭
function onAMACI_btnFPScanClick(/* cpr.events.CMouseEvent */ e) {

	if (AMACI_deviceWebSocket == null) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_HamsterNotFound"));
		return;
	}

	var grdPersonnelList = app.lookup("AMACI_grdPersonnelList");
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

	app.lookup("AMACI_opbPersonnelInfoFPInfo").text = "지문을 입력해주세요.";

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
	AMACI_deviceWebSocket.send(msgData);
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
	AMACI_deviceWebSocket.send(msgData);
}

// 지문 삭제 클릭
function onAMACI_btnFPDeleteClick(/* cpr.events.CMouseEvent */ e) {
	var dmFPInfo = app.lookup("dmFPInfo");
	dmFPInfo.clear();
	app.lookup("AMACI_opbPersonnelInfoFPInfo").text = "";

}

// 교부 클릭
function onAMACI_btnIssuanceClick(/* cpr.events.CMouseEvent */ e) {
	var grdPersonnelList = app.lookup("AMACI_grdPersonnelList");
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

	var cardNum = app.lookup("AMACI_opbPersonnelInfoCardSerial").value;
	if (cardNum == null || cardNum.length < 1) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_CardSeriaNotValid"));
		return;
	}

	var accessCardInfo = app.lookup("AccessCardInfo");
	accessCardInfo.setValue("CardNumber", cardNum);
	accessCardInfo.setValue("ApplicationIndex", userInfo.getValue("ApplicationIndex"));
	accessCardInfo.setValue("OwnerID", userInfo.getValue("OwnerID"));

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

// 출입증 교부 에러
function onSms_postAccessCardIssuanceSubmitError(/* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

// 출입증 교부 타임아웃
function onSms_postAccessCardIssuanceSubmitTimeout(/* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

// TAB 4 : 출입증 교부 ---------------------------------------------~

// TAB 5 : 출입증 교부 --------------------------------------------->

function clearPersonnelDetailTab5() {
	app.lookup("AMACR_cmbPersonnelInfoUserType").value = "";
	app.lookup("AMACR_opbPersonnelInfoName").value = "";
	app.lookup("AMACR_opbPersonnelInfoServiceNumber").value = "";
	app.lookup("AMACR_cmbPersonnelInfoPosition").value = "";
	app.lookup("AMACR_cmbPersonnelInfoUserGroup").value = "";

	app.lookup("AMACR_opbPersonnelInfoAccessStart").value = "";
	app.lookup("AMACR_opbPersonnelInfoAccessEnd").value = "";

	app.lookup("AMACR_cmbPersonnelInfoAccessCardType").value = "";
	app.lookup("AMACR_opbPersonnelInfoManagementNumber").value = "";

	app.lookup("AMACR_opbPersonnelInfoCardSerial").value = "";
}
// 출입증 교부 출입자 목록 가져오기
function onAMACR_btnPersonnelListSearchClick(/* cpr.events.CMouseEvent */ e) {
	sendSmsAccessCardIssuanceUserInfoList()
}

function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e) {
	if (e.keyCode == 13) {
		sendSmsAccessCardIssuanceUserInfoList();
	}
}

function sendSmsAccessCardIssuanceUserInfoList() {
	var userName = app.lookup("AMACR_ipbName").value;
	if (userName != null && userName.length == 1) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_SearchNameLengthInvalid"));
		return;
	}

	clearPersonnelDetailTab5();
	var dsAccessCardUserInfoList = app.lookup("AccessCardUserInfoListTab5");
	dsAccessCardUserInfoList.clear();

	var userType = app.lookup("AMACR_cmpUserType").value;
	var group = app.lookup("AMACR_cmbGroup").value;

	var sms_getAccessCardUserInfoList = new cpr.protocols.Submission("sms_getAccessCardIssuanceUserInfoList"); // 교부된 출입증 요청
	sms_getAccessCardUserInfoList.action = "/v1/armyhq/accessCards/userInfo";
	sms_getAccessCardUserInfoList.method = "get";

	sms_getAccessCardUserInfoList.setParameters("accessCardStatus", AccessCardStatusIssuance);
	sms_getAccessCardUserInfoList.setParameters("userType", userType);
	sms_getAccessCardUserInfoList.setParameters("userName", userName);
	sms_getAccessCardUserInfoList.setParameters("group", group);

	sms_getAccessCardUserInfoList.addResponseData(app.lookup("Result"));
	sms_getAccessCardUserInfoList.addResponseData(dsAccessCardUserInfoList, false, "AccessCardUserInfoList");

	sms_getAccessCardUserInfoList.addEventListenerOnce("submit-done", onSms_getAccessCardIssuanceUserListSubmitDone);
	sms_getAccessCardUserInfoList.addEventListenerOnce("submit-error", onSms_getAccessCardIssuanceUserListSubmitError);
	sms_getAccessCardUserInfoList.addEventListenerOnce("submit-timeout", onSms_getAccessCardIssuanceUserListSubmitTimeout);

	sms_getAccessCardUserInfoList.send();
}
// 출입증 교부 사용자 리스트 가져오기 완료
function onSms_getAccessCardIssuanceUserListSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 출입증 교부 사용자 리스트 가져오기 에러
function onSms_getAccessCardIssuanceUserListSubmitError(/* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

// 출입증 교부 사용자 리스트 가져오기 타임아웃
function onSms_getAccessCardIssuanceUserListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

// 출입증 교부 사용자 리스트 클릭
function onAMACR_grdPersonnelListSelectionChange(/* cpr.events.CSelectionEvent */ e) {
	/** @type cpr.controls.Grid	 */
	var grdPersonnelList = e.control;
	var index = grdPersonnelList.getSelectedRowIndex();
	if (index > - 1) {
		var row = grdPersonnelList.getRow(index);
		if (row) {
			console.log(row.getRowData());
			var applicationIndex = row.getValue("ApplicationIndex");
			var accessCardInfo = app.lookup("AccessCardInfo");
			var accessApplication = app.lookup("UserAccessApplications");
			console.log(accessApplication.getRowDataRanged());
			var aaInfo = accessApplication.findFirstRow("ApplicationIndex == " + applicationIndex);
			if (aaInfo) {
				app.lookup("AMACR_cmbPersonnelInfoUserType").value = aaInfo.getValue("UserType");
				app.lookup("AMACR_opbPersonnelInfoName").value = aaInfo.getValue("Name");
				var serviceNumber = aaInfo.getValue("ServiceNumber");
				if (serviceNumber.length == 0) { serviceNumber = aaInfo.getValue("Birthday"); }
				app.lookup("AMACR_opbPersonnelInfoServiceNumber").value = serviceNumber;
				app.lookup("AMACR_cmbPersonnelInfoPosition").value = aaInfo.getValue("Position");
				app.lookup("AMACR_cmbPersonnelInfoUserGroup").value = aaInfo.getValue("GroupCode");

				var startAt = aaInfo.getValue("AccessStart");
				if (startAt.length > 10) { startAt = startAt.substring(0, 10); }
				app.lookup("AMACR_opbPersonnelInfoAccessStart").value = startAt;
				var endAt = aaInfo.getValue("AccessEnd");
				if (endAt.length > 10) { endAt = endAt.substring(0, 10); }
				app.lookup("AMACR_opbPersonnelInfoAccessEnd").value = endAt;

				app.lookup("AMACR_cmbPersonnelInfoAccessCardType").value = row.getValue("CardType");
				app.lookup("AMACR_opbPersonnelInfoManagementNumber").value = row.getValue("ManagementNumber");
			}
		}
		app.lookup("AMACR_opbPersonnelInfoCardSerial").value = "";
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
	AMACI_deviceWebSocket.send(msgData);

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

	accessCardInfo.setValue("ApplicationIndex", applicationIndex);
	accessCardInfo.setValue("CardNumber", cardNum);
	accessCardInfo.setValue("OwnerID", accessApplicationInfo.getValue("OwnerID"));
	accessCardInfo.setValue("Description", desc);

	var sms_postAccessCardRetrive = app.lookup("sms_postAccessCardRetrive");
	sms_postAccessCardRetrive.send();
}

// 출입증 리스트 가져오기 완료
function onSms_getAccessCardInfoListSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 출입증 리스트 가져오기 에러
function onSms_getAccessCardInfoListSubmitError(/* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

// 출입증 리스트 가져오기 타임아웃
function onSms_getAccessCardInfoListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

// TAB 5 : 출입증 관리 ---------------------------------------------!

