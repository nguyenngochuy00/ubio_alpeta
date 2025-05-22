/************************************************
 * DataServerCPU.js
 * Created at 2020. 3. 11. 오후 6:01:16.
 *
 * @author blue1
 ************************************************/

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};


var dsCPUChart = null;

/***** DS CPU 사용량 *****/
var dsUsedCPUStyle = {
    normal : {    
    	color: '#F1735B',
        label: {
        	formatter:'{c}%',
        	show:true,
        	position:'inside',
        	fontSize:10
        },
        labelLine: {show:false}
    }
};
/***** DS CPU 미사용량 *****/
var dsFreeCPUStyle = {
    normal : {    
    	color: '#94CB76',
        label: {
        	formatter:'{c}%',
        	show:true,
        	position:'inside',
        	fontSize:10
        },
        labelLine: {show:false}
    }
};

/*
 * 쉘에서 init 이벤트 발생 시 호출.
 */
function onDASHB_shlDSCPUInit(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var dASHB_shlDSCPU = e.control;
	if (dsCPUChart) {
		e.preventDefault();
	}
}


/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onDASHB_shlDSCPULoad(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var dASHB_shlDSCPU = e.control;
	
	if (dsCPUChart) {
		return;
	}

	var shellDiv = e.content;
	
	dsCPUChart = echarts.init(shellDiv);	

	var option = {
		title:{text: 'CPU\nUsage',left: 'center',top: 'center',textStyle:{color: '#FFF'}},
		legend: {
        	orient: 'vertical',
        	x: 'left',
        	data:['Used','Free']
    	},
    	series : [    		
    		{	            
    			name : 'dscpu',
            	type: 'pie',	   
	            radius : ['50%', '75%'],
	            data:[
	                {name:'Used', value:0,itemStyle : dsUsedCPUStyle},
	                {name:'Free', value:0,itemStyle : dsFreeCPUStyle}
	            ],
            	label:{position:'inside'}
        	},
        	{   
	            type: 'pie',            
	            radius: ['0%', "52%"],
	            hoverAnimation:false,
	            labelLine:{normal:{show: false}},
	            data: [{value: 0,itemStyle:{normal:{color: "rgba(76,76,76,255)"}}},]
			},
    	],
    	textStyle:{color:'#fff'}
	};

	dsCPUChart.setOption(option);
}



/**
 * CPU 차트에 값을 세팅합니다.
 * @param used, free
 */
exports.setDSCpuChart = function(used, free){
	// 당일 인증 차트
	if (dsCPUChart) {
		dsCPUChart.setOption({
			series: [{
				name : 'dscpu',
				type : 'pie',
				data : [
					{name:'Used', value:used, itemStyle:dsUsedCPUStyle},
					{name:'Free', value:free, itemStyle:dsFreeCPUStyle},
				]
			}]
		});
	}
}
