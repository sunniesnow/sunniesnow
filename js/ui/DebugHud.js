Sunniesnow.DebugHud = class DebugHud extends Sunniesnow.UiComponent {

	populate() {
		super.populate();
		this.populateText();
	}

	populateText() {
		this.text = new PIXI.Text('', {
			fontSize: Sunniesnow.Config.WIDTH / 60,
			fill: '#ff00ff',
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
		});
		this.text.alpha = 0.7;
		this.text.anchor = new PIXI.ObservablePoint(null, null, 0, 1);
		this.text.y = Sunniesnow.Config.HEIGHT;
		this.addChild(this.text);
	}

	update(delta, data) {
		super.update(delta);
		if (Sunniesnow.game.settings.hideDebugExceptPause) {
			this.visible = Sunniesnow.Music.pausing;
		}
		this.text.text = Sunniesnow.Utils.stringify(data);
	}

};
