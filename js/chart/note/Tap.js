Sunniesnow.Tap = class Tap extends Sunniesnow.Note {
	static ABSTRACT = false

	static PROPERTIES = {
		required: [...Sunniesnow.Note.PROPERTIES.required],
		optional: {...Sunniesnow.Note.PROPERTIES.optional, text: ''}
	}

	static TIME_DEPENDENT = {
		...Sunniesnow.Note.TIME_DEPENDENT,
		text: {interpolable: false},
	}

	static UI_CLASS = 'UiTap'
	static LEVEL_CLASS = 'LevelTap'
	static FX_CLASS = 'FxTap'
	static SE_CLASS = 'SeTap'
	static TYPE_NAME = 'tap'

	vibrationTime() {
		return Sunniesnow.game.settings.tapVibrationTime;
	}

	userWantsDoubleLine() {
		return Sunniesnow.game.settings.doubleLineTap;
	}
};
