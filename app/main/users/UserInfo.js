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
var usint_version;
var licenseLevel;
var oem_version;
var account;
var remotePassword = "";
var updateCustomPicture;
// 수정된 탭 기록 [사용자 사진, 이름, 아이디, 유니크 아이디, 기본 탭, 인증 탭, 출입 탭, 관리 탭, 기타 탭]
var modifiedList = [false,false,false,false,false,false,false,false,false];
var floorMap; // key: 건물코드(엘리베이터 아이디), value: 출입 가능한 층의 배열
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e) {
	comLib = createComUtil(app);
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	USINT_fpModified = 0;
	USINT_cardModified = 0;
	updateCustomPicture = false;
	oem_version = dataManager.getOemVersion();
	account = dataManager.getAccountInfo();
	floorMap = new Map();
	licenseLevel = dataManager.getSystemInfo().getValue("LicenseLevel");
	if (licenseLevel >= LicenseENTERPRISE) { //LicenseENTERPRISE 엔터프라이즈 기능으로 하자
		
		app.lookup("US_INT_grpCarInfoBtn").visible = true;
		app.lookup("US_INT_grpCarInfoMain").visible = true;
		app.lookup("US_INT_OpbCarInfo").visible = true;
		app.lookup("USINT_grdCarList").visible = true;
		app.lookup("USINT_btnCarAdd").visible = true;
		app.lookup("USINT_btnCarDelete").visible = true;
		
	}
	if (oem_version == OEM_GS_BASIC) { 
		app.lookup('US_INT_AuthTab').getLayout().setRowVisible(6, false);
		app.lookup('US_INT_accessGroupTab').getLayout().setRowVisible(3, false);
		app.lookup('US_INT_accessGroupTab').getLayout().setRowVisible(4, false);
		app.lookup('US_INT_EtcTab').getLayout().setRowVisible(0, false);
		app.lookup('US_INT_EtcTab').getLayout().setRowVisible(7, false);
	}
	
	if (oem_version == OEM_BEST_ALLIANCE_CARD) { 
		app.lookup("ipbCardNum").inputFilter = null;
		app.lookup("ipbCardNum").placeholder = "Up to 24 Byte";
	} else {
		app.lookup("ipbCardNum").inputFilter = /[A-Za-z0-9*]{1,24}/;
		app.lookup("ipbCardNum").placeholder = dataManager.getString("Str_CardNumberFormat");
	}
	
	var userIDLength = dataManager.getUserIDLength();
	var ipbUserID = app.lookup("USINB_ipbUserID");
	ipbUserID.inputFilter = /^[0-9]*$/;
	ipbUserID.maxLength = userIDLength;
	
	var dmProcessInfo = app.lookup("ProcessInfo");
	dmProcessInfo.reset();
	
	var privilegeList = dataManager.getPrivilegeList()
	var cmbPrivilege = app.lookup("USINB_cmbPrivilege");
	
	if (privilegeList) {
		var ItemAdmin = new cpr.controls.Item(dataManager.getString("Str_Admin"), 1);
		var ItemNormalUser = new cpr.controls.Item(dataManager.getString("Str_NormalUser"), 2);
		var ItemDisplayBoardAdmin = new cpr.controls.Item(dataManager.getString("Str_DisplayBoardManager"), 15);
		
		ItemAdmin.bind("label").toLanguage("Str_Admin");
		ItemNormalUser.bind("label").toLanguage("Str_NormalUser");
		ItemDisplayBoardAdmin.bind("label").toLanguage("Str_DisplayBoardManager");
		
		if(oem_version == OEM_GS_BASIC || oem_version == OEM_ARMY_HQ || oem_version == OEM_ROKMCH){
			cmbPrivilege.addItem(ItemAdmin);
			cmbPrivilege.addItem(ItemNormalUser);
		} else {	
			cmbPrivilege.addItem(ItemAdmin);
			cmbPrivilege.addItem(ItemNormalUser);
			cmbPrivilege.addItem(ItemDisplayBoardAdmin);
		}
		
		if (oem_version == OEM_HYUNDAI_MSEAT) { // 순서상 위로 뺌
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_TempUser"), 14)); // lang 설정, 코드 부여 14
		}
		if (oem_version == OEM_BOSK_CAPS) {
			cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_Visitor"), 3));
		}
		
		var count = privilegeList.getRowCount();
		for (var i = 0; i < count; i++) {
			var privilegeInfo = privilegeList.getRow(i);
			cmbPrivilege.addItem(new cpr.controls.Item(privilegeInfo.getValue("Name"), privilegeInfo.getValue("PrivilegeID")));
		}
		
		switch (oem_version) {
			case OEM_ARMY_HQ:
			case OEM_ROKMCH:
				cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_OnDuty"), UserPrivArmyOnDuty));
				cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_OtherUnit"), UserPrivArmyOtherUnit));
				cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Foreign"), UserPrivArmyForeign));
				cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Soldier"), UserPrivArmySoldier));
				cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Family"), UserPrivArmyFamily));
				cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Resident"), UserPrivArmyResident));
				cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Regular"), UserPrivArmyRegular));
				cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_MilitaryPersonnel"), UserPrivArmyMilitaryPersonnel));
				cmbPrivilege.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_ArmyPublicServicel"), UserPrivArmyPublicService));
				break;
			case OEM_LOTTE_OSIRIA:
				cmbPrivilege.addItem(new cpr.controls.Item("일반직", 101));
				cmbPrivilege.addItem(new cpr.controls.Item("특수직", 102));
				cmbPrivilege.addItem(new cpr.controls.Item("캐스트", 103));
				cmbPrivilege.addItem(new cpr.controls.Item("용역직", 104));
				cmbPrivilege.addItem(new cpr.controls.Item("파견직", 105));
				cmbPrivilege.addItem(new cpr.controls.Item("일용직", 106));
				cmbPrivilege.addItem(new cpr.controls.Item("주차관리", 107));
				cmbPrivilege.addItem(new cpr.controls.Item("전문직", 108));
				cmbPrivilege.addItem(new cpr.controls.Item("전문캐스트", 109));
				break;
				
		}
	}
	
	cmbPrivilege.selectItemByValue(2);
	
	if (oem_version == OEM_LOTTE_CS) {
		app.lookup("USINE_opbGender").visible = true;
		app.lookup("USINE_cmbGender").visible = true;
	} else if (oem_version == OEM_HC_SAUDI_MARJAN) {
		app.lookup("US_INT_grpOemHCSM").visible = true;
		hcsmSetComboBox();
	} else if (oem_version == OEM_HE_CHUNGJU_FACTORY) {
		app.lookup("US_INT_nbeAccessFloor").visible = true;
		app.lookup("AccessFloorLabel").visible = true;
	} else if (oem_version == OEM_PHILIPPINES_ELEVATOR) {
		app.lookup("UserAccessFloorLabel").visible = true;
		app.lookup("US_elevator_setting").visible = true;
	} else if (oem_version == OEM_DMCC_NOPICTURE) {
		app.lookup("pictureGroup").visible = false;
	} else if (oem_version == OEM_ITONE_TRDATA || oem_version == OEM_ITONE_POSCO_DX) {
		app.lookup("USINB_opbUserID").visible = false;
		app.lookup("USINB_ipbUserID").visible = false;
		app.lookup("USINB_btnReduplication").visible = false;
		app.lookup("USINB_opbUniqueID").bind("value").toLanguage("Str_UserID");
	} else if (oem_version == OEM_BOSK_CAPS) {
		app.lookup("userPrivilege").bind("value").toLanguage("Str_UserType");
	} else if (oem_version == OEM_MULTI_BUILDING_MAMAGEMENT){
		// 엘리베이터 탭 사용
		app.lookup("USINB_tabInfo").getTabItemByID(6).enabled = true;
		app.lookup("USINB_tabInfo").getTabItemByID(6).visible = true;
	} else if (oem_version == OEM_HYUNDAI_HI) {
		app.lookup("US_INT_ipbLoginPW").inputFilter = /[0-9a-zA-Z\~\!\?\@\#\$\%\^\&\*\-\_]/;
		app.lookup("US_INT_OpDepartment").unbind("value");
		app.lookup("US_INT_OpDepartment").bind("value").toLanguage("Str_Title");
		app.lookup("USINE_opbGender").visible = true;
		app.lookup("USINE_cmbGender").visible = true;
	}
	
	var genderVisible = app.lookup("USINE_opbGender").visible;
	if (!genderVisible) { // 성별 옵션 사용 안하면 칸 사이즈 줄이기
		app.lookup("etcSecondRowGroup").getLayout().setColumns(["1fr", "5px", "5px"]);
	}
	
	var groupList = dataManager.getGroup();
	var cmbGroup = app.lookup("USINT_cmbGroup");
	if (oem_version == OEM_DJMCITYHALL) { //상급 그룹도 보고 싶다고 해서 처리
		var rowCnt = groupList.getRowCount();
		for (var i = 0; i < rowCnt; i++) {
			var rowData = groupList.getRow(i);
			var parentID = rowData.getValue("Parent");
			if (parentID > 0) {
				var parentInfo = groupList.findFirstRow("GroupID == " + parentID);
				var strName = parentInfo.getValue("Name") + "/" + rowData.getValue("Name");
				cmbGroup.addItem(new cpr.controls.Item(strName, rowData.getValue("GroupID")));
			} else {
				cmbGroup.addItem(new cpr.controls.Item(rowData.getValue("Name"), rowData.getValue("GroupID")));
			}
			
		}
	} else {
		cmbGroup.setItemSet(groupList, {
			label: "Name",
			value: "GroupID"
		});
	}
	
	var accessGroupList = dataManager.getAccessGroup();
	accessGroupList.setSort("Name");
	//console.log(accessGroupList.getRowDataRanged());
	var cmbAccessGroup = app.lookup("US_INT_cmbAccessGroup");
	if (oem_version == OEM_KYOCERA) {
		// 마스터를 제외한 사용자들은 출입그룹 설정 불가
		if (account.getValue("UserID") != 1000000000000000000){
			cmbAccessGroup.hideButton = true;
			cmbAccessGroup.readOnly = true;
		}
	} 
	cmbAccessGroup.setItemSet(accessGroupList, {
		label: "Name",
		value: "ID",
	});
	
	var timezoneList = dataManager.getTimezoneSet();
	var cmbTimezone = app.lookup("US_INT_cmbTimezone");
	cmbTimezone.setItemSet(timezoneList, {
		label: "Name",
		value: "TimezoneID"
	});
	
	var positionList = dataManager.getPositionList();
	var cmbPosition = app.lookup("US_INT_cmbPosition");
	cmbPosition.setItemSet(positionList, {
		label: "Name",
		value: "PositionID"
	});
	
	var tnaTypeList = dataManager.getTnaTypeList();
	var cmbTnaType = app.lookup("US_INT_cmbTNA");
	cmbTnaType.setItemSet(tnaTypeList, {
		label: "Name",
		value: "Code"
	});
	
	var mealList = dataManager.getMealList();
	var cmbMeal = app.lookup("US_INT_cmbMeal");
	cmbMeal.setItemSet(mealList, {
		label: "Name",
		value: "Code"
	});
	
	var userMessageList = dataManager.getUserMessageList();
	var cmbMeal = app.lookup("US_INT_cmbUserMessage");
	cmbMeal.setItemSet(userMessageList, {
		label: "Message",
		value: "MessageID"
	});
	
	var paymentList = dataManager.getPaymentList();
	var cmbTnaType = app.lookup("US_INT_cmbMoney");
	cmbTnaType.setItemSet(paymentList, {
		label: "Name",
		value: "Code"
	});
	
	var brandType = dataManager.getSystemBrandType();
	if (brandType == BRAND_VRIDI) {
		app.lookup("TimeZone_Label").visible = false;
		app.lookup("TimeZone_Content").visible = false;
	}
	
	var dmProcessInfo = app.lookup("ProcessInfo");
	var initValue = app.getHost().initValue;
	var userID = initValue["ID"];
	var editMode = initValue["Mode"];
		
	var smsArea = app.lookup("sms_getAreas");
	smsArea.send();
	if (editMode == 'Modify') { // 사용자 정보 수정인 경우
		
		app.lookup("USINT_btnUserDelete").visible = true; // 삭제 버튼 보이기
		dmProcessInfo.setValue("EditMode", "Modify");
		dmProcessInfo.setValue("UserID", userID);
		
		var submission = app.lookup("smsUserInfoReq");
		submission.setParameters("fingerprint", "false");
		submission.setParameters("face", "false");
		submission.setParameters("picture", "true");
		
		submission.action = "/v1/users/" + dmProcessInfo.getValue("UserID");
		submission.send();
		app.lookup("USINB_ipbUserID").readOnly = true;
	} else { // 새로운 사용자 추가인 경우
		
		var accountInfo = dataManager.getAccountInfo();
		var privilegeID = accountInfo.getValue("Privilege");
		if (privilegeID != 1) {
			var sms_getPrivilegeInfo = app.lookup("sms_getPrivilegeInfo");
			sms_getPrivilegeInfo.action = "/v1/privileges/" + privilegeID;
			sms_getPrivilegeInfo.send();
		}
		
		app.lookup("USINT_btnFPModify").visible = false;
		app.lookup("USINT_btnFAModify").visible = false;
		app.lookup("USINT_btnFAWModify").visible = false;
		app.lookup("USINT_btnIrisModify").visible = false;
		app.lookup("USINT_btnFpCardModify").visible = false;
		app.lookup("USINT_ipbPassword").visible = false;
		app.lookup("USINT_ipbCardView").visible = false;
		app.lookup("USINT_btnMCModify").visible = false;
		
		app.lookup("USINT_btnUserDelete").visible = false; // 삭제 버튼 숨기기
		dmProcessInfo.setValue("EditMode", "Add");
		dmProcessInfo.setValue("UserID", userID);
		RefreshData(dmProcessInfo.getValue("UserID"));
		
		var FpVerifyLevel = dataManager.getClientOption().getValue("FpVerifyLevel");
		app.lookup("US_INT_cmbFPVerifyLevel").value = FpVerifyLevel;
		
		if (oem_version == OEM_MULTI_BUILDING_MAMAGEMENT){
			app.lookup("sms_getElevatorSetList").send();
		}
	}
	
	// 사용자 기본정보 커스텀 레이아웃 설정
	var customLyout = app.lookup("userInfoCustomLayout");
	switch (oem_version) {
		case OEM_ND_POWER_PLANT:
			var udcUserInfo = new udc.custom.UserInfoCustomND("UserInfoCustomND");
			customLyout.addChild(udcUserInfo, {
				"colIndex": 0,
				"rowIndex": 0
			});
			break;
		case OEM_SS_HOSPITAL:
			var udcUserInfo = new udc.custom.userInfoCustomSSH("UserInfoCustomSSH");
			customLyout.addChild(udcUserInfo, {
				"colIndex": 0,
				"rowIndex": 0
			});
			
			break;
		case OEM_HDEC_EC:
			// 현대건설 카드 정보 수정 
			var CardAddButton = app.lookup("USINT_ipbCardAdd");
			var CardRemoveButton = app.lookup("USINT_ipbCardRemove");
			var CardModifyButton = app.lookup("USINT_btnCardModify");
			CardAddButton.enabled = false;
			CardRemoveButton.enabled = false;
			CardModifyButton.enabled = false;
			break;
		case OEM_ARMY_HQ:
		case OEM_ROKMCH:
			if (editMode == 'Modify') { // 사용자 정보 수정인 경우
				var udcUserInfo = new udc.custom.UserInfoCustomArmyHQ("UserInfoCustomArmyHQ");
				customLyout.addChild(udcUserInfo, {
					"colIndex": 0,
					"rowIndex": 0
				});
			}
			break;
			// 베트남 오토바이 주차관제 
		case OEM_MOTORCYCLE_PARK:
			app.lookup("US_INT_OpbCarInfo").visible = false;
			app.lookup("US_INT_grpCarInfoMain").visible = false;
			var udcUserInfo = new udc.custom.UserInfoCustomMCP("UserInfoCustomMCP");
			customLyout.addChild(udcUserInfo, {
				"colIndex": 0,
				"rowIndex": 0
			});
			if (editMode == 'Add') {
				var udcUserCarInfo = customLyout.getChild("UserInfoCustomMCP");
				udcUserCarInfo.setMCPUserInfo(app.lookup("UserInfo").getValue("ID"), editMode);
			}
			app.lookup("USINT_cmbGroup").enabled = false; // 사용자 정보 그룹 비활성화
			break;
		case OEM_DJMCITYHALL:
			var udcUserInfo = new udc.custom.UserInfoCustomDJMCH("UserInfoCustomDJMCH");
			customLyout.addChild(udcUserInfo, {
				"colIndex": 0,
				"rowIndex": 0
			});
			break;
		case OEM_Elca:
			var udcUserInfo = new udc.custom.UserInfoCustomElca("UserInfoCustomElca");
			customLyout.addChild(udcUserInfo, {
				"colIndex": 0,
				"rowIndex": 0
			});
			if (editMode == 'Add') {
				var udcUserTypeInfo = customLyout.getChild("UserInfoCustomElca");
				udcUserTypeInfo.setUserTypeElca(0);
			}
			break;
		case OEM_HC_SAUDI_MARJAN:
			var udcUserInfo = new udc.custom.UserInfoCustomHCSM("UserInfoCustomHCSM");
			customLyout.addChild(udcUserInfo, {
				"colIndex": 0,
				"rowIndex": 0
			});
			break;
		case OEM_BLUEHOUSE_KR: // PRI_NO 수정
			var udcUserInfo = new udc.custom.UserInfoCustomBH("UserInfoCustomBH");
			customLyout.addChild(udcUserInfo, {
				"colIndex": 0,
				"rowIndex": 0
			});
			break;
		case OEM_ITONE_POSCO_DX:
		case OEM_ITONE_TRDATA:
			app.lookup("USINT_btnUserDelete").visible = false;
			
			// 필요없는 메뉴 삭제
			app.lookup("US_INT_cmbAccessGroup").visible = false;
			app.lookup("opbAcGroup").visible = false;
			app.lookup("APBExceptionGroup").visible = false;
			app.lookup("opbAPBException").visible = false;
			app.lookup("opbAPBAreaLocation").visible = false;
			app.lookup("APBAreaLocationGroup").visible = false;
			app.lookup("USINB_ipbUniqueID").readOnly = true;
			
			// --- 레이아웃에서 안보이도록 ------
			// 아이디 이름 관련
			var grpSummary = app.lookup("US_INF_grpSummary"); 
			var getLayout = grpSummary.getLayout();
			var rowArr = getLayout.getRows();
			for (var i=0; i < rowArr.length; i++) {
				if (i == 2) {
					rowArr[i] = '0px';
				} else if (i == 3 ) {
					rowArr[i] = '0px';
				}
			}
			getLayout.setRows(rowArr);
			grpSummary.redraw();
			
			var accessGroupTab = app.lookup("US_INT_accessGroupTab");
			getLayout = accessGroupTab.getLayout();
			var rowArr = getLayout.getRows();
			for (var i=0; i < rowArr.length; i++) {
//				if (i == 1 || i == 3 || i == 4) {
//					rowArr[i] = '0px';
//				}
				if(i != 0 && i != 2 && i != 7) {
					getLayout.setRowVisible(i, false);
				} else if(i==7 && oem_version == OEM_ITONE_POSCO_DX) {
					getLayout.setRowVisible(i, true);
				} 
			}
//			getLayout.setRows(rowArr);
//			accessGroupTab.redraw();
			// --- 레이아웃에서 안보이도록 ------

			// LoginID 컬럼 추가			
			var etcGrp = app.lookup("US_INT_EtcTab");
			getLayout = etcGrp.getLayout();
			getLayout.insertRows(["40px"], 5);
			
			var udcLoginInfo = new udc.custom.UserLoginIdITONE("UserLoginID");
			etcGrp.addChild(udcLoginInfo, {
				"colIndex":0,
				"rowIndex":5,
				"colSpan":4
			})
			
			etcGrp.redraw();
			
			// 명칭변경			
			app.lookup("AccessTab_opbGroup").bind("value").toLanguage("Str_PartnerCompany");
			app.lookup("US_INT_OpPositon").bind("value").toLanguage("Str_JobName");
			app.lookup("USINT_btnFAWModify").bind("value").toLanguage("Str_FaceRegist");
			var tabInfo = app.lookup("USINB_tabInfo");
			
			tabInfo.getTabItemByID(4).visible = false;
			tabInfo.setSelectedTabItem(tabInfo.getTabItemByID(2));
			break;
		case OEM_HYUNDAI_HI: // 현대중공업
			var udcUserInfo = new udc.custom.UserInfoCustomHDHI("UserInfoCustomHDHI");
			customLyout.addChild(udcUserInfo, {
				"colIndex": 0,
				"rowIndex": 0
			});
			break;	
		case OEM_ALMARAI_AUTHINFO: 
			var udcUserInfo = new udc.custom.UserInfoCustomALMARAI("UserInfoCustomALMARAI");
			customLyout.addChild(udcUserInfo, {
				"colIndex": 0,
				"rowIndex": 0
			});
			break;
		default:
			break;
	}
	if (dataManager.getOemVersion() == OEM_INNODEP_NORMAL) {
		app.lookup("USINB_imgUserPicture").src = "../../../theme/images/common/Innodep_black_img_180.png"
	}
	checkLoginAllowedToggle();
	SetMaxDate();

}

function onSms_SubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_SubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onSms_getAreasSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var apbList = app.lookup("AreaList");
	if (apbList.getRowCount() > 0) {
		var cmbAPB = app.lookup("US_INT_cmbAPBarea");
		cmbAPB.setItemSet(apbList, {
			label: "Name",
			value: "AreaID"
		});
	}
}

// 사용자 추가시 기본 정보 추가.
function RefreshData(userID) {
	var dmUserInfo = app.lookup("UserInfo");
	dmUserInfo.reset();
	dmUserInfo.setValue("ID", userID);
	var tmedateUtil = dateUtil.getDate();
	var getDate = dateUtil.makeDateFormat(dateUtil.getDate().substr(0, 8), "-");
	//var getTime = dateUtil.makeTimeFormat(dateUtil.getDate().substr(8, 6), ":") // 만료일자 시간값을 현재시간으로 할수도 있어서 남겨둠
	var getTime = "23:59:59";
	dmUserInfo.setValue("RegistDate", getDate);
	dmUserInfo.setValue("ExpireDate", getDate + " " + getTime);
	
	if (oem_version == OEM_SS_HOSPITAL) {
		//app.lookup("US_INT_dtiExpire").value ="2099-12-31";
		dmUserInfo.setValue("ExpireDate", "2099-12-31");
		// 필수 / 선택 인증 정보 파싱
		var AuthType = dmUserInfo.setValue("AuthInfo", "2,0,0,0,0,0,0,0");
		validateAuthDataBtn(true);
	}
	onDisplayAuthType(true);
	dmUserInfo.setValue("LoginAllowed", 0);
	dmUserInfo.setValue("VoipUse", 0);
	
	app.lookup("USINB_ipbUserID").readOnly = true;
	app.lookup("USINB_ipbUserName").tooltip = "Name";
	app.lookup("USINB_ipbUniqueID").tooltip = "UniqueID";
	
	app.lookup("USINB_tabInfo").redraw();
	app.lookup("USINB_ipbUserID").readOnly = false;
	
	validateInput();
}

// 필수 입력사항 입력 여부 표시
function validateInput() {
	
	var nameList = ["USINB_ipbUserName", "USINT_ipbPassword", "USINB_ipbUserID", ];
	for (var i = 0; i < nameList.length; i++) {
		var inputElement = app.lookup(nameList[i]);
		if (inputElement.value) {
			inputValidManager.validate(inputElement, "isNull", dataManager.getString("Str_RequiredAlert"));
			inputValidManager.validate(inputElement, "isValid", "");
		} else {
			inputValidManager.validate(inputElement, "isValid", "");
			inputValidManager.validate(inputElement, "isNull", dataManager.getString("Str_RequiredAlert"));
		}
	}
	
	var option = dataManager.getClientOption();
	
	var UniqueID = app.lookup("USINB_ipbUniqueID");
	var UniqueIDRequiredflag = option.getValue("UserUniqueIDRequired");
	if (UniqueIDRequiredflag == 1) {
		if (UniqueID.value) {
			inputValidManager.validate(UniqueID, "isNull", dataManager.getString("Str_UserUniqueIDRequired"));
			inputValidManager.validate(UniqueID, "isValid", "");
		} else {
			inputValidManager.validate(UniqueID, "isValid", "");
			inputValidManager.validate(UniqueID, "isNull", dataManager.getString("Str_UserUniqueIDRequired"));
		}
	}
	
	var Group = app.lookup("USINT_cmbGroup");
	var GroupRequiredflag = option.getValue("UserGroupRequired");
	if (GroupRequiredflag == 1) {
		if (Group.value) {
			inputValidManager.validate(Group, "comboDefalut", dataManager.getString("Str_UserGroupRequired"));
		} else {
			inputValidManager.validate(Group, "isValid", "");
		}
	}
	
	var AccessGroup = app.lookup("US_INT_cmbAccessGroup");
	var AccessGroupRequiredflag = option.getValue("UserAccessGroupRequired");
	if (AccessGroupRequiredflag == 1) {
		if (AccessGroup.value) {
			inputValidManager.validate(AccessGroup, "comboDefalut", dataManager.getString("Str_UserAccessGroupRequired"));
		} else {
			inputValidManager.validate(AccessGroup, "isValid", "");
		}
	}
	
	var Position = app.lookup("US_INT_cmbPosition");
	var PositionRequiredflag = option.getValue("UserPositionRequired");
	if (PositionRequiredflag == 1) {
		if (Position.value) {
			inputValidManager.validate(Position, "comboDefalut", dataManager.getString("Str_UserPositionRequired"));
		} else {
			inputValidManager.validate(Position, "isValid", "");
		}
	}
	
	var Email = app.lookup("US_INT_ipbEmail");
	var EmailRequiredflag = option.getValue("UserEmailRequired");
	if (EmailRequiredflag == 1) {
		if (Email.value) {
			inputValidManager.validate(Email, "isNull", dataManager.getString("Str_UserEmailRequired"));
			inputValidManager.validate(Email, "isValid", "");
		} else {
			inputValidManager.validate(Email, "isValid", "");
			inputValidManager.validate(Email, "isNull", dataManager.getString("Str_UserEmailRequired"));
		}
	}
	
	var Mobile = app.lookup("US_INT_Mobile");
	var MobileRequiredflag = option.getValue("UserMobileRequired");
	if (MobileRequiredflag == 1) {
		if (Mobile.value) {
			inputValidManager.validate(Mobile, "isNull", dataManager.getString("Str_UserMobileRequired"));
			inputValidManager.validate(Mobile, "isValid", "");
		} else {
			inputValidManager.validate(Mobile, "isValid", "");
			inputValidManager.validate(Mobile, "isNull", dataManager.getString("Str_UserMobileRequired"));
		}
	}
	
	var Department = app.lookup("US_INT_ipbDepartment");
	var DepartmentRequiredflag = option.getValue("UserDepartmentRequired");
	if (DepartmentRequiredflag == 1) {
		if (Department.value) {
			inputValidManager.validate(Department, "isNull", dataManager.getString("Str_UserDepartmentRequired"));
			inputValidManager.validate(Department, "isValid", "");
		} else {
			inputValidManager.validate(Department, "isValid", "");
			inputValidManager.validate(Department, "isNull", dataManager.getString("Str_UserDepartmentRequired"));
		}
	}
	
	var ScheduleCode = app.lookup("US_INT_cmbTNA");
	var ScheduleCodeRequiredflag = option.getValue("UserScheduleCodeRequired");
	if (ScheduleCodeRequiredflag == 1) {
		if (ScheduleCode.value) {
			inputValidManager.validate(ScheduleCode, "comboDefalut", dataManager.getString("Str_UserScheduleCodeRequired"));
		} else {
			inputValidManager.validate(ScheduleCode, "isValid", "");
		}
	}
	
	var MealCode = app.lookup("US_INT_cmbMeal");
	var MealCodeRequiredflag = option.getValue("UserMealCodeRequired");
	if (MealCodeRequiredflag == 1) {
		if (MealCode.value) {
			inputValidManager.validate(MealCode, "comboDefalut", dataManager.getString("Str_UserMealCodeRequired"));
		} else {
			inputValidManager.validate(MealCode, "isValid", "");
		}
	}
	
	var SalaryCode = app.lookup("US_INT_cmbMoney");
	var SalaryCodeRequiredflag = option.getValue("UserSalaryCodeRequired");
	if (SalaryCodeRequiredflag == 1) {
		if (SalaryCode.value) {
			inputValidManager.validate(SalaryCode, "comboDefalut", dataManager.getString("Str_UserSalaryCodeRequired"));
		} else {
			inputValidManager.validate(SalaryCode, "isValid", "");
		}
	}
}

// 인증수단 편집 버튼 활성화/비활성화 적용
function validateAuthDataBtn(changeFlag) {
	var authTypeList = [AuthTypeFingerPrint, AuthTypeFace, AuthTypeFaceWT, AuthTypePassword, AuthTypeCard, AuthTypeIris,
		AuthTypeFingerCard, AuthTypeMobileCard
	]; // 제외 
	var editBtnList = ["USINT_btnFPModify", "USINT_btnFAModify", "USINT_btnFAWModify", "USINT_ipbPassword", "USINT_ipbCardView",
		"USINT_btnIrisModify", "USINT_btnFpCardModify", "USINT_btnMCModify"
	]; // "USINT_btnFpCardModify" 임시 제외
	for (var i = 0; i < authTypeList.length; i++) {
		if (IsExistAuthType(authTypeList[i]) == true) {
			
			app.lookup(editBtnList[i]).visible = true;
			if (editBtnList[i] == "USINT_btnFPModify") {
				if (changeFlag == true) {
					app.lookup("NVBAR_FP_1:N").value = 1;
				}
				
				app.lookup("NVBAR_FP_1:N").enabled = true;
			} else if (editBtnList[i] == "USINT_btnFAModify") {
				if (changeFlag == true) {
					app.lookup("NVBAR_FACE_1:N").value = 1;
				}
				
				app.lookup("NVBAR_FACE_1:N").enabled = true;
			} else if (editBtnList[i] == "USINT_btnIrisModify") {
				if (changeFlag == true) {
					app.lookup("NVBAR_IRIS_1:N").value = 1;
				}
				
				app.lookup("NVBAR_IRIS_1:N").enabled = true;
			} else if (editBtnList[i] == "USINT_btnFpCardModify") {
				app.lookup("USINT_grdCardList").visible = true;
			} else if (editBtnList[i] == "USINT_btnMCModify") {
				if (changeFlag == true) {
					app.lookup("NVBAR_FP_1:N").value = 1;
					app.lookup("NVBAR_FACE_1:N").value = 1;
					app.lookup("NVBAR_IRIS_1:N").value = 1;
				}
			}
			
		} else {
			app.lookup(editBtnList[i]).visible = false;
			if (editBtnList[i] == "USINT_btnFPModify") {
				if (changeFlag == 1) {
					app.lookup("NVBAR_FP_1:N").value = 0;
				}
				app.lookup("NVBAR_FP_1:N").enabled = false;
			} else if (editBtnList[i] == "USINT_btnFAModify") {
				if (changeFlag == 1) {
					app.lookup("NVBAR_FACE_1:N").value = 0;
				}
				app.lookup("NVBAR_FACE_1:N").enabled = false;
			} else if (editBtnList[i] == "USINT_btnIrisModify") {
				if (changeFlag == 1) {
					app.lookup("NVBAR_IRIS_1:N").value = 0;
				}
				app.lookup("NVBAR_IRIS_1:N").enabled = false;
			}
		}
	}
	
	// UMS_QRCODE 향 qrcode 사용시 유니크아이디 필수
	if (dataManager.getOemVersion() == OEM_UMS_QRCODE) {
		var UniqueID = app.lookup("USINB_ipbUniqueID");
		if (IsExistAuthType(30) == true) {
			inputValidManager.validate(UniqueID, "isNull", dataManager.getString("Str_UserUniqueIDRequired"));
		} else {
			inputValidManager.clearInput(UniqueID);
		}
	}
	
}

// 사용자 정보 수신 완료
function onSmUserInfoReqSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var userInfo = app.lookup("UserInfo");
	// 사용자 정보 요청 결과
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if (resultCode == 0) {
		
		var dmProcessInfo = app.lookup("ProcessInfo");
		// 사용자 사진
		var userImage = app.lookup("USINB_imgUserPicture");
		
		// DMCC 마스터 로그인 일때만 프로필 사진 보이도록
		switch (oem_version) {
			case OEM_DMCC_NOPICTURE:
				/* 주석 풀면 마스터만 볼 수 있음
				if (userInfo.getValue("Picture") && Number(account.getValue("UserID")) == 1000000000000000000) {
					userImage.putValue('data:image/png;base64,' + userInfo.getValue("Picture"));
				}*/
				break;
			default:
				if (userInfo.getValue("Picture")) {
					userImage.putValue('data:image/png;base64,' + userInfo.getValue("Picture")); 
				}
				break;
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
		
		onDisplayAuthType(true);
		
		var voipDoorOpen = userInfo.getValue("VoipDoorOpen");
		if (voipDoorOpen == 1) {
			app.lookup("US_INT_cbxDoorOpenDuringCall").checked = true;
		}
		var voipAutoAnswer = userInfo.getValue("VoipAutoAnswer");
		if (voipAutoAnswer == 1) {
			app.lookup("US_INT_cbxDoorOpenReceivingCall").checked = true;
		}
		validateAuthDataBtn(false);
		
		var dsCardInfo = app.lookup("UserCardInfo");
		// 비밀번호 체크때문에 추가 됨
		app.lookup("US_INT_ipbLoginPW").value = userInfo.getValue("LoginPW");
		
		var adminPriv = dataManager.getAccountInfo().getValue("Privilege");
		if (adminPriv != 1 && userInfo.getValue("Privilege") == 1) {
			app.lookup("USINB_cmbPrivilege").readOnly = true;
		} else {
			app.lookup("USINB_cmbPrivilege").readOnly = false;
		}
		
		// 사용자 생년월일
		//		var birthday = userInfo.getValue("Birthday");
		//
		//		if (birthday.toString().split(" ")[0] == "9999-12-31" || birthday.toString().split(" ")[0] == "0001-01-01") {
		//			userInfo.setValue("Birthday", "");
		//		}
		
		/* 방문자 관리 기능 추가로 일반 사용자의 방문자 관리 페이지 접속을 위해 로그인 기능 허용
		if (userInfo.getValue("Privilege") == 1) {
			//관리자
			app.lookup("US_INT_ipbLoginPW").visible = true;
			app.lookup("US_INT_nbbAllowSignIn").visible = true;
		} else {
			app.lookup("US_INT_ipbLoginPW").visible = false;
			app.lookup("US_INT_nbbAllowSignIn").visible = false;
		}
		*/
		// 요약 정보화면 갱신
		app.lookup("US_INF_grpSummary").redraw();
		app.lookup("USINB_tabInfo").redraw();
		
		if(oem_version == OEM_KYOCERA){
			var cmbAccessGroup = app.lookup("US_INT_cmbAccessGroup");
			var accessGroup = cmbAccessGroup.value;
			var group = app.lookup("USINT_cmbGroup").value;
			var filterGroupinfo = dataManager.getAccessGroup();
			if (group != 0){
				cmbAccessGroup.deleteAllItems();
				cmbAccessGroup.addItem(new cpr.controls.Item("----", 0));	
				filterGroupinfo.setFilter("Code == " + group);
				//console.log(filterGroupinfo.getRowDataRanged());	
				var itemCount = filterGroupinfo.getRowCount();
				for(var i = 0; i < itemCount; i++){
					cmbAccessGroup.addItem(new cpr.controls.Item(filterGroupinfo.getValue(i, "Name"), filterGroupinfo.getValue(i, "ID")));
				}
			}
			cmbAccessGroup.selectItemByValue(accessGroup);
			//console.log(cmbAccessGroup.getIndex(cmbAccessGroup.getSelection()[0]));
			// byocera향에서는 그룹과 출입그룹 연동으로 그룹 선택 -> 해당 그룹에 속하는 출입그룹중에서만 설정 가능.
			// 하지만 이전에 그룹에 속하지 않는 출입그룹을 설정했을 경우, 콤보박스에 아이템이 없어 보이지 않아 이 경우에만 설정한 값을 콜보박스에 추가..
			if(cmbAccessGroup.getIndex(cmbAccessGroup.getSelection()[0]) == -1){
				filterGroupinfo.clearFilter();
				//console.log(filterGroupinfo.getRowDataRanged());
				var row = filterGroupinfo.findFirstRow("ID == " + accessGroup);
				//console.log(row.getRowData());
				cmbAccessGroup.addItem(new cpr.controls.Item(row.getValue("Name"), row.getValue("ID")));
				cmbAccessGroup.selectItemByValue(accessGroup);
			}
		}
		
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	
	validateInput();
	
	// 사용자 커스텀 정보 가져오기
	switch (oem_version) {
		case OEM_ND_POWER_PLANT:
			var userInfo = app.lookup("UserInfo");
			var submission = app.lookup("smsUserCustomND");
			submission.action = "/v1/custom/userCustomND/" + userInfo.getValue("ID");
			submission.send();
			break;
		case OEM_SS_HOSPITAL:
			var userInfo = app.lookup("UserInfo");
			var submission = app.lookup("smsUserCustomSSH");
			submission.action = "/v1/ssh/users/" + userInfo.getValue("ID");
			submission.send();
			break;
		case OEM_ARMY_HQ:
		case OEM_ROKMCH:
			var udcUserInfo = app.lookup("userInfoCustomLayout").getChild("UserInfoCustomArmyHQ");
			var userType = app.lookup("UserInfo").getValue("Privilege");
			udcUserInfo.setUserTypeAMHQ(userType);
			udcUserInfo.setUserCustomInfoAMHQ(app.lookup("UserCustomArmyHQ"));
			break;
		case OEM_MOTORCYCLE_PARK:
			var udcUserCarInfo = app.lookup("userInfoCustomLayout").getChild("UserInfoCustomMCP");
			udcUserCarInfo.setMCPUserCarInfo(app.lookup("UserCarInfo").getRowDataRanged());
			udcUserCarInfo.setMCPUserInfo(app.lookup("UserInfo").getValue("ID"), "Modify");
			
			var udcUserCustomInfo = app.lookup("US_INF_grpSummary").getChild("UserInfoCustomBPARK");
			
			var submission = app.lookup("sms_getBPARKUser");
			submission.action = "/v1/oemData/bpark/user/" + userInfo.getValue("ID");
			submission.send();
			break;
		case OEM_DJMCITYHALL:
			var smsGetDjmchUser = app.lookup("sms_getDjmchUser");
			smsGetDjmchUser.action = "/v1/djmch/user/" + userInfo.getValue("ID");
			smsGetDjmchUser.send();
			break;
		case OEM_Elca:
			var udcUserTypeInfo = app.lookup("userInfoCustomLayout").getChild("UserInfoCustomElca");
			var userType = app.lookup("UserInfo").getValue("UserType");
			udcUserTypeInfo.setUserTypeElca(userType);
			break;
		case OEM_HC_SAUDI_MARJAN:
			var submission = app.lookup("sms_getHCSMUser");
			submission.action = "/v1/oemData/hcsm/user/" + userInfo.getValue("ID");
			submission.send();
			break;
		case OEM_BLUEHOUSE_KR: // PRI_NO 수정
			var submission = app.lookup("sms_getBHUser");
			submission.action = "/v1/bluehouse/users/" + userInfo.getValue("ID");
			submission.send();
			break;
		case OEM_ITONE_POSCO_DX:
		case OEM_ITONE_TRDATA: 
			var submission = app.lookup("sms_getItoneUser");
			submission.action = "/v1/oemData/itone/loginInfo/" + userInfo.getValue("ID");
			submission.send();
			break;
		case OEM_MULTI_BUILDING_MAMAGEMENT: 
			var submission = app.lookup("smsUserCustomMBM");
			submission.action = "/v1/mbm/user/" + userInfo.getValue("ID");
			submission.send();
			break;
		case OEM_HYUNDAI_HI: // 현대중공업
			var submission = app.lookup("sms_getCustomHDHI");
			submission.action = "/v1/hdhi/users/" + userInfo.getValue("ID");
			submission.send();
			break;	
		case OEM_ALMARAI_AUTHINFO:
			var submission = app.lookup("sms_getAlmaraiDescription");
			submission.action = "/v1/oemData/almarai/description/" + userInfo.getValue("ID");
			submission.send();
			break;
		default:
			break;
	}
	//원격사용자 토글
	checkLoginAllowedToggle();
}

// 사용자 정보 수신 실패
function onSmUserInfoReqSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR)
}

// 사용자 정보 수신 타임아웃
function onSmUserInfoReqSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT)
}

function IsExistAuthType(authType) {
	var userInfo = app.lookup("UserInfo");
	var AuthType = userInfo.getValue("AuthInfo").split(',');
	for (var idx = 0; idx < 7; idx++) {
		var checkData = parseInt(AuthType[idx], 10);
		if (checkData == authType) {
			return true;
		}
	}
	return false;
}

// 인증정보 배열 분석하여 화면 표시
function onDisplayAuthType(isFirst) {
	var userInfo = app.lookup("UserInfo");
	// 필수 / 선택 인증 정보 파싱
	var AuthType = userInfo.getValue("AuthInfo").split(',');
	
	var fpExist = false;
	var andAuth = "";
	for (var idx = 0; idx < AuthType[7]; idx++) {
		var authType = parseInt(AuthType[idx], 10);
		var type = getAuthTypeString(authType)
		if ( dataManager.getOemVersion() == OEM_HDEC_CW ) {
			if (type == "CD") {
				type = "카드";
			} else if (type == "PW") {
				type = "패스워드";
			} else if (type == "FP") {
				type = "지문";
			} else if (type == "FAW") {
				type = "워크스루";
			} else if (type == "FA") {
				type = "얼굴"
			} else if (type == "MC") {
				type = "모바일키";
			} else if (type == "FPCard") {
				type = "지문카드";
			} else if (type == "IR") {
				type = "홍채";
			}
		}
		andAuth += type + " ";
	}
	var orAuth = "";
	for (var idx = AuthType[7]; idx < AuthType.length - 1; idx++) {
		var authType = parseInt(AuthType[idx], 10);
		var type = getAuthTypeString(authType)
		
		if ( dataManager.getOemVersion() == OEM_HDEC_CW ) {
			if (type == "CD") {
				type = "카드";
			} else if (type == "PW") {
				type = "패스워드";
			} else if (type == "FP") {
				type = "지문";
			} else if (type == "FAW") {
				type = "워크스루";
			} else if (type == "FA") {
				type = "얼굴"
			} else if (type == "MC") {
				type = "모바일키";
			} else if (type == "FPCard") {
				type = "지문카드";
			} else if (type == "IR") {
				type = "홍채";
			}
		}
		orAuth += type + " ";
	}
	
	if (!isFirst){
		if ((app.lookup("USINT_opbAuthAnd").value != andAuth) || (app.lookup("USINT_opbAuthOr").value != orAuth)){
			modifiedList[4] = true;
			//console.log(modifiedList);
		}
	}
	
	app.lookup("USINT_opbAuthAnd").value = andAuth;
	app.lookup("USINT_opbAuthOr").value = orAuth;	
}

// "웹캠" 버튼 클릭
function onUSINB_btnWebcamClick(e) {
	var button = e.control;
	var appld = "app/main/users/WebCamViewer" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {
		width: 660,
		height: 410
	}, function(dialog) {
		dialog.initValue = 0;
		dialog.resizable = false;
		dialog.bind("headerTitle").toLanguage("Str_WebCamViewer");
		dialog.modal = true;
	}).then(function(returnValue) {
		var userPicture = app.lookup("USINB_imgUserPicture");
		resizeImage(userPicture, returnValue, 160, 160);
		
		var thumbnailImg = app.lookup("thumbnail");
		resizeImage(thumbnailImg, returnValue, 80, 80);
	});
}

// 사진 등록 버튼 클릭시
function onUSINB_btnPictureFileSelectClick(e) {
	
	var uS_INB_btnPictureFileSelect = e.control;
	var pictureFile = app.lookup("USINB_ImageFileInput");
	pictureFile.openFileChooser();
}

// 이미지 리사이징 함수
function resizeImage(ctrl, imageData, width, height) {
	
	var tempImage = new Image();
	tempImage.src = imageData;
	tempImage.onload = function() {
		var canvas = document.createElement('canvas');
		var canvasContext = canvas.getContext("2d");
		canvas.width = width;
		canvas.height = height;
		
		canvasContext.drawImage(this, 0, 0, width, height);
		
		ctrl.src = canvas.toDataURL("image/jpeg");
	}
}

// 사진 파일 선택 완료시
function onUSINB_ImageFileInputValueChange(e) {
	var fileTest = e.control;
	var pictureFile = app.lookup("USINB_ImageFileInput");
	
	// 읽기
	var reader = new FileReader();
	reader.readAsDataURL(pictureFile.files[0]);
	
	//로드 한 후
	reader.onload = function() {
		var userPicture = app.lookup("USINB_imgUserPicture");
		resizeImage(userPicture, reader.result, 160, 160);
		
		var thumbnailImg = app.lookup("thumbnail");
		resizeImage(thumbnailImg, reader.result, 80, 80);
	};
}

// 인증타입 수정 버튼 클릭
function onUSINT_btnAuthTypeModifyClick( /* cpr.events.CMouseEvent */ e) {
	
	var userInfo = app.lookup("UserInfo");
	// 필수 / 선택 인증 정보 파싱
	var AuthType = userInfo.getValue("AuthInfo").split(',');
	
	var andAuth = [];
	for (var idx = 0; idx < AuthType[7]; idx++) {
		andAuth[idx] = parseInt(AuthType[idx], 10);
	}
	var orAuth = [];
	var count = 0;
	for (var idx = AuthType[7]; idx < AuthType.length - 1; idx++) {
		orAuth[count++] = parseInt(AuthType[idx], 10);
	}
	var appld = "app/main/users/UserAuthTypeSet" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {
		width: 410,
		height: 500
	}, function(dialog) {
		dialog.initValue = {
			"AuthAnd": andAuth,
			"AuthOr": orAuth
		};
		dialog.bind("headerTitle").toLanguage("Str_AuthTypeSelect");
		dialog.modal = true;
	}).then(function(returnValue) {
		var strAuthType = "";
		var init = false;
		returnValue.forEach(function(authType) {
			if (init == false) {
				init = true
			} else {
				strAuthType += ","
			}
			strAuthType += authType
		});
		userInfo.setValue("AuthInfo", strAuthType);
		onDisplayAuthType(false);
		
		validateAuthDataBtn(true);
	});
}

// 사용자 사진 저장 버튼 클릭
function onUSINB_btnPictureSaveClick( /* cpr.events.CMouseEvent */ e) {
	
	var userPicture = app.lookup("USINB_imgUserPicture");
	if (userPicture.src == null || userPicture.src.length == 0) {
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
	submission.action = "/v1/users/" + userInfo.getValue("ID") + "/picture";
	comLib.showLoadMask("", dataManager.getString("Str_UserPhotoSave"), "", 0);
	submission.send();
}

// 사용자 사진 등록 종료
function onSmsUserPhotoUpdateSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_UserPhotoSave"));
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 사용자 사진 등록 실패
function onSmsUserPhotoUpdateSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR)
}

// 사용자 사진 등록 타임아웃
function onSmsUserPhotoUpdateSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT)
}

function checkReduplicationResult(uniqueID) {
	var result = false;
	var strErrMsg = "";
	
	var userInfo = app.lookup("UserInfo");
	var dmProcessInfo = app.lookup("ProcessInfo");
	var _ReDuplicationResult = dmProcessInfo.getValue("_ReDuplicationResult");
	
	var editMode = dmProcessInfo.getValue("EditMode");
	
	if (uniqueID.toString().length > 0) { // 유니크 아이디를 입력 한 경우
		
		if (editMode = 'Modify') { // 사용자 수정인 경우
			
			if (_ReDuplicationResult == 'None') { // 중복 체크 시도 안한 경우
				if (uniqueID != dmProcessInfo.getValue("_OldUniqueID")) { // 유니크 아이디를 변경한 경우						
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
		} else if (editMode = 'Add') { // 사용자 추가인 경우
			if (_ReDuplicationResult == 'None') { // 중복 체크 안함
				result = false;
				strErrMsg = dataManager.getString("Str_TryUserUniqueIDDuplicateCheck");
			} else if (_ReDuplicationResult == 'ReDu') {
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

function validateUserInfo() {
	var dmUserInfo = app.lookup("UserInfo");
	var checkResult;
	var checkResult1;
	var option = dataManager.getClientOption();
	
	// 사용자 이름 입력 여부 체크
	var userName = dmUserInfo.getValue("Name");
	if (userName.length == 0) {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_InvalidUserName"));
		return false;
	}
	if (userName.replace(/(\s*)/g, "") == "") {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_InvalidUserNameBlank"));
		return false;
	}
	
	//유니크 ID
	var UniqueID = app.lookup("USINB_ipbUniqueID").value;
	var UniqueIDRequiredflag = option.getValue("UserUniqueIDRequired");
	
	if (UniqueIDRequiredflag == 1) {
		checkResult = StrLib.isEmpty2(UniqueID);
		if (checkResult == true) {
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_UserUniqueIDRequired"));
			return false;
		}
	}
	
	//그룹
	var UserGroup = app.lookup("USINT_cmbGroup").value;
	var GroupRequiredflag = option.getValue("UserGroupRequired");
	
	if (GroupRequiredflag == 1) {
		checkResult = StrLib.isEmpty3(UserGroup);
		if (checkResult == true) {
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_UserGroupRequired"));
			return false;
		}
	}
	
	//출입그룹
	var UserAccessGroup = app.lookup("US_INT_cmbAccessGroup").value;
	var AccessGroupRequiredflag = option.getValue("UserAccessGroupRequired");
	
	if (AccessGroupRequiredflag == 1) {
		checkResult = StrLib.isEmpty3(UserAccessGroup);
		if (checkResult == true) {
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_UserAccessGroupRequired"));
			return false;
		}
	}
	
	//근태
	var UserSchedule = app.lookup("US_INT_cmbTNA").value;
	var UserScheduleCodeRequiredflag = option.getValue("UserScheduleCodeRequired");
	
	if (UserScheduleCodeRequiredflag == 1) {
		checkResult = StrLib.isEmpty3(UserSchedule);
		if (checkResult == true) {
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_UserScheduleCodeRequired"));
			return false;
		}
	}
	
	//식수
	var UserMealCode = app.lookup("US_INT_cmbMeal").value;
	var UserMealCodeRequiredflag = option.getValue("UserMealCodeRequired");
	
	if (UserMealCodeRequiredflag == 1) {
		checkResult = StrLib.isEmpty3(UserMealCode);
		if (checkResult == true) {
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_UserMealCodeRequired"));
			return false;
		}
	}
	
	//시급
	var UserSalaryCode = app.lookup("US_INT_cmbMoney").value;
	var UserSalaryCodeRequiredflag = option.getValue("UserSalaryCodeRequired");
	
	if (UserSalaryCodeRequiredflag == 1) {
		checkResult = StrLib.isEmpty3(UserSalaryCode);
		if (checkResult == true) {
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_UserSalaryCodeRequired"));
			return false;
		}
	}
	
	//이메일
	var UserEmail = app.lookup("US_INT_ipbEmail").value;
	var EmailRequiredflag = option.getValue("UserEmailRequired");
	
	if (EmailRequiredflag == 1) {
		checkResult = StrLib.isEmpty2(UserEmail);
		checkResult1 = StrLib.isEmpty4(UserEmail);
		if (checkResult == true) {
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_UserEmailRequired"));
			return false;
		}
		if (checkResult1 == true) {
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_UserEmailBlank"));
			return false;
		}
		
	}
	
	//직급
	var UserPosition = app.lookup("US_INT_cmbPosition").value;
	var UserPositionRequiredflag = option.getValue("UserPositionRequired");
	
	if (UserPositionRequiredflag == 1) {
		checkResult = StrLib.isEmpty3(UserPosition);
		if (checkResult == true) {
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_UserPositionRequired"));
			return false;
		}
	}
	
	//휴대폰번호
	var UserMobile = app.lookup("US_INT_Mobile").value;
	var UserMobileRequiredflag = option.getValue("UserMobileRequired");
	
	if (UserMobileRequiredflag == 1) {
		checkResult = StrLib.isEmpty2(UserMobile);
		checkResult1 = StrLib.isEmpty4(UserMobile);
		if (checkResult == true) {
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_UserMobileRequired"));
			return false;
		}
		if (checkResult1 == true) {
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_UserMobileBlank"));
			return false;
		}
	}
	
	//부서 
	var UserDepartment = app.lookup("US_INT_ipbDepartment").value;
	var DepartmentRequiredflag = option.getValue("UserDepartmentRequired");
	
	if (DepartmentRequiredflag == 1) {
		checkResult = StrLib.isEmpty2(UserDepartment);
		checkResult1 = StrLib.isEmpty4(UserDepartment);
		if (checkResult == true) {
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_UserDepartmentRequired"));
			return false;
		}
		if (checkResult1 == true) {
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_UserDepartmentBlank"));
			return false;
		}
	}
	
	/* 유니크 아이디는 필수 항목이 아닙
	var userUniqueID = dmUserInfo.getValue("UniqueID");
	if( userUniqueID.length == 0 ){
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_InvalidUniqueID"));
		return;
	}
	* */
	
	// 인증 수단 설정 여부 확인
	/*
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
	* */
	
	// 인증수단에 지문 설정 시 실제 지문을 입력했는지 확인 .. 서버에서 사용자 등록/수정 구분하여 확인.
	if (IsExistAuthType(AuthTypeFingerPrint) == true) {
		/*
		var dsUserFPInfo = app.lookup("UserFPInfo");		
		if( dsUserFPInfo.getRowCount() == 0 ){
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_FPDataNotExist"));
			return false;
		}
		*/
	}
	
	// 인증수단에 어룩ㄹ 설정 시 실제 얼굴를 입력했는지 확인  ... 서버에서 사용자 등록/수정 구분하여 확인 하도록 수정.
	if (IsExistAuthType(AuthTypeFace) == true) {
		/*
		var dsUserFaceInfo = app.lookup("UserFaceInfo");		
		if( dsUserFaceInfo.getRowCount() == 0 ){
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_FaceDataNotExist"));
			return false;
		}
		*/
	}
	
	// 인증수단에 비밀번호 설정 시 실제 비밀번호를 입력했는지 확인 
	if (IsExistAuthType(AuthTypePassword) == true) {
		/*	var userPassword = dmUserInfo.getValue("Password");
			if( userPassword.length == 0 ){
				dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_InvalidPassword"));
				return false;
			}*/
	}
	
	// 인증수단에 카드 설정 시 실제 카드를 입력했는지 확인
	if (IsExistAuthType(AuthTypeCard) == true) {
		var dsUserCardInfo = app.lookup("UserCardInfo");
		var count = dsUserCardInfo.getRowCount();
		for (var index = 0; index < count; index++) {
			var cardInfo = dsUserCardInfo.getRow(index);
			if (cardInfo.getValue("CardNum").length == 0) {
				dsUserCardInfo.deleteRow(index);
			}
		}
		dsUserCardInfo.commit();
		if (oem_version != OEM_SS_HOSPITAL && oem_version != OEM_KANGWONLAND) {
			/*	if( dsUserCardInfo.getRowCount() == 0 ){
					dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_CardDataNotExist"));
					return false;
				}
				* 			*/
		}
	}
	
	if (IsExistAuthType(AuthTypeMobileCard) == true && oem_version != OEM_HYUNDAI_MSEAT) {
		if (dmUserInfo.getValue("Email").length == 0) {
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_MobileCardEmailRequired"));
			return false
		}
		if (dmUserInfo.getValue("Mobile").length < 11) {
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_MobileCardMobileRequired"));
			return false;
		}
	}
	
	if (Checkloginpassword() == false) {
		
		return false;
	}
	
	return true;
}

// 사용자 정보 저장 버튼 클릭
function onUSINB_btnUserSaveClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var uSINB_btnUserSave = e.control;
	
	var dsModifiedTap = app.lookup("ModifiedTap");
	var dmUserInfo = app.lookup("UserInfo");
	
	//협박지문 데이터 정렬
	var duressFinger = dmUserInfo.getValue("DuressFinger");
	
	if (duressFinger) {
		var array = duressFinger.split(",");
		
		var count = array.length;
		for (var i = 0; count < 8; i++) {
			if (duressFinger.length != 0) {
				duressFinger += ",";
			}
			duressFinger += 0;
			count++;
		}
		
		dmUserInfo.setValue("DuressFinger", duressFinger);
	}
	
	var uniqueID = dmUserInfo.getValue("UniqueID");
	// 로그인 id 체크
	var SendResult = checkReduplicationResult(uniqueID); // UniqueID  중복 체크 
	
	if (oem_version == OEM_BLUEHOUSE_KR) { // pri_no 중복 체크 - zzik
		var udcUserInfo = app.lookup("userInfoCustomLayout").getChild("UserInfoCustomBH");
		var priNo = udcUserInfo.getBHUserCustomInfoPriNo();
		var BHResult = udcUserInfo.checkBHPriNoduplicationResult(priNo)
		console.log("BHResult : " + BHResult);
		if (BHResult[0] != true) {
			dialogAlert(app, dataManager.getString("Str_Waning"), BHResult[1]);
			return;
		}
		
	}
	
	if (SendResult[0] == true) {
		if (validateUserInfo() == false) {
			return;
		}
		var dsUserBuildingElevator = app.lookup("UserBuildingElevatorSet");
		if (oem_version == OEM_UMS_QRCODE) { // qrcode 사용시 유니크 아이디 필수 체크
			//유니크 ID
			var UniqueID = app.lookup("USINB_ipbUniqueID").value;
			var checkResult = false;
			if (IsExistAuthType(30) == true) {
				checkResult = StrLib.isEmpty2(UniqueID);
				if (checkResult == true) {
					dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_UserUniqueIDRequired"));
					return false;
				}
			}
		} else if (oem_version == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH) {
			// 차량 번호 공백 제거 후, 공백만 입력된 경우 경고 팝업 생성
			var dsUserCars = app.lookup("UserCarInfo");
			var len = dsUserCars.getRowCount();
			
			for (var i = 0; i < len; i++){
				var carNum = dsUserCars.getValue(i, "CarNumber").toString();
				carNum = carNum.replace(/(\s*)/g, ""); // 육본 UI와 동일하게 전체에서 공백 입력 없앰
				//carNum = carNum.trim();
				//console.log("/" + carNum + "/");
				if (carNum.length == 0){ // 공백만 입력한 경우, 입력이 없는 경우 
					dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_UserCarNumberBlank"));
					return false;
				}
				dsUserCars.setValue(i, "CarNumber", carNum);
			}
		} else if (oem_version == OEM_MULTI_BUILDING_MAMAGEMENT){
			dsUserBuildingElevator.clear();
			var dsElevatorSetList = app.lookup("ElevatorSetList");
			for (var i = 0; i < dsElevatorSetList.getRowCount(); i++){
				var buildingCode = dsElevatorSetList.getValue(i, "ElevatorSetID");
				var strACFloor = "";
				var arrFloor = floorMap.get(buildingCode);
				if(arrFloor != null && arrFloor.length > 0){
					for (var j = 0; j < arrFloor.length; j++) {
						strACFloor += arrFloor[j]
						if (j < arrFloor.length-1){
							strACFloor += ","							
						}
					}
				}
				dsUserBuildingElevator.addRowData({
					"BuildingCode": buildingCode,
					"AccessFloor": strACFloor
				})			
			}
		}

		var voipUse = dmUserInfo.getValue("VoipUse");
		
		var doorOpenDuringCall = app.lookup("US_INT_cbxDoorOpenDuringCall").checked == true ? 1 : 0;
		dmUserInfo.setValue("VoipDoorOpen", doorOpenDuringCall);
		var doorOpenReceivingCall = app.lookup("US_INT_cbxDoorOpenReceivingCall").checked == true ? 1 : 0;
		dmUserInfo.setValue("VoipAutoAnswer", doorOpenReceivingCall);
		
		var dmProcessInfo = app.lookup("ProcessInfo");
		var registDate = dmUserInfo.getValue("RegistDate"); //db에서 없으면 000000
		
		if (registDate.toString().length <= 10) { //YYYYMMDDHHmmss // 포멧형식을 바꿔야 할꺼 같아 
			registDate = registDate.toString() + " 00:00:00.000";
		}
		
		dmUserInfo.setValue("RegistDate", registDate.toString());
		var expireDate = dmUserInfo.getValue("ExpireDate"); // + " 23:59:59.000";
		
		if (expireDate.toString().length <= 10) { //YYYY-MM-DD 
			expireDate = expireDate.toString() + " 23:59:59.000";
		}
		
		dmUserInfo.setValue("ExpireDate", expireDate);
		
		// 로그인 비밀번호 추가.
		dmUserInfo.setValue("LoginPW", app.lookup("US_INT_ipbLoginPW").value);
		
		var userPicture = app.lookup("USINB_imgUserPicture");
		if (userPicture.src != "theme/images/common/common_black_img_180.png") {
			var imageData = userPicture.src.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
			dmUserInfo.setValue("Picture", imageData);
		}
		
		comLib.showLoadMask("", dataManager.getString("Str_UserRegist"), "", 0);
		
		if (oem_version == OEM_MOTORCYCLE_PARK) {
			//베트남 오토바이  주차관제일때 CarInfo 업데이트
			var udcUserCarInfo = app.lookup("userInfoCustomLayout").getChild("UserInfoCustomMCP");
			var udcUserCarInfoDS = udcUserCarInfo.getMCPUserCarInfo();
			app.lookup("UserCarInfo").build(udcUserCarInfoDS);
			console.log(app.lookup("UserCarInfo").getRowDataRanged());
		} else if (oem_version == OEM_Elca) {
			var udcUserTypeInfo = app.lookup("userInfoCustomLayout").getChild("UserInfoCustomElca");
			var userType = udcUserTypeInfo.getUserTypeElca();
			dmUserInfo.setValue("UserType", userType);
		}
		
		// 생년월일 추가
		// var birthday = dmUserInfo.getValue("Birthday");
		// if (birthday.toString().length <= 10 && birthday.toString().length > 1) { //YYYYMMDD
		//	birthday = birthday.toString() + " 00:00:00";
		// }
		//dmUserInfo.setValue("Birthday", birthday.toString());
		
			var modifiedTap = "";
			if(modifiedList[4]){ // 기본 탭 수정 여부
				if(modifiedTap.length > 0){
					modifiedTap += "/"
				}
				modifiedTap += dataManager.getString("Str_Basic");
			}
			if(modifiedList[5]){ // 인증 탭 수정 여부
				if(modifiedTap.length > 0){
					modifiedTap += "/"
				}
				modifiedTap += dataManager.getString("Str_Authentication");
			}
			if(modifiedList[6]){ // 출입 탭 수정 여부
				if(modifiedTap.length > 0){
					modifiedTap += "/"
				}
				modifiedTap += dataManager.getString("Str_Access");
			}
			if(modifiedList[7]){ // 관리 탭 수정 여부
				if(modifiedTap.length > 0){
					modifiedTap += "/"
				}
				modifiedTap += dataManager.getString("Str_Management");
			}
			if(modifiedList[8]){ // 기타 탭 수정 여부
				if(modifiedTap.length > 0){
					modifiedTap += "/"
				}
				modifiedTap += dataManager.getString("Str_Etc");
			}
		
			app.lookup("ModifiedTap").setValue("ModifiedTap", modifiedTap);
			//console.log(app.lookup("ModifiedTap").getValue("ModifiedTap"));			
		
		if (dmProcessInfo.getValue("EditMode") == 'Modify') { // 사용자 수정. update submission 적용 
			var submission = app.lookup("smsUserInfoUpdate");
			
			var oemVersion = dataManager.getOemVersion();
			if(oemVersion == OEM_ITONE_TRDATA || oemVersion == OEM_ITONE_POSCO_DX){
				// 유니크아이디 중복 허용 및 로그인아이디 추가
				submission.action = "/v1/itone/users/" + dmUserInfo.getValue("ID");
				var loginID = app.lookup("UserLoginID").getLoginIDValue();
				dmUserInfo.addColumn(new cpr.data.header.DataHeader("LoginID", "string"), loginID);
				
				
			} else {
				submission.action = "/v1/users/" + dmUserInfo.getValue("ID");
			}
			
			if (oem_version == OEM_MULTI_BUILDING_MAMAGEMENT){
				submission.addRequestData(dsUserBuildingElevator);
			} else if (oem_version == OEM_HYUNDAI_HI){
				var PartnerInfo = app.lookup("PartnerHDHI");
				var udcUserInfo = app.lookup("userInfoCustomLayout").getChild("UserInfoCustomHDHI");
				var udcUserCustomHDHI = udcUserInfo.getUserCustomHDHI();
				PartnerInfo.setValue("PartnerID", udcUserCustomHDHI.getValue("PartnerID"));
				submission.addRequestData(PartnerInfo);
			}
			submission.send();
		} else if (dmProcessInfo.getValue("EditMode") == 'Add') { // 사용자 등록 Regist submission				
			var submission = app.lookup("smsUserInfoAdd");
			//submission.setParameters("userID", +dmUserInfo.getValue("ID"));
			submission.action = "/v1/users";
			
			if (oem_version == OEM_MULTI_BUILDING_MAMAGEMENT){
				submission.addRequestData(dsUserBuildingElevator);
			} else if (oem_version == OEM_HYUNDAI_HI){
				var PartnerInfo = app.lookup("PartnerHDHI");
				var udcUserInfo = app.lookup("userInfoCustomLayout").getChild("UserInfoCustomHDHI");
				var udcUserCustomHDHI = udcUserInfo.getUserCustomHDHI();
				PartnerInfo.setValue("PartnerID", udcUserCustomHDHI.getValue("PartnerID"));
				submission.addRequestData(PartnerInfo);
			}
			
			submission.send();
		}
	} else {
		dialogAlert(app, dataManager.getString("Str_Waning"), SendResult[1]);
	}
}

// 사용자 정보 저장 완료
function onSmsUserInfoUpdateSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var dmProcessInfo = app.lookup("ProcessInfo");
	dmProcessInfo.setValue("_ReDuplicationResult", 'None');
	dmProcessInfo.setValue("_OldUniqueID", app.lookup("UserInfo").getValue("UniqueID"));
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
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
		if (pwd.toString().length >= 4 && pwd != "****") { //**** 아니고 4자리 이상이면
			app.lookup("UserInfo").setValue("LoginPW", "****");
		}
		app.lookup("UserFaceInfo").clear(); // 저장완료후 Face 정보를 비워준다.
		
		app.getHostAppInstance().dispatchEvent(commandEvent);
		
		// 저장 성공하면 초기화
		modifiedList = [false,false,false,false,false,false,false,false,false];
		
		if (oem_version == OEM_SS_HOSPITAL) {
			//삼성병원 생일 자료 업데이트 (생일만이다.)
			var smsPostSSHInfo = app.lookup("smspostUserCustomSSH");
			var dmUserCustomSSH = app.lookup("UserCustomSSH");
			var udcUserInfo = app.lookup("userInfoCustomLayout").getChild("UserInfoCustomSSH");
			var birthday = udcUserInfo.getSSHUserBirthday();
			dmUserCustomSSH.setValue("Birthday", birthday);
			smsPostSSHInfo.action = "/v1/ssh/users/" + app.lookup("UserInfo").getValue("ID");
			smsPostSSHInfo.send();
			return;
		} else if (oem_version == OEM_MOTORCYCLE_PARK) {
			var udcUserCarInfo = app.lookup("userInfoCustomLayout").getChild("UserInfoCustomMCP");
			udcUserCarInfo.setMCPUserInfo(app.lookup("UserInfo").getValue("ID"), "Modify");
			
			// 주차 관제 커스텀 - zzik 
			do_submit_postPutBPARKUser();
			
		} else if (oem_version == OEM_DJMCITYHALL) { // 대전시청 
			var udcUserInfo = app.lookup("userInfoCustomLayout").getChild("UserInfoCustomDJMCH");
			var userInfoEx = udcUserInfo.getDJMCHUserInfoEx();
			var ipbUserID = app.lookup("USINB_ipbUserID");
			var ipbUniqueID = app.lookup("USINB_ipbUniqueID");
			var ipbUniqueID2 = userInfoEx.getValue("UniqueID2");
			var nSyncFlag = userInfoEx.getValue("SyncFlag");
			
			var smsPutDjmchUser = app.lookup("sms_putDjmchUser");
			smsPutDjmchUser.action = "/v1/djmch/user/" + ipbUserID.value;
			var djmchUser = app.lookup("DjmchUser");
			djmchUser.setValue("UserID", parseInt(ipbUserID.text, 10));
			djmchUser.setValue("UniqueID", ipbUniqueID.text);
			djmchUser.setValue("UniqueID2", ipbUniqueID2);
			djmchUser.setValue("SyncFlag", nSyncFlag);
			smsPutDjmchUser.send();
		} else if (oem_version == OEM_HC_SAUDI_MARJAN) {
			//wogus
			//마잔향 업데이트(PUT) 요청 생성하여 전송
			do_submit_postPutHCSMUser();
		} else if (oem_version == OEM_BLUEHOUSE_KR) {
			var udcUserInfo = app.lookup("userInfoCustomLayout").getChild("UserInfoCustomBH");
			var oldBHUserInfo = app.lookup("BHUser")
			var newBHUserInfo = udcUserInfo.getBHUserCustomInfo();
			
			//			console.log("oldBHUserInfo : " + JSON.stringify(oldBHUserInfo.getDatas()));
			//			console.log("newBHUserInfo : " + JSON.stringify(newBHUserInfo.getDatas()));
			
			oldBHUserInfo.clear();
			newBHUserInfo.copyToDataMap(oldBHUserInfo);
			
			oldBHUserInfo.setValue("UserID", app.lookup("UserInfo").getValue("ID"));
			if (oldBHUserInfo.getValue("PriNo") == "") {
				oldBHUserInfo.setValue("PriNo", 0);
			}
			
			var smsPostPutBHUser = app.lookup("sms_postPutBHUserPriNoUpdate");
			smsPostPutBHUser.action = "/v1/bluehouse/users";
			
			comLib.showLoadMask("", dataManager.getString("Str_UserRegist"), "", 0);
			smsPostPutBHUser.send();
			
		} else if (oem_version == OEM_HYUNDAI_HI){ // 현대 중공업 신분증 사진, 증명사진 저장
			if (updateCustomPicture){
				var smsPostCustomHDHI = app.lookup("sms_postPictureCustomHDHI");
				smsPostCustomHDHI.action = "/v1/hdhi/users/picture/" + app.lookup("UserPictureCustomHDHI").getValue("UserID");
				smsPostCustomHDHI.send();
				return				
			} else {
				var dmUserCustomHDHI = app.lookup("UserCustomHDHI");
				var udcUserInfo = app.lookup("userInfoCustomLayout").getChild("UserInfoCustomHDHI");
				var newUserCustomHDHI = udcUserInfo.getUserCustomHDHI();
				
//				dmUserCustomHDHI.setValue("PartnerID", newUserCustomHDHI.getValue("PartnerID"));
				dmUserCustomHDHI.setValue("Nationality", newUserCustomHDHI.getValue("Nationality"));
				
				var smsPostCustomHDHI = app.lookup("sms_postCustomHDHI");
				smsPostCustomHDHI.action = "/v1/hdhi/users/" + app.lookup("USINB_ipbUserID").value;
				smsPostCustomHDHI.send();
				return
			}
		} else if (oem_version == OEM_ALMARAI_AUTHINFO) {
			var udcUserInfo = app.lookup("userInfoCustomLayout").getChild("UserInfoCustomALMARAI");
			var description = udcUserInfo.getUserDescriptionInfoALMARAI();
			var userID = app.lookup("USINB_ipbUserID").value;
			var almaraiUser = app.lookup("UserDescription");
			almaraiUser.setValue("UserID", Number(userID));
			almaraiUser.setValue("Description", description);
			var smsPostPutAlmaraiDescription = app.lookup("sms_postPutAlmaraiDescription");
			smsPostPutAlmaraiDescription.action = "/v1/oemData/almarai/description";
			comLib.showLoadMask("", dataManager.getString("Str_UserRegist"), "", 0);
			smsPostPutAlmaraiDescription.send();
		} 
		
		// 저장 성공하면 초기화
		modifiedList = [false,false,false,false,false,false,false,false,false];
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_UserUpdate"));
		
		var oemVersion = dataManager.getOemVersion();
		if(oemVersion == OEM_ITONE_TRDATA || oemVersion == OEM_ITONE_POSCO_DX) {
			var dmUserInfo = app.lookup("UserInfo");
			dmUserInfo.deleteColumn("LoginID");
		}
	} else {
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_UserUpdate";
		if (resultCode == ErrorUserOldLoginPasswordDuplicate) {
			errMsg = dataManager.getString(errStr) + "\n" + dataManager.getString("Str_WarningPasswordOption");
		} else if (resultCode == ErrorUserSimilarFingerprint || resultCode == ErrorUserSimilarCard || resultCode == ErrorUserSimilarFace) {
			var DuplicateID = app.lookup("DuplicateInfo").getValue("DuplicateID");
			errMsg = dataManager.getString(errStr) + "\n" +
			dataManager.getString("Str_UserID") + " : " + DuplicateID + " (" +
			app.lookup("DuplicateInfo").getValue("DuplicateName") + DuplicateID + ")";
		} else if (resultCode == 0x7F000020 && (dataManager.getOemVersion() == OEM_ITONE_TRDATA)) {
			
			// ITONE SFTP로 동일한 이름의 파일 변경 권한이  UNION 계정에 없어서 파일 변경은 실패했지만, 실제 저장은 성공했으므로 성공으로 return
			console.log("SFTP : 사용자 프로필 사진 업데이트는 union SFTP 계정에 권한부여가 필요합니다.");
			modifiedList = [false,false,false,false,false,false,false,false,false];
			dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_UserUpdate"));
			comLib.hideLoadMask();
			return;
		} else {
			if (errStr.length > 0) {
				errMsg = dataManager.getString(errStr);
			} else {
				errMsg = dataManager.getString(errMsg);
			}
		}
		
		var oemVersion = dataManager.getOemVersion();
		if(oemVersion == OEM_ITONE_TRDATA || oemVersion == OEM_ITONE_POSCO_DX) {
			var dmUserInfo = app.lookup("UserInfo");
			dmUserInfo.deleteColumn("LoginID");
		}
		
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
		
	}
	comLib.hideLoadMask();
}

// 사용자 정보 실패
function onSmsUserInfoUpdateSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

// 사용자 정보 저장 타임아웃
function onSmsUserInfoUpdateSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

// 지문 수정 버튼 클릭
function onUSINT_btnFPModifyClick( /* cpr.events.CMouseEvent */ e) {
	var userInfo = app.lookup("UserInfo");
	var duressFinger = new Array();
	var appld = "app/main/users/UserFingerRegist" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {
		width: 640,
		height: 490
	}, function(dialog) {
		
		/* 기본적으로는 사용자 지문 등록 창에서 서버에 사용자 지문을 요청
		 * 등록된 지문이 없는 사용자이지만 지문 등록 화면을 열어 지문을 캡쳐하고 서버에 저장 전인 사용자인 경우 지문 등록창 재 진입시 이전에 캡쳐했지만 서버 저장전인 지문 정보를 전달한다.		 */
		var dsUserFpInfo = app.lookup("UserFPInfo");
		
		// 협박 지문 인자로 전달
		var duressFinger = userInfo.getValue("DuressFinger");
		console.log("duressFinger : " + duressFinger);
		if (duressFinger) {
			duressFinger = duressFinger.split(",");
		}
		
		dialog.bind("headerTitle").toLanguage("Str_FingerRegist");
		dialog.initValue = {
			"UserID": userInfo.getValue("ID"),
			"Url": "/v1",
			"FPModified": USINT_fpModified,
			"UserFPInfo": dsUserFpInfo,
			"DuressFinger": duressFinger
		};
		dialog.resizable = false;
		dialog.modal = true;
	}).then(function(returnValue) { // 지문 등록 화면에서 적용을 누른 경우에만 이 부분으로 들어옴.
		USINT_fpModified = 1; // 사용자가 지문을 수정한 경우 다음번 지문 편집창을 열때는 수정된 데이터로 표시
		
		var dsUserFpInfo = app.lookup("UserFPInfo");
		dsUserFpInfo.clear();
		
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
		
		for (; count < 8; count++) {
			if (duress.length != 0) {
				duress += ",";
			}
			duress += 0;
		}
		
		userInfo.setValue("DuressFinger", duress);
		modifiedList[5] = true;
		//console.log(modifiedList);
	});
}

// 사용자 얼굴 편집 버튼 클릭
function onUSINT_btnFAModifyClick( /* cpr.events.CMouseEvent */ e) {
	var userInfo = app.lookup("UserInfo");
	
	var UserFaceInfoList = app.lookup("UserFaceInfo");
	var NewUserFaceInfoList = UserFaceInfoList.findAllRow("status == 1");
	var data = [];
	if (NewUserFaceInfoList != null || NewUserFaceInfoList != undefined) {
		for (var i = 0; i < NewUserFaceInfoList.length; i++) {
			data.push(NewUserFaceInfoList[i].getRowData());
		}
	}
	var dmProcessInfo = app.lookup("ProcessInfo");
	
	var appld = "app/main/users/UserFaceRegist" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {
		width: 680,
		height: 600
	}, function(dialog) {
		dialog.initValue = {
			
			"Mode": dmProcessInfo.getValue("EditMode"),
			"ID": app.lookup("USINB_ipbUserID").value,
			"FaceDatas": data,
			"Url": "/v1"
		};
		
		dialog.bind("headerTitle").toLanguage("Str_FaceRegist");
		dialog.modal = true;
	}).then(function(result) {
		var dsUserFaceInfo = app.lookup("UserFaceInfo");
		dsUserFaceInfo.clear();
		result["Face"].copyToDataSet(dsUserFaceInfo);
		
		var dsUserFacePhoto = app.lookup("UserFacePhoto");
		dsUserFacePhoto.clear();
		result["Photo"].copyToDataSet(dsUserFacePhoto);
		
		
		modifiedList[5] = true;
		//console.log(modifiedList);
	});
}

// 사용자 얼굴 데이터(WalkThrough) 편집 클릭
function onUSINT_btnFAWModifyClick( /* cpr.events.CMouseEvent */ e) {
	
	var dsUserFaceWTInfo = app.lookup("UserFaceWTInfo"); // 현재는 1장의 사진을 사용.. 추후 여러 장을 등록하게 될 경우를 대비해서 맵이 아닌 셋으로 구성
	
	var dmProcessInfo = app.lookup("ProcessInfo");
	
	console.log(dmProcessInfo.getValue("EditMode"));
	
	var appld = "app/main/users/UserFaceWTRegist" + "?" + usint_version;
	var width = 780;
	var height = 500;
	if (oem_version == OEM_HYUNDAI_HI){
		appld = "app/custom/hyundai_hi/users/UserFaceWTRegist" + "?" + usint_version;
		width = 1500;
		height = 500;		
	}
	app.getRootAppInstance().openDialog(appld, {
		width: width,
		height: height
	}, function(dialog) {
		if (oem_version == OEM_HYUNDAI_HI){
			dialog.initValue = {
				"Mode": dmProcessInfo.getValue("EditMode"),
				"ID": app.lookup("USINB_ipbUserID").value,
				"FaceDatas": dsUserFaceWTInfo.getRowDataRanged(),
				"Url": "/v1",
				"AgreeDate": app.lookup("UserCustomHDHI").getValue("AgreeDate"),
				"AgreeFlag": app.lookup("UserCustomHDHI").getValue("AgreeFlag")
			};
		} else {
			dialog.initValue = {
				"Mode": dmProcessInfo.getValue("EditMode"),
				"ID": app.lookup("USINB_ipbUserID").value,
				"FaceDatas": dsUserFaceWTInfo.getRowDataRanged(),
				"Url": "/v1"
			};
		}
		
		dialog.bind("headerTitle").toLanguage("Str_FaceWRegist");
		dialog.modal = true;
	}).then(function(returnValue) {
		// 프로필 사진 등록 기능 추가 작업  - otk
		var dsUserFaceWTInfo = app.lookup("UserFaceWTInfo");
		var dsUserCustomHDHI = app.lookup("UserCustomHDHI");
		//console.log(returnValue);
		if (returnValue["TemplateData"] != null) {
			dsUserFaceWTInfo.clear();
			var picTemplate = returnValue["TemplateData"];
			dsUserFaceWTInfo.addRowData(picTemplate);
			modifiedList[5] = true;
			//console.log(modifiedList);
		}
		if (returnValue["PictureData"] == null && returnValue["TemplateData"] != null) {
			returnValue["PictureData"] = returnValue["TemplateData"];
		}
		if (returnValue["PictureData"] != null) {
			var picUser = returnValue["PictureData"];
			var ImgPicUser = JSON.stringify(picUser["TemplateData"]);
			
			/*
			//var Imgdate = ImgPicUser.replaceAll("\"", "");
			var Imgdate = ImgPicUser.replace(/\"/gi, "");
			var userPicture = app.lookup("USINB_imgUserPicture");
			resizeImage(userPicture, Imgdate, 160, 160);
			userPicture.putValue('data:image/png;base64,' + Imgdate);
			*/
			if(oem_version != OEM_DMCC_NOPICTURE){
				var Imgdate = ImgPicUser.replace(/\"/gi, "");
				Imgdate = "data:image/jpeg;base64," + Imgdate;
				
				var userPicture = app.lookup("USINB_imgUserPicture");
				resizeImage(userPicture, Imgdate, 160, 160);
			}
			
			var thumbnailImg = app.lookup("thumbnail");
			resizeImage(thumbnailImg, Imgdate, 80, 80);
			
			if (oem_version == OEM_HYUNDAI_HI){
				console.log(returnValue["UserCustomHDHI"]);
				var agreeFlag = returnValue["UserCustomHDHI"].AgreeFlag;
				var agreeDate = returnValue["UserCustomHDHI"].AgreeDate;
				if (agreeFlag != dsUserCustomHDHI.getValue("AgreeFlag")){
					dsUserCustomHDHI.setValue("AgreeFlag", agreeFlag);					
				}
				
				if (agreeDate != dsUserCustomHDHI.getValue("AgreeDate")){
					dsUserCustomHDHI.setValue("AgreeDate", agreeDate);									
				}
			}
			modifiedList[5] = true;
			//console.log(modifiedList);
		}
		
		if (oem_version == OEM_HYUNDAI_HI){
			if (returnValue["CustomPicture"] != null){
				var dmPictureCustom = app.lookup("UserPictureCustomHDHI");
				dmPictureCustom.build(returnValue["CustomPicture"]);
				console.log(dmPictureCustom.getDatas());
				updateCustomPicture = true;				
			}
		}
		
		//if (returnValue["TemplateData"] != "") {
		//	dsUserFaceWTInfo.clear();
		//	dsUserFaceWTInfo.addRowData(returnValue);
		//}
		
	});
	
}

// 버튼(USINT_btnIrisModify)에서 click 이벤트 발생 시 호출.
function onUSINT_btnIrisModifyClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var uSINT_btnIrisModify = e.control;
	var dsUserIrisInfo = app.lookup("UserIrisInfo"); // 
	
	var appld = "app/main/users/UserIrisRegist" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {
		width: 600,
		height: 500
	}, function(dialog) {
		dialog.initValue = {
			"ID": app.lookup("USINB_ipbUserID").value,
			"Url": "/v1",
			"IrisDatas": dsUserIrisInfo.getRowDataRanged(),
		};
		dialog.bind("headerTitle").toLanguage("Str_IrisRegist");
		dialog.modal = true;
	}).then(function(returnValue) {
		if (returnValue) {
			var dsUserIrisInfo = app.lookup("UserIrisInfo");
			dsUserIrisInfo.clear();
			returnValue.copyToDataSet(dsUserIrisInfo);
			
			modifiedList[5] = true;
			//console.log(modifiedList);	
		}
	});
	
}
/*
function onUSINT_btnMCIssueClick(/* cpr.events.CMouseEvent  e){
	/** @type cpr.controls.Button	 
	var uSINT_btnMCIssue = e.control;
	var appld = "app/main/mobileCard_old/mobileCardIssue" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {width : 420, height : 150}, function(dialog){		
		dialog.modal = true;		
	}).then(function(returnValue){
		//console.log("MobileCard issue result :", returnValue);
	});	
}
*/
function onUSINT_btnMCModifyClick( /* cpr.events.CMouseEvent */ e) {
	var LicenseLevel = dataManager.getSystemLicenseLevel()
	if (LicenseLevel >= LicenseSTANDARD) {
		// 모바일 카드 스탠다드 이상으로 변경
		var userInfo = app.lookup("UserInfo");
		var dmProcessInfo = app.lookup("ProcessInfo");
		var appld = "app/main/mobileCard/mobileCardInfo" + "?" + usint_version;
		app.getRootAppInstance().openDialog(appld, {
			width: 420,
			height: 430
		}, function(dialog) {
			dialog.bind("headerTitle").toLanguage("Str_MobileCardSetting");
			dialog.initValue = {
				"uid": userInfo.getValue("ID"),
				"mode": dmProcessInfo.getValue("EditMode"),
				"email": userInfo.getValue("Email"),
				"mobile": userInfo.getValue("Mobile")
			};
			dialog.resizable = false;
			dialog.modal = true;
		}).then(function(returnValue) {
			if (returnValue) {
				var userInfo = app.lookup("UserInfo");
				userInfo.setValue("Email", returnValue.Email);
				userInfo.setValue("Mobile", returnValue.Mobile);
				
				var mobileCardInfo = app.lookup("MobileCardInfo");
				mobileCardInfo.build(returnValue);
				
				modifiedList[5] = true;
				//console.log(modifiedList);
			}
		});
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorLicenseInvalidFunc"));
	}
}

// 사용자 삭제 버튼 클릭시
function onUS_INB_btnUserDeleteClick( /* cpr.events.CMouseEvent */ e) {
	var dmProcessInfo = app.lookup("ProcessInfo");
	if (dmProcessInfo.getValue("EditMode") == 'Add') { // 사용자 추가 모드에서는 삭제 할 수 없음. 사용자 등록 전...				
		return;
	}
	dialogConfirm(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_DeleteConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				var RequestData = app.lookup("smsUserInfoDelete");
				var getID = app.lookup("USINB_ipbUserID").value;
				RequestData.action = "/v1/users/" + getID;
				if (oem_version == OEM_REMOTE_FAW_MANAGEMENT){
					var AuthType = app.lookup("UserInfo").getValue("AuthInfo").split(',');
					for (var i = 0; i < AuthType.length; i++) {
						if (Number(AuthType[i]) == 9){
							RequestData.action += "?option=-1";
							break;
						}
					}
					
				}
				RequestData.send();
			} else {}
		});
	});
}

// 서브미션에서 submit-success 이벤트 발생 시 호출.
function onSmsUserInfoDeleteSubmitSuccess( /* cpr.events.CSubmissionEvent */ e) {
	/** @type cpr.protocols.Submission	 */
	var smsUserInfoDelete = e.control;
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	
	if (ResultCode == 0) {
		var commandEvent = new cpr.events.CUIEvent("execute-command", {
			content: {
				"target": DLG_USER_MANAGEMENT,
				"command": "Delete",
				"userID": app.lookup("USINB_ipbUserID").value
			}
		});
		app.getHostAppInstance().dispatchEvent(commandEvent);
		app.close();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(ResultCode)));
	}
}

// 유니크 아이디 중복 체크 클릭
function onUSINB_btnReduplicationCheckClick( /* cpr.events.CMouseEvent */ e) {
	var uSINB_btnReduplicationCheck = e.control;
	var sendSmsFlag = false;
	var newUniqueID = app.lookup("UserInfo").getValue("UniqueID"); // 화면에 입력한 유니크 아이디
	
	if (newUniqueID == '') {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_InvalidUniqueID"));
		return;
	}
	
	/*
	// 유니크 ID (한글 허용 안함, 숫자와 영문만 허용)
	var USINB_ipbUniqueID = app.lookup("USINB_ipbUniqueID");
	for( var ii=0;ii<USINB_ipbUniqueID.text.length ;ii++ ) {
		
		if(false == CheckEnglishAndDecimal( USINB_ipbUniqueID.text[ii].charCodeAt(0)) )
		{
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_InvalidUniqueID"));		
			return;
		}
	}
	*/
	
	var dmProcessInfo = app.lookup("ProcessInfo");
	var _Mode = dmProcessInfo.getValue("EditMode");
	var _OldUniqueID = dmProcessInfo.getValue("_OldUniqueID");
	
	if (_Mode == 'Modify') {
		if (_OldUniqueID == newUniqueID) {
			dmProcessInfo.setValue("_ReDuplicationResult", 'pass');
			dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_ErrorSameUniqueID"));
			return;
		} else {
			sendSmsFlag = true;
		}
	} else if (_Mode == 'Add') {
		sendSmsFlag = true;
	}
	
	if (sendSmsFlag == true) {
		var RequestData = app.lookup("smsUniqueIDCheckReq");
		RequestData.setParameters("UniqueID", newUniqueID);
		RequestData.send();
	}
}
/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSmsUniqueIDCheckReqSubmitSuccess( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUniqueIDCheckReq = e.control;
	var strMessage = "";
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	var dmProcessInfo = app.lookup("ProcessInfo");
	if (ResultCode == COMERROR_REDUPLICATE_UNIQUEID_EXIST) {
		dmProcessInfo.setValue("_ReDuplicationResult", 'ReDu');
		app.lookup("USINB_ipbUniqueID").focusable = true;
		strMessage = dataManager.getString("Str_UserUniqueIDDuplicated");
		//20190827 정래훈 유니크아이디를 지우고 경고표시
		app.lookup("USINB_ipbUniqueID").value = "";
		inputValidManager.validate(app.lookup("USINB_ipbUniqueID"), "isNull", dataManager.getString("Str_RequiredAlert"));
	} else if (ResultCode == COMERROR_REDUPLICATE_UNIQUEID_NOT_EXIST) {
		dmProcessInfo.setValue("_ReDuplicationResult", 'pass');
		strMessage = dataManager.getString("Str_CanUseUniqueID");
	} else {
		//strMessage = dataManager.getString("Str_CanNotDuplicateCheckUniqueID");
		strMessage = dataManager.getString(getErrorString(ResultCode));
	}
	dialogAlert(app, dataManager.getString("Str_Info"), strMessage);
}
// 단말기 리스트 버튼 클릭
function onUS_INB_btnTerminalListClick( /* cpr.events.CMouseEvent */ e) {
	var dmProcessInfo = app.lookup("ProcessInfo");
	var _Mode = dmProcessInfo.getValue("EditMode");
	var _UserID = app.lookup("UserInfo").getValue("ID");
	
	if (_Mode == 'Add') {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_ErrorUnregiUserNotCheckTerminal"));
		return;
	}
	var appld = "app/main/terminals/popup/terminalTinyListForUser" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {
		width: 800,
		height: 550
	}, function(dialog) {
		dialog.ready(function(dialogApp) {
			dialog.initValue = {
				"ID": _UserID
			};
			dialog.modal = true;
			dialog.headerTitle = dataManager.getString("Str_UserTerminalManagement") + "( ID : " + _UserID + ")";
		});
	}).then(function(returnValue) {
		
	});
}

// 사용자 정보 추가 완료
function onSmsUserInfoAddSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dmProcessInfo = app.lookup("ProcessInfo");
		dmProcessInfo.setValue("EditMode", "Modify");
		app.lookup("USINB_ipbUserID").readOnly = true;
		dmProcessInfo.setValue("_ReDuplicationResult", 'None');
		dmProcessInfo.setValue("_OldUniqueID", app.lookup("UserInfo").getValue("UniqueID"));
		var userInfo = app.lookup("UserInfo");
		var pwd = userInfo.getValue("LoginPW");
		if (pwd.toString().length >= 4 && pwd != "****") { //**** 아니고 4자리 이상이면
			app.lookup("UserInfo").setValue("LoginPW", "****");
		}
		
		app.lookup("UserFaceInfo").clear(); // 저장완료후 Face 정보를 비워준다.
		
		// 저장 성공하면 초기화
		modifiedList = [false,false,false,false,false,false,false,false,false];
		
		if (oem_version == OEM_SS_HOSPITAL) {
			//삼성병원 생일 자료 업데이트 (생일만이다.)
			var smsPostSSHInfo = app.lookup("smspostUserCustomSSH");
			smsPostSSHInfo.action = "/v1/ssh/users/" + userInfo.getValue("ID");
			smsPostSSHInfo.send();
			return;
		} else if (oem_version == OEM_MOTORCYCLE_PARK) {
			var udcUserCarInfo = app.lookup("userInfoCustomLayout").getChild("UserInfoCustomMCP");
			udcUserCarInfo.setMCPUserInfo(userInfo.getValue("ID"), "Modify");
			
			// 주차 관제 커스텀 - zzik 
			do_submit_postPutBPARKUser();
			
		} else if (oem_version == OEM_DJMCITYHALL) {
			var udcUserInfo = app.lookup("userInfoCustomLayout").getChild("UserInfoCustomDJMCH");
			var userInfoEx = udcUserInfo.getDJMCHUserInfoEx();
			
			var ipbUserID = app.lookup("USINB_ipbUserID");
			var ipbUniqueID = app.lookup("USINB_ipbUniqueID");
			var ipbUniqueID2 = userInfoEx.getValue("UniqueID2");
			var nSyncFlag = userInfoEx.getValue("SyncFlag");
			
			var smsDjmchUser = app.lookup("sms_postDjmchUser");
			smsDjmchUser.action = "v1/djmch/user/" + ipbUserID.value;
			var DjmchUser = app.lookup("DjmchUser");
			DjmchUser.setValue("UserID", parseInt(ipbUserID.text, 10));
			DjmchUser.setValue("UniqueID", ipbUniqueID.text);
			DjmchUser.setValue("UniqueID2", ipbUniqueID2.text);
			DjmchUser.setValue("SyncFlag", nSyncFlag);
			
			smsDjmchUser.send();
		} else if (oem_version == OEM_HC_SAUDI_MARJAN) {
			//wogus
			//사우디 사용자 정보 post
			do_submit_postPutHCSMUser();
		} else if (oem_version == OEM_BLUEHOUSE_KR) {
			
			var udcUserInfo = app.lookup("userInfoCustomLayout").getChild("UserInfoCustomBH");
			var oldBHUserInfo = app.lookup("BHUser")
			var newBHUserInfo = udcUserInfo.getBHUserCustomInfo();
			
			console.log("oldBHUserInfo : " + JSON.stringify(oldBHUserInfo.getDatas()));
			console.log("newBHUserInfo : " + JSON.stringify(newBHUserInfo.getDatas()));
			
			oldBHUserInfo.clear();
			newBHUserInfo.copyToDataMap(oldBHUserInfo);
			
			oldBHUserInfo.setValue("UserID", app.lookup("UserInfo").getValue("ID"));
			if (oldBHUserInfo.getValue("PriNo") == "") {
				oldBHUserInfo.setValue("PriNo", 0);
			}
			
			var smsPostPutBHUser = app.lookup("sms_postPutBHUserPriNoUpdate");
			smsPostPutBHUser.action = "/v1/bluehouse/users";
			
			comLib.showLoadMask("", dataManager.getString("Str_UserRegist"), "", 0);
			smsPostPutBHUser.send();
		} else if (oem_version == OEM_HYUNDAI_HI){ // 현대 중공업 신분증 사진, 증명사진 저장
			if (updateCustomPicture){
				var smsPostCustomHDHI = app.lookup("sms_postPictureCustomHDHI");
				smsPostCustomHDHI.action = "/v1/hdhi/users/picture/" + app.lookup("UserPictureCustomHDHI").getValue("UserID");
				smsPostCustomHDHI.send();
				return				
			} else {
				var dmUserCustomHDHI = app.lookup("UserCustomHDHI");
				var udcUserInfo = app.lookup("userInfoCustomLayout").getChild("UserInfoCustomHDHI");
				var newUserCustomHDHI = udcUserInfo.getUserCustomHDHI();
				
//				dmUserCustomHDHI.setValue("PartnerID", newUserCustomHDHI.getValue("PartnerID"));
				dmUserCustomHDHI.setValue("Nationality", newUserCustomHDHI.getValue("Nationality"));
				
				var smsPostCustomHDHI = app.lookup("sms_postCustomHDHI");
				smsPostCustomHDHI.action = "/v1/hdhi/users/" + app.lookup("USINB_ipbUserID").value;
				smsPostCustomHDHI.send();
				return
			}
		} else if (oem_version == OEM_ALMARAI_AUTHINFO) {		
			var udcUserInfo = app.lookup("userInfoCustomLayout").getChild("UserInfoCustomALMARAI");
			var description = udcUserInfo.getUserDescriptionInfoALMARAI();
			var userID = app.lookup("USINB_ipbUserID").value;
			var almaraiUser = app.lookup("UserDescription");
			almaraiUser.setValue("UserID", Number(userID));
			almaraiUser.setValue("Description", description);
			var smsPostPutAlmaraiDescription = app.lookup("sms_postPutAlmaraiDescription");
			smsPostPutAlmaraiDescription.action = "/v1/oemData/almarai/description";
			comLib.showLoadMask("", dataManager.getString("Str_UserRegist"), "", 0);
			smsPostPutAlmaraiDescription.send();
		}
		
		if (IsExistAuthType(AuthTypeMobileCard) == true && userInfo.getValue("Mobile").length > 0) {
			if (oem_version == OEM_HYUNDAI_MSEAT || userInfo.getValue("Email").length > 0) {
				// 인증수단에 모바일 카드가 있고 모바일,이메일 정보가 있으면 등록 메세지 팝업하지 않고 모바일 카드 신청 요청
				comLib.showLoadMask("", dataManager.getString("Str_UserAdd"), "", 0);
				var submission = app.lookup("sms_postMobileCardRegist");
				submission.userAttr("mode", "add");
				submission.action = "/v1/users/" + userInfo.getValue("ID") + "/mobilecard";
				submission.send();
				return;
			}
		}
		
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_UserAdd"));
	} else {
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_UserAdd";
		if (resultCode == ErrorUserSimilarFingerprint || resultCode == ErrorUserSimilarCard || resultCode == ErrorUserSimilarFace) {
			var DuplicateID = app.lookup("DuplicateInfo").getValue("DuplicateID");
			errMsg = dataManager.getString(errStr) + "\n" +
				dataManager.getString("Str_UserID") + " : " + DuplicateID + " (" +
				app.lookup("DuplicateInfo").getValue("DuplicateName") + DuplicateID + ")";
		} else {
			if (errStr.length > 0) {
				errMsg = dataManager.getString(errStr);
			} else {
				errMsg = dataManager.getString(errMsg);
			}
		}
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
	}
	
}

// 사용자 정보 추가 에러
function onSmsUserInfoAddSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

// 사용자 정보 추가 타임아웃 
function onSmsUserInfoAddSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

// 카드 추가 버튼 클릭
function onUSINT_ipbCardAddClick( /* cpr.events.CMouseEvent */ e) {
	var RegisterableCardCount = dataManager.getClientOption().getValue("RfRegMax");
	var dsCardInfo = app.lookup("UserCardInfo");
	var RegistedCardCount = dsCardInfo.getRowCount();
	
	if (RegisterableCardCount <= RegistedCardCount) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorMaxCardRegistConunt"));
		return
	}
	
	var brandType = dataManager.getSystemBrandType();
	var maxCardCount = 5;
	if (brandType == BRAND_NITGEN) {
		maxCardCount = 1;
	}
	
	if (oem_version == OEM_HDEC_CW) {
		maxCardCount = 1;
	}
	 
	var count = dsCardInfo.getRowCount();
	if (count >= maxCardCount) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_CardCountMaxExceeded"));
		return;
	}
	
	dsCardInfo.addRow();
	dsCardInfo.commit();
}

//카드 삭제 버튼 클릭
function onUSINT_ipbCardRemoveClick( /* cpr.events.CMouseEvent */ e) {
	
	var grdCardList = app.lookup("USINT_grdCardList");
	var chkIndices = grdCardList.getCheckRowIndices();
	if (chkIndices.length == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedItem"));
		return;
	}
	
	var dsCardInfo = app.lookup("UserCardInfo");
	chkIndices.forEach(function(rowIndex) {
		dsCardInfo.deleteRow(rowIndex)
	});
	dsCardInfo.commit();
	
	if (dsCardInfo.getRowCount() < 1) {
		var userID = app.lookup("UserInfo").getValue("ID");
		var sms_deleteCD = app.lookup("sms_deleteUserCDInfo");
		sms_deleteCD.action = "/v1/users/" + userID + "/card";
		sms_deleteCD.send();
		modifiedList[5] = true;
	}
}

// 카드 편집 버튼 클릭.
function onUSINT_btnCardModifyClick( /* cpr.events.CMouseEvent */ e) {
	var RegisterableCardCount = dataManager.getClientOption().getValue("RfRegMax");
	var dsCardInfo = app.lookup("UserCardInfo");
	var RegistedCardCount = dsCardInfo.getRowCount();
	if (RegisterableCardCount <= RegistedCardCount) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorMaxCardRegistConunt"));
		return
	}
	
	var userInfo = app.lookup("UserInfo");
	var appld = "app/main/users/userCardRegist" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {
		width: 640,
		height: 490
	}, function(dialog) {
		
		var dsUserCardInfo = app.lookup("UserCardInfo");
		dialog.bind("headerTitle").toLanguage("Str_CardRegist");
		dialog.initValue = {
			"userID": userInfo.getValue("ID"),
			"UserCardInfo": dsUserCardInfo,
			"Mode": "Regist",
			"Url": "/v1"
		};
		dialog.resizable = false;
		dialog.modal = true;
	}).then(function(returnValue) { // 지문 등록 화면에서 적용을 누른 경우에만 이 부분으로 들어옴.		
		
		var dsUserCardInfo = app.lookup("UserCardInfo");
		dsUserCardInfo.clear();
		
		for (var i = 0; i < returnValue.length; i++) {
			dsUserCardInfo.addRowData(returnValue[i]);
		}
		
		modifiedList[5] = true;
		//console.log(modifiedList);
	});
}

// 도움말 클릭
function onUSINB_imgHelpPageClick( /* cpr.events.CMouseEvent */ e) {
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target": DLG_HELP,
			"ID": menu_id
		}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

function Checkloginpassword() {
	var NewloginPwd = app.lookup("US_INT_ipbLoginPW").value;
	var ipbLoginPW = app.lookup("US_INT_ipbLoginPW");
	var UserInfo = app.lookup("UserInfo");
	if (app.lookup("US_INT_nbbAllowSignIn").value == 0 || ipbLoginPW.value == "****") {
		return true; // 원격 off일 경우 체크할 필요가 없다.
	}
	if (NewloginPwd.toString().length <= 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_LoginPassword_Enter"));
		return false; //원격 접속 on인데 비밀번호가 없이 저장하는 경우
	}
	
	if (oem_version == OEM_HYUNDAI_HI){
		if (UserInfo.getValue("LoginPW") != "****"){
			if (NewloginPwd.toString().length < 8) {
				dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorOptionPwdLength"));
				return false; // 현대중공업 비밀번호는 8자리 이상.
			}			
		}
	} else {
		if (NewloginPwd.toString().length < 4 && UserInfo.getValue("LoginPW") != "****") {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorUserLoginPasswordLength"));
			return false; // 비밀번호는 4자리 이상.
		}		
	}
	
	var checkResult;
	var option = dataManager.getClientOption();
	var DuplicateCharflag = option.getValue("PwNotAllowDuplicateChar"); // 연속문자 사용 불가.
	//console.log(DuplicateCharflag);
	if (DuplicateCharflag == 1) {
		checkResult = StrLib.checkConsecutiveDuplicateChar(NewloginPwd);
		if (checkResult == true) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordConsecutiveDuplicate") + " " + dataManager.getString("Str_WarningPasswordOption"));
			return false; // 동일 문자 있다.
		}
	}
	var SameIDflag = option.getValue("PwNotAllowSameID"); //ID 동일 비밀번호 사용 불가.
	//console.log(SameIDflag);
	if (SameIDflag == 1) {
		if (NewloginPwd == UserInfo.getValue("ID")) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordSameID") + " " + dataManager.getString("Str_WarningPasswordOption"));
			return false;
		}
	}
	var RequiredUpperflag = option.getValue("PwRequiredUpper"); // 영문 대문자 필수
	//console.log(RequiredUpperflag);
	if (RequiredUpperflag == 1) {
		checkResult = StrLib.checkUpper(NewloginPwd);
		if (checkResult == false) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordRequiredUpper") + " " + dataManager.getString("Str_WarningPasswordOption"));
			return false; // 동일 문자 있다.
		}
	}
	var PwRequiredLower = option.getValue("PwRequiredLower"); // 영문소문자 필수
	//console.log(PwRequiredLower);
	if (PwRequiredLower == 1) {
		checkResult = StrLib.checkLower(NewloginPwd);
		if (checkResult == false) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordRequiredLower") + " " + dataManager.getString("Str_WarningPasswordOption"));
			return false; // 동일 문자 있다.
		}
	}
	var PwRequiredNum = option.getValue("PwRequiredNum"); // 숫자 필수
	//console.log(PwRequiredNum);
	if (PwRequiredNum == 1) {
		checkResult = StrLib.checkNumber(NewloginPwd);
		if (checkResult == false) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordRequiredNum") + " " + dataManager.getString("Str_WarningPasswordOption"));
			return false; // 동일 문자 있다.
		}
	}
	var PwRequiredSymbol = option.getValue("PwRequiredSymbol"); //특수 문자 필수
	//console.log(PwRequiredSymbol);
	if (PwRequiredSymbol == 1) {
		checkResult = StrLib.checkChar(NewloginPwd);
		if (checkResult == false) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPasswordRequiredSymbol") + " " + dataManager.getString("Str_WarningPasswordOption"));
			return false; // 동일 문자 있다.
		}
	}
	return true
}

function onUSINB_cmbPrivilegeSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	var uSINB_cmbPrivilege = e.control;
	if (uSINB_cmbPrivilege.value < 1 && uSINB_cmbPrivilege.value < 1000) { // 1보다 크고 1000미만은 로그인 불가.
		app.lookup("US_INT_ipbLoginPW").visible = false;
		app.lookup("US_INT_nbbAllowSignIn").visible = false;
	}
	
	if (uSINB_cmbPrivilege.value == 1) {
		//관리자
		app.lookup("US_INT_ipbLoginPW").visible = true;
		app.lookup("US_INT_nbbAllowSignIn").visible = true;
		
		//app.lookup("US_INT_OpLoginPWItem").visible = true;
		//app.lookup("US_INT_OpbAllowSignInItem").visible = true;
	} else {
		
		//app.lookup("US_INT_OpLoginPWItem").visible = false;
		//app.lookup("US_INT_OpbAllowSignInItem").visible = false;
	}
	
	if(oem_version == OEM_HYUNDAI_HI){ // 협력사에 속하지 않은 사용자를 협력사 관리자로 설정 불가
		if (uSINB_cmbPrivilege.value == 10001){
			var partnerID = app.lookup("UserCustomHDHI").getValue("PartnerID");
			if(partnerID == null || partnerID.length < 1){
				uSINB_cmbPrivilege.selectItemByValue("2");
				dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorRegistUserPartnerAdmin"));
				return;
			}
		}
	}
	valueChange(e);
}

/*
 * 그리드에서 update 이벤트 발생 시 호출.
 * Grid의 행 데이터가 수정되었을 때 이벤트.
 */
function onUSINT_grdCardListUpdate( /* cpr.events.CGridEvent */ e) {
	/** 
	 * @type cpr.controls.Grid
	 */
	var grdCardList = e.control;
	var rowIndex = e.rowIndex;
	var rowList = grdCardList.findAllRow("CardNum == '" + e.newValue + "'")
	rowList.forEach(function(each) {
		if (rowIndex != each.getIndex()) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorSmimilarCard"));
			grdCardList.deleteRow(rowIndex);
			grdCardList.commitData();
			return;
		}
	});
}

// 사용자 이름 수정시
function onUSINB_ipbUserNameKeyup( /* cpr.events.CKeyboardEvent */ e) {
	/** @type cpr.controls.InputBox	 */
	var iptID = e.control;
	if (iptID.displayText) {
		inputValidManager.validate(app.lookup("USINB_ipbUserName"), "isValid", "");
	} else {
		app.lookup("USINB_ipbUserName").value = "";
		inputValidManager.validate(app.lookup("USINB_ipbUserName"), "isNull", dataManager.getString("Str_RequiredAlert"));
	}
}

// 사용자 비밀번호 수정시
function onUSINT_ipbPasswordKeyup( /* cpr.events.CKeyboardEvent */ e) {
	/** @type cpr.controls.InputBox	 */
	var uSINT_ipbPassword = e.control;
	//app.lookup("USINT_ipbPassword").value = uSINT_ipbPassword.displayText;
	if (uSINT_ipbPassword.displayText) {
		inputValidManager.validate(app.lookup("USINT_ipbPassword"), "isValid", "");
	} else {
		app.lookup("USINT_ipbPassword").value = "";
		inputValidManager.validate(app.lookup("USINT_ipbPassword"), "isNull", dataManager.getString("Str_RequiredAlert"));
	}
}

// 사용자 아이디 수정시
function onUSINB_ipbUserIDKeyup( /* cpr.events.CKeyboardEvent */ e) {
	/** @type cpr.controls.InputBox	 */
	var uSINB_ipbUserID = e.control;
	//app.lookup("USINB_ipbUserID").value = uSINB_ipbUserID.displayText;	 
	
	if (uSINB_ipbUserID.displayText) {
		inputValidManager.validate(app.lookup("USINB_ipbUserID"), "isValid", "");
	} else {
		app.lookup("USINB_ipbUserID").value = "";
		inputValidManager.validate(app.lookup("USINB_ipbUserID"), "isNull", dataManager.getString("Str_RequiredAlert"));
	}
}

// 유니크 아이디 수정시
function onUSINB_ipbUniqueIDKeyup( /* cpr.events.CKeyboardEvent */ e) {
	/** 
	 * @type cpr.controls.InputBox
	 */
	var uSINB_ipbUniqueID = e.control;
	var option = dataManager.getClientOption();
	var UniqueIDRequiredflag = option.getValue("UserUniqueIDRequired");
	if (UniqueIDRequiredflag == 1) {
		if (uSINB_ipbUniqueID.displayText) {
			inputValidManager.validate(app.lookup("USINB_ipbUniqueID"), "isValid", "");
		} else {
			app.lookup("USINB_ipbUniqueID").value = "";
			inputValidManager.validate(app.lookup("USINB_ipbUniqueID"), "isNull", dataManager.getString("Str_UserUniqueIDRequired"));
		}
	}
	
	// UMS_QRCODE 향 qrcode 사용시 유니크아이디 필수
	if (dataManager.getOemVersion() == OEM_UMS_QRCODE) {
		var UniqueID = app.lookup("USINB_ipbUniqueID");
		if (IsExistAuthType(30) == true) {
			if (uSINB_ipbUniqueID.displayText) {
				inputValidManager.validate(app.lookup("USINB_ipbUniqueID"), "isValid", "");
			} else {
				app.lookup("USINB_ipbUniqueID").value = "";
				inputValidManager.validate(app.lookup("USINB_ipbUniqueID"), "isNull", dataManager.getString("Str_UserUniqueIDRequired"));
			}
		} else {
			//			inputValidManager.clearInput(UniqueID);
		}
	}
	
}

// 이메일 수정시
function onUS_INT_ipbEmailKeyup( /* cpr.events.CKeyboardEvent */ e) {
	/** 
	 * @type cpr.controls.InputBox
	 */
	var uS_INT_ipbEmail = e.control;
	var option = dataManager.getClientOption();
	var EmailRequiredflag = option.getValue("UserEmailRequired");
	if (EmailRequiredflag == 1) {
		if (uS_INT_ipbEmail.displayText) {
			inputValidManager.validate(app.lookup("US_INT_ipbEmail"), "isValid", "");
		} else {
			app.lookup("US_INT_ipbEmail").value = "";
			inputValidManager.validate(app.lookup("US_INT_ipbEmail"), "isNull", dataManager.getString("Str_UserEmailRequired"));
		}
	}
}

// 그룹 선택시
function onUSINT_cmbGroupSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var uSINT_cmbGroup = e.control;
	var option = dataManager.getClientOption();
	var GroupRequiredflag = option.getValue("UserGroupRequired");
	if (GroupRequiredflag == 1) {
		if (uSINT_cmbGroup.value) {
			inputValidManager.validate(app.lookup("USINT_cmbGroup"), "comboDefalut", "");
		} else {
			app.lookup("USINT_cmbGroup").value != 0;
			inputValidManager.validate(app.lookup("USINT_cmbGroup"), "comboDefalut", dataManager.getString("Str_UserGroupRequired"));
		}
	}
	
	if(oem_version == OEM_KYOCERA){ // 그룹에 연동된 출입 그룹만 출입그룹 콤보박스에서 보이도록 설정
		if(account.getValue("UserID") == 1000000000000000000){
			var cmbAccessGroup = app.lookup("US_INT_cmbAccessGroup");
			cmbAccessGroup.deleteAllItems();
			cmbAccessGroup.addItem(new cpr.controls.Item("----", 0));
			var filterGroupinfo = dataManager.getAccessGroup();
			filterGroupinfo.setFilter("Code == " + uSINT_cmbGroup.value);
			//console.log(filterGroupinfo.getRowDataRanged());	
			var itemCount = filterGroupinfo.getRowCount();
			for(var i = 0; i < itemCount; i++){
				cmbAccessGroup.addItem(new cpr.controls.Item(filterGroupinfo.getValue(i, "Name"), filterGroupinfo.getValue(i, "ID")));
			}
			cmbAccessGroup.selectItemByValue(0);
		}
	}
	modifiedList[6] = true;
	//console.log(modifiedList);
}

// 출입그룹 선택시
function onUS_INT_cmbAccessGroupSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var uS_INT_cmbAccessGroup = e.control;
	var option = dataManager.getClientOption();
	var AccessGroupRequiredflag = option.getValue("UserAccessGroupRequired");
	if (AccessGroupRequiredflag == 1) {
		if (uS_INT_cmbAccessGroup.value) {
			inputValidManager.validate(app.lookup("US_INT_cmbAccessGroup"), "comboDefalut", "");
		} else {
			app.lookup("US_INT_cmbAccessGroup").value != 0;
			inputValidManager.validate(app.lookup("US_INT_cmbAccessGroup"), "comboDefalut", dataManager.getString("Str_UserAccessGroupRequired"));
		}
	}

	modifiedList[6] = true;
	//console.log(modifiedList);
}

// 근태코드 선택시
function onUS_INT_cmbTNASelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var uS_INT_cmbTNA = e.control;
	var option = dataManager.getClientOption();
	var ScheduleCodeRequiredflag = option.getValue("UserScheduleCodeRequired");
	if (ScheduleCodeRequiredflag == 1) {
		if (uS_INT_cmbTNA.value) {
			inputValidManager.validate(app.lookup("US_INT_cmbTNA"), "comboDefalut", "");
		} else {
			app.lookup("US_INT_cmbTNA").value != 0;
			inputValidManager.validate(app.lookup("US_INT_cmbTNA"), "comboDefalut", dataManager.getString("Str_UserScheduleCodeRequired"));
		}
	}
	
	modifiedList[7] = true;
	//console.log(modifiedList);		
}

// 식수코드 선택시
function onUS_INT_cmbMealSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var uS_INT_cmbMeal = e.control;
	var option = dataManager.getClientOption();
	var MealCodeRequiredflag = option.getValue("UserMealCodeRequired");
	if (MealCodeRequiredflag == 1) {
		if (uS_INT_cmbMeal.value) {
			inputValidManager.validate(app.lookup("US_INT_cmbMeal"), "comboDefalut", "");
		} else {
			app.lookup("US_INT_cmbMeal").value != 0;
			inputValidManager.validate(app.lookup("US_INT_cmbMeal"), "comboDefalut", dataManager.getString("Str_UserMealCodeRequired"));
		}
	}

	modifiedList[7] = true;
	//console.log(modifiedList);
}

// 시급코드 선택시
function onUS_INT_cmbMoneySelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var uS_INT_cmbMoney = e.control;
	var option = dataManager.getClientOption();
	var SalaryCodeRequiredflag = option.getValue("UserSalaryCodeRequired");
	if (SalaryCodeRequiredflag == 1) {
		if (uS_INT_cmbMoney.value) {
			inputValidManager.validate(app.lookup("US_INT_cmbMoney"), "comboDefalut", "");
		} else {
			app.lookup("US_INT_cmbMoney").value != 0;
			inputValidManager.validate(app.lookup("US_INT_cmbMoney"), "comboDefalut", dataManager.getString("Str_UserSalaryCodeeRequired"));
		}
	}

	modifiedList[7] = true;
	//console.log(modifiedList);
}

// 직급 선택시
function onUS_INT_cmbPositionSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var uS_INT_cmbPosition = e.control;
	var option = dataManager.getClientOption();
	var PositionRequiredflag = option.getValue("UserPositionRequired");
	if (PositionRequiredflag == 1) {
		if (uS_INT_cmbPosition.value) {
			inputValidManager.validate(app.lookup("US_INT_cmbPosition"), "comboDefalut", "");
		} else {
			app.lookup("US_INT_cmbPosition").value != 0;
			inputValidManager.validate(app.lookup("US_INT_cmbPosition"), "comboDefalut", dataManager.getString("Str_UserPositionRequired"));
		}
	}

	modifiedList[8] = true;
	//console.log(modifiedList);
}

// 휴대폰 번호 수정시
function onIpb6Keyup( /* cpr.events.CKeyboardEvent */ e) {
	/** 
	 * @type cpr.controls.InputBox
	 */
	var ipb6 = e.control;
	var option = dataManager.getClientOption();
	var MobileRequiredflag = option.getValue("UserMobileRequired");
	if (MobileRequiredflag == 1) {
		if (ipb6.displayText) {
			inputValidManager.validate(app.lookup("US_INT_Mobile"), "isValid", "");
		} else {
			app.lookup("US_INT_Mobile").value = "";
			inputValidManager.validate(app.lookup("US_INT_Mobile"), "isNull", dataManager.getString("Str_UserMobileRequired"));
		}
	}
}

// 부서명 수정시
function onUS_INT_ipbDepartmentKeyup( /* cpr.events.CKeyboardEvent */ e) {
	/** 
	 * @type cpr.controls.InputBox
	 */
	var uS_INT_ipbDepartment = e.control;
	var option = dataManager.getClientOption();
	var DepartmentRequiredflag = option.getValue("UserDepartmentRequired");
	if (DepartmentRequiredflag == 1) {
		if (uS_INT_ipbDepartment.displayText) {
			inputValidManager.validate(app.lookup("US_INT_ipbDepartment"), "isValid", "");
		} else {
			app.lookup("US_INT_ipbDepartment").value = "";
			inputValidManager.validate(app.lookup("US_INT_ipbDepartment"), "isNull", dataManager.getString("Str_UserDepartmentRequired"));
		}
	}
}

function onUSINT_btnCarAddClick( /* cpr.events.CMouseEvent */ e) {
	var registerablecarCount;
	switch (oem_version) {
		case OEM_ARMY_HQ:
		case OEM_ROKMCH:
			registerablecarCount = 5;
			break;
		default:
			registerablecarCount = 1;
	}
	
	var dsCarInfo = app.lookup("UserCarInfo");
	var registedCarCount = dsCarInfo.getRowCount();
	if (registerablecarCount <= registedCarCount) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_SubmitResult_RegistFail"));
		
		//차량오류 에러처리
		return
	}
	
	var count = dsCarInfo.getRowCount();
	if (count > registerablecarCount) {
		dialogAlert(app, dataManager.getString("Str_Warning"), "차량등록 갯수 초과");
		return;
	}
	
	dsCarInfo.addRow();
	dsCarInfo.commit();
}

function onUSINT_grdCarListUpdate( /* cpr.events.CGridEvent */ e) {
	/** 
	 * @type cpr.controls.Grid
	 */
	var uSINT_grdCarList = e.control;
	var rowIndex = e.rowIndex;
	var rowList = uSINT_grdCarList.findAllRow("carNumber == '" + e.newValue + "'");
	rowList.forEach(function(each) {
		if (rowIndex != each.getIndex()) {
			dialogAlert(app, dataManager.getString("Str_Warning"), "동일한 차량번호 입니다.");
			uSINT_grdCarList.deleteRow(rowIndex);
			uSINT_grdCarList.commitData();
			return;
		}
	});
}

/*
 * 버튼(USINT_btnCarDelete)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSINT_btnCarDeleteClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var uSINT_btnCarDelete = e.control;
	var grdCarList = app.lookup("USINT_grdCarList");
	var dmProcessInfo = app.lookup("ProcessInfo");
	var chkIndices = grdCarList.getCheckRowIndices();
	if (chkIndices.length == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedItem"));
		return;
	}
	if (dmProcessInfo.getValue("EditMode") == 'Add') {
		var dsCarInfo = app.lookup("UserCarInfo");
		chkIndices.forEach(function(rowIndex) {
			dsCarInfo.deleteRow(rowIndex);
		});
		dsCarInfo.commit();
		return
	}
	// 차량번호, rowidx,
	/*var dsCarInfo = app.lookup("UserCarInfo");
	
	*/
	
	comLib.showLoadMask("pro", dataManager.getString("Str_Delete"), "", chkIndices.length);
	
	var dsDeleteCarInfoList = app.lookup("deleteCarInfoList");
	dsDeleteCarInfoList.clear();
	var delCount = chkIndices.length;
	for (var i = 0; i < delCount; i++) {
		var delIndex = chkIndices[i];
		var delCar = {
			"carNumber": grdCarList.getRow(delIndex).getValue("CarNumber"),
			"rowIndex": delIndex
		};
		dsDeleteCarInfoList.addRowData(delCar);
	}
	sendDeleteCarInfo();
}

function sendDeleteCarInfo() {
	var dsDeleteCarInfoList = app.lookup("deleteCarInfoList");
	if (dsDeleteCarInfoList.getRowCount() == 0) {
		comLib.hideLoadMask();
		dataManager = getDataManager();
		return;
	}
	var dsDeleteCarInfo = dsDeleteCarInfoList.getRow(0);
	var carNumber = dsDeleteCarInfo.getValue("carNumber");
	
	comLib.updateLoadMask(carNumber);
	
	var userID = app.lookup("USINB_ipbUserID").value;
	
	var smsCarInfoDelete = new cpr.protocols.Submission("sms_CarInfoDelete");
	smsCarInfoDelete.action = "/v1/users/" + userID + "/carNumber/" + carNumber;
	smsCarInfoDelete.method = "delete";
	smsCarInfoDelete.mediaType = "application/x-www-form-urlencoded";
	smsCarInfoDelete.userAttr("carNumber", carNumber);
	smsCarInfoDelete.userAttr("rowIndex", dsDeleteCarInfo.getValue("rowIndex").toString());
	smsCarInfoDelete.addResponseData(app.lookup("Result"), false, "Result");
	
	smsCarInfoDelete.addEventListenerOnce("submit-done", onSms_CarInfoDeleteSubmitDone);
	smsCarInfoDelete.addEventListenerOnce("submit-error", onSms_CarInfoDeleteSubmitError);
	smsCarInfoDelete.addEventListenerOnce("submit-timeout", onSms_CarInfoDeleteSubmitTimeout);
	smsCarInfoDelete.send();
}

function onSms_CarInfoDeleteSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/* @type cpr.protocols.Submission */
	var sms_deleteUser = e.control;
	
	var deleteCarInfoList = app.lookup("deleteCarInfoList");
	deleteCarInfoList.realDeleteRow(0);
	
	var gridUserList = app.lookup("USINT_grdCarList");
	
	var carNumber = sms_deleteUser.userAttr("carNumber");
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var chkIndices = gridUserList.getCheckRowIndices();
		app.lookup("UserCarInfo").realDeleteRow(chkIndices[0]);
		sendDeleteCarInfo();
	} else {
		comLib.hideLoadMask();
		dataManager = getDataManager();
		dialogAlert(app, dataManager.getString("Str_Failed"),
			carNumber + " " + dataManager.getString("Str_Delete") + " " + dataManager.getString("Str_Failed") + "." + dataManager.getString(getErrorString(resultCode)));
		
	}
}

function onSms_CarInfoDeleteSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_CarInfoDeleteSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsUserCustomNDSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUserCustomND = e.control;
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var customLyout = app.lookup("userInfoCustomLayout");
		var udcUserInfo = customLyout.getChild("UserInfoCustomND");
		var ucND = app.lookup("UserCustomND")
		
		udcUserInfo.UC_ipbPhoneNum = ucND.getValue("PhoneNumber");
		udcUserInfo.UC_ipbCompany = ucND.getValue("Companies");
		udcUserInfo.UC_ipbBirthDay = ucND.getValue("Birthday");
		
		udcUserInfo.redraw();
		
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsUserCustomNDSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUserCustomND = e.control;
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSmsUserCustomNDSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUserCustomND = e.control;
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onSmsUserCustomSSHSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var customLyout = app.lookup("userInfoCustomLayout");
		var udcUserInfo = customLyout.getChild("UserInfoCustomSSH");
		var ucSSH = app.lookup("UserCustomSSH");
		
		udcUserInfo.UCSSH_nbeBalance = ucSSH.getValue("Balance");
		udcUserInfo.UCSSH_nbeMealCount = ucSSH.getValue("MealCount");
		udcUserInfo.UCSSH_ipbBirthday = ucSSH.getValue("Birthday"); // 생년월일 추가.
		udcUserInfo.setSSHUserInfo({
			"ID": app.lookup("UserInfo").getValue("ID"),
			"Name": app.lookup("UserInfo").getValue("Name"),
			"CreateDate": app.lookup("UserInfo").getValue("CreateDate")
		});
		udcUserInfo.redraw();
		
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	
}

exports.ssh_refreshSSHInfo = function(refreshType) {
	if (refreshType == 1) { // 변경됨
		var userInfo = app.lookup("UserInfo");
		var submission = app.lookup("smsUserCustomSSH");
		submission.action = "/v1/ssh/users/" + userInfo.getValue("ID");
		submission.send(); // 갱신
	}
}

function onSmspostUserCustomSSHSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_UserUpdate"));
	} else {
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_UserUpdate";
		if (errStr.length > 0) {
			errMsg = dataManager.getString(errStr);
		} else {
			errMsg = dataManager.getString(errMsg);
		}
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
		
	}
	comLib.hideLoadMask();
}

function onSmspostUserCustomSSHSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSmspostUserCustomSSHSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

/*
 * 인풋 박스에서 value-change 이벤트 발생 시 호출.
 * 변경된 value가 저장된 후에 발생하는 이벤트.
 */
function onUSINB_ipbUniqueIDValueChange( /* cpr.events.CValueChangeEvent */ e) {
	/** 
	 * @type cpr.controls.InputBox
	 */
	var uSINB_ipbUniqueID = e.control;
	
	console.log("onUSINB_ipbUniqueIDValueChange");
	
}

function CheckEnglishAndDecimal(ew) {
	
	console.log("CheckEnglishAndDecimal: " + ew);
	
	if (ew == 32)
		return true;
	if (48 <= ew && ew <= 57)
		return true;
	if (65 <= ew && ew <= 90)
		return true;
	if (97 <= ew && ew <= 122)
		return true;
	
	return false;
}

/*
 * 인풋 박스에서 keydown 이벤트 발생 시 호출.
 * 사용자가 키를 누를 때 발생하는 이벤트.
 */
function onUSINB_ipbUniqueIDKeydown( /* cpr.events.CKeyboardEvent */ e) {
	/** 
	 * @type cpr.controls.InputBox
	 */
	var uSINB_ipbUniqueID = e.control;
	
}

/*
 * 인풋 박스에서 input 이벤트 발생 시 호출.
 * 입력상자에 보여주는 텍스트가 키보드로부터 입력되어 변경되었을때 발생하는 이벤트.
 */
function onUSINB_ipbUniqueIDInput( /* cpr.events.CKeyboardEvent */ e) {
	/** 
	 * @type cpr.controls.InputBox
	 */
	var uSINB_ipbUniqueID = e.control;
	
}

/*
 * 인풋 박스에서 change 이벤트 발생 시 호출.
 * 값이 변경 되었을때 발생하는 DOM 이벤트.
 */
function onUSINB_ipbUniqueIDChange( /* cpr.events.CUIEvent */ e) {
	/** 
	 * @type cpr.controls.InputBox
	 */
	var uSINB_ipbUniqueID = e.control;
	
	console.log("onUSINB_ipbUniqueIDChange");
	
}

// 권한 정보 가져오기 성공. 
function onSms_getPrivilegeInfoSubmitSuccess( /* cpr.events.CSubmissionEvent */ e) {
	var groupInfo = app.lookup("GroupInfo");
	var cmbGroup = app.lookup("USINT_cmbGroup");
	cmbGroup.selectItemByValue(groupInfo.getValue("GroupID"));
	
	// 권한을 그룹에 할당, 로그인한 후  사용자 추가 시 그룹 설정할 때 하위 그룹도 설정할 수 있게 추가
	cmbGroup.deleteItem(0);
	cmbGroup.redraw();
	
	//	cmbGroup.enabled = false;
}

/*
 * 인풋 박스에서 value-change 이벤트 발생 시 호출.
 * 변경된 value가 저장된 후에 발생하는 이벤트.
 */
function onUSINB_ipbUserIDValueChange( /* cpr.events.CValueChangeEvent */ e) {
	/** 
	 * @type cpr.controls.InputBox
	 */
	var uSINB_ipbUserID = e.control;
	console.log(uSINB_ipbUserID.value);
}

/*
 * 버튼(USINT_btnFpCardModify)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSINT_btnFpCardModifyClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var uSINT_btnFpCardModify = e.control;
	var appld = "app/main/users/UserFingerCardRegist" + "?" + usint_version;
	
	app.getRootAppInstance().openDialog(appld, {
		width: 700,
		height: 520
	}, function(dialog) {
		dialog.ready(function(dialogApp) {
			
		});
		var dmUserInfo = app.lookup("UserInfo"); // 사용자 기본정보
		var dsUserCardInfo = app.lookup("UserCardInfo"); // 카드 정보
		var dsUserFpInfo = app.lookup("UserFPInfo"); //지문 정보
		var dmProcessInfo = app.lookup("ProcessInfo");
		var duressFingerArry = new Array();
		var duressFinger = dmUserInfo.getValue("DuressFinger");
		if (duressFinger) {
			duressFingerArry = duressFinger.split(",");
		}
		dialog.initValue = {
			"ID": dmUserInfo.getValue("ID"),
			"Url": "/v1",
			"mode": dmProcessInfo.getValue("EditMode"), // 등록/ 변경 체크
			//--------------------------------------------------------------> 필수
			"fpmodified": USINT_fpModified,
			"cardmodified": USINT_cardModified, /// 사용자 정보 mode, 지문.카드 정보 mode
			"dmUserInfo": dmUserInfo.getDatas(),
			"UserFPInfo": dsUserFpInfo, // 지문
			"DuressFinger": duressFingerArry, //협박
			"UserCardInfo": dsUserCardInfo //카드
		};
		dialog.bind("headerTitle").toLanguage("Str_FingerPrintCard"); //지문카드 등록
		dialog.resizable = false;
		dialog.modal = true;
	}).then(function(returnValue) {
		if (returnValue) {
			var result = returnValue["result"];
			console.log(result);
			if (result == 1) {
				USINT_fpModified = 1; // 사용자가 지문을 수정한 경우 다음번 지문 편집창을 열때는 수정된 데이터로 표시
				var dsUserFPInfo = app.lookup("UserFPInfo");
				dsUserFPInfo.clear();
				dsUserFPInfo.build(returnValue["UserFPInfo"]);
				dsUserFPInfo.setRowStateAll(cpr.data.tabledata.RowState.INSERTED);
				console.log(dsUserFPInfo.getRowDataRanged());
				
				var writeCardNumber = returnValue["writeCardNumber"];
				
				var dsUserCardInfo = app.lookup("UserCardInfo");
				var cardInfo = dsUserCardInfo.findFirstRow("CardNum == '" + writeCardNumber + "'");
				if (!cardInfo) {
					var row = dsUserCardInfo.addRow();
					row.setValue("CardNum", writeCardNumber);
				}
				
				dsUserCardInfo.commit();
				console.log(dsUserCardInfo.getRowDataRanged());
				
				modifiedList[5] = true;
				//console.log(modifiedList);
			}
		}
		
	});
}

function onSms_getDjmchUserSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var djmchUser = app.lookup("DjmchUser");
		var udcDjmchUserInfo = app.lookup("userInfoCustomLayout").getChild("UserInfoCustomDJMCH");
		udcDjmchUserInfo.setDJMCHUserInfoEx(djmchUser.getValue("UniqueID2"), djmchUser.getValue("SyncFlag"));
		udcDjmchUserInfo.redraw();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_putDjmchUserSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {} else {
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_UserUpdate";
		if (errStr.length > 0) {
			errMsg = dataManager.getString(errStr);
		} else {
			errMsg = dataManager.getString(errMsg);
		}
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
	}
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postDjmchUserSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_postDjmchUser = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {} else {
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_UserUpdate";
		if (errStr.length > 0) {
			errMsg = dataManager.getString(errStr);
		} else {
			errMsg = dataManager.getString(errMsg);
		}
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
	}
}

function onSms_postMobileCardRegistSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** @type cpr.protocols.Submission	 */
	var sms_postMobileCardRegist = e.control;
	comLib.hideLoadMask();
	var mode = sms_postMobileCardRegist.userAttr("mode");
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		//if( mode == "add "){
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_UserAdd"));
		//} else {
		// dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_UserAdd"));
		//}	
	} else {
		if (mode == "add") {
			var msg = dataManager.getString("Str_UserAdd") + "\n\n" + dataManager.getString("Str_MobileCard") + " : " + dataManager.getString(getErrorString(resultCode));
			dialogAlert(app, dataManager.getString("Str_Success"), msg);
		} else {
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
		}
	}
}

// HCSM 사용자 커스텀 정보 설정창 팝업
function onUS_INT_btnHCSMSettingClick( /* cpr.events.CMouseEvent */ e) {
	var appld = "app/custom/hcsm/hcsmUserCustomSetting";
	app.getRootAppInstance().openDialog(appld, {
		width: 500,
		height: 600
	}, function(dialog) {
		dialog.initValue = 0;
		dialog.resizable = false;
		dialog.bind("headerTitle").toLanguage("Str_Setting");
		dialog.headerClose = false;
		dialog.modal = true;
	}).then(function(returnValue) {
		hcsmSetComboBox();
		
		var submission = app.lookup("sms_getHCSMUser");
		submission.action = "/v1/oemData/hcsm/user/" + app.lookup("UserInfo").getValue("ID");
		submission.send();
	});
}

/*
 * 네비게이션 바에서 selection-change 이벤트 발생 시 호출.
 * 선택된 Item 값이 저장된 후에 발생하는 이벤트.
 */
function onUS_INT_nbbAllowSignInSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type cpr.controls.NavigationBar
	 */
	checkLoginAllowedToggle();
	modifiedList[8] = true;
	//console.log(modifiedList);	
}

function checkLoginAllowedToggle() {
	var uS_INT_nbbAllowSignIn = app.lookup("US_INT_nbbAllowSignIn");
	var pwd = app.lookup("US_INT_ipbLoginPW");
	
	if (uS_INT_nbbAllowSignIn.value == 0) { //원격 로그인 off 할 때
		remotePassword = pwd.value;
		pwd.value = "";
		pwd.enabled = false;
		
		if(oem_version == OEM_ITONE_TRDATA || oem_version == OEM_ITONE_POSCO_DX) {
			app.lookup("UserLoginID").chkLoginAllowedToggle(false);
		}
		
	} else { //원격로그인 on 할 때
		pwd.enabled = true;
		if (remotePassword.length > 0) {
			pwd.value = remotePassword;
		}
		
		if(oem_version == OEM_ITONE_TRDATA || oem_version == OEM_ITONE_POSCO_DX) {
			app.lookup("UserLoginID").chkLoginAllowedToggle(true);
		}
	}
}

//사우디 hcsm 커스터마이징 ds 바인딩
function hcsmSetComboBox() {
	//Company
	var cmbCompany = app.lookup("US_INT_cmbCompany");
	cmbCompany.deleteAllItems();
	cmbCompany.addItem(new cpr.controls.Item("----", 0));
	cmbCompany.setItemSet(dataManager.getCompanyList(), {
		label: "CompanyName",
		value: "CompanyID",
	});
	//Team
	var cmbTeam = app.lookup("US_INT_cmbTeam");
	cmbTeam.deleteAllItems();
	cmbTeam.addItem(new cpr.controls.Item("----", 0));
	cmbTeam.setItemSet(dataManager.getTeamList(), {
		label: "TeamName",
		value: "TeamID",
	});
	
	//Part
	hcsmSetPartComboBox();
	
	//Nationality
	var cmbNationality = app.lookup("US_INT_cmbNationality");
	cmbNationality.deleteAllItems();
	cmbNationality.addItem(new cpr.controls.Item("----", 0));
	cmbNationality.setItemSet(dataManager.getNationalityList(), {
		label: "NationalityName",
		value: "NationalityID",
	});
	//BloodType
	var cmbBloodType = app.lookup("US_INT_cmbBloodType");
	cmbBloodType.deleteAllItems();
	cmbBloodType.addItem(new cpr.controls.Item("----", 0));
	cmbBloodType.setItemSet(dataManager.getBloodTypeList(), {
		label: "BloodName",
		value: "BloodID",
	});
}

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onUS_INT_cmbTeamSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var uS_INT_cmbTeam = e.control;
	hcsmSetPartComboBox();
	//wogus todo
	//teamID를 보내서 part리스트 받아오기. 콤보박스에 매핑
}

function hcsmSetPartComboBox() {
	var teamID = app.lookup("US_INT_cmbTeam").value;
	
	//Part
	var cmbPart = app.lookup("US_INT_cmbPart");
	cmbPart.deleteAllItems();
	cmbPart.addItem(new cpr.controls.Item("----", 0));
	
	//TeamID에 따른 ds 세팅 
	var dsPart = app.lookup("HCSMPart");
	dsPart.clear();
	dataManager.getPartList().copyToDataSet(dsPart);
	
	dsPart.setFilter("TeamID == " + teamID);
	cmbPart.setItemSet(dsPart, {
		label: "PartName",
		value: "PartID",
	});
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postHCSMUserSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	comLib.hideLoadMask();
	var sms_postHCSMUser = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode != COMERROR_NONE) {
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_UserUpdate";
		if (errStr.length > 0) {
			errMsg = dataManager.getString(errStr);
		} else {
			errMsg = dataManager.getString(errMsg);
		}
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
	}
}

function do_submit_postPutHCSMUser() {
	setHCSMUserdm();
	var submission = app.lookup("sms_postPutHCSMUser");
	submission.send();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getHCSMUserSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	comLib.hideLoadMask();
	var sms_getHCSMUser = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		//가져온 dm 콤보박스에 세팅
		hcsmSetComboBoxUser();
		// 추가 사용자 정보 추가
		hcsmSetUserInfo();
	} else {
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_UserUpdate";
		if (errStr.length > 0) {
			errMsg = dataManager.getString(errStr);
		} else {
			errMsg = dataManager.getString(errMsg);
		}
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
	}
}

function setHCSMUserdm() {
	var hcsmUser = app.lookup("HCSMUser");
	//console.log("setHCSMUserdm", hcsmUser.getDatas());
	var userID = app.lookup("USINB_ipbUserID").value;
	var companyID = app.lookup("US_INT_cmbCompany").value;
	var teamID = app.lookup("US_INT_cmbTeam").value;
	var partID = app.lookup("US_INT_cmbPart").value;
	var nationalityID = app.lookup("US_INT_cmbNationality").value;
	var bloodID = app.lookup("US_INT_cmbBloodType").value;
	var mobile = app.lookup("US_INT_Mobile").value; //mobile
	//console.log("setHCSMUserdm: US_INT_cmbBloodType= ", app.lookup("US_INT_cmbBloodType").value);
	//console.log("setHCSMUserdm: US_INT_cmbBloodType= ", bloodID);
	
	hcsmUser.setValue("UserID", Number(userID));
	hcsmUser.setValue("CompanyID", Number(companyID));
	hcsmUser.setValue("TeamID", Number(teamID));
	hcsmUser.setValue("PartID", Number(partID));
	hcsmUser.setValue("NationalityID", Number(nationalityID));
	hcsmUser.setValue("BloodID", Number(bloodID));
	hcsmUser.setValue("Mobile", mobile);
	
	// 여권 번호, 직원번호, 이까마, 리마크 추가
	var udcUserInfo = app.lookup("userInfoCustomLayout").getChild("UserInfoCustomHCSM");
	
	var userPassportInfo = udcUserInfo.getUserPassportInfoHCSM();
	var userJobNoInfo = udcUserInfo.getUserJobNoInfoHCSM();
	var userIqamaNoInfo = udcUserInfo.getUserIqamaNoInfoHCSM();
	var userRemarksInfo = udcUserInfo.getUserRemarksInfoHCSM();
	
	hcsmUser.setValue("PassportNo", userPassportInfo);
	hcsmUser.setValue("JobNo", userJobNoInfo);
	hcsmUser.setValue("IqamaNo", userIqamaNoInfo);
	hcsmUser.setValue("Remarks", userRemarksInfo);
}

function hcsmSetComboBoxUser() {
	var dmHCSMuser = app.lookup("HCSMUser");
	
	var companyID = dmHCSMuser.getValue("CompanyID");
	var teamID = dmHCSMuser.getValue("TeamID");
	var partID = dmHCSMuser.getValue("PartID");
	var nationalityID = dmHCSMuser.getValue("NationalityID");
	var bloodID = dmHCSMuser.getValue("BloodID");
	
	var categoryID = dmHCSMuser.getValue("CategoryID");
	app.lookup("US_INT_cmbCompany").value = companyID;
	app.lookup("US_INT_cmbTeam").value = teamID;
	hcsmSetPartComboBox();
	app.lookup("US_INT_cmbPart").value = partID;
	app.lookup("US_INT_cmbNationality").value = nationalityID;
	app.lookup("US_INT_cmbBloodType").value = bloodID;
}

function hcsmSetUserInfo() {
	var dmHCSMuser = app.lookup("HCSMUser");
	var udcUserInfo = app.lookup("userInfoCustomLayout").getChild("UserInfoCustomHCSM");
	
	var userPassportInfo = dmHCSMuser.getValue("PassportNo");
	var userJobNoInfo = dmHCSMuser.getValue("JobNo");
	var userIqamaNoInfo = dmHCSMuser.getValue("IqamaNo");
	var userRemarksInfo = dmHCSMuser.getValue("Remarks");
	
	udcUserInfo.setUserPassportInfoHCSM(userPassportInfo);
	udcUserInfo.setUserJobNoInfoHCSM(userJobNoInfo);
	udcUserInfo.setUserIqamaNoInfoHCSM(userIqamaNoInfo);
	udcUserInfo.setUserRemarksInfoHCSM(userRemarksInfo);
}

/*
 * 서브미션에서 before-submit 이벤트 발생 시 호출.
 * 통신을 시작하기전에 발생합니다.
 */
function onSms_getHCSMUserBeforeSubmit( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getHCSMUser = e.control;
	comLib.showLoadMask("", dataManager.getString("Str_Recall"), "", 0);
}

/*
 * 서브미션에서 before-submit 이벤트 발생 시 호출.
 * 통신을 시작하기전에 발생합니다.
 */
function onSms_postPutHCSMUserBeforeSubmit( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_postPutHCSMUser = e.control;
	comLib.showLoadMask("", dataManager.getString("Str_UserRegist"), "", 0);
}

function SetMaxDate() {
	var date = new Date();
	date.setFullYear(date.getFullYear()); // y년을 더함
	date.setMonth(date.getMonth()); // m월을 더함
	date.setDate(date.getDate()); // d일을 더함
	
	app.lookup("US_INT_dtiBirthday").maxDate = date;
}

function do_submit_postPutBPARKUser() {
	// 데이터 셋에 유저아이디 담기
	var bparkUser = app.lookup("BPARKUser");
	var userID = app.lookup("USINB_ipbUserID").value;
	bparkUser.setValue("UserID", Number(userID));
	
	var submission = app.lookup("sms_postPutBPARKUser");
	comLib.showLoadMask("", dataManager.getString("Str_UserRegist"), "", 0);
	submission.send();
}

function onSms_postPutBPARKUserSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	comLib.hideLoadMask();
	var sms_getHCSMUser = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode != COMERROR_NONE) {
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_UserUpdate";
		if (errStr.length > 0) {
			errMsg = dataManager.getString(errStr);
		} else {
			errMsg = dataManager.getString(errMsg);
		}
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
	}
}

function onSms_postPutBPARKUserSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_postPutBPARKUserSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onSms_getBPARKUserBeforeSubmit( /* cpr.events.CSubmissionEvent */ e) {
	comLib.showLoadMask("", dataManager.getString("Str_Recall"), "", 0);
}

function onSms_getBPARKUserSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	comLib.hideLoadMask();
	var sms_getHCSMUser = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var ticketExpireAt = app.lookup("BPARKUser").getValue("SeasonTicketExpireAt");
		if (ticketExpireAt.toString().split(" ")[0] == "0001-01-01" || ticketExpireAt.toString().split(" ")[0] == "2000-01-01") {
			app.lookup("BPARKUser").setValue("SeasonTicketExpireAt", "");
		} else if (ticketExpireAt.toString().length > 0 || ticketExpireAt.toString() != "") {
			app.lookup("BPARKUser").setValue("SeasonTicketExpireAt", ticketExpireAt.toString().split(" ")[0]);
		}
		var seasonTicketExpireAt = app.lookup("BPARKUser").getValue("SeasonTicketExpireAt");
		
		var udcUserCarInfo = app.lookup("userInfoCustomLayout").getChild("UserInfoCustomMCP");
		udcUserCarInfo.setSeasonTicketExpireAt(seasonTicketExpireAt);
		
		var paymentTime = app.lookup("BPARKUser").getValue("PaymentTime");
		var strPaymentDate = paymentTime.toString().split(" ")[0];
		
		var date = new Date();
		var year = date.getFullYear();
		var month = ("0" + (1 + date.getMonth())).slice(-2);
		var day = ("0" + date.getDate()).slice(-2);
		var strToday = year + "-" + month + "-" + day;
		var msg = "";
		
		if (strToday == strPaymentDate) {
			// 오늘 결제
			msg = dataManager.getString("Str_BPARK_CompletePayment");
		} else {
			// 결제 없음
			msg = dataManager.getString("Str_BPARK_NoPayment");
		}
		
		udcUserCarInfo.setDailyPaymentResult(msg);
		
		// 정기권 데이터 get
		var dsInfo = app.lookup("BPARKInfoList");
		dataManager.getInfoListBPARK().copyToDataSet(dsInfo);
		dsInfo.commit();
		
	} else {
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_UserUpdate";
		if (errStr.length > 0) {
			errMsg = dataManager.getString(errStr);
		} else {
			errMsg = dataManager.getString(errMsg);
		}
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
	}
}

// 정기권 등록 연장
function onBPARK_btnSeasonTicketClick( /* cpr.events.CMouseEvent */ e) {
	
	// 클릭하면 클라에 저장된 금액 결제 된다고 보여주고 금액 넣고 api 날리기
	var dsInfo = app.lookup("BPARKInfoList");
	//	console.log(dsInfo.getRowDataRanged());
	var seasonTicketPrice = dsInfo.findFirstRow("IndexKey == 3").getValue("BasicPrice");
	console.log(seasonTicketPrice);
}

function onSms_getBHUserBeforeSubmit( /* cpr.events.CSubmissionEvent */ e) {
	comLib.showLoadMask("", dataManager.getString("Str_Recall"), "", 0);
}

function onSms_getBHUserSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	comLib.hideLoadMask();
	//	console.log("onSms_getBHUserSubmitDone");
	// 데이터맵 데이터 UDC로 보내고 UDC 값 업데이트
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var udcUserInfo = app.lookup("userInfoCustomLayout").getChild("UserInfoCustomBH");
		var bhUserInfo = app.lookup("BHUser");
		var dmProcessInfo = app.lookup("ProcessInfo");
		console.log(JSON.stringify(bhUserInfo.getDatas()));
		udcUserInfo.setBHUserCustomInfo(bhUserInfo);
		udcUserInfo.setBHEditMode(dmProcessInfo.getValue("EditMode"));
		console.log("EditMode : " + dmProcessInfo.getValue("EditMode"));
		udcUserInfo.redraw();
	} else {
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_UserUpdate";
		if (errStr.length > 0) {
			errMsg = dataManager.getString(errStr);
		} else {
			errMsg = dataManager.getString(errMsg);
		}
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
	}
}

function onSms_postPutBHUserPriNoUpdateSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	comLib.hideLoadMask();
	var sms_postPutBHUserPriNoUpdate = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode != COMERROR_NONE) {
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_UserUpdate";
		if (errStr.length > 0) {
			errMsg = dataManager.getString(errStr);
		} else {
			errMsg = dataManager.getString(errMsg);
		}
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
	} else {
		// 성공시 에디트모드 넘기기
		var udcUserInfo = app.lookup("userInfoCustomLayout").getChild("UserInfoCustomBH");
		udcUserInfo.setBHEditMode("Modify");
		udcUserInfo.setReDuplicationResult("None");
		udcUserInfo.setBHOldPriNoInfo();
	}
}

function onSms_postPutBHUserPriNoUpdateSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_postPutBHUserPriNoUpdateSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

/*
 * "삭제" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSINB_btnPictureDeleteClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var userPicture = app.lookup("USINB_imgUserPicture");
	if (userPicture.src == null || userPicture.src.length == 0) {
		return;
	}
	
	var userInfo = app.lookup("UserInfo");
	var userId = userInfo.getValue("ID");
	app.lookup("UserID").setValue("ID", userId);
	
	var submission = app.lookup("sms_UserPhotoDelete");
	submission.action = "/v1/users/" + userInfo.getValue("ID") + "/picture";
	submission.send();
	
}

// 사진삭제 후 변경 
function onSms_UserPhotoDeleteSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var sms_UserPhotoDelete = e.control;
	
	app.lookup('USINB_imgUserPicture').src = "theme/images/common/common_black_img_180.png";
	app.lookup('USINB_imgUserPicture').redraw();
	app.lookup('UserInfo').setValue("Picture", "");
}

function onSms_UserPhotoDeleteSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	var sms_UserPhotoDelete = e.control;
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onSms_UserPhotoDeleteSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	var sms_UserPhotoDelete = e.control;
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

/*
 * "Str_설정 팝업" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(e) {
	var button = e.control;
	var UserElevatorInfo = app.lookup('UserElevatorInfo');
	var accessFloor = UserElevatorInfo.getValue('AccessFloor');
	
	app.openDialog("app/main/users/UserElevatorSetting", {
		width: 395,
		height: 500
	}, function(dialog) {
		dialog.ready(function(dialogApp) {
			dialog.initValue = {
				"AccessFloor": accessFloor
			};
			dialog.headerTitle = dataManager.getString("Str_OptionFloor_Settings"); /* 출입가능 층 수 설정  */
			dialog.modal = true;
		});
	}).then(function(returnValue) {
		// userInfo.setValue("AccessFloor", 'testData');
		 UserElevatorInfo.setValue("AccessFloor", returnValue);
		 console.log('returnValue::',returnValue);
	});
}

function valueChange(e){
	var control = e.control;
	var controlID = control.id;
	
	switch(controlID){	
		case "USINB_ipbUserName": // 사용자 이름
			modifiedList[1] = true;
			break;			
		case "USINB_ipbUserID":
			modifiedList[2] = true;
			break;
		case "USINB_ipbUniqueID":
			modifiedList[3] = true;
			break;
		case "USINT_opbAuthAnd":
			modifiedList[4] = true;
			break;	
		case "USINT_opbAuthOr":
			modifiedList[4] = true;
			break;	
		case "USINB_cmbPrivilege":
			modifiedList[4] = true;
			break;	
		case "US_INT_rdbUsePeriod": 
			modifiedList[4] = true;
			break;	
		case "US_INT_dtiRegist":
			modifiedList[4] = true;
			break;	
		case "US_INT_dtiExpire":
			modifiedList[4] = true;
			break;
		case "US_INT_cmbFPVerifyLevel":
			modifiedList[5] = true;
			break;
		case "NVBAR_FP_1:N":
			modifiedList[5] = true;
			break;	
		case "NVBAR_FACE_1:N":
			modifiedList[5] = true;
			break;
		case "NVBAR_IRIS_1:N":
			modifiedList[5] = true;
			break;
		case "USINT_ipbPassword":
			modifiedList[5] = true;
			break;
		case "ipbCardNum":
			modifiedList[5] = true;
			break;
		case "NVBAR_BlackList":
			modifiedList[6] = true;
			break;
		case "NVBAR_APB":
			modifiedList[6] = true;
			break;
		case "US_INT_cmbAPBarea":	
			modifiedList[6] = true;
			break;
		case "US_INT_ipbEmail":	
			modifiedList[7] = true;
			break;
		case "US_INT_cmbUserMessage":
			modifiedList[8] = true;
			break;
		case "US_INT_Mobile":
			modifiedList[8] = true;
			break;
		case "US_INT_dtiBirthday":
			modifiedList[8] = true;
			break;	
		case "US_INT_Phone":
			modifiedList[8] = true;
			break;
		case "US_INT_ipbDepartment":
			modifiedList[8] = true;
			break;
		case "US_INT_ipbLoginPW":
			modifiedList[8] = true;
			break;
		case "US_INT_nabVoipUse":
			modifiedList[8] = true;
			break;
		case "US_INT_cbxDoorOpenDuringCall":
			modifiedList[8] = true;
			break;
		case "US_INT_cbxDoorOpenReceivingCall":
			modifiedList[8] = true;
			break;
		case "ipb2":
			modifiedList[8] = true;
			break;									
	}
	//console.log(modifiedList);

	
}

function onSms_getItoneUserSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var loginID = app.lookup("ITONEUser").getValue("LoginID");
		app.lookup("UserLoginID").setLoginIDValue(loginID);
	} else {
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_UserUpdate";
		if (errStr.length > 0) {
			errMsg = dataManager.getString(errStr);
		} else {
			errMsg = dataManager.getString(errMsg);
		}
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
	}
	
	if(oem_version == OEM_ITONE_POSCO_DX) {
		var personID = app.lookup("UserInfo").getValue("UniqueID");
		var submission = app.lookup("sms_getPoscoPartners");
		submission.action = submission.action +"/"+personID;
		submission.send();
	}
}

function onSms_getItoneUserBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	comLib.showLoadMask("", dataManager.getString("Str_Recall"), "", 0);
}

function onSmsUserCustomMBMSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		app.lookup("sms_getOptionElevator").send();
	} else {
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	
}

function onSmsUserCustomMBMSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSmsUserCustomMBMSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

function onSms_getOptionElevatorSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		app.lookup("sms_getCustomFloorList").send();
	} else {
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_getOptionElevatorSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_getOptionElevatorSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

function onSms_getCustomFloorListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		var dsUserElevator = app.lookup("UserBuildingElevatorSet");
		for (var i = 0; i < dsUserElevator.getRowCount(); i++){
			var row = dsUserElevator.getRow(i);
			var floors = row.getValue("AccessFloor").split(',');
			floorMap.set(row.getValue("BuildingCode"), floors);
//			console.log(row.getValue("BuildingCode"));
//			console.log(floorMap.get(row.getValue("BuildingCode")));
		}
		
		app.lookup("USINT_cmbBuildingCode").selectItem(0, true);
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}


function onSms_getCustomFloorListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_getCustomFloorListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

function onUSINT_cmbBuildingCodeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var dmOptionElevator = app.lookup("OptionElevator");		
	var totalFloorCount = parseInt(dmOptionElevator.getValue("TotalFloorCount")); // 전체 층
	var groundFloor = parseInt(dmOptionElevator.getValue("FirstFloor")); // 1층
	
 	var dsFloorList = app.lookup("dsFloorList"); // 이전 층 설정 초기화
 	dsFloorList.clear();
 	var buildingCode = app.lookup("USINT_cmbBuildingCode").value;
 	var customFloorList = app.lookup("CustomFloorList").findAllRow("ElevatorSetID == " + buildingCode);
 	
 	for( var i = 1; i < totalFloorCount+1; i++ ) {
 		var floorInfo = "";
 		if( i <= groundFloor-1 ){
 			floorInfo = "B"+(groundFloor-i);
 		}else {
 			floorInfo = ""+(i-groundFloor+1);
 		}		
 		dsFloorList.addRowData({"Floor":i,"FloorName":floorInfo})
 	}
 	
 	if(customFloorList != null && customFloorList.length > 0){
 		for(var i = 0; i < customFloorList.length; i++){
 			var floor = customFloorList[i].getValue("AccessFloor");
 			var row = dsFloorList.findFirstRow("Floor == " + floor);
 			row.setValue("FloorName", customFloorList[i].getValue("FloorName"));
 		}
 	}
 	
 	dsFloorList.commit();
 
 	var grdBuildingElevator = app.lookup("USINT_grdBuildingElevator");
 	grdBuildingElevator.clearSelection();
 	if (floorMap.has(Number(buildingCode))){
	 	var selectFloor = floorMap.get(Number(buildingCode));
	 	for (var i = 0; i < selectFloor.length; i++){
	 		grdBuildingElevator.setCheckRowIndex(selectFloor[i]-1, true);	
	 	}
 	}
 	grdBuildingElevator.redraw();
}

function onUSINT_grdBuildingElevatorRowCheck(/* cpr.events.CGridEvent */ e){
	changeCheckBuildingElevator();
}

function onUSINT_grdBuildingElevatorRowUncheck(/* cpr.events.CGridEvent */ e){
	changeCheckBuildingElevator();
}

function changeCheckBuildingElevator(){
	var grdBuildingElevator = app.lookup("USINT_grdBuildingElevator");
	var buildingCode = app.lookup("USINT_cmbBuildingCode").value;
	var checkIndices = grdBuildingElevator.getCheckRowIndices();
	if (floorMap.has(Number(buildingCode))){
	 	var selectFloor = floorMap.delete(Number(buildingCode));
 	}
 	
 	var floors = [];
 	for (var i = 0; i < checkIndices.length; i++){
	 	floors[i] = grdBuildingElevator.getRow(checkIndices[i]).getValue("Floor");
 	}
 	
 	if (floors.length > 0){
 		floorMap.set(Number(buildingCode), floors);
 		console.log(floorMap.get(Number(buildingCode)));
 	}	
}

function onUSINT_grdBuildingElevatorHeaderCheck(/* cpr.events.CGridEvent */ e){
	changeCheckBuildingElevator();
}

function onUSINT_grdBuildingElevatorHeaderUncheck(/* cpr.events.CGridEvent */ e){
	changeCheckBuildingElevator();
}


function onSms_getElevatorSetListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		app.lookup("sms_getOptionElevator").send();
	} else {
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_getElevatorSetListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_getElevatorSetListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getPoscoPartnersSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getPoscoPartners = e.control;
	
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if (resultCode != COMERROR_NONE) {
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_UserUpdate";
		if (errStr.length > 0) {
			errMsg = dataManager.getString(errStr);
		} else {
			errMsg = dataManager.getString(errMsg);
		}
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
	}
	
}

function onSms_postCustomHDHISubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode != COMERROR_NONE) {
		comLib.hideLoadMask();
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_ErrorSaveUserPictureCustomHDHI";
		if (errStr.length > 0) {
			errMsg = dataManager.getString(errStr);
		} else {
			errMsg = dataManager.getString(errMsg);
		}
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
	} else {
//		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_UserUpdate"));
		var dmUserCustomHDHI = app.lookup("UserCustomHDHI");
		var udcUserInfo = app.lookup("userInfoCustomLayout").getChild("UserInfoCustomHDHI");
		var newUserCustomHDHI = udcUserInfo.getUserCustomHDHI();
		
		dmUserCustomHDHI.setValue("PartnerID", newUserCustomHDHI.getValue("PartnerID"));
		dmUserCustomHDHI.setValue("Nationality", newUserCustomHDHI.getValue("Nationality"));

		var smsPostCustomHDHI = app.lookup("sms_postCustomHDHI");
		smsPostCustomHDHI.action = "/v1/hdhi/users/" + app.lookup("USINB_ipbUserID").value;
		smsPostCustomHDHI.send();
	}
}

function onSms_postCustomHDHISubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_postCustomHDHISubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

function onSms_getCustomHDHISubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dmUserCustomHDHI = app.lookup("UserCustomHDHI");
		var udcHDHI = app.lookup("userInfoCustomLayout").getChild("UserInfoCustomHDHI");
		udcHDHI.setUserCustomHDHI(dmUserCustomHDHI);
		var agreeStr = "개인정보동의 일자: ";
		if (dmUserCustomHDHI.getValue("AgreeFlag") == 1){
			agreeStr += dateUtil.makeDateFormat(dmUserCustomHDHI.getValue("AgreeDate"), "-");
		} else {
			agreeStr += "-----";		
		}
		app.lookup("USINT_OpbAgreeHDHI").value = agreeStr;
		app.lookup("USINT_OpbAgreeHDHI").visible = true;
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_getCustomHDHISubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_getCustomHDHISubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

function onSms_postCustomHDHISubmitDone2(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_UserUpdate"));
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_postCustomHDHISubmitError2(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_postCustomHDHISubmitTimeout2(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getAlmaraiDescriptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	comLib.hideLoadMask();
	var sms_getAlmaraiDescription = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dmALMARAIUser = app.lookup("UserDescription");
		var udcUserInfo = app.lookup("userInfoCustomLayout").getChild("UserInfoCustomALMARAI");
		
		var description = dmALMARAIUser.getValue("Description");
		udcUserInfo.setUserDescriptionInfoALMARAI(description);
		
	} else {
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_UserUpdate";
		if (errStr.length > 0) {
			errMsg = dataManager.getString(errStr);
		} else {
			errMsg = dataManager.getString(errMsg);
		}
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
	}
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postPutAlmaraiDescriptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_postPutAlmaraiDescription = e.control;
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode != COMERROR_NONE) {
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_UserUpdate";
		if (errStr.length > 0) {
			errMsg = dataManager.getString(errStr);
		} else {
			errMsg = dataManager.getString(errMsg);
		}
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
	}
}
