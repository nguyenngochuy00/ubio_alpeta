/************************************************
 * AuthLogToday.js
 * Created at 2020. 3. 10. 오후 12:10:06.
 *
 * @author blue1
 ************************************************/

var todayAuthChart = null;

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
function onDASHB_shlTodayAuthInit(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var dASHB_shlTodayAuth = e.control;
	
	if (todayAuthChart) {
		e.preventDefault();
	}	
}


/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onDASHB_shlTodayAuthLoad(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var dASHB_shlTodayAuth = e.control;
	
	var shellDiv = e.content;
	
	todayAuthChart = echarts.init(shellDiv);
	
	var option = {
		title: {
        	x: 'center',
        	// text: 'Today Auth'
        },
        grid: {
	        borderWidth: 0,
	        y: 40,
	        y2: 5,
	        x: 5,
	        x2: 5
    	},
    	xAxis: [
	        {
	            type: 'category',
	            show: false,
	            data: ['Total', 'Success', 'Fail', 'FP', 'Card', 'PW', 'Face']
	        }
	    ],
	    yAxis: [
	        {
	            type: 'value',
	            show: false
	        }
	    ],
	    series: [
        	{
        		name: 'TodayAuth',
            	type: 'bar',
            	itemStyle: {
	                normal: {
	                    color: function(params) {
	                        var colorList = ['#584fbc','#17b0b3','#ea507d','#cf5d5f','#5fa5cb','#e79916','#5ac52f'];
	                        return colorList[params.dataIndex]
	                    },
	                    label: {
	                        show: true,
	                        position: 'top',
	                        formatter: '{b}\n{c}'
	                    }
	                }
	            },
	            data: [0,0,0,0,0,0,0],
	            // data: [3000,2300,700,2000,100,200,700],
            	markPoint: {
            		data: [
            			{xAxis:0, y: 350, name:'Total', symbolSize:20},
            			{xAxis:1, y: 350, name:'Success', symbolSize:20},
            			{xAxis:2, y: 350, name:'Fail', symbolSize:20},
            			{xAxis:3, y: 350, name:'FP', symbolSize:20},
            			{xAxis:4, y: 350, name:'Card', symbolSize:20},
            			{xAxis:5, y: 350, name:'PW', symbolSize:20},
            			{xAxis:6, y: 350, name:'Face', symbolSize:20},
            		]
            	}
            }]
	};
	
	todayAuthChart.setOption(option);
}


/**
 * 당일 인증 차트에 값을 세팅합니다.
 * @param options 문자열 배열 (배열 size 7)
 */
exports.setShellTodayAuth = function(options){
	// 당일 인증 차트
	if (todayAuthChart) {
		todayAuthChart.setOption( {
			series: [{
        		name: 'TodayAuth',
            	type: 'bar',
            	data: [
            		options[0],
            		options[1],
            		options[2],
            		options[3],
            		options[4],
            		options[5],
            		options[6]
            	]
            }]
		});
	}

}


/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var date = new Date();
	var today = app.lookup("DASHB_optToday");
	today.value = "[" + date.getFullYear() + "-" + (date.getMonth() + 1).zf(2) + "-" + date.getDate().zf(2) + "]";
}
