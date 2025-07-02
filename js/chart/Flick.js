Sunniesnow.Flick = class Flick extends Sunniesnow.Note {
	static PROPERTIES = {
		required: ['x', 'y', 'angle'],
		optional: {text: '', tipPoint: null, size: 1}
	}

	static TIME_DEPENDENT = {
		...Sunniesnow.Note.TIME_DEPENDENT,
		text: {interpolable: false},
	}

	static UI_CLASS = 'UiFlick'
	static LEVEL_CLASS = 'LevelFlick'
	static FX_CLASS = 'FxFlick'
	static SE_CLASS = 'SeFlick'
	static TYPE_NAME = 'flick'

	checkProperties() {
		return super.checkProperties() && this.assertType("angle", "number");
	}

	vibrationTime() {
		return Sunniesnow.game.settings.flickVibrationTime;
	}
};
