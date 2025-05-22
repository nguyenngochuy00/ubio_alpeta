/************************************************
 * tnaEditWorkResult.js
 * Created at 2021. 4. 27. 오후 4:59:47.
 *
 * @author hjh
 ************************************************/

var util = cpr.core.Module.require("lib/util");
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad( /* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	app.lookup("cmb_groupCode").value = "01";
}

/*
 * 버튼(TNAEWR_btnCancel)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTNAEWR_btnCancelClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	app.close(false);
}

/*
 * 버튼(TNAEWR_btnTnaEdit)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTNAEWR_btnTnaEditClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var tNAEWR_btnTnaEdit = e.control;
	var groupCodeValue = app.lookup("cmb_groupCode").value;
	var groupLabel;
	switch (groupCodeValue) {
		case "01":
			groupLabel = "아산";
			break;
		case "02":
			groupLabel = "울산";
			break;
		case "03":
			groupLabel = "문산";
			break;
		default:
			groupLabel = "";
			break;
	}
	
	app.getRootAppInstance().openDialog("app/visit/userSearch", {
		width: 600,
		height: 400
	}, function(dialog) {
		dialog.headerVisible = false;
		dialog.resizable = false;
		dialog.initValue = {
			"groupCode": groupCodeValue,
			"factoryName": groupLabel
		};
		dialog.addEventListenerOnce("close", function(e) {
			var result = dialog.returnValue;
			if (result) {
				app.close(result);
			} else {
				app.close(false);
			}
		})
	});
}