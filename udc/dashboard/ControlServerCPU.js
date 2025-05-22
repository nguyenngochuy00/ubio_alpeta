/************************************************
 * ControlServerCPU.js
 * Created at 2020. 3. 11. 오후 6:38:54.
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

var csCPUChart = null;

var csUsedCPUStyle = {
    normal : {    
    	color: '#CF6F82',
        label: {
        	formatter:'{c}%',
        	show:true,
        	position:'inside',
        	fontSize:10
        },
        labelLine: {show:false}
    }
};

var csFreeCPUStyle = {
    normal : {    
    	color: '#345C80',
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
function onDASHB_shlCSCPUInit(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var dASHB_shlCSCPU = e.control;
	if (csCPUChart) {
		e.preventDefault();
	}
}


/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onDASHB_shlCSCPULoad(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var dASHB_shlCSCPU = e.control;
	
	if (csCPUChart) {
		return;
	}

	var shellDiv = e.content;
	
	csCPUChart = echarts.init(shellDiv);	

	var option = {
		title:{text: 'CPU\nUsage',left: 'center',top: 'center',textStyle:{color: '#FFF'}},
		legend: {
        	orient: 'vertical',
        	x: 'left',
        	data:['Used','Free']
    	},
    	series : [    		
    		{	            
    			name : 'cscpu',
            	type: 'pie',	   
	            radius : ['50%', '75%'],
	            data:[
	                {name:'Used', value:0,itemStyle : csUsedCPUStyle},
	                {name:'Free', value:0,itemStyle : csFreeCPUStyle}
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

	csCPUChart.setOption(option);
}

/**
 * CPU 차트에 값을 세팅합니다.
 * @param used, free
 */
exports.setCSCpuChart = function(used, free){
	// 당일 인증 차트
	if (csCPUChart) {
		csCPUChart.setOption({
			series: [{
				name : 'cscpu',
				type : 'pie',
				data : [
					{name:'Used', value:used, itemStyle:csUsedCPUStyle},
					{name:'Free', value:free, itemStyle:csFreeCPUStyle},
				]
			}]
		});
	}
}
