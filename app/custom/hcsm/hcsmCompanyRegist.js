/************************************************
 * CompanyRegist.js
 * Created at 2021. 9. 27. 오후 2:38:09.
 *
 * @author fois
 ************************************************/

function onBodyLoad(/* cpr.events.CEvent */ e){
	var initValue = app.getHost().initValue;
	var mode = initValue["mode"];
	if( mode == "edit"){
		var value = initValue["value"];	
		app.lookup("HCCOM_ipbName").value = value;
	}
}

function onHCCOM_btnAddClick(/* cpr.events.CMouseEvent */ e){
	app.close(app.lookup("HCCOM_ipbName").value);
}

function onHCCOM_btnCancelClick(/* cpr.events.CMouseEvent */ e){
	app.close();
}


