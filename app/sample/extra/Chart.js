/************************************************
 * Chart.js
 * Created at 2018. 10. 12. 오전 9:46:16.
 *
 * @author osm86
 ************************************************/
var bubbleChart = null;


/*
 * 쉘에서 init 이벤트 발생 시 호출.
 */
function onShl1Init(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl1 = e.control;
	var oShell = e.content;
	if(bubbleChart){
		e.preventDefault();
	}

}


/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl1Load(/* cpr.events.CUIEvent */ e){
	if(bubbleChart){
		return;
	}
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl1 = e.control;
	var oShell = e.content;
	//적용한 서드파티 모듈에 대한 스크립트를 작성 합니다.
	if(!oShell){ return; }
	oShell.innerHTML = "<canvas id='canvas'></canvas>";
	var DEFAULT_DATASET_SIZE = 7;

	var addedCount = 0;
	var color = Chart.helpers.color;
	var bubbleChartData = {
		animation: {
			duration: 10000
		},
		datasets: [{
			label: 'My First dataset',
			borderWidth: 1,
			data: [{
				x: Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100)),
				y: Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100)),
				r: Math.abs(Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100))) / 5,
			}, {
				x: Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100)),
				y: Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100)),
				r: Math.abs(Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100))) / 5,
			}, {
				x: Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100)),
				y: Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100)),
				r: Math.abs(Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100))) / 5,
			}, {
				x: Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100)),
				y: Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100)),
				r: Math.abs(Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100))) / 5,
			}, {
				x: Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100)),
				y: Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100)),
				r: Math.abs(Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100))) / 5,
			}, {
				x: Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100)),
				y: Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100)),
				r: Math.abs(Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100))) / 5,
			}, {
				x: Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100)),
				y: Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100)),
				r: Math.abs(Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100))) / 5,
			}]
		}, {
			label: 'My Second dataset',
			borderWidth: 1,
			data: [{
				x: Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100)),
				y: Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100)),
				r: Math.abs(Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100))) / 5,
			}, {
				x: Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100)),
				y: Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100)),
				r: Math.abs(Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100))) / 5,
			}, {
				x: Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100)),
				y: Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100)),
				r: Math.abs(Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100))) / 5,
			}, {
				x: Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100)),
				y: Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100)),
				r: Math.abs(Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100))) / 5,
			}, {
				x: Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100)),
				y: Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100)),
				r: Math.abs(Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100))) / 5,
			}, {
				x: Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100)),
				y: Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100)),
				r: Math.abs(Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100))) / 5,
			}, {
				x: Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100)),
				y: Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100)),
				r: Math.abs(Math.round(Math.floor(Math.random()*(100-(-100)+1)) + (-100))) / 5,
			}]
		}]
	};
	var ctx = oShell.querySelector('#canvas').getContext('2d');

	bubbleChart = new Chart(ctx,{
		type: "bubble",
		data: bubbleChartData,
		options: {
			responsive: true,
			title: {
				display: true,
				text: '데이터 분석'
			},
			tooltips: {
				mode: 'point'
			}
		}
	});
}
