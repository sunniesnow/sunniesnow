Sunniesnow.EffectUiComponent = class EffectUiComponent extends Sunniesnow.Event {

	static PROPERTIES = {
		required: ['duration'],
		optional: {}
	}

	static TIME_DEPENDENT = {
		x: {value: 0, noDefault: true},
		y: {value: 0, noDefault: true},
		opacity: {value: 1, noDefault: true},
		size: {value: 1, noDefault: true},
		rotation: {value: 0, noDefault: true},
		tintRed: {value: 1},
		tintGreen: {value: 1},
		tintBlue: {value: 1},
		blendMode: {value: 'normal', interpolable: false},
		data: {interpolable: false, value: null, noDefault: true}
	};

	static TYPE_NAME = 'effectUiComponent';
};
