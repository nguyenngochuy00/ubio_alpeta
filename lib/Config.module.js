/************************************************
 * Config.module.js
 * Created at Aug 31, 2020 4:22:11 PM.
 *
 * @author EVN0025
 ************************************************/

var deafaultApiHost = window.location.origin + "/v1" || "http://ubio.ap.ngrok.io/v1";
var licenseServerURL = "http://ubio.ap.ngrok.io/address?customerID="

function getServerUrl(customerId) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "GET", licenseServerURL + customerId, false ); // false for synchronous request
	xmlHttp.send();
	var response = xmlHttp.responseText;
	var responseObject = JSON.parse(response);
	var serverAddress = responseObject.ServerAddress;
	if (!serverAddress) {
		return deafaultApiHost;
	}
	var serverPort = responseObject.ServerPort
	var serverURL = serverPort && serverPort > 0 
		? "http://" + serverAddress + ":" + serverPort + "/v1"
		: "http://" + serverAddress + "/v1";
	return serverURL;
}

function apiHostResolution(customerId){
		if (customerId) {
			var res = getServerUrl(customerId);
			console.log("get new alpetaServerAddress", res)
			localStorage.setItem("alpetaCustomerId", customerId);
			localStorage.setItem("alpetaServerAddress", res);
			return res;
		} else {
			var res = localStorage.getItem("alpetaServerAddress")
			if (res){
				console.log("reusing alpetaServerAddress", res)
				return res;
			}
			var customerId = localStorage.getItem("alpetaCustomerId")
			if (customerId){
				return getServerUrl(customerId)
			} else {
				return deafaultApiHost;
			}
			
		}
	}

var config = {
	apiHost: window.location.origin + "/v1",
	websocketHost: "ubio.ap.ngrok.io",
	apiHostFakeData: window.location.origin,
	apiHostResolution: apiHostResolution,
	dashboard: {
		maximumUsers: 200000,
		maximumTerminals: 2000,
		maxumumGroup: 1000,
		maximumAccessGroup: 1000,
		maxumumPosition: 200
	}
}

globals.getConfig = function() {
	return config;
}
