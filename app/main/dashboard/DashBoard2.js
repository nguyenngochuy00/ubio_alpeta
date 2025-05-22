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
/***** CS 메모리 미사용량 *****/
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
	//console.log(status);
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
		
		//console.log("DSCPU = ", dsUsedCPU, dsFreeCPU);
		if (dsUsedCPU < 0 || dsUsedCPU > 100) {
			dsUsedCPU = Math.floor(Math.random() * 9) + 20
			dsFreeCPU = 100 - dsUsedCPU;
		}
	
//		var option = getOption(dsUsedCPU, dsFreeCPU);
//		dsCPUChart.setOption(option);
		dsCPUChart.setOption({
			series: [{
				name : 'dscpu',
				type : 'pie',
				data : [
					{name:'Used', value:dsUsedCPU, itemStyle:dsUsedCPUStyle},
					{name:'Free', value:dsFreeCPU, itemStyle:dsFreeCPUStyle},
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
				name : 'dsmem',
				type : 'pie',
				data : [
					{name:'Used', value:dsUsedMem, itemStyle:dsUsedMemStyle},
					{name:'Free', value:dsFreeMem, itemStyle:dsFreeMemStyle},
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
				name : 'cscpu',
				type : 'pie',
				data : [
					{name:'Used', value:csUsedMem, itemStyle:csUsedMemStyle},
					{name:'Free', value:csFreeMem, itemStyle:csFreeMemStyle},
				]
			}]
		});
	}
	
	if (csCPUChart) {
		var csUsedCPU = Math.floor(100-status.CSInfo.idleCPU);
		var csFreeCPU = Math.floor(status.CSInfo.idleCPU);
		
		//console.log("CSCPU = ", csUsedCPU, csFreeCPU);
		if (csUsedCPU < 0 || csUsedCPU > 100) {
			csUsedCPU = Math.floor(Math.random() * 9) + 20
			csFreeCPU = 100 - csUsedCPU;
		}
		
		csCPUChart.setOption({
			series: [{
				name:'csmem',
				type : 'pie',
				data : [
					{name:'Used', value:csUsedCPU, itemStyle:csUsedCPUStyle},
					{name:'Free', value:csFreeCPU, itemStyle:csFreeCPUStyle},
				]
			}]
		});		
	}
	
	if( fpAuthChart ){
		if( status.FPStatInfo.fpReqCount && status.FPStatInfo.fpProcessTime ){
			var fpReqCount = [];
			var startMinute = status.FPStatInfo.curMinute - 9;
			if (  startMinute < 0 )
				startMinute += 60;
			var avgReq = 0;
			var avgProcess = 0;
			for( var i = 0; i < 10; i++ ){
				var index = startMinute+i;
				if( index >59  ){
					index -= 60;
				}
				if (status.FPStatInfo.fpReqCount[index]){
					fpReqCount[i] = status.FPStatInfo.fpReqCount[index];
				} else{
					fpReqCount[i] = 0;
				}
				avgReq += fpReqCount[i];
				
				if (status.FPStatInfo.fpReqCount[index]){
					avgProcess += status.FPStatInfo.fpProcessTime[index];
				} else {
					avgProcess += 0;
				}			
			} 
			avgProcess = avgProcess/avgReq;
			if(avgReq == 0){
				avgProcess = 0;
			}
			//app.lookup("DASHB_opbFPAvgReq").value = Math.ceil(avgReq/10);
			app.lookup("DASHB_opbFPAvgReq").value =  Math.ceil(avgProcess)+"ms";
			app.lookup("DASHB_optTemplateCount").value =  numberWithCommas(status.FPStatInfo.fpTotal);
			
			
			fpAuthChart.setOption({			 
				series: [
	        		{
	            		name:'처리',
			            type:'line',            
			            data:[
			            	fpReqCount[0],
			            	fpReqCount[1],
			            	fpReqCount[2],
			            	fpReqCount[3],
			            	fpReqCount[4],
			            	fpReqCount[5],
			            	fpReqCount[6],
			            	fpReqCount[7],
			            	fpReqCount[8],
			            	fpReqCount[9],            	
						]
					}
				]
			});	
		}else{
			app.lookup("DASHB_opbFPAvgReq").value =  0+"ms";
			app.lookup("DASHB_optTemplateCount").value =  0;			
			
			fpAuthChart.setOption({series: [{name:'처리',type:'line',data:[0,0,0,0,0,0,0,0,0,0]}]});	
		}	
	}
};
var test = 10;

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
		title:{text: 'Memory\nUsage',left: 'center',top: 'center',textStyle:{color: '#FFF'}},	
		legend: {
        	orient: 'vertical',
        	x: 'left',
        	data:['Used','Free']
    	},	
    	series : [    		
        	{	          
        		name:'dsmem',  
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
	            label:{
	            	position:'inside'
	            }
	        },
    		{   
	            type: 'pie',            
	            radius: ['0%', "52%"],
	            hoverAnimation:false,
	            labelLine:{normal:{show: false}},
	            data: [{value: 0,itemStyle:{normal:{color: "rgba(76,76,76,255)"}}},]
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
		title:{text: 'Memory\nUsage',left: 'center',top: 'center',textStyle:{color: '#FFF'}},		
		legend: {
        	orient: 'vertical',
        	x: 'left',
        	data:['Used','Free']
    	},
    	series : [    		
			{
				name:'csmem',
				type: 'pie',
				radius : ['50%', '75%'],
				data:[
					{name: 'Used', value:0,itemStyle : csUsedMemStyle},
					{name: 'Free', value:0,itemStyle : csFreeMemStyle}
				],
				label:{
					position:'inside'
				}
			},
			{   
	            type: 'pie',            
	            radius: ['0%', "52%"],
	            hoverAnimation:false,
	            labelLine:{normal:{show: false}},
	            data: [{value: 0,itemStyle:{normal:{color: "rgba(76,76,76,255)"}}},]
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
    	
    tooltip: {
        trigger: 'axis'
    },
    grid: {
        left: '10%',
        right: '4%',
        top: '4%',
        bottom: '4%'
    },   
    xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['','','','','','','','','','']
    },
    yAxis: {
        type: 'value'
    },
    series: [
        {
            name:'인증 횟수',
            type:'line',            
            data:[0, 0, 0, 0, 0, 0, 0]
        }
    ]
	};

	fpAuthChart.setOption(option);
}



/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
}

