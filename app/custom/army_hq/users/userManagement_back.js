/************************************************
 * UserManagement.js
 * Created at 2018. 10. 29. 오후 5:49:46.
 *
 * @author osm8667
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var StrLib = cpr.core.Module.require("lib/StrLib");
var comLib;
var utilLib = cpr.core.Module.require("lib/util");
var USMGR_pageRowCount = 20;

var ACMTP_templateIndex;
var AMACI_deviceWebSocket;

// Body에서 load 이벤트 발생 시 호출.
function onBodyLoad( /* cpr.events.CEvent */ e) {
	comLib = createComUtil(app);
	dataManager = getDataManager();

	var cmbGroup = app.lookup("USMAG_cmbGroup");
	cmbGroup.setItemSet(dataManager.getGroup(), { label: "Name", value: "GroupID" });
	cmbGroup.addItem(new cpr.controls.Item("전체", 0));
	cmbGroup.selectItemByValue(0);

	var cmbUserGroup = app.lookup("USMAG_cmbUserGroup");
	cmbUserGroup.setItemSet(dataManager.getGroup(), { label: "Name", value: "GroupID" });

	var grdCmdGroup = app.lookup("USMGR_grdCmdGroup");
	grdCmdGroup.setItemSet(dataManager.getGroup(), { label: "Name", value: "GroupID" });


	var grdCmdPosition = app.lookup("USMAG_cmbUserPosition");
	grdCmdPosition.setItemSet(dataManager.getPositionList(), { label: "Name", value: "PositionID" });

	var pageIndexer = app.lookup("USMGR_piUserList");
	pageIndexer.pageRowCount = USMGR_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndexer.viewPageCount = 5;// 보여지는 페이지 수(하단 부 인덱스 수)		

	var cmbUserAccessGroup = app.lookup("USINB_cmbUserAccessGroup");
	cmbUserAccessGroup.setItemSet(dataManager.getAccessGroup(), {
		label: "Name",
		value: "ID"
	});

	app.lookup("USMAG_cmbUserType").value = 0;

	connectDeviceServer("127.0.0.1:9600");
	sendUserListRequest();
}

function onBodyUnload(/* cpr.events.CEvent */ e) {
	if (AMACI_deviceWebSocket != null) { AMACI_deviceWebSocket.close(); AMACI_deviceWebSocket = null; }
}

function onSubmitError(/* cpr.events.CSubmissionEvent */ e) { app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR); }
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e) { app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT); }

// ---------------------- 사용자 리스트 요청 관련 ------------------------->>

// 조회 클릭
function onUSMGR_btnSearchClick(/* cpr.events.CMouseEvent */ e) {
	sendUserListRequest();
}

function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e) {
	if (e.keyCode == 13) {
		sendUserListRequest();
	}
}

// 서버에 사용자 리스트 요청
function sendUserListRequest() {

	var userName = app.lookup("USMGR_ipbUserName").value;
	if (userName && userName.length == 1) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "검색어는 2자 이상으로 입력해주세요");
		return;
	}

	var cardNumber = app.lookup("USMGR_ipbCardNumber").value;
	if (cardNumber && cardNumber.length == 1) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "검색어는 2자 이상으로 입력해주세요");
		return;
	}

	var managementNumber = app.lookup("USMGR_ipbManagementNumber").value;
	if (managementNumber && managementNumber.length == 1) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "검색어는 2자 이상으로 입력해주세요");
		return;
	}

	var carNumber = app.lookup("USMGR_ipbCarNumber").value;
	if (carNumber && carNumber.length == 1) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "검색어는 2자 이상으로 입력해주세요");
		return;
	}

	app.lookup("UserList").clear();
	app.lookup("UserCardInfo").clear();
	app.lookup("UserInfo").clear();
	app.lookup("UserCustomArmyHQ").clear();
	app.lookup("UserFPInfo").clear();

	app.lookup("USINB_cbxFP").checked = false;
	app.lookup("USINB_cbxCard").checked = false;
	app.lookup("USINB_cbxFace").checked = false;

	app.lookup("USINB_imgUserPicture").putValue("");

	var piUserList = app.lookup("USMGR_piUserList");//USMGR_piUserList
	//piUserList.currentPageIndex = 1;

	comLib.showLoadMask("", dataManager.getString("Str_UserListGet"), "", 0);

	app.lookup("UserList").clear();

	var piUserList = app.lookup("USMGR_piUserList");
	var curIndex = piUserList.currentPageIndex;
	var offset = (curIndex - 1) * USMGR_pageRowCount


	var smsGetUserList = app.lookup("sms_getUserList");
	smsGetUserList.setParameters("group", app.lookup("USMAG_cmbGroup").value);

	console.log("USMAG_cmbUserType: " + app.lookup("USMAG_cmbUserType").value)
	if (app.lookup("USMAG_cmbUserType").value == 0) {
		smsGetUserList.setParameters("userType", UserPrivArmyNotVisit);
	} else {
		smsGetUserList.setParameters("userType", app.lookup("USMAG_cmbUserType").value);
	}

	smsGetUserList.setParameters("cardNumber", cardNumber);
	smsGetUserList.setParameters("managementNumber", managementNumber);
	smsGetUserList.setParameters("userName", userName);
	smsGetUserList.setParameters("carNumber", carNumber);

	// 페이징 계산하여 요청
	smsGetUserList.setParameters("offset", offset);
	smsGetUserList.setParameters("limit", USMGR_pageRowCount);

	smsGetUserList.send();
}

// 사용자 리스트 가져오기 완료
function onSms_getUserListSubmitDone(/* cpr.events.CSubmissionEvent */ e) {

	comLib.hideLoadMask();

	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode")
	if (resultCode == COMERROR_NONE) {

		var sms_getUserList = e.control;
		var dsUserList = app.lookup("UserList");

		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));

		var recvCount = dsUserList.getRowCount();

		var totalLabel = app.lookup("opt_tot");
		totalLabel.value = totalCount;

		var viewPageCount = totalCount / USMGR_pageRowCount + (totalCount % USMGR_pageRowCount > 0);
		if (viewPageCount > 10) {
			viewPageCount = 10;
		}
		//console.log(dsUserList.getRowDataRanged());
		var piUserList = app.lookup("USMGR_piUserList");
		piUserList.totalRowCount = totalCount;

	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserListGet") + " " + dataManager.getString("Str_Failed") + "." + dataManager.getString(getErrorString(resultCode)));
	}

}

// <<---------------------- 사용자 리스트 요청 관련 -------------------------

// 사용자 리스트 페이징 변경
function onUSMAG_udcUserListPagechange( /* cpr.events.CSelectionEvent */ e) {
	sendUserListRequest();
}

// 사용자 리스트 선택
function onUSMGR_grdUserListSelectionChange(/* cpr.events.CSelectionEvent */ e) {
	getUSerInfoSelectUser()
}

function getUSerInfoSelectUser() {
	var index = app.lookup("USMGR_grdUserList").getSelectedRowIndex();
	if (index < 0) {
		return
	}

	var userInfo = app.lookup("USMGR_grdUserList").getRow(index);
	if (userInfo) {
		app.lookup("UserCardInfo").clear();
		app.lookup("UserInfo").clear();
		app.lookup("UserCustomArmyHQ").clear();
		app.lookup("UserFPInfo").clear();
		app.lookup("UserCarInfo").clear();

		app.lookup("AccessCardInfo").clear();
		app.lookup("dmFPInfo").clear();
		app.lookup("USINB_fiUserPhoto").clear();

		app.lookup("USINB_cbxFP").checked = false;
		app.lookup("USINB_cbxCard").checked = false;
		app.lookup("USINB_cbxFace").checked = false;

		app.lookup("USINB_imgUserPicture").putValue("");

		var userID = userInfo.getValue("UserID");
		var sms_getUserInfo = app.lookup("sms_getUserInfo");
		sms_getUserInfo.action = "/v1/armyhq/users/" + userID;
		sms_getUserInfo.send();
	}
}

function clearUserInfo() {
	app.lookup("USINB_imgUserPicture").putValue("");
}

// 전출 클릭
function onUSMGR_btnMobeOutUserClick(/* cpr.events.CMouseEvent */ e) {
	var gridUserList = app.lookup("USMGR_grdUserList");
	var userInfo = gridUserList.getSelectedRow();

	if (userInfo == null) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Info"), dataManager.getString("Str_UserNotSelected"));
		return
	} else {
		dialogConfirmAMHQ(app.getRootAppInstance(), "", "소속부대원을 전출 처리하시겠습니까?", function ( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function (e) {
				if (dialog.returnValue) {
					comLib.showLoadMask("", dataManager.getString("Str_UserDelete"), "", 0);
					sendDeleteUser(userInfo.getValue("UserID"), 1); // 전출 히스토리 남기도록 옵션 1로...

				} else { }
			});
		});
	}
}

// ---------------------- 사용자 삭제 관련 ------------------------->>

// 사용자 "삭제" 버튼에서 click 이벤트 발생 시 호출.
function onUSMGR_btnDeleteUserClick( /* cpr.events.CMouseEvent */ e) {
	var gridUserList = app.lookup("USMGR_grdUserList");
	var userInfo = gridUserList.getSelectedRow();

	if (userInfo == null) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Info"), dataManager.getString("Str_UserNotSelected"));
		return
	} else {
		dialogConfirmAMHQ(app.getRootAppInstance(), "", dataManager.getString("Str_DeleteConfirm"), function ( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function (e) {
				if (dialog.returnValue) {
					comLib.showLoadMask("", dataManager.getString("Str_UserDelete"), "", 0);
					sendDeleteUser(userInfo.getValue("UserID"), 0);

				} else { }
			});
		});
	}
}

// 사용자 삭제 요청 전송
function sendDeleteUser(userID, option) {

	var sms_deleteUser = new cpr.protocols.Submission("sms_delete");
	sms_deleteUser.action = "/v1/users/" + userID;
	if (option == 1) {
		sms_deleteUser.action += "?option=1";
	}
	sms_deleteUser.method = "DELETE";
	sms_deleteUser.mediaType = "application/x-www-form-urlencoded";
	sms_deleteUser.addResponseData(app.lookup("Result"), false, "Result");

	sms_deleteUser.addEventListenerOnce("submit-done", onSms_deleteUserSubmitDone);
	sms_deleteUser.addEventListenerOnce("submit-error", onSubmitError);
	sms_deleteUser.addEventListenerOnce("submit-timeout", onSubmitTimeout);
	sms_deleteUser.send();
}

// 사용자 삭제 완료
function onSms_deleteUserSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/* @type cpr.protocols.Submission */
	var sms_deleteUser = e.control;
	comLib.hideLoadMask();

	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if (resultCode == COMERROR_NONE || resultCode == COMERROR_USER_NOT_EXIST) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "소속부대원 정보가 삭제되었습니다.");
		sendUserListRequest();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// <<---------------------- 사용자 삭제 관련 -------------------------

// ---------------------- 동기화 함수  ------------------------->>
// 사용자 삭제 결과 콜백. 별도 오픈된 사용자 정보창에서 사용자 삭제시 발생.
exports.onUserUpdateSync = function (userInfo) {
	var udcUserList = app.lookup("USMAG_udcUserList");
	udcUserList.updateUserInfo(userInfo);
}
// 사용자 삭제 결과 콜백. 별도 오픈된 사용자 정보창에서 사용자 삭제시 발생.
exports.onUserDeleteSync = function (userID) {
	var gridUserList = app.lookup("USMAG_udcUserList");
	gridUserList.deleteUser(userID);
}
// <<---------------------- 동기화 함수  -------------------------


function getPrivilegeTypeString(value) {
	var type = "";
	switch (value) {
		case 1: type = dataManager.getString("Str_Admin"); break;
		case 2: type = dataManager.getString("Str_NormalUser"); break;
		case 901: type = dataManager.getString("Str_JwdOtherUnit"); break;
		case 902: type = dataManager.getString("Str_JwdForeign"); break;
		case 903: type = dataManager.getString("Str_JwdResident"); break;
		case 904: type = dataManager.getString("Str_JwdAlways"); break;
		case 905: type = dataManager.getString("Str_JwdSoldier"); break;
		case 906: type = dataManager.getString("Str_JwdFamily"); break;
		default: return ""; break;
	}
	return type;
}

//
function onSms_getUserSyncCustomSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		// 사용자 리스트 reload
		sendUserListRequest();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

//사용자 정보 가져오기 완료
function onSms_getUserInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	var optPictureSizea = app.lookup("USINB_optPictureSize");
	optPictureSizea.value = "";
	if (resultCode == COMERROR_NONE) {
		var userInfo = app.lookup("UserInfo");
		var userImage = app.lookup("USINB_imgUserPicture");
		if (userInfo.getValue("Picture")) {
			userImage.putValue('data:image/png;base64,' + userInfo.getValue("Picture"));
			// 인코딩 된 바이트에 대한 파일 사이즈 이다. 실제 데이터보다 크게 표시됨.
			var getEncByteSize = utilLib.getFormatByteSizeString(userImage.src.length, 2); // 정확한 파일 용량이 아니다.
			var EncByteSize = getEncByteSize.split(' ');
			if (parseFloat(EncByteSize[0]) > 90) { // 파일 사이즈가 너무 크다고 팝업
				optPictureSizea.value = "pda 장비에 사용자 전송시 누락 될 수 있습니다.";
			}
		}

		var opbCardNumber = app.lookup("USINB_opbCardNumber")
		var cardInfoList = app.lookup("UserCardInfo");
		if (cardInfoList.getRowCount() > 0) {
			var cardInfo = cardInfoList.getRow(0);
			opbCardNumber.value = cardInfo.getValue("CardNum");
		} else { opbCardNumber.value = ""; }

		var userCustomInfo = app.lookup("UserCustomArmyHQ");
		if (userCustomInfo.getValue("EnlistmentDate").substring(0, 4) == "0001") {
			userCustomInfo.setValue("EnlistmentDate", "");
		}
		if (userCustomInfo.getValue("DischargeDate").substring(0, 4) == "0001") {
			userCustomInfo.setValue("DischargeDate", "");
		}

		var AuthType = userInfo.getValue("AuthInfo").split(',');
		for (var idx = 0; idx < 7; idx++) {
			var authType = parseInt(AuthType[idx], 10);
			switch (authType) {
				case AuthTypeFingerPrint: app.lookup("USINB_cbxFP").checked = true; break;
				case AuthTypeCard: app.lookup("USINB_cbxCard").checked = true; break;
				case AuthTypeFaceWT: app.lookup("USINB_cbxFace").checked = true; break;
			}
		}

		if (app.lookup("UserFPInfo").getRowCount() > 0) {
			app.lookup("USINB_opbFPCount").value = "0";
		} else {
			app.lookup("USINB_opbFPCount").value = "X";
		}

		if (app.lookup("USINB_cbxFace").checked == 1) {
			app.lookup("USINB_opbFaceWT").value = "0";
		} else {
			app.lookup("USINB_opbFaceWT").value = "X";
		}

		var accessCardInfo = app.lookup("AccessCardInfo");
		app.lookup("USINB_opbManagementNumber").value = accessCardInfo.getValue("ManagementNumber");

		app.lookup("USMGR_grpUserInfo").redraw();
		app.lookup("UserCarInfo").commit();

		console.log(app.lookup("UserCarInfo").getRowCount());

	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}


function onUSINB_fiUserPhotoValueChange(/* cpr.events.CValueChangeEvent */ e) {
	/** @type cpr.controls.FileInput	 */
	var fiUserPhoto = e.control;
	var reader = new FileReader();
	if (fiUserPhoto.files.length != 0) {
		reader.readAsDataURL(fiUserPhoto.files[0]);
	}

	reader.onload = function () {
		var tempImage = new Image();
		tempImage.src = reader.result;
		tempImage.onload = function () {
			var userImage = app.lookup("USINB_imgUserPicture");
			var canvas = document.createElement('canvas');
			var canvasContext = canvas.getContext("2d");;
			canvas.width = 660;
			canvas.height = 1024;
			canvasContext.drawImage(this, 0, 0, tempImage.width, tempImage.height, 0, 0, canvas.width, canvas.height);
			var userInfo = app.lookup("UserInfo");
			var imageData = canvas.toDataURL("image/jpeg");
			var imageData = imageData.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
			userImage.putValue('data:image/png;base64,' + imageData);
			userInfo.setValue("Picture", imageData);

			userImage.redraw();
		}
	};
}

/*
function onUSINB_btnFPInfoClick(){
	var fpInfo = app.lookup("UserFPInfo");
	
	app.openDialog("app/custom/army_hq/users/userFPInfo", {width : 440, height : 180}, function(dialog){
		dialog.headerTitle = "지문 정보";
		dialog.modal = true;
		dialog.initValue = {"fpInfo": fpInfo};
	}).then(function(returnValue){
	});
}
*/

//
function onUSMGR_btnUpdateUserClick(/* cpr.events.CMouseEvent */ e) {
	var gridUserList = app.lookup("USMGR_grdUserList");
	var grdUserInfo = gridUserList.getSelectedRow()

	if (grdUserInfo == null) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Info"), dataManager.getString("Str_UserNotSelected"));
		return
	}
	var count = 0;
	var authType = "";
	if (app.lookup("USINB_cbxFP").checked == true) {
		authType = AuthTypeFingerPrint;
		count++;
	}
	if (app.lookup("USINB_cbxCard").checked == true) {
		if (count > 0) { authType += ","; }
		authType += AuthTypeCard;
		count++;
	}
	if (app.lookup("USINB_cbxFace").checked == true) {
		if (count > 0) { authType += ","; }
		authType += AuthTypeFaceWT;
		count++;
	}

	for (var i = count; i < 8; i++) {
		if (i == 0) { authType = "0"; }
		else { authType += ",0"; }
	}

	console.log(authType);
	app.lookup("UserInfo").setValue("AuthInfo", authType);

	var userID = grdUserInfo.getValue("UserID");

	var cardNum = app.lookup("USINB_opbCardNumber").value;
	var accessCardInfo = app.lookup("AccessCardInfo");
	accessCardInfo.setValue("CardType", grdUserInfo.getValue("CardType"));
	accessCardInfo.setValue("CardNumber", cardNum);
	accessCardInfo.setValue("ApplicationIndex", grdUserInfo.getValue("ApplicationIndex"));
	accessCardInfo.setValue("OwnerID", grdUserInfo.getValue("OwnerID"));

	var putUserInfo = app.lookup("sms_putUserInfo");
	putUserInfo.action = "/v1/armyhq/users/" + userID;
	putUserInfo.send();
}

// 사용자 정보 수정 완료
function onSms_putUserInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), "소속부대원 정보가 수정되었습니다.");
		// 목록의 정보 갱신
		var gridUserList = app.lookup("USMGR_grdUserList");
		var grdUserInfo = gridUserList.getSelectedRow();
		if (grdUserInfo) {
			var userInfo = app.lookup("UserInfo");
			var userCustomInfo = app.lookup("UserCustomArmyHQ");
			grdUserInfo.setValue("GroupCode", userInfo.getValue("GroupCode"));
			grdUserInfo.setValue("Department", userInfo.getValue("Department"));
			grdUserInfo.setValue("Name", userInfo.getValue("Name"));
			var birthday = userCustomInfo.getValue("Birthday");
			if (birthday.length == 8) {
				birthday = birthday.substring(0, 4) + "-" + birthday.substring(4, 6) + "-" + birthday.substring(6, 8);
			}
			grdUserInfo.setValue("Birthday", birthday);

		}
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onUSINB_btnPictureDeleteClick(/* cpr.events.CMouseEvent */ e) {
	var gridUserList = app.lookup("USMGR_grdUserList");
	var grdUserInfo = gridUserList.getSelectedRow()

	if (grdUserInfo == null) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Info"), dataManager.getString("Str_UserNotSelected"));
		return
	}

	var userID = grdUserInfo.getValue("UserID");
	var sms_deleteUserPicture = app.lookup("sms_deleteUserPicture");
	sms_deleteUserPicture.action = "/v1/users/" + userID + "/picture";
	sms_deleteUserPicture.send();
}

function onSms_deleteUserPictureSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), "소속부대원 사진이 삭제 되었습니다.");
		app.lookup("USINB_imgUserPicture").putValue("");
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}



function onUSINT_btnCarAddClick(/* cpr.events.CMouseEvent */ e) {
	var registerablecarCount;
	var registerablecarCount = 5;

	var dsCarInfo = app.lookup("UserCarInfo");
	var registedCarCount = dsCarInfo.getRowCount();
	if (registerablecarCount <= registedCarCount) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_SubmitResult_RegistFail"));
		return
	}

	var count = dsCarInfo.getRowCount();
	if (count > registerablecarCount) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "차량등록 갯수 초과");
		return;
	}

	dsCarInfo.addRow();
	dsCarInfo.commit();
}


function onUSINT_btnCarDeleteClick(/* cpr.events.CMouseEvent */ e) {
	var uSINT_btnCarDelete = e.control;
	var grdCarList = app.lookup("USINT_grdCarList");
	var chkIndices = grdCarList.getCheckRowIndices();
	if (chkIndices.length == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedItem"));
		return;
	}
	comLib.showLoadMask("pro", dataManager.getString("Str_Delete"), "", chkIndices.length);

	var dsDeleteCarInfoList = app.lookup("deleteCarInfoList");
	dsDeleteCarInfoList.clear();
	var delCount = chkIndices.length;
	for (var i = 0; i < delCount; i++) {
		var delIndex = chkIndices[i];
		console.log("delIndex: " + delIndex);
		console.log(grdCarList.getRow(delIndex).getValue("CarNumber"));
		var delCar = { "carNumber": grdCarList.getRow(delIndex).getValue("CarNumber"), "rowIndex": delIndex };
		dsDeleteCarInfoList.addRowData(delCar);
	}
	sendDeleteCarInfo();
}

function onSms_CarInfoDeleteSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
	var sms_deleteUser = e.control;

	var deleteCarInfoList = app.lookup("deleteCarInfoList");
	deleteCarInfoList.realDeleteRow(0);

	var gridUserList = app.lookup("USINT_grdCarList");

	var carNumber = sms_deleteUser.userAttr("carNumber");
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		gridUserList.deleteRow(parseInt(sms_deleteUser.userAttr("rowIndex"), 10));
		sendDeleteCarInfo();
	} else {
		comLib.hideLoadMask();
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"),
			carNumber + " " + dataManager.getString("Str_Delete") + " " + dataManager.getString("Str_Failed") + "." + dataManager.getString(getErrorString(resultCode)));

	}
}

function sendDeleteCarInfo() {
	var dsDeleteCarInfoList = app.lookup("deleteCarInfoList");
	if (dsDeleteCarInfoList.getRowCount() == 0) {
		comLib.hideLoadMask();
		getUSerInfoSelectUser();
		return;
	}
	var dsDeleteCarInfo = dsDeleteCarInfoList.getRow(0);
	var carNumber = dsDeleteCarInfo.getValue("carNumber");

	comLib.updateLoadMask(carNumber);

	var grdUserList = app.lookup("USMGR_grdUserList");
	var index = grdUserList.getSelectedRowIndex();
	var userInfo = grdUserList.getRow(index);
	var userID;
	if (userInfo) {
		userID = userInfo.getValue("UserID");
	}

	var smsCarInfoDelete = app.lookup("sms_CarInfoDelete");
	smsCarInfoDelete.action = "/v1/users/" + userID + "/carNumber/" + carNumber;
	smsCarInfoDelete.userAttr("carNumber", carNumber);
	smsCarInfoDelete.userAttr("rowIndex", dsDeleteCarInfo.getValue("rowIndex").toString());
	smsCarInfoDelete.addResponseData(app.lookup("Result"), false, "Result");

	smsCarInfoDelete.send();
}

/* 버튼 클릭 이벤트 */
function onUSINB_btnCardScanClick(/* cpr.events.CMouseEvent */ e) {
	var grdUserList = app.lookup("USMGR_grdUserList");
	var index = grdUserList.getSelectedRowIndex();
	if (index < 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}

	var userInfo = grdUserList.getRow(index);
	if (userInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
	app.lookup("USINB_opbCardNumber").value = "";

	var bodyData = {};
	bodyData.UserId = String(userInfo.getRowData("OwnerID"));
	bodyData.BrandType = "VIRDI";
	bodyData.CardType = "0";
	bodyData.ReadType = "0";
	bodyData.SerialType = "0";

	var msgReq = {
		msgId: String(WSCmdCardCaptureReq),
		body: bodyData
	};

	var msgData = JSON.stringify(msgReq);
	console.log(msgData);
	AMACI_deviceWebSocket.send(msgData);

}

function onUSINB_FPScanClick(/* cpr.events.CMouseEvent */ e) {
	if (AMACI_deviceWebSocket == null) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_HamsterNotFound"));
		return;
	}

	var grdUserList = app.lookup("USMGR_grdUserList");
	var index = grdUserList.getSelectedRowIndex();
	if (index < 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}

	var userInfo = grdUserList.getRow(index);
	if (userInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}

	app.lookup("USINB_opbFPCount").text = "지문을 입력해주세요.";

	var dmFPInfo = app.lookup("dmFPInfo");
	dmFPInfo.clear();

	dmFPInfo.setValue("UserID", userInfo.getValue("OwnerID"));
	dmFPInfo.setValue("FingerID", 1);

	ACMTP_templateIndex = 0;
	onFPCaptureReq();
}



function connectDeviceServer(address) {
	AMACI_deviceWebSocket = new WebSocket("ws://" + address + "/v1/webEntry");

	AMACI_deviceWebSocket.onopen = function (message) {
		app.lookup("AMACI_opbDeviceMsg").value = dataManager.getString("Str_ARMYHQ_DeviceConnected");
		console.log("device server ws connected.");
	};

	AMACI_deviceWebSocket.onclose = function (message) {
		AMACI_deviceWebSocket = null;
		console.log("Server disconnect...");
	};

	AMACI_deviceWebSocket.onerror = function (message) {
		console.log("error... " + message);
		var opbMessage = app.lookup("AMACI_opbDeviceMsg");
		if (opbMessage) {
			opbMessage.value = dataManager.getString("Str_ARMYHQ_PrintServerInstallRequired");
		}
		var sniDownloadLink = app.lookup("AMACI_sniDownloadLink");
		if (sniDownloadLink) {
			sniDownloadLink.visible = true;
		}
	};

	AMACI_deviceWebSocket.onmessage = function (message) {

		var msg = JSON.parse(message.data);
		console.log("onmessage : " + msg.msgId);
		switch (msg.msgId) {
			case WSCmdCardCaptureRes: { // 캡쳐 완료. 결과 수신.
				comLib.hideLoadMask();
				var result = JSON.parse(msg.body);

				if (result.Result == "success") {
					var opbPersonnelInfoCardSerial = app.lookup("USINB_opbCardNumber");
					var strCardNum = result.CardNum; // 카드번호 옮겨 담기

					if (dataManager.getSystemBrandType() == BRAND_VRIDI) { // 버디 타입은 8자리 채워준다.
						if (strCardNum.length < 8) {
							strCardNum = StrLib.formattedString("00000000", String(result.CardNum), "left");
						}
					}

					result.CardNum = strCardNum;
					opbPersonnelInfoCardSerial.value = result.CardNum; // 카드 교부 클릭시 컨트롤의 데이터를 사용
					opbPersonnelInfoCardSerial.redraw();
				} else if (result.Result == "Capture failed") {
					dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorCardCapture"));
				} else {
					dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), result);
				}

			} break;
			case WSCmdFPCaptureRes: { // 캡쳐 완료. 결과 수신. 
				var result = JSON.parse(msg.body);
				if (ACMTP_templateIndex == 0) {
					app.lookup("USINB_opbFPCount").text = "확인을 위해 지문을 다시 입력해주세요.";
					ACMTP_templateIndex = 1;
					var dmFPInfo = app.lookup("dmFPInfo");
					dmFPInfo.setValue("Template1", result["FingerData"]);
					onFPCaptureReq();
				} else if (ACMTP_templateIndex == 1) { // 두개의 템플릿에 대해 매칭 시도
					app.lookup("USINB_opbFPCount").text = "지문 데이터 검증중입니다.";
					var dmFPInfo = app.lookup("dmFPInfo");
					dmFPInfo.setValue("Template2", result["FingerData"]);
					var template_1 = dmFPInfo.getValue("Template1");
					var template_2 = dmFPInfo.getValue("Template2");
					onFPVerifyReq(dmFPInfo.getValue("UserID"), template_1, template_2);
					ACMTP_templateIndex = 0
				}
			} break;

			case WSCmdFPVerifyRes:
				var body = JSON.parse(msg.body);

				if (body.Result == 0) {
					app.lookup("USINB_opbFPCount").text = "지문 입력 성공";
					var dsUserFpInfo = app.lookup("UserFPInfo");
					dsUserFpInfo.clear();

					var dmFPInfo = app.lookup("dmFPInfo");
					dsUserFpInfo.addRowData({ "FingerID": 1, "MinConvType": 3, "TemplateIndex": 1, "TemplateData": dmFPInfo.getValue("Template1") });
					dsUserFpInfo.addRowData({ "FingerID": 1, "MinConvType": 3, "TemplateIndex": 2, "TemplateData": dmFPInfo.getValue("Template2") });

				} else {
					app.lookup("USINB_opbFPCount").text = "지문 입력 실패";
				}
				break;

			default: console.log(msg); break;
		}
	}
}

function onFPCaptureReq() {
	var dmFPInfo = app.lookup("dmFPInfo");
	var uid = dmFPInfo.getValue("UserID");
	var fingerID = dmFPInfo.getValue("FingerID");

	var bodyData = {};
	bodyData.UserId = uid;
	bodyData.BrandType = "VIRDI";
	bodyData.ImageType = "JPG";
	bodyData.FingerIndex = fingerID;

	var msgReq = {
		msgId: String(WSCmdFPCaptureReq),
		body: bodyData
	};

	var msgData = JSON.stringify(msgReq);
	AMACI_deviceWebSocket.send(msgData);
}

function onFPVerifyReq(uid, template_1, template_2) {
	var bodyData = {};
	bodyData.UserId = uid;
	bodyData.BrandType = "VIRDI";
	bodyData.Template1 = template_1;
	bodyData.Template2 = template_2;

	var msgReq = {
		msgId: String(WSCmdFPVerifyReq),
		body: bodyData
	};

	var msgData = JSON.stringify(msgReq);
	AMACI_deviceWebSocket.send(msgData);
}

function onUSMGR_piUserListSelectionChange(/* cpr.events.CSelectionEvent */ e) {
	sendUserListRequest();
}


/* 얼굴 캡처 버튼 클릭 */
function onUSINB_FaceWTCaptureClick(/* cpr.events.CMouseEvent */ e) {
	var dsUserFaceWTInfo = app.lookup("UserFaceWTInfo"); // 현재는 1장의 사진을 사용.. 추후 여러 장을 등록하게 될 경우를 대비해서 맵이 아닌 셋으로 구성

	var grdPersonnelList = app.lookup("USMGR_grdUserList");
	var index = grdPersonnelList.getSelectedRowIndex();
	if (index < 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
	var userInfo = grdPersonnelList.getRow(index);
	var appld = "app/custom/army_hq/users/UserFaceWTRegist";
	app.getRootAppInstance().openDialog(appld, { width: 780, height: 500 }, function (dialog) {
		dialog.initValue = {
			"Mode": "Modify",
			"ID": userInfo.getValue("OwnerID"),
			"FaceDatas": dsUserFaceWTInfo.getRowDataRanged(),
			"Url": "/v1"
		};
		dialog.bind("headerTitle").toLanguage("Str_FaceRegist");
		dialog.style.header.css("background-color", "#528443");
		dialog.modal = true;
	}).then(function (returnValue) {
		var dsUserFaceWTInfo = app.lookup("UserFaceWTInfo");
		//console.log(returnValue["TemplateData"]);
		if (returnValue["TemplateData"] != "") {
			dsUserFaceWTInfo.clear();
			dsUserFaceWTInfo.addRowData(returnValue);
			app.lookup("USINB_opbFaceWT").value = "얼굴 캡쳐 완료";
		} else {
			app.lookup("USINB_opbFaceWT").value = "얼굴 캡쳐 실패";
		}
	});

}

function onUSINB_btnAcGroupSortClick(/* cpr.events.CMouseEvent */ e) {
	var btnSort = e.control;

	// combobox item 반전
	utilLib.comboboxItemReverse(app.lookup("USINB_cmbUserAccessGroup"));

	// 버튼 클래스 스왑
	if (btnSort.style.hasClass("button-sort-desc-amhq")) {
		btnSort.style.removeClass("button-sort-desc-amhq");
		btnSort.style.addClass("button-sort-ase-amhq");
	} else {
		btnSort.style.removeClass("button-sort-ase-amhq");
		btnSort.style.addClass("button-sort-desc-amhq");
	}
	btnSort.redraw();
}



