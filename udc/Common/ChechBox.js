/************************************************
 * ChechBox.js
 * Created at Nov 11, 2020 10:26:28 AM.
 *
 * @author EVN0025
 ************************************************/

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};



/*
 * Triggered when init event is fired from Shell.
 */
function onShl1Init(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl1 = e.control;
}


/*
 * Triggered when load event is fired from Shell.
 */
function onShl1Load(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl1 = e.control;
	var oShell = e.content;
	oShell.innerHTML = '<input id="checkBox" data-on=" " data-off=" " data-width="40" type="checkbox" data-onstyle="success" data-size="sm" checked data-toggle="toggle" data-style="ios">';
	$('#checkBox').bootstrapToggle()
}
