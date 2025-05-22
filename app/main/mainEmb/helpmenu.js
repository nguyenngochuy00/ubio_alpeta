/************************************************
 * helpmenu.js
 * Created at 2018. 11. 29. 오후 4:59:28.
 *
 * @author osm8667
 ************************************************/
var dataManager = getDataManager();
var dragSelection = cpr.core.Module.require("lib/DragSelection");
var ctrlDragManager = cpr.core.Module.require("lib/ControlDragManager");
var mainLib = mainManager(app.getRootAppInstance());
var menuUser = null;
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var hostAppIns = app.getHostAppInstance();
	if(hostAppIns){
		var children = app.getHostProperty("initValue")[0];//각메뉴별 자식
		var title = app.getHostProperty("initValue")[1];//상위 메뉴
		menuUser = app.getHostProperty("initValue")[2];//menuUser dataset
	}
	var idx = 0;
	var top = 0;
	var left = 0;
	var width = 82;
	var height = 82;
	var colMaxLength = 8;
	var padding = 5;
	//타이틀 언어 바인딩
	var opt = app.lookup("opt_title");
	opt.bind("value").toLanguage(dataManager.getMenuKey(title));
	children.forEach(function(/* cpr.data.Row */ each){
		
		var row = each.getRowData();
		var icon = createSymbolic(row);
		var menu = app.lookup("menu");
		if (idx != 0 && idx % colMaxLength == 0) {
			top = top + height + padding;
			left = 0;
		}
		menu.addChild(icon, {
			top: top + "px",
			left: left + "px",
			width: width + "px",
			height: height + "px"
		});
		left += width;
		idx++;
		
		menu.redraw();
	});
}


function createSymbolic(row) {
	var menuID = row.MenuID.toString();
	var output = new cpr.controls.Output(menuID);
	output.userAttr("val", menuID);
	output.userAttr("selectable", "true");
	output.style.css("background-image", "url(" + row.Image + ")");
	output.bind("value").toLanguage(dataManager.getMenuKey(parseInt(menuID)));
	output.bind("tooltip").toLanguage(dataManager.getMenuKey(parseInt(menuID)));
	output.ellipsis = true;
	output.style.addClass("symbolic");
	output.addEventListener("mousedown", function(e) {
		if (dragSelection.getSelection().indexOf(output) == -1) {
			dragSelection.setSelection([output], e.ctrlKey);
		}
	});
	output.addEventListener("dblclick", function(e) {
		if (!row.Src) {
			dialogAlert(app, "", dataManager.getString("Str_InPreparation"), "");
			return;
		}
		var parentApp = app.getRootAppInstance();
		dragSelection.clearSelection();
		var emb_Side = parentApp.lookup("emb_Side");
		emb_Side.dispose();
		mainLib.ExecuteMenu(row.MenuID);
	});
	output.addEventListener("contextmenu", function(e) {
		var selection = dragSelection.getSelection();
		selection.forEach(function( /* Object */ each) {
			var isExist = null;
			// 기존 : isExist = menuUser.findAllRow("MenuID == '" + each.id + "'"+" && Visible == 1");
			// menuUser dataSet에 Visible 필드는 존재하지 않음, 해당 필드는 title dataSet에 존재하며,
			// DB에서  메뉴 visible = 비활성화(0)인 메뉴는 해당 메뉴 진입 시 애초에 비활성화 상태로 올라오기 때문에 제외 처리 했음
			isExist = menuUser.findFirstRow("MenuID == " + each.id);
			if (isExist) {
				var hostAppIns = app.getHostAppInstance();
				if (hostAppIns) {
					hostAppIns.callAppMethod("onShortCutAlert");
				}
				//dialogAlert(app, "", dataManager.getString("Str_ExistShortCut"), "");
				return;
			} else {
				var json = {
					name: row.Name,
					value: row.MenuID,
					iconSrc: row.Image,
					parent: ""
				};
				e.preventDefault();
				createLinkContextMenu(e,json);
			}
		});
	});
	return output;
}


function createLinkContextMenu(e,json) {
	var helpLocale = dataManager.getLocale();
	var menu_1 = new cpr.controls.Menu();
	menu_1.userAttr("owner", e.control.id);
	// 마우스 오른쪽 클릭 시, 바로가기 생성 문구 언어셋 수정
	if (helpLocale == "en") {
		var helpContextLabel = helpLocale=="en"?"e_label":"label";		
	} else if (helpLocale == "ja") {
		var helpContextLabel = helpLocale=="ja"?"j_label":"label";		
	} else if (helpLocale == "ko"){
		var helpContextLabel = helpLocale=="ko"?"label":"label";
	}
	menu_1.setItemSet(app.lookup("side_context"), {
		label: helpContextLabel,
		value: "value",
		parentValue: "parent"
	});
	menu_1.addEventListener("selection-change", function(e) {
		//TODO: 메뉴 선택시 동작 추가.
		var menu = e.control;
		var value = e.newSelection[0].value;
		var rootApp = app.getRootAppInstance();
		var selection = dragSelection.getSelection();
		/**
		 * @type cpr.data.DataSet
		 */
		var usermenu = rootApp.lookup("MenuList");
		var rowData = [];
		if(value=="add"){//바탕화면에 아이콘 추가
			selection.forEach(function(/* Object */ each){
				var selectedRow = usermenu.findFirstRow("MenuID=="+each.id);
				var keypath = dataManager.getMenuKey(parseInt(each.id));

				var appendIcon = mainLib.createSymbolic(selectedRow.getValue("Image"), selectedRow.getValue("Name"),
				selectedRow.getValue("MenuID").toString(), selectedRow.getValue("Src"), selectedRow.getValue("Description"), keypath);

				ctrlDragManager.appendIcons(selectedRow.getValue("MenuID"), rootApp, appendIcon);
			});
			//저장 서브미션
			dragSelection.clearSelection();
		}else{

			//mainLib.makeGroup("", json.value);
		}
		menu.dispose();
	});
	var rect = app.getActualRect();
	menu_1.style.css({
		left: (e.clientX - rect.left) + "px",
		top: (e.clientY - rect.top) + "px",
		height: "auto",
		width: "200px",
		position: "absolute"
	});
	menu_1.focus();
	menu_1.addEventListener("blur", function(e) {
		menu_1.dispose();
	});
	app.floatControl(menu_1);
}