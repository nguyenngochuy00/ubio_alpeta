/************************************************
 * TodayAccessAreaStatus.js
 * Created at 2020. 4. 20. 오전 10:09:03.
 *
 * @author blue1
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var todayAccessAreaChart = null;
/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};



/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var date = new Date();
	var today = app.lookup("DASHB_optToday");
	today.value = "[" + date.getFullYear() + "-" + (date.getMonth() + 1).zf(2) + "-" + date.getDate().zf(2) + "]";
}


/*
 * 쉘에서 init 이벤트 발생 시 호출.
 */
function onDASHB_shlTodayAccessAreaInit(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var dASHB_shlTodayAccessArea = e.control;
	
	if (todayAccessAreaChart) {
		e.preventDefault();
	}	
	
}


/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onDASHB_shlTodayAccessAreaLoad(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var dASHB_shlTodayAccessArea = e.control;
	
	dataManager = getDataManager();

	var shellDiv = e.content;
	todayAccessAreaChart = echarts.init(shellDiv);

	var option = {
		grid: {
	        borderWidth: 0,
			y: 30,
	        y2: 20,
	        x: 80,
	        x2: 10
	    },
		tooltip : {
	        trigger: 'axis',
	        axisPointer : {
	            type : 'shadow'
	        }
    	},
    	legend: {
        	data:[
        		dataManager.getString("Str_AccessAreaEnter"),
				dataManager.getString("Str_AccessAreaLeave"),
				dataManager.getString("Str_AccessAreaNumberOfPeple")
			]
        },
        calculable : true,
	    xAxis : [
	        {
	            type : 'value'
	        }
	    ],
	    yAxis : [
	        {
	            type : 'category',
	            data : ['area1','area2','area3']
	        }
	    ],
	    series : [
	        {
				name: dataManager.getString("Str_AccessAreaEnter"),
	            type:'bar',
	            stack: 'total',
	            itemStyle : { normal: { color: '#5AB1EF', label : {show: true, position: 'insideRight'}}},
	            data:[0, 0, 0]
	        },
	        {
				name:dataManager.getString("Str_AccessAreaLeave"),
	            type:'bar',
	            stack: 'total',
	            itemStyle : { normal: { color: '#FFB980', label : {show: true, position: 'insideRight'}}},
	            data:[0, 0, 0]
	        },
	        {
				name:dataManager.getString("Str_AccessAreaNumberOfPeple"),
	            type:'bar',
	            stack: 'total',
	            itemStyle : { normal: { color: '#2EC7C9', label : {show: true, position: 'insideRight'}}},
	            data:[0, 0, 0]
	        },
		] 
	};
	
	todayAccessAreaChart.setOption(option);
}


/**
 * 당일 인증 차트에 값을 세팅합니다.
 * @param options 문자열 배열 ()
 */
exports.setShellTodayAccessArea = function(areaNames, inCounts, outCounts, curInConts){
	if (todayAccessAreaChart) {

		todayAccessAreaChart.setOption( {
			
			yAxis : [
		        {
		            type : 'category',
		            data : [areaNames[0], areaNames[1], areaNames[2]]
		        }
	    	],
			series: [
				{
					data:[inCounts[0], inCounts[1], inCounts[2]]					
				},
				{
					data:[outCounts[0], outCounts[1], outCounts[2]]					
				},
				{
					data:[curInConts[0], curInConts[1], curInConts[2]]					
				}
			]
		});
	}
}
