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
var loginUserGroupID;

// 탭 인덱스
var AMAAP_tabIndex = 1; 			// 현재 탭 인덱스
var ApplicationTypeDuty = 1; 		// 현역/군무원
var ApplicationTypeSoldier = 2; 	// 병사
var ApplicationTypeFamily = 3; 		// 군가족
var ApplicationTypeResident = 4;	// 상주민간인
var ApplicationTypeRegular = 5; 	// 고정출입자

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	loginUserGroupID = getLoginUserGroupCode();
	// * 계급 초기화
	// 현역
	changePostion(app.lookup("AMAAP_cmbUserPosition1"), app.lookup("AMAAP_rdbDutyType").value);
	// 병사
	changePostion(app.lookup("AMAAP_cmbUserPosition2"), 905);
	
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
				
		/*   출입신청은 어디든 다 되어야 한다고 전달받음 -mjy
		// 최상위 관리자 == Master의 기능, 그 외는 그대로  -mjy
		if(dataManager.getAccountID() == 1000000000000000000 || isSuperGroupAdmin()) {
			cmbUserGroup.setItemSet(dataManager.getGroup(), {
				label: "Name",
				value: "GroupID"		
			});
			cmbUserGroup.addItem(new cpr.controls.Item("------", 0));
		} else {  // Master가 아닐 경우 
		
			var privilege = dataManager.getAccountInfo().getValue("Privilege"); // 권한
			
			// 관리자는 자식 그룹 보이게.
			if(privilege == 1) { 
			 	cmbUserGroup.setItemSet(getChildGroupList(), {label: "Name", value: "GroupID" });
	            cmbUserGroup.addItem(new cpr.controls.Item("---", 0));
	            
			} else { // 일반 사용자는 본인 그룹만 보이게
			 	cmbUserGroup.setItemSet(dataManager.getGroup(), {
					label: "Name",
					value: "GroupID"		
				});
				cmbUserGroup.selectItemByValue(loginUserGroupID);
				// 수정 불가하도록
				cmbUserGroup.readOnly = true;
				cmbUserGroup.hideButton = true;
			}
			
        }
        *         */
				
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
		if( i == 1 ){ // 현역/군무원/공무직일 시 시스템 권한 기본 값 설정해주기
			app.lookup("AMAAP_cmbSelPrivilegeGroup").selectItemByValue(0);
		}
//		else{
//			app.lookup("AMAAP_dtiAccessEnd"+i).value = today;
//		}		

		// 모든 출입신청 시 신청 날짜 1년으로
		
		app.lookup("AMAAP_dtiAccessEnd"+i).value = dateLib.nextDate(dateLib.getToday(), 365, "-");
	}
	
	app.lookup("sms_getAccessApprovalSetting").send();
}

/// 공통 함수 ---->

// 탭 변경
function onTabFolderSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/**	 @type cpr.controls.TabFolder	 */
	var tabFolder = e.control;
	var tabItem = tabFolder.getSelectedTabItem();
 	AMAAP_tabIndex = tabItem.id;
 	
 	if(AMAAP_tabIndex != 1) {
 	rdbPredecessorSelectionChange();
 	}
 	app.lookup("AMAAP_cmbSelPrivilegeGroup").selectItemByValue(0); 
 	app.lookup("AccessApprovalPair").clear(); 	
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
			// 이메일 유효성 검사
			var email = app.lookup("AMAAP_ipbEmail").value;
			if (email != null) { // length >1 조건을 같이 쓰면 에러
				if (email.length > 1) {  // 이메일에 값을 넣었을 때 유효성 검사
					var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
					if (!re.test(email)) {
						dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitEmailInvalidReg"), function(dialog) {
							dialog.style.header.css("background-color", "#528443");
							dialog.addEventListenerOnce("close", function(e) {
								app.lookup("AMAAP_ipbEmail").focus(true);
							});
						});
						return false;
					}
					email = email.trim();
				}
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
			/* 군가족 사진 필수조건 해제 (이한봉 상사 요청) -mjy
			if( app.lookup("AMAAP_imgUserPicture3").src == null || app.lookup("AMAAP_imgUserPicture3").src == "" ){
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_FileInputInvalid"));
				return false;
			}
			**/
			break;
		case ApplicationTypeResident: 
			if( app.lookup("AMAAP_ipbClasses"+AMAAP_tabIndex).value == null || app.lookup("AMAAP_ipbClasses"+AMAAP_tabIndex).value.length < 1 ){
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_UserClassInvalid"));
				return false;
			}
			/* 상주민간인 신원조회 연번 필수조건 해제 (육본요청) - mjy
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
	if (AMAAP_tabIndex != ApplicationTypeDuty) { // 사요자 타입이 현역,군무원이 아닐경우 결제정보 추가
		var rdbPredecessor = app.lookup("AMAAP_rdbPredecessor"+AMAAP_tabIndex).value;
		var opb1stApprovalName = app.lookup("AMAAP_ipb1stApprovalName"+AMAAP_tabIndex).value;
		var opb2stApprovalName = app.lookup("AMAAP_ipb2stApprovalName"+AMAAP_tabIndex).value;
		switch(rdbPredecessor) {
		case "1": //1차만 있음
		
			if (opb1stApprovalName == null ||opb1stApprovalName.toString().length <= 0) {
				dialogAlertAMHQ(app, "경고", "1차 승인자 지정을 해야 합니다.");
				return false;
			} else {
				return true;
			}
		case "2":
			if (opb2stApprovalName == null || opb2stApprovalName.toString().length <= 0) {
				dialogAlertAMHQ(app, "경고", "2차 승인자 지정을 해야 합니다.");
				return false;
			} else {
				return true;
			}
		case "3":
			if (opb1stApprovalName == null || opb1stApprovalName.toString().length <= 0) {
				dialogAlertAMHQ(app, "경고", "1차 승인자 지정을 해야 합니다.");
				return false;
			} 
			if (opb2stApprovalName == null || opb2stApprovalName.toString().length <= 0) {
				dialogAlertAMHQ(app, "경고", "2차 승인자 지정을 해야 합니다.");
				return false;
			} 
			return true;
		case "4":
			return true;
		}
	}
	return true;
}

// 초기화 버튼 클릭
function onBtnClearClick(/* cpr.events.CMouseEvent */ e){	
	
	dialogConfirmAMHQ(app, "초기화", dataManager.getString("Str_ClearConfirm"), function(/*cpr.controls.Dialog*/dialog){
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				app.lookup("AMAAP_ipbName"+AMAAP_tabIndex).value = "";
				app.lookup("AMAAP_dtiBirthday"+AMAAP_tabIndex).value = "";		
				app.lookup("AMAAP_cmbUserAccessGroup"+AMAAP_tabIndex).selectItemByValue(0);
				if( AMAAP_tabIndex != ApplicationTypeFamily ){
					//app.lookup("AMAAP_cmbUserGroup"+AMAAP_tabIndex).selectItemByValue(0);
					app.lookup("AMAAP_cmbUserGroup"+AMAAP_tabIndex).selectItemByValue(loginUserGroupID);
				}
				app.lookup("AMAAP_dtiAccessStart"+AMAAP_tabIndex).value = "";
				app.lookup("AMAAP_dtiAccessEnd"+AMAAP_tabIndex).value = "";
				
				if( AMAAP_tabIndex != ApplicationTypeSoldier ){
					app.lookup("AMAAP_ipbMobile"+AMAAP_tabIndex).value = "";
					app.lookup("AMAAP_ipbPhone"+AMAAP_tabIndex).value = "";
					
					app.lookup("AMAAP_ipbCarNumber"+AMAAP_tabIndex).value = "";
					app.lookup("AMAAP_ipbCarType"+AMAAP_tabIndex).value = "";
					app.lookup("AMAAP_ipbCarColor"+AMAAP_tabIndex).value = "";		
				}
				
				if( AMAAP_tabIndex != ApplicationTypeDuty ){
					app.lookup("AMAAP_rdbPredecessor"+AMAAP_tabIndex).value = 0;		
					app.lookup("AMAAP_opb1stApprovalID"+AMAAP_tabIndex).value = "";		
					app.lookup("AMAAP_ipb1stApprovalName"+AMAAP_tabIndex).value = "";		
					app.lookup("AMAAP_ipb1stApprovalGroup"+AMAAP_tabIndex).value = "";		
					app.lookup("AMAAP_opb2stApprovalID"+AMAAP_tabIndex).value = "";		
					app.lookup("AMAAP_ipb2stApprovalName"+AMAAP_tabIndex).value = "";		
					app.lookup("AMAAP_ipb2stApprovalGroup"+AMAAP_tabIndex).value = "";		
				}
				
				switch(AMAAP_tabIndex){// 사용자 타입별 데이터 초기화
					case ApplicationTypeDuty:						
						app.lookup("AMAAP_ipbClasses"+AMAAP_tabIndex).value = "";
						app.lookup("AMAAP_ipbUnitName").value = "";
						app.lookup("AMAAP_ipbServiceNumber1").value = "";
						//app.lookup("AMAAP_cmbUserPosition"+AMAAP_tabIndex).selectItemByValue(0);
						app.lookup("AMAAP_cmbUserPosition"+AMAAP_tabIndex).selectItemByValue(loginUserGroupID);
						app.lookup("AMAAP_ipbBasisIssuanceCertificate1").value = "";			
						app.lookup("AMAAP_cmbSelPrivilegeGroup").selectItemByValue(0); 
						app.lookup("AMAAP_ipbEmail").value = "";			
						break;
					case ApplicationTypeSoldier:		
						app.lookup("AMAAP_ipbServiceNumber2").value = "";
						//app.lookup("AMAAP_cmbUserPosition"+AMAAP_tabIndex).selectItemByValue(0);
						app.lookup("AMAAP_cmbUserPosition"+AMAAP_tabIndex).selectItemByValue(loginUserGroupID);
						app.lookup("AMAAP_ipbBasisIssuanceCertificate2").value = "";
						
						app.lookup("AMAAP_dtiMoveInDate").value = "";
						app.lookup("AMAAP_dtiEnlistmentDate").value = "";
						app.lookup("AMAAP_dtiDischargeDate").value = "";	

						break;
					case ApplicationTypeFamily: 
						app.lookup("AMAAP_cmbFamilyRelation").selectItemByValue(0);			
						app.lookup("AMAAP_opbFamilySoldierID").value = "";	
						app.lookup("AMAAP_opbFamilySoldierName").value = "";	
						break;
					case ApplicationTypeResident: 
						app.lookup("AMAAP_ipbClasses"+AMAAP_tabIndex).value = "";	
						app.lookup("AMAAP_ipbBgCheckNumber"+AMAAP_tabIndex).value = "";	
						break;
					case ApplicationTypeRegular: 
						app.lookup("AMAAP_ipbClasses"+AMAAP_tabIndex).value = "";	
						app.lookup("AMAAP_ipbBgCheckNumber"+AMAAP_tabIndex).value = "";
						break;
				}
			}else{
				return;
			}
		});
	});
	
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
	// 중복체크 버튼용 flag값 초기화
	var duplicateCheck = app.lookup("DuplicateCheck");
	duplicateCheck.setValue("DuplicateCheckFlag", 0);
	
	var accessApplicationInfo = app.lookup("AccessApplicationInfo");	
	//// 공통 데이터 매핑 ----------------------------------------
	// 출입신청 정보 매핑
	accessApplicationInfo.clear();
	
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
	
	// 부서별 관리 기능 추가로 군가족도 앞으로는 신청서 group_code에 가족의 부서 코드 값이 들어가도록 수정 - pse
	//if( AMAAP_tabIndex != ApplicationTypeFamily ){
		accessApplicationInfo.setValue("GroupCode", app.lookup("AMAAP_cmbUserGroup"+AMAAP_tabIndex).value);
	//}
	
	//출입권한 매핑			
	accessApplicationInfo.setValue("AccessGroup", app.lookup("AMAAP_cmbUserAccessGroup"+AMAAP_tabIndex).value);
	accessApplicationInfo.setValue("AccessStart", app.lookup("AMAAP_dtiAccessStart"+AMAAP_tabIndex).value);
	accessApplicationInfo.setValue("AccessEnd", app.lookup("AMAAP_dtiAccessEnd"+AMAAP_tabIndex).value);
	
	if( AMAAP_tabIndex != ApplicationTypeDuty ){
		accessApplicationInfo.setValue("Predecessor", app.lookup("AMAAP_rdbPredecessor"+AMAAP_tabIndex).value);
		accessApplicationInfo.setValue("1stApproval", app.lookup("AMAAP_opb1stApprovalID"+AMAAP_tabIndex).value);
		accessApplicationInfo.setValue("2stApproval", app.lookup("AMAAP_opb2stApprovalID"+AMAAP_tabIndex).value);
	}
	
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
			accessApplicationInfo.setValue("EmailAddress", app.lookup("AMAAP_ipbEmail").value);
			//
			app.lookup("SysPrivilege").setValue("SysPrivilegeID", app.lookup("AMAAP_cmbSelPrivilegeGroup").value);
		
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
			
			// 군번이 없는 경우 생년월일을 군번으로 입력      -mjy
//			var birthday = accessApplicationInfo.getValue("Birthday").replace(/-/g,'');	
//			accessApplicationInfo.setValue("ServiceNumber", birthday);	
			
			break;
			
		case ApplicationTypeResident: 
			accessApplicationInfo.setValue("UserType", UserPrivArmyResident);
			accessApplicationInfo.setValue("UserClass", app.lookup("AMAAP_ipbClasses"+AMAAP_tabIndex).value);
			accessApplicationInfo.setValue("IdentificationNumber", app.lookup("AMAAP_ipbBgCheckNumber"+AMAAP_tabIndex).value);
			accessApplicationInfo.setValue("Address", app.lookup("AMAAP_ipbAddress"+AMAAP_tabIndex).value);
			
			// 군번이 없는 경우 생년월일을 군번으로 입력      -mjy
//			var birthday = accessApplicationInfo.getValue("Birthday").replace(/-/g,'');	
//			accessApplicationInfo.setValue("ServiceNumber", birthday);
			break;
		case ApplicationTypeRegular:
			accessApplicationInfo.setValue("UserType", UserPrivArmyRegular); 
			accessApplicationInfo.setValue("UserClass", app.lookup("AMAAP_ipbClasses"+AMAAP_tabIndex).value);
			accessApplicationInfo.setValue("IdentificationNumber", app.lookup("AMAAP_ipbBgCheckNumber"+AMAAP_tabIndex).value);
			accessApplicationInfo.setValue("Address", app.lookup("AMAAP_ipbAddress"+AMAAP_tabIndex).value);
			
			// 군번이 없는 경우 생년월일을 군번으로 입력      -mjy
//			var birthday = accessApplicationInfo.getValue("Birthday").replace(/-/g,'');	
//			accessApplicationInfo.setValue("ServiceNumber", birthday);
			break;
	}
	
	console.log(accessApplicationInfo.getDatas());	
	
	if (AMAAP_tabIndex != ApplicationTypeDuty) { // 사요자 타입이 현역,군무원이 아닐경우 결제정보 추가
		var accessApprovalInfo = app.lookup("AccessApprovalPair");
		accessApprovalInfo.setValue("Predecessor", app.lookup("AMAAP_rdbPredecessor"+AMAAP_tabIndex).value);
		
		console.log(accessApprovalInfo.getDatas());	
	}
	
	//차량정보 Check
	var CarNumberCheck = app.lookup("AccessApplicationInfo").getValue("CarNumber");
	var CarNumberCheckCNT = CarNumberCheck.length;
	if (CarNumberCheckCNT == 0 || (CarNumberCheckCNT >= 7 && CarNumberCheckCNT <= 12 )) {
		var sms_postAccessApplication = app.lookup("sms_postAccessApplication");
		sms_postAccessApplication.send();
		return;
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "잘못된 자동차 번호입니다.\n예:11가1111 / 서울11가1111");
		return;
	}

	comLib.showLoadMask("",dataManager.getString("Str_ARMYHQ_AccessApplication"),"",0);
	
}

// 출입신청 완료
function onSms_postAccessApplicationSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	
	if( resultCode == COMERROR_NONE ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_ARMY_AccessApplicationCompleted"));		
	} else if (resultCode == ErrorNotDuplicateUser) { 
		// 중복체크 문제 없으면
		dialogAlertAMHQ(app,dataManager.getString("Str_Success"), dataManager.getString("Str_ARMYHQ_NotDuplicateUser"));
	}
	else {		
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}	
}

// 출입신청 에러
function onSms_SubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR)
}

// 출입신청 타임아웃
function onSms_SubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

/// 현역/군무원 ---->

/// 병사 ---->

/// 군가족 ---->

/// 상주민간인 ---->

/// 고정출입자 ---->





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
    console.log(pictureFile.files [0]);
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
    console.log(tempImage.src);
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
 * "..." 버튼(AMAAP_btn1stApproval)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAMAAP_btn1stApprovalClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aMAAP_btn1stApprovalGroup2 = e.control;
	
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
			
			var accessApprovalInfo = app.lookup("AccessApprovalPair");
			accessApprovalInfo.setValue("1stApprovalID", returnValue.getValue("ID"));
			accessApprovalInfo.setValue("1stApprovalName", returnValue.getValue("Name"));
			accessApprovalInfo.setValue("1stApprovalGroup", groupName);
		}
	});	

}

/*
 * "..." 버튼(AMAAP_btn2stApproval)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAMAAP_btn2stApprovalClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aMAAP_btn2stApprovalGroup2 = e.control;
	
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
			
			var accessApprovalInfo = app.lookup("AccessApprovalPair");
			accessApprovalInfo.setValue("2stApprovalID", returnValue.getValue("ID"));
			accessApprovalInfo.setValue("2stApprovalName", returnValue.getValue("Name"));
			accessApprovalInfo.setValue("2stApprovalGroup", groupName);
		}
	});	

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


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getAccessApprovalSettingSubmitDone(/* cpr.events.CSubmissionEvent */ e){
		var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){
		// changeUserType();
		// initVisitApplicationControl();
		var setInfos = app.lookup("AccessApprovalSettings");
		for (var i=0; i < setInfos.getRowCount(); i++) {
			var row = setInfos.getRow(i);
			setApprovalOptioin(row.getValue("ApprovalType"), row.getValue("ApprovalValue"));
		}
		sendPrivilegeGroupList();
	} else {		
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}	
	
}


function setApprovalOptioin(approvalType, optionVaule) {
	var apOption;
	var outPut_apOption;
	switch (approvalType) {
	case 21: 
		apOption = app.lookup("AMAAP_rdbPredecessor2");
		outPut_apOption = app.lookup("AMAAP_opdPredecessor2"); 
		break;
	case 22: 
		apOption = app.lookup("AMAAP_rdbPredecessor3");
		outPut_apOption = app.lookup("AMAAP_opdPredecessor3"); 
		break;
	case 23: 
		apOption = app.lookup("AMAAP_rdbPredecessor4"); 
		outPut_apOption = app.lookup("AMAAP_opdPredecessor4");
		break;
	case 24: 
		apOption = app.lookup("AMAAP_rdbPredecessor5");
		outPut_apOption = app.lookup("AMAAP_opdPredecessor5"); 
		break;
	default:
		return;
	}
	
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
	
	app.lookup("AMAAP_layout1stHeadApproval2").redraw();
	app.lookup("AMAAP_layout1stApproval2").redraw();
	app.lookup("AMAAP_layout2stHeadApproval2").redraw();
	app.lookup("AMAAP_layout2stApproval2").redraw();
}

function onAMAAP_rdbDutyTypeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var aMAAP_rdbDutyType = e.control;
	// console.log(aMAAP_rdbDutyType.value);
	changePostion(app.lookup("AMAAP_cmbUserPosition1"), Number(aMAAP_rdbDutyType.value));
	
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

function onAMAAP_btnPictureRegistClick(/* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var aMAAP_btnPictureRegist = e.control;
	// 단말로 사진 등록 해야 하고 그걸 받으면 사진등록으로 빼야 한다.
	
	//사진정보 올려줄 필요 없이 무조건 내려 받아야 한다.	
		var appld = "app/custom/army_hq/users/pictureRegist";
	app.getRootAppInstance().openDialog(appld, {width : 780, height : 500}, function(dialog){
		dialog.initValue = {
			"Mode": "Modify",	//
		    "Url":"/v1"
		};		
		dialog.headerTitle = "사진등록 요청";
		dialog.style.header.css("background-color", "#528443");
		dialog.modal = true;		
	}).then(function(returnValue){
		var imgData = returnValue;
		var tempImage = new Image();
		tempImage.src = imgData; 
		console.log(tempImage.src);
		tempImage.onload = function () {
			var canvas = document.createElement('canvas');
	    	var canvasContext = canvas.getContext("2d");
	    	canvas.width = 320; 
	    	canvas.height = 420;
	    	
	    	canvasContext.drawImage(this, 0, 0, 320, 420);
	    	
	    	var userPicture = app.lookup("AMAAP_imgUserPicture"+AMAAP_tabIndex);
	    	userPicture.src = canvas.toDataURL("image/jpeg");
	    	userPicture.redraw();
		}	
	});
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

function sendPrivilegeGroupList() {
	comLib.showLoadMask("","권한 그룹정보 가져오기","",0);
	var smsgetPrivilegeGroupList = app.lookup("sms_getPrivilegeGroupList");
	smsgetPrivilegeGroupList.action = "/v1/armyhq/privilege/groups";// 권한그룹리스트
	smsgetPrivilegeGroupList.send();
}

/*
 * 데이트 인풋에서 value-change 이벤트 발생 시 호출.
 * Dateinput의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onAMAAP_dtiAccessEnd2ValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.DateInput
	 */
	var aMAAP_dtiAccessEnd2 = e.control;
	app.lookup("AMAAP_dtiDischargeDate").value = app.lookup("AMAAP_dtiAccessEnd2").value;
	app.lookup("AMAAP_dtiDischargeDate").redraw;
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getPrivilegeGroupListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getPrivilegeGroupList = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		var privilegeGroupListAHQ = app.lookup("PrivilegeGroupListAHQ");
		var cmbPrivilegeGroup = app.lookup("AMAAP_cmbSelPrivilegeGroup");	
		cmbPrivilegeGroup.setItemSet(privilegeGroupListAHQ, {
				label: "PName",
				value: "PID",
		});
		
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Fail"), dataManager.getString(getErrorString(resultCode)));
	}
}


/*
 * 버튼(AMAAP_btnDuplicate1)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function DuplicateCheckRequest(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aMAAP_btnDuplicate1 = e.control;
	var accessApplicationInfo = app.lookup("AccessApplicationInfo");
	var duplicateCheck = app.lookup("DuplicateCheck");
	duplicateCheck.setValue("DuplicateCheckFlag", 0);
	
	switch(AMAAP_tabIndex){// 사용자 타입별 데이터 입력
		// 이름 + 군번 체크
		case ApplicationTypeDuty:		
		case ApplicationTypeSoldier:
			var name = app.lookup("AMAAP_ipbName"+AMAAP_tabIndex).value;
			var serviceNumber = app.lookup("AMAAP_ipbServiceNumber"+AMAAP_tabIndex).value;
			
			if( name == null || name.length < 1 ){
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_UserNameInvalid"));
				return false;
			}
			if( serviceNumber == null || serviceNumber.length < 1 ){
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_ServiceNumberInvalid"));
				return false;
			}
			
			accessApplicationInfo.setValue("Name", name);
			accessApplicationInfo.setValue("ServiceNumber", serviceNumber);
			break;	
			
		// 이름 + 생년월일 체크
		case ApplicationTypeFamily:
		case ApplicationTypeResident:
		case ApplicationTypeRegular: 
			var name = app.lookup("AMAAP_ipbName"+AMAAP_tabIndex).value;
			var birthday = app.lookup("AMAAP_dtiBirthday"+AMAAP_tabIndex).value;
			
			if( name == null || name.length < 1 ){
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_UserNameInvalid"));
				return false;
			}
			if( birthday == null || birthday.length < 10 ){
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_BirthdayInvalid"));
				return false;
			}
			
			accessApplicationInfo.setValue("Name", name);
			accessApplicationInfo.setValue("Birthday", birthday);
			break;
	}
	
	duplicateCheck.setValue("DuplicateCheckFlag", 1); // 중복체크용 플래그 활성화
	
	// 현역, 군무원, 공무직 아닌경우 승인 관련 검사에서 걸리므로 중복검사는 타입을 무조건 고정해서 보냄 -mjy
	accessApplicationInfo.setValue("UserType",900);
	
	app.lookup("sms_postAccessApplication").send();
}


