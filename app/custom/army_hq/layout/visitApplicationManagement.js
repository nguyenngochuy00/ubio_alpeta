/************************************************
 * VisitingManagement.js
 * Created at 2021. 1. 25. ���� 4:07:16.
 *
 * @author A
 ************************************************/
var amvml_popupflag;
var dataManager = cpr.core.Module.require("lib/DataManager");
function onBodyLoad(/* cpr.events.CEvent */ e){
	amvml_popupflag = false;
	
	dataManager = getDataManager();
	var hostAppIns = app.getHostAppInstance();
	if(hostAppIns){		
		var subMenuID = app.getHostProperty("initValue");		
		if(subMenuID){
			changeMenu(subMenuID);
		}
	}
	
	// 전체 메뉴 리스트 정의
	// 주의!!: 상위 메뉴는 하위 메뉴보다 위에 정의되어야함 	
	var allMmenu = [["방문신청", "10000", "root"],
					["사전방문신청", "10101", "10000"],
					["일괄방문신청", "10102", "10000"],
					["현장방문신청", "10103", "10000"],
					["방문신청 조회/승인", "10200", "root"],
					["방문신청 전체조회", "10201", "10200"],
					["방문신청 조회/승인", "10202", "10200"],
					["방문증 교부/회수", "10300", "root"],
					["방문증 교부", "10301", "10300"],
					["방문증 회수", "10302", "10300"],
					["방문증 사고처리", "10303", "10300"],
					["방문증 관리", "10400", "root"],
					["방문증 발급", "10401", "10400"],
					["방문증 발급현황/관리", "10402", "10400"],
					["방문증인쇄 환경설정", "10404", "10400"],
					["방문증 상세현황", "10500", "root"],
					["방문증 교부현황", "10501", "10500"],
					["공무원증 교부현황", "10502", "10500"],
					["방문증 전체현황", "10503", "10500"],
					["문서고 출입관리", "10600", "root"],
					["출입자 일괄등록", "10601", "10600"],
					["출입자 조회/수정", "10602", "10600"],
					["출입권한등록", "10603", "10600"],
					["출입권한해제", "10604", "10600"],
					["입실자현황", "10605", "10600"]];
	
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
	var accountInfo = dataManager.getAccountInfo();
	var privilege = Number(accountInfo.getValue("Privilege"));
	if (privilege == 1) {	// 관리자일 경우
		menueList.addRowData({"label": "방문증 이력조회","value":"10504","parent":"10500"}); // Todo: 기능 완성후 업데이트
	}
	app.lookup("AMVML_treVisitManagementMenu").redraw(); 					
}

function changeMenu(menuID){
	var hostAppIns = app.getHostAppInstance();
	var bResult = hostAppIns.callAppMethod("menuPrivilegeCheck", menuID); 
	console.log(bResult);
	if (bResult == "false") {
		if (!amvml_popupflag) {
			dialogAlertAMHQ(app, "경고", "접근권한이 없습니다.");
			amvml_popupflag =true;	
		} else {
			amvml_popupflag = false;	
		}
		
		return;
	}
	var embView = app.lookup("AMVML_eaMainView");
	var srcPath = "";
	switch(menuID){
		// 방문신청
		case "10101":	srcPath = "app/custom/army_hq/visitApplication/VisitApplicationPreviousness";	break;
		case "10102":	srcPath = "app/custom/army_hq/visitApplication/VisitApplicationBatch";	break;
		case "10103":	srcPath = "app/custom/army_hq/visitApplication/VisitApplicationField";	break;

		// 방문신청 조회/승인
		case "10201":	srcPath = "app/custom/army_hq/visitApplication/VisitApplicationSearch";	break;
		case "10202":	srcPath = "app/custom/army_hq/visitApplication/VisitApplicationSearchAndApproval";	break;
		
		// 방문증 교부/회수
		case "10301":	srcPath = "app/custom/army_hq/visitCard/visitCardIssuance";	break; // 방문증 교부
		case "10302":	srcPath = "app/custom/army_hq/visitCard/visitCardRetrieve";	break; // 방문증 회수
		case "10303":	srcPath = "app/custom/army_hq/visitCard/visitCardIncidentHandling";	break; // 방문증 사고처리
			
		// 방문증 관리
		case "10401":	srcPath = "app/custom/army_hq/visitCard/visitCardIssue";	break; // 방문증 발급	
		case "10402":	srcPath = "app/custom/army_hq/visitCard/visitCardIssueStatus";	break; // 방문증 발급현황
		case "10404":	srcPath = "app/custom/army_hq/visitCard/visitCardPrintSetting";	break; // 방문증인쇄 환경설정
	
		// 방문증 상세현황
		case "10501":	srcPath = "app/custom/army_hq/visitCard/visitCardIssuanceStatus";	break; // 방문증 교부 현황
		case "10502":	srcPath = "app/custom/army_hq/visitCard/visitCivilServiceCardRegistStatus";	break; // 방문증 공무원증 등록 현황
		case "10503":	srcPath = "app/custom/army_hq/visitCard/visitCardAllStatus";	break; // 방문증 전체현황
		case "10504":	srcPath = "app/custom/army_hq/visitCard/visitCardIssuanceLogs";	break; // 방문증 이력조회
		
		case "10601":	srcPath = "app/custom/army_hq/documentArchive/accessBatchRegist";	break; // 출입자 일괄등록
		case "10602":	srcPath = "app/custom/army_hq/documentArchive/accessorSearhNModify";	break; // 출입자 조회/수정
		case "10603":	srcPath = "app/custom/army_hq/documentArchive/accessPrivilegeRegist";	break; // 출입권한 등록
		case "10604":	srcPath = "app/custom/army_hq/documentArchive/accessPrivilegeRelease";	break; // 출입권한 해제
		case "10605":	srcPath = "app/custom/army_hq/documentArchive/inUserStatus";	break; // 입실자 현황
		
		
	}	
	if( srcPath.length > 0 ){cpr.core.App.load(srcPath, function(app){if(app){embView.app = app;}});}
}

// 방문신청관리 메뉴 클릭.
function onAMVML_treVisitManagementMenuSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.Tree	 */
	var aMVMM_treVisitManagementMenu = e.control;
	var menuID = e.newSelection[0].value;
	
	changeMenu(menuID);
}


/*
 * 트리에서 item-click 이벤트 발생 시 호출.
 * 아이템 클릭시 발생하는 이벤트.
 */
function onAMVML_treVisitManagementMenuItemClick(/* cpr.events.CItemEvent */ e){
	/** 
	 * @type cpr.controls.Tree
	 */
	var aMVML_treVisitManagementMenu = e.control;
	
	var menuTree = app.lookup("AMVML_treVisitManagementMenu");
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
	var bResult = hostAppIns.callAppMethod("menuPrivilegeCheck", aMVML_treVisitManagementMenu.value); 
	if (bResult == "false") {
		if (!amvml_popupflag) {
			dialogAlertAMHQ(app, "경고", "접근권한이 없습니다.");	
			amvml_popupflag = true;
		} else {
			amvml_popupflag = false;
		}
		
		return;
	}
}
