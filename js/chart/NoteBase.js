Sunniesnow.NoteBase = class NoteBase extends Sunniesnow.Event {
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
