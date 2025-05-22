/************************************************
 * changeTabText.js
 * Created at 2023. 12. 27. 오후 1:38:16.
 *
 * @author sky
 ************************************************/

function onBodyLoad(){
	var dsTabList = app.lookup("tabList");
	var tabStorage = localStorage.getItem("tabStorage");
	if(tabStorage){
		var tabArr = tabStorage.split(',');
		var tabCount = tabArr.length;
		for(var i=0; i<tabCount; i++){
			dsTabList.addRowData({"tabText":tabArr[i]});
		}	
	}else{
		var initValue = app.getHost().initValue;
		var TabList = initValue["dsTabList"];
		TabList.copyToDataSet(dsTabList);
	}	
}

//닫기
function onCloseButtonClick(/* cpr.events.CMouseEvent */ e){
	var button = e.control;
	app.close();
}


//적용
function onSaveButtonClick(/* cpr.events.CMouseEvent */ e){
	var button = e.control;

	var dsTabList = app.lookup("tabList");
	var tabArr = dsTabList.getColumnData("tabText");
	var tabStorage = tabArr.toString();
	app.close(tabStorage);
}
