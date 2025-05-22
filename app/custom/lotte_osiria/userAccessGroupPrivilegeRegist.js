/************************************************
 * userAccessGroupPrivilegeRegist.js
 * Created at 2021. 6. 24. 오후 3:29:54.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	
	var privilegeList = dataManager.getPrivilegeList()
	var cmbPrivilege = app.lookup("UAGPA_cmbPrivilege");	
		
	if( privilegeList ){
		var itemAdmin = new cpr.controls.Item(dataManager.getString("Str_Admin"),1);
		var itemNormalUser = new cpr.controls.Item(dataManager.getString("Str_NormalUser"),2);		
		
		itemAdmin.bind("label").toLanguage("Str_Admin");
		itemNormalUser.bind("label").toLanguage("Str_NormalUser");
		
		cmbPrivilege.addItem(itemAdmin);
		cmbPrivilege.addItem(itemNormalUser);
			
		var count = privilegeList.getRowCount();
		for ( var i = 0; i < count; i++ ){			
			var privilegeInfo = privilegeList.getRow(i);						
			cmbPrivilege.addItem(new cpr.controls.Item(privilegeInfo.getValue("Name"),privilegeInfo.getValue("PrivilegeID")));
		}	
	}
		
	cmbPrivilege.addItem(new cpr.controls.Item("일반직",101));
	cmbPrivilege.addItem(new cpr.controls.Item("특수직",102));
	cmbPrivilege.addItem(new cpr.controls.Item("캐스트",103));
	cmbPrivilege.addItem(new cpr.controls.Item("용역직",104));
	cmbPrivilege.addItem(new cpr.controls.Item("파견직",105));
	cmbPrivilege.addItem(new cpr.controls.Item("일용직",106));
	cmbPrivilege.addItem(new cpr.controls.Item("주차관리",107));
	cmbPrivilege.addItem(new cpr.controls.Item("전문직",108));
	cmbPrivilege.addItem(new cpr.controls.Item("전문캐스트",109));	
	
	var cmbGroup = app.lookup("UAGPA_cmbGroup");
	var groupList = dataManager.getGroup();	
	cmbGroup.setItemSet(groupList, {label: "Name",	value: "GroupID",	});
	
	var cmbAccessGroup = app.lookup("UAGPA_cmbAccessGroup");
	var accessGroupList = dataManager.getAccessGroup();		
	cmbAccessGroup.setItemSet(accessGroupList, {label: "Name",	value: "ID"});	
	
	var initValue = app.getHost().initValue;
	var groupCode = initValue["GroupCode"];	
	cmbGroup.selectItemByValue(groupCode);
	
	var userPrivilege = initValue["UserPrivilege"];
	cmbPrivilege.selectItemByValue(userPrivilege);
	
	var accessGroupCode = initValue["AccessGroupCode"];
	cmbAccessGroup.selectItemByValue(accessGroupCode);
	
}

function onUAGPA_btnAddClick(/* cpr.events.CMouseEvent */ e){
	var userAccessGroupSet = app.lookup("UserAccessGroupSet");
	if(app.lookup("UAGPA_cmbGroup").value == 0 || app.lookup("UAGPA_cmbPrivilege").value == 0 || 
		app.lookup("UAGPA_cmbAccessGroup").value == 0){
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelection"));			
		return;
	}
	app.close({"Result":0,"UserAccessGroupSet":userAccessGroupSet.getDatas()});
}

function onUAGPA_btnCancelClick(/* cpr.events.CMouseEvent */ e){
	app.close({"Result":1});
}
