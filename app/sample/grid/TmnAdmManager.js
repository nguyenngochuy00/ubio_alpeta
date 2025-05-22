/************************************************
 * TerminalAdmManager.js
 * Created at 2018. 10. 18. 오전 10:14:15.
 *
 * @author osm86
 ************************************************/
var gridManager = createGridUtil(app);
var comLib = createComUtil(app);
/*익스프레션 함수 생성*/
cpr.expression.ExpressionEngine.INSTANCE
.registerFunction("changeRowColor", function changeRowColor(/*cpr.data.DataSet*/srcDS,/*Number*/index,/*cpr.data.DataSet*/tarDS){
	if(srcDS.getRowCount()!=0){
		var id = srcDS.getRow(index).getValue("ID");
		if(id){
			var findRow = tarDS.findAllRow("ID=='"+id+"'");
			if(findRow&&findRow[0]){
				return true;
			}else{
				return false;
			}
		}else{
			return false;
		}
	}
});
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
//	var getAdmList = app.lookup("getList");
//	getAdmList.send();
	comLib.send("getList");
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onGetListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var getList = e.control;
	var result = JSON.parse(getList.xhr.responseText);
	var data = [];
	for(var i=0; i<result.Admins.length; i++){
		data[i] = { "ID": result.Admins[i] };
	}
	var admList = app.lookup("AdminList");
	admList.build(data, false);
}


/*
 * "" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn_leftClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btn_left = e.control;
	//조회된 대상의 관리자 아이디를 가져옵니다.
//	var admGrid = app.lookup("grd1");
//	var admId = admGrid.getSelectedRow().getValue("ID");// 선택된 관리자의 아이디 값을 가져옵니다.
	
	//선택한 단일 항목의 아이디를 가져옵니다.
//	var managedGrid = app.lookup("grd3");// 관리되고있는 관리자 목록의 그리드를 가지고 옵니다.
//	var selectedId = managedGrid.getSelectedRow().getValue("ID");//선택한 행의 아이디 값을 가져옵니다.
	
	//서브미션의 url을 설정하여 해제를 진행합니다.
//	var getAdmList = app.lookup("getList");
//	getAdmList.action = "";
//	getAdmList.send();
	var srcGrid = app.lookup("grd3");//관리대상그리드
 	var targetGrid = app.lookup("grd2");//관리가능그리드
 	var indices = srcGrid.getSelectedRowIndices();//선택한 행의 인덱스
	if (!indices || indices.length == 0) {//선택한 rows 가 없는 경우
		dialogAlert(app, "단말기", '선택한 행이 없습니다.');
		return;
	}
	var rows = srcGrid.getSelectedRows();//그리드에서 선택행을 가져온다.
	rows.forEach(function(row) {
		var id = row.getRowData().ID;
		var findRow = targetGrid.findAllRow("ID=='"+id+"'");
		if(findRow[0]){
			findRow[0].setState(cpr.data.tabledata.RowState.UNCHANGED);
		}
	});
	srcGrid.showDeletedRow = false;//studio property에서 제어하는 것을 추천.
	srcGrid.deleteRow(indices);//지정된 단말기 목록에서 제거
	dialogAlert(app, "단말기", "선택한 항목을 해제 하였습니다.");
	targetGrid.redraw();//그리드에 대해 변경된 점을 다시 그려준다.
}


/*
 * "" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn_rightClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btn_right = e.control;
	var srcGrid = app.lookup("grd2");//관리가능그리드
 	var targetGrid = app.lookup("grd3");//관리대상그리드
	var indices = srcGrid.getSelectedRowIndices();
	if (!indices || indices.length == 0) {//선택한 rows 가 없는 경우
		dialogAlert(app, "단말기", '선택한 행이 없습니다.');
		return;
	}
	var rows = srcGrid.getSelectedRows();
	rows.forEach(function(row) {
		var id = row.getRowData().ID;
		var findRow = targetGrid.findAllRow("ID=='"+id+"'");
		if(!findRow[0]){
			var insertRow = targetGrid.insertRow(targetGrid.rowCount, true);
			//목록을 검색한 후 없는 행에 대해서 insert
			insertRow.setRowData(row.getRowData());
			insertRow.setState(cpr.data.tabledata.RowState.INSERTED);//insert 상태로 변환
		}else{
			dialogAlert(app, "단말기", '이미존재하는 단말기 입니다.');
			return;
		}
	});
	dialogAlert(app, "단말기", "정상 지정 되었습니다.");
	srcGrid.clearSelection();//선택해제
	targetGrid.clearSelection();
}


/*
 * "" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn_leftAllClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btn_leftAll = e.control;
	var srcGrid = app.lookup("grd3");
 	var targetGrid = app.lookup("grd2");
 	if(srcGrid.rowCount==0){
 		dialogAlert(app, "단말기", '조회된 항목이 없습니다.');
 		return;
 	}
 	var rowIndex = [];
 	for(var i=0;i<srcGrid.rowCount;i++){
 		rowIndex.push(i);//전체 행의 인덱스를 담습니다.
 	}
 	srcGrid.deleteRow(rowIndex);
 	dialogAlert(app, "단말기", '전체 항목을 해제 하였습니다.');
	targetGrid.redraw();
}


/*
 * "" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn_rightAllClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btn_rightAll = e.control;
	var srcGrid = app.lookup("grd2");
 	var targetGrid = app.lookup("grd3");
 	
 	if(srcGrid.rowCount==0){
 		dialogAlert(app, "단말기", '조회된 항목이 없습니다.');
 		return;
 	}
 	
	for(var i=0; i<srcGrid.rowCount; i++){
		var id = srcGrid.getRow(i).getValue("ID");
		var findRow = targetGrid.findAllRow("ID=='"+id+"'");
		if(!findRow[0]){
			var insertRow = targetGrid.insertRow(targetGrid.rowCount, true);
			insertRow.setRowData(srcGrid.getRow(i).getRowData());
			insertRow.setState(cpr.data.tabledata.RowState.INSERTED);
		}
	}
	dialogAlert(app, "단말기", "정상 지정 되었습니다.");
	srcGrid.redraw();
}


/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onGrd1SelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var grd1 = e.control;
	//관리자 목록에서 선택한 관리자의 그리드 셀 값 을 가져온다
	var selectedRow = grd1.getSelectedRow();
	var admIdVal = selectedRow.getValue("ID");//선택한 row 에서 컬럼 값(string)에 해당하는 값을 가져온다.
	
	var getManagedTmnList = app.lookup("getManagedTmnList");
	getManagedTmnList.action = "data/terminal/ManagedList.json"; // url
	getManagedTmnList.send();//관리되고있는 단말기 조회
	
	var getTmnList = app.lookup("getTmnList");
	getTmnList.action = "data/terminal/ManagableList.json"; // url
	//getTmnList.send();//관리가능한 단말기 리스트 조회
	comLib.send("getTmnList","");
	
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onGetManagedTmnListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var getManagedTmnList = e.control;
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onGetTmnListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var getTmnList = e.control;
	
}


/*
 * 그리드에서 row-dblclick 이벤트 발생 시 호출.
 * detail이 row를 더블클릭 한 경우 발생하는 이벤트.
 */
function onGrd2RowDblclick(/* cpr.events.CGridEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	
	var grd2 = e.control;
	//단말기 해제 서브미션 수행 예시
//	var selectedAdmRow = app.lookup("grd1").getSelectedRow();
//	var admIdVal = selectedAdmRow.getValue("ID");//선택한 row 에서 컬럼 값(string)에 해당하는 값을 가져온다.
//	
//	var getManagedTmnList = app.lookup("saveManagedTmnList");
//	getManagedTmnList.action = "/terminalAdmins/"+admIdVal+"/admin"; // url
	//이미 등록된 단말기를 제외한 등록 가능한 단말기를 더블클릭 시 등록 단말기로 이동한다.
	//필요시 모듈로 공통화
	var srcGrid = grd2;
 	var targetGrid = app.lookup("grd3");

	var indices = srcGrid.getSelectedRowIndices();
	if (!indices || indices.length == 0) {//선택한 rows 가 없는 경우
		return;
	}

	var rows = srcGrid.getSelectedRows();

	rows.forEach(function(row) {
		var id = row.getRowData().ID;
		var findRow = targetGrid.findAllRow("ID=='"+id+"'");
		if(!findRow[0]){
			var insertRow = targetGrid.insertRow(targetGrid.rowCount, true);
			insertRow.setRowData(row.getRowData());
			insertRow.setState(cpr.data.tabledata.RowState.INSERTED);
			dialogAlert(app, "단말기", "정상 지정 되었습니다.");
		}else{
			dialogAlert(app, "단말기", '이미존재하는 단말기 입니다.');
			return;
		}
	});

	srcGrid.clearSelection();//선택해제
	targetGrid.clearSelection();
}


/*
 * 그리드에서 row-dblclick 이벤트 발생 시 호출.
 * detail이 row를 더블클릭 한 경우 발생하는 이벤트.
 */
function onGrd3RowDblclick(/* cpr.events.CGridEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var grd3 = e.control;
	
	//단말기 해제 서브미션 수행 예시
//	var selectedAdmRow = app.lookup("grd1").getSelectedRow();
//	var admIdVal = selectedAdmRow.getValue("ID");//선택한 row 에서 컬럼 값(string)에 해당하는 값을 가져온다.
//	
//	var getManagedTmnList = app.lookup("deleteManagedTmnList");
//	getManagedTmnList.action = "/terminalAdmins/"+admIdVal+"/admin"; // url
//	getManagedTmnList.send();//관리되고있는 단말기 조회
	
	//삭제 등록 후 서브미션 콜백 항목에서 해당 코드를 실행합니다.
	//등록된 단말기를 더블 클릭 시 등록이 해제되고 등록 가능한 단말 목록으로 이동한다.
	//필요시 모듈로 공통화
	var srcGrid = grd3;
 	var targetGrid = app.lookup("grd2");
	var index = srcGrid.getSelectedRowIndex();//더블클릭 시 이벤트는 단건 
	var id = srcGrid.getRow(index).getValue("ID");//선택한 행에서 컬럼명이 "ID"인 항목의 값을 가져온다
	var findRow = targetGrid.findAllRow("ID=='"+id+"'");// 가져온 id를 그리드에 바인딩 된 데이터의 전체 행에서 비교하여 찾은 row를 리턴한다.
	if(findRow[0]){//단건이므로 0번 만 비교
		findRow[0].setState(cpr.data.tabledata.RowState.UNCHANGED); // 해당 row는 state를 unchanged로 변경
	}
	srcGrid.showDeletedRow = false;//studio property에서 제어하는 것을 추천.
	srcGrid.deleteRow(index);//지정된 단말기 목록에서 제거
	dialogAlert(app, "단말기", '선택한 항목을 해제 하였습니다.');
	targetGrid.redraw();
}
