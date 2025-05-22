/************************************************
 * locationShape.js
 * Created at 2019. 1. 29. 오전 11:00:23.
 *
 * @author osm8667
 ************************************************/
 var dataDragManager = cpr.core.Module.require("lib/LocDataDragManager");
 var utilLib = cpr.core.Module.require("lib/util");
 var dataManager = getDataManager();
var usint_version;
var editMode = "Add"; // add, modify
var deleteMode = "terminalDelete"; // terminalDelete, areaDelete

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	
	var terminalList = dataManager.getTerminalList();
	var targetDataSet = app.lookup("TerminalList");
	terminalList.copyToDataSet(targetDataSet);	
	targetDataSet.commit();
	
	var smsGetList = app.lookup("sms_getMapAreaList");
	smsGetList.send();
}

// 구역 도면 리스트 가져오기 완료
function onSms_getMapAreaListSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	var resultInfo = app.lookup("Result");
	var result = resultInfo.getValue("ResultCode");
	if ( result == 0) {
		var smsGetTerminalList = app.lookup("sms_getMapAreaTerminalList"); // 구역 단말 리스트 요청
		smsGetTerminalList.send();
	} else {
		// alert
	}
}

// 구역 단말 리스트 가져오기 완료
function onSms_getMapAreaTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	var resultInfo = app.lookup("Result");
	var result = resultInfo.getValue("ResultCode");	
	if (result == 0) {
		var hostAppIns = app.getHostAppInstance();
		if(hostAppIns){
			var iconValue = app.getHostProperty("initValue");
			if(iconValue && typeof(iconValue) == "number"){
				var grdArea = app.lookup("grdAreaList");
				var findRow = grdArea.findFirstRow("MapCode=="+iconValue);
				grdArea.selectRows(findRow.getIndex(), true);
			}
		}
	} else {
		// alert
	}
	console.log("가져오기",app.lookup("MapAreaTerminalList").getRowDataRanged())
}


/*
 * 파일 인풋에서 value-change 이벤트 발생 시 호출.
 * FileInput의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onFi1ValueChange(/* cpr.events.CValueChangeEvent */ e){
	/**
	 * @type cpr.controls.FileInput
	 */
	var fi1 = e.control;
	
	if (fi1.files.length > 0 ) { 
		var ext = utilLib.getExtensionOfFilename(fi1.files[0].name);
//		if (ext.toUpperCase()== "TIFF" || ext.toUpperCase()== "PJP" || ext.toUpperCase() == "JFIF" 
//		|| ext.toUpperCase()== "GIF" || ext.toUpperCase()== "SVG" || ext.toUpperCase() == "BMP" 
//		|| ext.toUpperCase()== "PNG" || ext.toUpperCase()== "JPEG" || ext.toUpperCase() == "SVGZ" 
//		|| ext.toUpperCase()== "JPG" || ext.toUpperCase()== "WEBP" || ext.toUpperCase() == "ICO" 
//		|| ext.toUpperCase()== "XBM" || ext.toUpperCase()== "DIB" || ext.toUpperCase() == "TIF" 
//		|| ext.toUpperCase()== "PJPEG" || ext.toUpperCase()== "AVIF") {
		if (ext.toUpperCase() == "BMP" || ext.toUpperCase()== "PNG" || ext.toUpperCase()== "JPG" || ext.toUpperCase() == "JPEG") {
			//단말기선택버튼 활성화
			var tmlBtn = app.lookup("btnSelectTml");
			if(!tmlBtn.enabled){
				tmlBtn.enabled = true;
			}
		
			var oFile = fi1.file;
			var img = app.lookup("VMTMS_imgArea");
			var rFile = null;
			var reader = new FileReader();
		    reader.onload = function (e) {
		    	rFile = e.target.result;
				img.src = rFile;
				resizeImage(img, reader.result, 700, 490);
			}
			reader.readAsDataURL(oFile);
		
			//선택한 로우
			var selectRow = app.lookup("grdAreaList").getSelectedRow();
			if(!selectRow){
				eventButtonsControl(false, false, false);
				return;
			}
			eventButtonsControl(true, true, true);
			var fileName = oFile.name;
			var oGrid = app.lookup("grdAreaList");
			oGrid.setCellValue(oGrid.getSelectedRowIndex(), 2, fileName);//선택한 로우의 그리드 셀에 데이터 반영
		} else {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorUnsupportedFileExtention"));
			fi1.clear();
		}
	}
}

// 구역 도면 이미지 선택 클릭
function onFileMapImageClick(/* cpr.events.CMouseEvent */ e){
	var fi1 = app.lookup("VMLAS_fiMapImage")
	fi1.openFileChooser();
}

/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onGrdAreaListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/**
	 * @type cpr.controls.Grid
	 */
	var grdAreaList = e.control;
	//아이콘 드롭 영역 초기화 (이전 선택 항목의 아이콘 지워주고 새로 선택한 항목을 다시 그림)
	var oArea = app.lookup("grpDragArea");
	oArea.getChildren().forEach(function(/* cpr.controls.UIControl */ each){
		var eachID = each.id;
		if( eachID && eachID.indexOf("rowIcon")!=-1){
			oArea.removeChild(each);
		}
	});
	//선택한 로우에서 데이터 추출
	var code = grdAreaList.getSelectedRow().getValue("MapCode");
	var name = grdAreaList.getSelectedRow().getValue("Name");

	var mapAreaList = app.lookup("MapAreaList");
	var row = mapAreaList.findFirstRow("MapCode=="+code);
	if(row){
		var selectFile = row.getValue("ImageData");
		var oImg = app.lookup("VMTMS_imgArea");
		if(selectFile){
			eventButtonsControl(true, true, true);
			//oImg.src = selectFile;
			oImg.putValue('data:image/png;base64,'+selectFile);
		}else{
			eventButtonsControl(true, false, false);
			oImg.src = "theme/images/noImg.gif";//이미지가 없을 때 이미지없음 파일 필요(현재는 오픈 이미지임)
		}
		//MapAreaInfo 맵코드와 명칭 미리 설정
		var areaInfo = app.lookup("MapAreaInfo");
		areaInfo.setValue("MapCode", code);
		areaInfo.setValue("Name", name);
		//아이콘 생성, id 는 MapAreaTerminalList로부터, name은 TerminalList로부터
		var mapTerminalList = app.lookup("MapAreaTerminalList");
		var iconRow = mapTerminalList.findAllRow("MapCode=="+code);
		if(iconRow){
			var terminalList = app.lookup("TerminalList");
			iconRow.forEach(function(/* cpr.data.Row */ each){
				var terminalID = each.getValue("TerminalID");
				var nameRow = terminalList.findFirstRow("ID=="+terminalID);
				if(!nameRow){
					return;
				}
				var terminalName = nameRow.getValue("Name");
				var width = 72;
				var height = 72;
				var icon = createDragIcon(terminalID, terminalName, each.getValue("PosX"), each.getValue("PosY"));
				app.lookup("grpDragArea").addChild(icon, {
					"width" : width + "px",
					"height" : height + "px",
					"z-index" : "0"
				});				
			});
		}
	}
}


/*
 * "단말기 선택" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnSelectTmlClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var btnSelectTml = e.control;
	var oArea = app.lookup("grpDragArea");
	var iconValues = []; // 이미 선택된 단말기 배열
	oArea.getChildren().forEach(function(/* cpr.controls.UIControl */ each){
		var eachID = each.id;
		if( eachID && eachID.indexOf("rowIcon")!=-1){
			iconValues.push(each.userAttr("TerminalID"));
		}
	});
	
	var tmList = app.lookup("MapAreaTerminalList");
	for (var i=0; i < tmList.getRowCount(); i++) {
		var row = tmList.getRow(i);
		var tmUD = String(row.getValue("TerminalID"));
		if (iconValues.indexOf(tmUD) == -1) {
			iconValues.push(tmUD);
		}
	}

	var option = {
		width : 400,
		height : 500,
		right: app.getContainer().getActualRect().left/4
	};
	/**
	 * @type cpr.data.Row[]
	 */
	var result = [];
	app.lookup("grpDragArea").enabled =false;
	var appld = "app/main/mapDrawing/locationTerminal" + "?" + usint_version;
	app.openDialog(appld, option, function(dialog){
		dialog.headerTitle = dataManager.getString("Str_TerminalSelect");
		dialog.modal = true;
		dialog.initValue = iconValues;
		dialog.addEventListenerOnce("close", function(e){
			result = dialog.returnValue;
			if(result){
				
				var width = 72;
				var height = 72;
				result.forEach(function(/* cpr.data.Row */ each){
					var icon = createDragIcon(each.getValue("ID"),each.getValue("Name"));
					oArea.addChild(icon, {
						"width" : width + "px",
						"height" : height + "px"
						//"z-index" : "5"
					});
					eventButtonsControl(true, true, true);
				});
			}
			app.lookup("grpDragArea").enabled =true;
		});
	});
}


/**
 * 단말기 아이콘을 생성한다.
 * @param {String} id TerminalID
 * @param {String} name
 * @param {Number} left PosX
 * @param {Number} top PosY
 */
function createDragIcon(id, name, left, top){
		var IDIndex = app.lookup("TerminalList").getColumnData("ID").lastIndexOf(id); // 해당 id를 가진 단말기가 단말기리스트에서 몇번째 단말기인지 값을 가져온다.
		var row = app.lookup("TerminalList").getRow(IDIndex);
		var src = "";
		/*
		if(row.getValue("Type") == ""){
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_UnconnectedTerminal"));
		}
		*/
		
		switch(row.getValue("Type")){
			// 배경화면 제거 단말기 사진 파일명 + "-removebg"
			case 2: src = "theme/images/terminals/AC2000-removebg.png"; break;//return "NAC 2500";  break;
			case 3: src = "theme/images/terminals/AC2000-removebg.png"; break;//return "NAC 3000";  break;
			case 4: src = "theme/images/terminals/AC2000-removebg.png"; break;//return "NAC 2500 (4MF)";  break;			
			case 6: src = "theme/images/terminals/AC2000-removebg.png"; break;//return "NAC 5000"; break;			
			case 9: src = "theme/images/terminals/AC2000-removebg.png"; break;//return "NAC 1500";  break;			
			case 18: src = "theme/images/terminals/eNBioAccess-T5-removebg.png"; break;//return "T5"; break;
			case 19: src = "theme/images/terminals/eNBioAccess-T3-removebg.png"; break;//return "T3";break;
			case 20: src = "theme/images/terminals/eNBioAccess-T1-removebg.png"; break;//return "T1"; break;			
			case 22: src = "theme/images/terminals/eNBioAccess-T9-removebg.png"; break;//return "T9"; break;
			case 23: src = "theme/images/terminals/AC2000-removebg.png"; break;//return "FKA2"; break;
			case 24: src = "theme/images/terminals/eNCardi-removebg.png"; break;//return "eNCardi"; break;
			case 25: src = "theme/images/terminals/eNBioAccess-T2-removebg.png"; break;//return "T2"; break;
			
			case 26: src = "theme/images/terminals/UBio-X_Slim-removebg.png"; break;//return "UBio-X Slim"; break;
			case 30: src = "theme/images/terminals/AC1100-removebg.png"; break;//return "AC1100"; break;
			case 31: src = "theme/images/terminals/AC2000-removebg.png"; break;//return "AC2000"; break;
			case 32: src = "theme/images/terminals/AC2200&2100-removebg.png"; break;//return "AC2200"; break;
			case 33: src = "theme/images/terminals/AC5100&5000PLUS-removebg.png"; break;//return "AC5000"; break;
			case 34: src = "theme/images/terminals/AC5100&5000PLUS-removebg.png"; break;//return "AC5100"; break;
			case 35: src = "theme/images/terminals/AC7000-removebg.png"; break;//return "AC7000";break;
			case 36: src = "theme/images/terminals/UBio-X_Pro-removebg.png"; break;//return "UBio-X Pro Lite"; break;
			case 37: src = "theme/images/terminals/UBio-X_Pro-removebg.png"; break;//return "UBio-X Pro"; break;
			case 38: src = "theme/images/terminals/AC6000-removebg.png"; break;//return "AC6000"; break;
			case 39: src = "theme/images/terminals/UBioTablet5-removebg.png"; break;//return "UBio Tablet5"; break;
			case 40: src = "theme/images/terminals/UBio-X_Slim-removebg.png"; break;//return "UBio-X_Slim"; break;			
			case 41: src = "theme/images/terminals/UBio-X_Pro-removebg.png"; break;//return "UBio-X_Pro2"; break;
			case 42: src = "theme/images/noImg.gif"; break;
			case 43: src = "theme/images/terminals/UBio-X_Iris-removebg.png"; break;//return "UBio-X_ProIris
			case 44: src = "theme/images/terminals/AC2200&2100-removebg.png"; break;//return "AC2100 PLUS
			case 45: src = "theme/images/terminals/UBio-X_Face-removebg.png"; break;
			case 46: src = "theme/images/terminals/UBio-X_Face_Premium-removebg.png"; break;
			case 47: src = "theme/images/terminals/UBio-X_Face_Pro-removebg.png"; break;
			default: src = "theme/images/noImg.gif"; break;
		}

	
	//var src = "theme/images/terminal.png";//단말기 이미지 바꾼다고 들었음
	var dragContainer = new cpr.controls.Container("rowIcon"+id);
	dragContainer.userAttr("TerminalID", id.toString());
	//layout
	var xYLayout = new cpr.controls.layouts.XYLayout();
	dragContainer.setLayout(xYLayout);
	//icon 생성
	var baseIcon = new cpr.controls.Button("baseIcon"+id);
	var statusIcon = new cpr.controls.Output("statusIcon"+id);
	baseIcon.style.css({
		"background-repeat" : "no-repeat",
		"background-color" : "rgba(255,255,255,0)",
		"background-image": "url("+src+")",
		"background-size": "contain",
		"font-weight": "bolder",
		"color": "black",
		"text-shadow": "0.5px -0.5px 0 white, 0.5px -0.5px 0 white, -0.5px 0.5px 0 white, 0.5px 0.5px 0 white;"
	});
	baseIcon.text = name;
	baseIcon.style.addClass("symbolic");
	/*
	statusIcon.style.css({
		"background-repeat" : "no-repeat",
		//"background-image": "url('theme/images/locations/location_information_icons_device_normal.png')",
		//"background-image": "url("+src+")",
		"background-size": "contain"
	});
	* */
	dragContainer.addChild(baseIcon, {
		"top": "0px",
		"right": "0px",
		"bottom": "0px",
		"left": "0px"
	});
	/*
	dragContainer.addChild(statusIcon, {
		"top": "42px",
		"left": "42px",
		"width": "30px",
		"height": "30px"
	});
	* */
	var oArea = app.lookup("grpDragArea");
	var rect = oArea.getActualRect();
	dragContainer.style.css({
		"left" : left==null?0:left + "px",
		"top" : top==null?0:top + "px",
		"width" : "62px",
		"height" : "62px",		
	});
	dragContainer.addEventListener("mousedown", function(e){
		dataDragManager.dragStart(dragContainer, oArea, e);
	});
	dragContainer.addEventListener("contextmenu", function(e){
		app.lookup("IconMenu").setValue(0, "label", dataManager.getString("Str_Delete"));
		var menu_1 = new cpr.controls.Menu();
		menu_1.setItemSet(app.lookup("IconMenu"), {
			label: "label",
			value: "value",
			parentValue: "parent"
		});
		var rect = app.getActualRect();
		menu_1.style.css({			
			"left": (e.clientX - rect.left) + "px",
			"top": (e.clientY - rect.top) + "px",
			"height": "50px",
			"width": "150px",												
			"position": "absolute",
			"z-index" : "100"
		});
		menu_1.focus();
		menu_1.addEventListener("selection-change", function(e) {
			if(menu_1.value == "d"){
				dialogConfirm(app, "", dataManager.getString("Str_DeleteConfirm"), function(/*cpr.controls.Dialog*/dialog){
					dialog.addEventListenerOnce("close", function(e) {
						if (dialog.returnValue) {
							deleteMode = "terminalDelete";							
							var mapTerminalList = app.lookup("MapAreaTerminalList");
							var delRow = mapTerminalList.findFirstRow("TerminalID=="+id);
							if(delRow){
								deleteIcon(delRow.getValue("MapCode"), id);
							}
							app.lookup("grpDragArea").removeChild(dragContainer);
						}else{
							return;
						}
					});
				});
			}
			menu_1.dispose();
		});
		menu_1.addEventListener("blur", function(e) {
			menu_1.dispose();
		});
		app.floatControl(menu_1);
	});
	return dragContainer;
}


function deleteIcon(code, id){
	var mapCode = code;
	var terminalID = id;
	var smsDeleteMapAreaTerminal = app.lookup("sms_deleteMapAreaTerminal");
	smsDeleteMapAreaTerminal.action = "/v1/map/areas/"+mapCode+"/terminals/"+terminalID;
	smsDeleteMapAreaTerminal.send();
	smsDeleteMapAreaTerminal.addEventListenerOnce("submit-done", function(){
		var resultMap = app.lookup("Result");
		var resultCode = resultMap.getValue("ResultCode");
		if(resultCode == COMERROR_NONE){
			app.lookup("MapAreaTerminalList").clear(); // 단말 삭제시마다 구역 단말을 다시 요청하고 있음 ㅡㅡ.. 수정 필요..
			
			var smsGetTerminalList = app.lookup("sms_getMapAreaTerminalList");
			smsGetTerminalList.send();
				
			if(deleteMode == "areaDelete"){
				
			}else{ // terminalDelete
				dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_DeleteNotify"), "");
			}
		}else{
			dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString(getErrorString(resultCode)), "");
		}
	});
}

/*
 * 그리드에서 update 이벤트 발생 시 호출.
 * Grid의 행 데이터가 수정되었을 때 이벤트.
 */
function onGrdAreaListUpdate(/* cpr.events.CGridEvent */ e){
	/**
	 * @type cpr.controls.Grid
	 */
	var grdAreaList = e.control;
	var saveBtn = app.lookup("VMTMS_btnSave");
	if(!saveBtn){
		saveBtn.enabled = true;
	}
}


/**
 * 상단 버튼 제어
 * @param {Boolean} isImg
 * @param {Boolean} isTerminal
 * @param {Boolean} isSave
 */
function eventButtonsControl(isImg, isTerminal, isSave){
	var imgBtn = app.lookup("btnFileSelect");
	var tmlBtn = app.lookup("btnSelectTml");
	var saveBtn = app.lookup("VMTMS_btnSave");

	imgBtn.enabled = isImg;
	tmlBtn.enabled = isTerminal;
	saveBtn.enabled = isSave;
}


// 이미지 리사이징 함수
function resizeImage(ctrl,imageData,width,height){
			
	var tempImage = new Image(); 
	tempImage.src = imageData; 
	tempImage.onload = function () {    
		var canvas = document.createElement('canvas');
		var canvasContext = canvas.getContext("2d");
		canvas.width = width; 
		canvas.height = height;
	 	canvasContext.drawImage(this, 0, 0, width, height);
		ctrl.src = canvas.toDataURL("image/jpeg");
	}
}
			
/*
 * "저장" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVMTMS_btnSaveClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var vMTMS_btnSave = e.control;
	var areaImage = app.lookup("VMTMS_imgArea");
	if (areaImage == null || areaImage.src.length == 0) {
		return;
	}

	var imageData = areaImage.src.replace(/^data:image\/(bmp|png|jpg|jpeg);base64,/, "");
	// bmp, png, jpg, jpeg 파일만 등록 가능
	var dmMapAreaInfo = app.lookup("MapAreaInfo");
	var mapCode = dmMapAreaInfo.getValue("MapCode");

	// 상황에 따라 등록 또는 업데이트
	var smsRegistMapAreaInfo = app.lookup("sms_registMapAreaInfo");
	if(imageData!=dmMapAreaInfo.getValue("ImageData")){
		dmMapAreaInfo.setValue("ImageType", "jpg");
		dmMapAreaInfo.setValue("ImageData", imageData);
		smsRegistMapAreaInfo.send();
		if(smsRegistMapAreaInfo.isSuccess()){
			editMode = "Add";
			saveIcons(mapCode);
			var grdAreaList = app.lookup("grdAreaList");
			var rowIndex = grdAreaList.getSelectedRowIndex();
			grdAreaList.setCellValue(rowIndex, 4, imageData);
		}
	}else{
		editMode = "Modify";
		saveIcons(mapCode);
	}
}


function saveIcons(mapCode){
	var dragContainer = app.lookup("grpDragArea");
	var posList = app.lookup("PositionList");
	var mapTerminalList = app.lookup("MapAreaTerminalList");
	var isChange = false;
	dragContainer.getChildren().forEach(function(/* cpr.controls.UIControl */ each){
		var eachID = each.id;
		var tmp = {};
		if( eachID && eachID.indexOf("rowIcon")!=-1){
			var terminalID = parseInt(each.userAttr("TerminalID"));
			var targetRow = mapTerminalList.findFirstRow("TerminalID==" + terminalID);
			if(targetRow){//update
				var prePosX = targetRow.getValue("PosX");
				var prePosY = targetRow.getValue("PosY");
				if(prePosX!=each.getOffsetRect().left){
					targetRow.setValue("PosX", each.getOffsetRect().left);
				}
				if(prePosY!=each.getOffsetRect().top){
					targetRow.setValue("PosY", each.getOffsetRect().top);
				}
			}else{//insert
				var newRow = {};
				newRow.MapCode = mapCode;
				newRow.TerminalID = terminalID;
				newRow.Type = 0;
				newRow.PosX = each.getOffsetRect().left;
				newRow.PosY = each.getOffsetRect().top;
				newRow.Size = 0;
				mapTerminalList.addRowData(newRow);
			}
			isChange = true;
		}
	});
	if(isChange){
		var smsSetMapAreaTerminal = app.lookup("sms_setMapAreaTerminal");
		smsSetMapAreaTerminal.action = "/v1/map/areas/"+mapCode+"/terminals";
		smsSetMapAreaTerminal.send();
		if(editMode == "Add"){
			
		}
		else{ // Modify
			dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_SaveNotify"), "");
		}
	}
	return isChange;
}


/*
 * "추가" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnAddRowClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var btnAddRow = e.control;
	var grdAreaList = app.lookup("grdAreaList");
	var result = null;
	var appld = "app/main/antipassback/AreaSelect" + "?" + usint_version;
	app.openDialog(appld, {width : 300, height : 170}, function(dialog){
		dialog.bind("headerTitle").toLanguage("Str_AddMapDrawings");
		dialog.initValue = "ar";
		dialog.addEventListenerOnce("close", function(e){
			result = dialog.returnValue;
			if(result){
				grdAreaList.insertRowData(grdAreaList.getRowCount(), true, {MapCode:result.id, Name:result.name});
				grdAreaList.selectRows(grdAreaList.getRowCount()-1);
			//	var smsRegistMapAreaInfo = app.lookup("sms_registMapAreaInfo"); // 있지도 않은거 추가 할필요 없다.
			//	smsRegistMapAreaInfo.send();
			}
		})
	});
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_registMapAreaInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var sms_registMapAreaInfo = e.control;
	var resultMap = app.lookup("Result");
	var resultCode = resultMap.getValue("ResultCode");
	if(resultCode==COMERROR_NONE){
		//locationRegistArea 다이얼로그에 변경 상태 전달
		cpr.core.NotificationCenter.INSTANCE.post("areaStateChange", {});
		var grdAreaList = app.lookup("grdAreaList");
		grdAreaList.commitData();
		
		var dmMapAreaInfo = app.lookup("MapAreaInfo");
		var mapCode = dmMapAreaInfo.getValue("MapCode");
		//if (saveIcons(mapCode)==false) { // 단말 리스트 변경사항이 없으면 바로 성공 메세지
			dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Saved"));
		//}
	}else{
		//dialogAlert(app, "Submission Error", resultCode, "");
		dialogAlert(app, "Submission Error", dataManager.getString(getErrorString(resultCode)), "");
	}
}


/*
 * "삭제" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnDelRowClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var btnDelRow = e.control;
	var grdAreaList = app.lookup("grdAreaList");
	var selectRow = grdAreaList.getSelectedRow();
	if(!selectRow){
		dialogAlert(app, "", dataManager.getString("Str_NoSelection"), "");
		return;
	}
	dialogConfirm(app, "", dataManager.getString("Str_DeleteConfirm"), function(/*cpr.controls.Dialog*/dialog){
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				deleteMode = "areaDelete";
				var smsDeleteMapAreaInfo = app.lookup("sms_deleteMapAreaInfo");
				smsDeleteMapAreaInfo.action = "/v1/map/areas/"+selectRow.getValue("MapCode");
				smsDeleteMapAreaInfo.send();
				smsDeleteMapAreaInfo.addEventListenerOnce("submit-success", function(e){
					//아이콘 삭제 (컨트롤 삭제 - 데이터 삭제)
					var oArea = app.lookup("grpDragArea");
					var iconValues = [];
					oArea.getChildren().forEach(function(/* cpr.controls.UIControl */ each){
						var eachID = each.id;
						if( eachID && eachID.indexOf("rowIcon")!=-1){
							iconValues.push(each.userAttr("TerminalID"));
							oArea.removeChild(each);
						}
					});
					if(iconValues.length>0){
						iconValues.forEach(function(/* Object */ each){
							deleteIcon(selectRow.getValue("MapCode"), each);
						});
					}
					//그리드 로우 삭제
					grdAreaList.deleteRow(selectRow.getIndex());
					grdAreaList.redraw();
					//image 컨트롤 src 초기화
					var img = app.lookup("VMTMS_imgArea");
					img.src = "";
					//변경된 상태 locationRegistArea 팝업에 전달
					cpr.core.NotificationCenter.INSTANCE.post("areaStateChange", {});
					dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_DeleteNotify"), "");
				});
			}else{
				return;
			}
		});
	});
}





/*
 * 그룹에서 contextmenu 이벤트 발생 시 호출.
 * 마우스의 오른쪽 버튼이 클릭되거나 컨텍스트 메뉴 키가 눌려지면 호출되는 이벤트.
 */
function onGrpDragAreaContextmenu(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Container
	 */
	var grpDragArea = e.control;
	e.preventDefault();
}



/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAreaHelpImageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

// 구역 단말 추가 완료
function onSms_setMapAreaTerminalSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	var resultMap = app.lookup("Result");
	var resultCode = resultMap.getValue("ResultCode");
	if(resultCode==COMERROR_NONE){		 
		//dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Saved"));		
	}	
}
