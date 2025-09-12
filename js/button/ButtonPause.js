Sunniesnow.ButtonPause = class ButtonPause extends Sunniesnow.ButtonPauseBase {
	static async load() {
		this.geometry = this.createGeometry();
	}

	static createGeometry() {
		const radius = Sunniesnow.Config.WIDTH / 45;
		const graphics = new PIXI.GraphicsContext();
		graphics.rect(-radius/2, -radius/2, radius/3, radius);
		graphics.fill('white');
		graphics.rect(radius/6, -radius/2, radius/3, radius);
		graphics.fill('white');
		graphics.roundRect(-radius, -radius, radius*2, radius*2, radius/4);
		graphics.fill({color: 'white', alpha: 0.1});
		graphics.stroke({width: radius / 36, color: 'white'});
		return graphics;
	}

	populate() {
		super.populate();
		this.label = 'button-pause';
		this.graphics = new PIXI.Graphics(this.constructor.geometry);
		this.graphics.x = Sunniesnow.Config.WIDTH / 30;
		this.graphics.y = Sunniesnow.Config.WIDTH / 30;
		this.graphics.label = 'graphics';
		this.addChild(this.graphics);
	}

};
