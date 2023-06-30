Sunniesnow.Level = class Level {
	constructor() {
		this.initializeNoteStores();
		this.notesCount = this.unhitNotes.length;
		this.initializePlayInfo();
	}

	initializeNoteStores() {
		this.unhitNotes = [];
		for (const event of Sunniesnow.game.chart.events) {
			if (event instanceof Sunniesnow.Note) {
				const levelNote = new event.constructor.LEVEL_CLASS(event);
				this.unhitNotes.push(levelNote);
				event.levelNote = levelNote;
			}
		}
		this.unhitNotes.sort((a, b) => a.time - b.time);
		this.holdingNotes = [];
	}

	initializePlayInfo() {
		this.perfect = 0;
		this.good = 0;
		this.bad = 0;
		this.miss = 0;
		this.combo = 0;
		this.maxCombo = 0;
		this.lastJudgement = null;
		this.apFcIndicator = 'ap'; // possible values: 'ap', 'fc', ''
	}

	score() {
		const accuracy = this.effectiveHits() / this.notesCount;
		return Math.floor(900000 * accuracy + 100000 * this.maxCombo / this.notesCount);
	}

	accuracy() {
		const denominator = this.perfect + this.good + this.bad + this.miss;
		return denominator === 0 ? 1 : this.effectiveHits() / denominator;
	}

	effectiveHits() {
		return this.perfect + this.good / 2 + this.bad / 10;
	}

	update(time) {
		if (Sunniesnow.game.settings.autoplay) {
			this.updateAutoPlay(time);
		} else {
			// TODO
		}
	}

	updateAutoPlay(time) {
		while (this.unhitNotes.length > 0) {
			const note = this.unhitNotes[0];
			if (time < note.time) {
				break;
			}
			this.unhitNotes.shift();
			note.hitRelativeTime = 0;
			this.holdingNotes.push(note);
			this.holdingNotes.sort((a, b) => a.endTime - b.endTime);
		}
		while (this.holdingNotes.length > 0) {
			const note = this.holdingNotes[0];
			if (time < note.endTime) {
				break;
			}
			this.holdingNotes.shift();
			note.releaseRelativeTime = note.endTime - note.time;
			this.newJudgement(note, 'perfect');
		}
	}

	newJudgement(note, judgement) {
		note.judgement = judgement;
		switch (judgement) {
			case 'good':
				if (this.apFcIndicator === 'ap') {
					this.apFcIndicator = 'fc';
				}
			case 'perfect':
				this.combo++;
				break;
			case 'bad':
			case 'miss':
				this.apFcIndicator = '';
				this.combo = 0;
				break;
		}
		this.maxCombo = Math.max(this.maxCombo, this.combo);
		this.lastJudgement = judgement;
		this[judgement]++;
	}
};
