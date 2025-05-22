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
	var hostAppIns = app.getHostAppInstance();
	if(hostAppIns){
		/**
		 * @type Array
		 */
		var iconValues = app.getHostProperty("initValue");
	}
	getMapAreaList(iconValues);
	cpr.core.NotificationCenter.INSTANCE.subscribe("areaStateChange", app, function(payload){
		getMapAreaList(iconValues);
	});
}


/**
 * 구역 목록을 조회한다.
 * @param {any} iconValues 부모창에서 선택한 구역목록
 */
function getMapAreaList(iconValues){
	var getMapAreaList = app.lookup("sms_getMapAreaList");
	getMapAreaList.send();
	getMapAreaList.addEventListenerOnce("submit-success", function(){
		var mapGrid = app.lookup("grdAreaSelect");
		if(iconValues.length>0){
			iconValues.forEach(function(each){
				var delrow = mapGrid.findFirstRow("MapCode=="+each);
				if(delrow){
					mapGrid.deleteRow(delrow.getIndex());
				}
			});
			mapGrid.redraw();
		}
	});
}


/*
 * "선택" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnAddIconClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var btnAddIcon = e.control;
	var grd = app.lookup("grdAreaSelect");
	//체크된 로우의 index 가져와서 select 한 후 select row 추출
	var check = grd.getCheckRowIndices();
	grd.selectRows(check);
	var selectRows = grd.getSelectedRows();

	if(check.length==0){
		dialogAlertAMHQ(app, "", dataManager.getString("Str_NoSelection"), "");
		return;
	}
	app.close(selectRows);
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
	grdTmlSelect.selectRows(grdTmlSelect.getCheckRowIndices());//css 효과만
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
	grdTmlSelect.selectRows(e.rowIndex);//css 효과만
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms_getMapAreaListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var sms_getMapAreaList = e.control;

}






/*
 * 그리드에서 cell-click 이벤트 발생 시 호출.
 * Grid의 Cell 클릭시 발생하는 이벤트.
 */
function onGrdAreaSelectCellClick(/* cpr.events.CGridEvent */ e){
	/**
	 * @type cpr.controls.Grid
	 */
	var grdAreaSelect = e.control;
	if(e.cellIndex == 5){
		var mainLib = mainManager(app.getRootAppInstance());
		mainLib.ExecuteMenu(DLG_MAP_AREA_MANAGEMENT, grdAreaSelect.getSelectedRow().getValue("MapCode"));
	}
}


///*
// * 그리드에서 dblclick 이벤트 발생 시 호출.
// * 사용자가 컨트롤을 더블 클릭할 때 발생하는 이벤트.
// */
//function onGrdAreaSelectDblclick(/* cpr.events.CMouseEvent */ e){
//	/**
//	 * @type cpr.controls.Grid
//	 */
//	var grdAreaSelect = e.control;
//	if(grdAreaSelect.getRowCount()==0){
//		var mainLib = mainManager(app.getRootAppInstance());
//		mainLib.ExecuteMenu(DLG_MAP_AREA_MANAGEMENT, null);
//	}
//}


/*
 * Body에서 dispose 이벤트 발생 시 호출.
 * 컨트롤이 dispose될 때 호출되는 이벤트.
 */
function onBodyDispose(/* cpr.events.CEvent */ e){
	cpr.core.NotificationCenter.INSTANCE.unsubscribe(app, "areaStateChange");
}
