/************************************************
 * VisitingManagement.js
 * Created at 2021. 1. 25. ���� 4:07:16.
 *
 * @author A
 ************************************************/
var amsml_popupflag;
var dataManager = cpr.core.Module.require("lib/DataManager");
function onBodyLoad(/* cpr.events.CEvent */ e){
	amsml_popupflag = false;
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
	var allMmenu = [["시스템 권한", "60100", "root"], 
					["권한관리", "60102", "60100"], 
					["시스템 사용자 관리", "60103", "60100"], 
					["승인자 관리", "60104", "60100"], 
					["시스템 설정", "60200", "root"], 
				//	["부서관리", "60201", "60200"], 
					["장소도면관리", "60203", "60200"], 
					// ["직급관리", "60204", "60200"],
					["부대정보관리", "60205", "60200"],
					["출입신청 결재 설정", "60206", "60200"],					 
					//["기본패스워드 설정", "60207", "60200"],
					["접속이력조회", "60300", "root"], 
					["접속이력조회", "60301", "60300"], 
					["로그조회", "60400", "root"], 
					["이벤트로그 조회", "60401", "60400"],
					["공지사항", "60500", "root"]];

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
	menueList.addRowData({"label": "알페타 UI 실행","value":"60600","parent":"root"});					
	var accountInfo = dataManager.getAccountInfo();
	var privilege = Number(accountInfo.getValue("Privilege"));
	if (privilege == 1) {	// 관리자일 경우
		menueList.addRowData({"label": "부서관리","value":"60201","parent":"60200"});
		if (dataManager.getAccountID() == 1000000000000000000) { // 마스터만 접근 가능
			//menueList.addRowData({"label": "알페타 UI 실행","value":"60600","parent":"root"});
			app.lookup("LOFile_btnHidden").visible = true;
		} 		
//		else if (isSuperGroupAdmin()){ // 최상위 그룹 관리자만 접근 가능
//			menueList.addRowData({"label": "부서관리","value":"60201","parent":"60200"});
//		}
		menueList.addRowData({"label": "미접속 사용자 조회","value":"60700","parent":"root"}); // Todo: 기능 완성후 업데이트
		menueList.addRowData({"label": "관리자 IP 관리","value":"60800","parent":"root"}); // Todo: 기능 완성후 업데이트
		menueList.addRowData({"label": "기본패스워드 설정","value":"60207","parent":"60200"}); // Todo: 기능 완성후 업데이트
	}
	menueList.setSort("value");
	app.lookup("AMSML_treSystemManagementMenu").redraw();
}

// 시스템관리 메뉴 클릭
function onAMSML_treSystemManagementMenuSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Tree
	 */
	var aMSML_treSystemManagementMenu = e.control;
	
	var menuID = aMSML_treSystemManagementMenu.getSelectionFirst().value;
	changeMenu(menuID);
}

function changeMenu(menuID, param){
	var hostAppIns = app.getHostAppInstance();
	var bResult = hostAppIns.callAppMethod("menuPrivilegeCheck", menuID); 
	if (bResult == "false") {
		if (!amsml_popupflag) {
			dialogAlertAMHQ(app, "경고", "접근권한이 없습니다.");
			amsml_popupflag =true;	
		} else {
			amsml_popupflag = false;	
		}
		
		return;
	}
	
	
	var embView = app.lookup("AMSML_eaMainView");
	
	if(embView == null){
		return;
	}
	
	var srcPath = "";
	switch(menuID){
		// 시스템 권한
		case "60101":	srcPath = "";												break; //메뉴관리	
		case "60102":	srcPath = "app/custom/rokmch/system/privilegeManagement";	break; //권한관리	
		case "60103":	srcPath = "app/custom/rokmch/system/systemUserManagement";	break; //시스템 사용자 관리		
		case "60104":	srcPath = "app/custom/rokmch/system/approverManagement";	break; //승인자 관리
			
		// 시스템 설정
		case "60201":	srcPath = "app/custom/rokmch/system/GroupManagement";		break;//부서관리			
		case "60202":	srcPath = "";												break; //코드관리			
		case "60203":	srcPath = "app/custom/rokmch/system/locationAreaShape";	break; //장소도면관리					
		// case "60204":	srcPath = "app/main/position/positionManagement";			break; //직급관리
		case "60205":	srcPath = "app/custom/rokmch/system/siteNameManagement";	break; //부대명 관리
		case "60206":	srcPath = "app/custom/rokmch/system/AccessApprovalSetting";	break; //출입신청 결제 설정
		case "60207": srcPath = "app/custom/rokmch/system/setUserPassword";	break; //관리자 기본 패스워드 설정
		// 접속이력 조회
		case "60301":	srcPath = "app/custom/rokmch/system/AuditLogManagement";			break; //접속이력조회			
			
		// 로그 조회
		case "60401":	srcPath = "app/custom/rokmch/system/eventLogManagement";			break; //이벤트로그조회
			
		// 공지사항
		case "60500":	srcPath = "app/custom/rokmch/notice/noticeManagement";		break;	
		case "60501":	srcPath = "app/custom/rokmch/notice/noticeRegist";		break;		
		case "60502":	srcPath = "app/custom/rokmch/notice/noticeView";		break;
		case "60503":	srcPath = "app/custom/rokmch/notice/noticeModify";		break;
		
		case "60600":	hostAppIns.callAppMethod("closeUI"); return;
		case "60700":	srcPath = "app/custom/rokmch/system/adminLoginStatusManagement";		break;
		case "60800":	srcPath = "app/custom/rokmch/system/adminUserIpManagement";		break;
		default:		return;
	}	
	if( srcPath.length > 0 ){cpr.core.App.load( srcPath , function(app){
		if(app){
			embView.app = app;
			if(param){
				embView.ready(function(){ 
					embView.setAppProperty("initValue", param); 
				});			
			}
		}
	});}
	
}



/*
 * 트리에서 item-click 이벤트 발생 시 호출.
 * 아이템 클릭시 발생하는 이벤트.
 */
function onAMSML_treSystemManagementMenuItemClick(/* cpr.events.CItemEvent */ e){
	/** 
	 * @type cpr.controls.Tree
	 */
	var aMSML_treSystemManagementMenu = e.control;
	var hostAppIns = app.getHostAppInstance();
	
	var menuTree = app.lookup("AMSML_treSystemManagementMenu");
	var selectMenu = menuTree.getSelectionFirst();
	if (menuTree.hasChild(selectMenu)) {
		if (menuTree.isExpanded(selectMenu)) {
			menuTree.collapseItem(selectMenu);
		} else {
			menuTree.collapseAllItems();
			menuTree.expandItem(selectMenu);
		}
	}
		
	var bResult = hostAppIns.callAppMethod("menuPrivilegeCheck", aMSML_treSystemManagementMenu.value); 
	if (bResult == "false") {
		console.log(aMSML_treSystemManagementMenu.value);
		if (!amsml_popupflag) {
			dialogAlertAMHQ(app, "경고", "접근권한이 없습니다.");
			amsml_popupflag =true;	
		} else {
			amsml_popupflag = false;	
		}
	}
}

exports.changeMenu = function(menuID, param){
	changeMenu(menuID, param)
}

function onLOFile_btnHiddenClick(/* cpr.events.CMouseEvent */ e){
	var embView = app.lookup("AMSML_eaMainView");
	if(embView == null){
		return;
	}
	var srcPath = "app/custom/rokmch/system/ServerLogDownload";
	if( srcPath.length > 0 ){cpr.core.App.load( srcPath , function(app){
		if(app){
			embView.app = app;
			embView.ready(function(){ 
				embView.setAppProperty("initValue"); 
			});			
		}
	});}
}
