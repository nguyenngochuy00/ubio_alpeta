/************************************************
 * Paging.js
 * Created at 2018. 10. 15. 오전 10:40:20.
 *
 * @author osm86
 ************************************************/

var gridUtil = createGridUtil(app);

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var tree = app.lookup("tre1");
	tree.visible = false;
	var getUserlist = app.lookup("userserv");
	getUserlist.send();
}


/*
 * 사용자 정의 컨트롤에서 search 이벤트 발생 시 호출.
 */
function onSearchform1Search(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.searchform1
	 */
	var searchform1 = e.control;
	var text = searchform1.getText();//udc에서 exports한 검색 텍스트를 받아옵니다.
	//TO DO...
	app.lookup("getList").send();
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onGetListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var getList = e.control;
	gridUtil.setPagingInfo("resPage", "pageIndexer");
	
//	var pagingDataMap = app.lookup(pagingSettingDataMapId);
// 	var pageIndexer = app.lookup(pageIndexerId);
// 	// set data
// 	pageIndexer.module.setPaging(pagingDataMap.getValue("totCnt"), 
// 	pagingDataMap.getValue("pageSize"), pagingDataMap.getValue("rowSize"), 
// 	pagingDataMap.getValue("pageIdx"));
}


/*
 * 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
 */
function onPageIndexerPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.pageindex
	 */
	var pageIndexer = e.control;
	// 변경된 페이지 인덱스를 DataMap에 반영.
	var resPage = app.lookup("resPage");
	resPage.setValue("pageIdx", e.newSelection);
	// 화면 조회
	doSearch();
}


/*
 * 사용자 정의 컨트롤에서 before-pagechange 이벤트 발생 시 호출.
 */
function onPageIndexerBeforePagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.pageindex
	 */
	var pageIndexer = e.control;
	
}

function doSearch() {
	// validation 검색 조건 입력 검증.
//	var isValid = comUtil.validate("grp_search_cond");
//	if (isValid == false) {
//		return;
//	}

	// 조회 Submission send
	var getlist = app.lookup("getList");
	getlist.send();
}


/*
 * 탭 폴더에서 tabheader-click 이벤트 발생 시 호출.
 * 탭 아이템의 헤더 영역을 클릭하였을 때 발생하는 이벤트 입니다.
 */
function onTabFolderTabheaderClick(/* cpr.events.CItemEvent */ e){
	/** 
	 * @type cpr.controls.TabFolder
	 */
	var tabFolder = e.control;
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onUserservSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var userserv = e.control;
	var userlist = app.lookup("userlist");
	
	var tot = app.lookup("opt_tot");
	tot.value = userlist.getRowCount();
	
	userlist.copyToDataSet(app.lookup("userlist1"));
	userlist.copyToDataSet(app.lookup("userlist2"));
	//ui단 페이징
	var total = userlist.getRowCount();
	var grd = app.lookup("grd1");
	grd.filter("id<11");
	var pgidx = app.lookup("pgidx");
	pgidx.totalRowCount = total;
	//사이드 트리 생성
	var tree = app.lookup("tre1");
	tree.redraw();
	tree.visible = true;
	
}


/*
 * 트리에서 selection-change 이벤트 발생 시 호출.
 * 선택된 Item 값이 저장된 후에 발생하는 이벤트.
 */
function onTre1SelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Tree
	 */
	var tre1 = e.control;
	var id = e.newSelection[0].value;
	var grd = app.lookup("grd1");
	if(id!=0&&id!=1){
		grd.filter("uid=='"+id+"'");
		grd.redraw();
	}
}


/*
 * 트리에서 item-click 이벤트 발생 시 호출.
 * 아이템 클릭시 발생하는 이벤트.
 */
function onTre1ItemClick(/* cpr.events.CItemEvent */ e){
	/** 
	 * @type cpr.controls.Tree
	 */
	var tre1 = e.control;
}


/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onPgidxSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var pgidx = e.control;
	var pageidx = pgidx.currentPageIndex;
	//ui단 페이징
	var start = (pageidx-1)*10;
	var end = pageidx*10;
	var grd = app.lookup("grd1");
	grd.clearFilter();
	grd.filter(start+"<id && id<="+end);
	grd.redraw();
}
