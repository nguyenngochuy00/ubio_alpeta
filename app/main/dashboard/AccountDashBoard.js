/************************************************
 * AccountDashBoard.js
 * Created at 2019. 3. 5. 오후 4:20:36.
 *
 * @author osm8667
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var usint_version;
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	var userInfo = dataManager.getAccountInfo().getDatas();
	
	var infoMap = app.lookup("dm_AccInfo");
	if(userInfo){
		var iptID = app.lookup("optAccID");
		var iptName = app.lookup("optAccName");
		var iptGrp = app.lookup("optAccGroup");
		
		iptID.value = dataManager.getViewAccountID();
		
		iptID.value = userInfo.UserID?iptID.value:"";
		iptName.value = userInfo.Name?userInfo.Name:"No Name";
		
		var Version = dataManager.getSystemVersion();
		var iptVersion = app.lookup("optVersion");
		
		var oemVersion = dataManager.getOemVersion();
		//이노뎁 버전의 경우 버전 정보 앞의 두자리만 표기, 라이센스 버튼 삭제
		if(oemVersion == OEM_INNODEP){
			var InnodepVersion = Version.split(".");
			//iptVersion.value = InnodepVersion[0]+"."+InnodepVersion[1]+"."+InnodepVersion[2];
			iptVersion.value = "1.0.0" // 이노뎁의 버전은 임시로 하드코딩. 현재 서버에서 0.1.6 으로 넘어옴
			app.lookup("btnLicense").visible = false;
		} else if (oemVersion == OEM_JAWOONDAE) { 
			app.lookup("BoardGroup").getLayout().setRowVisible(8, true);
//			app.lookup("btnPassword").visible = true;
			iptVersion.value = Version;	
		} else if( oemVersion == OEM_ARMY_HQ  || dataManager.getOemVersion() == OEM_ROKMCH){
			app.lookup("btnSelectLang").visible = false;
		} else if ( oemVersion == OEM_INNODEP_NORMAL) {
			app.lookup("btnContact").visible = false;
		} else if ( oemVersion == OEM_GS_BASIC) {
			app.lookup("BoardGroup").getLayout().setRowVisible(6, false);
			app.lookup("BoardGroup").getLayout().setRowVisible(14, false);
		} else if (oemVersion == OEM_ITONE_TRDATA || oemVersion == OEM_ITONE_POSCO_DX) {
//			app.lookup("BoardGroup").getLayout().setRowVisible(8, true);
			app.lookup("BoardGroup").getLayout().setRowVisible(9, true);
			app.lookup("BoardGroup").getLayout().setRowVisible(10, true);
			app.lookup("BoardGroup").getLayout().setRowVisible(11, true);
			var srcFieldInfo = dataManager.getItoneFieldInfo();
			var dstFieldInfo = app.lookup("dm_itoneFieldInfo")
			srcFieldInfo.copyToDataMap(dstFieldInfo);
		}
		iptVersion.value = Version;	
		app.lookup("BoardGroup").redraw();
	}
	
}


/*
 * "언어선택" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnSelectLangClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var btnSelectLang = e.control;
	rootDialog(app, "app/main/mainEmb/MultiLang", 400, 150, "Str_LanguageSetting", true, null, null);
}


/*
 * "로그아웃" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnLogoutClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var btnLogout = e.control;
	dialogConfirm(app.getRootAppInstance(), dataManager.getString("Str_Logout"), dataManager.getString("Str_LogoutConfirm"), function(/*cpr.controls.Dialog*/dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				app.lookup("sms_logout").send();
			} else {
				return;
			}
		});
	});
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms_logoutSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var sms_logout = e.control;
	var appld = "app/app" + "?" + usint_version;
	cpr.core.App.load(appld, function(newapp) {
		app.getRootAppInstance().close();
		location.reload();//임시..현재 app 최초호출 시 라이브러리들이 호출되는데 로그아웃 후 newInstance를 해도 라이브러리는 안불러와서 화면이 보이지 않음
	});
	return;
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_logoutSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var sms_logout = e.control;
}

// 라이선스 클릭
function onBtnLicenseClick(/* cpr.events.CMouseEvent */ e){
	var inApp = app.getRootAppInstance();
	
	//var appld = "app/main/install/LicenseInfo" + "?" + usint_version;
	var appld = "app/main/install/licenseInfoEx" + "?" + usint_version;
	var h = 490;
	if (dataManager.getMobileCardVersion() == OEM_MOBILECARD_ALPETA){
		h = 545;
	}
	app.getRootAppInstance().openDialog(appld, {width: 720, height: h}, function(dialog){
		dialog.ready(function(dialogApp){
			dialog.modal = true;
			dialog.headerVisible = true;
			dialog.headerClose = true;
			dialog.resizable = true;
			dialog.initValue = {"autoClose":false};
			dialog.bind("headerTitle").toLanguage("Str_License");
		});
	})
}


/*
 * "패스워드 변경" 버튼(btnPassword)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnPasswordClick(/* cpr.events.CMouseEvent */ e){	
	app.getRootAppInstance().openDialog("app/main/mainEmb/SetPassword", {width: 400, height: 250}, function(dialog){
		dialog.ready(function(dialogApp){
			dialog.modal = true;
		});
	}).then(function(returnValue){
	});
}



/*
 * 버튼(btnContact)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnContactClick(/* cpr.events.CMouseEvent */ e){
	var wp = window.open("https://docs.google.com/forms/d/e/1FAIpQLScwAdIVs00QdPnNjxjkgp61yErhCstC71BoIrmQi_hOSazNRw/viewform", '_blank');
}
