Sunniesnow.BgPattern = class BgPattern extends Sunniesnow.FilterableEvent {
	static PROPERTIES = {
		required: [],
		optional: {duration: 0}
	}

	static TIME_DEPENDENT = {
		x: {value: 0},
		y: {value: 0},
		opacity: {value: 1},
		size: {value: 1},
		scaleX: {value: 1},
		scaleY: {value: 1},
		skewX: {value: 0},
		skewY: {value: 0},
		rotation: {value: 0},
		tintRed: {value: 1},
		tintGreen: {value: 1},
		tintBlue: {value: 1},
		blendMode: {value: 'normal', interpolable: false}
	}

	static UI_CLASS = 'UiBgPattern'
	static TYPE_NAME = 'bgPattern'

	checkProperties() {
		return super.checkProperties() && this.assertType("duration", "number");
	}
};
