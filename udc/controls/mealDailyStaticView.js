/************************************************
 * mealDailyStaticView.js
 * Created at 2019. 4. 8. 오후 5:35:06.
 *
 * @author fois
 ************************************************/

exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};

exports.setClear = function(){
	app.lookup("udcMDS_opbDay").value = "";	
	app.lookup("udcMDS_opbDay").style.css({color:"#000000"});
	
	app.lookup("udcMDS_opbBreakFast").value = "";
	app.lookup("udcMDS_opbLaunch").value = "";
	app.lookup("udcMDS_opbDinner").value = "";
	app.lookup("udcMDS_opbLateSnack").value = "";
	app.lookup("udcMDS_opbSnack").value = "";	
}

exports.setDay = function(day){
	app.lookup("udcMDS_opbDay").value = day;
}

// 조식,중식,석식,간식,야식 ( 1 ~ 5 )
exports.setCount = function(type,value){
	switch (type){
		case 1: app.lookup("udcMDS_opbBreakFast").value = value; break;
		case 2: app.lookup("udcMDS_opbLaunch").value = value; break;
		case 3: app.lookup("udcMDS_opbDinner").value = value; break;
		case 4: app.lookup("udcMDS_opbSnack").value = value; break;
		case 5: app.lookup("udcMDS_opbLateSnack").value = value; break;		
	}	
}

exports.setVisible = function( visible ){
	app.lookup("udcMDS_grpView").visible = visible;
}

exports.setColor = function( colorValue ){
	app.lookup("udcMDS_opbDay").style.css({color:colorValue});
	//app.lookup("udcMDS_opbDay").redraw();
}

