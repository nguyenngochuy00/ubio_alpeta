/************************************************
 * UserInfoCustomArmyHQ.js
 * Created at 2020. 12. 3. ���� 1:05:18.
 *
 * @author blue1
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var userType;

exports.setUserTypeAMHQ = function(type){
	userType = type;
	dataManager = getDataManager();
	
	app.lookup("UCIAMQH_grpSoldier").visible = false;
	app.lookup("UCIAMQH_grpFamily").visible = false;
	app.lookup("UCIAMHQ_optBasisIssuanceCertificate").value = dataManager.getString("Str_ARMY_BasisIssuanceCertificate");
	
	switch (userType) {
	case UserPrivArmyOnDuty:	// 현역
	case UserPrivArmyMilitaryPersonnel:
	case UserPrivArmyPublicService:
		app.lookup("UCIAMHQ_ipbAddress").enabled = false;
		break;
	case UserPrivArmyOtherUnit:
		app.lookup("UCIAMHQ_ipbPhone").enabled = false;
		app.lookup("UCIAMHQ_ipbBasisIssuanceCertificate").enabled = false;
		app.lookup("UCIAMHQ_rdbGender").enabled = false;
		app.lookup("UCIAMHQ_ipbAddress").enabled = false;
		break;
	case UserPrivArmyForeign:
		app.lookup("UCIAMHQ_ipbPhone").enabled = false;
		app.lookup("UCIAMHQ_ipbBasisIssuanceCertificate").enabled = false;
		app.lookup("UCIAMHQ_rdbGender").enabled = false;
		break;
	case UserPrivArmyResident:
	case UserPrivArmyRegular:
		app.lookup("UCIAMHQ_optBasisIssuanceCertificate").value = dataManager.getString("Str_ARMY_BackgroundCheckNumber");
		break;
	case UserPrivArmySoldier:
		app.lookup("UCIAMQH_grpSoldier").visible = true;
		app.lookup("UCIAMHQ_ipbAddress").enabled = false;
		app.lookup("UCIAMHQ_ipbPhone").enabled = false;
		app.lookup("UCIAMHQ_rdbGender").enabled = false;
		break;
	case UserPrivArmyFamily:
		app.lookup("UCIAMQH_grpFamily").visible = true;
		app.lookup("UCIAMHQ_ipbBasisIssuanceCertificate").enabled = false;
		break;
	default:
		app.lookup("grpFullBody").visible = false;
	}
}

exports.setUserCustomInfoAMHQ = function(userCustomInfo){
	app.lookup("UCIAMHQ_dtiBirthday").value = userCustomInfo.getValue("Birthday");
	
	console.log(userType);
	switch (userType) {
	case UserPrivArmyOnDuty:
	case UserPrivArmySoldier:
		app.lookup("UCIAMHQ_ipbBasisIssuanceCertificate").value = userCustomInfo.getValue("BasisIssuanceCertificate");
		app.lookup("UCIAMHQ_dtiMoveInDate").value = userCustomInfo.getValue("MoveInDate");
		app.lookup("UCIAMHQ_dtiEnlistmentDate").value = userCustomInfo.getValue("EnlistmentDate");
		app.lookup("UCIAMHQ_dtiDischargeDate").value = userCustomInfo.getValue("DischargeDate");
		break;
	case UserPrivArmyResident:
	case UserPrivArmyRegular:
		app.lookup("UCIAMHQ_ipbBasisIssuanceCertificate").value = userCustomInfo.getValue("IdentificationNumber");
		break;
	case UserPrivArmyFamily:
		app.lookup("UCIAMHQ_ipbFamilyName").value = userCustomInfo.getValue("FamilyName");
		app.lookup("UCIAMHQ_ipbRelationUserID").value = userCustomInfo.getValue("RelationUserID");
		app.lookup("UCIAMHQ_cmbFamilyRelation").value = userCustomInfo.getValue("FamilyRelation");
		break;
	}
	app.lookup("UCIAMHQ_ipbPhone").value = userCustomInfo.getValue("Phone");
	app.lookup("UCIAMHQ_rdbGender").value = userCustomInfo.getValue("Gender");
	app.lookup("UCIAMHQ_ipbAddress").value = userCustomInfo.getValue("Address");

}
