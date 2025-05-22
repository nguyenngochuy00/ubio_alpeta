/************************************************
 * UserInfoCustomHCSM.js
 * Created at 2021. 11. 16. 오전 9:51:48.
 *
 * @author zxc
 ************************************************/

exports.setUserPassportInfoHCSM = function(passport){
	app.lookup("UC_ipbPassportNo").value = passport;
}

exports.setUserJobNoInfoHCSM = function(jobNo){
	app.lookup("UC_ipbJobNo").value = jobNo;
}

exports.setUserIqamaNoInfoHCSM = function(iqamaNo){
	app.lookup("UC_ipbIaqamaNo").value = iqamaNo;
}

exports.setUserRemarksInfoHCSM = function(remarks){
	app.lookup("UC_ipbRemarks").value = remarks;
}

exports.getUserPassportInfoHCSM = function(){
	return app.getAppProperty("UC_ipbPassportNo");
}

exports.getUserJobNoInfoHCSM = function(){
	return app.getAppProperty("UC_ipbJobNo");
}

exports.getUserIqamaNoInfoHCSM = function(){
	return app.getAppProperty("UC_ipbIaqamaNo");
}

exports.getUserRemarksInfoHCSM = function(){
	return app.getAppProperty("UC_ipbRemarks");
}
