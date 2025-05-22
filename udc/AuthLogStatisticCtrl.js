/************************************************
 * AuthLogStatistic.js
 * Created at 2019. 1. 10. 오전 11:29:48.
 *
 * @author wonki
 ************************************************/

var intervalId = null;
var myChart = null;

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};



/*
 * 쉘에서 init 이벤트 발생 시 호출.
 */
function onShl_chartInit(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl_chart = e.control;
	if(myChart){
		e.preventDefault();
	}
}


/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl_chartLoad(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl_chart = e.control;
	
	// div에 echart를 입히는 코드
	var shellDiv = e.content;
	if(myChart){
		return;
	}
//	if(intervalId != null){
//		clearTimeout(intervalId);
//		intervalId = null;
//	}
	myChart = echarts.init(shellDiv);
	var option = {
			title : {
				text : '통계',
				x : 'center'
			},
			tooltip : {},
			legend : {
				orient: 'vertical',
        		left: 'left'
        		//data: ['Fingerprint', 'Password', 'Card', 'Face', 'MobileCard', 'Iris']
			},
//			xAxis : {
//				data : [ "Fingerprint", "Password", "Card", "Face", "MobileCard", "Iris"]
//			},
//			yAxis : {},
			series : [ {
				name : '',
				type : 'pie',
				radius : '40%',
				center : ['50%', '40%'],
				data : [ 
					{value:335, name:'Fingerprint'},
					{value:310, name:'Password'},
					{value:234, name:'Card'},
					{value:135, name:'Face'},
					{value:167, name:'MobileCard'},
					{value:123, name:'Iris'}
				]
			}]
		};
		myChart.setOption(option);
}
