/************************************************
 * help_page.js
 * Created at 2020. 8. 6. 오전 10:02:07.
 *
 * @author fois
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	
	var initValue = app.getHost().initValue;
	if( initValue ){
		var locale = dataManager.getLocale();
		var helpPage = app.lookup("HLMP_obHelpPage");
		var pageSrc = ""
		switch (initValue["src"]){
			case DLG_LICENSE: pageSrc = "/data/help_html/licenseRegist/licenseRegist_"+locale+".htm"; break;
			default:
			return;
		}		
		helpPage.data = pageSrc;
	}	
}
