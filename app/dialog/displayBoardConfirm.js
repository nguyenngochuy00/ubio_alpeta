/************************************************
 * displayBoardConfirm.clx
 * Created at 2024. 01. 16. 오후 4:45:26.
 *
 * @author 960405
 ************************************************/

/*
 * 로그아웃 - 취소
 */
function onButtonClick( /* cpr.events.CMouseEvent */ e) {
	app.getHost().returnValue = false;
	app.close();
}

/*
 * 로그아웃 - 확인
 */
function onButtonClick2( /* cpr.events.CMouseEvent */ e) {
	app.getHost().returnValue = true;
	app.close();
}

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad( /* cpr.events.CEvent */ e) {
	var initValue = app.getHost().initValue;
	
	var dm_fontSize = app.lookup('fontSize');
	var fontSize1 = Math.floor(screen.width / 110) + "px"; // 내용 ( 로그아웃 하시겠습니까? )
	var fontSize2 = Math.floor(screen.width / 110) + "px"; // 버튼 ( 확인 / 취소) 
	var fontSize3 = Math.floor(screen.width / 130) + "px"; // 제목 ( 로그아웃 )
	
	dm_fontSize.setValue("font1", fontSize1);
	dm_fontSize.setValue("font2", fontSize2);
	dm_fontSize.setValue("font3", fontSize3);
	dm_fontSize.setValue("messageData", initValue.toString());
	
	app.lookup('DBC_group').redraw();
}