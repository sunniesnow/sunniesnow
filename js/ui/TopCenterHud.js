Sunniesnow.TopCenterHud = class TopCenterHud extends Sunniesnow.UiComponent {

	static EFFECT_EVENT_CLASS = 'EffectTopCenterHud';
	static DEFAULT_X = 0.5;
	static DEFAULT_Y = 0;

	static async load() {
		await Promise.all([
			Sunniesnow.Assets.loadFont(
				'https://fastly.jsdelivr.net/gh/notofonts/math@gh-pages/fonts/NotoSansMath/full/ttf/NotoSansMath-Regular.ttf',
				'Noto Sans Math'
			),
			// Firefox does not support ttc format
			/*Sunniesnow.Assets.loadFont(
				'https://fastly.jsdelivr.net/gh/notofonts/noto-cjk/Sans/OTC/NotoSansCJK-Regular.ttc',
				'Noto Sans CJK TC'
			)*/
			Sunniesnow.Assets.loadFont(
				'https://fastly.jsdelivr.net/gh/notofonts/noto-cjk/Sans/OTF/TraditionalChinese/NotoSansCJKtc-Regular.otf',
				'Noto Sans CJK TC'
			)
		]);
	}

	constructor() {
		super();
		this.lastData = '';
		this.animationTime = 0;
	}

	populate() {
		super.populate();
		this.wrapper = new PIXI.Container();
		this.wrapper.y = Sunniesnow.Config.WIDTH / 18;
		this.addChild(this.wrapper);
		this.populateText();
		this.populateLastJudgement();
	}

	populateText() {
		this.text = new PIXI.Text({text: '', style: {
			fontSize: Sunniesnow.Config.WIDTH / 30,
			fill: 'white',
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			align: 'center'
		}});
		this.text.anchor.set(0.5, 1);
		this.wrapper.addChild(this.text);
	}

	populateLastJudgement() {
		this.lastJudgement = new PIXI.Text({text: '', style: {
			fontSize: Sunniesnow.Config.WIDTH / 45,
			fill: 'yellow',
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			align: 'center'
		}});
		this.earlyLate = new PIXI.Text({text: '', style: {
			fontSize: Sunniesnow.Config.WIDTH / 45,
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC'
		}});
		this.lastJudgement.anchor.set(0.5, 0);
		this.wrapper.addChild(this.lastJudgement);
		this.wrapper.addChild(this.earlyLate);
	}

	privateUpdate(delta, data) {
		super.privateUpdate(delta, data);
		if (this.lastData !== data) {
			this.lastData = data;
			this.animationTime = 0;
			this.text.text = data;
			this.updateLastJudgement();
		}
		this.wrapper.scale.x = 1 + 0.6*Math.exp(-0.6*this.animationTime);
		this.wrapper.scale.y = 1 + 0.5*Math.exp(-0.5*this.animationTime);
		this.animationTime += delta;
	}

	updateLastJudgement() {
		if (Sunniesnow.game.level.combo === 0) {
			this.text.visible = false;
			this.lastJudgement.visible = false;
			this.earlyLate.visible = false;
			return;
		}
		let text;
		if (Sunniesnow.game.settings.autoplay) {
			text = 'Autoplay';
		} else {
			text = Sunniesnow.Utils.judgementText(Sunniesnow.game.level.lastJudgement);
		}
		this.lastJudgement.text = text;
		this.text.visible = true;
		this.lastJudgement.visible = true;
		switch (Sunniesnow.game.level.apFcIndicator) {
			case 'ap':
				if (Sunniesnow.game.settings.lyrica5) {
					this.lastJudgement.style.fill = new PIXI.FillGradient({
						type: 'linear',
						start: {x: 0, y: 0},
						end: {x: 0, y: 1},
						colorStops: [
							{offset: 0, color: 0xf3eba2},
							{offset: 1, color: 0xd2fbfa}
						]
					});
				} else {
					this.lastJudgement.style.fill = 'yellow';
				}
				this.lastJudgement.text = `⟐ ${this.lastJudgement.text} ⟐`;
				break;
			case 'fc':
				if (Sunniesnow.game.settings.lyrica5) {
					this.lastJudgement.style.fill = new PIXI.FillGradient({
						type: 'linear',
						start: {x: 0, y: 0},
						end: {x: 0, y: 1},
						colorStops: [
							{offset: 0, color: 0xf9dc52},
							{offset: 0, color: 0xfbf88a}
						]
					});
				} else {
					this.lastJudgement.style.fill = 'white';
				}
				this.lastJudgement.text = `⟐ ${this.lastJudgement.text} ⟐`;
				break;
			case 'fcs': // only in Lyrica 5
				this.lastJudgement.style.fill = new PIXI.FillGradient({
					type: 'linear',
					start: {x: 0, y: 0},
					end: {x: 0, y: 1},
					colorStops: [
						{offset: 0, color: 0xb4d7d9},
						{offset: 0, color: 0xf4fbfc}
					]
				});
				this.lastJudgement.text = `· ${this.lastJudgement.text} ·`;
				break;
			default:
				this.lastJudgement.style.fill = Sunniesnow.game.settings.lyrica5 ? 0xa0c9cf : 'white';
		}
		const earlyLate = Sunniesnow.game.level.lastJudgedNote.earlyLate;
		if (earlyLate) {
			this.earlyLate.visible = true;
			this.earlyLate.text = earlyLate < 0 ? 'Early' : 'Late';
			this.earlyLate.style.fill = earlyLate < 0 ? 0x4887dc : 0xdc5449;
			this.earlyLate.x = this.lastJudgement.getLocalBounds().right + Sunniesnow.Config.WIDTH / 90;
		} else {
			this.earlyLate.visible = false;
		}
	}

};
