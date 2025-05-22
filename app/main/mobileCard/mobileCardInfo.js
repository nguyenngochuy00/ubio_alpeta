/************************************************
 * mobileCardInfo.js
 * Created at 2021. 7. 29. 오후 2:26:41.
 *
 * @author fois
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var dateLib = cpr.core.Module.require("lib/DateLib");
var MCISE_email;
var MCISE_mobile;
var MCISE_editMode;
var MCISE_uid;
var MCISE_update;
var originalCardStatus;
var originalCardExpireAt;

function onBodyLoad( /* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	//현대 엠시트 일 때, 발급수단 선택
	if (dataManager.getOemVersion() == OEM_HYUNDAI_MSEAT) {
		app.lookup("op_issueMethod").visible = true;
		app.lookup("cmb_issueMethod").visible = true;
	}
	
	app.lookup("MCISE_cmbCardType").selectItemByValue(1);
	app.lookup("MCISE_cmbCardIssueStatus").selectItemByValue(0);
	app.lookup("MCISE_cmbCardStatus").selectItemByValue(0);
	
	app.lookup("MCISE__dtiExpire").value = "2999-12-31 23:59:59";
	
	var initValue = app.getHost().initValue;
	MCISE_uid = initValue["uid"];
	MCISE_editMode = initValue["mode"];
	
	MCISE_email = initValue["email"];
	app.lookup("MCISE_ipbEmail").value = MCISE_email;
	
	MCISE_mobile = initValue["mobile"];
	app.lookup("MCISE_ipbMobile").value = MCISE_mobile;
	
	if (MCISE_editMode == "Modify") { // 사용자 수정	
		app.lookup("MCISE_btnSave").bind("value").toLanguage("Str_CardApplication");
		var sms_getMobileCardInfo = app.lookup("sms_getMobileCardInfo");
		sms_getMobileCardInfo.action = "/v1/users/" + MCISE_uid + "/mobilecard";
		sms_getMobileCardInfo.send();
	} else { // 사용자 추가
		app.lookup("MCISE_cmbCardStatus").value = 1;
		app.lookup("MCISE_cmbCardStatus").readOnly = true;
		var cType = 3;
		if (dataManager.getOemVersion() == OEM_HYUNDAI_MSEAT) {
			cType = 2;
		}
		app.lookup("cmb_issueMethod").value = cType;
	}
}

function onSms_SubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_SubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onMCISE_btnSaveClick( /* cpr.events.CMouseEvent */ e) {
	// 모바일 카드 라이선스 체크
	if (dataManager.getMobileCardVersion() == OEM_MOBILECARD_ALPETA) {
		if (dataManager.getXkeyLicStatus() != XkeyLicStatusOK) {
			dialogAlert(app, dataManager.getString("Str_Waning"), dataManager.getString("Str_AlterXkeyLicenseReActive"));
			return;
		}
	}
	
	if (app.lookup("cmb_issueMethod").value == 3) {
		var email = app.lookup("MCISE_ipbEmail").value;
		if (email == undefined || email.length < 1) {
			dialogAlert(app, dataManager.getString("Str_Waning"), dataManager.getString("Str_MobileCardEmailRequired"));
			return;
		}
	}
	var mobile = app.lookup("MCISE_ipbMobile").value;
	if (mobile == undefined || mobile.length < 1) {
		dialogAlert(app, dataManager.getString("Str_Waning"), dataManager.getString("Str_MobileCardMobileRequired"));
		return;
	}
	
	var cardType = app.lookup("MCISE_cmbCardType").value;
	if (cardType == undefined || cardType == 0) {
		dialogAlert(app, dataManager.getString("Str_Waning"), dataManager.getString("Str_MobileCardTypeRequired"));
		return;
	}
	var expiredDt = app.lookup("MCISE__dtiExpire").value;
	var strExpiredDt = validateDate(expiredDt);
	
	if (strExpiredDt == "") {
		dialogAlert(app, dataManager.getString("Str_Waning"), dataManager.getString("Str_ErrorLicenseInvalidExpireDate"));
		return;
	}
	
	if (MCISE_editMode == "Modify") { // 사용자가 등록된 경우는 카드 신청
		var sms_postMobileCardInfo = app.lookup("sms_postMobileCardInfo");
		sms_postMobileCardInfo.action = "/v1/users/" + MCISE_uid + "/mobilecard";
		sms_postMobileCardInfo.send();
	} else { // 사용자 등록전인 경우는 모바일 카드 정보만 리턴
		app.close(app.lookup("MobileCardInfo").getDatas());
	}
}

function onMCISE_btnCancelClick( /* cpr.events.CMouseEvent */ e) {
	if (MCISE_editMode == "Modify" && MCISE_update == true) {
		app.close(app.lookup("MobileCardInfo").getDatas());
	} else {
		app.close();
	}
}

function validateDate(value) {
	if (value == undefined || value == "0001-01-01T00:00:00Z" || value == "") {
		return "";
	}
	if (value.substring(0, 10) == "0001-01-01") {
		return "";
	}
	return value.substring(0, 10) + " " + value.substring(11, 19);
}

function onSms_getMobileCardInfoSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	
	comLib.hideLoadMask();
	
	var cmbCardStatus = app.lookup("MCISE_cmbCardStatus");
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var mobileCard = app.lookup("MobileCardInfo");
		originalCardStatus = mobileCard.getValue("CardStatus");
		originalCardExpireAt = mobileCard.getValue("ExpireAt");
		app.lookup("MCISE_ipbEmail").value = MCISE_email;
		app.lookup("MCISE_ipbMobile").value = MCISE_mobile;
		app.lookup("MCISE_grpMobileCardInfo").redraw();
		
		var cardStatus = mobileCard.getValue("CardStatus");
		var issueStatus = mobileCard.getValue("IssueStatus");
		var certType = mobileCard.getValue("CertType");
		console.log("certType= ", certType)
		if (!certType || certType == 0) {
			var cType = 3;
			if (dataManager.getOemVersion() == OEM_HYUNDAI_MSEAT) {
				cType = 2;
			}
			app.lookup("MobileCardInfo").setValue("CertType", cType);
		}
		
		if (MCISE_editMode == "Modify") { // 사용자는 등록되어 있는 상태 
			switch (issueStatus) {
				case 1: // 신청 ( 모바일 서버에 발급 신청한 상태). 카드 상태는 삭제만 가능
					cmbCardStatus.readOnly = false;
					cmbCardStatus.setFilter("value == 7 || value == 1"); // 삭제 상태로 변경 가능하다록		
					app.lookup("MCISE__dtiExpire").value = validateDate(app.lookup("MCISE__dtiExpire").value);
					
					break;
				case 2: // 발급 ( 사용자가 앱에서 카드 발급을 완료 한 상태). 카드 상태는 1:정상 ~ 7:삭제까지 처리 가능
					cmbCardStatus.readOnly = false;
					cmbCardStatus.clearFilter();
					app.lookup("MCISE__dtiExpire").value = validateDate(app.lookup("MCISE__dtiExpire").value);
					break;
				default: // 정보 없음. (0: 미발급)
					// 미발급 상태여도 카드 데이터 존재 시 삭제 가능
					if (app.lookup('MobileCardInfo').getValue('CardNum') == "") {
						cmbCardStatus.value = 1;
						cmbCardStatus.readOnly = true;
					} else {
						cmbCardStatus.readOnly = false;
						cmbCardStatus.selectItemByValue(1);
						cmbCardStatus.setFilter("value == 1 || value == 7"); // 정상, 삭제						
					}
					
					var expireAt = mobileCard.getValue('ExpireAt');
					if (expireAt == "") {
						// 1. 신청 이후 발급 전 이여도 만료일은 가져와야함 
						app.lookup("MCISE__dtiExpire").value = "2999-12-31 23:59:59";
					} else {
						app.lookup("MCISE__dtiExpire").value = expireAt;
					}
					break;
			}
			//app.lookup("cmb_issueMethod").readOnly = true 수정 시, 발급수단 변경 불가
			//app.lookup("MCISE_btnCardApplication").visible = true; // 신청/재신청 가능하도록 활성화
		} else {
			//app.lookup("MCISE_btnCardApplication").visible = false // 사용자 등록 전이므로 신청 버튼 숨김
		}
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	
	var cardNum = app.lookup("MobileCardInfo").getValue("CardNum");
	if (cardNum == "" || cardNum == null) {
		app.lookup("MCISE_btnSave").bind("value").toLanguage("Str_CardApplication");
	} else {
		app.lookup("MCISE_btnSave").bind("value").toLanguage("Str_Update");
		
		if (dataManager.getMobileCardVersion() == OEM_MOBILECARD_ALPETA) {
			app.lookup('MCISE_ipbMobile').readOnly = true; // 휴대폰 번호
			app.lookup("MCISE_btnCertification").visible = true; //인증번호 재전송
		}
	}
	
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postMobileCardInfoSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	var dmMobileCardInfo = app.lookup('MobileCardInfo');
	var cardStatus = dmMobileCardInfo.getValue("CardStatus");
	if (resultCode == COMERROR_NONE) {
		MCISE_update = true;
		// 1. 삭제 신청
		if (cardStatus == 7) { // 삭제 신청
			dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Deleted"), function( /*cpr.controls.Dialog*/ dialog) {
				dialog.addEventListenerOnce("close", function(e) {
					app.close(app.lookup("MobileCardInfo").getDatas());
				});
			});
			return;
		}
		if (dmMobileCardInfo.getValue("CardNum") == "") {
			// 2. 발급 신청
			dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_IssueSuccess"), function( /*cpr.controls.Dialog*/ dialog) {
				dialog.addEventListenerOnce("close", function(e) {
					app.close(app.lookup("MobileCardInfo").getDatas());
					
				});
			});
			return;
		} else {
			// 3. 수정 신청
			dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_ModifyNotify"), function( /*cpr.controls.Dialog*/ dialog) {
				dialog.addEventListenerOnce("close", function(e) {
					app.close(app.lookup("MobileCardInfo").getDatas());
					
				});
			});
			return;
		}
		
		//		if (dmMobileCardInfo.getValue("Mobile") == app.lookup('MCISE_ipbMobile').value && cardStatus != 7 && originalCardStatus != 7) {
		//			dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_ModifyNotify"), function( /*cpr.controls.Dialog*/ dialog) {
		//				dialog.addEventListenerOnce("close", function(e) {
		//					app.close(app.lookup("MobileCardInfo").getDatas());
		//					
		//				});
		//			});
		//			return;
		//		}
		//		if (cardStatus == 7) {
		//			dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Deleted"), function( /*cpr.controls.Dialog*/ dialog) {
		//				dialog.addEventListenerOnce("close", function(e) {
		//					app.close(app.lookup("MobileCardInfo").getDatas());
		//				});
		//			});
		//		} else {
		//			dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_IssueSuccess"), function( /*cpr.controls.Dialog*/ dialog) {
		//				dialog.addEventListenerOnce("close", function(e) {
		//					app.close(app.lookup("MobileCardInfo").getDatas());
		//				});
		//			});
		//		}
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

/*
 * "인증번호 재요청" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	if (dataManager.getMobileCardVersion() == OEM_MOBILECARD_ALPETA) {
		if (dataManager.getXkeyLicStatus() != XkeyLicStatusOK) {
			dialogAlert(app, dataManager.getString("Str_Waning"), dataManager.getString("Str_AlterXkeyLicenseReActive"));
			return;
		} else {
			var originalExpireAt = new Date(originalCardExpireAt);
			var today = new Date();
			if (originalCardStatus != 1 || originalExpireAt < today) {
				dialogAlert(app, dataManager.getString("Str_Waning"), dataManager.getString("Str_CardStatusAndExpireDate"));
				return;
			} else {
				app.lookup('sms_getMobileCertification').send();
			}
		}
	}
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getMobileCertificationSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getMobileCertification = e.control;
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getMobileCertificationSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getMobileCertification = e.control;
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getMobileCertificationSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getMobileCertification = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_SendCommondComplete"));
		return;
	}
}