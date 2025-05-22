/************************************************
 * UserInfoCustomALMARAI.js
 * Created at 2021. 11. 16. 오전 9:51:48.
 *
 * @author sky
 ************************************************/

exports.setUserDescriptionInfoALMARAI = function(description){
	app.lookup("UC_ipbDescription").value = description;
}



exports.getUserDescriptionInfoALMARAI = function(){
	return app.getAppProperty("UC_ipbDescription");
}
