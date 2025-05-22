/************************************************
 * holi.js
 * Created at 2019. 4. 19. 오후 1:41:01.
 *
 * @author osm8667
 ************************************************/
var calendar = null;          /*오픈소스 calendar 객체*/
var dataSourceArr = [];       /*오픈소스 calendar 데이터 구조*/
var calArr = [];              /*mmdd 배열*/

var dataManager = getDataManager();

/*
 * 쉘에서 init 이벤트 발생 시 호출.
 */
function onUIControlShellInit(/* cpr.events.CUIEvent */ e){
	/**
	 * @type cpr.controls.UIControlShell
	 */
	var uIControlShell = e.control;

}

var i = 0;
/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onUIControlShellLoad(/* cpr.events.CUIEvent */ e){
	/**
	 * @type cpr.controls.UIControlShell
	 */
	var uIControlShell = e.control;
	var oShell = e.content;
	oShell.innerHTML = '<div id="calendar"></div>';//calendar dom
	var holidayCalendar = $('#calendar');
	calendar = holidayCalendar.calendar({//$(element).calendar() => 캘린더 객체를 생성
		style: "background",// style => "background" : 클릭 날짜 백그라운드 전체에 스타일링 , "border" : 클릭 날짜 테두리만 스타일링
		minDate: new Date((new Date().getFullYear()-1)+"-12-31"),//yyyy-mm-dd 형식으로
		maxDate: new Date(new Date().getFullYear()+"-12-31"),
		clickDay: function(e){//달력 컨트롤에서 특정 날짜 선택시 발생
			var element = e.element;
			var dataSource = holidayCalendar.data('calendar').getDataSource();//데이터 get
			
			//클릭한 날짜 가져옴
			var clickMonth = e.date.getMonth()+1;
        	clickMonth = clickMonth<10?"0"+clickMonth:clickMonth;//1~9월 까지는 01,02,03,,,
        	var clickDate = e.date.getDate();
        	clickDate = clickDate<10?"0"+clickDate:clickDate;//1~9일까지는 01,02,03,,,
			
        	var startDate = String(clickMonth) + String(clickDate);

			// 클릭시 빨간색일떄 해제 요청 클릭
			if(element.css('background-color')=="rgb(255, 0, 0)"){//background-color로 토글, 빨간색 다시 클릭 시 해제됨을 의미
				for(var i=0;i<calArr.length;i++){
					if(calArr[i]==startDate){//반환할 array에서 잘라낸다.
						calArr.splice(i, 1);
					}
				}
				
				// 클라에서 수정하는 데이터는 mmdd 이지만
				// db 거쳐서 오는 데이터는 시간 객체
				for(var i=0;i<dataSource.length;i++){
					if (dataSource[i].startDate instanceof Date) {
						var sourceMonth = dataSource[i].startDate.getMonth()+1;
						sourceMonth = sourceMonth<10?"0"+sourceMonth:sourceMonth;
						var sourceDate = dataSource[i].startDate.getDate();
						sourceDate = sourceDate<10?"0"+sourceDate:sourceDate;
						var startSourceDate = String(sourceMonth) + String(sourceDate);
						if (startSourceDate==startDate){
							dataSource.splice(i, 1);
						}
					} else {
						if(dataSource[i].startDate==startDate){//반환할 array에서 잘라낸다.
							dataSource.splice(i, 1);
						}
					}
					
				}

				element.css('background-color', 'rgba(0, 0, 0, 0)');
				element.css('color', 'black');//폰트 색깔
           		element.css('border-radius', 'none');
           		//delete
			}else{//background-color로 토글, 빨간색을 넣고 데이터 배열에도 넣어줌
				if (dataManager.getOemVersion() == OEM_HYUNDAI_HI) {	// 현대 중공업 엑셀 가져오기 떄문에 제한 품
					if (dataSource.length>=365) {
						return;
					}
				} else {
					if (dataSource.length>=30) {
						return;
					}
				}

           		//save
				var check = false;
				for(var i=0;i<dataSource.length;i++){
					if(dataSource[i].startDate==startDate){//동일한 것 클릭 시 생길수 있는 현상을 한번 더 걸러준다.
						dataSource.splice(i, 1);
					}else{
						check = true;
					}
				}
				var dateObj = {
				    id: 0,
				    startDate: null,
				    endDate: null
				}
		        if(check||dataSource.length==0){
		        	dateObj.id = startDate;
		        	dateObj.startDate = startDate;
			        dateObj.endDate = startDate;
			        if(dataSource.indexOf(dateObj)==-1){
			        	calArr.push(startDate);
			        	dataSource.push(dateObj);
			        }
		        }
		        element.css('background-color', 'red');
				element.css('color', 'white');
           		element.css('border-radius', '15px');
			}
		},
		dataSource: dataSourceArr
	});
}


/**
 * 선택한 날짜를 가져옵니다.
 * @return mmdd 형식의 String
 */
exports.getDates = function(){
	var value = [];
	calArr.forEach(function(/* Object */ each){
		value.push(each);
	});
	return value.toString();//스트링 배열 형태로 리턴해줌
}

/**
 * 목록으로 조회한 데이터를 바인딩합니다.
 * @param dateStr 날짜 문자열
 */
exports.setDates = function(/*String*/dateStr){
	var dateArr = dateStr.split(",");
	dateArr.forEach(function(/* String */ each){
		var month = each.substr(0, 2);
		var day = each.substr(2, 2);
		var dataSource = {};
		dataSource.id = each;
		dataSource.startDate = new Date(new Date().getFullYear()+"-"+month+"-"+day + " 00:00:00");
		dataSource.endDate = new Date(new Date().getFullYear()+"-"+month+"-"+day+ " 00:00:00");
		//전역변수에도 세팅
		calArr.push(month+day);
		dataSourceArr.push(dataSource);
	});
	$('#calendar').data('calendar').setDataSource(dataSourceArr);
}


/**
 * 캘린더 데이터를 초기화합니다.
 */
exports.clearCalendar = function(){
	$('#calendar').data('calendar').setDataSource([]);
	calArr = [];
	dataSourceArr =[];
}