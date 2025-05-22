/************************************************
 * accessGroupMapping.js
 * Created at 2021. 10. 20. 오후 2:36:20.
 *
 * @author joymrk
 ************************************************/
var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var accessGroupID;

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);	
	dataManager = getDataManager();
	
	var initValue = app.getHost().initValue;
	accessGroupID = initValue["accessGroupID"];
	comLib.showLoadMask("","출입그룹-인사정보 맵핑코드 가져오기","",0);
	var reqData = app.lookup("sms_getNecAccessGroupInfo");
	reqData.action = "/v1/nec/accessGroupMappingCode/" + accessGroupID;
	reqData.send(); 
}

function onSms_getNecAccessGroupInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dbId = app.lookup("necAccessGroupInfo").getValue("ID");
		if (dbId != accessGroupID) {
			app.lookup("necAccessGroupInfo").setValue("ID", accessGroupID);
		}
		app.lookup("NECAGI_grpMain").redraw();
		console.log(app.lookup("necAccessGroupInfo").getDatas());
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_SubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onNECAGI_btnSaveClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var nECAGI_btnSave = e.control;
	var necAccessGroupInfo = app.lookup("necAccessGroupInfo");
	if (necAccessGroupInfo.getValue("NecAccessGroupCode").toString() == "") {
	//확인창
		if ( confirm("빈코드를 입력하면 동기화시 해당 출입그룹은 제외됩니다.") == false ) {
			return;
		}
	}
	comLib.showLoadMask("","출입그룹-인사정보 맵핑코드 수정하기","",0);
	var reqData = app.lookup("sms_putNecAccessGroupInfo");
	reqData.action = "/v1/nec/accessGroupMappingCode/" + necAccessGroupInfo.getValue("NecAccessGroupCode");
	reqData.send();
}

function onSms_putNecAccessGroupInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		//팝업 성공 -> 창 종료
		dialogAlert(app, "성공", "등록 및 수정이 완료되었습니다.");
		app.close();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onNECAGI_btnCancelClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var nECAGI_btnCancel = e.control;
	app.close();
}
