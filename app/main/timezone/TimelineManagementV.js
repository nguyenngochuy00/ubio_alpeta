/************************************************
 * TimelineManagement.js
 * Created at 2019. 1. 8. 오후 2:39:32.
 *
 * @author osm8667
 ************************************************/
var dataManager = getDataManager();
var inputValidManager = createInputValidator(app);

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	//udc에 app 전달
	app.lookup("udcTimeline").setRootApp(app);

	var getList = app.lookup("getTimeMgmtList");
	getList.send();
	
	//20190827 정래훈 인풋에 값이 없으면 경고 표시를 주기위해 작성
	var iptID = app.lookup("iptID").value;
	if(!iptID){
		inputValidManager.validate(app.lookup("iptID"), "isNull", dataManager.getString("Str_RequiredAlert"));
	}
	var iptName = app.lookup("iptName").value;
	if(!iptName){
		inputValidManager.validate(app.lookup("iptName"), "isNull", dataManager.getString("Str_RequiredAlert"));
	}
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onGetTimeMgmtListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var getTimeMgmtList = e.control;
	var itemList = app.lookup("ValList");
	var timeList = app.lookup("TimelineList");
	generateData(itemList, timeList);
	
	// 저장 버튼 누르면 검색이 제대로 안되는 문제 해결위해 백업
	var valListBackup = app.lookup("ValListBackup");
	itemList.copyToDataSet(valListBackup);
}


/*
 * ValList 의 값을 TimelineID 별로 묶어 array로 넘긴다.
 */
function generateData(itemList,timeList){
	for(var i=0; i<itemList.getRowCount(); i++){
		var itemRow = itemList.getRow(i);
		var nameRow = timeList.findFirstRow("TimelineID==" + itemRow.getValue("TimelineID"));
		itemRow.setValue("Name", nameRow.getValue("Name"));
		itemRow.setValue("ExtVal", nameRow.getValue("Type"));
	}
	var allData = itemList.getRowDataRanged();
	var embTime = app.lookup("udcTimeline");
	//타임라인 아이디만 추출(중복제거)
	var timelineIDArr = [];
	allData.forEach(function(each){//locale 값만 필터링하여 배열 생성
		if(timelineIDArr.indexOf(each.TimelineID)==-1){
			timelineIDArr.push(each.TimelineID);
		}
	});
	//타임라인 아이디 별로 array에 담는다.(오픈소스 데이터구조에 맟주기 위해) [{},{},,,],[{},{},,,]
	var timelineData = [];
	timelineIDArr.forEach(function(/* Object */ each,index){
		var rows = [];
		var sorting = itemList.findAllRow("TimelineID=="+each);
		sorting.forEach(function(/* cpr.data.Row */ row){
			rows.push(row.getRowData());
		});
		timelineData[index] = rows;
	});
	embTime.setItems(timelineData);
}


/*
 * "+ 새 타임라인" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnNewTmClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var btnNewTm = e.control;
	var id = app.lookup("iptID").value;
	var name = app.lookup("iptName").value;

	var embTime = app.lookup("udcTimeline");
	var duplicateArr = [];
	embTime.getItems().forEach(function(/* Object */ each){
		duplicateArr.push(each.dom.container.id);
	});

	if(duplicateArr.indexOf(id)!=-1){
		app.lookup("iptID").value = "";
		inputValidManager.validate(app.lookup("iptID"), "isDuplicate", dataManager.getString("Str_DuplicateAlert"));
		return;
	}

	if(!id){
		inputValidManager.validate(app.lookup("iptID"), "isNull", dataManager.getString("Str_RequiredAlert"));
		return;
	}

	if(!name){
		inputValidManager.validate(app.lookup("iptName"), "isNull", dataManager.getString("Str_RequiredAlert"));
		return;
	}
	app.lookup("udcTimeline").setShlContent(id, name);
	inputValidManager.clearInput(app.lookup("iptID"));
	app.lookup("iptID").value = "";
	app.lookup("iptName").value = "";
	
	inputValidManager.validate(app.lookup("iptID"), "isNull", dataManager.getString("Str_RequiredAlert"));
	inputValidManager.validate(app.lookup("iptName"), "isNull", dataManager.getString("Str_RequiredAlert"));
}


/*
 * "저장" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnNSaveClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var btnNSave = e.control;

	var udcTimeline = app.lookup("udcTimeline");
	var arr = udcTimeline.getItems();
	if(arr.length==0){
		dialogAlert(app, "", dataManager.getString("Str_NoItemSave"), "");
		return;
	}
	var tmpCheck = true;
	arr.forEach(function(/* Object */ each){
		var row = each.itemsData;
		
		//19-07-16 정래훈 - 타임라인 출입상태를 각각 3개씩만 저장하는 기능을 구현 했으나, 출입상태가 new인 상태에서 저장하면 문열림 상태로
		// 				4개 이상 저장되어 버리는 현상이 발생하여 해당 사항을 막기위해 구현
		row.forEach(function(/* Object */ each){
			if(each.className == "yellow"){
				dialogAlert(app, "", dataManager.getString("Str_TimelineDataNotSet"), null);
				tmpCheck = false; // false값을 줘서 allSave로 넘어가지 못하게 한다.
			}
		});
		
		
		if(!row.length){
			dialogAlert(app, "", dataManager.getString("Str_NoTimelineItems"), null);
			tmpCheck = false;
		}
	});
	if(tmpCheck){
		dialogConfirm(app, "", dataManager.getString("Str_SaveConfirm"), function(/*cpr.controls.Dialog*/dialog){
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue) {
					allSave();
					BackupRead();
				} else {
					return;
				}
			});
		});
	}
}


function allSave(){
	var embTime = app.lookup("udcTimeline");
	var items = embTime.getItems();
	//items.group == 타입
	var timelineInfo = app.lookup("TimelineInfo");
	var valList = app.lookup("ValList");
	var timeLineList = app.lookup("TimelineList");
	var valListBackup = app.lookup("ValListBackup");
	
	items.forEach(function(/* Object */ each, idx){
		var timelineID = each.dom.container.id;
		var timelineName = document.getElementById("tzInput" + each.dom.container.id).value;
		var row = each.itemsData;
		timelineInfo.setValue("TimelineID", parseInt(timelineID));
		timelineInfo.setValue("Name", timelineName);
		
		var listRow = timeLineList.findFirstRow("TimelineID == "+timelineID);
		
		if(listRow != null){
			var listIdx = listRow.getIndex();
			timeLineList.setValue(listIdx, "Name", timelineName);
		}
		
		var newData = [];
		var rowIds = row.getIds();//오픈소스 함수, 아이디들 가져옴
		rowIds.forEach(function(ids,i){
			var dataJson = {};
			var getRowData = row.get(ids);
			var type = String(getRowData.inoutType); // 출입상태
			var ext = each.authType; // 인증방식 설정
			timelineInfo.setValue("Type", ext);
			if(!type){
				dialogAlert(app, "", dataManager.getString("Str_TimelineDataNotSet"), null);
				return;
			}
			var start = new Date(getRowData.start.getTime()).setMinutes(getRowData.start.getMinutes());
			var end = new Date(getRowData.end.getTime()).setMinutes(getRowData.end.getMinutes());
			
			dataJson.TimelineID = parseInt(timelineID);
			dataJson.Type = parseInt(type);
			dataJson.ExtVal = "";
			//dataJson.StartTime = parseInt(start/60000);
			//dataJson.EndTime = parseInt(end/60000);
			dataJson.StartTime = parseInt(getRowData.start.getHours()*60+getRowData.start.getMinutes());
			dataJson.EndTime = parseInt(getRowData.end.getHours()*60+getRowData.end.getMinutes());
			
			newData.push(dataJson);
			
		});
		
		valList.build(newData,false);
		if(listRow == null) { // 새로 추가한 timeline을   TimelineList 데이터셋에 추가해줘야 검색 가능
			timeLineList.addRowData(timelineInfo.getDatas());
			valListBackup.build(newData,true);
		}
		
		//로우 별 서브미션 객체 생성 후 통신 반복
		var submission = new cpr.protocols.Submission("saveTimeline");
		submission.action = "/v1/timezones/timelines";
		submission.mediaType = "application/json";
		submission.method = "PUT";
		submission.addRequestData(timelineInfo,"TimelineInfo");
		submission.addRequestData(valList,"ValList","all");
		submission.send();
		submission.addEventListenerOnce("submit-success", function(e){
			if(idx==items.length-1){
				//마지막 까지 저장후 초기화 및 저장완료 alert
				dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_SaveNotify"), "");
				app.lookup("iptID").value = "";
				app.lookup("iptName").value = "";
				embTime.setIsSaved();
				
				var target;
				if(dataManager.getSystemBrandType()==BRAND_VRIDI){target = DLG_TIMELINE_WEEKENDV;}
				else{target = DLG_TIMELINE_WEEKENDN;}
				
				var commandEvent = new cpr.events.CUIEvent("execute-command", {
					content: {
						"target": target,	
						"command": "TimeLineUpdate"						
					}
				});
				valList.clear();
				app.getHostAppInstance().dispatchEvent(commandEvent);
			}
		});
	});
}

/*
 * "" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnSearchTimeLineClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var btnSearchTimeLine = e.control;
	
	var cmbCategory = app.lookup("cmbCategory");
	var cmbCategoryValue = cmbCategory.value;
	//통신을 통한 search 가 아닌 조회된 항목 filtering
	BackupRead();
	
	var timeLineList = app.lookup("TimelineList");
	console.log("검색함");
	console.log(timeLineList.getRowDataRanged());
	searchModule[cmbCategoryValue]();
}


var searchModule = {
	timelist: function(){
		var timeList = app.lookup("TimelineList");
		return timeList;
	},
	vallist: function(){
		var valList = app.lookup("ValList");
		return valList;
	},
	searchValue: function(){
		var ipbSearch = app.lookup("ipbSearch");
		return ipbSearch.value;
	},
	all: function() {
		this.timelist().clearFilter();
		this.vallist().clearFilter();
		var udcTime = app.lookup("udcTimeline");
		udcTime.initTimelines();
		generateData(this.vallist(),this.timelist());
	},
	id: function() {
		this.timelist().setFilter("TimelineID *= '" + this.searchValue() +"'");
		this.vallist().setFilter("TimelineID *= '" + this.searchValue() +"'");
		if(this.timelist().getRowCount() == 0){
			dialogAlert(app, "", dataManager.getString("Str_NoSearchResult"), "");
			return;
		}else{
			var udcTime = app.lookup("udcTimeline");
			udcTime.initTimelines();
			generateData(this.vallist(),this.timelist());
		}
	},
	name: function() {
	    this.timelist().setFilter("Name *= '" + this.searchValue() +"'");
	    this.vallist().setFilter("Name *= '" + this.searchValue() +"'");
		if(this.timelist().getRowCount() == 0){
			dialogAlert(app, "", dataManager.getString("Str_NoSearchResult"), "");
			return;
		}else{
			var udcTime = app.lookup("udcTimeline");
			udcTime.initTimelines();
			generateData(this.vallist(),this.timelist());
		}
	},
	_default: function() {
	}
};

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmbCategorySelectionChange(/* cpr.events.CSelectionEvent */ e){
	/**
	 * @type cpr.controls.ComboBox
	 */
	var cmbCategory = e.control;
	var ipbSearch = app.lookup("ipbSearch");
	ipbSearch.value = "";
	if(cmbCategory.value == "all"){
		ipbSearch.enabled = false;
	}else{
		ipbSearch.enabled = true;
	}
}



/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onIptIDKeyup(/* cpr.events.CKeyboardEvent */ e){
	/**
	 * @type cpr.controls.InputBox
	 */
	var iptID = e.control;
	inputValidManager.dynamicValidate(iptID, iptID.displayText, app.lookup("TimelineList"), "TimelineID", "");
}


/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onIptNameKeyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var iptName = e.control;
	
	if(iptName.displayText != ""){
		inputValidManager.validate(app.lookup("iptName"), "isValid", "");
	}else{
		inputValidManager.validate(app.lookup("iptName"), "isNull", dataManager.getString("Str_RequiredAlert"));	
	}
}

// 저장 버튼 누르면 검색이 제대로 안되는 문제 해결위해 백업
function BackupRead(){
	var valList = app.lookup("ValList");
	var ValListBackup = app.lookup("ValListBackup");
	valList.clear();
	ValListBackup.copyToDataSet(valList);
}
// 타임라인 삭제 시 화면에서도 삭제
exports.deleteTimeline = function(btnRefID){
	var timelineList = app.lookup("TimelineList");
	var valListBackup = app.lookup("ValListBackup");
	timelineList.realDeleteRow(timelineList.findFirstRow("TimelineID == " + btnRefID).getIndex());
	var arr = valListBackup.findAllRow("TimelineID == " + btnRefID);
	arr.forEach(function(each){
		valListBackup.realDeleteRow(each.getIndex());
	});

}

/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onHelpIconClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Image
	 */
	var helpIcon = e.control;
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target": DLG_HELP,
			"ID": menu_id
		}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}
