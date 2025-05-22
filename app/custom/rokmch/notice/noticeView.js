/************************************************
 * noticeRegist.js
 * Created at 2021. 2. 26. 오후 8:10:27.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var unLoginStatus = false;
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	var appProp = app.getAppProperty("initValue");
	var noticeIdx
	if (appProp != undefined) {
		noticeIdx = appProp.Idx;	
	} else {
		var initValue = app.getHost().initValue;
		noticeIdx = initValue["Idx"];
		unLoginStatus = true;		
	}
		
	var sms_getSystemNotice = app.lookup("sms_getSystemNotice");
	sms_getSystemNotice.action = "/v1/systemNotices/"+noticeIdx;
	sms_getSystemNotice.send();
}

function onSubmitError( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

function validateDate( value ){
	if (value==undefined||value == "0001-01-01T00:00:00Z"){return "";}
	if (value.substring(0, 10)=="0001-01-01"){return;}
	return value.substring(0, 10) +" " + value.substring(11, 19);	
}

function onSms_getSystemNoticeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	
	if( resultCode == COMERROR_NONE ){
				
		var noticeInfo = app.lookup("NoticeInfo");
		if(unLoginStatus == false) {
			var accountID = dataManager.getAccountID();
			console.log(accountID, noticeInfo.getValue("RegisterID"));
			if( Number(accountID) == Number(noticeInfo.getValue("RegisterID"))){ // 본인 작성 글인경우
				app.lookup("AMSNV_btnModify").visible = true;
				app.lookup("AMSNV_btnDelete").visible = true;
				
			}else{
				app.lookup("AMSNV_btnModify").visible = false;
				app.lookup("AMSNV_btnDelete").visible = false;
			}	
		} else {
			unLoginStatusUI();
		}
		
		noticeInfo.setValue("RegistAt", validateDate(noticeInfo.getValue("RegistAt")));
		var noticeIndex = noticeInfo.getValue("NoticeIndex");
		var fileName1 = noticeInfo.getValue("FileName1");
		if( fileName1 && fileName1.length > 0){
			var link = app.lookup("AMSNV_sniFile1");
			link.value=	"<a href=\"/data/notice/"+noticeIndex+"/"+fileName1+"\" target=\"_blank\">"+fileName1+"</a>";
		}
		var fileName2 = noticeInfo.getValue("FileName2");
		if( fileName2 && fileName2.length > 0){
			var link = app.lookup("AMSNV_sniFile2");
			link.value=	"<a href=\"/data/notice/"+noticeIndex+"/"+fileName2+"\" target=\"_blank\">"+fileName2+"</a>";
		}
		var fileName3 = noticeInfo.getValue("FileName3");
		if( fileName3 && fileName3.length > 0){
			var link = app.lookup("AMSNV_sniFile3");
			link.value=	"<a href=\"/data/notice/"+noticeIndex+"/"+fileName3+"\" target=\"_blank\">"+fileName3+"</a>";
		}
		
		
		app.lookup("AMSNV_grpNotice").redraw();				
	} else {		
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}	
}

// 등록
function onAMSNR_btnRegistClick(/* cpr.events.CMouseEvent */ e){
	var noticeInfo = app.lookup("NoticeInfo")
	app.getHostAppInstance().callAppMethod("changeMenu","60503",noticeInfo);
}


function onAMSNR_btnListClick(/* cpr.events.CMouseEvent */ e){
	app.getHostAppInstance().callAppMethod("changeMenu","60500");
}

// "삭제" 버튼(AMSNV_btnDeletel)에서 click 이벤트 발생 시 호출.
function onAMSNV_btnDeleteClick(/* cpr.events.CMouseEvent */ e){
	
	dialogConfirmAMHQ(app, dataManager.getString("Str_Delete"), dataManager.getString("Str_DeleteConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				var noticeInfo = app.lookup("NoticeInfo");
				var noticeIdx = noticeInfo.getValue("NoticeIndex")
				var sms_deleteSystemNotice = app.lookup("sms_deleteSystemNotice");
				sms_deleteSystemNotice.action = "/v1/systemNotices/"+noticeIdx;
				sms_deleteSystemNotice.send();
			} else {}
		});
	});
}

function onSms_deleteSystemNoticeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	
	if( resultCode == COMERROR_NONE ){	
		app.getHostAppInstance().callAppMethod("changeMenu","60500");		
	} else {		
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}	
}

function unLoginStatusUI() {
	app.lookup("AMSNV_btnModify").visible = false;
	app.lookup("AMSNV_btnDelete").visible = false;
	app.lookup("AMSNV_btnList").visible = false;
	app.lookup("AMSNV_grpNotice").getLayout().removeRows([2,7]);
}

