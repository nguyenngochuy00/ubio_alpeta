/************************************************
 * AccessGroupManagement.js
 * Created at 2018. 11. 20. 오후 5:00:33.
 *
 * @author fois
 ************************************************/
var comLib;
var tempID;
var dataManager = cpr.core.Module.require("lib/DataManager");
var usint_version;
var userPrivilege;
var userGroup;
var userID;
var oemVersion;
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	comLib = createComUtil(app);	
	tempID = 1;
	userPrivilege = dataManager.getAccountInfo().getValue("Privilege");
	//console.log(dataManager.getAccountInfo().getDatas());
	oemVersion = dataManager.getOemVersion();
	if (oemVersion == OEM_KYOCERA){
		userGroup = dataManager.getAccountInfo().getValue("GroupCode");
		userID = dataManager.getAccountID();
	}

	var initValue = app.getHost().initValue;
	var dsAccessGroupList = app.lookup("AccessGroupList");
	var dsAccessAreaList = app.lookup("AccessAreaList");
	var dsAccessAreaGroupList = app.lookup("AccessAreaGroupList");	
	
	var accessGroupList = dataManager.getAccessGroup();
	accessGroupList.copyToDataSet(dsAccessGroupList);
	initValue["AccessAreaList"].copyToDataSet(dsAccessAreaList);
	//initValue["AccessAreaGroupList"].copyToDataSet(dsAccessAreaGroupList);
	dataManager.getAccessAreaGroup().copyToDataSet(dsAccessAreaGroupList); // initValue은 새로고침 안하면 출입구역 삭제된 리스트가 반영이 안돼서 수정
	
	var dsTreeContextMenu = app.lookup("dsTreeContextMenu");
	dsTreeContextMenu.addRowData({"label":dataManager.getString("Str_AccessGroupAdd"),"value":1,"parent":"0"});
	//dsTreeContextMenu.addRowData({"label":dataManager.getString("Str_AccessAreaAdd"),"value":2,"parent":"0"});
	//console.log(userGroup);
	if (oemVersion == OEM_KYOCERA){	// 로그인한 사용자 그룹 코드 가져오기 위한 처리	
		if (userGroup != null || userID == 1000000000000000000){ // 마스터는 그룹코드 필요없음
		// 또는 이전에 가져온 값이 있다면 그걸 사용
			refreshAccessGroupTree(0);
		} else {
			var submission = app.lookup("smsUserInfoReq");
			submission.setParameters("fingerprint", "false");
			submission.setParameters("face", "false");
			submission.setParameters("picture", "false");
			
			submission.action = "/v1/users/" + userID;
			submission.send();
			//console.log(submission.status);
		}	
	} else {
		refreshAccessGroupTree(0);
	}
}

/*
 * 출입 그룹 / 출입 구역을 트리 구조에 맞춰 dsTreeAccessGroup에 업데이트 
 */
function refreshAccessGroupTree(accessGroupCode){
	var dsAccessGroupList = app.lookup("AccessGroupList");
	dsAccessGroupList.setSort("ID");
	var dsAccessAreaList = app.lookup("AccessAreaList");
	var dsAccessAreaGroupList = app.lookup("AccessAreaGroupList");
	
	var dsTreeAccessGroupList = app.lookup("dsTreeAccessGroup");
	dsTreeAccessGroupList.clear();
	
	var groupCnt = dsAccessGroupList.getRowCount();
	for( var i = 0; i < groupCnt; i++ ){
		var group = dsAccessGroupList.getRow(i);
		var treeID = group.getValue("ID");
		var groupCode = group.getValue("Code");
		if (oemVersion == OEM_KYOCERA){
			if (userID == 1000000000000000000 || groupCode == userGroup) {
				//dsTreeAccessGroupList.addRowData({"ID":treeID,"Name":group.getValue("Name"),"Parent":"0","Code":treeID});
				dsTreeAccessGroupList.addRowData({"ID":treeID,"Name":group.getValue("Name"),"Parent":"0","Code":groupCode});
			}	
		} else {
			dsTreeAccessGroupList.addRowData({"ID":treeID,"Name":group.getValue("Name"),"Parent":"0","Code":treeID});
		}
		
	}
	//console.log(dsTreeAccessGroupList.getRowDataRanged());
	// 가상 아이디 할당 및 실제 아이디 저장	
	var areaGroupCnt = dsAccessAreaGroupList.getRowCount();
	//console.log(dsAccessAreaGroupList.getRowDataRanged());
	for( var i = 0; i < areaGroupCnt; i++ ){
		var areaGroup = dsAccessAreaGroupList.getRow(i);
		var areaID = areaGroup.getValue("AccessAreaID");
		var parent = areaGroup.getValue("AccessGroupID");
		if (userID == 1000000000000000000 || dsTreeAccessGroupList.findFirstRow("ID == " + parent) != null) {
			var treeID = "TC"+tempID;		
			tempID++;
			var areaInfo = dsAccessAreaList.findFirstRow("ID == "+ areaID);	
			if (areaInfo != null){ // 출입구역 삭제 된 상태에서 페이지 새로고침 안하면 오류 발생해 추가
				dsTreeAccessGroupList.addRowData({"ID":treeID,"Name":areaInfo.getValue("Name"),"Parent":parent,"Code":areaID});
			}	
		}
		
	}
	dsTreeAccessGroupList.setSort("label");
	
	var treeGroup = app.lookup("ACGRM_treeAccessGroup");
	if( treeGroup.getItemCount() > 0){
		if (accessGroupCode == 0){
			treeGroup.selectItem(0);
		} else {
			treeGroup.selectItemByValue(accessGroupCode);
			var treeItem = treeGroup.getItemByValue(accessGroupCode);
			if( treeItem ){
				treeGroup.expandItem(treeItem);
			}			
		}
		
	} else {
		var embDetailPage = app.lookup("ACGRM_emDetailPage");
//		embDetailPage.app = null;	
		var url = "app/main/accessGroup/pages/AccessGroupInfoPage" + "?" + usint_version;
		cpr.core.App.load(url, function(loadedApp){
			if (!loadedApp) {
				return;
			}					
			embDetailPage.app = loadedApp;
		});
	}
	var cmbKeyword = app.lookup("ACGRM_cmbKeyword");
	cmbKeyword.setItemSet(dsAccessGroupList, {
		label: "Name",
		value: "ID",
	});
	treeGroup.redraw();
}
/*
 * 출입그룹/구역 트리의 트리 아이템 선택시
 */
function onTreeAccessGroupSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Tree
	 */
	 
	var treeAccessGroup = e.control;
	var treeGroup = treeAccessGroup.getSelectionFirst();
	if(treeGroup == null){return;}
				
	var dsTreeAccessGroup = app.lookup("dsTreeAccessGroup");
	
	var treeItem = dsTreeAccessGroup.findFirstRow("ID == '"+ treeGroup.value+"'");
	
	var groupID = treeItem.getValue("Parent");
	//var code = treeItem.getValue("Code");
	var id = treeItem.getValue("ID");
	var groupCode = treeItem.getValue("Code");
	//console.log("groupCode : " + groupCode);
	var embDetailPage = app.lookup("ACGRM_emDetailPage");
	embDetailPage.app = null;	
	
	var url = "";
	if (treeGroup.parentValue == "0") {
				
		url = "app/main/accessGroup/pages/AccessGroupInfoPage";
		
		//var AccessGroupItem = app.lookup("AccessGroupList").findFirstRow("ID == '" + code +"'");
		var AccessGroupItem = app.lookup("AccessGroupList").findFirstRow("ID == '" + id +"'");
		var TimezoneID = AccessGroupItem.getValue("TimezoneID");
		var visitEnable = AccessGroupItem.getValue("VisitEnable");
		var elevatorSetID = AccessGroupItem.getValue("ElevatorSetID");
		embDetailPage.ready(function(){			
			if(embDetailPage.hasAppMethod("setAccessAreaList")){		
						
				var dsAccessAreaList = app.lookup("AccessAreaList");
				embDetailPage.callAppMethod("setAccessAreaList", dsAccessAreaList);
			}
			
			if(embDetailPage.hasAppMethod("setAccessAreaGroupList")){				
				var dsAccessAreaGroupList = app.lookup("AccessAreaGroupList");
				embDetailPage.callAppMethod("setAccessAreaGroupList", dsAccessAreaGroupList);
			}	
			
			if(embDetailPage.hasAppMethod("init")){
				//embDetailPage.callAppMethod( "init", "modify", code,treeItem.getValue("Name"), TimezoneID,visitEnable, elevatorSetID);
				if (dataManager.getOemVersion() == OEM_KYOCERA){
					if(groupCode == "") {
						groupCode = 0;
					}
					embDetailPage.callAppMethod( "init", "modify", id,treeItem.getValue("Name"), TimezoneID,visitEnable, elevatorSetID, groupCode);
				} else {
					embDetailPage.callAppMethod( "init", "modify", id,treeItem.getValue("Name"), TimezoneID,visitEnable, elevatorSetID, "");	
				}
			}		
		});		
		
	} else {		
		url = "app/main/accessGroup/pages/AccessAreaInfoPage";
		
		embDetailPage.ready(function(){
			if(embDetailPage.hasAppMethod("init")){	
				//embDetailPage.callAppMethod( "init", groupID, code);
				embDetailPage.callAppMethod( "init", groupID, groupCode);
			}
		});		
	}
	var url = url + "?" + usint_version;
	cpr.core.App.load(url, function(loadedApp){
		if (!loadedApp) {
			return;
		}
				
		embDetailPage.app = loadedApp;
	});
	app.lookup("ACGRM_cmbKeyword").selectItemByValue(treeGroup.value);
}

exports.getEmptyAccessGroupCode = function(){
	var code = 1;
	var dsAccessGroupList = app.lookup("AccessGroupList");
	while( true ){
		var groupRows = dsAccessGroupList.findFirstRow("ID == "+code);
		if( groupRows ){
			code++;			
		} else {
			break;
		}
	}
	return code;
}

exports.IsValidEmptyAccessGroupCode = function(groupCode){
	var dsAccessGroupList = app.lookup("AccessGroupList");
	var groupRows = dsAccessGroupList.findFirstRow("ID == "+groupCode);
	if( groupRows ){
		return false;
	}
	return true;
}

exports.IsValidEmptyAccessGroupName = function(groupName){
	var dsAccessGroupList = app.lookup("AccessGroupList");
	var groupRows = dsAccessGroupList.findFirstRow("Name == '"+groupName+"'");
	if( groupRows ){
		return false;
	}
	return true;
}

/*
 * 트리에서 contextmenu 이벤트 발생 시 호출.
 * 마우스의 오른쪽 버튼이 클릭되거나 컨텍스트 메뉴 키가 눌려지면 호출되는 이벤트.
 */
function onACGRM_treeAccessGroupContextmenu(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Tree
	 */
	var aCGRM_treeAccessGroup = e.control;
	e.preventDefault();
	
	var menu_1 = new cpr.controls.Menu();
	//menu_1.userAttr("owner", e.control.id);//e.targetControl.id	
	menu_1.setItemSet(app.lookup("dsTreeContextMenu"), {
		label: "label",
		value: "value",
		parentValue: "parent"
	});
			
	var rect = app.getActualRect();
	menu_1.style.css({
		left: (e.clientX - rect.left) + "px",
		top: (e.clientY - rect.top) + "px",
		height: "60px",
		width: "200px",
		position: "absolute"
	});
	menu_1.focus();
	
	menu_1.addEventListener("selection-change", function(e) {
			
			switch( menu_1.value ){
			case "1":
				var treeAccessGroup = app.lookup("ACGRM_treeAccessGroup");
				treeAccessGroup.clearSelection();
				
				var embDetailPage = app.lookup("ACGRM_emDetailPage");
				if(embDetailPage.hasAppMethod("setAccessAreaList")){		
							
					var dsAccessAreaList = app.lookup("AccessAreaList");
					embDetailPage.callAppMethod("setAccessAreaList", dsAccessAreaList);
				}
				
				if(embDetailPage.hasAppMethod("setAccessAreaGroupList")){				
					var dsAccessAreaGroupList = app.lookup("AccessAreaGroupList");
					embDetailPage.callAppMethod("setAccessAreaGroupList", dsAccessAreaGroupList);
				}
							
				if(embDetailPage.hasAppMethod("init")){
					embDetailPage.callAppMethod("init", "new","","");
				}		
				break;
			case "2":
				break;
			}
		
		menu_1.dispose();
	});
	// 메뉴에서 벗어날 경우의 이벤트 리스너.. 실제로는 안보이나 css를 통해 설정된 영역을 벗어나 클릭해야 사라짐.. 수정 필요..
	menu_1.addEventListener("blur", function(e) {
		menu_1.dispose();
	});
	app.floatControl(menu_1);
	
}

exports.deleteAccessGroup = function(accessGroupID, msg){
	if(msg){
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_AccessGroupDelete"));	
	}
	var dsAccessAreaGroupList = app.lookup("AccessAreaGroupList");
		
	var areaRows = dsAccessAreaGroupList.findAllRow("AccessGroupID == "+ accessGroupID);
	if(areaRows){
		areaRows.forEach(function(row){		
			dsAccessAreaGroupList.deleteRow(row.getIndex());
		});	
			
		dsAccessAreaGroupList.commit();
	}
	
	var dsAccessGroupList = app.lookup("AccessGroupList");
	var groupRow = dsAccessGroupList.findFirstRow("ID == "+accessGroupID);
	if (groupRow) {
		dsAccessGroupList.deleteRow(groupRow.getIndex());		
		dsAccessGroupList.commit();
	}
		
	refreshAccessGroupTree(0);
}

exports.updateAccessGroup = function(/*cpr.data.DataMap*/accessGroup, /*cpr.data.DataSet*/areaDatas, msg ){
	if(msg){
		dialogAlert(app, dataManager.getString("Str_Success"), msg);
	}
	var dsAccessAreaGroupList = app.lookup("AccessAreaGroupList");
	var accessGroupID = accessGroup.getValue("ID");
	
	var areaRows = dsAccessAreaGroupList.findAllRow("AccessGroupID == "+ accessGroupID);
	if( areaRows ){
		areaRows.forEach(function(row){		
			dsAccessAreaGroupList.deleteRow(row.getIndex());
		});
	}	
	
	var dsAccessGroupList = app.lookup("AccessGroupList");
	var groupRow = dsAccessGroupList.findFirstRow("ID == "+ accessGroupID);
	
	var oemVersion = dataManager.getOemVersion();
	if( groupRow == null ){			
		if (oemVersion != OEM_HE_CHUNGJU_FACTORY ) {
			if (oemVersion == OEM_KYOCERA){
				var insertedRow = dsAccessGroupList.addRowData({"ID":accessGroupID,"Name":accessGroup.getValue("Name"),
					"TimezoneID":accessGroup.getValue("TimezoneID"),"VisitEnable":accessGroup.getValue("VisitEnable"), 
					"ElevatorSetID": accessGroup.getValue("ElevatorSetID"), "Code": accessGroup.getValue("Code")});
				dataManager.insertAccessGroup(insertedRow.getRowData());
			} else {
				var insertedRow = dsAccessGroupList.addRowData({"ID":accessGroupID,"Name":accessGroup.getValue("Name"),
					"TimezoneID":accessGroup.getValue("TimezoneID"),"VisitEnable":accessGroup.getValue("VisitEnable"),
					"ElevatorSetID": accessGroup.getValue("ElevatorSetID")});
				dataManager.insertAccessGroup(insertedRow.getRowData());
			}
			
		}
	} else {
		groupRow.setValue("Name",accessGroup.getValue("Name"));
		groupRow.setValue("TimezoneID",accessGroup.getValue("TimezoneID"));
		groupRow.setValue("VisitEnable",accessGroup.getValue("VisitEnable"));
		groupRow.setValue("ElevatorSetID",accessGroup.getValue("ElevatorSetID"));
		if (oemVersion == OEM_KYOCERA){
			groupRow.setValue("Code", accessGroup.getValue("Code"));
		}
		dsAccessGroupList.commit();
		dataManager.updateAccessGroup(groupRow.getRowData());
	}	
		
	var dsAccessAreaGroupList = app.lookup("AccessAreaGroupList");
	
	var areaGroupRows = dsAccessAreaGroupList.findAllRow("AccessGroupID == "+accessGroup.getValue("ID"));
	if(areaGroupRows){
		areaGroupRows.forEach(function(row){		
			dsAccessAreaGroupList.deleteRow(row.getIndex());
		});
		dsAccessAreaGroupList.commit();
	}
	
	var cnt = areaDatas.getRowCount();
	for( var i = 0; i < cnt; i++ ){
		var row = areaDatas.getRow(i);		
		dsAccessAreaGroupList.addRowData({"AccessGroupID":accessGroupID,"AccessAreaID":row.getValue("ID")});
	};
	
	refreshAccessGroupTree(accessGroupID);
}

exports.deleteAccessAreaInAccessGroup = function(accessGroupID, accessAreaID){
	var dsAccessAreaGroupList = app.lookup("AccessAreaGroupList");
	
//	var areaGroupRows = dsAccessAreaGroupList.findAllRow("AccessGroupID == "+accessGroupID);
//	areaGroupRows.forEach(function(row){		
//		if( row.getValue("AccessAreaID")==accessAreaID){
//			dsAccessAreaGroupList.realDeleteRow(row.getIndex());
//			refreshAccessGroupTree(accessGroupID);
//			return;
//		}
//	});	
	
	// 출입그룹 메뉴에서 출입구역을 선택 후 삭제하면 해당 출입구역이 모든 출입그룹에서 삭제되는데 출입그룹 하나에서만 삭제 되도록 처리 된 부분 수정
	for (var i = 0; i < dsAccessAreaGroupList.getRowCount(); i++){
		var row = dsAccessAreaGroupList.getRow(i);
		if( row.getValue("AccessAreaID")==accessAreaID){
			dsAccessAreaGroupList.realDeleteRow(i);
		}
	}
	// 새로고침을 하지 않으면 출입구역 삭제 된 것이 반영이 안돼서 메모리에 변경된 값 넣어주기.
	dataManager.setAccessAreaGroup(dsAccessAreaGroupList); 
	refreshAccessGroupTree(accessGroupID);	
}

exports.closeDialog = function(){
	app.close()
}

exports.openAccessAreaManagement = function(){
	
	var hostAppIns = app.getHostAppInstance();
	if( hostAppIns){
		var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
			content: {
				"Target":DLG_ACCESSAREA_MANAGEMENT
			}
		});
		hostAppIns.dispatchEvent(selectionEvent);
	}
	app.close()
}

exports.updateTimezoneInfo = function( syncInfo ){
	var embDetailPage = app.lookup("ACGRM_emDetailPage");
	
	if(embDetailPage.hasAppMethod("updateTimezoneInfo")){
		embDetailPage.callAppMethod("updateTimezoneInfo", syncInfo);
	}
	
}
/*
 * TODO : menu_id 고정값 사용
 *  출입 그룹, 출입 구역
 */
exports.openHelpPage = function(menu_id) {

	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target":DLG_HELP,	
			"ID": menu_id
		}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onACGRM_cmbKeywordSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var aCGRM_cmbKeyword = e.control;
	var treeAccessGroup = app.lookup("ACGRM_treeAccessGroup");
	var getRow = treeAccessGroup.findItem({value : aCGRM_cmbKeyword.value});
	if (getRow) {
		var idx = getRow.row.getIndex();
		treeAccessGroup.selectItem(idx);
		treeAccessGroup.focusItem(getRow);
	}
}

// 출입구역 이름 변경 시 트리에도 동기화 - mjy
exports.updateAccessAreaTreeInAccessGroup = function(accessArea, accessGroupID){
	console.log(accessArea.getDatas(), accessGroupID);
	var areaID = accessArea.getValue("ID");
	var name = accessArea.getValue("Name");
	
	var dsAccessAreaList = app.lookup("AccessAreaList");
	
	dsAccessAreaList.findFirstRow("ID == "+areaID).setValue("Name", name);
	refreshAccessGroupTree(accessGroupID);
	
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsUserInfoReqSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var account = app.lookup("AccountInfo");
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if (resultCode == 0) { // 로그인한 사용자 그룹코드 가져온 값 메모리에 넣어주기
		userGroup = app.lookup("UserInfo").getValue("GroupCode");
		dataManager.getAccountInfo().copyToDataMap(account);
		//console.log(userGroup);
		account.setValue("GroupCode", userGroup);
		//console.log(app.lookup("AccountInfo").getDatas());
		dataManager.setAccountInfo(account);
		//console.log(dataManager.getAccountInfo().getDatas());
	}
	refreshAccessGroupTree(0);
}
