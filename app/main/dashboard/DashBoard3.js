/************************************************
 * DashBoard2.js
 * Created at 2019. 2. 27. 오전 10:46:50.
 *
 * @author b
 ************************************************/

var dsCPUChart = null;
var dsMemChart = null;
var csCPUChart = null;
var csMemChart = null;
var dsMemLine = null;

var fpAuthChart = null;
/*
var usedStyle = {
    normal : {    
    	color: 'rgba(250,40,111,255)',
        label: {
        	formatter:'{c}%',
        	show:true,
        	position:'inside',
        	fontSize:10
        },
        labelLine: {show:false}
    }
    
};

var freeStyle = {
    normal : {
        color: 'rgba(70,199,171,255)',
        label: {
        	formatter:'{c}%',
        	show:true,
        	position:'inside',
        	fontSize:10
        },
        labelLine: {show:false}
    }
};
*/
/***** DS 메모리 사용량 *****/
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
/***** DS 메모리 미사용량 *****/
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

/***** CS 메모리 사용량 *****/
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
/***** DS 메모리 미사용량 *****/
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

/***** CS CPU 사용량 *****/
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
/***** CS CPU 미사용량 *****/
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
function getOption( usedValue, freeValue ){
	var option = {    	
    	series : [
        	{	            
	            type: 'pie',	            
	            data:[
	            	{name:'Used', value:usedValue,itemStyle : usedStyle},
	                {name:'Free', value:freeValue,itemStyle : freeStyle}	                	                
	            ]
	        }
    	]
	};
	return option
}
*/

exports.setServiceStatus = function( status ) {
	console.log(status);
	var userCount = app.lookup("DASHB_optUserCount");
	userCount.value = numberWithCommas(status.DSInfo.DBStat.User.curCnt);
	
	var userUsed = app.lookup("DASHB_optUserUsed");
	var userPercent = status.DSInfo.DBStat.User.curCnt * 100 / 200000;
	userUsed.value = Math.floor(userPercent);
	
	var terminalCount = app.lookup("DASHB_optTerminalCount");
	terminalCount.value = numberWithCommas(status.DSInfo.DBStat.Term.curCnt);
	
	var terminalUsed = app.lookup("DASHB_optTerminalUsed");
	var terminalPercent = status.DSInfo.DBStat.Term.curCnt * 100 / 2000;
	terminalUsed.value = Math.floor(terminalPercent);
	
	if (dsCPUChart) {
		var dsUsedCPU = Math.floor(100-status.DSInfo.SystemStat.idleCPU); 
		var dsFreeCPU = Math.floor(status.DSInfo.SystemStat.idleCPU);
	
//		var option = getOption(dsUsedCPU, dsFreeCPU);
//		dsCPUChart.setOption(option);
		dsCPUChart.setOption({
			series: [{
				tpye : 'pie',
				data : [
					{name:'Used', value:dsUsedCPU, itemStyle:dsUsedCPUStyle},
					{name:'Used', value:dsFreeCPU, itemStyle:dsFreeCPUStyle},
				]
			}]
		});
	}
	
	if (dsMemChart) {
		var dsUsedMem = Math.floor(status.DSInfo.SystemStat.usedMemory);
		var dsFreeMem = Math.floor(100-status.DSInfo.SystemStat.usedMemory);
		
//		var option = getOption(dsUsedMem, dsFreeMem);
		dsMemChart.setOption({
			series: [{
				tpye : 'pie',
				data : [
					{name:'Used', value:dsUsedMem, itemStyle:dsUsedMemStyle},
					{name:'Used', value:dsFreeMem, itemStyle:dsFreeMemStyle},
				]
			}]
		});
		
	}
	
	if (csMemChart) {
		var csUsedMem = Math.floor(status.CSInfo.usedMemory);
		var csFreeMem = Math.floor(100-status.CSInfo.usedMemory);

//		var option = getOption(csUsedMem, csFreeMem);
		//csMemChart.setOption(option);
		csMemChart.setOption({
			series: [{
				tpye : 'pie',
				data : [
					{name:'Used', value:csUsedMem, itemStyle:csUsedMemStyle},
					{name:'Used', value:csFreeMem, itemStyle:csFreeMemStyle},
				]
			}]
		});
	}
	
	if (csCPUChart) {
		var csUsedCPU = Math.floor(100-status.CSInfo.idleCPU);
		var csFreeCPU = Math.floor(status.CSInfo.idleCPU);
		csCPUChart.setOption({
			series: [{
				tpye : 'pie',
				data : [
					{name:'Used', value:csUsedCPU, itemStyle:csUsedCPUStyle},
					{name:'Used', value:csFreeCPU, itemStyle:csFreeCPUStyle},
				]
			}]
		});
//		var option = getOption(csUsedCPU, csFreeCPU);
//		csCPUChart.setOption(option);
		
	}
};


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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
    	series : [
        	{	            
	            type: 'pie',	   
	            radius : ['50%', '70%'],
	            data:[
	                {name:'Used', value:0,itemStyle : dsUsedCPUStyle},
	                {name:'Free', value:0,itemStyle : dsFreeCPUStyle}
	            ],
	            label:{
	            	position:'inside'
	            }
	        }
    	],
    	textStyle:{
    		color:'#fff'
    	}
	};

	dsCPUChart.setOption(option);
}


/*
 * 쉘에서 init 이벤트 발생 시 호출.
 */
function onDASHB_shlDSMEMInit(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var dASHB_shlDSMEM = e.control;
	if (dsMemChart) {
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
	 if (dsMemChart) {
	 	return;
	 }
	 
	var dASHB_shlDSMEM = e.control;
	var shellDiv = e.content;
	
	dsMemChart = echarts.init(shellDiv);	

	var option = {  		
    	series : [
        	{	            
	            type: 'pie',	   
	            radius : ['50%', '70%'],
	            data:[
	                {name:'Used', value:0,itemStyle : dsUsedMemStyle},
	                {name:'Free', value:0,itemStyle : dsFreeMemStyle}
	            ],
	            label:{
	            	position:'inside'
	            }
	        }
    	],
    	textStyle:{
    		color:'#fff'
    	}
	};

	dsMemChart.setOption(option);
}


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
	if(csCPUChart){
		return;
	}
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var dASHB_shlCSCPU = e.control;
	var shellDiv = e.content;
	
	csCPUChart = echarts.init(shellDiv);	

	var option = {  		
    	series : [
        	{	            
	            type: 'pie',	   
	            radius : ['50%', '70%'],
	            data:[
	                {name:'Used', value:0,itemStyle : csUsedCPUStyle},
	                {name:'Free', value:0,itemStyle : csFreeCPUStyle}
	            ],
	            label:{
	            	position:'inside'
	            }
	        }
    	],
    	textStyle:{
    		color:'#fff'
    	}
	};

	csCPUChart.setOption(option);
}


/*
 * 쉘에서 init 이벤트 발생 시 호출.
 */
function onDASHB_shlCSMEMInit(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var dASHB_shlCSMEM = e.control;
	if (csMemChart) {
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
	// if (csMemChart) {
	// 	return;
	 //}
	var dASHB_shlCSMEM = e.control;
	var shellDiv = e.content;
	
	csMemChart = echarts.init(shellDiv);
	
	var option = {
		series : [
			{
				type: 'pie',
				radius : ['50%','70%'],
				data:[
					{name: 'Used', value:0,itemStyle : csUsedMemStyle},
					{name: 'Free', value:0,itemStyle : csFreeMemStyle}
				],
				label:{
					position:'inside'
				}
			}
		],
		textStyle:{
			color:'#fff'
		}
	};
	
	csMemChart.setOption(option);
	
}



/*
 * 쉘에서 init 이벤트 발생 시 호출.
 */
function onDASHB_shlDSMEMLINEInit(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var dASHB_shlDSMEMLINE = e.control;
	if(dsMemLine) {
		e.preventDefault();
	}
}


/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onDASHB_shlDSMEMLINELoad(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var dASHB_shlDSMEMLINE = e.control;
	var shellDiv = e.content;
	var test = app.lookup("MemLine").getValue(0, "value");
	dsMemLine = echarts.init(shellDiv);
	
	var option = {
		xAxis: {
			type: 'category',
			data: ['1','2','3','4','5','6']
		},
		yAxis: {
			type: 'value'
		},
		series: [{
			data: [test, test+1, test+10, test+30, test-50],
			type: 'line',
			smooth: true
		}
		]
	};
	
	dsMemLine.setOption(option);
	
}

// 지문 인증 차트 쉘 init 이벤트 발생 
function onDASHB_shlFPAuthChartInit(/* cpr.events.CUIEvent */ e){
	if(fpAuthChart){e.preventDefault();}
}

// 지문 인증 차트 쉘 load 이벤트 발생 
function onDASHB_shlFPAuthChartLoad(/* cpr.events.CUIEvent */ e){
	if(fpAuthChart){return;}

	var shellDiv = e.content;	
	fpAuthChart = echarts.init(shellDiv);	

	var option = {  		
    	title: {
        text: 'title'
    },
    tooltip: {
        trigger: 'axis'
    },
    legend: {
        data:['legend1','legend2']
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    toolbox: {
        feature: {
            saveAsImage: {}
        }
    },
    xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['xAxis1','xAxis2']
    },
    yAxis: {
        type: 'value'
    },
    series: [
        {
            name:'name1',
            type:'line',
            stack: 'stack1',
            data:[120, 132, 101, 134, 90, 230, 210]
        },        
        {
            name:'name2',
            type:'line',
            stack: 'stack2',
            data:[820, 932, 901, 934, 1290, 1330, 1320]
        }
    ]
	};

	fpAuthChart.setOption(option);
}

