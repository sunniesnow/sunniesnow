Sunniesnow.FxBoard = class FxBoard extends PIXI.Container {
	constructor() {
		super();
		this.label = 'fx-board';
		this.presentFx = [];
		this.frontLayer = new PIXI.RenderLayer();
		this.frontLayer.label = 'fx-board-front-layer';
		if (Sunniesnow.game.settings.hideFxInFront) {
			this.frontLayer.visible = false;
		}
		this.addLevelEventListeners();
	}

	clear() {
		while (this.presentFx.length > 0) {
			this.presentFx.shift().destroy({children: true});
		}
		this.addLevelEventListeners();
	}

	update(delta) {
		Sunniesnow.Utils.eachWithRedoingIf(this.presentFx, (fx, i) => {
			fx.update(delta);
			if (fx.state == 'finished') {
				fx.destroy({children: true});
				this.presentFx.splice(i, 1);
				return true;
			}
		});
	}

	addFx(levelNote) {
		const judgement = levelNote.judgement || levelNote.highestJudgement;
		if (judgement === 'perfect' && Sunniesnow.game.settings.hideFxPerfect) {
			return;
		}
		const fx = levelNote.event.newFx(levelNote, this.frontLayer);
		if (Sunniesnow.game.settings.reverseNoteOrder) {
			this.addChildAt(fx, 0);
		} else {
			this.addChild(fx);
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
