/************************************************
 * Window.js
 * Created at 2018. 10. 4. 오전 9:17:58.
 *
 * @author tomato
 ************************************************/
var programManager = cpr.core.Module.require("lib/ProgramManager");
var dragManager = cpr.core.Module.require("lib/DragManager");
var workDisplayBar = cpr.core.Module.require("lib/WorkDisplayBar");
var maximize = false; 
/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};



/*
 * "x" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	if(app.getAppProperty("backgroundRun")){
		programManager.hideProgram(app.getAppProperty("programId"));
	}else{
		programManager.kill(app.getAppProperty("programId"));
	}

}


/*
 * Body에서 property-change 이벤트 발생 시 호출.
 * 앱의 속성이 변경될 때 발생하는 이벤트 입니다.
 */
function onBodyPropertyChange(/* cpr.events.CPropertyChangeEvent */ e){
	if(e.property == "src"){
		cpr.core.App.load(e.newValue, function(loadedApp){
			app.lookup("embapp1").app = loadedApp;	
		});
		
	}
}


/*
 * 그룹에서 mousedown 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 누를 때 발생하는 이벤트.
 */
function onGroupMousedown(/* cpr.events.CMouseEvent */ e){
	dragManager.dragStart(app.getAppProperty("programId"), app.getHostAppInstance(),e);
	
}


/*
 * "-" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	programManager.hideProgram(app.getAppProperty("programId"));
	
}

/*
 * Body에서 mousedown 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 누를 때 발생하는 이벤트.
 */
function onBodyMousedown(/* cpr.events.CMouseEvent */ e){
	programManager.active(app.getAppProperty("programId"));
}


/*
 * "+" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick3(/* cpr.events.CMouseEvent */ e){
	if(!maximize){
		app.setAppProperty("top", app.getHost().style.css("top"));
		app.setAppProperty("left", app.getHost().style.css("left"));
		app.setAppProperty("width", app.getHost().style.css("width"));
		app.setAppProperty("height", app.getHost().style.css("height"));
		
		var rect = app.getHostAppInstance().getContainer().getActualRect();
		var barHeight = workDisplayBar.getWorkBar().getActualRect().height;
		app.getHost().style.removeStyle("width");
		app.getHost().style.removeStyle("height");
		app.getHost().style.css({
			left:0+"px",
			top:barHeight+"px",
			right:0+"px",
			bottom:0+"px"
		});
		maximize = true;
	}else{
		app.getHost().style.removeStyle("right");
		app.getHost().style.removeStyle("bottom");
		
		app.getHost().style.css({
			left:app.getAppProperty("left"),
			top:app.getAppProperty("top"),
			width:app.getAppProperty("width"),
			height:app.getAppProperty("height")			
		});
		maximize = false;
	}
	
}
