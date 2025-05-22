/************************************************
 * GroupManagement.js
 * Created at 2018. 12. 6. 오후 1:34:48.
 *
 * @author fois
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();

	var initValue = app.getHost().initValue;

	var udcUserTerminal = app.lookup("GRMAG_udcGridUserTerminal");
	udcUserTerminal.initControl(true,true,-1,-1);
	udcUserTerminal.deleteUserColumn([14,13,12,11,10,9,8,7,6,5,4]);
	udcUserTerminal.deleteTerminalColumn([13,12,11,10,9,8,7,6,5,4,3]);
	udcUserTerminal.setPageRowCount(100,100);
	udcUserTerminal.setGroupList(dataManager.getGroup());
	udcUserTerminal.setSelectedGroup(0);
	//udcUserTerminal.setContextmenu();
	var oemVersion = dataManager.getOemVersion();
	if (dataManager.getOemVersion() == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH) {
		udcUserTerminal.visibleGroupImport(true);
	} else if (oemVersion == OEM_ITONE_TRDATA || oemVersion == OEM_ITONE_POSCO_DX) {
		
		udcUserTerminal.deleteUserColumn([1]);
		udcUserTerminal.changeColumnNameGroupToPartner();
	}
}


/*
 * 사용자 정의 컨트롤에서 onHelpImageClick 이벤트 발생 시 호출.
 */
function onGRMAG_udcGridUserTerminalOnHelpImageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}
