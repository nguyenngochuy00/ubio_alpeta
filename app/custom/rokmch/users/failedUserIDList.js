/************************************************
 * failedUserIDList.js
 * Created at 2022. 12. 28. ���� 5:53:48.
 *
 * @author SW2Team
 ************************************************/


var dataManager = cpr.core.Module.require("lib/DataManager");



/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_ARMYHQ_PartiallySuccess"));
	var initValue = app.getHost().initValue;
	var failedUserList = app.lookup("dsFailedUserList");
	initValue.FailedUserList.copyToDataSet(failedUserList);
}



/*
 * 버튼(USIMP_btnClose)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSIMP_btnCloseClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var uSIMP_btnClose = e.control;
	app.close(1);
}
