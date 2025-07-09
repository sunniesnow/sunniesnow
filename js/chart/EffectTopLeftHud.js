Sunniesnow.EffectTopLeftHud = class EffectTopLeftHud extends Sunniesnow.EffectUiComponent {

	static TIME_DEPENDENT = {
		...Sunniesnow.EffectUiComponent.TIME_DEPENDENT,
		x: {value: 0, noDefault: true},
		y: {value: 0, noDefault: true}
	};

	static TYPE_NAME = 'effectTopLeftHud';
};
