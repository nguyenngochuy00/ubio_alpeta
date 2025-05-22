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

exports.resetData = function() {
	app.lookup("accessList").removeAllChildren();
}

exports.render = function(AuthLogList) {
	AuthLogList.forEachOfUnfilteredRows(function (row) {
		var historyRow = new udc.AccessHistory.AccessHistoryRow();
		historyRow.EventTime = row.getValue("EventTime") ? moment(row.getValue("EventTime"), "YYYY-MM-DD HH:mm:ss").format("HH:mm") : "";
		historyRow.Position = row.getValue("TerminalName")
		historyRow.Detail = utils.getAuthFunctionKey(row.getValue("Func"));
		historyRow.style.animateFrom({	
			"transform": "translateY(100%)",
			"opacity": "0"
		}, .5, cpr.animation.TimingFunction.EASE_IN_OUT_BACK);
		app.lookup("accessList").addChild(historyRow, {
			height: "25px"
		});
	});
}
