Sunniesnow.FxBoard = class FxBoard extends PIXI.Container {
	constructor() {
		super();
		this.presentFx = [];
	}

	clear() {
		while (this.presentFx.length > 0) {
			const fx = this.presentFx.shift();
			fx.destroy({children: true});
			this.removeChild(fx);
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
		const fx = new uiNote.event.constructor.FX_CLASS(uiNote);
		this.addChild(fx);
		this.presentFx.push(fx);
	}
	
}