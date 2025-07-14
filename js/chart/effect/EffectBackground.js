Sunniesnow.EffectBackground = class EffectBackground extends Sunniesnow.EffectUiComponent {
	static ABSTRACT = false

	static TIME_DEPENDENT = {
		...Sunniesnow.EffectUiComponent.TIME_DEPENDENT,
		x: {value: 0.5, noDefault: true},
		y: {value: 0.5, noDefault: true}
	};

	static TYPE_NAME = 'effectBackground';
};
