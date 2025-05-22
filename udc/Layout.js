/************************************************
 * Layout.js
 * Created at Sep 10, 2020 2:27:24 PM.
 *
 * @author EVN0025
 ************************************************/

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};



/*
 * Triggered when init event is fired from Body.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(/* cpr.events.CEvent */ e){
	app.lookup("sms_getPosition").send();
}


/*
 * Triggered when submit-success event is fired from Submission.
 * 통신이 성공하면 발생합니다.
 */
function onSms_getPositionSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getPosition = e.control;
	if (app.lookup("Result").getValue("ResultCode") === 0) {
		var dataManager = getDataManager();
		dataManager.setPositionList(app.lookup("PositionList"));
	}
}
