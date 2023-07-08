Sunniesnow.ButtonResume = class ButtonResume extends Sunniesnow.Button {
	static async load() {
		this.geometry = this.createGeometry();
		this.text = 'Resume';
	}

	static createGeometry() {
		const unit = Sunniesnow.game.settings.width / 10;
		const graphics = new PIXI.Graphics();
		graphics.lineStyle(unit / 15, 0xfafaff, 1, 1);
		graphics.beginFill(0xebfbff, 1);
		Sunniesnow.Utils.drawRegularPolygon(graphics, 0, 0, unit, 4, 0);
		graphics.endFill();
		graphics.lineStyle(unit / 100, 0xaaaaaa, 1, 0);
		Sunniesnow.Utils.drawRegularPolygon(graphics, 0, 0, unit, 4, 0);
		return graphics.geometry;
	}

	populate() {
		super.populate();
		this.background = new PIXI.Graphics(this.constructor.geometry);
		this.text = new PIXI.Text(this.constructor.text, {
			fontFamily: 'Arial',
			fontSize: Sunniesnow.game.settings.width / 30,
			fill: '#43586e',
			align: 'center'
		});
		this.text.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0.5);
		this.addChild(this.background);
		this.addChild(this.text);
		this.x = Sunniesnow.game.settings.width / 4;
		this.y = Sunniesnow.game.settings.height / 2;
	}

};
