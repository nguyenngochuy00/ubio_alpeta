/************************************************
 * TimelineManager.module.js
 * Created at 2019. 1. 18. 오전 11:17:27.
 *
 * @author tomato
 ************************************************/

/**
 *
 * @param {cpr.core.AppInstance} appInstance
 * @param {Array} arr 타임라인 배열
 * @param {mdtype} mdtype N 니트젠  V 버디
 */
var TzUtil = function(/*cpr.core.AppInstance*/ appInstance,/* Array */ arr, /*기기타입*/mdtype) {
	this._app = appInstance;
	this._arr = arr;
	this._clssName = ["green","red","orange","blue"];
	this._content = ["ACCESS","DENIED","AuthZone"];
	this._mdtype = mdtype;
}


/**
 * 콤보박스에서 선택된 타임라인에 아이템을 넣는다.
 * @param index
 * @param value
 * @param data
 */
TzUtil.prototype.addTmItem = function (/*timelineIndex*/index, /*selectVal*/value,/*cpr.data.DataSet*/data){
	var timelineArr = this._arr;
	var clssName = this._clssName;
	var content = this._content;
	var code = this._mdtype;
	if(!data){
		return;
	}
	if(!value){
		return;
	}
	var filter = data.findAllRow("TimelineID=="+parseInt(value));
	filter.forEach(function(/* cpr.data.Row */ row){
		var rowData = row.getRowData();
		var iteminfo = timelineArr[index].itemsData;
		// var startDate = new Date();
		// var endDate = new Date();
		// startDate.setTime(rowData.StartTime*60000+new Date().getTimezoneOffset()*60000); // UTC 시간 만큼 합산
		// endDate.setTime(rowData.EndTime*60000+new Date().getTimezoneOffset()*60000);


		//startDate.setTime(rowData.StartTime*60000); // UTC 시간 만큼 합산
		//endDate.setTime(rowData.EndTime*60000);
		var startDate = new Date(1970,0,1,rowData.StartTime/60,rowData.StartTime%60,0);
		var endDate = new Date(1970,0,1,rowData.EndTime/60,rowData.EndTime%60,0);

		var intoData = {
		    content: content[rowData.Type],
		    start: startDate,
		    end: endDate,
		    className: clssName[rowData.Type],
		    inoutType: rowData.Type,
		    authType: rowData.ExtVal
    	};
    	if(code.toLowerCase()=="v"){//버디일때 데이터 변경
    		var vType = rowData.Type;
    		intoData.group = (vType==0||vType==1)?0:1;
    		intoData.content = intoData.group==0?content[vType]:content[2];
    		intoData.className = intoData.group==0?clssName[vType]:clssName[2];
    	}
		iteminfo.add([intoData]);//타임라인객체의 itemsData속성에 아이템을 넣는다.
	});
}


/**
 * 조회된 타임라인 리스트를 넣는다.
 * @param json
 * @param data
 */
TzUtil.prototype.addTmList = function(json, /*cpr.data.DataSet*/data){
	var that = this;
	var timelineArr = this._arr;
	var appIns = this._app;
	var content = this._content;
	var clssName = this._clssName;
	var code = this._mdtype;
	var order = [json.Monday, json.Tuesday, json.Wednesday, json.Thursday, json.Friday,
			json.Saturday, json.Sunday, json.Holiday];
	order.forEach(function(/* Object */ each, index){
		//콤보박스 select 값 세팅
		appIns.lookup("tmCombo"+index).value = each;
		//필터링
		that.addTmItem(index, each, data);
	});
}


/**
 * 선택한 타임라인 아이템 제거
 * @param index 선택한 타임라인 객체의 인덱스
 */
TzUtil.prototype.selectTzClear = function(index){
	var arr = this._arr;
	if(!arr){
		return;
	}
	arr[index].itemsData.clear();
}


/**
 * 타임라인 전체 아이템 제거
 */
TzUtil.prototype.allTzClear = function(){
	var arr = this._arr;
	if(!arr){
		return;
	}
	arr.forEach(function(/* eachType */ each){
		each.itemsData.clear();
	});
}
/**
 *
 * @param appInstance
 * @param arr
 * @param mdtype
 */
globals.createTzUtil = function(/*cpr.core.AppInstance*/ appInstance,/* Array */ arr, /*기기타입*/mdtype) {
	return new TzUtil(appInstance, arr, mdtype);
}