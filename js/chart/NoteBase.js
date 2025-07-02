Sunniesnow.NoteBase = class NoteBase extends Sunniesnow.Event {
	static TIME_DEPENDENT = {
		x: {},
		y: {},
		circle: {speed: 1, value: 0},
		opacity: {value: 1},
		size: {},
		angle: {value: 0}
	}

	static UI_CLASS = 'UiNoteBase'
	static LEVEL_CLASS = 'LevelNoteBase'
	static TYPE_NAME = 'noteBase'

	appearTime() {
		const activeDuration = Sunniesnow.Config.fromSpeedToTime(Sunniesnow.game.settings.speed);
		return this.time - activeDuration - this.uiClass().fadingInDuration(this);
	}

	checkProperties() {
		return super.checkProperties() && this.assertType("x", "number") && this.assertType("y", "number");
	}
};
