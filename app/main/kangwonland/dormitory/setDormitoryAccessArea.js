/************************************************
 * setDormitoryAccessArea.js
 * Created at 2021. 1. 25. 오후 6:24:28.
 *
 * @author joymrk
 ************************************************/
var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");

var KWLDM_pageRowCount = 50;
/*
 * 1. 모든 출입구역과 기숙사 플레그 정보 조인해서 리스트로 가져오기
 * 2. 체크된 단말기 기숙사 출입구역으로 지정
 */

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	
	sendAccessAreaListRequest(); 
}

function sendAccessAreaListRequest() {
	comLib.showLoadMask("","출입구역 리스트","");
	
	//dormitoryType 무조건 0으로 줘서 타입을 지정해준다. 0 <- 전체 1 <- 기숙사 구역만
	var smsGetAccessAreas = app.lookup("sms_getAccessArea");
	smsGetAccessAreas.action = "/v1/kangwonland/dormitory/accessarea";
	smsGetAccessAreas.setParameters("AreaType", 0);
	smsGetAccessAreas.send();	
}

function onSms_getAccessAreaSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");

	if (resultCode == COMERROR_NONE) {
	} else {
		dialogAlert(app, "Waning", "출입구역"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
	app.lookup("KWLSDAA_grdAccessAreaList").redraw();
}

function onSms_getAccessAreaSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getAccessAreaSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onKWLSDAA_btnAddAccessAreaClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var kWLSDAA_btnAddAccessArea = e.control;
	// update 하고 체크한 그리드는 그자리에서  설정값 바꿔주도록 한다.
	var grdAccessAreaList = app.lookup("KWLSDAA_grdAccessAreaList");
	var indices = grdAccessAreaList.getCheckRowIndices();
	if (indices.length == 0) {
		dialogAlert(app, "Waning", "체크된 출입구역이 없습니다.");
		return;
	}
	
	comLib.showLoadMask("pro","기숙사 출입구역 설정","",indices.length);
	
	sendPutAccessArea();
}

function sendPutAccessArea() {
	var grdAccessAreaList = app.lookup("KWLSDAA_grdAccessAreaList");
	var indices = grdAccessAreaList.getCheckRowIndices();
	if (indices.length == 0) { // 없으면 진행 안함
		comLib.hideLoadMask();
		dataManager = getDataManager();
		return;
	}
	var updateAccessAreaRow = grdAccessAreaList.getRow(indices[0]);
	var msg = "출입구역 : "+ " : "+updateAccessAreaRow.getValue("Name");
	comLib.updateLoadMask(msg);
	
	// 실제 send 
	app.lookup("KwlAccessAreaInfo").clear();// 초기화
	app.lookup("KwlAccessAreaInfo").setValue("ID", updateAccessAreaRow.getValue("ID"));
	app.lookup("KwlAccessAreaInfo").setValue("AreaType", updateAccessAreaRow.getValue("AreaType"));
	
	var smsputAccessArea = app.lookup("sms_putAccessArea");
	smsputAccessArea.action = "/v1/kangwonland/dormitory/accessarea";
	smsputAccessArea.send();
	
}

function onSms_putAccessAreaSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	
	if (resultCode == COMERROR_NONE) {
		var grdAccessAreaList = app.lookup("KWLSDAA_grdAccessAreaList");
		var indices = grdAccessAreaList.getCheckRowIndices();
		var rowidx = indices[0];
		var rowData = grdAccessAreaList.getRow(rowidx);
		var aType = rowData.getValue("AreaType");
		if (aType == 0 ) { // 0 아니면 
			rowData.setValue("AreaType", 1);
		} else { // 1
			rowData.setValue("AreaType", 0);			
		}
		grdAccessAreaList.setCheckRowIndex(rowidx, false); // 체크 해제
		sendPutAccessArea();
	//	grdAccessAreaList.setRowState(rowidx, cpr.data.tabledata.RowState.UNCHANGED);
		/*
cpr.data.tabledata.RowState.EMPTIED : 삭제된 행을 커밋시 배열에서 제거하기 위한 임시 상태.
cpr.data.tabledata.RowState.UNCHANGED : 변경되지 않은 상태.
cpr.data.tabledata.RowState.INSERTED : 행이 신규로 추가된 상태.
cpr.data.tabledata.RowState.UPDATED : 행이 수정된 상태.
cpr.data.tabledata.RowState.DELETED : 행이 삭제된 상태.
cpr.data.tabledata.RowState.INSERTDELETED : 행이 추가되었다가 삭제된 상태
* */
	} else {
		comLib.hideLoadMask();
		dialogAlert(app, "Waning", "출입구역"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
	app.lookup("KWLSDAA_grdAccessAreaList").redraw();
}

	
function onSms_putAccessAreaSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_putAccessAreaSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * "종료" 버튼(KWLSDAA_btnClose)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onKWLSDAA_btnCloseClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var kWLSDAA_btnClose = e.control;
	app.close();
}
