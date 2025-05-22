/************************************************
 * help_dialog.js
 * Created at 2019. 1. 28. 오후 2:18:32.
 *
 * @author gyjeon
 ************************************************/
var HLMAN_menu_id;
var menulist , page_info;
var dataManager = cpr.core.Module.require("lib/DataManager");

function onBodyLoad(/* cpr.events.CEvent */ e){
	var html = app.lookup("HLMAN_obHelpPage");
	html.style.css("max-height", "99%");

	dataManager = getDataManager(); // treeType menuAll Data Get
	var deleteItemMenuIDArr = dataManager.getDeleteItemMenuID();
	var getMenuList = dataManager.getMenuList();
	var dsMenuAllList = app.lookup("dsMenuList");
	getMenuList.copyToDataSet(dsMenuAllList);
	dsMenuAllList.commit();
	// <-----------------------------------------------------------
	var initValue = app.getHostProperty("initValue");
	HLMAN_menu_id  = initValue["MenuID"];
	

	var tree = app.lookup("HLMAN_treeAllmenu");
	var target = HLMAN_menu_id;
	
	var treeItem = tree.getItemByValue(target);
	if (treeItem) {
		var treeParent = tree.getItemByValue(target).parentValue;
		tree.expandItem(tree.getItemByValue(treeParent));
		tree.selectItemByValue(target);
	}
	
	
	for (var i =0 ; i < deleteItemMenuIDArr.length; i++ ) {
		tree.deleteItemByValue(deleteItemMenuIDArr[i]);
	}
	/*
	tree.deleteItemByValue(83886087);
	tree.deleteItemByValue(452984834);
	tree.deleteItemByValue(436207617);
	tree.deleteItemByValue(436207616);
	*/
	
	tree.deleteItemByValue(117440521);
	
	app.lookup("HLMAN_grp").redraw();
	
	if(dataManager.getOemVersion() == OEM_GS_BASIC){
		app.lookup("getHelpPage").action = "data/main/pageinfoLang_gs.json";
		app.lookup("getHelpPage").send();
	} else {
		app.lookup("getHelpPage").send();		
	}
	
}

/*
 * 사용자 정의 컨트롤에서 search 이벤트 발생 시 호출.
 */
function onSearchform1Search(/* cpr.events.CUIEvent */ e){

	var searchform1 = e.control;
	var dsMenuList = app.lookup("dsMenuList");
	var target = dsMenuList.findFirstRow("Name=='" + searchform1.val + "'").getValue("MenuID");

	var tree = app.lookup("HLMAN_treeAllmenu");
	var treeItem = tree.getItemByValue(target);

	if (treeItem) {
		var treeParent = tree.getItemByValue(target).parentValue;
		if (treeParent == 0){	// 부모의 id값이 0으로 넘어올 경우 해당 Menu의 Id를 설정
			treeParent = tree.getItemByValue(target).value;
		}

		tree.collapseAllItems();
		tree.expandItem(tree.getItemByValue(treeParent));
		tree.selectItemByValue(target);

		var objHelpPage = app.lookup("HLMAN_obHelpPage");

		objHelpPage.data = page_info.findFirstRow("menu_id=='" + target + "'").getValue("src");

	}
}

// Help page 로딩 완료
function onGetHelpPageSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var page_info = app.lookup("pageInfoLang");

	var objHelpPage = app.lookup("HLMAN_obHelpPage");
	if (HLMAN_menu_id != null) {
		var locale = dataManager.getLocale();
		//console.log(locale);
		if (locale == 'ko' || locale == 'ja') {
			var helpPage = page_info.findFirstRow("menu_id=='" + HLMAN_menu_id + "'");
			
			var pageSrc = helpPage.getValue("src")+"_"+locale+".htm";
			objHelpPage.data = pageSrc;			
		} else {
			locale = 'en'
			var helpPage = page_info.findFirstRow("menu_id=='" + HLMAN_menu_id + "'");
			var pageSrc = helpPage.getValue("src")+"_"+locale+".htm";
			objHelpPage.data = pageSrc;
		}
	}
}

// Help page 로딩 실패
function onGetHelpPageSubmitError(/* cpr.events.CSubmissionEvent */ e){
	dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorHelpPageLoadingFail"));
}

// Help page 로딩 타임아웃
function onGetHelpPageSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorHelpPageLoadingFail"));
}

// help page 선택 변경  시
 function onHLMAN_treeAllmenuSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var allMenuTree = app.lookup("HLMAN_treeAllmenu");
	var objHelpPage = app.lookup("HLMAN_obHelpPage");
	var AllMenuList = app.lookup("dsMenuList");
	var FindMenu = AllMenuList.findFirstRow("MenuID== '" + allMenuTree.getSelectionFirst().value + "'");
	if (FindMenu) {
		var targetID = FindMenu.getValue("MenuID");
		var helpPageList = app.lookup("pageInfoLang");
		var helpPage = helpPageList.findFirstRow("menu_id=='" + targetID + "'");
		if (helpPage) {
			var locale = dataManager.getLocale();
			if (locale == 'ko' || locale == 'ja'){
			//console.log(targetID + " : "+helpPage.getValue("src"));
			var pageSrc = helpPage.getValue("src")+"_"+locale+".htm";
			objHelpPage.data = pageSrc;
			} else {
				locale = 'en'
				//console.log(targetID + " : "+helpPage.getValue("src"));
				var pageSrc = helpPage.getValue("src")+"_"+locale+".htm";
				objHelpPage.data = pageSrc;
			}
		}
	}
}
