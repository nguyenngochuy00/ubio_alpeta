/************************************************
 * mealReportPage.js
 * Created at 2020. 2. 25. 오후 5:45:10.
 *
 * @author joymrk
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var offset = 0;
var pageRowCount = 2000;
var RPALR_version;
var udcSignColumn = ["RPPDF_udcSignColumn4", "RPPDF_udcSignColumn5", "RPPDF_udcSignColumn6", "RPPDF_udcSignColumn7",
						"RPPDF_udcSignColumn8","RPPDF_udcSignColumn3", "RPPDF_udcSignColumn2", "RPPDF_udcSignColumn1"];
var SetColumn = ["SignedColumn1", "SignedColumn2", "SignedColumn3", "SignedColumn4",
			"SignedColumn5","SignedColumn6", "SignedColumn7", "SignedColumn8"];
			
			
var languageMap = new Map();
			
//var languageList = new cpr.data.DataSet;
			
var language = "ko";
			
			
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */


function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);	
	//RPALR_version = dataManager.getSystemVersion();
	
	
	
	var obj = getParameters(window.location.search);
   	app.lookup("reportPageSet").build(obj);
   	app.lookup("smsSetData").build(obj);
   	
    console.log(app.lookup("smsSetData"));
   	
   	RPALR_version = obj["version"]   	
	setHeadPage();	
	
	
	app.lookup("RPPDF_udcSignColumn1").setVisible(false); 
	app.lookup("RPPDF_udcSignColumn2").setVisible(false); 
	app.lookup("RPPDF_udcSignColumn3").setVisible(false); 
	app.lookup("RPPDF_udcSignColumn4").setVisible(false); 
	app.lookup("RPPDF_udcSignColumn5").setVisible(false); 
	app.lookup("RPPDF_udcSignColumn6").setVisible(true); 
	app.lookup("RPPDF_udcSignColumn7").setVisible(true); 
	app.lookup("RPPDF_udcSignColumn8").setVisible(true); 
	
	language = obj["locale"];
		
	dataManager.setLocale(language);
	
		
	var sms_getLangList = app.lookup("sms_getLangList") ;
	//sms_getLangList.action = "data/lang/lang_ko.json";	
	sms_getLangList.action = "data/lang/lang_"+language+".json";	
	
	console.log(sms_getLangList.action);
	
	sms_getLangList.send();			
	
  	
  	
  	
	//sendGetMealResultList();
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
	
	console.log(setHeadPage);
	
	// Title
	var opbTitle = app.lookup("RPALR_ipbTitle")
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
		//console.log(signSet.getDatas());
		
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
		
		
		//	app.lookup("RPPDF_udcSignColumn1").setSignSetting(signtxt); // 텍스트 입력
				
	//	app.lookup("RPPDF_udcSignSet").setSignSetting(signSet);
	}
	//console.log(app.lookup("RPPDF_grpSigns").getLayout()); // 레이아웃으로 지우고 한쪽으로 몰기
}

function sendGetMealResultList() {
	
	console.log(app.lookup("sendGetMealResultList"));
	
	var smsSetData = app.lookup("smsSetData");
	
	console.log("smsSetData:");
	console.log(smsSetData);
	
	var sms_getMealResultList = app.lookup("sms_getMealResultList");
	var dtStart = smsSetData.getValue("StartAt");
	var dtEnd = smsSetData.getValue("EndAt");
	
	
	
	var cmbCategory = smsSetData.getValue("searchCategory");
	
	var edtKeyword = smsSetData.getValue("searchKeyword");
	
	var mealResult = smsSetData.getValue("mealResult");
	
	console.log("cmbCategory:");
	console.log(cmbCategory);
	
	console.log("edtKeyword:");
	console.log(edtKeyword);
	
	console.log("mealResult:");
	console.log(mealResult);
	
	
	sms_getMealResultList.setParameters("StartAt", dtStart );
	sms_getMealResultList.setParameters("EndAt", dtEnd );
	sms_getMealResultList.setParameters("offset", offset);
	sms_getMealResultList.setParameters("limit", pageRowCount);
	sms_getMealResultList.setParameters("groupID", smsSetData.getValue("groupID"));
	sms_getMealResultList.setParameters("searchCategory", cmbCategory);
	sms_getMealResultList.setParameters("searchKeyword", edtKeyword);
	
	sms_getMealResultList.setParameters("mealResult", mealResult);
	
	
	if (edtKeyword == null || edtKeyword.length <= 0) {
		sms_getMealResultList.setParameters("searchCategory", "");
		sms_getMealResultList.setParameters("searchKeyword", "");
	}
	//var dsMealResult = app.lookup("MealResult");
	//dsMealResult.clear();
	sms_getMealResultList.send();
}
// 인증로그 리스트 가져오기 완료
function onSms_getAuthLogListSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));		
		//setTimeout(function(){pdfSave();}, 100);
	} else {
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_AuthLog";
		if (errStr.length > 0) {
			errMsg = dataManager.getString(errStr);
		} else {
			errMsg = dataManager.getString(errMsg);
		}
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
	}
	comLib.hideLoadMask();
	
	app.lookup("RPALR_grdMealLog").redraw();
	app.lookup("RPPDF_grpMain").redraw();
}

// 레포트 설정 클릭
function onRPALR_btnSettingClick(/* cpr.events.CMouseEvent */ e){
	
		var smsSetData = app.lookup("smsSetData");
		
		var cmbCategory = smsSetData.getValue("searchCategory");
		var edtKeyword = smsSetData.getValue("searchKeyword");	
		
		console.log(cmbCategory);
		console.log(edtKeyword);
	
	var appld = "app/main/integratedReporting/signedSetting/documentSetting" + "?" + RPALR_version;
	app.getRootAppInstance().openDialog(appld, 
	{width : 700, height : 370, color : "#ffffff"}, function(dialog){
		dialog.ready(function(dialogApp){
			// 필요한 경우, 다이얼로그의 앱이 초기화 된 후, 앱 속성을 전달하십시오.
			
			var obj = getParameters(window.location.search);
			
			//dialog.initValue = {btnText1: dataManager.getString("Str_DefaultValue"), btnText2: dataManager.getString("Str_Apply")};
			
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
			//dialog.initValue = selectionRow.getRowData();
			
			});
		}).then(function(returnValue){
			if(returnValue) {
				var printSetting = app.lookup("PrintSetting");
				returnValue.copyToDataMap(printSetting);
				console.log(printSetting);
				
				
				
				// Title
				var opbTitle = app.lookup("RPALR_ipbTitle")
				opbTitle.value = printSetting.getValue("title");
				opbTitle.style.css({
					"font-size" : printSetting.getValue("fontsize") + 'pt',
					"font-weight" : printSetting.getValue("fontweight"),
				});
				
				
				
				var signedColumnFlag = printSetting.getValue("signedColumnFlag");
				if(0 == signedColumnFlag)
				{// 비활성화 
					
					console.log("0 == signedColumnFlag");
					
					app.lookup("RPPDF_udcSignColumn1").setVisible(false); 
					app.lookup("RPPDF_udcSignColumn2").setVisible(false); 
					app.lookup("RPPDF_udcSignColumn3").setVisible(false); 
					app.lookup("RPPDF_udcSignColumn4").setVisible(false); 
					app.lookup("RPPDF_udcSignColumn5").setVisible(false); 
					app.lookup("RPPDF_udcSignColumn6").setVisible(false); 
					app.lookup("RPPDF_udcSignColumn7").setVisible(false); 
					app.lookup("RPPDF_udcSignColumn8").setVisible(false); 
					
					
				}
				else 
				{
					var SignedColumnValue = null;
					var RPPDF_udcSignColumn = null;
					
					//// 1
					SignedColumnValue = printSetting.getValue("SignedColumn1");
					RPPDF_udcSignColumn = app.lookup("RPPDF_udcSignColumn1");
					
					console.log("SignedColumnValue1:" + SignedColumnValue);
					
					
					if(SignedColumnValue != "")
					{
						if(SignedColumnValue == " ")
						{
							RPPDF_udcSignColumn.setSignSetting("");
						}
						else
						{
							RPPDF_udcSignColumn.setSignSetting(SignedColumnValue);
						}
						
						RPPDF_udcSignColumn.setVisible(true);
					}
					else 
					{
						RPPDF_udcSignColumn.setVisible(false);
					}
					
					//// 2
					SignedColumnValue = printSetting.getValue("SignedColumn2");
					RPPDF_udcSignColumn = app.lookup("RPPDF_udcSignColumn2");
					
					console.log("SignedColumnValue2:" + SignedColumnValue);
					
					if(SignedColumnValue != "")
					{
						if(SignedColumnValue == " ")
						{
							RPPDF_udcSignColumn.setSignSetting("");
						}
						else
						{
							RPPDF_udcSignColumn.setSignSetting(SignedColumnValue);
						}
						
						RPPDF_udcSignColumn.setVisible(true);; 
					}
					else 
					{
						RPPDF_udcSignColumn.setVisible(false);
					}
					
					//// 3
					SignedColumnValue = printSetting.getValue("SignedColumn3");
					RPPDF_udcSignColumn = app.lookup("RPPDF_udcSignColumn3");
					
					console.log("SignedColumnValue3:" + SignedColumnValue);
					
					if(SignedColumnValue != "")
					{
						if(SignedColumnValue == " ")
						{
							RPPDF_udcSignColumn.setSignSetting("");
						}
						else
						{
							RPPDF_udcSignColumn.setSignSetting(SignedColumnValue);
						}
						
						RPPDF_udcSignColumn.setVisible(true);; 
					}
					else 
					{
						RPPDF_udcSignColumn.setVisible(false);
					}
				
					//// 4
					SignedColumnValue = printSetting.getValue("SignedColumn4");
					RPPDF_udcSignColumn = app.lookup("RPPDF_udcSignColumn4");
					
					console.log("SignedColumnValue4:" + SignedColumnValue);
					
					if(SignedColumnValue != "")
					{
						if(SignedColumnValue == " ")
						{
							RPPDF_udcSignColumn.setSignSetting("");
						}
						else
						{
							RPPDF_udcSignColumn.setSignSetting(SignedColumnValue);
						}
						
						RPPDF_udcSignColumn.setVisible(true);; 
					}
					else 
					{
						RPPDF_udcSignColumn.setVisible(false);
					}
				
					//// 5
					SignedColumnValue = printSetting.getValue("SignedColumn5");
					RPPDF_udcSignColumn = app.lookup("RPPDF_udcSignColumn5");
					
					console.log("SignedColumnValue5:" + SignedColumnValue);
					
					if(SignedColumnValue != "")
					{
						if(SignedColumnValue == " ")
						{
							RPPDF_udcSignColumn.setSignSetting("");
						}
						else
						{
							RPPDF_udcSignColumn.setSignSetting(SignedColumnValue);
						}
						
						RPPDF_udcSignColumn.setVisible(true);; 
					}	
					else 
					{
						RPPDF_udcSignColumn.setVisible(false);
					}
				
					//// 6
					SignedColumnValue = printSetting.getValue("SignedColumn6");
					RPPDF_udcSignColumn = app.lookup("RPPDF_udcSignColumn6");
					
					console.log("SignedColumnValue6:" + SignedColumnValue);
					
					if(SignedColumnValue != "")
					{
						if(SignedColumnValue == " ")
						{
							RPPDF_udcSignColumn.setSignSetting("");
						}
						else
						{
							RPPDF_udcSignColumn.setSignSetting(SignedColumnValue);
						}
						
						RPPDF_udcSignColumn.setVisible(true);; 
					}
					else 
					{
						RPPDF_udcSignColumn.setVisible(false);
					}
					
					//// 7
					SignedColumnValue = printSetting.getValue("SignedColumn7");
					RPPDF_udcSignColumn = app.lookup("RPPDF_udcSignColumn7");
					
					console.log("SignedColumnValue7:" + SignedColumnValue);
					
					if(SignedColumnValue != "")
					{
						if(SignedColumnValue == " ")
						{
							RPPDF_udcSignColumn.setSignSetting("");
						}
						else
						{
							RPPDF_udcSignColumn.setSignSetting(SignedColumnValue);
						}
						
						RPPDF_udcSignColumn.setVisible(true);; 
					}
					else 
					{
						RPPDF_udcSignColumn.setVisible(false);
					}
							
					//// 8
					SignedColumnValue = printSetting.getValue("SignedColumn8");
					RPPDF_udcSignColumn = app.lookup("RPPDF_udcSignColumn8");
					
					console.log("SignedColumnValue8:" + SignedColumnValue);
					
					if(SignedColumnValue != "")
					{
						if(SignedColumnValue == " ")
						{
							RPPDF_udcSignColumn.setSignSetting("");
						}
						else
						{
							RPPDF_udcSignColumn.setSignSetting(SignedColumnValue);
						}
						
						RPPDF_udcSignColumn.setVisible(true);; 
					}
					else 
					{
						RPPDF_udcSignColumn.setVisible(false);
					}
				
				}
			}
	});	
}
function setReportView( visible ){
	var viewHeight = 768
	if( visible ){
		document.body.style.height = "768px";
		var grpMain = app.lookup("RPPDF_grpMain");
		grpMain.style.css({	"height" : 568,});
		app.lookup("RPPDF_grpMain").getLayout().setRowVisible(0, true);
		app.lookup("RPPDF_grpMain").getLayout().setRowVisible(1, true);
		
		var grdMealLog = app.lookup("RPALR_grdMealLog");
		grdMealLog.getParent().updateConstraint(grdMealLog,{"top": 200+"px"});
	}else{
		document.body.style.height = "2024px";
		var grpMain = app.lookup("RPPDF_grpMain");
		grpMain.style.css({	"height" : 1724,});	
	}
	
	grpMain.redraw();
	
	
	app.lookup("RPALR_btnSetting").visible = visible;
	app.lookup("RPALR_btnPDFPrint").visible = visible;
}
// PDF 출력 버튼 클릭
function onRPALR_btnPDFPrintClick(/* cpr.events.CMouseEvent */ e){
	RPALR_grdMealLog = app.lookup("RPALR_grdMealLog");
	//RPALR_grdAuthLog.hScroll = "hidden";
	
	setReportView(false);
	
	console.log("getViewPortRect getColumnWidths: " + RPALR_grdMealLog.getColumnWidths());

	var calcWidth = 0;	// 현재까지 더해진 컬럼 width
	var lastColum = 0;  // 마지막에  보여질 유효한 컬럼 인덱스 , 이 인덱스 이후에는 화면에 보이지 않게 할것이다
	var lastColumWidth = 0;  // 마지막에 조절될 컬럼 인덱스 
	var columWidths = RPALR_grdMealLog.getColumnWidths();    // 컬럼 인덱스 width 배열
	var totalWidth = RPALR_grdMealLog.getActualRect().width; // 실제 화면에 보여지고 있는 grid 컨트롤 width
	
	for (var i = 0; i < columWidths.length; i++) {

		if(false == RPALR_grdMealLog.header.getColumn(i).visible) // 보이지 않는 컬럼은 제외한다
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
	
	console.log("lastColum text: "+ RPALR_grdMealLog.header.getColumn(lastColum).text);
	console.log("lastColum index: "+ lastColum);
	console.log("lastColumWidth: "+ lastColumWidth);
	
	var layout = RPALR_grdMealLog.getColumnLayout();	
	layout['columnLayout'][lastColum]['width'] = lastColumWidth;
	RPALR_grdMealLog.setColumnLayout(layout);

	setTimeout(function(){pdfSave();}, 500);
}

var RPALR_pdfDoc;
var RPALR_pagePrintCount = 40;
var RPALR_pageIndex = 1;
var totalPage;
var totalLog;

function pdfSave() {
	
	if( RPALR_pageIndex > totalPage ){	        
		printFinished();
		var strMessge = "PDF File Create ... ["+ RPALR_pageIndex + "/" + totalPage+"]";
		document.title = strMessge;
		return;
	}
	        	
	var dsMealResult = app.lookup("MealResult");
	var dsMealResultAll = app.lookup("MealResultAll");
	
	if(RPALR_pageIndex == 1 ){
		RPALR_pdfDoc = new jsPDF('p', 'mm');
			
		totalLog = dsMealResult.getRowCount();
		if( totalLog == 0 ){
			return;
		}
		totalPage = Math.ceil(totalLog/RPALR_pagePrintCount);
		var strMessge = "PDF File Create ... ["+ RPALR_pageIndex + "/" + totalPage+"]";
		document.title = strMessge;
		console.log("total count : " + totalLog);
		console.log("total page : " + totalPage);
		
		dsMealResultAll.clear();
		//dsAuthLogList.copyToDataSet(dsAuthLogListAll);
		dsMealResultAll.build(dsMealResult.getRowDataRanged());
		dsMealResultAll.commit();
	
	}else{
		RPALR_pdfDoc.addPage();
		var strMessge = "PDF File Create ... ["+ RPALR_pageIndex + "/" + totalPage+"]";
		document.title = strMessge;
	}
	
	var startIndex = (RPALR_pageIndex-1)*RPALR_pagePrintCount;
	var endIndex = RPALR_pageIndex*RPALR_pagePrintCount-1;
	
	if( endIndex > totalLog){
		endIndex = dsMealResultAll.getRowCount()-1;
	}
	var printData = dsMealResultAll.getRowDataRanged(startIndex, endIndex);
	dsMealResult.clear();
	dsMealResult.build(printData);	
	app.lookup("RPALR_grdMealLog").redraw();
	console.log(startIndex,endIndex,printData);
	
	setTimeout(function(){printPage();}, 10);	
	//doc.save('sample.pdf');	
}


function printPage(){	
	html2canvas(document.body, {		
		onrendered: function (canvas) {	    
			console.log("page "+RPALR_pageIndex)	
			console.log("count "+ app.lookup("MealResult").getRowCount());
			var imgData = canvas.toDataURL('image/png');	    	
	    	var imgWidth = 210; // 이미지 가로 길이(mm) A4 기준
		    var pageHeight = imgWidth * 1.414;  // 출력 페이지 세로 길이 계산 A4 기준
		    var imgHeight = canvas.height * imgWidth / canvas.width;
		    var heightLeft = imgHeight;
		    		    
		    var position = 0;		    
			RPALR_pdfDoc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
	       	        
	        RPALR_pageIndex++;
	        if(RPALR_pageIndex == 2 ){
	        	//app.lookup("RPPDF_grpMain").getLayout().removeRows([0]);
				//app.lookup("RPPDF_grpMain").getLayout().removeRows([0]);
				app.lookup("RPPDF_grpMain").getLayout().setRowVisible(0, false);
				app.lookup("RPPDF_grpMain").getLayout().setRowVisible(1, false);
				app.lookup("RPPDF_grpMain").getLayout().setRows(["0px", "0px", "1fr" ]);
				var grdMealLog = app.lookup("RPALR_grdMealLog");
				grdMealLog.getParent().updateConstraint(grdMealLog,{"top": 60+"px"});
						
			}
			setTimeout(function(){pdfSave();}, 10);		        	        
			
		}
	});		
}	

function printFinished(){
	
	RPALR_pdfDoc.save('sample.pdf');	
	RPALR_pageIndex =1;
	setReportView(true);
	
	var dsMealResult = app.lookup("MealResult");
	var dsMealResultAll = app.lookup("MealResultAll");
	dsMealResult.clear();
	dsMealResultAll.copyToDataSet(dsMealResult);
	dsMealResult.commit();
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
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getMealResultListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getMealResultList = e.control;
	
	console.log("onSms_getMealResultListSubmitDone");
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	
	console.log("onSms_getMealResultListSubmitDone111");
	
	if (resultCode == 0 /*COMERROR_NONE*/) {
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));	
		
		console.log("onSms_getMealResultListSubmitDone222");	
		
		var dsMealResult = app.lookup("MealResult");
		
		console.log("dsMealResult:");
		console.log(dsMealResult);
		
	} else {
		
		console.log("onSms_getMealResultListSubmitDone333");
		
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_MealManagement";
		if (errStr.length > 0) {
			errMsg = dataManager.getString(errStr);
		} else {
			errMsg = dataManager.getString(errMsg);
		}
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
	}
	comLib.hideLoadMask();
	
	app.lookup("RPALR_grdMealLog").redraw();
	app.lookup("RPPDF_grpMain").redraw();
	
	
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getMealResultListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getMealResultList = e.control;
	
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
	
	console.log("onSms_getMealResultListSubmitTimeout");
	
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getMealResultListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getMealResultList = e.control;
	
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
	
	console.log("onSms_getMealResultListSubmitError");
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms_getMealResultListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getMealResultList = e.control;
	
	console.log("onSms_getMealResultListSubmitSuccess");
	
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
	
	console.log("onSms_getLangListSubmitSuccess");
		
	languageMap.clear();
	
	var dsLangList = app.lookup("LangList");
	for(var i=0; i < dsLangList.getRowCount(); i++){	
		var row = dsLangList.getRow(i);
		languageMap.set(row.getValue("Key"),row.getValue("Value"));		
	}
	
	//dataManager.setLanguage(language, languageList);
	
	//dataManager.setLocale(language);
	
	//dataManager.updateData(languageList);
	
	
	//initComboAuthType();
	//initComboAuthResult();
	//initComboFuncType();
	
	var DateTime = 0;
	var TerminalID = 1;
	var UserID = 2;
	var Type = 3;
	var Menu = 4;
	var Pay = 5;
	var Result = 6;
	var UpMode = 7;

	//console.log(languageMap.get("Str_TerminalID"));
	
	app.lookup("RPALR_grdMealLog").header.getColumn(DateTime).text = languageMap.get("Str_MealTime");
	app.lookup("RPALR_grdMealLog").header.getColumn(TerminalID).text = languageMap.get("Str_TerminalID");
	app.lookup("RPALR_grdMealLog").header.getColumn(UserID).text = languageMap.get("Str_UserID");
	app.lookup("RPALR_grdMealLog").header.getColumn(Type).text = languageMap.get("Str_Type");
	app.lookup("RPALR_grdMealLog").header.getColumn(Menu).text = languageMap.get("Str_Menu");
	app.lookup("RPALR_grdMealLog").header.getColumn(Pay).text = languageMap.get("Str_Price");
	app.lookup("RPALR_grdMealLog").header.getColumn(Result).text = languageMap.get("Str_Result");
	app.lookup("RPALR_grdMealLog").header.getColumn(UpMode).text = "UpMode";
	
	var cmbAuthResult = app.lookup("RPALR_cmbAuthResult");
	cmbAuthResult.addItem(new cpr.controls.Item(languageMap.get("Str_Success"), 0));
	cmbAuthResult.addItem(new cpr.controls.Item(languageMap.get("Str_AuthResultFail"), 1));
	cmbAuthResult.addItem(new cpr.controls.Item(languageMap.get("Str_AuthResultAccessDenied"), 2));
	cmbAuthResult.addItem(new cpr.controls.Item(languageMap.get("Str_AuthResultTimeout"), 3));
	cmbAuthResult.addItem(new cpr.controls.Item(languageMap.get("Str_AuthResultTimeoutCapture"), 4));
	cmbAuthResult.addItem(new cpr.controls.Item(languageMap.get("Str_AuthResultTimeoutIdentify"), 5));
	cmbAuthResult.addItem(new cpr.controls.Item(languageMap.get("Str_AuthResultAntiPassback"), 6));
	cmbAuthResult.addItem(new cpr.controls.Item(languageMap.get("Str_AuthResultDuress"), 7));
	cmbAuthResult.addItem(new cpr.controls.Item(languageMap.get("Str_AuthResultBlackList"), 8));
		
	cmbAuthResult.addItem(new cpr.controls.Item(languageMap.get("Str_AuthLogResultFailMealPay"), 11));
	cmbAuthResult.addItem(new cpr.controls.Item(languageMap.get("Str_AuthLogResultFailMealTime"), 12));
	cmbAuthResult.addItem(new cpr.controls.Item(languageMap.get("Str_AuthLogResultFailNotExistsMealCode"), 13));
	cmbAuthResult.addItem(new cpr.controls.Item(languageMap.get("Str_AuthLogResultFailPeriod"), 14));
	cmbAuthResult.addItem(new cpr.controls.Item(languageMap.get("Str_AuthLogResultFailMealLimit"), 15));
	cmbAuthResult.addItem(new cpr.controls.Item(languageMap.get("Str_AuthLogResultFailDayLimit"), 16));
	cmbAuthResult.addItem(new cpr.controls.Item(languageMap.get("Str_AuthLogResultFailMonthLimit"), 17));
	
	
	var cmbAuthType = app.lookup("RPALR_cmbAuthType");
	cmbAuthType.addItem(new cpr.controls.Item(languageMap.get("Str_AuthTypeFPVerify"), 1));
	cmbAuthType.addItem(new cpr.controls.Item(languageMap.get("Str_AuthTypeFPIdentify"), 2));
	cmbAuthType.addItem(new cpr.controls.Item(languageMap.get("Str_Password"), 3));
	cmbAuthType.addItem(new cpr.controls.Item(languageMap.get("Str_Card"), 4));
	cmbAuthType.addItem(new cpr.controls.Item(languageMap.get("Str_AuthTypeFaceVerify"), 5));
	cmbAuthType.addItem(new cpr.controls.Item(languageMap.get("Str_AuthTypeFaceIdentify"), 6));
	cmbAuthType.addItem(new cpr.controls.Item(languageMap.get("Str_MobileCard"), 7));
	
	
	
	
	//app.lookup("RPALR_grdAuthLog").redraw();
	
	//dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Success"));
	
	//app.lookup("VMSRP_opbTitle").value = languageMap.get("Str_VisitorManagementTitle");
	//app.lookup("VMSRP_opbPhotoGuide").value = languageMap.get("Str_VisitorPhotoRegistGuide");
	//app.lookup("VMSRP_btnCapture").value = languageMap.get("Str_TakePhoto");
	
	
	sendGetMealResultList();
	
}


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
