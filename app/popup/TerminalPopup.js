/************************************************
 * select_terminal.js
 * Created at 2018. 10. 23. 오후 2:34:38.
 *
 * @author donghee
 ************************************************/
var initValueCheck = false;
var checkModefy = false;
var initValue = [];
/**
 * srcGridId에 선택된 Row들을 desGridId에 이동한다. desGridId에 이미 있는 Row는 추가되지 않는다.
 * 
 * @param srcGridId
 * @param desGridId
 */
function copyGridData(srcGridId, desGridId){
	/**
	 * @type cpr.controls.Grid
	 */
	var srcGrd = app.lookup(srcGridId);
	/**
	 * @type cpr.controls.Grid
	 */
	var desGrd = app.lookup(desGridId);

	//삭제된 Row를 표시하여 삭제 시 Index의 꼬임을 방지한다. 
	srcGrd.showDeletedRow = true;
	
	// 선택된 row의 index
	var indices = srcGrd.getSelectedRowIndices();
	if (!indices || indices.length == 0) {
		//선택된 Row가 없을 경우 DeleteRow를 false로 변경.
		srcGrd.showDeletedRow = false;
		srcGrd.resetGrid();
		return;
	}
	// 선택된 row
	var rows = srcGrd.getSelectedRows();

	rows.forEach(function(row) {
		// json 형식의 row의 데이터
		var data = row.getRowData();
		var str = [];
		// 이미 존재하는 row를 찾기 위해 row의 모든 column을 비교하는 조건 제작
		// str = "column1 == 'value1' && column2 == 'value2'..."
		for ( var key in data) {
			if(key == "ID"){
				str.push(key + " == '" + data[key] + "'");
			}
		}
		str = str.join(" && ");
		// 조건에 맞는 row 탐색
		var findRow = desGrd.findAllRow(str);
		// 조건에 해당하는 row가 없다면 target 그리드에 선택된 row를 추가
		
		if (findRow.length == 0) {
			var insertRow = desGrd.insertRow(desGrd.rowCount, true);
			insertRow.setRowData(data);
			row.setState(cpr.data.tabledata.RowState.UPDATED);
			insertRow.setState(cpr.data.tabledata.RowState.INSERTED);
		} else {
			findRow.forEach(function(findRow){
				// 찾은 Row가 INSERT 모드일 경우는 무시
				if( findRow.getState() != cpr.data.tabledata.RowState.INSERTED ){
					// 찾은 Row가 DELETE 모드일 경우는 다시 INSERT 필요.
					if(findRow.getState() == cpr.data.tabledata.RowState.DELETED ) {
						findRow.setState(cpr.data.tabledata.RowState.INSERTED);
						row.setState(cpr.data.tabledata.RowState.UPDATED);
						
					// 찾은 Row가 UPDATE 모드일 경우는 선택된  ROW DELETE 필요.
					} else if( findRow.getState() == cpr.data.tabledata.RowState.UPDATED ){
						findRow.setState(cpr.data.tabledata.RowState.UNCHANGED);
						row.setState(cpr.data.tabledata.RowState.DELETED);
						
					}
				}
			});
			
		}
	});

	// 그리드의 모든 row를 선택 해제
	srcGrd.clearSelection();
	desGrd.clearSelection();
	
	desGrd.sort("ID ASC");
	
	// 완료 후 삭제된 Row를 감춘다.
	srcGrd.showDeletedRow = false;
	srcGrd.resetGrid();
}

/**
 * srcGridId에 모든 Row들을 desGridId에 이동한다. desGridId에 이미 있는 Row는 추가되지 않는다.
 * 
 * @param srcGridId
 * @param desGridId
 */
function copyAllGridData(srcGridId, desGridId){
	/**
	 * @type cpr.controls.Grid
	 */
	var srcGrid = app.lookup(srcGridId);
	/**
	 * @type cpr.controls.Grid
	 */
	var desGrid = app.lookup(desGridId);
	
	//삭제된 Row를 표시하여 삭제 시 Index의 꼬임을 방지한다. 
	srcGrid.showDeletedRow = true;
	var rowCount= srcGrid.getRowCount();
	if (rowCount == 0) {
		//선택된 Row가 없을 경우 DeleteRow를 false로 변경.
		srcGrid.showDeletedRow = false;
		srcGrid.resetGrid();
		return;
	}
	

	var indices = [];
	// source 그리드의 모든 row를 복사.
	for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
		// json 형식의 row의 데이터
		// 그리드의 데이터 를 삭제할 예정이기에 0의 데이터를 계속해서 호출한다.
		var row = srcGrid.getRow(rowIndex);
		var data = row.getRowData();
		var str = [];
		// 이미 존재하는 row를 찾기 위해 row의 모든 column을 비교하는 조건 제작
		// str = "column1 == 'value1' && column2 == 'value2'..."
		for ( var key in data) {
			if(key == "ID"){
				str.push(key + " == '" + data[key] + "'");
			}
		}
		str = str.join(" && ");
		// 조건에 맞는 row 탐색
		var findRow = desGrid.findAllRow(str);
		// 조건에 해당하는 row가 없다면 target 그리드에 선택된 row를 추가
		if (findRow.length == 0) {
			var insertRow = desGrid.insertRow(desGrid.rowCount, true);
			insertRow.setRowData(data);
			row.setState(cpr.data.tabledata.RowState.UPDATED);
			insertRow.setState(cpr.data.tabledata.RowState.INSERTED);
		} else {
			findRow.forEach(function(findRow){
				// 찾은 Row가 INSERT 모드일 경우는 무시
				if( findRow.getState() != cpr.data.tabledata.RowState.INSERTED ){
					// 찾은 Row가 DELETE 모드일 경우는 다시 INSERT 필요.
					if(findRow.getState() == cpr.data.tabledata.RowState.DELETED ) {
						findRow.setState(cpr.data.tabledata.RowState.INSERTED);
						row.setState(cpr.data.tabledata.RowState.UPDATED);
						
					// 찾은 Row가 UPDATE 모드일 경우는 선택된  ROW DELETE 필요.
					} else if( findRow.getState() == cpr.data.tabledata.RowState.UPDATED ){
						findRow.setState(cpr.data.tabledata.RowState.UNCHANGED);
						row.setState(cpr.data.tabledata.RowState.DELETED);
						
					}
				}
			});
			
		}
	}
	
	// 완료 후 삭제된 Row를 감춘다.
	srcGrid.showDeletedRow = false;
	srcGrid.resetGrid();
	desGrid.sort("ID ASC");
}


/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	// 호스트 앱을 받아온다.
	var hostapp = app.getHostAppInstance();
	if(!app.isRootAppInstance()){
			
		var hostapp = app.getHostAppInstance();
		if(hostapp != null){
			//호스트 앱에서 initValue를 전달 받을 경우 받아온다
			//현재 initValue로 받아온 데이터는 map<String,Object> 형식이다.
			initValue = app.getHostProperty("initValue");
			
			if(initValue!= null) {
				initValueCheck = true;
				var TerminalData = initValue["response_terminal_data"];
				var response_terminal_data = app.lookup("response_terminal_data");
				
				// response_terminal_data로 TermianlData를 copy한다.
				// response_terminal_data 데이터 셋으로 TermianlData 값을 추가한다. 
				// 현재 response_terminal_data은 response_terminal_grid와 bind 되어있다
				// 자동으로 값이 추가된 것을 확인 할 수 있다.
				TerminalData.copyToDataSet(response_terminal_data);
			} 
		}
	}
	
	var terminal_grid = app.lookup("terminal_grid");
	var response_terminal_grid = app.lookup("response_terminal_grid");
	terminal_grid.sort("ID ASC");
	response_terminal_grid.sort("ID ASC");
	
	var group_sub = app.lookup("group_sub");
	group_sub.send();
	
	var access_group_sub = app.lookup("access_group_sub");
	access_group_sub.send();
	
	
}


/*
 * 그리드에서 cell-click 이벤트 발생 시 호출.
 * Grid의 Cell 클릭시 발생하는 이벤트.
 */
function onGroup_gridCellClick(/* cpr.events.CGridEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var group_grid = e.control;
	
	group_grid.getSelectedRow().setAttr("backgroundColor","#C9C9C9");

	var terminal_data = app.lookup("terminal_data");
	terminal_data.clear();
	
	var terminal_sub = app.lookup("terminal_sub");
	terminal_sub.send();
	
	
}


/*
 * ">, >>, < , <<" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
	var heading = button.userAttr("heading");
	console.log("heading : " + heading);
	
	checkModefy = true;
	var apply = app.lookup("apply");
	apply.enabled = true;
	apply.redraw();
	
	if(heading.toString() == ">"){
		copyGridData("terminal_grid", "response_terminal_grid");
		
	} else if(heading.toString() == ">>"){
		copyAllGridData("terminal_grid", "response_terminal_grid");
		
	} else if(heading.toString() == "<"){
		if(initValueCheck){
			if(confirm("기존 데이터를 수정할 경우 적용 시 초기값으로 입력됩니다. 진행하시겠습니까?")){
				initValueCheck = false;
			}else {
				return ;
			}
		}
		copyGridData("response_terminal_grid", "terminal_grid");
	} else if(heading.toString() == "<<"){
		if(initValueCheck){
			if(confirm("기존 데이터를 수정할 경우 적용 시 초기값으로 입력됩니다. 진행하시겠습니까?")){
				initValueCheck = false;
			}else {
				return ;
			}
		}
		copyAllGridData("response_terminal_grid", "terminal_grid");
	}
	
}


/*
 * Body에서 before-unload 이벤트 발생 시 호출.
 * 앱이 언로드되기 전에 발생하는 이벤트 입니다. 취소할 수 있습니다.
 */
function onBodyBeforeUnload2(/* cpr.events.CEvent */ e){
	if(checkModefy){
		if(!confirm("변경사항이 저장되지 않을 수 있습니다.")){
			e.preventDefault();
		}
	}
}

/*
 * "적용" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onApplyClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var apply = e.control;
	
	if(confirm("데이터를 저장하시겠습니까?")){
			
		var response_terminal_data = app.lookup("response_terminal_data");
	
		var hostAppIns = app.getHostAppInstance();
		
		if(hostAppIns){
			if(hostAppIns.hasAppMethod("setTerminalData")){
				if(hostAppIns.callAppMethod("setTerminalData", response_terminal_data)){
					alert("저장되었습니다.");
				}
			}
		}
		checkModefy = false;
		
		var apply = app.lookup("apply");
		apply.enabled = checkModefy;
		apply.redraw();
	}
}


/*
 * "취소" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onCancelClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var cancel = e.control;
	checkModefy = false;
	app.close();
}





/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onTerminal_subSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var terminal_sub = e.control;

	var terminal_grid = app.lookup("terminal_grid");
	var response_terminal_grid = app.lookup("response_terminal_grid");
	console.log("send success : " + terminal_grid.getRowCount() + "/" + response_terminal_grid.getRowCount());
	
	if(response_terminal_grid.getRowCount() != 0 ) {
			
		for(var rowIdx = 0 ; terminal_grid.getRowCount() > rowIdx ; rowIdx ++ ){
			console.log(rowIdx);
			var row = terminal_grid.getRow(rowIdx);
			var terminal_id = "ID == '" + row.getValue("ID") + "'";
			
			
			var findRow = response_terminal_grid.findAllRow(terminal_id);
			if (findRow.length != 0) {
				console.log("Find Rows");
				row.setState(cpr.data.tabledata.RowState.UPDATED);
			} else {
				console.log("none Find Rows");
			}
		}
	}
	
	terminal_grid.sort("ID ASC");
	response_terminal_grid.sort("ID ASC");
	
	
}
