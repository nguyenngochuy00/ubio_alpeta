/************************************************
 * AuthLogStatistic.js
 * Created at 2023. 12. 21. 오후 3:10:48.
 *
 * @author 960405
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var timeoutId;
/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad( /* cpr.events.CEvent */ e) {
	// var appwidth = app.getHostAppInstance().getActualRect().width; 마스터, 전광판 관리자 구분 x
	var appwidth = screen.width;
	var defaultfontSize = Math.floor(appwidth / 150) + "px";
	var fontSize1 = Math.floor(appwidth / 110) + "px";
	var fontSize2 = Math.floor(appwidth / 110) + "px";
	var fontSize5 = Math.floor(appwidth / 105) + "px";
	var dmfontSize = app.lookup('fontSize');
	
	// 사용하는 모니터의 사이즈가 각기 다르기 때문에 넓이를 나눈 값을 적용해야됨
	dmfontSize.setValue('font1', fontSize1); // 단말기 명 
	dmfontSize.setValue('font2', fontSize2); // 사용자 사진, 인증로그 사진
	dmfontSize.setValue('font3', defaultfontSize); // 필드명
	dmfontSize.setValue('font4', defaultfontSize); // 핖드 데이터
	dmfontSize.setValue('font5', fontSize5); // 인증결과, 사용자 이름
	
	app.lookup('layOut').redraw();
}

exports.setTerminalName = function(terminalName) {
	app.lookup('ADB_OptTerminalName').value = terminalName;
}

exports.removeRow = function() {
	var layOut = app.lookup('layOut');
	layOut.getLayout().removeRows([3]);
	layOut.getLayout().removeRows([0]);
}

exports.setAuthInfo = function(authInfo) {
	
	var timar = 0;
	var storage_Count = localStorage.getItem("displayBoard_Count");
	
	if (storage_Count != null && storage_Count != "") {
		timar = parseInt(storage_Count, 10) * 1000;
	}
	
	if (timar != 0) {
		startTimer();
		
		function startTimer() {
			clearTimeout(timeoutId); // 기존 타이머 취소
			timeoutId = setTimeout(function() {
				clearData();
			}, timar);
		}
	}
	
	dataManager = getDataManager();
	// 탭1에서만 적용, 탭2는 매번 새로 그린 UDC이기 때문에 서브미션 상태를 보는게 의미 없음
	if (app.lookup('sms_getUserPicture').status != 'SENDING') {
		// 캡처 이미지
		var image = app.lookup("image");
		image.src = "data:image/png;base64," + authInfo.LogImage;
		
		var dmAuthLogImage = app.lookup('AuthLogImage');
		dmAuthLogImage.setValue('IndexKey', authInfo.IndexKey);
		dmAuthLogImage.setValue('UserID', authInfo.UserID);
		dmAuthLogImage.setValue('UserName', authInfo.UserName);
		dmAuthLogImage.setValue('TerminalID', authInfo.TerminalID);
		dmAuthLogImage.setValue('TerminalName', app.lookup('ADB_OptTerminalName').value);
		dmAuthLogImage.setValue('EventTime', authInfo.EventTime);
		dmAuthLogImage.setValue('AuthType', authInfo.AuthType);
		dmAuthLogImage.setValue('AuthResult', authInfo.AuthResult);
		dmAuthLogImage.setValue('Card', authInfo.Card);
		
		// 1.사용자 사진 _인증 시 사용자ID 존재하는 경우만 api전송
		if (authInfo.UserID != "") {
			var smsGetUserPicture = app.lookup('sms_getUserPicture');
			smsGetUserPicture.action = "/v1/users/" + authInfo.UserID + "/picture";
			smsGetUserPicture.send();
		} else {
			app.lookup("dbimage").src = "../theme/images/noImg.gif";
		}
		
		// 2.인증사진_미지원 단말기
		if (authInfo.LogImage == "") {
			image.src = "../theme/images/noImg.gif";
		}
		initComboAuthLog();
		app.lookup('authInfo').redraw();
	}
}

function clearData() {
	var image = app.lookup("image");
	var dbimage = app.lookup("dbimage");
	image.src = "";
	dbimage.src = "";
	
	app.lookup('layOutGroup').style.css({
		//"background-color": "#f4fbff"
		"background-color": "#000000"
	});
	
	app.lookup('AuthLogImage').clear();
	app.lookup('authInfo').redraw();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getUserPictureSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getUserPicture = e.control;
	var result = app.lookup("Result");
	var userPicture = app.lookup("PictureInfo");
	var dbimage = app.lookup("dbimage");
	
	if (result.getValue('ResultCode') == 0) {
		dbimage.src = "data:image/png;base64," + userPicture.getValue('Picture');
	} else {
		dbimage.src = "../theme/images/noImg.gif";
	}
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getUserPictureSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getUserPicture = e.control;
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_ERROR);
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getUserPictureSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getUserPicture = e.control;
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function initComboAuthLog() {
	// 인증 타입 콤보
	var outAuthType = app.lookup("outAuthType");
	switch (outAuthType.value) {
		case "1":
			outAuthType.value = dataManager.getString("Str_AuthTypeFPVerify");
			break;
		case "2":
			outAuthType.value = dataManager.getString("Str_AuthTypeFPIdentify");
			break;
		case "3":
			outAuthType.value = dataManager.getString("Str_Password");
			break;
		case "4":
			outAuthType.value = dataManager.getString("Str_Card");
			break;
		case "5":
			outAuthType.value = dataManager.getString("Str_AuthTypeFaceVerify");
			break;
		case "6":
			outAuthType.value = dataManager.getString("Str_AuthTypeFaceIdentify");
			break;
		case "7":
			outAuthType.value = dataManager.getString("Str_MobileCard");
			break;
		case "8":
			outAuthType.value = dataManager.getString("Str_TypeIrisIdentify");
			break;
		case "9":
			outAuthType.value = dataManager.getString("Str_TypeIrisVerify");
			break;
		case "11":
			outAuthType.value = dataManager.getString("###"); // 아이디/유니크 아이디로 인증 수단 요청
			break;
		case "15":
			outAuthType.value = dataManager.getString("Str_Inside");
			break;
		case "16":
			outAuthType.value = dataManager.getString("Str_NotAssigned"); //ACU 인사이드버튼 공유
			break;
		case "20":
			outAuthType.value = "Car #";
			break;
		case "9998":
			outAuthType.value = "PDA";
			break;
		case "9999":
			outAuthType.value = "LPR";
			break;
		default:
			break;
	}
	
	// 인증 이상 배경 css 
	if (app.lookup("outAuthResult").value != "0") {
		// 실패
		app.lookup('layOutGroup').style.css({
			"background-color": "#bd4e4e"
		});
	} else {
		// 성공
		app.lookup('layOutGroup').style.css({
			//"background-color": "#f4fbff"
			"background-color": "#000000"
		});
	}
	
	// 인증 결과 콤보
	var outAuthResult = app.lookup("outAuthResult");
	switch (outAuthResult.value) {
		case "0":
			outAuthResult.value = dataManager.getString("Str_Success");
			break;
		case "1":
			outAuthResult.value = dataManager.getString("Str_AuthResultFail");
			break;
		case "2":
			outAuthResult.value = dataManager.getString("Str_AuthResultAccessDenied");
			break;
		case "3":
			outAuthResult.value = dataManager.getString("Str_AuthResultTimeout");
			break;
		case "4":
			outAuthResult.value = dataManager.getString("Str_AuthResultTimeoutCapture");
			break;
		case "5":
			outAuthResult.value = dataManager.getString("Str_AuthResultTimeoutIdentify");
			break;
		case "6":
			outAuthResult.value = dataManager.getString("Str_AuthResultAntiPassback");
			break;
		case "7":
			outAuthResult.value = dataManager.getString("Str_AuthResultDuress");
			break;
		case "8":
			outAuthResult.value = dataManager.getString("Str_AuthResultBlackList");
			break;
		case "10":
			outAuthResult.value = dataManager.getString("Str_AuthResultUnregistUser");
			break;
		case "11":
			outAuthResult.value = dataManager.getString("Str_AuthResultFPCaptureFailed");
			break;
		case "12":
			outAuthResult.value = dataManager.getString("Str_AuthResultDuplicatedAuth");
			break;
		case "13":
			outAuthResult.value = dataManager.getString("Str_AuthResultNetworkError");
			break;
		case "14":
			outAuthResult.value = dataManager.getString("Str_AuthResultServerBusy");
			break;
		case "15":
			outAuthResult.value = dataManager.getString("Str_AuthResultFaceDetectionFailed");
			break;
		case "16":
			outAuthResult.value = dataManager.getString("Str_AuthLogResultFailMealPay");
			break;
		case "17":
			outAuthResult.value = dataManager.getString("Str_AuthLogResultFailMealTime");
			break;
		case "18":
			outAuthResult.value = dataManager.getString("Str_AuthLogResultFailNotExistsMealCode");
			break;
		case "19":
			outAuthResult.value = dataManager.getString("Str_AuthLogResultFailPeriod");
			break;
		case "20":
			outAuthResult.value = dataManager.getString("Str_AuthLogResultFailMealLimit");
			break;
		case "21":
			outAuthResult.value = dataManager.getString("Str_AuthLogResultFailDayLimit");
			break;
		case "22":
			outAuthResult.value = dataManager.getString("Str_AuthLogResultFailMonthLimit");
			break;
		case "23":
			outAuthResult.value = dataManager.getString("Str_AuthLogResultSoftpassback");
			break;
		case "24":
			outAuthResult.value = dataManager.getString("Str_AuthLogResultNoMask");
			break;
		case "25":
			outAuthResult.value = dataManager.getString("Str_AuthLogResultFeverDetection");
			break;
		case "125": // AuthLogResultLprFail
			outAuthResult.value = dataManager.getString("Str_AuthResultLprFail");
			break;
		case "126": // AuthLogResultLprUnRegist
			outAuthResult.value = dataManager.getString("Str_AuthResultLprUnRegist");
			break;
		default:
			break;
	}
	app.lookup("layOut").redraw();
}