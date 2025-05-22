/************************************************
 * TakePhotoPopup.js
 * Created at Sep 3, 2020 9:24:39 AM.
 *
 * @author EVN0025
 ************************************************/

var dataManager = getDataManager();

/*
 * Triggered when click event is fired from Output "취소".
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onOutputClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var output = e.control;
	app.close();
}
    
/*
 * Triggered when click event is fired from Output "사진 삭제"(deleteImage).
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onDeleteImageClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	app.lookup("errorMessage").visible = true;
	app.dispatchEvent(new cpr.events.CUIEvent("DeletePicture"));
}


/*
 * Triggered when click event is fired from Output "사진 앨범에서 등록"(selectFromGallery).
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onSelectFromGalleryClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var selectFromGallery = e.control;
	app.dispatchEvent(new cpr.events.CUIEvent("OpenGallery"));
}


/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var takePictureBtn = document.getElementById('takePictureBtn');
}



/*
 * Triggered when click event is fired from HTMLSnippet.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onHTMLSnippetClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.HTMLSnippet
	 */
	var hTMLSnippet = e.control;
	
}



/*
 * Triggered when click event is fired from Output "사진 찍기".
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onOutputClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var output = e.control;
	app.dispatchEvent(new cpr.events.CUIEvent("TakePicture"));
}


/*
 * Triggered when click event is fired from Output "사진 삭제"(deleteImage).
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onDeleteImageClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var deleteImage = e.control;
	
}
