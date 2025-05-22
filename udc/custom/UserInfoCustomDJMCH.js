/************************************************
 * UserInfoCustomDJMCH.js
 * Created at 2021. 7. 9. 오전 9:02:14.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
//var dateUtil = cpr.core.Module.require("lib/DateLib");
//var StrLib = cpr.core.Module.require("lib/StrLib");

exports.setDJMCHUserInfoEx = function(unqiueID2, syncFlag){
	var djmchUser = app.lookup("DjmchUser");
	djmchUser.setValue("UniqueID2", unqiueID2);
	console.log(syncFlag);
	djmchUser.setValue("SyncFlag", syncFlag);
}

exports.getDJMCHUserInfoEx = function(){
	return app.lookup("DjmchUser");
}
