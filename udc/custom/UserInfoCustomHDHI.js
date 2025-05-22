/************************************************
 * UserInfoCustomHDHI.js
 * Created at 2024. 4. 19. 오전 11:44:51.
 *
 * @author sep
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");

exports.setUserCustomHDHI = function(dataMap){
	var dmUserHDHI = app.lookup("UserCustomHDHI");
	dataMap.copyToDataMap(dmUserHDHI);
	app.lookup("UCHDHI_cmbPartner").redraw();
	app.lookup("UCHDHI_national").redraw();
	return;
};

exports.getUserCustomHDHI = function(){
	var dmUserHDHI = app.lookup("UserCustomHDHI");
	return dmUserHDHI;
};

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	
	var cmbPartner = app.lookup("UCHDHI_cmbPartner");
	var partnerList = dataManager.getPartnerListHDHI();
	cmbPartner.setItemSet(partnerList, {
		label: "PartnerName",
		value: "PartnerID"
	});
}
