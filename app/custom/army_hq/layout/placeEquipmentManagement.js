/************************************************
 * VisitingManagement.js
 * Created at 2021. 1. 25. ���� 4:07:16.
 *
 * @author A
 ************************************************/
var ampeml_popupflag;


function onBodyLoad(/* cpr.events.CEvent */ e){
	ampeml_popupflag = false;
	var dataManager = getDataManager();
	var hostAppIns = app.getHostAppInstance();
	if(hostAppIns){		
		var subMenuID = app.getHostProperty("initValue");		
		if(subMenuID){
			changeMenu(subMenuID);
		}
	}
	
	// 전체 메뉴 리스트 정의
	// 주의!!: 상위 메뉴는 하위 메뉴보다 위에 정의되어야함 	
	var allMmenu = [["장소관리", "40100", "root"], 
					["장소관리", "40101", "40100"], 
					["출입권한관리", "40102", "40100"], 
					["출입구역관리", "40103", "40100"], 
					["출입그룹관리", "40104", "40100"], 
					["장비관리", "40200", "root"], 
					["장비관리", "40201", "40200"], 
					["장비사용자관리", "40202", "40200"], 
					["LPR 관리", "40203", "40200"],
					["태블릿 관리", "40204", "40200"],
					["군사통제구역관리", "40300", "root"],
					["군사통제구역설정", "40301", "40300"],
					["군사통제구역현황", "40302", "40300"]];

	// 권한 검사 메뉴 추가
	var menueList = app.lookup("MenuList");
	var userPriv = dataManager.getAccountInfo().getValue("Privilege");
	for( var i=0; i < allMmenu.length ; i++) {
		if (hostAppIns.callAppMethod("menuPrivilegeCheck", allMmenu[i][1]) == "true") {
			if (allMmenu[i][2] != "root") {		// 상위 메뉴에 권한이 없으면 메뉴추가x
				if ( !menueList.findFirstRow("value == "+ allMmenu[i][2]) ) {
					continue;
				}	
			}
//			if (!isSuperGroupAdmin()){
//				// Master, 상위부서 관리자만 장소관리, 출입권한관리, 출입구역관리 메뉴를 사용할 수 있다. - pse
//				if (i == 1 || i == 2 || i == 3){
//					continue;
//				}	
//			}
			// 24년도부터는 Master와 관리자만 장소관리, 출입권한관리, 출입구역관리 메뉴 사용 가능
			if(userPriv != PrivilegeAdmin){
				if (i == 1 || i == 2 || i == 3){
					continue;
				}
			}
			
			menueList.addRowData({"label":allMmenu[i][0],"value":allMmenu[i][1],"parent":allMmenu[i][2]});		
		}
	}
	app.lookup("AMPEML_trePlaceEquipmentMenu").redraw(); 						
}

function changeMenu(menuID){
	var hostAppIns = app.getHostAppInstance();
	var bResult = hostAppIns.callAppMethod("menuPrivilegeCheck", menuID); 
	if (bResult == "false") {
		if (!ampeml_popupflag) {
			dialogAlertAMHQ(app, "경고", "접근권한이 없습니다.");
			ampeml_popupflag =true;	
		} else {
			ampeml_popupflag = false;	
		}
		return;
	}
	var embView = app.lookup("AMPEML_eaMainView");
	
	if(embView == null){
		return;
	}
	
	var srcPath = "";
	switch(menuID){
		// 장소관리
		case "40101":	//장소관리
			srcPath = "app/custom/army_hq/accessStatus/AccessStatusAreaSetting";	break;
		case "40102":	//출입권한관리
			srcPath = "app/custom/army_hq/areaNDeviceManagement/AccessGroupUserManagement";	break;
		case "40103":	//출입구역관리
			srcPath = "app/custom/army_hq/areaNDeviceManagement/accessAreaManagement";	break;
		case "40104":	//출입그룹관리
			srcPath = "app/custom/army_hq/areaNDeviceManagement/accessGroupManagement";	break;						
		//장비관리
		case "40201":	//장비관리
			srcPath = "app/custom/army_hq/areaNDeviceManagement/terminalManagement";	break;
		case "40202":	//장바사용자관리
			srcPath = "app/custom/army_hq/areaNDeviceManagement/terminalUser";		break;
		case "40203":	//LPR 관리
			srcPath = "app/custom/army_hq/lpr/lprManagement";	break;
		case "40204":	//태블릿 관리
			srcPath = "app/custom/army_hq/tablet/tabletManagement";	break;	
		// 군사통제구역관리(안티패스백)
		case "40301" : // 안티패스백 관리
		 	srcPath = "app/custom/army_hq/antipassbackAreaManagement/antipassbackManagement";	break;
		case "40302" : // 안티패스백 재실현황
			srcPath = "app/custom/army_hq/antipassbackAreaManagement/antipassbackAreaUseInfo";	break;
		default:
			return;
	}	
	if( srcPath.length > 0 ){cpr.core.App.load(srcPath, function(app){if(app){embView.app = app;}});}
	//embView.ready(function(){ embView.setAppProperty("initValue", "someValue"); });
	
}
// 장소/장비관리 메뉴 클릭
function onAMPEML_trePlaceEquipmentMenuSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Tree
	 */
	var aMPEML_trePlaceEquipmentMenu = e.control;
	
	var menuID = aMPEML_trePlaceEquipmentMenu.getSelectionFirst().value;
	changeMenu(menuID);
	
}


/*
 * 트리에서 item-click 이벤트 발생 시 호출.
 * 아이템 클릭시 발생하는 이벤트.
 */
function onAMPEML_trePlaceEquipmentMenuItemClick(/* cpr.events.CItemEvent */ e){
	/** 
	 * @type cpr.controls.Tree
	 */
	var aMPEML_trePlaceEquipmentMenu = e.control;
	var hostAppIns = app.getHostAppInstance();
	
	var menuTree = app.lookup("AMPEML_trePlaceEquipmentMenu");
	var selectMenu = menuTree.getSelectionFirst();
	if (menuTree.hasChild(selectMenu)) {
		if (menuTree.isExpanded(selectMenu)) {
			menuTree.collapseItem(selectMenu);
		} else {
			menuTree.collapseAllItems();
			menuTree.expandItem(selectMenu);
		}
	}
		
	var bResult = hostAppIns.callAppMethod("menuPrivilegeCheck", aMPEML_trePlaceEquipmentMenu.value); 
	if (bResult == "false") {
		if (!ampeml_popupflag) {
			dialogAlertAMHQ(app, "경고", "접근권한이 없습니다.");
			ampeml_popupflag =true;	
		} else {
			ampeml_popupflag = false;	
		}
		
		return;
	}
}

