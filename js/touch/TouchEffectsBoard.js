Sunniesnow.TouchEffectsBoard = class TouchEffectsBoard extends PIXI.Container {

	constructor() {
		super();
		this.presentTouchEffects = [];
	}

	clear() {
		while (this.presentTouchEffects.length > 0) {
			const touchEffect = this.presentTouchEffects.shift();
			touchEffect.destroy({children: true});
			this.removeChild(touchEffect);
		}
	}

	update(delta) {
		this.presentTouchEffects.forEach((touchEffect) => {
			touchEffect.update(delta);
			if (touchEffect.state == 'finished') {
				touchEffect.destroy({children: true});
				this.removeChild(touchEffect);
				this.presentTouchEffects.splice(this.presentTouchEffects.indexOf(touchEffect), 1);
			}
		});
	}

	addTouchEffect(touch) {
		const touchEffect = new Sunniesnow.TouchEffect(touch);
		this.addChild(touchEffect);
		this.presentTouchEffects.push(touchEffect);
	}
};
