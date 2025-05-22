/************************************************
 * groupmanager.js
 * Created at 2018. 10. 4. 오후 3:19:00.
 *
 * @author tomato
 ************************************************/
var common;


/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e){
	common = createComUtil(app);
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms1SubmitSuccess(e){
	var grd = app.lookup("grd1");
	grd.select({rowIndex:0});
	grd.redraw();
	
}


/*
 * "Save" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var result = common.validateGrid("grd1", "upd");
	if(result){
//		common.save(submissionId, successCallback, errorCallback, doneCallback)
	}
}


/*
 * "조회" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	common.send("sms1");
	
}
