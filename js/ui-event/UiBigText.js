Sunniesnow.UiBigText = class UiBigText extends Sunniesnow.UiBgPattern {
	static async load() {
		if (Sunniesnow.game.chart.events.some(e => e instanceof Sunniesnow.BigText)) {
			await Sunniesnow.Assets.loadFont(
				'https://fastly.jsdelivr.net/gh/dictcp/wangfonts/TrueType/wt071.ttf',
				'HanWangShinSuMedium-Regular'
			);
		}
		this.fontSize = Sunniesnow.Config.radius * 10 * Sunniesnow.Config.scale();
		this.maxWidth = Sunniesnow.Config.minWidth * Sunniesnow.Config.scale();
	}

	populate() {
		super.populate();
		this.text = new PIXI.Text(this.event.text, {
			fontFamily: 'HanWangShinSuMedium-Regular',
			fontSize: this.constructor.fontSize,
			fill: 0xffffff,
			align: 'center'
		});
		this.text.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0.5);
		if (this.text.width > this.constructor.maxWidth) {
			this.scale.set(this.constructor.maxWidth / this.text.width);
		}
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
