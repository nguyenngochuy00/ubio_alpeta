/************************************************
 * defineError.module.js
 * Created at 2019. 5. 7. 오후 4:01:57.
 *
 * @author fois
 ************************************************/

globals.ErrorInvalidParameter           = 0x00000001
globals.ErrorAuthorizeFailed            = 0x00000002
globals.ErrorMismatched                 = 0x00000003
globals.ErrorDataNotExist               = 0x00000004
globals.ErrorDataServerConnectionFailed = 0x00000005
globals.ErrorInternalServerError        = 0x00000006
globals.ErrorNotPermission              = 0x00000007
globals.ErrorPacketTimeout              = 0x00000008
globals.ErrorProtoMarshalFail           = 0x00000009
globals.ErrorProtoUnMarshalFail         = 0x0000000A
globals.ErrorSkip                       = 0x0000000B
globals.ErrorNotLoginState              = 0x0000000C // 로그인 상태가 아닌 경우
globals.ErrorInvalidServerID            = 0x0000000D //
globals.ErrorUserConnectionMaxExceed    = 0x0000000E //
globals.ErrorUndefinedErrorCode			= 0x0000000F // 정의되지 않은 에러 코드
globals.ErrorPackingFailed              = 0x00000010 // 정의되지 않은 에러 코드
globals.ErrorParameter                  = 0x00000011 // virdiType 에러 디파인 값 필요
globals.ErrorOemVersion                 = 0x00000012 // OEMVersion 잘못된경우 에러 코드
globals.ErrorNoAvailableASServer        = 0x00000013 // AS 서버 연결 에러
globals.ErrorSessionInfo                = 0x00000014 // 세션 정보 불일치
globals.ErrorSessionTimeOut             = 0x00000015 // 세션 정보 타임아웃
globals.ErrorInvalidPeriod              = 0x00000016 // 조회 기간 오류
globals.ErrorJsonUnmarshalFail			= 0x00000017 
globals.ErrorNameExist                  = 0x00000018 // 동일한 이름이 존재
globals.ErrorFileCreateFailed			= 0x00000019 
globals.ErrorFileWriteFailed			= 0x0000001A // 파일 생성 실패
globals.ErrorConnectionFailed           = 0x0000001B
globals.ErrorIDDuplicated           	= 0x0000001C // ID 중복
globals.ErrorFileExtention        		= 0x0000001D // 파일 확장자 오류
globals.ErrorFileNotExist				= 0x0000001E // 파일 생성 실패
globals.ErrorUserCancel					= 0x0000001F // 사용자가 취소
globals.ErrorASDataStateInitialized     = 0x00000020 // AS 서버 초기화 완료 안됨
globals.ErrorDecoding 					= 0x00000021 //디코딩 작업 오류
globals.ErrorTemplateFormat             = 0x00000022
globals.ErrorFileName					= 0x00000023 // 파일명 오류 (파일명이 잘못되었습니다.)

// 비밀번호 옵션
globals.ErrorOptionPwdBlank      = 0x01000030 // 비밀번호에 공백 들어감
globals.ErrorOptionPwdRepeatChar = 0x01000031 // 비밀번호 연속문자 사용
globals.ErrorOptionPwdSameID     = 0x01000032 // ID와 동일한 비밀번호
globals.ErrorOptionPwdUpper      = 0x01000033 // 비밀번호 알파벳 대문자 필수
globals.ErrorOptionPwdLower      = 0x01000034 // 비밀번호 알파벳 소문자 필수
globals.ErrorOptionPwdNumber     = 0x01000035 // 비밀번호 숫자 필수
globals.ErrorOptionPwdSymbol     = 0x01000036 // 비밀번호 특수문자 필수
globals.ErrorOptionPwdLength	 = 0x01000037 // 비밀번호 4자리 미만

globals.ErrorDatabase 					= 0x00001000

globals.ErrorUserDuplicateID          		 = 0x01000001
globals.ErrorUserNotExist             		 = 0x01000002
globals.ErrorUserInvalidFPData        		 = 0x01000003
globals.ErrorUserAuthenticationFailed 		 = 0x01000004
globals.ErrorUserInvalidID            		 = 0x01000005
globals.ErrorReDuplicateUniqueId      		 = 0x01000006
globals.ErrorReDuplicateNotUniqueId   		 = 0x01000007
globals.ErrorUserExist                		 = 0x01000008
globals.ErrorUserNameInvalid          		 = 0x01000009
globals.ErrorUserAuthTypeInvalid      		 = 0x0100000A
globals.ErrorUserUniqueIDInvalid      		 = 0x0100000B
globals.ErrorUserPasswordInvalid      		 = 0x0100000C
globals.ErrorUserSimilarFingerprint   		 = 0x0100000D									   
globals.ErrorUserOldLoginPasswordDuplicate   = 0x0100000E
globals.ErrorUserLoginPasswordExpirationDate = 0x0100000F
globals.ErrorUserLoginFailCount              = 0x01000011
globals.ErrorUserLoginPasswordWrongInput     = 0x01000012
globals.ErrorUserRfCardDuplicate             = 0x01000013
globals.ErrorUserSimilarFace                 = 0x01000014
globals.ErrorUserSimilarCard                 = 0x01000015
globals.ErrorUserInvalidUsePeriod            = 0x01000016
globals.ErrorUserInvalidFAData               = 0x01000017 // 얼굴데이터 없다.
globals.ErrorUserInvalidLoginPwd             = 0x01000018
globals.ErrorUserInvalidLoginAllow           = 0x01000019
globals.ErrorUserLoginPasswordDuplicate      = 0x0100001A
globals.ErrorUserBlackListStatus             = 0x0100001B
globals.ErrorUserInvalidFaceWTData           = 0x0100001C
globals.ErrorUserInvalidIrisData             = 0x0100001D // 홍채 데이터가 없음
globals.ErrorUserDuplicateCarNumber          = 0x0100001E // 차량번호 중복
globals.ErrorUserCardNotExist                = 0x0100001F // 카드가 없습니다.
globals.ErrorUserCardNotMatched              = 0x01000020 // 카드가 일치하지 않습니다.
globals.ErrorNotDuplicateUserName            = 0x01000021 // 이름이 일치하지 않음
globals.ErrorUserRfCardNotExist              = 0x01000022
globals.ErrorUserPictureSize                 = 0x01000023 //섬머리 사이즈 오류
globals.ErrorUserCardValueTooLong            = 0x01000024 // 카드값 24byte 초과 시

globals.ErrorActionTrycatch01				 = 0x01001393 // '5011' 0x2C 사용자추가시 데이타사이즈 오류
globals.ErrorActionTrycatch02				 = 0x01001394 // '5012' 0x2C 사용자추가시 UserData 데이타파싱 오류
globals.ErrorActionTrycatch03				 = 0x01001395 // '5013'0x27(0x3A) 사용자추가시 데이타(param3[5]=0 일때) 파싱 오류
globals.ErrorActionTrycatch04 				 = 0x01001396 // '5014' 0x27 사용자추가시 추가데이타(param3[5]>0일때) 파싱 오류

globals.ErrorTerminalInvalidStatus      = 0x02000001
globals.ErrorTerminalIDDuplication      = 0x02000002
globals.ErrorTerminalNotRegistered      = 0x02000003
globals.ErrorTerminalNotConnected       = 0x02000004
globals.ErrorTerminalAnotherProcess     = 0x02000005
globals.ErrorTerminalNotSupportFunc     = 0x02000006
globals.ErrorTerminalNotSupportTerminal = 0x02000007
globals.ErrorTerminalMaxExceed 			= 0x02000008
globals.ErrorCoreTerminalLimit          = 0x02000009


globals.ErrorNotExistPacket = 0x2000F99
// terminal user
globals.ErrorTerminalUserOccur           = 0x02000101
globals.ErrorTerminalUserOccurButProceed = 0x02000102

// Terminal Capture
globals.ErrorTerminalFpCaptuer = 0x02000201

// terminal return
globals.ErrorTerminalSaveUser    = 0x02000F01
globals.ErrorTerminalLoadUser    = 0x02000F02
globals.ErrorTerminalNoUser      = 0x02000F03
globals.ErrorTerminalExistUser   = 0x02000F04
globals.ErrorTerminalDeleteFP    = 0x02000F05
globals.ErrorTerminalUserFull    = 0x02000F06
globals.ErrorTerminalUpdateUser  = 0x02000F07
globals.ErrorTerminalDuplicateRF = 0x02000F08
globals.ErrorFacewtNoFace        = 0x02000F09 // '' 얼굴이 없습니다.
globals.ErrorFacewtMultiFace     = 0x02000F0A // '5202' 여러면
globals.ErrorFacewtSmall         = 0x02000F0B // '5203' 얼굴이 너무 작습니다.
globals.ErrorFacewtLowScore      = 0x02000F0C // '5204' 정렬 점수가 너무 낮습니다.
globals.ErrorFacewtSideFace      = 0x02000F0D // '5205' 측면
globals.ErrorFacewtVague         = 0x02000F0E // '5206' 너무 가까움
globals.ErrorFacewtTooFar        = 0x02000F0F // '5207' 얼굴이 너무 멀리 있습니다.
globals.ErrorFacewtRecogFail     = 0x02000F10 // '5208' 식별 초기화 실패
globals.ErrorFacewtParam         = 0x02000F11 // '5209' 기능 입력 매개 변수 오류
globals.ErrorFacewtNoFile        = 0x02000F12 // '5210' 특성 값의 파일이 존재하지 않습니다
globals.ErrorFacewtChip          = 0x02000F13 // '5211' 암호화 칩 오류
globals.ErrorFacewtCertification = 0x02000F14 // '5212' 인증서 확인 실패
globals.ErrorFacewtMaxUser 	 	 = 0x02000F15 // '5215' 라이브러리에있는 사람들의 수가 상한에 도달했습니다
globals.ErrorFacewtTimeout 	 	 = 0x02000F16 // '5216' timeout
globals.ErrorWearingMask   		 = 0x02000F17 // '5217' 마스크 착용 등록실패
globals.ErrorImageBroken  		 = 0x02000F18 // '5218' 이미지 깨짐
globals.ErrorMtcSmallSize  		 = 0x02000F19 // '5219' 이미지 사이즈가 너무 작은 경우, 이미지 사이즈가 340 , 340 보다 작을경우
globals.ErrorMtcBigSize    		 = 0x02000F20 // '5220' 이미지 사이즈가 너무 큰 경우, 이미지 사이즈가 1MB 보다 클경우

//globals.ErrorTerminalFlashWriting   = 0x02000F19 // '5005' 다른 작업중. 플래쉬 라이팅 등

globals.ErrorGroupDuplicateID      = 0x03000001
globals.ErrorGroupNotExistID       = 0x03000002
globals.ErrorGroupNotExistParentID = 0x03000003
globals.ErrorGroupInvalidInfo      = 0x03000004
globals.ErrorGroupInvalidID        = 0x03000005
globals.ErrorGroupInvalidParentID  = 0x03000006
globals.ErrorGroupDuplicateName    = 0x03000007
globals.ErrorGroupCountMaxExceed   = 0x03000008
globals.ErrorGroupNoSearchResult   = 0x03000009
globals.ErrorGroupMaxDepthExceed   = 0x0300000A

globals.ErrorPrivilegeDuplicateID           = 0x04000001
globals.ErrorPrivilegeNotExist              = 0x04000002
globals.ErrorPrivilegeInvalidID             = 0x04000003
globals.ErrorPrivilegeInvalidName           = 0x04000004
globals.ErrorPrivilegeNotPermission         = 0x04000005
globals.ErrorPrivilegeNotPermissionUser     = 0x04000006
globals.ErrorPrivilegeNotPermissionTerminal = 0x04000007
globals.ErrorPrivilegeNotPermissionGroup    = 0x04000008

globals.ErrorTimezoneDuplicateID       = 0x05000001
globals.ErrorTimezoneNotExist          = 0x05000002
globals.ErrorTimezoneInvalidID         = 0x05000003
globals.ErrorTimezoneInvalidName       = 0x05000004
globals.ErrorTimezoneInvalidTime       = 0x05000005
globals.ErrorTimezoneInvalidTimeFormat = 0x05000006
globals.ErrorTimezoneNotExistTime      = 0x05000007
globals.ErrorTimezoneNotExistTimeline  = 0x05000008
globals.ErrorTimezoneNotExistHoliday   = 0x05000009

globals.ErrorAPBNotExistTerminalID  = 0x06000001
globals.ErrorAPBNotExistAreaID      = 0x06000002
globals.ErrorAPBDuplicateTerminalID = 0x06000003
globals.ErrorAPBDuplicateAreaID     = 0x06000004
globals.ErrorAPBInvalidTerminalID   = 0x06000005
globals.ErrorAPBInvalidAreaID       = 0x06000006
globals.ErrorAPBInvalidStatus       = 0x06000007

globals.ErrorAPBAreaDuplicateID 	= 0x06000101
globals.ErrorAPBAreaNotExist    	= 0x06000102
globals.ErrorAPBAreaInvalidID   	= 0x06000103
globals.ErrorAPBAreaInvalidName 	= 0x06000104

// terminal return
globals.ErrorAPBTerminalFail 		= 0x06000201



globals.ErrorPositionDuplicateID   = 0x07000001
globals.ErrorPositionNotExist      = 0x07000002
globals.ErrorPositionInvalidID     = 0x07000003
globals.ErrorPositionInvalidName   = 0x07000004
globals.ErrorPositionDuplicateName = 0x07000005


globals.ErrorMessageDuplicateID    = 0x08000001
globals.ErrorMessageNotExist       = 0x08000002
globals.ErrorMessageInvalidID      = 0x08000003
globals.ErrorMessageInvalidMessage = 0x08000004


globals.ErrorNoticeDuplicateID    = 0x09000001
globals.ErrorNoticeNotExist       = 0x09000002
globals.ErrorNoticeInvalidID      = 0x09000003
globals.ErrorNoticeInvalidMessage = 0x09000004


globals.ErrorWiegandDuplicateCode = 0x0A000001
globals.ErrorWiegandNotExist      = 0x0A000002
globals.ErrorWiegandInvalidCode   = 0x0A000003
globals.ErrorWiegandInvalidData   = 0x0A000004


globals.ErrorLicenseInitializeFail     = 0x0B000001
globals.ErrorLicenseNotAlpetaLicense   = 0x0B000002
globals.ErrorLicenseDecryptFail        = 0x0B000003
globals.ErrorLicenseInvalidStart       = 0x0B000004
globals.ErrorLicenseExired             = 0x0B000005
globals.ErrorTerminalNoLicense         = 0x0B000006
globals.ErrorLicenseInvalidMac         = 0x0B000007
globals.ErrorLicenseInvalidFunc        = 0x0B000008
globals.ErrorSerialKeyCreateFail 	   = 0x0B000009
globals.ErrorLicenseInsertFail         = 0x0B00000A
globals.ErrorLicenseServerError        = 0x0B00000B
globals.ErrorLicenseActivationResError = 0x0B00000C
globals.ErrorLicenseInvalidExpireDate  = 0x0B00000D
globals.ErrorLicenseEncryptFailed      = 0x0B00000E
globals.ErrorLicenseSerialKeyInvalid   = 0x0B00000F
globals.ErrorLicenseNotIssueReadyState = 0x0B000010
globals.ErrorLicenseKeyCreateFail      = 0x0B000011
globals.ErrorLicenseKeyInvalid         = 0x0B000012
globals.ErrorLicenseCustomerIDInvalid  = 0x0B000013
globals.ErrorLicenseMacaddressInvalid  = 0x0B000014
globals.ErrorLicenseTypeInvalid        = 0x0B000015
globals.ErrorLicenseSerialKeyNotExist  = 0x0B000016
globals.ErrorLicenseNotMatched         = 0x0B000017
globals.ErrorLicenseUnavailableCore    = 0x0B00001A

globals.ErrorXkeyLicenseInvalidSiteCode    = 0x0B00001B
globals.ErrorXkeyLicenseInvalidPort        = 0x0B00001C
globals.ErrorXkeyLicenseInvalidIP          = 0x0B00001D
globals.ErrorXkeyLicenseDuplicateSiteCode  = 0x0B00001E
globals.ErrorLicenseNotUbioXkeyLicense     = 0x0B00001F

globals.ErrorAnotherTaskProcessing = 0x0C000001 // 동일한 작업 타입의 다른 작업이 진행중일 경우


globals.ErrorDB       = 0x0D000001
globals.ErrorDBSelect = 0x0D000002
globals.ErrorDBUpdate = 0x0D000003
// for create db
globals.ErrorDBCreate             = 0x0D00F001
globals.ErrorDBConnectionFail     = 0x0D00F002
globals.ErrorDBAleadyExist        = 0x0D00F003
globals.ErrorDBAleadyExistUser    = 0x0D00F004
globals.ErrorDBPackageNotFound    = 0x0D00F005
globals.ErrorDBCreateFolderFailed = 0x0D00F006
globals.ErrorDBInstallFailed      = 0x0D00F007
globals.ErrorDBUserCreateFailed   = 0x0D00F008
globals.ErrorDBTableCreate        = 0x0D00F009
globals.ErrorDBNotExist           = 0x0D00F00A
globals.ErrorDBServiceStartFail   = 0x0D00F00B
globals.ErrorOpenSCManagerFailed  = 0x0D00F00C
	
	
globals.ErrorCountryCodeDataNotExist = 0x0E000001
globals.ErrorCountryCodeFileNotExist = 0x0E000002
globals.ErrorCountryCodeDuplicateKey = 0x0E000003
globals.ErrorCountryCodeJsonDecode   = 0x0E000004
globals.ErrorCountryCodeMatchingKey  = 0x0E000005

globals.ErrorTnaProcess = 0x10000001
globals.ErrorEditTnaProcess = 	0x10000002

	// 모바일 카드 서버 에러->
globals.ErrorMobileCardMasterKeyNone   = 0x1D000001 // 마스터키 미발급
globals.ErrorMobileCardContractNoNone  = 0x1D000002 // 미등록 사업장코드
globals.ErrorMobileCardContractDeleted = 0x1D000003 // 삭제된 사업장코드
globals.ErrorMobileCardMasterKeyInvalid = 0x1D00001A // 삭제된 사업장코드

globals.ErrorMobileCardServerError       = 0x1D000030 // 시스템 오류. 시스템 오류
globals.ErrorMobileCardParameterNotExist = 0x1D000031 // 입력 파라미터 값이 없습니다. API body 중에 필수 요청 값이 없을 때 오류
globals.ErrorMobileCardParameterInvalid  = 0x1D000032 // 입력 파라미터 값이 잘못되었습니다. 입력 파라미터 값 형식이 잘못되었을 시 오류
globals.ErrorMobileCardSiteNotExist      = 0x1D000033 // 미등록된 사업장 코드입니다. 사업장이 존재하지 않을 경우 오류
globals.ErrorMobileCardSiteMacAddr        = 0x1D000034 // 사업장 맥주소 오류
globals.ErrorMobileCardSiteIpAddr         = 0x1D000035 // 사업장 IP 오류
globals.ErrorMobileCardSiteNotExistIpAddr = 0x1D000036 // 사업장 IP 없음
	
globals.ErrorMobileCardMasterKeyNotExist      = 0x1D000040 // 발급된 마스터키가 없습니다. 마스터키 미발급시 발생하는 오류.
globals.ErrorMobileCardMasterKeyEncryptFailed = 0x1D000041 // 마스터키 암호화에 실패하였습니다. 마스터키 암호화 실패시 발생하는 오류
globals.ErrorMobileCardMasterKeyAddrSetFailed = 0x1D000042 // 마스터키 mac,addr set오류
	
globals.ErrorMobileCardAPINotExist          = 0x1D000050 // 정의되지 않은 API입니다.. API 헤더의 name 항목이 틀린 경우.
globals.ErrorMobileCardSourceInvalid        = 0x1D000051 // 송신지 오류입니다. 송신지가 UBioAlpeta가 아닐 때 오류
globals.ErrorMobileCardJsonParsingFailed    = 0x1D000052 // JSON PARSING 오류. JSON 파싱 오류가 발생했을 때 오류
globals.ErrorMobileCardServerException      = 0x1D000053 // 서버 Exception 오류. 서버 처리중 Exception이 발생했을 때 오류
globals.ErrorMobileCardDownloadCardNotExist = 0x1D000054 // 다운로드 할 카드 정보가 없습니다. 다운로드 카드 정보가 없을때 (오류 아님)

globals.ErrorMobileCardAlreadyIssued                = 0x1D000060 // 해당 사용자의 스마트폰에는 이미 모바일 카드가 발급되어 있습니다. 이미 발급된 모바일 카드가 존재할 경우
globals.ErrorMobileCardSMSSendFailed                = 0x1D000061 // SMS 전송에 실패하였습니다. SMS 전송 실패 시 오류
globals.ErrorMobileCardEmailSendFailed              = 0x1D000062 // 이메일 전송에 실패하였습니다. 이메일 전송 실패 시 오류
globals.ErrorMobileCardPictureSaveFAiled            = 0x1D000063 // 사진 저장에 실패하였습니다. 사진 저장 실패 시 오류
globals.ErrorMobileCardM2KeyInitFailed              = 0x1D000064 // M2Key 초기화에 실패하였습니다. M2Key 초기화 실패 시 오류
globals.ErrorMobileCardLicenseMaxExceeded           = 0x1D000065 // 라이선스가 초과되어 신청 할 수 없습니다. 라이선스 초과 시 발생하는 오류
globals.ErrorMobileCardCouponLicenseMaxExceeded     = 0x1D000066 // 쿠폰 라이선스가 초과되어 신청 할 수 없습니다. 쿠폰 라이선스 초과 시 발생하는 오류
globals.ErrorMobileCardEmployeeIDDuplicated         = 0x1D000067 // 중복된 사원번호입니다. 사원번호가 이미 존재하는 경우 오류
globals.ErrorMobileCardUserIDDuplicated             = 0x1D000068 // 중복된 사원아이디입니다. 사원아이디가 이미 존재하는 경우 오류
globals.ErrorMobileCardCardInfoNotExist             = 0x1D000069 // 카드 정보가 없습니다. 카드 상태 변경. 삭제 시 기존 카드 정보가 존재하지 않을 경우 발생
globals.ErrorMobileCardAlreadyVisitorRegistered     = 0x1D00006A // 현재 방문자로 등록되어 있습니다. 카드 삭제 후 다시 진행해 주시기 바랍니다. 기존 신청된 카드와 다른 타입의 카드 신청시 오류
globals.ErrorMobileCardAlreadyEmployeeRegistered    = 0x1D00006B // 현재 직원으로 등록되어 있습니다. 카드 삭제 후 다시 진행해 주시기 바랍니다. 기존 신청된 카드와 다른 타입의 카드 신청시 오류
globals.ErrorMobileCardAlreadyApplicationRegistered = 0x1D00006C // 신청된 방문(RQ)이 있습니다. 신청된 방문(QR)이 있는 경우 일반 방문을 지원하지 않습니다. 기존 신청된 카드와 다른 타입의 카드 신청시 오류
globals.ErrorMobileCardDeleteCardTypeInvalid        = 0x1D00006D // 삭제하고자 하는 card_type 오류입니다. 카드 삭제 시 card_type이 잘못되었을 경우 오류
globals.ErrorMobileCardIssuedCardTypeModify         = 0x1D00006E // 발급된 방문자 타입을 수정할 수 없습니다. 이미 발급된 방문자 카드를 수정 요청할 시 오류
globals.ErrorMobileCardVisitPeriodInvalid           = 0x1D00006F // 방문 신청 기간이 잘못되었습니다. 카드 만료일이 시작일보다 빠른 경우
globals.ErrorMobileCardDateFormatInvalid            = 0x1D000070 // yyyy-mm-dd hh:mm:ss부터 yyyy-mm-dd hh:mm:ss까지 방문 신청이 있습니다. 이미 방문 신청된 카드가 존재할 경우 오류
globals.ErrorMobileCardPhoneAlreadyIssuedCard       = 0x1D000071 // 해당 사용자의 스마트폰에는 잘못 발급된 카드가 있습니다. 사이트와 핸드폰 번호가 같으나 다르게 발급된 카드가 있습니다. 잘못 신청된 모바일 카드가 존재할 경우 오류
globals.ErrorMobileCardDevicdInfoInvalid            = 0x1D000072 // 기기 정보가 잘못되었습니다.
globals.ErrorMobileCardCardInfoInvalid              = 0x1D000073 // 카드 정보가 잘못되었습니다.
	
globals.ErrorBSPInvalidHandle           = 0x1F000001
globals.ErrorBSPInvalidPointer          = 0x1F000002
globals.ErrorBSPInvalidType             = 0x1F000003
globals.ErrorBSPFunctionFail            = 0x1F000004
globals.ErrorBSPStructtypeNotMatched    = 0x1F000005
globals.ErrorBSPAlreadyProcessed        = 0x1F000006
globals.ErrorBSPExtractionOpenFail      = 0x1F000007
globals.ErrorBSPVerificationOpenFail    = 0x1F000008
globals.ErrorBSPDataProcessFail         = 0x1F000009
globals.ErrorBSPMustBeProcessedData     = 0x1F00000A
globals.ErrorBSPInternalChecksumFail    = 0x1F00000B
globals.ErrorBSPEncryptedDataError      = 0x1F00000C
globals.ErrorBSPUnknownFormat           = 0x1F00000D
globals.ErrorBSPUnknownVersion          = 0x1F00000E
globals.ErrorBSPValidityFail            = 0x1F00000F
globals.ErrorBSPInitMaxfinger           = 0x1F000010
globals.ErrorBSPInitSamplesperfinger    = 0x1F000011
globals.ErrorBSPInitEnrollquality       = 0x1F000012
globals.ErrorBSPInitVerifyquality       = 0x1F000013
globals.ErrorBSPInitIdentifyquality     = 0x1F000014
globals.ErrorBSPInitSecuritylevel       = 0x1F000015
globals.ErrorBSPInvalidMinsize          = 0x1F000016
globals.ErrorBSPInvalidTemplate         = 0x1F000017
globals.ErrorBSPExpiredVersion          = 0x1F000018
globals.ErrorBSPInvalidSamplesperfinger = 0x1F000019
globals.ErrorBSPUnknownInputformat      = 0x1F00001A
globals.ErrorBSPInitEnrollSecuritylevel = 0x1F00001B
globals.ErrorBSPInitNecessaryenrollnum  = 0x1F00001C
globals.ErrorBSPInitReserved1           = 0x1F00001D
globals.ErrorBSPInitReserved2           = 0x1F00001E
globals.ErrorBSPInitReserved3           = 0x1F00001F
globals.ErrorBSPInitReserved4           = 0x1F000020
globals.ErrorBSPInitReserved5           = 0x1F000021
globals.ErrorBSPInitReserved6           = 0x1F000022
globals.ErrorBSPInitReserved7           = 0x1F000023
globals.ErrorBSPOutOfMemory             = 0x1F000024
globals.ErrorBSPDeviceOpenFail          = 0x1F000101
globals.ErrorBSPInvalidDeviceID         = 0x1F000102
globals.ErrorBSPWrongDeviceID           = 0x1F000103
globals.ErrorBSPDeviceAlreadyOpened     = 0x1F000104
globals.ErrorBSPDeviceNotOpened         = 0x1F000105
globals.ErrorBSPDeviceBrightness        = 0x1F000106
globals.ErrorBSPDeviceContrast          = 0x1F000107
globals.ErrorBSPDeviceGain              = 0x1F000108
globals.ErrorBSPLowversionDriver        = 0x1F000109
globals.ErrorBSPDeviceInitFail          = 0x1F00010A
globals.ErrorBSPDeviceLostDevice        = 0x1F00010B
globals.ErrorBSPDeviceDllLoadFail       = 0x1F00010C
globals.ErrorBSPDeviceMakeInstanceFail  = 0x1F00010D
globals.ErrorBSPDeviceDllGetProcFail    = 0x1F00010E
globals.ErrorBSPDeviceIoControlFail     = 0x1F00010F
globals.ErrorBSPDeviceNotSupport        = 0x1F000110
globals.ErrorBSPDeviceLfd               = 0x1F000111
globals.ErrorBSPInvalidDeviceCode       = 0x1F000112
globals.ErrorBSPUserCancel              = 0x1F000201
globals.ErrorBSPUserBack                = 0x1F000202
globals.ErrorBSPCaptureTimeout          = 0x1F000203
globals.ErrorBSPCaptureFakeSuspicious   = 0x1F000204
globals.ErrorBSPEnrollEventPlace        = 0x1F000205
globals.ErrorBSPEnrollEventHold         = 0x1F000206
globals.ErrorBSPEnrollEventRemove       = 0x1F000207
globals.ErrorBSPEnrollEventPlaceAgain   = 0x1F000208
globals.ErrorBSPEnrollEventExtract      = 0x1F000209
globals.ErrorBSPEnrollEventMatchFailed  = 0x1F00020A
globals.ErrorBSPInitMaxcandidate        = 0x1F000301
globals.ErrorBSPNsearchOpenFail         = 0x1F000302
globals.ErrorBSPNsearchInitFail         = 0x1F000303
globals.ErrorBSPNsearchMemOverflow      = 0x1F000304
globals.ErrorBSPNsearchSaveDb           = 0x1F000305
globals.ErrorBSPNsearchLoadDb           = 0x1F000306
globals.ErrorBSPNsearchInvaldTemplate   = 0x1F000307
globals.ErrorBSPNsearchOverLimit        = 0x1F000308
globals.ErrorBSPNsearchIdentifyFail     = 0x1F000309
globals.ErrorBSPNsearchLicenseLoad      = 0x1F00030A
globals.ErrorBSPNsearchLicenseKey       = 0x1F00030B
globals.ErrorBSPNsearchLicenseExpired   = 0x1F00030C
globals.ErrorBSPNsearchDuplicatedID     = 0x1F00030D
globals.ErrorBSPNsearchInvalidID        = 0x1F00030E
globals.ErrorBSPImgconvInvalidParam     = 0x1F000401
globals.ErrorBSPImgconvMemallocFail     = 0x1F000402
globals.ErrorBSPImgconvFileopenFail     = 0x1F000403
globals.ErrorBSPImgconvFilewriteFail    = 0x1F000404
globals.ErrorBSPInitPresearchrate       = 0x1F000501
globals.ErrorBSPIndexsearchInitFail     = 0x1F000502
globals.ErrorBSPIndexsearchSaveDB       = 0x1F000503
globals.ErrorBSPIndexsearchLoadDB       = 0x1F000504
globals.ErrorBSPIndexsearchUnknownVer   = 0x1F000505
globals.ErrorBSPIndexsearchIdentifyFail = 0x1F000506
globals.ErrorBSPIndexsearchDuplicatedID = 0x1F000507
globals.ErrorBSPIndexsearchIdentifyStop = 0x1F000508

globals.ErrorVisitApplicationNotExist      = 0x30000001
globals.ErrorVisitApplicationNotApproved   = 0x30000002
globals.ErrorVisitApplicationExpired       = 0x30000003
globals.ErrorVisitVisitorInfoNotExist      = 0x30000004
globals.ErrorVisitVisitorAlreadyRegistered = 0x30000005
globals.ErrorVisitVisitorNotRegistWaitState  = 0x30000006
globals.ErrorVisitVisitorAccessgroupNotExist = 0x30000007

globals.ErrorAccessApplicationNotApproved = 0x30000011
globals.ErrorAccessApplicationDuplicated = 0x30000012
globals.ErrorCardStatusNotIssueReady = 0x30000021 // 발급 가능 상태가 아님
globals.ErrorCardStatusNotIssuanceStatus = 0x30000022
globals.ErrorCardStatusIsIssueStatus 	 = 0x30000023
	
globals.ErrorPurposeDuplicateID = 0x50000001
globals.ErrorPurposeNotExist    = 0x50000002
globals.ErrorPurposeInvalidID   = 0x50000003
globals.ErrorPurposeInvalidName = 0x50000004


globals.ErrorVisitDuplicateID = 0x51000001
globals.ErrorVisitNotExist    = 0x51000002
globals.ErrorVisitInvalidID   = 0x51000003
globals.ErrorVisitInvalidName = 0x51000004
	
	
globals.ErrorVirdiNone            = 0x60000000 //0 ERR_VIRDI_NONE
globals.ErrorVirdiResponseTimeout = 0x60000001 //1010	ERR_VIRDI_RESPONSE_TIMEOUT
globals.ErrorVirdiExtraData       = 0x60000002 //1020 ERR_VIRDI_EXTRADATA
globals.ErrorVirdiParameter       = 0x60000003 //1022	ERR_VIRDI_PARAMETER
globals.ErrorVirdiCheckSum        = 0x60000004 //1030	ERR_VIRDI_CHECKSUM
globals.ErrorVirdiFileError       = 0x60000005 //1040	ERR_VIRDI_FILE_ERROR
globals.ErrorVirdiDbAccess        = 0x60000006 //2003	ERR_VIRDI_DB_ACCESS
globals.ErrorVirdiProcessTimeOut  = 0x60000007 //2010 // 단말기측 프로세서 타임아웃(by kks) ERR_VIRDI_PROCESS_TIMEOUT
globals.ErrorVirdiUserCancel      = 0x60000008 //2090 // 사용자에 의한 프로세서 취소(by kks) ERR_VIRDI_USER_CANCEL

// Terminal logon related
globals.ErrorVirdiNoRegTerminal      = 0x60000009 //3001 ERR_VIRDI_NOREG_TERMINAL
globals.ErrorVirdiDuplicatedTerminal = 0x6000000A //3002 ERR_VIRDI_DUPLICATED_TERMINAL

// Authentication related
globals.ErrorVirdiInvalidUser              = 0x6000000B //3004	ERR_VIRDI_INVALID_USER
globals.ErrorVirdiMatching                 = 0x6000000C //3005 ERR_VIRDI_MATCHING
globals.ErrorVirdiPermisson                = 0x6000000D //3006	ERR_VIRDI_PERMISSION
globals.ErrorVirdiCapture                  = 0x6000000E //3007 ERR_VIRDI_CAPTURE
globals.ErrorVirdiDetection                = 0x6000000F //3008	ERR_VIRDI_FACE_DETECTION
globals.ErrorVirdiServerBusy               = 0x60000010 //3009	ERR_VIRDI_SERVER_BUSY
globals.ErrorVirdiBlackList                = 0x60000011 //3010 ERR_VIRDI_BLACK_LIST
globals.ErrorVirdiAntipassback             = 0x60000012 //4000 ERR_VIRDI_ANTIPASSBACK
globals.ErrorVirdiSoftpassback             = 0x60000013 //4003 ERR_VIRDI_SOFTPASSBACK
globals.ErrorVirdiDuplicatedAuthentication = 0x60000014 //5003 ERR_VIRDI_DUPLICATED_AUTHENTICATION
globals.ErrorVirdiInvalidIssuecount        = 0x60000015 //5100 //발급차수 낮음 (모바일키) ERR_VIRDI_INVALID_ISSUE_COUNT
globals.ErrorVirdiPeriodExpire             = 0x60000016 //5101 //기간 만료(모바일키) ERR_VIRDI_PERIOD_EXPIRE
globals.ErrorVirdiDisCordPhoneNumber       = 0x60000017 //5102 //전화번호 불일치(모바일키) ERR_VIRDI_DISCORD_PHONENUMBER
globals.ErrorVirdiFailMealPay              = 0x60000018 //3011 // 식단가 미등록	 ERR_VIRDI_FAIL_MEALPAY
globals.ErrorVirdiFailMealTime             = 0x60000019 //3012 // 식사시간 불가 ERR_VIRDI_FAIL_MEALTIME
globals.ErrorVirdiNotExistsMealCode        = 0x6000001A //3013 // 식수코드 미등록 ERR_VIRDI_FAIL_NOT_EXISTS_MEALCODE
globals.ErrorVirdiFailPeriod               = 0x6000001B //3014 // 식수기간제한 ERR_VIRDI_FAIL_PERIOD
globals.ErrorVirdiMealLimit                = 0x6000001C //3015 // 끼니제한 ERR_VIRDI_FAIL_MEAL_LIMIT
globals.ErrorVirdiFailDayLimit             = 0x6000001D //3016 // 일제한 ERR_VIRDI_FAIL_DAY_LIMIT
globals.ErrorVirdiFailMonthLimit           = 0x6000001E //3017 // 월제한 ERR_VIRDI_FAIL_MONTH_LIMIT

// Terminal user management related
globals.ErrorVirdiUserAdd              = 0x6000001F //5001 ERR_VIRDI_USER_ADD
globals.ErrorVirdiNotEnoughMemory      = 0x60000020 //5002 ERR_VIRDI_NOT_ENOUGH_MEMORY
globals.ErrorVirdiInvalidUserRequested = 0x60000021 //5006 ERR_VIRDI_INVALID_USER_REQUESTED
globals.ErrorVirdiVersionError         = 0x60000022 //5007 ERR_VIRDI_VERSION_ERROR
globals.ErrorVirdiSimilarFingerprint   = 0x60000023 //7006 ERR_VIRDI_SIMILAR_FINGERPRINT

// Supported function related
globals.ErrorVirdiNotSupportedFunction = 0x60000024 //5004 ERR_VIRDI_NOT_SUPPORTED_FUNCTION

// Firmware upgrade
globals.ErrorVirdiFlashWriting    = 0x60000025 //5005 ERR_VIRDI_FLASH_WRITING
globals.ErrorVirdiFirmwareVersion = 0x60000026 //5007 ERR_VIRDI_FIRMWARE_VERSION
globals.ErrorVirdiNoLicense       = 0x60000027 //5050 ERR_VIRDI_NO_LICENSE

// Unknown
globals.ErrorVirdiUnknown = 0x60000028 //6000 ERR_VIRDI_UNKNOWN

// OEM
globals.ErrorTicketInvalid = 0x70000005	// 베트남 주차 관제 정기권 중복
globals.ErrorDelTicketInvalid = 0x70000006 // 베트남 주차 관제 그룹 정기권 삭제불가
globals.ErrorTicketFialbyGroup = 0x70000007 // 베트남 주차 관제 그룹 있는 사람 개별 정기권 불가 
globals.ErrorDailyPaymentExist = 0x70000008// 당일 결제 내역 존재
globals.ErrorIToneSFTPWriteFailed = 0x7F000020  // SFTP 파일 읽기 에러 (didn't open file)
globals.ErrorIToneSFTPConnectFailed = 0x7F000021 // SFTP 연결 실패
globals.ErrorIToneSFTPUnable = 0x7F000022 //  SFTP 권한 없음


globals.ErrorVurixAPIServerRequestFailed    = 0x7000001A // Vurix API 서버 요청 실패
globals.ErrorVurixAPIResponseMarshalingFail = 0x7000001B // Vurix API response json marshaling 실패
globals.ErrorEventViewDeleteFailed          = 0x7000001C // EventView 파일 삭제 실패
globals.ErrorVurixLoginFailed          = 0x7000001D // Vurix Login 실패
globals.ErrorUnRegisteredCoreFlag          = 0x7000001E // Core 단말기가 아님

globals.ErrorMaxPartnerAdmin = 0x7000002A // 현대중공업 협력사 관리자 최대 명수 초과 (2명)
globals.ErrorRegistUserPartnerAdmin = 0x7000002B // 현대중공업 협력사에 속하지 않은 사용자를 협력사 관리자로 설정 불가

// OEM_REMOTE_FAW_MANAGEMENT
globals.ErrorNotExistUseAuthTerminal = 0x70000031 // 인증용으로 설정된 단말기 없음(유사 얼굴 체크 불가)
globals.ErrorUseAuthTerminalStatus   = 0x70000032 // 인증용으로 설정된 단말기 상태 오류(여러 개 중 단 하나라도 연결 상태 오류인 경우)
globals.ErrorFawSimilarCheck = 0x70000033 // 유사얼굴 체크 실패
globals.ErrorNotExistAuthTerminalUser = 0x70000034 // custom_auth_terminal_users 테이블에 사용자 없음
globals.ErrorOmitFawSimilarCheck = 0x70000035 // 유사얼굴 체크를 하지 않음.

// Pro2 FAW
globals.ErrorFAWRegistCancel = 0x35303031 // 프로2 단말기 얼굴 등록 요청 후에 단말기에서 취소 버튼 클릭시

globals.getErrorString = function( errCode ){
	var errMsg = "";
	errCode = Number(errCode)
	switch ( errCode ){		

		case -2: 									errMsg = "Str_ErrorPacketTimeout"; break;
        case -1: 									errMsg = "Str_ErrorComeNetwork"; break; //COMERROR_NET_ERROR
        case 0:										errMsg = "Str_Success"; break;
		
		case ErrorInvalidParameter:  				errMsg = "Str_InvalidParamater"; break;
		case ErrorAuthorizeFailed: 					errMsg ="Str_ErrorAuthorizeFailed"; break;
		case ErrorDataNotExist: 					errMsg = "Str_ErrorDataNotExist"; break;
		case ErrorMismatched:                 		errMsg = "Str_ErrorMismatched"; break;
		case ErrorDataServerConnectionFailed: 		errMsg = "Str_ErrorDataServerConnectionFailed"; break;
		case ErrorInternalServerError:        		errMsg = "Str_ErrorInternalServerError"; break;
		case ErrorNotPermission:              		errMsg = "Str_ErrorNotPermission"; break;
		case ErrorPacketTimeout:              		errMsg = "Str_ErrorPacketTimeout"; break;
		case ErrorProtoMarshalFail:           		errMsg = "Str_ErrorProtoMarshalFail"; break;
		case ErrorProtoUnMarshalFail:         		errMsg = "Str_ErrorProtoUnMarshalFail"; break;
		case ErrorSkip:                       		errMsg = "Str_ErrorSkip"; break;
		case ErrorNotLoginState:              		errMsg = "Str_ErrorNotLoginState"; break; // 로그인 상태가 아닌 경우
		case ErrorInvalidServerID:            		errMsg = "Str_ErrorInvalidServerID"; break; //
		case ErrorUserConnectionMaxExceed:    		errMsg = "Str_ErrorUserConnectionMaxExceed"; break; //
		case ErrorUndefinedErrorCode:				errMsg = "Str_ErrorUndefinedErrorCode"; break; // 정의되지 않은 에러 코드
		case ErrorPackingFailed:              		errMsg = "Str_ErrorPackingFailed"; break; // 정의되지 않은 에러 코드
		case ErrorParameter:                  		errMsg = "Str_ErrorParameter"; break; // virdiType 에러 디파인 값 필요
		case ErrorOemVersion:                 		errMsg = "Str_ErrorOemVersion"; break; // OEMVersion 잘못된경우 에러 코드
		case ErrorNoAvailableASServer:        		errMsg = "Str_ErrorNoAvailableASServer"; break; // AS 서버 연결 에러
		case ErrorSessionInfo:                		errMsg = "Str_ErrorSessionInfo"; break; // 세션 정보 불일치
		case ErrorSessionTimeOut:             		errMsg = "Str_ErrorSessionTimeOut"; break; // 세션 정보 타임아웃
		case ErrorInvalidPeriod: 					errMsg = "Str_ErrorInvalidPeriod"; break;
		case ErrorJsonUnmarshalFail:				errMsg = "Str_ErrorJsonUnmarshalFailed"; break;
		case ErrorNameExist: 						errMsg = "Str_ErrorNameExist"; break;
		case ErrorFileCreateFailed:					errMsg = "Str_ErrorFileCreateFailed"; break;
		case ErrorFileWriteFailed:					errMsg = "Str_ErrorFileWriteFailed"; break;
		case ErrorConnectionFailed:					errMsg = "Str_ErrorConnectionFailed"; break;
		case ErrorIDDuplicated:						errMsg = "Str_ErrorIDDuplicated"; break;	
		case ErrorFileExtention:					errMsg = "Str_ErrorFileExtention"; break;
		case ErrorFileNotExist:						errMsg = "Str_ErrorFileNotExist"; break;
		case ErrorUserCancel:						errMsg = "Str_ErrorUserCancel"; break;
		case ErrorASDataStateInitialized: 	errMsg = "Str_ErrorASDataStateInitialized"; break;
		case ErrorUserInvalidIrisData:            	errMsg = "Str_ErrorUserInvalidIrisData"; break;
		case ErrorUserDuplicateCarNumber:          errMsg = "Str_ErrorUserDuplicateCarNumber"; break;
		case ErrorUserCardNotExist:                errMsg = "Str_ErrorUserCardNotExist"; break;
		case ErrorUserCardNotMatched:              errMsg = "Str_ErrorUserCardNotMatched"; break;	
		case ErrorNotDuplicateUserName:                errMsg = "Str_ErrorNotDuplicateUserName"; break;
		case ErrorUserRfCardNotExist:              errMsg = "Str_ErrorUserRfCardNotExist"; break;	
		case ErrorUserPictureSize:              errMsg = "Str_ErrorUserPictureSize"; break;
		case ErrorUserCardValueTooLong:              errMsg = "Str_ErrorUserCardValueTooLong"; break;
		case ErrorDecoding:             	errMsg = "Str_ErrorDecoding"; break;
		case ErrorTemplateFormat:              errMsg = "Str_ErrorTemplateFormat"; break;
		case ErrorFileName:						 errMsg = "Str_ErrorFileName"; break;
		
		case ErrorOptionPwdBlank:			 errMsg = "Str_ErrorOptionPwdBlank"; break;
		case ErrorOptionPwdRepeatChar:		 errMsg = "Str_ErrorOptionPwdRepeatChar"; break;
		case ErrorOptionPwdSameID:			 errMsg = "Str_ErrorOptionPwdSameID"; break;
		case ErrorOptionPwdUpper:			 errMsg = "Str_ErrorOptionPwdUpper"; break;
		case ErrorOptionPwdLower:		 	 errMsg = "Str_ErrorOptionPwdLower"; break;
		case ErrorOptionPwdNumber:		 	 errMsg = "Str_ErrorOptionPwdNumber"; break;
		case ErrorOptionPwdSymbol:		 	 errMsg = "Str_ErrorOptionPwdSymbol"; break;
		case ErrorOptionPwdLength:		 	 errMsg = "Str_ErrorOptionPwdLength"; break;
		
		case ErrorActionTrycatch01:              errMsg = "Str_ErrorActionTrycatch01"; break;
		case ErrorActionTrycatch02:              errMsg = "Str_ErrorActionTrycatch02"; break;
		case ErrorActionTrycatch03:              errMsg = "Str_ErrorActionTrycatch03"; break;
		case ErrorActionTrycatch04:              errMsg = "Str_ErrorActionTrycatch04"; break;
		
		case ErrorDatabase: 						errMsg = "Str_ErrorDatabase"; break;

		case ErrorUserDuplicateID:          		 errMsg = "Str_ErrorUserDuplicateID"; break;
		case ErrorUserNotExist: 					 errMsg = "Str_ErrorUserNotExist"; break;
		case ErrorUserInvalidFPData: 				 errMsg = "Str_FPDataNotExist"; break;
		case ErrorUserAuthenticationFailed: 		 errMsg = "Str_ErrorUserAuthenticationFailed"; break;
		case ErrorUserInvalidID:            		 errMsg = "Str_ErrorUserInvalidID"; break;
		case ErrorReDuplicateUniqueId:      		 errMsg = "Str_ErrorReDuplicateUniqueId"; break;
		case ErrorReDuplicateNotUniqueId:   		 errMsg = "Str_ErrorReDuplicateNotUniqueId"; break;
		case ErrorUserExist:                		 errMsg = "Str_ErrorUserExist"; break;	
		case ErrorUserNameInvalid:					 errMsg = "Str_InvalidUserName"; break;
		case ErrorUserAuthTypeInvalid:				 errMsg = "Str_InvalidAuthType"; break;	
		case ErrorUserUniqueIDInvalid:				 errMsg = "Str_InvalidUniqueID"; break;
		case ErrorUserPasswordInvalid:				 errMsg = "Str_InvalidPassword"; break;
		case ErrorUserSimilarFingerprint: 			 errMsg = "Str_ErrorSmimilarFingerprint"; break;
		case ErrorUserOldLoginPasswordDuplicate:	 errMsg = "Str_ErrorUserOldLoginPasswordDuplicate"; break;
		case ErrorUserLoginPasswordExpirationDate:   errMsg = "Str_ErrorUserLoginPasswordExpirationDate"; break;
		case ErrorUserLoginFailCount:                errMsg = "Str_ErrorUserLoginFailCount"; break;
		case ErrorUserLoginPasswordWrongInput:       errMsg = "Str_ErrorUserLoginPasswordWrongInput"; break;
		case ErrorUserRfCardDuplicate:      		 errMsg = "Str_ErrorUserRfCardDuplicate"; break;
		case ErrorUserSimilarFace:					 errMsg = "Str_ErrorSmimilarFace"; break;
		case ErrorUserSimilarCard:					 errMsg = "Str_ErrorSmimilarCard"; break;
		case ErrorUserInvalidUsePeriod:              errMsg = "Str_ErrorUserInvalidUsePeriod"; break;
		case ErrorUserInvalidFAData:        		 errMsg = "Str_FaceDataNotExist"; break;
		case ErrorUserInvalidLoginPwd:      		 errMsg = "Str_ErrorUserInvalidLoginPwd"; break;
		case ErrorUserInvalidLoginAllow:    		 errMsg = "Str_ErrorUserInvalidLoginAllow"; break;
		case ErrorUserLoginPasswordDuplicate:        errMsg = "Str_ErrorUserLoginPasswordDuplicate"; break;
		case ErrorUserBlackListStatus:               errMsg = "Str_ErrorUserBlackListStatus"; break;
		case ErrorUserInvalidFaceWTData:			errMsg = "Str_ErrorUserInvalidFaceWTData"; break;
		case ErrorUserInvalidIrisData:				errMsg = "Str_ErrorUserInvalidIrisData"; break;
		

		case ErrorTerminalInvalidStatus: 			errMsg = "Str_ErrorTerminalInvalidStatus"; break;
		case ErrorTerminalIDDuplication:			errMsg = "Str_ErrorTerminalIDDuplication"; break;
		case ErrorTerminalNotRegistered:			errMsg = "Str_ErrorTerminalNotRegistered"; break;
		case ErrorTerminalNotConnected:				errMsg = "Str_ErrorTerminalNotConnected"; break;
		case ErrorTerminalAnotherProcess:			errMsg = "Str_ErrorTerminalAnotherProcess"; break;
		case ErrorTerminalNotSupportFunc:			errMsg = "Str_ErrorTerminalNotSupportFunc"; break;
		case ErrorTerminalNotSupportTerminal:		errMsg = "Str_ErrorTerminalNotSupportTerminal"; break;
		case ErrorTerminalMaxExceed: 				errMsg="Str_ErrorTerminalMaxExceed"; break;
		case ErrorCoreTerminalLimit:				errMsg = "Str_ErrorCoreTerminalLimit"; break;
	
		// terminal user
		case ErrorTerminalUserOccur:           		errMsg = "Str_ErrorTerminalUserOccur"; break;
		case ErrorTerminalUserOccurButProceed: 		errMsg = "Str_ErrorTerminalUserOccurButProceed"; break;
	
		// Terminal Capture
		case ErrorTerminalFpCaptuer: 				errMsg = "Str_ErrorTerminalFpCaptuer"; break;
	
		// terminal return
		case ErrorTerminalSaveUser:    		errMsg = "Str_ErrorTerminalSaveUser"; break;
		case ErrorTerminalLoadUser:    		errMsg = "Str_ErrorTerminalLoadUser"; break;
		case ErrorTerminalNoUser:      		errMsg = "Str_ErrorTerminalNoUser"; break;
		case ErrorTerminalExistUser:   		errMsg = "Str_ErrorTerminalExistUser"; break;
		case ErrorTerminalDeleteFP:    		errMsg = "Str_ErrorTerminalDeleteFP"; break;
		case ErrorTerminalUserFull:    		errMsg = "Str_ErrorTerminalUserFull"; break;
		case ErrorTerminalUpdateUser:  		errMsg = "Str_ErrorTerminalUpdateUser"; break;
		case ErrorTerminalDuplicateRF: 		errMsg = "Str_ErrorTerminalDuplicateRF"; break;
		case ErrorNotExistPacket: 			errMsg = "Str_ErrorNotExistTerminalPacket"; break;
		
		case ErrorFacewtNoFace: 			errMsg = "Str_ErrorFacewtNoFace"; break;
		case ErrorFacewtMultiFace: 			errMsg = "Str_ErrorFacewtMultiFace"; break;
		case ErrorFacewtSmall: 			errMsg = "Str_ErrorFacewtSmall"; break;
		case ErrorFacewtLowScore: 			errMsg = "Str_ErrorFacewtLowScore"; break;
		case ErrorFacewtSideFace:			errMsg = "Str_ErrorFacewtSideFace"; break;
		case ErrorFacewtVague: 			errMsg = "Str_ErrorFacewtVague"; break;
		case ErrorFacewtTooFar: 			errMsg = "Str_ErrorFacewtTooFar"; break;
		case ErrorFacewtRecogFail: 			errMsg = "Str_ErrorFacewtRecogFail"; break;
		case ErrorFacewtParam: 			errMsg = "Str_ErrorFacewtParam"; break;
		case ErrorFacewtNoFile: 			errMsg = "Str_ErrorFacewtNoFile"; break;
		case ErrorFacewtChip: 			errMsg = "Str_ErrorFacewtChip"; break;
		case ErrorFacewtCertification: 			errMsg = "Str_ErrorFacewtCertification"; break;
		case ErrorFacewtMaxUser: 			errMsg = "Str_ErrorFacewtMaxUser"; break;
		case ErrorFacewtTimeout: 			errMsg = "Str_ErrorFacewtTimeout"; break;
		case ErrorMtcSmallSize: 			errMsg = "Str_ErrorMtcSmallSize"; break;
		case ErrorMtcBigSize: 			errMsg = "Str_ErrorMtcBigSize"; break;
		
		case ErrorWearingMask: 				errMsg = "Str_ErrorWearingMask"; break;
		case ErrorImageBroken: 				errMsg = "Str_ErrorImageBroken"; break;
	//	case ErrorTerminalFlashWriting: 	errMsg = "Str_ErrorTerminalFlashWriting"; break;
		
		case ErrorGroupDuplicateID: 		errMsg = "Str_ErrorGroupDuplicateID"; break;
		case ErrorGroupNotExistID: 			errMsg = "Str_ErrorGroupNotExistID"; break;
		case ErrorGroupNotExistParentID: 	errMsg = "Str_ErrorGroupNotExistParentID"; break;
		case ErrorGroupInvalidInfo: 		errMsg = "Str_ErrorGroupInvalidInfo"; break;
		case ErrorGroupInvalidID: 			errMsg = "Str_ErrorGroupInvalidID"; break;
		case ErrorGroupInvalidParentID: 	errMsg = "Str_ErrorGroupInvalidParentID"; break;
		case ErrorGroupDuplicateName: 		errMsg = "Str_ErrorGroupDuplicateName"; break;
		case ErrorGroupCountMaxExceed: 		errMsg = "Str_ErrorGroupCountMaxExceed"; break;
		case ErrorGroupNoSearchResult: 		errMsg = "Str_ErrorGroupNoSearchResult"; break;
		case ErrorGroupMaxDepthExceed: 		errMsg = "Str_ErrorGroupMaxDepthExceed"; break;
	
		case ErrorPrivilegeDuplicateID:				errMsg = "Str_ErrorPrivilegeDuplicateID"; break;
		case ErrorPrivilegeNotExist:				errMsg = "Str_ErrorPrivilegeNotExist"; break;
		case ErrorPrivilegeInvalidID:				errMsg = "Str_ErrorPrivilegeInvalidID"; break;
		case ErrorPrivilegeInvalidName:				errMsg = "Str_ErrorPrivilegeInvalidName"; break;
		case ErrorPrivilegeNotPermission:			errMsg = "Str_ErrorPrivilegeNotPermission"; break;
		case ErrorPrivilegeNotPermissionUser:		errMsg = "Str_ErrorPrivilegeNotPermissionUser"; break;
		case ErrorPrivilegeNotPermissionTerminal:	errMsg = "Str_ErrorPrivilegeNotPermissionTerminal"; break;
		case ErrorPrivilegeNotPermissionGroup:		errMsg = "Str_ErrorPrivilegeNotPermissionGroup"; break;
		
		case ErrorTimezoneDuplicateID: 			errMsg = "Str_ErrorTimezoneDuplicateID"; break;
		case ErrorTimezoneNotExist: 			errMsg = "Str_ErrorTimezoneNotExist"; break;
		case ErrorTimezoneInvalidID: 			errMsg = "Str_ErrorTimezoneInvalidID"; break;
		case ErrorTimezoneInvalidName: 			errMsg = "Str_ErrorTimezoneInvalidName"; break;
		case ErrorTimezoneInvalidTime: 			errMsg = "Str_ErrorTimezoneInvalidTime"; break;
		case ErrorTimezoneInvalidTimeFormat: 	errMsg = "Str_ErrorTimezoneInvalidTimeFormat"; break;
		case ErrorTimezoneNotExistTime: 		errMsg = "Str_ErrorTimezoneNotExistTime"; break;
		case ErrorTimezoneNotExistTimeline: 	errMsg = "Str_ErrorTimezoneNotExistTimeline"; break;
		case ErrorTimezoneNotExistHoliday: 		errMsg = "Str_ErrorTimezoneNotExistHoliday"; break;

		case ErrorAPBNotExistTerminalID: 		errMsg = "Str_ErrorAPBNotExistTerminalID"; break;
		case ErrorAPBNotExistAreaID: 			errMsg = "Str_ErrorAPBNotExistAreaID"; break;
		case ErrorAPBDuplicateTerminalID: 		errMsg = "Str_ErrorAPBDuplicateTerminalID"; break;
		case ErrorAPBDuplicateAreaID: 			errMsg = "Str_ErrorAPBDuplicateAreaID"; break;
		case ErrorAPBInvalidTerminalID: 		errMsg = "Str_ErrorAPBInvalidTerminalID"; break;
		case ErrorAPBInvalidAreaID: 			errMsg = "Str_ErrorAPBInvalidAreaID"; break;
		case ErrorAPBInvalidStatus: 			errMsg = "Str_ErrorAPBInvalidStatus"; break;

		case ErrorAPBAreaDuplicateID: 			errMsg = "Str_ErrorAPBAreaDuplicateID"; break;
		case ErrorAPBAreaNotExist: 				errMsg = "Str_ErrorAPBAreaNotExist"; break;
		case ErrorAPBAreaInvalidID: 			errMsg = "Str_ErrorAPBAreaInvalidID"; break;
		case ErrorAPBAreaInvalidName: 			errMsg = "Str_ErrorAPBAreaInvalidName"; break;
 
		// terminal return
		case ErrorAPBTerminalFail: 				errMsg = "Str_ErrorAPBTerminalFail"; break;

		case ErrorPositionDuplicateID: 			errMsg = "Str_ErrorPositionDuplicateID"; break;
		case ErrorPositionNotExist: 			errMsg = "Str_ErrorPositionNotExist"; break;
		case ErrorPositionInvalidID: 			errMsg = "Str_ErrorPositionInvalidID"; break;
		case ErrorPositionInvalidName: 			errMsg = "Str_ErrorPositionInvalidName"; break;
		case ErrorPositionDuplicateName: 		errMsg = "Str_ErrorPositionDuplicateName"; break;

		case ErrorMessageDuplicateID: 			errMsg = "Str_ErrorMessageDuplicateID"; break;
		case ErrorMessageNotExist: 				errMsg = "Str_ErrorMessageNotExist"; break;
		case ErrorMessageInvalidID: 			errMsg = "Str_ErrorMessageInvalidID"; break;
		case ErrorMessageInvalidMessage: 		errMsg = "Str_ErrorMessageInvalidMessage"; break;

		case ErrorNoticeDuplicateID: 			errMsg = "Str_ErrorNoticeDuplicateID"; break;
		case ErrorNoticeNotExist: 				errMsg = "Str_ErrorNoticeNotExist"; break;
		case ErrorNoticeInvalidID: 				errMsg = "Str_ErrorNoticeInvalidID"; break;
		case ErrorNoticeInvalidMessage: 		errMsg = "Str_ErrorNoticeInvalidMessage"; break;

		case ErrorWiegandDuplicateCode: 		errMsg = "Str_ErrorWiegandDuplicateCode"; break;
		case ErrorWiegandNotExist: 				errMsg = "Str_ErrorWiegandNotExist"; break;
		case ErrorWiegandInvalidCode: 			errMsg = "Str_ErrorWiegandInvalidCode"; break;
		case ErrorWiegandInvalidData: 			errMsg = "Str_ErrorWiegandInvalidData"; break;

		case ErrorLicenseInitializeFail: 		errMsg = "Str_ErrorLicenseInitializeFail"; break;
		case ErrorLicenseNotAlpetaLicense: 		errMsg = "Str_ErrorLicenseNotAlpetaLicense"; break;
		case ErrorLicenseDecryptFail: 			errMsg = "Str_ErrorLicenseDecryptFail"; break;
		case ErrorLicenseInvalidStart: 			errMsg = "Str_ErrorLicenseInvalidStart"; break;
		case ErrorLicenseExired: 				errMsg = "Str_ErrorLicenseExired"; break;
		case ErrorTerminalNoLicense: 			errMsg = "Str_ErrorTerminalNoLicense"; break;		
		case ErrorLicenseInvalidMac: 			errMsg = "Str_ErrorLicenseInvalidMac"; break;
		case ErrorLicenseInvalidFunc: 			errMsg = "Str_ErrorLicenseInvalidFunc"; break;
		case ErrorSerialKeyCreateFail: 			errMsg = "Str_ErrorSerialKeyCreateFail"; break;
		case ErrorLicenseInsertFail: 			errMsg = "Str_ErrorLicenseInsertFail"; break;
		case ErrorLicenseServerError: 			errMsg = "Str_ErrorLicenseServerError"; break;
		case ErrorLicenseActivationResError: 	errMsg = "Str_ErrorLicenseActivationResError"; break;
		case ErrorLicenseInvalidExpireDate: 	errMsg = "Str_ErrorLicenseInvalidExpireDate"; break;
		case ErrorLicenseEncryptFailed: 		errMsg = "Str_ErrorLicenseEncryptFailed"; break;
		case ErrorLicenseSerialKeyInvalid: 		errMsg = "Str_ErrorLicenseSerialKeyInvalid"; break;
		case ErrorLicenseNotIssueReadyState: 	errMsg = "Str_ErrorLicenseNotIssueReadyState"; break;
		case ErrorLicenseKeyCreateFail: 		errMsg = "Str_ErrorLicenseKeyCreateFail"; break;
		case ErrorLicenseKeyInvalid: 			errMsg = "Str_ErrorLicenseKeyInvalid"; break;
		case ErrorLicenseCustomerIDInvalid: 	errMsg = "Str_ErrorLicenseCustomerIDInvalid"; break;
		case ErrorLicenseMacaddressInvalid: 	errMsg = "Str_ErrorLicenseMacaddressInvalid"; break;
		case ErrorLicenseTypeInvalid: 			errMsg = "Str_ErrorLicenseTypeInvalid"; break;
		case ErrorLicenseSerialKeyNotExist: 	errMsg = "Str_ErrorLicenseSerialKeyNotExist"; break;
		case ErrorLicenseNotMatched: 			errMsg = "Str_ErrorLicenseNotMatched"; break;
		case ErrorLicenseUnavailableCore: 		errMsg = "Str_ErrorLicenseUnavailableCore"; break;
		
		case ErrorXkeyLicenseInvalidSiteCode: 		errMsg = "Str_ErrorXkeyLicenseInvalidSiteCode"; break;
		case ErrorXkeyLicenseInvalidPort: 			errMsg = "Str_ErrorXkeyLicenseInvalidPort"; break;
		case ErrorXkeyLicenseInvalidIP: 			errMsg = "Str_ErrorXkeyLicenseInvalidIP"; break;
		case ErrorXkeyLicenseDuplicateSiteCode: 	errMsg = "Str_ErrorXkeyLicenseDuplicateSiteCode"; break;
		case ErrorLicenseNotUbioXkeyLicense:		errMsg = "Str_ErrorLicenseNotUbioXkeyLicense"; break;
		
		case ErrorAnotherTaskProcessing: 		errMsg = "Str_ErrorAnotherTaskProcessing"; break; // 동일한 작업 타입의 다른 작업이 진행중일 경우
		
		case ErrorDB: errMsg = "Str_ErrorDB"; break;
		case ErrorDBSelect: 				errMsg = "Str_ErrorDBSelect"; break;
		// for create db
		case ErrorDBCreate: 				errMsg = "Str_ErrorDBCreate"; break;
		case ErrorDBConnectionFail: 		errMsg = "Str_ErrorDBConnectionFail"; break;
		case ErrorDBAleadyExist: 			errMsg = "Str_ErrorDBAleadyExist"; break;
		case ErrorDBAleadyExistUser: 		errMsg = "Str_ErrorDBAleadyExistUser"; break;
		case ErrorDBPackageNotFound: 		errMsg = "Str_ErrorDBPackageNotFound"; break;
		case ErrorDBCreateFolderFailed: 	errMsg = "Str_ErrorDBCreateFolderFailed"; break;
		case ErrorDBInstallFailed: 			errMsg = "Str_ErrorDBInstallFailed"; break;
		case ErrorDBUserCreateFailed: 		errMsg = "Str_ErrorDBUserCreateFailed"; break;
		case ErrorDBTableCreate: 			errMsg = "Str_ErrorDBTableCreate"; break;
		case ErrorDBNotExist: 				errMsg = "Str_ErrorDBNotExist"; break;
		case ErrorDBServiceStartFail: 		errMsg = "Str_ErrorDBServiceStartFail"; break;
		case ErrorOpenSCManagerFailed: 		errMsg = "Str_ErrorOpenSCManagerFailed"; break;
	
		case ErrorCountryCodeDataNotExist: 		errMsg = "Str_ErrorCountryCodeDataNotExist"; break;
		case ErrorCountryCodeFileNotExist: 		errMsg = "Str_ErrorCountryCodeFileNotExist"; break;
		case ErrorCountryCodeDuplicateKey: 		errMsg = "Str_ErrorCountryCodeDuplicateKey"; break;
		case ErrorCountryCodeJsonDecode: 		errMsg = "Str_ErrorCountryCodeJsonDecode"; break;
		case ErrorCountryCodeMatchingKey: 		errMsg = "Str_ErrorCountryCodeMatchingKey"; break;
				
		case ErrorCardStatusNotIssueReady:		errMsg = "Str_ErrorCardStatusNotIssueReady"; break;
		case ErrorCardStatusNotIssuanceStatus:		errMsg = "Str_ErrorCardStatusNotIssuanceStatus"; break;
		case ErrorCardStatusIsIssueStatus:		errMsg = "Str_ErrorCardStatusIsIssueStatus"; break;
		
		case ErrorAccessApplicationNotApproved:	errMsg = "Str_ErrorAccessApplicationNotApproved"; break;
		case ErrorAccessApplicationDuplicated:	errMsg = "Str_ErrorAccessApplicationDuplicated"; break;
		
		case ErrorTnaProcess: 					errMsg = "Str_ErrorTnaProcess"; break;
		case ErrorEditTnaProcess: 					errMsg = "Str_ErrorEditTnaProcess"; break;
		
		case ErrorMobileCardMasterKeyNone: 					errMsg = "Str_ErrorMobileCardMasterKeyNone"; break;
		case ErrorMobileCardContractNoNone: 					errMsg = "Str_ErrorMobileCardContractNoNone"; break;
		case ErrorMobileCardContractDeleted: 					errMsg = "Str_ErrorMobileCardContractDeleted"; break;
		case ErrorMobileCardMasterKeyInvalid: 					errMsg = "Str_ErrorMobileCardMasterKeyInvalid"; break;	
		
		case ErrorMobileCardServerError:      errMsg = "Str_ErrorMobileCardServerError"; break;
		case ErrorMobileCardParameterNotExist:      errMsg = "Str_ErrorMobileCardParameterNotExist"; break;
		case ErrorMobileCardParameterInvalid:      errMsg = "Str_ErrorMobileCardParameterInvalid"; break;
		case ErrorMobileCardSiteNotExist:      errMsg = "Str_ErrorMobileCardSiteNotExist"; break;

		case ErrorMobileCardMasterKeyNotExist:      errMsg = "Str_ErrorMobileCardMasterKeyNotExist"; break;
		case ErrorMobileCardMasterKeyEncryptFailed:      errMsg = "Str_ErrorMobileCardMasterKeyEncryptFailed"; break;
		
		case ErrorMobileCardAPINotExist:      errMsg = "Str_ErrorMobileCardAPINotExist"; break;
		case ErrorMobileCardSourceInvalid:      errMsg = "Str_ErrorMobileCardSourceInvalid"; break;
		case ErrorMobileCardJsonParsingFailed:      errMsg = "Str_ErrorMobileCardJsonParsingFailed"; break;
		case ErrorMobileCardServerException:      errMsg = "Str_ErrorMobileCardServerException"; break;
		case ErrorMobileCardDownloadCardNotExist:      errMsg = "Str_ErrorMobileCardDownloadCardNotExist"; break;
		
		case ErrorMobileCardAlreadyIssued:      errMsg = "Str_ErrorMobileCardAlreadyIssued"; break;
		case ErrorMobileCardSMSSendFailed:      errMsg = "Str_ErrorMobileCardSMSSendFailed"; break;
		case ErrorMobileCardEmailSendFailed:      errMsg = "Str_ErrorMobileCardEmailSendFailed"; break;
		case ErrorMobileCardPictureSaveFAiled:      errMsg = "Str_ErrorMobileCardPictureSaveFAiled"; break;
		case ErrorMobileCardM2KeyInitFailed:      errMsg = "Str_ErrorMobileCardM2KeyInitFailed"; break;
		case ErrorMobileCardLicenseMaxExceeded:      errMsg = "Str_ErrorMobileCardLicenseMaxExceeded"; break;
		case ErrorMobileCardCouponLicenseMaxExceeded:      errMsg = "Str_ErrorMobileCardCouponLicenseMaxExceeded"; break;
		case ErrorMobileCardEmployeeIDDuplicated:      errMsg = "Str_ErrorMobileCardEmployeeIDDuplicated"; break;
		case ErrorMobileCardUserIDDuplicated:      errMsg = "Str_ErrorMobileCardUserIDDuplicated"; break;
		case ErrorMobileCardCardInfoNotExist:      errMsg = "Str_ErrorMobileCardCardInfoNotExist"; break;
		case ErrorMobileCardAlreadyVisitorRegistered:      errMsg = "Str_ErrorMobileCardAlreadyVisitorRegistered"; break;
		case ErrorMobileCardAlreadyEmployeeRegistered:      errMsg = "Str_ErrorMobileCardAlreadyEmployeeRegistered"; break;
		case ErrorMobileCardAlreadyApplicationRegistered:      errMsg = "Str_ErrorMobileCardAlreadyApplicationRegistered"; break;
		case ErrorMobileCardDeleteCardTypeInvalid:      errMsg = "Str_ErrorMobileCardDeleteCardTypeInvalid"; break;
		case ErrorMobileCardIssuedCardTypeModify:      errMsg = "Str_ErrorMobileCardIssuedCardTypeModify"; break;
		case ErrorMobileCardVisitPeriodInvalid:      errMsg = "Str_ErrorMobileCardVisitPeriodInvalid"; break;
		case ErrorMobileCardDateFormatInvalid:      errMsg = "Str_ErrorMobileCardDateFormatInvalid"; break;
		case ErrorMobileCardPhoneAlreadyIssuedCard:      errMsg = "Str_ErrorMobileCardPhoneAlreadyIssuedCard"; break;
		case ErrorMobileCardDevicdInfoInvalid:      errMsg = "Str_ErrorMobileCardDevicdInfoInvalid"; break;
		case ErrorMobileCardCardInfoInvalid:      errMsg = "Str_ErrorMobileCardCardInfoInvalid"; break;
			
		case ErrorBSPInvalidHandle: 			errMsg = "Str_ErrorBSPInvalidHandle"; break;
		case ErrorBSPInvalidPointer: 			errMsg = "Str_ErrorBSPInvalidPointer"; break;
		case ErrorBSPInvalidType: 				errMsg = "Str_ErrorBSPInvalidType"; break;
		case ErrorBSPFunctionFail: 				errMsg = "Str_ErrorBSPFunctionFail"; break;
		case ErrorBSPStructtypeNotMatched: 		errMsg = "Str_ErrorBSPStructtypeNotMatched"; break;
		case ErrorBSPAlreadyProcessed: 			errMsg = "Str_ErrorBSPAlreadyProcessed"; break;
		case ErrorBSPExtractionOpenFail: 		errMsg = "Str_ErrorBSPExtractionOpenFail"; break;
		case ErrorBSPVerificationOpenFail: 		errMsg = "Str_ErrorBSPVerificationOpenFail"; break;
		case ErrorBSPDataProcessFail: 			errMsg = "Str_ErrorBSPDataProcessFail"; break;
		case ErrorBSPMustBeProcessedData: 		errMsg = "Str_ErrorBSPMustBeProcessedData"; break;
		case ErrorBSPInternalChecksumFail: 		errMsg = "Str_ErrorBSPInternalChecksumFail"; break;
		case ErrorBSPEncryptedDataError: 		errMsg = "Str_ErrorBSPEncryptedDataError"; break;
		case ErrorBSPUnknownFormat: 			errMsg = "Str_ErrorBSPUnknownFormat"; break;
		case ErrorBSPUnknownVersion: 			errMsg = "Str_ErrorBSPUnknownVersion"; break;
		case ErrorBSPValidityFail: 				errMsg = "Str_ErrorBSPValidityFail"; break;
		case ErrorBSPInitMaxfinger: 			errMsg = "Str_ErrorBSPInitMaxfinger"; break;
		case ErrorBSPInitSamplesperfinger: 		errMsg = "Str_ErrorBSPInitSamplesperfinger"; break;
		case ErrorBSPInitEnrollquality: 		errMsg = "Str_ErrorBSPInitEnrollquality"; break;
		case ErrorBSPInitVerifyquality: 		errMsg = "Str_ErrorBSPInitVerifyquality"; break;
		case ErrorBSPInitIdentifyquality: 		errMsg = "Str_ErrorBSPInitIdentifyquality"; break;
		case ErrorBSPInitSecuritylevel: 		errMsg = "Str_ErrorBSPInitSecuritylevel"; break;
		case ErrorBSPInvalidMinsize: 			errMsg = "Str_ErrorBSPInvalidMinsize"; break;
		case ErrorBSPInvalidTemplate: 			errMsg = "Str_ErrorBSPInvalidTemplate"; break;
		case ErrorBSPExpiredVersion: 			errMsg = "Str_ErrorBSPExpiredVersion"; break;
		case ErrorBSPInvalidSamplesperfinger: 	errMsg = "Str_ErrorBSPInvalidSamplesperfinger"; break;
		case ErrorBSPUnknownInputformat: 		errMsg = "Str_ErrorBSPUnknownInputformat"; break;
		case ErrorBSPInitEnrollSecuritylevel: 	errMsg = "Str_ErrorBSPInitEnrollSecuritylevel"; break;
		case ErrorBSPInitNecessaryenrollnum: 	errMsg = "Str_ErrorBSPInitNecessaryenrollnum"; break;
		case ErrorBSPInitReserved1: 			errMsg = "Str_ErrorBSPInitReserved1"; break;
		case ErrorBSPInitReserved2: 			errMsg = "Str_ErrorBSPInitReserved2"; break;
		case ErrorBSPInitReserved3: 			errMsg = "Str_ErrorBSPInitReserved3"; break;
		case ErrorBSPInitReserved4: 			errMsg = "Str_ErrorBSPInitReserved4"; break;
		case ErrorBSPInitReserved5: 			errMsg = "Str_ErrorBSPInitReserved5"; break;
		case ErrorBSPInitReserved6: 			errMsg = "Str_ErrorBSPInitReserved6"; break;
		case ErrorBSPInitReserved7: 			errMsg = "Str_ErrorBSPInitReserved7"; break;
		case ErrorBSPOutOfMemory: 				errMsg = "Str_ErrorBSPOutOfMemory"; break;
		case ErrorBSPDeviceOpenFail: 			errMsg = "Str_ErrorBSPDeviceOpenFail"; break;
		case ErrorBSPInvalidDeviceID: 			errMsg = "Str_ErrorBSPInvalidDeviceID"; break;
		case ErrorBSPWrongDeviceID: 			errMsg = "Str_ErrorBSPWrongDeviceID"; break;
		case ErrorBSPDeviceAlreadyOpened: 		errMsg = "Str_ErrorBSPDeviceAlreadyOpened"; break;
		case ErrorBSPDeviceNotOpened: 			errMsg = "Str_ErrorBSPDeviceNotOpened"; break;
		case ErrorBSPDeviceBrightness: 			errMsg = "Str_ErrorBSPDeviceBrightness"; break;
		case ErrorBSPDeviceContrast: 			errMsg = "Str_ErrorBSPDeviceContrast"; break;
		case ErrorBSPDeviceGain: 				errMsg = "Str_ErrorBSPDeviceGain"; break;
		case ErrorBSPLowversionDriver: 			errMsg = "Str_ErrorBSPLowversionDriver"; break;
		case ErrorBSPDeviceInitFail: 			errMsg = "Str_ErrorBSPDeviceInitFail"; break;
		case ErrorBSPDeviceLostDevice: 			errMsg = "Str_ErrorBSPDeviceLostDevice"; break;
		case ErrorBSPDeviceDllLoadFail: 		errMsg = "Str_ErrorBSPDeviceDllLoadFail"; break;
		case ErrorBSPDeviceMakeInstanceFail: 	errMsg = "Str_ErrorBSPDeviceMakeInstanceFail"; break;
		case ErrorBSPDeviceDllGetProcFail: 		errMsg = "Str_ErrorBSPDeviceDllGetProcFail"; break;
		case ErrorBSPDeviceIoControlFail: 		errMsg = "Str_ErrorBSPDeviceIoControlFail"; break;
		case ErrorBSPDeviceNotSupport: 			errMsg = "Str_ErrorBSPDeviceNotSupport"; break;
		case ErrorBSPDeviceLfd: 				errMsg = "Str_ErrorBSPDeviceLfd"; break;
		case ErrorBSPInvalidDeviceCode: 		errMsg = "Str_ErrorBSPInvalidDeviceCode"; break;
		case ErrorBSPUserCancel: 				errMsg = "Str_ErrorBSPUserCancel"; break;
		case ErrorBSPUserBack: 					errMsg = "Str_ErrorBSPUserBack"; break;
		case ErrorBSPCaptureTimeout: 			errMsg = "Str_ErrorBSPCaptureTimeout"; break;
		case ErrorBSPCaptureFakeSuspicious: 	errMsg = "Str_ErrorBSPCaptureFakeSuspicious"; break;
		case ErrorBSPEnrollEventPlace: 			errMsg = "Str_ErrorBSPEnrollEventPlace"; break;
		case ErrorBSPEnrollEventHold: 			errMsg = "Str_ErrorBSPEnrollEventHold"; break;
		case ErrorBSPEnrollEventRemove: 		errMsg = "Str_ErrorBSPEnrollEventRemove"; break;
		case ErrorBSPEnrollEventPlaceAgain: 	errMsg = "Str_ErrorBSPEnrollEventPlaceAgain"; break;
		case ErrorBSPEnrollEventExtract: 		errMsg = "Str_ErrorBSPEnrollEventExtract"; break;
		case ErrorBSPEnrollEventMatchFailed: 	errMsg = "Str_ErrorBSPEnrollEventMatchFailed"; break;
		case ErrorBSPInitMaxcandidate: 			errMsg = "Str_ErrorBSPInitMaxcandidate"; break;
		case ErrorBSPNsearchOpenFail: 			errMsg = "Str_ErrorBSPNsearchOpenFail"; break;
		case ErrorBSPNsearchInitFail: 			errMsg = "Str_ErrorBSPNsearchInitFail"; break;
		case ErrorBSPNsearchMemOverflow: 		errMsg = "Str_ErrorBSPNsearchMemOverflow"; break;
		case ErrorBSPNsearchSaveDb: 			errMsg = "Str_ErrorBSPNsearchSaveDb"; break;
		case ErrorBSPNsearchLoadDb: 			errMsg = "Str_ErrorBSPNsearchLoadDb"; break;
		case ErrorBSPNsearchInvaldTemplate: 	errMsg = "Str_ErrorBSPNsearchInvaldTemplate"; break;
		case ErrorBSPNsearchOverLimit: 			errMsg = "Str_ErrorBSPNsearchOverLimit"; break;
		case ErrorBSPNsearchIdentifyFail: 		errMsg = "Str_ErrorBSPNsearchIdentifyFail"; break;
		case ErrorBSPNsearchLicenseLoad: 		errMsg = "Str_ErrorBSPNsearchLicenseLoad"; break;
		case ErrorBSPNsearchLicenseKey: 		errMsg = "Str_ErrorBSPNsearchLicenseKey"; break;
		case ErrorBSPNsearchLicenseExpired: 	errMsg = "Str_ErrorBSPNsearchLicenseExpired"; break;
		case ErrorBSPNsearchDuplicatedID: 		errMsg = "Str_ErrorBSPNsearchDuplicatedID"; break;
		case ErrorBSPNsearchInvalidID: 			errMsg = "Str_ErrorBSPNsearchInvalidID"; break;
		case ErrorBSPImgconvInvalidParam: 		errMsg = "Str_ErrorBSPImgconvInvalidParam"; break;
		case ErrorBSPImgconvMemallocFail: 		errMsg = "Str_ErrorBSPImgconvMemallocFail"; break;
		case ErrorBSPImgconvFileopenFail: 		errMsg = "Str_ErrorBSPImgconvFileopenFail"; break;
		case ErrorBSPImgconvFilewriteFail: 		errMsg = "Str_ErrorBSPImgconvFilewriteFail"; break;
		case ErrorBSPInitPresearchrate: 		errMsg = "Str_ErrorBSPInitPresearchrate"; break;
		case ErrorBSPIndexsearchInitFail: 		errMsg = "Str_ErrorBSPIndexsearchInitFail"; break;
		case ErrorBSPIndexsearchSaveDB: 		errMsg = "Str_ErrorBSPIndexsearchSaveDB"; break;
		case ErrorBSPIndexsearchLoadDB: 		errMsg = "Str_ErrorBSPIndexsearchLoadDB"; break;
		case ErrorBSPIndexsearchUnknownVer: 	errMsg = "Str_ErrorBSPIndexsearchUnknownVer"; break;
		case ErrorBSPIndexsearchIdentifyFail: 	errMsg = "Str_ErrorBSPIndexsearchIdentifyFail"; break;
		case ErrorBSPIndexsearchDuplicatedID: 	errMsg = "Str_ErrorBSPIndexsearchDuplicatedID"; break;
		case ErrorBSPIndexsearchIdentifyStop: 	errMsg = "Str_ErrorBSPIndexsearchIdentifyStop"; break;
		
		case ErrorVisitApplicationNotExist: 	 errMsg = "Str_ErrorVisitApplicationNotExist"; break;
		case ErrorVisitApplicationNotApproved: 	 errMsg = "Str_ErrorVisitApplicationNotApproved"; break;
		case ErrorVisitApplicationExpired: 		 errMsg = "Str_ErrorVisitApplicationExpired"; break;
		case ErrorVisitVisitorInfoNotExist: 	 errMsg = "Str_ErrorVisitVisitorInfoNotExist"; break;
		case ErrorVisitVisitorAlreadyRegistered: errMsg = "Str_ErrorVisitVisitorAlreadyRegistered"; break;		
		case ErrorVisitVisitorNotRegistWaitState: errMsg = "Str_ErrorVisitVisitorNotRegistWaitState"; break;
		case ErrorVisitVisitorAccessgroupNotExist: errMsg = "Str_ErrorVisitVisitorAccessgroupNotExist"; break;
	
		case ErrorPurposeDuplicateID: 		errMsg = "Str_ErrorPurposeDuplicateID"; break;
		case ErrorPurposeNotExist: 			errMsg = "Str_ErrorPurposeNotExist"; break;
		case ErrorPurposeInvalidID: 		errMsg = "Str_ErrorPurposeInvalidID"; break;
		case ErrorPurposeInvalidName: 		errMsg = "Str_ErrorPurposeInvalidName"; break;

		case ErrorVisitDuplicateID: 		errMsg = "Str_ErrorVisitDuplicateID"; break;
		case ErrorVisitNotExist: 			errMsg = "Str_ErrorVisitNotExist"; break;
		case ErrorVisitInvalidID: 			errMsg = "Str_ErrorVisitInvalidID"; break;
		case ErrorVisitInvalidName: 		errMsg = "Str_ErrorVisitInvalidName"; break;
	
		case ErrorVirdiNone: 				errMsg = "Str_ErrorVirdiNone"; break; //0 ERR_VIRDI_NONE
		case ErrorVirdiResponseTimeout: 	errMsg = "Str_ErrorVirdiResponseTimeout"; break; //1010	ERR_VIRDI_RESPONSE_TIMEOUT
		case ErrorVirdiExtraData: 			errMsg = "Str_ErrorVirdiExtraData"; break; //1020 ERR_VIRDI_EXTRADATA
		case ErrorVirdiParameter: 			errMsg = "Str_ErrorVirdiParameter"; break; //1022	ERR_VIRDI_PARAMETER
		case ErrorVirdiCheckSum: 			errMsg = "Str_ErrorVirdiCheckSum"; break; //1030	ERR_VIRDI_CHECKSUM
		case ErrorVirdiFileError: 			errMsg = "Str_ErrorVirdiFileError"; break; //1040	ERR_VIRDI_FILE_ERROR
		case ErrorVirdiDbAccess: 			errMsg = "Str_ErrorVirdiDbAccess"; break; //2003	ERR_VIRDI_DB_ACCESS
		case ErrorVirdiProcessTimeOut: 		errMsg = "Str_ErrorVirdiProcessTimeOut"; break; //2010 // 단말기측 프로세서 타임아웃(by kks) ERR_VIRDI_PROCESS_TIMEOUT
		case ErrorVirdiUserCancel: 			errMsg = "Str_ErrorVirdiUserCancel"; break; //2090 // 사용자에 의한 프로세서 취소(by kks) ERR_VIRDI_USER_CANCEL

		// Terminal logon related
		case ErrorVirdiNoRegTerminal: 		errMsg = "Str_ErrorVirdiNoRegTerminal"; break; //3001 ERR_VIRDI_NOREG_TERMINAL
		case ErrorVirdiDuplicatedTerminal: 	errMsg = "Str_ErrorVirdiDuplicatedTerminal"; break; //3002 ERR_VIRDI_DUPLICATED_TERMINAL

		// Authentication related
		case ErrorVirdiInvalidUser: 				errMsg = "Str_ErrorVirdiInvalidUser"; break; //3004	ERR_VIRDI_INVALID_USER
		case ErrorVirdiMatching: 					errMsg = "Str_ErrorVirdiMatching"; break; //3005 ERR_VIRDI_MATCHING
		case ErrorVirdiPermisson: 					errMsg = "Str_ErrorVirdiPermisson"; break; //3006	ERR_VIRDI_PERMISSION
		case ErrorVirdiCapture: 					errMsg = "Str_ErrorVirdiCapture"; break; //3007 ERR_VIRDI_CAPTURE
		case ErrorVirdiDetection: 					errMsg = "Str_ErrorVirdiDetection"; break; //3008	ERR_VIRDI_FACE_DETECTION
		case ErrorVirdiServerBusy: 					errMsg = "Str_ErrorVirdiServerBusy"; break; //3009	ERR_VIRDI_SERVER_BUSY
		case ErrorVirdiBlackList: 					errMsg = "Str_ErrorVirdiBlackList"; break; //3010 ERR_VIRDI_BLACK_LIST
		case ErrorVirdiAntipassback: 				errMsg = "Str_ErrorVirdiAntipassback"; break; //4000 ERR_VIRDI_ANTIPASSBACK
		case ErrorVirdiSoftpassback: 				errMsg = "Str_ErrorVirdiSoftpassback"; break; //4003 ERR_VIRDI_SOFTPASSBACK
		case ErrorVirdiDuplicatedAuthentication: 	errMsg = "Str_ErrorVirdiDuplicatedAuthentication"; break; //5003 ERR_VIRDI_DUPLICATED_AUTHENTICATION
		case ErrorVirdiInvalidIssuecount: 			errMsg = "Str_ErrorVirdiInvalidIssuecount"; break; //5100 //발급차수 낮음 (모바일키) ERR_VIRDI_INVALID_ISSUE_COUNT
		case ErrorVirdiPeriodExpire: 				errMsg = "Str_ErrorVirdiPeriodExpire"; break; //5101 //기간 만료(모바일키) ERR_VIRDI_PERIOD_EXPIRE
		case ErrorVirdiDisCordPhoneNumber: 			errMsg = "Str_ErrorVirdiDisCordPhoneNumber"; break; //5102 //전화번호 불일치(모바일키) ERR_VIRDI_DISCORD_PHONENUMBER
		case ErrorVirdiFailMealPay: 				errMsg = "Str_ErrorVirdiFailMealPay"; break; //3011 // 식단가 미등록	 ERR_VIRDI_FAIL_MEALPAY
		case ErrorVirdiFailMealTime: 				errMsg = "Str_ErrorVirdiFailMealTime"; break; //3012 // 식사시간 불가 ERR_VIRDI_FAIL_MEALTIME
		case ErrorVirdiNotExistsMealCode: 			errMsg = "Str_ErrorVirdiNotExistsMealCode"; break; //3013 // 식수코드 미등록 ERR_VIRDI_FAIL_NOT_EXISTS_MEALCODE
		case ErrorVirdiFailPeriod: 					errMsg = "Str_ErrorVirdiFailPeriod"; break; //3014 // 식수기간제한 ERR_VIRDI_FAIL_PERIOD
		case ErrorVirdiMealLimit: 					errMsg = "Str_ErrorVirdiMealLimit"; break; //3015 // 끼니제한 ERR_VIRDI_FAIL_MEAL_LIMIT
		case ErrorVirdiFailDayLimit: 				errMsg = "Str_ErrorVirdiFailDayLimit"; break; //3016 // 일제한 ERR_VIRDI_FAIL_DAY_LIMIT
		case ErrorVirdiFailMonthLimit: 				errMsg = "Str_ErrorVirdiFailMonthLimit"; break; //3017 // 월제한 ERR_VIRDI_FAIL_MONTH_LIMIT

		// Terminal user management related
		case ErrorVirdiUserAdd: 				errMsg = "Str_ErrorVirdiUserAdd"; break; //5001 ERR_VIRDI_USER_ADD
		case ErrorVirdiNotEnoughMemory: 		errMsg = "Str_ErrorVirdiNotEnoughMemory"; break; //5002 ERR_VIRDI_NOT_ENOUGH_MEMORY
		case ErrorVirdiInvalidUserRequested: 	errMsg = "Str_ErrorVirdiInvalidUserRequested"; break; //5006 ERR_VIRDI_INVALID_USER_REQUESTED
		case ErrorVirdiVersionError: 			errMsg = "Str_ErrorVirdiVersionError"; break; //5007 ERR_VIRDI_VERSION_ERROR
		case ErrorVirdiSimilarFingerprint: 		errMsg = "Str_ErrorVirdiSimilarFingerprint"; break; //7006 ERR_VIRDI_SIMILAR_FINGERPRINT

		// Supported function related
		case ErrorVirdiNotSupportedFunction: 	errMsg = "Str_ErrorVirdiNotSupportedFunction"; break; //5004 ERR_VIRDI_NOT_SUPPORTED_FUNCTION

		// Firmware upgrade
		case ErrorVirdiFlashWriting: 			errMsg = "Str_ErrorVirdiFlashWriting"; break; //5005 ERR_VIRDI_FLASH_WRITING
		case ErrorVirdiFirmwareVersion: 		errMsg = "Str_ErrorVirdiFirmwareVersion"; break; //5007 ERR_VIRDI_FIRMWARE_VERSION
		case ErrorVirdiNoLicense: 				errMsg = "Str_ErrorVirdiNoLicense"; break; //5050 ERR_VIRDI_NO_LICENSE

		// Unknown
		case ErrorVirdiUnknown: 				errMsg = "Str_ErrorVirdiUnknown"; break; //6000 ERR_VIRDI_UNKNOWN
		
		case ErrorFAWRegistCancel:  				errMsg = "Str_ErrorFAWRegistCancel"; break;
		
		// OEM
		case ErrorTicketInvalid: 							errMsg = "Str_ErrorTicketInvalid"; break; // 0x70000005 베트남 주차관제 정기권 중복
		case ErrorDelTicketInvalid: 						errMsg = "Str_ErrorDelTicketInvalid"; break; // 0x70000006 베트남 주차관제 그룹 정기권 삭제불가
		case ErrorTicketFialbyGroup:						errMsg = "Str_ErrorTicketFialbyGroup"; break; // 0x70000007 베트남 주차관제 그룹 있는사람 개별 정기권 불가
		case ErrorDailyPaymentExist: 						errMsg = "Str_ErrorDailyPaymentExist"; break; // 0x70000008 당일 결제 내역 존재
		case ErrorVurixAPIServerRequestFailed:				errMsg = "Str_ErrorVurixAPIServerRequestFailed"; break; // Vurix API 서버 요청 실패
		case ErrorVurixAPIResponseMarshalingFail:			errMsg = "Str_ErrorVurixAPIResponseMarshalingFail"; break; // Vurix API response json marshaling 실패
		case ErrorEventViewDeleteFailed:					errMsg = "Str_ErrorEventViewDeleteFailed"; break; // EventView 파일 삭제 실패
		case ErrorVurixLoginFailed:					errMsg = "Str_ErrorVurixLoginFailed"; break; // Vurix Login 실패
		case ErrorUnRegisteredCoreFlag:					errMsg = "Str_ErrorUnRegisteredCoreFlag"; break; // Core 단말기가 아님

		case ERROR_ACCESS_PERIOD: 							errMsg = "Str_ErrorAccessPeriod"; break; // 0x7F000001  출입기간 에러
		case ERROR_CARD_TYPE: 								errMsg = "Str_ErrorCardType"; break; // 0x7F000002  카드 타입에러
		case ERROR_CARD_COUNT_MAX: 							errMsg = "Str_ErrorCardCountMax"; break; // 0x7F000003  카드 발급갯수 제한
		case ERROR_CARD_ISSUE_DUPLICATED: 					errMsg = "Str_ErrorCardIssueDuplicated"; break; // 0x7F000004  발급카드 중복
		case ERROR_CARD_ISSUE_STATUS_INVALID: 				errMsg = "Str_ErrorCardIssueStatusInvalid"; break; // 0x7F000005  카드발급 상태 잘못됨
		case ERROR_VISIT_REQUEST_NOT_EXIST: 				errMsg = "Str_ErrorVisitRequestNotExist"; break; // 0x7F000006  방문자 신청 정보 없음
		case ERROR_VISITOR_TYPE_INVALID: 					errMsg = "Str_ErrorVisitorTypeInvalid"; break; // 0x7F000007  방문자 신청 타입 잘못됨
		case ERROR_VISIT_PURPOSE_INVALID: 					errMsg = "Str_ErrorVisitPurposeInvalid"; break; // 0x7F000008  방문목적 미입
		case ERROR_VISIT_REQUEST_ACCESS_GROUP_NOT_EXIST: 	errMsg = "Str_ErrorVisitRequestAccessGroupNotExist"; break; // 0x7F000009  방문신청 출입부대 없음
		case ERROR_VISITOR_ID_REQUEST_INVALID: 				errMsg = "Str_ErrorVisitorIDRequestInvalid"; break; // 0x7F00000A  잘못된 방문자 ID 요청
		case ERROR_VISITOR_REQUEST_STATUS: 					errMsg = "Str_ErrorVisitorRequestStatus"; break; // 0x7F00000B  방문신청 상태 오류
		case ERROR_ALREADY_APPROVED_STATUS: 				errMsg = "Str_ErrorAlreadyApprovedStatus"; break; // 0x7F00000C  이미 승인된 상태
		case ERROR_ALREADY_DENIED_STATUS: 					errMsg = "Str_ErrorAleadyDeniedStatus"; break; // 0x7F00000D  이미 거부된 상태
		case ERROR_USER_INFO_INSERT_FAIL_FORVISITOR: 		errMsg = "Str_ErrorUserInfoInsertFailForvisitor"; break; // 0x7F00000E  방문객 발급기능 실패
		case ERROR_USER_FAMILY_REGIST: 						errMsg = "Str_ErrorUserFamilyRegist"; break; // 0x7F00000F  가족등록 실패
		case ERROR_USER_CAR_REGIST: 						errMsg = "Str_ErrorUserCarRegist"; break; // 0x7F000010  차량등록 에러
		case ERROR_LOGIN_FAIL_TIME: 						errMsg = "Str_ErrorLoginFailTime"; break; // 0x7F000011  로그인 실패
		case ERROR_UNREGISTED_CARD:	 						errMsg = "Str_ErrorUnRegistedCard"; break; // 0x7F000012 미등록된 카드
		case ERROR_USERINFO_UPDATE: 						errMsg = "Str_ErrorUserInfoUpdate"; break; // 0x7F000013 사용자정보 업데이트 실패
		case ERROR_USERINFO_ADD: 							errMsg = "Str_ErrorUserInfoAdd"; break; // 0x7F000014 사용자정보 추가 실패
		case ERROR_CARDINFO_DELETE: 						errMsg = "Str_ErrorCardInfoDelete"; break; // 0x7F000015 카드 정보 삭제 에러
		case ERROR_CARDINFO_ADD: 							errMsg = "Str_ErrorCardInfoAdd"; break; // 0x7F000016 카드 정보 추가 에러
		case ERROR_CARDINFO_UPDATE: 						errMsg = "Str_ErrorCardInfoUpdate"; break; // 0x7F000017 카드 정보 수정 에러
		case ERROR_VISITOR_ISSUE_STATUS_UPDATE: 			errMsg = "Str_ErrorVisitorIssueStatusUpdate"; break; // 0x7F000018 방문신청 상태 업데이트 실패
		case ErrorIToneSFTPWriteFailed: 			errMsg = "Str_ErrorIToneSFTPWriteFailed"; break;// SFTP 파일 읽기 에러 (didn't open file)
		case ErrorIToneSFTPConnectFailed: 			errMsg = "Str_ErrorIToneSFTPConnectFailede"; break;  // SFTP 연결 실패
		case ErrorIToneSFTPUnable: 					errMsg = "Str_ErrorIToneSFTPUnable"; break; //  SFTP 권한 없음
		case ErrorMaxPartnerAdmin: 					errMsg = "Str_ErrorMaxPartnerAdminHDHI"; break;
		case ErrorRegistUserPartnerAdmin: 					errMsg = "Str_ErrorRegistUserPartnerAdmin"; break;
		case ErrorMobileCardSiteMacAddr: 					errMsg = "Str_ErrorMobileCardSiteMacAddr"; break;
		case ErrorMobileCardSiteIpAddr: 					errMsg = "Str_ErrorMobileCardSiteIpAddr"; break;
		case ErrorMobileCardSiteNotExistIpAddr: 			errMsg = "Str_ErrorMobileCardSiteNotExistIpAddr"; break;
		case ErrorMobileCardMasterKeyAddrSetFailed: 		errMsg = "Str_ErrorMobileCardMasterKeyAddrSetFailed"; break;
		case ErrorNotExistUseAuthTerminal: 			errMsg = "Str_ErrorNotExistUseAuthTerminal"; break;	
		case ErrorUseAuthTerminalStatus: 			errMsg = "Str_ErrorUseAuthTerminalStatus"; break;
		case ErrorFawSimilarCheck: 			errMsg = "Str_ErrorFawSimilarCheck"; break;
		case ErrorNotExistAuthTerminalUser: 			errMsg = "Str_ErrorNotExistAuthTerminalUser"; break;
		case ErrorOmitFawSimilarCheck: 			errMsg = "Str_ErrorOmitFawSimilarCheck"; break;		
		
		case ERROR_UNKNOWN: 								errMsg = "Str_ErrorUnknown"; break; // 0x7FFFFFFF  알수없는 에러
		default : errMsg = "Str_ErrorUndefined"; break;
	}
	return errMsg;
}