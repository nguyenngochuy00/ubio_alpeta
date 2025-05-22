/************************************************
 * PrivilegeSelectGroup.js
 * Created at 2019. 3. 4. 오전 8:10:06.
 *
 * @author wonki
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	var groupList = dataManager.getGroup();
	if( groupList ){						
		var dsGroupList = app.lookup("GroupList");
		dsGroupList.clear();	
		groupList.copyToDataSet(dsGroupList);	
		dsGroupList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
		
		var treeGroup = app.lookup("PRMGR_treSelectGroup");	
		treeGroup.redraw();
	}
}


/*
 * "선택" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
	var treGroup = app.lookup("PRMGR_treSelectGroup");
	var group = treGroup.getSelectionFirst();
	if (group == undefined || group.value == "") {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_ErrorNotSelectGroup"));
		return;		
	}
	app.close({"GroupID": parseInt(group.value, 10), "Name": group.label});	
}


/*
 * "닫기" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	app.close();
}
