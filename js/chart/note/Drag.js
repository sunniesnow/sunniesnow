Sunniesnow.Drag = class Drag extends Sunniesnow.Note {
	static PROPERTIES = {
		required: ['x', 'y'],
		optional: {tipPoint: null, size: 1}
	}

	static UI_CLASS = 'UiDrag'
	static LEVEL_CLASS = 'LevelDrag'
	static FX_CLASS = 'FxDrag'
	static SE_CLASS = 'SeDrag'
	static TYPE_NAME = 'drag'

	vibrationTime() {
		return Sunniesnow.game.settings.dragVibrationTime;
	}
};
