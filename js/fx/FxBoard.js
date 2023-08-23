Sunniesnow.FxBoard = class FxBoard extends PIXI.Container {
	constructor() {
		super();
		this.presentFx = [];
		this.back = new PIXI.Container();
	}

	clear() {
		while (this.presentFx.length > 0) {
			const fx = this.presentFx.shift();
			fx.destroy({children: true});
			this.removeChild(fx);
			this.back.removeChild(fx.back);
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
		const fx = uiNote.newFx();
		if (Sunniesnow.game.settings.reverseNoteOrder) {
			this.addChildAt(fx, 0);
			this.back.addChildAt(fx.back, 0);
		} else {
			this.addChild(fx);
			this.back.addChild(fx.back);
		}
		this.presentFx.push(fx);
	}
	
};
