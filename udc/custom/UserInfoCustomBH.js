/************************************************
 * UserInfoCustomBH.js
 * Created at 2022. 8. 22. 오후 1:27:24.
 *
 * @author zxc
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateUtil = cpr.core.Module.require("lib/DateLib");
var StrLib = cpr.core.Module.require("lib/StrLib");
var UCBH_userID = 0;
var UCBH_mode = 0;
var oem_version;
var inputValidManager = createInputValidator(app);

exports.setBHUserCustomInfo = function(DataSet) {
	var userInfo = app.lookup("BHUser");
	userInfo.clear();
	DataSet.copyToDataMap(userInfo);
	console.log("UDC!");
//	console.log(JSON.stringify(DataSet.getDatas()));
//	console.log(JSON.stringify(userInfo.getDatas()));

	var priNo = userInfo.getValue("PriNo");
	
	app.lookup("ProcessInfo").setValue("_OldPriNo", priNo);	// 중복 체크를 위해 추가
	app.lookup("ProcessInfo").setValue("_ReDuplicationResult", "None");
	
	if ( priNo == 0 ) {
		app.lookup("BH_ipbPriNo").value = "";
	}
	
	app.lookup("BH_ipbPriNo").redraw();
}

exports.setBHOldPriNoInfo = function() {
	var priNo = app.lookup("BHUser").getValue("PriNo");
	app.lookup("ProcessInfo").setValue("_OldPriNo", priNo);
}

exports.getBHUserCustomInfo = function() {
	return app.lookup("BHUser");
}

exports.getBHUserCustomInfoPriNo = function() {
	return app.lookup("BHUser").getValue("PriNo");
//	return app.lookup("BH_ipbPriNo").value;
}

exports.setBHEditMode = function(editMode) {
	app.lookup("ProcessInfo").setValue("EditMode", editMode);
}

exports.setReDuplicationResult = function(result) {
	console.log(result);
	app.lookup("ProcessInfo").setValue("_ReDuplicationResult", "None");
}

exports.checkBHPriNoduplicationResult = function(priNo) {
	var result = false;
	var strErrMsg = "";
	
	var bhUserInfo = app.lookup("BHUser");
	var dmProcessInfo = app.lookup("ProcessInfo");
	var _ReDuplicationResult = dmProcessInfo.getValue("_ReDuplicationResult");
	var editMode = dmProcessInfo.getValue("EditMode");
	
	console.log("custom페이지 editMode : " + editMode);
	console.log("_ReDuplicationResult : " + _ReDuplicationResult);
	console.log("priNO : " + priNo);
	if (priNo.toString().length > 0) { // pri no 입력 한 경우
	
		if ( priNo == 0 ) {
				
		}
		
		if (editMode = 'Modify') { // 사용자 수정인 경우
			
			if (_ReDuplicationResult == 'None') { // 중복 체크 시도 안한 경우
			console.log(dmProcessInfo.getValue("_OldPriNo"))
				if (priNo != dmProcessInfo.getValue("_OldPriNo")) { // pri no 변경한 경우						
					strErrMsg = "고유 번호 중복 체크를 시도 하세요.";
					inputValidManager.validate(app.lookup("BH_ipbPriNo"), "isDuplicate", "");
				} else { // pri no 변경 안한 경우	
					result = true;
				}
			} else if (_ReDuplicationResult == 'ReDu') { // 있을수 없는 조합 , 죽복 상태
				strErrMsg = "고유 번호가 중복 입니다.";
				inputValidManager.validate(app.lookup("BH_ipbPriNo"), "isDuplicate", "");
			} else if (_ReDuplicationResult == 'pass') { // 중복 체크 통화
				result = true;
			} else {
				strErrMsg = "고유 번호 중복 체크를 시도 하세요.";
			}
		} else if (editMode = 'Add') { // 사용자 추가인 경우
			if (_ReDuplicationResult == 'None') { // 중복 체크 안함
				result = false;
				strErrMsg = "고유 번호 중복 체크를 시도 하세요.";
				inputValidManager.validate(app.lookup("BH_ipbPriNo"), "isDuplicate", "");
			} else if (_ReDuplicationResult == 'ReDu') {
				result = false; // 중복 상태
				strErrMsg = "고유 번호가 중복 입니다.";
				inputValidManager.validate(app.lookup("BH_ipbPriNo"), "isDuplicate", "");
			} else if (_ReDuplicationResult == 'pass') {
				result = true;
			}
		}
	} else {
		result = true;
	}
	return [result, strErrMsg]
}


function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	oem_version = dataManager.getOemVersion();
	
	if (oem_version != OEM_BLUEHOUSE_KR) {
		return
	}
}

// pri_no 중복 체크
function onBH_btnReduplicationClick(/* cpr.events.CMouseEvent */ e){
	var sendSmsFlag = false;
	var bhUser = app.lookup("BHUser");
	var newPriNo = bhUser.getValue("PriNo");
	
//	console.log("입력한 정보 : " + newPriNo);
//	console.log("newPriNo : " + newPriNo);
//	console.log("oldPriNo : " + app.lookup("ProcessInfo").getValue("_OldPriNo"));
	
	if (newPriNo.toString().length == 0) {
		// 비워져있으면 지운다고 판단
//		dialogAlert(app, dataManager.getString("Str_Warning"), "값이 없음");
		app.lookup("ProcessInfo").setValue("_ReDuplicationResult", 'pass');
		return;
	} else if ( newPriNo.toString() == '0' ) {
		dialogAlert(app, dataManager.getString("Str_Warning"), "고유 번호는 0은 입력 불가합니다.");
		return;
	}
	
	// 숫자만 허용
	var check = /^[0-9]*$/;
	if (!check.test(newPriNo)) {
		dialogAlert(app, dataManager.getString("Str_Warning"), "데이터 값이 잘못되었습니다.");
		inputValidManager.validate(app.lookup("BH_ipbPriNo"), "isDuplicate", "");
		return;
	}
	
	var dmProcessInfo = app.lookup("ProcessInfo");
	var _OldPriNo = dmProcessInfo.getValue("_OldPriNo");
	
	if ( _OldPriNo == newPriNo ) {
		dmProcessInfo.setValue("_ReDuplicationResult", 'pass');
		dialogAlert(app, dataManager.getString("Str_Info"), "동일한 고유 번호 입니다.");
		return
	} else {
		sendSmsFlag = true;
	}
	sendSmsFlag = true;
	if (sendSmsFlag == true) {
		var RequestData = app.lookup("smsPriNoCheckReq");
		RequestData.setParameters("PriNo", newPriNo);
		RequestData.send();
	}
	
}

function onSmsPriNoCheckReqSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsPriNoCheckReq = e.control;
	var strMessage = "";
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	var dmProcessInfo = app.lookup("ProcessInfo");
	var BHUser = app.lookup("BHUser");
	
//	console.log("onSmsPriNoCheckReqSubmitSuccess");
//	console.log("ResultCode : " + ResultCode);
	
	if (ResultCode == COMERROR_REDUPLICATE_UNIQUEID_EXIST) {
		dmProcessInfo.setValue("_ReDuplicationResult", 'ReDu');
		app.lookup("BH_ipbPriNo").focusable = true;
		strMessage = "중복된 고유 번호 입니다.";
		app.lookup("BH_ipbPriNo").value = "";
		inputValidManager.validate(app.lookup("BH_ipbPriNo"), "isDuplicate", "");
	} else if (ResultCode == COMERROR_REDUPLICATE_UNIQUEID_NOT_EXIST) {
		dmProcessInfo.setValue("_ReDuplicationResult", 'pass');
		inputValidManager.validate(app.lookup("BH_ipbPriNo"), "isValid", "");
		strMessage = "사용 가능한 고유 번호 입니다.";
	} else {
		strMessage = dataManager.getString(getErrorString(ResultCode));
	}
	dialogAlert(app, dataManager.getString("Str_Info"), strMessage);
}



/*
 * 인풋 박스에서 value-change 이벤트 발생 시 호출.
 * 변경된 value가 저장된 후에 발생하는 이벤트.
 */
function onBH_ipbPriNoValueChange(/* cpr.events.CValueChangeEvent */ e){
	app.lookup("ProcessInfo").setValue("_ReDuplicationResult", "None");
	inputValidManager.validate(app.lookup("BH_ipbPriNo"), "", "");
}


/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onBH_ipbPriNoKeyup(/* cpr.events.CKeyboardEvent */ e){
	app.lookup("ProcessInfo").setValue("_ReDuplicationResult", "None");
	inputValidManager.validate(app.lookup("BH_ipbPriNo"), "", "");
}
