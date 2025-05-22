/************************************************
 * setFields.js
 * Created at 2019. 3. 14. 오후 2:38:40.
 *
 * @author osm8667
 ************************************************/
var enableNum = 0;
var clickedValue = null;
var fieldClickedValue = null;
var parityPosition = 0;
var inoutCode = null;

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	//카테고리 렌더링
	var categories = app.lookup("categories");
	categories.setFilter("Filter=='out'");
	var filteredData = categories.getRowDataRanged();
	filteredData.forEach(function(/* cpr.data.RowConfigInfo */ each, index){
		makeCategories(each.Code , each.Name, each.Background, index);
	});
}


function setBitData(){
	var fieldData = app.lookup("ConvertFormat");
	var parityData = app.lookup("Parity");

	var fieldRowData = fieldData.getRowDataRanged();
	fieldRowData.forEach(function(/* cpr.data.RowConfigInfo */ each, idx){
		var checkValue = each.MaskBits;
		var checkArr = checkValue.split(",");
		checkArr.forEach(function(pos){
			if(pos){
				/**
				 * @type cpr.controls.Container
				 */
				var bitItemGrp = app.lookup(pos);
				if(bitItemGrp){
					var bitItem = createBitItems(idx+1, pos.toString());
					bitItemGrp.addChild(bitItem, {
						"colIndex": 0,
						"rowIndex": 0,
						"horizontalAlign": "fill",
						"verticalAlign": "fill"
					});
				}
			}
		});
	});
	var parityRowData = parityData.getRowDataRanged();
	parityRowData.forEach(function(/* cpr.data.RowConfigInfo */ each){
		var checkValue = each.Position;
		var checkType = each.Type==1?"O":"E";
		/**
		 * @type cpr.controls.Container
		 */
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


function createBitItems(value, position){
	var bitButton = new cpr.controls.Button();
	bitButton.style.css({
		"background-color" : "red",
		"border-radius" : "0px 0px 0px 0px",
		"border" : "0px"
	});
	bitButton.text = value==""?"":value;
	bitButton.userAttr("pos", position);
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

	var cmbDataType = app.lookup("cmbDataType");
	var ipbDigitSize = app.lookup("ipbDigitSize");
	var cmbOrder = app.lookup("cmbOrder");
	cmbDataType.value = 0;
	ipbDigitSize.value = 0;
	cmbOrder.value = 0;
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

	var cmbDataType = app.lookup("cmbDataType");
	var ipbDigitSize = app.lookup("ipbDigitSize");
	var cmbOrder = app.lookup("cmbOrder");
	var bitItemGrpID = bitItemButton.getParent().id;
	resetParity();
	if(bitItemButton.text == "O" || bitItemButton.text == "E"){
		cmbDataType.value = 0;
		ipbDigitSize.value = 0;
		cmbOrder.value = 0;
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
			setParity(enableNum);
			setParityItems(bitItemButton.userAttr("pos"));
			parityPosition = bitItemButton.userAttr("pos");
		}
	}else{
		if(clickedValue && clickedValue != bitItemButton.text){//오버랩의 경우
			bitItemButton.dispose();
			appendFieldButton(bitItemGrpID);
			deleteFieldData(bitItemGrpID);
			getConvertFormatInfo(fieldClickedValue);
		}else{
			getConvertFormatInfo(fieldClickedValue);
		}
	}
}


function appendFieldButton(grpID){
	var bitItemGrpID = grpID;
	var bitItem = createBitItems(clickedValue, bitItemGrpID);
	var bitItemGrp = app.lookup(bitItemGrpID);
	bitItemGrp.addChild(bitItem, {
		"colIndex": 0,
		"rowIndex": 0,
		"horizontalAlign": "fill",
		"verticalAlign": "fill"
	});

	changeFieldData(bitItemGrpID);
}


function getConvertFormatInfo(index){
	var cmbDataType = app.lookup("cmbDataType");
	var ipbDigitSize = app.lookup("ipbDigitSize");
	var cmbOrder = app.lookup("cmbOrder");
	index = parseInt(index);
	//디테일 필드 조회
	var convertFormat = app.lookup("ConvertFormat");
	if(!isNaN(index)){
		var row = convertFormat.getRow(index-1);
		//DataType 영역
		if(row){
			cmbDataType.value = row.getValue("Type")==""?0:row.getValue("Type");
			ipbDigitSize.value = row.getValue("Digit")==""?0:row.getValue("Digit");
			cmbOrder.value = row.getValue("Endian")==""?0:row.getValue("Endian");
		}
	}else{
		cmbDataType.value = 0;
		ipbDigitSize.value = 0;
		cmbOrder.value = 0;
	}
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

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmbDataTypeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/**
	 * @type cpr.controls.ComboBox
	 */
	var cmbDataType = e.control;
	changeTypeData("Type", cmbDataType.value);
}


/*
 * 인풋 박스에서 value-change 이벤트 발생 시 호출.
 * 변경된 value가 저장된 후에 발생하는 이벤트.
 */
function onIpbDigitSizeValueChange(/* cpr.events.CValueChangeEvent */ e){
	/**
	 * @type cpr.controls.InputBox
	 */
	var ipbDigitSize = e.control;
	changeTypeData("Digit", ipbDigitSize.value);
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmbOrderSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/**
	 * @type cpr.controls.ComboBox
	 */
	var cmbOrder = e.control;
	changeTypeData("Endian", cmbOrder.value);
}


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


function setParity(/*Number*/ num){
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


function changeFieldData(groupID){
	var convertFormat = app.lookup("ConvertFormat");
	var index = parseInt(clickedValue);
	if(!isNaN(index)){
		var rowData = convertFormat.getRow(index-1);
		if(rowData){
			var maskBits = rowData.getValue("MaskBits");
			rowData.setValue("MaskBits", maskBits?maskBits + ","+ groupID:groupID);
		}
	}
}


function deleteFieldData(groupID){
	var convertFormat = app.lookup("ConvertFormat");
	var index = parseInt(fieldClickedValue);
	if(!isNaN(index)){
		var rowData = convertFormat.getRow(index-1);
		if(rowData){
			var maskBits = rowData.getValue("MaskBits");
			var maskBitsArr = maskBits.split(",");
			var delIndex = maskBitsArr.indexOf(groupID);
			if(maskBitsArr.length>0){
				if(delIndex>-1){
					 maskBitsArr.splice(delIndex, 1);
				}
			}
			rowData.setValue("MaskBits", maskBitsArr.toString());
		}
	}
}


function changeTypeData(columnName, value){
	if(!fieldClickedValue){
		return;
	}
	var convertFormat = app.lookup("ConvertFormat");
	var index = parseInt(fieldClickedValue);
	if(!isNaN(index)){
		var rowData = convertFormat.getRow(index-1);
		if(rowData){
			var convertType = rowData.getValue(columnName);
			rowData.setValue(columnName, value);
		}
	}
}


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


exports.setCategoriesFilter = function(code){
	inoutCode = code;
	var categories = app.lookup("categories");
	categories.setFilter("Filter=='"+code+"'");
	var grpCategories = app.lookup("grpCategories");
	grpCategories.removeAllChildren();
	var filteredData = categories.getRowDataRanged();
	filteredData.forEach(function(/* cpr.data.RowConfigInfo */ each, index){
		makeCategories(each.Code , each.Name, each.Background, index);
	});
	grpCategories.redraw();
	if(code == "out"){
		app.lookup("optDetailTitle").visible = false;
		app.lookup("grpDetailCombo").visible = false;
	}else{
		app.lookup("optDetailTitle").visible = true;
		app.lookup("grpDetailCombo").visible = true;
	}
}


exports.setFieldData = function(data){
	/**
	 * @type cpr.data.DataSet
	 */
	var convertTarget = data.ConvertFormat;
	/**
	 * @type cpr.data.DataSet
	 */
	var parityTarget = data.Parity;
	//패리티 및 일반 데이터 셋
	var fieldData = app.lookup("ConvertFormat");
	var parityData = app.lookup("Parity");
	fieldData.build(convertTarget.getRowDataRanged(), false);
	parityData.build(parityTarget.getRowDataRanged(), false);
	if(fieldData.getRowDataRanged().length==0){
		for(var i=0;i<5;i++){
			fieldData.addRowData({Type: 0, Digit: 0, Endian: 0, MaskBits:""});
		}
	}
	convertTarget.commit();
	parityTarget.commit();
	setBitData();
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
	var convertFormat = app.lookup("ConvertFormat");
	var returnData = convertFormat.getRowDataRanged();
	if(returnData.length==0){
		for(var i=0;i<5;i++){
			convertFormat.addRowData({Type: 0, Digit: 0, Endian: 0, MaskBits:""});
		}
	}
	convertFormat.commit();
	console.log(convertFormat.getRowDataRanged())
	return returnData;
}


exports.getParityValues = function(){
	var parityData = app.lookup("Parity");
	return parityData.getRowDataRanged();
}


exports.resetField = function(){
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
	});//비트필드 초기화
	//디테일 초기화
	var cmbDataType = app.lookup("cmbDataType");
	var ipbDigitSize = app.lookup("ipbDigitSize");
	var cmbOrder = app.lookup("cmbOrder");
	cmbDataType.value = 0;
	ipbDigitSize.value = 0;
	cmbOrder.value = 0;
	//parity 초기화
	resetParity();
}