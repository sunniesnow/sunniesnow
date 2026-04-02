Sunniesnow.Drag = class Drag extends Sunniesnow.Note {
	static ABSTRACT = false

	static PROPERTIES = {
		required: [...Sunniesnow.Note.PROPERTIES.required],
		optional: {...Sunniesnow.Note.PROPERTIES.optional}
	}

	static UI_CLASS = 'UiDrag'
	static LEVEL_CLASS = 'LevelDrag'
	static FX_CLASS = 'FxDrag'
	static SE_CLASS = 'SeDrag'
	static TYPE_NAME = 'drag'

	vibrationTime() {
		return Sunniesnow.game.settings.dragVibrationTime;
	}

	userWantsDoubleLine() {
		return Sunniesnow.game.settings.doubleLineDrag;
	}
};
