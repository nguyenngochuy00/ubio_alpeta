/************************************************
 * accessRegistMofidy.js
 * Created at 2021. 3. 8. 오후 1:05:16.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var dateLib = cpr.core.Module.require("lib/DateLib");

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	
	var dmMode = app.lookup("dmMode");
	var initValue = app.getHost().initValue;	
	dmMode.setValue("Mode",initValue["Mode"]);
	var mode = dmMode.getValue("Mode");
		
	if(mode=="modify"){
		var accessorIndex = initValue["Index"];
		var sms_getAccessorInfo = app.lookup("sms_getAccessorInfo");
		sms_getAccessorInfo.action = "/v1/armyhq/accessor/"+accessorIndex;
		sms_getAccessorInfo.send();
	}
}

function onSubmitError(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

function validateData(){
	if( app.lookup("DAARM_cmbUserType").value == 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "인원구분이 선택되지 않았습니다.");
		return false;
	}
	
	if( app.lookup("DAARM_ipbDucementNumber").value == null || app.lookup("DAARM_ipbDucementNumber").value.length < 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "문서번호가 입력되지 않았습니다.");
		return false;
	}
	
	if( app.lookup("DAARM_ipbUserGroup").value == null || app.lookup("DAARM_ipbUserGroup").value.length < 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "소속(부대)가 입력되지 않았습니다.");
		return false;
	}
	
	if( app.lookup("DAARM_ipbName").value == null || app.lookup("DAARM_ipbName").value.length < 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "성명이 입력되지 않았습니다.");
		return false;
	}
	
	if( app.lookup("DAARM_dtiBirthday").value == null || app.lookup("DAARM_dtiBirthday").value.length < 10 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "생년월일이 입력되지 않았습니다.");
		return false;
	}
		
	if( app.lookup("DAARM_ipbSecureNumber").value == null || app.lookup("DAARM_ipbSecureNumber").value.length < 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "비취인가/신원조회연번이 입력되지 않았습니다.");
		return false;
	}
	
	if( app.lookup("DAARM_ipbVisitPurpose").value == null || app.lookup("DAARM_ipbVisitPurpose").value.length < 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "방문목적이 입력되지 않았습니다.");
		return false;
	}
	
	if( app.lookup("DAARM_dtiAccessStart").value == null || app.lookup("DAARM_dtiAccessStart").value.length < 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "출입시작일이 입력되지 않았습니다.");
		return false;
	}
	if( app.lookup("DAARM_dtiAccessEnd").value == null || app.lookup("DAARM_dtiAccessEnd").value.length < 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "출입종료일이 입력되지 않았습니다.");
		return false;
	}
			
	var today = dateLib.getToday();
	var startAt =app.lookup("DAARM_dtiAccessStart").value;
	startAt = startAt.replace(/-/gi,"");
	var endAt = app.lookup("DAARM_dtiAccessEnd").value;
	endAt = endAt.replace(/-/gi,"");
	
	if(dateLib.compareDate( today, startAt ) == 0){	
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_WarnAccessStartBeforeToday"), function(/*cpr.controls.Dialog*/dialog){
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("DAARM_dtiAccessStart").focus(true);			
			});
		});		
		return false;
	}
	
	if(dateLib.compareDate( startAt, endAt ) == 0){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_WarnAccessStarOverEnd"), function(/*cpr.controls.Dialog*/dialog){
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("DAARM_dtiAccessEnd").focus(true);			
			});
		});
		return false
	}
		
	return true;
}

function onDAARM_btnSaveClick(/* cpr.events.CMouseEvent */ e){
	if( validateData() == false ){
		return;
	}
	var dmMode = app.lookup("dmMode");	
	var mode = dmMode.getValue("Mode");
	if(mode=="modify"){
		var accessorInfo = app.lookup("AccessorInfo");
		
		var startAt = accessorInfo.getValue("AccessStart");
		accessorInfo.setValue("AccessStart",startAt.substring(0, 10));
		var endAt = accessorInfo.getValue("AccessEnd");
		accessorInfo.setValue("AccessEnd",endAt.substring(0, 10));
		
		var accessorIndex = accessorInfo.getValue("AccessorIndex");
		var sms_putAccessorInfo = app.lookup("sms_putAccessorInfo");
		sms_putAccessorInfo.action = "/v1/armyhq/accessor/"+accessorIndex;
		sms_putAccessorInfo.send();
	}else{
		var sms_postAccessorInfo = app.lookup("sms_postAccessorInfo");
		sms_postAccessorInfo.send();
	}
}

function onSms_postAccessorInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		var dmMode = app.lookup("dmMode");	
		var mode = dmMode.getValue("Mode");
		if( mode == "regist"){
			dialogAlertAMHQ(app, dataManager.getString("Str_Success"), "출입자 등록이 완료되었습니다.");
		}else{
			dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "출입자 수정이 완료되었습니다.");
		}
		app.close(true);
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onDAARM_btnCloseClick(/* cpr.events.CMouseEvent */ e){
	app.close(false);
}

function onSms_getAccessorInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		app.lookup("DAARM_grpAccessorInfo").redraw();		
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_putAccessorInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {		
		app.close(true);		
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	
}
