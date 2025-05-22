/************************************************
 * define.module.js
 * Created at 2018. 11. 26. 오전 10:00:50.
 *
 * @author fois
 ************************************************/
globals.BRAND_NITGEN = 0
globals.BRAND_VRIDI = 1

globals.OEM_NORMAL = "0" 		 		// 일반
globals.OEM_JAWOONDAE = "1" 	 		// 자운대
globals.OEM_INNODEP = "2"		 		// 이노뎁
globals.OEM_NH_EDU = "3"				// 농협
globals.OEM_ND_POWER_PLANT = "4" 		// 남동발전소
globals.OEM_SS_HOSPITAL = "5"			// 서울삼성병원
globals.OEM_DUKYANG_WARDOFFICE = "6"	// 덕양구청
globals.OEM_KANGWONLAND ="8"			// 강원랜드
globals.OEM_MCP040 = "9"				// MCP040 버젼
globals.OEM_ARMY_HQ = "10"				// 육군본부
globals.OEM_BLUEHOUSE_KR = "14"			//청와대 1차 - 2차
globals.OEM_MOTORCYCLE_PARK = "15"		// 오토바이 관제
globals.OEM_LOTTE_CS = "13" 			//롯데칠성
globals.OEM_DJMCITYHALL = "16" //대전시청
globals.OEM_LOTTE_OSIRIA = "19" 		//롯데 오시리아
globals.OEM_HE_CHUNGJU_FACTORY = "20"   // 현대 엘리베이터 충주공장. 센스 스튜디오, 센스 타임 단말기 연동
globals.OEM_HC_SAUDI_MARJAN = "22"		// 현대건설 - 사우디 마잔향
globals.OEM_NEC             = "23"   // 선관위 NEC
globals.OEM_Elca               = "24"   // 아르헨티나 Elca향. 사용자 이중 인증 기능. 경비원 인증 + 사용자 인증이 되어야 최종 인증 성공.
globals.OEM_DLI_QATAR_RQ = "25"
globals.OEM_HYUNDAI_MSEAT = "26"   // 현대 엠시트. 방문신청 일부 수정, 인사연동, LPR 연동
globals.OEM_VMS_IDIS_WORK_AUTHLOG = "27" // 아이디스 출근기록 로그 현황 창 추가
globals.OEM_OMAN_TERMINAL_UPDATEUSER = "28"   // 단말기에 다운로드 후 단말기에서 업데이트 된 사용자 구분
globals.OEM_MCD_TRDATA = "29"   // 맥도날드. 사용자 관리-인사 정보 수동 동기화 추가 
globals.OEM_INDO_BNP_CNP = "30"
globals.OEM_UMS_QRCODE = "32" // 태국 UMS Qrcode 인증 시 위도 / 경도 보이도록 추가 작업요청
globals.OEM_LOTTE_FC           = "33"
globals.OEM_PHILIPPINES_ELEVATOR = "35" // 필리핀. 사용자 개인별 elevator 출입층 설정 기능 추가
globals.OEM_KYOCERA = "36" // kyocera향. 출입그룹과 그룹 연동
globals.OEM_VICTORYARCH = "37" // VictoryArch향. 시스템 로그 상세화 작업 
globals.OEM_DMCC_NOPICTURE = "39" // DMCC_ Master외 다른 사용자는 사용자 프로필 볼 수 없도록 처리
globals.OEM_ORTUS_ADANI = "40" // ORTUS ADANI향. 이벤트로그 단말기이름 보이게, 블랙리스트 사용자메세지 기능
globals.OEM_SMART_BUILDING = "42" // 스마트빌딩
globals.OEM_YEMEN = "46" // YEMEN 근태처리 실제초과근무시간 표기

globals.OEM_BEST_ALLIANCE = "43" // 태국 Best Alliace 사용자 정보에서 일부 명칭 변경
globals.OEM_INDO_MAURITIUS = "48" // 인도 모리셔스 _인증로그 내보내기 '부서' 추가

globals.OEM_BOSK_CAPS = "50" // boskCaps acu장비연동

// Innodep 세부 custom option
globals.OEM_INNODEP_NOCUSTOM = "0"
globals.OEM_INNODEP_PHCITYHALL = "1"

globals.OEM_3D_NORMAL = 10000 + parseInt(globals.OEM_NORMAL, 10) + ""   // 3D 전시회
//globals.OEM_ITONE_TRDATA = "53" // 아이티원

globals.OEM_HANAMICRON_EXDB_WORKTIME = "54" // 베트남 EXDB 출/퇴근 기능만 전송 기능 추가, 근태타입 단말기 인증기록 조회 추가
globals.OEM_ALMARAI_AUTHINFO = "55"
globals.OEM_HYUNDAI_HI = "56"
globals.OEM_BEST_ALLIANCE_CARD = "57"
globals.OEM_VIETNAM_INTEG_CONTROL = "58"
globals.OEM_IDLINK_MBS = "59"
globals.OEM_DIGIMARK_CSVEXPORT = "60"
globals.OEM_ROKMCH = "61" // 해병대 사령부

globals.OEM_GS_BASIC = "5000" 			// GS 인증용

globals.OEM_INNODEP_NORMAL = 21000 + parseInt(globals.OEM_NORMAL, 10) + ""
globals.OEM_REMOTE_FAW_MANAGEMENT = "6000"

globals.OEM_HYUNDAI_EC = 30000 + 1	// 현대건설, 현대건설:건설공제	

// 현대건설 분할작업
globals.OEM_HDEC_VERSION = "30001"
globals.OEM_HDEC_EC = "30000" // 현대건설
globals.OEM_HDEC_CW = "30001"// 현대건설:건설공제

globals.OEM_MULTI_BUILDING_MAMAGEMENT = "40000"
globals.OEM_MULTI_BUILDING_VERSION = "40000"
globals.OEM_MBM_PH = "40000" // 다중 건물 관리(엘리베이터)
globals.OEM_MBM_MCP = "40001" // 다중 건물 관리(엘리베이터) + MCP040

globals.OEM_ITONE_TRDATA = "50000" // 아이티원 (노말 버전) , 당진 버전과 통합 (삼진아웃 추가)
globals.OEM_ITONE_POSCO_DX = "50001" // 아이티원 포스코 (동기화방식 변경, 멀티협력사)

globals.OEM_MOBILECARD_ALPETA   = "0" // Alpeta 카드 관리 (*현재는 엠시트 전용)
globals.OEM_MOBILECARD_UBIOXKEY = "1" // UBioX-Key 카드 관리 / On-premise or 클라우드 서비스용


globals.LicenseNone = 0
globals.LicenseLITE = 10
globals.LicenseSTANDARD = 20
globals.LicensePREMIUM = 30
globals.LicenseENTERPRISE = 40

globals.ProductAlpeta = 1 // Alpeta만 사용
globals.ProductMobile = 2 // Alpeta + Mobile key
globals.ProductCore = 3 // Alpeta + Core
globals.ProductCoreAndMobile = 4 // Alpeta + Core + Mobile key
 
globals.AuthTypeNone = 0
globals.AuthTypeFingerPrint = 1
globals.AuthTypeCard = 2
globals.AuthTypePassword = 3
globals.AuthTypeFace = 4
globals.AuthTypeMobileCard = 5
globals.AuthTypeIris = 6
//globals.AuthTypeQR = 7
globals.AuthTypeFingerCard = 8
globals.AuthTypeFaceWT = 9

// auth result for auth log
globals.AuthLogResultSuccess         = 0 //성공
globals.AuthLogResultFail            = 1 //인증실패
globals.AuthLogResultAccessDenied    = 2 //접근금지
globals.AuthLogResultTimeout         = 3 //타임아웃
globals.AuthLogResultTimeoutCapture  = 4 //타임아웃 캡쳐
globals.AuthLogResultTimeoutIdentify = 5 //
globals.AuthLogResultAntiPassback    = 6 // 안티패스백
globals.AuthLogResultDuress          = 7 // 협박지문 결과
globals.AuthLogResultBlackList       = 8 // 블랙리스트
	
globals.AuthLogResultInvalidUser     = 10 // 
globals.AuthLogResultCapture         = 11
globals.AuthLogResultDuplicatedAuthentication = 12
	
globals.AuthLogResultNetwork         = 13
globals.AuthLogResultServerBusy      = 14
globals.AuthLogResultFaceDetection   = 15
	
globals.AuthLogResultFailMealPay             = 16 // 식단가 미등록
globals.AuthLogResultFailMealTime            = 17 // 식사시간 불가
globals.AuthLogResultFailNotExistsMealCode   = 18 // 식수코드 미등록
globals.AuthLogResultFailPeriod              = 19 // 식수기간제한
globals.AuthLogResultFailMealLimit           = 20 // 끼니제한
globals.AuthLogResultFailDayLimit            = 21 // 일제한
globals.AuthLogResultFailMonthLimit          = 22 // 월제한
globals.AuthLogResultSoftpassback            = 23
globals.AuthLogResultNoMask                 = 24 //마스크 미착용
globals.AuthLogResultFeverDetection 		= 25 //발열증상감지
globals.AuthLogResultXKeyInvalidMasterKey 	= 26 //모바일 사원증 마스터키 오류
globals.AuthLogResultXKeyInvalidTime 		= 27 //모바일 사원증 시간 동기화 오류
globals.AuthLogResultNormalFail				= 28 //실패
globals.AuthLogResultFailPunch				= 29 //맥도날드 인증순서 오류
globals.AuthLogResultLprChoicePartTimeSystemFail = 120 // 육군본부 선택요일제 위반
globals.AuthLogResultLprFivePartTimeSystemFail = 124 // 육군본부 LPR 5부제 위반
globals.AuthLogResultLprAuthResultFail = 125 // 육군본부 LPR 차량인증실패
globals.AuthLogResultLprAuthResultUnRegist = 126 // 육군본부 LPR 미등록

globals.VisitApprovalNone = 0
globals.VisitApprovalWaiting = 1
globals.VisitApprovalApproved = 2
globals.VisitApprovalDenied = 3
globals.VisitApprovalExpired = 4

globals.VisitorStatusNone = 0
globals.VisitorStatusRegistered = 1
globals.VisitorStatusDeleted= 2
globals.VisitorStatusWaitRegist = 3 // 방문객이 직접 정보를 입력해야 하는 상태
globals.VisitorStatusVisiting   = 4
globals.VisitorStatusVisited    = 5

globals.FaceWTTypeTemplate = 0
globals.FaceWTTypeImage    = 1

globals.MusteringNone = 0
globals.MusteringIn = 1
globals.MusteringOut = 2

globals.ImageTypeJpg = 1;
globals.ImageTypeBmp = 2;
globals.ImageTypePng = 3;
	
globals.CARDNUMSIZE = 24 //카드 레이아웃 데이터 사이즈 

globals.AuthImageDialogLeft = 50; // 인증 이미지 윈도우 창 위치 기본값 
globals.AuthImageDialogTop = 100; // 인증 이미지 윈도우 창 위치 기본값
globals.AuthImageWidth = 300; // 인증 이미지 윈도우 창 위치 기본값 
globals.AuthImageHeight = 360; // 인증 이미지 윈도우 창 위치 기본값
globals.AuthDisplayBoardLeft = 0; // 전광판 메뉴 창 위치 기본값 
globals.AuthDisplayBoardTop = 0; // 전광판 메뉴 창 위치 기본값

globals.WSCmdLogoutNotify = 1002 // 로그아웃 되었음. 다른 곳에서 로그인 한 경우

globals.WSCmdLogAuthNotify = 1100
globals.WSCmdLogEventNotify = 1101
globals.WSCmdTerminalLiveInfo = 1102
globals.WSCmdServiceStatusNotify = 1103
globals.WSCmdAuthLogImageNotify = 1104
globals.WSCmdTerminalNoticeSetNotify = 1105 
globals.WSCmdGroupSyncNotify         = 1106 // 그룹 동기화 알림
globals.WSCmdPositionSyncNotify      = 1107 // 직급 동기화 알림
globals.WSCmdTerminalSyncNotify      = 1108 // 단말기 동기화 알림
globals.WSCmdAccessGroupSyncNotify   = 1109 // 출입그룹 동기화 알림
globals.WSCmdTimezoneSyncNotify 	 = 1110 // 타임존 동기화 알림
globals.WSCmdPrivilegeSyncNotify 	 = 1112 // 권한 동기화 알림
globals.WSCmdUserMessageSyncNotify 	 = 1113 // 사용자 메세지 동기화 알림
globals.WSCmdGroupTerminalSyncNotify		= 1114 // 그룹 터미널 설정 동기화 알림
globals.WSCmdServerOptionSyncNotify			= 1115 // 클라이언트에서 실시간으로 사용할 설정정보 동기화
globals.WSCmdAccessAreaSyncNotify   		= 1116 // 출입구역 동기화 알림
globals.WSCmdTerminalLogUploadNotify		= 1120 // 로그 가져오기 진행 상태
globals.WSCmdElevatorSetNotify		= 1121 // 엘레베이터 설정 정보 동기화
globals.WSCmdWorkTypeSynNotify		= 1122
globals.WSCmdMealInfoSynNotify		= 1123
//globals.WSCmdDisplayBoardAuthLogImageNotify	= 1124 // 전광판 인증로그

globals.WSCmdFPCaptureReq = 2000
globals.WSCmdFPCaptureImageCallback = 2001
globals.WSCmdFPCaptureRes = 2002
globals.WSCmdFPVerifyReq = 2003
globals.WSCmdFPVerifyRes = 2004

globals.WSCmdCardCaptureReq = 2010
globals.WSCmdCardCaptureRes = 2011
globals.WSCmdCardLayoutWritingReq = 2012
globals.WSCmdCardLayoutWritingRes = 2013

globals.WSCmdCardPrintReq = 2014
globals.WSCmdCardPrintRes = 2015

globals.WSCmdDeviceServerVersionReq = 2091 // web -> device // Device Server 버전 요청
globals.WSCmdDeviceServerVersionRes = 2092 // device <- web // Device Server 버전 결과

globals.WSCmdTerminaSearchRes = 2100
globals.WSCmdSetTerminaSearchRes = 2101
globals.WSCmdLogInTimerExtendNotify = 2102


globals.WSCmdRm100CaptureReq = 2103 // web client -> device (rm100) server. 육본카드캡쳐 요청
globals.WSCmdRm100CaptureRes = 2104 // device (rm100) -> web client server. 육본카드캡쳐 결과
globals.WSCmdBoskAcuDeviceLiveInfo = 2105
globals.WSCmdBoskAcuDeviceEventLogNotify = 2106

// 2107은 현재 사용 중 OEM_VIETNAM_INTEG_CONTROL
globals.WSCmdAlmaraiAuthLogImageNotify = 2108

// 단말기 모델 명칭 얻어오기
globals.getTerminalModelString = function( value ){
	
	switch ( value ) {
	//case 1: break;
	case 2: return "NAC 2500";  break;
	case 3: return "NAC 3000";  break;
	case 4: return "NAC 2500 (4MF)";  break;
	//case 5: break;
	case 6: return "NAC 5000"; break;
	//case 7: break;
	//case 8: break;
	case 9: return "NAC 1500";  break;
	//case 10: break;
	//case 11: break;
	//case 12:break;
	//case 13:break;
	//case 14: break;
	//case 15: break;
	//case 16: break;
	//case 17: break;
	case 18: return "T5"; break;
	case 19: return "T3";break;
	case 20: return "T1"; break;
	case 21: return "MCP040"; break; // by nsh
	case 22: return "T9"; break;
	case 23: return "FKA2"; break;
	case 24: return "eNCardi"; break;
	case 25: return "T2"; break;
	case 26: return "UBio-X Slim"; break;
	case 30: return "AC1100"; break;
	case 31: return "AC2000"; break;
	case 32: return "AC2200"; break;
	case 33: return "AC5000"; break;
	case 34: return "AC5100"; break;
	case 35: return "AC7000";break;
	case 36: return "UBio-X Pro Lite"; break;
	case 37: return "UBio-X Pro"; break;
	case 38: return "AC6000"; break;
	case 39: return "UBio Tablet5"; break;
	case 40: return "UBio-X Slim"; break;
	case 41: return "UBio-X Pro 2"; break;
	case 42: return "AC1000"; break;
	case 43: return "UBio-X Iris"; break;
	case 44: return "AC2100 Plus"; break;
	case 45: return "UBio-X Face"; break;
	case 46: return "UBio-X Face Premium"; break; // Premium 추가 otk
	case 47: return "UBio-X Face Pro"; break;
	case 90: return "PDA Device"; break;
	
	}
	
	return;
}

// 단말기 이미지 Src 경로 가져오기
globals.getTerminalModelImageSrc = function( value ){
	
	switch ( value ) {
	//case 1: break;
	case 2: return ""; break;	//"NAC 2500"  
	case 3: return ""; break;	//NAC 3000
	case 4: return ""; break;	//"NAC 2500 (4MF)"
	//case 5: break;
	case 6: return ""; break;	//"NAC 5000"; 
	//case 7: break;	//case 8: break;
	case 9: return ""; break;//"NAC 1500";  
	//case 10: break;	//case 11: break;	//case 12:break;	//case 13:break;
	//case 14: break;	//case 15: break;	//case 16: break;	//case 17: break;
	case 18: return "../../../theme/images/terminals/eNBioAccess-T5.png"; break;//T5"
	case 19: return "../../../theme/images/terminals/eNBioAccess-T3.png"; break;//"T3"
	case 20: return "../../../theme/images/terminals/eNBioAccess-T1.png"; break; //"T1"
	//case 21: break;
	case 22: return "../../../theme/images/terminals/eNBioAccess-T9.png"; break; //T9
	case 23: return "../../../theme/images/terminals/UBio-X_Slim.png"; break; //"FKA2
	case 24: return "../../../theme/images/terminals/eNCardi.png"; break; //eNCardi
	case 25: return "../../../theme/images/terminals/eNBioAccess-T2.png"; break; //T2
	case 26: return "../../../theme/images/terminals/UBio-X_Slim.png"; break; //UBio-X Slim 
	case 30: return "../../../theme/images/terminals/AC1100.png"; break; //AC1100
	case 31: return "../../../theme/images/terminals/AC2000.png"; break; //AC2000
	case 32: return "../../../theme/images/terminals/AC2200&2100.png"; break; //AC2200
	case 33: return "../../../theme/images/terminals/AC5100&5000PLUS.png"; break; //AC5000
	case 34: return "../../../theme/images/terminals/AC5100&5000PLUS.png"; break; //AC5100
	case 35: return "../../../theme/images/terminals/AC7000.png"; break; //AC7000
	case 36: return "../../../theme/images/terminals/UBio-X_Pro.png"; break; //UBio-X Pro Lite
	case 37: return "../../../theme/images/terminals/UBio-X_Pro.png"; break; //UBio-X Pro
	case 38: return "../../../theme/images/terminals/AC6000.png"; break; //AC6000 단종모델
	case 39: return "../../../theme/images/terminals/UBioTablet5.png"; break; //
	case 40: return "../../../theme/images/terminals/UBio-X_Slim.png"; break; //UBio-X_Slim
	case 41: return "../../../theme/images/terminals/UBio-X_Pro.png"; break; //UBio-X Pro2
	case 42: return ""; break; //AC1000
	case 43: return "../../../theme/images/terminals/UBio-X_Iris.png"; break; //UBio-X Iris
	case 44: return "../../../theme/images/terminals/AC2200&2100.png"; break; //AC2100 Plus
	case 45: return "../../../theme/images/terminals/UBio-X_Face.png"; break; //UBio-X Face
	case 46: return "../../../theme/images/terminals/UBio-X_Face_Premium.png"; break; //UBio-X Face Premium
	case 47: return "../../../theme/images/terminals/UBio-X_Face_Pro.png"; break; //UBio-X Face Pro
	case 90: return ""; break; //UBio-X Iris
	case 1000: return ""; break; // OEM_MOTORCYCLE_PARK
	}
	
	return;
}

globals.getAuthTypeString = function( value ){
	switch ( value ){
		case 1: return "FP"; break;
		case 2: return "CD"; break;
		case 3: return "PW"; break;
		case 4: return "FA"; break;
		case 5: return "MC"; break;	
	    case 6: return "IR"; break;
		//case 7: return "QR"; break;
		case 8: return "FPCard"; break; //임시로 제외
		case 9: return "FAW"; break;
		
		// OEM_UMS_QRCODE 향
		// 학번, 위도 경도, 만기 시간 일자 3 가지 인증 타입 추가	- zzik
		case 30: return "StudentID"; break;
		case 31: return "Coordinate"; break;
		case 32: return "ExpiryDatetime"; break;
	
		default : return ""; break;
	}
}

globals.COMERROR_NET_TIMEOUT = -2;
globals.COMERROR_NET_ERROR = -1;
globals.COMERROR_NONE = 0;
globals.COMERROR_USER_NOT_EXIST					= 0x01000002;
globals.COMERROR_REDUPLICATE_UNIQUEID_EXIST		= 0x01000006
globals.COMERROR_REDUPLICATE_UNIQUEID_NOT_EXIST = 0x01000007

// Error define (user)
globals.ERROR_USER_LOGINPASSWORD_EXPIRATION 	= 0x0100000F //(16777231)
globals.ERROR_USER_LOGIN_FAIL_COUNT 			= 0x01000011 //(16777233)
globals.ERROR_RFCARD_DUPLICATE                  = 0x01000013 //(16777235)
/*
 * 다이얼로그 아이디
 */
 
// 전체 메뉴
globals.DLG_MENU_ALL = 0x03000002;

// 사용자
globals.F_USER = 0x05000000;
globals.DLG_USER_MANAGEMENT = 0x05000001;
globals.DLG_USER_INFO = 0x05000002;
globals.DLG_APPROVER_MANAGEMENT = 0x05000003;
globals.DLG_USER_REGIST_STATUS = 0x05000004;
globals.DLG_USER_IMPORT = 0x05000007;
globals.DLG_USER_EXPORT = 0x05000008;
globals.DLG_USER_SELECT = 0x05000009;
globals.DLG_USER_BLACKLIST_MANAGEMENT = 0x0500000A;
globals.DLG_USER_FACEWT_RESYNC = 0x0500000B;
globals.DLG_USER_PICTURE_IMPORT = 0x0500000C;

// 그룹
globals.F_GROUP 				= 0x06000000;
globals.DLG_GROUP_MANAGEMENT 	= 0x06000001;

// 단말기
globals.F_TERMINAL 			= 0x7000000;
globals.DLG_TERMINAL_MANAGEMENT = 0x7000001;
globals.DLG_TERMINAL_INFO = 0x7000002;
globals.DLG_TERMINAL_USERS = 0x7000004;
globals.DLG_TERMINAL_LOG_MANAGEMENT = 0x7000005;
globals.DLG_TERMINAL_FIRMWARE_DOWNLOAD = 0x7000006;
globals.DLG_TERMINAL_ADMIN_SET = 0x7000007;
globals.DLG_TERMINAL_SEARCH = 0x7000008;
globals.DLG_TERMINAL_WORK_PROCESS = 0x7000009;
globals.DLG_TERMINAL_USER_EX = 0x700000A;
globals.DLG_TERMINAL_LIVEVIEW = 0x700000B;
globals.DLG_TERMINAL_REMOTE_INFO = 0x700000C;
globals.DLG_TERMINAL_LOCATION = 0x700000D;

// 타임존
//globals.DLG_TIMEZONE_MANAGEMENT = 0x08000001;
globals.F_TIMEZONE 		= 0x08000000;
globals.DLG_TIMELINE_NITZEN = 0x08000001;
globals.DLG_TIMELINE_VIRDI = 0x08000002;
globals.DLG_TIMELINE_WEEKENDN = 0x08000003;
globals.DLG_TIMELINE_WEEKENDV = 0x08000004;
globals.DLG_HOLIDAY_MANAGEMENT = 0x08000005;

// 출입그룹
globals.F_ACCESSGROUP 			= 0x09000000;
globals.DLG_ACCESSGROUP_MANAGEMENT 	= 0x09000001;
globals.DLG_ACCESSAREA_MANAGEMENT 	= 0x09000002;
globals.DLG_ACCESSGROUP_USER_MANAGEMENT = 0x09000003;
globals.DLG_ACCESSGROUPINFO_TERMINAL_DOWNLOAD = 0x09000004;
globals.DLG_USER_ACCESSGROUP_PRIVILEGE = 0x09000101;

// 인증로그
globals.F_AUTHLOG			 	= 0x0A000000;
globals.DLG_AUTHLOG_MANAGEMENT 	= 0x0A000001;
globals.DLG_AUTHLOG_VIEW 		= 0x0A000002;
globals.DLG_AUTHLOG_VIDEO_VIEW 	= 0x0A000003;
globals.DLG_AUTHLOG_IMPORT 		= 0x0A000004;
globals.DLG_AUTHLOG_EXPORT 		= 0x0A000005;
globals.DLG_AUTHLOG_STATISTICS 	= 0x0A000006;
globals.DLG_AUTHLOG_FAW_IMAGE_VIEW = 0x0A000007;

// 시스템로그
//0x0B000001
globals.F_SYSLOG				= 0x0B000000;
globals.DLG_SYSLOG_MANAGEMENT	= 0x0B000001;
globals.DLG_SYSLOG_VIEW 		= 0x0B000002;
globals.DLG_EVENTLOG_MANAGEMENT = 0x0B000003;
globals.DLG_EVENTLOG_VIEW 		= 0x0B000004;
globals.DLG_ACULOG_MANAGEMENT 	= 0x0B000005;
globals.DLG_ACULOG_VIEW 		= 0x0B000006;
globals.DLG_ACUEVENTLOG_MANAGEMENT 		= 0x0B000007;

// 권한
globals.F_PRIVILEGE 				= 0x0C000000;
globals.DLG_PRIVILEGE_MANAGEMENT 	= 0x0C000001;
globals.DLG_DISPLAYBOARD_MANAGEMENT	= 0x0000000F;


// 모니터링
globals.F_MONITORING = 0x0D000000;
globals.DLG_MONITORING_MANAGEMENT = 0x0D000001;
globals.DLG_MONITORING_TERMINAL = 0x0D000002;
globals.DLG_MONITORING_AUTH_IMAGE = 0x0D000003;
globals.DLG_MONITORING_DISPLAY_BOARD = 0x0D000004; // 전광판

// Antipassback
globals.F_ANTIPASSBACK = 0x0E000000;
globals.DLG_ANTIPASSBACK_MANAGEMENT = 0x0E000001;
globals.DLG_ANTIPASSBACK_AREA_USER = 0x0E000002;
// 현대 사우디 마잔 - sep
globals.DLG_HC_SAUDI_MARJAN_STATUS = 0x0E000003; // 현황표 조회
globals.DLG_HC_SAUDI_MARJAN_STATUS_SUB_CONTRACTOR = 0x0E000004; // 회사별 현황 조회
globals.DLG_HC_SAUDI_MARJAN_STATUS_LABORERS_INFO = 0x0E000005; // 회사 사용자들 상세 조회


// 직급 
globals.F_POSITION			 = 0x0F000000;
globals.DLG_POSITION_MANAGEMENT  = 0x0F000001;

// 공지사항
globals.F_NOTICE				= 0x10000000;
globals.DLG_NOTICE_MANAGEMENT 	= 0x10000001;

// 모바일카드
globals.F_MOBILECARD = 0x11000000;
globals.DLG_MOBILECARD_ISSUE = 0x11000001;
globals.DLG_MOBILECARD_ADMIN_SETTING = 0x11000002;
globals.DLG_MOBILECARD_ADMIN_LOGIN = 0x11000003;
globals.DLG_MOBILECARD_BATCH_ISSUE = 0x11000004;
globals.DLG_MOBILECARD_ISSUE_LIST = 0x11000005;
globals.DLG_MOBILECARD_HISTORY = 0x11000006;
globals.DLG_MOBILECARD_SYNC = 0x11000007;

// 사용자 파일 전송
globals.F_USERS_FILE_SEND = 0x12000000;
globals.DLG_USERS_FILE_SEND = 0x12000001;

// 근태 TODO: 근태관리가 없으므로 차후 추가 해야함
globals.F_TNA 		= 0x13000000;
globals.DLG_TNA_WIZARD  = 0x13000001;
globals.DLG_TNA_SETTING_WORKTIME = 0x13000002;
globals.DLG_TNA_SETTING_WORKTYPE = 0x13000005;
globals.DLG_TNA_SETTING_PAYMENT = 0x13000007;
globals.DLG_TNA_DISPLAY_PERIODRESULT = 0x13000008;

// 식수
globals.F_MEALSERVICE				= 0x14000000;
globals.DLG_MEALSERVICE_MANAGEMENT  = 0x14000001;
globals.DLG_MEALSERVICE_MENU_MANAGEMENT = 0x14000002;
globals.DLG_MEALSERVICE_STATISTICS = 0x14000003;

// 위겐드
globals.F_WIEGAND = 0x15000000;
globals.DLG_WIEGAND_MANAGEMENT = 0x15000001;

// 위치 형상화
globals.F_LOCATION_VISUALIZATION = 0x16000000;
globals.DLG_MAP_MANAGEMENT = 0x16000001;
globals.DLG_MAP_AREA_MANAGEMENT = 0x16000002;
globals.DLG_MAP_AREA_MONITORING = 0x16000003;

// 설정
globals.F_GENERAL_SETTING = 0x17000000;
globals.DLG_GENERAL_SETTING = 0x17000001;

// 다운로드 매니저
globals.F_DOWNLOAD_MANAGER = 0x18000000;
globals.DLG_DOWNLOAD_MANAGER = 0x18000001;

// 사용자 메세지
globals.F_USER_MESSAGE_MANAGEMENT = 0x19000000;
globals.DLG_USER_MESSAGE_MANAGEMENT = 0x19000001;

// 도움말
globals.F_HELP = 0x1A000000;
globals.DLG_HELP = 0x1A000001;

globals.F_CARDLAYOUT_SETTING = 0x1B000000;
globals.DLG_CARDLAYOUT_SETTING = 0x1B000001;
globals.DLG_CARDLAYOUTFORMAT_SETTING = 0x1B000002;

globals.F_INTEGRATED_REPORTING = 0x1C000001;
globals.DLG_INTEGRATED_REPORTING = 0x1C000002;


// 방문객
globals.F_VISITOR_MANAGEMENT = 0x1D000000;
globals.DLG_VISITOR_MANAGE_PRIVILEGE = 0x1D000001;

globals.F_VMS_INNODEP = 0x1E000001;
globals.DLG_VMS_INNODEP = 0x1E000002;

globals.F_ELEVATOR = 0x1F000001;
globals.DLG_ACCESS_FLOOR_MANAGEMENT = 0x1F000002;
globals.DLG_BUILDING_TERMINAL_MANAGEMENT = 0x1F000003;

globals.F_LPRINFO_MANAGEMENT				= 0x20000000 // LPR 일반버전
globals.DLG_LPRINFO_MANAGEMENT              = 0x20000001

globals.F_ROLLCALL_MANAGEMENT				= 0x21000000 // 
globals.DLG_ROLLCALL_MANAGEMENT              = 0x21000001

globals.F_VMS_MANAGEMENT				= 0x22000000 // 
globals.DLG_VMS_MANAGEMENT              = 0x22000001

// MultiView
globals.F_VMS_MultiView = 0x23000000
globals.DLG_VMS_MultiView = 0x23000001

// 기타
globals.DLG_STRING = 0xA0000001;
globals.DLG_COUNTRYCODE = 0xA0000002;
globals.DLG_LICENSE= 0xA0000003;

// OEM 자운대 --> 출입증 관리
globals.F_PASS_MANAGEMENT = 0x7F000001;
globals.DLG_PASS_MANAGEMENT = 0x7F000002;
globals.DLG_PASS_REGIST = 0x7F000003;
globals.DLG_PASS_INFO = 0x7F000004;
globals.DLG_PASS_ISSUANCE_HISTORY = 0x7F000005;

globals.F_VISIT_MANAGEMENT = 0x7F000010;
globals.DLG_VISIT_MANAGEMENT = 0x7F000011;
globals.DLG_VISIT_REQUEST = 0x7F000012;
globals.DLG_VISIT_REQUEST_EXCEL = 0x7F000013;
globals.DLG_VISIT_REQUEST_INFO = 0x7F000014;

globals.F_LPR_MANAGEMENT = 0x7F000015;
globals.DLG_LPR_MANAGEMENT = 0x7F000016;

globals.DLG_BLACKLIST_MANAGEMENT = 0x7F000017;
globals.DLG_ALWAYSTYPE_USER_MENAGEMENT = 0x7F000018;
globals.DLG_AUTHTYPE_LOG_MANAGEMENT =  0x7F000019;
globals.DLG_OUTTROOPS_MANAGEMENT =  0x7F00001A;
globals.DLG_CARINFOLIST_MANAGEMENT =  0x7F00001B;
globals.DLG_OUTTROOPS_IMMEDIATELYISSUE =  0x7F00001C;
globals.DLG_ALWAYSTYPE_CARD_ISSUE =  0x7F00001D;
globals.DLG_WEB_NOTICE_MANAGEMENT =  0x7F00001F;	
globals.DLG_ADMIN_IP_MANAGEMENT = 0x7F000020; //2130706464

globals.ARMYHQ_REFRESH_LOGO = 0xF0000000;

globals.LICENSE_CHECK = "LICCHECK";
globals.XKEY_LICENSE_CHECK = "XKEYLICCHECK";
// --!
// OEM 대전시청
globals.F_DJMCH_EDU_TOP = 0x7F000021;
globals.DLG_DJMCH_EDURESULT_MANAGEMENT = 0x7F000022;
globals.DLG_DJMCH_EDUREGIST_MANAGEMENT = 0x7F000023;
globals.DLG_DJMCH_MEALSTATISTICS_MANAGEMENT = 0x7F000024;
// --!
// OEM 현대건설
globals.DLG_HDEC_HIOS_SETTING = 0x7F000025;
globals.DLG_HDEC_GROUP_AUTH_TYPE_MANAGEMENT = 0x06000101;
// OEM 남동발전소
globals.F_ND_POERPLANT = 0x7F000031;
globals.DLG_VISITOR_MANAGEMENT_ND = 0x7F000032;
globals.DLG_AUTHLOG_VIEW_ND = 0x7F000033;
// --!
// OEM 서울삼성병원
globals.F_SS_HOSPITAL = 0x7F000041;
globals.DLG_SSH_PREPAYMENT = 0x7F000042; 		// 선불 결제
globals.DLG_SSH_PREPAYHISTORY = 0x7F000043;		// 선불 결제 이력 조회
globals.DLG_SSH_BALANCEMANAGEMENT = 0x7F000044; // 잔액 조회
globals.DLG_SSH_PREPAYFILEUPLOAD = 0x7F000045; // 선불 파일업로드
globals.DLG_SSH_HOLIDAYMANAGEMENT = 0x7F000046; // 공휴일 무료식수 설정
globals.DLG_SSH_ADJUSTMENTMANAGEMENT = 0x7F000047; // 공휴일 무료식수 설정
globals.DLG_SSH_USERFILEUPLOADMANAGEMENT = 0x7F000048;
globals.DLG_SSH_USERRFCARDMANAGEMENT = 0x7F000049;
globals.DLG_SSH_PREPAYUSERLOGLIST  = 0x7F00004A; // 선불결제가 전체 이력 검색
// OEM 강원랜드
globals.DLG_KWL_MEALCLSCODEMANAGEMENT  = 0x7F00004B; // 선불결제가 전체 이력 검색
globals.DLG_KWL_VISITREQUESTMANAGEMENT = 0x7F00004C;
globals.DLG_KWL_EMERGENCYGROUPMANAGEMENT = 0x7F00004D;
globals.DLG_KWL_DORMITORYMANAGEMENT = 0x7F00004F;
// OEM 육군본부 출입통제 ---->
globals.F_ARMYHQ_ACCESS_APPLICATION = 0x7F000060;
globals.DLG_ARMYHQ_ACCESS_APPLICATION_MANAGEMENT = 0x7F000061;
globals.DLG_ARMYHQ_ACCESS_APPLICATION_APPROVAL = 0x7F000062;
globals.DLG_ARMYHQ_ACCESS_CARD_MANAGEMENT = 0x7F000063;
globals.DLG_ARMYHQ_UNIT_CAR_INFOMATION_MANAGEMENT = 0x7F000067;
globals.DLG_ARMYHQ_ACCESS_APPLICATION_MANAGEMENT_EXCEL = 0x7F000068;
globals.F_ARMYHQ_VISIT_APPLICATION = 0x7F000070;
globals.DLG_ARMYHQ_VISIT_APPLICATION_MANAGEMENT = 0x7F000071;
globals.DLG_ARMYHQ_VISIT_APPLICATION_APPROVAL = 0x7F000072;

globals.F_ARMYHQ_ACCESS_STATUS = 0x7F000080;
globals.DLG_ARMYHQ_ACCESS_STATUS_REGISTRATION = 0x7F000081;
globals.DLG_ARMYHQ_ACCESS_STATUS = 0x7F000082;
globals.DLG_ARMYHQ_ACCESS_STATISTICS = 0x7F000083;
globals.DLG_ARMYHQ_ACCESS_STATUS_AREA_SETTING = 0x7F000084;


// OEM 육군본부 출입통제 <----
// OEM 청와대 ---->
globals.DLG_BH_ACCESS_GROUP_MAP_MANAGEMENT = 0x7F000090;
globals.DLG_BH_USER_SYNC_MANAGEMENT = 0x7F000091;

// IDIS 출근인증기록 조회 
globals.DLG_IDIS_WORK_AUTHLOGS = 0x7F000092;

// 베트남 주차관제 시스템 - otk			 0x7F000093
globals.DLG_AUTHLOGDETAILIMAGE = 0x7F000093;

globals.DLG_BPARK_PAYMENT_TOP = 0x7F000094;
globals.DLG_BPARK_PAYMENT_MANAGEMENT = 0x7F000095;
globals.DLG_BPARK_PAYMENT_LOG_MANAGEMENT = 0x7F000097;
// --!

// 인도 BNP & CNP
globals.DLG_INDO_BNP_CNP_MASTER_SHIFT = 0x7F0000A1;

// 3D 전시회
globals.F_LOCATION_VISUALIZATION_3D = 0x7F0000B0;
globals.DLG_3D_INTEGRATED_MONITORING = 0x7F0000B1;
//bosk
globals.DLG_IDTECK_ACU_DEVICE_MANAGEMENT = 0x7F0000B2;
globals.DLG_IDTECK_ACU_DEVICE_MONITORING = 0x7F0000B3;
globals.DLG_BOSK_BLACKLIST_MANAGEMENT = 0x7F0000B4;


// OEM 현대 엘리베이터 충주공장  / 현대 무벡스
globals.DLG_HECJF_RESTRICTION_MANAGEMENT_TOP = 0x7F0000B5; // 제한 관리
globals.DLG_HECJF_RESTRICTION_MANAGEMENT = 0x7F0000B6;
// bosk
globals.DLG_IDTECK_ACU_DEVICE_EVENT_LOG_MANAGEMENT = 0x7F0000B7;
// 현대중공업
globals.DLG_AUTHLOG_FAW_IMAGE_VIEW = 0x0A000007;
globals.DLG_HDHI_TNA_DISPLAY_MONTH_PERIODRESULT = 0x7F0000C1;
globals.DLG_HDHI_TNA_DISPLAY_DAILY_PERIODRESULT = 0x7F0000C2;
globals.DLG_HDHI_TNA_DISPLAY_BYPARTNER_PERIODRESULT = 0x7F0000C3;

// 베트남 Integ
globals.DLG_VIETNAM_INTEG_WATCH_TERMINAL_MANAGEMENT = 0x7F0000C4;
globals.DLG_VIETNAM_INTEG_WATCH_TERMINAL_AUTHLOG = 0x7F0000C5;
globals.DLG_VIETNAM_INTEG_TERMINAL_CCTV_MANAGEMENT = 0x7F0000C6;

// Almarai  
globals.DLG_ALMARAI_AUTHLOG_IMAGE = 0x7F0000C7;

globals.OEM_INIT = 0xFFFFFFFF;

 // 잔액 조회
/// error
globals.ErrorPacketTimeout              = 0x00000008

// 이벤트 로그
globals.EventLogTerminalDisconnected	= 0x00010001	//65537  단말기 단절
globals.EventLogTerminalConnected    	= 0x00010002    //65538  단말기 연결
globals.EventLogTerminalLocked        	= 0x00010003    //65539  단말기 잠김
globals.EventLogTerminalUnlocked     	= 0x00010004    //65540  단말기 해제
globals.EventLogTerminalTamper        	= 0x00010005    //65541  단말기 분리
globals.EventLogTerminalAttached     	= 0x00010006    //65542  단말기 결합
globals.EventLogTerminalLockdowned    	= 0x00010007    //65543  단말기 폐쇄
globals.EventLogTemrinalPollingSetting  = 0x00010007    //65544  단말기 pollingtime 설정


// 이벤트 로그 (Door)
globals.EventLogDoorOpen           		= 0x00020001	//131073  출입문 열림
globals.EventLogDoorClose               = 0x00020002    //131074  출입문 닫힘
globals.EventLogDoorUnlock              = 0x00020003    //131075  출입문 해정
globals.EventLogDoorLock                = 0x00020004    //131076  출입문 시정
globals.EventLogDoorForced              = 0x00020005    //131077  강제 침입
globals.EventLogDoorNotClosed           = 0x00020006    //131078  문열림 방치
globals.EventLogDoorLockRestored        = 0x00020007    //131079  도어락 정상
globals.EventLogDoorLockError           = 0x00020008    //131080  도어락 고장
globals.EventLogDoorNotMonitor          = 0x00020009    //131081  문상태 미감시

globals.EventLogDoorRemoteOpen          = 0x00020010    //131088  출입문 개방 조작
globals.EventLogDoorRemoteUnlock        = 0x00020011    //131089  출입문 해정 조작
globals.EventLogDoorRemoteLock          = 0x00020012    //131090  출입문 시정 조작
globals.EventLogDoorChange              = 0x00020013    //131091  출입문 변경
globals.EventLogDoorIndoorOpen          = 0x00020014    //131092  출입문 1 내부 문열림 버튼
globals.EventLogDoor2Open               = 0x00020015    //131093  출입문 2 열림
globals.EventLogDoor2Close              = 0x00020016    //131094  출입문 2 닫힘
globals.EventLogDoor2IndoorOpen         = 0x00020017    //131095  출입문 2 내부 문열림 버튼
globals.EventLogDoorNotClosedClear      = 0x00020018    //131096  문열림 방치 해제

// 이벤트 로그 (경고)
globals.EventEmergencyAlarm               	= 0x00030001	//196609  세트 설정
globals.EventEmergencyDisarm                = 0x00030002    //196610  세트 해제
globals.EventEmergencyFireDetectStart       = 0x00030003    //196611  화재 감지 시작
globals.EventEmergencyFireDetectStop        = 0x00030004    //196612  화재 감지 종료
globals.EventEmergencyPanicDetectStart      = 0x00030005    //196613  패닉 감지 시작
globals.EventEmergencyPanicDetectStop       = 0x00030006    //196614  패닉 감지 종료
globals.EventEmergencyCrisisDetectStart     = 0x00030007    //196615  비상 감지 시작
globals.EventEmergencyCrisisDetectStop      = 0x00030008    //196616  비상 감지 종료
globals.EventEmergencyBlacklistAttempt      = 0x00030009    //196617  블랙리스트 인증시도
	
globals.EventEmergencyDuress                = 0x00030010    //196624  협박
globals.EventEmergencySystemError           = 0x00030011    //196625  시스템 에러
globals.EventEmergencyDoorEmergency         = 0x00030012    //196626  출입문 비상 경고
globals.EventEmergencyDoor2                 = 0x00030013    //196627  출입문 2 문열림 경고
globals.EventEmergencyDoor2Emergency        = 0x00030014   //196628  출입문 2 비상경고
globals.EventEmergencyDoor2NotClosedClear	= 0x00030015   //196629  출입문 2 문열림 경고 멈춤
globals.EventEmergencyFire                  = 0x00030016   //196630  화재 경고
globals.EventEmergencyPanic                 = 0x00030017   //196631  패닉 감지
globals.EventEmergencyPanicClear            = 0x00030018   //196632  패닉 멈춤
globals.EventEmergencyFireClear             = 0x00030019   //196633  화재 멈춤
	
globals.EventEmergencyFPSensorAbnormal      = 0x00030020    //196640  지문인식기 오류
globals.EventEmergencyDBAbnormal            = 0x00030021    //196641  DB 오류
globals.EventEmergencyRTCAbnormal           = 0x00030022    //196642  RTC 오류
globals.EventEmergencyTouchAbnormal         = 0x00030023    //196643  터치 오류

//DownloadManager TaskNameList
globals.TaskNameUserAccessGroupUpdate 				= 0x41404054 // 사용자 출입그룹 일관 설정/해제 요청
globals.TaskNameTerminalFWDownload 					= 0x44102039 // 펌웨어 단말 다운로드 서버에요청
globals.TaskNameAccessGroupInfoDownloadToTerminal 	= 0x4410203B // 출입그룹 정보 단말로 다운로드
globals.TaskNameTerminalUserData     				= 0x44103005 // 단말기 사용자 가져오기
globals.TaskNameWiegandInDownload			 		= 0x44122006 // 위겐드 인 단말로 전송 요청
globals.TaskNameWiegandOutDownload 					= 0x441220A6 // 위겐드 아웃 단말로 전송 요청
globals.TaskNameSynchronization 					= 0x44103029 // 단말기 동기화 요청
globals.TaskNameOptionInfoUpdate 				= 0x44123002	//사용자 암/복호화, 인증데이터 암/복호화
globals.TaskNameMealManualProcess				= 0x44107021	//식수 수동집계
globals.TaskNameAccessAreaUpdate = 0x44104025// 출입구역 수정
globals.TaskNameAccessGroupUpdate = 0x41404055 //출입그룹 사용자 재전송 (커스터마이징 버전)
globals.TaskNameUserDelete = 0x44101004 // 사용자 삭제
globals.TaskNameUserFileSend = 0x4410203A  // 사용자 파일전송

globals.TaskCardLayoutInfoDownloadToTerminal = 0x44127003
globals.TaskOptionInfoUpdate = 0x44123002
//OEM
globals.TaskJWDCardRetrievalFromUserReq = 0x441FF007
globals.TaskDJMCHEduCourseProcessingReq = 0x441FF145

//VMS Integration list
globals.VMSHikVision = 1
globals.VMSInnodep = 2
globals.VMSIDIS = 3

// Terminal Remote All Option (to json)
globals.RemoteOptionAvailable = 1;

// xkey license status
globals.XkeyLicStatusNone  = 0; // xkey 라이선스 유효성 체크 안됌 또는 라이선스 한번도 활성화 하지 않음
globals.XkeyLicStatusOK    = 1; // 정상
globals.XkeyLicStatusError = 2; // xkey 라이선스 활성화 했으나 상태 오류(Mac 주소 변경 등...)

// 사용자 권한
globals.PrivilegeAdmin = 1;
globals.PrivilegeUser = 2;

globals.UseAuthTerminal = 1;
globals.DoSimilarCheck = 1;
