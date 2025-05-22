/************************************************
 * positionManagement.js
 * Created at 2018. 11. 14. 오후 4:27:35.
 *
 * @author kth
 ************************************************/

var selIdx = -1;
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;

function onBodyLoad(e){
	comLib = createComUtil(app);
	dataManager = getDataManager();

	var posistionList = dataManager.getPositionList();
	var dsPositionList = app.lookup("PositionList");
	posistionList.copyToDataSet(dsPositionList);
	dsPositionList.commit();
	var oemVersion = dataManager.getOemVersion();
	if(oemVersion == OEM_ITONE_TRDATA || oemVersion == OEM_ITONE_POSCO_DX) {
		app.lookup("STMGR_btnAdd").visible = false;
		app.lookup("STMGR_btnApply").visible = false;
		app.lookup("STMGR_btnDelete").visible = false;
	}
}

// 추가 버튼 클릭
function onSTMGR_btnAddClick(/* cpr.events.CMouseEvent */ e){
	var btnAdd = e.control;	
	var dsPositionList = app.lookup("PositionList");		
	dsPositionList.addRow();	
}

function getPositionID() {
	
	var dsPositionList = app.lookup("PositionList");
	// var positionID = dsPositionList.getMax("PositionID"); eXBuilder 버그.. 최대값 반환 안됨
	
	var positionID = 1;
	var count = dsPositionList.getRowCount();
	for( var i = 0; i < count; i++){
		var data = dsPositionList.getRow(i);
		var posID = data.getValue("PositionID");
		
		if( Number(positionID) < Number(posID) ){
			positionID = posID;			
		}
	}
	positionID++
	return positionID;
}

// 적용 버튼 클릭
function onSTMGR_btnApplyClick(/* cpr.events.CMouseEvent */ e){
	var btnApply = e.control;
	
	var grdPositionInfo = app.lookup("STMGR_grdPositionList");
	var index = grdPositionInfo.getSelectedRow().getIndex();
	
	var dsPositionList = app.lookup("PositionList");
	var selectedPosition = dsPositionList.getRow(index);
	if( selectedPosition == null ){
		return;
	}
	var positionID = selectedPosition.getValue("PositionID");
	var PositionName = selectedPosition.getValue("Name");
	
	var dmPosioninfo = app.lookup("Posioninfo");
	dmPosioninfo.setValue("Name", PositionName);
	
	if( positionID == "" || positionID == null || positionID == undefined) {
		positionID = getPositionID();		
		dmPosioninfo.setValue("PositionID", Number(positionID));
		var sms_postPosition = app.lookup("sms_postPosition");
		sms_postPosition.userAttr("index", String(index));
		sms_postPosition.action = "/v1/positions";
		sms_postPosition.send();
	} else {				
		dmPosioninfo.setValue("PositionID", Number(positionID));
		var sms_putPosition = app.lookup("sms_putPosition");
		sms_putPosition.userAttr("index", String(index));
		sms_putPosition.action = "/v1/positions/"+positionID;
		sms_putPosition.send();
	}
}

// 직급 등록 성공
function onSms_postPositionSubmitDone(/* cpr.events.CSubmissionEvent */ e){		
	/** @type cpr.protocols.Submission */
	var sms_postPosition = e.control;
	var result = app.lookup("Result");
	var value = result.getValue("ResultCode");
	
	if( result.getValue("ResultCode")== COMERROR_NONE) { // 성공
		
		var index = Number(sms_postPosition.userAttr("index")); 
		var dsPositionList = app.lookup("PositionList");
		console.log(dsPositionList.getRowDataRanged()); 
		var positionInfo = dsPositionList.getRow(index); // 직급 등록 요청한 정보 가져오기
		
		var dmPosioninfo = app.lookup("Posioninfo");
		var positionID = dmPosioninfo.getValue("PositionID"); // 서버 전송을 위해 Request Data에서 Position ID 가져오기
		positionInfo.setValue("PositionID", positionID); // 등록 요청한 직급 정보에 직급 아이디 업데이트
		positionInfo.setState( cpr.data.tabledata.RowState.UNCHANGED);
		
		dsPositionList.commit();
		dataManager.insertPosition(positionInfo.getRowData());
				
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_PositionRegistSucceed"));
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_PositionRegistFailed"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
}

// 직급 등록 에러
function onSms_postPositionSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 직급 등록 타임아웃
function onSms_postPositionSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 직급 수정 성공
function onSms_putPositionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** @type cpr.protocols.Submission */
	var sms_putPosition = e.control;
	var result = app.lookup("Result");
	var value = result.getValue("ResultCode");
	
	if( result.getValue("ResultCode")== 0) { // 성공
		
		var index = Number(sms_putPosition.userAttr("index")); 
		var dsPositionList = app.lookup("PositionList"); 
		var positionInfo = dsPositionList.getRow(index); // 직급 등록 요청한 정보 가져오기
		
		dsPositionList.commit();
		dataManager.updatePosition(positionInfo.getRowData());
		
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_PositionUpdateSucceed"));
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_PositionUpdateFailed"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
}

// 직급 수정 에러
function onSms_putPositionSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 직급 수정 타임아웃
function onSms_putPositionSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 삭제 버튼 클릭
function onSTMGR_btnDeleteClick(/* cpr.events.CMouseEvent */ e){		
	var grdPositionList = app.lookup("STMGR_grdPositionList");
	var selectedRow = grdPositionList.getSelectedRow();
	
	if (selectedRow == null){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedItem"));
		return;
	}
	
	var index = selectedRow.getIndex();
	var dsPositionList = app.lookup("PositionList");
	var positionID = dsPositionList.getValue(index, "PositionID");
	console.log("positionID : ",positionID);
	if(positionID==""){
		dsPositionList.deleteRow(index);
		dsPositionList.commit(); 
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_PositionDeleteSucceed"));
		return;
	}
	var sms_delPosition = app.lookup("sms_delPosition");
	sms_delPosition.userAttr("index", String(index));
	sms_delPosition.action = "/v1/positions/" + positionID;
	
	sms_delPosition.send();	
}

// 직급 삭제 완료
function onSms_delPositionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** @type cpr.protocols.Submission */
	var sms_delPosition = e.control;
	
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){ // 로그인 상태
		var index = Number(sms_delPosition.userAttr("index")); 
		var dsPositionList = app.lookup("PositionList");
		var positionInfo = dsPositionList.getRow(index); // 직급 등록 요청한 정보 가져오기
		var positionID = positionInfo.getValue("PositionID");
		
		dsPositionList.deleteRow(index);
		dsPositionList.commit(); 
		dataManager.deletePosition(positionID);
		
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_PositionDeleteSucceed"));
		
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_PositionDeleteFailed"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

// 직급 삭제 에러
function onSms_delPositionSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 직급 삭제 타임아웃
function onSms_delPositionSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 도움말 
function onSTMGR_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {"Target":DLG_HELP,"ID": menu_id}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

