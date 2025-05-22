/************************************************
 * mainPageAMHQ.js
 * Created at 2021. 2. 15. 오전 11:34:41.
 *
 * @author blue1
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var loginPrivilege = 0;	 // (0: 사용자, 1: 관리자, 2: 승인자)

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	
	app.lookup("sms_getDashboard").send();
	
	var link = app.lookup("AMGCR_sniDownloadLink1");
	link.value=	"<a href=\"/setup/custom_armyhq/cardDrive.zip\" target=\"_blank\">  햄스터 드라이버</a>";
	var link = app.lookup("AMGCR_sniDownloadLink2")
	link.value=	"<a href=\"/setup/custom_armyhq/HDP5000_v3.3.0.1_Setup.exe\" target=\"_blank\">  카드 프린터 드라이버</a>";
	var link = app.lookup("AMGCR_sniDownloadLink3")
	link.value=	"<a href=\"/setup/AlpetaDevice.exe\" target=\"_blank\">  햄스터 & 카드 프린터 연동 프로그램</a>";
	var link = app.lookup("AMGCR_sniDownloadLink4")
	link.value=	"<a href=\"/setup/NL-RF300.zip\" target=\"_blank\">  RFID 드라이버</a>";
	
}


/* 서브미션 이벤트 */
function onSms_getAccessApprovalCntSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){		
		// console.log(app.lookup("dmDashboardData").getDatas());
		app.lookup("fullGroup").redraw();

		// 사용자 권한 및 결재 권한 확인 후 일반 사용자일 경우
		var approver;
		if (dataManager.getApprover() != null) {
			approver = dataManager.getApprover();
			if (approver.getValue("UserID") == "") {
				loginPrivilege = 0;
			} else {
				loginPrivilege = 2;
			}
		}
		
		var accountInfo = dataManager.getAccountInfo();
		var privilege = Number(accountInfo.getValue("Privilege"));
		if (privilege == 1 && loginPrivilege != 2) {	// 관리자일 경우
			loginPrivilege = 1;
		}
		if (loginPrivilege == 0) {
			var hostAppIns = app.getHostAppInstance();
			var bResult = hostAppIns.callAppMethod("openSubMenu", 0, "0");
		}
	
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
	
}

function onSms_getAccessApprovalCntReceiveJson(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_getAccessApprovalCntSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);	
}

function onLinkTOMenu( menuId, subMenuID ){
	var hostAppIns = app.getHostAppInstance();
	var bResult = hostAppIns.callAppMethod("openSubMenu", menuId, subMenuID);
}

//방문신청 승인대기 클릭
function onAHMPD_btnVisitApprovalWaitClick(/* cpr.events.CMouseEvent */ e){
	onLinkTOMenu(10,"10202")	
}
// 소속부대원 출입증 승인대기
function onAHMPD_btnAccessApprovalWaitClick(/* cpr.events.CMouseEvent */ e){
	onLinkTOMenu(20,"20201")
}

// 부대차량 등록수
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	onLinkTOMenu(20,"20702")
}

// 소속부대원 차량 등록수
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	onLinkTOMenu(20,"20601")
}

// 현역수
function onButtonClick3(/* cpr.events.CMouseEvent */ e){
	onLinkTOMenu(20,"20601")
}

// 군무원 수
function onButtonClick4(/* cpr.events.CMouseEvent */ e){
	onLinkTOMenu(20,"20601")
}

// 공무직 수
function onButtonClick11(/* cpr.events.CMouseEvent */ e){
	onLinkTOMenu(20,"20601")	
}

// 병사수
function onButtonClick5(/* cpr.events.CMouseEvent */ e){
	onLinkTOMenu(20,"20601")
}

// 군가족수
function onButtonClick6(/* cpr.events.CMouseEvent */ e){
	onLinkTOMenu(20,"20601")
}

// 상주민간인수
function onButtonClick7(/* cpr.events.CMouseEvent */ e){
	onLinkTOMenu(20,"20601")
}

// 고정출입자수
function onButtonClick8(/* cpr.events.CMouseEvent */ e){
	onLinkTOMenu(20,"20601")
}

// 장비 등록 수
function onButtonClick9(/* cpr.events.CMouseEvent */ e){
	onLinkTOMenu(40,"40201")
}

// LPR 등록 수
function onButtonClick10(/* cpr.events.CMouseEvent */ e){
	onLinkTOMenu(40,"40203")
}

