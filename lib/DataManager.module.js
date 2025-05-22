/************************************************
 * DataManager.module.js
 * Created at 2018. 11. 13. 오후 2:11:35.
 *
 * @author fois
 ************************************************/
exports.id = "DataManager.module.js";

{
	function getNavigatorLanguage() {
		if (navigator.languages && navigator.languages.length) {
			return navigator.languages[0];
		} else {
			return navigator.userLanguage || navigator.language || navigator.browserLanguage || 'en';
		}
	}
	
	var _dataManager = null;
	
	var DataManager = function() {
		/** @type cpr.core.AppInstance */
		this._app = null;
		
		// 언어 설정
		this._locale;
		this._userIDLength = 8;
		
		// 초기 로딩 데이터 리스트
		this.initData = new Array();
		this.initData.push(DLG_COUNTRYCODE); // 국가명
		this.initData.push(DLG_STRING); // 언어
		this.initData.push(DLG_MENU_ALL); // 메뉴
		this.initData.push(DLG_GROUP_MANAGEMENT); // 그룹
		this.initData.push(DLG_ACCESSGROUP_MANAGEMENT); // 출입그룹
		this.initData.push(DLG_POSITION_MANAGEMENT); // 직급
		this.initData.push(DLG_PRIVILEGE_MANAGEMENT); // 권한
		this.initData.push(DLG_TERMINAL_MANAGEMENT); // 단말
		this.initData.push(DLG_TNA_SETTING_WORKTYPE); // 근태
		this.initData.push(DLG_TNA_SETTING_PAYMENT); // 급여
		this.initData.push(DLG_TIMELINE_WEEKENDV); // 타임존
		this.initData.push(DLG_MEALSERVICE_MANAGEMENT); // 식수
		this.initData.push(DLG_USER_MESSAGE_MANAGEMENT); // 사용자 메세지
		this.initData.push(DLG_GENERAL_SETTING); // 서버옵션
		this.initData.push(DLG_VMS_MANAGEMENT); // VMS Setting
		this.initData.push(DLG_VMS_MultiView); // MultiView Setting
		this.initData.push(LICENSE_CHECK);
		this.initData.push(XKEY_LICENSE_CHECK);
		this.initData.push(OEM_INIT);
		
		// 갱신이 필요한 데이터 리스트 추가. 데이터 참고시 이 리스트를 먼저 체크하여 업데이트 필요 여부 확인.
		this.updateData = new Array();
		
		/** @type cpr.data.DataMap */
		this._accountInfo = null;
		/** @type cpr.data.DataMap */
		this._userInfo = null;
		/** @type cpr.data.DataMap */
		this._sysBrandType = null;
		/** @type cpr.data.DataMap */
		this._systemInfo = null;
		
		this._webSocket = null;
		
		// 나성훈이 개발중인 코드를 ON (1) , git 에 올릴 때는 OFF (0) 으로 바꾸고 올립니다 , 개발이 끝난 코드는 if 문을 제거합니다.
		this.NSH_DEV_CODE = 0;
		this.ENABLE_MCP040 = 0;
		this.ENABLE_INNODEP_VMS = 0;
		
		this.ENABLE_MULTIVIEW = 0;
		
		// 단말
		/** @type cpr.data.DataSet */
		this._terminal = null;
		this._terminalMap = new Map();
		
		// 메뉴
		/** @type cpr.data.DataSet */
		this._menuAll = null;
		
		// 그룹
		/** @type cpr.data.DataSet */
		this._group = null;
		this._groupMap = new Map();
		
		// 출입그룹
		/** @type cpr.data.DataSet */
		this._accessGroup = null;
		this._accessGroupMap = new Map();
		
		/** @type cpr.data.DataSet */
		this._accessArea = null;
		/** @type cpr.data.DataSet */
		this._accessAreaGroup = null;
		
		// 직급
		/** @type cpr.data.DataSet */
		this._positionList = null;
		
		// 권한
		/** @type cpr.data.DataSet */
		this._privilegeList = null;
		this._privilegeMap = new Map();
		
		// 근무형태
		this._tnaTypeList = null;
		
		//식수
		this._mealList = null;
		
		// 사용자 메세지
		this._userMessageList = null;
		
		// 급여
		this._paymentList = null;
		
		this._taskList = null;
		
		this._TimezoneSet = null;
		
		this._languageType = null;
		
		this._terminalTypeMap = new Map();
		this._terminalTypeMap.set("2", "NAC 2500");
		this._terminalTypeMap.set("3", "NAC 3000");
		this._terminalTypeMap.set("4", "NAC 2500 (4MF)");
		this._terminalTypeMap.set("6", "NAC 5000");
		this._terminalTypeMap.set("9", "NAC 5000");
		this._terminalTypeMap.set("18", "T5");
		this._terminalTypeMap.set("19", "T3");
		this._terminalTypeMap.set("20", "T1");
		this._terminalTypeMap.set("22", "T9");
		this._terminalTypeMap.set("23", "FKA2");
		this._terminalTypeMap.set("24", "eNCardi");
		this._terminalTypeMap.set("25", "T2");
		this._terminalTypeMap.set("26", "UBio-X Slim");
		this._terminalTypeMap.set("30", "AC1100");
		this._terminalTypeMap.set("31", "AC2000");
		this._terminalTypeMap.set("32", "AC2200");
		this._terminalTypeMap.set("33", "AC5000_Plus");
		this._terminalTypeMap.set("34", "AC5100");
		this._terminalTypeMap.set("35", "AC7000");
		this._terminalTypeMap.set("36", "UBio-X Pro Lite");
		this._terminalTypeMap.set("37", "UBio-X Pro");
		this._terminalTypeMap.set("38", "AC6000");
		this._terminalTypeMap.set("39", "UBio Tablet5");
		this._terminalTypeMap.set("40", "UBio-X Slim");
		this._terminalTypeMap.set("41", "UBio-X Pro 2");
		this._terminalTypeMap.set("42", "AC1000");
		this._terminalTypeMap.set("43", "UBio-X Iris");
		this._terminalTypeMap.set("45", "UBio-X Face");
		this._terminalTypeMap.set("46", "UBio-X Face Premium"); // Premium 추가 otk
		this._terminalTypeMap.set("47", "UBio-X Face Pro");
		/** @type cpr.data.DataMap */
		this._ClientOption = null;
		// 방문자
		/** @type cpr.data.DataMap */
		this._visitinfo = null;
		// 통합리포트 결제란 정보
		this._signedSet = null;
		
		// 메뉴아이콘 제외 리스트 
		this._deleteItemMenuID = null;
		
		this._oemVersion = null;
		this._deviceVersion = null;
		// OEM_ARMY_HQ -->
		// 승인자
		this._approver = null;
		// 컨트롤 권한
		this._userInfoARMHQ = null;
		// 로그인한 사용자의 상위 부서 및 관리 가능한 하위 부서 . 전체 부서는 _group.
		this._loginUserGroups = null;
		// <-- OEM_ARMY_HQ
		
		this._vmsInfos = new Map();
		
		// OEM_HCSM
		/** @type cpr.data.DataSet */
		this._company = null;
		this._companyMap = new Map();
		
		this._team = null;
		this._teamMap = new Map();
		
		this._part = null;
		this._partMap = new Map();
		
		this._nationality = null;
		this._nationalityMap = new Map();
		
		this._bloodType = null;
		this._bloodTypeMap = new Map();
		
		// OEM_MOTORCYCLE_PARK
		/** @type cpr.data.DataSet */
		this._bparkInfo = null;
		this._bparkInfoMap = new Map();
		
		/** @type cpr.data.DataSet */
		this._bparkVal = null;
		this._bparkValMap = new Map();
		
		/** @type cpr.data.DataMap */
		this._bparkOptionPayment = null;
		
		// OEM_BOSK_CAPS
		this._obcAcuDevice = null;
		this._obcAcuDeviceMap = new Map();
		
		// OEM_HYUNDAI_HI
		this._hdhiPartner = null;
		this._hdhiPartnerMap = new Map();
		
		this._hdhiRelationDept = null;
		this._hdhiRelationDeptMap = new Map();
		
		// OEM_ITONE_TRDATA , OEM_ITONE_POSCODX
		this._itoneFieldInfo = null;
		
		// Xkey License Status
		this._xkeyLicStatus = 0;
		
		// OEM_HYUNDAI_HI
		this._vicEnrolledTerminals = null;
		this._vicEnrolledTerminalMap = new Map();
		this._vicCCTVList = null;
		this._vicTerminalCCTVMap = new Map();
	}
	
	DataManager.prototype.getUserIDLength = function() {
		return this._userIDLength;
	}
	
	DataManager.prototype.setUserIDLength = function(length) {
		this._userIDLength = length;
	}
	
	DataManager.prototype.getTerminalTypeMap = function() {
		return this._terminalTypeMap
	}
	
	DataManager.prototype.initLanguage = function() {
		var language = getNavigatorLanguage();
		//		var [lang, locale] = ((language.replace('-', '_')).toLowerCase()).split('_');
		var strArr = ((language.replace('-', '_')).toLowerCase()).split('_');
		var lang = strArr[0];
		var locale = strArr[1];
		if (cpr.I18N.INSTANCE.isSupportedLanguage(lang) == false) {
			lang = "en";
		}
		cpr.I18N.INSTANCE.currentLanguage = lang;
		this._locale = lang;
		return lang;
	}
	
	DataManager.prototype.getLocale = function() {
		return this._locale;
	}
	
	DataManager.prototype.setLocale = function(locale) {
		this._locale = locale;
	}
	
	DataManager.prototype.setLanguage = function(locale, /* cpr.data.DataSet */ langlist) {
		
		var data = langlist.getRowDataRanged();
		
		var localeData = {};
		data.forEach(function(strData) {
			localeData[strData["Key"]] = strData["Value"];
		});
		var multilang = cpr.I18N.INSTANCE;
		multilang.setLocaleData(locale, localeData);
	}
	
	DataManager.prototype.getString = function(key) {
		
		var multilang = cpr.I18N.INSTANCE;
		var value = "";
		try {
			value = multilang.message(key, this._locale);
		} catch (error) {
			value = "";
		}
		return value;
	}
	
	DataManager.prototype.getMenuKey = function(menuID) {
		var key = "";
		switch (menuID) {
			case F_USER:
				key = "Str_User";
				break;
			case DLG_USER_MANAGEMENT:
				key = "Str_UserManagement";
				break;
			case DLG_USER_INFO:
				key = "Str_UserInfo";
				break;
			case DLG_APPROVER_MANAGEMENT:
				key = "Str_ApproverManagement";
				break;
			case DLG_USER_REGIST_STATUS:
				key = "Str_UserRegistStatus";
				break;
			case DLG_USER_IMPORT:
				key = "Str_UserImport";
				break;
			case DLG_USER_EXPORT:
				key = "Str_UserExport";
				break;
			case DLG_USER_PICTURE_IMPORT:
				key = "Str_UserPictureImport";
				break;	
			case DLG_USER_SELECT:
				key = "Str_UserSelect";
				break;
			case DLG_USER_BLACKLIST_MANAGEMENT:
				key = "Str_UserBlackListManagement";
				break;
				
			case F_GROUP:
				key = "Str_Group";
				break;
			case DLG_GROUP_MANAGEMENT:
				key = "Str_GroupManagement";
				break;
				
			case F_TERMINAL:
				key = "Str_Terminal";
				break;
			case DLG_TERMINAL_MANAGEMENT:
				key = "Str_TerminalManagement";
				break;
			case DLG_TERMINAL_INFO:
				key = "Str_TerminalInfo";
				break;
			case DLG_TERMINAL_USERS:
				key = "Str_TerminalUser";
				break;
			case DLG_TERMINAL_LOG_MANAGEMENT:
				key = "Str_TerminalLog";
				break;
			case DLG_TERMINAL_FIRMWARE_DOWNLOAD:
				key = "Str_TerminalFirmware";
				break;
			case DLG_TERMINAL_ADMIN_SET:
				key = "Str_TerminalAdmin";
				break;
			case DLG_TERMINAL_SEARCH:
				key = "Str_TerminalSearch";
				break;
			case DLG_TERMINAL_WORK_PROCESS:
				key = "Str_TaskList";
				break;
			case DLG_TERMINAL_USER_EX:
				key = "Str_TerminalUserEx";
				break;
			case DLG_TERMINAL_LIVEVIEW:
				key = "Str_TerminalLiveView";
				break;
				
			case F_TIMEZONE:
				key = "Str_Timezone";
				break;
			case DLG_TIMELINE_NITZEN:
				key = "Str_TimelineManagement";
				break;
			case DLG_TIMELINE_VIRDI:
				key = "Str_TimelineManagement";
				break;
			case DLG_TIMELINE_WEEKENDN:
				key = "Str_TimezoneManagement";
				break;
			case DLG_TIMELINE_WEEKENDV:
				key = "Str_TimezoneManagement";
				break;
			case DLG_HOLIDAY_MANAGEMENT:
				key = "Str_HolidayManagement";
				break;
				
			case F_ACCESSGROUP:
				key = "Str_AccessGroup";
				break;
			case DLG_ACCESSGROUP_MANAGEMENT:
				key = "Str_AccessGroupManagement";
				break;
			case DLG_ACCESSAREA_MANAGEMENT:
				key = "Str_AccessAreaManagement";
				break;
			case DLG_ACCESSGROUP_USER_MANAGEMENT:
				key = "Str_AccessGroupUserManagement";
				break;
			case DLG_ACCESSGROUPINFO_TERMINAL_DOWNLOAD:
				key = "Str_SendAccessGroupInfoToTerminal";
				break;
			case DLG_USER_ACCESSGROUP_PRIVILEGE:
				key = "Str_UserAccessGroupPrivilege";
				break;
				
			case F_AUTHLOG:
				key = "Str_AuthLog";
				break;
			case DLG_AUTHLOG_MANAGEMENT:
				key = "Str_AuthLogManagement";
				break;
			case DLG_AUTHLOG_VIEW:
				key = "Str_AuthLogInfo";
				break;
			case DLG_AUTHLOG_VIDEO_VIEW:
				key = "Str_AuthLogVideoView";
				break;
			case DLG_AUTHLOG_IMPORT:
				key = "Str_AuthLogImport";
				break;
			case DLG_AUTHLOG_EXPORT:
				key = "Str_AuthLogExport";
				break;
			case DLG_AUTHLOG_STATISTICS:
				key = "Str_AuthLogStatistics";
				break;
			case DLG_AUTHLOG_FAW_IMAGE_VIEW:
				key = "Str_AuthLogFAWview";
				break;	
				
			case F_SYSLOG:
				key = "Str_SystemLog";
				break;
			case DLG_SYSLOG_MANAGEMENT:
				key = "Str_SystemLogManagement";
				break;
			case DLG_SYSLOG_VIEW:
				key = "Str_SystemLogInfo";
				break;
				
			case DLG_EVENTLOG_MANAGEMENT:
				key = "Str_EventLogManagement";
				break;
			case DLG_EVENTLOG_VIEW:
				key = "Str_EventLogInfo";
				break;
				
			case DLG_ACUEVENTLOG_MANAGEMENT:
				key = "Str_ACUEventLogManagement";
				break;
				
				//DLG_ACULOG_MANAGEMENT 	= 0x0B000005;
				//DLG_ACULOG_VIEW 		= 0x0B000006;
				
			case F_PRIVILEGE:
				key = "Str_Privilege";
				break;
			case DLG_PRIVILEGE_MANAGEMENT:
				key = "Str_PrivilegeManagement";
				break;
				
			case F_MONITORING:
				key = "Str_Monitoring";
				break;
			case DLG_MONITORING_MANAGEMENT:
				key = "Str_Monitoring";
				break;
			case DLG_MONITORING_DISPLAY_BOARD: //전광판
				key = "Str_DisplayBoardMonitoring";
				break;
			case DLG_MONITORING_TERMINAL:
				key = "Str_MonitoringTerminal";
				break;
			case DLG_MONITORING_AUTH_IMAGE:
				key = "Str_MonitoringAuthImage";
				break;
				
			case F_ANTIPASSBACK:
				key = "Str_AntipassBack";
				break;
			case DLG_ANTIPASSBACK_MANAGEMENT:
				key = "Str_AntipassBackManagement";
				break;
			case DLG_ANTIPASSBACK_AREA_USER:
				key = "Str_AntipassBackAreaUser";
				break;
				
			case F_POSITION:
				key = "Str_Position";
				break;
			case DLG_POSITION_MANAGEMENT:
				key = "Str_PositionManagement";
				break;
				
			case F_NOTICE:
				key = "Str_Notice";
				break;
			case DLG_NOTICE_MANAGEMENT:
				key = "Str_NoticeManagement";
				break;
				
				/*
				DLG_MOBILECARD_ISSUE = 0x11000001;
				DLG_MOBILECARD_ADMIN_SETTING = 0x11000002;
				DLG_MOBILECARD_ADMIN_LOGIN = 0x11000003;
				DLG_MOBILECARD_BATCH_ISSUE = 0x11000004;
				DLG_MOBILECARD_ISSUE_LIST = 0x11000005;
				DLG_MOBILECARD_HISTORY = 0x11000006;
				DLG_MOBILECARD_SYNC = 0x11000007;
				* */
			case F_USERS_FILE_SEND:
				key = "Str_UserFileSend";
				break;
			case DLG_USERS_FILE_SEND:
				key = "Str_UserFileSend";
				break;
				
				// 근태 TODO: 근태관리가 없으므로 차후 추가 해야함
			case F_TNA:
				key = "Str_TNA";
				break;
			case DLG_TNA_WIZARD:
				key = "Str_TNAWizard";
				break;
			case DLG_TNA_SETTING_WORKTIME:
				key = "Str_TNAWorkTimeSetting";
				break;
			case DLG_TNA_SETTING_WORKTYPE:
				key = "Str_TNAWorkTypeSetting";
				break;
			case DLG_TNA_SETTING_PAYMENT:
				key = "Str_TNAPaymentSetting";
				break;
			case DLG_TNA_DISPLAY_PERIODRESULT:
				key = "Str_TNAResult";
				break;
				
			case F_MEALSERVICE:
				key = "Str_MealService";
				break;
			case DLG_MEALSERVICE_MANAGEMENT:
				key = "Str_MealServiceManagement";
				break;
			case DLG_MEALSERVICE_MENU_MANAGEMENT:
				key = "Str_MealServiceMenuManagement";
				break;
			case DLG_MEALSERVICE_STATISTICS:
				key = "Str_MealServiceStatistics";
				break;
				
			case F_WIEGAND:
				key = "Str_Wiegand";
				break;
			case DLG_WIEGAND_MANAGEMENT:
				key = "Str_WiegandManagement";
				break;
				
			case F_LOCATION_VISUALIZATION:
				key = "Str_LocationVisualization";
				break;
			case DLG_MAP_MANAGEMENT:
				key = "Str_MapManagement";
				break;
			case DLG_MAP_AREA_MANAGEMENT:
				key = "Str_MapAreaManagement";
				break;
			case DLG_MAP_AREA_MONITORING:
				key = "Str_MapAreaMonitoring";
				break;
				
			case F_GENERAL_SETTING:
				key = "Str_GeneralSetting";
				break;
			case DLG_GENERAL_SETTING:
				key = "Str_GeneralSetting";
				break;
				
			case F_DOWNLOAD_MANAGER:
				key = "Str_TaskManager";
				break;
			case DLG_DOWNLOAD_MANAGER:
				key = "Str_TaskManager";
				break;
				
			case F_USER_MESSAGE_MANAGEMENT:
				key = "Str_UserMessage";
				break;
			case DLG_USER_MESSAGE_MANAGEMENT:
				key = "Str_UserMessageManagement";
				break;
				
			case F_CARDLAYOUT_SETTING:
				key = "Str_CardLayout";
				break;
			case DLG_CARDLAYOUT_SETTING:
				key = "Str_CardLayoutSetting";
				break;
			case DLG_CARDLAYOUTFORMAT_SETTING:
				key = "Str_CardLayoutFormatSetting";
				break;
				
			case F_INTEGRATED_REPORTING:
				key = "Str_IntegratedReporting";
				break;
			case DLG_INTEGRATED_REPORTING:
				key = "Str_IntegratedReportingManagement";
				break;
				
			case F_VMS_INNODEP:
				key = "Str_VmsInnodep";
				break;
			case DLG_VMS_INNODEP:
				key = "Str_VmsInnodepManagement";
				break;
				
			case F_LPRINFO_MANAGEMENT:
				key = "Str_LprInfo";
				break; // LPR 일반버전
			case DLG_LPRINFO_MANAGEMENT:
				key = "Str_LprManagement";
				break; // LPR 일반버전
				
			case F_ROLLCALL_MANAGEMENT:
				key = "Str_RollCallInfo";
				break;
			case DLG_ROLLCALL_MANAGEMENT:
				key = "Str_RollCallManagement";
				break;
				
			case F_VMS_MANAGEMENT:
				key = "Str_VMSInfo";
				break;
			case DLG_VMS_MANAGEMENT:
				key = "Str_VMSManagement";
				break;
				
//			case F_VMS_MultiView:
//				key = "Str_MultiView";
//				break;
//			case DLG_VMS_MultiView:
//				key = "Str_MultiView";
//				break;
				
			case F_VISITOR_MANAGEMENT:
				key = "Str_VisitorManagement";
				break;
			case DLG_VISITOR_MANAGE_PRIVILEGE:
				key = "Str_VisitorManagemePrivilege";
				break;
				
			case F_PASS_MANAGEMENT:
				key = "Str_PassManagement";
				break;
			case DLG_PASS_MANAGEMENT:
				key = "Str_PassManagement";
				break;
			case DLG_PASS_REGIST:
				key = "Str_PassRegist";
				break;
			case DLG_PASS_ISSUANCE_HISTORY:
				key = "Str_PassIssuanceHistory";
				break;
			case DLG_PASS_INFO:
				key = "Str_PassInfo";
				break;
				
			case F_VISIT_MANAGEMENT:
				key = "Str_VisitorManagement";
				break;
			case DLG_VISIT_MANAGEMENT:
				key = "Str_VisitManagement";
				break;
			case DLG_VISIT_REQUEST_EXCEL:
				key = "Str_VisitRequestExcel";
				break;
			case DLG_VISIT_REQUEST:
				key = "Str_VisitRequest";
				break;
			case DLG_VISIT_REQUEST_INFO:
				key = "Str_VisitRequestInfo";
				break;
				
			case F_LPR_MANAGEMENT:
				key = "Str_LprManagement";
				break;
			case DLG_LPR_MANAGEMENT:
				key = "Str_LprManagement";
				break;
				
			case F_ELEVATOR:
				key = "Str_Elevator";
				break;
			case DLG_ACCESS_FLOOR_MANAGEMENT:
				key = "Str_AccessFloorManagement";
				break;
			case DLG_BUILDING_TERMINAL_MANAGEMENT:
				key = "Str_BuildingTerminalManagement";
				break;	
				
			case DLG_BLACKLIST_MANAGEMENT:
				key = "Str_UserBlackListManagement";
				break;
			case DLG_ALWAYSTYPE_USER_MENAGEMENT:
				key = "Str_AlwaysTypeUserListManagement";
				break;
			case DLG_AUTHTYPE_LOG_MANAGEMENT:
				key = "Str_AlwaysTypeUserListManagement";
				break;
			case DLG_OUTTROOPS_MANAGEMENT:
				key = "Str_OutTroopsManagement";
				break;
			case DLG_CARINFOLIST_MANAGEMENT:
				key = "Str_CarInfoListManagement";
				break;
			case DLG_OUTTROOPS_IMMEDIATELYISSUE:
				key = "Str_OutTroopsImmediatelyIssue";
				break;
			case DLG_ALWAYSTYPE_CARD_ISSUE:
				key = "Str_AlwaysTypeCardIssue";
				break;
			case DLG_WEB_NOTICE_MANAGEMENT:
				key = "Str_WebNoticeManageMent";
				break;
			case DLG_ADMIN_IP_MANAGEMENT:
				key = "Str_AdminIPManageManagement";
				break;
				
			case F_ND_POERPLANT:
				key = "Str_NDPowerPlant";
				break;
			case DLG_VISITOR_MANAGEMENT_ND:
				key = "Str_VisitorManagerND";
				break;
			case DLG_AUTHLOG_VIEW_ND:
				key = "Str_AuthLogViewND";
				break;
				
			case F_SS_HOSPITAL:
				key = "Str_SSHospital";
				break;
			case DLG_SSH_PREPAYMENT:
				key = "Str_SSHprepayment";
				break;
			case DLG_SSH_PREPAYHISTORY:
				key = "Str_SSHprepayHistory";
				break;
			case DLG_SSH_BALANCEMANAGEMENT:
				key = "Str_SSHBalanceManagement";
				break;
			case DLG_SSH_PREPAYFILEUPLOAD:
				key = "Str_SSHPrepayFileUpload";
				break;
			case DLG_SSH_HOLIDAYMANAGEMENT:
				key = "Str_SSHHolidayManagement";
				break;
			case DLG_SSH_ADJUSTMENTMANAGEMENT:
				key = "Str_SSHAdjustmentManagement";
				break;
			case DLG_SSH_USERFILEUPLOADMANAGEMENT:
				key = "Str_SSHUserFileUploadManagement";
				break;
			case DLG_SSH_USERRFCARDMANAGEMENT:
				key = "Str_SSHUserCardLogManagement";
				break;
			case DLG_SSH_PREPAYUSERLOGLIST:
				key = "Str_SSH_PrepayUserLogList";
				break;
				
			case DLG_KWL_MEALCLSCODEMANAGEMENT:
				key = "Str_KWL_MealClsCodeManagement";
				break;
			case DLG_KWL_VISITREQUESTMANAGEMENT:
				key = "Str_VisitorManagement";
				break;
			case DLG_KWL_EMERGENCYGROUPMANAGEMENT:
				key = "Str_Emergency";
				break;
			case DLG_KWL_DORMITORYMANAGEMENT:
				key = "Str_KWL_DormitoryManagement";
				break;
				
			case F_ARMYHQ_ACCESS_APPLICATION:
				key = "Str_ARMYHQ_AccessApplicationManagement";
				break;
			case DLG_ARMYHQ_ACCESS_APPLICATION_MANAGEMENT:
				key = "Str_ARMYHQ_AccessApplication";
				break;
			case DLG_ARMYHQ_ACCESS_CARD_MANAGEMENT:
				key = "Str_ARMYHQ_AccessCardManagement";
				break;
			case DLG_ARMYHQ_ACCESS_APPLICATION_APPROVAL:
				key = "Str_ARMYHQ_AccessApplicationApproval";
				break;
			case DLG_ARMYHQ_UNIT_CAR_INFOMATION_MANAGEMENT:
				key = "Str_ARMYHQ_UnitCarInformationManagement";
				break;
			case DLG_ARMYHQ_ACCESS_APPLICATION_MANAGEMENT_EXCEL:
				key = "Str_ARMYHQ_AccessApplicationManagementExcel";
				break;
				
			case F_ARMYHQ_VISIT_APPLICATION:
				key = "Str_ARMYHQ_VisitApplicationManagement";
				break;
			case DLG_ARMYHQ_VISIT_APPLICATION_MANAGEMENT:
				key = "Str_ARMYHQ_VisitApplication";
				break;
			case DLG_ARMYHQ_VISIT_APPLICATION_APPROVAL:
				key = "Str_ARMYHQ_VisitApplicationApproval";
				break;
				
			case F_ARMYHQ_ACCESS_STATUS:
				key = "Str_ARMYHQ_AccessStatus";
				break;
			case DLG_ARMYHQ_ACCESS_STATUS_REGISTRATION:
				key = "Str_ARMYHQ_AccessStatusRegistration";
				break;
			case DLG_ARMYHQ_ACCESS_STATUS:
				key = "Str_ARMYHQ_AccessStatus";
				break;
			case DLG_ARMYHQ_ACCESS_STATISTICS:
				key = "Str_ARMYHQ_AccessStatistics";
				break;
			case DLG_ARMYHQ_ACCESS_STATUS_AREA_SETTING:
				key = "Str_ARMYHQ_AccessStatusAreaSetting";
				break;
				
			case DLG_BH_ACCESS_GROUP_MAP_MANAGEMENT:
				key = "Str_BH_AccessGroupMapManagement";
				break;
			case DLG_BH_USER_SYNC_MANAGEMENT:
				key = "Str_BH_UserSYNCManagement";
				break;
			case F_HELP:
				key = "Str_Help";
				break;
			case DLG_HELP:
				key = "Str_Help";
				break;
				
			case F_DJMCH_EDU_TOP:
				key = "Str_DjmchEduTop";
				break;
			case DLG_DJMCH_EDURESULT_MANAGEMENT:
				key = "Str_DjmchEduResultManagement";
				break;
			case DLG_DJMCH_EDUREGIST_MANAGEMENT:
				key = "Str_DjmchEduRegiManagement";
				break;
			case DLG_DJMCH_MEALSTATISTICS_MANAGEMENT:
				key = "Str_MealServiceStatistics";
				break;
			case DLG_HDEC_HIOS_SETTING:
				key = "Str_HDECHioSSetting";
				break;
			case DLG_HDEC_GROUP_AUTH_TYPE_MANAGEMENT:
				key = "Str_HDECGroupAuthTypeManagement";
				break;
			case DLG_IDIS_WORK_AUTHLOGS:
				key = "Str_IDISWorkAuthlog";
				break;
			case DLG_AUTHLOGDETAILIMAGE:
				key = "Str_IsPicture";
				break;
			case DLG_INDO_BNP_CNP_MASTER_SHIFT:
				key = "Str_IndoBnpCnpMasterShift";
				break;

			case DLG_BPARK_PAYMENT_TOP:
				key = "Str_BparkPaymentTop";
				break;
			case DLG_BPARK_PAYMENT_MANAGEMENT:
				key = "Str_BparkPaymentManagement";
				break;
			case DLG_BPARK_PAYMENT_LOG_MANAGEMENT:
				key = "Str_BparkPaymentLogManagement";
				break;
				
			// 현대 사우디 마잔 - sep
			case DLG_HC_SAUDI_MARJAN_STATUS:
				key = "Str_HCSMStatus";
				break;
			case DLG_HC_SAUDI_MARJAN_STATUS_SUB_CONTRACTOR:
				key = "Str_HCSMStatusBySubContractor";
				break;
			case DLG_HC_SAUDI_MARJAN_STATUS_LABORERS_INFO:
				key = "Str_HCSMStatusLaborersInfo";
				break;
				
			// 3D
			case F_LOCATION_VISUALIZATION_3D:
				key = "Str_LocationVisualization3D";
				break;
			case DLG_3D_INTEGRATED_MONITORING:
				key = "Str_IntegratedMonitoring3D"
				break;
			case DLG_IDTECK_ACU_DEVICE_MANAGEMENT:
				key = "Str_BOSK_ACUMANAGEMENT";
				break;
			case DLG_IDTECK_ACU_DEVICE_MONITORING:
				key = "Str_BOSK_ACUMONITORING";
				break;
			// BOSK 블랙리스트
			case DLG_BOSK_BLACKLIST_MANAGEMENT:
				key = "Str_UserBlackListManagement";
				break;
			case DLG_IDTECK_ACU_DEVICE_EVENT_LOG_MANAGEMENT:
				key = "Str_BOSK_ACUEVENTLOGMANAGEMENT";
				break;
			// 현대 무벡스 제한 관리
			case DLG_HECJF_RESTRICTION_MANAGEMENT_TOP:
				key = "Str_HECJFRestrictionManagementTOP"
				break;	
			case DLG_HECJF_RESTRICTION_MANAGEMENT:
				key = "Str_HECJFRestrictionManagement"
				break;
			// 현대중공업
			case DLG_HDHI_TNA_DISPLAY_MONTH_PERIODRESULT:
				key = "Str_HDHITnaMonthResult";
				break;
			case DLG_HDHI_TNA_DISPLAY_DAILY_PERIODRESULT:
				key = "Ste_HDHITnaDailyResult";
				break;
			case DLG_HDHI_TNA_DISPLAY_BYPARTNER_PERIODRESULT:
				key = "Ste_HDHITnaByPartnerResult";
				break;
			case DLG_VIETNAM_INTEG_WATCH_TERMINAL_MANAGEMENT:
				key = "Str_VIC_WatchTerminalManagement";
				break;
			case DLG_VIETNAM_INTEG_WATCH_TERMINAL_AUTHLOG:
				key = "Str_VIC_WatchTerminalAuthLog";
				break;
			case DLG_VIETNAM_INTEG_TERMINAL_CCTV_MANAGEMENT:
				key = "Str_VIC_TerminalCCTVManagement";
				break;
			case DLG_ALMARAI_AUTHLOG_IMAGE:
				key = "Str_VIC_WatchTerminalAuthLog";
				break;
			defualt:
				key = "Str_Error";
				break;
		}
		return key;
	}
	
	DataManager.prototype.getMenuString = function(menuID) {
		var multilang = cpr.I18N.INSTANCE;
		var key = this.getMenuKey(menuID);
		
		try {
			var value = multilang.message(key, this._locale);
			if (value) {
				return value;
			}
		} catch (error) {
			console.error(menuID, key, error);
		}
		return " ";
	}
	
	DataManager.prototype.getHelpKeys = function(menuID) {
		var keys = {
			top: "",
			detail: ""
		};
		switch (menuID) {
			case DLG_USER_MANAGEMENT:
				keys.top = "Str_UserMgrDesc";
				keys.detail = "Str_UserMgrDetailDesc";
				break;
			case DLG_USER_INFO:
				keys.top = "Str_UserInfoDesc";
				keys.detail = "Str_UserInfoDetailDesc";
				break;
			case DLG_APPROVER_MANAGEMENT:
				keys.top = "Str_ApproverManagement";
				keys.detail = "Str_ApproverManagementDesc";
				break;
			case DLG_USER_REGIST_STATUS:
				keys.top = "Str_UserRegStatusDesc";
				keys.detail = "Str_UserRegStatusDetailDesc";
				break;
			case DLG_USER_IMPORT:
				keys.top = "Str_UserImportDesc";
				keys.detail = "Str_UserImportDetailDesc";
				break;
			case DLG_USER_EXPORT:
				keys.top = "Str_UserExportDesc";
				keys.detail = "Str_UserExportDetailDesc";
				break;
			case DLG_USER_PICTURE_IMPORT:
				keys.top = "Str_UserPictureImportDesc";
				keys.detail = "Str_UserPictureImportDetailDesc";
				break;
			case DLG_GROUP_MANAGEMENT:
				keys.top = "Str_GroupMgrDesc";
				keys.detail = "Str_GroupMgrDetailDesc";
				break;
				
			case DLG_TERMINAL_MANAGEMENT:
				keys.top = "Str_TerminalDesc";
				keys.detail = "Str_TerminalDetailDesc";
				break;
			case DLG_TERMINAL_INFO:
				keys.top = "Str_TerminalInfoDesc";
				keys.detail = "Str_TerminalInfoDetailDesc";
				break;
			case DLG_TERMINAL_USERS:
				keys.top = "Str_TerminalUserDesc";
				keys.detail = "Str_TerminalUserDetailDesc";
				break;
			case DLG_TERMINAL_LOG_MANAGEMENT:
				keys.top = "Str_TerminalLogDesc";
				keys.detail = "Str_TerminalLogDetailDesc";
				break;
			case DLG_TERMINAL_FIRMWARE_DOWNLOAD:
				keys.top = "Str_TerminalFirmwareDesc";
				keys.detail = "Str_TerminalFirmwareDetailDesc";
				break;
			case DLG_TERMINAL_ADMIN_SET:
				keys.top = "Str_TerminalAdminDesc";
				keys.detail = "Str_TerminalAdminDetailDesc";
				break;
			case DLG_TERMINAL_SEARCH:
				keys.top = "Str_TerminalSearchDesc";
				keys.detail = "Str_TerminalSearchDetailDesc";
				break;
			case DLG_TERMINAL_USER_EX:
				keys.top = "Str_TerminalUserExDesc";
				keys.detail = "Str_TerminalUserExDetailDesc";
				break;
			case DLG_TERMINAL_USER_EX:
				keys.top = "Str_TerminalMultiViewDesc";
				keys.detail = "Str_TerminalMultiViewDetailDesc";
				break;
			case DLG_TERMINAL_LIVEVIEW:
				keys.top = "Str_TerminalLiveViewDesc";
				keys.detail = "Str_TerminalLiveViewDetailDesc"
				break;
				
				
			case DLG_TIMELINE_NITZEN:
				keys.top = "Str_TimeLineNDesc";
				keys.detail = "Str_TimeLineNDetailDesc";
				break;
			case DLG_TIMELINE_VIRDI:
				keys.top = "Str_TimeLineVDesc";
				keys.detail = "Str_TimeLineVDetailDesc";
				break;
			case DLG_TIMELINE_WEEKENDN:
				keys.top = "Str_Timezone1Desc";
				keys.detail = "Str_Timezone1DetailDesc";
				break;
			case DLG_TIMELINE_WEEKENDV:
				keys.top = "Str_Timezone2Desc";
				keys.detail = "Str_Timezone2DetailDesc";
				break;
			case DLG_HOLIDAY_MANAGEMENT:
				keys.top = "Str_HolidayDesc";
				keys.detail = "Str_HolidayDetailDesc";
				break;
				
			case DLG_ACCESSGROUP_MANAGEMENT:
				keys.top = "Str_AccessGroupDesc";
				keys.detail = "Str_AccessGroupDetailDesc";
				break;
			case DLG_ACCESSAREA_MANAGEMENT:
				keys.top = "Str_AccessAreaDesc";
				keys.detail = "Str_AccessAreaDetailDesc";
				break;
			case DLG_ACCESSGROUP_USER_MANAGEMENT:
				keys.top = "Str_AccessGroupUserDesc";
				keys.detail = "Str_AccessGroupUserDetailDesc";
				break;
			case DLG_ACCESSGROUPINFO_TERMINAL_DOWNLOAD:
				keys.top = "Str_SendAccessGroupInfoToTerminalDesc";
				keys.detail = "Str_SendAccessGroupInfoToTerminalDetailDesc";
				break; //
			case DLG_USER_ACCESSGROUP_PRIVILEGE:
				keys.top = "Str_UserAccessGroupPrivilege";
				keys.detail = "Str_UserAccessGroupPrivilege";
				break; //		
				
			case DLG_AUTHLOG_MANAGEMENT:
				keys.top = "Str_AuthLogDesc";
				keys.detail = "Str_AuthLogDetailDesc";
				break;
			case DLG_AUTHLOG_VIEW:
				keys.top = "Str_AuthLogViewDesc";
				keys.detail = "Str_AuthLogViewDetailDesc";
				break;
			case DLG_AUTHLOG_VIDEO_VIEW:
				keys.top = "Str_AuthLogVideoDesc";
				keys.detail = "Str_AuthLogVideoDetailDesc";
				break;
			case DLG_AUTHLOG_IMPORT:
				keys.top = "Str_AuthLogImportDesc";
				keys.detail = "Str_AuthLogImportDetailDesc";
				break;
			case DLG_AUTHLOG_EXPORT:
				keys.top = "Str_AuthLogExportDesc";
				keys.detail = "Str_AuthLogExportDetailDesc";
				break;
			case DLG_AUTHLOG_STATISTICS:
				keys.top = "Str_AuthLogStatisticsDesc";
				keys.detail = "Str_AuthLogStatisticsDetailDesc";
				break;
			case DLG_AUTHLOG_FAW_IMAGE_VIEW:
				keys.top = "Str_AuthLogFAWviewDesc";
				keys.detail = "Str_AuthLogFAWviewDetailDesc";
				break;	
				
			case DLG_SYSLOG_MANAGEMENT:
				keys.top = "Str_SystemLogDesc";
				keys.detail = "Str_SystemLogDetailDesc";
				break;
			case DLG_SYSLOG_VIEW:
				keys.top = "Str_SystemLogInfoDesc";
				keys.detail = "Str_SystemLogInfoDetailDesc";
				break;
				
			case DLG_EVENTLOG_MANAGEMENT:
				keys.top = "Str_EventLogDesc";
				keys.detail = "Str_EventLogDetailDesc";
				break;
			case DLG_EVENTLOG_VIEW:
				keys.top = "Str_EventLogInfoDesc";
				keys.detail = "Str_EventLogInfoDetailDesc";
				break;
			case DLG_ACUEVENTLOG_MANAGEMENT:
				keys.top = "Str_ACUEventLogManagementDesc";
				keys.detail = "Str_ACUEventLogManagementDetailDesc";
				break;
				
			case DLG_ACULOG_MANAGEMENT:
				keys.top = "Str_ACULogDesc";
				keys.detail = "Str_ACULogDetailDesc";
				break;
			case DLG_ACULOG_VIEW:
				keys.top = "Str_ACULogInfoDesc";
				keys.detail = "Str_ACULogInfoDetailDesc";
				break;
				
			case DLG_PRIVILEGE_MANAGEMENT:
				keys.top = "Str_PrivilegeDesc";
				keys.detail = "Str_PrivilegeDetailDesc";
				break;
				
			case DLG_MONITORING_MANAGEMENT:
				keys.top = "Str_MonitoringDesc";
				keys.detail = "Str_MointoringDetailDesc";
				break;
			case DLG_MONITORING_DISPLAY_BOARD: //전광판
				keys.top = "Str_DisplayBoardMonitoringDesc";
				keys.detail = "Str_DisplayBoardMonitoringDetailDesc";
				break;
			case DLG_MONITORING_TERMINAL:
				keys.top = "Str_TerminalMonitoringDesc";
				keys.detail = "Str_TerminalMointoringDetailDesc";
				break;
			case DLG_MONITORING_AUTH_IMAGE:
				keys.top = "Str_TerminalMonitoringAuthImageDesc";
				keys.detail = "Str_TerminalMointoringAuthImageDetailDesc";
				break;
				
			case DLG_ANTIPASSBACK_MANAGEMENT:
				keys.top = "Str_AntipassbackDesc";
				keys.detail = "Str_AntipassbackDetailDesc";
				break;
			case DLG_ANTIPASSBACK_AREA_USER:
				keys.top = "Str_AntipassbackAreaUserDesc";
				keys.detail = "Str_AntipassbackAreaUserDetailDesc";
				break;
				
			case DLG_POSITION_MANAGEMENT:
				keys.top = "Str_PositionsDesc";
				keys.detail = "Str_PositionsDetailDesc";
				break;
				
			case DLG_NOTICE_MANAGEMENT:
				keys.top = "Str_NoticeDesc";
				keys.detail = "Str_NoticeDetailDesc";
				break;
				
				/*
				DLG_MOBILECARD_ISSUE = 0x11000001;
				DLG_MOBILECARD_ADMIN_SETTING = 0x11000002;
				DLG_MOBILECARD_ADMIN_LOGIN = 0x11000003;
				DLG_MOBILECARD_BATCH_ISSUE = 0x11000004;
				DLG_MOBILECARD_ISSUE_LIST = 0x11000005;
				DLG_MOBILECARD_HISTORY = 0x11000006;
				DLG_MOBILECARD_SYNC = 0x11000007;
				* */
			case DLG_USERS_FILE_SEND:
				keys.top = "Str_UserFileSendDesc";
				keys.detail = "Str_UserFileSendDetailDesc";
				break;
				
				// 근태 TODO: 근태관리가 없으므로 차후 추가 해야함
			case DLG_TNA_WIZARD:
				keys.top = "Str_TNAWizardDesc";
				keys.detail = "Str_TNAWizardDetailDesc";
				break;
			case DLG_TNA_SETTING_WORKTIME:
				keys.top = "Str_WorkTimeDesc";
				keys.detail = "Str_WorkTimeDetailDesc";
				break;
			case DLG_TNA_SETTING_WORKTYPE:
				keys.top = "Str_WorkTypeDesc";
				keys.detail = "Str_WorkTypeDetailDesc";
				break;
			case DLG_TNA_SETTING_PAYMENT:
				keys.top = "Str_TNAPaymentDesc";
				keys.detail = "Str_TNAPaymentDetailDesc";
				break;
			case DLG_TNA_DISPLAY_PERIODRESULT:
				keys.top = "Str_TNAResultDesc";
				keys.detail = "Str_TNAResultDetailDesc";
				break;
				
			case DLG_MEALSERVICE_MANAGEMENT:
				keys.top = "Str_MealServiceDesc";
				keys.detail = "Str_MealServiceDetailDesc";
				break;
			case DLG_MEALSERVICE_MENU_MANAGEMENT:
				keys.top = "Str_MealMenuDesc";
				keys.detail = "Str_MealMenuDetailDesc";
				break;
			case DLG_MEALSERVICE_STATISTICS:
				keys.top = "Str_MealStatisticsDesc";
				keys.detail = "Str_MealStatisticsDetailDesc";
				break;
				
			case DLG_WIEGAND_MANAGEMENT:
				keys.top = "Str_WiegandDesc";
				keys.detail = "Str_WiegandDetailDesc";
				break;
				
			case DLG_MAP_MANAGEMENT:
				keys.top = "Str_LocationSetDesc";
				keys.detail = "Str_LocationSetDetailDesc";
				break;
			case DLG_MAP_AREA_MANAGEMENT:
				keys.top = "Str_LocationMapDesc";
				keys.detail = "Str_LocationMapDetailDesc";
				break;
			case DLG_MAP_AREA_MONITORING:
				keys.top = "Str_LocationMonitoringDesc";
				keys.detail = "Str_LocationMonitoringDetailDesc";
				break;
				
			case DLG_GENERAL_SETTING:
				keys.top = "Str_SettingDesc";
				keys.detail = "Str_SettingDetailDesc";
				break;
				
			case DLG_DOWNLOAD_MANAGER:
				keys.top = "Str_DownloadManagerDesc";
				keys.detail = "Str_DownloadManagerDetailDesc";
				break;
				
			case DLG_USER_MESSAGE_MANAGEMENT:
				keys.top = "Str_UserMessageDesc";
				keys.detail = "Str_UserMessageDetailDesc";
				break;
			case DLG_CARDLAYOUT_SETTING:
				keys.top = "Str_CardLayoutSettingDesc";
				keys.detail = "Str_CardLayoutSettingDetailDesc";
				break;
			case DLG_CARDLAYOUTFORMAT_SETTING:
				keys.top = "Str_CardLayoutFormatSettingDesc";
				keys.detail = "Str_CardLayoutFormatSettingDetailDesc";
				break;
				
			case DLG_INTEGRATED_REPORTING:
				keys.top = "Str_IntegratedReportingManagementDesc";
				keys.detail = "Str_IntegratedReportingManagementDetailDesc";
				break;
				
			case DLG_VMS_INNODEP:
				keys.top = "Str_VmsInnodepManagementDesc";
				keys.detail = "Str_VmsInnodepManagementDetailDesc";
				break;
				
			case DLG_ACCESS_FLOOR_MANAGEMENT:
				keys.top = "Str_AccessFloorManagementDesc";
				keys.detail = "Str_AccessFloorManagementDetailDesc";
				break;
				
			case DLG_LPRINFO_MANAGEMENT:
				keys.top = "Str_LprManagementDesc";
				keys.detail = "Str_LprManagementDetailDesc";
				break;
				
			case DLG_PASS_MANAGEMENT:
				keys.top = "Str_PassManagementDesc";
				keys.detail = "Str_PassManagementDetailDesc";
				break;
			case DLG_PASS_REGIST:
				keys.top = "Str_PassRegistDesc";
				keys.detail = "Str_PassRegistDetailDesc";
				break;
			case DLG_PASS_ISSUANCE_HISTORY:
				keys.top = "Str_PassIssuanceHistoryDesc";
				keys.detail = "Str_PassIssuanceHistoryDetailDesc";
				break;
				
			case DLG_LPR_MANAGEMENT:
				keys.top = "Str_LprManagementDesc";
				keys.detail = "Str_LprManagementDetailDesc";
				break;
			case DLG_BLACKLIST_MANAGEMENT:
				keys.top = "Str_UserBlackListManagementDesc";
				keys.detail = "Str_UserBlackListManagementDetailDesc";
				break;
			case DLG_ALWAYSTYPE_USER_MENAGEMENT:
				keys.top = "Str_AlwaysTypeUserListManagementDesc";
				keys.detail = "Str_AlwaysTypeUserListManagementDetailDesc";
				break;
			case DLG_AUTHTYPE_LOG_MANAGEMENT:
				keys.top = "Str_AlwaysTypeUserListManagementDesc";
				keys.detail = "Str_AlwaysTypeUserListManagementDetailDesc";
				break;
			case DLG_OUTTROOPS_MANAGEMENT:
				keys.top = "Str_OutTroopsManagementDesc";
				keys.detail = "Str_OutTroopsManagementDetailDesc";
				break;
			case DLG_CARINFOLIST_MANAGEMENT:
				keys.top = "Str_CarInfoListManagementDesc";
				keys.detail = "Str_CarInfoListManagementDetailDesc";
				break;
			case DLG_OUTTROOPS_IMMEDIATELYISSUE:
				keys.top = "Str_OutTroopsManagementDesc";
				keys.detail = "Str_OutTroopsManagementDetailDesc";
				break;
			case DLG_ALWAYSTYPE_CARD_ISSUE:
				keys.top = "Str_AlwaysTypeCardIssueDesc";
				keys.detail = "Str_AlwaysTypeCardIssueDetailDesc";
				break;
			case DLG_WEB_NOTICE_MANAGEMENT:
				keys.top = "Str_AdminIPManageManagementDesc";
				keys.detail = "Str_AdminIPManageManagementDetailDesc";
				break;
			case DLG_ADMIN_IP_MANAGEMENT:
				keys.top = "Str_AdminIPManageManagementDesc";
				keys.detail = "Str_AdminIPManageManagementDetailDesc";
				break;
			case DLG_ROLLCALL_MANAGEMENT:
				keys.top = "Str_RollCallManagement";
				keys.detail = "Str_MusteringManagementDetailDesc";
				break;
			case DLG_VMS_MANAGEMENT:
				keys.top = "Str_VMSManagement";
				keys.detail = "Str_VMSManagementDetailDesc";
				break;
			case DLG_HC_SAUDI_MARJAN_STATUS:
				keys.top = "Str_HCSMStatusDesc";
				keys.detail = "Str_HCSMStatusDetailDesc";
				break;
			case DLG_3D_INTEGRATED_MONITORING:
				keys.top = "Str_Monitoring3DDesc";
				keys.detail = "Str_Monitoring3DDetailDesc";
				break;
			case DLG_HECJF_RESTRICTION_MANAGEMENT:
				keys.top = "Str_HECJFRestrictionManagementDesc";
				keys.detail = "Str_HECJFRestrictionManagementDetailDesc";
				break;	
			case DLG_BOSK_BLACKLIST_MANAGEMENT:
				keys.top = "Str_UserBlackListManagementDesc";
				keys.detail = "Str_UserBlackListManagementDetailDesc";
				break;
			case DLG_BUILDING_TERMINAL_MANAGEMENT:
				keys.top = "Str_BuildingTerminalManagementDesc";
				keys.detail = "Str_BuildingTerminalManagementDetailDesc";
				break;	
			case DLG_HDHI_TNA_DISPLAY_MONTH_PERIODRESULT:
				keys.top = "Str_BuildingTerminalManagementDesc";
				keys.detail = "Str_HDHITnaMonthResultDetailDesc";
				break;
			case DLG_HDHI_TNA_DISPLAY_DAILY_PERIODRESULT:
				keys.top = "Str_HDHITnaDailyResultDesc";
				keys.detail = "Str_HDHITnaDailyResultDetailDesc";
				break;
			case DLG_HDHI_TNA_DISPLAY_BYPARTNER_PERIODRESULT:
				keys.top = "Str_HDHITnaByPartnerResultDesc";
				keys.detail = "Str_HDHITnaByPartnerResultDetailDesc";
				break;
			case DLG_VIETNAM_INTEG_WATCH_TERMINAL_MANAGEMENT:
				keys.top = "Str_VIC_WatchTerminalManamentDesc";
				keys.detail = "Str_VIC_WatchTerminalManamentDetailDesc";
				break;
			case DLG_MONITORING_AUTH_IMAGE:
				keys.top = "Str_TerminalMonitoringAuthImageDesc";
				keys.detail = "Str_TerminalMointoringAuthImageDetailDesc";
				//다운로드매니저 자료없음
				defualt:
					keys.top = "Str_Error";
				keys.detail = "Str_Error";
				break;
		}
		return keys;
	}
	
	DataManager.prototype.getLogAuthTypeString = function(value) {
		var type = "";
		switch (Number(value)) {
			case 1:
				type = this.getString("Str_AuthTypeFPVerify");
				break;
			case 2:
				type = this.getString("Str_AuthTypeFPIdentify");
				break;
			case 3:
				type = this.getString("Str_Password");
				break;
			case 4:
				type = this.getString("Str_Card");
				break;
			case 5:
				type = this.getString("Str_AuthTypeFaceVerify");
				break;
			case 6:
				type = this.getString("Str_AuthTypeFaceIdentify");
				break;
			case 7:
				type = this.getString("Str_MobileCard");
				break;
			case 8:
				type = this.getString("Str_TypeIrisIdentify");
				break;
			case 9:
				type = this.getString("Str_TypeIrisVerify");
				break;
			case 10:
				type = this.getString("Str_TypeQR");
				break;
			case 15:
				type = this.getString("Str_Inside");
				break;
			case 16:
				type = this.getString("Str_NotAssigned");
				break;
				/* 사용중인 값인지 확인 후 문자 테이블 부터 추가 필요
	
	
AuthLogTypeFingerprint  //11
AuthLogTypeFace         //12
AuthLogTypeID           // ID,UniqueID로 서버에 인증 수단 요청한 경우
AuthLogTypeLpr          //13
AuthLogTypeExitButton   //15
* */
			default:
				return "";
				break;
		}
		return type;
	}
	
	DataManager.prototype.getErrorString = function(menuID) {
		var key = "";
		switch (menuID) {
			case ErrorPacketTimeout:
				key = "Str_ErrorPacketTimeout";
				break;
			case ErrorTerminalInvalidStatus:
				key = "Str_ErrorTerminalInvalidStatus";
				break;
			case ErrorTerminalIDDuplication:
				key = "Str_ErrorTerminalIDDuplication";
				break;
			case ErrorTerminalNotRegistered:
				key = "Str_ErrorTerminalNotRegistered";
				break;
			case ErrorTerminalNotConnected:
				key = "Str_ErrorTerminalNotConnected";
				break;
			case ErrorTerminalAnotherProcess:
				key = "Str_ErrorTerminalAnotherProcess";
				break;
			case ErrorTerminalNotSupportFunc:
				key = "Str_ErrorTerminalNotSupportFunc";
				break;
			case ErrorTerminalNotSupportTerminal:
				key = "Str_ErrorTerminalNotSupportTerminal";
				break;
			case ErrorTerminalMaxExceed:
				key = "Str_ErrorTerminalMaxExceed";
				break;
			case ErrorCoreTerminalLimit:
				key = "Str_ErrorCoreTerminalLimit";
				break;	
				defualt:
					return " ";
		}
		
		var multilang = cpr.I18N.INSTANCE;
		var value = multilang.message(key, this._locale);
		if (value) {
			return value;
		}
		return " ";
	}
	
	DataManager.prototype.dispose = function() {
		//19-10-15 정래훈 다중 브라우저에서 같은 계정으로 접속 시 이전 브라우저에서 로그아웃되면서 웹소켓 값이 없어 close할 수 없는 오류가 있어 if문 추가함
		if (this._webSocket) {
			this._webSocket.close();
		}
		this._webSocket = null;
		_dataManager = null;
	}
	
	DataManager.prototype.setRootApp = function( /* cpr.core.AppInstance */ app) {
		this._app = app;
	}
	
	DataManager.prototype.getRootApp = function() {
		return this._app;
	}
	
	DataManager.prototype.setAccountInfo = function( /* cpr.data.DataMap */ account) {
		this._accountInfo = account;
	}
	
	DataManager.prototype.getAccountInfo = function() {
		return this._accountInfo;
	}
	
	DataManager.prototype.setUserInfo = function( /* cpr.data.DataMap */ account) {
		this._userInfo = account;
	}
	
	/**
	 * @return cpr.data.DataMap
	 */
	DataManager.prototype.getUserInfo = function() {
		return this._userInfo;
	}
	
	DataManager.prototype.getAccountID = function() {
		return this._accountInfo.getValue("UserID");
	}
	
	DataManager.prototype.getViewAccountID = function() {
		// 화면에 표시할 ID를 리턴할 때 사용
		// ID 1000000000000000000 이면 Master 리턴
		var userID = this._accountInfo.getValue("UserID");
		if (userID == 1000000000000000000) {
			userID = "Master";
		}
		return userID;
	}
	
	DataManager.prototype.getAccountName = function() {
		return this._accountInfo.getValue("Name");
	}
	
	DataManager.prototype.getAccountUuid = function() {
		return this._accountInfo.getValue("Uuid");
	}
	
	DataManager.prototype.getInitData = function() {
		return this.initData.shift(); // 초기화 필요한 데이터 아이디 하나를 꺼내서 반환
	}
	
	DataManager.prototype.setTerminalList = function( /* cpr.data.DataSet */ dsTerminal) {
		this._terminal = dsTerminal;
		this._terminalMap.clear();
		var total = this._terminal.getRowCount();
		for (var i = 0; i < total; i++) {
			var terminalInfo = this._terminal.getRow(i);
			this._terminalMap.set(terminalInfo.getValue("ID"), terminalInfo);
		};
	}
	
	DataManager.prototype.getTerminalList = function() {
		return this._terminal;
	}
	
	DataManager.prototype.getTerminal = function(terminalID) {
		var terminalInfo = this._terminalMap.get(terminalID);
		return terminalInfo;
	}
	
	DataManager.prototype.insertTerminal = function(rowTerminal) {
		if (this._terminal == null) {
			return;
		}
		var terminals = this._terminal.findFirstRow("ID == " + rowTerminal.ID);
		
		if (terminals == null) {
			var insertedRow = this._terminal.addRowData(rowTerminal);
			this._terminal.commit();
			this._terminalMap.set(rowTerminal.ID, insertedRow);
		} else {
			this.updateTerminal(rowTerminal);
		}
	}
	
	DataManager.prototype.updateTerminal = function(rowTerminal) {
		
		if (this._terminal == null) {
			return;
		}
		var updateRow = this._terminal.findFirstRow("ID == " + rowTerminal.ID);
		if (updateRow) {
			updateRow.setRowData(rowTerminal)
			//console.log("update terminal : ["+updateRow.getIndex()+"]", updateRow.getRowData() );
			this._terminal.commit();
			this._terminalMap.set(rowTerminal.ID, updateRow);
		} else {
			this.insertTerminal(rowTerminal);
		}
	}
	
	DataManager.prototype.updateTerminalGroupCode = function(groupID, terminalIDList) {
		
		if (this._terminal == null) {
			return;
		}
		for (var i = 0; i < terminalIDList.length; i++) {
			var updateRow = this._terminal.findFirstRow("ID == " + terminalIDList[i]);
			if (updateRow) {
				updateRow.setValue("GroupCode", groupID);
				this._terminal.commit();
				this._terminalMap.set(terminalIDList[i], updateRow);
			}
		}
	}
	
	DataManager.prototype.updateTerminalCoreFlag = function(flag, terminalID) {
		
		if (this._terminal == null) {
			return;
		}
	
		var updateRow = this._terminal.findFirstRow("ID == " + terminalID);
		if (updateRow) {
			updateRow.setValue("CoreFlag", flag);
			this._terminal.commit();
			this._terminalMap.set(terminalID, updateRow);
		}
		
	}
	
	DataManager.prototype.deleteTerminal = function(terminalID) {
		if (this._terminal == null) {
			return;
		}
		var delRow = this._terminal.findFirstRow("ID == " + terminalID);
		if (delRow) {
			this._terminal.deleteRow(delRow.getIndex());
			this._terminal.commit();
			this._terminalMap.delete(terminalID);
		}
	}
	
	DataManager.prototype.setVisitInfo = function( /* cpr.data.DataMap */ visit) {
		this._visitInfo = visit;
	}
	
	DataManager.prototype.getVisitInfo = function() {
		return this._visitInfo;
	}
	
	DataManager.prototype.setSignedSet = function( /* cpr.data.DataMap */ signedSetting) {
		this._signedSet = signedSetting;
	}
	
	DataManager.prototype.getSignedSet = function() {
		return this._signedSet;
	}
	
	DataManager.prototype.setAccessGroup = function( /* cpr.data.DataSet */ dsAccessGroup) {
		this._accessGroup = dsAccessGroup;
		this._accessGroupMap.clear();
		var total = this._accessGroup.getRowCount()
		for (var i = 0; i < total; i++) {
			var accessGroupInfo = this._accessGroup.getRow(i);
			this._accessGroupMap.set(accessGroupInfo.getValue("ID"), accessGroupInfo);
		};
	}
	
	DataManager.prototype.getAccessGroup = function() {
		return this._accessGroup;
	}
	
	DataManager.prototype.insertAccessGroup = function(rowAccessGroup) {
		
		var accessGroup = this._accessGroup.findFirstRow("ID == " + rowAccessGroup.ID);
		
		if (accessGroup == null) {
			var insertedRow = this._accessGroup.addRowData(rowAccessGroup);
			this._accessGroup.commit();
		} else {
			this.updateAccessGroup(rowAccessGroup);
		}
	}
	
	DataManager.prototype.updateAccessGroup = function(rowAccessGroup) {
		var updateRow = this._accessGroup.findFirstRow("ID == " + rowAccessGroup.ID);
		if (updateRow) {
			updateRow.setRowData(rowAccessGroup)
			this._accessGroup.commit();
		} else {
			this.insertAccessGroup(rowAccessGroup);
		}
	}
	
	DataManager.prototype.deleteAccessGroup = function(accessGroupID) {
		var delRow = this._accessGroup.findFirstRow("ID == " + accessGroupID);
		if (delRow) {
			this._accessGroup.deleteRow(delRow.getIndex());
			this._accessGroup.commit();
		}
	}
	
	DataManager.prototype.getAccessGroupName = function(accessGroupID) {
		var accessGroupInfo = this._accessGroupMap.get(parseInt(accessGroupID, 10));
		if (accessGroupInfo) {
			return accessGroupInfo.getValue("Name");
		}
		return "---"
	}
	
	DataManager.prototype.setTimezoneSet = function( /* cpr.data.DataSet */ dsTimezoneSet) {
		this._TimezoneSet = dsTimezoneSet;
		return
	}
	
	DataManager.prototype.getTimezoneSet = function() {
		return this._TimezoneSet;
	}
	
	DataManager.prototype.insertTimezone = function(rowTimezone) {
		
		var timezone = this._TimezoneSet.findFirstRow("TimezoneID == " + rowTimezone.TimezoneID);
		
		if (timezone == null) {
			this._TimezoneSet.addRowData(rowTimezone);
			this._TimezoneSet.commit();
		} else {
			this.updateTimezone(timezone);
		}
	}
	
	DataManager.prototype.updateTimezone = function(rowTimezone) {
		var updateRow = this._TimezoneSet.findFirstRow("TimezoneID == " + rowTimezone.TimezoneID);
		if (updateRow) {
			updateRow.setRowData(rowTimezone)
			this._TimezoneSet.commit();
		} else {
			this.insertTimezone(rowTimezone);
		}
	}
	
	DataManager.prototype.deleteTimezone = function(timezoneID) {
		var delRow = this._TimezoneSet.findFirstRow("TimezoneID == " + timezoneID);
		if (delRow) {
			this._TimezoneSet.deleteRow(delRow.getIndex());
			this._TimezoneSet.commit();
		}
	}
	
	DataManager.prototype.setAccessArea = function( /* cpr.data.DataSet */ dsAccessArea) {
		this._accessArea = dsAccessArea;
	}
	
	DataManager.prototype.getAccessArea = function() {
		return this._accessArea;
	}
	
	DataManager.prototype.insertAccessArea = function(rowAccessArea) {
		
		var accessArea = this._accessArea.findFirstRow("ID == " + rowAccessArea.ID);
		
		if (accessArea == null) {
			var insertedRow = this._accessArea.addRowData(rowAccessArea);
			this._accessArea.commit();
		} else {
			this.updateAccessArea(rowAccessArea);
		}
	}
	
	DataManager.prototype.updateAccessArea = function(rowAccessArea) {
		var updateRow = this._accessArea.findFirstRow("ID == " + rowAccessArea.ID);
		if (updateRow) {
			updateRow.setRowData(rowAccessArea)
			this._accessArea.commit();
		} else {
			this.insertAccessGroup(rowAccessArea);
		}
	}
	
	DataManager.prototype.deleteAccessArea = function(accessAreaID) {
		var delRow = this._accessArea.findFirstRow("ID == " + accessAreaID);
		if (delRow) {
			this._accessArea.deleteRow(delRow.getIndex());
			this._accessArea.commit();
		}
	}
	
	DataManager.prototype.setAccessAreaGroup = function( /* cpr.data.DataSet */ dsAccessAreaGroup) {
		this._accessAreaGroup = dsAccessAreaGroup;
	}
	
	DataManager.prototype.getAccessAreaGroup = function() {
		return this._accessAreaGroup;
	}
	
	DataManager.prototype.setGroup = function( /* cpr.data.DataSet */ dsGroup) {
		this._group = dsGroup;
		this._groupMap.clear();
		var total = this._group.getRowCount()
		for (var i = 0; i < total; i++) {
			var groupInfo = this._group.getRow(i);
			this._groupMap.set(groupInfo.getValue("GroupID"), groupInfo);
		};
	}
	
	DataManager.prototype.insertGroup = function(rowGroup) {
		
		var existRow = this._groupMap.get(rowGroup.GroupID);
		if (existRow) {
			existRow.setRowData(rowGroup);
		} else {
			existRow = this._group.addRowData(rowGroup);
		}
		
		this._groupMap.set(rowGroup.GroupID, existRow);
	}
	
	DataManager.prototype.updateGroup = function(rowGroup) {
		
		/** @type cpr.data.Row */
		var existRow = this._groupMap.get(rowGroup.GroupID);
		if (existRow) {
			existRow.setRowData(rowGroup);
		}
	}
	
	DataManager.prototype.deleteGroup = function(groupID) {
		var delRow = this._group.findFirstRow("GroupID == " + groupID);
		if (delRow) {
			this._group.deleteRow(delRow.getIndex());
			this._group.commit();
			this._groupMap.delete(groupID)
			console.log(this._group.getRowDataRanged());
		}
	}
	
	DataManager.prototype.getGroup = function() {
		return this._group;
	}
	DataManager.prototype.getMenuList = function() {
		return this._menuAll;
	}
	
	DataManager.prototype.setMenuList = function( /* cpr.data.DataSet */ dsMenu) {
		//		var tree_menu_All = new cpr.controls.Tree("cmb1");
		//
		//		tree_menu_All.setItemSet(dsMenu, {
		//			label: "Name",
		//			value: "MenuID",
		//			parentValue: "ParentID",
		//		});
		this._menuAll = dsMenu;
	}
	
	DataManager.prototype.getGroupName = function(groupID) {
		var groupInfo = this._groupMap.get(parseInt(groupID, 10));
		if (groupInfo) {
			return groupInfo.getValue("Name");
		}
		return "---"
	}
	
	DataManager.prototype.getGroupIDByName = function(groupName) {
	var groupID=0;
		this._groupMap.forEach(function(value, key, map) {
			//console.log(key + " : " + value.getValue("Name"), " : ", groupName);
			if (value.getValue("Name").toString() == groupName) {
				groupID =value.getValue("GroupID"); 
				return groupID; //forEach문은 중간에 멈추지 않습니다.
			}
		});
		return groupID;
	}
	
	DataManager.prototype.setPositionList = function( /* cpr.data.DataSet */ dsPositionList) {
		this._positionList = dsPositionList;
	}
	
	DataManager.prototype.getPositionList = function() {
		return this._positionList;
	}
	
	DataManager.prototype.insertPosition = function(rowPosition) {
		var columns = Object.keys(rowPosition);
		console.log(rowPosition[columns[0]]);
		
		var positions = this._positionList.findFirstRow("PositionID == " + rowPosition[columns[0]]);
		
		if (positions == null) {
			var insertedRow = this._positionList.addRowData(rowPosition);
			this._positionList.commit();
		}
		
	}
	
	DataManager.prototype.updatePosition = function(rowPosition) {
		var updateRow = this._positionList.findFirstRow("PositionID == " + rowPosition.PositionID);
		if (updateRow) {
			updateRow.setRowData(rowPosition)
			this._positionList.commit();
		}
	}
	
	DataManager.prototype.deletePosition = function(positionID) {
		var delRow = this._positionList.findFirstRow("PositionID == " + positionID);
		if (delRow) {
			this._positionList.deleteRow(delRow.getIndex());
			this._positionList.commit();
		}
	}
	
	DataManager.prototype.getPositionName = function(positionID) {
		var positionInfo = this._positionList.findFirstRow("PositionID == " + positionID);
		if (positionInfo) {
			return positionInfo.getValue("Name");
		}
		return "";
	}
	DataManager.prototype.getPositionIDByName = function(positionName) {
		var positionInfo = this._positionList.findFirstRow("Name == '" + positionName + "'");
		if (positionInfo) {
			return positionInfo.getValue("PositionID");
		}
		return "";
	}
	
	DataManager.prototype.setPrivilegeList = function( /* cpr.data.DataSet */ dsPrivilegeList) {
		this._privilegeList = dsPrivilegeList;
		this._privilegeMap.clear();
		var total = this._privilegeList.getRowCount()
		for (var i = 0; i < total; i++) {
			var privilegeInfo = this._privilegeList.getRow(i);
			this._privilegeMap.set(privilegeInfo.getValue("PrivilegeID"), privilegeInfo);
		};
	}
	
	DataManager.prototype.getPrivilegeList = function() {
		return this._privilegeList;
	}
	
	DataManager.prototype.getPrivilegeName = function(privilegeID) {
		var privilegeInfo = this._privilegeMap.get(parseInt(privilegeID, 10));
		if (privilegeInfo) {
			return privilegeInfo.getValue("Name");
		}
		return "---"
	}
	
	DataManager.prototype.insertPrivilege = function(rowPrivilege) {
		
		var privilege = this._privilegeList.findFirstRow("PrivilegeID == " + rowPrivilege.PrivilegeID);
		
		if (privilege == null) {
			var insertedRow = this._privilegeList.addRowData(rowPrivilege);
			this._privilegeList.commit();
			this._privilegeMap.set(rowPrivilege.PrivilegeID, insertedRow);
		} else {
			this.updatePrivilege(rowPrivilege);
		}
	}
	
	DataManager.prototype.updatePrivilege = function(rowPrivilege) {
		var updateRow = this._privilegeList.findFirstRow("PrivilegeID == " + rowPrivilege.PrivilegeID);
		if (updateRow) {
			updateRow.setRowData(rowPrivilege)
			this._privilegeList.commit();
		} else {
			this.insertPrivilege(rowPrivilege);
		}
	}
	
	DataManager.prototype.deletePrivilege = function(privilegeID) {
		var delRow = this._privilegeList.findFirstRow("PrivilegeID == " + privilegeID);
		if (delRow) {
			this._privilegeList.deleteRow(delRow.getIndex());
			this._privilegeList.commit();
			this._privilegeMap.delete(privilegeID);
		}
	}
	
	DataManager.prototype.insertUserMessage = function(rowUserMessage) {
		
		var userMessage = this._userMessageList.findFirstRow("MessageID == " + rowUserMessage.MessageID);
		
		if (userMessage == null) {
			var insertedRow = this._userMessageList.addRowData(rowUserMessage);
			this._userMessageList.commit();
		} else {
			this.updateUserMessage(rowUserMessage);
		}
	}
	
	DataManager.prototype.updateUserMessage = function(rowUserMessage) {
		var updateRow = this._userMessageList.findFirstRow("MessageID == " + rowUserMessage.MessageID);
		if (updateRow) {
			updateRow.setRowData(rowUserMessage)
			this._userMessageList.commit();
		} else {
			this.insertUserMessage(rowUserMessage);
		}
	}
	
	DataManager.prototype.deleteUserMessage = function(messageID) {
		var delRow = this._userMessageList.findFirstRow("MessageID == " + messageID);
		if (delRow) {
			this._userMessageList.deleteRow(delRow.getIndex());
			this._userMessageList.commit();
		}
	}
	
	DataManager.prototype.setTnaTypeList = function( /* cpr.data.DataSet */ dsTnaTypeList) {
		this._tnaTypeList = dsTnaTypeList;
	}
	
	DataManager.prototype.getTnaTypeList = function() {
		return this._tnaTypeList;
	}
	
	DataManager.prototype.insertTnaTypeList = function(dsTnaType) {
		var tnaType = this._tnaTypeList.findFirstRow("Code == " + dsTnaType.Code);
		if (tnaType == null) {
			// insert
			//var row IDataRow;
			// row.setRowData({"Code": dsTnaType.Code, "Name": dsTnaType.Name})
			this._tnaTypeList.addRowData(dsTnaType);
			this._tnaTypeList.commit();
		} else {
			this.updateTnaTypeList(dsTnaType);
		}
		
	}
	
	DataManager.prototype.updateTnaTypeList = function(dsTnaType) {
		var tnaType = this._tnaTypeList.findFirstRow("Code == " + dsTnaType.Code);
		if (tnaType) {
			tnaType.setRowData(dsTnaType);
			this._tnaTypeList.commit();
		} else {
			this.insertTnaTypeList(dsTnaType);
		}
	}
	
	DataManager.prototype.deleteTnaTypeList = function(dsTnaType) {
		var tnaType = this._tnaTypeList.findFirstRow("Code == " + dsTnaType.Code);
		if (tnaType) {
			this._tnaTypeList.deleteRow(tnaType.getIndex());
			this._tnaTypeList.commit();
		}
	}
	
	DataManager.prototype.setMealList = function( /* cpr.data.DataSet */ dsMealList) {
		this._mealList = dsMealList;
	}
	
	DataManager.prototype.getMealList = function() {
		return this._mealList;
	}
	
	DataManager.prototype.insertMeal = function(rowMeal) {
		var mealInfo = this._mealList.findFirstRow("Code == " + rowMeal.Code);
		if (mealInfo == null) {
			var insertedRow = this._mealList.addRowData(rowMeal);
			this._mealList.commit();
		} else {
			this.updateMeal(rowMeal)
		}
	}
	
	DataManager.prototype.updateMeal = function(rowMeal) {
		var mealInfo = this._mealList.findFirstRow("Code == " + rowMeal.Code);
		if (mealInfo == null) {
			this.insertMeal(rowMeal);
		} else {
			mealInfo.setRowData(rowMeal);
			this._mealList.commit();
		}
	}
	
	DataManager.prototype.deleteMeal = function(mealCode) {
		var delRow = this._mealList.findFirstRow("Code == '" + mealCode + "'");
		if (delRow) {
			this._mealList.deleteRow(delRow.getIndex());
			this._mealList.commit();
		}
	}
	
	DataManager.prototype.setUserMessageList = function( /* cpr.data.DataSet */ dsUserMessageList) {
		this._userMessageList = dsUserMessageList;
	}
	
	DataManager.prototype.getUserMessageList = function() {
		return this._userMessageList;
	}
	
	DataManager.prototype.setPaymentList = function( /* cpr.data.DataSet */ dsPaymentList) {
		this._paymentList = dsPaymentList;
	}
	
	DataManager.prototype.getPaymentList = function() {
		return this._paymentList;
	}
	
	DataManager.prototype.setTaskInfo = function(taskList) {
		
		if (this._taskList != null) {
			this._taskList = null;
		}
		this._taskList = taskList;
	}
	
	DataManager.prototype.getTaskList = function() {
		return this._taskList;
	}
	
	DataManager.prototype.setLanguageType = function( /* cpr.data.DataMap */ languageType) {
		this._languageType = languageType;
	}
	
	DataManager.prototype.getLanguageType = function() {
		return this._languageType;
	}
	
	DataManager.prototype.setSystemInfo = function( /* cpr.data.DataMap */ system) {
		this._systemInfo = system;
	}
	
	DataManager.prototype.getSystemInfo = function() {
		return this._systemInfo;
	}
	
	DataManager.prototype.getSystemBrandType = function() {
		return this._systemInfo.getValue("BrandType");
	}
	
	DataManager.prototype.getSystemVersion = function() {
		return this._systemInfo.getValue("Version");
	}
	
	DataManager.prototype.getSystemData = function(column) {
		return this._systemInfo.getValue(column);
	}
	
	DataManager.prototype.getNSH_DEV_CODE = function() {
		return this.NSH_DEV_CODE;
	}
	
	DataManager.prototype.getENABLE_MCP040 = function() {
		return this.ENABLE_MCP040;
	}
	
	DataManager.prototype.setENABLE_MCP040 = function(enable) {
		this.ENABLE_MCP040 = enable;
	}
	
	DataManager.prototype.getENABLE_INNODEP_VMS = function() {
		return this.ENABLE_INNODEP_VMS;
	}
	
	DataManager.prototype.setENABLE_INNODEP_VMS = function(enable) {
		this.ENABLE_INNODEP_VMS = enable;
	}
	
	DataManager.prototype.getENABLE_MULTIVIEW = function() {
		return this.ENABLE_MULTIVIEW;
	}
	
	DataManager.prototype.setENABLE_MULTIVIEW = function(enable) {
		this.ENABLE_MULTIVIEW = enable;
	}
	
	DataManager.prototype.getSystemLicenseLevel = function() {
		return this._systemInfo.getValue("LicenseLevel");
	}
	
	DataManager.prototype.getSystemHTTPSFlag = function() {
		
		return this._systemInfo.getValue("HTTPSFlag");
	}
	
	DataManager.prototype.getTimezoneVersion = function() {
		return this._systemInfo.getValue("TimezoneVersion");
	}
	
	DataManager.prototype.setClientOption = function( /* cpr.data.DataSet */ Option) {
		//console.log(Option.getDatas());
		this._ClientOption = Option;
		return;
	}
	
	DataManager.prototype.getClientOption = function() {
		return this._ClientOption;
	}
	
	DataManager.prototype.getTemperatureUnit = function() {
		return this._ClientOption.getValue("TemperatureUnit");
	}
	
	DataManager.prototype.getTemperatureErrorNotify = function() {
		return this._ClientOption.getValue("TemperatureErrorNotify");
	}
	
	DataManager.prototype.setDeleteItemMenuID = function() {
		this._deleteItemMenuID = new Array(83886082, 117440514, 436207617, 452984834, 436207616, 369098755, 2130706436, 2130706452, 2130706457, 486539264,
			486539265, 167772162, 218103810, 218103811, 234881028, 234881029);
	}
	
	DataManager.prototype.getDeleteItemMenuID = function() {
		return this._deleteItemMenuID;
	}
	
	DataManager.prototype.setOemVersion = function(oemVersion) {
		this._oemVersion = oemVersion;		
		return;
	}
	
	DataManager.prototype.getOemVersion = function() {
		var strVersion;
		if (this._oemVersion != null) {
			strVersion = this._oemVersion.toString();
		}
		return strVersion;
	}
	
	DataManager.prototype.setDeviceServerVersion = function(deviceVersion) {
		this._deviceVersion = deviceVersion;
		return;
	}
	
	DataManager.prototype.getDeviceServerVersion = function() {
		return this._deviceVersion;
	}
	
	DataManager.prototype.getMobileCardVersion = function() {
		return this._systemInfo.getValue("MobileCardVersion");	
	}
	
	//for 모바일 페이지 - 황재현
	DataManager.prototype.getWebsocket = function() {
		return this._webSocket;
	}
	
	// 승인자 정보 get/set 함수 OEM_AMRM_HQ
	DataManager.prototype.setApprover = function(approver) {
		this._approver = approver;
		return;
	}
	
	DataManager.prototype.getApprover = function() {
		return this._approver;
	}
	
	// MainControl, DoorControl get/set 함수 OEM_AMRM_HQ
	DataManager.prototype.setUserInfoARMHQ = function(userInfoARMHQ) {
		this._userInfoARMHQ = userInfoARMHQ;
		return;
	}
	
	DataManager.prototype.getUserInfoARMHQ = function() {
		return this._userInfoARMHQ;
	}
	
	DataManager.prototype.setLoginUserGroups = function(loginUserGroups) {
		this._loginUserGroups = loginUserGroups;
		return;
	}
	
	DataManager.prototype.getLoginUserGroups = function() {
		return this._loginUserGroups;
	}
	
	DataManager.prototype.connectServer = function(address, uid, uuid, onClose, onError, onMessage) {
		if ("WebSocket" in window) {
			try {
				var httpsFlag = this._systemInfo.getValue("HTTPSFlag");
				console.log("httpsFlag : " + httpsFlag);
				if (httpsFlag == 0) {
					this._webSocket = new WebSocket("ws://" + address + "/v1/webEntry");
				} else {
					this._webSocket = new WebSocket("wss://" + address + "/v1/webEntry");
				}
				
				this._webSocket.onopen = function(message) {
					this.send('{"msgId":"1000","body":{"UserId":"' + uid + '","Password":"' + uuid + '"}}');
				};
				
				this._webSocket.onclose = function(message) {
					console.log("message", message.code);
					onClose(message);
				};
				
				this._webSocket.onerror = function(message) {
					console.log(message);
					onError(message);
				};
				
				this._webSocket.onmessage = function(message) {
					onMessage(message);
				}
			} catch (exception) {
				console.error(exception);
			}
		} else {
			// The browser doesn't support WebSocket
			alert("WebSocket NOT supported by your Browser!");
		}
		
	}
	
	DataManager.prototype.setValueVMS = function(key, value) {
		this._vmsInfos.set(key, value);
		return;
	}
	
	DataManager.prototype.getValueVMS = function(key) {
		return this._vmsInfos.get(key);
	}
	
	//hcsm company
	DataManager.prototype.setCompanyList = function( /* cpr.data.DataSet */ dsData) {
		this._company = dsData;
		this._companyMap.clear();
		var total = this._company.getRowCount();
		for (var i = 0; i < total; i++) {
			var companyInfo = this._company.getRow(i);
			this._companyMap.set(companyInfo.getValue("CompanyID"), companyInfo);
		};
	}
	
	DataManager.prototype.getCompanyList = function() {
		return this._company;
	}
	
	DataManager.prototype.getCompany = function(companyID) {
		var companyInfo = this._companyMap.get(companyID);
		return companyInfo;
	}
	
	DataManager.prototype.insertCompany = function(rowCompany) {
		if (this._company == null) {
			return;
		}
		var company = this._company.findFirstRow("CompanyID == " + rowCompany.CompanyID);
		
		if (company == null) {
			var insertedRow = this._company.addRowData(rowCompany);
			this._company.commit();
			this._companyMap.set(rowCompany.CompanyID, insertedRow);
		} else {
			this.updateCompany(rowCompany);
		}
	}
	
	DataManager.prototype.updateCompany = function(rowCompany) {
		
		if (this._company == null) {
			return;
		}
		var updateRow = this._company.findFirstRow("CompanyID == " + rowCompany.CompanyID);
		if (updateRow) {
			updateRow.setRowData(rowCompany)
			this._company.commit();
			this._companyMap.set(rowCompany.CompanyID, updateRow);
		} else {
			this.insertCompany(rowCompany);
		}
	}
	
	DataManager.prototype.deleteCompany = function(companyID) {
		if (this._company == null) {
			return;
		}
		var delRow = this._company.findFirstRow("CompanyID == " + companyID);
		if (delRow) {
			this._company.deleteRow(delRow.getIndex());
			this._company.commit();
			this._companyMap.delete(companyID);
		}
	}
	
	//hcsm team
	DataManager.prototype.setTeamList = function( /* cpr.data.DataSet */ dsData) {
		this._team = dsData;
		this._teamMap.clear();
		var total = this._team.getRowCount();
		for (var i = 0; i < total; i++) {
			var teamInfo = this._team.getRow(i);
			this._teamMap.set(teamInfo.getValue("TeamID"), teamInfo);
		};
	}
	
	DataManager.prototype.getTeamList = function() {
		return this._team;
	}
	
	DataManager.prototype.getTeam = function(teamID) {
		var teamInfo = this._teamMap.get(teamID);
		return teamInfo;
	}
	
	DataManager.prototype.insertTeam = function(rowTeam) {
		if (this._team == null) {
			return;
		}
		var team = this._team.findFirstRow("TeamID == " + rowTeam.TeamID);
		
		if (team == null) {
			var insertedRow = this._team.addRowData(rowTeam);
			this._team.commit();
			this._teamMap.set(rowTeam.TeamID, insertedRow);
		} else {
			this.updateTeam(rowTeam);
		}
	}
	
	DataManager.prototype.updateTeam = function(rowTeam) {
		
		if (this._team == null) {
			return;
		}
		var updateRow = this._team.findFirstRow("TeamID == " + rowTeam.TeamID);
		if (updateRow) {
			updateRow.setRowData(rowTeam);
			this._team.commit();
			this._teamMap.set(rowTeam.TeamID, updateRow);
		} else {
			this.insertTeam(rowTeam);
		}
	}
	
	DataManager.prototype.deleteTeam = function(teamID) {
		if (this._team == null) {
			return;
		}
		var delRow = this._team.findFirstRow("TeamID == " + teamID);
		if (delRow) {
			this._team.deleteRow(delRow.getIndex());
			this._team.commit();
			this._teamMap.delete(teamID);
		}
	}
	
	//hcsm part
	DataManager.prototype.setPartList = function( /* cpr.data.DataSet */ dsData) {
		this._part = dsData;
		this._partMap.clear();
		var total = this._part.getRowCount();
		for (var i = 0; i < total; i++) {
			var partInfo = this._part.getRow(i);
			this._partMap.set(partInfo.getValue("PartID"), partInfo);
		};
	}
	
	DataManager.prototype.getPartList = function() {
		return this._part;
	}
	
	DataManager.prototype.getPart = function(partID) {
		var partInfo = this._partMap.get(partID);
		return partInfo;
	}
	
	DataManager.prototype.insertPart = function(rowPart) {
		if (this._part == null) {
			return;
		}
		var part = this._part.findFirstRow("PartID == " + rowPart.PartID);
		
		if (part == null) {
			var insertedRow = this._part.addRowData(rowPart);
			this._part.commit();
			this._partMap.set(rowPart.PartID, insertedRow);
		} else {
			this.updatePart(rowPart);
		}
	}
	
	DataManager.prototype.updatePart = function(rowPart) {
		
		if (this._part == null) {
			return;
		}
		var updateRow = this._part.findFirstRow("PartID == " + rowPart.PartID);
		if (updateRow) {
			updateRow.setRowData(rowPart)
			this._part.commit();
			this._partMap.set(rowPart.PartID, updateRow);
		} else {
			this.insertPart(rowPart);
		}
	}
	
	DataManager.prototype.deletePart = function(partID) {
		if (this._part == null) {
			return;
		}
		var delRow = this._part.findFirstRow("PartID == " + partID);
		if (delRow) {
			this._part.deleteRow(delRow.getIndex());
			this._part.commit();
			this._partMap.delete(partID);
		}
	}
	
	//hcsm nationality
	DataManager.prototype.setNationalityList = function( /* cpr.data.DataSet */ dsData) {
		this._nationality = dsData;
		this._nationalityMap.clear();
		var total = this._nationality.getRowCount()
		for (var i = 0; i < total; i++) {
			var nationalityInfo = this._nationality.getRow(i);
			this._nationalityMap.set(nationalityInfo.getValue("NationalityID"), nationalityInfo);
		};
	}
	
	DataManager.prototype.getNationalityList = function() {
		return this._nationality;
	}
	
	DataManager.prototype.getNationality = function(NationalityID) {
		var nationalityInfo = this._nationalityMap.get(NationalityID);
		return nationalityInfo;
	}
	
	DataManager.prototype.insertNationality = function(rowNationality) {
		if (this._nationality == null) {
			return;
		}
		var nationality = this._nationality.findFirstRow("NationalityID == " + rowNationality.NationalityID);
		
		if (nationality == null) {
			var insertedRow = this._nationality.addRowData(rowNationality);
			this._nationality.commit();
			this._nationalityMap.set(rowNationality.NationalityID, insertedRow);
		} else {
			this.updateCompany(rowNationality);
		}
	}
	
	DataManager.prototype.updateNationality = function(rowNationality) {
		
		if (this._nationality == null) {
			return;
		}
		var updateRow = this._nationality.findFirstRow("NationalityID == " + rowNationality.NationalityID);
		if (updateRow) {
			updateRow.setRowData(rowNationality)
			this._nationality.commit();
			this._nationalityMap.set(rowNationality.NationalityID, updateRow);
		} else {
			this.insertCompany(rowNationality);
		}
	}
	
	DataManager.prototype.deleteNationality = function(NationalityID) {
		if (this._nationality == null) {
			return;
		}
		var delRow = this._nationality.findFirstRow("NationalityID == " + NationalityID);
		if (delRow) {
			this._nationality.deleteRow(delRow.getIndex());
			this._nationality.commit();
			this._nationalityMap.delete(NationalityID);
		}
	}
	
	//hcsm bloodtype
	DataManager.prototype.setBloodTypeList = function( /* cpr.data.DataSet */ dsData) {
		this._bloodType = dsData;
		this._bloodTypeMap.clear();
		var total = this._bloodType.getRowCount();
		for (var i = 0; i < total; i++) {
			var _bloodTypeInfo = this._bloodType.getRow(i);
			this._bloodTypeMap.set(_bloodTypeInfo.getValue("BloodID"), _bloodTypeInfo);
		};
	}
	
	DataManager.prototype.getBloodTypeList = function() {
		return this._bloodType;
	}
	
	DataManager.prototype.getBloodType = function(bloodID) {
		var bloodTypeInfo = this._bloodTypeMap.get(bloodID);
		return bloodTypeInfo;
	}
	
	DataManager.prototype.insertBloodType = function(rowBloodType) {
		if (this._bloodType == null) {
			return;
		}
		var bloodType = this._company.findFirstRow("BloodID == " + rowBloodType.BloodID);
		
		if (bloodType == null) {
			var insertedRow = this._bloodType.addRowData(rowBloodType);
			this._bloodType.commit();
			this._bloodTypeMap.set(rowBloodType.BloodID, insertedRow);
		} else {
			this.updateBloodType(rowBloodType);
		}
	}
	
	DataManager.prototype.updateBloodType = function(rowBloodType) {
		
		if (this._bloodType == null) {
			return;
		}
		var updateRow = this._bloodType.findFirstRow("BloodID == " + rowBloodType.BloodID);
		if (updateRow) {
			updateRow.setRowData(rowBloodType)
			this._bloodType.commit();
			this._bloodTypeMap.set(rowBloodType.BloodID, updateRow);
		} else {
			this.insertCompany(rowBloodType);
		}
	}
	
	DataManager.prototype.deleteBloodType = function(bloodID) {
		if (this._bloodType == null) {
			return;
		}
		var delRow = this._company.findFirstRow("BloodID == " + bloodID);
		if (delRow) {
			this._bloodType.deleteRow(delRow.getIndex());
			this._bloodType.commit();
			this._bloodTypeMap.delete(bloodID);
		}
	}
	
	// OEM_MOTORCYCLE_PARK -->
	DataManager.prototype.setInfoListBPARK = function( /* cpr.data.DataSet */ dsData) {
		this._bparkInfo = dsData;
		this._bparkInfoMap.clear();
		var total = this._bparkInfo.getRowCount();
		for (var i = 0; i < total; i++) {
			var bparkInfo = this._bparkInfo.getRow(i);
			this._bparkInfoMap.set(bparkInfo.getValue("IndexKey"), bparkInfo);
		};
	}
	
	DataManager.prototype.getInfoListBPARK = function() {
		return this._bparkInfo;
	}
	
	DataManager.prototype.setValListBPARK = function( /* cpr.data.DataSet */ dsData) {
		this._bparkVal = dsData;
		this._bparkValMap.clear();
		var total = this._bparkVal.getRowCount();
		for (var i = 0; i < total; i++) {
			var bparkVal = this._bparkVal.getRow(i);
			this._bparkValMap.set(bparkVal.getValue("IndexKey"), bparkVal);
		};
	}
	
	DataManager.prototype.getValListBPARK = function() {
		return this._bparkVal;
	}
	
	DataManager.prototype.setOptionPaymentBPARK = function( /* cpr.data.DataMap */ dmData) {
		this._bparkOptionPayment = dmData;
	}
	
	DataManager.prototype.getOptionPaymentBPARK = function() {
		return this._bparkOptionPayment;
	}
	
	// OEM_MOTORCYCLE_PARK --!
	
	// OEM_BOSK_CAPS
	
	DataManager.prototype.setIdteckAcuDeviceList = function( /* cpr.data.DataSet */ dsAcuDevice) {
		this._obcAcuDevice = dsAcuDevice;
		this._obcAcuDeviceMap.clear();
		var total = this._obcAcuDevice.getRowCount()
		for (var i = 0; i < total; i++) {
			var acuDeviceInfo = this._obcAcuDevice.getRow(i);
			this._obcAcuDeviceMap.set(acuDeviceInfo.getValue("ID"), acuDeviceInfo);
		};
		console.log("_obcAcuDeviceMap");
		console.log(this._obcAcuDeviceMap);
	}
	
	DataManager.prototype.getIdteckAcuDeviceList = function() {
		return this._obcAcuDevice;
	}
	
	DataManager.prototype.getIdteckAcuDevice = function(boardID) {
		var acuDeviceInfo = this._obcAcuDeviceMap.get(boardID);
		return acuDeviceInfo;
	}
	
	DataManager.prototype.addIdteckAcuDevice = function(rowAcuDevice) {
		if (this._obcAcuDevice == null) {
			return;
		}
		var acuDevices = this._obcAcuDevice.findFirstRow("BoardID == " + rowAcuDevice.BoardID);
		
		if (acuDevices == null) {
			var insertedRow = this._obcAcuDevice.addRowData(rowAcuDevice);
			this._obcAcuDevice.commit();
			this._obcAcuDeviceMap.set(rowAcuDevice.BoardID, insertedRow);
		} else {
			this.updateTerminal(rowAcuDevice);
		}
	}
	
	DataManager.prototype.updateIdteckAcuDevice = function(rowAcuDevice) {
		
		if (this._obcAcuDevice == null) {
			return;
		}
		var updateRow = this._obcAcuDevice.findFirstRow("BoardID == " + rowAcuDevice.BoardID);
		if (updateRow) {
			updateRow.setRowData(rowAcuDevice)
			this._obcAcuDevice.commit();
			this._obcAcuDeviceMap.set(rowAcuDevice.BoardID, updateRow);
		} else {
			this.insertTerminal(rowAcuDevice);
		}
	}
		
	DataManager.prototype.deleteIdteckAcuDevice = function(BoardID) {
		if (this._obcAcuDevice == null) {
			return;
		}
		var delRow = this._obcAcuDevice.findFirstRow("BoardID == " + BoardID);
		if (delRow) {
			this._obcAcuDevice.deleteRow(delRow.getIndex());
			this._obcAcuDevice.commit();
			this._obcAcuDeviceMap.delete(BoardID);
		}
	}
	
	// OEM_BOSK_CAPS -- !
	
	// OEM_HYUNDAI_HI
	DataManager.prototype.setPartnerListHDHI = function( /* cpr.data.DataSet */ dsData) {
		this._hdhiPartner = dsData;
		this._hdhiPartnerMap.clear();
		var total = this._hdhiPartner.getRowCount();
		for (var i = 0; i < total; i++) {
			var partnerInfo = this._hdhiPartner.getRow(i);
			this._hdhiPartnerMap.set(partnerInfo.getValue("PartnerID"), partnerInfo);
		};
	}
	
	DataManager.prototype.getPartnerListHDHI = function() {
		return this._hdhiPartner;
	}
	
	DataManager.prototype.getPartnerInfo = function(partnerID) {
		var partnerInfo = this._hdhiPartnerMap.get(partnerID);
		return partnerInfo;
	}
	
	DataManager.prototype.setRelationDeptListHDHI = function( /* cpr.data.DataSet */ dsData) {
		this._hdhiRelationDept = dsData;
		this._hdhiRelationDeptMap.clear();
		var total = this._hdhiRelationDept.getRowCount();
		for (var i = 0; i < total; i++) {
			var relationInfo = this._hdhiRelationDept.getRow(i);
			this._hdhiRelationDeptMap.set(relationInfo.getValue("GroupID"), relationInfo);
		};
	}
	
	DataManager.prototype.getRelationDeptListHDHI = function() {
		return this._hdhiRelationDept;
	}
	
	DataManager.prototype.getRelationDeptInfoHDHI = function(groupID) {
		var relationInfo = this._hdhiRelationDeptMap.get(groupID);
		return relationInfo;
	}
	
	// OEM_HYUNDAI_HI --!
	
	globals.getDataManager = function() {
		if (_dataManager == null)
			_dataManager = new DataManager();
		
		return _dataManager;
	}
	
	// OEM_ITONE_TRDATA , OEM_ITONE_POSCODX
	DataManager.prototype.setItoneFieldInfo = function( /* cpr.data.DataMap */ fieldInfo) {
		this._itoneFieldInfo = fieldInfo;
	}
	DataManager.prototype.getItoneFieldInfo = function () {
		return this._itoneFieldInfo;
	}
	
	DataManager.prototype.getXkeyLicStatus = function() {
		return this._xkeyLicStatus;
	}
	
	DataManager.prototype.setXkeyLicStatus = function(status) {
		this._xkeyLicStatus = status;
	}
	// OEM_VIETNAM_INTEG_CONTROL
	DataManager.prototype.setEnrolledTerminalListVIC = function( /* cpr.data.DataSet */ dsData) {
		this._vicEnrolledTerminals = dsData;
		this._vicEnrolledTerminalMap.clear();
		var total = this._vicEnrolledTerminals.getRowCount();
		for (var i = 0; i < total; i++) {
			var vicEnrolledTerminal = this._vicEnrolledTerminals.getRow(i);
			this._vicEnrolledTerminalMap.set(vicEnrolledTerminal.getValue("ID"), vicEnrolledTerminal);
		};
	}
	
	DataManager.prototype.getEnrolledTerminalListVIC = function() {
		return this._vicEnrolledTerminals;
	}
	
	
	DataManager.prototype.getEnrolledTerminalInfo = function(terminalID) {
		var vicEnrolledTerminal = this._vicEnrolledTerminalMap.get(terminalID);
		return vicEnrolledTerminal;
	}
	
	DataManager.prototype.getTerminalJsonVersion = function() {
		return this._systemInfo.getValue("TerminalJsonVersion");
	}
	
	DataManager.prototype.setTerminalCCTVList_VIC = function( /* cpr.data.DataSet */ dsData) {
		this._vicCCTVList = dsData;
		this._vicTerminalCCTVMap.clear();
		var total = this._vicCCTVList.getRowCount();
		for (var i = 0; i < total; i++) {
			var vicCCTVInfo = this._vicCCTVList.getRow(i);
			this._vicTerminalCCTVMap.set(vicCCTVInfo.getValue("TerminalID"), vicCCTVInfo);
		};
	}
	

	DataManager.prototype.getTerminalCCTVInfo_VIC = function(terminalID) {
		var cctvInfo = this._vicTerminalCCTVMap.get(terminalID);
		return cctvInfo;
	}
	
	/** OEM_REMOTE_FAW_MANAGEMENT
	 * isAuth = ture 일 때는 유사얼굴체크용 단말기 리스트 반환
	 * isAuth = false 일 때는 유사얼굴체크용 단말기를 제외한 리스트 반환
	 */
	DataManager.prototype.getAuthTerminalList = function(/*boolean*/isAuth) {
		var dsTList = new cpr.data.DataSet("ds1");
		dsTList.parseData({
			"columns": [
				{"name": "ID", "dataType": "number"},
				{"name": "Name", "dataType": "string"},
				{"name": "Status", "dataType": "number"},
				{"name": "GroupCode", "dataType": "number"},
				{"name": "Type", "dataType": "number"},
				{"name": "TimezoneVersion", "dataType": "number"},
				{"name": "RemoteDoor", "dataType": "number"},
				{"name": "IPAddress", "dataType": "string"},
				{"name": "CoreFlag", "dataType": "number"},
				{"name": "UseAuth", "dataType": "number"}
			]
		});
		
		if (isAuth){
			this._terminal.copyToDataSet(dsTList, "UseAuth == 1");
		} else {
			this._terminal.copyToDataSet(dsTList, "UseAuth != 1");
		}
		
		return dsTList;
	}
}