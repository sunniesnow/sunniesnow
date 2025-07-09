Sunniesnow.EffectTopRightHud = class EffectTopRightHud extends Sunniesnow.EffectUiComponent {

	static TIME_DEPENDENT = {
		...Sunniesnow.EffectUiComponent.TIME_DEPENDENT,
		x: {value: 1, noDefault: true},
		y: {value: 0, noDefault: true}
	};

	static TYPE_NAME = 'effectTopRightHud';
};
