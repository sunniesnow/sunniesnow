Sunniesnow.DebugHud = class DebugHud extends Sunniesnow.UiComponent {

	populate() {
		super.populate();
		this.y = Sunniesnow.game.settings.height;
		this.populateText();
	}

	populateText() {
		this.text = new PIXI.Text('', {
			fontSize: Sunniesnow.game.settings.width / 60,
			fill: 'white',
			fontFamily: 'Arial',
		});
		this.text.anchor = new PIXI.ObservablePoint(null, null, 0, 1);
		this.addChild(this.text);
	}

	update(delta, data) {
		super.update(delta);
		this.text.text = Sunniesnow.Utils.stringify(data);
	}
};
