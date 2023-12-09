Sunniesnow.TopCenterHud = class TopCenterHud extends Sunniesnow.UiComponent {

	constructor() {
		super();
		this.lastData = '';
		this.animationTime = 0;
	}

	populate() {
		super.populate();
		this.x = Sunniesnow.game.settings.width / 2;
		this.y = Sunniesnow.game.settings.width / 18;
		this.populateText();
		this.populateLastJudgement();
	}

	populateText() {
		this.text = new PIXI.Text('', {
			fontSize: Sunniesnow.game.settings.width / 30,
			fill: 'white',
			fontFamily: 'Arial',
			align: 'center'
		});
		this.text.anchor = new PIXI.ObservablePoint(null, null, 0.5, 1);
		this.addChild(this.text);
	}

	populateLastJudgement() {
		this.lastJudgement = new PIXI.Text('', {
			fontSize: Sunniesnow.game.settings.width / 45,
			fill: 'yellow',
			fontFamily: 'Arial',
			align: 'center'
		});
		this.lastJudgement.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0);
		this.addChild(this.lastJudgement);
	}

	update(delta, data) {
		super.update(delta);
		if (this.lastData !== data) {
			this.lastData = data;
			this.animationTime = 0;
			this.text.text = data;
			this.updateLastJudgement();
		}
		this.scale.x = 1 + 0.6*Math.exp(-0.6*this.animationTime);
		this.scale.y = 1 + 0.5*Math.exp(-0.5*this.animationTime);
		this.animationTime += delta;
	}

	updateLastJudgement() {
		let hidden = !Sunniesnow.game.level.lastJudgement;
		hidden ||= Sunniesnow.game.level.lastJudgement === "miss";
		hidden ||= !Sunniesnow.game.settings.lyrica5 && Sunniesnow.game.level.lastJudgement === "bad";
		if (hidden) {
			this.text.visible = false;
			this.lastJudgement.visible = false;
			return;
		}
		let text
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
					this.lastJudgement.style.fill = [0xf3eba2, 0xd2fbfa];
					this.lastJudgement.style.fillGradientStops = [0, 1];
				} else {
					this.lastJudgement.style.fill = 'yellow';
				}
				this.lastJudgement.text = `⟐ ${this.lastJudgement.text} ⟐`;
				break;
			case 'fc':
				if (Sunniesnow.game.settings.lyrica5) {
					this.lastJudgement.style.fill = [0xf9dc52, 0xfbf88a];
					this.lastJudgement.style.fillGradientStops = [0, 1];
				} else {
					this.lastJudgement.style.fill = 'white';
				}
				this.lastJudgement.text = `⟐ ${this.lastJudgement.text} ⟐`;
				break;
			case 'fcs': // only in Lyrica 5
				this.lastJudgement.style.fill = [0xb4d7d9, 0xf4fbfc];
				this.lastJudgement.style.fillGradientStops = [0, 1];
				this.lastJudgement.text = `· ${this.lastJudgement.text} ·`;
				break;
			default:
				this.lastJudgement.style.fill = Sunniesnow.game.settings.lyrica5 ? 0xa0c9cf : 'white';
				break;
		}
	}

};
