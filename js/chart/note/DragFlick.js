Sunniesnow.DragFlick = class DragFlick extends Sunniesnow.Note {
	static ABSTRACT = false

	static PROPERTIES = {
		required: [...Sunniesnow.Note.PROPERTIES.required, 'angle'],
		optional: {...Sunniesnow.Note.PROPERTIES.optional}
	}

	static UI_CLASS = 'UiDragFlick'
	static LEVEL_CLASS = 'LevelDragFlick'
	static FX_CLASS = 'FxFlick'
	static SE_CLASS = 'SeDrag'
	static TYPE_NAME = 'dragFlick'

	checkProperties() {
		return super.checkProperties() && this.assertType("angle", "number");
	}

	vibrationTime() {
		return Sunniesnow.game.settings.dragFlickVibrationTime;
	}

	userWantsDoubleLine() {
		return Sunniesnow.game.settings.doubleLineDragFlick;
	}
};
