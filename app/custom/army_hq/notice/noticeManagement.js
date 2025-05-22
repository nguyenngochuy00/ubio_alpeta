/************************************************
 * noticeManagement.js
 * Created at 2021. 2. 26. 오후 5:35:23.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var SNNLP_pageRowCount = 50;

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var pageIndexer = app.lookup("SNNLP_piNoticeList");	
	pageIndexer.pageRowCount = SNNLP_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndexer.viewPageCount = 10;// 보여지는 페이지 수(하단 부 인덱스 수)
	app.lookup("SNNLP_cmbSearch").selectItem(0);
	
	sendNoticeListReq();
}

function onSubmitError( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

function onSNNLP_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	sendNoticeListReq();
}

//function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e){
//	if(e.keyCode == 13) {
//		sendNoticeListReq();		
//	}
//}

// 검색어 2글자 이상 팝업 제대로 보이도록 keydown을 keyup으로 변경 - pse
function onSNNLP_ipbSearchContentKeyup(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		sendNoticeListReq();		
	}
}

function onSNNLP_piNoticeListClick(/* cpr.events.CMouseEvent */ e){
	sendNoticeListReq();
}

function sendNoticeListReq() {
	
	var sms_getSystemNoticeList = app.lookup("sms_getSystemNoticeList");
	
	// 검색 관련 파라미터값 초기화 필요 (안하면 이전 검색 조건 파라미터값이 남아 제대로 검색 안됨) - pse
	sms_getSystemNoticeList.removeParameters("register");
	sms_getSystemNoticeList.removeParameters("title");
	
	var category = app.lookup("SNNLP_cmbSearch").value;
	var content = app.lookup("SNNLP_ipbSearchContent").value;
	if( category == 1){
		if( content == undefined || content.length < 2){
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "검색어는 2자 이상 입력해야 합니다.");
			return;
		}
		sms_getSystemNoticeList.setParameters("register", content);
	} else if( category == 2){
		if( content == undefined || content.length < 2){
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "검색어는 2자 이상 입력해야 합니다.");
			return;
		}
		sms_getSystemNoticeList.setParameters("title", content);
	}
	
	app.lookup("SystemNoticeList").clear();
	
	var pageIndexer = app.lookup("SNNLP_piNoticeList");
	var curIndex = pageIndexer.currentPageIndex;
	var offset = (curIndex - 1) * SNNLP_pageRowCount;
	
	sms_getSystemNoticeList.setParameters("limit", SNNLP_pageRowCount);
	sms_getSystemNoticeList.setParameters("offset", offset);	
	
	sms_getSystemNoticeList.send();
}

function validateDate( value ){
	if (value==undefined||value == "0001-01-01T00:00:00Z"){return "";}
	if (value.substring(0, 10)=="0001-01-01"){return;}
	return value.substring(0, 10) +" " + value.substring(11, 19);	
}

function onSms_getSystemNoticeListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {	
		var systemNoticeList = app.lookup("SystemNoticeList");
		var count = systemNoticeList.getRowCount();
		for(var i=0; i<count; i++){
			var systemNotice = systemNoticeList.getRow(i);
			systemNotice.setValue("RegistAt", validateDate(systemNotice.getValue("RegistAt")));
		}
		systemNoticeList.commit();	
		
		var pageIndexer = app.lookup("SNNLP_piNoticeList");
		var total = app.lookup("Total").getValue("Count");
		pageIndexer.totalRowCount = total;
		console.log(systemNoticeList.getRowDataRanged());
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 공지사항 리스트 더블클릭
function onSNNLP_grdNoticeListRowDblclick(/* cpr.events.CGridMouseEvent */ e){
	/** @type cpr.controls.Grid	 */
	var grdNoticeList = e.control;	
	var idx = grdNoticeList.getSelectedRowIndex();	
	var noticeInfo = grdNoticeList.getRow(idx);
	var noticeIdx = noticeInfo.getValue("NoticeIndex");
	app.getHostAppInstance().callAppMethod("changeMenu","60502",{"Idx":noticeIdx});	
}

// "신규" 버튼(SNNLP_btnRegist)에서 click 이벤트 발생 시 호출.
function onSNNLP_btnRegistClick(/* cpr.events.CMouseEvent */ e){
	app.getHostAppInstance().callAppMethod("changeMenu","60501");
}
