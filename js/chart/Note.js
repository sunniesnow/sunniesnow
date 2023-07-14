Sunniesnow.Note = class Note extends Sunniesnow.Event {
	static PROPERTIES = {
		required: ['x', 'y'],
		optional: {tipPoint: null}
	}

	static UI_CLASS = 'UiNote'
	static LEVEL_CLASS = 'LevelNote'
	static FX_CLASS = 'FxNote'
	static SE_CLASS = 'Se'
	static TYPE_NAME = 'note'

	appearTime() {
		const activeDuration = Sunniesnow.Config.fromSpeedToTime(Sunniesnow.game.settings.speed);
		return this.time - activeDuration - Sunniesnow[this.constructor.UI_CLASS].FADING_IN_DURATION;
	}

	hitSe(when) {
		try {
			Sunniesnow[this.constructor.SE_CLASS].hit(this.id, when);
		} catch (e) {
			Sunniesnow.Utils.warn(`Failed to play hit SE for ${this.constructor.TYPE_NAME} ${this.id}: ${e}`, e);
		}
	}

	releaseSe(when) {
		try {
			Sunniesnow[this.constructor.SE_CLASS].release(this.id, when);
		} catch (e) {
			Sunniesnow.Utils.warn(`Failed to play release SE for ${this.constructor.TYPE_NAME} ${this.id}: ${e}`, e);
		}
	}

	newLevelNote() {
		const result = new Sunniesnow[this.constructor.LEVEL_CLASS](this);
		this.levelNote = result;
		return result;
	}

};
