/************************************************
 * visitorEndAtUpdateHDMS.js
 * Created at 2022. 3. 24. 오후 3:12:25.
 *
 * @author zxc
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib = createComUtil(app);
var dateLib = cpr.core.Module.require("lib/DateLib");



/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	var initValue = app.getHost().initValue;
	
	var visitInfo  = app.lookup("VisitInfo");
	visitInfo.build(initValue["VisitInfo"]);
	
	var visitorInfo  = app.lookup("VisitorInfo");
	visitorInfo.build(initValue["VisitorInfo"]);
	
	app.lookup("VEAU_HDMC_dtiStartDate").value = visitInfo.getValue("StartAt");
	app.lookup("VEAU_HDMC_dtiEndDate").value = visitInfo.getValue("EndAt");
	app.lookup("VEAU_HDMC_dtiStartTime").value = "00:00";
	app.lookup("VEAU_HDMC_dtiEndTime").value = "23:59";
	
}


/*
 * 버튼(VMVTR_btnVisitorAdd)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVMVTR_btnVisitorAddClick(/* cpr.events.CMouseEvent */ e){
	
	if( validateVisitorInfo() == false ){
		return;
	}
	
	var visitInfo = app.lookup("VisitInfo");
	var visitorInfo = app.lookup("VisitorInfo");
	
	var startAt = app.lookup("VEAU_HDMC_dtiStartDate").value;
	var endAt = app.lookup("VEAU_HDMC_dtiEndDate").value;
	
	var RegistDate = startAt.split(" ")[0]+ " 00:00:00";
	var ExpireDate = endAt.split(" ")[0]+ " 23:59:00";
	var userInfo = app.lookup("UserInfo");

	userInfo.setValue("RegistDate", RegistDate);
	userInfo.setValue("ExpireDate", ExpireDate);
	
	var sms_putVisitorUpdate = app.lookup("sms_putVisitorUpdate");
	sms_putVisitorUpdate.action = "/v1/visit/visitApplication/"+visitInfo.getValue("VisitIndex")+"/visitor/"+visitorInfo.getValue("VisitorIndex");
	sms_putVisitorUpdate.send();
}

// 방문객 업데이트
function onSms_putVisitorUpdateSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		app.close("success");
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}	
}

// 방문객 업데이트 에러
function onSms_putVisitorUpdateSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// 방문객 업데이트 타임아웃
function onSms_putVisitorUpdateSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

function onVMVTR_btnCancelClick(/* cpr.events.CMouseEvent */ e){
	app.close();
}

function validateVisitorInfo(){

	var today = dateLib.getToday();
	
	var startDate = app.lookup("VEAU_HDMC_dtiStartDate").value;
	var startAt = startDate.split(" ")[0].split("-").join("");
	
	var endDate = app.lookup("VEAU_HDMC_dtiEndDate").value;
	var endAt = endDate.split(" ")[0].split("-").join("");
	
	if (dateLib.compareDate(startAt, endAt) == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitStarOverEnd"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VEAU_HDMC_dtiEndDate").focus(true);
			});
		});
		return false;
	}
	
	return true;
} 



