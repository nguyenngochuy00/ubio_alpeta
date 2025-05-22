/************************************************
 * TimeLine.js
 * Created at 2019. 1. 8. 오후 3:56:57.
 *
 * @author osm8667
 ************************************************/
 /**
 * @type cpr.core.AppInstance
 */
var rootApp = null;                     /*부모 앱 인스턴스 */
var tzUtil = null;                      /*TimelineManager.module*/
var timelineArr = [];                   /*생성한 타임라인 Array*/
var timeline = null;                    /*타임라인 객체*/
var dayOfWeek = ["Str_MonDay","Str_TuesDay","Str_Wednesday","Str_ThursDay","Str_FriDay"
,"Str_SaturDay","Str_SunDay","Str_Holiday3","휴일2","휴일3"]; /*요일 라벨값*/


/*
 * 쉘에서 init 이벤트 발생 시 호출.
 */
function onTimeShellInit(/* cpr.events.CUIEvent */ e){
	/**
	 * @type cpr.controls.UIControlShell
	 */
	var timeShell = e.control;
	if(timeline){
		e.preventDefault();
	}
}

/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onTimeShellLoad(/* cpr.events.CUIEvent */ e){
	/**
	 * @type cpr.controls.UIControlShell
	 */
	var timeShell = e.control;
	var oShell = e.content;
	if(!oShell){
		return;
	};
	oShell.innerHTML = '<div id="timezoneCtrlS">'
	  				 + '</div>';
}


/**
 * @see {@link http://visjs.org/}
 * 타임라인을 생성한다. (아이템 값은 없음. 기본 틀만 보이게)
 */
function makeTimeLine(id,index){
	//타임라인안에 위치할 아이템 설정
	var items =  new vis.DataSet({
		type: {start:"Date",end:"Date"}
	});
	//컨테이너 생성
	var instance = document.getElementById("timezoneCtrlS");
  	var container = document.createElement("div");
  	container.id = id;
  	if(index!=0){
	  	container.style.marginTop = "20px";// 타임라인 컨트롤 간의 간격 설정
  	}
  	instance.appendChild(container);
  	//타임라인의 범위 설정
  	var optStart = new Date();
  	var optEnd = new Date();
  	optStart.setTime(0-540*60000);//9시간 빼줌
  	optEnd.setTime(1439*60000-540*60000);
  	//타임라인의 옵션 프로퍼티와 타임라인에서 이루어지는 이벤트를 설정
  	var options = {
  		stack: false,
  		start: optStart,
  		end: optEnd,
  		min: optStart,
  		max: optEnd,
	    // allow selecting multiple items using ctrl+click, shift+click, or hold.
	    multiselect: false,
	    margin: {
	      item: {
	        horizontal: 0,
	        vertical: 0
	      },
	      axis: 0
	    },
	    height: "53px",
	    // allow manipulation of items
	    editable: false,
	    clickToUse: true,
	    showCurrentTime: false,
	    showMajorLabels: false
  	};
  	timeline = new vis.Timeline(container, items, options);
  	timelineArr.push(timeline);
}


/**
 * 요일별 라벨 컨트롤을 배치
 * @param {any} index 순번
 */
function makeLabels(index){
	//부모컨테이너
	var container = app.lookup("grpDayLabel");
	//버튼 컨테이너
	var subcontainer = new cpr.controls.Container();
	var layout = new cpr.controls.layouts.FormLayout();//폼 레이아웃에 꽉차게
	layout.setColumns(["1fr"]);
	layout.setRows(["1fr"]);
	subcontainer.setLayout(layout);
	//저장버튼
	var oLabel = new cpr.controls.Output();
	var value = dayOfWeek[index]?dayOfWeek[index]:dayOfWeek[dayOfWeek.length-1];
	oLabel.bind("value").toLanguage(value);//다국어 바인딩
	oLabel.style.css({
		"background-color" : "#f0f0f0",
		"text-align" : "center",
		"border": "1px solid"
	});
	subcontainer.addChild(oLabel, {
		"colIndex": 0,
		"rowIndex": 0,
		"horizontalAlign": "fill",
		"width": 70
	});
	//부모 컨테이너에 append
  	container.insertChild(index, subcontainer,{
		"height": "53px" // 타임라인의 높이의 중간에 위치할 수 있도록 height 설정
  	});
}


/**
 * 콤보박스를 넣을 영역에 콤보박스를 생성하고 selection-change 이벤트를 바인딩한다.
 * @param {any} index
 */
function makeComboBox(index){
	//부모컨테이너
	var container = app.lookup("grpTmCombo");//버티컬 레이아웃으로 구성된 그룹
	//버튼 컨테이너
	var subcontainer = new cpr.controls.Container();
	var layout = new cpr.controls.layouts.FormLayout();
	layout.setColumns(["1fr"]);
	layout.setRows(["1fr"]);
	subcontainer.setLayout(layout);
	//저장버튼
	var oCombo = new cpr.controls.ComboBox("tmCombo"+index);//요일별로 아이디를 다르게
	oCombo.placeholder = " ---- ";//선택한 항목이 없을 때 표시
	subcontainer.addChild(oCombo, {
		"colIndex": 0,
		"rowIndex": 0,
		"horizontalAlign": "fill",
		"verticalAlign": "middle",
		"width": 70
	});
	oCombo.addEventListener("selection-change", onTmComboSelectionChange);
	oCombo.userAttr("index", index.toString());
	//부모 컨테이너에 append
  	container.insertChild(index, subcontainer,{
  		"width": "120px",
		"height": "53px"
  	});
}




/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onTmComboSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/**
	 * @type cpr.controls.ComboBox
	 */
	var tmCombo = e.control;
	var index = tmCombo.userAttr("index");
//	var thisDom = document.getElementById("fixed"+index);
//	thisDom.style.backgroundColor = "#ffecaa";
	tzUtil.selectTzClear(index);
	tzUtil.addTmItem(index, tmCombo.value, rootApp.lookup("ValList"));
	var saveBtn = rootApp.lookup("btnTmSave");
	if(!saveBtn.enabled){
		saveBtn.enabled = true;
	}
}


/**
 * 타임라인 콤보박스의 선택값의 배열을 반환한다.
 */
exports.getValues = function(){
	var values = [];
	for(var i=0;i<8/*설정파라미터로..*/;i++){
		values.push(app.lookup("tmCombo"+i).value);
	}
	return values;
}


/**
 * 공휴일 콤보박스의 선택 값을 반환한다.(공휴일 늘어나면 위의 타임라인 콤보박스 배열처럼 구성하여 리턴)
 */
exports.getHolidayID = function(){
	return parseInt(app.lookup("cmbHolidays").value);
}


/**
 * 부모 app을 가져온다.
 */
exports.setRootApp = function(rApp){
	rootApp = rApp;
}


/**
 * 기본 타임라인을 생성한다.
 */
exports.setShlContent = function(){
	for(var i=0;i<8;i++){
		makeLabels(i);
  		makeComboBox(i);
		makeTimeLine("fixed"+i, i);
	}
}


/**
 * 타임라인 각 컨트롤들에 데이터를 바인딩한다.
 * @param {any} json 요일별 데이터
 * @param {cpr.data.DataSet} data 타임라인 데이터 ValList
 * @param {cpr.data.DataSet} comboData TimelineList
 * @param {String} holidayID
 * @param {cpr.data.DataSet} holidays HolidayList
 */
exports.setItems = function(json, /*cpr.data.DataSet*/data, /*cpr.data.DataSet*/comboData, holidayID,
				/*cpr.data.DataSet*/holidays){
	if(data.getRowCount()==0){return;}
	if(!json){
		var comboGrp = app.lookup("grpTmCombo");
		var childCnt = comboGrp.getChildrenCount();
		for(var i=0;i<childCnt;i++){
			/**
			 * @type cpr.controls.ComboBox
			 */
			var combo = app.lookup("tmCombo"+i);
			combo.clearSelection();
		}
		return;
	}
	for(var i=0;i<Object.keys(json).length;i++){
		/**
		 * @type cpr.controls.ComboBox
		 */
		var combo = app.lookup("tmCombo"+i);
		combo.setItemSet(comboData, {
			"label": "Name",
			"value": "TimelineID"
		});
	}
	tzUtil = createTzUtil(app, timelineArr, "N");//timelineManager 모듈 생성
	tzUtil.addTmList(json, data);//타임라인 아이템배치
	//공휴일 리스트
	if(holidayID){
		var holiRow = holidays.findFirstRow("HolidayID=="+holidayID);
		makeHoliday(holiRow);
	}
	//공휴일 콤보박스 생성
	var holidayCombo = app.lookup("cmbHolidays");
	holidayCombo.setItemSet(holidays, {
		label: "Name",
		value: "HolidayID"
	});
	if(holidayID!=0){
		holidayCombo.value = holidayID;
	}
	holidayCombo.addEventListener("selection-change", function(e){
		var cmbHolidays = e.control;
		var selectValue = cmbHolidays.value;
		if(selectValue){
			var selectRow = holidays.findFirstRow("HolidayID=="+selectValue);
			makeHoliday(selectRow);
		}
		var saveBtn = rootApp.lookup("btnTmSave");
		if(!saveBtn.enabled){
			saveBtn.enabled = true;
		}
	});
}


/**
 * 공휴일을 보여주는 output에 데이터를 재구성하여 입력한다.
 * @param {any} selectRow
 */
function makeHoliday(selectRow){
	var tempArr = [];
	if(selectRow){
		var optValue = selectRow.getValue("Holidays");
		var strArr = optValue.split(",");
		strArr.forEach(function(/* String */ each){
			var dateStr = " " + each.substr(0,2) + "/" + each.substr(2, 3) + " ";//받아온 값에 "/" 넣어 날짜로 표현
			tempArr.push(dateStr);
		});
	}
	var holidayOutput = app.lookup("optHolidays");
	var tempArrLength = tempArr.length;
	holidayOutput.value = tempArrLength==0?"":tempArr.toString();//지정된 컨트롤에 공휴일 값 입력
}


exports.getItems = function(){
	return timelineArr;
}


/**
 * 요일별 타임라인 및 공휴일의 콤보박스를 초기화한다.
 */
exports.clearCombos = function(){
	for(var i=0;i<8;i++){
		/**
		 * @type cpr.controls.ComboBox
		 */
		var combo = app.lookup("tmCombo"+i);
		combo.clearSelection();
	}
	var holidayCombo = app.lookup("cmbHolidays");
	holidayCombo.clearSelection();

	var holidayOutput = app.lookup("optHolidays");
	holidayOutput.value = "";
}