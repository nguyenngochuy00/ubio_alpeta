/************************************************
 * dashboard.js
 * Created at 2019. 1. 18. 오후 3:12:50.
 *
 * @author joymrk
 ************************************************/

var csintervalId = null;
var csmyChart = null;
var dsintervalId = null;
var dsmyChart = null;

/*
 * 쉘에서 init 이벤트 발생 시 호출.
 */
function onShl1Init(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl1 = e.control;
	if(dsmyChart){
		e.preventDefault();
	}
}


/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl1Load(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl1 = e.control;
	var shellDiv = e.content;
	if(dsmyChart){
		return;
	}
	if(dsintervalId != null){
		clearTimeout(dsintervalId);
		dsintervalId = null;
	}
	dsmyChart = echarts.init(shellDiv);
	var option = {
			
			tooltip : {},
			legend : {
				data : [ 'Sales' , 'Marketing', "R&D"]
			},
			xAxis : {
				data : [ "shirt", "cardign", "chiffon shirt", "pants", "heels", "socks" ]
			},
			yAxis : {},
			series : [ {
				name : 'Sales',
				type : 'bar',
				data : [ 5, 20, 36, 10, 10, 20 ]
			},
			{
				name : 'Marketing',
				type : 'line',
				data : [ 15, 25, 20, 25, 24, Math.random()* 40 ]
			},
			{
				name : 'R&D',
				type : 'bar',
				data : [ 15, 20, 35, 33, 40, Math.random()* 30 ]
			}]
		};
		dsmyChart.setOption(option);
	
	dsintervalId = setInterval(function(){
	try{
		var option = {
			
			tooltip : {},
			legend : {
				data : [ 'Sales' , 'Marketing', "R&D"]
			},
			xAxis : {
				data : [ "shirt", "cardign", "chiffon shirt", "pants", "heels", "socks" ]
			},
			yAxis : {},
			series : [ {
				name : 'Sales',
				type : 'bar',
				data : [ 5, 20, 36, 10, 10, 20 ]
			},
			{
				name : 'Marketing',
				type : 'line',
				data : [ 15, 25, 20, 25, 24, Math.random()* 40 ]
			},
			{
				name : 'R&D',
				type : 'bar',
				data : [ 15, 20, 35, 33, 40, Math.random()* 30 ]
			}]
		};
		dsmyChart.setOption(option);
	}catch(e){
		clearTimeout(dsintervalId);
	}
	},3000);
}


/*
 * 쉘에서 init 이벤트 발생 시 호출.
 */
function onShl2Init(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl2 = e.control;
	if(csmyChart){
		e.preventDefault();
	}
}


/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl2Load(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl2 = e.control;
	// div에 echart를 입히는 코드
	var shellDiv = e.content;
	if(csmyChart){
		return;
	}
	if(csintervalId != null){
		clearTimeout(csintervalId);
		csintervalId = null;
	}
	csmyChart = echarts.init(shellDiv);
	var option = {
		
			tooltip : {},
			legend : {
				data : [ 'Sales' , 'Marketing', "R&D"]
			},
			xAxis : {
				data : [ "shirt", "cardign", "chiffon shirt", "pants", "heels", "socks" ]
			},
			yAxis : {},
			series : [ {
				name : 'Sales',
				type : 'bar',
				data : [ 5, 20, 36, 10, 10, 20 ]
			},
			{
				name : 'Marketing',
				type : 'line',
				data : [ 15, 25, 20, 25, 24, Math.random()* 40 ]
			},
			{
				name : 'R&D',
				type : 'bar',
				data : [ 15, 20, 35, 33, 40, Math.random()* 30 ]
			}]
		};
		csmyChart.setOption(option);
	
	csintervalId = setInterval(function(){
	try{
		var option = {
			
			tooltip : {},
			legend : {
				data : [ 'Sales' , 'Marketing', "R&D"]
			},
			xAxis : {
				data : [ "shirt", "cardign", "chiffon shirt", "pants", "heels", "socks" ]
			},
			yAxis : {},
			series : [ {
				name : 'Sales',
				type : 'bar',
				data : [ 5, 20, 36, 10, 10, 20 ]
			},
			{
				name : 'Marketing',
				type : 'line',
				data : [ 15, 25, 20, 25, 24, Math.random()* 40 ]
			},
			{
				name : 'R&D',
				type : 'bar',
				data : [ 15, 20, 35, 33, 40, Math.random()* 30 ]
			}]
		};
		csmyChart.setOption(option);
	}catch(e){
		clearTimeout(csintervalId);
	}
	},3000);
}
