/************************************************
 * VisitApplicationField.js
 * Created at 2021. 2. 1. 오전 11:30:46.
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
	app.lookup("AMVAP_rdbUserType").value = 2;
	// changeUserType();
	// initVisitApplicationControl();
	app.lookup("sms_getAccessApprovalSetting").send();
}

function changeUserType() {
	var userType = app.lookup("AMVAP_rdbUserType").value;
	var udcLayout = app.lookup("AMVAP_grpUdc");
	udcLayout.removeAllChildren();

	var approvalSetting = app.lookup("AccessApprovalSettings");
	switch (Number(userType)) {
	case 1: // 민간인
		var udcVACnt = new udc.custom.VisitApplicantForeignArmyHQ("VisitApplicantControl");
		udcVACnt.initAllControl();
		udcLayout.addChild(udcVACnt,  {	"colIndex": 0, "rowIndex": 0});
		udcLayout.updateConstraint(udcVACnt,{ "autoSize": "width"} );
		
		var row = approvalSetting.findFirstRow("ApprovalType == " + 13);
		udcVACnt.setApprovalOptioin(row.getValue("ApprovalValue"));
		break;
	case 2: // 타부대원
		var udcVACnt = new udc.custom.VisitApplicantOtherUnitArmyHQ("VisitApplicantControl");
		udcVACnt.initAllControl();
		udcLayout.addChild(udcVACnt,  {	"colIndex": 0, "rowIndex": 0	});
		udcLayout.updateConstraint(udcVACnt,{ "autoSize": "width"} );
		
		var row = approvalSetting.findFirstRow("ApprovalType == " + 14);
		udcVACnt.setApprovalOptioin(row.getValue("ApprovalValue"));
		break;
	}
}

// 컨트롤 초기화
function initVisitApplicationControl() {
	var udcVACnt = app.lookup("AMVAP_grpUdc").getChild("VisitApplicantControl");
	udcVACnt.initNotAllControl();
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
	
	var udcVACnt = app.lookup("AMVAP_grpUdc").getChild("VisitApplicantControl");
	if(udcVACnt.validateData()==false){
		return;
	}
	udcVACnt.getApplicationInfoDataMap(accessApplicationInfo);
	udcVACnt.getApprovalInfoDataMap(accessApprovalInfo);
	var nResult = checkApproval(accessApprovalInfo);
	if (nResult == false) {
		return;	
	}

	accessApplicationInfo.setValue("VisitApplicationType", AccessApplicationTypeOnSite);
	
	//차량번호 Check
	var CarNumberCheck = app.lookup("AccessApplicationInfo").getValue("CarNumber");
	var CarNumberCheckCNT = CarNumberCheck.length;
	if (CarNumberCheckCNT == 0 || (CarNumberCheckCNT >= 7 && CarNumberCheckCNT <= 12 )) {
		var sms_postAccessApplication = app.lookup("sms_postAccessApplication");
		sms_postAccessApplication.send();
		return;
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "잘못된 자동차 번호입니다.\n예:11가1111 / 서울11가1111");
		return;
	}	
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

/* 방문객 검색 버튼 클릭  */
function onAMVAP_bntVisitorSearchClick(/* cpr.events.CMouseEvent */ e){
	var button = e.control;
	// 방문객 검색 시 방문대상자 정보 삭제되어 삭제 되지 않도록 처리 (로그인한 사용자 정보가 자동으로 들어감) - pse
	var dmUnitMember = app.lookup("UnitMember");
	var udcVACnt = app.lookup("AMVAP_grpUdc").getChild("VisitApplicantControl");
	udcVACnt.getUnitMemberDataMap(dmUnitMember);
	console.log(dmUnitMember.getDatas());

	var appld = "app/custom/rokmch/visitApplication/VisitUserSearch";
	app.openDialog(appld, {width : 630, height : 600}, function(dialog){
		//dialog.bind("headerTitle").toLanguage("방문객 정보 검색");
		dialog.style.header.css("background-color", "#528443");
		dialog.headerTitle = ("방문객 조회");
		dialog.initValue = {"UserType": app.lookup("AMVAP_rdbUserType").value};
		dialog.modal = true;
	}).then(function(returnValue){
		if( returnValue != null ){
			var udcVACnt = app.lookup("AMVAP_grpUdc").getChild("VisitApplicantControl");
			
			// 사전방문 날짜 오류 증상 수정 - otk
			var today = dateLib.getToday();
			var initDay = dateLib.nextDate(today, 0, "-");
			udcVACnt.initAllControl(initDay);
			
			var AccessApplicationInfo2 = app.lookup("AccessApplicationInfo2")
			returnValue.copyToDataMap(AccessApplicationInfo2);
			
			AccessApplicationInfo2.setValue("AccessStart", initDay);
			AccessApplicationInfo2.setValue("AccessEnd", initDay);
			// 방문객 검색 시 방문대상자 정보 삭제되어 삭제 되지 않도록 처리 (로그인한 사용자 정보가 자동으로 들어감) - pse
			var dmUnitMember = app.lookup("UnitMember");
			AccessApplicationInfo2.setValue("VisitTargetUserID", dmUnitMember.getValue("ID"));
			AccessApplicationInfo2.setValue("VisitTargetName", dmUnitMember.getValue("Name"));
			AccessApplicationInfo2.setValue("VisitTargetPosition", dmUnitMember.getValue("Position"));
			AccessApplicationInfo2.setValue("VisitTargetGroup", dmUnitMember.getValue("Group"));
			AccessApplicationInfo2.setValue("VisitTargetDepartment", dmUnitMember.getValue("Department"));
			
			console.log(returnValue.getValue("AccessStart"));
			udcVACnt.setApplicationInfoDataMap(AccessApplicationInfo2);
		}
	});	
}
/* 서브미션 이벤트 */
function onSubmitError(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

function onSms_postAccessApplicationSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_ARMY_AccessApplicationCompleted"));		
		initVisitApplicationControl();
	} else {		
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}		
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