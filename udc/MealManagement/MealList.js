/************************************************
 * AccessHistory.js
 * Created at Sep 21, 2020 3:25:43 PM.
 *
 * @author EVN0025
 ************************************************/

var utils = cpr.core.Module.require("lib/Utils");

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};



/*
 * Triggered when property-change event is fired from Body.
 * 앱의 속성이 변경될 때 발생하는 이벤트 입니다.
 */
function onBodyPropertyChange(/* cpr.events.CPropertyChangeEvent */ e){
	var data = app.getAppProperty("MealStatistics");
	app.lookup("accessList").removeAllChildren();
	if (data ) { 
		var jsonData = [];
		data.forEachOfUnfilteredRows(function (row) {
			jsonData.push(row.getRowData())
		})
		jsonData.sort(function(a,b){ 
		 	return b.totalMealPrice - a.totalMealPrice;
		}).forEach(function(each){
			var mealTableRow = new udc.Common.TableRow("mealTableRow");
			mealTableRow.setAppProperties({
			leftData: utils.getMealType(each.mealType),
			middleData: utils.numberWithCommas(each.totalMeal) + (cpr.I18N.INSTANCE.currentLanguage === "ko" ? "회" : ""),
			rightData: utils.numberWithCommas(each.totalMealPrice) + (cpr.I18N.INSTANCE.currentLanguage === "ko" ? "원" : "")
			});
			app.lookup("accessList").addChild(mealTableRow, {
				height: "25px"
			});
		});
	}
	
}