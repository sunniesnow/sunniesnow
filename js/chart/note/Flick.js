Sunniesnow.Flick = class Flick extends Sunniesnow.Note {
	static ABSTRACT = false

	static PROPERTIES = {
		required: [...Sunniesnow.Note.PROPERTIES.required, 'angle'],
		optional: {...Sunniesnow.Note.PROPERTIES.optional, text: ''}
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

	userWantsDoubleLine() {
		return Sunniesnow.game.settings.doubleLineFlick;
	}
};
