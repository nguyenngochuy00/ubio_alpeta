/************************************************
 * visitInfoUpdate.js
 * Created at 2020. 10. 29. 오후 5:01:57.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var JWDVUP_version;

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	JWDVUP_version = dataManager.getSystemVersion();
		
	var groupList = dataManager.getGroup();
	var cmbGroup = app.lookup("JWDVUP_cmbTargetGroup");	 //출입 부대
		cmbGroup.setItemSet(groupList, {
			label: "Name",
			value: "GroupID",
	});
	
	var initValue = app.getHost().initValue;
	var visitInfo = initValue["visitRequestInfo"];
	if (visitInfo) {
		app.lookup("VisitRequestInfo").build(visitInfo);
	}
	var start = app.lookup("VisitRequestInfo").getValue("VisitStartAt");
	app.lookup("JWDVUP_dtiVisitStartAt").value = start;
	var end = app.lookup("VisitRequestInfo").getValue("VisitEndAt");
	app.lookup("JWDVUP_dtiVisitEndAt").value = end;
	
	app.lookup("JWDVUP_grpMain").redraw();
}

function onJWDVUP_btnModifyClick(/* cpr.events.CMouseEvent */ e){
	
	var visitPurpose = app.lookup("JWDVUP_ipbVisitPurpose").value;
	if (visitPurpose.length <= 0 ) {
		dialogAlert(app, dataManager.getString("Str_Warning"),"방문 목적을 입력해 주세요");
		return;
	}
	
	
	comLib.showLoadMask("","방문 신청 정보 수정","",0);	
	var visitIndex = app.lookup("VisitRequestInfo").getValue("IndexKey");
	var smsData = app.lookup("sms_putVisitInfoUpdate");
	var visitRequestInfo = app.lookup("VisitRequestInfo");
	var startat = app.lookup("JWDVUP_dtiVisitStartAt").value;
	var endat = app.lookup("JWDVUP_dtiVisitEndAt").value;
	if (startat.length > 10) {
		startat = startat.substring(0, 10);
		console.log(startat);
	}
	if (endat.length > 10) {
		endat = endat.substring(0, 10);
		console.log(endat);
	}
	visitRequestInfo.setValue("VisitStartAt", startat);
	visitRequestInfo.setValue("VisitEndAt", endat);
	smsData.action = '/v1/visitRequest/update';
	smsData.send();
}

function onSms_putVisitInfoUpdateSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		dialogAlert(app, "성공", "방문신청서 정보가 성공 하였습니다.");
		app.close(app.lookup("VisitRequestInfo"));
	} else {
		console.log("resultCode : " + resultCode);
		if(resultCode == 0x00000001){ // ErrorInvalidParameter
			dialogAlert(app, dataManager.getString("Str_Failed"), "수정정보가 문제있습니다.");		
		} else if (resultCode == 0x04000005) { //ErrorPrivilegeNotPermission
			dialogAlert(app, dataManager.getString("Str_Failed"), "수정 권한이 없습니다.");		
		} else if (resultCode == ERROR_VISIT_REQUEST_NOT_EXIST){ //ErrorVisitRequestNotExist
			dialogAlert(app, dataManager.getString("Str_Failed"), "방문신청서가 존재 하지 않습니다.");
		} else if (resultCode == 0x0D000001) { //ErrorDB
			dialogAlert(app, dataManager.getString("Str_Failed"), "방문신청서 정보를 가져올수 없습니다.");
		} else if (resultCode == 0x7F000019) { // 0x7F000019 
			dialogAlert(app, dataManager.getString("Str_Failed"), "방문신청서 정보를 변경 할 수 없습니다.");
		} else if (resultCode == 0x7F000010) { //ErrorUserCarRegist
			dialogAlert(app, dataManager.getString("Str_Failed"), "차량정보 삭제에 실패 하였습니다.");
		} else {
			dialogAlert(app, "Waning", "방문신청서 정보 수정 실패");
		}
	}
}

function onSms_putVisitInfoUpdateSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_putVisitInfoUpdateSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

/*
 * "취 소" 버튼(JWDVUP_btnCancel)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onJWDVUP_btnCancelClick(/* cpr.events.CMouseEvent */ e){
	app.close();
}
