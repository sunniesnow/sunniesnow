Sunniesnow.Flick = class Flick extends Sunniesnow.Note {
	static PROPERTIES = {
		required: ['x', 'y', 'angle'],
		optional: {text: '', tipPoint: null}
	}

	static UI_CLASS = 'UiFlick'
	static LEVEL_CLASS = 'LevelFlick'
	static FX_CLASS = 'FxFlick'
	static SE_CLASS = 'SeFlick'
	static TYPE_NAME = 'flick'

	checkProperties() {
		return super.checkProperties() && this.assertType("angle", "number");
	}
};
