/************************************************
 * hcsmUserCustomSetting.js
 * Created at 2021. 9. 23. 오전 9:59:59.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;

function onBodyLoad( /* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var dsCompany = app.lookup("HCSMCompany");
	var dsTeam = app.lookup("HCSMTeam");
	var dsPart = app.lookup("HCSMPart");
	var dsNationality = app.lookup("HCSMNationality");
	var dsBloodType = app.lookup("HCSMBloodType");
	
	dataManager.getCompanyList().copyToDataSet(dsCompany);
	dataManager.getTeamList().copyToDataSet(dsTeam);
	dataManager.getPartList().copyToDataSet(dsPart);
	dataManager.getNationalityList().copyToDataSet(dsNationality);
	dataManager.getBloodTypeList().copyToDataSet(dsBloodType);
	
	dsCompany.commit();
	dsTeam.commit();
	dsPart.commit();
	dsNationality.commit();
	dsBloodType.commit();
	
	var cmbTeamName = app.lookup("CMB_TeamName");
	
	if (dsTeam) {
		cmbTeamName.setItemSet(dsTeam, {
			label: "TeamName",
			value: "TeamID",
		});
	}
}

function resultError() {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function resultTimeout() {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onSms_SubmitError( /* cpr.events.CSubmissionEvent */ e) {
	resultError();
}

function onSms_SubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	resultTimeout();
}

function doOEMInitProcess() {
	var dsCompany = app.lookup("HCSMCompany");
	var dsTeam = app.lookup("HCSMTeam");
	var dsPart = app.lookup("HCSMPart");
	var dsNationality = app.lookup("HCSMNationality");
	var dsBloodType = app.lookup("HCSMBloodType");
	
	var sms_getHCSMData = new cpr.protocols.Submission("sms_getHCSMData");
	sms_getHCSMData.action = "/v1/oemData/all";
	sms_getHCSMData.method = "get";
	sms_getHCSMData.mediaType = "application/x-www-form-urlencoded";
	
	sms_getHCSMData.addEventListenerOnce("submit-done", onSms_getOEMInitSubmitDone);
	
	sms_getHCSMData.addResponseData(app.lookup("Result"), false, "Result");
	sms_getHCSMData.addResponseData(app.lookup("HCSMCompany"), false, "HCSMCompany");
	sms_getHCSMData.addResponseData(app.lookup("HCSMTeam"), false, "HCSMTeam");
	sms_getHCSMData.addResponseData(app.lookup("HCSMPart"), false, "HCSMPart");
	sms_getHCSMData.addResponseData(app.lookup("HCSMNationality"), false, "HCSMNationality");
	sms_getHCSMData.addResponseData(app.lookup("HCSMBloodType"), false, "HCSMBloodType");
	
	comLib.showLoadMask("", dataManager.getString("Str_Synchronization"), "", 0);
	sms_getHCSMData.send();
}

function onSms_getOEMInitSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		setDataManager();
	} else {
		//todo
		//에러메세지
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function setDataManager() {
	var dsCompany = app.lookup("HCSMCompany");
	var dsTeam = app.lookup("HCSMTeam");
	var dsPart = app.lookup("HCSMPart");
	var dsNationality = app.lookup("HCSMNationality");
	var dsBloodType = app.lookup("HCSMBloodType");
	
	dataManager.setCompanyList(dsCompany);
	dataManager.setTeamList(dsTeam);
	dataManager.setPartList(dsPart);
	dataManager.setNationalityList(dsNationality);
	dataManager.setBloodTypeList(dsBloodType);
}

// 리스트 갱신
function onHCSMS_btnRefreshClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var hCSMS_btnRefresh = e.control;
	console.log(app.lookup("HCSMS_tabUserCustom").getSelectedTabItem().id);
	
	doOEMInitProcess();
}

// 항목 추가
function onHCSMS_btnAddClick( /* cpr.events.CMouseEvent */ e) {
	var tabID = app.lookup("HCSMS_tabUserCustom").getSelectedTabItem().id;
	
	var headerTitle;
	var dmID;
	var setValueName;
	var smsID;
	
	switch (tabID) {
		case 1:
			headerTitle = "Str_Company";
			dmID = "dmHCSMCompany";
			setValueName = "CompanyName"
			smsID = "sms_postCompany";
			break;
		case 2:
			headerTitle = "Str_Team";
			dmID = "dmHCSMTeam";
			setValueName = "TeamName";
			smsID = "sms_postTeam";
			break;
		case 3:
			openPartDialog();
			return;
		case 4:
			headerTitle = "Str_Nationality";
			dmID = "dmHCSMNationality";
			setValueName = "NationalityName";
			smsID = "sms_postNationality";
			break;
		case 5:
			headerTitle = "Str_BloodType";
			dmID = "dmHCSMBloodType";
			setValueName = "BloodName";
			smsID = "sms_postBloodType";
			break;
	}
	app.getRootAppInstance().openDialog("app/custom/hcsm/hcsmRegist", {
		width: 300,
		height: 150
	}, function(dialog) {
		dialog.bind("headerTitle").toLanguage(headerTitle);
		dialog.initValue = {
			"mode": "add",
			"value": ""
		};
		dialog.resizable = false;
		dialog.modal = true;
	}).then(function(returnValue) {
		if (returnValue) {
			var dm = app.lookup(dmID);
			dm.clear();
			dm.setValue(setValueName, returnValue);
			var sms_post = app.lookup(smsID);
			sms_post.send();
		}
	});
}

function openPartDialog() {
	app.getRootAppInstance().openDialog("app/custom/hcsm/hcsmPartRegist", {
		width: 300,
		height: 200
	}, function(dialog) {
		dialog.bind("headerTitle").toLanguage("Str_Part");
		dialog.initValue = {
			"mode": "add",
			"dsTeam": app.lookup("HCSMTeam"),
			"teamID": 0,
			"value": ""
		};
		dialog.resizable = false;
		dialog.modal = true;
	}).then(function(returnValue) {
		if (returnValue) {
			var dm = app.lookup("dmHCSMPart");
			dm.clear();
			dm.setValue("TeamID", returnValue[0]);
			dm.setValue("PartName", returnValue[1]);
			var sms_post = app.lookup("sms_postPart");
			sms_post.send();
		}
	});
}

// company 등록 결과
function onSms_postCompanySubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == 0) {
		doOEMInitProcess();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

/*
 * Team 등록 결과
 */
function onSms_postTeamSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == 0) {
		doOEMInitProcess();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

/*
 * Nationality 등록 결과
 */
function onSms_postNationalitySubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == 0) {
		doOEMInitProcess();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

/*
 *BloodType 등록 결과
 */
function onSms_postBloodTypeSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == 0) {
		doOEMInitProcess();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	
}

// 수정
function onHCSMS_grdCompanyRowDblclick( /* cpr.events.CGridMouseEvent */ e) {
	
	var CompanyID = e.row.getValue("CompanyID");
	var CompanyName = e.row.getValue("CompanyName");
	
	app.getRootAppInstance().openDialog("app/custom/hcsm/hcsmRegist", {
		width: 300,
		height: 150
	}, function(dialog) {
		dialog.bind("headerTitle").toLanguage("Str_Company");
		dialog.initValue = {
			"mode": "edit",
			"value": CompanyName
		};
		dialog.resizable = false;
		dialog.modal = true;
	}).then(function(returnValue) {
		if (returnValue) {
			var dmHCSMCompany = app.lookup("dmHCSMCompany");
			dmHCSMCompany.clear();
			dmHCSMCompany.setValue("CompanyID", CompanyID);
			dmHCSMCompany.setValue("CompanyName", returnValue);
			var sms_putCompany = app.lookup("sms_putCompany");
			sms_putCompany.send();
		}
	});
}

function onSms_putCompanySubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == 0) {
		doOEMInitProcess();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 항목 삭제
function onHCSMS_btnDeleteClick( /* cpr.events.CMouseEvent */ e) {
	var tabID = app.lookup("HCSMS_tabUserCustom").getSelectedTabItem().id;
	switch (tabID) {
		case 1:
			var grdCompany = app.lookup("HCSMS_grdCompany");
			var row = grdCompany.getSelectedRow();
			if (row) {
				var companyID = row.getValue("CompanyID");
				var sms_deleteCompany = app.lookup("sms_deleteCompany");
				sms_deleteCompany.action = "/v1/oemData/hcsm/company/" + companyID;
				sms_deleteCompany.userAttr("id", String(companyID));
				sms_deleteCompany.send();
			}
			break;
		case 2:
			var grdTeam = app.lookup("HCSMS_grdTeam");
			var row = grdTeam.getSelectedRow();
			if (row) {
				var teamID = row.getValue("TeamID");
				var sms_deleteTeam = app.lookup("sms_deleteTeam");
				sms_deleteTeam.action = "/v1/oemData/hcsm/team/" + teamID;
				sms_deleteTeam.userAttr("id", String(teamID));
				sms_deleteTeam.send();
			}
			break;
		case 3:
			var grdPart = app.lookup("HCSMS_grdPart");
			var row = grdPart.getSelectedRow();
			if (row) {
				var partID = row.getValue("PartID");
				var sms_deletePart = app.lookup("sms_deletePart");
				sms_deletePart.action = "/v1/oemData/hcsm/part/" + partID;
				sms_deletePart.userAttr("id", String(partID));
				sms_deletePart.send();
			}
			break;
		case 4:
			var grdNationality = app.lookup("HCSMS_grdNationality");
			var row = grdNationality.getSelectedRow();
			if (row) {
				var nationalityID = row.getValue("NationalityID");
				var sms_deleteNationality = app.lookup("sms_deleteNationality");
				sms_deleteNationality.action = "/v1/oemData/hcsm/nationality/" + nationalityID;
				sms_deleteNationality.userAttr("id", String(nationalityID));
				sms_deleteNationality.send();
			}
			break;
		case 5:
			var grdBloodType = app.lookup("HCSMS_grdBloodType");
			var row = grdBloodType.getSelectedRow();
			if (row) {
				var bloodID = row.getValue("BloodID");
				var sms_deleteBloodType = app.lookup("sms_deleteBloodType");
				sms_deleteBloodType.action = "/v1/oemData/hcsm/bloodType/" + bloodID;
				sms_deleteBloodType.userAttr("id", String(bloodID));
				sms_deleteBloodType.send();
			}
			break;
	}
}

function onSms_deleteCompanySubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** @type cpr.protocols.Submission	 */
	var sms_deleteCompany = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == 0) {
		doOEMInitProcess();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_postTeamSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	resultError();
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_postTeamSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	resultTimeout();
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_postNationalitySubmitError( /* cpr.events.CSubmissionEvent */ e) {
	resultError();
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_postNationalitySubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	resultTimeout();
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_postBloodTypeSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	resultError();
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_postBloodTypeSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	resultTimeout();
}

/*
 * 그리드에서 row-dblclick 이벤트 발생 시 호출.
 * detail이 row를 더블클릭 한 경우 발생하는 이벤트.
 */
function onHCSMS_grdTeamRowDblclick( /* cpr.events.CGridMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Grid
	 */
	var ID = e.row.getValue("TeamID");
	var Name = e.row.getValue("TeamName");
	
	app.getRootAppInstance().openDialog("app/custom/hcsm/hcsmRegist", {
		width: 300,
		height: 150
	}, function(dialog) {
		dialog.bind("headerTitle").toLanguage("Str_Team");
		dialog.initValue = {
			"mode": "edit",
			"value": Name
		};
		dialog.resizable = false;
		dialog.modal = true;
	}).then(function(returnValue) {
		if (returnValue) {
			var dm = app.lookup("dmHCSMTeam");
			dm.clear();
			dm.setValue("TeamID", ID);
			dm.setValue("TeamName", returnValue);
			var sms_putTeam = app.lookup("sms_putTeam");
			sms_putTeam.send();
		}
	});
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_putTeamSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == 0) {
		doOEMInitProcess();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

/*
 * 그리드에서 row-dblclick 이벤트 발생 시 호출.
 * detail이 row를 더블클릭 한 경우 발생하는 이벤트.
 */
function onHCSMS_grdNationalityRowDblclick( /* cpr.events.CGridMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Grid
	 */
	var ID = e.row.getValue("NationalityID");
	var Name = e.row.getValue("NationalityName");
	
	app.getRootAppInstance().openDialog("app/custom/hcsm/hcsmRegist", {
		width: 300,
		height: 150
	}, function(dialog) {
		dialog.bind("headerTitle").toLanguage("Str_Nationality");
		dialog.initValue = {
			"mode": "edit",
			"value": Name
		};
		dialog.resizable = false;
		dialog.modal = true;
	}).then(function(returnValue) {
		if (returnValue) {
			var dm = app.lookup("dmHCSMNationality");
			dm.clear();
			dm.setValue("NationalityID", ID);
			dm.setValue("NationalityName", returnValue);
			var sms = app.lookup("sms_putNationality");
			sms.send();
		}
	});
	
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_putNationalitySubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == 0) {
		doOEMInitProcess();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

/*
 * 그리드에서 row-dblclick 이벤트 발생 시 호출.
 * detail이 row를 더블클릭 한 경우 발생하는 이벤트.
 */
function onHCSMS_grdBloodTypeRowDblclick( /* cpr.events.CGridMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Grid
	 */
	var ID = e.row.getValue("BloodID");
	var Name = e.row.getValue("BloodName");
	
	app.getRootAppInstance().openDialog("app/custom/hcsm/hcsmRegist", {
		width: 300,
		height: 150
	}, function(dialog) {
		dialog.bind("headerTitle").toLanguage("Str_BloodType");
		dialog.initValue = {
			"mode": "edit",
			"value": Name
		};
		dialog.resizable = false;
		dialog.modal = true;
	}).then(function(returnValue) {
		if (returnValue) {
			var dm = app.lookup("dmHCSMBloodType");
			dm.clear();
			dm.setValue("BloodID", ID);
			dm.setValue("BloodName", returnValue);
			var sms = app.lookup("sms_putBloodType");
			sms.send();
		}
	});
	
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_putBloodTypeSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == 0) {
		doOEMInitProcess();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_deleteTeamSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** @type cpr.protocols.Submission	 */
	var sms_deleteTeam = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == 0) {
		doOEMInitProcess();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_deleteNationalitySubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_deleteNationality = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == 0) {
		doOEMInitProcess();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_deleteBloodTypeSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_deleteBloodType = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == 0) {
		doOEMInitProcess();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postPartSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == 0) {
		doOEMInitProcess();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

/*
 * 그리드에서 row-dblclick 이벤트 발생 시 호출.
 * detail이 row를 더블클릭 한 경우 발생하는 이벤트.
 */
function onHCSMS_grdPartRowDblclick( /* cpr.events.CGridMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Grid
	 */
	var teamID = e.row.getValue("TeamID");
	var partID = e.row.getValue("PartID");
	var partName = e.row.getValue("PartName");
	
	app.getRootAppInstance().openDialog("app/custom/hcsm/hcsmPartRegist", {
		width: 300,
		height: 150
	}, function(dialog) {
		dialog.bind("headerTitle").toLanguage("Str_Team");
		dialog.initValue = {
			"mode": "edit",
			"dsTeam": app.lookup("HCSMTeam"),
			"teamID": teamID,
			"value": partName
		};
		dialog.resizable = false;
		dialog.modal = true;
	}).then(function(returnValue) {
		if (returnValue) {
			var dm = app.lookup("dmHCSMPart");
			dm.clear();
			dm.setValue("TeamID", returnValue[0]);
			dm.setValue("PartID", partID);
			dm.setValue("PartName", returnValue[1]);
			var sms_putPart = app.lookup("sms_putPart");
			sms_putPart.send();
		}
	});
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_putPartSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == 0) {
		doOEMInitProcess();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_deletePartSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == 0) {
		doOEMInitProcess();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

/*
 * 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick( /* cpr.events.CMouseEvent */ e) {
	setDataManager();
	app.close(true);
}