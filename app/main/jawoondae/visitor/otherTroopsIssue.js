/************************************************
 * otherTroopsIssue.js
 * Created at 2019. 12. 26. 오후 6:03:24.
 *
 * @author joymrk
 ************************************************/
var comLib;
var dateLib = cpr.core.Module.require("lib/DateLib");
var pageRowCount = 10;
var dataManager = cpr.core.Module.require("lib/DataManager");
var jwdoti_version;


/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	jwdoti_version = dataManager.getSystemVersion();
	
	var groupList = dataManager.getGroup();
	var cmbGroup = app.lookup("JWDOTI_cmbTargetGroup");	 //그룹
		cmbGroup.setItemSet(groupList, {
			label: "Name",
			value: "GroupID",
	});
	
	var positionList = dataManager.getPositionList();
	var cmbPosition = app.lookup("JWDOTI_cmbVisitorPosition");	//직급
		cmbPosition.setItemSet(positionList, {
			label: "Name",
			value: "PositionID",
	});	
	var dmOtherTroops = app.lookup("dmOtherTroopsTargetInfo");
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	var nowtAt = now.format('YYYY-MM-DD');
	dmOtherTroops.setValue("VisitStartAt", nowtAt);
	dmOtherTroops.setValue("VisitEndAt", nowtAt);
	
	app.lookup("JWDOTI_grpMain").redraw();
}


/*
 * 버튼(JWDOTI_btnIssue)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onJWDOTI_btnIssueClick(/* cpr.events.CMouseEvent */ e){
	var dmOtherTroopsInfo = app.lookup("otherTroopsInfo");
	if( dmOtherTroopsInfo.getValue("carNumber").toString().indexOf(' ') > -1){
		dialogAlert(app, dataManager.getString("Str_Warning"),"입력 할 수 없는 문자가 포함되어 있습니다.");
		return;
	}
	if( dmOtherTroopsInfo.getValue("carNumber").toString().indexOf('.') > -1){
		dialogAlert(app, dataManager.getString("Str_Warning"),"입력 할 수 없는 문자가 포함되어 있습니다.");
		return;
	}
	if( dmOtherTroopsInfo.getValue("visitorName").toString().indexOf(' ') > -1){
		dialogAlert(app, dataManager.getString("Str_Warning"),"입력 할 수 없는 문자가 포함되어 있습니다.");
		return;
	}
	if( dmOtherTroopsInfo.getValue("visitorName").toString().indexOf('.') > -1){
		dialogAlert(app, dataManager.getString("Str_Warning"),"입력 할 수 없는 문자가 포함되어 있습니다.");
		return;
	}
	if( dmOtherTroopsInfo.getValue("visitorID").toString().indexOf(' ') > -1){
		dialogAlert(app, dataManager.getString("Str_Warning"),"입력 할 수 없는 문자가 포함되어 있습니다.");
		return;
	}
	if( dmOtherTroopsInfo.getValue("visitorID").toString().indexOf('.') > -1){
		dialogAlert(app, dataManager.getString("Str_Warning"),"입력 할 수 없는 문자가 포함되어 있습니다.");
		return;
	}
	
	if( dmOtherTroopsInfo.getValue("visitorGroupName").length==0){
		dialogAlert(app, dataManager.getString("Str_Warning"),"소속을 입력해 주세요");
		return
	}
	if( dmOtherTroopsInfo.getValue("visitorID").length==0){
		dialogAlert(app, dataManager.getString("Str_Warning"),"군번을 입력해 주세요");
		return
	}
	if( dmOtherTroopsInfo.getValue("visitorPosition")==0){
		dialogAlert(app, dataManager.getString("Str_Warning"),"계급을 선택해 주세요");
		return
	}
	if( dmOtherTroopsInfo.getValue("visitorName").length==0){
		dialogAlert(app, dataManager.getString("Str_Warning"),"이름을 입력해 주세요");
		return
	}
	if( dmOtherTroopsInfo.getValue("visitorName").toString().indexOf('.') > -1){
		dialogAlert(app, dataManager.getString("Str_Warning"),". 문자를 제거하세요");
		return
	}
	
	if( dmOtherTroopsInfo.getValue("visitorMobile").length==0){
		dialogAlert(app, dataManager.getString("Str_Warning"),"핸드폰 번호를 입력해 주세요");
		return
	}
	// 카드 발급 화면 전환
	
	var appld = "app/main/jawoondae/accessCard/accessCardSelectOne" + "?" + jwdoti_version;
	app.getRootAppInstance().openDialog(appld, {width : 520, height : 450}, function(dialog){
		dialog.ready(function(dialogApp){
			dialog.bind("headerTitle").toLanguage("Str_PassList");
				dialog.initValue = {"PopupType": "SingleCheck"}; // 카드 발급 타입
			dialog.modal = true;
		});
	}).then(function(returnValue){
		if (returnValue != undefined && returnValue["cardNum"].toString().length > 0 ) {
			var issuetype = returnValue["OutTroopsIssueType"];
			var cardNumber = returnValue["cardNum"];
			var dmIssueInfo = app.lookup("IssueCardInfo");			
			dmIssueInfo.setValue("CardNumber", cardNumber);
			dmIssueInfo.setValue("IssueType", issuetype);
			
			sendOtherTroopsIssue();
		}
	});	
}

function sendOtherTroopsIssue() {
	var tmpStr =  dataManager.getString("Str_OutTroopsManagement") + " " + dataManager.getString("Str_Issued");
	comLib.showLoadMask("",tmpStr,"",0);	
	var smsPostOtherTroopsIssue = app.lookup("sms_postOtherTroopsIssue");
	smsPostOtherTroopsIssue.action = "/v1/visitRequest/othertroops/issue";
	smsPostOtherTroopsIssue.send()
}

function onSms_postOtherTroopsIssueSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		dialogAlert(app, "알림", "타부대원 즉시발급이 완료 되었습니다.");
	} else {
		//dialogAlert(app, "알림", "타부대원 즉시발급이 실패 되었습니다.");
		if (resultCode == 0x01000021) {
			dialogAlert(app, "알림", "군번은 같으나 이름이 일치하지 않습니다.");	
		}else {
			dialogAlert(app, "알림", dataManager.getString(getErrorString(resultCode)));	
		}
		
	}
}

function onSms_postOtherTroopsIssueSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_postOtherTroopsIssueSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
