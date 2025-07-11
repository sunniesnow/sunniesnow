Sunniesnow.TopLeftHud = class TopLeftHud extends Sunniesnow.UiComponent {

	static EFFECT_EVENT_CLASS = 'EffectTopLeftHud';
	static DEFAULT_X = 0;
	static DEFAULT_Y = 0;

	static async load() {
		this.backgroundGeometry = this.createBackgroundGeometry();
		this.textMaxWidth = Sunniesnow.Config.WIDTH / 60 * 13;
	}

	static createBackgroundGeometry() {
		const unit = Sunniesnow.Config.WIDTH / 60;
		const path1 = [
			20 * unit, 2 * unit,
			19 * unit, 3 * unit,
			18 * unit, 2 * unit,
			20 * unit, 0,
			22 * unit, 2 * unit,
			20 * unit, 4 * unit,
			0, 4 * unit,
			0, 0,
			20 * unit, 0
		]
		const path2 = [
			0, 0,
			20 * unit, 0,
			22 * unit, 2 * unit,
			20 * unit, 4 * unit,
			0, 4 * unit
		]
		const graphics = new PIXI.GraphicsContext();
		graphics.poly(path2);
		graphics.fill({color: 'black', alpha: 0.5});
		graphics.poly(path1, false);
		graphics.stroke({width: unit / 6, color: 'white', alignment: 1});
		return graphics;
	}

	populate() {
		super.populate();
		this.populateBackground();
		this.populateText();
	}

	populateBackground() {
		this.background = new PIXI.Graphics(this.constructor.backgroundGeometry);
		this.addChild(this.background);
	}

	populateText() {
		this.text = new PIXI.Text({text: '', style: {
			fontSize: Sunniesnow.Config.WIDTH / 45,
			fill: 'white',
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC'
		}});
		this.text.x = Sunniesnow.Config.WIDTH / 15;
		this.text.y = Sunniesnow.Config.WIDTH / 30;
		this.text.anchor.set(0, 0.5);
		this.addChild(this.text);
	}

	privateUpdate(delta, data) {
		super.privateUpdate(delta, data);
		this.text.text = data;
		const rescale = Math.min(1 / this.text.scale.x, this.constructor.textMaxWidth / this.text.width);
		this.text.scale.set(this.text.scale.x * rescale);
	}
};
