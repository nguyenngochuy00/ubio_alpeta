/************************************************
 * VisitingManagement.js
 * Created at 2021. 1. 25. ���� 4:07:16.
 *
 * @author A
 ************************************************/

var AMML_monitoring_id;
var amml_popupflag;


function onBodyLoad(/* cpr.events.CEvent */ e){
	amml_popupflag = false;	
	var hostAppIns = app.getHostAppInstance();
	if(hostAppIns){		
		var subMenuID = app.getHostProperty("initValue");		
		if(subMenuID){
			changeMenu(subMenuID);
		}
	}
	// 전체 메뉴 리스트 정의
	// 주의!!: 상위 메뉴는 하위 메뉴보다 위에 정의되어야함 	
	var allMmenu = [["모니터링 및 출입문 제어", "50100", "root"], 
					["모니터링 및 출입문 제어", "50101", "50100"], 
					["중앙관제", "50200", "root"], 
					["중앙관제", "50201", "50200"]];

	// 권한 검사 메뉴 추가
	var menueList = app.lookup("MenuList");
	for( var i=0; i < allMmenu.length ; i++) {
		if (hostAppIns.callAppMethod("menuPrivilegeCheck", allMmenu[i][1]) == "true") {
			if (allMmenu[i][2] != "root") {		// 상위 메뉴에 권한이 없으면 메뉴추가x
				if ( !menueList.findFirstRow("value == "+ allMmenu[i][2]) ) {
					continue;
				}	
			}
			menueList.addRowData({"label":allMmenu[i][0],"value":allMmenu[i][1],"parent":allMmenu[i][2]});
		}
	}
	app.lookup("AMML_treMonitoringMenu").redraw(); 						
	
}

function changeMenu(menuID){
	var hostAppIns = app.getHostAppInstance();
	var bResult = hostAppIns.callAppMethod("menuPrivilegeCheck", menuID); 
	if (bResult == "false") {
		if (!amml_popupflag) {
			dialogAlertAMHQ(app, "경고", "접근권한이 없습니다.");
			amml_popupflag =true;	
		} else {
			amml_popupflag = false;	
		}
		return;
	}
	var embView = app.lookup("AMML_eaMainView");
	
	if(embView == null){
		return;
	}
	AMML_monitoring_id = 0;
	var srcPath = "";
	switch(menuID){
		//사무실 출입문 제어
		case "50101":	srcPath = "app/custom/rokmch/monitoring/monitoringManagement";	AMML_monitoring_id = 50101; break; //사무실 출입문 제어
		//중앙관제
		case "50201":	srcPath = "app/custom/rokmch/monitoring/locationShape"; AMML_monitoring_id = 50201;	break;
		default:
			return;
	}	
	if( srcPath.length > 0 ){cpr.core.App.load(srcPath, function(app){if(app){embView.app = app;}});}
}
// 모니터링 메뉴 클릭
function onAMML_treMonitoringMenuSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Tree
	 */
	var aMML_treMonitoringMenu = e.control;
	var menuID = e.newSelection[0].value;	
	changeMenu(menuID);
}

exports.onLocationMonitoringCalled = function(id){
	app.lookup("AMML_treMonitoringMenu").clearSelection(false);
	
	var embView = app.lookup("AMML_eaMainView");
	cpr.core.App.load("app/custom/rokmch/monitoring/locationMonitoring", function(app){
		if(app){			
			AMML_monitoring_id = 950201;
			embView.app = app;
			embView.initValue = id;
		}
	});
}

exports.addAuthLog = function(authLog){
	if (AMML_monitoring_id == 50101 || AMML_monitoring_id == 950201){
		var embView = app.lookup("AMML_eaMainView");
		embView.callAppMethod("addAuthLog", authLog)		
	}
}

exports.addEventLog = function(msgBody){
	if (AMML_monitoring_id == 50101 || AMML_monitoring_id == 950201){
		var embView = app.lookup("AMML_eaMainView");
		embView.callAppMethod("addEventLog", msgBody)		
	}
}

exports.updateTerminalStatus = function(msgBody){
	if (AMML_monitoring_id == 50101 || AMML_monitoring_id == 950201){
		var embView = app.lookup("AMML_eaMainView");
		embView.callAppMethod("updateTerminalStatus", msgBody);
				
	}
}


/*
 * 트리에서 item-click 이벤트 발생 시 호출.
 * 아이템 클릭시 발생하는 이벤트.
 */
function onAMML_treMonitoringMenuItemClick(/* cpr.events.CItemEvent */ e){
	/** 
	 * @type cpr.controls.Tree
	 */
	var aMML_treMonitoringMenu = e.control;
	
	var menuTree = app.lookup("AMML_treMonitoringMenu");
	var selectMenu = menuTree.getSelectionFirst();
	if (menuTree.hasChild(selectMenu)) {
		if (menuTree.isExpanded(selectMenu)) {
			menuTree.collapseItem(selectMenu);
		} else {
			menuTree.collapseAllItems();
			menuTree.expandItem(selectMenu);
		}
	}
	
	var hostAppIns = app.getHostAppInstance();
	var bResult = hostAppIns.callAppMethod("menuPrivilegeCheck", aMML_treMonitoringMenu.value); 
	if (bResult == "false") {
		if (!amml_popupflag) {
			dialogAlertAMHQ(app, "경고", "접근권한이 없습니다.");
			amml_popupflag =true;	
		} else {
			amml_popupflag = false;	
		}
		return;
	}
}



