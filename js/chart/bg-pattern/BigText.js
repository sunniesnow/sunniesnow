Sunniesnow.BigText = class BigText extends Sunniesnow.BgPattern {
	static PROPERTIES = {
		required: ['text'],
		optional: {duration: 0}
	}

	static TIME_DEPENDENT = {
		...Sunniesnow.BgPattern.TIME_DEPENDENT,
		text: {interpolable: false}
	}

	static UI_CLASS = 'UiBigText'
	static TYPE_NAME = 'bigText'
};
