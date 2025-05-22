/************************************************
 * locationTerminal.js
 * Created at 2019. 1. 30. 오후 3:20:46.
 *
 * @author osm8667
 ************************************************/
 var dataManager = getDataManager();

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var terminalList = dataManager.getTerminalList();
	var targetDataSet = app.lookup("TerminalList");
	var isDone = terminalList.copyToDataSet(targetDataSet);
	if(isDone){
		targetDataSet.commit();
	}
	//initValue
	var hostAppIns = app.getHostAppInstance();
	if(hostAppIns){
		/**
		 * @type Array
		 */
		var iconValues = app.getHostProperty("initValue");
	}
	var grdTmlSelect = app.lookup("grdTmlSelect");
	if(iconValues.length>0){
		iconValues.forEach(function(each){
			var filterRow = grdTmlSelect.findFirstRow("ID=="+parseInt(each));
			grdTmlSelect.deleteRow(filterRow.getIndex());
		});
	}
}


/*
 * "선택" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnAddIconClick(/* cpr.events.CMouseEvent */ e){	
	var grdTmlSelect = app.lookup("grdTmlSelect");
	var check = grdTmlSelect.getCheckRowIndices();

	if(check.length==0){
		dialogAlertAMHQ(app, "", dataManager.getString("Str_NoSelection"), "");
		return;
	}
	
	var result = [];
	for(var i=0; i<check.length;i++) {
		var rowData = grdTmlSelect.getRow(check[i]);		
		result.push(rowData);
		
	}
	app.close(result);
}


/*
 * 그리드에서 row-check 이벤트 발생 시 호출.
 * Grid의 RowCheckbox가 체크 되었을 때 발생하는 이벤트. (columnType=checkbox)
 */
function onGrdTmlSelectRowCheck(/* cpr.events.CGridEvent */ e){
	/**
	 * @type cpr.controls.Grid
	 */
	var grdTmlSelect = e.control;
	grdTmlSelect.selectRows(grdTmlSelect.getCheckRowIndices());
}


/*
 * 그리드에서 row-uncheck 이벤트 발생 시 호출.
 * Grid의 RowCheckbox가 체크 해제되었을 때 발생하는 이벤트. (columnType=checkbox)
 */
function onGrdTmlSelectRowUncheck(/* cpr.events.CGridEvent */ e){
	/**
	 * @type cpr.controls.Grid
	 */
	var grdTmlSelect = e.control;
	grdTmlSelect.selectRows(e.rowIndex);
}
