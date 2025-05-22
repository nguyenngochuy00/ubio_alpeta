/************************************************
 * ProgramManager.module.js
 * Created at 2018. 10. 4. 오전 10:57:39.
 *
 * @author tomato
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");

var programs = [];
/**
 * @type cpr.core.AppInstance
 */
var appInstance = null;
globals.dialogWindow = true; // Dialog를 사용하지 여부. 기본값 true

/**
 * 프로그램이 실행되어 있는지 여부를 확인.
 * @param id
 */
function hasProcess( menuID, programID ){

	return  programs.some(function(/* Object */ each){
		return each.menuID == menuID && each.programID == programID;
	});
}

/**
 * 프로그램 객체 반환.
 */
exports.getPrograms = function(){
	return programs;
}

exports.getProcessCount = function(){
	return programs.length;
}
/**
 * 프로그램 객체 반환.
 * @param id
 */
exports.getProcess = function(menuID, programID){

	if(hasProcess(menuID, programID )==false){
		return null;
	}

	for(var idx = 0; idx < programs.length; idx++){
		if(programs[idx].menuID == menuID && programs[idx].programID == programID){
			return programs[idx];
			break;
		}
	}
}
/**
 * 실행된 프로그램 정보를 추가한다.
 * @param src 페이지의 경로
 * @param ctrl 컨트롤
 * @param val ID
 */
function addProcess( src, ctrlObject, menuID, programID){

	if(hasProcess(menuID, programID)){
		return;
	}

	if(	programs.length > 9 ) {
		return;
	}

	programs.push( {
		"menuID":menuID,
		"programID":programID,
		"ctrl":ctrlObject,
		"src":src
	} );

}
/**
 * 실행된 프로그램 정보를 제거한다.
 * @param id
 */
function removeProcess(menuID, programID){

	if(hasProcess(menuID, programID)==false){
		return;
	}
	var targetIndex = -1;
	for(var idx = 0; idx < programs.length; idx++){
		if(programs[idx].menuID == menuID && programs[idx].programID == programID){
			targetIndex = idx;
			break;
		}
	}
	programs.splice(targetIndex,1);

}

exports.isBackgroundProgram=function(id){
	if(dialogWindow){
		return  programs.some(function(/* Object */ each){
			return each.ctrl.userAttr("backgroundRun")=="true";

		});
	}else{
		return  programs.some(function(/* Object */ each){
			return each.ctrl.getAppProperty("backgroundRun");

		});
	}

}

/**
 * 프로그램을 실행한다.
 * @param app
 * @param iconInfo {name:string,src:srting}
 * @param pageSrc
 * @param val
 */
exports.runProgram = function( app, iconInfo, pageSrc, menuID, programID, initValue, width, height ){
	//console.log(app, iconInfo, pageSrc, menuID, programID, initValue, width, height);
	if(hasProcess(menuID,programID)){
		return false;
	}
	if(dialogWindow){
		runWithDialog( app, iconInfo.name, pageSrc, menuID, programID, false, initValue, width, height );
	}else{
		run(app,iconInfo.name,pageSrc,menuID,false);
	}

	addWorkItem(iconInfo, programID);
	return true;
}
/**
 * UDC 윈도우로 프로그램을 실행한다.
 * @param app
 * @param name
 * @param pageSrc
 * @param val
 * @param backgroundRun
 */
function run(/*cpr.core.AppInstance*/app,name,pageSrc,val,backgroundRun){

	var udCtrl = new udc.desktop.Window();
		udCtrl.src = pageSrc;
		udCtrl.title = name;
		udCtrl.programId = val;
		udCtrl.backgroundRun = backgroundRun?true:false;
		udCtrl.style.addClass("cl-window");
		udCtrl.style.css({
			width:"600px",
			height:"600px",
			position: "absolute",
			top:"100px",
			left:"400px"
		});
	app.floatControl(udCtrl);
	addProcess(pageSrc,udCtrl,val);
}


/**
 * Dialog로 프로그램 윈도우를 실행한다.
 * @param app
 * @param name
 * @param pageSrc
 * @param val
 * @param backgroundRun
 */
function runWithDialog(/*cpr.core.AppInstance*/app, name, pageSrc, menuID, programID, backgroundRun, initValue, width, height ){
	//left:400,top:100,width:600,height:600,modal:false
	//console.log(app, name, pageSrc, menuID, programID, backgroundRun, initValue, width, height);
	appInstance = app;
	var DialogLeft = "";
	var DialogTop = "";
	
	if(programID == 218103811){
		DialogLeft = AuthImageDialogLeft;
		DialogTop = AuthImageDialogTop;
	} else if (programID == DLG_MONITORING_DISPLAY_BOARD) {
		// 전광판 메뉴 전체화면
		DialogLeft = AuthDisplayBoardLeft;
		DialogTop = AuthDisplayBoardTop;
	} else {
		DialogLeft = 200;
		DialogTop = 50;
	}
	app.openDialog(pageSrc,{left:DialogLeft,top:DialogTop,width:width,height:height,modal:false},function(dialog){
		dialog.bind("headerTitle").toLanguage(name);
		if (programID == DLG_MONITORING_DISPLAY_BOARD) {
			var dataManager = getDataManager();
			var accountInfo = dataManager.getAccountInfo();
			if (Number(accountInfo.getValue("Privilege")) == DLG_DISPLAYBOARD_MANAGEMENT) { // 전광판 관리자 예외
				dialog.headerMax = false;
				dialog.headerMin = false;
				dialog.headerVisible = false;
				dialog.headerMovable = false;
				dialog.resizable = false;
			} else {
				dialog.headerMax = true;
				dialog.headerMin = true;
			}
		} else {
			dialog.headerMax = true;
			dialog.headerMin = true;
		}
		dialog.userAttr("programId",programID);
		dialog.userAttr("backgroundRun", backgroundRun?"true":"false");
		dialog.initValue = initValue;
		dialog.addEventListener("maximize", function(e){
			/* @type cpr.controls.UIControl	 */
			var ctrl = e.control;
			ctrl.style.css("top", "40px");
		});
		dialog.addEventListenerOnce("close",function(e){

			var programManager = cpr.core.Module.require("lib/ProgramManager");
			if(dialog.userAttr("backgroundRun")=="true"){
				dialog.visible = false;
				e.preventDefault();
			}else{
				programManager.kill(e.targetControl.userAttr("programId"));
			}
		});
		//20190827 정래훈 팝업창 포커스시 상단 메뉴바에 나타나는 메뉴 아이콘 빨간줄 표기를 위해 작성
		dialog.addEventListener("mousedown",function(e){
			exports.showProgram(e.control.userAttr("programId"));
		});
		dialog.addEventListener("load",function(e){
			exports.showProgram(e.control.userAttr("programId"));
		});
		dialog.addEventListener("before-unload",function(e){
			exports.showProgram(e.control.userAttr("programId"),"dialog-before-unload");
		});
		//console.log(dialog)
		addProcess(pageSrc,dialog,menuID,programID);
	});
}

/**
 * 백그라운드 실행한다. 백그라운드 작업표시줄에 아이콘이 표시됨.
 * @param app
 * @param iconInfo
 * @param pageSrc
 * @param val
 */
exports.backgroundRun = function(/*cpr.core.AppInstance*/app,iconInfo,pageSrc,menuID,programID){
	if(hasProcess(menuID)){
		return false;
	}
	if(dialogWindow){
		runWithDialog(app, iconInfo.name, pageSrc, menuID, programID, true);
	}else{
		run(app,iconInfo.name,pageSrc,menuID,true);
	}


	addBGWorkItem(iconInfo, menuID);
	return true;
}

/**
 * 프로그램(윈도우)을 숨긴다.
 * @param id
 */
exports.hideProgram = function(menuID){
	var program = null;
	var hasProgram = programs.some(function(/* Object */ each){
		program = each;
		return each.menuID == menuID;
	});
	if(!hasProgram){
		return;
	}
	if(program.ctrl instanceof cpr.controls.Dialog){
		program.ctrl.visible = true;
	}else{
		program.ctrl.style.css("display","none");
	}
}

/**
 * 프로그램(윈도우)을 보여준다.
 * @param id
 */
exports.showProgram = function(programID,mode){
	
	//20190827 정래훈 팝업창 포커스시 상단 메뉴바에 나타나는 메뉴 아이콘 빨간줄 표기를 위해 if문 작성
	var dialog_mode = mode;
	if(mode != "dialog-before-unload"){
		var program = null;
		var hasProgram = programs.some(function(/* Object */ each){
			program = each;
			return each.programID == programID;
		});
	
		if(!hasProgram){
			return;
		}
	}else{
		if(programs[1] != null){
			if(programID == programs[programs.length-1].programID){
				var program = programs[programs.length-2];
				programID = programs[programs.length-2].programID;
			}else{
				var program = programs[programs.length-1];
				programID = programs[programs.length-1].programID;	
			}
		}else{
			return;
		}
	}
	
	if(program.ctrl instanceof cpr.controls.Dialog){
		program.ctrl.visible = true;
		appInstance.bringFloatingControlToTop(program.ctrl);
		activeWorkItem(programID);
	}else{
		program.ctrl.style.removeStyle("display");
	}
	

}


/**
 * 윈도우를 닫는다.
 * @param id
 */
exports.kill = function( programID ){

	var program = null;
	var index = -1;
	var hasProgram = programs.some(function(/* Object */ each,idx){
		program = each;
		index = idx;

		return each.programID == programID;
	});

	if(!hasProgram){
		return;
	}

	programs.splice(index,1);
	if((program.ctrl instanceof cpr.controls.Dialog) == false){
		program.ctrl.dispose();
	}

	program = null;
//	var workDisplayBar = cpr.core.Module.require("lib/WorkDisplayBar");
	removeWorkItem(programID);

}
/**
 * 실행되고 있는 윈도우를 가져온다.
 * @param id
 */
exports.getProgramWindow = function(menuID){
	var program = null;
	var hasProgram = programs.some(function(/* Object */ each){
		program = each;
		return each.menuID == menuID;
	});
	if(!hasProgram){
		return;
	}
	return program.ctrl;
}

exports.dispose = function(){
	programs.forEach(function(/* Object */ each){
		each.ctrl.dispose();
	});
	programs = [];

	workBar = null;
	bgBar = null;
}

////////////////////////////////////
/**
 * @type cpr.controls.Container
 */
var workBar = null;
var bgBar = null;

exports.init = function(bar1,bar2){
	workBar = bar1;
	bgBar = bar2;
}

function addWorkItem(iconInfo, programID){
	workBar.addChild(createWorkItem(iconInfo,programID));
	update(workBar,{colsize:"60px"});
}

function removeWorkItem(programID){
	if(removeItem(workBar, programID)){
		update(workBar,{colsize:"60px"});
	}
}

function addBGWorkItem(iconInfo,programID){
	bgBar.addChild(createBGWorkItem(iconInfo,programID));
	update(bgBar,{colsize:"20px"});
}

function removeBGWorkItem(programID){
	if(removeItem(bgBar,programID)){
		update(bgBar,{colsize:"20px"});
	}
}

function removeItem(/*cpr.controls.Container*/bar,programID){
	var ctrls = bar.getChildren();
	var ctrl = null
	ctrls.some(function(/* cpr.controls.UIControl */ each){
		if(each.userAttr("programId") == programID){
			ctrl = each;
			return true;
		}
		return false;
	});
	if(ctrl){
		bar.removeChild(ctrl, true);
		return true;
	}
}

/**
 *
 * @param iconInfo {name:string, src:string}
 * @param id
 */
function createWorkItem(iconInfo,programID){
	//box-shadow: inset 0 0.15rem 0 #ff704d;
	var button_2 = new cpr.controls.Button("active_"+programID);
	button_2.style.css("background-image","url("+iconInfo.src+")");
	button_2.style.addClass("cl-workitem");
	button_2.userAttr("programId",programID);
	var tooltipStr = getDataManager().getString(iconInfo.name);
	button_2.tooltip = tooltipStr;
	button_2.addEventListener("click", function(e){
		exports.showProgram(e.control.userAttr("programId"));
	});
	return button_2;
}


function activeWorkItem(programID){
	var workItemID = programID;
	if(workItemID.indexOf("active_")==-1){
		workItemID = "active_" + programID;
	}
	var workItemButton = appInstance.lookup(workItemID);
	
	var workChildren = workBar.getChildren();
	//console.log("workItemButton");
	//console.log(workItemButton);
	workChildren.forEach(function(each){
		//console.log("each "+each);
		//console.log(each);
		if(each.id == workItemButton.id){
			if(!workItemButton.style.getCSS("box-shadow")){
				workItemButton.style.css("box-shadow", "inset 0 0.15rem 0 red");
			}
		}else{
			if(each.style.getCSS("box-shadow")){
				each.style.removeStyle("box-shadow");
			}
		}
	});
}


/**
 * 백그라운드에서 실행되는 아이템을 생성합니다.
 * @param iconInfo {name:string,src:string}
 * @param id 프로그램의 value 값
 */
function createBGWorkItem(iconInfo,programID){
	var button_2 = new cpr.controls.Button();

	button_2.style.css("background-image","url("+iconInfo.src+")");
	button_2.style.addClass("cl-work-bgitem");
	button_2.tooltip = iconInfo.name;
	button_2.userAttr("programId",programID);
	button_2.addEventListener("click", function(e){
		exports.showProgram(e.control.userAttr("programId"));
	});
	return button_2;
}
/**
 *
 * @param bar
 * @param option
 */
function update(/*cpr.controls.Container*/bar,option){
	var ctrls = bar.getChildren();

	var columns = [];
	ctrls.forEach(function(each){
		columns.push(option.colsize);
	});
	var formLayout_1 = new cpr.controls.layouts.FormLayout();
	formLayout_1.setColumns(columns);
	formLayout_1.setRows(["1fr"]);
	formLayout_1.horizontalSpacing = 1;
	bar.setLayout(formLayout_1);
	ctrls.forEach(function(each,idx){
		bar.updateConstraint(each,{
				"colIndex":idx,
				"rowIndex":0
		});
	});

}

exports.getWorkBar = function(){
	return workBar;
}

exports.getBackgroundBar = function(){
	return bgBar;
}

// 대시 보드  창
var embDashboard = null;
exports.getEmbDashboard = function() {
	return embDashboard;
}

exports.createEmbDashboard = function(root) {
	embDashboard = new cpr.controls.EmbeddedApp("emb_Dashboard");

	cpr.core.App.load("app/main/dashboard/DashBoard5", function(app) {
		if(app){
			embDashboard.app = app;
		}
	});
	var buttonRect = root.lookup("menubar").getActualRect();

	embDashboard.style.css({
		top: buttonRect.top + buttonRect.height + "px",
		height: root.getContainer().getActualRect().height - 40 + "px",
		//width: root.getContainer().getActualRect().width/5 + "px",
		width: "680px",
		right: "0px",
		position: "absolute"
	});
	root.floatControl(embDashboard);
}

exports.disposeEmbDashboard = function() {
	embDashboard.dispose();
}


