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
		const graphics = new PIXI.Graphics();
		graphics.beginFill('black', 0.5);
		graphics.drawPolygon(path2);
		graphics.endFill();
		graphics.lineStyle(unit / 6, 'white', 1, 0);
		for (let i = 0; i < path1.length; i += 2) {
			if (i === 0) {
				graphics.moveTo(path1[i], path1[i + 1]);
			} else {
				graphics.lineTo(path1[i], path1[i + 1]);
			}
		}
		graphics.finishPoly();
		return graphics.geometry;
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
		this.text = new PIXI.Text('', {
			fontSize: Sunniesnow.Config.WIDTH / 45,
			fill: 'white',
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC'
		});
		this.text.x = Sunniesnow.Config.WIDTH / 15;
		this.text.y = Sunniesnow.Config.WIDTH / 30;
		this.text.anchor = new PIXI.ObservablePoint(null, null, 0, 0.5);
		this.addChild(this.text);
	}

	privateUpdate(delta, data) {
		super.privateUpdate(delta, data);
		this.text.text = data;
		const rescale = Math.min(1 / this.text.scale.x, this.constructor.textMaxWidth / this.text.width);
		this.text.scale.set(this.text.scale.x * rescale);
	}
};
