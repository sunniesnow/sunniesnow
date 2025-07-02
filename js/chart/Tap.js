Sunniesnow.Tap = class Tap extends Sunniesnow.Note {
	static PROPERTIES = {
		required: ['x', 'y'],
		optional: {tipPoint: null, text: '', size: 1}
	}

	static TIME_DEPENDENT = {
		...Sunniesnow.NoteBase.TIME_DEPENDENT,
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
};
