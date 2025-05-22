/************************************************
 * DragManager.module.js
 * Created at 2018. 10. 4. 오후 1:08:41.
 *
 * @author tomato
 ************************************************/


var isMouseDown = false;
var programId = null;
var appInstance = null;
var pointer = {x:0,y:0};

exports.dragStart = function(id,app,e){
	isMouseDown = true;
	programId = id; 
	appInstance = app;
	app.getContainer().addEventListener("mousemove",dragMove.bind(this));
	app.getContainer().addEventListenerOnce("mouseup",dragEnd.bind(this));
	pointer.x = e.clientX;
	pointer.y = e.clientY;

	
}

function dragMove(e){
	if(!isMouseDown){
		return;
	}
	var deltaX = e.clientX - pointer.x;
	var deltaY = e.clientY - pointer.y;
	pointer.x = e.clientX;
	pointer.y = e.clientY;
	var programManager = cpr.core.Module.require("lib/ProgramManager");	
	var ctrl = programManager.getProgramWindow(programId);
	var appRect = appInstance.getContainer().getActualRect();
	
	var left = parseInt(ctrl.style.css("left"))+deltaX;
	var top = parseInt(ctrl.style.css("top"))+deltaY;

	ctrl.style.css({
		"left":left + "px",
		"top": top + "px"
	})
		
}


function dragEnd(e){
	isMouseDown = false;
	programId = null;
	if(appInstance){
		appInstance.getContainer().removeEventListener(dragMove);
	}
	appInstance = null;
	
}