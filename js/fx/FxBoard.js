Sunniesnow.FxBoard = class FxBoard extends PIXI.Container {
	constructor() {
		super();
		this.presentFx = [];
		if (!Sunniesnow.game.settings.hideFxInFront) {
			this.front = new PIXI.Container();
		}
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

	addFx(uiNote) {
		const levelNote = uiNote.levelNote;
		const judgement = levelNote.judgement || levelNote.highestJudgement;
		if (judgement === 'perfect' && Sunniesnow.game.settings.hideFxPerfect) {
			return;
		}
		const fx = uiNote.newFx(uiNote);
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
	
};
