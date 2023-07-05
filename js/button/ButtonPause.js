Sunniesnow.ButtonPause = class ButtonPause extends Sunniesnow.Button {
	static initialize() {
		this.geometry = this.createGeometry();
	}

	static createGeometry() {
		const radius = Sunniesnow.game.settings.width / 45;
		const graphics = new PIXI.Graphics();
		graphics.beginFill('white');
		graphics.drawRect(-radius/2, -radius/2, radius/3, radius);
		graphics.drawRect(radius/6, -radius/2, radius/3, radius);
		graphics.endFill();
		graphics.lineStyle(radius / 36, 'white');
		graphics.beginFill('white', 0.1);
		graphics.drawRoundedRect(-radius, -radius, radius*2, radius*2, radius/4);
		graphics.endFill();
		return graphics.geometry;
	}

	populate() {
		this.graphics = new PIXI.Graphics(this.constructor.geometry);
		this.graphics.x = Sunniesnow.game.settings.width / 30;
		this.graphics.y = Sunniesnow.game.settings.width / 30;
		this.addChild(this.graphics);
	}

};
