Sunniesnow.ButtonResume = class ButtonResume extends Sunniesnow.Button {
	static async load() {
		this.geometry = this.createGeometry();
		this.text = 'Resume';
	}

	static createGeometry() {
		this.radius = Sunniesnow.Config.WIDTH / 10;
		const graphics = new PIXI.GraphicsContext();
		graphics.regularPoly(0, 0, this.radius, 4, 0);
		graphics.fill(0xebfbff);
		graphics.stroke({width: this.radius / 15, color: 0xfbfbff, alignment: 0});
		graphics.regularPoly(0, 0, this.radius, 4, 0);
		graphics.stroke({width: this.radius / 100, color: 0xaaaaaa, alignment: 1});
		return graphics;
	}

	populate() {
		super.populate();
		this.label = 'button-resume';
		this.background = new PIXI.Graphics(this.constructor.geometry);
		this.background.label = 'background';
		this.text = new PIXI.Text({text: this.constructor.text, style: {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: this.constructor.radius / 3,
			fill: '#43586e',
			align: 'center'
		}});
		this.text.label = 'text';
		this.text.anchor.set(0.5, 0.5);
		this.addChild(this.background);
		this.addChild(this.text);
		this.x = Sunniesnow.Config.WIDTH / 4;
		this.y = Sunniesnow.Config.HEIGHT / 2;
	}

};
