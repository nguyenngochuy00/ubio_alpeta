/************************************************
 * TNAStatus.js
 * Created at 2020. 4. 20. 오전 10:10:38.
 *
 * @author blue1
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var todayTnaChart = null;
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
function onDASHB_shlTodayTnaInit(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var dASHB_shlTodayTna = e.control;
	
	if (todayTnaChart) {
		e.preventDefault();
	}	
}

/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onDASHB_shlTodayTnaLoad(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var dASHB_shlTodayTna = e.control;
	
	dataManager = getDataManager();
	
	var shellDiv = e.content;
	todayTnaChart = echarts.init(shellDiv);
	
	var option = {
	    grid: {
	        borderWidth: 0,
			y: 10,
	        y2: 20,
	        x: 40,
	        x2: 10
	    },
	    tooltip : {
	        trigger: 'axis',
	        axisPointer : {
	            type : 'shadow'
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
	            data : [ // '총인원','출근','퇴근','지각','결근'
	            	dataManager.getString("Str_Total"),
	            	dataManager.getString("Str_TNAIn"),
	            	dataManager.getString("Str_TNAOut"),
	            	dataManager.getString("Str_TNALate"),
	            	dataManager.getString("Str_TNAAbsence"),
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
	            name:'TNA',
	            type:'bar',
	            stack: 'Count',
	            itemStyle:{
	                normal:{
	                    barBorderColor:'rgba(0,0,0,0)',
	                    color:'rgba(0,0,0,0)'
	                },
	                emphasis:{
	                    barBorderColor:'rgba(0,0,0,0)',
	                    color:'rgba(0,0,0,0)'
	                }
	            },
	            data:[0, 0, 0, 0, 0]
	        },
	        {
	            name:'TNA',
	            type:'bar',
	            stack: 'Count',
	            itemStyle : { normal:{ color: '#4CBBB9', label : {show: true, position: 'inside'}}},
	            data:[0, 0, 0, 0, 0]
	        }
	    ]
	};
	
	todayTnaChart.setOption(option);
	
}


/**
 * 당일 인증 차트에 값을 세팅합니다.
 * @param options 문자열 배열 (배열 size 5)
 */
exports.setShellTodayTna = function(options){
	if (todayTnaChart) {
		var barBorder = options[0];
		todayTnaChart.setOption( {
			series: [
				{
		            data:[
		            	0,
		            	barBorder=barBorder-options[1],
		            	barBorder=barBorder-options[2],
		            	barBorder=barBorder-options[3],
		            	0		            	
		            ]
		        },
		        {
		            data:[
		            	options[0],
		            	options[1],
		            	options[2],
		            	options[3],
		            	options[4],
		            ]
		        }
			]
		});
	}
}