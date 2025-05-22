/************************************************
 * paymentSetting.js
 * Created at 2020. 2. 25. 오전 10:18:21.
 *
 * @author joymrk
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	
	
	var initinfo = app.lookup("PrintSetting");
	initinfo.reset();
	//var fontWeight = initinfo.getValue("fontweight");
	//var fontTest = app.lookup("DMSTT_cmbFontTest");
	//fontTest.style.css("font", "700 14pt");
	setSignedFlag(1);
	//fontTest.redraw();
	app.lookup("DMSTT_cmbFontTest").style.css("font-weight", "700");
	app.lookup("DMSTT_cmbFontTest").style.css("font-size", "14pt");
	app.lookup("DMSTT_cmbFontTest").redraw();
	app.lookup("DMSTT_grpMain").redraw();
	
	var initValue = app.getHost().initValue;
	
	
	//var dsLangList = app.lookup("LangAuthLogReport");
	//var locale = dataManager.getLocale();
	
	//var sms_getLangErrorList = app.lookup("sms_getLangErrorList") ;
	//sms_getLangErrorList.action = "data/lang/lang_authlogreport_"+locale+".json";
	//sms_getLangErrorList.send();
	
	//dataManager.setLanguage(locale, dsLangList);
	
	console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
	console.log(initValue["btnText1"]);
	console.log(initValue["btnText2"]);
	
	app.lookup("DMSTT_btnDefault").text = initValue["btnText1"];
	app.lookup("DMSTT_btnSave").text = initValue["btnText2"];
	
	
	/*
	      {    "Key": "Str_EnableDisable", "Value": "활성화/비활성화"    }
        {    "Key": "Str_EnableDisable", "Value": "활성화/비활성화"    },
        {    "Key": "Str_PDFSave", "Value": "PDF 저장"    },
        {    "Key": "Str_PDFTitle", "Value": "제목 :"    },
        {    "Key": "Str_FontSize", "Value": "폰트사이즈"    },
        {    "Key": "Str_FontThickness", "Value": "폰트 굵기"    },
        {    "Key": "Str_ApprovalLineSettings", "Value": "결제 라인 설정"    },
        {    "Key": "Str_ApprovalLineAdd", "Value": "결제 라인 추가"    },
        {    "Key": "Str_ApprovalLineExcept", "Value": "결제 라인 제외"    }
			*/
	
	
	app.lookup("DMSTT_TitleText").text = initValue["Str_PDFTitle"];
	app.lookup("DMSTT_FontBold").text = initValue["Str_FontThickness"];
	app.lookup("DMSTT_FontSize").text = initValue["Str_FontSize"];
	
	
	app.lookup("DMSTT_ApprovalSetting").text = initValue["Str_ApprovalLineSettings"];
	app.lookup("DMSTT_rdbSignedFlag").getItem(0).label = initValue["Str_ApprovalLineAdd"];
	app.lookup("DMSTT_rdbSignedFlag").getItem(1).label = initValue["Str_ApprovalLineExcept"];
	

	//app.lookup("DMSTT_btnDefault").redraw();
	//app.lookup("DMSTT_btnSave").redraw();
	
	
}

function setSignedFlag(value) {
	if (value == 0) {
		app.lookup("DMSTT_cbxSignedColumn1").enabled = false;
		app.lookup("DMSTT_cbxSignedColumn2").enabled = false;
		app.lookup("DMSTT_cbxSignedColumn3").enabled = false;
		app.lookup("DMSTT_cbxSignedColumn4").enabled = false;
		app.lookup("DMSTT_cbxSignedColumn5").enabled = false;
		app.lookup("DMSTT_cbxSignedColumn6").enabled = false;
		app.lookup("DMSTT_cbxSignedColumn7").enabled = false;
		app.lookup("DMSTT_cbxSignedColumn8").enabled = false;
		
		app.lookup("DMSTT_cbxSignedColumn1").putValue('false');
		app.lookup("DMSTT_cbxSignedColumn2").putValue('false');
		app.lookup("DMSTT_cbxSignedColumn3").putValue('false');
		app.lookup("DMSTT_cbxSignedColumn4").putValue('false');
		app.lookup("DMSTT_cbxSignedColumn5").putValue('false');
		app.lookup("DMSTT_cbxSignedColumn6").putValue('false');
		app.lookup("DMSTT_cbxSignedColumn7").putValue('false');
		app.lookup("DMSTT_cbxSignedColumn8").putValue('false');	
		
		
		app.lookup("DMSTT_ipbSignedColumn1").value = "";
		app.lookup("DMSTT_ipbSignedColumn2").value = "";
		app.lookup("DMSTT_ipbSignedColumn3").value = "";
		app.lookup("DMSTT_ipbSignedColumn4").value = "";
		app.lookup("DMSTT_ipbSignedColumn5").value = "";
		app.lookup("DMSTT_ipbSignedColumn6").value = "";
		app.lookup("DMSTT_ipbSignedColumn7").value = "";
		app.lookup("DMSTT_ipbSignedColumn8").value = "";
		
		

		app.lookup("DMSTT_ipbSignedColumn1").enabled = false;
		app.lookup("DMSTT_ipbSignedColumn2").enabled = false;
		app.lookup("DMSTT_ipbSignedColumn3").enabled = false;
		app.lookup("DMSTT_ipbSignedColumn4").enabled = false;
		app.lookup("DMSTT_ipbSignedColumn5").enabled = false;
		app.lookup("DMSTT_ipbSignedColumn6").enabled = false;
		app.lookup("DMSTT_ipbSignedColumn7").enabled = false;
		app.lookup("DMSTT_ipbSignedColumn8").enabled = false;	
		
		
		
	} else {
		app.lookup("DMSTT_cbxSignedColumn1").enabled = false;
		app.lookup("DMSTT_cbxSignedColumn2").enabled = false;
		app.lookup("DMSTT_cbxSignedColumn3").enabled = false;
		app.lookup("DMSTT_cbxSignedColumn4").enabled = false;
		
		app.lookup("DMSTT_cbxSignedColumn5").enabled = true; // putvalue 는 false 라도 일단 enable 은 해 놔야지...
		
		app.lookup("DMSTT_cbxSignedColumn6").enabled = true;
		app.lookup("DMSTT_cbxSignedColumn7").enabled = true;
		app.lookup("DMSTT_cbxSignedColumn8").enabled = true;
		
		app.lookup("DMSTT_cbxSignedColumn1").putValue('false');
		app.lookup("DMSTT_cbxSignedColumn2").putValue('false');
		app.lookup("DMSTT_cbxSignedColumn3").putValue('false');
		app.lookup("DMSTT_cbxSignedColumn4").putValue('false');
		app.lookup("DMSTT_cbxSignedColumn5").putValue('false');
		
		app.lookup("DMSTT_cbxSignedColumn6").putValue('true');
		app.lookup("DMSTT_cbxSignedColumn7").putValue('true');
		app.lookup("DMSTT_cbxSignedColumn8").putValue('true');
		
		
		
		app.lookup("DMSTT_ipbSignedColumn1").enabled = false;
		app.lookup("DMSTT_ipbSignedColumn2").enabled = false;
		app.lookup("DMSTT_ipbSignedColumn3").enabled = false;
		app.lookup("DMSTT_ipbSignedColumn4").enabled = false;
		app.lookup("DMSTT_ipbSignedColumn5").enabled = false;
		
		app.lookup("DMSTT_ipbSignedColumn6").enabled = true;
		app.lookup("DMSTT_ipbSignedColumn7").enabled = true;
		app.lookup("DMSTT_ipbSignedColumn8").enabled = true;		
		
		
		
		
		var printSetting = app.lookup("PrintSetting");
		printSetting.setValue("SignedColumn6", " ");
		printSetting.setValue("SignedColumn7", " ");
		printSetting.setValue("SignedColumn8", " ");
					
	}
	app.lookup("DMSTT_grpSigned").redraw();
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onDMSTT_cmbFontBoldSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var dMSTT_cmbFontBold = e.control;
	app.lookup("DMSTT_cmbFontTest").style.css("font-weight", dMSTT_cmbFontBold.value);
	app.lookup("DMSTT_cmbFontTest").redraw();
}


/*
 * 라디오 버튼에서 selection-change 이벤트 발생 시 호출.
 * 라디오버튼 아이템을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onDMSTT_rdbSignedFlagSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.RadioButton
	 */
	var dMSTT_rdbSignedFlag = e.control;
	var rdbFlag = app.lookup("DMSTT_rdbSignedFlag").value;
	setSignedFlag(rdbFlag);
}


function cbxSignedColumnValueChangePreCheck (dMSTT_cbxSignedColumn )
{
	var DMSTT_cbxSignedColumn1 = app.lookup("DMSTT_cbxSignedColumn1");
	var DMSTT_cbxSignedColumn2 = app.lookup("DMSTT_cbxSignedColumn2");
	var DMSTT_cbxSignedColumn3 = app.lookup("DMSTT_cbxSignedColumn3");
	var DMSTT_cbxSignedColumn4 = app.lookup("DMSTT_cbxSignedColumn4");
	var DMSTT_cbxSignedColumn5 = app.lookup("DMSTT_cbxSignedColumn5");
	var DMSTT_cbxSignedColumn6 = app.lookup("DMSTT_cbxSignedColumn6");
	var DMSTT_cbxSignedColumn7 = app.lookup("DMSTT_cbxSignedColumn7");
	var DMSTT_cbxSignedColumn8 = app.lookup("DMSTT_cbxSignedColumn8");
		
	var DMSTT_ipbSignedColumn1 = app.lookup("DMSTT_ipbSignedColumn1");
	var DMSTT_ipbSignedColumn2 = app.lookup("DMSTT_ipbSignedColumn2");
	var DMSTT_ipbSignedColumn3 = app.lookup("DMSTT_ipbSignedColumn3");
	var DMSTT_ipbSignedColumn4 = app.lookup("DMSTT_ipbSignedColumn4");
	var DMSTT_ipbSignedColumn5 = app.lookup("DMSTT_ipbSignedColumn5");
	var DMSTT_ipbSignedColumn6 = app.lookup("DMSTT_ipbSignedColumn6");
	var DMSTT_ipbSignedColumn7 = app.lookup("DMSTT_ipbSignedColumn7");
	var DMSTT_ipbSignedColumn8 = app.lookup("DMSTT_ipbSignedColumn8");			
		
		
	var printSetting = app.lookup("PrintSetting");
			
	//var dMSTT_cbxSignedColumn = e.control;
	if (dMSTT_cbxSignedColumn.id == 'DMSTT_cbxSignedColumn1') {
		
	}
	
	if (dMSTT_cbxSignedColumn.id == 'DMSTT_cbxSignedColumn2') {

		DMSTT_cbxSignedColumn1.value = 'false';
	
		DMSTT_cbxSignedColumn1.enabled = false;		
		
		printSetting.setValue("SignedColumn1", "");
		
		if(DMSTT_cbxSignedColumn2.value == 'true' )	
		{
			DMSTT_cbxSignedColumn1.enabled = true;	
			
		}		 	
	}
	
	if (dMSTT_cbxSignedColumn.id == 'DMSTT_cbxSignedColumn3') {

		DMSTT_cbxSignedColumn1.value = 'false';
		DMSTT_cbxSignedColumn2.value = 'false';
	
		DMSTT_cbxSignedColumn1.enabled = false;	
		DMSTT_cbxSignedColumn2.enabled = false;	
		
		printSetting.setValue("SignedColumn1", ""); 
		printSetting.setValue("SignedColumn2", ""); 
		
		if(DMSTT_cbxSignedColumn3.value == 'true' )	
		{
			DMSTT_cbxSignedColumn2.enabled = true;	
			
		}		
	}
	
	if (dMSTT_cbxSignedColumn.id == 'DMSTT_cbxSignedColumn4') {
	
		DMSTT_cbxSignedColumn1.value = 'false';
		DMSTT_cbxSignedColumn2.value = 'false';
		DMSTT_cbxSignedColumn3.value = 'false';
	
		DMSTT_cbxSignedColumn1.enabled = false;	
		DMSTT_cbxSignedColumn2.enabled = false;	
		DMSTT_cbxSignedColumn3.enabled = false;	
		
		printSetting.setValue("SignedColumn1", ""); 
		printSetting.setValue("SignedColumn2", ""); 
		printSetting.setValue("SignedColumn3", ""); 
		
		if(DMSTT_cbxSignedColumn4.value == 'true' )	
		{
			DMSTT_cbxSignedColumn3.enabled = true;	
			
		}		
	}
	
	if (dMSTT_cbxSignedColumn.id == 'DMSTT_cbxSignedColumn5') {
	
		DMSTT_cbxSignedColumn1.value = 'false';
		DMSTT_cbxSignedColumn2.value = 'false';
		DMSTT_cbxSignedColumn3.value = 'false';
		DMSTT_cbxSignedColumn4.value = 'false';
	
		DMSTT_cbxSignedColumn1.enabled = false;	
		DMSTT_cbxSignedColumn2.enabled = false;	
		DMSTT_cbxSignedColumn3.enabled = false;	
		DMSTT_cbxSignedColumn4.enabled = false;	
		
		printSetting.setValue("SignedColumn1", ""); 
		printSetting.setValue("SignedColumn2", ""); 
		printSetting.setValue("SignedColumn3", ""); 
		printSetting.setValue("SignedColumn4", ""); 
		
		if(DMSTT_cbxSignedColumn5.value == 'true' )	
		{
			DMSTT_cbxSignedColumn4.enabled = true;	
			
		}		
	}
	
	if (dMSTT_cbxSignedColumn.id == 'DMSTT_cbxSignedColumn6') {
	
		DMSTT_cbxSignedColumn1.value = 'false';
		DMSTT_cbxSignedColumn2.value = 'false';
		DMSTT_cbxSignedColumn3.value = 'false';
		DMSTT_cbxSignedColumn4.value = 'false';
		DMSTT_cbxSignedColumn5.value = 'false';
		
		DMSTT_cbxSignedColumn1.enabled = false;	
		DMSTT_cbxSignedColumn2.enabled = false;	
		DMSTT_cbxSignedColumn3.enabled = false;	
		DMSTT_cbxSignedColumn4.enabled = false;	
		DMSTT_cbxSignedColumn5.enabled = false;	
		
		printSetting.setValue("SignedColumn1", ""); 
		printSetting.setValue("SignedColumn2", ""); 
		printSetting.setValue("SignedColumn3", ""); 
		printSetting.setValue("SignedColumn4", ""); 
		printSetting.setValue("SignedColumn5", ""); 
		
		if(DMSTT_cbxSignedColumn6.value == 'true' )	
		{
			DMSTT_cbxSignedColumn5.enabled = true;	
			
		}		
		
	}	
	
	if (dMSTT_cbxSignedColumn.id == 'DMSTT_cbxSignedColumn7') {
		
		DMSTT_cbxSignedColumn1.value = 'false';
		DMSTT_cbxSignedColumn2.value = 'false';
		DMSTT_cbxSignedColumn3.value = 'false';
		DMSTT_cbxSignedColumn4.value = 'false';
		DMSTT_cbxSignedColumn5.value = 'false';
		DMSTT_cbxSignedColumn6.value = 'false';
		
		DMSTT_cbxSignedColumn1.enabled = false;	
		DMSTT_cbxSignedColumn2.enabled = false;	
		DMSTT_cbxSignedColumn3.enabled = false;	
		DMSTT_cbxSignedColumn4.enabled = false;	
		DMSTT_cbxSignedColumn5.enabled = false;	
		DMSTT_cbxSignedColumn6.enabled = false;	
		
		printSetting.setValue("SignedColumn1", ""); 
		printSetting.setValue("SignedColumn2", ""); 
		printSetting.setValue("SignedColumn3", ""); 
		printSetting.setValue("SignedColumn4", ""); 
		printSetting.setValue("SignedColumn5", ""); 
		printSetting.setValue("SignedColumn6", "");
		
		if(DMSTT_cbxSignedColumn7.value == 'true' )	
		{
			DMSTT_cbxSignedColumn6.enabled = true;	
			
		}		 
	}	
	
	if (dMSTT_cbxSignedColumn.id == 'DMSTT_cbxSignedColumn8') {
	
		// 8 에서 체크가 되었던 안되었던 간에 변화가 있었으면 다른것은 무조건 체크를 풀어 버린다
		DMSTT_cbxSignedColumn1.value = 'false';
		DMSTT_cbxSignedColumn2.value = 'false';
		DMSTT_cbxSignedColumn3.value = 'false';
		DMSTT_cbxSignedColumn4.value = 'false';
		DMSTT_cbxSignedColumn5.value = 'false';
		DMSTT_cbxSignedColumn6.value = 'false';
		DMSTT_cbxSignedColumn7.value = 'false';
		
		DMSTT_cbxSignedColumn1.enabled = false;	
		DMSTT_cbxSignedColumn2.enabled = false;	
		DMSTT_cbxSignedColumn3.enabled = false;	
		DMSTT_cbxSignedColumn4.enabled = false;	
		DMSTT_cbxSignedColumn5.enabled = false;	
		DMSTT_cbxSignedColumn6.enabled = false;	
		DMSTT_cbxSignedColumn7.enabled = false;	
		
		printSetting.setValue("SignedColumn1", ""); 
		printSetting.setValue("SignedColumn2", ""); 
		printSetting.setValue("SignedColumn3", ""); 
		printSetting.setValue("SignedColumn4", ""); 
		printSetting.setValue("SignedColumn5", ""); 
		printSetting.setValue("SignedColumn6", "");  
		printSetting.setValue("SignedColumn7", ""); 	
		
		if(DMSTT_cbxSignedColumn8.value == 'true' )	
		{
			DMSTT_cbxSignedColumn7.enabled = true;
			
		}				
	}				
}




function onDMSTT_cbxSignedColumnValueChange(/* cpr.events.CValueChangeEvent */ e){
	var dMSTT_cbxSignedColumn = e.control;
	
	cbxSignedColumnValueChangePreCheck(dMSTT_cbxSignedColumn);
	
	var DMSTT_ipbSignedColumn1 = app.lookup("DMSTT_ipbSignedColumn1");
	var DMSTT_ipbSignedColumn2 = app.lookup("DMSTT_ipbSignedColumn2");
	var DMSTT_ipbSignedColumn3 = app.lookup("DMSTT_ipbSignedColumn3");
	var DMSTT_ipbSignedColumn4 = app.lookup("DMSTT_ipbSignedColumn4");
	var DMSTT_ipbSignedColumn5 = app.lookup("DMSTT_ipbSignedColumn5");
	var DMSTT_ipbSignedColumn6 = app.lookup("DMSTT_ipbSignedColumn6");
	var DMSTT_ipbSignedColumn7 = app.lookup("DMSTT_ipbSignedColumn7");
	var DMSTT_ipbSignedColumn8 = app.lookup("DMSTT_ipbSignedColumn8");	
	
	var printSetting = app.lookup("PrintSetting");
	
	if (dMSTT_cbxSignedColumn.id == 'DMSTT_cbxSignedColumn1') {
		if (dMSTT_cbxSignedColumn.value == 'true') {
			
			DMSTT_ipbSignedColumn1.enabled = true;
			printSetting.setValue("SignedColumn1", " "); // 빈값을 하나 넣어서 활성화 되었음을 표시
			
		} else {
			
			DMSTT_ipbSignedColumn1.enabled = false;
			printSetting.setValue("SignedColumn1", ""); 
		}
	} else 	if (dMSTT_cbxSignedColumn.id == 'DMSTT_cbxSignedColumn2') {
		if (dMSTT_cbxSignedColumn.value == 'true') {
			
			DMSTT_ipbSignedColumn2.enabled = true;
			printSetting.setValue("SignedColumn2", " "); 
			
		} else {
			
			DMSTT_ipbSignedColumn2.enabled = false;
			printSetting.setValue("SignedColumn2", ""); 
		}
	}else 	if (dMSTT_cbxSignedColumn.id == 'DMSTT_cbxSignedColumn3') {
		if (dMSTT_cbxSignedColumn.value == 'true') {
			
			DMSTT_ipbSignedColumn3.enabled = true;
			printSetting.setValue("SignedColumn3", " "); 
			
		} else {

			DMSTT_ipbSignedColumn3.enabled = false;
			printSetting.setValue("SignedColumn3", ""); 
			
		}
	}else if (dMSTT_cbxSignedColumn.id == 'DMSTT_cbxSignedColumn4') {
		if (dMSTT_cbxSignedColumn.value == 'true') {
			
			DMSTT_ipbSignedColumn4.enabled = true;
			printSetting.setValue("SignedColumn4", " "); 
			
		} else {
			DMSTT_ipbSignedColumn4.enabled = false;
			printSetting.setValue("SignedColumn4", ""); 
			
		}
	}else if (dMSTT_cbxSignedColumn.id == 'DMSTT_cbxSignedColumn5') {
		if (dMSTT_cbxSignedColumn.value == 'true') {
		
			DMSTT_ipbSignedColumn5.enabled = true;
			printSetting.setValue("SignedColumn5", " "); 
			
		} else {
			
			DMSTT_ipbSignedColumn5.enabled = false;
			printSetting.setValue("SignedColumn5", ""); 
			
		}
	}else if (dMSTT_cbxSignedColumn.id == 'DMSTT_cbxSignedColumn6') {
		if (dMSTT_cbxSignedColumn.value == 'true') {
			
			DMSTT_ipbSignedColumn6.enabled = true;
			printSetting.setValue("SignedColumn6", " "); 
			
		} else {
			
			DMSTT_ipbSignedColumn6.enabled = false;
			printSetting.setValue("SignedColumn6", ""); 
			
		}
	}else 	if (dMSTT_cbxSignedColumn.id == 'DMSTT_cbxSignedColumn7') {
		if (dMSTT_cbxSignedColumn.value == 'true') {
			
			DMSTT_ipbSignedColumn7.enabled = true;
			printSetting.setValue("SignedColumn7", " "); 
			
		} else {
			
			DMSTT_ipbSignedColumn7.enabled = false;
			printSetting.setValue("SignedColumn7", ""); 
			
		}
	}else 	if (dMSTT_cbxSignedColumn.id == 'DMSTT_cbxSignedColumn8') {
		if (dMSTT_cbxSignedColumn.value == 'true') {
			
			DMSTT_ipbSignedColumn8.enabled = true;
			printSetting.setValue("SignedColumn8", " ");
			 
		} else {
			
			DMSTT_ipbSignedColumn8.enabled = false;
			printSetting.setValue("SignedColumn8", ""); 
		}
	}
	
}

// 적용 버튼 클릭
function onDMSTT_btnSaveClick(/* cpr.events.CMouseEvent */ e){	
	var printSetting = app.lookup("PrintSetting");
	
	console.log("onDMSTT_btnSaveClick");
	
	console.log(printSetting);
	
	app.close(printSetting);
	
	
	
}


/*
 * "default" 버튼(DMSTT_btnDefault)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onDMSTT_btnDefaultClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var dMSTT_btnDefault = e.control;
	
	
	var initinfo = app.lookup("PrintSetting");
	initinfo.reset();
	var fontWeight = initinfo.getValue("fontweight");
	var fontTest = app.lookup("DMSTT_cmbFontTest");
	fontTest.style.css("font", "400 14pt");
	setSignedFlag(1);
	app.lookup("DMSTT_grpMain").redraw();
	
	
	
	
	
}
