Sunniesnow.UiBigText = class UiBigText extends Sunniesnow.UiBgPattern {
	static async load() {
		if (Sunniesnow.game.chart.events.some(e => e instanceof Sunniesnow.BigText)) {
			try {
				await Promise.all([
					Sunniesnow.Assets.loadFont(
						'https://fastly.jsdelivr.net/gh/kaio/wangfonts/TrueType/wt071.ttf',
						'HanWangShinSuMedium'
					),
					Sunniesnow.Assets.loadFont(
						'https://fastly.jsdelivr.net/gh/Kinutafontfactory/Yuji/fonts/ttf/YujiBoku-Regular.ttf',
						'YujiBoku'
					)
				]);
			} catch (e) {
				Sunniesnow.Logs.warn(`Failed to load font for big texts: ${e.message ?? e}`, e);
			}
		}
		this.fontSize = Sunniesnow.Config.RADIUS * 10 * Sunniesnow.Config.SCALE;
		this.maxWidth = Sunniesnow.Config.MIN_WIDTH * 0.9 * Sunniesnow.Config.SCALE;
	}

	populate() {
		super.populate();
		const style = new PIXI.TextStyle({
			fontFamily: 'HanWangShinSuMedium,YujiBoku,Noto Sans Math,Noto Sans CJK TC',
			fontSize: this.constructor.fontSize,
			fill: 0xffffff,
			align: 'center',
			padding: this.constructor.fontSize / 2
		});
		const textMetrics = PIXI.TextMetrics.measureText(this.event.text, style);
		if (textMetrics.width > this.constructor.maxWidth) {
			style.fontSize *= this.constructor.maxWidth / textMetrics.width;
		}
		this.text = new PIXI.Text(this.event.text, style);
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
		if (this.aborted) {
			return;
		}
		this.text.alpha = 1 - progress;
	}
};
