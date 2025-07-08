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
		this.style = new PIXI.TextStyle({
			fontFamily: 'HanWangShinSuMedium,YujiBoku,Noto Sans Math,Noto Sans CJK TC',
			fontSize: this.fontSize,
			fill: 0xffffff,
			align: 'center',
			padding: this.fontSize / 2 // https://github.com/pixijs/pixijs/issues/9663
		});
		this.widthCache = new Map();
	}

	populate() {
		super.populate();
		this.text = new PIXI.Text(this.event.text, this.constructor.style.clone());
		this.text.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0.5);
		this.addChild(this.text);
		this.alpha = 0.8;
	}

	update(relativeTime) {
		this.text.text = this.event.timeDependentAtRelative('text', relativeTime);
		this.adjustTextSize();
		super.update(relativeTime);
	}

	adjustTextSize() {
		if (!this.constructor.widthCache.has(this.text.text)) {
			this.constructor.widthCache.set(
				this.text.text,
				PIXI.TextMetrics.measureText(this.text.text, this.constructor.style).width
			);
		}
		this.text.style.fontSize = this.constructor.fontSize * Math.min(
			1,
			this.constructor.maxWidth / this.constructor.widthCache.get(this.text.text)
		);
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

	updateScale(relativeTime) {
		this.scale.set(this.event.timeDependentAtRelative('size', relativeTime));
	}
};
