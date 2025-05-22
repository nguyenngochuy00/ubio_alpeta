/************************************************
 * visitCardIncidentHandleOne.js
 * Created at 2023. 1. 17. ���� 6:12:31.
 *
 * @author SW2Team
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var cardName; // 변경된 점이 있는 지 확인용 변수
var cardStatus; 

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var initValue = app.getHost().initValue;
	console.log(initValue)
	initControl(initValue);
}

function initControl(value){
	var dmAccessCardInfo = app.lookup("AccessCardInfo");
	var dmVisitCardInfo = app.lookup("VisitCardInfo");
	
	dmAccessCardInfo.setValue("CardType", getAccessCardTypeValue(value.AccessCard.CardType));
	dmAccessCardInfo.setValue("CardNumber", value.AccessCard.CardNumber);
	dmAccessCardInfo.setValue("CardName", value.AccessCard.CardName);
	dmAccessCardInfo.setValue("ManagementNumber", value.AccessCard.ManagementNumber);
	dmAccessCardInfo.setValue("IssueAt", value.AccessCard.IssueAt);
	dmAccessCardInfo.setValue("RetrieveAt", value.AccessCard.RetrieveAt);
	dmAccessCardInfo.setValue("CardStatus",value.AccessCard.CardStatus);
	dmAccessCardInfo.setValue("Description",value.AccessCard.Description);
	
	app.lookup("AMCIH_CardType").value = value.AccessCard.CardType;
	app.lookup("AMCIH_CardType").redraw();
	app.lookup("AMCIH_ManagementNumber").redraw();
	app.lookup("AMCIH_opbIssueAt").redraw();
	app.lookup("AMCIH_opbProcessAt").redraw();
	app.lookup("AMCIH_cardNumber").redraw();
	app.lookup("AMCIH_CardName").redraw();
	app.lookup("AMCIH_description").redraw();
	app.lookup("AMCIH_cmbIncidentType").selectItemByValue(value.AccessCard.CardStatus);
	
	dmVisitCardInfo.setValue("CardType", getAccessCardTypeValue(value.AccessCard.CardType));
	dmVisitCardInfo.setValue("CardNumber", value.AccessCard.CardNumber);
	dmVisitCardInfo.setValue("ManagementNumber", value.AccessCard.ManagementNumber);
	return;
}


/*
 * "저장" 버튼(AMCIH_btnSave)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAMCIH_btnSaveClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aMCIH_btnSave = e.control;
	var dmAccessCardInfo = app.lookup("AccessCardInfo");
	dmAccessCardInfo.setValue("OwnerID", "IssueStatus");
	dmAccessCardInfo.setValue("ApplicationIndex", "0");
	
	var sms_putVisitCardStatus = app.lookup("sms_putVisitCardStatus");
	sms_putVisitCardStatus.send();
	return;
}


/*
 * "닫기" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	app.close(1);
}

//function validate(){
//	var dmAccessCardInfo = app.lookup("AccessCardInfo");
//	// 방문증 이름, 상태, 사유가 하나도 안바뀜
//	if(cardName == dmAccessCardInfo.getValue("CardName") && cardStatus = dmAccessCardInfo.getValue("CardStatus")){
//		return false;
//	}
//}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postAccessCardIncidentSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if(resultCode == COMERROR_NONE){
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), "방문증이 수정되었습니다.");
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	return;
}


function onSubmitError(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}




