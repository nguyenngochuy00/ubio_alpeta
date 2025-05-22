/************************************************
 * userFaceRegist.js
 * Created at 2018. 10. 16. 오후 1:23:45.
 *
 * @author fois
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");

var _RegMode;
var _Mode;
var pageRowCount = 500;
var comLib;
var _UserID;
var limitedFaceTemplateImageCount = 10;
var _FaceDatas;
var USFAR_url;
var USFAR_faceRequest = false;
var HoldCancel;

function onBodyLoad( /* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	var udcTerminalList = app.lookup("USFAR_udcTerminalList");
	udcTerminalList.deleteColumn([13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3]);
	
	comLib = createComUtil(app);
	var initValue = app.getHost().initValue;
	_FaceDatas = initValue["FaceDatas"];
	_Mode = initValue["Mode"];
	USFAR_url = initValue["Url"];
	if (_Mode == 'Modify') {
		_UserID = initValue["ID"];
		var submission = app.lookup("sms_getUserFaceInfo");
		
		submission.action = USFAR_url + "/users/" + _UserID + "/FaceInfo";
		console.log(submission.action);
		submission.send();
	} else if (_Mode == 'Add') {
		var UserFaceInfoList = app.lookup("UserFaceInfo");
		UserFaceInfoList.build(_FaceDatas);
		
		CheckRegisterable(UserFaceInfoList.getRowCount(), parseInt(UserFaceInfoList.getMax("Index")));
	}
	sendConnectedTerminalListRequest();
}

function sendConnectedTerminalListRequest() {
	var terminalList = app.lookup("USFAR_udcTerminalList");
	var curIndex = terminalList.getCurrentPageIndex();
	
	var pageRowCount = terminalList.getPageRowCount();
	var offset = (curIndex - 1) * pageRowCount;
	
	var smsGetConnectedTerminalList = app.lookup("sms_getConnectedTerminalList");
	smsGetConnectedTerminalList.action = USFAR_url + '/terminals'
	
	smsGetConnectedTerminalList.setParameters("offset", offset);
	smsGetConnectedTerminalList.setParameters("limit", pageRowCount);
	smsGetConnectedTerminalList.setParameters("AuthType", 'face');
	
	var fields = ["terminal_id", "name", "type"];
	smsGetConnectedTerminalList.setParameters("fields", fields);
	
	comLib.showLoadMask("", dataManager.getString("Str_TerminalLoading"), "", pageRowCount);
	smsGetConnectedTerminalList.send();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getConnectedTerminalListSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getConnectedTerminalList = e.control;
	var bResultCode = app.lookup("Result").getValue("ResultCode");
	if (bResultCode == COMERROR_NONE) {
		var dsTerminalList = app.lookup("TerminalList");
		
		var terminalList = app.lookup("USFAR_udcTerminalList");
		terminalList.setTerminalList(dsTerminalList);
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		terminalList.setTotalCount(totalCount);
		comLib.hideLoadMask();
	} else {
		
	}
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getConnectedTerminalListSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getConnectedTerminalList = e.control;
	var ResultCode = app.lookup("Result").setValue("ResultCode", -1);
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getConnectedTerminalListSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getConnectedTerminalList = e.control;
	var ResultCode = app.lookup("Result").setValue("ResultCode", -2);
}

/*
 * 라디오 버튼에서 selection-change 이벤트 발생 시 호출.
 * 라디오버튼 아이템을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onUSFAR_rdbRegTypeSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type cpr.controls.RadioButton
	 */
	var uSFAR_rdbRegType = e.control;
	/*	 
	var explain = app.lookup("USFAR_txaFaceRegistExplain");	
	
	if (uSFAR_rdbRegType.value == 3) {
		explain.value = dataManager.getString("Str_FaceRegistDescS");
	} else if (uSFAR_rdbRegType.value == 5) {
		explain.value = dataManager.getString("Str_FaceRegistDescN");
	}
	
	explain.redraw();
	*/
}

/* "추가" 버튼에서 click 이벤트 발생 시 호출.*/
function onUSFAR_faceRegistReqClick( /* cpr.events.CMouseEvent */ e) {
	/** @type cpr.controls.Button */
	var btnFaceRegistReq = e.control;
	//1. 단말기 체크 확인
	var SelectedTerminlInfo = app.lookup("USFAR_udcTerminalList");
	
	var checkdRowIndices = SelectedTerminlInfo.getCheckedRowIndices();
	if (checkdRowIndices.length <= 0) {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_FaceRegistTerminalCheck"));
		return;
	}else if (checkdRowIndices.length > 1 ) {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_SelectedOneTerminal"));
		return;
	}
	var reqIndex = checkdRowIndices.pop();
	if (reqIndex == undefined) {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_FaceRegistOtherTerminal"));
		return; // TODO: 에러 메세지 추가
	}
	var tID = 0;
	tID = SelectedTerminlInfo.getTerminalID(reqIndex);
	
	var MaxIndex = app.lookup("UserFaceInfo").getMax("Index");
	if (MaxIndex == null || MaxIndex == undefined || MaxIndex < -1) {
		MaxIndex = '0';
	}
	
	var dsUserFacePhoto = app.lookup("UserFacePhoto");
	dsUserFacePhoto.clear();
	
	var sms_getUserFaceInfoFromTerminal = new cpr.protocols.Submission("sms_getUserFaceInfoFromTerminal");
	
	sms_getUserFaceInfoFromTerminal.method = "GET";
	sms_getUserFaceInfoFromTerminal.action = USFAR_url + '/terminals/' + tID + '/scan/face';
	sms_getUserFaceInfoFromTerminal.setParameters("regcount", Number(app.lookup("USFAR_rdbRegType").value));
	sms_getUserFaceInfoFromTerminal.setParameters("regtimeout", 60*6); // 단말기 타임아웃에 맞춰 6분으로 변경  (단말기는 5분)
	sms_getUserFaceInfoFromTerminal.setParameters("UserID", _UserID);
	sms_getUserFaceInfoFromTerminal.setParameters("Index", parseInt(MaxIndex) + 1);
	
	if (USFAR_faceRequest == false) {
		USFAR_faceRequest = true;
		HoldCancel = false;
		btnFaceRegistReq.bind("value").toLanguage("Str_Cancel");
		sms_getUserFaceInfoFromTerminal.setParameters("type", 0); // 고정값 ( 단말로 등록 요청 시작 )
		_RegMode = 'Regist';
		comLib.showLoadMask("", dataManager.getString("Str_FaceRegist"), "", 60);
	} else {
		USFAR_faceRequest = false;
		HoldCancel = true;
		btnFaceRegistReq.bind("value").toLanguage("Str_Add");
		sms_getUserFaceInfoFromTerminal.setParameters("type", 1);
		app.lookup("USFAR_faceRegistReq").enabled = false;
		comLib.hideLoadMask();
		setTimeout(function() {
			comLib.showLoadMask("", dataManager.getString("Str_Cancel"), "", 0);
		}, 100)
		setTimeout(function() {
			comLib.hideLoadMask();
			app.lookup("USFAR_faceRegistReq").enabled = true;
		}, 4000)
		
	}
	
	sms_getUserFaceInfoFromTerminal.addResponseData(app.lookup("Result"));
	sms_getUserFaceInfoFromTerminal.addResponseData(app.lookup("dsUserFaceTemplate"));
	sms_getUserFaceInfoFromTerminal.addResponseData(app.lookup("UserFacePhoto"));
	
	sms_getUserFaceInfoFromTerminal.addEventListenerOnce("submit-done", onSms_getUserFaceInfoFromTerminalSubmitDone);
	sms_getUserFaceInfoFromTerminal.addEventListenerOnce("submit-error", onSms_getUserFaceInfoFromTerminalSubmitError);
	sms_getUserFaceInfoFromTerminal.addEventListenerOnce("submit-timeout", onSms_getUserFaceInfoFromTerminalSubmitTimeout);
	
	sms_getUserFaceInfoFromTerminal.send();
	
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getUserFAInfoSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getUserFAInfo = e.control;
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	if (ResultCode == COMERROR_NONE) {
		var getFAInfoList = app.lookup("UserFaceInfo");
		
		for (var i = 0; i < getFAInfoList.getRowCount(); i++) {
			getFAInfoList.putValue(i, "status", 0); // 단말기에서 얼굴 템플릿 추가된 데이터 체크
		}
		
		getFAInfoList.build(_FaceDatas, true);
		_FaceDatas = [];
		var getFAInfoListCount = getFAInfoList.getRowCount();
		var MaxIndex = getFAInfoList.getMax("Index");
		if (MaxIndex == null || MaxIndex == undefined) {
			MaxIndex = '0';
		}
		
		CheckRegisterable(getFAInfoListCount, parseInt(MaxIndex));
	} else {
		//TODO: error 처리
	}
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getUserFAInfoSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getUserFAInfo = e.control;
	app.lookup("Result").setValue("ResultCode", -1);
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getUserFAInfoSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getUserFAInfo = e.control;
	app.lookup("Result").setValue("ResultCode", -2);
}

// TODO : 남은 장수에따라 최대 3개 까지 추가 등록 가능하도록 수정 
function CheckRegisterable(getFaceTemplateCnt, MaxIndex) {
	// UNIS 방식 포팅 
	// TODO: 얼굴 MaxIndex 와 등록 가능한 이미지 장수를 비교하여 처리하도록 수정 되어야 함
	if (getFaceTemplateCnt == 0) { // 미등록 상태
		app.lookup("USFAR_faceReRegistReq").enabled = false; // 재등록 
		if (HoldCancel == false) {
			app.lookup("USFAR_faceRegistReq").enabled = true; // 추가
		}
//		app.lookup("USFAR_faceRegistReq").enabled = true;
		app.lookup("USFAR_faceDeleteReq").enabled = false; // 삭제
	} else if (getFaceTemplateCnt >= 6) { // 풀등록  처음부터 재등록
		app.lookup("USFAR_faceReRegistReq").enabled = true;
		app.lookup("USFAR_faceRegistReq").enabled = false;
		app.lookup("USFAR_faceDeleteReq").enabled = true; // 삭제
	} else { //추가 가능 상태
		app.lookup("USFAR_faceReRegistReq").enabled = true;
		if (HoldCancel == false) {
			app.lookup("USFAR_faceRegistReq").enabled = true; // 추가
		}
//		app.lookup("USFAR_faceRegistReq").enabled = true;
		app.lookup("USFAR_faceDeleteReq").enabled = true; // 삭제	
	}
	//	var RegistableImageCount = limitedFaceTemplateImageCount - getFaceTemplateCnt;
	
	//	if (MaxIndex == 0 && RegistableImageCount == 10) {
	//		// 얼굴 미등록 사용자
	//		app.lookup("USFAR_faceReRegistReq").enabled = false;
	//		app.lookup("USFAR_faceRegistReq").enabled = true;
	//	} else if (MaxIndex == 1 && RegistableImageCount > 3) { //추가 가능 
	//		app.lookup("USFAR_faceReRegistReq").enabled = true;
	//		app.lookup("USFAR_faceRegistReq").enabled = true;
	//	} else  { // 재등록 만 가능 
	//		app.lookup("USFAR_faceReRegistReq").enabled = true;
	//		app.lookup("USFAR_faceRegistReq").enabled = false;
	//	}
}

/*
 * "재등록" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSFAR_faceReRegistReqClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var uSFAR_faceReRegistReq = e.control;
	//1. 단말기 체크 확인
	var SelectedTerminlInfo = app.lookup("USFAR_udcTerminalList");
	
	var checkdRowIndices = SelectedTerminlInfo.getCheckedRowIndices();
	if (checkdRowIndices.length <= 0) {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_FaceRegistTerminalCheck"));
		return;
	}
	
	var reqIndex = checkdRowIndices.pop();
	if (reqIndex == undefined) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_FaceRegistOtherTerminal"));
		return; // TODO: 에러 메세지 추가
	}
	
	//2. 재등록 가능 여부 체크 
	var UserfaceInfo = app.lookup("UserFaceInfo");
	var MaxIndex = UserfaceInfo.getMax("Index");
	var getFaceInfoListCount = UserfaceInfo.getRowCount(); // 등록된 얼굴 템플릿 갯수
	if (MaxIndex == null || MaxIndex == undefined || MaxIndex < -1) {
		MaxIndex = '0';
	}
	
	var tID = SelectedTerminlInfo.getTerminalID(reqIndex);
	var MaxIndex = app.lookup("UserFaceInfo").getMax("Index");
	
	var RequestData = app.lookup("sms_getUserFaceInfoFromTerminal");
	RequestData.action = USFAR_url + '/terminals/' + tID + '/scan/face';
	RequestData.setParameters("type", 0); // 고정값 ( 단말로 등록 요청 시작 )
	RequestData.setParameters("regcount", Number(app.lookup("USFAR_rdbRegType").value));
	RequestData.setParameters("regtimeout", 60); //default: 30 에러 발생 60으로 변경
	RequestData.setParameters("UserID", _UserID);
	RequestData.setParameters("Index", parseInt(MaxIndex));
	
	_RegMode = 'reRegist';
	RequestData.send();
	comLib.showLoadMask("", dataManager.getString("Str_FaceRegist"), "", 60);
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getUserFaceInfoFromTerminalSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getUserFaceInfoFromTerminal = e.control;
	var UserFaceInfoList = app.lookup("UserFaceInfo");
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		if (USFAR_faceRequest == true) {
			USFAR_faceRequest = false;
			
			var dsUserFaceTemplate = app.lookup("dsUserFaceTemplate");
			dsUserFaceTemplate.setRowStateAll(cpr.data.tabledata.RowState.UPDATED);
			var count = dsUserFaceTemplate.getRowCount();
			
			app.lookup("USFAR_imgFace1").src = "../../../theme/images/faceAuthentication/user_face_img_enrollment_up15_yet.png";
			app.lookup("USFAR_imgFace2").src = "../../../theme/images/faceAuthentication/user_face_img_enrollment_up08_yet.png";
			app.lookup("USFAR_imgFace3").src = "../../../theme/images/faceAuthentication/user_face_img_enrollment_00_yet.png";
			app.lookup("USFAR_imgFace4").src = "../../../theme/images/faceAuthentication/user_face_img_enrollment_down08_yet.png";
			app.lookup("USFAR_imgFace5").src = "../../../theme/images/faceAuthentication/user_face_img_enrollment_down15_yet.png";
			
			for (var i = 0; i < count; i++) {
				dsUserFaceTemplate.putValue(i, "status", 1); // 단말기에서 얼굴 템플릿 추가된 데이터 체크
				switch (i) {
					case 0:
						app.lookup("USFAR_imgFace1").src = "../../../theme/images/faceAuthentication/user_face_img_enrollment_up15_ok.png";
						break;
					case 1:
						app.lookup("USFAR_imgFace2").src = "../../../theme/images/faceAuthentication/user_face_img_enrollment_up08_ok.png";
						break;
					case 2:
						app.lookup("USFAR_imgFace3").src = "../../../theme/images/faceAuthentication/user_face_img_enrollment_00_ok.png";
						break;
					case 3:
						app.lookup("USFAR_imgFace4").src = "../../../theme/images/faceAuthentication/user_face_img_enrollment_down08_ok.png";
						break;
					case 4:
						app.lookup("USFAR_imgFace5").src = "../../../theme/images/faceAuthentication/user_face_img_enrollment_down15_ok.png";
						break;
				}
			}
			if (_RegMode == 'reRegist') {
				UserFaceInfoList.build(dsUserFaceTemplate.getRowDataRanged(), false); // 다시 등록 
			} else if (_RegMode == 'Regist') {
				UserFaceInfoList.build(dsUserFaceTemplate.getRowDataRanged(), true); // 이어 붙이기	
			}
			dsUserFaceTemplate.clear();
		} else {
			
		}
	} else {
		if (USFAR_faceRequest == true) {
			USFAR_faceRequest = false;
			app.lookup("USFAR_faceRegistReq").bind("value").toLanguage("Str_Add");
		}
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	
	var getFAInfoListCount = UserFaceInfoList.getRowCount();
	var MaxIndex = UserFaceInfoList.getMax("Index");
	if (MaxIndex == null || MaxIndex == undefined) {
		MaxIndex = '0';
	}
	CheckRegisterable(getFAInfoListCount, parseInt(MaxIndex));
	
	comLib.hideLoadMask();
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getUserFaceInfoFromTerminalSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getUserFaceInfoFromTerminal = e.control;
	app.lookup("Result").setValue("ResultCode", -1);
	var UserFaceInfoList = app.lookup("UserFaceInfo");
	var getFAInfoListCount = 0;
	var MaxIndex = 0;
	if (UserFaceInfoList != null || UserFaceInfoList != undefined) {
		getFAInfoListCount = UserFaceInfoList.getRowCount();
		MaxIndex = UserFaceInfoList.getMax("Index");
		var MaxIndex = UserFaceInfoList.getMax("Index");
		if (MaxIndex == null || MaxIndex == undefined) {
			MaxIndex = '0';
		}
	} else {
		MaxIndex = '0';
	}
	
	CheckRegisterable(getFAInfoListCount, parseInt(MaxIndex));
	comLib.hideLoadMask();
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getUserFaceInfoFromTerminalSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getUserFaceInfoFromTerminal = e.control;
	app.lookup("Result").setValue("ResultCode", -2);
	var UserFaceInfoList = app.lookup("UserFaceInfo");
	var getFAInfoListCount = UserFaceInfoList.getRowCount();
	var MaxIndex = UserFaceInfoList.getMax("Index");
	if (MaxIndex == null || MaxIndex == undefined) {
		MaxIndex = '0';
	}
	CheckRegisterable(getFAInfoListCount, parseInt(MaxIndex));
	comLib.hideLoadMask();
}
/*
 * "완료" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSFAR_faceCompliteClick( /* cpr.events.CMouseEvent */ e) {
	var dsUserFaceInfo = app.lookup("UserFaceInfo");
	var dsUserFacePhoto = app.lookup("UserFacePhoto");
	app.close({
		"Face": dsUserFaceInfo,
		"Photo": dsUserFacePhoto
	});
}

/*
 * "삭제" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSFAR_faceDeleteReqClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var uSFAR_faceDeleteReq = e.control;
	
	dialogConfirm(app.getRootAppInstance(), "", dataManager.getString("Str_FaceDeleteConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				var UserFaceInfoList = app.lookup("UserFaceInfo");
				UserFaceInfoList.clear();
				
				app.lookup("USFAR_imgFace1").src = "../../../theme/images/faceAuthentication/user_face_img_enrollment_up15_yet.png";
				app.lookup("USFAR_imgFace2").src = "../../../theme/images/faceAuthentication/user_face_img_enrollment_up08_yet.png";
				app.lookup("USFAR_imgFace3").src = "../../../theme/images/faceAuthentication/user_face_img_enrollment_00_yet.png";
				app.lookup("USFAR_imgFace4").src = "../../../theme/images/faceAuthentication/user_face_img_enrollment_down08_yet.png";
				app.lookup("USFAR_imgFace5").src = "../../../theme/images/faceAuthentication/user_face_img_enrollment_down15_yet.png";
				
				var RequestDate = app.lookup("sms_deleteUserFaceInfo");
				RequestDate.action = USFAR_url + "/users/" + _UserID + "/face";
				RequestDate.send();
			} else {}
		});
		
	});
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_deleteUserFaceInfoSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_deleteUserFaceInfo = e.control;
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	
	if (ResultCode == 0) {
		
		var UserFaceInfoList = app.lookup("UserFaceInfo");
		UserFaceInfoList.clear();
		app.lookup("dsUserFaceTemplate").clear();
		var UserFaceInfoList = app.lookup("UserFaceInfo");
		var getFAInfoListCount = UserFaceInfoList.getRowCount();
		var MaxIndex = UserFaceInfoList.getMax("Index");
		if (MaxIndex == null || MaxIndex == undefined) {
			MaxIndex = '0';
		}
		CheckRegisterable(getFAInfoListCount, parseInt(MaxIndex));
		app.lookup("USFAR_imgFace1").src = "../../../theme/images/faceAuthentication/user_face_img_enrollment_up15_yet.png";
		app.lookup("USFAR_imgFace2").src = "../../../theme/images/faceAuthentication/user_face_img_enrollment_up08_yet.png";
		app.lookup("USFAR_imgFace3").src = "../../../theme/images/faceAuthentication/user_face_img_enrollment_00_yet.png";
		app.lookup("USFAR_imgFace4").src = "../../../theme/images/faceAuthentication/user_face_img_enrollment_down08_yet.png";
		app.lookup("USFAR_imgFace5").src = "../../../theme/images/faceAuthentication/user_face_img_enrollment_down15_yet.png";
	} else {
		
	}
	
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_deleteUserFaceInfoSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_deleteUserFaceInfo = e.control;
	var ResultCode = app.lookup("Result").setValue("ResultCode", -2);
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_deleteUserFaceInfoSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_deleteUserFaceInfo = e.control;
	var ResultCode = app.lookup("Result").setValue("ResultCode", -1);
}

/*
 * 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
 */
function onUSFAR_udcTerminalListPagechange( /* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type udc.grid.terminalList
	 */
	var uSFAR_udcTerminalList = e.control;
	sendConnectedTerminalListRequest();
}