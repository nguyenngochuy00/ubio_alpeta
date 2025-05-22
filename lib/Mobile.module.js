/************************************************
 * Android.module.js
 * Created at Nov 12, 2020 3:21:12 PM.
 *
 * 자운대의 경우 export 이후 해당 스크립트 지우고 패치해야함.
 * @author EVN0025
 ************************************************/
/*
window.BackBtnClicked = new Event('BackBtnClicked');

window.UserImageSelected = new Event('UserImageSelected');

window.UserImageCancel = new Event('UserImageCancel');

globals.setAppVersion = function(version) {
	localStorage.setItem("version", version);
}

globals.getAppVersion = function() {
	return localStorage.getItem("version");
}

globals.setHasNewAppVersion = function(hasNewAppVersion){
	localStorage.setItem("hasNewAppVersion", hasNewAppVersion);
}

globals.getHasNewAppVersion = function(){
	return localStorage.getItem("hasNewAppVersion");
}

globals.closeApp = function(e) {
	console.log("dispatch close app event");
	window.backBtnMessageHandler.postMessage(JSON.stringify({
		event: "CLOSE_APP"
	}));
}

function getUserAgent() {
	var userAgent = window.navigator.userAgent.toLowerCase(),
    safari = /safari/.test( userAgent ),
    ios = /iphone|ipod|ipad/.test( userAgent );

	if( ios ) {
	    if ( safari ) {
	        return "safari"
	    } else if ( !safari ) {
	        return "iosWebView"
	    };
	} else {
	    return "android"
	};
}*/