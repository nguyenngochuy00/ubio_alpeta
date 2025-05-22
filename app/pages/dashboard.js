/************************************************
 * dashboard.js
 * Created at 2018. 10. 4. 오후 5:24:27.
 *
 * @author tomato
 ************************************************/

var intervalId = null;
var myChart = null;


/*
 * 쉘에서 init 이벤트 발생 시 호출.
 */
function onUIControlShellInit(e){
	// chart가 새로 그려지기 전에 기존에 echart 관련 객체가 있으면 삭제한다.
	var shellDiv = e.content;
	if(myChart){
		e.preventDefault();
	}
	
}

/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onUIControlShellLoad(e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var uIControlShell = e.control;
	
	// div에 echart를 입히는 코드
	var shellDiv = e.content;
	if(myChart){
		return;
	}
	if(intervalId != null){
		clearTimeout(intervalId);
		intervalId = null;
	}
	myChart = echarts.init(shellDiv);
	var option = {
			title : {
				text : 'ECharts 연동 예제'
			},
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
		myChart.setOption(option);
	
	intervalId = setInterval(function(){
	try{
		var option = {
			title : {
				text : 'ECharts 연동 예제'
			},
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
		myChart.setOption(option);
	}catch(e){
		clearTimeout(intervalId);
	}
	},3000);
	
}
