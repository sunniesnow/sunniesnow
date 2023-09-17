Sunniesnow.Note = class Note extends Sunniesnow.NoteBase {
	static PROPERTIES = {
		required: ['x', 'y'],
		optional: {tipPoint: null}
	}

	static UI_CLASS = 'UiNote'
	static LEVEL_CLASS = 'LevelNote'
	static FX_CLASS = 'FxNote'
	static SE_CLASS = 'Se'
	static TYPE_NAME = 'note'

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

	getConnectedNote() {
		let match = null;
		for (let i = 0; i < this.simultaneousEvents.length; i++) {
			const event = this.simultaneousEvents[i];
			let condition = event instanceof Sunniesnow.Tap && Sunniesnow.game.settings.doubleLineTap;
			condition ||= event instanceof Sunniesnow.Drag && Sunniesnow.game.settings.doubleLineDrag;
			condition ||= event instanceof Sunniesnow.Hold && Sunniesnow.game.settings.doubleLineHold;
			condition ||= event instanceof Sunniesnow.Flick && Sunniesnow.game.settings.doubleLineFlick;
			if (!condition) {
				continue;
			}
			if (match === this) {
				return event
			}
			match = event;
		}
		return null;
	}
};
