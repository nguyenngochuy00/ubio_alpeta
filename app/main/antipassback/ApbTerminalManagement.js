/************************************************
 * locationTerminal.js
 * Created at 2019. 1. 30. 오후 3:20:46.
 *
 * @author osm8667
 ************************************************/
 var dataManager = getDataManager();
 var selectArea = null;
 var instanceCode = null;
var oem_version;

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	oem_version = dataManager.getOemVersion();
	if (oem_version == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH){
		app.lookup("grdTmlSelect").header.getColumn(1).bind("text").toLanguage("Str_ARMYHQ_TerminalLocation");
	}
	//data binding
	var terminalList = dataManager.getTerminalList();
	var targetDataSet = app.lookup("TerminalList");
	var isDone = false;
	if (oem_version == OEM_REMOTE_FAW_MANAGEMENT){ // 유사얼굴체크용 단말기는 제외
		isDone = terminalList.copyToDataSet(targetDataSet, "UseAuth != 1");
	} else {
		isDone = terminalList.copyToDataSet(targetDataSet);		
	}
	if(isDone){
		targetDataSet.commit();
	}
	//initValue
	var hostAppIns = app.getHostAppInstance();
	if(hostAppIns){
		/**
		 * @type JSON
		 */
		var data = app.getHostProperty("initValue");
	}

	instanceCode = data.code; //ent:입구, ext:출구

	var isDone = false;
	//APBList목록 copy
	/**
	 * @type cpr.data.DataSet
	 */
	var tmpList = data.antipass;
	var aPBList = app.lookup("APBList");
	isDone = tmpList.copyToDataSet(aPBList);
	//전달 받은 안티패스백 목록에서 전체 영역에서 등록되어있는 단말기 아이디 추출
	var tmlArr = [];
	aPBList.getRowDataRanged().forEach(function(/* cpr.data.RowConfigInfo */ each){
		tmlArr.push(each.TerminalID);
	});
	if(isDone){
		aPBList.commit();
		isDone = false;
	}
	//선택된 Area code
	selectArea = data.selectArea;
	if(instanceCode=="ent"){
		aPBList.setFilter("AreaIn=="+selectArea);
	}else{
		aPBList.setFilter("AreaOut=="+selectArea);
	}
	//구역 목록 copy
	/**
	 * @type cpr.data.DataSet
	 */
	var areas = data.areas;
	var areaList = app.lookup("dsAreas");
	isDone = areas.copyToDataSet(areaList);
	if(isDone){
		areaList.commit();
		areaList.setFilter("AreaID!="+selectArea);//선택한 구역은 안보이게 설정
		//태그생성
		aPBList.getRowDataRanged().forEach(function(/* cpr.data.RowConfigInfo */ row){
			var tNameRow = terminalList.findFirstRow("ID=="+row.TerminalID);
			var aNameRow = null;
			var rowArea = instanceCode=="ent"?row.AreaOut:row.AreaIn;
			if(rowArea){
				aNameRow = areaList.findFirstRow("AreaID=="+rowArea);
			}
			createTagArea(row.TerminalID, tNameRow.getValue("Name"), rowArea?rowArea:0
						, aNameRow==null?"unspecified":aNameRow.getValue("Name"), "true");
		});
		isDone = false;
	}
	//필터링 된 안티패스백 목록에서 해당 영역에서 등록되어있는 단말기 아이디 추출
	var thisTmlArr = [];
	aPBList.getRowDataRanged().forEach(function(/* cpr.data.RowConfigInfo */ each){
		thisTmlArr.push(each.TerminalID);
	});
	if(thisTmlArr.length>0){
		thisTmlArr.forEach(function(/* Object */ each){
			if(tmlArr.length>0){
				var delIndex = tmlArr.indexOf(each);
				if(delIndex>-1){
					tmlArr.splice(delIndex, 1);//등록된 단말기 전체 목록에서 해당 영역의 단말기를 제외
				}
			}
		});
	}
	if(tmlArr.length>0){//단말기 전체 목록에서 제거 (다른 영역에서 설정된 단말기 사용 불가하기 때문에)
		var grdTmlSelect = app.lookup("grdTmlSelect");
		tmlArr.forEach(function(/* Object */ each){
			var delRow = grdTmlSelect.findFirstRow("ID=="+each);
			grdTmlSelect.deleteRow(delRow.getIndex());
		});

	}

}


/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onGrdTmlSelectSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/**
	 * @type cpr.controls.Grid
	 */
	var grdTmlSelect = e.control;
	var grdAreaSelect = app.lookup("grdAreaSelect");
	grdAreaSelect.enabled = true;
	grdAreaSelect.clearSelection();
}


/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onGrdAreaSelectSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/**
	 * @type cpr.controls.Grid
	 */
	var grdAreaSelect = e.control;
	var selectRow = grdAreaSelect.getSelectedRow();
	if(!selectRow){
		return;
	}
	var areaID = selectRow.getValue("AreaID");
	var areaName = selectRow.getValue("Name");

	var grdTmlSelect = app.lookup("grdTmlSelect");
	var grdTmlSelectRow = grdTmlSelect.getSelectedRow();
	var parentID = 0;
	var parentName = null;
	if(grdTmlSelectRow){
		parentID = grdTmlSelectRow.getValue("ID");
		parentName = grdTmlSelectRow.getValue("Name");
	}

	//기존에 등록되어있는 항목이라면 업데이트, 아니면 생성
	var tmpList = app.lookup("APBList");
	var checkRow = tmpList.findFirstRow("TerminalID=="+parentID);
	if(checkRow){//update
		/**
		 * @type cpr.controls.Output
		 */
		var oTag = app.lookup("tag_" + parentID);
		var checkRowArea = instanceCode=="ent"?checkRow.getValue("AreaOut"):checkRow.getValue("AreaIn");
		if(checkRowArea!=areaID){
			/*데이터 업데이트*/
			checkRow.setValue(instanceCode=="ent"?"AreaOut":"AreaIn", areaID);
			checkRow.setValue("className", areaName);
			oTag.value = parentName + "\n" + areaName;
		}
	}else{//insert
		/*태그 삽입*/
		createTagArea(parentID, parentName, areaID, areaName, "false");

		/*안티패스백 리스트에 삽입*/
		var tmp = {};
		tmp.TerminalID = parentID;
		tmp.AreaIn = instanceCode=="ent"?selectArea:areaID;
		tmp.AreaOut =  instanceCode=="ent"?areaID:selectArea;
		tmp.SoftPassback = "false";
		tmp.className = areaName;
		tmpList.addRowData(tmp);
	}
}


/**
 * 태그를 생성한다.
 * @param {Number} terminalID
 * @param {String} terminalName
 * @param {Number} areaID
 * @param {String} areaName
 * @param {Boolean} isRegist DB저장된 항목 여부
 */
function createTagArea(terminalID, terminalName ,areaID, areaName, isRegist){
	var rootContainer = app.lookup("rootGroup");//최상위 그룹
	var displayContainer = app.lookup("workDisplay");
	if(!displayContainer){
		rootContainer.getLayout().insertColumns(["100px"]);
		displayContainer = new cpr.controls.Container("workDisplay");
		var vLayout = new cpr.controls.layouts.VerticalLayout();
		displayContainer.setLayout(vLayout);
	}
	//태그 및 삭제버튼 배치할 그룹생성
	var selectGroup = new cpr.controls.Container();
	selectGroup.style.css({
		"background-color" : areaID==0?"#ffc107":"#0078d7",
		"border-radius" : "5px 5px 5px 5px"
	});
	// Layout
	var selectLayout = new cpr.controls.layouts.FormLayout();
	selectLayout.setColumns(["70px", "1fr"]);
	selectLayout.setRows(["1fr"]);
	selectGroup.setLayout(selectLayout);
	(function(/*cpr.controls.Container*/container){
		//태그생성
		var selectOutput = new cpr.controls.Output("tag_" + terminalID);
		selectOutput.value = terminalName + "\n" +areaName;
		selectOutput.style.css({
			"color" : areaID==0?"#000080":"#ffffff",
			"text-align" : "center"
		});
		container.addChild(selectOutput, {
			"colIndex": 0,
			"rowIndex": 0
		});
		//삭제버튼생성
		var selectDelBtn = new cpr.controls.Button();
		selectDelBtn.value = "X";
		selectDelBtn.style.css({
			"background-color" : "transparent",
			"color" : areaID==0?"#000080":"#ffffff",
			"border" : "0px"
		});
		selectDelBtn.userAttr("TerminalID", terminalID.toString());
		selectDelBtn.userAttr("isRegist", isRegist);//DB에 등록이 된건지 아닌지 판단하여 활용
		//삭제버튼 이벤트
		selectDelBtn.addEventListener("click", onTagDeleteClick);
		container.addChild(selectDelBtn, {
			"colIndex": 1,
			"rowIndex": 0,
			"colSpan": 1,
			"rowSpan": 1,
			"horizontalAlign": "fill"
		});
	})(selectGroup);

	//적용 버튼 생성
	var applyButton = new cpr.controls.Button("btnApply");
	applyButton.bind("value").toLanguage("Str_Apply");//추후 다국어 연결
	applyButton.style.addClass("userInfo_btn");
	applyButton.addEventListener("click", onBtnApplyClick);
	/*적용 버튼 생성 end*/
	displayContainer.insertChild(displayContainer.getChildrenCount(), selectGroup, {
		"height" : "50px"
	});
	rootContainer.addChild(applyButton, {
		"colIndex": 2,
		"rowIndex": 0,
		"verticalAlign": "fill",
		"horizontalAlign":"fill"
	});
	rootContainer.addChild(displayContainer, {
		"colIndex": 2,
		"rowIndex": 1,
		"verticalAlign": "fill",
		"horizontalAlign":"fill"
	});
}


/*
 * "X" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTagDeleteClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var btnTagDelete = e.control;
	dialogConfirm(app, "", dataManager.getString("Str_DeleteConfirm"), function(/*cpr.controls.Dialog*/dialog){
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				var terminalID = parseInt(btnTagDelete.userAttr("TerminalID"));
				if(btnTagDelete.userAttr("isRegist") == "true"){//데이터베이스에 저장된 항목을 삭제할 경우
					var smsDelete = app.lookup("sms_deleteAntipassBack");
					smsDelete.action = "/v1/antiPassback?terminalID="+terminalID;
					smsDelete.send();
					smsDelete.addEventListenerOnce("submit-done", function(/* cpr.events.CSubmissionEvent */ e){
						/**
						 * @type cpr.protocols.Submission
						 */
						var sms_deleteAntipassBack = e.control;
						var resultMap = app.lookup("Result");
						var resultCode = resultMap.getValue("ResultCode");
						if(resultCode == 0){
							app.getHostAppInstance().callAppMethod("regenerateGrid", terminalID);
							dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_DeleteNotify"), "");
						}else{
							dialogAlert(app, dataManager.getString("Str_Fail"), dataManager.getString(getErrorString(resultCode)), "");
						}
					});
				}
				//데이터베이스에 저장하지 않고 등록 예정 항목을 삭제 할 경우 아래 로직만
				var aPBList = app.lookup("APBList");
				var delRow = aPBList.findFirstRow("TerminalID == " + terminalID);
				if(delRow){
					aPBList.realDeleteRow(delRow.getIndex());
				}
				var selectGroup = btnTagDelete.getParent();
				var rootParent = selectGroup.getParent();
				rootParent.removeChild(selectGroup);
				removeParent();
				app.lookup("grdTmlSelect").clearSelection();
				app.lookup("grdAreaSelect").clearSelection();
			}else{
				return;
			}
		});
	});
}


/*
 * "적용" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnApplyClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var btnApply = e.control;
	var aPBList = app.lookup("APBList");
	aPBList.clearFilter();
	var returnData = aPBList.getRowDataRanged();
	var validRow = aPBList.findFirstRow(instanceCode=="ent"?"!AreaOut":"!AreaIn");
	if(validRow){
		return;
	}
	//안티패스백 데이터 업데이트
	dialogConfirm(app, "", dataManager.getString("Str_SaveConfirm"), function(/*cpr.controls.Dialog*/dialog){
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				//서버에서 인식하지 못하는 컬럼  삭제
				aPBList.deleteColumn("className");
				var smsSave = app.lookup("sms_saveAntipassBack");
				smsSave.send();
				smsSave.addEventListenerOnce("submit-success", function(/* cpr.events.CSubmissionEvent */e){
					/**
					 * @type cpr.protocols.Submission
					 */
					var sms_saveAntipassBack = e.control;
					dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_SaveNotify"), "");
					app.close(returnData);
				});
			}else{
				return;
			}
		});
	});
}


/*
 * 태그 삭제 , 레이아웃변경
 */
function removeParent(){
	/**
	 * @type cpr.controls.Container
	 */
	var tagArea = app.lookup("workDisplay");
	var tagAreaParent = app.lookup("rootGroup");
	if(tagArea.getChildrenCount()==0){
		tagArea.dispose();
		//레이아웃 초기화
		var initLayout = new cpr.controls.layouts.FormLayout();
		initLayout.setColumns(["1fr", "150px"]);
		initLayout.setRows(["30px", "1fr"]);
		tagAreaParent.setLayout(initLayout);//최상위에서 태그 영역에 태그가 하나도 없으면 레이아웃을 변경해준다.
	}
}
