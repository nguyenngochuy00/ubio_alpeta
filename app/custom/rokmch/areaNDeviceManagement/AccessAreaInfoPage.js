/************************************************
 * AccessAreaInfoPage.js
 * Created at 2018. 12. 13. 오후 3:02:14.
 *
 * @author fois
 ************************************************/
var _accessGroupID;
var _accessAreaID;
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	var udcAreaInfoPage = app.lookup("ACARM_udcAreaInfoPage");
	udcAreaInfoPage.setAccessGroupID(_accessGroupID);	
	udcAreaInfoPage.loadAccessArea(_accessAreaID);
	udcAreaInfoPage.setMode("group","modify");
}

exports.init = function( accessGroupID, accessAreaID){
	_accessGroupID = accessGroupID;
	_accessAreaID = accessAreaID;
	console.log("init ",accessGroupID,accessAreaID);
}

exports.deleteAccessAreaInAccessGroup = function(accessGroupID, accessAreaID){
	var hostAppIns = app.getHostAppInstance();
	if (hostAppIns) {
		hostAppIns.callAppMethod("deleteAccessAreaInAccessGroup", accessGroupID, accessAreaID);
	}
}


exports.updateTimezoneInfo = function( syncInfo ){
	console.log(syncInfo);
	var udcAreaInfoPage = app.lookup("ACARM_udcAreaInfoPage");
	udcAreaInfoPage.updateTimezoneInfo(syncInfo);
	
}



