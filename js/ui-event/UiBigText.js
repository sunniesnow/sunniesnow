Sunniesnow.UiBigText = class UiBigText extends Sunniesnow.UiBgPattern {
	static async load() {
		//if (Sunniesnow.game.chart.events.some(e => e instanceof Sunniesnow.BigText)) {
			await PIXI.Assets.load({
				src: 'https://fastly.jsdelivr.net/gh/dictcp/wangfonts/TrueType/wt071.ttf',
				data: {family: 'HanWangShinSuMedium-Regular'}
			});
		//}
	}

	populate() {
		super.populate();
		this.text = new PIXI.Text(this.event.text, {
			fontFamily: 'HanWangShinSuMedium-Regular',
			fontSize: Sunniesnow.Config.radius * 12 * Sunniesnow.Config.scale(),
			fill: 0xffffff,
			align: 'center'
		});
		this.text.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0.5);
		this.addChild(this.text);
		this.alpha = 0.8;
	}

	updateFadingIn(progress, relativeTime) {
		super.updateFadingIn(progress, relativeTime);
		this.text.alpha = progress;
		this.text.scale.set(progress);
	}

	updateHolding(progress, relativeTime) {
		super.updateHolding(progress, relativeTime);
		this.text.alpha = 1;
		this.text.scale.set(1);
	}

	updateFadingOut(progress, relativeTime) {
		super.updateFadingOut(progress, relativeTime);
		this.text.alpha = 1 - progress;
	}
};
