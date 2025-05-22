/************************************************
 * TopMenuBar.js
 * Created at Aug 21, 2020 4:32:27 PM.
 *
 * @author EVN0025
 ************************************************/
/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function() {
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};

/*
 * Triggered when click event is fired from Image.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onLeftBtnClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Image
	 */
	var image = e.control;
	var button = e.control;
	e.preventDefault();
	var backPath = app.getAppProperty("leftBtnPath");
	
	if (app.getAppProperty("leftIcon") === "Back") {
		if (backPath) {
			var parent = app.getRootAppInstance();
			cpr.core.App.load(backPath, function(newapp) {
				newapp.createNewInstance().run(null, function(createdApp) {
					createdApp.getContainer().style.animateFrom({
						"transform": "translateX(-100%)",
						"opacity": "0"
					}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
					parent.close();
				});
			});
			return;
		} else {
			var leftBtnClick = new cpr.events.CUIEvent("leftBtnClick", {
				content: {
					btn: app.getAppProperty("leftIcon")
				}
			});
			app.dispatchEvent(leftBtnClick);
		}
	} else {
		var menuClick = new cpr.events.CUIEvent("menuClick");
		app.dispatchEvent(menuClick);
	}
}

/*
 * Triggered when property-change event is fired from Body.
 * 앱의 속성이 변경될 때 발생하는 이벤트 입니다.
 */
function onBodyPropertyChange( /* cpr.events.CPropertyChangeEvent */ e) {
	
	var leftBtn = app.lookup("leftBtn");
	var rightBtn = app.lookup("rightBtn");
	if (app.getAppProperty("leftIcon") === "Back") {
		leftBtn.src = "/theme/images/mobile/common_top_btn_icon_back@3x.png"
	}
	
	if (app.getAppProperty("rightIcon") === "Edit") {
		rightBtn.src = "/theme/images/mobile/common_top_btn_icon_edit@3x.png"
	}
	
	if (app.getAppProperty("rightIcon") === "Dashboard") {
		rightBtn.src = "/theme/images/mobile/common_top_btn_icon_deshboard@3x.png"
	}
	
	if (app.getAppProperty("rightIcon") === "List") {
		rightBtn.src = "/theme/images/mobile/common_top_btn_icon_list@3x.png"
	}
	
	if (app.getAppProperty("rightIcon") === "Search") {
		rightBtn.src = "/theme/images/mobile/common_top_btn_icon_search@3x.png"
	}
	
	if (app.getAppProperty("rightIcon") === "SearchBar") {
		rightBtn.visible = false;
		app.lookup("searchBtn").visible = true;
	}
	
//	if (app.getAppProperty("userContext")) {
//		app.lookup("menu").setAppProperty("userContext", app.getAppProperty("userContext"));
//	}
	
	if (app.getAppProperty("searchCategory")) {
		app.lookup("searchBtn").setAppProperty("searchCategory", app.getAppProperty("searchCategory"));
	}
}

/*
 * Triggered when click event is fired from Image.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onRightBtnClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Image
	 */
	
	var rightBtn = e.control;
	var appProperties = app.getAllAppProperties();
	var parent = app.getRootAppInstance();
	
	if (appProperties.rightBtnPath) {
		return cpr.core.App.load(appProperties.rightBtnPath, function(newapp) {
			
			newapp.createNewInstance().run(null, function(createdApp) {
				createdApp.getContainer().style.animateFrom({
					"transform": "translateX(100%)",
					"opacity": "0"
				}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
				parent.close();
			});
		});
	} else {
		var rightBtnClick = new cpr.events.CUIEvent("rightBtnClick", {
			content: {
				btn: app.getAppProperty("rightIcon")
			}
		});
		app.dispatchEvent(rightBtnClick);
	}
}

/*
 * Triggered when search event is fired from SearchInput.
 * Searchinput의 enter키 또는 검색버튼을 클릭하여 인풋의 값이 Search될때 발생하는 이벤트
 */
function onSearchBtnSearch( /* cpr.events.CUIEvent */ e) {
	/** 
	 * @type cpr.controls.SearchInput
	 */
	var searchBtn = e.control;
	
}


/*
 * Triggered when onSearch event is fired from User Defined Control.
 */
function onSearchBtnOnSearch( /* cpr.events.CUIEvent */ e) {
	/** 
	 * @type udc.Common.SearchBtn
	 */
	
	var searchBtn = e.control;
	var onSearch = new cpr.events.CUIEvent("onSearch", {
		content: e.content
	});
	app.dispatchEvent(onSearch);
}

function handleBackBtnClicked() {
	var backPath = app.getAppProperty("leftBtnPath");
	if (app.getAppProperty("leftIcon") === "Back") {
		if (backPath) {
			var parent = app.getRootAppInstance();
			cpr.core.App.load(backPath, function(newapp) {
				newapp.createNewInstance().run(null, function(createdApp) {
					createdApp.getContainer().style.animateFrom({
						"transform": "translateX(100%)",
						"opacity": "0"
					}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
					parent.close();
				});
			});
			return;
		} else {
			var leftBtnClick = new cpr.events.CUIEvent("leftBtnClick", {
				content: {
					btn: app.getAppProperty("leftIcon")
				}
			});
			app.dispatchEvent(leftBtnClick);
		}
	}
}

/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad( /* cpr.events.CEvent */ e) {
	console.log("currentLanguage= " + cpr.I18N.INSTANCE.currentLanguage);
}

/*
 * Triggered when before-unload event is fired from Body.
 * 앱이 언로드되기 전에 발생하는 이벤트 입니다. 취소할 수 있습니다.
 */
function onBodyBeforeUnload( /* cpr.events.CEvent */ e) {
	
	window.removeEventListener("AndroidBackBtnClick", handleBackBtnClicked, true);
}