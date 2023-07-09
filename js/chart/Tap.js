Sunniesnow.Tap = class Tap extends Sunniesnow.Note {
	static PROPERTIES = {
		required: ['x', 'y'],
		optional: { tipPoint: null, text: '' }
	}

	static UI_CLASS = Sunniesnow.UiTap
	static LEVEL_CLASS = Sunniesnow.LevelTap
	static FX_CLASS = Sunniesnow.FxTap
	static SE_CLASS = Sunniesnow.SeTap
	static TYPE_NAME = 'tap'
};
