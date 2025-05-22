/************************************************
 * aMealManagement.js
 * Created at 2018. 11. 14. 오후 1:01:36.
 *
 * @author joymrk
 ************************************************/

var rowCount = 0;
var dataManager = cpr.core.Module.require("lib/DataManager");
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	var sms_get_MealTime = app.lookup("sms_get_MealTime");
	sms_get_MealTime.send();
}

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms_get_MealTimeSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_get_MealTime = e.control;
	var mealTime = app.lookup("MealData");
	var IDPool = app.lookup("IDPool");
	
	app.lookup("grd1").selectRows(0);;
	rowCount = mealTime.getRowCount();

	for (var i = 0 ; i < rowCount + 1; i++) {
		var tmp = IDPool.findFirstRow("Code == '" + String(i + 1) + "'");
		if (tmp != null) {
			tmp.setValue("Code",  String(i + 1));
			tmp.setValue("Use", 1);
		}
	}

}

/*
 * "추가" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;

	app.lookup("grd1").insertRow(rowCount, true);
	var code = app.lookup("IDPool").findFirstRow("Use == 0");
	if (code == null) {
		app.lookup("MealData").getRow(rowCount).setValue("Code", String(rowCount + 1));
		code.setValue("Use", 1);
	}
	else {
		app.lookup("MealData").getRow(rowCount).setValue("Code", code.getValue("Code"));
		code.setValue("Use", 1);
	}
		
	app.lookup("MealData").getRow(rowCount).setValue("Type", 0);
	app.lookup("grd1").selectRows(rowCount);
	rowCount++;
}


/*
 * "저장" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick3(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	app.lookup("sms_set_MealTime").send();
}


/*
 * "삭제" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
		var grid = app.lookup("grd1");
	var check_index = grid.getCheckRowIndices();
	var sms_del_mealTime = app.lookup("sms_del_MealTime");
	//var del_code = app.lookup("Code");
	var mealTime = app.lookup("MealData");
	var del_code = "";
	if (check_index != null) {
		check_index.forEach(function(/* Number */ each){
			app.lookup("MealData").deleteRow(each);
			del_code = app.lookup("MealData").getRow(each).getValue("Code");
			app.lookup("IDPool").setValue(each, "Use", 0);
			rowCount--;
			
		});
	} else {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_NoSelectedItem"));
	}
	
	sms_del_mealTime.action = "/v1/meal/code/" + del_code;
	sms_del_mealTime.send();
			
	grid.showDeletedRow = false;
	grid.selectRows(rowCount);
	grid.redraw();
	
}



