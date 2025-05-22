/************************************************
 * Setting.module.js
 * Created at 2020. 3. 12. 오후 4:46:05.
 *
 * @author blue1
 ************************************************/

exports.id = "Setting.module.js";

/* 사용자 설정 정보 
 * [0] = userID, [1] = wedgetID,[2] = layout (0 왼쪽, 1 오른쪽), [3] = index 
*/
var userSettings = null;
	
exports.initUserSetting = function(inputDatas){
	userSettings = new Array();
	
	for (var i=0 ; i < inputDatas.length ; i++){
		this.addUserSetting([inputDatas[i]["UserID"], inputDatas[i]["WedgetID"], inputDatas[i]["Layout"], inputDatas[i]["Index"]]);
	}

	//console.log(userSettings);
};

exports.clearUserSetting = function() {
	userSettings = new Array();
}

exports.defaultSetting = function(){
	var dataManager = getDataManager();
	var userInfo = dataManager.getAccountInfo().getDatas();
	var userID = Number(userInfo.UserID);
	userSettings = [
		[userID, 0, 0, 0],
		[userID, 1, 1, 0],
		[userID, 2, 1, 1],
		[userID, 3, 0, 1],
		[userID, 4, 1, 2],
		[userID, 5, 0, 2],
		[userID, 6, 1, 3]
	];		
}

exports.addUserSetting = function(userSetting) {
	if (userSettings == null) {
		userSettings = new Array();
	}
	userSettings.push(userSetting);
}

exports.sortSettingIndex = function(){
	userSettings.sort(function(a, b) {
		return a[3]-b[3];	
	});
};

exports.sortSettingWedget = function(){
	userSettings.sort(function(a, b) {
		return a[1]-b[1];	
	});
};

exports.getSettingLength = function(){
	if (userSettings == null){
		return 0;
	}	
	return userSettings.length;	
};

exports.getSettingUserID = function(index) {
	return userSettings[index][0];
};

exports.getSettingWGID = function(index) {
	return userSettings[index][1];
};

exports.getSettingWGLayout = function(index){
	return userSettings[index][2];
};

exports.getSettingWGIndex = function(index){
	return userSettings[index][3];
};
