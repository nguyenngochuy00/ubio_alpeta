/************************************************
 * terminalIDInput.js
 * Created at 2021. 4. 20. 오후 4:31:51.
 *
 * @author fois
 ************************************************/


function onTMREG_btnTerminalRegistClick(/* cpr.events.CMouseEvent */ e){	
	var terminalID = app.lookup("TMIDI_nbeTerminalID").value
	app.close(terminalID);
}

function onTMREG_btnCancelClick(/* cpr.events.CMouseEvent */ e){
	app.close(0);
}
