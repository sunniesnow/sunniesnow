Sunniesnow.DebugHud = class DebugHud extends Sunniesnow.UiComponent {

	populate() {
		super.populate();
		this.populateText();
	}

	populateText() {
		this.text = new PIXI.Text('', {
			fontSize: Sunniesnow.game.settings.width / 60,
			fill: '#ff00ff',
			fontFamily: 'NotoSansMath-Regular,NotoSansCJK-Regular',
		});
		this.text.alpha = 0.7;
		this.text.anchor = new PIXI.ObservablePoint(null, null, 0, 1);
		this.text.y = Sunniesnow.game.settings.height;
		this.addChild(this.text);
	}

	update(delta, data) {
		super.update(delta);
		this.text.text = Sunniesnow.Utils.stringify(data);
	}

};
