/************************************************
 * adminInitPassword.js
 * Created at 2021. 3. 2. 오후 7:49:49.
 *
 * @author joymrk
 ************************************************/
var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var StrLib = cpr.core.Module.require("lib/StrLib");
var APIAMHQ_userID;
var APIAMHQ_deviceWebSocket;
var APIAMHQ_mode; // "Regist":카드 등록, "Scan":카드 번호 스캔
var APIAMHQ_url;
var _privilegeID; //권한아이디


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e) {
	comLib = createComUtil(app);
	dataManager = getDataManager();
	// 찾을꺼도 없다 사실
	var initValue = app.getHost().initValue;
	_privilegeID = initValue["privilegeID"];

	var link = app.lookup("APIAMHQ_sniDownloadLink1");
	link.value = "<a href=\"/setup/custom_armyhq/cardDrive.zip\" target=\"_blank\">햄스터 드라이버</a>";
	var link = app.lookup("APIAMHQ_sniDownloadLink2")
	link.value = "<a href=\"/setup/AlpetaDevice.exe\" target=\"_blank\">햄스터 & 카드 프린터 연동 프로그램</a>";

	app.lookup("APIAMHQ_opbMessage").value = "등록기 연결 시도 중";
	connectDeviceServer("127.0.0.1:9600");
	APIAMHQ_userID = 1; // 무조ㅅ건
	//카드 레이아웃 정보 
}

function connectDeviceServer(address) {

	APIAMHQ_deviceWebSocket = new WebSocket("ws://" + address + "/v1/webEntry");

	APIAMHQ_deviceWebSocket.onopen = function (message) {
		app.lookup("APIAMHQ_opbMessage").value = "등록기 연결 성공";
		console.log("device server ws connected.");
	};

	APIAMHQ_deviceWebSocket.onclose = function (message) {
		APIAMHQ_deviceWebSocket = null;
		console.log("\Server disconnect...");
	};

	APIAMHQ_deviceWebSocket.onerror = function (message) {
		console.log("error... " + message);
		app.lookup("APIAMHQ_opbMessage").value = "등록기 웹 연동 프로그램을 설치하시기 바랍니다.";
		//    var link = app.lookup("APIAMHQ_sniDownloadLink");
		//   link.visible=true;
		//  var link = app.lookup("APIAMHQ_sniDownloadLink2");
		//  link.visible=true;
	};

	APIAMHQ_deviceWebSocket.onmessage = function (message) {

		var msg = JSON.parse(message.data);

		switch (msg.msgId) {
			case WSCmdCardCaptureRes: { // 캡쳐 완료. 결과 수신.
				comLib.hideLoadMask();
				app.lookup("APIAMHQ_btnCardRead").enabled = true;
				var result = JSON.parse(msg.body);

				if (result.Result == "success") {
					var opbPersonnelInfoCardSerial = app.lookup("APIAMHQ_opbCardNum");
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
					dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "카드 정보 읽기 실패");
				} else {
					dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), result);
				}

			} break;

			default: console.log(msg); break;
		}

	}
}

/*
 * 루트 컨테이너에서 unload 이벤트 발생 시 호출.
 * 앱이 언로드된 후 발생하는 이벤트입니다.
 */
function onBodyUnload(/* cpr.events.CEvent */ e) {
	if (APIAMHQ_deviceWebSocket != null) {
		APIAMHQ_deviceWebSocket.close();
		APIAMHQ_deviceWebSocket = null;
	}
}

function onCardCaptureReq(uid) {
	app.lookup("APIAMHQ_opbCardNum").value = "";

	var bodyData = {};
	bodyData.UserId = String(uid);
	bodyData.BrandType = "VIRDI";
	bodyData.CardType = "0";
	bodyData.ReadType = "0";
	bodyData.SerialType = "0";

	var msgReq = {
		msgId: String(WSCmdCardCaptureReq),
		body: bodyData
	};

	var msgData = JSON.stringify(msgReq);
	APIAMHQ_deviceWebSocket.send(msgData);
}

function convertSerialType() {
	var dmCardlayoutInfo = app.lookup("dmCardLayoutInfo");
	var serialType = dmCardlayoutInfo.getValue("TemplateSize");
	var cardType = dmCardlayoutInfo.getValue("CardType");
	var readType = dmCardlayoutInfo.getValue("ReadType");
	if (cardType == 1) {
		serialType = 0; // 지문카드 --> 기본으로 처리
	} else {
		if (readType == 2) {//MAD
			serialType = 0; //MAD --> 기본으로 처리
		}
	}

	return serialType;
}

function onAPIAMHQ_btnCardReadClick(/* cpr.events.CMouseEvent */ e) {
	var maxCard = 1;
	app.lookup("APIAMHQ_opbCardNum").value = "";
	app.lookup("APIAMHQ_btnCardRead").enabled = false;
	onCardCaptureReq(APIAMHQ_userID);
}

function onAPIAMHQ_btnPasswordInitClick(/* cpr.events.CMouseEvent */ e) {
	// 데이터 체크
	var dmCardTypeLoginInfo = app.lookup("CardTypeLoginInfo");
	dmCardTypeLoginInfo.clear();
	var uniqueID = app.lookup("APIAMHQ_ipbUniqueID").value;
	if (uniqueID == null || uniqueID.length <= 0) {
		dialogAlertAMHQ(app, "경고", "군번을 입력해 주세요");
		return; // 군번
	}

	var pwd = app.lookup("APIAMHQ_ipbPassword").value;
	if (pwd == null || pwd.length < 4) {
		dialogAlertAMHQ(app, "경고", "패스워드를 4자리 이상 입력해 주세요");
		return; // 패스워드
	}
	if (pwd == null || pwd.length <= 0) {
		dialogAlertAMHQ(app, "경고", "패스워드를 입력해 주세요");
		return; // 패스워드
	}

	var cardNum = app.lookup("APIAMHQ_opbCardNum").value;
	if (cardNum == null || cardNum.length <= 0) {
		dialogAlertAMHQ(app, "경고", "캡쳐된 카드번호가 없습니다.");
		return; // 카드
	}

	comLib.showLoadMask("", "패스워드 초기화 진행", "", 0);

	dmCardTypeLoginInfo.setValue("privilege", _privilegeID);
	dmCardTypeLoginInfo.setValue("password", pwd);
	dmCardTypeLoginInfo.setValue("uniqueid", uniqueID);
	dmCardTypeLoginInfo.setValue("cardnumber", cardNum);
	dmCardTypeLoginInfo.setValue("datatype", "card"); //카드

	var smsPutloginPasswordInit = app.lookup("sms_putloginPasswordInit");
	smsPutloginPasswordInit.action = "/v1/armyhq/initPassword/admintype";
	smsPutloginPasswordInit.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_putloginPasswordInitSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		//dialogAlertAMHQ(app, "성공", "패스워드가 초기화 되었습니다. 변경된 패스워드로 다시 로그인해 주세요");
		alert("패스워드가 초기화 되었습니다. 변경된 패스워드로 다시 로그인해 주세요");
		app.close();
	} else {
		var msgError;
		if (resultCode == 0x00000001) {
			msgError = "잘못된 값을 요청 하였습니다. 입력값을 다시 확인해 주세요";
		} else if (resultCode == 0x00000001) {
			msgError = "입력된 군번으로 사용자를 찾을 수 없습니다. 다시 확인해 주세요";
		} else if (resultCode == 0x04000005) {
			msgError = "관리자는 해당 방식으로 비밀번호를 초기화 할 수 없습니다.";
		} else if (resultCode == 0x01000021) {
			msgError = "입력된 이름이 저장된 정보와 일치 하지 않습니다.";
		} else if (resultCode == 0x7F000001) {
			msgError = "입력된 생일이 정상적인 값이 아닙니다.다시 확인해 주세요";
		} else if (resultCode == 0x7F000002) {
			msgError = "생년월일이 등록되어 있지 않습니다. 관리자에게 문의하세요";
		} else if (resultCode == 0x7F000003) {
			msgError = "초기화 하려는 비밀번호에 연속문자 오류가 있습니다.";
		} else if (resultCode == 0x7F000004) {
			msgError = "등록된 사용자 아이디와 동일한 비밀번호 입니다. ";
		} else if (resultCode == 0x7F000005) {
			msgError = "비밀번호 작성시 영문 대문자를 입력 해야 합니다.";
		} else if (resultCode == 0x7F000006) {
			msgError = "비밀번호 작성시 영문 소문자를 입력 해야 합니다.";
		} else if (resultCode == 0x7F000007) {
			msgError = "비밀번호 작성시 숫자를 입력 해야 합니다.";
		} else if (resultCode == 0x7F000008) {
			msgError = "비밀번호 작성시 특수문자를 입력 해야 합니다.";
		} else if (resultCode == 0x7F000008) {
			msgError = "비밀번호 작성시 특수문자를 입력 해야 합니다.";
		} else {
			//이름불일치/사번없음/생년월일 불일치/패스워드 입력조건 불일치/
			dialogAlertAMHQ(app, "실패", "패스워드 초기화에 실패하였습니다. 관리자에게 문의하세요");
		}
	}

}

function onSms_putloginPasswordInitSubmitError(/* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_putloginPasswordInitSubmitTimeout(/* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * 인풋 박스에서 mousedown 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 누를 때 발생하는 이벤트.
 */
function onAPIAMHQ_ipbPasswordMousedown(/* cpr.events.CMouseEvent */ e) {
	app.lookup("APIAMHQ_ipbPassword").secret = false;
}


/*
 * 인풋 박스에서 mouseup 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 뗄 때 발생하는 이벤트.
 */
function onAPIAMHQ_ipbPasswordMouseup(/* cpr.events.CMouseEvent */ e) {
	app.lookup("APIAMHQ_ipbPassword").secret = true;
}



/*
 * 아웃풋(APIAMHQ_opbCardNum)에서 value-change 이벤트 발생 시 호출.
 * Output의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onAPIAMHQ_opbCardNumValueChange(/* cpr.events.CValueChangeEvent */ e) {
	/** 
	 * @type cpr.controls.Output
	 */
	var aPIAMHQ_opbCardNum = e.control;

}
