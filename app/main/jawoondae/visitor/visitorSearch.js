/************************************************
 * visitorSearch.js
 * Created at 2020. 2. 26. 오후 3:17:07.
 *
 * @author joymrk
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var JWDVS_pageRowCount = 50;

function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("visitorListPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}

function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("visitorListPageIndexer");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = JWDVS_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	
	var positionList = dataManager.getPositionList();
	var cmbPosition = app.lookup("JWDVS_cmbPosition");	
		cmbPosition.setItemSet(positionList, {
			label: "Name",
			value: "PositionID",
	});	
	setPageIndexer(0,1,JWDVS_pageRowCount, 10); // 페이지 초기화
	app.lookup("JWDVS_grdVisitorInfo").header.getColumn(0).style.css("visibility", "hidden");//상단 전체체크/해제 버튼 숨김
	app.lookup("JWDVS_cmbCategory").value = "name";
}

function onJWDVS_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	//pageIndex 초기 화
	var pageIndex = app.lookup("visitorListPageIndexer");	
	pageIndex.currentPageIndex = 1;
	sendGetVisitorInfoList();
}
function sendGetVisitorInfoList(){
	app.lookup("dsVisitorRegistInfo").clear();
	
	comLib.showLoadMask("","방문자 신청 정보 리스트","",0);
	var curPageIndex = app.lookup("visitorListPageIndexer").currentPageIndex; 
	var offset = (curPageIndex - 1) * JWDVS_pageRowCount;
	var smsgetVisitorInfoList = app.lookup("sms_getVisitorInfoList");
	
	var category = app.lookup("JWDVS_cmbCategory").value;
	var keyword = app.lookup("JWDVS_ipbKeyword").value;
	
	smsgetVisitorInfoList.setParameters("searchCategory", category);
	smsgetVisitorInfoList.setParameters("searchKeyword", keyword);
	if (keyword == null || keyword.length == 0) {
		smsgetVisitorInfoList.setParameters("searchCategory", "");
	}
	smsgetVisitorInfoList.setParameters("offset", offset);
	smsgetVisitorInfoList.setParameters("limit", JWDVS_pageRowCount);
	smsgetVisitorInfoList.send();
	
}

function onSms_getVisitorInfoListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		var totalCount = app.lookup("Total").getValue("Count");
			app.lookup("JWDVS_opbTotal").value = totalCount;
		var viewPageCount = totalCount / JWDVS_pageRowCount + (totalCount % JWDVS_pageRowCount > 0);
		if (viewPageCount > 10) {
			viewPageCount = 10;
		}
	//	console.log(app.lookup("dsVisitorRegistInfo").getRowDataRanged());
			
		if (viewPageCount > 10) {
			viewPageCount = 10;
		}
		selectPaging(totalCount, viewPageCount);
	} else {
		//dialogAlert(app, "Waning", dataManager.getString("Str_VisitorManagement")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlert(app, "Waning", "방문신청서 등록 정보 가져오기 실패");
	}
	app.lookup("JWDVS_grdVisitorInfo").redraw();
}

function onSms_getVisitorInfoListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getVisitorInfoListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onJWDVS_grdVisitorInfoCellClick(/* cpr.events.CGridEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var jWDVS_grdVisitorInfo = e.control;
	if (e.cellIndex == 0) {
		jWDVS_grdVisitorInfo.clearAllCheck();
		jWDVS_grdVisitorInfo.setCheckRowIndex(e.rowIndex, true);
	}
}

function onJWDVS_btnSelectedClick(/* cpr.events.CMouseEvent */ e){
	var dsVisitorRegistInfo = app.lookup("dsVisitorRegistInfo");
	var grdVisitorList= app.lookup("JWDVS_grdVisitorInfo");
	var chkIndices = grdVisitorList.getCheckRowIndices();
	var count = chkIndices.length;
	if (count == 0) {
		dialogAlert(app, "Waning", "체크된 방문신청자가 없습니다.");
	}
	
	if ( confirm("선택된 방문신청자 정보를 가져오시겠습니까?") == false ) {
		return;
	}
	var visitorInfo = dsVisitorRegistInfo.getRow(chkIndices[0]);
	
	app.close(visitorInfo);
}
	
function onVisitorListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var visitorListPageIndexer = e.control;
		sendGetVisitorInfoList();
}
