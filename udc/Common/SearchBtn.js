/************************************************
 * SearchBtn.js
 * Created at Sep 22, 2020 3:58:49 PM.
 *
 * @author EVN0025
 ************************************************/
var lodashModule = cpr.core.Module.require("lib/Lodash");
var lodash = lodashModule._;

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
	if (app.getRootAppInstance().app.id === "/app/mobile/Admin/VisitorManagement/VisitorSearch") {
		var container = app.getContainer();
		container.removeChild(app.lookup("navbar_searchInput"));
		var comboBox = new cpr.controls.ComboBox();
		comboBox.addItem(new cpr.controls.Item("전체", -1));
		comboBox.addItem(new cpr.controls.Item("대기", 1));
		comboBox.addItem(new cpr.controls.Item("승인", 2));
		comboBox.addItem(new cpr.controls.Item("거부", 3));
		comboBox.addItem(new cpr.controls.Item("만료", 4));
		comboBox.style.css({
			"padding-right": "10px"
		})
		comboBox.preventInput = true;
		container.addChild(comboBox, {
			colIndex: 1,
			colSpan: 1,
			rowSpan: 1
		});
		comboBox.addEventListener("item-click", function(e){
			var onSearch = new cpr.events.CUIEvent("onSearch", {
				content: {
					searchValue: lodash.trim(e.item.value),
					searchCategory: {
						value: app.lookup("cmb1").value,
					}
				}
			});
		  	app.dispatchEvent(onSearch);
			});
		}
}


/*
 * Triggered when search event is fired from SearchInput.
 * Searchinput의 enter키 또는 검색버튼을 클릭하여 인풋의 값이 Search될때 발생하는 이벤트
 */
function onSearchInputSearch(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.SearchInput
	 */
	var searchInput = e.control;
	var onSearch = new cpr.events.CUIEvent("onSearch", {
		content: {
			searchValue: lodash.trim(searchInput.value),
			searchCategory: {
				value: app.lookup("cmb1").value,
			}
		}
	});
  	app.dispatchEvent(onSearch);
}


/*
 * Triggered when property-change event is fired from Body.
 * 앱의 속성이 변경될 때 발생하는 이벤트 입니다.
 */
function onBodyPropertyChange(/* cpr.events.CPropertyChangeEvent */ e){
	app.getAppProperty("searchCategory").copyToDataSet(app.lookup("searchCategory"));
	app.lookup("searchCategory").forEachOfUnfilteredRows(function (row) {
		var item = new cpr.controls.Item(row.getValue("label"), row.getValue("value"))
		app.lookup("cmb1").addItem(item);
		if (row.getIndex() === 0) {
			app.lookup("cmb1").value = row.getValue("value");
		}
	});
}
