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
	
	var lcbGroup = app.lookup("lcb_groupAMHQ");
	if (isLoginMaster()){
		groupList = dataManager.getGroup();
		groupList.copyToDataSet(dsGroupList);	
//		lcbGroup.selectItemByValue(0);
		lcbGroup.addItem(new cpr.controls.TreeItem("전체", "-1", "0")); // value 값 0으로 하면 오류 발생...
//		lcbGroup.selectItem(0);
		lcbGroup.selectItemByValue("-1");
	} else {
		groupList.copyToDataSet(dsGroupList);
		lcbGroup.selectItemByValue(userGroupID);		
	}
	dsGroupList.commit();

}

/**
 * 부서 콤보박스에서 선택한 부서의 아이디 값 반환
 */
exports.getSelectionValue = function(){
	var selectID = 0;
	var lcbGroup = app.lookup("lcb_groupAMHQ");
	var selectID = lcbGroup.getSelectionLast().value;
//	console.log(selectID);
	if (selectID < 0) {
		selectID = 0;
	}
	return selectID;
}

/**
 * 부서 콤보박스에서 선택한 부서의 아이디 값과 해당 부서가 속한 상위부서 아이디 값을 함께 반환
 */
exports.getSelectionPathValues = function(){
	var IDs = [];
	var lcbGroup = app.lookup("lcb_groupAMHQ");
	var selectItems = lcbGroup.getSelection();
	if (selectItems != null && selectItems.length > 0){
		for (var i = 0; i < selectItems.length; i++){
			IDs[i] = selectItems[i].value;
		}
	}
//	console.log(IDs);
	
	return IDs;
}


function onLcb_groupAMHQItemClick(/* cpr.events.CItemEvent */ e){
	var lcbGroup = app.lookup("lcb_groupAMHQ");
//	console.log(e.item);
	lcbGroup.selectItem(e.item);
}
