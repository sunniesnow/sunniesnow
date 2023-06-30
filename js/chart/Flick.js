Sunniesnow.Flick = class Flick extends Sunniesnow.Note {
	static PROPERTIES = {
		required: ['x', 'y', 'angle'],
		optional: {text: '', tipPoint: null}
	}

	static UI_CLASS = Sunniesnow.UiFlick
	static LEVEL_CLASS = Sunniesnow.LevelFlick
	static FX_CLASS = Sunniesnow.FxFlick
	static TYPE_NAME = 'flick'
};
