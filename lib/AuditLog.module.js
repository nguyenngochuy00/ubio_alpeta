/************************************************
 * AuditLog.module.js
 * Created at 2023. 5. 3. 오전 9:59:42.
 *
 * @author pse
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");

// 시스템로그 카테고리를 데이터 셋 형식으로 반환
globals.getAuditCategory = function(){
	dataManager = getDataManager();
	var dsCategory = new cpr.data.DataSet("auditCategoryList");
	
	dsCategory.parseData({
		"columns": [
			{
				"name": "label",
				"dataType": "string"
			},
			{
				"name": "value",
				"dataType": "number"
			}
		],
		"rows": [
			{"label": dataManager.getString("Str_AuditCategoryUser"), "value": 1},
			{"label": dataManager.getString("Str_AuditCategoryTerminal"), "value": 2},
			{"label": dataManager.getString("Str_AuditCategoryACU"), "value": 3},
			{"label": dataManager.getString("Str_AuditCategoryVisitor"), "value": 4},
			{"label": dataManager.getString("Str_AuditCategoryBlacklist"), "value": 5},
			{"label": dataManager.getString("Str_AuditCategoryTimezone"), "value": 6},
			{"label": dataManager.getString("Str_AuditCategoryTimezoneDay"), "value": 7},
			{"label": dataManager.getString("Str_AuditCategoryTimezoneHoliday"), "value": 8},
			{"label": dataManager.getString("Str_AuditCategoryAntiPassback"), "value": 9},
			{"label": dataManager.getString("Str_AuditCategoryPosition"), "value": 10},
			{"label": dataManager.getString("Str_AuditCategoryAccessControl"), "value": 11},
			{"label": dataManager.getString("Str_AuditCategoryMobileCard"), "value": 12},
			{"label": dataManager.getString("Str_AuditCategoryTna"), "value": 13},
			{"label": dataManager.getString("Str_AuditCategoryMeal"), "value": 14},
			{"label": dataManager.getString("Str_AuditCategoryGroup"), "value": 15},
			{"label": dataManager.getString("Str_AuditCategoryPrivilege"), "value": 16},
			{"label": dataManager.getString("Str_AuditCategorySetting"), "value": 17},
			{"label": dataManager.getString("Str_AuditCategoryUserMessage"), "value": 18},
			{"label": dataManager.getString("Str_AuditCategoryWiegand"), "value": 20},
			{"label": dataManager.getString("Str_AuditCategoryWebClient"), "value": 21}, // 웹클라이언트
			{"label": dataManager.getString("Str_AuditCategoryMustering"), "value": 22},
			{"label": dataManager.getString("Str_AuditCategoryVMS"), "value": 23},
			{"label": dataManager.getString("Str_AuditCategoryNotice"), "value": 24},
			{"label": dataManager.getString("Str_AuditCategoryLocationShape"), "value": 25},
			{"label": dataManager.getString("Str_AuditCategoryLocationArea"), "value": 26},
			{"label": dataManager.getString("Str_AuditCategoryCardLayout"), "value": 27},
			{"label": dataManager.getString("Str_AuditCategoryElevator"), "value": 28},
			{"label": dataManager.getString("Str_AuditCategoryOptionSetting"), "value": 29},
			{"label": dataManager.getString("Str_AuditCategoryTnaResult"), "value": 30},
			{"label": dataManager.getString("Str_PassManagement"), "value": 9000}, // 출입증
			{"label": dataManager.getString("Str_VisitRequest"), "value": 9001}, // 방문신청
			{"label": dataManager.getString("Str_JwdOtherUnit"), "value": 9002}, // 타부대원
			{"label": dataManager.getString("Str_LprManagement"), "value": 9003}, // 방문신청
			{"label": dataManager.getString("Str_CarInfoListManagement"), "value": 9004}, // 방문신청
			{"label": dataManager.getString("Str_BparkPaymentManagement"), "value": 9010} // 결제관리
		]
	});
	
	if(dataManager.getOemVersion() == OEM_REMOTE_FAW_MANAGEMENT){
		dsCategory.addRowData({"label": dataManager.getString("Str_AuthTerminalUser"), "value": 31});
		dsCategory.addRowData({"label": dataManager.getString("Str_AuthTerminalUsersAllDelete"), "value": 32});		
	}

	return dsCategory;
}

// 시스템로그 항목을 데이터 셋 형식으로 반환
globals.getAuditContent = function(){
	dataManager = getDataManager();
	var dsContent = new cpr.data.DataSet("auditContentList");
	
	dsContent.parseData({
		"columns": [
			{
				"name": "label",
				"dataType": "string"
			},
			{
				"name": "value",
				"dataType": "number"
			}
		],
		"rows": [
			{"label": dataManager.getString("Str_AuditContentUser"), "value": 1},
			{"label": dataManager.getString("Str_AuditContentUserFP"), "value": 2},
			{"label": dataManager.getString("Str_AuditContentUserFA"), "value": 3},
			{"label": dataManager.getString("Str_AuditContentUserRFCard"), "value": 4},
			{"label": dataManager.getString("Str_AuditContentUserPassword"), "value": 5},
			{"label": dataManager.getString("Str_AuditContentUserMobileCard"), "value": 6},
			{"label": dataManager.getString("Str_AuditContentTerminal"), "value": 7},
			{"label": dataManager.getString("Str_AuditContentTerminalControl"), "value": 8},
			{"label": dataManager.getString("Str_AuditContentTerminalNotice"), "value": 9},
			{"label": dataManager.getString("Str_AuditContentACU"), "value": 10},
			{"label": dataManager.getString("Str_AuditContentACUControl"), "value": 11},
			{"label": dataManager.getString("Str_AuditContentVisitor"), "value": 12},
			{"label": dataManager.getString("Str_AuditContentBlacklist"), "value": 13},
			{"label": dataManager.getString("Str_AuditContentAccessControl"), "value": 14},
			{"label": dataManager.getString("Str_AuditContentAccessGroup"), "value": 15},
			{"label": dataManager.getString("Str_AuditContentAccessGroupTerminal"), "value": 16},
			{"label": dataManager.getString("Str_AuditContentAccessGroupUser"), "value": 17},
			{"label": dataManager.getString("Str_AuditContentMobileCard"), "value": 18},
			{"label": dataManager.getString("Str_AuditContentMobileCardSetting"), "value": 19},
			{"label": dataManager.getString("Str_AuditContentTna"), "value": 20},
			{"label": dataManager.getString("Str_AuditContentTnaSetting"), "value": 21},
			{"label": dataManager.getString("Str_AuditContenteMeal"), "value": 22},
			{"label": dataManager.getString("Str_AuditContentMealSetting"), "value": 23},
			{"label": dataManager.getString("Str_AuditContentGroup"), "value": 24},
			{"label": dataManager.getString("Str_AuditContentSetting"), "value": 25},
			{"label": dataManager.getString("Str_AuditContentSettingEmergency"), "value": 26},
			{"label": dataManager.getString("Str_AuditContentSettingEmail"), "value": 27},
			{"label": dataManager.getString("Str_AuditContentTerminalFirmware"), "value": 28},
			{"label": dataManager.getString("Str_AuditContentWebClient"), "value": 29},
			{"label": dataManager.getString("Str_AuditContentVisitApplication"), "value": 30},
			{"label": dataManager.getString("Str_AuditContentTerminalUserFile"), "value": 32},
			{"label": dataManager.getString("Str_AuditContentTerminalUser"), "value": 33},
			{"label": dataManager.getString("Str_AuditContentTerminalAdmin"), "value": 34},
			{"label": dataManager.getString("Str_AuditContentSysLogTimeLine"), "value": 35},
			{"label": dataManager.getString("Str_AuditContentSysLogTimeZone"), "value": 36},
			{"label": dataManager.getString("Str_AuditContentSysLogHoliday"), "value": 37},
			{"label": dataManager.getString("Str_AuditContentSysLogAccessGroup"), "value": 38},
			{"label": dataManager.getString("Str_AuditContentSysLogAccessArea"), "value": 39},
			{"label": dataManager.getString("Str_AuditContentSysLogAccessGroupUser"), "value": 40},
			{"label": dataManager.getString("Str_AuditContentSysLogTnaWorkShift"), "value": 41},
			{"label": dataManager.getString("Str_AuditContentSysLogTnaWorkSchedule"), "value": 42},
			{"label": dataManager.getString("Str_AuditContentSysLogTnaWorkPayment"), "value": 43},
			{"label": dataManager.getString("Str_AuditContentSysLogMealManagement"), "value": 44},
			{"label": dataManager.getString("Str_AuditContentSysLogMealMenu"), "value": 45},
			{"label": dataManager.getString("Str_AuditContentSysLogWiegandIn"), "value": 46},
			{"label": dataManager.getString("Str_AuditContentSysLogWiegandOut"), "value": 47},
			{"label": dataManager.getString("Str_AuditContentSysLogStandardCard"), "value": 48},
			{"label": dataManager.getString("Str_AuditContentSysLogFPcard"), "value": 49},
			{"label": dataManager.getString("Str_Pass"), "value": 9000},
			{"label": dataManager.getString("Str_VisitRequest"), "value": 9001},
			{"label": dataManager.getString("Str_JwdOtherUnit"), "value": 9002},
			{"label": dataManager.getString("Str_LprManagement"), "value": 9003},
			{"label": dataManager.getString("Str_SysLogContentCarInfo"), "value": 9004},
			{"label": dataManager.getString("Str_BPARK_SysLogContentUserGroupIn"), "value": 9010}, // 그룹 IN
			{"label": dataManager.getString("Str_BPARK_SysLogContentUserGroupOut"), "value": 9011}, // 그룹 OUT
			{"label": dataManager.getString("Str_BPARK_SysLogContentTicketIssued"), "value": 9012}, // 정기권 발급
			{"label": dataManager.getString("Str_BPARK_SysLogContentTicketExtension"), "value": 9013}, // 정기권 연장
			{"label": dataManager.getString("Str_BPARK_SysLogContentTicketCollect"), "value": 9014}, // 정기권 회수
			{"label": dataManager.getString("Str_BPARK_DayPayment"), "value": 9015} // 당일 결제
		]
	});
	
	return dsContent;
}

// 시스템로그 동작을 데이터 셋 형식으로 반환
globals.getAuditAction = function(){
	dataManager = getDataManager();
	var dsAction = new cpr.data.DataSet("auditActionList");
	
	dsAction.parseData({
		"columns": [
			{
				"name": "label",
				"dataType": "string"
			},
			{
				"name": "value",
				"dataType": "number"
			}
		],
		"rows": [
			{"label": dataManager.getString("Str_AuditActingRegist"), "value": 1},
			{"label": dataManager.getString("Str_AuditActingModify"), "value": 2},
			{"label": dataManager.getString("Str_AuditActingDelete"), "value": 3},
			{"label": dataManager.getString("Str_AuditActingApply"), "value": 4},
			{"label": dataManager.getString("Str_AuditActingSetting"), "value": 5},
			{"label": dataManager.getString("Str_AuditActingRelease"), "value": 6},
			{"label": dataManager.getString("Str_AuditActingDoorOpen"), "value": 7},
			{"label": dataManager.getString("Str_AuditActingDoorLock"), "value": 8},
			{"label": dataManager.getString("Str_AuditActingDoorUnLock"), "value": 9},
			{"label": dataManager.getString("Str_AuditActingTerminalLock"), "value": 10},
			{"label": dataManager.getString("Str_AuditActingTerminalUnLock"), "value": 11},
			{"label": dataManager.getString("Str_AuditActingInitTotal"), "value": 12},
			{"label": dataManager.getString("Str_AuditActingInitSetting"), "value": 13},
			{"label": dataManager.getString("Str_AuditActingInitAuthLog"), "value": 14},
			{"label": dataManager.getString("Str_AuditActingInitUser"), "value": 15},
			{"label": dataManager.getString("Str_AuditActingMoileLogin"), "value": 16},
			{"label": dataManager.getString("Str_AuditActingMoileLogout"), "value": 17},
			{"label": dataManager.getString("Str_AuditActingTaskCompleteDelete"), "value": 18},
			{"label": dataManager.getString("Str_AuditActingClientLogin"), "value": 19},
			{"label": dataManager.getString("Str_AuditActingClientLogout"), "value": 20},
			{"label": dataManager.getString("Str_AuditActingClientLoginFailed"), "value": 22},
			{"label": dataManager.getString("Str_AuditActingView"), "value": 23},
			{"label": dataManager.getString("Str_AuditActionTransfer"), "value": 24},
			{"label": dataManager.getString("Str_AuditActionTransferFailed"), "value": 25},
			{"label": dataManager.getString("Str_AuditActionTerminalUserUpload"), "value": 26},
			{"label": dataManager.getString("Str_AuditActionTerminalUserUploadFailed"), "value": 27},
			{"label": dataManager.getString("Str_AuditActionFailed"), "value": 28},
			{"label": dataManager.getString("Str_AuditActionApplication"), "value": 29},
			{"label": dataManager.getString("Str_AuditActionCancel"), "value": 30},
			{"label": dataManager.getString("Str_AuditActionReboot"), "value": 31},
			{"label": dataManager.getString("Str_VisitRequestApproval"), "value": 9001},
			{"label": dataManager.getString("Str_VisitRequestDeny"), "value": 9002},
			{"label": dataManager.getString("Str_Issued"), "value": 9003},
			{"label": dataManager.getString("Str_DoorRemoteOpen"), "value": 131082},
			{"label": dataManager.getString("Str_DoorRemoteUnlock"), "value": 131083}, 
			{"label": dataManager.getString("Str_DoorRemoteLock"), "value": 131084}
		]
	});
	
	return dsAction;
}