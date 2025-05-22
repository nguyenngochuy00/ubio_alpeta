/************************************************
 * installMain.js
 * Created at 2019. 3. 19. 오후 4:30:30.
 *
 * @author gyjeon
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var usint_version;
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad( /* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	var embApp = app.lookup("embApp");
	var beginBtn = app.lookup("begin");

	var appld = "app/main/install/license" + "?" + usint_version;
	cpr.core.App.load(appld, function(loadedApp) {
		if (loadedApp) {
			embApp.app = loadedApp;
			embApp.userAttr("src", "app/main/install/license");
		}
	});

	beginBtn.visible = false;

}

/*
 * "다음" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onNextClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var next = e.control;
	var embApp = app.lookup("embApp");
	var src = embApp.userAttr("src");

	switch (src) {
		case "app/main/install/license":
			//console.log("type : " + app.lookup("licenseMap").getValue("licenseType"));
			embApp.userAttr("src", "app/main/install/config");
			app.lookup("begin").visible = true;
			break;
		case "app/main/install/config":
			embApp.userAttr("src", "app/main/install/setting");
			break;
		case "app/main/install/setting":
			embApp.userAttr("src", "ap p/main/install/download");
			app.lookup("next").visible = false;
			break;
	}

	src = embApp.userAttr("src") + "?" + usint_version;
	cpr.core.App.load(src, function(loadedApp) {
		if (loadedApp) {
			embApp.app = loadedApp;
		}
	});
}

/*
 * "이전" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBeginClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var begin = e.control;
	var embApp = app.lookup("embApp");
	var src = embApp.userAttr("src");

	switch (src) {
		case "app/main/install/download":
			embApp.userAttr("src", "app/main/install/setting");
			app.lookup("next").visible = true;
			break;
		case "app/main/install/setting":
			embApp.userAttr("src", "app/main/install/config");
			break;
		case "app/main/install/config":
			embApp.userAttr("src", "app/main/install/license");
			app.lookup("begin").visible = false;
			break;
	}

	src = embApp.userAttr("src") + "?" + usint_version;
	cpr.core.App.load(src, function(loadedApp) {
		if (loadedApp) {
			embApp.app = loadedApp;
		}
	});
}