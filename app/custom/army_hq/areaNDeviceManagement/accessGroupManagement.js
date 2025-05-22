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
var loginUserGroupID;
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	comLib = createComUtil(app);	
	tempID = 1;
	loginUserGroupID = getLoginUserGroupCode();
	
	var initValue = app.getHost().initValue;
	var dsAccessGroupList = app.lookup("AccessGroupList");
	var dsAccessAreaList = app.lookup("AccessAreaList");
	var dsAccessAreaGroupList = app.lookup("AccessAreaGroupList");	
	
	var accessGroupList = dataManager.getAccessGroup();
	accessGroupList.copyToDataSet(dsAccessGroupList);	
	
	var accessAreaList = dataManager.getAccessArea();
	accessAreaList.copyToDataSet(dsAccessAreaList);
	
	var accessAreaGroupList = dataManager.getAccessAreaGroup();
	accessAreaGroupList.copyToDataSet(dsAccessAreaGroupList);
	//initValue["AccessAreaList"].copyToDataSet(dsAccessAreaList);
	//initValue["AccessAreaGroupList"].copyToDataSet(dsAccessAreaGroupList);
	
	var dsTreeContextMenu = app.lookup("dsTreeContextMenu");
	dsTreeContextMenu.addRowData({"label":dataManager.getString("Str_AccessGroupAdd"),"value":1,"parent":"0"});
	//dsTreeContextMenu.addRowData({"label":dataManager.getString("Str_AccessAreaAdd"),"value":2,"parent":"0"});
	
	var embDetailPage = app.lookup("ACGRM_emDetailPage");
	if(embDetailPage.hasAppMethod("setAccessAreaList")){		
						
		var dsAccessAreaList = app.lookup("AccessAreaList");
		embDetailPage.callAppMethod("setAccessAreaList", dsAccessAreaList);
	}
	
	refreshAccessGroupTree(0);
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
	var ids = getLoginUserAccessibleGroupIDs();
	for( var i = 0; i < groupCnt; i++ ){
		var group = dsAccessGroupList.getRow(i);
		//console.log(group.getRowData());
		var treeID = group.getValue("ID");
		var code = group.getValue("Code");
		if (!isLoginMaster()){
			for (var j = 0; j < ids.length; j++){
				if (Number(code) == ids[j]){
					dsTreeAccessGroupList.addRowData({"ID":treeID,"Name":group.getValue("Name"),"Parent":"0","Code":treeID, "GroupCode":code});
					break;
				}
			}
		} else {
			dsTreeAccessGroupList.addRowData({"ID":treeID,"Name":group.getValue("Name"),"Parent":"0","Code":treeID, "GroupCode":code});
			//dsTreeAccessGroupList.addRowData({"ID":treeID,"Name":group.getValue("Name"),"Parent":"0","Code":treeID});			
		}
	}
	
	// 가상 아이디 할당 및 실제 아이디 저장	
	var areaGroupCnt = dsAccessAreaGroupList.getRowCount();
	for( var i = 0; i < areaGroupCnt; i++ ){
		var areaGroup = dsAccessAreaGroupList.getRow(i);
		var treeID = "TC"+tempID;		
		tempID++;
		var code = areaGroup.getValue("AccessAreaID");
		var parent = areaGroup.getValue("AccessGroupID");
		var group = dsAccessGroupList.findFirstRow("ID == " + parent);
		var areaInfo = dsAccessAreaList.findFirstRow("ID == "+ code);
		//console.log("code : " + code + " / parent : " + parent);
		var ParentRow = dsTreeAccessGroupList.findFirstRow("ID == " + parent);
		if(areaInfo != null && ParentRow != null){ // 출입구역관리 메뮤에서 출입구역 삭제 시 출입그룹관리 메뉴 페이지 보이지 않는 오류 방지용  - pse
			dsTreeAccessGroupList.addRowData({"ID":treeID,"Name":areaInfo.getValue("Name"),"Parent":parent,"Code":code, "GroupCode":group.getValue("Code")});
			//console.log(dsTreeAccessGroupList.getRowDataRanged());
		}		
	}
	
//	if(!isSuperGroupAdmin()) { // Master와 상위 부서 관리자가 이니면 본인 부서의 출입그룹만 볼수 있다.
//		dsTreeAccessGroupList.setFilter("Number(GroupCode) == " + loginUserGroupID);
//	}

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
		var url = "app/custom/army_hq/areaNDeviceManagement/accessGroupInfoPage" + "?" + usint_version;
		cpr.core.App.load(url, function(loadedApp){
			if (!loadedApp) {
				return;
			}					
			embDetailPage.app = loadedApp;
		});
	}
	
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
	var code = treeItem.getValue("Code");
	var treeID = treeItem.getValue("ID");
	var embDetailPage = app.lookup("ACGRM_emDetailPage");
	embDetailPage.app = null;	
	
	var url = "";
	if (treeGroup.parentValue == "0") {
				
		// url = "app/main/accessGroup/pages/AccessGroupInfoPage";
		url = "app/custom/army_hq/areaNDeviceManagement/accessGroupInfoPage";
				
		//var AccessGroupItem = app.lookup("AccessGroupList").findFirstRow("ID == '" + code +"'");
		var AccessGroupItem = app.lookup("AccessGroupList").findFirstRow("ID == '" + treeID +"'");
		var TimezoneID = AccessGroupItem.getValue("TimezoneID");
		var visitEnable = AccessGroupItem.getValue("VisitEnable");
		var elevatorSetID = AccessGroupItem.getValue("ElevatorSetID");
		var Code = AccessGroupItem.getValue("Code");
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
				embDetailPage.callAppMethod( "init", "modify", treeID, treeItem.getValue("Name"), TimezoneID,visitEnable, elevatorSetID);
			}
			
			if(embDetailPage.hasAppMethod("setCmbGroupCode")){
				if(Code == "" || Code.length == 0) {
					Code = "0";
				}
				//console.log("Code : " +  Code);
				embDetailPage.callAppMethod("setCmbGroupCode", Code);
			}		
		});		
		
	} else {		
		// url = "app/main/accessGroup/pages/AccessAreaInfoPage";
		url = "app/custom/army_hq/areaNDeviceManagement/AccessAreaInfoPage";
		
		embDetailPage.ready(function(){
			if(embDetailPage.hasAppMethod("init")){
				embDetailPage.callAppMethod( "init", groupID, code);
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
	
}

exports.getEmptyAccessGroupCode = function(){
	var id = 1;
	var dsAccessGroupList = app.lookup("AccessGroupList");
	while( true ){
		var groupRows = dsAccessGroupList.findFirstRow("ID == "+id);
		if( groupRows ){
			id++;			
		} else {
			break;
		}
	}
	return id;
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
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_AccessGroupDelete"));	
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
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), msg);
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
	
	if( groupRow == null ){		
		var insertedRow = dsAccessGroupList.addRowData({"ID":accessGroupID,"Name":accessGroup.getValue("Name"),
			"TimezoneID":accessGroup.getValue("TimezoneID"),"VisitEnable":accessGroup.getValue("VisitEnable"),"Code":accessGroup.getValue("Code")})
		dataManager.insertAccessGroup(insertedRow.getRowData());
	} else {
		groupRow.setValue("Name",accessGroup.getValue("Name"));
		groupRow.setValue("TimezoneID",accessGroup.getValue("TimezoneID"));
		groupRow.setValue("VisitEnable",accessGroup.getValue("VisitEnable"));
		groupRow.setValue("Code",accessGroup.getValue("Code"));
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
	
	var areaGroupRows = dsAccessAreaGroupList.findAllRow("AccessGroupID == "+accessGroupID);
	areaGroupRows.forEach(function(row){		
		if( row.getValue("AccessAreaID")==accessAreaID){
			dsAccessAreaGroupList.realDeleteRow(row.getIndex());
			refreshAccessGroupTree(accessGroupID);
			return;
		}
	});	
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

// 그룹 추가 버튼 사용 시 해당 부서에 속하는 출입그룹이 없을 경우 구역 리스트 값을 가져오지 못해서 주가
// 부서별 기능이 들어가기 전에는 문서고가 삭제 불가로 남아 있어서 위와 같은 오류가 없었으나 부서별 기능 추가며 발생해 수정  - pse
exports.getAccessDataSet = function(){
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

}
