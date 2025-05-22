/************************************************
 * UnitCarInformationRegist.js
 * Created at 2021. 2. 1. 오후 4:18:06.
 *
 * @author blue1
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();

	var udcLayout1 = app.lookup("UCIM_grpUdc");
	var udcCarInfCnt1 = new udc.custom.UnitCarInformationArmyHQ("UnitCarInformationArmyHQ");
	udcLayout1.addChild(udcCarInfCnt1,  {	"colIndex": 0, "rowIndex": 0});
	udcLayout1.updateConstraint(udcCarInfCnt1,{ "autoSize": "width"} );
}


/*
 * 버튼(UCI_bntClear)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUCI_bntClearClick(/* cpr.events.CMouseEvent */ e){
	var udcUCICnt = app.lookup("UCIM_grpUdc").getChild("UnitCarInformationArmyHQ");
	udcUCICnt.initAllControl();
}

/*
 * 버튼(UCI_btnRequest)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUCI_btnRequestClick(/* cpr.events.CMouseEvent */ e){
	var unitCarInfo = app.lookup("UnitCarInfomation");
	unitCarInfo.clear();
	
	var udcUCICnt = app.lookup("UCIM_grpUdc").getChild("UnitCarInformationArmyHQ");
	udcUCICnt.getUnitCarInformation(unitCarInfo);
	
	if (!udcUCICnt.validateData()) {
		return;
	}
	
	var submission = app.lookup("sms_postUnitCar");
	submission.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postUnitCarSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_SubmitResult_RegistComplete"));
	} else {		
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}	
}

function onSms_postUnitCarSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);	
}

function onSms_postUnitCarSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);	
}
