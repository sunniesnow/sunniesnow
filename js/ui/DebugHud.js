Sunniesnow.DebugHud = class DebugHud extends PIXI.Container {

	constructor() {
		super();
		this.populate();
	}

	populate() {
		this.label = 'debug-hud';
		this.text = new PIXI.Text({text: '', style: {
			fontSize: Sunniesnow.Config.WIDTH / 60,
			fill: '#ff00ff',
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
		}});
		this.text.alpha = 0.7;
		this.text.anchor.set(0, 1);
		this.text.label = 'text';
		this.addChild(this.text);
		this.y = Sunniesnow.Config.HEIGHT;
	}

	update(delta, data) {
		if (Sunniesnow.game.settings.hideDebugExceptPause) {
			this.visible = Sunniesnow.Music.pausing;
		}
		this.text.text = Sunniesnow.Utils.stringify(data);
	}

};
