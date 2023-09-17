Sunniesnow.NoteBase = class NoteBase extends Sunniesnow.Event {
	static UI_CLASS = 'UiNoteBase'
	static LEVEL_CLASS = 'LevelNoteBase'
	static TYPE_NAME = 'noteBase'

	appearTime() {
		const activeDuration = Sunniesnow.Config.fromSpeedToTime(Sunniesnow.game.settings.speed);
		return this.time - activeDuration - Sunniesnow[this.constructor.UI_CLASS].FADING_IN_DURATION;
	}
};
