/************************************************
 * UserAgentAnimate.module.js
 * Created at 2019. 6. 5. 오전 9:24:43.
 *
 * @author kth
 ************************************************/
 
globals.TerminalStatusUnRegist = -1 			// monitoring 사용 (단말기 연결-미등록 상태 표시위해서 추가함.)
globals.TerminalStatusDoorOpen = -2 			// monitoring 사용 (단말기 도어 열림 상태 표시를 위해서 추가함)
globals.TerminalStatusDoorClose = -3 			// monitoring 사용 (단말기 도어 닫힘 상태 표시를 위해서 추가함)
//---------------------------------------------------------------------------------------------------------
globals.TerminalStatusConnect	   = 1 << 0 // 연결 - 0:미연결, 1:연결
globals.TerminalStatusLock         = 1 << 1 // 잠김 - 0:해제, 1:잠김
globals.TerminalStatusLockForce    = 1 << 2 // 폐쇄 - 0:정상, 1:폐쇄
globals.TerminalStatusCover        = 1 << 3 // 커버 - 0:결합, 1:분리
globals.TerminalStatusRegist       = 1 << 4 // 등록 상태 - 0:미등록, 1:등록
globals.TerminalStatusIDConflict   = 1 << 5 // 아이디 충돌 - 0:정상, 1: 아이디 충돌
globals.TerminalStatusInvalidType  = 1 << 6 // 등록된 단말기 타입이 다름. - 0:정상, 1: 다름
// ----- 문 상태
globals.TerminalStatusDoor           = 1 << 7 // 도어 - 0:닫힘, 1:열림    
	
globals.TerminalStatusDoorEmergency  = 1 << 8 // 침입 - 0:정상, 1:침입
globals.TerminalStatusDoorOpenWarn   = 1 << 9 // 방치 - 0:정상, 1:방치
globals.TerminalStatusDoorNotMonitoring  = 1 << 23 // 문상태 미감시
globals.TerminalStatusDoorOpenState  = 1 << 24 // 출입문 개방 상태(출입문 개방 커맨드에 의해)
// 	----- 도어락
globals.TerminalStatusDoorLookState    = 1 << 10 // 상태 - 0:잠김, 1:열림
globals.TerminalStatusDoorLockWorking  = 1 << 11 // 동작 - 0:정상, 1:고장

// ----- 경고
globals.TerminalStatusWarnFire    = 1 << 12 // 화재 - 0:정상, 1:화재
globals.TerminalStatusWarnPanic   = 1 << 13 // 패닉 - 0:정상, 1:패닉
globals.TerminalStatusWarnCricis  = 1 << 14 // 위협 - 0:정상, 1:위협

// ----- 동기화
globals.TerminalStatusSyncUserIDLen  = 1 << 15 // 사용자 아이디 길이 - 0:일치, 1:다름
globals.TerminalStatusSyncMacAddres  = 1 << 16 // 맥 주소 - 0:정상, 1:다름
globals.TerminalStatusSyncUserCount  = 1 << 17 // 사용자 수 - 0:정상, 1:다름
globals.TerminalStatusSyncFWVersion  = 1 << 18 // 펌웨어 버전 - 0:정상, 1:다름

globals.TerminalStatusExternal1  = 1 << 19 // External1
globals.TerminalStatusExternal2  = 1 << 20 // External2
globals.TerminalStatusExternal3  = 1 << 21 // External3
globals.TerminalStatusExternal4  = 1 << 22 // External4



// 단말기 status 판단하기
globals.checkTerminalConnectionStatus = function(status){
	var connectFlag= 0; // 0 : 연결 안됨, 1 : 연결만 됨, 2 : 등록만 됨, 3: 등록 연결 둘다 됨
	if((status & TerminalStatusConnect) > 0 ) { // 연결된 상태
		connectFlag += 1; // 연결
	}
	
	if((status & TerminalStatusRegist) > 0 ) { // 등록된 상태
		connectFlag += 2; // 연결
	}
	return connectFlag;
}