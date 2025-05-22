
var intervalID = null;

exports.init = function( title, subTitle, max ){
	
	var opbTitle = app.lookup("opbTitle");
	opbTitle.value = title;
	
	var opbSubTitle = app.lookup("opbSubTitle");
	opbSubTitle.value = subTitle;
	
	var progressbar = app.lookup("progressbar");
	progressbar.max = max
	progressbar.numberValue = 0;
}

exports.increaseValue = function(){
	var progressbar = app.lookup("progressbar");
	if( progressbar.numberValue>= progressbar.max){
		return;
	}
	progressbar.numberValue++;
}

exports.setTitle = function(title){
	var opbTitle = app.lookup("opbTitle");
	opbTitle.value = title;
}

exports.setSubTitle = function(subTitle){
	var opbSubTitle = app.lookup("opbSubTitle");
	opbSubTitle.value = subTitle;
}
