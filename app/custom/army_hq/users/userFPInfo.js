/************************************************
 * userFPInfo.js
 * Created at 2021. 2. 15. 오후 1:46:17.
 *
 * @author fois
 ************************************************/


function onBodyLoad(/* cpr.events.CEvent */ e){
	var initValue = app.getHost().initValue;
	var dsfpInfo = initValue["fpInfo"];
	var count = dsfpInfo.getRowCount();
	for( var i = 0; i < count; i++){
		var fpInfo = dsfpInfo.getRow(i);
		var fingerID = fpInfo.getValue("FingerID");
		app.lookup("opbFP"+fingerID).value = "0";
	}
}

function onUSINT_btnUserSaveClick(/* cpr.events.CMouseEvent */ e){	
	app.close();
}
