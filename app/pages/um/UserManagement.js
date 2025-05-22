/************************************************
 * UserManagement.js
 * Created at 2018. 10. 29. 오후 5:49:46.
 *
 * @author osm8667
 ************************************************/
var common;
var gridUtil = createGridUtil(app);
var dataManager = cpr.core.Module.require("lib/DataManager");
var usint_version;
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	common = createComUtil(app);
	var tree = app.lookup("tre1");
	tree.visible = false;
	common.send("userserv");
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
	var oList = app.lookup("userlist");
	
	var oInput = app.lookup("searchBox");
	var oCombo = app.lookup("cmb1");
	var text = oInput.value;
	var grd = app.lookup("grd1");
	var tot = app.lookup("opt_tot");
	var data = [];	
	
	if(text){
		if(oCombo.value==0){
			var buildData = oList.findAllRow("name *='"+ text +"'");
			for(var i=0; i<buildData.length; i++){
				data.push(buildData[i].getRowData());//필터링한 데이터를 json형식으로 받아옵니다.
			}
			oList.build(data, false);//받아온 데이터를 기존 데이터는 삭제한 후 빌드합니다.
		}
	}
	console.log("text::: "+ text);	
	if(grd.getDataRowCount()){
		grd.clearFilter();
		
	}	
	
	tot.value = oList.getRowCount();
	console.log("tot::::::::::::    "+tot.value)
//	oList.copyToDataSet(app.lookup("userlist1"));
//	oList.copyToDataSet(app.lookup("userlist2"));
	//ui단 페이징
	var total = oList.getRowCount();
	
	

	console.log("grd.getDataRowCount():::: "+grd.getDataRowCount())

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
 * 사용자 정의 컨트롤에서 search 이벤트 발생 시 호출.
 */
function onSearch_type1Search(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.search_type1
	 */
	var search_type1 = e.control;
	var text = search_type1.getText(); //udc에서 exports한 검색 텍스트를 받아옵니다.
	
	if(text == null) {
	} else if(text == '') {
		common.send("userserv");
	}else {
		onIssueSearch();
	}
}

/*
 * "검색" 서브미션 부 분리
 */
function onIssueSearch (){
	console.log("onIssueSearch::::::::: ")
	var param = app.lookup("dm_SearchParam");
	var oCombo = app.lookup("cmb1");
	var oInput = app.lookup("searchBox").value;
	
	param.setValue("clssCd", oCombo.value);
	param.setValue("keyword", oInput.value);
	
	common.send("userserv");
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
 * "삭제" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var grd1 = app.lookup("grd1"); 
	console.log("select::: "+grd1.getSelectedRowIndex())
	if(grd1.getSelectedRowIndex() == -1) {
		dialogAlert(app, "알림", "삭제할 내용을 선택해주세요.");		
	} else {
		dialogConfirm(app.getRootAppInstance(), "", "삭제 하시겠습니까?", function(/*cpr.controls.Dialog*/dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue) {
					console.log("yes::::::: ");
					
					var rowIndex = grd1.getSelectedRowIndices();
					grd1.deleteRow(rowIndex);		
				} else {
				}
			});
		});			
	}
}


/*
 * "추가" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
}


/*
 * 그리드에서 dblclick 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 더블 클릭할 때 발생하는 이벤트.
 */
function onGrd1Dblclick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var grd1 = e.control;
	var selectedRow = grd1.getSelectedRow();
	var appld = "app/pages/um/UserInfor" + "?" + usint_version;
	app.openDialog(appld, {width : 800, height : 550}, function(dialog){
		dialog.initValue = selectedRow.getRowData();
	}).then(function(returnValue){
		;
	});
}
