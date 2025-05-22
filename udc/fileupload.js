
exports.getFiles = function() {
	var fileuploader = app.lookup("fud1");
	return fileuploader.getFiles();
};

/*
 * 파일 업로드에서 sendbutton-click 이벤트 발생 시 호출.
 * 파일을 전송하는 button을 클릭 시 발생하는 이벤트.
 */
function onFud1SendbuttonClick(/* cpr.events.CEvent */ e){
	/** 
	 * @type cpr.controls.FileUpload
	 */
	var fud1 = e.control;
	var eventObj = new cpr.events.CEvent("filesend");
	app.dispatchEvent(eventObj);
}
