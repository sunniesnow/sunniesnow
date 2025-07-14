Sunniesnow.EffectProgressBar = class EffectProgressBar extends Sunniesnow.EffectUiComponent {
	static ABSTRACT = false

	static TIME_DEPENDENT = {
		...Sunniesnow.EffectUiComponent.TIME_DEPENDENT,
		x: {value: 0.5, noDefault: true},
		y: {value: 1, noDefault: true},
		data: {value: null, nullable: true, noDefault: true}
	};

	static TYPE_NAME = 'effectProgressBar';
};
