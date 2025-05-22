/************************************************
 * license.js
 * Created at 2019. 3. 19. 오후 4:33:13.
 *
 * @author gyjeon
 ************************************************/
 var dataManager = cpr.core.Module.require("lib/DataManager");
 var usint_version;
/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onLite_licenseClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var lite_license = e.control;
	var pro_license = app.lookup("pro_license");
	var embApp = app.lookup("embApp");
	var licenseMap = app.lookup("licenseMap");
	
	licenseMap.setValue("licenseType", "lite");
	
	lite_license.style.css("border","2px solid blue");
	pro_license.style.css("border", "1px solid black");
	var appld = "app/main/install/popup/lite-license" + "?" + usint_version;
	cpr.core.App.load(appld, function(loadedApp){
		if (loadedApp){
			embApp.app = loadedApp;
		}
	});
}


/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onPro_licenseClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var pro_license = e.control;
	var lite_license = app.lookup("lite_license");
	var embApp = app.lookup("embApp");
	var licenseMap = app.lookup("licenseMap");
	var hostAppIns = app.getHostAppInstance();
	
	pro_license.style.css("border","2px solid blue");
	lite_license.style.css("border", "1px solid black");
	
	if (licenseMap.getValue("file") != "") {
		embApp.setAppProperty("fileName", licenseMap.getValue("file"));
	}
	var appld = "app/main/install/popup/pro-license" + "?" + usint_version;
	cpr.core.App.load(appld, function(loadedApp){
		if (loadedApp){
			embApp.app = loadedApp;
		}
	});

	//var Licensefile = embApp.getAppProperty("fileName");
}


/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	//var hostAppIns = app.getHostAppInstance();
	var hostAppIns = app.getRootAppInstance();
	var srcLicenseMap = hostAppIns.callAppMethod("getLicenseMap");
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
}

