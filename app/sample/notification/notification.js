/************************************************
 * notification.js
 * Created at 2018. 10. 15. 오후 1:34:47.
 *
 * @author donghee
 ************************************************/
var editRowIndex = 0;
var editStatus = false;

var noneAccessAreaCount = 0 ;
var noneAccessTerminalCount = 0;
var dataManager = cpr.core.Module.require("lib/DataManager");
var usint_version;
/*알림 메시지를 위한 설정*/
cpr.core.NotificationCenter.INSTANCE.subscribe("notifi", this, function(msg) {
	var notifier = app.lookup("notification");
	if (msg.success == true) {
		notifier.success(msg.msg);
	} else if (msg.info == true) {
		notifier.info(msg.msg);
	} else if (msg.warning == true) {
		notifier.warning(msg.msg);
	} else if (msg.danger == true) {
		notifier.danger(msg.msg);
	} else {
		notifier.info(msg);
	}
});

exports.setTerminalData = function(/*cpr.data.DataSet*/data){
	// 팝업창에서 설정한 returnValue 를 가져온다
	// returnValue 타입은 DataSet으로 작업하였다
	// returnValue 타입은 선택 팝업창을 띄운 Container가 설정한다.
	// 타입이 맞지 않을 경우 특정 매소드 사용 시 에러 발생.
	var TERMINAL = app.lookup("TERMINAL");

	// DateSet의 정보를 Clear한다.
	TERMINAL.clear();
	
	// TERMINAL 데이터 셋으로 returnValue 값을 추가한다.
	data.copyToDataSet(TERMINAL);
	
	
	UDCGroupDataSetting();
	alert("저장되었습니다.");
}
	
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	app.lookup("getArea").send();
}

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onGetINOUTareaSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var getINOUTarea = e.control;
	
	var INAREA = app.lookup("INAREA");
	var OUTAREA = app.lookup("OUTAREA");
	var NONEAREA = app.lookup("NONEAREA");
	
	INAREA.refresh();
	OUTAREA.refresh();
	NONEAREA.refresh();

	app.lookup("getTerminal").send();	
}

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onGetTerminalSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var getTerminal = e.control;
	UDCGroupDataSetting();
	
}

/*
 * 사용자 정의 컨트롤에서 mouseEnter 이벤트 발생 시 호출.
 */
function onInGroupMouseEnter(/* cpr.events.CMouseEvent */ e, param ){
	/** 
	 * @type udc.GroupingSelection
	 */
	var inGroup = e.control;
	
	var notification = app.lookup("notification");
	
	if(inGroup.value != "" ){
		cpr.core.NotificationCenter.INSTANCE.post("notifi", {
			warning : true,
			msg : "지정되지 않은 단말기가 " + noneAccessTerminalCount + "개 존재합니다.   " + noneAccessAreaCount + "일자로 추가된 단말기가 존재합니다."
		});
	}
}


/*
 * "입구 단말 추가" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAddInAreaTerminalClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var addInAreaTerminal = e.control;
	if(!validationEditMode(addInAreaTerminal)){
		return;
	}
	
	// app 정보를 담는다 Host 인지 아닌지를 확인하여 host App 에서 팝업을 띄워준다.
	var hostApp = app;
	
	var ActualHeight = app.getActualRect().height;
	var ActualWidth = app.getActualRect().width;
	var left = ActualWidth / 50;
	var top = ActualHeight / 50;
	var style = {name:"asdf"}
	
	var popupOption = {left:left,top:top,width:ActualWidth-(left*2),height:ActualHeight-(top*2),style:style};
	
	// 팝업창 호출 시 데이터 전송
	var TERMINAL = app.lookup("TERMINAL");
	
	var groupData = app.lookup("groupData");
	
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
		dialog.initValue = { "response_terminal_data" : TERMINAL };
		
	} );
	
}


/*
 * 그리드에서 cell-click 이벤트 발생 시 호출.
 * Grid의 Cell 클릭시 발생하는 이벤트.
 */
function onArea_list_gridCellClick(/* cpr.events.CGridEvent */ e){

	/** 
	 * @type cpr.controls.Grid
	 */
	var area_list_grid = e.control;
	if(!validationEditMode(area_list_grid)){
		return;
	}
	var selectArea_code = area_list_grid.getSelectedRow().getValue("AREA_CODE");
	var selectArea_name = area_list_grid.getSelectedRow().getValue("AREA_NAME");
	
	var area_name_output = app.lookup("area_name_output");
	area_name_output.value = selectArea_name;
	area_name_output.redraw();
	
	
	var request_map = app.lookup("request_map");
	request_map.setValue("name", selectArea_code);
	
	var getINOUTarea = app.lookup("getINOUTarea");
	getINOUTarea.send();
	
}

/*
 * 사용자가 컨트롤을 클릭할 때 발생하도록 유도하는 이벤트
 * Edit 중 다른 동작을 할 경우 막아야 할 경우에 추가한다.
 */
function validationEditMode(controls){
	if(editStatus){
		var area_list_grid = app.lookup("area_list_grid");
		
		if(controls.id == "area_list_grid"){
			if(area_list_grid.getSelectedRowIndex() != editRowIndex){
				alert("추가중인 데이터가 있습니다. 저장 후 다시 선택해 주시길 바랍니다.");
			}
		} else {
			alert("추가중인 데이터가 있습니다. 저장 후 다시 시도해 주시길 바랍니다.");
		}
		area_list_grid.focusCell(editRowIndex, 0);
		area_list_grid.setEditRowIndex(editRowIndex);
		area_list_grid.selectRows(editRowIndex);
			
		return false;
	}
	return true;
}


/*
 * "추가" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAddAreaClick(/* cpr.events.CMouseEvent */ e){

	/** 
	 * @type cpr.controls.Button
	 */
	var addArea = e.control;
	if(!validationEditMode(addArea)){
		return;
	}
	var area_list_grid = app.lookup("area_list_grid");
	
	if(editStatus){
		alert("추가중인 데이터가 존재합니다. 저장을 눌러주세요." );
		return;
	}
	reselection();
	
	// 전역변수를 변경하여 GRID가 Edit 상태라고 선언한다.	
	editStatus = true;
	editRowIndex = area_list_grid.getRowCount();
	
	//Area 그리드에 Row를 한줄 추가한다.
	area_list_grid.insertRowData(editRowIndex, true);
	
	//Area 그리드에 Read only를 false로 변경하며 그리드를 reset하여 Edit 모드가 가능하도록 바꿔준다.
	area_list_grid.readOnly = false;
	area_list_grid.resetGrid();
	
	//Area 그리드에  추가한 Row를 Edit 속성으로 변경한다.
	area_list_grid.setEditRowIndex(editRowIndex)

	//Edit 속성으로 변경한 Cell로 Focus를 주어 입력받도록 유도한다.	
	area_list_grid.focusCell(editRowIndex, 0);
	
}

/*
 * "저장" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onSaveAreaClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var saveArea = e.control;
	
	var area_list_grid = app.lookup("area_list_grid");
	
	if(area_list_grid.getCellValue(area_list_grid.getEditRowIndex(), 0) == "" ){
		alert("입력한 데이터가 없습니다. 최소 이름을 입력해 주시길 바랍니다.");
		area_list_grid.focusCell(editRowIndex, 0);
		area_list_grid.setEditRowIndex(editRowIndex);
		area_list_grid.selectRows(editRowIndex);
		return;
	}	
	area_list_grid.readOnly = editStatus;
	area_list_grid.resetGrid();
	
	editStatus = false;
	editRowIndex = 0;
}


/*
 * "삭제" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onDelAreaClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var delArea = e.control;
	if(!validationEditMode(delArea)){
		return;
	}
	
	var area_list_grid = app.lookup("area_list_grid");
	var DeleteData = area_list_grid.getCellValue(area_list_grid.getSelectedRowIndex(), "AREA_NAME");
	if(confirm(DeleteData +"을 삭제하시겠 습니까?") ){
		area_list_grid.deleteRow(area_list_grid.getSelectedRowIndex());
		alert(DeleteData + "가 정상적으로 삭제되었습니다.");
		reselection();
	}
}


/*
 * 인풋 박스에서 keydown 이벤트 발생 시 호출.
 * 사용자가 키를 누를 때 발생하는 이벤트.
 */
function onIpb1Keydown(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var ipb1 = e.control;
	if(event.keyCode == 27 ){
		cancelText();
	}
}




//UDFunction
function UDCGroupDataSetting( ){
	//AREA
	var INAREA = app.lookup("INAREA");
	var OUTAREA = app.lookup("OUTAREA");
	var NONEAREA = app.lookup("NONEAREA");
	
	//TERMINAL
	var TERMINAL = app.lookup("TERMINAL");
	var IN_GROUP = app.lookup("IN_GROUP");
	var OUT_GROUP = app.lookup("OUT_GROUP");
	var NONE_GROUP = app.lookup("NONE_GROUP");
	
	//Selection Data Set
	var groupData = app.lookup("groupData");
	
	//UDC
	var inGroup = app.lookup("inGroup");
	var outGroup = app.lookup("outGroup");
	var emptyGroupData = new cpr.data.DataSet("empty");
	inGroup.setAppProperty("GroupData", emptyGroupData);
	outGroup.setAppProperty("GroupData", emptyGroupData);

	
	groupData.refresh();
	
	INAREA.refresh();
	OUTAREA.refresh();
	NONEAREA.refresh();
	
	IN_GROUP.refresh();
	OUT_GROUP.refresh();
	NONE_GROUP.refresh();
	
	var inareaText = app.lookup("inareaText");
	var outareaText = app.lookup("outareaText");
	
	if(IN_GROUP.getRowCount() != 0 ){
		inareaText.value = "이 구역은 "+ INAREA.getRowCount() +"개의 구역 "+ IN_GROUP.getRowCount() +"개의 단말을 통해 들어올 수 있습니다.";	
	}else {
		inareaText.value = "이 입구 단말이 설정되지 않았습니다.";
	}
	
	if(OUT_GROUP.getRowCount() != 0 ){
		outareaText.value = "이 구역에서 "+ OUTAREA.getRowCount() +"개의 단말을 통해 "+ OUT_GROUP.getRowCount() +"개의 구역으로 나갈 수 있습니다.";
	} else {
		outareaText.value = "이 출구 단말이 설정되지 않았습니다.";
	}
	
	inareaText.redraw();
	outareaText.redraw();
	
		
	//IN OUT 그룹 유무 확인하여 Button Visible 효과 적용
	var addOutAreaTerminal = app.lookup("addOutAreaTerminal");
	var addInAreaTerminal = app.lookup("addInAreaTerminal");
	
	if(INAREA.getRowCount() > 0 ){
		addInAreaTerminal.visible = true;
	} else {
		addInAreaTerminal.visible = false;
	}
	if(OUTAREA.getRowCount() > 0 ){
		addOutAreaTerminal.visible = true;
	} else {
		addOutAreaTerminal.visible = false;
	}
	
	addInAreaTerminal.redraw();
	addOutAreaTerminal.redraw();
	
	if(NONEAREA.copyToDataSet(groupData) ){
		if(INAREA.copyToDataSet(groupData) ){
			if(TERMINAL.copyToDataSet(groupData) ){
				inGroup.setAppProperty("GroupData", groupData);
				groupData.clear();
			}
		}
	}
	
	if(OUTAREA.copyToDataSet(groupData) ){
		if(TERMINAL.copyToDataSet(groupData) ){
			outGroup.setAppProperty("GroupData", groupData);
			groupData.clear();
		}
	}
	
	noneAccessTerminalCount = NONE_GROUP.getRowCount();
	if(noneAccessTerminalCount > 0 ){
		noneAccessAreaCount = NONE_GROUP.getRow(0).getValue("CREATE_TIME");
	}
	
	noneAccessTerminalCount = NONE_GROUP.getRowCount();
	
	var inGroupHeight = inGroup.getNaturalHeight();
	var outGroupHeight = outGroup.getNaturalHeight();
	var naturalHeight = 0 ;
	if(inGroupHeight > outGroupHeight || inGroupHeight == outGroupHeight ) {
		naturalHeight = inGroupHeight
	} else {
		naturalHeight = outGroupHeight
	}
	
	var groupLayout = app.lookup("groupLayout");
	app.getContainer().updateConstraint(groupLayout, {
		hieght : naturalHeight + "px"
	});
}


function cancelText(){
	reselection();
	editRowIndex = 0;
	editStatus = false;
	
}


function reselection(){
	
	var area_name_output = app.lookup("area_name_output");
	area_name_output.value = "구역을 선택해 주시길바랍니다.";
	area_name_output.redraw();
	
	var inareaText = app.lookup("inareaText");
	var outareaText = app.lookup("outareaText");
	inareaText.value = "입구 단말이 설정되지 않았습니다.";
	outareaText.value = "출구 단말이 설정되지 않았습니다.";
	inareaText.redraw();
	outareaText.redraw();
	
	//UDC
	var inGroup = app.lookup("inGroup");
	var outGroup = app.lookup("outGroup");
	
	var emptyGroupData = new cpr.data.DataSet("empty");
	inGroup.setAppProperty("GroupData", emptyGroupData);
	outGroup.setAppProperty("GroupData", emptyGroupData);
	
	
	
}
