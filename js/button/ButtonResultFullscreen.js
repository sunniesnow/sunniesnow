Sunniesnow.ButtonResultFullscreen = class ButtonResultFullscreen extends Sunniesnow.Button {
	static async load() {
		this.geometry = this.createGeometry();
		this.text = 'Fullscr';
	}

	static createGeometry() {
		this.radius = Sunniesnow.Config.WIDTH / 8;
		const path = [
			this.radius, 0,
			0, this.radius,
			-this.radius, 0
		]
		const graphics = new PIXI.Graphics();
		graphics.lineStyle(this.radius / 15, 0xfbfbff, 1, 1);
		graphics.beginFill(0xebfbff, 1);
		graphics.drawPolygon(path);
		graphics.endFill();
		graphics.lineStyle(this.radius / 100, 0xaaaaaa, 1, 0);
		graphics.drawPolygon(path);
		return graphics.geometry;
	}

	populate() {
		super.populate();
		this.background = new PIXI.Graphics(this.constructor.geometry);
		this.text = new PIXI.Text(this.constructor.text, {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: this.constructor.radius / 4,
			fill: '#43586e',
			align: 'center'
		});
		this.text.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0.5);
		this.text.y = this.constructor.radius / 2.5;
		this.addChild(this.background);
		this.addChild(this.text);
		this.x = Sunniesnow.Config.WIDTH * (1 - 1/13);
		this.y = Sunniesnow.Config.HEIGHT * -1/40;
	}
};
