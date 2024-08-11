Sunniesnow.FxBoard = class FxBoard extends PIXI.Container {
	constructor() {
		super();
		this.presentFx = [];
		if (!Sunniesnow.game.settings.hideFxInFront) {
			this.front = new PIXI.Container();
		}
		this.addLevelEventListeners();
	}

	clear() {
		while (this.presentFx.length > 0) {
			const fx = this.presentFx.shift();
			fx.destroy({children: true});
			this.removeChild(fx);
			if (!Sunniesnow.game.settings.hideFxInFront) {
				this.front.removeChild(fx.front);
			}
		}
		this.addLevelEventListeners();
	}

	update(delta) {
		this.presentFx.forEach((fx) => {
			fx.update(delta);
			if (fx.state == 'finished') {
				fx.destroy({children: true});
				this.removeChild(fx);
				this.presentFx.splice(this.presentFx.indexOf(fx), 1);
			}
		});
	}

	addFx(levelNote) {
		const judgement = levelNote.judgement || levelNote.highestJudgement;
		if (judgement === 'perfect' && Sunniesnow.game.settings.hideFxPerfect) {
			return;
		}
		const fx = levelNote.event.newFx(levelNote);
		if (Sunniesnow.game.settings.reverseNoteOrder) {
			this.addChildAt(fx, 0);
			if (!Sunniesnow.game.settings.hideFxInFront) {
				this.front.addChildAt(fx.front, 0);
			}
		} else {
			this.addChild(fx);
			if (!Sunniesnow.game.settings.hideFxInFront) {
				this.front.addChild(fx.front);
			}
		}
		this.presentFx.push(fx);
	}
	
	addLevelEventListeners() {
		this.listenerForFx = event => {
			const levelNote = event.levelNote;
			let condition = levelNote instanceof Sunniesnow.LevelHold && !Sunniesnow.game.settings.hideFxHoldStart
			condition &&= event.type === 'hit';
			condition ||= event.type === 'release' || event.type === 'miss';
			if (condition) {
				this.addFx(levelNote);
			}
		}
		Sunniesnow.game.level.addEventListener('hit', this.listenerForFx);
		Sunniesnow.game.level.addEventListener('release', this.listenerForFx);
		Sunniesnow.game.level.addEventListener('miss', this.listenerForFx);
	}

	removeLevelEventListeners() {
		if (!this.listenerForFx) {
			return;
		}
		Sunniesnow.game.level.removeEventListener('hit', this.listenerForFx);
		Sunniesnow.game.level.removeEventListener('release', this.listenerForFx);
		Sunniesnow.game.level.removeEventListener('miss', this.listenerForFx);
		this.listenerForFx = null;
	}

	destroy(options) {
		this.removeLevelEventListeners();
		super.destroy(options);
	}

};
