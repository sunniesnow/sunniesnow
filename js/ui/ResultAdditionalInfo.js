Sunniesnow.ResultAdditionalInfo = class ResultAdditionalInfo extends Sunniesnow.Button {

	static async load() {
		this.fontSize = Sunniesnow.game.settings.height / 20;
	}

	constructor() {
		super(() => this.trigger(), 50);
		this.hitRect = new PIXI.Rectangle(0, 0, Sunniesnow.game.settings.width, Sunniesnow.game.settings.height);
	}

	populate() {
		this.createText();
		this.createRightText();
	}

	createText() {
		this.text = new PIXI.Text(this.getTextContents(), {
			fontFamily: 'Arial',
			fontSize: this.constructor.fontSize,
			fill: '#ff00ff'
		});
		this.text.visible = false;
		this.addChild(this.text);
	}

	createRightText() {
		this.rightText = new PIXI.Text(this.getRightTextContents(), {
			fontFamily: 'Arial',
			fontSize: this.constructor.fontSize,
			fill: '#ff00ff'
		});
		this.rightText.anchor = new PIXI.ObservablePoint(null, null, 1, 1);
		this.rightText.x = Sunniesnow.game.settings.width;
		this.rightText.y = Sunniesnow.game.settings.height;
		this.rightText.visible = false;
		this.addChild(this.rightText);
	}

	trigger() {
		this.text.visible = !this.text.visible;
		this.rightText.visible = !this.rightText.visible;
	}

	hitRegion() {
		return this.hitRect;
	}

	getTextContents() {
		return `Judgement time windows: ${Sunniesnow.game.settings.judgementWindows}
Note hit size: ${Sunniesnow.game.settings.noteHitSize}
Offset: ${Sunniesnow.game.settings.offset}
Drag notes cannot be hit early: ${Sunniesnow.game.settings.noEarlyDrag}
Flick notes are direction-insensitive: ${Sunniesnow.game.settings.directionInsensitiveFlick}
Hold notes lock the position of touch: ${Sunniesnow.game.settings.lockingHold}
Autoplay: ${Sunniesnow.game.settings.autoplay}
Speed (of music): ${Sunniesnow.game.settings.gameSpeed}
Horizontal flip: ${Sunniesnow.game.settings.horizontalFlip}
Vertical flip: ${Sunniesnow.game.settings.verticalFlip}
Start: ${Sunniesnow.game.settings.start}
End: ${Sunniesnow.game.settings.end}`
	}

	getRightTextContents() {
		return `Early: ${Sunniesnow.game.level.early}
Late: ${Sunniesnow.game.level.late}`
	}
};
