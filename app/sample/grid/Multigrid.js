/************************************************
 * Multigrid.js
 * Created at 2018. 10. 15. 오후 3:39:34.
 *
 * @author osm86
 ************************************************/

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var bar = app.lookup("pro");
	bar.start();
	var getlist = app.lookup("getList");
	setTimeout(function() {
		getlist.send();
	}, 5000);
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
	console.log(getList.xhr.responseText);
	var bar = app.lookup("pro");
	bar.end();
	
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onGetListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var getList = e.control;
	var bar = app.lookup("pro");
	bar.end();
	
}
