/************************************************
 * UserManagement.js
 * Created at 2018. 10. 29. 오후 5:49:46.
 *
 * @author osm8667
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
function onSearch_type1Search(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.search_type1
	 */
	var search_type1 = e.control;
	var text = search_type1.getText(); //udc에서 exports한 검색 텍스트를 받아옵니다.
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
}

function doSearch() {
	// 조회 Submission send
	var getlist = app.lookup("getList");
	getlist.send();
}


/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var pageIndexer = e.control;
	var pageidx = pageIndexer.currentPageIndex;
	//ui단 페이징
	var start = (pageidx-1)*10;
	var end = pageidx*10;
	var grd = app.lookup("grd1");
	grd.clearFilter();
	grd.filter(start+"<id && id<="+end);
	grd.redraw();
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
 * MDI 폴더에서 tabheader-click 이벤트 발생 시 호출.
 * 탭 아이템의 헤더 영역을 클릭하였을 때 발생하는 이벤트 입니다.
 */
function onMdi1TabheaderClick(/* cpr.events.CItemEvent */ e){
	/** 
	 * @type cpr.controls.MDIFolder
	 */
	var mdi1 = e.control;
	
}
