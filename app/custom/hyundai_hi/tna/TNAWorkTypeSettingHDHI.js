/************************************************
 * TNAWorkTypeSettingHDHI.js
 * Created at 2024. 3. 21. 오전 9:59:09.
 *
 * @author zxc
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var usint_version;

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	var requestData = app.lookup("sms_getWorkTypeList");
	requestData.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getWorkTypeListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getWorkTypeList = e.control;
	
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode")
	if( resultCode == COMERROR_NONE){
		app.lookup("TWTSH_grd").redraw();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
		return
	}
}

function onSms_getWorkTypeListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getWorkTypeListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * 버튼(TWTSH_btnAdd)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTWTSH_btnAddClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var tWTSH_btnAdd = e.control;
	
	app.getRootAppInstance().openDialog("app/custom/hyundai_hi/tna/TNAWorkTypeRegistHDHI", {
		width: 300,
		height: 150
	}, function(dialog) {
		dialog.bind("headerTitle").toLanguage("Str_Add");
		dialog.initValue = {
			"mode": "add",
			"value": ""
		};
		dialog.resizable = false;
		dialog.modal = true;
	}).then(function(returnValue) {
		if (returnValue) {
			// post 요청
			var dmWorkType = app.lookup("dm_workType");
			dmWorkType.clear();
			dmWorkType.setValue("WorkTypeName", returnValue);
			var sms_post = app.lookup("sms_postWorkType");
			sms_post.send();
		}
	});
	
}


/*
 * 버튼(TWTSH_btnDelete)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTWTSH_btnDeleteClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var tWTSH_btnDelete = e.control;
	
	dialogConfirm(app.getRootAppInstance(), "", "해당 근태 항목이 부여된 근태 결과가 초기화 됩니다. 계속 하겠습니까?", function( /*cpr.controls.Dialog*/ dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				var grdCompany = app.lookup("TWTSH_grd");
				var row = grdCompany.getSelectedRow();
				if (row) {
					// delete 요청
					var workTypeID = row.getValue("WorkTypeID");
					var sms_delete = app.lookup("sms_deleteWorkType");
					
					if ( workTypeID > 0 && workTypeID < 7 ) {	// 1 부터 6까지 고정 삭제불가
						dialogAlert(app, dataManager.getString("Str_Failed"), "고정된 근태 항목으로 삭제 불가 합니다.");
						return
					}
					
					sms_delete.action = "/v1/hdhi/tna/setting/customWorkType/" + workTypeID;
					sms_delete.send();
				}
			}
		});
		
	});
}


/*
 * 버튼(TWTSH_btnClose)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTWTSH_btnCloseClick(/* cpr.events.CMouseEvent */ e){
	app.close(true);
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postWorkTypeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_postWorkType = e.control;
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode")
	if( resultCode == COMERROR_NONE){
		// get
		var requestData = app.lookup("sms_getWorkTypeList");
		requestData.send();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	
}

function onSms_postWorkTypeSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_postWorkTypeSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


function onSms_deleteWorkTypeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_deleteWorkType = e.control;
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode")
	if( resultCode == COMERROR_NONE){
		// get
		var requestData = app.lookup("sms_getWorkTypeList");
		requestData.send();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_deleteWorkTypeSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_deleteWorkTypeSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
