/************************************************
 * fileDown.js
 * Created at 2021. 7. 10. 오후 3:33:08.
 *
 * @author joymrk
 ************************************************/



/*
 * "txt파일생성" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var arr = new Array(30000);
	for(var i = 0; i< arr.length; i++ ) {
		arr[i] = '2공운식    F018766523032                    63000            :' + '\n';
	} 
	var blob = new Blob(arr, { type: 'text/plain' })
	var objURL = window.URL.createObjectURL(blob);
            
    // 이전에 생성된 메모리 해제
    if (window.__Xr_objURL_forCreatingFile__) {
        window.URL.revokeObjectURL(window.__Xr_objURL_forCreatingFile__);
    }
    window.__Xr_objURL_forCreatingFile__ = objURL;
    var a = document.createElement('a');
    a.download = "test.txt";
    a.href = objURL;
    a.click();
}
