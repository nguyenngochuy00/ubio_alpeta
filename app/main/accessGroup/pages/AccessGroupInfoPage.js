/************************************************
 * AccessGroupInfoPage.js
 * Created at 2018. 12. 13. 오후 3:02:01.
 *
 * @author fois
 ************************************************/

var comLib;
var _editMode; // "new" : 신규, "modify" : 수정
var pageRowCount = 500;
var ACGRM_BrandType;
var ACGRM_oemVersion;
var dataManager = cpr.core.Module.require("lib/DataManager");
var userPrivilege;
var userGroup;
var userID;

// 메뉴 이동 시, 지워지기 전 컬럼 잔상이 남는 현상 방지를 위해 onBodyLoad에서 onBodyInit으로 변경
function onBodyInit(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	ACGRM_oemVersion = dataManager.getOemVersion();
	if (ACGRM_oemVersion == OEM_KYOCERA){
		var groupList = dataManager.getGroup();
		groupList.copyToDataSet(app.lookup("GroupList"));
		app.lookup("ACGRM_optGroup").visible = true;
		app.lookup("ACGRM_cmbGroup").visible = true;
		app.lookup("ACGRM_cmbGroup").enabled = true;
		//console.log(app.lookup("GroupList").getRowDataRanged());
		
		userPrivilege = dataManager.getAccountInfo().getValue("Privilege");
		userGroup = dataManager.getAccountInfo().getValue("GroupCode");
		userID = dataManager.getAccountID();
	} else {
		app.lookup("accessGroupInfoGroup").getLayout().removeColumns([4, 5]);
	}
}
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);	
	var getTimezoneList = dataManager.getTimezoneSet();
	var dsTimezoneTinyList = app.lookup("TimezoneTinyList");
	getTimezoneList.copyToDataSet(dsTimezoneTinyList);
	
	ACGRM_BrandType = dataManager.getSystemBrandType();
	// 구역 단말기 리스트에서 아이디와 이름을 제외한 나머지 컬럼에는 값이 없어 의미없는 컬럼 보이지 않게 삭제
	app.lookup("ACGRM_udcAreaTerminalList").deleteColumn([3,4,6,7,8,11]);
	
	if ( ACGRM_oemVersion== OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH) {
		app.lookup("ACGRM_btnAreaImport").visible = true;
	} else if (ACGRM_oemVersion == OEM_HE_CHUNGJU_FACTORY ) {
		app.lookup("ACGRM_nbeAccessGroupCode").readOnly = true;
	} else if (ACGRM_oemVersion == OEM_NEC) {
		app.lookup("ACGRM_btnOEMType").visible = true; // 오이엠버전 사용 커스텀용 버튼
		app.lookup("ACGRM_btnOEMType").value = "맵핑코드";
	} else if (ACGRM_oemVersion == OEM_PHILIPPINES_ELEVATOR) {
		app.lookup("ACGRM_cmbElevatorSet").visible = false; 
		app.lookup("ACGRM_opbElevatorSet").visible = false; 
	} else if (ACGRM_oemVersion == OEM_GS_BASIC){
		app.lookup('ACGRM_cbxVisitEnable').visible = false;
		app.lookup('ACGRM_opbElevatorSet').visible = false;
		app.lookup('ACGRM_cmbElevatorSet').visible = false;		
	} else if (ACGRM_oemVersion == OEM_MULTI_BUILDING_MAMAGEMENT){
		app.lookup("ACGRM_cmbElevatorSet").visible = false; 
		app.lookup("ACGRM_opbElevatorSet").visible = false; 
		app.lookup("ACGRM_cmbElevatorSet").disposed = true;
		app.lookup("ACGRM_opbElevatorSet").disposed = true;
	}

	var TimezoneID = app.lookup("AccessGroup").getValue("TimezoneID");
	app.lookup("ACGRM_cmbTimezone").value = TimezoneID;
	
	var sms_getElevatorSetList = app.lookup("sms_getElevatorSetList");
	sms_getElevatorSetList.send();	
}

// 엘리베이터 설정 가져오기 완료
function onSms_getElevatorSetListSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	app.lookup("ACGRM_cmbElevatorSet").redraw();
}

// 엘리베이터 설정 가져오기 에러
function onSms_getElevatorSetListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR)
}

// 엘리베이터 설정 가져오기 타임아웃
function onSms_getElevatorSetListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

exports.setAccessAreaList = function(/*cpr.data.DataSet*/data){
	var dsAccessAreaList = app.lookup("AccessAreaList");
	dsAccessAreaList.clear();	
	data.copyToDataSet(dsAccessAreaList);	
	dsAccessAreaList.setSort("ID");
	dsAccessAreaList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);	
}

exports.setAccessAreaGroupList = function(/*cpr.data.DataSet*/data){
	var dsAccessAreaGroupList = app.lookup("AccessAreaGroupList");
	dsAccessAreaGroupList.clear();	
	data.copyToDataSet(dsAccessAreaGroupList);	
	dsAccessAreaGroupList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
}

exports.updateTimezoneInfo = function( syncInfo ){
	var dsTimezoneTinyList = app.lookup("TimezoneTinyList");
	switch( syncInfo.SyncType ){
		case 1: 
			var row = dsTimezoneTinyList.findFirstRow("TimezoneID == '"+syncInfo.TimezoneInfo.TimezoneID+"'");
			if(row){
				row.setRowData(syncInfo.TimezoneInfo);
			} else {
				dsTimezoneTinyList.addRowData(syncInfo.TimezoneInfo); break;	
			}
		case 2: 
			var row = dsTimezoneTinyList.findFirstRow("TimezoneID == '"+syncInfo.TimezoneInfo.TimezoneID+"'");
			if(row){
				row.setRowData(syncInfo.TimezoneInfo);
			} 
			break;
		case 3:
			var row = dsTimezoneTinyList.findFirstRow("TimezoneID == '"+syncInfo.TimezoneInfo.TimezoneID+"'");
			if(row){
				dsTimezoneTinyList.deleteRow(row.getIndex());
			}
			break;
		default:return;
	}
	dsTimezoneTinyList.commit();
}

exports.init = function(mode,code,name, TimezoneID,visitEnable,elevatorSetID, groupCode){
		
	_editMode = mode;
	var ipbAccessGroupCode = app.lookup("ACGRM_nbeAccessGroupCode");
	var ipbAccessGroupName = app.lookup("ACGRM_ipbAccessGroupName");
	//app.lookup("ACGRM_btnTimezoneView").enabled = true;
	app.lookup("ACGRM_btnAccessGroupAdd").enabled = true;
	app.lookup("ACGRM_btnAccessGroupDelete").enabled = true;
	ipbAccessGroupCode.enabled = true;
	ipbAccessGroupName.enabled = true;
	
	var dmAccessGroup = app.lookup("AccessGroup");
	if (_editMode == "new") {	
		ipbAccessGroupCode.readOnly = false;
		ipbAccessGroupCode.spinButton = true;
		var hostAppIns = app.getHostAppInstance();
		if (hostAppIns) {		
			code = hostAppIns.callAppMethod("getEmptyAccessGroupCode");
			name = dataManager.getString("Str_AccessGroup")+" "+code;
			TimezoneID = "0";
		}
		if (ACGRM_oemVersion == OEM_HE_CHUNGJU_FACTORY ) {
			app.lookup("ACGRM_nbeAccessGroupCode").readOnly = true;
			code = 9999;
		} else if (ACGRM_oemVersion == OEM_KYOCERA){
			app.lookup("ACGRM_cmbGroup").clearSelection();
		}
		//console.log(getDataManager().getOemVersion());
//		if (getDataManager().getOemVersion() == OEM_KYOCERA){
//			//console.log("group :" +  userGroup);
//			if (userID == 1000000000000000000 || groupCode == ""){
//				app.lookup("ACGRM_cmbGroup").selectItemByValue(0);
//			} else {
//				dmAccessGroup.setValue("Code", userGroup);
//				app.lookup("ACGRM_cmbGroup").selectItemByValue(userGroup);
//			}	
//		}
	} else {
		ipbAccessGroupCode.readOnly = true;
		ipbAccessGroupCode.spinButton = false;
	}
		
	dmAccessGroup.setValue("ID", code);
	dmAccessGroup.setValue("Name", name);		
	dmAccessGroup.setValue("TimezoneID", TimezoneID);
	dmAccessGroup.setValue("VisitEnable", visitEnable);
	dmAccessGroup.setValue("ElevatorSetID", elevatorSetID);
	if (ACGRM_oemVersion == OEM_KYOCERA){
		dmAccessGroup.setValue("Code", groupCode);
	}
	
	app.lookup("ACGRM_cmbTimezone").value = TimezoneID;
	app.lookup("ACGRM_cbxVisitEnable").value = (visitEnable==1)?true:false;
	app.lookup("ACGRM_cmbElevatorSet").value = elevatorSetID;
	
	var opbAccessGroupCode = app.lookup("ACGRM_nbeAccessGroupCode");
	opbAccessGroupCode.value = code;
	
	var ipbAccessGroupName = app.lookup("ACGRM_ipbAccessGroupName");
	ipbAccessGroupName.value = name;
	
	var dsAccessAreaGroup = app.lookup("AccessAreaGroupList");	
	var dsRegisteredArea = app.lookup("RegisteredAccessAreaList");
	dsRegisteredArea.clear();
	var dsAccessArea = app.lookup("AccessAreaList");
	
	var areaGroupCnt = dsAccessAreaGroup.getRowCount();		
	for( var i=0; i < areaGroupCnt; i++ ){
		var areaGroup = dsAccessAreaGroup.getRow(i);		
		if( areaGroup.getValue("AccessGroupID") == code ){
			var area = dsAccessArea.findFirstRow("ID == "+areaGroup.getValue("AccessAreaID"));
			if( area ){				
				dsRegisteredArea.addRowData(area.getRowData());
				dsAccessArea.realDeleteRow(area.getIndex());				
			}
		}
	}
	var gridAccessArea = app.lookup("ACGRM_udcRegisteredArea");
	gridAccessArea.setAccessAreaList(dsRegisteredArea);	
	gridAccessArea.redraw();
	
	var dsUnRegisteredArea = app.lookup("UnRegisteredAccessAreaList");
	dsUnRegisteredArea.clear();
	
	var gridUnRegisteredArea = app.lookup("ACGRM_udcUnRegisteredArea");
	var areaCnt = dsAccessArea.getRowCount();
	for( var i = 0; i < areaCnt; i++ ){
		var area = dsAccessArea.getRow(i);
		dsUnRegisteredArea.addRowData(area.getRowData());		
	}
	dsAccessArea.clear();
	
	var gridUnRegisteredArea = app.lookup("ACGRM_udcUnRegisteredArea");
	gridUnRegisteredArea.setAccessAreaList(dsUnRegisteredArea);	
	gridUnRegisteredArea.redraw();	
	//console.log(dmAccessGroup.getDatas());
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getTerminalList = e.control;
	var dsTerminalList = app.lookup("TerminalInfo");
	var udcRegisteredTerminal = app.lookup("ACGRM_udcAreaTerminalList");	
	
	comLib.hideLoadMask();
		
	var pageidx = udcRegisteredTerminal.getCurrentPageIndex();
	var registTotal = dsTerminalList.getRowCount();
	
	udcRegisteredTerminal.setPaging(registTotal, pageRowCount, 3);
	
	var start = (pageidx-1)*pageRowCount;
	var end = pageidx*pageRowCount-1;
	if ( end >= dsTerminalList.getRowCount() ){
		end = dsTerminalList.getRowCount()-1;		
	}
	
	udcRegisteredTerminal.setTerminalListRows(dsTerminalList.getRowDataRanged(start, end));
}

/*
 * "저장" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onACGRM_btnAccessGroupAddClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aCGRM_btnAccessGroupAdd = e.control;
				
	var ipbGroupCode = app.lookup("ACGRM_nbeAccessGroupCode");
	var ipbGroupName = app.lookup("ACGRM_ipbAccessGroupName");
	
	if(_editMode == "new"){
		var hostAppIns = app.getHostAppInstance();
		if (hostAppIns) {		
			var groupCode = ipbGroupCode.value;
			if (dataManager.getOemVersion() == OEM_HE_CHUNGJU_FACTORY ) {
				groupCode = 9999;
			}
			
			var valid = hostAppIns.callAppMethod("IsValidEmptyAccessGroupCode", groupCode);	
			if( valid == false ){				
				dialogAlert(app,dataManager.getString("Str_Warning"),dataManager.getString("Str_AccessGroupIDDuplicated"));
				return;
			}	
			if( ipbGroupName.value.length < 1 ){
				dialogAlert(app,dataManager.getString("Str_Warning"),dataManager.getString("Str_AccessGroupNameEmpty"));
				return;
			}
			
			var valid = hostAppIns.callAppMethod("IsValidEmptyAccessGroupName", ipbGroupName.value);	
			if( valid == false ){				
				dialogAlert(app,dataManager.getString("Str_Warning"),dataManager.getString("Str_AccessGroupNameDuplicated"));
				return;
			}		
		}
	}
	
	var TimezoneID = app.lookup("ACGRM_cmbTimezone").value;
	var visitEnable = app.lookup("ACGRM_cbxVisitEnable").value;
	var elevatorSetID = app.lookup("ACGRM_cmbElevatorSet").value;
	
	var dmAccessGroupAdd = app.lookup("AccessGroupAdd");
	dmAccessGroupAdd.setValue("ID",ipbGroupCode.value);
	dmAccessGroupAdd.setValue("Name",ipbGroupName.value);
	dmAccessGroupAdd.setValue("TimezoneID", Number(TimezoneID));
	dmAccessGroupAdd.setValue("VisitEnable", (visitEnable=="true")?1:0);
	dmAccessGroupAdd.setValue("ElevatorSetID", Number(elevatorSetID));
	if (ACGRM_oemVersion == OEM_KYOCERA){
		//console.log("ACGRM_cmbGroup / " + app.lookup("ACGRM_cmbGroup").value);
		dmAccessGroupAdd.setValue("Code", app.lookup("ACGRM_cmbGroup").value);
	}
		
	var dsRegisteredAccessAreaList = app.lookup("RegisteredAccessAreaList");
	var areaCnt = dsRegisteredAccessAreaList.getRowCount();
	var dsAreaCodes = app.lookup("AreaCodes");
	dsAreaCodes.clear();
	
	for( var i = 0; i < areaCnt; i++ ){
		var areaInfo = dsRegisteredAccessAreaList.getRow(i);
		dsAreaCodes.addRowData({"ID":areaInfo.getValue("ID")});	
	} 
		
	var smsAddAccessGroup = app.lookup("sms_addAccessGroup");
	smsAddAccessGroup.userAttr("GroupID",ipbGroupCode.value);
	
	if(_editMode == "new"){
		smsAddAccessGroup.method = "post"
		smsAddAccessGroup.action = "/v1/accessGroups";		
		comLib.showLoadMask( "", dataManager.getString("Str_AccessGroupAdd"), "",0);
	} else {
		smsAddAccessGroup.method = "put"
		smsAddAccessGroup.action = "/v1/accessGroups/"+ipbGroupCode.value;		
		comLib.showLoadMask( "", dataManager.getString("Str_AccessGroupUpdate"), "",0);
	}
	smsAddAccessGroup.send();
}

// 출입그룹 추가/수정 완료
function onSms_addAccessGroupSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_addAccessGroup = e.control;
	comLib.hideLoadMask();	
	var msg = (_editMode=="new")?dataManager.getString("Str_AccessGroupAdd"):dataManager.getString("Str_AccessGroupUpdate");
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == 0){
		if(_editMode == "new"){
			_editMode = "modify";
		}
		var hostAppIns = app.getHostAppInstance();
		if (hostAppIns) {		
			var dsRegisteredAccessAreaList = app.lookup("RegisteredAccessAreaList");
			var dmAccessGroupAdd = app.lookup("AccessGroupAdd");
			hostAppIns.callAppMethod("updateAccessGroup", dmAccessGroupAdd,dsRegisteredAccessAreaList,msg);
		}	
	}else{ 
		//dialogAlert(app, dataManager.getString("Str_Failed"), msg);
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

// 출입그룹 추가/수정 에러
function onSms_addAccessGroupSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 출입그룹 추가/수정 타임아웃
function onSms_addAccessGroupSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

/*
 * ">" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onACGRM_btnUnregistAreaClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aCGRM_btnUnregistArea = e.control;
	var udcRegisteredArea = app.lookup("ACGRM_udcRegisteredArea");	
	var indices = udcRegisteredArea.getCheckedRowIndices();
	if( indices.length == 0){
		return;
	}
		
	var dsRegisteredAccessAreaList = app.lookup("RegisteredAccessAreaList");
	
	var udcUnRegisteredArea = app.lookup("ACGRM_udcUnRegisteredArea");
	var dsUnRegisteredAccessAreaList = app.lookup("UnRegisteredAccessAreaList");
		
	indices.forEach(function(index){		
		var row = dsRegisteredAccessAreaList.getRow(index);
				
		dsUnRegisteredAccessAreaList.addRowData(row.getRowData());
		dsRegisteredAccessAreaList.deleteRow(row.getIndex())
	});
	dsRegisteredAccessAreaList.commit();
	dsUnRegisteredAccessAreaList.setSort("ID");
	
	udcUnRegisteredArea.setAccessAreaList(dsUnRegisteredAccessAreaList);
	udcRegisteredArea.setAccessAreaList(dsRegisteredAccessAreaList);
}

/*
 * 사용자 정의 컨트롤에서 areaDblClick 이벤트 발생 시 호출.
 */
function onACGRM_udcRegisteredAreaAreaDblClick(/* cpr.events.CGridEvent */ e){
	/** 
	 * @type udc.grid.gridAccessArea
	 */
	var aCGRM_udcRegisteredArea = e.control;
	//console.log(e.row.getValue("ID"));
	
	var udcRegisteredArea = app.lookup("ACGRM_udcRegisteredArea");	
	var dsRegisteredAccessAreaList = app.lookup("RegisteredAccessAreaList");
	
	var udcUnRegisteredArea = app.lookup("ACGRM_udcUnRegisteredArea");
	var dsUnRegisteredAccessAreaList = app.lookup("UnRegisteredAccessAreaList");
		
	dsUnRegisteredAccessAreaList.addRowData(e.row.getRowData());
	dsRegisteredAccessAreaList.realDeleteRow(e.row.getIndex())
	
	dsUnRegisteredAccessAreaList.setSort("ID");
	
	udcUnRegisteredArea.setAccessAreaList(dsUnRegisteredAccessAreaList);
	udcRegisteredArea.setAccessAreaList(dsRegisteredAccessAreaList);
	
}

/*
 * "<" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onACGRM_btnRegistAreaClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aCGRM_btnRegistArea = e.control;
	
	var udcUnRegisteredArea = app.lookup("ACGRM_udcUnRegisteredArea");
	var indices = udcUnRegisteredArea.getCheckedRowIndices();	
	if( indices.length == 0){
		return;
	}
	
	var udcRegisteredArea = app.lookup("ACGRM_udcRegisteredArea");	
	var dsRegisteredAccessAreaList = app.lookup("RegisteredAccessAreaList");
		
	var dsUnRegisteredAccessAreaList = app.lookup("UnRegisteredAccessAreaList");
	
	indices.forEach(function(index){		
		var row = udcUnRegisteredArea.getRow(index);
				
		dsRegisteredAccessAreaList.addRowData(row.getRowData());
		dsUnRegisteredAccessAreaList.deleteRow(row.getIndex())
	});
	dsUnRegisteredAccessAreaList.commit();
	dsRegisteredAccessAreaList.setSort("ID");
	
	udcUnRegisteredArea.setAccessAreaList(dsUnRegisteredAccessAreaList);
	udcRegisteredArea.setAccessAreaList(dsRegisteredAccessAreaList);	
}

/*
 * ">>" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onACGRM_btnUnregistAreaAllClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aCGRM_btnUnregistAreaAll = e.control;
	
	var udcRegisteredArea = app.lookup("ACGRM_udcRegisteredArea");			
	var dsRegisteredAccessAreaList = app.lookup("RegisteredAccessAreaList");
	
	var udcUnRegisteredArea = app.lookup("ACGRM_udcUnRegisteredArea");
	var dsUnRegisteredAccessAreaList = app.lookup("UnRegisteredAccessAreaList");
		
	var registCnt = dsRegisteredAccessAreaList.getRowCount();
	for( var i = 0; i < registCnt; i++ ){	
		var row = dsRegisteredAccessAreaList.getRow(i);				
		dsUnRegisteredAccessAreaList.addRowData(row.getRowData());
	};
	dsRegisteredAccessAreaList.clear();
	dsUnRegisteredAccessAreaList.setSort("ID");
	
	udcUnRegisteredArea.setAccessAreaList(dsUnRegisteredAccessAreaList);
	udcRegisteredArea.setAccessAreaList(dsRegisteredAccessAreaList);
}

/*
 * "<<" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onACGRM_btnRegistAreaAllClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aCGRM_btnRegistAreaAll = e.control;
	
	var udcUnRegisteredArea = app.lookup("ACGRM_udcUnRegisteredArea");	
	var udcRegisteredArea = app.lookup("ACGRM_udcRegisteredArea");	
	
	var dsRegisteredAccessAreaList = app.lookup("RegisteredAccessAreaList");		
	var dsUnRegisteredAccessAreaList = app.lookup("UnRegisteredAccessAreaList");
	var unRegistCnt = dsUnRegisteredAccessAreaList.getRowCount();
	for( var i = 0; i < unRegistCnt; i++ ){			
		var row = udcUnRegisteredArea.getRow(i);				
		dsRegisteredAccessAreaList.addRowData(row.getRowData());		
	}
	dsUnRegisteredAccessAreaList.clear();
	dsRegisteredAccessAreaList.setSort("ID");
	
	udcUnRegisteredArea.setAccessAreaList(dsUnRegisteredAccessAreaList);
	udcRegisteredArea.setAccessAreaList(dsRegisteredAccessAreaList);	
}

/*
 * "삭제" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onACGRM_btnAccessGroupDeleteClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aCGRM_btnAccessGroupDelete = e.control;
	var dmAccessGroup = app.lookup("AccessGroup");
	var accessGroupID = dmAccessGroup.getValue("ID");
	//console.log(accessGroupID);
	if (accessGroupID == null || accessGroupID == 0 ){
		return;
	}
	
	if ((dataManager.getOemVersion() == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH) && accessGroupID == AccessorAccessGroupCode) {
		dialogAlert(app, dataManager.getString("Str_Warning"), "문서고는 삭제할 수 없습니다.");
		return;
	}
		
	var sms_deleteAccessGroup = app.lookup("sms_deleteAccessGroup");
	sms_deleteAccessGroup.action ="/v1/accessGroups/"+dmAccessGroup.getValue("ID");
	comLib.showLoadMask("",dataManager.getString("Str_AccessGroupDelete"),"",0);
	sms_deleteAccessGroup.send();
}

// 출입그룹 삭제 완료
function onSms_deleteAccessGroupSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	comLib.hideLoadMask();
	
	var dmAccessGroup = app.lookup("AccessGroup");
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == 0){
		//dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_AccessGroupDelete"));
		var msg = dataManager.getString("Str_AccessGroupDelete");
		var hostAppIns = app.getHostAppInstance();
		if (hostAppIns) {		
			hostAppIns.callAppMethod("deleteAccessGroup",dmAccessGroup.getValue("ID"), msg);
		}
		var ipbAccessGroupCode = app.lookup("ACGRM_nbeAccessGroupCode");
		var ipbAccessGroupName = app.lookup("ACGRM_ipbAccessGroupName");
		//var btnTimezoneView = app.lookup("ACGRM_btnTimezoneView");
		var btnAccessGroupAdd = app.lookup("ACGRM_btnAccessGroupAdd");
		var btnAccessGroupDelete = app.lookup("ACGRM_btnAccessGroupDelete");
		ipbAccessGroupCode.value = "";
		ipbAccessGroupName.value = "";
		ipbAccessGroupCode.enabled = false;
		ipbAccessGroupName.enabled = false;
		//btnTimezoneView.enabled = false;
		btnAccessGroupAdd.enabled = false;
		btnAccessGroupDelete.enabled = false;
	}else{ 
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_AccessGroupDelete"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

// 출입그룹 삭제 에러
function onSms_deleteAccessGroupSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 출입그룹 삭제 타임아웃
function onSms_deleteAccessGroupSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

/*
 * 넘버 에디터에서 value-change 이벤트 발생 시 호출.
 * NumberEditor의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onNbe1ValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.NumberEditor
	 */
	var nbe1 = e.control;
	
}


/*
 * 넘버 에디터에서 value-change 이벤트 발생 시 호출.
 * NumberEditor의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onACGRM_ipbAccessGroupCodeValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.NumberEditor
	 */
	var aCGRM_ipbAccessGroupCode = e.control;
	
	var validMsg = ""
	if(_editMode=="new"){
		var hostAppIns = app.getHostAppInstance();
		if (hostAppIns) {		
			var valid = hostAppIns.callAppMethod("IsValidEmptyAccessGroupCode", aCGRM_ipbAccessGroupCode.value);	
			if( valid == false ){
				validMsg = "사용중인 출입그룹 아이디 입니다."
			}		
		}		
	}
	//app.lookup("ACGRM_opbGroupCodeValidate").value = validMsg; //TODO:출입그룹 코드가 정상인지 화면에 표시. 퍼블리셔가 아웃풋 박스 날림. 재작업 필요
}


// "출입구역 관리" 버튼에서 click 이벤트 발생 시 호출. 현재 삭제.. 출입그룹 트리의 출입구역 클릭시 출입구역 관리 화면이 표시
function onACGRM_btnAccessAreaManagementClick(/* cpr.events.CMouseEvent */ e){
	/* @type cpr.controls.Button */
	var aCGRM_btnAccessAreaManagement = e.control;
	var hostAppIns = app.getHostAppInstance();
	if (hostAppIns) {		
		hostAppIns.callAppMethod("openAccessAreaManagement");		
	}
}

/*
 * 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
 */
function onACGRM_udcAreaTerminalListPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.grid.terminalList
	 */
	var aCGRM_udcAreaTerminalList = e.control;
	
	var udcRegisteredTerminal = app.lookup("ACGRM_udcAreaTerminalList");
	var dsRegisteredTerminalList = app.lookup("TerminalInfo");
	
	var pageidx = udcRegisteredTerminal.getCurrentPageIndex();
	var registTotal = dsRegisteredTerminalList.getRowCount();
	
	udcRegisteredTerminal.setPaging(registTotal, pageRowCount, 3);
	
	var start = (pageidx-1)*pageRowCount;
	var end = pageidx*pageRowCount-1;
	if ( end >= dsRegisteredTerminalList.getRowCount() ){
		end = dsRegisteredTerminalList.getRowCount()-1;		
	}
	
	udcRegisteredTerminal.setTerminalListRows(dsRegisteredTerminalList.getRowDataRanged(start, end));
}

/*
 * 사용자 정의 컨트롤에서 areaSelectionChange 이벤트 발생 시 호출.
 */
function onACGRM_udcUnRegisteredAreaAreaSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.grid.gridAccessArea
	 */
	var aCGRM_udcUnRegisteredArea = e.control;
	var gridRow = e.newSelection;
	if(gridRow){	
		var ipbAreaName = app.lookup("ACGRM_ipbTerminalAreaName");
		ipbAreaName.value = gridRow.getValue("Name")+ " "+dataManager.getString("Str_TerminalList");
		
		var udcRegisteredTerminal = app.lookup("ACGRM_udcRegisteredArea");
		udcRegisteredTerminal.clearSelection();
		// 검색 조건 세팅
		app.lookup("TerminalInfo").clear();
		
		var smsGetTerminalList = app.lookup("sms_getTerminalList");	
		
		smsGetTerminalList.action = "/v1/accessAreas/"+gridRow.getValue("ID")+"/terminals";
		
		comLib.showLoadMask("",dataManager.getString("Str_TerminalLoading"),"",pageRowCount);
		smsGetTerminalList.send();	
	} 
}

/*
 * 사용자 정의 컨트롤에서 areaSelectionChange 이벤트 발생 시 호출.
 */
function onACGRM_udcRegisteredAreaAreaSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.grid.gridAccessArea
	 */
	var aCGRM_udcRegisteredArea = e.control;
	var gridRow = e.newSelection;
	if(gridRow){
		var ipbAreaName = app.lookup("ACGRM_ipbTerminalAreaName");
		ipbAreaName.value = gridRow.getValue("Name")+ " "+dataManager.getString("Str_TerminalList");
		var udcUnregisteredTerminal = app.lookup("ACGRM_udcUnRegisteredArea");
		udcUnregisteredTerminal.clearSelection();
		// 검색 조건 세팅
		var smsGetTerminalList = app.lookup("sms_getTerminalList");	
		
		smsGetTerminalList.action = "/v1/accessAreas/"+gridRow.getValue("ID")+"/terminals";
		
		comLib.showLoadMask("",dataManager.getString("Str_TerminalLoading"),"",pageRowCount);
		smsGetTerminalList.send();	
	}
}

// 도움말
function onACGRM_btnHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = DLG_ACCESSGROUP_MANAGEMENT;	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getRootAppInstance().dispatchEvent(selectionEvent);
}

// 타임존 버튼 클릭
function onOutputClick(/* cpr.events.CMouseEvent */ e){
	var menu_id;	
	if (ACGRM_BrandType == BRAND_NITGEN) {		
		menu_id = DLG_TIMELINE_WEEKENDN;
	} else {
		menu_id = DLG_TIMELINE_WEEKENDV;
	}	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":menu_id}});
	app.getRootAppInstance().dispatchEvent(selectionEvent);
}

// 출입그룹 가져오기 클릭
function onACGRM_btnAreaImportClick(/* cpr.events.CMouseEvent */ e){
	app.getRootAppInstance().openDialog("app/main/accessGroup/accessGroupImport", {width : 400, height : 600}, function(dialog){		
		dialog.bind("headerTitle").toLanguage("Str_Import");
		dialog.modal = true;
	}).then(function(/*cpr.data.DataSet*/idMap){		
	});
}


/*
 * 버튼(ACGRM_btnOEMType)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onACGRM_btnOEMTypeClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aCGRM_btnOEMType = e.control;
	if(ACGRM_oemVersion == OEM_NEC) {
		setAccessGroupInfoMapCode();
	}
}
function setAccessGroupInfoMapCode() {
	if (_editMode == "new") {
		dialogAlert(app, dataManager.getString("Str_Failed"), "출입그룹을 저장하시고 진행해 주세요. 아직 추가되지 않은 상태입니다.");	
		return;
	}
	
	//출입그룹 아이디
	var accessGroupID = app.lookup("AccessGroup").getValue("ID");
	//console.log(accessGroupID);
	app.getRootAppInstance().openDialog("app/custom/nec/accessGroupMapping", {width : 300, height : 250}, function(dialog){		
		dialog.headerTitle = "인사연동 출입그룹 맵핑정의"
		dialog.modal = true;
		dialog.initValue = {"accessGroupID":accessGroupID};
	}).then(function(returnValue){		
		console.log(returnValue);
	});
}
