/************************************************
 * The5thDayNoDrivingSystemViolationStatics.js
 * Created at 2022. 12. 21. ���� 4:33:19.
 *
 * @author mjy
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dsGroup;
var comLib;


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	dsGroup = dataManager.getGroup();
	comLib =  createComUtil(app);

	//출입기록 조회에선 30일만 조회가 가능하므로 따로 날짜 설정가능하도록 해야할 듯	
	var dtStart = app.lookup("ALMGR_dtStart");
	var dtEnd = app.lookup("ALMGR_dtEnd");
	
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	dtEnd.value = now.format('YYYY-MM-DD');
	dtStart.value = now.format('YYYY-MM-DD');
	getAuthLogListSend();
}

/*
 * 버튼(AMACI_btnPersonnelListSearch)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAMACI_btnPersonnelListSearchClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * 
	 * @type cpr.controls.Button
	 */
	var aMACI_btnPersonnelListSearch = e.control;
	
	getAuthLogListSend();
}

function onSubmitError( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getAuthLogListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getAuthLogList = e.control;
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	var dsAuthLogList = app.lookup("AuthLogList");
	var dsStatics = app.lookup("Statics");
	
	if (resultCode == COMERROR_NONE) {
		dsStatics.clear();
		
		for(var i=0; i<dsGroup.getRowCount(); i++) {
			var groupCode = dsGroup.getRow(i).getValue("GroupID");
			var condition = "GroupCode == " + groupCode + "and AuthResult == " + AuthLogResultLprFivePartTimeSystemFail; // 5부제 위반 : 124
			var rowData = {
				"group" : dsGroup.getRow(i).getValue("Name"),
				"count"	: dsAuthLogList.getConditionalRowCount(condition) 
			}
			
			dsStatics.pushRowData(rowData);
		}
	}
}


function getAuthLogListSend() {
	comLib.showLoadMask("", "작업 진행 중", "");
	var dtStart = app.lookup("ALMGR_dtStart");
	var dtEnd = app.lookup("ALMGR_dtEnd");
	var smsGetAuthLogList = app.lookup("sms_getAuthLogList");
		
	smsGetAuthLogList.setParameters("startTime", dtStart.value + " 00:00:00");
	smsGetAuthLogList.setParameters("endTime", dtEnd.value + " 23:59:59");	
	smsGetAuthLogList.setParameters("offset", 0);
	smsGetAuthLogList.setParameters("limit", 99999999);
	smsGetAuthLogList.send();
}


