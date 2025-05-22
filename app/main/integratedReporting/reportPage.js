/************************************************
 * reportPage.js
 * Created at 2020. 2. 25. 오후 5:45:10.
 *
 * @author joymrk
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var offset = 0;
var pageRowCount = 1000;
var RPALR_version;
var udcSignColumn = ["RPPDF_udcSignColumn4", "RPPDF_udcSignColumn5", "RPPDF_udcSignColumn6", "RPPDF_udcSignColumn7",
						"RPPDF_udcSignColumn8","RPPDF_udcSignColumn3", "RPPDF_udcSignColumn2", "RPPDF_udcSignColumn1"];
var SetColumn = ["SignedColumn1", "SignedColumn2", "SignedColumn3", "SignedColumn4",
			"SignedColumn5","SignedColumn6", "SignedColumn7", "SignedColumn8"];
			
var languageMap = new Map();
var totalLog;
			
//var languageList = new cpr.data.DataSet;
			
var language = "ko";
			
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);	
	//RPALR_version = dataManager.getSystemVersion();
	
	var obj = getParameters(window.location.search);
   	app.lookup("reportPageSet").build(obj);
   	app.lookup("smsSetData").build(obj);   	   
   	
   	RPALR_version = obj["version"];  	
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
	totalLog = obj["total"];
		
	var sms_getLangList = app.lookup("sms_getLangList") ;
	sms_getLangList.action = "data/lang/lang_"+language+".json";		
	sms_getLangList.send();		
}



function initComboAuthType() {
	var cmbAuthType = app.lookup("cmb_AuthLogType");
	if (cmbAuthType == null) return;
	
	cmbAuthType.addItem(new cpr.controls.Item(languageMap.get("Str_AuthTypeFPVerify"), 1));
	cmbAuthType.addItem(new cpr.controls.Item(languageMap.get("Str_AuthTypeFPIdentify"), 2));
	cmbAuthType.addItem(new cpr.controls.Item(languageMap.get("Str_Password"), 3));
	cmbAuthType.addItem(new cpr.controls.Item(languageMap.get("Str_Card"), 4));
	cmbAuthType.addItem(new cpr.controls.Item(languageMap.get("Str_AuthTypeFaceVerify"), 5));
	cmbAuthType.addItem(new cpr.controls.Item(languageMap.get("Str_AuthTypeFaceIdentify"), 6));
	cmbAuthType.addItem(new cpr.controls.Item(languageMap.get("Str_MobileCard"), 7));
	cmbAuthType.addItem(new cpr.controls.Item(languageMap.get("Str_TypeIrisIdentify"), 8)); 
	cmbAuthType.addItem(new cpr.controls.Item(languageMap.get("Str_TypeIrisVerify"), 9));
	
	if (dataManager.getOemVersion() == OEM_JAWOONDAE) {
		cmbAuthType.addItem(new cpr.controls.Item("PDA", 9998));
		cmbAuthType.addItem(new cpr.controls.Item("LPR", 9999));
	}
	
}

function initComboAuthResult() {
	var cmbAuthResult = app.lookup("cmb_AuthLogResult");
	if (cmbAuthResult == null) return;
	
	cmbAuthResult.addItem(new cpr.controls.Item(languageMap.get("Str_Success"), 0));
	cmbAuthResult.addItem(new cpr.controls.Item(languageMap.get("Str_AuthResultFail"), 1));
	cmbAuthResult.addItem(new cpr.controls.Item(languageMap.get("Str_AuthResultAccessDenied"), 2));
	cmbAuthResult.addItem(new cpr.controls.Item(languageMap.get("Str_AuthResultTimeout"), 3));
	cmbAuthResult.addItem(new cpr.controls.Item(languageMap.get("Str_AuthResultTimeoutCapture"), 4));
	cmbAuthResult.addItem(new cpr.controls.Item(languageMap.get("Str_AuthResultTimeoutIdentify"), 5));
	cmbAuthResult.addItem(new cpr.controls.Item(languageMap.get("Str_AuthResultAntiPassback"), 6));
	cmbAuthResult.addItem(new cpr.controls.Item(languageMap.get("Str_AuthResultDuress"), 7));
	cmbAuthResult.addItem(new cpr.controls.Item(languageMap.get("Str_AuthResultBlackList"), 8));
	
	cmbAuthResult.addItem(new cpr.controls.Item(languageMap.get("Str_AuthResultLprFail"), 125));
	cmbAuthResult.addItem(new cpr.controls.Item(languageMap.get("Str_AuthResultLprUnRegist"), 126));
	
}

function initComboFuncType() {
	var cmbAuthLogFuncType = app.lookup("cmb_AuthLogFuncType");
	if (cmbAuthLogFuncType == null) return;
	
	cmbAuthLogFuncType.addItem(new cpr.controls.Item(languageMap.get("Str_AuthLogFuncTypeAccess"), 0));
	cmbAuthLogFuncType.addItem(new cpr.controls.Item(languageMap.get("Str_AuthLogFuncTypeTna"), 1));
	cmbAuthLogFuncType.addItem(new cpr.controls.Item(languageMap.get("Str_AuthLogFuncTypeMeal"), 2));
	
	if (dataManager.getOemVersion() == OEM_JAWOONDAE) {
		cmbAuthLogFuncType.addItem(new cpr.controls.Item("PDA", 9998));
		cmbAuthLogFuncType.addItem(new cpr.controls.Item("LPR", 9999));
	}
	
	var cmbFKey = app.lookup("cmb_AuthFuncKey");
	cmbFKey.addItem(new cpr.controls.Item(languageMap.get("Str_FKeyF1"), 1));
	cmbFKey.addItem(new cpr.controls.Item(languageMap.get("Str_FKeyF2"), 2));
	cmbFKey.addItem(new cpr.controls.Item(languageMap.get("Str_FKeyAccess"), 3));
	cmbFKey.addItem(new cpr.controls.Item(languageMap.get("Str_FKeyF3"), 4));
	cmbFKey.addItem(new cpr.controls.Item(languageMap.get("Str_FKeyF4"), 5));
	
	//functype == 1 : 근태
	cmbFKey.addItem(new cpr.controls.Item(languageMap.get("Str_FKeyAttend"), 11));
	cmbFKey.addItem(new cpr.controls.Item(languageMap.get("Str_FKeyLeave"), 12));
	cmbFKey.addItem(new cpr.controls.Item(languageMap.get("Str_FKeyAccess"), 13));
	cmbFKey.addItem(new cpr.controls.Item(languageMap.get("Str_FKeyOut"), 14));
	cmbFKey.addItem(new cpr.controls.Item(languageMap.get("Str_FKeyIn"), 15));
	
	//functype == 2 : 식수
	cmbFKey.addItem(new cpr.controls.Item(languageMap.get("Str_FKeyMenu1"), 21));
	cmbFKey.addItem(new cpr.controls.Item(languageMap.get("Str_FKeyMenu2"), 22));
	cmbFKey.addItem(new cpr.controls.Item(languageMap.get("Str_FKeyMenu5"), 23));
	cmbFKey.addItem(new cpr.controls.Item(languageMap.get("Str_FKeyMenu3"), 24));
	cmbFKey.addItem(new cpr.controls.Item(languageMap.get("Str_FKeyMenu4"), 25));
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

function sendListRequest() {
	var smsSetData = app.lookup("smsSetData");
	var smsGetAuthLogList = app.lookup("sms_getAuthLogList");
	var dtStart = smsSetData.getValue("startTime");
	var dtEnd = smsSetData.getValue("endTime");
	
	var cmbCategory = smsSetData.getValue("searchCategory");
	var edtKeyword = smsSetData.getValue("searchKeyword");
	
	var authResult = smsSetData.getValue("authResult");
	
	smsGetAuthLogList.setParameters("startTime", dtStart + " 00:00:00");
	smsGetAuthLogList.setParameters("endTime", dtEnd + " 23:59:59");
	smsGetAuthLogList.setParameters("offset", offset);
	smsGetAuthLogList.setParameters("limit", pageRowCount);
	smsGetAuthLogList.setParameters("groupID", smsSetData.getValue("groupID"));
	smsGetAuthLogList.setParameters("searchCategory", cmbCategory);
	smsGetAuthLogList.setParameters("searchKeyword", edtKeyword);
	
	smsGetAuthLogList.setParameters("authResult", authResult);
	
	
	if (edtKeyword == null || edtKeyword.length <= 0) {
		smsGetAuthLogList.setParameters("searchCategory", "");
		smsGetAuthLogList.setParameters("searchKeyword", "");
	}
	var dsAuthLogList = app.lookup("AuthLogList");
	dsAuthLogList.clear();
	
	comLib.updateLoadMask(offset+"/"+totalLog);
	smsGetAuthLogList.send();
}
// 인증로그 리스트 가져오기 완료
function onSms_getAuthLogListSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		var dsAuthLogListAll = app.lookup("AuthLogListAll");
		var dsAuthLogList = app.lookup("AuthLogList");	
		dsAuthLogList.copyToDataSet(dsAuthLogListAll);
		var recvCount = dsAuthLogListAll.getRowCount();
		if( recvCount < totalCount ){
			offset = recvCount;			
			sendListRequest();
		}else {
			comLib.hideLoadMask();
			var max = pageRowCount;
			if( dsAuthLogListAll.getRowCount()<pageRowCount){
				max = dsAuthLogListAll.getRowCount()
			}
			var printData = dsAuthLogListAll.getRowDataRanged(0, max-1);
			dsAuthLogList.clear();
			dsAuthLogList.build(printData);	
			app.lookup("RPALR_grdAuthLog").redraw();
	
			console.log(recvCount,printData);
		}
		//setTimeout(function(){pdfSave();}, 100);
	} else {
		comLib.hideLoadMask();
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_AuthLog";
		if (errStr.length > 0) {
			errMsg = dataManager.getString(errStr);
		} else {
			errMsg = dataManager.getString(errMsg);
		}
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
	}
	
	
	app.lookup("RPALR_grdAuthLog").redraw();
	app.lookup("RPPDF_grpMain").redraw();
}
// 인증로그 리스트 가져오기 타임아웃
function onSms_getAuthLogListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}
// 인증로그 리스트 가져오기 에러
function onSms_getAuthLogListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function updateSignColumnVisible( isVisible ){
	for( var i = 0; i < 8; i++ ){
		app.lookup("RPPDF_udcSignColumn"+(i+1)).setVisible(isVisible); 
	}
}
	
function validateSignColumn(){
	var printSetting = app.lookup("PrintSetting");
	
	var signedColumnValue = null;
	var udcSignColumn = null;
	for( var i = 0; i < 8; i++ ){
		signedColumnValue = printSetting.getValue("SignedColumn"+(i+1));
		udcSignColumn = app.lookup("RPPDF_udcSignColumn"+(i+1)); 
		
		if( signedColumnValue != ""){
			if(signedColumnValue == " "){
				udcSignColumn.setSignSetting("");
			}else{
				udcSignColumn.setSignSetting(signedColumnValue);
			}
			udcSignColumn.setVisible(true); 
		}else{
			udcSignColumn.setVisible(false);
		}
	}				
}
// 레포트 설정 클릭
function onRPALR_btnSettingClick(/* cpr.events.CMouseEvent */ e){
	
	var smsSetData = app.lookup("smsSetData");
		
	var cmbCategory = smsSetData.getValue("searchCategory");
	var edtKeyword = smsSetData.getValue("searchKeyword");	
		
	var appld = "app/main/integratedReporting/signedSetting/documentSetting" + "?" + RPALR_version;
	app.getRootAppInstance().openDialog(appld, 
		{width : 700, height : 370, color : "#ffffff"}, function(dialog){
		dialog.ready(function(dialogApp){	
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
			
			dialog.headerTitle = "PDF " + languageMap.get("Str_setting");
			dialog.modal = false;
		});
	}).then(function(returnValue){
		if(returnValue) {
			var printSetting = app.lookup("PrintSetting");
			returnValue.copyToDataMap(printSetting);
					
			var opbTitle = app.lookup("RPALR_ipbTitle")
			opbTitle.value = printSetting.getValue("title");
			opbTitle.style.css({
				"font-size" : printSetting.getValue("fontsize") + 'pt',
				"font-weight" : printSetting.getValue("fontweight"),
			});
					
			var signedColumnFlag = printSetting.getValue("signedColumnFlag");
			if(0 == signedColumnFlag){ // 비활성화
				updateSignColumnVisible(false);
			}else{			
				validateSignColumn();
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
		
		var grdAuthLog = app.lookup("RPALR_grdAuthLog");
		grdAuthLog.getParent().updateConstraint(grdAuthLog,{"top": 200+"px"});
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
	var RPALR_grdAuthLog = app.lookup("RPALR_grdAuthLog");		
	setReportView(false);
	
	var calcWidth = 0;	// 현재까지 더해진 컬럼 width
	var lastColum = 0;  // 마지막에  보여질 유효한 컬럼 인덱스 , 이 인덱스 이후에는 화면에 보이지 않게 할것이다
	var lastColumWidth = 0;  // 마지막에 조절될 컬럼 인덱스 
	var columWidths = RPALR_grdAuthLog.getColumnWidths();    // 컬럼 인덱스 width 배열
	var totalWidth = RPALR_grdAuthLog.getActualRect().width; // 실제 화면에 보여지고 있는 grid 컨트롤 width
	
	for (var i = 0; i < columWidths.length; i++) {
		if(false == RPALR_grdAuthLog.header.getColumn(i).visible) // 보이지 않는 컬럼은 제외한다
			continue;

		var strPxl = columWidths[i];
		var strPxl2 = strPxl.replace("px", ""); // 문자열에서 px 를 빼고 int 형으로 변환한다
		var intPxl = 0;
		intPxl = parseInt(strPxl2);
		calcWidth += intPxl;
		
		if (calcWidth > totalWidth) { // 현재까지 더해진 길이가 전체크기를 넘어 섰다면...
			lastColum = i - 1; // 현재 인덱스 이전것을 사용한다 
			
			var needWidth = intPxl - (calcWidth - totalWidth);			
			strPxl = columWidths[lastColum];
			strPxl2 = strPxl.replace("px", ""); // 문자열에서 px 를 빼고 int 형으로 변환한다
			intPxl = 0;
			intPxl = parseInt(strPxl2);			
			
			lastColumWidth = intPxl + needWidth;
			break;
		} else if (calcWidth == totalWidth) {			
			lastColum = i;
			lastColumWidth = intPxl;			
			break;
		} else {
			//console.log("calcWidth < totalWidth");
		}
	}
		
	var layout = RPALR_grdAuthLog.getColumnLayout();	
	layout['columnLayout'][lastColum]['width'] = lastColumWidth;
	RPALR_grdAuthLog.setColumnLayout(layout);

	setTimeout(function(){pdfSave();}, 1000);
}

var RPALR_pdfDoc;
var RPALR_pagePrintCount = 80;
var RPALR_firstPageMargin= 6; // 첫번째 페이지는 결재란 공간을 감안해야 한다.
var RPALR_pageIndex = 0;
var totalPage;
var RPALR_maxPDFPage = 100;


function pdfSave() {
	
	RPALR_pageIndex++;
	var newPage = RPALR_pageIndex % RPALR_maxPDFPage;
	console.log("pdfSave() : current page",RPALR_pageIndex,totalPage,RPALR_pageIndex % 100,newPage);
	       
	if( RPALR_pageIndex != 1){
		if( newPage == 1 || RPALR_pageIndex > totalPage ){
			printFinished();		
			if (RPALR_pageIndex >= totalPage){
				RPALR_pageIndex =0;
				setReportView(true);
				
				var dsAuthLogList = app.lookup("AuthLogList");
				var dsAuthLogListAll = app.lookup("AuthLogListAll");
				dsAuthLogList.clear();
				dsAuthLogListAll.copyToDataSet(dsAuthLogList);
				dsAuthLogList.commit();	
				
				var RPALR_grdAuthLog = app.lookup("RPALR_grdAuthLog");
				RPALR_grdAuthLog.hScroll = "auto";
		
				return;
			}
			//return;
		}
	}
	
	        	
	var dsAuthLogList = app.lookup("AuthLogList");
	var dsAuthLogListAll = app.lookup("AuthLogListAll");
	
	if(newPage == 1 || RPALR_pageIndex == 1){
		//RPALR_pdfDoc = new jsPDF('p', 'mm');
		RPALR_pdfDoc = new jsPDF('p', 'pt','a4',true);
			
		totalLog = dsAuthLogListAll.getRowCount();
		if( totalLog == 0 ){
			return;
		}
		totalPage = Math.ceil( (totalLog-RPALR_firstPageMargin) / RPALR_pagePrintCount );		
		
		console.log("------------------------new page : totalPage",totalPage,totalLog,RPALR_pagePrintCount,RPALR_firstPageMargin,totalLog/(RPALR_pagePrintCount+RPALR_firstPageMargin));
		var strMessge = "PDF File Create ... ["+ RPALR_pageIndex + "/" + totalPage+"]";
		document.title = strMessge;			
	}else{
		console.log("add page");
		RPALR_pdfDoc.addPage();
		var strMessge = "PDF File Create ... ["+ RPALR_pageIndex + "/" + totalPage+"]";
		document.title = strMessge;
	}
	
	var startIndex = (RPALR_pageIndex-1)*RPALR_pagePrintCount;
	var endIndex = RPALR_pageIndex*RPALR_pagePrintCount-1;
	
	if( endIndex > totalLog){
		endIndex = dsAuthLogListAll.getRowCount()-1;
	}else{
		if(RPALR_pageIndex == 1 ){ // 페이지 row수보다 로그가 많은 경우, 첫번째 페이지면 결재란 공간만큼 빼고 표시
			//endIndex -= RPALR_firstPageMargin;
		}
	}
	if(RPALR_pageIndex != 1 ){
		startIndex -= RPALR_firstPageMargin;		
	} 
	if(RPALR_pageIndex != totalPage){
		endIndex -= RPALR_firstPageMargin;
	}
		
	var printData = dsAuthLogListAll.getRowDataRanged(startIndex, endIndex);
	dsAuthLogList.clear();
	dsAuthLogList.build(printData);	
	app.lookup("RPALR_grdAuthLog").redraw();
	console.log(startIndex,endIndex,dsAuthLogList.getRowCount());	
	setTimeout(function(){printPage();}, 10);	
		
}


function printPage(){	
	
	
	html2canvas(document.body, {		
		onrendered: function (canvas) {	    
			console.log("page "+RPALR_pageIndex)	
			console.log("count "+ app.lookup("AuthLogList").getRowCount());
			
			var imgData = canvas.toDataURL('image/jpeg');	    	
	    	var imgWidth = 210; // 이미지 가로 길이(mm) A4 기준
		    var pageHeight = imgWidth * 1.414;  // 출력 페이지 세로 길이 계산 A4 기준
		    var imgHeight = canvas.height * imgWidth / canvas.width;
		    var heightLeft = imgHeight;
		    		    
		    var position = 0;		    
			//RPALR_pdfDoc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
			RPALR_pdfDoc.addImage(imgData, 'JPEG', 0, 20, 600, 800,undefined,'FAST');
	       	        
	        //RPALR_pageIndex++;
	        if(RPALR_pageIndex == 1 ){
	        	//app.lookup("RPPDF_grpMain").getLayout().removeRows([0]);
				//app.lookup("RPPDF_grpMain").getLayout().removeRows([0]);
				app.lookup("RPPDF_grpMain").getLayout().setRowVisible(0, false);
				app.lookup("RPPDF_grpMain").getLayout().setRowVisible(1, false);
				app.lookup("RPPDF_grpMain").getLayout().setRows(["0px", "0px", "1fr" ]);
				var grdAuthLog = app.lookup("RPALR_grdAuthLog");
				grdAuthLog.getParent().updateConstraint(grdAuthLog,{"top": 60+"px"});
						
			}
			setTimeout(function(){pdfSave();}, 10);		        	        
			
		}
	});
			
}	

function printFinished(){
	console.log("save pdf",RPALR_pageIndex,totalPage);
	
	var strMessge = "PDF File Create ... ["+ RPALR_pageIndex + "/" + totalPage+"]";
	document.title = strMessge;
	var pageNum = Math.floor(RPALR_pageIndex/RPALR_maxPDFPage);
	console.log(RPALR_pageIndex,RPALR_maxPDFPage,pageNum);
	if(RPALR_pageIndex%RPALR_maxPDFPage!=1){
		pageNum+=1;
	}
	var fileName = "authlog_"+ pageNum+".pdf";
	
	RPALR_pdfDoc.save(fileName);
		
	if( RPALR_pageIndex >= totalPage){
		/*
		RPALR_pageIndex =0;
		setReportView(true);
		
		var dsAuthLogList = app.lookup("AuthLogList");
		var dsAuthLogListAll = app.lookup("AuthLogListAll");
		dsAuthLogList.clear();
		dsAuthLogListAll.copyToDataSet(dsAuthLogList);
		dsAuthLogList.commit();	
		
		var RPALR_grdAuthLog = app.lookup("RPALR_grdAuthLog");
		RPALR_grdAuthLog.hScroll = "auto";
		* */
	} else {
		//setTimeout(function(){pdfSave();}, 10);
	}
}

// 언어 리스트 가져오기 완료
function onSms_getLangListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
}

// 언어 리스트 가져오기 성공
function onSms_getLangListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){		
	languageMap.clear();
	
	var dsLangList = app.lookup("LangList");
	for(var i=0; i < dsLangList.getRowCount(); i++){	
		var row = dsLangList.getRow(i);
		languageMap.set(row.getValue("Key"),row.getValue("Value"));
	}
		
	initComboAuthType();
	initComboAuthResult();
	initComboFuncType();
	
	var IndexKey = 0;
	var TerminalID = 1;
	var UserID = 2;
	var GroupCode = 3;
	var UserName = 4;
	var EventTime = 5;
	var SeverRecordTime = 6;
	var AuthType = 7;
	var AuthResult = 8;
	var Func = 9;
	var FuncType = 10;
	var Card = 11;
	var UserType = 12;
	var IsPicture = 13;
	var Property = 14;
	var GroupName = 15;
	var PositionName = 16;
	var UniqueID = 17;
	var TerminalName = 18;
		
	app.lookup("RPALR_grdAuthLog").header.getColumn(TerminalID).text = languageMap.get("Str_TerminalID");
	app.lookup("RPALR_grdAuthLog").header.getColumn(UserID).text = languageMap.get("Str_UserID");
	app.lookup("RPALR_grdAuthLog").header.getColumn(GroupCode).text = languageMap.get("Str_GroupCode");
	app.lookup("RPALR_grdAuthLog").header.getColumn(UserName).text = languageMap.get("Str_UserName");
	app.lookup("RPALR_grdAuthLog").header.getColumn(EventTime).text = languageMap.get("Str_EventTime");
	app.lookup("RPALR_grdAuthLog").header.getColumn(SeverRecordTime).text = languageMap.get("Str_ServerRecordTime");
	app.lookup("RPALR_grdAuthLog").header.getColumn(AuthType).text = languageMap.get("Str_AuthType");
	app.lookup("RPALR_grdAuthLog").header.getColumn(AuthResult).text = languageMap.get("Str_AuthResult");
	app.lookup("RPALR_grdAuthLog").header.getColumn(Func).text = languageMap.get("Str_Func");
	app.lookup("RPALR_grdAuthLog").header.getColumn(FuncType).text = languageMap.get("Str_FuncType");
	app.lookup("RPALR_grdAuthLog").header.getColumn(Card).text = languageMap.get("Str_CardNum");
	app.lookup("RPALR_grdAuthLog").header.getColumn(UserType).text = languageMap.get("Str_UserType");
	app.lookup("RPALR_grdAuthLog").header.getColumn(IsPicture).text = languageMap.get("Str_IsPicture");
	app.lookup("RPALR_grdAuthLog").header.getColumn(Property).text = languageMap.get("Str_Property");
	var oemVersion = RPALR_version.slice(-2);
//	if (oemVersion == OEM_BEST_ALLIANCE){
//		app.lookup("RPALR_grdAuthLog").header.getColumn(PositionName).text = "Title";
//	} else {
	app.lookup("RPALR_grdAuthLog").header.getColumn(PositionName).text = languageMap.get("Str_PositionName");
//	}
	app.lookup("RPALR_grdAuthLog").header.getColumn(UniqueID).text = languageMap.get("Str_UniqueID");
	app.lookup("RPALR_grdAuthLog").header.getColumn(TerminalName).text = languageMap.get("Str_TerminalName");	
	
	comLib.showLoadMask("pro",dataManager.getString("Str_Load"),"",totalLog/pageRowCount);
	sendListRequest();
}
