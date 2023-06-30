Sunniesnow.Drag = class Drag extends Sunniesnow.Note {
	static PROPERTIES = {
		required: ['x', 'y'],
		optional: { tipPoint: null }
	}

	static UI_CLASS = Sunniesnow.UiDrag
	static LEVEL_CLASS = Sunniesnow.LevelDrag
	static FX_CLASS = Sunniesnow.FxDrag
	static TYPE_NAME = 'drag'
};
