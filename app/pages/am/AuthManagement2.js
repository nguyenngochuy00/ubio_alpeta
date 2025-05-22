/************************************************
 * AuthManagement.js
 * Created at 2018. 10. 30. 오후 2:14:47.
 *
 * @author donghee
 ************************************************/



/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
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
	var privileges_grid = e.control;
	var privileges_sm = app.lookup("privileges_sm");
	privileges_sm.send();
	
	var privileges_include_terminals_sm = app.lookup("privileges_include_terminals_sm");
	privileges_include_terminals_sm.send();
	
	var privileges_include_users_sm = app.lookup("privileges_include_users_sm");
	privileges_include_users_sm.send();
	
	
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
	
	var Monitoring_grid = app.lookup("Monitoring_grid");
	Monitoring_grid.getRowGroup
}




