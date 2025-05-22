/************************************************
 * ModifyUserInformation.js
 * Created at 2021. 2. 24. 오후 1:13:39.
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
	
	var cmbUserGroup = app.lookup("MUI_cmbUserGroup");
	cmbUserGroup.setItemSet(dataManager.getGroup(), {label: "Name",	value: "GroupID" });
		
	var grdCmdPosition = app.lookup("MUI_cmbUserPosition");
	grdCmdPosition.setItemSet(dataManager.getPositionList(), {label: "Name",	value: "PositionID" });
	
	
	var userID = dataManager.getAccountID();
	var sms_getUserInfo = app.lookup("sms_getUserInfo");
	sms_getUserInfo.action = "/v1/armyhq/users/"+userID;
	sms_getUserInfo.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getUserInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
		app.lookup("MUI_grpUserInfo").redraw();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}

function onSubmitError(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

/*
 * "수정" 버튼(MUI_btnUpdateUser)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onMUI_btnUpdateUserClick(/* cpr.events.CMouseEvent */ e){
	var userID = dataManager.getAccountID();
	var putUserInfo = app.lookup("sms_putUserInfo");
	
	// 이메일 유효성 검사
	var email = app.lookup("MUI_ipbEmail").value;
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if (!re.test(email)) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitEmailInvalidReg"), function(dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("MUI_ipbEmail").focus(true);
			});
		});
		return false;
	}
	
	putUserInfo.action = "/v1/armyhq/users/"+userID;
	putUserInfo.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_putUserInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), "소속부대원 정보가 수정되었습니다.");
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}
