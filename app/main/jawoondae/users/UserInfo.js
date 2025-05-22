/************************************************
 * userInfo.js
 * Created at 2018. 10. 15. 오후 7:02:16.
 *
 * @author fois
 ************************************************/
var OldAccessGroupCode;
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateUtil = cpr.core.Module.require("lib/DateLib");
var USINT_fpModified; // 사용자가 지문 데이터를 수정 했는지 여부
var USINT_cardModified;
var comLib;
var StrLib = cpr.core.Module.require("lib/StrLib");
var inputValidManager = createInputValidator(app);
var stringSmsResult;
var usint_version;
var jwd_AccountInfo;
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e){	
	comLib = createComUtil(app);
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	jwd_AccountInfo = dataManager.getAccountInfo();
	USINT_fpModified = 0;
	USINT_cardModified = 0;
	
	var userIDLength = dataManager.getUserIDLength();
	var ipbUserID = app.lookup("USINB_ipbUserID");
	ipbUserID.inputFilter = /^[0-9]*$/;
	ipbUserID.maxLength = userIDLength;	
	
	var dmProcessInfo = app.lookup("ProcessInfo");
	dmProcessInfo.reset();
	
	var privilegeList = dataManager.getPrivilegeList()
	var cmbPrivilege = app.lookup("USINB_cmbPrivilege");	
		
	var admin_PrivilegeID = jwd_AccountInfo.getValue("Privilege");
	if( privilegeList ){
		if (admin_PrivilegeID == 2001) {
			var cmbPrivilege = app.lookup("USINB_cmbPrivilege");	
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdOtherUnit"), Jwd_Other_Unit));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdAlways"), Jwd_Always));
			app.lookup("US_INT_rdbUsePeriod").value = 1;
		} else {
			var cmbPrivilege = app.lookup("USINB_cmbPrivilege");	
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_Admin"), 1));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_NormalUser"), 2));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdOtherUnit"), Jwd_Other_Unit));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdForeign"), Jwd_Foreign));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdResident"), Jwd_Resident));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdAlways"), Jwd_Always));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdSoldier"), Jwd_Soldier));
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_JwdFamily"), Jwd_Family));
			//cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_Visitor"), 10));
						
			//console.log(privilegeList.getRowDataRanged());	
			var count = privilegeList.getRowCount();
			for ( var i = 0; i < count; i++ ){			
				var privilegeInfo = privilegeList.getRow(i);						
				cmbPrivilege.addItem(new cpr.controls.Item(privilegeInfo.getValue("Name"),privilegeInfo.getValue("PrivilegeID")));
			}	
		}
			
	}
	
	var accessGroupList = dataManager.getAccessGroup();
	var cmbAccessGroup = app.lookup("US_INT_cmbAccessGroup");	
		cmbAccessGroup.setItemSet(accessGroupList, {
			label: "Name",
			value: "ID",
	});
	
	var groupList = dataManager.getGroup();	
	var cmbGroup = app.lookup("USINT_cmbGroup");	
		cmbGroup.setItemSet(groupList, {
			label: "Name",
			value: "GroupID",
	});
	
	var timezoneList = dataManager.getTimezoneSet();	
	var cmbTimezone = app.lookup("US_INT_cmbTimezone");	
		cmbTimezone.setItemSet(timezoneList, {
			label: "Name",
			value: "TimezoneID",
	});
	
	var positionList = dataManager.getPositionList();
	var cmbPosition = app.lookup("US_INT_cmbPosition");	
		cmbPosition.setItemSet(positionList, {
			label: "Name",
			value: "PositionID",
	});
	
	var tnaTypeList = dataManager.getTnaTypeList();
	var cmbTnaType = app.lookup("US_INT_cmbTNA");
		cmbTnaType.setItemSet(tnaTypeList, {
			label:"Name",
			value:"Code",
		});
		
	var mealList = dataManager.getMealList();
	var cmbMeal = app.lookup("US_INT_cmbMeal");
		cmbMeal.setItemSet(mealList, {
			label:"Name",
			value:"Code",
		});
		
	var userMessageList = dataManager.getUserMessageList();
	var cmbMeal = app.lookup("US_INT_cmbUserMessage");
		cmbMeal.setItemSet(userMessageList, {
			label:"MessageID",
			value:"MessageID",
		});
		
		
		
	var paymentList = dataManager.getPaymentList();
	var cmbTnaType = app.lookup("US_INT_cmbMoney");
		cmbTnaType.setItemSet(paymentList, {
			label:"Name",
			value:"Code",
		});
	
	
	var brandType = dataManager.getSystemBrandType();
	if(brandType == BRAND_VRIDI){
		app.lookup("TimeZone_Label").visible = false;
		app.lookup("TimeZone_Content").visible = false;
	}
	
	var dmProcessInfo = app.lookup("ProcessInfo");
	var initValue = app.getHost().initValue;
	var userID = initValue["ID"];
	var editMode = initValue["Mode"];
	
	if (editMode == 'Modify') { // 사용자 정보 수정인 경우
	
		app.lookup("USINT_btnUserDelete").visible = true; // 삭제 버튼 보이기
		dmProcessInfo.setValue("EditMode", "Modify");
		dmProcessInfo.setValue("UserID", userID);
		
		var submission = app.lookup("smsUserInfoReq");
		submission.setParameters("fingerprint", "false");
		submission.setParameters("face", "false");
		submission.setParameters("picture", "true");
		
		submission.action = "/v1/jawoondae/users/"+dmProcessInfo.getValue("UserID");
		console.log(submission.action);		
		submission.send();	
		app.lookup("USINB_ipbUserID").readOnly = true;
	} else { // 새로운 사용자 추가인 경우
		
		app.lookup("USINT_btnFPModify").visible = false;
		app.lookup("USINT_btnFAModify").visible = false;		
		app.lookup("USINT_ipbPassword").visible = false;
		app.lookup("USINT_ipbCardView").visible = false;		
				
		app.lookup("USINT_btnUserDelete").visible = false; // 삭제 버튼 숨기기
		dmProcessInfo.setValue("EditMode", "Add");
		dmProcessInfo.setValue("UserID", userID);
		RefreshData(dmProcessInfo.getValue("UserID"));
		
		var	FpVerifyLevel =	dataManager.getClientOption().getValue("FpVerifyLevel");
		app.lookup("US_INT_cmbFPVerifyLevel").value =  FpVerifyLevel;
		
		app.lookup("US_INT_grdFamilyList").enabled = false;
		app.lookup("US_INT_btnFamilySelect").enabled = false;
		var cmbPrivilege2 = app.lookup("USINB_cmbPrivilege");	
		cmbPrivilege2.value = 1000;	
		PrivilegeSelectionChange(parseInt(app.lookup("USINB_cmbPrivilege").value, 10));
	}
	
}

// 사용자 추가시 기본 정보 추가.
function RefreshData( userID ) {
	var dmUserInfo = app.lookup("UserInfo");
	dmUserInfo.reset();
	dmUserInfo.setValue("ID", userID);
	var getDate = dateUtil.makeDateFormat(dateUtil.getDate().substr(0, 8), "-");
	
	dmUserInfo.setValue("RegistDate", getDate);
	dmUserInfo.setValue("ExpireDate", getDate);
	console.log(getDate);
	app.lookup("US_INT_dtiBirthday").value = getDate;
	app.lookup("US_INT_dtiBackgroundCheckDate").value = "1990-01-01";
	onDisplayAuthType();
	
	dmUserInfo.setValue("LoginAllowed", 0);
	//console.log(dmUserInfo.getDatas());
	app.lookup("USINB_ipbUserID").readOnly = true;
	app.lookup("USINB_ipbUserName").tooltip ="Name";
	app.lookup("USINB_ipbUniqueID").tooltip ="UniqueID";
	//app.lookup("USINB_basicGrp").redraw();
	app.lookup("USINB_tabInfo").redraw();
	app.lookup("USINB_ipbUserID").readOnly = false;
	
	//20190827 정래훈 인풋에 값이 없으면 경고 표시를 주기위해 작성
	var USINB_ipbUserName = app.lookup("USINB_ipbUserName").value;
	if(!USINB_ipbUserName){
		inputValidManager.validate(app.lookup("USINB_ipbUserName"), "isNull", dataManager.getString("Str_RequiredAlert"),"");
	}else{
		console.log("ipbUserName");
		inputValidManager.validate(app.lookup("USINB_ipbUserName"), "isValid", "","");
	}
	
	var USINB_ipbUniqueID = app.lookup("USINB_ipbUniqueID").value;
	if(!USINB_ipbUniqueID){
		inputValidManager.validate(app.lookup("USINB_ipbUniqueID"), "isNull", dataManager.getString("Str_RequiredAlert"));
	}else{
		console.log("USINB_ipbUniqueID");
		inputValidManager.validate(app.lookup("USINB_ipbUniqueID"), "isValid", "");
	}
	
	var USINT_ipbPassword = app.lookup("USINT_ipbPassword").value;
	if(!USINT_ipbPassword){
		inputValidManager.validate(app.lookup("USINT_ipbPassword"), "isNull", dataManager.getString("Str_RequiredAlert"));
	}else{
		inputValidManager.validate(app.lookup("USINT_ipbPassword"), "isValid", "");
	}
	
	var USINB_ipbUserID = app.lookup("USINB_ipbUserID").value;
	if(!USINB_ipbUserID){
		inputValidManager.validate(app.lookup("USINB_ipbUserID"), "isNull", dataManager.getString("Str_RequiredAlert"));
	}else{
		inputValidManager.validate(app.lookup("USINB_ipbUserID"), "isValid", "");
	}
}

// 사용자 정보 수신 완료
function onSmUserInfoReqSubmitDone(/* cpr.events.CSubmissionEvent */ e){		
	var userInfo = app.lookup("UserInfo");
	
	// 사용자 정보 요청 결과
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode"); 
	if( resultCode == 0 ){
		//console.log(userInfo.getDatas());
		var dmProcessInfo = app.lookup("ProcessInfo");
		// 사용자 사진
		var userImage = app.lookup("USINB_imgUserPicture");
		if( userInfo.getValue("Picture")){
			userImage.putValue('data:image/png;base64,'+userInfo.getValue("Picture"));
		}
		
		// 그룹 정보 매핑
		var cmbGroup = app.lookup("USINT_cmbGroup");	
			
		var groupName = dataManager.getGroupName(userInfo.getValue("GroupCode"));
	//	app.lookup("USINB_ipbGroup").value = groupName;
		cmbGroup.selectItemByLabel(groupName);
			
		// 출입그룹 매핑
		var accessGroupName = dataManager.getAccessGroupName(app.lookup("UserInfo").getValue("AccessGroupCode"));
	//	app.lookup("USINB_ipbAccessGroup").value = accessGroupName
		
		// 사용자 아이디,이름,유니크아이디 정보 매핑
		app.lookup("USINB_ipbUserName").value = userInfo.getValue("Name");	
		app.lookup("USINB_ipbUserID").value = userInfo.getValue("ID");	
		var OldUniqueID = userInfo.getValue("UniqueID");	
		app.lookup("USINB_ipbUniqueID").value = OldUniqueID;	
		dmProcessInfo.setValue("_OldUniqueID", OldUniqueID);  
		dmProcessInfo.setValue("_ReDuplicationResult", "None");
		onDisplayAuthType();
		
		// 지문 인증 타입 체크. 인증수단에 지문이 있으면 편집 버튼 활성화 
		if(IsExistAuthType(AuthTypeFingerPrint)==true){
			app.lookup("USINT_btnFPModify").visible = true;
		}else{
			app.lookup("USINT_btnFPModify").visible = false;
		}
		
		// 얼굴 인증 타입 체크. 인증수단에 얼굴이 있으면 편집 버튼 활성화 
		if(IsExistAuthType(AuthTypeFace)==true){
			app.lookup("USINT_btnFAModify").visible = true;
		}else{
			app.lookup("USINT_btnFAModify").visible = false;
		}
		
		// 비밀번호 인증 타입 체크. 인증수단에 비밀번호가 있으면 편집 버튼 활성화
		if(IsExistAuthType(AuthTypePassword)==true){
			app.lookup("USINT_ipbPassword").visible = true;
		}else{
			app.lookup("USINT_ipbPassword").visible = false;
		}
		
		// 카드 인증 타입 체크. 인증수단에 카드가 있으면 편집 버튼 활성화
		if(IsExistAuthType(AuthTypeCard)==true){
			app.lookup("USINT_ipbCardView").visible = true;
		}else{
			app.lookup("USINT_ipbCardView").visible = false;
		}
		
		var dsCardInfo = app.lookup("UserCardInfo");
		// 비밀번호 체크때문에 추가 됨
		app.lookup("US_INT_ipbLoginPW").value = userInfo.getValue("LoginPW");
		var privilegeID = userInfo.getValue("Privilege");
		console.log(privilegeID);
		PrivilegeSelectionChange(parseInt(privilegeID, 10));
		
		app.lookup("JUS_ipbMobile").value =userInfo.getValue("Mobile"); 
		app.lookup("US_INT_dtiBirthday").value = userInfo.getValue("Birthday");
		// 요약 정보화면 갱신
		app.lookup("US_INF_grpSummary").redraw();
		app.lookup("USINB_tabInfo").redraw();
		
	}else{
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_UserInfoLoading"));	
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}

	//20190827 정래훈 인풋에 값이 없으면 경고 표시를 주기위해 작성
	var USINB_ipbUserName = app.lookup("USINB_ipbUserName").value;
	if(!USINB_ipbUserName){
		inputValidManager.validate(app.lookup("USINB_ipbUserName"), "isNull", dataManager.getString("Str_RequiredAlert"),"");
	}else{
		inputValidManager.validate(app.lookup("USINB_ipbUserName"), "isValid", "","");
	}
	
	var USINB_ipbUniqueID = app.lookup("USINB_ipbUniqueID").value;
	if(!USINB_ipbUniqueID){
		inputValidManager.validate(app.lookup("USINB_ipbUniqueID"), "isNull", dataManager.getString("Str_RequiredAlert"));
	}else{
		inputValidManager.validate(app.lookup("USINB_ipbUniqueID"), "isValid", "");
	}
	
	var USINT_ipbPassword = app.lookup("USINT_ipbPassword").value;
	if(!USINT_ipbPassword){
		inputValidManager.validate(app.lookup("USINT_ipbPassword"), "isNull", dataManager.getString("Str_RequiredAlert"));
	}else{
		inputValidManager.validate(app.lookup("USINT_ipbPassword"), "isValid", "");
	}
	
	var USINB_ipbUserID = app.lookup("USINB_ipbUserID").value;
	if(!USINB_ipbUserID){
		inputValidManager.validate(app.lookup("USINB_ipbUserID"), "isNull", dataManager.getString("Str_RequiredAlert"));
	}else{
		inputValidManager.validate(app.lookup("USINB_ipbUserID"), "isValid", "");
	}
	
	app.lookup("US_INT_ipbAdminGroup").value = userInfo.getValue("AdminGroup");
	app.lookup("US_INT_ipbIssueNumber").value = userInfo.getValue("IssueNumber");
	app.lookup("US_INT_ipbIdentifiNum").value = userInfo.getValue("IdentifyNum");
	app.lookup("US_INT_dtiBackgroundCheckDate").value = userInfo.getValue("BackgroundcheckDate");



}

// 사용자 정보 수신 실패
function onSmUserInfoReqSubmitError(/* cpr.events.CSubmissionEvent */ e){	
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR)
}

// 사용자 정보 수신 타임아웃
function onSmUserInfoReqSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){	
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

function IsExistAuthType(authType){
	var userInfo = app.lookup("UserInfo");
	var AuthType = userInfo.getValue("AuthInfo").split(',');
	for( var idx=0; idx < 7; idx++ ){		
		var checkData = parseInt(AuthType[idx],10);
		if( checkData == authType ){
			return true;
		}		
	}
	return false;
}

// 인증정보 배열 분석하여 화면 표시
function onDisplayAuthType(){
	var userInfo = app.lookup("UserInfo");
	// 필수 / 선택 인증 정보 파싱
	var AuthType = userInfo.getValue("AuthInfo").split(',');
		
	var fpExist = false;
	var andAuth = "";
	for( var idx=0; idx < AuthType[7]; idx++ ){		
		var authType = parseInt(AuthType[idx],10);
		andAuth += getAuthTypeString(authType )+" ";		
	}
	var orAuth = "";	
	for( var idx=AuthType[7]; idx< AuthType.length-1; idx++ ){		
		orAuth += getAuthTypeString( parseInt(AuthType[idx],10))+" ";
	}
	app.lookup("USINT_opbAuthAnd").value = andAuth;
	app.lookup("USINT_opbAuthOr").value = orAuth;
}

// "웹캠" 버튼 클릭
function onUSINB_btnWebcamClick(e){
	var button = e.control;
	var appld = "app/main/users/WebCamViewer" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {width : 660, height : 410}, function(dialog){
		dialog.initValue = 0;
		dialog.resizable = false;		
		dialog.bind("headerTitle").toLanguage("Str_WebCamViewer");
		dialog.modal = true;		
	}).then(function(returnValue){		
		var userPicture = app.lookup("USINB_imgUserPicture");
        resizeImage(userPicture,returnValue,160,160);   
        
        var thumbnailImg = app.lookup("thumbnail"); 
        resizeImage(thumbnailImg,returnValue,80,80);
	});
}

// 사진 등록 버튼 클릭시
function onUSINB_btnPictureFileSelectClick(e){
	
	var uS_INB_btnPictureFileSelect = e.control;
	var pictureFile = app.lookup("USINB_ImageFileInput");	
	pictureFile.openFileChooser();
}

// 이미지 리사이징 함수
function resizeImage(ctrl,imageData,width,height){

	var tempImage = new Image(); 
    tempImage.src = imageData; 
    tempImage.onload = function () {    
    	var canvas = document.createElement('canvas');
    	var canvasContext = canvas.getContext("2d");
    	canvas.width = width; 
    	canvas.height = height;
    	
    	canvasContext.drawImage(this, 0, 0, width, height);

		ctrl.src = canvas.toDataURL("image/jpeg");
	}
}

// 사진 파일 선택 완료시
function onUSINB_ImageFileInputValueChange(e){
	var fileTest = e.control;
	var pictureFile = app.lookup("USINB_ImageFileInput");	
	
    // 읽기
    var reader = new FileReader();
    reader.readAsDataURL(pictureFile.files [0]);

    //로드 한 후
    reader.onload = function  () {
    	var userPicture = app.lookup("USINB_imgUserPicture");
        resizeImage(userPicture,reader.result,160,160);   
        
        var thumbnailImg = app.lookup("thumbnail"); 
        resizeImage(thumbnailImg,reader.result,80,80);        
    }; 
}

// 인증타입 수정 버튼 클릭
function onUSINT_btnAuthTypeModifyClick(/* cpr.events.CMouseEvent */ e){
	
	var userInfo = app.lookup("UserInfo");
	// 필수 / 선택 인증 정보 파싱
	var AuthType = userInfo.getValue("AuthInfo").split(',');
	
	var andAuth = [];	
	for( var idx=0; idx < AuthType[7]; idx++ ){		
		andAuth[idx] = parseInt(AuthType[idx],10);		
	}
	var orAuth = [];
	var count = 0;
	for( var idx=AuthType[7]; idx< AuthType.length-1; idx++ ){		
		orAuth[count++]= parseInt(AuthType[idx],10);
	}
	var appld = "app/main/users/UserAuthTypeSet" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {width : 410, height : 500}, function(dialog){
		dialog.initValue = {"AuthAnd":andAuth,"AuthOr":orAuth};		
		dialog.bind("headerTitle").toLanguage("Str_AuthTypeSelect");
		dialog.modal = true;		
	}).then(function(returnValue){
		//console.log(returnValue);
		var strAuthType = "";
		var init = false;
		returnValue.forEach(function(authType){
			if( init == false ){
				init = true
			} else{
				strAuthType += ","
			}
			strAuthType += authType
		});
		userInfo.setValue("AuthInfo", strAuthType);
		onDisplayAuthType();
		// 설정후 인증 타입에 맞춰서 인증 TAB 활성화 처리
		if(IsExistAuthType(AuthTypeFingerPrint)==true){
			app.lookup("USINT_btnFPModify").visible = true;
		}else{
			app.lookup("USINT_btnFPModify").visible = false;
		}
		
		if(IsExistAuthType(AuthTypeFace)==true){
			app.lookup("USINT_btnFAModify").visible = true;
		}else{
			app.lookup("USINT_btnFAModify").visible = false;
		}
		
		// 비밀번호 인증 타입 체크. 인증수단에 비밀번호가 있으면 편집 버튼 활성화
		if(IsExistAuthType(AuthTypePassword)==true){
			app.lookup("USINT_ipbPassword").visible = true;
		}else{
			app.lookup("USINT_ipbPassword").visible = false;
		}
		
		// 카드 인증 타입 체크. 인증수단에 카드가 있으면 편집 버튼 활성화
		if(IsExistAuthType(AuthTypeCard)==true){
			app.lookup("USINT_ipbCardView").visible = true;
		}else{
			app.lookup("USINT_ipbCardView").visible = false;
		}
	});
}

// 사용자 사진 저장 버튼 클릭
function onUSINB_btnPictureSaveClick(/* cpr.events.CMouseEvent */ e){
		
	var userPicture = app.lookup("USINB_imgUserPicture");
	if(userPicture.src == null || userPicture.src.length==0){
		return;
	}
	
	var imageData = userPicture.src.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
	
	var thumbnailImg = app.lookup("thumbnail");
	var imageThumbnailData = thumbnailImg.src.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
	
	var pictureInfo = app.lookup("PictureInfo");
	    
	pictureInfo.setValue("ImageType", "jpeg");
	pictureInfo.setValue("ImageData", imageData);
	pictureInfo.setValue("Thumbnail", imageThumbnailData);
	var userInfo = app.lookup("UserInfo");	
	var submission = app.lookup("smsUserPhotoUpdate");
	submission.action = "/v1/users/"+userInfo.getValue("ID")+"/picture";	
	comLib.showLoadMask("","사용자 사진 저장","",0);	
	submission.send();	
}



// 사용자 사진 삭제 // by nsh
function onUSINB_btnPictureDeleteClick(/* cpr.events.CMouseEvent */ e){
		
	
	
	var imageData = "";
	
	var thumbnailImg = "";
	var imageThumbnailData = "";
	
	var pictureInfo = app.lookup("PictureInfo");
	    
	pictureInfo.setValue("ImageType", "jpeg");
	pictureInfo.setValue("ImageData", imageData);
	pictureInfo.setValue("Thumbnail", imageThumbnailData);
	var userInfo = app.lookup("UserInfo");	
	var submission = app.lookup("smsUserPhotoDelete");
	submission.action = "/v1/users/"+userInfo.getValue("ID")+"/picture";	
	comLib.showLoadMask("","사용자 사진 삭제","",0);	
	submission.send();	
}




// 사용자 사진 등록 종료
function onSmsUserPhotoUpdateSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	comLib.hideLoadMask();
	if( resultCode == COMERROR_NONE ){
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_UserPhotoSave"));		
	} else {		
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_UserPhotoSave"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}	
}

// 사용자 사진 등록 실패
function onSmsUserPhotoUpdateSubmitError(/* cpr.events.CSubmissionEvent */ e){	
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR)
}

// 사용자 사진 등록 타임아웃
function onSmsUserPhotoUpdateSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){	
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

function checkReduplicationResult(uniqueID) {
	var result = false;	
	var strErrMsg = "";
	
	var userInfo = app.lookup("UserInfo");
	var dmProcessInfo = app.lookup("ProcessInfo");
	var _ReDuplicationResult = dmProcessInfo.getValue("_ReDuplicationResult");
	
	var editMode = dmProcessInfo.getValue("EditMode");
	
	if (uniqueID.toString().length > 0) { // 유니크 아이디를 입력 한 경우
		
		if ( editMode = 'Modify') { // 사용자 수정인 경우
			
			if (_ReDuplicationResult == 'None') { // 중복 체크 시도 안한 경우
				if( uniqueID != dmProcessInfo.getValue("_OldUniqueID")) { // 유니크 아이디를 변경한 경우						
					strErrMsg = dataManager.getString("Str_TryUserUniqueIDDuplicateCheck");
				} else { // 유니크 아이디 변경 안한 경우
					result = true;
				}				
			} else if (_ReDuplicationResult == 'ReDu') { // 있을수 없는 조합 , 죽복 상태
				strErrMsg = dataManager.getString("Str_UserUniqueIDDuplicated");
			} else if (_ReDuplicationResult == 'pass') { // 중복 체크 통화
				result = true; 
			} else {
				strErrMsg = dataManager.getString("Str_TryUserUniqueIDDuplicateCheck");
			}
		} else if ( editMode = 'Add') { // 사용자 추가인 경우
			if (_ReDuplicationResult == 'None') { // 중복 체크 안함
				result = false; 
				strErrMsg = dataManager.getString("Str_TryUserUniqueIDDuplicateCheck");
			} else if (_ReDuplicationResult == 'ReDu'){
				result = false; // 중복 상태
				strErrMsg = dataManager.getString("Str_UserUniqueIDDuplicated");
			} else if (_ReDuplicationResult == 'pass') {
				result = true;
			}
		}
	} else {
		result = true;
	}
	return [result, strErrMsg]
}

function validateUserInfo(){
	var dmUserInfo = app.lookup("UserInfo");
	
	// 사용자 이름 입력 여부 체크
	var userName = dmUserInfo.getValue("Name");
	if( userName.length == 0 ){
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_InvalidUserName"));
		return false;
	}
	/* 유니크 아이디는 필수 항목이 아닙
	var userUniqueID = dmUserInfo.getValue("UniqueID");
	if( userUniqueID.length == 0 ){
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_InvalidUniqueID"));
		return;
	}
	* */
	
	// 인증 수단 설정 여부 확인
	var userAuthType = dmUserInfo.getValue("AuthInfo");
	var AuthType = userAuthType.split(",");
	var chkAuth = 0;
	for( var idx=0; idx < 7; idx++ ){		
		var checkData = parseInt(AuthType[idx],10);
		if( checkData != 0 ){
			chkAuth++;
			break;
		}		
	}
	
	if( chkAuth == 0 ){
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_InvalidAuthType"));
		return false;
	}
	
	// 인증수단에 지문 설정 시 실제 지문을 입력했는지 확인 .. 서버에서 사용자 등록/수정 구분하여 확인.
	if( IsExistAuthType(AuthTypeFingerPrint) == true ){
		/*
		var dsUserFPInfo = app.lookup("UserFPInfo");		
		if( dsUserFPInfo.getRowCount() == 0 ){
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_FPDataNotExist"));
			return false;
		}
		*/
	}
	
	// 인증수단에 어룩ㄹ 설정 시 실제 얼굴를 입력했는지 확인  ... 서버에서 사용자 등록/수정 구분하여 확인 하도록 수정.
	if( IsExistAuthType(AuthTypeFace) == true ){
		/*
		var dsUserFaceInfo = app.lookup("UserFaceInfo");		
		if( dsUserFaceInfo.getRowCount() == 0 ){
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_FaceDataNotExist"));
			return false;
		}
		*/
	}
	
	// 인증수단에 비밀번호 설정 시 실제 비밀번호를 입력했는지 확인 
	if( IsExistAuthType(AuthTypePassword) == true ){
		var userPassword = dmUserInfo.getValue("Password");
		if( userPassword.length == 0 ){
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_InvalidPassword"));
			return false;
		}
	}
	
	// 인증수단에 카드 설정 시 실제 카드를 입력했는지 확인
	if( IsExistAuthType(AuthTypeCard) == true ){
		var dsUserCardInfo = app.lookup("UserCardInfo");
		var count = dsUserCardInfo.getRowCount();
		for( var index = 0; index < count; index++ ){
			var cardInfo = dsUserCardInfo.getRow(index);
			if( cardInfo.getValue("CardNum").length == 0 ){
				dsUserCardInfo.deleteRow(index);
			}
		}
		dsUserCardInfo.commit();
		if( dsUserCardInfo.getRowCount() == 0 ){
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_CardDataNotExist"));
			return false;
		}
	}
	
	if (Checkloginpassword() == false) {
		
		return false;
	}
	return true;
}

// 사용자 정보 저장 버튼 클릭
function onUSINB_btnUserSaveClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var uSINB_btnUserSave = e.control;
	var dmUserInfo = app.lookup("UserInfo");
	var uniqueID = dmUserInfo.getValue("UniqueID");
	// 로그인 id 체크
	var SendResult = checkReduplicationResult(uniqueID); // UniqueID  중복 체크 
	
	if (SendResult[0] == true) {
		if( validateUserInfo() == false ){			
			return;
		}
		
		var dmProcessInfo = app.lookup("ProcessInfo");
		var registDate = dmUserInfo.getValue("RegistDate");	//
		
		if(registDate.toString().length <= 10) { //YYYY-MM-DD 
			registDate = registDate.toString() + " 00:00:00.000";
		}
		
		dmUserInfo.setValue("RegistDate",registDate.toString());
		var expireDate = dmUserInfo.getValue("ExpireDate"); // + " 23:59:59.000";
		
		if(expireDate.toString().length <= 10) { //YYYY-MM-DD 
			expireDate = expireDate.toString() + " 23:59:59.000";
		}
		
		dmUserInfo.setValue("ExpireDate",expireDate);
		
		// 로그인 비밀번호 추가.
		dmUserInfo.setValue("LoginPW", app.lookup("US_INT_ipbLoginPW").value);
		
		comLib.showLoadMask("",dataManager.getString("Str_UserRegist"),"",0);	
		
		if(dmProcessInfo.getValue("EditMode") == 'Modify') { // 사용자 수정. update submission 적용 
			var submission = app.lookup("smsUserInfoUpdate");
			submission.action = "/v1/users/"+dmUserInfo.getValue("ID");		
			submission.send();		
		} else if(dmProcessInfo.getValue("EditMode") == 'Add')  { // 사용자 등록 Regist submission				
			var submission = app.lookup("smsUserInfoAdd");
			//submission.setParameters("UserID", +dmUserInfo.getValue("ID"));
			submission.action = "/v1/users";	
			
			submission.send();		
		}
	} else {
		dialogAlert(app, dataManager.getString("Str_Waning"), SendResult[1]);
	}	
}

// 사용자 정보 저장 완료
function onSmsUserInfoUpdateSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	var dmProcessInfo = app.lookup("ProcessInfo");
	dmProcessInfo.setValue("_ReDuplicationResult", 'None');
	dmProcessInfo.setValue("_OldUniqueID", app.lookup("UserInfo").getValue("UniqueID"));
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE) {		
		dmProcessInfo.setValue("EditMode", "Modify"); // 등록 성공하면 수정 모드로 변경			
		app.lookup("USINB_ipbUserID").readOnly = true;
		
		var commandEvent = new cpr.events.CUIEvent("execute-command", {
			content: {
				"target": DLG_USER_MANAGEMENT,	
				"command": "Update",
				"UserInfo": app.lookup("UserInfo").getDatas()
			}
		});
		var pwd = app.lookup("UserInfo").getValue("LoginPW");
		if (pwd.toString().length >= 4 && pwd != "****") {//**** 아니고 4자리 이상이면
			app.lookup("UserInfo").setValue("LoginPW", "****");
		}
		
		app.lookup("UserFaceInfo").clear(); // 저장완료후 Face 정보를 비워준다.
	
		app.getHostAppInstance().dispatchEvent(commandEvent);
		
		sendJwdUserInfoUpdate();
		stringSmsResult ="Str_UserUpdate";
	}  else {
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_UserUpdate";
		if (resultCode == ErrorUserOldLoginPasswordDuplicate) {
			errMsg = errStr;	
		} else if (resultCode == ErrorUserSimilarCard) {
			// 중복 정보 
			var dUniqueID = app.lookup("DuplicateInfo").getValue("DuplicateUniqueID");
			var dName = app.lookup("DuplicateInfo").getValue("DuplicateName");
			errMsg = "UniqueID: " + dUniqueID + ", " + "Name: " + dName +" " + dataManager.getString(errStr); 
		} else if (resultCode == ErrorUserSimilarFingerprint || resultCode == ErrorUserSimilarFingerprint) {
			var DuplicateID = app.lookup("SimilarUserCandidate").getValue("ID");
			//console.log(DuplicateID);
			errMsg = "ID: " + DuplicateID + " " + dataManager.getString(errStr);
		}else if(resultCode == ERROR_USER_FAMILY_REGIST){
			errMsg = dataManager.getString("Str_ErrorUserFamilyRegist");
		}else if(resultCode == ERROR_USER_CAR_REGIST){
			errMsg = dataManager.getString("Str_ErrorUserCarRegist");
		} else {
			if( errStr.length > 0 ){
				errMsg = dataManager.getString(errStr);
			} else {
				errMsg = dataManager.getString(errMsg);
			}
		}
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);		
		comLib.hideLoadMask();					
	}
	
}

// 사용자 정보 실패
function onSmsUserInfoUpdateSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);		
}

// 사용자 정보 저장 타임아웃
function onSmsUserInfoUpdateSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);	
}

// 지문 수정 버튼 클릭
function onUSINT_btnFPModifyClick(/* cpr.events.CMouseEvent */ e){	
	var userInfo = app.lookup("UserInfo");
	var duressFinger = new Array();
	var appld = "app/main/users/UserFingerRegist" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {width : 640, height : 490}, function(dialog){
		
		/* 기본적으로는 사용자 지문 등록 창에서 서버에 사용자 지문을 요청
		 * 등록된 지문이 없는 사용자이지만 지문 등록 화면을 열어 지문을 캡쳐하고 서버에 저장 전인 사용자인 경우 지문 등록창 재 진입시 이전에 캡쳐했지만 서버 저장전인 지문 정보를 전달한다.		 */
		var dsUserFpInfo = app.lookup("UserFPInfo"); 
		
		// 협박 지문 인자로 전달
		var duressFinger = userInfo.getValue("DuressFinger");
		if( duressFinger ){
			duressFinger = duressFinger.split(",");
		}
		
		dialog.bind("headerTitle").toLanguage("Str_FingerRegist");
		dialog.initValue = {"UserID":userInfo.getValue("ID"),"Url":"/v1",
		"FPModified":USINT_fpModified,"UserFPInfo":dsUserFpInfo,"DuressFinger":duressFinger};
		dialog.resizable = false;		
		dialog.modal = true;		
	}).then(function(returnValue){ // 지문 등록 화면에서 적용을 누른 경우에만 이 부분으로 들어옴.
		USINT_fpModified = 1; // 사용자가 지문을 수정한 경우 다음번 지문 편집창을 열때는 수정된 데이터로 표시
		
		var dsUserFpInfo = app.lookup("UserFPInfo");
		dsUserFpInfo.clear();
		
		var count = 0;
		var duress = "";
		for (var i = 0 ; i < returnValue.length ; i++) {			
			if ( returnValue[i]["TemplateIndex"] == 1 && returnValue[i]["Duress"] == 1 ) {
				if( duress.length != 0 ){
					duress += ",";
				}				 
				duress += returnValue[i]["FingerID"];
				count ++;
			}
			
			dsUserFpInfo.addRowData(returnValue[i]);
		}
		
		for(;count<8;count++){
			if( duress.length != 0 ){
					duress += ",";
			}	
			duress += 0;
		}
		//console.log(duress);
		
		userInfo.setValue("DuressFinger", duress);
	});
}

// 사용자 얼굴 편집 버튼 클릭
function onUSINT_btnFAModifyClick(/* cpr.events.CMouseEvent */ e){	
	var userInfo = app.lookup("UserInfo");
	
	var UserFaceInfoList = app.lookup("UserFaceInfo");
	var NewUserFaceInfoList = UserFaceInfoList.findAllRow("status == 1");
	var data = [];
	if (NewUserFaceInfoList != null || NewUserFaceInfoList != undefined) {
		for(var i=0; i<NewUserFaceInfoList.length; i++){
			data.push(NewUserFaceInfoList[i].getRowData());
		}	
	}
	var dmProcessInfo = app.lookup("ProcessInfo");
	//console.log(app.lookup("USINB_ipbUserID").value);
	var appld = "app/main/users/UserFaceRegist" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {width : 680, height : 600}, function(dialog){
		dialog.initValue = {
			
			"Mode":dmProcessInfo.getValue("EditMode"),
		    "ID": app.lookup("USINB_ipbUserID").value,
		    "FaceDatas": data,
		    "Url":"/v1"
		};
		
		dialog.bind("headerTitle").toLanguage("Str_FaceRegist");
		dialog.modal = true;		
	}).then(function(returnValue){
		var dsUserFaceInfo = app.lookup("UserFaceInfo");
		dsUserFaceInfo.clear();
		returnValue.copyToDataSet(dsUserFaceInfo);
		//console.log(dsUserFaceInfo.getRowDataRanged());
	});
}

// 모바일 카드 발급 버튼 클릭
function onUSINT_btnMCIssueClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var uSINT_btnMCIssue = e.control;
	var appld = "app/main/mobileCard_old/mobileCardIssue" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {width : 420, height : 150}, function(dialog){
		//dialog.initValue = {"FA":userInfo.getValue("FAData")};
		dialog.modal = true;		
	}).then(function(returnValue){
		//console.log("MobileCard issue result :", returnValue);
	});
	
}

// 사용자 삭베 버튼 클릭시
function onUS_INB_btnUserDeleteClick(/* cpr.events.CMouseEvent */ e){	
	var dmProcessInfo = app.lookup("ProcessInfo");
	if (dmProcessInfo.getValue("EditMode") == 'Add') { // 사용자 추가 모드에서는 삭제 할 수 없음. 사용자 등록 전...				
		return;
	}
	dialogConfirm(app.getRootAppInstance(), "", "삭제 하시겠습니까?", function( /*cpr.controls.Dialog*/ dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				var RequestData = app.lookup("smsUserInfoDelete");
				var getID = app.lookup("USINB_ipbUserID").value;
				RequestData.action = "/v1/users/" + getID;
				RequestData.send();
			} else {}
		});
	
	});
}
/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSmsUserInfoDeleteSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUserInfoDelete = e.control;
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	
	if ( ResultCode == 0) {
		var commandEvent = new cpr.events.CUIEvent("execute-command", {
			content: {
				"target": DLG_USER_MANAGEMENT,	
				"command": "Delete",
				"UserID": app.lookup("USINB_ipbUserID").value
			}
		});
	
		app.getHostAppInstance().dispatchEvent(commandEvent);		
		
		app.close();
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorUserDeleteFailed."));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(ResultCode)));
	}
}

// 유니크 아이디 중복 체크 클릭
function onUSINB_btnReduplicationCheckClick(/* cpr.events.CMouseEvent */ e){	
	var uSINB_btnReduplicationCheck = e.control;
	var sendSmsFlag = false;
	var newUniqueID = app.lookup("UserInfo").getValue("UniqueID"); // 화면에 입력한 유니크 아이디
		
	if ( newUniqueID == '') {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_InvalidUniqueID"));		
		return;
	}
	
	var dmProcessInfo = app.lookup("ProcessInfo");
	var _Mode = dmProcessInfo.getValue("EditMode");
	var _OldUniqueID = dmProcessInfo.getValue("_OldUniqueID");
	
	if (_Mode == 'Modify') {
		if(_OldUniqueID == newUniqueID) {
			dmProcessInfo.setValue("_ReDuplicationResult", 'pass');
			dialogAlert(app, "알림", " 등록된 유니크 아이디와 동일 합니다.");
			return;
		} else {
			sendSmsFlag = true;
		} 
	} else if (_Mode == 'Add') {
		sendSmsFlag = true;
	}
	
	if ( sendSmsFlag == true) {
		var RequestData = app.lookup("smsUniqueIDCheckReq");
		RequestData.setParameters("UniqueID", newUniqueID);
		RequestData.send();
	}
}
/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSmsUniqueIDCheckReqSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUniqueIDCheckReq = e.control;
	var strMessage="";
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	var dmProcessInfo = app.lookup("ProcessInfo");
	if(ResultCode == COMERROR_REDUPLICATE_UNIQUEID_EXIST) {
		dmProcessInfo.setValue("_ReDuplicationResult", 'ReDu');
		app.lookup("USINB_ipbUniqueID").focusable = true;
		strMessage =" UniqueID 가 이미 등록 되어 있습니다.";
		//20190827 정래훈 유니크아이디를 지우고 경고표시
		app.lookup("USINB_ipbUniqueID").value = "";
		inputValidManager.validate(app.lookup("USINB_ipbUniqueID"), "isNull", dataManager.getString("Str_RequiredAlert"));
	} else if( ResultCode == COMERROR_REDUPLICATE_UNIQUEID_NOT_EXIST ) {
		dmProcessInfo.setValue("_ReDuplicationResult", 'pass');
		strMessage = " UniqueID 를 사용 할 수 있습니다.";
	} else {
		//strMessage = "UniqueID를 중복 체크 할 수 없습니다. 설정 정보 확인후 재시도 해 주세요. ";
		strMessage = dataManager.getString(getErrorString(ResultCode));
	}
	dialogAlert(app, "알림", strMessage);
}
// 단말기 리스트 버튼 클릭
function onUS_INB_btnTerminalListClick(/* cpr.events.CMouseEvent */ e){	
	var dmProcessInfo = app.lookup("ProcessInfo");
	var _Mode = dmProcessInfo.getValue("EditMode");
	var _UserID = app.lookup("UserInfo").getValue("ID");
	
	if (_Mode == 'Add') {
		dialogAlert(app, "알림", "등록 되지 않은 사용자는 단말기 목록을 확인 할 수 없습니다.");
		return;
	}
	
	var appld = "app/main/terminals/popup/terminalTinyListForUser" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {width: 380, height: 550}, function(dialog){
			dialog.ready(function(dialogApp){
				dialog.initValue = {
					"ID": _UserID
				};
				dialog.modal = true;
				dialog.headerTitle = dataManager.getString("Str_AccessibleTerminalList");
			});
		}).then(function(returnValue){
			
		});
}

// 사용자 정보 추가 완료
function onSmsUserInfoAddSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
		var dmProcessInfo = app.lookup("ProcessInfo");
		dmProcessInfo.setValue("EditMode", "Modify");
		app.lookup("USINB_ipbUserID").readOnly = true;
		dmProcessInfo.setValue("_ReDuplicationResult", 'None');
		dmProcessInfo.setValue("_OldUniqueID", app.lookup("UserInfo").getValue("UniqueID"));
		var pwd = app.lookup("UserInfo").getValue("LoginPW");
		if (pwd.toString().length >= 4 && pwd != "****") {//**** 아니고 4자리 이상이면
			app.lookup("UserInfo").setValue("LoginPW", "****");
		}
		
		app.lookup("UserFaceInfo").clear(); // 저장완료후 Face 정보를 비워준다.
		sendJwdUserInfoUpdate();
		stringSmsResult ="Str_UserAdd";
	} else {
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_UserAdd";
		if (resultCode == ErrorUserSimilarFingerprint || resultCode == ErrorUserSimilarFingerprint || resultCode == ErrorUserSimilarFingerprint) {
			var DuplicateID = app.lookup("SimilarUserCandidate").getValue("ID");
			//console.log(DuplicateID);
			errMsg = "ID: " + DuplicateID + " " +dataManager.getString(errStr);
		} else {
			if( errStr.length > 0 ){
				errMsg = dataManager.getString(errStr);
			} else {
				errMsg = dataManager.getString(errMsg);
			}
		}
		
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);		
	}
	
	comLib.hideLoadMask();
}

// 사용자 정보 추가 에러
function onSmsUserInfoAddSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);	
}

// 사용자 정보 추가 타임아웃 
function onSmsUserInfoAddSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

// 카드 추가 버튼 클릭
function onUSINT_ipbCardAddClick(/* cpr.events.CMouseEvent */ e){
	var RegisterableCardCount = dataManager.getClientOption().getValue("RfRegMax");
	var dsCardInfo = app.lookup("UserCardInfo");
	var RegistedCardCount = dsCardInfo.getRowCount();
	if (RegisterableCardCount <= RegistedCardCount) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorMaxCardRegistConunt"));
		return
	}
	
	var brandType = dataManager.getSystemBrandType();
	var maxCardCount = 5;
	if( brandType == BRAND_NITGEN){
		maxCardCount = 1;
	}
	var count = dsCardInfo.getRowCount();
	if( count >= maxCardCount){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_CardCountMaxExceeded"));
		return;		
	}
	
	dsCardInfo.addRow();
	dsCardInfo.commit();
}

//카드 삭제 버튼 클릭
function onUSINT_ipbCardRemoveClick(/* cpr.events.CMouseEvent */ e){
	
	var grdCardList = app.lookup("USINT_grdCardList");
	var chkIndices = grdCardList.getCheckRowIndices();
	if(chkIndices.length == 0){		
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedItem"));
		return;
	}
	var cardInfo = app.lookup("JwdUserInfo");
	var cardNum = cardInfo.getValue("CardNum");
		
	var dsCardInfo = app.lookup("UserCardInfo");
	chkIndices.forEach(function(rowIndex){
		var tmp = dsCardInfo.getRow(rowIndex);
		if (cardNum == tmp.getValue("CardNum")) {
			cardInfo.setValue("CardNum", "");
		}
		dsCardInfo.deleteRow(rowIndex);
		
	});	
	dsCardInfo.commit();
}

// 카드 편집 버튼 클릭.
function onUSINT_btnCardModifyClick(/* cpr.events.CMouseEvent */ e){
	var userInfo = app.lookup("UserInfo");
	
	var appld = "app/main/users/userCardRegist" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {width : 640, height : 490}, function(dialog){		
		
		var dsUserCardInfo = app.lookup("UserCardInfo");
		dialog.bind("headerTitle").toLanguage("Str_CardRegist");
		dialog.initValue = {
			"UserID":userInfo.getValue("ID"),"UserCardInfo":dsUserCardInfo,"Mode":"Regist","Url":"/v1"};
		dialog.resizable = false;		
		dialog.modal = true;		
	}).then(function(returnValue){ // 지문 등록 화면에서 적용을 누른 경우에만 이 부분으로 들어옴.		
		
		var dsUserCardInfo = app.lookup("UserCardInfo");
		dsUserCardInfo.clear();
						
		for (var i = 0 ; i < returnValue.length ; i++) {
			dsUserCardInfo.addRowData(returnValue[i]);
		}	
		var cardnum = app.lookup("JwdUserInfo");
		cardnum.setValue("CardNum", returnValue[returnValue.length-1]["CardNum"]);	
	});
}

// 도움말 클릭
function onUSINB_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

function Checkloginpassword() {
	var NewloginPwd = app.lookup("US_INT_ipbLoginPW").value;
	var UserInfo = app.lookup("UserInfo");
	if (NewloginPwd.toString().length <= 0 || UserInfo.getValue("LoginPW") == "****") { 
		return true; // 비밀번호가 없는데 체크할 필요가 없다.
	}
	if (NewloginPwd.toString().length < 4 && UserInfo.getValue("LoginPW") != "****") {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorUserLoginPasswordLength")); 
		return false; // 비밀번호는 4자리 이상.
	}
	
	var checkResult;
	var option = dataManager.getClientOption();
	var DuplicateCharflag = option.getValue("PwNotAllowDuplicateChar"); // 연속문자 사용 불가.
	//console.log(DuplicateCharflag);
	if (DuplicateCharflag == 1) {
		checkResult = StrLib.checkConsecutiveDuplicateChar(NewloginPwd);
		if (checkResult == true) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordConsecutiveDuplicate") + " "+ dataManager.getString("Str_WarningPasswordOption"));
			return false; // 동일 문자 있다.
		} 
	}
	var SameIDflag = option.getValue("PwNotAllowSameID"); //ID 동일 비밀번호 사용 불가.
	//console.log(SameIDflag);
	if (SameIDflag == 1) {
		if (NewloginPwd == UserInfo.getValue("ID")) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordSameID") + " "+ dataManager.getString("Str_WarningPasswordOption"));
			return false;
		}
	}
	var RequiredUpperflag = option.getValue("PwRequiredUpper"); // 영문 대문자 필수
	//console.log(RequiredUpperflag);
	if (RequiredUpperflag == 1) {
		checkResult = StrLib.checkUpper(NewloginPwd);
		if (checkResult == false) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordRequiredUpper") + " "+ dataManager.getString("Str_WarningPasswordOption"));
			return false; // 동일 문자 있다.
		}
	}
	var PwRequiredLower = option.getValue("PwRequiredLower"); // 영문소문자 필수
	//console.log(PwRequiredLower);
	if (PwRequiredLower == 1) {
		checkResult = StrLib.checkLower(NewloginPwd);
		if (checkResult == false) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordRequiredLower") + " "+ dataManager.getString("Str_WarningPasswordOption"));
			return false; // 동일 문자 있다.
		}
	}
	var PwRequiredNum = option.getValue("PwRequiredNum"); // 숫자 필수
	//console.log(PwRequiredNum);
	if (PwRequiredNum == 1) {
		checkResult = StrLib.checkNumber(NewloginPwd);
		if (checkResult == false) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordRequiredNum") + " "+ dataManager.getString("Str_WarningPasswordOption"));
			return false; // 동일 문자 있다.
		}
	}
	var PwRequiredSymbol = option.getValue("PwRequiredSymbol"); //특수 문자 필수
	//console.log(PwRequiredSymbol);
	if (PwRequiredSymbol == 1) {
		checkResult = StrLib.checkChar(NewloginPwd);
		if (checkResult == false) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordRequiredSymbol") + " "+ dataManager.getString("Str_WarningPasswordOption"));
			return false; // 동일 문자 있다.
		}
	}
	return true
}

function onUSINB_cmbPrivilegeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var uSINB_cmbPrivilege = e.control;
	PrivilegeSelectionChange(uSINB_cmbPrivilege.value);
}

function PrivilegeSelectionChange(privilegeValue) {
	app.lookup("US_INT_ipbLoginPW").visible = false;
	app.lookup("US_INT_nbbAllowSignIn").visible = false;
	app.lookup("US_INT_ipbAdminGroup").enabled = false; //관리부대
	app.lookup("US_INT_ipbIssueNumber").enabled = false;//발급번호
	app.lookup("US_INT_ipbIdentifiNum").enabled = false;//신원조사 연번
	app.lookup("US_INT_dtiBackgroundCheckDate").enabled = false;// 신원조사회보일
	
	app.lookup("US_INT_grdFamilyList").enabled = true; // 가족
	app.lookup("US_INT_btnFamilySelect").enabled = true; // 가족
	
	app.lookup("US_INT_grdCarList").enabled = true; // 차량
	app.lookup("US_INT_btnCarAdd").enabled = true; // 차량
	app.lookup("US_INT_btnCarDel").enabled = true; // 차량
	app.lookup("US_INT_ipbPhone").enabled = false; // 근무지 번호
	app.lookup("JUS_ipbMobile").enabled = true;
	//관리자/ 사용자/ 파워유저 = 현역
	if (privilegeValue == 1) { //관리자 현역
		app.lookup("US_INT_ipbLoginPW").visible = true;
		app.lookup("US_INT_nbbAllowSignIn").visible = true;
		app.lookup("US_INT_ipbAdminGroup").value = ""; //관리부대
		app.lookup("US_INT_ipbIssueNumber").value = "";//발급번호
		app.lookup("US_INT_ipbIdentifiNum").value = "";//신원조사 연번
		app.lookup("US_INT_dtiBackgroundCheckDate").visible = "";// 신원조사회보일
		app.lookup("US_INT_ipbPhone").enabled = true; // 근무지 번호
	} else if (privilegeValue == 2) { // 현역
		app.lookup("US_INT_ipbAdminGroup").value = ""; //관리부대
		app.lookup("US_INT_ipbIssueNumber").value = "";//발급번호
		app.lookup("US_INT_ipbIdentifiNum").value = "";//신원조사 연번
		app.lookup("US_INT_dtiBackgroundCheckDate").visible = "";// 신원조사회보일
		app.lookup("US_INT_ipbPhone").enabled = true; // 근무지 번호
	} else if (privilegeValue >= 1000 ) { // 현역
		app.lookup("US_INT_ipbLoginPW").visible = true;
		app.lookup("US_INT_nbbAllowSignIn").visible = true;
		app.lookup("US_INT_ipbAdminGroup").value = ""; //관리부대
		app.lookup("US_INT_ipbIssueNumber").value = "";//발급번호
		app.lookup("US_INT_ipbIdentifiNum").value = "";//신원조사 연번
		app.lookup("US_INT_dtiBackgroundCheckDate").visible = "";// 신원조사회보일
		app.lookup("US_INT_ipbPhone").enabled = true; // 근무지 번호
	} else if (privilegeValue == Jwd_Other_Unit ) { // 타부대원 
		app.lookup("US_INT_ipbAdminGroup").value = ""; //관리부대
		app.lookup("US_INT_ipbIssueNumber").value = "";//발급번호
		app.lookup("US_INT_ipbIdentifiNum").value = "";//신원조사 연번
		app.lookup("US_INT_dtiBackgroundCheckDate").visible = "";// 신원조사회보일
		/*app.lookup("US_INT_grdFamilyList").enabled = false;
		app.lookup("US_INT_btnFamilySelect").enabled = false; // 가족
		app.lookup("US_INT_grdCarList").enabled = false; // 차량
		app.lookup("US_INT_btnCarAdd").enabled = false; // 차량
		app.lookup("US_INT_btnCarDel").enabled = false; // 차량
		*/
		app.lookup("US_INT_ipbPhone").enabled = true; // 근무지 번호
	} else if (privilegeValue == Jwd_Foreign ) { // 외래인 // (군번필수)
		app.lookup("US_INT_ipbAdminGroup").value = ""; //관리부대
		app.lookup("US_INT_ipbIssueNumber").value = "";//발급번호
		app.lookup("US_INT_ipbIdentifiNum").value = "";//신원조사 연번
		app.lookup("US_INT_dtiBackgroundCheckDate").visible = "";// 신원조사회보일
		app.lookup("US_INT_cmbPosition").value = 0; // 직급 초기화
		app.lookup("US_INT_grdFamilyList").enabled = false;
		app.lookup("US_INT_btnFamilySelect").enabled = false; // 가족
	} else if (privilegeValue == Jwd_Resident ) { // 상주
		app.lookup("US_INT_ipbAdminGroup").enabled = true; //관리부대
		app.lookup("US_INT_ipbIssueNumber").enabled = true;//발급번호
		app.lookup("US_INT_ipbIdentifiNum").enabled = true;//신원조사 연번
		app.lookup("US_INT_dtiBackgroundCheckDate").enabled = true;// 신원조사회보일
		app.lookup("US_INT_grdFamilyList").enabled = false;
		app.lookup("US_INT_btnFamilySelect").enabled = false; // 가족
	} else if (privilegeValue == Jwd_Always ) { // 상시
		app.lookup("US_INT_ipbAdminGroup").enabled = true; //관리부대
		app.lookup("US_INT_ipbIssueNumber").enabled = true;//발급번호
		app.lookup("US_INT_ipbIdentifiNum").value = "";//신원조사 연번
		app.lookup("US_INT_dtiBackgroundCheckDate").value = "";// 신원조사회보일
		app.lookup("US_INT_grdFamilyList").enabled = false;
		app.lookup("US_INT_btnFamilySelect").enabled = false; // 가족
	} else if (privilegeValue == Jwd_Soldier) { // 병사
		app.lookup("US_INT_ipbAdminGroup").value = ""; //관리부대
		app.lookup("US_INT_ipbIssueNumber").enabled = true;//발급번호
		app.lookup("US_INT_ipbIdentifiNum").value = "";//신원조사 연번
		app.lookup("US_INT_dtiBackgroundCheckDate").visible = "";// 신원조사회보일
		app.lookup("US_INT_grdFamilyList").enabled = false;
		app.lookup("US_INT_btnFamilySelect").enabled = false; // 가족
		app.lookup("US_INT_grdCarList").enabled = false; // 차량
		app.lookup("US_INT_btnCarAdd").enabled = false; // 차량
		app.lookup("US_INT_btnCarDel").enabled = false; // 차량
		app.lookup("JUS_ipbMobile").enabled = false;
	} else if (privilegeValue == Jwd_Soldier) { // 가족
		app.lookup("US_INT_ipbAdminGroup").value = ""; //관리부대
		app.lookup("US_INT_ipbIssueNumber").value = "";//발급번호
		app.lookup("US_INT_ipbIdentifiNum").value = "";//신원조사 연번
		app.lookup("US_INT_dtiBackgroundCheckDate").visible = "";// 신원조사회보일
		app.lookup("USINT_cmbGroup").value = 0; // 그룹 초기화
		app.lookup("US_INT_cmbPosition").value = 0; // 직급 초기화
	}
}

/*
 * 그리드에서 update 이벤트 발생 시 호출.
 * Grid의 행 데이터가 수정되었을 때 이벤트.
 */
function onUSINT_grdCardListUpdate(/* cpr.events.CGridEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var grdCardList = e.control;
	var rowIndex = e.rowIndex;
	var rowList = grdCardList.findAllRow("CardNum == '"+e.newValue+"'")
	rowList.forEach(function(each){
		if( rowIndex != each.getIndex()){
			dialogAlert(app,dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorSmimilarCard"));
			grdCardList.deleteRow(rowIndex);
			grdCardList.commitData();
			return;			
		}
	});
	var cardnum = app.lookup("JwdUserInfo");
	cardnum.setValue("CardNum", e.newValue);
}

/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onUSINB_ipbUserNameKeyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var iptID = e.control;
	app.lookup("USINB_ipbUserName").value = iptID.displayText;
	if(iptID.displayText){
		inputValidManager.validate(app.lookup("USINB_ipbUserName"), "isValid", "", "");
	}else{
		inputValidManager.validate(app.lookup("USINB_ipbUserName"), "isNull", dataManager.getString("Str_RequiredAlert"), "");	
	}
}



/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onUSINB_ipbUniqueIDKeyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var uSINB_ipbUniqueID = e.control;
	app.lookup("USINB_ipbUniqueID").value = uSINB_ipbUniqueID.displayText;
	if(uSINB_ipbUniqueID.displayText){
		inputValidManager.validate(app.lookup("USINB_ipbUniqueID"), "isValid", "");
	}else{
		inputValidManager.validate(app.lookup("USINB_ipbUniqueID"), "isNull", dataManager.getString("Str_RequiredAlert"));	
	}
	
}


/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */

function onUSINT_ipbPasswordKeyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var uSINT_ipbPassword = e.control;
	app.lookup("USINT_ipbPassword").value = uSINT_ipbPassword.displayText;
	if(uSINT_ipbPassword.displayText){
		inputValidManager.validate(app.lookup("USINT_ipbPassword"), "isValid", "");
	}else{
		inputValidManager.validate(app.lookup("USINT_ipbPassword"), "isNull", dataManager.getString("Str_RequiredAlert"));	
	}
	
}


/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onUSINB_ipbUserIDKeyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var uSINB_ipbUserID = e.control;
	app.lookup("USINB_ipbUserID").value = uSINB_ipbUserID.displayText;	 
	if(uSINB_ipbUserID.displayText){
		inputValidManager.validate(app.lookup("USINB_ipbUserID"), "isValid", "");
	}else{
		inputValidManager.validate(app.lookup("USINB_ipbUserID"), "isNull", dataManager.getString("Str_RequiredAlert"));	
	}
	
}

function sendJwdUserInfoUpdate() {
	var userInfo = app.lookup("UserInfo");
	var jwdUserInfo = app.lookup("JwdUserInfo");
	var dsCarInfo = app.lookup("dsCarInfo");
	var birthday = app.lookup("US_INT_dtiBirthday").value;
	var backgroundDate = app.lookup("US_INT_dtiBackgroundCheckDate").value;
	
	if(birthday.length <= 10) { //YYYY-MM-DD 
		birthday = birthday + " 00:00:00.000";
	}
	console.log("backgroundDate : " + backgroundDate);
	if(backgroundDate != null && backgroundDate.length <= 10) { //YYYY-MM-DD // 권한에따라 미입력
		backgroundDate = backgroundDate + " 00:00:00.000";
	}
	
	jwdUserInfo.setValue("ID", userInfo.getValue("ID"));
	jwdUserInfo.setValue("Birthday", ""); //생일 초기화
	jwdUserInfo.setValue("Privilege", userInfo.getValue("Privilege"));
	jwdUserInfo.setValue("Mobile", app.lookup("JUS_ipbMobile").value);
	jwdUserInfo.setValue("AdminGroup", ""); //관리부대
	jwdUserInfo.setValue("IssueNumber", "");//발급번호
	jwdUserInfo.setValue("IdentifyNum", "");//신원조사 연번
	jwdUserInfo.setValue("BackgroundcheckDate", ""); // 신원조사 회보일
	//jwdUserInfo.setValue("CardNum", ""); //마지막등록된 카드 번호
	var privilegeID =userInfo.getValue("Privilege");
	jwdUserInfo.setValue("Birthday", birthday); //생일
	
	/* 
	if (privilegeID == 1) { //관리자
	} else if (privilegeID == 2 ) { // 현역(사용자)
	} else if (privilegeID >= 1000) { // 파워 유저
	} else if (privilegeID == Jwd_Other_Unit) { // 타부대원
		//dsCarInfo.clear(); // 타부대원 차량 없음
	} else if (privilegeID == Jwd_Foreign) { // 외래인
	} else  
	*/
	if (privilegeID == Jwd_Resident) { // 상주
		jwdUserInfo.setValue("AdminGroup", app.lookup("US_INT_ipbAdminGroup").value);
		jwdUserInfo.setValue("IssueNumber", app.lookup("US_INT_ipbIssueNumber").value);
		jwdUserInfo.setValue("IdentifyNum", app.lookup("US_INT_ipbIdentifiNum").value);
		jwdUserInfo.setValue("BackgroundcheckDate", backgroundDate);
	} else if (privilegeID == Jwd_Always) { //상시
		jwdUserInfo.setValue("AdminGroup", app.lookup("US_INT_ipbAdminGroup").value);
		jwdUserInfo.setValue("IssueNumber", app.lookup("US_INT_ipbIssueNumber").value);
	} else if (privilegeID == Jwd_Soldier) { //병사
		jwdUserInfo.setValue("IssueNumber", app.lookup("US_INT_ipbIssueNumber").value);
	}
	/*
	else if (privilegeID == Jwd_Family) {
		
	}
	*/
	// 가족세팅
	MakeFamilyList(privilegeID, userInfo.getValue("ID")); // 가족
			
	stringSmsResult ="Str_UserUpdate";
	var requestData = app.lookup("sms_JwdUserInfoUpdate");
	requestData.action = "/v1/jawoondae/users/" + app.lookup("UserInfo").getValue("ID");		
	requestData.send();	
}		
		
function onSms_JwdUserInfoUpdateSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var userInfo = app.lookup("UserInfo");
		var jwdUserInfo = app.lookup("JwdUserInfo");
		jwdUserInfo.setValue("CardNum", "");
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString(stringSmsResult));
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(stringSmsResult));	
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_UserUpdate";
	
		if( errStr.length > 0 ){
			errMsg = dataManager.getString(errStr);
		} else {
			errMsg = dataManager.getString(errMsg);
		}
		
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);		
		comLib.hideLoadMask();	
	}
	stringSmsResult = "";
	comLib.hideLoadMask();	
}

function onSms_JwdUserInfoUpdateSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_JwdUserInfoUpdateSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * "가족 선택" 버튼(US_INT_btnFamilySelect)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUS_INT_btnFamilySelectClick(/* cpr.events.CMouseEvent */ e){

	var dsGroupList = dataManager.getGroup(); 
	var privilegeID = app.lookup("USINB_cmbPrivilege").value;
	var Version = dataManager.getSystemVersion();
	var appld = "app/main/jawoondae/users/UserSelect" + "?" + Version;

	app.getRootAppInstance().openDialog(appld, {width : 900, height : 500}, function(dialog){
		dialog.initValue = {"GroupList":dsGroupList,"ExcludeGroup":-1, "privilegeID": privilegeID};
		dialog.modal = true;
		dialog.headerTitle = "가족 선택";		
	}).then(function(/*cpr.data.DataSet*/idMap){
		
		var familyIDList = app.lookup("FamilyList");
		familyIDList.clear();
		console.log(idMap);
		
		idMap.forEach(function(value,key){		
			familyIDList.addRowData({"FamilyID":key, "FamilyName": value});				
		});		
		app.lookup("US_INT_grdFamilyList").redraw();
	});	
}

function onUS_INT_btnCarAddClick(/* cpr.events.CMouseEvent */ e){	
	var carInfo = app.lookup("dsCarInfo");
	carInfo.addRow();
	carInfo.commit();
}

function onUS_INT_btnCarDelClick(/* cpr.events.CMouseEvent */ e){
	var grdCarList = app.lookup("US_INT_grdCarList");
	var rowIndex = grdCarList.getSelectedRowIndex();
	if(rowIndex < 0){		
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedItem"));
		return;
	}
	
	var dsCarInfo = app.lookup("dsCarInfo");
	
	dsCarInfo.deleteRow(rowIndex);	
	dsCarInfo.commit();
	
}

function MakeFamilyList(privilegeid, userid) {
	var setFamilyList = app.lookup("SetFamilyList");
	setFamilyList.clear();
	var familyList = app.lookup("FamilyList");
	var rowCnt = familyList.getRowCount();
	if (privilegeid == 2 || privilegeid == 1 || privilegeid >= 1000) { //현역
		if (rowCnt > 0) {
			for (var i = 0 ; i < rowCnt ; i++ ) {
				var row = familyList.getRow(i);
				var getID = row.getValue("FamilyID");
				var req = {"FamilyID":getID, "OnDutyID": userid};
				setFamilyList.addRowData(req);
			}
		}
	} else if (privilegeid == Jwd_Family) { //가족
		if (rowCnt > 0) {
			for (var i = 0 ; i < rowCnt ; i++ ) {
				var row = familyList.getRow(i);
				var getID = row.getValue("FamilyID");
				var req = {"FamilyID":userid, "OnDutyID":getID};
				setFamilyList.addRowData(req);
			}
		}
	}
}

/*
 * "가족 제외" 버튼(US_INT_btnFamilyDelete)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUS_INT_btnFamilyDeleteClick(/* cpr.events.CMouseEvent */ e){
	
	var grdFamilyList = app.lookup("US_INT_grdFamilyList");
	var selectedIndex = grdFamilyList.getSelectedRowIndex()
	console.log(selectedIndex);
	if(selectedIndex == -1){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedItem"));
		return;
	}
	
	var dsFamilyList = app.lookup("FamilyList");
	dsFamilyList.deleteRow(selectedIndex)
		
	dsFamilyList.commit();
}

	





/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsUserPhotoDeleteSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUserPhotoDelete = e.control;
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	comLib.hideLoadMask();
	if( resultCode == COMERROR_NONE ){
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_UserPhotoDelete"));		
	} else {		
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_UserPhotoDelete"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}		
	
	var userImage = app.lookup("USINB_imgUserPicture");
	//if( userInfo.getValue("Picture")){
	//	userImage.putValue('data:image/png;base64,'+userInfo.getValue("Picture"));
	//}
	
	userImage.src = "../../../../theme/images/common/common_black_img_180.png";
	
	
}




/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSmsUserPhotoDeleteSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUserPhotoDelete = e.control;
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsUserPhotoDeleteSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUserPhotoDelete = e.control;
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR)
}
