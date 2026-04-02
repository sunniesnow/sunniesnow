Sunniesnow.HeadOnlyHold = class HeadOnlyHold extends Sunniesnow.Note {
	static ABSTRACT = false

	static PROPERTIES = {
		required: [...Sunniesnow.Note.PROPERTIES.required, 'duration'],
		optional: {...Sunniesnow.Note.PROPERTIES.optional, text: ''}
	}

	static TIME_DEPENDENT = {
		...Sunniesnow.Note.TIME_DEPENDENT,
		text: {interpolable: false},
	}

	static UI_CLASS = 'UiHeadOnlyHold'
	static LEVEL_CLASS = 'LevelHeadOnlyHold'
	static FX_CLASS = 'FxHeadOnlyHold'
	static SE_CLASS = 'SeHeadOnlyHold'
	static TYPE_NAME = 'headOnlyHold'

	vibrationTime() {
		return Sunniesnow.game.settings.headOnlyHoldVibrationTime;
	}

	vibrationEndTime() {
		return Sunniesnow.game.settings.vibrateDuringHeadOnlyHold ? super.vibrationEndTime() : this.vibrationStartTime();
	}

	userWantsDoubleLine() {
		return Sunniesnow.game.settings.doubleLineHeadOnlyHold;
	}
};
