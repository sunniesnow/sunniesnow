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
		if (!super.checkProperties()) {
			return false;
		}
		if (Array.isArray(this.angle)) {
			this.angles = this.angle;
		} else {
			this.angles = [this.angle];
		}
		if (this.angles.length === 0) {
			Sunniesnow.Logs.warn(`Property \`angle\` in ${this.constructor.TYPE_NAME} event must be a number or an nonempty array of numbers`);
			return false;
		}
		for (const angle of this.angles) {
			if (typeof angle !== "number") {
				Sunniesnow.Logs.warn(`Property \`angle\` in ${this.constructor.TYPE_NAME} event must be a number or an nonempty array of numbers`);
				return false;
			}
		}
		return true;
	}

	vibrationTime() {
		return Sunniesnow.game.settings.dragFlickVibrationTime;
	}

	userWantsDoubleLine() {
		return Sunniesnow.game.settings.doubleLineDragFlick;
	}
};
