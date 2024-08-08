Sunniesnow.ProgressBar = class ProgressBar extends Sunniesnow.UiComponent {

	static async load() {
		this.barHeight = Sunniesnow.Config.WIDTH / 200;
		this.backgroundGeometry = this.createBackgroundGeometry();
		this.barGeometry = this.createBarGeometry();
	}

	static createBackgroundGeometry() {
		const graphics = new PIXI.Graphics();
		graphics.beginFill(0xffffff, 0.5);
		graphics.drawRect(0, 0, Sunniesnow.Config.WIDTH, this.barHeight);
		graphics.endFill();
		return graphics.geometry;
	}

	static createBarGeometry() {
		const graphics = new PIXI.Graphics();
		graphics.beginFill(0xc3efec);
		graphics.drawRect(0, 0, Sunniesnow.Config.WIDTH, this.barHeight);
		graphics.endFill();
		return graphics.geometry;
	}

	populate() {
		super.populate();
		this.y = Sunniesnow.Config.HEIGHT - this.constructor.barHeight;
		this.populateBackground();
		this.populateBar();
	}

	populateBackground() {
		this.background = new PIXI.Graphics(this.constructor.backgroundGeometry);
		this.addChild(this.background);
	}

	populateBar() {
		this.bar = new PIXI.Graphics(this.constructor.barGeometry);
		this.bar.x = -Sunniesnow.Config.WIDTH;
		this.addChild(this.bar);
	}

	update(delta) {
		super.update(delta);
		this.bar.x = Sunniesnow.Config.WIDTH * Sunniesnow.Utils.clamp(Sunniesnow.Music.progress-1, -1, 0);
	}
};
