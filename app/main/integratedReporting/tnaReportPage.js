/************************************************
 * tnaReportPage.js
 * Created at 2020. 3. 27. 오후 12:24:05.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var util = cpr.core.Module.require("lib/util");
var comLib;
var offset = 0;
var pageRowCount = 2000;
var TRPPP_version;
var udcSignColumn = ["TRPPP_udcSignColumn4", "TRPPP_udcSignColumn5", "TRPPP_udcSignColumn6", "TRPPP_udcSignColumn7",
						"TRPPP_udcSignColumn8","TRPPP_udcSignColumn3", "TRPPP_udcSignColumn2", "TRPPP_udcSignColumn1"];
var SetColumn = ["SignedColumn1", "SignedColumn2", "SignedColumn3", "SignedColumn4",
			"SignedColumn5","SignedColumn6", "SignedColumn7", "SignedColumn8"];
			
var languageMap = new Map();
			
//var languageList = new cpr.data.DataSet;
			
var language = "ko";
var OEM_VERSION ;

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);	
	var obj = getParameters(window.location.search);
   	app.lookup("reportPageSet").build(obj);
   	app.lookup("smsSetData").build(obj);
    console.log(app.lookup("smsSetData").getDatas());
   	
   	TRPPP_version = obj["version"];
	setHeadPage();	
	
	app.lookup("TRPPP_udcSignColumn1").setVisible(false); 
	app.lookup("TRPPP_udcSignColumn2").setVisible(false); 
	app.lookup("TRPPP_udcSignColumn3").setVisible(false); 
	app.lookup("TRPPP_udcSignColumn4").setVisible(false); 
	app.lookup("TRPPP_udcSignColumn5").setVisible(false); 
	app.lookup("TRPPP_udcSignColumn6").setVisible(true); 
	app.lookup("TRPPP_udcSignColumn7").setVisible(true); 
	app.lookup("TRPPP_udcSignColumn8").setVisible(true); 

	language = obj["locale"];
	
	console.log("language: ");
	console.log(language);
	
	dataManager.setLocale(language);
	
	var sms_getLangList = app.lookup("sms_getLangList") ;
	//sms_getLangList.action = "data/lang/lang_ko.json";	
	sms_getLangList.action = "data/lang/lang_"+language+".json";	
	
	console.log(sms_getLangList.action);
	
	sms_getLangList.send();			
	
	//sendGetTnaResultList();
	OEM_VERSION = TRPPP_version.slice(-2);
	
}

function getParameters(search) {
	var obj = {};
	var uri = decodeURI(search);
	uri = uri.slice(1, uri.length);
	var param = uri.split('&');
    for (var i = 0; i < param.length; i++) {
        var devide = param[i].split('=');
        obj[devide[0]] = devide[1];
    }
    return obj;
}


function setHeadPage() {
	var reportPageSet = app.lookup("reportPageSet");
		
	// Title
	var opbTitle = app.lookup("TRPPP_ipbTitle")
	opbTitle.value = reportPageSet.getValue("title");
	opbTitle.style.css({
		"font-size" : reportPageSet.getValue("fontsize") + 'pt',
		"font-weight" : reportPageSet.getValue("fontweight"),
	});
	// signSet
	if (reportPageSet.getValue("signedColumnFlag") == 1 ) {
		var signSet = app.lookup("PrintSetting");
		signSet.clear();
		signSet.build(reportPageSet.getDatas());
		
		var visibleCnt=0;
		var maxColCnt = 8;
		var deleteCol = 0;
				
		var signtxt = signSet.getValue("SignedColumn1");
		if (signtxt.length > 0) {
			visibleCnt++;
		}
		var signtxt = signSet.getValue("SignedColumn2");
		if (signtxt.length > 0) {
			visibleCnt++;
		}
		var signtxt = signSet.getValue("SignedColumn3");
		if (signtxt.length > 0) {
			visibleCnt++;
		}
		var signtxt = signSet.getValue("SignedColumn4");
		if (signtxt.length > 0) {
			visibleCnt++;
		}
		var signtxt = signSet.getValue("SignedColumn5");
		if (signtxt.length > 0) {
			visibleCnt++;
		}
		var signtxt = signSet.getValue("SignedColumn6");
		if (signtxt.length > 0) {
			visibleCnt++;
		}
		var signtxt = signSet.getValue("SignedColumn7");
		if (signtxt.length > 0) {
			visibleCnt++;
		}
		var signtxt = signSet.getValue("SignedColumn8");
		if (signtxt.length > 0) {
			visibleCnt++;
		}
		deleteCol = maxColCnt - visibleCnt;
		if (deleteCol > 0) {
			for (var i = 0 ; i < deleteCol; i++) {
				app.lookup(udcSignColumn[i]).setVisible(false);
			}
		}
		console.log(signSet.getDatas());
		var visibleCnt2 = visibleCnt;
		for (var i = 0 ; i < visibleCnt; i++) {
			console.log(udcSignColumn[maxColCnt-visibleCnt2]);
			console.log(SetColumn[i]);
			app.lookup(udcSignColumn[maxColCnt-visibleCnt2]).setSignSetting(signSet.getValue(SetColumn[i]));
			visibleCnt2--;
		}
	}
}

function sendGetTnaResultList() {
	console.log("sendGetTnaResultList");
	
	var smsSetData = app.lookup("smsSetData");
	
	console.log("smsSetData:");
	console.log(smsSetData);
	
	var smsGetTnaResultList = app.lookup("sms_getTnaResultList");
	var dtStart = smsSetData.getValue("startTime");
	var dtEnd = smsSetData.getValue("endTime");
	
	
	
	var cmbCategory = smsSetData.getValue("searchCategory");
	
	var edtKeyword = smsSetData.getValue("searchKeyword");
	
	var recordType = smsSetData.getValue("reportType");
	
	console.log("cmbCategory:");
	console.log(cmbCategory);
	
	console.log("edtKeyword:");
	console.log(edtKeyword);
	
	console.log("recordType:");
	console.log(recordType);
	
	smsGetTnaResultList.setParameters("startTime", dtStart );
	smsGetTnaResultList.setParameters("endTime", dtEnd );
	smsGetTnaResultList.setParameters("offset", offset);
	smsGetTnaResultList.setParameters("limit", pageRowCount);
	smsGetTnaResultList.setParameters("groupID", smsSetData.getValue("groupID"));
	smsGetTnaResultList.setParameters("searchCategory", cmbCategory);
	smsGetTnaResultList.setParameters("searchKeyword", edtKeyword);
	
	smsGetTnaResultList.setParameters("recordType", recordType);
	
	
	if (edtKeyword == null || edtKeyword.length <= 0) {
		smsGetTnaResultList.setParameters("searchCategory", "");
		smsGetTnaResultList.setParameters("searchKeyword", "");
	}
	var dsTnaResult = app.lookup("tnaResultList");
	dsTnaResult.clear();
	smsGetTnaResultList.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getTnaResultListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));		
		
		// 예멘향 실제 초과시간 추가
		if(OEM_VERSION == OEM_YEMEN){
			var dsTnaList = app.lookup("tnaResultList");
			dsTnaList = util.ActualOverTime(dsTnaList);
		}
		
	} else {
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_TNA";
		if (errStr.length > 0) {
			errMsg = dataManager.getString(errStr);
		} else {
			errMsg = dataManager.getString(errMsg);
		}
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
	}
	//comLib.hideLoadMask();
	app.lookup("TRPPP_grdTNALog").redraw();
	app.lookup("TRPPP_grpMain").redraw();
	
	//총 근무시간, 총 급여 항목 없을 때는 그리드 창을 제거함.
	var totalWorkTime = app.lookup("tnaResultSum").getValue("TotalWorkTime");
	var totalPayment = app.lookup("tnaResultSum").getValue("TotalPaymentEx");
	if (totalWorkTime != "-" || totalPayment != "-") {
		var dsTnaResultSum = app.lookup("dsTnaResultSum");
		//ds 클리어	
		dsTnaResultSum.clear();
		//ds에 행 하나를 추가, addedRow로 받아옴
		var addedRow  = dsTnaResultSum.addRow();
		
		//data map에 받아온 결과를 ds에 세팅
		addedRow.setValue("TotalWorkTime", totalWorkTime);
		addedRow.setValue("TotalPayment", totalPayment);
	}else {
		app.lookup("grp_Total").dispose();
	}
	
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getTnaResultListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getTnaResultListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * 버튼(TRPPP_btnSetting)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTRPPP_btnSettingClick(/* cpr.events.CMouseEvent */ e){
	var smsSetData = app.lookup("smsSetData");
		
	var cmbCategory = smsSetData.getValue("searchCategory");
	var edtKeyword = smsSetData.getValue("searchKeyword");	
		
	console.log(cmbCategory);
	console.log(edtKeyword);
	
	var appld = "app/main/integratedReporting/signedSetting/documentSetting" + "?" + TRPPP_version;
	app.getRootAppInstance().openDialog(appld, 
	{width : 700, height : 370, color : "#ffffff"}, function(dialog){
		dialog.ready(function(dialogApp){
			// 필요한 경우, 다이얼로그의 앱이 초기화 된 후, 앱 속성을 전달하십시오.
			
			var obj = getParameters(window.location.search);
			
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
			
			
			//dialog.initValue = {btnText1: obj['btnText1'], btnText2: obj['btnText2']};
			dialog.initValue = {btnText1: obj['btnText1'], btnText2: obj['btnText2'],
			 Str_ApprovalLineSettings: languageMap.get("Str_ApprovalLineSettings"), 
			 Str_ApprovalLineAdd: languageMap.get("Str_ApprovalLineAdd"), 
			 Str_ApprovalLineExcept: languageMap.get("Str_ApprovalLineExcept"),
			 Str_PDFSave: languageMap.get("Str_PDFSave"),
			 Str_PDFTitle: languageMap.get("Str_PDFTitle"),
			 Str_FontSize: languageMap.get("Str_FontSize"),
			 Str_FontThickness: languageMap.get("Str_FontThickness")
			 };
			 
			 
			 
			 
						
			console.log("*******************************************");
			console.log(dialog.initValue);
						
			dialog.headerTitle = "PDF " + languageMap.get("Str_Setting");
			dialog.modal = false;
						
			});
		}).then(function(returnValue){
			if(returnValue) {
				var printSetting = app.lookup("PrintSetting");
				returnValue.copyToDataMap(printSetting);
				console.log(printSetting.getDatas());
				// Title
				var opbTitle = app.lookup("TRPPP_ipbTitle");
				opbTitle.value = printSetting.getValue("title");
				opbTitle.style.css({
					"font-size" : printSetting.getValue("fontsize") + 'pt',
					"font-weight" : printSetting.getValue("fontweight"),
				});
							
				var signedColumnFlag = printSetting.getValue("signedColumnFlag");
				if(0 == signedColumnFlag)
				{// 비활성화 
					
					console.log("0 == signedColumnFlag");
					
					app.lookup("TRPPP_udcSignColumn1").setVisible(false); 
					app.lookup("TRPPP_udcSignColumn2").setVisible(false); 
					app.lookup("TRPPP_udcSignColumn3").setVisible(false); 
					app.lookup("TRPPP_udcSignColumn4").setVisible(false); 
					app.lookup("TRPPP_udcSignColumn5").setVisible(false); 
					app.lookup("TRPPP_udcSignColumn6").setVisible(false); 
					app.lookup("TRPPP_udcSignColumn7").setVisible(false); 
					app.lookup("TRPPP_udcSignColumn8").setVisible(false); 
				}
				else 
				{
					var SignedColumnValue = null;
					var TRPPP_udcSignColumn = null;
					
					//// 1
					SignedColumnValue = printSetting.getValue("SignedColumn1");
					TRPPP_udcSignColumn = app.lookup("TRPPP_udcSignColumn1");
					
					console.log("SignedColumnValue1:" + SignedColumnValue);
					
					if(SignedColumnValue != "")
					{
						if(SignedColumnValue == " ")
						{
							TRPPP_udcSignColumn.setSignSetting("");
						}
						else
						{
							TRPPP_udcSignColumn.setSignSetting(SignedColumnValue);
						}
						
						TRPPP_udcSignColumn.setVisible(true);
					}
					else 
					{
						TRPPP_udcSignColumn.setVisible(false);
					}
					
					//// 2
					SignedColumnValue = printSetting.getValue("SignedColumn2");
					TRPPP_udcSignColumn = app.lookup("TRPPP_udcSignColumn2");
					
					console.log("SignedColumnValue2:" + SignedColumnValue);
					
					if(SignedColumnValue != "")
					{
						if(SignedColumnValue == " ")
						{
							TRPPP_udcSignColumn.setSignSetting("");
						}
						else
						{
							TRPPP_udcSignColumn.setSignSetting(SignedColumnValue);
						}
						
						TRPPP_udcSignColumn.setVisible(true);; 
					}
					else 
					{
						TRPPP_udcSignColumn.setVisible(false);
					}
					
					//// 3
					SignedColumnValue = printSetting.getValue("SignedColumn3");
					TRPPP_udcSignColumn = app.lookup("TRPPP_udcSignColumn3");
					
					console.log("SignedColumnValue3:" + SignedColumnValue);
					
					if(SignedColumnValue != "")
					{
						if(SignedColumnValue == " ")
						{
							TRPPP_udcSignColumn.setSignSetting("");
						}
						else
						{
							TRPPP_udcSignColumn.setSignSetting(SignedColumnValue);
						}
						
						TRPPP_udcSignColumn.setVisible(true);; 
					}
					else 
					{
						TRPPP_udcSignColumn.setVisible(false);
					}
				
					//// 4
					SignedColumnValue = printSetting.getValue("SignedColumn4");
					TRPPP_udcSignColumn = app.lookup("TRPPP_udcSignColumn4");
					
					console.log("SignedColumnValue4:" + SignedColumnValue);
					
					if(SignedColumnValue != "")
					{
						if(SignedColumnValue == " ")
						{
							TRPPP_udcSignColumn.setSignSetting("");
						}
						else
						{
							TRPPP_udcSignColumn.setSignSetting(SignedColumnValue);
						}
						
						TRPPP_udcSignColumn.setVisible(true);; 
					}
					else 
					{
						TRPPP_udcSignColumn.setVisible(false);
					}
				
					//// 5
					SignedColumnValue = printSetting.getValue("SignedColumn5");
					TRPPP_udcSignColumn = app.lookup("TRPPP_udcSignColumn5");
					
					console.log("SignedColumnValue5:" + SignedColumnValue);
					
					if(SignedColumnValue != "")
					{
						if(SignedColumnValue == " ")
						{
							TRPPP_udcSignColumn.setSignSetting("");
						}
						else
						{
							TRPPP_udcSignColumn.setSignSetting(SignedColumnValue);
						}
						
						TRPPP_udcSignColumn.setVisible(true);; 
					}	
					else 
					{
						TRPPP_udcSignColumn.setVisible(false);
					}
				
					//// 6
					SignedColumnValue = printSetting.getValue("SignedColumn6");
					TRPPP_udcSignColumn = app.lookup("TRPPP_udcSignColumn6");
					
					console.log("SignedColumnValue6:" + SignedColumnValue);
					
					if(SignedColumnValue != "")
					{
						if(SignedColumnValue == " ")
						{
							TRPPP_udcSignColumn.setSignSetting("");
						}
						else
						{
							TRPPP_udcSignColumn.setSignSetting(SignedColumnValue);
						}
						
						TRPPP_udcSignColumn.setVisible(true);; 
					}
					else 
					{
						TRPPP_udcSignColumn.setVisible(false);
					}
					
					//// 7
					SignedColumnValue = printSetting.getValue("SignedColumn7");
					TRPPP_udcSignColumn = app.lookup("TRPPP_udcSignColumn7");
					
					console.log("SignedColumnValue7:" + SignedColumnValue);
					
					if(SignedColumnValue != "")
					{
						if(SignedColumnValue == " ")
						{
							TRPPP_udcSignColumn.setSignSetting("");
						}
						else
						{
							TRPPP_udcSignColumn.setSignSetting(SignedColumnValue);
						}
						
						TRPPP_udcSignColumn.setVisible(true);; 
					}
					else 
					{
						TRPPP_udcSignColumn.setVisible(false);
					}
							
					//// 8
					SignedColumnValue = printSetting.getValue("SignedColumn8");
					TRPPP_udcSignColumn = app.lookup("TRPPP_udcSignColumn8");
					
					console.log("SignedColumnValue8:" + SignedColumnValue);
					
					if(SignedColumnValue != "")
					{
						if(SignedColumnValue == " ")
						{
							TRPPP_udcSignColumn.setSignSetting("");
						}
						else
						{
							TRPPP_udcSignColumn.setSignSetting(SignedColumnValue);
						}
						
						TRPPP_udcSignColumn.setVisible(true);; 
					}
					else 
					{
						TRPPP_udcSignColumn.setVisible(false);
					}
				
				}
			}
	});	
}

function setReportView( visible ){
	var viewHeight = 768
	if( visible ){
		document.body.style.height = "768px";
		var grpMain = app.lookup("TRPPP_grpMain");
		grpMain.style.css({	"height" : 568,});
		app.lookup("TRPPP_grpMain").getLayout().setRowVisible(0, true);
		app.lookup("TRPPP_grpMain").getLayout().setRowVisible(1, true);
		
		var grdTNALog = app.lookup("TRPPP_grdTNALog");
		grdTNALog.getParent().updateConstraint(grdTNALog,{"top": 200+"px"});
		var grdTnaResultSum = app.lookup("TNARP_grdTnaResultSum");
		grdTnaResultSum.getParent().updateConstraint(grdTnaResultSum,{"top": 200+"px"});
	}else{
		document.body.style.height = "2024px";
		var grpMain = app.lookup("TRPPP_grpMain");
		grpMain.style.css({	"height" : 1724,});	
	}
	
	grpMain.redraw();
	
	app.lookup("TRPPP_btnSetting").visible = visible;
	app.lookup("TRPPP_btnPDFPrint").visible = visible;
}

/*
 * 버튼(TRPPP_btnPDFPrint)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTRPPP_btnPDFPrintClick(/* cpr.events.CMouseEvent */ e){
	var TRPPP_grdTNALog = app.lookup("TRPPP_grdTNALog");
	//RPALR_grdAuthLog.hScroll = "hidden";
	
	setReportView(false);
	
	console.log("getViewPortRect getColumnWidths: " + TRPPP_grdTNALog.getColumnWidths());

	var calcWidth = 0;	// 현재까지 더해진 컬럼 width
	var lastColum = 0;  // 마지막에  보여질 유효한 컬럼 인덱스 , 이 인덱스 이후에는 화면에 보이지 않게 할것이다
	var lastColumWidth = 0;  // 마지막에 조절될 컬럼 인덱스 
	var columWidths = TRPPP_grdTNALog.getColumnWidths();    // 컬럼 인덱스 width 배열
	var totalWidth = TRPPP_grdTNALog.getActualRect().width; // 실제 화면에 보여지고 있는 grid 컨트롤 width
	
	for (var i = 0; i < columWidths.length; i++) {

		if(false == TRPPP_grdTNALog.header.getColumn(i).visible) // 보이지 않는 컬럼은 제외한다
			continue;

		var strPxl = columWidths[i];
		var strPxl2 = strPxl.replace("px", ""); // 문자열에서 px 를 빼고 int 형으로 변환한다
		var intPxl = 0;
		intPxl = parseInt(strPxl2);
		
		console.log("intPxl: " + intPxl);

		calcWidth += intPxl;
		
		console.log("calcWidth: "+calcWidth);
		console.log("totalWidth: "+totalWidth);

		if (calcWidth > totalWidth) { // 현재까지 더해진 길이가 전체크기를 넘어 섰다면...
		
			lastColum = i - 1; // 현재 인덱스 이전것을 사용한다 
			
			var needWidth = intPxl - (calcWidth - totalWidth);
			
			strPxl = columWidths[lastColum];
			strPxl2 = strPxl.replace("px", ""); // 문자열에서 px 를 빼고 int 형으로 변환한다
			intPxl = 0;
			intPxl = parseInt(strPxl2);			
			
			lastColumWidth = intPxl + needWidth;
			
			console.log("calcWidth > totalWidth");
			
			break;
			
		} else if (calcWidth == totalWidth) {
			
			lastColum = i;
			lastColumWidth = intPxl;
			
			console.log("calcWidth == totalWidth");
			
			break;
		} else {
			console.log("calcWidth < totalWidth");
		}
	}
	
	console.log("lastColum text: "+ TRPPP_grdTNALog.header.getColumn(lastColum).text);
	console.log("lastColum index: "+ lastColum);
	console.log("lastColumWidth: "+ lastColumWidth);
	
	var layout = TRPPP_grdTNALog.getColumnLayout();	
	layout['columnLayout'][lastColum]['width'] = lastColumWidth;
	TRPPP_grdTNALog.setColumnLayout(layout);

	setTimeout(function(){pdfSave();}, 500);
}

var TRPPP_pdfDoc;
var TRPPP_pagePrintCount = 40;
var TRPPP_pageIndex = 1;
var totalPage;
var totalLog;

function pdfSave() {
	
	if( TRPPP_pageIndex > totalPage ){	        
		printFinished();
		document.title = "rePortPage...";
		return;
	}
	        	
	var dsTnaResultList = app.lookup("tnaResultList");
	var dsTnaResultListAll = app.lookup("tnaResultListAll");
	
	if(TRPPP_pageIndex == 1 ){ // 첫 페이지
		totalLog = dsTnaResultList.getRowCount();
		if( totalLog == 0 ){
			return;
		}
		totalPage = Math.ceil(totalLog/TRPPP_pagePrintCount);
		
		var strMessge = "PDF File Create ... ["+ TRPPP_pageIndex + "/" + totalPage+"]";
		document.title = strMessge;
		//comLib.showLoadMask("pro", strMessge, "", totalPage);
		TRPPP_pdfDoc = new jsPDF('p', 'mm');
		
		
		console.log("total count : " + totalLog);
		console.log("total page : " + totalPage);
		
		dsTnaResultListAll.clear();
		//dsAuthLogList.copyToDataSet(dsAuthLogListAll);
		dsTnaResultListAll.build(dsTnaResultList.getRowDataRanged());
		dsTnaResultListAll.commit();
	
	}else{
		TRPPP_pdfDoc.addPage();
		var strMessge = "PDF File Create ... ["+ TRPPP_pageIndex + "/" + totalPage+"]";
		
		document.title = strMessge;
		//comLib.updateLoadMask(strMessge);
	}
	
	var startIndex = (TRPPP_pageIndex-1)*TRPPP_pagePrintCount;
	var endIndex = TRPPP_pageIndex*TRPPP_pagePrintCount-1;
	
	if( endIndex > totalLog){
		endIndex = dsTnaResultListAll.getRowCount()-1;
	}
	var printData = dsTnaResultListAll.getRowDataRanged(startIndex, endIndex);
	dsTnaResultList.clear();
	dsTnaResultList.build(printData);	
	app.lookup("TRPPP_grdTNALog").redraw();
	console.log(startIndex,endIndex,printData);
	
	setTimeout(function(){printPage();}, 10);	
	//doc.save('sample.pdf');	
}


function printPage(){	
	html2canvas(document.body, {		
		onrendered: function (canvas) {	    
			console.log("page "+TRPPP_pageIndex)	
			console.log("count "+ app.lookup("tnaResultList").getRowCount());
			var imgData = canvas.toDataURL('image/png');	    	
	    	var imgWidth = 210; // 이미지 가로 길이(mm) A4 기준
		    var pageHeight = imgWidth * 1.414;  // 출력 페이지 세로 길이 계산 A4 기준
		    var imgHeight = canvas.height * imgWidth / canvas.width;
		    var heightLeft = imgHeight;
		    		    
		    var position = 0;		    
			TRPPP_pdfDoc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
	       	        
	        TRPPP_pageIndex++;
	        if(TRPPP_pageIndex == 2 ){
	        	//app.lookup("RPPDF_grpMain").getLayout().removeRows([0]);
				//app.lookup("RPPDF_grpMain").getLayout().removeRows([0]);
				app.lookup("TRPPP_grpMain").getLayout().setRowVisible(0, false);
				app.lookup("TRPPP_grpMain").getLayout().setRowVisible(1, false);
				app.lookup("TRPPP_grpMain").getLayout().setRows(["0px", "0px", "1fr" ]);
				var grdTNALog = app.lookup("TRPPP_grdTNALog");
				grdTNALog.getParent().updateConstraint(grdTNALog,{"top": 60+"px"});
						
			}
			setTimeout(function(){pdfSave();}, 10);		        	        
			
		}
	});		
}	

function printFinished(){
	
	TRPPP_pdfDoc.save('sample.pdf');	
	TRPPP_pageIndex =1;
	setReportView(true);
	
	var dsTnaResultList = app.lookup("tnaResultList");
	var dsTnaResultListAll = app.lookup("tnaResultListAll");
	dsTnaResultList.clear();
	dsTnaResultListAll.copyToDataSet(dsTnaResultList);
	dsTnaResultList.commit();
	//comLib.hideLoadMask();
}

/*
  html2canvas(document.body, {		
	    onrendered: function (canvas) {
	    	var imgData = canvas.toDataURL('image/png');
	    	
	    	var imgWidth = 210; // 이미지 가로 길이(mm) A4 기준
		    var pageHeight = imgWidth * 1.414;  // 출력 페이지 세로 길이 계산 A4 기준
		    var imgHeight = canvas.height * imgWidth / canvas.width;
		    var heightLeft = imgHeight;
		    var doc = new jsPDF('p', 'mm');
		    
		    var position = 0;
		    
			doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
			heightLeft -= pageHeight;
			
			 while (heightLeft >= 20) {
	            position = heightLeft - imgHeight;
	            doc.addPage();
	            doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
	            heightLeft -= pageHeight;
	        }
	        
			doc.save('sample.pdf');
	    }
	});
 
 */

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms_getLangListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getLangList = e.control;
	
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getLangListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getLangList = e.control;
	
	languageMap.clear();
		
	var dsLangList = app.lookup("LangList");
	for(var i=0; i < dsLangList.getRowCount(); i++){	
		var row = dsLangList.getRow(i);
		languageMap.set(row.getValue("Key"),row.getValue("Value"));
		
	}
	
	
	var UserID = 0;
	var UserName = 1;
	var UniqueID = 2;
	var GroupCode = 3;
	var Department = 4;
	var PositionName = 5;
	var WorkDate = 6;
	var DayOfWeek = 7;
	var ShiftName = 8;
	var InTime = 9;
	var OutTime = 10;
	var LateTime = 11;
	var LackTime = 12;
	var Wt1ln = 13;
	var Wt1Out = 14;
	var Wt1Late = 15;
	var Wt1Lack = 16;
	var Wt1Time = 17;
	var Wt6Time = 18;
	var ActualOverTime = 19;
	var PaymentEx = 20;
		
	app.lookup("TRPPP_grdTNALog").header.getColumn(UserID).text = languageMap.get("Str_UserID");
	app.lookup("TRPPP_grdTNALog").header.getColumn(UserName).text = languageMap.get("Str_UserName");
	app.lookup("TRPPP_grdTNALog").header.getColumn(UniqueID).text = languageMap.get("Str_UniqueID");
	app.lookup("TRPPP_grdTNALog").header.getColumn(GroupCode).text = languageMap.get("Str_GroupCode");
	app.lookup("TRPPP_grdTNALog").header.getColumn(Department).text = languageMap.get("Str_Department");
	var oemVersion = TRPPP_version.slice(-2);
	if (oemVersion == OEM_BEST_ALLIANCE){
		app.lookup("TRPPP_grdTNALog").header.getColumn(PositionName).text = "Title";
	} else {
		app.lookup("TRPPP_grdTNALog").header.getColumn(PositionName).text = languageMap.get("Str_PositionName");
	}
	
	if (oemVersion == OEM_YEMEN) {
		app.lookup("TRPPP_grdTNALog").header.getColumn(ActualOverTime).visible = true;
		app.lookup("TRPPP_grdTNALog").header.getColumn(ActualOverTime).text = languageMap.get("Str_ActualOverTime");
	}
	
	app.lookup("TRPPP_grdTNALog").header.getColumn(WorkDate).text = languageMap.get("Str_WorkDate");
	app.lookup("TRPPP_grdTNALog").header.getColumn(DayOfWeek).text = languageMap.get("Str_DayOfWeek");
	app.lookup("TRPPP_grdTNALog").header.getColumn(ShiftName).text = languageMap.get("Str_ShiftName");
	app.lookup("TRPPP_grdTNALog").header.getColumn(InTime).text = languageMap.get("Str_Intime");
	app.lookup("TRPPP_grdTNALog").header.getColumn(OutTime).text = languageMap.get("Str_Outtime");
	app.lookup("TRPPP_grdTNALog").header.getColumn(LateTime).text = languageMap.get("Str_Latetime");
	
	app.lookup("TRPPP_grdTNALog").header.getColumn(LackTime).text = languageMap.get("Str_Leavetime");
	app.lookup("TRPPP_grdTNALog").header.getColumn(Wt1ln).text = languageMap.get("Str_WorkingTimeIN");
	app.lookup("TRPPP_grdTNALog").header.getColumn(Wt1Out).text = languageMap.get("Str_WorkingTimeOUT");
	app.lookup("TRPPP_grdTNALog").header.getColumn(Wt1Late).text = languageMap.get("Str_BasicWorkLate");
	app.lookup("TRPPP_grdTNALog").header.getColumn(Wt1Lack).text = languageMap.get("Str_BasicWorkLack");
	app.lookup("TRPPP_grdTNALog").header.getColumn(Wt1Time).text = languageMap.get("Str_BasicWorkTime");
	app.lookup("TRPPP_grdTNALog").header.getColumn(Wt6Time).text = languageMap.get("Str_Overtime3Hours");
	app.lookup("TRPPP_grdTNALog").header.getColumn(PaymentEx).text = languageMap.get("Str_Payment");
	
	var cmbDayOfWeek = app.lookup("TRPPP_cmbDayOfWeek");
	cmbDayOfWeek.addItem(new cpr.controls.Item(languageMap.get("Str_Week0"),"Sun"));
	cmbDayOfWeek.addItem(new cpr.controls.Item(languageMap.get("Str_Week1"),"Mon"));
	cmbDayOfWeek.addItem(new cpr.controls.Item(languageMap.get("Str_Week2"),"Tue"));
	cmbDayOfWeek.addItem(new cpr.controls.Item(languageMap.get("Str_Week3"),"Wen"));
	cmbDayOfWeek.addItem(new cpr.controls.Item(languageMap.get("Str_Week4"),"Thu"));
	cmbDayOfWeek.addItem(new cpr.controls.Item(languageMap.get("Str_Week5"),"Fri"));
	cmbDayOfWeek.addItem(new cpr.controls.Item(languageMap.get("Str_Week6"),"Sat"));
	
	//합계 그리드
	var TotalWorkTime = 0;
	var TotalPayment = 1;
	app.lookup("TNARP_grdTnaResultSum").header.getColumn(TotalWorkTime).text = languageMap.get("Str_ToatlWorkTime");
	app.lookup("TNARP_grdTnaResultSum").header.getColumn(TotalPayment).text = languageMap.get("Str_ToatlPayment");
	
		
	sendGetTnaResultList();
}



