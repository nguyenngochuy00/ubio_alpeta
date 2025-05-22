/************************************************
 * usermanager.js
 * Created at 2018. 10. 4. 오전 10:02:43.
 *
 * @author tomato
 ************************************************/



/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e){
	app.lookup("sms1").send();
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms1SubmitSuccess(e){
	var grd = app.lookup("grd1");
	grd.redraw();
	app.lookup("total").value = "Total: "+grd.getRowCount(); 
	
}
