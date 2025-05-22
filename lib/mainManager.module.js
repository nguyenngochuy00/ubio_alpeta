/******""******************************************
 * mainDragManager.module.js
 * Created at 2018. 11. 20. 오후 1:44:32.
 *
 * @author osm8667
 ************************************************/
var dragSelection = cpr.core.Module.require("lib/DragSelection");
var ctrlDragManager = cpr.core.Module.require("lib/ControlDragManager");
var programManager = null;
var dataManager = cpr.core.Module.require("lib/DataManager");
var usint_version;
var oem_version;

var mainUtil = function(/* cpr.core.AppInstance */app) {
	this._app = app;
	dataManager = getDataManager();
	programManager = cpr.core.Module.require("lib/ProgramManager");
	usint_version = dataManager.getSystemVersion();
	oem_version = dataManager.getOemVersion();
}


/**
 * 선택된 두개의 아이콘을 그룹(폴더)화 하여 데이터를 수정하고, 폴더 아이콘을 만들어 리턴한다.
 */
mainUtil.prototype.makeGroup = function(){
	var appInstance = this._app;
	/**
	 * @type cpr.data.DataSet
	 */
	var menuUser = appInstance.lookup("MenuUser");
	var src = "theme/images/home_screen_icons/home_sceen_icons_folder.png";
	var select = dragSelection.getSelection();
	//부모아이디 생성 공통함수 호출
	var parentID = this.getParentID();
	select.forEach(function(each){
		var row = menuUser.findFirstRow("MenuID == '" + each.id + "'");
		row.setValue("GroupID", parentID);
	});
	dragSelection.clearSelection();
	var output = this.createSymbolic(src, "New", parentID.toString(), "", "", "");
	output.userAttr("isGroup", "true");
	menuUser.pushRowData({
	    "AutoRun": 0,
		"GroupID": 0,
		"MenuID": parentID
	});
	return output;
}


/**
 * 그룹아이디를 생성한다.; 기존 아이디 max로 부터 +1 seq
 */
mainUtil.prototype.getParentID = function(){
	//서브미션 수행
	var thisApp = this._app;
	/**
	 * @type cpr.data.DataSet
	 */
	var groupList = thisApp.lookup("MenuGroup");
	var max = groupList.getMax("MenuGroupID")==null?1:parseInt(groupList.getMax("MenuGroupID"))+1;
	return max;
}


/*
 * 메인화면 아이콘 형태의 아웃풋을 생성
 * @param 이미지경로(String), 메뉴명(String), 고유값(String), 해당 메뉴 화면 경로(String), 다국어키패스
 */
mainUtil.prototype.createSymbolic = function(src, name, value, pageSrc, description, keypath){
	var that = this;
	var thisApp = that._app;
	var button = new cpr.controls.Button(value);
	button.userAttr("val", value); // 아이디
	button.userAttr("name", name); // 명칭
	button.userAttr("ImageSrc", src); // 아이콘 이미지의 경로
	button.userAttr("selectable", "true"); // 선택 가능 여부
	button.userAttr("droppable", "true"); // 드롭 가능 여부
	if(this.isParent(value)){//그룹 여부를 판단
		button.userAttr("isGroup", "true");
		button.value = name;
	}else{
		button.userAttr("isGroup", "false");
		button.bind("value").toLanguage(keypath);
		button.bind("tooltip").toLanguage(keypath);//마우스 오버 시에도 다국어로 보이게 바인딩
	}
	button.style.addClass("symbolic");//main.less 참조
	button.style.css("background-color", "rgba(255,255,255,0)");//버튼이라 배경화면 변경 필요해서 넣은 코드
	button.style.css("background-image", "url(" + src + ")");
	button.style.css("padding", "78px 2px 2px 2px");// 텍스트의 위치를 아래에 위치하게
	button.style.css("background-repeat", "no-repeat");//버튼이라 배경화면 변경 필요해서 넣은 코드
	if(that.isChild(value)){
		button.style.css("visibility", "hidden");//그룹에 속한 아이콘이라면 hidden처리
	}
//	button.tooltip = description;
	button.addEventListener("mousedown", function(e) {//드래그 이벤트 바인딩
		if(e.targetControl.getParent().userAttr("isFolder")=="false"){//폴더가 열려있으면 닫아준다.
			if(thisApp.lookup("emb_folder")){
				dragSelection.clearSelection();
				thisApp.lookup("emb_folder").dispose();
			}
		}
		if(e.which != 1){// 왼쪽 마우스 버튼이 아니면 이벤트 전파 중지
			return;
		}
		if(dragSelection.getSelection().indexOf(button)==-1){
			dragSelection.setSelection([button]);//기존 멀티 드래그 사용 가능성이 있었어서 일단 단건이라고 해도 배열로 처리했음
		}
		ctrlDragManager.dragStart(dragSelection.getSelection(), thisApp, e, "mousedown");//드래그 시작
	});
	
	//20190826 정래훈 아이콘을 클릭 하지 않은 상태에서 드래그 이벤트가 계속 실행되는 문제를 해결하기 위해 작성
	button.addEventListener("mouseup", function(e) { 
		ctrlDragManager.dragStart(dragSelection.getSelection(), thisApp, e, "mouseup");//드래그 시작
	});
	
	button.addEventListener("dblclick", function(e) {
		if(button.userAttr("isGroup")=="true"){//더블 클릭한 아이콘이 그룹아이콘인지 판별
			if(thisApp.lookup("emb_folder")){//폴더가 열려있으면 닫아준다.
				thisApp.lookup("emb_folder").dispose();
			}
			that.createFolder(e);
		}else{
			if (!pageSrc) {
				dialogAlert(thisApp, "", dataManager.getString("Str_InPreparation"), "");
				return;
			}
			//2019-08-20 정래훈 -> 폴더 안에 있는 아이콘을 더블클릭해서 메뉴 실행했을시 폴더 창을 닫기 위해 작성함
			if(thisApp.lookup("emb_folder")){//폴더가 열려있으면 닫아준다.
				thisApp.lookup("emb_folder").dispose();
			}
			that.ExecuteMenu(value);
		}
	});
	button.addEventListener("contextmenu", function(e) {
		e.preventDefault();
		if(dragSelection.getSelection().indexOf(button)==-1){
			dragSelection.setSelection([button]);//우클릭으로 선택한 객체를 넣어준다.
		}
		that.createLinkContextMenu(e);
	});
	return button;
}


/**
 * 그룹(폴더) 데이터 여부를 반환한다.
 * @param {any} value
 */
mainUtil.prototype.isParent = function(value){
	var thisApp = this._app;
	value = parseInt(value);
	/**
	 * @type cpr.data.DataSet
	 */
	var menuUser = thisApp.lookup("MenuUser");
	var row = menuUser.findFirstRow("GroupID=='"+value+"'");
	if(row){
		return true;
	}else{
		return false;
	}
}


/**
 * 그룹(폴더)의  더블클릭 시 output 생성
 */
mainUtil.prototype.createFolder =  function(e){
	var appInstance = this._app;
	if(appInstance.lookup("emb_folder")){
		appInstance.lookup("emb_folder").dispose();
	}else{
		var rect = appInstance.getActualRect();
		var embFolder = new cpr.controls.EmbeddedApp("emb_folder");
		cpr.core.App.load("app/main/mainEmb/folder", function(app) {
			if(app){
				embFolder.app = app;
			}
		});
		embFolder.initValue = e.targetControl;
		//지정 범위에 맞추어 대상 아이콘의 상하단에 floating
		var contextTop = (e.clientY - rect.top) > rect.height*2/3 ? e.clientY - 350 : e.clientY - rect.top;
		embFolder.style.css({
			left: (e.clientX - rect.left) + "px",
			top: contextTop + "px",
			width: "300px",
			height: "350px",
			position: "absolute"
		});
		appInstance.floatControl(embFolder);
	}
}


/**
 * 해당 아이콘이 그룹에 속하였는지의 여부를 리턴한다.
 * @param {any} value
 */
mainUtil.prototype.isChild = function(value){
	var thisApp = this._app;
	/**
	 * @type cpr.data.DataSet
	 */
	var menuUser = thisApp.lookup("MenuUser");
	var checkList = menuUser.findFirstRow("MenuID=="+parseInt(value));
	if(checkList){
		var hasParent = checkList.getValue("GroupID");
		if(hasParent!=0){
			return true;
		}
	}
	return false;
}


mainUtil.prototype.ExecuteMenu = function(menuID, param, param2){
	var that = this;
	var thisApp = that._app;
	
	//이미 활성화 된 메뉴이면 포커스한다.
	if(programManager.getProgramWindow(menuID)){
		programManager.showProgram(menuID);
	}
	
	if( programManager.getProcessCount()>9 ) {
		dialogAlert(thisApp, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarningMaxProgramExceeded"));
		return
	}
	var dsMenuList = thisApp.lookup("MenuList");
	//console.log(dsMenuList.getColumnData("MenuID"));
	var menuData = dsMenuList.findFirstRow("MenuID == " + menuID ); // 메뉴 정보에서 ID와 일치하는 메뉴 정보 가져오기
	// TODO : menuData 없는 경우 예외 처리 필요
	if (menuData == null ) {
		return;
	}
	var name = menuData.getValue("Name");
	var width = 1024;
	var height = 640;
	var programID = menuID.toString();
	var initData = {"programID":programID};
	var path;
	var settingLanguage = localStorage.getItem('language'); /* 설정 언어별 텍스트 짤림 및 크기 조절을 위해 */
	switch (parseInt(menuID,10)) {
		case DLG_USER_MANAGEMENT: 
			width = 1024;
			height = 653;
			break;// 사용자 관리
		case DLG_USER_INFO: initData = {"ID":param,"programID":programID,"Mode":param2};width=880;programID = programID+"_"+param;break;// 사용자 정보
		case DLG_APPROVER_MANAGEMENT: width = 1024; height = 500;break;
		case DLG_USER_REGIST_STATUS:	break;
		case DLG_USER_FACEWT_RESYNC:	break;
		case DLG_USER_IMPORT:			break;
		case DLG_USER_EXPORT:			break;
		case DLG_USER_PICTURE_IMPORT:
			width = 850;
			height = 550;
			break;
		case DLG_USER_BLACKLIST_MANAGEMENT:			break;
		case DLG_USER_SELECT:	break;
		case DLG_GROUP_MANAGEMENT: var dsGroupList = thisApp.lookup("GroupList");initData = {"GroupList":dsGroupList,"programID":programID};
			width = 1100;
			height = 700;
			break;

		case DLG_ACCESSGROUP_MANAGEMENT: // 출입그룹 관리
			var dsAccessGroupList = thisApp.lookup("AccessGroupList");
			var dsAccessAreaList = thisApp.lookup("AccessAreaList");
			var dsAccessAreaGroupList = thisApp.lookup("AccessAreaGroupList");

			initData = {
				"AccessGroupList":dsAccessGroupList,
				"AccessAreaList":dsAccessAreaList,
				"AccessAreaGroupList":dsAccessAreaGroupList,
				"programID":programID
			};
			width = 1100;
			break;
		case DLG_USER_ACCESSGROUP_PRIVILEGE: width = 600;	height = 700;break;
		case DLG_ACCESSGROUP_USER_MANAGEMENT:
			width = 1650;
			height = 700;
			var dsAccessGroupList = thisApp.lookup("AccessGroupList");
			initData = {
				"AccessGroupList":dsAccessGroupList,
				"programID":programID
			};
			break;
		case DLG_ACCESSGROUPINFO_TERMINAL_DOWNLOAD:
			width = 420;
			height = 520;
			break;
		case DLG_ACCESSAREA_MANAGEMENT:
			width = 1000;
			height = 620;

			var dsAccessAreaList = thisApp.lookup("AccessAreaList");
			initData = {
				"AccessAreaList":dsAccessAreaList,
				"programID":programID
			};
			break;
		case DLG_POSITION_MANAGEMENT: // 직급관리
			width = 400;
			height = 400;
			var dsPositionList = thisApp.lookup("PositionList");
			var program_id = programID;
			initData = {
				"PositionList":dsPositionList,
				"programID":programID
			};
			//console.log("dsPositionList : "+ dsPositionList);
			break;
		case DLG_NOTICE_MANAGEMENT:	// 공지사항 알림
			width = 630;
			height = 690;
			break;
		case DLG_TERMINAL_MANAGEMENT: // 단말기 관리
			width = 1180;
			break;
		case DLG_TERMINAL_INFO:			// 단말기 정보는 타입에 따라 경로가 다르므로 여기서 설정 해 준다.			
			path = param["Path"];
			initData = {"TerminalID":param["ID"],"programID":programID};
			programID = programID+"_"+param["ID"];
			break;
		case DLG_TERMINAL_USERS:
			width = 1024; // 영문 텍스트 잘림으로 인한 사이즈 변경 920 -> 1010
			height = 600;
			var dsAccessGroupList = thisApp.lookup("AccessGroupList");
			initData = {
				"AccessGroupList":dsAccessGroupList,
				"programID":programID
			};
			break;
		case DLG_TERMINAL_USER_EX:		width = 1124;	height = 600; break;
		case DLG_TERMINAL_LOG_MANAGEMENT:
			var dsGroupList = thisApp.lookup("GroupList");
			initData = {"GroupList":dsGroupList,"programID":programID};
			break;
		case DLG_TERMINAL_FIRMWARE_DOWNLOAD: break;
		case DLG_TERMINAL_ADMIN_SET: break;
		case DLG_TERMINAL_SEARCH:			width = 570;height = 640;break;
		case DLG_TERMINAL_WORK_PROCESS:		width = 800;height = 600;break;
		case DLG_TERMINAL_LIVEVIEW:		width = 1650;height = 820;break; // Live View -mjy
		case DLG_PRIVILEGE_MANAGEMENT: // 권한 관리
			width = 1350;
			height = 700;
			break;
		case DLG_MONITORING_MANAGEMENT:
			width = 1200;
			height = 600;
			break;
		case DLG_MONITORING_DISPLAY_BOARD:
			// 관한
			var accountInfo = dataManager.getAccountInfo();
			var privilege = Number(accountInfo.getValue("Privilege"));
			
			if (privilege == DLG_DISPLAYBOARD_MANAGEMENT) {
				// 1. 전체화면
				var doc = document.documentElement;
				doc.addEventListener("click", function(e) {
					if (doc.requestFullscreen) {
						doc.requestFullscreen();
					} else if (doc.webkitRequestFullscreen) {
						console.log('Chrome, Safari (webkit)');
						// Chrome, Safari (webkit)
						doc.webkitRequestFullscreen();
					} else if (doc.mozRequestFullScreen) {
						console.log('Firefox');
						// Firefox
						doc.mozRequestFullScreen();
					} else if (doc.msRequestFullscreen) {
						console.log('IE or Edge');
						// IE or Edge
						doc.msRequestFullscreen();
					}
				});
				// 2. 모니터링 관리자 : '전체화면' 후 w, h 적용
				width = screen.width;
				height = screen.height;
			} else {
				// 2. 마스터 : App w, h 적용
				width = thisApp.getActualRect().width;
				height = thisApp.getActualRect().height;
			}
			
			break;		
		case DLG_MONITORING_TERMINAL:
				programID = menuID + "_" + param["ID"];
				initData = {"TerminalID":param["ID"],"programID":programID,"TerminalStatus1":param["TerminalStatus1"],
				"TerminalStatus2":param["TerminalStatus2"],"TerminalStatus3":param["TerminalStatus3"],"TerminalStatus4":param["TerminalStatus4"]};
				width = 435;
				height = 435;
			break;
		case DLG_MONITORING_AUTH_IMAGE:
			initData = {"logImage":param["logImage"],"programID":param["menu_id"],"temperature":param["temperature"],
			"temperatureValid":param["temperatureValid"]};
			width = AuthImageWidth;
			height = AuthImageHeight;
			break;
		case DLG_ANTIPASSBACK_MANAGEMENT: break;
		case DLG_ANTIPASSBACK_AREA_USER: 
			width = 950;
			height = 650;
			if (oem_version==OEM_HC_SAUDI_MARJAN){
				width = 1400;
				height = 800;
			}
			break;
		// 인증로그
		case DLG_AUTHLOG_MANAGEMENT:
			width = 1200; 
			break;
		case DLG_AUTHLOG_VIEW:
			width = 760;
			height = 440;
			initData = {"ID":param,"programID":programID,"Param":param2};
			break;
		case DLG_AUTHLOG_VIDEO_VIEW:
		case DLG_AUTHLOG_IMPORT:
		case DLG_AUTHLOG_EXPORT:
		case DLG_AUTHLOG_STATISTICS:
			break;
		
		case DLG_AUTHLOG_FAW_IMAGE_VIEW: // 현대중공업 안면인식 기록 조회
			width = 1410;
			height = 318;
			break;

		// 시스템 로그
		case DLG_SYSLOG_MANAGEMENT:
			width = 1070;
			height = 662;	
			break;
		case DLG_SYSLOG_VIEW:
			width = 630;
			height = 690;
			break;
		case DLG_EVENTLOG_MANAGEMENT: break;
		case DLG_EVENTLOG_VIEW:
			width = 630;
			height = 690;
			break;
		case DLG_ACULOG_MANAGEMENT: break;
		case DLG_ACULOG_VIEW: break;
		case DLG_ACUEVENTLOG_MANAGEMENT: 
			width = 1200;
			height = 650;
		break;

		case DLG_MOBILECARD_ISSUE:
			width = 400;
			height = 200;
			break;
		case DLG_MOBILECARD_ADMIN_SETTING:
			width = 500;
			height = 420;
			break;
		case DLG_MOBILECARD_ADMIN_LOGIN:
			width = 420;
			height = 220;
			break;
		case DLG_MOBILECARD_BATCH_ISSUE: break;
		case DLG_MOBILECARD_ISSUE_LIST: break;
		case DLG_MOBILECARD_HISTORY: break;
		case DLG_MOBILECARD_SYNC: break;
		case DLG_USERS_FILE_SEND: break;
		case DLG_TNA_WIZARD: break;
		case DLG_TNA_SETTING_WORKTIME:
			width = 630;
		if (settingLanguage == 'fr' || settingLanguage == 'vi' || settingLanguage == 'es') {
			height = 740;
		} else { 
			height = 705;
		}
			var initData = {"programID":programID};
			break;
		case DLG_TNA_SETTING_WORKTYPE:
			height = 690;
		if (settingLanguage == 'fr') {
			width = 870;
		} else {
			width = 630;
		}
			var initData = {"programID":programID};
			break;
		case DLG_TNA_SETTING_PAYMENT :
			height = 690;
		if (settingLanguage == 'fr') {
			width = 680;
		} else {
			width = 630;
		}
			var initData = {"programID":programID};
			break;
		case DLG_TNA_DISPLAY_PERIODRESULT:
			var initData = {"programID":programID};
			width = 1224;
			break;
		case DLG_MEALSERVICE_MANAGEMENT: break;
		case DLG_MEALSERVICE_MENU_MANAGEMENT:
			width = 800;
			height = 360;
			break;
		case DLG_MEALSERVICE_STATISTICS:
			width = 1280;
			height = 800;
			break;
		case DLG_MAP_MANAGEMENT: break;
		case DLG_MAP_AREA_MANAGEMENT:break;//initData = param; param null이 전달되어 주석처리. 다른곳에서 사용중인지 확인 필요
			break;
		case DLG_MAP_AREA_MONITORING:
			initData = param;
			height = 840;
			break;
		case DLG_GENERAL_SETTING:
			break;
		case DLG_DOWNLOAD_MANAGER:
			width = 720;
			height = 540;
			break;
		case DLG_WIEGAND_MANAGEMENT:
			height = 670;
			width = 1130;
			break;
		case DLG_HOLIDAY_MANAGEMENT:
			height = 800;
			width = 1200;
			break;
		case DLG_TIMELINE_NITZEN :
			width = 1176;
			height = 840;
			break;
		case DLG_TIMELINE_VIRDI :
			width = 1176;
			height = 840;
			break;
		case DLG_TIMELINE_WEEKENDN :
			width = 1000;
			height = 840;
			break;
		case DLG_TIMELINE_WEEKENDV :
			width = 1000;
			height = 840;
			break;
		case DLG_USER_MESSAGE_MANAGEMENT :
			width = 650;
			height = 600;
			break;
		case DLG_HELP:
			width = 1000;
			height = 640;
			initData = {"MenuID":param};
			break;
		case DLG_CARDLAYOUT_SETTING:
			width = 570;
			height = 700;
			initData = {"MenuID":param, "programID":programID};
			break;
		case DLG_CARDLAYOUTFORMAT_SETTING:
			width = 550;
			height = 640;
			initData = {"MenuID":param};
			break;
		case DLG_INTEGRATED_REPORTING:
			width = 1024;
			height = 788;
			var initData = {"programID":programID};
			break;
			
		case DLG_VMS_INNODEP:
			width = 1200;
			height = 800;
			var initData = {"programID":programID};
	
			break;			
			
		case DLG_ROLLCALL_MANAGEMENT :		width = 1024; 	height = 800; var initData = {"programID":programID}; break;
		case DLG_VMS_MANAGEMENT :		width = 1024; 	height = 800; var initData = {"programID":programID}; break;
		case DLG_VISITOR_MANAGE_PRIVILEGE:	width = 900;	height = 600;	break;			
			
		// OEM 자운대 -->
		case DLG_PASS_MANAGEMENT:
			width = 730;
			height = 610;
			break;
		case DLG_PASS_REGIST:
			width = 740;
			height = 550;
			break;
		case DLG_PASS_ISSUANCE_HISTORY:
			width = 1035;
			height = 420;
			break;
		case DLG_PASS_INFO:
			width = 1050;
			height = 600;
			initData = {"CardNum":param["CardNum"],"CardType":param["CardType"],"IssueStatus":param["IssueStatus"], "CardName":param["CardName"],
						"RegistDate":param["RegistDate"],"IssueUniqueid":param["IssueUniqueid"],"IssueUserid":param["IssueUserid"]};
			break;
		case DLG_VISIT_MANAGEMENT:
			break;
		case DLG_VISIT_REQUEST:
			width = 900;
			height = 500;
			break;
		case DLG_VISIT_REQUEST_EXCEL:
			
			break;
		case DLG_VISIT_REQUEST_INFO:
			width = 900;
			height = 500;
			initData = {"Index":param["Index"]};
			break;
		case DLG_ACCESS_FLOOR_MANAGEMENT: width=900;height=500;break;
		case DLG_LPR_MANAGEMENT: width=700;height=550;break;
		case DLG_LPRINFO_MANAGEMENT: width=700;height=550;break;
		case DLG_BLACKLIST_MANAGEMENT: break;	
		case DLG_ALWAYSTYPE_USER_MENAGEMENT: break;
		case DLG_AUTHTYPE_LOG_MANAGEMENT:initData = {"ID":param["ID"],"STARTAT":param["STARTAT"],"ENDAT":param["ENDAT"]};break;
		case DLG_OUTTROOPS_MANAGEMENT: width = 900;height = 700;break;
		case DLG_CARINFOLIST_MANAGEMENT: break;
		case DLG_OUTTROOPS_IMMEDIATELYISSUE: width = 490;height = 520;break;
		case DLG_ALWAYSTYPE_CARD_ISSUE:	width = 520;height = 420;break;
		case DLG_WEB_NOTICE_MANAGEMENT: width = 450;height = 350;break;
		case DLG_ADMIN_IP_MANAGEMENT: width=800;height = 500;break;
		case DLG_VISITOR_MANAGEMENT_ND:	break;
		case DLG_AUTHLOG_VIEW_ND: break;

		case DLG_SSH_PREPAYMENT: break;
		case DLG_SSH_PREPAYHISTORY: break;
		case DLG_SSH_BALANCEMANAGEMENT: break;
		case DLG_SSH_PREPAYFILEUPLOAD: break;
		case DLG_SSH_HOLIDAYMANAGEMENT:	width = 670;height = 420;break;
		case DLG_SSH_ADJUSTMENTMANAGEMENT: break; //width=820;height=620;break;
		case DLG_SSH_USERFILEUPLOADMANAGEMENT: break;		
		case DLG_SSH_USERRFCARDMANAGEMENT: break;
		case DLG_SSH_PREPAYUSERLOGLIST: break;
		case DLG_KWL_MEALCLSCODEMANAGEMENT: width = 470;height = 570;break;
		case DLG_KWL_VISITREQUESTMANAGEMENT: break;
		case DLG_KWL_EMERGENCYGROUPMANAGEMENT: break;
		case DLG_KWL_DORMITORYMANAGEMENT: break;
		
		//-> 육군본부 커스터마이징
		case DLG_ARMYHQ_ACCESS_APPLICATION_MANAGEMENT: height=760;break;
		case DLG_ARMYHQ_ACCESS_CARD_MANAGEMENT: height=760;break;
		case DLG_ARMYHQ_ACCESS_APPLICATION_APPROVAL: height=760;break;
		case DLG_ARMYHQ_UNIT_CAR_INFOMATION_MANAGEMENT: height=760;break;
		case DLG_ARMYHQ_ACCESS_APPLICATION_MANAGEMENT_EXCEL: height=760;break;
		case DLG_ARMYHQ_VISIT_APPLICATION_MANAGEMENT: 
			initData = {"ID":programID,"ApplicationIndex":param};
			programID = programID + "_" + param
			height=760;
			break;
		case DLG_ARMYHQ_VISIT_APPLICATION_APPROVAL: height=760;break;
		case DLG_ARMYHQ_ACCESS_STATUS_REGISTRATION: height=760;break;
		case DLG_ARMYHQ_ACCESS_STATUS: height=760;break;
		case DLG_ARMYHQ_ACCESS_STATISTICS: height=760;break;
		case DLG_ARMYHQ_ACCESS_STATUS_AREA_SETTING: height=760;break;
		
		case DLG_BH_ACCESS_GROUP_MAP_MANAGEMENT: 
			width = 1150;
			break;
		case DLG_BH_USER_SYNC_MANAGEMENT: break;
		
		
		case DLG_DJMCH_EDUREGIST_MANAGEMENT:
			width = 1200;
			height = 800;
			break;			
		
		case DLG_DJMCH_EDURESULT_MANAGEMENT:
			width = 1200;
			height = 800;
			break;					
			
		case DLG_DJMCH_MEALSTATISTICS_MANAGEMENT: break;
		case DLG_HDEC_HIOS_SETTING: break;
		case DLG_HDEC_GROUP_AUTH_TYPE_MANAGEMENT: break;
		case DLG_IDIS_WORK_AUTHLOGS: break;
		
		case DLG_AUTHLOGDETAILIMAGE:	// 베트남 주차 관제 시스템 - otk
			console.log(param);
			initData = {"indexKey": param };
			break;
		
		// 베트남 주차 관제 - zzik
		case DLG_BPARK_PAYMENT_MANAGEMENT: 
			width = 850;
			break;
		case DLG_BPARK_PAYMENT_LOG_MANAGEMENT:
			break;

		case DLG_INDO_BNP_CNP_MASTER_SHIFT:	
			width = 1200;
			height = 800;		 
			break;
		
		// 현대 사우디 마잔 - sep	
		case DLG_HC_SAUDI_MARJAN_STATUS:
			width = 776;
			height = 710;
			break;
		case DLG_HC_SAUDI_MARJAN_STATUS_SUB_CONTRACTOR:
			initData = {"StartTime": param};
			width = 350;
			height = 540;
			break; 
		case DLG_HC_SAUDI_MARJAN_STATUS_LABORERS_INFO:
			initData = {
				"programID": programID,
				"StartTime": param["StartTime"], 
				"CompanyID": param["CompanyID"], 
				"Total": param["Total"],
				"CompanyName": param["CompanyName"]
			};
			width = 1100;
			height = 580;
			programID = programID+"_"+param["CompanyID"];
			break;
		
		// 3D
		case DLG_3D_INTEGRATED_MONITORING:
			path = "http://"+location.hostname + menuData.getValue("Src");
			window.open(path, "" ,"_blank");
			return;
		case DLG_IDTECK_ACU_DEVICE_MANAGEMENT:
			width = 1024;
			height = 768;
			break;
		case DLG_IDTECK_ACU_DEVICE_EVENT_LOG_MANAGEMENT:
			width = 1024;
			height = 768;
			break;
		case DLG_IDTECK_ACU_DEVICE_MONITORING:
			break;
			
		case DLG_HECJF_RESTRICTION_MANAGEMENT:
			width = 872;
			height = 562;
			break; 
			
		case DLG_BOSK_BLACKLIST_MANAGEMENT: break;
		
		case DLG_BUILDING_TERMINAL_MANAGEMENT: 
			width=980;
			height=572;
			break;
			
		// 현대 중공업
		case DLG_HDHI_TNA_DISPLAY_MONTH_PERIODRESULT:
			var initData = {"programID":programID};
			width = 1224;
			break;
		case DLG_HDHI_TNA_DISPLAY_DAILY_PERIODRESULT:
			var initData = {"programID":programID};
			width = 1224;
			break;
		case DLG_HDHI_TNA_DISPLAY_BYPARTNER_PERIODRESULT:
			var initData = {"programID":programID};
			width = 1224;
			break;
		case DLG_VIETNAM_INTEG_WATCH_TERMINAL_MANAGEMENT:
			width = 1024;
			height = 768;
			break;
		case DLG_VIETNAM_INTEG_WATCH_TERMINAL_AUTHLOG:// 인증로그 TODO
			initData = {"logImage":param["logImage"],"logEventTime":param["logEventTime"],"logTerminalName":param["logTerminalName"],
			"logUserName":param["logUserName"],"logAuthResult":param["logAuthResult"], "logTerminalID":param["logTerminalID"]};
			width = 300;
			height = 450;
			break;
		case DLG_VIETNAM_INTEG_TERMINAL_CCTV_MANAGEMENT:
			width = 1024;
			height = 768;
			break;
		case DLG_ALMARAI_AUTHLOG_IMAGE: 
			debugger;
			initData = {
				"logImage":param["logImage"],
				"logTerminalID":param["logTerminalID"],
				"logTerminalName":param["logTerminalName"],
				"logUserID":param["logUserID"],
				"logUserName":param["logUserName"],
				"logAuthResult":param["logAuthResult"],
				"logEventTime":param["logEventTime"],
				};
			width = 300;
			height = 450;
			break;
		default:
			console.log(parseInt(menuID,10))
			dialogAlert(thisApp, "", dataManager.getString("Str_InPreparation"), "");
			return;
			break;
	}
	if (path == undefined) {
		path = menuData.getValue("Src");
	}
	
	path = path + "?" + usint_version;
	
	//console.log("path: " + path);
	//console.log("menuID: " + menuID);
	//console.log("programID: " + programID);
	//console.log("initData: " + initData);
	
	//alert(path);
	var headerName = dataManager.getMenuKey(parseInt(menuID));
	programManager.runProgram(
		thisApp,
		{ name: headerName, src: menuData.getValue("Image") },
		path, //menuData.getValue("Src"),
		menuID.toString(),
		programID,
		initData,
		width,
		height
	);
}


/**
 * 아이콘 우클릭 시 이벤트를 정의한다.
 * @param {Event} e
 */
mainUtil.prototype.createLinkContextMenu = function(e){
	var that = this;
	var thisApp = that._app;//다른 영역의 함수가 사용되었을 때 인식을 못하는 경우를 대비하여 변수로 할당, this를 인식못함
	var contextLocale = dataManager.getLocale();
	var menu_1 = new cpr.controls.Menu();
	/**
	 * @type cpr.data.DataSet
	 */
	var contextlist = thisApp.lookup("desktop_menu");
	var targetControl = e.targetControl;//이벤트가 발생한 컨트롤 객체를 불러온다.
	var id = targetControl.id;
	if(targetControl.userAttr("isGroup")=="false"){
		contextlist.setFilter("value=='del'");
	}else{
		if(contextlist.getFilter()){
			contextlist.clearFilter();
		}
	}
	var contextLabel = contextLocale=="en"?"e_label":"label";
	menu_1.setItemSet(contextlist, {
		label: contextLabel,
		value: "value",
		parentValue: "parent"
	});
	menu_1.addEventListener("selection-change", function(e) {
		/**
		 * @type cpr.data.DataSet
		 */
		var ds = thisApp.lookup("MenuUser");
		var menu = e.control;
		/**
		 * @type cpr.controls.Output
		 */
		var selectValue = menu.value;// 메뉴에 임의로 할당된 value del:삭제 , chn: 이름변경
		var select = dragSelection.getSelection();//선택한 대상
		var text, url = null;
		if(selectValue == "del"){
			text = dataManager.getString("Str_DeleteConfirm");
			dialogConfirm(thisApp, "", text, function(/*cpr.controls.Dialog*/dialog){
				dialog.addEventListenerOnce("close", function(e) {
					if (dialog.returnValue) {
						/**
						 * @type cpr.protocols.Submission
						 */
						var mgmtMenu = thisApp.lookup("sms_deleteMenu");
						//comLib.send("서브미션 아이디", "로딩타입");
						select.forEach(function(each){
							//화면 초기화
							//ctrlDragManager.redrawMain(thisApp, [each]);
							//선택한 아이콘 삭제
							var ctrlID = parseInt(each.id);
							if(each.userAttr("isGroup")=="false"){
								var row = ds.findFirstRow("MenuID == " + ctrlID );
								var isGroupChild = row.getValue("GroupID");
								if(isGroupChild == 0){//바탕화면의 아이콘, 단순 아이콘 삭제 시
									ctrlDragManager.redrawMain(thisApp, [each]);
									url = "/v1/menuUsers/";
									mgmtMenu.action = url + ctrlID;
									mgmtMenu.send();
									mgmtMenu.addEventListenerOnce("submit-success", function(e){
										/**
										 * @type cpr.protocols.Submission
										 */
										var manageMenu = e.control;
										ds.realDeleteRow(row.getIndex());
										if(thisApp){
											/**
											 * @type cpr.protocols.Submission
											 */
											var saveSms = thisApp.lookup("sms_manageMenu");
											saveSms.send();
										}
									});
								}else{//폴더 안의 아이콘 삭제시
									url = "/v1/menuUsers/";
									mgmtMenu.action = url + ctrlID;
									mgmtMenu.send();
									ds.realDeleteRow(row.getIndex());
									var parent = each.getParent();//폴더에서 삭제한 아이콘의 컨트롤도 삭제해준다.
									parent.removeChild(each);
									ctrlDragManager.deleteGroupSub(thisApp, isGroupChild);//아이콘 위치는 controlDragManager에서 수행
								}
							}else{
								ctrlDragManager.redrawMain(thisApp, [each]);
								//그룹 아이콘 및 그룹에 속한 데이터도 같이 삭제
								/**
								 * @type cpr.data.DataSet
								 */
								var groupList = thisApp.lookup("MenuGroup");
								//그룹 삭제
								var groupRow = groupList.findFirstRow("MenuGroupID");
								groupList.realDeleteRow(groupRow.getIndex());
								//menuuser에 담겨있던 그룹 row를 삭제
								var menuGroupRow = ds.findFirstRow("MenuID == " + ctrlID);
								ds.deleteRow(menuGroupRow.getIndex());
								//그룹 안에 있는 child 삭제
								var childRows = ds.findAllRow("GroupID=="+ctrlID);//폴더를 삭제했다면 자식들도 같이 지워준다.
								if(childRows.length>0){
									url = "/v1/menuGroups/";
									mgmtMenu.action = url + ctrlID;
									mgmtMenu.send();
									mgmtMenu.addEventListener("submit-done", function(e){
										childRows.forEach(function(/* cpr.data.Row */ child){
											var smsDeleteChild = new cpr.protocols.Submission("deleteChild");
											url = "/v1/menuUsers/";
											smsDeleteChild.action = url + child.getValue("MenuID");
											smsDeleteChild.method = "DELETE";
											smsDeleteChild.mediaType = "application/x-www-form-urlencoded";
											smsDeleteChild.send();
											ds.deleteRow(child.getIndex());
										});
										ds.commit();
									});
								}
							}
							thisApp.getContainer().removeChild(each);
						});
						dragSelection.clearSelection();
					} else {
						return;
					}
				});
			});
		}else if(selectValue == "chn"){//그룹(폴더)의 이름을 변경한다.
			var result = null;
			thisApp.openDialog("app/main/mainEmb/setFolderName", {width : 300, height : 200}, function(/*cpr.controls.Dialog*/dialog){
				dialog.modal = true;
				dialog.bind("headerTitle").toLanguage("Str_ChangeFolderName");
				dialog.initValue = select[0].userAttr("name");
				dialog.addEventListenerOnce("close", function(e){
					result = dialog.returnValue;
					if(result){
						/**
						 * @type cpr.data.DataSet
						 */
						var groupList = thisApp.lookup("MenuGroup");
						var targetRow = groupList.findFirstRow("MenuGroupID=="+id);
						targetRow.setValue("Name", result);
						/**
						 * @type cpr.protocols.Submission
						 */
						var saveSms = thisApp.lookup("sms_manageMenuGroup");
						saveSms.method = "PUT";
						saveSms.send();
						if(saveSms.isSuccess()){
							targetControl.text = result;
							targetControl.userAttr("name", result);
						}
					}
				});
			});
		}
		menu.dispose();
	});
	var rect = thisApp.getActualRect();
	menu_1.style.css({
		left: (e.clientX - rect.left) + "px",
		top: (e.clientY - rect.top) + "px",
		height: "200px",
		width: "200px",
		position: "absolute"
	});
	menu_1.focus();
	menu_1.addEventListener("blur", function(e) {
		menu_1.dispose();
	});
	thisApp.floatControl(menu_1);
}


globals.mainManager = function(/* cpr.core.AppInstance */app) {
	return new mainUtil(app);
}