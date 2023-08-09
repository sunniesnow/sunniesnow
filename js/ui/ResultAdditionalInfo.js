Sunniesnow.ResultAdditionalInfo = class ResultAdditionalInfo extends Sunniesnow.Button {

	static async load() {
		this.fontSize = Sunniesnow.game.settings.height / 20;
	}

	constructor() {
		super(() => this.trigger(), 50);
		this.hitRect = new PIXI.Rectangle(0, 0, Sunniesnow.game.settings.width, Sunniesnow.game.settings.height);
	}

	populate() {
		this.text = new PIXI.Text(this.getTextContents(), {
			fontFamily: 'Arial',
			fontSize: this.constructor.fontSize,
			fill: '#ff00ff'
		});
		this.text.visible = false;
		this.addChild(this.text);
	}

	trigger() {
		this.text.visible = !this.text.visible;
	}

	hitRegion() {
		return this.hitRect;
	}

	getTextContents() {
		return `Judgement time windows: ${Sunniesnow.game.settings.judgementWindows}
Note hit size: ${Sunniesnow.game.settings.noteHitSize}
Offset: ${Sunniesnow.game.settings.offset}
Autoplay: ${Sunniesnow.game.settings.autoplay}
Speed (of music): ${Sunniesnow.game.settings.gameSpeed}
Horizontal flip: ${Sunniesnow.game.settings.horizontalFlip}
Vertical flip: ${Sunniesnow.game.settings.verticalFlip}
Start: ${Sunniesnow.game.settings.start}
End: ${Sunniesnow.game.settings.end}`
	}
};
