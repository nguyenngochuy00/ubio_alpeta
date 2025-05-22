/************************************************
 * visitRegistInfo.js
 * Created at 2019. 9. 18. 오전 9:56:39.
 *
 * @author fois
 ************************************************/
var comLib;
var dateLib = cpr.core.Module.require("lib/DateLib");
var pageRowCount = 10;
var dataManager = cpr.core.Module.require("lib/DataManager");
var JWDOTI_version;

function InitData() {
	dataManager = getDataManager();
	JWDOTI_version = dataManager.getSystemVersion();
	var groupList = dataManager.getGroup();
	var cmbGroup = app.lookup("JWDOTI_cmbTargetGroup");	 //출입 부대
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
}

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	InitData();
	JWDVI_version = dataManager.getSystemVersion();
	
	var dtiStart = app.lookup("JWDOTI_dtiVisitStartAt");
	var dtiEnd = app.lookup("JWDOTI_dtiVisitEndAt");
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	dtiEnd.value = now.format('YYYY-MM-DD');
	dtiStart.value = now.format('YYYY-MM-DD');
	
}

function onJWDOTI_btnIssueClick(/* cpr.events.CMouseEvent */ e){ // 등록 + 승인
	
	if( validateOtherTroopsInfo()==false){
		return;
	}
	sendOtherTroopsIssue();
	
	//var cardType = app.lookup("otherTroopsInfo").getValue("VisitType");
	//var appld = "app/main/jawoondae/accessCard/accessCardSelectOne" + "?" + JWDVI_version;
	//app.getRootAppInstance().openDialog(appld, {width : 520, height : 450}, function(dialog){
	//	dialog.ready(function(dialogApp){
	//		dialog.bind("headerTitle").toLanguage("Str_PassList");
	//		dialog.initValue = {"CardType":cardType}; // 카드 발급 타입
	//		dialog.modal = true;
	//	});
	//}).then(function(returnValue){
	//	if (returnValue != undefined && returnValue.length > 0 ) {
	//		app.lookup("IssueCardInfo").setValue("cardNum", returnValue);
	//			sendOtherTroopsIssue();	
	//	}
	//});
}


function validateOtherTroopsInfo() {
	var dmOtherTroopsInfo = app.lookup("otherTroopsInfo");
		
	if( dmOtherTroopsInfo.getValue("TargetGroupID")==0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Warn_TargetGroupNotSelected"));
		return false;
	}
	
	if( dmOtherTroopsInfo.getValue("VisitPurpose").length == 0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Warn_VisitPurposeNotEntered"));
		return false;
	}
	
	//var startAt = dmOtherTroopsInfo.getValue("VisitStartAt");
	//dmOtherTroopsInfo.setValue("VisitEndAt",startAt);
	//var endAt = dmVisitTargetInfo.getValue("VisitEndAt");
	
	//var dmLeaderInfo = app.lookup("LeaderInfo");
	//var leaderID = dmLeaderInfo.getValue("ID");
	//if( leaderID == null || leaderID.length == 0){
		//dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Warn_LeaderNotSelected"));
		//return false;
	dmOtherTroopsInfo.setValue("LeaderID", "");
	//} else {
	//	dmOtherTroopsInfo.setValue("LeaderID", leaderID);
	//}
	
	if( dmOtherTroopsInfo.getValue("VisitorGroupName")==0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Warn_VisitorGroupNotSelected"));
		return false;
	}
	
	if( dmOtherTroopsInfo.getValue("VisitorID").length == 0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Warn_VisitorIDNotEntered"));
		return false;
	}
	
	if( dmOtherTroopsInfo.getValue("VisitorPosition")==0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Warn_VisitorPositionNotSelected"));
		return false;
	}
	
	if( dmOtherTroopsInfo.getValue("VisitorName").length == 0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Warn_VisitorNameNotEntered"));
		return false;
	}
	/*
	if( dmOtherTroopsInfo.getValue("VisitorPhone").length == 0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Warn_VisitorPhoneNotEntered"));
		return false;
	}
	*/
	if( dmOtherTroopsInfo.getValue("VisitorMobile").length == 0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Warn_VisitorMobileNotEntered"));
		return false;
	}
}
function sendOtherTroopsIssue() {
	var tmpStr =  dataManager.getString("Str_OutTroopsManagement") + " " + dataManager.getString("Str_VisitRequestApproval");
	comLib.showLoadMask("",tmpStr,"",0);	
	var OtherTroops = app.lookup("otherTroopsInfo");
	//OtherTroops.setValue("LeaderID", app.lookup("LeaderInfo").getValue("UniqueID"));
	var requestData = app.lookup("sms_postOtherTroopsIssue");
	requestData.action = "/v1/visitRequest/othertroops/approval";
	requestData.method = "POST";
	requestData.send()
}

function onSms_postOtherTroopsIssueSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Saved"));
	} else {
		//dialogAlert(app, "Waning", dataManager.getString("Str_RegistResult")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlert(app, "Waning", dataManager.getString("Str_RegistResult")+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_postOtherTroopsIssueSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_postOtherTroopsIssueSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onJWDOTI_btnCarAddClick(/* cpr.events.CMouseEvent */ e){
	var dsCarInfo = app.lookup("dsCarInfo");
	dsCarInfo.addRow();
	dsCarInfo.commit();
}

/*
 * 버튼(JWDOTI_btnCarDelete)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onJWDOTI_btnCarDeleteClick(/* cpr.events.CMouseEvent */ e){
	var grdCardList = app.lookup("JWDOTI_grdCarInfo");
	var chkIndices = grdCardList.getCheckRowIndices();
	if(chkIndices.length == 0){		
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedItem"));
		return;
	}
	
	var dsCarInfo = app.lookup("dsCarInfo");
	chkIndices.forEach(function(rowIndex){
		dsCarInfo.deleteRow(rowIndex);
	});	
	dsCarInfo.commit();
}

function onJWDOTI_btnExcelIssueClick(/* cpr.events.CMouseEvent */ e){
	var appld = "app/main/jawoondae/visitor/otherTroopsExcelRegist" + "?" + JWDOTI_version;
	app.getRootAppInstance().openDialog(appld, {width : 900, height : 600}, function(dialog){
		dialog.bind("headerTitle").toLanguage("Str_OutTroopsExcelRegist");
		dialog.modal = true;
	}).then(function(/*cpr.data.DataSet*/returnValue){
		console.log(returnValue);
	});	
}


/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSMAG_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
	
}

