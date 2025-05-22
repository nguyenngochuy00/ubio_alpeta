/************************************************
 * SideMenu.js
 * Created at Aug 19, 2020 10:21:34 PM.
 *
 * @author Sam
 ************************************************/

var menu;
var zeynep;
var dataManager = getDataManager();
var oShell;
var isPictureLoad;

/*
 * Triggered when init event is fired from Shell.
 */
function onSideMenuInit( /* cpr.events.CUIEvent */ e) {
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	
	var sideMenu = e.control;
	if (zeynep) {

		e.preventDefault();
	}
}
function render() {
	dataManager = getDataManager();
	
	var template = '<div class="zeynep">\
    <div class="menu-profile"><img id="userPicture" class="image-profile" src="/theme/images/mobile/common_img_profile_blank.png" />\
        <p class="mgt10 mgb-0" id="greeting">안녕하세요.</p>\
        <p><span id="sideMenuUserName">관리자 님 </span><img id="btnMore" class="btn-more pdr12"\
                src="/theme/images/mobile/side_menu_btn_more@3x.png" /></p>\
    </div>\
    <div>\
        <p class="text-center side-menu-app-name">UBio Alpeta</p>\
    </div>\
    <ul>\
        <li> <a class="category" data-category="MainPage"><img class="mgr10 sidemenuIcon"\
                    src="/theme/images/mobile/side_menu_title_icon_main@3x.png" /> Main</a> </li>\
        <li> <a class="category" data-category="TerminalManagementPage"><img class="mgr10 sidemenuIcon"\
                    src="/theme/images/mobile/side_menu_title_icon_divice@3x.png" /><span id="TerminalManagementPage">단말기 관리</span></a> </li>\
        <li> <a class="category"  data-category="UserManagementPage"><img\
                    class="mgr10 sidemenuIcon" src="/theme/images/mobile/side_menu_title_icon_user@3x.png" /><span id="UserManagementPage" >사용자 관리</span></a> </li>\
        <li> <a class="category" data-category="LogManagement"><img class="mgr10 sidemenuIcon"\
                    src="/theme/images/mobile/side_menu_title_icon_log@3x.png" /><span id="LogManagement">로그 조회</span></a> </li>\
        <li> <a class="category" data-category="Monitoring"><img class="mgr10 sidemenuIcon"\
                    src="/theme/images/mobile/side_menu_title_icon_monitor@3x.png" /><span id="Monitoring">모니터링</span></a> </li>\
        <li> <a class="category" data-category="MealManagement"><img class="mgr10 sidemenuIcon"\
                    src="/theme/images/mobile/side_menu_title_icon_meal@3x.png" /><span id="MealManagement">식수 관리</span></a> </li>\
        <li> <a class="category" data-category="TimeSheetMenu"><img class="mgr10 sidemenuIcon"\
                    src="/theme/images/mobile/side_menu_title_icon_work@3x.png" /><span id="TimeSheetMenu">근태 조회</span></a> </li>\
        <li> <a class="category" data-category="VisitorManagement"><img class="mgr10 sidemenuIcon"\
                    src="/theme/images/mobile/side_menu_title_icon_visit@3x.png" /><span id="VisitorManagement">방문자 관리</span></a> </li>\
        <li> <a class="category" data-category="setting"><img class="mgr10 sidemenuIcon"\
                    src="/theme/images/mobile/side_menu_title_icon_setting@1x.png" /><span id="setting">설정</span></a> </li>\
    </ul>\
</div>\
<div class="zeynep-overlay"></div>';
	var userContext = app.getAppProperty("userContext");
	var greetingText = "";
	var userName = "";
	if (userContext) {
		var privilege = userContext.getValue("Privilege");
		userName = userContext.getValue("Name");
		
		if (privilege === 2) {
			// User	
			template = '\
			<div class="zeynep">\
			<div class="menu-profile">\
				<img\
					id="userPicture"\
					class="image-profile"\
					src="/theme/images/mobile/common_img_profile_blank.png"\
				/>\
				<p class="mgt10 mgb-0" id="greeting">안녕하세요.</p>\
				<p>\
					<span id="sideMenuUserName">관리자 님 </span\
					><img\
						id="btnMore"\
						class="btn-more pdr12"\
						src="/theme/images/mobile/side_menu_btn_more@3x.png"\
					/>\
				</p>\
			</div>\
			<div><p class="text-center side-menu-app-name">UBio Alpeta</p></div>\
			<ul>\
				<li>\
					<a class="category" data-category="MainPage"\
						><img\
							class="mgr10 sidemenuIcon"\
							src="/theme/images/mobile/side_menu_title_icon_main@1x.png"\
						/>Main</a\
					>\
				</li>\
				<li> <a class="category" data-category="MealManagement"><img class="mgr10 sidemenuIcon"\
					src="/theme/images/mobile/side_menu_title_icon_meal@3x.png" /><span id="MealManagement">식수 관리</span></a>\
				</li>\
				<li> <a class="category" data-category="TimeSheetMenu"><img class="mgr10 sidemenuIcon"\
          src="/theme/images/mobile/side_menu_title_icon_work@3x.png" /><span id="TimeSheetMenu">근태 조회</span></a> </li>\
					<li> <a class="category" data-category="VisitorManagement"><img class="mgr10 sidemenuIcon"\
					src="/theme/images/mobile/side_menu_title_icon_visit@3x.png" /><span id="VisitorManagement">방문자 관리</span></a> </li>\
					<li> <a class="category" data-category="setting"><img class="mgr10 sidemenuIcon"\
					src="/theme/images/mobile/side_menu_title_icon_setting@1x.png" /><span id="setting">설정</span></a> </li>\
			</ul>\
		</div>\
		<div class="zeynep-overlay"></div>';
		}
		greetingText = userContext.getValue("Name") + (cpr.I18N.INSTANCE.currentLanguage === "ko" ? " 님" : "");
	}
	oShell.innerHTML = template;
	if (userContext && userContext.getValue("Picture")) {
		$("#userPicture").attr("src", "data:image/png;base64," + userContext.getValue("Picture"));
	}
	
	
	$("#greeting").text(dataManager.getString("Str_SideMenu_Greeting"));
	$("#TerminalManagementPage").text(dataManager.getString("Str_SideMenu_TerminalManagement"));
	$("#UserManagementPage").text(dataManager.getString("Str_SideMenu_UserManagement"));
	$("#MealManagement").text(dataManager.getString("Str_SideMenu_MealManagement"));
	$("#LogManagement").text(dataManager.getString("Str_SideMenu_LogManagement"));
	$("#Monitoring").text(dataManager.getString("Str_SideMenu_Monitoring"));
	$("#MealManagement").text(dataManager.getString("Str_SideMenu_MealManagement"));
	$("#TimeSheetMenu").text(dataManager.getString("Str_SideMenu_WorkManagement"));
	$("#VisitorManagement").text(dataManager.getString("Str_SideMenu_VisitManagement"));
	$("#setting").text(dataManager.getString("Str_SideMenu_Setting"));
	$('#sideMenuUserName').text(greetingText);
	
	zeynep = $('.zeynep').zeynep({
		closed: function() {
			// enable main wrapper element clicks on any its children element
			$("body main").attr("style", "");
			console.log('the side menu is closed.');
		},
		opened: function() {
			// disable main wrapper element clicks on any its children element
			$("body main").attr("style", "pointer-events: none;");
			
			console.log('the side menu is opened.');
		}
	});
	
	$(".zeynep-overlay").on("scrollstart", function(event) {
		zeynep.close();
	});
	
	$(".zeynep").on("swipeleft", function(event) {
		zeynep.close();
	});
	
	$(".zeynep-overlay").on("tap", function(event) {
		zeynep.close();
	})
	
	$(".category").on("tap", function(e) {
		var pageChangeEvent = new cpr.events.CUIEvent("pageChange", {
			content: {
				nextPage: $(this).data("category")
			}
		});
		app.dispatchEvent(pageChangeEvent);
	});
	
	$("#btnMore").on("click", function(e) {
		var btnMoreClick = new cpr.events.CUIEvent("btnMoreClick");
		app.dispatchEvent(btnMoreClick);
	})
}

/*
 * Triggered when load event is fired from Shell.
 */
function onSideMenuLoad( /* cpr.events.CUIEvent */ e) {
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	
	var sideMenu = e.control;
	if (!e.content) {
		return;
	}
	oShell = e.content;
	render();
}

var openMenu = function() {
	zeynep.open();
	
}

var closeMenu = function() {
	zeynep.close();
	
}

///*
// * Triggered when property-change event is fired from Body.
// * 앱의 속성이 변경될 때 발생하는 이벤트 입니다.
// */
//function onBodyPropertyChange(/* cpr.events.CPropertyChangeEvent */ e){
//	//oShell = e.content;
//	render();
//}

exports.render = render;
exports.openMenu = openMenu;
exports.closeMenu = closeMenu;