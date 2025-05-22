/************************************************
 * VisitingManagement.js
 * Created at 2021. 1. 25. ���� 4:07:16.
 *
 * @author A
 ************************************************/
var asml_popupflag;

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e) {
	asml_popupflag = false;
	
	var hostAppIns = app.getHostAppInstance();
	if(hostAppIns){		
		var subMenuID = app.getHostProperty("initValue");		
		if(subMenuID){
			changeMenu(subMenuID);
		}
	}
	
	// 전체 메뉴 리스트 정의
	// 주의!!: 상위 메뉴는 하위 메뉴보다 위에 정의되어야함 	
	var allMmenu = [["출입현황 등록", "30100", "root"],
					["위병소 인원출입등록", "30101", "30100"],
					["위병소 차량출입등록", "30102", "30100"],
					["출입현황", "30200", "root"],
					["인원출입현황", "30201", "30200"],
					["차량출입현황", "30202", "30200"],
					["위병소출입현황", "30203", "30200"],
					["사용자출입기록조회", "30204", "30200"],
					["차량출입기록조회", "30205", "30200"],
					["출입통계", "30300", "root"],
					["출입통계", "30301", "30300"]];
	
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
	app.lookup("tre1").redraw();					
}

function changeMenu(menuID){
	var hostAppIns = app.getHostAppInstance();
	var bResult = hostAppIns.callAppMethod("menuPrivilegeCheck", menuID); 
	console.log(bResult);
	if (bResult == "false") {
		if (!asml_popupflag) {
			dialogAlertAMHQ(app, "경고", "접근권한이 없습니다.");
			asml_popupflag =true;	
		} else {
			asml_popupflag = false;	
		}
		return;
	}
	var embView = app.lookup("AMASL_eaMainView");
	var srcPath = "";
	
	switch(menuID){
		case "30101":	srcPath = "app/custom/army_hq/accessStatus/GuardStationPersonRegistration";	break;
		case "30102":	srcPath = "app/custom/army_hq/accessStatus/GuardStationCarRegistration";	break;
		case "30201":	srcPath = "app/custom/army_hq/accessStatus/AccessStatusPerson";	break;
		case "30202":	srcPath = "app/custom/army_hq/accessStatus/AccessStatusCar2";	break;
		case "30203":	srcPath = "app/custom/army_hq/accessStatus/GuardStationAccessStatus";	break;
		case "30204":	srcPath = "app/custom/army_hq/accessStatus/AuthLogManagement"; break;
		case "30205":	srcPath = "app/custom/army_hq/accessStatus/AuthLogManagementLPR"; break;
		case "30301":	srcPath = "app/custom/army_hq/accessStatus/AccessStatistics";	break;
	}	
	if( srcPath.length > 0 ){cpr.core.App.load(srcPath, function(app){if(app){embView.app = app;}});}
	embView.ready(function(){ embView.setAppProperty("initValue", "someValue"); });

}

/*
 * 트리에서 selection-change 이벤트 발생 시 호출.
 * 선택된 Item 값이 저장된 후에 발생하는 이벤트.
 */
function onTre1SelectionChange(/* cpr.events.CSelectionEvent */ e){
	var tre1 = e.control;
	var menuID = e.newSelection[0].value;	
	changeMenu(menuID);
}


/*
 * 트리에서 item-click 이벤트 발생 시 호출.
 * 아이템 클릭시 발생하는 이벤트.
 */
function onTre1ItemClick(/* cpr.events.CItemEvent */ e){
	/** 
	 * @type cpr.controls.Tree
	 */
	var tre1 = e.control;
	
	var menuTree = app.lookup("tre1");
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
	var bResult = hostAppIns.callAppMethod("menuPrivilegeCheck", tre1.value); 
	if (bResult == "false") {
		if (!asml_popupflag) {
			dialogAlertAMHQ(app, "경고", "접근권한이 없습니다.");
			asml_popupflag =true;	
		} else {
			asml_popupflag = false;	
		}
		return;
	}
}
