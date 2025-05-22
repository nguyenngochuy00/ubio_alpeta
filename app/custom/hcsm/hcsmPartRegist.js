/************************************************
 * hcsmRegist.js
 * Created at 2021. 9. 27. 오후 2:38:09.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var mode;
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	
	var initValue = app.getHost().initValue;
	mode = initValue["mode"];
	if( mode == "edit"){
		var value = initValue["value"];	
		app.lookup("HCCOM_ipbName").value = value;
	}
	
	var dsTeam = initValue["dsTeam"];

	var cmbTeamName = app.lookup("CMB_TeamName");
	if (dsTeam) {
		cmbTeamName.setItemSet(dsTeam, {
			label: "TeamName",
			value: "TeamID",
		});
	}
	cmbTeamName.value = initValue["teamID"];
}

function onHCCOM_btnAddClick(/* cpr.events.CMouseEvent */ e){
	//team_id 0일 시 return
	e.preventDefault();
	if (app.lookup("CMB_TeamName").value < 1) {
		dialogAlert(app.getRootAppInstance(), dataManager.getString("Str_Failed"), "team name "+dataManager.getString("Str_CommonValidAlert"));
		return;
	}	
	if (app.lookup("HCCOM_ipbName").value == null || app.lookup("HCCOM_ipbName").value == "") {
		dialogAlert(app.getRootAppInstance(), dataManager.getString("Str_Failed"), "part name "+dataManager.getString("Str_CommonValidAlert"));
		return;
	}
	app.close([app.lookup("CMB_TeamName").value, app.lookup("HCCOM_ipbName").value]);
}

function onHCCOM_btnCancelClick(/* cpr.events.CMouseEvent */ e){
	app.close();
}