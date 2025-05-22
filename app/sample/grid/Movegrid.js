/************************************************
 * rolemanager.js
 * Created at 2018. 10. 11. 오전 10:35:31.
 *
 * @author osm86
 ************************************************/

var gridUtil = createGridUtil(app);
var dateLib = cpr.core.Module.require("lib/DateLib");

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	console.log(dateLib.getToday("-"))
}


/*
 * 사용자 정의 컨트롤에서 search 이벤트 발생 시 호출.
 */
function onSearchform1Search(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.searchform1
	 */
	var searchform1 = e.control;
	var getlist = app.lookup("getList");
	getlist.send();
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
	var grdRole = app.lookup("grd_RoleList");
	grdRole.redraw();
}


/*
 * "변경" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn_ChangeModeClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btn_ChangeMode = e.control;
	var srcGrid = app.lookup("grd_RoleList");
	var tarGrid = app.lookup("grd_TargetRoleList");
	//srcGrid.deleteColumn(0);
}


/*
 * ">" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBnt_RightMoveClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var bnt_RightMove = e.control;
	
	gridUtil.moveGridData("grd_RoleList", "grd_TargetRoleList");
	
}


/*
 * "<" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBnt_LeftMoveClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var bnt_LeftMove = e.control;
	
	gridUtil.moveGridData("grd_TargetRoleList", "grd_RoleList");
}


/*
 * ">>" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn_RightAllClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btn_RightAll = e.control;
	gridUtil.moveGridAllData("grd_RoleList", "grd_TargetRoleList");
	
}


/*
 * "<<" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn_LeftAllClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btn_LeftAll = e.control;
	gridUtil.moveGridAllData("grd_TargetRoleList", "grd_RoleList");
}


/*
 * "copy >>" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn_RCopyClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btn_RCopy = e.control;
	gridUtil.copyGridData("grd_RoleList", "grd_TargetRoleList");
	
}


/*
 * "copy <<" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn_LCopyClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btn_LCopy = e.control;
	var list = app.lookup("dlt_List");
	var tlist = app.lookup("dlt_TargetList");
	tlist.copyToDataSet(list, "id!=id");
}
