Sunniesnow.BgPattern = class BgPattern extends Sunniesnow.Event {
	static PROPERTIES = {
		required: [],
		optional: {duration: 0}
	}

	static TIME_DEPENDENT = {
		x: {value: 0},
		y: {value: 0},
		opacity: {value: 1},
		size: {value: 1},
		rotation: {value: 0}
	}

	static UI_CLASS = 'UiBgPattern'
	static TYPE_NAME = 'bgPattern'

	checkProperties() {
		return super.checkProperties() && this.assertType("duration", "number");
	}
};
