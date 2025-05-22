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
/**
 * @type cpr.controls.Output
 */
var dragCtrl = null;
var dropHandler = null;
var listeners = {mousemove:null,mouseup:null};
var isMoving = false;

exports.dataTransfer = null;

exports.dragStart = function(ctrl, app, /*cpr.events.CMouseEvent*/ event) {
	dragCtrl = ctrl;
	appInstance = app;
	var appRect = app.getActualRect();
	pointer.x = appRect.x;
	pointer.y = appRect.y;
	listeners.mousemove = dragMove.bind(this);
	app.addEventListener("mousemove", listeners.mousemove);
}


function dragMove(e) {
	if(isMoving==false){
		if(Math.abs(pointer.x-e.clientX) > 60|| Math.abs(pointer.y-e.clientY)>60){
			isMoving = true;
			if(!appInstance){
				dispose();
				return;
			}
			listeners.mouseup = dragEnd.bind(this);//아이콘이 움직였을때 드롭이벤트를 바인딩
			appInstance.addEventListenerOnce("mouseup",listeners.mouseup);
		}
		return;
	}
	if (e.buttons != 1) {
		dispose();
		return;
	}
	var deltaX = e.clientX - pointer.x;
	var deltaY = e.clientY - pointer.y;
	var ctrlRect = dragCtrl.getActualRect();
	dragCtrl.style.css({
		"pointer-events":"none"
	});
	var left = deltaX - ctrlRect.width/2;
	var top = deltaY - ctrlRect.height/2;
	appInstance.updateConstraint(dragCtrl, {left:left+"px",top:top+"px"});
}

function dragEnd(e) {
	dispose();
}

function dispose() {
	isMoving = false;
	if (appInstance) {
		appInstance.removeEventListener("mousemove",listeners.mousemove);
		appInstance.removeEventListener("mouseup",listeners.mouseup);
		listeners.mousemove = null;
		listeners.mosueup = null;
	}
	if(dragCtrl){
		if(dragCtrl.disposed==false){
			dragCtrl.style.removeStyle("pointer-events");
			dragCtrl = null;
		}
	}
	appInstance = null;
	dropHandler = null;
	exports.dataTransfer = null;

}
