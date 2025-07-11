Sunniesnow.ButtonResultRetry = class ButtonResultRetry extends Sunniesnow.Button {
	static async load() {
		this.geometry = this.createGeometry();
		this.text = 'Retry';
	}

	static createGeometry() {
		this.radius = Sunniesnow.Config.WIDTH / 8;
		const path = [
			-this.radius, 0,
			0, -this.radius,
			this.radius, 0
		]
		const graphics = new PIXI.GraphicsContext();
		graphics.poly(path);
		graphics.stroke({width: this.radius / 15, color: 0xfbfbff, alignment: 0});
		graphics.fill(0xebfbff);
		graphics.poly(path);
		graphics.stroke({width: this.radius / 100, color: 0xaaaaaa, alignment: 1});
		return graphics;
	}

	populate() {
		super.populate();
		this.background = new PIXI.Graphics(this.constructor.geometry);
		this.text = new PIXI.Text({text: this.constructor.text, style: {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: this.constructor.radius / 4,
			fill: '#43586e',
			align: 'center'
		}});
		this.text.anchor.set(0.5, 0.5);
		this.text.y = -this.constructor.radius / 2.5;
		this.addChild(this.background);
		this.addChild(this.text);
		this.x = Sunniesnow.Config.WIDTH * 1/13;
		this.y = Sunniesnow.Config.HEIGHT * (1 + 1/40);
	}
};
