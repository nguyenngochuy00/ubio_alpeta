/************************************************
 * grouping.js
 * Created at 2018. 10. 18. 오후 5:07:52.
 *
 * @author donghee
 ************************************************/

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};


/*
 * Body에서 property-change 이벤트 발생 시 호출.
 * 앱의 속성이 변경될 때 발생하는 이벤트 입니다.
 */
function onBodyPropertyChange(/* cpr.events.CPropertyChangeEvent */ e){
	var option = app.lookup("option");
	if(e.property == "value"){
		if(e.newValue == "0000000000"){
			option.visible = true ;	
		} else {
			option.visible = false ;			
		}
	}
	
	if(e.property == "groupData"){
		var dataSet_1 =  e.newValue;
		
		if(dataSet_1.getRowCount() == "0"){
			option.visible = false ;			
		}
		
		var bottomSize = dataSet_1.getRowCount() * 24 + 65;
		app.getContainer().style.css({
			"width" : "100%",
			"top" : "0px",
			"height" : bottomSize + "px",
			"left" : "0px"
		});
					
			var groupGrid = new cpr.controls.Grid("groupGrid");
			groupGrid.readOnly = false;
			groupGrid.enabled = false;
			groupGrid.init({
				//받아온 DataSet을 groupGrid에 정의한다.
				"dataSet": dataSet_1,
				"vScroll": "hidden",
				"columnMovable": false,
				"columnResizable": false,
				"columns": [
					{"width": "100px"},
					{"width": "0px"},
					{"width": "0px"}
				],
				"header": {
					"rows": [{"height": "0"}],
					"cells": [
						{
							"constraint": {"rowIndex": 0, "colIndex": 0},
							"configurator": function(cell){
								cell.targetColumnName = "label";
								cell.filterable = false;
								cell.sortable = false;
								cell.text = "label";
							}
						},
						{
							"constraint": {"rowIndex": 0, "colIndex": 1},
							"configurator": function(cell){
								cell.targetColumnName = "value";
								cell.filterable = false;
								cell.sortable = false;
								cell.text = "value";
							}
						},
						{
							"constraint": {"rowIndex": 0, "colIndex": 2},
							"configurator": function(cell){
								cell.targetColumnName = "parent";
								cell.filterable = false;
								cell.sortable = false;
								cell.text = "parent";
							}
						}
					]
				},
				"detail": {
					"rows": [{"height": "24px"}],
					"cells": [
						{
							"constraint": {"rowIndex": 0, "colIndex": 0},
							"configurator": function(cell){
								cell.columnName = "label";
							}
						},
						{
							"constraint": {"rowIndex": 0, "colIndex": 1},
							"configurator": function(cell){
								cell.columnName = "value";
							}
						},
						{
							"constraint": {"rowIndex": 0, "colIndex": 2},
							"configurator": function(cell){
								cell.columnName = "parent";
							}
						}
					]
				}
			});
			groupGrid.style.css({
				"background-color" : "#FFFFFF"
			});
			var groupLayout = app.lookup("groupLayout");
			groupLayout.addChild(groupGrid, {
				"colIndex": 0,
				"rowIndex": 1
			});
	}
	
}

/*
 * 이미지에서 mouseenter 이벤트 발생 시 호출.
 * 마우스 포인터가 컨트롤 위에 진입할 때 발생하는 이벤트.
 */
function onOptionMouseenter(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Image
	 */
	var event = new cpr.events.CMouseEvent("mouseEnter" );
	app.dispatchEvent(event);
}

/*
 * 이미지에서 mouseleave 이벤트 발생 시 호출.
 * 사용자가 컨트롤 및 컨트롤의 자식 영역 바깥으로 마우스 포인터를 이동할 때 발생하는 이벤트.
 */
function onOptionMouseleave(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Image
	 */
	var option = e.control;
	var event = new cpr.events.CMouseEvent("mouseLeave");
	app.dispatchEvent(event);
	
}
