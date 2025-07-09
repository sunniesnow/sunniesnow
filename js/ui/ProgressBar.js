Sunniesnow.ProgressBar = class ProgressBar extends Sunniesnow.UiComponent {

	static EFFECT_EVENT_CLASS = 'EffectProgressBar';
	static DEFAULT_X = 0.5;
	static DEFAULT_Y = 1;

	static async load() {
		this.barHeight = Sunniesnow.Config.WIDTH / 200;
		this.backgroundGeometry = this.createBackgroundGeometry();
		this.barGeometry = this.createBarGeometry();
	}

	static createBackgroundGeometry() {
		const graphics = new PIXI.Graphics();
		graphics.beginFill(0xffffff, 0.5);
		graphics.drawRect(-Sunniesnow.Config.WIDTH/2, -this.barHeight, Sunniesnow.Config.WIDTH, this.barHeight);
		graphics.endFill();
		return graphics.geometry;
	}

	static createBarGeometry() {
		const graphics = new PIXI.Graphics();
		graphics.beginFill(0xc3efec);
		graphics.drawRect(0, -this.barHeight, Sunniesnow.Config.WIDTH, this.barHeight);
		graphics.endFill();
		return graphics.geometry;
	}

	populate() {
		super.populate();
		this.populateBackground();
		this.populateBar();
	}

	populateBackground() {
		this.background = new PIXI.Graphics(this.constructor.backgroundGeometry);
		this.addChild(this.background);
	}

	populateBar() {
		this.bar = new PIXI.Graphics(this.constructor.barGeometry);
		this.bar.x = -Sunniesnow.Config.WIDTH / 2;
		this.addChild(this.bar);
	}

	privateUpdate(delta, data) {
		super.privateUpdate(delta, data);
		// data may be null in SceneResult.
		this.bar.scale.x = data ?? Sunniesnow.Music.progress;
	}
};
