/************************************************
 * folder.js
 * Created at 2018. 12. 26. 오전 10:02:39.
 *
 * @author osm8667
 ************************************************/
var mainLib = null;
var dataManager = getDataManager();

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var hostAppIns = app.getHostAppInstance();
	if(hostAppIns){
		/**
		 * 더블클릭 한 대상 컨트롤
		 * @type cpr.controls.Button
		 */
		var control = app.getHostProperty("initValue");
	}
	if(!control){
		return;
	}
	var pApp = app.getRootAppInstance();//최상위 앱
	mainLib = mainManager(pApp);
	/**
	 * @type cpr.data.DataSet
	 */
	var groupList = pApp.lookup("MenuGroup");
	var value = control.userAttr("val");//더블클릭한 폴더 아이콘으로부터 아이디 추출
	//폴더 상단 이름 설정
	var oTitle = app.lookup("opt_Title");
	oTitle.value = groupList.findFirstRow("MenuGroupID=="+value).getValue("Name");
	//아이콘 배치
	var oIconArea = app.lookup("grp_fIcons");//배치될 레이아웃
	//아이콘 크기
	var width = 82;
	var height = 92;
	/**
	 * @type cpr.data.DataSet
	 */
	var menuList = pApp.lookup("MenuList"),
	    iconList = pApp.lookup("MenuUser");
	var icons = iconList.findAllRow("GroupID=="+value);//해당 그룹의 자식 find
	icons.forEach(function(/* cpr.data.Row */ row){
		var getInfo = menuList.findFirstRow("MenuID=="+row.getValue("MenuID"));
		var icon = mainLib.createSymbolic(getInfo.getValue("Image"), getInfo.getValue("Name"), getInfo.getValue("MenuID").toString()
				, getInfo.getValue("Src"),getInfo.getValue("Description"), dataManager.getMenuKey(getInfo.getValue("MenuID")));
		icon.style.css("visibility","visible");
		icon.userAttr("isGroupChild", "true");//그룹에 속한 아이콘인지 아닌지 판별을 위한 userAttr
		oIconArea.addChild(icon, {
			width : width + "px",
			height : height + "px"
		});
	});
	oIconArea.userAttr("isFolder","true");
	oIconArea.addEventListener("blur", function(e) {
		oIconArea.dispose();
	});
}


/*
 * "X" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onFolder_closeClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var folder_close = e.control;
	var oIconArea = app.lookup("grp_Folder");
	oIconArea.dispose();
	//mainManager의 아이콘 생성 로직을 이용하기 때문에 아이콘 클릭 시 selection에 등록된 것을 해제
	var dragSelection = cpr.core.Module.require("lib/DragSelection");
	dragSelection.clearSelection();
}
