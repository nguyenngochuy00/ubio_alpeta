/************************************************
 * AuthManagement.js
 * Created at 2018. 10. 30. 오후 2:14:47.
 *
 * @author donghee
 ************************************************/

//UDFunction
var girdPosition = 0;
var dataManager = cpr.core.Module.require("lib/DataManager");
var usint_version;
exports.setTerminalData = function(/*cpr.data.DataSet*/data){
	// 팝업창에서 설정한 returnValue 를 가져온다
	// returnValue 타입은 DataSet으로 작업하였다
	// returnValue 타입은 선택 팝업창을 띄운 Container가 설정한다.
	// 타입이 맞지 않을 경우 특정 매소드 사용 시 에러 발생.
	var privileges_include_terminals = app.lookup("privileges_include_terminals");

	// DateSet의 정보를 Clear한다.
	privileges_include_terminals.clear();
	
	// TERMINAL 데이터 셋으로 returnValue 값을 추가한다.
	data.copyToDataSet(privileges_include_terminals);
	
	var privileges_include_terminals_grid = app.lookup("privileges_include_terminals_grid");
	
	var container_layout = app.lookup("container_layout");
	var top = container_layout.getConstraint(privileges_include_terminals_grid.getParent()).top;
	
	
	var privileges_include_terminals_grid = app.lookup("privileges_include_terminals_grid");
	gridResize(privileges_include_terminals_grid , girdPosition , 49);
	
	return true;
}
	
	
exports.setUsersData = function(/*cpr.data.DataSet*/data){
	// 팝업창에서 설정한 returnValue 를 가져온다
	// returnValue 타입은 DataSet으로 작업하였다
	// returnValue 타입은 선택 팝업창을 띄운 Container가 설정한다.
	// 타입이 맞지 않을 경우 특정 매소드 사용 시 에러 발생.
	var privileges_include_users = app.lookup("privileges_include_users");

	// DateSet의 정보를 Clear한다.
	privileges_include_users.clear();
	
	// TERMINAL 데이터 셋으로 returnValue 값을 추가한다.
	data.copyToDataSet(privileges_include_users);
	
	var privileges_include_users_grid = app.lookup("privileges_include_users_grid");
	
	var container_layout = app.lookup("container_layout");
	var top = container_layout.getConstraint(privileges_include_users_grid.getParent()).top;
	
	
	var privileges_include_users_grid = app.lookup("privileges_include_users_grid");
	gridResize(privileges_include_users_grid , girdPosition , 49);
	
	return true;
}
	

function gridResize(grid_object, backGrid_top , wPercent){
	
	var width = 100;
	if(wPercent != null ){
		width = wPercent;
	}
	
	var container_layout = app.lookup("container_layout");
	
	container_layout.updateConstraint(grid_object.getParent(), {
		"top": backGrid_top + "px",
		"width": width+ "%",
		"height": (grid_object.getRowCount() * 24 + 100) +"px"
	});
	
	
	grid_object.getParent().updateConstraint(grid_object, {
		"top": "40px",
		"width": "100%",
		"height": (grid_object.getRowCount() * 24 + 24) +"px"
	});


	
	grid_object.vScroll = "hidden";
	grid_object.visible = true;
	grid_object.redraw();
	
	grid_object.getParent().vScroll = "hidden";
	grid_object.getParent().visible = true;
	grid_object.getParent().redraw();
	
	return (backGrid_top + (grid_object.getRowCount() * 24 + 120) );
}
	

//Auto Create function
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	var privileges_list_sm = app.lookup("privileges_list_sm");
	privileges_list_sm.send();
}


/*
 * 그리드에서 cell-click 이벤트 발생 시 호출.
 * Grid의 Cell 클릭시 발생하는 이벤트.
 */
function onPrivileges_gridCellClick(/* cpr.events.CGridEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	//Grid 초기 생성 위치 초기화
	girdPosition = 0;
	 
	 
	var privileges_grid = e.control;
	var privileges_sm = app.lookup("privileges_sm");
	privileges_sm.send();
	
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onPrivileges_users_smSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var privileges_users_sm = e.control;
	
	var _app = app;
	
	var Monitoring_grid = _app.lookup("Monitoring_grid");
	var Terminal_grid = _app.lookup("Terminal_grid");
	var User_grid = _app.lookup("User_grid");
	var Group_grid = _app.lookup("Group_grid");
	var Guest_grid = _app.lookup("Guest_grid");
	var Blacklist_grid = _app.lookup("Blacklist_grid");
	var AccessControl_grid = _app.lookup("AccessControl_grid");
	var Map_grid = _app.lookup("Map_grid");
	var TNA_grid = _app.lookup("TNA_grid");
	var Log_grid = _app.lookup("Log_grid");
	var Option_grid = _app.lookup("Option_grid");
	var Meal_grid = _app.lookup("Meal_grid");

	girdPosition = gridResize(Monitoring_grid , girdPosition );
	girdPosition = gridResize(Terminal_grid , girdPosition );
	girdPosition = gridResize(User_grid , girdPosition );
	girdPosition = gridResize(Group_grid , girdPosition );
	girdPosition = gridResize(Guest_grid , girdPosition );
	girdPosition = gridResize(Blacklist_grid , girdPosition );
	girdPosition = gridResize(AccessControl_grid , girdPosition );
	girdPosition = gridResize(Map_grid , girdPosition );
	girdPosition = gridResize(TNA_grid , girdPosition );
	girdPosition = gridResize(Log_grid , girdPosition );
	girdPosition = gridResize(Option_grid , girdPosition );
	girdPosition = gridResize(Meal_grid , girdPosition );

	var privileges_include_terminals_sm = app.lookup("privileges_include_terminals_sm");
	privileges_include_terminals_sm.send();
	
}

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onPrivileges_include_terminals_smSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var privileges_include_terminals_sm = e.control;
	
	var privileges_include_terminals_grid = app.lookup("privileges_include_terminals_grid");
	gridResize(privileges_include_terminals_grid , girdPosition , 49);
	
	var privileges_include_users_sm = app.lookup("privileges_include_users_sm");
	privileges_include_users_sm.send();
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onPrivileges_include_users_smSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var privileges_include_users_sm = e.control;
	
	var privileges_include_users_grid = app.lookup("privileges_include_users_grid");
	gridResize(privileges_include_users_grid , girdPosition , 49);
	
}



/*
 * "변경" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onPrivileges_include_terminals_modifyClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var privileges_include_terminals_modify = e.control;

	// app 정보를 담는다 Host 인지 아닌지를 확인하여 host App 에서 팝업을 띄워준다.
	var hostApp = app;
	
	var ActualHeight = app.getActualRect().height;
	var ActualWidth = app.getActualRect().width;
	var left = ActualWidth / 50;
	var top = ActualHeight / 50;
	
	var popupOption = {left:left,top:top,width:ActualWidth-(left*2),height:ActualHeight-(top*2),modal:false};
	
	// 팝업창 호출 시 데이터 전송
	var privileges_include_terminals = app.lookup("privileges_include_terminals");
	
	// Host App이 존재한다면 Host App에서 팝업창 출력.
	var appld = "app/popup/TerminalPopup" + "?" + usint_version;
	hostApp.openDialog(appld,popupOption,function(dialog){
		dialog.headerTitle = "단말기 선택창";
		// 전송하려는 function안에 dialog를 설정하여  Event 설정가능 close를 두어 팝업 창 종료 시 이벤트 발동
		dialog.addEventListenerOnce("close", 
			function(e){
				var dialog = e.control;
			} 
		);
		// 전송하려는 function안에 dialog를 설정하여  initValue 설정가능
		dialog.initValue = { "response_terminal_data" : privileges_include_terminals };
		
	} );
	
}


/*
 * "변경" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onPrivileges_include_users_modifyClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var privileges_include_users_modify = e.control;
	
	// app 정보를 담는다 Host 인지 아닌지를 확인하여 host App 에서 팝업을 띄워준다.
	var hostApp = app;
	
	var ActualHeight = app.getActualRect().height;
	var ActualWidth = app.getActualRect().width;
	var left = ActualWidth / 50;
	var top = ActualHeight / 50;
	
	var popupOption = {left:left,top:top,width:ActualWidth-(left*2),height:ActualHeight-(top*2),modal:false};
	
	// 팝업창 호출 시 데이터 전송
	var privileges_include_users = app.lookup("privileges_include_users");
	
	// Host App이 존재한다면 Host App에서 팝업창 출력.
	var appld = "app/popup/UsersPopup" + "?" + usint_version;
	hostApp.openDialog(appld,popupOption,function(dialog){
		dialog.headerTitle = "유저 선택창 선택창";
		// 전송하려는 function안에 dialog를 설정하여  Event 설정가능 close를 두어 팝업 창 종료 시 이벤트 발동
		dialog.addEventListenerOnce("close", 
			function(e){
				var dialog = e.control;
			} 
		);
		// 전송하려는 function안에 dialog를 설정하여  initValue 설정가능
		dialog.initValue = { "response_users_data" : privileges_include_users };
		
	} );
}

