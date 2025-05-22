/************************************************
 * jawoondae.module.js
 * Created at 2019. 11. 10. 오후 7:32:11.
 *
 * @author joymrk
 ************************************************/

globals.ERROR_USER_LOGINPASSWORD_EXPIRATION 		= 0x0100000F //(16777231)
globals.ERROR_USER_LOGIN_FAIL_COUNT 				= 0x01000011 //(16777233)
globals.ERROR_RFCARD_DUPLICATE                  	= 0x01000013 //(16777235)
globals.ERROR_ACCESS_PERIOD              			= 0x7F000001 // 출입기간 에러
globals.ERROR_CARD_TYPE                				= 0x7F000002 // 카드 타입에러
globals.ERROR_CARD_COUNT_MAX            			= 0x7F000003 // 카드 발급갯수 제한
globals.ERROR_CARD_ISSUE_DUPLICATED    				= 0x7F000004 // 발급카드 중복
globals.ERROR_CARD_ISSUE_STATUS_INVALID 			= 0x7F000005 // 카드발급 상태 잘못됨
globals.ERROR_VISIT_REQUEST_NOT_EXIST				= 0x7F000006 // 방문자 신청 정보 없음
globals.ERROR_VISITOR_TYPE_INVALID              	= 0x7F000007 // 방문자 신청 타입 잘못됨
globals.ERROR_VISIT_PURPOSE_INVALID             	= 0x7F000008 // 방문목적 미입
globals.ERROR_VISIT_REQUEST_ACCESS_GROUP_NOT_EXIST	= 0x7F000009 // 방문신청 출입부대 없음
globals.ERROR_VISITOR_ID_REQUEST_INVALID			= 0x7F00000A // 잘못된 방문자 ID 요청
globals.ERROR_VISITOR_REQUEST_STATUS				= 0x7F00000B // 방문신청 상태 오류
globals.ERROR_ALREADY_APPROVED_STATUS				= 0x7F00000C // 이미 승인된 상태
globals.ERROR_ALREADY_DENIED_STATUS             = 0x7F00000D // 이미 거부된 상태
globals.ERROR_USER_INFO_INSERT_FAIL_FORVISITOR		= 0x7F00000E // 방문객 발급기능 실패
globals.ERROR_USER_FAMILY_REGIST                	= 0x7F00000F // 가족등록 실패
globals.ERROR_USER_CAR_REGIST                   	= 0x7F000010 // 차량등록 에러
globals.ERROR_LOGIN_FAIL_TIME                   	= 0x7F000011 // 로그인 실패
globals.ERROR_UNREGISTED_CARD 						= 0x7F000012 //미등록된 카드
globals.ERROR_USERINFO_UPDATE 						= 0x7F000013 //사용자정보 업데이트 실패
globals.ERROR_USERINFO_ADD    						= 0x7F000014 //사용자정보 추가 실패
globals.ERROR_CARDINFO_DELETE 						= 0x7F000015 //카드 정보 삭제 에러
globals.ERROR_CARDINFO_ADD    						= 0x7F000016 //카드 정보 추가 에러
globals.ERROR_CARDINFO_UPDATE 						= 0x7F000017 //카드 정보 수정 에러
globals.ERROR_VISITOR_ISSUE_STATUS_UPDATE = 0x7F000018 //방문신청 상태 업데이트 실패
globals.ERROR_UNKNOWN                  = 0x7FFFFFFF // 알수없는 에러

globals.Jwd_Other_Unit = 901
globals.Jwd_Foreign = 902
globals.Jwd_Resident = 903
globals.Jwd_Always = 904
globals.Jwd_Soldier = 905
globals.Jwd_Family = 906
