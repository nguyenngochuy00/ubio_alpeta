/************************************************
 * musteringReportRegist.js
 * Created at 2020. 9. 10. 오후 2:00:02.
 *
 * @author fois
 ************************************************/
var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var today = dateLib.getToday("-");
	
	app.lookup("MMMRR_dtiStartDate").value = today+ " 00:00";	
	app.lookup("MMMRR_dtiEndDate").value = today + " 23:59";	
	
	var cmbEventType = app.lookup("MMMRR_cmbEventType");
	cmbEventType.addItem(new cpr.controls.Item(dataManager.getString("Str_WarnFire"), EventEmergencyFire)); //0x00030016   //196630  화재 경고
	
	var groupList = app.lookup("GroupList");
	var dsGroup = dataManager.getGroup()	
	dsGroup.copyToDataSet(groupList);
	groupList.addRowData({"Name":dataManager.getString("Str_All"),"GroupID":0});
	groupList.commit();
	
	app.lookup("MMMRR_treGroup").redraw();
	
	var initValue = app.getHost().initValue;
	var musteringList = initValue["MusteringList"];
	var dsMusteringList = app.lookup("MusteringList");		
	musteringList.copyToDataSet(dsMusteringList);
	
	dsMusteringList.commit();
	
}

function onMMMRR_btnRegistClick(/* cpr.events.CMouseEvent */ e){		
	var grdMusteringList = app.lookup("MMMRR_grdMusteringList");
	var checkedMusterings = grdMusteringList.getCheckRowIndices();
	if( checkedMusterings.length <1 ){		
		dialogAlert(app, dataManager.getString("Str_Warning"),dataManager.getString("Str_NoSelectionZone"));
		return;
	}
	
	var treGroup = app.lookup("MMMRR_treGroup");	
	var checkedGroups = treGroup.getSelectedDataSetIndices();
	if( checkedGroups.length <1 ){		
		dialogAlert(app, dataManager.getString("Str_Warning"),dataManager.getString("Str_ErrorGroupNotSelected"));
		return;
	}
	
	// 소집 구역 리스트 추가
	var dsMusteringList= app.lookup("MusteringList");
	var dsMusteringIDs = app.lookup("MusteringIDs");
	dsMusteringIDs.clear();
	
	checkedMusterings.forEach(function(index){
		var row = dsMusteringList.getRow(index);		
		var musteringID = row.getValue("MusteringID");
		dsMusteringIDs.addRowData({"MusteringID":musteringID});
	});
	
	// 그룹 리스트 추가
	var dsGroupList = app.lookup("GroupList");
	var dsGroupIDs = app.lookup("GroupIDs");
	dsGroupIDs.clear();
	
	checkedGroups.forEach(function(index){
		var row = dsGroupList.getRow(index);		
		var groupID = row.getValue("GroupID");		
		dsGroupIDs.addRowData({"GroupID":groupID});
	});
	
	if( dsGroupIDs.getRowCount() == dsGroupList.getRowCount() ){ // 전체가 선택된 경우 그룹 리스트 초기화. 그룹리스트에 데이터가 없는 경우 전체 사용자 처리
		dsGroupIDs.clear();		
	}
	
	dsMusteringIDs.commit();
	dsGroupIDs.commit();
						
	comLib.showLoadMask("",dataManager.getString("Str_Save"),"",1);
	var sms_postRollCallReport = app.lookup("sms_postRollCallReport");
	sms_postRollCallReport.send();
}

// 레포트 생성 완료
function onSms_postRollCallReportSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){				
		app.close(true);
	} else {		
		dialogAlert(app, dataManager.getString("Str_Failed"),dataManager.getString(getErrorString(resultCode)));
	}
}

// 레포트 생성 에러
function onSms_postRollCallReportSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// 레포트 생성 타임아웃
function onSms_postRollCallReportSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

function onMMMRR_btnCancelClick(/* cpr.events.CMouseEvent */ e){
	app.close(false);
}
