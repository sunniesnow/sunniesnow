Sunniesnow.UiBigText = class UiBigText extends Sunniesnow.UiBgPattern {
	static async load() {
		if (Sunniesnow.game.chart.events.some(e => e instanceof Sunniesnow.BigText)) {
			try {
				await Sunniesnow.Assets.loadFont(
					'https://fastly.jsdelivr.net/gh/kaio/wangfonts/TrueType/wt071.ttf',
					'HanWangShinSuMedium-Regular'
				);
				await Sunniesnow.Assets.loadFont(
					'https://fastly.jsdelivr.net/gh/Kinutafontfactory/Yuji/fonts/ttf/YujiBoku-Regular.ttf',
					'YujiBoku-Regular'
				);
			} catch (e) {
				Sunniesnow.Utils.warn(`Failed to load font for big texts: ${e.message ?? e}`, e);
			}
		}
		this.fontSize = Sunniesnow.Config.radius * 5 * Sunniesnow.Config.scale();
		this.maxWidth = Sunniesnow.Config.minWidth * Sunniesnow.Config.scale();
	}

	populate() {
		super.populate();
		if (this.event.text.length > 20) {
			Sunniesnow.Utils.warn(`Text "${this.event.text}" is too long`);
			this.aborted = true;
			return;
		}
		this.text = new PIXI.Text(this.event.text, {
			fontFamily: 'HanWangShinSuMedium-Regular,YujiBoku-Regular,Arial',
			fontSize: this.constructor.fontSize,
			fill: 0xffffff,
			align: 'center',
			padding: this.constructor.fontSize / 2
		});
		this.text.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0.5);
		this.scale.set(Math.min(2, this.constructor.maxWidth / this.text.width));
		this.addChild(this.text);
		this.alpha = 0.8;
	}

	updateFadingIn(progress, relativeTime) {
		super.updateFadingIn(progress, relativeTime);
		if (this.aborted) {
			return;
		}
		this.text.alpha = progress;
		this.text.scale.set(progress);
	}

	updateHolding(progress, relativeTime) {
		super.updateHolding(progress, relativeTime);
		if (this.aborted) {
			return;
		}
		this.text.alpha = 1;
		this.text.scale.set(1);
	}

	updateFadingOut(progress, relativeTime) {
		super.updateFadingOut(progress, relativeTime);
		if (this.aborted) {
			return;
		}
		this.text.alpha = 1 - progress;
	}
};
