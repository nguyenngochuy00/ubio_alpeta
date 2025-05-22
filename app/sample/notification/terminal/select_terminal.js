/************************************************
 * select_terminal.js
 * Created at 2018. 10. 23. 오후 2:34:38.
 *
 * @author donghee
 ************************************************/
var checkModefy = false;
var initValue = [];
/**
 * srcGridId에 선택된 Row들을 desGridId에 이동한다. desGridId에 이미 있는 Row는 추가되지 않는다.
 * 
 * @param srcGridId
 * @param desGridId
 */
function moveGridData(srcGridId, desGridId){
	/**
	 * @type cpr.controls.Grid
	 */
	var srcGrd = app.lookup(srcGridId);
	/**
	 * @type cpr.controls.Grid
	 */
	var desGrd = app.lookup(desGridId);

	// 선택된 row의 index
	var indices = srcGrd.getSelectedRowIndices();
	if (!indices || indices.length == 0) {
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
			str.push(key + " == '" + data[key] + "'");
		}
		str = str.join(" && ");
		// 조건에 맞는 row 탐색
		var findRow = desGrd.findAllRow(str);
		// 조건에 해당하는 row가 없다면 target 그리드에 선택된 row를 추가
		if (findRow.length == 0) {
			var insertRow = desGrd.insertRow(desGrd.rowCount, true);
			insertRow.setRowData(data);
			insertRow.setState(cpr.data.tabledata.RowState.UNCHANGED);
		}
		srcGrd.deleteRow(row.getIndex());
	});

	// 그리드의 모든 row를 선택 해제
	srcGrd.clearSelection();
	desGrd.clearSelection();
}

/**
 * srcGridId에 모든 Row들을 desGridId에 이동한다. desGridId에 이미 있는 Row는 추가되지 않는다.
 * 
 * @param srcGridId
 * @param desGridId
 */
function moveAllGridData(srcGridId, desGridId){
	/**
	 * @type cpr.controls.Grid
	 */
	var srcGrid = app.lookup(srcGridId);
	/**
	 * @type cpr.controls.Grid
	 */
	var desGrid = app.lookup(desGridId);

	var rowCount= srcGrid.getRowCount();
	if (rowCount == 0) {
		return;
	}

	var indices = [];
	// source 그리드의 모든 row를 복사.
	for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
		// json 형식의 row의 데이터
		// 그리드의 데이터 를 삭제할 예정이기에 0의 데이터를 계속해서 호출한다.
		var data = srcGrid.getRow(0).getRowData();
		var str = [];
		// 이미 존재하는 row를 찾기 위해 row의 모든 column을 비교하는 조건 제작
		// str = "column1 == 'value1' && column2 == 'value2'..."
		for ( var key in data) {
			str.push(key + " == '" + data[key] + "'");
		}
		str = str.join(" && ");
		// 조건에 맞는 row 탐색
		var findRow = desGrid.findAllRow(str);
		// 조건에 해당하는 row가 없다면 target 그리드에 선택된 row를 추가
		if (findRow.length == 0) {
			var insertRow = desGrid.insertRow(desGrid.rowCount, true);
			insertRow.setRowData(data);
			insertRow.setState(cpr.data.tabledata.RowState.UNCHANGED);
			srcGrid.deleteRow(0);
		}
	}
}


/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	// 호스트 앱을 받아온다.
	var hostapp = app.getHostAppInstance();
	if(hostapp != null){
		//호스트 앱에서 initValue를 전달 받을 경우 받아온다
		//현재 initValue로 받아온 데이터는 map<String,Object> 형식이다.
		initValue = app.getHostProperty("initValue");
		
		if(initValue!= null) {

			var TerminalData = initValue["TERMINAL"];
			var response_terminal_data = app.lookup("response_terminal_data");
			
			// response_terminal_data로 TermianlData를 copy한다.
			// response_terminal_data 데이터 셋으로 TermianlData 값을 추가한다. 
			// 현재 response_terminal_data은 response_terminal_grid와 bind 되어있다
			// 자동으로 값이 추가된 것을 확인 할 수 있다.
			TerminalData.copyToDataSet(response_terminal_data);
		} 
	}
	// 종료 시 response_terminal_data를 전달 한다.
	app.setHostProperty("returnValue", response_terminal_data);
	
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
		console.log("leftCopy");
		moveGridData("terminal_grid", "response_terminal_grid");
		var response_terminal_grid = app.lookup("response_terminal_grid");
		var response_terminal_data = app.lookup("response_terminal_data");
		console.log(response_terminal_data.getColumnCount()	);
		console.log(response_terminal_grid.getRowCount());
		
	} else if(heading.toString() == ">>"){
		console.log("leftCopyAll");
		moveAllGridData("terminal_grid", "response_terminal_grid");
		
	} else if(heading.toString() == "<"){
		console.log("rightCopy");
		moveGridData("response_terminal_grid", "terminal_grid");
		
	} else if(heading.toString() == "<<"){
		console.log("rightCopyAll");
		moveAllGridData("response_terminal_grid", "terminal_grid");
		
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
				hostAppIns.callAppMethod("setTerminalData", response_terminal_data);
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
