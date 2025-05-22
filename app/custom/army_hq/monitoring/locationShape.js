/************************************************
 * locationShape.js
 * Created at 2019. 1. 29. 오전 11:00:23.
 *
 * @author osm8667
 ************************************************/
var dataDragManager = cpr.core.Module.require("lib/LocDataDragManager");
var dataManager = getDataManager();
var usint_version;
var usint_mainControl;
var utilLib = cpr.core.Module.require("lib/util");

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	usint_mainControl = dataManager.getUserInfoARMHQ().getValue("MainControl");
	var button = app.lookup("btnFileSelect");
	button.addEventListener("click", onFi1Click);

	// 전체 도면 이미지를 가져온다.
	var smsFullImageReq = app.lookup("sms_FullImageReq");
	smsFullImageReq.send();
}

//
function onSms_FullImageReqSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	var resultInfo = app.lookup("Result");
	var result = resultInfo.getValue("ResultCode");
	if (result == 0) {
		var fullImageInfo = app.lookup("ImageInfo");
		var fullImage = app.lookup("VMMGR_imgFull");
		var src = fullImageInfo.getValue("ImageData");
		if(src){
			fullImage.putValue('data:image/png;base64,'+fullImageInfo.getValue("ImageData"));
			// 영역 목록 가져오기
			var smsMapAreaListReq = app.lookup("sms_getMapAreaList");
			smsMapAreaListReq.send();
		}
	} else {
		// alert
	}
}

//
function onSms_getMapAreaListSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	var resultInfo = app.lookup("Result");
	var result = resultInfo.getValue("ResultCode");
	if (result == 0) {
		var dsAreaList = app.lookup("MapAreaList");
		if(dsAreaList.getRowCount()>0){
			var iconList = dsAreaList.findAllRow("PosX!=0 || PosY!=0");
			var width = 62;
			var height = 62;
			iconList.forEach(function(/* cpr.data.Row */ each){
				var icon = createDragIcon(each.getValue("MapCode"), each.getValue("Name"), each.getValue("PosX"), each.getValue("PosY"));
				app.lookup("grpDrag").addChild(icon, {
					"width" : width + "px",
					"height" : height + "px",
					"z-index" : "5"
				});
			});
		}
		eventButtonsControl(true, true, true);
	} else {
	}
}

// * 파일 인풋에서 value-change 이벤트 발생 시 호출.
function onFi1ValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** @type cpr.controls.FileInput	 */
	var fi1 = e.control;
	
	if (fi1.files.length > 0 ) {
		var ext = utilLib.getExtensionOfFilename(fi1.files[0].name);
		if (ext.toUpperCase()== "TIFF" || ext.toUpperCase()== "PJP" || ext.toUpperCase() == "JFIF" 
		|| ext.toUpperCase()== "GIF" || ext.toUpperCase()== "SVG" || ext.toUpperCase() == "BMP" 
		|| ext.toUpperCase()== "PNG" || ext.toUpperCase()== "JPEG" || ext.toUpperCase() == "SVGZ" 
		|| ext.toUpperCase()== "JPG" || ext.toUpperCase()== "WEBP" || ext.toUpperCase() == "ICO" 
		|| ext.toUpperCase()== "XBM" || ext.toUpperCase()== "DIB" || ext.toUpperCase() == "TIF" 
		|| ext.toUpperCase()== "PJPEG" || ext.toUpperCase()== "AVIF") {
			var img = app.lookup("VMMGR_imgFull");
			var reader = new FileReader();
		    reader.onload = function (e) {
				img.src = e.target.result;
			}
			reader.readAsDataURL(fi1.file);
			eventButtonsControl(true, true, true);			
		} else {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "이미지 파일 확장자가 아닙니다.");
			fi1.clear();
		}
	}
}


/*
 * 파일 인풋에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onFi1Click(/* cpr.events.CMouseEvent */ e){
	if (usint_mainControl == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "중앙관제 사용권한이 없습니다.", "");
		return;
	}
	///체크
	var fi1 = app.lookup("fi1");
	fi1.openFileChooser();
}


/*
 * 이미지에서 mousedown 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 누를 때 발생하는 이벤트.
 */
function onImgFullMousedown(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Image
	 */
	var imgFull = e.control;
	e.preventDefault();
}


/*
 * "저장" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnSaveClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
	if (usint_mainControl == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "중앙관제 사용권한이 없습니다.", "");
		return;
	}
	//도면(전체) src, 각 코드 별 아이콘의 위치 값, 각 상태 별 아이콘의 상태값 또는 src
	var fullImage = app.lookup("VMMGR_imgFull");
	if (fullImage.src == null || fullImage.src.length == 0) {
		return;
	}

	var imageData = fullImage.src.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
	var dmImageInfo = app.lookup("ImageInfo");
	var smsFullImageUpdate = app.lookup("sms_FullImageUpdate");

	if(imageData!=dmImageInfo.getValue("ImageData")){//이미지 기존 정보와 다를때 이미지 업데이트 후 아이콘 저장 else 아이콘만 저장
		dmImageInfo.setValue("ImageType", "jpg");
		dmImageInfo.setValue("ImageData", imageData);
		smsFullImageUpdate.send();
		if(smsFullImageUpdate.isSuccess()){
			saveIcons();
		}
	}else{
		saveIcons();
	}
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_FullImageUpdateSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var sms_FullImageUpdate = e.control;
	var result = app.lookup("Result").getValue("ResultCode");
	if(result==0){		
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_SaveNotify"), "");
	}else{		
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString(getErrorString(result)), "");
	}
}


function saveIcons(){
	var dragContainer = app.lookup("grpDrag");//드래그 영역
	var posList = app.lookup("PositionList");
	var areaList = app.lookup("MapAreaList");
	dragContainer.getChildren().forEach(function(/* cpr.controls.UIControl */ each){
		var eachID = each.id;
		var tmp = {};
		if( eachID && eachID.indexOf("rowIcon")!=-1){ // 드래그 영역에서 아이디가 존재하고 아이디에 rowIcon 이있는 컨트롤 추출

			var targetRow = areaList.findFirstRow("MapCode=="+each.userAttr("MapCode"));
			if(!targetRow){//구역별도면 가져오는 팝업에서 구역별도면 관리 화면 호출 후 등록 시 화면을 다시 안열고 작업 할때 예외처리
				var rowData = {
					MapCode : parseInt(each.userAttr("MapCode")),
					Name : each.userAttr("name"),
					PosX : 0,
					PosY: 0
				}
				var addedRow = areaList.addRowData(rowData);
				addedRow.setState(cpr.data.tabledata.RowState.UNCHANGED);
				//데이터 삽입 후 재검색
				targetRow = areaList.findFirstRow("MapCode=="+each.userAttr("MapCode"));
			}

			var prePosX = targetRow?targetRow.getValue("PosX"):1;
			var prePosY = targetRow?targetRow.getValue("PosY"):1;

			//드롭 완료된 아이콘의 x, y
			var iconPosX = each.getOffsetRect().left;
			var iconPosY = each.getOffsetRect().top;

			if(iconPosX==0&&iconPosY==0){ // 서버코딩 상 0,0은 초기화 상태이므로...1 강제 삽입해야함
				iconPosX = 1;
				iconPosY = 1;
			}
			//기존 데이터의 x, y 좌표와 비교 후 변경되었다면 업데이트
			if(prePosX!=iconPosX){
				targetRow.setValue("PosX", iconPosX);
			}
			if(prePosY!=iconPosY){
				targetRow.setValue("PosY", iconPosY);
			}
		}
	});
	var updateRows = areaList.getRowDatasByState(cpr.data.tabledata.RowState.UPDATED);
	if(typeof(updateRows["4"])!="undefined"){
		updateRows["4"].forEach(function(row){
			posList.addRowData(row);
			posList.setRowStateAll(cpr.data.tabledata.RowState.UPDATED);
		});
		if(posList.getRowCount()>0){
			var smsUpdatePosition = app.lookup("sms_updateMpaAreaPosition");
			smsUpdatePosition.send();
		}
	}
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_updateMpaAreaPositionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var sms_updateMpaAreaPosition = e.control;
	var resultInfo = app.lookup("Result");
	var result = resultInfo.getValue("ResultCode");
	if(result==0){
		var areaList = app.lookup("MapAreaList");
		areaList.commit();
		var posList = app.lookup("PositionList");
		posList.revert();//초기화
		dialogAlertAMHQ(app, dataManager.getString("Str_Info"), dataManager.getString("Str_SaveNotify"), "");
	}else{
		//dialogAlertAMHQ(app, "", dataManager.getString(""), "");
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString(getErrorString(result)), "");
	}
}


/*
 * "구역별 도면" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnAreaSelectClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var btnAreaSelect = e.control;
	if (usint_mainControl == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "중앙관제 사용권한이 없습니다.", "");
		return;
	}
	var vMMGR_imgFull = app.lookup("VMMGR_imgFull");
	if(!vMMGR_imgFull.src){
		//이미지 등록 후 영역 등록이 가능합니다.
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorAfterImageRegist"), "");
		return;
	}

	var grpDrag = app.lookup("grpDrag");
	var icons = [];
	grpDrag.getChildren().forEach(function(/* cpr.controls.UIControl */ each){
		var eachID = each.id;
		if( eachID && eachID.indexOf("rowIcon")!=-1){
			icons.push(each.userAttr("MapCode"));
		}
	});
	var option = {
		width : 400,
		height : 500,
		right: app.getContainer().getActualRect().left/4
	};
	var result = [];
	var appld = "app/custom/army_hq/monitoring/locationRegistArea" + "?" + usint_version;
	app.openDialog(appld, option, function(dialog){
		dialog.modal = true;
		dialog.initValue = icons;
		dialog.style.header.css("background-color", "#528443");
		dialog.headerTitle= dataManager.getString("Str_MapDrawingManagement");
		dialog.addEventListenerOnce("close", function(e){
			result = dialog.returnValue;
			if(result){
				var width = 62;
				var height = 62;
				result.forEach(function(/* cpr.data.Row */ each){
					var icon = createDragIcon(each.getValue("MapCode"),each.getValue("Name"), null, null);
					app.lookup("grpDrag").addChild(icon, {
						"width" : width + "px",
						"height" : height + "px",
						"z-index" : "5"
					});
					
					app.lookup("grpDrag").redraw();
				});
				eventButtonsControl(true, true, true);
			}
		});
	});
}


/**
 * 구역 아이콘을 생성한다.
 * @param {String} id
 * @param {String} name
 * @param {Number} left
 * @param {Number} top
 */
function createDragIcon(id, name, left, top){
	var src = "theme/images/locations/location_information_icons_map_normal.png";//상태 이미지 가져오는 모듈 제작
	var dragContainer = new cpr.controls.Container("rowIcon"+id);

	dragContainer.userAttr("MapCode", id.toString());
	dragContainer.userAttr("name", name);

	var xYLayout = new cpr.controls.layouts.XYLayout();
	dragContainer.setLayout(xYLayout);

	var baseIcon = new cpr.controls.Button("baseIcon"+id);
	var statusIcon = new cpr.controls.Output("statusIcon"+id);
	baseIcon.style.css({
		"background-repeat" : "no-repeat",
		"background-color" : "rgba(255,255,255,0)",
		"background-image": "url('theme/images/locations/location_information_icons_map.png')",
		"background-size": "contain",
		"font-weight": "bolder",
		"color": "black"
	});
	baseIcon.text = name;
	baseIcon.style.addClass("symbolic");
	statusIcon.style.css({
		"background-repeat" : "no-repeat",
		"background-image": "url("+src+")",
		"background-size": "contain",
		"cursor": "grab"
	});
	dragContainer.addChild(baseIcon, {
		"top": "0px",
		"right": "0px",
		"bottom": "0px",
		"left": "0px"
	});
	dragContainer.addChild(statusIcon, {
		"top": "42px",
		"left": "42px",
		"width": "20px",
		"height": "20px"
	});
	var oArea = app.lookup("grpDrag");
	var rect = oArea.getActualRect();
	dragContainer.style.css({
		"left" : left==null?rect.left:left+"px",
		"top" : top==null?rect.top:top + "px",
		"z-index" : "5"
	});
	//이벤트 바인딩
	dragContainer.addEventListener("mousedown", function(e){
		dataDragManager.dragStart(dragContainer, oArea, e);
	});
	dragContainer.addEventListener("dblclick", function(e){//더블클릭 시 모니터링 화면 호출
		var hostAppIns = app.getHostAppInstance();
		var bResult = hostAppIns.callAppMethod("onLocationMonitoringCalled", id);
		 
			/*
		var path = "app/custom/army_hq/monitoring/locationMonitoring"
	
		app.openDialog(path, {width : 800, height : 800}, function(dialog){
			dialog.headerTitle = "중앙관제";
			dialog.modal = true;	
			dialog.initValue = {"ID": id};
		}).then(function(returnValue){
		});
		* */
		//var mainLib = mainManager(app.getRootAppInstance());
		//mainLib.ExecuteMenu(DLG_MAP_AREA_MONITORING, id);
	});
	dragContainer.addEventListener("contextmenu", function(e){
		app.lookup("IconMenu").setValue(0, "label", dataManager.getString("Str_Delete"));
		var menu_1 = new cpr.controls.Menu();
		menu_1.setItemSet(app.lookup("IconMenu"), {//우클릭 시 컨텍스트 메뉴
			label: "label",
			value: "value",
			parentValue: "parent"
		});
		var rect = app.getActualRect();
		menu_1.style.css({
			left: (e.clientX - rect.left) + "px",
			top: (e.clientY - rect.top) + "px",
			height: "50px",
			width: "150px",
			position: "absolute"
		});
		menu_1.focus();
		menu_1.addEventListener("selection-change", function(e) {
			if(menu_1.value == "d"){
				dialogConfirmAMHQ(app, "", dataManager.getString("Str_DeleteConfirm"), function(/*cpr.controls.Dialog*/dialog){
					dialog.addEventListenerOnce("close", function(e) {
						if (dialog.returnValue) {
							//삭제서브미션
							var areaList = app.lookup("MapAreaList");
							var posList = app.lookup("PositionList");
							var delRow = areaList.findFirstRow("MapCode=="+id);
							delRow.setValue("PosX", 0);
							delRow.setValue("PosY", 0);
							var updateRows = areaList.getRowDatasByState(cpr.data.tabledata.RowState.UPDATED);
							if(typeof(updateRows["4"])!="undefined"){
								updateRows["4"].forEach(function(row){
									posList.addRowData(row);
									posList.setRowStateAll(cpr.data.tabledata.RowState.UPDATED);
								});
								if(posList.getRowCount()>0){
									var smsUpdatePosition = app.lookup("sms_updateMpaAreaPosition");
									smsUpdatePosition.send();
								}
								if(smsUpdatePosition.isSuccess()){//0,0 수정 후 아이콘 자체는 삭제
									app.lookup("grpDrag").removeChild(dragContainer);
									areaList.commit();
									posList.revert();
									eventButtonsControl(true, true, false);
								}
							}else{//저장없이 아이콘 삭제를 클릭한 경우 해당 객체만 삭제해준다.
								app.lookup("grpDrag").removeChild(dragContainer);
								dialogAlertAMHQ(app, "", dataManager.getString("Str_DeleteNotify"), "");
							}
						}else{
							return;
						}
					});
				});
			}
		});
		menu_1.addEventListener("blur", function(e) {
			menu_1.dispose();
		});
		app.floatControl(menu_1);
	});
	return dragContainer;
}

// 이벤트 아이콘 제어
function eventButtonsControl(isImg, isArea, isSave){
	var imgBtn = app.lookup("btnFileSelect");
	var areaBtn = app.lookup("btnAreaSelect");
	var saveBtn = app.lookup("btnSave");

	imgBtn.enabled = isImg;
	areaBtn.enabled = isArea;
	saveBtn.enabled = isSave;
}

// 그룹에서 contextmenu 이벤트 발생 시 호출.
function onGrpDragContextmenu(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Container	 */
	var grpDrag = e.control;
	e.preventDefault();
}

// 도우말 클릭
function onImageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}
