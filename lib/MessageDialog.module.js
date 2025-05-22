/************************************************
 * MessageDialog.module.js
 * Created at 2018. 11. 1. 오후 4:45:26.
 *
 * @author tomato
 ************************************************/
var programManager = null;
var dataManager = cpr.core.Module.require("lib/DataManager");
var usint_version;
var MessageUtil = function(/* cpr.core.AppInstance */app) {
	this._app = app;
	//dataManager = getDataManager();
	//programManager = cpr.core.Module.require("lib/ProgramManager");
	//usint_version = dataManager.getSystemVersion();
}

MessageUtil.prototype.usint_versionUpdate = function(version){
	usint_version = version;
}

var dataManager = cpr.core.Module.require("lib/DataManager");

globals.dialogConfirm = function(/*cpr.core.AppInstance*/app,title,message,callback){
	/*
	if(usint_version == null){
		dataManager = getDataManager();
		usint_version = dataManager.getSystemVersion();
	}
	*/ 
	var appld = "app/dialog/confirm" + "?" + usint_version;
	//alert(usint_version);
	//alert(appld);
	app.openDialog(appld, {width:250,height:200},function(/*cpr.controls.Dialog*/dialog){
		dialog.initValue = message;
		if(title){
			dialog.headerTitle = title;
		}
		if(callback){
			callback(dialog);
		}
		dialog.ready(function(){
			dialog.focus();
		});
	});
}


globals.dialogAlert = function(/*cpr.core.AppInstance*/app,title,message,callback){
	/*
	if(usint_version == null){
		dataManager = getDataManager();
		alert(dataManager.getSystemVersion());
		//usint_version = dataManager.getSystemVersion();
	}
	*/
	var appld = "app/dialog/alert" + "?" + usint_version;
	//alert(usint_version);
	//alert(appld);
	app.openDialog(appld, {width:360,height:200},function(/*cpr.controls.Dialog*/dialog){
		dialog.initValue = message;
		if(title){
			dialog.headerTitle = title;
		}
		if(callback){
			callback(dialog);
		}
		dialog.ready(function(){
			dialog.addEventListener("keyup", function(e){
				if(e.keyCode == 13){
					dialog.close();
				}
			});
			dialog.focus();
		});
	});
}


globals.dialogSelectAccessGroupAndGroup = function(/*cpr.core.AppInstance*/app,title,message,callback){

	if(usint_version == null){
		dataManager = getDataManager();
		usint_version = dataManager.getSystemVersion();
	}
	var appld = "app/dialog/selectAccessGroup" + "?" + usint_version;
	app.openDialog(appld, {width:350,height:200},function(/*cpr.controls.Dialog*/dialog){
		//dialog.initValue = message;
		if(title){
			dialog.headerTitle = title;
		}
		if(callback){
			callback(dialog);
		}
	});
}

globals.dialogUserSelectAccessGroupAndOnlySend = function(/*cpr.core.AppInstance*/app,title,message,callback){

	if(usint_version == null){
		dataManager = getDataManager();
		usint_version = dataManager.getSystemVersion();
	}
	var appld = "app/dialog/selectUserAccessGroup" + "?" + usint_version;
	app.openDialog(appld, {width:350,height:200},function(/*cpr.controls.Dialog*/dialog){
		//dialog.initValue = message;
		if(title){
			dialog.headerTitle = title;
		}
		if(callback){
			callback(dialog);
		}
	});
}

globals.createMessageDialogUtil = function(/* cpr.core.AppInstance */app) {
	return new MessageUtil(app);
}

//globals.networkError = function (/*cpr.core.AppInstance*/ app){
/*
	if (!app) {
		return;
	}
	var dialogProp = {
		headerVisible : false,
		left: 20,
		right: 20,
		height: 250,
		modal: true,
		resizable: false
	};
	if (app.isRootAppInstance()) {
		app.openDialog("app/mobile/dialog/NetworkError", dialogProp);	//app/mobile/dialog로 바꿔야함 - 두개
	} else {
		app.getRootAppInstance().openDialog("app/mobile/dialog/NetworkError", dialogProp);
	}
}
*/

globals.dialogAlertAMHQ = function(/*cpr.core.AppInstance*/app,title,message,callback){
	/*
	if(usint_version == null){
		dataManager = getDataManager();
		alert(dataManager.getSystemVersion());
		//usint_version = dataManager.getSystemVersion();
	}
	*/
	var appld = "app/dialog/alert" + "?" + usint_version;
	//alert(usint_version);
	//alert(appld);
	app.openDialog(appld, {width:360,height:200},function(/*cpr.controls.Dialog*/dialog){
		dialog.initValue = message;
		dialog.style.header.css("background-color", "#528443");
		if(title){
			dialog.headerTitle = title;
		}
		if(callback){
			callback(dialog);
		}
		dialog.ready(function(){
			dialog.addEventListener("keyup", function(e){
				if(e.keyCode == 13){
					dialog.close();
				}
			});
			dialog.focus();
		});
	});
}

globals.dialogConfirmAMHQ = function(/*cpr.core.AppInstance*/app,title,message,callback){
	/*
	if(usint_version == null){
		dataManager = getDataManager();
		usint_version = dataManager.getSystemVersion();
	}
	*/ 
	var appld = "app/dialog/confirm" + "?" + usint_version;
	//alert(usint_version);
	//alert(appld);
	app.openDialog(appld, {width:250,height:200},function(/*cpr.controls.Dialog*/dialog){
		dialog.initValue = message;
		dialog.style.header.css("background-color", "#528443");
		if(title){
			dialog.headerTitle = title;
		}
		if(callback){
			callback(dialog);
		}
		dialog.ready(function(){
			dialog.focus();
		}); 
	});
}
/**
 * 넓이 w, 높이 h 인자값을 추가해 사이즈를 변경할 수 있는  알럿창
 * ( 기본값  w:360 h:200 )  
 * */
globals.dialogAlertCustomSize = function(/*cpr.core.AppInstance*/app,title,message,callback,w,h){
	if (w == null || w == 0) {
		w = 360;
	}
	if (h == null || h == 0) {
		h = 200;
	}
	var appld = "app/dialog/alert" + "?" + usint_version;
	app.openDialog(appld, {width:w,height:h},function(/*cpr.controls.Dialog*/dialog){
		dialog.initValue = message;
		if(title){
			dialog.headerTitle = title;
		}
		if(callback){
			callback(dialog);
		}
		dialog.ready(function(){
			dialog.addEventListener("keyup", function(e){
				if(e.keyCode == 13){
					dialog.close();
				}
			});
			dialog.focus();
		});
	});
}

// 전광판 전용
globals.displayBoardDialogConfirm = function(/*cpr.core.AppInstance*/app,title,message,width,height,callback){
	var appld = "app/dialog/displayBoardConfirm" + "?" + usint_version;
	
	// 크기설정
	var w = width;
	var h = height;
	app.openDialog(appld, {width:w,height:h},function(/*cpr.controls.Dialog*/dialog){
		dialog.initValue = message;
		dialog.headerVisible = false;
		if(title){
			dialog.headerTitle = title;
		}
		if(callback){
			callback(dialog);
		}
	});
}

// VIC 커스텀 CCTV 연결테스트용
globals.dialogVICCCTVAlert = function(/*cpr.core.AppInstance*/app,title,message,callback){
	var appld = "app/dialog/alert" + "?" + usint_version;

	app.openDialog(appld, {width:500,height:300},function(/*cpr.controls.Dialog*/dialog){
		dialog.initValue = "VIC_"+message;
		if(title){
			dialog.headerTitle = title;
		}
		if(callback){
			callback(dialog);
		}
		dialog.ready(function(){
			dialog.addEventListener("keyup", function(e){
				if(e.keyCode == 13){
					dialog.close();
				}
			});
			dialog.focus();
		});
	});
}