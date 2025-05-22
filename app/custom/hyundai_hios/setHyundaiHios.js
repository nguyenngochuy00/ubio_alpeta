/************************************************
 * setHyundaiHios.js
 * Created at 2021. 8. 10. 오후 2:29:46.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var StrLib = cpr.core.Module.require("lib/StrLib");



/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	
	//get -> 가져오기
	//put -> 설정하기 -> 채널을 이용 설정정보 갱신하기 
	comLib.showLoadMask("","설정 정보가져오기","",0);	
	app.lookup("sms_getSetHios").send();
}

function onSms_getSetHiosSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var useFlag = app.lookup("SethyundaiHios").getValue("UseFlag");
		changeUseFlag(useFlag);
		app.lookup("HDHSM_grdMain").redraw();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_SubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_SubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * "적 용" 버튼(HDHSM_btnSave)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onHDHSM_btnSaveClick(/* cpr.events.CMouseEvent */ e){
	/*
	 * 설정입력값 체크기능 추가해야한다.
	 * 1. 127.0.0.1 아이피 사용불가
	 * 2. 포트에 알파벳 입력 금지
	 * 3. 각 키값들 자릿수 제한 
	 */
	var useFlag = app.lookup("HDHSM_cbxUseFlag").value;
	if (useFlag == 1) {//활성화 상태에서만 체크
		var ipAddress = app.lookup("HDHSM_ipbHiosIP").value;//주소
		if (ipAddress.length <= 0) {//
			dialogAlert(app, dataManager.getString("Str_Warning"), "ip 주소 또는 domain 정보가 입력 되지 않았습니다.");
			return;
		}
		if (ipAddress == "127.0.0.1") {
			dialogAlert(app, dataManager.getString("Str_Warning"), "127.0.0.1 값으로 활성화를 할 수 없습니다. ip 정보 또는 address를 입력해 주세요.");
			return;
		}
		var port = app.lookup("HDHSM_ipbHiosPort").value;
		if (port.length <= 0) {//미입력
			dialogAlert(app, dataManager.getString("Str_Warning"), "포트 정보를 정확히 입력해주세요.");
			return;
		}
		var systemToken = app.lookup("HDHSM_ipbSystemToken").value;
		if(systemToken.length <= 0) {
			dialogAlert(app, dataManager.getString("Str_Warning"), "system_token은 필수 입력값입니다. 반드시 입력해주세요");
			return;
		}
		
		var siteCD = app.lookup("HDHSM_ipbHiosSiteCD").value;
		if(siteCD.length <= 0) {
			dialogAlert(app, dataManager.getString("Str_Warning"), "사이트 코드는 필수 입력값입니다. 반드시 입력해주세요. 인사연동 정보에서 확인하시면 됩니다.");
			return;
		}
	} else {
		//비활성화 상태는 필요없다.
	}
	comLib.showLoadMask("","설정 정보 저장하기","",0);	
	app.lookup("sms_putSetHios").send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_putSetHiosSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		app.lookup("HDHSM_grdMain").redraw();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}
function changeUseFlag(useFlag) {
	if(useFlag == 1) {//체크
		//전체 화면 활성화
		app.lookup("HDHSM_ipbHiosIP").enabled = true;
		app.lookup("HDHSM_ipbHiosPort").enabled = true;
		app.lookup("HDHSM_ipbSystemToken").enabled = true;
	
	} else {//미체크
		//미활성화 및 경고창 생성
		app.lookup("HDHSM_ipbHiosIP").enabled = false;
		app.lookup("HDHSM_ipbHiosPort").enabled = false;
		app.lookup("HDHSM_ipbSystemToken").enabled = false;
	}
}

function onHDHSM_cbxUseFlagValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.CheckBox
	 */
	var hDHSM_cbxUseFlag = e.control;
	changeUseFlag(hDHSM_cbxUseFlag.value);	
	app.lookup("HDHSM_grdMain").redraw();
}

