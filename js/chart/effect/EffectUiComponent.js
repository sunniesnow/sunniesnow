Sunniesnow.EffectUiComponent = class EffectUiComponent extends Sunniesnow.FilterableEvent {

	static PROPERTIES = {
		required: ['duration'],
		optional: {}
	}

	static TIME_DEPENDENT = {
		x: {value: 0, noDefault: true},
		y: {value: 0, noDefault: true},
		opacity: {value: 1, noDefault: true},
		size: {value: 1, noDefault: true},
		scaleX: {value: 1, noDefault: true},
		scaleY: {value: 1, noDefault: true},
		skewX: {value: 0, noDefault: true},
		skewY: {value: 0, noDefault: true},
		rotation: {value: 0, noDefault: true},
		tintRed: {value: 1, noDefault: true},
		tintGreen: {value: 1, noDefault: true},
		tintBlue: {value: 1, noDefault: true},
		blendMode: {value: 'normal', interpolable: false, noDefault: true},
		data: {interpolable: false, value: null, noDefault: true}
	};

	static TYPE_NAME = 'effectUiComponent'
};
