Sunniesnow.EffectTipPoint = class EffectTipPoint extends Sunniesnow.Event {
	static PROPERTIES = {
		required: ['duration', 'tipPoint'],
		optional: {}
	}

	static TIME_DEPENDENT = {
		x: {value: 0, noDefault: true},
		y: {value: 0, noDefault: true},
		opacity: {value: 1, noDefault: true},
		size: {value: 1, noDefault: true},
		rotation: {value: 0, noDefault: true},
		tintRed: {value: 1, noDefault: true},
		tintGreen: {value: 1, noDefault: true},
		tintBlue: {value: 1, noDefault: true},
		blendMode: {value: 'normal', interpolable: false, noDefault: true}
	}

	static TYPE_NAME = 'effectTipPoint'
};
