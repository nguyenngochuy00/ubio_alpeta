/************************************************
 * setCardLayOut.js
 * Created at 2019. 7. 30. 오전 8:58:37.
 *
 * @author joymrk
 ************************************************/
// iCardInfo <-  일반카드와 지문카드에 따라 사용하는 데이터가 틀림
// 시리얼번호 사용시 L_TemplateSize = 표시형식임
// 표시형식은 0:Default, 1:Hex String, 2:Decimal String, 3:3,5 Decimal 임
// 카드 정보가 없는 경우 Default로 처리됨(SC카드:HEX String, RF카드:3,5 Decimal)

// dsCardLayoutData <- 섹터 정보 가져오기 , 저장 하기만 사용
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var StrLib = cpr.core.Module.require("lib/StrLib");
var FCALO_fpcardHeader = 32;
var inputValidManager = createInputValidator(app);
var usint_version;
/*
 * 서버 연결과 상관없이 프로그램 최초 싱핼
 * 주의 각 항목에 대해서 초기값을 세팅해 줘야 한다.
 */
function InitializeControl() {
	//--------------------------------------------------------------------------------------------> 일반카드 초기화
	app.lookup("BCALO_cmbCardCapacity").addItem(new cpr.controls.Item("1 k", 1));
	app.lookup("BCALO_cmbCardCapacity").addItem(new cpr.controls.Item("4 k", 4));
	app.lookup("BCALO_cmbCardCapacity").addItem(new cpr.controls.Item("8 k", 8));
	app.lookup("BCALO_rdbCardReadType").addItem(new cpr.controls.Item(dataManager.getString("Str_CardLayoutSettingCardSerialNo"), 0)); //-------> 인증방식
	app.lookup("BCALO_rdbCardReadType").addItem(new cpr.controls.Item(dataManager.getString("Str_CardLayoutSettingCardData"), 1));
	//app.lookup("BCALO_rdbCardReadType").addItem(new cpr.controls.Item("MAD", 2));		//--------< 인증방식
	app.lookup("BCALO_rdbCardSerialNumType").addItem(new cpr.controls.Item("Default", 0));	//----> 시리얼 인증방식
	app.lookup("BCALO_rdbCardSerialNumType").addItem(new cpr.controls.Item("Hexa String", 1));
	app.lookup("BCALO_rdbCardSerialNumType").addItem(new cpr.controls.Item("Decimal String", 2));
	app.lookup("BCALO_rdbCardSerialNumType").addItem(new cpr.controls.Item("3.5 Decimal", 3));//--< 시리얼 인증방식

	//--------------------------------------------------------------------------------------------< 일반카드 초기화
	//--------------------------------------------------------------------------------------------> 지문카드 초기화
	app.lookup("FCALO_cmbCardCapacity").addItem(new cpr.controls.Item("1 k", 1));
	app.lookup("FCALO_cmbCardCapacity").addItem(new cpr.controls.Item("4 k", 4));
	app.lookup("FCALO_cmbCardCapacity").addItem(new cpr.controls.Item("8 k", 8));
	app.lookup("FCALO_cmbFingerTemplateSize").addItem(new cpr.controls.Item("256", 256)); 	//----> 지문 템플릿 크기
	app.lookup("FCALO_cmbFingerTemplateSize").addItem(new cpr.controls.Item("320", 320));
	app.lookup("FCALO_cmbFingerTemplateSize").addItem(new cpr.controls.Item("400", 400));
	app.lookup("FCALO_cmbFingerTemplateSize").addItem(new cpr.controls.Item("800", 800));		//----< 지문 템플릿 크기
	app.lookup("FCALO_cmbFingerTemplateCount").addItem(new cpr.controls.Item("1", 1));		//----> 지문 템플릿 갯수
	app.lookup("FCALO_cmbFingerTemplateCount").addItem(new cpr.controls.Item("2", 2));
	app.lookup("FCALO_cmbFingerTemplateCount").addItem(new cpr.controls.Item("3", 3));
	app.lookup("FCALO_cmbFingerTemplateCount").addItem(new cpr.controls.Item("4", 4));
	app.lookup("FCALO_cmbFingerTemplateCount").addItem(new cpr.controls.Item("5", 5));		//----< 지문 템플릿 갯수
	
	//--------------------------------------------------------------------------------------------< 지문카드 초기화
	initBasicCardLayout();
	initFingerCardLayout();
}

function initBasicCardLayout() {
	app.lookup("BCALO_cmbCardCapacity").value = 1;
	app.lookup("BCALO_opbCardSector").value = 16; 
	app.lookup("BCALO_rdbCardReadType").value = 0;
	app.lookup("BCALO_rdbCardSerialNumType").value = 0;
	app.lookup("BCALO_ipbSectorStart").text = 10;	//섹터 정보 -> 시작
	app.lookup("BCALO_rdbKeyType").value = 96;		// KEY_TYEP
}

function initFingerCardLayout() {
	app.lookup("FCALO_cmbCardCapacity").value = 1;
	app.lookup("FCALO_opbCardSector").value = 16; 
	app.lookup("FCALO_SetSectorCount").value = 0;
	app.lookup("FCALO_rdbKeyType").value = 96;
	app.lookup("FCALO_cmbFingerTemplateSize").value = 256;
	app.lookup("FCALO_cmbFingerTemplateCount").value = 1;
	calculateMinimumSector();
}

/*
 * 최초 실행시 서버에서 데이터를 얻어왔을때 지정된 TAB 화면의 데이터를 채워준다.
 * 텝을 이동하는 경우, 신규 탭화면정보를 갱신 해 준다.
 */
function RefreshData(nCardType) {
	//---------------------------------------------------------------------------------------------------------> 카드 정보 (공통)
	var dmcardlayoutinfo = app.lookup("dmCardLayoutInfo"); 
	var nCardsize = dmcardlayoutinfo.getValue("CardSize");
	var nCardSector = nCardsize * 16;
	//---------------------------------------------------------------------------------------------------------< 카드 정보 (공통)
	if (nCardType == 0 ) { // 일반 카드
		app.lookup("BCALO_cmbCardCapacity").value = nCardsize;
		app.lookup("BCALO_opbCardSector").value = nCardSector; // 카드 섹터 수
		app.lookup("BCALO_rdbCardReadType").value = dmcardlayoutinfo.getValue("ReadType"); // 0, 1, 2
		app.lookup("BCALO_rdbCardSerialNumType").value = dmcardlayoutinfo.getValue("TemplateSize"); // 0,1,2,3
		
		LoadBasicCardLayoutSectorList();
		rdbCardReadTypeSelectionChange(dmcardlayoutinfo.getValue("ReadType"));
	} else { // 지문 카드
		//---------------------------------------------------------> 카드 정보
		app.lookup("FCALO_cmbCardCapacity").value = nCardsize;	
		app.lookup("FCALO_opbCardSector").value = nCardsize * 16;
		
		//---------------------------------------------------------< 
		app.lookup("FCALO_cmbFingerTemplateSize").value = dmcardlayoutinfo.getValue("TemplateSize");
		var templateCount = dmcardlayoutinfo.getValue("TemplateCount");
		if (templateCount == 0) {
			templateCount = 1;
		}
		app.lookup("FCALO_cmbFingerTemplateCount").value = templateCount;
		calculateMinimumSector();
		LoadFPCardLayoutSectorList();		
	}
	
	
}

function calculateMinimumSector() {
	var templateSize;
	var templateCount;
	var selectedFPTemplateSize = app.lookup("FCALO_cmbFingerTemplateSize").getSelection();
	if (selectedFPTemplateSize) {
		templateSize = selectedFPTemplateSize[0].label; //템플릿 크기
	} else {
		templateSize = 256;
	}
	
	var selectedFPTemplateCount = app.lookup("FCALO_cmbFingerTemplateCount").getSelection();
	if (selectedFPTemplateCount) {
		templateCount = selectedFPTemplateCount[0].label;
	} else {
		templateCount = 1;
	}
	  	
	var bufferSize = FCALO_fpcardHeader + (Number(templateCount) * Number(templateSize));
	app.lookup("FCALO_ipbMinSectorCount").value = Math.floor(bufferSize / 48);
	if (bufferSize % 48 > 0) {
		app.lookup("FCALO_ipbMinSectorCount").value = Math.floor(bufferSize / 48) + 1;
	}
}
/*
 * 일반카드의 저장된 섹터 리스트를 가지고 세팅하는 함수
 */
function LoadBasicCardLayoutSectorList() {
	var dsCardlayoutdata = app.lookup("dsCardLayoutData"); // 가져온 그리드 데이터
	if (dsCardlayoutdata == null) { //없으면 반환
		return;
	}
	var sumCardDataSize;
	var grdCardLayoutDataList = app.lookup("grdBasicCardLayoutDataList"); // 그리드 정보를 관리할 데이터 셋
	var index = dsCardlayoutdata.getRowCount(); 
	for (var i = 0 ; i < index; i++) {
		var rowData = dsCardlayoutdata.getRow(i); // Row Data
		var sector = ""+rowData.getValue("Sector"); // 섹터
		var strSector = StrLib.formattedString("000",String(sector), "left");
		var nKeyType = rowData.getValue("KeyType");
		var strKeyType = "";
		if (nKeyType == 96) { //0x60
			strKeyType = "A";
		} else {
			strKeyType = "B";
		}
		var dataLenght = rowData.getValue("Length");
		var tmpKeyValue = rowData.getValue("KeyValue");
		var strKeyValue = tmpKeyValue.substr(0, 2) + " " + tmpKeyValue.substr(2, 2) + " " + tmpKeyValue.substr(4, 2) + " " +
		 tmpKeyValue.substr(6, 2) + " " + tmpKeyValue.substr(8, 2) + " " + tmpKeyValue.substr(10, 2) + " " + tmpKeyValue.substr(12, 2);
		grdCardLayoutDataList.addRowData({"strSector": strSector, "nBlock": rowData.getValue("Block"), 
			"nStart": rowData.getValue("Start"), "nLength": dataLenght, "nKeyType":strKeyType,
			"SiteKey":strKeyValue, "AIDCode":rowData.getValue("AIDCode")});
		sumCardDataSize = Number(sumCardDataSize) + Number(dataLenght);
	}
	app.lookup("BCALO_CardDataSize").value = sumCardDataSize;
	if (index >0 ) {
		grdCardLayoutDataList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);	
	}
	
}

/*
 * 지문카드의 저장된 섹터 리스트를 가지고 세팅하는 함수
 */
function LoadFPCardLayoutSectorList() {
	var dsCardlayoutdata = app.lookup("dsCardLayoutData"); // 가져온 그리드 데이터
	if (dsCardlayoutdata == null) {
		return;
	}
	var grdFingerCardLayoutDataList = app.lookup("grdFingerCardLayoutDataList"); // 그리드 관리할 데이터셋
	var index = dsCardlayoutdata.getRowCount(); 
	
	var sumFPSectorCount=0;
	for (var i = 0 ; i < index; i++) {
		var rowData = dsCardlayoutdata.getRow(i); // Row Data
		var sector = ""+rowData.getValue("Sector"); // 섹터
		var strSector = StrLib.formattedString("000",String(sector), "left");
		var nKeyType = rowData.getValue("KeyType");
		var strKeyType = "";
		if (nKeyType == 96) { //0x60
			strKeyType = "A";
		} else {
			strKeyType = "B";
		}
		var tmpKeyValue = rowData.getValue("KeyValue");
		var strKeyValue = tmpKeyValue.substr(0, 2) + " " + tmpKeyValue.substr(2, 2) + " " + tmpKeyValue.substr(4, 2) + " " +
		 tmpKeyValue.substr(6, 2) + " " + tmpKeyValue.substr(8, 2) + " " + tmpKeyValue.substr(10, 2) + " " + tmpKeyValue.substr(12, 2);
		 grdFingerCardLayoutDataList.addRowData({"strSector": strSector, "nKeyType":strKeyType, "SiteKey":strKeyValue});
		 sumFPSectorCount += 1;
	}
	app.lookup("FCALO_SetSectorCount").value = sumFPSectorCount;
	if (index >0 ) {
		grdFingerCardLayoutDataList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);	
	}
}

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();	
	comLib = createComUtil(app);
	InitializeControl(); // 초기화 진행 UI
	
	comLib.showLoadMask( "", dataManager.getString("Str_CardLayoutInfomation"), "",0);
	var requestData = app.lookup("sms_getCardInfo");
	requestData.send(); // 초기 값 얻어 오기	
}
//------------------------------------------------------------------------------------------------------------------>
function onSms_getCardInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		// 0. 일반 카드 // 1. 지문 카드 분기   <- 둘다 쓸수는 없다.
		var nCardType = app.lookup("dmCardLayoutInfo").getValue("CardType");// 0: 일반 카드, 1: 지문카드
		
		var tabitems = app.lookup("SCALA_tfdMain").getTabItems();	
		app.lookup("SCALA_tfdMain").setSelectedTabItem(tabitems[nCardType]);	
		
		RefreshData(nCardType);
	} else {
		// 가져오기 실패 
	}
	app.lookup("SCALA_tfdMain").redraw();
}

function onSms_getCardInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getCardInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
//------------------------------------------------------------------------------------------------------------------<

/*
 * 라디오 버튼에서 selection-change 이벤트 발생 시 호출.
 * 라디오버튼 아이템을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onBCALO_rdbCardAuthTypeSelectionChange(/* cpr.events.CSelectionEvent */ e){ 
	var bCALO_rdbCardReadType = e.control;
	rdbCardReadTypeSelectionChange(Number(bCALO_rdbCardReadType.value));
	
	var BCALO_rdbCardReadType = app.lookup("BCALO_rdbCardReadType");
	//console.log(BCALO_rdbCardReadType.getSelection()[0].value);
	if(BCALO_rdbCardReadType.getSelection()[0].value == 1 || BCALO_rdbCardReadType.getSelection()[0].value == 2){
		//20190827 정래훈 인풋에 값이 없으면 경고 표시를 주기위해 작성
		var BCALO_ipbKeyValue1 = app.lookup("BCALO_ipbKeyValue1").value;
		if(!BCALO_ipbKeyValue1){
			inputValidManager.validate(app.lookup("BCALO_ipbKeyValue1"), "isNull", dataManager.getString("Str_RequiredAlert"));
		}
		var BCALO_ipbKeyValue2 = app.lookup("BCALO_ipbKeyValue2").value;
		if(!BCALO_ipbKeyValue2){
			inputValidManager.validate(app.lookup("BCALO_ipbKeyValue2"), "isNull", dataManager.getString("Str_RequiredAlert"));
		}
		var BCALO_ipbKeyValue3 = app.lookup("BCALO_ipbKeyValue3").value;
		if(!BCALO_ipbKeyValue3){
			inputValidManager.validate(app.lookup("BCALO_ipbKeyValue3"), "isNull", dataManager.getString("Str_RequiredAlert"));
		}
		var BCALO_ipbKeyValue4 = app.lookup("BCALO_ipbKeyValue4").value;
		if(!BCALO_ipbKeyValue4){
			inputValidManager.validate(app.lookup("BCALO_ipbKeyValue4"), "isNull", dataManager.getString("Str_RequiredAlert"));
		}
		var BCALO_ipbKeyValue5 = app.lookup("BCALO_ipbKeyValue5").value;
		if(!BCALO_ipbKeyValue5){
			inputValidManager.validate(app.lookup("BCALO_ipbKeyValue5"), "isNull", dataManager.getString("Str_RequiredAlert"));
		}
		var BCALO_ipbKeyValue6 = app.lookup("BCALO_ipbKeyValue6").value;
		if(!BCALO_ipbKeyValue6){
			inputValidManager.validate(app.lookup("BCALO_ipbKeyValue6"), "isNull", dataManager.getString("Str_RequiredAlert"));
		}
		var BCALO_cmbSector = app.lookup("BCALO_cmbSector").value;
		if(!BCALO_cmbSector){
			inputValidManager.validate(app.lookup("BCALO_cmbSector"), "isNull", dataManager.getString("Str_RequiredAlert"), "comboBox");
		}
		var BCALO_ipbSectorLen = app.lookup("BCALO_ipbSectorLen").value;
		if(!BCALO_ipbSectorLen){
			inputValidManager.validate(app.lookup("BCALO_ipbSectorLen"), "isNull", dataManager.getString("Str_RequiredAlert"));
		}
	
		var FCALO_ipbKeyValue1 = app.lookup("FCALO_ipbKeyValue1").value;
		if(!FCALO_ipbKeyValue1){
			inputValidManager.validate(app.lookup("FCALO_ipbKeyValue1"), "isNull", dataManager.getString("Str_RequiredAlert"));
		}
		var FCALO_ipbKeyValue2 = app.lookup("FCALO_ipbKeyValue2").value;
		if(!FCALO_ipbKeyValue2){
			inputValidManager.validate(app.lookup("FCALO_ipbKeyValue2"), "isNull", dataManager.getString("Str_RequiredAlert"));
		}
		var FCALO_ipbKeyValue3 = app.lookup("FCALO_ipbKeyValue3").value;
		if(!FCALO_ipbKeyValue3){
			inputValidManager.validate(app.lookup("FCALO_ipbKeyValue3"), "isNull", dataManager.getString("Str_RequiredAlert"));
		}
		var FCALO_ipbKeyValue4 = app.lookup("FCALO_ipbKeyValue4").value;
		if(!FCALO_ipbKeyValue4){
			inputValidManager.validate(app.lookup("FCALO_ipbKeyValue4"), "isNull", dataManager.getString("Str_RequiredAlert"));
		}
		var FCALO_ipbKeyValue5 = app.lookup("FCALO_ipbKeyValue5").value;
		if(!FCALO_ipbKeyValue5){
			inputValidManager.validate(app.lookup("FCALO_ipbKeyValue5"), "isNull", dataManager.getString("Str_RequiredAlert"));
		}
		var FCALO_ipbKeyValue6 = app.lookup("FCALO_ipbKeyValue6").value;
		if(!FCALO_ipbKeyValue6){
			inputValidManager.validate(app.lookup("FCALO_ipbKeyValue6"), "isNull", dataManager.getString("Str_RequiredAlert"));
		}
		var FCALO_cmbSectorNumber = app.lookup("FCALO_cmbSectorNumber").value;
		if(!FCALO_cmbSectorNumber){
			inputValidManager.validate(app.lookup("FCALO_cmbSectorNumber"), "isNull", dataManager.getString("Str_RequiredAlert"), "comboBox");
		}
	}else{
			inputValidManager.validate(app.lookup("BCALO_ipbKeyValue1"), "restore", "");
			inputValidManager.validate(app.lookup("BCALO_ipbKeyValue2"), "restore", "");
			inputValidManager.validate(app.lookup("BCALO_ipbKeyValue3"), "restore", "");
			inputValidManager.validate(app.lookup("BCALO_ipbKeyValue4"), "restore", "");
			inputValidManager.validate(app.lookup("BCALO_ipbKeyValue5"), "restore", "");
			inputValidManager.validate(app.lookup("BCALO_ipbKeyValue6"), "restore", "");
			inputValidManager.validate(app.lookup("BCALO_cmbSector"), "restore", "");
			inputValidManager.validate(app.lookup("BCALO_ipbSectorLen"), "restore", "");
			inputValidManager.validate(app.lookup("FCALO_ipbKeyValue1"), "restore", "");
			inputValidManager.validate(app.lookup("FCALO_ipbKeyValue2"), "restore", "");
			inputValidManager.validate(app.lookup("FCALO_ipbKeyValue3"), "restore", "");
			inputValidManager.validate(app.lookup("FCALO_ipbKeyValue4"), "restore", "");
			inputValidManager.validate(app.lookup("FCALO_ipbKeyValue5"), "restore", "");
			inputValidManager.validate(app.lookup("FCALO_ipbKeyValue6"), "restore", "");
			inputValidManager.validate(app.lookup("FCALO_cmbSectorNumber"), "restore", "");
	}
	
}


function rdbCardReadTypeSelectionChange(radioBoxID) {
	if ( radioBoxID == 0) { // 카드 시리얼 인식
		app.lookup("BCALO_opbSerialTitle").enabled = true;
		app.lookup("BCALO_rdbCardSerialNumType").enabled =true; 
		app.lookup("BCALO_opbSectorInfo").enabled =false;
		app.lookup("BCALO_opbSector").enabled = false;
		app.lookup("BCALO_cmbSector").enabled = false;
		app.lookup("BCALO_opbSectorStart").enabled = false;
		app.lookup("BCALO_ipbSectorStart").enabled = false;
		app.lookup("BCALO_opbSectorLen").enabled = false;
		app.lookup("BCALO_ipbSectorLen").enabled = false;
		app.lookup("BCALO_opbBlock").enabled = false;
		app.lookup("BCALO_cmbBlock").enabled = false;
		app.lookup("BCALO_opbKeyType").enabled = false;
		app.lookup("BCALO_rdbKeyType").enabled = false;
		app.lookup("BCALO_opbSiteKey").enabled = false;
		app.lookup("BCALO_ipbKeyValue1").enabled = false;
		app.lookup("BCALO_ipbKeyValue2").enabled = false;
		app.lookup("BCALO_ipbKeyValue3").enabled = false;
		app.lookup("BCALO_ipbKeyValue4").enabled = false;
		app.lookup("BCALO_ipbKeyValue5").enabled = false;
		app.lookup("BCALO_ipbKeyValue6").enabled = false;
		app.lookup("BCALO_opbCardDataSize").enabled = false;
		app.lookup("BCALO_CardDataSize").enabled = false;
		
		app.lookup("BCALO_opbAidCode").visible = false;
		app.lookup("BCALO_ipbAidCode1").visible = false;
		app.lookup("BCALO_ipbAidCode2").visible = false;
		
		app.lookup("BCALO_btnAddSectorDataList").enabled =false;
		app.lookup("BCALO_btnDeleteSectorDataList").enabled =false;
		app.lookup("BCALO_btnInitSectorDataList").enabled =false;
		
		var dsCardlayoutDataList = app.lookup("grdBasicCardLayoutDataList");
		var count = dsCardlayoutDataList.getRowCount();
		for (var i= 0 ; i < count ; i++) {
			//var length = dsCardlayoutDataList.getValue(i, "nLength");
			dsCardlayoutDataList.deleteRow(i); // 제거	
		}
		app.lookup("BCALO_CardDataSize").value = 0;
		app.lookup("BCALO_grdSertorInfoList").enabled = false;
		
		app.lookup("SCALA_tfdMain").redraw();
	} else { //카드 데이터 인식, MAD
		app.lookup("BCALO_opbSerialTitle").enabled = false;
		app.lookup("BCALO_rdbCardSerialNumType").enabled =false;
		////////////////////////////////////////////////////////////////////////////////////////////////// 
		app.lookup("BCALO_opbSectorInfo").enabled =true;
		app.lookup("BCALO_opbSector").enabled = true;
		app.lookup("BCALO_cmbSector").enabled = true;
		app.lookup("BCALO_opbSectorStart").enabled = true;
		app.lookup("BCALO_ipbSectorStart").enabled = true;
		app.lookup("BCALO_opbSectorLen").enabled = true;
		app.lookup("BCALO_ipbSectorLen").enabled = true;
		app.lookup("BCALO_opbBlock").enabled = true;
		app.lookup("BCALO_cmbBlock").enabled = true;
		app.lookup("BCALO_opbKeyType").enabled = true;
		app.lookup("BCALO_rdbKeyType").enabled = true;
		app.lookup("BCALO_opbSiteKey").enabled = true;
		app.lookup("BCALO_ipbKeyValue1").enabled = true;
		app.lookup("BCALO_ipbKeyValue2").enabled = true;
		app.lookup("BCALO_ipbKeyValue3").enabled = true;
		app.lookup("BCALO_ipbKeyValue4").enabled = true;
		app.lookup("BCALO_ipbKeyValue5").enabled = true;
		app.lookup("BCALO_ipbKeyValue6").enabled = true;
		app.lookup("BCALO_opbCardDataSize").enabled = true;
		app.lookup("BCALO_CardDataSize").enabled = true;
		app.lookup("BCALO_btnAddSectorDataList").enabled = true;
		app.lookup("BCALO_btnDeleteSectorDataList").enabled =true;
		app.lookup("BCALO_btnInitSectorDataList").enabled =true;
		app.lookup("BCALO_grdSertorInfoList").enabled = true;
		
		if (radioBoxID == 2) { //MAD 
			//AID 값은 0 번섹터 에서만 의미있음
			var Sector = app.lookup("BCALO_cmbSector").value;
			if (Sector == 0) {
				app.lookup("BCALO_opbAidCode").visible = true;
				app.lookup("BCALO_ipbAidCode1").visible = true;
				app.lookup("BCALO_ipbAidCode2").visible = true;
			} else {
				app.lookup("BCALO_opbAidCode").visible = false;
				app.lookup("BCALO_ipbAidCode1").visible = false;
				app.lookup("BCALO_ipbAidCode2").visible = false;
				app.lookup("BCALO_ipbAidCode1").value = "ff";
				app.lookup("BCALO_ipbAidCode2").value = "ff";	
			}
			
		} else {
			app.lookup("BCALO_opbAidCode").visible = false;
			app.lookup("BCALO_ipbAidCode1").visible = false;
			app.lookup("BCALO_ipbAidCode2").visible = false;		
		}		
	}
	
}

function onBCALO_cmbSectorSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var sector = app.lookup("BCALO_cmbSector").value;
	var rdbCardAuthType = app.lookup("BCALO_rdbCardReadType").value;
	if (rdbCardAuthType == 2) {//MAD
		if (sector == 0) {// true
			app.lookup("BCALO_opbAidCode").visible = true;
			app.lookup("BCALO_ipbAidCode1").visible = true;
			app.lookup("BCALO_ipbAidCode2").visible = true;
		} else { // false
			app.lookup("BCALO_ipbAidCode1").value = "ff";
			app.lookup("BCALO_ipbAidCode2").value = "ff";	
			app.lookup("BCALO_opbAidCode").visible = false;
			app.lookup("BCALO_ipbAidCode1").visible = false;
			app.lookup("BCALO_ipbAidCode2").visible = false;
		}
	}
	inputValidManager.validate(app.lookup("BCALO_cmbSector"), "isValid", "", "comboBox");
}
//-------------------------------------------------------------------------------------->Request Add Sector List to Grd
function onBCALO_btnAddSectorDataListClick(/* cpr.events.CMouseEvent */ e){
	var selectedItem = app.lookup("SCALA_tfdMain").getSelectedTabItem();
	
	var checkResult = checkInvalidDataForSectorInfo(selectedItem.id); // 잘못 입력된 값 체크
	if (checkResult == false) { // fail 처리
		return;
	}
	//--------------------------------------------------------------------- 섹터 정보 
	var strSector = app.lookup("BCALO_cmbSector").getSelection();
	var blockNum = app.lookup("BCALO_cmbBlock").value;
	var startNum = app.lookup("BCALO_ipbSectorStart").value;
	var lengthNum = app.lookup("BCALO_ipbSectorLen").value;
	
	var keyTypeNum;
	var selkeyType = app.lookup("BCALO_rdbKeyType").value;
	if (selkeyType == 96) {
		keyTypeNum = "A";
	} else {
		keyTypeNum = "B";
	}
	var keyValue1 = app.lookup("BCALO_ipbKeyValue1").value;
	var keyValue2 = app.lookup("BCALO_ipbKeyValue2").value;
	var keyValue3 = app.lookup("BCALO_ipbKeyValue3").value;
	var keyValue4 = app.lookup("BCALO_ipbKeyValue4").value;
	var keyValue5 = app.lookup("BCALO_ipbKeyValue5").value;
	var keyValue6 = app.lookup("BCALO_ipbKeyValue6").value;
	var strSiteKey = keyValue1 + " " + keyValue2+ " "+ keyValue3+ " "+ keyValue4+" " + keyValue5 +" "+ keyValue6;
	var rdbCardAuthType = app.lookup("BCALO_rdbCardReadType").value;
	
	var aidCode;
	if (rdbCardAuthType == 2) {//MAD
		var aidCode1 = app.lookup("BCALO_ipbAidCode1").value;
		var aidCode2 = app.lookup("BCALO_ipbAidCode2").value;
		aidCode = aidCode1 + " " + aidCode2;
	} else {
		aidCode = "";
	}
	
	var grdCardlayoutDatalist = app.lookup("grdBasicCardLayoutDataList");
	grdCardlayoutDatalist.addRowData({"strSector": strSector[0].label, "nBlock": blockNum, "nStart":startNum, 
	"nLength":lengthNum, "nKeyType": keyTypeNum,"SiteKey":strSiteKey,"AIDCode":aidCode});// 추가
	grdCardlayoutDatalist.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	//---------------------------------------------------------------------
	var cardDataSize = app.lookup("BCALO_CardDataSize").value;
	app.lookup("BCALO_CardDataSize").value = Number(cardDataSize) + Number(app.lookup("BCALO_ipbSectorLen").value);
	
	app.lookup("BCALO_grpSectorInfo").redraw();
}

function checkInvalidDataForSectorInfo(tabIndex) { // 섹터 정보 에러 체크
	if( tabIndex == 1 ) { // 일반카드
		// 입력 길이 제한
		var keyValue1 = app.lookup("BCALO_ipbKeyValue1").value;
		var keyValue2 = app.lookup("BCALO_ipbKeyValue2").value;
		var keyValue3 = app.lookup("BCALO_ipbKeyValue3").value;
		var keyValue4 = app.lookup("BCALO_ipbKeyValue4").value;
		var keyValue5 = app.lookup("BCALO_ipbKeyValue5").value;
		var keyValue6 = app.lookup("BCALO_ipbKeyValue6").value;
		if (keyValue1 == null || keyValue2 == null || keyValue3 == null || keyValue4 == null ||
			keyValue5 == null || keyValue6 == null) {
				dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_CardLayoutSettingSiteKeyCorrectly"));	//Please input site key value
		 		return false;
		}	
		
		if (keyValue1.length != 2 || keyValue2.length != 2 || keyValue3.length != 2 ||
			keyValue4.length != 2 ||	keyValue5.length != 2 || keyValue6.length != 2) {
				// 에러 메세지 추가.
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_CardLayoutSettingSiteKeyCorrectly"));	//Please input site key value
		 	return false;
		}
		var sectorStart = app.lookup("BCALO_ipbSectorStart").value;
		if ( sectorStart >= 16) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_CardLayoutSettingSectorStartCorrectly"));	//Please input the data length correctly
		 	return false;
		}
		
		var sectorLen = app.lookup("BCALO_ipbSectorLen").value;
		if (sectorLen == null || sectorLen == "") {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_CardLayoutSettingSectorLengthCorrectly"));	//Please input the data length correctly
			return false;
		}
		if ((Number(sectorStart) + Number(sectorLen)) > 16 ) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_CardLayoutSettingSectorLengthCorrectly"));	//Please input the data length correctly
		 	return false;
		}
		
		var rdbCardAuthType = app.lookup("BCALO_rdbCardReadType").value;
		if (rdbCardAuthType == 2) {//MAD
			var aidCode1 = app.lookup("BCALO_ipbAidCode1").value;
			var aidCode2 = app.lookup("BCALO_ipbAidCode2").value;
			if (aidCode1 == null || aidCode2 == null || aidCode1.length != 2 || aidCode2.length != 2) {
				dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_CardLayoutSettingAIDCodeCorrectly"));	//lease input AID code value correctly
				return false;	
			}
		}
	} else if( tabIndex == 2 ) { //지문
		// 입력 길이 제한
		var keyValue1 = app.lookup("FCALO_ipbKeyValue1").value;
		var keyValue2 = app.lookup("FCALO_ipbKeyValue2").value;
		var keyValue3 = app.lookup("FCALO_ipbKeyValue3").value;
		var keyValue4 = app.lookup("FCALO_ipbKeyValue4").value;
		var keyValue5 = app.lookup("FCALO_ipbKeyValue5").value;
		var keyValue6 = app.lookup("FCALO_ipbKeyValue6").value;
		if (keyValue1 == null || keyValue2 == null || keyValue3 == null || keyValue4 == null ||
			keyValue5 == null || keyValue6 == null) {
				dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_CardLayoutSettingSiteKeyCorrectly"));	//Please input site key value
		 		return false;
		}	
		if (keyValue1.length != 2 || keyValue2.length != 2 || keyValue3.length != 2 ||
			keyValue4.length != 2 ||	keyValue5.length != 2 || keyValue6.length != 2) {
				// 에러 메세지 추가.
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_CardLayoutSettingSiteKeyCorrectly"));	//Please input site key value
		 	return false;
		}
		var strSector = app.lookup("FCALO_cmbSectorNumber").getSelection();
		
		var grdRow = app.lookup("FCALO_grdSectorInfoList").findFirstRow("strSector == '" + strSector[0].label + "'");
		if (grdRow != null) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_CardLayoutSettingSiteKeyDupliecate"));	//Please input site key value
			return false;
		}	
	}
	
}

function onBCALO_btnDeleteSectorDataListClick(/* cpr.events.CMouseEvent */ e){
	var grid = app.lookup("BCALO_grdSertorInfoList");
	var selectedRow = grid.getSelectedRow();
	if (selectedRow == null) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedItem"));
		return
	}
	
	var dsCardlayoutDataList = app.lookup("grdBasicCardLayoutDataList");
	var selectedSectorLen = dsCardlayoutDataList.getValue(selectedRow.getIndex(), "nLength");
	app.lookup("BCALO_CardDataSize").value = Number(app.lookup("BCALO_CardDataSize").value) - Number(selectedSectorLen);
	dsCardlayoutDataList.deleteRow(selectedRow.getIndex()); // 제거 
	
	app.lookup("SCALA_tfdMain").redraw();
}	
	
function onBCALO_btnInitSectorDataListClick(/* cpr.events.CMouseEvent */ e){
	app.lookup("BCALO_CardDataSize").value = "0";
	app.lookup("grdBasicCardLayoutDataList").clear();
}

// 일반카드 저장
function onBCALO_btnCardLayoutSaveClick(/* cpr.events.CMouseEvent */ e){
	var cardCapacity = app.lookup("BCALO_cmbCardCapacity").getSelection();
	if (cardCapacity[0] == null) {
		dialogAlert(app, dataManager.getString("Str_Warning"),dataManager.getString("Str_CardLayoutSettingCardCapacitySelect"));
		return;
	}
	var cardDataSize = app.lookup("BCALO_opbCardDataSize").value;	
	if (cardDataSize > CARDNUMSIZE) {
		dialogAlert(app, dataManager.getString("Str_Warning"),dataManager.getString("Str_CardLayoutSettingCardDataSizeOver")); //Exceeded the standard for summary data size
		return;
	}
	MakeBasicCardLayout();
	
	comLib.showLoadMask( "", dataManager.getString("Str_CardLayoutInfomationSave"), "",0);
	
	var requestData = app.lookup("sms_postCardLayoutInfo");
	requestData.send();
}

function MakeBasicCardLayout() {
	var nCardSize = app.lookup("BCALO_cmbCardCapacity").value;
	var SelectedTabMenu  = app.lookup("SCALA_tfdMain").getSelectedTabItem();
	var nCardType = 0; // 기본 일반카드
	console.log("SelectedTabMenu.id: "+ SelectedTabMenu.id); 
	if (SelectedTabMenu.id == 2 ) {
		 nCardType = 1; //일반카드 
	}	
	
	var nReadType = app.lookup("BCALO_rdbCardReadType").value;
	
	var nTemplateSize = 0;
	if (nReadType == 0) {
		nTemplateSize = app.lookup("BCALO_rdbCardSerialNumType").value;
	}
	
	var dmCardLoyoutInfo = app.lookup("dmCardLayoutInfo");
	dmCardLoyoutInfo.setValue("CardSize", nCardSize);
	dmCardLoyoutInfo.setValue("CardType", nCardType);
	dmCardLoyoutInfo.setValue("ReadType", nReadType);
	dmCardLoyoutInfo.setValue("TemplateSize", nTemplateSize);
	dmCardLoyoutInfo.setValue("TemplateCount", 0);
	
	//dsCardLayoutData
	var dsCardlayoutDatalist = app.lookup("dsCardLayoutData");
	dsCardlayoutDatalist.clear();
	var grdCardlayoutDatalist = app.lookup("grdBasicCardLayoutDataList");
	var count = grdCardlayoutDatalist.getRowCount();
	
	for (var idx=0; idx< count ; idx++) {
		var rowData = grdCardlayoutDatalist.getRow(idx);
		var nSector = rowData.getValue("strSector");
		var nBlock = rowData.getValue("nBlock");
		var nStart = rowData.getValue("nStart");
		var nLength = rowData.getValue("nLength");
		var nKeyType = rowData.getValue("nKeyType") == "A" ? 0x60: 0x61;
		var strKeyValue = rowData.getValue("SiteKey");
		strKeyValue = strKeyValue.replace(/\s/g,"");
		var aidCode = "";
		var ReadType = app.lookup("BCALO_rdbCardReadType").value;
		if (ReadType == 2) {
			aidCode = rowData.getValue("AIDCode");
			
			aidCode = aidCode.replace(/\s/g,"");
		} else {
			aidCode = "ffff"
		}
		
		dsCardlayoutDatalist.addRowData({"Index":idx,"Sector":nSector, "Block":nBlock,"Start":nStart,"Length":nLength,
		"KeyType":nKeyType,"KeyValue":strKeyValue,"AIDCode":aidCode});
	}
}
//----------------------------------------------------------------------------------------------------------------------------->
function onSms_postCardLayoutInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Saved"));
	} else {
		//dialogAlert(app, dataManager.getString("Str_Fail"), dataManager.getString("Str_Fail"));
		dialogAlert(app, dataManager.getString("Str_Fail"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_postCardLayoutInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_postCardLayoutInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);	
}
//-----------------------------------------------------------------------------------------------------------------------------<

function onBCALO_cmbCardCapacitySelectionChange(/* cpr.events.CSelectionEvent */ e){
	var cardCapacity = app.lookup("BCALO_cmbCardCapacity").value;
	app.lookup("BCALO_opbCardSector").value = cardCapacity * 16;
	
	app.lookup("BCALO_grpCardInfo").redraw();
}


function onbtnCardLayoutDownloadToTerminalClick(/* cpr.events.CMouseEvent */ e){
	var appld = "app/main/terminals/popup/terminalTinyList" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {width: 390, height: 570}, function(dialog){
		dialog.ready(function(dialogApp){
			dialog.initValue = {
				"PopupType": "MultiCheck"
			};
			dialog.modal = true;
		});
	}).then(function(returnValue){
		if (returnValue) { // 단말로 전송
			smsPutCardLayoutToTerminal(returnValue);
		} else { // 취소

		}
	});
}

function smsPutCardLayoutToTerminal(terminals) {
	var SelectedTabMenu  = app.lookup("SCALA_tfdMain").getSelectedTabItem();
	if (SelectedTabMenu.id == 1) { // 일반
		var cardCapacity = app.lookup("BCALO_cmbCardCapacity").getSelection();
		if (cardCapacity[0] == null) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_CardLayoutSettingCardCapacitySelect"));
			return;
		}
		var cardDataSize = app.lookup("BCALO_opbCardDataSize").value;	
		if (cardDataSize > CARDNUMSIZE) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_CardLayoutSettingCardDataSizeOver")); //Exceeded the standard for summary data size
			return;
		}
		MakeBasicCardLayout();	
	} else if (SelectedTabMenu.id == 2 ) { //지문
		var cardCapacity = app.lookup("FCALO_cmbCardCapacity").getSelection();
		if (cardCapacity[0] == null) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_CardLayoutSettingCardCapacitySelect"));
			return;
		}
		var fpMinSectorNum = app.lookup("FCALO_ipbMinSectorCount").value;
		
		var grdFpCardlayoutDataList = app.lookup("grdFingerCardLayoutDataList");
		var fpSectorListCount = grdFpCardlayoutDataList.getRowCount();
		if (fpSectorListCount < fpMinSectorNum) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_CardLayoutSettingSectorShortage"));
			return
		}
		
		MakeFpCardLayout();
	}	
	
	var dsTerminalList = app.lookup("terminals");
	dsTerminalList.clear();
	terminals.copyToDataSet(dsTerminalList); // 전송할 단말기 리스트 생성
	
	comLib.showLoadMask( "", dataManager.getString("Str_CardLayoutInfomationSave"), "",0);
	
	var requestData = app.lookup("sms_putCardLayoutInfoToTerminals");
	requestData.send();
}

function onSms_putCardLayoutInfoToTerminalsSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Saved"));
	} else {
		//dialogAlert(app, dataManager.getString("Str_Fail"), "실패");
		dialogAlert(app, dataManager.getString("Str_Fail"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_putCardLayoutInfoToTerminalsSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_putCardLayoutInfoToTerminalsSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onbtnCardLayoutCloseClick(/* cpr.events.CMouseEvent */ e){
	app.close();
}

function onFCALO_cmbFingerTemplateSizeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	calculateMinimumSector();
}

function onFCALO_cmbFingerTemplateCountSelectionChange(/* cpr.events.CSelectionEvent */ e){
	calculateMinimumSector();
}

function onFCALO_btnAddSectorDataListClick(/* cpr.events.CMouseEvent */ e){
	var selectedItem = app.lookup("SCALA_tfdMain").getSelectedTabItem();
	console.log("selectedItemID: " + selectedItem.id);
	var checkResult = checkInvalidDataForSectorInfo(selectedItem.id); // 잘못 입력된 값 체크
	if (checkResult == false) { // fail 처리
		return;
	}
	
	var strSector = app.lookup("FCALO_cmbSectorNumber").getSelection();
	var keyTypeNum;
	var selkeyType = app.lookup("FCALO_rdbKeyType").value;
	if (selkeyType == 96) {
		keyTypeNum = "A";
	} else {
		keyTypeNum = "A"; //UNIS에서 무조건 A Type으로 들어감. (버그 아니라고함)
	}
	var keyValue1 = app.lookup("FCALO_ipbKeyValue1").value;
	var keyValue2 = app.lookup("FCALO_ipbKeyValue2").value;
	var keyValue3 = app.lookup("FCALO_ipbKeyValue3").value;
	var keyValue4 = app.lookup("FCALO_ipbKeyValue4").value;
	var keyValue5 = app.lookup("FCALO_ipbKeyValue5").value;
	var keyValue6 = app.lookup("FCALO_ipbKeyValue6").value;
	var strSiteKey = keyValue1 + " " + keyValue2+ " "+ keyValue3+ " "+ keyValue4+" " + keyValue5 +" "+ keyValue6;
	
	var grdFPCardlayoutDataList = app.lookup("grdFingerCardLayoutDataList");
	console.log(strSector[0].label);
	console.log(keyTypeNum);
	console.log(strSiteKey);	
	grdFPCardlayoutDataList.addRowData({"strSector": strSector[0].label, "nKeyType": keyTypeNum, "SiteKey":strSiteKey});
	grdFPCardlayoutDataList.setSort("strSector");	
	grdFPCardlayoutDataList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	
	var sectorCnt = app.lookup("FCALO_SetSectorCount").value;
	app.lookup("FCALO_SetSectorCount").value = Number(sectorCnt) + 1;
	app.lookup("FCALO_grdSectorInfoList").redraw(); 
}

function onFCALO_btnDeleteSectorDataListClick(/* cpr.events.CMouseEvent */ e){
	var grid = app.lookup("FCALO_grdSectorInfoList");
	var selectedRow = grid.getSelectedRow();
	if (selectedRow == null) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedItem"));
		return
	}	
	
	var dsFpCardlayoutDataList = app.lookup("grdFingerCardLayoutDataList");
	dsFpCardlayoutDataList.deleteRow(selectedRow.getIndex()); // 제거
	var sectorCount = app.lookup("FCALO_SetSectorCount").value;
	app.lookup("FCALO_SetSectorCount").value = Number(sectorCount) - 1; 
	app.lookup("SCALA_tfdMain").redraw();
}

function onFCALO_btnInitSectorDataListClick(/* cpr.events.CMouseEvent */ e){
	app.lookup("FCALO_SetSectorCount").value = "0";
	app.lookup("grdFingerCardLayoutDataList").clear();
}


/*
 * "저장" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onFCALO_btnCardLayoutSaveClick(/* cpr.events.CMouseEvent */ e){
	var cardCapacity = app.lookup("FCALO_cmbCardCapacity").getSelection();
	if (cardCapacity[0] == null) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_CardLayoutSettingCardCapacitySelect"));
		return;
	}
	var fpMinSectorNum = app.lookup("FCALO_ipbMinSectorCount").value;
	
	var grdFpCardlayoutDataList = app.lookup("grdFingerCardLayoutDataList");
	var fpSectorListCount = grdFpCardlayoutDataList.getRowCount();
	if (fpSectorListCount < fpMinSectorNum) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_CardLayoutSettingSectorShortage"));
		return
	}
	
	MakeFpCardLayout();
	comLib.showLoadMask( "", dataManager.getString("Str_CardLayoutInfomationSave"), "",0);
	var requestData = app.lookup("sms_postCardLayoutInfo");
	requestData.send();
}

function MakeFpCardLayout() {
	var nCardSize = app.lookup("FCALO_cmbCardCapacity").value;
	var SelectedTabMenu  = app.lookup("SCALA_tfdMain").getSelectedTabItem();
	var nCardType = 1; // 지문카드
	var nTemplateSize = app.lookup("FCALO_cmbFingerTemplateSize").value;
	var nTemplateCount = app.lookup("FCALO_cmbFingerTemplateCount").value;
	
	var dmCardLoyoutInfo = app.lookup("dmCardLayoutInfo");
	dmCardLoyoutInfo.setValue("CardSize", nCardSize);
	dmCardLoyoutInfo.setValue("CardType", nCardType);
	dmCardLoyoutInfo.setValue("ReadType", 0);
	dmCardLoyoutInfo.setValue("TemplateSize", Number(nTemplateSize));
	dmCardLoyoutInfo.setValue("TemplateCount", Number(nTemplateCount));
	
	//dsCardLayoutData
	var dsCardlayoutDatalist = app.lookup("dsCardLayoutData");
	dsCardlayoutDatalist.clear();
	var grdFpCardlayoutDataList = app.lookup("grdFingerCardLayoutDataList");
	var count = grdFpCardlayoutDataList.getRowCount();
	
	for (var idx=0; idx< count ; idx++) {
		var rowData = grdFpCardlayoutDataList.getRow(idx);
		var nSector = rowData.getValue("strSector");
		var nKeyType = rowData.getValue("nKeyType") == "A" ? 0x60: 0x61;
		var strKeyValue = rowData.getValue("SiteKey");
		strKeyValue = strKeyValue.replace(/\s/g,"");
		var aidCode = "";
				
		dsCardlayoutDatalist.addRowData({"Index":idx,"Sector":nSector, "Block":0,"Start":0,"Length":0,
		"KeyType":nKeyType,"KeyValue":strKeyValue,"AIDCode":aidCode});
	}
}

/*
 * 탭 폴더에서 selection-change 이벤트 발생 시 호출.
 * Tab Item을 선택한 후에 발생하는 이벤트.
 */
function onSCALA_tfdMainSelectionChange(/* cpr.events.CSelectionEvent */ e){
	
	var tabMain = app.lookup("SCALA_tfdMain");
	if (tabMain.getSelectedTabItem().id == 1) {
		rdbCardReadTypeSelectionChange(Number(app.lookup("BCALO_rdbCardReadType").value)); // 비활성화	
	} else if (tabMain.getSelectedTabItem().id == 2) {
	}
	
	
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onFCALO_cmbSectorNumberSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var fCALO_cmbSectorNumber = e.control;
	inputValidManager.validate(app.lookup("FCALO_cmbSectorNumber"), "isValid", "", "comboBox");
}


/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onBCALO_ipbKeyValue1Keyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var bCALO_ipbKeyValue1 = e.control;
	app.lookup("BCALO_ipbKeyValue1").value = bCALO_ipbKeyValue1.displayText;
	if(bCALO_ipbKeyValue1.displayText.length == 2){
		inputValidManager.validate(app.lookup("BCALO_ipbKeyValue1"), "isValid", "");
	}else{
		inputValidManager.validate(app.lookup("BCALO_ipbKeyValue1"), "isNull", dataManager.getString("Str_RequiredAlert"));	
	}
}


/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onBCALO_ipbKeyValue2Keyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var bCALO_ipbKeyValue2 = e.control;
	app.lookup("BCALO_ipbKeyValue2").value = bCALO_ipbKeyValue2.displayText;
	if(bCALO_ipbKeyValue2.displayText.length == 2){
		inputValidManager.validate(app.lookup("BCALO_ipbKeyValue2"), "isValid", "");
	}else{
		inputValidManager.validate(app.lookup("BCALO_ipbKeyValue2"), "isNull", dataManager.getString("Str_RequiredAlert"));	
	}
}


/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onBCALO_ipbKeyValue3Keyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var bCALO_ipbKeyValue3 = e.control;
	app.lookup("BCALO_ipbKeyValue3").value = bCALO_ipbKeyValue3.displayText;
	if(bCALO_ipbKeyValue3.displayText.length == 2){
		inputValidManager.validate(app.lookup("BCALO_ipbKeyValue3"), "isValid", "");
	}else{
		inputValidManager.validate(app.lookup("BCALO_ipbKeyValue3"), "isNull", dataManager.getString("Str_RequiredAlert"));	
	}
}


/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onBCALO_ipbKeyValue4Keyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var bCALO_ipbKeyValue4 = e.control;
	app.lookup("BCALO_ipbKeyValue4").value = bCALO_ipbKeyValue4.displayText;
	if(bCALO_ipbKeyValue4.displayText.length == 2){
		inputValidManager.validate(app.lookup("BCALO_ipbKeyValue4"), "isValid", "");
	}else{
		inputValidManager.validate(app.lookup("BCALO_ipbKeyValue4"), "isNull", dataManager.getString("Str_RequiredAlert"));	
	}
}


/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onBCALO_ipbKeyValue5Keyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var bCALO_ipbKeyValue5 = e.control;
	app.lookup("BCALO_ipbKeyValue5").value = bCALO_ipbKeyValue5.displayText;
	if(bCALO_ipbKeyValue5.displayText.length == 2){
		inputValidManager.validate(app.lookup("BCALO_ipbKeyValue5"), "isValid", "");
	}else{
		inputValidManager.validate(app.lookup("BCALO_ipbKeyValue5"), "isNull", dataManager.getString("Str_RequiredAlert"));	
	}
}


/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onBCALO_ipbKeyValue6Keyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var bCALO_ipbKeyValue6 = e.control;
	app.lookup("BCALO_ipbKeyValue6").value = bCALO_ipbKeyValue6.displayText;
	if(bCALO_ipbKeyValue6.displayText.length == 2){
		inputValidManager.validate(app.lookup("BCALO_ipbKeyValue6"), "isValid", "");
	}else{
		inputValidManager.validate(app.lookup("BCALO_ipbKeyValue6"), "isNull", dataManager.getString("Str_RequiredAlert"));	
	}
}


/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onBCALO_ipbSectorLenKeyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var bCALO_ipbSectorLen = e.control;
	app.lookup("BCALO_ipbSectorLen").value = bCALO_ipbSectorLen.displayText;
	if(bCALO_ipbSectorLen.displayText != "" && bCALO_ipbSectorLen.displayText <= 6){
		inputValidManager.validate(app.lookup("BCALO_ipbSectorLen"), "isValid", "");
	}else{
		inputValidManager.validate(app.lookup("BCALO_ipbSectorLen"), "isNull", dataManager.getString("Str_RequiredAlert"));	
	}
}


/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onFCALO_ipbKeyValue1Keyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var fCALO_ipbKeyValue1 = e.control;
	app.lookup("FCALO_ipbKeyValue1").value = fCALO_ipbKeyValue1.displayText;
	if(fCALO_ipbKeyValue1.displayText.length == 2){
		inputValidManager.validate(app.lookup("FCALO_ipbKeyValue1"), "isValid", "");
	}else{
		inputValidManager.validate(app.lookup("FCALO_ipbKeyValue1"), "isNull", dataManager.getString("Str_RequiredAlert"));	
	}
}


/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onFCALO_ipbKeyValue2Keyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var fCALO_ipbKeyValue2 = e.control;
	app.lookup("FCALO_ipbKeyValue2").value = fCALO_ipbKeyValue2.displayText;
	if(fCALO_ipbKeyValue2.displayText.length == 2){
		inputValidManager.validate(app.lookup("FCALO_ipbKeyValue2"), "isValid", "");
	}else{
		inputValidManager.validate(app.lookup("FCALO_ipbKeyValue2"), "isNull", dataManager.getString("Str_RequiredAlert"));	
	}
}


/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onFCALO_ipbKeyValue3Keyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var fCALO_ipbKeyValue3 = e.control;
	app.lookup("FCALO_ipbKeyValue3").value = fCALO_ipbKeyValue3.displayText;
	if(fCALO_ipbKeyValue3.displayText.length == 2){
		inputValidManager.validate(app.lookup("FCALO_ipbKeyValue3"), "isValid", "");
	}else{
		inputValidManager.validate(app.lookup("FCALO_ipbKeyValue3"), "isNull", dataManager.getString("Str_RequiredAlert"));	
	}
}


/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onFCALO_ipbKeyValue4Keyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var fCALO_ipbKeyValue4 = e.control;
	app.lookup("FCALO_ipbKeyValue4").value = fCALO_ipbKeyValue4.displayText;
	if(fCALO_ipbKeyValue4.displayText.length == 2){
		inputValidManager.validate(app.lookup("FCALO_ipbKeyValue4"), "isValid", "");
	}else{
		inputValidManager.validate(app.lookup("FCALO_ipbKeyValue4"), "isNull", dataManager.getString("Str_RequiredAlert"));	
	}
}


/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onFCALO_ipbKeyValue5Keyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var fCALO_ipbKeyValue5 = e.control;
	app.lookup("FCALO_ipbKeyValue5").value = fCALO_ipbKeyValue5.displayText;
	if(fCALO_ipbKeyValue5.displayText.length == 2){
		inputValidManager.validate(app.lookup("FCALO_ipbKeyValue5"), "isValid", "");
	}else{
		inputValidManager.validate(app.lookup("FCALO_ipbKeyValue5"), "isNull", dataManager.getString("Str_RequiredAlert"));	
	}
}


/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onFCALO_ipbKeyValue6Keyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var fCALO_ipbKeyValue6 = e.control;
	app.lookup("FCALO_ipbKeyValue6").value = fCALO_ipbKeyValue6.displayText;
	if(fCALO_ipbKeyValue6.displayText.length == 2){
		inputValidManager.validate(app.lookup("FCALO_ipbKeyValue6"), "isValid", "");
	}else{
		inputValidManager.validate(app.lookup("FCALO_ipbKeyValue6"), "isNull", dataManager.getString("Str_RequiredAlert"));	
	}
}


/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onImageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	console.log(menu_id);
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onFCALO_cmbCardCapacitySelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var fCALO_cmbCardCapacity = e.control;
	var cardCapacity = app.lookup("FCALO_cmbCardCapacity").value;
	app.lookup("FCALO_opbCardSector").value = cardCapacity * 16;
	
	app.lookup("FCALO_opbCardSector").redraw();
}
