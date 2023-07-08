Sunniesnow.ProgressBar = class ProgressBar extends Sunniesnow.UiComponent {

	static async load() {
		this.barHeight = Sunniesnow.game.settings.width / 200;
		this.backgroundGeometry = this.createBackgroundGeometry();
		this.barGeometry = this.createBarGeometry();
	}

	static createBackgroundGeometry() {
		const graphics = new PIXI.Graphics();
		graphics.beginFill(0xffffff, 0.5);
		graphics.drawRect(0, 0, Sunniesnow.game.settings.width, this.barHeight);
		graphics.endFill();
		return graphics.geometry;
	}

	static createBarGeometry() {
		const graphics = new PIXI.Graphics();
		graphics.beginFill(0xc3efec);
		graphics.drawRect(0, 0, Sunniesnow.game.settings.width, this.barHeight);
		graphics.endFill();
		return graphics.geometry;
	}

	populate() {
		super.populate();
		this.y = Sunniesnow.game.settings.height - this.constructor.barHeight;
		this.populateBackground();
		this.populateBar();
	}

	populateBackground() {
		this.background = new PIXI.Graphics(this.constructor.backgroundGeometry);
		this.addChild(this.background);
	}

	populateBar() {
		this.bar = new PIXI.Graphics(this.constructor.barGeometry);
		this.bar.x = -Sunniesnow.game.settings.width;
		this.addChild(this.bar);
	}

	update(delta, data) {
		super.update(delta, data);
		this.bar.x = Sunniesnow.game.settings.width * (data-1);
	}
};
