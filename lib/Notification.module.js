/************************************************
 * Notification.module.js
 * Created at 2018. 11. 1. 오후 1:54:05.
 *
 * @author tomato
 ************************************************/

globals.registNotify = function(key,/*cpr.controls.Notifier*/notifier,callback){
	cpr.core.NotificationCenter.INSTANCE.subscribe("desktop-notify", null, function(data) {
		callback(notifier,data);
	});
}

globals.removeNotify = function(key){
	cpr.core.NotificationCenter.INSTANCE.unsubscribe(null, key);
}

globals.notify = function(key,data){
	cpr.core.NotificationCenter.INSTANCE.post(key, data);
}