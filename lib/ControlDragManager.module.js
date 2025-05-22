/************************************************
 * ControlDragManager.module.js
 * Created at 2018. 10. 4. 오후 1:08:41.
 *
 * @author tomato
 ************************************************/
var mainLib = null;
var dragSelection = null;          /*선택한 아이콘 컨트롤*/
var isMouseDown = false;           /*마우스를 내렸는지 여부*/
var appInstance = null;
var pointer = {x:0,y:0};           /*마우스 포인터 좌표*/
var isHelpMenu = false;            /*도움말 영역에서의 호출여부*/
var helpIcon = null;               /*도움말 아이콘*/
var dataManager = null;
/*
 * dragCtrl : 드래그 대상 컨트롤러, ctrlRect : 대상컨트롤러의 rect 정보
 */
var dragCtrl = [];
var ctrlRect = [];
var listeners = {mousemove:null,mouseup:null};
var ctrlRectOpt = {//아이콘의 크기에 대한 데이터 상수
	maxRow:7,//한 화면에 표시될 아이템 수
	width: 82,//넓이
	height: 92,//높이
	left: 50,
	top: 122,//height+padding
	padding: 30,
	menubar: 40
};
/**
 * @type cpr.data.DataSet
 */
var iconList = null;            /*MenuUser*/
var isMoving = false;           /*아이콘이 지금 움직이고 있는지 여부*/
var isGrouping = false;         /*그룹화가 진행되고 있는지 여부*/
var preGroupID = 0;             /*직전 그룹아이디*/
var clickCtrl =''; //20190826 정래훈 아이콘을 클릭 하지 않은 상태에서 드래그 이벤트가 계속 실행되는 문제를 해결하기 위해 작성
/**
 * 선택한 ctrl을 드래그 한다.
 * @param {any} ctrls 버튼
 * @param {cpr.core.AppInstance} app
 * @param {cpr.events.CMouseEvent} event
 */
exports.dragStart = function(ctrls,/*cpr.core.AppInstance*/app,/*cpr.events.CMouseEvent*/event, mouseEvent){

	
	if(mouseEvent == "mousedown"){ //20190826 정래훈 아이콘을 클릭 하지 않은 상태에서 드래그 이벤트가 계속 실행되는 문제를 해결하기 위해 작성
		clickCtrl = event.targetControl; //20190826 정래훈 아이콘을 클릭 하지 않은 상태에서 드래그 이벤트가 계속 실행되는 문제를 해결하기 위해 작성

		if(!dataManager){
			dataManager = getDataManager();
		}

		isMouseDown = true;
		dragCtrl = ctrls;
		appInstance = app;//이벤트 대상 인스턴스
		mainLib = mainManager(app);//mainManager.module; 각종 관련 함수 접근
		dragSelection = cpr.core.Module.require("lib/DragSelection");//선택 컨트롤을 얻기 위한
		listeners.mousemove = dragMove.bind(this);
		app.getRootAppInstance().getContainer().addEventListener("mousemove",listeners.mousemove);//마우스무브 이벤트 바인딩
		pointer.x = event.clientX;
		pointer.y = event.clientY;
		iconList = app.lookup("MenuUser");
		dragCtrl.forEach(function(/* cpr.controls.UIControl */ each){
			ctrlRect.push(extractCtrlRect(each, app));
			preGroupID = iconList.findFirstRow("MenuID == '" + each.userAttr("val") + "'").getValue("GroupID");//선택 컨트롤의 그룹아이디가 있으면 설정
		});
		
	}else{ //20190826 정래훈 아이콘을 클릭 하지 않은 상태에서 드래그 이벤트가 계속 실행되는 문제를 해결하기 위해 작성
		var targetCtrl = event.targetControl;
		if(targetCtrl != clickCtrl){
			
		}else{
			dragMove(this);
		}
	}
}

var time;              /*드래그 오버한 시간*/
var floating = false;  /*floating 여부*/


/**
 * 선택한 ctrl을 마우스로 이동 할 때 발생
 * @param {Event} e
 */
function dragMove(e){
	
	//20190826 정래훈 아이콘을 클릭 하지 않은 상태에서 드래그 이벤트가 계속 실행되는 문제를 해결하기 위해 작성
	if(ctrlRect.length > 0 && isMouseDown ==true && e.buttons== undefined){
		dispose();
		return;
	}
	
	if(!isMouseDown || ctrlRect.length ==0){
		dispose();
		return;
	}
	if(e.buttons== 0){
		dispose();
		return;
	}
	if(isMoving==false){//마우스 민감도
		if(Math.abs(pointer.x-e.clientX) > 10|| Math.abs(pointer.y-e.clientY)>10){
			isMoving = true;
			listeners.mouseup = dragEnd.bind(this);//아이콘이 움직였을때 드롭이벤트를 바인딩
			appInstance.getRootAppInstance().getContainer().addEventListenerOnce("mouseup",listeners.mouseup);
		}
		return;
	}
	if(time){//대상 아이콘에 설정된 시간 이벤트가 있으면 초기화
		clearTimeout(time);
	}
	var deltaX = e.clientX - pointer.x;
	var deltaY = e.clientY - pointer.y;
	if(appInstance.getContainer().getLayout() instanceof cpr.controls.layouts.XYLayout){
		dragCtrl.forEach(function(/* cpr.controls.UIControl */ each, idx){
			var left = ctrlRect[idx].x + deltaX;
			var top = ctrlRect[idx].y + deltaY;
			//target control을 그룹화 대상으로 잡기위해 드래그를 시작한 대상의 포인터 이벤트를 없애서 포인터가
			//움직인 위치의 컨트롤을 얻기위함
			each.style.css("pointer-events","none");
			each.style.css("z-index", "5");
			var eachParent = each.getParent();
			var row = iconList.findFirstRow("MenuID == '" + each.userAttr("val") + "'");//선택아이콘 정보
			//폴더에서 바깥으로 빼내는 경우 start
			if(eachParent.userAttr("isFolder")=="true"){
				var folderArea = eachParent.getActualRect();
				preGroupID = row.getValue("GroupID");
				if(left<folderArea.left-41||left>folderArea.right-41||top<folderArea.top-46||top>folderArea.bottom-46){
					row.setValue("GroupID", 0);
					var rowCount = iconList.findAllRow("GroupID==0").length-1;//그룹에 속해있지 않는 로우의 수
					row.setValue("PosX", parseInt(rowCount/ctrlRectOpt.maxRow));
					row.setValue("PosY", rowCount%ctrlRectOpt.maxRow);
					row.setValue("order", rowCount);
					each.userAttr("isGroup","false");
					if(each.userAttr("isGroupChild")){//폴더 자식 여부 userAttr 삭제
						each.removeUserAttr("isGroupChild");
					}
//					each.style.css("visibility", "visible");//그룹화 과정에서 hidden처리했던 항목을 되돌림
					appInstance.getContainer().addChild(each, {
						left:left+"px",top: top+"px", width: ctrlRectOpt.width+"px", height:ctrlRectOpt.height+"px"
					});
					/**
					 * @type cpr.controls.EmbeddedApp
					 */
					var folderLayout = appInstance.lookup("emb_folder");
					folderLayout.dispose();
				}
			}
			//폴더에서 바깥으로 빼내는 경우 end
			appInstance.getContainer().updateConstraint(each, {left:left+"px",top:top+"px"});//아이콘 위치 업데이트
			/**
			 * @type cpr.controls.Container
			 */
			var targetCtrl = e.targetControl;
			//타겟 컨트롤이 폴더가 아니고 폴더 내 자식이 아닐때
			if(targetCtrl.userAttr("isFolder")!="true" && !dragCtrl[0].userAttr("isGroupChild")){
				dragCtrl[0].style.css("background-image","url('"+dragCtrl[0].userAttr("ImageSrc")+"')");//폴더 이미지로 변경되었던 이미지를 본래 이미지로 돌림
				var isGroup = targetCtrl.userAttr("isGroup");
				if(!isGroup){
					isGroup = "false";
				}
				if(targetCtrl.userAttr("droppable") == "true"){//단순 아이콘일때
					time = setTimeout(function(){//설정 시간 마우스 오버 시 폴더 이미지로 변경
						if(dragCtrl[0] && isGroup=="false"){
							dragCtrl[0].style.css("background-image","url('theme/images/home_screen_icons/home_sceen_icons_folder.png')");
							isGrouping = true;
						}
					}, 1000);
				}
			}else{
				return;
			}
		});
	}else{
		//현재 레이아웃에서는 사용하지 않는 기능입니다.
		dragCtrl.forEach(function(/* Object */ each,idx){
			var constraint =  appInstance.getContainer().getConstraint(dragCtrl[idx]);
			var left = ctrlRect.x + deltaX;
			var top = ctrlRect.y + deltaY;
			constraint.positions.forEach(function(each){
				each.left = left+"px";
				each.top = top+"px";
			});
			appInstance.getContainer().updateConstraint(dragCtrl[idx],constraint);
		});
	}
}


/**
 * 선택한 아이콘에서 마우스를 땠을때 발생하는 이벤트
 * @param {Event} e
 */
function dragEnd(/* cpr.events.CMouseEvent */e){
	if(!isGrouping){//그룹화가 진행되고 있지않은데 타임 이벤트가 남아있는 경우 초기화
		clearTimeout(time);
	}
	var targetCtrl = e.targetControl;//드래그를 하는 컨트롤이 아닌 드래그 대상 컨트롤
	if(targetCtrl.userAttr("isFolder")=="true"){// 폴더 영역내에 드롭 시 예외처리
		return;
	}
	var selection = dragSelection.getSelection();//DragSelection.module에 등록된 컨트롤을 가져온다.
	//(기존 소스가 여러 아이콘을 대상으로 작성되었는데 혹시 몰라서 일단 array로처리중 , 실제로는 무조건 하나만 들어감)
	if(targetCtrl.userAttr("selectable")=="true"){//선택 가능한 개체인가. ; 아이콘을 의미(폴더 포함)
		if(targetCtrl.userAttr("isGroup")=="false"){//드롭 대상의 위치가 그룹아이콘인지 아닌지 판별
			var findData = iconList.findFirstRow("MenuID == " + targetCtrl.userAttr("val"));
			var targetX = findData.getValue("PosX");
			var targetY = findData.getValue("PosY");
			var targetOrder = findData.getValue("order");
			if(dragCtrl[0].userAttr("isGroup")=="true" || !isGrouping){//드래그 대상이 폴더일때
				// 19-08-07 정래훈 -> 그룹 안에있는 아이콘끼리 드랍해서 겹쳤을시 문제 발생을 막기위해 작성
				if(preGroupID == 0){
					dropEvent(e);
				}else{
					return;
				}
			}else{
				if(selection.indexOf(targetCtrl)==-1){//선택된 항목의 중복여부
					selection.push(targetCtrl);
				}//타겟 아이콘을 selection에 추가하여 그룹으로 만들 아이콘들을 묶는다.
				if(selection.length>1){
					var groupOutput = mainLib.makeGroup();//그룹화 진행
					appInstance.getContainer().addChild(groupOutput, {
						top: targetCtrl.getActualRect().top + "px",
						left: targetCtrl.getActualRect().left + "px",
						width: targetCtrl.getActualRect().width + "px",
						height: targetCtrl.getActualRect().height + "px"
					});
					var row = iconList.findFirstRow("MenuID == '" + groupOutput.id + "'");
					row.setValue("UserID", dataManager.getAccountID());
					row.setValue("PosX",targetX);
					row.setValue("PosY",targetY);
					row.setValue("order", targetOrder);
					/**
					 * @type cpr.data.DataSet
					 */
					var groupUpdate = appInstance.lookup("MenuGroup");
					var tmp = {};//그룹 데이터 셋에 넣을 임시 데이터 구조
					tmp.MenuGroupID = parseInt(groupOutput.id);
					tmp.PosX = targetX;
					tmp.PosY = targetY;
					tmp.Name = groupOutput.userAttr("name");
					tmp.UserID = dataManager.getAccountID(); // 20190702 1을 넣는 이유는???-> 1;//session
					groupUpdate.addRowData(tmp);
					selection.forEach(function(/* cpr.controls.Button */ each){
						each.style.css("visibility","hidden");//그룹화 된 아이콘은 히든 처리
					});
					reOrder(selection);
					/**
					 * @type cpr.protocols.Submission
					 */
					var saveSms = appInstance.lookup("sms_manageMenuGroup");
					saveSms.send();
					saveSms.addEventListenerOnce("submit-error", function(e){//오류 발생 시 이전 데이터로 되돌림
						iconList.revert();
						redraw();
					});
					saveSms.addEventListenerOnce("submit-success", function(e) {
						isGrouping = false; // 폴더 추가 생성 안되는 버그 수정
					})
				}
			}
			dragSelection.clearSelection();//선택 항목들을 초기화 해준다.
			dispose();//라이프 사이클 종료
		}else{//드롭 대상의 위치가 그룹
			if(dragCtrl[0].userAttr("isGroup")=="false"){//드래그 대상이 아이콘 -> 그룹에 삽입
				var row = iconList.findFirstRow("MenuID == '" + dragCtrl[0].id + "'");
				row.setValue("GroupID",targetCtrl.userAttr("val"));
				appInstance.getContainer().removeChild(dragCtrl[0]);

				reOrder(selection);//그룹에 편입한 아이콘 재정렬
			}else{//드래그 대상이 그룹
				dropEvent(e);
			}
			dragSelection.clearSelection();
			dispose();//라이프 사이클 종료
		}
	}else{
		dropEvent(e);
		dispose();//라이프 사이클 종료
	}
}


/**
 * 드롭된 아이콘들의 위치를 결정 짓고 데이터를 반영한다
 * @param {Event} e
 */
function dropEvent(e){
	//order ==> 1~ 아이콘 갯수까지의 나열된 정수로 해당 order를 maxRow로 나누어 몫과 나머지를 활용하여 x, y 좌표 값이 나온다.
	if(preGroupID!=0){
		deleteGroup(preGroupID);
	}
	var deltaX = e.clientX - pointer.x;
	var deltaY = e.clientY - pointer.y;
	//지점에 드롭
	dragCtrl.forEach(function(/* cpr.controls.UIControl */ each,idx){
		//좌표 계산
		var left = ctrlRect[idx].x + deltaX;
		var top = ctrlRect[idx].y + deltaY;
		var dropLeft = Math.floor(left/(ctrlRectOpt.width+ctrlRectOpt.left));//Math.floor() : 소수점 이하를 버림한다.
		var dropTop = Math.floor(top/(ctrlRectOpt.height+ctrlRectOpt.padding));
		//드롭할 위치의 x,y 좌표와 드롭하고 있는 아이콘 기존 데이터의 x,y를 비교하여 각각 상황에 맞게 이벤트 진행
		var thisCtrl = iconList.findFirstRow("GroupID==0&&(PosX=="+dropLeft+"&&PosY=="+dropTop+")");//드롭할 위치에 기존 데이터가 있는가
		var row = iconList.findFirstRow("MenuID == " + each.id);//드롭할 아이콘의 정보
		var filter = null;
		var preOrder = row.getValue("order");//드롭 전 order 정보
		if((row.getValue("PosX")==dropLeft)&&(row.getValue("PosY")==dropTop)){//드래그 시작 점과 드롭된 위치가 같을 경우
			dragCtrl[0].style.css("background-image","url('"+dragCtrl[0].userAttr("ImageSrc")+"')");//드롭할 아이콘이 폴더로 변경되었다면 다시 원래의 아이콘으로 되돌린다.
			redraw();
		}else if(!thisCtrl){//영역이 아닌 곳에 드롭 할 경우 마지막 인덱스에 추가된다.
			var lastOrder = iconList.findAllRow("GroupID==0").length-1;
			filter = iconList.findAllRow("GroupID==0&&order<="+lastOrder+"&&MenuID!="+each.id);
			filter.forEach(function(/* cpr.data.Row */ rest){
				var getOrder = rest.getValue("order");
				if(getOrder>preOrder){
					getOrder = getOrder - 1;
				}
				rest.setValue("order", getOrder);
				var dataX = parseInt(rest.getValue("order")/ctrlRectOpt.maxRow);
				var dataY = rest.getValue("order")%ctrlRectOpt.maxRow;
				rest.setValue("PosX", dataX);
				rest.setValue("PosY", dataY);
			});
			row.setValue("PosX", parseInt(lastOrder/ctrlRectOpt.maxRow));
			row.setValue("PosY", lastOrder%ctrlRectOpt.maxRow);
			row.setValue("order", lastOrder);
			redraw();
		}else{//드롭한 위치에 아이콘을 이동시키며 관련 데이터를 갱신한다.
			row.setValue("PosX", dropLeft);
			row.setValue("PosY", dropTop);
			var order = (dropLeft*ctrlRectOpt.maxRow) + dropTop;
			row.setValue("order", order);
			if(preOrder>order){//기존 order 값이 드롭될 위치의 order 값 보다 큰경우
				filter = iconList.findAllRow("GroupID==0&&order>="+order+"&&MenuID!="+each.id);
				filter.forEach(function(/* cpr.data.Row */ rest){
					var getOrder = rest.getValue("order");
					if(getOrder<preOrder){
						getOrder = getOrder + 1;
					}
					rest.setValue("order", getOrder);
					var dataX = parseInt(rest.getValue("order")/ctrlRectOpt.maxRow);
					var dataY = rest.getValue("order")%ctrlRectOpt.maxRow;
					rest.setValue("PosX", dataX);
					rest.setValue("PosY", dataY);
				});
			}else if(preOrder<order){//기존 order 값이 드롭될 위치의 order 값 보다 작은 경우
				filter = iconList.findAllRow("GroupID==0&&order<='"+order+"'&&MenuID!="+each.id);
				filter.forEach(function(/* cpr.data.Row */ rest){
					var getOrder = rest.getValue("order");
					if(getOrder>preOrder){
						getOrder = getOrder - 1;
					}
					rest.setValue("order", getOrder);
					var dataX = parseInt(rest.getValue("order")/ctrlRectOpt.maxRow);
					var dataY = rest.getValue("order")%ctrlRectOpt.maxRow;
					rest.setValue("PosX", dataX);
					rest.setValue("PosY", dataY);
				});
			}
			redraw();
		}
		saveIconList();
	});
}


/**
 * 드래그앤드롭 이벤트를 해제, 각 자원 해제
 */
function dispose(){
	isMouseDown = false;
	isMoving = false;
	isGrouping = false;
	if(appInstance){
		//드래그앤드롭 이벤트 리스너 제거
		appInstance.getRootAppInstance().getContainer().removeEventListener("mousemove",listeners.mousemove);
		appInstance.getRootAppInstance().getContainer().removeEventListener("moveup",listeners.mouseup);
		listeners.mousemove = null;
		listeners.mosueup = null;
		dragCtrl.forEach(function(/* cpr.controls.UIControl */ each){
			if(each.style.getCSS("pointer-events")){
				each.style.removeStyle("pointer-events");
			}
			if(each.style.getCSS("border")){
				each.style.removeStyle("border");
			}
			each.style.css("z-index","1");
		});
	}
	if(dataManager){
		dataManager = null;
	}

	dragCtrl = [];
	ctrlRect = [];
}
/*******************************************************
 * 부가 함수
 *******************************************************/

/*
 *전달 받은 컨트롤의 order보다 큰 항목들의 위치정보를 갱신한다.
 */
function reOrder(selection){
	if(!selection){
		return;
	}
	var selectRow = iconList.findFirstRow("MenuID == " + selection[0].userAttr("val"));
	var dragOrder = selectRow.getValue("order");
	var reOrder = iconList.findAllRow("GroupID==0&&order>"+dragOrder);
	reOrder.forEach(function(/* cpr.data.Row */ each){
		each.setValue("order", each.getValue("order")-1);
		each.setValue("PosX", parseInt(each.getValue("order")/ctrlRectOpt.maxRow));
		each.setValue("PosY", each.getValue("order")%ctrlRectOpt.maxRow);
		var x = (each.getValue("PosX")==0? ctrlRectOpt.left : parseInt(each.getValue("PosX")) *
				(ctrlRectOpt.width + ctrlRectOpt.left) + ctrlRectOpt.left);
		var y = each.getValue("PosY") * ctrlRectOpt.top + ctrlRectOpt.menubar + ctrlRectOpt.padding;
		appInstance.getContainer().updateConstraint(appInstance.lookup(each.getValue("MenuID").toString()), {left:x+"px",top: y+"px"});
	});
	saveIconList();
}


/*
 * 위치정보를 갱신하고 화면에 반영한다. 아이디가 number 형이라 tostring
 */
function redraw(){
	var tot = iconList.findAllRow("GroupID==0");
	tot.forEach(function(/* cpr.data.Row */ row){
		var dropLeft = row.getValue("PosX");
		var dropTop = row.getValue("PosY");
		var x = dropLeft==0? ctrlRectOpt.left : parseInt(dropLeft) * (ctrlRectOpt.width + ctrlRectOpt.left) + ctrlRectOpt.left;
		var y = dropTop * ctrlRectOpt.top + ctrlRectOpt.menubar + ctrlRectOpt.padding;
		var value = row.getValue("MenuID").toString();
		if(isHelpMenu){
			appInstance.getContainer().addChild(helpIcon, {left:x+"px",top: y+"px", width: ctrlRectOpt.width+"px", height:ctrlRectOpt.height+"px"});
		}else{
			appInstance.getContainer().updateConstraint(appInstance.lookup(value), {left:x+"px",top: y+"px"});
		}
	});
	if(appInstance.lookup("emb_folder")){//폴더를 없앤다.
		appInstance.lookup("emb_folder").dispose();
	}
	isHelpMenu = false;
	helpIcon = null;
//	appInstance = null;
}


/**
 * 변경된 아이콘 리스트 (MenuUser) 서브미션
 */
function saveIconList(){
	//menuUser 저장 , 그룹 정보를 제외
	var groupIDs = [];
	var childRows =  iconList.findAllRow("GroupID!=0");
	/**
	 * @type cpr.data.DataSet
	 */
	var groupList = appInstance.lookup("MenuGroup");
	var isExist = false;
	if(childRows.length>0){
		childRows.forEach(function(/* cpr.data.Row */ row){
			var groupID = row.getValue("GroupID");
			if(groupIDs.indexOf(groupID)==-1){
				groupIDs.push(row.getValue("GroupID"));
			}
		});
		groupIDs.forEach(function(/* Object */ id){
			var cRow = iconList.findFirstRow("MenuID == "+id);
			cRow.setState(cpr.data.tabledata.RowState.UNCHANGED);
			//그룹 위치 데이터 업데이트
			var gRow = groupList.findFirstRow("MenuGroupID=="+id);
			gRow.setValue("PosX", cRow.getValue("PosX"));
			gRow.setValue("PosY", cRow.getValue("PosY"));
		});
		isExist = true;
	}
	var iconListSms = new cpr.protocols.Submission("sms_saveMenuUsers");
	iconListSms.action = "/v1/menuUsers";
	iconListSms.method = "PUT";
	iconListSms.mediaType = "application/x-www-form-urlencoded";
	iconListSms.addRequestData(iconList);
	var resultMap = appInstance.lookup("Result");
	iconListSms.addResponseData(resultMap, true, "Result");
	iconListSms.send();
	//icon정보 저장 후 그룹에 대한 저장
	iconListSms.addEventListenerOnce("submit-error", function(e){
		iconList.revert();
		redraw();
	});
	iconListSms.addEventListenerOnce("submit-done", function(e){
		if(resultMap.getValue("ResultCode")==0){
			if(isExist){//그룹 데이터가 존재할때
				var groupSms = new cpr.protocols.Submission("sms_saveMenuGroups");
				groupSms.action = "/v1/menuGroups";
				groupSms.method = "PUT";
				groupSms.mediaType = "application/x-www-form-urlencoded";
				groupSms.addRequestData(groupList);
				groupSms.send();
				groupSms.addEventListenerOnce("submit-error", function(e){
					iconList.revert();
					groupList.revert();
					redraw();
				});
			}
		}else{
			iconList.revert();
			redraw();
		}
	});
}


/**
 * 특정 그룹을 삭제한다.
 * @param {String} groupID
 */
function deleteGroup(groupID){
	if(groupID){
		preGroupID = groupID;
	}
	var childID = getChildID(preGroupID);
	if(childID){
		//남은 자식 아이콘의 경우 그룹이 가지고 있던 아이콘 정보를 입력해준다.
		var thisGroup = iconList.findFirstRow("MenuID=="+preGroupID);//MenuUser에 등록된 그룹데이터
		var childInfo = iconList.findFirstRow("MenuID=="+childID);
		childInfo.setValue("PosX", thisGroup.getValue("PosX"));
		childInfo.setValue("PosY", thisGroup.getValue("PosY"));
		childInfo.setValue("order", thisGroup.getValue("order"));
		childInfo.setValue("GroupID", 0);
		iconList.realDeleteRow(thisGroup.getIndex());//MenuUser에 바탕화면에 보여주기 위해  등록해둔 그룹아이콘의 데이터를 삭제한다.
		/**
		 * @type cpr.controls.Button
		 */
		var oChild = appInstance.lookup(childID.toString());
		if(!oChild){//너무 빠르게 아이콘이 dispose 된 경우 lookup이 불가능한 시점이 간헐적으로 발생, 예외처리
			console.log("ERROR OCCURR : Overloaded");//지우지 마세요.(해당 오류 체크용)
			//그룹삭제로직
			onSmsDeleteGroup(preGroupID);
			reGenerateIcon(childInfo);
			redraw();
			return;
		}
		oChild.userAttr("isGroup","false");//남은 자식의 속성 변경
		if(oChild.userAttr("isGroupChild")){
			oChild.removeUserAttr("isGroupChild");
		}
		oChild.style.css({//hidden처리했던 항목을 되돌림
			"visibility": "visible",
			"background-image": "url('"+oChild.userAttr("ImageSrc")+"')"
		});
		appInstance.getContainer().removeChild(appInstance.lookup(preGroupID.toString()));//폴더 아이콘 삭제
		onSmsDeleteGroup(preGroupID);
	}
}


/**
 * 오류로 인해 dispose 된 아이콘을 재생성한다.
 */
function reGenerateIcon(childInfo){
	var targetID = childInfo.getValue("MenuID");
	var tmpMenuListRow = appInstance.lookup("MenuList").findFirstRow("MenuID=="+targetID);
	var regenIcon = mainLib.createSymbolic(tmpMenuListRow.getValue("Image"), dataManager.getMenuString(targetID),
					targetID.toString(), tmpMenuListRow.getValue("Src"), dataManager.getMenuString(targetID), dataManager.getMenuKey(targetID));

	var x = childInfo.getValue("PosX")==0? ctrlRectOpt.left : parseInt(childInfo.getValue("PosX")) * (ctrlRectOpt.width + ctrlRectOpt.left) + ctrlRectOpt.left;
	var y = childInfo.getValue("PosY")==0? ctrlRectOpt.top : childInfo.getValue("PosY") * (ctrlRectOpt.height + ctrlRectOpt.padding) + ctrlRectOpt.top;
	appInstance.getContainer().addChild(regenIcon, {
		top: y + "px",
		left: x + "px",
		width: ctrlRectOpt.width + "px",
		height: ctrlRectOpt.height + "px"
	});
	appInstance.getContainer().removeChild(appInstance.lookup(preGroupID.toString()));//폴더 아이콘 삭제
	console.log("ERROR Fixed : Completed");
}


/**
 * 특정 그룹을 삭제하는 서브미션
 * @param {String} groupID
 */
function onSmsDeleteGroup(groupID){
	/**
	 * @type cpr.protocols.Submission
	 */
	var smsDeleteGroup = new cpr.protocols.Submission("sms_deleteMenuGroups");
	smsDeleteGroup.action = "/v1/menuGroups/" + groupID;
	smsDeleteGroup.method = "DELETE";
	smsDeleteGroup.mediaType = "application/x-www-form-urlencoded";
	smsDeleteGroup.send();
	/**
	 * @type cpr.data.DataSet
	 */
	var groupList = appInstance.lookup("MenuGroup");
	smsDeleteGroup.addEventListenerOnce("submit-success", function(){
		var deleteRow = groupList.findFirstRow("MenuGroupID=="+groupID);
		groupList.realDeleteRow(deleteRow.getIndex());
	});
	redraw();
}

/**
 * 특정 그룹의 자식이 둘 미만일 때 자식의 아이디를 반환한다.
 * @param {String} groupID
 */
function getChildID(groupID){
	var rows = iconList.findAllRow("GroupID=="+groupID);
	var childID = null;
	if(rows.length<2){
		rows.forEach(function(/* cpr.data.Row */ each){
			childID = each.getValue("MenuID");
		});
	}
	return childID;
}


/**
 * 폴더 안의 아이콘 삭제시 호출하여 활용한다.
 * @param {any} app
 * @param {String} groupID
 */
exports.deleteGroupSub = function(app, groupID){
	appInstance = app;//전역변수에 할당하여 인스턴스 생성
	deleteGroup(groupID);//대상 아이콘 삭제 후 남는 아이콘이 한개가 되면 폴더 삭제 후 남은 하나의 아이콘도 바탕화면에 표시
	saveIconList();//변경된 아이콘 정보도 저장
}


/**
 * reOrder 함수를 호출하여 재정렬 한다.
 * @param {any} app
 * @param {any} select
 */
exports.redrawMain = function(app, select){
	appInstance = app;
	iconList = appInstance.lookup("MenuUser");
	reOrder(select);
}


/**
 * 도움말 영역으로부터 받은 데이터를 통해 바탕화면에 아이콘을 append 한다.
 * @param {any} value 메뉴아이디
 * @param {any} app
 * @param {cpr.controls.Button} ctrl 아이콘 (버튼)
 */
exports.appendIcons = function(value, app, ctrl){
	if(!dataManager){
		dataManager = getDataManager();
	}
	appInstance = app;
	iconList = appInstance.lookup("MenuUser");

	var orderRows = iconList.findAllRow("GroupID==0");
	var orderRowsLength = 0;
	if(orderRows){
		orderRowsLength = orderRows.length;
	}
	var data = {};
	data.MenuID = value;
	data.GroupID = 0;//그룹으로 append할때는 받아와야한다.
	data.order = orderRowsLength==0?0:orderRowsLength;//기존 바탕화면에 아이콘이 없다면 0 있다면 제일 마지막에 append
	data.PosX = parseInt(data.order/ctrlRectOpt.maxRow);
	data.PosY = data.order%ctrlRectOpt.maxRow;
	data.UserID = dataManager.getAccountID();
	data.AutoRun = 0;
	iconList.addRowData(data);
	isHelpMenu = true;
	helpIcon = ctrl;
	//서브미션
	var iconListSms = new cpr.protocols.Submission("sms_insertMenuUsers");
	iconListSms.action = "/v1/menuUsers";
	iconListSms.method = "POST";
	iconListSms.mediaType = "application/x-www-form-urlencoded";
	iconListSms.addRequestData(iconList);
	var resultMap = appInstance.lookup("Result");
	iconListSms.addResponseData(resultMap, false, "Result");
	iconListSms.send();
	iconListSms.addEventListenerOnce("submit-error", function(e){
		iconList.revert();
		redraw();
	});
	iconListSms.addEventListenerOnce("submit-done", function(e){
		if(resultMap.getValue("ResultCode")==0){
			iconList.commit();
		}else{
			iconList.revert();
		}

	});
	redraw();
}


function extractCtrlRect(ctrl,/*cpr.core.AppInstance*/app){
	if(!app){
		return null;
	}
	var layout = app.getContainer().getLayout();
	var constraint = app.getContainer().getConstraint(ctrl);
	if(!constraint&&ctrl){
		constraint = ctrl.getActualRect();
	}
	var left = 0;
	var top = 0;
	if(layout instanceof cpr.controls.layouts.ResponsiveXYLayout){
		var findConstraint = null;
		constraint.positions.some(function(each){
			if(each.media ==app.targetMedia){
				findConstraint = each;
				return true;
			}
			return false;
		});
		if(findConstraint!= null){
			left = parseInt(findConstraint.left);
			top = parseInt(findConstraint.top);
		}
	}else{
		left = parseInt(constraint.left);
		top = parseInt(constraint.top);
	}

	return {x:left,y:top};

}