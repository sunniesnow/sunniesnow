Sunniesnow.BgPattern = class BgPattern extends Sunniesnow.Event {
	static PROPERTIES = {
		required: [],
		optional: {duration: 0}
	}

	static UI_CLASS = 'UiBgPattern'
	static TYPE_NAME = 'bgPattern'

	checkProperties() {
		return super.checkProperties() && this.assertType("duration", "number");
	}
};
