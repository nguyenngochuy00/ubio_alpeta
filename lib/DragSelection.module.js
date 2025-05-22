/************************************************
 * DragSelection.module.js
 * Created at 2018. 11. 15. 오전 11:36:34.
 *
 * @author tomato
 ************************************************/

var selection = [];
exports.clearSelection = function(){
	deselect();
}

exports.getSelection = function(){
	return selection;
}

exports.setSelection = function(ctrls){
	deselect();
	ctrls.forEach(function(/* cpr.controls.UIControl */each,idx){
		if(each.userAttr("selectable") == "true"){
			selection.push(each);
		}
	});
	
}

/**
 * 선택 해제 스타일
 */
function deselect(){
	selection = [];
}