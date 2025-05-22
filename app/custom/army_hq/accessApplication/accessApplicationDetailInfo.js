/************************************************
 * accessApplicationManagement.js
 * Created at 2020. 12. 7. 오후 3:38:54.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var dateLib = cpr.core.Module.require("lib/DateLib");
var utilLib = cpr.core.Module.require("lib/util");


// 탭 인덱스
var AMAAP_tabIndex = 1; 			// 현재 탭 인덱스
var ApplicationTypeDuty = 1; 		// 현역/군무원
var ApplicationTypeSoldier = 2; 	// 병사
var ApplicationTypeFamily = 3; 		// 군가족
var ApplicationTypeResident = 4;	// 상주민간인
var ApplicationTypeRegular = 5; 	// 고정출입자
var amaap_applicationIndex;
var ApprovalState;
var userID;
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	
	var initValue = app.getHost().initValue;
	amaap_applicationIndex = initValue["ApplicationIndex"];
	var userType = initValue["userType"];
	userID = initValue["userID"];
	ApprovalState = initValue["ApprovalState"];
	//console.log(ApprovalState);
	// 군가족
	var cmbUserPosition = app.lookup("AMAAP_cmbUserPosition3");
	cmbUserPosition.setItemSet(dataManager.getPositionList(), {
		label: "Name",
		value: "PositionID"		
	});
	cmbUserPosition.addItem(new cpr.controls.Item("------", 0));
	cmbUserPosition.selectItemByValue(0);
	
	for( var i = 1; i <6; i++){		
		var cmbUserGroup = app.lookup("AMAAP_cmbUserGroup"+i);
		cmbUserGroup.setItemSet(dataManager.getGroup(), {
			label: "Name",
			value: "GroupID"		
		});
		cmbUserGroup.addItem(new cpr.controls.Item("------", 0));
		cmbUserGroup.selectItemByValue(0);
	}
	
	var today = dateLib.getToday("-");
	var accessGroup = dataManager.getAccessGroup();
	var accessGroupCnt = accessGroup.getRowCount();
	for( var i = 1; i <6; i++){
		var cmbUserAccessGroup = app.lookup("AMAAP_cmbUserAccessGroup"+i);	
		cmbUserAccessGroup.addItem(new cpr.controls.Item("------", 0));
		for (var j=0; j < accessGroupCnt; j++) {
			cmbUserAccessGroup.addItem(new cpr.controls.Item(accessGroup.getRow(j).getValue("Name"), accessGroup.getRow(j).getValue("ID")));
		}
		cmbUserAccessGroup.selectItemByValue(0);
				
		app.lookup("AMAAP_dtiAccessStart"+i).value = today;
		if( i == 1 ){ // 현역/군무원/공무직은 촐입종료일 필수가 아니므로 2999.12.31로 초기값 입력
			app.lookup("AMAAP_dtiAccessEnd"+i).value = "2999-12-31";
		}else{
			app.lookup("AMAAP_dtiAccessEnd"+i).value = today;
		}
		if(!isSuperGroupAdmin()){
			var cmbUserGroup = app.lookup("AMAAP_cmbUserGroup"+i);	
			cmbUserGroup.hideButton = true;
			cmbUserGroup.readOnly = true;		
		}
	}
	
	var tabFolder = app.lookup("AMAAP_tabFolder");
	var userType = initValue["userType"];
	//console.log(userType);
	var tabItems = tabFolder.getTabItems();
	if (userType == 907 || userType == 908 || userType == 900) {// 현역 군무원/공무직
		AMAAP_tabIndex = ApplicationTypeDuty;
		changePostion(app.lookup("AMAAP_cmbUserPosition1"), userType);	
	} else if (userType == 905) { //병사
		AMAAP_tabIndex = ApplicationTypeSoldier;	
		changePostion(app.lookup("AMAAP_cmbUserPosition2"), userType);
	} else if (userType == 906) { //가족
		AMAAP_tabIndex = ApplicationTypeFamily;	
	} else if (userType == 903) { //상주민간인
		AMAAP_tabIndex = ApplicationTypeResident;	
	}else if (userType == 904) { //고정출입자
		AMAAP_tabIndex = ApplicationTypeRegular;	
	}

	tabFolder.setSelectedTabItem(tabItems[AMAAP_tabIndex-1]);
	
	app.lookup("sms_getAccessApprovalSetting").send();
}

/// 공통 함수 ---->

// 탭 변경
function onTabFolderSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/**	 @type cpr.controls.TabFolder	 */
	var tabFolder = e.control;
	var tabItem = tabFolder.getSelectedTabItem();
 	AMAAP_tabIndex = tabItem.id;
 	
}

function validateData(){
	
	if( app.lookup("AMAAP_ipbName"+AMAAP_tabIndex).value == null || app.lookup("AMAAP_ipbName"+AMAAP_tabIndex).value.length < 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_UserNameInvalid"));
		return false;
	}
	
	if( app.lookup("AMAAP_dtiBirthday"+AMAAP_tabIndex).value == null || app.lookup("AMAAP_dtiBirthday"+AMAAP_tabIndex).value.length < 10 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_BirthdayInvalid"));
		return false;
	}
	
	if( AMAAP_tabIndex != ApplicationTypeFamily ){
		if( app.lookup("AMAAP_cmbUserGroup"+AMAAP_tabIndex).value == 0 ){
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_UserGroupInvalid"));
				return false;
		}
	}
	
	if( app.lookup("AMAAP_cmbUserAccessGroup"+AMAAP_tabIndex).value == 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_UserAccessGroupInvalid"));
		return false;
	}
	
	if( app.lookup("AMAAP_dtiAccessStart"+AMAAP_tabIndex).value == null || app.lookup("AMAAP_dtiAccessStart"+AMAAP_tabIndex).value.length < 10 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_UserAccessStartInvalid"));
		return false;
	}
	
	if( app.lookup("AMAAP_dtiAccessEnd"+AMAAP_tabIndex).value == null || app.lookup("AMAAP_dtiAccessEnd"+AMAAP_tabIndex).value.length < 10 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_UserAccessEndInvalid"));
		return false;
	}
			
	var today = dateLib.getToday();
	var startAt =app.lookup("AMAAP_dtiAccessStart"+AMAAP_tabIndex).value;
	startAt = startAt.replace(/-/gi,"");
	var endAt = app.lookup("AMAAP_dtiAccessEnd"+AMAAP_tabIndex).value;
	endAt = endAt.replace(/-/gi,"");
	
	if(dateLib.compareDate( today, startAt ) == 0){	
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_WarnAccessStartBeforeToday"), function(/*cpr.controls.Dialog*/dialog){
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("AMAAP_dtiAccessStart"+AMAAP_tabIndex).focus(true);			
			});
		});		
		return false;
	}
	
	if(dateLib.compareDate( startAt, endAt ) == 0){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_WarnAccessStarOverEnd"), function(/*cpr.controls.Dialog*/dialog){
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("AMAAP_dtiAccessEnd"+AMAAP_tabIndex).focus(true);			
			});
		});
		return false
	}
		
		
	switch(AMAAP_tabIndex){// 사용자 타입별 필수 데이터 체크
		case ApplicationTypeDuty:
			var dutyType = app.lookup("AMAAP_rdbDutyType").value;
			if( dutyType != UserPrivArmyOnDuty && dutyType != UserPrivArmyMilitaryPersonnel && dutyType != UserPrivArmyPublicService){ // 현역이나 군무원이 아닌 경우
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_UserTypeInvalid"));
				return false;
			}
			if( app.lookup("AMAAP_ipbUnitName").value == null || app.lookup("AMAAP_ipbUnitName").value.length < 1 ){
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_UnitNameInvalid"));
				return false;
			}			
			if( app.lookup("AMAAP_cmbUserPosition"+AMAAP_tabIndex).value == 0 ){
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_UserPositionInvalid"));
				return false;
			}
			if( app.lookup("AMAAP_ipbServiceNumber1").value == null || app.lookup("AMAAP_ipbServiceNumber1").value.length < 1 ){
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_ServiceNumberInvalid"));
				return false;
			}	
			if( app.lookup("AMAAP_ipbClasses1").value == null || app.lookup("AMAAP_ipbClasses1").value.length < 1 ){
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_UserClassInvalid"));
				return false;
			}
			if( app.lookup("AMAAP_ipbMobile1").value == null || app.lookup("AMAAP_ipbMobile1").value.length < 1 ){
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_UserMobileInvalid"));
				return false;
			}
			/*
			if( app.lookup("AMAAP_ipbBasisIssuanceCertificate1").value == null || app.lookup("AMAAP_ipbBasisIssuanceCertificate1").value.length < 1 ){
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_BasisIssuanceCertificateInvalid"));
				return false;
			}
			*/
			
			break;	
		case ApplicationTypeSoldier: 
			if( app.lookup("AMAAP_ipbServiceNumber2").value == null || app.lookup("AMAAP_ipbServiceNumber2").value.length < 1 ){
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_ServiceNumberInvalid"));
				return false;
			}	
			
			if( app.lookup("AMAAP_cmbUserPosition"+AMAAP_tabIndex).value == 0 ){
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_UserPositionInvalid"));
				return false;
			}
			
			break;
		case ApplicationTypeFamily: 
			if( app.lookup("AMAAP_cmbFamilyRelation").value == 0 ){
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_FamilyRelationInvalid"));
				return false;
			}
						
			if( app.lookup("AMAAP_opbFamilySoldierID").value == null || app.lookup("AMAAP_opbFamilySoldierID").value.length < 1 ){
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_FamilyRelationIDInvalid"));
				return false;
			}
			if( app.lookup("AMAAP_opbFamilySoldierName").value == null || app.lookup("AMAAP_opbFamilySoldierName").value.length < 1 ){
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_FamilyRelationIDInvalid"));
				return false;
			}
		/*	if( app.lookup("AMAAP_imgUserPicture3").src == null || app.lookup("AMAAP_imgUserPicture3").src == "" ){
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_FileInputInvalid"));
				return false;
			} */
			break;
		case ApplicationTypeResident: 
			if( app.lookup("AMAAP_ipbClasses"+AMAAP_tabIndex).value == null || app.lookup("AMAAP_ipbClasses"+AMAAP_tabIndex).value.length < 1 ){
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_UserClassInvalid"));
				return false;
			}
			/* 상주민간인 신원조회 연번 필수항목 제거(육본요청)
			if( app.lookup("AMAAP_ipbBgCheckNumber"+AMAAP_tabIndex).value == null || app.lookup("AMAAP_ipbBgCheckNumber"+AMAAP_tabIndex).value.length < 1 ){
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_BackgroundCheckNumberInvalid"));
				return false;
			}
			**/		
			break;
		case ApplicationTypeRegular: 
			if( app.lookup("AMAAP_ipbClasses"+AMAAP_tabIndex).value == null || app.lookup("AMAAP_ipbClasses"+AMAAP_tabIndex).value.length < 1 ){
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_UserClassInvalid"));
				return false;
			}
			/* 고정출입자 신원조회 연번 필수항목 제거(육본요청)
			if( app.lookup("AMAAP_ipbBgCheckNumber"+AMAAP_tabIndex).value == null || app.lookup("AMAAP_ipbBgCheckNumber"+AMAAP_tabIndex).value.length < 1 ){
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_BackgroundCheckNumberInvalid"));
				return false;
			}
			**/			
			break;		
	}
	
	return true;
}

function getControlValue( controlName ){
	var control = app.lookup(controlName);
	if( control == null ){
		return "";
	}
	var value = control.value;
	if ( value == null ){
		return "";
	}
	return value;
}

// 전송 버튼 클릭
function onBtnRequestClick(/* cpr.events.CMouseEvent */ e){
	
	if(validateData()==false){
		return;
	}
	
	var accessApplicationInfo = app.lookup("AccessApprovalDetailInfo");	
	accessApplicationInfo.clear();
	//// 공통 데이터 매핑 ----------------------------------------
	// 출입신청 정보 매핑
	
	accessApplicationInfo.setValue("Name", app.lookup("AMAAP_ipbName"+AMAAP_tabIndex).value);
	accessApplicationInfo.setValue("Birthday", app.lookup("AMAAP_dtiBirthday"+AMAAP_tabIndex).value);
	
	// 차량정보 매핑	
	if( AMAAP_tabIndex != ApplicationTypeSoldier ){
		accessApplicationInfo.setValue("Mobile", app.lookup("AMAAP_ipbMobile"+AMAAP_tabIndex).value);
		accessApplicationInfo.setValue("Phone", getControlValue("AMAAP_ipbPhone"+AMAAP_tabIndex));
			
		accessApplicationInfo.setValue("Gender", app.lookup("AMAAP_rdbGender"+AMAAP_tabIndex).value);
		
		accessApplicationInfo.setValue("CarNumber", getControlValue("AMAAP_ipbCarNumber"+AMAAP_tabIndex));
		accessApplicationInfo.setValue("CarType", getControlValue("AMAAP_ipbCarType"+AMAAP_tabIndex));
		accessApplicationInfo.setValue("CarBlackbox", getControlValue("AMAAP_rdbCarBlackbox"+AMAAP_tabIndex));
		accessApplicationInfo.setValue("CarColor", getControlValue("AMAAP_ipbCarColor"+AMAAP_tabIndex));
		accessApplicationInfo.setValue("CarAccessDay", getControlValue("AMAAP_cmbCarAccessDay"+AMAAP_tabIndex));
	}
	
	if( AMAAP_tabIndex != ApplicationTypeFamily ){
		accessApplicationInfo.setValue("GroupCode", app.lookup("AMAAP_cmbUserGroup"+AMAAP_tabIndex).value);
	}
	
	//출입권한 매핑			
	accessApplicationInfo.setValue("AccessGroup", app.lookup("AMAAP_cmbUserAccessGroup"+AMAAP_tabIndex).value);
	accessApplicationInfo.setValue("AccessStart", app.lookup("AMAAP_dtiAccessStart"+AMAAP_tabIndex).value);
	accessApplicationInfo.setValue("AccessEnd", app.lookup("AMAAP_dtiAccessEnd"+AMAAP_tabIndex).value);

	// 사진 정보
	var userPicture = app.lookup("AMAAP_imgUserPicture"+AMAAP_tabIndex);
	if (userPicture.src != null && userPicture.src != "") {
		var imageData = userPicture.src.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
		accessApplicationInfo.setValue("UserPicture", imageData);	
	}
	
	//// 사용자 타입별 데이터 매핑 ----------------------------------------
	switch(AMAAP_tabIndex){// 사용자 타입별 데이터 입력		
		case ApplicationTypeDuty:
			accessApplicationInfo.setValue("UserType", app.lookup("AMAAP_rdbDutyType").value);			
			accessApplicationInfo.setValue("UserClass", app.lookup("AMAAP_ipbClasses"+AMAAP_tabIndex).value);
			accessApplicationInfo.setValue("UnitName", app.lookup("AMAAP_ipbUnitName").value);
			accessApplicationInfo.setValue("ServiceNumber", app.lookup("AMAAP_ipbServiceNumber1").value);
			accessApplicationInfo.setValue("Position", app.lookup("AMAAP_cmbUserPosition"+AMAAP_tabIndex).value);
			accessApplicationInfo.setValue("BasisIssuanceCertificate", app.lookup("AMAAP_ipbBasisIssuanceCertificate1").value);
			
		
		break;
		case ApplicationTypeSoldier:
			accessApplicationInfo.setValue("UserType", UserPrivArmySoldier);
			accessApplicationInfo.setValue("UserClass", app.lookup("AMAAP_ipbClasses"+AMAAP_tabIndex).value);
			accessApplicationInfo.setValue("ServiceNumber", app.lookup("AMAAP_ipbServiceNumber2").value);
			accessApplicationInfo.setValue("Position", app.lookup("AMAAP_cmbUserPosition"+AMAAP_tabIndex).value);
			accessApplicationInfo.setValue("BasisIssuanceCertificate", app.lookup("AMAAP_ipbBasisIssuanceCertificate2").value);
			
			accessApplicationInfo.setValue("MoveInDate", app.lookup("AMAAP_dtiMoveInDate").value);
			accessApplicationInfo.setValue("EnlistmentDate", app.lookup("AMAAP_dtiEnlistmentDate").value);
			accessApplicationInfo.setValue("DischargeDate", app.lookup("AMAAP_dtiDischargeDate").value);			

			break;			
			
		case ApplicationTypeFamily: 
			accessApplicationInfo.setValue("UserType", UserPrivArmyFamily);
			accessApplicationInfo.setValue("FamilyRelation", app.lookup("AMAAP_cmbFamilyRelation").value);
			accessApplicationInfo.setValue("RelationUserID", app.lookup("AMAAP_opbFamilySoldierID").value);
			accessApplicationInfo.setValue("FamilyName", app.lookup("AMAAP_opbFamilySoldierName").value);
			accessApplicationInfo.setValue("Address", app.lookup("AMAAP_ipbAddress"+AMAAP_tabIndex).value);
			
			var position = dataManager.getPositionName(app.lookup("AMAAP_cmbUserPosition3").value)
			accessApplicationInfo.setValue("VisitTargetPosition", position);
			var group = dataManager.getGroupName(app.lookup("AMAAP_cmbUserGroup3").value)
			accessApplicationInfo.setValue("VisitTargetGroup", group);
			
			break;
			
		case ApplicationTypeResident: 
			accessApplicationInfo.setValue("UserType", UserPrivArmyResident);
			accessApplicationInfo.setValue("UserClass", app.lookup("AMAAP_ipbClasses"+AMAAP_tabIndex).value);
			accessApplicationInfo.setValue("IdentificationNumber", app.lookup("AMAAP_ipbBgCheckNumber"+AMAAP_tabIndex).value);
			accessApplicationInfo.setValue("Address", app.lookup("AMAAP_ipbAddress"+AMAAP_tabIndex).value);
			break;
		case ApplicationTypeRegular:
			accessApplicationInfo.setValue("UserType", UserPrivArmyRegular); 
			accessApplicationInfo.setValue("UserClass", app.lookup("AMAAP_ipbClasses"+AMAAP_tabIndex).value);
			accessApplicationInfo.setValue("IdentificationNumber", app.lookup("AMAAP_ipbBgCheckNumber"+AMAAP_tabIndex).value);
			accessApplicationInfo.setValue("Address", app.lookup("AMAAP_ipbAddress"+AMAAP_tabIndex).value);
			break;
	}
	
	//console.log(accessApplicationInfo.getDatas());	
	if (AMAAP_tabIndex != ApplicationTypeDuty) {
		var accessApprovalPair = app.lookup("AccessApprovalPair");
		accessApprovalPair.clear();
		accessApprovalPair.setValue("Predecessor", app.lookup("AMAAP_rdbPredecessor"+AMAAP_tabIndex).value);
		accessApprovalPair.setValue("OnestApprovalUserID", app.lookup("AMAAP_opb1stApprovalID"+AMAAP_tabIndex).value);
		accessApprovalPair.setValue("OnestApprovalName", app.lookup("AMAAP_ipb1stApprovalName"+AMAAP_tabIndex).value);
		accessApprovalPair.setValue("OnestApprovalGroup", app.lookup("AMAAP_ipb1stApprovalGroup"+AMAAP_tabIndex).value);
		accessApprovalPair.setValue("TwostApprovalUserID", app.lookup("AMAAP_opb2stApprovalID"+AMAAP_tabIndex).value);
		accessApprovalPair.setValue("TwostApprovalName", app.lookup("AMAAP_ipb2stApprovalName"+AMAAP_tabIndex).value);
		accessApprovalPair.setValue("TwostApprovalGroup", app.lookup("AMAAP_ipb2stApprovalGroup"+AMAAP_tabIndex).value);
	}	
	//차량정보 Check
	var CarNumberCheck = app.lookup("AccessApprovalDetailInfo").getValue("CarNumber");
	var CarNumberCheckCNT = CarNumberCheck.length;
	if (CarNumberCheckCNT == 0 || (CarNumberCheckCNT >= 7 && CarNumberCheckCNT <= 12 )) {
		comLib.showLoadMask("",dataManager.getString("Str_ARMYHQ_AccessApplication"),"",0);
		var smsputAccessApprovalInfo = app.lookup("sms_putAccessApprovalInfo");
		smsputAccessApprovalInfo.action = "/v1/armyhq/accessApproval/DetailInfo/" + amaap_applicationIndex + "/" + userID;
		smsputAccessApprovalInfo.send();

		return;
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "잘못된 자동차 번호입니다.\n예:11가1111 / 서울11가1111");
		return;
	}

}

// 출입신청 완료
function onSms_postAccessApplicationSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	
	if( resultCode == COMERROR_NONE ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_ARMY_AccessApplicationCompleted"));		
	} else {		
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}	
}

// 출입신청 에러
function onSms_postAccessApplicationSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR)
}

// 출입신청 타임아웃
function onSms_postAccessApplicationSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

/*
 * 버튼(AMAAP_btnFindPicture)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAMAAP_btnFindPictureClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aMAAP_btnFindPicture = e.control;
	var pictureFile = app.lookup("AMAAP_ImageFileInput"+AMAAP_tabIndex);
	pictureFile.openFileChooser();
}


/*
 * 파일 인풋에서 value-change 이벤트 발생 시 호출.
 * FileInput의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onAMAAP_ImageFileInputValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.FileInput
	 */
	var aMAAP_ImageFileInput = e.control;
	var pictureFile = app.lookup("AMAAP_ImageFileInput"+AMAAP_tabIndex);

	// 읽기
    var reader = new FileReader();
    //console.log(pictureFile.files [0]);
    reader.readAsDataURL(pictureFile.files [0]);	
    
    reader.onload = function  () {
    	var userPicture = app.lookup("AMAAP_imgUserPicture"+AMAAP_tabIndex);
        resizeImage(userPicture,reader.result,320,420);        
        
    }; 	
}

// 이미지 리사이징 함수
function resizeImage(ctrl,imageData,width,height){

	var tempImage = new Image(); 
    tempImage.src = imageData; 
    //console.log(tempImage.src);
    tempImage.onload = function () {    
    	var canvas = document.createElement('canvas');
    	var canvasContext = canvas.getContext("2d");
    	canvas.width = width; 
    	canvas.height = height;
    	
    	canvasContext.drawImage(this, 0, 0, width, height);
	//	ctrl.src = canvas.toDataURL("image/jpeg");
	//---------------->
		var getEncByteSize = utilLib.getFormatByteSizeString(canvas.toDataURL("image/jpeg").toString().length, 2); // 정확한 파일 용량이 아니다.
		// 인코딩 된 바이트에 대한 파일 사이즈 이다. 실제 데이터보다 크게 표시됨.
		var EncByteSize = getEncByteSize.split(' ');
		if (parseFloat(EncByteSize[0]) > 90) { // 파일 사이즈가 너무 크다고 팝업
			dialogAlertAMHQ(app, dataManager.getString("Str_Waring"), "이미지 파일 사이즈가 너무 큽니다. 다른 사진으로 등록 해주세요");
			ctrl.src = "";		
		} else {
			ctrl.src = canvas.toDataURL("image/jpeg");
		}
	}
}

/*
 * "..." 버튼(AMAAP_btnSelectUnitMember)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAMAAP_btnSelectUnitMemberClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aMAAP_btnSelectUnitMember = e.control;
	
	var appld = "app/main/users/userSelectOne";
	app.getRootAppInstance().openDialog(appld, {width : 750, height : 500}, function(dialog){
		dialog.bind("headerTitle").toLanguage("Str_UserSelect");
		dialog.style.header.css("background-color", "#528443");
		dialog.initValue = {DelColunm: [14,13,12,11,10,9,8,6,4,1],
							Fields:["user_id","name","unique_id","privilege","position_code", "group_code"]};
		dialog.modal = true;
	}).then(function(returnValue){
		if( returnValue != null ){
			var unitMember = app.lookup("UnitMember");
			unitMember.setValue("ID", returnValue["ID"]);
			unitMember.setValue("Name", returnValue["Name"]);
			unitMember.setValue("Position", returnValue["PositionCode"]);
			unitMember.setValue("Group", returnValue["GroupCode"]);
			
			app.lookup("AMAAP_opbFamilySoldierID").value = returnValue["ID"];	
		}
	});	
}

function onAMAAP_rdbDutyTypeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var aMAAP_rdbDutyType = e.control;
	// console.log(aMAAP_rdbDutyType.value);
	changePostion(app.lookup("AMAAP_cmbUserPosition"+AMAAP_tabIndex), Number(aMAAP_rdbDutyType.value));
	console.log(app.lookup("AMAAP_cmbUserPosition"+AMAAP_tabIndex).getItems());
	
}

function changePostion(comboControl, userType) {
	var positionList = dataManager.getPositionList();
	comboControl.deleteAllItems();
	switch (Number(userType)){
	case 900:
		for (var i=0; i < positionList.getRowCount(); i++) {
			var row = positionList.getRow(i);
			if (row.getValue("PositionID") > 1000 && row.getValue("PositionID") < 1100) {
			    comboControl.addItem(new cpr.controls.Item(row.getValue("Name"), row.getValue("PositionID")))	
			}
		}
		break;
	case 907:
	case 908:
		for (var i=0; i < positionList.getRowCount(); i++) {
			var row = positionList.getRow(i);
			if (row.getValue("PositionID") > 1100 && row.getValue("PositionID") < 1200) {
			    comboControl.addItem(new cpr.controls.Item(row.getValue("Name"), row.getValue("PositionID")))	
			}
		}
		break;
	case 905:
		for (var i=0; i < positionList.getRowCount(); i++) {
			var row = positionList.getRow(i);
			if (row.getValue("PositionID") > 1200 && row.getValue("PositionID") < 1300) {
			    comboControl.addItem(new cpr.controls.Item(row.getValue("Name"), row.getValue("PositionID")))	
			}
		}	
		break;
	default:
		for (var i=0; i < positionList.getRowCount(); i++) {
			var row = positionList.getRow(i);
		    comboControl.addItem(new cpr.controls.Item(row.getValue("Name"), row.getValue("PositionID")))	
		}
	}
}


function onAMAAP_btnAcGroupSortClick(/* cpr.events.CMouseEvent */ e){
	var btnSort = app.lookup("AMAAP_btnAcGroupSort" + AMAAP_tabIndex);

	// combobox item 반전
	utilLib.comboboxItemReverse(app.lookup("AMAAP_cmbUserAccessGroup" + AMAAP_tabIndex));
	
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


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getAccessApprovalDetailInfoAmhqSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getAccessApprovalDetailInfoAmhq = e.control;
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode ==COMERROR_NONE) {
		dataManager = getDataManager();
		var resData = app.lookup("AccessApprovalDetailInfo");
		//console.log(app.lookup("AccessApprovalDetailInfo").getDatas());
		//기초데이터 삽입
		app.lookup("AMAAP_ipbName"+AMAAP_tabIndex).value = resData.getValue("Name"); 
		app.lookup("AMAAP_dtiBirthday"+AMAAP_tabIndex).value = resData.getValue("Birthday");
		app.lookup("AMAAP_cmbUserAccessGroup"+AMAAP_tabIndex).value = resData.getValue("AccessGroup");
		app.lookup("AMAAP_dtiAccessStart"+AMAAP_tabIndex).value = resData.getValue("AccessStart");
		app.lookup("AMAAP_dtiAccessEnd"+AMAAP_tabIndex).value = resData.getValue("AccessEnd");
		
		// 사진 정보AMAAP_imgUserPicture4
		var userPicture = app.lookup("AMAAP_imgUserPicture"+AMAAP_tabIndex);
		if(resData.getValue("UserPicture") && resData.getValue("UserPicture").toString().length > 0) {
			userPicture.putValue('data:image/png;base64,'+resData.getValue("UserPicture"));
		}
		
		// 병사를 제외한 매핑	
		if( AMAAP_tabIndex != ApplicationTypeSoldier ){
			app.lookup("AMAAP_ipbMobile"+AMAAP_tabIndex).value = resData.getValue("Mobile");
			app.lookup("AMAAP_ipbPhone"+AMAAP_tabIndex).value = resData.getValue("Phone");
			app.lookup("AMAAP_rdbGender"+AMAAP_tabIndex).value = resData.getValue("Gender");
			app.lookup("AMAAP_ipbCarNumber"+AMAAP_tabIndex).value = resData.getValue("CarNumber");
			app.lookup("AMAAP_ipbCarType"+AMAAP_tabIndex).value = resData.getValue("CarType");
			
			app.lookup("AMAAP_rdbCarBlackbox"+AMAAP_tabIndex).value = resData.getValue("CarBlackbox");
			app.lookup("AMAAP_ipbCarColor"+AMAAP_tabIndex).value = resData.getValue("CarColor");
			app.lookup("AMAAP_cmbCarAccessDay"+AMAAP_tabIndex).value = resData.getValue("CarAccessDay");
		}
		if( AMAAP_tabIndex != ApplicationTypeFamily ){
			app.lookup("AMAAP_cmbUserGroup"+AMAAP_tabIndex).value = resData.getValue("GroupCode");
		}
		
		switch(AMAAP_tabIndex){// 사용자 타입별 데이터 입력		
			case ApplicationTypeDuty:
				app.lookup("AMAAP_rdbDutyType").value = resData.getValue("UserType");
				app.lookup("AMAAP_ipbClasses"+AMAAP_tabIndex).value = resData.getValue("UserClass");
				app.lookup("AMAAP_ipbUnitName").value = resData.getValue("UnitName");
				app.lookup("AMAAP_ipbServiceNumber1").value = resData.getValue("ServiceNumber");
				app.lookup("AMAAP_cmbUserPosition"+AMAAP_tabIndex).value = resData.getValue("Position");
				app.lookup("AMAAP_ipbBasisIssuanceCertificate1").value = resData.getValue("BasisIssuanceCertificate");
				break;
			case ApplicationTypeSoldier:
			
				app.lookup("AMAAP_ipbClasses"+AMAAP_tabIndex).value = resData.getValue("UserClass");
				app.lookup("AMAAP_ipbServiceNumber2").value = resData.getValue("ServiceNumber");
				app.lookup("AMAAP_cmbUserPosition"+AMAAP_tabIndex).value = resData.getValue("Position");
				app.lookup("AMAAP_ipbBasisIssuanceCertificate2").value = resData.getValue("BasisIssuanceCertificate");
				app.lookup("AMAAP_dtiMoveInDate").value = resData.getValue("MoveInDate");
				app.lookup("AMAAP_dtiEnlistmentDate").value = resData.getValue("EnlistmentDate");
				app.lookup("AMAAP_dtiDischargeDate").value = resData.getValue("DischargeDate");	
				
				break;			
				
			case ApplicationTypeFamily: 
				app.lookup("AMAAP_cmbFamilyRelation").value = resData.getValue("FamilyRelation");
				app.lookup("AMAAP_opbFamilySoldierID").value = resData.getValue("RelationUserID");
				app.lookup("AMAAP_opbFamilySoldierName").value = resData.getValue("FamilyName");
				app.lookup("AMAAP_ipbBasisIssuanceCertificate2").value = resData.getValue("BasisIssuanceCertificate");
				app.lookup("AMAAP_ipbAddress"+AMAAP_tabIndex).value = resData.getValue("Address");
				var position = dataManager.getPositionIDByName(resData.getValue("VisitTargetPosition"));
			
				app.lookup("AMAAP_cmbUserPosition3").value = position;
				var group = dataManager.getGroupIDByName(resData.getValue("VisitTargetGroup"));
			
				app.lookup("AMAAP_cmbUserGroup3").value = group;	
				break;
				
			case ApplicationTypeResident: 
				
				app.lookup("AMAAP_ipbClasses"+AMAAP_tabIndex).value = resData.getValue("UserClass");
				app.lookup("AMAAP_ipbBgCheckNumber"+AMAAP_tabIndex).value = resData.getValue("IdentificationNumber");
				app.lookup("AMAAP_ipbAddress"+AMAAP_tabIndex).value = resData.getValue("Address");
				break;
			case ApplicationTypeRegular:
				app.lookup("AMAAP_ipbClasses"+AMAAP_tabIndex).value = resData.getValue("UserClass");
				app.lookup("AMAAP_ipbBgCheckNumber"+AMAAP_tabIndex).value = resData.getValue("IdentificationNumber");
				app.lookup("AMAAP_ipbAddress"+AMAAP_tabIndex).value = resData.getValue("Address");
				break;
		}
		
		if (AMAAP_tabIndex != ApplicationTypeSoldier){ // 병사는 신청서에 차량이 없음
			app.lookup("AMAAP_ipbCarNumber"+AMAAP_tabIndex).value = resData.getValue("CarNumber");
			app.lookup("AMAAP_ipbCarType"+AMAAP_tabIndex).value = resData.getValue("CarType");
			app.lookup("AMAAP_ipbCarColor"+AMAAP_tabIndex).value = resData.getValue("CarColor");
			app.lookup("AMAAP_rdbCarBlackbox"+AMAAP_tabIndex).value = resData.getValue("CarBlackbox");
			app.lookup("AMAAP_cmbCarAccessDay"+AMAAP_tabIndex).value = resData.getValue("CarAccessDay");
		}	
		
		if (AMAAP_tabIndex != ApplicationTypeDuty) {
			if (ApprovalState==1||ApprovalState==10) {
				setApprovalEnable(AMAAP_tabIndex);
			}
			var accessApprovalPair = app.lookup("AccessApprovalPair");
			setApprovalOptioin(accessApprovalPair.getValue("Predecessor"));
			console.log(accessApprovalPair.getValue("Predecessor"));		
			app.lookup("AMAAP_opb1stApprovalID"+AMAAP_tabIndex).value = accessApprovalPair.getValue("OnestApprovalUserID");
			app.lookup("AMAAP_ipb1stApprovalName"+AMAAP_tabIndex).value = accessApprovalPair.getValue("OnestApprovalName");
			app.lookup("AMAAP_ipb1stApprovalGroup"+AMAAP_tabIndex).value = accessApprovalPair.getValue("OnestApprovalGroup");		
			app.lookup("AMAAP_opb2stApprovalID"+AMAAP_tabIndex).value = accessApprovalPair.getValue("TwostApprovalUserID");
			app.lookup("AMAAP_ipb2stApprovalName"+AMAAP_tabIndex).value = accessApprovalPair.getValue("TwostApprovalName");
			app.lookup("AMAAP_ipb2stApprovalGroup"+AMAAP_tabIndex).value = accessApprovalPair.getValue("TwostApprovalGroup");
			
		}
		app.lookup("AMAAP_tabFolder").redraw();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}
function setApprovalEnable(AMAAP_tabIndex) {
	console.log(AMAAP_tabIndex);
	app.lookup("AMAAP_rdbPredecessor"+AMAAP_tabIndex).enabled = true;		
	app.lookup("AMAAP_opb1stApprovalID"+AMAAP_tabIndex).enabled = true;
	app.lookup("AMAAP_ipb1stApprovalName"+AMAAP_tabIndex).enabled = true;
	app.lookup("AMAAP_ipb1stApprovalGroup"+AMAAP_tabIndex).enabled = true;
	app.lookup("AMAAP_opb2stApprovalID"+AMAAP_tabIndex).enabled = true;
	app.lookup("AMAAP_ipb2stApprovalName"+AMAAP_tabIndex).enabled = true;
	app.lookup("AMAAP_ipb2stApprovalGroup"+AMAAP_tabIndex).enabled = true;
	app.lookup("AMAAP_btn1stApproval"+AMAAP_tabIndex).enabled = true;
	app.lookup("AMAAP_btn2stApproval"+AMAAP_tabIndex).enabled = true;
}

function onSms_SubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_SubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

		
	

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_putAccessApprovalInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_putAccessApprovalInfo = e.control;
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode ==COMERROR_NONE) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), "상세정보가 수정완료 되었습니다.");			
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}



/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getAccessApprovalSettingSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getAccessApprovalSetting = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode ==COMERROR_NONE) {
		var setInfos = app.lookup("AccessApprovalSettings");
		for (var i=0; i < setInfos.getRowCount(); i++) {
			var row = setInfos.getRow(i);
			//setApprovalOptioin(row.getValue("ApprovalType"), row.getValue("ApprovalValue"));
		}
		comLib.showLoadMask("","신청정보가져오기","",0);
		var smsgetAccessApprovalDetailInfoAmhq = app.lookup("sms_getAccessApprovalDetailInfoAmhq");
		smsgetAccessApprovalDetailInfoAmhq.action = "/v1/armyhq/accessApproval/DetailInfo/" + amaap_applicationIndex + "/" + userID;
		smsgetAccessApprovalDetailInfoAmhq.send();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}


/*
 * "..." 버튼(AMAAP_btn1stApproval2)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAMAAP_btn1stApprovalClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aMAAP_btn1stApproval2 = e.control;
	var appld = "app/main/users/approvalUser";
	app.openDialog(appld, {width : 500, height : 500}, function(dialog){
		dialog.bind("headerTitle").toLanguage("Str_ApproverSelect");
		dialog.initValue = {"ApprovalLevel":1};
		dialog.style.header.css("background-color", "#528443");
		dialog.modal = true;
	}).then(function(returnValue){
		if( returnValue != null ){
			var groupName = dataManager.getGroupName(returnValue.getValue("GroupCode"));
			app.lookup("AMAAP_ipb1stApprovalName"+AMAAP_tabIndex).value = returnValue.getValue("Name");
			app.lookup("AMAAP_ipb1stApprovalGroup"+AMAAP_tabIndex).value = groupName;
			app.lookup("AMAAP_opb1stApprovalID"+AMAAP_tabIndex).value = returnValue.getValue("ID");
			
			/*
			var accessApprovalInfo = app.lookup("AccessApprovalPair");
			accessApprovalInfo.setValue("OnestApprovalUserID", returnValue.getValue("ID"));
			accessApprovalInfo.setValue("OnestApprovalName", returnValue.getValue("Name"));
			accessApprovalInfo.setValue("OnestApprovalGroup", groupName);
			*/
		}
	});	
}


/*
 * "..." 버튼(AMAAP_btn2stApproval5)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAMAAP_btn2stApprovalClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aMAAP_btn2stApproval5 = e.control;
	var appld = "app/main/users/approvalUser";
	app.openDialog(appld, {width : 500, height : 500}, function(dialog){
		dialog.bind("headerTitle").toLanguage("Str_ApproverSelect");
		dialog.initValue = {"ApprovalLevel":2};
		dialog.style.header.css("background-color", "#528443");
		dialog.modal = true;
	}).then(function(returnValue){
		if( returnValue != null ){
			var groupName = dataManager.getGroupName(returnValue.getValue("GroupCode"));
			app.lookup("AMAAP_ipb2stApprovalName"+AMAAP_tabIndex).value = returnValue.getValue("Name");
			app.lookup("AMAAP_ipb2stApprovalGroup"+AMAAP_tabIndex).value = groupName;
			app.lookup("AMAAP_opb2stApprovalID"+AMAAP_tabIndex).value = returnValue.getValue("ID");
			
			/*
			var accessApprovalInfo = app.lookup("AccessApprovalPair");
			accessApprovalInfo.setValue("TwostApprovalUserID", returnValue.getValue("ID"));
			accessApprovalInfo.setValue("TwostApprovalName", returnValue.getValue("Name"));
			accessApprovalInfo.setValue("TwostApprovalUserID", groupName);
			*/
		}
	});	
}

function rdbPredecessorSelectionChange(){
	
	if (AMAAP_tabIndex != 1) {
	switch (Number(app.lookup("AMAAP_rdbPredecessor" + AMAAP_tabIndex).value)) {
	case 1:
		app.lookup("AMAAP_layout1stHeadApproval" + AMAAP_tabIndex).visible = true;
		app.lookup("AMAAP_layout1stApproval" + AMAAP_tabIndex).visible = true;
		app.lookup("AMAAP_layout2stHeadApproval" + AMAAP_tabIndex).visible = false;
		app.lookup("AMAAP_layout2stApproval" + AMAAP_tabIndex).visible = false;
		break;
	case 2:
		app.lookup("AMAAP_layout1stHeadApproval" + AMAAP_tabIndex).visible = false;
		app.lookup("AMAAP_layout1stApproval" + AMAAP_tabIndex).visible = false;
		app.lookup("AMAAP_layout2stHeadApproval" + AMAAP_tabIndex).visible = true;
		app.lookup("AMAAP_layout2stApproval" + AMAAP_tabIndex).visible = true;
		break;
	case 3:
		app.lookup("AMAAP_layout1stHeadApproval" + AMAAP_tabIndex).visible = true;
		app.lookup("AMAAP_layout1stApproval" + AMAAP_tabIndex).visible = true;
		app.lookup("AMAAP_layout2stHeadApproval" + AMAAP_tabIndex).visible = true;
		app.lookup("AMAAP_layout2stApproval" + AMAAP_tabIndex).visible = true;
		break;
	case 4:
		app.lookup("AMAAP_layout1stHeadApproval" + AMAAP_tabIndex).visible = false;
		app.lookup("AMAAP_layout1stApproval" + AMAAP_tabIndex).visible = false;
		app.lookup("AMAAP_layout2stHeadApproval" + AMAAP_tabIndex).visible = false;
		app.lookup("AMAAP_layout2stApproval" + AMAAP_tabIndex).visible = false;
		break;
		}
	}
}

function setApprovalOptioin(optionVaule) {
	var apOption = app.lookup("AMAAP_rdbPredecessor" + AMAAP_tabIndex);
	// 승인옵션 라디오를 모이지 않게 처리하고, 옵션 내역만 띄우는 output 추가 - sep
	apOption.deleteAllItems();
	var outPut_apOption = app.lookup("AMAAP_opdPredecessor" + AMAAP_tabIndex);
	switch (optionVaule) {	
	case 1:
		apOption.addItem(new cpr.controls.Item("1차 승인", 1));
		apOption.selectItem(0);
		outPut_apOption.value = "1차 승인";
		break;
	case 2:
		apOption.addItem(new cpr.controls.Item("2차 승인", 2));
		apOption.selectItem(0);
		outPut_apOption.value = "2차 승인";
		break;
	case 3:
		/* 
		apOption.addItem(new cpr.controls.Item("1차 승인", 1));
		apOption.addItem(new cpr.controls.Item("2차 승인", 2));
		*/
		apOption.addItem(new cpr.controls.Item("1,2차 승인", 3));
		apOption.selectItem(0);
		outPut_apOption.value = "1, 2차 승인";	
		break;
	case 4:
		apOption.addItem(new cpr.controls.Item("전결", 4));
		apOption.selectItem(0);
		outPut_apOption.value = "전결";
		break;
	// 2차 추가 개발부터는 1 ~ 4까지의 값만 사용하지만 이전 1차 개발에는 7까지 값을 사용했기 때문에 오류 방지를 위해 아래의 case 구문을 남겨둡니다. - sep	
	case 5:
		apOption.addItem(new cpr.controls.Item("1,2차 승인", 3));
		outPut_apOption.value = "1, 2차 승인";	
		/* 
		apOption.addItem(new cpr.controls.Item("1차 승인", 1));
		apOption.addItem(new cpr.controls.Item("전결", 4));
		*/
		apOption.selectItem(0);
		break;
	case 6:
		apOption.addItem(new cpr.controls.Item("1,2차 승인", 3));
		outPut_apOption.value = "1, 2차 승인";	
		/*
		apOption.addItem(new cpr.controls.Item("2차 승인", 2));
		apOption.addItem(new cpr.controls.Item("전결", 4));
		*/ 
		apOption.selectItem(0);
		break;
	case 7:
		apOption.addItem(new cpr.controls.Item("1,2차 승인", 3));
		outPut_apOption.value = "1, 2차 승인";	 
		/*
		apOption.addItem(new cpr.controls.Item("1차 승인", 1));
		apOption.addItem(new cpr.controls.Item("2차 승인", 2));
		apOption.addItem(new cpr.controls.Item("1,2차 승인", 3));
		apOption.addItem(new cpr.controls.Item("전결", 4));
		*/ 
		apOption.selectItem(0);
		break;
	}
	apOption.redraw();
	outPut_apOption.redraw();
}

/*
 * "닫기" 버튼에서 click 이벤트 발생 시 호출.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	var button = e.control;
	app.close();
}