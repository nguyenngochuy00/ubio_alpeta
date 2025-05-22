/************************************************
 * visitApplicationManagement.js
 * Created at 2021. 1. 4. 오후 12:37:54.
 *
 * @author blue1
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var ApplicationIndex = 0;

// 탭 인덱스
var AMVAP_tabIndex = 1; 			// 현재 탭 인덱스
var PriorApplication = 1;
var BatchApplication = 2;
var FieldApplication = 3;
/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	changeUserType();
	initVisitApplicationControl();
	
	var initValue = app.getHost().initValue;
	if (typeof initValue["ApplicationIndex"] != "undefined" && 
		initValue["ApplicationIndex"] != null &&
		initValue["ApplicationIndex"] != "") {
		ApplicationIndex = initValue["ApplicationIndex"];	
	}
	
	var tap = app.lookup("AMVAP_tapMenu");
	if (ApplicationIndex != 0) {
		tap.getTabItems()[0].text = dataManager.getString("Str_ARMYHQ_VisitApplicationRe");
		tap.removeTabItem(tap.getTabItems()[2]);
		tap.removeTabItem(tap.getTabItems()[1]);
		
		app.lookup("AMVAP_rdbUserType1").readOnly = true;
	
		app.lookup("AMVAP_bntClear").visible = false;
		app.lookup("AMVAP_btnRequest").unbind("value");
		app.lookup("AMVAP_btnRequest").value = dataManager.getString("Str_ARMYHQ_ReRequet");
		
		var submission = app.lookup("sms_getAccessApplication");
		submission.action = "/v1/armyhq/accessApplication/"+ApplicationIndex;		
		submission.send();
	} else {
		tap.getTabItems()[0].text = dataManager.getString("Str_ARMYHQ_VisitApplication");
		tap.getTabItems()[1].text = dataManager.getString("Str_ARMYHQ_VisitBatchVisitApplication");
		tap.getTabItems()[2].text = dataManager.getString("Str_ARMYHQ_FieldVisitApplication");
	}
}

function changeUserType() {
	var userType = app.lookup("AMVAP_rdbUserType" + AMVAP_tabIndex).value;
	var udcLayout = app.lookup("AMVAP_grpUdc" + AMVAP_tabIndex);
	udcLayout.removeAllChildren();
	
	if (AMVAP_tabIndex == PriorApplication || AMVAP_tabIndex == FieldApplication) {
		switch (Number(userType)) {
		case 1: // 민간인
			var udcVACnt = new udc.custom.VisitApplicantForeignArmyHQ("VisitApplicantControl");
			udcLayout.addChild(udcVACnt,  {	"colIndex": 0, "rowIndex": 0});
			udcLayout.updateConstraint(udcVACnt,{ "autoSize": "width"} );
			break;
		case 2: // 타부대원
			var udcVACnt = new udc.custom.VisitApplicantOtherUnitArmyHQ("VisitApplicantControl");
			udcLayout.addChild(udcVACnt,  {	"colIndex": 0, "rowIndex": 0	});
			udcLayout.updateConstraint(udcVACnt,{ "autoSize": "width"} );
			break;
		}
	} else {
		switch (Number(userType)) {
		case 1: // 민간인
			var udcVACnt = new udc.custom.VisitApplicantForeignExcelArmyHQ("VisitApplicantExcelControl");
			udcLayout.addChild(udcVACnt,  {	"colIndex": 0, "rowIndex": 0});
			udcLayout.updateConstraint(udcVACnt,{ "autoSize": "width"} );
			break;
		case 2: // 타부대원
			var udcVACnt = new udc.custom.VisitApplicantOtherUnitExcelArmyHQ("VisitApplicantExcelControl");
			udcLayout.addChild(udcVACnt,  {	"colIndex": 0, "rowIndex": 0	});
			udcLayout.updateConstraint(udcVACnt,{ "autoSize": "width"} );
			break;
		}
	}
}
/*
 * 탭 폴더에서 selection-change 이벤트 발생 시 호출.
 * Tab Item을 선택한 후에 발생하는 이벤트.
 */
function onTabFolderSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.TabFolder
	 */
	var tabFolder = e.control;
	var tabItem = tabFolder.getSelectedTabItem();
 	AMVAP_tabIndex = tabItem.id;
 	
 	app.lookup("AccessApplicationInfo").clear();
 	app.lookup("AccessApprovalPair").clear();
 	
 	changeUserType();
 	// initVisitApplicationControl();
}

/*
 * 라디오 버튼에서 selection-change 이벤트 발생 시 호출.
 * 라디오버튼 아이템을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onAMVAP_rdbUserTypeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	changeUserType();
}

/* 신청 버튼 클릭  */
function onBtnRequestClick(/* cpr.events.CMouseEvent */ e){
	var accessApplicationInfo = app.lookup("AccessApplicationInfo");
	var accessApprovalInfo = app.lookup("AccessApprovalPair");
	accessApplicationInfo.clear();
	accessApprovalInfo.clear();
	
	if (AMVAP_tabIndex == PriorApplication || AMVAP_tabIndex == FieldApplication) {
		var udcVACnt = app.lookup("AMVAP_grpUdc"+AMVAP_tabIndex).getChild("VisitApplicantControl");
		if(udcVACnt.validateData()==false){
			return;
		}
		udcVACnt.getApplicationInfoDataMap(accessApplicationInfo);
		udcVACnt.getApprovalInfoDataMap(accessApprovalInfo);

		if (AMVAP_tabIndex == PriorApplication) {
			accessApplicationInfo.setValue("VisitApplicationType", 1);	
		} else {
			accessApplicationInfo.setValue("VisitApplicationType", 1);	
		} 
	
		var sms_postAccessApplication = app.lookup("sms_postAccessApplication");
		sms_postAccessApplication.send();
	} else {
		initBatchResult();
		var udcVACnt = app.lookup("AMVAP_grpUdc"+AMVAP_tabIndex).getChild("VisitApplicantExcelControl");
		if(udcVACnt.validateData()==false){
			return;
		}
		
		app.lookup("BatchResult").setValue("Total", udcVACnt.getVisitorInfoLength());
		app.lookup("BatchResult").setValue("Index", 0);
		udcVACnt.getApplicationInfoDataMap(accessApplicationInfo, 0); 	// size가 0일경우 validateData 검사에서 return
		udcVACnt.getApprovalInfoDataMap(accessApprovalInfo, 0);
		
		accessApplicationInfo.setValue("VisitApplicationType", 2);	
		
		var sms_postAccessApplication = app.lookup("sms_postAccessApplication");
		sms_postAccessApplication.send();
		comLib.showLoadMask("",dataManager.getString("Str_ARMYHQ_VisitApplication"),"",0);	
	}
}

/* 초기화 버튼 클릭  */
function onBtnClearClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
	dialogConfirmAMHQ(app, "", dataManager.getString("Str_ClearConfirm"), function(/*cpr.controls.Dialog*/dialog){
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				initVisitApplicationControl();
			}
		});
	});
}

// 컨트롤 초기화
function initVisitApplicationControl() {
	if (AMVAP_tabIndex == PriorApplication || AMVAP_tabIndex == FieldApplication) {
		var udcVACnt = app.lookup("AMVAP_grpUdc"+AMVAP_tabIndex).getChild("VisitApplicantControl");
		udcVACnt.initAllControl();
	} else {
		var udcVACnt = app.lookup("AMVAP_grpUdc2").getChild("VisitApplicantExcelControl");
		udcVACnt.initAllControl();		
	}
}

function initBatchResult() {
	var batResult = app.lookup("BatchResult");
	batResult.setValue("Total", 0);
	batResult.setValue("Success", 0);
	batResult.setValue("Fail", 0);
	batResult.setValue("Index", 0);
	batResult.setValue("ResultMsg", "");
}

/* sms_postAccessApplication 서브미션 이벤트 */
function onSms_postAccessApplicationSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (AMVAP_tabIndex == BatchApplication) { // 일괄 방문 신청
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
				initVisitApplicationControl(); // 육본 붙임 1 문서. 1번 이슈 관련 수정
				return;
			}
		}
		var index = batResult.getValue("Index");
		var accessApplicationInfo = app.lookup("AccessApplicationInfo");
		var accessApprovalInfo = app.lookup("AccessApprovalPair");
		accessApplicationInfo.clear();
		accessApprovalInfo.clear();
		
		var udcVACnt = app.lookup("AMVAP_grpUdc"+AMVAP_tabIndex).getChild("VisitApplicantExcelControl");
		udcVACnt.getApplicationInfoDataMap(accessApplicationInfo, index); 	// size가 0일경우 validateData 검사에서 return
		udcVACnt.getApprovalInfoDataMap(accessApprovalInfo, index);
		accessApplicationInfo.setValue("VisitApplicationType", AMVAP_tabIndex);
		
		var sms_postAccessApplication = app.lookup("sms_postAccessApplication");
		sms_postAccessApplication.send();

	} else {	// 사전, 현장 방문신청
		if( resultCode == COMERROR_NONE ){
			dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_ARMY_AccessApplicationCompleted"));
			initVisitApplicationControl(); // 육본 붙임 1 문서. 1번 이슈 관련 수정
			
			// 재신청 일 경우
			if (app.lookup("AMVAP_btnRequest").value == dataManager.getString("Str_ARMYHQ_ReRequet")) {
				app.close(true);
			}		
		} else {		
			dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
		}		
	}
}

function onSms_postAccessApplicationSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR)
}

function onSms_postAccessApplicationSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT)	
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getAccessApplicationSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){
		// 방문 신청 정보 확인
		//console.log(app.lookup("AccessApplicationInfo").getDatas());

		// 컨트롤 수정
		var acApInfo = app.lookup("AccessApplicationInfo");
		if (acApInfo.getValue("UserType") == UserPrivArmyForeign) {	// 민간인
			app.lookup("AMVAP_rdbUserType1").value = 1	
		} else if (acApInfo.getValue("UserType") == UserPrivArmyOtherUnit) { // 타부대원
			app.lookup("AMVAP_rdbUserType1").value = 2
		}
		changeUserType();	
			
		// 컨트롤 값 변경
		var udcVACnt = app.lookup("AMVAP_grpUdc1").getChild("VisitApplicantControl");
		udcVACnt.setApplicationInfoDataMap(acApInfo);
	} else {		
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}		
}

function onSms_getAccessApplicationSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR)
}

function onSms_getAccessApplicationSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT)
}
