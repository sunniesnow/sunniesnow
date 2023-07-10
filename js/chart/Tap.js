Sunniesnow.Tap = class Tap extends Sunniesnow.Note {
	static PROPERTIES = {
		required: ['x', 'y'],
		optional: { tipPoint: null, text: '' }
	}

	static UI_CLASS = 'UiTap'
	static LEVEL_CLASS = 'LevelTap'
	static FX_CLASS = 'FxTap'
	static SE_CLASS = 'SeTap'
	static TYPE_NAME = 'tap'
};
