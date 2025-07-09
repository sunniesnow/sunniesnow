Sunniesnow.Hold = class Hold extends Sunniesnow.Note {
	static PROPERTIES = {
		required: ['x', 'y', 'duration'],
		optional: {tipPoint: null, text: '', size: 1}
	}

	static TIME_DEPENDENT = {
		...Sunniesnow.Note.TIME_DEPENDENT,
		text: {interpolable: false},
	}

	static UI_CLASS = 'UiHold'
	static LEVEL_CLASS = 'LevelHold'
	static FX_CLASS = 'FxHold'
	static SE_CLASS = 'SeHold'
	static TYPE_NAME = 'hold'

	vibrationTime() {
		return Sunniesnow.game.settings.holdVibrationTime;
	}
};
