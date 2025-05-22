/************************************************
 * UserInfoCustomElca.js
 * Created at 2021. 11. 2. 오후 1:21:53.
 *
 * @author zxc
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");

exports.setUserTypeElca = function(type){
	var userTypeInfo = app.lookup("UC_navUserTypeFlag");
	userTypeInfo.value = type;
}

exports.getUserTypeElca = function(){
	return app.getAppProperty("UC_navUserTypeFlag");
}


