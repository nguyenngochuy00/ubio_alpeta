
// 자운대 정의값과 비교하여 일치하는 타입은 같은 값으로 설정
globals.ErrorAmhqCardIsIssueStatus          = 0x7F000010; // 교부 중인카드
globals.ErrorAmhqCardIsAccidentStatus       = 0x7F000011; // 사고 중인카드
globals.ErrorAmhqCardIsStopUsingStatus      = 0x7F000012; // 사용정지 중인카드
globals.ErrorAmhqCardIsIncidentLostStatus   = 0x7F000013; // 분실 중인카드
globals.ErrorAmhqCardIsIncidentDamageStatus = 0x7F000014; // 훼손 중인카드
globals.ErrorAmhqTempCardIsIssueStatus      = 0x7F000015 // 임시출입증 교부 상태

// 육군본부 mail error
globals.ErrorMailDialFail             = 0x70000010 // 임시 비밀번호 메일 new SMTP Dialer 생성 오류
globals.ErrorTempPasswordMailSendFail = 0x70000011 // 임시 비밀번호 메일 전송 실패
globals.ErrorUserNoEmailAddress       = 0x70000012 // 사용자 이메일 주소 없음
globals.ErrorBeforesendNextTimeMail   = 0x70000013 // 이미 발송 완료 (대기 시간)
globals.ErrorTempPasswordSendSuccess  = 0x70000014 // 임시비밀번호 전송 완료
globals.ErrorTempPasswordLoginSuccess = 0x70000015 // 임시비밀번호 로그인 성공
globals.ErrorTempPasswordLoginFail    = 0x70000016 // 임시비밀번호 로그인 실패
globals.ErrorTempPasswordExpiration         = 0x70000017 // 임시비밀번호 만료 (메일보내고 now+5분,인증성공후 now+5분)
globals.ErrorTempPasswordMailRecordNotFound = 0x70000018 // 임시비밀번호 보낸 기록 없음
globals.ErrorNotDuplicateUser 				= 0x70000019 // 신청가능한 사용자

globals.UserPrivArmyOnDuty = 900 //현역
globals.UserPrivArmyOtherUnit = 901  //타부대원
globals.UserPrivArmyForeign   = 902 //민간인
globals.UserPrivArmyResident          = 903 //상주
globals.UserPrivArmyRegular           = 904 // 고정 출입자, 상시
globals.UserPrivArmySoldier           = 905 //병사
globals.UserPrivArmyFamily            = 906 // 군가족
globals.UserPrivArmyMilitaryPersonnel = 907 //군무원
globals.UserPrivArmyPublicService	  = 908 // 공무직

globals.UserPrivArmyOnDutyNMilitaryPerson = 10000 // 현역,군무원, 공무직.. 체계 로그인 사용자
globals.UserPrivArmyFixPersion            = 10001 // 고정출입자. 병사/군가족/상주민간인/고정출입자
globals.UserPrivArmyNotVisit            = 10002 // 고정출입자. 병사/군가족/상주민간인/고정출입자

globals.AccessCardStatusNone       = 0 // 미사용
globals.AccessCardStatusPrintReady = 1 // 출력대기
globals.AccessCardStatusIssueReady = 2 // 발급 대기 
globals.AccessCardStatusIssue      = 3 // 발급 
globals.AccessCardStatusIssuance   = 4 // 교부
globals.AccessCardStatusRetrive    = 5 // 회수
globals.AccessCardStatusAccident   = 6 // 사고
globals.AccessCardStatusStopUsing  = 7 // 사용중단
globals.AccessCardStatusExpiration = 63
globals.AccessCardStatusForcedRetrive  = 64 // 강제회수

globals.AccessCardStatusIssueOrRetrive      = 100 // 발급 or 회수. 검색 조건으로 사용시
globals.AccessCardStatusIssueable = 101 // 출력대기,발급대기,발급
globals.AccessCardStatusIssuanceStatus      = 102 // 교부현황  교부,회수,사고 ..
globals.AccessCardStatusIncident = 103 // 사고처리, 교부, 사고..

globals.AccessCardTypeSoldier      = 1   // 병사
globals.AccessCardTypeFamily       = 2   // 군가족
globals.AccessCardTypeResident     = 3   // 상주민간인
globals.AccessCardTypeVisitor      = 4   // 방문자
globals.AccessCardTypeRegular      = 5   // 고정 출입자
globals.AccessCardTypeOtherUnit    = 6   // 공사. 타부대원
globals.AccessCardTypeForeign      = 7   // 면회 (민간인?)
globals.AccessCardTypeTempory      = 100 // 임시출입증
globals.AccessCardTypeCivilService = 200 // 공무원증

globals.AccessCardTypeFix   = 1000 // 고정 출입증 (  1,2,3,5)
globals.AccessCardTypeVisit = 1001 // 방문증 4, 6, 7
globals.AccessCardTypeSnC   = 1002 // 현역/공무원 (  1,2,3,5)

globals.CivilServiceCardNormal = 1 // 공무원증
globals.CivilServiceCardVisit = 2 // 방문 공무원증
globals.CivilServiceCardNarasarang = 3 // 나라사랑카드


globals.AccessApplicationStatusCreate   = 0 // 결재 생성
globals.AccessApplicationStatusWaiting  = 1 // 결재 대기
globals.AccessApplicationStatusProcess  = 2 // 결재 진행
globals.AccessApplicationStatusApproval = 3 // 결재 승인
globals.AccessApplicationStatusReject   = 4 // 결재 반려
globals.AccessApplicationStatusFinished = 5 // 처리완료

globals.AccessApplicationTypePrior = 1 // 사전신청
globals.AccessApplicationTypeOnSite = 2 // 현장신청
globals.AccessApplicationTypeVisit = 100 // 사전 or 현장 신청
globals.AccessApplicationTypeAccess = 101 // 출입신청

globals.AccessorAccessGroupCode = 9999 // 문서고 출입그룹 코드
globals.AccessorMusteringID = 9999 // 문서고 출입장소 ID

globals.getAccessCardTypeName = function( cardType, cardTypeEx, isVisit ){
	cardType = Number(cardType);
	cardTypeEx = Number(cardTypeEx);
	var name = "";
	if( cardType == globals.AccessCardTypeCivilService ){		
		switch(cardTypeEx){
			case 1: name = "공무원증"; break;
			case 2: name = "방문공무원증"; break;
			case 3: name = "나라사랑카드";break;
		}
	} else {
		switch(cardType){
			case globals.AccessCardTypeSoldier: name = "병사"; break; 
			case globals.AccessCardTypeFamily: name = "군가족"; break;
			case globals.AccessCardTypeResident: name = "상주민간인"; break;
			case globals.AccessCardTypeVisitor: name = "방문"; break;
			case globals.AccessCardTypeRegular:
				if (isVisit) { name = "방문"; } else { name = "고정출입자"; }
				break;
			case globals.AccessCardTypeOtherUnit:
				if (isVisit) { name = "공사"; } else { name = "타부대원"; }
				break;
			case globals.AccessCardTypeForeign: name = "면회"; break;
			case globals.AccessCardTypeTempory: name = "임시출입증"; break;
		}
	}
	return name
}

// 방문증 발급현황에서만 사용 (공무원증 , 출입증 배제)
globals.getAccessCardTypeValue = function(cardName){
	var cardTypeValue = 0;
	switch (cardName) {
		case "방문" : cardTypeValue = 4; break;
		case "공사" : cardTypeValue = 6; break;
		case "면회" : cardTypeValue = 7; break;
	}
	return cardTypeValue;
}

globals.getAccessCardStatusName = function( cardStatus ){
	cardStatus = Number(cardStatus);
	var name = "";
	switch (cardStatus) {
		case 1:	name = "출력대기";		break;
		case 2:	name = "발급대기";				break;
		case 3:	name = "발급";				break;
		case 4:	name = "교부";				break;
		case 5:	name = "회수";				break;
		case 6:	name = "사교";				break;
		case 7:	name = "사용중단";			break;
		case 61:	name = "분실";			break;
		case 62:	name = "훼손";			break;
		case 63:	name = "기간만료";			break;
		case 64:	name = "강제회수";			break;
	}
	return name
}

globals.getUserTypeName = function( userType ){
	userType = Number(userType);
	var name = "";
	switch (userType) {
		case globals.UserPrivArmyOnDuty:	name = "현역";		break;
		case globals.UserPrivArmyOtherUnit:	name = "타부대원";				break;
		case globals.UserPrivArmyForeign:	name = "민간인";				break;
		case globals.UserPrivArmyResident:	name = "상주민간인";				break;
		case globals.UserPrivArmyRegular:	name = "고정 출입자";				break;
		case globals.UserPrivArmySoldier:	name = "병사";				break;
		case globals.UserPrivArmyFamily:	name = "군가족";			break;
		case globals.UserPrivArmyMilitaryPersonnel:	name = "군무원";			break;
		case globals.UserPrivArmyPublicService:	name = "공무직";			break;
	}
	return name
}

globals.getUserTypeID = function( userTypeName ){
	var userTypeID = 0;	
	switch (userTypeName) {
		case "현역":		userTypeID = globals.UserPrivArmyOnDuty;  break;
		case "타부대원": 	userTypeID = globals.UserPrivArmyOtherUnit;  break;
		case "민간인": 	userTypeID = globals.UserPrivArmyForeign;  break;
		case "상주민간인":	userTypeID = globals.UserPrivArmyResident;  break;
		case "고정 출입자":	userTypeID = globals.UserPrivArmyRegular;  break;
		case "병사":		userTypeID = globals.UserPrivArmySoldier;  break;
		case "군가족":		userTypeID = globals.UserPrivArmyFamily;  break;
		case "군무원":		userTypeID = globals.UserPrivArmyMilitaryPersonnel;  break;
		case "공무직":		userTypeID = globals.UserPrivArmyPublicService;  break;
	}
	return userTypeID
}

// 방문증 전체 현황에서 사용하기 위해 만듦... - pse
globals.getAccessCardTypeNameforList = function(cardTypeValue){
	cardTypeValue = Number(cardTypeValue);
	var name = "";
	if( cardTypeValue > 200 ){		
		switch(cardTypeValue){
			case 201: name = "공무원증"; break;
			case 202: name = "방문공무원증"; break;
			case 203: name = "나라사랑카드";break;
		}
	} else {
		switch(cardTypeValue){
			case globals.AccessCardTypeSoldier: name = "출입증(병사)"; break; 
			case globals.AccessCardTypeFamily: name = "출입증(군가족)"; break;
			case globals.AccessCardTypeResident: name = "출입증(상주민간인)"; break;
			case globals.AccessCardTypeVisitor: name = "방문증(방문)"; break;
			case globals.AccessCardTypeRegular: name = "출입증(고정출입자)"; break;
			case globals.AccessCardTypeOtherUnit: name = "방문증(공사)"; break;
			case globals.AccessCardTypeForeign: name = "방문증(면회)"; break;
			case globals.AccessCardTypeTempory: name = "임시출입증"; break;
		}
	}
	return name
}

// 부서별 관리 기능을 위해 추가 -mjy
/**
 * 로그인한 사용자 그룹 아이디. Master는 0 반환.
 */
globals.getLoginUserGroupCode = function() {
	// 로그인한 사용자의 그룹코드 가져오기
	var dataManager = getDataManager();
	if(dataManager.getAccountID() == 1000000000000000000){
		return 0;
	}
	
	var userInfo = dataManager.getUserInfoARMHQ();
	return userInfo.getValue("GroupCode");
}

// 로그인한 사용자의 상위 그룹 코드 가져오기 (22년도 - 1뎁스만 가능할 때)
globals.getLoginUserParentGroup = function() {
	// 로그인한 사용자의 그룹코드 가져오기
	var dataManager = getDataManager();
	var userInfo = dataManager.getUserInfoARMHQ();
	var userGroupCode = userInfo.getValue("GroupCode");
	
	var groupList = dataManager.getGroup();
	var row = groupList.findFirstRow("GroupID == " + userGroupCode);
	
	return row.getValue("Parent");
}

// 로그인한 사용자가 최상위 그룹 사용자 인지 확인 (22년도)
globals.isSuperGroupAdmin = function() {
	// 로그인한 사용자의 그룹코드 가져오기
	var dataManager = getDataManager();
	if(dataManager.getAccountID() == 1000000000000000000){
		return true;
	} else {
		var userInfo = dataManager.getUserInfoARMHQ();
		var privilege = dataManager.getAccountInfo().getValue("Privilege");
		var userGroupCode = userInfo.getValue("GroupCode");
		if (userGroupCode < 1){ // 마스터가 아닌 사용자가 속한 부서가 없을 경우
			return false;
		}
		
		var groupList = dataManager.getGroup();
		var row = groupList.findFirstRow("GroupID == " + userGroupCode);
		var parent = row.getValue("Parent");
		//console.log(privilege + " / " + parent);
		if (privilege == 1 && parent == 0){
			return true;
		} else {
			return false;
		}
	}	
}

/**
 * 로그인한 사용자의 권한이 관리자인지 확인. 
 * Master또는 관리가 권한일 경우 true.
 * 그 외에는 false.
 */
globals.isLoginUserPrivAdmin = function() {
	// 로그인한 사용자의 그룹코드 가져오기
	var dataManager = getDataManager();
	if(dataManager.getAccountID() == 1000000000000000000){
		return true;
	}
	
	var userInfo = dataManager.getUserInfoARMHQ();
	var privilege = dataManager.getAccountInfo().getValue("Privilege");
	if (privilege == 1){
		return true;
	}
	return false;		
}

/**
 * 로그인한 사용자의 하위 그룹과 본인 그룹 리스트 가져오기
 */
globals.getChildGroupList = function() {
	var dataManager = getDataManager();
//	var userInfo = dataManager.getUserInfoARMHQ();
	
//	var groupList = dataManager.getGroup();
//	groupList.setFilter("Parent == " + userInfo.getValue("GroupCode") + " || GroupID == " + userInfo.getValue("GroupCode"));
	//var rows = groupList.findAllRow("Parent == " + userInfo.getValue("GroupCode"));
	//return rows
	var groupList = dataManager.getLoginUserGroups();
	return groupList;
}

/**
 * Master 계정으로 로그인했는지 여부
 */
globals.isLoginMaster = function() {
	// 로그인한 사용자의 그룹코드 가져오기
	var dataManager = getDataManager();
	if(dataManager.getAccountID() == 1000000000000000000){
		return true;
	}
	return false;
}

/**
 * 로그인한 사용자의 부서 뎁스 값 가져오기  .
 * Master는 0 반환. 나머지 사용자는 본인이 속한 부서의 뎁스값 반환.
 */
globals.getLoginUserGroupDepth = function() {
	// 로그인한 사용자의 그룹코드 가져오기
	var dataManager = getDataManager();
	var userInfo = dataManager.getUserInfoARMHQ();
	var userGroupID = userInfo.getValue("GroupCode");
	if(userInfo.getValue("UserID") == 1000000000000000000){
		return 0;
	} 
	
	var groupList = dataManager.getLoginUserGroups();
	var row = groupList.findFirstRow("GroupID == " + userGroupID);
	var ids = row.getValue("Description").split('/');
//	console.log(ids);
	return (ids.length -1);
}

/**
 * 부서 뎁스 값 가져오기  .
 * 최상위 : 0
 *  ㄴ 하위1: 1
 *	     ㄴ 하위 2: 2
 * 		ㄴ 하위 3: 3
 */
//globals.getGroupDepth = function(groupID) {
//	var dataManager = getDataManager();
//	var groupList = dataManager.getLoginUserGroups();
//	var row = groupList.findFirstRow("GroupID == " + groupID);
//	var ids = row.getValue("Description").split('/');
////	console.log(ids);
//	return (ids.length -1);
//}

/**
 * 로그인한 사용자가 속한 부서를 기준으로 생성되는 링크드 콤보 박스 최대 개수 .(현재 부서 뎁스 + 하위 부서 뎁스)
 * 현재는 뎁스 3까지 부서 생성 가능으로 링크드 콤보 박스 최대 개수는 4.
 * Master는 전체 부서 중 최대 뎁스를 기준으로 판단.
 * 최상위 부서라도 밑에 하위 부서가 없다면 링크드 콤보 박스는  최대 개수는 1개임.
 * Master가 아닌데 부서 값이 0이면 -1 반환. 
 */
globals.getGroupLinkCombBoxCount = function() {
	// 로그인한 사용자의 그룹코드 가져오기
	var dataManager = getDataManager();
	var userInfo = dataManager.getUserInfoARMHQ();
	var userGroupID = userInfo.getValue("GroupCode");
	var groupList = dataManager.getLoginUserGroups();
	var curDepth = 0;
	if(userInfo.getValue("UserID") != 1000000000000000000){
		if (userGroupID == 0){
			return -1;
		}
		var row = groupList.findFirstRow("GroupID == " + userGroupID);
		var ids = row.getValue("Description").split('/');
		curDepth = ids.length -1;		
	} else {
		groupList = dataManager.getGroup();
	}
	
	row = null;
	var maxLen = 1;
	for (var i = 0; i < groupList.getRowCount(); i++){
		row = groupList.getRow(i);
		var tmp = row.getValue("Description").split('/');
		if (maxLen < tmp.length){
			maxLen = tmp.length;
		}
		
		if (maxLen == 4){ // 현재는 뎁스 3까지 부서 생성 가능
			break;
		}
	}
	return (maxLen - curDepth);
}


/**
 * 해당 부서의 상위 경로 부서들 정보 가져오기(데이터 셋).
 * parent가 0인 최상위 부서는 null 반환
 */
globals.getParentGroupList = function(groupID) {
	var dataManager = getDataManager();
	var groupList = dataManager.getGroup();
	var gInfo = groupList.findFirstRow("GroupID == " + groupID);
	if (gInfo.getValue("Parent") == 0){
		return null;
	}
	
	var groups = new cpr.data.DataSet("groups");
	groups.parseData({
		"columns":[
			{
				"name": "GroupID",
				"dataType": "number"
			},
			{
				"name": "Parent",
				"dataType": "number"
			},
			{
				"name": "Name"
			},
			{
				"name": "Description"
			},
		]
	});
	
	var pIDs = gInfo.getValue("Description").split('/');
	for (var i = 0; i < pIDs.length; i++){
		var row = groupList.findFirstRow("GroupID == " + pIDs[i]);
		groups.addRowData(row.getRowData());
	}
	groups.commit();
	return groups;	
}

/**
 * 그룹 아이디로 해당 그룹의 뎁스값 가져오기. parent가 0이면 뎁스 0. 최대 뎁스 3을 초과하면 -1
 * @param {groupID} 그룹 아이디
 */
globals.getGroupDepth = function(groupID){
	var depth = 0;
	var dataManager = getDataManager();
	var groupList = dataManager.getGroup();
	var groupInfo = groupList.findFirstRow("GroupID == " + groupID);
	
	if (groupID > 0){
		var parent = groupInfo.getValue("Parent");
		if (parent > 0){
			for(var idx = 0; idx < 3; idx++){
				depth++;
				groupInfo = null;
				groupInfo = groupList.findFirstRow("GroupID == " + parent);
				parent = groupInfo.getValue("Parent");
				if (parent == 0){
					break;
				}
				
				if (idx == 2 && parent != 0){
					depth = -1;
				}			
			}
		}		
	}
	return depth;
}

/**
 * 로그인한 사용자의 관리 가능한 부서 아이디 값들 가져오기(본인 부서 + 하위 부서)
 */
globals.getLoginUserAccessibleGroupIDs = function(){
	var ids = [];
	var dataManager = getDataManager();
	var groupList = dataManager.getLoginUserGroups();
	if (groupList == null || groupList.getRowCount() < 1){
		return ids;
	}
	
	for(var i = 0; i < groupList.getRowCount(); i++){
		var row = groupList.getRow(i);
		ids[i] = row.getValue("GroupID");
	}	
	return ids;
}

/**
 * 해당 부서의 id가 로그인한 사용자의 관리 가능한 부서인지 true, false 반환
 * 본인 부서 및 하위 부서 아이디일 경우 true.
 * 그 외에는 false 반환.
 * @param {groupID} 부서 아이디
 */
globals.isAccessibleGroup = function(groupID){
	groupID = Number(groupID);
	var dataManager = getDataManager();
	var groupList = dataManager.getLoginUserGroups();
//	console.log(groupList.getRowDataRanged());
	if (groupList == null || groupList.getRowCount() < 1){
		return false;
	}

	var row = groupList.findFirstRow("GroupID == " + groupID);
	if (row == null || row == undefined){
		return false;
	}
	return true;
}


/**
 * 상위 부서 가져오기 (22년도 용- 1뎁스)
 */
globals.getParentgroupcode = function() {
	var dataManager = getDataManager();
	var groups = dataManager.getGroup();
	var parentgroups = new cpr.data.DataSet("parentgroups");
	parentgroups.parseData({
		"columns":[
			{
				"name": "GroupID",
				"dataType": "number"
			},
			{
				"name": "Parent",
				"dataType": "number"
			},
			{
				"name": "Name"
			},
			{
				"name": "Description"
			},
		]
	});
	
	for (var i = 0; i < groups.getRowCount(); i++){
		if (groups.getValue(i, "Parent") == 0){
			parentgroups.addRowData(groups.getRowData(i));
		}	
	}	
	return parentgroups;
}

/**
 * 하위 부서 가져오기 (22년도 용- 1뎁스)
 * @param {string} 부모 부서 아이디
 */
globals.getChildgroupcode = function(parentgroupid) {
	parentgroupid = Number(parentgroupid);
	var dataManager = getDataManager();
	var groups = dataManager.getGroup();
	var childgroups = new cpr.data.DataSet("childgroups");
	childgroups.parseData({
		"columns":[
			{
				"name": "GroupID",
				"dataType": "number"
			},
			{
				"name": "Parent",
				"dataType": "number"
			},
			{
				"name": "Name"
			},
			{
				"name": "Description"
			},
		]
	});
	for (var i = 0; i < groups.getRowCount(); i++){
		if( parentgroupid == 0 ) {	// 전체 하위부서
			if (groups.getValue(i, "Parent") != 0) {
				childgroups.addRowData(groups.getRowData(i));
			}
		} else if (groups.getValue(i, "Parent") == parentgroupid){
			console.log("gorups ParentID = " + groups.getValue(i, "Parent") + "GroupID ParentID = " + parentgroupid);
			childgroups.addRowData(groups.getRowData(i));
		}	
	}	
	
	return childgroups;
}


