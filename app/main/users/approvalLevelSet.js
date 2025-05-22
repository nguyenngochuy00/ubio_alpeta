/************************************************
 * approvalLevelSet.js
 * Created at 2020. 12. 14. 오전 10:24:49.
 *
 * @author fois
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	var initValue = app.getHost().initValue;
	
	var initInfo = initValue["approverInfo"];
	var approverInfo = app.lookup("ApproverInfo");
	var minValue = initInfo.getValue("MinApproveLevel");	
	if( minValue == null ||minValue == ""){ minValue = 1;}
	
	var maxValue = initInfo.getValue("MaxApproveLevel");
	if( maxValue == null ||maxValue == ""){ maxValue = 1;}
	
	approverInfo.setValue("MinApproveLevel",minValue);
	approverInfo.setValue("MaxApproveLevel",maxValue);
	
	app.lookup("nbe1").redraw();
	app.lookup("nbe2").redraw();
	
}

// 적용 버튼 클릭
function onALS_btnApplyClick(/* cpr.events.CMouseEvent */ e){
	var approverInfo = app.lookup("ApproverInfo");
	var minValue = approverInfo.getValue("MinApproveLevel");	
	var maxValue = approverInfo.getValue("MaxApproveLevel");
	
	if( maxValue < minValue && maxValue != 0 ){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnApproveMinOverMax"));
		return;
	}
	
	app.close(approverInfo);
}

// 취소 버튼 클릭
function onALS_btnCancelClick(/* cpr.events.CMouseEvent */ e){
	app.close();
}
