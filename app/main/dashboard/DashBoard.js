/************************************************
 * DashBoard.js
 * Created at 2019. 2. 7. 오후 1:52:39.
 *
 * @author fois
 ************************************************/

var dsCPUChart = null;
var dsMemChart = null;
var csCPUChart = null;
var csMemChart = null;

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
exports.setServiceStatus = function( status ) {
	//console.log(status);
	var userCount = app.lookup("DASHB_optUserCount");	
	userCount.value = numberWithCommas(status.dsInfo.DBStat.User.curCnt);
	
	var userUsed = app.lookup("DASHB_optUserUsed");
	var userPercent = status.dsInfo.DBStat.User.curCnt * 100 / 200000;
	//userUsed.value = userPercent.toFixed(1) + "% Used";
	userUsed.value = Math.floor(userPercent) + "% Used";
	
	var terminalCount = app.lookup("DASHB_optTerminalCount");	
	terminalCount.value = numberWithCommas(status.dsInfo.DBStat.Term.curCnt);
	
	var terminalUsed = app.lookup("DASHB_optTerminalUsed");
	var terminalPercent = status.dsInfo.DBStat.Term.curCnt * 100 / 3000;
	//terminalUsed.value = terminalPercent.toFixed(1) + "% Used";
	terminalUsed.value = Math.floor(terminalPercent) + "% Used";
		
	if(dsCPUChart){
		var dsUsedCPU = Math.floor(100-status.dsInfo.SystemStat.idleCPU);
		var dsFreeCPU = Math.floor(status.dsInfo.SystemStat.idleCPU);
				
		var option = getOption(dsUsedCPU,dsFreeCPU);
		dsCPUChart.setOption(option);
    }
	
    if(dsMemChart){
    	var dsUsedMem = Math.floor(status.dsInfo.SystemStat.usedMemory);
		var dsFreeMem = Math.floor(100-status.dsInfo.SystemStat.usedMemory);
		
		var option = getOption(dsUsedMem,dsFreeMem);
		dsMemChart.setOption(option);
    }
    
	if(csCPUChart){
		var csUsedCPU = Math.floor(100-status.csInfo.idleCPU);
		var csFreeCPU = Math.floor(status.csInfo.idleCPU);
			
		var option = getOption(csUsedCPU,csFreeCPU);
		csCPUChart.setOption(option);
    }
    
    if(csMemChart){
    	var csUsedMem = Math.floor(status.csInfo.usedMemory);
		var csFreeMem = Math.floor(100-status.csInfo.usedMemory);
		
		var option = getOption(csUsedMem,csFreeMem);
		csMemChart.setOption(option);
    }
};

// 쉘에서 init 이벤트 발생 시 호출.
function onDASHB_shlDSCPUInit(/* cpr.events.CUIEvent */ e){
	/* @type cpr.controls.UIControlShell */
	var dASHB_shlDSCPU = e.control;
	if(dsCPUChart){
		e.preventDefault();
	}	
}

// 쉘에서 load 이벤트 발생 시 호출.
function onDASHB_shlDSCPULoad(/* cpr.events.CUIEvent */ e){
	/* @type cpr.controls.UIControlShell */
		
	if(dsCPUChart){
		return;
	}
	var dASHB_shlDSCPU = e.control;
	var shellDiv = e.content;
	
	dsCPUChart = echarts.init(shellDiv);	

	var option = {  		
    	series : [
        	{	            
	            type: 'pie',	   
	            radius : ['90%', '20%'],
	            data:[
	                {name:'Used', value:10,itemStyle : usedStyle},
	                {name:'Free', value:90,itemStyle : freeStyle}
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

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 쉘에서 init 이벤트 발생 시 호출.
function onDASHB_shlDSMEMInit(/* cpr.events.CUIEvent */ e){
	/* @type cpr.controls.UIControlShell */
	var dASHB_shlDSMEM = e.control;
	if(dsMemChart){
		e.preventDefault();
	}	
}

// 쉘에서 load 이벤트 발생 시 호출.
function onDASHB_shlDSMEMLoad(/* cpr.events.CUIEvent */ e){
	
	if(dsMemChart){
		return;
	}
	
	/* @type cpr.controls.UIControlShell */
	var dASHB_shlDSMEM = e.control;
	var shellDiv = e.content;
	
	dsMemChart = echarts.init(shellDiv);	

	var option = {  		
    	series : [
        	{	            
	            type: 'pie',	   
	            radius : ['90%', '20%'],
	            data:[
	                {name:'Used', value:10,itemStyle : usedStyle},
	                {name:'Free', value:90,itemStyle : freeStyle}
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

// 쉘에서 init 이벤트 발생 시 호출.
function onDASHB_shlCSCPUInit(/* cpr.events.CUIEvent */ e){
	/* @type cpr.controls.UIControlShell */
	var dASHB_shlCSCPU = e.control;
	if(csCPUChart){
		e.preventDefault();
	}	
}

// 쉘에서 load 이벤트 발생 시 호출.
function onDASHB_shlCSCPULoad(/* cpr.events.CUIEvent */ e){
	
	if(csCPUChart){
		return;
	}
	
	/* @type cpr.controls.UIControlShell */
	var dASHB_shlCSCPU = e.control;
	var shellDiv = e.content;
	
	csCPUChart = echarts.init(shellDiv);	

	var option = {  		
    	series : [
        	{	            
	            type: 'pie',	   
	            radius : ['90%', '20%'],
	            data:[
	                {name:'Used', value:10,itemStyle : usedStyle},
	                {name:'Free', value:90,itemStyle : freeStyle}
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

// 쉘에서 init 이벤트 발생 시 호출.
function onDASHB_shlCSMEMInit(/* cpr.events.CUIEvent */ e){
	/* @type cpr.controls.UIControlShell */
	var dASHB_shlCSMEM = e.control;	
	if(csMemChart){
		e.preventDefault();
	}	
}

// 쉘에서 load 이벤트 발생 시 호출.
function onDASHB_shlCSMEMLoad(/* cpr.events.CUIEvent */ e){
		
	if(csMemChart){
		return;
	}
	
	/* @type cpr.controls.UIControlShell */
	var dASHB_shlCSMEM = e.control;
	var shellDiv = e.content;
	
	csMemChart = echarts.init(shellDiv);	

	var option = {  		
    	series : [
        	{	            
	            type: 'pie',	   
	            radius : ['90%', '20%'],
	            data:[
	                {name:'Used', value:10,itemStyle : usedStyle},
	                {name:'Free', value:90,itemStyle : freeStyle}
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
