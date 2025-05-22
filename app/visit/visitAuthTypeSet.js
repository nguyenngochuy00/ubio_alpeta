/************************************************
 * userAuthTypeSet.js
 * Created at 2018. 10. 16. 오전 10:17:14.
 *
 * @author fois
 ************************************************/
var dataDragManager = cpr.core.Module.require("lib/DataDragManager");
var dataManager = cpr.core.Module.require("lib/DataManager");

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	//var brandType = dataManager.getSystemBrandType();
	
	var initValue = app.getHost().initValue;
	var arrAndAuth = initValue["AuthAnd"];
	var arrOrAuth = initValue["AuthOr"];
	
	var dsAndAuth = app.lookup("dsAndAuth");
	for ( var i=0; i<arrAndAuth.length; i++){
		var type = getAuthTypeString(arrAndAuth[i]);
		if ( type == null || type == "" ) continue;
		
		dsAndAuth.addRowData({"Type":type,"Value":arrAndAuth[i]});
	}
	
	var dsOrAuth = app.lookup("dsOrAuth");
	for ( var i=0; i<arrOrAuth.length; i++){
		var type = getAuthTypeString(arrOrAuth[i]);
		if ( type == null || type == "" ) continue;
		
		dsOrAuth.addRowData({"Type":type,"Value":arrOrAuth[i]});		
	}
	
	var dsAuthTypeList = app.lookup("dsAuthTypeList");
	for ( var i=1; i<10; i++){ // 모바일 카드는 현재 미표시.
		if( 4 < i && i < 9 ){continue;}
		
		var newRow = dsAuthTypeList.addRowData({"Type":getAuthTypeString(i),"Value":i});
		var selRow = dsAndAuth.findFirstRow("Value == '" + i +"'");
		if( selRow != null ) {			
			dsAuthTypeList.setRowState(newRow.getIndex(),cpr.data.tabledata.RowState.DELETED);
		} else {
			selRow = dsOrAuth.findFirstRow("Value == '" + i+"'");
			if( selRow != null ) {			
				dsAuthTypeList.setRowState(newRow.getIndex(),cpr.data.tabledata.RowState.DELETED);
			} else {
				dsAuthTypeList.setRowState(newRow.getIndex(),cpr.data.tabledata.RowState.UNCHANGED);
			}
		}	
	}	
	
	refreshAuthContrl();
	
	app.lookup("UVATS_grdAuthTypeList").redraw();
	app.lookup("UVATS_grdAuthAnd").redraw();
	app.lookup("UVATS_grdAuthOr").redraw();
}

function refreshAuthContrl(){
	var enableAnd = true;
	var enableOr = true;
	var dsAndAuth = app.lookup("dsAndAuth");		
	var dsOrAuth = app.lookup("dsOrAuth");
	if( dsAndAuth.getRowCount()> 0 ){
		enableOr = false;
	}
	if( dsOrAuth.getRowCount()> 0 ){
		enableAnd = false;
	}
	if( enableAnd == false && enableOr == false ){
		enableAnd = true; // 예외처리 .. 인증수단이 둘다 비활성화 되면 수정이 불가능하므로
	}
	
	app.lookup("UVATS_grdAuthAnd").enabled = enableAnd	
	app.lookup("UVATS_btnAddAnd").enabled = enableAnd
	app.lookup("UVATS_btnRemoveAnd").enabled = enableAnd
	
	app.lookup("UVATS_grdAuthOr").enabled = enableOr
	app.lookup("UVATS_btnAddOr").enabled = enableOr
	app.lookup("UVATS_btnRemoveOr").enabled = enableOr
}
//and 인증에서 드래그 시작
function onUSATS_grdAuthAndMousedown(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var uSATS_grdAuthAnd = e.control;
	
	if (e.targetObject && e.targetObject.row) {
		var row = e.targetObject.row;		
		dataDragManager.dataTransfer = {"Src":"andAuth","Row":row};
	}else{
		return;
	}
		
	var appRect = app.getActualRect();	
	
	var buffer = 20;
	var dragMessage = new cpr.controls.Output("rowmessage");	
	dragMessage.style.css({
		"position": "absolute",
		"left": (e.clientX - appRect.left) + "px",
		"top": ((e.clientY - appRect.top) + buffer) + "px",
		width: "100px",
		height: "25px",
		"text-align":"center",
		border: "solid 1px red",
		backgroundColor: "#FFF",
		"box-shadow": "0px 2px 2px 0px rgba(0, 0, 0, .3)"
	});
	

	dragMessage.ellipsis = true;
	var text = e.targetObject.row.getValue("Type");
	dragMessage.value = text;	
	dataDragManager.dragStart(dragMessage, app, e);
}

// and 인증으로 인증수단 그래그 함
function onUSATS_grdAuthAndMouseup(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var uSATS_grdAuthAnd = e.control;
	
	
	if(dataDragManager.dataTransfer){
		
		var row = dataDragManager.dataTransfer["Row"];		
		if( e.targetObject != null && e.targetObject.rowIndex == row.getIndex()){
			return;
		}
		var type = row.getValue("Type");
		var value = row.getValue("Value");
		if (type == null) {
			return;
		}
				
		var dsAndAuth = app.lookup("dsAndAuth");
		//var brandType = dataManager.getSystemBrandType();
		//if( brandType == BRAND_VRIDI ){ // 버디 타입인 경우	
			var authCount = dsAndAuth.getRowCount();
			if( dataDragManager.dataTransfer["Src"] != "andAuth" && authCount > 2 ){ // And 인증내 순서 변경이 아니고 이미 3개의 등록 수단이 있는 경우
				//dialogAlert(app,dataManager.getString("Str_Warning"), dataManager.getString("Str_AuthTypeMaxExceed"));
				dialogAlert(app,"경고", "인증수단은 최대 3개까지 등록 할 수 있습니다.");
				return;				
			}
		//}
		
		var targetIndex = ( e.targetObject != null )? e.targetObject.rowIndex:dsAndAuth.getRowCount();
						
		if( dataDragManager.dataTransfer["Src"] === "authList"){ // 인증 리스트에서 추가한 경우		
			
			var dsAuthTypeList = app.lookup("dsAuthTypeList");
			var updateRow = dsAuthTypeList.findFirstRow("Type == '" + type+"'");
			dsAuthTypeList.setRowState(updateRow.getIndex(), cpr.data.tabledata.RowState.DELETED);
			dsAndAuth.insertRowData(targetIndex, false, {"Type":type,"Value":value});
							
		} else if (dataDragManager.dataTransfer["Src"] === "orAuth" ){ // OR 인증에서 옮겨온 경우
			var dsOrAuth = app.lookup("dsOrAuth");
			var deleteRow = dsOrAuth.findFirstRow("Type == '" + type+"'");
			dsOrAuth.realDeleteRow(deleteRow.getIndex());			
			dsAndAuth.insertRowData(targetIndex, false, {"Type":type,"Value":value});
			
		} else { // And 내부에서 순서만 변경한 경우.
			var srcIndex = row.getIndex();
			var bAfter = false
			if( targetIndex > srcIndex ){
				//targetIndex -= 1;
				bAfter = true
			}			
			dsAndAuth.moveRowIndex(srcIndex, targetIndex,bAfter);
			//realDeleteRow(delIndex);	
		}			
		uSATS_grdAuthAnd.redraw();
		refreshAuthContrl();
	}
}

// and 인증수단 더블클릭
function onUSATS_grdAuthAndDblclick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var uSATS_grdAuthAnd = e.control;
	
	var row = uSATS_grdAuthAnd.getSelectedRow();								
	var type = row.getValue("Type");
		
	var dsAuthTypeList = app.lookup("dsAuthTypeList");
	var updateRow = dsAuthTypeList.findFirstRow("Type == '" + type+"'");
	
	if ( updateRow ){		
		dsAuthTypeList.setRowState(updateRow.getIndex(), cpr.data.tabledata.RowState.UNCHANGED);
		app.lookup("UVATS_grdAuthTypeList").redraw();
		
		var dsAndAuth = app.lookup("dsAndAuth");		
		dsAndAuth.realDeleteRow(row.getIndex());
		refreshAuthContrl();
	}	
}

// or 인증에서 드래그 시작
function onUSATS_grdAuthOrMousedown(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var uSATS_grdAuthOr = e.control;
	
	if (e.targetObject && e.targetObject.row) {
		var row = e.targetObject.row;		
		dataDragManager.dataTransfer = {"Src":"orAuth","Row":row};
	}else{
		return;
	}
		
	var appRect = app.getActualRect();	
	
	var buffer = 20;
	var dragMessage = new cpr.controls.Output("rowmessage");	
	dragMessage.style.css({
		"position": "absolute",
		"left": (e.clientX - appRect.left) + "px",
		"top": ((e.clientY - appRect.top) + buffer) + "px",
		width: "100px",
		height: "25px",
		"text-align":"center",
		border: "solid 1px red",
		backgroundColor: "#FFF",
		"box-shadow": "0px 2px 2px 0px rgba(0, 0, 0, .3)"
	});
	
	dragMessage.ellipsis = true;
	var text = e.targetObject.row.getValue("Type");
	dragMessage.value = text;	
	dataDragManager.dragStart(dragMessage, app, e);
}

// or 인증으로 인증수단 드래그 해 옴
function onUSATS_grdAuthOrMouseup(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Grid */
	var uSATS_grdAuthOr = e.control;
	
	if(dataDragManager.dataTransfer == null ){ // 드래그 앤 드롭이 아닌 경우 리턴.
		return;
	}
	/** @type cpr.data.Row */			
	var row = dataDragManager.dataTransfer["Row"];		
	if( e.targetObject != null && e.targetObject.rowIndex == row.getIndex()){ // 드롭 대상이 없거나 드래그 원본과 같은 객체일 경우 리턴
		return;
	}
	
	var type = row.getValue("Type");
	var value = row.getValue("Value");
	if (type == null) {
		return;
	}
	var dsOrAuth = app.lookup("dsOrAuth"); // OR 인증 리스트 데이터 셋
	
	//var brandType = dataManager.getSystemBrandType();
	//if( brandType == BRAND_VRIDI ){ // 버디 타입인 경우	
		if( dataDragManager.dataTransfer["Src"] != "orAuth"){ // OR 인증 리스트 내에서 데이터 순서만 바꾸는 경우가 아니면 패스워드 인증 체크	
			var pwAuth = dsOrAuth.findFirstRow("Value == "+AuthTypePassword);
			var authCount = dsOrAuth.getRowCount();
			if( pwAuth || value == AuthTypePassword){ // OR 인증이고 PW 인증이 포함되어 있는 경우				
				if( authCount >= 2 ){ // 인증 수단이 2개이면 더이상 추가 할 수 없다.
					dialogAlert(app,dataManager.getString("Str_Warning"), dataManager.getString("Str_UserAuthTypeORPasswordWarning"));
					return;
				}
			}
			if( authCount >= 3 ){				
				dialogAlert(app,dataManager.getString("Str_Warning"), dataManager.getString("Str_UserAuthTypeMaxExceed"));
				return;				
			}
		}
	//}
	
	// 드롭 위치가 빈 공간이라면 리스트 맨 뒤에 아니면 드롭 위치의 row index를 가져온다.
	var targetIndex = ( e.targetObject != null )? e.targetObject.rowIndex:dsOrAuth.getRowCount();				
	
	if( dataDragManager.dataTransfer["Src"] === "authList"){ // 드롭 원본이 인증수단 리스트인 경우
		
		var dsAuthTypeList = app.lookup("dsAuthTypeList");
		var updateRow = dsAuthTypeList.findFirstRow("Type == '" + type+"'");
		dsAuthTypeList.setRowState(updateRow.getIndex(), cpr.data.tabledata.RowState.DELETED);
		
		dsOrAuth.insertRowData(targetIndex, false, {"Type":type,"Value":value})
						
	} else if (dataDragManager.dataTransfer["Src"] === "andAuth" ){ // 드롭 원본이 AND 인증 리스트인 경우
		var dsAndAuth = app.lookup("dsAndAuth");
		var deleteRow = dsAndAuth.findFirstRow("Type == '" + type+"'");
		dsAndAuth.realDeleteRow(deleteRow.getIndex());			
		
		dsOrAuth.insertRowData(targetIndex, false, {"Type":type,"Value":value})
					
	} else {
		var srcIndex = row.getIndex();
		var bAfter = false
		if( targetIndex > srcIndex ){
			//targetIndex -= 1;
			bAfter = true
		}			
		dsOrAuth.moveRowIndex(srcIndex, targetIndex,bAfter);	
	}
	uSATS_grdAuthOr.redraw();
	refreshAuthContrl();	
}

// or 인증수단 더블 클릭
function onUSATS_grdAuthOrDblclick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var uSATS_grdAuthOr = e.control;
	
	var row = uSATS_grdAuthOr.getSelectedRow();								
	var type = row.getValue("Type");
		
	var dsAuthTypeList = app.lookup("dsAuthTypeList");
	var updateRow = dsAuthTypeList.findFirstRow("Type == '" + type+"'");
	
	if ( updateRow ){		
		dsAuthTypeList.setRowState(updateRow.getIndex(), cpr.data.tabledata.RowState.UNCHANGED);
		app.lookup("UVATS_grdAuthTypeList").redraw();
		
		var dsOrAuth = app.lookup("dsOrAuth");		
		dsOrAuth.realDeleteRow(row.getIndex());
		uSATS_grdAuthOr.redraw();
		refreshAuthContrl();
	}	
}

// 인증수단 리스트에서 드래그 시작 함.
function onUSATS_grdAuthTypeListMousedown(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var uSATS_grdAuthTypeList = e.control;
	
	if (e.targetObject && e.targetObject.row) {
		var row = e.targetObject.row;		
		
		if(row.getState() == cpr.data.tabledata.RowState.DELETED){
			return;
		}
		
		dataDragManager.dataTransfer = {"Src":"authList","Row":row};
		
	}else{
		return;
	}
		
	var appRect = app.getActualRect();	
	
	var buffer = 20;
	var dragMessage = new cpr.controls.Output("rowmessage");	
	dragMessage.style.css({
		"position": "absolute",
		"left": (e.clientX - appRect.left) + "px",
		"top": ((e.clientY - appRect.top) + buffer) + "px",
		width: "100px",
		height: "25px",
		"text-align":"center",
		border: "solid 1px red",
		backgroundColor: "#FFF",
		"box-shadow": "0px 2px 2px 0px rgba(0, 0, 0, .3)"
	});
	

	dragMessage.ellipsis = true;
	var text = e.targetObject.row.getValue("Type");
	dragMessage.value = text;	
	dataDragManager.dragStart(dragMessage, app, e);
	
}

// 인증수단 리스트로 인증수단 드래그 해 옴
function onUSATS_grdAuthTypeListMouseup(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var uSATS_grdAuthTypeList = e.control;
	if(dataDragManager.dataTransfer){
		
		var row = dataDragManager.dataTransfer["Row"];		
		var type = row.getValue("Type");
		
		var dsSource;
		var gridSource;
		if( dataDragManager.dataTransfer["Src"] === "andAuth"){
			dsSource = app.lookup("dsAndAuth");		
			gridSource = app.lookup("UVATS_grdAuthAnd")							
		} else if (dataDragManager.dataTransfer["Src"] === "orAuth" ){
			dsSource = app.lookup("dsOrAuth");
			gridSource = app.lookup("UVATS_grdAuthOr")
		} else {
			return;
		}
		var updateRow = uSATS_grdAuthTypeList.findFirstRow("Type == '" + type+"'");
			
		if ( updateRow ){
			dsSource.realDeleteRow(row.getIndex());
			uSATS_grdAuthTypeList.setRowState(updateRow.getIndex(), cpr.data.tabledata.RowState.UNCHANGED);
			
			gridSource.redraw();
			uSATS_grdAuthTypeList.redraw();			
		}
		refreshAuthContrl();
	}
}

// And로 추가
function onUVATS_btnAddAndClick(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Button */
	var uVATS_btnAddAnd = e.control;	
	
	var grdAuthTypeList = app.lookup("UVATS_grdAuthTypeList");
	var row = grdAuthTypeList.getSelectedRow();
	if( row == null ){
		return;
	}
	if( row.getStateString() == "D" || row.getStateString() == "ID" ){
		return;
	}
		
	var type = row.getValue("Type");
	var value = row.getValue("Value");
	if(type == null) {
		return;
	}
	var dsAndAuth = app.lookup("dsAndAuth"); 	
	var authCount = dsAndAuth.getRowCount();
	if( authCount > 2 ){ // And 인증 수단이  이미 3개의 등록 수단이 있는 경우
		//dialogAlert(app,dataManager.getString("Str_Warning"), dataManager.getString("Str_AuthTypeMaxExceed"));
		dialogAlert(app,"경고", "인증수단은 최대 3개까지 등록 할 수 있습니다.");
		return;				
	}
			
	var dsAuthTypeList = app.lookup("dsAuthTypeList");
	var updateRow = dsAuthTypeList.findFirstRow("Type == '" + type+"'");
	dsAuthTypeList.setRowState(updateRow.getIndex(), cpr.data.tabledata.RowState.DELETED);
	dsAndAuth.insertRowData(dsAndAuth.getRowCount(), false, {"Type":type,"Value":value});
						
	app.lookup("UVATS_grdAuthAnd").redraw();
	refreshAuthContrl();	
}

// And에서 삭제
function onUVATS_btnRemoveAndClick(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Button	 */
	var uVATS_btnRemoveAnd = e.control;	
	
	var grdAuthTypeList = app.lookup("UVATS_grdAuthTypeList");
	var grdAuthAnd = app.lookup("UVATS_grdAuthAnd");
	var row = grdAuthAnd.getSelectedRow();
	if( row == null ){
		return;
	}
			
	var type = row.getValue("Type");
	
	var dsAndAuth = app.lookup("dsAndAuth");		

	var updateRow = grdAuthTypeList.findFirstRow("Type == '" + type+"'");
	if ( updateRow ){
		dsAndAuth.realDeleteRow(row.getIndex());
		grdAuthTypeList.setRowState(updateRow.getIndex(), cpr.data.tabledata.RowState.UNCHANGED);
			
		grdAuthAnd.redraw();
		grdAuthTypeList.redraw();			
	}
	refreshAuthContrl();
}

// Or로 추가
function onUVATS_btnAddOrClick(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Button	 */
	var uVATS_btnAddOr = e.control;	
	var grdAuthTypeList = app.lookup("UVATS_grdAuthTypeList");
	var row = grdAuthTypeList.getSelectedRow();
	if( row == null ){
		return;
	}
	if( row.getStateString() == "D" || row.getStateString() == "ID" ){
		return;
	}
	
	var type = row.getValue("Type");
	var value = row.getValue("Value");
	if (type == null) {
		return;
	}
	var dsOrAuth = app.lookup("dsOrAuth"); // OR 인증 리스트 데이터 셋
		
	var pwAuth = dsOrAuth.findFirstRow("Value == "+AuthTypePassword);
	var authCount = dsOrAuth.getRowCount();
	if( pwAuth || value == AuthTypePassword){ // OR 인증이고 PW 인증이 포함되어 있는 경우				
		if( authCount >= 2 ){ // 인증 수단이 2개이면 더이상 추가 할 수 없다.
			dialogAlert(app,"경고", "OR 조건의 패스워드 조합은 2개만 가능합니다.");
			//dialogAlert(app,dataManager.getString("Str_Warning"), dataManager.getString("Str_UserAuthTypeORPasswordWarning"));		
			return;
		}
	}
	
	if( authCount >= 3 ){				
		//dialogAlert(app,dataManager.getString("Str_Warning"), dataManager.getString("Str_UserAuthTypeMaxExceed"));
		dialogAlert(app,"경고", "인증수단은 최대 3개까지 등록 할 수 있습니다.");
		return;
	}				
		
	var dsAuthTypeList = app.lookup("dsAuthTypeList");
	var updateRow = dsAuthTypeList.findFirstRow("Type == '" + type+"'");
	dsAuthTypeList.setRowState(updateRow.getIndex(), cpr.data.tabledata.RowState.DELETED);
		
	dsOrAuth.insertRowData(dsOrAuth.getRowCount(), false, {"Type":type,"Value":value})
	
	app.lookup("UVATS_grdAuthOr").redraw();
	refreshAuthContrl();	
}

// Or에서 삭제
function onUVATS_btnRemoveOrClick(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Button	 */
	var uVATS_btnRemoveOr = e.control;	
	
	var grdAuthTypeList = app.lookup("UVATS_grdAuthTypeList");
	var grdAuthOr = app.lookup("UVATS_grdAuthOr");
	var row = grdAuthOr.getSelectedRow();
	if( row == null ){
		return;
	}
			
	var type = row.getValue("Type");
	
	var dsAndOr = app.lookup("dsOrAuth");		

	var updateRow = grdAuthTypeList.findFirstRow("Type == '" + type+"'");
	if ( updateRow ){
		dsAndOr.realDeleteRow(row.getIndex());
		grdAuthTypeList.setRowState(updateRow.getIndex(), cpr.data.tabledata.RowState.UNCHANGED);
			
		grdAuthOr.redraw();
		grdAuthTypeList.redraw();			
	}
	refreshAuthContrl();
}

/*
 * "적용" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSATS_btnApplyClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var uSATS_btnApply = e.control;
	
	var dsAndAuth = app.lookup("dsAndAuth");
	var dsOrAuth = app.lookup("dsOrAuth");
		
	var andCount = dsAndAuth.getRowCount();
	var orCount = dsOrAuth.getRowCount();
	
	if( andCount + orCount == 0 ){
		dialogAlert(app,dataManager.getString("Str_Info"), dataManager.getString("Str_UserAuthTypeAtLeastOne"));
		return;
	}
	
	var idx = 0;
	var result = [];
	
	for( var i=0; i<andCount;i++){
		var row = dsAndAuth.getRow(i);
		result[idx++]= row.getValue("Value");		
	}
	
	
	for( var i=0; i<orCount; i++){
		var row = dsOrAuth.getRow(i);
		result[idx++] = row.getValue("Value");
	}
	for( var k=dsAndAuth.getRowCount()+dsOrAuth.getRowCount(); k <7; k++){		
		result[idx++] = 0
	}
	result[7]=dsAndAuth.getRowCount();
	app.close(result);
}