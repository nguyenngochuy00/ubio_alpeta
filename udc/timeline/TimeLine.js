/************************************************
 * TimeLine.js
 * Created at 2019. 1. 8. 오후 3:56:57.
 *
 * @author osm8667
 ************************************************/
/**
 * @type cpr.core.AppInstance
 */
var rootApp = null;                                 /*부모 앱*/
var timelineArr = [];                               /*생성된 타임라인 객체 배열*/
var timeline = null;                                /*타임라인 객체*/
var timelineID = null;                              /*타임라인아이디*/
var selectedItem = null;                            /*선택한 타임라인 아이템*/
var selectedTimeline = null;                        /*선택한 타임라인*/
var content = ["","ACCESS","DENIED","AuthZone"];    /*타임라인 아이템 라벨*/
var clssName = ["","green","red","orange","blue"];  /*타임라인 아이템 색상*/
var isSaved = false;                                /*저장된 데이터 여부*/

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
	oShell.innerHTML = '<div id="timezoneCtrl"></div>';
}


/**
 * @see {@link http://visjs.org/}
 * 타임라인을 생성한다.
 */
function makeTimeLine(/*Array*/info, isList){

	//타임라인안에 위치할 아이템 설정
	var items =  new vis.DataSet({
		type: {start:"Date",end:"Date"} // 아이템의 타입 지정 가능
	});
	if(isList){//리스트에서 가져온 데이터인지 판별
		for(var i=0;i<info.length;i++){
			var startDate = new Date(1970,0,1,info[i].StartTime/60,info[i].StartTime%60,0);
			var endDate = new Date(1970,0,1,info[i].EndTime/60,info[i].EndTime%60,0);
			items.add([
			    {
				    id: "item" + info[i].TimelineID + info[i].Type + i,
				    content: content[info[i].Type],
				    start: startDate,
				    end: endDate,
				    className: clssName[info[i].Type],
				    inoutType: info[i].Type,
				    authType: info[i].ExtVal
		    	}
	  		]);
  		}
	}
	//컨테이너 생성
	var instance = document.getElementById("timezoneCtrl");
	/*label*/
	var labelDiv = document.createElement('div');
	labelDiv.id = "label"+info[0].TimelineID;
	labelDiv.style.height = "25px";
	var label = document.createElement('label');
	label.style.fontSize = "15px";
	label.style.fontWeight = "bold";
	label.textContent = 'ID : ' + info[0].TimelineID + ', ' + 'Name : ';
	var input = document.createElement('input');
	input.id = "tzInput" + info[0].TimelineID;
	input.setAttribute("required", "required");
	input.value = info[0].Name;
	label.appendChild(input);
	labelDiv.appendChild(label);
	instance.appendChild(labelDiv);
	/*timeline*/
  	var container = document.createElement('div');
  	container.id = info[0].TimelineID;//컨테이너의 아이디
  	container.style.marginTop = "5px";
  	container.style.marginBottom = "15px";
  	var deleteButton = document.createElement('button');
  	deleteButton.id = "btnDel_" + container.id;
  	deleteButton.textContent = "X";
  	deleteButton.className = "custom-delete-button";
  	deleteButton.setAttribute("data-container-id", container.id); //삭제 대상 컨테이너 아이디
  	deleteButton.setAttribute("data-flag-isList", isList.toString()); // 저장되어있는 데이터인지 여부
  	deleteButton.addEventListener("click", onBtnDeleteClick);
  	container.appendChild(deleteButton);
  	instance.appendChild(container);
  	//타임라인의 범위 설정
  	var optStart = new Date();
  	var optEnd = new Date();
  	optStart.setTime(0+new Date().getTimezoneOffset()*60000);//9시간 빼줌
  	optEnd.setTime(1439*60000+new Date().getTimezoneOffset()*60000);
  	//타임라인의 옵션 프로퍼티와 타임라인에서 이루어지는 이벤트를 설정
  	var options = {
  		stack: false,
  		start: optStart,
  		end: optEnd,
  		min: optStart,
  		max: optEnd,
  		zoomMax : 86399999,
  		zoomMin : 360000*5,
	    // allow selecting multiple items using ctrl+click, shift+click, or hold.
	    multiselect: false,
	    margin: {
	      item: {
	        horizontal: 0,
	        vertical: 0
	      },
	      axis: 0
	    },
	    height: "55px",
	    // allow manipulation of items
	    editable: true,
	    //클릭 시 활성화
	    clickToUse: true,
	    showCurrentTime: false,
	    showMajorLabels: false,
	    onAdd: function(obj){
	    	var end = new Date(obj.start.getTime()).setMinutes(obj.start.getMinutes() + 60);
	    	obj.end = new Date(end);
	    	var hasItems = checkHasItems(items, obj);
	    	if(!hasItems){
//	    		obj.id = "new"+obj.start;
		    	obj.content = "NEW";
		    	obj.inoutType = null;
		    	obj.authType = null;
		    	items.add(obj);
	    	}
	    },
	    onMove: function(item, handler){
	    	var hasItems = checkHasItems(items, item);
	    	item.content = content[item.inoutType];
	    	if(hasItems){
		    	handler(null);
	    	}else{
	    		handler(item);
	    	}
	    	//마우스 드래그 시 제약 조건 작성
	    	//handler(null) 일 경우 원래 위치로 돌아온다.
		},
	    onMoving: function(item, handler){
			//제약조건
			if (item.start < optStart) item.start = optStart;
		    if (item.start > optEnd) item.start = optEnd;
		    if (item.end   > optEnd) item.end   = optEnd;
		    //툴팁효과생성
		    var sHour = item.start.getHours()<10?"0"+item.start.getHours():item.start.getHours();
		    var sMin = item.start.getMinutes()<10?"0"+item.start.getMinutes():item.start.getMinutes();
		    var eHour = item.end.getHours()<10?"0"+item.end.getHours():item.end.getHours();
		    var eMin = item.end.getMinutes()<10?"0"+item.end.getMinutes():item.end.getMinutes();
		    item.content = content[item.inoutType];
		    if(parseInt(sHour)<2){
		    	item.content = "<li style='color: white;white-space:word-break;'>"+"START: " + sHour + ":"+ sMin + ", END: " + eHour + ":" + eMin+"</li>";
		    }
		    handler(item); // send back the (possibly) changed item
		},
		onRemove: function (item, handler) {
			var dataManager = getDataManager();
			dialogConfirm(rootApp, "", dataManager.getString("Str_DeleteConfirm"), function(/*cpr.controls.Dialog*/dialog){
				dialog.addEventListenerOnce("close", function(e) {
					if (dialog.returnValue) {
						handler(item);
					} else {
						handler(null);
						return;
					}
				});
			});
		}
  	};
  	//타임라인 아이템 움직일때 시간 표시
  	var options1 = jQuery.extend(options, {
    	tooltipOnItemUpdateTime: {
	      template: function(item) {
	      	var sHour = item.start.getHours()<10?"0"+item.start.getHours():item.start.getHours();
	      	var sMin = item.start.getMinutes()<10?"0"+item.start.getMinutes():item.start.getMinutes();
	      	var eHour = item.end.getHours()<10?"0"+item.end.getHours():item.end.getHours();
	      	var eMin = item.end.getMinutes()<10?"0"+item.end.getMinutes():item.end.getMinutes();
	      	var str = "START: " + sHour + ":"+ sMin + ", END: " + eHour + ":" + eMin;
	        return str;
	      }
	    }
  	});
  	timeline = new vis.Timeline(container, items, null, options1);//(타임라인 객체의 dom, 타임라인 아이템, 그룹, 옵션)
  	timeline.on("select", function(prop){
  		var evt = prop.event;
  		var targetParent = evt.target.parentElement;
  		if(!targetParent){
  			return;
  		}
  		timelineID = container.id;//타임라인의 아이디를 가져온다.
  		selectedItem = this.getSelection()[0];
  		selectedTimeline = this;
		var pChildren = targetParent.parentElement.innerHTML;
		if(pChildren.indexOf("vis-delete")!=-1){//아이템이 선택된 상태(삭제버튼유무)
			disposeOption(container);
			makeOptions(container);
			var getSelectedData = items.get(this.getSelection()[0]);
			var inoutType = getSelectedData.inoutType;
			var cbxInOutType = document.getElementById("cbxInOutType");
			cbxInOutType.value = inoutType;
			setDisable(inoutType);
			var str = getSelectedData.authType;
			if(str){
				var strArr = str.split(",");
				var authType = [];
				strArr.forEach(function(str,i){
					if(i!=0){
						authType.push(str);
					}
				});
				bindOptions(strArr[0], authType.toString());
			}
		}
  	});
  	timeline.on("mouseDown", function(prop){
  		if(prop.item==null){
  			disposeOptions(container);
  			timelineArr.forEach(function(/* Object */ each){
  				each.setSelection([]);
  			});
  		}
  	});
  	timelineArr.push(timeline);
}


/*
 * 추가할 타임객체 validation 체크
 */
function checkHasItems(target, newObj){
	var hasBool = false;
	target.forEach(function(each){
		if(each.id==newObj.id){
			return false;
		}
		if(each.start.getTime()<newObj.start.getTime()&&newObj.start.getTime()<each.end.getTime()){
			hasBool = true;
		}
		if(each.start.getTime()>newObj.start.getTime()&&newObj.end.getTime()>each.start.getTime()){
			hasBool = true;
		}
	});
	return hasBool;
}
//Str_SetAccessStat

/**
 * 각 설정레이아웃을 생성한다.
 * @param layout
 * @param code
 */
function makeOptions(layout){
//	dataManager.getString("Str_SetAccessStat")
	var dataManager = getDataManager();
	var optionDiv = document.createElement("div");
	optionDiv.id = "divOpt" + layout.id;
	optionDiv.style.height = "90px";
	optionDiv.style.width = "98%";
	optionDiv.style.padding = "5px";
	//테이블 스타일 : custom_timeslider.less
	optionDiv.innerHTML = '<table class="tftable" border="1">'
                        + '<tr><td>'+dataManager.getString("Str_SetAccessStat")+'</td>'
                        + '<td>'
                        + '<select id="cbxInOutType" style="width:200px;height:35px;">'
                        + '<option value="1">문열림</option>'
                        + '<option value="2">허용불가</option>'
                        + '<option value="3">인증타임존</option>'
                        + '</select></td><td colspan="2"></td></tr>'
                        + '<tr><td>'+dataManager.getString("Str_SetAuthType")+'</td>'
                        + '<td style="width:210px;">'
                        + '<select id="cbxAuthType" style="width:200px;height:35px;" disabled="disabled">'
                        + '<option value="0">AND</option>'
                        + '<option value="1">OR</option>'
                        + '</select></td>'
                        + '<td colspan="2">'
                        + '<div style="float:left;margin:10px;"><input type="checkbox" name="chkAuth" value="0" disabled="disabled"/> FP</div>'
  						+ '<div style="float:left;margin:10px;"><input type="checkbox" name="chkAuth" value="1" disabled="disabled"/> PW</div>'
  						+ '<div style="float:left;margin:10px;"><input type="checkbox" name="chkAuth" value="2" disabled="disabled"/> FA</div>'
  						+ '<div style="float:left;margin:10px;"><input type="checkbox" name="chkAuth" value="3" disabled="disabled"/> CARD</div>'
                        + '</td></tr>'
                        + '</table>';
        layout.appendChild(optionDiv);
        var select = document.getElementById("cbxInOutType");
		select.addEventListener("change", onAccessClick);
}


/**
 * 옵션 레이아웃을 제거한다. 전체의  option레이아웃을 dispose
 * @param layout
 */
function disposeOption(layout){
	var thisDiv = document.getElementById("divOpt" + layout.id);
	if(thisDiv){
		thisDiv.remove();
	}
}


/**
 * 옵션 레이아웃을 제거한다. 선택한 타임라인의 divOpt 토글
 * @param layout
 */
function disposeOptions(layout){
	var children = document.getElementsByClassName("tftable");
	for(var i=0; i<children.length; i++){
		children[i].parentElement.remove();
	}
}


/*
 * 출입상태설정의 적용버튼을 누를때 동작한다.
 */
function onAccessClick(e){
	var cbxInOutType = document.getElementById("cbxInOutType");
	var selectValue = cbxInOutType.value;
	changeItemInfo(selectValue);
	setDisable(selectValue);
}


/*
 * 출입상태 콤보박스 선택 값에 따라 인증타입 컨트롤 제어
 */
function setDisable(selectValue){
	var chkGroup = document.getElementsByName("chkAuth");
	var select = document.getElementById("cbxAuthType");
	if(selectValue == 3){
        chkGroup.forEach(function(each){
        	each.removeAttribute("disabled");
			each.addEventListener("click", onAdjustClick);
		});
        select.removeAttribute("disabled");
		select.addEventListener("change", onAdjustClick);
	}else{
		chkGroup.forEach(function(each){
			if(each.checked){
				each.checked = false;//값 초기화
			}
        	each.setAttribute("disabled", "disabled");
		});
		select.setAttribute("disabled", "disabled");
		select.value = 0;//값 초기화
	}
}


/*
 * 인증방식설정의 적용버튼을 누를때 동작한다.
 */
function onAdjustClick(e){
	var chkGroup = document.getElementsByName("chkAuth");
	var checkList = [];
	chkGroup.forEach(function(each){
		if(each.checked){
			checkList.push(each.value);
		}
	});
	var cbxAuthType = document.getElementById("cbxAuthType");
	var cbxAuthTypeValue = cbxAuthType.value;
	if(cbxAuthType){
		checkList.splice(0, 0, cbxAuthTypeValue.toString());
	}
	changeItemInfo(3, checkList);
}


/**
 * 타입 정보들을 수정한다
 * @param {any} type cbxInOutType
 * @param {any} mType cbxAuthType, chkAuthType 을 합친
 */
function changeItemInfo(type, mType){
	if(!selectedTimeline){
		return;
	}
	var itemArr = selectedTimeline.itemsData;
	var changeItem = itemArr.get(selectedItem);
	var dataManager = getDataManager();//다국어
	if(!changeItem){
		dialogAlert(rootApp, "", dataManager.getString("Str_NoChangeTimelineItems"), null);
		return;
	}
	changeItem.inoutType = type;
	if(mType){
		changeItem.authType = mType.toString();
	}
	changeItem.content = content[type];
	changeItem.className = clssName[type];
	itemArr.update(changeItem);
	//cpr.events.CMouseEvent
	
}


/**
 * 인증타입을 바인딩한다.
 * @param authVal
 * @param checkVal
 */
function bindOptions(authVal, checkVal){
	var cbxAuthType = document.getElementById("cbxAuthType");
	var chkAuthGroup = document.getElementsByName("chkAuth");
	if(authVal){
		cbxAuthType.value = authVal;
	}
	if(checkVal.length>0){
		var temp = checkVal.split(",");
		temp.forEach(function(value){
			chkAuthGroup.forEach(function(each){
				if(each.value==value){
					each.checked = true;
				}
			});
		})
	}
}


/*
 * "DELETE" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnDeleteClick(e){
	var button = e.target;
	var btnRefID = button.getAttribute("data-container-id");//해당 버튼의 타임라인 객체 아이디
	var listFlag = button.getAttribute("data-flag-isList");//타임라인이 DB에 저장되어 불러온 데이터인지 아닌지
	if(listFlag=="false" && isSaved){ // 새로 생성었지만 저장이 완료되었으면 true로 바꾼다.
		listFlag = "true";
	}
	var findDelObj;
	var dataManager = getDataManager();//다국어
	dialogConfirm(rootApp, "", dataManager.getString("Str_DeleteConfirm"), function(/*cpr.controls.Dialog*/dialog){
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				if(listFlag == "true"){//DB에서 삭제해야 할 경우
					/**
					 * @type cpr.protocols.Submission
					 */
					var submission = rootApp.lookup("deleteTimeline");
					submission.action = "/v1/timezones/timelines/"+btnRefID;
					submission.send();
					submission.addEventListenerOnce("submit-success", function(/* cpr.events.CSubmissionEvent */e){
						/**
						 * @type cpr.protocols.Submission
						 */
						var getTimeMgmtList = e.control;
						//timelineArr에서도 삭제
						findDelObj = getDeleteObj(btnRefID);
						var delIndex = timelineArr.indexOf(findDelObj);
						if (delIndex > -1) {
							timelineArr.splice(delIndex, 1);
						}
						//dom 삭제
						document.getElementById("label"+btnRefID).remove();
						document.getElementById(findDelObj.dom.container.id).remove();
						findDelObj.destroy();
					});
				}else{//dom 과 상수에서만 삭제
					findDelObj = getDeleteObj(btnRefID);
					var delIndex = timelineArr.indexOf(findDelObj);
					if (delIndex > -1) {
						timelineArr.splice(delIndex, 1);
					}
					document.getElementById("label"+btnRefID).remove();
					document.getElementById(findDelObj.dom.container.id).remove();
				}
			} else {
				return;
			}
		});
	});
}


/**
 * 상수 timelineArr로부터 파라미터로 받은 아이디의 타임라인 객체를 리턴한다.
 * @param {String} btnRefID
 * @return 삭제할 타임라인객체
 */
function getDeleteObj(btnRefID){
	var findDelObj;
	for(var i=0; i<timelineArr.length;i++){
		if(!timelineArr[i].dom){
			continue;
		}
		if(timelineArr[i].dom.container.id==btnRefID){
			findDelObj = timelineArr[i];
			break;
		}
	}
	if(!findDelObj){
		console.log("ERROR : 객체가 없습니다.")
		return;
	}
	return findDelObj;
}


/*
 * 부모 app을 가져온다.
 */
exports.setRootApp = function(rApp){
	rootApp = rApp;
}


/*
 * 새로운 쉘을 추가하고 vertical 레이아웃에 추가한다.
 */
exports.setShlContent = function(id, name){
	makeTimeLine([{TimelineID: id, Name: name}], false);
}


/*
 * 조회된 데이터를 통해 타임라인을 생성한다.
 */
exports.setItems = function(/*Array*/ obj){
	if(obj.length==0){return;}
	for(var idx = 0; idx < obj.length; idx++){
		makeTimeLine(obj[idx], true);
	}
}


/*
 * 특정 타임라인아이디를 반환한다.
 */
exports.getTimelineID = function(){
	return timelineID;
}


/*
 * 선택된 타임라인 아이템을 반환한다.
 */
exports.getSelectItem = function(){
	return selectedItem;
}


/*
 * 현재 화면에 보여지는 타임라인 객체 전체를 반환한다.
 */
exports.getItems = function(){
	return timelineArr;
}


/*
 * 타임라인 정보들을 초기화한다.
 */
exports.initTimelines = function(){
	//최상위 dom 하위의 자식 아이디를 추출하여 자식 전부를 remove
	var childArr = document.getElementById("timezoneCtrl").childNodes;
	var childIDs = [];
	childArr.forEach(function(child){
		childIDs.push(child.id);
	});
	childIDs.forEach(function(/* Object */ each){
		document.getElementById(each).remove();
	});
	timelineArr = [];
	timeline = null;
	timelineID = null;
	selectedItem = null;
	selectedTimeline = null;
	isSaved = false;
}


/*
 * 저장이 된 항목인지를 판별한 후 세팅한다.
 */
exports.setIsSaved = function(){
	isSaved = true;
}


/*
 * Body에서 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(/* cpr.events.CEvent */ e){
	//다국어 변경 이벤트 발생시 호출
	cpr.core.NotificationCenter.INSTANCE.subscribe("timeline", app, function(payload){
		var layout = document.getElementById(timelineID);
		disposeOptions(layout);
	  	timelineArr.forEach(function(/* Object */ each){
	  		each.setSelection([]);
	  	});
	});
}


/*
 * Body에서 dispose 이벤트 발생 시 호출.
 * 컨트롤이 dispose될 때 호출되는 이벤트.
 */
function onBodyDispose(/* cpr.events.CEvent */ e){
	cpr.core.NotificationCenter.INSTANCE.unsubscribe(app, "timeline");
}
