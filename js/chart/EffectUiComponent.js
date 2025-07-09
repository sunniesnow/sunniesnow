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
		data: {interpolable: false, value: null, noDefault: true}
	};

	static TYPE_NAME = 'effectUiComponent';
};
