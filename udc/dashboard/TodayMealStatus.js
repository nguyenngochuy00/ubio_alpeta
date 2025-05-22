/************************************************
 * MealServiceStatus.js
 * Created at 2020. 4. 20. 오전 10:11:44.
 *
 * @author blue1
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var todayMealChart = null;

var strMealChartTotal = null;

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};



/*
 * 쉘에서 init 이벤트 발생 시 호출.
 */
function onDASHB_shlTodayMealInit(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var dASHB_shlTodayMeal = e.control;

	if (todayMealChart) {
		e.preventDefault();
	}	
}

function subStringTitle(size, str) {
	if (str.length > size) {
		return str.substr(0,size) + "..."
	}
	
	return str	
} 

/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onDASHB_shlTodayMealLoad(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var dASHB_shlTodayMeal = e.control;
	
	dataManager = getDataManager();
	
	strMealChartTotal = dataManager.getString("Str_Meal") + " " + dataManager.getString("Str_Total");
	
	var shellDiv = e.content;
	todayMealChart = echarts.init(shellDiv);
	
	var option = {
		title: {
	        text: strMealChartTotal,
	    },
	    grid: {
	        borderWidth: 0,
			y: 40,
	        y2: 20,
	        x: 40,
	        x2: 10
    	},
	    tooltip : {
	        trigger: 'axis',
	        axisPointer : {
	        	type: 'shadow'
	        },
	        formatter: function (params) {
	            var tar = params[0];
	            return tar.name + '<br/>' + tar.seriesName + ' : ' + tar.value;
	        }
	    },
	    xAxis : [
	        {
	            type : 'category',
	            splitLine: {show:false},
	            data : [
					subStringTitle(5, dataManager.getString("Str_BreakFast")),
					subStringTitle(5, dataManager.getString("Str_Lunch")),
					subStringTitle(5, dataManager.getString("Str_Dinner")),
					subStringTitle(5, dataManager.getString("Str_LateSnack")),
					subStringTitle(5, dataManager.getString("Str_Snack"))
	            ]
	        }
	    ],
	    yAxis : [
	        {
	            type : 'value'
	        }
	    ],
	    series : [
        {
            name:'Meal',
            type:'bar',
            stack: 'Count',
            itemStyle : { normal:{ color: '#B6A2DE', label : {show: true, position: 'inside'}}},
            data:[ 0, 0, 0, 0, 0]
        }]
	};
	
	todayMealChart.setOption(option);

}


/**
 * 당일 인증 차트에 값을 세팅합니다.
 * @param options 문자열 배열 (배열 size 6)
 */
exports.setShellTodayMeal = function(options){

	if (todayMealChart) {
		todayMealChart.setOption( {
			title: {
	        	text: strMealChartTotal + ": " + options[0],
	    	},
			series: [
		        {
		            data:[
		            	options[1],
		            	options[2],
		            	options[3],
		            	options[4],
		            	options[5]		            	
		            ]
		        }
			]
		});
	}
}

