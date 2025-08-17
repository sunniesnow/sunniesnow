Sunniesnow.UiBgNote = class UiBgNote extends Sunniesnow.UiNoteBase {

	static async load() {
		this.radius = Sunniesnow.Config.NOTE_RADIUS;
		this.geometry = this.createGeometry();
		this.textStyle = this.createTextStyle();
	}

	static createGeometry() {
		const graphics = new PIXI.GraphicsContext();
		graphics.regularPoly(0, 0, this.radius, 6);
		graphics.fill({color: 0x000000, alpha: 0.7});
		return graphics;
	}

	static fadingOutDuration(event) {
		return 1/4;
	}

	populate() {
		super.populate();
		this.note = new PIXI.Container();
		this.noteBody = new PIXI.Graphics(this.constructor.geometry);
		this.text = Sunniesnow.UiTap.prototype.createText.call(this);
		this.note.addChild(this.noteBody);
		this.note.addChild(this.text);
		this.addChild(this.note);
	}

	update(relativeTime) {
		this.updateText(relativeTime);
		super.update(relativeTime);
	}

	updateFadingIn(progress, relativeTime) {
		super.updateFadingIn(progress, relativeTime);
		this.note.alpha = progress;
		this.note.scale.set(progress);
	}

	updateActive(progress, relativeTime) {
		super.updateActive(progress, relativeTime);
		this.note.alpha = 1;
		this.note.scale.set(1);
	}

	updateFadingOut(progress, relativeTime) {
		super.updateFadingOut(progress, relativeTime);
		this.fadingAlpha = Sunniesnow.Config.fadingAlpha();
		this.note.scale.set(1 + (3 * (progress - 1/3) ** 2 - 1/3) * 0.5);
		this.note.alpha = 1 - progress;
	}

};

// I do not want to write a separate JS file for this mixin
// because I do not want the Sunniesnow code base to be too coupled with the default skin.
// It is put in this file because UiBgNote is the last loaded UiNoteBase subclass.
const UiNoteMixin = new Sunniesnow.Mixin({
	widthCache: new Map(),

	// Call this method in the load() method of only one of the UiNoteBase subclasses.
	async loadFontIfNeeded() {
		if (!Sunniesnow.game.chart.events.some(e => e instanceof Sunniesnow.NoteBase && e.hasText())) {
			return;
		}
		try {
			await Sunniesnow.Assets.loadFont(
				//'https://fastly.jsdelivr.net/gh/kaio/wangfonts/TrueType/wt024.ttf',
				//'HanWangFangSongMedium-Regular'

				//'https://fastly.jsdelivr.net/gh/l10n-tw/cwtex-q-fonts-TTFs@v0.42/ttf/cwTeXQFangsong-Medium.ttf',
				//'cwTeXQFangsong-Medium'

				//'https://fastly.jsdelivr.net/gh/Kinutafontfactory/Yuji/fonts/ttf/YujiSyuku-Regular.ttf',
				//'YujiSyuku-Regular'

				'https://fastly.jsdelivr.net/gh/lxgw/LxgwWenKai/fonts/TTF/LXGWWenKai-Regular.ttf',
				'LXGW WenKai'

				//'https://fastly.jsdelivr.net/gh/chengda/popular-fonts/华文仿宋.ttf',
				//'HuaWenFangSong'
			);
		} catch (e) {
			Sunniesnow.Logs.warn(`Failed to load font for note texts: ${e.message ?? e}`, e);
		}
	},

	createCircleGeometry(color) {
		const graphics = new PIXI.GraphicsContext();
		graphics.circle(0, 0, this.circleRadius);
		graphics.stroke({width: this.radius / 4, color, alignment: 1});
		return graphics;
	},

	createNoteBodyGeometry(fillColor, lineColor) {
		const graphics = new PIXI.GraphicsContext();
		graphics.circle(0, 0, this.radius);
		graphics.fill(fillColor);
		graphics.stroke({width: this.radius / 8, color: lineColor, alignment: 1});
		return graphics;
	},

	createTextStyle(fontSize, fontFamily) {
		return new PIXI.TextStyle({
			fontSize: fontSize ?? this.radius,
			fontFamily: fontFamily ?? 'LXGW WenKai,Noto Sans Math',
			fill: 'white',
			align: 'center',
		});
	}
}, {
	createText() {
		const text = new PIXI.Text({text: this.event.text, style: this.constructor.textStyle.clone()});
		text.anchor.set(0.5, 0.5);
		return text;
	},

	updateText(relativeTime) {
		this.text.text = this.event.timeDependentAtRelative('text', relativeTime);
		this.adjustTextSize();
	},

	adjustTextSize(maxWidth) {
		maxWidth ??= this.constructor.radius * 1.5;
		if (!this.constructor.widthCache.has(this.text.text)) {
			this.constructor.widthCache.set(
				this.text.text,
				PIXI.CanvasTextMetrics.measureText(this.text.text, this.constructor.textStyle).width
			);
		}
		this.text.style.fontSize = this.constructor.textStyle.fontSize * Math.min(
			1,
			maxWidth / this.constructor.widthCache.get(this.text.text)
		);
	},

	updateTextFadingOut(progress) {
		if (this.levelNote.judgement === 'miss' || this.levelNote.judgement === 'bad') {
			this.text.scale.set(1 - progress);
			return;
		}
		this.text.tint = 0xffff55;
		if (progress < 1/4) {
			this.text.scale.x = 1 + progress*4;
		} else if (progress < 1/2) {
			this.text.scale.x = 2 - (progress-1/4)*2;
		} else {
			this.text.scale.x = 1.5 + (progress-1/2)*3;
		}
		if (progress < 0.5) {
			this.text.scale.y = 1 + progress*2;
		} else if (progress < 0.6) {
			this.text.scale.y = 2 - (progress-0.5)*5;
		} else {
			this.text.scale.y = 1.5 + (progress-0.6)/0.4*1.5;
		}
		if (progress >= 1/2) {
			this.text.alpha = 1 - (progress-1/2)*2;
		} else {
			this.text.alpha = 1;
		}
	}

});
Sunniesnow.Mixin.prepend('UiTap', UiNoteMixin);
Sunniesnow.Mixin.prepend('UiFlick', UiNoteMixin);
Sunniesnow.Mixin.prepend('UiHold', UiNoteMixin);
Sunniesnow.Mixin.prepend('UiBgNote', UiNoteMixin);
