/************************************************
 * prepayUploadInfo.js
 * Created at 2020. 8. 18. 오후 3:17:16.
 *
 * @author joymrk
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();	
	comLib = createComUtil(app);
	
	var initValue = app.getHost().initValue;
	var initPrepayUploadInfo = initValue["prepayUploadInfo"];
	if (initPrepayUploadInfo) {
		app.lookup("prepayUploadInfo").build(initPrepayUploadInfo);
		console.log(app.lookup("prepayUploadInfo").getDatas());
	}
	app.lookup("SSHPUI_grpMain").redraw();
}
//수정 결과를 서버로그 저장하도록 보낼지 정의 해야함 시간된다면 추가.

/*
 * "수정" 버튼(SSHPUI_btnModify)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onSSHPUI_btnModifyClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var sSHPUI_btnModify = e.control;
	//확인창 필요
	
	
	dialogConfirm(app.getRootAppInstance(), "", "수정 하시겠습니까?", function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue) {
					app.close(app.lookup("prepayUploadInfo"));
				} else {}
			});
		});
}

function onSSHPUI_btnCancelClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var sSHPUI_btnCancel = e.control;
	app.close();
}
