Sunniesnow.UiBigText = class UiBigText extends Sunniesnow.UiBgPattern {
	static async load() {
		if (!Sunniesnow.game.settings.hideBgPattern && Sunniesnow.game.chart.events.some(e => e instanceof Sunniesnow.BigText)) {
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
		this.fontSize = Sunniesnow.Config.NOTE_RADIUS * 10 * Sunniesnow.game.settings.qualityBigText;
		this.maxWidth = Sunniesnow.game.settings.playfieldWidth * Sunniesnow.Config.SCALE * Sunniesnow.game.settings.qualityBigText;
		this.style = new PIXI.TextStyle({
			fontFamily: 'HanWangShinSuMedium,YujiBoku,Noto Sans Math,Noto Sans CJK TC',
			fontSize: this.fontSize,
			fill: 0xffffff,
			align: 'center',
			padding: this.fontSize / 2 // https://github.com/pixijs/pixijs/issues/9663
		});
		this.widthCache = new Map();
		this.textBaseAlpha = 0.8;
	}

	populate() {
		super.populate();
		this.textWrapper = new PIXI.Container();
		this.textWrapper.label = 'text-wrapper';
		this.addChild(this.textWrapper);
		this.label = `big-text-${this.event.id}`;
		this.texts = new Map();
	}

	prepareText(text) {
		if (this.texts.has(text)) {
			return this.texts.get(text);
		}
		const result = new PIXI.Text({text, style: this.constructor.style.clone()});
		if (!this.constructor.widthCache.has(text)) {
			this.constructor.widthCache.set(text, PIXI.CanvasTextMetrics.measureText(text, this.constructor.style).width);
		}
		result.style.fontSize = this.constructor.fontSize * Math.min(
			1,
			this.constructor.maxWidth / this.constructor.widthCache.get(text)
		);
		// https://github.com/pixijs/pixijs/discussions/11666
		// TODO: It may seem that the prepare system is intended to boost performance in this case,
		// but it is actually useless because the expensive operation is still done synchronously for the whole texture.
		// Currently this performance problem is solved by allowing user to reduce quality of big texts (quality-big-text).
		//Sunniesnow.game.app.renderer.prepare?.upload(result);
		this.texts.set(text, result);
		result.anchor.set(0.5, 0.5);
		result.scale.set(1 / Sunniesnow.game.settings.qualityBigText);
		result.label = 'text';
		return result;
	}

	update(relativeTime) {
		this.event.timeDependentBetweenRelative(
			'text', relativeTime, relativeTime + Sunniesnow.Config.UI_PREPARATION_TIME
		).forEach((text, i) => {
			text = this.prepareText(text);
			if (this.text === text || i > 0) {
				return;
			}
			this.text?.removeFromParent();
			this.textWrapper.addChild(text);
			this.text = text;
		});
		super.update(relativeTime);
	}

	updateFadingIn(progress, relativeTime) {
		super.updateFadingIn(progress, relativeTime);
		this.textWrapper.alpha = progress * this.constructor.textBaseAlpha;
		this.textWrapper.scale.set(progress);
	}

	updateHolding(progress, relativeTime) {
		super.updateHolding(progress, relativeTime);
		this.textWrapper.alpha = this.constructor.textBaseAlpha;
		this.textWrapper.scale.set(1);
	}

	updateFadingOut(progress, relativeTime) {
		super.updateFadingOut(progress, relativeTime);
		if (this.aborted) {
			return;
		}
		this.textWrapper.alpha = (1 - progress) * this.constructor.textBaseAlpha;
	}

	shouldFlipWithChart() {
		return false;
	}
};
