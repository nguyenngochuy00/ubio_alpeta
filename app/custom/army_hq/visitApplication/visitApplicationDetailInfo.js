/************************************************
 * VisitApplicationPreviousness.js
 * Created at 2021. 2. 1. 오전 11:24:42.
 *
 * @author blue1
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var initDay;
var pvadi_applicationIndex;
var userID;
var pvadi_userType; 
var ApprovalState;
var approvalValue; // 승인 옵션 값  - sep
var isModified = false;
var editFlag;

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);	
	
	var initValue = app.getHost().initValue;
	pvadi_applicationIndex = initValue["ApplicationIndex"];
	pvadi_userType = initValue["userType"];
	userID = initValue["userID"];
	editFlag = initValue["editFlag"];
	ApprovalState = initValue["ApprovalState"];
	if (pvadi_userType == 902) {
		app.lookup("AMVAP_rdbUserType").value = 1;	
		app.lookup("AMVAD_opbUserType").value = "민간인";
	} else {
		app.lookup("AMVAP_rdbUserType").value = 2;
		app.lookup("AMVAD_opbUserType").value = "타부대원";
	}
	app.lookup("sms_getAccessApprovalSetting").send();
	
}

/* 서브미션 이벤트 */
function onSubmitError(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getAccessApprovalAmhqSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getAccessApprovalAmhq = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode ==COMERROR_NONE) {
		var userType = app.lookup("AMVAP_rdbUserType").value;
		var udcLayout = app.lookup("AMVAP_grpUdc");
		udcLayout.removeAllChildren();
		var approvalSetting = app.lookup("AccessApprovalSettings");
		switch (Number(userType)) {
		case 1: // 민간인
			var udcVACnt = new udc.custom.VisitApplicantForeignDetailInfoAmhq("VisitApplicantControl");
			console.log(udcVACnt);
			udcVACnt.initAllControl();
			udcLayout.addChild(udcVACnt,  {	"colIndex": 0, "rowIndex": 0});
			udcLayout.updateConstraint(udcVACnt,{ "autoSize": "width"} );
			var row = approvalSetting.findFirstRow("ApprovalType == " + 11);
			//udcVACnt.setApprovalOptioin(row.getValue("ApprovalValue"));
			udcVACnt.setApprovalOptioin(app.lookup("AccessApprovalPair").getValue("Predecessor"));
			approvalValue = row.getValue("ApprovalValue"); // 승인 옵션 값 저장
			udcVACnt.setApplicationInfoDataMap(app.lookup("AccessApprovalDetailInfo"));
			if (ApprovalState!=3 || ApprovalState!=5) { // 결재 상태가 3:결재 승인, 5:전결 승인 이 아닐 경우
				udcVACnt.setApprovalEnable(); // 승인자 변경 가능
			}
			
			udcVACnt.setApprovalInfoDataMap(app.lookup("AccessApprovalPair"));
			//console.log(app.lookup("AccessApprovalPair").getDatas());
			break;
		case 2: // 타부대원
			var udcVACnt = new udc.custom.VisitApplicantOtherUnitDetailInfoAmhq("VisitApplicantControl");
			udcVACnt.initAllControl();
			udcLayout.addChild(udcVACnt,  {	"colIndex": 0, "rowIndex": 0 });
			udcLayout.updateConstraint(udcVACnt,{ "autoSize": "width"} );
			var row = approvalSetting.findFirstRow("ApprovalType == " + 12);
			//udcVACnt.setApprovalOptioin(row.getValue("ApprovalValue"));
			udcVACnt.setApprovalOptioin(app.lookup("AccessApprovalPair").getValue("Predecessor"));
			approvalValue = row.getValue("ApprovalValue"); // 승인 옵션 값 저장
			udcVACnt.setApplicationInfoDataMap(app.lookup("AccessApprovalDetailInfo"));
			if (ApprovalState==1 || ApprovalState==10) {
				udcVACnt.setApprovalEnable(); // 승인자 변경 가능
			} else if (ApprovalState==3 || ApprovalState==5){ // 결재 상태가 3:결재 승인, 5:전결 승인 일 경우
				// 타부대원일 경우에 결재 승인 된 경우 정보 수정 불가, 민간인만 결재 승인 상태에서도 수정 가능  - sep
				var AMVAD_btnModify = app.lookup("AMVAD_btnModify");
				var AMVAP_grpUdc = app.lookup("AMVAP_grpUdc");
				AMVAD_btnModify.visible = false;
				AMVAP_grpUdc.enabled = false;
				// 민간인은 결재 승인된 상태에서도 수정 가능 - sep
			} 
			udcVACnt.setApprovalInfoDataMap(app.lookup("AccessApprovalPair"));
			//console.log(app.lookup("AccessApprovalPair").getDatas());
			break;
		}
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
	//console.log(app.lookup("Result").getValue("ResultCode"));
	//console.log(app.lookup("AccessApprovalDetailInfo").getDatas());
	
	var AMVAD_btnModify = app.lookup("AMVAD_btnModify");
	var AMVAP_grpUdc = app.lookup("AMVAP_grpUdc");
	// 결재 상태가 4: 결재 반려 5:전결 승인 일 경우와 타부대원 + 3:결재 승인 일 때 수정 불가능하도록 설정
	if(ApprovalState==4 || ApprovalState==5 || (ApprovalState==3 && Number(userType) == 2) || editFlag == false){	
		AMVAD_btnModify.visible = false;
		AMVAP_grpUdc.enabled = false;
	} else if (editFlag == true && (ApprovalState!=3 || ApprovalState!=5)){
		AMVAD_btnModify.enabled = true;
		AMVAD_btnModify.visible = true;
	}
	
}


/*
 * "닫기" 버튼(AMVAD_btnClose)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAMVAD_btnCloseClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aMVAD_btnClose = e.control;
	app.close(isModified);
}


/*
 * "수정" 버튼(AMVAD_btnModify)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAMVAD_btnModifyClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aMVAD_btnModify = e.control;
	
	var accessApprovalDetailInfo = app.lookup("AccessApprovalDetailInfo");
	var accessApprovalInfo = app.lookup("AccessApprovalPair");
	accessApprovalDetailInfo.clear();
	accessApprovalInfo.clear();
	var udcVACnt = app.lookup("AMVAP_grpUdc").getChild("VisitApplicantControl");
	if(udcVACnt.validateData()==false){
		return;
	}
	
	udcVACnt.getApplicationInfoDataMap(accessApprovalDetailInfo);
	udcVACnt.getApprovalInfoDataMap(accessApprovalInfo);
	accessApprovalDetailInfo.setValue("UserType", pvadi_userType);
	//차량번호 Check
	var CarNumberCheck = app.lookup("AccessApprovalDetailInfo").getValue("CarNumber");
	var CarNumberCheckCNT = CarNumberCheck.length;
	if (CarNumberCheckCNT == 0 || (CarNumberCheckCNT >= 7 && CarNumberCheckCNT <= 12 )) {
		var sms_putAccessApplication = app.lookup("sms_putAccessApprovalInfo");
		
		var userType = app.lookup("AMVAP_rdbUserType").value;
		var predecessor = accessApprovalInfo.getValue("Predecessor");
		if (userType == "1"){ // 민간인일 때
			// 결재 상태가 3:결재 승인, 결재 상태가  11:2차 승인 대기 일때 수정하면 수정 후 승인 상태가 변경된다. - sep
			if (ApprovalState==3 || ApprovalState==11){
				
				switch(predecessor){ // 승인 옵션 값 
					case 1,3: // 1차 승인   / 1,2차 승인
						accessApprovalDetailInfo.setValue("ApplicationStatus", 10);
						break;
					
					case 2: // 2차 승인
						accessApprovalDetailInfo.setValue("ApplicationStatus", 11);
						break;
				}
				
				// 민간인일 경우 결재 승인된 후 수정시 재승인을 받아야하기 때문에 팝업창으로 알림  - pse			
				dialogConfirmAMHQ(app.getRootAppInstance(), dataManager.getString("Str_OK"), "수정 시 결재 상태가 초기화 됩니다.\n수정하시겠습니까?", function(/*cpr.controls.Dialog*/dialog){
					dialog.addEventListenerOnce("close", function(e) {
						if (dialog.returnValue) { // 수정 진행 시
							sms_putAccessApplication.action = "/v1/armyhq/accessApproval/DetailInfo/" + pvadi_applicationIndex + "/" + userID;
							sms_putAccessApplication.send();
							return;
						}
					});
				});
		
			} else { // 민간인  + 결재 승인 안된 경우
				sms_putAccessApplication.action = "/v1/armyhq/accessApproval/DetailInfo/" + pvadi_applicationIndex + "/" + userID;
				sms_putAccessApplication.send();
				return;
			}
		} else { // 타부대원일 때
			sms_putAccessApplication.action = "/v1/armyhq/accessApproval/DetailInfo/" + pvadi_applicationIndex + "/" + userID;
			sms_putAccessApplication.send();
			return;
		}
	} else { // 차량 번호 표기 오류
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "잘못된 자동차 번호입니다.\n예:11가1111 / 서울11가1111");
		return;
	}	
}

function onSms_putAccessApprovalInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_putAccessApprovalInfo = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		isModified = true;
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), "상세정보가 수정되었습니다.");			
	} else if(resultCode == ErrorAmhqCardIsIssueStatus){
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "교부 중인 방문자 정보는 수정할 수 없습니다.\n 카드 회수를 먼저 진행해주세요.");
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}



/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getAccessApprovalSettingSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getAccessApprovalSetting = e.control;
		var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode ==COMERROR_NONE) {
		//상세 정보 가져오기
		var smsGetAccessApproAmhq = app.lookup("sms_getAccessApprovalDetailInfoAmhq");
		smsGetAccessApproAmhq.action = "/v1/armyhq/accessApproval/DetailInfo/" + pvadi_applicationIndex + "/" + userID;
		smsGetAccessApproAmhq.send();
		
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	
	
}

/*
 * 루트 컨테이너에서 unload 이벤트 발생 시 호출.
 * 앱이 언로드된 후 발생하는 이벤트입니다.
 */
function onBodyUnload(/* cpr.events.CEvent */ e){
	app.close(isModified);
}
