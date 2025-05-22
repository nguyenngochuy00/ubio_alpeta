/************************************************
 * MealManagementOverview.js
 * Created at Oct 14, 2020 8:30:30 AM.
 *
 * @author EVN0025
 ************************************************/
var chartApp;
var config = getConfig();
var utils = cpr.core.Module.require("lib/Utils");
var totalMealResult = 0;
var totalMeal = 0;
var totalPrice = 0;
var mealTotalCost;
var current = moment();

var mealStatistics = [
	{
		totalMeal: 0,
		mealType: 1,
		totalMealPrice: 0,
	},
	{
		totalMeal: 0,
		mealType: 2,
		totalMealPrice: 0,
	},
	{
		totalMeal: 0,
		mealType: 3,
		totalMealPrice: 0,
	},
	{
		totalMeal: 0,
		mealType: 4,
		totalMealPrice: 0,
	},
	{
		totalMeal: 0,
		mealType: 5,
		totalMealPrice: 0,
	}
];

var mealStatisticsInit = function () {
	return [
	{
		totalMeal: 0,
		mealType: 1,
		totalMealPrice: 0,
	},
	{
		totalMeal: 0,
		mealType: 2,
		totalMealPrice: 0,
	},
	{
		totalMeal: 0,
		mealType: 3,
		totalMealPrice: 0,
	},
	{
		totalMeal: 0,
		mealType: 4,
		totalMealPrice: 0,
	},
	{
		totalMeal: 0,
		mealType: 5,
		totalMealPrice: 0,
	}
];} 

var imagesSrc = [
	"/theme/images/mobile/common_colorchip_red.png",
	"/theme/images/mobile/common_colorchip_skyblue.png",
	"/theme/images/mobile/common_colorchip_yellow.png",
	"/theme/images/mobile/common_colorchip_navy.png",
	"/theme/images/mobile/common_colorchip_green.png"
]
	
function initChart(data) {	
	app.lookup("colorList").removeAllChildren();
	data.forEach(function(each){
		if (each.totalMeal !== 0) {
			var label = new udc.MealManagement.MealLabel();
			label.setAppProperties({
				meaType: each.mealType
			});
			app.lookup("colorList").addChild(label, {
				autoSize: "both"
			});
		}
	});
	
	function getMealCountByType(type) {
		var item = data.find(function(item) {
			return item.mealType === type
		})
		return item.totalMeal
	}

	var ctx = document.getElementById('mealChart').getContext('2d');
	var images = [];
	
	var imageCount = imagesSrc.length;
	var imagesLoaded = 0;
	for (var i = 0; i < imagesSrc.length; i++) {
		var img = new Image();
		img.src = imagesSrc[i];
		images.push(img);
	}

	for(var i=0; i<imageCount; i++){
	    images[i].onload = function(){
	        imagesLoaded++;
	        if(imagesLoaded == imageCount){
	            var mealChart = new Chart(ctx, {
				    type: 'horizontalBar',
				    data: {
				        datasets: [ 
				        	{      
				        		categoryPercentage: 0.7,
				        		barPercentage: 0.8,
						        backgroundColor: ctx.createPattern(images[0], 'repeat'), // breakfast
						        data: [getMealCountByType(1)],
//				   				barThickness: "flex",      				
					    	},
					    	{      
					    		categoryPercentage: 0.7,
					    		barPercentage: 0.8,
						        backgroundColor: ctx.createPattern(images[1], 'repeat'), // lunch
						        data: [getMealCountByType(2)],
//				   				barThickness: "flex",
					    	},
					    	{      
					    		categoryPercentage: 0.7,
					    		barPercentage: 0.8,
						        backgroundColor: ctx.createPattern(images[2], 'repeat'), // snack
						        data: [getMealCountByType(3)],
//						        barThickness: "flex",			
					    	},
					    	{     
					    		categoryPercentage: 0.7,
					    		barPercentage: 0.8, 
						        backgroundColor: ctx.createPattern(images[3], 'repeat'), // dinner
						        data: [getMealCountByType(4)],
//				   				barThickness: "flex",				
					    	},
					    	{     
					    		categoryPercentage: 0.7,
					    		barPercentage: 0.8, 
						        backgroundColor: ctx.createPattern(images[4], 'repeat'), // midnight
						        data: [getMealCountByType(5)],
//				   				barThickness: "flex",				
					    	}
				    ]
				    },
					options: {
						responsive: true,
						legend: {
							display: false
						},
						tooltips: {
							enabled: false
						},
						elements: {
							rectangle: {
								borderWidth: 1
							}
						},
						scales: {
							offset: false,
							xAxes: [{
								ticks: {
									display: false,
									beginAtZero: true
								}
							}],
//							yAxes: [{
//					            ticks: {
//					                beginAtZero: true
//					            }
//					        }]
			    		},
			    		borderWidth: 1,
			    		order: 1,
					}
				});
	        }
    	}
	}
};

function render() {
	app.lookup("header").leftBtnPath = app.getAppProperty("prePage")
}

function renderTime() {
	app.lookup("currentMonth").value = moment(current).format("YYYY.MM");
}


/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	app.lookup("header").leftBtnPath = app.getAppProperty("prePage");
	
	fetchMealStatistics()
	fetchMoreMealResult(0)
	renderTime();
}

function fetchMealStatistics() {
	var smsMealStatistics = app.lookup("smsMealStatistics");
	var currentMonth = app.lookup('currentMonth')
	
	if (!currentMonth.value) {
		var now = moment();
		var year = now.format("YYYY");
		var month = now.format("MM");
		currentMonth.value = year + "." + month;
	}
	
	var btnCurrentMonth = app.lookup('btnCurrentMonth')
	btnCurrentMonth.enabled = false;
	btnCurrentMonth.style.css("background-color", '#696969');
	
	fetchMoreMealStatistics()
	
}

function fetchMoreMealStatistics() {
	var currentMonth = app.lookup('currentMonth')
	
	var yearAndMonth = currentMonth.value.split(".");
	var thisMonth = moment(yearAndMonth[0] + "-" + yearAndMonth[1])

	var smsMealStatistics = app.lookup("smsMealStatistics");
	smsMealStatistics.removeAllParameters();
	smsMealStatistics.setRequestActionUrl(config.apiHostResolution() + smsMealStatistics.action);
	smsMealStatistics.addParameter("Year", thisMonth.format("YYYY"));
	smsMealStatistics.addParameter("Month", thisMonth.format("M"));
	smsMealStatistics.send();
}

function fetchMoreMealResult(offset) {
	var smsMealResult = app.lookup("smsMealResult");
	smsMealResult.setRequestActionUrl(config.apiHostResolution() + smsMealResult.action);
	
	var currentMonth = app.lookup('currentMonth')
	var yearAndMonth = currentMonth.value.split('.')
	var thisMonth = moment(yearAndMonth[0] + "-" + yearAndMonth[1])
	var startOfMonth = thisMonth.startOf('month').format('YYYY-MM-DD');
	var endOfMonth   = thisMonth.endOf('month').format('YYYY-MM-DD');
	smsMealResult.removeAllParameters();
	smsMealResult.addParameter("StartAt", startOfMonth);
	smsMealResult.addParameter("EndAt", endOfMonth);
	smsMealResult.addParameter("offset", offset);
	smsMealResult.addParameter("limit", "100");
	smsMealResult.send();
}

/*
 * Triggered when init event is fired from Shell.
 */
function onChartInit(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var chart = e.control;
	if (chartApp) {
		return e.preventDefault();
	}
}



/*
 * Triggered when load event is fired from Shell.
 */
function onChartLoad(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var chart = e.control;
	var oShell = e.content;
	var shellWidth = oShell.offsetWidth;
	oShell.innerHTML = '<canvas id="mealChart" height="70px"' + 'width=' + shellWidth + '></canvas>';
	mealStatistics = mealStatisticsInit();
	initChart(mealStatistics)

}


/*
 * Triggered when rightBtnClick event is fired from User Defined Control.
 */
function onHeaderRightBtnClick(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.Header
	 */
	var header = e.control;
	cpr.core.App.load("app/mobile/Admin/MealManagement/MealManagementByGroup", function(loadedApp){
		loadedApp.createNewInstance().run(null, function(createdApp) {	
			createdApp.getContainer().style.animateFrom({	
				"transform": "translateX(100%)",
				"opacity": "0"
			}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
			app.close();
		});
	});
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsMealStatisticsBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	
	var smsMealStatistics = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsMealStatisticsReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsMealStatistics = e.control;
	hideLoading();
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsMealStatisticsSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsMealStatistics = e.control;
	handleUnauthorize(app);
	totalMeal = 0;
	var newMealStatistics = mealStatisticsInit()
	if (app.lookup("Result").getValue("ResultCode") === 0) {
		app.lookup("MealStatisticsDay").forEachOfUnfilteredRows(function(row) {
			totalMeal = totalMeal + row.getValue("Count");
			var item = newMealStatistics.find(function(item) {
				return item.mealType === row.getValue("Type")
			})
			item.totalMeal = item.totalMeal + row.getValue("Count")
		});
	}
	initChart(newMealStatistics)
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsMealResultBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsMealResult = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsMealResultReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsMealResult = e.control;
	hideLoading();
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsMealResultSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsMealResult = e.control;
	mealStatistic = mealStatisticsInit();
	
	app.lookup("MealResult").forEachOfUnfilteredRows(function(row) {
		var item = mealStatistic.find(function(item) {
			return item.mealType === row.getValue("Type")
		})
		totalPrice = totalPrice + row.getValue("Pay");
		item.totalMealPrice = item.totalMealPrice + row.getValue("Pay");
		item.totalMeal = item.totalMeal + 1;
	});
	totalMealResult = totalMealResult + app.lookup("MealResult").getRowCount()
	
	if (totalMealResult < app.lookup("Total").getValue("Count")) {
		fetchMoreMealResult(totalMealResult)
	} else {
		app.lookup("MealStatistics").build(mealStatistic);
		app.lookup("topMeal").unsetAppProperty("MealStatistics");
		app.lookup("topMeal").setAppProperty("MealStatistics", app.lookup("MealStatistics"));
		app.lookup("totalPrice").putValue(app.lookup("mealResultSum").getValue("MealTotalCost"));
		app.lookup("totalMeal").value = utils.numberWithCommas(totalMeal) + (cpr.I18N.INSTANCE.currentLanguage === "ko" ? "회" : "");
//		app.lookup("totalPrice").value = utils.numberWithCommas(totalPrice) + (cpr.I18N.INSTANCE.currentLanguage === "ko" ? "원" : "");
	}
	console.log(app.lookup("mealResultSum").getDatas());
	console.log(app.lookup("totalPrice").value);
	console.log(app.lookup("MealResult").getRowDataRanged());
//	initChart(mealStatistics)
}


/*
 * Triggered when click event is fired from Image.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onPreMonthClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Image
	 */
//	var previousMonth = e.control;
	var btnCurrentMonth = app.lookup('btnCurrentMonth')
	var smsMealStatistics = app.lookup("smsMealStatistics");
	app.lookup("MealResult").clear();
	app.lookup("MealStatisticsDay").clear();
	app.lookup("MealStatistics").clear();
	app.lookup("totalPrice").value = 0;
	totalPrice = 0;
	
	
	mealStatistics = mealStatisticsInit();
	
	var currentMonth = app.lookup('currentMonth')
	if (!currentMonth.value) {
		currentMonth.value = moment().format("YYYY") + "." +  moment().format("MM");
	}
	
	var yearAndMonth = currentMonth.value.split(".");
	var preMonth = moment(yearAndMonth[0] + "-" + yearAndMonth[1]).subtract(1,'months');
	var year = preMonth.format("YYYY");
	var month = preMonth.format("MM");
	currentMonth.value = year + "." + month;;
	
	if (currentMonth.value === (moment().format("YYYY") + "." + moment().format("MM") )) {
		btnCurrentMonth.enabled= false;
		btnCurrentMonth.style.css("background-color", '#696969');
	} else {
		btnCurrentMonth.enabled = true;
		btnCurrentMonth.style.css("background-color", '#00B7CC');
	}
	
	fetchMoreMealStatistics();
	fetchMoreMealResult(0)
//	initChart(mealStatistics)
}


/*
 * Triggered when click event is fired from Image.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onNextMonthClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Image
	 */
//	var nextMonth = e.control;
	var btnCurrentMonth = app.lookup('btnCurrentMonth')
	var smsMealStatistics = app.lookup("smsMealStatistics");
	var currentMonth = app.lookup('currentMonth')
	app.lookup("MealResult").clear();
	app.lookup("MealStatisticsDay").clear();
	app.lookup("MealStatistics").clear();
	app.lookup("totalPrice").value = 0;
	totalPrice = 0;
	
	if (!currentMonth.value) {
		var now = moment();
		var year = now.format("YYYY");
		var month = now.format("MM");
		currentMonth.value = year + "." + month;
	}
	
	var yearAndMonth = currentMonth.value.split(".");
	var nextMonth = moment(yearAndMonth[0] + "-" + yearAndMonth[1]).add(1,'months');
	var year = nextMonth.format("YYYY");
	var month = nextMonth.format("MM");
	currentMonth.value = year + "." + month;
	
	if (currentMonth.value === (moment().format("YYYY") + "." + moment().format("MM"))) {
		btnCurrentMonth.enabled= false;
		btnCurrentMonth.style.css("background-color", '#696969');
	} else {
		btnCurrentMonth.enabled = true;
		btnCurrentMonth.style.css("background-color", '#00B7CC');
	}

	fetchMoreMealStatistics();
	fetchMoreMealResult(0)
//	initChart(mealStatistics)
}


/*
 * Triggered when click event is fired from Output "이번달".
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onOutputClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var output = e.control;
	
	app.lookup("MealResult").clear();
	app.lookup("MealStatisticsDay").clear();
	app.lookup("MealStatistics").clear();
	app.lookup("totalPrice").value = 0;
	totalPrice = 0;
	
	output.enabled = false;
	output.style.css("background-color", '#696969');
	var smsMealStatistics = app.lookup("smsMealStatistics");
	var currentMonth = app.lookup('currentMonth')
	
	var now = moment();
	var year = now.format("YYYY");
	var month = now.format("MM");
	currentMonth.value = year + "." + month;

	fetchMoreMealStatistics();	
	fetchMoreMealResult(0)
//	initChart()
	
}


/*
 * Triggered when init event is fired from Body.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(/* cpr.events.CEvent */ e){
	app.lookup("header").setAppProperties({
		pageName: cpr.I18N.INSTANCE.message("Str_MealServiceManagement")
	});
}
