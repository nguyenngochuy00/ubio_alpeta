/************************************************
 * antipassbackManagement.js
 * Created at 2022. 11. 28. 오전 10:26:58.
 *
 * @author zxc
 ************************************************/
var locale = "";
var dataManager = getDataManager();
var usint_version;

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	app.lookup("APBMAM_optInDesc").bind("value").toLanguage("Str_NoSelectionZone");
	app.lookup("APBMAM_optOutDesc").bind("value").toLanguage("Str_NoSelectionZone");
	
	usint_version = dataManager.getSystemVersion();
	var smsGetAreas = app.lookup("sms_getAreas");
	smsGetAreas.send();
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms_getAreasSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getAreas = e.control;
	if(app.lookup("AreaList").getRowCount()>0){
		var smsGetAntipassBack = app.lookup("sms_getAntipassBack");
		smsGetAntipassBack.send();
	}
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms_getAntipassBackSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getAntipassBack = e.control;
	initData();
}

/**
 * 입구, 출구그리드의 데이터셋을 초기화한다.
 */
function initData(){
	var entList = app.lookup("tmpEntranceList");
	var extList = app.lookup("tmpExitList");

	entList.clear();
	extList.clear();

	var apbList = app.lookup("AntipassBack");
	if(apbList.getRowCount()==0){
		return;
	}
	var areaList = app.lookup("AreaList");
	for(var i=0;i<areaList.getRowCount();i++){
		var areaID = areaList.getValue(i, "AreaID");
		var inRows = apbList.findAllRow("AreaIn=="+areaID);
		if(inRows.length>0){
			makeData(areaList, inRows, "AreaOut", "tmpEntranceList");
		}
		var outRows = apbList.findAllRow("AreaOut=="+areaID);
		if(outRows.length>0){
			makeData(areaList, outRows, "AreaIn", "tmpExitList");
		}
	}
}

/**
 * 안티패스백 데이터를 in out에 맞추어 나눈다.
 * @param areas AreaList
 * @param rows 입출구 안티패스백 데이터 로우
 * @param inoutVal AreaOut 또는 AreaIn
 * @param inoutList 저장할 입출구 데이터셋 이름
 */
function makeData(/*cpr.data.DataSet*/areas, /*Row[]*/rows, inoutVal, inoutList){
	rows.forEach(function(/* cpr.data.Row */ each, idx){
		var value = each.getValue(inoutVal);
//		var exp = value?"url('/theme/images/notifier_success.png')":"url('/theme/images/notifier_danger.png')";
//		var optStatus = app.lookup("optStatus");
//		optStatus.style.bind("background-image").toExpression(exp);
		if(value){
			var nameRow = areas.findFirstRow("AreaID==" + value);
			each.setValue("className", nameRow.getValue("Name"));//그리드 그룹 헤더 명칭
		}
		/**
		 * @type cpr.data.DataSet
		 */
		var tmpList = app.lookup(inoutList);
		tmpList.addRowData(each.getRowData());
		tmpList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	});
}

/*
 * "입구단말추가" 및 "출구단말추가" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnAddTmlClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var btnAddTml = e.control;

	var grdAreas = app.lookup("APBMAM_grdAreas");
	var selectAreaRow = grdAreas.getSelectedRow();
	if(!selectAreaRow){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "구역을 선택해 주세요.", "");
		return;
	}

	var option = {
		width : 500,
		height : 500
//		right: app.getContainer().getActualRect().left/4
	};
	/**
	 * @type cpr.data.Row[]
	 */
	var result = [];
	var tmpEntranceList = app.lookup("tmpEntranceList");
	var tmpExitList = app.lookup("tmpExitList");
	var code = btnAddTml.userAttr("code"); //입구단말추가 or 출구단말추가 구분코드 ent:입구, ext:출구
	var appld = "app/main/antipassback/ApbTerminalManagement" + "?" + usint_version;
	app.openDialog(appld, option, function(dialog){
		if(code=="ent"){//코드에 따른 헤더 다국어 바인딩 변경
			dialog.bind("headerTitle").toLanguage("Str_AddEnterTerminal");
		}else{
			dialog.bind("headerTitle").toLanguage("Str_AddExitTerminal");
		}
		dialog.style.header.css("background-color", "#528443");
		dialog.modal = true;
		/*
		 * code : 입출구구분코드, tmp : 입출구구분코드에 따른 입출구 안티패스백 데이터셋, selectArea: 현재 사이드 그리드에서 선택된 구역의 ID값, areas: 구역목록데이터셋
		 * antipass: 안티패스백 데이터셋
		 */
		dialog.initValue = {code: code, tmp: code=="ent"?tmpEntranceList:tmpExitList, selectArea: selectAreaRow.getValue("AreaID"),
							areas: app.lookup("AreaList"), antipass: app.lookup("AntipassBack")};
		dialog.addEventListenerOnce("close", function(e){
			result = dialog.returnValue;
			if(result){
				var antiList = app.lookup("AntipassBack");
				var addedCount = antiList.build(result, false);
				if(addedCount!=0){
					initData();
					var entGrid = app.lookup("APBMAM_grdEntrance");
					var extGrid = app.lookup("APBMAM_grdExit");
					entGrid.setFilter("AreaIn=="+selectAreaRow.getValue("AreaID"));
					extGrid.setFilter("AreaOut=="+selectAreaRow.getValue("AreaID"));
					updateDescription();
				}
			}
		});
	});
}


/**
 * 단말기 정보 삭제 후 그리드 redraw
 * @param result
 */
exports.regenerateGrid = function(result){
	var grdAreas = app.lookup("APBMAM_grdAreas");
	var selectAreaRow = grdAreas.getSelectedRow();
	var antiList = app.lookup("AntipassBack");
	var row = antiList.findFirstRow("TerminalID=="+result);
	var addedCount = antiList.realDeleteRow(row.getIndex());
	initData();
	var entGrid = app.lookup("APBMAM_grdEntrance");
	var extGrid = app.lookup("APBMAM_grdExit");
	entGrid.setFilter("AreaIn=="+selectAreaRow.getValue("AreaID"));
	extGrid.setFilter("AreaOut=="+selectAreaRow.getValue("AreaID"));
	updateDescription();
}


/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onGrdAreasSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var grdAreas = e.control;
	var grdAreas = e.control;
	var selectRow = grdAreas.getSelectedRow();
	var areaID = selectRow.getValue("AreaID");
	var entGrid = app.lookup("APBMAM_grdEntrance");
	if(!entGrid.visible){
		entGrid.visible = true;
	}
	var extGrid = app.lookup("APBMAM_grdExit");
	if(!extGrid.visible){
		extGrid.visible = true;
	}
	entGrid.setFilter("AreaIn=="+areaID);
	extGrid.setFilter("AreaOut=="+areaID);
	updateDescription();
}

/**
 * 구역 별 설명을 업데이트한다.
 */
function updateDescription(){
	var entGrid = app.lookup("APBMAM_grdEntrance");
	var extGrid = app.lookup("APBMAM_grdExit");
	var inOpt = app.lookup("APBMAM_optInDesc");
	var outOpt = app.lookup("APBMAM_optOutDesc");
	var dmOptInOutValue = app.lookup("optInOutValue");
	dmOptInOutValue.clear();
	//inOpt.value = "";
	//outOpt.value = "";
	var inTerminalCount = entGrid.getRowCount()==0?0:entGrid.getRowCount();
	var outTerminalCount = extGrid.getRowCount()==0?0:extGrid.getRowCount();

	if(!locale){
		locale = dataManager.getLocale();
	}
	var select = app.lookup("APBMAM_grdAreas").getSelectedRow().getValue("AreaID");
	if(locale=="en"){
		var inOptValue = "This area can be entered via '" + getInAreaLength() + "' terminals in '" + inTerminalCount + "' area.";
		var outOptValue = "This area can be moved out to '" + outTerminalCount + "' area via '" + getOutAreaLength() + "' terminal.";
		dmOptInOutValue.setValue("optInDesc", inOptValue);
		dmOptInOutValue.setValue("optOutDesc", outOptValue);
		inOpt.bind("value").toDataMap(dmOptInOutValue, "optInDesc");
		outOpt.bind("value").toDataMap(dmOptInOutValue, "optOutDesc");
		
	}else if(locale=="ko"){
		var inOptValue = "이 구역은 " + getInAreaLength() + " 개 의  구역에서 " + inTerminalCount + " 개 의 단말을 통해 들어올 수 있습니다.";
		var outOptValue = "이 구역은 " + outTerminalCount + " 개 의  단말을 통해 " + getOutAreaLength() + " 개 의 구역으로 나갈 수 있습니다.";
		dmOptInOutValue.setValue("optInDesc", inOptValue);
		dmOptInOutValue.setValue("optOutDesc", outOptValue);
		inOpt.bind("value").toDataMap(dmOptInOutValue, "optInDesc");
		outOpt.bind("value").toDataMap(dmOptInOutValue, "optOutDesc");
		
		//inOpt.value = 
		//outOpt.value = 

	}else{//다른 언어 이어서 (jp 등등)

	}
	inOpt.redraw();
		outOpt.redraw();
}


/*
 * 입구 데이터 길이 계산
 */
function getInAreaLength(){
	var select = app.lookup("APBMAM_grdAreas").getSelectedRow().getValue("AreaID");
	var areaNames = [];
	var findRows = app.lookup("tmpEntranceList").findAllRow("AreaIn=="+parseInt(select));
	if(findRows){
		for(var i=0;i<findRows.length;i++){
			if(areaNames.indexOf(findRows[i].getValue("AreaOut"))==-1){
				areaNames.push(findRows[i].getValue("AreaOut"));
			}
		}
	}
	return areaNames.length;
}


/*
 * 출구 데이터 길이 계산
 */
function getOutAreaLength(){
	var select = app.lookup("APBMAM_grdAreas").getSelectedRow().getValue("AreaID");
	var areaNames = [];
	var findRows = app.lookup("tmpExitList").findAllRow("AreaOut=="+parseInt(select));
	if(findRows){
		for(var i=0;i<findRows.length;i++){
			if(areaNames.indexOf(findRows[i].getValue("AreaIn"))==-1){
				areaNames.push(findRows[i].getValue("AreaIn"));
			}
		}
	}
	return areaNames.length;
}

/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onGrdEntranceSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var grdEntrance = e.control;
	var selectRow = grdEntrance.getSelectedRow();
	if(selectRow){
		var selectOutValue = selectRow.getValue("AreaOut");
	}
}


/*
 * 버튼(btnAddArea)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnAddAreaClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnAddArea = e.control;
	var result = null;
	var that = app;
	var appld = "app/main/antipassback/AreaSelect" + "?" + usint_version;
	app.openDialog(appld, {width : 300, height : 170}, function(dialog){
		dialog.bind("headerTitle").toLanguage("Str_AddZone");
		dialog.style.header.css("background-color", "#528443");
		dialog.initValue = "an";
		dialog.resizable = false;
		dialog.addEventListenerOnce("close", function(e){
			result = dialog.returnValue;
			if(result){
				var grdAreas = that.lookup("APBMAM_grdAreas");
				grdAreas.insertRowData(grdAreas.getRowCount(), true, {AreaID:result.id, Name:result.name});
				grdAreas.selectRows(grdAreas.getRowCount()-1);
			}
		})
	});
}


/*
 * 버튼(btnDelArea)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnDelAreaClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnDelArea = e.control;
	var grdAreas = app.lookup("APBMAM_grdAreas");
	var selectRow = grdAreas.getSelectedRow();
	if(!selectRow){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedItem"), "");
		return;
	}
	var selectRowID = selectRow.getValue("AreaID");

	if(selectRowID == 1){//반드시 외부영역은 존재해야 하므로 예외처리
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_APBExternalValid"), "");
		return;
	}

	var rowStatus = selectRow.getStateString();
	dialogConfirmAMHQ(app, "", dataManager.getString("Str_DeleteConfirm"), function(/*cpr.controls.Dialog*/dialog){
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
								
				var smsDelete = app.lookup("sms_deleteArea");
				smsDelete.action = "/v1/antiPassback/areas/" + selectRowID;
				smsDelete.setParameters("id", selectRowID);
				smsDelete.send();
				
			} else {
				return;
			}
		});
	});
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms_deleteAreaSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_deleteArea = e.control;
	var areaID = sms_deleteArea.getParameters("id");
	var dsAreaList = app.lookup("AreaList");
	var areaInfo = dsAreaList.findFirstRow("AreaID=="+areaID);
	if( areaInfo ){
		dsAreaList.deleteRow(areaInfo.getIndex());
	}
	//var grdAreas = app.lookup("grdAreas");
	//grdAreas.redraw();
	dialogAlertAMHQ(app, dataManager.getString("Str_Info"), dataManager.getString("Str_DeleteNotify"), "");
}


/*
 * 루트 컨테이너에서 contextmenu 이벤트 발생 시 호출.
 * 마우스의 오른쪽 버튼이 클릭되거나 컨텍스트 메뉴 키가 눌려지면 호출되는 이벤트.
 */
function onBodyContextmenu(/* cpr.events.CMouseEvent */ e){
	e.preventDefault();
}




/*
 * 루트 컨테이너에서 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(/* cpr.events.CEvent */ e){
	cpr.core.NotificationCenter.INSTANCE.subscribe("antipass", app, function(payload){
		locale = payload;
		if(app.lookup("APBMAM_grdAreas").getSelectedRow()){
			updateDescription();
		}
	});
}


/*
 * 루트 컨테이너에서 dispose 이벤트 발생 시 호출.
 * 컨트롤이 dispose될 때 호출되는 이벤트.
 */
function onBodyDispose(/* cpr.events.CEvent */ e){
	//다국어 변경 시 호출되었던 이벤트 리스너를 삭제
	cpr.core.NotificationCenter.INSTANCE.unsubscribe(app, "antipass");
}


/*
 * 버튼(btnClear)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnClearClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnClear = e.control;
	var grdAreas = app.lookup("APBMAM_grdAreas");	
	var selectRow = grdAreas.getSelectedRow();
	if(!selectRow){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedItem"), "");
		return;
	}
	if( selectRow.getValue("AreaID") == 1 ){
		return;
	}
	var entGrid = app.lookup("APBMAM_grdEntrance");
	var extGrid = app.lookup("APBMAM_grdExit");
	if(entGrid.getRowCount()==0 && extGrid.getRowCount()==0){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSearchResult"), "");
		return;
	}
	dialogConfirmAMHQ(app, "", dataManager.getString("Str_ClearConfirm"), function(/*cpr.controls.Dialog*/dialog){
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				var smsClear = app.lookup("sms_clearArea");
				smsClear.action = "/v1/antiPassback/areas/" + selectRow.getValue("AreaID");
				smsClear.send();
			}else{
				return;
			}
		});
	});
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_clearAreaSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_clearArea = e.control;
	var resultMap = app.lookup("Result");
	var resultCode = resultMap.getValue("ResultCode");
	if(resultCode == COMERROR_NONE){
		var grdAreas = app.lookup("APBMAM_grdAreas");
		var selectRow = grdAreas.getSelectedRow();
		var dsAntipassBack = app.lookup("AntipassBack");

		var deleteRows = dsAntipassBack.findAllRow("AreaIn=="+selectRow.getValue("AreaID")+"||AreaOut=="+selectRow.getValue("AreaID"));
		deleteRows.forEach(function(each){
			dsAntipassBack.deleteRow(each.getIndex());
		});
		dsAntipassBack.commit();

		initData();
		var entGrid = app.lookup("APBMAM_grdEntrance");
		var extGrid = app.lookup("APBMAM_grdExit");
		entGrid.setFilter("AreaIn=="+selectRow.getValue("AreaID"));
		extGrid.setFilter("AreaOut=="+selectRow.getValue("AreaID"));
		updateDescription();
		grdAreas.clearSelection(false);
		dialogAlertAMHQ(app, dataManager.getString("Str_Info"), dataManager.getString("Str_ClearNotify"), "");
	}else{
		//dialogAlertAMHQ(app, "", dataManager.getString("Str_APBAreaClearFailed"), "");
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString(getErrorString(resultCode)), "");
	}
}


/*
 * 버튼(btnValidCheck)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnValidCheckClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnValidCheck = e.control;
	var dsAntipassBack = app.lookup("AntipassBack");
	if(dsAntipassBack.getRowCount()==0){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSearchResult"), "");
		return;
	}
	var smsCheck = app.lookup("smsValidCheck");
	smsCheck.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsValidCheckSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsValidCheck = e.control;
	var resultMap = app.lookup("Result");
	var resultCode = resultMap.getValue("ResultCode");
	if(resultCode != COMERROR_NONE){
		var aPBStatusInfo = app.lookup("APBStatusInfo");
		var validStatus = aPBStatusInfo.getValue("status");
		var validResult = switchModule[validStatus]();
		if(validResult!=""){

			var dialogStr = "";
			if( validStatus == 3 ){
				var dsAreaList = app.lookup("AreaList");
				var area = dsAreaList.findFirstRow("AreaID == "+aPBStatusInfo.getValue("AreaIn"));
				 dialogStr = dataManager.getString("Str_Zone")+" : " + area.getValue("Name")+"\n";
				 dialogStr = dialogStr + dataManager.getString("Str_TerminalID")+ " : " + aPBStatusInfo.getValue("terminalID")+"\n";
			}else if( validStatus == 4 ){
				var dsAreaList = app.lookup("AreaList");
				var area = dsAreaList.findFirstRow("AreaID == "+aPBStatusInfo.getValue("AreaOut"));
				 dialogStr = dataManager.getString("Str_Zone")+" : " + area.getValue("Name")+"\n";
				 dialogStr = dialogStr + dataManager.getString("Str_TerminalID")+ " : " + aPBStatusInfo.getValue("terminalID")+"\n";
			}

			dialogStr = dialogStr + validResult;
			dialogAlertAMHQ(app, dataManager.getString("Str_Info"), dialogStr, "");
			return;
		}else{
			dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_APBValidationSuccess"), "");
		}
	}else{
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_APBValidationSuccess"));
	}
}

/**
 * 유효성검사 결과 메세지
 */
var switchModule = {
	0: function(){
		return "";
	},
	1: function(){
		return dataManager.getString("Str_APBStatusInvalidSetInOut");/*"APBStatusInvalidSetInOut"*/;
	},
	2: function(){
		return dataManager.getString("Str_APBStatusInOutSame");
	},
	3: function(){
		return dataManager.getString("Str_APBStatusInNoFair");
	},
	4: function(){
		return dataManager.getString("Str_APBStatusOutNoFair");
	},
	_default: function() {
	}
}
