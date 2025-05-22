/************************************************
 * ErrorHandler.module.js
 * Created at Oct 19, 2020 3:17:50 PM.
 *
 * @author EVN0025
 ************************************************/

var auth = cpr.core.Module.require("lib/Auth");

function handleUnauthorize(app, code) {
	
	if (code === 12) {
		console.log("@@@@@@@ handleUnauthorize : code "+code);
		auth.logout(app)
		return;
	}
	
	if (app.lookup("Result").getValue("ResultCode") === 12) {
		console.log("@@@@@@@ handleUnauthorize : result "+code);
		auth.logout(app)	
	}
}

globals.handleUnauthorize = handleUnauthorize;