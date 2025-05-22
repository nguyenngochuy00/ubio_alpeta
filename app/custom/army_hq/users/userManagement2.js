/************************************************
 * UserManagement.js
 * Created at 2018. 10. 29. 오후 5:49:46.
 *
 * @author osm8667
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var utilLib = cpr.core.Module.require("lib/util");
var StrLib = cpr.core.Module.require("lib/StrLib");
var USMGR_pageRowCount = 30;

var usint_version;
var USCDR_userID;
var USCDR_deviceWebSocket;
var USCDR_mode; // "Regist":카드 등록, "Scan":카드 번호 스캔
var USCDR_url;
var USCDR_searchflag = 0;
var ACMTP_templateIndex;
var AMACI_deviceWebSocket;
var exportCount = 1000; // 엑셀 내보낼 양
var USFPR_templateFormat= 3; //ISO 템플릿 포멧 추가
var USINT_fpModified;
var Parentgroup;
var Childgroup;

// Body에서 load 이벤트 발생 시 호출.
function onBodyLoad( /* cpr.events.CEvent */ e) {	
	comLib = createComUtil(app);
	dataManager = getDataManager();
	
	var dsGroupList = app.lookup("GroupList");
	dataManager.getGroup().copyToDataSet(dsGroupList);
	
	// 상위부서 가져오기
	Parentgroup = getParentgroupcode();
	var grdCmdParentgroup = app.lookup('USMAG_cmbParentGroup');
	grdCmdParentgroup.setItemSet(Parentgroup, {label: "Name",	value: "GroupID" });
	grdCmdParentgroup.addItem(new cpr.controls.Item("전체", 0));
	
	// 하위부서
	//cmbGroup.setItemSet(Childgroup, {label: "Name",	value: "GroupID" });
	var cmbGroup = app.lookup("USMAG_cmbGroup");
	cmbGroup.addItem(new cpr.controls.Item("전체", 0));
	
	// Master와 최상위 부서 관리자만  전체 부서 리스트 볼 수 있음
    if(isSuperGroupAdmin()) {
    	grdCmdParentgroup.selectItem(0); // 상위부서
    	cmbGroup.selectItem(0);		//  하위 부서
        cmbGroup.readOnly = false;
        cmbGroup.hideButton = false;
    } else {
    	grdCmdParentgroup.selectItemByValue(getLoginUserParentGroup());
    	cmbGroup.selectItemByValue(getLoginUserGroupCode()); // 로그인한 사용자와 동일한 부서로 고정
        cmbGroup.readOnly = true;
        cmbGroup.hideButton = true;
        grdCmdParentgroup.readOnly = true;
        grdCmdParentgroup.hideButton = true;
    } 
	
	var cmbUserGroup = app.lookup("USMAG_cmbUserGroup");
	cmbUserGroup.setItemSet(dataManager.getGroup(), {label: "Name",	value: "GroupID" });
//	if(dataManager.getAccountID() == 1000000000000000000) {
//        cmbUserGroup.readOnly = false;
//        cmbUserGroup.hideButton = false;
//    } else {
//        cmbUserGroup.readOnly = true;
//        cmbUserGroup.hideButton = true;
//    }
	
	var grdCmdGroup = app.lookup("USMGR_grdCmdGroup");
	grdCmdGroup.setItemSet(dataManager.getGroup(), {label: "Name",	value: "GroupID" });
	
	
	var grdCmdPosition = app.lookup("USMAG_cmbUserPosition");
	grdCmdPosition.setItemSet(dataManager.getPositionList(), {label: "Name",	value: "PositionID" });
	
	var pageIndexer = app.lookup("USMGR_piUserList");	
	pageIndexer.pageRowCount = USMGR_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndexer.viewPageCount = 5;// 보여지는 페이지 수(하단 부 인덱스 수)		
	
	var cmbUserAccessGroup = app.lookup("USINB_cmbUserAccessGroup");	
	cmbUserAccessGroup.setItemSet(dataManager.getAccessGroup(), {
		label: "Name",
		value: "ID"
	});
	
	app.lookup("USMAG_cmbUserType").value = 0;
	
	var smsArea = app.lookup("sms_getAreas");
	smsArea.send();
	
	connectDeviceServer("127.0.0.1:9600");
	sendUserListRequest();	
}

function onBodyUnload(/* cpr.events.CEvent */ e){
	if(AMACI_deviceWebSocket != null){AMACI_deviceWebSocket.close();AMACI_deviceWebSocket = null;}	
}

function onSubmitError(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

// ---------------------- 사용자 리스트 요청 관련 ------------------------->>

// 조회 클릭
function onUSMGR_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	app.lookup("USMGR_piUserList").currentPageIndex = 1;
	sendUserListRequest();
}

function onUSMGR_ipbUserNameKeyup(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		app.lookup("USMGR_piUserList").currentPageIndex = 1;
		sendUserListRequest();		
	}
}

// 서버에 사용자 리스트 요청
function sendUserListRequest() {
	
	var userName = app.lookup("USMGR_ipbUserName").value;
	if( userName && userName.length == 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "검색어는 2자 이상으로 입력해주세요");
		return;
	}
	
	var cardNumber = app.lookup("USMGR_ipbCardNumber").value;
	if( cardNumber && cardNumber.length == 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "검색어는 2자 이상으로 입력해주세요");
		return;
	}
	
	/* // 관리번호 조회 항목 삭제로 주석 처리 - sep
	var managementNumber = app.lookup("USMGR_ipbManagementNumber").value;
	if( managementNumber && managementNumber.length == 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "검색어는 2자 이상으로 입력해주세요");
		return;
	}
	*/
	
	var carNumber = app.lookup("USMGR_ipbCarNumber").value;
	if( carNumber && carNumber.length == 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "검색어는 2자 이상으로 입력해주세요");
		return;
	}
	var IdentificationNumber = app.lookup("USMGR_ipbIdentificationNumber").value;
	if( IdentificationNumber && IdentificationNumber.length == 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "검색어는 2자 이상으로 입력해주세요");
		return;
	}
	app.lookup("UsersList").clear();
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
	
	comLib.showLoadMask("",dataManager.getString("Str_UserListGet"),"",0);
	
	app.lookup("UsersList").clear();

	var piUserList = app.lookup("USMGR_piUserList");	
	var curIndex = piUserList.currentPageIndex;
	var offset = (curIndex - 1) * USMGR_pageRowCount
		
	
	var smsGetUserList = app.lookup("sms_getUserList");
	
	// 상위부터 체크기능 - otk
	var childgroup = app.lookup("USMAG_cmbGroup").value;
	console.log(childgroup);
	if(childgroup == "0") {
		smsGetUserList.setParameters("group", app.lookup("USMAG_cmbParentGroup").value);
		console.log("상위부서 : " + app.lookup("USMAG_cmbParentGroup").value);
	} else {
		smsGetUserList.setParameters("group", app.lookup("USMAG_cmbGroup").value);
		console.log("하위부서 : " + app.lookup("USMAG_cmbGroup").value);	
	}
	
	console.log("USMAG_cmbUserType: " + app.lookup("USMAG_cmbUserType").value)
	if (app.lookup("USMAG_cmbUserType").value == 0) {
		smsGetUserList.setParameters("userType", UserPrivArmyNotVisit);
	} else {
		smsGetUserList.setParameters("userType", app.lookup("USMAG_cmbUserType").value);
	}
	
	smsGetUserList.setParameters("cardNumber", cardNumber);
	//smsGetUserList.setParameters("managementNumber", managementNumber); // 관리번호 조회 항목 삭제로 주석 처리 - sep
	smsGetUserList.setParameters("userName", userName);
	smsGetUserList.setParameters("carNumber", carNumber);
	smsGetUserList.setParameters("IdentificationNumber", IdentificationNumber);
	
	// 페이징 계산하여 요청
	smsGetUserList.setParameters("offset", offset);
	smsGetUserList.setParameters("limit", USMGR_pageRowCount);
		
	smsGetUserList.send();
}

// 사용자 리스트 가져오기 완료
function onSms_getUserListSubmitDone(/* cpr.events.CSubmissionEvent */ e){

	comLib.hideLoadMask();

	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode")
	if( resultCode == COMERROR_NONE){

		var sms_getUserList = e.control;
		var dsUserList = app.lookup("UsersList");

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
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserListGet")+" "+dataManager.getString("Str_Failed")+"."+dataManager.getString(getErrorString(resultCode)));
	}

}

// <<---------------------- 사용자 리스트 요청 관련 -------------------------

// 사용자 리스트 페이징 변경
function onUSMAG_udcUserListPagechange( /* cpr.events.CSelectionEvent */ e) {
	sendUserListRequest();
}

// 사용자 리스트 선택
function onUSMGR_grdUserListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	getUSerInfoSelectUser()
}

function getUSerInfoSelectUser() {
	var index = app.lookup("USMGR_grdUserList").getSelectedRowIndex();
	if( index < 0  ){
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
		sms_getUserInfo.action = "/v1/armyhq/users/"+userID;
		sms_getUserInfo.send();
	}
}

function clearUserInfo(){
	app.lookup("USINB_imgUserPicture").putValue("");
}

// 전출 클릭
function onUSMGR_btnMobeOutUserClick(/* cpr.events.CMouseEvent */ e){	
	var gridUserList = app.lookup("USMGR_grdUserList");
	var userInfo = gridUserList.getSelectedRow();
		
	if (userInfo == null) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Info"), dataManager.getString("Str_UserNotSelected"));
		return
	} else {
		dialogConfirmAMHQ(app.getRootAppInstance(), "", "소속부대원을 전출 처리하시겠습니까?", function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue) {
					comLib.showLoadMask("",dataManager.getString("Str_UserDelete"),"",0);
					sendDeleteUser(userInfo.getValue("UserID"),1); // 전출 히스토리 남기도록 옵션 1로...

				} else {}
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
		dialogConfirmAMHQ(app.getRootAppInstance(), "", dataManager.getString("Str_DeleteConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue) {
					comLib.showLoadMask("",dataManager.getString("Str_UserDelete"),"",0);
					sendDeleteUser(userInfo.getValue("UserID"),0);

				} else {}
			});
		});
	}
}

// 사용자 삭제 요청 전송
function sendDeleteUser(userID, option){
		
	var sms_deleteUser = new cpr.protocols.Submission("sms_delete");
	sms_deleteUser.action = "/v1/users/"+userID;
	if(option==1){
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
	if( resultCode == COMERROR_NONE || resultCode == COMERROR_USER_NOT_EXIST ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "소속부대원 정보가 삭제되었습니다.");
		sendUserListRequest();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// <<---------------------- 사용자 삭제 관련 -------------------------

// ---------------------- 동기화 함수  ------------------------->>
// 사용자 삭제 결과 콜백. 별도 오픈된 사용자 정보창에서 사용자 삭제시 발생.
exports.onUserUpdateSync = function( userInfo){
	var udcUserList = app.lookup("USMAG_udcUserList");
	udcUserList.updateUserInfo(userInfo);
}
// 사용자 삭제 결과 콜백. 별도 오픈된 사용자 정보창에서 사용자 삭제시 발생.
exports.onUserDeleteSync = function( userID ){
	var gridUserList = app.lookup("USMAG_udcUserList");
	gridUserList.deleteUser(userID);
}
// <<---------------------- 동기화 함수  -------------------------


function getPrivilegeTypeString( value ){
	var type = "";
	switch ( value ){
		case 1: type = dataManager.getString("Str_Admin"); break;
		case 2: type = dataManager.getString("Str_NormalUser"); break;
		case 901 : type = dataManager.getString("Str_JwdOtherUnit"); break;
		case 902 : type = dataManager.getString("Str_JwdForeign"); break;
		case 903 : type = dataManager.getString("Str_JwdResident"); break;
		case 904 : type = dataManager.getString("Str_JwdAlways"); break;
		case 905 : type = dataManager.getString("Str_JwdSoldier"); break;
		case 906 : type = dataManager.getString("Str_JwdFamily"); break;
		default : return ""; break;
	}
	return type;
}

//
function onSms_getUserSyncCustomSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
		// 사용자 리스트 reload
		sendUserListRequest();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}

//사용자 정보 가져오기 완료
function onSms_getUserInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	var optPictureSizea = app.lookup("USINB_optPictureSize"); 
	optPictureSizea.value = "";
	if( resultCode == COMERROR_NONE){
		var userInfo = app.lookup("UserInfo");
		var userImage = app.lookup("USINB_imgUserPicture");
		if( userInfo.getValue("Picture")){
			userImage.putValue('data:image/png;base64,'+userInfo.getValue("Picture"));
			// 인코딩 된 바이트에 대한 파일 사이즈 이다. 실제 데이터보다 크게 표시됨.
			var getEncByteSize = utilLib.getFormatByteSizeString(userImage.src.length, 2); // 정확한 파일 용량이 아니다.
			var EncByteSize = getEncByteSize.split(' ');
			if (parseFloat(EncByteSize[0]) > 90) { // 파일 사이즈가 너무 크다고 팝업
				optPictureSizea.value = "pda 장비에 사용자 전송시 누락 될 수 있습니다.";
			}
		}
								
		//var opbCardNumber = app.lookup("USINT_grdCardList")
		var cardInfoList = app.lookup("UserCardInfo");
//		if( cardInfoList.getRowCount()>0){
//			var cardInfo = cardInfoList.getRow(0);
//			opbCardNumber.value = cardInfo.getValue("CardNum");
//		} else {opbCardNumber.value="";}
//		
		var userCustomInfo = app.lookup("UserCustomArmyHQ");
		if( userCustomInfo.getValue("EnlistmentDate").substring(0,4)=="0001"){
			userCustomInfo.setValue("EnlistmentDate", "");
		}
		if( userCustomInfo.getValue("DischargeDate").substring(0,4)=="0001"){
			userCustomInfo.setValue("DischargeDate", "");
		}
		
		if( app.lookup("UserFPInfo").getRowCount() > 0 ){
			app.lookup("USINB_opbFPCount").value = "O";
			app.lookup("USINB_cbxFP").checked = true;
		}else{
			app.lookup("USINB_opbFPCount").value = "X";
		}
		
		// 얼굴의 경우 DS에서 얼굴 데이터를 안가지고 오므로 AuthType을 통해 얼굴 등록이 되었는지 확인 - mjy
		var authArr = userInfo.getValue("AuthInfo").split(",");
		var faceFlag = false;
		for (var i=0; i<3; i++) { // 타입 3개뿐이므로 3까지만 확인
			if(authArr[i]=="9"){ // 9가 들어있으므로
				app.lookup("USINB_cbxFace").checked = true;
				break;
			}
		}
		
		if (app.lookup("USINB_cbxFace").checked == 1 ) {
			app.lookup("USINB_opbFaceWT").value = "O";
		} else {
			app.lookup("USINB_opbFaceWT").value = "X";
		}
		
		var accessCardInfo = app.lookup("AccessCardInfo");
		app.lookup("USINB_opbManagementNumber").value = accessCardInfo.getValue("ManagementNumber");
		var dsUserCardInfo = app.lookup("UserCardInfo")
		if (dsUserCardInfo.getRowCount() > 0){
			app.lookup("USINB_cbxCard").checked = true;
		}
		
		app.lookup("USMGR_grpUserInfo").redraw();
		app.lookup("UserCarInfo").commit();
		
		console.log(app.lookup("UserCarInfo").getRowCount());
		
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}


function onUSINB_fiUserPhotoValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** @type cpr.controls.FileInput	 */
	var fiUserPhoto = e.control;
	var reader = new FileReader();
	if (fiUserPhoto.files.length != 0) {
		reader.readAsDataURL(fiUserPhoto.files[0]);
	}
    
    reader.onload = function  () {
    	var tempImage = new Image(); 
    	tempImage.src = reader.result;    	 
    	tempImage.onload = function () {    
    		var userImage = app.lookup("USINB_imgUserPicture");    		
    		var canvas = document.createElement('canvas');
    		var canvasContext = canvas.getContext("2d");;    	
    		canvas.width = 660; 
    		canvas.height = 1024;
    		canvasContext.drawImage(this, 0,0, tempImage.width, tempImage.height,0, 0, canvas.width, canvas.height);    		    		
			var userInfo = app.lookup("UserInfo");			
			var imageData = canvas.toDataURL("image/jpeg");
			var imageData = imageData.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
			userImage.putValue('data:image/png;base64,'+imageData);
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
function onUSMGR_btnUpdateUserClick(/* cpr.events.CMouseEvent */ e){
	var gridUserList = app.lookup("USMGR_grdUserList");
	var grdUserInfo = gridUserList.getSelectedRow();
		
	if (grdUserInfo == null) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Info"), dataManager.getString("Str_UserNotSelected"));
		return
	}
	var count = 0; 
	var authType = "";
	if(app.lookup("USINB_cbxFP").checked==true){
		authType = AuthTypeFingerPrint;
		count ++;
	}
	if(app.lookup("USINB_cbxCard").checked==true){
		if(count>0){authType += ",";}
		authType += AuthTypeCard;		
		count ++;
	}
	if(app.lookup("USINB_cbxFace").checked==true){
		if(count>0){authType += ",";}
		authType += AuthTypeFaceWT;		
		count ++;
	}
	
	for( var i=count; i < 8; i++ ){		
		if(i==0){authType = "0";}
		else{authType += ",0";}
	}
	
	console.log(authType);
	app.lookup("UserInfo").setValue("AuthInfo", authType);	
	
	var userID = grdUserInfo.getValue("UserID");
	
	// 이메일 필수 입력값으로 변경 - pse
	if (app.lookup("USINB_Email").value == "" && app.lookup("USINB_Email").value.length < 1){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "이메일을 입력해 주세요.");
		return;
	}
	
	//var cardNum = app.lookup("USINB_opbCardNumber").value;
	// 1- 기존에 get한 accessCard 번호로 체크 한다.
	// 2- 해당카드를 있으면 기존 내용 그대로 전송  없으면 가장 처음 카드를 업데이트
	var accessCardInfo = app.lookup("AccessCardInfo");
	var oldAccessCardNum = accessCardInfo.getValue("CardNumber");
	
	//원래 카드가 있었는데 지금 카드가 없다면
	if (oldAccessCardNum != undefined) {
		var dsUserCardInfo = app.lookup("USINT_grdCardList");
		var userCardInfo =dsUserCardInfo.findFirstRow("CardNum == '"+ oldAccessCardNum +"'");
		var cardNum = "";
		if (!userCardInfo) {
			//없으면 가장첫번째 카드로 변경한다.
			var count = dsUserCardInfo.getRowCount();
			if (count > 0 ) {
				cardNum = dsUserCardInfo.getRow(0).getValue("CardNum");
			} else { //모든 카드 정보를 삭제 할수는 없습니다.
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "교부 중인 카드의 회수는 해당 메뉴에서 진행하셔야 합니다.");
				return;
			}
			accessCardInfo.setValue("CardType",grdUserInfo.getValue("CardType"));
			accessCardInfo.setValue("CardNumber",cardNum);
			accessCardInfo.setValue("ApplicationIndex",grdUserInfo.getValue("ApplicationIndex"));
			accessCardInfo.setValue("OwnerID",grdUserInfo.getValue("OwnerID"));
		}
	} else {
		
	}
	/*
	var cardCount = app.lookup("USINT_grdCardList").getRowCount();
	for( var i = 0 ; i < cardCount ; i ++){	
		var cardNum = app.lookup("USINT_grdCardList").getRow(i);
		cardNum.getValue("CardNum");
	}
	console.log(app.lookup("UserCardInfo").getRowDataRanged());// 추가 밑 새로나온 카드
	var accessCardInfo = app.lookup("AccessCardInfo");
	accessCardInfo.setValue("CardType",grdUserInfo.getValue("CardType"));
	accessCardInfo.setValue("CardNumber",cardNum);
	accessCardInfo.setValue("ApplicationIndex",grdUserInfo.getValue("ApplicationIndex"));
	accessCardInfo.setValue("OwnerID",grdUserInfo.getValue("OwnerID"));
	*/
	
	var dsCarList = app.lookup("UserCarInfo");
	var rowCount = dsCarList.getRowCount();
	for(var i = 0; i < rowCount; i++){
		var carInfo = dsCarList.getRowData(i);
		if (carInfo.CarNumber == "" || carInfo.CarNumber.length == 0){ // 차량번호 그리드에 차량번호가 입력한된 행이 있을 경우 팝업 띄움 - pse
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "차량번호를 입력하거나 삭제 해주세요.");
			app.lookup("USINT_grdCarList").selectRows(i, false);
			return;
		}
	}
	
	var putUserInfo = app.lookup("sms_putUserInfo");
	putUserInfo.action = "/v1/armyhq/users/"+userID;
	putUserInfo.send();
}

// 사용자 정보 수정 완료
function onSms_putUserInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), "소속부대원 정보가 수정되었습니다.");
		// 목록의 정보 갱신
		var gridUserList = app.lookup("USMGR_grdUserList");
		var grdUserInfo = gridUserList.getSelectedRow();		
		if (grdUserInfo) {
			var userInfo = app.lookup("UserInfo");
			var userCustomInfo = app.lookup("UserCustomArmyHQ");
			grdUserInfo.setValue("GroupCode",userInfo.getValue("GroupCode"));
			grdUserInfo.setValue("Department",userInfo.getValue("Department"));
			grdUserInfo.setValue("Name",userInfo.getValue("Name"));
			var birthday = userCustomInfo.getValue("Birthday");
			if(birthday.length==8){
				birthday = birthday.substring(0,4)+"-"+birthday.substring(4,6)+"-"+birthday.substring(6,8);
			}
			grdUserInfo.setValue("Birthday",birthday);
			
		} 
		app.lookup("UserFaceWTInfo").clear();
		
	} else if(resultCode == ErrorCardStatusNotIssueReady){ // 카드 발금 대기 상태
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "출입증 발급 메뉴에서 발급을 먼저 진행해야 합니다.");
	} else if(resultCode == ErrorAmhqTempCardIsIssueStatus){ // 임시출입증 교부 상태
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "임시출입증을 먼저 회수해야 합니다.");
	} else if(resultCode == ErrorAmhqCardIsIssueStatus){ // 출입증이나 공무원증 교부 상태에서 임시출입증 교부하려고 할 경우
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "교부 중인 카드의 회수는 해당 메뉴에서 진행하셔야 합니다.");
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}

function onUSINB_btnPictureDeleteClick(/* cpr.events.CMouseEvent */ e){
	var gridUserList = app.lookup("USMGR_grdUserList");
	var grdUserInfo = gridUserList.getSelectedRow();
		
	if (grdUserInfo == null) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Info"), dataManager.getString("Str_UserNotSelected"));
		return
	}
		
	var userID = grdUserInfo.getValue("UserID");		
	var sms_deleteUserPicture = app.lookup("sms_deleteUserPicture");
	sms_deleteUserPicture.action = "/v1/users/"+userID+"/picture";
	sms_deleteUserPicture.send();
}

function onSms_deleteUserPictureSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), "소속부대원 사진이 삭제 되었습니다."); 
		app.lookup("USINB_imgUserPicture").putValue("");
		app.lookup("UserInfo").setValue("Picture", ""); // 삭제한 이미지 다시 저장되는 버그 수정
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}



function onUSINT_btnCarAddClick(/* cpr.events.CMouseEvent */ e){
var registerablecarCount;
	var registerablecarCount = 5;
	 
	var dsCarInfo = app.lookup("UserCarInfo");
	var registedCarCount = dsCarInfo.getRowCount();
	if (registerablecarCount <= registedCarCount) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_SubmitResult_RegistFail"));
		return
	}
	
	var count = dsCarInfo.getRowCount();
	if( count > registerablecarCount){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "차량등록 갯수 초과");
		return;		
	}
	
	dsCarInfo.addRow();
	dsCarInfo.commit();
}


function onUSINT_btnCarDeleteClick(/* cpr.events.CMouseEvent */ e){
	var uSINT_btnCarDelete = e.control;
	var grdCarList = app.lookup("USINT_grdCarList");
	var chkIndices = grdCarList.getCheckRowIndices();
	if (chkIndices.length == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedItem"));
		return;
	}
	
	comLib.showLoadMask("pro",dataManager.getString("Str_Delete"),"",chkIndices.length);
	var dsCarInfo = app.lookup("UserCarInfo");
	var dsDeleteCarInfoList = app.lookup("deleteCarInfoList");
	dsDeleteCarInfoList.clear();
	var delCount = chkIndices.length;
	for(var i = delCount - 1; i >= 0; i--){ // 뒤에서부터 지워야 다중 체크했을 때도 전부 삭제 된다.
		var delIndex = chkIndices[i];
		console.log("delIndex: " + delIndex);
		var carNumber = grdCarList.getCellValue(delIndex, 1);	
		console.log(carNumber);
		var delCar = {"carNumber":carNumber,"rowIndex":delIndex};
		dsDeleteCarInfoList.addRowData(delCar);		
	}
	sendDeleteCarInfo();	
}

function onSms_CarInfoDeleteSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var sms_deleteUser = e.control;
	
	var deleteCarInfoList = app.lookup("deleteCarInfoList");
	deleteCarInfoList.realDeleteRow(0);

	var gridUserList = app.lookup("USINT_grdCarList");	

	var carNumber = sms_deleteUser.userAttr("carNumber");
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){
		gridUserList.deleteRow( parseInt(sms_deleteUser.userAttr("rowIndex"),10));
		gridUserList.commitData();
		sendDeleteCarInfo();
	} else {		
		comLib.hideLoadMask();
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), 
			carNumber+ " "+dataManager.getString("Str_Delete")+" "+dataManager.getString("Str_Failed")+"."+dataManager.getString(getErrorString(resultCode)));
		
	}
}

function sendDeleteCarInfo() {
	var dsDeleteCarInfoList = app.lookup("deleteCarInfoList");
	if( dsDeleteCarInfoList.getRowCount() == 0 ){
		comLib.hideLoadMask();
		//getUSerInfoSelectUser();
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
	smsCarInfoDelete.action = "/v1/users/"+userID+ "/carNumber/"+ carNumber;
	smsCarInfoDelete.userAttr("carNumber", carNumber);
	smsCarInfoDelete.userAttr("rowIndex", dsDeleteCarInfo.getValue("rowIndex").toString());	
	smsCarInfoDelete.addResponseData(app.lookup("Result"), false, "Result");

	smsCarInfoDelete.send();
}
//------------------------------------------------------------------------
/* 버튼 클릭 이벤트 */
function onUSINB_btnCardScanClick(/* cpr.events.CMouseEvent */ e){
	var grdUserList = app.lookup("USMGR_grdUserList");
	var index = grdUserList.getSelectedRowIndex();
	if( index < 0 ){
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
//-----------------------------------------------------------------------
function onUSINB_FPScanClick(/* cpr.events.CMouseEvent */ e){
	if ( AMACI_deviceWebSocket == null ){		
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_HamsterNotFound"));
		return;
	}
	
	var grdUserList = app.lookup("USMGR_grdUserList");
	var index = grdUserList.getSelectedRowIndex();
	if( index < 0 ){
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
	
	dmFPInfo.setValue("UserID",userInfo.getValue("OwnerID"));
	dmFPInfo.setValue("FingerID",1);
	
	ACMTP_templateIndex = 0;
	onFPCaptureReq();	
}



function connectDeviceServer(address){    
    AMACI_deviceWebSocket = new WebSocket("ws://"+address+"/v1/webEntry");
    
    AMACI_deviceWebSocket.onopen = function(message){
    	app.lookup("AMACI_opbDeviceMsg").value = dataManager.getString("Str_ARMYHQ_DeviceConnected");
        console.log("device server ws connected.");
    };

    AMACI_deviceWebSocket.onclose = function(message){
    	AMACI_deviceWebSocket = null;
        console.log("Server disconnect..."); 
    };

    AMACI_deviceWebSocket.onerror = function(message){
        console.log("error... " + message);
        var opbMessage = app.lookup("AMACI_opbDeviceMsg");
        if(opbMessage){
        	opbMessage.value = dataManager.getString("Str_ARMYHQ_PrintServerInstallRequired");
        }        
        var sniDownloadLink = app.lookup("AMACI_sniDownloadLink");
        if(sniDownloadLink){
        	sniDownloadLink.visible=true;
        } 
    };

    AMACI_deviceWebSocket.onmessage = function(message){
        
        var msg = JSON.parse(message.data);
        console.log("onmessage : "+msg.msgId);
        switch( msg.msgId){
        	case WSCmdCardCaptureRes:{ // 캡쳐 완료. 결과 수신.
            	comLib.hideLoadMask();	
                var result = JSON.parse(msg.body);
                
                if( result.Result == "success" ){
                	if (USCDR_searchflag == 1)	{
                		var strCardNum = result.CardNum; // 카드번호 옮겨 담기
                		if (dataManager.getSystemBrandType() == BRAND_VRIDI) { // 버디 타입은 8자리 채워준다.
			                if ( strCardNum.length < 8){
			            	    strCardNum = StrLib.formattedString("00000000",String(result.CardNum), "left");	
			                }
		            	}
		            	app.lookup("USMGR_ipbCardNumber").value = strCardNum;
                		USCDR_searchflag = 0;
                		return
                	}
		            var dsUserCardInfo = app.lookup("UserCardInfo");
		            if( USCDR_mode == "SCAN"){
		            	dsUserCardInfo.clear();
		            }
		            var strCardNum = result.CardNum; // 카드번호 옮겨 담기
		            
		            var oemVer = dataManager.getOemVersion();
				
		            if (dataManager.getSystemBrandType() == BRAND_VRIDI) { // 버디 타입은 8자리 채워준다.
		                if ( strCardNum.length < 8){
		            	    strCardNum = StrLib.formattedString("00000000",String(result.CardNum), "left");	
		                }
		            } 
		            var existRow = dsUserCardInfo.findFirstRow("CardNum == '"+strCardNum+"'");
		            if(existRow){
		            	if(USCDR_mode == "Regist") { //카드 등록 모드인 경우 중복 에러 처리
		            		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_DuplicateAlert"));
		            	}
		            }else {
		            	dsUserCardInfo.addRowData({"CardNum":strCardNum})
		            }
	            } else if (result.Result=="Capture failed"){
	            	dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorCardCapture"));
	            } else {
	            	dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), result);	            	
	            }
	            
				if (USCDR_searchflag == 1) {
					USCDR_searchflag =0;
                	//실패인경우
                }
            }break;
            case WSCmdFPCaptureRes:{ // 캡쳐 완료. 결과 수신. 
                var result = JSON.parse(msg.body);
                if(ACMTP_templateIndex == 0 ){
                	app.lookup("USINB_opbFPCount").text = "확인을 위해 지문을 다시 입력해주세요.";
	                ACMTP_templateIndex = 1;
	                var dmFPInfo = app.lookup("dmFPInfo");
					dmFPInfo.setValue("Template1", result["FingerData"]);
					onFPCaptureReq();
				} else if ( ACMTP_templateIndex == 1 ){ // 두개의 템플릿에 대해 매칭 시도
					app.lookup("USINB_opbFPCount").text = "지문 데이터 검증중입니다.";
					var dmFPInfo = app.lookup("dmFPInfo");
					dmFPInfo.setValue("Template2", result["FingerData"]);					
					var template_1 = dmFPInfo.getValue("Template1");
					var template_2 = dmFPInfo.getValue("Template2");
					dmFPInfo.setValue("templateFormat", USFPR_templateFormat);
					onFPVerifyReq(dmFPInfo.getValue("UserID"),template_1,template_2);
					ACMTP_templateIndex = 0
				}                
            }break;
            
            case WSCmdFPVerifyRes:
            	var body = JSON.parse(msg.body);
            	
            	if( body.Result == 0){            	
            		app.lookup("USINB_opbFPCount").text = "지문 입력 성공";    
            		var dsUserFpInfo = app.lookup("UserFPInfo");
					dsUserFpInfo.clear();
					
					var dmFPInfo = app.lookup("dmFPInfo");
					dsUserFpInfo.addRowData({"FingerID":1,"MinConvType":3,"TemplateIndex":1,"TemplateData":dmFPInfo.getValue("Template1")});
					dsUserFpInfo.addRowData({"FingerID":1,"MinConvType":3,"TemplateIndex":2,"TemplateData":dmFPInfo.getValue("Template2")});
					        		
            	} else {
            		app.lookup("USINB_opbFPCount").text = "지문 입력 실패";
            	}
            break;
            
            default: console.log(msg); break;
        }
    }
}

function onFPCaptureReq(){	
	var dmFPInfo = app.lookup("dmFPInfo");				
	var uid = dmFPInfo.getValue("UserID");
	var fingerID = dmFPInfo.getValue("FingerID");
	
	var bodyData = {};
	bodyData.UserId = uid;
	bodyData.BrandType = "VIRDI";
	bodyData.ImageType = "JPG";
	bodyData.FingerIndex = fingerID;
	bodyData.TemplateFormat = USFPR_templateFormat;
	
	var msgReq = {
    	msgId: String(WSCmdFPCaptureReq),
    	body: bodyData
	};
	
	var msgData = JSON.stringify(msgReq);	 	
	AMACI_deviceWebSocket.send(msgData);
}

function onFPVerifyReq(uid,template_1,template_2){	
	var bodyData = {};
	bodyData.UserId = uid;
	bodyData.BrandType = "VIRDI";
	bodyData.Template1 = template_1;
	bodyData.Template2 = template_2;
	bodyData.TemplateFormat = USFPR_templateFormat;
	
	var msgReq = {
    	msgId: String(WSCmdFPVerifyReq),
    	body: bodyData
	};
	
	var msgData = JSON.stringify(msgReq);	 	
	AMACI_deviceWebSocket.send(msgData);
}

function onUSMGR_piUserListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	sendUserListRequest();	
}


/* 얼굴 캡처 버튼 클릭 */
function onUSINB_FaceWTCaptureClick(/* cpr.events.CMouseEvent */ e){
	var dsUserFaceWTInfo = app.lookup("UserFaceWTInfo"); // 현재는 1장의 사진을 사용.. 추후 여러 장을 등록하게 될 경우를 대비해서 맵이 아닌 셋으로 구성
	
	var grdPersonnelList = app.lookup("USMGR_grdUserList");
	var index = grdPersonnelList.getSelectedRowIndex();
	if( index < 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
	var userInfo = grdPersonnelList.getRow(index);
	var appld = "app/custom/army_hq/users/UserFaceWTRegist";
	app.getRootAppInstance().openDialog(appld, {width : 780, height : 500}, function(dialog){
		dialog.initValue = {
			"Mode": "Modify",			
		    "ID": userInfo.getValue("OwnerID"),
		    "FaceDatas": dsUserFaceWTInfo.getRowDataRanged(),
		    "Url":"/v1"
		};		
		dialog.bind("headerTitle").toLanguage("Str_FaceRegist");
		dialog.style.header.css("background-color", "#528443");
		dialog.modal = true;		
	}).then(function(returnValue){
		var dsUserFaceWTInfo = app.lookup("UserFaceWTInfo");
		//console.log(returnValue["TemplateData"]);
		if(returnValue["TemplateData"]){
			dsUserFaceWTInfo.clear();
//			dsUserFaceWTInfo.addRowData(returnValue);
			dsUserFaceWTInfo.addRowData(returnValue["TemplateData"]);
			
			app.lookup("USINB_opbFaceWT").value = "얼굴 캡쳐 완료";
			app.lookup("USINB_cbxFace").checked = true;
		} else {
			app.lookup("USINB_opbFaceWT").value = "얼굴 캡쳐 실패";
			app.lookup("USINB_cbxFace").checked = false;
		}
	});	
}

function onUSINB_btnAcGroupSortClick(/* cpr.events.CMouseEvent */ e){
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



//----------------------------------------------------------

/*
 * 버튼(USINT_ipbCardAdd)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSINT_ipbCardAddClick(/* cpr.events.CMouseEvent */ e){
	
//	var RegisterableCardCount = dataManager.getClientOption().getValue("RfRegMax"); // 육본향은 카드 등록이 1개만 가능
	var dsCardInfo = app.lookup("UserCardInfo");
	var RegistedCardCount = dsCardInfo.getRowCount();
	if (RegistedCardCount == 1) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorMaxCardRegistConunt"));
		return
	}
	
	var brandType = dataManager.getSystemBrandType();
	var maxCardCount = 5;
	if (brandType == BRAND_NITGEN) {
		maxCardCount = 1;
	}
	var count = dsCardInfo.getRowCount();
	if (count >= maxCardCount) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_CardCountMaxExceeded"));
		return;
	}
	
	dsCardInfo.addRow();
	dsCardInfo.commit();
	
}


/*
 * 버튼(USINT_ipbCardRemove)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
//삭제는 됐음???
function onUSINT_ipbCardRemoveClick(/* cpr.events.CMouseEvent */ e){
	var grdCardList = app.lookup("USINT_grdCardList");
	var chkIndices = grdCardList.getCheckRowIndices();
	if (chkIndices.length == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedItem"));
		return;
	}
	var dsCardInfo = app.lookup("UserCardInfo");
	
	chkIndices.forEach(function(rowIndex) {
		dsCardInfo.deleteRow(rowIndex)
	});
	dsCardInfo.commit();
	
}


/*
 * 버튼(USINT_btnCardModify)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSINT_btnCardModifyClick(/* cpr.events.CMouseEvent */ e){
	
	var grdUserList = app.lookup("USMGR_grdUserList");
	var index = grdUserList.getSelectedRowIndex();
	if( index < 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
		
	var userInfo = grdUserList.getRow(index);
	if (userInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
	
//	var maxCard = 5; 
	var maxCard = 1;  // 육본향은 카드 1장만 사용
	if( dataManager.getSystemBrandType() == BRAND_NITGEN) {
		maxCard = 1;
	}
	
	var dsUserCardInfo = app.lookup("UserCardInfo");
	var count = dsUserCardInfo.getRowCount();
	if( count >= maxCard ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_CardCountMaxExceeded"));
		return
	} 
	
	
	//app.lookup("USINB_opbCardNumber").value = "";
			
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

/*
 * "단말기선택" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	var button = e.control;
	
	var grdUserList = app.lookup("USMGR_grdUserList");
	var index = grdUserList.getSelectedRowIndex();
	if( index < 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
		
	var userInfo = grdUserList.getRow(index);
	if (userInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
	
	var maxCard = 1; // 육본향은 카드 1장만 부여 가능
	if( dataManager.getSystemBrandType() == BRAND_NITGEN) {
		maxCard = 1;
	}
	
	var dsUserCardInfo = app.lookup("UserCardInfo");
	var count = dsUserCardInfo.getRowCount();
	if( count >= maxCard ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_CardCountMaxExceeded"));
		return
	} 
	
	var appld = "app/custom/army_hq/users/userCardRegist";
	
	app.getRootAppInstance().openDialog(appld, {width: 640,height: 490}, function(dialog) {
		dialog.bind("headerTitle").toLanguage("Str_ARMYHQ_CardScan");
		dialog.initValue = {
			"userID": userInfo.getValue("OwnerID"),
			"UserCardInfo": dsUserCardInfo,
			"Mode": "Regist",
			"Url": "/v1"
		};
		dialog.resizable = false;
		dialog.style.header.css("background-color", "#528443");
		dialog.modal = true;
	}).then(function(returnValue) {		
		var dsUserCardInfo = app.lookup("UserCardInfo");
		dsUserCardInfo.clear();
		
		for (var i = 0; i < returnValue.length; i++) {
			dsUserCardInfo.addRowData(returnValue[i]);
		}
		
	});
	
}


/*
 * 그리드에서 update 이벤트 발생 시 호출.
 * Grid의 행 데이터가 수정되었을 때 이벤트.
 */
function onUSINT_grdCardListUpdate(/* cpr.events.CGridEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var uSINT_grdCardList = e.control;
	var rowIndex = e.rowIndex;
	var rowList = uSINT_grdCardList.findAllRow("CardNum == '" + e.newValue + "'")
	rowList.forEach(function(each) {
		if (rowIndex != each.getIndex()) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorSmimilarCard"));
			uSINT_grdCardList.deleteRow(rowIndex);
			uSINT_grdCardList.commitData();
			return;
		}
	});
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onUSMAG_cmbUserTypeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var uSMAG_cmbUserType = e.control;
	
	if (uSMAG_cmbUserType.value == 903 || uSMAG_cmbUserType.value == 904) {
		app.lookup("USMGR_opbIdentificationNumber").visible = true;
		app.lookup("USMGR_ipbIdentificationNumber").visible = true;
		app.lookup("USMGR_ipbIdentificationNumber").value ="";
	} else {
		app.lookup("USMGR_opbIdentificationNumber").visible = false;
		app.lookup("USMGR_ipbIdentificationNumber").visible = false;
		app.lookup("USMGR_ipbIdentificationNumber").value ="";
	}
}


/*
 * "카드읽기" 버튼(USINT_btnCardRead)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
//function onUSINT_btnCardReadClick(/* cpr.events.CMouseEvent */ e){
//	/** 
//	 * @type cpr.controls.Button
//	 */
//	var uSINT_btnCardRead = e.control;
//	USCDR_searchflag = 1; //0 -> 
//	var bodyData = {};
//	bodyData.UserId = String("0001");
//	bodyData.BrandType = "VIRDI";
//	bodyData.CardType = "0";
//	bodyData.ReadType = "0";
//	bodyData.SerialType = "0";	
//	
//	var msgReq = {
//    	msgId: String(WSCmdCardCaptureReq),
//    	body: bodyData
//	};
//	
//	var msgData = JSON.stringify(msgReq);
//	console.log(msgData);	 	
//	AMACI_deviceWebSocket.send(msgData);
//	
//}


function onUSINT_btnCardReadClick(/* cpr.events.CMouseEvent */ e){
	var dsAccessCardInfo = app.lookup("UserCardInfo2");
	
	var appld = "app/custom/army_hq/users/userCardRegist";
	
	app.getRootAppInstance().openDialog(appld, {width: 640,height: 490}, function(dialog) {
		dialog.bind("headerTitle").toLanguage("Str_ARMYHQ_CardScan");
		dialog.initValue = {
			"userID": String(""),
			"UserCardInfo": dsAccessCardInfo,
			"Mode": "Regist",
			"Url": "/v1"
		};
		dialog.resizable = false;
		dialog.style.header.css("background-color", "#528443");
		dialog.modal = true;
	}).then(function(returnValue) {		
		var dsAccessCardInfo = app.lookup("UserCardInfo2");
		dsAccessCardInfo.clear();
		
		for (var i = 0; i < returnValue.length; i++) {
			dsAccessCardInfo.addRowData(returnValue[i]);
		}
	});
	
}


/*
 * "EXCEL" 버튼(AMASP_btnExport)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAMASP_btnExportClick(/* cpr.events.CMouseEvent */ e){
	var total = app.lookup("Total").getValue("Count");
	if (total == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "조회된 데이터가 없습니다.");
		return
	}
	var dm_ExportParam = app.lookup("ExportParam");
	dm_ExportParam.setValue("mode", "export");
	dm_ExportParam.setValue("total", total);
	dm_ExportParam.setValue("offset", 0);
	
	var totalStep = total / exportCount + (total % exportCount != 0) ? 1 : 0;
	comLib.showLoadMask("pro", "소속부대원 내보내기", "", totalStep);
	
	sendUserListExcel();
}

// 소속부대원 정보 엑셀 내보내기용 서브미션 함수 - mjy
function sendUserListExcel(){
	var userName = app.lookup("USMGR_ipbUserName").value;
	if( userName && userName.length == 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "검색어는 2자 이상으로 입력해주세요");
		return;
	}
	
	var cardNumber = app.lookup("USMGR_ipbCardNumber").value;
	if( cardNumber && cardNumber.length == 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "검색어는 2자 이상으로 입력해주세요");
		return;
	}
	
	var carNumber = app.lookup("USMGR_ipbCarNumber").value;
	if( carNumber && carNumber.length == 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "검색어는 2자 이상으로 입력해주세요");
		return;
	}
	var IdentificationNumber = app.lookup("USMGR_ipbIdentificationNumber").value;
	if( IdentificationNumber && IdentificationNumber.length == 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "검색어는 2자 이상으로 입력해주세요");
		return;
	}         
	
		
	app.lookup("UserList").clear();

	var exportParam = app.lookup("ExportParam");
	var offset = exportParam.getValue("offset");
	
	var smsGetUserListExport = app.lookup("sms_getUserListExport");
	smsGetUserListExport.setParameters("groupID", app.lookup("USMAG_cmbGroup").value);
	
	console.log("USMAG_cmbUserType: " + app.lookup("USMAG_cmbUserType").value)
	if (app.lookup("USMAG_cmbUserType").value == 0) {
		smsGetUserListExport.setParameters("userType", UserPrivArmyNotVisit);
	} else {
		smsGetUserListExport.setParameters("userType", app.lookup("USMAG_cmbUserType").value);
	}
	
	smsGetUserListExport.setParameters("subInclude", "true");
	
	smsGetUserListExport.setParameters("CardNumber", cardNumber);
	// mjy 소속부대원 전용으로 파라미터 추가
	if(userName != null){  // 이름을 입력했으면 이름으로만 검색
		smsGetUserListExport.setParameters("searchCategory", "name");
		smsGetUserListExport.setParameters("searchKeyword", userName);
	}
	smsGetUserListExport.setParameters("CarNumber", carNumber);
	smsGetUserListExport.setParameters("IdentificationNumber", IdentificationNumber);  
	smsGetUserListExport.setParameters("exportType",1);	
	smsGetUserListExport.setParameters("UnitMemberFlag", true); 
	smsGetUserListExport.setParameters("offset", offset);
	smsGetUserListExport.setParameters("limit", exportCount);
	smsGetUserListExport.send();
		
}


function onSms_getUserListExportSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}
function onSms_getUserListExportSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getUserListExportSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	
	if (resultCode == COMERROR_NONE) {
		
		var dsUserList = app.lookup("UserList");
		var total = dsUserList.getRowCount()
		for( var i = 0; i < total ; i++){
			var userInfo = dsUserList.getRow(i);
			// 필수 / 선택 인증 정보 파싱
			var AuthType = userInfo.getValue("AuthInfo").split(',');

			var setCount = 0;
			var andAuth = "";
			for( var idx=0; idx < AuthType[7]; idx++ ){
				if(AuthType[idx]!="0"){
					andAuth += getAuthTypeString( parseInt(AuthType[idx],10))+" ";
					setCount++;
				}
			}
			var orAuth = "";
			for( var idx=AuthType[7]; idx< AuthType.length-1; idx++ ){
				if(AuthType[idx]!="0"){
					orAuth += getAuthTypeString( parseInt(AuthType[idx],10))+" ";
					setCount++;
				}
			}

			if( setCount > 1 ){
				userInfo.setValue("AuthInfo",andAuth+"/ "+orAuth);
			} else {
				userInfo.setValue("AuthInfo",andAuth+orAuth);
			}
		}

		var dm_ExportParam = app.lookup("ExportParam")
		if( dm_ExportParam.getValue("mode")=="list"){

			var grdUserList = app.lookup("grdUserList");
			grdUserList.clear();
			dsUserList.copyToDataSet(grdUserList);

			var dmTotal = app.lookup("Total");
			comLib.hideLoadMask();
			
		} else {
			var exportUserList = app.lookup("ExportUserList");

			if(dsUserList.getRowCount() == 0 ){
				comLib.hideLoadMask();
				if( exportUserList.getRowCount() >0 ){
					exportExcel();
					exportUserList.clear();
				} else {
					dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
				}
			}else {
				dsUserList.copyToDataSet(exportUserList)

				if( exportUserList.getRowCount() >= dm_ExportParam.getValue("total")){
					exportExcel();
					comLib.hideLoadMask();
					exportUserList.clear();
				} else {
					var offset = dm_ExportParam.getValue("offset")
					offset += 1000
					dm_ExportParam.setValue("offset",offset)
					comLib.updateLoadMask(offset);
					sendUserListExcel();
				}
			}
		}
	}else{
		comLib.hideLoadMask();
		
		dialogAlertAMHQ(app, dataManager.getString("Str_Fail"), dataManager.getString("Str_UserListGet")+" "+dataManager.getString("Str_Failed")+" "+dataManager.getString(getErrorString(resultCode)));			
		
	}
	
}

// 소속부대원 엑셀로 내보내기 - mjy 
function exportExcel() {
	var dsUserList = app.lookup("ExportUserList");
	var total = dsUserList.getRowCount();
	
	for (var i = 0; i < total; i++) {
		var userInfo = dsUserList.getRow(i);
		var privilegeID = userInfo.getValue("Privilege");
		var privilegeName = "";
		if (privilegeID == 1) {
			privilegeName = dataManager.getString("Str_Admin");
		} else if (privilegeID == 2){
			privilegeName = dataManager.getString("Str_NormalUser");
		} else {
			privilegeName = dataManager.getPrivilegeName(privilegeID);
		}
		userInfo.setValue("Privilege",privilegeName);
		
	}
	
	var InputData;
	
	var stringified = JSON.stringify(dsUserList.getRowDataRanged());

		stringified = stringified.replace(/"ID"/gi, '"'+dataManager.getString("Str_ID")+'"');
		stringified = stringified.replace(/"UniqueID"/gi, '"'+dataManager.getString("Str_UniqueID")+'"');
		stringified = stringified.replace(/"Name"/gi, '"'+dataManager.getString("Str_Name")+'"');
		stringified = stringified.replace(/"AuthInfo"/gi, '"'+dataManager.getString("Str_AuthInfo")+'"');
		
		stringified = stringified.replace(/"FPCount"/gi, '"'+dataManager.getString("Str_FPCount")+'"');
		stringified = stringified.replace(/"CDCount"/gi, '"'+dataManager.getString("Str_CDCount")+'"');
		stringified = stringified.replace(/"FACount"/gi, '"'+dataManager.getString("Str_FACount")+'"');
		stringified = stringified.replace(/"IRCount"/gi, '"'+dataManager.getString("Str_IRCount")+'"');
		stringified = stringified.replace(/"FAWCount"/gi, '"'+dataManager.getString("Str_FAWCount")+'"');	
		
		stringified = stringified.replace(/"Privilege"/gi, '"'+dataManager.getString("Str_Privilege")+'"');
		stringified = stringified.replace(/"CreateDate"/gi, '"'+dataManager.getString("Str_CreateDate")+'"');
		stringified = stringified.replace(/"UsePeriodFlag"/gi, '"'+dataManager.getString("Str_UsePeriod")+'"');
		stringified = stringified.replace(/"RegistDate"/gi, '"'+dataManager.getString("Str_RegistDate")+'"');
		stringified = stringified.replace(/"ExpireDate"/gi, '"'+dataManager.getString("Str_ExpireDate")+'"');
		stringified = stringified.replace(/"Password"/gi, '"'+dataManager.getString("Str_Password")+'"');
		stringified = stringified.replace(/"Group"/gi, '"'+dataManager.getString("Str_Group")+'"');
		stringified = stringified.replace(/"AccessGroup"/gi, '"'+dataManager.getString("Str_AccessGroup")+'"');
		stringified = stringified.replace(/"CardNum"/gi, '"'+dataManager.getString("Str_CardNum")+'"');
		stringified = stringified.replace(/"BlackList"/gi, '"'+dataManager.getString("Str_BlackList")+'"');
		stringified = stringified.replace(/"FPIdentify"/gi, '"'+dataManager.getString("Str_FPIdentify")+'"');
		stringified = stringified.replace(/"FaceIdentify"/gi, '"'+dataManager.getString("Str_FAIdentify")+'"');
		stringified = stringified.replace(/"APBZone"/gi, '"'+dataManager.getString("Str_APBAreaLocation")+'"');
		stringified = stringified.replace(/"APBZoneName"/gi, '"'+dataManager.getString("Str_APBAreaLocationName")+'"');
		
		stringified = stringified.replace(/"APBExcept"/gi, '"'+dataManager.getString("Str_APBException2")+'"');
		stringified = stringified.replace(/"WorkName"/gi, '"'+dataManager.getString("Str_Schedule3")+'"');
		stringified = stringified.replace(/"MealName"/gi, '"'+dataManager.getString("Str_MealCode")+'"');
		stringified = stringified.replace(/"MoneyName"/gi, '"'+dataManager.getString("Str_Salary2")+'"');
		stringified = stringified.replace(/"VerifyLevel"/gi, '"'+dataManager.getString("Str_VerifyLevel")+'"');
		stringified = stringified.replace(/"Position"/gi, '"'+dataManager.getString("Str_Position")+'"');
		stringified = stringified.replace(/"Department"/gi, '"'+dataManager.getString("Str_Department")+'"');
		stringified = stringified.replace(/"LoginPW"/gi, '"'+dataManager.getString("Str_LoginPassword2")+'"');
		stringified = stringified.replace(/"LoginAllowed"/gi, '"'+dataManager.getString("Str_AllowSignin2")+'"');
		stringified = stringified.replace(/"EmployeeNum"/gi, '"'+dataManager.getString("Str_EmployeeNumber")+'"');
		stringified = stringified.replace(/"Email"/gi, '"'+dataManager.getString("Str_EmailAddress")+'"');
		stringified = stringified.replace(/"IrisIdentify"/gi, '"'+dataManager.getString("Str_TypeIrisIdentify")+'"');
		
		stringified = stringified.replace(/"CarNumber"/gi, '"'+dataManager.getString("Str_CarNumber")+'"');
		stringified = stringified.replace(/"CarColor"/gi, '"'+dataManager.getString("Str_CarColor")+'"');
		stringified = stringified.replace(/"CarType"/gi, '"'+dataManager.getString("Str_CarType")+'"');
		stringified = stringified.replace(/"CarBlackbox"/gi, '"'+dataManager.getString("Str_CarBlackbox")+'"');
		//stringified = stringified.replace('"Card"', '"'+dataManager.getString("Str_Card")+'"');
		//stringified = stringified.replace('"Password"', '"'+dataManager.getString("Str_Password")+'"');
		//dataManager.getString("Str_Position"),
		//dataManager.getString("Str_EmployeeNumber"),				
		//dataManager.getString("Str_Department")

		InputData = JSON.parse(stringified);
	
	var today = dateLib.getToday();
	var filename = "소속부대원_" + today + ".xlsx";
	var ws_name = "소속부대원_정보";
	
	var wb = XLSX.utils.book_new(),
		ws = XLSX.utils.json_to_sheet(InputData);
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);
	
	XLSX.writeFile(wb, filename);
}



/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getAreasSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getAreas = e.control;
	var apbList = app.lookup("AreaList");
	if (apbList.getRowCount() > 0) {
		var cmbAPB = app.lookup("USINB_cmbUserAPBZone");
		cmbAPB.setItemSet(apbList, {
			label: "Name",
			value: "AreaID"
		});
	}
}

/*
 * "단말기선택" 버튼(USINB_btnTerminalFPScan)에서 click 이벤트 발생 시 호출.
 */
function onUSINB_btnTerminalFPScanClick(/* cpr.events.CMouseEvent */ e){
	var grdPersonnelList = app.lookup("USMGR_grdUserList");
	var dmUserInfo = app.lookup("UserInfo");
	var selectIndex = app.lookup("USMGR_grdUserList").getSelectedRowIndex();
	var row = app.lookup("USMGR_grdUserList").getRow(selectIndex);
	
	// 출입자 선택 안하면 경고 팝업 띄우기
	var index = grdPersonnelList.getSelectedRowIndex();
	if( index < 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
		
	var userInfo = grdPersonnelList.getRow(index);
	if (userInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
	
	var appId = "app/custom/army_hq/users/UserFingerRegist"
	var dsUserFpInfo = app.lookup("UserFPInfo");
	app.getRootAppInstance().openDialog(appId, {width : 640, height : 490}, function(dialog){
		// 협박 지문 인자로 전달
		var duressFinger = userInfo.getValue("DuressFinger");
		console.log("duressFinger : " + duressFinger);
		if (duressFinger) {
			duressFinger = duressFinger.split(",");
		}
		
		dialog.bind("headerTitle").toLanguage("Str_FingerRegist");			
		dialog.initValue = {
			"UserID": row.getValue("UserID"),
			"Url": "/v1",
			"FPModified": USINT_fpModified,
			"UserFPInfo": dsUserFpInfo,
			"DuressFinger": duressFinger
		}
		dialog.resizable = false;
		dialog.style.header.css("background-color", "#528443");
		dialog.modal = true;
		
	}).then(function(returnValue){
		USINT_fpModified = 1;
		dsUserFpInfo.clear();
		console.log("returnValue : " + returnValue);
		if (returnValue != "") {
			app.lookup("USINB_opbFPCount").text = "O";
			app.lookup("USINB_cbxFP").checked = true;
			
			var count = 0;
			var duress = "";
			for (var i = 0; i < returnValue.length; i++) {
				if (returnValue[i]["TemplateIndex"] == 1 && returnValue[i]["Duress"] == 1) {
					if (duress.length != 0) {
						duress += ",";
					}
					duress += returnValue[i]["FingerID"];
					count++;
				}
					
					dsUserFpInfo.addRowData(returnValue[i]);
			} 
		} else {
			app.lookup("USINB_opbFPCount").text = "X";
			app.lookup("USINB_cbxFP").checked = false;
		}
	});
	
}

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onUSMAG_cmbParentGroupSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var uSMAG_cmbParentGroup = e.control;
		var Parentgroup = app.lookup('USMAG_cmbParentGroup');
	var ParentGroupID = Parentgroup.value;
	var grdCmdGroup = app.lookup("USMAG_cmbGroup");

	Childgroup = getChildgroupcode(ParentGroupID);
	grdCmdGroup.setItemSet(Childgroup, {label: "Name",	value: "GroupID" })
	grdCmdGroup.selectItem(0);
	grdCmdGroup.redraw();
	
}
