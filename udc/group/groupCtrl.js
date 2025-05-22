/************************************************
 * groupCtrl.js
 * Created at 2018. 11. 22. 오전 9:26:26.
 *
 * @author fois
 ************************************************/

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};

exports.setData = function( /*cpr.data.DataSet*/groupDataSet, /*cpr.data.DataSet*/accessGroupDataSet ){
			
	if( groupDataSet){
		var dsGroupList = app.lookup("GroupList");
		dsGroupList.clear();	
		groupDataSet.copyToDataSet(dsGroupList);	
		dsGroupList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
		
		var treeGroup = app.lookup("treeGroup");	
		treeGroup.redraw();
	}
	
	if (accessGroupDataSet){
		var dsAccessGroupTree = app.lookup("AccessGroupTree");
		dsAccessGroupTree.clear();	
		accessGroupDataSet.copyToDataSet(dsAccessGroupTree);	
		dsAccessGroupTree.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
		
		var treeAccessGroup = app.lookup("treeAccessGroup");	
		treeAccessGroup.redraw();
	}
}


/*
 * 트리에서 selection-change 이벤트 발생 시 호출.
 * 선택된 Item 값이 저장된 후에 발생하는 이벤트.
 */
function onTreeGroupSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Tree
	 */
	var treeGroup = e.control;
	
	var selectionEvent = new cpr.events.CSelectionEvent("group-selection-change", {
		oldSelection: e.oldSelection,
		newSelection: e.newSelection
	});
	
	app.dispatchEvent(selectionEvent);
	
	// 기본처리가 중단되었을 때 변경을 취소함.
	if(selectionEvent.defaultPrevented == true) {
		e.preventDefault();
	}
}


/*
 * 트리에서 selection-change 이벤트 발생 시 호출.
 * 선택된 Item 값이 저장된 후에 발생하는 이벤트.
 */
function onTreeAccessGroupSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Tree
	 */
	var treeAccessGroup = e.control;
	
	if( e.newSelection[0].parentValue == 0){
		var selectionEvent = new cpr.events.CSelectionEvent("accessGroup-selection-change", {
			oldSelection: e.oldSelection,
			newSelection: e.newSelection
		});	
	} else {	
		var dsAccessGroupTree = app.lookup("AccessGroupTree");
		var count = dsAccessGroupTree.getRowCount();
		
		for( var idx = 0; idx < count; idx++ ){	
			var item = dsAccessGroupTree.getRow(idx);
			if( item.getValue("TreeID")==e.newSelection[0].value){
				e.newSelection[0].value = item.getValue("ID");			
				break;
			}
		}
		
		var selectionEvent = new cpr.events.CSelectionEvent("accessArea-selection-change", {
			oldSelection: e.oldSelection,
			newSelection: e.newSelection
		});
	}
	
	app.dispatchEvent(selectionEvent);
	
	// 기본처리가 중단되었을 때 변경을 취소함.
	if(selectionEvent.defaultPrevented == true) {
		e.preventDefault();
	}
	
}
