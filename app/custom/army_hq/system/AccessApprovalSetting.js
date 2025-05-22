/************************************************
 * AccessApprovalSetting.js
 * Created at 2021. 4. 15. 오전 11:28:44.
 *
 * @author blue1
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	app.lookup("sms_getAccessApprovalSetting").send();	
}

// 저장 버튼 클릭 이벤트
function onSMSNM_btnSaveClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var sMSNM_btnSave = e.control;

	if ( saveAccessApprovalSettings() == 0 ) {
		app.lookup("sms_putAccessApprovalSetting").send();	
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "결재 옵션은 하나 이상 선택되어야 합니다.");
	}
	
}

/* 서브미션  */
function onSubmitError(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

function onSms_getAccessApprovalSettingSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		//console.log(app.lookup("AccessApprovalSettings").getRowDataRanged());
		reloadAccessApprovalSettings();
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_putAccessApprovalSettingSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), "설정이 저장 되었습니다.");
		app.lookup("sms_getAccessApprovalSetting").send();
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function reloadAccessApprovalSettings(){
	var setInfos = app.lookup("AccessApprovalSettings");
	var cnt = setInfos.getRowCount();
	for (var i=0; i < cnt; i++) {
		var setInfo = setInfos.getRow(i);
		var cntName = accessApprovalTypeToName(setInfo.getValue("ApprovalType"))
		app.lookup(cntName).selectItems(getAccessApprovalSettingArray(setInfo.getValue("ApprovalValue")));
	}
}

function sumArray(arr) {
	var sum = 0;
	for (var i=0; i < arr.length ; i++) {
		sum += Number(arr[i]);
	}
	return sum
}

function saveAccessApprovalSettings() {
	var setInfos = app.lookup("AccessApprovalSettings");
	var cnt = setInfos.getRowCount();
	for (var i=0; i < cnt; i++) {
		var setInfo = setInfos.getRow(i);
		var cntName = accessApprovalTypeToName(setInfo.getValue("ApprovalType"));
		
		var apValue = sumArray(app.lookup(cntName).values);
		if (apValue == 0) {
			return -1;
		}
		setInfo.setValue("ApprovalValue", apValue);
	}
	
	return 0;
}

function getAccessApprovalSettingArray(ApprovalValue) {
	var result;
	switch (ApprovalValue) {
	case 1: result = [ 0 ]; break; 
	case 2: result = [ 1 ]; break;
	// 신청시 기존 1차 때는 3이면 1차 + 2차 + 1,2차 를 라디오 옵션으로 선택할 수 있었다.
	// 승인 옵션은 관리만 설정페이지에서 가능하도록 변경되어 case 5,6,7은 더 이상 사용하지 않는다. - sep
	case 3: result = [ 0, 1 ]; break;
	case 4: result = [ 2 ]; break;
	/*
	case 5: result = [ 0, 2 ]; break; // 1차 + 전결
	case 6: result = [ 1, 2 ]; break; // 2차 + 전결
	case 7: result = [ 0, 1, 2 ]; break; // 1차  + 2차 + 1,2차 + 전결
	*/
	default:
		result = [ 0, 1 ]; break;
	}
	return result;
}


function accessApprovalTypeToName(type) {
	var name = "";
	switch (type) {
	case 11: name = "AAS_cbgVisit1"; break;
	case 12: name = "AAS_cbgVisit2"; break;
	case 13: name = "AAS_cbgVisit3"; break;
	case 14: name = "AAS_cbgVisit4"; break;
	case 21: name = "AAS_cbgAccess1"; break;
	case 22: name = "AAS_cbgAccess2"; break;
	case 23: name = "AAS_cbgAccess3"; break;
	case 24: name = "AAS_cbgAccess4"; break;
	}
	return name
}



/* - sep
 * 체크 박스 그룹에서 selection-change 이벤트 발생 시 호출.
 * 체크 박스 선택시 1차 승인, 2차 승인, 1,2차 승인, 전결  각 하나의 조건만 선택하도록 처리
 */
function onAAS_cbgVisit1SelectionChange(/* cpr.events.CSelectionEvent */ e){
	var checkBoxGroup = e.control;
	//console.log(checkBoxGroup.value);

	switch(checkBoxGroup.value){
		case "1,2,4" : // 1,2차 승인 선책 후, 전결 선택 시
			checkBoxGroup.removeSelection(0);
			checkBoxGroup.removeSelection(1);
			break;
		
		case "2,1,4" : // 2,1차 승인 선택 후, 전결 선택 시 
			checkBoxGroup.removeSelection(0);
			checkBoxGroup.removeSelection(1);
			break;		
		
		case "1,4" : // 1차 승인 선택 후, 전결 선택 시
			checkBoxGroup.removeSelection(0);
			break;
			
		case "2,4" : // 2차 승인 선택 후, 전결 선택 시
			checkBoxGroup.removeSelection(1);		
			break;
			
		case "4,1" : // 전결 선택 후, 1차 승인 선택 시
			checkBoxGroup.removeSelection(2);	
			break;
		
		case "4,2" : // 전결 선택 후, 2차 승인 선택 시
			checkBoxGroup.removeSelection(2);	
			break;	
			
		default :
			break;
	}
	
	
}
