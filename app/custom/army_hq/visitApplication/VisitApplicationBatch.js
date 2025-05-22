/************************************************
 * VisitApplicationBatch.js
 * Created at 2021. 2. 1. 오전 11:30:33.
 *
 * @author blue1
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);

	//changeUserType();
	//initVisitApplicationControl();
	app.lookup("sms_getAccessApprovalSetting").send();
}

function changeUserType() {
	var userType = app.lookup("AMVAP_rdbUserType").value;
	var udcLayout = app.lookup("AMVAP_grpUdc");
	udcLayout.removeAllChildren();

	var approvalSetting = app.lookup("AccessApprovalSettings");
	switch (Number(userType)) {
	case 1: // 민간인
		var udcVACnt = new udc.custom.VisitApplicantForeignExcelArmyHQ("VisitApplicantExcelControl");
		udcLayout.addChild(udcVACnt,  {	"colIndex": 0, "rowIndex": 0});
		udcLayout.updateConstraint(udcVACnt,{ "autoSize": "width"} );
		
		var row = approvalSetting.findFirstRow("ApprovalType == " + 11);
		udcVACnt.setApprovalOptioin(row.getValue("ApprovalValue"));
		break;
	case 2: // 타부대원
		var udcVACnt = new udc.custom.VisitApplicantOtherUnitExcelArmyHQ("VisitApplicantExcelControl");
		udcLayout.addChild(udcVACnt,  {	"colIndex": 0, "rowIndex": 0	});
		udcLayout.updateConstraint(udcVACnt,{ "autoSize": "width"} );
		
		var row = approvalSetting.findFirstRow("ApprovalType == " + 12);
		udcVACnt.setApprovalOptioin(row.getValue("ApprovalValue"));
		break;
	}
}

// 컨트롤 초기화
function initVisitApplicationControl() {
	var udcVACnt = app.lookup("AMVAP_grpUdc").getChild("VisitApplicantExcelControl");
	udcVACnt.initAllControl();
}

function initBatchResult() {
	var batResult = app.lookup("BatchResult");
	batResult.setValue("Total", 0);
	batResult.setValue("Success", 0);
	batResult.setValue("Fail", 0);
	batResult.setValue("Index", 0);
	batResult.setValue("ResultMsg", "");
}

/* 신청인원 구분 선택  */
function onAMVAP_rdbUserTypeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	changeUserType();	
}

/* 신청 버튼 클릭  */
function onAMVAP_btnRequestClick(/* cpr.events.CMouseEvent */ e){
	var accessApplicationInfo = app.lookup("AccessApplicationInfo");
	var accessApprovalInfo = app.lookup("AccessApprovalPair");
	accessApplicationInfo.clear();
	accessApprovalInfo.clear();
	
	initBatchResult();
	var udcVACnt = app.lookup("AMVAP_grpUdc").getChild("VisitApplicantExcelControl");
	if(udcVACnt.validateData()==false){
		return;
	}
	/*
	var checkCarNumDuplication = udcVACnt.CheckCarNumberDuplication();
	if (checkCarNumDuplication > 0) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Success"), "동일한 차량번호를 방문신청 할 수 없습니");
		return;
	}*/
	app.lookup("BatchResult").setValue("Total", udcVACnt.getVisitorInfoLength());
	app.lookup("BatchResult").setValue("Index", 0);
	udcVACnt.getApplicationInfoDataMap(accessApplicationInfo, 0); 	// size가 0일경우 validateData 검사에서 return
	udcVACnt.getApprovalInfoDataMap(accessApprovalInfo, 0);
	//승인자 입력 항목 체크
	var nResult = checkApproval(accessApprovalInfo);
	if (nResult == false) {
		return;	
	}
	accessApplicationInfo.setValue("VisitApplicationType", AccessApplicationTypePrior);
		
	var sms_postAccessApplication = app.lookup("sms_postAccessApplication");
	sms_postAccessApplication.send();
	comLib.showLoadMask("",dataManager.getString("Str_ARMYHQ_VisitApplication"),"",0);	
}

/* 초기화 버튼 클릭  */
function onAMVAP_bntClearClick(/* cpr.events.CMouseEvent */ e){
	var button = e.control;
	
	dialogConfirmAMHQ(app, "", dataManager.getString("Str_ClearConfirm"), function(/*cpr.controls.Dialog*/dialog){
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				initVisitApplicationControl();
			}
		});
	});
}


function onSubmitError(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}
function onSms_postAccessApplicationSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	
	var batResult = app.lookup("BatchResult");
	if( resultCode != COMERROR_NONE ){
		batResult.setValue("Fail", batResult.getValue("Fail")+1);
		// Todo: Error 메시지 조합  개선 필요		
		var errMsg = batResult.getValue("ResultMsg");
		errMsg += batResult.getValue("Index")+1;
		errMsg += ": " + dataManager.getString(getErrorString(resultCode)) + "\n";
		batResult.setValue("ResultMsg",  errMsg);
	} else {
		batResult.setValue("Success", batResult.getValue("Success")+1);
	}
		
	batResult.setValue("Index", batResult.getValue("Index")+1);
	if (batResult.getValue("Total") == batResult.getValue("Index")) { // 모든 방문 신청을 요청했으면 중지
		comLib.hideLoadMask(); 
		if (batResult.getValue("Fail") != 0 ){
			dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), batResult.getValue("ResultMsg"));
			return;
		} else {
			dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_ARMY_AccessApplicationCompleted"));
			return;
		}
	}
	var index = batResult.getValue("Index");
	var accessApplicationInfo = app.lookup("AccessApplicationInfo");
	var accessApprovalInfo = app.lookup("AccessApprovalPair");
	accessApplicationInfo.clear();
	accessApprovalInfo.clear();

	var udcVACnt = app.lookup("AMVAP_grpUdc").getChild("VisitApplicantExcelControl");
	udcVACnt.getApplicationInfoDataMap(accessApplicationInfo, index); 	// size가 0일경우 validateData 검사에서 return
	udcVACnt.getApprovalInfoDataMap(accessApprovalInfo, index);
	accessApplicationInfo.setValue("VisitApplicationType", AccessApplicationTypePrior);
	
	var sms_postAccessApplication = app.lookup("sms_postAccessApplication");
	sms_postAccessApplication.send();
}

function onSms_getAccessApprovalSettingSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){
		changeUserType();
		initVisitApplicationControl();
	} else {		
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}	
}

function checkApproval(accessApprovalInfo) {
	var predecessor = accessApprovalInfo.getValue("Predecessor");
	console.log(predecessor);
	var stApproval1ID = accessApprovalInfo.getValue("1stApprovalID");
	console.log(stApproval1ID);
	var stApproval2ID = accessApprovalInfo.getValue("2stApprovalID");
	console.log(stApproval2ID);
		
	switch(predecessor) {
	case 1: //1차만 있음
		if (stApproval1ID == null || stApproval1ID.toString().length <= 0) {
			dialogAlertAMHQ(app, "경고", "1차 승인자 지정을 해야 합니다.");
			return false;
		} else {
			return true;
		}
	case 2:
		if (stApproval2ID == null || stApproval2ID.toString().length <= 0) {
			dialogAlertAMHQ(app, "경고", "2차 승인자 지정을 해야 합니다.");
			return false;
		} else {
			return true;
		}
	case 3:
		if (stApproval1ID == null || stApproval1ID.toString().length <= 0) {
			dialogAlertAMHQ(app, "경고", "1차 승인자 지정을 해야 합니다.");
			return false;
		} 
		if (stApproval2ID == null || stApproval2ID.toString().length <= 0) {
			dialogAlertAMHQ(app, "경고", "2차 승인자 지정을 해야 합니다.");
			return false;
		} 
		return true;
	case 4:
		return true;
	}
}
	
