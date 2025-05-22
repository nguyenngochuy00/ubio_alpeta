/************************************************
 * Layout.js
 * Created at Aug 28, 2020 2:34:24 PM.
 *
 * @author EVN0025
 ************************************************/

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};



/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var pageName = app.lookup("pageName")
	var navigationBar = app.lookup("navigationBar");
	navigationBar.setAppProperties({
		pageName: app.getAppProperty("navPageName"),
		leftIcon: app.getAppProperty("leftIcon"),
		rightIcon: app.getAppProperty("rightIcon"),
		isDisplayPageName: app.getAppProperty("isNavPageNameDisplay"),
		rightIconVisible: app.getAppProperty("rightIconVisible"),
		leftBtnPath: app.getAppProperty("leftBtnPath"),
		rightBtnPath: app.getAppProperty("rightBtnPath"),
		rightIconPath: app.getAppProperty("rightIconPath")
	});
}


/*
 * Triggered when pageChange event is fired from User Defined Control.
 */
function onNavigationBarPageChange(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.NavigationBar
	 */
	var navigationBar = e.control;
	cpr.core.App.load("/app/mobile/UserInformation/UserInformation", function(newapp) {
		app.getRootAppInstance().close();
		app.close();
		newapp.createNewInstance().run();				
	});
}


/*
 * Triggered when property-change event is fired from Body.
 * 앱의 속성이 변경될 때 발생하는 이벤트 입니다.
 */
function onBodyPropertyChange(/* cpr.events.CPropertyChangeEvent */ e){
	var navigationBar = app.lookup("navigationBar");
	var pageName = app.lookup("pageName")
	navigationBar.setAppProperties({
		pageName: app.getAppProperty("navPageName"),
		leftIcon: app.getAppProperty("leftIcon"),
		rightIcon: app.getAppProperty("rightIcon"),
		isDisplayPageName: app.getAppProperty("isNavPageNameDisplay"),
		rightIconVisible: app.getAppProperty("rightIconVisible"),
		leftBtnPath: app.getAppProperty("leftBtnPath"),
		rightIconPath: app.getAppProperty("rightIconPath"),
		rightBtnPath: app.getAppProperty("rightBtnPath"),
	});
	app.lookup("pageName").value = app.getAppProperty("pageName")
}

/*
 * Triggered when rightBtnClick event is fired from User Defined Control.
 */
function onNavigationBarRightBtnClick(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.NavigationBar
	 */
	var navigationBar = e.control;
	var rightBtnClick = new cpr.events.CUIEvent("rightBtnClick", {
			content: e.content
		});
  	app.dispatchEvent(rightBtnClick);
}


/*
 * Triggered when leftBtnClick event is fired from User Defined Control.
 */
function onNavigationBarLeftBtnClick(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.NavigationBar
	 */
	var navigationBar = e.control;
	var leftBtnClick = new cpr.events.CUIEvent("leftBtnClick", {
			content: e.content
		});
  	app.dispatchEvent(leftBtnClick);
}

exports.goback = function() {
	app.lookup("navigationBar").goBack()
}
