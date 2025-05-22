/************************************************
 * UserListInGroupRow.js
 * Created at Sep 22, 2020 9:53:41 AM.
 *
 * @author EVN0025
 ************************************************/

var config = getConfig();

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};



/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var smsGetPicture = app.lookup("smsGetPicture");
	smsGetPicture.setRequestActionUrl(config.apiHostResolution() + smsGetPicture.action.replace("{id}", app.getAppProperty("UserID")));
	smsGetPicture.send();
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsGetPictureBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetPicture = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsGetPictureReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetPicture = e.control;
	hideLoading();
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetPictureSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetPicture = e.control;
	handleUnauthorize(app);
	if (app.lookup("Result").getValue("ResultCode") === 0) {
		var image = app.lookup("PictureInfo");
		if (image) {
			app.lookup("userPicture").src = "data:image/" + image.getValue("ImageType") + ";base64," + image.getValue("Picture");
			app.lookup("userPicture").style.css({
				"border-radius": "25px"
			});
		}
	}
}
