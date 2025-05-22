/************************************************
 * TimeLine.js
 * Created at 2019. 1. 8. 오후 3:56:57.
 *
 * @author osm8667
 ************************************************/
/**
 * @type cpr.core.AppInstance
 */
var rootApp = null;                                /*부모 앱*/
var timelineArr = [];                              /*생성된 타임라인 객체 배열*/
var timeline = null;                               /*타임라인 객체*/
var timelineID = null;                             /*타임라인아이디*/
var selectedItem = null;                           /*선택한 타임라인 아이템*/
var selectedTimeline = null;                       /*선택한 타임라인*/
var content = ["ACCESS", "DENIED", "AUTH"];          /*타임라인 아이템 라벨*/
var clssName = ["green", "red", "orange", "orange-new", "blue"];    /*타임라인 아이템 색상*/
var isSaved = false;                               /*저장된 데이터 여부*/
var dataManager = cpr.core.Module.require("lib/DataManager");

/*
 * 쉘에서 init 이벤트 발생 시 호출.
 */
function onTimeShellInit(/* cpr.events.CUIEvent */ e) {
	/**
	 * @type cpr.controls.UIControlShell
	 */
	var timeShell = e.control;
	if (timeline) {
		e.preventDefault();
	}
}

/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onTimeShellLoad(/* cpr.events.CUIEvent */ e) {
	/**
	 * @type cpr.controls.UIControlShell
	 */
	var timeShell = e.control;
	var oShell = e.content;
	if (!oShell) {
		return;
	};
	oShell.innerHTML = '<div id="timezoneCtrlV"></div>';
}


/**
 * @see { @link http://visjs.org }
 * 타임라인을 생성한다.
 * @notice _moveToGroup prototype 막아둠 -> 그룹간 이동 금지
 */
function makeTimeLine(/*Array*/info, isList) {
	dataManager = getDataManager();
	//타임라인 그룹 정보 설정
	var groups = new vis.DataSet();
	//var names = ['출입상태', '인증시간'];//그룹명
	var names = [dataManager.getString("Str_AccessStatus"), dataManager.getString("Str_AuthenticationTime")];//그룹명
	for (var g = 0; g < names.length; g++) {
		groups.add({ id: g, content: names[g] });
	}
	//타임라인 그룹 정보 설정 end
	//타임라인안에 위치할 아이템 설정
	var items = new vis.DataSet({
		type: { start: "Date", end: "Date" }
	});




	if (isList) {//리스트에서 가져온 데이터인지 판별
		for (var i = 0; i < info.length; i++) {
			var groupID = (info[i].Type == 0 || info[i].Type == 1) ? 0 : 1;//0이나 1이면 그룹0 , 100이면  그룹1

			var startDate = new Date(1970, 0, 1, info[i].StartTime / 60, info[i].StartTime % 60, 0);
			var endDate = new Date(1970, 0, 1, info[i].EndTime / 60, info[i].EndTime % 60, 0);
			items.add([
				{
					id: "item" + info[i].TimelineID + info[i].Type + i,
					group: groupID,
					content: groupID == 0 ? content[info[i].Type] : content[2],
					start: startDate,
					end: endDate,
					className: groupID == 0 ? clssName[info[i].Type] : clssName[2],
					inoutType: info[i].Type,//0:문열림 1:문닫힘 100:인증타입
					authType: info[i].ExtVal//메인리스트 type
				}
			]);
		}
	}
	//타임라인안에 위치할 아이템 설정 end
	//타임라인 dom 생성 ; (스타일 조정 시 라벨 및 타임라인, 설정 레이아웃을 전체적으로 조정, 하나씩..px 확인하면서 조정해야함, 각각의 element이기때문에)
	var instance = document.getElementById("timezoneCtrlV");
	/*label*/
	var labelDiv = document.createElement('div');
	labelDiv.id = "label" + info[0].TimelineID;
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
	/*container*/
	var container = document.createElement('div');
	container.id = info[0].TimelineID;//컨테이너의 아이디
	container.style.marginTop = "5px";
	container.style.marginBottom = "15px";
	var deleteButton = document.createElement('button');
	deleteButton.id = "btnDel_" + container.id;
	deleteButton.textContent = "X";
	deleteButton.className = "custom-delete-button";
	deleteButton.setAttribute("data-container-id", container.id);
	deleteButton.setAttribute("data-flag-isList", isList.toString());
	deleteButton.addEventListener("click", onBtnDeleteClick);
	container.appendChild(deleteButton);
	instance.appendChild(container);
	//타임라인 dom 생성 end

	//타임라인의 범위 설정
	var optStart = new Date();
	var optEnd = new Date();
	var optStart = new Date(1970, 0, 1, 0, 0, 0);
	var optEnd = new Date(1970, 0, 1, 23, 59, 59);
	//optStart.setTime(0+new Date().getTimezoneOffset()*60000);//9시간 빼줌
	//optEnd.setTime(1439*60000+new Date().getTimezoneOffset()*60000);


	//타임라인의 옵션 프로퍼티와 타임라인에서 이루어지는 이벤트를 설정
	var options = {
		stack: false,
		start: optStart,
		end: optEnd,
		min: optStart,
		max: optEnd,
		zoomMax: 86399999,
		zoomMin: 360000 * 5,
		// allow selecting multiple items using ctrl+click, shift+click, or hold.
		multiselect: false,
		height: "108px",
		margin: {
			item: {
				horizontal: 0,
				vertical: 0
			},
			axis: 0
		},
		// allow manipulation of items
		editable: true,
		//클릭 시 활성화
		clickToUse: true,
		showCurrentTime: false,
		showMajorLabels: false,
		orientation: 'both',
		onAdd: function (item) {
			var end = new Date(item.start.getTime()).setMinutes(item.start.getMinutes() + 60);
			item.end = new Date(end);
			var hasItems = checkHasItems(items, item);
			if (!hasItems) {
				// 값 세팅
				item.content = "NEW";//정의 필요
				item.inoutType = null;
				item.authType = null;
				item.className = "yellow"; // 19-07-15 정래훈 타임라인 아이템에 시간이 표시 되었다가 사라지는 기능을 구현하기 위해 추가함
				//			if(item.group==null){
				//				item.group = 1;
				//			}
				var filterGrp0 = [];
				var filterGrp1 = [];
				items.forEach(function (each) {//items 가 custom type 이라 foreach 만 사용 가능
					if (each.group == 0) {//클릭 한 위치가 출입상태 or 인증시간
						filterGrp0.push(each);
					} else {
						filterGrp1.push(each);
					}
				});
				//최대 갯수 제한
				if (item.group == 0) {
					if (filterGrp0.length < 6) {
						items.add(item);
					} else {
						dialogAlert(rootApp, "", "타임라인이 최대 갯수에 도달했습니다. 기존 타임라인을 삭제 후 이용해 주세요.", null);
						return;
					}
				} else {
					if (filterGrp1.length < 12) {
						item.inoutType = 100;
						item.className = clssName[3]; // 19-07-15 정래훈 - 타임라인 아이템에 시간이 표시되었다가 사라지는 기능을 구현하기 위해 수정함
						items.add(item);
					} else {
						dialogAlert(rootApp, "", "타임라인이 최대 갯수에 도달했습니다. 기존 타임라인을 삭제 후 이용해 주세요.", null);
						return;
					}
				}
			}
		},
		onMove: function (item, handler) {
			var hasItems = checkHasItems(items, item);
			if (hasItems) {
				handler(null);
			} else {
				handler(item);
			}
		},
		onMoving: function (item, handler) {
			//툴팁효과생성
			var sHour = item.start.getHours() < 10 ? "0" + item.start.getHours() : item.start.getHours();
			var sMin = item.start.getMinutes() < 10 ? "0" + item.start.getMinutes() : item.start.getMinutes();
			var eHour = item.end.getHours() < 10 ? "0" + item.end.getHours() : item.end.getHours();
			var eMin = item.end.getMinutes() < 10 ? "0" + item.end.getMinutes() : item.end.getMinutes();

			//console.log("item : ",item);

			// 아이템이 00:00 이전, 23:59 이후로 넘어가는것을 방지 

			if (item.start.getDate() != 1 || (item.end.getDate() != 1 && (eMin > 0 || eHour > 0))) {
				return;
			}
			if (item.end.getDate() > 1) {
				item.end = new Date(1970, 0, 1, 23, 59, 59);
			}

			if (parseInt(sHour) < 2) {
				item.content = "<li style='color: white;white-space:nowrap;pointer-events:none;'>" + "START: " + sHour + ":" + sMin + ", END: " + eHour + ":" + eMin + "</li>";
			}

			//19-07-15 정래훈 - 타임라인 아이템에 시간이 표시되었다가 사라지는 기능을 구현하기 위해 작성
			else {
				if (item.className == "yellow" || item.className == "orange-new") {
					item.content = "NEW";
				}
				if (item.className == "green") {
					item.content = "ACCESS";
				}
				if (item.className == "red") {
					item.content = "DENIED";
				}
				if (item.className == "orange") {
					item.content = "AUTH";
				}
			}
			handler(item); // send back the (possibly) changed item
		},
		onRemove: function (item, handler) {
			var dataManager = getDataManager();
			dialogConfirm(rootApp, "", dataManager.getString("Str_DeleteConfirm"), function (/*cpr.controls.Dialog*/dialog) {
				dialog.addEventListenerOnce("close", function (e) {
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
		tooltipOnItemUpdateTime: {//아이템의 시간 정보가 업데이트 될 때 표시
			template: function (item) {//대상 아이템
				var sHour = item.start.getHours() < 10 ? "0" + item.start.getHours() : item.start.getHours();
				var sMin = item.start.getMinutes() < 10 ? "0" + item.start.getMinutes() : item.start.getMinutes();
				var eHour = item.end.getHours() < 10 ? "0" + item.end.getHours() : item.end.getHours();
				var eMin = item.end.getMinutes() < 10 ? "0" + item.end.getMinutes() : item.end.getMinutes();
				var str = "START: " + sHour + ":" + sMin + ", END: " + eHour + ":" + eMin;
				return str;
			}
		}
	});

	timeline = new vis.Timeline(container, items, null, options1);
	timeline.authType = info[0].ExtVal;//타임라인 객체 자체에서도 Extval에 접근 가능하도록 값 set
	timeline.setGroups(groups);

	timeline.on("select", function (prop) {
		var evt = prop.event;
		var targetParent = evt.target.parentElement;
		if (!targetParent) {
			return;
		}
		timelineID = container.id;//타임라인의 아이디를 가져온다.
		selectedItem = this.getSelection()[0];
		var pChildren = targetParent.parentElement.innerHTML;
		if (pChildren.indexOf("vis-delete") != -1) {//아이템이 선택된 상태(삭제버튼유무)
			var getSelectedData = items.get(this.getSelection()[0]);
			if (getSelectedData.inoutType == 100) { //인증시간 (auth)은 if에 걸림

				//인증시간 아이템을 최초클릭하면 이곳을 통과한다. 하단 mouseDown 함수에 추가한 소스에서 disposeOptions를 해주기 때문에 이곳에서의 disposeOption를 비활성화 해야 아이템을 최초 클릭했을때도 인증 옵션창이 남아있는다.
				//disposeOption(container);

				var str = getSelectedData.authType;
				if (str) {
					var strArr = str.split(",");
					var authType = [];
					strArr.forEach(function (str, i) {
						if (i != 0) {
							authType.push(str);
						}
					});
				}
			} else {//옵션 레이아웃 생성
				//출입상태(access,denied)를 클릭하면 else에 걸림
				disposeOption(container);
				var optArea = document.getElementById("divOpt" + container.id);
				if (!optArea) {
					makeOptions(container, "inout");
					var cbxInOutType = document.getElementById("cbxInOutType");
					cbxInOutType.value = getSelectedData.inoutType;
				}
			}
		}
	});
	timeline.on("mouseDown", function (prop) {
		selectedTimeline = this;

		// 19-07-15 정래훈 - 타임라인에서 인증시간 라인의 new, auth 아이템을 클릭했을 시 인증방식 설정 창이 뜨도록하기 위해 추가하였음
		// 밑에 있는 if(prop.item==null){ 이후 파트에 있는 소스를 복사해왔다.
		// if(prop.item==null){ 파트에서는 선택된 아이템이 없을때 인증방식 설정 창이 뜨도록 했으며, 이하 소스는 그룹이 1(출입상태는 그룹0, 인증시간은 그룹1)
		// 일 때 도 설정창이 뜨도록 소스를 작성했다.
		if (prop.group == 1) {

			disposeOptions(container); // 기존에 있던 옵션 창을 지운다. 이 소스가 없으면 다른 타임라인을 선택했을 시 옵션창이 사라지지 않으며 옵션이 복사되는 현상이 일어난다.
			var optArea = document.getElementById("divOpt" + container.id);
			if (!optArea) {//옵션 레이아웃이 없다면
				makeOptions(container, "auth"); // 옵션창을 활성화한다.
				var str = selectedTimeline.authType;
				if (str) {
					var strArr = str.split(",");
					var authType = [];
					strArr.forEach(function (str, i) {
						if (i != 0) {
							authType.push(str);
						}
					});
					bindOptions(strArr[0], authType.toString());
				}
			}
		}


		if (prop.item == null) {
			disposeOptions(container);
			var optArea = document.getElementById("divOpt" + container.id);
			if (!optArea) {//옵션 레이아웃이 없다면
				makeOptions(container, "auth");
				var str = selectedTimeline.authType;
				if (str) {
					var strArr = str.split(",");
					var authType = [];
					strArr.forEach(function (str, i) {
						if (i != 0) {
							authType.push(str);
						}
					});
					bindOptions(strArr[0], authType.toString());
				}
			}
			timelineArr.forEach(function (/* Object */ each) {
				each.setSelection([]);
			});
		}
	});
	timeline.on("doubleClick", function (prop) {
		/**
		 * @type MouseEvent
		 */
		var event = prop.event;
		event.preventDefault();
	});
	timelineArr.push(timeline);
	//타임라인의 옵션 프로퍼티와 타임라인에서 이루어지는 이벤트를 설정 end
}


/**
 * 인증타입을 바인딩한다.
 * @param authVal
 * @param checkVal
 */
function bindOptions(authVal, checkVal) {
	var cbxAuthType = document.getElementById("cbxAuthType");
	var chkAuthGroup = document.getElementsByName("chkAuth");
	if (authVal) {
		cbxAuthType.value = authVal;
	}
	if (checkVal.length > 0) {
		var temp = checkVal.split(",");
		temp.forEach(function (value) {
			chkAuthGroup.forEach(function (each) {
				if (each.value == value) {
					each.checked = true;
				}
			});
		})
	}
}


/**
 * 각 설정레이아웃을 생성한다.
 * @param layout
 * @param code auth: 인증, inout: 출입상태
 */
function makeOptions(layout, code) {
	var dataManager = getDataManager();
	var optionDiv = document.createElement("div");
	optionDiv.id = "divOpt" + layout.id;
	optionDiv.style.height = "50px";
	optionDiv.style.width = "98%";
	optionDiv.style.padding = "5px";
	//	optionDiv.style.background = "brown";//icon 색깔을 따라갈지...(결정)

	if (code == "inout") {
		optionDiv.innerHTML = '<table class="tftable" border="1">'
			+ '<tr><td>' + dataManager.getString("Str_SetAccessStat") + '</td>'
			+ '<td style="padding-left: 10px">'
			+ '<select id="cbxInOutType" style="float:left;left:5px;width:50%;height:35px;">'
			+ '<option value="0">' + dataManager.getString("Str_DoorOpen") + '</option>'
			+ '<option value="1">' + dataManager.getString("Str_ClosedDoor") + '</option>'
			+ '</select></td></tr>'
			//                        + '<tfoot><tr><td colspan="4" style="text-align:right;">'
			//                        + '<input class="cl-button" id="btnAccess_'+layout.id+'" type="button" style="float:right; width: 80px;height:25px;" value="적용"/>'
			//                        + '</td></tr></tfoot>'
			+ '</table>';
		layout.appendChild(optionDiv);
		var select = document.getElementById("cbxInOutType");
		select.addEventListener("change", onAccessClick);
	} else {
		optionDiv.innerHTML = '<table class="tftable" border="1">'
			+ '<tr><td>' + dataManager.getString("Str_SetAuthType") + '</td>'
			+ '<td style="width:210px;">'
			+ '<select id="cbxAuthType" style="width:200px;height:35px;">'
			+ '<option value="0">AND</option>'
			+ '<option value="1" selected>OR</option>'
			+ '</select></td>'
			+ '<td colspan="2">'
			+ '<div style="float:left;margin:10px;"><input type="checkbox" name="chkAuth" value="1"/>' + dataManager.getString("Str_Fingerprint") + '</div>'
			+ '<div style="float:left;margin:10px;"><input type="checkbox" name="chkAuth" value="3"/>' + dataManager.getString("Str_Password") + '</div>'
			+ '<div style="float:left;margin:10px;"><input type="checkbox" name="chkAuth" value="4"/>' + dataManager.getString("Str_Face") + '</div>'
			+ '<div style="float:left;margin:10px;"><input type="checkbox" name="chkAuth" value="2"/>' + dataManager.getString("Str_Card") + '</div>'
			+ '<div style="float:left;margin:10px;"><input type="checkbox" name="chkAuth" value="6"/>' + dataManager.getString("Str_Iris") + '</div>'
			//+ '<div style="float:left;margin:10px;"><input type="checkbox" name="chkAuth" value="5"/>'+dataManager.getString("Str_MobileCard")+'</div>'
			//+ '<div style="float:left;margin:10px;"><input type="checkbox" name="chkAuth" value="8"/>'+dataManager.getString("Str_FingerPrintCard")+'</div>'
			+ '</td></tr>'
			//                        + '<tfoot><tr><td colspan="4" style="text-align:right;">'
			//                        + '<input class="cl-button" id="btnAdj_'+layout.id+'" type="button" style="float:right; width: 80px;height:25px;" value="적용"/>'
			//                        + '</td></tr></tfoot>'
			+ '</table>';
		layout.appendChild(optionDiv);

		var chkGroup = document.getElementsByName("chkAuth");
		chkGroup.forEach(function (each) {
			each.addEventListener("click", onAdjustClick);
		});
		var select = document.getElementById("cbxAuthType");
		select.addEventListener("change", onAdjustClick);
	}
}


/**
 * 추가할 타임객체 validation 체크
 * @param target
 * @param newObj
 */
function checkHasItems(target, newObj) {
	var hasBool = false;
	target.forEach(function (each) {
		if (each.group == newObj.group) {
			if (each.id == newObj.id) {
				return false;
			}
			if (each.start.getTime() < newObj.start.getTime() && newObj.start.getTime() < each.end.getTime()) {
				hasBool = true;
			}
			if (each.start.getTime() > newObj.start.getTime() && newObj.end.getTime() > each.start.getTime()) {
				hasBool = true;
			}

			//19-07-16 정래훈 - 타임라인 아이템을 완전히 겹쳤을때 겹쳐지는 문제를 해결하기 위해 추가한 소스
			if (each.start.getTime() == newObj.start.getTime() && newObj.end.getTime() == each.end.getTime()) {
				hasBool = true;
			}
		}
	});
	return hasBool;
}


/*
 * 출입상태설정의 적용버튼을 누를때 동작한다.
 */
function onAccessClick(e) {
	var cbxInOutType = document.getElementById("cbxInOutType");
	changeItemInfos(cbxInOutType.value);
}


/**
 * 인증타입을 업데이트한다.
 * @param type 인증타입 콤보값
 * @param mType 인증타입 콤보, 체크박스값
 */
function changeItemInfos(type, mType) {
	var itemArr = selectedTimeline.itemsData;
	var changeItem = itemArr.get(selectedItem);
	var dataManager = getDataManager();
	if (!changeItem) {
		dialogAlert(rootApp, "", dataManager.getString("Str_NoChangeTimelineItems"), null);
		return;
	}
	changeItem.inoutType = type == null ? 100 : type;
	changeItem.content = type == null ? content[2] : content[type];
	changeItem.className = type == null ? clssName[2] : clssName[type];

	//19-07-16 정래훈 - 타임라인 출입상태에서 문열림과 문닫힘을 각각 3개씩만 설정 할 수 있도록 소스를 작성
	//content 값을 가져와서 수정할 수도 있으나 그럴 경우 2시 미만으로 내려갔을시 content가 시간으로 바뀌는 문제 때문에 className 값으로 진행
	var GreenItemCount = 0;
	var RedItemCount = 0;

	itemArr.forEach(function (each) {
		if (each.className == "green") {
			GreenItemCount = GreenItemCount + 1;
		}
		if (each.className == "red") {
			RedItemCount = RedItemCount + 1;
		}

	});

	if (GreenItemCount >= 3) {

		if (changeItem.className == "green") {
			dialogAlert(app, "", "문열림 상태는 3개까지만 지정 할 수 있습니다.", null);
			return false;
		}
	}
	if (RedItemCount >= 3) {

		if (changeItem.className == "red") {
			dialogAlert(app, "", "문닫힘 상태는 3개까지만 지정 할 수 있습니다.", null);
			return false;
		}
	}



	if (mType) {
		changeItem.authType = mType.toString();
	}
	itemArr.update(changeItem);
}


/*
 * 인증방식설정의 적용버튼을 누를때 동작한다.
 */
function onAdjustClick(/** @type MouseEvent	 */ e) {

	var curValue = e.target.defaultValue;

	var chkGroup = document.getElementsByName("chkAuth");
	var checkList = [];
	var i = 0
	chkGroup.forEach(function (each) {
		if (each.checked) {
			checkList.push(each.value);
			i++
		}
	});

	var cbxAuthType = document.getElementById("cbxAuthType");
	var cbxAuthTypeValue = cbxAuthType.value;
	if (cbxAuthType) {
		checkList.splice(0, 0, cbxAuthTypeValue.toString());
	}
	if (cbxAuthTypeValue == 0) {		// And 조건일경우 
		if (i > 3) {	//인증타입이 3개 이상 설정 x

			i = 0;
			checkList = [];
			checkList[i++] = cbxAuthTypeValue;
			chkGroup.forEach(function (each) {
				if (each.value == curValue) {
					each.checked = false;
				}
				if (each.checked == true) {
					checkList[i++] = each.value;
				}
			});
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserAuthTypeMaxExceed"));

		} else if (checkList.indexOf("8") != -1) {
			i = 0;
			checkList = [];
			checkList[i++] = cbxAuthTypeValue;
			chkGroup.forEach(function (each) {
				if (each.value == curValue) {
					each.checked = false;
				}
				if (each.checked == true) {
					checkList[i++] = each.value;
				}
			});
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserAuthTypeFPCardAndError"));
		}
	}

	if (cbxAuthTypeValue == 1) { // OR 조건일경우 인증타입이 2개 이상  pw 포함인경우 설정 x 그외 3개
		if (i > 3) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserAuthTypeMaxExceed"));
			i = 0;
			checkList = [];
			checkList[i++] = cbxAuthTypeValue;
			chkGroup.forEach(function (each) {
				if (each.value == curValue) {
					each.checked = false;
				}
				if (each.checked == true) {
					checkList[i++] = each.value;
				}
			});
		}
		if (checkList.indexOf("3") != -1 && i > 2) { // 패스워드 포함 2개
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserAuthTypeORPasswordWarning"));
			i = 0;
			checkList = [];
			checkList[i++] = cbxAuthTypeValue;
			chkGroup.forEach(function (each) {
				if (each.value == curValue) {
					each.checked = false;
				}
				if (each.checked == true) {
					checkList[i++] = each.value;
				}
			});
		}
		if (checkList.indexOf("8") != -1 && i > 1) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserAuthTypeFPCardIndependentError"));
			i = 0;
			checkList = [];
			checkList[i++] = cbxAuthTypeValue;
			chkGroup.forEach(function (each) {
				if (each.value == curValue) {
					each.checked = false;
				}
				if (each.checked == true) {
					checkList[i++] = each.value;
				}
			});
		}
	}

	selectedTimeline.authType = checkList.toString();
	// console.log("selectedTimeline.authType: " + selectedTimeline.authType)
}


/**
 * 옵션 레이아웃을 제거한다. 선택한 타임라인의 divOpt 토글
 * @param layout
 */
function disposeOption(layout) {
	var thisDiv = document.getElementById("divOpt" + layout.id);
	if (thisDiv) {
		thisDiv.remove();
	}
}


/**
 * 옵션 레이아웃을 제거한다. 전체의  option레이아웃을 dispose
 * @param layout
 */
function disposeOptions(layout) {
	var children = document.getElementsByClassName("tftable");
	for (var i = 0; i < children.length; i++) {
		children[i].parentElement.remove();
	}
}


/*
 * "DELETE" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnDeleteClick(e) {
	var button = e.target;
	var btnRefID = button.getAttribute("data-container-id");
	var listFlag = button.getAttribute("data-flag-isList");
	if (listFlag == "false" && isSaved) { // 새로 생성된 후 저장이 완료되었으면 true로 바꾼다.
		listFlag = "true";
	}
	var findDelObj;
	var dataManager = getDataManager();
	dialogConfirm(rootApp, "", dataManager.getString("Str_DeleteConfirm"), function (/*cpr.controls.Dialog*/dialog) {
		dialog.addEventListenerOnce("close", function (e) {
			if (dialog.returnValue) {
				if (listFlag == "true") {
					/**
					 * @type cpr.protocols.Submission
					 */
					var submission = rootApp.lookup("deleteTimeline")
					submission.action = "/v1/timezones/timelines/" + btnRefID;
					submission.send();
					submission.addEventListenerOnce("submit-success", function (/* cpr.events.CSubmissionEvent */e) {
						/**
						 * @type cpr.protocols.Submission
						 */
						var getTimeMgmtList = e.control;
						findDelObj = getDeleteObj(btnRefID);
						//라벨, 타임라인 삭제
						var delIndex = timelineArr.indexOf(findDelObj);
						if (delIndex > -1) {
							timelineArr.splice(delIndex, 1);
						}
						document.getElementById("label" + btnRefID).remove();
						document.getElementById(findDelObj.dom.container.id).remove();
						findDelObj.destroy();

						var target;
						if (dataManager.getSystemBrandType() == BRAND_VRIDI) { target = DLG_TIMELINE_WEEKENDV; }
						else { target = DLG_TIMELINE_WEEKENDN; }
						
						// 타임라인 삭제 시 화면에서도 삭제
						rootApp.callAppMethod("deleteTimeline", btnRefID)
						
						var commandEvent = new cpr.events.CUIEvent("execute-command", {
							content: {
								"target": target,
								"command": "TimeLineUpdate"
							}
						});

						app.getRootAppInstance().dispatchEvent(commandEvent);
					});
				} else {
					findDelObj = getDeleteObj(btnRefID);
					var delIndex = timelineArr.indexOf(findDelObj);
					if (delIndex > -1) {
						timelineArr.splice(delIndex, 1);
					}
					document.getElementById("label" + btnRefID).remove();
					document.getElementById(findDelObj.dom.container.id).remove();
				}
			} else {
				return;
			}
		});
	});
}


/**
 * 삭제할 타임라인을 가져온다.
 * @param btnRefID
 */
function getDeleteObj(btnRefID) {
	var findDelObj;
	for (var i = 0; i < timelineArr.length; i++) {
		if (!timelineArr[i].dom) {
			continue;
		}
		if (timelineArr[i].dom.container.id == btnRefID) {
			findDelObj = timelineArr[i];
			break;
		}
	}
	if (!findDelObj) {
		console.log("ERROR : 객체가 없습니다.")
		return;
	}
	return findDelObj;
}


/**
 * 부모 app을 가져온다.
 */
exports.setRootApp = function (rApp) {
	rootApp = rApp;
}


/**
 * 새로운 쉘을 추가하고 vertical 레이아웃에 추가한다.
 */
exports.setShlContent = function (id, name) {
	makeTimeLine([{ TimelineID: id, Name: name }], false);
}


/**
 * 부모앱에서 조회된 타임라인 정보를 받아 타임라인을 그린다.
 * @param obj
 */
exports.setItems = function (/*Array*/ obj) {
	if (obj.length == 0) { return; }
	for (var idx = 0; idx < obj.length; idx++) {
		makeTimeLine(obj[idx], true);
	}
}


/**
 * 선택한 타임라인의 ID값을 가져온다.
 */
exports.getTimelineID = function () {
	return timelineID;
}


/**
 * 선택한 타임라인 객체를 가져온다.
 */
exports.getSelectItem = function () {
	return selectedItem;
}


/**
 * 현재 그려진 타임라인 객체 전체를 가져온다.
 */
exports.getItems = function () {
	return timelineArr;
}


/**
 * 저장이 된 항목인지를 판별한 후 세팅한다.
 */
exports.setIsSaved = function () {
	isSaved = true;
}

exports.initTimelines = function () {
	var childArr = document.getElementById("timezoneCtrlV").childNodes;
	var childIDs = [];
	childArr.forEach(function (child) {
		childIDs.push(child.id);
	});
	childIDs.forEach(function (/* Object */ each) {
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
 * Body에서 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(/* cpr.events.CEvent */ e) {
	cpr.core.NotificationCenter.INSTANCE.subscribe("timeline", app, function (payload) {
		var layout = document.getElementById(timelineID);
		disposeOptions(layout);
		timelineArr.forEach(function (/* Object */ each) {
			each.setSelection([]);
		});
	});
}


/*
 * Body에서 dispose 이벤트 발생 시 호출.
 * 컨트롤이 dispose될 때 호출되는 이벤트.
 */
function onBodyDispose(/* cpr.events.CEvent */ e) {
	cpr.core.NotificationCenter.INSTANCE.unsubscribe(app, "timeline");
}