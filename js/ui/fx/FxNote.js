// The children referred to by this.front will be shown in front of all notes.
Sunniesnow.FxNote = class FxNote extends PIXI.Container {

	static async load() {
	}

	constructor(levelNote, frontLayer) {
		super();
		this.state = 'present'; // present -> finished
		this.levelNote = levelNote;
		this.judgement = levelNote.judgement || levelNote.highestJudgement;
		this.earlyLate = levelNote.earlyLate;
		this.populate();
		this.position.set(...Sunniesnow.Config.chartMapping(levelNote.event.x, levelNote.event.y));
		if (Sunniesnow.game.settings.scroll) {
			this.y = Sunniesnow.Config.SCROLL_END_Y;
		}
		if (this.front) {
			frontLayer?.attach(this.front);
			this.front.position.set(this.position);
		}
	}

	populate() {
		switch (this.judgement) {
			case 'perfect':
				this.populatePerfect();
				break;
			case 'good':
				this.populateGood();
				break;
			case 'bad':
				this.populateBad();
				break;
			case 'miss':
				this.populateMiss();
				break;
		}
	}

	update(delta) {
		if (this.state === 'finished') {
			return;
		}
		switch (this.judgement) {
			case 'perfect':
				this.updatePerfect(delta);
				break;
			case 'good':
				this.updateGood(delta);
				break;
			case 'bad':
				this.updateBad(delta);
				break;
			case 'miss':
				this.updateMiss(delta);
				break;
		}
	}

	populatePerfect() {
	}

	updatePerfect(delta) {
		this.state = 'finished';
	}

	populateGood() {
	}

	updateGood(delta) {
		this.state = 'finished';
	}

	populateBad() {
	}

	updateBad(delta) {
		this.state = 'finished';
	}

	populateMiss() {
	}

	updateMiss(delta) {
		this.state = 'finished';
	}

};
