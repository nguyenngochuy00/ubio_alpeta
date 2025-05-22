/************************************************
 * TerminalWorkResult.js
 * Created at 2021. 5. 25. 오전 9:26:02.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
		
	var initValue = app.getHost().initValue;
	var resultInfo = initValue["ResultInfo"];
	var dsResultInfo = app.lookup("ResultList");
	resultInfo.copyToDataSet(dsResultInfo);
	
	var success = 0,fail = 0;
	var total = dsResultInfo.getRowCount();
	for( var index = 0; index < total; index++ ){
		var result = dsResultInfo.getRow(index);
		var errorCode = result.getValue("ErrorCode");
		result.setValue("ErrorMsg", dataManager.getString(getErrorString(errorCode)));
		if( errorCode == 0){success++;}else{fail++;}
	}
	dsResultInfo.setSort("TargetID asc");
	dsResultInfo.commit();	
	
	app.lookup("TWR_opbTotal").value = total;
	app.lookup("TWR_opbSuccess").value = success;
	app.lookup("TWR_opbFail").value = fail;
}
