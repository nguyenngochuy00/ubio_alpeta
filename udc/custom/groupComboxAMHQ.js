/************************************************
 * groupComboxAMHQ.js
 * Created at 2024. 7. 11. 오후 1:18:39.
 *
 * @author sep
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");


function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	var dsGroupList = app.lookup("LoginUserGroupList");
	
	var userGroupID = getLoginUserGroupCode();
	var groupList = dataManager.getLoginUserGroups();
	
	groupList.copyToDataSet(dsGroupList);
	
	
}

/**
 * 부서 콤보박스에서 선택한 부서의 아이디 값 반환
 */
exports.getSelectionValue = function(){
	var lcbGroup = app.lookup("lcb_groupAMHQ");
	var selectID = lcbGroup.value;
	console.log(selectID);
	return selectID;
}


