/************************************************
 * integratedReportManagement.js
 * Created at 2020. 2. 21. 오전 10:59:08.
 *
 * @author joymrk
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var itgrm_version;
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	itgrm_version = dataManager.getSystemVersion();
	var getGroups = dataManager.getGroup();
	
	var dsGroupList = app.lookup("GroupList");
	dsGroupList.clear();
	getGroups.copyToDataSet(dsGroupList);
	dsGroupList.addRowData({"Name":dataManager.getString("Str_All"),"GroupID":0});
	dsGroupList.commit();
	
	var groupList = app.lookup("ITGRM_treGroup");
	groupList.redraw();
	
	var emb = app.lookup("ITGRM_eaMain");
	var src = "app/main/integratedReporting/authlogReport" + "?" + itgrm_version;
	
	changeButtonStyle(app.lookup("ITGRM_btnAuthLogs"));
	
	var embAppIns = emb.getEmbeddedAppInstance();
	cpr.core.App.load(src, function(loadedApp) { 
		if (embAppIns && embAppIns.hasAppMethod("tabCheck")) { //기존 페이지가 
			embAppIns.callAppMethod("tabCheck");
		}
		emb.app = loadedApp;
	});
}

exports.getSelectedTree = function() {
	var treGroup = app.lookup("ITGRM_treGroup");
	console.log(treGroup.value);
	return treGroup.value;
}	
exports.SelectTree = function(groupid) {
	var treGroup = app.lookup("ITGRM_treGroup");
	treGroup.selectItemByValue(groupid);
}	

exports.getMenuID = function() {
	
	return menu_id; 
}	
/*
 * "인증로그" 버튼(ITGRM_btnAuthLogs)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onITGRM_btnAuthLogsClick(/* cpr.events.CMouseEvent */ e){
	var iTGRM_btnAuthLogs = e.control;
	
	var emb = app.lookup("ITGRM_eaMain");
	var src = "app/main/integratedReporting/authlogReport" + "?" + itgrm_version;
	
	var embAppIns = emb.getEmbeddedAppInstance();
	cpr.core.App.load(src, function(loadedApp) { 
		if (embAppIns && embAppIns.hasAppMethod("tabCheck")) { //기존 페이지가 
			embAppIns.callAppMethod("tabCheck");
		}
		emb.app = loadedApp;
	});
	
	changeButtonStyle(iTGRM_btnAuthLogs);
}


/*
 * "식수" 버튼(ITGRM_btnMeal)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onITGRM_btnMealClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var iTGRM_btnMeal = e.control;
		var emb = app.lookup("ITGRM_eaMain");
	var src = "app/main/integratedReporting/meallogReport" + "?" + itgrm_version;
	
	var embAppIns = emb.getEmbeddedAppInstance();
	cpr.core.App.load(src, function(loadedApp) { 
		if (embAppIns && embAppIns.hasAppMethod("tabCheck")) { //기존 페이지가 
			embAppIns.callAppMethod("tabCheck");
		}
		emb.app = loadedApp;
	});
	
	changeButtonStyle(iTGRM_btnMeal);
}


/*
 * "T&A" 버튼(ITGRM_btnTnas)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onITGRM_btnTnasClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var iTGRM_btnTnas = e.control;
	var emb = app.lookup("ITGRM_eaMain");
	var src = "app/main/integratedReporting/tnaReport" + "?" + itgrm_version;
	
	var embAppIns = emb.getEmbeddedAppInstance();
	cpr.core.App.load(src, function(loadedApp) { 
		if (embAppIns && embAppIns.hasAppMethod("tabCheck")) { //기존 페이지가 
			embAppIns.callAppMethod("tabCheck");
		}
		emb.app = loadedApp;
	});
	
	changeButtonStyle(iTGRM_btnTnas);
}


exports.helpPageRequest = function(requestType) {
	var hostApp = app.getHostAppInstance();
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
	console.log("menu_id: " + ", requestType: " + requestType);
	return;
}

function changeButtonStyle(selectedButton){
	var buttons = app.lookup("btnGroup").getChildren();
	
	for (var i = 0; i < buttons.length; i++) {
			if (selectedButton == buttons[i]) {
				buttons[i].style.css("backgroundColor", "#E3E0DF");
				buttons[i].style.css("border-bottom", "2px black solid");
			} else {
				buttons[i].style.removeStyle("backgroundColor");
				buttons[i].style.removeStyle("border-bottom");
			}
		}
}