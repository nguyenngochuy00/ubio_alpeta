/************************************************
 * DataServerMEM.js
 * Created at 2020. 3. 11. 오후 6:02:58.
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

var dsMEMChart = null;

var dsUsedMemStyle = {
    normal : {    
    	color: '#E84684',
        label: {
        	formatter:'{c}%',
        	show:true,
        	position:'inside',
        	fontSize:10
        },
        labelLine: {show:false}
    }
};

var dsFreeMemStyle = {
    normal : {    
    	color: '#4ab5ab',
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
function onDASHB_shlDSMEMInit(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var dASHB_shlDSMEM = e.control;
	if (dsMEMChart) {
		e.preventDefault();
	}
}


/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onDASHB_shlDSMEMLoad(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var dASHB_shlDSMEM = e.control;
	
	if (dsMEMChart) {
		return;
	}

	var shellDiv = e.content;
	
	dsMEMChart = echarts.init(shellDiv);	

	var option = {
		title:{text: 'Memory\nUsage',left: 'center',top: 'center',textStyle:{color: '#FFF'}},
		legend: {
        	orient: 'vertical',
        	x: 'left',
        	data:['Used','Free']
    	},
    	series : [    		
    		{	            
    			name : 'dsmem',
            	type: 'pie',	   
	            radius : ['50%', '75%'],
	            data:[
	                {name:'Used', value:0,itemStyle : dsUsedMemStyle},
	                {name:'Free', value:0,itemStyle : dsFreeMemStyle}
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

	dsMEMChart.setOption(option);
	
}

/**
 * Memory 차트에 값을 세팅합니다.
 * @param used, free
 */
exports.setDSMemChart = function(used, free){
	// 당일 인증 차트
	if (dsMEMChart) {
		dsMEMChart.setOption({
			series: [{
				name : 'dsmem',
				type : 'pie',
				data : [
					{name:'Used', value:used, itemStyle:dsUsedMemStyle},
					{name:'Free', value:free, itemStyle:dsFreeMemStyle},
				]
			}]
		});
	}
}
