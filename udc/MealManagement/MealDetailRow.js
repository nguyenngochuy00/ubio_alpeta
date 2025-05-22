/************************************************
 * MealDetailRow.js
 * Created at Nov 25, 2020 10:45:26 PM.
 *
 * @author Sam
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
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var mealData = app.getAppProperty("data");
	var totalMeal = 0;
	var totalPay = 0;
	
	mealData.data.forEach(function(each) {
		var mealRow = new udc.MealManagement.MealLogRow();
		mealRow.mealTime = each.DateTime;
		mealRow.mealPay = utils.numberWithCommas(each.Pay);
		mealRow.mealType = utils.getMealType(each.Type);
		mealRow.mealMenu = each.Menu;
		app.lookup("mealDetailRow").addChild(mealRow, {
			height: "50px"
		});
		totalMeal = totalMeal + 1;
		totalPay = totalPay + each.Pay;
	});
	var totalString = "총계 : " + utils.numberWithCommas(totalPay) + "원 / " + utils.numberWithCommas(totalMeal) + "회";
	app.lookup("total").value = totalString;
}
