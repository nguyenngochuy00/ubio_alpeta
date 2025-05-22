/************************************************
 * Auth.module.js
 * Created at Aug 25, 2020 10:39:09 AM.
 *
 * @author Sam
 ************************************************/

exports.id = "Auth.module.js";

exports.isAdmin = function () {
	var accountInfo = localStorage.getItem("accountInfo");
	return parseInt(JSON.parse(accountInfo).Privilege, 10) === 1;  
}

exports.isUser = function () {
	var accountInfo = localStorage.getItem("accountInfo");
	return parseInt(JSON.parse(accountInfo).Privilege, 10) === 2;
}

exports.isAuthenticated = function(app) {
	var accountInfo = localStorage.getItem("accountInfo");
	if (!accountInfo) {
		cpr.core.App.load("app/mobile/login/Login", function(newapp) {
			app.close();
			newapp.createNewInstance().run();				
		});
	}
	
}

exports.logout = function(app) {
	localStorage.removeItem("accountInfo");
	
	if (app && app.isEmbeddedAppInstance()) {
		
		cpr.core.App.load("app/mobile/login/Login", function(newapp) {
			newapp.createNewInstance().run(null, function(createdApp) {
				createdApp.getContainer().style.animateFrom({	
					"transform": "translateX(-100%)",
					"opacity": "0"
				}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
				app.getRootAppInstance().close();
			});				
		});
		return;
	}
	
	if (app) {
		cpr.core.App.load("login/Login", function(newapp) {
			newapp.createNewInstance().run(null, function(createdApp) {
				createdApp.getContainer().style.animateFrom({	
					"transform": "translateX(-100%)",
					"opacity": "0"
				}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
				app.close();
			});				
		});
	}
}

exports.getAuthenticatedUser = function() {
	return JSON.parse(localStorage.getItem("accountInfo"))
}