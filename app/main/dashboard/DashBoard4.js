/************************************************
 * DashBoard4.js
 * Created at 2020. 2. 18. 오후 4:42:57.
 *
 * @author blue1
 ************************************************/
var dsCPUChart = null;
var dsMemChart = null;
var csCPUChart = null;
var csMemChart = null;
var todayAuthChart = null;

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





function numberWithCommas(x) {
	// console.log(x);
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

String.prototype.string = function (len) { var s = '', i = 0; while (i++ < len) { s += this; } return s; };
String.prototype.zf = function (len) { return "0".string(len - this.length) + this; };
Number.prototype.zf = function (len) { return this.toString().zf(len); };

function secondsToDateString(seconds){
	 var date = new Date(seconds*1000);
	 return date.getFullYear() + "-" + (date.getMonth() + 1).zf(2) + "-" + date.getDate().zf(2);
}

exports.setServiceStatus = function( status ) {

	//console.log(status);
	// 사용자
	var userCount = app.lookup("DASHB_optUserCount");
	userCount.value = numberWithCommas(status.DSInfo.DBStat.User.curCnt);
	
	var userUsed = app.lookup("DASHB_optUserUsed");
	var userPercent = status.DSInfo.DBStat.User.curCnt * 100 / 200000;
	userUsed.value = Math.floor(userPercent);
	
	// 단말기
	var terminalCount = app.lookup("DASHB_optTerminalCount");
	terminalCount.value = numberWithCommas(status.DSInfo.DBStat.Term.curCnt);
	
	var terminalUsed = app.lookup("DASHB_optTerminalUsed");
	var terminalPercent = status.DSInfo.DBStat.Term.curCnt * 100 / 2000;
	terminalUsed.value = Math.floor(terminalPercent);
	
	// 그룹
	var groupCount = app.lookup("DASHB_optGroupCount");
	groupCount.value = numberWithCommas(status.DSInfo.DBStat.Group.curCnt);
	
	var groupUsed = app.lookup("DASHB_optGroupUsed");
	var groupPercent = status.DSInfo.DBStat.Group.curCnt * 100 / 1000;
	groupUsed.value = Math.floor(groupPercent);
	
	// 츌압구륩
	var accessGroupCount = app.lookup("DASHB_optAccessGroupCount");
	accessGroupCount.value = numberWithCommas(status.DSInfo.DBStat.AccessGroup.curCnt);
	
	var accessGroupUsed = app.lookup("DASHB_optAccessGroupUsed");
	var accessGroupPercent = status.DSInfo.DBStat.AccessGroup.curCnt * 100 / 1000;
	accessGroupUsed.value = Math.floor(accessGroupPercent);
	
	//직급
	var positionCount = app.lookup("DASHB_optPositionCount");
	positionCount.value = numberWithCommas(status.DSInfo.DBStat.Position.curCnt);
	
	var positionUsed = app.lookup("DASHB_optPositionUsed");
	var positionPercent = status.DSInfo.DBStat.Position.curCnt * 100 / 200;
	positionUsed.value = Math.floor(positionPercent);
	

	// 인증 로그
	var authCount = app.lookup("DASHB_optAuthCount");
	authCount.value = numberWithCommas(status.DSInfo.DBStat.AuthLog.curCnt);
	
	var authTimeStr = secondsToDateString(status.DSInfo.DBStat.AuthLog.StartTime.seconds);
	var authTime = app.lookup("DASHB_optAuthStartTime");
	authTime.value = authTimeStr;
	
	// 시스템 로그
	var auditCount = app.lookup("DASHB_optAuditCount");
	auditCount.value = numberWithCommas(status.DSInfo.DBStat.AuditLog.curCnt);
	
	var auditTimeStr = secondsToDateString(status.DSInfo.DBStat.AuditLog.StartTime.seconds);
	var auditTime = app.lookup("DASHB_optAuditStartTime"); 
	auditTime.value = auditTimeStr;
	
	// 이벤트 로그
	var eventCount = app.lookup("DASHB_optEventCount");
	eventCount.value = numberWithCommas(status.DSInfo.DBStat.EventLog.curCnt);
	
	var eventStartTime = secondsToDateString(status.DSInfo.DBStat.EventLog.StartTime.seconds);
	var eventTime = app.lookup("DASHB_optEventStartTime");
	eventTime.value = eventStartTime;
	
	// 인증로그 당일
	var todayAuthUserCount = app.lookup("DASHB_optTodayAuthUserCount");
	todayAuthUserCount.value = numberWithCommas(status.DSInfo.DBStat.AuthLog.todayUserCnt);
	
	// 당일 인증 차트
	if (todayAuthChart) {
		todayAuthChart.setOption( {
			series: [{
        		name: 'TodayAuth',
            	type: 'bar',
            	data: [
            		status.DSInfo.DBStat.AuthLog.todayCnt,
            		status.DSInfo.DBStat.AuthLog.todaySuccessCnt,
            		status.DSInfo.DBStat.AuthLog.todayFailCnt,
            		status.DSInfo.DBStat.AuthLog.todayFPCnt,
            		status.DSInfo.DBStat.AuthLog.todayCardCnt,
            		status.DSInfo.DBStat.AuthLog.todayPWCnt,
            		status.DSInfo.DBStat.AuthLog.todayFaceCnt
            	]
            }]
		});
	}		
	

// DataServer, ControlServer CPU, Memory 사용량
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
        	text: 'Today Auth'
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
	                        var colorList = ['#9892db','#6ba8a9','#f98faf','#cd9b9b','#c0d6e4','#e8a53a','#cdc1c5'];
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
            			{xAxis:0, y: 350, name:'Line', symbolSize:20},
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
