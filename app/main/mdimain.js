/************************************************
 * mdimain.js
 * Created at 2018. 10. 29. 오후 5:44:51.
 *
 * @author tomato
 ************************************************/

function init(){
	var nav = app.lookup("nav_menu");
	nav.redraw();
	var dsStartProgram = app.lookup("start_programs");
	var count = dsStartProgram.getRowCount();
	var ds = app.lookup("usermenu");
	var mdi = app.lookup("mdi1");
	
	for(var idx = 0; idx < count; idx++){
		var row = dsStartProgram.getRow(idx);
		var val = row.getValue("value");
		var findRow = ds.findFirstRow("value =='"+val+"'");
		if(findRow){
			var src = findRow.getValue("src");
			mdi.addItemWithApp(src, true, function(tabitem){
				tabitem.closable = false;
			});	
		}
	}
	
}

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms_mainSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	
	init();
}


/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	app.lookup("sms_main").send();
}


/*
 * 네비게이션 바에서 selection-change 이벤트 발생 시 호출.
 * 선택된 Item 값이 저장된 후에 발생하는 이벤트.
 */
function onNav_menuSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var selectedItem = e.newSelection[0];
	var ds = app.lookup("usermenu");
	var row = ds.findFirstRow("value == '"+selectedItem.value+"'");
	if(!row){
		return;
	}
	var src = row.getValue("src");
	if(!src){
		dialogAlert(app,row.getValue("label"),"'"+row.getValue("label")+"'는 준비중입니다.");
//		alert("'"+row.getValue("label")+"'는 준비중입니다.");
		return;
	}
	
	var mdi = app.lookup("mdi1");
	var tabItems = mdi.getTabItems();
	var hasTabItem = false;
	tabItems.some(function(/* cpr.controls.TabItem */ each){
		if(each.text == row.getValue("name")){
			hasTabItem = true;
			mdi.setSelectedTabItem(each,false);
			return true;
		}
		return false;
	});
	if(!hasTabItem){
		mdi.addItemWithApp(src);
	}
	
	
}
