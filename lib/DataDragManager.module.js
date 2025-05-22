/************************************************
 * DataDragManager.module.js
 * Created at 2018. 10. 26. 오후 2:50:28.
 *
 * @author tomato
 ************************************************/


var appInstance = null;
var pointer = {
	x: 0,
	y: 0
};
var dragCtrl = null;
var dropHandler = null;
var floatedCtrl = false;
var ctrlRect = null;
var listeners = {mousemove:null,mouseup:null};

exports.dataTransfer = null;

exports.dragStart = function(ctrl, /*cpr.core.AppInstance*/ app, /*cpr.events.CMouseEvent*/ event) {
	dragCtrl = ctrl;
	appInstance = app;
	listeners.mousemove = dragMove.bind(this);
	listeners.mouseup = dragEnd.bind(this);
	app.getRootAppInstance().getContainer().addEventListener("mousemove", listeners.mousemove);
	app.getRootAppInstance().getContainer().addEventListenerOnce("mouseup", listeners.mouseup);
	
	var appRect = app.getActualRect();
	pointer.x = appRect.left;
	pointer.y = appRect.top;	
}

function dragMove(e) {

	if (e.buttons != 1) {
		dispose();
		return;
	}
	var deltaX = e.clientX - pointer.x;
	var deltaY = e.clientY - pointer.y + 20;
		
	var buffer = 20;	
	dragCtrl.style.css({
		"left": deltaX + "px",
		"top": deltaY + "px"
	});
		
	if(!floatedCtrl){
		appInstance.floatControl(dragCtrl);
		floatedCtrl =true;	
	}
}

function dragEnd(e) {
	dispose();
}

function dispose() {
	if (appInstance) {
		appInstance.getRootAppInstance().getContainer().removeEventListener("mousemove",listeners.mousemove);
		appInstance.getRootAppInstance().getContainer().removeEventListener("mouseup",listeners.mouseup);
		listeners.mousemove = null;
		listeners.mosueup = null;
	}
	if(dragCtrl){
		dragCtrl.dispose();
	}
	dragCtrl = null;
	appInstance = null;
	dropHandler = null;
	floatedCtrl = false;
	exports.dataTransfer = null;
	ctrlRect = null;

}

function extractCtrlRect(ctrl,/*cpr.core.AppInstance*/app){
	if(!app){
		return null;
	}
	var layout = app.getContainer().getLayout();
	var constraint = app.getContainer().getConstraint(ctrl);
	if(!constraint){
		return null;
	}
	var left = 0;
	var top = 0;
	if(layout instanceof cpr.controls.layouts.ResponsiveXYLayout){
		var findConstraint = null;
		constraint.positions.some(function(each){
			if(each.media ==app.targetMedia){
				findConstraint = each;
				return true;
			}
			return false;
		});
		if(findConstraint!= null){
			left = parseInt(findConstraint.left);
			top = parseInt(findConstraint.top);
		}
	}else if(layout instanceof cpr.controls.layouts.XYLayout){
		left = parseInt(constraint.left);
		top = parseInt(constraint.top);
	}

	return {x:left,y:top};
	
}