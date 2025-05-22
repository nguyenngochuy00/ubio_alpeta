/************************************************
 * help.js
 * Created at 2018. 11. 21. 오후 2:42:38.
 *
 * @author osm8667
 ************************************************/
var dragSelection = cpr.core.Module.require("lib/DragSelection");
/**
 * @type cpr.data.DataSet
 */
var menuList, menuUser;
var mainLib = mainManager(app.getRootAppInstance());
var dataManager = getDataManager();
var usint_version;

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	usint_version = dataManager.getSystemVersion();
	var deleteItemMenuIDArr = dataManager.getDeleteItemMenuID();
	var hostAppIns = app.getHostAppInstance();
	if(hostAppIns){
		menuList = app.getHostProperty("initValue")[0];
		menuUser = app.getHostProperty("initValue")[1];
	}
	if (dataManager.getOemVersion() == OEM_INNODEP_NORMAL){
		app.lookup("topMenuDesc").value = "HELP CONTENTS"
	}
	var area = app.lookup("grp_icons");
	var areaRect = area.getActualRect();
	//도움말 메뉴 트리생성
	var tree = app.lookup("tre1");
	menuList.getRowDataRanged().forEach(function(each){
//		console.log("each.Name : ",each.Name,"each.MenuID : ",each.MenuID, "each.ParentID",each.ParentID);
		if (each.Visible == 1) {
			var treeItemSet = new cpr.controls.TreeItem(each.Name, each.MenuID, each.ParentID);
			treeItemSet.bind("label").toLanguage(dataManager.getMenuKey(each.MenuID));//다국어 바인딩
			tree.addItem(treeItemSet);	
		}
	});

	for (var i =0 ; i < deleteItemMenuIDArr.length; i++ ) {
		tree.deleteItemByValue(deleteItemMenuIDArr[i]);
	}
	/*
	tree.deleteItemByValue(83886087); //사용자 가져오기
	tree.deleteItemByValue(436207617);
	tree.deleteItemByValue(452984834);
	tree.deleteItemByValue(436207616);
	tree.deleteItemByValue(369098755);
	*/
	tree.expandItem(tree.getItem(0));
	//아이콘 모음 분류
	var parentRows = [];
	var parent = menuList.findAllRow("ParentID==0 && !Src");//최상위 및 상위 그룹 필터링
	parent.forEach(function(/* cpr.data.Row */ each){
		var pRow = each.getRowData();
		if( pRow && pRow.Visible == 1 ){
			parentRows.push(pRow);
		}
	});
	var top = 0;
	var left = 0;
	var height = Math.floor(areaRect.height/5);//임시로 4등분 4개 그룹씩
	var padding = 5;
	parentRows.forEach(function(/* Object */ each){
		var children = menuList.findAllRow("ParentID=='"+each.MenuID+"'"+" && Visible == 1");
		if(children.length>0){
			var emb_menu = createMenu(children, each.MenuID);
			area.addChild(emb_menu, {
				top: top + "px",
				left: left + "px",
				width: "100%",
				height: "20%"
			});
			top = top + height + padding;
		}
	});
	
	area.redraw();
}


/*
 * 도움말 영역에 아이콘이 위치 할 영역
 */
function createMenu(children, title){
	var area = app.lookup("grp_icons");
	var emb_menu = new cpr.controls.EmbeddedApp("emb_menu");
	var appld = "app/main/mainEmb/helpmenu" + "?" + usint_version;
	cpr.core.App.load(appld, function(app) {
		if(app){
			emb_menu.app = app;
		}
	});
	emb_menu.initValue = [children, title, menuUser];
	return emb_menu;
}


/*
 * 아웃풋에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onOpt_closeClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Output
	 */
	var opt_close = e.control;
	var parentApp = app.getRootAppInstance();

	dragSelection.clearSelection();
	/**
	 * @type cpr.controls.Output
	 */
	var emb_Side = parentApp.lookup("emb_Side");
	emb_Side.dispose();
}


/*
 * 그룹에서 contextmenu 이벤트 발생 시 호출.
 * 마우스의 오른쪽 버튼이 클릭되거나 컨텍스트 메뉴 키가 눌려지면 호출되는 이벤트.
 */
function onGrp_MainContextmenu(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Container
	 */
	var grp_Main = e.control;
	e.preventDefault();
}


/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGrp_iconsClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Container
	 */
	e.stopImmediatePropagation();
	var grp_icons = e.control;
	var tree = app.lookup("tre1");
	var target = e.targetControl.id;
	var treeItem = tree.getItemByValue(target);
	if(treeItem){
		var treeParent = tree.getItemByValue(target).parentValue;
		tree.expandItem(tree.getItemByValue(treeParent));
		tree.selectItemByValue(target);
	}
}



/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onGetHelpPageSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var getHelpPage = e.control;
	var page = app.lookup("obj_help");
	var tree = app.lookup("tre1");

//	console.log(app.lookup("PageInfo").getValue("Src"))
//	page.data = app.lookup("PageInfo").getValue("Src");
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
	var target = tre1.getSelectionFirst().value;

	var topBindKey = dataManager.getHelpKeys(parseInt(target)).top;
	var detailBindKey = dataManager.getHelpKeys(parseInt(target)).detail;
	var labelValue = dataManager.getMenuKey(parseInt(target));

	//아웃풋 컨트롤
	var topMenuName = app.lookup("topMenuName");
	var topMenuDesc = app.lookup("topMenuDesc");
	var menuDetailDesc = app.lookup("menuDetailDesc");
	
	//바인딩 초기화 ; 값이 없는 경우 이전 바인딩의 값으로 보여지는 것을 방지
	topMenuName.unbind("value");
	topMenuDesc.unbind("value");
	menuDetailDesc.unbind("value");

	if (dataManager.getOemVersion() == OEM_INNODEP_NORMAL){
		labelValue == "" ? topMenuName.value= "HELP" : topMenuName.bind("value").toLanguage(labelValue);
		topBindKey == "" ? topMenuDesc.value= "HELP CONTENTS" : topMenuDesc.bind("value").toLanguage(topBindKey);
		if(topBindKey=="Str_UserMgrDesc"){
			topMenuDesc.bind("value").toLanguage("Str_UserMgrDesc_INNODEP");
		}
		detailBindKey == "" ? menuDetailDesc.value= "" : menuDetailDesc.bind("value").toLanguage(detailBindKey);
	} else if (dataManager.getOemVersion() == OEM_GS_BASIC) {
		labelValue == "" ? topMenuName.value= "HELP" : topMenuName.bind("value").toLanguage(labelValue);
		topBindKey == "" ? topMenuDesc.value= "UBIO ALPETA HELP CONTENTS" : topMenuDesc.bind("value").toLanguage(topBindKey);
		detailBindKey == "" ? menuDetailDesc.value= "" : menuDetailDesc.bind("value").toLanguage(detailBindKey);
		if(topBindKey=="Str_HolidayDesc"){
			menuDetailDesc.bind("value").toLanguage("Str_HolidayDetailDesc_GS");
		} else if(topBindKey=="Str_SettingDesc"){
			menuDetailDesc.bind("value").toLanguage("Str_SettingDetailDesc_GS");
		}
	} else {
		labelValue == "" ? topMenuName.value= "HELP" : topMenuName.bind("value").toLanguage(labelValue);
		topBindKey == "" ? topMenuDesc.value= "UBIO ALPETA HELP CONTENTS" : topMenuDesc.bind("value").toLanguage(topBindKey);
		detailBindKey == "" ? menuDetailDesc.value= "" : menuDetailDesc.bind("value").toLanguage(detailBindKey);
	}
	var btnGoto = app.lookup("optGoTo");
	//메뉴로 이동 버튼의 userAttr 설정
	var gotoOutput = app.lookup("optGoTo");
	if(detailBindKey != ""){ // 설명이 없는 메뉴의 경우 즉, 최상위 카테고리
		gotoOutput.userAttr("code", target);
		btnGoto.visible = true;
	}else{
		gotoOutput.removeUserAttr("code");
		btnGoto.visible = false;
	}
}



/*
 * 메뉴로이동버튼 에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onOutputClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Output
	 */
	var output = e.control;
	var menuID = output.userAttr("code");
	if(menuID){
		mainLib.ExecuteMenu(output.userAttr("code"));
		var emb_Side = app.getRootAppInstance().lookup("emb_Side");
		emb_Side.dispose();
	}else{
		dialogAlert(app, "", dataManager.getString("Str_SubItemSelect"), "");
	}
}


/*
 * Body에서 contextmenu 이벤트 발생 시 호출.
 * 마우스의 오른쪽 버튼이 클릭되거나 컨텍스트 메뉴 키가 눌려지면 호출되는 이벤트.
 */
function onBodyContextmenu(/* cpr.events.CMouseEvent */ e){
	e.preventDefault();
}


exports.onShortCutAlert = function( PassID ){
	dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ExistShortCut"), "");
}