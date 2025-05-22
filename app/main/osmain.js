/************************************************
 * main.js
 * Created at 2018. 10. 2. 오후 4:48:49.
 *
 * @author tomato
 *
 * TODO
 * 필요한 데이터 로딩 프로세스 필요.
 * 각 서브미션별 타임아웃 및 완료(done) 에서의 처리 작업 추가
 ************************************************/
var programManager = cpr.core.Module.require("lib/ProgramManager");
var notification = cpr.core.Module.require("lib/Notification");
var dataManager = getDataManager();
var ctrlDragManager = cpr.core.Module.require("lib/ControlDragManager");
var mainLib;
var comLib;
var SessionTime = "";
var previousTime = "";
var currentTime = "";
var usint_version;
var embeddedAppAmhq = null;
var util = cpr.core.Module.require("lib/Utils");
var terminalMap = new Map(); // OEM_VIC) 단말기의 현재 상태 저장용

var TimeFlag = 0;
var oem_version;

// 메인 화면 onBodyLoad
function onBodyLoad( /* cpr.events.CEvent */ e) {
	usint_version = dataManager.getSystemVersion();
	var account = dataManager.getAccountInfo();
	dataManager.setDeleteItemMenuID();
	document.title = dataManager.getString("Str_ProgramName");
	oem_version = dataManager.getOemVersion();
	if(oem_version == OEM_LOTTE_CS){
		document.title = "롯데칠성 출입/근태 관리";
	}
	if(dataManager.getOemVersion() == OEM_ROKMCH){
		app.lookup("Army").value = "출입통제체계 UI";
	}
	comLib = createComUtil(app);
	mainLib = mainManager(app);
	app.addEventListener("execute-menu", function(e) {
		var target = e.content["Target"];
		
		switch( target ){
			case DLG_USER_INFO:	mainLib.ExecuteMenu( DLG_USER_INFO,e.content["ID"],e.content["Mode"]); break;
			case DLG_USER_FACEWT_RESYNC:	mainLib.ExecuteMenu( DLG_USER_FACEWT_RESYNC); break;
			case DLG_MONITORING_TERMINAL: 
				if( dataManager.getOemVersion() == OEM_DUKYANG_WARDOFFICE && dataManager.getAccountID() != 0xDE0B6B3A7640000 ){
					return;
				}
				mainLib.ExecuteMenu( DLG_MONITORING_TERMINAL, e.content["InitVal"]); break;
			case DLG_TERMINAL_INFO: mainLib.ExecuteMenu(DLG_TERMINAL_INFO, e.content["InitVal"]); break;
			case DLG_TERMINAL_WORK_PROCESS: mainLib.ExecuteMenu(DLG_TERMINAL_WORK_PROCESS, ""); break;
			
			case DLG_MONITORING_AUTH_IMAGE:  
				if (embeddedAppAmhq == undefined || embeddedAppAmhq.disposed == true) {// 전체 메뉴 페이지가 없는경우 팝업
					mainLib.ExecuteMenu(DLG_MONITORING_AUTH_IMAGE, e.content["InitVal"]);	
				}				 
				break;
			case DLG_ACCESSAREA_MANAGEMENT: mainLib.ExecuteMenu(DLG_ACCESSAREA_MANAGEMENT); break;
			case DLG_MEALSERVICE_MENU_MANAGEMENT: mainLib.ExecuteMenu(DLG_MEALSERVICE_MENU_MANAGEMENT); break;
			case DLG_DOWNLOAD_MANAGER: mainLib.ExecuteMenu(DLG_DOWNLOAD_MANAGER); break;

			case DLG_TIMELINE_WEEKENDN : mainLib.ExecuteMenu(DLG_TIMELINE_WEEKENDN); break;
			case DLG_TIMELINE_NITZEN : mainLib.ExecuteMenu(DLG_TIMELINE_NITZEN); break;

			case DLG_TIMELINE_WEEKENDV : mainLib.ExecuteMenu(DLG_TIMELINE_WEEKENDV); break;
			case DLG_TIMELINE_VIRDI : mainLib.ExecuteMenu(DLG_TIMELINE_VIRDI); break;

			case DLG_HOLIDAY_MANAGEMENT : mainLib.ExecuteMenu(DLG_HOLIDAY_MANAGEMENT); break;
			case DLG_HELP : mainLib.ExecuteMenu(DLG_HELP,e.content["ID"]); break;
			case DLG_AUTHLOG_VIEW : mainLib.ExecuteMenu(DLG_AUTHLOG_VIEW,e.content["ID"],e.content["Param"]); break;
			
			case DLG_PASS_REGIST : mainLib.ExecuteMenu(DLG_PASS_REGIST); break;
			case DLG_PASS_INFO : mainLib.ExecuteMenu(DLG_PASS_INFO, e.content["InitVal"]); break;
			case DLG_VISIT_REQUEST_INFO : mainLib.ExecuteMenu(DLG_VISIT_REQUEST_INFO, e.content["InitVal"]); break;
			case DLG_VISIT_REQUEST_EXCEL : mainLib.ExecuteMenu(DLG_VISIT_REQUEST_EXCEL); break;
			case DLG_AUTHTYPE_LOG_MANAGEMENT : mainLib.ExecuteMenu(DLG_AUTHTYPE_LOG_MANAGEMENT, e.content["InitVal"]); break;
			
			case DLG_ANTIPASSBACK_MANAGEMENT : mainLib.ExecuteMenu(DLG_ANTIPASSBACK_MANAGEMENT); break;
			case DLG_ANTIPASSBACK_AREA_USER : mainLib.ExecuteMenu(DLG_ANTIPASSBACK_AREA_USER); break;
			
//			case DLG_MOBILECARD_LAYOUT_SETTING : mainLib.ExecuteMenu(DLG_MOBILECARD_LAYOUT_SETTING); break;
			
			case DLG_ARMYHQ_ACCESS_APPLICATION_MANAGEMENT : mainLib.ExecuteMenu(DLG_ARMYHQ_ACCESS_APPLICATION_MANAGEMENT); break;
			case DLG_ARMYHQ_ACCESS_CARD_MANAGEMENT : mainLib.ExecuteMenu(DLG_ARMYHQ_ACCESS_CARD_MANAGEMENT); break;
			case DLG_ARMYHQ_ACCESS_APPLICATION_APPROVAL : mainLib.ExecuteMenu(DLG_ARMYHQ_ACCESS_APPLICATION_APPROVAL); break;
			case DLG_ARMYHQ_UNIT_CAR_INFOMATION_MANAGEMENT : mainLib.ExecuteMenu(DLG_ARMYHQ_UNIT_CAR_INFOMATION_MANAGEMENT); break;
			case DLG_ARMYHQ_VISIT_APPLICATION_MANAGEMENT: mainLib.ExecuteMenu(DLG_ARMYHQ_VISIT_APPLICATION_MANAGEMENT, e.content["ApplicationIndex"]); break;
			case DLG_ARMYHQ_VISIT_APPLICATION_APPROVAL : mainLib.ExecuteMenu(DLG_ARMYHQ_VISIT_APPLICATION_APPROVAL); break;
			case DLG_ARMYHQ_ACCESS_STATUS_REGISTRATION : mainLib.ExecuteMenu(DLG_ARMYHQ_ACCESS_STATUS_REGISTRATION); break;
			case DLG_ARMYHQ_ACCESS_STATUS : mainLib.ExecuteMenu(DLG_ARMYHQ_ACCESS_STATUS); break;
			case DLG_ARMYHQ_ACCESS_STATISTICS : mainLib.ExecuteMenu(DLG_ARMYHQ_ACCESS_STATISTICS); break;
			case DLG_ARMYHQ_ACCESS_STATUS_AREA_SETTING : mainLib.ExecuteMenu(DLG_ARMYHQ_ACCESS_STATUS_AREA_SETTING); break;
			case DLG_AUTHLOGDETAILIMAGE :
				console.log(e.content["Index"]); 
				mainLib.ExecuteMenu(DLG_AUTHLOGDETAILIMAGE,e.content["Index"]); 
				break;	// 베트남 주차관제 시스템 - otk
			case DLG_STRING:
				{
					dataManager.setLocale(e.content["ID"]);
					var sms_getLangList = app.lookup("sms_getLangList") ;
					sms_getLangList.action = "data/lang/lang_"+e.content["ID"]+".json";
					sms_getLangList.send();	
					localStorage.setItem("language",e.content["ID"]);
				}
			break;
			
			// 현대 사우디 마잔 - sep
			case DLG_HC_SAUDI_MARJAN_STATUS: mainLib.ExecuteMenu(DLG_HC_SAUDI_MARJAN_STATUS); break;
			case DLG_HC_SAUDI_MARJAN_STATUS_SUB_CONTRACTOR: 
				mainLib.ExecuteMenu(DLG_HC_SAUDI_MARJAN_STATUS_SUB_CONTRACTOR, e.content["StartTime"]); 
				break;
			case DLG_HC_SAUDI_MARJAN_STATUS_LABORERS_INFO: 
				mainLib.ExecuteMenu(DLG_HC_SAUDI_MARJAN_STATUS_LABORERS_INFO, e.content["InitVal"]); 
				break;
			case DLG_3D_INTEGRATED_MONITORING:
				break;
			case DLG_HECJF_RESTRICTION_MANAGEMENT: mainLib.ExecuteMenu(DLG_HECJF_RESTRICTION_MANAGEMENT); break; // 현대 무벡스 제한 관리	
			case DLG_BUILDING_TERMINAL_MANAGEMENT:
				mainLib.ExecuteMenu(DLG_BUILDING_TERMINAL_MANAGEMENT);
				break;
			case DLG_AUTHLOG_FAW_IMAGE_VIEW:
				mainLib.ExecuteMenu(DLG_AUTHLOG_FAW_IMAGE_VIEW);
				break;
			case DLG_HDHI_TNA_DISPLAY_MONTH_PERIODRESULT:
				mainLib.ExecuteMenu(DLG_HDHI_TNA_DISPLAY_MONTH_PERIODRESULT);
				break;
			case DLG_HDHI_TNA_DISPLAY_DAILY_PERIODRESULT:
				mainLib.ExecuteMenu(DLG_HDHI_TNA_DISPLAY_DAILY_PERIODRESULT);
				break;
			case DLG_HDHI_TNA_DISPLAY_BYPARTNER_PERIODRESULT:
				mainLib.ExecuteMenu(DLG_HDHI_TNA_DISPLAY_BYPARTNER_PERIODRESULT);
				break;
			case DLG_VIETNAM_INTEG_WATCH_TERMINAL_AUTHLOG:  
				console.log(e.content["InitVal"]);
				mainLib.ExecuteMenu(DLG_VIETNAM_INTEG_WATCH_TERMINAL_AUTHLOG, e.content["InitVal"]);	
				break;
			case DLG_ALMARAI_AUTHLOG_IMAGE:
				console.log(e.content["InitVal"]);
				mainLib.ExecuteMenu(DLG_ALMARAI_AUTHLOG_IMAGE, e.content["InitVal"]);
				break;
		default: notify("desktop-notify",{type : "warning", message :"미구현"}); break;
		}
	});
	
	var privilege = Number(account.getValue("Privilege"));

	// 육군본부 페이지로 이동하는 버튼 생성
	if( dataManager.getOemVersion() == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH){
		if (privilege == 1) {	// 관리자일 경우
			//if (Number(account.getValue("UserID")) == 1000000000000000000 ) {
				app.lookup("Army").visible = true;
				app.lookup("Army").enabled = true;
			//}
		} else {
			app.lookup("Army").visible = false;
			app.lookup("Army").enabled = false;
		}
	}
	
	
	// TODO : execute-function 같은 이벤트 이름으로 정의를 바꾸고. 삭제,추가 등의 Action을 변수로 넘겨 받아 분기 처리 필요.
	app.addEventListener("execute-command", function(e) {
		var target = e.content["target"];
		var command = e.content["command"];
		switch( target ){
			case DLG_USER_MANAGEMENT:
				var dlgUserManagement = programManager.getProcess(DLG_USER_MANAGEMENT,DLG_USER_MANAGEMENT);
			    if(dlgUserManagement ){
					switch( command ){
						case "Update":
							dlgUserManagement.ctrl.callAppMethod( "onUserUpdateSync", e.content["UserInfo"]);
						break;

						case "Delete":
							dlgUserManagement.ctrl.callAppMethod( "onUserDeleteSync", e.content["UserID"]);
						break;
					}
				}
			break;
			case DLG_TERMINAL_MANAGEMENT:
				var dlgTerminalManagement = programManager.getProcess(DLG_TERMINAL_MANAGEMENT,DLG_TERMINAL_MANAGEMENT);
			    if(dlgTerminalManagement ){
					switch( command ){
						case "Update":
							dlgTerminalManagement.ctrl.callAppMethod( "onTerminalUpdateSync", e.content["TerminalInfo"]);
						break;

						case "Delete":
							dlgTerminalManagement.ctrl.callAppMethod( "onTerminalDeleteSync", e.content["TerminalID"]);
						break;
					}
				}
			case DLG_TIMELINE_WEEKENDV:
				var dlgTimezone = programManager.getProcess(DLG_TIMELINE_WEEKENDV,DLG_TIMELINE_WEEKENDV);
			    if(dlgTimezone ){
					switch( command ){
						case "TimeLineUpdate":
							dlgTimezone.ctrl.callAppMethod( "onTimelineUpdate" );
						case "HolidayUpdate":
							dlgTimezone.ctrl.callAppMethod( "onHolidayUpdate" );
						break;
					}
				}
				break;
				
			//2019-10-07 정래훈  출입증 관련 기능
			case DLG_PASS_MANAGEMENT:
				var dlgPassManagement = programManager.getProcess(DLG_PASS_MANAGEMENT,DLG_PASS_MANAGEMENT);
			    if(dlgPassManagement ){
					switch( command ){
						case "Delete":
							dlgPassManagement.ctrl.callAppMethod( "onPassDeleteSync", e.content["PassID"]);
						break;
						case "ReFresh":
							dlgPassManagement.ctrl.callAppMethod( "onPassReFreshSync", e.content["PassID"]);
						break;
					}
				}
			break;
			case DLG_TIMELINE_WEEKENDN:
				var dlgTimezone = programManager.getProcess(DLG_TIMELINE_WEEKENDN,DLG_TIMELINE_WEEKENDN);
			    if(dlgTimezone ){
					switch( command ){
						case "TimeLineUpdate":
							dlgTimezone.ctrl.callAppMethod( "onTimelineUpdate" );
						case "HolidayUpdate":
							dlgTimezone.ctrl.callAppMethod( "onHolidayUpdate" );
						break;
					}
				}				
				break;
			case DLG_VISIT_MANAGEMENT:
				var dlgVisitManagement = programManager.getProcess(DLG_VISIT_MANAGEMENT,DLG_VISIT_MANAGEMENT);
			    if(dlgVisitManagement ){
					switch( command ){
						case "refresh":
							dlgVisitManagement.ctrl.callAppMethod( "onRefresh" );
						break;						
					}
				}				
				break;
			case ARMYHQ_REFRESH_LOGO:if( embeddedAppAmhq ){embeddedAppAmhq.callAppMethod("updateLogo")}break;
			default: notify("desktop-notify",{type : "warning", message :"unknown command"}); break;
		}
	});
	
	initNotify();

	comLib.showLoadMask("pro", dataManager.getString("Str_Data")+" "+dataManager.getString("Str_Sync"), "", 11);
	initData();

	dataManager.connectServer(window.location.host, dataManager.getAccountID(),dataManager.getAccountUuid(),onClose,onError,onMessage);
	
	// 이노뎁 버전 : 왼쪽 상단 헬프 메뉴 버튼 이벤트 비활성화, 배경화면 변경, 라이센스 버튼 비활성화, 버전 정보 0.1까지 출력
	if(dataManager.getOemVersion() == OEM_INNODEP){
		app.lookup("MAIN_btnProgramMenu").removeAllEventListeners();
		var bodyContainer = app.getContainer();
		bodyContainer.style.css({
			"background-image" : "url('../theme/images/innodep_vurix_img_bg_blue.png')",
		});
	// 자운대 버전 : 30분 타임아웃 기능 활성화
	}else if(dataManager.getOemVersion() == OEM_JAWOONDAE){
		
	}else if(dataManager.getOemVersion() == OEM_LOTTE_CS){
		var bodyContainer = app.getContainer();
		bodyContainer.style.css({
			"background-image" : "url('../theme/custom/lotte_cs/bg.jpg')",
		});
	} else if (dataManager.getOemVersion() == OEM_INNODEP_NORMAL) {
		document.title = dataManager.getString("Str_InnodepProgramName");
		var bodyContainer = app.getContainer();
		bodyContainer.style.css({
			"background-image" : "url('../theme/images/innodep_vurix_noimg_bg_blue.png')",
		});
	} else if(dataManager.getOemVersion() == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH){
		var bodyContainer = app.getContainer();
		bodyContainer.style.css({
			"background-repeat" : "no-repeat",
			"background-size" : "cover",
			"background-image" : "url('../theme/custom/armyhq/main_bg.jpg')"
		});
	} else if (dataManager.getOemVersion() == OEM_ITONE_TRDATA || dataManager.getOemVersion() == OEM_ITONE_POSCO_DX){ 
		// 아이티원 버전 배경화면 변경, 전체화면 비활성화
		
//		app.lookup("MAIN_btnProgramMenu").removeAllEventListeners();


		// 아이티원 전체메뉴 숨김.... 이거 전체메뉴 숨기면 안되겠네. 사용자도 관리자로 줘야하니까 
//		if(dataManager.getAccountID() != 1000000000000000000){
//			app.lookup("MAIN_btnProgramMenu").visible = false;
//		}
		
		var bodyContainer = app.getContainer();
		bodyContainer.style.css({
			"background-repeat" : "no-repeat",
//			"background-size" : "cover",
//			"background-image" : "url('../theme/itone/Smart Safety innerSetting_20231018.jpg')"
			"background-image" : "none",
			"background-color" : "black",
		});
		
		var logoImg = app.lookup("os_centerImg");
		logoImg.visible = true;
		logoImg.style.css({
			"background-repeat" : "no-repeat",
			"background-image" : "url('../theme/custom/itone/sf_main_img.png')",
		})
		
		app.lookup("menubar").style.css({
			"background-color" : "black",
		});
		
		app.lookup("MAIN_btnSmartSafety").visible = true;
		app.lookup("sms_getItoneFieldInfo").send();
		
	} else{
		
	}
	
	/*
	app.lookup("OPT_SessionTime").visible = true; // 버전 구분 없음
	app.lookup("onSessionTimeButton").visible = true;
	var sms_sessionPing = app.lookup("sms_sessionPing");
	sms_sessionPing.send();
	*/ 
	
	
}


function onSessionTime(){
	var OPT_SessionTime = app.lookup("OPT_SessionTime");
	var Time = app.lookup("TimeInfo").getValue("Minute");
	currentTime = new Date();
	var SecGap =  currentTime - previousTime;
	SessionTime = SessionTime - (SecGap/1000);
	if (SessionTime < 0){ // 클라이언트 타임 아웃으로 00:00:00 
		var Timer = "00:00:00";	// 남은 시간 계산
		OPT_SessionTime.value = Timer;
		previousTime = currentTime;
	} else { // 카운팅 진행중.
		var Minute = Math.floor(SessionTime / 60); // 분1
		var Hour = Math.floor(Minute / 60); // 분을 60으로 남으면 시간
		var Second = Math.floor(SessionTime % 60);
		var Minute2 = Math.floor(Minute % 60); // 분2
		
		if(Minute2 > 0 && Minute2 < 10){
			Minute2 = "0"+Minute2;
		} else if (Minute <= 0) {
			Minute2 = "00";
		}
		
		if(Hour > 0 && Hour < 10){
			Hour = "0"+Hour;
		} else if (Hour <= 0) {
			Hour = "00";
		}
		
		if(Second > 0 && Second < 10){
			Second = "0"+Second;
		}else if (Second <= 0) {
			Second = "00";
		}
		
		var Timer = Hour + ":" + Minute2+ ":" + Second;	// 남은 시간 계산
		OPT_SessionTime.value = Timer;
		previousTime = currentTime;
		
		setTimeout(onSessionTime,1000);
	}

}



function onSessionLogOut(){
	app.lookup("sms_logout").send();
}


function onSms_logoutSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	var sms_logout = e.control;
	var appld = "app/app" + "?" + usint_version;
	cpr.core.App.load(appld, function(newapp) {
		app.getRootAppInstance().close();
		location.reload();//임시..현재 app 최초호출 시 라이브러리들이 호출되는데 로그아웃 후 newInstance를 해도 라이브러리는 안불러와서 화면이 보이지 않음
	});
	return;
}


/*
 * "Button" 버튼(onSessionTimeButtion)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onOnSessionTimeButtonClick(/* cpr.events.CMouseEvent */ e){
	var sms_sessionPing = app.lookup("sms_sessionPing");
	sms_sessionPing.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_sessionPingSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultMap = app.lookup("Result");
	var resultCode = resultMap.getValue("ResultCode");
	if(resultCode == COMERROR_NONE){
		
		var Time = app.lookup("TimeInfo").getValue("Minute"); //  서버로부터 시간을 받아서 변수에 할당
		//console.log("onSms_sessionPingSubmitDone : " + Time);
		SessionTime = Time * 60; // 시간이 분 단위로 넘어오기 때문에 60을 곱해서 초 단위로 바꿔준다.
		previousTime = new Date();
		//onSessionTimer(Time);
		if(TimeFlag == 0){ // 페이지를 새로고침했을시 최초 한번만 함수를 실행시키기 위해 작성
			if (Time == 0) {
				app.lookup("OPT_SessionTime").visible = false; // 버전 구분 없음
				app.lookup("onSessionTimeButton").visible = false;
				
				return
			}
			onSessionTime();
			TimeFlag = 1;
		}
	}
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_sessionPingSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR);
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_sessionPingSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

var logoutMessage = true; 
function onClose(message){
	var msg = dataManager.getString("Str_ErrorServerDisconnected");
	if(logoutMessage==true){
		alert(msg);
	}
	//console.log(cpr.core.App);
    cpr.core.App.load("app/app", function(newapp) {
		var programManager = cpr.core.Module.require("lib/ProgramManager");
		programManager.dispose();
		var dataManager = cpr.core.Module.require("lib/DataManager");
		dataManager = getDataManager();
		dataManager.dispose();

		app.getRootAppInstance().close();
		//newapp.createNewInstance().run();
		location.href = window.location.href;
	}); 
	
}
function onError(message){
	console.log("error... " + message);
}
function updateTerminalStatus(msg){
	
	var terminal = dataManager.getTerminal(msg.TerminalID);
	if (terminal) {
		var status = terminal.getValue("Status");
		switch(msg.Content){
			case EventLogTerminalDisconnected: status &= ~TerminalStatusConnect; terminal.setValue("Status", status); break;
			case EventLogTerminalConnected:	if(status != "1"){status |= TerminalStatusConnect; terminal.setValue("Status", status);} break;
			case EventLogDoorOpen: status |= TerminalStatusDoor; terminal.setValue("Status", status);break;
			case EventLogDoorClose: status &= ~TerminalStatusWarnFire; terminal.setValue("Status",status);break;			
			case EventLogDoorForced: status |= TerminalStatusDoorEmergency; terminal.setValue("Status", status);break;
			case EventLogDoorNotClosed: status &= ~TerminalStatusDoorOpenWarn; terminal.setValue("Status",status);break;			 
			case EventLogDoorLockRestored: status &= ~TerminalStatusDoorLockWorking; terminal.setValue("Status",status);break;
			case EventLogDoorLockError: status |= TerminalStatusDoorLockWorking; terminal.setValue("Status", status);break;			
			case EventLogDoorNotMonitor: status |= TerminalStatusDoorNotMonitoring; terminal.setValue("Status", status);break;
			
			case EventLogDoorRemoteOpen: status |= TerminalStatusDoorOpenState; terminal.setValue("Status", status);break;
			case EventLogDoorRemoteUnlock : status |= TerminalStatusDoorLookState; terminal.setValue("Status",status);break;
			case EventLogDoorRemoteLock: status &= ~TerminalStatusDoorLookState; terminal.setValue("Status",status);break;
						      
			case EventLogTerminalLocked: status |= TerminalStatusLock; terminal.setValue("Status",status);break;
			case EventLogTerminalUnlocked: status &= ~TerminalStatusLock; terminal.setValue("Status",status);break;
			 
			case EventLogTerminalAttached: status &= ~TerminalStatusCover; terminal.setValue("Status",status);break;
			case EventLogTerminalTamper: status |= TerminalStatusCover; terminal.setValue("Status",status);break;
						
			case EventEmergencyFireDetectStart: status |= TerminalStatusWarnFire; terminal.setValue("Status", status);	break;
			case EventEmergencyFireDetectStop: status &= ~TerminalStatusWarnFire; terminal.setValue("Status", status);	break;
			
			//패닉 감지 시작, 패닉 감지 종료
			case EventEmergencyPanicDetectStart : status |= TerminalStatusWarnPanic; terminal.setValue("Status", status);	break;
			case EventEmergencyPanicDetectStop: status &= ~TerminalStatusWarnPanic; terminal.setValue("Status", status);	break;
			//비상 감지 시작, 비상 감지 종료
			case EventEmergencyCrisisDetectStart : status |= TerminalStatusWarnCricis; terminal.setValue("Status", status);	break;
			case EventEmergencyCrisisDetectStop: status &= ~TerminalStatusWarnCricis; terminal.setValue("Status", status);	break;
		}
	}
}
function onMessage(message){
	//2019-08-20 정래훈 작업관리자에 실행되는 작업이 있을시 '작업 중' 애니메이션을 실행시키기 위해 추가
	
	var msg = JSON.parse(message.data);
	
    switch( msg.msgId){
    case WSCmdLogoutNotify:
    	var msgBody = JSON.parse(msg.body);
    	//console.log("WSCmdLogoutNotify : ",msg);
    	//0 : 로그인 요청한 컨트롤 서버가 다른 경우나 새로운 웹 로그인 요청
		//1 : Client Logout by timeout
		//2 : 사용자 삭제
    	//console.log("userID : "+  msgBody.UserId + " Type : " + msgBody.Type);
		switch(msgBody.Type){
			case 0 : var msg = dataManager.getString("Str_LogoutInfo"); break;
			case 1 : var msg = dataManager.getString("Str_LogoutTimeOut"); break;
			case 2 : var msg = dataManager.getString("Str_LogoutDeleteUser"); break;
		}
    	alert(msg);
	    cpr.core.App.load("app/app", function(newapp) {
			var programManager = cpr.core.Module.require("lib/ProgramManager");
			programManager.dispose();
			var dataManager = cpr.core.Module.require("lib/DataManager");
			dataManager = getDataManager();
			dataManager.dispose();
			
			app.getRootAppInstance().close();
			newapp.createNewInstance().run();
		});
    	break;
    case WSCmdLogAuthNotify:
    	var msgBody = JSON.parse(msg.body);
    	
    	console.log("WSCmdLogAuthNotify : ",msg);
    	var dlgMonitoring = programManager.getProcess(DLG_MONITORING_MANAGEMENT,DLG_MONITORING_MANAGEMENT);
    	if(dlgMonitoring ){
    		dlgMonitoring.ctrl.callAppMethod( "addAuthLog", msgBody);
		}

		var dlgMonitoringTerminal = programManager.getProcess(DLG_MONITORING_TERMINAL,DLG_MONITORING_TERMINAL+"_"+msgBody.TerminalID);
		if (dlgMonitoringTerminal){
			dlgMonitoringTerminal.ctrl.callAppMethod( "addAuthLog", msgBody);
		}
		
		// 전광판		
		var dlgMonitoringTerminal = programManager.getProcess(DLG_MONITORING_DISPLAY_BOARD,DLG_MONITORING_DISPLAY_BOARD);
		if (dlgMonitoringTerminal){
			dlgMonitoringTerminal.ctrl.callAppMethod( "addAuthLog", msgBody);
		}

		var dlgMonitoringTerminal = programManager.getProcess(DLG_MAP_AREA_MONITORING,DLG_MAP_AREA_MONITORING);
		if (dlgMonitoringTerminal){
			dlgMonitoringTerminal.ctrl.callAppMethod( "addAuthLog", msgBody);
		}
		if (embeddedAppAmhq != undefined && embeddedAppAmhq.disposed == false) {
			embeddedAppAmhq.callAppMethod("addAuthLog", msgBody);
		}
		
		var dlgLiveView = programManager.getProcess(DLG_TERMINAL_LIVEVIEW, DLG_TERMINAL_LIVEVIEW);
		if(dlgLiveView){
			dlgLiveView.ctrl.callAppMethod("addAuthLog",msgBody);
		}
		
		if (dataManager.getOemVersion() == OEM_MOTORCYCLE_PARK) {
			
			// 권한 1000 번 이상일때만 qrcode 창
			var accountInfo = dataManager.getAccountInfo();
			var privilege = Number(accountInfo.getValue("Privilege"));
			
			if ( privilege >= 1000 ) {
				var qrFlag = 0;
			
				var payooQRCodeURI = msgBody.OEMParam3;
				var payooQRCodeURL = msgBody.OEMParam4;
				
				var test = app.getFloatingControls();
				if (test.length > 0) {
					app.getFloatingControls().forEach(function(each){
						if (each.name == "BPARKQRcode") {
							qrFlag++;
						}
					});
				}
				
				// qrCode 창 띄어져 있으면 리턴
				if (qrFlag > 0) {
					return;
				}
				
				var path = "app/custom/motorcycle_park/BPARKQRcode";
				if (payooQRCodeURI != "" || payooQRCodeURL != "") {
	//				app.openDialog(path, {width : 400, height : 400}, function(dialog){
					 app.openDialog(path, {width : 450, height : 750}, function(dialog){
						dialog.headerTitle = "QRCode";
						dialog.modal = true;	
						dialog.initValue = {
							"payooQRCodeURI": payooQRCodeURI,
							"payooQRCodeURL": payooQRCodeURL
						};
						dialog.name = "BPARKQRcode";
					}).then(function(returnValue){
						// 결제값 받은후
						if (returnValue == "QRCodeTimeOut") {
							
						}
					});	
				}
			}
		} else if (dataManager.getOemVersion() == OEM_VIETNAM_INTEG_CONTROL) {
			var enrolledTerminalInfo = dataManager.getEnrolledTerminalInfo(msgBody["TerminalID"]);
			if (enrolledTerminalInfo != null && enrolledTerminalInfo != undefined) {
				popupOEMVicAuthLog(msgBody);
			}
		}
		
		
    	break;
    case WSCmdAuthLogImageNotify:
    
	    var msgBody = JSON.parse(msg.body);
	    //console.log("WSCmdAuthLogImageNotify : ",msg);
	    var dlgMonitoring = programManager.getProcess(DLG_MONITORING_MANAGEMENT,DLG_MONITORING_MANAGEMENT);
    	if(dlgMonitoring ){
			dlgMonitoring.ctrl.callAppMethod( "setAuthLogImage", msgBody);
		}
	    var dlgMonitoringTerminal = programManager.getProcess(DLG_MONITORING_TERMINAL,DLG_MONITORING_TERMINAL+"_"+msgBody.TerminalID);
		if (dlgMonitoringTerminal){
			dlgMonitoringTerminal.ctrl.callAppMethod( "setAuthLogImage", msgBody);
		}

    	break;

    case WSCmdLogEventNotify:
    	var msgBody = JSON.parse(msg.body);
    	
    	//console.log("WSCmdLogEventNotify : ",msg);
    	
    	updateTerminalStatus(msgBody);
				
		if( msgBody.Category == 3){
			var type = "warning";
			var notiMsg = dataManager.getString("Str_Terminal")+ " ["+ msgBody.TerminalID+"] : ";
			switch( msgBody.Content){
				case 196609: notiMsg += dataManager.getString("Str_EmergencyAlarm"); break;
				case 196610: notiMsg += dataManager.getString("Str_EmergencyDisarm");type = "success"; break;
				case 196611: notiMsg += dataManager.getString("Str_EmergencyFireDetectStart");  break;
				case 196612: notiMsg += dataManager.getString("Str_EmergencyFireDetectStop");type = "success"; break;
				case 196613: notiMsg += dataManager.getString("Str_EmergencyPanicDetectStart");  break;
				case 196614: notiMsg += dataManager.getString("Str_EmergencyPanicDetectStop");type = "success"; break;
				case 196615: notiMsg += dataManager.getString("Str_EmergencyCrisisDetectStart");  break;
				case 196616: notiMsg += dataManager.getString("Str_EmergencyCrisisDetectStop");type = "success"; break;				
				case 196617: notiMsg += dataManager.getString("Str_EmergencyBlacklistAttempt");break;
				case 196624: notiMsg += dataManager.getString("Str_EmergencyDuress");break;
			}
			notify("desktop-notify",{type : type, message :notiMsg} ); 
		}
		
    	var dlgMonitoring = programManager.getProcess(DLG_MONITORING_MANAGEMENT,DLG_MONITORING_MANAGEMENT);
    	if(dlgMonitoring ){
			dlgMonitoring.ctrl.callAppMethod( "addEventLog", msgBody);
		}
		var dlgMonitoringTerminal = programManager.getProcess(DLG_MONITORING_TERMINAL,DLG_MONITORING_TERMINAL+"_"+msgBody.TerminalID);
		if (dlgMonitoringTerminal){
			dlgMonitoringTerminal.ctrl.callAppMethod( "addEventLog", msgBody);
		}
		var dlgMonitoringTerminal = programManager.getProcess(DLG_MAP_AREA_MONITORING,DLG_MAP_AREA_MONITORING);
		if (dlgMonitoringTerminal){
			dlgMonitoringTerminal.ctrl.callAppMethod( "addEventLog", msgBody);
		}
		
		if( embeddedAppAmhq ){ // main/mainEmb/help.clx에는 addEventLog 함수가 없음. 육본향에서만 동작
			if (embeddedAppAmhq.hasAppMethod("addEventLog")){
				embeddedAppAmhq.callAppMethod("addEventLog", msgBody);
			}		
		}
		
		var dlgLiveView = programManager.getProcess(DLG_TERMINAL_LIVEVIEW, DLG_TERMINAL_LIVEVIEW);
		if(dlgLiveView){
			dlgLiveView.ctrl.callAppMethod("addEventLog",msgBody);
		}
		
		break;

	case WSCmdTerminalLiveInfo:
		var msgBody = JSON.parse(msg.body);
//		console.log("WSCmdTerminalLiveInfo : ",msg);
		dataManager.updateTerminal(msgBody[0]);

    	var dlgMonitoring = programManager.getProcess(DLG_MONITORING_MANAGEMENT,DLG_MONITORING_MANAGEMENT);
    	if(dlgMonitoring ){
			dlgMonitoring.ctrl.callAppMethod( "updateTerminalStatus", msgBody);
		}

		var dlgMonitoringTerminal = programManager.getProcess(DLG_MONITORING_TERMINAL,DLG_MONITORING_TERMINAL+"_"+msgBody[0].ID);
		if (dlgMonitoringTerminal){
			dlgMonitoringTerminal.ctrl.callAppMethod( "updateTerminalStatus", msgBody);
		}

		var dlgMapMonitoringTerminal = programManager.getProcess(DLG_MAP_AREA_MONITORING,DLG_MAP_AREA_MONITORING);
		if (dlgMapMonitoringTerminal){
			dlgMapMonitoringTerminal.ctrl.callAppMethod( "updateTerminalStatus", msgBody);
		}
		
		if( embeddedAppAmhq ){ // main/mainEmb/help.clx에는 updateTerminalStatus 함수가 없음. 육본향에서만 동작
			if (embeddedAppAmhq.hasAppMethod("updateTerminalStatus")){
				embeddedAppAmhq.callAppMethod("updateTerminalStatus", msgBody);				
			}
		}
		
		if(dataManager.getOemVersion() == OEM_VIETNAM_INTEG_CONTROL) {
			popupOEMVICCTV(msgBody);
		}
		
		break;

    case WSCmdServiceStatusNotify:
    	var msgBody = JSON.parse(msg.body);
		// console.log("WSCmdServiceStatusNotify : ",msg);
    	dataManager = getDataManager();
    	if( dataManager ){
    		dataManager.setTaskInfo(msgBody.TaskInfo);
    	}
    	var udcUserAgent = app.lookup("MAIN_udcUserAgent");
    	if(udcUserAgent){    	
    		var doAnimation = false;
    		if (msgBody.TaskInfo != null) {    			    		
    			for (var i =0 ; i < msgBody.TaskInfo.length ; i++) {
	    			if(msgBody.TaskInfo != null && msgBody.TaskInfo[i].State != 65535){
	    				doAnimation = true;
	    			}
	    			
		    		var dlgDownloadManager = programManager.getProcess(DLG_DOWNLOAD_MANAGER,DLG_DOWNLOAD_MANAGER);
		    		if(dlgDownloadManager ){
						dlgDownloadManager.ctrl.callAppMethod( "updateTaskList", msgBody.TaskInfo);
					}
    			}
    		} 
    		if( doAnimation == true) {
    			udcUserAgent.animateStart();
    		}else{
    			udcUserAgent.animateEnd();
    		}
    	}
    	
		//2019-08-20 정래훈 작업관리자에 실행되는 작업이 있을시 '작업 중' 애니메이션을 실행시키기 위해 추가

    	if( app != null ){
	    	var dashBoard = app.lookup("emb_Dashboard");
	    	if(dashBoard){
	    		dashBoard.callAppMethod( "setServiceStatus", msgBody);
	    	}
	    }
	    
	    if (msgBody.VmsPopupStat != null) {
	    	for (var i=0 ; i < msgBody.VmsPopupStat.length; i++) {
	    		switch (Number(msgBody.VmsPopupStat[i].VmsType)) {
	    		case VMSIDIS:
	    			var url = "g2client://proto/live?"
					if (msgBody.VmsPopupStat[i].CameraName != "") {
						var cameraName = msgBody.VmsPopupStat[i].CameraName.toString().split("/")[1].trim();
						//url += 'fen=' + btoa(unescape(encodeURIComponent(msgBody.VmsPopupStat[i].CameraName))) + '&';
						url += 'fen=' + btoa(unescape(encodeURIComponent(cameraName))) + '&';
					}		
					if (msgBody.VmsPopupStat[i].CameraIP != "") {
						url += 'address=' + msgBody.VmsPopupStat[i].CameraIP + '&';
					}
					if (msgBody.VmsPopupStat[i].CameraPort != "0") {
						url += 'port=' + msgBody.VmsPopupStat[i].CameraPort + '&';
					}
					if (msgBody.VmsPopupStat[i].Param1 != "") {
						url += 'chs=' + String(parseInt(msgBody.VmsPopupStat[i].Param1, 10) - 1) + '&';
					}
			
					console.log(url);
					window.location.href = url;
	    			break;
	    		default:	    			
	    		}
	    	}
	    }
    	break;
    case WSCmdTerminaSearchRes:
    	var msgBody = JSON.parse(msg.body);
    	//console.log("WSCmdTerminaSearchRes : ",msg);
    	var dlgTerminalSearchManager = programManager.getProcess(DLG_TERMINAL_SEARCH,DLG_TERMINAL_SEARCH);
    	if(dlgTerminalSearchManager ){
			dlgTerminalSearchManager.ctrl.callAppMethod( "addTerminalList", msgBody);
		}
    	break;
    case WSCmdSetTerminaSearchRes:
    	var msgBody = JSON.parse(msg.body);
    	//console.log("WSCmdSetTerminaSearchRes : ",msg);
    	var dlgTerminalSearchManager = programManager.getProcess(DLG_TERMINAL_SEARCH,DLG_TERMINAL_SEARCH);
    	if(dlgTerminalSearchManager ){
			dlgTerminalSearchManager.ctrl.callAppMethod( "SetResultCode", msgBody.ResultCode);
		}
    	break;
    case WSCmdTerminalNoticeSetNotify:
		//console.log("WSCmdTerminalNoticeSetNotify : ",msg);
    	var dlgNoticeManagement = programManager.getProcess(DLG_NOTICE_MANAGEMENT,DLG_NOTICE_MANAGEMENT);
    	if(dlgNoticeManagement ){
			dlgNoticeManagement.ctrl.callAppMethod( "setNoticeResult", msg);
		}
    	break;
    case WSCmdGroupSyncNotify:
    	var msgBody = JSON.parse(msg.body);
    	if( msgBody == null ){return;}
		//console.log("WSCmdGroupSyncNotify : ",msg);
    	if( msgBody.SyncType == 1 ){
    		dataManager.insertGroup(msgBody.GroupInfo);
    	}else if( msgBody.SyncType == 2 ){
    		dataManager.updateGroup(msgBody.GroupInfo);
    	}else if( msgBody.SyncType == 3 ){
    		dataManager.deleteGroup(msgBody.GroupInfo.GroupID);
    		var groupID = msgBody.GroupInfo.GroupID;
			var dsGroupList = dataManager.getGroup();
			deleteSubGroup(dsGroupList,groupID);

			var count = dsGroupList.getRowCount();
			for( var i = 0; i < count; i++ ){
				var row = dsGroupList.getRow(i);
				if (row ){
					if( row.getStateString()== "D" || row.getStateString()== "ID"){
						dataManager.deleteGroup(row.getValue("GroupID"));
					}
				}
			}
			dsGroupList.commit();
    	}
    	break;
    case WSCmdPositionSyncNotify:
    	var msgBody = JSON.parse(msg.body);
    	if( msgBody == null ){return;}
		//console.log("WSCmdPositionSyncNotify : ",msg);
    	if( msgBody.SyncType == 1 ){
    		dataManager.insertPosition(msgBody.PositionInfo);
    	}else if( msgBody.SyncType == 2 ){
    		dataManager.updatePosition(msgBody.PositionInfo);
    	}else if( msgBody.SyncType == 3 ){
    		dataManager.deletePosition(msgBody.PositionInfo.PositionID);
    	}
    	break;    	

    case WSCmdTerminalSyncNotify:
    	var msgBody = JSON.parse(msg.body);
    	if( msgBody == null ){return;}
		//console.log("WSCmdTerminalSyncNotify : ",msg);
    	if( msgBody.SyncType == 1 ){ // add    	
    		dataManager.insertTerminal(msgBody.TerminalInfo);
    	}else if( msgBody.SyncType == 2 ){ // update    	
    		dataManager.updateTerminal(msgBody.TerminalInfo);
    	}else if( msgBody.SyncType == 3 ){ // delete
    		dataManager.deleteTerminal(msgBody.TerminalInfo.ID);
    	} else if (msgBody.SyncType == 4) { // unRegist
    		dataManager.insertTerminal(msgBody.TerminalInfo);
    	}
    	var dlgMonitoring = programManager.getProcess(DLG_MONITORING_MANAGEMENT,DLG_MONITORING_MANAGEMENT);
    	if(dlgMonitoring ){
			dlgMonitoring.ctrl.callAppMethod( "updateTerminalInfo", msgBody.TerminalInfo, msgBody.SyncType );
		}

    	break;

    case WSCmdTerminalLogUploadNotify:
    	var msgBody = JSON.parse(msg.body);
		//console.log("WSCmdTerminalLogUploadNotify : ",msg);
    	var dlgTerminalLogManagement = programManager.getProcess(DLG_TERMINAL_LOG_MANAGEMENT,DLG_TERMINAL_LOG_MANAGEMENT);
    	if(dlgTerminalLogManagement ){
			dlgTerminalLogManagement.ctrl.callAppMethod( "uploadStatusNotify", msgBody);
		}
    	break;
    	
    case WSCmdAccessGroupSyncNotify:
    	var msgBody = JSON.parse(msg.body);
    	if( msgBody == null ){return;}

		app.lookup("AccessAreaGroupList").clear();
    	var sms_getAccessAreaGroup = app.lookup("sms_getAccessAreaGroup")
		sms_getAccessAreaGroup.setParameters("areas", "true");
		sms_getAccessAreaGroup.setParameters("joinInfo", "true");
		sms_getAccessAreaGroup.send();    	
		
    	//console.log("WSCmdAccessGroupSyncNotify : ",msg);
    	if( msgBody.SyncType == 1 ){
    		dataManager.insertAccessGroup(msgBody.AccessGroupInfo);
    	}else if( msgBody.SyncType == 2 ){
    		dataManager.updateAccessGroup(msgBody.AccessGroupInfo);
    	}else if( msgBody.SyncType == 3 ){
    		dataManager.deleteAccessGroup(msgBody.AccessGroupInfo.ID);
    	}
    	break;
    case WSCmdAccessAreaSyncNotify:
    	var msgBody = JSON.parse(msg.body);
    	if( msgBody == null ){return;}
		//console.log("WSCmdAccessAreaSyncNotify : ",msg);
    	if( msgBody.SyncType == 1 ){
    		dataManager.insertAccessArea(msgBody.AccessAreaList);
    	} else if( msgBody.SyncType == 2 ){
    		dataManager.updateAccessArea(msgBody.AccessAreaList);
    	} else if( msgBody.SyncType == 3 ){
    		dataManager.deleteAccessArea(msgBody.AccessAreaList.ID);
    	}
    	break;
    case WSCmdTimezoneSyncNotify:   	
    	var msgBody = JSON.parse(msg.body);
    	if( msgBody == null ){return;}
		//console.log("WSCmdTimezoneSyncNotify : ",msg);
    	if( msgBody.SyncType == 1 ){
    		dataManager.insertTimezone(msgBody.TimezoneInfo);
    	}else if( msgBody.SyncType == 2 ){
    		dataManager.updateTimezone(msgBody.TimezoneInfo);
    	}else if( msgBody.SyncType == 3 ){
    		dataManager.deleteTimezone(msgBody.TimezoneInfo.ID);
    	}
    	
    	if (dataManager.getSystemBrandType() == BRAND_VRIDI){ // 버디 타임존 관리 화면
	    	var dlgTimezone = programManager.getProcess(DLG_TIMELINE_WEEKENDV,DLG_TIMELINE_WEEKENDV);
	    	if(dlgTimezone ){
				dlgTimezone.ctrl.callAppMethod( "updateTimezoneInfo", msgBody);
			}
		} else if (dataManager.getSystemBrandType() == BRAND_NITGEN){ // 니트젠 타임존 관리 화면
	    	var dlgTimezone = programManager.getProcess(DLG_TIMELINE_WEEKEND,DLG_TIMELINE_WEEKEND);
	    	if(dlgTimezone ){
				dlgTimezone.ctrl.callAppMethod( "updateTimezoneInfo", msgBody);
			}			
		}
		var dlgAccessGroup = programManager.getProcess(DLG_ACCESSGROUP_MANAGEMENT,DLG_ACCESSGROUP_MANAGEMENT);
    	if(dlgAccessGroup ){
			dlgAccessGroup.ctrl.callAppMethod( "updateTimezoneInfo", msgBody); // 출입그룹에서 설정하는 타임존 업데이트
		}
    	break;
    	
    case WSCmdPrivilegeSyncNotify:
    	var msgBody = JSON.parse(msg.body);
    	if( msgBody == null ){return;}
		
    	if( msgBody.SyncType == 1 ){
    		dataManager.insertPrivilege(msgBody.PrivilegeInfo);
    	}else if( msgBody.SyncType == 2 ){
    		dataManager.updatePrivilege(msgBody.PrivilegeInfo);
    	}else if( msgBody.SyncType == 3 ){
    		dataManager.deletePrivilege(msgBody.PrivilegeInfo.PrivilegeID);
    	}
    	var dlgAccessGroup = programManager.getProcess(DLG_PRIVILEGE_MANAGEMENT,DLG_PRIVILEGE_MANAGEMENT);
    	if(dlgAccessGroup ){
			dlgAccessGroup.ctrl.callAppMethod( "refreshList", msgBody); // 출입그룹에서 설정하는 타임존 업데이트
		}
    	break;
    	
    case WSCmdUserMessageSyncNotify:
    	var msgBody = JSON.parse(msg.body);
    	if( msgBody == null ){return;}		
    	if( msgBody.SyncType == 1 ){
    		dataManager.insertUserMessage(msgBody.UserMessageInfo);
    	}else if( msgBody.SyncType == 2 ){
    		dataManager.updateUserMessage(msgBody.UserMessageInfo);
    	}else if( msgBody.SyncType == 3 ){
    		dataManager.deleteUserMessage(msgBody.UserMessageInfo.MessageID);
    	}
    	break;
    	
	case WSCmdLogInTimerExtendNotify:		
		var msgBody = JSON.parse(msg.body);		
		var accountInfo = dataManager.getAccountInfo();
		var privilege = Number(accountInfo.getValue("Privilege"));
		
		if (msgBody.Timer > 0 && privilege != DLG_DISPLAYBOARD_MANAGEMENT) { // 전광판 관리자 예외
			if (app.lookup("OPT_SessionTime").visible == false) {
				app.lookup("OPT_SessionTime").visible = true; // 버전 구분 없음
				app.lookup("onSessionTimeButton").visible = true;	
			}	
			
			//console.log("WSCmdLogInTimerExtendNotify : " + msgBody.Timer);
			SessionTime = msgBody.Timer * 60; // 시간이 분 단위로 넘어오기 때문에 60을 곱해서 초 단위로 바꿔준다.			
			previousTime = new Date();
			if(TimeFlag == 0){ // 페이지를 새로고침했을시 최초 한번만 함수를 실행시키기 위해 작성
				onSessionTime();
				TimeFlag = 1;
			}
		} else {
			app.lookup("OPT_SessionTime").visible = false; // 버전 구분 없음
			app.lookup("onSessionTimeButton").visible = false;
				
			return;
		}	
		break;
		
	case WSCmdGroupTerminalSyncNotify:
		var msgBody = JSON.parse(msg.body);
		if( msgBody.SyncType == 2 ){ // update
    		dataManager.updateTerminalGroupCode( msgBody.GroupInfo.GroupID, msgBody.TerminalID );
    	}
		var dlgMonitoring = programManager.getProcess(DLG_MONITORING_MANAGEMENT,DLG_MONITORING_MANAGEMENT);
    	if(dlgMonitoring ){
			dlgMonitoring.ctrl.callAppMethod( "updateTerminalGroupCode", msgBody.GroupInfo.GroupID, msgBody.TerminalID);
		}
		
		break;
	case WSCmdServerOptionSyncNotify:
		var msgBody = JSON.parse(msg.body);
		var optionInfo = app.lookup("ServerOption");
		optionInfo.build(msgBody);
		//console.log(optionInfo.getDatas());
		dataManager.setClientOption(optionInfo);
		break;
		
	case WSCmdElevatorSetNotify:
		break;
	case WSCmdWorkTypeSynNotify:
		var msgBody = JSON.parse(msg.body);
		switch (msgBody.SyncType) {
		case 1:	// add
			dataManager.insertTnaTypeList(msgBody.WorkSchedule);
			break;
		case 2:	// update
			dataManager.updateTnaTypeList(msgBody.WorkSchedule);
			break;
		case 3:	// delete
			dataManager.deleteTnaTypeList(msgBody.WorkSchedule);
			break;							
		}
	
		break;		
	case WSCmdMealInfoSynNotify:
    	var msgBody = JSON.parse(msg.body);
    	if( msgBody == null ){return;}
    	if( msgBody.SyncType == 1 ){
    		dataManager.insertMeal(msgBody.MealInfo);
    	}else if( msgBody.SyncType == 2 ){
    		dataManager.updateMeal(msgBody.MealInfo);
    	}else if( msgBody.SyncType == 3 ){
    		dataManager.deleteMeal(msgBody.MealInfo.Code);
    	}
    	break;
    case WSCmdBoskAcuDeviceLiveInfo:
    	var msgBody = JSON.parse(msg.body);
    	var oemVersion = dataManager.getOemVersion();
		if (oemVersion == OEM_BOSK_CAPS) {
			var dlgMapMonitoringAcuDevice = programManager.getProcess(DLG_IDTECK_ACU_DEVICE_MONITORING,DLG_IDTECK_ACU_DEVICE_MONITORING);
			if (dlgMapMonitoringAcuDevice){
				dlgMapMonitoringAcuDevice.ctrl.callAppMethod( "updateIdteckAcuLiveStatus", msgBody);
			}
		}
    	break;
    case WSCmdBoskAcuDeviceEventLogNotify:
		var msgBody = JSON.parse(msg.body);
		console.log(msgBody);
   		var oemVersion = dataManager.getOemVersion();
		if (oemVersion == OEM_BOSK_CAPS) {
			var dlgMapMonitoringAcuDevice = programManager.getProcess(DLG_IDTECK_ACU_DEVICE_MONITORING,DLG_IDTECK_ACU_DEVICE_MONITORING);
			if (dlgMapMonitoringAcuDevice){
				dlgMapMonitoringAcuDevice.ctrl.callAppMethod( "addIdteckAcuEventLog", msgBody);
			}				
		}
	case WSCmdAlmaraiAuthLogImageNotify:
		var msgBody = JSON.parse(msg.body);
		console.log(msgBody);
		var oemVersion =  dataManager.getOemVersion();
		if(oemVersion == OEM_ALMARAI_AUTHINFO) {
			var dlgMonitoring = programManager.getProcess(DLG_MONITORING_MANAGEMENT,DLG_MONITORING_MANAGEMENT);
	    	if(dlgMonitoring ){
				dlgMonitoring.ctrl.callAppMethod( "setAuthLogImage", msgBody);
			}
		    var dlgMonitoringTerminal = programManager.getProcess(DLG_MONITORING_TERMINAL,DLG_MONITORING_TERMINAL+"_"+msgBody.TerminalID);
			if (dlgMonitoringTerminal){
				dlgMonitoringTerminal.ctrl.callAppMethod( "setAuthLogImage", msgBody);
			}
		}
		break;
		
    default: console.log("msg ", msg.msgId);break;
    
   	}
}

function popupOEMVicAuthLog( msgBody ){

	var dlgMonitoringAuthImage = programManager.getProcess(DLG_VIETNAM_INTEG_WATCH_TERMINAL_AUTHLOG,DLG_VIETNAM_INTEG_WATCH_TERMINAL_AUTHLOG);
    if(dlgMonitoringAuthImage ){ // 떠있으면 끄기
		dlgMonitoringAuthImage.ctrl.close();
	}	
	console.log(msgBody);
	var AuthImageLeft = 50;
	var AuthImagetop = 100;
	var AuthImageWidth = 300; 
	var AuthImageHeight = 410;
	
	var menu_id = DLG_VIETNAM_INTEG_WATCH_TERMINAL_AUTHLOG;
	var path = "app/custom/vietnam/integ/watchTerminalAuthLog" + "?" + usint_version;
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target":DLG_VIETNAM_INTEG_WATCH_TERMINAL_AUTHLOG,
			"InitVal": {
				"menu_id" : menu_id,
				"logImage": msgBody["LogImage"],
				"logTerminalID": msgBody["TerminalID"],
				"logTerminalName": msgBody["TerminalName"],
				"logUserName": msgBody["UserName"],
				"logAuthResult": msgBody["AuthResult"],
				"logEventTime": msgBody["EventTime"],
				"logLogIndex": msgBody["LogIndex"],
				"left": AuthImageLeft,
				"top": AuthImagetop,
				"width" : AuthImageWidth,
				"height" : AuthImageHeight
			}
		}
	});
	app.dispatchEvent(selectionEvent); 
	
}

function deleteSubGroup( /* cpr.data.DataSet */ dsGroupList, groupID ){

	var count = dsGroupList.getRowCount();
	for( var i = 0; i < count; i++ ){
		var row = dsGroupList.getRow(i);
		if( row ){

			if( row.getState()== cpr.data.tabledata.RowState.DELETED){
				continue;
			}

			var rowID = row.getValue("GroupID");
			if( rowID == groupID ){
				dsGroupList.deleteRow(row.getIndex());
				continue;
			}

			if( row.getValue("Parent") == groupID ){
				deleteSubGroup(dsGroupList, rowID);
				dsGroupList.deleteRow(row.getIndex());
			}
		}
	}
}

// 서버에 필요한 데이터 요청. 각 서브미션 완료시 호출하여 DataManager의 initData에 등록된 리스트를 전부 요청 할때까지 반복
function initData(){
	// 초기 데이터 로딩...
	// 메뉴, 권한, 그룹, 출입그룹, 타임존, 근태, 식수, 급여, 사용자 메세지, 직급, 옵션설정()
	var dataID = dataManager.getInitData();
	//console.log("dataID : "+dataID);
	switch (dataID){
		case DLG_COUNTRYCODE:
			comLib.updateLoadMask(dataManager.getString("Str_CountryCodeData")+" "+dataManager.getString("Str_Sync"));
			var smsRequest = app.lookup("sms_getCountryCodeDataList");
			smsRequest.send();
			break;
		case DLG_STRING:
			comLib.updateLoadMask(dataManager.getString("Str_LanguageData")+" "+dataManager.getString("Str_Sync"));
			var locale = dataManager.getLocale();
			if (locale == 'ko' || locale == 'ja' || locale == 'fr' || locale == 'es' || locale == 'vi'|| locale == 'zh-tw' || locale == 'ru') {
				//pass 자기 언어를 가짐 
			} else {
				locale = 'en';
			}
			var sms_getLangList = app.lookup("sms_getLangList") ;
			sms_getLangList.action = "data/lang/lang_"+locale+".json";
			sms_getLangList.send();
			break;
		case DLG_MENU_ALL:
			comLib.updateLoadMask(dataManager.getString("Str_MenuData")+" "+dataManager.getString("Str_Sync"));
			app.lookup("sms_getMenuList").send();
			break; // 서버에 메뉴 리스트 요청;
		case DLG_GROUP_MANAGEMENT:
			comLib.updateLoadMask(dataManager.getString("Str_GroupData")+" "+dataManager.getString("Str_Sync"));
			app.lookup("sms_getGroupList").send();
			break;// 서버에 그룹 리스트 요청;
		case DLG_ACCESSGROUP_MANAGEMENT:
			comLib.updateLoadMask(dataManager.getString("Str_AccessGroupData")+" "+dataManager.getString("Str_Sync"));
			var sms_getAccessGroupList = app.lookup("sms_getAccessGroupList")
			sms_getAccessGroupList.setParameters("areas", "true");
			sms_getAccessGroupList.setParameters("joinInfo", "true");
			sms_getAccessGroupList.setParameters("initData", "true"); // 최초
			sms_getAccessGroupList.send();
			break;
		case DLG_POSITION_MANAGEMENT:
			comLib.updateLoadMask(dataManager.getString("Str_PositionData")+" "+dataManager.getString("Str_Sync"));
			var sms_getPosition = app.lookup("sms_getPosition")
			sms_getPosition.send();
			break;
		case DLG_PRIVILEGE_MANAGEMENT:
			comLib.updateLoadMask(dataManager.getString("Str_PrivilegeData")+" "+dataManager.getString("Str_Sync"));
			var sms_getPrivilegeList = app.lookup("sms_getPrivilegeList")
			sms_getPrivilegeList.send();
			break;
		case DLG_TERMINAL_MANAGEMENT:
			comLib.updateLoadMask(dataManager.getString("Str_TerminalData")+" "+dataManager.getString("Str_Sync"));
			var smsGetTerminalList = app.lookup("sms_getTerminalList");
			var fields = ["terminal_id","Status","name","group_code","type","remote_door", "ip_address","core_flag"];
			if (oem_version == OEM_REMOTE_FAW_MANAGEMENT){
				fields = ["terminal_id","Status","name","group_code","type","remote_door", "ip_address","core_flag", "use_auth"];
			}
			smsGetTerminalList.setParameters("fields", fields);
			smsGetTerminalList.setParameters("terminallivinfo", 1);
			smsGetTerminalList.send();
			break;
		case DLG_TNA_SETTING_WORKTYPE:
			comLib.updateLoadMask(dataManager.getString("Str_TnaTypeData")+" "+dataManager.getString("Str_Sync"));
			app.lookup("sms_getTnaTypeList").send();
			break;
		case DLG_TNA_SETTING_PAYMENT:
			comLib.updateLoadMask(dataManager.getString("Str_PaymentData")+" "+dataManager.getString("Str_Sync"));
			app.lookup("sms_getPaymentList").send();
			break;
		case DLG_TIMELINE_WEEKENDV:
			comLib.updateLoadMask(dataManager.getString("Str_TimezoneData")+" "+dataManager.getString("Str_Sync"));
			app.lookup("sms_getTimezoneSetList").send();
			break;
		case DLG_MEALSERVICE_MANAGEMENT:
			comLib.updateLoadMask(dataManager.getString("Str_MealServiceData")+" "+dataManager.getString("Str_Sync"));
			app.lookup("sms_getMealServiceList").send();
			break;
		case DLG_USER_MESSAGE_MANAGEMENT:
			comLib.updateLoadMask(dataManager.getString("Str_UserMessageData")+" "+dataManager.getString("Str_Sync"));
			app.lookup("sms_getUserMessageList").send();
			break;
		case DLG_GENERAL_SETTING:
			comLib.updateLoadMask(dataManager.getString("Str_Option2")+" "+dataManager.getString("Str_Sync"));
			app.lookup("sms_getServerOption").send();
			break;
		case DLG_VMS_MANAGEMENT:
			comLib.updateLoadMask(dataManager.getString("Str_VMSInfo")+" "+dataManager.getString("Str_Sync"));
			app.lookup("sms_getVmsSetting").send();
			break;	
		case DLG_VMS_MultiView:
			comLib.updateLoadMask(dataManager.getString("Str_MultiView")+" "+dataManager.getString("Str_Sync"));
			app.lookup("sms_getMultiViewSetting").send();
			break;					
		case LICENSE_CHECK:
			comLib.hideLoadMask();
			var systemInfo = dataManager.getSystemInfo();
			var status = systemInfo.getValue("LicenseStatus");
			if( systemInfo.getValue("LicenseLevel") == LicenseNone || status != 0 ){
					app.getRootAppInstance().openDialog("app/main/install/licenseInfoEx", {width: 720, height: 470}, function(dialog){
						dialog.ready(function(dialogApp){
							dialog.bind("headerTitle").toLanguage("Str_License");							
							dialog.modal = true;
							dialog.initValue = {"autoClose":true};
							dialog.headerClose = false;
							dialog.resizable = false;
						});
					}).then(function(returnValue){
						logoutMessage = false
						dataManager.dispose();						
					});
			}
	
			if( dataManager.getOemVersion() == OEM_ARMY_HQ ){
				if(embeddedAppAmhq == undefined || embeddedAppAmhq.disposed == true) {
					embeddedAppAmhq = new cpr.controls.EmbeddedApp("emb_Side");
					cpr.core.App.load("app/custom/army_hq/osmainAmhq", function(app) {
						if(app){embeddedAppAmhq.app = app;}
					});					
					
					var buttonRect = app.lookup("Army").getActualRect();
					embeddedAppAmhq.style.css({	top: "0px",	height: "100%",	width: "100%"});
					app.floatControl(embeddedAppAmhq);
					
					var menulist = app.lookup("MenuList"),
					    menuuser = app.lookup("MenuUser");
					var dataset = [menulist, menuuser];
					embeddedAppAmhq.initValue = dataset;
					return;
				} else if (embeddedAppAmhq.disposed == false) {
					embeddedAppAmhq.dispose();
				}
			} else if( dataManager.getOemVersion() == OEM_ROKMCH){
				if(embeddedAppAmhq == undefined || embeddedAppAmhq.disposed == true) {
					embeddedAppAmhq = new cpr.controls.EmbeddedApp("emb_Side");
					cpr.core.App.load("app/custom/rokmch/osmainAmhq", function(app) {
						if(app){embeddedAppAmhq.app = app;}
					});					
					
					var buttonRect = app.lookup("Army").getActualRect();
					embeddedAppAmhq.style.css({	top: "0px",	height: "100%",	width: "100%"});
					app.floatControl(embeddedAppAmhq);
					
					var menulist = app.lookup("MenuList"),
					    menuuser = app.lookup("MenuUser");
					var dataset = [menulist, menuuser];
					embeddedAppAmhq.initValue = dataset;
					return;
				} else if (embeddedAppAmhq.disposed == false) {
					embeddedAppAmhq.dispose();
				}
			}		 
			initData();	
			break;		
		case XKEY_LICENSE_CHECK:
			if (dataManager.getMobileCardVersion() == OEM_MOBILECARD_ALPETA){
				app.lookup("sms_getXkeyLicenseValication").send();					
			} else {
				initData();	
			}
			break;	 
		case OEM_INIT:		
			doOEMInitProcess();
			break;
		default:
			comLib.hideLoadMask();
			// 다 끝난다음
			break;
	}
}
function WebNoticeCheck() {
	var oemVer = dataManager.getOemVersion();
	if( oemVer == OEM_JAWOONDAE){ //OEM_VersionCheck
		app.lookup("sms_getWebNotice").send();
	}
}
function FirstLoginCheck() {
	var oemVer = dataManager.getOemVersion();
	var AccountInfo = dataManager.getAccountInfo();
	
	var pwChangeFirst = app.lookup("ServerOption").getValue("PwChangeFirst");
	var firstFlag = AccountInfo.getValue("FirstLoginFlag");
	if (firstFlag == 1) { //만료거나 처음로그인 최초로그인 판단은 서버에서 해주도록 수정 해야함
		var headerClose = true;
		if (oemVer == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH) {
			headerClose = false;
			return; // 육군본부의 경우 osmainAmhq에서 활성화
		}
		var appld = "app/main/mainEmb/SetPassword" + "?" + usint_version;
		app.getRootAppInstance().openDialog(appld, {width: 400, height: 230}, function(dialog){
			dialog.ready(function(dialogApp){
				dialog.modal = true;
				dialog.headerClose = false;
				dialog.headerTitle = dataManager.getString("Str_PasswordChange");
			});
		}).then(function(returnValue){
		});
	}
}

// 언어 리스트 수신 성공
function onSms_getLangListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){	
}

// 언어 리스트 수신 완료
function onSms_getLangListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dsLangList = app.lookup("LangList");
	var locale = dataManager.getLocale();
		var sms_getLangErrorList = app.lookup("sms_getLangErrorList") ;
		sms_getLangErrorList.action = "data/lang/lang_error_"+locale+".json";
		sms_getLangErrorList.send();	
}

// 에러 문구 가져오기 성공
function onSms_getLangErrorListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){	
	var dsLangErrorList = app.lookup("LangErrorList");
	var dsLangList = app.lookup("LangList");
	for(var i=0; i < dsLangErrorList.getRowCount(); i++){
		var row = dsLangErrorList.getRow(i);
		dsLangList.addRowData(row.getRowData());
	}
	dsLangList.commit();
}

// 에러 문구 가져오기 완료
function onSms_getLangErrorListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var oemVersion = dataManager.getOemVersion();
	//debugger;
	if( oemVersion == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH){
		comLib.updateLoadMask(dataManager.getString("Str_LanguageData")+" "+dataManager.getString("Str_Sync"));
		var locale = dataManager.getLocale();
		var sms_getLangList = app.lookup("sms_getLangOemList") ;
		sms_getLangList.action = "data/lang/lang_armyhq.json";
		sms_getLangList.send();		
	} else if( oemVersion == OEM_LOTTE_CS ){			
		var sms_getLangList = app.lookup("sms_getLangOemList") ;
		sms_getLangList.action = "data/lang/lang_lottecs.json";
		sms_getLangList.send();		
	} else if (oemVersion == OEM_BLUEHOUSE_KR ){
		var sms_getLangList = app.lookup("sms_getLangOemList") ;
		sms_getLangList.action = "data/lang/lang_blueHouser.json";
		sms_getLangList.send();	
	} else if (oemVersion == OEM_HYUNDAI_EC) {
		var sms_getLangList = app.lookup("sms_getLangOemList") ;
		sms_getLangList.action = "data/lang/lang_hdecHios.json";
		sms_getLangList.send();	
	} else if (oemVersion == OEM_SS_HOSPITAL) {
		var sms_getLangList = app.lookup("sms_getLangOemList") ;
		sms_getLangList.action = "data/lang/lang_ssHospital.json";
		sms_getLangList.send();	
	} else if (oemVersion == OEM_VMS_IDIS_WORK_AUTHLOG) {
		var sms_getLangList = app.lookup("sms_getLangOemList") ;
		sms_getLangList.action = "data/lang/lang_idis.json";
		sms_getLangList.send();		
	} else if (oemVersion == OEM_BEST_ALLIANCE) {
		var sms_getLangList = app.lookup("sms_getLangOemList") ;
		sms_getLangList.action = "data/lang/lang_bestAlliance.json";
		sms_getLangList.send();	
	} else if (	oemVersion	== OEM_BOSK_CAPS) {
		
		var sms_getLangList = app.lookup("sms_getLangOemList") ;
		sms_getLangList.action = "data/lang/lang_custom.json"; //추후 일반버전이 아닌것은 이쪽에 통일해서 작성하도록 개선
		sms_getLangList.send();	
	} else if (oemVersion == OEM_ITONE_TRDATA || oemVersion == OEM_ITONE_POSCO_DX){
		var sms_getLangList = app.lookup("sms_getLangOemList") ;
		sms_getLangList.action = "data/lang/lang_custom_itone.json"; 
		sms_getLangList.send();	
	} else if (oemVersion == OEM_HYUNDAI_HI){
		var sms_getLangList = app.lookup("sms_getLangOemList") ;
		sms_getLangList.action = "data/lang/lang_HDHI.json"; 
		sms_getLangList.send();	
	} else if (oemVersion == OEM_VIETNAM_INTEG_CONTROL) {
		var sms_getLangList = app.lookup("sms_getLangOemList") ;
		sms_getLangList.action = "data/lang/lang_vietnam_integ.json"; 
		sms_getLangList.send();	
	} else {
		console.log(oemVersion);
		var dsLangList = app.lookup("LangList");
		var locale = dataManager.getLocale();
		dataManager.setLanguage(locale, dsLangList);
		if(locale=="ko"){
			dsLangList.copyToDataSet(app.lookup("ko_lang")); // 메뉴명이 항상 한글이므로 처리한 임시코드
			dsLangList.commit();
		}		
		initData();	
	}	
}

// oem 언어 가져오기 성공
function onSms_getLanguageOemSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getLanguageOem = e.control;
	
}

// oem 언어 가져오기 완료
function onSms_getLanguageOemSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dsLangOemList = app.lookup("LangOemList");
	var dsLangList = app.lookup("LangList");
	for(var i=0; i < dsLangOemList.getRowCount(); i++){
		var row = dsLangOemList.getRow(i);
		dsLangList.addRowData(row.getRowData());
	}
	//console.log(dsLangOemList.getRowDataRanged());
		
	var locale = dataManager.getLocale();
	dataManager.setLanguage(locale, dsLangList);
	if(locale=="ko"){
		dsLangList.copyToDataSet(app.lookup("ko_lang")); // 메뉴명이 항상 한글이므로 처리한 임시코드
		dsLangList.commit();
	}
	//console.log(dsLangList.getRowDataRanged());
	initData();		
}

// 메뉴 리스트 수신 성공
function onSms_getMenuListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	var menuuser = app.lookup("MenuUser");
	var temp = {};
	var menugroup = app.lookup("MenuGroup");
	menugroup.getRowDataRanged().forEach(function(/* cpr.data.RowConfigInfo */each){
		temp.MenuID = each.MenuGroupID;
		temp.UserID = each.UserID;
		temp.GroupID = 0;
		temp.PosX = each.PosX;
		temp.PosY = each.PosY;
		menuuser.addRowData(temp);
	});
	programManager.init(app.lookup("working_bar"), app.lookup("bg_bar"));
	initMenus();
}

// 메뉴 리스트 응답처리 종료
function onSms_getMenuListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dsMenuList = app.lookup("MenuList"); // kth 추가
//	console.log(dsMenuList.getRowDataRanged());
	dataManager.setMenuList(dsMenuList);

	initData();
}

// 그룹 리스트 통신 성공
function onSms_getGroupListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
}

// 그룹 리스트 통신 완료
function onSms_getGroupListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dsGroup = app.lookup("GroupList");
	dataManager.setGroup(dsGroup);

	initData();
}

// 출입그룹 리스트 통신 성공
function onSms_getAccessGroupListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
}

// 출입그룹 리스트 응답 처리 종료.
function onSms_getAccessGroupListSubmitDone(/* cpr.events.CSubmissionEvent */ e){

	var dsAccessGroup = app.lookup("AccessGroupList");
	dataManager.setAccessGroup(dsAccessGroup);

	var dsAccessArea = app.lookup("AccessAreaList");
	dataManager.setAccessArea(dsAccessArea);
	
	var dsAccessAreaGroup = app.lookup("AccessAreaGroupList");
	dataManager.setAccessAreaGroup(dsAccessAreaGroup);
	
	initData();
}

// 직급 정보 수신 완료
function onSms_getPositionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dsPositionList = app.lookup("PositionList");
	dataManager.setPositionList(dsPositionList);

	initData();
}

// 권한 리스트 수신 완료
function onSms_getPrivilegeListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dsPrivilegeList = app.lookup("PrivilegeList");
	dataManager.setPrivilegeList(dsPrivilegeList);
	//console.log(dsPrivilegeList.getRowDataRanged());

	initData();
}

// 단말 리스트 수신 완료
function onSms_getTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dsTerminalList = app.lookup("TerminalList");
	dsTerminalList.setSort("ID");
	/*
	for (var i = 0; i < dsTerminalList.getRowCount(); i++) {
			var terminalInfo = dsTerminalList.getRow(i);
			//console.log(terminalInfo.getValue("Status"));
			//terminalInfo.setValue("Status", 1); // 왜 무조건 1인지 모르겠다			
		}
	*/
		
	dataManager.setTerminalList(dsTerminalList);
	initData();
}

// 근무형태 수신 완료
function onSms_getTnaTypeListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dsTnaTypeList = app.lookup("dsWorkTypeTinyList");
	dataManager.setTnaTypeList(dsTnaTypeList);
	initData();
}

// 급여 데이터 수신 완료
function onSms_getPaymentListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dsWorkPaymentTinyList = app.lookup("dsWorkPaymentTinyList");
	dataManager.setPaymentList(dsWorkPaymentTinyList);
	initData();
}

// 메뉴 그룹 수신 완료
function onSms_manageMenuGroupSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultMap = app.lookup("Result");
	var resultCode = resultMap.getValue("ResultCode");
	if(resultCode == 0){
		var groupList = app.lookup("MenuGroup");
		//저장된 데이터는 노말 상태로 변경
		for(var i=0;i<groupList.getRowCount();i++){
			groupList.setRowState(i, cpr.data.tabledata.RowState.UNCHANGED);
		}
	}else{
		var groupList = app.lookup("MenuGroup");
		groupList.revert();
	}
}

// 타임존 수신 완료
function onSms_getTimezoneSetListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dsTimezoneSetList = app.lookup("TimezoneSetList");
	dataManager.setTimezoneSet(dsTimezoneSetList);
	initData();
}

// 식수 수신 완료
function onSms_getMealServiceListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dsMeal = app.lookup("Meal");
	dataManager.setMealList(dsMeal);
	initData();
}

// 사용자 메세지 수신 완료
function onSms_getUserMessageListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dsUserMessage = app.lookup("UserMessageList");
	dataManager.setUserMessageList(dsUserMessage);
	initData();
}

// 데스크탑 바탕화면 아이콘 추가
function initMenus() {
	var dsMenuList = app.lookup("MenuList");
	var menuCount = dsMenuList.getRowCount();
	
	var menuMap = new Map();
	for (var idx = 0; idx < menuCount; idx++) {		
		var menu = dsMenuList.getRow(idx);		
		var name = dataManager.getMenuString(menu.getValue("MenuID"));
		menu.setValue("Name",name);
		menuMap.set(menu.getValue("MenuID"),menu);				
	}
	var dsMenuUserList = app.lookup("MenuUser");
	var menuUserCount = dsMenuUserList.getRowCount();
	var menubar = app.lookup("menubar"); // 상단 메뉴바
	var rect = menubar.getActualRect();

	// 바탕 화면 아이콘 크기 및 배치 정보
	var iconTopPos = rect.top + rect.height;
	var iconLeftPos = 50;
	var width = 82;
	var height = 92;
	var padding = 30;
	var top = iconTopPos + padding;
	var left = 50;
	var maxRow = 7; // 아이콘 y축 갯수 설정

	// 서버에서 수신한 바탕화면 아이콘 생성
	for (var idx = 0; idx < menuUserCount; idx++) {
		// 바탕화면 아이콘을 데이터 셋에서 하나씩 꺼내 생성. 생성된 바탕화면 아이콘을 반환한다. ( object type output control )
		var userMenu = dsMenuUserList.getRow(idx);
		var menuID = userMenu.getValue("MenuID");
		userMenu.setValue("order", userMenu.getValue("PosX")*maxRow + userMenu.getValue("PosY"));
		var menuData = menuMap.get(menuID);

		var img, name, id, src, dsc, keypath;

		if(menuData){
			img = menuData.getValue("Image");
			name = dataManager.getMenuString(menuID);
			menuData.setValue("Name",name);
		//	console.log("ID : " + menuID + " name : " + name);
		    //name = menuData.getValue("Name");
		    id = menuID.toString();
		    src = menuData.getValue("Src");
		    //dsc = menuData.getValue("Description");
		    dsc = name;
		    keypath = dataManager.getMenuKey(menuID);
		}else{

			img = "theme/images/home_screen_icons/home_sceen_icons_folder.png";
			var findMenuGroup = app.lookup("MenuGroup").findFirstRow("MenuGroupID==" + menuID);
			if (findMenuGroup) {
				name = findMenuGroup.getValue("Name");
			}
		    id = menuID.toString();
		    src = "";
		    dsc = "";
		    keypath = "";
		}
		var desktopIcon = mainLib.createSymbolic(img, name, id, src, dsc, keypath);
		var x = userMenu.getValue("PosX")==0? left : parseInt(userMenu.getValue("PosX")) * (width + left) + left;
		var y = userMenu.getValue("PosY")==0? top : userMenu.getValue("PosY") * (height + padding) + top;

		// 생성한 바탕화면을 app의 컨테이너에 추가
		app.getContainer().addChild(desktopIcon, {
			top: y + "px",
			left: x + "px",
			width: width + "px",
			height: height + "px"
		});
		dsMenuUserList.setRowState(idx, cpr.data.tabledata.RowState.UNCHANGED);
	}
}


function backgroundRun() {
	var ds = app.lookup("start_programs");
	var count = ds.getRowCount();
	var ds1 = app.lookup("usermenu");

	for (var idx = 0; idx < count; idx++) {
		var row = ds.getRow(idx);
		var findRow = ds1.findFirstRow("value == '" + row.getValue("value") + "'");
		var pageSrc = findRow.getValue("src");
		if (!pageSrc) {
			return;
		}
		programManager.backgroundRun(app, {
			name: row.getValue("Name"),
			src: row.getValue("src")
		}, pageSrc, row.getValue("value"));
		//console.log("bg run : "+row.getValue("Name")+" "+row.getValue("src")+" "+pageSrc+" "+row.getValue("value"))
	}
}

function initNotify() {
	var noti = app.lookup("notify");
	registNotify("desktop-notify", noti, function(/*cpr.controls.Notifier*/notifier,data) {
		switch (data.type) {
			case "success":
				notifier.success(data.message);
				break;
			case "warning":
				notifier.warning(data.message);
				break;
			case "danger":
				notifier.danger(data.message);
				break;
			case "info":
				notifier.info(data.message);
				break;
			default:
				notifier.notify(data.message);
		}
	});
}

/*
 * 전체 메뉴 버튼 클릭
 */
var embeddedAppAmhq;
function onButtonProgramMenuClick( /* cpr.events.CMouseEvent */ e) {
	/**
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	e.stopImmediatePropagation();
	if(embeddedAppAmhq == undefined || embeddedAppAmhq.disposed == true) {
		embeddedAppAmhq = new cpr.controls.EmbeddedApp("emb_Side");
		cpr.core.App.load("app/main/mainEmb/help", function(app) {
			if(app){
				embeddedAppAmhq.app = app;
			}
		});
		var buttonRect = button.getActualRect();
		var strTop = "0px"; 
		if( dataManager.getOemVersion() != OEM_ARMY_HQ && dataManager.getOemVersion() != OEM_ROKMCH){
			strTop = buttonRect.top + buttonRect.height + "px";
		}
		embeddedAppAmhq.style.css({
			top: strTop,
			height: "100%",
			width: "100%"
		});
		app.floatControl(embeddedAppAmhq);
		var menulist = app.lookup("MenuList"),
		    menuuser = app.lookup("MenuUser");
		var dataset = [menulist, menuuser];
		embeddedAppAmhq.initValue = dataset;
		return;
	} else if (embeddedAppAmhq.disposed == false) {
		embeddedAppAmhq.dispose();
	}
	/*
	if(app.lookup("emb_Side")){
		app.lookup("emb_Side").dispose();
	}else{
		var embeddedApp_1 = new cpr.controls.EmbeddedApp("emb_Side");
		cpr.core.App.load("app/main/mainEmb/help", function(app) {
			if(app){
				embeddedApp_1.app = app;
			}
		});
		var buttonRect = button.getActualRect();
		embeddedApp_1.style.css({
			top: buttonRect.top + buttonRect.height + "px",
			height: "100%",
			width: "100%"
		});
		app.floatControl(embeddedApp_1);
		var menulist = app.lookup("MenuList"),
		    menuuser = app.lookup("MenuUser");
		var dataset = [menulist, menuuser];
		embeddedApp_1.initValue = dataset;
	}
	*/
}

// 서버에서 메뉴 수신 성공.. 삭제 예정
function onSms_mainSubmitSuccess( /* cpr.events.CSubmissionEvent */ e) {
	initDesktop();
	programManager.init(app.lookup("working_bar"), app.lookup("bg_bar"));
	backgroundRun();
	initNotify();
}

// 서버에서 메뉴 수신 완료.. 삭제 예정
function onSms_mainSubmitDone(e){
	var sms_main = e.control;

	var usermenu = app.lookup("usermenu");
	var desktoplink = app.lookup("desktop_link");
	var desktopmenu= app.lookup("desktop_menu");
	var startProgram = app.lookup("start_programs");

	console.log("recv menu list done. usermenu("+usermenu.getRowCount()	+
	") desktopLink("+desktoplink.getRowCount()+") desktopMenu("+desktopmenu.getRowCount()+
	") startProgram("+startProgram.getRowCount()+")");
	console.log("send group list req. submission - sms_getGroupList");
}

function onSms_getServerOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmServerOption = app.lookup("ServerOption");
	
	dataManager.setClientOption(dmServerOption);
	initData();
	
	FirstLoginCheck();
	WebNoticeCheck();
	
	var systeminfo = dataManager.getSystemInfo();
	var mcCardLimint = systeminfo.getValue("McardLimit");
	if (mcCardLimint <= 30 && mcCardLimint >= 16) {// 30일
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_MobileExpire30Dday"));
	} else if(mcCardLimint <= 15 && mcCardLimint > 1) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_MobileExpire15Dday"));
	} else if(mcCardLimint == 1 ) {// 1일
	 dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_MobileExpire1Dday"));
	}
}



/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getCountryCodeDataListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	initData();
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms_getCountryCodeDataListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	var dsCountryCodeList = app.lookup("CountryCodeList");
	// 등록된 국가 리스트
	//console.log(dsCountryCodeList.getRowDataRanged());
}
function onSms_getWebNoticeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var msg = app.lookup("WebNoticeInfo").getValue("Message");
		if (msg.length > 0) {
			app.getRootAppInstance().openDialog("app/main/jawoondae/webNotice/webNotice", {width: 450, height: 300}, function(dialog){
				dialog.ready(function(dialogApp){
					dialog.modal = false;
					dialog.headerTitle = "웹 공지사항";
				});
			}).then(function(returnValue){
			});
		}
		
	}
}
function onSms_getWebNoticeSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}
function onSms_getWebNoticeSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getAccessAreaGroupSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getAccessAreaGroup = e.control;
	
	var dsAccessAreaGroup = app.lookup("AccessAreaGroupList");
	dataManager.setAccessAreaGroup(dsAccessAreaGroup);
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getAccessAreaGroupSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getAccessAreaGroup = e.control;
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getAccessAreaGroupSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getAccessAreaGroup = e.control;
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getVmsSettingSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var vmsInfo = app.lookup("VMSConnectionInfo");
	
	var colums = vmsInfo.getColumnNames();
	for(var i=0; i < colums.length ; i++) {
		dataManager.setValueVMS(colums[i], vmsInfo.getString(colums[i]));
	}
	initData();
}

/*
 * "육본페이지" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	e.stopImmediatePropagation();
		
	if(embeddedAppAmhq == undefined || embeddedAppAmhq.disposed == true) {
		embeddedAppAmhq = new cpr.controls.EmbeddedApp("emb_Side");
		if(dataManager.getOemVersion() == OEM_ARMY_HQ){
			cpr.core.App.load("app/custom/army_hq/osmainAmhq", function(app) {
				if(app){
					embeddedAppAmhq.app = app;
				}
			});
		} else if (dataManager.getOemVersion() == OEM_ROKMCH){
			cpr.core.App.load("app/custom/rokmch/osmainAmhq", function(app) {
				if(app){
					embeddedAppAmhq.app = app;
				}
			});
		}
		var buttonRect = button.getActualRect();
		embeddedAppAmhq.style.css({
			top: "0px",
			height: "100%",
			width: "100%"
		});
		app.floatControl(embeddedAppAmhq);
		return;
	} else if (embeddedAppAmhq.disposed == false) {
		embeddedAppAmhq.dispose();
	}
}

exports.closeUI = function(){
		
	if(embeddedAppAmhq == undefined || embeddedAppAmhq.disposed == true) {
		var button = app.lookup("Army");
		embeddedAppAmhq = new cpr.controls.EmbeddedApp("emb_Side");
		if(dataManager.getOemVersion() == OEM_ARMY_HQ){
			cpr.core.App.load("app/custom/army_hq/osmainAmhq", function(app) {
				if(app){
					embeddedAppAmhq.app = app;
				}
			});
		} else if (dataManager.getOemVersion() == OEM_ROKMCH){
			cpr.core.App.load("app/custom/rokmch/osmainAmhq", function(app) {
				if(app){
					embeddedAppAmhq.app = app;
				}
			});
		}
		var buttonRect = button.getActualRect();
		embeddedAppAmhq.style.css({
			top: "0px",
			height: "100%",
			width: "100%"
		});
		app.floatControl(embeddedAppAmhq);
		return;
	} else if (embeddedAppAmhq.disposed == false) {
		embeddedAppAmhq.dispose();
		embeddedAppAmhq = null;
	}
}
function doOEMInitProcess() {
	var oemVersion = dataManager.getOemVersion();	
	switch( oemVersion ){
		case OEM_HC_SAUDI_MARJAN:
			var sms_getHCSMData = new cpr.protocols.Submission("sms_getHCSMData");	 
			sms_getHCSMData.action = "/v1/oemData/all";
			sms_getHCSMData.method = "get";
			sms_getHCSMData.mediaType = "application/x-www-form-urlencoded";
		
			sms_getHCSMData.addEventListenerOnce("submit-done", onSms_getOEMInitSubmitDone);	
		
			sms_getHCSMData.addResponseData(app.lookup("Result"), false, "Result");
			sms_getHCSMData.addResponseData(app.lookup("HCSMCompany"), false, "HCSMCompany");
			sms_getHCSMData.addResponseData(app.lookup("HCSMTeam"), false, "HCSMTeam");
			sms_getHCSMData.addResponseData(app.lookup("HCSMPart"), false, "HCSMPart");
			sms_getHCSMData.addResponseData(app.lookup("HCSMNationality"), false, "HCSMNationality");		
			sms_getHCSMData.addResponseData(app.lookup("HCSMBloodType"), false, "HCSMBloodType");
	
			comLib.showLoadMask("",dataManager.getString("Str_Synchronization"),"",0);
			sms_getHCSMData.send();
		break;

		case OEM_MOTORCYCLE_PARK:
			var sms_getBPARKData = new cpr.protocols.Submission("sms_getBPARKData");
			sms_getBPARKData.action = "/v1/oemData/bpark";
			sms_getBPARKData.method = "get";
			sms_getBPARKData.mediaType = "application/x-www-form-urlencoded";
			
			sms_getBPARKData.addEventListenerOnce("submit-done", onSms_getOEMInitSubmitDone);
			
			sms_getBPARKData.addResponseData(app.lookup("Result"), false, "Result");
			sms_getBPARKData.addResponseData(app.lookup("BPARKInfoList"), false, "BPARKInfoList");
			sms_getBPARKData.addResponseData(app.lookup("BPARKValList"), false, "BPARKValList");
			sms_getBPARKData.addResponseData(app.lookup("BPARKOptionPayment"), false, "BPARKOptionPayment");
			
			comLib.showLoadMask("",dataManager.getString("Str_Synchronization"),"",0);
			sms_getBPARKData.send();
		break;
		case OEM_BOSK_CAPS:
			var sms_getBPARKData = new cpr.protocols.Submission("sms_getBoskInitData");
			sms_getBPARKData.action = "/v1/oemData/boskCaps";
			sms_getBPARKData.method = "get";
			sms_getBPARKData.mediaType = "application/x-www-form-urlencoded";
			
			sms_getBPARKData.addEventListenerOnce("submit-done", onSms_getOEMInitSubmitDone);
			
			sms_getBPARKData.addResponseData(app.lookup("Result"), false, "Result");
			sms_getBPARKData.addResponseData(app.lookup("IdteckAcuDeviceList"), false, "IdteckAcuDeviceList");
						
			comLib.showLoadMask("",dataManager.getString("Str_Synchronization"),"",0);
			sms_getBPARKData.send();
		case OEM_HYUNDAI_HI:
			var sms_getHDHIData = new cpr.protocols.Submission("sms_getHDHIData");
			sms_getHDHIData.action = "/v1/oemData/hdhi/all";
			sms_getHDHIData.method = "get";
			sms_getHDHIData.mediaType = "application/x-www-form-urlencoded";
			
			sms_getHDHIData.addEventListenerOnce("submit-done", onSms_getOEMInitSubmitDone);
			
			sms_getHDHIData.addResponseData(app.lookup("Result"), false, "Result");
			sms_getHDHIData.addResponseData(app.lookup("HDHIPartnerList"), false, "HDHIPartnerList");
			sms_getHDHIData.addResponseData(app.lookup("HDHIRelationDept"), false, "HDHIRelationDept");
			
			comLib.showLoadMask("",dataManager.getString("Str_Synchronization"),"",0);
			sms_getHDHIData.send();
			break;	
		case OEM_VIETNAM_INTEG_CONTROL:
			var sms_getVICEnrolledTerminals = new cpr.protocols.Submission("sms_getVICEnrolledTerminals");
			sms_getVICEnrolledTerminals.action = "/v1/vietname/integ/enrollTerminals";
			sms_getVICEnrolledTerminals.method = "get";
			sms_getVICEnrolledTerminals.mediaType = "application/x-www-form-urlencoded";
			
			sms_getVICEnrolledTerminals.addEventListenerOnce("submit-done", onSms_getOEMInitSubmitDone);
			
			sms_getVICEnrolledTerminals.addResponseData(app.lookup("Result"), false, "Result");
			sms_getVICEnrolledTerminals.addResponseData(app.lookup("Total"), false, "Total");
			sms_getVICEnrolledTerminals.addResponseData(app.lookup("VICEnrolledTerminalList"), false, "EnrolledTerminalList");
			
			comLib.showLoadMask("",dataManager.getString("Str_Synchronization"),"",0);
			sms_getVICEnrolledTerminals.send();
			
			break;
		default:
		comLib.hideLoadMask();
		if (Number(dataManager.getAccountInfo().getValue("Privilege")) == DLG_DISPLAYBOARD_MANAGEMENT) {
			mainLib.ExecuteMenu(DLG_MONITORING_DISPLAY_BOARD);
			
		}
	}	
}

function onSms_getOEMInitSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var oemVersion = dataManager.getOemVersion();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if(resultCode == COMERROR_NONE){
		if (oemVersion == OEM_HC_SAUDI_MARJAN) {
			dataManager.setCompanyList(app.lookup("HCSMCompany"));
			dataManager.setTeamList(app.lookup("HCSMTeam"));
			dataManager.setPartList(app.lookup("HCSMPart"));
			dataManager.setNationalityList(app.lookup("HCSMNationality"));	
			dataManager.setBloodTypeList(app.lookup("HCSMBloodType"));
		} else if (oemVersion == OEM_MOTORCYCLE_PARK) {
			dataManager.setInfoListBPARK(app.lookup("BPARKInfoList"));
			dataManager.setValListBPARK(app.lookup("BPARKValList"));
			dataManager.setOptionPaymentBPARK(app.lookup("BPARKOptionPayment"));
		} else if (oemVersion == OEM_BOSK_CAPS) {
			console.log(app.lookup("IdteckAcuDeviceList").getRowDataRanged());
			dataManager.setIdteckAcuDeviceList(app.lookup("IdteckAcuDeviceList"));
		} else if (oemVersion == OEM_HYUNDAI_HI) {
			dataManager.setPartnerListHDHI(app.lookup("HDHIPartnerList"));
			dataManager.setRelationDeptListHDHI(app.lookup("HDHIRelationDept"));
		} else if (oemVersion == OEM_VIETNAM_INTEG_CONTROL) {
			dataManager.setEnrolledTerminalListVIC(app.lookup("VICEnrolledTerminalList"));
			console.log(dataManager.getEnrolledTerminalListVIC());
			
			var sms_getVICTerminalCCTVData = new cpr.protocols.Submission("sms_getVICTerminalCCTVData");
			sms_getVICTerminalCCTVData.action = "/v1/vietnam/integ/cctv";
			sms_getVICTerminalCCTVData.method = "get";
			sms_getVICTerminalCCTVData.mediaType = "application/x-www-form-urlencoded"
			
			sms_getVICTerminalCCTVData.addResponseData(app.lookup("Result"), false, "Result");
			sms_getVICTerminalCCTVData.addResponseData(app.lookup("VICCCTVList"), false, "CCTVList");
			sms_getVICTerminalCCTVData.addEventListenerOnce("submit-done", onSms_getCCTVListSubmitDone);
			sms_getVICTerminalCCTVData.send();
		}
	}
	initData();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getMultiViewSettingSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var vurixInfo = app.lookup("VurixServerInfo");
	
	var isValid = util.ConfirmMultiViewSetting(vurixInfo)
	
	if(isValid) {
		dataManager.setENABLE_MULTIVIEW(1);
	}
	
	initData();
}


/*
 * "platform" 버튼(MAIN_btnSmartSafety)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onMAIN_btnSmartSafetyClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var mAIN_btnSmartSafety = e.control;
	if (dataManager.getOemVersion() == OEM_ITONE_TRDATA) {
		var smartSafety = window.open('https://smart-safety.ai/main/login.html', "_blank", "fullscreen=yes");
	} else if (dataManager.getOemVersion() == OEM_ITONE_POSCO_DX) {
		var smartSafety = window.open('https://smart-safety.net', "_blank", "fullscreen=yes");
	}
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getItoneFieldInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getItoneFieldInfo = e.control;
	
	var fieldInfo = app.lookup("ITONE_FieldInfo");
	dataManager.setItoneFieldInfo(fieldInfo);
}

function onSms_getXkeyLicenseValicationSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if(resultCode == COMERROR_NONE){
		dataManager.setXkeyLicStatus(XkeyLicStatusOK);
		initData();
	} else if (resultCode == ErrorDataNotExist){
		dataManager.setXkeyLicStatus(XkeyLicStatusNone);
		initData();
	} else {
		dataManager.setXkeyLicStatus(XkeyLicStatusError);
		var content = dataManager.getString("Str_AlterXkeyLicenseReActive") + "\n(" + dataManager.getString(getErrorString(resultCode)) + ")";
//		dialogAlert(app, dataManager.getString("Str_Warning"), content);
		var appld = "app/dialog/alert" + "?" + usint_version;
		app.openDialog(appld, {width:360,height:200},function(dialog){
			dialog.initValue = content;
			dialog.headerTitle = dataManager.getString("Str_Warning");

			dialog.ready(function(){
				dialog.addEventListener("keyup", function(e){
					if(e.keyCode == 13){
						dialog.close();
					}
				});
				dialog.focus();
				
				dialog.addEventListener("close", function(e){
					initData();
				});
			});
		});
	}
}

function popupOEMVICCTV(msgBody) {
	var terminalID = msgBody[0].ID; 
	
	var enrollTerminal = dataManager.getEnrolledTerminalInfo(terminalID);
	if(enrollTerminal == undefined) {
		return;
	}
	
	var cctvInfo = dataManager.getTerminalCCTVInfo_VIC(terminalID);
	if(cctvInfo == undefined) {
		return;
	}	
	
	var terminalStatus = terminalMap.get(terminalID);
	
	// 단말 상태 확인
	var changedStatusBinary = (msgBody[0].Status ^ terminalStatus.status).toString(2).padStart(32, "0");
	var msgStatusBinary = msgBody[0].Status.toString(2).padStart(32, "0");
	
	// postMessage Handler
	var messageHandler = function(event) {
		if (event.data === "initReq") {
	        var data = { type: "initData", value:initValue };
	        osNewWindow.postMessage(data);
	    } 
	}
	
//	var popupFlag = false; // 새 창의 종료 감지 timer의 오작동 방지 (모든 로직 실행 이후 새 창 open)
	
	// door lock에 변화가 있었다.
	if(changedStatusBinary[32-1-7] == 1) {
//		var cctvInfo = terminalMap.get(terminalID).cctvInfo;
		
		// 문이 열렸으면  
		if(msgStatusBinary[32-1-7] == 1 && !terminalStatus.windowFlag) {
			var address = document.URL.toString() + '/hikLiveView';
			var osNewWindow = window.open(address, terminalID, "resizable=yes,width=300, height=400,top=150,left=510,menubar=false");
			var initValue = cctvInfo.getRowData();
			
			var value = terminalMap.get(terminalID);
			value.windowFlag = true;
		
			window.addEventListener("message", messageHandler);
			
			var osCheckPopupClosed = setInterval(function() {
			    if (osNewWindow === null || osNewWindow.closed) {
			        clearInterval(osCheckPopupClosed);  // 타이머 정지
			        
			        value.windowFlag = false;
			        window.removeEventListener("message", messageHandler);
			    }
			}, 1000);  // 0.5초 간격으로 창 상태 확인
		} else if (msgStatusBinary[32-1-7] == 0){
			// 문이 닫혔으면
		}
		
	}
	
	var value = terminalMap.get(terminalID);
    value.status = msgBody[0].Status;
    
}

function onSms_getCCTVListSubmitDone() {
	var result = app.lookup("Result").getValue("ResultCode");
	if(result == COMERROR_NONE) {
		var cctvList = app.lookup("VICCCTVList");
		
		dataManager.setTerminalCCTVList_VIC(cctvList);
		
		// 기존 단말기의 상태, Popup 상태 저장용 
		var dsTerminalList = dataManager.getTerminalList();
		var terminalCount = dsTerminalList.getRowCount();
		for(var i=0; i<terminalCount; i++) {
			var terminal = dsTerminalList.getRow(i);
			terminalMap.set(terminal.getValue("ID"), {
				"status" : terminal.getValue("Status"),
				"windowFlag" : false 
			});
		}
	}
}