


exports.setSignSetting = function( signSetting ){
	app.lookup("udbSignSet_grp").visible = true;
	app.lookup("udbSignSetText").value = signSetting;
	app.lookup("udbSignSet_grp").redraw();
}

exports.setVisible = function( flag ){
	app.lookup("udbSignSet_grp").visible = flag;
}
