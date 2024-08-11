Sunniesnow.FxNote = class FxNote extends PIXI.Container {

	static async load() {
	}

	constructor(levelNote) {
		super();
		this.front = new PIXI.Container();
		this.state = 'present'; // present -> finished
		this.levelNote = levelNote;
		[this.x, this.y] = [this.front.x, this.front.y] = Sunniesnow.Config.chartMapping(levelNote.event.x, levelNote.event.y);
		this.judgement = levelNote.judgement || levelNote.highestJudgement;
		this.earlyLate = levelNote.earlyLate;
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

	destroy(options) {
		super.destroy(options);
		this.front.destroy(options);
	}

};
