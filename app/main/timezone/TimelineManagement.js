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
	var valList = app.lookup("ValList");
	var timelineList = app.lookup("TimelineList");
	generateData(valList,timelineList);
}


/*
 * ValList 의 값을 TimelineID 별로 묶어 array로 넘긴다.
 */
function generateData(itemList,timeList){
	//ValList 에 Name 정보 set
	for(var i=0; i<itemList.getRowCount(); i++){
		var itemRow = itemList.getRow(i);
		var nameRow = timeList.findFirstRow("TimelineID==" + itemRow.getValue("TimelineID"));
		itemRow.setValue("Name", nameRow.getValue("Name"));
	}
	var allData = itemList.getRowDataRanged();
	var embTime = app.lookup("udcTimeline");
	//타임라인 아이디만 추출(중복제거)
	var timelineIDArr = [];
	allData.forEach(function(each){
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
}


/*
 * "저장" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnAllSaveClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var btnAllSave = e.control;

	var udcTimeline = app.lookup("udcTimeline");
	var timeLinearr = udcTimeline.getItems();
	if(timeLinearr.length==0){
		dialogAlert(app, "", dataManager.getString("Str_NoItemSave"), "");
		return;
	}
	var tmpCheck = true;
	timeLinearr.forEach(function(/* Object */ each){
		var row = each.itemsData;
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
				} else {
					return;
				}
			});
		});
	}
}


/*
 * 타임라인 객체 배열에서 데이터를 꺼내어 각 데이터셋, 맵에 set 이후 저장
 */
function allSave(){
	var embTime = app.lookup("udcTimeline");
	var items = embTime.getItems();
	var timelineInfo = app.lookup("TimelineInfo");
	var valList = app.lookup("ValList");
	var isOk = true;
	items.forEach(function(/* Object */ each, idx){
		var timelineID = each.dom.container.id;
		var timelineName = document.getElementById("tzInput" + each.dom.container.id).value;
		var row = each.itemsData;
		timelineInfo.setValue("TimelineID", parseInt(timelineID));
		timelineInfo.setValue("Name", timelineName);
		var newData = [];
		if(row){
			var rowIds = row.getIds();//오픈소스 함수, 아이디들 가져옴
			rowIds.forEach(function(ids,i){
				var dataJson = {};
				var getRowData = row.get(ids);
				var type = String(getRowData.inoutType);
				var ext = getRowData.authType;
				if(!type){
					dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TimelineDataNotSet"), null);
					isOk = false;
				}
				// start와 end는 milisecond 단위
				// 타임라인 컨트롤 안에서는 UTC 0인 상태. 컨트롤에서 값을 가져와 new Date로 객체를 만드는 순간 브라우저 UTC가 자동 반영되어 540을 더하고 있음.. 수정 필요.
				var start = new Date(getRowData.start.getTime()).setMinutes(getRowData.start.getMinutes());
				var end = new Date(getRowData.end.getTime()).setMinutes(getRowData.end.getMinutes());
				dataJson.TimelineID = parseInt(timelineID);
				dataJson.Type = parseInt(type);
				dataJson.ExtVal = ext;
				dataJson.StartTime = parseInt(start/60000 - new Date().getTimezoneOffset()); // 분단위로 변경  60*1000 +540( UTC 값 반영이라고 함)
				dataJson.EndTime = parseInt(end/60000 - new Date().getTimezoneOffset());
				newData.push(dataJson);
			});
			valList.build(newData,false);
		}
		if(isOk){ // TODO : 변경 리스트만 보내도록 수정 필요. 반복이 아닌 한번에 보내는 API 추가 필요. 실패 관련 처리 작업 추가 필요.
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
					dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_SaveNotify"), "");
					app.lookup("iptID").value = "";
					app.lookup("iptName").value = "";
					embTime.setIsSaved();
				}				
			});
		}
	});
}


/*
 * "검색" 버튼에서 click 이벤트 발생 시 호출.
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
		udcTime.initTimelines();//타임라인 초기화
		generateData(this.vallist(),this.timelist());//재생성 ;이하동일.
	},
	id: function() {
		this.timelist().setFilter("TimelineID *= " + this.searchValue());
		this.vallist().setFilter("TimelineID *= " + this.searchValue());
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
	    this.timelist().setFilter("Name *= " + this.searchValue());
	    this.vallist().setFilter("Name *= " + this.searchValue());
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


