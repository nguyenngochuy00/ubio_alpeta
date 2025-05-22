/************************************************
 * userCardRegist.js
 * Created at 2019. 2. 28. 오후 7:22:57.
 *
 * @author joymrk
 ************************************************/
var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var StrLib = cpr.core.Module.require("lib/StrLib");
var USCDR_userID;
var USCDR_deviceWebSocket;
var USCDR_url;

function onBodyLoad( /* cpr.events.CEvent */ e) {
	comLib = createComUtil(app);
	dataManager = getDataManager();
	
	var link = app.lookup("USCDR_sniDownloadLink");
	link.value = "<a href=\"/setup/AlpetaDevice.exe\" target=\"_blank\">" + dataManager.getString("Str_DeviceServerDownloadPath") + "</a>";
	
	app.lookup("USCDR_opbMessage").value = dataManager.getString("Str_HamsterConnectTry");
	connectDeviceServer("127.0.0.1:9600");
	
	var udcTerminalList = app.lookup("USCDR_udcTerminalList");
	udcTerminalList.deleteColumn([13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3]);
	
	var dsUserCardInfo = app.lookup("UserCardInfo");
	dsUserCardInfo.clear();
	
	var initValue = app.getHost().initValue;
	USCDR_url = initValue["Url"];
	
	USCDR_userID = initValue["userID"];
		
	/** @type cpr.data.DataSet */
	var dsInitUserCardData = initValue["UserCardInfo"];
	var count = dsInitUserCardData.getRowCount();
	for (var i = 0; i < count; i++) {
		var cardInfo = dsInitUserCardData.getRow(i);
		if (cardInfo == null || cardInfo.getValue("CardNum") == "") {
			dsInitUserCardData.deleteRow(i);
		}
	}
	dsInitUserCardData.commit();
	dsInitUserCardData.copyToDataSet(dsUserCardInfo);
		
	var dm_UserInfo = app.lookup("UserInfo");
	dm_UserInfo.setValue("ID",USCDR_userID);
	
	var oemVer = dataManager.getOemVersion();
	
	if (oemVer == OEM_JAWOONDAE) {
		var tabDevice = app.lookup("USCDR_tabDeviceType");
		var tabItems = tabDevice.getTabItems();
		tabDevice.setSelectedTabItem(tabItems[1]);
	} else if (oemVer == OEM_SS_HOSPITAL) {
		var tabitems = app.lookup("USCDR_tabDeviceType").getTabItems();
		app.lookup("USCDR_tabDeviceType").setSelectedTabItem(tabitems[1]);
	}	
	
	var sms_getTerminalLiveInfo = app.lookup("sms_getTerminalLiveInfo");
	sms_getTerminalLiveInfo.send();
	
	sendConnectedTerminalListRequest();
}

function onBodyBeforeUnload( /* cpr.events.CEvent */ e) {
	if (USCDR_deviceWebSocket != null) {
		USCDR_deviceWebSocket.close();
		USCDR_deviceWebSocket = null;
	}
}

// 단말 리스트 페이지 인덱서 클릭
function onUSCDR_udcTerminalListPagechange( /* cpr.events.CSelectionEvent */ e) {
	sendConnectedTerminalListRequest();
}

// 단말기 검색 클릭
function onUSCDR_udcSearchTerminalSearch( /* cpr.events.CUIEvent */ e) {
	sendConnectedTerminalListRequest();
}

function sendConnectedTerminalListRequest() {
	var terminalList = app.lookup("USCDR_udcTerminalList");
	var curIndex = terminalList.getCurrentPageIndex();
	
	var pageRowCount = terminalList.getPageRowCount();
	var offset = (curIndex - 1) * pageRowCount;
	
	var searchCtrl = app.lookup("USCDR_udcSearchTerminal")
	var smsGetConnectedTerminalList = app.lookup("sms_getConnectedTerminalList");
	smsGetConnectedTerminalList.action = '/v1/terminals'
	
	smsGetConnectedTerminalList.setParameters("searchCategory", searchCtrl.searchCategory);
	smsGetConnectedTerminalList.setParameters("searchKeyword", searchCtrl.searchKeyword);
	//smsGetConnectedTerminalList.setParameters("terminallivinfo", 1);
	if (searchCtrl.searchKeyword != undefined && searchCtrl.searchKeyword.length > 0) {
		smsGetConnectedTerminalList.setParameters("searchCategory", searchCtrl.searchCategory);
	} else {
		smsGetConnectedTerminalList.setParameters("searchCategory", "");
	}
	
	smsGetConnectedTerminalList.setParameters("offset", offset);
	smsGetConnectedTerminalList.setParameters("limit", pageRowCount);
	smsGetConnectedTerminalList.setParameters("IsTerminalStatus", true);
	
	var fields = ["terminal_id", "name","register_flag"];
	smsGetConnectedTerminalList.setParameters("fields", fields);
	
	comLib.showLoadMask("", dataManager.getString("Str_TerminalLoading"), "", pageRowCount);
	smsGetConnectedTerminalList.action = USCDR_url + "/terminals";
	smsGetConnectedTerminalList.send();
}

// 단말 리스트 가져오기 완료
function onSms_getConnectedTerminalListSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	comLib.hideLoadMask();
	var bResultCode = app.lookup("Result").getValue("ResultCode");
	if (bResultCode == COMERROR_NONE) {
		var dsTerminalList = app.lookup("TerminalList");
		
		var terminalList = app.lookup("USCDR_udcTerminalList");
		terminalList.setTerminalListAMHQ(dsTerminalList,"register");
		
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		terminalList.setTotalCount(totalCount);
	} else {}
	
	//cardlayout
	comLib.showLoadMask("", dataManager.getString("Str_CardLayout"), "", 0);
	var smsGetCardLayout = app.lookup("sms_getCardInfo");
	smsGetCardLayout.action = USCDR_url + "/cardLayout";
	smsGetCardLayout.send();
}

// 단말 리스트 가져오기 에러
function onSms_getConnectedTerminalListSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_ERROR);
}

// 단말 리스트 가져오기 타임아웃
function onSms_getConnectedTerminalListSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function connectDeviceServer(address) {
	
	USCDR_deviceWebSocket = new WebSocket("ws://" + address + "/v1/webEntry");
	var svrDeviceVer = dataManager.getDeviceServerVersion();
	
	USCDR_deviceWebSocket.onopen = function(message) {
		app.lookup("USCDR_opbMessage").value = dataManager.getString("Str_DeviceServerUpdateRequired");
		var link = app.lookup("USCDR_sniDownloadLink");
		link.visible = true;
		console.log("device server ws connected.");
		
		/*
		var strSendInfo = '{"msgId":"' + WSCmdDeviceServerVersionReq + '"}';
		console.log("get device version [" + strSendInfo + "]");
		USDR_deviceWebSocket.send(strSendInfo);
		*/
	};
	
	USCDR_deviceWebSocket.onclose = function(message) {
		USCDR_deviceWebSocket = null;
		console.log("\Server disconnect...");
	};
	
	USCDR_deviceWebSocket.onerror = function(message) {
		console.log("error... " + message);
		app.lookup("USCDR_opbMessage").value = dataManager.getString("Str_DeviceServerInstallRequired");
		var link = app.lookup("USCDR_sniDownloadLink");
		link.visible = true;
		
	};
	
	USCDR_deviceWebSocket.onmessage = function(message) {
		
		var msg = JSON.parse(message.data);
		
		switch (msg.msgId) {
			case WSCmdCardCaptureRes: { // 캡쳐 완료. 결과 수신.
				comLib.hideLoadMask();
				var result = JSON.parse(msg.body);
				if (result.Result == "success") {
					
					var dsUserCardInfo = app.lookup("UserCardInfo");

					var strCardNum = result.CardNum; // 카드번호 옮겨 담기
					
					if (dataManager.getSystemBrandType() == BRAND_VRIDI) { // 버디 타입은 8자리 채워준다.
						if (strCardNum.length < 8) {
							strCardNum = StrLib.formattedString("00000000", String(result.CardNum), "left");
						}
					}
						dsUserCardInfo.addRowData({
							"CardNum": strCardNum
						})
				} else if (result.Result == "Capture failed") {
					dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorCardCapture"));
				} else {
					dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), result.Result);
				}
				
			}
			break;
			
		case WSCmdDeviceServerVersionRes: { // 버전정보 확인
			var result = JSON.parse(msg.body);
			var deviceVer = result.Version;
			console.log("recv WSCmdDeviceServerVersionRes, Version = " + deviceVer);
			
			// 서버와 디바이스 버전이 일치하면 링크 비활성화
			if (deviceVer >= svrDeviceVer) {
				app.lookup("USCDR_opbMessage").value = dataManager.getString("Str_HamsterConnected");
				var link = app.lookup("USCDR_sniDownloadLink");
				link.visible = false;
			}
		}
		break;
		
		default:
			console.log(msg);
			break;
		}
	}
}

// 카드 캡쳐 클릭
function onUSCDR_btnCardCaptureClick( /* cpr.events.CMouseEvent */ e) {
	
	var RegisterableCardCount = dataManager.getClientOption().getValue("RfRegMax");
	var dsCardInfo = app.lookup("UserCardInfo");
	var RegistedCardCount = dsCardInfo.getRowCount();
	if (RegisterableCardCount <= RegistedCardCount) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorMaxCardRegistConunt"));
		return
	}
	
	var maxCard = 5;
	if( dataManager.getSystemBrandType() == BRAND_NITGEN) {
		maxCard = 1;
	}
	
	var dsUserCardInfo = app.lookup("UserCardInfo");
	var count = dsUserCardInfo.getRowCount();
	if (count >= maxCard) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_CardCountMaxExceeded"));
		return
	}
	
	var udcTerminalList = app.lookup("USCDR_udcTerminalList");
	
	var tabDevice = app.lookup("USCDR_tabDeviceType");
	var tabItem = tabDevice.getSelectedTabItem();
	if (tabItem.id == 1) { // 단말기 
		onCardCaptureReqToTerminal(USCDR_userID);
	} else {
		onCardCaptureReq(USCDR_userID);
		//onRm100CaptureReq(USCDR_userID); // test
	}
}

function onCardCaptureReqToTerminal(uid) {
	var udcTerminalListInfo = app.lookup("USCDR_udcTerminalList");
	
	var checkedRowIndices = udcTerminalListInfo.getCheckedRowIndices();
	
	if (checkedRowIndices.length <= 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalNotSelected"));
		return;
	} else if (checkedRowIndices.length > 1) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Info"), dataManager.getString("Str_SelectedOneTerminal"));
		return;
	}
	var reqIndex = checkedRowIndices.pop();
	if (reqIndex == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalNotSelected"));
		return;
	}
	var terminalID = udcTerminalListInfo.getTerminalID(reqIndex);
	var dmCardData = app.lookup("CardData");
	dmCardData.clear();
	
	var sms_getUserCardInfoToTerminal = app.lookup("sms_getUserCardInfoToTerminal");
	sms_getUserCardInfoToTerminal.action = USCDR_url + "/terminals/" + terminalID + "/scan/card";
	comLib.showLoadMask("", dataManager.getString("Str_CardCaptureRequest"), "", 60);
	sms_getUserCardInfoToTerminal.send();
}

// 사용자 카드 캡쳐 완료
function onSms_getUserCardInfoToTerminalSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	comLib.hideLoadMask();
	var bResultCode = app.lookup("Result").getValue("ResultCode");
	if (bResultCode == COMERROR_NONE || bResultCode == ERROR_RFCARD_DUPLICATE) {
		
		var dmCardData = app.lookup("CardData");
		var dsCardInfo = app.lookup("UserCardInfo");
		
		var cardNum = dmCardData.getValue("CardNum");
		if (cardNum.length > 1) {
			
			var DuplicateCheck = dsCardInfo.findFirstRow("CardNum == '" + cardNum + "'");
			if (DuplicateCheck) {
				dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorRfCardDupilcate"));
				return;
			}
			dsCardInfo.addRowData(dmCardData.getDatas());
		}
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(bResultCode)));
	}
}

// 사용자 카드 캡쳐 에러
function onSms_getUserCardInfoToTerminalSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_ERROR);
}

// 사용자 카드 캡쳐 타임아웃
function onSms_getUserCardInfoToTerminalSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onRm100CaptureReq(uid) {
	var brandType = (dataManager.getSystemBrandType() == BRAND_NITGEN) ? "NITGEN" : "VIRDI";
	if (USCDR_deviceWebSocket) {
		
		if (uid == undefined) {
			uid = 0
		}
		
		var strSendinfo = '';
		strSendinfo = '{"msgId":"' + WSCmdRm100CaptureReq + '","body":{"UserId":"' + uid + '"}';
		
		strSendinfo = strSendinfo + '}';
		
		comLib.showLoadMask("", dataManager.getString("Str_Rm100CaptureRequest"), "", 60);
		console.log(strSendinfo);
		USCDR_deviceWebSocket.send(strSendinfo);
		
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_HamsterConnectFailed"));
	}
}

function onCardCaptureReq(uid) {
	var brandType = (dataManager.getSystemBrandType() == BRAND_NITGEN) ? "NITGEN" : "VIRDI";
	if (USCDR_deviceWebSocket) {
		var dmCardlayoutInfo = app.lookup("dmCardLayoutInfo");
		var cardType = dmCardlayoutInfo.getValue("CardType");
		var readType = dmCardlayoutInfo.getValue("ReadType");
		
		var serialType = convertSerialType();
		var dsCardlayoutDataList = app.lookup("dsCardLayoutData");
		/*{
			"msgId":"WSCmdCardCaptureReq",
			"body": {
				"UserId":"uid",
				"BrandType":"brandType",
				"CardType":"cardType",
				"readType":"readType",
				"serialType":"serialType"
				"sectorData":[{ 
							"AIDCode": "ffff",
							"Block": "0"
							"Index": "0"
							"KeyType": 96"
							"KeyValue": "ffffffffffff"
							"Length": "3"
							"Sector": "0"
							"Start": "10"
							},	
						{""}
					] 
				}
		}*/
		
		var strSector = '';
		var RowCnt = dsCardlayoutDataList.getRowCount();
		for (var i = 0; i < RowCnt; i++) {
			if (i == 0) { // 제일 처음
				strSector = '"sectorData":[{';
			} else {
				strSector = strSector + ',{'
			}
			var rowData = dsCardlayoutDataList.getRow(i);
			strSector = strSector + '"Index":"' + rowData.getValue("Index") + '","Sector":"' + rowData.getValue("Sector") + '","Block":"' +
				rowData.getValue("Block") + '","Start":"' + rowData.getValue("Start") + '","Length":"' + rowData.getValue("Length") + '","KeyType":"' +
				rowData.getValue("KeyType") + '","KeyValue":"' + rowData.getValue("KeyValue") + '","AIDCode":"' + rowData.getValue("AIDCode") + '"}'
			
		}
		if (RowCnt > 0) {
			strSector = strSector + "]";
		}
		if (uid == undefined) {
			uid = 0
		}
		
		var strSendinfo = '';
		strSendinfo = '{"msgId":"' + WSCmdCardCaptureReq + '","body":{"UserId":"' + uid + '","BrandType":"' + brandType + '","CardType":"' + cardType +
			'","readType":"' + readType + '","serialType":"' + serialType + '"}';
		
		if (strSector.length > 0) {
			strSendinfo = strSendinfo + ',' + strSector + '}';
		} else {
			strSendinfo = strSendinfo + '}';
		}
		
		comLib.showLoadMask("", dataManager.getString("Str_CardCaptureRequest"), "", 60);
		console.log(strSendinfo);
		USCDR_deviceWebSocket.send(strSendinfo);
		//USCDR_deviceWebSocket.send('{"msgId":"'+WSCmdCardCaptureReq+'","body":{"UserId":"'+uid+'","BrandType":"'+brandType+'","CardType":"' + cardType + 
		//'","readType":"' + readType + '","serialType":"'+ serialType +'"}}');
		
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_HamsterConnectFailed"));
	}
}

function convertSerialType() {
	var dmCardlayoutInfo = app.lookup("dmCardLayoutInfo");
	var serialType = dmCardlayoutInfo.getValue("TemplateSize");
	var cardType = dmCardlayoutInfo.getValue("CardType");
	var readType = dmCardlayoutInfo.getValue("ReadType");
	if (cardType == 1) {
		serialType = 0; // 지문카드 --> 기본으로 처리
	} else {
		if (readType == 2) { //MAD
			serialType = 0; //MAD --> 기본으로 처리
		}
	}
	
	return serialType;
}

// 등록된 카드 삭제.
function onUSCDR_btnCardDeleteClick( /* cpr.events.CMouseEvent */ e) {
//	var grdCardList = app.lookup("USCDR_grdCardList");
//	var checkIndices = grdCardList.getCheckRowIndices();
//	if (checkIndices.length <= 0) {
//		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedItem"));
//		return;
//	}
//	checkIndices.forEach(function(rowIndex) {
//		grdCardList.deleteRow(rowIndex);
//	});
//	grdCardList.commitData();
	//----------------------------
	var grdCardList = app.lookup("USCDR_grdCardList");
	var chkIndices = grdCardList.getCheckRowIndices();
	if (chkIndices.length == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedItem"));
		return;
	}
	
	var dsCardInfo = app.lookup("UserCardInfo");
	chkIndices.forEach(function(rowIndex) {
		dsCardInfo.deleteRow(rowIndex)
	});
	
	dsCardInfo.commit();
	
	if (dsCardInfo.getRowCount() < 1) {
		var userID = app.lookup("UserInfo").getValue("ID");
		console.log("userID : " + userID);
		var sms_deleteCD = app.lookup("sms_deleteUserCDInfo");
		sms_deleteCD.action = "/v1/users/" + userID + "/card";
		sms_deleteCD.send();
	}
}

// 적용 버튼 클릭시
function onUSCDR_btnApplyClick( /* cpr.events.CMouseEvent */ e) {
	var dsCardInfo = app.lookup("UserCardInfo");
	app.close(dsCardInfo.getRowDataRanged());
}

//---------------------------------------------------------------------------------------------> CardLayout
function onSms_getCardInfoSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		console.log("cardlayout success");
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Fail") + " " + dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_getCardInfoSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getCardInfoSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
//---------------------------------------------------------------------------------------------< end CardLayout 

// 단말기 라이브 정보 수신 완료
function onSms_getTerminalLiveInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		console.log("get terminalLiveInfo success");	
		var terminalList = app.lookup("USCDR_udcTerminalList");
		terminalList.redraw();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Fail") + " " + dataManager.getString(getErrorString(resultCode)));
	}
}

// 단말기 라이브 정보 수신 에러
function onSms_getTerminalLiveInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT)
}

// 단말기 라이브 정보 수신 타임아웃
function onSms_getTerminalLiveInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT)
}
