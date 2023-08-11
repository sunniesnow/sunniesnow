Sunniesnow.FxNote = class FxNote extends PIXI.Container {

	static async load() {
	}

	constructor(uiNote) {
		super();
		this.state = 'present'; // present -> finished
		this.uiNote = uiNote;
		this.x = uiNote.x;
		this.y = uiNote.y;
		this.judgement = uiNote.levelNote.judgement || uiNote.levelNote.highestJudgement;
		this.populate();
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
