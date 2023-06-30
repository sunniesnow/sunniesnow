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
		switch (Sunniesnow.game.level.lastJudgement) {
			case 'perfect':
			case 'good':
				let text
				if (Sunniesnow.game.settings.autoplay) {
					text = 'Autoplay';
				} else {
					text = Sunniesnow.Utils.upcaseFirst(Sunniesnow.game.level.lastJudgement);
				}
				this.lastJudgement.text = text;
				this.text.visible = true;
				this.lastJudgement.visible = true;
				break;
			default:
				this.text.visible = false;
				this.lastJudgement.visible = false;
				return;
		}
		switch (Sunniesnow.game.level.apFcIndicator) {
			case 'ap':
				this.lastJudgement.style.fill = 'yellow';
				this.lastJudgement.text = `⟐ ${this.lastJudgement.text} ⟐`;
				break;
			case 'fc':
				this.lastJudgement.style.fill = 'white';
				this.lastJudgement.text = `⟐ ${this.lastJudgement.text} ⟐`;
				break;
			default:
				this.lastJudgement.style.fill = 'white';
				break;
		}
	}

};
