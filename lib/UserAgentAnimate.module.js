/************************************************
 * UserAgentAnimate.module.js
 * Created at 2019. 6. 5. 오전 9:24:43.
 *
 * @author osm8667
 ************************************************/

/**
 * @param {cpr.core.AppInstance} app
 */
globals.downloadStartAnimate = function(/*cpr.core.AppInstance*/app){
	var root = app.getRootAppInstance();
	/**
	 * @type udc.desktop.UserAgent
	 */
	var udcUserAgent = root.lookup("MAIN_udcUserAgent");
	udcUserAgent.animateStart();

}

/**
 * @param {cpr.core.AppInstance} app
 */
globals.downloadEndAnimate = function(/*cpr.core.AppInstance*/app){
	var root = app.getRootAppInstance();
	/**
	 * @type udc.desktop.UserAgent
	 */
	var udcUserAgent = root.lookup("MAIN_udcUserAgent");
	udcUserAgent.animateEnd();
}