/************************************************
 * ControlServerMEM.js
 * Created at 2020. 3. 11. 오후 6:39:14.
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

var csMEMChart = null;

var csUsedMemStyle = {
    normal : {    
    	color: '#C29AC7',
        label: {
        	formatter:'{c}%',
        	show:true,
        	position:'inside',
        	fontSize:10
        },
        labelLine: {show:false}
    }
};

var csFreeMemStyle = {
    normal : {    
    	color: '#52C6D4',
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
function onDASHB_shlCSMEMInit(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var dASHB_shlCSMEM = e.control;
	if (csMEMChart) {
		e.preventDefault();
	}
}


/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onDASHB_shlCSMEMLoad(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var dASHB_shlCSMEM = e.control;
	if (csMEMChart) {
		return;
	}

	var shellDiv = e.content;
	
	csMEMChart = echarts.init(shellDiv);	

	var option = {
		title:{text: 'Memory\nUsage',left: 'center',top: 'center',textStyle:{color: '#FFF'}},
		legend: {
        	orient: 'vertical',
        	x: 'left',
        	data:['Used','Free']
    	},
    	series : [    		
    		{	            
    			name : 'csmem',
            	type: 'pie',	   
	            radius : ['50%', '75%'],
	            data:[
	                {name:'Used', value:0,itemStyle : csUsedMemStyle},
	                {name:'Free', value:0,itemStyle : csFreeMemStyle}
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

	csMEMChart.setOption(option);
}

/**
 * Memory 차트에 값을 세팅합니다.
 * @param used, free
 */
exports.setCSMemChart = function(used, free){
	// 당일 인증 차트
	if (csMEMChart) {
		csMEMChart.setOption({
			series: [{
				name : 'csmem',
				type : 'pie',
				data : [
					{name:'Used', value:used, itemStyle:csUsedMemStyle},
					{name:'Free', value:free, itemStyle:csFreeMemStyle},
				]
			}]
		});
	}
}
