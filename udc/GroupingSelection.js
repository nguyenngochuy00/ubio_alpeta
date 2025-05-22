/************************************************
 * GroupingSelection.js
 * Created at 2018. 10. 19. 오전 9:01:44.
 *
 * @author donghee
 ************************************************/

var naturalHeight = 0 ;

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};

exports.getNaturalHeight = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return naturalHeight;
};




/*
 * Body에서 property-change 이벤트 발생 시 호출.
 * 앱의 속성이 변경될 때 발생하는 이벤트 입니다.
 */
function onBodyPropertyChange(/* cpr.events.CPropertyChangeEvent */ e){
	if(e.property == "GroupData"){
		
		var selection = app.lookup("selection");
		selection.getAllRecursiveChildren().forEach(function(asdf){
			asdf.dispose();		
		});
	
		var AssistGroupData = e.newValue;
		var data_View = new cpr.data.DataView("Group" , AssistGroupData);
		data_View.parseData({"filterCondition": "type == \"G\""});
		app.register(data_View);
		
		var grouping = app.lookup("Group");
		
		for(var groupCount = 0 ; grouping.getRowCount() > groupCount ; groupCount++ ){
	
				var udcGrouping = new udc.grouping();
				udcGrouping.title = grouping.getValue(groupCount, "label");
				udcGrouping.value = grouping.getValue(groupCount, "value");

				var data_View = new cpr.data.DataView("parent_"+ grouping.getValue(groupCount, "value") , AssistGroupData);
				data_View.parseData({"filterCondition": "parent == \""+ grouping.getValue(groupCount, "value") +"\" , type == \"D\" "});

				var bottomSize = ( data_View.getRowCount() * 24 ) + 50 ;  
				
				selection.addChild(udcGrouping, {
					"top": naturalHeight+"px" ,
					"right": "0px",
					"bottom": "0px",
					"left": "0px"
				});
				
				udcGrouping.groupData = data_View;
				
				if(typeof onOptionMouseenter == "function") {
					udcGrouping.addEventListener("mouseEnter", onOptionMouseenter);
				}
				
				if(typeof onOptionMouseleave == "function") {
					udcGrouping.addEventListener("mouseLeave", onOptionMouseleave);
				}
				
				naturalHeight += bottomSize + 30;
		}
//		console.log(naturalHeight);
		app.getContainer().style.css({
			"height" : naturalHeight + "px",
		});
		
		naturalHeight = 0;
	} 
}

/*
 * 이미지에서 mouseenter 이벤트 발생 시 호출.
 * 마우스 포인터가 컨트롤 위에 진입할 때 발생하는 이벤트.
 */
function onOptionMouseenter(/* cpr.events.CMouseEvent */ e , param){
	/** 
	 * @type cpr.controls.Image
	 */
	var event = new cpr.events.CMouseEvent("mouseEnter");
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
