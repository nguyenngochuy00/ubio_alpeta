/************************************************
 * UserManagement.js
 * Created at 2018. 10. 29. 오후 5:49:46.
 *
 * @author osm8667
 ************************************************/
var gridUtil = createGridUtil(app);

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
			if(key == "id"){
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
	
	desGrd.sort("id ASC");
	
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
			if(key == "id"){
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
	desGrid.sort("id ASC");
}



/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var tree = app.lookup("tre1");
	tree.visible = false;
	var getUserlist = app.lookup("userserv");
	getUserlist.send();
	
	
	var hostapp = app.getHostAppInstance();
	if(!app.isRootAppInstance()){
			
		var hostapp = app.getHostAppInstance();
		if(hostapp != null){
			//호스트 앱에서 initValue를 전달 받을 경우 받아온다
			//현재 initValue로 받아온 데이터는 map<String,Object> 형식이다.
			initValue = app.getHostProperty("initValue");
			
			if(initValue!= null) {
				initValueCheck = true;
				var UsersData = initValue["response_users_data"];
				var response_users_data = app.lookup("response_users_data");
				
				// response_terminal_data로 TermianlData를 copy한다.
				// response_terminal_data 데이터 셋으로 TermianlData 값을 추가한다. 
				// 현재 response_terminal_data은 response_terminal_grid와 bind 되어있다
				// 자동으로 값이 추가된 것을 확인 할 수 있다.
				UsersData.copyToDataSet(response_users_data);
			} 
		}
	}
	
	var grd1 = app.lookup("grd1");
	var grd2 = app.lookup("grd2");
	grd1.sort("id ASC");
	grd2.sort("id ASC");
	
}





/*
 * 사용자 정의 컨트롤에서 search 이벤트 발생 시 호출.
 */
function onSearch_type1Search(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.search_type1
	 */
	var search_type1 = e.control;
	var text = search_type1.getText(); //udc에서 exports한 검색 텍스트를 받아옵니다.
	app.lookup("getList").send();
	
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
	gridUtil.setPagingInfo("resPage", "pageIndexer");
}

function doSearch() {
	// 조회 Submission send
	var getlist = app.lookup("getList");
	getlist.send();
}


/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var pageIndexer = e.control;
	var pageidx = pageIndexer.currentPageIndex;
	//ui단 페이징
	var start = (pageidx-1)*10;
	var end = pageidx*10;
	var grd = app.lookup("grd1");
	grd.clearFilter();
	grd.filter(start+"<id && id<="+end);
	grd.redraw();
}


/*
 * 트리에서 item-click 이벤트 발생 시 호출.
 * 아이템 클릭시 발생하는 이벤트.
 */
function onTre1ItemClick(/* cpr.events.CItemEvent */ e){
	/** 
	 * @type cpr.controls.Tree
	 */
	var tre1 = e.control;

}


/*
 * 트리에서 selection-change 이벤트 발생 시 호출.
 * 선택된 Item 값이 저장된 후에 발생하는 이벤트.
 */
function onTre1SelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Tree
	 */
	var tre1 = e.control;
	var id = e.newSelection[0].value;
	var grd = app.lookup("grd1");
	if(id!=0&&id!=1){
		grd.filter("uid=='"+id+"'");
		grd.redraw();
	}
}

/*
 * 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
 */
function onPageIndexerPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.pageindex
	 */
	var pageIndexer = e.control;
	// 변경된 페이지 인덱스를 DataMap에 반영.
	var resPage = app.lookup("resPage");
	resPage.setValue("pageIdx", e.newSelection);
	// 화면 조회
	doSearch();
}

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onUserservSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var userserv = e.control;
	var userlist = app.lookup("userlist");
	
	var tot = app.lookup("opt_tot");
	tot.value = userlist.getRowCount();
	
	userlist.copyToDataSet(app.lookup("userlist1"));
	userlist.copyToDataSet(app.lookup("userlist2"));
	//ui단 페이징
	var total = userlist.getRowCount();
	var grd = app.lookup("grd1");
	grd.filter("id<11");
	var pgidx = app.lookup("pgidx");
	pgidx.totalRowCount = total;
	//사이드 트리 생성
	var tree = app.lookup("tre1");
	tree.redraw();
	tree.visible = true;	
}


/*
 * MDI 폴더에서 tabheader-click 이벤트 발생 시 호출.
 * 탭 아이템의 헤더 영역을 클릭하였을 때 발생하는 이벤트 입니다.
 */
function onMdi1TabheaderClick(/* cpr.events.CItemEvent */ e){
	/** 
	 * @type cpr.controls.MDIFolder
	 */
	var mdi1 = e.control;
	
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
		copyGridData("grd1", "grd2");
		
	} else if(heading.toString() == ">>"){
		copyAllGridData("grd1", "grd2");
		
	} else if(heading.toString() == "<"){
		if(initValueCheck){
			if(confirm("기존 데이터를 수정할 경우 적용 시 초기값으로 입력됩니다. 진행하시겠습니까?")){
				initValueCheck = false;
			}else {
				return ;
			}
		}
		copyGridData("grd2", "grd1");
		
	} else if(heading.toString() == "<<"){
		if(initValueCheck){
			if(confirm("기존 데이터를 수정할 경우 적용 시 초기값으로 입력됩니다. 진행하시겠습니까?")){
				initValueCheck = false;
			}else {
				return ;
			}
		}
		copyAllGridData("grd2", "grd1");
		
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
			
		var response_users_data = app.lookup("response_users_data");
	
		var hostAppIns = app.getHostAppInstance();
		
		if(hostAppIns){
			if(hostAppIns.hasAppMethod("setUsersData")){
				if(hostAppIns.callAppMethod("setUsersData", response_users_data)){
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



