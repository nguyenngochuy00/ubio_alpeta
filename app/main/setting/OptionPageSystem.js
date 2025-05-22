/************************************************
 * OptionSystem.js
 * Created at 2019. 4. 29. 오후 2:30:16.
 *
 * @author wonki
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var util = cpr.core.Module.require("lib/util");
var WedgetModule = cpr.core.Module.require("udc/dashboard/Wedget");
var oem_version;
var comLib;

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	var hostApp = app.getHostAppInstance();
	var dmSystem = app.lookup("OptionSystem");
	
	hostApp.callAppMethod("getSystemData").copyToDataMap(dmSystem);
	dataManager = getDataManager();
	var version = dataManager.getSystemVersion();
	oem_version = dataManager.getOemVersion();
	
	app.lookup("SESBA_opbSystemVersion").value = version;
	initData();
	
	//분을 시간으로 분리
	var minTm = dmSystem.getValue("WebClientAccessTime");
	var remoteAccessTime = util.ConvHHMMfromMinute(minTm, 0);
	var strArray= remoteAccessTime.split(':');
	app.lookup("SELBA_nbeHour").value = parseInt(strArray[0], 10); 
	app.lookup("SELBA_nbeMin").value = parseInt(strArray[1], 10);

	var licenseLevel = dataManager.getSystemInfo().getValue("LicenseLevel");
	var ops_snippet = app.lookup("OPS_snippet");
	var opsOptVmonitor = app.lookup("OPS_opt_vmonitor");
	console.log(licenseLevel);
	if (licenseLevel >= LicenseSTANDARD) {
		opsOptVmonitor.visible = true;
		ops_snippet.visible = true;
		ops_snippet.value = "<a href=\"/setup/VideoIntercom.zip\" target=\"_blank\">" + "VideoIntercom.zip" + "</a>";
		app.lookup("SESYS_grpMain").redraw();	
	} else {
		opsOptVmonitor.visible = false;
		ops_snippet.visible = false;
	}
	
	app.lookup('SESYS_grpMain').getLayout().setRowVisible(14, false);
	if (oem_version == OEM_GS_BASIC){
		app.lookup('SESYS_grpMain').getLayout().setRowVisible(5, false);
		app.lookup('SESYS_grpMain').getLayout().setRowVisible(6, false);
		app.lookup('SESYS_grpMain').getLayout().setRowVisible(7, false);
		app.lookup('SESYS_grpMain').getLayout().setRowVisible(14, true);
		app.lookup('SESYS_grpMain').getLayout().setRowVisible(21, false);		
	} else if (oem_version == OEM_HYUNDAI_HI){
		app.lookup("OPSET_ipbMasterPwd").inputFilter = /[0-9a-zA-Z\~\!\?\@\#\$\%\^\&\*\-\_]/;
	}
}

exports.requestSetData = function() {
	//설정 시간 값 계산
	var optionSystem = app.lookup("OptionSystem");
    var hour = app.lookup("SELBA_nbeHour").value;
	var min = app.lookup("SELBA_nbeMin").value;
	if (hour.length < 2 && hour < 10) { // 10시 이하는 앞에 0 붙여 준다.
		hour = '0' + hour;
	}
	if (min.length < 2 && min < 10) { // 10시 이하는 앞에 0 붙여 준다.
		min = '0' + min;
	}
	
	var remoteAccessTime = hour +':'+ min; // 시:분
	var mintm = util.ConvHHMMtoMinute(remoteAccessTime); //분단위 변환
	optionSystem.setValue("WebClientAccessTime", mintm);
	
	console.log("mintm :" + mintm);
	
	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("setSystemData", app.lookup("OptionSystem"));
}

function initData() {
	var SELBA_brandType = dataManager.getSystemBrandType();
	var idlen = app.lookup("SELBA_cmbUserIDLength");
	var guestRangeMin = app.lookup("SELBA_ipbGuestIDRangeMin");
	var guestRangeMax = app.lookup("SELBA_ipbGuestIDRangeMax");
	var Polltime = app.lookup("SEBA_ipbPolltime");
	// BRAND_VRIDI : 1~8 , BRAND_NITGEN : 1~18
	if (SELBA_brandType == BRAND_VRIDI) {
		for(var i=0; i< 8;i++) {
			var tmp = i+1; 
			idlen.addItem(new cpr.controls.Item(String(tmp), tmp));	
		}

		if (oem_version == OEM_HE_CHUNGJU_FACTORY){ // 현대 무벡스 동기화 사용자 아이디 9자리
			idlen.addItem(new cpr.controls.Item("9", 9));
			guestRangeMin.maxLength = 9;
			guestRangeMax.maxLength = 9;
		} else {
			guestRangeMin.maxLength = 8;
			guestRangeMax.maxLength = 8;
		}
		
		guestRangeMin.maxLength = 8;
		guestRangeMax.maxLength = 8;
	} else if (SELBA_brandType == BRAND_NITGEN) {
		for(var i=0; i < 18;i++) {
			var tmp = i+1; 
			idlen.addItem(new cpr.controls.Item(String(tmp), tmp));	
		}
		guestRangeMin.maxLength = 18;
		guestRangeMax.maxLength = 18;
	}
	
	guestRangeMin.inputFilter = /^[0-9]*$/;
	guestRangeMax.inputFilter = /^[0-9]*$/; 	
	Polltime.inputFilter = /^[0-9]*$/;
	
	var optionSystem = app.lookup("OptionSystem");
	var time = optionSystem.getValue("Polltime");
	if(time == 0) {
		Polltime.value = 10;
	}
	
	
}

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onSELBA_cmbUserIDLengthSelectionChange(/* cpr.events.CSelectionEvent */ e){
	console.log(app.lookup("SELBA_cmbUserIDLength").value);
}


/*
 * 넘버 에디터에서 value-change 이벤트 발생 시 호출.
 * NumberEditor의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onSELBA_nbeHourValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.NumberEditor
	 */
	var sELBA_nbeHour = e.control;
	if (sELBA_nbeHour.value < 10) {
		sELBA_nbeHour.displayExp = "'0' + value"; // 시
	} else if (sELBA_nbeHour.value >= 10 ) {
		sELBA_nbeHour.displayExp = "";
	} 
	
	if (sELBA_nbeHour.value == 24) { //24시는 분단위 00 고정이다.
		app.lookup("SELBA_nbeMin").value = '0';
	}
}



/*
 * 넘버 에디터에서 value-change 이벤트 발생 시 호출.
 * NumberEditor의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onSELBA_nbeMinValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.NumberEditor
	 */
	var sELBA_nbeMin = e.control;
	console.log("sELBA_nbeMin : " + sELBA_nbeMin.value);
	if (sELBA_nbeMin.value < 10 ) {
		sELBA_nbeMin.displayExp = "'0' + value";	// 분
	} else if (sELBA_nbeMin.value >= 10 ) {
		sELBA_nbeMin.displayExp = "";
	} 

	if (app.lookup("SELBA_nbeHour").value == 24) { //24시는 분단위 00 고정이다.
		app.lookup("SELBA_nbeMin").value = '0';
		return;
	}
}

/*
 * "Button" 버튼(SELBA_dbBackup)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onSELBA_dbBackupClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var sELBA_dbBackup = e.control;
    var sms_dbBackup = app.lookup("sms_dbBackup");
	comLib.showLoadMask("", dataManager.getString("Str_DBBackup"), "", 0);
	sms_dbBackup.send();
}

function onSms_dbBackupSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){		
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_DBBackupSuccess"));
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}		
}

function onSELBA_dbBackupMousemove(/* cpr.events.CMouseEvent */ e){
	var sELBA_dbBackup = e.control;
	sELBA_dbBackup.style.css({"background-color": "#b2b2b2", "background-image": ""});
}

function onSELBA_dbBackupMouseleave(/* cpr.events.CMouseEvent */ e){
	var sELBA_dbBackup = e.control;
	sELBA_dbBackup.style.css({"background-color": "white", "background-image": "linear-gradient(#FCFEFF)"});
}
