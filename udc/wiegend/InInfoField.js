/************************************************
 * InInfoField.js
 * Created at 2019. 4. 2. 오전 8:54:55.
 *
 * @author osm8667
 ************************************************/
var dataManager = getDataManager();
var enableNum = 0;                     /*custom size의 필드 가용 수*/
var clickedValue = null;               /*카테고리에서 선택한 값*/
var fieldClickedValue = null;          /*필드에서 선택한 값의 종류*/
var parityPosition = 0;                /*패리티 필드 값*/
var parityDataLength = 0;              /*패리티 데이터 길이 10개이상 못넣게*/

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
}


/**
 * 구성된 데이터를 각 필드에 바인딩
 */
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
				var bitItemGrp = app.lookup(pos);//비트를 표시할 그룹의 아이디는 위치값과 같다
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
		if(checkType == "E" || checkType == "O") {// 0  -> id 값을 1변경
			checkValue += 1;
		}
		var bitItemGrp = app.lookup(checkValue.toString());//비트를 표시할 그룹의 아이디는 위치값과 같다
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
 * 각 필드에 버튼 생성
 * @param {any} value
 * @param {any} position
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
	cateOutput.userAttr("val", buttonLabel);//output을 클릭해도 버튼 클릭한 것과 동일하게 이벤트 발생하게 설정
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

	var value = control.type=="button"?control.value:control.userAttr("val");//버튼을 클릭했으면 버튼의 값, 아웃풋을 클릭했으면 위에서 설정한 userAttr의 값
	if(clickedValue == value) { // 같은 카테고리를 한번 더 클릭하면 해제
		clickedValue = null;
		return;
	}
	var targetOutput = app.lookup("optCate_" + value);
	targetOutput.style.css("background-color", "#f0f0f0");//선택효과 css
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
 * 버튼이 없는 그룹에서 click 이벤트 발생 시 호출.
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
		if(bitItemGrpChild==0 && clickedValue){//카테고리를 선택했고 그룹에 버튼이 존재하지 않을때
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
 * 필드에 append 된 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBitItemButtonClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var bitItemButton = e.control;
	e.preventDefault();
	fieldClickedValue = bitItemButton.text;
	if(!clickedValue){
		clickedValue = bitItemButton.text;
		var cateOutput = app.lookup("optCate_" + clickedValue);
		cateOutput.style.css("background-color", "#f0f0f0");//선택효과 css
	}
	var cmbDataType = app.lookup("cmbDataType");
	var ipbDigitSize = app.lookup("ipbDigitSize");
	var cmbOrder = app.lookup("cmbOrder");
	resetParity();
	var bitItemGrpID = bitItemButton.getParent().id;
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


/**
 * 그룹에 버튼 append
 * @param {String} grpID 그룹 컨트롤 아이디
 */
function appendFieldButton(grpID){
	var bitItemGrpID = grpID;
	changeFieldData(bitItemGrpID);
	if(clickedValue == "O" || clickedValue == "E"){
		var limit = checkParityLength();//패리티 데이터 갯수 제한 확인
		if(limit){
			dialogAlert(app.getHostAppInstance(), "", dataManager.getString("Str_NoAddMore"), "");
			return;
		}
		//패리티 값 체크해서 넣어주기
		//addParityData(bitItemGrpID);
		var addMaskBits = 0;
		var tmpParityPosition = bitItemGrpID -1;
		var parityData = app.lookup("Parity");
		
		var parityRow = parityData.findFirstRow("Position=="+tmpParityPosition);
		if(parityRow){//업데이트
			var maskBits = parityRow.getValue("MaskBits");
			parityRow.setValue("MaskBits", maskBits?maskBits + ","+ addMaskBits:addMaskBits);
		}else{//추가
			var tempParity = {};
			tempParity.Type = clickedValue=="O"?1:2;
			tempParity.Position = parseInt(tmpParityPosition);
			tempParity.MaskBits = addMaskBits;
			parityData.addRowData(tempParity);
		}
		console.log(parityData);
	}
	var bitItem = createBitItems(clickedValue, bitItemGrpID);
	var bitItemGrp = app.lookup(bitItemGrpID);
	bitItemGrp.addChild(bitItem, {
		"colIndex": 0,
		"rowIndex": 0,
		"horizontalAlign": "fill",
		"verticalAlign": "fill"
	});


}


/**
 * 패리티 데이터 길이를 체크하여 10개 이상이면 제한
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


/**
 * 하단 콤보박스 그룹 데이터 바인딩
 * @param {any} index
 */
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


/**
 * 패리티 버튼 컨트롤 생성
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


/**
 * 조회된 패리티 데이터를 표시
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
 * 변경된 비트 필드 데이터 반영
 * @param {String} groupID
 */
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


/**
 * 비트 필드 아이템 삭제
 * @param {String} groupID
 */
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


/**
 * 하단 콤보박스 그룹 값 데이터 반영
 * @param {String} columnName
 * @param {any} value
 */
function changeTypeData(columnName, value){
	if(!fieldClickedValue){
		return;
	}
	var convertFormat = app.lookup("ConvertFormat");
	var index = parseInt(fieldClickedValue);//"o" 와 "e" 를 제외한
	if(!isNaN(index)){
		var rowData = convertFormat.getRow(index-1);
		if(rowData){
			var convertType = rowData.getValue(columnName);
			rowData.setValue(columnName, value);
		}
	}
}


/**
 * 패리티 필드 특정 위치에 패리티 add
 * @param {any} grpPosition
 */
function addParityData(grpPosition){
	if(!fieldClickedValue){
		return;
	}
	var addMaskBits = parseInt(grpPosition)-128;//129부터기때문에 128을 빼줌
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


/**
 * 패리티 필드 초기화
 */
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
	});
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


/**
 *
 * @param {json} data ConvertFormat, Parity
 */
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
	fieldData.commit();
	parityData.commit();

	parityDataLength = parityData.getRowCount();
	setBitData();
}


/**
 *
 * @param {cpr.data.DataMap} data InBasicInfo
 */
exports.setInBasicInfo = function(/*cpr.data.DataMap*/data){
	var infoMap = app.lookup("InBasicInfo");
	infoMap.build(data.getDatas());

	var bits = infoMap.getValue("Bits");

	var nbe = app.lookup("nbe1");
	if (bits == 0 || bits ==129 || bits ==130) {//순서대로 사용안함 St. 26bit St. 34bit
		nbe.enabled = false;
	} else {
		infoMap.setValue("Bits", 1);
		nbe.enabled = true;
	}
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


/**
 * ConvertFormat 데이터를 전달한다.
 * @return {JSON}
 */
exports.getFieldValues = function(){
	var convertFormat = app.lookup("ConvertFormat");
	var returnData = convertFormat.getRowDataRanged();
	if(returnData.length==0){// 값이 없어도 구조는 전달
		for(var i=0;i<5;i++){
			convertFormat.addRowData({Type: 0, Digit: 0, Endian: 0, MaskBits:""});
		}
	}
	convertFormat.commit();
	return returnData;
}


/**
 * 패리티 필드의 값을 전달한다.
 * @return {JSON}
 */
exports.getParityValues = function(){
	var parityData = app.lookup("Parity");
	return parityData.getRowDataRanged();
}


/**
 * 전체 필드를 초기화한다.
 */
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
	//디테일 초기화
	var cmbDataType = app.lookup("cmbDataType");
	var ipbDigitSize = app.lookup("ipbDigitSize");
	var cmbOrder = app.lookup("cmbOrder");
	cmbDataType.value = 0;
	ipbDigitSize.value = 0;
	cmbOrder.value = 0;
	//parity 초기화
	resetParity();
	//custom size disabled 처리
	app.lookup("nbe1").enabled = false;
}


/**
 * InBasicInfo 데이터맵을 전달한다.
 * @return {JSON}
 */
exports.getInBasicInfo = function(){
	var infoMap = app.lookup("InBasicInfo");
	return infoMap.getDatas();
}


/**
 * InBasicInfo 데이터 맵을 초기화하고 해당 데이터가 바인딩 되어있는 컨트롤을 다시그린다.
 */
exports.resetInfo = function(){
	var inInfoMap = app.lookup("InBasicInfo");
	inInfoMap.reset();
	var grpInInfo = app.lookup("grpBasicInfo");
	grpInInfo.redraw();
}


/**
 * ConvertFormat 및 Parity 데이터 셋을 초기화 한다.
 */
exports.resetDataSet = function(){
	//데이터셋 초기화
	var convertFormat = app.lookup("ConvertFormat");
	convertFormat.clear();
	for(var i=0;i<5;i++){//구조는 가지고 있어야함
		convertFormat.addRowData({Type: 0, Digit: 0, Endian: 0, MaskBits:""});
	}
	var perityList = app.lookup("Parity");
	perityList.clear();
	parityDataLength = 0;
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
 * "단말기로 전송" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onWDINS_btnSendtoTerminalClick(/* cpr.events.CMouseEvent */ e){
	app.getRootAppInstance().openDialog("app/main/terminals/popup/terminalTinyList", {width: 390, height: 570}, function(dialog){
		dialog.ready(function(dialogApp){
			dialog.initValue = {
				"PopupType": "MultiCheck"
			};
			dialog.modal = true;
			dialog.bind("headerTitle").toLanguage("Str_TerminalList");
		});
	}).then(function(returnValue){
		if (returnValue) { // 단말로 전송
			var hostAppIns = app.getHostAppInstance();
			var bOptStatus = hostAppIns.callAppMethod("smsPutWiegandtoTerminal", "in", returnValue);
		} else { // 취소

		}
	});
}

function onWDINS_btnReadingFromTerminalClick(/* cpr.events.CMouseEvent */ e){
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
			var bOptStatus = hostAppIns.callAppMethod("smsGetWiegandFromTerminal", "in", terminalID);
		} else { // 취소

		}
	});
}
