/************************************************
 * licenseInfoEx.js
 * Created at 2020. 7. 14. 오전 10:01:16.
 *
 * @author fois
 ************************************************/

var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var LI_autoClose;
var mobileCardVersion;

function onBodyLoad( /* cpr.events.CEvent */ e) {
	comLib = createComUtil(app);
	dataManager = getDataManager();
	mobileCardVersion = dataManager.getMobileCardVersion();
	var licenseLevel = dataManager.getSystemLicenseLevel();
//	console.log(mobileCardVersion);
	var rdbMobileRegistType = app.lookup("LI_rdbMobileRegistType");
	var tapFolder = app.lookup("LMLIP_TapFolder");
	
	if (mobileCardVersion != OEM_MOBILECARD_ALPETA || Number(licenseLevel) < LicenseSTANDARD){
		tapFolder.hideHeader = true;
		tapFolder.style.css("padding-top", "none");
		app.lookup("alpetaLicenseGroup").style.css("border-top", "none");
		app.lookup("alpetaLicenseGroup").style.css("padding-top", "none");
	} else {
		if (dataManager.getAccountID() != 1000000000000000000){
			rdbMobileRegistType.enabled = false;
			app.lookup("LMLIP_btnXkeyActivate").enabled = false;
			tapFolder.readOnly = true;
		}
	}
	
	var initValue = app.getHost().initValue;
	LI_autoClose = initValue["autoClose"];
	
	app.lookup("LMLIE_ipbSerial1").inputFilter = /^[a-zA-Z0-9]*$/;
	app.lookup("LMLIE_ipbSerial2").inputFilter = /^[a-zA-Z0-9]*$/;
	app.lookup("LMLIE_ipbSerial3").inputFilter = /^[a-zA-Z0-9]*$/;
	app.lookup("LMLIE_ipbSerial4").inputFilter = /^[a-zA-Z0-9]*$/;
	app.lookup("LMLIE_ipbCustomerID").inputFilter = /^[a-zA-Z0-9]*$/;
	
	var cmbLicenseType = app.lookup("LI_cmbLicenseType");
	cmbLicenseType.addItem(new cpr.controls.Item(dataManager.getString("----"),LicenseNone));
	cmbLicenseType.addItem(new cpr.controls.Item(dataManager.getString("Str_LicenseLITE"),LicenseLITE));
	cmbLicenseType.addItem(new cpr.controls.Item(dataManager.getString("Str_LicenseSTANDARD"),LicenseSTANDARD));
	cmbLicenseType.addItem(new cpr.controls.Item(dataManager.getString("Str_LicensePREMIUM"),LicensePREMIUM));
	cmbLicenseType.addItem(new cpr.controls.Item(dataManager.getString("Str_LicenseENTERPRISE"),LicenseENTERPRISE));
	
	var cmbLicenseStatus = app.lookup("LI_cmbLicenseStatus");
	cmbLicenseStatus.addItem(new cpr.controls.Item(dataManager.getString("Str_LicenseNormal"),0));
	cmbLicenseStatus.addItem(new cpr.controls.Item(dataManager.getString("Str_LicenseExpired"),1));
	cmbLicenseStatus.addItem(new cpr.controls.Item(dataManager.getString("Str_LicenseInvalidMac"),2));
	
	
	var rdbRegistType = app.lookup("LI_rdbRegistType");
	rdbRegistType.addItem(new cpr.controls.Item(dataManager.getString("Str_LicenseOnlineActivation"), 1));
	rdbRegistType.addItem(new cpr.controls.Item(dataManager.getString("Str_LicenseDirectInput"), 2));
	rdbRegistType.selectItem(0,true);
	

	rdbMobileRegistType.addItem(new cpr.controls.Item(dataManager.getString("Str_LicenseOnlineActivation"), 1));
	rdbMobileRegistType.addItem(new cpr.controls.Item(dataManager.getString("Str_LicenseDirectInput"), 2));
	rdbMobileRegistType.selectItem(0,true);	
		
	updateDisplayInfo();	
	sendLicenseInfoRequest();
}

function updateDisplayInfo(){
	var rdbRegistType = app.lookup("LI_rdbRegistType");
	if (rdbRegistType.value == 1) {		
		app.lookup("LI_ipbLicenseKey").readOnly = true;
		
		app.lookup("LI_btnClientKeyCreate").visible = false;
		app.lookup("LI_opbClientKey").visible = false;
		app.lookup("LI_opbClientKeyGuide").visible = false;
		app.lookup("LMLIE_opbClientKey").visible = false;
	}else {
		app.lookup("LI_ipbLicenseKey").readOnly = false;
		
		app.lookup("LI_btnClientKeyCreate").visible = true;
		app.lookup("LI_opbClientKey").visible = true;
		app.lookup("LI_opbClientKeyGuide").visible = true;
		app.lookup("LMLIE_opbClientKey").visible = true;		
	}	
}

//
function onLI_rdbRegistTypeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	updateDisplayInfo();
}

//
function onLi_shlQRCodeLoad( /* cpr.events.CUIEvent */ e) {
	var content = e.content;
	content.innerHTML = "<div id=\"qrcode\"></div>";
}

function sendLicenseInfoRequest() {
	var sms_getLicenseInfo = app.lookup("sms_getLicenseInfo");
	sms_getLicenseInfo.send();
}

// 라이선스 정보 가져오기 완료
function onSms_getLicenseInfoSubmitDone( /* cpr.events.CSubmissionEvent */ e) {

	var resultCode = app.lookup("Result").getValue("ResultCode");

	if (resultCode == 0) {
		var licenseInfo = app.lookup("LicenseInfo");
		var expireAt = licenseInfo.getValue("ExpireAt");
		if(expireAt.length==8){
			var expireAt = expireAt.substring(0,4)+"-"+expireAt.substring(4,6)+"-"+expireAt.substring(6,8);
		}
		
		var serialKey = licenseInfo.getValue("SerialKey");
		serialKey = serialKey.replace(/-/gi, "","");
		var strLength = serialKey.length
		if( strLength > 6 ){
			app.lookup("LMLIE_ipbSerial1").value = serialKey.substring(0,6);
		}
		if( strLength > 12 ){
			app.lookup("LMLIE_ipbSerial2").value = serialKey.substring(6,12);
		}
		if( strLength > 18 ){
			app.lookup("LMLIE_ipbSerial3").value = serialKey.substring(12,18);
			app.lookup("LMLIE_ipbSerial4").value = serialKey.substring(18,strLength);
		}			
		app.lookup("LI_opbLicenseExpireAt").text =expireAt;
		app.lookup("LI_ipbServerAddress").text = licenseInfo.getValue("ServerAddress");
		app.lookup("LI_ipbServerPort").text = licenseInfo.getValue("ServerPort");
		
		app.lookup("LI_grpLicenseInfo").redraw();
		app.lookup("LI_grpCustomerInfo").redraw();
		
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 라이선스 정보 가져오기 에러
function onSms_getLicenseInfoSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

// 라이선스 정보 가져오기 타임아웃
function onSms_getLicenseInfoSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

// 라이선스 활성화 클릭
function onLMLIP_btnActivateClick( /* cpr.events.CMouseEvent */ e) {
	
	if( app.lookup("LMLIE_ipbCustomerID").text == null || app.lookup("LMLIE_ipbCustomerID").text.length < 6 || app.lookup("LMLIE_ipbCustomerID").text.length > 20){
		
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_CustomerIDLen"), function(/*cpr.controls.Dialog*/dialog){
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("LMLIE_ipbCustomerID").focus(true);			
			});
		});	
		
		return false
	}

	var rdbRegistType = app.lookup("LI_rdbRegistType");
	var serialKey = app.lookup("LMLIE_ipbSerial1").value + "-" + app.lookup("LMLIE_ipbSerial2").value + "-" + app.lookup("LMLIE_ipbSerial3").value + "-" + app.lookup("LMLIE_ipbSerial4").value;
	var dmLicenseActivation = app.lookup("LicenseActivation");
	dmLicenseActivation.setValue("SerialKey", serialKey);
	dmLicenseActivation.setValue("CustomerID", app.lookup("LMLIE_ipbCustomerID").value);
	dmLicenseActivation.setValue("CompanyName", app.lookup("LMLIE_ipbCompanyName").value);

	if(dmLicenseActivation.getValue("ServerPort") == ""){ // 서버포트 칸에 아무것도 적혀있지 않을 경우 오류 발생 방지
		dmLicenseActivation.setValue("ServerPort", 0);
	}
		
	if( rdbRegistType.value == 1 ){
		dmLicenseActivation.setValue("Mode", "online");
	}else {
		dmLicenseActivation.setValue("Mode", "direct");
		dmLicenseActivation.setValue("LicenseKey", app.lookup("LI_ipbLicenseKey").value);
	}
	var sms_postLicenseActivate = app.lookup("sms_postLicenseActivate");
	sms_postLicenseActivate.send();
}

// 클라이언트 키 생성
function onButtonClick( /* cpr.events.CMouseEvent */ e) {

	if( app.lookup("LMLIE_ipbSerial1").text == null || app.lookup("LMLIE_ipbSerial1").text.length != 6 ){
		
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_InvalidSerialKey"), function(/*cpr.controls.Dialog*/dialog){
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("LMLIE_ipbSerial1").focus(true);			
			});
		});	
		
		return false
	}
	if( app.lookup("LMLIE_ipbSerial2").text == null || app.lookup("LMLIE_ipbSerial2").text.length != 6 ){
		
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_InvalidSerialKey"), function(/*cpr.controls.Dialog*/dialog){
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("LMLIE_ipbSerial2").focus(true);			
			});
		});	
		
		return false
	}
	if( app.lookup("LMLIE_ipbSerial3").text == null || app.lookup("LMLIE_ipbSerial3").text.length != 6 ){
		
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_InvalidSerialKey"), function(/*cpr.controls.Dialog*/dialog){
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("LMLIE_ipbSerial3").focus(true);			
			});
		});	
		
		return false
	}
	if( app.lookup("LMLIE_ipbSerial4").text == null || app.lookup("LMLIE_ipbSerial4").text.length != 8 ){
		
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_InvalidSerialKey"), function(/*cpr.controls.Dialog*/dialog){
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("LMLIE_ipbSerial4").focus(true);			
			});
		});	
		
		return false
	}
	if( app.lookup("LMLIE_ipbCustomerID").text == null || app.lookup("LMLIE_ipbCustomerID").text.length < 6 || app.lookup("LMLIE_ipbCustomerID").text.length > 20){
		
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_CustomerIDLen"), function(/*cpr.controls.Dialog*/dialog){
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("LMLIE_ipbCustomerID").focus(true);			
			});
		});	
		
		return false
	}
	
	var serialKey = app.lookup("LMLIE_ipbSerial1").value + "-" + app.lookup("LMLIE_ipbSerial2").value + "-" + app.lookup("LMLIE_ipbSerial3").value + "-" + app.lookup("LMLIE_ipbSerial4").value;
	var dmLicenseActivation = app.lookup("LicenseActivation");
	dmLicenseActivation.setValue("SerialKey", serialKey);
	dmLicenseActivation.setValue("CustomerID", app.lookup("LMLIE_ipbCustomerID").value);
	dmLicenseActivation.setValue("CompanyName", app.lookup("LMLIE_ipbCompanyName").value);
	
	var sms_getClientKey = app.lookup("sms_getClientKey");
	sms_getClientKey.send();
}

// 클라이언트 키 생성 요청
function onSms_getClientKeySubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");

	if (resultCode == 0) {
		app.lookup("LMLIE_opbClientKey").redraw();
		var dmLicenseActivation = app.lookup("LicenseActivation");
		var serialKey = dmLicenseActivation.getValue("SerialKey");
		var customerID = dmLicenseActivation.getValue("CustomerID");
		var companyName = dmLicenseActivation.getValue("CompanyName");

		var dmClientKeyInfo = app.lookup("ClientKeyInfo");
		var clientKey = dmClientKeyInfo.getValue("ClientKey");

		var link = "http://license.ubioalpeta.com:9400/license/activationEx/?&serialKey=" + serialKey + "&customerID=" + customerID + "&companyName=" + companyName + "&clientKey=" + clientKey;
		
		var element = document.getElementById("qrcode");
		element.innerHTML="";
		var qrcode = new QRCode(document.getElementById("qrcode"), {
			text: link,
			width: 200,
			height: 200,
			colorDark: "#000000",
			colorLight: "#ffffff",
			correctLevel: QRCode.CorrectLevel.H
		});

		$("#qrcode > img").css({
			"margin": "auto"
		});

	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 클라이언트 키 생성 에러
function onSms_getClientKeySubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

// 클라이언트 키 생성 타임아웃
function onSms_getClientKeySubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

// 라이선스 활성화 완료
function onSms_postLicenseActivateSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");

	if (resultCode == 0) {		
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_LicenseActivated"), function(/*cpr.controls.Dialog*/dialog){
			dialog.addEventListenerOnce("close", function(e) {
				if( LI_autoClose == true ){
					app.close(true);
				}			
			});
		});
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 라이선스 활성화 에러
function onSms_postLicenseActivateSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

// 라이선스 활성화 타임아웃
function onSms_postLicenseActivateSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

var LI_ctrlV = false;
function onLMLIE_ipbSerial1Keydown(/* cpr.events.CKeyboardEvent */ e){
	/** @type cpr.controls.InputBox	 */
	var lMLIE_ipbSerial1 = e.control;
	if ( e.ctrlKey == true ){
		if( e.keyCode == 86 ){
			LI_ctrlV = true;
			lMLIE_ipbSerial1.maxLength = -1;						
		}
	}
}

function onLMLIE_ipbSerial1ValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** @type cpr.controls.InputBox	 */
	var lMLIE_ipbSerial1 = e.control;
	if( LI_ctrlV == true ){	
		LI_ctrlV = false;
		var serialKey = lMLIE_ipbSerial1.text;
		serialKey = serialKey.replace(/-/gi, "","");
		console.log(serialKey);
		var strLength = serialKey.length;
		if( strLength > 6 ){
			app.lookup("LMLIE_ipbSerial1").value = serialKey.substring(0,6);
		}
		if( strLength > 12 ){
			app.lookup("LMLIE_ipbSerial2").value = serialKey.substring(6,12);
		}
		if( strLength > 18 ){
			app.lookup("LMLIE_ipbSerial3").value = serialKey.substring(12,18);
			app.lookup("LMLIE_ipbSerial4").value = serialKey.substring(18,strLength);
		}			
	} else {
		lMLIE_ipbSerial1.maxLength = 6;
		lMLIE_ipbSerial1.redraw();
	}
}

//
function onLMLIP_imgHelpClick(/* cpr.events.CMouseEvent */ e){
			
	var appld = "app/main/mainEmb/help_page";	
	app.getRootAppInstance().openDialog(appld, {width: 720, height: 470}, function(dialog){
		dialog.ready(function(dialogApp){
			dialog.modal = false;
			dialog.headerVisible = true;
			dialog.headerClose = true;			
			dialog.initValue = {"src":DLG_LICENSE};
			dialog.bind("headerTitle").toLanguage("Str_Help");
		});
	})
}


function onLI_rdbMobileRegistTypeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var rdbMregistType = app.lookup("LI_rdbMobileRegistType");
	if (rdbMregistType.value == 1) {		
		app.lookup("LI_ipbMCardLicenseKey").readOnly = true;
		
		app.lookup("LI_btnMCardClientKeyCreate").visible = false;
		app.lookup("LI_opbMCardClientKey").visible = false;
		app.lookup("LI_opbMCardClientKeyGuide").visible = false;
		app.lookup("LMLIE_opbClientKey").visible = false;
	}else {
		app.lookup("LI_ipbMCardLicenseKey").readOnly = false;
		
		app.lookup("LI_btnMCardClientKeyCreate").visible = true;
		app.lookup("LI_opbMCardClientKey").visible = true;
		app.lookup("LI_opbMCardClientKeyGuide").visible = true;
		app.lookup("LMLIE_opbMCardClientKey").visible = true;		
	}	
}

function onLMLIP_TapFolderSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var selectTap = app.lookup("LMLIP_TapFolder").getSelectedTabItem();
	switch(selectTap.id){
		case 1 :
			sendLicenseInfoRequest();
			break;
		
		case 2 :
			app.lookup("sms_getXkeyLicenseInfo").send();
			break;
	}

}

function onSms_getXkeyLicenseInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	var xkeyLicenseInfo = app.lookup("XkeyLicenseInfo");
	if (resultCode == COMERROR_NONE) {
		
	} else {
		var content = "UBio-Xkey\n" + dataManager.getString(getErrorString(resultCode));
		dialogAlert(app, dataManager.getString("Str_Failed"), content);
		if (dataManager.getXkeyLicStatus() > 0){
			if (resultCode == ErrorLicenseInvalidMac || resultCode == ErrorLicenseNotAlpetaLicense){ // Mac 에러일 경우, xkey 라이선스 상태값 변경
				dataManager.setXkeyLicStatus(XkeyLicStatusError);
			}
		}
	}
	
	if (xkeyLicenseInfo != null){
		var serialKey = xkeyLicenseInfo.getValue("SerialKey");
		serialKey = serialKey.replace(/-/gi, "","");
		var strLength = serialKey.length;
		if( strLength > 6 ){
			app.lookup("LMLIE_ipbMCardSerial1").value = serialKey.substring(0,6);
		}
		if( strLength > 12 ){
			app.lookup("LMLIE_ipbMCardSerial2").value = serialKey.substring(6,12);
		}
		if( strLength > 18 ){
			app.lookup("LMLIE_ipbMCardSerial3").value = serialKey.substring(12,18);
			app.lookup("LMLIE_ipbMCardSerial4").value = serialKey.substring(18,strLength);
		}
		app.lookup("LI_grpXkeylicInfo").redraw();
		app.lookup("LI_grpXkeylicensKey").redraw();
	}
}

function onSms_getXkeyLicenseInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getXkeyLicenseInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

var LIXkey_ctrlV = false;
function onLMLIE_ipbMCardSerial1ValueChange(/* cpr.events.CValueChangeEvent */ e){
	var lMLIE_ipbSerial1 = e.control;
	if( LIXkey_ctrlV == true ){	
		var serialKey = lMLIE_ipbSerial1.text;
		LIXkey_ctrlV = false;
		serialKey = serialKey.replace(/-/gi, "","");
		console.log(serialKey);
		var strLength = serialKey.length;
		if( strLength > 6 ){
			app.lookup("LMLIE_ipbMCardSerial1").value = serialKey.substring(0,6);
		}
		if( strLength > 12 ){
			app.lookup("LMLIE_ipbMCardSerial2").value = serialKey.substring(6,12);
		}
		if( strLength > 18 ){
			app.lookup("LMLIE_ipbMCardSerial3").value = serialKey.substring(12,18);
			app.lookup("LMLIE_ipbMCardSerial4").value = serialKey.substring(18,strLength);
		}			
	}
}

function onLMLIE_ipbMCardSerial1Keydown(/* cpr.events.CKeyboardEvent */ e){
	if ( e.ctrlKey == true ){
		if( e.keyCode == 86 ){
			LIXkey_ctrlV = true;						
		}
	}
}

function onLI_btnMCardClientKeyCreateClick(/* cpr.events.CMouseEvent */ e){
	var serial1 = app.lookup("LMLIE_ipbMCardSerial1");
	if( serial1.text == null || serial1.text.length != 6 ){
		
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_InvalidSerialKey"), function(dialog){
			dialog.addEventListenerOnce("close", function(e) {
				serial1.focus(true);			
			});
		});	
		return
	}

	var serial2 = app.lookup("LMLIE_ipbMCardSerial2");
	if( serial2.text == null || serial2.text.length != 6 ){
		
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_InvalidSerialKey"), function(dialog){
			dialog.addEventListenerOnce("close", function(e) {
				serial2.focus(true);			
			});
		});	
		return
	}
	
	var serial3 = app.lookup("LMLIE_ipbMCardSerial3");
	if( serial3.text == null || serial3.text.length != 6 ){
		
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_InvalidSerialKey"), function(dialog){
			dialog.addEventListenerOnce("close", function(e) {
				serial3.focus(true);			
			});
		});	
		return
	}
	
	var serial4 = app.lookup("LMLIE_ipbMCardSerial4");
	if( serial4.text == null || serial4.text.length != 8 ){
		
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_InvalidSerialKey"), function(dialog){
			dialog.addEventListenerOnce("close", function(e) {
				serial4.focus(true);			
			});
		});	
		return
	}
	
	var ipbSiteCode = app.lookup("LMLIE_ipbXkeySiteCode");
	if( ipbSiteCode.text == null || ipbSiteCode.text.length < 1 || ipbSiteCode.text.length > 20){
		
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorXkeyLicenseInvalidSiteCode"), function(dialog){
			dialog.addEventListenerOnce("close", function(e) {
				ipbSiteCode.focus(true);			
			});
		});		
		return
	}
	
	var ipbServerIP = app.lookup("LMLIE_ipbXkeyServerIP");
	if( ipbServerIP.text == null || ipbServerIP.text.length < 1){
		
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorXkeyLicenseInvalidIP"), function(dialog){
			dialog.addEventListenerOnce("close", function(e) {
				ipbServerIP.focus(true);			
			});
		});		
		return
	}
	
	var ipbServerPort = app.lookup("LMLIE_ipbXkeyServerPort");
	if( ipbServerPort.text == null || ipbServerPort.text.length < 1){
		
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorXkeyLicenseInvalidPort"), function(dialog){
			dialog.addEventListenerOnce("close", function(e) {
				ipbServerPort.focus(true);			
			});
		});		
		return
	}
	
	var serialKey = serial1.value + "-" + serial2.value + "-" + serial3.value + "-" + serial4.value;
	var dmLicenseActivation = app.lookup("XkeyLicenseActivation");
	dmLicenseActivation.setValue("SerialKey", serialKey);
	dmLicenseActivation.setValue("SiteCode", ipbSiteCode.value);
	dmLicenseActivation.setValue("ServerIP", ipbServerIP.value);
	dmLicenseActivation.setValue("ServerPort", ipbServerPort.value);
	
	app.lookup("sms_postXkeyClientKey").send();
	
}


function onSms_postXkeyClientKeySubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");

	if (resultCode == COMERROR_NONE) {
		app.lookup("LMLIE_opbMCardClientKey").redraw();
		var dmLicenseActivation = app.lookup("XkeyLicenseActivation");
		var serialKey = dmLicenseActivation.getValue("SerialKey");
		var siteCode = dmLicenseActivation.getValue("SiteCode");
		var serverIP = dmLicenseActivation.getValue("ServerIP");

		var clientKey = app.lookup("XkeyClientKeyInfo").getValue("ClientKey");

		var link = "http://license.ubioalpeta.com:5005/Xkey/license/activationEx?serialKey=";
		link = link + serialKey + "&siteCode=" + siteCode + "&clientKey=" + clientKey + "&serverIP=" + serverIP;
//		var link = "http://192.168.30.160:5005/Xkey/license/activationEx?serialKey=" + serialKey + "&siteCode=" + siteCode + "&clientKey=" + clientKey;
		
		var element = document.getElementById("xkeyQR");
		element.innerHTML="";
		var qrcode = new QRCode(document.getElementById("xkeyQR"), {
			text: link,
			width: 200,
			height: 200,
			colorDark: "#000000",
			colorLight: "#ffffff",
			correctLevel: QRCode.CorrectLevel.H
		});

		$("#qrcode > img").css({
			"margin": "auto"
		});

	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_postXkeyClientKeySubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_postXkeyClientKeySubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onLMLIP_btnXkeyActivateClick(/* cpr.events.CMouseEvent */ e){
	var ipbSiteCode = app.lookup("LMLIE_ipbXkeySiteCode");
	if( ipbSiteCode.text == null || ipbSiteCode.text.length < 1 || ipbSiteCode.text.length > 20){
		
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorXkeyLicenseInvalidSiteCode"), function(dialog){
			dialog.addEventListenerOnce("close", function(e) {
				ipbSiteCode.focus(true);			
			});
		});		
		return
	}
	
	var ipbServerIP = app.lookup("LMLIE_ipbXkeyServerIP");
	if( ipbServerIP.text == null || ipbServerIP.text.length < 1){
		
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorXkeyLicenseInvalidIP"), function(dialog){
			dialog.addEventListenerOnce("close", function(e) {
				ipbServerIP.focus(true);			
			});
		});		
		return
	}
	
	var ipbServerPort = app.lookup("LMLIE_ipbXkeyServerPort");
	if( ipbServerPort.text == null || ipbServerPort.text.length < 1){
		
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorXkeyLicenseInvalidIP"), function(dialog){
			dialog.addEventListenerOnce("close", function(e) {
				ipbServerPort.focus(true);			
			});
		});		
		return
	}

	var rdbRegistType = app.lookup("LI_rdbMobileRegistType");
	var serialKey = app.lookup("LMLIE_ipbMCardSerial1").value + "-" + app.lookup("LMLIE_ipbMCardSerial2").value + "-" + app.lookup("LMLIE_ipbMCardSerial3").value + "-" + app.lookup("LMLIE_ipbMCardSerial4").value;
	var dmLicenseActivation = app.lookup("XkeyLicenseActivation");
	dmLicenseActivation.setValue("SerialKey", serialKey);
	dmLicenseActivation.setValue("SiteCode", ipbSiteCode.value);
	dmLicenseActivation.setValue("ServerIP", ipbServerIP.value);
	dmLicenseActivation.setValue("ServerPort", ipbServerPort.value);
		
	if( rdbRegistType.value == 1 ){
		dmLicenseActivation.setValue("Mode", "online");
	}else if ( rdbRegistType.value == 2 ) {
		dmLicenseActivation.setValue("Mode", "direct");
		dmLicenseActivation.setValue("LicenseKey", app.lookup("LI_ipbMCardLicenseKey").value);
	}
	var sms_postActivate = app.lookup("sms_postXkeyLicenseActivate");
	sms_postActivate.send();
}


function onSms_postXkeyLicenseActivateSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");

	if (resultCode == COMERROR_NONE) {
		dataManager.setXkeyLicStatus(XkeyLicStatusOK);		
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_LicenseActivated"), function(dialog){
			dialog.addEventListenerOnce("close", function(e) {
				if( LI_autoClose == true ){
					app.close(true);
				}			
			});
		});
		app.lookup("LI_grpXkeylicensKey").redraw();
//		app.lookup("LI_grpXkeylicInfo").redraw();
	} else {
		if (dataManager.getXkeyLicStatus() > 0){
			if (resultCode == ErrorLicenseInvalidMac || resultCode == ErrorLicenseNotAlpetaLicense){
				dataManager.setXkeyLicStatus(XkeyLicStatusError);
			}
		}
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_postXkeyLicenseActivateSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_postXkeyLicenseActivateSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onLi_shlXkeyQRCodeLoad(/* cpr.events.CUIEvent */ e){
	var content = e.content;
	content.innerHTML = "<div id=\"xkeyQR\"></div>";
}
