/************************************************
 * VisitingManagement.js
 * Created at 2021. 1. 25. ���� 4:07:16.
 *
 * @author A
 ************************************************/
var acaml_popupflag;
var dataManager = cpr.core.Module.require("lib/DataManager");

function onBodyLoad(/* cpr.events.CEvent */ e){
	acaml_popupflag = false;
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
	var allMmenu = [["출입신청", "20100", "root"],
					["출입신청", "20101", "20100"],
					["출입신청 조회/승인", "20200", "root"],
					["출입신청 조회/승인", "20201", "20200"],
					["출입증 발급", "20300", "root"],
					["출입증 발급", "20301", "20300"],
					["임시출입증 발급", "20302", "20300"],
					["출입증 인쇄 환경설정", "20303", "20300"],
	//				["출입증 발급현황", "20304", "20300"],
	//				["임시출입증발급현황", "20305", "20300"],
					["출입증 교부/회수", "20400", "root"],
					["출입증 교부", "20401", "20400"],
					["공무원증 등록", "20402", "20400"],
					["임시출입증 교부", "20403", "20400"],
					["출입증 회수", "20404", "20400"],
					["임시출입증 회수", "20405", "20400"],
					["출입증 사고처리", "20406", "20400"],
					["나라사랑카드 등록", "20407", "20400"],
					["출입증 현황", "20500", "root"],
					["출입증 교부현황", "20501", "20500"],
					["공무원증 등록현황", "20502", "20500"],
					["나라사랑카드 등록현황", "20503", "20500"],
					["소속부대원 정보관리", "20600", "root"],
					["소속부대원 정보관리", "20601", "20600"],
					["전출자 현황", "20602", "20600"],
					["부대차량 등록관리", "20700", "root"],
					["부대차량 등록", "20701", "20700"],
					["부대차량 변경", "20702", "20700"]];
	
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
	var accountInfo = dataManager.getAccountInfo();
	var privilege = Number(accountInfo.getValue("Privilege"));
	console.log("privilege: " + privilege);
	
	var hostAppIns = app.getHostAppInstance();
	var bResult = hostAppIns.callAppMethod("menuPrivilegeCheck", menuID); 
	if (bResult == "false") {
		if (!acaml_popupflag) {
			dialogAlertAMHQ(app, "경고", "접근권한이 없습니다.");
			acaml_popupflag =true;	
		} else {
			acaml_popupflag = false;	
		}
		return;
	}
	var embView = app.lookup("AMAML_eaMainView");;
	var srcPath = "";
	switch(menuID){
		// 출입신청 020100
		case "20101":	srcPath = "app/custom/rokmch/accessApplication/accessApplicationManagement";	break;
		
		// 출입신청 조회/승인
		case "20201":	srcPath = "app/custom/rokmch/accessApplication/accessApplicationSearchAndApproval";	break;
		
		// 출입증 발급 020300
		case "20301":	srcPath = "app/custom/rokmch/accessCard/accessCardIssue";	break;
		case "20302": 	srcPath = "app/custom/rokmch/accessCard/tempCardIssue"; break;
		case "20303":	srcPath = "app/custom/rokmch/accessCard/accessCardPrintSetting";	break;
		//case "20304":	srcPath = "app/custom/rokmch/accessCard/accessCardIssueStatus";	break;
		//case "20305":	srcPath = "app/custom/rokmch/accessCard/tempCardIssueStatus";	break;
		
		//20305 임시 출입증 발급현황 빠져있음 
		// 출입증 교부/회수 020400
		case "20401":	srcPath = "app/custom/rokmch/accessCard/accessCardIssuance";			break;	// 출입증 교부
		case "20402":	srcPath = "app/custom/rokmch/accessCard/civilServiceCardRegist";		break;	// 공무원증 등록	
		case "20403":   srcPath = "app/custom/rokmch/accessCard/tempCardIssuance";				break;	// 임시출입증 교부
		case "20404":	srcPath = "app/custom/rokmch/accessCard/accessCardRetrieve";			break;	// 출입증 회수
		case "20405":   srcPath = "app/custom/rokmch/accessCard/tempCardRetrieve";			break;	// 임시출입증 회수		
		case "20406":	srcPath = "app/custom/rokmch/accessCard/accessCardIncidentHandling";	break;	// 출입증 사고처리
		case "20407":	srcPath = "app/custom/rokmch/accessCard/narasarangCardRegist";		break;	// 나라사랑카드 등록
		
		// 출입증 현황 020500
		case "20501":	srcPath = "app/custom/rokmch/accessCard/accessCardIssuanceStatus";	break;
		case "20502":	srcPath = "app/custom/rokmch/accessCard/civilServiceCardRegistStatus";	break;
		case "20503":	srcPath = "app/custom/rokmch/accessCard/narasarangCardRegistStatus";	break;
		
		// 소속 부대원 정보 관리
		case "20601":
			if (privilege == 1 ) {
				srcPath = "app/custom/rokmch/users/userManagement";	
			} else {
				srcPath = "app/custom/rokmch/users/ModifyUserInformation";
			}
			break;
		case "20602":	srcPath = "app/custom/rokmch/users/moveOutStatus";	break;
		
		// 부대차량 등록 관리 020700
		case "20701":	srcPath = "app/custom/rokmch/lpr/UnitCarInformationRegist";	break;
		case "20702":	srcPath = "app/custom/rokmch/lpr/UnitCarInformationModify";	break;
	}	
	if( srcPath.length > 0 ){cpr.core.App.load(srcPath, function(app){if(app){embView.app = app;}});}
	//embView.ready(function(){ embView.setAppProperty("initValue", "someValue"); });
}

// 트리에서 selection-change 이벤트 발생 시 호출.
function onTre1SelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Tree
	 */
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
		if (!acaml_popupflag) {
			dialogAlertAMHQ(app, "경고", "접근권한이 없습니다.");
			acaml_popupflag =true;	
		} else {
			acaml_popupflag = false;	
		}
		return;
	}
}



