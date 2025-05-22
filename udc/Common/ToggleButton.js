/************************************************
 * ToggleButton.js
 * Created at 2019. 1. 29. 오후 2:56:58.
 *
 * @author jeeeyul
 ************************************************/

var isOn = false;

/** @type cpr.animation.Animator */
var activeAnimator;

/*
 * Body에서 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit( /* cpr.events.CEvent */ e) {}

/*
 * 슬라이더에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onSld1Click( /* cpr.events.CMouseEvent */ e) {
	toggle();
}

/*
 * Body에서 property-change 이벤트 발생 시 호출.
 * 앱의 속성이 변경될 때 발생하는 이벤트 입니다.
 */
//function onBodyPropertyChange( /* cpr.events.CPropertyChangeEvent */ e) {
//	var slider = app.lookup("sld1");
//	console.log("xxxx");
//	switch (e.property) {
//		case "value":
//			{
//				if (e.newValue) {
//					slider.value = 100;
//				} else {
//					slider.value = 0;
//				}
//				isOn = e.newValue;
//				break;
//			}
//	}
//}

/**
 * 토글 애니메이션을 실행 하고 value 속성을 반전시킵니다.
 */
function toggle() {
	var slider = app.lookup("sld1");
	if (activeAnimator) {
		activeAnimator.stop();
	}
	
	activeAnimator = new cpr.animation.Animator(0.3, cpr.animation.TimingFunction.EASE_OUT_CUBIC);
	if (!isOn) {
		activeAnimator.addTask(function(p) {
			slider.value = Math.round(100 * p);
			if (slider.value === "100") {
				slider.style.handle.css("background-color", "#006938");
			}
		});
	} else {
		activeAnimator.addTask(function(p) {
			slider.value = Math.round(100 * (1 - p));
			if (slider.value === "0") {
				slider.style.handle.css("background-color", "#FFFFFF");
			}
		});
	}
	isOn = !isOn;
	activeAnimator.run().then(function(input) {
		activeAnimator = null;
	});
	app.setAppProperty("value", isOn);
	var event = new cpr.events.CValueChangeEvent("value-change", {
		oldValue: !isOn,
		newValue: isOn
	});
	app.dispatchEvent(event);
};

exports.toggle = toggle;