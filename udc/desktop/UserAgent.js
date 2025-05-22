/************************************************
 * UserAgent.js
 * Created at 2018. 10. 2. 오후 4:51:39.
 *
 * @author tomato
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function() {
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	var LicenseLevel = dataManager.getSystemLicenseLevel();
	//console.log(LicenseLevel);
	if (LicenseLevel < LicensePREMIUM) {
		app.lookup("UserAgent_imgDashboard").enabled = false;
	} else {
		app.lookup("UserAgent_imgDashboard").enabled = true;
	}
	app.lookup("groud_bg").redraw();
		
	
	//이노뎁 버전의 경우 작업관리자 버튼과 서버 정보 버튼 삭제
	if(dataManager.getOemVersion() == OEM_INNODEP){
		app.lookup("UserAgent_optTaskManager").visible = false;
		app.lookup("UserAgent_imgDashboard").visible = false;
	}else if(dataManager.getOemVersion() == OEM_GS_BASIC){
		app.lookup("groud_bg").getLayout().setColumnVisible(1, false);
	}
	
}

// 계정 클릭
var account_embDashboard;
function onUserAgent_imgAccountClick( /* cpr.events.CMouseEvent */ e) {
	e.stopImmediatePropagation();
	var root = app.getRootAppInstance();
	var rootRect = root.getActualRect();
	var Left = rootRect.right-430

	if(account_embDashboard == undefined || account_embDashboard.disposed == true) {
		account_embDashboard = new cpr.controls.EmbeddedApp("emb_AccDashboard");

		cpr.core.App.load("app/main/dashboard/AccountDashBoard", function(app) {
			if(app){
				account_embDashboard.app = app;
			}
		});
		var buttonRect = root.lookup("menubar").getActualRect();

		account_embDashboard.style.css({//TO DO : 레이아웃 조정 필요
			top: buttonRect.top + buttonRect.height + "px",
			height: 470 + "px",
			//width: root.getContainer().getActualRect().width/5 + "px",
			width: "340px",
			right: "0px",
			position: "absolute"
		});
		root.floatControl(account_embDashboard);
	}  else if (account_embDashboard.disposed == false) {
		account_embDashboard.dispose();
	}

}

function logout(callback) {
	dialogConfirm(app.getRootAppInstance(), "로그아웃", "로그아웃 하겠습니까?", function(/*cpr.controls.Dialog*/dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				setTimeout(function() {
					callback();
				});
			} else {

			}
		});
	});
}

// 대스보드 클릭
// var embDashboard;
function onUserAgent_imgDashboardClick(/* cpr.events.CMouseEvent */ e){
	/* @type cpr.controls.Image */
	dataManager = getDataManager();
	var LicenseLevel = dataManager.getSystemLicenseLevel()
	if (LicenseLevel < LicensePREMIUM) {
	    dialogAlert(app, "권한 없음", "라이센스 권한이 부족 합니다.");
		return;
	}
	var userAgent_imgDashboard = e.control;
	e.stopImmediatePropagation();

	var root = app.getRootAppInstance();
	// var rootRect = root.getActualRect();
	
	var programManager = cpr.core.Module.require("lib/ProgramManager");
	var embDashboard = programManager.getEmbDashboard();
	
	if(embDashboard == undefined || embDashboard.disposed == true) {
		programManager.createEmbDashboard(root);
	} else if (embDashboard.disposed == false) {
		programManager.disposeEmbDashboard();
	}
/*
	if(root.lookup("emb_Dashboard")){
		root.lookup("emb_Dashboard").dispose();
	}else{
		if(root.lookup("emb_AccDashboard")){
			root.lookup("emb_AccDashboard").dispose();
		}
		var embDashboard = new cpr.controls.EmbeddedApp("emb_Dashboard");

		cpr.core.App.load("app/main/dashboard/DashBoard2", function(app) {
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
	*/
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_logoutSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var sms_logout = e.control;
	cpr.core.App.load("app/app", function(newapp) {
		var programManager = cpr.core.Module.require("lib/ProgramManager");
		programManager.dispose();
		var dataManager = cpr.core.Module.require("lib/DataManager");
		dataManager = getDataManager();
		dataManager.dispose();

		app.getRootAppInstance().close();
		newapp.createNewInstance().run();
	});
}

/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUserAgent_optTaskManagerClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Image
	 */
	var userAgent_optTaskManager = e.control;
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target":DLG_DOWNLOAD_MANAGER,
		}
	});

	app.getHostAppInstance().dispatchEvent(selectionEvent);
}


var animateTrigger = {
	getObj : function(){
		return app.lookup("UserAgent_optTaskManager");
	},
	start : function(){
		var optTaskManager = this.getObj();
		var classArr = optTaskManager.style.getClasses();
		if(classArr.indexOf("downloadManager-start")==-1){
			optTaskManager.style.removeClass("downloadManager-end");
			optTaskManager.style.addClass("downloadManager-start");
			optTaskManager.tooltip = "downloading..";
		}
	},
	end : function(){
		var optTaskManager = this.getObj();
		var classArr = optTaskManager.style.getClasses();
		if(classArr.indexOf("downloadManager-start")!=-1){
			optTaskManager.style.removeClass("downloadManager-start");
			optTaskManager.style.addClass("downloadManager-end");
			optTaskManager.tooltip = "Open Task Manager";
		}
	}
}


exports.animateStart = function(){
	animateTrigger["start"]();
}


exports.animateEnd = function(){
	animateTrigger["end"]();
}

