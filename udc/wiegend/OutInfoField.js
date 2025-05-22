/************************************************
 * OutInfoField.js
 * Created at 2019. 4. 2. 오전 8:54:55.
 *
 * @author osm8667
 ************************************************/
var dataManager = getDataManager();
var enableNum = 0;                      /*custom size의 필드 가용 수*/
var clickedValue = null;                /*카테고리에서 선택한 값*/
var fieldClickedValue = null;           /*필드에서 선택한 값의 종류*/
var parityPosition = 0;                 /*패리티 필드 값*/
var parityDataLength = 0;               /*패리티 데이터 길이 10개이상 못넣게*/
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
}


/**
 * 비트 필드에 버튼 append
 * @param {any} dataStr
 * @param {any} label
 */
function setBitData(/*String*/dataStr, label){
	var checkArr = dataStr.split(",");
	checkArr.forEach(function(/* String */ pos){
		/**
		 * @type cpr.controls.Container
		 */
		var bitItemGrp = app.lookup(pos);
		if(bitItemGrp){
			var bitItem = createBitItems(label, pos.toString());
			bitItemGrp.addChild(bitItem, {
				"colIndex": 0,
				"rowIndex": 0,
				"horizontalAlign": "fill",
				"verticalAlign": "fill"
			});
		}
	});
}


/**
 * 패리티 필드에 버튼 append
 */
function setBitParityData(){
	var parityData = app.lookup("Parity");
	var parityRowData = parityData.getRowDataRanged();
	parityRowData.forEach(function(/* cpr.data.RowConfigInfo */ each){
		var checkValue = each.Position;
		var checkType = each.Type==1?"O":"E";
		/**
		 * @type cpr.controls.Container
		 */
		if(checkType == "E" || checkType == "O") {// 0  -> id 
			checkValue += 1;
		}
		var bitItemGrp = app.lookup(checkValue.toString());
		if(bitItemGrp){
			var bitItem = createBitItems(checkType, checkValue.toString());
			bitItemGrp.addChild(bitItem, {
				"colIndex": 0,
				"rowIndex": 0,
				"horizontalAlign": "fill",
				"verticalAlign": "fill"
			});
		}
	});
}


/**
 * 비트 버튼을 리턴한다.
 * @param {any} value 버튼의 라벨로 쓰일 값
 * @param {any} position 위치정보
 */
function createBitItems(value, position){
	var bitButton = new cpr.controls.Button();
	bitButton.style.css({
		"background-color" : "red",
		"border-radius" : "0px 0px 0px 0px",
		"border" : "0px"
	});
	bitButton.text = value==""?"":value;
	bitButton.userAttr("pos", position);
	if(value!="O" || value!="E"){
		bitButton.userAttr("col", generateColName(value));//라벨 값에 따른 데이터맵 컬럼명을 userAttr에 저장
	}
	bitButton.addEventListener("click", onBitItemButtonClick);
	return bitButton;
}



/**
 * 카테고리 영역을 만든다.
 * @param buttonLabel
 * @param outputLabel
 * @param color
 * @param index
 */
function makeCategories(buttonLabel, outputLabel, color, index){
	var container = app.lookup("grpCategories");
	var cateButton = new cpr.controls.Button();
	cateButton.value = buttonLabel;
	cateButton.style.css("background-color",color);
	cateButton.style.css("color", "#000000");
	cateButton.addEventListener("click", onBtnCateClick);
	container.addChild(cateButton, {
		"colIndex": 0,
		"rowIndex": index,
		"horizontalAlign": "center",
		"verticalAlign": "center",
		"height": 17,
		"width": 17
	});

	var cateOutput = new cpr.controls.Output("optCate_"+buttonLabel);
	cateOutput.value = outputLabel;
	cateOutput.style.css({
		"cursor" : "pointer"
	});
	cateOutput.userAttr("val", buttonLabel);
	cateOutput.addEventListener("click", onBtnCateClick);
	container.addChild(cateOutput, {
		"colIndex": 1,
		"rowIndex": index
	});
}


/**
 * 카테고리 클릭 이벤트
 */
function onBtnCateClick(/*cpr.events.CMouseEvent*/e){
	var control = e.control;
	var categories = app.lookup("grpCategories");
	var children = categories.getChildren();
	children.forEach(function(/* cpr.controls.UIControl */ each){
		if(each.type == "output"){
			if(each.style.getCSS("background-color")){
				each.style.removeStyle("background-color");
			}
		}
	});

	resetParity();//패리티 필드 초기화

	var value = control.type=="button"?control.value:control.userAttr("val");
	if(clickedValue == value) { // 같은 카테고리를 한번 더 클릭하면 해제
		clickedValue = null;
		return;
	}
	var targetOutput = app.lookup("optCate_" + value);
	targetOutput.style.css("background-color", "#f0f0f0");
	clickedValue = value;

}


/*
 * 그룹에서 contextmenu 이벤트 발생 시 호출.
 * 마우스의 오른쪽 버튼이 클릭되거나 컨텍스트 메뉴 키가 눌려지면 호출되는 이벤트.
 */
function onFieldContextmenu(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Container
	 */
	var control = e.control;
	e.preventDefault();
}


/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function on_BitItemClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Container
	 */
	var bitItemGrp = e.control;
	e.stopImmediatePropagation();

	var bitItemGrpID = bitItemGrp.id;
	var bitItemGrpChild = bitItemGrp.getChildrenCount();
	if(bitItemGrpID<129){
		//비트필드
		if(bitItemGrpChild==0 && clickedValue){
			appendFieldButton(bitItemGrpID);
		}
	}else{
		var parityItem = createParityItems();
		bitItemGrp.addChild(parityItem, {
			"colIndex": 0,
			"rowIndex": 0,
			"horizontalAlign": "fill",
			"verticalAlign": "fill"
		});
		addParityData(bitItemGrpID);
	}
}


/*
 * 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBitItemButtonClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var bitItemButton = e.control;
	e.preventDefault();
	fieldClickedValue = bitItemButton.text;

	var bitItemGrpID = bitItemButton.getParent().id;
	var colName = bitItemButton.userAttr("col");
	resetParity();
	if(bitItemButton.text == "O" || bitItemButton.text == "E"){
		if(clickedValue && clickedValue != bitItemButton.text){//오버랩의 경우
			bitItemButton.dispose();
			appendFieldButton(bitItemGrpID);
			var parityData = app.lookup("Parity");
			var parityRow = parityData.findFirstRow("Position=="+bitItemGrpID);
			if(clickedValue=="O"||clickedValue=="E"){
				var parityType = clickedValue=="O"?1:2;
				parityRow.setValue("Type", parityType);
				parityRow.setValue("MaskBits", "");
			}else{
				parityData.realDeleteRow(parityRow.getIndex());
			}
		}else{
			setParity();
			setParityItems(bitItemButton.userAttr("pos"));
			parityPosition = bitItemButton.userAttr("pos");
		}
	}else{
		if(clickedValue && clickedValue != bitItemButton.text){//오버랩의 경우
			bitItemButton.dispose();
			appendFieldButton(bitItemGrpID);
			deleteFieldData(bitItemGrpID, colName);
		}
	}
}


/**
 * 만약 비트 필드를 표현하는 데이터 맵의 컬럼명이 변경되면 같이 변경
 * @param {any} code
 */
function generateColName(code){
	var colName = "";
	if(code == "S"){
		colName = "MaskSiteCode";
	}else if(code == "D"){
		colName = "MaskUserID";
	}else if(code == "0"){
		colName = "MaskFixed0";
	}else if(code == "1"){
		colName = "MaskFixed1";
	}
	return colName;

}


/**
 * 비트 필드에 버튼을 append한다.
 * @param {String} grpID
 */
function appendFieldButton(grpID){
	var bitItemGrpID = grpID;
	var bitItem = createBitItems(clickedValue, bitItemGrpID);

	changeFieldData(bitItemGrpID, bitItem.userAttr("col"));

	if(clickedValue == "O" || clickedValue == "E"){
		var limit = checkParityLength();
		if(limit){
			dialogAlert(app.getHostAppInstance(), "", dataManager.getString("Str_NoAddMore"), "");
			return;
		}
		var addMaskBits = 0;
		var tmpParityPosition = bitItemGrpID -1;
		var parityData = app.lookup("Parity");
		var parityRow = parityData.findFirstRow("Position=="+tmpParityPosition);
		if(parityRow){//업데이트
			var maskBits = parityRow.getValue("MaskBits");
			parityRow.setValue("MaskBits", maskBits?maskBits + ","+ addMaskBits:addMaskBits);
		} else {
			var tempParity = {};
			tempParity.Type = clickedValue=="O"?1:2;
			tempParity.Position = parseInt(tmpParityPosition);
			tempParity.MaskBits = addMaskBits;
			parityData.addRowData(tempParity);
		}
	}
	var bitItemGrp = app.lookup(bitItemGrpID);
	bitItemGrp.addChild(bitItem, {
		"colIndex": 0,
		"rowIndex": 0,
		"horizontalAlign": "fill",
		"verticalAlign": "fill"
	});
}


/**
 * 패리티의 갯수는 최대 10개.
 */
function checkParityLength(){

	var field = app.lookup("grpFieldDetail");
	var children = field.getChildren();
	var parityArr = [];
	var limit = false;
	children.forEach(function(/* cpr.controls.UIControl */ each, idx){
		if(each.type == "container"){
			/**
			 * @type cpr.controls.Container
			 */
			var grp = each;
			if(grp.getChildrenCount()==1){
				var button = grp.getChildren()[0];
				if(button.text == "O" || button.text == "E"){
					parityArr.push(button);
				}
			}
		}
	});
	var totalLength = parityDataLength + parityArr.length;
	if(totalLength==10){
		limit = true;
	}
	return limit
}


/*
 * 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onParityItemButtonClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var parityItemButton = e.control;
	e.stopImmediatePropagation();
	var parentPos = parseInt(parityItemButton.getParent().id);

	var parityData = app.lookup("Parity");
	var parityRow = parityData.findFirstRow("Position=="+parityPosition);
	if(parityRow){
		var maskBits = parityRow.getValue("MaskBits");
		var maskBitsArr = maskBits.split(",");
		var delIndex = maskBitsArr.indexOf((parentPos-128).toString());
		if(maskBitsArr.length>0){
			if(delIndex>-1){
				 maskBitsArr.splice(delIndex, 1);
			}
		}
		parityRow.setValue("MaskBits", maskBitsArr.toString());
	}
	parityItemButton.dispose();
}


/**
 * 패리티 버튼을 리턴한다.
 */
function createParityItems(){
	var parityButton = new cpr.controls.Button();
	parityButton.style.css({
		"background-color" : "#000000",
		"border-radius" : "0px 0px 0px 0px",
		"border" : "0px"
	});
	parityButton.text = "V";
	parityButton.addEventListener("click", onParityItemButtonClick);
	return parityButton;
}


/**
 * 패리티의 가용 구역 설정
 */
function setParity(){
	var field = app.lookup("BitParity");
	var children = field.getChildren();
	children.forEach(function(/* cpr.controls.UIControl */ each, idx){
		if(each.type == "container"){
			/**
			 * @type cpr.controls.Container
			 */
			var grp = each;
			grp.enabled = false;
			if(idx < enableNum){
				grp.enabled = true;
			}
		}
	});
}


/**
 * 전달받은 위치 정보에 패리티 버튼을 append한다.
 * @param {any} position
 */
function setParityItems(position){
	var parityData = app.lookup("Parity");
	var parityRow = parityData.findFirstRow("Position=="+parseInt(position));
	if(parityRow){
		var checkType = parityRow.getValue("Type")==1?"O":"E";
		var checkValue = parityRow.getValue("MaskBits");
		var checkArr = checkValue.split(",");
		checkArr.forEach(function(pos){
			if(pos){
				/**
				 * @type cpr.controls.Container
				 */
				var parityItemGrp = app.lookup((parseInt(pos) + 128).toString());
				var parityItem = createParityItems();
				parityItemGrp.addChild(parityItem, {
					"colIndex": 0,
					"rowIndex": 0,
					"horizontalAlign": "fill",
					"verticalAlign": "fill"
				});
			}
		});
	}
}


/**
 * 변경된 필드 아이템 데이터맵에 반영
 * @param {String} groupID
 * @param {any} columnName
 */
function changeFieldData(groupID, columnName){
	if(columnName){
		var outBasicInfo = app.lookup("OutBasicInfo");
		var getValue = outBasicInfo.getValue(columnName);
		//기존 데이터가 존재하면 + 해주고, 없다면 그룹아이디(위치정보)만 set
		outBasicInfo.setValue(columnName, getValue?getValue + ","+ groupID:groupID);
	}
}


/**
 * 비트 필드 데이터에서 선택한 아이템을 삭제한다.
 * @param {String} groupID
 * @param {any} columnName
 */
function deleteFieldData(groupID, columnName){
	var outBasicInfo = app.lookup("OutBasicInfo");
	var getValue = outBasicInfo.getValue(columnName);
	var maskBitsArr = getValue.split(",");
	var delIndex = maskBitsArr.indexOf(groupID);
	if(maskBitsArr.length>0){
		if(delIndex>-1){
			 maskBitsArr.splice(delIndex, 1);
		}
	}
	outBasicInfo.setValue(columnName, maskBitsArr.toString());
}


/**
 * 패리티 데이터를 업데이트 혹은 등록한다.
 * @param {any} grpPosition
 */
function addParityData(grpPosition){
	if(!fieldClickedValue){
		return;
	}
	var addMaskBits = parseInt(grpPosition)-128;
	var parityData = app.lookup("Parity");
	var parityRow = parityData.findFirstRow("Position=="+parityPosition);
	if(parityRow){//업데이트
		var maskBits = parityRow.getValue("MaskBits");
		parityRow.setValue("MaskBits", maskBits?maskBits + ","+ addMaskBits:addMaskBits);
	}else{//추가
		var tempParity = {};
		tempParity.Type = fieldClickedValue=="O"?1:2;
		tempParity.Position = parseInt(parityPosition);
		tempParity.MaskBits = addMaskBits;
		parityData.addRowData(tempParity);
	}
}


function resetParity(){
	var field = app.lookup("BitParity");
	var children = field.getChildren();
	children.forEach(function(/* cpr.controls.UIControl */ each){
		if(each.type == "container"){
			/**
			 * @type cpr.controls.Container
			 */
			var grp = each;
			grp.enabled = false;
			var grpChildren = grp.getChildren();
			grpChildren.forEach(function(/* cpr.controls.UIControl */ each){
				each.dispose();
			});
		}
	});//비트필드 초기화
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
	var evt = new cpr.events.CValueChangeEvent("nbeValueChange",{
		newValue: e.newValue
	});
	app.dispatchEvent(evt);
}


exports.setCategoriesFilter = function(code){
	var categories = app.lookup("categories");
	var filteredData = categories.getRowDataRanged();
	filteredData.forEach(function(/* cpr.data.RowConfigInfo */ each, index){
		makeCategories(each.Code , each.Name, each.Background, index);
	});
}


exports.setFieldData = function(dataMap, dataSet){
	//패리티 및 일반 데이터 셋
	var fieldData = app.lookup("OutBasicInfo");
	var parityData = app.lookup("Parity");
	fieldData.build(dataMap.getDatas());
	parityData.build(dataSet.getRowDataRanged(), false);
	
	parityData.commit();
	parityDataLength = parityData.getRowCount();
	var bits = fieldData.getValue("Bits");
	var nbe = app.lookup("nbe1");

	if(bits ==0||bits ==129||bits==130){
		nbe.value = 0;
		nbe.enabled = false;
	}else{
		nbe.value = bits;
		fieldData.setValue("Bits", 1);
		nbe.enabled = true;

	}

	/**
	 * @type String
	 */
	var siteCodes = fieldData.getValue("MaskSiteCode");
	var userIDs = fieldData.getValue("MaskUserID");
	var maskFixed_0 = fieldData.getValue("MaskFixed0");
	var maskFixed_1 = fieldData.getValue("MaskFixed1");
	//데이터 맵의 컬럼명이 카테고리 상의 코드와 연결이 안되어 라벨값으로 활용이 어려우므로 수동으로 값을 넣어준다.
	setBitData(siteCodes, "S");
	setBitData(userIDs, "D");
	setBitData(maskFixed_0, "0");
	setBitData(maskFixed_1, "1");
	setBitParityData();

	var grpInInfo = app.lookup("grpBasicInfo");
	grpInInfo.redraw();
}


/**
 * 사용자 지정 크기를 받아 비트 필드의 disable을 설정합니다.
 * @param num
 */
exports.setField = function(/*Number*/ num){
	enableNum = num;
	var field = app.lookup("grpFieldDetail");
	var children = field.getChildren();
	children.forEach(function(/* cpr.controls.UIControl */ each, idx){
		if(each.type == "container"){
			/**
			 * @type cpr.controls.Container
			 */
			var grp = each;
			grp.enabled = false;
			if(idx < enableNum){
				grp.enabled = true;
			}
		}
	});
}


exports.getFieldValues = function(){
	var cmbBits = app.lookup("cmb2");	
	var cpBasicInfo = app.lookup("OutBasicInfoRet");
	
	app.lookup("OutBasicInfo").copyToDataMap(cpBasicInfo);
//	cpBasicInfo.copy
	
	// bit length combo box의 값이 custom size인 경우 Bits의 값을 custom size값으로 설정 
	if (cpBasicInfo.getValue("Bits") == 1) {
		cpBasicInfo.setValue("Bits", app.lookup("nbe1").value);
	} else {
//		cpBasicInfo.setValue("Bits", 0);
	}
	
	//return app.lookup("OutBasicInfo").getDatas();
	return cpBasicInfo.getDatas();
}


exports.getParityValues = function(){
	var parityData = app.lookup("Parity");
	return parityData.getRowDataRanged();
}


exports.resetField = function(){
	//비트필드 초기화
	var field = app.lookup("grpFieldDetail");
	var children = field.getChildren();
	children.forEach(function(/* cpr.controls.UIControl */ each){
		if(each.type == "container"){
			/**
			 * @type cpr.controls.Container
			 */
			var grp = each;
			grp.enabled = false;
			var grpChildren = grp.getChildren();
			grpChildren.forEach(function(/* cpr.controls.UIControl */ button){
				button.dispose();
			});
		}
	});
	//카테고리 클릭 초기화
	var categories = app.lookup("grpCategories");
	var children = categories.getChildren();
	children.forEach(function(/* cpr.controls.UIControl */ each){
		if(each.type == "output"){
			if(each.style.getCSS("background-color")){
				each.style.removeStyle("background-color");
			}
		}
	});
	clickedValue = null;
	//parity 초기화
	resetParity();
	//custom size disabled 처리
	app.lookup("nbe1").enabled = false;
}


exports.resetInfo = function(){
	var outInfoMap = app.lookup("OutBasicInfo");
	outInfoMap.reset();
	app.lookup("nbe1").value = "0";
	var grpInInfo = app.lookup("grpBasicInfo");
	grpInInfo.redraw();
}


exports.resetDataSet = function(){
	//데이터셋 초기화
	var perityList = app.lookup("Parity");
	parityDataLength = 0;
	perityList.clear();
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmb2SelectionChange(/* cpr.events.CSelectionEvent */ e){
	/**
	 * @type cpr.controls.ComboBox
	 */
	var cmb2 = e.control;
	var nbe = app.lookup("nbe1");
	if(cmb2.value == 1){
		nbe.enabled = true;
	}else{
		nbe.enabled = false;
	}
}


/*
 * "" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onWDOUS_btnSendtoTerminalClick(/* cpr.events.CMouseEvent */ e){
	app.getRootAppInstance().openDialog("app/main/terminals/popup/terminalTinyList", {width: 390, height: 570}, function(dialog){
		dialog.ready(function(dialogApp){
			dialog.initValue = {
				"PopupType": "MultiCheck"
			};
			dialog.bind("headerTitle").toLanguage("Str_TerminalList");
			dialog.modal = true;
		});
	}).then(function(returnValue){
		if (returnValue) { // 단말로 전송
			//console.log(app.lookup("OutBasicInfo").getDatas());
			var hostAppIns = app.getHostAppInstance();
			var bOptStatus = hostAppIns.callAppMethod("smsPutWiegandtoTerminal", "out", returnValue);
		} else { // 취소

		}
	});
}

function onWDOUS_btnReadingFromTerminalClick(/* cpr.events.CMouseEvent */ e){
	app.getRootAppInstance().openDialog("app/main/terminals/popup/terminalTinyListRead", {width: 390, height: 570}, function(dialog){
		dialog.ready(function(dialogApp){
			dialog.initValue = {
				"PopupType": "SingleCheck"
			};
			dialog.bind("headerTitle").toLanguage("Str_TerminalList");
			dialog.modal = true;
		});
	}).then(function(returnValue){
		if (returnValue) { // 단말로 전송
			var terminalRow = returnValue.getRow(0);
			var terminalID = terminalRow.getValue("TerminalID");

			var hostAppIns = app.getHostAppInstance();
			var bOptStatus = hostAppIns.callAppMethod("smsGetWiegandFromTerminal", "out", terminalID);
		} else { // 취소

		}
	});
}
