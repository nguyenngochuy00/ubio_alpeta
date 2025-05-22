/************************************************
 * TerminalRowComponent.js
 * Created at Sep 18, 2020 4:07:58 PM.
 *
 * @author EVN0025
 ************************************************/
var ID;
var isAutimating = false;
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
	app.lookup("terminalID").value = "(" + app.getAppProperty("ID") + ")";
}


///*
// * Triggered when click event is fired from Body.
// * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
// */
//function onBodyClick(/* cpr.events.CMouseEvent */ e){
//	if (isAutimating) {
//		e.preventDefault();
//		return;
//	}
//	isAutimating = true;
//	var terminal = app.getAllAppProperties();
//	cpr.core.App.load("pages/Admin/Terminal/Terminal", function(loadedApp){
//		var newAppInstance = loadedApp.createNewInstance();
//		newAppInstance.run(null, function(createdApp) {
//			createdApp.setAppProperties({
//				ID: terminal.ID,
//				TerminalName: terminal.Name
//			});
//			app.getRootAppInstance().close();
//			isAutimating = false;
//		});			
//	});
//}
