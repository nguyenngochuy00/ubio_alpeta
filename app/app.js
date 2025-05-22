/************************************************
 * app.js
 * Created at 2018. 11. 13. 오전 9:51:52.
 *
 * @author fois
 ************************************************/
// 20200416 정래훈 - 토마토시스템에서 알려준 캐시 미사용 설정 소스
var envConfig = cpr.core.AppConfig.INSTANCE.getEnvConfig();
envConfig.setValue("appcache", false);

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
comLib = createComUtil(app);
var messageLib = null;


function onBodyInit(/* cpr.events.CEvent */ e){
	
}
// Body에서 load 이벤트 발생 시 호출.
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	dataManager = getDataManager();
	
	var language = localStorage.getItem("language");
	if( language ){
		dataManager.setLocale(language);
	}else {
		language = dataManager.initLanguage();
		localStorage.setItem("language",language);
	}
	comLib.language(language);
	
	
	app.lookup("sms_chkLogin").send(); // 로그인 여부 체크
	app.lookup("LOGIN_ipbUserID").inputFilter = /^[0-9]*$/;
	//app.lookup("LOGIN_cbxMaster_Button").style.css("opacity","0"); // 오른쪽 하단에 투명한 버튼 생성. 클릭하면 관리자 로그인 활성
	
	var agent = navigator.userAgent.toLowerCase();
}

// 로그인 체크 결과
function onSms_chkLoginSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var SystemInfo = app.lookup("SystemInfo");
	var fullversion = SystemInfo.getValue("Version");
	var verArr = fullversion.split('.');
	dataManager.setOemVersion(verArr[3].toString());
	dataManager.setDeviceServerVersion(SystemInfo.getValue("DeviceServerVersion"));
	
	console.log("OemVersion : " + dataManager.getOemVersion());
	console.log("DeviceVersion : " + dataManager.getDeviceServerVersion());
	
	if (verArr[3] == OEM_ARMY_HQ){
		cpr.core.App.load("app/custom/army_hq/app", function(newapp) {
			app.close();
			newapp.createNewInstance().run();				
		});
		return;
	}
	if (verArr[3] == OEM_ROKMCH){
		cpr.core.App.load("app/custom/rokmch/app", function(newapp) {
			app.close();
			newapp.createNewInstance().run();				
		});
		return;
	}			
	document.title = dataManager.getString("Str_ProgramName");
	
	
	switch(dataManager.getOemVersion()){
		case OEM_MCP040 :
			dataManager.setENABLE_MCP040(1);
			break;
		
		case OEM_MBM_MCP :
			dataManager.setENABLE_MCP040(1);
			break;
	}
	
	messageLib = createMessageDialogUtil(app);
	messageLib.usint_versionUpdate(fullversion);
	
	// 크롬
	var BrowserWarning = app.lookup("BrowserWarning");
	var chromeLink = app.lookup("chromeLink");
	var BrowserWarning2 = app.lookup("BrowserWarning2");
	var chromeLink32 = app.lookup("chromeLink32");
	BrowserWarning.value = "";
	chromeLink.value = "";
	BrowserWarning2.value = "";
	chromeLink32.value = "";
	
	if( verArr[3] == OEM_JAWOONDAE){ //OEM_VersionCheck
		//app.lookup("LOGIN_cbxMaster_Button").enabled = true;
		app.lookup("LOGIN_cbxMaster").visible = false;
		app.lookup("LOGIN_cbxUniqueID").value = true;
		app.lookup("LOGIN_imglog").src = "../theme/jawoondae/sign_img_Jwd_logo_01.png";
		
		BrowserWarning.value = "해당 프로그램은 chrome으로  반드시 실행 해야 합니다.";
		BrowserWarning2.value = " (chrome 아닐 경우 로그인 불가)";
		chromeLink.value = "<a href=\"/setup/chromeWindow64bit.exe\" target=\"_blank\" style=\"color:white\">"+"다운로드 : chrome_windows_10"+"</a>";
		chromeLink32.value = "<a href=\"/setup/chromeWindow32bit.exe\" target=\"_blank\" style=\"color:white\">"+"다운로드 : chrome_windows_7"+"</a>";
	} else if (verArr[3] == OEM_ARMY_HQ || verArr[3] == OEM_ROKMCH){	
				
		app.lookup("OPT_AppName").unbind("value");
		if (verArr[3] == OEM_ARMY_HQ){
			app.lookup("OPT_AppName").value = "과학화 출입통제 체계";
		} else if (verArr[3] == OEM_ROKMCH) {
			app.lookup("OPT_AppName").value = "출입통제 체계";
		}
		app.lookup("OPT_AppName").style.css({
			"font-size" : "40px",
			"font-weight" : "700",
			"font-family" : "굴림"
		})
		app.lookup("LOGIN_cbxUniqueID").unbind("text");
		app.lookup("LOGIN_cbxUniqueID").text = "군번 로그인";
		app.lookup("LOGIN_cbxUniqueID").value = true;
		//app.lookup("LOGIN_imglog").dispose();
		
		var agent = navigator.userAgent.toLowerCase();
		if ( (navigator.appName == 'Netscape' && navigator.userAgent.search('Trident') != -1) || (agent.indexOf("msie") != -1) ) {
			chromeLink.removeAllEventListeners();
			chromeLink32.removeAllEventListeners();
			//chromeLink.bind("value").toLanguage("Str_ExplorerWarning");
			//chromeLink32.bind("value").toLanguage("Str_OtherBrowser");
			chromeLink.value = dataManager.getString("Str_ExplorerWarning")
			chromeLink32.value = dataManager.getString("Str_OtherBrowser")
			chromeLink.style.css({"color" : "#ff0000"});
			chromeLink32.style.css({"color" : "#ff0000"});
		}
		app.lookup("ASLIP_opbLicense").visible = false;
		
		//app.lookup("LOGIN_imglog").style.css({"background-image" : "url('../theme/custom/armyhq/sign_img_logo_01.png')"})
		
	}else if(verArr[3] == OEM_INNODEP){ // Innodep VersionCheck
		//app.lookup("LOGIN_cbxMaster_Button").enabled = false;
		app.lookup("LOGIN_cbxMaster").visible = false;
		app.lookup("LOGIN_cbxUniqueID").visible = false;
		app.lookup("LOGIN_ipbUserID").text = "Master";
		app.lookup("LOGIN_ipbUserID").readOnly = true;

		var OPT_AppName = app.lookup("OPT_AppName");
		OPT_AppName.bind("value").toLanguage("Str_AppName_INNODEP");
		var appName = app.lookup("OPT_AppName");
		
		var bodyContainer = app.getContainer();
		bodyContainer.style.css({
			"background-image" : "url('../theme/images/innodep_vurix_img_bg_black.png')",
		});
		
	}else if(verArr[3] == OEM_KANGWONLAND){
		app.lookup("LOGIN_cbxUniqueID").value = true;
	}else if (verArr[3] == OEM_INNODEP_NORMAL) {
		app.lookup("LOGIN_imglog").value = "";
		app.lookup("OPT_AppName").bind("value").toLanguage("Str_AppName_INNODEP");
		app.lookup("ASLIP_opbLicense").value = ("")
		document.title = dataManager.getString("Str_InnodepProgramName");
		var bodyContainer = app.getContainer();
		bodyContainer.style.css({
			"background-image" : "url('../theme/images/sign_img_bg_new.jpg')",
		});
	} else if (verArr[3] == OEM_ITONE_TRDATA || verArr[3] == OEM_ITONE_POSCO_DX){
		// 아이티원 향
		app.lookup("LOGIN_cbxMaster").visible = true;
		app.lookup("LOGIN_cbxUniqueID").checked = true;
		app.lookup("LOGIN_cbxUniqueID").readOnly = true;
		changeIDInputType();
		app.lookup("LOGIN_imglog").src = "../theme/custom/itone/sf_sign_img_logo_01.png";
		app.lookup("LOGIN_imglog").style.css({
			"background-size" : "auto",
		});
		app.lookup("OPT_AppName").unbind("value");
		app.lookup("OPT_AppName").visible = false;
//		app.lookup("OPT_AppName").value = "Smart Safety \n 관리자 서비스";
		
		app.lookup("LOGIN_cbxUniqueID").unbind("text");
		app.lookup("LOGIN_cbxUniqueID").text = "로그인 아이디";
		
		var bodyContainer = app.getContainer();
		bodyContainer.style.css({
//			"background-image" : "url('../theme/images/menu_img_bg_01.jpg')",
			"background-image" : "NONE",
			"background-color" : "black",
		});
		
		app.lookup("LOGIN_ipbUserID").style.css({
			"background-color" : "rgba(255,255,255,0.65)",
		});
		app.lookup("LOGIN_ipbUserPW").style.css({
			"background-color" : "rgba(255,255,255,0.65)",
		})
		
		
	} else {		
		var agent = navigator.userAgent.toLowerCase();
		if ( (navigator.appName == 'Netscape' && navigator.userAgent.search('Trident') != -1) || (agent.indexOf("msie") != -1) ) {
			chromeLink.removeAllEventListeners();
			chromeLink32.removeAllEventListeners();
			//chromeLink.bind("value").toLanguage("Str_ExplorerWarning");
			//chromeLink32.bind("value").toLanguage("Str_OtherBrowser");
			chromeLink.value = dataManager.getString("Str_ExplorerWarning")
			chromeLink32.value = dataManager.getString("Str_OtherBrowser")
			chromeLink.style.css({"color" : "#ff0000"});
			chromeLink32.style.css({"color" : "#ff0000"});
		}

		app.lookup("LOGIN_imglog").src = "../theme/images/sign_img_logo_01.png";
	}
	
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){ // 로그인 상태
		var account = app.lookup("AccountInfo");
		var result = app.lookup("Result");
		var systeminfo = app.lookup("SystemInfo");
		//console.log(systeminfo.getDatas());
		
		dataManager = getDataManager();
		dataManager.setAccountInfo(account);			
		dataManager.setSystemInfo(systeminfo);
		
		//일반버전 강원래드 구분
		var usint_version;
		if (dataManager.getOemVersion() == OEM_KANGWONLAND) { // 2factor 인증
			var masterID = account.getValue("UserID");
			if (masterID != 1000000000000000000) { //마스터 관리자는 2factor 로그인 안하고 패스
				
				usint_version = dataManager.getSystemVersion();
				var appld = "app/main/kangwonland/twofactlogin/cardTypeLogin" + "?" + usint_version;
				app.openDialog(appld, {width : 400, height : 250}, function(dialog){
					dialog.ready(function(dialogApp){
						dialog.bind("headerTitle").toLanguage("이중 인증처리 시스템");
						dialog.modal = true;
					});
				}).then(function(returnValue){
					console.log(returnValue);
					var result = returnValue["Result"];
					if( result == 0 ){
						var appId = "app/main/osmain" + "?" + usint_version;			
						cpr.core.App.load(appId, function(newapp) {
							app.close();
							newapp.createNewInstance().run();				
						});
					} else {// 로그 아웃 요청
						app.lookup("sms_logout").send();
					}
				});
			} else {
				usint_version = dataManager.getSystemVersion();
				var appId = "app/main/osmain" + "?" + usint_version;		
				cpr.core.App.load(appId, function(newapp) {
						app.close();
						newapp.createNewInstance().run();				
				});	
			}
			
		} else {
			var isMobile = false;
		
			var filter = "win16|win32|win64|windows|mac|macintel|linux|freebsd|openbsd|sunos|linux x86_64";			 
			if ( navigator.platform ) { // 플랫폼 체크
				if ( filter.indexOf( navigator.platform.toLowerCase() ) < 0 ) { 
					isMobile = true;	
				} 				
			}
			
			// 육본 제외 + (사이니즈 사용으로 인한 아이티원 제외)
			if (dataManager.getOemVersion() == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ITONE_TRDATA 
				|| dataManager.getOemVersion() == OEM_ITONE_POSCO_DX || dataManager.getOemVersion() == OEM_ROKMCH) { 
				isMobile = false;
			}
				//wogus 모바일 테스트 플래그
				//isMobile = true;
			if( isMobile == false){
				usint_version = dataManager.getSystemVersion();
				var appId = "app/main/osmain" + "?" + usint_version;		
				cpr.core.App.load(appId, function(newapp) {
						app.close();
						newapp.createNewInstance().run();				
				});		
			}else{
				var privilege = account.getValue("Privilege")
				var appId = "";
				if( privilege == 1 || privilege >= 1000){appId = "app/mobile/Splash";}else{appId = "app/mobile/Splash";}
				cpr.core.App.load(appId, function(newapp){app.close();newapp.createNewInstance().run();});
			}
		}
		
	} else {
		app.lookup("sms_getInitOption").send(); // 브랜드 타입 요청. 사용자 아이디 자리수 제한을 위해
	}
}

// 로그인 체크 에러
function onSms_chkLoginSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 로그인 체크 타임아웃
function onSms_chkLoginSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 브랜드 타입 가져오기 완료
function onSms_getInitOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/* @type cpr.protocols.Submission */
	var sms_getBrandType = e.control;
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		var dmBrandType = app.lookup("brandType");		
		var dmInitOption = app.lookup("initOption");
		var userIDLength = dmInitOption.getValue("userIDLength");
		//console.log("userIDLength ", userIDLength);
		var brandType = dmBrandType.getValue("Type");
		if( brandType == BRAND_NITGEN ){
			if( userIDLength < 4 || userIDLength > 19 ){
				userIDLength = 19;
			}			
		}else {
			if( userIDLength < 2 || userIDLength > 8 ){
				userIDLength = 18;
			}			
		}
		app.lookup("LOGIN_ipbUserID").maxLength = userIDLength;
		dataManager.setUserIDLength(userIDLength);
		
		//var SystemInfo = app.lookup("SystemInfo");
		var oemVersion = dataManager.getOemVersion();
		if(oemVersion == OEM_JAWOONDAE){
	//		app.lookup("LOGIN_cbxMaster_Button").enabled = true;
			app.lookup("LOGIN_cbxMaster").visible = false;
			app.lookup("LOGIN_cbxUniqueID").trueValue = true;
			app.lookup("LOGIN_cbxUniqueID").checked = true;
			changeIDInputType();
		}
		
	} else {
		console.log("else",app);
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorBrandTypeLoadingFailed"));
	}
	
	//
	app.lookup("LOGIN_ipbUserID").inputFilter = ""// /^[a-zA-Z0-9]*$/;
		app.lookup("LOGIN_ipbUserID").maxLength = 20;	
		
		
}

// 브랜드 타입 가져오기 에러 
function onSms_getInitOptionSubmitError(/* cpr.events.CSubmissionEvent */ e){	
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 브랜드 타입 가져오기 타임아웃
function onSms_getInitOptionSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// "SIGN IN" 버튼에서 click 이벤트 발생 시 호출.
function onLOGIN_btnSignInClick(e){
	 	
	//var SystemInfo = app.lookup("SystemInfo");
	var oemVersion = dataManager.getOemVersion();
	if(oemVersion == OEM_JAWOONDAE){
		var agent = navigator.userAgent.toLowerCase();	
		if ( (navigator.appName == 'Netscape' && navigator.userAgent.search('Trident') != -1) || (agent.indexOf("msie") != -1) ) {
			dialogAlert(app, "경고", "인터넷 익스플로러는 지원하지 않습니다. 상단의 크롬 설치 파일로 크롬 브라우져를 설치하신 후 크롬브라우져로 접속하시기 바랍니다");
	  		return;
		}
		else {
  			//alert("인터넷 익스플로러 브라우저가 아닙니다.");
		}
	}
	
	var requestData = app.lookup("dmLoginReq");
	var userID = app.lookup("LOGIN_ipbUserID").value;

	if( userID == null ){
		dialogAlert(app, dataManager.getString("Str_InputDataError"), dataManager.getString("Str_UserIDInputAlert"));
		return;
	}
	
	var SystemInfo = app.lookup("SystemInfo");
	requestData.setValue( "userId", userID);
	var userType = 0;
	if(app.lookup("LOGIN_cbxMaster").value == "true" ){	
		userType = 2;
	} else if(app.lookup("LOGIN_cbxUniqueID").value == "true" ){
		userType = 1;
	} else if(app.lookup("LOGIN_ipbUserID").text == "Master"){ //자운대 버전으로 접속 후 오른쪽 하단의 투명한 버튼을 클릭했을시 관리자 로그인이 가능하도록 하기 위해 추가
		userType = 2;
	}
	requestData.setValue( "userType", userType);
	
	var userPW = app.lookup("LOGIN_ipbUserPW").value;
	if( userPW  == null || userPW.length < 4 ){
		//dialogAlert(app, "입력정보 오류", "비밀번호는 최소 4자리입니다.");
		dialogAlert(app, dataManager.getString("Str_InputDataError"), dataManager.getString("Str_PasswordLengthError"));
		return;
	}
	requestData.setValue( "password", userPW);
	
	app.lookup("sms_login").send();
}

// 로그인 결과 수신
function onSms_loginSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	var account = app.lookup("AccountInfo");
	var result = app.lookup("Result");
	var systeminfo = app.lookup("SystemInfo");
	//console.log(systeminfo.getDatas());
	var resultCode = result.getValue("ResultCode")
	if( resultCode == 0 || resultCode == 1 || resultCode == ERROR_USER_LOGINPASSWORD_EXPIRATION ){	
		if(result.getValue("ResultCode") ==  ERROR_USER_LOGINPASSWORD_EXPIRATION ) { // 만기일자의 경우 비밀번호 변경하게 처리
			account.setValue("FirstLoginFlag", 1);
		}
		
		dataManager = getDataManager();
		dataManager.setAccountInfo(account);			 
		console.log(systeminfo.getValue("McardLimit"));
		dataManager.setSystemInfo(systeminfo);
				
		//자운대 버전의 경우 로그인 성공시 환영합니다 문구 출력
		if(dataManager.getOemVersion() == OEM_JAWOONDAE){
			dialogAlert(app, dataManager.getString("Str_LoginSuccess"), dataManager.getString("Str_Welcome"), function(/*cpr.controls.Dialog*/dialog){ // 환영합니다 메세지를 띄운 후 이동하도록 변경
				dialog.addEventListenerOnce("close", function(e) { 
					cpr.core.App.load("app/main/osmain", function(newapp) {					
						app.close();					
						newapp.createNewInstance().run();				
					});
				});
			});
		} else if (dataManager.getOemVersion() == OEM_KANGWONLAND) { // 2factor 인증
			var masterID = account.getValue("UserID");
			var privilege = account.getValue("Privilege");
			if (masterID == 1000000000000000000 || privilege == 1000) {
				var usint_version;
				usint_version = dataManager.getSystemVersion();
				var appId = "app/main/osmain" + "?" + usint_version;			
				cpr.core.App.load(appId, function(newapp) {
					app.close();
					newapp.createNewInstance().run();				
				});
			} else {
				//방문객 관리도 2차로그인 안하도록 예외처리 한다.
				var usint_version;
				usint_version = dataManager.getSystemVersion();
				var appld = "app/main/kangwonland/twofactlogin/cardTypeLogin" + "?" + usint_version;
				app.openDialog(appld, {width : 400, height : 250}, function(dialog){
					dialog.ready(function(dialogApp){
						dialog.bind("headerTitle").toLanguage("이중 인증처리 시스템");
						dialog.modal = true;
					});
				}).then(function(returnValue){
					console.log(returnValue);
					var result = returnValue["Result"];
					if( result == 0 ){
						var appId = "app/main/osmain" + "?" + usint_version;			
						cpr.core.App.load(appId, function(newapp) {
							app.close();
							newapp.createNewInstance().run();				
						});
					} else {// 로그 아웃 요청
						app.lookup("sms_logout").send();
					}
				});
			}
			
		} else{
			
			var usint_version;
			usint_version = dataManager.getSystemVersion();
			var appId = "app/main/osmain" + "?" + usint_version;			
			cpr.core.App.load(appId, function(newapp) {
				app.close();
				newapp.createNewInstance().run();				
			});
		}
	
	}else{		
		var ResultCode = result.getValue("ResultCode");
		var dmInitOption = app.lookup("initOption");
		var authUnavailableTime = dmInitOption.getValue("authUnavailableTime");
		if (ResultCode == ERROR_USER_LOGIN_FAIL_COUNT) {
			var remindCount = app.lookup("LoginFailInfo").getValue("RemindCount");
			if (remindCount <= 0) { //0 회인경우 로그인 실패 시간으로 오류 표시
				//dialogAlert(app, dataManager.getString("Str_ErrorLoginFail"), "더이상 로그인 할 수 없습니다. 관리자에게 문의하세요");
				if(dataManager.getOemVersion() == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH){
					// 여기에서 현역/군무원-> 일반사용자 // 관리자 구분
					var privilege = app.lookup("AccountInfo").getValue("Privilege");
					dataManager = getDataManager();
					dataManager.setAccountInfo(account);			
					dataManager.setSystemInfo(systeminfo);
					SetInitPasswordAMHQ(privilege);
				} else {
					// 카운트 횟수에 도달하여 인증불가 되었을 때
					if (authUnavailableTime == 0){
						dialogAlert(app, dataManager.getString("Str_ErrorLoginFail"), dataManager.getString("Str_ErrorLoginFailTime"));
					} else {
						dialogAlert(app, dataManager.getString("Str_ErrorLoginFail"), dataManager.getString("Str_ErrorLoginFailTime"+authUnavailableTime+"Minute"));
					}
				}
				
			} else {	
				dialogAlert(app, dataManager.getString("Str_ErrorLoginFail"), dataManager.getString("Str_ErrorLoginsRemainingCount")+" : "+ app.lookup("LoginFailInfo").getValue("RemindCount"));	
			}			
		} else if (ResultCode == ERROR_LOGIN_FAIL_TIME) {
			// 인증불가시간아이디 로그인 했을 때 에러 코드
			if (authUnavailableTime == 0){
				dialogAlert(app, dataManager.getString("Str_ErrorLoginFail"), dataManager.getString("Str_ErrorLoginFailTime"));
			} else {
				dialogAlert(app, dataManager.getString("Str_ErrorLoginFail"), dataManager.getString("Str_ErrorLoginFailTime"+authUnavailableTime+"Minute"));
			}
		} else {
			var msg = dataManager.getString(getErrorString(resultCode));
			if( msg == undefined || msg == ""){msg = dataManager.getString("Str_ErrorLoginFailed") }
			
			dialogAlert(app, dataManager.getString("Str_ErrorLoginFail"), msg);
			//dialogAlert(app, dataManager.getString("Str_ErrorLoginFail"), dataManager.getString("Str_ErrorLoginFailed"));			
		}
	
	}
	
}
// 서브미션에서 submit-success 이벤트 발생 시 호출. 
function onSms_loginSubmitSuccess(e){	
}

// 서브미션에서 submit-error 이벤트 발생 시 호출.
function onSms_loginSubmitError(/* cpr.events.CSubmissionEvent */ e){		
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR);			
}

// 서브미션에서 submit-timeout 이벤트 발생 시 호출.
function onSms_loginSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// 유니크 아이디 로그인 체크박스 클릭
function onLOGIN_cbxUniqueIDValueChange(/* cpr.events.CValueChangeEvent */ e){	
	changeIDInputType();
}

function changeIDInputType(){
	var cbxUniqueID = app.lookup("LOGIN_cbxUniqueID");
	if(cbxUniqueID.value == "true" ){			
		app.lookup("LOGIN_ipbUserID").inputFilter = ""// /^[a-zA-Z0-9]*$/;
		app.lookup("LOGIN_ipbUserID").maxLength = 20;		
	} else {
		app.lookup("LOGIN_ipbUserID").inputFilter = /^[0-9]*$/;
		var dmBrandType = app.lookup("brandType");		
		var brandType = dmBrandType.getValue("Type");
		if( brandType == BRAND_NITGEN ){
			app.lookup("LOGIN_ipbUserID").maxLength = 19;			
		}else {
			app.lookup("LOGIN_ipbUserID").maxLength = 8;
		}
	}
}

// 마스터 관리자 체크
function onLOGIN_cbxMasterValueChange(/* cpr.events.CValueChangeEvent */ e){
	/* @type cpr.controls.CheckBox */
	var lOGIN_cbxMaster = e.control;
	if(lOGIN_cbxMaster.checked == true ){		
		app.lookup("LOGIN_ipbUserID").inputFilter = /^[a-zA-Z0-9]*$/;
		app.lookup("LOGIN_ipbUserID").text = "Master";
		app.lookup("LOGIN_ipbUserID").readOnly = true;
		app.lookup("LOGIN_cbxUniqueID").checked = false;
		app.lookup("LOGIN_cbxUniqueID").enabled = false;
	} else {
		app.lookup("LOGIN_ipbUserID").text = "";
		app.lookup("LOGIN_ipbUserID").readOnly = false;
		app.lookup("LOGIN_cbxUniqueID").enabled = true;
		
		var oemVersion = dataManager.getOemVersion();
		if(oemVersion == OEM_ITONE_TRDATA || oemVersion == OEM_ITONE_POSCO_DX) {
			app.lookup("LOGIN_cbxUniqueID").checked = true;
			app.lookup("LOGIN_cbxUniqueID").readOnly = true;
		}
		
		changeIDInputType();
	}
}


/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onLOGIN_ipbUserPWKeyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var lOGIN_ipbUserPW = e.control;
	if( e.keyCode == 13 ){ // 검색창에서 Enter 입력시..
 		onLOGIN_btnSignInClick();
 	}
}

function SetInitPasswordAMHQ(privilegeID) {
	var appld;
	var usint_version;
	var prop;
	usint_version = dataManager.getSystemVersion();
	if (privilegeID == 0) {
		dialogAlert(app, dataManager.getString("Str_ErrorLoginFail"), "관리자 권한이 비정상 상태입니다. 상위관리자에게 문의 하세요");
		return;
	} else {
		if (privilegeID == UserPrivArmyOnDuty || privilegeID == UserPrivArmyMilitaryPersonnel 
			|| privilegeID == UserPrivArmyPublicService ) {
			// 이름 사번 생년월일 -> 초기화
			appld = "app/custom/army_hq/system/userInitPassword"  + "?" + usint_version;
			prop = {width : 460, height : 300};
		} else if (privilegeID == 1) {
			appld = "app/custom/army_hq/system/adminInitPassword"  + "?" + usint_version;
			prop = {width : 480, height : 330};
		} else {
			dialogAlert(app, dataManager.getString("Str_ErrorLoginFail"), "초기화 진행 할수 없는 관리자 입니다. 상위관리자에게 문의하세요");
			return;
		}
		 				 
		app.openDialog(appld, prop, function(dialog){
			dialog.ready(function(dialogApp){
				dialog.bind("headerTitle").toLanguage("패스워드 초기화 시스템");
				dialog.modal = true;
				dialog.initValue = {"privilegeID": privilegeID};
			});
		}).then(function(returnValue){
			if (returnValue == true) {
				dialogAlert(app, dataManager.getString("Str_Warning"), "패스워드 초기화가 완료 되었습니다. 다시 로그인 시도 해주세요");	
			} else {
				dialogAlert(app, dataManager.getString("Str_Warning"), "패스워드 초기화가 실패 되었습니다. 관리자에게 문의하세요");
			}
		});
	}
	return;
}


